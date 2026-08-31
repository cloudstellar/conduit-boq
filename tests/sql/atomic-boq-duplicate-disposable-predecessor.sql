\set ON_ERROR_STOP on

-- Disposable PG17 rehearsal support only. This is not a migration and must
-- never be run against Production. It fills the two exact post-028 objects and
-- private-schema ACL omitted by the repository's schema-only smoke baseline;
-- it does not apply or replay migration 027 or 028.
DO $disposable_database_only$
BEGIN
  IF current_database() !~ '^conduit_boq_atomic_copy_smoke_[a-z0-9_]+$' THEN
    RAISE EXCEPTION
      'Atomic duplicate predecessor stubs require an explicitly named disposable database';
  END IF;
END;
$disposable_database_only$;

GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.p49_current_profile_active()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles p
    WHERE p.id = (SELECT auth.uid())
      AND p.role IN ('admin', 'dept_manager', 'sector_manager', 'staff', 'procurement')
      AND p.status = 'active'
  );
$function$;

ALTER FUNCTION private.p49_current_profile_active() OWNER TO postgres;
REVOKE EXECUTE ON FUNCTION private.p49_current_profile_active()
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.p49_current_profile_active() TO authenticated;

CREATE POLICY p49_boq_current_active
ON public.boq AS RESTRICTIVE
FOR ALL TO authenticated
USING ((SELECT private.p49_current_profile_active()))
WITH CHECK ((SELECT private.p49_current_profile_active()));

-- Migration 029 only requires this immutable-028 projection to exist; it never
-- calls it. The bounded stub keeps the disposable baseline side-effect free.
CREATE FUNCTION public.get_my_catalog_admin_gate()
RETURNS TABLE (
  admin_enabled boolean,
  configuration_valid boolean
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $function$
  SELECT false, true;
$function$;

ALTER FUNCTION public.get_my_catalog_admin_gate() OWNER TO postgres;
REVOKE EXECUTE ON FUNCTION public.get_my_catalog_admin_gate()
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_my_catalog_admin_gate() TO authenticated;
