# Stale Copy 031 — Production migration result, 2026-10-23

**Status: APPROVED DATABASE STEP COMPLETE; METADATA/LEDGER POSTFLIGHT PASS;
PRODUCTION STALE HTTP NOT RUN.**

The Owner explicitly approved fresh preflight → one application of 031 →
read-only postflight, confirmed a 15-minute Copy pause starting now and no other
DDL, and excluded business RPC, migration replay and further commit/push/deploy.
The first clock observation was `2026-10-23T06:36:09Z` (13:36:09 Bangkok);
the agreed end is approximately 13:51:09. No Copy flag or account permission
was changed. The Owner coordinates that pause; no messages were sent for them.

## Exact source, target and one execution

- Client: [B commit `42e01c56fe2eacb5239abc8d296ca1848c48a03b`](https://github.com/cloudstellar/conduit-boq/commit/42e01c56fe2eacb5239abc8d296ca1848c48a03b),
  tree `6283410f997d00fc808cd9d8f7153b9bc381786f`; fresh Vercel Overview still
  showed this source as the current Ready Production deployment
  `Gf8gmTN8H5k7dYebeEzRwV5DwjW5`. No new deployment occurred.
- SQL: [031](../../migrations/031_boq_duplicate_stale_conflict_guard.sql),
  exact committed bytes, SHA-256
  `34c67a8d505c107a2fc86e1ecf8a9ed48a3c94a31d6d169ca016e5921463adef`.
- Supabase project: `otlssvssvgkohqwuuiir`, existing backend named
  **Conduit Price List**, `ACTIVE_HEALTHY`, region `ap-south-1`.
- Database: `postgres`, observed PostgreSQL `17.6`; read-only pre/post sessions
  were `postgres/postgres`. The successful SQL execution also passed 031's
  own session/current-user and security guards.
- Executor: `supabase_apply_migration`, name
  `boq_duplicate_stale_conflict_guard`, called **once** with exact SQL.
  The tool returned `{"success":true}`. No retry or alternate executor ran.
- Actual new ledger identity:
  **`20261023063934/boq_duplicate_stale_conflict_guard`**.

The migration replaces only the stale-source exception in
`public.duplicate_boq_atomic(uuid,uuid,timestamptz,text,uuid)`:
`40001` → `PT409`, retaining the message and adding exact detail
`BOQ_SOURCE_STALE`. No business function was invoked by the migration.
Its function replacement and the platform's migration-ledger write are the
authorized changes. No business DML, Catalog/Factor/account operation, reset,
service restart, session termination or 027–031 replay was performed.

## Fresh preflight and postflight

Preflight was captured at `2026-10-23T06:37:54.504598Z` (13:37:54 Bangkok).
Postflight was captured at `2026-10-23T06:39:50.672213Z` (13:39:50 Bangkok).
Both metadata queries used `BEGIN ... READ ONLY` and ended with `ROLLBACK`;
the selected application tables were not scanned for business rows.

| Check | Preflight | Postflight |
|---|---|---|
| Duplicate definition SHA-256 | `d3c422a78c2434ad40c932250b734871608282bc41dce3097a853ddcc1637910` | `508f70695e5f5578734570d356c5a0921cab0e0dc0a207e8ffcc9aca313b68b2` |
| Target function OID | `112777` | Same `112777` |
| Raw non-source function metadata / comment | Captured | Exact equality |
| Owner / SECURITY DEFINER | `postgres` / true | Unchanged |
| Execute ACL | Only `authenticated=X/postgres`, `postgres=X/postgres` | Unchanged |
| Configuration | `search_path=""`, `lock_timeout=5s`, `statement_timeout=30s` | Unchanged |
| Selected contracts | 6 relations / 15 functions / 7 triggers equal frozen baseline | Only Duplicate definition SHA changes; all other selected descriptors equal fresh preflight |
| Ledger | 30 identities, ending at 030; no conflict candidate | 31 identities; exactly one new 031 identity; all prior 30 version/name pairs preserved |
| Activity visibility | 0 hidden-query cases | 0 |
| Non-idle Copy / Copy lock waiters | 0 / 0 | 0 / 0 |
| Relevant DDL heuristic / ungranted relevant relation locks | 0 / 0 | 0 / 0 |
| Idle-in-transaction sessions | 0 | 0 |

Four client backends were observed at both snapshots; zero relevant activity
does not mean zero database connections. Activity checks are bounded instant
observations, not proof of every possible DDL or future request. The Owner's
exclusive-window confirmation remains part of the operational basis.

An independent offline reviewer compared the actual pre/post JSON and full
version/name ledger lists, and rederived the exact replacement hash from the
frozen source: **PASS**. The postflight reopening condition is met. Honor the
Owner's full 15-minute pause and refresh existing tabs before resuming Copy.

## Acceptance limits and custody

- No business RPC or Production Copy/Save test ran, including an expected-denial
  stale probe. **Production stale HTTP/browser behavior remains NOT RUN.**
  Metadata PASS is not full business-flow PASS.
- Existing local 49/49 API, 2–3 ms stale responses and preserve browser recovery
  remain their dated local evidence. Selected-Factor stale browser recovery and
  browser request-count/UUID continuity retain their recorded limits.
- No BOQ business-row fingerprints/counts were read here; global business-row
  invariance is not claimed. Exact SQL review and metadata comparisons establish
  the bounded function/security/ledger result, not every business-data property.
- No new guarantee is made that function commit, platform ledger write and API
  acknowledgement are atomic together. This run observed success and a consistent
  successor/ledger result. Any future uncertain state requires inspection, not
  replay, an inverse to `40001`, ledger repair or automatic restart/termination.
- Before local closeout documentation, all **543** canonical nonignored files,
  path inventory, HEAD, index and Git status were unchanged. Existing dirty C
  work remains local. Subsequent changes are this receipt and current-status
  documentation only; no source/package/lockfile/migration edit or Git publication.

Migrations **027–031 are immutable/no-replay**. The earlier local 031 authority
correction remains valid and is not retroactively approved by this Production
execution; see the [frozen local result](./BOQ_DUPLICATE_STALE_CONFLICT_LOCAL_RESULT.md).
This execution authority is complete/consumed. A future HTTP proof needs a new
explicit actor/sample/request scope. A later database correction needs its own
reviewed forward change and approval. No further Production operation or
commit/push/deploy follows from this closeout.

Private host-local artifacts:
`/private/tmp/conduit-boq-031-production-20261023-svizv9xc/` contains source custody,
exact SQL, pre/post metadata and ledger observations, once-only attempt/success
receipts, comparisons and result. The query SHA-256 was
`891f01e1351b620a32d30650c8be9cea4295076b9bb081e8518930b141fd9fee`.
Temporary artifacts are not durable published evidence; this local receipt
preserves the exact identities, bounded results and limits. The
[B client receipt](./STALE_COPY_B_CLIENT_PRODUCTION_RELEASE_RESULT_20261023.md)
remains unchanged as the earlier client-only stage.
