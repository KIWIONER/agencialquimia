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
  // Directorio de build separado: el dev server (3000) usa .next y el de producción .next-prod,
  // para que no se pisen entre sí (causa de chunks corruptos / ChunkLoadError).
  distDir: process.env.NEXT_DIST_DIR === 'prod' ? '.next-prod' : '.next',
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
