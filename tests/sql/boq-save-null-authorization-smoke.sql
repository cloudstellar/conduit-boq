\set ON_ERROR_STOP on
-- psql -v test_mode=baseline|fixed -f tests/sql/boq-save-null-authorization-smoke.sql
-- ONLY for the synthetic empty fixture from boq-save-null-authorization-fixture.sql.
-- Every case runs the actual captured/repaired Save RPC as an API SQL role.
-- Its temporary BOQs/profiles/prices and successful writes are rolled back per
-- case; this complete script then rolls back its result/helper tables as well.
-- No real identities, JWT verification, network, UI, or full RLS parity claimed.
\if :{?test_mode}
\else
  \echo 'test_mode must be supplied as baseline or fixed'
  \quit 2
\endif
BEGIN;
SELECT set_config('qa.boq_save_null_auth_mode', :'test_mode', true);
DO $test_preflight$
DECLARE
  v_mode text := current_setting('qa.boq_save_null_auth_mode');
  v_expected text;
BEGIN
  IF current_database() !~ '^conduit_boq_save_null_auth_[a-z0-9_]+$'
     OR session_user <> 'postgres' OR current_user <> 'postgres' THEN
    RAISE EXCEPTION 'Refusing a non-isolated target';
  END IF;
  IF v_mode NOT IN ('baseline', 'fixed') THEN
    RAISE EXCEPTION 'test_mode must be baseline or fixed';
  END IF;
  v_expected := CASE v_mode
    WHEN 'baseline' THEN 'aefe5097626539b83f02d418cbc6fe1ca4d2ad195e927d987f174c5e7701c9e9'
    ELSE '929466b05250a96e3c5ff20c90d99d7d0da415b8cd021a19c1069396c8c06506' END;
  IF encode(sha256(convert_to(pg_get_functiondef(
       'public.save_boq_with_routes(uuid,jsonb,jsonb)'::regprocedure), 'UTF8')), 'hex')
     <> v_expected THEN
    RAISE EXCEPTION 'Save function does not match the expected % test definition', v_mode;
  END IF;
  IF (SELECT count(*) FROM public.boq) <> 0
     OR (SELECT count(*) FROM public.boq_routes) <> 0
     OR (SELECT count(*) FROM public.boq_items) <> 0
     OR (SELECT count(*) FROM public.price_list) <> 0
     OR (SELECT count(*) FROM public.user_profiles) <> 0 THEN
    RAISE EXCEPTION 'This test requires its empty synthetic fixture, not existing app data';
  END IF;
  IF NOT has_function_privilege('authenticated', 'public.save_boq_with_routes(uuid,jsonb,jsonb)', 'EXECUTE')
     OR has_function_privilege('anon', 'public.save_boq_with_routes(uuid,jsonb,jsonb)', 'EXECUTE')
     OR has_function_privilege('service_role', 'public.save_boq_with_routes(uuid,jsonb,jsonb)', 'EXECUTE') THEN
    RAISE EXCEPTION 'Unexpected Save API execute privileges';
  END IF;
END;
$test_preflight$;

CREATE TEMP TABLE save_cases (ordinal integer GENERATED ALWAYS AS IDENTITY, spec jsonb NOT NULL);
CREATE TEMP TABLE save_results (
  name text NOT NULL, allowed boolean NOT NULL, sqlstate text, baseline_bypass boolean NOT NULL
);

CREATE FUNCTION pg_temp.fixture_snapshot(p_exclude_boq uuid DEFAULT NULL) RETURNS jsonb
LANGUAGE sql SECURITY INVOKER AS $snapshot$
SELECT jsonb_build_object(
  'boq', (SELECT coalesce(jsonb_agg(to_jsonb(b) ORDER BY b.id), '[]') FROM public.boq b
    WHERE p_exclude_boq IS NULL OR b.id <> p_exclude_boq),
  'routes', (SELECT coalesce(jsonb_agg(to_jsonb(r) ORDER BY r.id), '[]') FROM public.boq_routes r
    WHERE p_exclude_boq IS NULL OR r.boq_id <> p_exclude_boq),
  'items', (SELECT coalesce(jsonb_agg(to_jsonb(i) ORDER BY i.id), '[]') FROM public.boq_items i
    WHERE p_exclude_boq IS NULL OR i.boq_id <> p_exclude_boq),
  'profiles', (SELECT coalesce(jsonb_agg(to_jsonb(p) ORDER BY p.id), '[]') FROM public.user_profiles p),
  'prices', (SELECT coalesce(jsonb_agg(to_jsonb(p) ORDER BY p.id), '[]') FROM public.price_list p)
);
$snapshot$;

