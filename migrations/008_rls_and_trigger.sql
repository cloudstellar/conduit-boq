-- =============================================================================
-- Migration 008: RLS, Trigger, and RPC for Admin Permission Security
-- Version: v1.2.0-admin-security
-- =============================================================================

-- =========================
-- 1) BOQ RLS
-- =========================

ALTER TABLE public.boq ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "boq_select" ON public.boq;
DROP POLICY IF EXISTS "Allow public access to boq" ON public.boq;
DROP POLICY IF EXISTS "Allow public delete boq" ON public.boq;

CREATE POLICY "boq_select"
ON public.boq
FOR SELECT TO authenticated
USING (
  -- Admin (active) sees all (including legacy where created_by is NULL)
  EXISTS (
    SELECT 1
    FROM public.user_profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND p.status = 'active'
  )

  OR

  -- Owner sees own (any status) - owner must not be NULL
  (public.boq.created_by IS NOT NULL AND public.boq.created_by = auth.uid())

  OR

  -- Assignee sees assigned (active only) - assigned_to must not be NULL
  (
    public.boq.assigned_to IS NOT NULL
    AND public.boq.assigned_to = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.status = 'active'
    )
  )

  OR

  -- Sector access: staff/sector_manager (active only), legacy protected
  EXISTS (
    SELECT 1
    FROM public.user_profiles p
    WHERE p.id = auth.uid()
      AND p.status = 'active'
      AND p.role IN ('staff','sector_manager')
      AND p.sector_id IS NOT NULL
      AND public.boq.sector_id IS NOT NULL
      AND public.boq.created_by IS NOT NULL
      AND public.boq.sector_id = p.sector_id
  )

  OR

  -- Department access: dept_manager/procurement (active only)
  EXISTS (
    SELECT 1
    FROM public.user_profiles p
    WHERE p.id = auth.uid()
      AND p.status = 'active'
      AND p.role IN ('dept_manager','procurement')
      AND p.department_id IS NOT NULL
      AND public.boq.department_id IS NOT NULL
      AND public.boq.created_by IS NOT NULL
      AND public.boq.department_id = p.department_id
  )
);

-- =========================
-- 2) BOQ_ITEMS RLS (inherit from BOQ)
-- =========================

ALTER TABLE public.boq_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "boq_items_select" ON public.boq_items;
DROP POLICY IF EXISTS "Allow public access to boq_items" ON public.boq_items;
DROP POLICY IF EXISTS "Allow public select boq_items" ON public.boq_items;

CREATE POLICY "boq_items_select"
ON public.boq_items
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.boq b
    WHERE b.id = public.boq_items.boq_id
  )
);

-- =========================
-- 3) USER_PROFILES UPDATE RLS
-- =========================

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- =========================
-- 4) Trigger: lock org fields after onboarding
-- =========================

CREATE OR REPLACE FUNCTION public.lock_org_fields_after_onboarding()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Admin (active) bypass
  IF EXISTS (
    SELECT 1
    FROM public.user_profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND p.status = 'active'
  ) THEN
    RETURN NEW;
  END IF;

  -- After onboard: lock actual org + requested org + audit fields
  IF OLD.onboarding_completed = true THEN
    IF (NEW.department_id IS DISTINCT FROM OLD.department_id)
      OR (NEW.sector_id IS DISTINCT FROM OLD.sector_id)
      OR (NEW.requested_department_id IS DISTINCT FROM OLD.requested_department_id)
      OR (NEW.requested_sector_id IS DISTINCT FROM OLD.requested_sector_id)
      OR (NEW.approved_at IS DISTINCT FROM OLD.approved_at)
      OR (NEW.approved_by IS DISTINCT FROM OLD.approved_by)
      OR (NEW.rejected_at IS DISTINCT FROM OLD.rejected_at)
      OR (NEW.rejected_by IS DISTINCT FROM OLD.rejected_by)
    THEN
      RAISE EXCEPTION 'Org fields are locked after onboarding';
    END IF;
  END IF;

  -- Before onboard: user can set requested_* but not actual org
  IF OLD.onboarding_completed = false THEN
    IF (NEW.department_id IS DISTINCT FROM OLD.department_id)
      OR (NEW.sector_id IS DISTINCT FROM OLD.sector_id)
    THEN
      RAISE EXCEPTION 'Only admin can set actual department/sector';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lock_org ON public.user_profiles;

CREATE TRIGGER trg_lock_org
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.lock_org_fields_after_onboarding();

-- =========================
-- 5) RPC: Admin approve (atomic, uses requested_*)
-- =========================

CREATE OR REPLACE FUNCTION public.admin_approve_user(
  p_target_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_dept uuid;
  v_sector uuid;
BEGIN
  -- Must be admin active
  IF NOT EXISTS (
    SELECT 1
    FROM public.user_profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND p.status = 'active'
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT requested_department_id, requested_sector_id
    INTO v_dept, v_sector
  FROM public.user_profiles
  WHERE id = p_target_id;

  IF v_dept IS NULL OR v_sector IS NULL THEN
    RAISE EXCEPTION 'Missing requested department/sector';
  END IF;

  UPDATE public.user_profiles
  SET
    department_id = v_dept,
    sector_id = v_sector,
    status = 'active',
    approved_at = now(),
    approved_by = auth.uid(),
    rejected_at = NULL,
    rejected_by = NULL
  WHERE id = p_target_id;
END;
$$;

-- =========================
-- 6) RPC: Admin reject (with note)
-- =========================

CREATE OR REPLACE FUNCTION public.admin_reject_user(
  p_target_id uuid,
  p_note text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Must be admin active
  IF NOT EXISTS (
    SELECT 1
    FROM public.user_profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND p.status = 'active'
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.user_profiles
  SET
    status = 'pending',
    rejected_at = now(),
    rejected_by = auth.uid(),
    approved_at = NULL,
    approved_by = NULL,
    admin_note = p_note
  WHERE id = p_target_id;
END;
$$;
