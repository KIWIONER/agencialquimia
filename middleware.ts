import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminToken } from './lib/auth';

/**
 * ==============================================================================
 * Archivo: middleware.ts
 * ==============================================================================
 * Descripción:
 *  Middleware global de Next.js para proteger las rutas del panel de administración
 *  (/admin) y sus correspondientes endpoints de API (/api/admin/*).
 *  Verifica la validez del token JWT presente en la cookie `admin_session`.
 * ==============================================================================
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas dentro del área de administración (Login)
  if (pathname === '/admin/login' || pathname === '/api/admin/login') {
    return NextResponse.next();
  }

  // Interceptar páginas de administración (/admin/*) y endpoints de API (/api/admin/*)
  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');

  if (isAdminPage || isAdminApi) {
    const token = request.cookies.get('admin_session')?.value;

    if (!token) {
      if (isAdminApi) {
        return NextResponse.json(
          { success: false, error: 'No autorizado' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    const { valid } = await verifyAdminToken(token);

    if (!valid) {
      if (isAdminApi) {
        const response = NextResponse.json(
          { success: false, error: 'Sesión expirada o no autorizada' },
          { status: 401 }
        );
        response.cookies.delete('admin_session');
        return response;
      }

      const loginUrl = new URL('/admin/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('admin_session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
