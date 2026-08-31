# Data Integrity
## Conduit BOQ System

**Last Updated:** 2026-08-31
**Historical snapshot:** P-49 target before its completed Production
remediation and formal closeout

<!-- MASTER_CATALOG_CURRENT_STATE_20260829 -->
> [!IMPORTANT]
> **Current state:** P-49 implementation and formal closeout are complete; see
> [Handoff #106](../plans/master-catalog/106-phase4-master-catalog-exact-remaining-work-handoff.md)
> and [Result #107](../plans/master-catalog/107-phase4-p49-master-catalog-final-closeout-result.md).
> A read-only Production recheck at `2026-08-29 01:38:54 +07` reconfirmed 027
> then 028 with no 029, catalog `2568.1.0` at `710/710` with its reviewed
> prices, unchanged Factor F, the three catalog flags plus migration-028
> functions/raw `app_settings` ACL, and `0` working drafts at that instant; it
> made no write. The former open-risk and
> deferred-remediation wording below is historical chronology, not current
> behavior or replay authority.

> [!NOTE]
> **Historical P-49 note (2026-08-18):** The former pending-own-BOQ rule was
> superseded by the approved `pending = profile/onboarding-only` target. The
> database paths were not yet aligned at that date, and P-51 temporarily
> accepted rather than fixed that risk. See
> [P-51 Plan](../plans/master-catalog/48-phase4-p51-risk-accepted-master-catalog-closeout-plan.md).

<!-- DUP1_CURRENT_STATE_20260831 -->
> [!IMPORTANT]
> **Later product release:** Atomic BOQ Duplicate is live through migration 029;
> see [DUP-1 Production Result](../plans/product/04-atomic-boq-duplicate-production-release-result.md).
> The 2026-08-29 “no 029” statement above remains dated Master Catalog evidence,
> not the current ledger. Migrations 027/028/029 are all applied-once/no-replay.

## Atomic duplicate integrity invariants

- One authenticated actor/request ID/full parameter contract creates exactly
  one complete destination or none; a safe replay returns the same destination.
- The source BOQ, routes, and items remain unchanged. New route/item IDs are
  remapped atomically; mixed real-route plus unlinked-item graphs fail closed.
- Preserve mode retains Catalog/item/price/Factor provenance and stored totals.
  Selected-Factor mode is restricted to eligible positive-total Factor-unbound
  legacy BOQs, clears Factor-derived state, and blocks official output until a
  trusted save completes.
- The supported optimistic-write token is `boq.updated_at`. Arbitrary direct
  child-table DML outside the trusted save/copy boundary does not advance that
  header token; this is an accepted residual, not proof of arbitrary-DML graph
  freshness.
- `private.boq_copy_requests` is durable idempotency evidence with no current
  TTL/cleanup path. Do not delete its rows ad hoc: cleanup/retention must be
  separately designed so response-loss retry semantics remain safe.

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

> **Historical P-49 pre-remediation snapshot (2026-08-18):** The bullets in
> this subsection record the source-derived gaps that led to the correction.
> P-49 implementation/formal closeout are complete under #106/#107; do not read
> the words `current` or `blocker` below as the deployed state.

**user_profiles:**
- The frozen baseline then included permissive authenticated policy
  `Users can view all profiles`; this is a source-derived profile/PII release
  blocker recorded before the completed correction
- Admin can read/update all
- Managers can read profiles in their department
- At that snapshot, own-row INSERT could exploit the profile `active` default;
  UPDATE grants/policies were broader than the P-49 safe-field target; and the
  role-only Admin UPDATE plus old trigger did not protect the full state
  machine. Profile self-creation/protected-field mutation were open
  high-priority blockers at that time.

**boq:**
- Legacy BOQ (created_by IS NULL): **Admin-only** (v1.2.0)
- Owner/Assignee: always see own BOQ
- Sector access: staff/sector_manager (active only)
- Department access: dept_manager/procurement (active only)
- At that snapshot, applied `009` BOQ owner visibility lacked an active
  profile requirement, and `016` still permitted pending saves.
- P-49 target: pending has no BOQ or other business-data access. Existing rows
  remain unchanged and hidden until valid activation.

**settings / role helpers / Factor F:**
- At that snapshot, raw `app_settings` SELECT was anonymous/authenticated-wide;
  insert/update checks stored admin role without active status.
- At that snapshot, authenticated `can_approve_boq` lacked an active-status
  check, and `get_user_role`/`is_admin` could disclose arbitrary-user role
  metadata.
- Legacy and versioned Factor F reads were authenticated-wide in that snapshot.
  The later P-49 correction/closeout is recorded in #106/#107.
- Organization/department/sector policies exposed all selector rows to every
  authenticated status; the P-49 target permitted pending only active
  onboarding selectors and denied them to
  inactive/suspended/missing/unknown profiles.

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
- In the historical snapshot it did not protect `role` or `status`; do not
  treat that old trigger alone as a complete profile-authority boundary.

---

## 4. RPC Functions (v1.2.0)

| Function | Description |
|----------|-------------|
| `admin_approve_user(p_target_id)` | Atomic approve: copies requested→actual, sets active |
| `admin_reject_user(p_target_id, p_note)` | Reject user with note |

Every privileged profile operation must require current
`role='admin' AND status='active'`. The forward-only P-49 implementation and
formal closeout are complete under #106/#107. The unrun expanded Production
persona rehearsal remains an accepted residual, not PASS.

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
