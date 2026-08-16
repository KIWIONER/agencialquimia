'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Inbox,
  PhoneCall,
  CalendarClock,
  CheckCircle2,
  FileSignature,
  Phone,
  Mail,
  Copy,
  ChevronRight,
  ChevronLeft,
  X,
  RefreshCw,
} from 'lucide-react';

interface LeadRow {
  id: number;
  created_at?: string | null;
  updated_at?: string | null;
  cliente_nombre?: string | null;
  cliente_correo?: string | null;
  cliente_telefono?: string | null;
  fecha_cita?: string | null;
  empresa?: string | null;
  sector?: string | null;
  problema?: string | null;
  etapa?: string | null;
  etapa_actualizada_en?: string | null;
}

const ETAPAS: Array<{
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  border: string;
  text: string;
  dot: string;
}> = [
  { key: 'nuevo', label: 'Nuevos', icon: <Inbox size={15} />, color: 'bg-slate-800/80 border-slate-700', border: 'border-slate-600/60', text: 'text-slate-200', dot: 'bg-slate-400' },
  { key: 'contactado', label: 'Contactados', icon: <PhoneCall size={15} />, color: 'bg-blue-950/60 border-blue-900', border: 'border-blue-500/40', text: 'text-blue-300', dot: 'bg-blue-400' },
  { key: 'llamada', label: 'Llamada agendada', icon: <CalendarClock size={15} />, color: 'bg-amber-950/50 border-amber-900', border: 'border-amber-500/40', text: 'text-amber-300', dot: 'bg-amber-400' },
  { key: 'aceptado', label: 'Aceptación', icon: <CheckCircle2 size={15} />, color: 'bg-violet-950/50 border-violet-900', border: 'border-violet-500/40', text: 'text-violet-300', dot: 'bg-violet-400' },
  { key: 'contrato', label: 'Contrato', icon: <FileSignature size={15} />, color: 'bg-emerald-950/50 border-emerald-900', border: 'border-emerald-500/40', text: 'text-emerald-300', dot: 'bg-emerald-400' },
];

const fmtFecha = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};

const telHref = (t?: string | null) => {
  if (!t) return '#';
  const digits = String(t).replace(/\D/g, '');
  return `tel:+${digits.startsWith('34') ? '' : '34'}${digits}`;
};

