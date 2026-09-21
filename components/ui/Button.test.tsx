import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renderiza el texto del botón correctamente', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('aplica la variante por defecto (primary)', () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-emerald-700');
  });

  it('aplica variante secundary y danger', () => {
    const { rerender } = render(<Button variant="secondary">Secundario</Button>);
    expect(screen.getByRole('button').className).toContain('bg-stone-100');

    rerender(<Button variant="danger">Eliminar</Button>);
    expect(screen.getByRole('button').className).toContain('bg-rose-50');
  });

  it('deshabilita el botón cuando disabled es true', () => {
    render(<Button disabled>Deshabilitado</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('muestra el estado de carga (loading) y deshabilita la interacción', () => {
    render(<Button loading>Cargando</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
