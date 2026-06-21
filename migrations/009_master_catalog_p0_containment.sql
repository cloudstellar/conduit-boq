-- =============================================================================
-- Migration 009: Master Catalog P0 Containment
-- Status: DRAFT - REVIEW BEFORE PRODUCTION EXECUTION
-- Source: docs/plans/master-catalog/02-implementation.md (Revised v26)
--
-- Purpose:
-- 1. Close anonymous EXECUTE access to the SECURITY DEFINER BOQ save RPC.
-- 2. Deploy an auth-checked containment version of the existing RPC.
-- 3. Remove dangerous table privileges that are not governed by RLS.
-- 4. Tighten the existing BOQ, BOQ item, and BOQ route RLS policies.
--
-- This migration intentionally uses the current production schema only.
-- Run it before migration 010 and verify with:
-- docs/plans/master-catalog/05-verification-report.md
-- =============================================================================

BEGIN;

SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '60s';

-- Step 0: prevent new functions from inheriting broad API EXECUTE privileges.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated;
DO $default_privileges$
BEGIN
  IF current_user = 'supabase_admin'
     OR pg_has_role(current_user, 'supabase_admin', 'MEMBER') THEN
    EXECUTE 'ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public
      REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated';
  ELSE
    RAISE NOTICE 'Skipping supabase_admin function defaults: % is not a member', current_user;
  END IF;
END;
$default_privileges$;

-- Step 1: close the current exposure window before replacing the RPC.
REVOKE EXECUTE ON FUNCTION public.save_boq_with_routes(uuid, jsonb, jsonb)
  FROM PUBLIC, anon, authenticated;

