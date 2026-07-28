/**
 * ==============================================================================
 * Archivo: app/politica-de-privacidad/page.tsx
 * ==============================================================================
 * Descripción:
 *  Página oficial de Política de Privacidad y Protección de Datos (RGPD) de AgenciAlquimia.
 * 
 * Funcionalidades Clave:
 *  1. Cumplimiento Normativo (RGPD / LOPDGDD): Normativa europea de tratamiento de datos personales.
 *  2. Estética Visual Cohesiva: Diseñado con la paleta carbón y tarjetas en cristal oscuro.
 *  3. Enrutamiento Nativo: Integrado dentro del App Router de Next.js (`/politica-de-privacidad`).
 * ==============================================================================
 */

import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PoliticaPrivacidadPage() {
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
            <Lock className="w-3.5 h-3.5" />
            <span>Protección de Datos & RGPD</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Política de Privacidad
          </h1>
          <p className="text-gray-400 text-sm">
            Reglamento General de Protección de Datos (UE 2016/679) | AgenciAlquimia
          </p>
        </div>

        {/* Contenido detallado de la Política de Privacidad */}
        <div className="p-8 sm:p-10 rounded-3xl glass-card-dark space-y-6 text-sm text-gray-300 leading-relaxed border border-white/10">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">1. Responsable del Tratamiento</h2>
            <p>
              El responsable del tratamiento de los datos personales recabados a través de este portal web es AgenciAlquimia, con sede operativa en Santiago de Compostela, Galicia (email de contacto: <a href="mailto:hola@agencialquimia.com" className="text-emerald-400 hover:underline">hola@agencialquimia.com</a>).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">2. Finalidad del Tratamiento de Datos</h2>
            <p>
              Los datos facilitados mediante el formulario de contacto o las interacciones con nuestros agentes conversacionales se utilizarán exclusivamente para:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-300">
              <li>Responder a las solicitudes de diagnóstico técnico e información comercial.</li>
              <li>Coordinar citas estratégicas de evaluación operativa.</li>
              <li>Gestionar las comunicaciones de servicio con clientes activos.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">3. Legitimación del Tratamiento</h2>
            <p>
              La base legal para el tratamiento de sus datos es el consentimiento explícito otorgado por el usuario al enviar el formulario de contacto o interactuar voluntariamente con el canal de atención.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">4. Conservación y Derechos ARCO+</h2>
            <p>
              Los datos personales se conservarán únicamente durante el tiempo necesario para atender su consulta o mantener la relación comercial. El usuario puede ejercer sus derechos de acceso, rectificación, supresión, limitación y oposición dirigiendo un escrito a <span className="text-white font-semibold">hola@agencialquimia.com</span>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
