/**
 * ==============================================================================
 * Archivo: examples/DataTable.tsx (plantilla de referencia)
 * ==============================================================================
 * Descripción:
 *  Componente de tabla genérico para el panel admin de AgenciAlquimia.
 *  Deriva las columnas de la primera fila de datos, soporta paginación,
 *  estados de carga/error y badges para valores de estado cortos.
 *
 *  Copiar a components/admin/DataTable.tsx y adaptar estilos/tokens
 *  (slate-950 fondo, slate-900 tarjetas, emerald-500 acentos).
 * ==============================================================================
 */

'use client';

import { useState } from 'react';

export interface DataTableProps {
  /** Filas devueltas por la API route (/api/admin?table=...) */
  rows: Record<string, unknown>[];
  /** Total de filas (para paginar) */
  total?: number;
  /** Tamaño de página */
  pageSize?: number;
  /** Callback al cambiar de página (offset) */
  onPageChange?: (offset: number) => void;
}

/** Convierte un valor a texto legible en la celda */
function formatCell(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/** Badge de estado: colorea valores cortos tipo Pendiente/Enviado a IA/Finalizado */
function statusBadgeClass(value: string): string {
  const v = value.toLowerCase();
  if (v.includes('pendiente')) return 'bg-amber-500/20 text-amber-300';
  if (v.includes('finalizado') || v.includes('complet')) return 'bg-emerald-500/20 text-emerald-300';
  if (v.includes('ia') || v.includes('proceso')) return 'bg-sky-500/20 text-sky-300';
  return 'bg-slate-700 text-slate-200';
}

export default function DataTable({ rows, total = rows.length, pageSize = 10, onPageChange }: DataTableProps) {
  const [page, setPage] = useState(0);

  // Derivar columnas de la primera fila (o de todas las filas si no hay datos)
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const goTo = (next: number) => {
    setPage(next);
    onPageChange?.(next * pageSize);
  };

  if (columns.length === 0) {
    return <p className="text-slate-400 text-sm p-4">Sin datos para mostrar.</p>;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800/60 text-slate-300 uppercase text-xs tracking-wider">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-4 py-3 font-semibold">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-slate-800/40">
                {columns.map((col) => {
                  const value = formatCell(row[col]);
                  const isStatus = value.length <= 40;
                  return (
                    <td key={col} className="px-4 py-3 text-slate-200">
                      {isStatus ? <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(value)}`}>{value}</span> : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 text-sm">
          <span className="text-slate-400">
            Página {page + 1} de {pageCount} · {total} registros
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => goTo(page - 1)}
              disabled={page === 0}
              className="px-3 py-1 rounded-lg bg-slate-800 text-slate-200 disabled:opacity-40 hover:bg-slate-700"
            >
              Anterior
            </button>
            <button
              onClick={() => goTo(page + 1)}
              disabled={page >= pageCount - 1}
              className="px-3 py-1 rounded-lg bg-emerald-600 text-white disabled:opacity-40 hover:bg-emerald-500"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
