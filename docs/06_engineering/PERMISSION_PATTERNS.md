# Permission Patterns
## Conduit BOQ System

**Last Updated:** 2026-10-23
**Historical snapshot:** P-49 target before its completed Production
remediation and formal closeout

<!-- RELEASE_ALIGNMENT_20261023 -->
> **Recorded release state — 2026-10-23:** dependency A (`a3114fc`) and
> [stale-Copy B](STALE_COPY_B_RELEASE_CLOSEOUT_20261023.md) (`42e01c5` + Production 031 ledger `20261023063934`)
> are closed. [L1 Production result](LIST_1B_L1_PRODUCTION_RELEASE_RESULT_20261023.md) records exact `b1ce449`,
> Ready/Current and bounded no-write smoke PASS at its observation time.
> B Production stale HTTP remains **NOT RUN**, closed rather than a pending
> test. Migrations **027–031 are immutable/no-replay**. Earlier dated
> pending/candidate/approval wording below preserves its own stage. This local
> documentation alignment makes no fresh Production observation and grants
> no runtime, DB, reset, migration or publication authority.

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

<!-- DUP1_CURRENT_STATE_20260831 -->
> [!IMPORTANT]
> Atomic BOQ Duplicate is live through migration 029; see
> [DUP-1 Production Result](../plans/product/04-atomic-boq-duplicate-production-release-result.md).
> The dated “no 029” line above is the 2026-08-29 Master Catalog observation.
> Migrations 027/028/029 are now applied-once/no-replay.

<!-- SAVE_GUARD_PRODUCTION_CLOSEOUT_20261012 -->
> [!IMPORTANT]
> Migration 030 is `PRODUCTION PASS`, applied once as
> `20261012100608/boq_save_null_authorization_guard`; see [Security Result
> #04](../plans/security/04-boq-save-null-authorization-production-release-result.md).
> The Save RPC uses `IS NOT TRUE` for the final nullable authorization decision.
> Client helpers remain UX only; database authorization remains authoritative.
> Migrations 027–030 are immutable/no-replay.

> **2026-10-14 planning boundary:** `approve`/committee helper examples below
> are eligibility illustrations, not evidence of a complete BOQ approval UI,
> transition API or immutable issued revision. Proposed W-H records external
> signed-paper approval; recorder authority remains undecided. S0/user and SSO
> work must retain trusted current-profile status + role + scope checks and
> Auth UUID ownership continuity. IdP/protocol remain unknown; do not infer
> provisioning, automatic account linking or role activation from SSO. See
> [Integrated Roadmap #09](../plans/product/09-integrated-roadmap-and-it-decision-handoff.md).

---

L1 page/count and route reads continue under the existing actor/RLS scope.
Client list invalidation, actor-separated session storage and logout cleanup
are UX safeguards, not server revocation/offboarding or S0 completion. Copy
retains the captured source ID/request UUID/source token and the 031 conflict
contract; no list helper replaces the trusted RPC authorization boundary.

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

### Atomic copy request pattern

UI eligibility and `lib/boq/duplicate.ts` are advisory/transport contracts. A
copy must go through `public.duplicate_boq_atomic`; never implement it as a
client sequence of header/route/item inserts.

- Generate one stable UUID request key per user intent and reuse that exact key
  only when retrying the same full parameter contract after an uncertain
  response.
- Send the source `boq.updated_at` as the expected write token. On stale-token
  failure, reload and require a new user intent/request key; do not auto-copy a
  changed source.
- Disable duplicate triggers while a request is pending, but rely on database
  idempotency—not button state—to prevent duplicate destinations.
- Treat the RPC as final authority for active role/source scope, graph
  integrity, mode/Factor eligibility, and retry matching. Permanent failures
  use the explicit mode-appropriate recovery (open source/select Factor or
  Create New), never an infinite retry.
- Never grant the browser direct access to `private.boq_copy_requests` or the
  graph helper.

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
- Atomic copy client: `lib/boq/duplicate.ts`
