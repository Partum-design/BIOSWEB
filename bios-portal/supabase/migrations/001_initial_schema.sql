-- ============================================================
--  BIOS PORTAL — MIGRACIÓN 001: ESQUEMA INICIAL
--  Laboratorios BIOS — Sistema de Portal Médico
-- ============================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ──────────────────────────────────────────────────────────
--  TABLA: profiles
--  Conectada 1:1 con auth.users. Se crea automáticamente al
--  registrarse un usuario via trigger.
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id             uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name      text        NOT NULL,
  email          text        NOT NULL,
  role           text        NOT NULL DEFAULT 'patient'
                             CHECK (role IN ('patient', 'doctor', 'admin')),
  avatar_url     text,
  phone          text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.profiles IS 'Perfil extendido de usuario, ligado a auth.users';
COMMENT ON COLUMN public.profiles.role IS 'patient | doctor | admin';

-- ──────────────────────────────────────────────────────────
--  TABLA: patients
--  Puede existir sin cuenta de usuario (profile_id nullable).
--  El médico puede crear pacientes que aún no se han registrado.
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.patients (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id     uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name      text        NOT NULL,
  email          text        NOT NULL,
  phone          text,
  date_of_birth  date,
  created_by     uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email)
);

COMMENT ON TABLE  public.patients IS 'Registro de pacientes (puede existir sin cuenta activa)';
COMMENT ON COLUMN public.patients.profile_id IS 'NULL cuando el paciente no tiene cuenta todavía';

-- ──────────────────────────────────────────────────────────
--  TABLA: doctors
--  Un doctor tiene perfil + datos profesionales.
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.doctors (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id        uuid        NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  professional_name text        NOT NULL,
  license_number    text,
  specialty         text,
  active            boolean     NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.doctors IS 'Datos profesionales del médico, extiende profiles';

-- ──────────────────────────────────────────────────────────
--  TABLA: medical_results
--  Resultado médico asociado a un paciente y un médico.
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.medical_results (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id          uuid        NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id           uuid        NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
  title               text        NOT NULL,
  study_type          text        NOT NULL DEFAULT 'general',
  result_date         date        NOT NULL DEFAULT CURRENT_DATE,
  status              text        NOT NULL DEFAULT 'draft'
                                  CHECK (status IN ('draft','published','sent','viewed','archived')),
  file_path           text,
  lab_branch          text,
  notes_for_patient   text,
  internal_notes      text,
  created_by          uuid        NOT NULL REFERENCES public.profiles(id),
  published_at        timestamptz,
  viewed_at           timestamptz,
  downloaded_at       timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.medical_results IS 'Resultados médicos. file_path apunta a storage bucket privado';
COMMENT ON COLUMN public.medical_results.file_path IS 'Ruta en bucket medical-results, ej: {patientId}/{resultId}/resultado.pdf';
COMMENT ON COLUMN public.medical_results.status IS 'draft→published→sent→viewed→archived';

-- ──────────────────────────────────────────────────────────
--  TABLA: result_access_links
--  Links seguros para pacientes sin cuenta.
--  Se guarda el HASH del token, no el token en claro.
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.result_access_links (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id         uuid        NOT NULL REFERENCES public.medical_results(id) ON DELETE CASCADE,
  token_hash        text        NOT NULL UNIQUE,
  expires_at        timestamptz,
  revoked_at        timestamptz,
  last_accessed_at  timestamptz,
  access_count      integer     NOT NULL DEFAULT 0,
  created_by        uuid        NOT NULL REFERENCES public.profiles(id),
  created_at        timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.result_access_links IS 'Links de acceso por token para pacientes sin cuenta';
COMMENT ON COLUMN public.result_access_links.token_hash IS 'SHA-256 del token — el token en claro va solo en la URL';

-- ──────────────────────────────────────────────────────────
--  TABLA: audit_logs
--  Registro inmutable de acciones sensibles.
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_profile_id uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  action           text        NOT NULL,
  entity_type      text        NOT NULL,
  entity_id        uuid,
  ip_address       text,
  user_agent       text,
  metadata         jsonb,
  created_at       timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.audit_logs IS 'Log de auditoría para acciones sensibles del sistema';

-- ──────────────────────────────────────────────────────────
--  ÍNDICES
-- ──────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_patients_email       ON public.patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_profile_id  ON public.patients(profile_id);
CREATE INDEX IF NOT EXISTS idx_doctors_profile_id   ON public.doctors(profile_id);
CREATE INDEX IF NOT EXISTS idx_results_patient_id   ON public.medical_results(patient_id);
CREATE INDEX IF NOT EXISTS idx_results_doctor_id    ON public.medical_results(doctor_id);
CREATE INDEX IF NOT EXISTS idx_results_status       ON public.medical_results(status);
CREATE INDEX IF NOT EXISTS idx_links_token_hash     ON public.result_access_links(token_hash);
CREATE INDEX IF NOT EXISTS idx_links_result_id      ON public.result_access_links(result_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor          ON public.audit_logs(actor_profile_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at     ON public.audit_logs(created_at DESC);

-- ──────────────────────────────────────────────────────────
--  TRIGGER: updated_at automático
-- ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER results_updated_at
  BEFORE UPDATE ON public.medical_results
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ──────────────────────────────────────────────────────────
--  TRIGGER: crear perfil automáticamente al registrarse
-- ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ──────────────────────────────────────────────────────────
--  TRIGGER: vincular paciente sin cuenta al registrarse
--  Si el email del nuevo perfil coincide con un paciente
--  existente sin cuenta, lo vincula automáticamente.
-- ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.link_patient_on_signup()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.patients
  SET profile_id = NEW.id,
      updated_at = now()
  WHERE email = NEW.email
    AND profile_id IS NULL;
  RETURN NEW;
END;
$$;

CREATE TRIGGER link_patient_after_profile
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.link_patient_on_signup();
