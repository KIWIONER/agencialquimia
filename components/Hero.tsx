'use client';

/**
 * ==============================================================================
 * Componente: Hero.tsx
 * ==============================================================================
 * Descripción:
 *  Sección Hero principal para AgenciAlquimia con Tema Dark Charcoal (#0b0d10),
 *  enfocada en Arquitectura Web de Nueva Generación e Infraestructura con IA a Medida.
 * 
 * Mejoras Visuales & Experiencia Interactiva:
 *  1. Animación Ambiental de Luz Líquida: 3 orbes flotantes de luz esmeralda y turquesa
 *     acelerados por hardware en GPU con desenfoque extremo (blur-[130px] a blur-[160px]).
 *  2. Foco Interactivo (Spotlight): Sigue suavemente las coordenadas del cursor del usuario.
 *  3. Haz de Escaneo Lumínico (Radar Beam): Efecto de barrido sobre la malla de puntos neón.
 *  4. Shimmer en Palabras Clave: Destello metálico animado sobre los titulares.
 *  5. Accesibilidad WCAG 2.1 AA: Contraste de texto > 7:1 y reducción de movimiento accesible.
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Cpu, Code, Layers, Server } from 'lucide-react';

export default function Hero() {
  // Coordenadas relativas del cursor para el foco Spotlight interactivo
  const [mousePos, setMousePos] = useState({ x: 50, y: 35 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Cálculo porcentual respecto a la ventana del navegador
      const x = Math.round((e.clientX / window.innerWidth) * 100);
      const y = Math.round((e.clientY / window.innerHeight) * 100);
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section 
      role="banner"
      className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden px-6 pt-32 pb-20 bg-[#0b0d10] select-none"
    >
      {/* 1. Malla de puntos geométrica de fondo */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:28px_28px] opacity-15 pointer-events-none" 
        aria-hidden="true" 
      />

      {/* 2. Haz de escaneo de radar continuo */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent animate-scan-line pointer-events-none" 
        aria-hidden="true" 
      />

      {/* 3. Foco de luz Spotlight interactivo que sigue suavemente el cursor */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          background: `radial-gradient(650px circle at ${mousePos.x}% ${mousePos.y}%, rgba(16, 185, 129, 0.12), transparent 80%)`,
        }}
        aria-hidden="true"
      />

      {/* 4. Orbes de luz líquida orgánica multicapa flotantes (GPU-accelerated) */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/20 rounded-full blur-[140px] pointer-events-none animate-hero-orb-1 will-change-transform" 
        aria-hidden="true"
      />
      <div 
        className="absolute top-1/3 -left-20 w-[420px] h-[420px] bg-teal-500/15 rounded-full blur-[130px] pointer-events-none animate-hero-orb-2 will-change-transform" 
        aria-hidden="true"
      />
      <div 
        className="absolute bottom-10 -right-20 w-[480px] h-[480px] bg-emerald-400/15 rounded-full blur-[160px] pointer-events-none animate-hero-orb-3 will-change-transform" 
        aria-hidden="true"
      />

      {/* 5. Contenedor de contenido central */}
      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
        
        {/* Badge de Posicionamiento: Estudio de Arquitectura Web & Ecosistemas IA */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-950/50 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Estudio de Arquitectura Web & Ecosistemas de IA a Medida · Live 24/7</span>
        </div>

        {/* Titular Principal de Alto Impacto */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
          Arquitectura Web <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 shimmer-keyword">
            de Nueva Generación
          </span>{' '}
          <br className="hidden sm:inline" />
          e Infraestructura con IA.
        </h1>

        {/* Subtítulo Descriptivo y Comercial de Alto Nivel */}
        <p className="text-base sm:text-xl text-gray-200 max-w-3xl mx-auto font-normal leading-relaxed">
          No creamos simples webs ni instalamos bots genéricos. Diseñamos{' '}
          <span className="text-emerald-300 font-semibold">aplicaciones web ultrarrápidas en Next.js</span>,{' '}
          <span className="text-emerald-300 font-semibold">microservicios backend en Python</span> e{' '}
          <span className="text-emerald-300 font-semibold">infraestructura privada</span> sincronizada para que tu empresa opere en piloto automático con soberanía total.
        </p>

        {/* Acciones Principales (CTAs) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <a
            href="#contact"
            className="w-full sm:w-auto text-base py-4 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 font-bold flex items-center justify-center gap-2 group no-underline"
          >
            <span>Solicitar Auditoría & Propuesta</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>

          <a
            href="#services"
            className="w-full sm:w-auto text-base py-4 px-8 rounded-2xl border border-emerald-500/30 hover:border-emerald-400 text-gray-100 hover:text-white bg-emerald-950/40 backdrop-blur-sm transition-all duration-300 font-semibold no-underline flex items-center justify-center"
          >
            Explorar Capacidades
          </a>
        </div>

        {/* Indicadores de Credibilidad Técnica e Ingeniería (HUD Metrics) */}
        <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-emerald-900/30 text-left">
          <div className="p-3.5 rounded-2xl bg-[#12161f]/80 border border-emerald-500/20 flex items-center gap-3 backdrop-blur-md">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] text-gray-400 font-medium">Stack Frontend</span>
              <span className="text-xs sm:text-sm font-bold text-white">Next.js 15 · React 19</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#12161f]/80 border border-emerald-500/20 flex items-center gap-3 backdrop-blur-md">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] text-gray-400 font-medium">Backend & Motores</span>
              <span className="text-xs sm:text-sm font-bold text-white">Python · FastAPI Core</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#12161f]/80 border border-emerald-500/20 flex items-center gap-3 backdrop-blur-md">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] text-gray-400 font-medium">Orquestación</span>
              <span className="text-xs sm:text-sm font-bold text-white">Workflows Privados n8n</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#12161f]/80 border border-emerald-500/20 flex items-center gap-3 backdrop-blur-md">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] text-gray-400 font-medium">Soberanía de Datos</span>
              <span className="text-xs sm:text-sm font-bold text-white">VPS Propio · 100% RGPD</span>
            </div>
          </div>
        </div>

        {/* Garantía y Compromiso */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-gray-300 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            Código y datos de tu propiedad
          </span>
          <span className="hidden sm:inline">·</span>
          <span>Sin dependencias opacas de terceros</span>
          <span className="hidden sm:inline">·</span>
          <span>Soporte técnico directo en Galicia</span>
        </div>

      </div>
    </section>
  );
}
