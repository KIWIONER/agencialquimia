/**
 * ==============================================================================
 * Archivo: app/aviso-legal/page.tsx
 * ==============================================================================
 * Descripción:
 *  Página oficial de Aviso Legal de AgenciAlquimia en Tema Negro-Grisáceo (#0b0d10).
 * 
 * Funcionalidades Clave:
 *  1. Cumplimiento Normativo (LSSI-CE): Datos identificativos de la entidad legal.
 *  2. Estética Visual Cohesiva: Diseñado con la paleta carbón y tarjetas en cristal oscuro.
 *  3. Enrutamiento Nativo: Integrado dentro del App Router de Next.js (`/aviso-legal`).
 * ==============================================================================
 */

import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AvisoLegalPage() {
  return (
    <div className="min-h-screen bg-[#0b0d10] text-gray-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 pt-32 pb-20 w-full space-y-8">
        {/* Botón de retorno a la página principal */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-semibold text-sm transition-colors no-underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </Link>

        {/* Encabezado del documento legal */}
        <div className="space-y-3 border-b border-white/10 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161a22] text-emerald-400 text-xs font-bold border border-emerald-500/30">
            <Shield className="w-3.5 h-3.5" />
            <span>Marco Legal & Transparencia</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Aviso Legal
          </h1>
          <p className="text-gray-400 text-sm">
            Última actualización: 28 de Julio de 2026 | Santiago de Compostela, Galicia
          </p>
        </div>

        {/* Contenido detallado del Aviso Legal en tarjeta de cristal */}
        <div className="p-8 sm:p-10 rounded-3xl glass-card-dark space-y-6 text-sm text-gray-300 leading-relaxed border border-white/10">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">1. Datos Identificativos</h2>
            <p>
              En cumplimiento con el deber de información recogido en el artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), se facilitan los siguientes datos corporativos:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-300">
              <li><strong className="text-white">Denominación Comercial:</strong> AgenciAlquimia</li>
              <li><strong className="text-white">Sede y Operación:</strong> Santiago de Compostela, Galicia, España</li>
              <li><strong className="text-white">Teléfono de Contacto:</strong> +34 604 051 111</li>
              <li><strong className="text-white">Email Corporativo:</strong> hola@agencialquimia.com</li>
              <li><strong className="text-white">Actividad:</strong> Servicios de desarrollo e ingeniería de automatizaciones con Inteligencia Artificial.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">2. Propiedad Intelectual e Industrial</h2>
            <p>
              Todos los contenidos exhibidos en este sitio web (diseño gráfico, marca, logotipos, código fuente en TypeScript, algoritmos de automatización, textos e interfaz de usuario) son propiedad exclusiva de AgenciAlquimia o de sus licenciantes, quedando protegidos por la legislación española sobre propiedad intelectual e industrial.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">3. Condiciones de Uso y Exención de Responsabilidad</h2>
            <p>
              El acceso a este portal atribuye la condición de usuario. El usuario se compromete a hacer un uso adecuado de los contenidos y servicios (como los widgets de interacción con IA) absteniéndose de realizar actividades ilícitas o malintencionadas.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">4. Jurisdicción y Ley Aplicable</h2>
            <p>
              Para la resolución de todas las controversias o cuestiones relacionadas con el presente sitio web o de las actividades en él desarrolladas, será de aplicación la legislación española, sometiéndose expresamente las partes a los Juzgados y Tribunales de Santiago de Compostela.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
