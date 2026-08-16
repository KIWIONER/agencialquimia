/**
 * ==============================================================================
 * Componente: N8nWorkflows.tsx
 * ==============================================================================
 * Descripción:
 *  Panel de workflows de n8n en tiempo real para el admin: lista los flujos con
 *  su estado (activo/inactivo), conteos, botón de refresco y acceso directo a
 *  cerebro.agencialquimia.com en pestaña nueva.
 * ==============================================================================
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { Workflow, RefreshCw, ExternalLink, Bot, AlertCircle } from 'lucide-react';

interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
}

interface N8nState {
  workflows: N8nWorkflow[];
  total: number;
  activeCount: number;
  error?: string;
}

export function N8nWorkflows() {
  const [state, setState] = useState<N8nState>({ workflows: [], total: 0, activeCount: 0 });
  const [loading, setLoading] = useState(true);

  const fetchWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/n8n', { cache: 'no-store' });
      const json = await res.json();
      if (json.success) {
        setState({
          workflows: json.workflows ?? [],
          total: json.total ?? 0,
          activeCount: json.activeCount ?? 0,
        });
      } else {
        setState((prev) => ({ ...prev, error: json.error ?? 'Error desconocido' }));
      }
    } catch {
      setState((prev) => ({ ...prev, error: 'No se pudo conectar con la API de n8n' }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchWorkflows();
  }, [fetchWorkflows]);

  return (
    <section className="h-[78vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
      {/* Cabecera */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Workflow className="w-5 h-5 text-emerald-400" />
            <span>n8n — Workflows en tiempo real</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            {loading ? 'Consultando cerebro.agencialquimia.com…' : `${state.activeCount} activos de ${state.total} workflows`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void fetchWorkflows()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refrescar
          </button>
          <a
            href="https://cerebro.agencialquimia.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir n8n
          </a>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="flex-1 overflow-y-auto p-4">
        {state.error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-sm mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {state.error}
          </div>
        )}

        {!loading && !state.error && state.workflows.length === 0 && (
          <p className="text-slate-400 text-sm p-4">No hay workflows.</p>
        )}

        <ul className="space-y-2">
          {state.workflows.map((w) => (
            <li
              key={w.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/30 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Bot className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-200 text-sm font-medium truncate">{w.name}</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
                  w.active
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-700 text-slate-400 border border-slate-600/50'
                }`}
              >
                {w.active ? '● Activo' : '○ Inactivo'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
