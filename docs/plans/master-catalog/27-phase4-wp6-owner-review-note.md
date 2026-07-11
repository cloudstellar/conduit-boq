# Master Catalog Phase 4 WP-6 Owner Review Note

**Status:** Accepted — exact TH Sarabun New 16 pt replacement pair is final Local P-11/WP-6 artifact evidence
**Prepared:** 2026-07-06 16:47 +07
**Updated:** 2026-07-11 22:20 +07 after owner visual/content acceptance
**Branch:** `codex/master-catalog-phase4`
**Artifact source commit:** `777df7598c8aa96a17f3665db5131e5fb5397b96`
**Environment:** Local only
**Production touched:** No

## 1. Reviewer Verdict

The exact 710-row `2568.0.0` Local replacement pair generated at `777df75`
passed the tracked semantic verifier, independent rerun, PDF inspection, and
workbook inspection. Every one of 20,808 populated Excel cells uses
`TH Sarabun New` at 16 pt or larger; titles retain an 18-20 pt hierarchy. The
PDF keeps its embedded NT fonts and all 19 rendered pages are pixel-output
identical to the prior approved visual proof. I found no blocking technical
WP-6 export defect in the replacement pair. The owner reviewed the replacement
format and confirmed `รูปแบบ pdf excel ok เลยครับ` at 2026-07-11 22:20 +07.
The exact named pair is accepted as final Local P-11/WP-6 artifact evidence;
WP-6 is complete.

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
accepted the PDF visual/content direction on 2026-07-11 and refined the Excel
font on the same date. P-20, semantic verification, and five-sheet visual QA
pass for the replacement binaries, and the owner has now accepted those exact
files. Production filing remains a separate later gate.

This is not a Production approval, not a Production deployment approval, not a
catalog publication approval, and not approval to publish any add/supplement
version. P-18 display-order placement governance remains open. The plan now
inserts WP-6.5 reliability hardening before WP-7. It includes the two DB publish
guards plus end-to-end retry IDs, P-20 hash portability, reusable ADR-003
versioning, live DB/concurrency evidence, tracked export verification, operator
failure states/logging, and documentation consistency.

The tracked WP-6.5 implementation includes deterministic baseline identity,
actor+payload request fingerprints, stable client operation IDs, shared DB
readiness/guards, generic ADR-003 version transitions, atomic mutation abort,
runtime timeouts, semantic artifact generation/verification, route failure
states, bounded logs, and a Local DB/concurrency/P-20 harness. Two independent
owner-approved clean rebuilds passed the core live DB/concurrency and P-20
gates on commit `1ad01b9`. A third explicitly owner-approved clean bootstrap
then restored a canonical Local baseline at `edf3570a`. The typography-only
replacement was generated from commit `777df75` without another reset or
harness run, so test audit rows remain absent from the owner-review workbook.

Recorded owner decision:

| Decision | Outcome | Boundary |
|---|---|---|
| Accept WP-6 baseline export implementation evidence | Accepted for visual/content direction | Local-only `2568.0.0` baseline export implementation |
| Accept the current Excel/PDF visual/content direction | Accepted with Excel refinement | Exact replacement implements TH Sarabun New with 16 pt body baseline; PDF retains NT fonts |
| Mark WP-6 complete now | Accepted | Owner accepted the exact replacement pair at 2026-07-11 22:20 +07; Production filing remains separate |
| Start WP-6.5 reliability and publish-boundary hardening | Authorized for Local only; authorization was granted before final WP-6 acceptance and remains in force | Follow Execution Pack sub-gates; no unannounced reset, Production write, placement UI, Factor F change, or hotfix scope expansion |
| Implement P-20 deterministic identity | Approved: baseline identity equals immutable Production-derived `price_list.id`; keep `identity_id` in the lineage hash | Passed across two independent clean rebuilds; rerun at WP-8/P-15 or after migration changes |
| Start WP-7 BOQ and Factor F regression preservation | Only after all applicable WP-6.5 evidence, including P-20, is green | Regression-only; no new Factor F workflow |
| Keep P-18 open and hold add/supplement publication | Required | No add/supplement publish path until guard evidence and placement governance are approved |

## 2. Authority Basis Checked

