import React from 'react';

export function TwitterPreview({ text }: { text: string }) {
  // Separamos los tweets por '---' para mostrar el primer tweet o hilo y le quitamos los asteriscos del markdown
  const tweets = text.split('---').map(t => t.replace(/\*\*/g, '').trim()).filter(Boolean);
  const firstTweet = tweets[0] || '...';

  return (
    <div className="max-w-md mx-auto bg-white border border-stone-100 rounded-2xl p-4 shadow-sm font-sans">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-lg shrink-0">
          ⚗️
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-stone-900 text-[15px]">AgenciAlquimia</span>
            <span className="text-stone-500 text-[15px]">@AgenciAlquimia</span>
            <span className="text-stone-500 text-[15px]">·</span>
            <span className="text-stone-500 text-[15px]">Ahora</span>
          </div>
          <p className="text-stone-900 text-[15px] mt-1 whitespace-pre-wrap leading-tight">
            {firstTweet}
          </p>
          <div className="flex justify-between text-stone-500 mt-3 max-w-xs">
            <span className="flex items-center gap-2 hover:text-blue-500 cursor-pointer transition-colors"><span className="text-lg">💬</span> 0</span>
            <span className="flex items-center gap-2 hover:text-green-500 cursor-pointer transition-colors"><span className="text-lg">🔁</span> 0</span>
            <span className="flex items-center gap-2 hover:text-pink-500 cursor-pointer transition-colors"><span className="text-lg">❤️</span> 0</span>
            <span className="flex items-center gap-2 hover:text-blue-500 cursor-pointer transition-colors"><span className="text-lg">📊</span> 0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
