-- ============================================================
--  BIOS PORTAL — MIGRACIÓN 003: STORAGE POLICIES
--  Bucket privado para PDFs de resultados médicos.
--  Los archivos NUNCA son públicos.
-- ============================================================

-- Crear el bucket privado para resultados médicos
-- (ejecutar manualmente o via Supabase CLI)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'medical-results',
  'medical-results',
  false,        -- PRIVADO — sin acceso público
  10485760,     -- 10 MB máximo por archivo
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ──────────────────────────────────────────────────────────
--  STORAGE: médico sube resultados
--  Ruta esperada: {patientId}/{resultId}/resultado.pdf
-- ──────────────────────────────────────────────────────────
CREATE POLICY "storage_upload_doctor"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'medical-results'
    AND (
      SELECT role FROM public.profiles WHERE id = auth.uid()
    ) IN ('doctor', 'admin')
  );

-- ──────────────────────────────────────────────────────────
--  STORAGE: médico y admin pueden leer archivos
-- ──────────────────────────────────────────────────────────
CREATE POLICY "storage_select_doctor_or_admin"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'medical-results'
    AND (
      SELECT role FROM public.profiles WHERE id = auth.uid()
    ) IN ('doctor', 'admin')
  );

-- ──────────────────────────────────────────────────────────
--  STORAGE: paciente autenticado accede a SUS archivos
--  Verificando que el resultado le pertenece y está publicado
-- ──────────────────────────────────────────────────────────
CREATE POLICY "storage_select_patient_own"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'medical-results'
    AND EXISTS (
      SELECT 1
      FROM public.medical_results mr
      JOIN public.patients p ON p.id = mr.patient_id
      WHERE p.profile_id = auth.uid()
        AND mr.file_path = storage.objects.name
        AND mr.status IN ('published', 'sent', 'viewed', 'archived')
    )
  );

-- ──────────────────────────────────────────────────────────
--  STORAGE: médico/admin puede borrar archivos que subió
-- ──────────────────────────────────────────────────────────
CREATE POLICY "storage_delete_doctor_or_admin"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'medical-results'
    AND (
      SELECT role FROM public.profiles WHERE id = auth.uid()
    ) IN ('doctor', 'admin')
  );

-- ──────────────────────────────────────────────────────────
--  NOTA IMPORTANTE:
--  Los links de consulta pública (/consulta/[token]) NO
--  acceden al storage directamente. El server genera un
--  signed URL temporal via service_role y lo devuelve.
--  Esto garantiza que los PDFs nunca sean accesibles
--  de forma permanente ni desde el cliente.
-- ──────────────────────────────────────────────────────────