CREATE FUNCTION pg_temp.run_save_case(p_case jsonb, p_mode text) RETURNS void
LANGUAGE plpgsql SECURITY INVOKER AS $case$
DECLARE
  v_case jsonb := '{"role":"staff","status":"active","owner":"other","assignee":"other","actor_sector":"a","actor_department":"a","boq_sector":"a","boq_department":"a","allow":false,"has_profile":true,"claim":true,"factor_bound":true,"db_role":"authenticated","error_code":"42501"}'::jsonb || p_case;
  v_actor constant uuid := '11111111-1111-4111-8111-111111111111';
  v_other constant uuid := '22222222-2222-4222-8222-222222222222';
  v_target constant uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
  v_sentinel constant uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2';
  v_route constant uuid := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1';
  v_item constant uuid := 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1';
  v_price constant uuid := 'dddddddd-dddd-4ddd-8ddd-ddddddddddd1';
  v_other_price constant uuid := 'dddddddd-dddd-4ddd-8ddd-ddddddddddd2';
  v_catalog constant uuid := 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee1';
  v_factor constant uuid := 'ffffffff-ffff-4fff-8fff-fffffffffff1';
  v_dept_a constant uuid := '10000000-0000-4000-8000-000000000001';
  v_dept_b constant uuid := '10000000-0000-4000-8000-000000000002';
  v_sector_a constant uuid := '20000000-0000-4000-8000-000000000001';
  v_sector_b constant uuid := '20000000-0000-4000-8000-000000000002';
  v_graph_before jsonb;
  v_other_before jsonb;
  v_header_before jsonb;
  v_header_after jsonb;
  v_item_after public.boq_items%ROWTYPE;
  v_route_after public.boq_routes%ROWTYPE;
  v_data jsonb;
  v_rows jsonb;
  v_item_request jsonb;
  v_result jsonb;
  v_allowed boolean := false;
  v_error text;
  v_error_message text;
  v_expected boolean := (v_case->>'allow')::boolean
    OR (p_mode = 'baseline' AND coalesce((v_case->>'baseline_bypass')::boolean, false));
  v_expected_item_name text := 'Synthetic catalog item' || coalesce(v_case->>'suffix', '');
  v_mutable_header text[];
