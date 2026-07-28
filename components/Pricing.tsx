/**
 * ==============================================================================
 * Componente: Pricing.tsx
 * ==============================================================================
 * Descripción:
 *  Tabla de precios transparente en Tema Negro-Grisáceo (#0b0d10).
 * 
 * Estética Visual:
 *  1. Planes en cristal negro-grisáceo (`glass-card-dark` - `#161a22`).
 *  2. Plan Destacado "Más Popular": Resaltado en verde esmeralda neón sobre carbón oscuro.
 *  3. Garantía y Diagnóstico Gratuito.
 * ==============================================================================
 */

import { Check, Star, ArrowRight } from 'lucide-react';

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-[#0b0d10] border-y border-white/10 relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Encabezado de precios */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-emerald-400 font-bold tracking-widest text-xs uppercase px-3.5 py-1.5 rounded-full bg-[#161a22] border border-emerald-500/30">
            Precios Transparentes
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            Inversión clara, retorno <span className="text-emerald-400">inmediato</span>
          </h2>
          <p className="text-gray-300 text-lg">
            Cada plan incluye un setup único de configuración y una mensualidad de mantenimiento, soporte y hosting.
          </p>
        </div>

        {/* Grid comparativo en Fondo Negro-Grisáceo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Nivel 1: Plan Esencial */}
          <div className="p-8 rounded-3xl glass-card-dark flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300">
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wide">PLAN ESENCIAL</h3>
              <p className="text-emerald-400 text-xs font-semibold mt-1">Setup: 800€ (pago único)</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-white">97€</span>
                <span className="text-gray-400 text-sm font-semibold">/mes</span>
              </div>
              <ul className="mt-8 space-y-4 text-sm text-gray-200">
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Agente IA en WhatsApp</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Web corporativa con formulario</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Gestión de citas con Google Calendar</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Hosting en infraestructura propia</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Soporte mensual continuo</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
              <a
                href="#contact"
                className="w-full py-3.5 px-6 rounded-xl bg-[#1f2530] hover:bg-[#28303f] border border-white/10 text-white font-bold text-center block transition-colors no-underline"
              >
                Seleccionar Plan
              </a>
              <p className="text-[11px] text-center text-gray-400">
                Ideal para: autónomos, clínicas pequeñas
              </p>
            </div>
          </div>

          {/* Nivel 2: Plan Operacional (Destacado) */}
          <div className="relative p-8 rounded-3xl bg-[#141e19] text-white shadow-2xl border-2 border-emerald-400 flex flex-col justify-between scale-105 z-10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-emerald-950 text-xs font-extrabold tracking-widest uppercase flex items-center gap-1.5 shadow-lg shadow-emerald-500/30">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>MÁS POPULAR</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wide">PLAN OPERACIONAL</h3>
              <p className="text-emerald-400 text-xs font-semibold mt-1">Setup: 1.800€ (pago único)</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-white">197€</span>
                <span className="text-gray-300 text-sm font-semibold">/mes</span>
              </div>
              <ul className="mt-8 space-y-4 text-sm text-gray-200">
                <li className="flex items-center gap-3 font-semibold text-emerald-400">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Todo lo del Plan Esencial, más:</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Agente IA multicanal (WhatsApp + Web)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Procesamiento automático de documentos</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Automatizaciones personalizadas</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>CRM básico de captación de leads</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Notificaciones automáticas al equipo</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-6 border-t border-emerald-500/30 space-y-3">
              <a
                href="#contact"
                className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-center block transition-colors shadow-lg shadow-emerald-500/25 no-underline"
              >
                Seleccionar Plan
              </a>
              <p className="text-[11px] text-center text-emerald-300/80">
                Ideal para: restaurantes, inmobiliarias, centros médicos
              </p>
            </div>
          </div>

          {/* Nivel 3: Plan Ecosistema */}
          <div className="p-8 rounded-3xl glass-card-dark flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300">
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wide">PLAN ECOSISTEMA</h3>
              <p className="text-emerald-400 text-xs font-semibold mt-1">Setup: 3.500€ (pago único)</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-white">397€</span>
                <span className="text-gray-400 text-sm font-semibold">/mes</span>
              </div>
              <ul className="mt-8 space-y-4 text-sm text-gray-200">
                <li className="flex items-center gap-3 font-semibold text-emerald-400">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Todo lo anterior, más:</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Panel admin a medida</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>IA avanzada (Memoria y Contexto profundo)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Campus LMS o plataforma de formación</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Seguimiento de leads automático</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Reunión mensual de optimización</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
              <a
                href="#contact"
                className="w-full py-3.5 px-6 rounded-xl bg-[#1f2530] hover:bg-[#28303f] border border-white/10 text-white font-bold text-center block transition-colors no-underline"
              >
                Seleccionar Plan
              </a>
              <p className="text-[11px] text-center text-gray-400">
                Ideal para: academias, agencias, empresas con equipo
              </p>
            </div>
          </div>
        </div>

        {/* Nota pie de página */}
        <div className="text-center max-w-2xl mx-auto space-y-3 pt-6">
          <p className="text-xs text-emerald-400 font-semibold">
            * Compromiso mínimo de 3 meses para asegurar la optimización y resultados del sistema.
          </p>
          <p className="text-sm text-gray-300">
            ¿No sabes qué plan necesitas? El diagnóstico gratuito te lo aclara en 24h. Sin compromiso.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 font-bold text-emerald-400 hover:text-emerald-300 text-lg no-underline pt-2"
          >
            <span>Solicitar diagnóstico gratuito</span>
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
