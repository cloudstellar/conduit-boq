\set ON_ERROR_STOP on

-- Run only against a disposable, post-029 Local database. The transaction is
-- rolled back so the fixtures and copied BOQs never become durable.
BEGIN;

-- A real post-027 chain has two bounded profile triggers: auth signup creates
-- the pending profile, and the profile guard rejects direct authority edits.
-- Disable only those exact triggers while seeding this disposable fixture,
-- then restore them before any RPC call. The outer rollback is a second guard.
DO $disable_fixture_profile_triggers$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_trigger trigger_row
    WHERE trigger_row.tgrelid = 'auth.users'::regclass
      AND trigger_row.tgname = 'on_auth_user_created'
      AND NOT trigger_row.tgisinternal
  ) THEN
    EXECUTE 'ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_trigger trigger_row
    WHERE trigger_row.tgrelid = 'public.user_profiles'::regclass
      AND trigger_row.tgname = 'trg_p49_guard_user_profile_mutation'
      AND NOT trigger_row.tgisinternal
  ) THEN
    EXECUTE 'ALTER TABLE public.user_profiles DISABLE TRIGGER trg_p49_guard_user_profile_mutation';
  END IF;
END;
$disable_fixture_profile_triggers$;

INSERT INTO auth.users (id, email)
VALUES
  (
    '11111111-1111-4111-8111-111111111111',
    'atomic-copy-smoke@ntplc.co.th'
  ),
  (
    '61616161-6161-4161-8161-616161616161',
    'atomic-copy-admin@ntplc.co.th'
  ),
  (
    '62626262-6262-4262-8262-626262626262',
    'atomic-copy-shared@ntplc.co.th'
  ),
  (
    '63636363-6363-4363-8363-636363636363',
    'atomic-copy-procurement@ntplc.co.th'
  ),
  (
    '64646464-6464-4464-8464-646464646464',
    'atomic-copy-outsider@ntplc.co.th'
  ),
  (
    '69696969-6969-4969-8969-696969696969',
    'atomic-copy-sector-manager@ntplc.co.th'
  ),
  (
    '70707070-7070-4070-8070-707070707070',
    'atomic-copy-dept-manager@ntplc.co.th'
  ),
  (
    '71717171-7171-4171-8171-717171717171',
    'atomic-copy-pending@ntplc.co.th'
  ),
  (
    '72727272-7272-4272-8272-727272727272',
    'atomic-copy-inactive@ntplc.co.th'
  );

INSERT INTO public.organizations (id, name, code)
VALUES
  ('41414141-4141-4141-8141-414141414141', 'องค์กร A', 'ATOMIC-A'),
  ('51515151-5151-4151-8151-515151515151', 'องค์กร B', 'ATOMIC-B');

INSERT INTO public.departments (id, org_id, code, name)
VALUES
  (
    '42424242-4242-4242-8242-424242424242',
    '41414141-4141-4141-8141-414141414141',
    'ATOMIC-A-DEPT',
    'ฝ่าย A'
  ),
  (
    '52525252-5252-4252-8252-525252525252',
    '51515151-5151-4151-8151-515151515151',
    'ATOMIC-B-DEPT',
    'ฝ่าย B'
  );

INSERT INTO public.sectors (id, department_id, code, name)
VALUES
  (
    '43434343-4343-4343-8343-434343434343',
    '42424242-4242-4242-8242-424242424242',
    'ATOMIC-A-SECTOR',
    'ส่วน A'
  ),
  (
    '53535353-5353-4353-8353-535353535353',
    '52525252-5252-4252-8252-525252525252',
    'ATOMIC-B-SECTOR',
    'ส่วน B'
  );

INSERT INTO public.user_profiles (
  id,
  title,
  first_name,
  last_name,
  role,
  status,
  email,
  org_id,
  department_id,
  sector_id,
  onboarding_completed
) VALUES
  (
    '11111111-1111-4111-8111-111111111111',
    'นาย',
    'ทดสอบ',
    'คัดลอก',
    'staff',
    'active',
    'atomic-copy-smoke@ntplc.co.th',
    '41414141-4141-4141-8141-414141414141',
    '42424242-4242-4242-8242-424242424242',
    '43434343-4343-4343-8343-434343434343',
    true
  ),
  (
    '61616161-6161-4161-8161-616161616161',
    'นาง',
    'แอดมิน',
    'ทดสอบ',
    'admin',
    'active',
    'atomic-copy-admin@ntplc.co.th',
    '51515151-5151-4151-8151-515151515151',
    '52525252-5252-4252-8252-525252525252',
    '53535353-5353-4353-8353-535353535353',
    true
  ),
  (
    '62626262-6262-4262-8262-626262626262',
    'นาย',
    'ผู้รับมอบหมาย',
    'ทดสอบ',
    'staff',
    'active',
    'atomic-copy-shared@ntplc.co.th',
    '51515151-5151-4151-8151-515151515151',
    '52525252-5252-4252-8252-525252525252',
    '53535353-5353-4353-8353-535353535353',
    true
  ),
  (
    '63636363-6363-4363-8363-636363636363',
    'นาย',
    'จัดซื้อ',
    'ทดสอบ',
    'procurement',
    'active',
    'atomic-copy-procurement@ntplc.co.th',
    '41414141-4141-4141-8141-414141414141',
    '42424242-4242-4242-8242-424242424242',
    '43434343-4343-4343-8343-434343434343',
    true
  ),
  (
    '64646464-6464-4464-8464-646464646464',
    'นาย',
    'ต่างองค์กร',
    'ทดสอบ',
    'staff',
    'active',
    'atomic-copy-outsider@ntplc.co.th',
    '51515151-5151-4151-8151-515151515151',
    '52525252-5252-4252-8252-525252525252',
    '53535353-5353-4353-8353-535353535353',
    true
  ),
  (
    '69696969-6969-4969-8969-696969696969',
    'นาย',
    'ผู้จัดการส่วน',
    'ทดสอบ',
    'sector_manager',
    'active',
    'atomic-copy-sector-manager@ntplc.co.th',
    '41414141-4141-4141-8141-414141414141',
    '42424242-4242-4242-8242-424242424242',
    '43434343-4343-4343-8343-434343434343',
    true
  ),
  (
    '70707070-7070-4070-8070-707070707070',
    'นาง',
    'ผู้จัดการฝ่าย',
    'ทดสอบ',
    'dept_manager',
    'active',
    'atomic-copy-dept-manager@ntplc.co.th',
    '41414141-4141-4141-8141-414141414141',
    '42424242-4242-4242-8242-424242424242',
    NULL,
    true
  ),
  (
    '71717171-7171-4171-8171-717171717171',
    'นาย',
    'รออนุมัติ',
    'ทดสอบ',
    'staff',
    'pending',
    'atomic-copy-pending@ntplc.co.th',
    '41414141-4141-4141-8141-414141414141',
    '42424242-4242-4242-8242-424242424242',
    '43434343-4343-4343-8343-434343434343',
    true
  ),
  (
    '72727272-7272-4272-8272-727272727272',
    'นาย',
    'หยุดใช้งาน',
    'ทดสอบ',
    'staff',
    'inactive',
    'atomic-copy-inactive@ntplc.co.th',
    '41414141-4141-4141-8141-414141414141',
    '42424242-4242-4242-8242-424242424242',
    '43434343-4343-4343-8343-434343434343',
    true
  );

DO $enable_fixture_profile_triggers$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_trigger trigger_row
    WHERE trigger_row.tgrelid = 'auth.users'::regclass
      AND trigger_row.tgname = 'on_auth_user_created'
      AND NOT trigger_row.tgisinternal
  ) THEN
    EXECUTE 'ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_trigger trigger_row
    WHERE trigger_row.tgrelid = 'public.user_profiles'::regclass
      AND trigger_row.tgname = 'trg_p49_guard_user_profile_mutation'
      AND NOT trigger_row.tgisinternal
  ) THEN
    EXECUTE 'ALTER TABLE public.user_profiles ENABLE TRIGGER trg_p49_guard_user_profile_mutation';
  END IF;
END;
$enable_fixture_profile_triggers$;

