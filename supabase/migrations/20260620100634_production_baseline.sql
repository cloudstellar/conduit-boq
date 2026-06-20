


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."admin_approve_user"("p_target_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."admin_approve_user"("p_target_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_reject_user"("p_target_id" "uuid", "p_note" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."admin_reject_user"("p_target_id" "uuid", "p_note" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_approve_boq"("p_boq_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_role TEXT;
  v_my_sector UUID;
  v_my_department UUID;
  v_boq_created_by UUID;
  v_boq_sector UUID;
  v_boq_department UUID;
  v_boq_status TEXT;
BEGIN
  SELECT role, sector_id, department_id
    INTO v_role, v_my_sector, v_my_department
    FROM public.user_profiles WHERE id = auth.uid();

  SELECT created_by, sector_id, department_id, status
    INTO v_boq_created_by, v_boq_sector, v_boq_department, v_boq_status
    FROM public.boq WHERE id = p_boq_id;

  IF v_boq_created_by = auth.uid() THEN RETURN FALSE; END IF;
  IF v_role = 'admin' THEN RETURN TRUE; END IF;
  IF v_role = 'sector_manager' AND v_boq_sector = v_my_sector AND v_boq_status = 'pending_review' THEN RETURN TRUE; END IF;
  IF v_role = 'dept_manager' AND v_boq_department = v_my_department AND v_boq_status = 'pending_approval' THEN RETURN TRUE; END IF;
  RETURN FALSE;
END;
$$;


ALTER FUNCTION "public"."can_approve_boq"("p_boq_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_profile"() RETURNS TABLE("user_id" "uuid", "role" "text", "sector_id" "uuid", "department_id" "uuid", "org_id" "uuid")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$ SELECT id, role, sector_id, department_id, org_id FROM user_profiles WHERE id = auth.uid(); $$;


ALTER FUNCTION "public"."get_my_profile"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_role"("user_id" "uuid") RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT role FROM public.user_profiles WHERE id = user_id;
$$;


ALTER FUNCTION "public"."get_user_role"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, first_name, last_name, status, role)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'pending',
    'staff'
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"("user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT role = 'admin' FROM public.user_profiles WHERE id = user_id;
$$;


ALTER FUNCTION "public"."is_admin"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."lock_org_fields_after_onboarding"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."lock_org_fields_after_onboarding"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."save_boq_with_routes"("p_boq_id" "uuid", "p_boq_data" "jsonb", "p_routes" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_route JSONB;
  v_item JSONB;
  v_inserted_route_id UUID;
  v_route_index INT := 0;
BEGIN
  UPDATE boq SET
    estimator_name = p_boq_data->>'estimator_name',
    document_date = (p_boq_data->>'document_date')::DATE,
    project_name = p_boq_data->>'project_name',
    route = p_boq_data->>'route',
    construction_area = p_boq_data->>'construction_area',
    department = p_boq_data->>'department',
    total_material_cost = (p_boq_data->>'total_material_cost')::NUMERIC,
    total_labor_cost = (p_boq_data->>'total_labor_cost')::NUMERIC,
    total_cost = (p_boq_data->>'total_cost')::NUMERIC,
    factor_f = (p_boq_data->>'factor_f')::NUMERIC,
    total_with_factor_f = (p_boq_data->>'total_with_factor_f')::NUMERIC,
    total_with_vat = (p_boq_data->>'total_with_vat')::NUMERIC,
    -- Factor F snapshot fields
    factor_f_raw = (p_boq_data->>'factor_f_raw')::NUMERIC,
    factor_f_lower_cost = (p_boq_data->>'factor_f_lower_cost')::NUMERIC,
    factor_f_upper_cost = (p_boq_data->>'factor_f_upper_cost')::NUMERIC,
    factor_f_lower_value = (p_boq_data->>'factor_f_lower_value')::NUMERIC,
    factor_f_upper_value = (p_boq_data->>'factor_f_upper_value')::NUMERIC,
    updated_at = NOW()
  WHERE id = p_boq_id;

  DELETE FROM boq_items WHERE boq_id = p_boq_id;
  DELETE FROM boq_routes WHERE boq_id = p_boq_id;

  FOR v_route IN SELECT * FROM jsonb_array_elements(p_routes)
  LOOP
    v_route_index := v_route_index + 1;

    INSERT INTO boq_routes (
      boq_id, route_order, route_name, route_description, construction_area,
      total_material_cost, total_labor_cost, total_cost
    ) VALUES (
      p_boq_id,
      v_route_index,
      v_route->>'route_name',
      v_route->>'route_description',
      v_route->>'construction_area',
      (v_route->>'total_material_cost')::NUMERIC,
      (v_route->>'total_labor_cost')::NUMERIC,
      (v_route->>'total_cost')::NUMERIC
    ) RETURNING id INTO v_inserted_route_id;

    FOR v_item IN SELECT * FROM jsonb_array_elements(v_route->'items')
    LOOP
      INSERT INTO boq_items (
        boq_id, route_id, item_order, price_list_id, item_name, quantity, unit,
        material_cost_per_unit, labor_cost_per_unit, unit_cost,
        total_material_cost, total_labor_cost, total_cost, remarks
      ) VALUES (
        p_boq_id,
        v_inserted_route_id,
        (v_item->>'item_order')::INT,
        (v_item->>'price_list_id')::UUID,
        v_item->>'item_name',
        (v_item->>'quantity')::NUMERIC,
        v_item->>'unit',
        (v_item->>'material_cost_per_unit')::NUMERIC,
        (v_item->>'labor_cost_per_unit')::NUMERIC,
        (v_item->>'unit_cost')::NUMERIC,
        (v_item->>'total_material_cost')::NUMERIC,
        (v_item->>'total_labor_cost')::NUMERIC,
        (v_item->>'total_cost')::NUMERIC,
        v_item->>'remarks'
      );
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'boq_id', p_boq_id);

EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;


ALTER FUNCTION "public"."save_boq_with_routes"("p_boq_id" "uuid", "p_boq_data" "jsonb", "p_routes" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_boq_routes_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_boq_routes_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."app_settings" (
    "key" "text" NOT NULL,
    "value" "jsonb" NOT NULL,
    "description" "text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "updated_by" "uuid"
);


ALTER TABLE "public"."app_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."boq" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "boq_number" character varying(50),
    "estimator_name" "text" NOT NULL,
    "document_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "project_name" "text" NOT NULL,
    "route" "text",
    "construction_area" "text",
    "total_material_cost" numeric(15,2) DEFAULT 0,
    "total_labor_cost" numeric(15,2) DEFAULT 0,
    "total_cost" numeric(15,2) DEFAULT 0,
    "status" character varying(20) DEFAULT 'draft'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "department" "text" DEFAULT 'วิศวกรรมท่อร้อยสาย (วทฐฐ.) ฝ่ายท่อร้อยสาย (ทฐฐ.)'::"text",
    "factor_f" numeric(10,4) DEFAULT NULL::numeric,
    "total_with_factor_f" numeric(15,2) DEFAULT 0,
    "total_with_vat" numeric(15,2) DEFAULT 0,
    "created_by" "uuid",
    "assigned_to" "uuid",
    "org_id" "uuid",
    "department_id" "uuid",
    "sector_id" "uuid",
    "factor_f_raw" numeric,
    "factor_f_lower_cost" numeric,
    "factor_f_upper_cost" numeric,
    "factor_f_lower_value" numeric,
    "factor_f_upper_value" numeric
);


ALTER TABLE "public"."boq" OWNER TO "postgres";


COMMENT ON COLUMN "public"."boq"."factor_f_raw" IS 'ค่า Factor F ดิบก่อน truncate (เช่น 1.250042844)';



COMMENT ON COLUMN "public"."boq"."factor_f_lower_cost" IS 'B: ค่างานต้นทุนช่วงล่างจากตาราง Factor F (บาท)';



COMMENT ON COLUMN "public"."boq"."factor_f_upper_cost" IS 'C: ค่างานต้นทุนช่วงบนจากตาราง Factor F (บาท)';



COMMENT ON COLUMN "public"."boq"."factor_f_lower_value" IS 'D: ค่า Factor F ของช่วงล่าง';



COMMENT ON COLUMN "public"."boq"."factor_f_upper_value" IS 'E: ค่า Factor F ของช่วงบน';



CREATE TABLE IF NOT EXISTS "public"."boq_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "boq_id" "uuid" NOT NULL,
    "item_order" integer NOT NULL,
    "price_list_id" "uuid",
    "item_name" "text" NOT NULL,
    "quantity" numeric(12,2) DEFAULT 0 NOT NULL,
    "unit" character varying(50) NOT NULL,
    "material_cost_per_unit" numeric(12,2) DEFAULT 0,
    "labor_cost_per_unit" numeric(12,2) DEFAULT 0,
    "unit_cost" numeric(12,2) DEFAULT 0,
    "total_material_cost" numeric(15,2) DEFAULT 0,
    "total_labor_cost" numeric(15,2) DEFAULT 0,
    "total_cost" numeric(15,2) DEFAULT 0,
    "remarks" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "route_id" "uuid"
);


ALTER TABLE "public"."boq_items" OWNER TO "postgres";


COMMENT ON COLUMN "public"."boq_items"."route_id" IS 'Reference to boq_routes - migrated items linked to default route';



CREATE TABLE IF NOT EXISTS "public"."boq_routes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "boq_id" "uuid" NOT NULL,
    "route_order" integer DEFAULT 1 NOT NULL,
    "route_name" "text" NOT NULL,
    "route_description" "text",
    "total_material_cost" numeric(15,2) DEFAULT 0,
    "total_labor_cost" numeric(15,2) DEFAULT 0,
    "total_cost" numeric(15,2) DEFAULT 0,
    "cost_with_factor_f" numeric(15,2) DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "construction_area" "text"
);


