import React from 'react';
import ReactMarkdown from 'react-markdown';

export function BlogPreview({ title, content }: { title: string; content: string }) {
  // Limpiamos un poco el markdown para asegurarnos que no muestre el H1 dos veces si el usuario lo dejó en el contenido
  const cleanContent = content.replace(/^#\s+.+\n*/m, '');

  return (
    <div className="max-w-3xl mx-auto bg-white border border-stone-200 rounded-2xl shadow-sm font-sans overflow-hidden">
      {/* Cabecera del Blog (Estilo AgenciAlquimia) */}
      <div className="bg-stone-900 px-8 py-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="relative z-10">
          <span className="text-emerald-400 font-bold text-xs tracking-widest uppercase mb-3 block">
            — Inteligencia Artificial —
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">
            {title}
          </h1>
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="w-10 h-10 rounded-full bg-emerald-700 border-2 border-stone-800 flex items-center justify-center text-white text-sm font-bold">
              ⚗️
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-white leading-none">Matías Idiart</p>
              <p className="text-xs text-stone-400 mt-1">Hoy • 5 min de lectura</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cuerpo del Artículo usando Tailwind Typography */}
      <div className="px-8 py-10 bg-white">
        <article className="prose prose-stone prose-emerald max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-a:text-emerald-600 hover:prose-a:text-emerald-700">
          <ReactMarkdown>{cleanContent || '*El contenido se generará aquí...*'}</ReactMarkdown>
        </article>
      </div>

      {/* Footer del Blog (CTA de prueba) */}
      <div className="bg-stone-50 border-t border-stone-100 p-8 text-center">
        <h3 className="text-lg font-bold text-stone-900 mb-2">¿Listo para automatizar tu negocio?</h3>
        <p className="text-sm text-stone-500 mb-4">Descubre cómo podemos crear un ecosistema autónomo para ti.</p>
        <button className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl shadow-sm hover:bg-emerald-700 transition-colors text-sm">
          Agendar Consultoría Gratuita
        </button>
      </div>
    </div>
  );
}
