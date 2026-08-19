import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';

/**
 * ==============================================================================
 * Archivo: app/api/admin/data/route.ts
 * ==============================================================================
 * Descripción:
 *  Endpoint API proxy para consultar filas y registros de una tabla de Supabase (PostgREST)
 *  de forma segura desde el servidor de Next.js.
 * ==============================================================================
 */

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Verificación de seguridad Defense-in-depth
  const token = request.cookies.get('admin_session')?.value;
  const { valid } = await verifyAdminToken(token ?? '');
  if (!valid) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const table = searchParams.get('table') || 'leads';
  const limit = parseInt(searchParams.get('limit') || '100', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    const mockData = getMockDataForTable(table);
    return NextResponse.json({
      success: true,
      table,
      data: mockData,
      count: mockData.length,
      isFallback: true,
      message: 'Supabase no configurado en variables de entorno. Mostrando datos mock.',
    });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const cleanUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
    const targetUrl = `${cleanUrl}/rest/v1/${encodeURIComponent(table)}?select=*&limit=${limit}&offset=${offset}`;

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'count=exact',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Supabase devolvió HTTP ${response.status}`);
    }

    const data = await response.json();
    const contentRange = response.headers.get('content-range');
    let totalCount = Array.isArray(data) ? data.length : 0;

    if (contentRange) {
      const parts = contentRange.split('/');
      if (parts[1] && parts[1] !== '*') {
        totalCount = parseInt(parts[1], 10);
      }
    }

    return NextResponse.json({
      success: true,
      table,
      data: Array.isArray(data) ? data : [],
      count: totalCount,
    });
  } catch {
    const mockData = getMockDataForTable(table);
    return NextResponse.json({
      success: true,
      table,
      data: mockData,
      count: mockData.length,
      isFallback: true,
      message: 'Error al consultar Supabase. Mostrando datos de respaldo.',
    });
  }
}

function getMockDataForTable(table: string): Record<string, unknown>[] {
  if (table.includes('lead')) {
    return [
      { id: '1', nombre: 'Clínica Dental Galicia', email: 'contacto@clinicagalicia.es', estado: 'Pendiente', created_at: '2026-08-15' },
      { id: '2', nombre: 'Restaurante O Lado', email: 'reservas@olado.gal', estado: 'Contactado', created_at: '2026-08-14' },
    ];
  }
  return [
    { id: '1', sistema: 'AgenciAlquimia Core', estado: 'Activo', mensaje: 'Sistema funcionando correctamente' },
  ];
}
