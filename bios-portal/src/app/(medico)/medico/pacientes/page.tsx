import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, FilePlus, Search, User, Mail, Phone, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pacientes" };

interface PageProps {
  searchParams: { q?: string };
}

export default async function PacientesPage({ searchParams }: PageProps) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let query = supabase
    .from("patients")
    .select(`
      id, full_name, email, phone, created_at, profile_id,
      result_count:medical_results(count)
    `)
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  if (searchParams.q) {
    query = query.or(`full_name.ilike.%${searchParams.q}%,email.ilike.%${searchParams.q}%`);
  }

  const { data: patients } = await query;
  const total = patients?.length ?? 0;

  return (
    <div className="animate-page-enter space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-outfit text-2xl font-black text-bios-navy">Pacientes</h1>
          <p className="text-sm text-gray-500">{total} paciente{total !== 1 ? "s" : ""} registrado{total !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/medico/resultados/nuevo" className="bios-btn-blue text-sm">
          <FilePlus className="w-4 h-4" /> Subir resultado
        </Link>
      </div>

      {/* Search */}
      <form method="GET" className="bios-panel p-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            name="q"
            type="search"
            defaultValue={searchParams.q ?? ""}
            placeholder="Buscar por nombre o correo…"
            className="bios-field pl-10 text-sm"
          />
        </div>
      </form>

      {!patients?.length ? (
        <EmptyState
          icon={Users}
          title={searchParams.q ? "Sin resultados" : "Aún no tienes pacientes registrados"}
          description={
            searchParams.q
              ? `No se encontraron pacientes con "${searchParams.q}".`
              : "Los pacientes aparecerán aquí cuando subas un resultado y los asocies."
          }
          action={
            !searchParams.q ? (
              <Link href="/medico/resultados/nuevo" className="bios-btn-blue text-sm">
                <FilePlus className="w-4 h-4" /> Subir primer resultado
              </Link>
            ) : (
              <Link href="/medico/pacientes" className="bios-btn-secondary text-sm">Limpiar búsqueda</Link>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          {patients.map((patient) => {
            const resultCount = (patient.result_count as unknown as { count: number }[])?.[0]?.count ?? 0;
            const hasAccount = !!patient.profile_id;
            return (
              <div key={patient.id} className="bios-panel p-5 flex items-center gap-4 hover:border-bios-blue/30 transition">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 font-black text-gray-600">
                  {patient.full_name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-bios-navy">{patient.full_name}</p>
                    {hasAccount && (
                      <span className="bios-chip text-[10px] bg-green-50 text-green-700 border-green-200 py-0.5 px-2">
                        Con cuenta
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                      <Mail className="w-3 h-3" /> {patient.email}
                    </span>
                    {patient.phone && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                        <Phone className="w-3 h-3" /> {patient.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 text-right">
                  <div>
                    <p className="font-outfit font-black text-bios-navy text-lg">{resultCount}</p>
                    <p className="text-xs text-gray-400">resultado{resultCount !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
