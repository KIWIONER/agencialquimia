/**
 * ==============================================================================
 * Archivo: types/chat.ts
 * ==============================================================================
 * Descripción:
 *  Contratos e interfaces de TypeScript para el módulo conversacional de IA en AgenciAlquimia.
 * 
 * Propósito:
 *  Garantizar el tipado estricto en la comunicación entre el frontend de React (ChatWidget),
 *  el servidor backend proxy de Next.js (API Route /api/chat) y la respuesta del webhook de n8n.
 * ==============================================================================
 */

/**
 * Representa la entidad individual de un mensaje dentro del historial de la conversación.
 */
export interface ChatMessage {
  /** Identificador único para renderizado de claves en React (ej. ID autogenerado o timestamp) */
  id: string;
  /** Emisor del mensaje: 'user' (cliente), 'bot' (agente comercial IA) o 'system' (avisos) */
  sender: 'user' | 'bot' | 'system';
  /** Contenido textual del mensaje */
  text: string;
  /** Marca temporal en formato legible de hora (ej. "14:32") */
  timestamp: string;
  /** Indica si el mensaje representa un estado de error de conexión */
  error?: boolean;
}

/**
 * Estructura de la petición enviada desde el cliente frontend hacia el endpoint backend `/api/chat`.
 */
export interface ChatRequestPayload {
  /** Mensaje de texto ingresado por el usuario */
  message: string;
  /** Identificador único de sesión para mantener contexto en el flujo conversacional de n8n */
  sessionId?: string;
  /** Historial previo de mensajes de la sesión para dar contexto continuo al agente */
  history?: ChatMessage[];
}

/**
 * Estructura de la respuesta devuelta por el servidor `/api/chat` al cliente.
 */
export interface ChatResponseData {
  /** Respuesta textual generada por el agente comercial de IA */
  response: string;
  /** Identificador de sesión persistido o actualizado */
  sessionId?: string;
  /** Mensaje descriptivo de error en caso de fallo HTTP o timeout del webhook */
  error?: string;
  /** Enlace directo de respaldo (WhatsApp/Calendly) si el webhook de IA no está disponible */
  fallbackUrl?: string;
}
