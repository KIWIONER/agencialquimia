import { describe, it, expect } from 'vitest';
import { mapFriendlyErrorMessage } from './visitor-session';

describe('visitor-session utilities', () => {
  it('mapea código 401 a mensaje de credenciales inválidas', () => {
    const msg = mapFriendlyErrorMessage(new Error('Unauthorized'), 401);
    expect(msg).toBe('Credenciales inválidas o sesión expirada.');
  });

  it('mapea código 404 a servicio no disponible', () => {
    const msg = mapFriendlyErrorMessage(new Error('Not found'), 404);
    expect(msg).toBe('Servicio temporalmente no disponible.');
  });

  it('mapea errores 500 a error técnico temporal', () => {
    const msg = mapFriendlyErrorMessage(new Error('Crash'), 500);
    expect(msg).toBe('Error técnico temporal en el servidor. Inténtalo de nuevo.');
  });

  it('extrae el mensaje de una instancia de Error genérica', () => {
    const customErr = new Error('Fallo personalizado de validación');
    const msg = mapFriendlyErrorMessage(customErr);
    expect(msg).toBe('Fallo personalizado de validación');
  });
});
