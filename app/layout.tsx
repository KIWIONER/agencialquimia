/**
 * ==============================================================================
 * Archivo: app/layout.tsx
 * ==============================================================================
 * Descripción:
 *  Root Layout global de Next.js App Router para AgenciAlquimia.
 * 
 * Funcionalidades Clave:
 *  1. Carga WPO optimizada de fuentes corporativas (*Space Grotesk* e *Inter*)
 *     mediante `next/font/google` con `display: 'swap'` y `preload: true` para eliminar
 *     cadenas críticas de red bloqueantes (LCP) y prevenir el Layout Shift (CLS).
 *  2. Inyección de datos estructurados Schema.org `LocalBusiness` mediante `<JsonLd />`.
 *  3. Inclusión de metadatos SEO dinámicos centralizados.
 * ==============================================================================
 */

import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import JsonLd from '@/components/JsonLd';
import { constructMetadata } from '@/lib/metadata';
import './globals.css';

/** Carga de fuente tipográfica Space Grotesk para encabezados corporativos */
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  preload: true,
});

/** Carga de fuente tipográfica Inter para el cuerpo de texto principal */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

/** Definición de metadatos globales del sitio */
export const metadata: Metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <head>
        {/* Pre-conexión de orígenes críticos para acelerar el establecimiento de sockets */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cerebro.agencialquimia.com" />
      </head>
      <body className="antialiased selection:bg-emerald-500/30 selection:text-emerald-900">
        {/* Marcado JSON-LD Schema.org para SEO Local */}
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
