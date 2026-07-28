/**
 * ==============================================================================
 * Componente: Hero.tsx
 * ==============================================================================
 * Descripción:
 *  Sección Hero principal en Fondo Negro-Grisáceo (#0b0d10) para AgenciAlquimia.
 * 
 * Estética Visual:
 *  1. Fondo Negro-Grisáceo Carbón: `#0b0d10` con malla ambiental radial de puntos neón.
 *  2. Badge Pulsante: Estado "Agencia Live 24/7" con luz esmeralda.
 *  3. Botones Neón & Cristal: CTA principal verde esmeralda con sombras resplandecientes.
 *  4. HUD Grid de Métricas Oscuras: Tarjetas en cristal negro-grisáceo (`glass-card-dark`).
 * ==============================================================================
 */

import { ArrowRight, PlayCircle } from 'lucide-react';

export default function Hero() {
  return (
    <header
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-28 pb-16 bg-[#0b0d10]"
    >
      {/* Resplandor ambiental de fondo (Glow) */}
      <div className="absolute inset-0 z-0 hero-glow pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl opacity-25 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/15 blur-[140px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-emerald-700/20 blur-[120px] rounded-full" />
      </div>

      {/* Contenedor principal de contenidos alineados al centro */}
      <div className="relative z-10 max-w-5xl text-center flex flex-col items-center gap-8">
        {/* Badge de estado "Agencia Live 24/7" */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#161a22] border border-emerald-500/30 backdrop-blur-md shadow-lg">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
          </span>
          <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
            Agencia Live 24/7
          </span>
        </div>

        {/* Titular Principal en Blanco sobre Fondo Negro-Grisáceo */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] max-w-4xl">
          Tu negocio responde, agenda y vende.{' '}
          <span className="text-emerald-400 underline decoration-emerald-400/40 underline-offset-8">
            Solo.
          </span>{' '}
          24 horas al día.
        </h1>

        {/* Subtitular Comercial */}
        <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Instalamos agentes de IA en tu WhatsApp, web y procesos internos para que dejes de ser el cuello de botella de tu negocio. Sin código. Sin complicaciones. Funcionando en días.
        </p>

        {/* Grupo de botones Call To Action (CTAs) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2 w-full sm:w-auto">
          {/* CTA Principal: Diagnóstico Gratuito */}
          <a
            href="#contact"
            className="group relative w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-xl shadow-xl shadow-emerald-500/20 transition-all duration-300 flex items-center justify-center gap-3 no-underline"
          >
            <span>Quiero mi diagnóstico gratuito</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          {/* CTA Secundario: Ver Demos Reales */}
          <a
            href="#showcase"
            className="w-full sm:w-auto px-8 py-4 bg-[#161a22] hover:bg-[#1f2430] text-white font-bold rounded-xl border border-white/10 transition-all duration-300 shadow-sm flex items-center justify-center gap-2 no-underline"
          >
            <PlayCircle className="w-5 h-5 text-emerald-400" />
            <span>Ver demos reales</span>
          </a>
        </div>

        {/* Grid HUD de Métricas en Cristal Negro-Grisáceo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-8 border-t border-white/10 w-full max-w-4xl">
          <div className="flex flex-col items-center gap-1 p-4 rounded-2xl glass-card-dark">
            <span className="text-emerald-400 text-3xl font-extrabold">98%</span>
            <span className="text-gray-400 text-xs uppercase tracking-widest font-bold">
              Precisión IA
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 p-4 rounded-2xl glass-card-dark">
            <span className="text-emerald-400 text-3xl font-extrabold">24/7</span>
            <span className="text-gray-400 text-xs uppercase tracking-widest font-bold">
              Disponibilidad
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 p-4 rounded-2xl glass-card-dark">
            <span className="text-emerald-400 text-3xl font-extrabold">WhatsApp</span>
            <span className="text-gray-400 text-xs uppercase tracking-widest font-bold">
              Integración
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 p-4 rounded-2xl glass-card-dark">
            <span className="text-emerald-400 text-3xl font-extrabold">Zero</span>
            <span className="text-gray-400 text-xs uppercase tracking-widest font-bold">
              Latencia
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
