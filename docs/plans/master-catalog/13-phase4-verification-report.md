# Master Catalog Phase 4 Verification Report

**Status:** In progress — WP-6/P-11 complete; WP-6.5 passed its bounded
reliability scope. P-22 placed WP-6.6 closeout on Hold and supersedes the
`3bfc74e` candidate evidence for revised closeout while preserving it as
historical evidence. Repository/static correction passed on `ac31feb`; G1
Local DB/concurrency/P-20 input passed on `e463270`; the pre-amendment
operator/browser preflight passed on `c8f6dca`, and the first P-23 working-tree
checkpoint passed. P-23.1 then amended candidate `020` for explicit version
intent and reserved-number sequencing and added the item-first/create/restore
correction. All earlier `020` live evidence is historical for the amended
candidate. Repository/static verification passed on exact P-23.1 commit
`31fd689`. P-24 then approved bounded annual-range, safe-error, durable-focus,
contextual-authority, and Factor F hierarchy hardening; exact implementation
commit `88d0711` passed the repository/static gate before G1R. The separately
owner-approved G1R clean DB/concurrency/P-20/advisor/browser gate passed on
exact execution checkout `721c2c2`, with final Local cleanup. The separately
owner-approved independent G2 clean rebuild and P-20 comparison then passed on
the same exact executable candidate. P-25 repository/static and approved
standalone Local visual evidence then passed for the 709-change final-review
presentation without DB mutation. A bounded no-reset G3 walkthrough then
passed the real-route stale-after-review guard, fresh-review recovery, audited
abandon, and final Local invariant readback on source `6599c30`. Explicit owner
accept/hold remained pending at that checkpoint. P-26 then added and proved the separate
high-impact human-intent guard for Publish, Recode, and Retire on a working-tree
candidate based on `2fd438d`; no publication occurred and Local returned to its
disabled baseline. P-26 was committed at exact
`78e96ab3ed9993707014c4aba1d285b7592b17a1`, and the owner accepted
G3/WP-6.6 on that checkpoint at 2026-07-14 23:50 +07. G4/bootstrap inclusion,
WP-7, proposed WP-7.5, WP-8, and Production gates remained separate at that
checkpoint. P-28 then approved G4 repository integration and WP-7 harness
source on 2026-07-15 without authorizing a Local reset or live DB execution.
**Prepared:** 2026-06-22
**Production project:** `otlssvssvgkohqwuuiir`
**Candidate version:** System-planned ADR-003 number; `2568.1.0` only when still
unreserved (publication metadata/P-15 pending)

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
| 4-0 documents/data decisions | Repository | Owner + developer | 2026-07-04 |  | In progress | P-01 through P-11/P-17/P-20 approved as recorded; P-09 publication metadata, P-18/P-19, and Production gates remain separate |
| 4A additive schema | Local | Codex + owner/developer | 2026-07-05 |  | G4R source integrated; G4E pending | Final `020` passed separate Local apply twice on exact candidate `721c2c2`; P-28 now places unchanged `020` after `019` in bootstrap source. Clean integrated execution and Production remain unapproved. |
| 4B application/workflows | Local | Codex + owner/developer | 2026-07-05 | 2026-07-14 | G3/WP-6.6 accepted | Version planning, item-first edit, final review, import, abandon, restore-confirmation, real-route stale-after-review recovery, and high-impact confirmation/cancel behavior passed; broader independent UAT remains WP-8. |
| WP-6.6 admin workflow/authority hardening | Local | Codex + owner/developer | 2026-07-12 | 2026-07-14 | Accepted/Complete | Exact G1R/G2 evidence passed on `721c2c2`; P-25/G3/P-26 passed; the owner accepted exact application checkpoint `78e96ab3ed9993707014c4aba1d285b7592b17a1`. |
| WP-7 permanent BOQ/hotfix/Factor F regression | Local | Codex + owner/developer | 2026-07-15 |  | Source implemented; live pending | P-28 tracked harness/contracts are repository-only until a separately approved clean `009`-`020` bootstrap and live run. |
| WP-7.5 P-18 placement | Local |  |  |  | Decision pending | P-18 Review Note #28 |
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
| Capability-completeness plan alignment | Owner | Requested full audit and documentation correction | 2026-07-12 | Audit #29 adds WP-6.6, reserves `020`, moves proposed placement to `021`; no reset/implementation/Production authorization |
| P-21 WP-6.6 Local-only implementation start | Owner | Authorized | 2026-07-12 | Owner approved Audit #29 C-01 through C-12/slices A-G; does not imply Local reset/apply, P-18/`021`, WP-7, or Production |
| WP-6.6 destructive Local evidence runs | Owner | Authorized and completed | 2026-07-12 | Canonical bootstrap through `019`, separate Local-only `020` apply, retained DB/concurrency/P-20 evidence, and browser technical QA completed on `3bfc74e`; Production touched: No |
| P-22 operator-workflow correction G0 | Owner | Authorized for docs and Local-only source implementation | 2026-07-12 | [Correction Plan #31](./31-phase4-wp66-operator-workflow-correction-plan.md); no Local reset, WP-7, P-18/`021`, P-19, Factor F/hotfix expansion, or Production |
| P-22 repository/static checkpoint | Codex | Passed on exact commit `ac31feb`; G1 not inferred | 2026-07-12 13:18 +07 | 29 files/147 tests, TypeScript, lint 0 errors/10 existing warnings, build with `/review`, smoke syntax, and `git diff --check`; no Local DB mutation or Production access |
| P-22 G1 first Local evidence run | Owner | Authorized and completed; G2 not inferred | 2026-07-12 22:23 +07 | Canonical reset through `019`, separate candidate `020` apply, DB/concurrency/P-20 input, lint/advisors, invariant readback, and repository checks passed on final `e463270`; Production touched: No |
| P-22 pre-G2 operator/UI checkpoint | Codex + owner/developer | Technical preflight passed; G2/G3 not inferred | 2026-07-12 23:33 +07 | Exact source `c8f6dca`; no reset and no `020` change. One-draft/edit/review/audited-abandon flow, Thai/accessibility/responsive checks, 30 files/152 tests, TypeScript, lint, build, and final Local cleanup passed; Production touched: No |
| P-23 operator-context/navigation amendment | Owner | Authorized for docs and Local-only UI/static/browser implementation; no reset inferred | 2026-07-13 | Persistent admin/account context, information-only global nav, exact-draft import route, approved-input versus review-export semantics, three-state import sub-flow, and explicit Local marker. Migration `020`, G1 evidence, P-18/P-19, WP-7, Factor F, hotfix `016`, and Production unchanged. |
| P-23.1 version-intent/item-first correction | Owner | Authorized for bounded docs/application/candidate-`020`/test work; no reset inferred | 2026-07-13 | Explicit annual/revision/patch intent, complete reserved registry, DB next sequence and annual void-number recovery, exact post-create route, item-before-metadata, and restore confirmation. Prior `020` evidence becomes historical; G1R/G2 require separate approvals. |
| P-23.1 repository/static checkpoint | Codex | Passed on exact commit `31fd689`; Local reset/apply not inferred | 2026-07-13 07:55 +07 | 30 files/159 tests, focused contracts 5 files/47 tests including a 1,001-version paged-registry fixture, TypeScript, lint 0 errors/10 existing warnings, authority 710/65/17, smoke-script syntax, network-enabled production build, and `git diff --check` passed. Read-only in-app browser smoke passed Local/disabled/account context and zero console warnings/errors. At that checkpoint the amended mutable flow still awaited G1R, and `020` remained unapplied and outside bootstrap/Production; the later result is recorded below. |
| P-24 pre-G1R hardening | Owner | Authorized; repository/static passed on exact implementation commit `88d0711`; no reset inferred | 2026-07-13 | Annual base +1 through +10, safe stale/range errors, durable focused Thai feedback, collapsed support IDs, contextual first-rollout authority, accessible pagination, and secondary Factor F context. At that checkpoint G1R remained separate; the later result is recorded below. |
| P-24 same-scope pre-G1R closure | Owner + Codex | Repeated-identical-error focus and execution provenance corrected; committed on exact closure-lineage commit `050c998`; no reset inferred | 2026-07-13 | Focused operator/authority contracts 2 files/16 tests; full suite 30 files/161 tests; TypeScript; focused/full lint 0 errors and 10 existing warnings; authority 710/65/17; smoke syntax; network-enabled production build; and `git diff --check` passed. Migration `020` remained unchanged at SHA-256 `c8fa5e7191e17ebc3a00fd18b40f38d1cd4f9e5a6db40f758f3ee5867a064d17`, unapplied, and outside bootstrap/Production. At that checkpoint, final clean G1R execution `HEAD` remained runtime evidence and still required separate approval; that approval and result are recorded in the next row. |
| P-24/G1R exact Local evidence | Owner + Codex | Explicitly authorized and passed; G2/G3 not inferred | 2026-07-13 | Exact execution checkout `721c2c2c4a234a4fd00e5686383be9af87ee15dd`; final migration `020` SHA-256 `e07e0c4161077efba7bc4f6ebf95518d0cc1bc7e4628a43a128dd899bd1aef93`. Clean bootstrap through `019`, separate `020`, WP-66/WP-65/P-20 input, DB lint/security/performance review, repository gates, bounded browser flow, and final cleanup passed. Production touched: No. |
| P-24/G2 independent Local evidence | Owner + Codex | Explicitly authorized and passed; G3/G4 not inferred | 2026-07-13 | Repeated the clean bootstrap through `019` and separate unchanged `020` on exact checkout `721c2c2`; WP-66/WP-65, P-20 G1R-versus-G2 comparison, DB lint/current advisors, repository gates, and final invariant readback passed. Production touched: No. |
| P-25/G3 real-route technical walkthrough | Codex + owner/developer | Passed technically; owner accept/hold not inferred | 2026-07-14 | No-reset Local run on source `6599c30`: review lock 1, second edit lock 2, stale publish denied with Thai recovery and retained fields, fresh review lock 2, audited abandon lock 3, zero publish effects, clean final invariants. Production touched: No. |
| P-26 high-impact human-intent guard | Owner + Codex | Authorized and passed technically; owner G3 accept/hold not inferred | 2026-07-14 | No-reset Local real-route proof on a candidate based on `2fd438d`: Recode/Retire exact summaries inspected and cancelled; Publish mismatch `2568.0.2` disabled, exact DB-owned `2568.0.3` enabled, then cancelled; 390x844 title/action layout passed; proof draft audited-abandoned at lock 2; pointer `2568.0.0`/710, zero drafts, flags false, BOQ 198/1,547, Factor F `2569.0.0`/36; `publish=0`. Migration `020` and Production untouched. |
| WP-6.6 owner closeout / P-27 G3 | Owner | Accepted exact `78e96ab3ed9993707014c4aba1d285b7592b17a1`; WP-6.6 complete | 2026-07-14 23:50 +07 | [WP-6.6 Owner Review Note](./30-phase4-wp66-owner-review-note.md); G4, WP-7, WP-8, and Production remain separate |
| P-28/G4 repository integration | Owner | Authorized unchanged `020` bootstrap source inclusion and tracked WP-7 harness source; no reset/live execution inferred | 2026-07-15 | Repository/tests/docs only. Exact G4R commit and full static gates precede a separate G4E reset decision; Production touched: No. |
| P-11 exact artifact acceptance | Owner | Accepted exact TH Sarabun New 16 pt replacement PDF/Excel pair; WP-6 complete | 2026-07-11 22:20 +07 | Owner confirmed `รูปแบบ pdf excel ok เลยครับ` for the `777df75` pair after semantic and visual file QA; Production filing and P-12-P-15 remain separate |
| P-20 identity/hash portability | Owner | Approved deterministic baseline identity from immutable Production-derived `price_list.id`; retain `identity_id` in lineage hash | 2026-07-11 12:11 +07 | WP-6.5C passed on `1ad01b9`; final candidate G1R/G2 inputs on `721c2c2` matched exactly and the comparator passed. WP-8/P-15 reruns remain. |
| WP-6.5 Local-only start | Owner | Authorized | 2026-07-11 12:11 +07 | No unannounced Local reset, Production access/write, Factor F workflow change, hotfix scope expansion, placement UI, deploy, enablement, or publication |
| WP-6.5 destructive Local rebuilds | Owner | Two separate clean Local resets authorized | 2026-07-11 | Both approved rebuilds completed on exact commit `1ad01b9`; evidence provenance and hashes are recorded in Section 6.4 and the Tracker; Production touched: No |
| P-11 clean Local artifact rebuild | Owner | One additional clean Local reset authorized and completed | 2026-07-11 | Reset at `edf3570a` restored a no-audit canonical baseline before exact artifact generation; no WP-6.5 harness rerun and no Production access/write |
| Code dictionary | Owner | Approved as candidate dictionary/governance framework; P-02 through P-07 row/code decisions now recorded separately | 2026-07-04 | Owner chat approval; publication gates separate |
| Row reconciliation | Owner | Approved as draft evidence/framework; P-02 through P-07 row-level outcomes now recorded separately | 2026-07-04 | Owner chat approval; raw CSV is evidence, not import authority |
| Legacy `2568.0.0` publication metadata | Owner/records custodian | Approved via P-08 for baseline metadata backfill | 2026-07-04 | Effective `2026-01-01`; approval ref `เอ็นที วทฐฐ./405 ลงวันที่ 27 พ.ย. 2568`; approval doc date `2025-11-27`; publisher `ผู้จัดการฝ่ายท่อร้อยสาย (ทฐฐ.)` |
| NT CI runtime asset scope | Owner/brand custodian | Approved via P-10 for limited runtime derivatives | 2026-07-04 | Use [Doc #24](./24-phase4-nt-ci-runtime-asset-analysis.md); owner confirms NT CI asset rights for business use; `/CI/` source remains local-only; exact P-11 pair accepted 2026-07-11 |
| Production migration | Owner | Not requested; request after WP-8 evidence review |  | P-12 requires green evidence, fresh baseline/drift check, backup/restore, reviewed fingerprints, and owner go/no-go |
| Application deployment | Owner | Not requested; request after migration verification |  | P-13 requires CI/deployment fingerprint, disabled feature flag, smoke checks, and owner go/no-go |
| Feature enablement | Owner | Not requested; request after deploy/admin-only smoke verification |  | P-14 requires authorization checks, non-admin denial tests, and owner go/no-go |
| Publish named version |  | Not requested |  |  |

### 3.1 G1R/G2 exact evidence

The separately owner-approved G1R and independent G2 runs used the same exact
clean execution checkout
`721c2c2c4a234a4fd00e5686383be9af87ee15dd`. Each canonical bootstrap applied
`009`-`015`, hotfix `016`, and `017`-`019`; candidate `020` was applied
separately and remained outside bootstrap. Its final SHA-256 is
`e07e0c4161077efba7bc4f6ebf95518d0cc1bc7e4628a43a128dd899bd1aef93`.

Retained untracked evidence:

| Gate | Evidence | SHA-256 | Result |
|---|---|---|---|
| G1R | `tmp/master-catalog/wp66-evidence/20260713-g1r-p24-721c2c2.json` | `98eca768bfc8334bcf6fe4ee423468bae74f69a1d5bc39ae7bdcb6d100c2e7a8` | Passed exact schema/RLS/grant/authority/allocation/import/readiness/publish/restore/abandon/BOQ/Factor F checks |
| G1R | `tmp/master-catalog/wp65-evidence/20260713-g1r-p24-721c2c2.json` | `aa6791ff6b06359cb857ae3e8e2aea1504f93ee2fe34fa5da2bd7d6666053280` | Passed lifecycle/race/one-draft/P-20 input and invariant checks |
| G2 | `tmp/master-catalog/wp66-evidence/20260713-g2-p24-721c2c2.json` | `d5da2ceeb5871160ac8cdf8dfe34ffdee220e20c8880e001e42c0bbaaea13f43` | Independently repeated the final WP-6.6 DB/RLS/concurrency/invariant suite |
| G2 | `tmp/master-catalog/wp65-evidence/20260713-g2-p24-721c2c2.json` | `98b9f5fb9e0135ea35a716c87e1f4916e7aa1d186ce68ed067ea02d81b0bce42` | Independently repeated lifecycle/race/one-draft/P-20 input and invariant checks |

Diagnostic attempts on `7150764`, `f9f0bd7`, `bfccbb3`, `be157d4`, and
`2b1ccec` were not relabeled as passes. They exposed stale harness allocation,
one-draft precedence, invalid-transition ordering, annual void-number recovery,
and missing FK-index coverage. Fixes landed at `f9f0bd7`, `bfccbb3`,
`be157d4`, `2b1ccec`, and final `721c2c2`.

Both final P-20 inputs reproduced baseline `2568.0.0`/710 rows, dataset hash
`sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`,
identity mapping SHA-256
`5f68993ce5aa5c7735b0d9e6de6d27946b4846fb8a6eb77d1b6b3bd6c4a73de7`,
and frozen authority 710 mappings/65 groups/17 exclusions with SHA-256
`28675e6244c65d485dda7142634b381db729a139bccdf189ad51563251a2e12a`.
The tracked comparator confirmed the same reviewed commit, dataset, mapping,
and no failures.

Local DB lint returned no schema error. The current Local Studio advisor rule
set reported eight security `WARN` findings for authenticated-callable
`SECURITY DEFINER` functions: seven are pre-existing baseline application RPCs,
and one is the Phase 4 readiness facade
`get_catalog_publish_readiness`. Anonymous execution is denied for all eight;
the readiness facade additionally requires the enabled feature flag and active
admin context. These warnings are triaged as nonblocking for G2, but WP-8 must
record the final least-privilege/minimization disposition, with explicit review
of baseline `get_user_role` and `is_admin`. Performance review retained 24
pre-existing baseline policy warnings: 19 auth RLS init-plan and five
multiple-permissive-policy findings. Seven unindexed-FK information findings
are also pre-existing baseline relations; neither new frozen-authority FK is in
that list because both covering indexes are valid. No new untriaged G2 blocker
remained.

Repository gates passed on the exact executable candidate: 30 test files/161
tests, TypeScript, lint with 0 errors/10 existing warnings, authority check,
both smoke-script checks, `audit:prod` with 0 vulnerabilities, production
build, and `git diff --check`.

Bounded G1R browser QA used the signed-in Local admin and covered explicit
revision planning to system-reserved `2568.7.0`, the complete 710-row workspace,
first/middle/last search, exact `ITEM-0355` edit, complete draft-versus-base
review, exact-draft import, audited abandon/read-only retention, and
current-to-target restore confirmation. Restore was cancelled and no publish
was submitted. Desktop passed visual review. At bounded mobile width,
`scrollWidth = clientWidth` and the wide comparison table stayed inside its
intended horizontal scroll container. Focus-visible on the labelled search was
verified, but full keyboard traversal and independent UAT are not claimed. The
only console warning was the existing `/nt_logo.svg` LCP warning. G2 was the
independent DB/reproducibility gate and did not repeat browser acceptance.

Final G2 Local readback: pointer `2568.0.0`, 710 current rows, zero working
drafts, all three catalog flags false, 198 BOQs, 1,547 BOQ items, Factor F
`2569.0.0`/36 current rows, and two authority FK indexes. Production touched:
No.

### 3.2 G3 real-route technical evidence

The owner authorized a bounded Local-only G3 run without resetting Local
Supabase. The run used source HEAD
`6599c306207c2d1e15342c398888b56513f9bb0a`, intended admin
`local.admin@ntplc.co.th`, the real Next.js admin routes, and Local API
`http://127.0.0.1:55321`. The selected in-app Browser rejected `localhost`
under its URL policy; the previously owner-approved Playwright fallback drove
the real application route rather than the standalone P-25 component harness.

| Check | Result |
|---|---|
| Baseline | Pointer `2568.0.0`/710; zero drafts; all flags false; BOQ 198/1,547; Factor F `2569.0.0`/36 |
| Capability boundary | Temporarily enabled only `catalog_admin_enabled`; new identity and retirement remained false |
| Reviewed state | Created correction draft `2568.0.2`; `ITEM-0001` first edit advanced lock 0 to 1; final review bound exact lock 1 |
| Stale trigger | Second audited edit advanced lock 1 to 2 while the lock-1 review stayed open |
| Guard result | Stale publish returned the expected Thai `DRAFT_LOCK_CONFLICT` recovery message; all publication fields remained; no publish change set; pointer unchanged |
| Recovery | Reloaded final review at lock 2 with the latest value |
| Cleanup | UI abandon advanced lock 2 to 3; version retained 710 read-only rows; change sets `clone=1`, `manual=2`, `abandon=1`, `publish=0` |
| Final invariants | Pointer `2568.0.0`/710; zero drafts; all flags false; BOQ 198/1,547; Factor F `2569.0.0`/36; five required constraints; valid one-draft index; two authority FK indexes; zero nullable required columns |

Closing repository verification passed the focused authority-consistency
contract (1 file/6 tests), the full suite (30 files/162 tests), TypeScript,
lint with 0 errors/10 existing warnings, frozen authority 710/65/17, the
network-enabled production build, evidence-manifest checksum verification, and
`git diff --check`.

The report and screenshots remain untracked at
`output/master-catalog/g3-owner-review/20260714-6599c30-stale-after-review/`
under repository policy. Technical result: **Passed**. Owner accept/hold:
**Pending at this technical checkpoint; subsequently accepted via P-27 on
exact `78e96ab3ed9993707014c4aba1d285b7592b17a1`**. No reset, migration
change, bootstrap change, WP-7/WP-8 action, or Production access/write
occurred.

### 3.3 P-26 high-impact human-intent evidence

The owner authorized a bounded no-reset Local proof against a working-tree
candidate based on `2fd438dd3417850faca572b9e5e5561e944df345`. The real admin
routes were used; no publish command was submitted.

| Check | Result |
|---|---|
| Recode | Dialog showed exact `ITEM-0001`, selected target group, reason, and BOQ/audit effect; cancelled with no recode change set |
| Retire | Retirement flag was enabled only for the bounded check; dialog showed exact item, result, reason, and BOQ/audit effect; cancelled; flag restored false |
| Publish mismatch | Typed `2568.0.2` against DB-owned target `2568.0.3`; input marked invalid and final button disabled |
| Publish exact | Typed exact `2568.0.3`; final button enabled; chose **กลับไปตรวจ**, so no publish request/effect occurred |
| Responsive | Desktop passed; at 390x844 the initial title was too close to the close control, title clearance was added, and the repeated screenshot passed without overlap |
| Cleanup | Proof draft `2568.0.3` audited-abandoned at lock 2 with 710 retained rows and `clone=1`, `manual=1`, `abandon=1`, `publish=0` |
| Final invariants | Pointer `2568.0.0`/710; zero drafts; all flags false; BOQ 198/1,547; Factor F `2569.0.0`/36; Production touched: No |

Screenshots, SHA-256 values, and `qa-report.json` remain untracked at
`output/master-catalog/g3-owner-review/20260714-p26-human-intent/` under
repository policy. Migration `020` was neither changed nor applied and the
Local stack was not reset. Technical result: **Passed**. Owner G3 accept/hold:
**Accepted via P-27 at 2026-07-14 23:50 +07 on exact
`78e96ab3ed9993707014c4aba1d285b7592b17a1`**.

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
| A Idempotency | Stable client operation IDs; fingerprints/locks; same-ID mismatch; definitive/uncertain tests; tracked loopback-only response-loss proxy outside app/RPC paths | Live replay/mismatch/races and transport proof passed. Browser run on `9becdf6` displayed the safe Thai uncertain message, retained the submitted Reason/target, resubmitted untouched form values, and recovered the same version/request with `duplicateRequest=true`; the form reset only after success. | Passed WP-6.5A; rerun the shared recovery contract at WP-8 |
| B Guards/readiness | Shared private readiness helper/public admin RPC; P-18 new-identity guard; structured guard activates only after canonical rollout starts; inactive-row P-19 filing warning; import/publish Thai warnings | Live unchanged legacy-only clone passed; P-18 add and structured-recode drafts were blocked; rejected publication left status/metadata/pointer unchanged; passed twice | Rerun on the final structured candidate; intended-admin UAT remains WP-8 |
| C P-20 | `017` maps baseline identity to `price_list.id`, fails on prior mismatch/collision/coverage defects, retains lineage hash; tracked two-run comparator | Passed: both independent clean rebuilds reproduced base `2568.0.0`, 710 rows, dataset hash `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`, and mapping SHA-256 `5f68993ce5aa5c7735b0d9e6de6d27946b4846fb8a6eb77d1b6b3bd6c4a73de7` on the same reviewed commit | Rerun after migration change and at WP-8/P-15 |
| D ADR-003 lifecycle | Generic version fields and reusable DB transition helper; annual/revision/patch, duplicate/backward/mixed tests | Live high-revision create/publish passed twice; `5423373` harness then rejected duplicate, backward annual, mixed annual, and mixed revision/patch without version/row/taxonomy/audit/pointer changes | Passed WP-6.5D; rerun WP-8/P-14 |
| E Export evidence | Tracked clean-tree atomic generator; semantic verifier locates headers, cross-checks visible/canonical fields, count/order/hash/types/formulas/links/PDF pages, regular paths, and binary hashes | Passed and accepted: exact replacement pair at `777df75`, embedded/independent verifier, 19-page PDF comparison, five-sheet workbook QA, typography scan, unchanged readback, and owner confirmation | Rerun verifier at WP-8 without replacing the accepted pair |
| F DB/concurrency | Tracked Local-only harness covers P-20 mapping, role denial, fingerprints, partial-write counts, readiness, publish/restore races, runtime timeout acceptance, pointer/BOQ/Factor F invariants | Passed twice on independent clean rebuilds; anonymous/non-admin denial, duplicate-code rollback, races, pointer restoration, 198 BOQs/1,547 BOQ items, and Factor F default `2569.0.0`/36 rows remained exact | WP-8 rerun; WP-7 owns permanent hotfix `016`/BOQ suffix/Factor F regressions |
| G UX/observability | Route loading/error/not-found; safe Thai recovery; bounded logs/correlation; current-base selection; warnings | Unit/type/build passed. In-app browser recovery on `9becdf6` used uniquely labelled controls, preserved the attempted values through the red uncertain state, retried without refilling, showed one success/change set at lock 4, and produced no browser warning/error. | Passed WP-6.5G technical gate; independent intended-admin UAT and accessibility/recovery rerun remain WP-8 |
| H Documentation | Decision/architecture/DB/export/runbook/tracker/report alignment plus tracked consistency test | Authority test passed 4 checks across core links/table shapes/order/decisions/scripts; report updated with named live evidence | Final repository consistency rerun, commit review, and WP-8 rerun |
| Cross-cutting atomicity | Complete payload preflight, duplicate desired code rejection, per-code lock, mutation write subtransaction and structured abort | Passed twice live: rejected duplicate-code multi-row payload left version rows, identities, codes, change sets, and lock state unchanged | WP-8 rerun |

WP-6.5 evidence remains valid for the rows above. It does not prove the complete
operator capability matrix added after owner review; in particular, the former
WP-6.5G browser evidence proves uncertain-response recovery for one form, not
full 710-row browse/history, one-working-draft lifecycle, import completion, or
publication provenance.

### 6.4.1 WP-6.6 capability completeness checkpoint

| Audit finding | Required evidence | Result |
|---|---|---|
| C-01 full browse/item history | First/middle/last-row search, filters, exact item route, stable-identity field diff, and >1,000-row paged-read fixture proving no API-cap truncation | Passed: deterministic 1,201-row `500/500/201` fixture plus Local browser first/middle/last search, exact item route, and identity/code history |
| C-02 exact draft/stale state | One mutable draft per base; audited abandon/replacement; stale/abandoned drafts read-only before submit | Final G1R/G2 on `721c2c2` passed the DB/concurrency contract. G3 independently created one proof draft, audited-abandoned it at lock 3, retained 710 read-only rows, and restored zero working drafts; accepted for WP-6.6, with rerun in WP-8. |
| C-03/C-04 dictionary and allocator | P-06 seed/freeze, unknown-entry denial, next-never-issued concurrency/gap/900 fixtures | Passed Local DB: 710 mappings/65 groups/17 exclusions, role/unknown/caller-code denial, two unique concurrent allocations, never-reuse, and capacity boundary |
| C-05 import diff/evidence | Complete server add/update/recode/retire/unchanged diff, exact omissions, approved/missing price evidence | Passed Local DB: complete 710-row first rollout, 709 changed/structured rows plus approved `ITEM-0139` legacy row, stable validation replay; browser required explicit draft selection. Full intended-admin import UAT remains WP-8. |
| C-06/C-07 publication provenance | Authenticated actor snapshot and required version archive reference including manual-only publication | Passed Local DB/browser: authenticated publisher snapshot, physical archive reference, invalid-date and missing-archive denials, and rendered provenance/readiness state |
| C-08 readiness parity | Same stale-base/full-quality/P-18/structured result in readiness and publish | Passed Local DB: one full 710-row canonical-quality result fed readiness/publication; pointer restored after physical-archive publish proof |
| C-09/C-10 correction/editor | Prefilled exact item; field-aware authority; reactivate/base-absent withdraw with preserved identity/code/audit | Passed Local DB/browser: retire/reactivate, inherited-withdraw denial, exact inactive item/action, and preserved identity/code/history |
| C-11/C-12 UX/schema | Thai-first/no synthetic defaults/support details plus zero-null/order constraint compatibility | Passed technical gate: `020` constraints/RLS/grants/role denial, Thai desktop/mobile render with no page overflow, and no app console error. Formal accessibility/intended-admin UAT remains WP-8. |
| C-13 final snapshot review | Item-first full workspace; complete identity-based draft/base diff; compound/reverted/incomplete-read fixtures; exact reviewed-lock publish and stale-review recovery | G1R/G2 passed the DB contract, P-25 passed compound/high-volume presentation, and G3 independently rejected a stale lock-1 publish after lock advanced to 2, retained fields, created no publish effect, and reloaded the latest review. Accepted for WP-6.6; broader UAT stays WP-8. |
| C-14 version intent/reservation | Explicit annual/revision/patch intent; owner year; complete all-status registry; permanent reservation; next-sequence DB guard; same-year annual recovery after void lower number | G1R/G2 passed lifecycle cases; G3 used correction intent and retained abandoned proof number `2568.0.2` as a permanent registry entry. Accepted for WP-6.6; rerun in WP-8. |
| C-15 create/item/restore flow | Exact post-create navigation; compact actions/counts then item workspace; document metadata after items; current-to-target restore confirmation with BOQ effect | G1R passed the full bounded route and G3 independently exercised real create/workspace/item/review/abandon routes. Accepted for WP-6.6; broader responsive UAT stays WP-8. |
| C-16 pre-G1R business/UX guard | Annual base +1 through +10 at UI/server/DB; safe stale/range mapping; durable focused Thai error; collapsed support IDs; no internal workflow labels; contextual authority; accessible icon pagination; secondary Factor F context | G1R/G2/P-25 passed contracts and presentation; G3 independently observed the durable Thai stale error, retained inputs, Local/account context, and disabled-gate cleanup. Accepted for WP-6.6; formal accessibility stays WP-8. |
| C-17 high-impact human-intent guard | Exact Recode/Retire summary and explicit confirm; Publish current/target/lock/count/BOQ summary; exact typed DB-read target enforced before RPC; cancel/no-write and responsive behavior | P-26 code/tests and no-reset Local proof passed. Mismatch `2568.0.2` stayed disabled, exact `2568.0.3` enabled, no Publish/Recode/Retire command was confirmed, mobile title overlap was corrected, proof draft was audited-abandoned, and Local returned to zero drafts/all flags false. Accepted for WP-6.6; rerun supported workflow at WP-8. |

Historical rows retain useful point-in-time evidence. The final DB-dependent
results were rerun under G1R/G2 on exact candidate `721c2c2`; the later P-25,
G3, and P-26 application/browser results close their bounded presentation,
recovery, and human-intent contracts without changing migration `020`.

Current P-22 G1 evidence (untracked under `tmp/` by repository policy):

- WP-6.6 DB/concurrency run:
  `tmp/master-catalog/wp66-evidence/20260712-g1-p22-e463270.json`, generated
  `2026-07-12T15:17:18.267Z`, exact commit
  `e463270dfb9f23332559f31591cf338b8eeada3c`, file SHA-256
  `9ccfe240772cb75b4103534d44c12d39600e2ead0ff699020ac5b6751056392d`;
- WP-6.5/P-20 G1 input:
  `tmp/master-catalog/wp65-evidence/20260712-g1-p22-e463270.json`, generated
  `2026-07-12T15:17:32.371Z`, file SHA-256
  `d4750d495adf660c3938062dd0e2e1922d350f72fb7fcb8503afb895f211ec5a`;
- the input reproduced base `2568.0.0`, 710 rows, dataset hash
  `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`,
  and identity mapping SHA-256
  `5f68993ce5aa5c7735b0d9e6de6d27946b4846fb8a6eb77d1b6b3bd6c4a73de7`;
- DB lint and security advisors returned no findings. Performance advisors
  returned 24 pre-existing policy warnings on baseline tables only (19 auth
  init-plan and 5 multiple-permissive-policy); no `020` authority table was
  listed;
- final readback restored pointer `2568.0.0`/710 rows, zero working drafts,
  all three catalog flags `false`, 198 BOQs/1,547 items, and Factor F
  `2569.0.0`/36 rows. Production touched: No.

The initial G1 reset preceded two bounded source fixes found during the run:
WP-6.5 fixture cleanup at `17ec6cc` and truthful date-parser volatility at
`e463270`. Final G1 harnesses and repository checks remain attached to
`e463270`. The later UI/source checkpoint `c8f6dca` did not change migration
`020`; P-23.1/P-24 later superseded that prospective target. Final G1R/G2
instead clean-rebuilt exact executable candidate `721c2c2` and the independent
P-20 comparison passed. Those technical gates do not infer G3 owner acceptance;
the later P-27 decision records that acceptance on exact `78e96ab`.

The following is historical pre-P-22 evidence. After separate owner
authorization, the canonical bootstrap through `019` was
run on two independent clean Local rebuilds at exact commit
`3bfc74ea00843033ad3cfd2afac43820b18c0124`; `020` was then applied separately
for evidence. P-22 now amends candidate `020`, so these results are superseded
for revised closeout. At that historical checkpoint migration `020` remained
outside bootstrap. P-28 later integrated the final unchanged accepted file into
bootstrap source; it has not been applied to Production, and the integrated
clean execution remains pending.

Retained Local evidence outputs (untracked by policy):

- WP-6.6 DB run:
  `tmp/master-catalog/wp66-evidence/20260712-clean-a-3bfc74e.json`, generated
  `2026-07-12T03:21:47.395Z`, exact commit
  `3bfc74ea00843033ad3cfd2afac43820b18c0124`, file SHA-256
  `be9ffe9b0f9dc597e6152ec6151388df1b761598b2bb5a0f1b96f334ebcc2552`,
  status `passed`, environment `local`, and `productionTouched=false`;
- post-`020` P-20 input A:
  `tmp/master-catalog/wp65-evidence/20260712-wp66-clean-a-3bfc74e.json`, file
  SHA-256
  `e3919de8dbb313d85a24025c7388d0c3a6a91d353cad90c0c75eb9c73a57587e`;
- post-`020` P-20 input B:
  `tmp/master-catalog/wp65-evidence/20260712-wp66-clean-b-3bfc74e.json`, file
  SHA-256
  `4d3158cfa254f47527ccaa347a8ec4738c11c70bac83b68382f6b9242e2738da`;
- the post-`020` comparator passed at `2026-07-12T03:23:09.116Z` with the same
  reviewed commit, no failures, base `2568.0.0`, 710 rows, dataset hash
  `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`,
  and identity mapping SHA-256
  `5f68993ce5aa5c7735b0d9e6de6d27946b4846fb8a6eb77d1b6b3bd6c4a73de7`;
- Local browser technical QA on the same implementation covered five version
  rows, exact `2568.103.0` draft with 710 selected rows, first/middle/last item
  search, exact inactive item/history/reactivate path, explicit import draft
  selection, history register, 1440x900 desktop and 390x844 mobile without
  page overflow, and no app console error. The existing Next image LCP warning
  for `/nt_logo.svg` remained non-blocking;
- Local login follow-up commit
  `59b17d3c3e7ed6180445ac5dc5e0b75db9fe9452` rejects ambiguous unquoted `#`
  in guarded Local secrets. Focused tests and `npm run db:local:smoke-auth`
  passed, and normal password login worked without Magic Link. The ignored
  `supabase/.env.local` was not staged.

- run 1: `tmp/master-catalog/wp65-evidence/rebuild-1.json`, generated
  `2026-07-11T11:55:57.332Z`, file SHA-256
  `0662ff7a106e6fd9874ee4c722326cd23bdccb6643a280474e3e3abe0be47506`;
- run 2: `tmp/master-catalog/wp65-evidence/rebuild-2.json`, generated
  `2026-07-11T12:33:25.580Z`, file SHA-256
  `d7f1bedd73dbb8a771d0881370ff3936f31a6be5a9adbc5241d430ca521ca4fe`;
- comparator: passed at `2026-07-11T12:33:31.404Z`, same reviewed commit,
  no comparison failures; the separate owner approvals and rebuild provenance
  are recorded in the Tracker.
- lifecycle/DB run: `tmp/master-catalog/wp65-evidence/20260711T232920-5423373.json`,
  generated `2026-07-11T16:29:49.671Z`, file SHA-256
  `8c687f63e11cc07ea4a56fe9e961b76e439c1c3b1ac0e68b7ce8a88d9c96752f`;
  all prior harness checks and four lifecycle negatives passed;
- response-loss transport run:
  `tmp/master-catalog/wp65-evidence/20260711T234500-transport-response-loss-e782459.json`,
  first commit/retry at `2026-07-11T16:47:37Z`, file SHA-256
  `41f75d046c6deafe3d2526294e712a6415e5ed6bde1149c4d91732109e10a2cf`;
  matching request/response IDs, upstream HTTP 200, same version, and
  `duplicateRequest=true` passed. Earlier proxy starts that never reached a
  committed target response are diagnostics, not retained evidence.
- browser same-ID/input-preservation run:
  `tmp/master-catalog/wp65-evidence/20260712T001809-browser-input-preserve-9becdf6.json`,
  commit `9becdf675386b03a3aeff717cebccd6e88f8b664`, first commit/retry at
  `2026-07-12 00:20`/`00:21 +07`, file SHA-256
  `1d10690f6d487d1188a221e5d484fb30db278da1236fce05cb00302aadf5b029`;
  matching request/response ID `18c669c5-a60f-498a-9f68-986fa346b0cb`, upstream
  HTTP 200, same version, and `duplicateRequest=true` passed. The uncertain-state
  screenshot retained Reason and `ITEM-0004` without refilling, SHA-256
  `9422237bea8c65c69bf49f2cba8f995e5b75fd726cd5e4e8399458359c2aed29`;
  the reset-after-success screenshot SHA-256 is
  `d4764d9d4137d0c95dfa1442118bbf1285ed88f4efecb8c0441ce929dfbea515`.
  The earlier `8558652` browser diagnostic proved same-ID recovery only after
  manual field reconstruction; it exposed the reset defect and is superseded
  as UI acceptance evidence.

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
| WP-6.6 capability matrix | Audit #29 C-01 through C-17 implemented/evidenced, or unsupported controls removed from release visibility | Final G1R/G2 evidence passed on `721c2c2`; P-25 presentation and G3 real-route stale recovery passed on source `6599c30`; P-26 human-intent proof is committed at owner-accepted exact checkpoint `78e96ab3ed9993707014c4aba1d285b7592b17a1`; broader UAT remains WP-8. | Accepted/Complete; WP-8 rerun pending |
| Reviewed migration fingerprint | Filename and SHA-256 match approved file |  | Pending |
| Repository/deployment fingerprint | Exact branch, commit, CI, and deploy artifact recorded |  | Pending |
| Fresh Production preflight | Live counts, pointer, Factor F, BOQ split, and drift recorded |  | Pending |
| Backup/restore gate | Fresh backup manifest and clean Local restore test pass |  | Pending |
| Hotfix `016` / migration order | Remote ledger includes `016`; clean Local bootstrap applies `009`-`015`, hotfix `016`, then reviewed Phase 4 migrations before WP-8 evidence is accepted | G1R/G2 bootstraps applied canonical `009`-`015`, `016`, and `017`-`019`, then final `020` separately. P-28 now integrates unchanged `020` into bootstrap source; clean G4E execution and the fresh Production ledger check remain pending. | G4R source integrated; G4E/Production checks pending |
| End-to-end request idempotency | UI/action/DB reuse one operation ID after timeout; changed payload with same ID rejects | DB replay/mismatch and tracked transport proof passed. Browser proof on `9becdf6` retained the original Reason/target through the uncertain state, retried without refilling, matched the full request ID in both responses, returned `duplicateRequest=true`, and created one change set. | Passed WP-6.5; rerun WP-8 |
| Live DB integration/concurrency | Migrations, RPC/RLS/roles, rollback, two-session publish/restore, and lock timeout pass | WP-6.5 harness passed previously; post-`020` WP-6.6 evidence added constraints/grants/role denial, server-allocation concurrency/never-reuse/900 boundary, correction and publication negatives, exact registers, and pointer/BOQ/Factor F cleanup | Passed WP-6.6 technical gate; rerun WP-8 |
| P-20 hash portability | Approved clean-reset/cross-environment identity/hash model passes | Final G1R/G2 inputs on `721c2c2` reproduced 710 rows, dataset hash `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`, and identity mapping SHA-256 `5f68993ce5aa5c7735b0d9e6de6d27946b4846fb8a6eb77d1b6b3bd6c4a73de7`; the comparator passed with no failures. | G1R/G2 passed; WP-8/P-15 pending |
| ADR-003 reusable version lifecycle | Another valid annual/revision/patch version passes; no reusable hardcoding to `2568.1.0` | Generic fixtures and live high-revision create/publish passed; duplicate/backward/mixed live attempts returned expected safe codes without count or pointer changes | Passed WP-6.5D; rerun WP-8/P-14 |
| Tracked export verifier | Clean-checkout semantic Excel/PDF verification passes | Exact `777df75` replacement pair passed embedded generation verification and independent rerun with no failures; manifest contains regular paths, binary hashes, 710 rows, and P-20 dataset hash; owner accepted the pair | Passed/accepted P-11; WP-8 rerun pending |
| Admin UAT and recovery | Intended admin completes core workflow and representative failures without developer/SQL assistance |  | Pending WP-8 |
| 710-row performance baseline | Import preview, readiness, export, and admin interactions meet reviewed budget |  | Pending WP-8 |
| Authority/document consistency | Migration/WP order, decision IDs, authority links, and Markdown table shapes agree | Tracked consistency test passed 5 checks across the core authority set | Passed checkpoint; rerun at WP-8 |
| BOQ regression | Current BOQ flows and historical version links unchanged | WP-6.5 pre/post summary remained 198 BOQs/1,547 items in both clean runs; permanent suffix/save/print/export suite remains WP-7 | Partial; WP-7 pending |
| Factor F before/after assertion | Pointer, rows, hashes, grants, RLS, and BOQ bindings unchanged | WP-6.5 pre/post summary retained default `2569.0.0`, 36 rows, and BOQ bindings; full structural/regression suite remains WP-7 | Partial; WP-7 pending |
| Advisors | No unresolved Phase 4 blocker | G2 DB lint returned no error. The current Studio rules reported eight triaged security warnings: seven baseline RPCs and one active-admin/feature-flag-guarded Master Catalog readiness facade, all denied to anon. Performance retained 24 baseline policy warnings and seven baseline unindexed-FK information findings; both authority FKs are covered. | Passed G2 scope; least-privilege and baseline disposition required at WP-8 |
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
| Clean reset + migrations | Success, including `009`-`015`, hotfix `016`, and Phase 4 `017+` in order | G1R and independent G2 clean bootstraps through `019` plus separate final `020` apply passed on `721c2c2`; migration SHA-256 `e07e0c4161077efba7bc4f6ebf95518d0cc1bc7e4628a43a128dd899bd1aef93`. P-28 subsequently integrated unchanged `020` into bootstrap source. | G1R/G2 separate-apply evidence passed; G4R source integrated; first combined G4E execution pending |
| 710 identities/legacy code registrations | Exact | Both retained runs read 710 baseline rows and proved every baseline `identity_id` equals its immutable Production-derived `price_list.id`; mapping SHA-256 `5f68993ce5aa5c7735b0d9e6de6d27946b4846fb8a6eb77d1b6b3bd6c4a73de7` | Passed P-20 identity scope |
| Published baseline identity merges | 0 | Deterministic one-row-to-one-identity mapping covered all 710 baseline rows in both clean rebuilds; no identity merge step exists in the P-20 mapping | Passed WP-6.5 |
| Category backfill | Approved count |  | Pending |
| P-06 code-group dictionary | Exact approved 22/65 meanings frozen; ordinary mutation cannot create unknown entries | Frozen authority readback passed 710 mappings/65 groups/17 exclusions; unknown category/group and caller-selected code were denied | Passed Local DB |
| Display-order backfill | Unique `ITEM-####` numeric suffix; 710 covered | Full 710-row readiness readback had `missingDisplayOrder=0`; migration `020` required-order constraint passed | Passed Local DB |
| New-item display order | Current mechanical default is prior maximum + 1 for draft allocation only; WP-6.5 must reject publishing any draft containing identities absent from the base version until P-18 placement governance is approved | Live add fixture reported one new identity, readiness `canPublish=false`, and publish returned `P18_PLACEMENT_REVIEW_REQUIRED` without pointer/metadata mutation in both runs | Guard passed; P-18 placement pending |
| Import parser profile ID/version stored | Exact |  | Pending |
| Code allocation at sequence 900 | Blocking capacity-review error | Local WP-6.6 capacity-boundary fixture passed | Passed Local DB |
| Next-code allocator | Group-locked next never-issued sequence; retired gaps not reused; concurrent callers deterministic | Two concurrent calls allocated distinct `CIC-GIP-007`/`008`; withdrawal followed by allocation produced `009`, proving no reuse | Passed Local DB |
| New structured version rows | 710 before approved add/retire | Full rollout contained 710 rows: 709 canonical structured rows plus approved temporary legacy `ITEM-0139`; readiness found no unapproved legacy active rows | Passed Local DB |
| New foreign keys indexed | All |  | Pending |
| Unique version/code and version/identity | Enforced |  | Pending |
| Unit-cost check validated | Enforced |  | Pending |
| Required nullability/order constraints | Zero-null compatibility proof then enforced by fix-forward migration `020` | `required_constraints=3`, `nullable_required_columns=0`, and 710-row readiness had no missing required text/category/identity/order | Passed Local DB |
| Published row/metadata immutability | Enforced |  | Pending |
| Pointer/legacy `is_default` consistency | Exact | Concurrent publish/restore and cleanup restored one pointer/default to `2568.0.0` in both retained runs | Passed WP-6.5 |
| New catalog capability values/defaults | JSON boolean / `false` for admin, new identity, and retirement | Post-`020` schema evidence counted all three disabled; final cleanup readback returned all three `false` | Passed WP-6.6 |
| Private mutation functions unexposed | Confirmed | Authenticated role could not execute the private allocator; anonymous could not execute version registers; role-denial fixtures passed | Passed Local DB |
| Data API grants explicit | Confirmed | All three frozen authority tables had RLS and exact policies; authenticated register execution was present while anonymous execution was absent | Passed Local DB |
| Publish/restore advisory lock behavior | Serialized; no competing pointer mutation | Two-client publish and restore races each produced one winner and one stable rejection/lock outcome; exact duplicate winner request returned the prior result; pointer remained singular and was restored | Passed WP-6.5 |
| `boq.factor_reference_version_id` FK/index/immutability trigger | Preserved |  | Pending |
| Factor F version tables/pointer/RLS/grants | Unchanged by Phase 4 migration | Runtime summary was identical before/after both harnesses: default `2569.0.0`, 36 default rows; no Factor F workflow was added or changed | Runtime invariant passed; structural WP-7/WP-8 checks pending |
| `save_boq_with_routes` replacement, if any | Preserves price version, Factor F version, and hotfix `016` BOQ item suffix contracts | Both authority bootstraps passed the existing hotfix suffix/category/catalog-authoritative cost smoke; BOQ count/items remained 198/1,547 during WP-6.5 | Bootstrap smoke passed; permanent WP-7 suite pending |

## 9. RLS and authorization matrix

| Actor | Read published catalog | Read admin audit | Mutate draft | Publish/restore | Result |
|---|---|---|---|---|---|
| Anonymous | No | No | No | No | Live draft-create and exact-register execution denials passed; full release matrix reruns at WP-8 |
| Authenticated non-admin | Approved published read only | No | No | No | Staff mutation/readiness denials and WP-6.6 authority/register role boundaries passed; full release matrix reruns at WP-8 |
| Pending/inactive admin profile | No admin access | No | No | No | Pending |
| Active admin | Yes | Yes | Yes | Yes | Two active-admin sessions exercised allocation, import, correction, publication/readiness/registers, and pointer restore live; independent read/audit UAT remains WP-8 |
| Direct REST/private function bypass | N/A | N/A | Rejected | Rejected | Frozen authority RLS/policies and private allocator execution denial passed; complete direct-write matrix reruns at WP-8 |

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
| Complete server diff | Add/update/recode/retire/unchanged rows and totals displayed from authoritative validation | Passed technical WP-6.6 gate: full Local rollout returned complete authoritative results for 710 rows, including 709 changed/structured rows and the approved legacy exception; browser import required explicit exact-draft selection. Full intended-admin import UAT remains WP-8. |
| Exact Full omissions | Every omitted identity and count displayed before Apply | Passed reviewed rollout case: full 710-row first-rollout input had zero silent omissions; exact omission/diff contracts passed static tests. Representative operator omission UAT remains WP-8. |
| Approved new-row price authority | Batch default/per-row override resolves and persists; missing/mismatched evidence rejects | Correct fail-closed state: price-authority contracts passed; new-identity execution stayed capability-denied and hidden because P-18/WP-7.5 is unresolved. |
| Reconciliation authority | Runtime does not treat `docs/*draft.csv` as mutable business authority; first rollout is frozen/reviewed and later imports use exact draft/dictionaries | Passed: generated authority check and Local DB readback returned 710 mappings/65 groups/17 exclusions with SHA-256 `28675e6244c65d485dda7142634b381db729a139bccdf189ad51563251a2e12a`. |
| Unauthorized price delta | Rejected | Pending |
| Client-tampered payload | Server rejection | Pending |
| Duplicate request ID | One effect/consistent result | Local WP-4 import duplicate evidence passed; WP-6.5 create/manual apply/publish/restore exact replay also passed twice |
| Timeout after import apply commit | Retry reuses same client-owned apply ID and returns prior result | The shared `apply_catalog_changes` transport and stable-operation form path passed timeout-after-commit through manual apply; import exact replay/mismatch passed live. Retest the import-status-specific UI path during WP-8 full workflow. |
| Import status lifecycle | UI-only preview; `validated/rejected`; one transition to `applied` | Passed technical gate: full rollout validation/apply completed once and validation replay returned the prior result; browser Apply stayed disabled until a draft was selected. Intended-admin UAT remains WP-8. |
| Import invalid status transition | Rejected without partial apply | Pending |
| Validation/apply request IDs | Separate and idempotent | Passed Local DB: WP-6.6 validation replay was stable with normalized payload hash `0a912360d4c9c64502081eb6f81b6519c50d9bb25fbbadf458e73c1066534416`; shared apply idempotency remained green. |
| Import full old/new snapshots | Complete | Pending |
| Filed source independently rehashed | Matches recorded client fingerprint | Pending |

## 11. Manual change and history

| Test | Expected | Result/evidence |
|---|---|---|
| Manual add/edit/retire/recode/reactivate/eligible withdraw on exact draft | Success with reason and complete audit | Passed supported WP-6.6 actions: retire/reactivate and eligible base-absent withdraw behavior passed Local DB; inherited withdraw was denied; browser exact inactive-item/reactivate/history path passed. Add remains hidden/DB-denied pending P-18. |
| Same actions on published version | Rejected | Pending |
| Blank reason | Rejected | Pending |
| Stale lock version | `DRAFT_LOCK_CONFLICT` | Pending |
| Stale base version | Old draft read-only/nonpublishable; recreate and reapply | Pending |
| History through recode | Same identity timeline | Passed technical gate: exact registers and browser item detail preserved stable identity/code history across the rollout/correction evidence. |
| Full browse/item detail | All selected-version rows searchable/filterable; exact identity route shows field-level old/new history | Passed technical gate: source 1,201-row fixture plus browser 710-row first/middle/last search and exact inactive-item route/history. Operator UAT remains WP-8. |
| Multiple/stale drafts | Explicit selection; stale draft controls disabled/read-only before submit | Passed technical gate: multiple exact draft rows and explicit selection passed browser QA; stale fail-closed tests passed. Stale-recovery comprehension remains WP-8. |
| Withdraw preservation | Base-absent draft row removed; identity/code reservation/prior audit retained | Passed Local DB: eligible withdraw and inherited-withdraw denial passed; allocator never reused the withdrawn code. |
| Actor/display name/timestamp/source | Complete | Passed Local DB: authenticated Local admin snapshot and exact correction/import/publication registers passed. |
| Audit update/delete | Rejected | Passed technical gate: frozen authority/audit role-denial and append-only register contracts passed. Full direct-write matrix reruns WP-8. |
| Manual/create uncertain retry | Same operation ID, payload, effect, and audit result after timeout; changed payload with same ID rejected | Database replay/mismatch, transport commit/504 recovery, and browser manual retry passed. The UI retained Reason/target, required no refilling, reused request `18c669c5...`, returned the prior result, and produced one lock `3 → 4` change set. Create uses the same tracked form-operation hook; rerun the representative recovery set at WP-8. |

## 12. Publication tests

| Test | Expected | Result/evidence |
|---|---|---|
| Missing approval evidence | Rejected | Passed in Local WP-5 smoke: `PUBLICATION_METADATA_REQUIRED`; pointer stayed on `2568.0.0` |
| Caller-authored publisher spoof | Ignored/rejected; actor/display snapshot derived from authenticated active-admin profile | Passed Local DB: publication recorded the authenticated `Local admin` display snapshot rather than caller-authored authority. |
| Impossible publication date | Stable validation rejection before DB cast/write | Passed Local DB: invalid semantic date was denied without publication. |
| Missing version archive reference | Phase 4-created manual/import publication rejected | Passed Local DB: missing archive reference was denied; accepted proof stored `local/master-catalog/wp66/rehearsal-only`. |
| Readiness/publish parity | Same stale-base and complete canonical-quality result; no false green | Passed Local DB: one complete 710-row quality/readiness result produced `canPublish=true`, then publication stored the same 710 count/hash before pointer restore. |
| Stale base pointer | `DRAFT_BASE_STALE` | Passed in Local WP-5 smoke: a transient local-only active pointer fixture moved the singleton pointer under an existing draft; publish returned `DRAFT_BASE_STALE`, did not move the fixture pointer, and cleanup restored the pointer to `2568.0.0` before the real local publish |
| Duplicate publish request ID | No duplicate effect | Passed in Local WP-5 smoke; duplicate publish returned `duplicateRequest=true` |
| UI/action publish retry after uncertain response | Same client-owned request ID reaches DB and returns the prior result | DB publish replay/mismatch passed; transport and browser lost-response proof passed on the shared operation-ID/form path using manual apply. Retest the publish-specific UI path during WP-8 full workflow. |
| Two-session publish/restore race | One deterministic outcome, one stable conflict/timeout, singleton pointer remains exact | Passed twice on independent clean Local rebuilds; one winner, one stable rejection/lock outcome, exact duplicate replay, and pointer cleanup to `2568.0.0` |
| Publish transaction | Atomic | Passed in Local WP-5 smoke and browser proof; rejected publish attempts did not move pointer, successful publish moved pointer/metadata/audit together, and the admin UI showed publish change-set evidence after submit |
| Publish invalid status transition | Rejected without pointer movement | Passed in Local WP-5 smoke: active-version republish rejected as `VERSION_NOT_PUBLISHABLE` |
| P-18 add/supplement publish guard | Draft with any `identity_id` absent from its base version rejects with `P18_PLACEMENT_REVIEW_REQUIRED`; no pointer, metadata, BOQ, or Factor F state changes | Passed twice live: one-new-identity draft had `canPublish=false`, rejected with the expected code, stayed draft with null publication metadata, and left pointer/BOQ/Factor F state unchanged |
| Structured-code legacy exception guard | Guard activates when any active canonical structured code exists, then rejects if active legacy `ITEM-####` rows exceed `ITEM-0139`; unchanged legacy-only clone remains valid | Passed twice live: unchanged legacy-only clone remained publishable; structured recode activated the guard, counted unapproved legacy rows, and publication rejected atomically. Final candidate rerun remains required. |
| Dataset count/hash from DB | Stored | Historical WP-5/browser proof used pre-P-20 clean-reset hash `sha256:4a2a5fcc75f1510c5e037426a19c3110234856485157e5de6f3bd2eee459d1e8`. The approved deterministic P-20 model reproduced `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8` in both clean rebuilds, and the exact P-11 pair now uses that value. |
| ADR-003 reusable version path | Create/publish validation supports another valid annual/revision/patch fixture without reusable `2568.1.0` hardcoding | Generic/unit and live high-revision paths passed; duplicate, backward annual, mixed annual, and mixed revision/patch attempts rejected atomically. |
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
| P-20 identity/hash portability | Approved deterministic `price_list.id` baseline identity and lineage hash reproduce across clean approved environments | After `020`, two independent clean inputs on exact commit `3bfc74e` again reproduced 710 identities, dataset hash `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`, and mapping SHA-256 `5f68993ce5aa5c7735b0d9e6de6d27946b4846fb8a6eb77d1b6b3bd6c4a73de7`; comparator had no failures | Passed post-`020`; rerun WP-8/P-15 |
| Published item count | Approved count | Exact Local P-11 pair for selected `2568.0.0` contains 710 workbook price rows, 710 verification rows, and 710 PDF DOM rows; selected-version data loader fails closed on item-count mismatch | Passed/accepted P-11 |
| Published dataset hash | One stored value | Exact Local P-11 pair and manifest contain `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`; workbook reconstruction, PDF proof, DB readback, and tracked verifier agree. Historical pre-P-20 visual hashes are superseded for final acceptance. | Passed/accepted P-11 |
| Selected-version export paging | No silent fixed-limit truncation before count/hash verification | Export data loader now reads selected price rows, categories, code groups, change sets, imports, and change items through deterministic paged queries; `tests/master-catalog-export-data.test.ts` covers a 1,001-row selected version and verifies all rows are counted/hashed | Passed automated fixture |
| Excel visible business-row count/order | Exact match | Exact replacement workbook under `review-artifacts/20260711T145832108Z-777df759/` has 710 price data rows and 710 verification rows; all five expected sheets are visible and ordered; `priceSequenceBreakCount=0`; the clean change summary has no WP-6.5 harness audit rows | Passed/accepted P-11 |
| Excel `_canonical_row_json` reconstruction | Exact UTF-8 dataset hash | Tracked verifier reconstructs `[` + ordered `_canonical_row_json` + `]\n`; exact workbook rehash matched `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8` | Passed automated fixture and exact Local artifact inspection |
| PDF server-verified printed count/hash/order | Exact match | Exact replacement PDF proof loaded Local `2568.0.0`, DOM row count 710, first/last sequence 1/710, unique sequence count 710, `sequenceBreakCount=0`, 18 price sections/19 physical pages, title/full hash/watermark present, and embedded verifier passed | Passed/accepted P-11 |
| New/supplement item placement acceptance | Owner/data-custodian approved position before publish; no official version relies only on append-at-end ordering for added/supplement rows | P-18 recorded after WP-6 review. The live WP-6.5 guard now prevents publication of add/supplement/new-identity drafts. Placement preview/review remains a separate governance workflow. | Guard passed; P-18 placement pending when applicable |
| Inactive/retired row official PDF policy | Any version with inactive/retired rows has an approved field-facing PDF rendering/exclusion policy before final filing | P-19 recorded 2026-07-07. Current 710-row `2568.0.0` proof has no inactive rows; future retired-row versions require owner/data-custodian policy before P-15 filing | Pending P-19 when applicable |
| Structured-code completeness before candidate publication | Once a draft contains an active canonical `AAA-TTT-NNN` code, active rows have approved code groups except the recorded temporary `ITEM-0139` exception; no other active legacy `ITEM-####` row may publish | Live unchanged-clone positive control and structured-recode rejection passed twice. The approved final structured candidate must still be validated against the exact dictionary/data fingerprint before P-15. | WP-6.5 guard passed; final candidate pending |
| Older-version export | Uses selected version | `tests/master-catalog-export-data.test.ts` now covers requesting an older selected published version while the current pointer remains on another version; the loader keeps `version.id`, `versionString`, count/hash, Current Default status, and filename tied to the explicit selected version | Passed automated fixture |
| Draft export status mark | `DRAFT – ห้ามใช้อ้างอิง` | `tests/master-catalog-export-data.test.ts` covers active-admin draft export as non-official with a `DRAFT-` filename; `tests/master-catalog-export-excel.test.ts` verifies the workbook document sheet and price sheet include `DRAFT – ห้ามใช้อ้างอิง` plus non-official draft hash wording | Passed automated fixture |
| PDF price-disclaimer watermark | Matches approved three-line wording and style from `files/รายการบัญชีราคามาตรฐานงานก่อสร้างท่อร้อยสาย 2568.pdf`: `รายการบัญชีราคานี้ไม่ใช่ราคาก่อสร้างที่แท้จริงหรือถูกต้องตรงกับราคาก่อสร้าง`; `แต่เป็นเพียงราคาโดยประมาณซึ่งใกล้เคียงกับราคาก่อสร้างจริงเท่านั้น`; `(สำหรับกิจการ บมจ.โทรคมนาคมแห่งชาติ เท่านั้น มิให้เผยแพร่ก่อนได้รับอนุญาต)` | Exact retained PDF has no cover watermark and one three-line red overlay watermark per price page; all 19 pages were rendered, inspected, and found free of clipping/blank-page anomalies | Passed/accepted P-11 |
| Published stamp | Field-facing PDF cover shows organization, `ฉบับบัญชีราคา`, Thai status, effective date, item count, and full hash. It excludes Current Default, approval reference/date, approved-by/publisher, exported at/by, generated-by, and export-spec fields; a non-current published version instead shows a Thai retrospective-reference warning. | Fresh Local route/PDF proof on 2026-07-11 confirmed only retained fields appear; count/hash/order/watermark checks passed. | Passed/accepted P-11 |
| PDF cover layout refinement | Larger top-centered NT company lockup, document title, and a distinct `ประจำปี 2568` line of the same title size and weight; a separate centered upper-middle metadata table contains only `ฉบับบัญชีราคา`, Thai status, effective date, item count, and full hash. No duplicate company/status text appears in the header. | Exact replacement Local `2568.0.0` PDF passed route/render proof: 19 pages/18 price sections, 710 rows, sequence 1-710 without breaks, full hash, watermark, and no clipping regression. All rendered pages were byte-identical to the prior visual proof. PDF SHA-256 is `e9e793c4880956fede05b7dee098e24fb0c6bc1b25c8e74f843f1afcfad76eff`. | Passed/accepted P-11 |
| Excel numeric cell types | Numeric, formatted | `tests/master-catalog-export-excel.test.ts` confirms price cost cells are numeric and formatted `#,##0.00` | Passed automated fixture |
| Excel exact 5 sheets/headers; no formulas/external links | Exact | `tests/master-catalog-export-excel.test.ts` confirms exact five sheets/order, business headers, verification headers, and no formula/hyperlink cell values | Passed automated fixture |
| Tracked semantic artifact verifier | Runs from clean checkout; finds headers by name; derives ranges; verifies schema/sheets/count/order/hash/types/visible-field consistency/formulas/links/PDF pages and binary hashes | Exact `777df75` manifest passed embedded verification and independent `npm run artifacts:master-catalog:verify -- output/master-catalog/review-artifacts/20260711T145832108Z-777df759/artifact-manifest.json`; failures were empty | Passed/accepted P-11; WP-8 rerun pending |
| Excel document-language and typography alignment | Thai title/year hierarchy, Thai user-facing metadata labels, canonical verification identifiers unchanged, and every populated cell uses TH Sarabun New with body size at least 16 pt | Artifact-tool rendered all five sheets without formula errors or clipping. Direct binary inspection found 20,808 populated cells, all TH Sarabun New, minimum 16 pt, zero bad typography/formulas/hyperlinks, verification fixed row height 22, and actual blank structured cells remained empty. Excel SHA-256 is `9e7622fb1a269ebe96c45af69d339162b32f42143ce304caa13a520587ae3a07`. | Passed/accepted P-11 |
| Formula-control text safety | Malicious strings remain inert text | `tests/master-catalog-export-excel.test.ts` covers formula-looking item text and confirms no formula/hyperlink cell values | Passed automated fixture |
| PDF Thai font/header/page/clipping | Correct | Exact PDF metadata shows A4, 19 pages, tagged, and no form/JavaScript/encryption. Resources include embedded/subset `/NTRegular`, `/NTBold`, and `/Menlo-Regular`. All 19 Poppler-rendered pages stayed inside safe bounds with no edge clipping or anomalous blank page; inspected content retains lockup, title, repeated headers, Thai footer/page numbers, row 527 on one line, and acceptable final-page whitespace. | Passed/accepted P-11 |
| Short dataset hash | Exactly `sha256:` + first 12 hex + `…`; full hash also present | Admin/export short-hash helper now preserves the `sha256:` prefix and emits only the first 12 hash hex characters plus `…` for dataset hashes, while full hashes remain on the version detail/export stamp and official Excel/PDF proof artifacts; covered by `tests/master-catalog-admin-read-model.test.ts` | Passed automated fixture |
| Catalog export dataset/hash excludes Factor F rows | Confirmed | `tests/master-catalog-export-data.test.ts` verifies the selected-version export loader calls no BOQ or Factor F tables in the normal published export path | Passed automated fixture |
| BOQ print/export regression | Catalog version and Factor F version/snapshot labels still correct |  | Pending |
| BOQ item suffix preservation | Saving BOQ items preserves approved suffix labels such as `(Main Duct)` and `(Riser)` while catalog unit, price, and category remain authoritative |  | Pending WP-7 |

Official export file/reference and binary SHA-256 (different from dataset hash):

The following exact Local P-11 replacement pair is technically verified and
owner-accepted as WP-6 artifact evidence. Preserve these binaries and hashes
without regeneration. This is not a Production filing; filing remains a later
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
| Catalog version list/detail | Five exact version rows, Thai statuses, current marker, selected 710-row draft, readiness, and exact item route rendered | Version/item pages at 390x844 had `scrollWidth=clientWidth=390` and no overlap | Passed WP-6.6 technical QA |
| Import/diff/manual/history | Import required explicit draft selection and stayed disabled before selection; exact item correction/history and append-only register rendered | Mobile import/history not claimed in this proof | Passed desktop technical QA; full intended-admin/responsive UAT remains WP-8 |
| Complete catalog search/filter + item history | Browser found first `ITEM-0001`, middle `ITEM-0355`, and last `ITEM-0710`; exact inactive-item route showed stable identity/code history | Exact item page remained readable without page overflow at 390x844 | Passed WP-6.6 technical QA; intended-admin comprehension remains WP-8 |
| One working draft + stale/abandoned history | One mutable draft per base; duplicate/concurrent create denied; audited abandon/replacement; stale/abandoned views read-only | Final G1R/G2 DB cases passed; G3 independently created one proof draft, audited-abandoned it at lock 3, retained 710 read-only rows, and restored zero working drafts | Accepted for WP-6.6; rerun WP-8 |
| Final snapshot review + reviewed-lock publish | Complete cumulative draft/base diff, compound/reverted behavior, high-volume scanability, readiness/warnings, edit return path, and stale-review recovery | G1R/G2 tests/DB passed complete diff and exact-lock publish/restore; P-25 passed 27/27 high-volume presentation checks. G3 then used the real route to hold review at lock 1, edit to lock 2, reject the stale publish with retained fields and no publish effect, and reload the latest review. | Accepted for WP-6.6; rerun WP-8 |
| Thai-first forms/no rehearsal defaults/support details | Thai navigation/status/action/readiness/error copy rendered; Local synthetic defaults were absent from operator fields | `c8f6dca` adds Thai clone history, live composed version preview, deduplicated category labels, labelled selects, and wrapping long authority text; desktop/mobile had no page-level overflow. Formal keyboard/focus audit remains WP-8. | Passed visual/accessibility-name technical QA; formal accessibility pending WP-8 |
| Add/retire blocker shown before apply/publish | With capability flags false, Add was absent, retirement controls were hidden/denied, and the inactive item exposed only Reactivate; readiness showed the separate P-19 warning | Exact inactive-item action remained responsive | Passed release-visibility gate; P-18/P-19 decisions remain separate |
| Loading/error/not-found and retry/back paths | Route states implemented; user-opened Local tab completed response-loss recovery on `9becdf6` | Browser proof retained submitted values, retried untouched payload, then reset after success | Passed WP-6.5 checkpoint; full representative rerun WP-8 |
| Thai user message + safe code/request ID | Browser showed the red Thai uncertain message and short request ID `18c669c5`; proxy/server logs matched the full ID | Same-ID retry returned one success/change set with no duplicate effect | Passed WP-6.5 checkpoint; intended-admin comprehension remains WP-8 |
| Keyboard/focus/errors/contrast |  |  | Pending |
| Font/logo/color/spacing | Local export artifact proof | PDF uses `next/font/local` NT Regular/Bold derivatives and the full NT company lockup; approved Excel exception uses TH Sarabun New with a 16 pt body baseline while preserving dataset-hash semantics | P-11 PDF/Excel visual proof accepted; app-wide/primary-logo provenance reconciliation remains under P-10 |
| Browser console/server errors | G1R browser had no app error; only the existing Next image LCP warning for `/nt_logo.svg` | No page-level mobile overflow was observed; the wide comparison remained inside its scroll container | Passed technical QA; LCP/performance disposition and rerun WP-8 |
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
| `npm test` | Exit 0 | Exact G1R/G2 checkout `721c2c2`: 30 files/161 tests. P-26 working-tree candidate on 2026-07-14: 30 files/165 tests; focused P-26/authority contracts: 3 files/30 tests. Historical diagnostic results remain attached to their commits. | Passed |
| `npx tsc --noEmit --pretty false` | Exit 0 | P-26 candidate passed 2026-07-14 after Local browser proof and documentation alignment. | Passed |
| `npm run lint` | Exit 0 | P-26 candidate exited 0 with the same 10 existing warnings outside this scope | Passed with existing warnings |
| `npm run build` | Exit 0 | P-26 network-enabled production build compiled, typechecked, generated 11 static pages, and included exact draft import/item/review/export routes. The unchanged app-wide Next.js middleware-to-proxy deprecation warning remains outside this bounded correction. | Passed with existing warning |
| `npm run catalog:authority:check` | 710 mappings / 65 groups / 17 exclusions and frozen hash agree | Passed with SHA-256 `28675e6244c65d485dda7142634b381db729a139bccdf189ad51563251a2e12a` | Passed |
| `node --check scripts/smoke-master-catalog-wp66.mjs` | Exit 0 | Final harness syntax and live execution passed on G1R/G2 | Passed |
| `git diff --check` | Exit 0 | Passed for the P-26 working-tree candidate on 2026-07-14 | Passed |
| In-app browser G1R | Local/admin version planning, workspace, item edit, final review, import, abandon, restore confirmation, responsive containment, and cleanup pass | Bounded flow passed; no publish/restore pointer change; final disabled screen restored. One existing `/nt_logo.svg` LCP warning; full keyboard traversal and independent UAT not claimed. | Passed G1R / later UAT pending |
| P-25 standalone visual/interaction harness | Real final-review component at 710 total/709 affected rows; eight-field compound row; desktop 1440x1000 and mobile 390x844; no console/page error or overflow | Browser plugin runtime was unavailable with `Cannot redefine property: process`; the owner-approved Playwright fallback compiled the real component and project CSS, mocked only Next routing contexts, and passed 27/27 checks. No Local DB reset/mutation, migration, bootstrap, or Production action occurred. | Passed P-25 presentation scope; real-route stale-after-review/G3 not inferred |
| P-26 in-app browser proof | Real Recode/Retire/Publish confirmation and cancellation, mismatched/exact target typing, desktop/390x844 layout, audited cleanup, and final disabled page | Passed on real Local routes; no Recode/Retire/Publish effect, proof draft abandoned, zero drafts/all flags false, pointer/BOQ/Factor F unchanged | Passed and owner-accepted via P-27 |
| `npm run audit:prod` | No unaccepted Production vulnerability | P-26 candidate equivalent command `npm audit --omit=dev --audit-level=moderate` passed with 0 vulnerabilities | Passed |
| Live Local DB integration/concurrency | Migration/RPC/RLS/role/rollback/race/timeout gates pass | Final amended `020` passed WP-66 and WP-65/P-20 twice on exact `721c2c2`; G1R-versus-G2 comparator passed. | G1R/G2 passed |
| Permanent hotfix `016`/BOQ/Factor F suite | Real RPC behavior and pre/post invariants pass | Tracked WP-7 Local harness/source contracts implemented under P-28; live command deliberately not run before G4E approval | Source ready; live WP-7 pending |
| WP-6.6 capability suite | Audit #29 C-01 through C-17 DB/UI/browser evidence pass | Final G1R/G2 passed on `721c2c2`; P-25 presentation and G3 real-route stale recovery/cleanup passed on `6599c30`; P-26 confirmation/cancel/cleanup proof is committed at exact `78e96ab3ed9993707014c4aba1d285b7592b17a1`. | Accepted/Complete via P-27 |
| Tracked export artifact verification | Semantic verifier passes from clean checkout | Exact `777df75` replacement pair passed embedded and independent semantic verification; five verifier fixtures also pass; owner accepted the exact pair | Passed/accepted P-11; WP-8 rerun pending |
| Documentation consistency | Authority links/table shapes, migration order, WP order, decisions, and execution provenance agree | P-27 closeout remains historical authority; P-28/G4R now distinguishes source inclusion from destructive G4E execution and live WP-7 evidence. Current G4R checks are recorded in the Tracker after completion. | G4R verification in progress; rerun at WP-8 |
| Security advisor | No new or untriaged blocker | Current G2 Studio rules reported eight triaged `WARN` findings: seven baseline RPCs and one guarded Master Catalog readiness facade; anon execution is denied for all. | Passed G2 scope; least-privilege/minimization disposition WP-8 |
| Performance advisor | No rollout blocker | G2 retained 24 pre-existing baseline policy warnings and seven baseline unindexed-FK information findings; both new authority FKs have covering indexes. | Passed G2 scope; disposition WP-8 |
| CI exact commit | Passed |  | Pending |
| Vercel Preview/Production | Passed |  | Pending |

G2-observed warnings are recorded below as an existing baseline, not as a
Production waiver. Formal acceptance/remediation remains a WP-8/P-12 review.

| Warning | Rationale | Owner | Due date |
|---|---|---|---|
| 8 authenticated-callable `SECURITY DEFINER` warnings | All deny anon. Seven are baseline RPCs; `get_catalog_publish_readiness` is the guarded Phase 4 facade. Reassess necessity/grants and minimize baseline `get_user_role`/`is_admin` before Production readiness. | Developer + security reviewer + owner | WP-8/P-12 |
| 19 auth RLS init-plan and 5 multiple permissive policy warnings on baseline tables | Pre-existing and outside candidate `020`; no new authority table appeared. Reassess query/policy performance and disposition before Production readiness. | Developer + owner | WP-8/P-12 |
| 7 baseline unindexed-FK information findings | All are pre-existing baseline relations. The two `020` frozen-authority FKs have valid covering indexes. Review baseline index value against write/read workload before Production readiness. | Developer + database reviewer | WP-8/P-12 |

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
