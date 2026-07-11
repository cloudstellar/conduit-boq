# Master Catalog Phase 4 WP-6 Owner Review Note

**Status:** Visual/content direction accepted; final retained binary pair pending
**Prepared:** 2026-07-06 16:47 +07
**Updated:** 2026-07-11 13:09 +07 for the WP-6.5 implementation checkpoint; live Local evidence remains pending
**Branch:** `codex/master-catalog-phase4`
**Reviewed baseline commit:** Original WP-6 artifact review used `72f2c05 merge: integrate hotfix 016 into phase4`; use git HEAD for the latest committed checkpoint
**Environment:** Local only
**Production touched:** No

## 1. Reviewer Verdict

WP-6 official export evidence is ready for owner review for the 710-row
baseline `2568.0.0` Local DB-generated Excel/PDF artifacts. I found no
blocking WP-6 export defect in the evidence reviewed after the latest
pagination/table proof and automated coverage cleanup.

The 2026-07-10 owner metadata refinement supersedes the previous PDF cover for
final P-11 review. The field-facing cover now keeps only organization, version,
Thai status, effective date, item count, and full dataset hash; it excludes
Current Default, approval reference/date, approved-by/publisher, exported
at/by, generated-by, and export-spec fields. These removed fields remain in
Excel metadata and release/filing evidence. A non-current published version
shows a Thai retrospective-reference warning instead of a technical field.

Further owner layout refinement on 2026-07-10 gives the cover a clearer
document hierarchy: a larger top-centered NT company lockup, then the document
title and a distinct `ประจำปี 2568` line of the same title size and weight,
with one centered upper-middle table containing `ฉบับบัญชีราคา`, Thai status,
effective date, item count, and full dataset hash. The header does not repeat
version/status, and the table does not repeat the company name already present
in the lockup.

Fresh Local route/PDF proof passed after this terminology/title refinement.
Both title lines remain legible; the PDF has `19` pages and `18` price
sections; all 710 rows, sequence/hash, and watermark evidence remain intact.
The companion Local workbook has five visible sheets, 710 price rows, 710
verification rows, reconstructed dataset-hash match, and Thai user-facing
labels while canonical verification identifiers remain unchanged. The owner
accepted this visual/content direction on 2026-07-11. Final acceptance of an
exact retained PDF/Excel binary pair remains pending after P-20 and the tracked
semantic verifier.

This is not a Production approval, not a Production deployment approval, not a
catalog publication approval, and not approval to publish any add/supplement
version. P-18 display-order placement governance remains open. The plan now
inserts WP-6.5 reliability hardening before WP-7. It includes the two DB publish
guards plus end-to-end retry IDs, P-20 hash portability, reusable ADR-003
versioning, live DB/concurrency evidence, tracked export verification, operator
failure states/logging, and documentation consistency.

The tracked WP-6.5 implementation now includes deterministic baseline identity,
actor+payload request fingerprints, stable client operation IDs, shared DB
readiness/guards, generic ADR-003 version transitions, atomic mutation abort,
runtime timeouts, semantic artifact generation/verification, route failure
states, bounded logs, and a Local DB/concurrency/P-20 harness. This note does not
claim those live DB gates passed: the amended migrations have not been applied by
a new owner-approved Local reset, and the final retained P-11 pair has not been
generated from the resulting clean committed state.

Recorded owner decision:

| Decision | Outcome | Boundary |
|---|---|---|
| Accept WP-6 baseline export implementation evidence | Accepted for visual/content direction | Local-only `2568.0.0` baseline export implementation |
| Accept the current Excel/PDF visual/content direction | Accepted | Exact retained final binaries remain a separate gate |
| Mark WP-6 complete now | Held | Requires P-20-compliant retained pair, tracked verification, filed hashes, and short final visual confirmation |
| Start WP-6.5 reliability and publish-boundary hardening | Authorized for Local only while WP-6 final binary remains pending | Follow Execution Pack sub-gates; no unannounced reset, Production write, placement UI, Factor F change, or hotfix scope expansion |
| Implement P-20 deterministic identity | Approved: baseline identity equals immutable Production-derived `price_list.id`; keep `identity_id` in the lineage hash | Cross-rebuild evidence remains required before WP-6.5 exit/WP-7 |
| Start WP-7 BOQ and Factor F regression preservation | Only after all applicable WP-6.5 evidence, including P-20, is green | Regression-only; no new Factor F workflow |
| Keep P-18 open and hold add/supplement publication | Required | No add/supplement publish path until guard evidence and placement governance are approved |

## 2. Authority Basis Checked

