import Link from "next/link";
import { FlaskConical, Home } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Página no encontrada" };

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-bios-bg">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-bios-navy rounded-3xl flex items-center justify-center mx-auto mb-6">
          <FlaskConical className="w-10 h-10 text-white" />
        </div>

        <p className="font-outfit font-black text-8xl text-bios-navy/10 leading-none mb-4">404</p>

        <h1 className="font-outfit text-2xl font-black text-bios-navy mb-3">
          Página no encontrada
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          La página que buscas no existe o fue movida.
          Verifica la URL o regresa al inicio.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="bios-btn-blue">
            <Home className="w-4 h-4" /> Ir al inicio
          </Link>
          <a
            href="https://laboratoriosbios.com.mx"
            className="bios-btn-secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sitio web BIOS
          </a>
        </div>
      </div>
    </div>
  );
}
