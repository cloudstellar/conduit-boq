# Master Catalog Phase 4 WP-6.6 Operator Workflow Correction Plan

**Status:** P-22 owner-approved; source/static completed on `ac31feb`, G1
Local DB/concurrency/P-20 input completed on `e463270`, and the pre-G2
operator/UI checkpoint completed on `c8f6dca` on 2026-07-12. P-23 owner-approved
the bounded operator-context/navigation amendment on 2026-07-13, and its
working-tree UI/static/browser checkpoint passed the same day without a Local
reset. P-23.1 then amended candidate `020` and the create/detail/restore flow;
its first repository/static checks passed 2026-07-13. P-24 then approved the
bounded annual-range/error-recovery/context hardening before G1R. Base
implementation commit `88d0711` and the later same-scope repeated-error-focus/
execution-provenance closure passed their repository/static gates; the closure
is committed on exact lineage commit `050c998`. Earlier evidence remains valid
history. The separately owner-approved G1R clean DB/concurrency/P-20/advisor/
browser gate passed on exact execution checkout `721c2c2`; the separately
owner-approved independent G2 clean rebuild and P-20 comparison then passed on
the same exact candidate. P-25 repository/static and owner-approved standalone
Local visual/interaction evidence then passed 27/27 at 710 total/709 affected
rows without DB mutation. The no-reset G3 real-route technical walkthrough then
passed stale-after-review recovery and clean Local closeout on source `6599c30`;
P-26 subsequently closed the separate high-impact human-intent gap for Publish,
Recode, and Retire on a working-tree candidate based on `2fd438d`, with a
no-reset Local proof and clean disabled-state readback. P-26 was committed at
exact `78e96ab3ed9993707014c4aba1d285b7592b17a1`; the owner accepted
G3/WP-6.6 on that checkpoint at 2026-07-14 23:50 +07. G4 bootstrap/WP-7
sequencing remains pending and separate.

**Production touched:** No

## 1. Decision and purpose

Owner review of the Local admin workflow found two reproducible comprehension
and control gaps after the bounded WP-6.6 technical evidence:

1. the product exposes multiple current-base drafts even though the intended V1
   operating model is one catalog release workspace at a time; and
2. the publish controls appear before the complete item workspace and there is
   no authoritative whole-version comparison of the final draft against its
   published base immediately before publication.

P-22 accepts the following correction for Local-only implementation:

- allow at most one **mutable working draft per base version**;
- retain stale and abandoned drafts as read-only audit/history records;
- provide an explicit audited abandon action before replacing a current-base
  working draft;
- make the full searchable draft catalog the primary editing workspace;
- compute a final snapshot diff from draft rows versus base rows by stable
  `identity_id` before publication;
- bind review and publication to the same expected `lock_version`, and require a
  fresh review when the draft changes;
- keep the existing one-authorized-publisher model and external approval
  evidence. This correction does not create a second-person or multi-stage
  approval engine.

This decision is a bounded WP-6.6 correction. It does not approve P-18/`021`,
P-19, WP-7 execution, a new Factor F workflow, hotfix `016` expansion, a Local
reset, or any Production action.

P-23 extends only the operator-facing composition of that correction:

- preserve the signed-in admin identity/account menu across Master Catalog;
- separate global information navigation from actions on one exact draft;
- bind import to the selected draft route instead of presenting import as a
  peer global section with another target selector;
- distinguish review-only Excel/PDF exports from the separately approved
  workbook import contract;
- keep the overall workspace iterative, while making the import sub-flow
  explicitly `select -> server review -> apply`; and
- show a reliable Local environment marker when `NEXT_PUBLIC_APP_ENV=local`.

P-23 does not change migration `020`, database/RPC contracts, the official
export binary contract, or the one-publisher model. It does not approve a
round-trip spreadsheet editor.

## 2. Why the correction is needed

The current code already contains the right low-level pieces:

- deterministic full-catalog reads within the accepted 2,000-row client-filter
  threshold;
- search/filter/paging across all draft rows;
- exact stable-identity item routes and field-level audit history;
- server-computed import diff and shared database publish-readiness checks;
- expected-lock, request-idempotency, stale-base, RLS, and publish serialization
  controls.

The remaining problem is workflow composition. The publish form is displayed
before the catalog item workspace, multiple drafts are presented as peers, and
the import-specific diff does not explain the final cumulative effect of manual
plus import changes. A user can therefore reach publication controls without a
clear, complete statement of what the draft will change.

## 3. Target operator workflow

```text
Open the one current working draft
  -> Search/filter all draft items
  -> Open one exact identity and save an audited change
  -> Use import only for approved batch changes
  -> Export a clearly marked review artifact when needed
  -> Review the final draft-versus-base snapshot diff
  -> Resolve readiness and filing warnings
  -> Enter external approval/archive evidence
  -> Publish the exact reviewed lock version
```

The workflow is iterative, not a one-way wizard. The admin may move between the
item list, item detail, import, history, and review while the draft remains
mutable. Publication is available only from the review surface.

## 4. Draft lifecycle contract

### 4.1 One current-base working draft

