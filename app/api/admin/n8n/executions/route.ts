import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/n8n/executions?workflowId=<id>&limit=<n>
 * Proxy hacia la API pública de n8n: historial de ejecuciones (para el panel de chat).
 */
export async function GET(request: Request) {
  const apiUrl = process.env.N8N_API_URL;
  const apiKey = process.env.N8N_API_KEY;
  if (!apiUrl || !apiKey) {
    return NextResponse.json({ success: false, error: 'N8N no configurado' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const workflowId = searchParams.get('workflowId');
  const limit = searchParams.get('limit') ?? '8';
  if (!workflowId) {
    return NextResponse.json({ success: false, error: 'Falta workflowId' }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(
      `${apiUrl.replace(/\/$/, '')}/executions?workflowId=${encodeURIComponent(workflowId)}&limit=${encodeURIComponent(limit)}`,
      {
        headers: { 'X-N8N-API-KEY': apiKey },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ success: false, error: `n8n respondió ${res.status}` }, { status: 502 });
    }

    const json = await res.json();
    const data = (json.data ?? []).map((e: Record<string, unknown>) => ({
      id: e.id,
      status: e.status,
      startedAt: e.startedAt,
      stoppedAt: e.stoppedAt,
      mode: e.mode,
    }));

    return NextResponse.json({ success: true, executions: data });
  } catch (err) {
    console.error('[n8n executions] error', err);
    return NextResponse.json({ success: false, error: 'Error de red con n8n' }, { status: 502 });
  }
}
