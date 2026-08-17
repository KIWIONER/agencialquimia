'use client';

/**
 * Radar Hunter — mapa de negocios + botón de activación + filtros.
 *
 * - Botón "🎯 Activar Radar": lanza el workflow n8n hunterops-alquimia
 *   (webhook hunter-ops). Los leads nuevos se geocodifican y aparecen.
 * - Mapa (Leaflet + OpenStreetMap, sin API key): TODOS los negocios con
 *   coordenadas se pintan (objetivos 🎯 morados + leads por estado).
 * - Filtros: comunidad autónoma, ciudad y tipo de negocio (sector/nicho).
 * - Detalle completo de cada negocio en popups y lista lateral.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
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
  comunidad: string | null;
  ciudad: string | null;
  created_at: string;
}

interface Objetivo {
  id: number;
  negocio: string;
  fallo_detectado: string | null;
  potencial_venta: string | null;
  url: string | null;
  sector: string | null;
  email: string | null;
  telefono: string | null;
  lat: number | null;
  lon: number | null;
  comunidad: string | null;
  ciudad: string | null;
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

interface Filtros {
  comunidades_obj: string[] | null;
  ciudades_obj: string[] | null;
  sectores_obj: string[] | null;
  nichos_leads: string[] | null;
}

interface NegocioSeleccionado {
  tipo: 'objetivo' | 'lead';
  item: Objetivo | Lead;
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

function esc(s: string | null | undefined): string {
  return (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function HunterMap() {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [queries, setQueries] = useState<RadarQuery[]>([]);
  const [filtros, setFiltros] = useState<Filtros>({
    comunidades_obj: [],
    ciudades_obj: [],
    sectores_obj: [],
    nichos_leads: [],
  });
  const [loading, setLoading] = useState(true);
  const [radarLoading, setRadarLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [statusDetalle, setStatusDetalle] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Negocio seleccionado (detalle)
  const [seleccion, setSeleccion] = useState<NegocioSeleccionado | null>(null);
  // Generador de mensajes con Max
  const [msgTipo, setMsgTipo] = useState<'whatsapp' | 'email'>('whatsapp');
  const [msgGenerando, setMsgGenerando] = useState(false);
  const [msgTexto, setMsgTexto] = useState('');
  const [msgEstado, setMsgEstado] = useState<'idle' | 'ok' | 'error'>('idle');
  const [msgDetalle, setMsgDetalle] = useState<string | null>(null);
  const [enviandoWa, setEnviandoWa] = useState(false);
  const [enviadoWa, setEnviadoWa] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // Filtros activos
  const [fComunidad, setFComunidad] = useState<string>('all');
  const [fCiudad, setFCiudad] = useState<string>('all');
  const [fTipo, setFTipo] = useState<string>('all');

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
      if (data.filtros) {
        setFiltros({
          comunidades_obj: data.filtros.comunidades_obj ?? [],
          ciudades_obj: data.filtros.ciudades_obj ?? [],
          sectores_obj: data.filtros.sectores_obj ?? [],
          nichos_leads: data.filtros.nichos_leads ?? [],
        });
      }
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
    const map = L.map(containerRef.current, { zoomControl: true }).setView([42.8805, -8.5457], 12);
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

  // Negocios filtrados
  const visibles = useMemo(() => {
    const byTipo = (sector: string | null, nicho: string | null) => {
      if (fTipo === 'all') return true;
      const s = (sector ?? '').toLowerCase();
      const n = (nicho ?? '').toLowerCase();
      return s.includes(fTipo.toLowerCase()) || n.includes(fTipo.toLowerCase());
    };
    const byUbic = (comunidad: string | null, ciudad: string | null) => {
      if (fComunidad !== 'all' && (comunidad ?? '').toLowerCase() !== fComunidad.toLowerCase()) return false;
      if (fCiudad !== 'all' && (ciudad ?? '').toLowerCase() !== fCiudad.toLowerCase()) return false;
      return true;
    };
    const obj = objetivos.filter((o) => byUbic(o.comunidad, o.ciudad) && byTipo(o.sector, null));
    const leadsVisibles = leads.filter((l) => byUbic(l.comunidad, l.ciudad) && byTipo(null, l.nicho));
    return { obj, leads: leadsVisibles };
  }, [objetivos, leads, fComunidad, fCiudad, fTipo]);

  // Repintar marcadores cuando cambian los negocios o filtros
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const leadConCoords = visibles.leads.filter((l) => l.lat != null && l.lon != null);
    const objConCoords = visibles.obj.filter((o) => o.lat != null && o.lon != null);

    for (const lead of leadConCoords) {
      const color = estadoColor(lead.estado_caza);
      const icon = L.divIcon({
        className: 'hunter-marker',
        html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.5);"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      const marker = L.marker([lead.lat!, lead.lon!], { icon }).addTo(map);
      marker.on('click', () => setSeleccion({ tipo: 'lead', item: lead }));
      marker.bindPopup(
        `<div style="font-family:system-ui;font-size:12px;max-width:300px;max-height:260px;overflow-y:auto">
          <strong style="font-size:13px">${esc(lead.empresa)}</strong><br/>
          <span style="color:#64748b">Estado: ${estadoLabel(lead.estado_caza)}</span><br/>
          ${lead.ciudad ? `<span style="color:#64748b">📍 ${esc(lead.ciudad)}${lead.comunidad ? `, ${esc(lead.comunidad)}` : ''}</span><br/>` : ''}
          ${lead.nicho ? `<span style="color:#64748b">Tipo: ${esc(lead.nicho)}</span><br/>` : ''}
          ${lead.email ? `<span style="color:#64748b">✉️ ${esc(lead.email)}</span><br/>` : ''}
          ${lead.telefono ? `<span style="color:#64748b">📞 ${esc(lead.telefono)}</span><br/>` : ''}
          ${lead.senal_detectada ? `<span style="color:#64748b">Señal: ${esc(lead.senal_detectada)}</span><br/>` : ''}
          ${lead.feedback_cliente ? `<span style="color:#64748b">Feedback: ${esc(lead.feedback_cliente)}</span><br/>` : ''}
          ${lead.url_web ? `<a href="${esc(lead.url_web)}" target="_blank" rel="noopener noreferrer">web ↗</a>` : 'sin web'}
        </div>`
      );
      markersRef.current.push(marker);
    }

    for (const obj of objConCoords) {
      const icon = L.divIcon({
        className: 'hunter-marker',
        html: `<div style="width:24px;height:24px;border-radius:50%;background:#8b5cf6;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;font-size:11px;color:#fff;">🎯</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      const marker = L.marker([obj.lat!, obj.lon!], { icon }).addTo(map);
      marker.on('click', () => setSeleccion({ tipo: 'objetivo', item: obj }));
      marker.bindPopup(
        `<div style="font-family:system-ui;font-size:12px;max-width:300px;max-height:260px;overflow-y:auto">
          <strong style="font-size:13px">🎯 ${esc(obj.negocio)}</strong><br/>
          ${obj.sector ? `<span style="color:#64748b">Tipo: ${esc(obj.sector)}</span><br/>` : ''}
          ${obj.ciudad ? `<span style="color:#64748b">📍 ${esc(obj.ciudad)}${obj.comunidad ? `, ${esc(obj.comunidad)}` : ''}</span><br/>` : ''}
          ${obj.fallo_detectado ? `<span style="color:#64748b">Fallo detectado: ${esc(obj.fallo_detectado)}</span><br/>` : ''}
          ${obj.potencial_venta ? `<span style="color:#64748b">Potencial: ${esc(obj.potencial_venta)}</span><br/>` : ''}
          ${obj.url ? `<a href="${esc(obj.url)}" target="_blank" rel="noopener noreferrer">web ↗</a>` : 'sin web'}
        </div>`
      );
      markersRef.current.push(marker);
    }

    // Auto-zoom si hay coordenadas
    const allWithCoords: Array<[number, number]> = [
      ...leadConCoords.map((l) => [l.lat!, l.lon!] as [number, number]),
      ...objConCoords.map((o) => [o.lat!, o.lon!] as [number, number]),
    ];
    if (allWithCoords.length > 0) {
      const bounds = L.latLngBounds(allWithCoords);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else {
      map.setView([42.8805, -8.5457], 12);
    }
  }, [visibles]);

  const activateRadar = async () => {
    setRadarLoading(true);
    setStatus(null);
    setStatusDetalle(null);
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
      if (data.detalle) setStatusDetalle(data.detalle);
      // Mostrar las queries activas que ejecutará el radar
      if (queries.length > 0) {
        setStatusDetalle(
          `El radar ejecutará las ${queries.length} queries activas (foco Galicia / Santiago de Compostela):\n\n` +
            queries.map((q) => `• ${q.query}${q.geo ? ` — ${q.geo}` : ''}`).join('\n')
        );
      }
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
    setStatusDetalle(null);
    setError(null);
    try {
      const res = await fetch('/api/admin/hunter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'geocode' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Error al geolocalizar');
      const msg = data.geocoded
        ? `📍 ${data.geocoded} negocio(s) geolocalizados. ${data.failed ? data.failed + ' sin coincidencia.' : ''}`
        : (data.message ?? 'Sin leads pendientes de geolocalizar.');
      setStatus(msg);
      if (data.pendientes != null) {
        setStatusDetalle(
          data.pendientes > 0
            ? `Quedan ${data.pendientes} negocio(s) sin localizar. Vuelve a pulsar "Geolocalizar" para procesar el siguiente lote.`
            : 'Todos los negocios con ubicación posible están localizados.'
        );
      }
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

  // Listas de filtros combinadas (objetivos + leads)
  const comunidades = useMemo(() => {
    const set = new Set<string>();
    (filtros.comunidades_obj ?? []).forEach((c) => c && set.add(c));
    leads.forEach((l) => l.comunidad && set.add(l.comunidad));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }, [filtros.comunidades_obj, leads]);

  const ciudades = useMemo(() => {
    const set = new Set<string>();
    (filtros.ciudades_obj ?? []).forEach((c) => c && set.add(c));
    leads.forEach((l) => l.ciudad && set.add(l.ciudad));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }, [filtros.ciudades_obj, leads]);

  const tipos = useMemo(() => {
    const set = new Set<string>();
    (filtros.sectores_obj ?? []).forEach((s) => s && set.add(s));
    (filtros.nichos_leads ?? []).forEach((n) => n && set.add(n));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }, [filtros.sectores_obj, filtros.nichos_leads]);

  // --- Generador de mensajes con Max ---
  const generarMensaje = async () => {
    if (!seleccion) return;
    setMsgGenerando(true);
    setMsgEstado('idle');
    setMsgDetalle(null);
    try {
      const item = seleccion.item;
      const negocio = {
        nombre: seleccion.tipo === 'objetivo' ? (item as Objetivo).negocio : (item as Lead).empresa,
        sector: (item as Objetivo).sector ?? (item as Lead).nicho ?? '',
        ciudad: item.ciudad ?? '',
        fallo: (item as Objetivo).fallo_detectado ?? (item as Lead).senal_detectada ?? '',
        potencial: (item as Objetivo).potencial_venta ?? '',
        url: (item as Objetivo).url ?? (item as Lead).url_web ?? '',
        telefono: item.telefono ?? '',
        email: item.email ?? '',
      };
      const res = await fetch('/api/admin/hunter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generar-mensaje', tipo: msgTipo, negocio }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Error generando mensaje');
      setMsgTexto(data.response ?? '');
      setMsgEstado('ok');
      setMsgDetalle(
        msgTipo === 'whatsapp'
          ? 'Mensaje listo. Revísalo, ajústalo si quieres y envíalo por WhatsApp o cópialo.'
          : 'Correo listo. Cópialo y pégalo en tu cliente de correo, o abre tu app de email.'
      );
    } catch (err) {
      setMsgEstado('error');
      setMsgDetalle(err instanceof Error ? err.message : 'Error generando el mensaje');
    } finally {
      setMsgGenerando(false);
    }
  };

  const copiarMensaje = async () => {
    try {
      await navigator.clipboard.writeText(msgTexto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setMsgDetalle('No se pudo copiar automáticamente. Selecciona el texto manualmente.');
    }
  };

  const enviarWhatsApp = async () => {
    if (!seleccion || !msgTexto.trim()) return;
    const telefono = (seleccion.item.telefono ?? '').replace(/\D/g, '');
    if (!telefono) {
      setMsgDetalle('Este negocio no tiene teléfono guardado.');
      return;
    }
    setEnviandoWa(true);
    setEnviadoWa(false);
    try {
      const res = await fetch('/api/admin/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefono, texto: msgTexto }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Error enviando');
      setEnviadoWa(true);
      setMsgDetalle(`✅ Enviado por WhatsApp a ${seleccion.item.telefono}. El mensaje quedó registrado en el inbox.`);
    } catch (err) {
      setMsgDetalle(`⚠️ No se pudo enviar: ${err instanceof Error ? err.message : 'desconocido'}`);
    } finally {
      setEnviandoWa(false);
    }
  };

  const cerrarDetalle = () => {
    setSeleccion(null);
    setMsgTexto('');
    setMsgEstado('idle');
    setMsgDetalle(null);
    setEnviadoWa(false);
    setCopiado(false);
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span>Radar Hunter</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {leads.length + objetivos.length} negocios en total · {localizados} en el mapa ·{' '}
            {queries.length} queries activas · foco: Galicia (Santiago de Compostela)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={geocodePending}
            disabled={geocoding || pendientes === 0}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-slate-200 border border-slate-700 transition-colors"
          >
            {geocoding ? '📍 Geocodificando…' : `📍 Geolocalizar (${pendientes} sin ubicar)`}
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
          <p className="font-semibold">✅ {status}</p>
          {statusDetalle && <p className="mt-1 text-emerald-400/80 whitespace-pre-wrap">{statusDetalle}</p>}
        </div>
      )}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Filtros */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Comunidad autónoma
            </label>
            <select
              value={fComunidad}
              onChange={(e) => {
                setFComunidad(e.target.value);
                setFCiudad('all');
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todas</option>
              {comunidades.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ciudad</label>
            <select
              value={fCiudad}
              onChange={(e) => setFCiudad(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todas</option>
              {ciudades.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Tipo de negocio
            </label>
            <select
              value={fTipo}
              onChange={(e) => setFTipo(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todos</option>
              {tipos.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          {(fComunidad !== 'all' || fCiudad !== 'all' || fTipo !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setFComunidad('all');
                setFCiudad('all');
                setFTipo('all');
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm text-slate-300 border border-slate-700 transition-colors"
            >
              ✕ Limpiar filtros
            </button>
          )}
          <div className="ml-auto text-xs text-slate-500">
            Mostrando <span className="text-slate-300 font-semibold">{visibles.obj.length + visibles.leads.length}</span>{' '}
            de {objetivos.length + leads.length} negocios
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Mapa */}
        <div className="xl:col-span-2 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
          <div ref={containerRef} className="h-[520px] w-full" />
          {loading && (
            <div className="h-[520px] flex items-center justify-center text-slate-400 text-sm">
              Cargando mapa…
            </div>
          )}
        </div>

        {/* Lista lateral con detalle completo */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden flex flex-col max-h-[520px]">
          <div className="px-4 py-3 border-b border-slate-800 text-sm font-bold text-white flex items-center justify-between">
            <span>Negocios en el radar</span>
            <span className="text-xs text-slate-400 font-normal">
              {visibles.obj.length + visibles.leads.length}
            </span>
          </div>
          <div className="overflow-y-auto divide-y divide-slate-800/60">
            {visibles.obj.length === 0 && visibles.leads.length === 0 && !loading && (
              <p className="p-4 text-sm text-slate-500">
                Sin negocios con estos filtros. Ajusta los filtros o activa el radar.
              </p>
            )}
            {visibles.obj.map((o) => (
              <button
                key={`obj-${o.id}`}
                type="button"
                onClick={() => setSeleccion({ tipo: 'objetivo', item: o })}
                className="w-full text-left px-4 py-3 hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-100 leading-snug">🎯 {o.negocio}</p>
                  {o.sector && (
                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300">
                      {o.sector}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[11px] text-slate-500">
                  <span>{o.lat != null && o.lon != null ? '📍 en mapa' : '📍 sin ubicación'}</span>
                  {o.ciudad && <span>🏙 {o.ciudad}{o.comunidad ? ` (${o.comunidad})` : ''}</span>}
                  {o.url && (
                    <a href={o.url} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline" onClick={(e) => e.stopPropagation()}>
                      web ↗
                    </a>
                  )}
                  <span>{new Date(o.created_at).toLocaleDateString('es-ES')}</span>
                </div>
                {o.fallo_detectado && (
                  <p className="text-[11px] text-slate-400 mt-1">⚠️ {o.fallo_detectado}</p>
                )}
                {o.potencial_venta && (
                  <p className="text-[11px] text-emerald-400/80 mt-0.5">💰 {o.potencial_venta}</p>
                )}
                {(o.email || o.telefono) && (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {o.email && <span>✉️ {o.email}</span>}
                    {o.email && o.telefono && ' · '}
                    {o.telefono && <span>📞 {o.telefono}</span>}
                  </p>
                )}
                <p className="text-[10px] text-emerald-500/70 mt-1">Ver detalle →</p>
              </button>
            ))}
            {visibles.leads.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setSeleccion({ tipo: 'lead', item: l })}
                className="w-full text-left px-4 py-3 hover:bg-slate-800/40 transition-colors"
              >
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
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[11px] text-slate-500">
                  <span>{l.lat != null && l.lon != null ? '📍 en mapa' : '📍 sin ubicación'}</span>
                  {l.ciudad && <span>🏙 {l.ciudad}{l.comunidad ? ` (${l.comunidad})` : ''}</span>}
                  {l.url_web && (
                    <a
                      href={l.url_web}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      web ↗
                    </a>
                  )}
                  <span>{new Date(l.created_at).toLocaleDateString('es-ES')}</span>
                </div>
                {l.nicho && <p className="text-[11px] text-slate-400 mt-1">🏷 {l.nicho}</p>}
                {l.senal_detectada && (
                  <p className="text-[11px] text-slate-400 mt-0.5">📡 {l.senal_detectada}</p>
                )}
                {(l.email || l.telefono) && (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {l.email && <span>✉️ {l.email}</span>}
                    {l.email && l.telefono && ' · '}
                    {l.telefono && <span>📞 {l.telefono}</span>}
                  </p>
                )}
                {l.feedback_cliente && (
                  <p className="text-[11px] text-slate-400 mt-0.5">💬 {l.feedback_cliente}</p>
                )}
                <p className="text-[10px] text-emerald-500/70 mt-1">Ver detalle →</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Queries activas */}
      {queries.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Queries activas del radar (foco Galicia / Santiago de Compostela)
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

      {/* ===== Panel de detalle del negocio ===== */}
      {seleccion && (
        <div className="fixed inset-0 z-[1200] flex justify-end bg-black/60 backdrop-blur-sm" onClick={cerrarDetalle}>
          <div
            className="w-full max-w-lg h-full bg-slate-900 border-l border-slate-700/60 shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera */}
            <div className="sticky top-0 z-10 px-6 py-4 bg-slate-950/95 border-b border-slate-800 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 uppercase tracking-wider">
                    {seleccion.tipo === 'objetivo' ? '🎯 Objetivo del radar' : '📥 Lead cazado'}
                  </span>
                  {seleccion.tipo === 'lead' && (seleccion.item as Lead).estado_caza && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${estadoColor((seleccion.item as Lead).estado_caza)}22`,
                        color: estadoColor((seleccion.item as Lead).estado_caza),
                      }}
                    >
                      {estadoLabel((seleccion.item as Lead).estado_caza)}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white mt-2 leading-snug">
                  {seleccion.tipo === 'objetivo' ? (seleccion.item as Objetivo).negocio : (seleccion.item as Lead).empresa}
                </h3>
              </div>
              <button
                type="button"
                onClick={cerrarDetalle}
                className="shrink-0 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Contacto */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 space-y-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">📇 Contacto</p>
                {(seleccion.item.email || (seleccion.tipo === 'lead' && (seleccion.item as Lead).email)) && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-slate-200 flex items-center gap-2 min-w-0">
                      <span>✉️</span>
                      <span className="truncate">{seleccion.item.email}</span>
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={`mailto:${seleccion.item.email}`}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 transition-colors"
                      >
                        Escribir
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(seleccion.item.email ?? '');
                          setMsgDetalle('✉️ Email copiado al portapapeles.');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                )}
                {seleccion.item.telefono && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-slate-200 flex items-center gap-2 min-w-0">
                      <span>📞</span>
                      <span className="truncate">{seleccion.item.telefono}</span>
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={`tel:${seleccion.item.telefono.replace(/\D/g, '')}`}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 transition-colors"
                      >
                        Llamar
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(seleccion.item.telefono ?? '');
                          setMsgDetalle('📞 Teléfono copiado al portapapeles.');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                )}
                {!seleccion.item.email && !seleccion.item.telefono && (
                  <p className="text-xs text-slate-500">Sin email ni teléfono guardados aún.</p>
                )}
                {(seleccion.tipo === 'objetivo' ? (seleccion.item as Objetivo).url : (seleccion.item as Lead).url_web) && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-slate-200 flex items-center gap-2 min-w-0">
                      <span>🌐</span>
                      <span className="truncate">
                        {(seleccion.tipo === 'objetivo' ? (seleccion.item as Objetivo).url : (seleccion.item as Lead).url_web)?.replace(/^https?:\/\/(www\.)?/, '')}
                      </span>
                    </span>
                    <a
                      href={(seleccion.tipo === 'objetivo' ? (seleccion.item as Objetivo).url : (seleccion.item as Lead).url_web) ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 transition-colors shrink-0"
                    >
                      Abrir web ↗
                    </a>
                  </div>
                )}
              </div>

              {/* Información del negocio */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 space-y-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">📋 Información del negocio</p>
                {(seleccion.tipo === 'objetivo' ? (seleccion.item as Objetivo).sector : (seleccion.item as Lead).nicho) && (
                  <p className="text-sm text-slate-300">🏷 <span className="text-slate-500">Tipo:</span> {seleccion.tipo === 'objetivo' ? (seleccion.item as Objetivo).sector : (seleccion.item as Lead).nicho}</p>
                )}
                {seleccion.item.ciudad && (
                  <p className="text-sm text-slate-300">📍 <span className="text-slate-500">Ubicación:</span> {seleccion.item.ciudad}{seleccion.item.comunidad ? ` (${seleccion.item.comunidad})` : ''}</p>
                )}
                {seleccion.tipo === 'objetivo' && (seleccion.item as Objetivo).fallo_detectado && (
                  <p className="text-sm text-slate-300">⚠️ <span className="text-slate-500">Fallo detectado:</span> {(seleccion.item as Objetivo).fallo_detectado}</p>
                )}
                {seleccion.tipo === 'objetivo' && (seleccion.item as Objetivo).potencial_venta && (
                  <p className="text-sm text-slate-300">💰 <span className="text-slate-500">Potencial de venta:</span> {(seleccion.item as Objetivo).potencial_venta}</p>
                )}
                {seleccion.tipo === 'lead' && (seleccion.item as Lead).senal_detectada && (
                  <p className="text-sm text-slate-300">📡 <span className="text-slate-500">Señal detectada:</span> {(seleccion.item as Lead).senal_detectada}</p>
                )}
                {seleccion.tipo === 'lead' && (seleccion.item as Lead).feedback_cliente && (
                  <p className="text-sm text-slate-300">💬 <span className="text-slate-500">Feedback:</span> {(seleccion.item as Lead).feedback_cliente}</p>
                )}
                <p className="text-xs text-slate-600">Detectado el {new Date(seleccion.item.created_at).toLocaleString('es-ES')}</p>
              </div>

              {/* Generador de mensajes con Max */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">🤖 Mensaje de contacto con Max</p>
                  <div className="flex rounded-lg overflow-hidden border border-slate-700">
                    <button
                      type="button"
                      onClick={() => {
                        setMsgTipo('whatsapp');
                        setMsgTexto('');
                        setMsgEstado('idle');
                      }}
                      className={`px-3 py-1.5 text-xs font-bold transition-colors ${msgTipo === 'whatsapp' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                      WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMsgTipo('email');
                        setMsgTexto('');
                        setMsgEstado('idle');
                      }}
                      className={`px-3 py-1.5 text-xs font-bold transition-colors ${msgTipo === 'email' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                      Email
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Max redacta un mensaje personalizado con los datos de este negocio
                  (fallo detectado, sector, ciudad…) para que contactes con potencial.
                </p>

                <button
                  type="button"
                  onClick={generarMensaje}
                  disabled={msgGenerando}
                  className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold text-white transition-colors shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  {msgGenerando ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Max redactando…
                    </>
                  ) : (
                    <>✨ Generar {msgTipo === 'whatsapp' ? 'mensaje de WhatsApp' : 'correo'} con Max</>
                  )}
                </button>

                {msgTexto && (
                  <>
                    <textarea
                      value={msgTexto}
                      onChange={(e) => setMsgTexto(e.target.value)}
                      rows={8}
                      className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono leading-relaxed"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={copiarMensaje}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors border border-slate-700"
                      >
                        {copiado ? '✅ Copiado' : '📋 Copiar texto'}
                      </button>
                      {msgTipo === 'whatsapp' && (
                        <button
                          type="button"
                          onClick={enviarWhatsApp}
                          disabled={enviandoWa || !seleccion.item.telefono}
                          title={!seleccion.item.telefono ? 'Este negocio no tiene teléfono guardado' : 'Enviar por WhatsApp'}
                          className="flex-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white transition-colors"
                        >
                          {enviandoWa ? 'Enviando…' : enviadoWa ? '✅ Enviado' : '📲 Enviar por WhatsApp'}
                        </button>
                      )}
                      {msgTipo === 'email' && seleccion.item.email && (
                        <a
                          href={`mailto:${seleccion.item.email}?subject=${encodeURIComponent(`Propuesta de automatización para ${seleccion.tipo === 'objetivo' ? (seleccion.item as Objetivo).negocio : (seleccion.item as Lead).empresa}`)}&body=${encodeURIComponent(msgTexto)}`}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-400 transition-colors border border-slate-700 text-center"
                        >
                          📤 Enviar por email
                        </a>
                      )}
                    </div>
                  </>
                )}

                {msgEstado === 'error' && msgDetalle && (
                  <p className="text-xs text-red-400 bg-red-950/50 border border-red-500/30 rounded-xl px-3 py-2">⚠️ {msgDetalle}</p>
                )}
                {msgEstado === 'ok' && msgDetalle && (
                  <p className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded-xl px-3 py-2">{msgDetalle}</p>
                )}
                {msgDetalle && msgEstado === 'idle' && !msgTexto && (
                  <p className="text-xs text-slate-400 bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2">{msgDetalle}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
