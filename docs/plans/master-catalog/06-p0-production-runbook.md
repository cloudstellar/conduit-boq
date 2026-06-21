# Master Catalog P0 Production Runbook

**Migration:** `009_master_catalog_p0_containment.sql`

**Target:** Supabase project `Conduit Price List` (`otlssvssvgkohqwuuiir`)

**Scope:** RPC containment, dangerous privilege revocation, and BOQ RLS policy
replacement only. No table data migration is performed by this script.

## 1. Manual rollback pack

This project does not use a paid Supabase development branch or managed PITR.
The manual rollback pack consists of:

- `supabase/local/production-baseline.sql`: schema-only snapshot containing the
  pre-009 RPC, RLS policies, grants, and default privileges.
- `supabase/.snapshots/public-data-20260621-post009.sql`: fresh git-ignored
  business-data snapshot captured after 009. It restored successfully in Local
  and matched Production checksums for all ten public tables. SHA-256:
  `a8761632ba4ddbb22934c0e10dca0e4299798d572dc1db56222629a2d86c4570`.
- Production metadata captured read-only through Supabase MCP on 2026-06-21
  11:47 ICT: function definitions/ACLs, BOQ policy expressions, table grants,
  default privileges, and migration history.
- Git history for the reviewed migration and verification evidence.

Migration 009 runs inside one transaction. SQL failure before `COMMIT` rolls
back every function, grant, and policy change automatically. It has a 10-second
lock timeout and a 60-second statement timeout.

If a regression is found after commit, keep anonymous RPC access revoked. Use
the baseline only to restore the smallest affected policy or function after
review; do not restore broad `PUBLIC`/`anon` grants. Prefer a targeted fix
forward because the pre-009 grants are the security exposure being contained.

## 2. Confirmed preflight — 2026-06-21

| Check | Production result |
|---|---:|
| Project status | `ACTIVE_HEALTHY` |
| PostgreSQL | `17.6` |
| BOQs | `198` |
| BOQ items | `1,547` |
| BOQ routes | `217` |
| Price-list rows | `710` |
| Duplicate item codes | `0` |
| Null item codes | `0` |
| Active non-idle sessions excluding preflight | `0` |
| Master Catalog schema already present | No |
| `anon` can execute `save_boq_with_routes` | **Yes — must be closed** |
| Save RPC is `SECURITY DEFINER` | Yes |
| Save RPC has fixed `search_path` | No — fixed by 009 |
| MCP migration actor | `postgres` |
| Actor is member of `supabase_admin` | No — guarded by 009 |

The current table counts match the Local rehearsal snapshot. This is a
consistency signal only; it is not a substitute for a fresh logical snapshot
before data-changing migration 010.

## 3. Stop conditions

Do not apply 009 if any of these are true:

- Production counts or schema differ from the confirmed preflight without an
  explained application change.
- A Master Catalog table/column already exists unexpectedly.
- There is an active DDL transaction or sustained write activity.
- The migration content differs from the reviewed commit.

## 4. Execution

Apply the complete reviewed file once through Supabase MCP `apply_migration`
using the name `master_catalog_p0_containment`.

Do not execute migration 010, deploy the Phase 2 application, or execute 011 in
the same change window.

## 5. Required post-migration verification

```sql
SELECT
  has_function_privilege(
    'anon',
    'public.save_boq_with_routes(uuid,jsonb,jsonb)',
    'EXECUTE'
  ) AS anon_can_save,
  has_function_privilege(
    'authenticated',
    'public.save_boq_with_routes(uuid,jsonb,jsonb)',
    'EXECUTE'
  ) AS authenticated_can_save,
  (
    SELECT prosecdef
    FROM pg_proc
    WHERE oid = 'public.save_boq_with_routes(uuid,jsonb,jsonb)'::regprocedure
  ) AS save_is_security_definer,
  (
    SELECT proconfig
    FROM pg_proc
    WHERE oid = 'public.save_boq_with_routes(uuid,jsonb,jsonb)'::regprocedure
  ) AS save_function_config;
```

Expected:

- `anon_can_save = false`
- `authenticated_can_save = true`
- `save_is_security_definer = true`
- `save_function_config` contains `search_path=` with an empty path

Also verify:

- All twelve BOQ/route/item policy names exist exactly once.
- Anonymous execution is revoked from the seven legacy helper functions.
- `boq`, `boq_items`, `boq_routes`, and `price_list` counts are unchanged.
- Supabase security advisor no longer reports anonymous execution of the
  affected `SECURITY DEFINER` functions or a mutable save-RPC search path.
