# Access Model
## Conduit BOQ System

**Last Updated:** 2026-10-23
**Historical snapshot:** P-49 target before its completed Production
remediation and formal closeout

<!-- RELEASE_ALIGNMENT_20261023 -->
> **Recorded release state — 2026-10-23:** dependency A (`a3114fc`) and
> [stale-Copy B](../06_engineering/STALE_COPY_B_RELEASE_CLOSEOUT_20261023.md) (`42e01c5` + Production 031 ledger `20261023063934`)
> are closed. [L1 Production result](../06_engineering/LIST_1B_L1_PRODUCTION_RELEASE_RESULT_20261023.md) records exact `b1ce449`,
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
> open-risk and deferred-remediation wording below is historical chronology,
> not the current access state or replay authority.

> [!NOTE]
> **Historical P-49 note (2026-08-18):** P-49 superseded the former
> `pending = own BOQ` business rule. Its target was profile/onboarding-only,
> while the BOQ RLS/RPC and profile grants were not yet aligned at that date.
> P-51 temporarily accepted that exposure for the exact first closeout. See
> [P-51 Plan](../plans/master-catalog/48-phase4-p51-risk-accepted-master-catalog-closeout-plan.md).

<!-- DUP1_CURRENT_STATE_20260831 -->
> [!IMPORTANT]
> **Later product release:** Atomic BOQ Duplicate is live through migration 029;
> see [DUP-1 Production Result](../plans/product/04-atomic-boq-duplicate-production-release-result.md).
> The dated statement above that the ledger ended at 028 remains correct only
> for its 2026-08-29 Master Catalog recheck. Migrations 027/028/029 are now all
> applied-once/no-replay.

<!-- SAVE_GUARD_PRODUCTION_CLOSEOUT_20261012 -->
> [!IMPORTANT]
> **Later security correction:** migration 030 is `PRODUCTION PASS`, applied
> once as `20261012100608/boq_save_null_authorization_guard`; see [Security
> Result #04](../plans/security/04-boq-save-null-authorization-production-release-result.md).
> The trusted Save RPC now denies nullable as well as false scope decisions.
> It does not change the access matrix, roles, RLS policies, accounts, Catalog,
> Factor or BOQ data. Migrations 027–030 are immutable/no-replay.

> **2026-10-14 planning boundary:** Current access controls remain unchanged.
> Approval-role labels and separation-of-duties rules below are not a completed
> BOQ lifecycle or authority to record an external approval. The Owner confirmed
> signed-paper approval by the conduit engineering section manager; proposed
> W-H recorder rights and transitions remain TBD. Corporate SSO must preserve
> Auth UUID/BOQ ownership and current status/role/scope checks; its IdP/protocol
> are unknown. See [Integrated Roadmap #09](../plans/product/09-integrated-roadmap-and-it-decision-handoff.md).

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

### 5.6 Atomic Copy authorization

| Profile/role | May invoke a successful copy? | Additional requirement |
|---|---|---|
| active `admin` | ✅ | Source must remain visible and pass the locked integrity/mode contract |
| active `dept_manager` | ✅ | Source must be owned/assigned or in authorized department scope |
| active `sector_manager` | ✅ | Source must be owned/assigned or in authorized sector scope |
| active `staff` | ✅ | Source must be owned/assigned or in authorized sector scope |
| active `procurement` | ❌ | Read scope does not imply copy/create authority |
| pending/inactive/suspended/missing/unknown | ❌ | No BOQ business mutation |
| anonymous | ❌ | Authentication required |

The database RPC rechecks `auth.uid()`, current active profile/role, source
visibility, exact mode/Factor eligibility, graph integrity, expected
`boq.updated_at`, and request-key reuse. Client button visibility is advisory,
not an authorization boundary. Every destination is a new actor-owned draft in
the actor's current scope; the source remains unchanged. Normal Copy preserves
Catalog/items/prices/Factor state. The separate selected-Factor path applies
only to eligible positive-total Factor-unbound legacy BOQs and blocks official
output until trusted review/save.

---

031 changes the stale conflict response to HTTP 409 / `PT409` with exact detail
`BOQ_SOURCE_STALE`; it does not expand copy roles or source visibility. L1 uses
these existing RLS/RPC contracts for full-result search/count and page routes.
The visible Delete gate follows existing active-Admin/creator-draft rules; the
database remains authoritative. S0/user management and W-H/SSO are not delivered
by list-session cleanup or this release.

## 6. Implementation Files

| File | Purpose |
|------|---------|
| `lib/permissions.ts` | Client-side UI checks; P-49 completion is recorded in #106/#107 |
| `migrations/008_rls_and_trigger.sql` | Historical DB enforcement; applied bytes remain immutable |
| `app/admin/page.tsx` | Admin UI calls RPC |
| `lib/boq/duplicate.ts` | Typed atomic-copy client; UX/error mapping, not authorization |
| `migrations/029_atomic_boq_duplicate.sql` | Database-authoritative atomic copy, idempotency, eligibility, and ACL contract |
| `migrations/031_boq_duplicate_stale_conflict_guard.sql` | Applied-once stale-response correction; same authorization/identity/ACL contract, no replay |
| `lib/boq/list.ts`, `lib/boq/useBOQList.ts` | RLS-filtered list reads and client lifecycle guards; no new permission model |
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