-- The disposable fixture needs one issued Catalog identity but does not replay
-- the governed Catalog draft/publish workflow. Disable only this table's user
-- lifecycle triggers while seeding, then restore them before the RPC calls.
ALTER TABLE public.price_list_versions DISABLE TRIGGER USER;

INSERT INTO public.price_list_versions (
  id,
  major,
  minor,
  patch,
  name,
  status,
  is_default,
  target_major,
  target_minor,
  target_patch
) VALUES (
  '22222222-2222-4222-8222-222222222222',
  9999,
  0,
  0,
  'Atomic copy smoke Catalog',
  'active',
  false,
  9999,
  0,
  0
);

ALTER TABLE public.price_list_versions ENABLE TRIGGER USER;

-- Seed one fully governed Catalog-backed snapshot so the runtime suite covers
-- version binding plus exact name/unit/price/category compatibility. Disable
-- only price-row lifecycle triggers while constructing this disposable issued
-- fixture, then restore them before every RPC call.
INSERT INTO public.catalog_item_identities (id, created_by)
VALUES (
  '32323232-3232-4232-8232-323232323232',
  '11111111-1111-4111-8111-111111111111'
);

INSERT INTO public.catalog_item_codes (
  item_code,
  identity_id,
  code_kind,
  first_seen_version_id,
  created_by
) VALUES (
  'ITEM-9999',
  '32323232-3232-4232-8232-323232323232',
  'legacy',
  '22222222-2222-4222-8222-222222222222',
  '11111111-1111-4111-8111-111111111111'
);

INSERT INTO public.price_list_categories (
  id,
  version_id,
  code,
  name,
  display_order
) VALUES (
  '34343434-3434-4434-8434-343434343434',
  '22222222-2222-4222-8222-222222222222',
  'SMOKE',
  'หมวดทดสอบ',
  1
);

ALTER TABLE public.price_list DISABLE TRIGGER USER;

INSERT INTO public.price_list (
  id,
  item_code,
  item_name,
  unit,
  material_cost,
  labor_cost,
  unit_cost,
  category,
  is_active,
  version_id,
  identity_id,
  category_id,
  display_order
) VALUES (
  '35353535-3535-4535-8535-353535353535',
  'ITEM-9999',
  'รายการมีเส้นทาง',
  'หน่วย',
  40,
  20,
  60,
  'SMOKE',
  true,
  '22222222-2222-4222-8222-222222222222',
  '32323232-3232-4232-8232-323232323232',
  '34343434-3434-4434-8434-343434343434',
  1
);

ALTER TABLE public.price_list ENABLE TRIGGER USER;

INSERT INTO public.factor_reference_versions (
  id,
  major,
  minor,
  patch,
  name,
  status,
  vat_percent
) VALUES (
  '33333333-3333-4333-8333-333333333333',
  9999,
  0,
  0,
  'Atomic copy smoke Factor F',
  'draft',
  7.0000
);

INSERT INTO public.factor_reference_rows (
  version_id,
  display_order,
  cost_million,
  factor,
  vat_percent,
  factor_f,
  factor_f_rain_1,
  factor_f_rain_2
) VALUES
  (
    '33333333-3333-4333-8333-333333333333',
    1,
    5,
    1.1000,
    7.0000,
    1.1770,
    1.1770,
    1.1770
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    2,
    10,
    1.0000,
    7.0000,
    1.0700,
    1.0700,
    1.0700
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    3,
    700,
    0.9000,
    7.0000,
    0.9630,
    0.9630,
    0.9630
  );

UPDATE public.factor_reference_versions
SET
  status = 'active',
  source_reference = 'atomic-copy-smoke',
  approval_reference = 'atomic-copy-smoke',
  published_at = pg_catalog.statement_timestamp(),
  row_count = 3,
  dataset_hash = (
    WITH ordered_rows AS (
      SELECT pg_catalog.jsonb_build_object(
        'cost_million', factor_row.cost_million::text,
        'operation_percent', factor_row.operation_percent::text,
        'interest_percent', factor_row.interest_percent::text,
        'profit_percent', factor_row.profit_percent::text,
        'total_expense_percent', factor_row.total_expense_percent::text,
        'factor', factor_row.factor::text,
        'vat_percent', factor_row.vat_percent::text,
        'factor_f', factor_row.factor_f::text,
        'factor_f_rain_1', factor_row.factor_f_rain_1::text,
        'factor_f_rain_2', factor_row.factor_f_rain_2::text
      ) AS row_payload
      FROM public.factor_reference_rows factor_row
      WHERE factor_row.version_id =
        '33333333-3333-4333-8333-333333333333'::uuid
      ORDER BY factor_row.cost_million
    )
    SELECT 'sha256:' || pg_catalog.encode(
      pg_catalog.sha256(
        pg_catalog.convert_to(
          pg_catalog.jsonb_agg(ordered_rows.row_payload)::text,
          'UTF8'
        )
      ),
      'hex'
    )
    FROM ordered_rows
  )
WHERE id = '33333333-3333-4333-8333-333333333333';

-- A second issued Factor version reproduces a real JavaScript binary-float
-- serialization edge: canonical numeric raw is 1.27329849539 while the app
-- stores 1.2732984953900002. Both correctly truncate to Factor F 1.2732.
INSERT INTO public.factor_reference_versions (
  id,
  major,
  minor,
  patch,
  name,
  status,
  vat_percent
) VALUES (
  '23232323-2323-4323-8323-232323232323',
  9998,
  0,
  0,
  'Atomic copy JS raw compatibility Factor F',
  'draft',
  7.0000
);

INSERT INTO public.factor_reference_rows (
  version_id,
  display_order,
  cost_million,
  factor,
  vat_percent,
  factor_f,
  factor_f_rain_1,
  factor_f_rain_2
) VALUES
  (
    '23232323-2323-4323-8323-232323232323',
    1,
    5,
    1.2733,
    7.0000,
    1.3624,
    1.3624,
    1.3624
  ),
  (
    '23232323-2323-4323-8323-232323232323',
    2,
    10,
    1.2258,
    7.0000,
    1.3116,
    1.3116,
    1.3116
  );

UPDATE public.factor_reference_versions
SET
  status = 'active',
  source_reference = 'atomic-copy-smoke-js-raw',
  approval_reference = 'atomic-copy-smoke-js-raw',
  published_at = pg_catalog.statement_timestamp(),
  row_count = 2,
  dataset_hash = (
    WITH ordered_rows AS (
      SELECT pg_catalog.jsonb_build_object(
        'cost_million', factor_row.cost_million::text,
        'operation_percent', factor_row.operation_percent::text,
        'interest_percent', factor_row.interest_percent::text,
        'profit_percent', factor_row.profit_percent::text,
        'total_expense_percent', factor_row.total_expense_percent::text,
        'factor', factor_row.factor::text,
        'vat_percent', factor_row.vat_percent::text,
        'factor_f', factor_row.factor_f::text,
        'factor_f_rain_1', factor_row.factor_f_rain_1::text,
        'factor_f_rain_2', factor_row.factor_f_rain_2::text
      ) AS row_payload
      FROM public.factor_reference_rows factor_row
      WHERE factor_row.version_id =
        '23232323-2323-4323-8323-232323232323'::uuid
      ORDER BY factor_row.cost_million
    )
    SELECT 'sha256:' || pg_catalog.encode(
      pg_catalog.sha256(
        pg_catalog.convert_to(
          pg_catalog.jsonb_agg(ordered_rows.row_payload)::text,
          'UTF8'
        )
      ),
      'hex'
    )
    FROM ordered_rows
  )
WHERE id = '23232323-2323-4323-8323-232323232323';

-- Version-bound source: preserve mode must retain these Factor values and its
-- fully routed item graph.
INSERT INTO public.boq (
  id,
  estimator_name,
  document_date,
  project_name,
  total_material_cost,
  total_labor_cost,
  total_cost,
  factor_f,
  factor_f_raw,
  factor_f_lower_cost,
  factor_f_upper_cost,
  factor_f_lower_value,
  factor_f_upper_value,
  total_with_factor_f,
  total_with_vat,
  price_list_version_id,
  factor_reference_version_id,
  status,
  created_by
) VALUES (
  '44444444-4444-4444-8444-444444444444',
  'ต้นฉบับ',
  DATE '2026-08-31',
  'โครงการทดสอบ Preserve',
  100,
  50,
  150,
  1.1000,
  1.1000,
  5000000,
  5000000,
  1.1000,
  1.1000,
  165,
  176.55,
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  'draft',
  '11111111-1111-4111-8111-111111111111'
);

