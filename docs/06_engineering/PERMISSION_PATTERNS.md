# Permission Patterns
## Conduit BOQ System

**Last Updated:** 2026-08-18
**Historical snapshot:** P-49 target before its completed Production
remediation and formal closeout

<!-- MASTER_CATALOG_CURRENT_STATE_20260829 -->
> [!IMPORTANT]
> **Current state:** P-49 implementation and formal closeout are complete; see
> [Handoff #106](../plans/master-catalog/106-phase4-master-catalog-exact-remaining-work-handoff.md)
> and [Result #107](../plans/master-catalog/107-phase4-p49-master-catalog-final-closeout-result.md).
> A read-only Production recheck at `2026-08-29 01:38:54 +07` reconfirmed the
> three catalog flags plus migration-028 functions/raw `app_settings` ACL,
> migrations 027 then 028 with no 029, and `0` working drafts at that instant;
> it made no write. The former
> open-risk and runtime-not-aligned wording below is historical chronology,
> not the current permission state or replay authority.

> [!NOTE]
> **Historical P-49 note (2026-08-18):** P-49 changed the pending business
> rule to profile/onboarding-only. The application and database layers listed
> below were not yet aligned at that date. UI permission helpers are never the
> authorization boundary. P-51 temporarily accepted rather than changed the
> target. See
> [P-51 Plan](../plans/master-catalog/48-phase4-p51-risk-accepted-master-catalog-closeout-plan.md).

---

## 1. Client-Side Permission Check

```typescript
import { can } from '@/lib/permissions'

// Check if user can create BOQ
if (can(user, 'create', 'boq')) {
  // Show create button
}

// Check with context
if (can(user, 'update', 'boq', { created_by: boq.created_by })) {
  // Show edit button
}

// Check approval (separation of duties)
if (can(user, 'approve', 'boq', { created_by: boq.created_by })) {
  // Show approve button (blocked if user is creator)
}
```

---

## 2. Actions & Resources

### Available Actions
- `create` — Create new record
- `read` — View record
- `update` — Edit record
- `delete` — Remove record
- `approve` — Approve BOQ
- `assign_committee` — Assign review committee

### Resources
- `boq` — Bill of Quantities
- `user` — User management
- `price_list` — Price list
- `committee` — Review committee
- `profile` — User profile

---

## 3. BOQ Context Interface

```typescript
interface BOQContext {
  created_by?: string | null
  assigned_to?: string | null
  sector_id?: string | null
  department_id?: string | null
  status?: string
}
```

---

## 4. Role-Based Rules

### Admin
- Can do everything
- Cannot approve own BOQ (separation of duties)

### Dept Manager
- Full access to department BOQs
- Can approve BOQs in department (if not creator)

### Sector Manager
- Full access to sector BOQs
- Read access to department BOQs
- Can approve BOQs in sector (if not creator)

### Staff
- Full access to own BOQs
- Read access to same sector BOQs
- Cannot approve

### Procurement
- Read-only on approved BOQs in department

### Pending
- Authentication self-service, truthful waiting state, and own safe
  profile/onboarding fields only
- No Dashboard, BOQ, Price List/Master Catalog, Factor F, export/print, admin,
  business RPC, or privileged API
- A stored role has no authority until the current profile status is `active`
- Existing pending-owned BOQs are retained but hidden and inoperable

---

## 5. Key Rules

### Separation of Duties
```typescript
// Creator cannot approve own BOQ
if (action === 'approve' && context?.created_by === user.id) {
  return false
}
```

### Legacy Data
```typescript
// Legacy BOQs (created_by = NULL) are admin-only
// This is enforced by RLS, not just permissions.ts
const isLegacy = context?.created_by === null
```

> [!WARNING]
> RLS is the source of truth. The `can()` function is for UI display only.

**Historical implementation note (2026-08-18):** P-49 could not be implemented
by editing `can()` alone. The future database grants/policies/RPCs, server/API
checks, middleware allowlist, loaders/actions, and UI had to pass the same
matrix. At that date, the source still implemented the former pending-own-BOQ
rule and remained an open risk rather than an accepted pattern.

---

## 6. Status-Based Rules

| User Status | Effect |
|-------------|--------|
| `active` | Full role permissions |
| `pending` | Profile/onboarding only (P-49 target; runtime alignment was still pending in this 2026-08-18 snapshot) |
| `inactive` | No business access; own blocked status and auth self-service only; no profile edits |
| `suspended` | No business access; own blocked status and auth self-service only; no profile edits |

Protected profile fields (`role`, `status`, actual organization, identity/email,
approval/rejection, and audit fields) are never normal self-service. Every
privileged server/API operation must require both current `role='admin'` and
`status='active'` before any service-role call.

The frozen baseline `Users can view all profiles` policy is not an acceptable
substitute for role-scoped profile reads. Pending/inactive/suspended must receive
zero other-profile rows through direct Data API/RPC access and may not edit
their own onboarding/profile fields after becoming inactive/suspended. Active
role-scoped behavior remains a separate preserved contract rather than being
silently broadened or narrowed by P-49.

The same rule applies beyond tables: `app_settings`, `can_approve_boq`,
`get_user_role`, and `is_admin` need exact audience/status/scope checks. A
stored admin role on a non-active profile is never sufficient authorization,
and ordinary callers must not use an arbitrary user ID as a role-disclosure API.

---

## References

- Access Model: [03_domain/ACCESS_MODEL.md](../03_domain/ACCESS_MODEL.md)
- Code: `lib/permissions.ts`