ALTER TABLE "public"."boq_routes" OWNER TO "postgres";


COMMENT ON TABLE "public"."boq_routes" IS 'Stores multiple routes/sections for each BOQ project';



COMMENT ON COLUMN "public"."boq_routes"."route_order" IS 'Display order of routes within a BOQ (1 = primary)';



COMMENT ON COLUMN "public"."boq_routes"."route_name" IS 'Name/identifier of the route';



COMMENT ON COLUMN "public"."boq_routes"."construction_area" IS 'Construction area specific to this route (e.g., "ถนนพระราม 4", "ถนนสุขุมวิท")';



CREATE TABLE IF NOT EXISTS "public"."departments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "full_name" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."departments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."factor_reference" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cost_million" numeric(10,4) NOT NULL,
    "operation_percent" numeric(10,4) NOT NULL,
    "interest_percent" numeric(10,4) NOT NULL,
    "profit_percent" numeric(10,4) NOT NULL,
    "total_expense_percent" numeric(10,4) NOT NULL,
    "factor" numeric(10,4) NOT NULL,
    "vat_percent" numeric(10,4) NOT NULL,
    "factor_f" numeric(10,4) NOT NULL,
    "factor_f_rain_1" numeric(10,4) NOT NULL,
    "factor_f_rain_2" numeric(10,4) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."factor_reference" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "code" "text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."price_list" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "item_code" character varying(50) NOT NULL,
    "item_name" "text" NOT NULL,
    "unit" character varying(50) NOT NULL,
    "material_cost" numeric(12,2) DEFAULT 0,
    "labor_cost" numeric(12,2) DEFAULT 0,
    "unit_cost" numeric(12,2) DEFAULT 0,
    "remarks" "text",
    "category" character varying(100),
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."price_list" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sectors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "department_id" "uuid",
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "full_name" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sectors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" NOT NULL,
    "employee_id" "text",
    "title" "text",
    "first_name" "text" DEFAULT ''::"text" NOT NULL,
    "last_name" "text" DEFAULT ''::"text" NOT NULL,
    "position" "text",
    "org_id" "uuid",
    "department_id" "uuid",
    "sector_id" "uuid",
    "role" "text" DEFAULT 'staff'::"text" NOT NULL,
    "email" "text",
    "phone" "text",
    "signature_url" "text",
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "onboarding_completed" boolean DEFAULT false,
    "requested_department_id" "uuid",
    "requested_sector_id" "uuid",
    "approved_at" timestamp with time zone,
    "approved_by" "uuid",
    "rejected_at" timestamp with time zone,
    "rejected_by" "uuid",
    "admin_note" "text",
    CONSTRAINT "user_profiles_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'dept_manager'::"text", 'sector_manager'::"text", 'staff'::"text", 'procurement'::"text"]))),
    CONSTRAINT "user_profiles_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'suspended'::"text", 'pending'::"text"])))
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."app_settings"
    ADD CONSTRAINT "app_settings_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."boq"
    ADD CONSTRAINT "boq_boq_number_key" UNIQUE ("boq_number");