-- Step 2: deploy the current-schema containment RPC with authorization guards.
CREATE OR REPLACE FUNCTION public.save_boq_with_routes(
  p_boq_id uuid,
  p_boq_data jsonb,
  p_routes jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_route jsonb;
  v_item jsonb;
  v_inserted_route_id uuid;
  v_route_index int := 0;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE id = auth.uid()
      AND status IN ('active', 'pending')
  ) THEN
    RAISE EXCEPTION 'User account is not active';
  END IF;

  IF (
    SELECT role
    FROM public.user_profiles
    WHERE id = auth.uid()
  ) = 'procurement' THEN
    RAISE EXCEPTION 'Procurement role cannot modify BOQ';
  END IF;

  -- Pending users may save their own BOQs only.
  IF (
    SELECT status
    FROM public.user_profiles
    WHERE id = auth.uid()
  ) = 'pending' THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.boq
      WHERE id = p_boq_id
        AND created_by = auth.uid()
    ) THEN
      RAISE EXCEPTION 'Pending users can only modify own BOQ';
    END IF;
  ELSE
    IF NOT EXISTS (
      SELECT 1
      FROM public.boq b
      JOIN public.user_profiles u ON u.id = auth.uid()
      WHERE b.id = p_boq_id
        AND (
          u.role = 'admin'
          OR b.created_by = auth.uid()
          OR b.assigned_to = auth.uid()
          OR (
            u.role = 'dept_manager'
            AND b.department_id = u.department_id
          )
          OR (
            u.role = 'sector_manager'
            AND b.sector_id = u.sector_id
          )
        )
    ) THEN
      RAISE EXCEPTION 'ไม่มีสิทธิ์แก้ไขใบประมาณราคานี้';
    END IF;
  END IF;

  UPDATE public.boq
  SET
    estimator_name = p_boq_data->>'estimator_name',
    document_date = (p_boq_data->>'document_date')::date,
    project_name = p_boq_data->>'project_name',
    route = p_boq_data->>'route',
    construction_area = p_boq_data->>'construction_area',
    department = p_boq_data->>'department',
    total_material_cost = (p_boq_data->>'total_material_cost')::numeric,
    total_labor_cost = (p_boq_data->>'total_labor_cost')::numeric,
    total_cost = (p_boq_data->>'total_cost')::numeric,
    factor_f = (p_boq_data->>'factor_f')::numeric,
    total_with_factor_f = (p_boq_data->>'total_with_factor_f')::numeric,
    total_with_vat = (p_boq_data->>'total_with_vat')::numeric,
    factor_f_raw = (p_boq_data->>'factor_f_raw')::numeric,
    factor_f_lower_cost = (p_boq_data->>'factor_f_lower_cost')::numeric,
    factor_f_upper_cost = (p_boq_data->>'factor_f_upper_cost')::numeric,
    factor_f_lower_value = (p_boq_data->>'factor_f_lower_value')::numeric,
    factor_f_upper_value = (p_boq_data->>'factor_f_upper_value')::numeric,
    updated_at = now()
  WHERE id = p_boq_id;

  DELETE FROM public.boq_items
  WHERE boq_id = p_boq_id;

  DELETE FROM public.boq_routes
  WHERE boq_id = p_boq_id;

  FOR v_route IN
    SELECT *
    FROM jsonb_array_elements(p_routes)
  LOOP
    v_route_index := v_route_index + 1;

    INSERT INTO public.boq_routes (
      boq_id,
      route_order,
      route_name,
      route_description,
      construction_area,
      total_material_cost,
      total_labor_cost,
      total_cost
    ) VALUES (
      p_boq_id,
      v_route_index,
      v_route->>'route_name',
      v_route->>'route_description',
      v_route->>'construction_area',
      (v_route->>'total_material_cost')::numeric,
      (v_route->>'total_labor_cost')::numeric,
      (v_route->>'total_cost')::numeric
    )
    RETURNING id INTO v_inserted_route_id;

    FOR v_item IN
      SELECT *
      FROM jsonb_array_elements(v_route->'items')
    LOOP
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
        remarks
      ) VALUES (
        p_boq_id,
        v_inserted_route_id,
        (v_item->>'item_order')::int,
        (v_item->>'price_list_id')::uuid,
        v_item->>'item_name',
        (v_item->>'quantity')::numeric,
        v_item->>'unit',
        (v_item->>'material_cost_per_unit')::numeric,
        (v_item->>'labor_cost_per_unit')::numeric,
        (v_item->>'unit_cost')::numeric,
        (v_item->>'total_material_cost')::numeric,
        (v_item->>'total_labor_cost')::numeric,
        (v_item->>'total_cost')::numeric,
        v_item->>'remarks'
      );
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'boq_id', p_boq_id);
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$function$;

-- Step 3: reopen only the authenticated RPC surface.
GRANT EXECUTE ON FUNCTION public.save_boq_with_routes(uuid, jsonb, jsonb)
  TO authenticated;

-- Step 4: remove table privileges that are not governed by RLS.
REVOKE TRUNCATE, REFERENCES, TRIGGER, MAINTAIN
  ON ALL TABLES IN SCHEMA public
  FROM PUBLIC, anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE TRUNCATE, REFERENCES, TRIGGER, MAINTAIN
  ON TABLES FROM PUBLIC, anon, authenticated;
DO $default_privileges$
BEGIN
  IF current_user = 'supabase_admin'
     OR pg_has_role(current_user, 'supabase_admin', 'MEMBER') THEN
    EXECUTE 'ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public
      REVOKE TRUNCATE, REFERENCES, TRIGGER, MAINTAIN
      ON TABLES FROM PUBLIC, anon, authenticated';
  ELSE
    RAISE NOTICE 'Skipping supabase_admin table defaults: % is not a member', current_user;
  END IF;
END;
$default_privileges$;

