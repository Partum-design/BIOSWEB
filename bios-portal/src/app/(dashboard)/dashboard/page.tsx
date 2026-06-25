import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FileText, CheckCircle, Clock, Download, ArrowRight, FlaskConical,
} from "lucide-react";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Inicio" };

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileResult, patientResult] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    supabase.from("patients").select("id").eq("profile_id", user.id).single(),
  ]);

  const profile  = profileResult.data;
  const patient  = patientResult.data;

  const { data: results } = patient
    ? await supabase
        .from("medical_results")
        .select("id, title, study_type, result_date, status, created_at")
        .eq("patient_id", patient.id)
        .in("status", ["published", "sent", "viewed", "archived"])
        .order("created_at", { ascending: false })
        .limit(5)
    : { data: [] };

  // Estadísticas
  const { count: totalCount } = patient
    ? await supabase
        .from("medical_results")
        .select("id", { count: "exact", head: true })
        .eq("patient_id", patient.id)
        .in("status", ["published", "sent", "viewed", "archived"])
    : { count: 0 };

  const { count: newCount } = patient
    ? await supabase
        .from("medical_results")
        .select("id", { count: "exact", head: true })
        .eq("patient_id", patient.id)
        .in("status", ["published", "sent"])
    : { count: 0 };

  const firstName = profile?.full_name?.split(" ")[0] ?? "Paciente";

  const stats = [
    { label: "Resultados totales",  value: totalCount ?? 0, icon: FileText,    color: "text-bios-blue",  bg: "bg-blue-50" },
    { label: "Nuevos disponibles",  value: newCount ?? 0,   icon: Clock,       color: "text-amber-600",  bg: "bg-amber-50" },
    { label: "Resultados vistos",   value: (totalCount ?? 0) - (newCount ?? 0), icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Estudios este año",   value: results?.filter(r => new Date(r.created_at).getFullYear() === new Date().getFullYear()).length ?? 0, icon: FlaskConical, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="animate-page-enter space-y-8">
      {/* Bienvenida */}
      <div className="bios-dark-panel p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl opacity-20"
             style={{ background: "radial-gradient(circle, #06b6d4, transparent 70%)" }} />
        <div className="absolute left-0 bottom-0 w-40 h-40 rounded-full blur-3xl opacity-15"
             style={{ background: "radial-gradient(circle, #2563eb, transparent 70%)" }} />
        <div className="relative z-10">
          <span className="bios-kicker !bg-white/10 !border-white/15 !text-cyan-100 mb-4">
            <FlaskConical className="w-3.5 h-3.5" /> Portal Pacientes
          </span>
          <h1 className="font-outfit text-3xl lg:text-4xl font-black text-white mt-4 mb-2">
            Hola, {firstName} 👋
          </h1>
          <p className="text-blue-100/80 text-base">
            Aquí puedes consultar todos tus estudios y resultados de Laboratorios BIOS.
          </p>
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

      {/* Resultados recientes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-outfit text-xl font-black text-bios-navy">Resultados recientes</h2>
          {(results?.length ?? 0) > 0 && (
            <Link href="/dashboard/resultados" className="flex items-center gap-1 text-sm font-bold text-bios-blue hover:text-bios-cyan transition-colors">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {!results?.length ? (
          <EmptyState
            icon={FileText}
            title="Aún no tienes resultados disponibles"
            description="Cuando tu médico suba un resultado, aparecerá aquí. También puedes consultar por el link que te compartió."
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
                  <p className="font-bold text-bios-navy truncate">{result.title}</p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {result.study_type} · {formatDate(result.result_date)}
                  </p>
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

      {/* Ayuda */}
      <div className="bios-panel p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-xl">💬</span>
        </div>
        <div className="flex-1">
          <p className="font-bold text-bios-navy text-sm">¿Necesitas ayuda?</p>
          <p className="text-xs text-gray-500 mt-0.5">Contáctanos por WhatsApp para cualquier duda sobre tus resultados.</p>
        </div>
        <a
          href="https://wa.me/5211234567890?text=Hola%20Laboratorios%20BIOS,%20tengo%20una%20pregunta%20sobre%20mis%20resultados"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 bios-btn-primary text-sm"
          style={{ background: "#25d366" }}
        >
          WhatsApp
        </a>
      </div>
    </div>
  );
}
