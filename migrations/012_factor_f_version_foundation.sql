-- =============================================================================
-- Migration 012: Factor F Version Foundation
-- Status: DRAFT - REVIEW AND TEST BEFORE PRODUCTION EXECUTION
-- Source: docs/plans/factor-f/03-implementation-plan.md
--
-- Purpose:
-- 1. Add dedicated Factor F version tables and singleton default pointer.
-- 2. Add nullable BOQ factor version binding without backfilling legacy BOQs.
-- 3. Enable RLS and least-privilege grants for the new public tables.
-- 4. Add guard triggers for pointer integrity and published-row immutability.
--
-- This migration intentionally does not seed Factor F values and does not move
-- the active Factor F policy. Run 013 for the audited current baseline and 014
-- for the approved 2569.0.0 publication.
-- =============================================================================

BEGIN;

SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '30s';

-- -----------------------------------------------------------------------------
-- 1. Factor F version metadata
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.factor_reference_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  major integer NOT NULL CHECK (major >= 0),
  minor integer NOT NULL DEFAULT 0 CHECK (minor >= 0),
  patch integer NOT NULL DEFAULT 0 CHECK (patch >= 0),
  version_string text GENERATED ALWAYS AS (
    major::text || '.' || minor::text || '.' || patch::text
  ) STORED,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'archived')),
  effective_date date,
  source_document_date date,
  source_reference text,
  approval_reference text,
  advance_payment_percent numeric(10,4)
    CHECK (advance_payment_percent IS NULL OR advance_payment_percent >= 0),
  retention_percent numeric(10,4)
    CHECK (retention_percent IS NULL OR retention_percent >= 0),
  loan_interest_percent numeric(10,4)
    CHECK (loan_interest_percent IS NULL OR loan_interest_percent >= 0),
  vat_percent numeric(10,4)
    CHECK (vat_percent IS NULL OR vat_percent >= 0),
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by_display_name text,
  approved_at timestamptz,
  published_at timestamptz,
  published_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  published_by_display_name text,
  row_count integer CHECK (row_count IS NULL OR row_count > 0),
  dataset_hash text CHECK (
    dataset_hash IS NULL
    OR dataset_hash ~ '^sha256:[0-9a-f]{64}$'
  ),
  based_on_version_id uuid
    REFERENCES public.factor_reference_versions(id) ON DELETE RESTRICT,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_factor_reference_versions_major_minor_patch
    UNIQUE (major, minor, patch),
  CONSTRAINT check_factor_reference_active_publication_metadata
    CHECK (
      status <> 'active'
      OR (
        source_reference IS NOT NULL
        AND approval_reference IS NOT NULL
        AND published_at IS NOT NULL
        AND row_count IS NOT NULL
        AND dataset_hash IS NOT NULL
      )
    )
);

ALTER TABLE public.factor_reference_versions
  DROP CONSTRAINT IF EXISTS check_factor_reference_active_publication_metadata;

ALTER TABLE public.factor_reference_versions
  ADD CONSTRAINT check_factor_reference_active_publication_metadata
    CHECK (
      status <> 'active'
      OR (
        source_reference IS NOT NULL
        AND approval_reference IS NOT NULL
        AND published_at IS NOT NULL
        AND row_count IS NOT NULL
        AND dataset_hash IS NOT NULL
      )
    );

ALTER TABLE public.factor_reference_versions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_factor_reference_versions_status
  ON public.factor_reference_versions (status);

-- -----------------------------------------------------------------------------
-- 2. Version-scoped Factor F rows
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.factor_reference_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid NOT NULL
    REFERENCES public.factor_reference_versions(id) ON DELETE RESTRICT,
  display_order integer NOT NULL CHECK (display_order > 0),
  cost_million numeric(10,4) NOT NULL CHECK (cost_million > 0),
  operation_percent numeric(10,4)
    CHECK (operation_percent IS NULL OR operation_percent >= 0),
  interest_percent numeric(10,4)
    CHECK (interest_percent IS NULL OR interest_percent >= 0),
  profit_percent numeric(10,4)
    CHECK (profit_percent IS NULL OR profit_percent >= 0),
  total_expense_percent numeric(10,4)
    CHECK (total_expense_percent IS NULL OR total_expense_percent >= 0),
  factor numeric(10,4) NOT NULL CHECK (factor > 0),
  vat_percent numeric(10,4) NOT NULL CHECK (vat_percent >= 0),
  factor_f numeric(10,4) NOT NULL CHECK (factor_f > 0),
  factor_f_rain_1 numeric(10,4) NOT NULL CHECK (factor_f_rain_1 > 0),
  factor_f_rain_2 numeric(10,4) NOT NULL CHECK (factor_f_rain_2 > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_factor_reference_rows_version_cost
    UNIQUE (version_id, cost_million),
  CONSTRAINT uq_factor_reference_rows_version_display_order
    UNIQUE (version_id, display_order)
);

