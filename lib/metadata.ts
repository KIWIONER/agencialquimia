/**
 * ==============================================================================
 * Archivo: lib/metadata.ts
 * ==============================================================================
 * Descripción:
 *  Generador centralizado de metadatos SEO para Next.js App Router (Metadata API).
 * 
 * Propósito:
 *  Posicionar a AgenciAlquimia como Estudio de Arquitectura Web de Nueva Generación,
 *  Desarrollo Full-Stack con Next.js/React 19 e Infraestructura con IA a Medida
 *  en Santiago de Compostela, Galicia y España.
 * ==============================================================================
 */

import type { Metadata } from 'next';

/**
 * Genera el objeto de metadatos de Next.js combinando valores por defecto con sobrescrituras específicas.
 * 
 * @param title - Título personalizado de la página (opcional)
 * @param description - Meta descripción para resultados de búsqueda (opcional)
 * @param path - Ruta relativa de la página (ej. "/admin", "/aviso-legal")
 */
export function constructMetadata({
  title = 'Estudio de Arquitectura Web & Ecosistemas de IA | AgenciAlquimia Santiago de Compostela',
  description = 'AgenciAlquimia diseña aplicaciones web de nueva generación en Next.js 15, microservicios backend en Python e infraestructura de automatización con IA a medida para pymes y empresas en Galicia y España.',
  path = '/',
  image = '/assets/images/logo-opt.png',
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
} = {}): Metadata {
  const baseUrl = 'https://agencialquimia.com';

  return {
    title,
    description,
    keywords: [
      'Arquitectura Web con IA Santiago de Compostela',
      'Desarrollo Web Next.js 15 Galicia',
      'Ecosistemas de Inteligencia Artificial para Empresas',
      'Microservicios Python a Medida',
      'Automatización de Procesos e Integración CRM Galicia',
      'Agencia de Software e Infraestructura IA España',
      'Sistemas Autónomos y Soberanía de Datos',
    ],
    authors: [{ name: 'AgenciAlquimia' }],
    creator: 'AgenciAlquimia',
    publisher: 'AgenciAlquimia',
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: path,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}${path}`,
      siteName: 'AgenciAlquimia',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: 'AgenciAlquimia - Arquitectura Web & Ecosistemas de IA a Medida',
        },
      ],
      locale: 'es_ES',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@agencialquimia',
    },
    icons: {
      icon: [
        { url: '/favicon.svg?v=2', type: 'image/svg+xml' },
      ],
      shortcut: '/favicon.svg?v=2',
      apple: '/favicon.svg?v=2',
    },
  };
}
