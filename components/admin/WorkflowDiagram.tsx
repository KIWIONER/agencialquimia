/**
 * ==============================================================================
 * Componente: WorkflowDiagram.tsx
 * ==============================================================================
 * Descripción:
 *  Renderiza el diagrama de un workflow de n8n: nodos (caja con nombre y tipo)
 *  y conexiones (flechas) a partir del JSON de la API de n8n. Cada nodo se
 *  coloca según su posición original, escalada para caber en el panel.
 * ==============================================================================
 */

'use client';

import { ArrowLeft, Workflow, Bot, Webhook, Zap, Mail, Phone, CalendarDays, GitBranch, Filter, BrainCircuit, Database, MessageSquare } from 'lucide-react';

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

export function WorkflowDiagram({ name, nodes, connections, onBack }: WorkflowDiagramProps) {
  if (nodes.length === 0) {
    return <p className="text-slate-400 text-sm p-4">Este workflow no tiene nodos.</p>;
  }

  // Escalar posiciones para que quepan en el panel (ancho objetivo ~860px)
  const positions = nodes.map((n) => n.position ?? [0, 0]);
  const minX = Math.min(...positions.map((p) => p[0]));
  const minY = Math.min(...positions.map((p) => p[1]));
  const maxX = Math.max(...positions.map((p) => p[0]));
  const maxY = Math.max(...positions.map((p) => p[1]));
  const scaleX = 860 / Math.max(maxX - minX + 320, 400);
  const scaleY = 520 / Math.max(maxY - minY + 200, 300);
  const scale = Math.min(scaleX, scaleY, 1.4);
  const byName = new Map(nodes.map((n) => [n.name, n]));

  // Colección de aristas (source -> target)
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

  const scaled = (p: [number, number]): [number, number] => [
    30 + (p[0] - minX) * scale,
    40 + (p[1] - minY) * scale,
  ];

  const NODE_W = 190;
  const NODE_H = 52;

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
      </div>

      <div className="relative flex-1 min-h-[420px] rounded-xl bg-slate-950/70 border border-slate-800 overflow-auto">
        {/* Líneas de conexión */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" width="100%" height="100%">
          {edges.map(([src, tgt], i) => {
            const s = byName.get(src);
            const t = byName.get(tgt);
            if (!s || !t) return null;
            const [x1, y1] = scaled(s.position ?? [0, 0]);
            const [x2, y2] = scaled(t.position ?? [0, 0]);
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
          const [x, y] = scaled(n.position ?? [0, 0]);
          return (
            <div
              key={n.id}
              className={`absolute flex items-center gap-2.5 px-3 py-2 rounded-xl border ${style.bg} ${style.border} shadow-lg`}
              style={{ left: x, top: y, width: NODE_W, minHeight: NODE_H }}
              title={n.type}
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
  );
}
