-- ============================================================
--  BIOS PORTAL — MIGRACIÓN 004: ENDURECIMIENTO DE SEGURIDAD
--  Cierra escalada de privilegios en signup, fija search_path,
--  y limita la superficie de funciones SECURITY DEFINER.
-- ============================================================

-- 1) Cerrar escalada de privilegios: el rol en signup SIEMPRE es 'patient'.
--    La elevación a doctor/admin solo ocurre server-side por un admin.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
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
    'patient'  -- nunca confiar en el rol enviado por el cliente
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 2) search_path inmutable en funciones que faltaban
ALTER FUNCTION public.handle_updated_at()      SET search_path = public, pg_temp;
ALTER FUNCTION public.link_patient_on_signup() SET search_path = public, pg_temp;

-- 3) Audit logs: se escriben SOLO con service_role (bypassa RLS).
--    No se necesita policy de INSERT abierta — se elimina la permisiva.
DROP POLICY IF EXISTS "audit_insert_any" ON public.audit_logs;

-- 4) Funciones de trigger: no deben ser invocables vía PostgREST RPC.
--    Los triggers las ejecutan como owner, así que revocar no las rompe.
REVOKE EXECUTE ON FUNCTION public.handle_new_user()        FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.link_patient_on_signup() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at()      FROM anon, authenticated, public;

-- 5) Helpers de RLS: revocar de anon (los flujos anónimos usan service_role).
--    authenticated SÍ las necesita para evaluar RLS — se mantiene explícito.
REVOKE EXECUTE ON FUNCTION public.current_user_role() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_admin()          FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_doctor()         FROM anon, public;
GRANT  EXECUTE ON FUNCTION public.current_user_role() TO authenticated;
GRANT  EXECUTE ON FUNCTION public.is_admin()          TO authenticated;
GRANT  EXECUTE ON FUNCTION public.is_doctor()         TO authenticated;