-- Current fresh saves aggregate raw products before the route/header numeric(2)
-- assignment, while reloaded/legacy graphs aggregate stored per-item totals.
-- This source intentionally uses the raw-product tuple on its route and the
-- stored-item tuple on its header to prove both approved rounding models.
INSERT INTO public.boq (
  id,
  estimator_name,
  document_date,
  project_name,
  total_material_cost,
  total_labor_cost,
  total_cost,
  price_list_version_id,
  factor_reference_version_id,
  status,
  created_by
) VALUES (
  '12121212-1212-4212-8212-121212121212',
  'ต้นฉบับการปัดเศษ',
  DATE '2026-08-31',
  'โครงการทดสอบ Rounding',
  0.02,
  0.02,
  0.02,
  '22222222-2222-4222-8222-222222222222',
  NULL,
  'draft',
  '11111111-1111-4111-8111-111111111111'
);

INSERT INTO public.boq_routes (
  id,
  boq_id,
  route_order,
  route_name,
  total_material_cost,
  total_labor_cost,
  total_cost,
  cost_with_factor_f
) VALUES (
  '13131313-1313-4313-8313-131313131313',
  '12121212-1212-4212-8212-121212121212',
  1,
  'เส้นทางปัดเศษแบบ raw',
  0.01,
  0.01,
  0.02,
  0
);

INSERT INTO public.boq_items (
  boq_id,
  route_id,
  item_order,
  item_name,
  quantity,
  unit,
  material_cost_per_unit,
  labor_cost_per_unit,
  unit_cost,
  total_material_cost,
  total_labor_cost,
  total_cost,
  category
) VALUES
  (
    '12121212-1212-4212-8212-121212121212',
    '13131313-1313-4313-8313-131313131313',
    1,
    'รายการปัดเศษ 1',
    0.50,
    'หน่วย',
    0.01,
    0.01,
    0.02,
    0.01,
    0.01,
    0.01,
    'CUSTOM'
  ),
  (
    '12121212-1212-4212-8212-121212121212',
    '13131313-1313-4313-8313-131313131313',
    2,
    'รายการปัดเศษ 2',
    0.50,
    'หน่วย',
    0.01,
    0.01,
    0.02,
    0.01,
    0.01,
    0.01,
    'CUSTOM'
  );

INSERT INTO public.boq_routes (
  id,
  boq_id,
  route_order,
  route_name,
  total_material_cost,
  total_labor_cost,
  total_cost,
  cost_with_factor_f
) VALUES (
  '55555555-5555-4555-8555-555555555555',
  '44444444-4444-4444-8444-444444444444',
  1,
  'เส้นทางหลัก',
  100,
  50,
  150,
  165
);

INSERT INTO public.boq_items (
  boq_id,
  route_id,
  item_order,
  price_list_id,
  item_name,
  quantity,
  unit,
  material_cost_per_unit,
  labor_cost_per_unit,
  unit_cost,
  total_material_cost,
  total_labor_cost,
  total_cost,
  category
) VALUES
  (
    '44444444-4444-4444-8444-444444444444',
    '55555555-5555-4555-8555-555555555555',
    1,
    '35353535-3535-4535-8535-353535353535',
    'รายการมีเส้นทาง',
    2,
    'หน่วย',
    40,
    20,
    60,
    80,
    40,
    120,
    'SMOKE'
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    '55555555-5555-4555-8555-555555555555',
    2,
    NULL,
    'รายการไม่มีเส้นทาง',
    1,
    'หน่วย',
    20,
    10,
    30,
    20,
    10,
    30,
    'CUSTOM'
  );

-- Canonical Factor bracket coverage: interpolation, exact endpoint, and above
-- the maximum reference row. Each source is bound and positive-total.
INSERT INTO public.boq (
  id,
  estimator_name,
  document_date,
  project_name,
  total_material_cost,
  total_labor_cost,
  total_cost,
  factor_f,
  factor_f_raw,
  factor_f_lower_cost,
  factor_f_upper_cost,
  factor_f_lower_value,
  factor_f_upper_value,
  total_with_factor_f,
  total_with_vat,
  price_list_version_id,
  factor_reference_version_id,
  status,
  created_by
) VALUES
  (
    '15151515-1515-4515-8515-151515151515',
    'ต้นฉบับ Interpolation',
    DATE '2026-08-31',
    'โครงการทดสอบ Interpolation',
    5000000,
    2500000,
    7500000,
    1.0500,
    1.0500,
    5000000,
    10000000,
    1.1000,
    1.0000,
    7875000,
    8426250,
    '22222222-2222-4222-8222-222222222222',
    '33333333-3333-4333-8333-333333333333',
    'draft',
    '11111111-1111-4111-8111-111111111111'
  ),
  (
    '16161616-1616-4616-8616-161616161616',
    'ต้นฉบับ Endpoint',
    DATE '2026-08-31',
    'โครงการทดสอบ Endpoint',
    6000000,
    4000000,
    10000000,
    1.0000,
    1.0000,
    10000000,
    10000000,
    1.0000,
    1.0000,
    10000000,
    10700000,
    '22222222-2222-4222-8222-222222222222',
    '33333333-3333-4333-8333-333333333333',
    'draft',
    '11111111-1111-4111-8111-111111111111'
  ),
  (
    '17171717-1717-4717-8717-171717171717',
    'ต้นฉบับ Above Max',
    DATE '2026-08-31',
    'โครงการทดสอบ Above Max',
    500000000,
    300000000,
    800000000,
    0.9000,
    0.9000,
    700000000,
    700000000,
    0.9000,
    0.9000,
    720000000,
    770400000,
    '22222222-2222-4222-8222-222222222222',
    '33333333-3333-4333-8333-333333333333',
    'draft',
    '11111111-1111-4111-8111-111111111111'
  );

INSERT INTO public.boq_items (
  boq_id,
  route_id,
  item_order,
  item_name,
  quantity,
  unit,
  material_cost_per_unit,
  labor_cost_per_unit,
  unit_cost,
  total_material_cost,
  total_labor_cost,
  total_cost,
  category
) VALUES
  (
    '15151515-1515-4515-8515-151515151515',
    NULL,
    1,
    'รายการ Interpolation',
    1,
    'หน่วย',
    5000000,
    2500000,
    7500000,
    5000000,
    2500000,
    7500000,
    'CUSTOM'
  ),
  (
    '16161616-1616-4616-8616-161616161616',
    NULL,
    1,
    'รายการ Endpoint',
    1,
    'หน่วย',
    6000000,
    4000000,
    10000000,
    6000000,
    4000000,
    10000000,
    'CUSTOM'
  ),
  (
    '17171717-1717-4717-8717-171717171717',
    NULL,
    1,
    'รายการ Above Max',
    1,
    'หน่วย',
    500000000,
    300000000,
    800000000,
    500000000,
    300000000,
    800000000,
    'CUSTOM'
  );

-- Cross-organization explicit assignment remains readable, while another user
-- in that same outside organization without assignment remains forbidden.
UPDATE public.boq
SET
  assigned_to = '62626262-6262-4262-8262-626262626262',
  org_id = '41414141-4141-4141-8141-414141414141',
  department_id = '42424242-4242-4242-8242-424242424242',
  sector_id = '43434343-4343-4343-8343-434343434343'
WHERE id = '16161616-1616-4616-8616-161616161616';

