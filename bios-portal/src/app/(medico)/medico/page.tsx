import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FilePlus, FileText, Users, ArrowRight, Stethoscope, TrendingUp } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Panel Médico" };

export default async function MedicoDashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { data: doctor } = await supabase
    .from("doctors")
    .select("id, professional_name, specialty")
    .eq("profile_id", user.id)
    .single();

  // Si no tiene registro de médico todavía, pedirle que complete su perfil
  if (!doctor) {
    return (
      <div className="animate-page-enter space-y-6">
        <div className="bios-dark-panel p-8 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-8 h-8 text-cyan-300" />
          </div>
          <h1 className="font-outfit text-3xl font-black text-white mb-3">Perfil médico incompleto</h1>
          <p className="text-blue-100/80 mb-6 max-w-md mx-auto">
            Tu cuenta tiene rol de médico pero falta completar tu información profesional. Contacta al administrador para activar tu perfil.
          </p>
        </div>
      </div>
    );
  }

  // Stats
  const { count: totalResults } = await supabase
    .from("medical_results")
    .select("id", { count: "exact", head: true })
    .eq("doctor_id", doctor.id);

  const { count: publishedResults } = await supabase
    .from("medical_results")
    .select("id", { count: "exact", head: true })
    .eq("doctor_id", doctor.id)
    .in("status", ["published", "sent", "viewed"]);

  const { count: draftResults } = await supabase
    .from("medical_results")
    .select("id", { count: "exact", head: true })
    .eq("doctor_id", doctor.id)
    .eq("status", "draft");

  const { count: totalPatients } = await supabase
    .from("patients")
    .select("id", { count: "exact", head: true })
    .eq("created_by", user.id);

  // Últimos resultados subidos
  const { data: recentResults } = await supabase
    .from("medical_results")
    .select(`
      id, title, study_type, status, created_at,
      patient:patients(full_name, email)
    `)
    .eq("doctor_id", doctor.id)
    .order("created_at", { ascending: false })
    .limit(6);

  const firstName = profile?.full_name?.split(" ")[0] ?? "Doctor";

  const stats = [
    { label: "Resultados totales",  value: totalResults ?? 0,    icon: FileText, color: "text-bios-blue",  bg: "bg-blue-50" },
    { label: "Publicados / Vistos", value: publishedResults ?? 0, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { label: "Borradores",          value: draftResults ?? 0,    icon: FileText, color: "text-amber-600",  bg: "bg-amber-50" },
    { label: "Pacientes creados",   value: totalPatients ?? 0,   icon: Users,    color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="animate-page-enter space-y-8">
      {/* Header */}
      <div className="bios-dark-panel p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl opacity-20"
             style={{ background: "radial-gradient(circle, #06b6d4, transparent 70%)" }} />
        <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <span className="bios-kicker !bg-white/10 !border-white/15 !text-cyan-100 mb-4">
              <Stethoscope className="w-3.5 h-3.5" /> Panel Médico
            </span>
            <h1 className="font-outfit text-3xl lg:text-4xl font-black text-white mt-4 mb-1">
              Hola, {doctor.professional_name ?? firstName} 👋
            </h1>
            {doctor.specialty && (
              <p className="text-blue-100/60 text-sm">{doctor.specialty}</p>
            )}
          </div>
          <Link href="/medico/resultados/nuevo" className="bios-btn-blue flex-shrink-0">
            <FilePlus className="w-5 h-5" /> Subir resultado
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bios-panel p-5">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="font-outfit text-3xl font-black text-bios-navy">{value}</p>
            <p className="text-xs text-gray-500 font-medium mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/medico/resultados/nuevo"
              className="bios-panel p-5 flex items-center gap-4 hover:border-bios-blue/40 hover:shadow-md transition group">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <FilePlus className="w-6 h-6 text-bios-blue" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-bios-navy">Subir nuevo resultado</p>
            <p className="text-xs text-gray-400 mt-0.5">PDF, imagen o datos estructurados</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-bios-blue transition" />
        </Link>

        <Link href="/medico/pacientes"
              className="bios-panel p-5 flex items-center gap-4 hover:border-bios-blue/40 hover:shadow-md transition group">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-bios-navy">Gestionar pacientes</p>
            <p className="text-xs text-gray-400 mt-0.5">Busca, crea o actualiza registros</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-bios-blue transition" />
        </Link>
      </div>

      {/* Resultados recientes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-outfit text-xl font-black text-bios-navy">Resultados recientes</h2>
          <Link href="/medico/resultados" className="flex items-center gap-1 text-sm font-bold text-bios-blue hover:text-bios-cyan transition-colors">
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {!recentResults?.length ? (
          <EmptyState
            icon={FileText}
            title="Aún no has subido resultados"
            description="Sube el primer resultado médico y genera un link de consulta seguro para tu paciente."
            action={
              <Link href="/medico/resultados/nuevo" className="bios-btn-blue text-sm">
                <FilePlus className="w-4 h-4" /> Subir primer resultado
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {recentResults.map((result) => {
              const patient = result.patient as unknown as { full_name: string; email: string } | null;
              return (
                <Link
                  key={result.id}
                  href={`/medico/resultados`}
                  className="bios-panel p-5 flex items-center gap-4 hover:border-bios-blue/40 hover:shadow-md transition group"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-bios-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-bios-navy truncate">{result.title}</p>
                    <div className="flex gap-3 mt-0.5">
                      <span className="text-xs text-gray-400">{patient?.full_name ?? "Paciente"}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{formatRelativeTime(result.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatusBadge status={result.status} />
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-bios-blue transition" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
