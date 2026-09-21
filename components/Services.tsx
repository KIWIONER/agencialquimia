/**
 * ==============================================================================
 * Componente: Services.tsx
 * ==============================================================================
 * Descripción:
 *  Sección de Servicios y Capacidades de Ingeniería para AgenciAlquimia.
 *  Presenta los 4 Pilares de Arquitectura Web, Backend a Medida e Infraestructura con IA.
 * 
 * Accesibilidad & Cumplimiento WCAG 2.1 AA:
 *  1. Ratio de Contraste > 4.5:1 en todos los textos sobre fondos oscuros.
 *  2. Estructura semántica con encabezados jerárquicos (h2, h3, h4).
 *  3. Cuadrícula responsiva con tarjetas translúcidas de alto rendimiento.
 * ==============================================================================
 */

import { 
  Globe, 
  Cpu, 
  Layers, 
  Database, 
  Check, 
  ShieldCheck, 
  X, 
  Zap 
} from 'lucide-react';

export default function Services() {
  return (
    <section id="services" className="py-24 bg-[#0b0d10] text-gray-100 relative">
      <div className="max-w-7xl mx-auto px-6 space-y-20">
        
        {/* Cabecera de Sección */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>Capacidades de Ingeniería & Desarrollo</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Más que simples bots:{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Arquitectura Digital Integral
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-300 font-normal leading-relaxed">
            Diseñamos soluciones tecnológicas a medida para resolver los problemas reales de tu operativa diaria: desde el frontend hasta la base de datos y la automatización inteligente.
          </p>
        </div>

        {/* Cuadrícula de los 4 Pilares de Servicios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Pilar 1: Arquitectura Web Next-Gen */}
          <div className="relative p-8 sm:p-10 rounded-3xl glass-card-dark flex flex-col justify-between hover:border-emerald-500/50 transition-all duration-300 group">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Globe className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">Pilar 01</span>
                <h3 className="text-2xl font-bold text-white">Arquitectura Web & Aplicaciones con IA</h3>
              </div>
              <p className="text-gray-300 leading-relaxed text-sm">
                Desarrollamos páginas web y aplicaciones a medida con <strong>Next.js 15 y React 19</strong>. Cero plantillas lentas de WordPress. Interfaces interactivas, velocidad de carga instantánea (&lt; 1s) y agentes de IA conversacionales embebidos en el propio diseño para captar y asesorar 24/7.
              </p>
            </div>
            <ul className="mt-8 pt-6 border-t border-white/10 space-y-3 text-sm text-gray-200 font-medium">
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Rendimiento WPO y SEO técnico 100/100</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Chatbots y simuladores IA nativos en la UI</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Experiencia Dark Theme y diseño a medida de tu marca</span>
              </li>
            </ul>
          </div>

          {/* Pilar 2: Microservicios Backend en Python */}
          <div className="relative p-8 sm:p-10 rounded-3xl glass-card-dark flex flex-col justify-between hover:border-emerald-500/50 transition-all duration-300 group">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Cpu className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">Pilar 02</span>
                <h3 className="text-2xl font-bold text-white">Microservicios Backend & Motores de Datos (Python)</h3>
              </div>
              <p className="text-gray-300 leading-relaxed text-sm">
                Programamos lógica de servidor avanzada con <strong>FastAPI y Python</strong> para tareas complejas que las herramientas sin código no pueden resolver: extracción automatizada de datos (scraping ético), scoring predictivo de clientes potenciales y generación instantánea de informes y PDFs.
              </p>
            </div>
            <ul className="mt-8 pt-6 border-t border-white/10 space-y-3 text-sm text-gray-200 font-medium">
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Radar de prospección y extracción de mercado</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Generación de auditorías, albaranes y presupuestos PDF</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Modelos de cualificación y clasificación con Machine Learning</span>
              </li>
            </ul>
          </div>

          {/* Pilar 3: Orquestación Operativa & Sincronización */}
          <div className="relative p-8 sm:p-10 rounded-3xl glass-card-dark flex flex-col justify-between hover:border-emerald-500/50 transition-all duration-300 group">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Layers className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">Pilar 03</span>
                <h3 className="text-2xl font-bold text-white">Orquestación Operativa & Sincronización Total</h3>
              </div>
              <p className="text-gray-300 leading-relaxed text-sm">
                Conectamos tu web, WhatsApp Business API, pasarelas de pago, calendarios y programas de facturación (Holded, FacturaDirecta, Odoo, HubSpot) en un flujo automatizado mediante <strong>n8n privado</strong>. Lo que ocurre en un canal se sincroniza en todos en milisegundos.
              </p>
            </div>
            <ul className="mt-8 pt-6 border-t border-white/10 space-y-3 text-sm text-gray-200 font-medium">
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>WhatsApp, Email y Notificaciones internas conectadas</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sincronización bidireccional con tu software de gestión</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Confirmaciones y recordatorios anti-ausencias</span>
              </li>
            </ul>
          </div>

          {/* Pilar 4: Paneles de Control & Infraestructura Soberana */}
          <div className="relative p-8 sm:p-10 rounded-3xl glass-card-dark flex flex-col justify-between hover:border-emerald-500/50 transition-all duration-300 group">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Database className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">Pilar 04</span>
                <h3 className="text-2xl font-bold text-white">Paneles a Medida & Servidores Privados (Soberanía)</h3>
              </div>
              <p className="text-gray-300 leading-relaxed text-sm">
                Construimos <strong>paneles de control y CRM privados</strong> adaptados a tu operativa exacta para que no pagues licencias SaaS innecesarias. Todo alojado en <strong>servidores VPS propios con PostgreSQL y Docker</strong>, garantizando que el código y los datos sean 100% de tu propiedad y cumplan el RGPD.
              </p>
            </div>
            <ul className="mt-8 pt-6 border-t border-white/10 space-y-3 text-sm text-gray-200 font-medium">
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Tablero Kanban y visualización de métricas en vivo</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Alojamiento privado sin intermediarios externos</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Seguridad bancaria con firmas HMAC y JWT</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Sección Comparativa: Arquitectura Propietaria vs Plugins / Plantillas */}
        <div className="p-8 sm:p-12 rounded-3xl bg-[#12161f] border border-emerald-500/20 shadow-2xl space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">La Diferencia Técnica</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              ¿Por qué Arquitectura a Medida en lugar de Plugins o SaaS genéricos?
            </h3>
            <p className="text-gray-300 text-sm">
              Compara la diferencia entre instalar herramientas estándar de terceros frente a disponer de un ecosistema digital de tu propiedad.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
            
            {/* Opción A: Soluciones Genéricas / Plugins */}
            <div className="p-6 rounded-2xl bg-[#0b0d10] border border-red-500/20 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-red-500/20 text-red-400">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <X className="w-4 h-4 text-red-400" />
                  <span>Plugins Comerciales & SaaS Estándar</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-red-950/60 border border-red-500/30 text-red-300">
                  Herramientas Genéricas
                </span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold mt-0.5">✕</span>
                  <span><strong>Cuotas mensuales eternas</strong> que aumentan conforme crecen tus clientes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold mt-0.5">✕</span>
                  <span><strong>Rigidez funcional:</strong> Estás limitado a lo que el plugin permita configurar.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold mt-0.5">✕</span>
                  <span><strong>Datos en servidores de terceros:</strong> Riesgos de privacidad y cambios de condiciones.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold mt-0.5">✕</span>
                  <span><strong>Webs pesadas:</strong> Plantillas lentas que pierden el 40% de visitas por lentitud.</span>
                </li>
              </ul>
            </div>

            {/* Opción B: AgenciAlquimia */}
            <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-4 shadow-lg shadow-emerald-950/50">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30 text-emerald-400">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Arquitectura AgenciAlquimia</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-400/40 text-emerald-300 font-semibold">
                  Ecosistema Propietario
                </span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-gray-200">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                  <span><strong>Código y datos 100% de tu propiedad:</strong> Sin pagar suscripciones por usuario.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                  <span><strong>100% personalizable:</strong> Diseñado para resolver la casuística exacta de tu empresa.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                  <span><strong>Soberanía y RGPD:</strong> Alojado en tu infraestructura privada en España/Europa.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                  <span><strong>Rendimiento extremo:</strong> Next.js 15 compilado para máxima conversión y velocidad.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Banner de métricas auditadas */}
        <div className="p-8 md:p-12 rounded-3xl bg-[#12161f] border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Rendimiento & Estándares Técnicos Auditados
              </h3>
              <p className="text-gray-300 text-sm max-w-2xl mx-auto font-medium">
                Arquitectura monitorizada en tiempo real con cero compromisos en seguridad, velocidad y privacidad.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 text-center">
              <div className="p-4 rounded-2xl bg-[#1a1f2c] border border-white/10">
                <span className="block text-xs uppercase tracking-widest text-emerald-400 font-bold mb-1">
                  Velocidad (FCP)
                </span>
                <span className="text-3xl font-extrabold text-white">0.6s</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#1a1f2c] border border-white/10">
                <span className="block text-xs uppercase tracking-widest text-emerald-400 font-bold mb-1">
                  Disponibilidad
                </span>
                <span className="text-3xl font-extrabold text-white">99.9%</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#1a1f2c] border border-white/10">
                <span className="block text-xs uppercase tracking-widest text-emerald-400 font-bold mb-1">
                  Soberanía Datos
                </span>
                <span className="text-3xl font-extrabold text-white">100%</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#1a1f2c] border border-white/10">
                <span className="block text-xs uppercase tracking-widest text-emerald-400 font-bold mb-1">
                  Lighthouse Score
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
