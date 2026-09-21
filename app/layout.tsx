/**
 * ==============================================================================
 * Archivo: app/layout.tsx
 * ==============================================================================
 * Descripción:
 *  Root Layout global de Next.js App Router para AgenciAlquimia.
 * 
 * Funcionalidades Clave:
 *  1. Carga WPO optimizada de fuentes corporativas (*Space Grotesk* e *Inter*)
 *     mediante `next/font/google` con `display: 'swap'` y `preload: true`.
 *  2. Favicon SVG & Iconos Neón explícitos con cache-busting (?v=2).
 *  3. Inyección de datos estructurados Schema.org `LocalBusiness` mediante `<JsonLd />`.
 *  4. Inclusión de metadatos SEO dinámicos centralizados.
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
        {/* Favicon e Iconos de pestaña con cache-busting explícito */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=2" />
        <link rel="shortcut icon" href="/favicon.svg?v=2" />
        <link rel="apple-touch-icon" href="/favicon.svg?v=2" />

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
