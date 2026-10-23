-- =============================================================================
-- Migration 031: Return a non-retrying BOQ stale-copy conflict
-- =============================================================================
-- New forward correction; migrations 027–030 remain immutable/no-replay.
-- The captured Production definition and matched local predecessor use 40001
-- for a deterministic stale-source conflict. PostgREST 14 retries that code;
-- real local 14.13 and 14.5 requests timed out without delivering the conflict.
--
-- Change only the stale RAISE code/detail, retaining its existing message.
-- Preserve authorization, lock order, ledger-first idempotency and all graph,
-- Catalog, Factor and calculation behavior. No business function is called,
-- no data/ledger is read or written, and no historical migration is replayed.
-- Unknown predecessors and already-patched definitions fail closed atomically.
-- Local implementation/testing authority is not Production execution authority.
-- =============================================================================

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
SET LOCAL idle_in_transaction_session_timeout = '90s';

SELECT pg_catalog.pg_advisory_xact_lock(
  pg_catalog.hashtextextended('conduit-boq:duplicate-stale-conflict-031', 0)
);

DO $boq_duplicate_stale_conflict_guard$
DECLARE
  c_signature constant text := 'public.duplicate_boq_atomic(uuid,uuid,timestamptz,text,uuid)';
  c_pre_sha256 constant text := 'd3c422a78c2434ad40c932250b734871608282bc41dce3097a853ddcc1637910';
  c_post_sha256 constant text := '508f70695e5f5578734570d356c5a0921cab0e0dc0a207e8ffcc9aca313b68b2';
  c_old_guard constant text := $old_guard$      ERRCODE = '40001',
      MESSAGE = 'source BOQ changed after it was loaded; reload before copying';$old_guard$;
  c_new_guard constant text := $new_guard$      ERRCODE = 'PT409',
      MESSAGE = 'source BOQ changed after it was loaded; reload before copying',
      DETAIL = 'BOQ_SOURCE_STALE';$new_guard$;
  v_before pg_catalog.pg_proc%ROWTYPE;
  v_after pg_catalog.pg_proc%ROWTYPE;
  v_acl text[];
  v_definition text;
  v_patched_definition text;
  v_sha256 text;
  v_guard_count integer;
BEGIN
  IF session_user <> 'postgres' OR current_user <> 'postgres' THEN
    RAISE EXCEPTION 'Migration 031 blocked: session/current user must be postgres';
  END IF;

  SELECT function_row.* INTO v_before
  FROM pg_catalog.pg_proc function_row
  WHERE function_row.oid = pg_catalog.to_regprocedure(c_signature);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Migration 031 blocked: exact BOQ Duplicate signature is missing';
  END IF;

  IF pg_catalog.pg_get_userbyid(v_before.proowner) IS DISTINCT FROM 'postgres'
     OR v_before.prosecdef IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Migration 031 blocked: BOQ Duplicate owner/security posture drifted';
  END IF;

  SELECT pg_catalog.array_agg(acl_entry::text ORDER BY acl_entry::text)
  INTO v_acl
  FROM pg_catalog.unnest(v_before.proacl) AS entries(acl_entry);

  IF v_acl IS DISTINCT FROM ARRAY['authenticated=X/postgres', 'postgres=X/postgres']::text[] THEN
    RAISE EXCEPTION 'Migration 031 blocked: BOQ Duplicate must have exact postgres/authenticated execute ACL';
  END IF;

  IF v_before.proconfig IS DISTINCT FROM ARRAY[
    'search_path=""', 'lock_timeout=5s', 'statement_timeout=30s'
  ]::text[] THEN
    RAISE EXCEPTION 'Migration 031 blocked: BOQ Duplicate function configuration drifted';
  END IF;

  v_definition := pg_catalog.pg_get_functiondef(v_before.oid);
  v_sha256 := pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(v_definition, 'UTF8')), 'hex');

  IF v_sha256 = c_post_sha256 THEN
    RAISE EXCEPTION 'Migration 031 blocked: conflict guard already applied; replay is not permitted';
  END IF;
  IF v_sha256 IS DISTINCT FROM c_pre_sha256 THEN
    RAISE EXCEPTION 'Migration 031 blocked: BOQ Duplicate definition does not match the exact captured predecessor';
  END IF;

  v_guard_count := (
    pg_catalog.length(v_definition)
    - pg_catalog.length(pg_catalog.replace(v_definition, c_old_guard, ''))
  ) / pg_catalog.length(c_old_guard);
  IF v_guard_count IS DISTINCT FROM 1 THEN
    RAISE EXCEPTION 'Migration 031 blocked: expected exactly one old stale-source guard';
  END IF;

  v_patched_definition := pg_catalog.replace(v_definition, c_old_guard, c_new_guard);
  v_sha256 := pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(v_patched_definition, 'UTF8')), 'hex');
  IF v_sha256 IS DISTINCT FROM c_post_sha256 THEN
    RAISE EXCEPTION 'Migration 031 blocked: replacement differs from the exact stale-conflict change';
  END IF;

  EXECUTE v_patched_definition;

  SELECT function_row.* INTO v_after
  FROM pg_catalog.pg_proc function_row
  WHERE function_row.oid = pg_catalog.to_regprocedure(c_signature);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Migration 031 postcondition failed: BOQ Duplicate signature is missing';
  END IF;

  -- Keep OID, signature/defaults, owner, ACL, configuration, cost, language,
  -- volatility, security flags and every other pg_proc field unchanged.
  IF (pg_catalog.to_jsonb(v_after) - 'prosrc')
     IS DISTINCT FROM (pg_catalog.to_jsonb(v_before) - 'prosrc') THEN
    RAISE EXCEPTION 'Migration 031 postcondition failed: function metadata changed';
  END IF;

  v_definition := pg_catalog.pg_get_functiondef(v_after.oid);
  v_sha256 := pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(v_definition, 'UTF8')), 'hex');
  IF v_sha256 IS DISTINCT FROM c_post_sha256 THEN
    RAISE EXCEPTION 'Migration 031 postcondition failed: final definition differs from the approved conflict guard';
  END IF;
END;
$boq_duplicate_stale_conflict_guard$;

COMMIT;