-- Forward-valid raw audit value from JavaScript binary floating point. Exact
-- raw equality to PostgreSQL numeric would reject this source even though its
-- canonical bracket and four-decimal Factor F are correct.
INSERT INTO public.boq (
  id,
  estimator_name,
  document_date,
  project_name,
  total_material_cost,
  total_labor_cost,
  total_cost,
  factor_f,
  factor_f_raw,
  factor_f_lower_cost,
  factor_f_upper_cost,
  factor_f_lower_value,
  factor_f_upper_value,
  total_with_factor_f,
  total_with_vat,
  price_list_version_id,
  factor_reference_version_id,
  status,
  created_by
) VALUES (
  '24242424-2424-4424-8424-242424242424',
  'ต้นฉบับ JS raw',
  DATE '2026-08-31',
  'โครงการทดสอบ JS Raw Compatibility',
  3000000,
  2000158.38,
  5000158.38,
  1.2732,
  1.2732984953900002,
  5000000,
  10000000,
  1.2733,
  1.2258,
  6366201.65,
  6811835.77,
  '22222222-2222-4222-8222-222222222222',
  '23232323-2323-4323-8323-232323232323',
  'draft',
  '11111111-1111-4111-8111-111111111111'
);

INSERT INTO public.boq_items (
  boq_id,
  route_id,
  item_order,
  item_name,
  quantity,
  unit,
  material_cost_per_unit,
  labor_cost_per_unit,
  unit_cost,
  total_material_cost,
  total_labor_cost,
  total_cost,
  category
) VALUES (
  '24242424-2424-4424-8424-242424242424',
  NULL,
  1,
  'รายการ JS Raw Compatibility',
  1,
  'หน่วย',
  3000000,
  2000158.38,
  5000158.38,
  3000000,
  2000158.38,
  5000158.38,
  'CUSTOM'
);

-- Unbound legacy source: select_factor must retain base prices/totals but
-- reset every Factor calculation snapshot in the new draft.
INSERT INTO public.boq (
  id,
  estimator_name,
  document_date,
  project_name,
  total_material_cost,
  total_labor_cost,
  total_cost,
  factor_f,
  factor_f_raw,
  factor_f_lower_cost,
  factor_f_upper_cost,
  factor_f_lower_value,
  factor_f_upper_value,
  total_with_factor_f,
  total_with_vat,
  price_list_version_id,
  factor_reference_version_id,
  status,
  created_by
) VALUES (
  '66666666-6666-4666-8666-666666666666',
  'ต้นฉบับเก่า',
  DATE '2026-08-31',
  'โครงการทดสอบ Legacy',
  10,
  5,
  15,
  1.0500,
  1.05001234,
  10,
  20,
  1.0500,
  1.0400,
  15.75,
  16.85,
  '22222222-2222-4222-8222-222222222222',
  NULL,
  'draft',
  '11111111-1111-4111-8111-111111111111'
);

INSERT INTO public.boq_items (
  boq_id,
  route_id,
  item_order,
  item_name,
  quantity,
  unit,
  material_cost_per_unit,
  labor_cost_per_unit,
  unit_cost,
  total_material_cost,
  total_labor_cost,
  total_cost,
  category
) VALUES (
  '66666666-6666-4666-8666-666666666666',
  NULL,
  1,
  'รายการ Legacy ไม่มีเส้นทาง',
  1,
  'หน่วย',
  10,
  5,
  15,
  10,
  5,
  15,
  'CUSTOM'
);

-- An unbound zero-total legacy source cannot produce a safely output-blocked
-- selected-Factor destination before the first trusted save.
INSERT INTO public.boq (
  id,
  estimator_name,
  document_date,
  project_name,
  total_material_cost,
  total_labor_cost,
  total_cost,
  total_with_factor_f,
  total_with_vat,
  price_list_version_id,
  factor_reference_version_id,
  status,
  created_by
) VALUES (
  '30303030-3030-4030-8030-303030303030',
  'ต้นฉบับเก่าศูนย์',
  DATE '2026-08-31',
  'โครงการทดสอบ Legacy Zero',
  0,
  0,
  0,
  0,
  0,
  '22222222-2222-4222-8222-222222222222',
  NULL,
  'draft',
  '11111111-1111-4111-8111-111111111111'
);

-- A version-bound zero-total draft is copyable without fabricating a Factor
-- snapshot. Positive-total preserve sources are validated more strictly.
INSERT INTO public.boq (
  id,
  estimator_name,
  document_date,
  project_name,
  total_material_cost,
  total_labor_cost,
  total_cost,
  factor_f,
  factor_f_raw,
  factor_f_lower_cost,
  factor_f_upper_cost,
  factor_f_lower_value,
  factor_f_upper_value,
  total_with_factor_f,
  total_with_vat,
  price_list_version_id,
  factor_reference_version_id,
  status,
  created_by
) VALUES (
  '77777777-7777-4777-8777-777777777777',
  'ต้นฉบับศูนย์',
  DATE '2026-08-31',
  'โครงการทดสอบ Zero',
  0,
  0,
  0,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  0,
  0,
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  'draft',
  '11111111-1111-4111-8111-111111111111'
);

-- Production's observed zero-total endpoints are all-NULL and all-zero. The
-- contract is fieldwise zero-equivalence (NULL or zero); this fixture covers
-- the all-zero endpoint while the preceding fixture covers all-NULL.
INSERT INTO public.boq (
  id,
  estimator_name,
  document_date,
  project_name,
  total_material_cost,
  total_labor_cost,
  total_cost,
  factor_f,
  factor_f_raw,
  factor_f_lower_cost,
  factor_f_upper_cost,
  factor_f_lower_value,
  factor_f_upper_value,
  total_with_factor_f,
  total_with_vat,
  price_list_version_id,
  factor_reference_version_id,
  status,
  created_by
) VALUES (
  '25252525-2525-4525-8525-252525252525',
  'ต้นฉบับศูนย์แบบเลขศูนย์',
  DATE '2026-08-31',
  'โครงการทดสอบ Zero Shape',
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  'draft',
  '11111111-1111-4111-8111-111111111111'
);

CREATE TEMP TABLE atomic_copy_smoke_results (
  label text PRIMARY KEY,
  payload jsonb NOT NULL
) ON COMMIT DROP;
GRANT SELECT, INSERT ON TABLE atomic_copy_smoke_results TO authenticated;

CREATE TEMP TABLE atomic_copy_source_tokens (
  source_boq_id uuid PRIMARY KEY,
  expected_source_updated_at timestamptz NOT NULL
) ON COMMIT DROP;
INSERT INTO atomic_copy_source_tokens (
  source_boq_id,
  expected_source_updated_at
)
SELECT source_row.id, source_row.updated_at
FROM public.boq source_row
WHERE source_row.id IN (
  '44444444-4444-4444-8444-444444444444'::uuid,
  '66666666-6666-4666-8666-666666666666'::uuid,
  '77777777-7777-4777-8777-777777777777'::uuid,
  '12121212-1212-4212-8212-121212121212'::uuid,
  '15151515-1515-4515-8515-151515151515'::uuid,
  '16161616-1616-4616-8616-161616161616'::uuid,
  '17171717-1717-4717-8717-171717171717'::uuid,
  '24242424-2424-4424-8424-242424242424'::uuid,
  '25252525-2525-4525-8525-252525252525'::uuid,
  '30303030-3030-4030-8030-303030303030'::uuid
);
GRANT SELECT ON TABLE atomic_copy_source_tokens TO authenticated;
-- The schema-only smoke database is restored without ACLs; reproduce the
-- standard Supabase public-schema usage grant before impersonating the caller.
GRANT USAGE ON SCHEMA public TO authenticated;

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

INSERT INTO atomic_copy_smoke_results (label, payload)
SELECT 'preserve', public.duplicate_boq_atomic(
  '44444444-4444-4444-8444-444444444444',
  '88888888-8888-4888-8888-888888888888',
  (SELECT expected_source_updated_at
   FROM atomic_copy_source_tokens
   WHERE source_boq_id = '44444444-4444-4444-8444-444444444444'),
  'preserve',
  NULL
);

INSERT INTO atomic_copy_smoke_results (label, payload)
SELECT 'preserve-retry', public.duplicate_boq_atomic(
  '44444444-4444-4444-8444-444444444444',
  '88888888-8888-4888-8888-888888888888',
  (SELECT expected_source_updated_at
   FROM atomic_copy_source_tokens
   WHERE source_boq_id = '44444444-4444-4444-8444-444444444444'),
  'preserve',
  NULL
);

