# Master Catalog Phase 4 WP-6 Owner Review Note

**Status:** Ready for owner review
**Prepared:** 2026-07-06 16:47 +07
**Branch:** `codex/master-catalog-phase4`
**Reviewed baseline commit:** `72f2c05 merge: integrate hotfix 016 into phase4`
**Environment:** Local only
**Production touched:** No

## 1. Reviewer Verdict

WP-6 official export evidence is ready for owner review for the 710-row
baseline `2568.0.0` Local DB-generated Excel/PDF artifacts. I found no
blocking WP-6 export defect in the evidence reviewed after the latest
pagination/table proof and automated coverage cleanup.

This is not a Production approval, not a Production deployment approval, not a
catalog publication approval, and not approval to publish any add/supplement
version. P-18 display-order placement governance remains open and must be
resolved before any version containing added or supplement rows is treated as
Production-ready.

Recommended owner decision:

| Decision | Recommendation | Boundary |
|---|---|---|
| Accept WP-6 baseline export implementation evidence | Accept, if owner visually accepts the filed artifacts | Local-only `2568.0.0` baseline export evidence |
| Accept the current Excel/PDF artifact proof as sufficient for P-11 baseline review | Accept, if owner does not require stronger browser download automation | Final P-11 artifact acceptance still belongs to owner |
| Mark WP-6 complete after owner acknowledgement | Accept after owner review | Tracker can move to `Complete` only after owner accepts |
| Start WP-7 BOQ and Factor F regression preservation after WP-6 acceptance | Accept for Local only | No Production write, no Factor F change, no hotfix scope expansion |
| Keep P-18 open and hold add/supplement publication | Required | No add/supplement publish path until placement governance is approved |

## 2. Authority Basis Checked

| Authority | WP-6 implication |
|---|---|
| Migration ledger | Phase 4 stays local-only at `017`-`019`; hotfix `016` is already merged before Phase 4 scripts |
| Implementation Execution Pack | WP-6 must generate selected-version official Excel/PDF and stop before Production gates |
| Decision Register | P-11 visual direction is approved for implementation; final artifact acceptance remains pending; P-18 remains pending |
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
| Excel file | `output/master-catalog/wp6-artifact-proof/NT-Master-Catalog-v2568.0.0-20260101.xlsx` |
| Excel binary SHA-256 | `1d1f1bc80982feaed231cb1e2c388b4f08fa81d2eb2b31a0b75ddf8d1a5131d9` |
| PDF file | `output/master-catalog/wp6-artifact-proof/NT-Master-Catalog-v2568.0.0-20260101.pdf` |
| PDF binary SHA-256 | `60374773a9bd4e92dfd79515f131221d9b7d30d1a240ba3a0568eb24733efec6` |
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
| `npm test -- tests/master-catalog-admin-read-model.test.ts tests/master-catalog-export-data.test.ts tests/master-catalog-export-excel.test.ts` | Passed, 3 files / 19 tests |
| `npm test` | Passed, 18 files / 96 tests |
| `npx tsc --noEmit --pretty false` | Passed |
| `npm run lint` | Passed with 0 errors / 10 existing warnings |
| `git diff --check` | Passed |
| `npm run build` | Sandbox failed only on blocked Google Fonts fetch; escalated build passed |

## 5. Findings

### Blocking findings for WP-6 owner review

None found for the local-only 710-row baseline export artifact evidence.

### Residual risks and next-gate items

| Item | Severity | Blocks WP-6 baseline review? | Required before |
|---|---|---:|---|
| Final P-11 artifact acceptance remains owner-held | High | Yes, for marking WP-6 complete | WP-6 complete/P-11 acceptance |
| P-18 display-order placement governance remains open | High for add/supplement versions | No for baseline `2568.0.0` export | Any add/supplement publication readiness |
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
| 4 | Do you approve starting WP-7 local-only BOQ and Factor F regression preservation after WP-6 is complete? | Yes, Local only |
| 5 | Do you confirm P-18 remains open and add/supplement publication stays held until placement governance is approved? | Yes |

Recommended owner response if accepted:

```text
Accept WP-6 local-only baseline export evidence and final P-11 artifacts for the `2568.0.0` proof. Mark WP-6 Complete. Start WP-7 local-only BOQ and Factor F regression preservation. No Production write, no Production migration/deploy/feature enablement/catalog publication, no Factor F change, and no add/supplement publication are authorized. Keep P-18 open until display-order placement governance is approved.
```

## 7. Proposed WP-7 Local-Only Start Plan

If the owner accepts WP-6, the next safe WP-7 sequence is:

1. Update the tracker to WP-6 `Complete` and WP-7 `In progress`.
2. Re-read BOQ, Factor F, hotfix `016`, and post-Factor-F authority docs.
3. Add/refresh regression tests for BOQ save/edit/duplicate/print/export version labels and preserved item suffix labels.
4. Add/refresh assertions that new BOQs bind the current catalog pointer and current Factor F pointer.
5. Add/refresh assertions that existing BOQ edit/save preserves `price_list_version_id`, `factor_reference_version_id`, item snapshots, and Factor F snapshots.
6. Verify Factor F pointer, rows, and hashes are unchanged by Master Catalog workflows.
7. Run focused and full local verification without resetting Local Supabase unless the owner explicitly approves a bootstrap.

WP-7 must remain regression-only. It must not add a new Factor F workflow,
change Factor F rows/pointers, backfill old BOQs, reprice historical BOQs, or
reopen the production hotfix scope without approval.

## 8. Handoff

```text
Current WP: WP-6
Status: Ready for owner review after closing automated export-evidence gaps; final owner P-11 artifact acceptance pending
Branch: codex/master-catalog-phase4
Latest commit: 72f2c05 merge: integrate hotfix 016 into phase4
Files changed in this review package: admin short-hash helpers, export/read-model tests, Verification Report, Progress Tracker, WP-6 Owner Review Note
Evidence produced: older selected-version export coverage, draft export marking coverage, spec-aligned short dataset hash formatting, full test/typecheck/lint/build verification, and owner-review package
Tests/checks run: focused export/read-model tests; npm test; npx tsc --noEmit --pretty false; npm run lint; git diff --check; npm run build after network escalation for existing Google Fonts fetch
Blockers: final P-11 artifact acceptance; P-18 placement governance for add/supplement versions; WP-7 BOQ/Factor F regression still pending; advisor/snapshot/hash-portability gates remain for WP-8/P-12+
Owner decisions needed: accept/reject WP-6 baseline artifacts; accept/require stronger download automation; approve marking WP-6 complete; approve starting WP-7 local-only regression; keep/resolve P-18
Next safe step: owner reviews this WP-6 package and the generated Excel/PDF artifacts, then either accepts WP-6 or requests targeted artifact fixes
Production touched: No
```
