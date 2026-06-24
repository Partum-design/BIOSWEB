import { createClient, createAdminClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const adminClient = createAdminClient();

  // Verificar que el resultado pertenece al paciente o que el usuario es médico/admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const { data: result } = await adminClient
    .from("medical_results")
    .select("id, file_path, patient_id, status, created_by")
    .eq("id", params.id)
    .single();

  if (!result || !result.file_path) {
    return NextResponse.json({ error: "Resultado no encontrado." }, { status: 404 });
  }

  const role = profile?.role ?? "patient";

  // Verificar acceso según rol
  if (role === "patient") {
    // Paciente debe ser dueño del resultado y el resultado debe estar publicado/enviado/visto/archivado
    const { data: patient } = await supabase
      .from("patients")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    const allowedStatuses = ["published", "sent", "viewed", "archived"];
    if (
      !patient ||
      result.patient_id !== patient.id ||
      !allowedStatuses.includes(result.status)
    ) {
      return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
    }
  } else if (role === "doctor") {
    // Médico debe ser el creador del resultado
    if (result.created_by !== user.id) {
      return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
    }
  }
  // admin tiene acceso a todo

  // Generar signed URL (1 hora)
  const { data: signed, error } = await adminClient.storage
    .from("medical-results")
    .createSignedUrl(result.file_path, 3600);

  if (error || !signed) {
    return NextResponse.json({ error: "No fue posible generar el link." }, { status: 500 });
  }

  // Log solo para pacientes (descarga)
  if (role === "patient") {
    await logAudit({
      actorProfileId: user.id,
      action: "result.download",
      entityType: "medical_result",
      entityId: result.id,
    });
  }

  return NextResponse.json({ url: signed.signedUrl });
}
