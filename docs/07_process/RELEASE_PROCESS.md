# Release Process
## Conduit BOQ System

> **Status:** CANONICAL
> **Last Updated:** 2026-10-23

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
> **Current Master Catalog release state:** Phase 4 and P-49 are complete
> end-to-end; see [Handoff #106](../plans/master-catalog/106-phase4-master-catalog-exact-remaining-work-handoff.md)
> and [Result #107](../plans/master-catalog/107-phase4-p49-master-catalog-final-closeout-result.md).
> A read-only Production recheck at `2026-08-29 01:38:54 +07` reconfirmed 027
> then 028 with no 029, `2568.1.0` at `710/710`, reviewed prices, unchanged
> Factor F, the three catalog flags plus migration-028 functions/raw
> `app_settings` ACL, and `0` working drafts at that instant; it made no write.
> Older rollout checklists and gates below are historical
> chronology for their release windows, not permission to replay them.

---

<a id="working-agreement-20261015"></a>
## Working agreement — clarified 2026-10-15

**Earlier bounded B closeout — 2026-10-23:** Owner chose no additional
Production HTTP probe and closed B on the recorded evidence; see the
[final receipt](../06_engineering/STALE_COPY_B_RELEASE_CLOSEOUT_20261023.md).
Production HTTP stays NOT RUN. It is not a mandatory pending B task or a full
behavior PASS. Do not repeat that optional-probe approval request automatically
or apply this choice to future releases. Authority is consumed; current work is
local documentation/LIST-1B review only with no external operation.

**Latest 031 DB execution — 2026-10-23:** the later explicit one-shot approval
was completed in the confirmed Copy/no-other-DDL window. Ledger
`20261023063934/boq_duplicate_stale_conflict_guard`, exact successor and unchanged
security/non-source metadata/related contracts passed postflight and independent
review. See the [031 receipt](../06_engineering/STALE_COPY_031_PRODUCTION_MIGRATION_RESULT_20261023.md).
No business RPC or commit/push/deploy ran. Production stale HTTP remains NOT RUN;
metadata PASS is not full business-flow PASS. 027–031 are immutable/no-replay,
execution authority is consumed, and closeout docs remain local. Earlier
031-unapproved passages below preserve their preceding stages.

**Earlier B client execution — 2026-10-23:** separately approved Solo B4
publication completed at `42e01c5`; Quality658 PASS and Vercel Production
Ready/current. See the [B client receipt](../06_engineering/STALE_COPY_B_CLIENT_PRODUCTION_RELEASE_RESULT_20261023.md).
031 was published as SQL source only; no DB operation/migration ran. Database
execution and Production stale-RPC proof remain unapproved. Client publication
authority is consumed; closeout documentation remains local with no second
push. Earlier A-only/B-unapproved passages below are dated stages.

**Later A execution closeout — 2026-10-23:** the Owner separately approved
the A-only Solo route. Exact A8 commit `a3114fc` is now on main and Vercel
Production Ready/Current; see the [A release receipt](../06_engineering/DEPENDENCY_A_PRODUCTION_RELEASE_RESULT_20261023.md).
The named stale-Copy exception/publication authority are consumed. B and 031
remain unapproved; no DB operation or migration was part of A. The earlier
planning-only paragraph below remains its dated stage, not standing authority.

**Named exception recorded later — 2026-10-23:** the Owner accepted the
preserved stale-Copy FAIL for the exact dependency release A only, then B as a
separate next release. The [A/B review plan](./DEPENDENCY_AND_STALE_COPY_RELEASE_PLAN_20261023.md)
binds the exception to source, scope and A closeout. It is not a general waiver
or publication/Production authority; no repeated request for this A exception
is needed. The current request authorizes plan/documentation work only.

L1 followed the separately approved Solo path: one exact 15-file commit/push,
CI and Vercel checks, then a bounded no-write smoke. Its source was `b1ce449`;
normal Auth/profile reads were distinct from excluded mutating business RPCs.
No rollback ran. The prior conditional rollback authority is not a standing
future deployment permission. A later docs-only push may also auto-deploy and
needs its own reviewed source/target and explicit publication approval.

This records the Owner's expectation of testing locally before Production.
It is documentation of how later approved work is handled, not approval to
reset Docker, implement a feature, publish Git changes or operate Production.

1. **Inspect first.** Read the mandatory handoff and inspect relevant source,
   Git state and test target read-only. Identify what already exists before
   proposing new work. Do not require a Production inspection for every task.
2. **Agree one small scope.** Explain the concrete problem, proposed change,
   affected files/targets and intended tests in plain language. Continue within
   the approved scope without asking again for routine steps it already covers.
   Local implementation, an exact local reset/fixture setup and test writes may
   be approved together. No such execution is authorized by this agreement.
3. **Test before proposing release.** For application changes that use the
   database, run the affected user flows against local Docker with the relevant
   current Production schema, RPCs, permissions and behavior verified. For a
   new DB change, establish that baseline, then rehearse the approved change
   and its affected flows. Use recreatable synthetic data; copying all real
   BOQs/accounts is unnecessary. An isolated SQL fixture proves its named SQL
   cases, not full Auth/API/browser integration. An unrelated service or full
   parity programme must not become a prerequisite for every small task.
4. **Report evidence before release approval.** State the exact source/diff,
   test target/baseline, cases run, PASS/FAIL/NOT RUN and limitations. Lint,
   unit tests, build or CI success alone is not a Docker/database-flow PASS.
   The current Quality workflow does not run Docker integration automatically.
   If a required test fails or its relevant baseline is unknown, continue the
   authorized correction work and hold the release recommendation. Any proposed
   exception must be explicit and accepted by the Owner for that release;
   a historical accepted residual is not permission to skip a new test.
5. **Publish only within explicit authority.** Present the tested change and
   remaining risks before asking to commit/push/integrate/deploy or operate
   Production. The Owner can authorize named operations together; do not add
   redundant approval steps. Local approval never implies those operations.
   Verify deployed source and bounded post-release behavior afterward, with
   Production writes only when expressly included in the approved scope.

Keep the Solo workflow simple: no mandatory extra PR, test-DB backup or second
Docker stack. Owner backup/snapshot files remain separate and untouched. A
documentation-only edit needs appropriate diff/link checks, not an unnecessary
DB rehearsal. Migrations 027–030 remain immutable/no-replay; use the
[Local Database Parity Plan](../06_engineering/LOCAL_DATABASE_PARITY_PLAN.md)
and [Local Parity Result](../06_engineering/LOCAL_DATABASE_PARITY_RESULT.md)
for the prepared baseline and remaining stale-Copy failed gate. These safeguards
do not change #09's
product release order or turn proposed plans into approved implementation.

## 1. Deployment

**Current planning overlay (2026-10-14):**
[Integrated Roadmap #09](../plans/product/09-integrated-roadmap-and-it-decision-handoff.md)
governs proposed sequencing and IT/SSO readiness. Choose the simplest adequate
review/integration path for each newly approved release; a PR is conditional,
not a new requirement for every Solo task. The completed Quantity Solo path
below is a receipt whose authority is consumed, not permission to reuse it.
Internal target and SSO cutover remain unapproved and need separate acceptance.

The recorded Production application deployment is automated by Vercel from
`main`; verify its live configuration before publishing, since a docs-only push
may trigger deployment too. A reviewed pull request is one integration path.
For the completed Quantity release only, the Owner selected a Solo path: exact
local commits and local checks formed the pre-publish review package, the
feature branch was pushed directly for Preview without a PR or separate CI
gate, and a later explicit Q-B approval authorized the exact fast-forward to
`main` and matching Production deployment. The existing workflow after the
`main` push remained enabled and passed.

Supabase Production DB migrations are separate operations. A code merge or
Vercel deploy must never be treated as evidence that a migration was applied.

### DUP-1 release record — 2026-08-31

Atomic BOQ Duplicate is released and verified. Exact migration 029 was applied
once as `20260831004110/atomic_boq_duplicate` (SHA-256
`748a84431c36bc0aa4bf3f8293aa818768d5198d9da82c9f1e0ad5106a382c3d`),
then PR [#9](https://github.com/cloudstellar/conduit-boq/pull/9) was merged as
`0e76ed39e68746c9bd6003da69a03f096ae482a3` and the matching Vercel Production
deployment reached success.

Database evidence and application evidence were checked separately. Isolated
PostgreSQL, CI, rollback-scoped Production functional proof, desktop/mobile
rendered QA, an expected live PostgREST fail-closed probe, and final
`263/326/2617/0` BOQ/route/item/request-ledger no-residue postflight passed.
Catalog and Factor F hashes/pointers remained unchanged. The complete receipt
and residuals are in the
[DUP-1 Production Result](../plans/product/04-atomic-boq-duplicate-production-release-result.md).

That one-shot release authority is consumed. Do not replay migration 029 or
infer authority for LIST-1, Quantity Expression, another deploy, or another
Production write.

### BOQ Save NULL authorization guard record — 2026-10-12

Migration 030 was applied exactly once as
`20261012100608/boq_save_null_authorization_guard`, after the reviewed source
commit `cb2bb60`. Exact postflight and limitations are recorded in [Security
Result #04](../plans/security/04-boq-save-null-authorization-production-release-result.md),
and the repository closeout is `7c09ab8`. Migrations 027–030 are
immutable/no-replay and this release authority is consumed.

Quantity Input Safety was not part of the security release above. It later
completed Q-A and Q-B under [Product Plan
#06](../plans/product/06-r0a-quantity-input-safety-release-plan.md),
[Preview Result #07](../plans/product/07-r0a-quantity-input-safety-preview-result.md),
and [Production Result #08](../plans/product/08-r0a-quantity-input-safety-production-release-result.md).
Runtime/tests `b18e69a` reached Production through exact `main` source
`4d285f8`; GitHub Quality, Vercel Ready, authenticated no-write QA, console,
Print, and read-only database verification passed. Q-A/Q-B authorities are
consumed. A Production write test still needs its own named data and authority.

## 2. Pre-Release Checklist

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Documentation updated
- [ ] Migration execution window approved separately (if any)
- [ ] Owner approval

## 3. Master Catalog Baseline

As of 2026-06-21, Production Master Catalog Phase 0 → 1A → 2 → 1B is complete.
Migrations `009`, `010`, four operational `010a` indexes, and `011` were
applied/verified; Phase 2 was merged through PR #2 and deployed by Vercel.
See the [verification report](../plans/master-catalog/05-verification-report.md).

**Historical pre-Phase-4 snapshot:** At this document's 2026-06-22 baseline,
Phase 4 administration/publication had not started and was governed by the
[Change Request](../plans/master-catalog/09-phase4-change-request.md). That
dated boundary is retained as release chronology; current completion and
no-replay authority are #106/#107 above.

## 4. Versioning

Historical application-version snapshot (2026-06-22): **v1.2.0**

---

## References
- Roadmap: [01_overview/ROADMAP.md](../01_overview/ROADMAP.md)
