-- SQL Rollback Script for 28 PN6 Catalog Items
-- Generated dynamically on 2026-05-31T11:14:31.366Z

BEGIN;

-- Lock table in SHARE ROW EXCLUSIVE MODE to prevent concurrent edits and deadlocks
LOCK TABLE public.price_list IN SHARE ROW EXCLUSIVE MODE NOWAIT;

DO $$
DECLARE
  referenced_count integer;
  deleted_row_count integer;
BEGIN
  -- 1. Pre-flight Check: Verify that NONE of the 28 UUIDs are referenced in boq_items
  SELECT COUNT(*) INTO referenced_count
  FROM public.boq_items
  WHERE price_list_id IN (
    '4a403b76-1bf4-4de0-94c3-7936941ec574',
    '6374c1e9-228a-47d0-9369-480b41424fd3',
    '5fec1165-7678-422d-ae3f-10c95f70d528',
    '81de3107-a3e3-4357-9c4e-eba5aced5549',
    'c40fa670-1258-4078-90fb-d12ced1bc347',
    '1bb7f2f4-15ed-40ae-b6a1-3fe0fc2f0a29',
    '7a7a1ea1-63d7-4aff-91ef-6b937e39e183',
    '1e0df31e-9d07-48de-9fae-1e3c65ccf69e',
    '63536296-50d6-4b2b-86c6-a1f434f5ebe9',
    '713c6ee7-1f5f-493e-a726-7987bb468664',
    '98b98893-59b8-42c4-b030-c6c9f3cb2854',
    '007f668e-c727-41b7-a1a4-a99a2f7e17c4',
    '26ad397d-46d0-4a1c-b5a9-ddb77159e3af',
    '88ce6cd7-b2a1-431a-881a-3fd186b39425',
    'b30844bc-7d46-44d0-87fb-e2a1ea69e73a',
    'b5cf66a8-39b6-4c61-bdf7-6dc15b6dad8d',
    '33fefd12-7a85-4a79-bb1e-b639b8209f0f',
    '116b568b-dc8b-428a-961d-6b15c19bf570',
    '3cf2ff5d-4e3e-48b2-a1a5-fc0529e23b6d',
    'f8c48291-a58b-4437-9108-f8c7a38d3c98',
    '69264c50-0aa3-41e4-8efa-57f514fbc0f8',
    '92d0bd54-3ecc-4d6e-8ad1-ba3eac30da52',
    '283d1a1f-2bc4-4600-bb85-c109ac02448b',
    'c6e19e31-073f-482a-8189-f56e262fdc5e',
    '348b177f-cc3d-409b-a948-a60b1c2a5f87',
    '44a3bf83-6558-4fc1-ad97-d6bd1f04cc3f',
    'd7117e52-5910-457a-b726-d12efbbb8ea1',
    'e0f7236b-c21f-4c29-8933-3010ad7b8445'
  );

  IF referenced_count > 0 THEN
    RAISE EXCEPTION 'Rollback Failed: One or more imported catalog items are already referenced in active BOQs (referenced count: %). Use is_active = false or forward-fix instead.', referenced_count;
  END IF;

  -- 2. Execute deletion of the 28 imported items
  DELETE FROM public.price_list
  WHERE id IN (
    '4a403b76-1bf4-4de0-94c3-7936941ec574',
    '6374c1e9-228a-47d0-9369-480b41424fd3',
    '5fec1165-7678-422d-ae3f-10c95f70d528',
    '81de3107-a3e3-4357-9c4e-eba5aced5549',
    'c40fa670-1258-4078-90fb-d12ced1bc347',
    '1bb7f2f4-15ed-40ae-b6a1-3fe0fc2f0a29',
    '7a7a1ea1-63d7-4aff-91ef-6b937e39e183',
    '1e0df31e-9d07-48de-9fae-1e3c65ccf69e',
    '63536296-50d6-4b2b-86c6-a1f434f5ebe9',
    '713c6ee7-1f5f-493e-a726-7987bb468664',
    '98b98893-59b8-42c4-b030-c6c9f3cb2854',
    '007f668e-c727-41b7-a1a4-a99a2f7e17c4',
    '26ad397d-46d0-4a1c-b5a9-ddb77159e3af',
    '88ce6cd7-b2a1-431a-881a-3fd186b39425',
    'b30844bc-7d46-44d0-87fb-e2a1ea69e73a',
    'b5cf66a8-39b6-4c61-bdf7-6dc15b6dad8d',
    '33fefd12-7a85-4a79-bb1e-b639b8209f0f',
    '116b568b-dc8b-428a-961d-6b15c19bf570',
    '3cf2ff5d-4e3e-48b2-a1a5-fc0529e23b6d',
    'f8c48291-a58b-4437-9108-f8c7a38d3c98',
    '69264c50-0aa3-41e4-8efa-57f514fbc0f8',
    '92d0bd54-3ecc-4d6e-8ad1-ba3eac30da52',
    '283d1a1f-2bc4-4600-bb85-c109ac02448b',
    'c6e19e31-073f-482a-8189-f56e262fdc5e',
    '348b177f-cc3d-409b-a948-a60b1c2a5f87',
    '44a3bf83-6558-4fc1-ad97-d6bd1f04cc3f',
    'd7117e52-5910-457a-b726-d12efbbb8ea1',
    'e0f7236b-c21f-4c29-8933-3010ad7b8445'
  );

  -- 3. Assert that exactly 28 rows were deleted
  GET DIAGNOSTICS deleted_row_count = ROW_COUNT;
  IF deleted_row_count <> 28 THEN
    RAISE EXCEPTION 'Rollback Assertion Failed: Expected to delete exactly 28 rows, but % rows were affected.', deleted_row_count;
  END IF;

  RAISE NOTICE 'Rollback Success: Successfully removed exactly 28 catalog items.';
END $$;

COMMIT;