ALTER TABLE ONLY "public"."boq_items"
    ADD CONSTRAINT "boq_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."boq"
    ADD CONSTRAINT "boq_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."boq_routes"
    ADD CONSTRAINT "boq_routes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."departments"
    ADD CONSTRAINT "departments_org_id_code_key" UNIQUE ("org_id", "code");



ALTER TABLE ONLY "public"."departments"
    ADD CONSTRAINT "departments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."factor_reference"
    ADD CONSTRAINT "factor_reference_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."price_list"
    ADD CONSTRAINT "price_list_item_code_key" UNIQUE ("item_code");



ALTER TABLE ONLY "public"."price_list"
    ADD CONSTRAINT "price_list_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sectors"
    ADD CONSTRAINT "sectors_department_id_code_key" UNIQUE ("department_id", "code");



ALTER TABLE ONLY "public"."sectors"
    ADD CONSTRAINT "sectors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."boq_routes"
    ADD CONSTRAINT "unique_boq_route_order" UNIQUE ("boq_id", "route_order");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_app_settings_updated_by" ON "public"."app_settings" USING "btree" ("updated_by");



CREATE INDEX "idx_boq_assigned_to" ON "public"."boq" USING "btree" ("assigned_to");



CREATE INDEX "idx_boq_created_by" ON "public"."boq" USING "btree" ("created_by");



