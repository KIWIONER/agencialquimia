import React from 'react';

/**
 * ==============================================================================
 * Archivo: components/admin/ui/FilterChips.tsx
 * ==============================================================================
 * Descripción:
 *  Componente de Barra de Filtros Activos con chips interactivos removibles.
 *  Inspirado en la maqueta image-2.png del panel Lead Hunter.
 * ==============================================================================
 */

export interface FilterChipItem {
  id: string;
  label: string;
  category?: string;
}

export interface FilterChipsProps {
  /** Lista de chips de filtros activos */
  chips: FilterChipItem[];
  /** Callback al hacer clic en eliminar un chip individual */
  onRemoveChip: (id: string) => void;
  /** Callback para limpiar todos los chips */
  onClearAll?: () => void;
  /** Clases CSS adicionales */
  className?: string;
}

export function FilterChips({
  chips,
  onRemoveChip,
  onClearAll,
  className = '',
}: FilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-stone-600 uppercase tracking-wider mr-1">
          Filtros Activos:
        </span>
        {chips.map((chip) => (
          <span
            key={chip.id}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-800 text-white shadow-xs transition-all"
          >
            <span>{chip.label}</span>
            <button
              type="button"
              onClick={() => onRemoveChip(chip.id)}
              className="w-4 h-4 rounded-full bg-emerald-900/60 hover:bg-emerald-900 flex items-center justify-center text-[10px] font-bold text-white transition-colors cursor-pointer"
              title={`Eliminar filtro ${chip.label}`}
            >
              ✕
            </button>
          </span>
        ))}
      </div>

      {onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-bold text-emerald-800 hover:text-emerald-900 hover:underline cursor-pointer"
        >
          Limpiar todo
        </button>
      )}
    </div>
  );
}
