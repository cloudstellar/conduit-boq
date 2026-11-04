-- =============================================================================
-- Migration 032: Preserve BOQ scope while closing procurement direct writes
-- =============================================================================
-- Candidate source only until a separately gated local operator application.
-- Adds exactly nine restrictive INSERT/UPDATE/DELETE policies. Ordinary SELECT,
-- the old ownership/assignment/scope policies, and Save/Copy/031 remain intact.
-- No business/Auth rows, ledgers, reference values or functions are changed.
-- Migrations 027-031 are immutable and must never be replayed.
--
-- The portable predecessor fingerprint is the reviewed application metadata
-- projection (9 relations, 30 functions, 8 triggers, public/private schemas),
-- using PostgreSQL jsonb::text UTF8 SHA-256. It includes the explicit 031 Copy
-- successor, not the older Copy definition in the frozen Production capture.
-- Same-target catalog identities/comments/indexes are also retained in-transaction.
-- No concurrent DDL is allowed on these contracts during the approved window;
-- the advisory lock alone does not exclude unrelated DDL.
-- =============================================================================

BEGIN;

SET LOCAL search_path = pg_catalog;
SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '15s';
SET LOCAL idle_in_transaction_session_timeout = '30s';

SELECT pg_catalog.pg_advisory_xact_lock(
  pg_catalog.hashtextextended('conduit-boq:s0-boq-writer-boundary-032', 0)
);

-- Use the same stable parent/child order as the local operator preflight.
-- Policy DDL already needs a relation lock; take all three before fingerprinting.
LOCK TABLE public.boq, public.boq_routes, public.boq_items
  IN SHARE ROW EXCLUSIVE MODE;

DO $s0_boq_writer_boundary$
DECLARE
  c_pre_sha256 constant text := '1df6e90e98b017ff13b6e566d1c6734f48edcf9ebb0be651b85a69ebbd3e0723';
  c_tables constant oid[] := ARRAY[
    'public.boq'::pg_catalog.regclass,
    'public.boq_routes'::pg_catalog.regclass,
    'public.boq_items'::pg_catalog.regclass
  ];
  c_guard_names constant text[] := ARRAY[
    's0_boq_writer_insert',
    's0_boq_writer_update',
    's0_boq_writer_delete',
    's0_boq_routes_writer_insert',
    's0_boq_routes_writer_update',
    's0_boq_routes_writer_delete',
    's0_boq_items_writer_insert',
    's0_boq_items_writer_update',
    's0_boq_items_writer_delete'
  ];
  c_function_names constant text[] := ARRAY[
    'admin_approve_user',
    'admin_deactivate_user',
    'admin_reactivate_user',
    'admin_reject_user',
    'admin_set_user_role',
    'admin_suspend_user',
    'boq_copy_graph_sha256',
    'duplicate_boq_atomic',
    'get_admin_profiles_page',
    'get_authorized_profiles_page',
    'get_my_profile',
    'get_my_profile_v2',
    'get_user_role',
    'handle_new_user',
    'p49_admin_transition',
    'p49_current_active_admin',
    'p49_current_active_department_id',
    'p49_current_active_role',
    'p49_current_profile_active',
    'p49_current_profile_recognized',
    'p49_current_selector_reader',
    'p49_guard_user_profile_mutation',
    'p49_reject_authorization_event_mutation',
    'prevent_boq_factor_reference_version_modification',
    'prevent_boq_version_modification',
    'save_boq_with_routes',
    'set_default_factor_reference_version',
    'set_default_price_list_version',
    'update_boq_routes_updated_at',
    'update_my_profile'
  ];
  c_expected_predicate constant text := $predicate$(( SELECT private.p49_current_active_role() AS p49_current_active_role) = ANY (ARRAY['admin'::text, 'dept_manager'::text, 'sector_manager'::text, 'staff'::text]))$predicate$;
  v_phase integer;
  v_contract jsonb;
  v_before_contract jsonb;
  v_identity_contract jsonb;
  v_before_identity_contract jsonb;
  v_guard_count integer;