CREATE INDEX "idx_boq_department_id" ON "public"."boq" USING "btree" ("department_id");



CREATE INDEX "idx_boq_items_boq_id" ON "public"."boq_items" USING "btree" ("boq_id");



CREATE INDEX "idx_boq_items_price_list_id" ON "public"."boq_items" USING "btree" ("price_list_id");



CREATE INDEX "idx_boq_items_route_id" ON "public"."boq_items" USING "btree" ("route_id");



CREATE INDEX "idx_boq_org_id" ON "public"."boq" USING "btree" ("org_id");



CREATE INDEX "idx_boq_routes_boq_id" ON "public"."boq_routes" USING "btree" ("boq_id");



CREATE INDEX "idx_boq_routes_order" ON "public"."boq_routes" USING "btree" ("boq_id", "route_order");



CREATE INDEX "idx_boq_sector_id" ON "public"."boq" USING "btree" ("sector_id");



CREATE INDEX "idx_boq_status" ON "public"."boq" USING "btree" ("status");



CREATE INDEX "idx_price_list_category" ON "public"."price_list" USING "btree" ("category");



CREATE INDEX "idx_price_list_item_code" ON "public"."price_list" USING "btree" ("item_code");



CREATE INDEX "idx_price_list_item_name" ON "public"."price_list" USING "btree" ("item_name");



CREATE INDEX "idx_user_profiles_approved_by" ON "public"."user_profiles" USING "btree" ("approved_by");



