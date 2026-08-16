/**
 * ==============================================================================
 * Componente: WorkflowDiagram.tsx
 * ==============================================================================
 * Descripción:
 *  Renderiza el diagrama de un workflow de n8n: nodos (caja con nombre y tipo)
 *  y conexiones (flechas) a partir del JSON de la API de n8n.
 *
 *  Interactividad:
 *  - Las tarjetas (nodos) se pueden ARRASTRAR con el ratón para recolocarlas
 *    dentro del panel (estado local, sin persistir en n8n).
 * ==============================================================================
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Bot, Webhook, Zap, BrainCircuit, GitBranch, MessageSquare, Database, Move, Save, RotateCcw, RefreshCw, X } from 'lucide-react';

interface NodeItem {
  id: string;
  name: string;
  type: string;
  position?: [number, number];
  parameters?: Record<string, unknown>;
  credentials?: Record<string, unknown>;
}

interface ConnectionItem {
  [sourceNode: string]: {
    main?: Array<Array<{ node: string }>>;
  };
}

export interface WorkflowDiagramProps {
  id: string;
  name: string;
  nodes: NodeItem[];
  connections: ConnectionItem;
  onBack: () => void;
}

/** Etiqueta humana del tipo de nodo n8n */
function nodeLabel(type: string): string {
  const base = type.split('.').pop() ?? type;
  return base.replace(/[_-]/g, ' ');
}

/** Clasificación visual del nodo */
function nodeKind(type: string): 'trigger' | 'ai' | 'http' | 'if' | 'channel' | 'data' | 'other' {
  if (type.includes('webhook') || type.endsWith('.trigger') || type.includes('Trigger') || type.includes('schedule')) return 'trigger';
  if (type.includes('ai_') || type.includes('openAi') || type.includes('langchain') || type.includes('n8n-nodes-langchain')) return 'ai';
  if (type.includes('http') || type.includes('n8n-nodes-base.webhook')) return 'http';
  if (type.includes('.if') || type.includes('switch')) return 'if';
  if (type.includes('telegram') || type.includes('whatsapp') || type.includes('slack') || type.includes('discord') || type.includes('email')) return 'channel';
  if (type.includes('database') || type.includes('postgres') || type.includes('supabase') || type.includes('mysql') || type.includes('sheet')) return 'data';
  return 'other';
}

const kindStyles: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  trigger: { bg: 'bg-sky-950/60', border: 'border-sky-500/40', text: 'text-sky-300', icon: 'text-sky-400' },
  ai: { bg: 'bg-emerald-950/60', border: 'border-emerald-500/40', text: 'text-emerald-300', icon: 'text-emerald-400' },
  http: { bg: 'bg-violet-950/60', border: 'border-violet-500/40', text: 'text-violet-300', icon: 'text-violet-400' },
  if: { bg: 'bg-amber-950/60', border: 'border-amber-500/40', text: 'text-amber-300', icon: 'text-amber-400' },
  channel: { bg: 'bg-pink-950/60', border: 'border-pink-500/40', text: 'text-pink-300', icon: 'text-pink-400' },
  data: { bg: 'bg-blue-950/60', border: 'border-blue-500/40', text: 'text-blue-300', icon: 'text-blue-400' },
  other: { bg: 'bg-slate-900', border: 'border-slate-700', text: 'text-slate-300', icon: 'text-slate-400' },
};

function NodeIcon({ kind }: { kind: string }) {
  const size = 16;
  switch (kind) {
    case 'trigger': return <Zap size={size} />;
    case 'ai': return <BrainCircuit size={size} />;
    case 'http': return <Webhook size={size} />;
    case 'if': return <GitBranch size={size} />;
    case 'channel': return <MessageSquare size={size} />;
    case 'data': return <Database size={size} />;
    default: return <Bot size={size} />;
  }
}

const NODE_W = 190;
const NODE_H = 52;

