/**
 * ==============================================================================
 * Archivo: components/admin/DashboardSummary.tsx
 * ==============================================================================
 * Descripción:
 *  Resumen General del Panel Administrativo de AgenciAlquimia.
 *  Rediseñado en Tema Claro Satinado (SaaS Modern Light) según image.png:
 *  incorporación de MetricCard, refresco dinámico de datos y accesos rápidos.
 * ==============================================================================
 */

import { useCallback, useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { MetricCard } from './ui/MetricCard';

export type AdminTab = 'dashboard' | 'prospectos' | 'tables' | 'n8n' | 'inbox' | 'hunter' | 'trainer' | 'settings' | 'marketing';

interface SummaryData {
  leads: { total: number; nuevo: number; ganado: number; en_proceso: number };
  hunter: { total: number; pendiente: number; ganado: number };
  objetivos: { total: number; con_email: number; con_telefono: number; con_coords: number };
  queries: { total: number; activas: number };
  inbox: { conversaciones: number; total: number; no_leidos: number };
  tablas: { publicas: number; total_filas: number };
}

export interface DashboardSummaryProps {
  onNavigate: (tab: AdminTab) => void;
}

export function DashboardSummary({ onNavigate }: DashboardSummaryProps) {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/summary');
      if (!res.ok) {
        throw new Error(`Error de servidor (HTTP ${res.status})`);
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al consultar el resumen');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return (
    <div className="space-y-6 text-stone-800">
      {/* Cabecera con estado + refresh */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-stone-200/90 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-sm">
            📊
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900 leading-tight">Monitoreo Operativo de AgenciAlquimia</h2>
            <p className="text-xs text-stone-600 font-medium mt-0.5">Resumen general del panel — datos en vivo en PostgreSQL y Supabase</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!loading && data && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              Sincronizado
            </span>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchSummary}
            loading={loading}
            icon="🔄"
          >
            Actualizar resumen
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 shadow-sm">
          <span>⚠️ Error al cargar el resumen: {error}</span>
        </div>
      )}

      {/* Grid Principal de 6 Tarjetas Métricas (Según image.png) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        <MetricCard
          icon="👥"
          colorScheme="emerald"
          title="Prospectos (Leads)"
          subtitle="leads_agencialquimia"
          metrics={[
            { label: 'Total', value: data?.leads.total ?? '—' },
            { label: 'Nuevos', value: data?.leads.nuevo ?? '—' },
            { label: 'Ganados', value: data?.leads.ganado ?? '—', highlight: true },
          ]}
          actionLabel="Abrir sección →"
          onAction={() => onNavigate('prospectos')}
        />

        <MetricCard
          icon="🗄️"
          colorScheme="sky"
          title="Tablas Supabase"
          subtitle="Explorador de BD Cloud"
          metrics={[
            { label: 'Tablas públicas', value: data?.tablas.publicas ?? '11' },
            { label: 'Leads', value: data?.leads.total ?? '—' },
            { label: 'Objetivos radar', value: data?.objetivos.total ?? '—' },
          ]}
          actionLabel="Abrir sección →"
          onAction={() => onNavigate('tables')}
        />

        <MetricCard
          icon="⚙️"
          colorScheme="amber"
          title="Workflows n8n"
          subtitle="Cerebro de automatización"
          metrics={[
            { label: 'Total flujos', value: '31' },
            { label: 'Activos', value: '11', highlight: true },
          ]}
          actionLabel="Abrir sección →"
          onAction={() => onNavigate('n8n')}
        />

        <MetricCard
          icon="💬"
          colorScheme="sky"
          title="Clientes (Inbox)"
          subtitle="Mensajes WhatsApp"
          metrics={[
            { label: 'Conversaciones', value: data?.inbox.conversaciones ?? '—' },
            { label: 'Mensajes totales', value: data?.inbox.total ?? '—' },
            { label: 'No leídos', value: data?.inbox.no_leidos ?? '—', highlight: true },
          ]}
          actionLabel="Abrir sección →"
          onAction={() => onNavigate('inbox')}
        />

        <MetricCard
          icon="🎯"
          colorScheme="amber"
          title="Hunter (Radar)"
          subtitle="objetivos_agencia + leads_hunter"
          metrics={[
            { label: 'Objetivos', value: data?.objetivos.total ?? '—' },
            { label: 'Con email', value: data?.objetivos.con_email ?? '—' },
            { label: 'Con teléfono', value: data?.objetivos.con_telefono ?? '—' },
          ]}
          actionLabel="Abrir sección →"
          onAction={() => onNavigate('hunter')}
        />

        <MetricCard
          icon="🤖"
          colorScheme="violet"
          title="IA Trainer"
          subtitle="Chat con Max (Gemini)"
          metrics={[
            { label: 'Leads cazados', value: data?.hunter.total ?? '—' },
            { label: 'En caza', value: data?.hunter.pendiente ?? '—' },
            { label: 'Ganados', value: data?.hunter.ganado ?? '—', highlight: true },
          ]}
          actionLabel="Abrir sección →"
          onAction={() => onNavigate('trainer')}
        />
      </div>

      {/* Fila extra de micro-métricas del radar */}
      {data && !loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm space-y-1">
            <div className="flex items-center gap-2 text-xs text-stone-600 font-bold uppercase tracking-wider">
              <span>📡</span>
              <span>Queries radar</span>
            </div>
            <p className="text-2xl font-extrabold text-stone-900 tabular-nums">
              {data.queries.activas}
              <span className="text-xs font-semibold text-stone-500 ml-1.5">/ {data.queries.total} activas</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm space-y-1">
            <div className="flex items-center gap-2 text-xs text-stone-600 font-bold uppercase tracking-wider">
              <span>📍</span>
              <span>Geolocalizados</span>
            </div>
            <p className="text-2xl font-extrabold text-stone-900 tabular-nums">
              {data.objetivos.con_coords}
              <span className="text-xs font-semibold text-stone-500 ml-1.5">/ {data.objetivos.total}</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm space-y-1">
            <div className="flex items-center gap-2 text-xs text-stone-600 font-bold uppercase tracking-wider">
              <span>✉️</span>
              <span>Con email</span>
            </div>
            <p className="text-2xl font-extrabold text-stone-900 tabular-nums">
              {data.objetivos.con_email}
              <span className="text-xs font-semibold text-stone-500 ml-1.5">/ {data.objetivos.total}</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm space-y-1">
            <div className="flex items-center gap-2 text-xs text-stone-600 font-bold uppercase tracking-wider">
              <span>📬</span>
              <span>Sin leer</span>
            </div>
            <p className={`text-2xl font-extrabold tabular-nums ${data.inbox.no_leidos > 0 ? 'text-rose-700' : 'text-stone-900'}`}>
              {data.inbox.no_leidos}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
