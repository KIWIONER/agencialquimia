'use client';

/**
 * ==============================================================================
 * Archivo: app/admin/page.tsx
 * ==============================================================================
 * Descripción:
 *  Panel de Control de Administración (Control Center / Dashboard) para AgenciAlquimia.
 * 
 * Migración e Integración:
 *  Migrado desde el subproyecto aislado `admin/` (Vite) a una sub-ruta nativa protegida
 *  dentro de Next.js App Router (`/admin`). Unifica el repositorio bajo un único comando
 *  de compilación (`npm run build`).
 * 
 * Funcionalidades Clave:
 *  1. Sidebar de Navegación Lateral: Secciones de Dashboard, Prospectos, IA Trainer y Configuración.
 *  2. Tarjetas de Estadísticas en Tiempo Real: Leads totales, interacciones con agentes y tasa de conversión.
 *  3. Tabla Dinámica de Leads: Muestra el flujo de captación reciente con badges de estado.
 * ==============================================================================
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Users, Bot, Settings, LayoutDashboard, Database, UserCheck, FolderGit2, LogOut, Bell, ExternalLink, Workflow, MessageSquare, Crosshair, Shield } from 'lucide-react';
import { DataTable } from '../../components/admin/DataTable';
import { DashboardSummary, type AdminTab } from '../../components/admin/DashboardSummary';
import LeadPipeline from '../../components/admin/LeadPipeline';
import MaxChat from '../../components/admin/MaxChat';
import ClientInbox from '../../components/admin/ClientInbox';
import { N8nWorkflows } from '../../components/admin/N8nWorkflows';

// Leaflet accede a `window` → solo se carga en cliente (evita fallo de prerender)
const HunterMap = dynamic(() => import('../../components/admin/HunterMap').then((m) => m.HunterMap), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400 text-sm">
      Cargando mapa…
    </div>
  ),
});



export default function AdminDashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState(true);

  

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [prospectosView, setProspectosView] = useState<'pipeline' | 'tabla'>('pipeline');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0d10] text-slate-100 font-sans flex flex-col md:flex-row">
      {/* ========================================================================
          SIDEBAR DE NAVEGACIÓN LATERAL
         ======================================================================== */}
      <aside className="w-full md:w-64 bg-slate-900/60 border-b md:border-b-0 md:border-r border-slate-800/80 p-5 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo y Nombre del Panel */}
          <div className="flex items-center gap-3 px-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight block">AgenciAlquimia</span>
              <span className="text-[11px] text-emerald-400 font-mono block">PANEL DE CONTROL</span>
            </div>
          </div>

          {/* Menú de Opciones */}
          <nav className="space-[#1px] space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Resumen General</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('hunter')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'hunter'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Crosshair className="w-4 h-4" />
              <span>Lead Hunter 🗺️</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('leads')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'leads'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Pipeline & Captación</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('inbox')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'inbox'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Inbox de Clientes</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('n8n')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'n8n'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Workflow className="w-4 h-4 text-emerald-400" />
              <span>Workflows n8n</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('trainer')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'trainer'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>Chat con Max (IA)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('supabase')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'supabase'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Tablas Supabase</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === 'settings'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Configuración</span>
            </button>
          </nav>
        </div>

        {/* Footer del Sidebar */}
        <div className="pt-6 border-t border-slate-800/80 mt-6 space-y-3">
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800/40 transition-colors"
          >
            <span>Volver a la web pública</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center justify-between px-2 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-semibold text-xs border border-slate-700">
                AD
              </div>
              <div>
                <span className="text-xs font-bold text-white block leading-tight">Admin</span>
                <span className="text-[10px] text-slate-500 block">Supabase / JWT</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/60 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================
          ÁREA PRINCIPAL DE CONTENIDO
         ======================================================================== */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Header Superior */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-8 border-b border-slate-800/80">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              {activeTab === 'dashboard' && 'Resumen General'}
              {activeTab === 'hunter' && 'Lead Hunter 🗺️ (Mapa de Prospectos Galicia)'}
              {activeTab === 'leads' && 'Pipeline & Gestión de Leads'}
              {activeTab === 'inbox' && 'Inbox de Clientes (Consultas & Chat Web)'}
              {activeTab === 'n8n' && 'Flujos n8n (Diagramas & Ejecuciones)'}
              {activeTab === 'trainer' && 'Chat con Max (Asistente Comercial IA)'}
              {activeTab === 'supabase' && 'Explorador de Tablas (Supabase Cloud)'}
              {activeTab === 'settings' && 'Configuración del Sistema'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Monitoreo operativo de automatizaciones, base de datos y prospección en tiempo real.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setNotifications(!notifications)}
              className={`p-2.5 rounded-xl border transition-all ${
                notifications
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
              title="Notificaciones operativas"
            >
              <Bell className="w-4 h-4" />
            </button>
            <span className="hidden sm:inline-block px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
              VPS Coolify · Producción
            </span>
          </div>
        </header>

        {/* Pestaña: Resumen General */}
        {activeTab === 'dashboard' && <DashboardSummary onNavigate={setActiveTab} />}

        {/* Pestaña: Hunter Map */}
        {activeTab === 'hunter' && (
          <section className="space-y-6">
            <HunterMap />
          </section>
        )}

        {/* Pestaña: Prospectos / Leads */}
        {activeTab === 'leads' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between gap-4 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setProspectosView('pipeline')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                    prospectosView === 'pipeline'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Vista Kanban (Pipeline)
                </button>
                <button
                  type="button"
                  onClick={() => setProspectosView('tabla')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                    prospectosView === 'tabla'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Vista Tabla Supabase
                </button>
              </div>
            </div>

            {prospectosView === 'pipeline' ? (
              <LeadPipeline />
            ) : (
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                  Registro Reciente de Prospección
                </h3>
                <DataTable initialTable="leads_agencialquimia" />
              </div>
            )}
          </section>
        )}

        {/* Pestaña: Inbox de Clientes */}
        {activeTab === 'inbox' && (
          <section className="space-y-6">
            <ClientInbox />
          </section>
        )}

        {/* Pestaña: Flujos n8n */}
        {activeTab === 'n8n' && (
          <section className="space-y-6">
            <N8nWorkflows />
          </section>
        )}

        {/* Pestaña: Chat con Max (IA Trainer / OpenClaw) */}
        {activeTab === 'trainer' && (
          <section className="space-y-6">
            <MaxChat />
          </section>
        )}

        {/* Pestaña: Tablas Supabase */}
        {activeTab === 'supabase' && (
          <section className="space-y-6">
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                Explorador Interactivo de Base de Datos
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                Conexión en vivo con el clúster de Supabase Cloud. Selecciona cualquier tabla expuesta para paginar sus filas.
              </p>
              <DataTable />
            </div>
          </section>
        )}

        {/* Pestaña: Configuración */}
        {activeTab === 'settings' && (
          <section className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  Seguridad & Autenticación
                </h3>
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Método de sesión:</span>
                    <span className="font-mono text-emerald-400">JWT Web Crypto (HMAC SHA-256)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Cookie:</span>
                    <span className="font-mono text-slate-200">HttpOnly · SameSite=lax</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400">Expiración:</span>
                    <span className="font-mono text-slate-200">12 Horas</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-emerald-400" />
                  Infraestructura & Despliegue
                </h3>
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Servidor VPS:</span>
                    <span className="font-mono text-emerald-400">Coolify PaaS (Docker)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Proxy Reverso:</span>
                    <span className="font-mono text-slate-200">Traefik + Nginx Cache</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400">Integración IA:</span>
                    <span className="font-mono text-slate-200">n8n (cerebro.agencialquimia.com)</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
