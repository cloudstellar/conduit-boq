# Master Catalog Phase 4 Execution Progress Tracker

**Status:** WP-2 ready for owner review
**Purpose:** Owner-facing progress tracker for Master Catalog Phase 4 local
implementation and rehearsal. This file is for quick status review; authority
remains in the Decision Register, Execution Pack, DB Contract, Runbook, and
Verification Report.

## 1. Update rules

Update this tracker whenever work pauses, a work package changes status, a
blocker appears, or evidence is produced.

Do not mark a work package complete unless its exit gate is satisfied and the
evidence reference is recorded here or in the Verification Report.

Allowed statuses:

- `Not started`
- `In progress`
- `Blocked`
- `Ready for owner review`
- `Complete`

## 2. Current dashboard

| Field | Current value |
|---|---|
| Current branch | `codex/master-catalog-phase4` |
| Current commit | `57d3bf5` |
| Current work package | WP-2 |
| Current environment | Local only |
| Production write allowed | No |
| Feature flag default | Disabled |
| Latest owner decision needed | Review WP-2 patched parser/payload/workbook/canonical hash evidence before WP-3 |
| Next owner review point | WP-2 owner review before admin UI shell work starts |
| Last updated | 2026-07-05 12:20 +07 |

## 3. Work package checklist

| WP | Scope | Status | Exit evidence | Owner review |
|---|---|---|---|---|
| WP-0 | Branch, dependency, codebase, docs, and read-only DB readiness | Complete | Branch `codex/master-catalog-phase4`, git state, codebase inspection, read-only DB preflight, advisor baseline, local checks, snapshot plan | Completed before WP-1 |
| WP-1 | Additive database foundation `016+` on Local | Complete | Draft root migration `016`, Local bootstrap, schema/RLS/grants/RPC evidence, tests, local DB lint, FK index coverage verified, reviewer pass recorded | Reviewed before next implementation WP |
| WP-2 | Parser and canonical hash implementation | Ready for owner review | Golden hash, parser/profile tests, normalized payload validation/hash tests, browser-style workbook adapter tests, Production-derived Local count/hash evidence; payload/DB contract mismatch patched and verified | Review before WP-3 |
| WP-3 | Admin read/draft UI shell behind disabled flag | Not started | Local UI smoke, auth/role behavior, responsive checks | Review if UX scope changes |
| WP-4 | Draft mutation, import, manual edit, and history | Not started | Draft apply tests, audit snapshots, stale/duplicate request tests | Review on data-contract mismatch |
| WP-5 | Publish, pointer restore, and audit on Local | Not started | Local publish/restore tests, pointer/immutability checks | Review before treating publish path as ready |
| WP-6 | Official Excel/PDF export | Not started | DB-generated export, count/hash, visual/accessibility checks | Final P-11 artifact acceptance pending |
| WP-7 | BOQ and Factor F regression preservation | Not started | BOQ save/print/export regression, Factor F before/after assertions | Required before WP-8 complete |
| WP-8 | Clean Local rehearsal and Verification Report | Not started | Clean reset, full workflow, test/lint/build/advisor evidence | Required before any P-12 request |
| WP-9 | Production migration/deploy/enable/publish | Not authorized | P-12 through P-15 sequential approvals | Separate Production readiness review required |

## 4. Owner pause points

| Pause point | Trigger | Required owner action |
|---|---|---|
| WP-0 readiness | Before writing WP-1 migration | Review branch/git/db/doc findings and blockers |
| DB contract conflict | Code/database reality contradicts approved contract | Decide whether to amend plan or implementation |
| Data decision conflict | Reconciliation or live DB contradicts P-02 through P-11 | Decide before freezing candidate data |
| P-11 final artifact | Real DB-generated Excel/PDF exists | Accept/reject final visual/export artifacts |
| WP-8 completion | Clean Local rehearsal passes | Review readiness evidence before any P-12 request |
| P-12 | Production migration window requested | Approve or reject Production migration |
| P-13 | Deploy requested after migration verification | Approve or reject deployment |
| P-14 | Feature enablement requested after admin smoke | Approve or reject enablement |
| P-15 | Exact named version publication requested | Approve or reject publication metadata, diff/count/hash, and filing evidence |

