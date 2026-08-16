/**
 * ==============================================================================
 * Archivo: examples/route.ts (plantilla de referencia)
 * ==============================================================================
 * Descripción:
 *  API route genérica para el panel admin: lista las tablas expuestas en
 *  Supabase (vía spec OpenAPI de PostgREST) y devuelve filas de una tabla
 *  con paginación. Copiar a app/api/admin/route.ts y adaptar si es necesario.
 *
 *  Requiere en el entorno: PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY
 *  (inyectadas por Coolify en el contenedor; documentadas en .env.example).
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';

// Cabeceras necesarias para PostgREST (anon key pública por diseño)
function supabaseHeaders(): Record<string, string> {
  const anonKey = process.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!anonKey) {
    throw new Error('Falta PUBLIC_SUPABASE_ANON_KEY en el entorno');
  }
  return {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
  };
}

function supabaseBaseUrl(): string {
  const url = process.env.PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('Falta PUBLIC_SUPABASE_URL en el entorno');
  }
  return url.replace(/\/$/, '');
}

/**
 * GET /api/admin?table=leads&limit=50&offset=0&order=id.asc
 * - Sin `table`: devuelve la lista de tablas expuestas (spec OpenAPI).
 * - Con `table`: devuelve { data, total } con paginación.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const table = searchParams.get('table');
  const limit = Math.min(Number(searchParams.get('limit') ?? '100'), 500);
  const offset = Number(searchParams.get('offset') ?? '0');
  const order = searchParams.get('order') ?? 'id.asc';

  try {
    const base = supabaseBaseUrl();

    // Sin tabla -> descubrimiento vía spec OpenAPI de PostgREST
    if (!table) {
      const res = await fetch(`${base}/rest/v1/`, { headers: supabaseHeaders(), cache: 'no-store' });
      if (!res.ok) return NextResponse.json({ error: `PostgREST ${res.status}` }, { status: 502 });
      const spec = await res.json();
      const tables = Object.keys(spec.paths ?? {})
        .filter((p) => p.startsWith('/'))
        .map((p) => p.slice(1));
      return NextResponse.json({ tables });
    }

    // Con tabla -> filas paginadas
    const url = `${base}/rest/v1/${encodeURIComponent(table)}?select=*&limit=${limit}&offset=${offset}&order=${encodeURIComponent(order)}`;
    const res = await fetch(url, {
      headers: { ...supabaseHeaders(), Range: `0-${limit - 1}` },
      cache: 'no-store',
    });
    if (!res.ok) return NextResponse.json({ error: `PostgREST ${res.status}` }, { status: 502 });

    const data = await res.json();
    const total = Number(res.headers.get('content-range')?.split('/')[1] ?? data.length);

    return NextResponse.json({ data, total, limit, offset });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
