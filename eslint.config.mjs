/**
 * ==============================================================================
 * Archivo: eslint.config.mjs
 * ==============================================================================
 * Descripción:
 *  Configuración ESLint (flat config) para AgenciAlquimia.
 *  Utiliza la configuración recomendada de Next.js (eslint-config-next)
 *  junto con TypeScript y reglas de React.
 * ==============================================================================
 */

import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: ['.next/**', '.next-prod/**', 'node_modules/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
];

export default eslintConfig;