## 5. Evidence log

| Date/time | WP | Evidence | Result | Notes |
|---|---|---|---|---|
| 2026-07-05 10:55 +07 | WP-0 | Created implementation branch from fetched `origin/main` at `57d3bf5`; authority docs read before code/DB inspection | In progress | Local-only; no Production writes; untracked reference/temp paths intentionally not staged |
| 2026-07-05 11:03 +07 | WP-0 | Codebase inspection completed for root migrations `009`-`015`, Supabase clients/types, `price_list`/BOQ/Factor F paths, auth/admin patterns, feature/config patterns, and test/lint/build scripts | Ready for owner review | Next planned database migration remains `016+`; no `catalog_admin_enabled` flag or Phase 4 catalog governance tables exist yet |
| 2026-07-05 11:03 +07 | WP-0 | Tool versions recorded | Passed | Node `v24.2.0`; npm `11.3.0`; Next `16.2.9`; Supabase CLI `2.107.0` |
| 2026-07-05 11:03 +07 | WP-0 | Local checks | Passed with warnings | `npm test`: 8 files/35 tests passed. `npm run lint`: 0 errors/12 warnings. `npm run build`: passed after escalated network access for Google Fonts; sandbox build failed only on blocked font fetch |
| 2026-07-05 11:03 +07 | WP-0 | Fresh read-only Supabase MCP preflight for Production project `otlssvssvgkohqwuuiir` | Captured | Observed 2026-07-05 11:00 +07: catalog 710 rows/710 distinct codes/default `2568.0.0`; BOQ 214, BOQ items 1,838, missing price version 0, cross-version BOQ items 0; Factor F default `2569.0.0`; active Factor F versions `2566.0.0` 37 rows and `2569.0.0` 36 rows |
| 2026-07-05 11:03 +07 | WP-0 | Migration ledger and schema drift preflight | Captured | Remote ledger has expected `009`-`015`; latest `20260628190757 factor_f_repair_legacy_snapshot_metadata`. Phase 4 catalog tables/columns and `app_settings.catalog_admin_enabled` are absent, matching pre-implementation state |
| 2026-07-05 11:03 +07 | WP-0 | Supabase advisor baseline | Captured with existing warnings | Security: existing WARNs for authenticated callable `SECURITY DEFINER` functions and leaked-password protection disabled. Performance: existing INFO/WARNs for unindexed FKs, RLS initplan, unused indexes, and multiple permissive policies. No Phase 4 changes have been made yet |
| 2026-07-05 11:03 +07 | WP-0 | Snapshot/local rehearsal plan | Proposed | Use only owner-approved read-only Production snapshot; exclude auth secrets/sessions/tokens/OTP/MFA/sensitive audit payloads; restore/use only Local Supabase; do not run full Production backup gate until later readiness gate |
| 2026-07-05 11:08 +07 | WP-1 | Owner approved starting WP-1 according to WP-0 recommendation | In progress | Scope remains local-only additive migration draft; no Production migration/deploy/feature enablement/publish/Factor F write |
| 2026-07-05 11:19 +07 | WP-1 | Drafted root migration `migrations/016_master_catalog_phase4_foundation.sql` and added migration contract tests | Passed static contract | Adds Phase 4 metadata columns, identities, code registry, categories/groups, import/change audit tables, RLS/grants, disabled `catalog_admin_enabled`, and rejecting `SECURITY INVOKER` RPC stubs; static test asserts no publish, no `2568.1.0` seed, no `boq.factor_reference_version_id` write, and no Factor F DML |
| 2026-07-05 11:22 +07 | WP-1 | Ran `npm run db:local:bootstrap` with Docker Local Supabase | Passed | Reset Local Supabase only; applied baseline plus root migrations `009`-`016`; seeded 7 local users; auth smoke passed; Master Catalog smoke passed with catalog `2568.0.0`; Factor F default remained `2569.0.0`, Factor F `2569.0.0` row count remained 36, partial legacy snapshots remaining 0 |
| 2026-07-05 11:23 +07 | WP-1 | Queried Local DB Phase 4 foundation coverage | Passed | `price_list_rows=710`, `identities=710`, `codes=710`, `categories=52`, `missing_identity=0`, `missing_category=0`, `missing_display_order=0`, all seven new public tables have RLS enabled, `catalog_admin_enabled=false`, 4 RPCs are invoker, anon cannot execute `create_catalog_draft`, authenticated cannot insert `catalog_imports` |
| 2026-07-05 11:23 +07 | WP-1 | Supabase local schema lint/advisor | Passed | `npx supabase db lint --local`: No schema errors found; results empty |
| 2026-07-05 11:23 +07 | WP-1 | Local code checks after WP-1 | Passed with existing warnings | `npm test`: 8 files/36 tests passed. `npm run lint`: 0 errors/12 warnings, same warning class as WP-0. `git diff --check`: passed. Migration SHA-256 `b499d68e759514037389b8966bfa552299249c028d6f5daa027d35c18d7f8b65` |
| 2026-07-05 11:28 +07 | WP-1 | Additional Local DB FK index coverage review | Gap found | Read-only Local query found missing left-prefix indexes for `catalog_change_sets.actor_id`, `catalog_imports.created_by`, `catalog_item_codes.created_by`, `catalog_item_identities.created_by`, `price_list.identity_id`, `price_list(item_code, identity_id)`, `price_list_versions.published_by`, and existing `price_list_versions.created_by`; WP-1 should not be owner-approved until patched and verification reruns |
| 2026-07-05 11:31 +07 | WP-1 | Patched migration `016` with explicit left-prefix FK indexes and reran Local verification | Passed | Added indexes for `price_list_versions.created_by`, `price_list_versions.published_by`, `catalog_item_identities.created_by`, `catalog_item_codes.created_by`, `price_list.identity_id`, `price_list(item_code, identity_id)`, `catalog_imports.created_by`, and `catalog_change_sets.actor_id`; Local bootstrap passed; FK coverage query returned 0 missing rows; `npx supabase db lint --local`: no schema errors/results empty; `npm test`: 8 files/36 tests passed; `npm run lint`: 0 errors/12 existing warnings; `git diff --check`: passed. Migration SHA-256 `000ce3c3d56012e7e7fb7778b07b800f39e02de374f7538cd0182cee3f6a8d9d` |
| 2026-07-05 11:39 +07 | WP-1 | Reviewer pass completed after FK-index patch and Supabase changelog check | Passed | No blocking WP-1 findings remain. Relevant Supabase 2026-04 Data API exposure change is covered by explicit grants/RLS in the migration contract. Residual gaps remain tracked for later gates: advisor baseline triage, approved snapshot source, and `2568.0.0` `dataset_hash`/`published_at` closure before publish readiness |
| 2026-07-05 11:39 +07 | WP-2 | Started local-only parser/canonical hash foundation | In progress | Scope limited to parser profile contract, canonical dataset serialization/hash helper, and golden/unit tests. No import UI, publish, migration, Production write, or Factor F write/backfill/binding work |
| 2026-07-05 11:46 +07 | WP-2 | Implemented first parser/hash foundation slice and ran local verification | Passed | Added canonical dataset serializer/hash helper, `nt-item-master-2568` parser profile contract, profile exports, shared import types, and unit tests. Golden hash reproduced as `sha256:0e90d8974960a5ccd52b22b02eb0a6c60797f9234baeaefc32af8c1f9fa719b5`; profile tests cover exact detection, rejected extension/sheet/header/row overrun, formula/error/numeric money rejection, invalid sum rejection, reconciliation-context rejection, and K/Factor-F-looking field exclusion. Checks: `npm test -- tests/master-catalog-parser-hash.test.ts`, `npm test`, `npm run lint`, `npx tsc --noEmit --pretty false`, `git diff --check` |
| 2026-07-05 11:48 +07 | WP-2 | Read-only local workbook profile sanity check for `files/NT_Item_Code_Master_K_Mapping_2568.xlsx` | Gap found | Required sheet `01_Item_Master_Final` exists, range `A1:AE709`, 31 headers, and all required profile headers are present. Counted 708 nonblank candidate data rows, while WP-0 read-only Production preflight captured 710 active catalog rows for default `2568.0.0`; do not use this workbook as source-backed rehearsal authority until reconciled |
| 2026-07-05 11:50 +07 | WP-2 | Owner reaffirmed data authority decision | Resolved | Production `2568.0.0` is the authority for item names, units, and starting prices. The local 708-row workbook is non-authoritative reference material only and does not block WP-2 parser/hash foundation. Any source-backed rehearsal must derive from the approved read-only Production snapshot/export, not from this local workbook |
| 2026-07-05 11:56 +07 | WP-2 | Implemented server-side normalized payload validation/hash slice and ran local verification | Passed | Added explicit `CatalogImportPayloadV1`/apply types, normalized payload validator, deterministic normalized payload JSON/hash, and hash-mismatch validation for replay/tamper checks. Tests cover exact schema/unknown-key rejection, K and Factor-F-looking row key rejection, 750KB payload limit, 20MB raw file metadata limit, 1,500-row limit, numeric/invalid money rejection, material+labor=sum validation, duplicate canonical code rejection, source SHA format validation, Unicode NFC normalization, and tampered payload hash rejection. Checks: `npm test -- tests/master-catalog-import-payload.test.ts`, `npm test -- tests/master-catalog-parser-hash.test.ts tests/master-catalog-import-payload.test.ts`, `npm test`, `npx tsc --noEmit --pretty false`, `npm run lint`, `git diff --check` |
| 2026-07-05 12:01 +07 | WP-2 | Implemented browser-style `.xlsx` adapter and synthetic workbook tests | Passed | Added dynamic-`exceljs` workbook adapter that accepts selected workbook bytes, enforces raw file metadata/size checks, computes source SHA-256, parses visible sheets into `WorkbookInfo`, preserves formula/error cells as rejected cell kinds without evaluating them, caps parsed candidate rows at `maxRows + 1` for profile overrun evidence, and returns no raw workbook bytes. Synthetic tests cover exact profile acceptance, wrong sheet/header diagnostics, row-overrun handoff, formula/error rejection, K/Factor-F-looking column exclusion from normalized rows, file-size mismatch, raw file cap, and hidden-only workbook rejection. Checks: `npm test -- tests/master-catalog-workbook-adapter.test.ts`, `npm test -- tests/master-catalog-parser-hash.test.ts tests/master-catalog-import-payload.test.ts tests/master-catalog-workbook-adapter.test.ts`, `npx tsc --noEmit --pretty false`, `npm test`, `npm run lint`, `git diff --check` |
| 2026-07-05 12:06 +07 | WP-2 | Produced Production-derived Local canonical count/hash evidence | Passed | Added `scripts/master-catalog-local-canonical-hash.mjs` and ran it against read-only Local Supabase Docker DB restored from production-derived public snapshot plus root migrations `009`-`016`. Evidence: default version `2568.0.0` active; metadata `item_count=710`, `dataset_hash=null`, `published_at=null`; quality `row_count=710`, `distinct_item_codes=710`, `active_rows=710`, `inactive_rows=0`, `missing_identity_id=0`, `missing_category_code=0`, `missing_display_order=0`, `missing_required_text=0`, `missing_money=0`, `cost_mismatches=0`; canonical JSON `471777` bytes; canonical hash `sha256:6e5bc5cd61b370a5988a4374758cd60b77a5dc1c22e04d81fd1520378c4b0fe0`; repeat read hash matched. Checks after script: `npm test`, `npx tsc --noEmit --pretty false`, `npm run lint`, `git diff --check` |
| 2026-07-05 12:12 +07 | WP-2 | Owner-style review of parser/payload/workbook/canonical hash slice | Blocking finding | `catalog_imports.source_file_sha256` and `normalized_payload_hash` are bare 64-hex fields in the DB/security contract, but WP-2 payload/workbook code currently emits and validates `sha256:<hex>` for those supporting hashes. Payload `requestId` currently allows arbitrary stable strings while DB `request_id` is `uuid`, and `source.sizeBytes` allows `0` while DB requires `source_file_size > 0`. No Production was touched. Patch and rerun checks before starting WP-3 |
| 2026-07-05 12:16 +07 | WP-2 | Authority-document cross-check for the open WP-2 finding | Confirmed | Checked the Review Guide, Implementation Execution Pack, Decision Register, DB/security contract, Parser/Hash Spec, Official Export Spec, Verification Report, Production Runbook, Post-Factor-F Plan, NT CI analysis, architecture review disposition, architecture plan, and change request for the relevant gates/contracts. Result: dataset hashes remain `sha256:<hex>`, but `catalog_imports.source_file_sha256` and `normalized_payload_hash` remain bare 64-hex DB fields; request IDs are UUID-backed idempotency fields; source file size is positive. The recommended action is an implementation/test patch, not an owner decision, unless the owner wants to amend the approved DB contract |
| 2026-07-05 12:20 +07 | WP-2 | Patched payload/workbook validation contracts to match approved DB contract | Passed | `source.sha256` and `normalizedPayloadHash` now validate/return bare 64 lowercase hex for `catalog_imports`; `requestId` now validates as UUID; `source.sizeBytes`/workbook file size now require positive values. Workbook adapter now emits bare SHA-256 metadata and rejects zero-byte selected files. Checks: `npm test -- tests/master-catalog-import-payload.test.ts` passed 5 tests; `npm test -- tests/master-catalog-workbook-adapter.test.ts` passed 4 tests; `npm test` passed 11 files/53 tests; `npx tsc --noEmit --pretty false` passed; `npm run lint` passed with 12 existing warnings; `git diff --check` passed |