| Authority | WP-6 implication |
|---|---|
| Migration ledger | Phase 4 stays local-only at `017`-`019`; hotfix `016` is already merged before Phase 4 scripts |
| Implementation Execution Pack | WP-6 must generate selected-version official Excel/PDF and stop before Production gates |
| Decision Register | P-11 exact replacement binaries are owner-accepted and WP-6 is complete; P-18/P-19 are workflow gates; P-20 deterministic `price_list.id` mapping is approved/proven for WP-6.5 and must rerun at later gates; P-06 allows only the `ITEM-0139` temporary legacy exception |
| Official Export Spec | Server-selected version, fail-closed count/hash, exact five-sheet Excel, server-verified PDF stamp, draft marking, and Factor F exclusion are required |
| Verification Report | WP-6 evidence distinguishes dataset hash from binary file hash, records Local owner/file acceptance, and keeps Production filing separate |
| Admin Operating Procedure | Official exports must be generated from the published selected version, then binary hashes filed separately |
| Production Runbook | Official export filing happens only after approved Production publish, not during this Local review |
| Post-Factor-F Plan | Master Catalog export must not include or mutate Factor F rows, metadata, BOQ snapshots, or BOQ totals |

## 3. Evidence Reviewed

### 3.1 Git and scope

| Check | Evidence | Result |
|---|---|---|
| Branch | `codex/master-catalog-phase4` | Passed |
| Artifact source commit | `777df7598c8aa96a17f3665db5131e5fb5397b96` | Passed |
| Production write boundary | No Production DB access/write was performed in this review package | Passed |
| Local DB reset boundary | No new reset for typography; generation reused the clean canonical baseline established by the prior owner-approved bootstrap | Passed |
| Untracked reference/temp paths | `files/`, `tmp/`, and `output/` artifacts remain untracked and were not staged | Expected |

### 3.2 Replacement Local artifact proof

| Artifact | Evidence |
|---|---|
| Evidence directory | `output/master-catalog/review-artifacts/20260711T145832108Z-777df759/` |
| Excel file | `NT-Master-Catalog-v2568.0.0-20260101.xlsx` |
| Excel binary SHA-256 | `9e7622fb1a269ebe96c45af69d339162b32f42143ce304caa13a520587ae3a07` |
| PDF file | `NT-Master-Catalog-v2568.0.0-20260101.pdf` |
| PDF binary SHA-256 | `e9e793c4880956fede05b7dee098e24fb0c6bc1b25c8e74f843f1afcfad76eff` |
| Print HTML SHA-256 | `58fbbff501f97d8b4c64c03b4b481098af1bc429269ad3cabc06e7e155bbeeff` |
| Dataset hash | `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8` |
| Manifest/verifier | `artifact-manifest.json` and `artifact-verification.json`; embedded and independent verification both passed with no failures |

The replacement artifact proof records 710 Excel price rows, 710 verification rows,
exact five visible sheets, reconstructed dataset hash match, no formulas or
hyperlinks, numeric money formats, and `priceSequenceBreakCount=0`. All five
sheets were rendered and inspected. Direct binary inspection found 20,808
populated cells, all `TH Sarabun New`, minimum font size 16 pt, no bad
typography, and a fixed 22-point verification-row height. The change-summary
sheet contains the clean baseline message and no WP-6.5 harness audit rows.

The replacement PDF proof records 19 pages, generated price sections matching the
physical PDF page count, no low-content overflow pages, DOM row count 710,
first/last sequence 1/710, unique sequence count 710, `sequenceBreakCount=0`,
full hash present, price-disclaimer watermark present, row 527 on one line,
right table border restored, and embedded/subset `/NTRegular`, `/NTBold`, and
`/Menlo-Regular`. Poppler rendering of all 19 pages was byte-identical to the
prior approved visual proof and found no clipped edge content or anomalous
blank page.

An earlier pair under `20260711T125426128Z-edf3570a/` correctly exposed two
WP-6.5 restore audit rows left by the reliability harness. It was rejected and
superseded as owner-acceptance evidence. The later clean-baseline pair under
`20260711T141050812Z-edf3570a/` passed technically but was superseded by the
owner-approved TH Sarabun New refinement. Do not use either earlier pair for
P-11.

