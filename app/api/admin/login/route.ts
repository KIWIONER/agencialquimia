import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminToken } from '@/lib/auth';

/**
 * ==============================================================================
 * API: /api/admin/login
 * ==============================================================================
 * Descripción: Endpoint para validar credenciales y crear cookie de sesión JWT.
 * ==============================================================================
 */

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // En producción se usa variable de entorno, localmente hardcoded o env local
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@agencialquimia.es';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'alquimia2026';

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Credenciales válidas -> Generar JWT
      const token = await createAdminToken({
        email,
        nombre: 'Administrador',
        role: 'admin',
      });

      // Configurar Cookie segura
      const cookieStore = await cookies();
      cookieStore.set({
        name: 'admin_session',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 12 * 60 * 60, // 12 horas
      });

      return NextResponse.json({ success: true });
    }

    // Credenciales inválidas
    return NextResponse.json(
      { success: false, error: 'Credenciales incorrectas' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
