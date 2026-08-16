/**
 * ==============================================================================
 * Archivo: vitest.config.ts
 * ==============================================================================
 * Descripción:
 *  Configuración de Vitest para AgenciAlquimia: entorno jsdom (DOM simulado)
 *  para tests de componentes React y soporte de TypeScript nativo.
 * ==============================================================================
 */

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
});
