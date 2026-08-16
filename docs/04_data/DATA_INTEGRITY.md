# Data Integrity
## Conduit BOQ System

**Last Updated:** 2026-08-17
**Status:** P-49 target recorded; current authorization gap blocks P-13

> [!IMPORTANT]
> The former pending-own-BOQ rule is superseded as business intent by P-49.
> The approved target is `pending = profile/onboarding-only`.
> Current database paths are not yet aligned, so this document distinguishes
> current behavior from the approved target. See [P-49 Plan](../plans/master-catalog/45-phase4-p49-pending-authorization-hardening-plan.md).

---

## 1. Row Level Security (RLS)

### Historical/core enabled-table excerpt

This seven-table list is a legacy core excerpt, not the current complete RLS
inventory. Current scope also includes settings, catalog/price, Factor F, and
Phase 4 surfaces; P-49 requires an exact grants/policies/functions inventory.
- `user_profiles`
- `boq`
- `boq_routes`
- `boq_items`
- `organizations`
- `departments`
- `sectors`

### Key Policies

**user_profiles:**
- Frozen baseline currently includes permissive authenticated policy
  `Users can view all profiles`; this is a source-derived profile/PII release
  blocker pending exact read-only live verification
- Admin can read/update all
- Managers can read profiles in their department
- Current own-row INSERT may exploit the profile `active` default; UPDATE
  grants/policies are broader than the P-49 safe-field target; role-only admin
  UPDATE and the trigger do not protect the full state machine. Treat profile
  self-creation/protected-field mutation as open high-priority blockers.

**boq:**
- Legacy BOQ (created_by IS NULL): **Admin-only** (v1.2.0)
- Owner/Assignee: always see own BOQ
- Sector access: staff/sector_manager (active only)
- Department access: dept_manager/procurement (active only)
- Current applied behavior: `009` BOQ owner visibility lacks a current active
  profile requirement, and `016` still permits pending saves.
- P-49 target: pending has no BOQ or other business-data access. Existing rows
  remain unchanged and hidden until valid activation.

**settings / role helpers / Factor F:**
- Current raw `app_settings` SELECT is anonymous/authenticated-wide;
  insert/update checks stored admin role without active status.
- Current authenticated `can_approve_boq` lacks an active-status check, and
  `get_user_role`/`is_admin` can disclose arbitrary-user role metadata.
- Legacy and versioned Factor F reads are authenticated-wide. P-49 requires
  complete table/view/RPC inventory and non-active denial before P-13.
- Organization/department/sector policies expose all selector rows to every
  authenticated status; P-49 permits pending only active onboarding selectors
  and denies them to inactive/suspended/missing/unknown profiles.

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
- It does not currently protect `role` or `status`; do not treat it as a
  complete profile-authority boundary.

---

## 4. RPC Functions (v1.2.0)

| Function | Description |
|----------|-------------|
| `admin_approve_user(p_target_id)` | Atomic approve: copies requested→actual, sets active |
| `admin_reject_user(p_target_id, p_note)` | Reject user with note |

Every privileged profile operation must ultimately require current
`role='admin' AND status='active'`. The exact forward-only correction and its
real-session matrix require separate Owner authority before P-13.

---

## 5. Historical v26 integrity baseline and current P-12 overlay

The bullets below record the earlier Phase 1A/1B contract. P-12 later applied
and verified Phase 4 `017` -> `017a` -> `018`-`026`, including its additional
identity/code/import/publication/audit controls, with all Phase 4 flags false.
Use [MIGRATIONS.md](./MIGRATIONS.md) and
[Verification Report #13](../plans/master-catalog/13-phase4-verification-report.md)
for current ledger/evidence rather than treating this historical subsection as
a planned-state claim.

- `price_list_default_version` is the singleton source of truth for the active
  default catalog.
- `price_list.version_id` is backfilled and then required.
- `boq.price_list_version_id` remains nullable during the application rollout,
  then becomes `NOT NULL` and immutable in Phase 1B.
- `boq_items.category` stores the historical category snapshot.
- `price_list_audit_logs` was created in Phase 1A; the later Phase 4 audit
  controls are applied and verified under P-12.
- Cross-version BOQ items are rejected by `save_boq_with_routes`.

See [ADR-002](../02_architecture/ADR/ADR-002-versioned-master-catalog.md) and
the [verification report](../plans/master-catalog/05-verification-report.md).

---

## References

- Full schema: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
- Security: [SECURITY_MODEL.md](./SECURITY_MODEL.md)
- Migrations: [MIGRATIONS.md](./MIGRATIONS.md)
