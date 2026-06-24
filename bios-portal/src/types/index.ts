import type { Database } from "./database";

// ─── Aliases de tipos de DB ──────────────────────────────────────────────────
export type Profile   = Database["public"]["Tables"]["profiles"]["Row"];
export type Patient   = Database["public"]["Tables"]["patients"]["Row"];
export type Doctor    = Database["public"]["Tables"]["doctors"]["Row"];
export type MedicalResult = Database["public"]["Tables"]["medical_results"]["Row"];
export type ResultAccessLink = Database["public"]["Tables"]["result_access_links"]["Row"];
export type AuditLog  = Database["public"]["Tables"]["audit_logs"]["Row"];

export type UserRole = Profile["role"];
export type ResultStatus = MedicalResult["status"];

// ─── Tipos enriquecidos con JOINs ────────────────────────────────────────────
export type MedicalResultWithRelations = MedicalResult & {
  patient: Pick<Patient, "id" | "full_name" | "email" | "phone"> | null;
  doctor: (Pick<Doctor, "id" | "professional_name" | "specialty"> & {
    profile: Pick<Profile, "full_name" | "avatar_url"> | null;
  }) | null;
  access_links?: Pick<ResultAccessLink, "id" | "expires_at" | "revoked_at" | "access_count">[];
};

export type PatientWithProfile = Patient & {
  profile: Pick<Profile, "id" | "full_name" | "email" | "avatar_url"> | null;
};

// ─── Estados de resultados ───────────────────────────────────────────────────
export const RESULT_STATUS_LABELS: Record<ResultStatus, string> = {
  draft:     "Borrador",
  published: "Disponible",
  sent:      "Enviado",
  viewed:    "Visto",
  archived:  "Archivado",
};

export const RESULT_STATUS_COLORS: Record<ResultStatus, string> = {
  draft:     "bg-gray-100 text-gray-600",
  published: "bg-blue-100 text-blue-700",
  sent:      "bg-cyan-100 text-cyan-700",
  viewed:    "bg-green-100 text-green-700",
  archived:  "bg-amber-100 text-amber-700",
};

// ─── Tipos de estudio ────────────────────────────────────────────────────────
export const STUDY_TYPES = [
  "Análisis clínicos",
  "Imagenología",
  "Ultrasonido",
  "Electrocardiograma",
  "Espirometría",
  "Audiometría",
  "Tomografía",
  "Densitometría",
  "Mastografía",
  "Electroencefalograma",
  "Ecocardiograma",
  "Endoscopía / Colonoscopía",
  "Perfil hormonal",
  "Microbiología",
  "Otro",
] as const;

export type StudyType = (typeof STUDY_TYPES)[number];

// ─── Acciones de auditoría ───────────────────────────────────────────────────
export type AuditAction =
  | "result.upload"
  | "result.publish"
  | "result.view"
  | "result.download"
  | "result.print"
  | "link.create"
  | "link.access"
  | "link.revoke"
  | "admin.edit_permissions"
  | "auth.login"
  | "auth.logout"
  | "auth.register";

// ─── Server Action responses ─────────────────────────────────────────────────
export type ActionResult<T = undefined> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string };
