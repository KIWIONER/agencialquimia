/**
 * ==============================================================================
 * Componente: Demos.tsx
 * ==============================================================================
 * Descripción:
 *  Muestrario de las 6 Aplicaciones Web y Demostradores Interactivos en Vivo por Sector.
 * 
 * Cumplimiento WCAG 2.1 AA:
 *  1. Ratio de Contraste > 4.5:1 sobre fondo Dark Charcoal (#07080a / #0b0d10).
 *  2. Enlaces accesibles a demostradores en vivo con indicadores de apertura externa.
 *  3. Grid equilibrado de 6 soluciones de ingeniería web para pymes.
 * ==============================================================================
 */

import { 
  ArrowUpRight, 
  Sparkles, 
  Utensils, 
  ShoppingBag, 
  Home, 
  HeartPulse, 
  GraduationCap, 
  Baby 
} from 'lucide-react';

interface DemoItem {
  id: string;
  title: string;
  sector: string;
  description: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  tags: string[];
  metrics: string;
}

const DEMOS_DATA: DemoItem[] = [
  {
    id: 'restaurante',
    title: 'Mercado La Galiciana',
    sector: 'Gastronomía & Hostelería',
    description:
      'Aplicación web interactiva con gestión de reservas en tiempo real, carta digital inteligente y agente de atención a comensales 24/7.',
    url: 'https://mercadolagaliciana.agencialquimia.com',
    icon: Utensils,
    tags: ['Next.js App', 'Reservas en Vivo', 'Agente IA'],
    metrics: 'Cero mesas perdidas',
  },
  {
    id: 'comercio',
    title: 'Frutería Nexus',
    sector: 'Comercio Local & Retail',
    description:
      'Catálogo de productos sincronizado con inventario en tiempo real, pedidos por WhatsApp y atención de dudas automatizada.',
    url: 'https://fruterianexus.agencialquimia.com',
    icon: ShoppingBag,
    tags: ['Stock en Tiempo Real', 'Pedidos WhatsApp', 'Búsqueda IA'],
    metrics: '+35% ticket medio',
  },
  {
    id: 'clinica',
    title: 'Centro Melros / Fisioterapia',
    sector: 'Salud, Wellness & Clínicas',
    description:
      'Sistema de agenda inteligente con triaje asistencial, recordatorios automáticos de citas y reducción drástica de ausentismo.',
    url: 'https://centromelros.agencialquimia.com',
    icon: HeartPulse,
    tags: ['Triaje Asistido', 'Recordatorio Citas', 'RGPD Salud'],
    metrics: '-80% ausencias',
  },
  {
    id: 'inmobiliaria',
    title: 'Portal Inmobiliario Alquimia',
    sector: 'Real Estate & Inversión',
    description:
      'Plataforma de propiedades con filtro inteligente, cualificación automática de compradores e integración con agenda de visitas.',
    url: 'https://inmobiliaria.agencialquimia.com',
    icon: Home,
    tags: ['Filtro Semántico', 'Cualificación Leads', 'Scoring ML'],
    metrics: 'Leads 100% cualificados',
  },
  {
    id: 'educacion',
    title: 'Campus LMS con Tutor IA',
    sector: 'Formación & EdTech',
    description:
      'Campus virtual interactivo con asistente tutor 24/7 entrenado sobre los contenidos del curso para responder dudas al instante.',
    url: 'https://lms.agencialquimia.com',
    icon: GraduationCap,
    tags: ['Tutor IA 24/7', 'Campus Virtual', 'Seguimiento Alumnos'],
    metrics: 'Tutoría 24/7 activa',
  },
  {
    id: 'kinekids',
    title: 'KineKids',
    sector: 'Fisioterapia Pediátrica & Salud Infantil',
    description:
      'Ecosistema web y clínico para centro de desarrollo infantil: agenda asistencial con triaje pediátrico, gestión de sesiones y atención directa a familias 24/7.',
    url: 'https://kinekids.agencialquimia.com',
    icon: Baby,
    tags: ['Triaje Pediátrico', 'Gestión de Sesiones', 'Atención Familias'],
    metrics: 'Agenda 100% asistida',
  },
];

export default function Demos() {
  return (
    <section id="showcase" className="py-24 bg-[#07080a] text-gray-100 relative">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        
        {/* Cabecera de Sección */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Demostradores de Aplicaciones Reales</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            6 Ecosistemas Web en Vivo por{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Sector de Negocio
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-300 font-normal">
            No mostramos maquetas estáticas. Haz clic en cualquiera de nuestras aplicaciones web completas desplegadas en producción para probarlas en tiempo real.
          </p>
        </div>

        {/* Cuadrícula de 6 Demostradores (3 Columnas en Desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {DEMOS_DATA.map((demo) => {
            const Icon = demo.icon;
            return (
              <div
                key={demo.id}
                className="p-7 sm:p-8 rounded-3xl glass-card-dark flex flex-col justify-between hover:border-emerald-500/50 transition-all duration-300 group"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-semibold">
                      {demo.metrics}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold block">
                      {demo.sector}
                    </span>
                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {demo.title}
                    </h3>
                  </div>

                  <p className="text-gray-300 leading-relaxed text-xs sm:text-sm">
                    {demo.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {demo.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-[#141a24] text-gray-300 border border-white/10 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between">
                  <a
                    href={demo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors no-underline group/link"
                  >
                    <span>Probar en Vivo</span>
                    <ArrowUpRight className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </a>
                  <span className="text-[11px] text-gray-400 font-mono">Live 24/7</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
