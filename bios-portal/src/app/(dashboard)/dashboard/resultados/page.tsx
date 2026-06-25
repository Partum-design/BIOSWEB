import { createClient } from "@/lib/supabase/server";
import {
  getDemoPatientByProfileId,
  getDemoVisibleResultsForPatient,
  isDemoMode,
} from "@/lib/demo";
import { getDemoSession } from "@/lib/demo-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, ArrowRight, Search, Filter } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Metadata } from "next";
import type { ResultStatus } from "@/types";

export const metadata: Metadata = { title: "Mis resultados" };

interface PageProps {
  searchParams: { estatus?: string; tipo?: string; q?: string };
}

export default async function ResultadosPage({ searchParams }: PageProps) {
  let results: {
    id: string;
    title: string;
    study_type: string;
    result_date: string;
    status: "draft" | "published" | "sent" | "viewed" | "archived";
    lab_branch: string | null;
    notes_for_patient: string | null;
    created_at: string;
  }[] = [];

  if (isDemoMode) {
    const session = getDemoSession();
    if (!session) redirect("/login");

    const patient = getDemoPatientByProfileId(session.profile.id);
    results = patient ? getDemoVisibleResultsForPatient(patient.id) : [];

    if (searchParams.estatus) {
      results = results.filter((result) => result.status === searchParams.estatus);
    }
    if (searchParams.tipo) {
      results = results.filter((result) =>
        result.study_type.toLowerCase().includes(searchParams.tipo!.toLowerCase())
      );
    }
    if (searchParams.q) {
      results = results.filter((result) =>
        result.title.toLowerCase().includes(searchParams.q!.toLowerCase())
      );
    }
  } else {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: patient } = await supabase
      .from("patients")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    let query = supabase
      .from("medical_results")
      .select("id, title, study_type, result_date, status, lab_branch, notes_for_patient, created_at")
      .in("status", ["published", "sent", "viewed", "archived"])
      .order("result_date", { ascending: false });

    if (patient) {
      query = query.eq("patient_id", patient.id);
    } else {
      return (
        <div className="animate-page-enter">
          <h1 className="font-outfit text-2xl font-black text-bios-navy mb-6">Mis resultados</h1>
          <EmptyState
            icon={FileText}
            title="Aún no tienes resultados disponibles"
            description="Cuando tu médico registre tus resultados, aparecerán aquí automáticamente."
          />
        </div>
      );
    }

    if (searchParams.estatus) query = query.eq("status", searchParams.estatus as ResultStatus);
    if (searchParams.tipo)    query = query.ilike("study_type", `%${searchParams.tipo}%`);
    if (searchParams.q)       query = query.ilike("title", `%${searchParams.q}%`);

    const { data } = await query;
    results = data ?? [];
  }

  const totalCount = results.length;

  const statusFilters: { value: string; label: string }[] = [
    { value: "",          label: "Todos" },
    { value: "published", label: "Disponibles" },
    { value: "sent",      label: "Enviados" },
    { value: "viewed",    label: "Vistos" },
    { value: "archived",  label: "Archivados" },
  ];

  return (
    <div className="animate-page-enter space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-outfit text-2xl font-black text-bios-navy mb-1">Mis resultados</h1>
        <p className="text-sm text-gray-500">
          {totalCount === 0 ? "Sin resultados con los filtros actuales" : `${totalCount} resultado${totalCount !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Filtros */}
      <div className="bios-panel p-4 flex flex-col sm:flex-row gap-3">
        {/* Búsqueda */}
        <form method="GET" className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            name="q"
            type="search"
            defaultValue={searchParams.q ?? ""}
            placeholder="Buscar por nombre del estudio…"
            className="bios-field pl-10 text-sm"
          />
        </form>

        {/* Status filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {statusFilters.map(({ value, label }) => {
            const isActive = (searchParams.estatus ?? "") === value;
            const params = new URLSearchParams(searchParams as Record<string, string>);
            if (value) params.set("estatus", value);
            else params.delete("estatus");
            return (
              <Link
                key={value}
                href={`?${params.toString()}`}
                className={`bios-chip text-xs transition ${
                  isActive
                    ? "bg-bios-navy text-white border-bios-navy"
                    : "bg-white text-gray-600 border-bios-line hover:border-bios-blue hover:text-bios-blue"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Results grid */}
      {!results?.length ? (
        <EmptyState
          icon={FileText}
          title="Sin resultados"
          description={
            searchParams.q || searchParams.estatus
              ? "No hay resultados con los filtros seleccionados. Intenta cambiar los criterios de búsqueda."
              : "Aún no tienes resultados disponibles. Cuando tu médico los suba, aparecerán aquí."
          }
          action={
            (searchParams.q || searchParams.estatus) ? (
              <Link href="/dashboard/resultados" className="bios-btn-secondary text-sm">
                Limpiar filtros
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {results.map((result) => (
            <Link
              key={result.id}
              href={`/dashboard/resultados/${result.id}`}
              className="bios-panel p-5 flex items-center gap-4 hover:border-bios-blue/40 hover:shadow-md transition group"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-bios-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-bios-navy">{result.title}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                  <span className="text-xs text-gray-400">{result.study_type}</span>
                  <span className="text-xs text-gray-400">{formatDate(result.result_date)}</span>
                  {result.lab_branch && (
                    <span className="text-xs text-gray-400">{result.lab_branch}</span>
                  )}
                </div>
                {result.notes_for_patient && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{result.notes_for_patient}</p>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <StatusBadge status={result.status} />
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-bios-blue transition" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
