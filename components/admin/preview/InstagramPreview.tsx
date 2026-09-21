import React from 'react';

export function InstagramPreview({ text }: { text: string }) {
  return (
    <div className="max-w-[350px] mx-auto bg-white border border-stone-200 rounded-xl shadow-sm font-sans overflow-hidden">
      {/* Header IG */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 p-[2px]">
            <div className="w-full h-full bg-emerald-700 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
              ⚗️
            </div>
          </div>
          <span className="font-semibold text-stone-900 text-sm">agencialquimia</span>
        </div>
        <span className="text-stone-900 font-bold tracking-widest pb-2">...</span>
      </div>

      {/* Imagen / Placeholder Carrusel */}
      <div className="w-full aspect-square bg-stone-100 flex items-center justify-center p-6 border-y border-stone-100 relative">
        <div className="text-center">
          <span className="text-4xl mb-2 block">📸</span>
          <p className="text-stone-400 text-sm font-semibold">Generador de Imágenes Pendiente</p>
          <p className="text-stone-300 text-xs mt-1">El carrusel iría aquí</p>
        </div>
        {/* Puntos del carrusel */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-stone-300"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-stone-300"></div>
        </div>
      </div>

      {/* Acciones y Caption */}
      <div className="p-3">
        <div className="flex justify-between mb-2">
          <div className="flex gap-4">
            <span className="text-2xl cursor-pointer hover:text-stone-500 transition-colors">❤️</span>
            <span className="text-2xl cursor-pointer hover:text-stone-500 transition-colors">💬</span>
            <span className="text-2xl cursor-pointer hover:text-stone-500 transition-colors">✈️</span>
          </div>
          <span className="text-2xl cursor-pointer hover:text-stone-500 transition-colors">📌</span>
        </div>
        
        <p className="text-stone-900 font-semibold text-sm mb-1">Les gusta a miles de dueños de negocios</p>
        
        <div className="text-sm text-stone-800 leading-snug">
          <span className="font-semibold mr-2">agencialquimia</span>
          <span className="whitespace-pre-wrap">{text?.replace(/\*\*/g, '') || '...'}</span>
        </div>
      </div>
    </div>
  );
}
