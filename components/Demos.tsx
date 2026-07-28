/**
 * ==============================================================================
 * Componente: Demos.tsx
 * ==============================================================================
 * Descripción:
 *  Muestrario interactivo de demostraciones en vivo (Live Demos) en Tema Negro-Grisáceo.
 * 
 * Accesibilidad & Cumplimiento WCAG 2.1 AA:
 *  1. Ratio de Contraste > 5.5:1: Textos en `text-gray-200` y `text-emerald-300` sobre `#161a22`.
 *  2. Sin Opacidad Bloqueante: Eliminada la regla `opacity-70` para garantizar lectura clara
 *     en tarjetas de demostración privadas/bloqueadas.
 * ==============================================================================
 */

import { ExternalLink, Lock } from 'lucide-react';

interface DemoCardProps {
  /** Identificador técnico del sector (ej. RETAIL_PROTOCOL) */
  sector: string;
  /** Título visible de la demostración comercial */
  title: string;
  /** Descripción del caso de uso y valor para el negocio */
  description: string;
  /** URL externa hacia la aplicación de demostración real */
  link?: string;
  /** Si es true, renderiza la tarjeta como bloqueada (privada) */
  isLocked?: boolean;
}

/**
 * Componente auxiliar para renderizar cada tarjeta individual de demostración cumpliendo WCAG 2.1 AA
 */
function DemoCard({ sector, title, description, link, isLocked }: DemoCardProps) {
  if (isLocked) {
    return (
      <div className="p-6 rounded-2xl bg-[#161a22] border border-emerald-500/30 relative overflow-hidden flex flex-col justify-between shadow-lg">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-bold border border-emerald-500/40">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>ACCESO BAJO DEMANDA</span>
          </div>
          <div>
            <span className="text-xs font-mono tracking-widest text-emerald-300 uppercase block mb-1 font-bold">
              {sector}
            </span>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-gray-200 text-sm mt-2 leading-relaxed font-normal">{description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="p-6 rounded-2xl glass-card-dark hover:border-emerald-500/50 transition-all duration-300 group flex flex-col justify-between no-underline shadow-lg"
    >
      <div className="space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>LIVE DEMO</span>
        </div>
        <div>
          <span className="text-xs font-mono tracking-widest text-emerald-300 uppercase block mb-1 font-bold">
            {sector}
          </span>
          <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
            <span>{title}</span>
            <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
          </h3>
          <p className="text-gray-200 text-sm mt-2 leading-relaxed font-normal">{description}</p>
        </div>
      </div>
    </a>
  );
}

export default function Demos() {
  return (
    <section id="showcase" className="py-24 bg-[#0b0d10] relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Encabezado de Demos en Vivo */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-emerald-400 font-bold tracking-widest text-xs uppercase px-3.5 py-1.5 rounded-full bg-[#161a22] border border-emerald-500/30">
            Demos en Vivo
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            Pruébalo tú mismo. <span className="text-emerald-400">Sin registros.</span>
          </h2>
          <p className="text-gray-200 text-lg">
            Haz clic en cualquier demo funcional para interactuar en tiempo real con nuestras soluciones.
          </p>
        </div>

        {/* Grid de 5 soluciones por industria en alto contraste WCAG AA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <DemoCard
            sector="RETAIL_PROTOCOL"
            title="Venta Directa (Frutería Nexus)"
            description="Catálogo inteligente + Agente de ventas 24/7 en WhatsApp. Convierte cada chat en un pedido pagado."
            link="https://fruterianexus.agencialquimia.com/"
          />
          <DemoCard
            sector="GASTRO_OPS"
            title="Hostelería & Restaurantes"
            description="Reservas autónomas y gestión de comandas. Acceso disponible tras la primera llamada de diagnóstico."
            isLocked
          />
          <DemoCard
            sector="HEALTH_CORE"
            title="Wellness & Salud (Centro Melros)"
            description="Agenda de citas inteligente con recordatorios. Reduce el ausentismo un 40% sin mover un dedo."
            link="https://centromelros.agencialquimia.com/"
          />
          <DemoCard
            sector="REAL_ESTATE_INTEL"
            title="Inmobiliaria"
            description="Cualificación de leads en tiempo real. Acceso restringido hasta completar la sesión estratégica."
            isLocked
          />
          <DemoCard
            sector="ED_TECH_AI"
            title="Formación & Campus (LMS)"
            description="Campus con Tutor IA 24/7. Tus alumnos aprenden más rápido con un cerebro que conoce todo tu curso."
            link="https://lms.agencialquimia.com/"
          />
        </div>
      </div>
    </section>
  );
}