| Authority | WP-6 implication |
|---|---|
| Migration ledger | Phase 4 stays local-only at `017`-`019`; hotfix `016` is already merged before Phase 4 scripts |
| Implementation Execution Pack | WP-6 must generate selected-version official Excel/PDF and stop before Production gates |
| Decision Register | P-11 visual/content direction is accepted while final retained binaries remain pending; P-18/P-19 are workflow gates; P-20 deterministic `price_list.id` mapping is approved and must be proven before WP-6.5 exit/WP-7; P-06 allows only the `ITEM-0139` temporary legacy exception |
| Official Export Spec | Server-selected version, fail-closed count/hash, exact five-sheet Excel, server-verified PDF stamp, draft marking, and Factor F exclusion are required |
| Verification Report | WP-6 evidence must distinguish dataset hash from binary file hash and keep final owner/file acceptance separate |
| Admin Operating Procedure | Official exports must be generated from the published selected version, then binary hashes filed separately |
| Production Runbook | Official export filing happens only after approved Production publish, not during this Local review |
| Post-Factor-F Plan | Master Catalog export must not include or mutate Factor F rows, metadata, BOQ snapshots, or BOQ totals |

## 3. Evidence Reviewed

### 3.1 Git and scope

| Check | Evidence | Result |
|---|---|---|
| Branch | `codex/master-catalog-phase4` | Passed |
| Baseline commit | `72f2c05` | Passed |
| Production write boundary | No Production DB access/write was performed in this review package | Passed |
| Local DB reset boundary | `npm run db:local:bootstrap` was not run in this review package | Passed |
| Untracked reference/temp paths | `files/`, `tmp/`, and `output/` artifacts remain untracked and were not staged | Expected |

### 3.2 Real Local artifact proof

| Artifact | Evidence |
|---|---|
| Excel file | Unfiled Local review artifact regenerated 2026-07-11 for the final title/terminology alignment |
| Excel binary SHA-256 | `e58dc3d9b1472665dbfaf692a238e504321f75f0f86b66a277a69dcbb0ea7df3` |
| PDF file | Unfiled Local review artifact regenerated 2026-07-11 for the final title/terminology alignment |
| PDF binary SHA-256 | `05b7d71b9076daa9374405a8104fec2fb2503d04f0a7db0ba31fb6f87f83553c` |
| Dataset hash | `sha256:4a2a5fcc75f1510c5e037426a19c3110234856485157e5de6f3bd2eee459d1e8` |

The latest artifact proof records 710 Excel price rows, 710 verification rows,
exact five visible sheets, reconstructed dataset hash match, no formulas or
hyperlinks, numeric money formats, and `priceSequenceBreakCount=0`.

The latest PDF proof records 19 pages, generated price sections matching the
physical PDF page count, no low-content overflow pages, DOM row count 710,
first/last sequence 1/710, unique sequence count 710, `sequenceBreakCount=0`,
full hash present, price-disclaimer watermark present, row 527 on one line,
right table border restored, and embedded/subset `/NTRegular`, `/NTBold`, and
`/Menlo-Regular`.

These Local-review artifacts are not filed final P-11 evidence. After owner
visual acceptance, regenerate and file the chosen final pair and record their
binary hashes in the release/filing manifest.

### 3.3 Automated export coverage

| Capability | Evidence | Result |
|---|---|---|
| Selected-version count/hash | Data loader recomputes canonical count/hash and fails closed on mismatch | Passed |
| Paged reads | 1,001-row fixture proves no silent fixed-limit truncation before count/hash verification | Passed |
| Older selected version | Test proves an older selected published version exports by explicit ID without following the current pointer | Passed |
| Draft export gate | Draft export stays active-admin and feature-flag gated | Passed |
| Draft export marking | Data and Excel tests prove `DRAFT-` filename and `DRAFT – ห้ามใช้อ้างอิง` workbook markings | Passed |
| Exact Excel structure | Five sheets, headers, visible verification sheet, numeric money cells, no formulas/hyperlinks | Passed |
| Canonical reconstruction | `_canonical_row_json` reconstructs the canonical JSON and stored dataset hash | Passed |
| Formula-control text | Formula-looking strings remain inert text | Passed |
| Short dataset hash | Admin helper renders dataset hash identifiers as `sha256:` plus first 12 hex characters and `…`; full hashes remain in detail/export stamps | Passed |
| Factor F/BOQ exclusion | Export loader normal path calls no BOQ or Factor F tables | Passed |

### 3.4 CI/runtime asset evidence

| Check | Evidence | Result |
|---|---|---|
| NT fonts in artifacts | PDF resource inspection shows `/NTRegular` and `/NTBold` embedded/subset | Passed for WP-6 artifact proof |
| NT company lockup | PDF rendered pages show the approved company lockup derivative | Passed for WP-6 artifact proof |
| App-wide CI cleanup | Primary mark and legacy `public/nt_logo.*` provenance remain separate P-10 follow-up | Open, not blocking baseline WP-6 artifact review |

## 4. Checks Run

| Check | Result |
|---|---|
| `npm test -- tests/master-catalog-pdf-presentation.test.ts tests/master-catalog-export-data.test.ts tests/master-catalog-export-excel.test.ts` | Passed, 3 files / 14 tests after the final cover hierarchy refinement |
| `npm test` | Passed, 19 files / 100 tests |
| `npx tsc --noEmit --pretty false` | Passed in the immediately preceding WP-6 evidence set; the 2026-07-10 `npm run build` TypeScript phase also passed |
| `npm run lint` | Passed with 0 errors / 10 existing warnings |
| `git diff --check` | Passed |
| `npm run build` | 2026-07-11 escalated build passed |

