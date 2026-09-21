'use client';

/**
 * ==============================================================================
 * Archivo: components/admin/HunterMap.tsx
 * ==============================================================================
 * Descripción:
 *  Radar Hunter — Centro de Mando Táctico y Mapa de Prospección Comercial.
 *  Diseño Satinado Claro (SaaS Modern Light) con flujo completo de ciclo de radar:
 *  1. Configuración, Edición, Activación/Pausa y Eliminación de Radares.
 *  2. Filtrado dinámico: Si no hay radar o está pausado, no muestra negocios.
 *  3. Vaciado instantáneo y seguro de la lista de negocios cazados.
 *  4. Exportación técnica directa a CSV y geocodificación OSM.
 * ==============================================================================
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '../ui/Button';
import { downloadLeadsCSV } from '../../lib/export-utils';

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
  exclusiones?: string | null;
  created_at?: string;
}



const SECTORES_POPULARES = [
  'Clínicas Dentales',
  'Gestorías & Asesorías',
  'Restauración & Hostelería',
  'Inmobiliarias',
  'Talleres Mecánicos',
  'Gimnasios & Fitness',
  'Comercio Local',
  'Reformas & Construcción',
  'Salud & Bienestar',
];

export function HunterMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  // Estados de datos
  const [leads, setLeads] = useState<Lead[]>([]);
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [queries, setQueries] = useState<RadarQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de modales y edición
  const [mostrarConfig, setMostrarConfig] = useState(false);
  const [confirmVaciar, setConfirmVaciar] = useState(false);
  const [vaciarLoading, setVaciarLoading] = useState(false);
  const [radarRunning, setRadarRunning] = useState(false);
  const [radarSuccess, setRadarSuccess] = useState<string | null>(null);
  const [geocodeLoading, setGeocodeLoading] = useState(false);

  // Estado del formulario de radar (Crear / Editar)
  const [editingQueryId, setEditingQueryId] = useState<string | null>(null);
  const [queryForm, setQueryForm] = useState({
    query: '',
    sector: 'Clínicas Dentales',
    geo: 'Santiago de Compostela, Galicia',
    palabrasAfina: 'privada, centro, especialista, independiente, particular',
    plataformas: ['Google My Business', 'Google Search'],
  });

  // Filtros de visualización
  const [filtroSector] = useState<string>('todos');
  const [filtroGeo] = useState<string>('todos');
    const [soloConCoords, setSoloConCoords] = useState(false);
  const [soloConContacto, setSoloConContacto] = useState(false);

  // Consulta de datos de la API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/hunter');
      if (!res.ok) throw new Error('Error al cargar datos del Radar Hunter');
      const json = await res.json();
      setLeads(json.leads ?? []);
      setObjetivos(json.objetivos ?? []);
      setQueries(json.queries ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar el radar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Radares activos
  const activeQueries = useMemo(() => queries.filter((q) => q.activo), [queries]);
  const hasActiveRadar = activeQueries.length > 0;

  // Lógica de filtrado de negocios:
  // Si no hay ningún radar o todos están pausados, no se muestran negocios
  const visibles = useMemo(() => {
    if (!hasActiveRadar) {
      return { obj: [], leads: [] };
    }

    const objFiltrados = objetivos.filter((o) => {
      if (soloConCoords && (!o.lat || !o.lon)) return false;
      if (soloConContacto && !o.telefono && !o.email) return false;
      if (filtroSector !== 'todos' && o.sector !== filtroSector) return false;
      if (filtroGeo !== 'todos' && o.ciudad !== filtroGeo && o.comunidad !== filtroGeo) return false;
      return true;
    });

    const leadsFiltrados = leads.filter((l) => {
      if (soloConCoords && (!l.lat || !l.lon)) return false;
      if (soloConContacto && !l.telefono && !l.email) return false;
      if (filtroSector !== 'todos' && l.nicho !== filtroSector) return false;
      if (filtroGeo !== 'todos' && l.ciudad !== filtroGeo && l.comunidad !== filtroGeo) return false;
      return true;
    });

    return { obj: objFiltrados, leads: leadsFiltrados };
  }, [hasActiveRadar, objetivos, leads, soloConCoords, soloConContacto, filtroSector, filtroGeo]);

  // Inicialización de Leaflet Map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [42.8782, -8.5448], // Santiago de Compostela
      zoom: 12,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Pintar marcadores en el mapa
  useEffect(() => {
    if (!mapInstance.current || !markersRef.current) return;
    markersRef.current.clearLayers();

    const bounds: L.LatLngExpression[] = [];

    // Pintar Objetivos
    visibles.obj.forEach((o) => {
      if (o.lat && o.lon) {
        const marker = L.marker([o.lat, o.lon], {
          icon: L.divIcon({
            className: 'custom-radar-marker',
            html: '<div style="background-color:#10b981;width:14px;height:14px;border-radius:50%;border:2.5px solid #ffffff;box-shadow:0 0 8px rgba(16,185,129,0.7);"></div>',
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          }),
        });

        marker.bindPopup(`
          <div style="font-family:sans-serif;padding:4px;color:#1c1917;">
            <div style="font-weight:bold;font-size:13px;color:#047857;">🎯 ${o.negocio}</div>
            <div style="font-size:11px;color:#57534e;margin-top:2px;">${o.sector || 'Sector no especificado'}</div>
            ${o.telefono ? `<div style="font-size:11px;margin-top:4px;">📞 <b>${o.telefono}</b></div>` : ''}
            ${o.email ? `<div style="font-size:11px;">✉️ ${o.email}</div>` : ''}
          </div>
        `);

        markersRef.current?.addLayer(marker);
        bounds.push([o.lat, o.lon]);
      }
    });

    // Pintar Leads
    visibles.leads.forEach((l) => {
      if (l.lat && l.lon) {
        const marker = L.marker([l.lat, l.lon], {
          icon: L.divIcon({
            className: 'custom-radar-marker-lead',
            html: '<div style="background-color:#3b82f6;width:14px;height:14px;border-radius:50%;border:2.5px solid #ffffff;box-shadow:0 0 8px rgba(59,130,246,0.7);"></div>',
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          }),
        });

        marker.bindPopup(`
          <div style="font-family:sans-serif;padding:4px;color:#1c1917;">
            <div style="font-weight:bold;font-size:13px;color:#1d4ed8;">🏢 ${l.empresa}</div>
            <div style="font-size:11px;color:#57534e;margin-top:2px;">${l.nicho || 'Nicho general'}</div>
            ${l.telefono ? `<div style="font-size:11px;margin-top:4px;">📞 <b>${l.telefono}</b></div>` : ''}
            ${l.email ? `<div style="font-size:11px;">✉️ ${l.email}</div>` : ''}
          </div>
        `);

        markersRef.current?.addLayer(marker);
        bounds.push([l.lat, l.lon]);
      }
    });

    if (bounds.length > 0 && mapInstance.current) {
      mapInstance.current.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 14 });
    }
  }, [visibles]);

  // Acciones de Radar
  const ejecutarRadar = async () => {
    setRadarRunning(true);
    setRadarSuccess(null);
    setError(null);
    try {
      const res = await fetch('/api/admin/hunter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'radar' }),
      });
      if (!res.ok) throw new Error('Error al ejecutar el barrido del radar');
      setRadarSuccess('Barrido de radar ejecutado con éxito. Se están buscando prospectos.');
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al ejecutar el radar');
    } finally {
      setRadarRunning(false);
    }
  };

  const geocodificarNegocios = async () => {
    setGeocodeLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/hunter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'geocode' }),
      });
      if (!res.ok) throw new Error('Error al geocodificar negocios');
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en la geocodificación');
    } finally {
      setGeocodeLoading(false);
    }
  };

  const toggleQuery = async (id: string, activoActual: boolean) => {
    try {
      const res = await fetch('/api/admin/hunter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle-query', id, activo: !activoActual }),
      });
      if (!res.ok) throw new Error('Error al cambiar estado del radar');
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado');
    }
  };

  const eliminarQuery = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este radar configurado?')) return;
    try {
      const res = await fetch('/api/admin/hunter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'eliminar-query', id }),
      });
      if (!res.ok) throw new Error('Error al eliminar el radar');
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const vaciarNegocios = async () => {
    setVaciarLoading(true);
    setConfirmVaciar(false);
    // Limpiar instantáneamente el estado local para respuesta visual inmediata
    setObjetivos([]);
    setLeads([]);
    setError(null);
    try {
      const res = await fetch('/api/admin/hunter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'vaciar-negocios' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Error al vaciar en el servidor');
      }
      setRadarSuccess('Lista de negocios del radar vaciada correctamente.');
    } catch (err) {
      console.warn('Vaciar lista warning:', err);
      setRadarSuccess('Lista de negocios vaciada en la vista.');
    } finally {
      setVaciarLoading(false);
    }
  };

  const guardarRadarForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingQueryId) {
        // Actualizar radar existente
        const res = await fetch('/api/admin/hunter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'actualizar-query',
            id: editingQueryId,
            query: queryForm.query,
            sector: queryForm.sector,
            geo: queryForm.geo,
            plataforma: queryForm.plataformas,
            activo: true,
          }),
        });
        if (!res.ok) throw new Error('Error al actualizar radar');
      } else {
        // Crear nuevo radar
        const res = await fetch('/api/admin/hunter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'crear-query',
            query: queryForm.query,
            sector: queryForm.sector,
            geo: queryForm.geo,
            plataforma: queryForm.plataformas,
            activo: true,
          }),
        });
        if (!res.ok) throw new Error('Error al crear nuevo radar');
      }

      setEditingQueryId(null);
      setQueryForm({
        query: '',
        sector: 'Clínicas Dentales',
        geo: 'Santiago de Compostela, Galicia',
        palabrasAfina: 'privada, centro, especialista, independiente, particular',
        plataformas: ['Google My Business', 'Google Search'],
      });
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar radar');
    }
  };

  const abrirEditarRadar = (q: RadarQuery) => {
    setEditingQueryId(q.id);
    setQueryForm({
      query: q.query,
      sector: q.sector || 'Clínicas Dentales',
      geo: q.geo || 'Santiago de Compostela, Galicia',
      palabrasAfina: q.exclusiones || 'privada, centro, especialista, independiente',
      plataformas: q.plataforma || ['Google My Business', 'Google Search'],
    });
  };

  return (
    <div className="space-y-6 text-stone-800 font-sans">
      {/* Barra de Control Superior */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center text-lg font-black">
            🎯
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-stone-900 leading-tight">Radar Lead Hunter</h2>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-600 font-medium">
              <span>Radares configurados: <b>{queries.length}</b> ({activeQueries.length} activos)</span>
              {hasActiveRadar ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Radar Activo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200 text-[11px] font-bold">
                  ⏸️ Radar Pausado / Inactivo
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="primary"
            size="md"
            onClick={ejecutarRadar}
            loading={radarRunning}
            icon="⚡"
          >
            Activar Radar (Buscar)
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => downloadLeadsCSV([...visibles.obj, ...visibles.leads])}
            disabled={visibles.obj.length + visibles.leads.length === 0}
            icon="📥"
          >
            Exportar Lista (CSV)
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={geocodificarNegocios}
            loading={geocodeLoading}
            icon="📍"
          >
            Geolocalizar
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => setMostrarConfig(true)}
            icon="⚙️"
          >
            Configurar Radares ({queries.length})
          </Button>

          <Button
            variant="danger"
            size="md"
            onClick={() => setConfirmVaciar(true)}
            loading={vaciarLoading}
            disabled={visibles.obj.length + visibles.leads.length === 0}
            icon="🗑️"
          >
            Vaciar Lista
          </Button>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between shadow-xs">
          <span>⚠️ {error}</span>
          <button type="button" onClick={() => setError(null)} className="text-rose-900 font-bold ml-2">✕</button>
        </div>
      )}

      {radarSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs">
          <span>✅ {radarSuccess}</span>
          <button type="button" onClick={() => setRadarSuccess(null)} className="text-emerald-900 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Contenedor Principal: Mapa a la izquierda, Lista de Negocios a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mapa Interactivo Leaflet (8 columnas) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-stone-200/90 shadow-sm p-4 flex flex-col space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">Mapa del Radar</span>
              <span className="text-xs font-semibold text-stone-500">
                ({visibles.obj.filter((o) => o.lat && o.lon).length + visibles.leads.filter((l) => l.lat && l.lon).length} geolocalizados)
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <label className="inline-flex items-center gap-1.5 cursor-pointer text-stone-700 font-medium">
                <input
                  type="checkbox"
                  checked={soloConCoords}
                  onChange={(e) => setSoloConCoords(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-500"
                />
                <span>Solo con coordenadas</span>
              </label>

              <label className="inline-flex items-center gap-1.5 cursor-pointer text-stone-700 font-medium">
                <input
                  type="checkbox"
                  checked={soloConContacto}
                  onChange={(e) => setSoloConContacto(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-500"
                />
                <span>Con teléfono/email</span>
              </label>
            </div>
          </div>

          <div
            ref={mapRef}
            className="w-full h-[520px] rounded-xl border border-stone-200 overflow-hidden shadow-inner relative z-0"
          />
        </div>

        {/* Panel Lateral: Lista de Negocios Cazados (4 columnas) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-stone-200/90 shadow-sm p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                <span>🎯</span>
                <span>Negocios en el Radar</span>
              </span>
              <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {visibles.obj.length + visibles.leads.length}
              </span>
            </div>

            {/* Estado 1: No hay radares creados */}
            {queries.length === 0 && (
              <div className="py-12 px-4 text-center space-y-3 bg-stone-50 rounded-xl border border-stone-200/70">
                <div className="text-2xl">📡</div>
                <h4 className="text-xs font-bold text-stone-800">Sin Radares Creados</h4>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  No tienes ningún radar configurado. Configura tu primer radar para buscar negocios.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setMostrarConfig(true)}
                  icon="➕"
                >
                  Crear Primer Radar
                </Button>
              </div>
            )}

            {/* Estado 2: Todos los radares están pausados */}
            {queries.length > 0 && !hasActiveRadar && (
              <div className="py-12 px-4 text-center space-y-3 bg-stone-50 rounded-xl border border-stone-200/70">
                <div className="text-2xl">⏸️</div>
                <h4 className="text-xs font-bold text-stone-800">Radares en Pausa</h4>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Tienes {queries.length} radar(es) configurado(s), pero todos están desactivados. Activa un radar para ver sus negocios.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setMostrarConfig(true)}
                  icon="⚙️"
                >
                  Gestionar Radares
                </Button>
              </div>
            )}

            {/* Estado 3: Radar activo pero lista vacía */}
            {hasActiveRadar && visibles.obj.length + visibles.leads.length === 0 && !loading && (
              <div className="py-12 px-4 text-center space-y-3 bg-stone-50 rounded-xl border border-stone-200/70">
                <div className="text-2xl">🔍</div>
                <h4 className="text-xs font-bold text-stone-800">Lista Vaciada / Sin Negocios</h4>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  No hay negocios cazados para el radar activo. Pulsa &quot;Activar Radar (Buscar)&quot; para ejecutar una nueva búsqueda.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={ejecutarRadar}
                  loading={radarRunning}
                  icon="⚡"
                >
                  Buscar Negocios Ahora
                </Button>
              </div>
            )}

            {/* Lista de Negocios Activos */}
            {hasActiveRadar && visibles.obj.length + visibles.leads.length > 0 && (
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {visibles.obj.map((o) => (
                  <div
                    key={`obj-${o.id}`}
                    className="p-3.5 rounded-xl bg-stone-50/80 border border-stone-200/80 hover:border-emerald-300 transition-all space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-stone-900 leading-tight">
                        🎯 {o.negocio}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-200/70 text-stone-700 shrink-0">
                        {o.sector || 'Comercio'}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-600 space-y-0.5">
                      {o.telefono && <div>📞 {o.telefono}</div>}
                      {o.email && <div>✉️ {o.email}</div>}
                      <div className="text-[10px] text-stone-500">
                        📍 {o.ciudad || o.comunidad || 'Ubicación Galicia'}
                        {o.lat && o.lon ? ' (Geolocalizado)' : ' (Sin coords)'}
                      </div>
                    </div>
                  </div>
                ))}

                {visibles.leads.map((l) => (
                  <div
                    key={`lead-${l.id}`}
                    className="p-3.5 rounded-xl bg-stone-50/80 border border-stone-200/80 hover:border-blue-300 transition-all space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-stone-900 leading-tight">
                        🏢 {l.empresa}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 shrink-0">
                        {l.nicho || 'Lead'}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-600 space-y-0.5">
                      {l.telefono && <div>📞 {l.telefono}</div>}
                      {l.email && <div>✉️ {l.email}</div>}
                      <div className="text-[10px] text-stone-500">
                        📍 {l.ciudad || l.comunidad || 'Galicia'}
                        {l.lat && l.lon ? ' (Geolocalizado)' : ' (Sin coords)'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Configuración y Gestión de Radares (CRUD Completo) */}
      {mostrarConfig && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center text-lg font-bold">
                  ⚙️
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-stone-900">
                    Gestión de Radares Tácticos
                  </h3>
                  <p className="text-xs text-stone-600 font-medium">
                    Configura, activa/pausa, edita o elimina los radares de prospección.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMostrarConfig(false);
                  setEditingQueryId(null);
                }}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Formulario: Crear / Editar Radar */}
            <form onSubmit={guardarRadarForm} className="space-y-4 bg-stone-50 p-5 rounded-2xl border border-stone-200/80">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
                {editingQueryId ? '✏️ Editar Radar' : '➕ Crear Nuevo Radar'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Término de Búsqueda / Query
                  </label>
                  <input
                    type="text"
                    required
                    value={queryForm.query}
                    onChange={(e) => setQueryForm({ ...queryForm, query: e.target.value })}
                    placeholder="Ej. Clínica Dental, Gestoría, Taller..."
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Sector
                  </label>
                  <select
                    value={queryForm.sector}
                    onChange={(e) => setQueryForm({ ...queryForm, sector: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {SECTORES_POPULARES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Región Geográfica / Ciudad
                  </label>
                  <input
                    type="text"
                    required
                    value={queryForm.geo}
                    onChange={(e) => setQueryForm({ ...queryForm, geo: e.target.value })}
                    placeholder="Santiago de Compostela, Galicia..."
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    🎯 Palabras Clave de Afinado / Inclusión
                  </label>
                  <input
                    type="text"
                    value={queryForm.palabrasAfina}
                    onChange={(e) => setQueryForm({ ...queryForm, palabrasAfina: e.target.value })}
                    placeholder="privada, centro, especialista, particular..."
                    className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                {editingQueryId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingQueryId(null);
                      setQueryForm({
                        query: '',
                        sector: 'Clínicas Dentales',
                        geo: 'Santiago de Compostela, Galicia',
                        palabrasAfina: 'privada, centro, especialista, independiente, particular',
                        plataformas: ['Google My Business', 'Google Search'],
                      });
                    }}
                  >
                    Cancelar Edición
                  </Button>
                )}
                <Button variant="primary" size="sm" type="submit" icon="💾">
                  {editingQueryId ? 'Guardar Cambios' : 'Guardar y Activar Radar'}
                </Button>
              </div>
            </form>

            {/* Listado de Radares Existentes */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
                Radares Existentes ({queries.length})
              </h4>

              {queries.length === 0 ? (
                <p className="text-xs text-stone-500 italic">No hay radares creados aún.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {queries.map((q) => (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-stone-900 truncate">
                            {q.query}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              q.activo
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-200 text-stone-600'
                            }`}
                          >
                            {q.activo ? '● Activo' : '⏸ En Pausa'}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 truncate">
                          {q.sector || 'Sector general'} • 📍 {q.geo || 'Galicia'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Botón Activar / Pausar */}
                        <Button
                          variant={q.activo ? 'secondary' : 'primary'}
                          size="sm"
                          onClick={() => toggleQuery(q.id, q.activo)}
                        >
                          {q.activo ? 'Pausar' : 'Activar'}
                        </Button>

                        {/* Botón Editar */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => abrirEditarRadar(q)}
                          icon="✏️"
                        >
                          Editar
                        </Button>

                        {/* Botón Eliminar */}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => eliminarQuery(q.id)}
                          icon="🗑️"
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmación de Vaciar Lista */}
      {confirmVaciar && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 flex items-center justify-center text-lg font-bold">
                🗑️
              </div>
              <div>
                <h3 className="text-base font-extrabold text-stone-900">
                  ¿Vaciar lista de negocios?
                </h3>
                <p className="text-xs text-stone-600 font-medium">
                  Esta acción limpiará todos los negocios cazados en el mapa y la base de datos.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setConfirmVaciar(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={vaciarNegocios}
                loading={vaciarLoading}
                icon="🗑️"
              >
                Confirmar y Vaciar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
