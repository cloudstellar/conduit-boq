-- UM-B: confirm a verified request for an active staff profile with no actual affiliation.
-- Installs the command and its audit store without changing any account or BOQ rows.
BEGIN;

SET LOCAL search_path = pg_catalog;
SET LOCAL standard_conforming_strings = on;
SET LOCAL lock_timeout = '3s';
SET LOCAL statement_timeout = '20s';

SELECT pg_catalog.pg_advisory_xact_lock(
  pg_catalog.hashtextextended('conduit-boq:um-b-confirm-legacy-affiliation-033', 0)
);

DO $um_b_predecessor$
DECLARE
  v_guard oid := pg_catalog.to_regprocedure('private.p49_guard_user_profile_mutation()');
  v_s0_predicate constant text := $predicate$(( SELECT private.p49_current_active_role() AS p49_current_active_role) = ANY (ARRAY['admin'::text, 'dept_manager'::text, 'sector_manager'::text, 'staff'::text]))$predicate$;
BEGIN
  IF session_user <> 'postgres' OR current_user <> 'postgres'
     OR pg_catalog.current_database() <> 'postgres' THEN
    RAISE EXCEPTION 'UM-B requires the reviewed postgres database and executor';
  END IF;

  LOCK TABLE public.user_profiles IN SHARE ROW EXCLUSIVE MODE;

  IF pg_catalog.to_regclass('private.um_b_affiliation_outcomes') IS NOT NULL
     OR EXISTS (
       SELECT 1 FROM pg_catalog.pg_proc p
       JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
       WHERE n.nspname IN ('public', 'private') AND pg_catalog.starts_with(p.proname, 'um_b_')
     ) THEN
    RAISE EXCEPTION 'UM-B successor or a partial successor already exists';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_trigger t ON t.tgfoid = p.oid
    WHERE p.oid = v_guard AND p.proowner = 'postgres'::pg_catalog.regrole
      AND NOT p.prosecdef AND p.proconfig = ARRAY['search_path=""']::text[]
      AND p.proacl = ARRAY['postgres=X/postgres']::pg_catalog.aclitem[]
      AND t.tgrelid = 'public.user_profiles'::pg_catalog.regclass
      AND t.tgname = 'trg_p49_guard_user_profile_mutation' AND t.tgenabled = 'O'
      AND t.tgtype = 31 AND t.tgnargs = 0 AND NOT t.tgisinternal AND t.tgqual IS NULL
  )
     OR pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
       pg_catalog.pg_get_functiondef(v_guard), 'UTF8')), 'hex')
       IS DISTINCT FROM '850773f56cc93b67f75ce3071e27218021153a4154dea424195346988263de59'
     OR pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
       pg_catalog.pg_get_functiondef(pg_catalog.to_regprocedure('private.p49_current_active_admin()')), 'UTF8')), 'hex')
       IS DISTINCT FROM '2b84600847ed9c3bd0065c1bc09fdb633c8ba393e98623f3d6265c6797e586ec'
     OR pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
       pg_catalog.pg_get_functiondef(pg_catalog.to_regprocedure('private.p49_admin_transition(uuid,text,text,text,uuid)')), 'UTF8')), 'hex')
       IS DISTINCT FROM '6b7631f1a2f3fcd96fdeed2e1ca4ec58a0d23761c8d0fc53caebf64530858045'
     OR pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
       pg_catalog.pg_get_functiondef(pg_catalog.to_regprocedure('private.p49_reject_authorization_event_mutation()')), 'UTF8')), 'hex')
       IS DISTINCT FROM 'eb2d1747cf2596a50ac42a54f123d743b288d34d3b5d1fb2f671b5207d6acc14'
     OR pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
       pg_catalog.pg_get_functiondef(pg_catalog.to_regprocedure('public.duplicate_boq_atomic(uuid,uuid,timestamptz,text,uuid)')), 'UTF8')), 'hex')
       IS DISTINCT FROM '508f70695e5f5578734570d356c5a0921cab0e0dc0a207e8ffcc9aca313b68b2'
  THEN
    RAISE EXCEPTION 'UM-B profile, authorization, or Copy predecessor differs';
  END IF;
  IF (
    SELECT count(*)
    FROM (VALUES ('public.boq'::pg_catalog.regclass, 's0_boq_writer'),
                 ('public.boq_routes'::pg_catalog.regclass, 's0_boq_routes_writer'),
                 ('public.boq_items'::pg_catalog.regclass, 's0_boq_items_writer')) AS targets(rel, prefix)
    CROSS JOIN (VALUES ('insert','a'), ('update','w'), ('delete','d')) AS modes(suffix, command)
    JOIN pg_catalog.pg_policy p ON p.polname = prefix || '_' || suffix AND p.polrelid = rel
    WHERE p.polcmd::text = command AND NOT p.polpermissive
      AND p.polroles = ARRAY['authenticated'::pg_catalog.regrole::oid]
      AND pg_catalog.pg_get_expr(p.polqual, p.polrelid)
        IS NOT DISTINCT FROM (CASE WHEN command <> 'a' THEN v_s0_predicate END)
      AND pg_catalog.pg_get_expr(p.polwithcheck, p.polrelid)
        IS NOT DISTINCT FROM (CASE WHEN command <> 'd' THEN v_s0_predicate END)
  ) <> 9 THEN
    RAISE EXCEPTION 'UM-B requires the nine exact S0 writer guards';
  END IF;
