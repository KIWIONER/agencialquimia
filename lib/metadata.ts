/**
 * ==============================================================================
 * Archivo: lib/metadata.ts
 * ==============================================================================
 * Descripción:
 *  Generador centralizado de metadatos SEO para Next.js App Router (Metadata API).
 * 
 * Propósito:
 *  Asegurar que todas las páginas de AgenciAlquimia compartan una configuración SEO
 *  de grado empresarial, incluyendo OpenGraph para redes sociales, Twitter Cards,
 *  URL canónica e indexación correcta para motores de búsqueda (Google, Bing).
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
  title = 'Agencia de Automatización con IA en Santiago de Compostela | AgenciAlquimia',
  description = 'AgenciAlquimia automatiza la atención al cliente, reservas y gestión de documentos para pymes en Santiago de Compostela y Galicia. Demos funcionales y resultados desde el primer mes.',
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
      'Agencia IA Santiago de Compostela',
      'Automatización Pymes Galicia',
      'Agentes comerciales IA',
      'Chatbot reservas n8n',
      'Integración WhatsApp pymes',
      'Sistemas autónomos Galicia',
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
          alt: 'AgenciAlquimia - Agencia de IA para Pymes',
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
      icon: '/favicon.ico',
      shortcut: '/favicon.svg',
    },
  };
}
