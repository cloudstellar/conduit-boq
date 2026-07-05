# Master Catalog Phase 4 WP-4 Owner Review Note

**Status:** Ready for owner review  
**Prepared:** 2026-07-05 21:43 +07  
**Branch:** `codex/master-catalog-phase4`  
**Reviewed commit:** `a787ffb fix: harden master catalog wp4 local proof flow`  
**Environment:** Local only  
**Production touched:** No

## 1. Reviewer Verdict

WP-4 implementation evidence is ready for owner review. I found no blocking
WP-4 defect that should stop the owner from accepting the draft mutation,
manual edit, import validation/apply, and history evidence as sufficient to
authorize the next local-only work package.

This is not a Production approval and not a Production publication approval. It
is only a WP-4 acceptance checkpoint before starting WP-5 local-only
publish/pointer implementation and rehearsal.

Recommended owner decision:

| Decision | Recommendation | Boundary |
|---|---|---|
| Accept WP-4 implementation evidence | Accept | Local-only WP-4 evidence only |
| Mark WP-4 complete after owner acknowledgement | Accept after owner review | Tracker can move from `Ready for owner review` to `Complete` only after owner accepts |
| Start WP-5 after acceptance | Accept for Local only | No Production migration, deploy, feature enablement, or publication |
| Treat manual browser upload proof as sufficient for WP-4 | Accept | Dedicated automated file-picker e2e can remain optional/polish |

## 2. Authority Basis Checked

The review checked WP-4 against the current authority set:

| Authority | WP-4 implication |
|---|---|
| Review Guide | Preserve Production `2568.0.0` authority and Factor F boundary |
| Implementation Execution Pack | WP-4 must cover draft/import/manual/history; WP-5 starts only after WP-4 |
| Decision Register | P-09 only reserves `2568.1.0`; P-12 through P-15 remain separate Production gates |
| DB/security contract | Catalog writes are function-only, audited, bounded, and cannot expose raw SQL/internal details |
| Parser/hash spec | Browser workbook parsing, normalized payload, source hash, and K/Factor-F exclusion must remain deterministic |
| Official export spec | Final P-11 artifacts still require DB-generated Excel/PDF later; WP-4 does not claim export acceptance |
| Verification Report and Runbook | Production readiness evidence remains pending until WP-8/P-12 |
| Post-Factor-F plan | Phase 4 must not move Factor F pointer, rows, bindings, or legacy BOQ Factor F state |
| NT CI runtime asset analysis | CI runtime derivatives remain a later export/UI artifact gate, not a WP-4 blocker |

## 3. Evidence Reviewed

### 3.1 Git and scope

| Check | Evidence | Result |
|---|---|---|
| Branch | `codex/master-catalog-phase4` | Passed |
| Reviewed commit | `a787ffb` | Passed |
| Reviewed implementation diff | `a787ffb` was the committed implementation checkpoint before this review package | Passed |
| Untracked reference/temp paths | `files/`, `tmp/`, `output/master-catalog/p11-preview/...` remain untracked | Expected; do not stage |

### 3.2 WP-4 local DB and action coverage

| Capability | Evidence | Result |
|---|---|---|
| Draft create | Clean Local WP-4 smoke created draft `2568.1.0` from `2568.0.0` | Passed |
| Manual retire/add/edit/recode | Clean Local WP-4 smoke audited all expected action types | Passed |
| Import validate/apply | Clean Local WP-4 smoke validated/applied import and marked import applied | Passed |
| Duplicate request idempotency | Clean Local WP-4 smoke checked duplicate manual/import requests | Passed |
| Stale lock rejection | Clean Local WP-4 smoke checked stable conflict behavior | Passed |
| Publish blocked in WP-4 | `publish_catalog_version` remains disabled until WP-5 | Passed |
| Pointer restore blocked in WP-4 | `restore_catalog_pointer` remains disabled until WP-5 | Passed |
| BOQ unchanged | Clean Local WP-4 smoke asserted BOQ count unchanged | Passed |
| Factor F unchanged | Clean Local WP-4 smoke asserted Factor F default/version/hash/count unchanged | Passed |

### 3.3 Manual browser upload proof

Owner manually selected `tmp/wp4-import-manual-proof.xlsx` in the in-app
browser on `http://localhost:3000/admin/master-catalog/import`, then prepared
preview and ran Server validate.

