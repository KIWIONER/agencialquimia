/**
 * ==============================================================================
 * Archivo: components/Hero.test.tsx
 * ==============================================================================
 * Descripción:
 *  Smoke test del componente Hero: verifica que la sección principal se
 *  renderiza con su titular y llamada a la acción (CTA).
 * ==============================================================================
 */

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Hero from './Hero';

describe('Hero', () => {
  it('renderiza la sección principal con su titular', () => {
    render(<Hero />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getAllByText(/24\/7/i).length).toBeGreaterThanOrEqual(1);
  });

  it('incluye los botones de llamada a la acción (CTA)', () => {
    render(<Hero />);

    expect(screen.getAllByRole('link').length).toBeGreaterThanOrEqual(2);
  });
});