ALTER TABLE public.factor_reference_rows ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_factor_reference_rows_version_cost
  ON public.factor_reference_rows (version_id, cost_million);

-- -----------------------------------------------------------------------------
-- 3. Singleton default Factor F pointer
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.factor_reference_default_version (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  version_id uuid NOT NULL
    REFERENCES public.factor_reference_versions(id) ON DELETE RESTRICT,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.factor_reference_default_version ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 4. Nullable BOQ binding. Do not backfill legacy BOQs in this migration.
-- -----------------------------------------------------------------------------
ALTER TABLE public.boq
  ADD COLUMN IF NOT EXISTS factor_reference_version_id uuid;

DO $boq_factor_reference_fk$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'boq_factor_reference_version_id_fkey'
      AND conrelid = 'public.boq'::regclass
  ) THEN
    ALTER TABLE public.boq
      ADD CONSTRAINT boq_factor_reference_version_id_fkey
      FOREIGN KEY (factor_reference_version_id)
      REFERENCES public.factor_reference_versions(id)
      ON DELETE RESTRICT;
  END IF;
END;
$boq_factor_reference_fk$;

CREATE INDEX IF NOT EXISTS idx_boq_factor_reference_version_id
  ON public.boq (factor_reference_version_id);

-- -----------------------------------------------------------------------------
-- 5. RLS policies and least-privilege grants
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "factor_reference_versions_select_active"
  ON public.factor_reference_versions;
CREATE POLICY "factor_reference_versions_select_active"
  ON public.factor_reference_versions
  FOR SELECT TO authenticated
  USING (status = 'active');

DROP POLICY IF EXISTS "factor_reference_rows_select_active"
  ON public.factor_reference_rows;
CREATE POLICY "factor_reference_rows_select_active"
  ON public.factor_reference_rows
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.factor_reference_versions v
      WHERE v.id = factor_reference_rows.version_id
        AND v.status = 'active'
    )
  );

DROP POLICY IF EXISTS "factor_reference_default_version_select_active"
  ON public.factor_reference_default_version;
CREATE POLICY "factor_reference_default_version_select_active"
  ON public.factor_reference_default_version
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.factor_reference_versions v
      WHERE v.id = factor_reference_default_version.version_id
        AND v.status = 'active'
    )
  );

REVOKE ALL
  ON TABLE public.factor_reference_versions,
           public.factor_reference_rows,
           public.factor_reference_default_version
  FROM PUBLIC, anon, authenticated;

GRANT SELECT
  ON TABLE public.factor_reference_versions,
           public.factor_reference_rows,
           public.factor_reference_default_version
  TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.factor_reference_versions,
           public.factor_reference_rows,
           public.factor_reference_default_version
  TO service_role;

-- -----------------------------------------------------------------------------
-- 6. Pointer and publication guard functions
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_delete_factor_reference_default_pointer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
BEGIN
  RAISE EXCEPTION 'ห้ามลบ singleton row ของ factor_reference_default_version ให้ UPDATE version_id แทน';
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.prevent_delete_factor_reference_default_pointer()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trigger_prevent_delete_factor_reference_default_pointer
  ON public.factor_reference_default_version;
CREATE TRIGGER trigger_prevent_delete_factor_reference_default_pointer
  BEFORE DELETE ON public.factor_reference_default_version
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_delete_factor_reference_default_pointer();

CREATE OR REPLACE FUNCTION public.validate_factor_reference_default_pointer_active()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.factor_reference_versions
    WHERE id = NEW.version_id
      AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Factor F default pointer ต้องชี้ไปเวอร์ชันที่ status = active เท่านั้น';
  END IF;

  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.validate_factor_reference_default_pointer_active()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trigger_validate_factor_reference_default_pointer_active
  ON public.factor_reference_default_version;