-- Step 5: close anonymous access to existing SECURITY DEFINER helpers.
REVOKE EXECUTE ON FUNCTION public.admin_approve_user(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_reject_user(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.can_approve_boq(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_my_profile() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;

-- Step 6 is intentionally empty. Default hardening moved to steps 0 and 4.

-- Step 7: replace the current BOQ policies with a complete allowlist.
DROP POLICY IF EXISTS "boq_insert" ON public.boq;
DROP POLICY IF EXISTS "boq_select" ON public.boq;
DROP POLICY IF EXISTS "boq_update" ON public.boq;
DROP POLICY IF EXISTS "boq_delete" ON public.boq;

CREATE POLICY "boq_select"
ON public.boq
FOR SELECT TO authenticated
USING (
  (
    SELECT role
    FROM public.user_profiles
    WHERE id = auth.uid()
      AND status = 'active'
  ) = 'admin'
  OR (
    created_by IS NOT NULL
    AND created_by = auth.uid()
  )
  OR (
    assigned_to IS NOT NULL
    AND assigned_to = auth.uid()
    AND (
      SELECT status
      FROM public.user_profiles
      WHERE id = auth.uid()
    ) = 'active'
  )
  OR (
    sector_id IS NOT NULL
    AND created_by IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.status = 'active'
        AND p.role IN ('staff', 'sector_manager')
        AND p.sector_id IS NOT NULL
        AND p.sector_id = public.boq.sector_id
    )
  )
  OR (
    department_id IS NOT NULL
    AND created_by IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND p.status = 'active'
        AND p.role IN ('dept_manager', 'procurement')
        AND p.department_id IS NOT NULL
        AND p.department_id = public.boq.department_id
    )
  )
);

CREATE POLICY "boq_insert"
ON public.boq
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND (
    SELECT status
    FROM public.user_profiles
    WHERE id = auth.uid()
  ) IN ('active', 'pending')
  AND (
    SELECT role
    FROM public.user_profiles
    WHERE id = auth.uid()
  ) <> 'procurement'
  AND created_by = auth.uid()
  AND status = 'draft'
);

CREATE POLICY "boq_update"
ON public.boq
FOR UPDATE TO authenticated
USING (
  (
    SELECT role
    FROM public.user_profiles
    WHERE id = auth.uid()
      AND status = 'active'
  ) = 'admin'
  OR (
    created_by = auth.uid()
    AND (
      SELECT status
      FROM public.user_profiles
      WHERE id = auth.uid()
    ) = 'active'
  )
  OR (
    assigned_to = auth.uid()
    AND (
      SELECT status
      FROM public.user_profiles
      WHERE id = auth.uid()
    ) = 'active'
  )
  OR (
    (
      SELECT role
      FROM public.user_profiles
      WHERE id = auth.uid()
        AND status = 'active'
    ) = 'dept_manager'
    AND department_id = (
      SELECT department_id
      FROM public.user_profiles
      WHERE id = auth.uid()
    )
  )
  OR (
    (
      SELECT role
      FROM public.user_profiles
      WHERE id = auth.uid()
        AND status = 'active'
    ) = 'sector_manager'
    AND sector_id = (
      SELECT sector_id
      FROM public.user_profiles
      WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "boq_delete"
ON public.boq
FOR DELETE TO authenticated
USING (
  (
    SELECT role
    FROM public.user_profiles
    WHERE id = auth.uid()
      AND status = 'active'
  ) = 'admin'
  OR (
    created_by = auth.uid()
    AND status = 'draft'
    AND (
      SELECT status
      FROM public.user_profiles
      WHERE id = auth.uid()
    ) = 'active'
  )
);

DROP POLICY IF EXISTS "boq_items_insert" ON public.boq_items;
DROP POLICY IF EXISTS "boq_items_select" ON public.boq_items;
DROP POLICY IF EXISTS "boq_items_update" ON public.boq_items;
DROP POLICY IF EXISTS "boq_items_delete" ON public.boq_items;

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

CREATE POLICY "boq_items_insert"
ON public.boq_items
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.boq b
    WHERE b.id = public.boq_items.boq_id
      AND (
        (
          SELECT role
          FROM public.user_profiles
          WHERE id = auth.uid()
            AND status = 'active'
        ) = 'admin'
        OR (
          b.created_by = auth.uid()
          AND (
            SELECT status
            FROM public.user_profiles
            WHERE id = auth.uid()
          ) IN ('active', 'pending')
        )
        OR (
          b.assigned_to = auth.uid()
          AND (
            SELECT status
            FROM public.user_profiles
            WHERE id = auth.uid()
          ) = 'active'
        )
      )
  )
);

CREATE POLICY "boq_items_update"
ON public.boq_items
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.boq b
    WHERE b.id = public.boq_items.boq_id
      AND (
        (
          SELECT role
          FROM public.user_profiles
          WHERE id = auth.uid()
            AND status = 'active'
        ) = 'admin'
        OR (
          b.created_by = auth.uid()
          AND (
            SELECT status
            FROM public.user_profiles
            WHERE id = auth.uid()
          ) = 'active'
        )
        OR (
          b.assigned_to = auth.uid()
          AND (
            SELECT status
            FROM public.user_profiles
            WHERE id = auth.uid()
          ) = 'active'
        )
      )
  )
);

