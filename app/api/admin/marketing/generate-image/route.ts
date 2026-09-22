import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);
  try {
    const body = await request.json();
    const { id, tema } = body;

    if (!id || !tema) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos (id, tema)' }, { status: 400 });
    }

    const pythonUrl = 'http://127.0.0.1:8000/marketing/image/generate';
    
    const response = await fetch(pythonUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        draft_id: id,
        tema: tema
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error desde Python sidecar:', errorText);
      return NextResponse.json({ error: 'Error al generar imagen en el sidecar' }, { status: response.status });
    }

    const data = await response.json();
    const { image_url } = data;

    const { error: updateError } = await supabase
      .from('content_pipeline')
      .update({ image_url: image_url })
      .eq('id', id);

    if (updateError) {
      console.error('Error actualizando DB:', updateError);
      return NextResponse.json({ error: 'Imagen generada pero falló actualización en DB' }, { status: 500 });
    }

    return NextResponse.json({ success: true, image_url });

  } catch (error) {
    console.error('Error en generate-image API:', error);
    const message = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
