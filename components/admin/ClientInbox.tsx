'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MessageSquare,
  Send,
  RefreshCw,
  Inbox as InboxIcon,
  Phone,
  CheckCheck,
  ChevronLeft,
  Loader2,
} from 'lucide-react';

interface Mensaje {
  id: number;
  telefono: string;
  direccion: 'in' | 'out';
  texto: string;
  tipo: string;
  media_id?: string | null;
  leido: boolean;
  created_at: string;
}

interface Conversacion {
  telefono: string;
  cliente_nombre?: string | null;
  lead_nombre?: string | null;
  no_leidos: string;
  ultimo_mensaje?: string | null;
  ultima_actividad: string;
}

const fmtHora = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

const fmtFechaCorta = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const hoy = new Date();
  const mismoDia = d.toDateString() === hoy.toDateString();
  if (mismoDia) return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
};

const fmtTelefono = (t: string) => (t.startsWith('+') ? t : `+${t}`);

export default function ClientInbox() {
  const [conversations, setConversations] = useState<Conversacion[]>([]);
  const [telefonoSel, setTelefonoSel] = useState<string | null>(null);
  const [messages, setMessages] = useState<Mensaje[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const cargarConversaciones = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/inbox', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data?.success) setConversations(data.conversations ?? []);
    } catch {
      /* silencioso */
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarHilo = useCallback(async (telefono: string) => {
    setTelefonoSel(telefono);
    setError(null);
    try {
      const res = await fetch(`/api/admin/inbox?telefono=${encodeURIComponent(telefono)}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        setMessages(data.messages ?? []);
        cargarConversaciones();
      }
    } catch {
      setError('No se pudo cargar la conversación');
    }
  }, [cargarConversaciones]);

  useEffect(() => {
    cargarConversaciones();
  }, [cargarConversaciones]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const enviar = async () => {
    const texto = input.trim();
    if (!texto || !telefonoSel || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefono: telefonoSel, texto }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message ?? 'Error enviando');
      setInput('');
      await cargarHilo(telefonoSel);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error enviando el mensaje');
    } finally {
      setSending(false);
    }
  };

  const refrescar = async () => {
    setRefreshing(true);
    if (telefonoSel) await cargarHilo(telefonoSel);
    await cargarConversaciones();
    setRefreshing(false);
  };

  const nombreConversacion = (c: Conversacion) =>
    c.cliente_nombre || c.lead_nombre || fmtTelefono(c.telefono);

  const nombreSeleccion = () => {
    const c = conversations.find((x) => x.telefono === telefonoSel);
    return nombreConversacion(c ?? { telefono: telefonoSel ?? '', cliente_nombre: null, lead_nombre: null, no_leidos: '0', ultima_actividad: '' });
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
      {/* Cabecera */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
            <InboxIcon className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Inbox de clientes</h3>
            <p className="text-[11px] text-slate-500">WhatsApp de la agencia · respuestas en tiempo real</p>
          </div>
        </div>
        <button
          onClick={refrescar}
          disabled={refreshing}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Refrescar"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] h-[540px]">
        {/* Lista de conversaciones */}
        <div className={`${telefonoSel ? 'hidden md:block' : ''} border-r border-slate-800 overflow-y-auto`}>
          {loading ? (
            <div className="flex items-center justify-center h-32 text-slate-500 text-xs">
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Cargando…
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center text-slate-600 text-xs space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto opacity-40" />
              <p>Sin conversaciones todavía.</p>
              <p className="text-slate-700">Cuando un cliente escriba al WhatsApp de la agencia, aparecerá aquí.</p>
            </div>
          ) : (
            conversations.map((c) => {
              const nombre = nombreConversacion(c);
              const noLeidos = Number(c.no_leidos ?? 0);
              return (
                <button
                  key={c.telefono}
                  onClick={() => cargarHilo(c.telefono)}
                  className={`w-full text-left px-3 py-3 border-b border-slate-800/60 hover:bg-slate-800/50 transition-colors ${
                    telefonoSel === c.telefono ? 'bg-slate-800/70' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-200 truncate">{nombre}</span>
                    {noLeidos > 0 && (
                      <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {noLeidos}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{c.ultimo_mensaje || '…'}</p>
                  <p className="text-[10px] text-slate-600 mt-1 flex items-center gap-1">
                    <Phone className="w-2.5 h-2.5" /> {fmtTelefono(c.telefono)}
                    <span className="ml-auto">{fmtFechaCorta(c.ultima_actividad)}</span>
                  </p>
                </button>
              );
            })
          )}
        </div>

        {/* Chat */}
        <div className="flex flex-col min-w-0">
          {!telefonoSel ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 p-6">
              <MessageSquare className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">Selecciona una conversación</p>
              <p className="text-xs mt-1">o espera a que un cliente escriba al WhatsApp de la agencia.</p>
            </div>
          ) : (
            <>
              {/* Cabecera del hilo */}
              <div className="px-4 py-2.5 border-b border-slate-800 flex items-center gap-3">
                <button
                  onClick={() => setTelefonoSel(null)}
                  className="md:hidden p-1 text-slate-400 hover:text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-300">
                  {(nombreSeleccion() || '?').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{nombreSeleccion()}</p>
                  <p className="text-[11px] text-slate-500">{fmtTelefono(telefonoSel)}</p>
                </div>
              </div>

              {/* Mensajes */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-slate-950/40">
                {messages.length === 0 && (
                  <p className="text-center text-slate-600 text-xs py-8">
                    Sin mensajes aún. Escribe al cliente para iniciar la conversación.
                  </p>
                )}
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.direccion === 'out' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow ${
                        m.direccion === 'out'
                          ? 'bg-emerald-600 text-white rounded-br-md'
                          : 'bg-slate-800 text-slate-200 rounded-bl-md'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.texto}</p>
                      <p className={`text-[10px] mt-1 flex items-center gap-1 ${m.direccion === 'out' ? 'text-emerald-200/80' : 'text-slate-500'}`}>
                        {fmtHora(m.created_at)}
                        {m.direccion === 'out' && <CheckCheck className="w-3 h-3" />}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Error */}
              {error && (
                <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20 text-red-400 text-xs">
                  {error}
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && enviar()}
                    placeholder="Escribe un mensaje para el cliente…"
                    disabled={sending}
                    className="flex-1 bg-slate-800/70 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-50"
                  />
                  <button
                    onClick={enviar}
                    disabled={sending || !input.trim()}
                    className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
                    title="Enviar por WhatsApp"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-600 mt-1.5 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> El mensaje sale por el WhatsApp de la agencia (+34 614 68 97 19)
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
