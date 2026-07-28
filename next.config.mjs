/**
 * ==============================================================================
 * Archivo: next.config.mjs
 * ==============================================================================
 * Descripción:
 *  Configuración principal de Next.js App Router para AgenciAlquimia.
 * 
 * Optimización WPO & Producción:
 *  1. Compresión Brotli/Gzip activa (`compress: true`).
 *  2. Remoción automática de `console.log` en builds de producción.
 *  3. Modo estricto de React habilitado.
 * ==============================================================================
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
