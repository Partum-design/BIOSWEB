import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bios-bg)" }}>
      {/* Top nav */}
      <header className="bg-bios-navy text-white px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-cyan-300" />
          </div>
          <span className="font-outfit font-black text-sm">Panel Admin · BIOS</span>
        </div>
        <span className="text-xs text-white/50">{profile.full_name}</span>
      </header>

      {/* Sub-nav */}
      <nav className="bg-white border-b border-bios-line px-6 py-2 flex gap-6 text-sm overflow-x-auto">
        {[
          { href: "/admin", label: "Inicio" },
          { href: "/admin/usuarios", label: "Usuarios" },
          { href: "/admin/resultados", label: "Resultados" },
          { href: "/admin/auditoria", label: "Auditoría" },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="font-bold text-gray-500 hover:text-bios-navy transition whitespace-nowrap py-1"
          >
            {label}
          </Link>
        ))}
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
