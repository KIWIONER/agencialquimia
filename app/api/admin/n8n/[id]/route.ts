/**
 * ==============================================================================
 * Archivo: app/api/admin/n8n/[id]/route.ts
 * ==============================================================================
 * Descripción:
 *  Endpoint API proxy para el panel admin: devuelve el contenido completo de un
 *  workflow de n8n (nodos, posiciones y conexiones) para renderizar su diagrama.
 * ==============================================================================
 */

import { NextResponse } from 'next/server';

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
        ...(init?.headers ?? {}),
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const apiUrl = process.env.N8N_API_URL;
  const apiKey = process.env.N8N_API_KEY;

  if (!apiUrl || !apiKey) {
    return NextResponse.json({ success: false, error: 'N8N no configurado' }, { status: 500 });
  }

  try {
    const res = await n8nFetch(apiUrl, apiKey, `/workflows/${encodeURIComponent(id)}`);

    if (!res.ok) {
      throw new Error(`n8n API respondió ${res.status}`);
    }

    const wf = await res.json();
    const nodes: N8nNodeDetail[] = (wf.nodes ?? []).map((n: N8nNodeDetail) => ({
      id: n.id,
      name: n.name,
      type: n.type,
      typeVersion: n.typeVersion,
      position: n.position,
      parameters: n.parameters,
      credentials: n.credentials,
    }));

    return NextResponse.json({
      success: true,
      id: wf.id,
      name: wf.name,
      active: wf.active,
      nodes,
      connections: wf.connections ?? {},
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al conectar con n8n';
    console.warn('[n8n detail API Warning]:', message);
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}

/**
 * PUT /api/admin/n8n/[id]
 * Cuerpo: { positions: { [nodeId]: [x, y] } }
 * Actualiza las posiciones de los nodos del workflow en n8n (persistencia real).
 */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const apiUrl = process.env.N8N_API_URL;
  const apiKey = process.env.N8N_API_KEY;

  if (!apiUrl || !apiKey) {
    return NextResponse.json({ success: false, error: 'N8N no configurado' }, { status: 500 });
  }

  try {
    const { positions } = await request.json();
    if (!positions || typeof positions !== 'object') {
      return NextResponse.json({ success: false, error: 'Faltan posiciones' }, { status: 400 });
    }

    // 1. Obtener el workflow completo actual
    const getRes = await n8nFetch(apiUrl, apiKey, `/workflows/${encodeURIComponent(id)}`);
    if (!getRes.ok) throw new Error(`n8n GET respondió ${getRes.status}`);
    const wf = await getRes.json();

    // 2. Aplicar las posiciones enviadas (por id de nodo)
    let applied = 0;
    for (const node of wf.nodes ?? []) {
      const pos = positions[node.id];
      if (Array.isArray(pos) && pos.length === 2) {
        node.position = [pos[0], pos[1]];
        applied += 1;
      }
    }

    // 3. Guardar de vuelta en n8n
    const putRes = await n8nFetch(apiUrl, apiKey, `/workflows/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(wf),
    });
    if (!putRes.ok) throw new Error(`n8n PUT respondió ${putRes.status}`);

    return NextResponse.json({ success: true, saved: applied });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al guardar en n8n';
    console.warn('[n8n save API Warning]:', message);
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
