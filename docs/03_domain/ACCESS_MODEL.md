# Access Model
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
> open-risk and deferred-remediation wording below is historical chronology,
> not the current access state or replay authority.

> [!NOTE]
> **Historical P-49 note (2026-08-18):** P-49 superseded the former
> `pending = own BOQ` business rule. Its target was profile/onboarding-only,
> while the BOQ RLS/RPC and profile grants were not yet aligned at that date.
> P-51 temporarily accepted that exposure for the exact first closeout. See
> [P-51 Plan](../plans/master-catalog/48-phase4-p51-risk-accepted-master-catalog-closeout-plan.md).

---

## 1. Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│     RLS     │────▶│   Trigger   │
│ permissions │     │ (who sees)  │     │(what edits) │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                   │
                           ▼                   ▼
                    ┌─────────────┐     ┌─────────────┐
                    │     BOQ     │     │   Profile   │
                    │    Data     │     │    Lock     │
                    └─────────────┘     └─────────────┘
                                              │
                                              ▼
                                       ┌─────────────┐
                                       │  RPC (ADMIN)│
                                       │approve/reject│
                                       └─────────────┘
```

---

## 2. User Roles

| Role | Thai | Primary Use |
|------|------|-------------|
| `admin` | ผู้ดูแลระบบ | Manage users, settings, all BOQs |
| `dept_manager` | ผู้จัดการฝ่าย | Approve BOQs for department |
| `sector_manager` | ผู้จัดการส่วน | Review BOQs for sector |
| `staff` | พนักงาน | Create and edit own BOQs |
| `procurement` | จัดซื้อจัดจ้าง | View approved BOQs (read-only) |

---

## 3. User Status

| Status | Meaning | Access Level |
|--------|---------|--------------|
| `active` | Full access per role | Normal |
| `pending` | Authenticated user waiting admin approval | Profile/onboarding only; no business access (completed P-49 contract; #106/#107) |
| `inactive` | Disabled but not deleted | No business access; own blocked status and auth self-service only; no profile edits |
| `suspended` | Temporarily blocked | No business access; own blocked status and auth self-service only; no profile edits |

---

## 4. Access Matrix

| Role | Own BOQ | Sector BOQ | Dept BOQ | Legacy BOQ |
|------|---------|------------|----------|------------|
| pending | ❌ | ❌ | ❌ | ❌ |
| staff (active) | ✅ | ✅ | ❌ | ❌ |
| sector_manager | ✅ | ✅ | ❌ | ❌ |
| dept_manager | ✅ | ✅ | ✅ | ❌ |
| procurement | ✅ own | ✅ sector (approved) | ✅ dept (approved) | ❌ |
| admin | ✅ | ✅ | ✅ | ✅ |

---

## 5. Key Security Rules

### 5.1 Pending = Profile/onboarding-only

Pending may authenticate, change password, sign out, read its own status, edit
only safe onboarding/profile fields, and read the active department/sector
selectors needed for onboarding. It may not use Dashboard, BOQ (including its
own retained BOQs), Price List/Master Catalog, Factor F, print/export, admin,
or privileged RPC/API paths until `status='active'`.

This is the completed P-49 contract. The implementation and formal closeout are
recorded in #106/#107. The broad-path inventory that motivated the correction
is retained in the historical P-49 plans; UI/middleware changes alone remain
insufficient as a general security rule. The 2026-08-29 read-only recheck was
scoped to the three catalog flags, migration-028 functions/raw `app_settings`
ACL, and the other explicitly listed closeout invariants; it was not a fresh
rehearsal of every persona and predicate.

### 5.2 Legacy = Admin-only
BOQ with `created_by IS NULL` is only visible to admins.

> [!NOTE]
> Fixed in v1.2.0: `lib/permissions.ts` now correctly blocks legacy for staff (matching RLS).

### 5.3 Current P-49 profile mutation guard

Migration 027 removed `public.lock_org_fields_after_onboarding()` and
`trg_lock_org`. The current row guard is private function
`private.p49_guard_user_profile_mutation()` on trigger
`trg_p49_guard_user_profile_mutation`; approved Admin state transitions pass
through the guarded P-49 transition RPCs.

**Historical pre-remediation note:** The v1.2.0 snapshot used
`trg_lock_org_fields_after_onboarding` and did not lock `role` or `status`.
That object description is not the current schema.

### 5.4 Separation of Duties
- Creator cannot approve their own BOQ
- Enforced in both UI (`can()`) and RLS policies

### 5.5 RPC Approve
Admin uses
`admin_approve_user(p_target_id uuid, p_request_id uuid, p_reason text)` for
the current atomic P-49 approval transition:
- Copies `requested_department_id` → `department_id`
- Copies `requested_sector_id` → `sector_id`
- Sets `status` = `active`
- Sets `approved_at`, `approved_by`

Migration 027 dropped the historical one-argument
`admin_approve_user(p_target_id uuid)` function.

---

## 6. Implementation Files

| File | Purpose |
|------|---------|
| `lib/permissions.ts` | Client-side UI checks; P-49 completion is recorded in #106/#107 |
| `migrations/008_rls_and_trigger.sql` | Historical DB enforcement; applied bytes remain immutable |
| `app/admin/page.tsx` | Admin UI calls RPC |
| `docs/plans/master-catalog/45-phase4-p49-pending-authorization-hardening-plan.md` | Historical target, gap inventory, and acceptance gates |

---

## 7. Verification

The legacy `scripts/test-rls-security.sql` pending-own-BOQ expectation is no
longer canonical. The P-49 implementation and bounded Production closeout are
recorded in #106/#107. The expanded Production persona rehearsal that was not
run remains an accepted residual, not PASS; do not infer that it ran from this
completed contract.

---

## References

- Source: [docs/SECURITY.md](../SECURITY.md)
- Permissions: [06_engineering/PERMISSION_PATTERNS.md](../06_engineering/PERMISSION_PATTERNS.md)
- ADR: [02_architecture/ADR/ADR-001-supabase-rls-authorization.md](../02_architecture/ADR/ADR-001-supabase-rls-authorization.md)
