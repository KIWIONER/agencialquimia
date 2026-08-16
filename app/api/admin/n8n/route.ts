/**
 * ==============================================================================
 * Archivo: app/api/admin/n8n/route.ts
 * ==============================================================================
 * Descripción:
 *  Endpoint API proxy para el panel admin: lista los workflows de n8n en tiempo
 *  real (nombre, id, estado activo/inactivo) usando la API pública de n8n.
 *
 *  Requiere en el entorno: N8N_API_URL y N8N_API_KEY (ver .env.local).
 * ==============================================================================
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
}

export async function GET() {
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

    const res = await fetch(`${apiUrl.replace(/\/$/, '')}/workflows?limit=250`, {
      headers: { 'X-N8N-API-KEY': apiKey },
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`n8n API respondió ${res.status}`);
    }

    const json = await res.json();
    const workflows: N8nWorkflow[] = (json.data ?? []).map(
      (w: { id: string; name: string; active: boolean }) => ({
        id: w.id,
        name: w.name,
        active: w.active,
      })
    );

    return NextResponse.json({
      success: true,
      workflows,
      total: workflows.length,
      activeCount: workflows.filter((w) => w.active).length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al conectar con n8n';
    console.warn('[n8n API Warning]:', message);
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
