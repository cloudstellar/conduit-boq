# Phase 4 Implementation Execution Pack

**Status:** Ready for owner P-01 review

**Prepared:** 2026-06-29

**Purpose:** Turn the reviewed Phase 4 architecture into an execution checklist
that an implementer can follow without re-deciding scope, sequencing, database
boundaries, or verification gates.

This document does not replace the architecture, CR, runbook, DB contract, or
verification report. It is the operational bridge from approved plan to local
implementation.

## 1. Readiness verdict

Phase 4 is detailed enough to start **implementation and local rehearsal** after
P-01 owner approval.

It is **not** detailed enough to authorize Production migration, feature
enablement, or catalog publication. Those remain separate gates in the Change
Request, Runbook, and Verification Report.

Start allowed:

- local branch/worktree work;
- additive `016+` migration design;
- local Supabase reset/rehearsal;
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
5. The 18 workbook-only rows are deferred unless separate item and price
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

## 3. Required owner decisions before each work band

| Decision | Required before | Source |
|---|---|---|
| P-01 implementation/local rehearsal approval | Any Phase 4A implementation | Decision Register |
| P-02 duplicate treatment for `ITEM-0131` / `ITEM-0139` | Candidate freeze, not generic schema | Decision Register |
| P-03 HDPE Crossing code correction/rejection | Candidate code freeze | Decision Register |
| P-04 canonical codes for 20 Production-only rows | Candidate 710-row freeze | Decision Register |
| P-05 disposition of 18 workbook-only rows | Candidate freeze/publication | Decision Register |
| P-06 AAA/TTT group meanings | Code-group backfill/publication | Decision Register |
| P-07 `FTW-CON-002` wording correction | If included in candidate scope | Decision Register |
| P-08 legacy `2568.0.0` publication metadata | Publication-completeness constraint | Decision Register |
| P-09 exact candidate version/effective/archive refs | Candidate draft/publish rehearsal | Decision Register |
| P-10 runtime CI assets | CI implementation/deploy | Decision Register |
| P-11 official export visual sample | Export acceptance | Decision Register |
| P-12 to P-15 | Production migration/deploy/enable/publish | Decision Register |

Rule: unresolved P-02 through P-11 does not block generic additive schema,
parser, UI shell, tests, or local rehearsal. It blocks final candidate data
freeze, approved backfill, export acceptance, and publication where applicable.

## 4. Work package map

| WP | Name | Environment | Can start after | Blocks |
|---|---|---|---|---|
| WP-0 | Branch, dependency, and evidence setup | Local | P-01 | None |
| WP-1 | Additive database foundation `016+` | Local Supabase | WP-0 | WP-4, WP-8 |
| WP-2 | Catalog canonicalizer and parser | Local app/tests | WP-0 | WP-4, WP-6 |
| WP-3 | Catalog admin read/draft UI shell | Local app | WP-0 | WP-4 |
| WP-4 | Draft mutation, import, manual edit, history | Local app + DB | WP-1, WP-2, WP-3 | WP-5 |
| WP-5 | Publish, pointer restore, and audit | Local app + DB | WP-4 | WP-6, WP-8 |
| WP-6 | Official Excel/PDF export | Local app | WP-2, WP-5, P-11 for final visual | WP-8 |
| WP-7 | BOQ regression preservation | Local app/tests | WP-0 | WP-8 |
| WP-8 | Clean local rehearsal and verification report | Local reset | WP-1 to WP-7 | Production approval |
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
   - migration ledger latest includes Factor F `015`;
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

## 6. WP-1 additive database foundation `016+`

Goal: add Phase 4 catalog governance without changing existing BOQ or Factor F
semantics.

Migration expectations:

- next root migration is logical `016+`;
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
- official stamp includes Catalog version, status, current-default status,
  effective date, approval refs, published timestamp/by, export timestamp/by,
  item count, and SHA-256;
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

## 12. WP-7 BOQ regression preservation

Goal: prove Phase 4 did not disturb current BOQ behavior.

Required scenarios:

| Scenario | Expected |
|---|---|
| New BOQ | binds current catalog pointer and current Factor F pointer |
| Existing BOQ edit/save | preserves `price_list_version_id` and `factor_reference_version_id` |
| Duplicate preserve | copies catalog version, Factor F version, item snapshots, and Factor F snapshots |
| Copy to selected Factor F | creates new BOQ, resets Factor F snapshots, does not mutate original |
| Version-bound print/export | reads bound Factor F version rows |
| Legacy usable snapshot print/export | uses saved snapshot and does not claim current Factor F |
| Legacy missing snapshot | fail-closed with user path to copy/select Factor F |
| Catalog publish | does not reprice or rebind historical BOQs |
| Pointer restore | does not reprice or rebind historical BOQs |

