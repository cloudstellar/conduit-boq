# Permission Patterns
## Conduit BOQ System

**Last Updated:** 2026-08-18
**Status:** P-49 target canonical; risk open/high; remediation deferred under
P-51; P-13 separately unauthorized

> [!IMPORTANT]
> P-49 changes the pending business rule to profile/onboarding-only. Current
> `lib/permissions.ts`, middleware, BOQ RLS/RPC, Factor F reads, profile grants,
> and privileged APIs are not yet aligned. UI permission helpers are never the
> authorization boundary. P-51 accepts this risk temporarily but does not
> change the permission target. See
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

P-49 therefore cannot be implemented by editing `can()` alone. The future database
grants/policies/RPCs, server/API checks, middleware allowlist, loaders/actions,
and UI must pass the same matrix. Current source still implements the former
pending-own-BOQ rule and remains an open risk rather than an accepted pattern.

---

## 6. Status-Based Rules

| User Status | Effect |
|-------------|--------|
| `active` | Full role permissions |
| `pending` | Profile/onboarding only (P-49 target; current runtime not yet aligned) |
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
