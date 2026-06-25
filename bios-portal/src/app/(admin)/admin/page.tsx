import { createAdminClient } from "@/lib/supabase/server";
import {
  demoAuditLogs,
  demoDoctor,
  demoPatients,
  demoProfiles,
  demoResults,
  isDemoMode,
} from "@/lib/demo";
import { formatRelativeTime } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Users, FileText, Stethoscope, ShieldCheck,
  Link2, Activity, AlertTriangle,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Panel Administrador" };

export default async function AdminPage() {
  let totalUsers = 0;
  let totalPatients = 0;
  let totalDoctors = 0;
  let totalResults = 0;
  let activeLinks = 0;
  let auditToday = 0;
  let recentAudit: {
    id: string;
    action: string;
    entity_type: string;
    entity_id: string | null;
    created_at: string;
    actor_profile_id: string | null;
  }[] = [];
  let recentResults: {
    id: string;
    title: string;
    status: "draft" | "published" | "sent" | "viewed" | "archived";
    created_at: string;
    patient: { full_name: string } | null;
  }[] = [];
  let pendingDoctors: {
    id: string;
    full_name: string;
    email: string;
    created_at: string;
  }[] = [];

  if (isDemoMode) {
    totalUsers = Object.keys(demoProfiles).length + 2;
    totalPatients = demoPatients.length;
    totalDoctors = 1;
    totalResults = demoResults.length;
    activeLinks = 3;
    auditToday = 4;
    recentAudit = demoAuditLogs;
    recentResults = demoResults.slice(0, 6).map((result) => {
      const patient = demoPatients.find((item) => item.id === result.patient_id) ?? null;
      return {
        id: result.id,
        title: result.title,
        status: result.status,
        created_at: result.created_at,
        patient: patient ? { full_name: patient.full_name } : null,
      };
    });
    pendingDoctors = [
      {
        id: "demo-pending-doctor",
        full_name: "Dr. Roberto Salas",
        email: "roberto.salas@example.com",
        created_at: "2026-06-22T10:30:00.000Z",
      },
    ].filter((doctor) => doctor.id !== demoDoctor.id);
  } else {
    const adminClient = createAdminClient();

    const [
      { count: users },
      { count: patients },
      { count: doctors },
      { count: results },
      { count: links },
      { count: audits },
    ] = await Promise.all([
      adminClient.from("profiles").select("id", { count: "exact", head: true }),
      adminClient.from("patients").select("id", { count: "exact", head: true }),
      adminClient.from("doctors").select("id", { count: "exact", head: true }),
      adminClient.from("medical_results").select("id", { count: "exact", head: true }),
      adminClient
        .from("result_access_links")
        .select("id", { count: "exact", head: true })
        .is("revoked_at", null)
        .gt("expires_at", new Date().toISOString()),
      adminClient
        .from("audit_logs")
        .select("id", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 86400000).toISOString()),
    ]);

    const { data: auditData } = await adminClient
      .from("audit_logs")
      .select("id, action, entity_type, entity_id, created_at, actor_profile_id")
      .order("created_at", { ascending: false })
      .limit(10);

    const { data: resultData } = await adminClient
      .from("medical_results")
      .select(`
        id, title, status, created_at,
        patient:patients(full_name)
      `)
      .order("created_at", { ascending: false })
      .limit(6);

    const { data: pendingData } = await adminClient
      .from("profiles")
      .select("id, full_name, email, created_at")
      .eq("role", "doctor")
      .not("id", "in", `(SELECT profile_id FROM doctors WHERE profile_id IS NOT NULL)`);

    totalUsers = users ?? 0;
    totalPatients = patients ?? 0;
    totalDoctors = doctors ?? 0;
    totalResults = results ?? 0;
    activeLinks = links ?? 0;
    auditToday = audits ?? 0;
    recentAudit = auditData ?? [];
    recentResults = (resultData ?? []) as unknown as typeof recentResults;
    pendingDoctors = pendingData ?? [];
  }

  const stats = [
    { label: "Usuarios",      value: totalUsers,    icon: Users,       color: "text-bios-blue",   bg: "bg-blue-50" },
    { label: "Pacientes",     value: totalPatients, icon: Users,       color: "text-purple-600",  bg: "bg-purple-50" },
    { label: "Médicos",       value: totalDoctors,  icon: Stethoscope, color: "text-teal-600",    bg: "bg-teal-50" },
    { label: "Resultados",    value: totalResults,  icon: FileText,    color: "text-indigo-600",  bg: "bg-indigo-50" },
    { label: "Links activos", value: activeLinks,   icon: Link2,       color: "text-cyan-600",    bg: "bg-cyan-50" },
    { label: "Eventos hoy",   value: auditToday,    icon: Activity,    color: "text-green-600",   bg: "bg-green-50" },
  ];

  return (
    <div className="animate-page-enter space-y-8">
      {/* Header */}
      <div className="bios-dark-panel p-6 lg:p-8">
        <span className="bios-kicker !bg-white/10 !border-white/15 !text-cyan-100 mb-4">
          <ShieldCheck className="w-3.5 h-3.5" /> Administrador
        </span>
        <h1 className="font-outfit text-3xl font-black text-white mt-4">Panel de control</h1>
        <p className="text-blue-100/60 text-sm mt-1">Vista general del sistema BIOS Portal</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bios-panel p-5">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-4.5 h-4.5 ${color}`} />
            </div>
            <p className="font-outfit text-3xl font-black text-bios-navy">{value}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Alertas */}
      {pendingDoctors && pendingDoctors.length > 0 && (
        <div className="bios-panel p-5 border-l-4 border-amber-400">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h2 className="font-bold text-bios-navy text-sm">
              {pendingDoctors.length} médico{pendingDoctors.length !== 1 ? "s" : ""} sin perfil completo
            </h2>
          </div>
          <div className="space-y-2">
            {pendingDoctors.slice(0, 3).map((u) => (
              <div key={u.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{u.full_name}</span>
                <span className="text-gray-400 text-xs">{u.email}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Estos usuarios tienen rol "doctor" pero no tienen un registro en la tabla doctors.
            Crea su perfil de médico manualmente desde Supabase o construye la sección /admin/usuarios.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resultados recientes */}
        <div>
          <h2 className="font-outfit text-lg font-black text-bios-navy mb-4">Resultados recientes</h2>
          <div className="space-y-2">
            {recentResults?.map((result) => {
              const patient = result.patient as unknown as { full_name: string } | null;
              return (
                <div key={result.id} className="bios-panel p-4 flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-bios-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-bios-navy text-sm truncate">{result.title}</p>
                    <p className="text-xs text-gray-400">{patient?.full_name ?? "—"} · {formatRelativeTime(result.created_at)}</p>
                  </div>
                  <StatusBadge status={result.status} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Auditoría reciente */}
        <div>
          <h2 className="font-outfit text-lg font-black text-bios-navy mb-4">Auditoría reciente</h2>
          <div className="space-y-2">
            {recentAudit?.map((event) => {
              const actionLabels: Record<string, string> = {
                "result.upload": "Subida",
                "result.publish": "Publicación",
                "result.view": "Vista",
                "result.download": "Descarga",
                "link.create": "Link creado",
                "link.access": "Link accedido",
                "link.revoke": "Link revocado",
                "auth.login": "Login",
                "auth.logout": "Logout",
                "auth.signup": "Registro",
                "auth.password_reset": "Reset password",
              };
              const actionLabel = actionLabels[event.action] ?? event.action;
              const isAnon = !event.actor_profile_id;

              return (
                <div key={event.id} className="bios-panel p-3 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-bios-blue flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-bios-navy font-medium">
                      {actionLabel}
                      <span className="text-gray-400 font-normal"> · {event.entity_type}</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      {isAnon ? "Anónimo" : `Usuario ${event.actor_profile_id?.slice(0, 8)}`} · {formatRelativeTime(event.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
