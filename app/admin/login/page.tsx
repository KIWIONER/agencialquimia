'use client';

/**
 * ==============================================================================
 * Archivo: app/admin/login/page.tsx
 * ==============================================================================
 * Descripción:
 *  Página de autenticación para el Panel de Administración de AgenciAlquimia.
 * 
 * Mejoras UI/UX & Seguridad:
 *  1. Iconografía de candados e insignias de seguridad inactivas (Lucide React).
 *  2. Bloque educacional CRO para usuarios externos (Canalización a WhatsApp/Sesión).
 *  3. Desactivación de autofill automático del navegador para mantener campos vacíos por defecto.
 *  4. Cumplimiento estricto WCAG 2.1 AA y diseño responsivo Dark Charcoal / Emerald.
 * ==============================================================================
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, KeyRound, ShieldAlert, MessageSquare, Calendar, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Credenciales incorrectas');
      }
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d10] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 rounded-2xl p-8 backdrop-blur-md shadow-2xl">
        {/* Cabecera */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3">
            <Lock className="w-6 h-6" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AgenciAlquimia</h1>
          <p className="text-slate-400 text-sm mt-1">Panel de Administración Privado</p>
        </div>

        {/* Alerta de Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-sm text-center font-medium animate-fadeIn">
            {error}
          </div>
        )}

        {/* Formulario de Login sin Autofill */}
        <form onSubmit={handleLogin} autoComplete="off" className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center justify-between">
              <span>Correo Electrónico</span>
              <Lock className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-sm"
                placeholder="admin@agencialquimia.es"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center justify-between">
              <span>Contraseña</span>
              <KeyRound className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-950/30 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Autenticando…</span>
              </span>
            ) : (
              <>
                <span>Acceder al Panel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Bloque Educativo & Canalización de Acceso (CRO) */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <div className="flex items-center justify-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-2">
            <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Acceso Privado &amp; Restringido</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed mb-4">
            Este panel es de uso exclusivo para administración. Si eres cliente o deseas automatizar tu negocio, agenda una llamada estratégica o solicita acceso a través de nuestro chat.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href="https://wa.me/34604051111?text=Hola%20Mat%C3%ADas,%20estoy%20interesado%20en%20los%20servicios%20de%20AgenciAlquimia%20y%20deseo%20solicitar%20informaci%C3%B3n"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-emerald-300 text-xs font-medium border border-emerald-500/20 hover:border-emerald-500/40 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Contactar por WhatsApp</span>
            </a>
            <Link
              href="/#contacto"
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 hover:border-slate-600 transition-all"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Agendar Sesión</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
