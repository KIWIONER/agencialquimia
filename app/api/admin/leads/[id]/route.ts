import { NextResponse } from 'next/server';
import { verifyAdminToken } from '../../../../../lib/auth';

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY ?? '';

const ETAPAS = ['nuevo', 'contactado', 'llamada', 'aceptado', 'contrato'];

/**
 * PATCH /api/admin/leads/[id]
 * Cambia la etapa de un lead en el pipeline (solo admin autenticado).
 * Cuerpo: { "etapa": "contactado" }
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1) Validar sesión admin (cookie JWT)
  const token = request.headers.get('cookie')?.match(/admin_session=([^;]+)/)?.[1];
  const { valid } = await verifyAdminToken(token ?? '');
  if (!valid) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const leadId = Number(id);
  if (!Number.isInteger(leadId) || leadId <= 0) {
    return NextResponse.json({ message: 'ID de lead inválido' }, { status: 400 });
  }

  let body: { etapa?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Cuerpo inválido' }, { status: 400 });
  }

  if (!body.etapa || !ETAPAS.includes(body.etapa)) {
    return NextResponse.json(
      { message: `Etapa inválida. Válidas: ${ETAPAS.join(', ')}` },
      { status: 400 }
    );
  }

  // 2) Llamar a la función SECURITY DEFINER en Supabase (solo cambia la etapa permitida)
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/actualizar_etapa_lead`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_lead_id: leadId, p_etapa: body.etapa }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[leads/patch] Supabase error', res.status, err.slice(0, 300));
      return NextResponse.json({ message: 'Supabase rechazó la actualización' }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, lead: data });
  } catch (err) {
    console.error('[leads/patch] red error', err);
    return NextResponse.json({ message: 'Error de red con Supabase' }, { status: 502 });
  }
}