## 5. Findings

### Blocking findings for WP-6 owner review

None found for the local-only 710-row baseline export artifact evidence.

### Residual risks and next-gate items

| Item | Severity | Blocks WP-6 baseline review? | Required before |
|---|---|---:|---|
| Final P-11 artifact acceptance remains owner-held | High | Yes, for marking WP-6 complete | WP-6 complete/P-11 acceptance |
| P-18 display-order placement governance remains open | High for add/supplement versions | No for baseline `2568.0.0` export | Any add/supplement publication readiness |
| WP-6.5 code/static slices implemented but live DB/rebuild/UAT evidence not run | High for mutation/publication reliability | No for baseline `2568.0.0` visual direction | Before WP-7, including P-20 |
| P-19 inactive/retired PDF policy pending | Medium for future retired-row versions | No for current all-active baseline proof | Any official PDF filing for a version with inactive/retired rows |
| Optional stronger Excel attachment-download proof remains open | Medium | No if owner accepts unit/build/manual artifact proof | Only if owner requires browser-download automation |
| P-20 implementation exists; two clean-rebuild outputs remain open | High for cross-environment proof | No for this artifact review | WP-6.5 exit/WP-7, WP-8/migration fingerprint/P-15 |
| Tracked semantic verifier/generator exists; final retained pair has not run from the clean committed P-20 state | Medium | No for visual direction | Final reproducible P-11/WP-8 evidence |
| BOQ and Factor F regression preservation not started | High for Production readiness | No for WP-6 export review | WP-7/WP-8 |
| Advisor baseline and approved fresh Production snapshot source remain open | Medium | No for WP-6 export review | WP-8/P-12 |
| App-wide/legacy NT logo provenance remains partially open under P-10 | Medium | No for WP-6 artifact proof | P-10/Production deploy readiness |

## 6. Recorded Decisions And Remaining Review

The staged decisions are recorded above. The remaining owner review is limited
to the exact retained pair and later affected-workflow decisions:

| # | Question | Recommended answer |
|---|---|---|
| 1 | Is the visual/content direction accepted? | Recorded yes on 2026-07-11 |
| 2 | May WP-6.5 proceed Local-only before the final pair? | Recorded yes on 2026-07-11 |
| 3 | May WP-7 start before WP-6.5/P-20 evidence is green? | No |
| 4 | Is WP-6 complete now? | No; review the exact retained P-20-compliant pair, manifest, verifier result, and filed binary hashes |
| 5 | Is P-18 placement approved? | No; keep add/supplement publication blocked |
| 6 | Is P-19 retired-row PDF treatment approved? | No; do not file an affected PDF as final |

Recommended final-pair response when that evidence exists:

```text
Accept the exact retained Local `2568.0.0` PDF/Excel pair, its manifest, semantic verification result, and filed binary hashes as final P-11/WP-6 artifact evidence. This does not approve Production migration, deploy, feature enablement, catalog publication, P-18 placement, P-19 retired-row PDF treatment, or any Factor F change.
```

## 7. WP-6.5 To WP-7 Gate

WP-6.5 is already authorized for Local implementation. Use
[Execution Pack WP-6.5](./23-phase4-implementation-execution-pack.md#12-wp-65-reliability-and-publish-boundary-hardening)
as the single implementation sequence and the
[Tracker](./25-phase4-execution-progress-tracker.md) as the current-status
source. Do not maintain a second detailed checklist in this artifact-review
note. Start WP-7 only after every applicable WP-6.5 exit gate is green, and run
no Local bootstrap unless the owner explicitly approves the reset.

WP-7 must remain regression-only. It must not add a new Factor F workflow,
change Factor F rows/pointers, backfill old BOQs, reprice historical BOQs, or
reopen the production hotfix scope without approval.

## 8. Handoff

```text
Current WP: WP-6.5 reliability and publish-boundary hardening
Status: Code/static implementation checkpoint in progress; live Local harness, two-run P-20 proof, and exact retained P-11 pair pending before WP-7
Branch: codex/master-catalog-phase4
Latest commit: See git HEAD for the latest committed checkpoint
Files changed in this checkpoint: WP-6.5 DB/action/UI reliability, tracked evidence tools/tests, and aligned authority documents; generated/reference artifacts remain untracked
Evidence produced: static/unit implementation evidence only; no new clean-reset/live DB or final retained binary evidence is claimed
Tests/checks run: See the latest Tracker/Verification Report entry
Blockers: owner-approved Local reset/live harness; two-run P-20 proof; final retained P-11 pair; P-18 placement; P-19 retired-row PDF policy; WP-7 BOQ/Factor F regressions; advisor/snapshot/UAT/performance gates
Owner decisions needed: later approve the destructive Local reset; review final retained pair; P-18/P-19 when affected; Production P-12-P-15 remain separate
Next safe step: finish repository verification and commit; then ask before Local bootstrap, execute WP-6.5 live evidence, and generate the exact retained pair from the clean reviewed commit
Production touched: No
```
