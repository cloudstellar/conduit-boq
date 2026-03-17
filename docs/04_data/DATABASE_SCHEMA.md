# Database Schema
## Conduit BOQ System

**Last Updated:** 2026-01-22  
**Status:** Canonical  
**Database:** PostgreSQL 15 (Supabase)

---

## 📊 Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  organizations  │──1:N──│   departments   │──1:N──│     sectors     │
└─────────────────┘       └─────────────────┘       └─────────────────┘
                                   │                         │
                                   └────────────┬────────────┘
                                                │
                                         ┌──────▼──────┐
                                         │user_profiles│
                                         └──────┬──────┘
                                                │
                          ┌─────────────────────┼─────────────────────┐
                          │                     │                     │
                    ┌─────▼─────┐         ┌─────▼─────┐         ┌─────▼─────┐
                    │    boq    │──1:N────│ boq_routes│──1:N────│ boq_items │
                    └───────────┘         └───────────┘         └─────┬─────┘
                                                                      │
                                                                ┌─────▼─────┐
                                                                │price_list │
                                                                └───────────┘
```

---

## 📋 Tables

### 1. organizations
องค์กร (บริษัท)

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NO | Primary Key |
| `name` | TEXT | NO | ชื่อองค์กร |
| `code` | TEXT | YES | รหัสองค์กร (unique) |
| `is_active` | BOOLEAN | NO | สถานะการใช้งาน (default: true) |
| `created_at` | TIMESTAMPTZ | NO | วันที่สร้าง |
| `updated_at` | TIMESTAMPTZ | NO | วันที่แก้ไขล่าสุด |

---

### 2. departments
ฝ่าย

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NO | Primary Key |
| `org_id` | UUID | YES | FK → organizations.id |
| `code` | TEXT | NO | รหัสฝ่าย |
| `name` | TEXT | NO | ชื่อย่อ |
| `full_name` | TEXT | YES | ชื่อเต็ม |
| `is_active` | BOOLEAN | NO | สถานะการใช้งาน |
| `created_at` | TIMESTAMPTZ | NO | วันที่สร้าง |
| `updated_at` | TIMESTAMPTZ | NO | วันที่แก้ไขล่าสุด |

**Constraints:** UNIQUE (org_id, code)

---

### 3. sectors
ส่วน

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NO | Primary Key |
| `department_id` | UUID | NO | FK → departments.id |
| `code` | TEXT | NO | รหัสส่วน |
| `name` | TEXT | NO | ชื่อย่อ |
| `full_name` | TEXT | YES | ชื่อเต็ม |
| `is_active` | BOOLEAN | NO | สถานะการใช้งาน |
| `created_at` | TIMESTAMPTZ | NO | วันที่สร้าง |
| `updated_at` | TIMESTAMPTZ | NO | วันที่แก้ไขล่าสุด |

**Constraints:** UNIQUE (department_id, code)

---

### 4. user_profiles
ข้อมูลผู้ใช้งาน

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NO | PK, FK → auth.users.id |
| `employee_id` | TEXT | YES | รหัสพนักงาน |
| `title` | TEXT | YES | คำนำหน้า (นาย/นาง/นางสาว) |
| `first_name` | TEXT | NO | ชื่อ |
| `last_name` | TEXT | NO | นามสกุล |
| `position` | TEXT | YES | ตำแหน่ง |
| `org_id` | UUID | YES | FK → organizations.id |
| `department_id` | UUID | YES | FK → departments.id |
| `sector_id` | UUID | YES | FK → sectors.id |
| `role` | TEXT | NO | บทบาท (admin/dept_manager/sector_manager/staff/procurement) |
| `email` | TEXT | YES | อีเมล |
| `phone` | TEXT | YES | เบอร์โทร |
| `signature_url` | TEXT | YES | URL ลายเซ็น (future) |
| `status` | TEXT | NO | สถานะ (active/inactive/suspended/pending) |
| `onboarding_completed` | BOOLEAN | NO | เสร็จสิ้น onboarding |
| `requested_department_id` | UUID | YES | FK → departments.id (v1.2.0) |
| `requested_sector_id` | UUID | YES | FK → sectors.id (v1.2.0) |
| `approved_at` | TIMESTAMPTZ | YES | วันที่อนุมัติ (v1.2.0) |
| `approved_by` | UUID | YES | FK → auth.users.id (v1.2.0) |
| `rejected_at` | TIMESTAMPTZ | YES | วันที่ปฏิเสธ (v1.2.0) |
| `rejected_by` | UUID | YES | FK → auth.users.id (v1.2.0) |
| `admin_note` | TEXT | YES | บันทึกจาก admin (v1.2.0) |
| `created_at` | TIMESTAMPTZ | NO | วันที่สร้าง |
| `updated_at` | TIMESTAMPTZ | NO | วันที่แก้ไขล่าสุด |

---

### 5. boq
BOQ Header - ใบประมาณราคา

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NO | Primary Key |
| `boq_number` | TEXT | YES | เลขที่เอกสาร |
| `estimator_name` | TEXT | NO | ชื่อผู้ประมาณราคา |
| `document_date` | DATE | NO | วันที่เอกสาร |
| `project_name` | TEXT | NO | ชื่อโครงการ |
| `route` | TEXT | YES | เส้นทาง (legacy) |
| `construction_area` | TEXT | YES | พื้นที่ก่อสร้าง (legacy) |
| `department` | TEXT | YES | หน่วยงาน (text) |
| `total_material_cost` | DECIMAL(15,2) | NO | รวมค่าวัสดุ |
| `total_labor_cost` | DECIMAL(15,2) | NO | รวมค่าแรง |
| `total_cost` | DECIMAL(15,2) | NO | รวมทั้งหมด |
| `factor_f` | DECIMAL(10,4) | YES | ค่า Factor F |
| `total_with_factor_f` | DECIMAL(15,2) | NO | รวมหลังคูณ Factor F |
| `total_with_vat` | DECIMAL(15,2) | NO | รวมหลัง VAT 7% |
| `factor_f_raw` | DECIMAL(15,4) | YES | ค่าเบื้องต้นดิบ (ก่อนปัด) |
| `factor_f_lower_cost` | DECIMAL(15,2) | YES | B: ค่างานต้นทุนตัวต่ำ |
| `factor_f_upper_cost` | DECIMAL(15,2) | YES | C: ค่างานต้นทุนตัวสูง |
| `factor_f_lower_value` | DECIMAL(10,4) | YES | D: ค่า Factor F ของ B |
| `factor_f_upper_value` | DECIMAL(10,4) | YES | E: ค่า Factor F ของ C |
| `status` | TEXT | NO | สถานะ (draft/submitted/approved) ¹ |

¹ Reserved for Phase 3: `pending_review`, `pending_approval`
| `created_by` | UUID | YES | FK → auth.users.id |
| `assigned_to` | UUID | YES | FK → auth.users.id |
| `org_id` | UUID | YES | FK → organizations.id |
| `department_id` | UUID | YES | FK → departments.id |
| `sector_id` | UUID | YES | FK → sectors.id |
| `updated_by` | UUID | YES | FK → auth.users.id |
| `created_at` | TIMESTAMPTZ | NO | วันที่สร้าง |
| `updated_at` | TIMESTAMPTZ | NO | วันที่แก้ไขล่าสุด |

---

### 6. boq_routes
เส้นทางของ BOQ (Multi-Route Support)

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NO | Primary Key |
| `boq_id` | UUID | NO | FK → boq.id (CASCADE) |
| `route_order` | INTEGER | NO | ลำดับเส้นทาง |
| `route_name` | TEXT | NO | ชื่อเส้นทาง |
| `route_description` | TEXT | YES | รายละเอียด |

---

### 7. boq_items
รายการใน BOQ

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NO | Primary Key |
| `boq_id` | UUID | NO | FK → boq.id (CASCADE) |
| `route_id` | UUID | YES | FK → boq_routes.id (CASCADE) |
| `item_order` | INTEGER | NO | ลำดับรายการ |
| `price_list_id` | UUID | YES | FK → price_list.id |
| `item_name` | TEXT | NO | ชื่อรายการ |
| `quantity` | DECIMAL | NO | จำนวน |
| `unit` | TEXT | NO | หน่วย |
| `material_cost_per_unit` | DECIMAL | NO | ค่าวัสดุต่อหน่วย |
| `labor_cost_per_unit` | DECIMAL | NO | ค่าแรงต่อหน่วย |
| `unit_cost` | DECIMAL | NO | ราคาต่อหน่วย |
| `total_material_cost` | DECIMAL | NO | รวมค่าวัสดุ |
| `total_labor_cost` | DECIMAL | NO | รวมค่าแรง |
| `total_cost` | DECIMAL | NO | รวมทั้งหมด |
| `remarks` | TEXT | YES | หมายเหตุ |
| `created_at` | TIMESTAMPTZ | NO | วันที่สร้าง |
| `updated_at` | TIMESTAMPTZ | NO | วันที่แก้ไขล่าสุด |

---

### 8. price_list
รายการราคามาตรฐาน (518 รายการ, 52 หมวด)

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NO | Primary Key |
| `item_code` | TEXT | NO | รหัสรายการ |
| `item_name` | TEXT | NO | ชื่อรายการ |
| `unit` | TEXT | NO | หน่วย |
| `material_cost` | DECIMAL | NO | ค่าวัสดุ |
| `labor_cost` | DECIMAL | NO | ค่าแรง |
| `unit_cost` | DECIMAL | NO | ราคารวมต่อหน่วย |
| `category` | TEXT | YES | หมวดหมู่ |
| `remarks` | TEXT | YES | หมายเหตุ |
| `is_active` | BOOLEAN | NO | สถานะการใช้งาน |
| `created_at` | TIMESTAMPTZ | NO | วันที่สร้าง |
| `updated_at` | TIMESTAMPTZ | NO | วันที่แก้ไขล่าสุด |

---

### 9. factor_reference
ตารางอ้างอิง Factor F

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | UUID | NO | Primary Key |
| `cost_million` | DECIMAL | NO | วงเงิน (ล้านบาท) |
| `operation_percent` | DECIMAL | NO | % ค่าดำเนินการ |
| `interest_percent` | DECIMAL | NO | % ดอกเบี้ย |
| `profit_percent` | DECIMAL | NO | % กำไร |
| `total_expense_percent` | DECIMAL | NO | % ค่าใช้จ่ายรวม |
| `factor` | DECIMAL | NO | Factor |
| `vat_percent` | DECIMAL | NO | % VAT |
| `factor_f` | DECIMAL | NO | Factor F |
| `factor_f_rain_1` | DECIMAL | NO | Factor F ฤดูฝน 1 |
| `factor_f_rain_2` | DECIMAL | NO | Factor F ฤดูฝน 2 |
| `created_at` | TIMESTAMPTZ | NO | วันที่สร้าง |

---

### 10. app_settings
ตั้งค่าระบบ

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `key` | TEXT | NO | Primary Key |
| `value` | JSONB | YES | ค่า (JSON) |
| `created_at` | TIMESTAMPTZ | NO | วันที่สร้าง |
| `updated_at` | TIMESTAMPTZ | NO | วันที่แก้ไขล่าสุด |

---

## 🔒 Row Level Security (RLS)

### Enabled Tables
- `user_profiles`
- `boq`
- `boq_routes`
- `boq_items`
- `organizations`
- `departments`
- `sectors`

### Key Policies

**user_profiles:**
- Users can read their own profile
- Admin can read/update all
- Managers can read profiles in their department

**boq:**
- Legacy BOQ (created_by IS NULL): **Admin-only** (v1.2.0)
- Owner/Assignee: always see own BOQ
- Sector access: staff/sector_manager (active only)
- Department access: dept_manager/procurement (active only)
- Pending users: own BOQ only (no sector/dept access)

---

## 📇 Indexes

### BOQ Indexes
```sql
idx_boq_created_by          ON boq(created_by)
idx_boq_assigned_to         ON boq(assigned_to)
idx_boq_sector_id           ON boq(sector_id)
idx_boq_department_id       ON boq(department_id)
idx_boq_org_id              ON boq(org_id)
idx_boq_sector_status       ON boq(sector_id, status)
idx_boq_department_status   ON boq(department_id, status)
idx_boq_created_by_status   ON boq(created_by, status)
```

### User Profile Indexes
```sql
idx_user_profiles_role       ON user_profiles(role)
idx_user_profiles_sector     ON user_profiles(sector_id)
idx_user_profiles_department ON user_profiles(department_id)
```

### Route/Item Indexes
```sql
idx_boq_routes_boq_id    ON boq_routes(boq_id)
idx_boq_routes_order     ON boq_routes(boq_id, route_order)
idx_boq_items_route_id   ON boq_items(route_id)
```

---

## 🔄 Triggers

### Auto-update timestamps
- `update_updated_at()` - Updates `updated_at` on any table modification

### Auto-create user profile
- `handle_new_user()` - Creates user_profiles entry when auth.users row is created

### Lock org fields after onboarding (v1.2.0)
- `lock_org_fields_after_onboarding()` - Prevents user from changing dept/sector after onboarding

---

## 🔧 RPC Functions (v1.2.0)

| Function | Description |
|----------|-------------|
| `admin_approve_user(p_target_id)` | Atomic approve: copies requested→actual, sets active |
| `admin_reject_user(p_target_id, p_note)` | Reject user with note |

---

## 📁 Migration Files

| File | Description | Status |
|------|-------------|--------|
| `001_backup_before_migration.sql` | Backup queries | ✅ Applied |
| `002_add_multi_route_support.sql` | Multi-route tables | ✅ Applied |
| `003_add_construction_area_to_routes.sql` | Route areas | ✅ Applied |
| `004_phase1a_auth_ownership.sql` | Auth & ownership columns | ✅ Applied |
| `005_phase1a_seed_and_rls.sql` | Seed data & RLS policies | ✅ Applied |
| `006_phase1a_rls_write_and_approval.sql` | RLS write policies | ✅ Applied |
| `007_add_requested_org_columns.sql` | Onboarding columns (v1.2.0) | ✅ Applied |
| `007b_add_onboarding_completed.sql` | onboarding_completed column | ✅ Applied (manual) |
| `008_pending_user_status.sql` | Pending status for new users | ✅ Applied |
| `008_rls_and_trigger.sql` | RLS + Trigger + RPC (v1.2.0) | ✅ Applied |
| `20260317_factor_f_supplement.sql` | Factor F snapshot columns | ✅ Applied |

---

## 🔗 Related Documentation

- **Domain Model:** [docs/ai/DOMAIN_MODEL.md](./ai/DOMAIN_MODEL.md)
- **RLS Decision:** [docs/ai/DECISIONS/ADR-001](./ai/DECISIONS/ADR-001-supabase-rls-authorization.md)

---

## 🔮 Phase 2 Schema Preview (PLANNED)

### NEW: price_list_versions
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| `year` | INTEGER | ปีบัญชีราคา |
| `name` | TEXT | ชื่อ version |
| `status` | TEXT | draft/active/archived |
| `is_default` | BOOLEAN | Default version |

**Constraints:** `UNIQUE WHERE is_default = true`, default requires active

### MODIFY: price_list
- Add `version_id UUID NOT NULL`
- Add `UNIQUE (version_id, item_code)`

### MODIFY: boq
- Add `price_list_version_id UUID NOT NULL` (immutable)
- Add `cloned_from_boq_id UUID` (NULLABLE)
- Add `source_model_id UUID` (NULLABLE, Phase 2C)

### NEW: system_event_log
- Trigger rejection logging
- Columns: `action`, `table_name`, `record_id`, `reason`, `created_at`

