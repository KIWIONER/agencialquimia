import { NextResponse } from 'next/server';
import { verifyAdminToken } from '../../../../lib/auth';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

/**
 * Inbox de clientes (WhatsApp) — API del panel admin.
 *
 * GET  /api/admin/inbox            → lista de conversaciones (por teléfono)
 * GET  /api/admin/inbox?telefono=X → hilo de mensajes con ese teléfono
 * POST /api/admin/inbox            → envía un mensaje al cliente { telefono, texto }
 * PATCH /api/admin/inbox           → marca como leídos { telefono }
 *
 * Los mensajes entrantes los registra el workflow n8n "PANEL - Log Mensaje
 * Entrante" (webhook panel-log-wa) y los salientes el workflow
 * "PANEL - Enviar WhatsApp Cliente" (webhook panel-enviar-wa).
 */

const pool = new Pool({
  host: process.env.PANEL_DB_HOST ?? '',
  port: Number(process.env.PANEL_DB_PORT ?? 5432),
  user: process.env.PANEL_DB_USER ?? '',
  password: process.env.PANEL_DB_PASSWORD ?? '',
  database: process.env.PANEL_DB_NAME ?? 'postgres',
  ssl: { rejectUnauthorized: false },
  max: 5,
});

async function requireAdmin(request: Request) {
  const token = request.headers.get('cookie')?.match(/admin_session=([^;]+)/)?.[1];
  const { valid } = await verifyAdminToken(token ?? '');
  return valid;
}

export async function GET(request: Request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  const telefono = new URL(request.url).searchParams.get('telefono');

  try {
    if (telefono) {
      // Hilo de un cliente concreto
      const { rows } = await pool.query(
        `SELECT id, telefono, direccion, texto, tipo, media_id, leido, created_at
         FROM mensajes_panel WHERE telefono = $1 ORDER BY created_at ASC, id ASC`,
        [telefono],
      );
      // Marcar como leídos los entrantes de este hilo
      await pool.query(`UPDATE mensajes_panel SET leido = true WHERE telefono = $1 AND direccion = 'in' AND NOT leido`, [telefono]);
      return NextResponse.json({ success: true, telefono, messages: rows });
    }

    // Lista de conversaciones: último mensaje + no leídos + nombre del cliente si se conoce
    const { rows } = await pool.query(
      `SELECT m.telefono,
              (SELECT nombre FROM conversaciones_alquimia c WHERE c.telefono = m.telefono ORDER BY c.updated_at DESC NULLS LAST LIMIT 1) AS cliente_nombre,
              (SELECT l.cliente_nombre FROM leads_agencialquimia l WHERE l.cliente_telefono = m.telefono ORDER BY l.created_at DESC NULLS LAST LIMIT 1) AS lead_nombre,
              count(*) FILTER (WHERE m.direccion = 'in' AND NOT m.leido) AS no_leidos,
              (array_agg(m.texto ORDER BY m.created_at DESC, m.id DESC))[1] AS ultimo_mensaje,
              max(m.created_at) AS ultima_actividad
       FROM mensajes_panel m
       GROUP BY m.telefono
       ORDER BY ultima_actividad DESC`,
    );
    return NextResponse.json({ success: true, conversations: rows });
  } catch (e) {
    console.error('[inbox] GET error', e);
    return NextResponse.json({ message: 'Error consultando inbox' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  let body: { telefono?: string; texto?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Cuerpo inválido' }, { status: 400 });
  }

  const telefono = body.telefono?.trim();
  const texto = body.texto?.trim();
  if (!telefono || !texto) {
    return NextResponse.json({ message: 'telefono y texto son obligatorios' }, { status: 400 });
  }

  const panelKey = process.env.PANEL_WEBHOOK_KEY;
  if (!panelKey) {
    return NextResponse.json({ message: 'PANEL_WEBHOOK_KEY no configurado' }, { status: 500 });
  }

  try {
    // Llamar al webhook de n8n que envía el WhatsApp y registra el mensaje saliente
    const apiUrl = process.env.N8N_API_URL ?? '';
    const webhookBase = apiUrl.replace(/\/api\/v1\/?$/, '');
    const res = await fetch(`${webhookBase}/webhook/panel-enviar-wa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Panel-Key': panelKey },
      body: JSON.stringify({ telefono, texto }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.success !== true) {
      console.error('[inbox] envío fallido', res.status, data);
      return NextResponse.json(
        { message: data?.message ?? `El envío respondió ${res.status}` },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, messageId: data.messageId ?? null });
  } catch (e) {
    console.error('[inbox] POST error', e);
    return NextResponse.json({ message: 'Error enviando mensaje' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  let body: { telefono?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Cuerpo inválido' }, { status: 400 });
  }

  const telefono = body.telefono?.trim();
  if (!telefono) {
    return NextResponse.json({ message: 'telefono obligatorio' }, { status: 400 });
  }

  try {
    await pool.query(`UPDATE mensajes_panel SET leido = true WHERE telefono = $1 AND direccion = 'in'`, [telefono]);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[inbox] PATCH error', e);
    return NextResponse.json({ message: 'Error marcando leídos' }, { status: 500 });
  }
}