The replacement pair above is accepted Local P-11/WP-6 evidence but is not a
Production filing. Preserve these binaries and hashes; do not regenerate them.
Official Production filing remains a later P-15/release gate.

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
| `npm test` | Passed, 25 files / 120 tests at the latest full repository checkpoint |
| `npx tsc --noEmit --pretty false` | Passed at the latest full repository checkpoint |
| `npm run lint` | Passed with 0 errors / 10 existing warnings |
| `npm run artifacts:master-catalog:verify -- output/master-catalog/review-artifacts/20260711T145832108Z-777df759/artifact-manifest.json` | Passed independently with no failures |
| `git diff --check` | Passed |
| `npm run build` | 2026-07-11 escalated build passed at the preceding code checkpoint; typography change separately passed full tests and TypeScript |

## 5. Findings

### Blocking findings at WP-6 acceptance

None found for the local-only 710-row baseline export artifact evidence.

### Residual risks and next-gate items

| Item | Severity | Invalidates accepted WP-6 evidence? | Required before |
|---|---|---:|---|
| P-18 display-order placement governance remains open | High for add/supplement versions | No for baseline `2568.0.0` export | Any add/supplement publication readiness |
| WP-6.5 core live DB/rebuild evidence passed; browser retry/UAT and lifecycle negatives remain | High for mutation/publication reliability | No for baseline `2568.0.0` artifact acceptance | Before WP-6.5 closeout/WP-7 |
| P-19 inactive/retired PDF policy pending | Medium for future retired-row versions | No for current all-active baseline proof | Any official PDF filing for a version with inactive/retired rows |
| Optional stronger Excel attachment-download proof remains open | Medium | No if owner accepts unit/build/manual artifact proof | Only if owner requires browser-download automation |
| P-20 two-run proof passed; a rerun remains required after migration changes and at WP-8/P-15 | Medium | No | WP-8/migration fingerprint/P-15 |
| BOQ and Factor F regression preservation not started | High for Production readiness | No for WP-6 export review | WP-7/WP-8 |
| Advisor baseline and approved fresh Production snapshot source remain open | Medium | No for WP-6 export review | WP-8/P-12 |
| App-wide/legacy NT logo provenance remains partially open under P-10 | Medium | No for WP-6 artifact proof | P-10/Production deploy readiness |

## 6. Recorded Decisions And Remaining Review

The staged decisions are recorded above. P-11/WP-6 review is complete; later
owner review is limited to affected-workflow and Production decisions:

| # | Question | Recommended answer |
|---|---|---|
| 1 | Is the visual/content direction accepted? | Recorded yes on 2026-07-11 |
| 2 | May WP-6.5 proceed Local-only before the final pair? | Recorded yes on 2026-07-11 |
| 3 | May WP-7 start before WP-6.5/P-20 evidence is green? | No |
| 4 | Is WP-6 complete now? | Yes; owner accepted the exact replacement pair at 2026-07-11 22:20 +07 |
| 5 | Is P-18 placement approved? | No; keep add/supplement publication blocked |
| 6 | Is P-19 retired-row PDF treatment approved? | No; do not file an affected PDF as final |

Recorded final-pair response:

```text
รูปแบบ pdf excel ok เลยครับ
```

This accepts the exact retained Local `2568.0.0` pair, manifest, semantic
verification result, and recorded binary hashes as final P-11/WP-6 artifact
evidence. It does not approve Production filing/migration/deploy/enablement,
catalog publication, P-18/P-19, or any Factor F change.

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
Status: WP-6/P-11 complete; core live Local/P-20 and accepted export evidence passed; remaining browser/UAT/lifecycle gates are pending before WP-6.5 closeout/WP-7
Branch: codex/master-catalog-phase4
Artifact source commit: 777df7598c8aa96a17f3665db5131e5fb5397b96
Files changed in this checkpoint: Excel typography generator/tests and aligned authority documents; generated/reference artifacts remain untracked
Evidence produced: exact replacement PDF/Excel pair, manifest, semantic verifier, all-sheet workbook QA, 19-page PDF comparison, and unchanged post-export Local readback
Tests/checks run: See the latest Tracker/Verification Report entry
Blockers: browser timeout/retry and intended-admin UAT; live duplicate/nonmonotonic lifecycle negatives; P-18 placement; P-19 retired-row PDF policy; WP-7 BOQ/Factor F regressions; WP-8 advisor/snapshot/UAT/performance gates
Owner decisions needed: P-18/P-19 when affected; Production P-12-P-15 remain separate
Next safe step: finish remaining non-destructive WP-6.5 browser/UAT and lifecycle-negative evidence, then return for closeout; no Local reset without explicit approval
Production touched: No
```