export function WorkflowDiagram({ id, name, nodes, connections, onBack }: WorkflowDiagramProps) {
  // Posiciones locales (editables con drag); se inicializan desde n8n
  const originalPos: Record<string, [number, number]> = Object.fromEntries(
    nodes.map((n) => [n.id, (n.position ?? [0, 0]) as [number, number]])
  );
  const [nodePos, setNodePos] = useState<Record<string, [number, number]>>(() => originalPos);
  const [baseline, setBaseline] = useState<Record<string, [number, number]>>(originalPos);
  const [dragging, setDragging] = useState<string | null>(null);
  const [selected, setSelected] = useState<NodeItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [view, setView] = useState({ w: 860, h: 500 });

  // Medir el contenedor para ajustar la escala y que todo quepa sin scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setView({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const dragRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);

  // ¿Hay cambios sin guardar respecto a la última línea base?
  const dirty = nodes.some((n) => {
    const o = baseline[n.id];
    const c = nodePos[n.id];
    return !o || !c || o[0] !== c[0] || o[1] !== c[1];
  });

  const savePositions = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch(`/api/admin/n8n/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positions: nodePos }),
      });
      const json = await res.json();
      if (json.success) {
        setSaveMsg(`Guardado en n8n ✓ (${json.saved} nodos)`);
        setBaseline(nodePos);
      } else {
        setSaveMsg(`Error: ${json.error ?? 'no se pudo guardar'}`);
      }
    } catch {
      setSaveMsg('Error de red al guardar');
    } finally {
      setSaving(false);
    }
  };

  const resetPositions = () => {
    setNodePos(baseline);
    setSaveMsg(null);
  };

  if (nodes.length === 0) {
    return <p className="text-slate-400 text-sm p-4">Este workflow no tiene nodos.</p>;
  }

  // Replicación 1:1 de las posiciones originales de n8n (sin escalado).
  // El lienzo se dimensiona según los límites del workflow y el contenedor hace scroll.
  const PAD = 60;
  const positions = nodes.map((n) => nodePos[n.id] ?? [0, 0]);
  const minX = Math.min(...positions.map((p) => p[0]));
  const minY = Math.min(...positions.map((p) => p[1]));
  const maxX = Math.max(...positions.map((p) => p[0]));
  const maxY = Math.max(...positions.map((p) => p[1]));
  const canvasW = Math.max(maxX - minX + NODE_W + PAD * 2, 600);
  const canvasH = Math.max(maxY - minY + NODE_H + PAD * 2, 420);

  // Escala de ajuste: uniforme, mantiene las posiciones relativas 1:1 de n8n,
  // y reduce el conjunto (tarjetas incluidas) para que quepa en el panel.
  const fitScale = Math.min(1, (view.w - 16) / canvasW, (view.h - 16) / canvasH);

  const byName = new Map(nodes.map((n) => [n.name, n]));

  // Aristas (source -> target)
  const edges: Array<[string, string]> = [];
  for (const [src, conns] of Object.entries(connections)) {
    for (const list of Object.values(conns)) {
      for (const group of list ?? []) {
        for (const link of group ?? []) {
          if (link.node) edges.push([src, link.node]);
        }
      }
    }
  }

  // Traslación: las coordenadas originales (pueden ser negativas) se desplazan al lienzo
  const toCanvas = (p: [number, number]): [number, number] => [p[0] - minX + PAD, p[1] - minY + PAD];

  // --- Drag & drop ----------------------------------------------------------
  const onPointerDown = (e: React.PointerEvent, node: NodeItem) => {
    const nodeEl = e.currentTarget as HTMLElement;
    nodeEl.setPointerCapture(e.pointerId);
    const orig = nodePos[node.id] ?? [0, 0];
    dragRef.current = { id: node.id, startX: e.clientX, startY: e.clientY, origX: orig[0], origY: orig[1] };
    setDragging(node.id);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    // Escala 1:1 → el desplazamiento en píxeles equivale a unidades de lienzo
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    setNodePos((prev) => ({ ...prev, [drag.id]: [drag.origX + dx, drag.origY + dy] }));
  };

  const onPointerUp = () => {
    dragRef.current = null;
    setDragging(null);
  };

  // Mostrar el detalle (parámetros) de un nodo al hacer click
  const openNode = (n: NodeItem) => {
    if (!dragRef.current) setSelected(n);
  };

  /** Renderiza el valor de un parámetro de forma legible */
  const renderParamValue = (v: unknown): string => {
    if (v === null || v === undefined) return '—';
    if (typeof v === 'object') return JSON.stringify(v, null, 1);
    if (typeof v === 'boolean') return v ? 'true' : 'false';
    return String(v);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft size={15} />
          Volver
        </button>
        <h3 className="text-lg font-bold text-white truncate">{name}</h3>
        <span className="text-xs text-slate-500">{nodes.length} nodos · {edges.length} conexiones</span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 rounded-full px-2.5 py-1">
          <Move size={12} />
          Arrastra las tarjetas para moverlas
        </span>
        <div className="flex items-center gap-2">
          {saveMsg && (
            <span className={`text-xs max-w-[220px] truncate ${saveMsg.startsWith('Guardado') ? 'text-emerald-400' : 'text-red-400'}`}>{saveMsg}</span>
          )}
          {dirty && (
            <button
              type="button"
              onClick={resetPositions}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              <RotateCcw size={14} />
              Restablecer
            </button>
          )}
          <button
            type="button"
            onClick={() => void savePositions()}
            disabled={!dirty || saving}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              dirty ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            Guardar
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-3 min-h-0">
      <div ref={containerRef} className="relative flex-1 min-h-[420px] rounded-xl bg-slate-950/70 border border-slate-800 overflow-hidden select-none">
        <div className="relative" style={{ width: canvasW * fitScale, height: canvasH * fitScale }}>
          <div className="absolute top-0 left-0 origin-top-left" style={{ transform: `scale(${fitScale})`, width: canvasW, height: canvasH }}>
        {/* Líneas de conexión */}
        <svg className="absolute inset-0 pointer-events-none" width={canvasW} height={canvasH}>
          {edges.map(([src, tgt], i) => {
            const s = byName.get(src);
            const t = byName.get(tgt);
            if (!s || !t) return null;
            const [x1, y1] = toCanvas(nodePos[s.id] ?? [0, 0]);
            const [x2, y2] = toCanvas(nodePos[t.id] ?? [0, 0]);
            const sx = x1 + NODE_W;
            const sy = y1 + NODE_H / 2;
            const tx = x2;
            const ty = y2 + NODE_H / 2;
            const mx = (sx + tx) / 2;
            return (
              <g key={i}>
                <path d={`M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ty}, ${tx} ${ty}`} fill="none" stroke="#10b98166" strokeWidth="2" />
                <circle cx={tx} cy={ty} r="3.5" fill="#34d399" />
              </g>
            );
          })}
        </svg>

        {/* Nodos */}
        {nodes.map((n) => {
          const kind = nodeKind(n.type);
          const style = kindStyles[kind];
          const [x, y] = toCanvas(nodePos[n.id] ?? [0, 0]);
          const isDragging = dragging === n.id;
          return (
            <div
              key={n.id}
              onPointerDown={(e) => onPointerDown(e, n)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onClick={() => openNode(n)}
              className={`absolute flex items-center gap-2.5 px-3 py-2 rounded-xl border shadow-lg cursor-grab active:cursor-grabbing touch-none ${
                isDragging ? 'ring-2 ring-emerald-400/60 z-10 opacity-95' : 'hover:border-emerald-400/60'
              } ${selected?.id === n.id ? 'ring-2 ring-emerald-400/60' : ''} ${style.bg} ${style.border}`}
              style={{ left: x, top: y, width: NODE_W, minHeight: NODE_H }}
              title={`${n.type} — arrastra para mover`}
            >
              <span className={`shrink-0 ${style.icon}`}>
                <NodeIcon kind={kind} />
              </span>
              <div className="min-w-0">
                <p className={`text-xs font-bold truncate ${style.text}`}>{n.name}</p>
                <p className="text-[10px] text-slate-500 truncate capitalize">{nodeLabel(n.type)}</p>
              </div>
            </div>
          );
        })}
          </div>
        </div>
      </div>

      {/* Panel de detalle del nodo seleccionado */}
      {selected && (
        <aside className="w-80 shrink-0 rounded-xl bg-slate-900 border border-slate-800 overflow-y-auto p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-white truncate">{selected.name}</h4>
              <p className="text-[11px] text-slate-500 font-mono truncate">{selected.type}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="shrink-0 p-1 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
              aria-label="Cerrar detalle"
            >
              <X size={14} />
            </button>
          </div>

          {selected.credentials && Object.keys(selected.credentials).length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Credencial</p>
              <p className="text-xs text-amber-300">{Object.values(selected.credentials).join(' · ')}</p>
            </div>
          )}

          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">Parámetros</p>
          {selected.parameters && Object.keys(selected.parameters).length > 0 ? (
            <div className="space-y-2.5">
              {Object.entries(selected.parameters).map(([k, v]) => (
                <div key={k}>
                  <p className="text-[11px] font-semibold text-slate-400 capitalize">{k.replace(/[_.]/g, ' ')}</p>
                  {typeof v === 'object' && v !== null ? (
                    <pre className="mt-0.5 text-[10px] text-emerald-300/90 bg-slate-950/70 border border-slate-800 rounded-lg p-2 overflow-x-auto whitespace-pre-wrap break-words">
                      {renderParamValue(v)}
                    </pre>
                  ) : (
                    <p className="text-xs text-slate-200 mt-0.5 break-words">{renderParamValue(v)}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Sin parámetros.</p>
          )}
        </aside>
      )}
      </div>
    </div>
  );
}
