# Phase 4 WP-8 P-37 Intended-Admin UAT and Placement UX Correction Note

**Status:** The bounded execution, correction, and cleanup evidence is complete.
P-37 remains **HOLD only for explicit Owner accept/hold** against exact
correction `df44b827b290933463da5e14fa9125314660022a`. The first
no-reset intended-admin Local UAT on 2026-07-17 failed the
comprehension gate before any placement batch was confirmed. The bounded
insertion-gap correction and its technical stale/accept/replay/accepted-state/
cleanup continuation passed. A fresh no-reset Local session then passed
browser-local leave/return/reload recovery, gap search, final review, and
cleanup. On 2026-07-18 the owner completed the remaining manual keyboard-only
path on fresh fixture `2568.15.0`: visible `Tab`/`Shift+Tab` traversal,
native-button `Enter`/`Space`, insertion-gap selection, same-gap sibling moves,
and editor/final-review focus return all passed. The owner also accepted the
final previous/new/next presentation with an explicit post-save sequence
number. Exact corrective source checkpoint
`f36d896d672609653de6634e307dcc44bce6d519` is pushed. No placement batch was
submitted by the owner through the UI. This usability approval closes only its
named keyboard/focus/presentation checks. Final owner UI submission, broader
independent core-admin UAT, three safe-error recoveries, and named performance
observations remain in [Closure Matrix #34](./34-phase4-wp8-p37-closure-matrix.md).
C-12 authority alignment subsequently passed its executable checks.

On 2026-07-24 the Owner completed a real 710-row Full import and exposed one
additional operator-feedback defect after the database had already committed:
the import panel was keyed by the draft lock, so revalidation remounted the
client component before its success effect could navigate. The screen silently
returned to Step 1 and incorrectly implied that the source file remained in the
browser. The bounded no-migration correction moves the confirmed-success
redirect into the Server Action, makes the selected-file badge depend on an
actual current browser selection, and renders a durable workspace notice with
the filename, resulting draft row count, revision, and direct review/re-import
actions. Fresh Local draft `2568.1.0-D009` then passed the complete 710-row
preview/apply/redirect path. Exact correction
`df44b827b290933463da5e14fa9125314660022a` preserves that bounded source,
tests, and aligned documentation. This correction does not change the P-37 decision boundary:
execution evidence is complete, but explicit Owner accept/hold remains
separate.

**Environment:** Local only. Production touched: **No**.

## 1. UAT finding

The Local fixture is draft `2568.13.0`, based on active `2568.0.0`, with 710
inherited rows plus 18 temporary new rows. The intended admin reported that:

- `รายการอ้างอิง` plus `ก่อนรายการนี้` / `หลังรายการนี้` exposed a database
  placement model instead of the user's insertion task;
- changing a relation immediately changed the row to `ผู้ดูแลแก้ไข`, which
  looked like a saved or completed state even though it was browser-local only;
- the page did not make the next action or the one-batch confirmation model
  clear;
- status-first filtering could hide the full suggested batch and made the user
  infer which status to open.

This is a genuine UAT failure, not operator error. No final reason was entered,
`place_catalog_items` was not called, and no draft placement review was written.

## 2. Root cause and correction

The P-18 database contract remains sound: each new identity still resolves to a
category, a same-category inherited anchor, a before/after relation, and a
batch order. The defect was the direct exposure of that contract in the UI.

The bounded correction keeps the DB/RPC/readiness/audit/concurrency contract
unchanged and replaces only the operator translation:

1. The page opens on all new rows and states that the system has already placed
   the complete batch. The admin does not approve rows one by one.
2. Each row shows the actual final previous item, the new item, and the actual
   final next item.
3. `เปลี่ยนตำแหน่ง` opens a focused dialog. The admin selects one insertion gap
   expressed as `ต้นหมวด`, `ระหว่าง ... และ ...`, or `ท้ายหมวด`; the client maps
   that gap back to the accepted anchor/relation payload.
4. Dialog changes remain isolated until `ใช้ตำแหน่งนี้`; page changes remain
   browser-local until the final batch confirmation.
5. Status language is `ระบบจัดให้`, `ปรับในหน้านี้ · ยังไม่บันทึก`, and
   `ต้องแก้`. One changed row does not move the user into another filter.
6. A single `ยกเลิกการปรับทั้งหมด` restores the deterministic suggestions.
7. Final review separates global sequence impact from placement scope: it shows
   the count of inherited sequence numbers that move and only the categories
   that receive new rows, rather than listing every downstream category.
8. The primary `ตรวจสรุปก่อนบันทึกทั้งชุด` action is visible above the long
   item list. Same-gap up/down controls stay behind
   `เปลี่ยนลำดับในช่วงนี้` and appear only when the admin asks for them.
9. Browser storage schema `2` deliberately rejects the failed-UAT schema `1`
   choices so stale terminology and accidental temporary choices are not
   carried into the corrected review.

The correction uses the existing application design system, Radix/shadcn
dialog/select/popover/command controls, Lucide icons, and the existing
non-drag sibling-order buttons. It adds no migration, dependency, approval
role, arbitrary inherited-row reorder, Factor F workflow, or hotfix scope.

## 3. Working-tree evidence

The corrected real Local route was exercised without a DB reset:

- desktop overview rendered all 18 suggestions with no horizontal overflow;
- the primary final-review action was visible before the item list, while
  same-gap move buttons were absent until the first row's native disclosure was
  opened;
- opening the editor made no change;
- selecting the gap between `ITEM-0001` and `ITEM-0002` changed exactly one row,
  kept the filter at `ทั้งหมด (18)`, and showed `ระบบจัดให้ 17` plus
  `ปรับในหน้านี้ 1`;
- `ยกเลิกการปรับทั้งหมด` restored `ระบบจัดให้ 18` and
  `ปรับในหน้านี้ 0`;
- final review showed 18 new rows, 698 shifted inherited sequence numbers, and
  one receiving category, with required reason input;
- desktop `1230x1259` and mobile `390x844` had no page/dialog horizontal
  overflow; the mobile editor was corrected after an initial intrinsic-width
  finding and then measured `clientWidth = scrollWidth = 356`; the final mobile
  page measured `body/root clientWidth = scrollWidth = 390`.

Current pre-commit checks:

- focused placement/operator/authority suite: 3 files / 28 tests passed;
- full suite: 33 files / 184 tests passed;
- TypeScript: passed;
- ESLint: 0 errors / 10 existing warnings outside this scope;
- frozen authority: 710 mappings / 65 groups / 17 exclusions, SHA-256
  `28675e6244c65d485dda7142634b381db729a139bccdf189ad51563251a2e12a`;
- network-enabled production build: passed with the existing
  middleware-to-proxy deprecation warning;
- `git diff --check`: passed.

The 2026-07-18 Local technical continuation added these bounded facts without a
reset or publication:

- a concurrent draft update moved lock `1` to `2`; the placement request that
  still expected lock `1` returned `DRAFT_LOCK_CONFLICT`, `retryable = true`,
  left placement revision `1`, and created no placement review;
- retrying against current lock `2` accepted all 18 placements once, moved the
  draft to lock `3` / placement revision `2`, recorded 716 affected rows, one
  placement review, and one placement change set;
- replaying the exact request ID, reason, expected versions, and accepted
  payload returned `duplicateRequest = true`, the same review/change-set IDs,
  and left lock/revision at `3/2`;
- the real route reloaded into **ตำแหน่งชุดปัจจุบันได้รับการยืนยันแล้ว** and
  **บันทึกแล้ว** on desktop and 390px mobile with no horizontal overflow;
- audited abandon moved the test draft to `abandoned` at lock `4`; all Local
  flags returned to `false`, and the canonical pointer/BOQ/Factor F baseline
  remained exact.

In that earlier Browser Use session, automated click/type calls focused controls
but did not dispatch this React/Radix client's state-changing events. The
technical RPC/route evidence above is retained, but complete keyboard and
leave/reload recovery were therefore deliberately not marked passed at that
checkpoint.

The later 2026-07-18 fresh no-reset re-UAT separated that tooling limitation
from application behavior and added these facts:

- the canonical app origin was `http://localhost:3000`; using
  `http://127.0.0.1:3000` could render server HTML while Next development
  resources were cross-origin blocked, leaving the page unhydrated. Local UAT
  must use one origin consistently;
- fresh draft `2568.14.0` contained the same 710 inherited plus 18 temporary
  new rows and opened on all 18 system suggestions;
- the gap search accepted keyboard input, `ArrowDown` moved the active option,
  and `Enter` selected the intended gap between `ITEM-0011` and `ITEM-0012`,
  closed the suggestion list, and returned focus to the gap combobox;
- applying that staged choice showed 17 system suggestions plus one
  **ปรับในหน้านี้ · ยังไม่บันทึก** row without a DB placement submission;
- same-origin leave displayed the explicit keep-or-stay dialog, **ออกและเก็บไว้
  ชั่วคราว** returned to the draft, and both returning to the route and a later
  reload restored the one pending choice with the truthful recovery alert;
- final review showed 18 new rows, 17 system suggestions, one local adjustment,
  699 shifted inherited sequence numbers, one receiving category, zero
  incomplete/invalid rows, and the required reason field; it was closed without
  submission;
- UAT found that **ยกเลิกการปรับทั้งหมด** restored 18/0 but left the recovery
  alert visible. Checkpoint `96c2ac6892e8ffe9d020c2dff641a847157cd4b2`
  now clears the recovered-state flag and renders the alert only while pending
  local work exists. Re-UAT passed 18/0 with the alert and reset action gone;
- browser warning/error logs were empty. The in-app driver still did not send
  `Tab`, `Shift+Tab`, `Enter`, or `Space` to native buttons, so those complete
  traversal/activation claims remain unaccepted even though the controls are
  native buttons and existing Radix/shadcn components;
- no Local reset, placement confirmation, publication, Factor F workflow,
  hotfix expansion, or Production action occurred. Audited abandon closed
  `2568.14.0` at lock `2` / placement revision `1`, and all disabled-baseline
  invariants returned exact;
- focused operator regression passed 1 file / 14 tests; the full suite passed
  33 files / 184 tests; TypeScript, lint with 0 errors / 10 existing warnings,
  authority 710/65/17, network-enabled production build, and diff check passed.

External screenshots are review evidence only and must not be staged:

- failed UAT:
  `/Users/cloud/.codex/visualizations/2026/07/06/019f36c9-8c72-7f30-9bd3-6161114f7c1b/p37-master-catalog/10-uat-confusing-state.png`;
- corrected desktop overview:
  `/Users/cloud/.codex/visualizations/2026/07/06/019f36c9-8c72-7f30-9bd3-6161114f7c1b/p37-master-catalog/20-placement-redesign-final-desktop.png`;
- final simplified desktop viewport with the visible next action and collapsed
  order controls:
  `/Users/cloud/.codex/visualizations/2026/07/06/019f36c9-8c72-7f30-9bd3-6161114f7c1b/p37-master-catalog/21-placement-simplified-final-desktop-viewport.jpg`;
- corrected focused editor:
  `/Users/cloud/.codex/visualizations/2026/07/06/019f36c9-8c72-7f30-9bd3-6161114f7c1b/p37-master-catalog/12-placement-redesign-editor.png`;
- corrected final review:
  `/Users/cloud/.codex/visualizations/2026/07/06/019f36c9-8c72-7f30-9bd3-6161114f7c1b/p37-master-catalog/15-placement-redesign-final-review-fixed.png`;
- corrected mobile editor and final review:
  `/Users/cloud/.codex/visualizations/2026/07/06/019f36c9-8c72-7f30-9bd3-6161114f7c1b/p37-master-catalog/18-placement-redesign-mobile-editor-fixed.png`
  and
  `/Users/cloud/.codex/visualizations/2026/07/06/019f36c9-8c72-7f30-9bd3-6161114f7c1b/p37-master-catalog/19-placement-redesign-mobile-final-review.png`.
- final simplified mobile viewport:
  `/Users/cloud/.codex/visualizations/2026/07/06/019f36c9-8c72-7f30-9bd3-6161114f7c1b/p37-master-catalog/22-placement-simplified-final-mobile.jpg`.
- accepted desktop and mobile states:
  `/Users/cloud/.codex/visualizations/2026/07/06/019f36c9-8c72-7f30-9bd3-6161114f7c1b/p37-master-catalog/23-placement-accepted-desktop.jpg`
  and
  `/Users/cloud/.codex/visualizations/2026/07/06/019f36c9-8c72-7f30-9bd3-6161114f7c1b/p37-master-catalog/24-placement-accepted-mobile.jpg`;
- accepted and cleaned Local metadata snapshots:
  `/Users/cloud/.codex/visualizations/2026/07/06/019f36c9-8c72-7f30-9bd3-6161114f7c1b/p37-master-catalog/25-placement-accepted-local-metadata.json`
  and
  `/Users/cloud/.codex/visualizations/2026/07/06/019f36c9-8c72-7f30-9bd3-6161114f7c1b/p37-master-catalog/26-placement-cleaned-local-metadata.json`.
- final no-reset recovery UAT evidence:
  `/Users/cloud/.codex/visualizations/2026/07/06/019f36c9-8c72-7f30-9bd3-6161114f7c1b/p37-final-uat/03-placement-editor.png`,
  `/Users/cloud/.codex/visualizations/2026/07/06/019f36c9-8c72-7f30-9bd3-6161114f7c1b/p37-final-uat/04-local-change-not-saved.png`,
  `/Users/cloud/.codex/visualizations/2026/07/06/019f36c9-8c72-7f30-9bd3-6161114f7c1b/p37-final-uat/05-leave-confirmation.png`,
  `/Users/cloud/.codex/visualizations/2026/07/06/019f36c9-8c72-7f30-9bd3-6161114f7c1b/p37-final-uat/06-recovered-after-reload.png`,
  `/Users/cloud/.codex/visualizations/2026/07/06/019f36c9-8c72-7f30-9bd3-6161114f7c1b/p37-final-uat/07-final-batch-review.png`, and
  `/Users/cloud/.codex/visualizations/2026/07/06/019f36c9-8c72-7f30-9bd3-6161114f7c1b/p37-final-uat/08-reset-clears-recovery-banner.png`.
- owner keyboard-only evidence retained outside Git:
  `/Users/cloud/.codex/visualizations/2026/07/06/019f36c9-8c72-7f30-9bd3-6161114f7c1b/p37-owner-keyboard-uat/01-placement-editor-open.png`,
  `/Users/cloud/.codex/visualizations/2026/07/06/019f36c9-8c72-7f30-9bd3-6161114f7c1b/p37-owner-keyboard-uat/02-gap-selected.png`,
  `/Users/cloud/.codex/visualizations/2026/07/06/019f36c9-8c72-7f30-9bd3-6161114f7c1b/p37-owner-keyboard-uat/03-local-change-overview.png`,
  `/Users/cloud/.codex/visualizations/2026/07/06/019f36c9-8c72-7f30-9bd3-6161114f7c1b/p37-owner-keyboard-uat/04-final-review-focus.png`, and
  `/Users/cloud/.codex/visualizations/2026/07/06/019f36c9-8c72-7f30-9bd3-6161114f7c1b/p37-owner-keyboard-uat/05-final-review-sequence.png`.

## 4. Owner keyboard and final-presentation re-UAT

The owner used the real Local application on `http://localhost:3000` without a
database reset or developer-driven browser automation. Fresh draft `2568.15.0`
contained 710 inherited rows plus 18 temporary new rows. The continuous pass
proved:

- `Tab` reached the first **เปลี่ยนตำแหน่ง** button and `Enter` opened the
  editor; visible focus landed on the category select;
- category open/close, insertion-gap search, `ArrowDown`/`Enter` selection, and
  `Tab`/`Shift+Tab` traversal through cancel/apply worked without a pointer;
- `Space` applied one browser-local change, producing the truthful 17 system /
  1 locally adjusted state without a database placement submission;
- the first editor close exposed missing opener-focus restoration. The bounded
  correction stores the invoking native button, restores it with
  `preventScroll`, and passed re-UAT when immediate `Enter` reopened the same
  editor;
- the native same-gap disclosure opened with `Enter`; disabled controls were
  skipped; `Space` moved one sibling down and then back up;
- final review opened from the keyboard with visible focus on the required
  reason field. `Tab`/`Shift+Tab` traversed both footer buttons, `Space` on
  **กลับไปตรวจ** closed the dialog, and immediate `Enter` reopened it from the
  invoking button;
- final review now reuses the same responsive previous/new/next component as
  the editor and displays the DB-preview-derived **ลำดับหลังบันทึก** separately
  from the authority-owned item name. The owner judged this presentation usable;
- the same explicit focus-return pattern also protects the guarded same-origin
  leave dialog, preventing a keyboard user who chooses **อยู่หน้านี้** from
  losing the invoking link;
- the dangerous **ยืนยันและบันทึกตำแหน่ง** action was never activated.

Checkpoint `f36d896d672609653de6634e307dcc44bce6d519` contains only the
placement workspace and focused regression contract. The database, migration
`021`, RPC payload, authority data, hotfix `016`, Factor F, and Production were
unchanged. Verification passed: focused operator test 1 file / 14 tests; full
suite 33 files / 184 tests; TypeScript; ESLint with zero errors and the same 10
existing warnings; authority 710 mappings / 65 groups / 17 exclusions,
SHA-256 `28675e6244c65d485dda7142634b381db729a139bccdf189ad51563251a2e12a`;
network-enabled production build; and `git diff --check`.

## 5. Current Local state

The temporary UAT fixture was audited-abandoned after evidence capture:

- active pointer `2568.0.0`, 710 rows, canonical hash unchanged;
- zero working drafts; technical test version `2568.13.0` remains `abandoned`
  with 728 retained audit rows at lock `4` / placement revision `2`, and the
  final no-reset UAT version `2568.14.0` is `abandoned` with 728 retained rows
  at lock `2` / placement revision `1`; owner keyboard UAT version `2568.15.0`
  is also `abandoned` with 728 retained rows at lock `2` / placement revision
  `1`;
- `catalog_admin_enabled = false`, `catalog_new_identity_enabled = false`, and
  `catalog_retirement_enabled = false`;
- 198 BOQs, 1,547 BOQ items, zero unversioned BOQs;
- Factor F current `2569.0.0`, 36 rows;
- Production touched: **No**.

The 2026-07-24 import-feedback correction used two additional Local-only
attempts against the same unissued target:

- `2568.1.0-D008` retained the first successful 710-row Full import and was
  audited-abandoned after the silent post-save state was diagnosed;
- re-previewing the already-recoded D008 payload returned `VALIDATION_FAILED`
  and wrote no import, which confirms that a completed first-rollout draft is
  not silently recoded a second time;
- fresh `2568.1.0-D009` previewed 709 recodes plus one unchanged row, then
  applied once. Server operation timing was 187 ms for preview and 275 ms for
  apply; the POST returned `303` to
  `?notice=import-applied`, whose workspace notice displayed the source
  filename, resulting draft count 710, revision 1, **ตรวจรายการที่เปลี่ยน**, and
  **นำเข้าไฟล์อื่นเพิ่ม**;
- D009 was audited-abandoned after evidence capture. A strict cleanup attempt
  intentionally refused to certify the older one-version session because this
  correction added a second audited attempt and the tracked tree contained the
  correction. Its fail-safe still restored the original flags. Final read-only
  status confirmed pointer `2568.0.0`/710, zero working drafts, all three flags
  false, BOQ 198/1,547, Factor F `2569.0.0`/36, no reset, and no Production
  action. The old session remains `prepared` and is not represented as a
  scored cleanup artifact.

The correction adds no migration, database contract, authority-data, hotfix,
Factor F, retirement, or Production scope. Focused admin/operator/authority
tests passed 3 files/41 tests; the full suite passed 36 files/233 tests;
TypeScript passed; ESLint exited with zero errors and the same 10 existing
warnings.

## 6. Import post-save UX contract

A successful import must now satisfy all of these operator-visible conditions:

1. The server confirms the `applied` result before redirecting; client remount
   timing is not part of correctness.
2. The browser leaves the import form and opens the exact draft workspace with
   `notice=import-applied`.
3. The notice states that the import was written and shows the source filename,
   resulting draft row count, and current draft revision.
4. The next safe actions are explicit: review changed items or intentionally
   start another import.
5. A selected-file badge is visible only while the current file input actually
   contains a browser-local selection.
6. Refreshing or opening the import page again never claims that the previous
   local file is still selected.

These conditions preserve Post/Redirect/Get behavior, exact-lock protection,
append-only history, and the existing import idempotency contract. A later copy
or layout adjustment can change the presentation without changing this
boundary, so the correction creates no structural UI debt.

## 7. Remaining P-37 exit path

The named source, technical, recovery, realistic route-scale, keyboard,
focus-return, owner-presentation, and cleanup checks are complete. The
temporary fixture is cleaned and the disabled canonical baseline is exact.
They are retained and do not need repetition unless the related source changes.

The earlier line-by-line closure audit correctly found that this note's former
only-owner-decision conclusion exceeded the evidence then available: the owner
session explicitly did not activate **ยืนยันและบันทึกตำแหน่ง**, while the
governing WP-8 plan requires one complete owner placement task. Subsequent
bounded P-42 execution closed that historical gap with one stale rejection
having zero effect and exactly one accepted UI batch/change set. Retained Cards
A-G, at least three safe validation/prevention recoveries, the D007
stale-choice replay, and the D009 real Full-import save/redirect then closed the
remaining named interaction rows. The historical finding remains the reason
those checks were required; it is no longer an open execution blocker.

[Closure Matrix #34](./34-phase4-wp8-p37-closure-matrix.md) is authoritative
for gate status. P-38 reconciliation and the later proportional execution are
complete. [Owner UAT Script #35](./35-phase4-wp8-p37-evidence-reconciliation-and-owner-uat-script.md)
preserves the retained evidence; no new fixture, reset, or full-flow replay is
required merely to refresh proof. Do not run `npm run db:local:bootstrap`; if a
reset becomes necessary for a later scope, stop for a new explicit
destructive-reset approval.

Exact correction `df44b827b290933463da5e14fa9125314660022a` preserves the final
source/tests/docs checkpoint. WP-8 is **Ready for owner review** and P-37
remains **HOLD only for the explicit Owner accept/hold decision**. Acceptance
would close WP-8 and permit only a later P-12 request. It would not authorize
Production migration, deployment, feature enablement, publication, P-19,
Factor F work, or hotfix expansion. Add/Supplement remains hidden, and P-12
through P-15 remain unauthorized until their separate gates.