CREATE INDEX "idx_user_profiles_department_id" ON "public"."user_profiles" USING "btree" ("department_id");



CREATE INDEX "idx_user_profiles_onboarding" ON "public"."user_profiles" USING "btree" ("onboarding_completed");



CREATE INDEX "idx_user_profiles_org_id" ON "public"."user_profiles" USING "btree" ("org_id");



CREATE INDEX "idx_user_profiles_rejected_by" ON "public"."user_profiles" USING "btree" ("rejected_by");



CREATE INDEX "idx_user_profiles_requested_dept" ON "public"."user_profiles" USING "btree" ("requested_department_id") WHERE ("requested_department_id" IS NOT NULL);



CREATE INDEX "idx_user_profiles_requested_sector_id" ON "public"."user_profiles" USING "btree" ("requested_sector_id");



CREATE INDEX "idx_user_profiles_sector_id" ON "public"."user_profiles" USING "btree" ("sector_id");



CREATE INDEX "idx_user_profiles_status" ON "public"."user_profiles" USING "btree" ("status");



CREATE OR REPLACE TRIGGER "trg_lock_org" BEFORE UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."lock_org_fields_after_onboarding"();



CREATE OR REPLACE TRIGGER "update_boq_routes_updated_at" BEFORE UPDATE ON "public"."boq_routes" FOR EACH ROW EXECUTE FUNCTION "public"."update_boq_routes_updated_at"();



ALTER TABLE ONLY "public"."app_settings"
    ADD CONSTRAINT "app_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."boq"
    ADD CONSTRAINT "boq_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."boq"
    ADD CONSTRAINT "boq_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."boq"
    ADD CONSTRAINT "boq_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id");



ALTER TABLE ONLY "public"."boq_items"
    ADD CONSTRAINT "boq_items_boq_id_fkey" FOREIGN KEY ("boq_id") REFERENCES "public"."boq"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."boq_items"
    ADD CONSTRAINT "boq_items_price_list_id_fkey" FOREIGN KEY ("price_list_id") REFERENCES "public"."price_list"("id");



ALTER TABLE ONLY "public"."boq_items"
    ADD CONSTRAINT "boq_items_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "public"."boq_routes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."boq"
    ADD CONSTRAINT "boq_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."boq_routes"
    ADD CONSTRAINT "boq_routes_boq_id_fkey" FOREIGN KEY ("boq_id") REFERENCES "public"."boq"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."boq"
    ADD CONSTRAINT "boq_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "public"."sectors"("id");



