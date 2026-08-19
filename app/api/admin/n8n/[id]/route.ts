import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';

/**
 * ==============================================================================
 * Archivo: app/api/admin/n8n/[id]/route.ts
 * ==============================================================================
 * Descripción:
 *  Endpoint API proxy para el panel admin: devuelve o actualiza el contenido de un
 *  workflow de n8n (nodos, posiciones y conexiones).
 * ==============================================================================
 */

export const dynamic = 'force-dynamic';

interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion?: number;
  position?: [number, number];
  parameters?: Record<string, unknown>;
}

export interface N8nNodeDetail extends N8nNode {
  credentials?: Record<string, unknown>;
}

async function n8nFetch(apiUrl: string, apiKey: string, path: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  try {
    return await fetch(`${apiUrl.replace(/\/$/, '')}${path}`, {
      ...init,
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Content-Type': 'application/json',
        ...init?.headers,
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verificación de seguridad Defense-in-depth
  const token = request.cookies.get('admin_session')?.value;
  const { valid } = await verifyAdminToken(token ?? '');
  if (!valid) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const apiUrl = process.env.N8N_API_URL;
  const apiKey = process.env.N8N_API_KEY;

  if (!apiUrl || !apiKey) {
    return NextResponse.json(
      { success: false, error: 'N8N_API_URL / N8N_API_KEY no configurados' },
      { status: 500 }
    );
  }

  try {
    const res = await n8nFetch(apiUrl, apiKey, `/workflows/${encodeURIComponent(id)}`);
    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `n8n devolvió estado ${res.status}` },
        { status: res.status }
      );
    }

    const workflow = await res.json();
    return NextResponse.json({ success: true, workflow });
  } catch (error) {
    console.error('[n8n workflow detail error]:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener el workflow' },
      { status: 502 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verificación de seguridad Defense-in-depth
  const token = request.cookies.get('admin_session')?.value;
  const { valid } = await verifyAdminToken(token ?? '');
  if (!valid) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const apiUrl = process.env.N8N_API_URL;
  const apiKey = process.env.N8N_API_KEY;

  if (!apiUrl || !apiKey) {
    return NextResponse.json(
      { success: false, error: 'N8N_API_URL / N8N_API_KEY no configurados' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const payload = {
      name: body.name,
      nodes: body.nodes ?? [],
      connections: body.connections ?? {},
      settings: body.settings ?? {},
    };

    const res = await n8nFetch(apiUrl, apiKey, `/workflows/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { success: false, error: `n8n error: ${errText}` },
        { status: res.status }
      );
    }

    const updated = await res.json();
    return NextResponse.json({ success: true, workflow: updated });
  } catch (error) {
    console.error('[n8n workflow update error]:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar el workflow' },
      { status: 502 }
    );
  }
}
