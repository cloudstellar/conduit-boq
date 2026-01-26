# Access Model
## Conduit BOQ System

**Last Updated:** 2026-01-22  
**Status:** Canonical

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
| `pending` | New user, waiting admin approval | Own BOQ only |
| `inactive` | Disabled but not deleted | No access |
| `suspended` | Temporarily blocked | No access |

---

## 4. Access Matrix

| Role | Own BOQ | Sector BOQ | Dept BOQ | Legacy BOQ |
|------|---------|------------|----------|------------|
| pending | ✅ | ❌ | ❌ | ❌ |
| staff (active) | ✅ | ✅ | ❌ | ❌ |
| sector_manager | ✅ | ✅ | ❌ | ❌ |
| dept_manager | ✅ | ✅ | ✅ | ❌ |
| procurement | ✅ own | ✅ sector (approved) | ✅ dept (approved) | ❌ |
| admin | ✅ | ✅ | ✅ | ✅ |

---

## 5. Key Security Rules

### 5.1 Pending = Own-only
No sector/dept access until admin approves.

### 5.2 Legacy = Admin-only
BOQ with `created_by IS NULL` is only visible to admins.

> [!NOTE]
> Fixed in v1.2.0: `lib/permissions.ts` now correctly blocks legacy for staff (matching RLS).

### 5.3 Org Lock
After onboarding, user cannot change `department_id` or `sector_id`.
- Enforced by: `trg_lock_org_fields_after_onboarding` trigger
- Admin bypass: Admins can still modify these fields

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
| `lib/permissions.ts` | Client-side UI checks |
| `migrations/008_rls_and_trigger.sql` | DB-level enforcement |
| `app/admin/page.tsx` | Admin UI calls RPC |

---

## 7. Verification

Run `scripts/test-rls-security.sql` for 10 test cases.

---

## References

- Source: [docs/SECURITY.md](../SECURITY.md)
- Permissions: [06_engineering/PERMISSION_PATTERNS.md](../06_engineering/PERMISSION_PATTERNS.md)
- ADR: [02_architecture/ADR/ADR-001-supabase-rls-authorization.md](../02_architecture/ADR/ADR-001-supabase-rls-authorization.md)
