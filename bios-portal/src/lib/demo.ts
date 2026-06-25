import type { AuditLog, Doctor, MedicalResult, Patient, Profile } from "@/types";

export const isDemoMode =
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" || process.env.DEMO_MODE === "true";

export const DEMO_SESSION_COOKIE = "bios_demo_role";
export const DEMO_PUBLIC_TOKEN = "demo-resultado-bios-2026";

export type DemoRole = Profile["role"];

export const demoLoginAccounts: {
  role: DemoRole;
  label: string;
  email: string;
  password: string;
  description: string;
}[] = [
  {
    role: "patient",
    label: "Paciente",
    email: "paciente@bios.demo",
    password: "Demo1234",
    description: "Vista del cliente con resultados disponibles.",
  },
  {
    role: "doctor",
    label: "Médico",
    email: "medico@bios.demo",
    password: "Demo1234",
    description: "Carga de resultados, pacientes y links de consulta.",
  },
  {
    role: "admin",
    label: "Admin",
    email: "admin@bios.demo",
    password: "Demo1234",
    description: "Panel general, métricas y auditoría.",
  },
];

export const demoProfiles: Record<DemoRole, Profile> = {
  patient: {
    id: "demo-profile-patient",
    full_name: "María Fernández López",
    email: "paciente@bios.demo",
    role: "patient",
    avatar_url: null,
    phone: "55 1200 3344",
    created_at: "2026-05-02T15:30:00.000Z",
    updated_at: "2026-06-20T12:00:00.000Z",
  },
  doctor: {
    id: "demo-profile-doctor",
    full_name: "Dra. Valeria Torres",
    email: "medico@bios.demo",
    role: "doctor",
    avatar_url: null,
    phone: "55 8899 1122",
    created_at: "2026-04-18T14:20:00.000Z",
    updated_at: "2026-06-19T18:15:00.000Z",
  },
  admin: {
    id: "demo-profile-admin",
    full_name: "Alejandro Ríos",
    email: "admin@bios.demo",
    role: "admin",
    avatar_url: null,
    phone: "55 7788 9900",
    created_at: "2026-04-01T10:00:00.000Z",
    updated_at: "2026-06-21T10:00:00.000Z",
  },
};

export const demoDoctor: Doctor = {
  id: "demo-doctor-1",
  profile_id: demoProfiles.doctor.id,
  professional_name: "Dra. Valeria Torres",
  license_number: "CED-4455667",
  specialty: "Medicina interna",
  active: true,
  created_at: "2026-04-18T14:20:00.000Z",
  updated_at: "2026-06-19T18:15:00.000Z",
};

export const demoPatients: Patient[] = [
  {
    id: "demo-patient-1",
    profile_id: demoProfiles.patient.id,
    full_name: demoProfiles.patient.full_name,
    email: demoProfiles.patient.email,
    phone: demoProfiles.patient.phone,
    date_of_birth: "1991-08-14",
    created_by: demoProfiles.doctor.id,
    created_at: "2026-05-02T15:30:00.000Z",
    updated_at: "2026-06-20T12:00:00.000Z",
  },
  {
    id: "demo-patient-2",
    profile_id: null,
    full_name: "Carlos Méndez Ruiz",
    email: "carlos.mendez@example.com",
    phone: "55 3344 2211",
    date_of_birth: "1984-03-09",
    created_by: demoProfiles.doctor.id,
    created_at: "2026-06-15T09:15:00.000Z",
    updated_at: "2026-06-22T09:15:00.000Z",
  },
  {
    id: "demo-patient-3",
    profile_id: null,
    full_name: "Lucía Navarro Peña",
    email: "lucia.navarro@example.com",
    phone: "55 9900 1188",
    date_of_birth: "1978-11-22",
    created_by: demoProfiles.doctor.id,
    created_at: "2026-06-10T17:40:00.000Z",
    updated_at: "2026-06-20T17:40:00.000Z",
  },
];