BEGIN
  IF session_user <> 'postgres' OR current_user <> 'postgres'
     OR pg_catalog.current_database() <> 'postgres' THEN
    RAISE EXCEPTION 'S0 blocked: exact postgres session/database required';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_policy p
    WHERE p.polrelid = ANY(c_tables) AND p.polname = ANY(c_guard_names)
  ) THEN
    RAISE EXCEPTION 'S0 blocked: existing successor or partial guard set; no replay';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_roles r
    WHERE r.rolname = 'authenticated' AND NOT r.rolsuper AND NOT r.rolbypassrls
      AND NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_roles inherited
        WHERE inherited.oid <> r.oid
          AND pg_catalog.pg_has_role(r.oid, inherited.oid, 'USAGE')
          AND (inherited.rolsuper OR inherited.rolbypassrls
            OR inherited.oid IN (
              SELECT c.relowner FROM pg_catalog.pg_class c WHERE c.oid = ANY(c_tables)
            ))
      )
  ) THEN
    RAISE EXCEPTION 'S0 blocked: authenticated bypass/ownership posture drift';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_catalog.unnest(c_tables) AS targets(table_oid)
    WHERE pg_catalog.has_table_privilege('authenticated', targets.table_oid,
      'TRUNCATE, REFERENCES, TRIGGER, MAINTAIN')
  ) THEN
    RAISE EXCEPTION 'S0 blocked: authenticated has non-RLS table privileges';
  END IF;

  -- Capture the same portable projection before and after, excluding only the
  -- nine exact successor names on the three target tables in phase 1.
  FOR v_phase IN 0..1 LOOP
    WITH wanted(schema,name) AS (VALUES ('public','boq'),('public','boq_routes'),('public','boq_items'),('public','user_profiles'),('public','user_authorization_events'),('public','organizations'),('public','departments'),('public','sectors'),('private','boq_copy_requests')),
    rels AS (SELECT c.*,n.nspname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace JOIN wanted w ON w.schema=n.nspname AND w.name=c.relname),
    funcs AS (SELECT p.*,n.nspname FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname IN ('public','private') AND p.proname IN ('admin_approve_user','admin_deactivate_user','admin_reactivate_user','admin_reject_user','admin_set_user_role','admin_suspend_user','boq_copy_graph_sha256','duplicate_boq_atomic','get_admin_profiles_page','get_authorized_profiles_page','get_my_profile','get_my_profile_v2','get_user_role','handle_new_user','p49_admin_transition','p49_current_active_admin','p49_current_active_department_id','p49_current_active_role','p49_current_profile_active','p49_current_profile_recognized','p49_current_selector_reader','p49_guard_user_profile_mutation','p49_reject_authorization_event_mutation','prevent_boq_factor_reference_version_modification','prevent_boq_version_modification','save_boq_with_routes','set_default_factor_reference_version','set_default_price_list_version','update_boq_routes_updated_at','update_my_profile')),
    apptriggers AS (SELECT t.*,n.nspname AS table_schema,c.relname AS table_name,pn.nspname AS function_schema,p.proname AS function_name FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace JOIN pg_proc p ON p.oid=t.tgfoid JOIN pg_namespace pn ON pn.oid=p.pronamespace WHERE NOT t.tgisinternal AND (t.tgrelid IN (SELECT oid FROM rels) OR (n.nspname='auth' AND c.relname='users' AND pn.nspname IN ('public','private')))),
    acl_objects AS (
     SELECT 'relation'::text AS kind,c.oid AS object_id,COALESCE(c.relacl,acldefault('r',c.relowner)) AS acl FROM rels c
     UNION ALL SELECT 'function',f.oid,COALESCE(f.proacl,acldefault('f',f.proowner)) FROM funcs f
     UNION ALL SELECT 'schema',n.oid,COALESCE(n.nspacl,acldefault('n',n.nspowner)) FROM pg_namespace n WHERE n.nspname IN ('public','private')
    ),acls AS (SELECT o.kind,o.object_id,CASE WHEN x.grantee=0 THEN 'PUBLIC' ELSE pg_get_userbyid(x.grantee)::text END AS grantee,pg_get_userbyid(x.grantor)::text AS grantor,x.privilege_type AS privilege,x.is_grantable AS grantable FROM acl_objects o CROSS JOIN LATERAL aclexplode(NULLIF(o.acl,'{}'::aclitem[])) x)
    SELECT jsonb_build_object(
     'relations',(SELECT COALESCE(jsonb_agg(jsonb_build_object(
       'schema',c.nspname,'name',c.relname,'kind',c.relkind,'owner',pg_get_userbyid(c.relowner),'rowSecurity',c.relrowsecurity,'forceRowSecurity',c.relforcerowsecurity,
       'acl',(SELECT COALESCE(jsonb_agg(jsonb_build_object('grantee',a.grantee,'grantor',a.grantor,'privilege',a.privilege,'grantable',a.grantable) ORDER BY a.grantee,a.grantor,a.privilege),'[]'::jsonb) FROM acls a WHERE a.kind='relation' AND a.object_id=c.oid),
       'columns',(SELECT COALESCE(jsonb_agg(jsonb_build_object('name',a.attname,'position',a.attnum,'type',format_type(a.atttypid,a.atttypmod),'notNull',a.attnotnull,'default',pg_get_expr(ad.adbin,ad.adrelid),'identity',a.attidentity,'generated',a.attgenerated,
         'acl',(SELECT COALESCE(jsonb_agg(jsonb_build_object('grantee',CASE WHEN x.grantee=0 THEN 'PUBLIC' ELSE pg_get_userbyid(x.grantee)::text END,'grantor',pg_get_userbyid(x.grantor),'privilege',x.privilege_type,'grantable',x.is_grantable) ORDER BY x.grantee,x.grantor,x.privilege_type),'[]'::jsonb) FROM aclexplode(NULLIF(a.attacl,'{}'::aclitem[])) x)) ORDER BY a.attnum),'[]'::jsonb) FROM pg_attribute a LEFT JOIN pg_attrdef ad ON ad.adrelid=a.attrelid AND ad.adnum=a.attnum WHERE a.attrelid=c.oid AND a.attnum>0 AND NOT a.attisdropped),
       'constraints',(SELECT COALESCE(jsonb_agg(jsonb_build_object('name',con.conname,'kind',con.contype,'definition',pg_get_constraintdef(con.oid,true),'validated',con.convalidated,'deferrable',con.condeferrable,'deferred',con.condeferred,'local',con.conislocal,'parent',con.conparentid<>0) ORDER BY con.conname),'[]'::jsonb) FROM pg_constraint con WHERE con.conrelid=c.oid),
       'policies',(SELECT COALESCE(jsonb_agg(jsonb_build_object('name',p.polname,'command',p.polcmd,'permissive',p.polpermissive,'roles',(SELECT jsonb_agg(CASE WHEN r=0 THEN 'PUBLIC' ELSE pg_get_userbyid(r)::text END ORDER BY CASE WHEN r=0 THEN 'PUBLIC' ELSE pg_get_userbyid(r)::text END) FROM unnest(p.polroles) r),'using',pg_get_expr(p.polqual,p.polrelid),'check',pg_get_expr(p.polwithcheck,p.polrelid)) ORDER BY p.polname),'[]'::jsonb) FROM pg_policy p WHERE p.polrelid=c.oid
         AND (v_phase = 0 OR NOT (p.polrelid = ANY(c_tables) AND p.polname = ANY(c_guard_names))))
     ) ORDER BY c.nspname,c.relname),'[]'::jsonb) FROM rels c),
     'functions',(SELECT COALESCE(jsonb_agg(jsonb_build_object('schema',f.nspname,'name',f.proname,'identityArguments',pg_get_function_identity_arguments(f.oid),'kind',f.prokind,'definition',pg_get_functiondef(f.oid),'owner',pg_get_userbyid(f.proowner),'language',l.lanname,'securityDefiner',f.prosecdef,'volatility',f.provolatile,'parallel',f.proparallel,'strict',f.proisstrict,'leakproof',f.proleakproof,'config',COALESCE(to_jsonb(f.proconfig),'[]'::jsonb),
     'acl',(SELECT COALESCE(jsonb_agg(jsonb_build_object('grantee',a.grantee,'grantor',a.grantor,'privilege',a.privilege,'grantable',a.grantable) ORDER BY a.grantee,a.grantor,a.privilege),'[]'::jsonb) FROM acls a WHERE a.kind='function' AND a.object_id=f.oid)) ORDER BY f.nspname,f.proname,pg_get_function_identity_arguments(f.oid)),'[]'::jsonb) FROM funcs f JOIN pg_language l ON l.oid=f.prolang),
     'triggers',(SELECT COALESCE(jsonb_agg(jsonb_build_object('schema',t.table_schema,'table',t.table_name,'name',t.tgname,'functionSchema',t.function_schema,'functionName',t.function_name,'definition',pg_get_triggerdef(t.oid,true),'enabled',t.tgenabled,'constraint',t.tgconstraint<>0) ORDER BY t.table_schema,t.table_name,t.tgname),'[]'::jsonb) FROM apptriggers t),
     'schemas',(SELECT COALESCE(jsonb_agg(jsonb_build_object('name',n.nspname,'owner',pg_get_userbyid(n.nspowner),'acl',(SELECT COALESCE(jsonb_agg(jsonb_build_object('grantee',a.grantee,'grantor',a.grantor,'privilege',a.privilege,'grantable',a.grantable) ORDER BY a.grantee,a.grantor,a.privilege),'[]'::jsonb) FROM acls a WHERE a.kind='schema' AND a.object_id=n.oid)) ORDER BY n.nspname),'[]'::jsonb) FROM pg_namespace n WHERE n.nspname IN ('public','private'))
    ) INTO v_contract;

    WITH target_relations AS (
            SELECT c.* FROM pg_catalog.pg_class c WHERE c.oid = ANY(c_tables)
          ), selected_functions AS (
            SELECT p.* FROM pg_catalog.pg_proc p
            JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname IN ('public', 'private')
              AND p.proname = ANY(c_function_names)
          )
          SELECT pg_catalog.jsonb_build_object(
            'functions', (SELECT pg_catalog.jsonb_agg(
              pg_catalog.jsonb_build_object('catalog', pg_catalog.to_jsonb(p),
                'comment', pg_catalog.obj_description(p.oid, 'pg_proc')) ORDER BY p.oid)
              FROM selected_functions p),
            'policies', (SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(p) ORDER BY p.oid)
              FROM pg_catalog.pg_policy p WHERE p.polrelid = ANY(c_tables)
                AND (v_phase = 0 OR NOT (p.polname = ANY(c_guard_names)))),
            'relations', (SELECT pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
              'oid', c.oid, 'owner', c.relowner, 'acl', c.relacl,
              'options', c.reloptions, 'rls', c.relrowsecurity,
              'forceRls', c.relforcerowsecurity,
              'comment', pg_catalog.obj_description(c.oid, 'pg_class')) ORDER BY c.oid)
              FROM target_relations c),
            'columns', (SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(a) ORDER BY a.attrelid, a.attnum)
              FROM pg_catalog.pg_attribute a WHERE a.attrelid = ANY(c_tables)),
            'constraints', (SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(c) ORDER BY c.oid)
              FROM pg_catalog.pg_constraint c WHERE c.conrelid = ANY(c_tables)),
            'triggers', (SELECT pg_catalog.jsonb_agg(pg_catalog.to_jsonb(t) ORDER BY t.oid)
              FROM pg_catalog.pg_trigger t WHERE t.tgrelid = ANY(c_tables)),
            'indexes', (SELECT pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
              'catalog', pg_catalog.to_jsonb(i),
              'definition', pg_catalog.pg_get_indexdef(i.indexrelid),
              'comment', pg_catalog.obj_description(i.indexrelid, 'pg_class')) ORDER BY i.indexrelid)
              FROM pg_catalog.pg_index i WHERE i.indrelid = ANY(c_tables))
          ) INTO v_identity_contract;

    IF v_phase = 0 THEN
      IF pg_catalog.encode(pg_catalog.sha256(
        pg_catalog.convert_to(v_contract::text, 'UTF8')), 'hex')
         IS DISTINCT FROM c_pre_sha256 THEN
        RAISE EXCEPTION 'S0 blocked: exact post-031 predecessor metadata differs';
      END IF;
      v_before_contract := v_contract;
      v_before_identity_contract := v_identity_contract;

      CREATE POLICY s0_boq_writer_insert
        ON public.boq AS RESTRICTIVE FOR INSERT TO authenticated
        WITH CHECK ((SELECT private.p49_current_active_role()) = ANY (ARRAY['admin', 'dept_manager', 'sector_manager', 'staff']::text[]));

      CREATE POLICY s0_boq_writer_update
        ON public.boq AS RESTRICTIVE FOR UPDATE TO authenticated
        USING ((SELECT private.p49_current_active_role()) = ANY (ARRAY['admin', 'dept_manager', 'sector_manager', 'staff']::text[]))
        WITH CHECK ((SELECT private.p49_current_active_role()) = ANY (ARRAY['admin', 'dept_manager', 'sector_manager', 'staff']::text[]));

      CREATE POLICY s0_boq_writer_delete
        ON public.boq AS RESTRICTIVE FOR DELETE TO authenticated
        USING ((SELECT private.p49_current_active_role()) = ANY (ARRAY['admin', 'dept_manager', 'sector_manager', 'staff']::text[]));

      CREATE POLICY s0_boq_routes_writer_insert
        ON public.boq_routes AS RESTRICTIVE FOR INSERT TO authenticated
        WITH CHECK ((SELECT private.p49_current_active_role()) = ANY (ARRAY['admin', 'dept_manager', 'sector_manager', 'staff']::text[]));

      CREATE POLICY s0_boq_routes_writer_update
        ON public.boq_routes AS RESTRICTIVE FOR UPDATE TO authenticated
        USING ((SELECT private.p49_current_active_role()) = ANY (ARRAY['admin', 'dept_manager', 'sector_manager', 'staff']::text[]))
        WITH CHECK ((SELECT private.p49_current_active_role()) = ANY (ARRAY['admin', 'dept_manager', 'sector_manager', 'staff']::text[]));

      CREATE POLICY s0_boq_routes_writer_delete
        ON public.boq_routes AS RESTRICTIVE FOR DELETE TO authenticated
        USING ((SELECT private.p49_current_active_role()) = ANY (ARRAY['admin', 'dept_manager', 'sector_manager', 'staff']::text[]));

      CREATE POLICY s0_boq_items_writer_insert
        ON public.boq_items AS RESTRICTIVE FOR INSERT TO authenticated
        WITH CHECK ((SELECT private.p49_current_active_role()) = ANY (ARRAY['admin', 'dept_manager', 'sector_manager', 'staff']::text[]));

      CREATE POLICY s0_boq_items_writer_update
        ON public.boq_items AS RESTRICTIVE FOR UPDATE TO authenticated
        USING ((SELECT private.p49_current_active_role()) = ANY (ARRAY['admin', 'dept_manager', 'sector_manager', 'staff']::text[]))
        WITH CHECK ((SELECT private.p49_current_active_role()) = ANY (ARRAY['admin', 'dept_manager', 'sector_manager', 'staff']::text[]));

      CREATE POLICY s0_boq_items_writer_delete
        ON public.boq_items AS RESTRICTIVE FOR DELETE TO authenticated
        USING ((SELECT private.p49_current_active_role()) = ANY (ARRAY['admin', 'dept_manager', 'sector_manager', 'staff']::text[]));
    ELSE
      IF v_contract IS DISTINCT FROM v_before_contract
         OR v_identity_contract IS DISTINCT FROM v_before_identity_contract THEN
        RAISE EXCEPTION 'S0 postcondition failed: an existing contract changed';
      END IF;
    END IF;
  END LOOP;

  SELECT pg_catalog.count(*) INTO v_guard_count
  FROM pg_catalog.pg_policy p
  WHERE p.polrelid = ANY(c_tables) AND p.polname = ANY(c_guard_names);

  IF v_guard_count IS DISTINCT FROM 9 OR EXISTS (
    SELECT 1
    FROM pg_catalog.pg_policy p
    JOIN pg_catalog.pg_class c ON c.oid = p.polrelid
    WHERE p.polrelid = ANY(c_tables) AND p.polname = ANY(c_guard_names)
      AND (
        p.polname IS DISTINCT FROM ('s0_' || c.relname || '_writer_' ||
          CASE p.polcmd WHEN 'a' THEN 'insert' WHEN 'w' THEN 'update'
                        WHEN 'd' THEN 'delete' ELSE 'unexpected' END)
        OR p.polpermissive IS DISTINCT FROM false
        OR p.polroles IS DISTINCT FROM ARRAY['authenticated'::pg_catalog.regrole::oid]
        OR p.polcmd NOT IN ('a', 'w', 'd')
        OR CASE WHEN p.polcmd IN ('w', 'd') THEN
          pg_catalog.regexp_replace(pg_catalog.pg_get_expr(p.polqual, p.polrelid),
            '[[:space:]]', '', 'g') IS DISTINCT FROM
          pg_catalog.regexp_replace(c_expected_predicate, '[[:space:]]', '', 'g')
          ELSE p.polqual IS NOT NULL END
        OR CASE WHEN p.polcmd IN ('a', 'w') THEN
          pg_catalog.regexp_replace(pg_catalog.pg_get_expr(p.polwithcheck, p.polrelid),
            '[[:space:]]', '', 'g') IS DISTINCT FROM
          pg_catalog.regexp_replace(c_expected_predicate, '[[:space:]]', '', 'g')
          ELSE p.polwithcheck IS NOT NULL END
      )
  ) THEN
    RAISE EXCEPTION 'S0 postcondition failed: exact nine writer guards not present';
  END IF;
END;
$s0_boq_writer_boundary$;

COMMIT;
