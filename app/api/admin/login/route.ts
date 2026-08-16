import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminToken } from '@/lib/auth';

/**
 * ==============================================================================
 * API: /api/admin/login
 * ==============================================================================
 * Descripción:
 *  Endpoint para validar credenciales y autenticar en el panel de administración.
 *  1. Valida primero contra Supabase Cloud (función RPC `admin_login`).
 *  2. Si no existe en Supabase o falla la conexión, usa como respaldo las
 *     credenciales de entorno (`ADMIN_EMAIL` y `ADMIN_PASSWORD` de .env.local).
 *  3. Genera cookie de sesión JWT HttpOnly (`admin_session`).
 * ==============================================================================
 */

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return NextResponse.json(
        { success: false, error: 'Correo y contraseña obligatorios' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    let authenticatedUser: { email: string; nombre: string; role: 'admin' } | null = null;

    // 1. Intentar validar credenciales contra la función admin_login de Supabase
    const supabaseUrl = (process.env.PUBLIC_SUPABASE_URL || '')
      .replace(/\/rest\/v1\/?$/, '')
      .replace(/\/$/, '');
    const anonKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && anonKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/admin_login`, {
          method: 'POST',
          headers: {
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ p_email: cleanEmail, p_password: password }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (rpcRes.ok) {
          const user = await rpcRes.json();
          if (user && typeof user.email === 'string' && user.email.length > 0) {
            authenticatedUser = {
              email: user.email,
              nombre: user.nombre ?? 'Administrador',
              role: 'admin',
            };
          }
        }
      } catch {
        // Fallback a variables de entorno si la llamada RPC da error de red o timeout
      }
    }

    // 2. Si no autenticó en Supabase, validar contra variables de entorno (ADMIN_EMAIL / ADMIN_PASSWORD)
    if (!authenticatedUser) {
      const envEmail = (process.env.ADMIN_EMAIL || 'matiasidiartviera@gmail.com').trim().toLowerCase();
      const envPassword = process.env.ADMIN_PASSWORD || 'AgenciAlquimia2026!';

      if (cleanEmail === envEmail && password === envPassword) {
        authenticatedUser = {
          email: envEmail,
          nombre: 'Administrador',
          role: 'admin',
        };
      }
    }

    // Si ninguna validación tuvo éxito
    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    // 3. Credenciales válidas → Generar JWT + cookie httpOnly
    const token = await createAdminToken({
      email: authenticatedUser.email,
      nombre: authenticatedUser.nombre,
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
  } catch {
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
