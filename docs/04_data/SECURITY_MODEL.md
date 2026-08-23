# Security Model: Current Runtime and P-49 Target

**Current status (2026-08-18):** P-49 business target retained; security risk
open/high; remediation deferred until after the first P-15 closeout under the
bounded P-51 waiver. P-13 is not authorized but is no longer blocked solely by
P-49 for that exact closeout. See
[P-51 Closeout Plan](../plans/master-catalog/48-phase4-p51-risk-accepted-master-catalog-closeout-plan.md).

**P-49 target:** `pending = profile/onboarding-only`; implementation is not
authorized and the current runtime is not yet fully aligned.

## Authorization boundary

PostgreSQL grants, RLS, triggers, and guarded RPCs are the security boundary.
Client permissions, middleware, navigation, and copy must mirror that boundary
but cannot replace it. Unknown status, a missing profile, or an unclassified
resource/action fails closed.

## P-49 target access matrix

This matrix is the approved target, not a claim that the current runtime is
already aligned.

| Profile state | Profile/onboarding | Business data and routes | Admin/privileged operations |
|---|---|---|---|
| `pending` | Own safe fields, onboarding request/status, password, logout | None: no Dashboard, BOQ, Price List/Master Catalog, Factor F, print/export | None, regardless of stored role |
| `active` non-admin | Existing own/hierarchical access | Existing role-scoped BOQ, issued catalog, and Factor F reads | None |
| `active` admin | Existing profile/user workflow | Existing admin and business access subject to SoD/flags | Allowed only after current role **and** active-status checks |
| `inactive` / `suspended` | Existing blocked-profile/status surface only | None | None |
| Anonymous / missing profile / unknown status | Authentication entry points only | None | None |

Pending-owned BOQs are retained unchanged while hidden and become accessible
again only after a valid transition to `active`, under the normal active-role
rules. No data is deleted or reassigned to implement the waiting state.

## Current runtime gaps

- Master Catalog migrations `022`/`023` already enforce active-only catalog
  reads and remain unchanged.
- BOQ policies in `009` and `save_boq_with_routes` in `016` still authorize
  non-active owners; legacy and versioned Factor F reads are available to any
  authenticated token.
- Raw `app_settings` is anonymous/authenticated-readable and its writes check
  stored admin role without current active status. Authenticated
  `can_approve_boq` also lacks active status, while `get_user_role`/`is_admin`
  expose arbitrary-user role metadata instead of a self-scoped result.
- The frozen baseline policy `Users can view all profiles` allows every
  authenticated identity to select every profile row. Its own-row INSERT can
  exploit the `active` default, broad UPDATE does not protect `role`/`status`,
  and role-only admin UPDATE plus the current trigger do not close these paths.
  Exact live posture needs read-only verification, but source-derived profile/
  PII exposure, missing-profile self-creation, and self-escalation are blockers.
- Organization/department/sector policies expose all selector rows to every
  authenticated status without an `is_active` predicate. Pending should receive
  only active onboarding selectors; inactive/suspended should receive none.
- `/api/admin/users/[id]` checks admin role without active status before using a
  service-role operation, while pending middleware does not cover `/api/admin`.
- `lib/permissions.ts`, pending navigation/copy, and catalog export still encode
  the former pending-own-BOQ/catalog contract.

Therefore UI-only changes are insufficient. A future separately approved
append-only database authorization correction plus matching application/server
changes and the full status x resource x action matrix remain required to close
P-49. P-51 accepts but does not remediate this risk for the exact first
closeout. P-49/P-51 authorize no implementation, database action, merge, or
deploy.

## Safe profile boundary

Pending self-service is limited to `first_name`, `last_name`, `title`,
`position`, `employee_id`, `phone`, requested department/sector, and the bounded
onboarding-submission transition. `role`, `status`, actual organization,
identity/email, approval/rejection, and audit fields are never self-service.
Inactive and suspended profiles may read their own status but may not edit the
onboarding/profile fields. Other-profile reads follow only the separately
approved active role scope; pending/inactive/suspended receive none.

## Canonical references

- [ADR-001: Supabase RLS Authorization](../02_architecture/ADR/ADR-001-supabase-rls-authorization.md)
- [Access Model](../03_domain/ACCESS_MODEL.md)
- [Permission Patterns](../06_engineering/PERMISSION_PATTERNS.md)
- [P-49 Plan](../plans/master-catalog/45-phase4-p49-pending-authorization-hardening-plan.md)
- [P-51 Closeout Plan](../plans/master-catalog/48-phase4-p51-risk-accepted-master-catalog-closeout-plan.md)
