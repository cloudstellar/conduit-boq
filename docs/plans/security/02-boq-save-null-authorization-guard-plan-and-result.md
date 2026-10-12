# BOQ Save NULL Authorization Guard — Plan and Local Result

**Prepared:** 2026-09-08
**Release-readiness refreshed:** 2026-10-12
**Status:** Production release completed 2026-10-12; see the immutable [release result](./04-boq-save-null-authorization-production-release-result.md).
**Production:** Migration 030 applied exactly once as `20261012100608/boq_save_null_authorization_guard`; no replay.

## Problem and evidence

The Owner approved a bounded Production metadata read at
`2026-09-08T01:48:01.443092+00:00` on project
`otlssvssvgkohqwuuiir`. It read PostgreSQL catalogs only, in an explicitly
read-only transaction, for the three BOQ tables, their triggers and selected
Save/authorization functions. It did not read business/profile/session rows or
invoke Save. The observed PostgreSQL version was 17.6.

At that 2026-09-08 capture, the then-deployed
`public.save_boq_with_routes(uuid,jsonb,jsonb)` function body matched immutable
migration 027. Its final authorization guard was
`IF NOT v_is_authorized THEN`. A scope comparison can produce SQL `NULL`, which
does not enter that denial branch:

- Active staff, a different non-null creator, and no assigned user:
  `FALSE OR NULL`.
- Active sector/dept manager with a scope, a non-null creator, and a BOQ whose
  corresponding sector/department is null: `TRUE AND NULL`.

Those BOQ fields are nullable. The function is `SECURITY DEFINER`, owned by the
table owner `postgres`, and the tables do not force RLS. The observed triggers
protect version bindings/defaults/timestamps and do not close this scope gap.
The earlier legacy-creator and active-profile gates remain separate rules.

This finding establishes a faulty authorization path, not an incident or an
affected-row count. No unauthorized Production Save was attempted. The earlier
P49 persona smoke uses a missing BOQ UUID and stops before existing-BOQ scope
authorization; it does not cover these cases.

