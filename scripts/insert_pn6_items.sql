-- SQL Import Script for 28 PN6 Catalog Items
-- Generated dynamically on 2026-05-31T11:14:31.365Z

BEGIN;

-- Lock table in SHARE ROW EXCLUSIVE MODE to prevent concurrent edits and deadlocks
LOCK TABLE public.price_list IN SHARE ROW EXCLUSIVE MODE NOWAIT;

-- 1. Create Temporary Staging Table
CREATE TEMP TABLE temp_price_list_staging (
  id UUID,
  item_code VARCHAR,
  item_name TEXT,
  unit VARCHAR,
  material_cost NUMERIC,
  labor_cost NUMERIC,
  unit_cost NUMERIC,
  category VARCHAR,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) ON COMMIT DROP;

-- 2. Populate Temporary Staging Table with Candidate Items
INSERT INTO temp_price_list_staging (id, item_code, item_name, unit, material_cost, labor_cost, unit_cost, category, is_active, created_at, updated_at)
VALUES
  ('4a403b76-1bf4-4de0-94c3-7936941ec574', 'ITEM-0683', 'งานวางท่อ 1-Ø110 มม. HDPE PE80 PN6 หุ้ม ค.ส.ล.', 'ม.', 1202, 600, 1802, '1.3.   งานวางท่อ HDPE หุ้มคอนกรีตเสริมเหล็ก (ค.ส.ล.)  (High Density Polyethylene Conduit)', true, now(), now()),
  ('6374c1e9-228a-47d0-9369-480b41424fd3', 'ITEM-0684', 'งานวางท่อ 2-Ø110 มม. HDPE PE80 PN6 หุ้ม ค.ส.ล.', 'ม.', 1803, 683, 2486, '1.3.   งานวางท่อ HDPE หุ้มคอนกรีตเสริมเหล็ก (ค.ส.ล.)  (High Density Polyethylene Conduit)', true, now(), now()),
  ('5fec1165-7678-422d-ae3f-10c95f70d528', 'ITEM-0685', 'งานวางท่อ 4-Ø110 มม. HDPE PE80 PN6 หุ้ม ค.ส.ล.', 'ม.', 2265, 959, 3224, '1.3.   งานวางท่อ HDPE หุ้มคอนกรีตเสริมเหล็ก (ค.ส.ล.)  (High Density Polyethylene Conduit)', true, now(), now()),
  ('81de3107-a3e3-4357-9c4e-eba5aced5549', 'ITEM-0686', 'งานวางท่อ 6-Ø110 มม. HDPE PE80 PN6 หุ้ม ค.ส.ล.', 'ม.', 3611, 1137, 4748, '1.3.   งานวางท่อ HDPE หุ้มคอนกรีตเสริมเหล็ก (ค.ส.ล.)  (High Density Polyethylene Conduit)', true, now(), now()),
  ('c40fa670-1258-4078-90fb-d12ced1bc347', 'ITEM-0687', 'งานวางท่อ 1-Ø125 มม. HDPE PE80 PN6 หุ้ม ค.ส.ล.', 'ม.', 1275, 602, 1877, '1.3.   งานวางท่อ HDPE หุ้มคอนกรีตเสริมเหล็ก (ค.ส.ล.)  (High Density Polyethylene Conduit)', true, now(), now()),
  ('1bb7f2f4-15ed-40ae-b6a1-3fe0fc2f0a29', 'ITEM-0688', 'งานวางท่อ 2-Ø125 มม. HDPE PE80 PN6 หุ้ม ค.ส.ล.', 'ม.', 2202, 722, 2924, '1.3.   งานวางท่อ HDPE หุ้มคอนกรีตเสริมเหล็ก (ค.ส.ล.)  (High Density Polyethylene Conduit)', true, now(), now()),
  ('7a7a1ea1-63d7-4aff-91ef-6b937e39e183', 'ITEM-0689', 'งานวางท่อ 4-Ø125 มม. HDPE PE80 PN6 หุ้ม ค.ส.ล.', 'ม.', 2930, 807, 3737, '1.3.   งานวางท่อ HDPE หุ้มคอนกรีตเสริมเหล็ก (ค.ส.ล.)  (High Density Polyethylene Conduit)', true, now(), now()),
  ('1e0df31e-9d07-48de-9fae-1e3c65ccf69e', 'ITEM-0690', 'งานวางท่อ 6-Ø125 มม. HDPE PE80 PN6 หุ้ม ค.ส.ล.', 'ม.', 3871, 920, 4791, '1.3.   งานวางท่อ HDPE หุ้มคอนกรีตเสริมเหล็ก (ค.ส.ล.)  (High Density Polyethylene Conduit)', true, now(), now()),
  ('63536296-50d6-4b2b-86c6-a1f434f5ebe9', 'ITEM-0691', 'งานวางท่อ 12-Ø125 มม. HDPE PE80 PN6 หุ้ม ค.ส.ล.', 'ม.', 6560, 1231, 7791, '1.3.   งานวางท่อ HDPE หุ้มคอนกรีตเสริมเหล็ก (ค.ส.ล.)  (High Density Polyethylene Conduit)', true, now(), now()),
  ('713c6ee7-1f5f-493e-a726-7987bb468664', 'ITEM-0692', 'งานวางท่อ 16-Ø125 มม. HDPE PE80 PN6 หุ้ม ค.ส.ล.', 'ม.', 8576, 1514, 10090, '1.3.   งานวางท่อ HDPE หุ้มคอนกรีตเสริมเหล็ก (ค.ส.ล.)  (High Density Polyethylene Conduit)', true, now(), now()),
  ('98b98893-59b8-42c4-b030-c6c9f3cb2854', 'ITEM-0693', 'งานวางท่อ 1-Ø110 มม. HDPE PE80 PN6 กลบทราย', 'ม.', 547, 221, 768, '2.3.   งานวางท่อ  HDPE กลบทราย  (High Density Polyethylene Conduit)', true, now(), now()),
  ('007f668e-c727-41b7-a1a4-a99a2f7e17c4', 'ITEM-0694', 'งานวางท่อ 2-Ø110 มม. HDPE PE80 PN6 กลบทราย', 'ม.', 827, 258, 1085, '2.3.   งานวางท่อ  HDPE กลบทราย  (High Density Polyethylene Conduit)', true, now(), now()),
  ('26ad397d-46d0-4a1c-b5a9-ddb77159e3af', 'ITEM-0695', 'งานวางท่อ 3-Ø110 มม. HDPE PE80 PN6 กลบทราย', 'ม.', 1106, 297, 1403, '2.3.   งานวางท่อ  HDPE กลบทราย  (High Density Polyethylene Conduit)', true, now(), now()),
  ('88ce6cd7-b2a1-431a-881a-3fd186b39425', 'ITEM-0696', 'งานวางท่อ 4-Ø110 มม. HDPE PE80 PN6 กลบทราย', 'ม.', 1867, 683, 2550, '2.3.   งานวางท่อ  HDPE กลบทราย  (High Density Polyethylene Conduit)', true, now(), now()),
  ('b30844bc-7d46-44d0-87fb-e2a1ea69e73a', 'ITEM-0697', 'งานวางท่อ 6-Ø110 มม. HDPE PE80 PN6 กลบทราย', 'ม.', 2416, 756, 3172, '2.3.   งานวางท่อ  HDPE กลบทราย  (High Density Polyethylene Conduit)', true, now(), now()),
  ('b5cf66a8-39b6-4c61-bdf7-6dc15b6dad8d', 'ITEM-0698', 'งานวางท่อ 12-Ø110 มม. HDPE PE80 PN6 กลบทราย', 'ม.', 4082, 976, 5058, '2.3.   งานวางท่อ  HDPE กลบทราย  (High Density Polyethylene Conduit)', true, now(), now()),
  ('33fefd12-7a85-4a79-bb1e-b639b8209f0f', 'ITEM-0699', 'งานสร้างจุดเชื่อมท่อ 1-Ø4" PVC หุ้ม ค.ส.ล. (0.325x0.325x1.00 ม.)', 'จุด', 752, 236, 988, '5.  งานสร้างจุดเชื่อมท่อคอนกรีตเสริมเหล็ก', true, now(), now()),
  ('116b568b-dc8b-428a-961d-6b15c19bf570', 'ITEM-0700', 'งานสร้างท่อโค้ง 1-Ø63 มม. HDPE PE80 PN6 ขึ้นเสา ตามแบบมาตรฐานเลขที่ 152', 'จุด', 1902, 715, 2617, '6.1.   งานสร้างท่อโค้งขึ้นเสา (Riser Pole)', true, now(), now()),
  ('3cf2ff5d-4e3e-48b2-a1a5-fc0529e23b6d', 'ITEM-0701', 'งานสร้างท่อโค้ง 2-Ø63 มม. HDPE PE80 PN6 ขึ้นเสา ตามแบบมาตรฐานเลขที่ 152', 'จุด', 2775, 960, 3735, '6.1.   งานสร้างท่อโค้งขึ้นเสา (Riser Pole)', true, now(), now()),
  ('f8c48291-a58b-4437-9108-f8c7a38d3c98', 'ITEM-0702', 'งานสร้างท่อโค้ง 4-Ø63 มม. HDPE PE80 PN6 ขึ้นเสา ตามแบบมาตรฐานเลขที่ 152', 'จุด', 5123, 1594, 6717, '6.1.   งานสร้างท่อโค้งขึ้นเสา (Riser Pole)', true, now(), now()),
  ('69264c50-0aa3-41e4-8efa-57f514fbc0f8', 'ITEM-0703', 'งานสร้างท่อโค้ง 1-Ø110 มม. HDPE PE80 PN6 ขึ้นเสา ตามแบบมาตรฐานเลขที่ 152', 'จุด', 2892, 749, 3641, '6.1.   งานสร้างท่อโค้งขึ้นเสา (Riser Pole)', true, now(), now()),
  ('92d0bd54-3ecc-4d6e-8ad1-ba3eac30da52', 'ITEM-0704', 'งานสร้างท่อโค้ง 2-Ø110 มม. HDPE PE80 PN6 ขึ้นเสา ตามแบบมาตรฐานเลขที่ 152', 'จุด', 5048, 1093, 6141, '6.1.   งานสร้างท่อโค้งขึ้นเสา (Riser Pole)', true, now(), now()),
  ('283d1a1f-2bc4-4600-bb85-c109ac02448b', 'ITEM-0705', 'งานสร้างท่อโค้ง 4-Ø110 มม. HDPE PE80 PN6 ขึ้นเสา ตามแบบมาตรฐานเลขที่ 152', 'จุด', 9119, 1738, 10857, '6.1.   งานสร้างท่อโค้งขึ้นเสา (Riser Pole)', true, now(), now()),
  ('c6e19e31-073f-482a-8189-f56e262fdc5e', 'ITEM-0706', 'งานสร้างท่อโค้ง 6-Ø110 มม. HDPE PE80 PN6 ขึ้นเสา ตามแบบมาตรฐานเลขที่ 152', 'จุด', 11253, 2274, 13527, '6.1.   งานสร้างท่อโค้งขึ้นเสา (Riser Pole)', true, now(), now()),
  ('348b177f-cc3d-409b-a948-a60b1c2a5f87', 'ITEM-0707', 'งานสร้างท่อโค้ง 1-Ø125 มม. HDPE PE80 PN6 ขึ้นเสา ตามแบบมาตรฐานเลขที่ 152', 'จุด', 3239, 790, 4029, '6.1.   งานสร้างท่อโค้งขึ้นเสา (Riser Pole)', true, now(), now()),
  ('44a3bf83-6558-4fc1-ad97-d6bd1f04cc3f', 'ITEM-0708', 'งานสร้างท่อโค้ง 2-Ø125 มม. HDPE PE80 PN6 ขึ้นเสา ตามแบบมาตรฐานเลขที่ 152', 'จุด', 5202, 1070, 6272, '6.1.   งานสร้างท่อโค้งขึ้นเสา (Riser Pole)', true, now(), now()),
  ('d7117e52-5910-457a-b726-d12efbbb8ea1', 'ITEM-0709', 'งานสร้างท่อโค้ง 4-Ø125 มม. HDPE PE80 PN6 ขึ้นเสา ตามแบบมาตรฐานเลขที่ 152', 'จุด', 8887, 1587, 10474, '6.1.   งานสร้างท่อโค้งขึ้นเสา (Riser Pole)', true, now(), now()),
  ('e0f7236b-c21f-4c29-8933-3010ad7b8445', 'ITEM-0710', 'งานสร้างท่อโค้ง 6-Ø125 มม. HDPE PE80 PN6 ขึ้นเสา ตามแบบมาตรฐานเลขที่ 152', 'จุด', 11661, 2246, 13907, '6.1.   งานสร้างท่อโค้งขึ้นเสา (Riser Pole)', true, now(), now());

