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
import Link from 'next/link';
import { Users, Bot, TrendingUp, Shield, Settings, LayoutDashboard, Database, UserCheck, FolderGit2, LogOut, Bell, Send, ExternalLink, Workflow } from 'lucide-react';
import { DataTable } from '../../components/admin/DataTable';
import LeadPipeline from '../../components/admin/LeadPipeline';
import { N8nWorkflows } from '../../components/admin/N8nWorkflows';

interface LeadItem {
  id: string;
  nombre: string;
  sector: string;
  contacto: string;
  estado: 'Pendiente' | 'Enviado a IA' | 'Finalizado';
  fecha: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState(true);

  // Estados para el Chat IA (OpenClaw)
  const [chatInput, setChatInput] = useState('');
  
  type ChatMessage = { role: 'user' | 'ai', text: string };
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'ai', text: 'Hola 👋 Soy el asistente IA de AgenciAlquimia. ¿En qué te ayudo?' },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() => `panel_${Date.now()}`);

  // Estado local para los prospectos/leads recibidos
  const [leads] = useState<LeadItem[]>([
    { id: '1', nombre: 'Carlos Ruiz', sector: 'Retail', contacto: 'carlos@tienda.es', estado: 'Pendiente', fecha: 'Hoy, 10:30' },
    { id: '2', nombre: 'Lucía Fer', sector: 'Wellness', contacto: '+34 600 123 456', estado: 'Enviado a IA', fecha: 'Ayer, 18:20' },
    { id: '3', nombre: 'Juan Gómez', sector: 'Inmobiliaria', contacto: 'juan@prop.com', estado: 'Finalizado', fecha: '22 Abr' },
    { id: '4', nombre: 'Elena Blanco', sector: 'Salud', contacto: '+34 604 555 888', estado: 'Enviado a IA', fecha: 'Hace 2 horas' },
  ]);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'supabase' | 'n8n' | 'trainer' | 'settings'>('dashboard');
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const newUserMsg: ChatMessage = { role: 'user', text: chatInput };
    setChatMessages((prev: ChatMessage[]) => [...prev, newUserMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      // Chat real con el agente (webhook de n8n vía proxy admin)
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatInput: newUserMsg.text, sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Error');
      setChatMessages((prev: ChatMessage[]) => [...prev, { role: 'ai', text: data.response }]);
    } catch (err) {
      setChatMessages((prev: ChatMessage[]) => [
        ...prev,
        { role: 'ai', text: `⚠️ Error al contactar con el agente: ${err instanceof Error ? err.message : 'desconocido'}` },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Reinicia la conversación con un sessionId nuevo (el agente olvida el hilo)
  const nuevaConversacion = () => {
    setSessionId(`panel_${Date.now()}`);
    setChatMessages([{ role: 'ai', text: 'Hola 👋 Soy el asistente IA de AgenciAlquimia. ¿En qué te ayudo?' }]);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Mensaje de bloqueo para versiones móviles */}
      <div className="flex md:hidden min-h-screen bg-slate-950 flex-col items-center justify-center p-6 text-center space-y-4">
        <Shield className="w-16 h-16 text-emerald-500" />
        <h2 className="text-2xl font-bold text-white">Acceso Restringido</h2>
        <p className="text-slate-400 text-sm max-w-sm">
          Por motivos de seguridad y usabilidad, el panel de administración solo está disponible en dispositivos de escritorio y pantallas grandes.
        </p>
      </div>

      {/* Panel Administrativo completo (visible solo a partir de md) */}
      <div className="hidden md:flex min-h-screen bg-slate-950 text-slate-100 font-sans w-full">
        {/* Sidebar Lateral de Navegación del Panel Admin */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          {/* Logo Corporativo del Admin */}
          <div className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Shield className="w-7 h-7 text-emerald-500" />
            <span>
              Agenci<span className="text-emerald-500">Alquimia</span>
            </span>
          </div>

          {/* Menú de Navegación Lateral */}
          <nav className="space-y-2">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('leads')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors cursor-pointer ${
                activeTab === 'leads'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Prospectos (Leads)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('supabase')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors cursor-pointer ${
                activeTab === 'supabase'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <FolderGit2 className="w-5 h-5" />
              <span>Tablas Supabase</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('n8n')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors cursor-pointer ${
                activeTab === 'n8n'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Workflow className="w-5 h-5" />
              <span>Workflows n8n</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('trainer')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors cursor-pointer ${
                activeTab === 'trainer'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Bot className="w-5 h-5" />
              <span>IA Trainer</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Configuración</span>
            </button>
            
            <div className="pt-4 mt-2 border-t border-slate-800">
              <Link
                href="/"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors cursor-pointer text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Volver a la Web</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* Footer del Sidebar con perfil de usuario */}
        <div className="pt-6 border-t border-slate-800 text-xs text-slate-400">
          <p className="font-semibold text-slate-200">Admin Alquimia</p>
          <p className="text-[11px] text-slate-500">Santiago de Compostela</p>
        </div>
      </aside>

      {/* Áreas de Contenido Principal del Dashboard */}
      <main className="flex-1 p-8 overflow-y-auto space-y-8">
        {/* Cabecera del Panel */}
        <header className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {activeTab === 'supabase'
                ? 'Tablas de Supabase'
                : activeTab === 'n8n'
                  ? 'Workflows n8n'
                  : 'Dashboard General'}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {activeTab === 'supabase'
                ? 'Explorador y Gestión de carpetas / tablas de la Base de Datos'
                : activeTab === 'n8n'
                  ? 'Acceso en tiempo real al cerebro de automatización (cerebro.agencialquimia.com)'
                  : 'Control Center y Monitoreo de Leads en Tiempo Real'}
            </p>
          </div>
          <div className="px-4 py-2 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sistema Operativo Estable</span>
          </div>
        </header>

        {/* Grid de Métricas Principales */}
        {activeTab !== 'supabase' && activeTab !== 'n8n' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs uppercase font-bold tracking-wider">Total Leads</span>
                <UserCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-4xl font-extrabold text-white">{leads.length}</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs uppercase font-bold tracking-wider">Interacciones IA</span>
                <Bot className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-4xl font-extrabold text-white">1,284</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs uppercase font-bold tracking-wider">Tasa Conversión</span>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-4xl font-extrabold text-emerald-400">12.4%</p>
            </div>
          </div>
        )}

        {/* Renderizado condicional según la pestaña seleccionada */}
        {activeTab === 'supabase' ? (
          <DataTable initialTable="leads" />
        ) : activeTab === 'n8n' ? (
          <N8nWorkflows />
        ) : activeTab === 'trainer' ? (
          <section className="h-[70vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-emerald-400" />
                <span>IA Trainer · Chat con el agente</span>
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={nuevaConversacion}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  ✨ Nueva conversación
                </button>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Agente Online
                </span>
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto space-y-4 flex flex-col">
              {chatMessages.map((msg: ChatMessage, i: number) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl p-4 bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700">
                    <div className="flex gap-1.5 items-center px-2 py-1">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Escribe un mensaje para el agente..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || chatLoading}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </section>
        ) : activeTab === 'settings' ? (
          <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-400" />
                <span>Configuración de la Cuenta</span>
              </h2>
            </div>
            
            <div className="space-y-4 max-w-xl">
              {/* Opción de Notificaciones (Demo) */}
              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Notificaciones por Email</p>
                    <p className="text-xs text-slate-400">Recibir alertas de nuevos prospectos</p>
                  </div>
                </div>
                <button 
                  onClick={() => setNotifications(!notifications)}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${notifications ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${notifications ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Botón de Cerrar Sesión */}
              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Cerrar Sesión</p>
                    <p className="text-xs text-slate-400">Salir de forma segura del panel</p>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg transition-colors border border-red-500/20"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </section>
        ) : (
          /* Prospectos: pipeline guiado + tabla real de leads_agencialquimia */
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <span>Prospectos (Leads)</span>
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Datos en vivo de Supabase</span>
                <div className="flex rounded-xl bg-slate-800 border border-slate-700 p-0.5">
                  <button
                    type="button"
                    onClick={() => setProspectosView('pipeline')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      prospectosView === 'pipeline'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🗂️ Pipeline
                  </button>
                  <button
                    type="button"
                    onClick={() => setProspectosView('tabla')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      prospectosView === 'tabla'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    📋 Tabla
                  </button>
                </div>
              </div>
            </div>
            {prospectosView === 'pipeline' ? (
              <LeadPipeline />
            ) : (
              <DataTable initialTable="leads_agencialquimia" />
            )}
          </section>
        )}
      </main>
      </div>
    </>
  );
}