export default function LeadPipeline() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<LeadRow | null>(null);
  const [dragging, setDragging] = useState<LeadRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/data?table=leads_agencialquimia');
      const json = await res.json();
      if (!json.success) throw new Error(json.message ?? 'No se pudieron cargar los leads');
      setLeads(json.data ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const moverEtapa = async (lead: LeadRow, etapa: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etapa }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? 'Error al actualizar');
      // actualización optimista
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, etapa } : l)));
      setSelected((s) => (s?.id === lead.id ? { ...s, etapa } : s));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al actualizar');
    } finally {
      setSaving(false);
      setDragging(null);
    }
  };

  const porEtapa = useMemo(() => {
    const map: Record<string, LeadRow[]> = {};
    for (const e of ETAPAS) map[e.key] = [];
    for (const l of leads) {
      const k = ETAPAS.some((e) => e.key === l.etapa) ? l.etapa! : 'nuevo';
      map[k].push(l);
    }
    return map;
  }, [leads]);

  const copiarTelefono = (t: string | null | undefined) => {
    if (!t) return;
    navigator.clipboard.writeText(String(t)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 p-12 text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin" /> Cargando pipeline...
      </div>
    );
  }

  return (
    <div className="flex gap-4 items-start">
      {/* Tablero kanban */}
      <div className="flex-1 grid grid-cols-5 gap-3 min-w-0">
        {ETAPAS.map((etapa) => {
          const items = porEtapa[etapa.key] ?? [];
          const over = dragging && dragging.etapa !== etapa.key;
          return (
            <div
              key={etapa.key}
              data-etapa={etapa.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragging && dragging.etapa !== etapa.key) moverEtapa(dragging, etapa.key);
              }}
              className={`flex flex-col rounded-2xl border min-h-[280px] transition-colors ${etapa.color} ${
                over ? 'ring-2 ring-emerald-400/60' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-1 px-3 py-2.5 border-b border-white/5">
                <div className={`flex items-center gap-1.5 font-bold text-xs ${etapa.text}`}>
                  {etapa.icon}
                  <span className="truncate">{etapa.label}</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-black/30 text-slate-300">
                  {items.length}
                </span>
              </div>

              <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[480px]">
                {items.length === 0 && (
                  <p className="text-[10px] text-slate-500 text-center py-6">Vacío</p>
                )}
                {items.map((lead) => (
                  <div
                    key={lead.id}
                    data-lead-id={lead.id}
                    draggable
                    onDragStart={() => setDragging(lead)}
                    onDragEnd={() => setDragging(null)}
                    onClick={() => setSelected(lead)}
                    className={`cursor-grab active:cursor-grabbing rounded-xl bg-slate-900/95 border p-3 shadow-lg hover:border-emerald-400/50 transition-colors ${
                      selected?.id === lead.id ? 'ring-2 ring-emerald-400/60' : 'border-slate-700'
                    }`}
                  >
                    <p className="text-sm font-bold text-white truncate">{lead.cliente_nombre || '(sin nombre)'}</p>
                    <div className="mt-1 space-y-0.5 text-[11px] text-slate-400">
                      {lead.cliente_telefono && (
                        <p className="font-mono truncate">{lead.cliente_telefono}</p>
                      )}
                      {lead.fecha_cita && (
                        <p className="truncate text-amber-300/90">📅 {lead.fecha_cita}</p>
                      )}
                    </div>
                    <p className="mt-1.5 text-[10px] text-slate-500">
                      {fmtFecha(lead.created_at)}
                      {lead.empresa ? ` · ${lead.empresa}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Panel de detalle del lead seleccionado */}
      {selected && (
        <aside className="w-72 shrink-0 rounded-2xl bg-slate-900 border border-slate-800 p-4 sticky top-0">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h4 className="text-sm font-bold text-white break-words">{selected.cliente_nombre || '(sin nombre)'}</h4>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="shrink-0 p-1 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
              aria-label="Cerrar detalle"
            >
              <X size={14} />
            </button>
          </div>

          {/* Acciones rápidas */}
          <div className="flex gap-1.5 mb-3">
            <a
              href={telHref(selected.cliente_telefono)}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold hover:bg-emerald-500/25 transition-colors"
            >
              <Phone size={13} /> Llamar
            </a>
            <button
              type="button"
              onClick={() => copiarTelefono(selected.cliente_telefono)}
              className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors"
            >
              <Copy size={13} /> {copied ? '✓' : 'Copiar'}
            </button>
          </div>

          <div className="space-y-1.5 text-xs">
            {selected.cliente_correo && (
              <p className="text-slate-300 break-all">
                <Mail size={12} className="inline mr-1 text-slate-500" />
                {selected.cliente_correo}
              </p>
            )}
            {selected.fecha_cita && (
              <p className="text-amber-300">📅 Cita: {selected.fecha_cita}</p>
            )}
            {selected.empresa && <p className="text-slate-300">🏢 {selected.empresa}</p>}
            {selected.sector && <p className="text-slate-300">🏷️ {selected.sector}</p>}
            {selected.problema && (
              <p className="text-slate-400 break-words">💬 {selected.problema}</p>
            )}
            <p className="text-slate-500">🕒 Recibido: {fmtFecha(selected.created_at)}</p>
            {selected.etapa_actualizada_en && (
              <p className="text-slate-500">Última etapa: {fmtFecha(selected.etapa_actualizada_en)}</p>
            )}
          </div>

          {/* Navegación de etapa */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                const idx = ETAPAS.findIndex((e) => e.key === (selected.etapa ?? 'nuevo'));
                if (idx > 0) moverEtapa(selected, ETAPAS[idx - 1].key);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={13} /> Atrás
            </button>
            <span className="text-[11px] text-slate-400 capitalize">
              {ETAPAS.find((e) => e.key === (selected.etapa ?? 'nuevo'))?.label ?? selected.etapa}
            </span>
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                const idx = ETAPAS.findIndex((e) => e.key === (selected.etapa ?? 'nuevo'));
                if (idx < ETAPAS.length - 1) moverEtapa(selected, ETAPAS[idx + 1].key);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold hover:bg-emerald-500/25 disabled:opacity-40 transition-colors"
            >
              Avanzar <ChevronRight size={13} />
            </button>
          </div>
          {saving && <p className="mt-2 text-[10px] text-slate-500">Guardando...</p>}
        </aside>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-xl bg-red-950 border border-red-500/40 text-red-300 text-sm p-3 shadow-2xl">
          {error}
        </div>
      )}
    </div>
  );
}
