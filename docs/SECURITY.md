# Security Model: Admin Permission & Onboarding v1.2.0

## Overview

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

## Access Matrix

| Role | Own BOQ | Sector BOQ | Dept BOQ | Legacy BOQ |
|------|---------|------------|----------|------------|
| pending | ✅ | ❌ | ❌ | ❌ |
| staff (active) | ✅ | ✅ | ❌ | ❌ |
| sector_manager | ✅ | ✅ | ❌ | ❌ |
| dept_manager | ✅ | ✅ | ✅ | ❌ |
| procurement | ✅ | ✅ | ✅ | ❌ |
| admin | ✅ | ✅ | ✅ | ✅ |

## Key Security Rules

1. **Pending = Own-only**: No sector/dept access until admin approves
2. **Legacy = Admin-only**: BOQ with `created_by IS NULL`
3. **Org Lock**: After onboarding, user cannot change dept/sector (Trigger enforced)
4. **RPC Approve**: Admin uses `admin_approve_user()` for atomic approval

## Files

| File | Purpose |
|------|---------|
| `lib/permissions.ts` | Client-side UI checks |
| `migrations/008_rls_and_trigger.sql` | DB-level enforcement |
| `app/admin/page.tsx` | Admin UI calls RPC |

## Verification

Run `scripts/test-rls-security.sql` for 10 test cases.
