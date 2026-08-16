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

import { useRef, useState } from 'react';
import { ArrowLeft, Bot, Webhook, Zap, BrainCircuit, GitBranch, MessageSquare, Database, Move } from 'lucide-react';

interface NodeItem {
  id: string;
  name: string;
  type: string;
  position?: [number, number];
}

interface ConnectionItem {
  [sourceNode: string]: {
    main?: Array<Array<{ node: string }>>;
  };
}

export interface WorkflowDiagramProps {
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

export function WorkflowDiagram({ name, nodes, connections, onBack }: WorkflowDiagramProps) {
  // Posiciones locales (editables con drag); se inicializan desde n8n
  const [nodePos, setNodePos] = useState<Record<string, [number, number]>>(() =>
    Object.fromEntries(nodes.map((n) => [n.id, n.position ?? [0, 0]]))
  );
  const [dragging, setDragging] = useState<string | null>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);

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
      </div>

      <div className="relative flex-1 min-h-[420px] rounded-xl bg-slate-950/70 border border-slate-800 overflow-auto select-none">
        <div className="relative" style={{ width: canvasW, height: canvasH }}>
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
              className={`absolute flex items-center gap-2.5 px-3 py-2 rounded-xl border shadow-lg cursor-grab active:cursor-grabbing touch-none ${
                isDragging ? 'ring-2 ring-emerald-400/60 z-10 opacity-95' : 'hover:border-emerald-400/60'
              } ${style.bg} ${style.border}`}
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
  );
}
