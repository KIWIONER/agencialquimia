'use client';

/**
 * ==============================================================================
 * Componente: Navbar.tsx
 * ==============================================================================
 * Descripción:
 *  Barra de navegación principal fija en Dark Theme para AgenciAlquimia.
 * 
 * Novedades & Funcionalidades:
 *  1. Estética Dark Theme Glassmorphism: Fondo oscuro translúcido (`#02140f`) con desenfoque.
 *  2. Botón de Acceso al Panel Administrativo (`/admin`): Acceso directo al Dashboard de control.
 *  3. Botón Disparador de Chat IA: Abre la ventana modal interactiva del bot conversacional.
 *  4. Menú Móvil Desplegable Accesible: Conmutador hamburguesa con soporte ARIA.
 * ==============================================================================
 */

import { useState } from 'react';
import Link from 'next/link';
import { Bot, Menu, X, Shield } from 'lucide-react';

interface NavbarProps {
  /** Función invocada al pulsar el botón "Chat IA" para desplegar el widget */
  onOpenChat?: () => void;
}

export default function Navbar({ onOpenChat }: NavbarProps) {
  // Estado local para el menú móvil desplegable
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 glass-nav transition-all duration-300 px-6 py-4"
      aria-label="Navegación principal"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo corporativo de AgenciAlquimia en modo oscuro */}
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 no-underline"
        >
          <span>
            Agenci<span className="text-emerald-400">Alquimia</span>
          </span>
        </Link>

        {/* Enlaces de navegación Desktop en Dark Theme */}
        <div className="hidden md:flex items-center gap-8 text-emerald-100/90 font-medium">
          <a
            href="#services"
            className="hover:text-emerald-400 transition-colors no-underline text-sm"
          >
            Servicios
          </a>
          <a
            href="#showcase"
            className="hover:text-emerald-400 transition-colors no-underline text-sm"
          >
            Demos
          </a>
          <a
            href="#pricing"
            className="hover:text-emerald-400 transition-colors no-underline text-sm"
          >
            Precios
          </a>
          <a
            href="#contact"
            className="hover:text-emerald-400 transition-colors no-underline text-sm"
          >
            Contacto
          </a>

          {/* Botón de Acceso Directo al Panel Administrativo (/admin) */}
          <Link
            href="/admin"
            className="px-4 py-2 rounded-full bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 hover:text-white font-semibold transition-all duration-200 text-xs flex items-center gap-1.5 no-underline shadow-md"
            title="Ir al Panel Administrativo"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Panel Admin</span>
          </Link>

          {/* Botón CTA para abrir el Chat de IA */}
          <button
            type="button"
            onClick={onOpenChat}
            className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold transition-all duration-200 shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer text-xs"
            aria-label="Abrir chat de IA"
          >
            <Bot className="w-4 h-4" />
            <span>Chat IA 24/7</span>
          </button>
        </div>

        {/* Botón Hamburguesa Móvil */}
        <button
          type="button"
          onClick={toggleMenu}
          className="md:hidden p-2 rounded-lg text-emerald-300 hover:bg-emerald-900/50 transition-colors focus:outline-none"
          aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav-menu"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Menú desplegable Móvil en Dark Mode */}
      {isMenuOpen && (
        <div
          id="mobile-nav-menu"
          className="md:hidden mt-4 pt-4 pb-6 px-4 bg-[#041f18] border border-emerald-500/30 rounded-2xl text-white flex flex-col gap-4 shadow-2xl animate-in fade-in slide-in-from-top-4"
        >
          <a
            href="#services"
            onClick={closeMenu}
            className="text-lg py-2 hover:text-emerald-400 border-b border-emerald-900/50 no-underline"
          >
            Servicios
          </a>
          <a
            href="#showcase"
            onClick={closeMenu}
            className="text-lg py-2 hover:text-emerald-400 border-b border-emerald-900/50 no-underline"
          >
            Demos
          </a>
          <a
            href="#pricing"
            onClick={closeMenu}
            className="text-lg py-2 hover:text-emerald-400 border-b border-emerald-900/50 no-underline"
          >
            Precios
          </a>
          <a
            href="#contact"
            onClick={closeMenu}
            className="text-lg py-2 hover:text-emerald-400 border-b border-emerald-900/50 no-underline"
          >
            Contacto
          </a>

          {/* Enlace al Panel Admin en Móvil */}
          <Link
            href="/admin"
            onClick={closeMenu}
            className="py-2.5 px-4 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-semibold text-center flex items-center justify-center gap-2 no-underline"
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Panel Administrativo</span>
          </Link>

          {/* Botón Chat IA en Móvil */}
          <button
            type="button"
            onClick={() => {
              closeMenu();
              onOpenChat?.();
            }}
            className="mt-2 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Bot className="w-5 h-5" />
            <span>Abrir Chat IA</span>
          </button>
        </div>
      )}
    </nav>
  );
}
