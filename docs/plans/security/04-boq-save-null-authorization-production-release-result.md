# BOQ Save NULL Authorization Guard — Production Release Result

**Executed:** 2026-10-12

**Status:** Production PASS; migration applied exactly once; release authority consumed

**Boundary:** `BOQ_SAVE_NULL_AUTHORIZATION_GUARD_PRODUCTION_CLOSEOUT_20261012`

**Production project:** `otlssvssvgkohqwuuiir`

## Outcome

Migration 030 is live in Production. The final authorization guard in
`public.save_boq_with_routes(uuid,jsonb,jsonb)` now rejects both false and SQL
`NULL` decisions:

```sql
IF v_is_authorized IS NOT TRUE THEN
```

The migration ledger contains exactly one new entry:
`20261012100608/boq_save_null_authorization_guard`. Migrations 027, 028, 029
and 030 are immutable and must never be edited, retried or replayed. Any later
database correction requires a new forward migration and fresh Owner approval.

This release did not authorize or publish the separate Quantity UI/runtime
candidate. It did not operate on Catalog, Factor F, BOQ business rows, account
configuration or the protected archive.

## Exact released artifact

| Item | Released identity |
|---|---|
| Security source commit on `main` | `cb2bb60eed7ea3d72149df4a4273d8fe1bfdf3c1` |
| Parent | `c0cb6451c4d9924f69de93df4eee80abb6cca3c9` |
| Tree | `183832636540324dcd7db6ed55b5b38acaacf6fd` |
| Migration | `migrations/030_boq_save_null_authorization_guard.sql` |
| Migration SHA-256 | `e6a3175413f961d24feb03dbe7f757782dd2f08710a911732531ebc9b3d9081a` |
| Expected predecessor function SHA-256 | `aefe5097626539b83f02d418cbc6fe1ca4d2ad195e927d987f174c5e7701c9e9` |
| Verified successor function SHA-256 | `929466b05250a96e3c5ff20c90d99d7d0da415b8cd021a19c1069396c8c06506` |
| Production migration ledger | `20261012100608/boq_save_null_authorization_guard` |

The security commit changed exactly eight paths: migration 030, its isolated
runner/fixture/smoke/static test, the migration ledger document, and security
plan/runbook documents. It contained no Quantity runtime or Quantity test path.

Validation on that exact clean tree passed 54 test files / 522 tests, ESLint,
TypeScript, the Production build and the isolated 63-case SQL matrix. The
matrix changed only the three known nullable-scope bypasses: predecessor
20 allowed / 43 denied / 3 bypasses; successor 17 allowed / 46 denied / 0
bypasses. The exact clean receipt was
`/var/folders/f4/y8__9xrd293cwz9jd03zkyk40000gn/T/conduit-boq-save-null-auth-UsQvL6/receipt.json`,
SHA-256
`7c08ef760e30bbdf79c15d875cb2d5ff1b5b2c6feddbdde87fe33d2725a4112a`.
This host-temporary path is evidence for the execution session, not a durable
repository artifact.

## Repository and deployment gate

The Owner approved direct publication of the exact security commit, observation
of its resulting Vercel deployment, one migration application, bounded
postflight and closeout.

