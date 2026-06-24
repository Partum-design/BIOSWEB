import { createAdminClient } from "@/lib/supabase/server";
import { hashToken, formatDate } from "@/lib/utils";
import { logAudit } from "@/lib/audit";
import { PDFViewer } from "@/components/ui/PDFViewer";
import { headers } from "next/headers";
import { AlertCircle, Clock, ShieldOff, FlaskConical, Calendar, User, Building2, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Consultar resultado",
  robots: { index: false, follow: false },
};

// Generar signed URL válida por 1 hora
async function getSignedUrl(filePath: string): Promise<string | null> {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient.storage
    .from("medical-results")
    .createSignedUrl(filePath, 3600);
  if (error || !data) return null;
  return data.signedUrl;
}

type TokenState =
  | { ok: true; result: ResultData; signedUrl: string | null; linkId: string }
  | { ok: false; reason: "not_found" | "expired" | "revoked" };

interface ResultData {
  title: string;
  study_type: string;
  result_date: string;
  lab_branch: string | null;
  notes_for_patient: string | null;
  file_path: string | null;
  patient: { full_name: string } | null;
  doctor: { professional_name: string | null; specialty: string | null } | null;
}

async function verifyToken(token: string): Promise<TokenState> {
  const adminClient = createAdminClient();
  const tokenHash = hashToken(token);

  const { data: link } = await adminClient
    .from("result_access_links")
    .select(`
      id, revoked_at, expires_at, access_count,
      result:medical_results(
        title, study_type, result_date, lab_branch, notes_for_patient, file_path,
        patient:patients(full_name),
        doctor:doctors(professional_name, specialty)
      )
    `)
    .eq("token_hash", tokenHash)
    .single();

  if (!link) return { ok: false, reason: "not_found" };
  if (link.revoked_at) return { ok: false, reason: "revoked" };
  if (link.expires_at && new Date(link.expires_at) < new Date()) return { ok: false, reason: "expired" };

  const result = link.result as unknown as ResultData | null;
  if (!result) return { ok: false, reason: "not_found" };

  // Actualizar contador y timestamp de acceso
  await adminClient
    .from("result_access_links")
    .update({
      access_count: (link.access_count ?? 0) + 1,
      last_accessed_at: new Date().toISOString(),
    })
    .eq("id", link.id);

  // Log de auditoría — sin actor autenticado
  await logAudit({
    actorProfileId: null,
    action: "link.access",
    entityType: "result_access_link",
    entityId: link.id,
    metadata: { tokenHash },
  });

  let signedUrl: string | null = null;
  if (result.file_path) {
    signedUrl = await getSignedUrl(result.file_path);
  }

  return { ok: true, result, signedUrl, linkId: link.id };
}

// ─── Error states ──────────────────────────────────────────────────────────────

