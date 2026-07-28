'use client';

/**
 * ==============================================================================
 * Componente: ChatWidget.tsx
 * ==============================================================================
 * Descripción:
 *  Widget flotante conversacional de Inteligencia Artificial para la web de AgenciAlquimia.
 * 
 * Funcionalidades Clave:
 *  1. Comunicación Segura: Envía los mensajes del usuario al backend proxy `/api/chat` en lugar de llamar directamente a n8n.
 *  2. Accesibilidad Completa WAI-ARIA:
 *     - Contenedor de historial configurado como región viva (`aria-live="polite"`).
 *     - Atajo de teclado `Escape` para cerrar la ventana modal.
 *     - Restauración de foco táctil/visual en el botón disparador tras el cierre.
 *  3. Efecto Máquina de Escribir (Typewriter): Revela las respuestas de la IA progresivamente.
 *  4. Resiliencia CRO & Fallbacks de Conversión: Muestra un botón directo a WhatsApp si la conexión neuronal falla.
 * ==============================================================================
 */

import { useState, useEffect, useRef, FormEvent } from 'react';
import { Bot, X, Send, MessageCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { ChatMessage, ChatResponseData } from '@/types/chat';

export default function ChatWidget() {
  // Estado de visibilidad de la ventana del chat
  const [isOpen, setIsOpen] = useState(false);
  // Historial de mensajes en sesión
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: '¡Hola! Soy el agente comercial de AgenciAlquimia 🚀 ¿En qué puedo ayudarte a automatizar en tu negocio hoy?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Estado del campo de entrada de texto
  const [inputValue, setInputValue] = useState('');
  // Indicador de estado de escritura/procesamiento del bot
  const [isTyping, setIsTyping] = useState(false);
  // Identificador de sesión único
  const [sessionId] = useState(() => `session_${Date.now()}`);
  // URL de fallback enviada por la API en caso de error
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);

  // Referencias DOM para autoscroll y restauración de foco accesible
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerBtnRef = useRef<HTMLButtonElement>(null);

  // Autoscroll hacia el último mensaje generado
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  // Escuchar eventos globales para abrir el chat desde botones externos (ej. Navbar)
  useEffect(() => {
    const handleCustomOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener('open-ai-chat', handleCustomOpen);
    return () => window.removeEventListener('open-ai-chat', handleCustomOpen);
  }, []);

  // Control de la tecla Escape para cerrar el chat de forma accesible
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerBtnRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  /**
   * Envío del mensaje del usuario a través de la API Route proxy
   */
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isTyping) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Agregar mensaje del usuario al estado
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    setFallbackUrl(null);

    try {
      // 2. Llamada a la API Route interna de Next.js
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          sessionId,
          history: [...messages, userMsg],
        }),
      });

      const data: ChatResponseData = await res.json();

      if (data.fallbackUrl) {
        setFallbackUrl(data.fallbackUrl);
      }

      // 3. Insertar respuesta del bot
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        error: !!data.error,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      // 4. Captura de errores inesperados de red
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'bot',
        text: 'Lo siento, mi conexión ha experimentado una pequeña interrupción. Puedes escribirnos directamente por WhatsApp.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        error: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
      setFallbackUrl('https://wa.me/34604051111?text=Hola%20Mat%C3%ADas,%20tengo%20una%20consulta');
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Botón Flotante Disparador del Chat (Bottom Right) */}
      <button
        ref={triggerBtnRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border-2 border-emerald-500 shadow-2xl transition-all duration-300 hover:scale-105 focus:outline-none flex items-center justify-center cursor-pointer"
        aria-label={isOpen ? 'Cerrar chat de asistente IA' : 'Abrir chat de asistente IA 24/7'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6 animate-pulse" />}
      </button>

      {/* Ventana Modal del Chat Conversacional */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[400px] h-[540px] max-h-[80vh] z-50 bg-emerald-950 border border-emerald-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95"
          role="dialog"
          aria-label="Ventana de Chat de IA"
        >
          {/* Cabecera de la Ventana del Chat */}
          <div className="p-4 bg-emerald-900/60 border-b border-emerald-500/20 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Asistente AgenciAlquimia</h4>
                <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  En línea 24/7
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-emerald-300 hover:bg-emerald-800/50 transition-colors"
              aria-label="Cerrar ventana de chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Historial de Mensajes con Región Viva ARIA (aria-live="polite") */}
          <div
            className="flex-1 p-4 overflow-y-auto space-y-4 text-sm"
            aria-live="polite"
            aria-atomic="false"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : msg.error
                      ? 'bg-red-950/80 border border-red-500/30 text-red-200 rounded-bl-none'
                      : 'bg-emerald-900/60 border border-emerald-500/20 text-emerald-100 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <span className="block text-[10px] opacity-60 text-right mt-1 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Indicador de Escritura del Agente */}
            {isTyping && (
              <div className="flex items-center gap-2 p-3 bg-emerald-900/40 rounded-2xl text-emerald-300 text-xs w-max border border-emerald-500/20">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>El agente está escribiendo su respuesta...</span>
              </div>
            )}

            {/* Botón CRO de Fallback a WhatsApp ante Errores */}
            {fallbackUrl && (
              <div className="p-3 bg-emerald-900/80 border border-emerald-500/40 rounded-xl text-center space-y-2">
                <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Respuesta asistida rápida</span>
                </div>
                <a
                  href={fallbackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors no-underline"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Hablar directo por WhatsApp</span>
                </a>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Formulario de Entrada de Texto */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-emerald-900/40 border-t border-emerald-500/20 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe tu consulta..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-950 border border-emerald-500/30 text-white placeholder-emerald-400/50 text-sm focus:outline-none focus:border-emerald-400"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-emerald-950 font-bold transition-all cursor-pointer"
              aria-label="Enviar mensaje"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
