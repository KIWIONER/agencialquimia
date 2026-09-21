import React from 'react';
import { Button } from '../../ui/Button';

/**
 * ==============================================================================
 * Archivo: components/admin/ui/MetricCard.tsx
 * ==============================================================================
 * Descripción:
 *  Tarjeta Métrica Reutilizable para el Dashboard Administrativo de AgenciAlquimia.
 *  Inspirada en el diseño satinado claro (image.png): cabecera de icono pastel,
 *  métricas agrupadas en filas marfil y enlace de acción directo.
 * ==============================================================================
 */

export interface MetricItem {
  label: string;
  value: string | number;
  highlight?: boolean;
}

export interface MetricCardProps {
  /** Icono o emoji representativo de la sección */
  icon: React.ReactNode;
  /** Color del contenedor del icono (ej. 'emerald', 'sky', 'amber', 'violet') */
  colorScheme?: 'emerald' | 'sky' | 'amber' | 'violet' | 'rose';
  /** Título principal de la tarjeta */
  title: string;
  /** Subtítulo o nombre de tabla/módulo */
  subtitle?: string;
  /** Lista de métricas numéricas o indicativas */
  metrics: MetricItem[];
  /** Texto del botón de acción inferior */
  actionLabel?: string;
  /** Callback al hacer clic en el botón de acción */
  onAction?: () => void;
  /** Clases CSS adicionales */
  className?: string;
}

const schemeStyles = {
  emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  sky: 'bg-sky-50 text-sky-800 border-sky-200',
  amber: 'bg-amber-50 text-amber-900 border-amber-200',
  violet: 'bg-violet-50 text-violet-800 border-violet-200',
  rose: 'bg-rose-50 text-rose-800 border-rose-200',
};

export function MetricCard({
  icon,
  colorScheme = 'emerald',
  title,
  subtitle,
  metrics,
  actionLabel = 'Abrir sección →',
  onAction,
  className = '',
}: MetricCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-stone-200/90 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-stone-300 transition-all ${className}`}
    >
      <div className="space-y-4">
        {/* Cabecera de la Tarjeta */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold border ${schemeStyles[colorScheme]}`}
            >
              {icon}
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 leading-tight">{title}</h3>
              {subtitle && (
                <p className="text-xs text-stone-600 font-mono mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          <span className="text-stone-300 font-bold text-sm">›</span>
        </div>

        {/* Filas de Métricas */}
        <div className="space-y-2">
          {metrics.map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl flex items-center justify-between text-xs transition-colors ${
                item.highlight
                  ? 'bg-amber-50/60 border border-amber-200/80 font-bold text-amber-950'
                  : 'bg-stone-50 border border-stone-200/60 text-stone-700'
              }`}
            >
              <span className="font-medium text-stone-600">{item.label}</span>
              <span className="font-bold text-stone-900 text-sm">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Accion Inferior */}
      {onAction && (
        <div className="pt-2 border-t border-stone-200/70">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAction}
            className="w-full text-emerald-800 hover:text-emerald-900 hover:bg-emerald-50/60 font-bold justify-start px-2"
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
