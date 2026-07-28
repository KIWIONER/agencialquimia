/**
 * ==============================================================================
 * Archivo: app/sitemap.ts
 * ==============================================================================
 * Descripción:
 *  Generador dinámico del mapa del sitio (sitemap.xml) para AgenciAlquimia.
 * 
 * Funcionalidades Clave:
 *  1. Indexa todas las rutas públicas activas (Landing Page, Aviso Legal, Política de Privacidad).
 *  2. Especifica prioridades y frecuencias de actualización para motores de búsqueda.
 * ==============================================================================
 */

import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agencialquimia.com';
  const currentDate = new Date();

  return [
    {
      url: `${baseUrl}/`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/aviso-legal`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/politica-de-privacidad`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];
}
