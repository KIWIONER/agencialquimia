/**
 * ==============================================================================
 * Archivo: lib/visitor-session.ts
 * ==============================================================================
 * Descripción:
 *  Módulo de utilidades para gestión de sesiones de visitantes (Cookies HttpOnly)
 *  y el Patrón Reactivo de los 3 Estados (Data, Error, Loading) con try/catch/finally.
 * ==============================================================================
 */

import { cookies } from 'next/headers';

export const VISITOR_COOKIE_NAME = 'alquimia_visitor';

/**
 * Obtiene el identificador de sesión del visitante en Server Components de Next.js.
 * Extrae el valor firmado de la cookie HttpOnly 'alquimia_visitor'.
 */
export async function getVisitorSessionId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const visitorCookie = cookieStore.get(VISITOR_COOKIE_NAME);
    if (!visitorCookie || !visitorCookie.value) {
      return null;
    }
    // Extrae el valor antes del punto de firma HMAC
    const rawVal = visitorCookie.value;
    if (rawVal.includes('.')) {
      return rawVal.split('.')[0];
    }
    return rawVal;
  } catch {
    return null;
  }
}

/**
 * Estructura de estado estándar para peticiones en el Frontend (Guía Maestra React).
 */
export interface RequestState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

/**
 * Mapea códigos de estado HTTP o excepciones a mensajes amigables para el usuario.
 */
export function mapFriendlyErrorMessage(error: unknown, status?: number): string {
  if (typeof window !== 'undefined' && !navigator.onLine) {
    return 'Sin conexión a Internet. Comprueba tu red.';
  }

  if (status === 401) {
    return 'Credenciales inválidas o sesión expirada.';
  }

  if (status === 403) {
    return 'Acceso restringido. No tienes permisos para esta acción.';
  }

  if (status === 404) {
    return 'Servicio temporalmente no disponible.';
  }

  if (status && status >= 500) {
    return 'Error técnico temporal en el servidor. Inténtalo de nuevo.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ha ocurrido un error inesperado al procesar la solicitud.';
}