- No Production app deployment occurred.

## 6. Production execution result — 2026-06-21

Migration 009 was applied through Supabase MCP at 11:52 ICT and recorded as
`20260621045208_master_catalog_p0_containment`.

| Verification | Result |
|---|---:|
| `boq` / `boq_items` / `boq_routes` / `price_list` | `198` / `1,547` / `217` / `710` (unchanged) |
| Duplicate item codes | `0` |
| BOQ/route/item policies | `12`, expected names exactly once |
| `anon` save RPC execution | `false` |
| Authenticated save RPC execution | `true` |
| Save RPC auth guard | Present |
| Save RPC `search_path` | Empty/fixed |
| Anonymous legacy-helper execution | `false` for all seven helpers |
| Dangerous API table grants | `0` |
| Authenticated admin read smoke | `198` BOQs, `1,547` items, `217` routes |
| Anonymous read smoke | `0` BOQs; save unavailable |
| Unexpected active sessions | `0` |
| Master Catalog Phase 1A objects | Absent, as required |

The security advisor no longer reports anonymous execution of the affected
`SECURITY DEFINER` functions or the mutable save-RPC search path. Remaining
advisor warnings concern authenticated execution of intentionally callable
guarded RPCs and disabled leaked-password protection; these are separate review
items and did not block P0 containment.

No data backfill, Phase 1A migration, application deployment, or Phase 1B
hardening was performed in this window.

The fresh logical snapshot required before Phase 1A was subsequently captured
and restore-verified. It must be refreshed again if the final Phase 1A
preflight detects any intervening Production row/checksum change.

## 7. Phase 1A follow-through — 2026-06-21

The final Phase 1A preflight found no intervening Production change: all ten
public-table count/hash pairs and all 20 real-user UUIDs matched the fresh
Local restore. P0 invariants remained intact, duplicate/null item-code counts
were zero, the Factor F checksum remained
`e8040ffbf82beebd61bbb9c2652dd41a`, and there were no unexpected active
sessions.

Migration `010_master_catalog_phase1a_versioning.sql` was applied through
Supabase MCP and recorded as
`20260621052517_master_catalog_phase1a_versioning`. The four `010a` concurrent
indexes were executed one statement at a time outside a transaction and all
reported `indisvalid=true` and `indisready=true`.

Post-execution verification preserved `198` BOQs, `1,547` items, `217` routes,
and `710` price rows. The default catalog is `2568.0.0`; unversioned BOQs,
unversioned prices, missing standard-item categories, and cross-version items
are all zero. Anonymous impersonation sees zero catalog/BOQ rows and cannot
call the save RPC. Authenticated-admin read smoke passed, and a rollback-only
insert using the pre-Phase-2 app payload received the default version without
leaving a row behind.

At this checkpoint Production waited at the Phase 2 application deploy gate.
The rule was not to apply `011_master_catalog_phase1b_hardening.sql` until the
application deployment, post-deploy workflow smoke, and second delta
reconciliation passed; Section 8 records completion of those gates.

## 8. Phase 2 and Phase 1B closeout — 2026-06-21

PR #2 was squash-merged as `1439a7a`; GitHub Quality run #15 and the Vercel
Production deployment passed. Authenticated browser smoke covered Dashboard,
Price List/version-scoped search, BOQ list/search, Create, Edit, and Print.
Rollback-only create/save smoke passed without leaving Production data.

The second delta reconciliation returned zero unversioned BOQs/prices, zero
missing standard-item categories, and zero cross-version items. Migration
`011_master_catalog_phase1b_hardening.sql` was then applied through Supabase
MCP and recorded as `20260621104056_master_catalog_phase1b_hardening`.

Final verification preserved `198` BOQs, `1,547` items, `217` routes, and `710`
prices. `boq.price_list_version_id` is `NOT NULL`; the immutable-version trigger
is enabled; its function runs with invoker rights and cannot be called directly
by `anon` or `authenticated`. A real attempted version change was rejected,
the Phase 2 rollback create/save still passed after hardening, Factor F checksum
remained unchanged, and no rollback-smoke row or invalid catalog state remains.

The Master Catalog rollout through Phase 1B is complete. Phase 4 admin catalog
import, clone, default swap, audit log, and GUI workflows require a separate
reviewed change.
