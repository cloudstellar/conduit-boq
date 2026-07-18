# Phase 4 Implementation Execution Pack

**Status:** Owner-approved for WP-0 through WP-8 implementation/local
rehearsal; WP-9 Production execution requires separate P-12 through P-15
approvals after WP-8 evidence review. Production migration, deploy, feature
enablement, and publication remain normal sequential owner decisions.

**Prepared:** 2026-06-29

**Owner decision recorded:** 2026-07-04 — approved according to the
recommendation for WP-0 through WP-8 only. Mandatory gates include disabled
feature flag by default, BOQ regression preservation, Factor F before/after
assertions, `save_boq_with_routes` contract/regression coverage inherited from
production hotfix `016` and the approved Post-Factor-F plan, live Production
preflight before Production gates, and Decision Register authority for P-02
through P-11 data decisions.
This approval does not authorize WP-9, Production migration, deploy, feature
enablement, catalog publication, or any Factor F write/pointer/backfill.

**Reliability alignment recorded:** 2026-07-11 — owner instructed a docs-only
plan alignment before further implementation. WP-6.5 is expanded from two
publish guards into the reliability gate defined below; WP-7/WP-8 keep their
business-regression and clean-rehearsal responsibilities. No Local reset or
Production action is authorized by this amendment.

**WP-6.5 Local implementation authorized:** 2026-07-11 — owner approved the
P-11 staged-acceptance/P-20 sequence and authorized Local-only implementation.
Current implementation/evidence status is maintained only in
[the Tracker](./25-phase4-execution-progress-tracker.md). This authorization
still does not permit an unannounced Local reset or any Production action.

