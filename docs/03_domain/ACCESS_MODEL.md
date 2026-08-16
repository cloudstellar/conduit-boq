# Access Model
## Conduit BOQ System

**Last Updated:** 2026-08-17
**Status:** P-49 target canonical; implementation HOLD; P-13 hard-stop

> [!IMPORTANT]
> P-49 supersedes the former `pending = own BOQ` business rule. The target is
> profile/onboarding-only, but current BOQ RLS/RPC and profile grants are not yet
> aligned. See [P-49 Plan](../plans/master-catalog/45-phase4-p49-pending-authorization-hardening-plan.md).

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
| `pending` | Authenticated user waiting admin approval | Profile/onboarding only; no business access (P-49 target, not yet fully enforced) |
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

This is the approved P-49 target. It is not yet the complete runtime contract:
`007`, `009`, `012`, and `016` still expose non-active settings/business paths;
authenticated role helpers disclose or trust stored role without active status;
raw settings and all selector rows are too broad; broad profile SELECT/INSERT/
UPDATE may expose every row, permit missing-profile active self-creation, and
allow protected-column mutation; and one privileged API checks admin role
without active status.
UI/middleware changes alone are insufficient. Inactive/suspended self-profile
edits and generic status transitions must also fail in the target state machine.

### 5.2 Legacy = Admin-only
BOQ with `created_by IS NULL` is only visible to admins.

> [!NOTE]
> Fixed in v1.2.0: `lib/permissions.ts` now correctly blocks legacy for staff (matching RLS).

### 5.3 Org Lock
After onboarding, user cannot change `department_id` or `sector_id`.
- Enforced by: `trg_lock_org_fields_after_onboarding` trigger
- Admin bypass: Admins can still modify these fields

The current trigger does not lock `role` or `status`; P-49 requires a separate
forward-only protected-field boundary before P-13.

### 5.4 Separation of Duties
- Creator cannot approve their own BOQ
- Enforced in both UI (`can()`) and RLS policies

### 5.5 RPC Approve
Admin uses `admin_approve_user()` for atomic approval:
- Copies `requested_department_id` → `department_id`
- Copies `requested_sector_id` → `sector_id`
- Sets `status` = `active`
- Sets `approved_at`, `approved_by`

---

## 6. Implementation Files

| File | Purpose |
|------|---------|
| `lib/permissions.ts` | Client-side UI checks; current pending rule is superseded and awaiting implementation |
| `migrations/008_rls_and_trigger.sql` | Historical DB enforcement; applied bytes remain immutable |
| `app/admin/page.tsx` | Admin UI calls RPC |
| `docs/plans/master-catalog/45-phase4-p49-pending-authorization-hardening-plan.md` | Current target, gap inventory, and acceptance gates |

---

## 7. Verification

The legacy `scripts/test-rls-security.sql` pending-own-BOQ expectation is no
longer canonical. Before P-13, run the P-49 real-session status x resource x
action matrix across DB policies/grants/RPC, page and API deep links, protected
profile columns, transition E2E, and unchanged active-user behavior.

---

## References

- Source: [docs/SECURITY.md](../SECURITY.md)
- Permissions: [06_engineering/PERMISSION_PATTERNS.md](../06_engineering/PERMISSION_PATTERNS.md)
- ADR: [02_architecture/ADR/ADR-001-supabase-rls-authorization.md](../02_architecture/ADR/ADR-001-supabase-rls-authorization.md)
