import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FilePlus, FileText, ArrowRight, Search, Link2, Trash2 } from "lucide-react";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Resultados subidos" };

interface PageProps {
  searchParams: { q?: string; estatus?: string };
}

export default async function MedicoResultadosPage({ searchParams }: PageProps) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: doctor } = await supabase
    .from("doctors").select("id").eq("profile_id", user.id).single();

  if (!doctor) redirect("/medico");

  let query = supabase
    .from("medical_results")
    .select(`
      id, title, study_type, result_date, status, created_at,
      patient:patients(full_name, email)
    `)
    .eq("doctor_id", doctor.id)
    .order("created_at", { ascending: false });

  if (searchParams.estatus) query = query.eq("status", searchParams.estatus as never);
  if (searchParams.q)       query = query.or(`title.ilike.%${searchParams.q}%`);

  const { data: results } = await query;
  const total = results?.length ?? 0;

  return (
    <div className="animate-page-enter space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-outfit text-2xl font-black text-bios-navy">Mis resultados</h1>
          <p className="text-sm text-gray-500">{total} resultado{total !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/medico/resultados/nuevo" className="bios-btn-blue text-sm">
          <FilePlus className="w-4 h-4" /> Subir resultado
        </Link>
      </div>

      {/* Filtros */}
      <div className="bios-panel p-4 flex flex-col sm:flex-row gap-3">
        <form method="GET" className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            name="q"
            type="search"
            defaultValue={searchParams.q ?? ""}
            placeholder="Buscar por título del resultado…"
            className="bios-field pl-10 text-sm"
          />
        </form>
        <div className="flex flex-wrap gap-2 items-center">
          {["", "draft", "published", "sent", "viewed", "archived"].map((status) => {
            const label = { "": "Todos", draft: "Borrador", published: "Publicado", sent: "Enviado", viewed: "Visto", archived: "Archivado" }[status] ?? status;
            const isActive = (searchParams.estatus ?? "") === status;
            const params = new URLSearchParams(searchParams as Record<string, string>);
            if (status) params.set("estatus", status); else params.delete("estatus");
            return (
              <Link key={status} href={`?${params.toString()}`}
                    className={`bios-chip text-xs transition ${isActive ? "bg-bios-navy text-white border-bios-navy" : "bg-white text-gray-600 border-bios-line hover:border-bios-blue"}`}>
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {!results?.length ? (
        <EmptyState
          icon={FileText}
          title="Sin resultados"
          description="Sube el primer resultado para que aparezca aquí."
          action={
            <Link href="/medico/resultados/nuevo" className="bios-btn-blue text-sm">
              <FilePlus className="w-4 h-4" /> Subir resultado
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {results.map((result) => {
            const patient = result.patient as unknown as { full_name: string; email: string } | null;
            return (
              <div key={result.id} className="bios-panel p-5 flex items-center gap-4 hover:border-bios-blue/30 transition">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-bios-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-bios-navy truncate">{result.title}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                    <span className="text-xs text-gray-500">{patient?.full_name ?? "Paciente"}</span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">{result.study_type}</span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">{formatDate(result.result_date)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={result.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