END;
$um_b_predecessor$;

CREATE TABLE private.um_b_affiliation_outcomes (
  actor_id uuid NOT NULL,
  request_id uuid NOT NULL,
  target_id uuid NOT NULL,
  version integer NOT NULL CHECK (version = 1),
  intent jsonb NOT NULL,
  fingerprint text NOT NULL CHECK (fingerprint ~ '^[0-9a-f]{64}$'),
  outcome text NOT NULL,
  code text NOT NULL,
  before_state jsonb NOT NULL,
  after_state jsonb NOT NULL,
  recorded_at timestamptz NOT NULL,
  PRIMARY KEY (actor_id, request_id),
  CHECK (
    (outcome = 'APPLIED' AND code = 'APPLIED' AND before_state <> after_state)
    OR (outcome = 'DENIED' AND before_state = after_state AND code IN ('SELF_TARGET', 'REVIEW_CHANGED'))
  )
);
ALTER TABLE private.um_b_affiliation_outcomes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.um_b_affiliation_outcomes FROM PUBLIC, anon, authenticated, service_role;

CREATE INDEX um_b_affiliation_outcomes_history_idx
  ON private.um_b_affiliation_outcomes (target_id, recorded_at DESC, request_id DESC, actor_id DESC)
  WHERE outcome = 'APPLIED';

CREATE TRIGGER trg_um_b_affiliation_outcomes_immutable
  BEFORE UPDATE OR DELETE ON private.um_b_affiliation_outcomes
  FOR EACH ROW EXECUTE FUNCTION private.p49_reject_authorization_event_mutation();
CREATE TRIGGER trg_um_b_affiliation_outcomes_no_truncate
  BEFORE TRUNCATE ON private.um_b_affiliation_outcomes
  FOR EACH STATEMENT EXECUTE FUNCTION private.p49_reject_authorization_event_mutation();

CREATE FUNCTION private.um_b_profile_state(p public.user_profiles)
RETURNS jsonb
LANGUAGE sql IMMUTABLE SECURITY INVOKER
SET search_path = ''
AS $function$
  SELECT pg_catalog.jsonb_build_object(
    'role', p.role, 'status', p.status, 'org_id', p.org_id,
    'department_id', p.department_id, 'sector_id', p.sector_id
  );
$function$;

