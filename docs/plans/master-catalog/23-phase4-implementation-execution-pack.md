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
| P-18 add/supplement placement governance | Add/supplement publish readiness | Decision Register |
| P-19 inactive/retired export policy | Publication/filing of any version with inactive rows | Decision Register |
| P-20 canonical hash/identity portability | WP-6.5 exit/WP-7, WP-8 clean rehearsal, and migration fingerprint freeze | Decision Register |

Rule: unresolved P-02 through P-11 does not block generic additive schema,
parser, UI shell, tests, or local rehearsal. It blocks final candidate data
freeze, approved backfill, export acceptance, and publication where applicable.
Unresolved P-18 blocks publishing any version with add/supplement/new identity
rows. Unresolved P-19 blocks official field-facing PDF filing for any version
with inactive/retired rows. Unresolved P-20 blocks clean-rehearsal hash
acceptance, migration fingerprint freeze, and P-15 hash acceptance.

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
| WP-6.5 | Reliability and publish-boundary hardening | Local app + DB/tests | WP-5, P-18 recorded, P-06 structured-code exception recorded | WP-7, WP-8 |
| WP-7 | Permanent BOQ/hotfix `016` and Factor F regression preservation | Local app + DB/tests | WP-0, WP-6.5 | WP-8 |
| WP-8 | Clean local rehearsal, admin UAT, performance, and verification report | Local reset + app | WP-1 to WP-7, including WP-6.5 and P-20 | Production approval |
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
| Feature flag | `catalog_admin_enabled` JSON boolean default `false` |

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
- Factor F rows/metadata and BOQ data are never included in catalog export
  dataset/hash.

Exit gate:

- Excel and PDF generated for selected published version;
- older published version export uses its own data;
- draft export cannot look official;
- visual sample accepted by P-11 before Production publication.

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
| WP-6.5A End-to-end idempotency | Client/form creates one operation UUID for create/manual/import-apply/publish/restore, preserves it through an uncertain result, reuses it on retry, and replaces it only after a definitive terminal result or explicit new operation. Test timeout-after-commit and same-ID/different-payload rejection. |
| WP-6.5B Publish guards and early UX | Keep DB P-18 and structured-code guards as final invariants; show the same publication blockers in draft/import preview before apply/publish, with Thai reason and remediation. A user must not discover the blocker only after completing the draft. |
| WP-6.5C Hash portability | Resolve P-20 and update migration, DB/hash/export contracts and fixtures atomically. No clean-reset/cross-environment equivalence claim until the selected contract passes. |
| WP-6.5D Reusable version lifecycle | Remove `2568.1.0` hardcoding from reusable action/RPC validation. Validate ADR-003 annual/revision/patch rules and prove at least one additional valid version plus duplicate/nonmonotonic rejection. Keep `2568.1.0` only as the exact first-candidate fixture. |
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
| Structured-code candidate has active legacy `ITEM-####` rows other than the approved `ITEM-0139` exception | Publish rejects before pointer movement |
| Structured-code exception check | Positive fixture with only `ITEM-0139` legacy exception passes; negative fixture with any other active legacy row fails |
| UI/server action receives guard code | Shows safe operator-facing message and keeps draft reviewable |

Implementation note: the guard must compare the target draft rows to the base
version rows by `identity_id`; do not infer the condition only from
`catalog_change_sets.change_type` because manual/import audit grouping is not
the authority for publication safety. The structured-code guard must inspect
published-candidate rows directly and assert the active legacy exception set,
not merely expose `legacyActiveRows` in quality JSON.

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
- Verification Report records each sub-gate separately.

## 13. WP-7 permanent BOQ/hotfix `016` and Factor F regression preservation

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

## 14. WP-8 clean local rehearsal

Goal: prove the full plan works from a clean state.

Run order:

1. Clean local reset from the canonical bootstrap chain, including `009`-`015`,
   production hotfix `016`, and Phase 4 `017+`.
2. Load approved baseline fixture/snapshot.
3. Record catalog count/hash and Factor F baseline.
4. Confirm Phase 4 `017+` migrations apply only after hotfix `016`.
5. Run DB/security tests.
6. Run parser/hash tests.
7. Run admin UI workflow tests.
8. Run end-to-end idempotency and two-session concurrency/timeout tests.
9. Run publish/export tests, including WP-6.5 guards and the tracked semantic
   artifact verifier.
10. Run permanent hotfix `016`/BOQ/Factor F regression tests.
11. Run pointer restore rehearsal.
12. Run operator UAT with an intended admin/data custodian without developer or
    SQL assistance; record comprehension and recovery from at least three safe
    validation errors.
13. Measure agreed 710-row import preview, publish-readiness, export, and admin
    interaction baselines; investigate material regression.
14. Run `npm test`.
15. Run `npm run lint`.
16. Run `npm run build`.
17. Run `npm run audit:prod` under the accepted vulnerability policy.
18. Run security/performance advisors or MCP equivalents.
19. Run documentation/authority consistency verification.
20. Fill Verification Report with evidence references.