INSERT INTO atomic_copy_smoke_results (label, payload)
SELECT 'select-factor', public.duplicate_boq_atomic(
  '66666666-6666-4666-8666-666666666666',
  '99999999-9999-4999-8999-999999999999',
  (SELECT expected_source_updated_at
   FROM atomic_copy_source_tokens
   WHERE source_boq_id = '66666666-6666-4666-8666-666666666666'),
  'select_factor',
  '33333333-3333-4333-8333-333333333333'
);

INSERT INTO atomic_copy_smoke_results (label, payload)
SELECT 'zero-preserve', public.duplicate_boq_atomic(
  '77777777-7777-4777-8777-777777777777',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4',
  (SELECT expected_source_updated_at
   FROM atomic_copy_source_tokens
   WHERE source_boq_id = '77777777-7777-4777-8777-777777777777'),
  'preserve',
  NULL
);

INSERT INTO atomic_copy_smoke_results (label, payload)
SELECT 'rounding-models', public.duplicate_boq_atomic(
  '12121212-1212-4212-8212-121212121212',
  '14141414-1414-4414-8414-141414141414',
  (SELECT expected_source_updated_at
   FROM atomic_copy_source_tokens
   WHERE source_boq_id = '12121212-1212-4212-8212-121212121212'),
  'select_factor',
  '33333333-3333-4333-8333-333333333333'
);

INSERT INTO atomic_copy_smoke_results (label, payload)
SELECT 'factor-interpolation', public.duplicate_boq_atomic(
  '15151515-1515-4515-8515-151515151515',
  '18181818-1818-4818-8818-181818181818',
  (SELECT expected_source_updated_at
   FROM atomic_copy_source_tokens
   WHERE source_boq_id = '15151515-1515-4515-8515-151515151515'),
  'preserve',
  NULL
);

INSERT INTO atomic_copy_smoke_results (label, payload)
SELECT 'factor-endpoint', public.duplicate_boq_atomic(
  '16161616-1616-4616-8616-161616161616',
  '19191919-1919-4919-8919-191919191919',
  (SELECT expected_source_updated_at
   FROM atomic_copy_source_tokens
   WHERE source_boq_id = '16161616-1616-4616-8616-161616161616'),
  'preserve',
  NULL
);

INSERT INTO atomic_copy_smoke_results (label, payload)
SELECT 'factor-above-max', public.duplicate_boq_atomic(
  '17171717-1717-4717-8717-171717171717',
  '20202020-2020-4020-8020-202020202020',
  (SELECT expected_source_updated_at
   FROM atomic_copy_source_tokens
   WHERE source_boq_id = '17171717-1717-4717-8717-171717171717'),
  'preserve',
  NULL
);

INSERT INTO atomic_copy_smoke_results (label, payload)
SELECT 'factor-js-raw', public.duplicate_boq_atomic(
  '24242424-2424-4424-8424-242424242424',
  '26262626-2626-4626-8626-262626262626',
  (SELECT expected_source_updated_at
   FROM atomic_copy_source_tokens
   WHERE source_boq_id = '24242424-2424-4424-8424-242424242424'),
  'preserve',
  NULL
);

INSERT INTO atomic_copy_smoke_results (label, payload)
SELECT 'zero-shape-preserve', public.duplicate_boq_atomic(
  '25252525-2525-4525-8525-252525252525',
  '27272727-2727-4727-8727-272727272727',
  (SELECT expected_source_updated_at
   FROM atomic_copy_source_tokens
   WHERE source_boq_id = '25252525-2525-4525-8525-252525252525'),
  'preserve',
  NULL
);

-- Persona matrix: admin may copy any visible BOQ; an explicitly assigned
-- estimator may copy across organization; procurement cannot create; and an
-- unassigned user in the other organization receives non-disclosing P0002.
SET LOCAL request.jwt.claim.sub = '61616161-6161-4161-8161-616161616161';

INSERT INTO atomic_copy_smoke_results (label, payload)
SELECT 'persona-admin', public.duplicate_boq_atomic(
  '16161616-1616-4616-8616-161616161616',
  '65656565-6565-4565-8565-656565656565',
  (SELECT expected_source_updated_at
   FROM atomic_copy_source_tokens
   WHERE source_boq_id = '16161616-1616-4616-8616-161616161616'),
  'preserve',
  NULL
);

SET LOCAL request.jwt.claim.sub = '62626262-6262-4262-8262-626262626262';

INSERT INTO atomic_copy_smoke_results (label, payload)
SELECT 'persona-shared', public.duplicate_boq_atomic(
  '16161616-1616-4616-8616-161616161616',
  '66656565-6665-4665-8665-666565656665',
  (SELECT expected_source_updated_at
   FROM atomic_copy_source_tokens
   WHERE source_boq_id = '16161616-1616-4616-8616-161616161616'),
  'preserve',
  NULL
);

SET LOCAL request.jwt.claim.sub = '69696969-6969-4969-8969-696969696969';

INSERT INTO atomic_copy_smoke_results (label, payload)
SELECT 'persona-sector-manager', public.duplicate_boq_atomic(
  '16161616-1616-4616-8616-161616161616',
  '73737373-7373-4373-8373-737373737373',
  (SELECT expected_source_updated_at
   FROM atomic_copy_source_tokens
   WHERE source_boq_id = '16161616-1616-4616-8616-161616161616'),
  'preserve',
  NULL
);

SET LOCAL request.jwt.claim.sub = '70707070-7070-4070-8070-707070707070';

INSERT INTO atomic_copy_smoke_results (label, payload)
SELECT 'persona-dept-manager', public.duplicate_boq_atomic(
  '16161616-1616-4616-8616-161616161616',
  '74747474-7474-4474-8474-747474747474',
  (SELECT expected_source_updated_at
   FROM atomic_copy_source_tokens
   WHERE source_boq_id = '16161616-1616-4616-8616-161616161616'),
  'preserve',
  NULL
);

SET LOCAL request.jwt.claim.sub = '71717171-7171-4171-8171-717171717171';

DO $pending_copy_must_fail$
BEGIN
  PERFORM public.duplicate_boq_atomic(
    '16161616-1616-4616-8616-161616161616',
    '75757575-7575-4575-8575-757575757575',
    (SELECT expected_source_updated_at
     FROM atomic_copy_source_tokens
     WHERE source_boq_id = '16161616-1616-4616-8616-161616161616'),
    'preserve',
    NULL
  );
  RAISE EXCEPTION 'Atomic copy smoke failed: pending profile created a copy';
EXCEPTION
  WHEN insufficient_privilege THEN
    NULL;
END;
$pending_copy_must_fail$;

SET LOCAL request.jwt.claim.sub = '72727272-7272-4272-8272-727272727272';

DO $inactive_copy_must_fail$
BEGIN
  PERFORM public.duplicate_boq_atomic(
    '16161616-1616-4616-8616-161616161616',
    '76767676-7676-4676-8676-767676767676',
    (SELECT expected_source_updated_at
     FROM atomic_copy_source_tokens
     WHERE source_boq_id = '16161616-1616-4616-8616-161616161616'),
    'preserve',
    NULL
  );
  RAISE EXCEPTION 'Atomic copy smoke failed: inactive profile created a copy';
EXCEPTION
  WHEN insufficient_privilege THEN
    NULL;
END;
$inactive_copy_must_fail$;

SET LOCAL request.jwt.claim.sub = '63636363-6363-4363-8363-636363636363';

DO $procurement_copy_must_fail$
BEGIN
  PERFORM public.duplicate_boq_atomic(
    '16161616-1616-4616-8616-161616161616',
    '67676767-6767-4767-8767-676767676767',
    (SELECT expected_source_updated_at
     FROM atomic_copy_source_tokens
     WHERE source_boq_id = '16161616-1616-4616-8616-161616161616'),
    'preserve',
    NULL
  );
  RAISE EXCEPTION 'Atomic copy smoke failed: procurement created a copy';
EXCEPTION
  WHEN insufficient_privilege THEN
    NULL;
