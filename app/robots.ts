/**
 * ==============================================================================
 * Archivo: app/robots.ts
 * ==============================================================================
 * Descripción:
 *  Generador dinámico del protocolo de exclusión de robots (robots.txt) para AgenciAlquimia.
 * 
 * Funcionalidades Clave:
 *  1. Permite el rastreo completo de la landing page y páginas comerciales.
 *  2. Bloquea el rastreo de la sub-ruta protegida del panel administrativo (`/admin`).
 *  3. Especifica la ubicación oficial del sitemap.xml.
 * ==============================================================================
 */

import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agencialquimia.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
