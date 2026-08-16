'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  Database,
  Workflow as WorkflowIcon,
  MessageSquare,
  Phone,
  Cpu,
  Wrench,
  History,
  X,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface ChatMsg {
  role: 'user' | 'ai' | 'system';
  text: string;
  time: string;
}

interface Execution {
  id: number;
  status: string;
  startedAt?: string | null;
  mode?: string | null;
}

interface WfInfo {
  name?: string;
  model?: string;
  tools?: string[];
}

const TELEFONO_MAX = '+34 657 738 334';
const HERRAMIENTAS = ['Consultar CRM', 'Conversaciones', 'Registrar Idea', 'Ejecutar Hunter'];

const fmtHora = (d: Date) =>
  d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

const fmtFecha = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) +
    ' · ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

export default function MaxChat() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'ai',
      text: 'Hola 👋 Soy Max, tu cerebro personal. Escríbeme y te responderé por WhatsApp con Gemini 2.5 Pro.',
      time: fmtHora(new Date()),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `panel_${Date.now()}`);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [wfInfo, setWfInfo] = useState<WfInfo>({});
  const [histLoading, setHistLoading] = useState(true);
  const [infoOpen, setInfoOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Cargar info del workflow (modelo) e historial de ejecuciones
  useEffect(() => {
    (async () => {
      try {
        const [wfRes, execRes] = await Promise.all([
          fetch('/api/admin/n8n/oPUXPaYa3DDCrLLc'),
          fetch('/api/admin/n8n/executions?workflowId=oPUXPaYa3DDCrLLc&limit=8'),
        ]);
        const wf = await wfRes.json();
        if (wf?.success && wf?.nodes) {
          const gemini = wf.nodes.find((n: { type?: string }) => n.type?.includes('lmChatGoogleGemini'));
          const tools = wf.nodes
            .filter((n: { type?: string }) => n.type?.includes('Tool'))
            .map((n: { name?: string }) => n.name)
            .filter(Boolean) as string[];
          setWfInfo({
            name: wf.name,
            model: gemini?.parameters?.modelName ?? 'Gemini 2.5 Pro',
            tools,
          });
        }
        const exec = await execRes.json();
        if (exec?.success) setExecutions(exec.executions ?? []);
      } catch {
        // silencioso: la info es decorativa
      } finally {
        setHistLoading(false);
      }
    })();
  }, []);

  // Auto-scroll al final
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const enviar = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMsg = { role: 'user', text: input.trim(), time: fmtHora(new Date()) };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatInput: userMsg.text, sessionId, viaWhatsapp: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Error');
      setMessages((prev) => [
        ...prev,
        {
          role: 'system',
          text: '📱 Mensaje entregado a Max — te responde por WhatsApp (Meta Cloud API).',
          time: fmtHora(new Date()),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'system',
          text: `⚠️ No se pudo entregar el mensaje: ${err instanceof Error ? err.message : 'desconocido'}`,
          time: fmtHora(new Date()),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const nuevaConversacion = () => {
    setMessages([
      {
        role: 'ai',
        text: 'Hola 👋 Soy Max, tu cerebro personal. Escríbeme y te responderé por WhatsApp con Gemini 2.5 Pro.',
        time: fmtHora(new Date()),
      },
    ]);
  };

  return (
    <div className="flex gap-4 h-[78vh] items-stretch">
      {/* ===== Columna de chat ===== */}
      <div className="flex-1 min-w-0 flex flex-col rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        {/* Cabecera */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Bot className="w-5 h-5 text-slate-950" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-sm leading-tight flex items-center gap-1.5">
                Max
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  CEREBRO PERSONAL
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 truncate">
                {wfInfo.name ?? 'MAX - Cerebro Personal WhatsApp'} · en línea
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              {wfInfo.model ?? 'Gemini 2.5 Pro'}
            </span>
            <button
              type="button"
              onClick={() => setInfoOpen((v) => !v)}
              className={`p-2 rounded-lg border text-xs font-bold transition-colors ${
                infoOpen
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Mostrar/ocultar panel de información"
            >
              {infoOpen ? <X size={14} /> : <History size={14} />}
            </button>
          </div>
        </div>

        {/* Mensajes */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-slate-950/40">
          {messages.map((m, i) =>
            m.role === 'system' ? (
              <div key={i} className="flex justify-center">
                <span className="px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-400">
                  {m.text}
                </span>
              </div>
            ) : (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-slate-950" />
                  </div>
                )}
                <div className={`max-w-[72%] ${m.role === 'user' ? 'text-right' : ''}`}>
                  <div
                    className={`inline-block text-left rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-br-md shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-md'
                    }`}
                  >
                    {m.text}
                  </div>
                  <p className="text-[10px] text-slate-600 mt-1 px-1">
                    {m.role === 'user' ? 'Tú' : 'Max'} · {m.time}
                  </p>
                </div>
                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-[11px] font-bold text-slate-300">M</span>
                  </div>
                )}
              </div>
            )
          )}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-slate-950" />
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1.5 items-center">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5">Max está procesando…</p>
              </div>
            </div>
          )}
        </div>

        {/* Entrada */}
        <div className="px-4 py-3.5 border-t border-slate-800 bg-slate-950/80">
          <form onSubmit={enviar} className="flex gap-2.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe un mensaje para Max… (responderá por WhatsApp)"
              disabled={loading}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-5 py-3 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </form>
          <p className="text-[10px] text-slate-600 mt-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Respuesta por WhatsApp a {TELEFONO_MAX} · Enter para enviar
          </p>
        </div>
      </div>

      {/* ===== Panel de información ===== */}
      {infoOpen && (
        <aside className="w-80 shrink-0 rounded-2xl bg-slate-900 border border-slate-800 overflow-y-auto">
          {/* Modelo */}
          <div className="p-4 border-b border-slate-800">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2 flex items-center gap-1">
              <Cpu className="w-3 h-3" /> Modelo de lenguaje
            </p>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-950/70 border border-emerald-500/30">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{wfInfo.model ?? 'Gemini 2.5 Pro'}</p>
                <p className="text-[11px] text-slate-500">Google · vía n8n LangChain</p>
              </div>
            </div>
            <div className="mt-3 space-y-1.5 text-[11px] text-slate-400">
              <p className="flex items-center gap-1.5"><WorkflowIcon className="w-3 h-3 text-slate-500" /> Workflow: {wfInfo.name ?? 'MAX - Cerebro Personal WhatsApp'}</p>
              <p className="flex items-center gap-1.5"><MessageSquare className="w-3 h-3 text-slate-500" /> Canal: WhatsApp · Meta Cloud API</p>
              <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-500" /> Número destino: {TELEFONO_MAX}</p>
              <p className="flex items-center gap-1.5"><Database className="w-3 h-3 text-slate-500" /> Memoria: PostgreSQL persistente</p>
            </div>
          </div>

          {/* Herramientas */}
          <div className="p-4 border-b border-slate-800">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2 flex items-center gap-1">
              <Wrench className="w-3 h-3" /> Herramientas de Max
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(wfInfo.tools?.length ? wfInfo.tools : HERRAMIENTAS).map((t) => (
                <span
                  key={t}
                  className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-300"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Historial de ejecuciones */}
          <div className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2 flex items-center gap-1">
              <History className="w-3 h-3" /> Historial de actividad
            </p>
            {histLoading ? (
              <div className="flex items-center gap-2 text-xs text-slate-500 py-3">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Cargando…
              </div>
            ) : executions.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">Sin actividad registrada.</p>
            ) : (
              <ul className="space-y-2">
                {executions.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-950/50 border border-slate-800"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200">#{e.id}</p>
                      <p className="text-[10px] text-slate-500 truncate">{fmtFecha(e.startedAt)}</p>
                    </div>
                    {e.status === 'success' ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> ÉXITO
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-red-400">
                        <XCircle className="w-3 h-3" /> ERROR
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <p className="text-[10px] text-slate-600 mt-3">
              Últimas ejecuciones del workflow en n8n · sesión {sessionId}
            </p>
          </div>
        </aside>
      )}
    </div>
  );
}
