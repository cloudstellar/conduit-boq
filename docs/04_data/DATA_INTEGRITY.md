# Data Integrity
## Conduit BOQ System

**Last Updated:** 2026-01-22  
**Status:** Canonical

---

## 1. Row Level Security (RLS)

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

## 2. Indexes

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

## 3. Triggers

### Auto-update timestamps
- `update_updated_at()` - Updates `updated_at` on any table modification

### Auto-create user profile
- `handle_new_user()` - Creates user_profiles entry when auth.users row is created

### Lock org fields after onboarding (v1.2.0)
- `lock_org_fields_after_onboarding()` - Prevents user from changing dept/sector after onboarding
- Admin bypass: Admins can still modify these fields

---

## 4. RPC Functions (v1.2.0)

| Function | Description |
|----------|-------------|
| `admin_approve_user(p_target_id)` | Atomic approve: copies requested→actual, sets active |
| `admin_reject_user(p_target_id, p_note)` | Reject user with note |

---

## 5. Phase 2 Schema Preview (PLANNED)

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

---

## References

- Full schema: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
- Security: [SECURITY_MODEL.md](./SECURITY_MODEL.md)
- Migrations: [MIGRATIONS.md](./MIGRATIONS.md)
