import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Portal | Laboratorios BIOS",
    template: "%s | Laboratorios BIOS",
  },
  description: "Portal de pacientes y médicos de Laboratorios BIOS. Consulta tus resultados médicos de forma segura.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="antialiased">{children}</body>
    </html>
  );
}