Exit gate:

- all gates pass;
- P-20 hash portability evidence passes across the approved clean-reset scope;
- admin UAT has no irreversible mistake or developer-only recovery path;
- performance measurements are within the reviewed budget or carry an explicit
  accepted-risk owner/remediation record;
- accepted warnings have owner, technical rationale, remediation owner, and due
  date;
- Production approval P-12 can be requested after the readiness evidence below
  is reviewed.

## 14.1 Production readiness review

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
- WP-6.5 guard evidence showing add/supplement/new-identity publish is rejected
  until placement governance is approved and structured-code legacy exceptions
  are limited to the recorded `ITEM-0139` case;
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

## 15. WP-9 Production execution

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

## 16. Implementation file targets

These are expected targets, not a mandate to create all files if the local
implementation finds a cleaner existing home.

| Area | Likely targets |
|---|---|
| Supabase migration | `migrations/017_*.sql` or timestamped Supabase migration matching logical `017+` |
| DB helpers/types | `lib/catalog/*`, `lib/supabase.ts`, generated/hand-maintained types |
| Parser/canonicalizer | `lib/catalog/parser/*`, `lib/catalog/hash/*` |
| Admin pages | `app/admin/master-catalog/**` |
| Server actions/route handlers | `app/admin/master-catalog/actions.ts`, `app/api/master-catalog/**` as needed |
| Export implementation | `lib/catalog/export*.ts`, `app/api/master-catalog/export/**` |
| Tests | `__tests__/**`, `tests/**`, or current Vitest convention in repo |
| Evidence | `docs/plans/master-catalog/13-phase4-verification-report.md` |

Do not put raw workbook files, Production backups, secrets, or `/CI/` source
assets into committed runtime paths.

## 17. Minimum implementation review checklist

Before asking for code review:

- [ ] No Factor F table/pointer/write path is modified.
- [ ] No legacy BOQ is backfilled with a guessed Factor F version.
- [ ] Phase 4 migration is additive and starts at `017+`.
- [ ] Every new public table has RLS enabled.
- [ ] New grants are explicit and least-privilege.
- [ ] Privileged functions have narrow execute grants and safe `search_path`.
- [ ] New foreign keys and hot filters are indexed or intentionally documented.
- [ ] Published data is immutable.
- [ ] WP-6.5 guard rejects add/supplement/new-identity publication until
  placement governance is approved.
- [ ] WP-6.5 guard enforces the structured-code legacy exception set before
  publication.
- [ ] Client/form retains the same operation ID through an uncertain response
  and the DB returns the prior result for a same-payload retry.
- [ ] Reusable version actions/RPCs follow ADR-003 and do not hardcode
  `2568.1.0` outside exact fixtures.
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

## 18. What to do when blocked

| Blocker | Action |
|---|---|
| Owner decision P-02 to P-07 missing | Continue generic implementation; do not freeze candidate data. Current record shows P-02 through P-07 approved; use this only if the decision register is reverted or superseded |
| P-08/P-09 missing | P-08 is currently approved in the Decision Register; if superseded or missing, continue local draft mechanics but do not validate publication-completeness. If P-09 is missing, continue local draft/publish mechanics but do not publish Production |
| P-10 missing or superseded | Current Decision Register records P-10 approved limited runtime CI assets; if superseded or missing, use placeholder-safe local styling only and do not deploy CI assets |
| P-11 missing | Build export mechanics; do not accept official export visual |
| P-18 unresolved | Keep draft add/supplement review available, but block publication of versions with new identities until guard evidence and placement governance are accepted |
| P-19 unresolved | Do not file a field-facing official PDF for versions with inactive/retired rows; publish only if owner explicitly approves the rendering/exclusion policy |
| P-20 unresolved | Continue non-hash-changing reliability work, but do not accept WP-8 clean-reset hash evidence, freeze the migration fingerprint, or request P-15 |
| Reusable path still hardcodes `2568.1.0` | Treat as implementation nonconformance with ADR-003; fix and test another valid annual/revision/patch version before P-14 |
| Advisor warning from pre-existing system | Add to advisor baseline with owner/remediation metadata |
| New advisor warning from Phase 4 | Stop and fix or get explicit accepted-risk signoff |
| Live BOQ count differs from closeout evidence | Expected drift; record fresh count and continue only if invariants hold |
| Factor F baseline differs unexpectedly | Stop; investigate outside Phase 4 implementation |
| Workbook data conflicts with Production price | Preserve Production price unless separate price authority exists |
| Candidate code conflict unresolved | Keep as candidate/rejected; do not publish |

## 19. Final start decision

Recommended next action:

1. Owner reviews the Phase 4 authority documents in the Review Guide order.
2. Owner approves P-01 for implementation/local rehearsal only.
3. Implement WP-0 through WP-8.
4. After WP-8 passes, pause for readiness review, then request Production
   approvals sequentially.

Do not wait for all Production data decisions before starting generic local
implementation. Do wait for the relevant owner decision before freezing,
publishing, or treating candidate data as authority.