## 6. Blocker log

| Date/time | WP | Blocker | Decision needed | Status |
|---|---|---|---|---|
| 2026-07-05 11:03 +07 | WP-0 | WP-1 migration must not start until owner reviews this WP-0 readiness report | Owner approve/hold WP-1 start | Resolved 2026-07-05 11:08 +07; owner approved starting WP-1 |
| 2026-07-05 11:03 +07 | WP-0 | Existing Supabase advisor warnings need to be treated as baseline/triaged before later gates; no Phase 4-introduced advisor finding exists yet | Owner/reviewer confirm baseline triage path and any accepted-risk handling | Open |
| 2026-07-05 11:03 +07 | WP-0 | Approved local rehearsal snapshot source has not been taken in this session | Owner confirm approved read-only snapshot approach and exclusions before any later snapshot-based clean rehearsal | Open; WP-1 used existing local-only snapshots already present in repo |
| 2026-07-05 11:23 +07 | WP-1 | Legacy `2568.0.0` metadata backfill currently sets owner-approved effective date/reference/display name and item count, but leaves `dataset_hash` and `published_at` null until canonical hash/publish implementation is ready | Reviewer confirm this deferral remains acceptable for WP-1 foundation and is closed before publish constraints/P-12 | Open for WP-5; WP-2 produced canonical hash evidence without writing metadata |
| 2026-07-05 11:28 +07 | WP-1 | FK coverage review found eight missing left-prefix indexes, including seven introduced or used by Phase 4 foundation | No owner decision; implementation patch needed before WP-1 owner review | Resolved 2026-07-05 11:31 +07; patch applied and Local FK coverage query returned 0 missing rows |
| 2026-07-05 11:48 +07 | WP-2 | Local workbook `NT_Item_Code_Master_K_Mapping_2568.xlsx` has 708 candidate rows but Production default `2568.0.0` preflight has 710 catalog rows | Use Production `2568.0.0` as authority for names/units/prices; do not treat the local workbook as authoritative source data | Resolved 2026-07-05 11:50 +07; owner reaffirmed Production authority, local workbook is reference only |
| 2026-07-05 12:12 +07 | WP-2 | Payload/workbook validation contracts do not yet match the approved DB contract for import support hashes, request IDs, and positive source file size | Patch WP-2 implementation/tests to use bare 64-hex source/normalized payload hashes for `catalog_imports`, require UUID request IDs, and reject zero-byte source files unless owner amends the DB contract | Resolved 2026-07-05 12:20 +07; implementation/tests patched and focused/full verification passed |