BEGIN
  IF v_case->>'db_role' NOT IN ('authenticated', 'anon', 'service_role') THEN
    RAISE EXCEPTION 'Unexpected API test role';
  END IF;
  -- This nested block is deliberately rolled back even when the tested Save
  -- succeeds. Local PL/pgSQL outcome variables survive that rollback.
  BEGIN
    IF (v_case->>'has_profile')::boolean THEN
      INSERT INTO public.user_profiles(id, role, status, department_id, sector_id)
      VALUES (v_actor, v_case->>'role', v_case->>'status',
        CASE v_case->>'actor_department' WHEN 'a' THEN v_dept_a WHEN 'b' THEN v_dept_b END,
        CASE v_case->>'actor_sector' WHEN 'a' THEN v_sector_a WHEN 'b' THEN v_sector_b END);
    END IF;
    INSERT INTO public.price_list(id, version_id, item_name, unit, material_cost, labor_cost, unit_cost, category)
    VALUES
      (v_price, v_catalog, 'Synthetic catalog item', 'unit', 30, 20, 50, 'Synthetic category'),
      (v_other_price, 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee2', 'Other version item', 'unit', 30, 20, 50, 'Other category');
    INSERT INTO public.boq(id, estimator_name, document_date, project_name, route, department,
      created_by, assigned_to, department_id, sector_id, price_list_version_id, factor_reference_version_id,
      total_material_cost, total_labor_cost, total_cost, factor_f, total_with_factor_f, total_with_vat,
      factor_f_raw, factor_f_lower_cost, factor_f_upper_cost, factor_f_lower_value, factor_f_upper_value)
    VALUES (v_target, 'Original estimator', '2026-09-08', 'Original target', 'Original route', 'Original department',
      CASE v_case->>'owner' WHEN 'actor' THEN v_actor WHEN 'other' THEN v_other END,
      CASE v_case->>'assignee' WHEN 'actor' THEN v_actor WHEN 'other' THEN v_other END,
      CASE v_case->>'boq_department' WHEN 'a' THEN v_dept_a WHEN 'b' THEN v_dept_b END,
      CASE v_case->>'boq_sector' WHEN 'a' THEN v_sector_a WHEN 'b' THEN v_sector_b END,
      v_catalog, CASE WHEN (v_case->>'factor_bound')::boolean THEN v_factor END,
      60, 40, 100, 1.1, 110, 117.7, 1.1, 5000000, 5000000, 1.1, 1.1);
    INSERT INTO public.boq(id, estimator_name, project_name, created_by, price_list_version_id, factor_reference_version_id)
    VALUES (v_sentinel, 'Sentinel estimator', 'Untouched sentinel', v_other, v_catalog, v_factor);
    INSERT INTO public.boq_routes(id, boq_id, route_order, route_name, total_material_cost, total_labor_cost, total_cost)
    VALUES (v_route, v_target, 1, 'Original route', 60, 40, 100),
      ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', v_sentinel, 1, 'Sentinel route', 30, 20, 50);
    INSERT INTO public.boq_items(id, boq_id, route_id, item_order, price_list_id, item_name, quantity, unit,
      material_cost_per_unit, labor_cost_per_unit, unit_cost, total_material_cost, total_labor_cost, total_cost, category)
    VALUES (v_item, v_target, v_route, 1, v_price, 'Synthetic catalog item', 2, 'unit', 30, 20, 50, 60, 40, 100, 'Synthetic category'),
      ('cccccccc-cccc-4ccc-8ccc-ccccccccccc2', v_sentinel, 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 1,
       v_price, 'Synthetic catalog item', 1, 'unit', 30, 20, 50, 30, 20, 50, 'Synthetic category');
    v_graph_before := pg_temp.fixture_snapshot();
    v_other_before := pg_temp.fixture_snapshot(v_target);
    SELECT to_jsonb(b) INTO v_header_before FROM public.boq b WHERE b.id = v_target;
    v_data := '{"estimator_name":"Updated estimator","document_date":"2026-09-09","project_name":"Updated target","route":"Saved route","construction_area":"Synthetic area","department":"Updated department","total_material_cost":127.5,"total_labor_cost":85,"total_cost":212.5,"factor_f":1.1,"total_with_factor_f":233.75,"total_with_vat":250.11,"factor_f_raw":1.1,"factor_f_lower_cost":5000000,"factor_f_upper_cost":5000000,"factor_f_lower_value":1.1,"factor_f_upper_value":1.1}'::jsonb;
    -- Forged input unit/prices/category/amounts must be ignored for catalog rows.
    v_item_request := jsonb_build_object('item_order', 7, 'price_list_id', v_price,
      'item_name', v_expected_item_name, 'quantity', 4.25, 'unit', 'forged',
      'material_cost_per_unit', 999, 'labor_cost_per_unit', 999, 'unit_cost', 1998,
      'total_material_cost', 999, 'total_labor_cost', 999, 'total_cost', 1998,
      'remarks', 'Preserved request remark', 'category', 'forged category');
    CASE v_case->>'payload_case'
      WHEN 'wrong_name' THEN v_item_request := v_item_request || '{"item_name":"Not the catalog name"}'::jsonb;
      WHEN 'wrong_version' THEN v_item_request := v_item_request || jsonb_build_object('price_list_id', v_other_price);
      WHEN 'invalid_quantity' THEN v_item_request := v_item_request || '{"quantity":"5x2"}'::jsonb;
      WHEN 'blank_name' THEN v_item_request := v_item_request || '{"item_name":"   "}'::jsonb;
      ELSE NULL;
    END CASE;
    v_rows := jsonb_build_array(jsonb_build_object('route_name', 'Saved route',
      'route_description', 'Saved description', 'construction_area', 'Synthetic area',
      'total_material_cost', 127.5, 'total_labor_cost', 85, 'total_cost', 212.5,
      'items', jsonb_build_array(v_item_request)));

    PERFORM set_config('request.jwt.claim.sub', CASE WHEN (v_case->>'claim')::boolean THEN v_actor::text ELSE '' END, true);
    EXECUTE format('SET LOCAL ROLE %I', v_case->>'db_role');
    IF current_user <> v_case->>'db_role' THEN
      RAISE EXCEPTION 'Save was not attempted under the intended API role';
    END IF;
    IF current_user = 'authenticated' THEN
      IF (SELECT count(*) FROM public.boq) <> 0 THEN
        RAISE EXCEPTION 'The synthetic API role unexpectedly bypasses table RLS';
      END IF;
    END IF;
    BEGIN
      v_result := public.save_boq_with_routes(v_target, v_data, v_rows);
      v_allowed := true;
    EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_error = RETURNED_SQLSTATE, v_error_message = MESSAGE_TEXT;
    END;
    RESET ROLE;
    IF current_user <> 'postgres' THEN
      RAISE EXCEPTION 'Test failed to return to its isolated assertion role';
    END IF;
    IF v_allowed IS DISTINCT FROM v_expected THEN
      RAISE EXCEPTION 'Case %: expected allowed %, observed %; SQLSTATE %, message %',
        v_case->>'name', v_expected, v_allowed, v_error, v_error_message;
    END IF;
    IF NOT v_allowed THEN
      IF v_error IS DISTINCT FROM v_case->>'error_code' THEN
        RAISE EXCEPTION 'Case %: expected SQLSTATE %, got % (%)',
          v_case->>'name', v_case->>'error_code', v_error, v_error_message;
      END IF;
      IF pg_temp.fixture_snapshot() IS DISTINCT FROM v_graph_before THEN
        RAISE EXCEPTION 'Denied case % changed the fixture graph', v_case->>'name';
      END IF;
    ELSE
      IF v_result IS DISTINCT FROM jsonb_build_object('success', true, 'boq_id', v_target) THEN
        RAISE EXCEPTION 'Allowed case % returned the wrong success receipt', v_case->>'name';
      END IF;
      IF pg_temp.fixture_snapshot(v_target) IS DISTINCT FROM v_other_before THEN
        RAISE EXCEPTION 'Allowed case % changed unrelated graph/profile/reference data', v_case->>'name';
      END IF;
      SELECT to_jsonb(b) INTO v_header_after FROM public.boq b WHERE b.id = v_target;
      SELECT array_agg(k) || ARRAY['updated_at'] INTO v_mutable_header FROM jsonb_object_keys(v_data) AS keys(k);
      IF NOT (v_header_after @> v_data)
         OR (v_header_after - v_mutable_header) IS DISTINCT FROM (v_header_before - v_mutable_header) THEN
        RAISE EXCEPTION 'Allowed case % changed header totals/metadata/ownership/bindings unexpectedly', v_case->>'name';
      END IF;
      IF (SELECT count(*) FROM public.boq_routes WHERE boq_id = v_target) <> 1
         OR (SELECT count(*) FROM public.boq_items WHERE boq_id = v_target) <> 1 THEN
        RAISE EXCEPTION 'Allowed case % produced an incomplete graph', v_case->>'name';
      END IF;
      SELECT * INTO STRICT v_route_after FROM public.boq_routes WHERE boq_id = v_target;
      SELECT * INTO STRICT v_item_after FROM public.boq_items WHERE boq_id = v_target;
      IF v_route_after.id = v_route OR v_item_after.id = v_item
         OR v_route_after.route_order IS DISTINCT FROM 1 OR v_route_after.route_name IS DISTINCT FROM 'Saved route'
         OR v_route_after.route_description IS DISTINCT FROM 'Saved description'
         OR v_route_after.construction_area IS DISTINCT FROM 'Synthetic area'
         OR v_route_after.total_material_cost IS DISTINCT FROM 127.5 OR v_route_after.total_labor_cost IS DISTINCT FROM 85
         OR v_route_after.total_cost IS DISTINCT FROM 212.5 THEN
        RAISE EXCEPTION 'Allowed case % did not replace/save the route correctly', v_case->>'name';
      END IF;
      IF v_item_after.route_id IS DISTINCT FROM v_route_after.id
         OR v_item_after.price_list_id IS DISTINCT FROM v_price OR v_item_after.item_order IS DISTINCT FROM 7
         OR v_item_after.item_name IS DISTINCT FROM v_expected_item_name
         OR v_item_after.quantity IS DISTINCT FROM 4.25 OR v_item_after.unit IS DISTINCT FROM 'unit'
         OR v_item_after.material_cost_per_unit IS DISTINCT FROM 30 OR v_item_after.labor_cost_per_unit IS DISTINCT FROM 20
         OR v_item_after.unit_cost IS DISTINCT FROM 50 OR v_item_after.total_material_cost IS DISTINCT FROM 127.5
         OR v_item_after.total_labor_cost IS DISTINCT FROM 85 OR v_item_after.total_cost IS DISTINCT FROM 212.5
         OR v_item_after.category IS DISTINCT FROM 'Synthetic category'
         OR v_item_after.remarks IS DISTINCT FROM 'Preserved request remark' THEN
        RAISE EXCEPTION 'Allowed case % did not preserve catalog authority/quantity/totals', v_case->>'name';
      END IF;
    END IF;
    RAISE EXCEPTION USING ERRCODE = 'ZX001', MESSAGE = 'Rollback this successful assertion and all synthetic case writes';
  EXCEPTION WHEN SQLSTATE 'ZX001' THEN NULL;
  END;
  INSERT INTO pg_temp.save_results(name, allowed, sqlstate, baseline_bypass)
  VALUES (v_case->>'name', v_allowed, v_error, coalesce((v_case->>'baseline_bypass')::boolean, false));
END;
$case$;

INSERT INTO save_cases(spec) VALUES
  ('{"name":"staff unrelated owner + NULL assignee","assignee":null,"baseline_bypass":true}'::jsonb),
  ('{"name":"sector manager + NULL BOQ sector","role":"sector_manager","boq_sector":null,"baseline_bypass":true}'::jsonb),
  ('{"name":"department manager + NULL BOQ department","role":"dept_manager","boq_department":null,"baseline_bypass":true}'::jsonb),
  ('{"name":"staff owner + NULL assignee","owner":"actor","assignee":null,"allow":true}'::jsonb),
  ('{"name":"staff owner + unrelated assignee","owner":"actor","allow":true}'::jsonb),
  ('{"name":"staff owner and assignee","owner":"actor","assignee":"actor","allow":true}'::jsonb),
  ('{"name":"staff assigned to unrelated owner","assignee":"actor","allow":true}'::jsonb),
  ('{"name":"staff unrelated owner and assignee"}'::jsonb),
  ('{"name":"staff same hierarchy without ownership"}'::jsonb),
  ('{"name":"staff unrelated owner and assignee without profile hierarchy","assignee":"other","actor_sector":null,"actor_department":null}'::jsonb),
  ('{"name":"staff assigned legacy still denied","owner":null,"assignee":"actor","error_code":"P0001"}'::jsonb),
  ('{"name":"staff unassigned legacy denied","owner":null,"assignee":null,"error_code":"P0001"}'::jsonb),
  ('{"name":"admin unrelated owner + NULL assignee","role":"admin","assignee":null,"allow":true}'::jsonb),
  ('{"name":"admin legacy and NULL scopes","role":"admin","owner":null,"assignee":null,"boq_sector":null,"boq_department":null,"actor_sector":null,"actor_department":null,"allow":true}'::jsonb),
  ('{"name":"admin unrelated scopes","role":"admin","boq_sector":"b","boq_department":"b","allow":true}'::jsonb),
  ('{"name":"sector manager same non-NULL sector","role":"sector_manager","allow":true}'::jsonb),
  ('{"name":"sector manager same sector without department","role":"sector_manager","actor_department":null,"boq_department":null,"allow":true}'::jsonb),
  ('{"name":"sector manager owner outside sector denied","role":"sector_manager","owner":"actor","boq_sector":"b"}'::jsonb),
  ('{"name":"sector manager assigned outside sector denied","role":"sector_manager","assignee":"actor","boq_sector":"b"}'::jsonb),
  ('{"name":"sector manager unrelated non-NULL sector","role":"sector_manager","boq_sector":"b"}'::jsonb),
  ('{"name":"sector manager missing own sector","role":"sector_manager","actor_sector":null}'::jsonb),
  ('{"name":"sector manager both sectors NULL","role":"sector_manager","actor_sector":null,"boq_sector":null}'::jsonb),
  ('{"name":"sector manager legacy same sector denied","role":"sector_manager","owner":null,"error_code":"P0001"}'::jsonb),
  ('{"name":"department manager same non-NULL department","role":"dept_manager","allow":true}'::jsonb),
  ('{"name":"department manager same department without sector","role":"dept_manager","actor_sector":null,"boq_sector":null,"allow":true}'::jsonb),
  ('{"name":"department manager owner outside department denied","role":"dept_manager","owner":"actor","boq_department":"b"}'::jsonb),
  ('{"name":"department manager assigned outside department denied","role":"dept_manager","assignee":"actor","boq_department":"b"}'::jsonb),
  ('{"name":"department manager unrelated non-NULL department","role":"dept_manager","boq_department":"b"}'::jsonb),
  ('{"name":"department manager missing own department","role":"dept_manager","actor_department":null}'::jsonb),
  ('{"name":"department manager both departments NULL","role":"dept_manager","actor_department":null,"boq_department":null}'::jsonb),
  ('{"name":"department manager legacy same department denied","role":"dept_manager","owner":null,"error_code":"P0001"}'::jsonb),
  ('{"name":"procurement owner denied","role":"procurement","owner":"actor"}'::jsonb),
  ('{"name":"procurement assignee denied","role":"procurement","assignee":"actor"}'::jsonb),
  ('{"name":"procurement NULL scopes denied","role":"procurement","boq_sector":null,"boq_department":null,"actor_sector":null,"actor_department":null}'::jsonb),
  ('{"name":"procurement legacy denied","role":"procurement","owner":null,"error_code":"P0001"}'::jsonb),
  ('{"name":"pending admin own BOQ denied","role":"admin","status":"pending","owner":"actor","assignee":"actor"}'::jsonb),
  ('{"name":"pending staff own BOQ denied","role":"staff","status":"pending","owner":"actor","assignee":"actor"}'::jsonb),
  ('{"name":"pending sector_manager own BOQ denied","role":"sector_manager","status":"pending","owner":"actor","assignee":"actor"}'::jsonb),
  ('{"name":"pending dept_manager own BOQ denied","role":"dept_manager","status":"pending","owner":"actor","assignee":"actor"}'::jsonb),
  ('{"name":"pending procurement own BOQ denied","role":"procurement","status":"pending","owner":"actor","assignee":"actor"}'::jsonb),
  ('{"name":"inactive admin own BOQ denied","role":"admin","status":"inactive","owner":"actor","assignee":"actor"}'::jsonb),
  ('{"name":"inactive staff own BOQ denied","role":"staff","status":"inactive","owner":"actor","assignee":"actor"}'::jsonb),
  ('{"name":"inactive sector_manager own BOQ denied","role":"sector_manager","status":"inactive","owner":"actor","assignee":"actor"}'::jsonb),
  ('{"name":"inactive dept_manager own BOQ denied","role":"dept_manager","status":"inactive","owner":"actor","assignee":"actor"}'::jsonb),
  ('{"name":"inactive procurement own BOQ denied","role":"procurement","status":"inactive","owner":"actor","assignee":"actor"}'::jsonb),
  ('{"name":"suspended admin own BOQ denied","role":"admin","status":"suspended","owner":"actor","assignee":"actor"}'::jsonb),
  ('{"name":"suspended staff own BOQ denied","role":"staff","status":"suspended","owner":"actor","assignee":"actor"}'::jsonb),
  ('{"name":"suspended sector_manager own BOQ denied","role":"sector_manager","status":"suspended","owner":"actor","assignee":"actor"}'::jsonb),
  ('{"name":"suspended dept_manager own BOQ denied","role":"dept_manager","status":"suspended","owner":"actor","assignee":"actor"}'::jsonb),
  ('{"name":"suspended procurement own BOQ denied","role":"procurement","status":"suspended","owner":"actor","assignee":"actor"}'::jsonb),
  ('{"name":"missing current profile denied","has_profile":false}'::jsonb),
  ('{"name":"authenticated without uid denied","claim":false,"role":"admin","owner":"actor"}'::jsonb),
  ('{"name":"anonymous SQL role cannot execute","db_role":"anon","role":"admin","owner":"actor"}'::jsonb),
  ('{"name":"service SQL role cannot execute","db_role":"service_role","role":"admin","owner":"actor"}'::jsonb),
  ('{"name":"wrong catalog name rolls full Save back","owner":"actor","payload_case":"wrong_name","error_code":"P0001"}'::jsonb),
  ('{"name":"wrong catalog version rolls full Save back","owner":"actor","payload_case":"wrong_version","error_code":"P0001"}'::jsonb),
  ('{"name":"invalid quantity cast rolls full Save back","owner":"actor","payload_case":"invalid_quantity","error_code":"22P02"}'::jsonb),
  ('{"name":"permitted catalog suffix (Main Duct)","owner":"actor","suffix":" (Main Duct)","allow":true}'::jsonb),
  ('{"name":"permitted catalog suffix (Riser)","owner":"actor","suffix":" (Riser)","allow":true}'::jsonb),
  ('{"name":"permitted catalog suffix (Steel Pole)","owner":"actor","suffix":" (Steel Pole)","allow":true}'::jsonb),
  ('{"name":"permitted catalog suffix (Riser Service)","owner":"actor","suffix":" (Riser Service)","allow":true}'::jsonb),
  ('{"name":"blank catalog name uses canonical name","owner":"actor","payload_case":"blank_name","allow":true}'::jsonb),
  ('{"name":"staff owner preserves legacy Factor-unbound header","owner":"actor","factor_bound":false,"allow":true}'::jsonb);
DO $run_matrix$
DECLARE v_case record;
BEGIN
  FOR v_case IN SELECT spec FROM pg_temp.save_cases ORDER BY ordinal LOOP
    PERFORM pg_temp.run_save_case(v_case.spec, current_setting('qa.boq_save_null_auth_mode'));
  END LOOP;
  IF (SELECT count(*) FROM pg_temp.save_results) <> (SELECT count(*) FROM pg_temp.save_cases)
     OR (SELECT count(*) FROM pg_temp.save_results WHERE baseline_bypass) <> 3 THEN
    RAISE EXCEPTION 'The complete authorization matrix was not executed';
  END IF;
  IF current_setting('qa.boq_save_null_auth_mode') = 'baseline'
     AND (SELECT count(*) FROM pg_temp.save_results WHERE baseline_bypass AND allowed) <> 3 THEN
    RAISE EXCEPTION 'The three captured-predecessor NULL bypasses were not demonstrated';
  END IF;
  IF current_setting('qa.boq_save_null_auth_mode') = 'fixed'
     AND EXISTS (SELECT FROM pg_temp.save_results WHERE baseline_bypass AND allowed) THEN
    RAISE EXCEPTION 'A repaired NULL scope still bypassed authorization';
  END IF;
  IF (SELECT count(*) FROM public.boq) <> 0 OR (SELECT count(*) FROM public.boq_routes) <> 0
     OR (SELECT count(*) FROM public.boq_items) <> 0 OR (SELECT count(*) FROM public.user_profiles) <> 0
     OR (SELECT count(*) FROM public.price_list) <> 0 THEN
    RAISE EXCEPTION 'A smoke case left durable synthetic rows';
  END IF;
END;
$run_matrix$;
SELECT 'BOQ_SAVE_NULL_AUTH_' || upper(current_setting('qa.boq_save_null_auth_mode')) || '_PASS' AS result,
  count(*) AS cases, count(*) FILTER (WHERE allowed) AS allowed,
  count(*) FILTER (WHERE NOT allowed) AS denied,
  count(*) FILTER (WHERE baseline_bypass AND allowed) AS observed_baseline_bypasses
FROM pg_temp.save_results;
ROLLBACK;
