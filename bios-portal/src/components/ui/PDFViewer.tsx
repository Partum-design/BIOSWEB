"use client";

import { useState, useEffect } from "react";
import { Download, Printer, Maximize2, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PDFViewerProps {
  signedUrl: string;
  title?: string;
  resultId?: string;
  onDownload?: () => void;
  className?: string;
}

export function PDFViewer({ signedUrl, title, resultId, onDownload, className }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError]   = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  function handlePrint() {
    const printFrame = document.getElementById("bios-pdf-frame") as HTMLIFrameElement | null;
    if (printFrame?.contentWindow) {
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
    } else {
      window.open(signedUrl, "_blank");
    }
  }

  function handleDownload() {
    const link = document.createElement("a");
    link.href = signedUrl;
    link.download = `resultado-${resultId ?? "bios"}.pdf`;
    link.click();
    onDownload?.();
  }

  return (
    <div className={cn("flex flex-col h-full", isFullscreen && "fixed inset-0 z-50 bg-gray-900", className)}>
      {/* Toolbar */}
      <div className={cn(
        "flex items-center justify-between gap-3 px-4 py-3",
        "border-b border-bios-line bg-white",
        isFullscreen && "border-0 bg-gray-800 text-white"
      )}>
        <span className={cn("text-sm font-bold truncate", isFullscreen ? "text-white" : "text-bios-navy")}>
          {title ?? "Resultado médico"}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handlePrint}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition",
              isFullscreen
                ? "text-white hover:bg-white/10"
                : "text-bios-navy hover:bg-gray-100 border border-bios-line"
            )}
            title="Imprimir"
          >
            <Printer className="w-4 h-4" /> Imprimir
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-bios-navy text-white hover:bg-[#102f4a] transition"
            title="Descargar PDF"
          >
            <Download className="w-4 h-4" /> Descargar
          </button>
          <button
            onClick={() => setIsFullscreen((f) => !f)}
            className={cn(
              "p-2 rounded-lg transition",
              isFullscreen
                ? "text-white hover:bg-white/10"
                : "text-gray-500 hover:bg-gray-100 border border-bios-line"
            )}
            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF frame */}
      <div className="relative flex-1 min-h-[520px]">
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
            <Loader2 className="w-8 h-8 text-bios-blue animate-spin mb-3" />
            <p className="text-sm text-gray-500 font-medium">Cargando documento…</p>
          </div>
        )}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7 text-amber-600" />
            </div>
            <h4 className="font-outfit font-black text-bios-navy mb-2">No se pudo cargar el PDF</h4>
            <p className="text-sm text-gray-500 mb-4">El visor no está disponible en este navegador.</p>
            <button onClick={handleDownload} className="bios-btn-primary text-sm">
              <Download className="w-4 h-4" /> Descargar en su lugar
            </button>
          </div>
        )}
        <iframe
          id="bios-pdf-frame"
          src={`${signedUrl}#toolbar=0&view=FitH`}
          className={cn("w-full h-full min-h-[520px]", (isLoading || hasError) && "opacity-0")}
          onLoad={() => setIsLoading(false)}
          onError={() => { setIsLoading(false); setHasError(true); }}
          title={title ?? "Resultado médico"}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </div>
    </div>
  );
}
