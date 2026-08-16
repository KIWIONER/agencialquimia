import { NextRequest, NextResponse } from 'next/server';

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
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Accept': 'application/json',
        'Prefer': 'count=exact',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`PostgREST retornó código ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const contentRange = response.headers.get('content-range');
    const totalCount = contentRange ? parseInt(contentRange.split('/')[1] || '0', 10) : data.length;

    return NextResponse.json({
      success: true,
      table,
      data,
      count: totalCount,
      isFallback: false,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error al conectar con Supabase';
    console.warn(`[Supabase Data API Warning for table '${table}']:`, errorMessage);

    const mockData = getMockDataForTable(table);
    return NextResponse.json({
      success: true,
      table,
      data: mockData,
      count: mockData.length,
      isFallback: true,
      error: errorMessage,
    });
  }
}

function getMockDataForTable(table: string): Record<string, unknown>[] {
  if (table === 'consultas' || table === 'interacciones') {
    return [
      { id: '1', usuario: 'Matías I.', mensaje: '¿Cómo automatizar mi clínica?', respuesta: 'Te enviamos la info.', canal: 'Chat Web', fecha: '2026-08-16 14:00' },
      { id: '2', usuario: 'Laura V.', mensaje: 'Presupuesto chatbot restaurantes', respuesta: 'Agendada demo.', canal: 'WhatsApp', fecha: '2026-08-15 19:30' },
    ];
  }

  return [
    { id: '1', nombre: 'Carlos Ruiz', sector: 'Retail', contacto: 'carlos@tienda.es', estado: 'Pendiente', fecha: 'Hoy, 10:30' },
    { id: '2', nombre: 'Lucía Fer', sector: 'Wellness', contacto: '+34 600 123 456', estado: 'Enviado a IA', fecha: 'Ayer, 18:20' },
    { id: '3', nombre: 'Juan Gómez', sector: 'Inmobiliaria', contacto: 'juan@prop.com', estado: 'Finalizado', fecha: '22 Abr' },
    { id: '4', nombre: 'Elena Blanco', sector: 'Salud', contacto: '+34 604 555 888', estado: 'Enviado a IA', fecha: 'Hace 2 horas' },
  ];
}
