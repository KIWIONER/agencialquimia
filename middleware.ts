import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminToken } from './lib/auth';

/**
 * ==============================================================================
 * Archivo: middleware.ts
 * ==============================================================================
 * Descripción:
 *  Middleware global de Next.js para proteger la ruta del panel de administración
 *  (/admin) verificando la validez del token JWT en la cookie `admin_session`.
 * ==============================================================================
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Interceptar solo las rutas dentro de /admin (excluyendo la página de login /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('admin_session')?.value;

    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    const { valid } = await verifyAdminToken(token);

    if (!valid) {
      const loginUrl = new URL('/admin/login', request.url);
      // Destruir cookie expirada
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('admin_session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
