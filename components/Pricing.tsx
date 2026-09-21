/**
 * ==============================================================================
 * Componente: Pricing.tsx
 * ==============================================================================
 * Descripción:
 *  Sección de Tarifas y Modelos de Implantación de Arquitectura Web con IA.
 * 
 * Cumplimiento WCAG 2.1 AA:
 *  1. Ratio de Contraste > 4.5:1 en todos los textos sobre fondos oscuros.
 *  2. Estructura semántica clara con listas de funcionalidades contrastadas.
 * ==============================================================================
 */

import { Check, Star, ArrowRight } from 'lucide-react';

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-[#0b0d10] text-gray-100 relative">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        
        {/* Cabecera de Sección */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
            MODELOS DE IMPLANTACIÓN & INVERSIÓN
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Planes Transparentes.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Arquitectura Propietaria.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-300 font-normal">
            Código, datos y plataforma 100% de tu propiedad. Sin comisiones ocultas por uso ni dependencias de plataformas terceras.
          </p>
        </div>

        {/* Cuadrícula de 3 Niveles de Precios */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-4">
          
          {/* Nivel 1: Web Inteligente & Captación */}
          <div className="p-8 rounded-3xl glass-card-dark flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300">
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wide">WEB & CAPTACIÓN IA</h3>
              <p className="text-emerald-400 text-xs font-semibold mt-1">Setup: 900€ (desarrollo e implantación)</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-white">97€</span>
                <span className="text-gray-400 text-sm font-semibold">/mes</span>
              </div>
              <ul className="mt-8 space-y-4 text-sm text-gray-200">
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Web a medida en Next.js 15 (Rendimiento 100)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Agente IA conversacional embebido en Web y WhatsApp</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Gestión de citas sincronizada en tiempo real</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Alojamiento en infraestructura privada VPS</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Soporte técnico, mantenimiento y actualizaciones</span>
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
                Ideal para: clínicas locales, despachos, comercios
              </p>
            </div>
          </div>

          {/* Nivel 2: Ecosistema Operativo & Backend (Destacado) */}
          <div className="relative p-8 rounded-3xl bg-[#141e19] text-white shadow-2xl border-2 border-emerald-400 flex flex-col justify-between scale-105 z-10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-emerald-950 text-xs font-extrabold tracking-widest uppercase flex items-center gap-1.5 shadow-lg shadow-emerald-500/30">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>MÁS COMPLETO</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wide">ECOSISTEMA OPERATIVO</h3>
              <p className="text-emerald-400 text-xs font-semibold mt-1">Setup: 1.800€ (arquitectura completa)</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-white">197€</span>
                <span className="text-gray-300 text-sm font-semibold">/mes</span>
              </div>
              <ul className="mt-8 space-y-4 text-sm text-gray-200">
                <li className="flex items-center gap-3 font-semibold text-emerald-400">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Todo lo del Plan Web, más:</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Microservicio Python para extracción y documentos</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Conexión con software de facturación / ERP (Holded, etc.)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Orquestación de flujos privados con n8n</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Pipeline CRM de captación y alertas al equipo</span>
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
                Ideal para: inmobiliarias, restaurantes, empresas de servicios
              </p>
            </div>
          </div>

          {/* Nivel 3: Arquitectura Propietaria & Dedicated Cloud */}
          <div className="p-8 rounded-3xl glass-card-dark flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300">
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wide">ARQUITECTURA PROPIETARIA</h3>
              <p className="text-emerald-400 text-xs font-semibold mt-1">Setup: 3.500€ (solución a medida)</p>
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
                  <span>Panel de Control / CRM Propietario a medida</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Modelos predictivos de Machine Learning y Scoring</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Servidor VPS dedicado exclusivo con PostgreSQL</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Auditoría mensual presencial/remota y optimización</span>
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
                Ideal para: empresas consolidadas, academias, centros con equipo
              </p>
            </div>
          </div>
        </div>

        {/* Nota pie de página */}
        <div className="text-center max-w-2xl mx-auto space-y-3 pt-6">
          <p className="text-xs text-emerald-400 font-semibold">
            * Cada desarrollo se entrega con código limpio y soberanía de datos garantizada por contrato.
          </p>
          <p className="text-sm text-gray-300">
            ¿Necesitas una infraestructura específica? Diseñamos la arquitectura técnica adecuada para tu volumen operativo.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 font-bold text-emerald-400 hover:text-emerald-300 text-lg no-underline pt-2"
          >
            <span>Solicitar propuesta de arquitectura</span>
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
