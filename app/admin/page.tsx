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

import { Shield, UserCheck, Database, FolderGit2 } from 'lucide-react';
import { DataTable } from '../../components/admin/DataTable';
import { DashboardSummary, type AdminTab } from '../../components/admin/DashboardSummary';
import LeadPipeline from '../../components/admin/LeadPipeline';
import MaxChat from '../../components/admin/MaxChat';
import ClientInbox from '../../components/admin/ClientInbox';
import { N8nWorkflows } from '../../components/admin/N8nWorkflows';
import MarketingDashboard from '../../components/admin/MarketingDashboard';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';

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
  

  

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [prospectosView, setProspectosView] = useState<'pipeline' | 'tabla'>('pipeline');

  useEffect(() => {
    setMounted(true);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    <div className="min-h-screen bg-slate-50 text-stone-800 font-sans flex flex-col md:flex-row">
      {/* ========================================================================
          SIDEBAR DE NAVEGACIÓN LATERAL
         ======================================================================== */}
      <AdminSidebar
        activeTab={
          activeTab === 'dashboard' ? 'summary' :
          activeTab === 'prospectos' ? 'pipeline' :
          activeTab === 'trainer' ? 'max' : activeTab
        }
        onSelectTab={(tabId) => {
          if (tabId === 'summary') setActiveTab('dashboard');
          else if (tabId === 'pipeline') setActiveTab('prospectos');
          else if (tabId === 'max') setActiveTab('trainer');
          else setActiveTab(tabId as AdminTab);
        }}
      />

      {/* ========================================================================
          ÁREA PRINCIPAL DE CONTENIDO
         ======================================================================== */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50">
        <AdminHeader
          title={
            activeTab === 'dashboard' ? 'Resumen General' :
            activeTab === 'hunter' ? 'Lead Hunter (Mapa de Prospectos)' :
            activeTab === 'prospectos' ? 'Pipeline de Leads' :
            activeTab === 'inbox' ? 'Inbox de Clientes' :
            activeTab === 'n8n' ? 'Workflows n8n' :
            activeTab === 'marketing' ? 'Marketing & Ads' :
            activeTab === 'trainer' ? 'Chat con Max (IA)' :
            activeTab === 'tables' ? 'Tablas Supabase Cloud' : 'Configuración'
          }
        />
        <div className="p-4 md:p-8 space-y-6 flex-1">

        {/* Pestaña: Resumen General */}
        {activeTab === 'dashboard' && <DashboardSummary onNavigate={setActiveTab} />}

        {/* Pestaña: Hunter Map */}
        {activeTab === 'hunter' && (
          <section className="space-y-6">
            <HunterMap />
          </section>
        )}

        {/* Pestaña: Prospectos / Leads */}
        {activeTab === 'prospectos' && (
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

        {/* Pestaña: Marketing & Ads */}
        {activeTab === 'marketing' && (
          <section className="space-y-6">
            <MarketingDashboard />
          </section>
        )}

        {/* Pestaña: Chat con Max (IA Trainer / OpenClaw) */}
        {activeTab === 'trainer' && (
          <section className="space-y-6">
            <MaxChat />
          </section>
        )}

        {/* Pestaña: Tablas Supabase */}
        {activeTab === 'tables' && (
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
      </div>
      </main>
    </div>
  );
}
