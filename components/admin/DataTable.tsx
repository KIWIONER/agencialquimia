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
 *  - Renderizado inteligente con badges para estados.
 *  - Estado de carga, refresco manual e indicador de conexión en vivo.
 * ==============================================================================
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Database, RefreshCw, Folder, AlertCircle, CheckCircle2, ChevronRight, ChevronDown, Check } from 'lucide-react';

interface DataTableProps {
  initialTable?: string;
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

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300 border-collapse">
              <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  {columns.map((col) => (
                    <th key={col} className="p-4 font-semibold">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.map((row, idx) => (
                  <tr key={String(row.id || idx)} className="hover:bg-slate-800/40 transition-colors">
                    {columns.map((col) => {
                      const val = row[col];
                      const valStr = typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val ?? '');
                      const isStatusCol = col.toLowerCase().includes('estado') || col.toLowerCase().includes('status');

                      return (
                        <td key={col} className="p-4 text-xs font-mono">
                          {isStatusCol ? (
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-[11px] font-sans font-bold ${
                                valStr === 'Finalizado' || valStr === 'completado' || valStr === 'activo'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : valStr === 'Enviado a IA' || valStr === 'en_proceso'
                                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {valStr}
                            </span>
                          ) : (
                            <span className={col === 'id' ? 'text-slate-500' : 'text-slate-200'}>
                              {valStr}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