ALTER TABLE ONLY "public"."departments"
    ADD CONSTRAINT "departments_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sectors"
    ADD CONSTRAINT "sectors_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_rejected_by_fkey" FOREIGN KEY ("rejected_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_requested_department_id_fkey" FOREIGN KEY ("requested_department_id") REFERENCES "public"."departments"("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_requested_sector_id_fkey" FOREIGN KEY ("requested_sector_id") REFERENCES "public"."sectors"("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "public"."sectors"("id");



CREATE POLICY "Admins can update all profiles" ON "public"."user_profiles" FOR UPDATE USING ((( SELECT "user_profiles_1"."role"
   FROM "public"."user_profiles" "user_profiles_1"
  WHERE ("user_profiles_1"."id" = "auth"."uid"())) = 'admin'::"text"));



CREATE POLICY "Departments are viewable by authenticated users" ON "public"."departments" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Organizations are viewable by authenticated users" ON "public"."organizations" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Sectors are viewable by authenticated users" ON "public"."sectors" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can insert own profile" ON "public"."user_profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own profile" ON "public"."user_profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can view all profiles" ON "public"."user_profiles" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."app_settings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "app_settings_insert" ON "public"."app_settings" FOR INSERT WITH CHECK ((( SELECT "user_profiles"."role"
   FROM "public"."user_profiles"
  WHERE ("user_profiles"."id" = "auth"."uid"())) = 'admin'::"text"));



CREATE POLICY "app_settings_select" ON "public"."app_settings" FOR SELECT USING (true);



CREATE POLICY "app_settings_update" ON "public"."app_settings" FOR UPDATE USING ((( SELECT "user_profiles"."role"
   FROM "public"."user_profiles"
  WHERE ("user_profiles"."id" = "auth"."uid"())) = 'admin'::"text"));



ALTER TABLE "public"."boq" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "boq_delete" ON "public"."boq" FOR DELETE USING (((( SELECT "user_profiles"."role"
   FROM "public"."user_profiles"
  WHERE ("user_profiles"."id" = "auth"."uid"())) = 'admin'::"text") OR (("created_by" = "auth"."uid"()) AND (("status")::"text" = 'draft'::"text")) OR ("created_by" IS NULL)));



CREATE POLICY "boq_insert" ON "public"."boq" FOR INSERT WITH CHECK ((("auth"."uid"() IS NOT NULL) AND (( SELECT "user_profiles"."role"
   FROM "public"."user_profiles"
  WHERE ("user_profiles"."id" = "auth"."uid"())) <> 'procurement'::"text")));



ALTER TABLE "public"."boq_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "boq_items_delete" ON "public"."boq_items" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."boq"
  WHERE (("boq"."id" = "boq_items"."boq_id") AND (("boq"."created_by" = "auth"."uid"()) OR ("boq"."created_by" IS NULL) OR (( SELECT "user_profiles"."role"
           FROM "public"."user_profiles"
          WHERE ("user_profiles"."id" = "auth"."uid"())) = 'admin'::"text"))))));



CREATE POLICY "boq_items_insert" ON "public"."boq_items" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."boq"
  WHERE (("boq"."id" = "boq_items"."boq_id") AND (("boq"."created_by" IS NULL) OR ("boq"."created_by" = "auth"."uid"()) OR ("boq"."assigned_to" = "auth"."uid"()) OR (( SELECT "user_profiles"."role"
           FROM "public"."user_profiles"
          WHERE ("user_profiles"."id" = "auth"."uid"())) = 'admin'::"text") OR (( SELECT "user_profiles"."role"
           FROM "public"."user_profiles"
          WHERE ("user_profiles"."id" = "auth"."uid"())) = 'dept_manager'::"text") OR (( SELECT "user_profiles"."role"
           FROM "public"."user_profiles"
          WHERE ("user_profiles"."id" = "auth"."uid"())) = 'sector_manager'::"text"))))));



CREATE POLICY "boq_items_select" ON "public"."boq_items" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."boq" "b"
  WHERE ("b"."id" = "boq_items"."boq_id"))));



CREATE POLICY "boq_items_update" ON "public"."boq_items" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."boq"
  WHERE (("boq"."id" = "boq_items"."boq_id") AND (("boq"."created_by" = "auth"."uid"()) OR ("boq"."assigned_to" = "auth"."uid"()) OR ("boq"."created_by" IS NULL) OR (( SELECT "user_profiles"."role"
           FROM "public"."user_profiles"
          WHERE ("user_profiles"."id" = "auth"."uid"())) = ANY (ARRAY['admin'::"text", 'dept_manager'::"text", 'sector_manager'::"text"])))))));



ALTER TABLE "public"."boq_routes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "boq_routes_delete" ON "public"."boq_routes" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."boq"
  WHERE (("boq"."id" = "boq_routes"."boq_id") AND (("boq"."created_by" = "auth"."uid"()) OR ("boq"."created_by" IS NULL) OR (( SELECT "user_profiles"."role"
           FROM "public"."user_profiles"
          WHERE ("user_profiles"."id" = "auth"."uid"())) = 'admin'::"text"))))));