export const demoResults: MedicalResult[] = [
  {
    id: "demo-result-bh",
    patient_id: "demo-patient-1",
    doctor_id: demoDoctor.id,
    title: "Biometría Hemática Completa",
    study_type: "Análisis clínicos",
    result_date: "2026-06-21",
    status: "published",
    file_path: "demo/biometria-hematica.pdf",
    lab_branch: "Sucursal Centro",
    notes_for_patient: "Tus resultados están dentro de rangos esperados. Mantén hidratación y seguimiento anual.",
    internal_notes: "Demo: resultado publicado para paciente.",
    created_by: demoProfiles.doctor.id,
    published_at: "2026-06-21T16:30:00.000Z",
    viewed_at: null,
    downloaded_at: null,
    created_at: "2026-06-21T16:30:00.000Z",
    updated_at: "2026-06-21T16:30:00.000Z",
  },
  {
    id: "demo-result-tiroides",
    patient_id: "demo-patient-1",
    doctor_id: demoDoctor.id,
    title: "Perfil tiroideo T3, T4 y TSH",
    study_type: "Perfil hormonal",
    result_date: "2026-06-18",
    status: "viewed",
    file_path: "demo/perfil-tiroideo.pdf",
    lab_branch: "Sucursal Satélite",
    notes_for_patient: "Revisar en consulta para correlacionar con síntomas recientes.",
    internal_notes: "Demo: resultado visto.",
    created_by: demoProfiles.doctor.id,
    published_at: "2026-06-18T13:10:00.000Z",
    viewed_at: "2026-06-19T08:45:00.000Z",
    downloaded_at: null,
    created_at: "2026-06-18T13:10:00.000Z",
    updated_at: "2026-06-19T08:45:00.000Z",
  },
  {
    id: "demo-result-ultra",
    patient_id: "demo-patient-1",
    doctor_id: demoDoctor.id,
    title: "Ultrasonido abdominal",
    study_type: "Ultrasonido",
    result_date: "2026-06-10",
    status: "sent",
    file_path: "demo/ultrasonido-abdominal.pdf",
    lab_branch: "Sucursal Tultepec",
    notes_for_patient: "El informe ya fue enviado a tu correo para revisión con tu médico.",
    internal_notes: "Demo: link público enviado.",
    created_by: demoProfiles.doctor.id,
    published_at: "2026-06-10T18:05:00.000Z",
    viewed_at: null,
    downloaded_at: null,
    created_at: "2026-06-10T18:05:00.000Z",
    updated_at: "2026-06-10T18:05:00.000Z",
  },
  {
    id: "demo-result-quimica",
    patient_id: "demo-patient-2",
    doctor_id: demoDoctor.id,
    title: "Química sanguínea 6 elementos",
    study_type: "Análisis clínicos",
    result_date: "2026-06-23",
    status: "draft",
    file_path: null,
    lab_branch: "Sucursal Centro",
    notes_for_patient: null,
    internal_notes: "Pendiente de validación final.",
    created_by: demoProfiles.doctor.id,
    published_at: null,
    viewed_at: null,
    downloaded_at: null,
    created_at: "2026-06-23T12:20:00.000Z",
    updated_at: "2026-06-23T12:20:00.000Z",
  },
  {
    id: "demo-result-ecg",
    patient_id: "demo-patient-2",
    doctor_id: demoDoctor.id,
    title: "Electrocardiograma en reposo",
    study_type: "Electrocardiograma",
    result_date: "2026-06-16",
    status: "published",
    file_path: "demo/electrocardiograma.pdf",
    lab_branch: "Sucursal Centro",
    notes_for_patient: "Sin datos de alarma en el reporte de muestra.",
    internal_notes: null,
    created_by: demoProfiles.doctor.id,
    published_at: "2026-06-16T11:35:00.000Z",
    viewed_at: null,
    downloaded_at: null,
    created_at: "2026-06-16T11:35:00.000Z",
    updated_at: "2026-06-16T11:35:00.000Z",
  },
  {
    id: "demo-result-masto",
    patient_id: "demo-patient-3",
    doctor_id: demoDoctor.id,
    title: "Mastografía bilateral",
    study_type: "Mastografía",
    result_date: "2026-06-12",
    status: "archived",
    file_path: "demo/mastografia.pdf",
    lab_branch: "Sucursal Norte",
    notes_for_patient: "Resultado archivado en historial.",
    internal_notes: null,
    created_by: demoProfiles.doctor.id,
    published_at: "2026-06-12T15:00:00.000Z",
    viewed_at: "2026-06-13T10:30:00.000Z",
    downloaded_at: "2026-06-13T10:45:00.000Z",
    created_at: "2026-06-12T15:00:00.000Z",
    updated_at: "2026-06-13T10:45:00.000Z",
  },
  {
    id: "demo-result-hormonal",
    patient_id: "demo-patient-3",
    doctor_id: demoDoctor.id,
    title: "Perfil hormonal femenino",
    study_type: "Perfil hormonal",
    result_date: "2026-06-20",
    status: "sent",
    file_path: "demo/perfil-hormonal.pdf",
    lab_branch: "Sucursal Norte",
    notes_for_patient: "Comparte este resultado con ginecología en tu próxima cita.",
    internal_notes: null,
    created_by: demoProfiles.doctor.id,
    published_at: "2026-06-20T17:00:00.000Z",
    viewed_at: null,
    downloaded_at: null,
    created_at: "2026-06-20T17:00:00.000Z",
    updated_at: "2026-06-20T17:00:00.000Z",
  },
];