| Check | Evidence | Result |
|---|---|---|
| File selected | `wp4-import-manual-proof.xlsx` | Passed |
| Preview rows | 1 supplement row | Passed |
| Server validation | Import `781d6b3e-b436-43b3-8b82-f9112fa895ce` | Passed |
| Apply action | `Apply import` was not clicked | Passed |
| Browser console | No console errors at proof capture | Passed |
| Local DB import state | `status=validated`, `applied_at=null` | Passed |
| Source SHA-256 | `0f45289d34b42ae3029b386ddcf4af0867e8b4a5de7416ed7ff554eb4b99d34f` | Passed |
| Normalized payload hash | `9be2f88f874813a812b216ffca7deade21050d59c4fa4f0dbba62a96a98604c2` | Passed |

Fresh local readback on 2026-07-05 21:37 +07 confirmed:

| Object | State |
|---|---|
| `catalog_admin_enabled` | `false` |
| `2568.0.0` | `active`, `is_default=true`, `item_count=710`, `dataset_hash=null`, `published_at=null` |
| `2568.1.0` | `draft`, `is_default=false`, `lock_version=5`, `item_count=711`, `dataset_hash=null`, `published_at=null` |
| Manual proof import | `validated`, `applied_at=null` |

### 3.4 Data-quality and reconciliation evidence

| Data-quality dimension | Evidence | Result |
|---|---|---|
| Authority grain | Production `2568.0.0` remains authority for initial names, units, and prices | Passed |
| Reconciliation counts | 728 total records, 710 Production rows, 18 workbook candidates | Passed |
| Price comparison | 648 exact-price matches, 42 price differences | Passed |
| Source deltas | 20 Production-only, 18 workbook-only, 16 HDPE/GIP conflicts | Passed |
| Workbook-only handling | Deferred unless separate item/price authority is approved | Passed |
| K/Factor-F exclusion | Parser/payload tests reject or exclude K and Factor-F-looking fields | Passed |
| Hash format contract | Import support hashes use bare 64-hex; dataset hash remains `sha256:<hex>` | Passed |

### 3.5 Security and error-handling evidence

| Check | Evidence | Result |
|---|---|---|
| Raw DB/PostgREST errors hidden from UI | `a787ffb` added RPC transport error sanitization | Passed |
| Safe business errors preserved | Allowlisted RPC codes can still show actionable messages | Passed |
| Local password drift fixed | Shared local env parser handles inline `#` comments consistently | Passed |
| Feature flag fail-safe | `catalog_admin_enabled=false` after proofs | Passed |
| Function-only mutation boundary | WP-4 app actions call RPCs; direct table writes are not introduced | Passed |
| Production write boundary | No migration/deploy/feature enablement/publish/Production write occurred | Passed |

### 3.6 UI/UX and frontend evidence

| Review area | Evidence | Result |
|---|---|---|
| Operational UI fit | Admin surface uses dense table/forms, not marketing UI | Passed |
| shadcn-style composition | Existing components/tokens/lucide patterns are used; no new component dependency added | Passed |
| Server action boundary | Mutations are server actions with active admin/flag/RPC checks | Passed |
| Feedback states | Browser proof showed validation success and no raw internal error | Passed |
| Responsive layout | Prior WP-4 browser QA checked 1280x720 and 390x844 with no page-level horizontal overflow | Passed |
| Local raw file handling | Raw workbook stays in browser; no Supabase Storage upload | Passed |

## 4. Checks Run

Checks recorded for the reviewed commit:

| Check | Result |
|---|---|
| `npm test -- tests/local-env.test.ts tests/master-catalog-admin-action-model.test.ts` | Passed |
| `npm test` | 16 files / 82 tests passed |
| `npx tsc --noEmit --pretty false` | Passed |
| `npm run lint` | 0 errors / 12 existing warnings |
| `git diff --check` | Passed |
| `npm run build` | Sandbox failed only on blocked Google Fonts; escalated build passed |
| `npm run db:local:seed-users` | Passed |
| `npm run db:local:smoke-auth` | Passed |
| Clean `npm run db:local:bootstrap` + `npm run db:local:smoke-master-catalog-wp4` | Passed earlier in WP-4 import slice |

Review-package refresh:

