'use client';

/**
 * ==============================================================================
 * Archivo: components/admin/DashboardSummary.tsx
 * ==============================================================================
 * Descripción:
 *  Panel resumen del dashboard administrativo. Muestra una tarjeta por cada
 *  sección del panel (Prospectos, Tablas Supabase, Workflows n8n, Clientes,
 *  Hunter, IA Trainer) con métricas reales consolidadas por la API
 *  `/api/admin/summary`. Cada tarjeta es clicable y navega a su pestaña.
 * ==============================================================================
 */

import { useCallback, useEffect, useState } from 'react';
import {
  Users,
  Database,
  Workflow,
  MessageSquare,
  Crosshair,
  Bot,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  Circle,
  Mail,
  Phone,
  MapPin,
  Activity,
  Inbox,
} from 'lucide-react';

export type AdminTab = 'dashboard' | 'leads' | 'supabase' | 'n8n' | 'trainer' | 'inbox' | 'hunter' | 'settings';

interface SummaryData {
  leads: { total: number; nuevo: number; contactado: number; en_conversacion: number; ganado: number; descartado: number };
  hunter: { total: number; pendiente: number; contactado: number; en_conversacion: number; ganado: number; descartado: number };
  objetivos: { total: number; con_email: number; con_telefono: number; con_coords: number };
  queries: { total: number; activas: number };
  inbox: { total: number; no_leidos: number; conversaciones: number };
  tablas: { total: number };
  workflows: { total: number | null; activos: number | null };
}

interface DashboardSummaryProps {
  onNavigate: (tab: AdminTab) => void;
}

interface SectionCard {
  tab: AdminTab;
  title: string;
  subtitle: string;
  icon: typeof Users;
  accent: string;
  chipBg: string;
  iconBg: string;
  metrics: { label: string; value: string | number; icon?: typeof Users; highlight?: boolean }[];
}

function MiniStat({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon?: typeof Users;
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-950/70 border border-slate-800/60 px-2.5 py-1.5">
      <span className="flex items-center gap-1.5 text-[11px] text-slate-400 min-w-0">
        {Icon && <Icon className="w-3 h-3 shrink-0 text-slate-500" />}
        <span className="truncate">{label}</span>
      </span>
      <span className={`text-sm font-bold font-mono tabular-nums shrink-0 ${highlight ? 'text-emerald-400' : 'text-white'}`}>
        {value}
      </span>
    </div>
  );
}