CREATE FUNCTION private.um_b_review_snapshot(
  p_actor_id uuid, p_target public.user_profiles, p_org public.organizations,
  p_department public.departments, p_sector public.sectors
)
RETURNS jsonb
LANGUAGE sql IMMUTABLE SECURITY INVOKER
SET search_path = ''
AS $function$
  SELECT private.um_b_profile_state(p_target) || pg_catalog.jsonb_build_object(
    'actor_id', p_actor_id,
    'target_id', p_target.id,
    'requested_department_id', p_target.requested_department_id,
    'requested_sector_id', p_target.requested_sector_id,
    'hierarchy', pg_catalog.jsonb_build_object(
      'org', pg_catalog.jsonb_build_object('id', p_org.id, 'name', p_org.name, 'active', p_org.is_active),
      'department', pg_catalog.jsonb_build_object(
        'id', p_department.id, 'name', p_department.name, 'active', p_department.is_active, 'org_id', p_department.org_id
      ),
      'sector', pg_catalog.jsonb_build_object(
        'id', p_sector.id, 'name', p_sector.name, 'active', p_sector.is_active, 'department_id', p_sector.department_id
      )
    )
  );
$function$;

CREATE FUNCTION private.um_b_outcome_envelope(p private.um_b_affiliation_outcomes, p_replayed boolean)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = ''
SET timezone = 'UTC'
AS $function$
  SELECT pg_catalog.jsonb_build_object(
    'version', p.version, 'actor_id', p.actor_id, 'target_id', p.target_id, 'request_id', p.request_id,
    'intent', p.intent, 'fingerprint', p.fingerprint, 'outcome', p.outcome, 'code', p.code,
    'recorded_at', p.recorded_at, 'replayed', p_replayed, 'before', p.before_state, 'after', p.after_state
  );
$function$;

REVOKE ALL ON FUNCTION private.um_b_profile_state(public.user_profiles),
  private.um_b_review_snapshot(uuid,public.user_profiles,public.organizations,public.departments,public.sectors),
  private.um_b_outcome_envelope(private.um_b_affiliation_outcomes,boolean)
  FROM PUBLIC, anon, authenticated, service_role;

CREATE FUNCTION public.um_b_affiliation_review(p_target_id uuid)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_actor_id uuid := (SELECT auth.uid());
  v_target public.user_profiles%ROWTYPE;
  v_org public.organizations%ROWTYPE;
  v_dept public.departments%ROWTYPE;
  v_sector public.sectors%ROWTYPE;
  v_code text;
  v_reviewed jsonb;
BEGIN
  IF NOT private.p49_current_active_admin() THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'current active admin is required';
  END IF;

  SELECT p.* INTO v_target FROM public.user_profiles p WHERE p.id = p_target_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'target profile was not found';
  END IF;

  IF v_target.id = v_actor_id THEN
    v_code := 'SELF_TARGET';
  ELSIF v_target.status <> 'active' OR v_target.role <> 'staff' THEN
    v_code := 'NOT_ACTIVE_STAFF';
  ELSIF v_target.org_id IS NOT NULL OR v_target.department_id IS NOT NULL OR v_target.sector_id IS NOT NULL THEN
    v_code := 'AFFILIATION_ALREADY_SET';
  ELSE
    SELECT d.* INTO v_dept FROM public.departments d WHERE d.id = v_target.requested_department_id;
    SELECT o.* INTO v_org FROM public.organizations o WHERE o.id = v_dept.org_id;
    SELECT s.* INTO v_sector FROM public.sectors s WHERE s.id = v_target.requested_sector_id;

    IF v_org.is_active IS NOT TRUE OR v_dept.is_active IS NOT TRUE OR v_sector.is_active IS NOT TRUE
       OR v_sector.department_id IS DISTINCT FROM v_dept.id THEN
      v_code := 'REQUEST_INVALID';
    ELSE
      v_code := 'ELIGIBLE';
      v_reviewed := private.um_b_review_snapshot(v_actor_id, v_target, v_org, v_dept, v_sector);
    END IF;
  END IF;

  RETURN pg_catalog.jsonb_build_object(
    'version', 1, 'actor_id', v_actor_id, 'target_id', p_target_id,
    'eligible', v_code = 'ELIGIBLE', 'code', v_code, 'reviewed', v_reviewed
  );
