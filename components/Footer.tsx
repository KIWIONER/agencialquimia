/**
 * ==============================================================================
 * Componente: Footer.tsx
 * ==============================================================================
 * Descripción:
 *  Pie de página principal (Main Footer) en Tema Negro-Grisáceo (#07080a).
 * 
 * Accesibilidad & Cumplimiento WCAG 2.1 AA:
 *  1. Ratio de Contraste > 6.0:1: Textos secundarios en `text-gray-200` y `text-gray-300` sobre `#07080a`.
 *  2. Enlaces con resaltado accesible y foco visible para lectores de pantalla.
 * ==============================================================================
 */

import { Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-16 bg-[#07080a] text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
        {/* Identidad y Lema corporativo */}
        <div className="space-y-3">
          <h3 className="text-3xl font-bold tracking-tight">
            Agenci<span className="text-emerald-400">Alquimia</span>
          </h3>
          <p className="text-gray-200 text-sm max-w-lg mx-auto font-medium">
            Ayudando a negocios locales a competir en las Grandes Ligas con tecnología invisible.
          </p>
        </div>

        {/* Canales de contacto profesional */}
        <div className="flex flex-wrap justify-center items-center gap-6 text-sm font-semibold">
          <a
            href="https://www.linkedin.com/in/matiasidiart"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors no-underline underline-offset-4 hover:underline"
          >
            <Linkedin className="w-4 h-4" />
            <span>LinkedIn</span>
          </a>
          <a
            href="mailto:hola@agencialquimia.com"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors no-underline underline-offset-4 hover:underline"
          >
            <Mail className="w-4 h-4" />
            <span>hola@agencialquimia.com</span>
          </a>
        </div>

        {/* Enlaces de cumplimiento normativo y legal con alto contraste */}
        <div className="flex justify-center items-center gap-4 text-xs font-medium text-gray-300">
          <a href="/aviso-legal" className="hover:text-emerald-400 transition-colors no-underline hover:underline">
            Aviso Legal
          </a>
          <span className="text-gray-400">·</span>
          <a href="/politica-de-privacidad" className="hover:text-emerald-400 transition-colors no-underline hover:underline">
            Política de Privacidad
          </a>
        </div>

        {/* Derechos de autor */}
        <div className="pt-6 border-t border-white/10 text-xs font-normal text-gray-300">
          <p>&copy; 2026 AgenciAlquimia. Todos los derechos reservados. | Santiago de Compostela, Galicia</p>
        </div>
      </div>
    </footer>
  );
}