**Capability-completeness alignment recorded:** 2026-07-12 — owner requested
the full audit and plan correction in
[Audit #29](./29-phase4-owner-dev-completeness-audit.md). WP-6.5 keeps its
bounded reliability evidence; new WP-6.6 must close C-01 through C-17 before
WP-7. Migration `020` is reserved for WP-6.6 and proposed P-18 placement moves
to `021`/WP-7.5. This alignment authorizes documentation only, not migration
implementation, Local reset, or Production action.

**WP-6.6 Local evidence recorded:** 2026-07-12 — P-21 later authorized the
Local-only implementation and destructive evidence runs as separate decisions.
Repository, migration `020` DB/RLS/concurrency, post-change P-20, and browser
technical QA passed on `3bfc74e`. Current status and owner closeout remain in
[the Tracker](./25-phase4-execution-progress-tracker.md); WP-7 must not start
until that closeout is accepted.

**P-26 human-intent alignment recorded:** 2026-07-14 — WP-6.6 Slice L adds
exact Recode/Retire summaries and DB-read typed-version Publish confirmation.
This is application/test/documentation hardening only: migration `020`, Local
bootstrap, WP-7, Factor F, hotfix `016`, and Production remain unchanged and
separately gated.

**P-28/G4 repository integration recorded:** 2026-07-15 — after accepting
G3/WP-6.6, the owner approved adding exact accepted migration `020` to the
Local bootstrap source and implementing the tracked WP-7 regression harness.
This is repository/source authorization only. It does not authorize or imply a
Local reset, live WP-7 execution, P-18/`021`, P-19, WP-8, Factor F or hotfix
scope expansion, feature enablement, publication, or Production access/write.

**P-29/G4E execution recorded:** 2026-07-15 — after the exact G4R checkpoint
was committed and pushed, the owner separately approved one destructive Local
reset. Exact checkout `15b707d443bec701f6b3a86aa7675ca1266604ba`
clean-bootstrapped the integrated `009`-`020` chain and passed live WP-6.6,
WP-6.5/P-20, WP-7, advisor, repository, and final-invariant gates. This makes
WP-7 ready for owner review; it does not approve P-18/`021`, P-19, WP-8,
Factor F/hotfix expansion, feature enablement, publication, or Production.

**P-33 WP-7.5 technical acceptance and WP-8 UX-gate alignment recorded:**
2026-07-15 13:54 +07 — after P-32 replacement evidence passed, the owner
accepted the exact WP-7.5 technical checkpoint. This acceptance confirms the
bounded database/RPC/order/hash/export/browser mechanism only. It does not
certify intended-admin usability or authorize `021` bootstrap inclusion, a
Local reset, WP-8 execution, P-19, feature enablement, publication, Factor F or
hotfix expansion, or Production. The placement UX criteria in Section 16 are
hard WP-8/P-14 release gates. Drag and drop is optional and cannot be the only
control; arbitrary inherited-row reorder remains outside Phase 4.

**P-34 WP-8 placement UX source/static recorded:** 2026-07-15 — the owner
authorized the bounded source slice and accepted exact application checkpoint
`0780925aca8fa7ebbf8abbaf2b7cf151b39b676a` after focused/full tests,
TypeScript, lint, diff, and network-enabled build passed. The implementation
now covers truthful accepted-versus-dirty state, versioned recoverable pending
choices and guarded navigation, direct exception filters/counts, native
keyboard relation controls, complete impact confirmation, and bounded list
derivation. This starts WP-8 only at source/static. `021` remains outside
bootstrap and no Local reset/write, measured live scale/accessibility evidence,
intended-admin UAT, feature release, Factor F/hotfix expansion, or Production
action is inferred.

**P-35 WP-8 bootstrap source integration recorded:** 2026-07-15 — exact gate
checkpoint `43b75e3f0b0643d6f4e741fcc81ea8b0a6311a13` authorizes adding unchanged
amended `021` after `020`, aligning current authority/provenance and executable
contracts, running repository checks, and committing/pushing the exact source
checkpoint. This does not authorize `npm run db:local:bootstrap`, any Local
reset/write, P-36 live evidence, P-37 acceptance, feature enablement,
publication, P-19, Factor F/hotfix expansion, or Production.

**P-36 WP-8 destructive Local execution recorded:** 2026-07-15 21:00 +07 —
after the explicit warning that `npm run db:local:bootstrap` resets all Local
Supabase, the owner instructed the team to continue. This authorizes the one
integrated Local-only run and named WP-8 evidence in Section 16 from the exact
pushed P-35 lineage. Fail closed on any scope-changing defect. P-37 acceptance,
feature enablement, publication, P-19, Factor F/hotfix expansion, and Production
remain separate.

**P-36 integrated technical result recorded:** 2026-07-15 — exact gate and
execution checkout `910cc3cc74660beecf18655d39cd0b0c085d1fc6` passed the
clean chain through `021`, integrated DB/RLS/concurrency/P-20/WP-7/WP-7.5,
export/advisors/repository gates, realistic 710+18 route rendering, and
disabled-baseline cleanup. Browser automation did not dispatch React/Radix
client state changes, so the live interaction, keyboard/recovery/error-
comprehension, and independent intended-admin portions of Section 16 remain
open. P-37 HOLD is recommended and Add/Supplement remains hidden. See
[P-36 Owner Review Note](./32-phase4-wp8-p36-owner-review-note.md).

**P-37 intended-admin UAT correction recorded:** 2026-07-17 — the first
no-reset session failed comprehension before any placement confirmation. The
working tree now presents one insertion-gap choice and truthful local state
while preserving the exact P-18 category/anchor/relation payload. Desktop/mobile
interaction QA passed. The later Local continuation passed stale rejection,
one acceptance, exact-request replay, accepted-state route readback, cleanup,
and post-evidence repository checks. Later no-reset UAT passed leave/return/
reload recovery and complete owner keyboard/focus/presentation review. Final
pushed checkpoint `f36d896d672609653de6634e307dcc44bce6d519` passed repository
verification. The owner did not submit the final placement batch through the
UI, and Section 16 still requires broader independent core-admin UAT, three
safe-error recoveries, and named import-preview/publish-readiness interaction
evidence. P-37 remains HOLD. See [Review Note #33](./33-phase4-wp8-p37-uat-ux-correction-note.md)
and [Closure Matrix #34](./34-phase4-wp8-p37-closure-matrix.md).

**P-38 evidence reconciliation and no-reset continuation recorded:**
2026-07-18 — the owner instructed the team to continue with the recommended
evidence-first path. Reconciliation retained actor-independent P-36/P-37/G1R/
G3/P-26/WP-4 evidence without converting it into intended-admin evidence.
[Owner UAT Script #35](./35-phase4-wp8-p37-evidence-reconciliation-and-owner-uat-script.md)
is the current Section 16 closure script: Cards A-G, three separately named
safe errors, same-session stale placement, uncertain response, 710-row import/
readiness measurements, and exact cleanup. P-38 authorizes no reset, successful
publication, P-37 acceptance, P-19, Factor F/hotfix, or Production action.
[Preflight Note #36](./36-phase4-wp8-p38-no-reset-owner-uat-preflight.md)
records the corrected unmapped-candidate E-01, 15-omission E-02, exact binary
hashes, tracked fail-closed Local commands, and passing read-only disabled
baseline. Commit/push that checkpoint before running mutating `prepare`; the
Owner must still create/abandon both drafts and complete Cards A-G.

**P-22 operator-workflow correction authorized:** 2026-07-12 — intended-admin
review placed WP-6.6 closeout on Hold and accepted
[Correction Plan #31](./31-phase4-wp66-operator-workflow-correction-plan.md).
Candidate `020`, the item-first workspace, and lock-bound final snapshot review
were implemented and passed repository/static checks on `ac31feb`. Prior
`3bfc74e` evidence remains historical but is superseded for revised closeout.
Owner-approved G1 Local DB/concurrency/P-20 input passed on final checkpoint
`e463270`; the pre-amendment operator/browser preflight passed on
`c8f6dca` without a reset or migration `020` change. P-23 owner-approved the
bounded persistent-identity, information-navigation, exact-draft import, and
review-export semantics amendment on 2026-07-13. Its Local-only working-tree
UI/static/browser checkpoint passed and was incorporated into the later exact
candidate. Final owner-approved G1R then passed on execution checkout
`721c2c2`; the separately owner-approved independent G2 clean rebuild and P-20
comparison then passed on the same exact candidate. G3 owner closeout, G4
bootstrap/WP-7 sequencing, and every Production action remain separate
decisions. The bounded no-reset G3 real-route technical walkthrough later
passed on source `6599c30`; P-26 was committed at exact `78e96ab`, and the
owner accepted G3/WP-6.6 on that exact checkpoint at 2026-07-14 23:50 +07.
G4 and every later gate remain separate.

**P-23.1 version-intent/item-first correction authorized:** 2026-07-13 — owner
approved explicit annual/revision/patch intent, complete all-status
reserved-number planning, a guarded next-sequence rule including same-year
annual recovery after a void lower number, direct post-create workspace
navigation, item-before-metadata hierarchy, and pointer-restore confirmation.
This amends candidate `020`; prior G1/live evidence is historical. Repository/
static and final G1R/G2 evidence later passed. G3 technical execution and owner
closeout have now passed; G4 and every Production action remain separate owner
decisions.

**P-24 pre-G1R hardening authorized:** 2026-07-13 — before any clean rebuild,
enforce annual base +1 through +10 in UI/server/DB, preserve safe Thai stale and
range errors across background refresh, focus the error for keyboard/screen
reader recovery, hide raw identifiers under support details, contextualize
first-rollout authority copy, and keep Factor F secondary. Update candidate
`020`, contracts, tests, and operator docs together. The later separately
approved G1R/G2 runs passed on exact checkout `721c2c2`; this entry still does
not authorize G3/G4 or any Production action.

**Purpose:** Turn the reviewed Phase 4 architecture into an execution checklist
that an implementer can follow without re-deciding scope, sequencing, database
boundaries, or verification gates.

This document does not replace the architecture, CR, runbook, DB contract, or
verification report. It is the operational bridge from approved plan to local
implementation.

During implementation, keep
[Doc #25 Execution Progress Tracker](./25-phase4-execution-progress-tracker.md)
updated as the owner-facing dashboard. The Verification Report remains the
gate evidence record.

## 1. Readiness verdict

Phase 4 is detailed enough to start **implementation and local rehearsal** after
P-01 owner approval.

It is **not** standing authorization for Production migration, feature
enablement, or catalog publication. Those remain separate gates in the Change
Request, Runbook, and Verification Report. After WP-8, pause for a readiness
review before requesting P-12.

Start allowed:

- local branch/worktree work;
- additive `017+` migration design after production hotfix `016`;
- local Supabase reset/rehearsal only after telling the owner it resets the
  entire Local Supabase stack and receiving explicit approval for that reset;
- parser/canonical-hash implementation;
- admin UI behind disabled feature flag;
- local tests, build, lint, advisors, and verification report filling.

Start blocked:

- Production migration;
- Production deploy;
- feature enablement;
- publish of catalog `2568.1.0`;
- any Factor F write, publish, pointer movement, or legacy BOQ backfill.

## 2. Non-negotiable scope rules

1. Production `2568.0.0` is the authority for the first 710 item names, units,
   material costs, labor costs, and unit costs.
2. Candidate `2568.1.0` is a planning example until owner approval records the
   exact version, effective date, approval reference, and archive reference.
3. The first structured-code rollout clones all 710 Production rows before any
   approved candidate changes.
4. The first rollout preserves Production prices. Workbook prices are not
   authority.
5. Raw workbook evidence has 18 workbook-only rows. P-07 resolves workbook
   `FTW-CON-002` as a typo shadow of Production `ITEM-0491`; the remaining 17
   unresolved supplement candidates are deferred unless separate item and price
   authority is approved.
6. The 16 HDPE Crossing candidate code conflicts must be corrected or rejected
   before candidate code freeze.
7. Factor F is complete before Phase 4. Master Catalog Phase 4 has no Factor F
   publication, pointer movement, row-value change, or legacy BOQ backfill.
8. Catalog dataset hashes and official catalog exports exclude Factor F rows,
   Factor F metadata, BOQ snapshots, and BOQ totals.
9. BOQ Rebase is Phase 4.2 and must not be implemented in Phase 4 Core.
10. Supabase advisor findings from before Phase 4 must be baselined/triaged.
    New or untriaged findings from Phase 4 are blockers.
11. External analysis memos and quick-decision guides are advisory only. Seed,
    backfill, export, and publish code must read the recorded Decision Register
    outcome, not infer final choices such as retiring `ITEM-0139`, approving
    `CRS-H06`/`CRS-H08`, or deploying named CI assets from an analysis note.
12. ADR-003 already defines reusable annual/revision/patch catalog versions.
    `2568.1.0` is an exact rehearsal candidate, not a reusable-path constant.
13. Database idempotency is end-to-end only when the UI reuses the same
    operation ID after an uncertain response.
14. SQL text-shape tests and untracked artifact scripts are supporting checks,
    not substitutes for live DB behavior or reproducible release evidence.
15. "Complete" requires a capability trace across route/UI, exact selected
    entity, Server Action, RPC/schema authority, audit/correction, readiness/
    export effect, tests, and operator procedure. A fail-closed DB guard alone
    is safety evidence, not a complete user workflow.
16. Version type is business intent, not a numeric guess. All created numbers
    remain reserved, and both UI and DB must use the complete all-status sequence.

## 3. Required owner decisions before each work band

| Decision | Required before | Source |
|---|---|---|
| P-01 implementation/local rehearsal approval | Any Phase 4A implementation | Decision Register |
| P-02 duplicate treatment for `ITEM-0131` / `ITEM-0139` | Candidate freeze, not generic schema | Decision Register |
| P-03 HDPE Crossing code correction/rejection | Candidate code freeze | Decision Register |
| P-04 canonical codes for 20 Production-only rows | Candidate 710-row freeze | Decision Register |
| P-05 disposition of 18 raw workbook-only rows / 17 unresolved supplement candidates | Candidate freeze/publication | Decision Register |
| P-06 AAA/TTT group meanings | Code-group backfill/publication | Decision Register |
| P-07 `FTW-CON-002` wording disposition | Candidate scope freeze | Decision Register |
| P-08 legacy `2568.0.0` publication metadata | Publication-completeness constraint | Decision Register |
| P-09 exact candidate version/effective/archive refs | Candidate draft/publish rehearsal | Decision Register |
| P-10 runtime CI assets | CI implementation/deploy | Decision Register |
| P-11 official export visual sample | Export acceptance | Decision Register |
| P-12 to P-15 | Production migration/deploy/enable/publish | Decision Register |
| P-18 add/supplement placement governance | Accepted via P-30; amended WP-7.5 passed the separately authorized P-32 Local apply/reset/live gate and P-33 bounded technical acceptance; the later bootstrap/WP-8 UX/release decision remains separately gated | Decision Register / Review Note #28 |
| P-19 inactive/retired export policy | Publication/filing of any version with inactive rows | Decision Register |
| P-20 canonical hash/identity portability | Initial WP-6.5 exit and rerun after WP-6.6/WP-7.5 migration changes, WP-8 clean rehearsal, and migration fingerprint freeze | Decision Register |
| P-21 Audit #29 WP-6.6 scope/start | WP-6.6 implementation and any migration `020` execution | Decision Register / Completeness Audit |
| P-22 operator-workflow correction | Earlier source/G1/operator/P-23 checkpoints are historical after P-23.1 amended candidate `020`; final G1R/G2/G3/P-26 path passed and P-27 accepted the closeout | Decision Register / Correction Plan #31 |
| P-23 operator-context/navigation amendment | Persistent operator/account context, information-only global nav, exact-draft import route, explicit input/export semantics, Local marker, and static/browser evidence were incorporated into exact P-23.1 source commit `31fd689`; no reset | Decision Register / Correction Plan #31 |
| P-23.1 version-intent/item-first correction | Owner approved bounded docs/application/candidate-`020` work; repository/static, final G1R/G2/G3, and owner closeout passed | ADR-003 / Decision Register / Correction Plan #31 |
| P-24 pre-G1R business/UX hardening | Owner approved the bounded annual-range, safe-error, durable-focus, contextual-authority, and Factor F hierarchy patch; base `88d0711` and closure `050c998` are lineage; final G1R/G2 passed on exact execution checkout `721c2c2` with migration SHA-256 `e07e0c4161077efba7bc4f6ebf95518d0cc1bc7e4628a43a128dd899bd1aef93` | ADR-003 / ADR-004 / Decision Register / Correction Plan #31 |
| P-26/P-27 high-impact guard and G3 closeout | P-26 is committed at exact `78e96ab3ed9993707014c4aba1d285b7592b17a1`; P-27 accepted G3/WP-6.6 on that checkpoint. G4 and later gates remain separate. | Decision Register / Owner Review Note #30 |

Rule: unresolved P-02 through P-11 does not block generic additive schema,
parser, UI shell, tests, or local rehearsal. It blocks final candidate data
freeze, approved backfill, export acceptance, and publication where applicable.
P-18 is resolved for V1 design, and amended WP-7.5 passed its P-32 Local
technical gate and P-33 acceptance. The existing DB hold continues to block
publishing any version with add/supplement/new identity rows until the later
WP-8/P-14 UX/release gates pass and the accepted placement revision is current.
Unresolved P-19 blocks official field-facing PDF filing
for any version with inactive/retired rows. P-20 reruns still block
clean-rehearsal hash acceptance, migration fingerprint freeze, and P-15 hash
acceptance.

## 4. Work package map

| WP | Name | Environment | Can start after | Blocks |
|---|---|---|---|---|
| WP-0 | Branch, dependency, and evidence setup | Local | P-01 | None |
| WP-1 | Additive database foundation `017+` | Local Supabase | WP-0 | WP-4, WP-8 |
| WP-2 | Catalog canonicalizer and parser | Local app/tests | WP-0 | WP-4, WP-6 |
| WP-3 | Catalog admin read/draft UI shell | Local app | WP-0 | WP-4 |
| WP-4 | Draft mutation, import, manual edit, history | Local app + DB | WP-1, WP-2, WP-3 | WP-5 |
| WP-5 | Publish, pointer restore, and audit | Local app + DB | WP-4 | WP-6, WP-8 |
| WP-6 | Official Excel/PDF export | Local app | WP-2, WP-5, P-11 for final visual | WP-8 |
| WP-6.5 | Reliability and publish-boundary hardening | Local app + DB/tests | WP-5, P-18 recorded, P-06 structured-code exception recorded | WP-6.6, WP-8 |
| WP-6.6 | Admin workflow completeness and authority hardening | Local app + DB/tests | WP-6.5, P-21, P-22 | WP-7, WP-7.5, WP-8 |
| WP-7 | Permanent BOQ/hotfix `016` and Factor F regression preservation | Local app + DB/tests | WP-0, WP-6.6 | WP-7.5, WP-8 |
| WP-7.5 | P-18 new-identity placement governance | Local app + DB/tests | WP-7, P-18 accepted | WP-8 full Add/Supplement release |
| WP-8 | Clean local rehearsal, admin UAT, performance, and verification report | Local reset + app | WP-1 to WP-7; WP-7.5 or hidden Add/Supplement; P-20 | Production approval |
| WP-9 | Production migration/deploy/enable/publish | Production | P-12 to P-15 | Closeout |

## 5. WP-0 branch and evidence setup

Goal: create a controlled implementation baseline.

Steps:

1. Confirm the working branch and note any unrelated dirty files.
2. Run `git status --short` and keep Phase 4 edits scoped.
3. Confirm `package-lock.json` is present and dependencies are not changed unless
   required.
4. Record current command versions:
   - `node --version`
   - `npm --version`
   - `npx next --version`
   - `supabase --version` if using CLI
5. Record current Production read-only evidence using Supabase MCP or approved
   SQL:
   - migration ledger latest includes Factor F `015` and production hotfix
     `016`;
   - `price_list` row count;
   - default catalog version;
   - Factor F default and active version row counts/hashes;
   - BOQ count, BOQ missing price version count, BOQ Factor F binding split;
   - advisor security/performance baseline.
6. Store evidence in the Verification Report, not as hard-coded assumptions in
   implementation code.

Exit gate:

- P-01 approved;
- current evidence recorded;
- no untriaged Phase 4 advisor finding exists;
- implementation branch scope is clear.

## 6. WP-1 additive database foundation `017+`

Goal: add Phase 4 catalog governance without changing existing BOQ or Factor F
semantics.

Migration expectations:

- next root migration is logical `017+` after hotfix `016`;
- additive first, destructive never;
- RLS enabled on every new public table;
- explicit `REVOKE` and exact `GRANT`;
- private privileged functions where feasible;
- `SECURITY DEFINER` only when required, with `SET search_path = ''` and fully
  qualified objects;
- request IDs for idempotent mutation/publish paths;
- bounded `lock_timeout` and `statement_timeout`;
- indexed foreign keys and common filter columns;
- no writes to Factor F tables, Factor F default pointer, or
  `boq.factor_reference_version_id`.

Database objects to implement from the architecture/DB contract:

| Area | Expected object shape |
|---|---|
| Version metadata | Extend/replace Phase 1 fields needed for status, publish evidence, hash, item count, archive refs, lock version |
| Stable item identity | UUID identity, append-only code reservations, no code reuse across identities |
| Versioned rows | rows scoped to version, immutable once published |
| Category/code dictionary | version-scoped groups and approved candidate mapping |
| Draft/import/audit | import batch metadata, bounded source fingerprints, draft diff, append-only audit |
| Pointer | singleton current pointer plus legacy `is_default` mirror until removal |
| RPC/functions | draft create/update/import/apply/publish/restore/history/export lookup |
| Feature flags | `catalog_admin_enabled`, `catalog_new_identity_enabled`, and `catalog_retirement_enabled` JSON booleans default `false`; the latter two keep P-18/P-19-affected controls hidden and RPC effects denied until their gates pass |

Minimum local DB tests:

- clean reset applies all migrations;
- new FKs have covering indexes unless intentionally documented;
- RLS enabled on all new public tables;
- anon cannot read admin tables or execute write RPCs;
- staff/non-admin cannot mutate;
- inactive/pending admin cannot mutate;
- active admin can mutate only through approved functions;
- direct table writes to published rows, audit rows, import evidence, and code
  registry fail;
- published row update/delete fails;
- pointer restore changes only catalog pointer and legacy mirror;
- `boq.price_list_version_id` and `boq.factor_reference_version_id` cannot be
  rewritten;
- Factor F default pointer and active version row hashes are unchanged before vs
  after migration.

Exit gate:

- Local reset and migration pass;
- security/performance advisors have no new or untriaged finding;
- DB/security contract checkboxes can be filled in Verification Report.

## 7. WP-2 parser and canonicalizer

Goal: make import and export reproducible.

Implementation targets:

- one approved parser profile for the known workbook;
- client-side `.xlsx` parsing, no Supabase Storage upload;
- raw workbook not persisted in DB;
- source basename/hash/archive reference stored as metadata only;
- normalized request body limit 750 KB;
- raw file limit 20 MB;
- fixed row/cell/text limits;
- K-formula fields excluded/rejected;
- canonical JSON stable sort and formatting exactly as parser/hash spec;
- dataset hash uses catalog rows only.

Tests:

- exact workbook/profile accepted;
- wrong sheet/header rejected;
- formula/error/nonnumeric required cell rejected;
- macro/external links are not executed or persisted;
- duplicate code rejected;
- unauthorized price delta rejected;
- full omission diff respects retirement threshold;
- supplement omission leaves unchanged;
- normalized payload tampering rejected server-side;
- golden canonical fixture hash equals the spec hash;
- Factor F-looking columns do not enter catalog hash/export data.

Exit gate:

- golden hash test passes;
- parser failure messages are bounded and do not leak raw workbook contents;
- import test rows match reconciliation expectations.

## 8. WP-3 catalog admin UI shell

Goal: expose review/admin tools behind a disabled feature flag.

Routes from architecture:

- `/admin/master-catalog`
- `/admin/master-catalog/versions`
- `/admin/master-catalog/versions/[versionId]`
- `/admin/master-catalog/import`
- `/admin/master-catalog/history`

Rules:

- feature hidden unless `catalog_admin_enabled` is true;
- server/DB authorization still required even when hidden;
- no landing/marketing screen;
- dense operational UI for scanning/version comparison;
- show Catalog version and Factor F version labels distinctly when both appear;
- catalog UI may state Factor F is separate but must not edit Factor F;
- errors must be actionable and not expose raw SQL/internal secrets.

Exit gate:

- active admin can see hidden feature in local test mode;
- non-admin cannot access route or backend actions;
- feature flag off leaves current app behavior unchanged.

## 9. WP-4 draft mutation, import, manual edit, and history

Goal: let admins build a candidate version through audited draft operations.

Implementation rules:

- manual edits and import use the same draft/diff/reason/audit model;
- create draft from current default only;
- stale base draft becomes read-only/nonpublishable;
- no hidden three-way rebase;
- every mutation requires reason;
- blank reason rejected;
- stale `lock_version` returns stable conflict code;
- code allocations are append-only and never reassign a code to another
  identity;
- sequence capacity at `900` blocks and requires capacity decision;
- Production prices win in the first rollout;
- workbook-only rows are not publishable without owner authority.
- `ITEM-0139` is the only approved temporary legacy-code exception for
  `2568.1.0`; publish validation must allow null `code_group_id` only for this
  row and fail if any other active structured-version row has a null code
  group.

Exit gate:

- import preview, manual add/edit/retire/recode, history, stale draft, and lock
  conflict tests pass;
- reconciliation report counts are reproduced for 710/708/648/42/20/18/16.

## 10. WP-5 publish, pointer restore, and audit

Goal: publish an immutable catalog version and support audited pointer restore.

Publish contract:

- active admin only;
- exact approval metadata required;
- stable request ID;
- stale base pointer rejected;
- one short transaction;
- compute count/hash server-side from DB;
- validate publication completeness;
- move singleton pointer;
- sync legacy `is_default` mirror;
- append publication/change-set audit;
- published rows/metadata immutable after publish;
- old BOQs unchanged.

Pointer restore contract:

- active admin only;
- target version must be published/active;
- reason and request ID required;
- moves only catalog pointer and legacy mirror;
- appends restore audit;
- does not mutate price rows, BOQs, Factor F bindings, or Factor F pointer.

Exit gate:

- publish tests pass;
- pointer restore rehearsal proves old/new BOQ bindings unchanged;
- Verification Report publication section has evidence placeholders filled.

## 11. WP-6 official Excel/PDF export

Goal: generate official reference copies from an immutable selected catalog
version.

Export rules:

- route accepts explicit selected version;
- server re-queries selected version;
- generated count/hash must match stored dataset hash;
- Excel carries complete filing/verification metadata required by the Export
  Spec. The field-facing PDF cover carries only the P-11-approved organization,
  `ฉบับบัญชีราคา`, Thai status, effective date, item count, and full dataset
  hash; non-current published versions use the approved Thai retrospective
  warning instead of a technical Current Default field;
- filename follows `NT-Master-Catalog-v{version}-{effective-date}.{ext}`;
- draft exports are admin-only and visibly marked `DRAFT – ห้ามใช้อ้างอิง`;
- Excel includes canonical reconstruction sheet/fields per export spec;
- PDF is server-verified and searchable;
- retained evidence is generated only from a clean tracked tree into a new
  non-overwriting directory, then accepted atomically after the tracked
  semantic verifier passes;
- Factor F rows/metadata and BOQ data are never included in catalog export
  dataset/hash.

Exit gate:

- Excel and PDF generated for selected published version;
- older published version export uses its own data;
- draft export cannot look official;
- visual sample accepted by P-11 before Production publication;
- final P-11 completion uses one P-20-compliant retained PDF/Excel pair with
  filed binary hashes; older untracked previews do not satisfy this gate.

## 12. WP-6.5 reliability and publish-boundary hardening

Goal: close the gap between the approved architecture and executable safety
net before adding more workflow surface or accepting WP-8 evidence.

Boundary:

- keep draft add/edit/import mechanics available for Local review;
- do not build a reorder/placement UI in this slice;
- do not renumber stable item codes or change identity history;
- do not infer extra legacy-code exceptions beyond the explicit P-06 record;
- do not expand hotfix `016` beyond regression evidence;
- do not add any new Factor F workflow.

Required sub-gates:

| Slice | Required outcome |
|---|---|
| WP-6.5A End-to-end idempotency | Client/form creates one operation UUID for create/manual/import-apply/publish/restore, preserves it through an uncertain result, reuses it on retry, and replaces it only after a definitive terminal result or explicit new operation. Submitted non-secret editable values remain visible after uncertain/rejected results and reset only after success, so retry does not require reconstructing the payload. Test timeout-after-commit and same-ID/different-payload rejection. |
| WP-6.5B Publish guards and early UX | Keep DB P-18 and structured-code guards as final invariants; show the same publication blockers in draft/import preview before apply/publish, with Thai reason and remediation. Warn separately when inactive rows require the still-pending P-19 PDF policy; do not silently turn that filing decision into a new DB publish rule. A user must not discover the blocker only after completing the draft. |
| WP-6.5C Hash portability | Resolve P-20 and update migration, DB/hash/export contracts and fixtures atomically. No clean-reset/cross-environment equivalence claim until the selected contract passes. |
| WP-6.5D Reusable version lifecycle | Remove `2568.1.0` hardcoding from reusable action/RPC validation. Require explicit annual/revision/patch intent, plan from the complete all-status reserved registry, and prove another valid version plus reserved annual, duplicate, stale-sequence, and nonmonotonic rejection. Keep `2568.1.0` only as the exact first-candidate fixture when unreserved. |
| WP-6.5E Reproducible export evidence | Commit a semantic verifier under `scripts/` or tests. Discover headers by exact names, derive ranges, and verify schema version, sheets, row count/order, canonical hash, numeric cells, formula/link absence, PDF count/hash/pages, and binary hashes. Generated files remain untracked. |
| WP-6.5F DB integration and concurrency harness | Establish a tracked Local DB suite for migrations, RPC/RLS/role denial, transaction rollback, two-session publish/restore races, lock timeout, stale state, and uncertain-response retry. WP-7 adds the permanent BOQ/hotfix/Factor F cases to this harness. |
| WP-6.5G Operator UX and observability | Add route-level loading/error/not-found states, consistent Thai user messages with stable technical code/request ID, bounded structured logs containing operation/outcome/duration/version/request ID, and no raw payload/SQL detail. |
| WP-6.5H Documentation consistency | Add a tracked check for canonical migration order, WP sequencing, pending decision IDs, and authority links. Volatile hashes/results remain only in the Tracker/Verification Report. |

Required behavior:

| Scenario | Expected |
|---|---|
| Draft cloned from base with unchanged identities | Existing publish behavior still works |
| Draft contains any `price_list.identity_id` absent from `based_on_version_id` | Publish rejects before pointer movement |
| Rejected add/supplement publish | Returns safe code `P18_PLACEMENT_REVIEW_REQUIRED` |
| Rejected add/supplement publish | No publication metadata, pointer, legacy `is_default`, BOQ, or Factor F state changes |
| Draft has at least one active canonical `AAA-TTT-NNN` row and also has active legacy `ITEM-####` rows other than the approved `ITEM-0139` exception | Publish rejects before pointer movement |
| Unchanged legacy-only clone has no active canonical structured code | Structured-code rollout guard does not activate; normal publication quality rules still apply |
| Structured-code exception check | Positive fixture with only `ITEM-0139` legacy exception passes; negative fixture with any other active legacy row fails |
| UI/server action receives guard code | Shows safe operator-facing message and keeps draft reviewable |

Implementation note: the guard must compare the target draft rows to the base
version rows by `identity_id`; do not infer the condition only from
`catalog_change_sets.change_type` because manual/import audit grouping is not
the authority for publication safety. The structured-code guard must inspect
published-candidate rows directly, activate when the draft contains at least one
active canonical structured code, and then assert the active legacy exception
set. It must not merely expose `legacyActiveRows` in quality JSON or block an
unchanged legacy-only clone.

All create/apply/publish/restore request fingerprints are checked under a
per-request advisory lock. Canonical-code allocation also uses a per-code lock.
Timeout-after-commit evidence must use tracked loopback-only fault injection
outside the application/RPC implementation: observe a successful upstream
commit, withhold that response once, then prove that the same request ID returns
the prior duplicate result. Do not add a test-only bypass, delay, or failure
branch to a Production application or database path.
After a change set starts writing, a structured rejection must raise into a
PL/pgSQL subtransaction so the whole change set, item rows, identities, and code
registrations roll back before a safe action error is returned. Private runtime
functions carry bounded lock/statement timeouts; migration-time timeouts alone
are not runtime evidence.

Exit gate:

- all WP-6.5A-H applicable evidence is green;
- migration/static checks and live Local DB tests cover both guard shape and
  behavior;
- local publish smoke proves add/supplement and structured-code rejections are
  atomic, and unchanged 710-row publish/restore still passes;
- P-20 is recorded and implemented before WP-6.5 exits/WP-7 starts and before
  any WP-8 clean-reset hash evidence;
- reusable create/publish paths pass ADR-003 version fixtures without a
  `2568.1.0` production-code constant;
- export and documentation verification run from tracked code in a clean
  checkout;
- operator failure states and logs expose safe correlation evidence;
- browser recovery proves the uncertain message, retained form values, untouched
  same-payload resubmit, one audit effect, and reset-after-success behavior;
- Verification Report records each sub-gate separately.

## 13. WP-6.6 admin workflow completeness and authority hardening

Goal: close every Audit #29 gap so an intended admin can complete each visible
workflow without developer/SQL assistance and without caller-authored authority.

Boundary:

- preserve WP-6.5 reliability evidence and existing `017`-`019` migrations;
- implement accepted DB changes only by amending the still-unaccepted candidate
  `020_master_catalog_phase4_admin_workflow_hardening.sql`;
- do not implement P-18 placement in `020`; placement remains WP-7.5/`021`;
- do not add general inherited reorder, taxonomy authoring, workflow engine,
  Factor F work, BOQ Rebase, or hotfix expansion;
- do not reset Local Supabase without separately telling the owner that the
  whole Local stack will be rebuilt and receiving explicit approval.

Required slices:

| Slice | Required outcome |
|---|---|
| A Browse/history | Use deterministic paged data reads to defeat API row caps, then read/filter all rows client-side within the measured threshold; search/filter code/name/category/status/group; exact item route; paged version/audit registers; stable-identity timeline with field-level old/new values. |
| B Draft targeting | Enforce one mutable draft per base; expose the one current-base workspace; retain stale/abandoned drafts read-only with clear recovery; no overview/import hidden draft choice. |
| C Dictionary/code authority | Freeze Production-derived versioned categories and approved P-06 22/65 code groups; ordinary mutation resolves existing IDs only; server allocator locks the approved group, uses next never-issued sequence, does not fill retired gaps, and stops at 900. |
| D Import completion | Move the approved first-rollout mapping out of runtime `docs/*draft.csv` authority; reconcile future imports against the exact draft/dictionaries. Server returns complete add/update/recode/retire/unchanged diff and exact Full omissions; UI displays it before Apply; support real bounded batch/per-row price authority. |
| E Publication provenance/readiness | Derive publisher UUID/display snapshot from authenticated profile; semantically validate ISO dates; require version-level archive reference including manual-only publication; readiness and publish consume one full stale-base/canonical-quality result. |
| F Correction/editor | Prefill exact current item; require price authority only for name/unit/money changes; add audited `reactivate` and base-absent `withdraw` preserving identity/code/audit. |
| G Schema/UX/evidence | After zero-null compatibility proof, add required null/order constraints; Thai-first copy, no synthetic Local/WP evidence, support IDs demoted; DB/role/race/browser/accessibility/authority tests pass. |
| H Working-draft lifecycle | Partial unique draft-per-base invariant; safe concurrent create conflict; audited idempotent abandon with immutable retained rows/history; replacement starts from a fresh clone. |
| I Final snapshot review | Make the full searchable item workspace primary; compare complete draft/base snapshots by stable identity; show compound old/new changes/readiness; publish only the exact reviewed lock and force rereview after mutation. |
| J Operator context/import/export semantics | Preserve signed-in admin identity and environment context; keep global navigation informational; bind import to the exact draft; distinguish approved workbook input from review-only Excel/PDF exports; keep import iterative rather than a misleading one-way wizard. |
| K Version planning and recovery UX | Require business intent and owner-designated annual year; fail closed on incomplete registry; show reserved numbers; DB enforces next sequence after idempotent replay; successful create opens the exact draft; detailed metadata follows items; restore confirms current/target and BOQ effect. |
| L High-impact human-intent confirmation | Recode/Retire show exact item/target/reason/BOQ-audit summaries. Publish shows current/target versions, reviewed lock, item count, immutability, and BOQ effect; require the exact DB-read target version and reject mismatch before the publish RPC. Prove cancel/no-write and responsive behavior. |

Required behavior:

- unknown category/group or caller-selected arbitrary code cannot create catalog
  authority;
- two concurrent allocations in one group cannot receive the same code;
- source preview and final Apply use the same exact draft/payload fingerprint;
- stale draft controls are unavailable before a user can submit;
- a second mutable draft for the same base and any destructive draft deletion
  are impossible through UI, RPC, or concurrent callers;
- an abandoned draft is read-only, nonpublishable, and retained with its audit;
- preliminary readiness cannot be greener than final publish for base/quality;
- `withdraw` cannot remove an identity inherited from the base or any published
  identity/code/audit row;
- all current rows and history are discoverable, not only a sample;
- final review reflects cumulative database state rather than only import or
  change-event summaries, and a stale reviewed lock cannot publish;
- unsupported Add/Supplement/Retire controls are hidden at release when their
  downstream P-18/P-19 gates are not accepted.
- an admin cannot submit raw version segments without intent, reuse an abandoned
  number, skip the next lane number, or silently receive a number different from
  the one reviewed; a void annual identifier does not force a false effective year.
- Recode, Retire, and Publish cannot cross their final high-impact boundary from
  the first form submit; cancellation creates no mutation, and a mismatched
  typed publish target cannot call the publish RPC.

Exit gate:

- Audit #29 C-01 through C-17 each have an implementation/evidence reference in
  the Verification Report;
- migration `020` static verification and explicitly approved G1R/G2 Local
  DB/RLS/grant/rollback/concurrency/P-20 evidence have passed; G1R also passed
  the bounded browser path and the G1R-versus-G2 comparator matched;
- browser QA and owner review prove the one-workspace item-first flow, exact
  item targeting, authoritative final diff, stale-review recovery, and Thai
  workflow;
- no visible in-scope action requires developer/SQL assistance to complete or
  recover;
- authority consistency tests cover WP order, reserved migration numbers, core
  links, and release-visibility rule;
- the retained Local DB result is generated with
  `npm run db:local:smoke-master-catalog-wp66 -- --output <path>` and records
  exact commit/environment plus `productionTouched=false`;
- owner accepts WP-6.6 closeout before WP-7 begins.

Exit recorded 2026-07-14 23:50 +07: the owner accepted G3/WP-6.6 on exact
application checkpoint `78e96ab3ed9993707014c4aba1d285b7592b17a1`.
This satisfies the WP-6.6 exit gate only; G4 must still be approved before
adding `020` to bootstrap or starting WP-7. P-28 subsequently approved the G4
repository/source part: `020` is now in bootstrap source and the WP-7 harness
is tracked. P-29 then separately approved and completed the destructive clean
bootstrap/live evidence gate on exact `15b707d`; WP-7 acceptance remains a
separate owner review.

The G2 advisor baseline is explicit: eight authenticated-callable
`SECURITY DEFINER` warnings are triaged (seven baseline RPCs and one guarded
Master Catalog readiness facade, all denied to anon), alongside 24 baseline
performance warnings and seven baseline unindexed-FK information findings.
WP-8 owns the final least-privilege/performance disposition; G2 does not convert
those findings into a Production waiver.

## 14. WP-7 permanent BOQ/hotfix `016` and Factor F regression preservation

Goal: prove Phase 4 did not disturb current BOQ behavior.

Factor F is already completed outside Master Catalog Phase 4. WP-7 is
regression-only: it proves current BOQ/Factor F behavior is preserved; it must
not introduce a new Factor F workflow, move Factor F pointers, modify Factor F
rows, reprice historical BOQs, or reopen hotfix `016` scope without approval.

Required scenarios:

| Scenario | Expected |
|---|---|
| New BOQ | binds current catalog pointer and current Factor F pointer |
| Existing BOQ edit/save | preserves `price_list_version_id` and `factor_reference_version_id` |
| BOQ item suffix save | Live RPC test preserves exact base name and every approved suffix `(Main Duct)`, `(Riser)`, `(Steel Pole)`, and `(Riser Service)` while catalog unit, material/labor/unit price, category, and version stay authoritative |
| Invalid or misleading suffix/name | Rejected or normalized only according to the explicit hotfix `016` allowlist; cannot override catalog authority |
| Bad item in a multi-item save | Whole transaction rolls back; no partial route/item replacement |
| Role/version boundary | Unauthorized caller and cross-version item are rejected without mutation |
| Duplicate preserve | copies catalog version, Factor F version, item snapshots, and Factor F snapshots |
| Copy to selected Factor F | creates new BOQ, resets Factor F snapshots, does not mutate original |
| Version-bound print/export | reads bound Factor F version rows |
| Legacy usable snapshot print/export | uses saved snapshot and does not claim current Factor F |
| Legacy missing snapshot | fail-closed with user path to copy/select Factor F |
| Catalog publish | does not reprice or rebind historical BOQs |
| Pointer restore | does not reprice or rebind historical BOQs |

Exit gate:

- BOQ create/edit/duplicate/print/export regression suite runs against the live
  Local DB and passes;
- all hotfix `016` positive/negative suffix fixtures pass through the actual RPC;
- rollback, authorization, and cross-version negative fixtures pass;
- pre/post BOQ and Factor F pointer/row/hash/grant/RLS/binding snapshots show
  zero unexpected mutations;
- the suite is tracked and wired into the appropriate PR/rehearsal CI gate, not
  retained as one-time Local evidence.

Tracked source command:

`npm run db:local:smoke-master-catalog-wp7 -- --output tmp/master-catalog/wp7-evidence/<run>.json`

The source harness must reject non-loopback Supabase URLs, require a clean
tracked tree for evidence, exercise the real Local RPCs, and restore/remove its
BOQ fixtures. Repository/static readiness does not satisfy this WP: the command
and focused BOQ print/export contracts must still run after a separately
approved clean bootstrap of the exact integration commit.

Technical exit recorded 2026-07-15 under P-29/G4E: the exact integrated
checkout `15b707d443bec701f6b3a86aa7675ca1266604ba` passed the tracked live
harness. All approved suffixes, catalog-authoritative fields, atomic
rollback/role/version negatives, BOQ binding/copy behavior, print/export data
modes, publish/restore historical preservation, and BOQ/Factor F/security
before-after invariants passed. Final Local state restored pointer `2568.0.0`,
zero drafts, all flags false, BOQ 198/1,547, and Factor F `2569.0.0`/36. The
Tracker owns the evidence hash; P-30 accepted WP-7 on 2026-07-15 01:37 +07.

## 15. WP-7.5 P-18 new-identity placement governance

Goal: complete Add/Supplement publication for new identities without enabling
arbitrary reorder of inherited rows.

Start only after P-18 accepts the five V1 choices in
[Review Note #28](./28-phase4-p18-placement-governance-review-note.md) and WP-7
passes. Implement only in append-only migration
`021_master_catalog_phase4_placement_governance.sql` plus its exact RPC/UI/audit
and tests.

P-30 satisfied both start conditions at 2026-07-15 01:37 +07 and authorized
repository/source implementation. P-32 later supplied the explicit reset/apply
approval and completed the separate Local evidence. Keep `021` outside
bootstrap until a later explicit inclusion decision.

Repository/static checkpoint passed on 2026-07-15. The working-tree candidate
implements the revision/review schema, exact bounded idempotent RPC, readiness
and publish invariants, Thai all-pending-items placement workspace, release
gating, and unit/static contracts. P-31 accepted historical Source/Static
SHA-256 `78359215...` at exact checkpoint
`4e3574a31a2697f4d727acabc8f55f34a4233bff` for commit/push. This does not
satisfy the live DB/concurrency/hash/export/browser exit evidence; the warned
Local gate still requires separate owner approval.

P-32 subsequently authorized that warned Local-only gate. The first runtime
evidence failed closed with PostgreSQL `42704` because the fixed-search-path
placement function deferred an unqualified constraint. The bounded
schema-qualified amendment is SHA-256
`e4de258756bbfbda0508e55d7b76ba2e907f644625b49bc29d4a4d7ac42fa714`;
replacement clean-chain DB/RLS/concurrency/order/hash/export/browser evidence
then passed on source `80b2574` plus UI checkpoint `99fa56c`. Final Local
cleanup restored pointer/flags/drafts/BOQ/Factor F. `021` stays outside
bootstrap. P-33 later accepted the bounded technical checkpoint; WP-8 UX/
release evidence remains required.

Exit gate:

- one/many new identities remain blocked before accepted placement;
- one audited batch assigns category and same-category before/after anchors;
- inherited identities keep relative order although shifted numeric positions
  are all audited;
- stale review, invalid order/anchor, direct write, race, replay mismatch, and
  injected failure are fail-closed/atomic;
- canonical hash, Excel order, PDF order, and verifier agree;
- if this WP is deferred, Add/Supplement remain hidden and the P-18 DB guard is
  retained/tested for WP-8/P-14.

Technical exit evidence above is green. P-33 accepted this exact bounded
technical checkpoint on 2026-07-15 13:54 +07, so WP-7.5 is complete for its
technical scope. This does not infer WP-8, `021` bootstrap inclusion, intended-
admin UX acceptance, feature enablement, or Production authorization.

## 16. WP-8 clean local rehearsal

Goal: prove the full plan works from a clean state.

Run order:

1. After the explicit P-36 warning/approval, clean local reset from the canonical
   P-35 bootstrap source, including `009`-`015`, production hotfix `016`, and
   Phase 4 `017`-`021`. P-32 separate-apply evidence and P-35 source inclusion
   remain distinct provenance; neither alone is integrated execution evidence.
   P-36 later completed this exact step on `910cc3c`.
2. Load approved baseline fixture/snapshot.
3. Record catalog count/hash and Factor F baseline.
4. Confirm Phase 4 `017+` migrations apply only after hotfix `016`.
5. Run DB/security tests.
6. Run parser/hash tests.
7. Run the complete WP-6.6 capability matrix with
   `npm run db:local:smoke-master-catalog-wp66 -- --output <path>` and the admin
   UI workflow tests.
8. Run end-to-end idempotency and two-session concurrency/timeout tests.
9. Run publish/export tests, including WP-6.5 guards, WP-6.6 readiness/provenance,
   conditional WP-7.5 placement, and the tracked semantic artifact verifier.
10. Run permanent hotfix `016`/BOQ/Factor F regression tests.
11. Run pointer restore rehearsal.
12. Run operator UAT with an intended admin/data custodian without developer or
    SQL assistance; record comprehension and recovery from at least three safe
    validation errors.
13. Measure agreed 710-row import preview, publish-readiness, export, and admin
    interaction baselines; investigate material regression.
14. Run `npm run catalog:authority:check` and verify the reviewed authority
    counts/fingerprint before any migration evidence is accepted.
15. Run `npm test`.
16. Run `npm run lint`.
17. Run `npm run build`.
18. Run `npm run audit:prod` under the accepted vulnerability policy.
19. Run security/performance advisors or MCP equivalents.
20. Run documentation/authority consistency verification.
21. Fill Verification Report with evidence references.

Placement UX hard gates for the full Add/Supplement release:

- **Truthful local state:** after an accepted server-side placement, changing a
  category, insertion gap, or same-gap sibling order must immediately replace
  any accepted-state claim with clear **ปรับในหน้านี้ · ยังไม่บันทึก** state.
  Page-level and workspace-level messages must not contradict each other.
- **Safe continuation:** pending placement choices must survive paging and the
  supported return path. Leaving or reloading with unconfirmed changes must
  warn the admin or provide an equally clear recoverable continuation; the UI
  must never imply those local choices were saved to the draft.
- **Review by exception:** the page opens on the complete new-item batch;
  system-arranged rows remain visible, locally adjusted rows are distinguishable,
  incomplete/invalid rows are counted, and the admin can filter directly to
  rows that require correction. The workflow must not require per-row approval
  or confirming 710 inherited rows one by one.
- **Impact before commit:** the final confirmation shows total new identities,
  inherited rows whose numeric position will shift, categories receiving new
  rows, incomplete/conflicting assignments, and the immediate final neighbors
  for every new row. One confirmation still applies the complete pending batch.
- **Keyboard and pointer equivalence:** category, searchable insertion-gap
  combobox, paging, sibling up/down, and confirmation are operable and visibly
  focused by keyboard using the existing standards-complete components.
  Drag may be added only as an optional desktop enhancement with the existing
  non-drag path preserved.
- **Measured scale:** record browser/device, agreed realistic new-item batch
  size, and timings or interaction observations for 710 inherited rows across
  initial render, search, insertion-gap selection, preview recalculation, paging,
  sibling movement, and confirmation. Material stutter, focus loss, layout
  shift, or an unexplained regression blocks release until fixed or explicitly
  accepted with owner/remediation metadata.
- **Independent comprehension:** an intended admin/data custodian completes the
  placement task without developer or SQL help, explains suggested versus
  unconfirmed versus accepted state, explains the shifted-row count, recovers
  from one stale-placement response, and returns to final review without an
  irreversible mistake.

These gates harden the accepted V1 architecture; they do not add arbitrary
reorder of inherited identities, taxonomy editing, a second approval role, or a
round-trip spreadsheet editor.

P-34 exact source checkpoint `0780925` implements the source/application side
of truthful local state, safe continuation, review by exception, impact before
commit, and keyboard/pointer equivalence. Those gates remain open at release
level until exercised on the exact integrated Local candidate. P-36 passed the
clean integrated database/export/advisor path and 710+18 desktop/mobile route-
render measurements. The Browser runtime did not dispatch client state changes,
so live filter/paging/relation/sibling/confirmation timing, full keyboard/
recovery behavior, and independent intended-admin comprehension remain open.

Exit gate:

- all gates pass;
- P-20 hash portability evidence passes across the approved clean-reset scope;
- admin UAT has no irreversible mistake or developer-only recovery path;
- every placement UX hard gate above has current automated/browser/UAT evidence
  or the Add/Supplement controls remain hidden/disabled at P-14;
- performance measurements are within the reviewed budget or carry an explicit
  accepted-risk owner/remediation record;
- accepted warnings have owner, technical rationale, remediation owner, and due
  date;
- Production approval P-12 can be requested after the readiness evidence below
  is reviewed.

## 16.1 Production readiness review

Goal: make sure the rollout is genuinely ready before any Production gate is
requested.

Request P-12 only after WP-8 has passed and the Verification Report contains
current evidence for:

- clean Local reset and full workflow success;
- reviewed migration filename and SHA-256;
- exact branch/commit and deployment artifact fingerprint;
- stable operation-ID timeout/retry and structured-log evidence;
- live Local DB migration/RPC/RLS/concurrency evidence;
- P-20 cross-environment hash/identity portability evidence;
- ADR-003 reusable version lifecycle evidence without hardcoded candidate logic;
- tracked semantic Excel/PDF verifier output;
- admin UAT, route failure-state, Thai error/recovery, and performance evidence;
- fresh read-only Production baseline and schema drift check;
- fresh logical backup plus restore-test evidence;
- BOQ regression preservation, including price-list version links;
- Factor F before/after assertions proving no pointer, row, hash, grant, RLS,
  or BOQ binding change;
- WP-6.5/WP-7.5 guard evidence showing add/supplement/new-identity publish is
  rejected until the current placement batch has a matching accepted review,
  and structured-code legacy exceptions are limited to the recorded
  `ITEM-0139` case;
- P-19 inactive/retired row official export policy, if the candidate contains
  any inactive/retired rows;
- structured-code completeness evidence for the exact candidate, including the
  approved temporary `ITEM-0139` exception and no other active legacy rows;
- Supabase security/performance advisor results with no unresolved blocker;
- feature flag disabled by default;
- P-11 export preview/count/hash evidence;
- authority/document consistency check;
- owner/verifier readiness review outcome.

Normal Production sequencing:

- request P-12 Production migration after the readiness package is green;
- request P-13 application deploy after migration verification is green;
- request P-14 admin feature enablement after deploy/admin-only smoke is green;
- request P-15 publication only after final candidate evidence is complete.

Publication requires exact final named-version metadata, approval reference,
effective date, physical archive reference, final diff, item count, dataset
hash, official Excel/PDF evidence, P-18/P-19/P-20 evidence when applicable,
structured-code completeness evidence, and owner approval. For the first
candidate the reserved rehearsal version is `2568.1.0`, but reusable workflow
code remains governed by ADR-003.

Do not request the next Production gate if any evidence is missing, stale,
failed, ambiguous, or different from the reviewed plan.

## 17. WP-9 Production execution

This package cannot start from this document alone. It requires P-12 through
P-15, the Production Runbook, and a completed Verification Report from WP-8.
P-12 through P-15 remain sequential owner decisions.

Production order:

1. Fresh read-only preflight.
2. Backup and restore gate.
3. Apply additive migration with feature flag disabled.
4. Immediate verification.
5. Deploy application with feature flag disabled.
6. Admin-only smoke.
7. Feature enablement.
8. Candidate preparation.
9. Owner publish approval.
10. Publish named catalog version.
11. Generate official Excel/PDF.
12. Post-publish backup and closeout.

Hard stop:

- any Factor F pointer, row count/hash, grants/RLS, or BOQ
  `factor_reference_version_id` change during a Master Catalog step;
- any unapproved Production price/name/unit change;
- any new/untriaged Supabase advisor finding from the Phase 4 change set;
- export count/hash mismatch;
- add/supplement/new-identity publish attempted before P-18 placement
  governance or guard evidence is accepted;
- inactive/retired-row official PDF filing attempted before P-19 policy is
  approved;
- backup restore not proven.

## 18. Implementation file targets

These are expected targets, not a mandate to create all files if the local
implementation finds a cleaner existing home.

| Area | Likely targets |
|---|---|
| Supabase migration | Existing `migrations/017_*`-`019_*`; planned WP-6.6 `020_*`; conditional P-18/WP-7.5 `021_*` |
| DB helpers/types | `lib/catalog/*`, `lib/supabase.ts`, generated/hand-maintained types |
| Parser/canonicalizer | `lib/catalog/parser/*`, `lib/catalog/hash/*` |
| Admin pages | `app/admin/master-catalog/**` |
| Server actions/route handlers | `app/admin/master-catalog/actions.ts`, `app/api/master-catalog/**` as needed |
| Export implementation | `lib/catalog/export*.ts`, `app/api/master-catalog/export/**` |
| Tests | `__tests__/**`, `tests/**`, or current Vitest convention in repo |
| Evidence | `docs/plans/master-catalog/13-phase4-verification-report.md` |

Do not put raw workbook files, Production backups, secrets, or `/CI/` source
assets into committed runtime paths.

## 19. Minimum implementation review checklist

Before asking for code review:

- [ ] No Factor F table/pointer/write path is modified.
- [ ] No legacy BOQ is backfilled with a guessed Factor F version.
- [ ] Phase 4 migration is additive and starts at `017+`.
- [ ] Every new public table has RLS enabled.
- [ ] New grants are explicit and least-privilege.
- [ ] Privileged functions have narrow execute grants and safe `search_path`.
- [ ] New foreign keys and hot filters are indexed or intentionally documented.
- [ ] Published data is immutable.
- [ ] Audit #29 C-01 through C-17 have exact implementation/evidence references
  or the affected capability is excluded from release visibility.
- [ ] Full catalog/item history, one current-base workspace, and
  stale/abandoned read-only targeting work.
- [ ] Draft create/abandon idempotency, lock, role, race, rollback, immutable
  history, and zero-partial-effect tests pass.
- [ ] Final database snapshot diff covers compound/reverted changes and publish
  rejects a lock changed after review.
- [ ] Ordinary mutations resolve approved versioned categories/P-06 groups and use the
  server-owned next-never-issued allocator.
- [ ] Import displays complete server diff/omissions and supports real approved
  new-row price evidence.
- [ ] Publisher snapshot is authenticated, version archive reference is stored,
  and readiness/publish share full base/quality authority.
- [ ] Reactivate/base-absent-withdraw and required null/order constraints pass.
- [ ] WP-6.5/WP-7.5 guard rejects add/supplement/new-identity publication until
  the current placement batch has a matching accepted review.
- [ ] WP-6.5 guard enforces the structured-code legacy exception set before
  publication.
- [ ] Client/form retains the same operation ID through an uncertain response
  and the DB returns the prior result for a same-payload retry.
- [ ] Reusable version actions/RPCs follow ADR-003 and do not hardcode
  `2568.1.0` outside exact fixtures.
- [ ] Draft create requires explicit business intent, complete-registry
  reserved-number planning, DB next-sequence enforcement, annual void-number
  recovery, and exact post-create navigation.
- [ ] Recode/Retire summaries and DB-read typed-version Publish confirmation
  pass mismatch/exact/cancel/no-write desktop and mobile evidence.
- [ ] P-20 hash/identity portability contract is implemented consistently in
  migration, canonicalizer, DB hash, export, and tests.
- [ ] Draft mutation and import are audited.
- [ ] Manual and import workflows share validation and audit controls.
- [ ] Canonical dataset hash excludes non-catalog data.
- [ ] Official export count/hash is rechecked server-side.
- [ ] Export verification runs from tracked semantic code; generated artifacts
  and reference/temp paths remain untracked.
- [ ] Feature flag default is disabled.
- [ ] Live Local DB/RPC/RLS/concurrency and hotfix `016` BOQ regression scenarios
  pass.
- [ ] Route failure states, Thai recovery messages, bounded structured logs,
  admin UAT, and performance evidence pass their gate.
- [ ] Authority/document consistency check passes.
- [ ] Supabase advisor baseline is recorded and no new untriaged finding exists.
- [ ] Verification Report is updated with evidence links/commands.

## 20. What to do when blocked

| Blocker | Action |
|---|---|
| Owner decision P-02 to P-07 missing | Continue generic implementation; do not freeze candidate data. Current record shows P-02 through P-07 approved; use this only if the decision register is reverted or superseded |
| P-08/P-09 missing | P-08 is currently approved in the Decision Register; if superseded or missing, continue local draft mechanics but do not validate publication-completeness. If P-09 is missing, continue local draft/publish mechanics but do not publish Production |
| P-10 missing or superseded | Current Decision Register records P-10 approved limited runtime CI assets; if superseded or missing, use placeholder-safe local styling only and do not deploy CI assets |
| P-11 missing | Build export mechanics; do not accept official export visual |
| WP-8/P-14 placement release acceptance missing | Keep draft add/supplement review capability-gated, and block publication of versions with new identities until the placement UX, performance, intended-admin, and release evidence are accepted |
| P-19 unresolved | Do not file a field-facing official PDF for versions with inactive/retired rows; publish only if owner explicitly approves the rendering/exclusion policy |
| P-20 unresolved | Continue non-hash-changing reliability work, but do not accept WP-8 clean-reset hash evidence, freeze the migration fingerprint, or request P-15 |
| Any Audit #29 C-01 through C-17 gap unresolved | Do not start WP-7 or claim full operator readiness. Implement WP-6.6 or remove the affected control from release visibility according to the audit |
| Reusable path still hardcodes `2568.1.0` | Treat as implementation nonconformance with ADR-003; fix and test another valid annual/revision/patch version before P-14 |
| Advisor warning from pre-existing system | Add to advisor baseline with owner/remediation metadata |
| New advisor warning from Phase 4 | Stop and fix or get explicit accepted-risk signoff |
| Live BOQ count differs from closeout evidence | Expected drift; record fresh count and continue only if invariants hold |
| Factor F baseline differs unexpectedly | Stop; investigate outside Phase 4 implementation |
| Workbook data conflicts with Production price | Preserve Production price unless separate price authority exists |
| Candidate code conflict unresolved | Keep as candidate/rejected; do not publish |

## 21. Final start decision

Recommended next action:

1. Owner reviews the Phase 4 authority documents in the Review Guide order.
2. Owner approves P-01 for implementation/local rehearsal only.
3. Preserve completed evidence, implement/accept WP-6.6, then WP-7; implement
   WP-7.5 only after P-18 or keep Add/Supplement hidden.
4. Complete WP-8.
5. After WP-8 passes, pause for readiness review, then request Production
   approvals sequentially.

Do not wait for all Production data decisions before starting generic local
implementation. Do wait for the relevant owner decision before freezing,
publishing, or treating candidate data as authority.
