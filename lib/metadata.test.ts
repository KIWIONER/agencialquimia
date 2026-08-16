/**
 * ==============================================================================
 * Archivo: lib/metadata.test.ts
 * ==============================================================================
 * Descripción:
 *  Tests unitarios de la utilidad SEO `constructMetadata` de AgenciAlquimia.
 * ==============================================================================
 */

import { describe, expect, it } from 'vitest';
import { constructMetadata } from './metadata';

describe('constructMetadata (SEO)', () => {
  it('devuelve los metadatos por defecto del sitio', () => {
    const metadata = constructMetadata();

    expect(metadata.title).toBeDefined();
    expect(metadata.description).toBeDefined();
    expect(metadata.metadataBase?.toString()).toContain('agencialquimia.com');
    expect(metadata.openGraph?.url).toContain('agencialquimia.com');
  });

  it('permite sobrescribir el título con una página concreta', () => {
    const metadata = constructMetadata({ title: 'Panel Admin' });

    expect(String(metadata.title)).toContain('Panel Admin');
  });

  it('incluye la imagen Open Graph por defecto', () => {
    const metadata = constructMetadata();

    expect(metadata.openGraph?.images).toBeDefined();
  });

  it('compone el canonical y la URL OG con el path indicado', () => {
    const metadata = constructMetadata({ path: '/admin' });

    expect(metadata.alternates?.canonical).toBe('/admin');
    expect(metadata.openGraph?.url).toBe('https://agencialquimia.com/admin');
  });
});