END;
$procurement_copy_must_fail$;

SET LOCAL request.jwt.claim.sub = '64646464-6464-4464-8464-646464646464';

DO $cross_org_unassigned_copy_must_fail$
BEGIN
  PERFORM public.duplicate_boq_atomic(
    '16161616-1616-4616-8616-161616161616',
    '68686868-6868-4868-8868-686868686868',
    (SELECT expected_source_updated_at
     FROM atomic_copy_source_tokens
     WHERE source_boq_id = '16161616-1616-4616-8616-161616161616'),
    'preserve',
    NULL
  );
  RAISE EXCEPTION 'Atomic copy smoke failed: unassigned cross-org user copied source';
EXCEPTION
  WHEN no_data_found THEN
    NULL;
END;
$cross_org_unassigned_copy_must_fail$;

RESET ROLE;

-- The same runtime path must reject a catalog-backed item whose stored unit
-- drifts from the issued row, even when its item arithmetic remains valid.
UPDATE public.boq_items
SET unit = 'หน่วยผิด'
WHERE boq_id = '44444444-4444-4444-8444-444444444444'
  AND price_list_id = '35353535-3535-4535-8535-353535353535';

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

DO $catalog_snapshot_drift_must_fail$
BEGIN
  PERFORM public.duplicate_boq_atomic(
    '44444444-4444-4444-8444-444444444444',
    '36363636-3636-4636-8636-363636363636',
    (SELECT expected_source_updated_at
     FROM atomic_copy_source_tokens
     WHERE source_boq_id = '44444444-4444-4444-8444-444444444444'),
    'preserve',
    NULL
  );
  RAISE EXCEPTION 'Atomic copy smoke failed: drifted Catalog snapshot was copied';
EXCEPTION
  WHEN object_not_in_prerequisite_state THEN
    NULL;
END;
$catalog_snapshot_drift_must_fail$;

RESET ROLE;

UPDATE public.boq_items
SET unit = 'หน่วย'
WHERE boq_id = '44444444-4444-4444-8444-444444444444'
  AND price_list_id = '35353535-3535-4535-8535-353535353535';

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

DO $legacy_zero_select_factor_must_fail$
BEGIN
  PERFORM public.duplicate_boq_atomic(
    '30303030-3030-4030-8030-303030303030',
    '31313131-3131-4131-8131-313131313131',
    (SELECT expected_source_updated_at
     FROM atomic_copy_source_tokens
     WHERE source_boq_id = '30303030-3030-4030-8030-303030303030'),
    'select_factor',
    '33333333-3333-4333-8333-333333333333'
  );
  RAISE EXCEPTION 'Atomic copy smoke failed: zero-total legacy BOQ was copied';
EXCEPTION
  WHEN invalid_parameter_value THEN
    NULL;
END;
$legacy_zero_select_factor_must_fail$;

RESET ROLE;

-- A zero-total bound BOQ may use fieldwise NULL-or-zero Factor audit values;
-- any stale positive Factor value must fail closed.
UPDATE public.boq
SET factor_f = 0.0001
WHERE id = '25252525-2525-4525-8525-252525252525';

UPDATE atomic_copy_source_tokens token_row
SET expected_source_updated_at = source_row.updated_at
FROM public.boq source_row
WHERE token_row.source_boq_id = source_row.id
  AND source_row.id = '25252525-2525-4525-8525-252525252525';

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

DO $zero_stale_factor_must_fail$
BEGIN
  PERFORM public.duplicate_boq_atomic(
    '25252525-2525-4525-8525-252525252525',
    '28282828-2828-4828-8828-282828282828',
    (SELECT expected_source_updated_at
     FROM atomic_copy_source_tokens
     WHERE source_boq_id = '25252525-2525-4525-8525-252525252525'),
    'preserve',
    NULL
  );
  RAISE EXCEPTION 'Atomic copy smoke failed: stale positive zero-total Factor was copied';
EXCEPTION
  WHEN object_not_in_prerequisite_state THEN
    NULL;
END;
$zero_stale_factor_must_fail$;

RESET ROLE;

-- numeric NaN can make product, sum, and comparison predicates agree with one
-- another. Build a self-consistent malformed graph that would pass those
-- arithmetic equalities and verify the explicit finite-data gate rejects it.
UPDATE public.boq_items
SET
  material_cost_per_unit = 'NaN'::numeric,
  labor_cost_per_unit = 'NaN'::numeric,
  unit_cost = 'NaN'::numeric,
  total_material_cost = 'NaN'::numeric,
  total_labor_cost = 'NaN'::numeric,
  total_cost = 'NaN'::numeric
WHERE boq_id = '24242424-2424-4424-8424-242424242424';

UPDATE public.boq
SET
  total_material_cost = 'NaN'::numeric,
  total_labor_cost = 'NaN'::numeric,
  total_cost = 'NaN'::numeric,
  factor_f = 1.2258,
  factor_f_raw = 1.2258,
  factor_f_lower_cost = 10000000,
  factor_f_upper_cost = 10000000,
  factor_f_lower_value = 1.2258,
  factor_f_upper_value = 1.2258,
  total_with_factor_f = 'NaN'::numeric,
  total_with_vat = 'NaN'::numeric
WHERE id = '24242424-2424-4424-8424-242424242424';

UPDATE atomic_copy_source_tokens token_row
SET expected_source_updated_at = source_row.updated_at
FROM public.boq source_row
WHERE token_row.source_boq_id = source_row.id
  AND source_row.id = '24242424-2424-4424-8424-242424242424';

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

DO $non_finite_graph_must_fail$
BEGIN
  PERFORM public.duplicate_boq_atomic(
    '24242424-2424-4424-8424-242424242424',
    '29292929-2929-4929-8929-292929292929',
    (SELECT expected_source_updated_at
     FROM atomic_copy_source_tokens
     WHERE source_boq_id = '24242424-2424-4424-8424-242424242424'),
    'preserve',
    NULL
  );
  RAISE EXCEPTION 'Atomic copy smoke failed: non-finite graph was copied';
EXCEPTION
  WHEN object_not_in_prerequisite_state THEN
    NULL;
END;
$non_finite_graph_must_fail$;

RESET ROLE;

-- Mixed graphs are unsafe in the current editor/print/save path because
-- route-less items are ignored when real routes exist. Fail closed instead of
-- silently dropping an item from the selected-Factor copy on its first save.
UPDATE public.boq_items
SET route_id = NULL
WHERE boq_id = '12121212-1212-4212-8212-121212121212'
  AND item_order = 2;

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

DO $mixed_route_graph_must_fail$
BEGIN
  PERFORM public.duplicate_boq_atomic(
    '12121212-1212-4212-8212-121212121212',
    '21212121-2121-4121-8121-212121212121',
    (SELECT expected_source_updated_at
     FROM atomic_copy_source_tokens
     WHERE source_boq_id = '12121212-1212-4212-8212-121212121212'),
    'select_factor',
    '33333333-3333-4333-8333-333333333333'
  );
  RAISE EXCEPTION 'Atomic copy smoke failed: mixed route graph was copied';
EXCEPTION
  WHEN object_not_in_prerequisite_state THEN
    NULL;
END;
$mixed_route_graph_must_fail$;

RESET ROLE;

-- Empty graphs may carry only zero base totals. A historical empty route/header
-- with nonzero money is neither the stored-total nor raw-product model.
UPDATE public.boq
SET total_material_cost = 1, total_cost = 1
WHERE id = '77777777-7777-4777-8777-777777777777';

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

DO $empty_nonzero_graph_must_fail$
BEGIN
  PERFORM public.duplicate_boq_atomic(
    '77777777-7777-4777-8777-777777777777',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5',
    (SELECT expected_source_updated_at
     FROM atomic_copy_source_tokens
     WHERE source_boq_id = '77777777-7777-4777-8777-777777777777'),
    'preserve',
    NULL
  );
  RAISE EXCEPTION 'Atomic copy smoke failed: empty nonzero source was copied';
EXCEPTION
  WHEN object_not_in_prerequisite_state THEN
    NULL;
END;
$empty_nonzero_graph_must_fail$;

