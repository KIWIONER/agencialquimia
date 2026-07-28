'use client';

/**
 * ==============================================================================
 * Archivo: app/page.tsx
 * ==============================================================================
 * Descripción:
 *  Página principal (Landing Page) de AgenciAlquimia en Tema Negro-Grisáceo (#0b0d10).
 * 
 * Estética Visual & Funcionalidades:
 *  1. Fondo Negro-Grisáceo Carbón: Estética oscura sofisticada con acentos neón esmeralda.
 *  2. Enlace al Panel Administrativo: Integrado en la barra de navegación superior.
 *  3. Chatbot IA Integrado: Gestor de eventos global para el widget conversacional.
 * ==============================================================================
 */

import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Demos from '@/components/Demos';
import Pricing from '@/components/Pricing';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';

export default function HomePage() {
  /**
   * Dispara el evento personalizado global 'open-ai-chat' para desplegar la ventana del ChatWidget
   */
  const handleOpenChat = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-ai-chat'));
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d10] text-gray-100 flex flex-col font-sans">
      {/* Barra de navegación superior fija */}
      <Navbar onOpenChat={handleOpenChat} />

      {/* Secciones de la Landing Page */}
      <main className="flex-1">
        <Hero />
        <Services />
        <Demos />
        <Pricing />
        <Contact />
      </main>

      {/* Pie de página corporativo */}
      <Footer />

      {/* Widget flotante conversacional de IA */}
      <ChatWidget />
    </div>
  );
}
