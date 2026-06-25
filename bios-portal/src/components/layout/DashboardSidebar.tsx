"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, User, LogOut, ChevronRight, X, Menu,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { signOut } from "@/lib/auth/actions";
import type { Profile } from "@/types";
import { useState } from "react";

interface DashboardSidebarProps {
  profile: Profile;
}

const patientNav = [
  { href: "/dashboard",            icon: LayoutDashboard, label: "Inicio" },
  { href: "/dashboard/resultados", icon: FileText,         label: "Mis resultados" },
  { href: "/dashboard/perfil",     icon: User,             label: "Mi perfil" },
];

export function DashboardSidebar({ profile }: DashboardSidebarProps) {
  const pathname   = usePathname();
  const [open, setOpen] = useState(false);

  const navItems = patientNav;

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
          <div className="w-10 h-10 rounded-full bg-bios-blue/20 border border-bios-blue/30 flex items-center justify-center">
            <span className="text-sm font-black text-bios-blue">
              {getInitials(profile.full_name)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-white truncate">{profile.full_name}</p>
            <p className="text-xs text-blue-200/60 truncate">{profile.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
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
              <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-bios-cyan" : "group-hover:text-bios-cyan")} />
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
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0 min-h-screen"
             style={{ background: "linear-gradient(180deg, #0a1c2e 0%, #071827 100%)" }}>
        <SidebarContent />
      </aside>

      {/* Mobile: hamburger */}
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
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