END;
$function$;

CREATE FUNCTION public.um_b_confirm_affiliation(
  p_target_id uuid, p_request_id uuid, p_reviewed jsonb, p_reason text
)
RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = ''
SET lock_timeout = '3s'
SET statement_timeout = '15s'
AS $function$
DECLARE
  v_actor_id uuid := (SELECT auth.uid());
  v_actor public.user_profiles%ROWTYPE;
  v_target public.user_profiles%ROWTYPE;
  v_org public.organizations%ROWTYPE;
  v_dept public.departments%ROWTYPE;
  v_sector public.sectors%ROWTYPE;
  v_record private.um_b_affiliation_outcomes%ROWTYPE;
  v_reason text := pg_catalog.btrim(p_reason,
    U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF');
  v_uuid_pattern constant text := '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
  v_review_org uuid;
  v_review_dept uuid;
  v_review_sector uuid;
  v_intent jsonb;
  v_previous_guard text;
  v_recorded_at timestamptz;
  v_outcome text := 'DENIED';
  v_code text;
  v_before jsonb;
  v_after jsonb;
BEGIN
  IF NOT private.p49_current_active_admin() THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'current active admin is required';
  END IF;
  IF p_target_id IS NULL OR p_request_id IS NULL OR v_reason IS NULL
     OR pg_catalog.char_length(v_reason) NOT BETWEEN 1 AND 1000
     OR pg_catalog.jsonb_typeof(p_reviewed) IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'target, request ID, reviewed state, and reason are required';
  END IF;

  IF ((p_reviewed #>> '{hierarchy,org,id}') ~ v_uuid_pattern) IS NOT TRUE
     OR ((p_reviewed #>> '{hierarchy,department,id}') ~ v_uuid_pattern) IS NOT TRUE
     OR ((p_reviewed #>> '{hierarchy,sector,id}') ~ v_uuid_pattern) IS NOT TRUE
     OR pg_catalog.jsonb_typeof(p_reviewed #> '{hierarchy,org,name}') IS DISTINCT FROM 'string'
     OR pg_catalog.jsonb_typeof(p_reviewed #> '{hierarchy,department,name}') IS DISTINCT FROM 'string'
     OR pg_catalog.jsonb_typeof(p_reviewed #> '{hierarchy,sector,name}') IS DISTINCT FROM 'string' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'reviewed hierarchy contains invalid IDs or names';
  END IF;

  v_review_org := (p_reviewed #>> '{hierarchy,org,id}')::uuid;
  v_review_dept := (p_reviewed #>> '{hierarchy,department,id}')::uuid;
  v_review_sector := (p_reviewed #>> '{hierarchy,sector,id}')::uuid;
  IF p_reviewed IS DISTINCT FROM pg_catalog.jsonb_build_object(
       'actor_id', v_actor_id, 'target_id', p_target_id, 'role', 'staff', 'status', 'active',
       'org_id', NULL, 'department_id', NULL, 'sector_id', NULL,
       'requested_department_id', v_review_dept, 'requested_sector_id', v_review_sector,
       'hierarchy', pg_catalog.jsonb_build_object(
         'org', pg_catalog.jsonb_build_object(
           'id', v_review_org, 'name', p_reviewed #>> '{hierarchy,org,name}', 'active', true
         ),
         'department', pg_catalog.jsonb_build_object(
           'id', v_review_dept, 'name', p_reviewed #>> '{hierarchy,department,name}',
           'active', true, 'org_id', v_review_org
         ),
         'sector', pg_catalog.jsonb_build_object(
           'id', v_review_sector, 'name', p_reviewed #>> '{hierarchy,sector,name}',
           'active', true, 'department_id', v_review_dept
         )
       )
     ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'reviewed state has an invalid shape or identity binding';
  END IF;

  -- Match 027's actor/target lock order before doing the current authority and replay checks.
  PERFORM p.id FROM public.user_profiles p
    WHERE p.id IN (v_actor_id, p_target_id) ORDER BY p.id FOR UPDATE;
  SELECT p.* INTO v_actor FROM public.user_profiles p WHERE p.id = v_actor_id;
  IF v_actor.id IS NULL OR v_actor.role <> 'admin' OR v_actor.status <> 'active' THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'current active admin is required';
  END IF;
  SELECT p.* INTO v_target FROM public.user_profiles p WHERE p.id = p_target_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'target profile was not found';
  END IF;

  v_intent := pg_catalog.jsonb_build_object('reviewed', p_reviewed, 'reason', v_reason);
  SELECT e.* INTO v_record FROM private.um_b_affiliation_outcomes e
    WHERE e.actor_id = v_actor_id AND e.request_id = p_request_id;
  IF FOUND THEN
    IF v_record.target_id IS DISTINCT FROM p_target_id OR v_record.version <> 1
       OR v_record.intent IS DISTINCT FROM v_intent THEN
      RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'request ID belongs to a different confirmation intent';
    END IF;
    RETURN private.um_b_outcome_envelope(v_record, true);
  END IF;

  v_before := private.um_b_profile_state(v_target);
  v_after := v_before;

  IF v_actor_id = p_target_id THEN
    v_code := 'SELF_TARGET';
  ELSIF v_target.role <> 'staff' OR v_target.status <> 'active'
     OR v_target.org_id IS NOT NULL OR v_target.department_id IS NOT NULL OR v_target.sector_id IS NOT NULL
     OR v_target.requested_department_id IS DISTINCT FROM v_review_dept
     OR v_target.requested_sector_id IS DISTINCT FROM v_review_sector THEN
    v_code := 'REVIEW_CHANGED';
  ELSE
    -- Lock the reviewed IDs, then compare parents, names, and active flags.
    -- These locks also protect non-key attributes from concurrent updates.
    SELECT o.* INTO v_org FROM public.organizations o WHERE o.id = v_review_org FOR SHARE;
    SELECT d.* INTO v_dept FROM public.departments d WHERE d.id = v_review_dept FOR SHARE;
    SELECT s.* INTO v_sector FROM public.sectors s WHERE s.id = v_review_sector FOR SHARE;

    IF private.um_b_review_snapshot(v_actor_id, v_target, v_org, v_dept, v_sector) IS DISTINCT FROM p_reviewed THEN
      v_code := 'REVIEW_CHANGED';
    ELSE
      v_code := 'APPLIED';
      v_outcome := 'APPLIED';
    END IF;
  END IF;

  v_recorded_at := pg_catalog.clock_timestamp();
  IF v_outcome = 'APPLIED' THEN
    v_previous_guard := pg_catalog.current_setting('conduit.p49_profile_action', true);
    PERFORM pg_catalog.set_config('conduit.p49_profile_action', 'um_b_affiliation_confirmed', true);

    UPDATE public.user_profiles p
      SET org_id = v_org.id, department_id = v_dept.id, sector_id = v_sector.id, updated_at = v_recorded_at
      WHERE p.id = p_target_id
      RETURNING private.um_b_profile_state(p) INTO STRICT v_after;

    PERFORM pg_catalog.set_config('conduit.p49_profile_action', COALESCE(v_previous_guard, ''), true);
  END IF;

  INSERT INTO private.um_b_affiliation_outcomes (
    actor_id, request_id, target_id, version, intent, fingerprint, outcome, code, before_state, after_state, recorded_at
  ) VALUES (
    v_actor_id, p_request_id, p_target_id, 1, v_intent,
    pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(
      pg_catalog.jsonb_build_object('version', 1, 'action', 'confirm_affiliation',
        'target_id', p_target_id, 'intent', v_intent)::text, 'UTF8')), 'hex'),
    v_outcome, v_code, v_before, v_after, v_recorded_at
  )
  RETURNING * INTO v_record;

  RETURN private.um_b_outcome_envelope(v_record, false);
END;
$function$;

CREATE FUNCTION public.um_b_affiliation_outcome(p_request_id uuid)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_record private.um_b_affiliation_outcomes%ROWTYPE;
BEGIN
  IF NOT private.p49_current_active_admin() THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'current active admin is required';
  END IF;
  IF p_request_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'request ID is required';
  END IF;
  SELECT e.* INTO v_record FROM private.um_b_affiliation_outcomes e
    WHERE e.actor_id = (SELECT auth.uid()) AND e.request_id = p_request_id;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  RETURN private.um_b_outcome_envelope(v_record, true);
END;
$function$;

CREATE FUNCTION public.um_b_affiliation_history(p_target_id uuid)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = ''
SET timezone = 'UTC'
AS $function$
BEGIN
  IF NOT private.p49_current_active_admin() THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'current active admin is required';
  END IF;
  IF p_target_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'target ID is required';
  END IF;

  RETURN (
    SELECT COALESCE(pg_catalog.jsonb_agg(history.entry ORDER BY history.recorded_at DESC,
      history.source, history.record_key), '[]'::jsonb)
    FROM (
      SELECT * FROM (
        (SELECT e.created_at AS recorded_at, 'p49' AS source, e.id::text AS record_key,
          pg_catalog.jsonb_build_object(
            'source', 'p49', 'id', e.id, 'action', e.action, 'actor_id', e.actor_id,
            'target_id', e.target_id, 'reason', e.reason, 'recorded_at', e.created_at,
            'before', pg_catalog.jsonb_build_object('role', e.old_role, 'status', e.old_status),
            'after', pg_catalog.jsonb_build_object('role', e.new_role, 'status', e.new_status)
          ) AS entry
          FROM public.user_authorization_events e WHERE e.target_id = p_target_id
          ORDER BY e.created_at DESC, e.id LIMIT 50)
        UNION ALL
        (SELECT e.recorded_at, 'um_b', e.request_id::text || ':' || e.actor_id::text,
          pg_catalog.jsonb_build_object(
            'source', 'um_b', 'id', e.request_id::text || ':' || e.actor_id::text, 'action', 'affiliation_confirmed',
            'actor_id', e.actor_id, 'target_id', e.target_id, 'reason', e.intent->>'reason',
            'recorded_at', e.recorded_at, 'before', e.before_state, 'after', e.after_state
          )
          FROM private.um_b_affiliation_outcomes e WHERE e.target_id = p_target_id AND e.outcome = 'APPLIED'
          ORDER BY e.recorded_at DESC, e.request_id, e.actor_id LIMIT 50)
      ) AS recent
      ORDER BY recent.recorded_at DESC, recent.source, recent.record_key
      LIMIT 50
    ) AS history
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.um_b_affiliation_review(uuid),
  public.um_b_confirm_affiliation(uuid,uuid,jsonb,text),
  public.um_b_affiliation_outcome(uuid),
  public.um_b_affiliation_history(uuid)
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.um_b_affiliation_review(uuid),
  public.um_b_confirm_affiliation(uuid,uuid,jsonb,text),
  public.um_b_affiliation_outcome(uuid),
  public.um_b_affiliation_history(uuid)
  TO authenticated;

DO $um_b_guard_and_acl$
DECLARE
  v_before pg_catalog.pg_proc%ROWTYPE;
  v_after pg_catalog.pg_proc%ROWTYPE;
  v_definition text;
  v_signature pg_catalog.regprocedure := 'private.p49_guard_user_profile_mutation()'::pg_catalog.regprocedure;
  v_insert_at constant text := '  IF v_action IS NULL OR v_action NOT IN (';
  v_new_branch constant text := $branch$  IF v_action = 'um_b_affiliation_confirmed' THEN
    IF current_user <> 'postgres'
       OR (SELECT auth.uid()) IS NULL
       OR (SELECT auth.uid()) IS NOT DISTINCT FROM OLD.id
       OR NOT private.p49_current_active_admin()
       OR OLD.role <> 'staff' OR OLD.status <> 'active'
       OR OLD.org_id IS NOT NULL OR OLD.department_id IS NOT NULL OR OLD.sector_id IS NOT NULL
       OR NEW.org_id IS NULL OR NEW.department_id IS NULL OR NEW.sector_id IS NULL OR NEW.updated_at IS NULL
       OR NEW.department_id IS DISTINCT FROM OLD.requested_department_id
       OR NEW.sector_id IS DISTINCT FROM OLD.requested_sector_id
       OR (
         pg_catalog.to_jsonb(NEW) - ARRAY['org_id', 'department_id', 'sector_id', 'updated_at']::text[]
       ) IS DISTINCT FROM (
         pg_catalog.to_jsonb(OLD) - ARRAY['org_id', 'department_id', 'sector_id', 'updated_at']::text[]
       )
       OR NOT EXISTS (
         SELECT 1 FROM public.organizations o
         JOIN public.departments d ON d.org_id = o.id
         JOIN public.sectors s ON s.department_id = d.id
         WHERE o.id = NEW.org_id AND d.id = NEW.department_id AND s.id = NEW.sector_id
           AND o.is_active AND d.is_active AND s.is_active
       )
    THEN
      RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'invalid legacy affiliation confirmation';
    END IF;
    RETURN NEW;
  END IF;

$branch$;
  v_expected_definition text;
BEGIN
  SELECT p.* INTO STRICT v_before FROM pg_catalog.pg_proc p WHERE p.oid = v_signature;
  v_definition := pg_catalog.pg_get_functiondef(v_signature);
  IF pg_catalog.length(v_definition) - pg_catalog.length(pg_catalog.replace(v_definition, v_insert_at, ''))
       IS DISTINCT FROM pg_catalog.length(v_insert_at) THEN
    RAISE EXCEPTION 'UM-B failed to isolate the profile guard extension';
  END IF;
  v_expected_definition := pg_catalog.replace(v_definition, v_insert_at, v_new_branch || v_insert_at);

  EXECUTE v_expected_definition;

  SELECT p.* INTO STRICT v_after FROM pg_catalog.pg_proc p WHERE p.oid = v_signature;
  IF (pg_catalog.to_jsonb(v_after) - 'prosrc') IS DISTINCT FROM (pg_catalog.to_jsonb(v_before) - 'prosrc')
     OR pg_catalog.pg_get_functiondef(v_signature) IS DISTINCT FROM v_expected_definition THEN
    RAISE EXCEPTION 'UM-B profile guard metadata or extension changed unexpectedly';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname IN ('public', 'private') AND pg_catalog.starts_with(p.proname, 'um_b_')
      AND (
        p.proowner <> 'postgres'::pg_catalog.regrole
        OR p.prosecdef IS DISTINCT FROM (n.nspname = 'public')
        OR pg_catalog.has_function_privilege('anon', p.oid, 'EXECUTE')
        OR pg_catalog.has_function_privilege('service_role', p.oid, 'EXECUTE')
        OR pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE')
          IS DISTINCT FROM (n.nspname = 'public')
      )
  ) OR EXISTS (
    SELECT 1 FROM pg_catalog.pg_class t
    WHERE t.oid = 'private.um_b_affiliation_outcomes'::pg_catalog.regclass
      AND (
        t.relowner <> 'postgres'::pg_catalog.regrole OR NOT t.relrowsecurity
        OR pg_catalog.has_table_privilege('anon', t.oid, 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
        OR pg_catalog.has_table_privilege('authenticated', t.oid, 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
        OR pg_catalog.has_table_privilege('service_role', t.oid, 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN')
      )
  ) THEN
    RAISE EXCEPTION 'UM-B function or private outcome privileges differ from the command contract';
  END IF;
END;
$um_b_guard_and_acl$;

NOTIFY pgrst, 'reload schema';

COMMIT;
