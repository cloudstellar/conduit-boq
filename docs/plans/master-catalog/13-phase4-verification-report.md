# Master Catalog Phase 4 Verification Report

**Status:** In progress — WP-0 through WP-6 Local evidence recorded; WP-6.5 P-20/core live Local DB and the TH Sarabun New 16 pt replacement P-11 pair passed technically; owner artifact acceptance, remaining UI/lifecycle gates, WP-7, WP-8/UAT, and Production gates pending
**Prepared:** 2026-06-22
**Production project:** `otlssvssvgkohqwuuiir`
**Candidate version:** `2568.1.0` (version string reserved; publication metadata/P-15 pending)

## 1. How to use this report

Fill every applicable evidence cell. Use `Passed`, `Failed`, `Blocked`, or
`Not applicable` with a reason; do not leave an executed gate ambiguous.
Point-in-time counts must include timestamp/time zone and source. A failed
blocking gate stops the rollout.

Use the authority/evidence index in the
[Execution Progress Tracker](./25-phase4-execution-progress-tracker.md). This
report owns detailed executed results, commands, counts, and hashes; other plans
should link here rather than copy volatile evidence.

## 2. Execution summary

| Phase | Environment | Executor | Started | Completed | Result | Evidence |
|---|---|---|---|---|---|---|
| 4-0 documents/data decisions | Repository |  |  |  | Pending |  |
| 4A additive schema | Local |  |  |  | Pending |  |
| 4B application/workflows | Local |  |  |  | Pending |  |
| 4C clean rehearsal | Local |  |  |  | Pending |  |
| 4A migration | Production |  |  |  | Not authorized |  |
| Application deploy, flag off | Production |  |  |  | Not authorized |  |
| Feature enablement | Production |  |  |  | Not authorized |  |
| Publish `2568.1.0` | Production |  |  |  | Not authorized |  |
| Closeout | Production |  |  |  | Pending |  |

## 3. Approval gates

