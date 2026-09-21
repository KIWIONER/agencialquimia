import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  const token = request.cookies.get('admin_session')?.value;
  const { valid } = await verifyAdminToken(token ?? '');
  if (!valid) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ success: false, error: 'Supabase config missing' }, { status: 500 });
  }

  const cleanUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

  try {
    const body = await request.json();
    const { id, blog_md, copy_x, copy_fb_linkedin, copy_ig } = body;

    if (!id) return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 });

    const res = await fetch(`${cleanUrl}/rest/v1/content_pipeline?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ blog_md, copy_x, copy_fb_linkedin, copy_ig })
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ success: false, error: errText }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}
