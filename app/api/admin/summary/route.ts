import { NextResponse } from 'next/server';
import { verifyAdminToken } from '../../../../lib/auth';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

/**
 * Resumen del panel admin — API server-side.
 *
 * GET /api/admin/summary → métricas consolidadas de todas las secciones:
 *   - leads:      leads_agencialquimia (total + por etapa)
 *   - hunter:     leads_hunter (total + por estado_caza)
 *   - objetivos:  objetivos_agencia (total, con email, con teléfono, con coords)
 *   - queries:    radar_queries (total + activas)
 *   - inbox:      mensajes_panel (total, no leídos entrantes, conversaciones)
 *   - workflows:  workflows n8n (total + activos) vía N8N_API_URL
 *   - tablas:     nº de tablas públicas de Supabase (information_schema)
 *
 * Diseñado para alimentar el panel resumen del dashboard (DashboardSummary.tsx)
 * con una sola llamada en paralelo desde el cliente.
 */

const pool = new Pool({
  host: process.env.PANEL_DB_HOST ?? '',
  port: Number(process.env.PANEL_DB_PORT ?? 5432),
  user: process.env.PANEL_DB_USER ?? '',
  password: process.env.PANEL_DB_PASSWORD ?? '',
  database: process.env.PANEL_DB_NAME ?? 'postgres',
  ssl: { rejectUnauthorized: false },
});

export async function GET(request: Request) {
  const token = request.headers.get('cookie')?.match(/admin_session=([^;]+)/)?.[1];
  const { valid } = await verifyAdminToken(token ?? '');
  if (!valid) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }
  try {
    const [leads, hunter, objetivos, queries, inbox, tablas] = await Promise.all([
      pool.query(
        `SELECT count(*)::int AS total,
                count(*) FILTER (WHERE etapa = 'nuevo')::int AS nuevo,
                count(*) FILTER (WHERE etapa = 'contactado')::int AS contactado,
                count(*) FILTER (WHERE etapa = 'en conversacion')::int AS en_conversacion,
                count(*) FILTER (WHERE etapa = 'ganado')::int AS ganado,
                count(*) FILTER (WHERE etapa = 'descartado')::int AS descartado
         FROM leads_agencialquimia`
      ),
      pool.query(
        `SELECT count(*)::int AS total,
                count(*) FILTER (WHERE estado_caza = 'pendiente')::int AS pendiente,
                count(*) FILTER (WHERE estado_caza = 'contactado')::int AS contactado,
                count(*) FILTER (WHERE estado_caza = 'en conversacion')::int AS en_conversacion,
                count(*) FILTER (WHERE estado_caza = 'ganado')::int AS ganado,
                count(*) FILTER (WHERE estado_caza = 'descartado')::int AS descartado
         FROM leads_hunter`
      ),
      pool.query(
        `SELECT count(*)::int AS total,
                count(*) FILTER (WHERE email IS NOT NULL AND email <> '')::int AS con_email,
                count(*) FILTER (WHERE telefono IS NOT NULL AND telefono <> '')::int AS con_telefono,
                count(*) FILTER (WHERE lat IS NOT NULL AND lon IS NOT NULL)::int AS con_coords
         FROM objetivos_agencia`
      ),
      pool.query(
        `SELECT count(*)::int AS total,
                count(*) FILTER (WHERE activo)::int AS activas
         FROM radar_queries`
      ),
      pool.query(
        `SELECT count(*)::int AS total,
                count(*) FILTER (WHERE direccion = 'in' AND NOT leido)::int AS no_leidos,
                count(DISTINCT telefono)::int AS conversaciones
         FROM mensajes_panel`
      ),
      pool.query(
        `SELECT count(*)::int AS total
         FROM unnest(ARRAY[
           'leads_agencialquimia','leads_hunter','chat_messages','chat_messages_alquimia',
           'chat_messages_cerebro','conversaciones_alquimia','n8n_chat_histories',
           'control_rutas','ideas_agencia','objetivos_agencia','radar_queries'
         ]) AS t(tabla)
         WHERE to_regclass('public.' || t.tabla) IS NOT NULL`
      ),
    ]);

    // Workflows n8n (mejor esfuerzo: si la API no está, devolvemos null)
    let workflows: { total: number | null; activos: number | null } = { total: null, activos: null };
    try {
      const apiUrl = process.env.N8N_API_URL ?? '';
      const apiKey = process.env.N8N_API_KEY ?? '';
      if (apiUrl && apiKey) {
        const res = await fetch(`${apiUrl.replace(/\/$/, '')}/workflows?limit=250`, {
          headers: { 'X-N8N-API-KEY': apiKey },
          cache: 'no-store',
        });
        if (res.ok) {
          const json = await res.json();
          const items: { active?: boolean }[] = Array.isArray(json.data) ? json.data : [];
          workflows = {
            total: items.length,
            activos: items.filter((w) => w.active).length,
          };
        }
      }
    } catch (err) {
      console.warn('[summary] n8n workflows no disponibles:', err);
    }

    return NextResponse.json({
      success: true,
      leads: leads.rows[0],
      hunter: hunter.rows[0],
      objetivos: objetivos.rows[0],
      queries: queries.rows[0],
      inbox: inbox.rows[0],
      tablas: tablas.rows[0],
      workflows,
    });
  } catch (err) {
    console.error('[summary] GET error:', err);
    return NextResponse.json({ message: 'Error al generar el resumen' }, { status: 500 });
  }
}
