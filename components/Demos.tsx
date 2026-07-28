/**
 * ==============================================================================
 * Componente: Demos.tsx
 * ==============================================================================
 * Descripción:
 *  Muestrario interactivo de demostraciones en vivo (Live Demos) en Tema Negro-Grisáceo.
 * 
 * Estética Visual:
 *  1. Tarjetas en cristal negro-grisáceo (`glass-card-dark` - `#161a22`).
 *  2. Estado "LIVE DEMO" neón animado.
 *  3. Tarjetas bloqueadas en gris mate con icono de candado.
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
 * Componente auxiliar para renderizar cada tarjeta individual de demostración en modo negro-grisáceo
 */
function DemoCard({ sector, title, description, link, isLocked }: DemoCardProps) {
  if (isLocked) {
    return (
      <div className="p-6 rounded-2xl bg-[#161a22]/50 border border-white/10 opacity-70 backdrop-blur-sm relative overflow-hidden flex flex-col justify-between">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-800/80 text-gray-300 text-xs font-semibold border border-gray-700">
            <Lock className="w-3.5 h-3.5" />
            <span>BLOQUEADO</span>
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase block mb-1">
              {sector}
            </span>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-gray-400 text-sm mt-2 leading-relaxed">{description}</p>
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
      className="p-6 rounded-2xl glass-card-dark hover:border-emerald-500/50 transition-all duration-300 group flex flex-col justify-between no-underline"
    >
      <div className="space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>LIVE DEMO</span>
        </div>
        <div>
          <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase block mb-1 font-semibold">
            {sector}
          </span>
          <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
            <span>{title}</span>
            <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
          </h3>
          <p className="text-gray-300 text-sm mt-2 leading-relaxed">{description}</p>
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
          <p className="text-gray-300 text-lg">
            Haz clic en cualquier demo funcional para interactuar en tiempo real con nuestras soluciones.
          </p>
        </div>

        {/* Grid de 5 soluciones por industria */}
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