export const demoAuditLogs: AuditLog[] = [
  {
    id: "demo-audit-1",
    actor_profile_id: demoProfiles.doctor.id,
    action: "result.upload",
    entity_type: "medical_result",
    entity_id: "demo-result-quimica",
    ip_address: "127.0.0.1",
    user_agent: "Demo browser",
    metadata: null,
    created_at: "2026-06-23T12:20:00.000Z",
  },
  {
    id: "demo-audit-2",
    actor_profile_id: demoProfiles.doctor.id,
    action: "link.create",
    entity_type: "result_access_link",
    entity_id: "demo-result-ultra",
    ip_address: "127.0.0.1",
    user_agent: "Demo browser",
    metadata: null,
    created_at: "2026-06-21T13:10:00.000Z",
  },
  {
    id: "demo-audit-3",
    actor_profile_id: demoProfiles.patient.id,
    action: "result.view",
    entity_type: "medical_result",
    entity_id: "demo-result-tiroides",
    ip_address: "127.0.0.1",
    user_agent: "Demo browser",
    metadata: null,
    created_at: "2026-06-19T08:45:00.000Z",
  },
  {
    id: "demo-audit-4",
    actor_profile_id: null,
    action: "link.access",
    entity_type: "result_access_link",
    entity_id: "demo-public-link",
    ip_address: "127.0.0.1",
    user_agent: "Demo browser",
    metadata: null,
    created_at: "2026-06-18T19:25:00.000Z",
  },
];

export function isDemoRole(value: string | undefined | null): value is DemoRole {
  return value === "patient" || value === "doctor" || value === "admin";
}

export function getDemoHomePath(role: DemoRole) {
  if (role === "doctor") return "/medico";
  if (role === "admin") return "/admin";
  return "/dashboard";
}

export function getDemoProfile(role: DemoRole) {
  return demoProfiles[role];
}

export function getDemoProfileById(id: string) {
  return Object.values(demoProfiles).find((profile) => profile.id === id) ?? null;
}

export function getDemoRoleFromCookie(value: string | undefined | null) {
  return isDemoRole(value) ? value : null;
}

export function findDemoAccount(email: string, password: string) {
  const normalizedEmail = email.toLowerCase().trim();
  return (
    demoLoginAccounts.find(
      (account) =>
        account.email === normalizedEmail && account.password === password
    ) ?? null
  );
}

export function getDemoPatientByProfileId(profileId: string) {
  return demoPatients.find((patient) => patient.profile_id === profileId) ?? null;
}

export function getDemoPatientById(patientId: string) {
  return demoPatients.find((patient) => patient.id === patientId) ?? null;
}

export function getDemoDoctorByProfileId(profileId: string) {
  return demoDoctor.profile_id === profileId ? demoDoctor : null;
}

export function getDemoVisibleResultsForPatient(patientId: string) {
  return demoResults
    .filter(
      (result) =>
        result.patient_id === patientId &&
        ["published", "sent", "viewed", "archived"].includes(result.status)
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getDemoResultsForDoctor(doctorId: string) {
  return demoResults
    .filter((result) => result.doctor_id === doctorId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getDemoResultById(id: string) {
  return demoResults.find((result) => result.id === id) ?? null;
}
