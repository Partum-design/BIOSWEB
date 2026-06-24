-- ============================================================
--  BIOS PORTAL — MIGRACIÓN 002: ROW LEVEL SECURITY (RLS)
--  Principio: mínimo privilegio. Cada rol ve solo lo suyo.
-- ============================================================

-- Habilitar RLS en todas las tablas sensibles
ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_results    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.result_access_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs         ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────────────────
--  HELPER: obtener rol del usuario actual
--  SECURITY DEFINER para que no haya recursión en RLS
-- ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.is_doctor()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('doctor', 'admin'));
$$;

-- ──────────────────────────────────────────────────────────
--  PROFILES
-- ──────────────────────────────────────────────────────────
-- Cada usuario ve y edita solo su propio perfil
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- El trigger crea el perfil con service_role; no se necesita INSERT policy pública
CREATE POLICY "profiles_insert_service"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ──────────────────────────────────────────────────────────
--  PATIENTS
-- ──────────────────────────────────────────────────────────
-- Paciente autenticado ve solo su propio registro
CREATE POLICY "patients_select_own"
  ON public.patients FOR SELECT
  USING (
    profile_id = auth.uid()
    OR public.is_admin()
    -- Médico ve los pacientes que creó o a quienes les subió resultados
    OR (
      public.is_doctor()
      AND (
        created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.medical_results mr
          JOIN public.doctors d ON d.id = mr.doctor_id
          WHERE d.profile_id = auth.uid()
            AND mr.patient_id = patients.id
        )
      )
    )
  );

CREATE POLICY "patients_insert_doctor"
  ON public.patients FOR INSERT
  WITH CHECK (public.is_doctor());

CREATE POLICY "patients_update_doctor_or_admin"
  ON public.patients FOR UPDATE
  USING (created_by = auth.uid() OR public.is_admin())
  WITH CHECK (created_by = auth.uid() OR public.is_admin());

-- ──────────────────────────────────────────────────────────
--  DOCTORS
-- ──────────────────────────────────────────────────────────
-- Cualquier usuario autenticado puede ver lista básica de médicos activos
CREATE POLICY "doctors_select_active"
  ON public.doctors FOR SELECT
  USING (active = true OR profile_id = auth.uid() OR public.is_admin());

CREATE POLICY "doctors_insert_admin"
  ON public.doctors FOR INSERT
  WITH CHECK (public.is_admin() OR profile_id = auth.uid());

CREATE POLICY "doctors_update_own_or_admin"
  ON public.doctors FOR UPDATE
  USING (profile_id = auth.uid() OR public.is_admin())
  WITH CHECK (profile_id = auth.uid() OR public.is_admin());

-- ──────────────────────────────────────────────────────────
--  MEDICAL RESULTS
-- ──────────────────────────────────────────────────────────
-- Paciente autenticado ve sus propios resultados (solo los publicados/enviados)
CREATE POLICY "results_select_patient"
  ON public.medical_results FOR SELECT
  USING (
    -- El paciente autenticado ve sus propios resultados publicados
    (
      patient_id IN (
        SELECT id FROM public.patients WHERE profile_id = auth.uid()
      )
      AND status IN ('published', 'sent', 'viewed', 'archived')
    )
    -- El médico que los creó los ve todos
    OR created_by = auth.uid()
    OR (
      public.is_doctor()
      AND doctor_id IN (SELECT id FROM public.doctors WHERE profile_id = auth.uid())
    )
    -- Admin ve todo
    OR public.is_admin()
  );

CREATE POLICY "results_insert_doctor"
  ON public.medical_results FOR INSERT
  WITH CHECK (
    public.is_doctor()
    AND created_by = auth.uid()
  );

CREATE POLICY "results_update_creator_or_admin"
  ON public.medical_results FOR UPDATE
  USING (created_by = auth.uid() OR public.is_admin())
  WITH CHECK (created_by = auth.uid() OR public.is_admin());

CREATE POLICY "results_delete_admin"
  ON public.medical_results FOR DELETE
  USING (public.is_admin());

-- ──────────────────────────────────────────────────────────
--  RESULT ACCESS LINKS
-- ──────────────────────────────────────────────────────────
-- Solo el médico que creó el link y admin pueden verlo
CREATE POLICY "links_select_creator_or_admin"
  ON public.result_access_links FOR SELECT
  USING (created_by = auth.uid() OR public.is_admin());

CREATE POLICY "links_insert_doctor"
  ON public.result_access_links FOR INSERT
  WITH CHECK (public.is_doctor() AND created_by = auth.uid());

-- Permitir revocar (update revoked_at) y actualizar accesos
CREATE POLICY "links_update_creator_or_admin"
  ON public.result_access_links FOR UPDATE
  USING (created_by = auth.uid() OR public.is_admin());

-- ──────────────────────────────────────────────────────────
--  AUDIT LOGS
--  Inserción abierta para service_role / server-side.
--  Lectura solo para admins.
--  NUNCA se borran (no DELETE policy).
-- ──────────────────────────────────────────────────────────
CREATE POLICY "audit_insert_any"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true); -- El control de abuso está en el server-side

CREATE POLICY "audit_select_admin"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());
