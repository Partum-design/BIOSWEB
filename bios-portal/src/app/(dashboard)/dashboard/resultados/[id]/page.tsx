import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  demoDoctor,
  getDemoPatientByProfileId,
  getDemoResultById,
  isDemoMode,
} from "@/lib/demo";
import { getDemoSession } from "@/lib/demo-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, FlaskConical, Building2, User, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PDFViewer } from "@/components/ui/PDFViewer";
import { DemoResultDocument } from "@/components/demo/DemoResultDocument";
import { logAudit } from "@/lib/audit";
import type { Metadata } from "next";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return { title: "Detalle de resultado" };
}

export default async function ResultadoDetailPage({ params }: PageProps) {
  if (isDemoMode) {
    const session = getDemoSession();
    if (!session) redirect("/login");

    const patient = getDemoPatientByProfileId(session.profile.id);
    const result = getDemoResultById(params.id);

    if (
      !patient ||
      !result ||
      result.patient_id !== patient.id ||
      !["published", "sent", "viewed", "archived"].includes(result.status)
    ) {
      notFound();
    }

    const doctor = {
      professional_name: demoDoctor.professional_name,
      specialty: demoDoctor.specialty,
    };

    return (
      <div className="animate-page-enter space-y-6">
        <Link href="/dashboard/resultados" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-bios-navy transition">
          <ArrowLeft className="w-4 h-4" /> Volver a resultados
        </Link>

        <div className="bios-panel p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
            <div>
              <h1 className="font-outfit text-2xl font-black text-bios-navy">{result.title}</h1>
              <p className="text-sm text-gray-400 mt-1">{result.study_type}</p>
            </div>
            <StatusBadge status={result.status} className="text-sm py-1.5 px-3" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-black uppercase tracking-wider text-gray-400">Fecha del estudio</span>
              </div>
              <p className="font-bold text-bios-navy text-sm">{formatDate(result.result_date)}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <FlaskConical className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-black uppercase tracking-wider text-gray-400">Tipo de estudio</span>
              </div>
              <p className="font-bold text-bios-navy text-sm">{result.study_type}</p>
            </div>

            {result.lab_branch && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-gray-400">Sucursal</span>
                </div>
                <p className="font-bold text-bios-navy text-sm">{result.lab_branch}</p>
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-black uppercase tracking-wider text-gray-400">Médico</span>
              </div>
              <p className="font-bold text-bios-navy text-sm">{doctor.professional_name}</p>
              {doctor.specialty && <p className="text-xs text-gray-400">{doctor.specialty}</p>}
            </div>
          </div>

          {result.notes_for_patient && (
            <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-xs font-black uppercase tracking-wider text-bios-blue mb-1">Nota de tu médico</p>
              <p className="text-sm text-bios-ink leading-relaxed">{result.notes_for_patient}</p>
            </div>
          )}
        </div>

        <DemoResultDocument title={result.title} />
      </div>
    );
  }

  const supabase      = createClient();
  const adminSupabase = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verificar que el resultado pertenece al paciente autenticado
  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (!patient) notFound();

  const { data: result } = await supabase
    .from("medical_results")
    .select(`
      *,
      doctor:doctors(professional_name, specialty,
        profile:profiles(full_name)
      )
    `)
    .eq("id", params.id)
    .eq("patient_id", patient.id)
    .in("status", ["published", "sent", "viewed", "archived"])
    .single();

  if (!result) notFound();

  // Marcar como visto si no se había visto
  if (result.status === "published" || result.status === "sent") {
    await adminSupabase
      .from("medical_results")
      .update({ status: "viewed", viewed_at: new Date().toISOString() })
      .eq("id", result.id);

    await logAudit({
      actorProfileId: user.id,
      action: "result.view",
      entityType: "medical_result",
      entityId: result.id,
    });
  }

  // Generar signed URL si hay archivo (caduca en 1 hora)
  let signedUrl: string | null = null;
  if (result.file_path) {
    const { data: urlData } = await adminSupabase.storage
      .from("medical-results")
      .createSignedUrl(result.file_path, 3600);
    signedUrl = urlData?.signedUrl ?? null;
  }

  const doctor = result.doctor as unknown as {
    professional_name: string;
    specialty: string | null;
    profile: { full_name: string } | null;
  } | null;

  return (
    <div className="animate-page-enter space-y-6">
      {/* Breadcrumb */}
      <Link href="/dashboard/resultados" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-bios-navy transition">
        <ArrowLeft className="w-4 h-4" /> Volver a resultados
      </Link>

      {/* Header del resultado */}
      <div className="bios-panel p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
          <div>
            <h1 className="font-outfit text-2xl font-black text-bios-navy">{result.title}</h1>
            <p className="text-sm text-gray-400 mt-1">{result.study_type}</p>
          </div>
          <StatusBadge status={result.status} className="text-sm py-1.5 px-3" />
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-black uppercase tracking-wider text-gray-400">Fecha del estudio</span>
            </div>
            <p className="font-bold text-bios-navy text-sm">{formatDate(result.result_date)}</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <FlaskConical className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-black uppercase tracking-wider text-gray-400">Tipo de estudio</span>
            </div>
            <p className="font-bold text-bios-navy text-sm">{result.study_type}</p>
          </div>

          {result.lab_branch && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-black uppercase tracking-wider text-gray-400">Sucursal</span>
              </div>
              <p className="font-bold text-bios-navy text-sm">{result.lab_branch}</p>
            </div>
          )}

          {doctor && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-black uppercase tracking-wider text-gray-400">Médico</span>
              </div>
              <p className="font-bold text-bios-navy text-sm">{doctor.professional_name}</p>
              {doctor.specialty && <p className="text-xs text-gray-400">{doctor.specialty}</p>}
            </div>
          )}
        </div>

        {/* Notas para el paciente */}
        {result.notes_for_patient && (
          <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
            <p className="text-xs font-black uppercase tracking-wider text-bios-blue mb-1">Nota de tu médico</p>
            <p className="text-sm text-bios-ink leading-relaxed">{result.notes_for_patient}</p>
          </div>
        )}
      </div>

      {/* PDF Viewer */}
      {signedUrl ? (
        <div className="bios-panel overflow-hidden" style={{ height: "680px" }}>
          <PDFViewer
            signedUrl={signedUrl}
            title={result.title}
            resultId={result.id}
            className="h-full"
            onDownload={async () => {
              "use server";
              await logAudit({
                actorProfileId: user.id,
                action: "result.download",
                entityType: "medical_result",
                entityId: result.id,
              });
            }}
          />
        </div>
      ) : (
        <div className="bios-panel p-8 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
          </div>
          <h3 className="font-outfit font-black text-bios-navy mb-2">Archivo no disponible aún</h3>
          <p className="text-sm text-gray-500 max-w-xs">
            El resultado ha sido registrado pero el archivo PDF todavía no está cargado. Tu médico lo subirá en breve.
          </p>
        </div>
      )}
    </div>
  );
}
