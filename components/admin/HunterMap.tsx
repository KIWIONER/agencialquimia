'use client';

/**
 * Radar Hunter — mapa de negocios + botón de activación.
 *
 * - Botón "🎯 Activar Radar": lanza el workflow n8n hunterops-alquimia
 *   (webhook hunter-ops). Los leads nuevos se geocodifican y aparecen.
 * - Mapa (Leaflet + OpenStreetMap, sin API key): cada lead cazado con
 *   coordenadas se pinta con su estado; al hacer clic, detalle (empresa,
 *   señal detectada, url, feedback).
 * - Botón "📍 Geolocalizar pendientes": geocodifica (Nominatim) los leads
 *   sin lat/lon para que salgan en el mapa.
 */

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Lead {
  id: string;
  empresa: string;
  nicho: string | null;
  email: string | null;
  telefono: string | null;
  senal_detectada: string | null;
  estado_caza: string | null;
  feedback_cliente: string | null;
  url_web: string | null;
  lat: number | null;
  lon: number | null;
  created_at: string;
}

interface Objetivo {
  id: number;
  negocio: string;
  fallo_detectado: string | null;
  potencial_venta: string | null;
  url: string | null;
  sector: string | null;
  lat: number | null;
  lon: number | null;
  created_at: string;
}

interface RadarQuery {
  id: string;
  query: string;
  sector: string | null;
  activo: boolean;
  plataforma: string[] | null;
  geo: string | null;
}

const ESTADO_COLOR: Record<string, string> = {
  pendiente: '#f59e0b',
  contactado: '#3b82f6',
  'en conversacion': '#10b981',
  ganado: '#22c55e',
  descartado: '#ef4444',
};

function estadoColor(estado: string | null): string {
  return ESTADO_COLOR[estado?.toLowerCase() ?? ''] ?? '#94a3b8';
}

function estadoLabel(estado: string | null): string {
  if (!estado) return 'sin estado';
  return estado.charAt(0).toUpperCase() + estado.slice(1);
}

