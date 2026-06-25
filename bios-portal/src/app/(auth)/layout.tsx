import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bios-bg flex flex-col lg:flex-row">
      {/* Panel izquierdo — branding */}
      <aside className="hidden lg:flex lg:w-[42%] xl:w-[38%] flex-col justify-between p-10 xl:p-14 relative overflow-hidden"
             style={{ background: "linear-gradient(145deg, #0a1c2e 0%, #0d2f4e 60%, #071827 100%)" }}>
        {/* Ambient glow */}
        <div className="absolute -right-20 top-0 w-96 h-96 rounded-full blur-3xl opacity-20"
             style={{ background: "radial-gradient(circle, #2563eb, transparent 70%)" }} />
        <div className="absolute left-0 bottom-0 w-80 h-80 rounded-full blur-3xl opacity-15"
             style={{ background: "radial-gradient(circle, #06b6d4, transparent 70%)" }} />

        {/* Logo */}
        <Link href="/" className="relative z-10">
          <img
            src="/logos/bios-logo-white.png"
            alt="Laboratorios BIOS"
            className="h-24 xl:h-28 w-auto object-contain drop-shadow-sm"
          />
        </Link>

        {/* Copy central */}
        <div className="relative z-10 py-12">
          <span className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.28em] text-cyan-200/80 mb-6">
            <span className="w-8 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(125,211,252,0.8))" }} />
            Portal Médico
          </span>
          <h1 className="font-outfit text-4xl xl:text-5xl font-black text-white leading-tight mb-5">
            Tus resultados,<br />
            <span className="text-transparent bg-clip-text"
                  style={{ backgroundImage: "linear-gradient(135deg, #7dd3fc, #3b82f6)" }}>
              cuando los necesitas.
            </span>
          </h1>
          <p className="text-blue-100/80 text-lg leading-relaxed">
            Accede a tus estudios clínicos, imágenología y más. De forma segura y desde cualquier dispositivo.
          </p>

          {/* Feature pills */}
          <div className="mt-8 grid gap-3">
            {[
              { icon: "🔒", text: "Resultados cifrados y privados" },
              { icon: "📄", text: "Descarga e imprime tu PDF en segundos" },
              { icon: "🔗", text: "Link seguro incluso sin cuenta" },
            ].map((f) => (
              <div key={f.text}
                   className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/80"
                   style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <span className="text-base">{f.icon}</span>
                {f.text}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-blue-200/40 text-xs font-medium">
          © {new Date().getFullYear()} Laboratorios BIOS · Todos los derechos reservados
        </p>
      </aside>

      {/* Panel derecho — formulario */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
        {/* Logo móvil */}
        <Link
          href="/"
          className="lg:hidden mb-8 rounded-2xl bg-bios-navy px-5 py-4 shadow-lg"
        >
          <img
            src="/logos/bios-logo-white.png"
            alt="Laboratorios BIOS"
            className="h-16 w-auto object-contain"
          />
        </Link>

        <div className="w-full max-w-md animate-page-enter">
          {children}
        </div>
      </main>
    </div>
  );
}
