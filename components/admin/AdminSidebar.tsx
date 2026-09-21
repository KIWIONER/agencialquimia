import React from 'react';
import Link from 'next/link';

/**
 * ==============================================================================
 * Archivo: components/admin/AdminSidebar.tsx
 * ==============================================================================
 * Descripción:
 *  Barra Lateral de Navegación del Panel Administrativo de AgenciAlquimia.
 *  Inspirada en el diseño satinado marfil/crema (image.png), con ítem activo
 *  en verde esmeralda y accesos rápidos a todas las secciones técnicas.
 * ==============================================================================
 */

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href?: string;
  badge?: string | number;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'summary', label: 'Resumen General', icon: '🎛️' },
  { id: 'hunter', label: 'Lead Hunter', icon: '🎯' },
  { id: 'pipeline', label: 'Pipeline & Captación', icon: '📢' },
  { id: 'inbox', label: 'Inbox de Clientes', icon: '💬' },
  { id: 'marketing', label: 'Marketing & Ads', icon: '📈' },
  { id: 'n8n', label: 'Workflows n8n', icon: '⚙️' },
  { id: 'max', label: 'Chat con Max (IA)', icon: '🤖' },
  { id: 'tables', label: 'Tablas Supabase', icon: '🗄️' },
  { id: 'settings', label: 'Configuración', icon: '⚙️' },
];

export interface AdminSidebarProps {
  /** Pestaña o sección actualmente activa */
  activeTab: string;
  /** Callback para cambiar de pestaña */
  onSelectTab: (tabId: string) => void;
  /** Clases CSS adicionales */
  className?: string;
}

export function AdminSidebar({
  activeTab,
  onSelectTab,
  className = '',
}: AdminSidebarProps) {
  return (
    <aside
      className={`w-64 bg-stone-100/90 border-r border-stone-200/90 flex flex-col justify-between p-5 shrink-0 ${className}`}
    >
      <div className="space-y-6">
        {/* Logo del Panel de Control */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-black text-lg shadow-sm">
            ⚗️
          </div>
          <div>
            <h1 className="text-base font-extrabold text-stone-900 tracking-tight leading-none">
              AgenciAlquimia
            </h1>
            <span className="text-[10px] font-bold tracking-wider text-stone-500 uppercase">
              Panel de Control
            </span>
          </div>
        </div>

        {/* Lista de Navegación */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-xs font-bold'
                    : 'text-stone-700 hover:bg-stone-200/70 hover:text-stone-900'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-sm">{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-emerald-800 text-white' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Enlaces del Pie de Sidebar */}
      <div className="pt-4 border-t border-stone-200/80 space-y-2 px-2 text-xs font-medium text-stone-600">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 hover:text-stone-900 transition-colors"
        >
          <span>↗️</span>
          <span>Volver a la web pública</span>
        </Link>
        <div className="flex items-center gap-2 text-stone-500 font-mono text-[11px] pt-1">
          <span>👤</span>
          <span>Admin (Sesión Activa)</span>
        </div>
      </div>
    </aside>
  );
}
