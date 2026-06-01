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

## 5. Master Catalog v26 Integrity Preview (PLANNED)

- `price_list_default_version` is the singleton source of truth for the active
  default catalog.
- `price_list.version_id` is backfilled and then required.
- `boq.price_list_version_id` remains nullable during the application rollout,
  then becomes `NOT NULL` and immutable in Phase 1B.
- `boq_items.category` stores the historical category snapshot.
- `price_list_audit_logs` is created in Phase 1A; audit triggers remain Phase 4
  scope.
- Cross-version BOQ items are rejected by `save_boq_with_routes`.

See [ADR-002](../02_architecture/ADR/ADR-002-versioned-master-catalog.md) and
the [verification report](../plans/master-catalog/05-verification-report.md).

---

## References

- Full schema: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
- Security: [SECURITY_MODEL.md](./SECURITY_MODEL.md)
- Migrations: [MIGRATIONS.md](./MIGRATIONS.md)
