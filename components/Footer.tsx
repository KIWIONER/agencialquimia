/**
 * ==============================================================================
 * Componente: Footer.tsx
 * ==============================================================================
 * Descripción:
 *  Pie de página principal (Main Footer) en Tema Negro-Grisáceo (#07080a).
 * 
 * Estética Visual:
 *  1. Fondo carbón ultra-oscuro (#07080a) con borde superior de cristal.
 *  2. Enlaces corporativos a LinkedIn y Email.
 *  3. Enlaces normativos y copyright.
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
          <p className="text-gray-400 text-sm max-w-lg mx-auto">
            Ayudando a negocios locales a competir en las Grandes Ligas con tecnología invisible.
          </p>
        </div>

        {/* Canales de contacto profesional */}
        <div className="flex flex-wrap justify-center items-center gap-6 text-sm font-medium">
          <a
            href="https://www.linkedin.com/in/matiasidiart"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors no-underline"
          >
            <Linkedin className="w-4 h-4" />
            <span>LinkedIn</span>
          </a>
          <a
            href="mailto:hola@agencialquimia.com"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors no-underline"
          >
            <Mail className="w-4 h-4" />
            <span>hola@agencialquimia.com</span>
          </a>
        </div>

        {/* Enlaces de cumplimiento normativo y legal */}
        <div className="flex justify-center items-center gap-4 text-xs text-gray-400">
          <a href="/aviso-legal" className="hover:text-emerald-400 transition-colors no-underline">
            Aviso Legal
          </a>
          <span>·</span>
          <a href="/politica-de-privacidad" className="hover:text-emerald-400 transition-colors no-underline">
            Política de Privacidad
          </a>
        </div>

        {/* Derechos de autor */}
        <div className="pt-6 border-t border-white/10 text-xs text-gray-500">
          <p>&copy; 2026 AgenciAlquimia. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