RESET ROLE;

-- The supported save token is the source header updated_at. A stale UI token
-- must fail before any destination or ledger row is created.
UPDATE public.boq
SET updated_at = updated_at + INTERVAL '1 second'
WHERE id = '44444444-4444-4444-8444-444444444444';

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

DO $stale_source_token_must_fail$
BEGIN
  PERFORM public.duplicate_boq_atomic(
    '44444444-4444-4444-8444-444444444444',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    (SELECT expected_source_updated_at
     FROM atomic_copy_source_tokens
     WHERE source_boq_id = '44444444-4444-4444-8444-444444444444'),
    'preserve',
    NULL
  );
  RAISE EXCEPTION 'Atomic copy smoke failed: stale source token was accepted';
EXCEPTION
  WHEN serialization_failure THEN
    NULL;
END;
$stale_source_token_must_fail$;

RESET ROLE;

-- A hostile raw/Factor pair that agrees with itself still must match the
-- canonical adjacent reference interpolation.
UPDATE public.boq
SET factor_f = 9.9999, factor_f_raw = 9.9999
WHERE id = '44444444-4444-4444-8444-444444444444';

UPDATE atomic_copy_source_tokens token_row
SET expected_source_updated_at = source_row.updated_at
FROM public.boq source_row
WHERE token_row.source_boq_id = source_row.id
  AND source_row.id = '44444444-4444-4444-8444-444444444444';

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

DO $malformed_factor_snapshot_must_fail$
BEGIN
  PERFORM public.duplicate_boq_atomic(
    '44444444-4444-4444-8444-444444444444',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    (SELECT expected_source_updated_at
     FROM atomic_copy_source_tokens
     WHERE source_boq_id = '44444444-4444-4444-8444-444444444444'),
    'preserve',
    NULL
  );
  RAISE EXCEPTION 'Atomic copy smoke failed: malformed Factor snapshot was copied';
EXCEPTION
  WHEN object_not_in_prerequisite_state THEN
    NULL;
END;
$malformed_factor_snapshot_must_fail$;

RESET ROLE;

-- A child-only provenance drift does not change the supported header token,
-- but the trusted copyability predicate must still reject the source.
UPDATE public.boq_items
SET total_cost = total_cost - 1
WHERE boq_id = '66666666-6666-4666-8666-666666666666';

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

DO $malformed_item_snapshot_must_fail$
BEGIN
  PERFORM public.duplicate_boq_atomic(
    '66666666-6666-4666-8666-666666666666',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
    (SELECT expected_source_updated_at
     FROM atomic_copy_source_tokens
     WHERE source_boq_id = '66666666-6666-4666-8666-666666666666'),
    'select_factor',
    '33333333-3333-4333-8333-333333333333'
  );
  RAISE EXCEPTION 'Atomic copy smoke failed: malformed item snapshot was copied';
EXCEPTION
  WHEN object_not_in_prerequisite_state THEN
    NULL;
END;
$malformed_item_snapshot_must_fail$;

RESET ROLE;

-- A NULL owner is a historical/legacy access boundary. Active non-admin users
-- must not pass the definer RPC through SQL three-valued boolean logic.
UPDATE atomic_copy_source_tokens token_row
SET expected_source_updated_at = source_row.updated_at
FROM public.boq source_row
WHERE token_row.source_boq_id = source_row.id
  AND source_row.id = '44444444-4444-4444-8444-444444444444';

UPDATE public.boq
SET created_by = NULL
WHERE id = '44444444-4444-4444-8444-444444444444';

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

DO $legacy_owner_access_must_fail$
BEGIN
  PERFORM public.duplicate_boq_atomic(
    '44444444-4444-4444-8444-444444444444',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    (SELECT expected_source_updated_at
     FROM atomic_copy_source_tokens
     WHERE source_boq_id = '44444444-4444-4444-8444-444444444444'),
    'preserve',
    NULL
  );
  RAISE EXCEPTION 'Atomic copy smoke failed: staff copied an ownerless BOQ';
EXCEPTION
  WHEN no_data_found THEN
    NULL;
END;
$legacy_owner_access_must_fail$;

RESET ROLE;

DO $smoke_assertions$
DECLARE
  v_preserve jsonb;
  v_retry jsonb;
  v_select_factor jsonb;
  v_zero_preserve jsonb;
  v_rounding_models jsonb;
  v_factor_js_raw jsonb;
  v_zero_shape_preserve jsonb;
  v_preserve_id uuid;
  v_select_factor_id uuid;
  v_zero_preserve_id uuid;
  v_rounding_models_id uuid;
  v_factor_js_raw_id uuid;
  v_zero_shape_preserve_id uuid;
  v_preserve_row public.boq%ROWTYPE;
  v_select_factor_row public.boq%ROWTYPE;
  v_zero_preserve_row public.boq%ROWTYPE;
  v_rounding_models_row public.boq%ROWTYPE;
  v_factor_js_raw_row public.boq%ROWTYPE;
  v_zero_shape_preserve_row public.boq%ROWTYPE;
