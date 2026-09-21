import React from 'react';

export function LinkedInPreview({ text }: { text: string }) {
  return (
    <div className="max-w-md mx-auto bg-white border border-stone-200 rounded-xl shadow-sm font-sans overflow-hidden">
      <div className="p-4 flex gap-3">
        <div className="w-12 h-12 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-xl shrink-0">
          ⚗️
        </div>
        <div>
          <h3 className="font-bold text-stone-900 text-sm leading-tight">AgenciAlquimia</h3>
          <p className="text-stone-500 text-xs">Ecosistemas autónomos con IA para PYMES</p>
          <p className="text-stone-500 text-xs mt-0.5 flex items-center gap-1">
            <span>Ahora</span>
            <span>•</span>
            <span className="text-[10px]">🌐</span>
          </p>
        </div>
      </div>
      <div className="px-4 pb-2">
        <p className="text-stone-800 text-sm whitespace-pre-wrap leading-snug">
          {text?.replace(/\*\*/g, '') || '...'}
        </p>
      </div>
      <div className="border-t border-stone-200 mt-2 px-4 py-2 flex justify-between">
        <button className="flex items-center gap-2 text-stone-600 hover:bg-stone-100 px-3 py-2 rounded-lg transition-colors">
          <span className="text-lg">👍</span>
          <span className="text-sm font-semibold">Recomendar</span>
        </button>
        <button className="flex items-center gap-2 text-stone-600 hover:bg-stone-100 px-3 py-2 rounded-lg transition-colors">
          <span className="text-lg">💬</span>
          <span className="text-sm font-semibold">Comentar</span>
        </button>
        <button className="flex items-center gap-2 text-stone-600 hover:bg-stone-100 px-3 py-2 rounded-lg transition-colors">
          <span className="text-lg">🔁</span>
          <span className="text-sm font-semibold">Compartir</span>
        </button>
      </div>
    </div>
  );
}
