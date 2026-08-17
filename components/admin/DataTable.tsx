'use client';

/**
 * ==============================================================================
 * Archivo: components/admin/DataTable.tsx
 * ==============================================================================
 * Descripción:
 *  Componente explorador y visualizador dinámico de las 11 tablas de Supabase
 *  para el panel de administración de AgenciAlquimia.
 *
 * Funcionalidades:
 *  - Menú desplegable (Dropdown) personalizado para seleccionar entre las 11 tablas.
 *  - Auto-detección dinámica de columnas a partir de los registros.
 *  - Detección de tipo por columna (fecha, número, booleano, JSON, texto) con iconos.
 *  - Renderizado inteligente: fechas legibles, chips para booleanos, badges de estado.
 *  - Búsqueda en vivo sobre todos los campos + contador de registros.
 *  - Cabecera fija (sticky) con scroll vertical, filas zebra y hover.
 *  - Estado de carga, refresco manual e indicador de conexión en vivo.
 * ==============================================================================
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Database,
  RefreshCw,
  Folder,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Check,
  Search,
  Hash,
  CalendarDays,
  ToggleLeft,
  Braces,
  Type,
  X,
  Rows3,
  FileJson,
} from 'lucide-react';

interface DataTableProps {
  initialTable?: string;
}

type ColType = 'date' | 'number' | 'boolean' | 'json' | 'text';

const TYPE_ICONS: Record<ColType, typeof Type> = {
  date: CalendarDays,
  number: Hash,
  boolean: ToggleLeft,
  json: Braces,
  text: Type,
};

const TYPE_LABELS: Record<ColType, string> = {
  date: 'fecha',
  number: 'número',
  boolean: 'bool',
  json: 'JSON',
  text: 'texto',
};

function detectType(values: unknown[]): ColType {
  const nonEmpty = values.filter(
    (v) => v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0),
  );
  if (nonEmpty.length === 0) return 'text';
  const sample = nonEmpty[0];
  if (typeof sample === 'number') return 'number';
  if (typeof sample === 'boolean') return 'boolean';
  if (typeof sample === 'object') return 'json';
  if (typeof sample === 'string') {
    if (/^\d{4}-\d{2}-\d{2}T/.test(sample)) return 'date';
    return 'text';
  }
  return 'text';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function stringifyVal(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

function statusBadgeClass(valStr: string): string {
  const v = valStr.toLowerCase();
  if (['ganado', 'completado', 'activo', 'completo', 'finalizado', 'ok', 'true', 'si', 'sí'].includes(v)) {
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  }
  if (['en conversacion', 'en_conversacion', 'en_proceso', 'enviado', 'enviado a ia', 'contactado', 'procesando', 'pendiente_envio', 'programado'].includes(v)) {
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  }
  if (['descartado', 'perdido', 'cancelado', 'error', 'fallo', 'fallido', 'false', 'no'].includes(v)) {
    return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  }
  if (['pendiente', 'nuevo', 'espera', 'pausado'].includes(v)) {
    return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  }
  return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
}

function isStatusColumn(col: string): boolean {
  const c = col.toLowerCase();
  return c.includes('estado') || c.includes('status') || c.includes('etapa');
}

export function DataTable({ initialTable = 'leads_agencialquimia' }: DataTableProps) {
  const [mounted, setMounted] = useState<boolean>(false);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>(initialTable);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cerrar el desplegable al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchTables = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/tables');
      const json = await res.json();
      if (json.success && Array.isArray(json.tables)) {
        setTables(json.tables);
        if (!json.tables.includes(selectedTable) && json.tables.length > 0) {
          setSelectedTable(json.tables[0]);
        }
      }
    } catch (err) {
      console.warn('[DataTable] Error al cargar la lista de tablas:', err);
    }
  }, [selectedTable]);

  const fetchTableData = useCallback(async (tableName: string) => {
    setLoading(true);
    setErrorMessage(null);
    setQuery('');
    try {
      const res = await fetch(`/api/admin/data?table=${encodeURIComponent(tableName)}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setData(json.data);
        setIsFallback(Boolean(json.isFallback));
        if (json.error) {
          setErrorMessage(json.error);
        }
      } else {
        setData([]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al consultar datos';
      setErrorMessage(msg);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchTables();
    }
  }, [mounted, fetchTables]);

  useEffect(() => {
    if (mounted && selectedTable) {
      fetchTableData(selectedTable);
    }
  }, [mounted, selectedTable, fetchTableData]);

  // Solo mostrar columnas que tengan contenido en al menos una fila
  const columns = useMemo(() => {
    if (data.length === 0) return [] as string[];
    return Object.keys(data[0]).filter((col) =>
      data.some((row) => {
        const v = row[col];
        if (v === null || v === undefined || v === '') return false;
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === 'object') return Object.keys(v).length > 0;
        return true;
      }),
    );
  }, [data]);

  const colTypes = useMemo(() => {
    const map: Record<string, ColType> = {};
    for (const col of columns) {
      map[col] = detectType(data.map((row) => row[col]));
    }
    return map;
  }, [columns, data]);

  const filteredRows = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    return data.filter((row) => JSON.stringify(row).toLowerCase().includes(q));
  }, [data, query]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Barra superior de control y selector desplegable de tablas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Explorador de Tablas Supabase</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
              <span className="text-emerald-400 font-mono">{selectedTable}</span>
            </h3>
            <p className="text-xs text-slate-400">Conexión PostgREST directa en tiempo real</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Menú Desplegable Personalizado (Dropdown Popover) */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-all cursor-pointer shadow-sm focus:outline-none focus:border-emerald-500/50"
            >
              <Folder className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-white max-w-[180px] truncate">{selectedTable}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180 text-emerald-400' : ''}`} />
            </button>

            {/* Panel Flotante del Desplegable */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-1.5 space-y-1 max-h-80 overflow-y-auto">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Seleccionar Tabla ({tables.length})
                </div>
                {tables.map((t) => {
                  const isSelected = selectedTable === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setSelectedTable(t);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono transition-colors text-left cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600/20 text-emerald-300 font-bold border border-emerald-500/30'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Folder className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <span className="truncate">{t}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Botón de Refresco Manual */}
          <button
            type="button"
            onClick={() => fetchTableData(selectedTable)}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Refrescar</span>
          </button>
        </div>
      </div>

      {/* Notificación de Estado de Conexión o Fallback */}
      {isFallback && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Modo Vista Previa (Fallback):</strong> Supabase no está conectado localmente. Mostrando datos de prueba para la tabla <code className="font-mono font-bold text-amber-200">{selectedTable}</code>.
            </span>
          </div>
          {errorMessage && <span className="text-[11px] text-amber-400/80 hidden md:inline">{errorMessage}</span>}
        </div>
      )}

      {!isFallback && !loading && (
        <div className="px-3 py-2 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Conectado en vivo a la base de datos de Supabase Cloud. Registros sincronizados en tiempo real.</span>
        </div>
      )}

      {/* Contenido Principal: Tabla de Datos Dinámica */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-400">Cargando datos de la tabla <span className="font-mono text-white">{selectedTable}</span>...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="py-16 text-center space-y-3 border-2 border-dashed border-slate-800 rounded-xl">
            <Database className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-slate-300">Tabla Vacía</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No se encontraron registros en la tabla <code className="font-mono text-slate-400">{selectedTable}</code>.
            </p>
          </div>
        ) : (
          <>
            {/* Barra de herramientas: búsqueda + contador */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Buscar en ${selectedTable}...`}
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    aria-label="Limpiar búsqueda"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Rows3 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-mono font-bold text-white">{filteredRows.length}</span>
                  <span>/ {data.length} registros</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <FileJson className="w-3.5 h-3.5" />
                  <span>{columns.length} columnas</span>
                </span>
              </div>
            </div>

            {/* Tabla con cabecera fija y scroll */}
            <div className="overflow-auto max-h-[62vh] rounded-xl border border-slate-800">
              <table className="w-full text-left text-sm text-slate-300 border-collapse min-w-max">
                <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider sticky top-0 z-10 shadow-[0_1px_0_0_rgba(148,163,184,0.15)]">
                  <tr>
                    <th className="p-3 pl-4 w-10 text-center text-slate-600 font-semibold">#</th>
                    {columns.map((col) => {
                      const Icon = TYPE_ICONS[colTypes[col]];
                      return (
                        <th key={col} className="p-3 font-semibold whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-3.5 h-3.5 shrink-0 ${col === 'id' ? 'text-emerald-400' : 'text-slate-500'}`} />
                            <span className={col === 'id' ? 'text-emerald-300' : ''}>{col}</span>
                            <span className="hidden lg:inline text-[9px] font-bold text-slate-600 bg-slate-800/80 rounded px-1.5 py-0.5 uppercase">
                              {TYPE_LABELS[colTypes[col]]}
                            </span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + 1} className="p-10 text-center">
                        <div className="space-y-2">
                          <Search className="w-8 h-8 text-slate-600 mx-auto" />
                          <p className="text-sm text-slate-400">Sin resultados para <span className="font-mono text-emerald-300">&quot;{query}&quot;</span></p>
                          <p className="text-xs text-slate-600">Prueba con otro término o limpia la búsqueda.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row, idx) => (
                      <tr key={String(row.id ?? idx)} className={`transition-colors hover:bg-emerald-500/5 ${idx % 2 === 1 ? 'bg-slate-800/20' : ''}`}>
                        <td className="p-3 pl-4 text-center text-[11px] font-mono text-slate-600">{idx + 1}</td>
                        {columns.map((col) => {
                          const val = row[col];
                          const valStr = stringifyVal(val);
                          const type = colTypes[col];
                          const isStatus = isStatusColumn(col);

                          // Celda vacía -> guión tenue
                          if (valStr === '') {
                            return (
                              <td key={col} className="p-3 text-xs font-mono text-slate-700">
                                —
                              </td>
                            );
                          }

                          // Booleano -> chip
                          if (type === 'boolean') {
                            return (
                              <td key={col} className="p-3">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                    val === true
                                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                      : 'bg-slate-700/30 text-slate-400 border-slate-600/40'
                                  }`}
                                >
                                  <ToggleLeft className="w-3 h-3" />
                                  {val === true ? 'Sí' : 'No'}
                                </span>
                              </td>
                            );
                          }

                          // Fecha -> formato legible
                          if (type === 'date') {
                            return (
                              <td key={col} className="p-3 text-xs font-mono whitespace-nowrap">
                                <span className="flex items-center gap-1.5 text-slate-300" title={valStr}>
                                  <CalendarDays className="w-3 h-3 text-slate-500 shrink-0" />
                                  {formatDate(valStr)}
                                </span>
                              </td>
                            );
                          }

                          // JSON -> truncado con tooltip
                          if (type === 'json') {
                            const pretty = JSON.stringify(val, null, 2);
                            return (
                              <td key={col} className="p-3 text-xs font-mono max-w-[280px]">
                                <span
                                  className="block truncate text-indigo-300/90 hover:text-indigo-200 cursor-help"
                                  title={pretty.length > 500 ? pretty.slice(0, 500) + '\n…' : pretty}
                                >
                                  {'{ '}{valStr.slice(0, 80)}{valStr.length > 80 ? '…' : ''}{' }'}
                                </span>
                              </td>
                            );
                          }

                          // Columna de estado -> badge
                          if (isStatus) {
                            return (
                              <td key={col} className="p-3">
                                <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-sans font-bold border ${statusBadgeClass(valStr)}`}>
                                  {valStr}
                                </span>
                              </td>
                            );
                          }

                          // Número -> tabular
                          if (type === 'number') {
                            return (
                              <td key={col} className="p-3 text-xs font-mono tabular-nums text-slate-200">
                                {valStr}
                              </td>
                            );
                          }

                          // Texto normal: id tenue, resto con truncado + tooltip
                          const isId = col === 'id' || /uuid|_id$/.test(col);
                          return (
                            <td key={col} className="p-3 text-xs font-mono max-w-[300px]">
                              <span
                                className={`block truncate ${isId ? 'text-slate-500' : 'text-slate-200'} hover:text-white`}
                                title={valStr}
                              >
                                {valStr}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