BEGIN
  SELECT payload INTO v_preserve
  FROM atomic_copy_smoke_results WHERE label = 'preserve';
  SELECT payload INTO v_retry
  FROM atomic_copy_smoke_results WHERE label = 'preserve-retry';
  SELECT payload INTO v_select_factor
  FROM atomic_copy_smoke_results WHERE label = 'select-factor';
  SELECT payload INTO v_zero_preserve
  FROM atomic_copy_smoke_results WHERE label = 'zero-preserve';
  SELECT payload INTO v_rounding_models
  FROM atomic_copy_smoke_results WHERE label = 'rounding-models';
  SELECT payload INTO v_factor_js_raw
  FROM atomic_copy_smoke_results WHERE label = 'factor-js-raw';
  SELECT payload INTO v_zero_shape_preserve
  FROM atomic_copy_smoke_results WHERE label = 'zero-shape-preserve';

  v_preserve_id := (v_preserve->>'boq_id')::uuid;
  v_select_factor_id := (v_select_factor->>'boq_id')::uuid;
  v_zero_preserve_id := (v_zero_preserve->>'boq_id')::uuid;
  v_rounding_models_id := (v_rounding_models->>'boq_id')::uuid;
  v_factor_js_raw_id := (v_factor_js_raw->>'boq_id')::uuid;
  v_zero_shape_preserve_id := (v_zero_shape_preserve->>'boq_id')::uuid;

  IF v_preserve->>'duplicateRequest' IS DISTINCT FROM 'false'
     OR v_retry->>'duplicateRequest' IS DISTINCT FROM 'true'
     OR v_retry->>'boq_id' IS DISTINCT FROM v_preserve->>'boq_id' THEN
    RAISE EXCEPTION 'Atomic copy smoke failed: idempotent preserve response drifted';
  END IF;

  SELECT * INTO STRICT v_preserve_row
  FROM public.boq WHERE id = v_preserve_id;

  IF v_preserve_row.factor_reference_version_id IS DISTINCT FROM
       '33333333-3333-4333-8333-333333333333'::uuid
     OR v_preserve_row.factor_f IS DISTINCT FROM 1.1000::numeric
     OR v_preserve_row.factor_f_raw IS DISTINCT FROM 1.1000::numeric
     OR v_preserve_row.total_with_factor_f IS DISTINCT FROM 165::numeric
     OR v_preserve_row.total_with_vat IS DISTINCT FROM 176.55::numeric
     OR (SELECT count(*) FROM public.boq_routes WHERE boq_id = v_preserve_id) <> 1
     OR (SELECT count(*) FROM public.boq_items WHERE boq_id = v_preserve_id) <> 2
     OR (SELECT count(*) FROM public.boq_items
         WHERE boq_id = v_preserve_id AND route_id IS NULL) <> 0 THEN
    RAISE EXCEPTION 'Atomic copy smoke failed: preserve copy changed its snapshot';
  END IF;

  SELECT * INTO STRICT v_select_factor_row
  FROM public.boq WHERE id = v_select_factor_id;

  IF v_select_factor_row.factor_reference_version_id IS DISTINCT FROM
       '33333333-3333-4333-8333-333333333333'::uuid
     OR v_select_factor_row.factor_f IS NOT NULL
     OR v_select_factor_row.factor_f_raw IS NOT NULL
     OR v_select_factor_row.factor_f_lower_cost IS NOT NULL
     OR v_select_factor_row.factor_f_upper_cost IS NOT NULL
     OR v_select_factor_row.factor_f_lower_value IS NOT NULL
     OR v_select_factor_row.factor_f_upper_value IS NOT NULL
     OR v_select_factor_row.total_with_factor_f IS DISTINCT FROM 0::numeric
     OR v_select_factor_row.total_with_vat IS DISTINCT FROM 0::numeric
     OR v_select_factor_row.total_cost IS DISTINCT FROM 15::numeric
     OR (SELECT count(*) FROM public.boq_items
         WHERE boq_id = v_select_factor_id AND route_id IS NULL) <> 1 THEN
    RAISE EXCEPTION 'Atomic copy smoke failed: select_factor semantics drifted';
  END IF;

  SELECT * INTO STRICT v_zero_preserve_row
  FROM public.boq WHERE id = v_zero_preserve_id;

  IF v_zero_preserve_row.factor_reference_version_id IS DISTINCT FROM
       '33333333-3333-4333-8333-333333333333'::uuid
     OR v_zero_preserve_row.total_cost IS DISTINCT FROM 0::numeric
     OR v_zero_preserve_row.factor_f IS NOT NULL
     OR v_zero_preserve_row.factor_f_raw IS NOT NULL
     OR v_zero_preserve_row.total_with_factor_f IS DISTINCT FROM 0::numeric
     OR v_zero_preserve_row.total_with_vat IS DISTINCT FROM 0::numeric THEN
    RAISE EXCEPTION 'Atomic copy smoke failed: zero-total preserve was fabricated';
  END IF;

  SELECT * INTO STRICT v_zero_shape_preserve_row
  FROM public.boq WHERE id = v_zero_shape_preserve_id;

  IF v_zero_shape_preserve_row.factor_f IS DISTINCT FROM 0::numeric
     OR v_zero_shape_preserve_row.factor_f_raw IS DISTINCT FROM 0::numeric
     OR v_zero_shape_preserve_row.factor_f_lower_cost IS DISTINCT FROM 0::numeric
     OR v_zero_shape_preserve_row.factor_f_upper_cost IS DISTINCT FROM 0::numeric
     OR v_zero_shape_preserve_row.factor_f_lower_value IS DISTINCT FROM 0::numeric
     OR v_zero_shape_preserve_row.factor_f_upper_value IS DISTINCT FROM 0::numeric
     OR v_zero_shape_preserve_row.total_with_factor_f IS DISTINCT FROM 0::numeric
     OR v_zero_shape_preserve_row.total_with_vat IS DISTINCT FROM 0::numeric THEN
    RAISE EXCEPTION 'Atomic copy smoke failed: all-zero Factor shape drifted';
  END IF;

  SELECT * INTO STRICT v_factor_js_raw_row
  FROM public.boq WHERE id = v_factor_js_raw_id;

  IF v_factor_js_raw_row.factor_reference_version_id IS DISTINCT FROM
       '23232323-2323-4323-8323-232323232323'::uuid
     OR v_factor_js_raw_row.factor_f IS DISTINCT FROM 1.2732::numeric
     OR v_factor_js_raw_row.factor_f_raw
        IS DISTINCT FROM 1.2732984953900002::numeric
     OR v_factor_js_raw_row.factor_f_lower_cost
        IS DISTINCT FROM 5000000::numeric
     OR v_factor_js_raw_row.factor_f_upper_cost
        IS DISTINCT FROM 10000000::numeric
     OR v_factor_js_raw_row.total_with_factor_f
        IS DISTINCT FROM 6366201.65::numeric
     OR v_factor_js_raw_row.total_with_vat
        IS DISTINCT FROM 6811835.77::numeric THEN
    RAISE EXCEPTION 'Atomic copy smoke failed: JS raw compatibility drifted';
  END IF;

  SELECT * INTO STRICT v_rounding_models_row
  FROM public.boq WHERE id = v_rounding_models_id;

  IF v_rounding_models_row.total_material_cost IS DISTINCT FROM 0.02::numeric
     OR v_rounding_models_row.total_labor_cost IS DISTINCT FROM 0.02::numeric
     OR v_rounding_models_row.total_cost IS DISTINCT FROM 0.02::numeric
     OR v_rounding_models_row.factor_f IS NOT NULL
     OR (SELECT count(*) FROM public.boq_routes
         WHERE boq_id = v_rounding_models_id
           AND total_material_cost = 0.01::numeric
           AND total_labor_cost = 0.01::numeric
           AND total_cost = 0.02::numeric) <> 1
     OR (SELECT count(*) FROM public.boq_items
         WHERE boq_id = v_rounding_models_id) <> 2 THEN
    RAISE EXCEPTION 'Atomic copy smoke failed: approved rounding models drifted';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM (VALUES
      (
        'factor-interpolation'::text,
        1.0500::numeric,
        1.0500::numeric,
        5000000::numeric,
        10000000::numeric,
        1.1000::numeric,
        1.0000::numeric
      ),
      (
        'factor-endpoint'::text,
        1.0000::numeric,
        1.0000::numeric,
        10000000::numeric,
        10000000::numeric,
        1.0000::numeric,
        1.0000::numeric
      ),
      (
        'factor-above-max'::text,
        0.9000::numeric,
        0.9000::numeric,
        700000000::numeric,
        700000000::numeric,
        0.9000::numeric,
        0.9000::numeric
      )
    ) expected(
      label,
      factor_f,
      factor_f_raw,
      lower_cost,
      upper_cost,
      lower_value,
      upper_value
    )
    LEFT JOIN atomic_copy_smoke_results result_row
      ON result_row.label = expected.label
    LEFT JOIN public.boq copied_row
      ON copied_row.id = (result_row.payload->>'boq_id')::uuid
    WHERE copied_row.id IS NULL
       OR copied_row.factor_f IS DISTINCT FROM expected.factor_f
       OR copied_row.factor_f_raw IS DISTINCT FROM expected.factor_f_raw
       OR copied_row.factor_f_lower_cost IS DISTINCT FROM expected.lower_cost
       OR copied_row.factor_f_upper_cost IS DISTINCT FROM expected.upper_cost
       OR copied_row.factor_f_lower_value IS DISTINCT FROM expected.lower_value
       OR copied_row.factor_f_upper_value IS DISTINCT FROM expected.upper_value
  ) THEN
    RAISE EXCEPTION 'Atomic copy smoke failed: canonical Factor bracket copy drifted';
  END IF;

  IF (
    SELECT count(*)
    FROM atomic_copy_smoke_results result_row
    JOIN public.boq copied_row
      ON copied_row.id = (result_row.payload->>'boq_id')::uuid
    WHERE (result_row.label, copied_row.created_by) IN (
      (
        'persona-admin',
        '61616161-6161-4161-8161-616161616161'::uuid
      ),
      (
        'persona-shared',
        '62626262-6262-4262-8262-626262626262'::uuid
      ),
      (
        'persona-sector-manager',
        '69696969-6969-4969-8969-696969696969'::uuid
      ),
      (
        'persona-dept-manager',
        '70707070-7070-4070-8070-707070707070'::uuid
      )
    )
  ) <> 4 THEN
    RAISE EXCEPTION 'Atomic copy smoke failed: persona copy ownership drifted';
  END IF;

  IF (SELECT count(*) FROM private.boq_copy_requests) <> 13 THEN
    RAISE EXCEPTION 'Atomic copy smoke failed: idempotency ledger count drifted';
  END IF;
END;
$smoke_assertions$;

-- Default is non-durable. A disposable concurrency harness may pass
-- `-v atomic_copy_smoke_commit=1`, exercise two external sessions against the
-- valid copied fixture, and then drop the entire disposable database.
\if :{?atomic_copy_smoke_commit}
  \if :atomic_copy_smoke_commit
COMMIT;
  \else
ROLLBACK;
  \endif
\else
ROLLBACK;
\endif
