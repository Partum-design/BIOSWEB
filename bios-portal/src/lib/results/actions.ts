"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { generateSecureToken, hashToken, getLinkExpiryDate, getResultStoragePath } from "@/lib/utils";
import type { ActionResult } from "@/types";
import { redirect } from "next/navigation";

// ─── Buscar o crear paciente ──────────────────────────────────────────────────
export async function findOrCreatePatient(formData: FormData): Promise<ActionResult<{ id: string; isNew: boolean }>> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado." };

  const email    = (formData.get("email") as string)?.toLowerCase().trim();
  const fullName = (formData.get("fullName") as string)?.trim();
  const phone    = (formData.get("phone") as string)?.trim() || null;

  if (!email || !fullName) {
    return { success: false, error: "Nombre y correo son requeridos." };
  }

  // Buscar primero por email
  const { data: existing } = await supabase
    .from("patients")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) {
    return { success: true, data: { id: existing.id, isNew: false } };
  }

  // Crear nuevo paciente sin cuenta
  const adminClient = createAdminClient();
  const { data: newPatient, error } = await adminClient
    .from("patients")
    .insert({ full_name: fullName, email, phone, created_by: user.id })
    .select("id")
    .single();

  if (error || !newPatient) {
    return { success: false, error: "No fue posible crear el registro del paciente." };
  }

  return { success: true, data: { id: newPatient.id, isNew: true } };
}

// ─── Subir resultado médico completo ────────────────────────────────────────
export async function uploadResult(formData: FormData): Promise<ActionResult<{ resultId: string; accessToken?: string }>> {
  const supabase      = createClient();
  const adminClient   = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado." };

  // Verificar que es médico
  const { data: doctor } = await supabase
    .from("doctors")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (!doctor) return { success: false, error: "No tienes perfil de médico activo." };

  // Datos del formulario
  const patientId       = formData.get("patientId") as string;
  const title           = (formData.get("title") as string)?.trim();
  const studyType       = (formData.get("studyType") as string)?.trim();
  const resultDate      = formData.get("resultDate") as string;
  const labBranch       = (formData.get("labBranch") as string)?.trim() || null;
  const notesForPatient = (formData.get("notesForPatient") as string)?.trim() || null;
  const internalNotes   = (formData.get("internalNotes") as string)?.trim() || null;
  const publishNow      = formData.get("publishNow") === "true";
  const file            = formData.get("file") as File | null;
  const generateLink    = formData.get("generateLink") === "true";

  // Validaciones
  if (!patientId || !title || !studyType || !resultDate) {
    return { success: false, error: "Paciente, título, tipo de estudio y fecha son requeridos." };
  }

  // Validar archivo
  if (file && file.size > 0) {
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: "El archivo no puede superar 10 MB." };
    }
    const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return { success: false, error: "Solo se aceptan archivos PDF, JPG o PNG." };
    }
  }

  // Crear registro del resultado
  const { data: result, error: resultError } = await adminClient
    .from("medical_results")
    .insert({
      patient_id:         patientId,
      doctor_id:          doctor.id,
      title,
      study_type:         studyType,
      result_date:        resultDate,
      lab_branch:         labBranch,
      notes_for_patient:  notesForPatient,
      internal_notes:     internalNotes,
      status:             publishNow ? "published" : "draft",
      created_by:         user.id,
      published_at:       publishNow ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (resultError || !result) {
    return { success: false, error: "No fue posible guardar el resultado. Intenta de nuevo." };
  }

  // Subir archivo si hay
  let filePath: string | null = null;
  if (file && file.size > 0) {
    const ext      = file.type === "application/pdf" ? "pdf" : file.type.split("/")[1];
    const filename = `resultado.${ext}`;
    filePath = getResultStoragePath(patientId, result.id, filename);

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await adminClient.storage
      .from("medical-results")
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      // Revertir el resultado si el upload falla
      await adminClient.from("medical_results").delete().eq("id", result.id);
      return { success: false, error: "Error al subir el archivo. Intenta de nuevo." };
    }

    // Actualizar file_path en el resultado
    await adminClient
      .from("medical_results")
      .update({ file_path: filePath })
      .eq("id", result.id);
  }

  // Log de auditoría
  await logAudit({
    actorProfileId: user.id,
    action: "result.upload",
    entityType: "medical_result",
    entityId: result.id,
    metadata: { patientId, title, publishNow },
  });

  if (publishNow) {
    await logAudit({
      actorProfileId: user.id,
      action: "result.publish",
      entityType: "medical_result",
      entityId: result.id,
    });
  }

  // Generar link de acceso si se solicitó
  let accessToken: string | undefined;
  if (generateLink) {
    const tokenResult = await createAccessLink(result.id, user.id);
    if (tokenResult.success) {
      accessToken = tokenResult.data.token;
    }
  }

  return { success: true, data: { resultId: result.id, accessToken } };
}

// ─── Generar link de acceso seguro ───────────────────────────────────────────
export async function createAccessLink(
  resultId: string,
  createdBy: string
): Promise<ActionResult<{ token: string; url: string }>> {
  const adminClient = createAdminClient();

  const token     = generateSecureToken();
  const tokenHash = hashToken(token);
  const expiresAt = getLinkExpiryDate(
    parseInt(process.env.RESULT_LINK_EXPIRY_SECONDS ?? "2592000", 10)
  ).toISOString();

  const { error } = await adminClient
    .from("result_access_links")
    .insert({
      result_id:   resultId,
      token_hash:  tokenHash,
      expires_at:  expiresAt,
      created_by:  createdBy,
    });

  if (error) {
    return { success: false, error: "No fue posible generar el link de consulta." };
  }

  await logAudit({
    actorProfileId: createdBy,
    action: "link.create",
    entityType: "result_access_link",
    entityId: resultId,
  });

  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/consulta/${token}`;
  return { success: true, data: { token, url } };
}

// ─── Revocar link ─────────────────────────────────────────────────────────────
export async function revokeAccessLink(linkId: string): Promise<ActionResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado." };

  const { error } = await supabase
    .from("result_access_links")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", linkId)
    .eq("created_by", user.id);

  if (error) return { success: false, error: "No se pudo revocar el link." };

  await logAudit({
    actorProfileId: user.id,
    action: "link.revoke",
    entityType: "result_access_link",
    entityId: linkId,
  });

  return { success: true, data: undefined };
}

// ─── Publicar resultado (de borrador a publicado) ─────────────────────────────
export async function publishResult(resultId: string): Promise<ActionResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado." };

  const { error } = await supabase
    .from("medical_results")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", resultId)
    .eq("created_by", user.id);

  if (error) return { success: false, error: "No se pudo publicar el resultado." };

  await logAudit({
    actorProfileId: user.id,
    action: "result.publish",
    entityType: "medical_result",
    entityId: resultId,
  });

  redirect("/medico/resultados");
}