At most one row may have `status = 'draft'` for a given
`based_on_version_id`. A stale draft based on another version can remain for
audit and comparison, but it is read-only and does not prevent creating one
working draft from the current singleton pointer.

The database, not only the UI, owns this invariant:

- a partial unique index enforces one draft per base;
- draft creation locks the singleton pointer/base in the established order;
- a concurrent or repeated different create attempt returns the stable safe
  code `DRAFT_ALREADY_EXISTS` without cloning rows or writing an audit record;
- same-request/same-payload replay still returns the original idempotent result.

### 4.2 Abandon instead of delete or archive

Add explicit version status `abandoned`. Do not delete a draft and do not reuse
published `archived` semantics for a never-published draft.

`abandon_catalog_draft` requires:

- active-admin authorization and enabled catalog-admin gate;
- exact version ID and expected lock version;
- nonblank bounded reason and stable request ID/fingerprint;
- version lock plus draft/current-base validation;
- one append-only `abandon` change set;
- atomic `draft -> abandoned` transition with no price-row deletion.

An abandoned version and all its item rows are immutable, admin-visible, and
not publishable/restorable or eligible for an official export. There is no
`abandoned -> draft` transition; replacement starts from a fresh clone.

## 5. Authoritative final comparison

The review surface compares the final database snapshots, not a sum of audit
events. One identity can be edited repeatedly or returned to its original value,
so change history answers *how* the draft evolved while snapshot diff answers
*what publication will change*.

The read model must:

- load the selected draft and exact `based_on_version_id` rows completely and
  deterministically;
- compare rows by stable `identity_id`;
- expose unique affected identities and overlapping change groups for add,
  code, name/unit/price, category, status, and display order;
- expose old/new values only for changed fields;
- distinguish authority-sensitive name/unit/price changes;
- include base/draft versions, current pointer, lock version, item counts,
  dataset hash, and the existing shared readiness result;
- read the draft lock before and after the paged snapshot reads and fail closed
  when it changes or either dataset is incomplete.

No new approval table is added for this V1. The review page carries the exact
expected lock into the existing publish path; publish locks/rechecks the draft,
recomputes readiness and canonical hash, and returns `DRAFT_LOCK_CONFLICT` when
the reviewed state is stale. A future requirement for a distinct reviewer or
maker-checker role is a separate architecture/threat-model decision.

## 6. UX contract

Draft creation begins with a required business-intent choice rather than three
raw version-number inputs:

1. `ประจำปีใหม่` (`annual`) requires the owner-designated effective BE year;
2. `ปรับปรุง/เพิ่มเติม` (`revision`) means newly approved catalog content; and
3. `แก้ไขข้อมูลเดิม` (`patch`) restores the same approved source basis.

The read model must load the complete reserved version registry or fail closed.
The UI displays the server-compatible candidate and any earlier reserved
numbers; it never silently changes a reviewed number during submit. Successful
creation opens the exact new draft workspace directly. Candidate migration
`020` remains authoritative for current-base, transition, next-sequence,
concurrency, and idempotent replay checks.

The global Master Catalog shell must keep the signed-in operator visible and
use information destinations only:

1. `บัญชีปัจจุบัน`;
2. `ทะเบียนฉบับ`; and
3. `ประวัติการเปลี่ยนแปลง`.

`นำเข้า` is not a global destination. It is an action on one exact working
draft. The legacy `/admin/master-catalog/import?draftId=...` address may remain
only as a compatibility redirect to the contextual draft route; it must not
restore a second target-selection workflow.

The draft version page presents, in order:

1. compact version/base/status/count context and the current operator identity;
2. one action hierarchy: primary `ตรวจฉบับสุดท้าย`, secondary contextual
   import, and a review-export menu;
3. the full searchable item workspace; and
4. recent import/change history plus audited abandon in the danger area.

Detailed publication/document metadata belongs after the item workspace rather
than occupying the first viewport. Pointer restore is a separate recovery
section and requires a current-to-target confirmation that explains the effect
on new versus historical BOQs.

Use the existing semantic table, exact detail route, shadcn components, NT
tokens, and Lucide icons. Do not add spreadsheet-style inline editing or a new
data-grid dependency.

The workspace must:

- search by code, name, category, and approved group;
- filter by active status, category, group, and final change type;
- mark changed rows with Thai text badges rather than color alone;
- preserve filter/page/return context when opening an item;
- show draft values as the primary working state and provide a clear link to the
  immutable base version;
- keep essential code/name/status/change/action content usable on mobile.

The contextual import page must:

- use `/admin/master-catalog/versions/{versionId}/import` and lock the target
  from that exact route;
- show draft/base context without a second draft selector;
- label the source as an approved input workbook, not an exported workbook;
- show three ordered states: select file/evidence, server-review the complete
  diff, then confirm apply;
- return to the same draft workspace after a successful apply and show a
  visible success result; and
- preserve all existing authority, expected-lock, idempotency, stale-base, and
  server-validation controls.

