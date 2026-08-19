import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/n8n/executions?workflowId=<id>&limit=<n>
 * Proxy hacia la API pública de n8n: historial de ejecuciones (para el panel de chat).
 */
export async function GET(request: NextRequest) {
  // Verificación de seguridad Defense-in-depth
  const token = request.cookies.get('admin_session')?.value;
  const { valid } = await verifyAdminToken(token ?? '');
  if (!valid) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

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
      return NextResponse.json(
        { success: false, error: `n8n status ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[n8n/executions error]:', err);
    return NextResponse.json({ success: false, error: 'Error de red' }, { status: 502 });
  }
}
