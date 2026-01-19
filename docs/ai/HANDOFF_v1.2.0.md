# AI Session Handoff: v1.2.0-admin-security

## Context
Sprint v1.2.0 adds admin permission security with hybrid onboarding flow.

## Current State
- **Branch:** `feature/admin-permission-security` (not created yet)
- **Migrations ready:** `007_*.sql`, `008_*.sql` (not applied)
- **Docs ready:** `SECURITY.md`, `test-rls-security.sql`

## What's Done (Planning)
- [x] Implementation plan v4 finalized
- [x] SQL migrations written
- [x] 10 test cases defined
- [x] Documentation updated

## What's Remaining (Execution)
1. Create git branch
2. Apply migrations to Supabase
3. Modify `app/profile/page.tsx` (use `requested_*`)
4. Modify `app/admin/page.tsx` (call RPC approve/reject)
5. Update `lib/permissions.ts` (pending = own-only)
6. Verify 10 test cases
7. Tag & merge

## Key Files
| File | Purpose |
|------|---------|
| `migrations/007_*.sql` | Schema: 7 columns |
| `migrations/008_*.sql` | RLS + Trigger + RPC |
| `docs/SECURITY.md` | Access matrix |
| `scripts/test-rls-security.sql` | Test cases |

## Policy Decisions
- `sector_manager`: sector only (no dept)
- `pending`: own BOQ only (no assigned_to)
- `legacy BOQ`: admin only
- `org lock`: Trigger (not RLS)
- `approve`: RPC from `requested_*`

## Commands to Start
```bash
git checkout -b feature/admin-permission-security
# Apply 007, 008 to Supabase via dashboard
```