Draft exports must be grouped under `ส่งออกเพื่อตรวจ` with distinct
`Excel สำหรับตรวจสอบ` and `PDF สำหรับอ่าน/พิมพ์` choices. The UI must not imply
that the official/review Excel workbook is an import template. A future
round-trip bulk editor requires a separately versioned parser/conflict contract
and owner decision.

The review page must:

- show unique affected count plus add/recode/detail/price/category/status/order
  counts, explicitly allowing overlapping categories;
- make summary counts directly filterable and state plainly that one identity
  may contribute to more than one category count;
- hide unchanged rows by default but make them available;
- support search/filter and a direct return-to-edit path;
- present `ค่าปัจจุบัน` and `ค่าฉบับร่าง` labels, not arrow/color alone;
- keep one-field rows compact with old/new values visible immediately, while
  compound rows show the changed-field count and names before exposing all
  old/new values through per-row and expand-all-on-page controls;
- support 50/100 rows per page, direct page selection, and preserved page-size
  context after exact-item editing;
- use a stacked narrow-screen list so review does not depend on horizontal
  table scrolling;
- separate database readiness from P-18/P-19 filing/governance warnings;
- place the exact-version publish form after the diff and blockers;
- separate pointer restore from the normal draft-publication workflow;
- remain Thai-first and demote UUID/request/lock details to support information.

## 7. Implementation ownership

### Candidate migration `020`

Amend the still-unaccepted, Local-only
`020_master_catalog_phase4_admin_workflow_hardening.sql` before fingerprint
freeze. It owns the status/constraint/create/abandon changes. Do not rewrite
`016` or `017`-`019`, and do not use reserved P-18 migration `021`.

Because `020` already has retained Local evidence, any content change
supersedes its prior migration fingerprint and post-`020` evidence. Preserve the
historical records, mark them superseded for closeout, and rerun the complete
required evidence on the new reviewed commit.

### Application

- Server Components/read-model helpers own catalog and diff reads.
- Server Actions own create/abandon/manual/import/publish mutations.
- Client Components own bounded search/filter/paging and form interaction only.
- The existing publish RPC remains the final invariant and transaction.
- Do not add an internal REST route for ordinary reads or mutations.

## 8. Required verification

Before P-22/WP-6.6 closeout:

- unit fixtures cover unchanged, add, recode, detail, price, category, status,
  order, compound, reverted, and incomplete-read comparisons;
- migration/static tests cover the new status, partial unique index, function
  signatures, grants, immutable guards, and stable error codes;
- live Local tests cover role denial, duplicate/current-base create,
  same-request replay, two-session create race, valid/invalid abandon, abandon
  replay/race, rollback, and zero partial clone/audit effects;
- browser tests cover first/middle/last item search, exact edit, preserved return
  state, final diff counts/values, an eight-field compound row, the expected
  709-change high-volume path at 50/100 rows, direct page selection,
  stale-review recovery, Thai copy, mobile, and keyboard/focus behavior;
- readiness/publish, BOQ, hotfix `016`, current pointer, and Factor F before/after
  assertions remain unchanged;
- repository tests, TypeScript, lint, build, authority consistency, DB lint,
  advisors, P-20 comparator, and measured 710-row performance pass.

The full Local bootstrap destroys and rebuilds the Local Supabase stack. Do not
run it until implementation/static checks are ready and the owner separately
approves each required clean rebuild. Bootstrap remains through `019`; apply
candidate `020` separately until the new owner closeout accepts it.

## 9. Review gates

| Gate | Required decision/evidence |
|---|---|
| G0 | P-22 plan accepted for docs and Local-only implementation — accepted 2026-07-12 |
| G1 | Owner explicitly approves first full Local reset after static implementation is ready — approved and completed 2026-07-12 |
| G1U | P-23 operator-context/navigation amendment approved for docs and Local-only UI/static/browser work without a reset; incorporated into exact source commit `31fd689` with P-23.1. |
| G1V | Passed on exact commit `31fd689` on 2026-07-13: P-23.1 explicit version-intent/sequence and item-first correction was approved and its repository/static checks passed. It changes candidate `020`, so all prior `020` fingerprints and live DB evidence remain historical. |
| G1W | Passed on exact implementation commit `88d0711` on 2026-07-13: P-24 annual range, safe error, durable focus, contextual authority, and Factor F hierarchy repository/static gate. No reset is approved. |
| G1X | Passed and committed on exact closure-lineage commit `050c998`: same-scope identical-retry focus and execution-provenance closure. |
| G1R | Explicitly owner-approved and passed 2026-07-13 on exact clean execution checkout `721c2c2c4a234a4fd00e5686383be9af87ee15dd`; migration `020` SHA-256 `e07e0c4161077efba7bc4f6ebf95518d0cc1bc7e4628a43a128dd899bd1aef93`; final Local cleanup passed. |
| G2 | Explicitly owner-approved and passed 2026-07-13 on the same exact checkout `721c2c2c4a234a4fd00e5686383be9af87ee15dd`; second clean rebuild, separate unchanged `020`, WP-6.6/WP-6.5 evidence, P-20 comparator, current advisors, repository gates, and cleanup passed. |
| G3 | Accepted 2026-07-14 23:50 +07 on exact application checkpoint `78e96ab3ed9993707014c4aba1d285b7592b17a1` after P-25 compound/high-volume presentation, real-route stale-after-review, and P-26 high-impact confirmation evidence passed |
| G4 | Only after G3, add accepted `020` to bootstrap and separately authorize any WP-7 execution |

