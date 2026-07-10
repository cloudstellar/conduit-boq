# Master Catalog Phase 4 WP-6 Owner Review Note

**Status:** Ready for owner review
**Prepared:** 2026-07-06 16:47 +07
**Updated:** 2026-07-11 00:59 +07 for Local proof of the final PDF/Excel terminology and title hierarchy
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
labels while canonical verification identifiers remain unchanged. Final P-11
visual/file acceptance is still owner-held.

This is not a Production approval, not a Production deployment approval, not a
catalog publication approval, and not approval to publish any add/supplement
version. P-18 display-order placement governance remains open. The plan now
inserts WP-6.5 before WP-7 to add publish-boundary guards that hold any
add/supplement/new-identity version until placement governance is approved and
that enforce the first structured-code rollout's `ITEM-0139` legacy exception.

Recommended owner decision:

| Decision | Recommendation | Boundary |
|---|---|---|
| Accept WP-6 baseline export implementation evidence | Accept, if owner visually accepts the filed artifacts | Local-only `2568.0.0` baseline export evidence |
| Accept the current Excel/PDF artifact proof as sufficient for P-11 baseline review | Accept, if owner does not require stronger browser download automation | Final P-11 artifact acceptance still belongs to owner |
| Mark WP-6 complete after owner acknowledgement | Accept after owner review | Tracker can move to `Complete` only after owner accepts |
| Start WP-6.5 publish-boundary guard hardening after WP-6 acceptance | Accept for Local only | No Production write, no placement UI, no Factor F change, no hotfix scope expansion |
| Start WP-7 BOQ and Factor F regression preservation | Only after WP-6.5 guard evidence | Regression-only; no new Factor F workflow |
| Keep P-18 open and hold add/supplement publication | Required | No add/supplement publish path until guard evidence and placement governance are approved |

## 2. Authority Basis Checked

| Authority | WP-6 implication |
|---|---|
| Migration ledger | Phase 4 stays local-only at `017`-`019`; hotfix `016` is already merged before Phase 4 scripts |
| Implementation Execution Pack | WP-6 must generate selected-version official Excel/PDF and stop before Production gates |
| Decision Register | P-11 visual direction is approved for implementation; final artifact acceptance remains pending; P-18 remains pending with WP-6.5 guard planned; P-06 allows only the `ITEM-0139` temporary legacy exception; P-19 is pending for future inactive/retired-row versions |
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
| WP-6.5 publish-boundary guards not implemented yet | High for add/supplement and structured-code publication safety | No for baseline `2568.0.0` export | Before WP-7 and before add/supplement or structured-code path readiness |
| P-19 inactive/retired PDF policy pending | Medium for future retired-row versions | No for current all-active baseline proof | Any official PDF filing for a version with inactive/retired rows |
| Optional stronger Excel attachment-download proof remains open | Medium | No if owner accepts unit/build/manual artifact proof | Only if owner requires browser-download automation |
| Local clean-reset identity hash portability remains open | Medium | No for this artifact review | WP-8/P-15 readiness decision |
| BOQ and Factor F regression preservation not started | High for Production readiness | No for WP-6 export review | WP-7/WP-8 |
| Advisor baseline and approved fresh Production snapshot source remain open | Medium | No for WP-6 export review | WP-8/P-12 |
| App-wide/legacy NT logo provenance remains partially open under P-10 | Medium | No for WP-6 artifact proof | P-10/Production deploy readiness |

## 6. Owner Review Questions

Please review these decisions explicitly:

| # | Question | Recommended answer |
|---|---|---|
| 1 | Do you accept the WP-6 local-only baseline export evidence for `2568.0.0`? | Yes, if the Excel/PDF artifacts are visually acceptable |
| 2 | Do you accept the current artifact proof instead of requiring stronger browser attachment-download automation now? | Yes |
| 3 | Do you approve marking WP-6 `Complete` in the tracker after this review? | Yes, after owner acknowledgement |
| 4 | Do you approve starting WP-6.5 local-only publish-boundary guard hardening after WP-6 is complete? | Yes, Local only |
| 5 | Do you approve starting WP-7 only after WP-6.5 guard evidence is recorded? | Yes |
| 6 | Do you confirm P-18 remains open and add/supplement publication stays held until guard evidence and placement governance are approved? | Yes |
| 7 | Do you accept the refined field-facing PDF cover that omits approval/publisher/export/generator metadata and uses a plain Thai warning only for non-current published versions? | Yes, after visual review of the regenerated cover |

