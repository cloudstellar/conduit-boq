# BOQ Save NULL Authorization Guard — Production Release Runbook

**Prepared:** 2026-10-12
**Status:** Executed and closed 2026-10-12; migration 030 applied exactly once; see the [Production release result](./04-boq-save-null-authorization-production-release-result.md).
**Production project:** `otlssvssvgkohqwuuiir`

This is the preserved execution runbook. Its gates were completed under the
Owner's explicit GO. The final ledger identity is
`20261012100608/boq_save_null_authorization_guard`; do not reuse this runbook as
authority to retry or replay the migration.

## Release boundary

This is the independent security release for
[`030_boq_save_null_authorization_guard.sql`](../../../migrations/030_boq_save_null_authorization_guard.sql),
SHA-256
`e6a3175413f961d24feb03dbe7f757782dd2f08710a911732531ebc9b3d9081a`.
It changes only the final Save authorization guard from `IF NOT predicate` to
`IF predicate IS NOT TRUE`. It does not contain the Quantity UI/runtime work,
change business rows, or edit/replay migrations 027/028/029. Merging its
docs/SQL-only PR may still trigger Vercel to redeploy the unchanged application
runtime; that deployment must be explicitly authorized, observed and recorded
or a proven skip mechanism must be documented.

At this security-release closeout, the Quantity release still had a separate
future source/Preview gate, GO decision, deployment and result; the candidate
was local and its then-planned Q-A/Q-B gates had not been executed. Preserve
that chronology. The later current state is a `PREVIEW-VERIFIED CANDIDATE` at
exact source `5527fe9`, after the Owner-selected no-PR/no-separate-CI Solo path;
see [Product Plan #06](../product/06-r0a-quantity-input-safety-release-plan.md)
and [Preview Result #07](../product/07-r0a-quantity-input-safety-preview-result.md).
Nothing in this 030 runbook granted that completed Preview or grants later
integration or deployment authority.

## Frozen preflight — 2026-10-12

The planning read-only capture at `2026-10-12T09:24:41.823811Z`
(`16:24:41.823811` Asia/Bangkok) found:

| Check | Required and observed value |
|---|---|
| Remote `main` | `c0cb6451c4d9924f69de93df4eee80abb6cca3c9` |
| PostgreSQL | `17.6` / `170006` |
| Transaction | repeatable read, read only, final `ROLLBACK` |
| Session/current user | `postgres` / `postgres` |
| Existing ledger | `29` total rows; max `20260831004110`; exact count `1` each for 027/028/029; no later version or `boq_save_null_authorization_guard` row |
| Save signature | `public.save_boq_with_routes(uuid,jsonb,jsonb)` |
| OID/behavior posture | `23374`; volatility `v`; parallel `u` |
| Owner/security | `postgres`; `SECURITY DEFINER` |
| Execute ACL | `authenticated=X/postgres`, `postgres=X/postgres` |
| Function config | `search_path=""`, `lock_timeout=5s`, `statement_timeout=30s` |
| Definition | predecessor SHA-256 `aefe5097626539b83f02d418cbc6fe1ca4d2ad195e927d987f174c5e7701c9e9` |
| Guard counts | old `1`; new `0` |
| Active-profile contract | `public.user_profiles.status` is `text NOT NULL`, default `pending`; validated check permits only `active`, `inactive`, `suspended`, `pending` |

The active-profile contract was captured separately at
`2026-10-12T09:40:00.304674Z`, also in a read-only transaction ending with
`ROLLBACK`. This evidence becomes stale when Git, the migration ledger,
PostgreSQL version, function definition/metadata, profile-column contract or
release artifact changes. Repeat the same bounded read-only checks immediately
before the write. Stop on any difference.

Supabase's current migration guidance says remote schema changes must retain
migration history. This repository intentionally keeps reviewed remote scripts
under root `migrations/`; `supabase/migrations/` contains no SQL. Therefore:

- do not use `supabase db push`, `db pull`, linked diff or migration repair;
- do not move or copy migration 030 into `supabase/migrations/`;
- do not use raw `execute_sql` for the write because it would not create the
  required migration-ledger entry;
- use MCP tool `mcp__codex_apps__supabase_apply_migration` once, with name
  `boq_save_null_authorization_guard` and the exact bytes of the frozen root
  migration. Its response does not establish the generated ledger version;
  obtain that identity immediately afterward from `list_migrations` and the
  bounded read-only ledger postflight.

References: [Supabase database migrations](https://supabase.com/docs/guides/deployment/database-migrations),
[database function security](https://supabase.com/docs/guides/database/functions),
and the [local validation result](./02-boq-save-null-authorization-guard-plan-and-result.md).

## Single-owner checkpoints

Local-freeze approval is not remote-repository or Production authority. The
Owner is the sole reviewer, so keep one exact security commit and avoid
ceremonial approval layers while preserving the external-write boundary.

### S-A — freeze the local review candidate

1. Confirm the security-only working-tree diff and exact
   migration/runner/test/doc hashes; exclude every Quantity runtime path.
2. Run full repository validation and the isolated 63-case SQL matrix. Require
   a clean receipt and owned-container removal.
3. Create one security-only local commit without staging any Quantity runtime or
   Quantity-only documentation.
4. Record its commit/tree identity and rerun validation from that exact clean
   tree. Keep the pending Quantity changes preserved outside the test checkout.

### S-B — one external release decision

1. Repeat the bounded Production read-only preflight. Require the exact values
   above, including no 030 ledger row.
2. Record the current security-advisor baseline. Existing warnings are not a
   reason to expand this correction; any new target-specific blocker is STOP.
3. Present the exact local commit/tree and validation, then obtain one explicit
   Owner GO covering its remote publication, the repository's required merge or
   direct-main path, any resulting unchanged-runtime Vercel Production
   deployment, the exact migration artifact, MCP migration executor and bounded
   postflight. Use a PR only if repository controls require it or it materially
   improves the exact-commit check; there is no second human reviewer to wait for.

## Production execution

After S-B GO only:

1. Publish the exact commit through the chosen repository path and verify
   remote `main` contains the reviewed tree and exact migration SHA-256. If
   Vercel runs, require the unchanged runtime to become Ready and record its
   identity; otherwise record the proven skip.
2. Repeat preflight after the merge/deployment observation. Stop if any expected
   value changed.
3. Call `mcp__codex_apps__supabase_apply_migration` exactly once for project
   `otlssvssvgkohqwuuiir`, name
   `boq_save_null_authorization_guard`, using the exact migration file contents.
4. If the result is failed, timed out or ambiguous, do not retry. Perform the
   read-only ledger/function postflight first and escalate the observed state.
5. Call `list_migrations` and run the bounded read-only postflight to discover
   and verify the generated ledger version. The tool's success response alone
   is not PASS.
6. Do not deploy the Quantity application during this gate.

## Required postflight

Use read-only catalog/ledger checks and require all of the following:

- exactly one new ledger entry named `boq_save_null_authorization_guard`; record
  its generated version;
- 027, 028 and 029 remain present once and unchanged;
- Save definition SHA-256 is
  `929466b05250a96e3c5ff20c90d99d7d0da415b8cd021a19c1069396c8c06506`;
- old guard count `0`, new guard count `1`;
- function OID, signature, owner, `SECURITY DEFINER`, volatility, parallel
  posture, ACL and config equal the preflight values;
- current security advisors introduce no unexpected target-specific finding;
- no migration replay, business-row mutation, Catalog/Factor operation or
  account/configuration change occurred.

Write a dated immutable result containing the migration ledger identity,
artifact/commit/tree hashes, preflight/postflight values, advisor interpretation
and any observed failure. Only then may the separate Quantity release reach its
GO decision.

## Failure and rollback rule

Migration 030 is forward-only. Never edit, reverse or replay it after a
successful apply. If the Quantity deployment later fails, keep 030 in place; it
is backward-compatible security hardening. If 030 itself needs correction,
stop traffic-changing work, preserve evidence and prepare a new reviewed forward
migration under new approval. Never improvise a destructive rollback.
