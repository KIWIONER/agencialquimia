'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0b0d10] text-white">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Algo salió mal</h2>
        <button
          onClick={() => reset()}
          className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