CREATE POLICY "boq_items_delete"
ON public.boq_items
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.boq b
    WHERE b.id = public.boq_items.boq_id
      AND (
        (
          SELECT role
          FROM public.user_profiles
          WHERE id = auth.uid()
            AND status = 'active'
        ) = 'admin'
        OR (
          b.created_by = auth.uid()
          AND (
            SELECT status
            FROM public.user_profiles
            WHERE id = auth.uid()
          ) = 'active'
        )
      )
  )
);

DROP POLICY IF EXISTS "boq_routes_insert" ON public.boq_routes;
DROP POLICY IF EXISTS "boq_routes_select" ON public.boq_routes;
DROP POLICY IF EXISTS "boq_routes_update" ON public.boq_routes;
DROP POLICY IF EXISTS "boq_routes_delete" ON public.boq_routes;

CREATE POLICY "boq_routes_select"
ON public.boq_routes
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.boq b
    WHERE b.id = public.boq_routes.boq_id
  )
);

CREATE POLICY "boq_routes_insert"
ON public.boq_routes
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.boq b
    WHERE b.id = public.boq_routes.boq_id
      AND (
        (
          SELECT role
          FROM public.user_profiles
          WHERE id = auth.uid()
            AND status = 'active'
        ) = 'admin'
        OR (
          b.created_by = auth.uid()
          AND (
            SELECT status
            FROM public.user_profiles
            WHERE id = auth.uid()
          ) IN ('active', 'pending')
        )
        OR (
          b.assigned_to = auth.uid()
          AND (
            SELECT status
            FROM public.user_profiles
            WHERE id = auth.uid()
          ) = 'active'
        )
      )
  )
);

CREATE POLICY "boq_routes_update"
ON public.boq_routes
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.boq b
    WHERE b.id = public.boq_routes.boq_id
      AND (
        (
          SELECT role
          FROM public.user_profiles
          WHERE id = auth.uid()
            AND status = 'active'
        ) = 'admin'
        OR (
          b.created_by = auth.uid()
          AND (
            SELECT status
            FROM public.user_profiles
            WHERE id = auth.uid()
          ) = 'active'
        )
        OR (
          b.assigned_to = auth.uid()
          AND (
            SELECT status
            FROM public.user_profiles
            WHERE id = auth.uid()
          ) = 'active'
        )
      )
  )
);

CREATE POLICY "boq_routes_delete"
ON public.boq_routes
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.boq b
    WHERE b.id = public.boq_routes.boq_id
      AND (
        (
          SELECT role
          FROM public.user_profiles
          WHERE id = auth.uid()
            AND status = 'active'
        ) = 'admin'
        OR (
          b.created_by = auth.uid()
          AND (
            SELECT status
            FROM public.user_profiles
            WHERE id = auth.uid()
          ) = 'active'
        )
      )
  )
);

COMMIT;