export function HunterMap() {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [queries, setQueries] = useState<RadarQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [radarLoading, setRadarLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch('/api/admin/hunter');
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message ?? 'Error al cargar el radar');
      }
      const data = await res.json();
      setLeads(data.leads ?? []);
      setObjetivos(data.objetivos ?? []);
      setQueries(data.queries ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el radar');
    } finally {
      setLoading(false);
    }
  };

  // Inicializar el mapa una sola vez
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: true }).setView([40.4637, -3.7492], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Repintar marcadores cuando cambian los leads/objetivos
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const withCoords = leads.filter((l) => l.lat != null && l.lon != null);
    for (const lead of withCoords) {
      const color = estadoColor(lead.estado_caza);
      const icon = L.divIcon({
        className: 'hunter-marker',
        html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.5);"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      const marker = L.marker([lead.lat!, lead.lon!], { icon }).addTo(map);
      const url = lead.url_web ? `<a href="${lead.url_web}" target="_blank" rel="noopener noreferrer">web</a>` : 'sin web';
      marker.bindPopup(
        `<div style="font-family:system-ui;font-size:12px;max-width:280px">
          <strong style="font-size:13px">${lead.empresa}</strong><br/>
          <span style="color:#64748b">Estado: ${estadoLabel(lead.estado_caza)}</span><br/>
          ${lead.nicho ? `<span style="color:#64748b">Nicho: ${lead.nicho}</span><br/>` : ''}
          ${lead.senal_detectada ? `<span style="color:#64748b">Señal: ${lead.senal_detectada.slice(0, 120)}…</span><br/>` : ''}
          ${url}
        </div>`
      );
      markersRef.current.push(marker);
    }

    // Objetivos (negocios diana reales del radar) — marcador morado más grande
    const objetivosConCoords = objetivos.filter((o) => o.lat != null && o.lon != null);
    for (const obj of objetivosConCoords) {
      const icon = L.divIcon({
        className: 'hunter-marker',
        html: `<div style="width:24px;height:24px;border-radius:50%;background:#8b5cf6;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;font-size:11px;color:#fff;">🎯</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      const marker = L.marker([obj.lat!, obj.lon!], { icon }).addTo(map);
      const url = obj.url ? `<a href="${obj.url}" target="_blank" rel="noopener noreferrer">web</a>` : 'sin web';
      marker.bindPopup(
        `<div style="font-family:system-ui;font-size:12px;max-width:280px">
          <strong style="font-size:13px">🎯 ${obj.negocio}</strong><br/>
          ${obj.sector ? `<span style="color:#64748b">Sector: ${obj.sector}</span><br/>` : ''}
          ${obj.fallo_detectado ? `<span style="color:#64748b">Fallo: ${obj.fallo_detectado.slice(0, 120)}…</span><br/>` : ''}
          ${obj.potencial_venta ? `<span style="color:#64748b">Potencial: ${obj.potencial_venta.slice(0, 80)}…</span><br/>` : ''}
          ${url}
        </div>`
      );
      markersRef.current.push(marker);
    }

    // Auto-zoom si hay coordenadas
    const allWithCoords: Array<[number, number]> = [
      ...withCoords.map((l) => [l.lat!, l.lon!] as [number, number]),
      ...objetivosConCoords.map((o) => [o.lat!, o.lon!] as [number, number]),
    ];
    if (allWithCoords.length > 0) {
      const bounds = L.latLngBounds(allWithCoords);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    } else {
      map.setView([40.4637, -3.7492], 6);
    }
  }, [leads, objetivos, queries]);

  const activateRadar = async () => {
    setRadarLoading(true);
    setStatus(null);
    setError(null);
    try {
      const res = await fetch('/api/admin/hunter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'radar' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Error al lanzar el radar');
      setStatus(data.message ?? 'Radar lanzado');
      // Refrescar tras un rato (el workflow tarda en generar leads)
      setTimeout(load, 15000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al lanzar el radar');
    } finally {
      setRadarLoading(false);
    }
  };

  const geocodePending = async () => {
    setGeocoding(true);
    setStatus(null);
    setError(null);
    try {
      const res = await fetch('/api/admin/hunter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'geocode' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Error al geolocalizar');
      setStatus(
        data.geocoded
          ? `📍 ${data.geocoded} negocio(s) geolocalizados. ${data.failed ? data.failed + ' sin coincidencia.' : ''}`
          : (data.message ?? 'Sin leads pendientes de geolocalizar.')
      );
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al geolocalizar');
    } finally {
      setGeocoding(false);
    }
  };

  const pendientes = leads.filter((l) => l.lat == null || l.lon == null).length +
    objetivos.filter((o) => o.lat == null || o.lon == null).length;
  const localizados = leads.filter((l) => l.lat != null && l.lon != null).length +
    objetivos.filter((o) => o.lat != null && o.lon != null).length;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span>Radar Hunter</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {leads.length} leads cazados · {objetivos.length} objetivos · {localizados} en el mapa ·{' '}
            {queries.length} queries activas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={geocodePending}
            disabled={geocoding || pendientes === 0}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-slate-200 border border-slate-700 transition-colors"
          >
            {geocoding ? '📍 Geocodificando…' : `📍 Geolocalizar pendientes (${pendientes})`}
          </button>
          <button
            type="button"
            onClick={activateRadar}
            disabled={radarLoading}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold text-white transition-colors shadow-lg shadow-emerald-600/20"
          >
            {radarLoading ? 'Lanzando…' : '🎯 Activar Radar'}
          </button>
        </div>
      </div>

      {status && (
        <div className="px-4 py-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-sm">
          ✅ {status}
        </div>
      )}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Mapa */}
        <div className="xl:col-span-2 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
          <div ref={containerRef} className="h-[480px] w-full" />
          {loading && (
            <div className="h-[480px] flex items-center justify-center text-slate-400 text-sm">
              Cargando mapa…
            </div>
          )}
        </div>

        {/* Lista lateral */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden flex flex-col max-h-[480px]">
          <div className="px-4 py-3 border-b border-slate-800 text-sm font-bold text-white flex items-center justify-between">
            <span>Negocios en el radar</span>
            <span className="text-xs text-slate-400 font-normal">{leads.length}</span>
          </div>
          <div className="overflow-y-auto divide-y divide-slate-800/60">
            {leads.length === 0 && objetivos.length === 0 && !loading && (
              <p className="p-4 text-sm text-slate-500">
                Sin leads aún. Activa el radar para empezar a cazar negocios.
              </p>
            )}
            {objetivos.map((o) => (
              <div key={`obj-${o.id}`} className="px-4 py-3 hover:bg-slate-800/40 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-100 leading-snug">🎯 {o.negocio}</p>
                  {o.sector && (
                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300">
                      {o.sector}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                  <span>{o.lat != null && o.lon != null ? '📍 en mapa' : '📍 sin ubicación'}</span>
                  {o.url && (
                    <a href={o.url} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
                      web ↗
                    </a>
                  )}
                  <span>{new Date(o.created_at).toLocaleDateString('es-ES')}</span>
                </div>
                {o.fallo_detectado && (
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{o.fallo_detectado}</p>
                )}
              </div>
            ))}
            {leads.map((l) => (
              <div key={l.id} className="px-4 py-3 hover:bg-slate-800/40 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-100 leading-snug">{l.empresa}</p>
                  <span
                    className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${estadoColor(l.estado_caza)}22`,
                      color: estadoColor(l.estado_caza),
                    }}
                  >
                    {estadoLabel(l.estado_caza)}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                  <span>
                    {l.lat != null && l.lon != null ? '📍 en mapa' : '📍 sin ubicación'}
                  </span>
                  {l.url_web && (
                    <a
                      href={l.url_web}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline"
                    >
                      web ↗
                    </a>
                  )}
                  <span>{new Date(l.created_at).toLocaleDateString('es-ES')}</span>
                </div>
                {l.senal_detectada && (
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{l.senal_detectada}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Queries activas */}
      {queries.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Queries activas del radar
          </p>
          <div className="flex flex-wrap gap-2">
            {queries.map((q) => (
              <span
                key={q.id}
                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300"
              >
                <span className="text-emerald-400 font-semibold">{q.query}</span>
                {q.geo && <span className="text-slate-500"> · {q.geo}</span>}
                {q.sector && <span className="text-slate-500"> · {q.sector}</span>}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