CREATE POLICY "boq_routes_insert" ON "public"."boq_routes" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."boq"
  WHERE (("boq"."id" = "boq_routes"."boq_id") AND (("boq"."created_by" IS NULL) OR ("boq"."created_by" = "auth"."uid"()) OR ("boq"."assigned_to" = "auth"."uid"()) OR (( SELECT "user_profiles"."role"
           FROM "public"."user_profiles"
          WHERE ("user_profiles"."id" = "auth"."uid"())) = 'admin'::"text") OR (( SELECT "user_profiles"."role"
           FROM "public"."user_profiles"
          WHERE ("user_profiles"."id" = "auth"."uid"())) = 'dept_manager'::"text") OR (( SELECT "user_profiles"."role"
           FROM "public"."user_profiles"
          WHERE ("user_profiles"."id" = "auth"."uid"())) = 'sector_manager'::"text"))))));



CREATE POLICY "boq_routes_select" ON "public"."boq_routes" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."boq"
  WHERE ("boq"."id" = "boq_routes"."boq_id"))));



CREATE POLICY "boq_routes_update" ON "public"."boq_routes" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."boq"
  WHERE (("boq"."id" = "boq_routes"."boq_id") AND (("boq"."created_by" = "auth"."uid"()) OR ("boq"."assigned_to" = "auth"."uid"()) OR ("boq"."created_by" IS NULL) OR (( SELECT "user_profiles"."role"
           FROM "public"."user_profiles"
          WHERE ("user_profiles"."id" = "auth"."uid"())) = ANY (ARRAY['admin'::"text", 'dept_manager'::"text", 'sector_manager'::"text"])))))));



CREATE POLICY "boq_select" ON "public"."boq" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'admin'::"text") AND ("p"."status" = 'active'::"text")))) OR (("created_by" IS NOT NULL) AND ("created_by" = "auth"."uid"())) OR (("assigned_to" IS NOT NULL) AND ("assigned_to" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."status" = 'active'::"text"))))) OR (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."status" = 'active'::"text") AND ("p"."role" = ANY (ARRAY['staff'::"text", 'sector_manager'::"text"])) AND ("p"."sector_id" IS NOT NULL) AND ("boq"."sector_id" IS NOT NULL) AND ("boq"."created_by" IS NOT NULL) AND ("boq"."sector_id" = "p"."sector_id")))) OR (EXISTS ( SELECT 1
   FROM "public"."user_profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."status" = 'active'::"text") AND ("p"."role" = ANY (ARRAY['dept_manager'::"text", 'procurement'::"text"])) AND ("p"."department_id" IS NOT NULL) AND ("boq"."department_id" IS NOT NULL) AND ("boq"."created_by" IS NOT NULL) AND ("boq"."department_id" = "p"."department_id"))))));



CREATE POLICY "boq_update" ON "public"."boq" FOR UPDATE USING ((("created_by" IS NULL) OR (( SELECT "user_profiles"."role"
   FROM "public"."user_profiles"
  WHERE ("user_profiles"."id" = "auth"."uid"())) = 'admin'::"text") OR ((( SELECT "user_profiles"."role"
   FROM "public"."user_profiles"
  WHERE ("user_profiles"."id" = "auth"."uid"())) = 'dept_manager'::"text") AND ("department_id" = ( SELECT "user_profiles"."department_id"
   FROM "public"."user_profiles"
  WHERE ("user_profiles"."id" = "auth"."uid"())))) OR ((( SELECT "user_profiles"."role"
   FROM "public"."user_profiles"
  WHERE ("user_profiles"."id" = "auth"."uid"())) = 'sector_manager'::"text") AND ("sector_id" = ( SELECT "user_profiles"."sector_id"
   FROM "public"."user_profiles"
  WHERE ("user_profiles"."id" = "auth"."uid"())))) OR ((( SELECT "user_profiles"."role"
   FROM "public"."user_profiles"
  WHERE ("user_profiles"."id" = "auth"."uid"())) = 'staff'::"text") AND (("created_by" = "auth"."uid"()) OR ("assigned_to" = "auth"."uid"())))));



ALTER TABLE "public"."departments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."factor_reference" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "factor_reference_admin_modify" ON "public"."factor_reference" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "user_profiles"."id"
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."role" = 'admin'::"text") AND ("user_profiles"."status" = 'active'::"text"))))) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "user_profiles"."id"
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."role" = 'admin'::"text") AND ("user_profiles"."status" = 'active'::"text")))));