## 7. Handoff note template

Use this template at the end of each implementation session:

```text
Current WP: WP-2
Status: Ready for owner review
Branch: codex/master-catalog-phase4
Latest commit: 57d3bf5
Files changed: migrations/016_master_catalog_phase4_foundation.sql; scripts/bootstrap-local-db.sh; tests/master-catalog-migrations.test.ts; docs/04_data/MIGRATIONS.md; docs/plans/master-catalog/25-phase4-execution-progress-tracker.md; lib/master-catalog/hash/canonicalDataset.ts; lib/master-catalog/import/types.ts; lib/master-catalog/import/parser-profiles/index.ts; lib/master-catalog/import/parser-profiles/nt-item-master-2568-v1.ts; lib/master-catalog/import/payload.ts; lib/master-catalog/import/workbookAdapter.ts; scripts/master-catalog-local-canonical-hash.mjs; tests/master-catalog-parser-hash.test.ts; tests/master-catalog-import-payload.test.ts; tests/master-catalog-workbook-adapter.test.ts
Evidence produced: WP-1 reviewer pass; draft root migration 016; static migration contract tests; Local Supabase reset/apply 009-016; Local DB coverage/RLS/grant evidence; local db lint; FK index coverage query returning 0 missing rows; migration SHA-256; WP-2 canonical dataset serializer/hash helper; approved parser profile contract; golden hash reproduction; parser/profile validation tests; normalized payload validation/hash tests; browser-style workbook adapter tests; Production-derived Local `2568.0.0` count/hash evidence `sha256:6e5bc5cd61b370a5988a4374758cd60b77a5dc1c22e04d81fd1520378c4b0fe0`; Production authority decision reaffirmed; owner-style review found WP-2 payload/DB contract mismatch; authority-document cross-check confirmed patch direction; WP-2 contract patch completed and verified
Tests/checks run: npm test -- tests/master-catalog-parser-hash.test.ts; npm test -- tests/master-catalog-import-payload.test.ts; npm test -- tests/master-catalog-workbook-adapter.test.ts; npm test -- tests/master-catalog-parser-hash.test.ts tests/master-catalog-import-payload.test.ts tests/master-catalog-workbook-adapter.test.ts; node scripts/master-catalog-local-canonical-hash.mjs; npm test; npm run lint; npx tsc --noEmit --pretty false; git diff --check; npm run db:local:bootstrap; npx supabase db lint --local; read-only Local DB evidence queries
Blockers: existing advisor baseline still needs later triage; fresh approved Production snapshot source not taken for later clean rehearsal; 2568.0.0 dataset_hash/published_at metadata write deferred until publish implementation
Owner decisions needed: review patched WP-2 evidence before starting WP-3
Next safe step: owner reviews patched WP-2 evidence, then start WP-3 admin read/draft UI shell behind disabled feature flag
Production touched: No
```