| Check | Result |
|---|---|
| Fresh read-only Local DB readback | Passed; values recorded in this note |
| `git diff --check` | Passed after review-package edits |
| `npm test` | 16 files / 82 tests passed |
| `npx tsc --noEmit --pretty false` | Passed |
| `npm run lint` | 0 errors / 12 existing warnings |

## 5. Findings

### Blocking findings for WP-4 owner review

None found.

### Residual risks and next-gate items

| Item | Severity | Blocks WP-4 review? | Required before |
|---|---|---:|---|
| `2568.0.0` `dataset_hash` and `published_at` remain null | High for publish path | No | Close in WP-5 before publish-readiness validation |
| Supabase advisor baseline triage remains open | Medium | No | WP-8/P-12 readiness |
| Approved Production snapshot source for clean rehearsal not taken in this session | Medium | No | WP-8/P-12 readiness |
| NT CI runtime derivatives not generated | Medium for export | No | WP-6/P-10/P-11 artifact acceptance |
| Automated file-picker e2e not present | Low | No | Optional; only needed if owner wants repeatable browser file-upload proof |
| Untracked reference/temp paths exist | Low | No | Keep untracked unless owner explicitly asks to clean/stage |

## 6. Owner Review Questions

Please review these decisions explicitly:

| # | Question | Recommended answer |
|---|---|---|
| 1 | Do you accept WP-4 implementation evidence as sufficient for draft mutation/import/manual/history? | Yes |
| 2 | Do you accept manual browser upload validation proof instead of requiring automated file-picker e2e now? | Yes |
| 3 | Do you approve marking WP-4 `Complete` in the tracker after this review? | Yes, after owner acknowledgement |
| 4 | Do you approve starting WP-5 local-only publish/pointer implementation after WP-4 is marked complete? | Yes, Local only |
| 5 | Do you confirm `files/`, `tmp/`, and `output/master-catalog/p11-preview/...` remain untracked reference/temp artifacts? | Yes |

Recommended owner response if accepted:

```text
Accept WP-4 owner review. Mark WP-4 Complete. Start WP-5 local-only publish/pointer implementation and rehearsal. No Production write, no Production feature enablement, no Production catalog publication, and no Factor F work are authorized.
```

## 7. Proposed WP-5 Local-Only Start Plan

If the owner accepts WP-4, the next safe WP-5 sequence is:

1. Update tracker to WP-4 `Complete` and WP-5 `In progress`.
2. Re-read authority docs and DB/security contract publish/pointer sections.
3. Create the next local migration with Supabase CLI rather than inventing a filename.
4. Implement local-only publish and pointer restore RPCs with advisory lock, idempotency, active-admin/flag checks, server-side count/hash computation, publication metadata validation, singleton pointer move, and legacy `is_default` mirror sync.
5. Close the `2568.0.0` metadata/hash deferral with trusted code; do not copy a stale hash by hand.
6. Add tests for publish completeness, stale lock/base, idempotency, immutability, pointer restore, old BOQ unchanged, Factor F unchanged, and direct-write rejection.
7. Run clean Local bootstrap/smoke and update tracker with evidence.

WP-5 must remain local-only. It must not request P-12, deploy, enable the
feature in Production, publish a Production catalog, or touch Factor F.

## 8. Handoff

```text
Current WP: WP-4
Status: Ready for owner review
Branch: codex/master-catalog-phase4
Latest commit: a787ffb fix: harden master catalog wp4 local proof flow
Files changed in this review package: docs/plans/master-catalog/26-phase4-wp4-owner-review-note.md; docs/plans/master-catalog/25-phase4-execution-progress-tracker.md
Evidence produced: WP-4 owner review note; fresh read-only Local DB readback; explicit owner questions and WP-5 local-only start plan
Tests/checks run: Fresh read-only Local DB readback; git diff --check; npm test; npx tsc --noEmit --pretty false; npm run lint with 0 errors / 12 existing warnings
Blockers: No blocking WP-4 review finding; next-gate items remain for WP-5/WP-6/WP-8/P-12
Owner decisions needed: Accept/reject WP-4 evidence; approve/hold WP-5 local-only implementation and rehearsal start
Next safe step: Owner reviews and accepts WP-4; only then mark WP-4 Complete and start WP-5
Production touched: No
```