Production P-12 through P-15 remain separate and unrequested.

## 10. Repository/static checkpoint

Exact implementation commit: `ac31feb`.

Completed without Local DB mutation or Production access:

- candidate `020` now enforces one draft per base, guarded create, audited
  idempotent abandon, immutable abandoned rows/metadata, and least-privilege
  grants/postconditions;
- the admin flow is item-first, preserves list/review return context, and moves
  publication behind a complete identity-based final snapshot review carrying
  the exact reviewed lock;
- abandon uses a two-step destructive confirmation and retains the full
  snapshot/history;
- the WP-6.6 smoke harness now covers create race/replay, abandon lifecycle,
  retained rows/audit, replacement, and serialized allocator retry, but was not
  executed before G1;
- `npm test` passed 29 files / 147 tests; TypeScript passed; lint exited 0 with
  10 pre-existing out-of-scope warnings; production build passed and includes
  the final-review route; `node --check` and `git diff --check` passed.

This repository/static checkpoint did not itself satisfy G1/G2
DB/concurrency/browser/P-20 evidence and did not authorize
`npm run db:local:bootstrap`. G1 was later approved separately and is recorded
below; G2 was later approved separately and is recorded in Section 17.

## 11. G1 Local checkpoint

Owner approved G1 after the repository/static checkpoint. The first clean Local
reset applied canonical `009`-`015`, hotfix `016`, and `017`-`019`; candidate
`020` was applied separately and remained outside bootstrap.

G1 found and resolved two bounded source issues before final evidence:

- `17ec6cc` makes the reusable WP-6.5 regression harness close blocked draft
  fixtures through audited abandon, so it remains compatible with one working
  draft per base and leaves zero working drafts;
- `e463270` changes `private.catalog_parse_iso_date` from incorrectly declared
  `IMMUTABLE` to truthful `STABLE`; Local schema was aligned and DB lint then
  returned no findings.

Historical G1 exact-commit evidence on `e463270`:

- WP-6.6: `tmp/master-catalog/wp66-evidence/20260712-g1-p22-e463270.json`,
  SHA-256 `9ccfe240772cb75b4103534d44c12d39600e2ead0ff699020ac5b6751056392d`;
- WP-6.5/P-20 input:
  `tmp/master-catalog/wp65-evidence/20260712-g1-p22-e463270.json`, SHA-256
  `d4750d495adf660c3938062dd0e2e1922d350f72fb7fcb8503afb895f211ec5a`;
- P-20 baseline remained 710 rows, dataset hash
  `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`,
  and identity mapping SHA-256
  `5f68993ce5aa5c7735b0d9e6de6d27946b4846fb8a6eb77d1b6b3bd6c4a73de7`;
- DB lint and security advisors had no findings. Performance advisors retained
  24 pre-existing policy warnings on baseline tables only: 19 auth init-plan
  and 5 multiple-permissive-policy findings; no `020` authority table appeared;
- final readback restored pointer `2568.0.0`/710 rows/hash, zero working drafts,
  all catalog flags `false`, 198 BOQs/1,547 items, and Factor F
  `2569.0.0`/36 rows; Production touched: No;
- 29 files/147 tests, TypeScript, lint with 0 errors/10 existing warnings,
  authority 710/65/17, script syntax, and production build including `/review`
  passed.

The initial G1 clean reset began before the two bounded source fixes. G1 DB and
P-20 evidence therefore remains attached to exact commit `e463270`; it is not
silently relabeled as newer evidence. The later UI-only checkpoint below did
not change migration `020`. At that historical checkpoint, `c8f6dca` was the
intended G2 candidate; P-23.1/P-24 and the final G1R corrections superseded
that target. Final G2 later performed the separately approved fresh clean
rebuild from exact executable candidate `721c2c2` and matched its independent
P-20 output with the G1R input. G3 is not inferred from G1R/G2.

## 12. Pre-G2 operator/UI checkpoint

Exact source checkpoint: `c8f6dca282cd2729ac2b58e488b3ef516fb29713`.

The Local operator preflight completed without a reset and without changing
candidate migration `020`:

- created one current-base proof draft, edited an exact catalog item, reviewed
  the cumulative draft-versus-base snapshot, and used audited abandon; a second
  short-lived proof draft was created only to capture reliable before/after
  viewport evidence and was also audited-abandoned;
- verified Thai-first draft history, a live composed version preview, a named
  category combobox, deduplicated category labels, and bounded long controls on
  desktop and 390x844 mobile layouts with no page-level horizontal overflow;
- browser logs contained no application error; the existing `/nt_logo.svg`
  Next image LCP warning remains for later performance disposition;
- 30 test files / 152 tests, TypeScript, lint with 0 errors/10 existing
  warnings, and the network-enabled production build passed;
