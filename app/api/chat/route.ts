/**
 * ==============================================================================
 * Archivo: app/api/chat/route.ts
 * ==============================================================================
 * Descripción:
 *  API Route de Next.js (Server Side) que actúa como proxy seguro entre la web pública
 *  y el webhook del agente comercial alojado en n8n (cerebro.agencialquimia.com).
 * 
 * Beneficios de Seguridad & Arquitectura:
 *  1. Ocultación de Directivas de Sistema: Inyecta las instrucciones de comportamiento
 *     del bot en el servidor, evitando manipulación (Prompt Injection).
 *  2. Ocultación de Endpoints Privados: La URL real del webhook de n8n no se expone al navegador.
 *  3. Rate Limiting por IP: Previene abuso y consumo descontrolado de tokens de IA.
 *  4. Resiliencia & Timeout: Cancela peticiones colgadas tras 8 segundos y devuelve un enlace
 *     de fallback a WhatsApp de manera limpia.
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { ChatRequestPayload, ChatResponseData } from '@/types/chat';

/** URL interna del webhook del agente comercial en n8n (parametrizada vía process.env) */
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://cerebro.agencialquimia.com/webhook/v1/agente/consulta';

/** Enlace directo de respaldo hacia WhatsApp en caso de indisponibilidad del servidor de IA */
const WHATSAPP_FALLBACK_URL =
  'https://wa.me/34604051111?text=Hola%20Mat%C3%ADas,%20estoy%20interesado%20en%20los%20servicios%20de%20AgenciAlquimia';

/** Rate limiter in-memory (máximo 15 mensajes por minuto por IP) */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 15;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count += 1;
  return false;
}

/**
 * Manejador HTTP POST para procesar las consultas del chat
 */
export async function POST(req: NextRequest) {
  try {
    // Control de Rate Limiting por IP
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
    if (isRateLimited(clientIp)) {
      return NextResponse.json<ChatResponseData>(
        {
          response: 'Has enviado demasiados mensajes en poco tiempo. Por favor, espera un momento o contáctanos por WhatsApp.',
          error: 'TOO_MANY_REQUESTS',
          fallbackUrl: WHATSAPP_FALLBACK_URL,
        },
        { status: 429 }
      );
    }

    // Extracción del cuerpo JSON recibido desde el componente ChatWidget
    const body: ChatRequestPayload = await req.json();
    const { message, sessionId, history = [] } = body;

    // Validación de entrada obligatoria
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json<ChatResponseData>(
        {
          response: 'Por favor, ingresa un mensaje válido.',
          error: 'BAD_REQUEST',
        },
        { status: 400 }
      );
    }

    // Inyección de directivas de sistema seguras en la primera interacción
    const isFirstMessage = history.length <= 1;
    const formattedPrompt = isFirstMessage
      ? `[SISTEMA: Guía amablemente al cliente a reservar una sesión estratégica o llamada de 15 minutos en AgenciAlquimia.] ${message}`
      : message;

    // Controlador de tiempo límite (AbortController) con timeout de 8 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      // Petición HTTP POST enviada hacia el webhook de n8n en el servidor
      const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatInput: formattedPrompt,
          sessionId: sessionId || `session_${Date.now()}`,
          clientTimestamp: new Date().toISOString(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Verificación de estado HTTP devuelto por el servidor de n8n
      if (!n8nResponse.ok) {
        throw new Error(`Servidor n8n devolvió código ${n8nResponse.status}`);
      }

      // Decodificación de la respuesta enviada por la IA
      const data = await n8nResponse.json();
      const botMessage =
        data.output || data.response || data.text || 'Gracias por tu consulta. ¿En qué más puedo ayudarte?';

      return NextResponse.json<ChatResponseData>({
        response: botMessage,
        sessionId: sessionId || `session_${Date.now()}`,
      });
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);

      // Distinguir entre timeout abortado y error de red
      const isAbort = fetchError instanceof Error && fetchError.name === 'AbortError';

      console.warn(
        `[Proxy IA Warning] ${isAbort ? 'Timeout de 8s alcanzado' : 'Fallo de conexión'} al conectar con n8n.`
      );

      // Respuesta resiliente de fallback enviada al cliente
      return NextResponse.json<ChatResponseData>({
        response:
          'Mi conexión neuronal está experimentando alta demanda en este momento. Puedes agendar directamente o hablar con nuestro equipo por WhatsApp.',
        error: isAbort ? 'TIMEOUT' : 'SERVICE_UNAVAILABLE',
        fallbackUrl: WHATSAPP_FALLBACK_URL,
      });
    }
  } catch (error: unknown) {
    console.error('[Proxy IA Server Error]:', error);
    return NextResponse.json<ChatResponseData>(
      {
        response: 'Ocurrió un error inesperado al procesar la solicitud.',
        error: 'INTERNAL_SERVER_ERROR',
        fallbackUrl: WHATSAPP_FALLBACK_URL,
      },
      { status: 500 }
    );
  }
}