- Remote `main` was verified at the exact commit and tree above.
- GitHub Actions `quality` run
  [38233710575](https://github.com/cloudstellar/conduit-boq/actions/runs/38233710575)
  completed successfully at `2026-10-12T10:03:30Z`.
- Vercel deployment
  [`Dz87EUZo4f35p9VyzyEhVnwwLt6x`](https://vercel.com/cloudwho-2662s-projects/conduit-boq/Dz87EUZo4f35p9VyzyEhVnwwLt6x)
  completed successfully at `2026-10-12T10:03:13Z`. This docs/SQL release
  redeployed the already validated application runtime; no Quantity candidate
  was included.

## Immediate Production preflight

The final pre-write capture ran at `2026-10-12T10:05:29.654875Z` inside a
repeatable-read, read-only transaction ending with `ROLLBACK`.

| Check | Observed before the write |
|---|---|
| Project/database | `ACTIVE_HEALTHY`; PostgreSQL `17.6` / `170006` |
| Session/current user | `postgres` / `postgres` |
| Ledger | 29 rows; max `20260831004110`; no target or later row; 027/028/029 each exactly once |
| Save function | OID `23374`; owner `postgres`; `SECURITY DEFINER`; volatility `v`; parallel `u` |
| Execute ACL | `authenticated=X/postgres`, `postgres=X/postgres` |
| Function config | `search_path=""`, `lock_timeout=5s`, `statement_timeout=30s` |
| Definition/guards | predecessor SHA above; old guard `1`; new guard `0` |
| Active-profile contract | `status` is `text NOT NULL`, default `pending`; one validated check allows `active`, `inactive`, `suspended`, `pending` |
| Contention | zero other active client backends, lock waiters, ungranted locks and advisory locks |

The exact committed migration bytes were rehashed immediately before execution.
`mcp__codex_apps__supabase_apply_migration` was called exactly once with project
`otlssvssvgkohqwuuiir`, name `boq_save_null_authorization_guard` and those
bytes. It returned `success: true`. The generated ledger identity was obtained
afterward from `list_migrations`; it was not inferred from the success response.

## Postflight

The corrected postflight capture ran at `2026-10-12T10:07:00.909170Z` inside a
new repeatable-read, read-only transaction ending with `ROLLBACK`.

| Check | Observed after the write |
|---|---|
| Ledger | 30 rows; max and only target row `20261012100608/boq_save_null_authorization_guard`; 027/028/029 each still exactly once |
| Definition/guards | successor SHA above; old guard `0`; new guard `1` |
| Preserved function posture | OID `23374`; same signature and argument names; PL/pgSQL; returns `jsonb`; owner `postgres`; `SECURITY DEFINER`; volatility `v`; parallel `u`; ACL and config unchanged |
| Active-profile contract | unchanged from preflight |
| Contention | zero lock waiters, ungranted locks and advisory locks |

The migration itself asserted in the same transaction that every `pg_proc`
field except `prosrc` remained identical. Its reviewed SQL contains no
statement that mutates business, Catalog, Factor F or account rows; the only
non-ledger database change is the exact function-body replacement. The MCP
executor added the required migration-ledger row.

## Security-advisor comparison

Advisor captures immediately before (`2026-10-12T10:04:54.941Z`) and after
(`2026-10-12T10:06:35.913Z`) were identical:

- two informational RLS-without-policy findings;
- one anonymous `SECURITY DEFINER` finding for the signup allow-list RPC;
- 18 authenticated `SECURITY DEFINER` findings, including the intentional Save
  RPC callability;
- leaked-password protection disabled.

No new target-specific finding appeared. The generic authenticated
`SECURITY DEFINER` warning for Save remains expected because authenticated
users must call the RPC; migration 030 hardened its internal authorization and
did not change that API contract. These pre-existing advisor findings are
separate security work and are not relabelled fixed by this result.

## Execution notes and residuals

One local orchestration hash helper failed before the Supabase migration tool
was called because that runtime did not expose Web Crypto. No external write
occurred; the committed blob was then verified with `shasum` before the single
migration call. The first postflight read-only query incorrectly qualified SQL
`COALESCE` as a catalog function and failed without changing data. The ledger
read had already shown the new row, so migration 030 was not retried; the
corrected read-only postflight then passed.

The synthetic SQL matrix is not an HTTP/JWT, live-persona or concurrency test.
The previously accepted expanded Production persona residual therefore remains
accepted residual evidence, not PASS. No evidence in this release authorizes a
replay, rollback, broader security change, Quantity deployment, LIST-1 work,
Catalog/Factor operation, account change or archive operation.

The closeout documentation commit containing this result may cause another
docs-only Vercel deployment. That observation is repository custody evidence;
it does not replace the frozen application/security release identity above.
