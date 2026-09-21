import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * ==============================================================================
 * Archivo: components/ui/Button.tsx
 * ==============================================================================
 * Descripción:
 *  Componente de Botón Reutilizable, Elegante y Accesible (WCAG 2.1 AA).
 *  Soporta múltiples variantes visuales, tamaños, estados de carga (loading),
 *  deshabilitado (disabled), iconos responsivos y micro-interacciones suaves.
 * ==============================================================================
 */

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante estética del botón */
  variant?: ButtonVariant;
  /** Tamaño del botón */
  size?: ButtonSize;
  /** Indicador de estado de carga con spinner animado */
  loading?: boolean;
  /** Icono opcional a renderizar a la izquierda del texto */
  icon?: React.ReactNode;
  /** Clases CSS adicionales para personalización */
  className?: string;
  /** Contenido del botón */
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-sm border border-emerald-600/50 hover:border-emerald-700',
  secondary:
    'bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold border border-stone-300/80 shadow-xs',
  outline:
    'bg-transparent hover:bg-stone-100 text-stone-700 font-semibold border border-stone-300 hover:border-stone-400',
  ghost:
    'bg-transparent hover:bg-stone-100/80 text-stone-700 font-medium border border-transparent',
  danger:
    'bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 font-semibold border border-rose-200/90 shadow-xs',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-xs font-semibold rounded-xl gap-2',
  lg: 'px-6 py-3 text-sm font-bold rounded-xl gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      icon,
      className = '',
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center transition-all duration-200 ease-out cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed';

    const combinedClassName = [
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={combinedClassName}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
        ) : (
          icon && <span className="shrink-0 flex items-center">{icon}</span>
        )}
        {children && <span>{children}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