- final Local readback restored zero working drafts, all three catalog flags
  `false`, pointer `2568.0.0`/710 rows, 198 BOQs/1,547 BOQ items, and Factor F
  `2569.0.0`/36 rows. Production touched: No.

This is technical preflight evidence, not G2 reset approval and not G3 owner
closeout. P-23 subsequently identified persistent operator identity, mixed
global/action navigation, contextual import targeting, and export/import
semantics as unresolved comprehension controls. The next action is the bounded
P-23 docs/UI/static/browser amendment without a Local reset. Only its accepted
exact commit could have become the separately approved G2 target at that
historical checkpoint; P-23.1/P-24 later superseded it.

## 13. P-23 operator-context checkpoint

The owner-approved P-23 working-tree checkpoint completed on 2026-07-13
without a Local reset and without changing migration `020`:

- the Master Catalog shell now retains the signed-in account menu and shows an
  explicit `Local` marker only from `NEXT_PUBLIC_APP_ENV=local`;
- global navigation is information-only: `บัญชีปัจจุบัน`, `ทะเบียนฉบับ`, and
  `ประวัติการเปลี่ยนแปลง`; draft import is now bound to
  `/versions/{versionId}/import` with no second target selector;
- the draft workspace distinguishes `ส่งออกเพื่อตรวจ` from the approved source
  workbook import contract and keeps `ตรวจฉบับสุดท้าย` as the primary route to
  publication readiness;
- import presents the three explicit states `เลือกไฟล์และหลักฐาน`,
  `ตรวจผลต่างกับเซิร์ฟเวอร์`, and `ยืนยันบันทึกลงฉบับร่าง`;
- browser QA found and fixed one draft-context regression: the first nested
  import implementation showed global prior-version imports. The final route
  queries import history by the exact draft `version_id` and the new proof
  draft correctly showed no imports;
- desktop and mobile browser checks passed the account menu, draft/base/lock
  context, review-export menu, exact-draft import route, Thai labels, and
  responsive composition. Binary upload/apply was not repeated in this bounded
  UI checkpoint; existing parser/server/live-DB evidence remains the authority
  for that behavior;
- 30 test files / 154 tests, TypeScript, lint with 0 errors/10 existing
  warnings, network-enabled production build, and `git diff --check` passed;
- the proof draft `2568.1.0` was audited-abandoned at lock 1. Final Local
  readback restored pointer `2568.0.0`/710 rows, zero working drafts, all three
  catalog flags `false`, 198 BOQs/1,547 BOQ items, and Factor F
  `2569.0.0`/36 rows. Production touched: No.

This checkpoint makes P-23 ready for owner review and commit. It does not name
the exact G2 executable candidate, approve a destructive Local rebuild, close
G3, add `020` to bootstrap, or authorize WP-7/Production work.

## 14. P-23.1 version-intent and item-first correction

Owner review on 2026-07-13 found that the create form could not know whether a
change should be annual, revision, or patch, because the UI always suggested a
revision. The same review exposed a reserved-number edge: abandoning an annual
`{year}.0.0` attempt made a truthful replacement for that effective year
impossible under the old transition shape.

The approved correction is bounded to ADR-003 planning, candidate `020`, the
admin read/create/detail/restore surfaces, tests, and authority documents:

- require explicit annual/revision/patch intent and owner-designated year for an
  annual draft;
- plan from a complete all-status registry and reserve every created number;
- permit a year-changing annual candidate with the next revision and patch `0`
  when lower identifiers in that year are already reserved;
- enforce the next candidate in the guarded DB path, map create races to stable
  errors, and preserve same-request replay before sequence rejection;
- open the exact draft after creation, place the full item workspace before
  document metadata, and require current-to-target pointer-restore confirmation;
- do not change `016`-`019`, bootstrap, P-18/`021`, P-19, BOQ rows, Factor F,
  feature flags, or Production.

Because this amends candidate migration `020`, G1 evidence on `e463270` and the
later UI-only checkpoints remain truthful historical evidence only. They cannot
be relabeled as evidence for the amended candidate. Repository/static
verification passed 2026-07-13: 30 test files/159 tests, focused P-23.1
contracts 5 files/47 tests including a 1,001-version paged-registry fixture,
TypeScript, lint with 0 errors/10 existing warnings,
authority 710/65/17, smoke-script syntax, network-enabled production build, and
`git diff --check`. The harness now records out-of-sequence denial and
same-candidate race normalization. Read-only in-app browser smoke passed the
disabled/account-context state with zero console warnings/errors; the amended
mutable flow still awaited G1R at that checkpoint. No Local DB was reset or
mutated. The later separately approved G1R and independent G2 evidence passed;
G3 technical execution later passed on `6599c30`. Owner acceptance was
separate at that checkpoint and was later recorded through P-27 on exact
`78e96ab`.

## 15. P-24 pre-G1R hardening

The final owner/developer audit before G1R found one bounded business guard and
several recovery/comprehension risks that were not changes to the P-22/P-23.1
architecture. The owner approved closing them before naming the executable
candidate:

- allow an annual effective year only from base +1 through +10, with matching
  UI guidance, Server Action validation, private DB transition validation, and
  stable `VERSION_EFFECTIVE_YEAR_OUT_OF_RANGE` behavior;
- include `VERSION_SEQUENCE_STALE` in the safe response allowlist and preserve
  the error panel while refreshed registry props arrive;
- use one focused `aria-live` Thai error component across create, item, import,
  and workspace actions, with raw code/request ID under collapsed support
  details;
- remove internal P-labels and backend naming from operator-facing copy and add
  accessible names to icon-only pagination;
- show Production `2568.0.0` authority wording only when that version is the
  actual base, and keep the separate Factor F reference in support details;
- cover mapping, annual boundaries, migration contract, durable refresh key,
  focus/ARIA, and copy constraints in tracked tests.

This amends the still-unaccepted candidate `020`, application/tests, and
authority documents only. It does not reset or mutate Local, change bootstrap,
implement P-18/`021` or P-19, begin WP-7, reopen Factor F/hotfix work, or touch
Production. At that authorization checkpoint, G1R remained a separate owner
decision after repository checks and the exact commit were recorded.

Repository/static verification passed 2026-07-13: full suite 30 files/161
tests; focused P-24 contracts 5 files/45 tests; TypeScript; lint with 0 errors
and 10 existing warnings; authority 710/65/17; smoke syntax; network-enabled
production build; and `git diff --check`. Safe-state in-app browser QA passed
desktop/mobile Local/account/disabled copy, no horizontal overflow, and zero
console warnings/errors. Exact implementation commit `88d0711` names the
P-24 base candidate; `020` remained unapplied and Local DB was not reset or
mutated.

The subsequent owner/developer approval review found two same-scope closure
issues before G1R: an identical retry could leave focus on the submit control
because all primitive error fields were unchanged, and the handoff text still
treated the already-created P-24 checkpoint as pending without distinguishing
the execution checkout from its implementation and migration fingerprints. The
closure makes each new action-state object refocus an error even when the safe
payload is identical, adds a focused contract, and records three separate
provenance facts for G1R: final clean `HEAD`, P-24 implementation lineage, and
migration `020` SHA-256
`c8fa5e7191e17ebc3a00fd18b40f38d1cd4f9e5a6db40f758f3ee5867a064d17`.

The same-scope closure passed 2026-07-13: focused operator/authority contracts
2 files/16 tests; full suite 30 files/161 tests; TypeScript; focused and full
lint with 0 errors and the same 10 existing warnings; authority 710/65/17;
smoke syntax; network-enabled production build; and `git diff --check`. It does
not change migration `020`, bootstrap, Local DB state, Production, P-18/P-19,
WP-7, Factor F, or hotfix `016`. Exact closure-lineage commit `050c998` records
the verified result. At that closure checkpoint, G1R remained a separate owner
decision and runtime evidence gate; Section 16 records its later approval and
result.

## 16. G1R execution result

The owner separately approved G1R on 2026-07-13. The final accepted execution
checkout is `721c2c2c4a234a4fd00e5686383be9af87ee15dd`; migration `020`
SHA-256 is
`e07e0c4161077efba7bc4f6ebf95518d0cc1bc7e4628a43a128dd899bd1aef93`.
Bootstrap remained authoritative only through `019`, and `020` was applied
separately.

The first diagnostic runs were not relabeled as passes. They exposed stale
harness assumptions about reserved sequence allocation, one-draft precedence,
invalid-transition ordering, and annual void-number recovery. Fixes landed at
`f9f0bd7`, `bfccbb3`, `be157d4`, and `2b1ccec`. Final advisor review then found
both frozen-authority foreign keys lacked covering indexes; `721c2c2` added
them and made the schema postcondition part of the smoke and contract suites.

Final retained evidence:

- WP-6.6 JSON SHA-256
  `98eca768bfc8334bcf6fe4ee423468bae74f69a1d5bc39ae7bdcb6d100c2e7a8`;
- WP-6.5/P-20 JSON SHA-256
  `aa6791ff6b06359cb857ae3e8e2aea1504f93ee2fe34fa5da2bd7d6666053280`;
- 710-row dataset and P-20 identity hashes reproduced exactly;
- the G1R advisor query returned no security findings; 24 performance warnings
  remained pre-existing baseline policy findings and the two new FK findings
  cleared. The current Studio-rule disposition is superseded by G2 below;
- 30 test files/161 tests, TypeScript, lint, authority, dependency audit,
  production build, smoke checks, and diff check passed;
- browser QA covered version planning, first/middle/last search, exact item
  edit, final snapshot review, exact-draft import, audited abandon, and
  cancelled restore confirmation without publish or pointer movement;
- final Local state was pointer `2568.0.0`/710 rows, zero working drafts, all
  flags false, 198 BOQs/1,547 items, and Factor F `2569.0.0`/36 rows;
- Production touched: No.

G1R did not itself authorize G2. The owner later approved G2 separately, and
Section 17 records the independent result. G3/G4, bootstrap inclusion, WP-7,
and all Production actions remain separate.