Recommended owner response if accepted:

```text
Accept WP-6 local-only baseline export evidence and final P-11 artifacts for the `2568.0.0` proof. Mark WP-6 Complete. Start WP-6.5 local-only publish-boundary guard hardening before WP-7, including P-18 new-identity rejection and structured-code `ITEM-0139` exception enforcement. No Production write, no Production migration/deploy/feature enablement/catalog publication, no Factor F change, no placement UI/reorder workflow, and no add/supplement publication are authorized. Keep P-18 open until guard evidence and display-order placement governance are approved.
```

## 7. Proposed WP-6.5 Then WP-7 Local-Only Start Plan

If the owner accepts WP-6, the next safe sequence is:

1. Update the tracker to WP-6 `Complete` and WP-6.5 `In progress`.
2. Re-read the publish pointer migration, DB contract, Decision Register P-18, and Verification Report publication tests.
3. Add the DB publish guard to reject draft rows whose `identity_id` is absent from the base version with `P18_PLACEMENT_REVIEW_REQUIRED`.
4. Add the structured-code publish guard so active legacy `ITEM-####` rows in `2568.1.0` are limited to the approved `ITEM-0139` exception.
5. Add safe UI/server-action error mapping for the P-18 code.
6. Add static and Local smoke evidence proving rejections are atomic and unchanged 710-row publish/restore still works.
7. After WP-6.5 evidence is recorded, start WP-7 local-only BOQ and Factor F regression preservation.
8. Re-read BOQ, Factor F, hotfix `016`, and post-Factor-F authority docs.
9. Add/refresh regression tests for BOQ save/edit/duplicate/print/export version labels and preserved item suffix labels.
10. Add/refresh assertions that new BOQs bind the current catalog pointer and current Factor F pointer.
11. Add/refresh assertions that existing BOQ edit/save preserves `price_list_version_id`, `factor_reference_version_id`, item snapshots, and Factor F snapshots.
12. Verify Factor F pointer, rows, and hashes are unchanged by Master Catalog workflows.
13. Run focused and full local verification without resetting Local Supabase unless the owner explicitly approves a bootstrap.

WP-7 must remain regression-only. It must not add a new Factor F workflow,
change Factor F rows/pointers, backfill old BOQs, reprice historical BOQs, or
reopen the production hotfix scope without approval.

## 8. Handoff

```text
Current WP: WP-6.5 planning
Status: WP-6 remains ready for owner review after closing automated export-evidence gaps; WP-6.5 publish-boundary guard hardening is now the next planned slice; final owner P-11 artifact acceptance pending
Branch: codex/master-catalog-phase4
Latest commit: See git HEAD for the latest committed checkpoint
Files changed in this review package: WP-6 export implementation/evidence plus later authority-doc alignment for WP-6.5 sequencing
Evidence produced: older selected-version export coverage, draft export marking coverage, spec-aligned short dataset hash formatting, full test/typecheck/lint/build verification, owner-review package, and WP-6.5 publish-boundary planning alignment
Tests/checks run: focused export/read-model tests from WP-6; targeted doc grep; git diff --check; npm test -- tests/master-catalog-migrations.test.ts
Blockers: final P-11 artifact acceptance; WP-6.5 publish-boundary guards not implemented; P-18 placement governance for add/supplement versions; P-19 inactive/retired PDF policy for future retired-row versions; WP-7 BOQ/Factor F regression still pending; advisor/snapshot/hash-portability gates remain for WP-8/P-12+
Owner decisions needed: accept/reject WP-6 baseline artifacts; accept/require stronger download automation; approve marking WP-6 complete; approve starting WP-6.5 local-only publish-boundary guard hardening; keep/resolve P-18/P-19
Next safe step: owner reviews this WP-6 package and the generated Excel/PDF artifacts, then either accepts WP-6 and starts WP-6.5 or requests targeted artifact fixes
Production touched: No
```
