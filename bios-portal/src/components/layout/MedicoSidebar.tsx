"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, FilePlus, Users, LogOut, ChevronRight, X, Menu, Stethoscope,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { signOut } from "@/lib/auth/actions";
import type { Profile } from "@/types";
import { useState } from "react";

interface MedicoSidebarProps {
  profile: Profile;
}

const medicoNav = [
  { href: "/medico",                       icon: LayoutDashboard, label: "Inicio" },
  { href: "/medico/resultados",            icon: FileText,         label: "Mis resultados" },
  { href: "/medico/resultados/nuevo",      icon: FilePlus,         label: "Subir resultado" },
  { href: "/medico/pacientes",             icon: Users,            label: "Pacientes" },
];

export function MedicoSidebar({ profile }: MedicoSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-5 border-b border-white/10">
        <Link href="/" className="block mb-5">
          <img
            src="/logos/bios-logo-white.png"
            alt="Laboratorios BIOS"
            className="h-16 max-w-full object-contain"
          />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-400/20 border border-cyan-400/30 flex items-center justify-center">
            <span className="text-sm font-black text-cyan-400">
              {getInitials(profile.full_name)}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-black text-cyan-300/80 uppercase tracking-widest">Médico</span>
            </div>
            <p className="text-sm font-black text-white truncate">{profile.full_name}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {medicoNav.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href ||
            (href !== "/medico" && href !== "/medico/resultados" && pathname.startsWith(href)) ||
            (href === "/medico/resultados" && pathname === "/medico/resultados");
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group",
                isActive
                  ? "bg-white/10 text-white border border-white/12"
                  : "text-blue-100/70 hover:text-white hover:bg-white/6"
              )}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-cyan-400" : "group-hover:text-cyan-400")} />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-blue-100/60 hover:text-red-300 hover:bg-red-500/10 transition"
          >
            <LogOut className="w-5 h-5" /> Cerrar sesión
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0 min-h-screen"
             style={{ background: "linear-gradient(180deg, #0a1c2e 0%, #071827 100%)" }}>
        <SidebarContent />
      </aside>

      {/* Mobile trigger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-11 h-11 rounded-xl bg-bios-navy text-white flex items-center justify-center shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="relative flex flex-col w-72 min-h-full"
                 style={{ background: "linear-gradient(180deg, #0a1c2e 0%, #071827 100%)" }}>
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 text-white">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
