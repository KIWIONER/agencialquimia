/**
 * ==============================================================================
 * Componente: Services.tsx
 * ==============================================================================
 * Descripción:
 *  Sección de catálogo de servicios e ingeniería de automatización en Tema Negro-Grisáceo.
 * 
 * Accesibilidad & Cumplimiento WCAG 2.1 AA:
 *  1. Ratio de Contraste > 5.5:1 en todos los textos explicativos e infografía.
 * ==============================================================================
 */

import { MessageSquare, FileText, Cpu, Check } from 'lucide-react';

export default function Services() {
  return (
    <section id="services" className="py-24 bg-[#0b0d10] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Encabezado de la sección */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-emerald-400 font-bold tracking-widest text-xs uppercase px-3.5 py-1.5 rounded-full bg-[#161a22] border border-emerald-500/30">
            Ingeniería Operativa
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            Ingeniería que genera <span className="text-emerald-400">resultados inmediatos</span>
          </h2>
          <p className="text-gray-200 text-lg leading-relaxed font-normal">
            Módulos funcionales de alto rendimiento listos para integrarse en tu operación con precisión milimétrica y escalabilidad total.
          </p>
        </div>

        {/* Grid de las 3 tarjetas de servicios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {/* Módulo 1: Centralita WhatsApp IA */}
          <div className="relative p-8 rounded-3xl glass-card-dark flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-bold tracking-wider px-3 py-1 rounded-full bg-emerald-500 text-emerald-950 uppercase">
                  MÁS DEMANDADO
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white">Centralita WhatsApp IA</h3>
              <p className="text-gray-200 leading-relaxed text-sm">
                Interacción nativa desde tu número corporativo. Resuelve consultas técnicas, gestiona interesados y coordina citas con lenguaje natural.
              </p>
            </div>
            <ul className="mt-8 pt-6 border-t border-white/10 space-y-3 text-sm text-gray-100 font-medium">
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Conversación Experta y Fluida</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Soberanía y Seguridad de Datos</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Conexión Real con tu Negocio</span>
              </li>
            </ul>
          </div>

          {/* Módulo 2: Gestión de Documentos */}
          <div className="relative p-8 rounded-3xl glass-card-dark flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white">Gestión de Documentos</h3>
              <p className="text-gray-200 leading-relaxed text-sm">
                Procesamiento inteligente de registros oficiales. Extracción automatizada de datos en Notas Simples y Albaranes para transformar información compleja en activos operativos.
              </p>
            </div>
            <ul className="mt-8 pt-6 border-t border-white/10 space-y-3 text-sm text-gray-100 font-medium">
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Eliminación de errores de carga</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Lectura inteligente de PDF / Imagen</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sincronización con base de datos</span>
              </li>
            </ul>
          </div>

          {/* Módulo 3: Integración Total de Sistemas */}
          <div className="relative p-8 rounded-3xl glass-card-dark flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Cpu className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white">Integración Total de Sistemas</h3>
              <p className="text-gray-200 leading-relaxed text-sm">
                Conectamos tu web, WhatsApp, agenda, inventario y CRM en un único ecosistema sincronizado. Lo que pasa en un sitio se actualiza en todos automáticamente.
              </p>
            </div>
            <ul className="mt-8 pt-6 border-t border-white/10 space-y-3 text-sm text-gray-100 font-medium">
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Flujos operativos sincronizados</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Gestión de inventario en tiempo real</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Conectividad entre sistemas</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Banner de arquitectura técnica en Negro-Grisáceo */}
        <div className="p-8 md:p-12 rounded-3xl bg-[#12161f] border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Núcleo Operativo Alquimia
              </h3>
              <p className="text-gray-200 text-sm max-w-2xl mx-auto font-medium">
                Métricas de rendimiento auditadas en tiempo real. Infraestructura optimizada para la mínima latencia.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 text-center">
              <div className="p-4 rounded-2xl bg-[#1a1f2c] border border-white/10">
                <span className="block text-xs uppercase tracking-widest text-emerald-400 font-bold mb-1">
                  Rendimiento (SI)
                </span>
                <span className="text-3xl font-extrabold text-white">0.7s</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#1a1f2c] border border-white/10">
                <span className="block text-xs uppercase tracking-widest text-emerald-400 font-bold mb-1">
                  Misiones Radar
                </span>
                <span className="text-3xl font-extrabold text-white">+1.2k</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#1a1f2c] border border-white/10">
                <span className="block text-xs uppercase tracking-widest text-emerald-400 font-bold mb-1">
                  Sectores Activos
                </span>
                <span className="text-3xl font-extrabold text-white">5</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#1a1f2c] border border-white/10">
                <span className="block text-xs uppercase tracking-widest text-emerald-400 font-bold mb-1">
                  SEO Score
                </span>
                <span className="text-3xl font-extrabold text-emerald-400">100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