export function DashboardSummary({ onNavigate }: DashboardSummaryProps) {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/summary', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message ?? 'Error al cargar el resumen');
      setData(json as SummaryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const cards: SectionCard[] = [
    {
      tab: 'leads',
      title: 'Prospectos (Leads)',
      subtitle: 'leads_agencialquimia',
      icon: Users,
      accent: 'text-emerald-400',
      chipBg: 'bg-emerald-500/10 border-emerald-500/25',
      iconBg: 'bg-emerald-500/15 text-emerald-400',
      metrics: [
        { label: 'Total', value: data?.leads.total ?? '—' },
        { label: 'Nuevos', value: data?.leads.nuevo ?? '—' },
        { label: 'Ganados', value: data?.leads.ganado ?? '—', highlight: true },
      ],
    },
    {
      tab: 'supabase',
      title: 'Tablas Supabase',
      subtitle: 'Explorador de BD',
      icon: Database,
      accent: 'text-sky-400',
      chipBg: 'bg-sky-500/10 border-sky-500/25',
      iconBg: 'bg-sky-500/15 text-sky-400',
      metrics: [
        { label: 'Tablas públicas', value: data?.tablas.total ?? '—' },
        { label: 'Leads', value: data?.leads.total ?? '—' },
        { label: 'Objetivos radar', value: data?.objetivos.total ?? '—' },
      ],
    },
    {
      tab: 'n8n',
      title: 'Workflows n8n',
      subtitle: 'Cerebro de automatización',
      icon: Workflow,
      accent: 'text-violet-400',
      chipBg: 'bg-violet-500/10 border-violet-500/25',
      iconBg: 'bg-violet-500/15 text-violet-400',
      metrics: [
        {
          label: 'Total',
          value: data?.workflows.total !== null && data?.workflows.total !== undefined ? data.workflows.total : '—',
        },
        {
          label: 'Activos',
          value: data?.workflows.activos !== null && data?.workflows.activos !== undefined ? data.workflows.activos : '—',
          highlight: true,
        },
      ],
    },
    {
      tab: 'inbox',
      title: 'Clientes (Inbox)',
      subtitle: 'Mensajes WhatsApp',
      icon: MessageSquare,
      accent: 'text-blue-400',
      chipBg: 'bg-blue-500/10 border-blue-500/25',
      iconBg: 'bg-blue-500/15 text-blue-400',
      metrics: [
        { label: 'Conversaciones', value: data?.inbox.conversaciones ?? '—' },
        { label: 'Mensajes totales', value: data?.inbox.total ?? '—' },
        { label: 'No leídos', value: data?.inbox.no_leidos ?? '—', highlight: true },
      ],
    },
    {
      tab: 'hunter',
      title: 'Hunter (Radar)',
      subtitle: 'objetivos_agencia + leads_hunter',
      icon: Crosshair,
      accent: 'text-amber-400',
      chipBg: 'bg-amber-500/10 border-amber-500/25',
      iconBg: 'bg-amber-500/15 text-amber-400',
      metrics: [
        { label: 'Objetivos', value: data?.objetivos.total ?? '—' },
        { label: 'Con email', value: data?.objetivos.con_email ?? '—', icon: Mail },
        { label: 'Con teléfono', value: data?.objetivos.con_telefono ?? '—', icon: Phone },
      ],
    },
    {
      tab: 'trainer',
      title: 'IA Trainer',
      subtitle: 'Chat con Max (Gemini)',
      icon: Bot,
      accent: 'text-fuchsia-400',
      chipBg: 'bg-fuchsia-500/10 border-fuchsia-500/25',
      iconBg: 'bg-fuchsia-500/15 text-fuchsia-400',
      metrics: [
        { label: 'Leads cazados', value: data?.hunter.total ?? '—' },
        { label: 'En caza', value: data?.hunter.pendiente ?? '—' },
        { label: 'Ganados', value: data?.hunter.ganado ?? '—', highlight: true },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Cabecera con estado + refresh */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">Resumen general del panel — datos en vivo</span>
          {!loading && data && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium ml-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Sincronizado
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={fetchSummary}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Actualizar resumen</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <span>⚠️ Error al cargar el resumen: {error}</span>
        </div>
      )}

      {loading && !data ? (
        <div className="py-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-400">Consultando métricas de todas las secciones...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.tab}
                type="button"
                onClick={() => onNavigate(card.tab)}
                className="group text-left p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900/80 transition-all cursor-pointer shadow-sm hover:shadow-emerald-500/5 hover:shadow-lg"
              >
                {/* Cabecera de la tarjeta */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl ${card.iconBg} shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className={`text-sm font-bold ${card.accent} truncate`}>{card.title}</h3>
                      <p className="text-[11px] text-slate-500 truncate font-mono">{card.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                </div>

                {/* Métricas */}
                <div className="mt-4 space-y-2">
                  {card.metrics.map((m) => (
                    <MiniStat key={m.label} icon={m.icon} label={m.label} value={m.value} highlight={m.highlight} />
                  ))}
                </div>

                {/* Acceso directo */}
                <div className="mt-4 pt-3 border-t border-slate-800/70 flex items-center gap-1.5 text-[11px] text-slate-500 group-hover:text-emerald-400 transition-colors">
                  <span>Abrir sección</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Fila extra de micro-métricas del radar (si hay datos) */}
      {data && !loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-[11px] text-slate-400 uppercase font-bold tracking-wider">
              <Crosshair className="w-3.5 h-3.5 text-amber-400" />
              Queries radar
            </div>
            <p className="mt-2 text-2xl font-extrabold text-white tabular-nums">
              {data.queries.activas}
              <span className="text-sm font-semibold text-slate-500 ml-1.5">/ {data.queries.total} activas</span>
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-[11px] text-slate-400 uppercase font-bold tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              Objetivos geolocalizados
            </div>
            <p className="mt-2 text-2xl font-extrabold text-white tabular-nums">
              {data.objetivos.con_coords}
              <span className="text-sm font-semibold text-slate-500 ml-1.5">/ {data.objetivos.total}</span>
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-[11px] text-slate-400 uppercase font-bold tracking-wider">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              Objetivos con email
            </div>
            <p className="mt-2 text-2xl font-extrabold text-white tabular-nums">
              {data.objetivos.con_email}
              <span className="text-sm font-semibold text-slate-500 ml-1.5">/ {data.objetivos.total}</span>
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-[11px] text-slate-400 uppercase font-bold tracking-wider">
              <Inbox className="w-3.5 h-3.5 text-blue-400" />
              Mensajes no leídos
            </div>
            <p className={`mt-2 text-2xl font-extrabold tabular-nums ${data.inbox.no_leidos > 0 ? 'text-rose-400' : 'text-white'}`}>
              {data.inbox.no_leidos}
            </p>
            {data.inbox.no_leidos > 0 && (
              <p className="mt-1 text-[11px] text-rose-400/80 flex items-center gap-1">
                <Circle className="w-2 h-2 fill-rose-400" />
                Hay mensajes sin leer
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
