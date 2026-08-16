import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminToken } from '@/lib/auth';

/**
 * ==============================================================================
 * API: /api/admin/login
 * ==============================================================================
 * Descripción:
 *  Endpoint para validar credenciales contra la tabla `admin_users` de Supabase
 *  (función `admin_login` con hash bcrypt) y crear la cookie de sesión JWT.
 *
 *  Nunca compara contra credenciales hardcodeadas: la única fuente de verdad
 *  es Supabase Cloud (ver skill admin-login).
 * ==============================================================================
 */

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Correo y contraseña obligatorios' },
        { status: 400 }
      );
    }

    const supabaseUrl = (process.env.PUBLIC_SUPABASE_URL || '')
      .replace(/\/rest\/v1\/?$/, '')
      .replace(/\/$/, '');
    const anonKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json(
        { success: false, error: 'Servidor mal configurado' },
        { status: 500 }
      );
    }

    // 1. Validar credenciales contra la función admin_login (nunca contra la tabla)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/admin_login`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_email: email, p_password: password }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!rpcRes.ok) {
      return NextResponse.json(
        { success: false, error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    const user = await rpcRes.json();

    // PostgREST devuelve una fila de nulls con credenciales inválidas → tratar como error
    if (!user || typeof user.email !== 'string' || user.email.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    // 2. Credenciales válidas → JWT + cookie httpOnly
    const token = await createAdminToken({
      email: user.email,
      nombre: user.nombre ?? 'Administrador',
      role: 'admin',
    });

    const cookieStore = await cookies();
    cookieStore.set({
      name: 'admin_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 12 * 60 * 60, // 12 horas
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
