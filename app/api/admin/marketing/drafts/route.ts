import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin_session')?.value;
  const { valid } = await verifyAdminToken(token ?? '');
  if (!valid) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    console.error('[API Drafts] Missing supabase credentials. Checking env vars...');
    console.log('PUBLIC_SUPABASE_URL:', !!process.env.PUBLIC_SUPABASE_URL);
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    return NextResponse.json({ success: false, error: 'Supabase config missing' }, { status: 500 });
  }

  const cleanUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

  try {
    console.log(`[API Drafts] Fetching from: ${cleanUrl}/rest/v1/content_pipeline`);
    const res = await fetch(`${cleanUrl}/rest/v1/content_pipeline?estado=eq.borrador&order=created_at.desc`, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ success: false, error: errText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API Drafts] Error:', error);
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}