CREATE TRIGGER trigger_validate_factor_reference_default_pointer_active
  BEFORE INSERT OR UPDATE ON public.factor_reference_default_version
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_factor_reference_default_pointer_active();

CREATE OR REPLACE FUNCTION public.prevent_active_factor_reference_version_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
BEGIN
  IF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
    RAISE EXCEPTION 'ห้ามลบ Factor F version ที่ publish แล้ว';
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status = 'active' THEN
    RAISE EXCEPTION 'ห้ามแก้ไข Factor F version ที่ publish แล้ว';
  END IF;

  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at = now();
    RETURN NEW;
  END IF;

  RETURN OLD;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.prevent_active_factor_reference_version_mutation()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trigger_prevent_active_factor_reference_version_mutation
  ON public.factor_reference_versions;
CREATE TRIGGER trigger_prevent_active_factor_reference_version_mutation
  BEFORE UPDATE OR DELETE ON public.factor_reference_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_active_factor_reference_version_mutation();

CREATE OR REPLACE FUNCTION public.prevent_active_factor_reference_row_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  v_active boolean;
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.factor_reference_versions
      WHERE id = OLD.version_id
        AND status = 'active'
    )
    INTO v_active;

    IF v_active THEN
      RAISE EXCEPTION 'ห้ามแก้ไขหรือลบ Factor F rows ของเวอร์ชันที่ publish แล้ว';
    END IF;
  END IF;

  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.factor_reference_versions
      WHERE id = NEW.version_id
        AND status = 'active'
    )
    INTO v_active;

    IF v_active THEN
      RAISE EXCEPTION 'ห้ามเพิ่มหรือแก้ไข Factor F rows ของเวอร์ชันที่ publish แล้ว';
    END IF;

    RETURN NEW;
  END IF;

  RETURN OLD;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.prevent_active_factor_reference_row_mutation()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trigger_prevent_active_factor_reference_row_mutation
  ON public.factor_reference_rows;
CREATE TRIGGER trigger_prevent_active_factor_reference_row_mutation
  BEFORE INSERT OR UPDATE OR DELETE ON public.factor_reference_rows
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_active_factor_reference_row_mutation();

-- -----------------------------------------------------------------------------
-- 7. BOQ binding helpers
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_default_factor_reference_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
BEGIN
  IF NEW.factor_reference_version_id IS NULL
     AND NEW.factor_f IS NULL
     AND COALESCE(NEW.total_cost, 0) = 0 THEN
    SELECT dv.version_id
    INTO NEW.factor_reference_version_id
    FROM public.factor_reference_default_version dv
    JOIN public.factor_reference_versions v ON v.id = dv.version_id
    WHERE dv.id = true
      AND v.status = 'active';
  ELSIF NEW.factor_reference_version_id IS NOT NULL
    AND NOT EXISTS (
    SELECT 1
    FROM public.factor_reference_versions
    WHERE id = NEW.factor_reference_version_id
      AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'BOQ ต้องอ้างอิง Factor F version ที่ active เท่านั้น';
  END IF;

  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.set_default_factor_reference_version()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trigger_set_default_factor_reference_version
  ON public.boq;
CREATE TRIGGER trigger_set_default_factor_reference_version
  BEFORE INSERT ON public.boq
  FOR EACH ROW
  EXECUTE FUNCTION public.set_default_factor_reference_version();

CREATE OR REPLACE FUNCTION public.prevent_boq_factor_reference_version_modification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
BEGIN
  IF OLD.factor_reference_version_id IS DISTINCT FROM NEW.factor_reference_version_id THEN
    RAISE EXCEPTION 'ห้ามเปลี่ยนเวอร์ชัน Factor F ของใบประมาณราคาย้อนหลัง';
  END IF;

  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.prevent_boq_factor_reference_version_modification()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trigger_prevent_boq_factor_reference_version_modification
  ON public.boq;
CREATE TRIGGER trigger_prevent_boq_factor_reference_version_modification
  BEFORE UPDATE ON public.boq
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_boq_factor_reference_version_modification();

COMMIT;
