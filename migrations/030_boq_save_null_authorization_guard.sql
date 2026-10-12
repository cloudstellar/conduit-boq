-- =============================================================================
-- Migration 030: Fail closed on NULL BOQ Save authorization
-- =============================================================================
-- New forward migration; migrations 027/028/029 remain immutable/no-replay.
-- The read-only Production receipt captured on 2026-09-08 at 01:48:01 UTC
-- identified the exact predecessor definition below. Nullable ownership/scope
-- comparisons can produce NULL, which the previous IF NOT guard did not reject.
--
-- Change only that final authorization guard. Preserve the existing account
-- checks, lock order/timeouts, business calculations, function identity and ACL.
-- No application function is called and no business rows or migration ledger
-- are read or changed by this file. Unknown predecessors and replay fail closed.
-- Local implementation/testing approval is not Production execution approval.
-- =============================================================================

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
SET LOCAL idle_in_transaction_session_timeout = '90s';

SELECT pg_catalog.pg_advisory_xact_lock(
  pg_catalog.hashtextextended('conduit-boq:save-null-authorization-030', 0)
);

DO $boq_save_null_authorization_guard$
DECLARE
  c_signature constant text := 'public.save_boq_with_routes(uuid,jsonb,jsonb)';
  c_pre_sha256 constant text := 'aefe5097626539b83f02d418cbc6fe1ca4d2ad195e927d987f174c5e7701c9e9';
  c_post_sha256 constant text := '929466b05250a96e3c5ff20c90d99d7d0da415b8cd021a19c1069396c8c06506';
  c_old_guard constant text := 'IF NOT v_is_authorized THEN';
  c_new_guard constant text := 'IF v_is_authorized IS NOT TRUE THEN';
  v_before pg_catalog.pg_proc%ROWTYPE;
  v_after pg_catalog.pg_proc%ROWTYPE;
  v_acl text[];
  v_definition text;
  v_patched_definition text;
  v_sha256 text;
  v_guard_count integer;
BEGIN
  IF session_user <> 'postgres' OR current_user <> 'postgres' THEN
    RAISE EXCEPTION 'Migration 030 blocked: session/current user must be postgres';
  END IF;

  SELECT function_row.* INTO v_before
  FROM pg_catalog.pg_proc function_row
  WHERE function_row.oid = pg_catalog.to_regprocedure(c_signature);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Migration 030 blocked: exact BOQ Save signature is missing';
  END IF;

  IF pg_catalog.pg_get_userbyid(v_before.proowner) IS DISTINCT FROM 'postgres'
     OR v_before.prosecdef IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Migration 030 blocked: BOQ Save owner/security posture drifted';
  END IF;

  SELECT pg_catalog.array_agg(acl_entry::text ORDER BY acl_entry::text)
  INTO v_acl
  FROM pg_catalog.unnest(v_before.proacl) AS entries(acl_entry);

  IF v_acl IS DISTINCT FROM ARRAY['authenticated=X/postgres', 'postgres=X/postgres']::text[] THEN
    RAISE EXCEPTION 'Migration 030 blocked: BOQ Save must have exact postgres/authenticated execute ACL';
  END IF;

  IF v_before.proconfig IS DISTINCT FROM ARRAY[
    'search_path=""', 'lock_timeout=5s', 'statement_timeout=30s'
  ]::text[] THEN
    RAISE EXCEPTION 'Migration 030 blocked: BOQ Save function configuration drifted';
  END IF;

  v_definition := pg_catalog.pg_get_functiondef(v_before.oid);
  v_sha256 := pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(v_definition, 'UTF8')), 'hex');

  IF v_sha256 = c_post_sha256 THEN
    RAISE EXCEPTION 'Migration 030 blocked: guard already applied; replay is not permitted';
  END IF;
  IF v_sha256 IS DISTINCT FROM c_pre_sha256 THEN
    RAISE EXCEPTION 'Migration 030 blocked: BOQ Save definition does not match the exact read-only receipt';
  END IF;

  v_guard_count := (
    pg_catalog.length(v_definition)
    - pg_catalog.length(pg_catalog.replace(v_definition, c_old_guard, ''))
  ) / pg_catalog.length(c_old_guard);
  IF v_guard_count IS DISTINCT FROM 1 THEN
    RAISE EXCEPTION 'Migration 030 blocked: expected exactly one old authorization guard';
  END IF;

  v_patched_definition := pg_catalog.replace(v_definition, c_old_guard, c_new_guard);
  v_sha256 := pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(v_patched_definition, 'UTF8')), 'hex');
  IF v_sha256 IS DISTINCT FROM c_post_sha256 THEN
    RAISE EXCEPTION 'Migration 030 blocked: replacement differs from the exact one-guard change';
  END IF;

  EXECUTE v_patched_definition;

  SELECT function_row.* INTO v_after
  FROM pg_catalog.pg_proc function_row
  WHERE function_row.oid = pg_catalog.to_regprocedure(c_signature);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Migration 030 postcondition failed: BOQ Save signature is missing';
  END IF;

  -- Only prosrc may change. This also checks OID, owner, ACL, configuration,
  -- argument/result types and names, language, volatility and security flags.
  IF (pg_catalog.to_jsonb(v_after) - 'prosrc')
     IS DISTINCT FROM (pg_catalog.to_jsonb(v_before) - 'prosrc') THEN
    RAISE EXCEPTION 'Migration 030 postcondition failed: function metadata changed';
  END IF;

  v_definition := pg_catalog.pg_get_functiondef(v_after.oid);
  v_sha256 := pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(v_definition, 'UTF8')), 'hex');
  IF v_sha256 IS DISTINCT FROM c_post_sha256 THEN
    RAISE EXCEPTION 'Migration 030 postcondition failed: final definition differs from the approved guard';
  END IF;
END;
$boq_save_null_authorization_guard$;

COMMIT;
