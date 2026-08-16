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

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const apiUrl = process.env.N8N_API_URL;
  const apiKey = process.env.N8N_API_KEY;

  if (!apiUrl || !apiKey) {
    return NextResponse.json({ success: false, error: 'N8N no configurado' }, { status: 500 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${apiUrl.replace(/\/$/, '')}/workflows/${encodeURIComponent(id)}`, {
      headers: { 'X-N8N-API-KEY': apiKey },
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`n8n API respondió ${res.status}`);
    }

    const wf = await res.json();
    const nodes: N8nNode[] = (wf.nodes ?? []).map((n: N8nNode) => ({
      id: n.id,
      name: n.name,
      type: n.type,
      position: n.position,
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