## 17. G2 independent reproducibility result

The owner separately approved G2 on 2026-07-13. It used the same exact
execution checkout `721c2c2c4a234a4fd00e5686383be9af87ee15dd` and unchanged
migration `020` SHA-256
`e07e0c4161077efba7bc4f6ebf95518d0cc1bc7e4628a43a128dd899bd1aef93`.
The clean bootstrap again stopped at `019`; `020` was applied separately.

Retained untracked evidence:

- WP-6.6 JSON SHA-256
  `d5da2ceeb5871160ac8cdf8dfe34ffdee220e20c8880e001e42c0bbaaea13f43`;
- WP-6.5/P-20 JSON SHA-256
  `98b9f5fb9e0135ea35a716c87e1f4916e7aa1d186ce68ed067ea02d81b0bce42`;
- P-20 G1R-versus-G2 comparison passed on the same reviewed commit, 710-row
  dataset hash
  `sha256:2e3571ea7135fbc0bbb84c8cc330af1173e4c1d2345e5eb59958dc76e45558b8`,
  and identity mapping SHA-256
  `5f68993ce5aa5c7735b0d9e6de6d27946b4846fb8a6eb77d1b6b3bd6c4a73de7`;
- DB lint had no schema error; current Local Studio rules reported eight
  triaged authenticated-callable `SECURITY DEFINER` warnings, 24 baseline
  performance warnings, and seven baseline unindexed-FK information findings.
  All eight functions deny anon; seven are baseline RPCs and one is the
  active-admin/feature-flag-guarded Master Catalog readiness facade. Both new
  authority FKs are covered. WP-8 owns final least-privilege/performance
  disposition, especially for baseline `get_user_role` and `is_admin`;
- 30 test files/161 tests, TypeScript, lint with 0 errors/10 existing warnings,
  authority 710/65/17, `audit:prod` with 0 vulnerabilities, production build,
  smoke checks, and `git diff --check` passed;
- final Local state was pointer `2568.0.0`/710 rows, zero working drafts, all
  flags false, 198 BOQs/1,547 items, Factor F `2569.0.0`/36 rows, and two valid
  authority FK indexes;
- Production touched: No.

G2 was the independent DB/reproducibility gate and did not repeat browser
acceptance. The later G3 real-route technical walkthrough performed the
intended-admin stale-after-review recovery and clean closeout described in
Section 19. Explicit owner acceptance was later recorded through P-27 on exact
`78e96ab`; G4/bootstrap inclusion, WP-7, WP-8, and all Production actions
remain separate.

## 18. P-25 high-volume final-review refinement

Owner review on 2026-07-14 identified a comprehension gap in the otherwise
complete final diff: the retained browser proof showed one changed field, while
the approved first structured rollout is expected to contain 709 changed rows
and the unit contract allows one identity to change up to all compared fields.
The data and publication architecture remain unchanged; this is a bounded
presentation and G3 evidence correction.

The owner approved Local-only application/tests/docs work that:

- retains one identity per review row and the existing complete `fields[]`
  old/new contract;
- shows a one-field comparison immediately and collapses only compound detail
  behind an explicit changed-field count/name summary;
- adds per-row and current-page expand/collapse, clickable overlapping summary
  filters, 50/100 page size, direct page selection, and return-state
  preservation;
- replaces narrow-screen horizontal review-table dependence with a stacked
  list using the same values and exact edit route; and
- requires fresh desktop/mobile Local evidence for compound and high-volume
  states before G3 can pass.

P-25 does not amend migration `020`, reset or mutate Local by itself, enter
bootstrap, add a data-grid or export artifact contract, or authorize P-18,
P-19, WP-7, WP-8, Factor F, hotfix, or Production work.

Evidence result on 2026-07-14:

- repository/static checks and an owner-approved standalone Local
  visual/interaction harness passed 27/27 checks using the real final-review
  component and project design-system CSS; focused contracts passed 2 files/17
  tests, the full suite passed 30 files/162 tests, and TypeScript, lint (0
  errors/10 existing warnings), authority 710/65/17, the network-enabled build,
  and `git diff --check` passed;
- the fixture contained 710 total/709 affected rows and one row changing all
  eight compared fields; desktop 1440x1000 and mobile 390x844 passed summary
  filtering, expansion, 50/100 paging, direct page 5/8, return context, 44 px
  mobile controls, and horizontal-overflow checks;
- the Browser plugin failed before page execution with `Cannot redefine
  property: process`, so the approved Playwright fallback mocked only Next
  routing contexts; the report and screenshots are retained under
  `output/master-catalog/g3-owner-review/20260714-p25-final-review/`; and
- no Local DB reset/mutation, migration, bootstrap, or Production action
  occurred.

This closes P-25 presentation evidence only. The independent real-route G3
technical walkthrough is recorded below; intended-admin owner acceptance was
later recorded through P-27 on exact `78e96ab`. G4, bootstrap inclusion,
WP-7, WP-8, and Production remain separately gated.

## 19. G3 real-route technical walkthrough

