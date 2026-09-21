import React from 'react';
import { Button } from '../ui/Button';

/**
 * ==============================================================================
 * Archivo: components/admin/AdminHeader.tsx
 * ==============================================================================
 * Descripción:
 *  Barra de Estado Superior del Panel Administrativo de AgenciAlquimia.
 *  Inspirada en el diseño claro de image.png: muestra estado del VPS Coolify,
 *  badge de sincronización en tiempo real y botón técnico de actualización.
 * ==============================================================================
 */

export interface AdminHeaderProps {
  /** Título de la sección o vista actual */
  title: string;
  /** Subtítulo descriptivo */
  subtitle?: string;
  /** Callback para refrescar los datos del panel */
  onRefresh?: () => void;
  /** Indicador de estado de carga en refresco */
  isRefreshing?: boolean;
  /** Clases CSS adicionales */
  className?: string;
}

export function AdminHeader({
  title,
  subtitle = 'Monitoreo operativo — datos en vivo',
  onRefresh,
  isRefreshing = false,
  className = '',
}: AdminHeaderProps) {
  return (
    <header
      className={`bg-white border-b border-stone-200/90 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-xs shrink-0 ${className}`}
    >
      <div>
        <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">{title}</h2>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-600 font-medium">
          <span>{subtitle}</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Sincronizado
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Badge VPS Coolify Producción */}
        <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
          <span>VPS Coolify • Producción</span>
        </div>

        {/* Botón de Refresco Técnico */}
        {onRefresh && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            loading={isRefreshing}
            icon="🔄"
          >
            Actualizar resumen
          </Button>
        )}

        {/* Avatar de Administrador */}
        <div className="w-9 h-9 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-xs shadow-xs">
          AA
        </div>
      </div>
    </header>
  );
}