References: [027 source](../../../migrations/027_p49_active_profile_authorization_hardening.sql),
[persona probe](../../../scripts/smoke-p49-persona-matrix.mjs),
[PostgreSQL conditionals](https://www.postgresql.org/docs/17/plpgsql-control-structures.html#PLPGSQL-CONDITIONALS),
[PostgreSQL RLS](https://www.postgresql.org/docs/17/ddl-rowsecurity.html).

## Approved scope

After reviewing this finding, the Owner approved preparing a patch, a new
forward migration, and tests in an isolated environment. This grants no
Production application, commit, push, merge, deployment, old-migration replay,
or change to existing local BOQs, accounts, Catalog or Factor reference data.

The patch changes only the final guard to
`IF v_is_authorized IS NOT TRUE THEN`. It rejects both false and unknown
authorization while preserving true decisions, the active-profile and legacy
rules, role scope, monetary statements, version binding, ACL and lock order.
Feature additions and Quantity Expression are outside this correction.

The new artifact is
[`030_boq_save_null_authorization_guard.sql`](../../../migrations/030_boq_save_null_authorization_guard.sql).
Supabase CLI 2.107.0 generated
`20260908020118_boq_save_null_authorization_guard.sql` in a temporary unlinked
directory with telemetry disabled. The new empty artifact was placed under the
repository's numbered root-migration convention. It was not placed in the CLI
deployment directory, and no migration history was repaired or replayed.

## Exact change contract

The full observed `pg_get_functiondef` predecessor SHA-256 is
`aefe5097626539b83f02d418cbc6fe1ca4d2ad195e927d987f174c5e7701c9e9`.
After the single guard replacement, the expected definition SHA-256 is
`929466b05250a96e3c5ff20c90d99d7d0da415b8cd021a19c1069396c8c06506`.

The migration must reject an unknown definition, incorrect owner/ACL, or
replay. It must preserve the function identity, owner, grants and configuration
and verify the exact successor before finishing atomically. It reads no
application rows and changes no table, policy, reference, account or ledger.
This pins a reviewed predecessor rather than overwriting later changes.

Migrations 027/028/029 remained unchanged and immutable. At that checkpoint,
application of 030 required a separately approved exact artifact and fresh
preflight; this plan was not an execution receipt or authority for that
operation. The later execution is recorded in the
[Production release result](./04-boq-save-null-authorization-production-release-result.md).

## Isolated validation design

Use an existing PostgreSQL 17.6 image in a new disposable container with no
network, published ports, host mounts or Production credentials. Do not reset
or modify `conduit-boq-local`. The fixture is synthetic and installs the
captured Save definition with only its necessary database dependencies; it
does not execute migrations 027/028/029 or copy Production business data.

1. Reproduce the three faulty authorization paths with the predecessor and
   roll test changes back.
2. Apply only the new 030 migration in that isolated database.
3. Exercise the real SQL Save function as the `authenticated` role, with
   synthetic identity claims, for permitted and denied role/scope/status cases.
4. For every denial, verify that the fixture graph is unchanged. For allowed
   saves, verify quantities, header/route/item costs and preserved bindings.
5. Verify replay and definition/configuration/ACL drift are rejected without
   changing the database beyond the deliberately introduced test drift.
6. Check that the new function differs by exactly the final guard and that
   immutable migration files and existing application changes are preserved.

SQL role/claim simulation does not validate Supabase Auth token issuance,
HTTP/PostgREST transport, live account races or all Production dependencies.
Earlier local quantity Save/reload and Chrome Excel/PDF receipts remain valid
for their exact cases and do not substitute for this authorization validation.

## Local execution result

Executed 2026-09-08, `02:16:10–02:16:12 UTC` (09:16 Bangkok), using:

```sh
node scripts/test-boq-save-null-authorization.mjs
```

The runner used the already-cached
`public.ecr.aws/supabase/postgres:17.6.1.136` image in a newly created container
with network `none`, no published ports or bind mounts, and a temporary-memory
data directory. The owned container was stopped and its removal verified after
the run. It did not connect to the existing local application database or
Production.

| Actual SQL smoke run | Cases | Successful saves | Rejected saves | Known NULL bypasses |
|---|---:|---:|---:|---:|
| Captured predecessor | 63 | 20 | 43 | 3 reproduced |
| After migration 030 | 63 | 17 | 46 | 0 |

The three changed outcomes are exactly the intended NULL-scope denials. The
other cases preserve owner/assignee/admin and in-scope manager saves, legacy
and procurement restrictions, inactive/pending/suspended/missing-profile
denials, anonymous/service-role ACLs, catalog-authoritative price/name/version
rules, and quantity/numeric rollback behavior. Every rejected case retained
the complete synthetic graph; allowed cases verified header, route and item
values, version/ownership bindings and unrelated sentinel/profile/price rows.
Every case then rolled its test writes back.

Additional actual database checks passed:

- Changed function body, function configuration and execute ACL were each
  rejected in separate synthetic predecessor clones, preserving each clone's
  pre-attempt snapshot.
- Reapplying 030 was rejected without changing the fixed function or graph.
- The function definition changed by exactly one guard; all other `pg_proc`
  metadata, table RLS/ACLs and public-schema grants were identical.

The first rehearsal stopped in a test-helper RLS assertion: a SQL subquery
inside an `AND` expression was evaluated for a role without SELECT permission.
The helper was corrected to nested PL/pgSQL `IF` statements, without granting
any extra privileges. That run applied no migration and its owned container
was removed. The complete successful rerun above uses the corrected helper;
the failed rehearsal is not counted as PASS.

Repository checks: **643 tests / 56 files passed**, full ESLint passed,
TypeScript `--noEmit` passed, and `git diff --check` passed. A new app build was
not required for this SQL/test/document correction; the quantity runtime files
were not modified in this correction. Historical migration SHA-256 values for
027, 028 and 029 remain unchanged.

Exact 2026-09-08 tested artifact SHA-256:

| File | SHA-256 |
|---|---|
| Migration 030 | `e6a3175413f961d24feb03dbe7f757782dd2f08710a911732531ebc9b3d9081a` |
| Synthetic fixture | `19f46bef25445f2be8ef6f18c7f18139189087adca666a1ef4a14ab00c8d0f98` |
| SQL smoke matrix | `3ae5d7cd092150b0d994bd30f122702bbdd2dad3749ff4bec09d85ff0aa7b67c` |
| Isolated Docker runner | `6c3415cc493faf86e8433406d3492409c98826820eda2b6eebab41bd3c9ce939` |

The 2026-09-08 host-local receipt directory was recorded as
`/var/folders/f4/y8__9xrd293cwz9jd03zkyk40000gn/T/conduit-boq-save-null-auth-DE8xHL`.
Its `receipt.json` SHA-256 is
`f20b3b7d84429a65c9055004c7fda8e6ea9982334d91eefa3a116fd4a903e0d5`.
It contained command results and before/after synthetic snapshots. That
temporary directory was no longer present when rechecked on 2026-10-12; retain
the recorded hash as historical evidence, not as a currently inspectable host
artifact.

This is a **local SQL regression PASS** for the bounded guard correction, not
Production deployment, HTTP/JWT end-to-end acceptance, concurrency certification
or a replacement for the accepted historical persona residual.

An independent final review of the migration, SQL role switching, denial/write
assertions, runner isolation, successful receipt and documented limits found no
actionable blocker for local patch review. It did not perform another database
run or grant release authority.

## Release-readiness refresh — 2026-10-12

The Owner first authorized preparation of two independent release gates and on
2026-10-12 then approved a simpler single-owner flow: freeze and validate one
security-only local commit before one later external-release decision. No push,
migration application or deployment is authorized by this checkpoint. Fresh
read-only checks found:

- remote `main` still resolves to
  `c0cb6451c4d9924f69de93df4eee80abb6cca3c9`;
- Production project `otlssvssvgkohqwuuiir` is PostgreSQL `17.6` and the
  preflight transaction reported `transaction_read_only = on`;
- the migration ledger contains exact entries
  `20260827174634/p49_active_profile_authorization_hardening`,
  `20260828070433/master_catalog_admin_gate_projection`, and
  `20260831004110/atomic_boq_duplicate`, each exactly once; a supplemental
  read-only summary found `29` total rows, maximum version `20260831004110`,
  zero later versions and zero `boq_save_null_authorization_guard` rows;
- the Save RPC remains OID `23374`, owned by `postgres`, `SECURITY DEFINER`,
  volatility `v`, parallel posture `u`, with exact ACL
  `authenticated=X/postgres`, `postgres=X/postgres`, exact empty search path and
  timeouts, one old guard, zero new guards, and predecessor SHA-256
  `aefe5097626539b83f02d418cbc6fe1ca4d2ad195e927d987f174c5e7701c9e9`;
- a supplemental read-only catalog capture confirmed
  `public.user_profiles.status` is `text NOT NULL`, defaults to `pending`, and
  has one validated check constraint allowing only `active`, `inactive`,
  `suspended`, or `pending`;
- the current security-advisor baseline still includes the expected warning for
  an authenticated `SECURITY DEFINER` Save RPC plus unrelated existing findings;
  no finding is relabelled fixed before postflight.

The first preflight query attempt stopped on invalid qualification of PostgreSQL
`COALESCE`; it returned no evidence and made no change. The corrected query ran
inside a repeatable-read, read-only transaction and ended with `ROLLBACK`. It
read catalog, function and migration-ledger metadata only, not business or
account rows.

Fresh combined-working-tree validation passed: **643 tests / 56 files**, full
ESLint, TypeScript `--noEmit --incremental false`, production build, and a
tracked plus untracked candidate-wide whitespace check. This tree contains both
the separately gated Security and Quantity candidates; it is not evidence for
either eventual exact published commit. S-A requires validation again on the
security-only immutable candidate. The build used an unreachable loopback
Supabase URL; network access was needed only to download Google Fonts.

Fresh isolated SQL validation reproduced the same baseline and fixed matrices:

| Run | Cases | Allowed | Denied | Known NULL bypasses |
|---|---:|---:|---:|---:|
| Predecessor | 63 | 20 | 43 | 3 |
| Migration 030 | 63 | 17 | 46 | 0 |

Body/config/ACL drift and replay again failed closed without changing the
synthetic function or graph. The first fresh run completed all SQL checks but
the runner observed Docker's `--rm` container during a brief post-stop removal
race and exited non-zero. Exact-ID follow-up confirmed removal. The runner now
uses a bounded 20-attempt, 100 ms cleanup poll while rechecking the exact owned
name, label, image and container ID on every still-present observation. It does
not weaken the final absence check. The corrected runner then completed cleanly
with `cleanup.confirmedRemoved = true`.

Current exact artifacts:

| File | SHA-256 |
|---|---|
| Migration 030 | `e6a3175413f961d24feb03dbe7f757782dd2f08710a911732531ebc9b3d9081a` |
| Synthetic fixture | `19f46bef25445f2be8ef6f18c7f18139189087adca666a1ef4a14ab00c8d0f98` |
| SQL smoke matrix | `3ae5d7cd092150b0d994bd30f122702bbdd2dad3749ff4bec09d85ff0aa7b67c` |
| Isolated Docker runner | `3dc42b1ef74dd1615ed8ae7f5e41cd5bc73c2b8a114149735f2bfc0e4a506053` |

The clean fresh receipt is
`/var/folders/f4/y8__9xrd293cwz9jd03zkyk40000gn/T/conduit-boq-save-null-auth-2n5jTt/receipt.json`,
SHA-256
`4d028bfb8efe5661c17bbc1f0ca488a8dd01bd363b01f144075e17107a979bf0`.
It is host-temporary evidence. The exact Production execution and verification
sequence is frozen separately in the
[Production release runbook](./03-boq-save-null-authorization-production-runbook.md).

## Production closure

The Owner later approved the exact security-only release. Commit
`cb2bb60eed7ea3d72149df4a4273d8fe1bfdf3c1` reached `main`, its GitHub quality
gate and Vercel deployment passed, and the final fresh preflight matched this
plan. Migration 030 was applied once and postflight verified ledger version
`20261012100608`, successor function SHA-256
`929466b05250a96e3c5ff20c90d99d7d0da415b8cd021a19c1069396c8c06506`,
old/new guard counts `0/1`, and preserved OID/owner/ACL/config/profile contract.

The canonical execution receipt is the
[Production release result](./04-boq-save-null-authorization-production-release-result.md).
This preparation and execution authority is consumed. Migration 030 is now
immutable/no-replay; later work requires a new forward change and fresh Owner
approval.