function TokenError({ reason }: { reason: "not_found" | "expired" | "revoked" }) {
  const configs = {
    not_found: {
      icon: AlertCircle,
      iconColor: "text-red-500",
      iconBg: "bg-red-50",
      title: "Link no válido",
      description: "Este link de consulta no existe o fue ingresado incorrectamente. Verifica que la URL sea correcta.",
    },
    expired: {
      icon: Clock,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-50",
      title: "Link expirado",
      description: "Este link de consulta ya no está vigente. Solicita a tu médico que genere uno nuevo.",
    },
    revoked: {
      icon: ShieldOff,
      iconColor: "text-gray-500",
      iconBg: "bg-gray-50",
      title: "Link revocado",
      description: "Este link fue cancelado. Si necesitas acceder a tu resultado, contacta a tu médico.",
    },
  };

  const config = configs[reason];
  const Icon = config.icon;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bios-bg)" }}>
      {/* Header minimal */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-bios-navy rounded-lg flex items-center justify-center">
            <FlaskConical className="w-4 h-4 text-white" />
          </div>
          <span className="font-outfit font-black text-bios-navy">Laboratorios BIOS</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bios-panel p-8 text-center">
          <div className={`w-16 h-16 ${config.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
            <Icon className={`w-8 h-8 ${config.iconColor}`} />
          </div>
          <h1 className="font-outfit text-2xl font-black text-bios-navy mb-3">{config.title}</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">{config.description}</p>
          <a
            href="https://wa.me/528003100000"
            className="bios-btn-secondary text-sm w-full justify-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contactar por WhatsApp
          </a>
        </div>
      </main>

      <footer className="text-center text-xs text-gray-400 py-4">
        Laboratorios BIOS — Resultados médicos seguros
      </footer>
    </div>
  );
}

// ─── Vista principal del resultado ────────────────────────────────────────────

export default async function ConsultaTokenPage({
  params,
}: {
  params: { token: string };
}) {
  const state = await verifyToken(params.token);

  if (!state.ok) {
    return <TokenError reason={state.reason} />;
  }

  const { result, signedUrl } = state;
  const doctorName = result.doctor?.professional_name ?? "Médico tratante";
  const specialty = result.doctor?.specialty;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bios-bg)" }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-bios-navy rounded-lg flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-outfit font-black text-bios-navy text-sm">Laboratorios BIOS</span>
              <p className="text-[10px] text-gray-400 leading-none mt-0.5">Resultado médico</p>
            </div>
          </div>

          <a
            href="https://laboratoriosbios.com.mx"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-bios-blue transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            laboratoriosbios.com.mx
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        {/* Encabezado del resultado */}
        <div className="bios-dark-panel p-6 lg:p-8">
          <span className="bios-kicker !bg-white/10 !border-white/15 !text-cyan-100 mb-4">
            <FlaskConical className="w-3.5 h-3.5" /> Resultado disponible
          </span>
          <h1 className="font-outfit text-2xl lg:text-3xl font-black text-white mt-4 mb-1">
            {result.title}
          </h1>
          <p className="text-blue-100/60 text-sm">{result.study_type}</p>

          {result.patient && (
            <p className="text-white/80 text-sm mt-3 font-medium">
              Paciente: {result.patient.full_name}
            </p>
          )}
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bios-panel p-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
              <Calendar className="w-3.5 h-3.5" /> Fecha del estudio
            </div>
            <p className="font-bold text-bios-navy text-sm">{formatDate(result.result_date)}</p>
          </div>

          <div className="bios-panel p-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
              <FlaskConical className="w-3.5 h-3.5" /> Tipo de estudio
            </div>
            <p className="font-bold text-bios-navy text-sm">{result.study_type}</p>
          </div>

          <div className="bios-panel p-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
              <User className="w-3.5 h-3.5" /> Médico solicitante
            </div>
            <p className="font-bold text-bios-navy text-sm">{doctorName}</p>
            {specialty && <p className="text-xs text-gray-400 mt-0.5">{specialty}</p>}
          </div>

          {result.lab_branch && (
            <div className="bios-panel p-4">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                <Building2 className="w-3.5 h-3.5" /> Sucursal
              </div>
              <p className="font-bold text-bios-navy text-sm">{result.lab_branch}</p>
            </div>
          )}
        </div>

        {/* Notas para el paciente */}
        {result.notes_for_patient && (
          <div className="bios-panel p-5 border-l-4 border-bios-blue">
            <p className="text-xs font-bold text-bios-blue mb-1 uppercase tracking-wide">
              Nota del médico
            </p>
            <p className="text-gray-700 text-sm leading-relaxed">{result.notes_for_patient}</p>
          </div>
        )}

        {/* PDF Viewer */}
        {signedUrl ? (
          <div className="bios-panel overflow-hidden">
            <div className="border-b border-bios-line px-5 py-4">
              <h2 className="font-outfit font-black text-bios-navy text-sm">Documento de resultado</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Puedes visualizarlo, descargarlo o imprimirlo desde aquí
              </p>
            </div>
            <PDFViewer
              signedUrl={signedUrl}
              title={result.title}
              className="h-[70vh]"
            />
          </div>
        ) : (
          <div className="bios-panel p-10 text-center">
            <FlaskConical className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-bold text-gray-500">El archivo del resultado no está disponible aún.</p>
            <p className="text-sm text-gray-400 mt-1">Contacta a tu médico si crees que esto es un error.</p>
          </div>
        )}

        {/* Aviso de privacidad */}
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800">
          <strong>Aviso de confidencialidad:</strong> Este resultado médico es confidencial y está
          destinado únicamente a la persona indicada. Si lo recibiste por error, por favor notifícalo
          a Laboratorios BIOS. No distribuyas este link.
        </div>

        {/* CTA para crear cuenta */}
        <div className="bios-dark-panel p-6 text-center">
          <p className="text-white font-bold mb-1">¿Quieres acceder siempre a tus resultados?</p>
          <p className="text-blue-100/60 text-sm mb-4">
            Crea una cuenta gratuita y consulta tu historial en cualquier momento.
          </p>
          <a
            href="/registro"
            className="bios-btn-blue inline-flex items-center gap-2"
          >
            Crear cuenta gratuita
          </a>
        </div>
      </main>

      <footer className="text-center text-xs text-gray-400 py-6 border-t border-gray-200 bg-white">
        © {new Date().getFullYear()} Laboratorios BIOS — Este link es de uso único e intransferible
      </footer>
    </div>
  );
}
