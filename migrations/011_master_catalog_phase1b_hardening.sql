-- =============================================================================
-- Migration 011: Master Catalog Phase 1B - Data Contract Hardening
-- Status: DRAFT - REVIEW AND TEST BEFORE PRODUCTION EXECUTION
-- Source: docs/plans/master-catalog/01-proposal.md (Revised v26)
--
-- Run only after:
-- 1. Migration 010 has been applied and verified.
-- 2. Phase 2 application code has been deployed.
-- 3. The assertions below pass with zero invalid rows.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Fail closed if data created during the rollout is not ready for hardening.
-- -----------------------------------------------------------------------------
DO $assertions$
DECLARE
  v_unlinked_boqs bigint;
  v_mismatched_items bigint;
  v_invalid_null_categories bigint;
BEGIN
  SELECT count(*)
  INTO v_unlinked_boqs
  FROM public.boq
  WHERE price_list_version_id IS NULL;

  SELECT count(*)
  INTO v_mismatched_items
  FROM public.boq_items bi
  JOIN public.price_list pl ON pl.id = bi.price_list_id
  JOIN public.boq b ON b.id = bi.boq_id
  WHERE pl.version_id IS DISTINCT FROM b.price_list_version_id;

  SELECT count(*)
  INTO v_invalid_null_categories
  FROM public.boq_items
  WHERE price_list_id IS NOT NULL
    AND category IS NULL;

  IF v_unlinked_boqs <> 0 THEN
    RAISE EXCEPTION 'Phase 1B blocked: % BOQs have no price_list_version_id',
      v_unlinked_boqs;
  END IF;

  IF v_mismatched_items <> 0 THEN
    RAISE EXCEPTION 'Phase 1B blocked: % BOQ items have cross-version mismatches',
      v_mismatched_items;
  END IF;

  IF v_invalid_null_categories <> 0 THEN
    RAISE EXCEPTION 'Phase 1B blocked: % standard BOQ items have NULL category snapshots',
      v_invalid_null_categories;
  END IF;
END;
$assertions$;

-- -----------------------------------------------------------------------------
-- 2. Require every BOQ to retain its catalog version.
-- -----------------------------------------------------------------------------
BEGIN;
  SET LOCAL lock_timeout = '10s';
  SET LOCAL statement_timeout = '30s';

  ALTER TABLE public.boq
    ALTER COLUMN price_list_version_id SET NOT NULL;
COMMIT;

-- -----------------------------------------------------------------------------
-- 3. Prevent historical BOQs from switching catalog versions.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_boq_version_modification()
RETURNS trigger
LANGUAGE plpgsql
-- This trigger only compares OLD/NEW values and does not need elevated
-- privileges. Keep it invoker-safe even though direct execution is revoked.
SECURITY INVOKER
SET search_path = ''
AS $function$
BEGIN
  IF OLD.price_list_version_id IS DISTINCT FROM NEW.price_list_version_id THEN
    RAISE EXCEPTION 'ห้ามเปลี่ยนเวอร์ชันราคากลางของใบประมาณราคาย้อนหลัง';
  END IF;

  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.prevent_boq_version_modification()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trigger_prevent_boq_version_modification
  ON public.boq;
CREATE TRIGGER trigger_prevent_boq_version_modification
  BEFORE UPDATE ON public.boq
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_boq_version_modification();
