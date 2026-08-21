import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';

/**
 * ==============================================================================
 * Archivo: app/api/admin/n8n/route.ts
 * ==============================================================================
 * Descripción:
 *  Endpoint API proxy para el panel admin: lista los workflows de n8n en tiempo
 *  real (nombre, id, estado activo/inactivo) usando la API pública de n8n.
 * ==============================================================================
 */

export const dynamic = 'force-dynamic';

interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
}

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
    return NextResponse.json(
      { success: false, error: 'N8N_API_URL / N8N_API_KEY no configurados' },
      { status: 500 }
    );
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${apiUrl.replace(/\/$/, '')}/workflows`, {
      headers: {
        'X-N8N-API-KEY': apiKey,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `n8n devolvió estado ${res.status}` },
        { status: res.status }
      );
    }

    const data = (await res.json()) as { data?: N8nWorkflow[] };
    const list = data.data ?? [];

    const workflows = list.map((w) => ({
      id: w.id,
      name: w.name,
      active: w.active,
    }));

    const activeCount = workflows.filter((w) => w.active).length;
    return NextResponse.json({
      success: true,
      workflows,
      total: workflows.length,
      activeCount,
    });
  } catch (error) {
    console.error('[n8n workflows proxy error]:', error);
    return NextResponse.json(
      { success: false, error: 'Error al conectar con la API de n8n' },
      { status: 502 }
    );
  }
}