CREATE POLICY "factor_reference_select" ON "public"."factor_reference" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."price_list" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "price_list_delete" ON "public"."price_list" FOR DELETE TO "authenticated" USING ((( SELECT "user_profiles"."role"
   FROM "public"."user_profiles"
  WHERE ("user_profiles"."id" = "auth"."uid"())) = 'admin'::"text"));



CREATE POLICY "price_list_insert" ON "public"."price_list" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "user_profiles"."role"
   FROM "public"."user_profiles"
  WHERE ("user_profiles"."id" = "auth"."uid"())) = 'admin'::"text"));



CREATE POLICY "price_list_select" ON "public"."price_list" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "price_list_update" ON "public"."price_list" FOR UPDATE TO "authenticated" USING ((( SELECT "user_profiles"."role"
   FROM "public"."user_profiles"
  WHERE ("user_profiles"."id" = "auth"."uid"())) = 'admin'::"text"));



ALTER TABLE "public"."sectors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_approve_user"("p_target_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_approve_user"("p_target_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_approve_user"("p_target_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_reject_user"("p_target_id" "uuid", "p_note" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_reject_user"("p_target_id" "uuid", "p_note" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_reject_user"("p_target_id" "uuid", "p_note" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."can_approve_boq"("p_boq_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_approve_boq"("p_boq_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_approve_boq"("p_boq_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_profile"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_role"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_role"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."lock_org_fields_after_onboarding"() TO "anon";
GRANT ALL ON FUNCTION "public"."lock_org_fields_after_onboarding"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."lock_org_fields_after_onboarding"() TO "service_role";



GRANT ALL ON FUNCTION "public"."save_boq_with_routes"("p_boq_id" "uuid", "p_boq_data" "jsonb", "p_routes" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."save_boq_with_routes"("p_boq_id" "uuid", "p_boq_data" "jsonb", "p_routes" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."save_boq_with_routes"("p_boq_id" "uuid", "p_boq_data" "jsonb", "p_routes" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_boq_routes_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_boq_routes_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_boq_routes_updated_at"() TO "service_role";



GRANT ALL ON TABLE "public"."app_settings" TO "anon";
GRANT ALL ON TABLE "public"."app_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."app_settings" TO "service_role";



GRANT ALL ON TABLE "public"."boq" TO "anon";
GRANT ALL ON TABLE "public"."boq" TO "authenticated";
GRANT ALL ON TABLE "public"."boq" TO "service_role";



GRANT ALL ON TABLE "public"."boq_items" TO "anon";
GRANT ALL ON TABLE "public"."boq_items" TO "authenticated";
GRANT ALL ON TABLE "public"."boq_items" TO "service_role";



GRANT ALL ON TABLE "public"."boq_routes" TO "anon";
GRANT ALL ON TABLE "public"."boq_routes" TO "authenticated";
GRANT ALL ON TABLE "public"."boq_routes" TO "service_role";



GRANT ALL ON TABLE "public"."departments" TO "anon";
GRANT ALL ON TABLE "public"."departments" TO "authenticated";
GRANT ALL ON TABLE "public"."departments" TO "service_role";



GRANT ALL ON TABLE "public"."factor_reference" TO "anon";
GRANT ALL ON TABLE "public"."factor_reference" TO "authenticated";
GRANT ALL ON TABLE "public"."factor_reference" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON TABLE "public"."price_list" TO "anon";
GRANT ALL ON TABLE "public"."price_list" TO "authenticated";
GRANT ALL ON TABLE "public"."price_list" TO "service_role";



GRANT ALL ON TABLE "public"."sectors" TO "anon";
GRANT ALL ON TABLE "public"."sectors" TO "authenticated";
GRANT ALL ON TABLE "public"."sectors" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