The owner authorized the bounded Local-only G3 execution on 2026-07-14 without
a Local reset. Source HEAD
`6599c306207c2d1e15342c398888b56513f9bb0a` used the existing Local Supabase
stack and the real `/admin/master-catalog` routes. The selected in-app Browser
rejected `localhost` under its URL policy, so the previously owner-approved
Playwright fallback drove the real Next.js route and Local API rather than the
standalone P-25 harness.

Technical result:

- read-only preflight confirmed pointer `2568.0.0`/710 rows, zero working
  drafts, all three catalog flags false, 198 BOQs/1,547 BOQ items, Factor F
  `2569.0.0`/36 rows, five required constraints, the valid one-draft partial
  unique index, two authority FK indexes, and zero nullable required columns;
- only `catalog_admin_enabled` was enabled temporarily; new-identity and
  retirement capabilities remained false;
- intended admin `local.admin@ntplc.co.th` created correction draft
  `2568.0.2`, saved `ITEM-0001` at lock 1, and opened final review bound to
  that exact lock;
- a second audited edit advanced the draft to lock 2 while the lock-1 review
  remained open;
- submitting the stale publish form returned the durable Thai
  `DRAFT_LOCK_CONFLICT` recovery message, retained all entered publication
  fields, created no `publish` change set, and did not move the pointer;
- a fresh review loaded lock 2 and the latest value;
- the draft was audited-abandoned through the UI at lock 3 and retained 710
  read-only rows; final change sets were `clone=1`, `manual=2`, `abandon=1`,
  `publish=0`; and
- final readback restored zero working drafts and all three catalog flags to
  false while preserving pointer `2568.0.0`/710, BOQ 198/1,547, Factor F
  `2569.0.0`/36, and the schema/index invariants. Production touched: No.

Closing repository verification passed the focused authority-consistency
contract (1 file/6 tests), full suite (30 files/162 tests), TypeScript, lint
with 0 errors/10 existing warnings, frozen authority 710/65/17, the
network-enabled production build, evidence checksums, and `git diff --check`.

Untracked screenshots and the machine-readable report are retained under
`output/master-catalog/g3-owner-review/20260714-6599c30-stale-after-review/`.
This passes the G3 technical walkthrough. It does not infer the owner's
accept/hold decision, G4, migration `020` bootstrap inclusion, WP-7, WP-8, or
any Production authorization. The next action is explicit owner review of the
stale-recovery and cleanup evidence.

## 20. P-26 high-impact human-intent guard

The owner authorized this bounded Local-only correction on 2026-07-14 after
the final owner/developer audit identified one remaining mis-click risk. The
database already failed closed for stale locks, readiness, role, idempotency,
and immutable publication, but Publish, Recode, and Retire did not all require
a distinct confirmation of operator intent.

Implemented closure on the working-tree candidate based on
`2fd438dd3417850faca572b9e5e5561e944df345`:

- Recode and Retire now stop at a Thai confirmation dialog showing the exact
  item, intended result, reason, and BOQ/audit effect before the Server Action
  form is resubmitted;
- ordinary Update, Reactivate, and eligible Withdraw keep their existing
  direct-save behavior because their risk and recovery profile is different;
- Publish first presents current and target versions, reviewed lock, item
  count, immutability, and new-versus-historical BOQ behavior;
- the final Publish action remains disabled until the admin types the exact
  target version; and
- the Server Action independently reads `price_list_versions.version_string`
  for the submitted draft and returns stable
  `PUBLICATION_CONFIRMATION_MISMATCH` before the publish RPC when the typed
  value differs. UI state is therefore not the authority.

No-reset Local browser proof used the real admin routes and proof draft
`2568.0.3`. Recode and Retire summaries were inspected and cancelled. Publish
blocked mismatched `2568.0.2`, enabled only exact `2568.0.3`, and was cancelled
without publication. Desktop and 390x844 layouts passed after adding title
clearance for the close control. The proof draft was audited-abandoned at lock
2. Final readback confirmed pointer `2568.0.0`/710 rows, zero working drafts,
all three catalog flags `false`, BOQ 198/1,547, and Factor F
`2569.0.0`/36 unchanged. Change sets were `clone=1`, `manual=1`, `abandon=1`,
`publish=0`. Production touched: No.

Untracked screenshots, checksums, and the machine-readable cleanup report are
retained under
`output/master-catalog/g3-owner-review/20260714-p26-human-intent/`.
This closes Audit #29 C-17 technically. It does not change or apply migration
`020`, add it to bootstrap, infer G3 owner acceptance, authorize G4/WP-7/WP-8,
or authorize any Production, Factor F, hotfix, P-18, or P-19 action.

**Subsequent owner decision:** at 2026-07-14 23:50 +07, the owner accepted
G3/WP-6.6 on exact application checkpoint
`78e96ab3ed9993707014c4aba1d285b7592b17a1`. The preceding sentence remains
the point-in-time technical boundary of the P-26 proof; the later decision
closes WP-6.6 but does not authorize G4, Local reset, bootstrap inclusion,
WP-7, WP-8, or Production.
