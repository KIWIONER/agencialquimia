import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';

/**
 * ==============================================================================
 * Archivo: app/api/admin/tables/route.ts
 * ==============================================================================
 * Descripción:
 *  Endpoint API proxy para descubrir dinámicamente todas las tablas públicas expuestas
 *  en Supabase/PostgREST para AgenciAlquimia.
 * ==============================================================================
 */

export const dynamic = 'force-dynamic';

/** Lista completa de las 11 tablas oficiales del esquema público de Supabase */
const CANDIDATE_TABLES = [
  'leads_agencialquimia',
  'leads_hunter',
  'chat_messages',
  'chat_messages_alquimia',
  'chat_messages_cerebro',
  'conversaciones_alquimia',
  'n8n_chat_histories',
  'control_rutas',
  'ideas_agencia',
  'objetivos_agencia',
  'radar_queries',
];

export async function GET(request: NextRequest) {
  // Verificación de seguridad Defense-in-depth
  const token = request.cookies.get('admin_session')?.value;
  const { valid } = await verifyAdminToken(token ?? '');
  if (!valid) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({
      success: true,
      tables: CANDIDATE_TABLES,
      isFallback: true,
      message: 'Supabase no configurado en variables de entorno. Mostrando tablas por defecto.',
    });
  }

  const cleanUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

  try {
    // 1. Intentar primero con el endpoint OpenAPI
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const openApiRes = await fetch(`${cleanUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (openApiRes.ok) {
      const openApiSpec = await openApiRes.json();
      const paths = openApiSpec.paths ? Object.keys(openApiSpec.paths) : [];
      const tables = paths
        .map((p) => p.replace(/^\//, '').trim())
        .filter((p) => p.length > 0 && p !== 'rpc' && !p.includes('/'));

      if (tables.length > 0) {
        return NextResponse.json({
          success: true,
          tables: Array.from(new Set(tables)),
          isFallback: false,
        });
      }
    }

    // 2. Verificar disponibilidad mediante sondas paralelas de las 11 tablas
    const validTables: string[] = [];

    await Promise.all(
      CANDIDATE_TABLES.map(async (tableName) => {
        try {
          const res = await fetch(`${cleanUrl}/rest/v1/${encodeURIComponent(tableName)}?select=*&limit=1`, {
            method: 'GET',
            headers: {
              'apikey': anonKey,
              'Authorization': `Bearer ${anonKey}`,
              'Accept': 'application/json',
            },
          });
          if (res.ok) {
            validTables.push(tableName);
          }
        } catch {
          // Ignorar fallos de sonda individuales
        }
      })
    );

    const finalTables = validTables.length > 0 ? validTables : CANDIDATE_TABLES;

    // Preservar el orden preferente (leads_agencialquimia primero)
    const sortedTables = CANDIDATE_TABLES.filter((t) => finalTables.includes(t));

    return NextResponse.json({
      success: true,
      tables: sortedTables.length > 0 ? sortedTables : finalTables,
      isFallback: false,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error al descubrir tablas';
    console.warn('[Supabase Tables API Warning]:', errorMessage);

    return NextResponse.json({
      success: true,
      tables: CANDIDATE_TABLES,
      isFallback: true,
      error: errorMessage,
    });
  }
}
