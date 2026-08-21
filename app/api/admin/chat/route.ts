import { NextResponse } from 'next/server';
import { verifyAdminToken } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/chat
 * Proxy hacia el agente (webhook de n8n /webhook/v1/agente/consulta).
 * Cuerpo: { chatInput: string, sessionId?: string }
 * Respuesta: { response: string }
 */
export async function POST(request: Request) {
  // 1) Validar sesión admin (cookie JWT)
  const token = request.headers.get('cookie')?.match(/admin_session=([^;]+)/)?.[1];
  const { valid } = await verifyAdminToken(token ?? '');
  if (!valid) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  const apiUrl = process.env.N8N_API_URL || 'https://cerebro.agencialquimia.com/api/v1';
  // N8N_API_URL suele incluir /api/v1 (API pública); los webhooks viven en la raíz
  const webhookBase = apiUrl.replace(/\/api\/v1\/?$/, '');

  let body: { chatInput?: string; sessionId?: string; viaWhatsapp?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Cuerpo inválido' }, { status: 400 });
  }

  const chatInput = body.chatInput?.trim();
  if (!chatInput) {
    return NextResponse.json({ message: 'chatInput vacío' }, { status: 400 });
  }

  // Número de WhatsApp de Matías (el mismo que usa el workflow en ¿Es Matías?)
  const telefonoMatias = process.env.ADMIN_WHATSAPP_DESTINO ?? '34657738334';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);

    if (body.viaWhatsapp) {
      // Modo Max (panel): llama al webhook síncrono "max-panel" del workflow
      // "MAX - Panel Admin (chat)" → Max (Gemini 2.5 Pro + memoria) responde
      // EN EL PANEL (responseNode), no por WhatsApp. Comparte memoria con el
      // WhatsApp real vía sessionId max_<telefono>.
      const res = await fetch(`${webhookBase}/webhook/max-panel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatInput,
          sessionId: body.sessionId ?? `max_${telefonoMatias}`,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        console.error('[chat/wa] max-panel respondió', res.status);
        return NextResponse.json({ message: `Max respondió ${res.status}` }, { status: 502 });
      }
      const data = await res.json();
      const response =
        typeof data?.output === 'string'
          ? data.output
          : typeof data?.response === 'string'
            ? data.response
            : JSON.stringify(data);
      return NextResponse.json({ success: true, viaWhatsapp: true, response });
    }

    const res = await fetch(`${webhookBase}/webhook/v1/agente/consulta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatInput,
        sessionId: body.sessionId ?? `panel_${Date.now()}`,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.error('[chat] agente respondió', res.status);
      return NextResponse.json({ message: `El agente respondió ${res.status}` }, { status: 502 });
    }

    const data = await res.json();
    const response = typeof data?.response === 'string' ? data.response : JSON.stringify(data);
    return NextResponse.json({ success: true, response });
  } catch (err) {
    console.error('[chat] error de red', err);
    return NextResponse.json({ message: 'Error de conexión con el agente' }, { status: 502 });
  }
}
