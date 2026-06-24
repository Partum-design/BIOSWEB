"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Solo loguear en producción si hay un error tracking configurado
    if (process.env.NODE_ENV !== "development") return;
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bios-bg">
      <div className="bios-panel p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="font-outfit text-xl font-black text-bios-navy mb-3">
          Algo salió mal
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Ocurrió un error inesperado. Intenta de nuevo o contacta a soporte si el problema persiste.
        </p>
        <button onClick={reset} className="bios-btn-blue w-full justify-center">
          <RefreshCw className="w-4 h-4" /> Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