| Gate | Approver | Decision | Timestamp | Reference |
|---|---|---|---|---|
| Architecture Revision 8 | Owner | Approved for implementation/local rehearsal | 2026-07-04 | Owner chat approval; Production gates separate |
| Architecture Review Disposition | Owner | Approved as supporting disposition record | 2026-07-04 | External review is input only; Revision 8 remains authority |
| ADR-004 | Owner | Approved for implementation/local rehearsal | 2026-07-04 | Owner chat approval; Production gates separate |
| Phase 4 Change Request | Owner | Approved for implementation/local rehearsal | 2026-07-04 | Owner chat approval; Production gates separate |
| Decision Register | Owner | Approved as Phase 4 decision source of truth | 2026-07-04 | Owner chat approval; P-02 through P-08 recorded separately; P-09 version string, P-10 runtime CI assets, and P-11 export direction recorded separately; P-09 publication metadata plus final P-11 artifacts and P-12 through P-15 remain separate |
| Implement/local rehearsal | Owner | Approved via P-01 | 2026-07-04 | Architecture/contract package approved; local implementation only |
| DB/security contract | Owner | Approved for implementation/local rehearsal | 2026-07-04 | Owner chat approval; technical verification and Production migration separate |
| Threat model | Owner | Approved for implementation/local rehearsal | 2026-07-04 | Owner chat approval; reviewer verification and Production change separate |
| Parser/hash specification | Owner | Approved for implementation/local rehearsal | 2026-07-04 | Owner chat approval; Production import/publication and final data freeze separate |
| Official export specification | Owner | Approved for implementation/local rehearsal | 2026-07-04 | Owner chat approval; P-10/P-11, reviewer sign-offs, and Production publication separate |
| Post-Factor-F Adjustment Plan reviewed | Owner | Approved for implementation/local rehearsal | 2026-07-04 | Owner chat approval; Production gates separate |
| Implementation Execution Pack reviewed | Owner | Approved for WP-0 through WP-8 | 2026-07-04 | Owner chat approval; Production gates remain separate |
| Reliability plan/authority alignment | Owner | Approved for docs-only alignment | 2026-07-11 | Expanded WP-6.5/WP-7/WP-8 gates and P-20; no Local reset or Production authorization |
| P-11 staged artifact acceptance | Owner | Visual/content direction and Excel TH Sarabun New 16 pt refinement accepted; replacement pair technically verified and awaiting owner confirmation | 2026-07-11 22:04 +07 | Exact replacement pair from `777df75` passed semantic and visual file QA; WP-6 remains ready for owner review until the owner accepts the named binaries |
| P-20 identity/hash portability | Owner | Approved deterministic baseline identity from immutable Production-derived `price_list.id`; retain `identity_id` in lineage hash | 2026-07-11 12:11 +07 | WP-6.5C passed on 2026-07-11 with two owner-approved independent clean rebuilds on exact commit `1ad01b9`; rerun remains required after migration changes and at WP-8/P-15 |
| WP-6.5 Local-only start | Owner | Authorized | 2026-07-11 12:11 +07 | No unannounced Local reset, Production access/write, Factor F workflow change, hotfix scope expansion, placement UI, deploy, enablement, or publication |
| WP-6.5 destructive Local rebuilds | Owner | Two separate clean Local resets authorized | 2026-07-11 | Both approved rebuilds completed on exact commit `1ad01b9`; evidence provenance and hashes are recorded in Section 6.4 and the Tracker; Production touched: No |
| P-11 clean Local artifact rebuild | Owner | One additional clean Local reset authorized and completed | 2026-07-11 | Reset at `edf3570a` restored a no-audit canonical baseline before exact artifact generation; no WP-6.5 harness rerun and no Production access/write |
| Code dictionary | Owner | Approved as candidate dictionary/governance framework; P-02 through P-07 row/code decisions now recorded separately | 2026-07-04 | Owner chat approval; publication gates separate |
| Row reconciliation | Owner | Approved as draft evidence/framework; P-02 through P-07 row-level outcomes now recorded separately | 2026-07-04 | Owner chat approval; raw CSV is evidence, not import authority |
| Legacy `2568.0.0` publication metadata | Owner/records custodian | Approved via P-08 for baseline metadata backfill | 2026-07-04 | Effective `2026-01-01`; approval ref `เอ็นที วทฐฐ./405 ลงวันที่ 27 พ.ย. 2568`; approval doc date `2025-11-27`; publisher `ผู้จัดการฝ่ายท่อร้อยสาย (ทฐฐ.)` |
| NT CI runtime asset scope | Owner/brand custodian | Approved via P-10 for limited runtime derivatives | 2026-07-04 | Use [Doc #24](./24-phase4-nt-ci-runtime-asset-analysis.md); owner confirms NT CI asset rights for business use; `/CI/` source remains local-only; final P-11 owner acceptance remains pending |
| Production migration | Owner | Not requested; request after WP-8 evidence review |  | P-12 requires green evidence, fresh baseline/drift check, backup/restore, reviewed fingerprints, and owner go/no-go |
| Application deployment | Owner | Not requested; request after migration verification |  | P-13 requires CI/deployment fingerprint, disabled feature flag, smoke checks, and owner go/no-go |
| Feature enablement | Owner | Not requested; request after deploy/admin-only smoke verification |  | P-14 requires authorization checks, non-admin denial tests, and owner go/no-go |
| Publish named version |  | Not requested |  |  |

## 4. Known preparation baseline

Read-only Supabase MCP evidence on 2026-06-22:

| Check | Preparation baseline |
|---|---:|
| Price rows / distinct item codes | 710 / 710 |
| Missing code / name-unit / costs | 0 / 0 / 0 |
| Unit-cost mismatch | 0 |
| Version rows / active versions / pointers | 1 / 1 / 1 |
| Current version | `2568.0.0` active/default |
| BOQs / BOQ items / routes | 198 / 1,547 / 217 |

This is not a substitute for live preflight.

Post-Factor-F rollout closeout evidence on 2026-06-29 from
`docs/plans/factor-f/10-production-rollout-closeout.md`:

| Check | Observed result |
|---|---:|
| Latest migration ledger | `20260628190757_factor_f_repair_legacy_snapshot_metadata` |
| Price rows / default version | 710 / `2568.0.0` |
| Factor F default version | `2569.0.0` |
| Factor F active versions | `2566.0.0`, `2569.0.0` |
| BOQs / BOQs with price version gap | 206 / 0 at closeout only |
| Legacy BOQs bound to Factor F version by migration | 0 at closeout only |
| Legacy usable Factor F snapshots | 127 at closeout only |
| Legacy BOQs missing Factor F snapshot | 79 at closeout only |

These are point-in-time observations. Use them to understand the mixed BOQ
population, not as fixed rollout expectations. Users may create BOQs after
closeout, so every Phase 4 Production gate must use the live preflight table
below as the source of truth for total BOQs, bound Factor F BOQs, and legacy
snapshot states.

Production hotfix `016_hotfix_preserve_boq_item_suffix.sql` was applied and
merged into the Phase 4 branch on 2026-07-06 after PR #6 merged to `main`.
Post-hotfix Phase 4 evidence must prove the clean Local path applies
`009`-`015`, then hotfix `016`, then Phase 4 `017+`; pre-hotfix Local evidence
is not sufficient for WP-7/WP-8 readiness.

## 5. Fresh Production preflight

| Check | Expected | Actual | Timestamp/source | Result |
|---|---|---|---|---|
| Price rows | Approved live baseline |  |  | Pending |
| Distinct item codes | Equals price rows |  |  | Pending |
| Missing required values | 0 |  |  | Pending |
| Unit-cost mismatch | 0 |  |  | Pending |
| Duplicate item codes | 0 |  |  | Pending |
| Current active/default version | One expected version |  |  | Pending |
| Default pointer rows | 1 |  |  | Pending |
| BOQ version gaps/cross-version items | 0 |  |  | Pending |
| Factor F default version | Active expected default |  |  | Pending |
| Factor F version row counts/hashes | Match published metadata |  |  | Pending |
| BOQ Factor F binding split | Recorded live; no unexplained mutation |  |  | Pending |
| Legacy Factor F snapshot states | Recorded live; no partial repair regression |  |  | Pending |
| Factor F pointer mutation plan | No Phase 4 step may change it |  |  | Pending |
| Supabase advisor baseline | No new or untriaged Phase 4 security/performance finding |  |  | Pending |
| Unexpected active admin activity | 0 |  |  | Pending |
| Migration ledger drift | Latest includes Factor F `015` and hotfix `016`; no unexpected newer migration |  |  | Pending |

## 6. Backup and restore

| Check | Evidence | Result |
|---|---|---|
| Pre-migration encrypted logical backup |  | Pending |
| Manifest with table counts/fingerprints |  | Pending |
| Sensitive auth fields excluded |  | Pending |
| Restore to clean Local |  | Pending |
| Restored counts/checksums match |  | Pending |
| Rollback/fix-forward plan documented |  | Pending |
| Post-publish logical backup |  | Pending |

## 6.4 WP-6.5 implementation and live Local checkpoint

The initial 2026-07-11 14:09 +07 implementation checkpoint changed Local draft
migrations and code only; no Local reset or Production access occurred at that
point. After two explicit owner approvals, two separate clean Local rebuilds ran
on exact commit `1ad01b9268cec64c621266c3eb33b16a4325e627`. Each applied
`009`-`015`, hotfix `016`, and Phase 4 `017`-`019` in authority order. Production
was not accessed or written.

The first attempted bootstrap stopped fail-closed in `018` before `019` because
Postgres parsed an unparenthesized `IS DISTINCT FROM CASE ... END THEN`
condition ambiguously. Commit `f00cc20` parenthesized the expression. Harness
diagnostics were then hardened in `d95b04b`, `784700a`, and `1ad01b9`; those
diagnostic attempts are not retained evidence. Both named clean runs below
completed only after the fixes.

| Slice | Implemented evidence | Executed result | Remaining live/owner gate |
|---|---|---|---|
| A Idempotency | Stable client operation IDs; actor+payload request fingerprints; per-request advisory lock; same-ID mismatch error; definitive/uncertain state tests | Live create/apply/publish/restore exact replay and changed-payload rejection passed twice; concurrent publish/restore passed twice | Browser/UI timeout-after-commit and same-ID retry |
| B Guards/readiness | Shared private readiness helper/public admin RPC; P-18 new-identity guard; structured guard activates only after canonical rollout starts; inactive-row P-19 filing warning; import/publish Thai warnings | Live unchanged legacy-only clone passed; P-18 add and structured-recode drafts were blocked; rejected publication left status/metadata/pointer unchanged; passed twice | Intended-admin UAT; rerun on the final structured candidate |
| C P-20 | `017` maps baseline identity to `price_list.id`, fails on prior mismatch/collision/coverage defects, retains lineage hash; tracked two-run comparator | Passed: both independent clean rebuilds reproduced base `2568.0.0`, 710 rows, dataset hash `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`, and mapping SHA-256 `5f68993ce5aa5c7735b0d9e6de6d27946b4846fb8a6eb77d1b6b3bd6c4a73de7` on the same reviewed commit | Rerun after migration change and at WP-8/P-15 |
| D ADR-003 lifecycle | Generic version fields and reusable DB transition helper; annual/revision/patch, duplicate/backward/mixed tests | Unit/static negatives passed; live dynamically allocated high-revision create/publish passed twice | Live duplicate/nonmonotonic transition negatives before P-14 |
| E Export evidence | Tracked clean-tree atomic generator; semantic verifier locates headers, cross-checks visible/canonical fields, count/order/hash/types/formulas/links/PDF pages, regular paths, and binary hashes | Passed technically: exact replacement pair at `777df75`, embedded/independent verifier, 19-page PDF comparison, five-sheet workbook QA, typography scan, and unchanged post-export readback | Owner visual/content confirmation; rerun at WP-8 without replacing an accepted pair |
| F DB/concurrency | Tracked Local-only harness covers P-20 mapping, role denial, fingerprints, partial-write counts, readiness, publish/restore races, runtime timeout acceptance, pointer/BOQ/Factor F invariants | Passed twice on independent clean rebuilds; anonymous/non-admin denial, duplicate-code rollback, races, pointer restoration, 198 BOQs/1,547 BOQ items, and Factor F default `2569.0.0`/36 rows remained exact | WP-8 rerun; WP-7 owns permanent hotfix `016`/BOQ suffix/Factor F regressions |
| G UX/observability | Route loading/error/not-found; safe Thai recovery; bounded mutation/Excel/print operation logs and request correlation; current-base draft selection; Supplement whole-draft guard warning | Unit/type/full-build evidence passed | Browser failure/retry/accessibility and intended-admin UAT |
| H Documentation | Decision/architecture/DB/export/runbook/tracker/report alignment plus tracked consistency test | Authority test passed 4 checks across core links/table shapes/order/decisions/scripts; report updated with named live evidence | Final repository consistency rerun, commit review, and WP-8 rerun |
| Cross-cutting atomicity | Complete payload preflight, duplicate desired code rejection, per-code lock, mutation write subtransaction and structured abort | Passed twice live: rejected duplicate-code multi-row payload left version rows, identities, codes, change sets, and lock state unchanged | WP-8 rerun |

Retained Local evidence outputs (untracked by policy):

- run 1: `tmp/master-catalog/wp65-evidence/rebuild-1.json`, generated
  `2026-07-11T11:55:57.332Z`, file SHA-256
  `0662ff7a106e6fd9874ee4c722326cd23bdccb6643a280474e3e3abe0be47506`;
- run 2: `tmp/master-catalog/wp65-evidence/rebuild-2.json`, generated
  `2026-07-11T12:33:25.580Z`, file SHA-256
  `d7f1bedd73dbb8a771d0881370ff3936f31a6be5a9adbc5241d430ca521ca4fe`;
- comparator: passed at `2026-07-11T12:33:31.404Z`, same reviewed commit,
  no comparison failures; the separate owner approvals and rebuild provenance
  are recorded in the Tracker.

P-11 replacement and superseded Local artifact evidence (untracked by policy):

- a first post-harness pair under `20260711T125426128Z-edf3570a/` correctly
  showed two WP-6.5 restore audit rows and was rejected/superseded as
  owner-acceptance evidence;
- after a separate explicit owner approval, a clean bootstrap at
  `edf3570a86300036cc4c16c82f5459282cde4cab` applied `009`-`015`, hotfix
  `016`, then `017`-`019`, passed bootstrap smoke, and restored zero change
  sets/items/imports before generation;
- the pair under
  `output/master-catalog/review-artifacts/20260711T141050812Z-edf3570a/`
  passed embedded and independent semantic verification with no failures, but
  was superseded before owner acceptance by the Excel TH Sarabun New 16 pt
  refinement;
- the exact replacement pair under
  `output/master-catalog/review-artifacts/20260711T145832108Z-777df759/`
  came from commit `777df7598c8aa96a17f3665db5131e5fb5397b96` without
  another DB reset or harness run and passed embedded/independent semantic,
  five-sheet workbook, typography, and 19-page PDF QA;
- post-export Local readback remained zero change sets/items/imports with
  pointer `2568.0.0`, dataset hash
  `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`,
  feature flag disabled, 198 BOQs/1,547 BOQ items, and Factor F default
  `2569.0.0`; Production was not accessed or written.

## 6.5 Production readiness review

Use this section after WP-8 and before requesting P-12. Any missing, stale,
failed, ambiguous, or mismatched row blocks the Production request until it is
fixed and reviewed.

| Check | Expected | Evidence | Result |
|---|---|---|---|
| WP-8 clean Local rehearsal | Passed with no unresolved blocker |  | Pending |
| Reviewed migration fingerprint | Filename and SHA-256 match approved file |  | Pending |
| Repository/deployment fingerprint | Exact branch, commit, CI, and deploy artifact recorded |  | Pending |
| Fresh Production preflight | Live counts, pointer, Factor F, BOQ split, and drift recorded |  | Pending |
| Backup/restore gate | Fresh backup manifest and clean Local restore test pass |  | Pending |
| Hotfix `016` / migration order | Remote ledger includes `016`; clean Local bootstrap applies `009`-`015`, hotfix `016`, then Phase 4 `017+` before WP-8 evidence is accepted | Local authority order passed in both `1ad01b9` evidence rebuilds and the clean `edf3570a` artifact rebuild; fresh Production ledger check has not run | Local passed; Production/WP-8 pending |
| End-to-end request idempotency | UI/action/DB reuse one operation ID after timeout; changed payload with same ID rejects | DB exact replay and changed-payload rejection passed live for create/apply/publish/restore; browser timeout-after-commit not yet exercised | Partial; UI evidence pending |
| Live DB integration/concurrency | Migrations, RPC/RLS/roles, rollback, two-session publish/restore, and lock timeout pass | WP-6.5 harness passed twice on independent clean rebuilds; lock timeout configuration accepted and races had one deterministic winner | Passed WP-6.5; rerun WP-8 |
| P-20 hash portability | Approved clean-reset/cross-environment identity/hash model passes | Two clean rebuilds on the same reviewed commit reproduced the 710-row dataset and identity mapping hashes exactly | Passed WP-6.5; rerun WP-8/P-15 |
| ADR-003 reusable version lifecycle | Another valid annual/revision/patch version passes; no reusable hardcoding to `2568.1.0` | Generic implementation/unit fixtures pass; live dynamically allocated high-revision create/publish passed twice | Partial; live invalid transitions pending |
| Tracked export verifier | Clean-checkout semantic Excel/PDF verification passes | Exact `777df75` replacement pair passed embedded generation verification and independent rerun with no failures; manifest contains regular paths, binary hashes, 710 rows, and P-20 dataset hash | Passed technically; owner P-11 acceptance and WP-8 rerun pending |
| Admin UAT and recovery | Intended admin completes core workflow and representative failures without developer/SQL assistance |  | Pending WP-8 |
| 710-row performance baseline | Import preview, readiness, export, and admin interactions meet reviewed budget |  | Pending WP-8 |
| Authority/document consistency | Migration/WP order, decision IDs, authority links, and Markdown table shapes agree | Tracked consistency test passed 4 checks across the core authority set | Passed checkpoint; rerun at WP-8 |
| BOQ regression | Current BOQ flows and historical version links unchanged | WP-6.5 pre/post summary remained 198 BOQs/1,547 items in both clean runs; permanent suffix/save/print/export suite remains WP-7 | Partial; WP-7 pending |
| Factor F before/after assertion | Pointer, rows, hashes, grants, RLS, and BOQ bindings unchanged | WP-6.5 pre/post summary retained default `2569.0.0`, 36 rows, and BOQ bindings; full structural/regression suite remains WP-7 | Partial; WP-7 pending |
| Advisors | No unresolved Phase 4 blocker |  | Pending |
| Feature flag | Disabled by default before migration/deploy |  | Pending |
| P-12 readiness package | Evidence reviewed before Production migration request |  | Pending |
| P-13 readiness package | Evidence reviewed after migration verification and before deploy request |  | Pending |
| P-14 readiness package | Evidence reviewed after deploy/admin smoke and before enablement request |  | Pending |
| P-15 separation | Publication not implied; final metadata/diff/count/hash/export approval still separate |  | Pending |

## 7. Reconciliation and code governance

| Check | Expected | Actual | Result |
|---|---:|---:|---|
| Production UUID coverage | 710 |  | Pending |
| Workbook rows with outcome | 708 |  | Pending |
| Exact price matches reproduced | 648 |  | Pending |
| Price-difference matches reproduced | 42 |  | Pending |
| Production-only decisions | 20 | P-04 owner decision: retain all 20 Production-only rows; assign 19 canonical codes and keep `ITEM-0139` as temporary legacy code under P-02 controls | Approved |
| Workbook-only deferred/approved decisions | 18 raw / 17 unresolved | P-05/P-07 owner decisions: raw workbook evidence has 18 workbook-only rows; workbook `FTW-CON-002` is a typo shadow of Production `ITEM-0491`, so only 17 unresolved supplement candidates remain deferred with item authority, price authority, corrected taxonomy/code, approval, import preview/reconciliation, and hash/publish verification gates | Approved |
| HDPE Crossing blockers unresolved | 0 | P-03 owner decision: reject GIP classification; split HDPE Crossing to `CRS-H06`/`CRS-H08`; defer workbook-only `CRS-GIP-025`; `ITEM-0139` handled under P-04 | Approved |
| Duplicate identity decision unresolved | 0 | P-02 owner decision: retain both `ITEM-0131` and `ITEM-0139`; `ITEM-0139` future retirement requires live BOQ refs = 0 plus owner/data-custodian confirmation; no UUID/history merge | Approved |
| AAA/TTT group meanings approved | 22 `AAA` / 65 `AAA-TTT` | P-06 owner decision: approve group meanings for dictionary/backfill; not import, row-count, workbook-only, K-mapping, or P-07 wording approval | Approved |
| Temporary legacy-code null group exceptions | 1 | P-06 owner decision: only `ITEM-0139` in `2568.1.0` may have `code_group_id is null`; assert no other active structured-version row has a null group | Approved |
| `FTW-CON-002` wording disposition | 1 | P-07 owner decision: use Production `ITEM-0491` wording for canonical `FTW-CON-002`; reject workbook repeated-phrase row as typo shadow; do not import workbook wording, create a duplicate item, change identity/history, or clean Production whitespace without a separate wording correction | Approved |
| Canonical code reused across identity | 0 |  | Pending |
| Missing reviewer/date on exceptions | 0 |  | Pending |

Approved reconciliation fingerprint: `____________________________`

Approved dictionary fingerprint: `_______________________________`

## 8. Local schema verification

| Check | Expected | Actual/evidence | Result |
|---|---|---|---|
| Clean reset + migrations | Success, including `009`-`015`, hotfix `016`, and Phase 4 `017+` in order | Two separately approved WP-6.5 bootstraps completed on `1ad01b9`; a third separately approved clean artifact bootstrap completed on `edf3570a`. All applied `009`-`015`, `016`, and `017`-`019` and passed bootstrap smoke. | Passed WP-6.5/P-11; rerun WP-8 |
| 710 identities/legacy code registrations | Exact | Both retained runs read 710 baseline rows and proved every baseline `identity_id` equals its immutable Production-derived `price_list.id`; mapping SHA-256 `5f68993ce5aa5c7735b0d9e6de6d27946b4846fb8a6eb77d1b6b3bd6c4a73de7` | Passed P-20 identity scope |
| Published baseline identity merges | 0 | Deterministic one-row-to-one-identity mapping covered all 710 baseline rows in both clean rebuilds; no identity merge step exists in the P-20 mapping | Passed WP-6.5 |
| Category backfill | Approved count |  | Pending |
| Display-order backfill | Unique `ITEM-####` numeric suffix; 710 covered |  | Pending |
| New-item display order | Current mechanical default is prior maximum + 1 for draft allocation only; WP-6.5 must reject publishing any draft containing identities absent from the base version until P-18 placement governance is approved | Live add fixture reported one new identity, readiness `canPublish=false`, and publish returned `P18_PLACEMENT_REVIEW_REQUIRED` without pointer/metadata mutation in both runs | Guard passed; P-18 placement pending |
| Import parser profile ID/version stored | Exact |  | Pending |
| Code allocation at sequence 900 | Blocking capacity-review error |  | Pending |
| New structured version rows | 710 before approved add/retire |  | Pending |
| New foreign keys indexed | All |  | Pending |
| Unique version/code and version/identity | Enforced |  | Pending |
| Unit-cost check validated | Enforced |  | Pending |
| Published row/metadata immutability | Enforced |  | Pending |
| Pointer/legacy `is_default` consistency | Exact | Concurrent publish/restore and cleanup restored one pointer/default to `2568.0.0` in both retained runs | Passed WP-6.5 |
| New `catalog_admin_enabled` value type/default | JSON boolean / `false` | Clean bootstrap and final cleanup readback returned disabled/`false` | Passed WP-6.5 |
| Private mutation functions unexposed | Confirmed |  | Pending |
| Data API grants explicit | Confirmed |  | Pending |
| Publish/restore advisory lock behavior | Serialized; no competing pointer mutation | Two-client publish and restore races each produced one winner and one stable rejection/lock outcome; exact duplicate winner request returned the prior result; pointer remained singular and was restored | Passed WP-6.5 |
| `boq.factor_reference_version_id` FK/index/immutability trigger | Preserved |  | Pending |
| Factor F version tables/pointer/RLS/grants | Unchanged by Phase 4 migration | Runtime summary was identical before/after both harnesses: default `2569.0.0`, 36 default rows; no Factor F workflow was added or changed | Runtime invariant passed; structural WP-7/WP-8 checks pending |
| `save_boq_with_routes` replacement, if any | Preserves price version, Factor F version, and hotfix `016` BOQ item suffix contracts | Both authority bootstraps passed the existing hotfix suffix/category/catalog-authoritative cost smoke; BOQ count/items remained 198/1,547 during WP-6.5 | Bootstrap smoke passed; permanent WP-7 suite pending |

## 9. RLS and authorization matrix

| Actor | Read published catalog | Read admin audit | Mutate draft | Publish/restore | Result |
|---|---|---|---|---|---|
| Anonymous | No | No | No | No | Partial: draft-create execution denied live twice; read/audit/publish matrix remains WP-8 |
| Authenticated non-admin | Approved published read only | No | No | No | Partial: staff draft create returned `FORBIDDEN` and admin readiness read was denied live twice; remaining matrix is WP-8 |
| Pending/inactive admin profile | No admin access | No | No | No | Pending |
| Active admin | Yes | Yes | Yes | Yes | Partial: two active-admin sessions created/mutated/published/restored and read readiness live; full read/audit UAT remains WP-8 |
| Direct REST write to audit/import table | N/A | N/A | Rejected | Rejected | Pending |

Also verify:

- update policies have required select visibility;
- policy columns/functions use appropriate indexes and `(select auth.uid())`
  pattern where applicable;
- no `user_metadata` controls authorization;
- no secret/service-role key in client bundle;
- public wrappers revoke `PUBLIC` and `anon` execution;
- definer functions have empty `search_path`, fully qualified objects, approved
  owner, and unexposed private schema;
- direct authenticated table writes fail even for active admin;
- feature flag never substitutes for role/status authorization.

## 10. Parser and import verification

| Test | Expected | Result/evidence |
|---|---|---|
| Exact workbook/profile | Detected | Pending |
| Wrong sheet/header/profile | Clear rejection | Pending |
| Formula/error/nonnumeric required cell | Rejected | Pending |
| Macro/external link/embedded object | Never executed or persisted | Pending |
| File >20 MB | Client rejection | Pending |
| Rows >1,500 | Rejected | Pending |
| Normalized body >750 KB | Client and server rejection | Pending |
| K fields | Excluded/rejected | Pending |
| Full omission | Retires only after warning/approval | Pending |
| Full retirement below threshold | Warning + exact diff; no bulk approval required | Pending |
| Full retirement at `max(10, ceil(2%))` | Apply blocked without typed count and owner reference | Pending |
| Supplement omission | Leaves unchanged | Pending |
| Unauthorized price delta | Rejected | Pending |
| Client-tampered payload | Server rejection | Pending |
| Duplicate request ID | One effect/consistent result | Local WP-4 import duplicate evidence passed; WP-6.5 create/manual apply/publish/restore exact replay also passed twice |
| Timeout after import apply commit | Retry reuses same client-owned apply ID and returns prior result | Pending WP-6.5 |
| Import status lifecycle | UI-only preview; `validated/rejected`; one transition to `applied` | Pending |
| Import invalid status transition | Rejected without partial apply | Pending |
| Validation/apply request IDs | Separate and idempotent | Pending |
| Import full old/new snapshots | Complete | Pending |
| Filed source independently rehashed | Matches recorded client fingerprint | Pending |

## 11. Manual change and history

| Test | Expected | Result/evidence |
|---|---|---|
| Manual add/edit/retire/recode on draft | Success with reason | Pending |
| Same actions on published version | Rejected | Pending |
| Blank reason | Rejected | Pending |
| Stale lock version | `DRAFT_LOCK_CONFLICT` | Pending |
| Stale base version | Old draft read-only/nonpublishable; recreate and reapply | Pending |
| History through recode | Same identity timeline | Pending |
| Actor/display name/timestamp/source | Complete | Pending |
| Audit update/delete | Rejected | Pending |
| Manual/create uncertain retry | Same operation ID, payload, effect, and audit result after timeout; changed payload with same ID rejected | Database exact replay and changed-payload mismatch passed live for create/manual apply; UI timeout-after-commit path remains pending |

## 12. Publication tests

| Test | Expected | Result/evidence |
|---|---|---|
| Missing approval evidence | Rejected | Passed in Local WP-5 smoke: `PUBLICATION_METADATA_REQUIRED`; pointer stayed on `2568.0.0` |
| Stale base pointer | `DRAFT_BASE_STALE` | Passed in Local WP-5 smoke: a transient local-only active pointer fixture moved the singleton pointer under an existing draft; publish returned `DRAFT_BASE_STALE`, did not move the fixture pointer, and cleanup restored the pointer to `2568.0.0` before the real local publish |
| Duplicate publish request ID | No duplicate effect | Passed in Local WP-5 smoke; duplicate publish returned `duplicateRequest=true` |
| UI/action publish retry after uncertain response | Same client-owned request ID reaches DB and returns the prior result | DB exact replay and changed-payload mismatch passed twice; browser/UI timeout-after-commit remains pending |
| Two-session publish/restore race | One deterministic outcome, one stable conflict/timeout, singleton pointer remains exact | Passed twice on independent clean Local rebuilds; one winner, one stable rejection/lock outcome, exact duplicate replay, and pointer cleanup to `2568.0.0` |
| Publish transaction | Atomic | Passed in Local WP-5 smoke and browser proof; rejected publish attempts did not move pointer, successful publish moved pointer/metadata/audit together, and the admin UI showed publish change-set evidence after submit |
| Publish invalid status transition | Rejected without pointer movement | Passed in Local WP-5 smoke: active-version republish rejected as `VERSION_NOT_PUBLISHABLE` |
| P-18 add/supplement publish guard | Draft with any `identity_id` absent from its base version rejects with `P18_PLACEMENT_REVIEW_REQUIRED`; no pointer, metadata, BOQ, or Factor F state changes | Passed twice live: one-new-identity draft had `canPublish=false`, rejected with the expected code, stayed draft with null publication metadata, and left pointer/BOQ/Factor F state unchanged |
| Structured-code legacy exception guard | Guard activates when any active canonical structured code exists, then rejects if active legacy `ITEM-####` rows exceed `ITEM-0139`; unchanged legacy-only clone remains valid | Passed twice live: unchanged legacy-only clone remained publishable; structured recode activated the guard, counted unapproved legacy rows, and publication rejected atomically. Final candidate rerun remains required. |
| Dataset count/hash from DB | Stored | Historical WP-5/browser proof used pre-P-20 clean-reset hash `sha256:4a2a5fcc75f1510c5e037426a19c3110234856485157e5de6f3bd2eee459d1e8`. The approved deterministic P-20 model reproduced `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8` in both clean rebuilds, and the exact P-11 pair now uses that value. |
| ADR-003 reusable version path | Create/publish validation supports another valid annual/revision/patch fixture without reusable `2568.1.0` hardcoding | Generic unit/static cases passed; live dynamically allocated high-revision create/publish passed twice. Live invalid transitions remain before P-14. |
| Pointer and `is_default` sync | Exact | Passed in Local WP-5 smoke and browser proof: publish moved pointer/default to `2568.1.0`; restore moved both back to `2568.0.0` |
| Previous version remains readable | Yes | Passed in Local WP-5 smoke: former current `2568.0.0` remained `active` and readable |
| Former current version after publish | Still Published/Active; immutable; not automatically archived | Passed in Local WP-5 smoke: `2568.0.0` stayed `active`, non-default after publish, then restored |
| Published row mutation | Rejected | Passed in Local WP-5 smoke: service-role row update blocked by `CATALOG_PUBLISHED_ROW_IMMUTABLE` |
| Pointer restore | Audited; BOQs unchanged | Passed in Local WP-5 smoke and browser proof: restore change set inserted, pointer returned to `2568.0.0`, `2568.1.0` remained active/non-default, and BOQ count stayed `198` |
| Factor F pointer after catalog publish | Unchanged from preflight | Passed in Local WP-5 smoke and browser proof: Factor F default/version/hash/count unchanged (`2569.0.0`, 36 rows, `sha256:4f35b267bde3007439aebb193be1e53bdcea5a7acce95b5a7bbf5828018ef1a6`) |
| BOQ Factor F bindings after catalog publish | No mutation | Passed in Local WP-5 smoke and browser proof: BOQ count and catalog/factor binding split unchanged; final readback after browser publish/restore showed BOQ count `198` |

## 13. Canonical hash and export

| Check | Expected | Actual | Result |
|---|---|---|---|
| Golden fixture hash | `sha256:0e90d8974960a5ccd52b22b02eb0a6c60797f9234baeaefc32af8c1f9fa719b5` | Passed in canonical hash tests; full suite includes the golden fixture | Passed |
| P-20 identity/hash portability | Approved deterministic `price_list.id` baseline identity and lineage hash reproduce across clean approved environments | Two independent clean rebuilds on exact commit `1ad01b9` reproduced 710 identities, dataset hash `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`, and mapping SHA-256 `5f68993ce5aa5c7735b0d9e6de6d27946b4846fb8a6eb77d1b6b3bd6c4a73de7`; comparator had no failures | Passed WP-6.5; rerun WP-8/P-15 |
| Published item count | Approved count | Exact Local P-11 pair for selected `2568.0.0` contains 710 workbook price rows, 710 verification rows, and 710 PDF DOM rows; selected-version data loader fails closed on item-count mismatch | Passed technically; owner file acceptance pending |
| Published dataset hash | One stored value | Exact Local P-11 pair and manifest contain `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`; workbook reconstruction, PDF proof, DB readback, and tracked verifier agree. Historical pre-P-20 visual hashes are superseded for final acceptance. | Passed for exact pair; owner acceptance pending |
| Selected-version export paging | No silent fixed-limit truncation before count/hash verification | Export data loader now reads selected price rows, categories, code groups, change sets, imports, and change items through deterministic paged queries; `tests/master-catalog-export-data.test.ts` covers a 1,001-row selected version and verifies all rows are counted/hashed | Passed automated fixture |
| Excel visible business-row count/order | Exact match | Exact replacement workbook under `review-artifacts/20260711T145832108Z-777df759/` has 710 price data rows and 710 verification rows; all five expected sheets are visible and ordered; `priceSequenceBreakCount=0`; the clean change summary has no WP-6.5 harness audit rows | Passed exact Local artifact inspection; owner acceptance pending |
| Excel `_canonical_row_json` reconstruction | Exact UTF-8 dataset hash | Tracked verifier reconstructs `[` + ordered `_canonical_row_json` + `]\n`; exact workbook rehash matched `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8` | Passed automated fixture and exact Local artifact inspection |
| PDF server-verified printed count/hash/order | Exact match | Exact replacement PDF proof loaded Local `2568.0.0`, DOM row count 710, first/last sequence 1/710, unique sequence count 710, `sequenceBreakCount=0`, 18 price sections/19 physical pages, title/full hash/watermark present, and embedded verifier passed | Passed exact Local artifact proof; owner acceptance pending |
| New/supplement item placement acceptance | Owner/data-custodian approved position before publish; no official version relies only on append-at-end ordering for added/supplement rows | P-18 recorded after WP-6 review. The live WP-6.5 guard now prevents publication of add/supplement/new-identity drafts. Placement preview/review remains a separate governance workflow. | Guard passed; P-18 placement pending when applicable |
| Inactive/retired row official PDF policy | Any version with inactive/retired rows has an approved field-facing PDF rendering/exclusion policy before final filing | P-19 recorded 2026-07-07. Current 710-row `2568.0.0` proof has no inactive rows; future retired-row versions require owner/data-custodian policy before P-15 filing | Pending P-19 when applicable |
| Structured-code completeness before candidate publication | Once a draft contains an active canonical `AAA-TTT-NNN` code, active rows have approved code groups except the recorded temporary `ITEM-0139` exception; no other active legacy `ITEM-####` row may publish | Live unchanged-clone positive control and structured-recode rejection passed twice. The approved final structured candidate must still be validated against the exact dictionary/data fingerprint before P-15. | WP-6.5 guard passed; final candidate pending |
| Older-version export | Uses selected version | `tests/master-catalog-export-data.test.ts` now covers requesting an older selected published version while the current pointer remains on another version; the loader keeps `version.id`, `versionString`, count/hash, Current Default status, and filename tied to the explicit selected version | Passed automated fixture |
| Draft export status mark | `DRAFT – ห้ามใช้อ้างอิง` | `tests/master-catalog-export-data.test.ts` covers active-admin draft export as non-official with a `DRAFT-` filename; `tests/master-catalog-export-excel.test.ts` verifies the workbook document sheet and price sheet include `DRAFT – ห้ามใช้อ้างอิง` plus non-official draft hash wording | Passed automated fixture |
| PDF price-disclaimer watermark | Matches approved three-line wording and style from `files/รายการบัญชีราคามาตรฐานงานก่อสร้างท่อร้อยสาย 2568.pdf`: `รายการบัญชีราคานี้ไม่ใช่ราคาก่อสร้างที่แท้จริงหรือถูกต้องตรงกับราคาก่อสร้าง`; `แต่เป็นเพียงราคาโดยประมาณซึ่งใกล้เคียงกับราคาก่อสร้างจริงเท่านั้น`; `(สำหรับกิจการ บมจ.โทรคมนาคมแห่งชาติ เท่านั้น มิให้เผยแพร่ก่อนได้รับอนุญาต)` | Exact retained PDF has no cover watermark and one three-line red overlay watermark per price page; all 19 pages were rendered, inspected, and found free of clipping/blank-page anomalies | Passed exact Local visual artifact proof; owner acceptance pending |
| Published stamp | Field-facing PDF cover shows organization, `ฉบับบัญชีราคา`, Thai status, effective date, item count, and full hash. It excludes Current Default, approval reference/date, approved-by/publisher, exported at/by, generated-by, and export-spec fields; a non-current published version instead shows a Thai retrospective-reference warning. | Fresh Local route/PDF proof on 2026-07-11 confirmed only retained fields appear; count/hash/order/watermark checks passed. | Passed Local review; final owner/file acceptance pending |
| PDF cover layout refinement | Larger top-centered NT company lockup, document title, and a distinct `ประจำปี 2568` line of the same title size and weight; a separate centered upper-middle metadata table contains only `ฉบับบัญชีราคา`, Thai status, effective date, item count, and full hash. No duplicate company/status text appears in the header. | Exact replacement Local `2568.0.0` PDF passed route/render proof: 19 pages/18 price sections, 710 rows, sequence 1-710 without breaks, full hash, watermark, and no clipping regression. All rendered pages were byte-identical to the prior visual proof. PDF SHA-256 is `e9e793c4880956fede05b7dee098e24fb0c6bc1b25c8e74f843f1afcfad76eff`. | Passed technically; owner file acceptance pending |
| Excel numeric cell types | Numeric, formatted | `tests/master-catalog-export-excel.test.ts` confirms price cost cells are numeric and formatted `#,##0.00` | Passed automated fixture |
| Excel exact 5 sheets/headers; no formulas/external links | Exact | `tests/master-catalog-export-excel.test.ts` confirms exact five sheets/order, business headers, verification headers, and no formula/hyperlink cell values | Passed automated fixture |
| Tracked semantic artifact verifier | Runs from clean checkout; finds headers by name; derives ranges; verifies schema/sheets/count/order/hash/types/visible-field consistency/formulas/links/PDF pages and binary hashes | Exact `777df75` manifest passed embedded verification and independent `npm run artifacts:master-catalog:verify -- output/master-catalog/review-artifacts/20260711T145832108Z-777df759/artifact-manifest.json`; failures were empty | Passed technically; owner visual confirmation and WP-8 rerun pending |
| Excel document-language and typography alignment | Thai title/year hierarchy, Thai user-facing metadata labels, canonical verification identifiers unchanged, and every populated cell uses TH Sarabun New with body size at least 16 pt | Artifact-tool rendered all five sheets without formula errors or clipping. Direct binary inspection found 20,808 populated cells, all TH Sarabun New, minimum 16 pt, zero bad typography/formulas/hyperlinks, verification fixed row height 22, and actual blank structured cells remained empty. Excel SHA-256 is `9e7622fb1a269ebe96c45af69d339162b32f42143ce304caa13a520587ae3a07`. | Passed technically; owner file acceptance pending |
| Formula-control text safety | Malicious strings remain inert text | `tests/master-catalog-export-excel.test.ts` covers formula-looking item text and confirms no formula/hyperlink cell values | Passed automated fixture |
| PDF Thai font/header/page/clipping | Correct | Exact PDF metadata shows A4, 19 pages, tagged, and no form/JavaScript/encryption. Resources include embedded/subset `/NTRegular`, `/NTBold`, and `/Menlo-Regular`. All 19 Poppler-rendered pages stayed inside safe bounds with no edge clipping or anomalous blank page; inspected content retains lockup, title, repeated headers, Thai footer/page numbers, row 527 on one line, and acceptable final-page whitespace. | Passed exact Local visual artifact proof; owner acceptance pending |
| Short dataset hash | Exactly `sha256:` + first 12 hex + `…`; full hash also present | Admin/export short-hash helper now preserves the `sha256:` prefix and emits only the first 12 hash hex characters plus `…` for dataset hashes, while full hashes remain on the version detail/export stamp and official Excel/PDF proof artifacts; covered by `tests/master-catalog-admin-read-model.test.ts` | Passed automated fixture |
| Catalog export dataset/hash excludes Factor F rows | Confirmed | `tests/master-catalog-export-data.test.ts` verifies the selected-version export loader calls no BOQ or Factor F tables in the normal published export path | Passed automated fixture |
| BOQ print/export regression | Catalog version and Factor F version/snapshot labels still correct |  | Pending |
| BOQ item suffix preservation | Saving BOQ items preserves approved suffix labels such as `(Main Duct)` and `(Riser)` while catalog unit, price, and category remain authoritative |  | Pending WP-7 |

Official export file/reference and binary SHA-256 (different from dataset hash):

The following exact Local P-11 replacement pair is technically verified but is
not a Production filing. If the owner accepts these binaries, preserve them and
their hashes without regeneration; Production filing remains a later
P-15/release gate.

- directory: `output/master-catalog/review-artifacts/20260711T145832108Z-777df759/`
- source commit: `777df7598c8aa96a17f3665db5131e5fb5397b96`
- Excel: `NT-Master-Catalog-v2568.0.0-20260101.xlsx`
- Excel binary SHA-256: `9e7622fb1a269ebe96c45af69d339162b32f42143ce304caa13a520587ae3a07`
- PDF: `NT-Master-Catalog-v2568.0.0-20260101.pdf`
- PDF binary SHA-256: `e9e793c4880956fede05b7dee098e24fb0c6bc1b25c8e74f843f1afcfad76eff`
- print HTML SHA-256: `58fbbff501f97d8b4c64c03b4b481098af1bc429269ad3cabc06e7e155bbeeff`
- dataset hash: `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`

The earlier post-harness pair under `20260711T125426128Z-edf3570a/` is rejected
because its workbook correctly includes two WP-6.5 restore audit rows. The
later `20260711T141050812Z-edf3570a/` pair passed technically but is superseded
by the approved Excel typography refinement. Historical hashes elsewhere in
this report remain point-in-time history and must not be substituted for the
exact replacement pair above.

## 14. Application regression and UI/UX

| Flow/check | Desktop | Mobile | Result/evidence |
|---|---|---|---|
| Dashboard |  |  | Pending |
| Price List search/count |  |  | Pending |
| BOQ list/search |  |  | Pending |
| Create BOQ |  |  | Pending |
| Edit/save BOQ |  |  | Pending |
| BOQ item suffix preservation on save |  |  | Pending |
| Duplicate Preserve |  |  | Pending |
| Print “แบบ ปร.1” |  |  | Pending |
| Existing BOQ export |  |  | Pending |
| Existing version-bound BOQ Factor F label |  |  | Pending |
| Existing legacy snapshot-only BOQ print/export |  |  | Pending |
| Existing legacy missing-Factor-F BOQ failure state |  |  | Pending |
| Catalog version list/detail |  |  | Pending |
| Import/diff/manual/history |  |  | Pending |
| Add/retire blocker shown before apply/publish |  |  | Pending WP-6.5/P-18/P-19 |
| Loading/error/not-found and retry/back paths | Route states implemented; browser proof not run |  | Pending live WP-6.5/UAT |
| Thai user message + safe code/request ID | Mutation/route/export correlation implemented; browser recovery proof not run |  | Pending live WP-6.5/UAT |
| Keyboard/focus/errors/contrast |  |  | Pending |
| Font/logo/color/spacing | Local export artifact proof | PDF uses `next/font/local` NT Regular/Bold derivatives and the full NT company lockup; approved Excel exception uses TH Sarabun New with a 16 pt body baseline while preserving dataset-hash semantics | PDF passed; replacement Excel visual proof pending; app-wide/primary-logo provenance reconciliation remains under P-10 |
| Browser console/server errors |  |  | Pending |
| Intended-admin UAT without developer/SQL help |  |  | Pending WP-8 |
| 710-row interaction/import/export performance |  |  | Pending WP-8 |

Structured log review must show operation, outcome, duration, version and
request ID for representative failure/success cases without raw workbook rows,
normalized payload, cookie/key, SQL, or approval-document content.

Dashboard personal/system labels must remain unchanged unless a separate change
request approves them.

## 15. Quality and advisor gates

| Gate | Expected | Actual | Result |
|---|---|---|---|
| `npm test` | Exit 0 | 2026-07-11 19:45 +07: 25 files / 120 tests passed, including authority, idempotency, P-20, artifact, observability, stale-draft, and migration contracts | Passed |
| `npx tsc --noEmit --pretty false` | Exit 0 | 2026-07-11 19:45 +07: passed | Passed |
| `npm run lint` | Exit 0 | 2026-07-11 19:45 +07: exit 0 with 10 existing warnings outside this Phase 4 checkpoint | Passed with existing warnings |
| `npm run build` | Exit 0 | 2026-07-11 14:09 +07: escalated network build passed, including `/admin/master-catalog/versions/[versionId]/print` and `/api/master-catalog/export/excel/[versionId]`; network is required for existing Google Fonts fetch | Passed |
| `npm run audit:prod` | No unaccepted Production vulnerability |  | Pending |
| Live Local DB integration/concurrency | Migration/RPC/RLS/role/rollback/race/timeout gates pass | Harness passed twice on independent clean rebuilds at `1ad01b9`; named outputs and hashes recorded in 6.4; `npx supabase db lint --local --level error --fail-on error` found no schema errors | Passed WP-6.5; rerun WP-8 |
| Permanent hotfix `016`/BOQ/Factor F suite | Real RPC behavior and pre/post invariants pass |  | Pending WP-7 |
| Tracked export artifact verification | Semantic verifier passes from clean checkout | Exact `777df75` replacement pair passed embedded and independent semantic verification; five verifier fixtures also pass | Passed technically; owner P-11 acceptance and WP-8 rerun pending |
| Documentation consistency | Authority links/table shapes, migration order, WP order, and decisions agree | `tests/master-catalog-authority-consistency.test.ts`: 4 checks passed | Passed checkpoint; rerun at WP-8 |
| Security advisor | No new blocker |  | Pending |
| Performance advisor | No rollout blocker |  | Pending |
| CI exact commit | Passed |  | Pending |
| Vercel Preview/Production | Passed |  | Pending |

Accepted warnings require owner/technical rationale and remediation owner/date:

| Warning | Rationale | Owner | Due date |
|---|---|---|---|
|  |  |  |  |

## 16. Final state

| State | Expected | Actual | Result |
|---|---|---|---|
| Feature flag | Approved final value |  | Pending |
| Current pointer | Approved version |  | Pending |
| Pointer row count | 1 |  | Pending |
| Legacy flag agreement | Exact |  | Pending |
| Historical BOQs rewritten | 0 |  | Pending |
| Historical BOQ `factor_reference_version_id` mutations | 0 |  | Pending |
| Factor F default pointer/hash changed by Phase 4 | 0 |  | Pending |
| Pre/post backup filed | Yes |  | Pending |
| Official Excel/PDF filed | Yes |  | Pending |
| Release note complete | Yes |  | Pending |

## 17. Sign-off

| Role | Name | Decision | Timestamp | Notes |
|---|---|---|---|---|
| Owner |  | Pending |  |  |
| Executor |  | Pending |  |  |
| Verifier |  | Pending |  |  |
| Taxonomy reviewer |  | Pending |  |  |
| Price authority |  | Pending |  |  |

Final decision: `Pending / Accepted / Accepted with exceptions / Rejected`