Exit gate:

- BOQ create/edit/duplicate/print/export regression suite passes;
- pre/post BOQ binding query shows zero unexpected mutations.

## 13. WP-8 clean local rehearsal

Goal: prove the full plan works from a clean state.

Run order:

1. Clean local reset from migrations.
2. Load approved baseline fixture/snapshot.
3. Record catalog count/hash and Factor F baseline.
4. Apply Phase 4 `016+` migrations.
5. Run DB/security tests.
6. Run parser/hash tests.
7. Run admin UI workflow tests.
8. Run publish/export tests.
9. Run BOQ regression tests.
10. Run pointer restore rehearsal.
11. Run `npm test`.
12. Run `npm run lint`.
13. Run `npm run build`.
14. Run security/performance advisors or MCP equivalents.
15. Fill Verification Report with evidence references.

Exit gate:

- all gates pass;
- accepted warnings have owner, technical rationale, remediation owner, and due
  date;
- Production approval P-12 can be requested.

## 14. WP-9 Production execution

This package cannot start from this document alone. It requires P-12 through
P-15, the Production Runbook, and a completed Verification Report from WP-8.

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
- backup restore not proven.

## 15. Implementation file targets

These are expected targets, not a mandate to create all files if the local
implementation finds a cleaner existing home.

| Area | Likely targets |
|---|---|
| Supabase migration | `migrations/016_*.sql` or timestamped Supabase migration matching logical `016+` |
| DB helpers/types | `lib/catalog/*`, `lib/supabase.ts`, generated/hand-maintained types |
| Parser/canonicalizer | `lib/catalog/parser/*`, `lib/catalog/hash/*` |
| Admin pages | `app/admin/master-catalog/**` |
| Server actions/route handlers | `app/admin/master-catalog/actions.ts`, `app/api/master-catalog/**` as needed |
| Export implementation | `lib/catalog/export*.ts`, `app/api/master-catalog/export/**` |
| Tests | `__tests__/**`, `tests/**`, or current Vitest convention in repo |
| Evidence | `docs/plans/master-catalog/13-phase4-verification-report.md` |

Do not put raw workbook files, Production backups, secrets, or `/CI/` source
assets into committed runtime paths.

## 16. Minimum implementation review checklist

Before asking for code review:

- [ ] No Factor F table/pointer/write path is modified.
- [ ] No legacy BOQ is backfilled with a guessed Factor F version.
- [ ] Phase 4 migration is additive and starts at `016+`.
- [ ] Every new public table has RLS enabled.
- [ ] New grants are explicit and least-privilege.
- [ ] Privileged functions have narrow execute grants and safe `search_path`.
- [ ] New foreign keys and hot filters are indexed or intentionally documented.
- [ ] Published data is immutable.
- [ ] Draft mutation and import are audited.
- [ ] Manual and import workflows share validation and audit controls.
- [ ] Canonical dataset hash excludes non-catalog data.
- [ ] Official export count/hash is rechecked server-side.
- [ ] Feature flag default is disabled.
- [ ] BOQ regression scenarios pass.
- [ ] Supabase advisor baseline is recorded and no new untriaged finding exists.
- [ ] Verification Report is updated with evidence links/commands.

## 17. What to do when blocked

| Blocker | Action |
|---|---|
| Owner decision P-02 to P-07 missing | Continue generic implementation; do not freeze candidate data |
| P-08/P-09 missing | Continue local draft/publish mechanics; do not publish Production |
| P-10 missing | Use placeholder-safe local styling only; do not deploy CI assets |
| P-11 missing | Build export mechanics; do not accept official export visual |
| Advisor warning from pre-existing system | Add to advisor baseline with owner/remediation metadata |
| New advisor warning from Phase 4 | Stop and fix or get explicit accepted-risk signoff |
| Live BOQ count differs from closeout evidence | Expected drift; record fresh count and continue only if invariants hold |
| Factor F baseline differs unexpectedly | Stop; investigate outside Phase 4 implementation |
| Workbook data conflicts with Production price | Preserve Production price unless separate price authority exists |
| Candidate code conflict unresolved | Keep as candidate/rejected; do not publish |

## 18. Final start decision

Recommended next action:

1. Owner reviews the Phase 4 authority documents in the Review Guide order.
2. Owner approves P-01 for implementation/local rehearsal only.
3. Implement WP-0 through WP-8.
4. Request separate Production approvals only after WP-8 passes.

Do not wait for all Production data decisions before starting generic local
implementation. Do wait for the relevant owner decision before freezing,
publishing, or treating candidate data as authority.
