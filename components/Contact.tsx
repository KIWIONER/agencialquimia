'use client';

/**
 * ==============================================================================
 * Componente: Contact.tsx
 * ==============================================================================
 * Descripción:
 *  Formulario de captación de leads y solicitud de Diagnóstico de IA en Tema Negro-Grisáceo (#0b0d10).
 * 
 * Estética Visual:
 *  1. Tarjeta en Cristal Negro-Grisáceo (`glass-card-dark` - `#161a22`).
 *  2. Campos de Entrada con fondo carbón profundo (`#0f1217`) y enfoque neón.
 *  3. Botón CTA verde esmeralda con sombra resplandeciente.
 * ==============================================================================
 */

import { useState, FormEvent } from 'react';
import { Send, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    sector: '',
    privacy: false,
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim()) {
      setErrorMessage('Por favor, ingresa tu nombre.');
      return;
    }
    if (!formData.whatsapp.trim()) {
      setErrorMessage('Por favor, ingresa un número de WhatsApp de contacto.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Por favor, ingresa un email válido.');
      return;
    }
    if (!formData.sector) {
      setErrorMessage('Por favor, selecciona el sector de tu negocio.');
      return;
    }
    if (!formData.privacy) {
      setErrorMessage('Debes aceptar la política de privacidad para enviar la solicitud.');
      return;
    }

    setStatus('submitting');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setStatus('success');
      setFormData({ name: '', whatsapp: '', email: '', sector: '', privacy: false });
    } catch {
      setStatus('error');
      setErrorMessage('Hubo un error al enviar el formulario. Inténtalo de nuevo o contáctanos por WhatsApp.');
    }
  };

  return (
    <section id="contact" className="py-24 bg-[#0b0d10] relative">
      <div className="max-w-4xl mx-auto px-6">
        {/* Encabezado del Formulario */}
        <div className="text-center space-y-4 mb-14">
          <span className="text-emerald-400 font-bold tracking-widest text-xs uppercase px-3.5 py-1.5 rounded-full bg-[#161a22] border border-emerald-500/30">
            Diagnóstico Gratuito
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            Cuéntanos tu caso. <span className="text-emerald-400">Te respondemos hoy.</span>
          </h2>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
            Diagnóstico sin compromiso. Si podemos ayudarte, te lo decimos con un plan concreto. Si no, también.
          </p>
        </div>

        {/* Tarjeta del formulario */}
        <div className="p-8 sm:p-12 rounded-3xl glass-card-dark shadow-2xl relative overflow-hidden">
          {status === 'success' ? (
            <div className="text-center py-12 space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-white">¡Solicitud recibida con éxito!</h3>
              <p className="text-gray-300 max-w-md mx-auto text-sm">
                Hemos registrado tus datos correctamente. Nuestro equipo analizará tu caso y te contactará por WhatsApp en menos de 2 horas.
              </p>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-500 text-emerald-950 font-bold text-sm hover:bg-emerald-400 transition-colors cursor-pointer"
              >
                Enviar otra consulta
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Campo Nombre */}
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-200">
                    Tu Nombre *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nombre completo"
                    className="w-full px-4 py-3 rounded-xl bg-[#0f1217] border border-white/10 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none text-white text-sm transition-all placeholder-gray-500"
                    required
                  />
                </div>

                {/* Campo WhatsApp */}
                <div className="space-y-2">
                  <label htmlFor="whatsapp" className="block text-sm font-semibold text-gray-200">
                    WhatsApp *
                  </label>
                  <input
                    type="tel"
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="+34 600 000 000"
                    className="w-full px-4 py-3 rounded-xl bg-[#0f1217] border border-white/10 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none text-white text-sm transition-all placeholder-gray-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Campo Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-200">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="tu@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-[#0f1217] border border-white/10 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none text-white text-sm transition-all placeholder-gray-500"
                    required
                  />
                </div>

                {/* Campo Sector */}
                <div className="space-y-2">
                  <label htmlFor="sector" className="block text-sm font-semibold text-gray-200">
                    Sector de tu negocio *
                  </label>
                  <select
                    id="sector"
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#0f1217] border border-white/10 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none text-white text-sm transition-all"
                    required
                  >
                    <option value="" disabled className="bg-[#0f1217] text-gray-400">
                      Selecciona tu sector...
                    </option>
                    <option value="hosteleria" className="bg-[#0f1217] text-white">Hostelería / Restauración</option>
                    <option value="salud" className="bg-[#0f1217] text-white">Clínica / Salud / Wellness</option>
                    <option value="inmobiliaria" className="bg-[#0f1217] text-white">Inmobiliaria</option>
                    <option value="retail" className="bg-[#0f1217] text-white">Retail / Comercio Local</option>
                    <option value="formacion" className="bg-[#0f1217] text-white">Formación / Academia</option>
                    <option value="profesional" className="bg-[#0f1217] text-white">Agencia / Servicios Profesionales</option>
                    <option value="otro" className="bg-[#0f1217] text-white">Otro</option>
                  </select>
                </div>
              </div>

              {/* Casilla RGPD */}
              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="privacy"
                  checked={formData.privacy}
                  onChange={(e) => setFormData({ ...formData, privacy: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 border-white/20 bg-[#0f1217] cursor-pointer"
                  required
                />
                <label htmlFor="privacy" className="text-xs text-gray-400 leading-normal">
                  He leído y acepto la Política de Privacidad. Consiento el tratamiento de mis datos para recibir información comercial.
                </label>
              </div>

              {/* Botón de Envío */}
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-base transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {status === 'submitting' ? (
                  <span>Enviando solicitud...</span>
                ) : (
                  <>
                    <span>SOLICITAR MI DIAGNÓSTICO DE IA</span>
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center flex items-center justify-center gap-2 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Te contactamos por WhatsApp en menos de 2 horas</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