-- 3. Execute Hardened Assertions & Transaction Logic
DO $$
DECLARE
  staging_row_count integer;
  inserted_row_count integer;
  code_conflict_count integer;
  internal_dup_count integer;
  production_dup_count integer;
  cost_mismatch_count integer;
  invalid_category_count integer;
BEGIN
  -- Assertion A: Verify exactly 28 items exist in the staging table
  SELECT COUNT(*) INTO staging_row_count FROM temp_price_list_staging;
  IF staging_row_count <> 28 THEN
    RAISE EXCEPTION 'Assertion A Failed: Expected exactly 28 staging rows, found %.', staging_row_count;
  END IF;

  -- Assertion B: Ensure there are no internal duplicates in the staging table itself (after spacing normalization)
  SELECT COUNT(*) INTO internal_dup_count
  FROM (
    SELECT LOWER(TRIM(REGEXP_REPLACE(item_name, '\s+', ' ', 'g'))) AS norm_name
    FROM temp_price_list_staging
    GROUP BY norm_name
    HAVING COUNT(*) > 1
  ) dups;
  
  IF internal_dup_count > 0 THEN
    RAISE EXCEPTION 'Assertion B Failed: Internal duplicate items found within the candidate list itself.';
  END IF;

  -- Assertion C: Ensure target item_codes do not already exist in production
  SELECT COUNT(*) INTO code_conflict_count
  FROM temp_price_list_staging t
  JOIN public.price_list pl ON pl.item_code = t.item_code;

  IF code_conflict_count > 0 THEN
    RAISE EXCEPTION 'Assertion C Failed: Some candidate item codes are already in use in the price_list table.';
  END IF;

  -- Assertion D: Ensure none of the candidate item names already exist in production (whitespace-normalized duplicate check)
  SELECT COUNT(*) INTO production_dup_count
  FROM temp_price_list_staging t
  JOIN public.price_list pl ON 
    LOWER(TRIM(REGEXP_REPLACE(pl.item_name, '\s+', ' ', 'g'))) = LOWER(TRIM(REGEXP_REPLACE(t.item_name, '\s+', ' ', 'g')));

  IF production_dup_count > 0 THEN
    RAISE EXCEPTION 'Assertion D Failed: Candidate items already exist in the database (whitespace-normalized name duplicate check).';
  END IF;

  -- Assertion E: Ensure material_cost + labor_cost matches unit_cost for all items
  SELECT COUNT(*) INTO cost_mismatch_count
  FROM temp_price_list_staging
  WHERE material_cost + labor_cost <> unit_cost;

  IF cost_mismatch_count > 0 THEN
    RAISE EXCEPTION 'Assertion E Failed: Material cost + labor cost does not equal unit cost for some candidate items.';
  END IF;

  -- Assertion F: Verify that target categories are valid and exist in production (NULL-safe check using NOT EXISTS)
  SELECT COUNT(*) INTO invalid_category_count
  FROM temp_price_list_staging t
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.price_list pl
    WHERE pl.category = t.category
  );

  IF invalid_category_count > 0 THEN
    RAISE EXCEPTION 'Assertion F Failed: One or more categories do not match any canonical categories in production.';
  END IF;

  -- 4. Apply Staged Items to Production
  INSERT INTO public.price_list (id, item_code, item_name, unit, material_cost, labor_cost, unit_cost, category, is_active, created_at, updated_at)
  SELECT id, item_code, item_name, unit, material_cost, labor_cost, unit_cost, category, is_active, created_at, updated_at
  FROM temp_price_list_staging;

  -- 5. Verify exact row count of 28 rows inserted to production
  GET DIAGNOSTICS inserted_row_count = ROW_COUNT;
  IF inserted_row_count <> 28 THEN
    RAISE EXCEPTION 'Assertion G Failed: Expected exactly 28 rows inserted to public.price_list, got %.', inserted_row_count;
  END IF;

  RAISE NOTICE 'SRE Assertions Verified. Successfully imported exactly 28 catalog items.';
END $$;

COMMIT;
