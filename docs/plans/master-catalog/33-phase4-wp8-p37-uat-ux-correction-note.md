# Phase 4 WP-8 P-37 Intended-Admin UAT and Placement UX Correction Note

**Status:** P-37 remains **HOLD**. The first no-reset intended-admin Local UAT
session on 2026-07-17 failed the comprehension gate before any placement batch
was confirmed. The bounded insertion-gap correction and its technical
stale/accept/replay/accepted-state/cleanup continuation passed. A final fresh
no-reset Local session on 2026-07-18 then passed browser-local leave, return,
reload, and recovery; insertion-gap search plus `ArrowDown`/`Enter`; final batch
review; and cleanup. That session found and corrected one stale recovery-banner
state. Exact corrective source checkpoint
`96c2ac6892e8ffe9d020c2dff641a847157cd4b2` is pushed. Complete independent
`Tab`/`Shift+Tab` traversal and native-button `Enter`/`Space` activation remain
open because the in-app browser driver did not dispatch those keys. Explicit
owner acceptance also remains open.

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

## 4. Current Local state

The temporary UAT fixture was audited-abandoned after evidence capture:

- active pointer `2568.0.0`, 710 rows, canonical hash unchanged;
- zero working drafts; technical test version `2568.13.0` remains `abandoned`
  with 728 retained audit rows at lock `4` / placement revision `2`, and the
  final no-reset UAT version `2568.14.0` is `abandoned` with 728 retained rows
  at lock `2` / placement revision `1`;
- `catalog_admin_enabled = false`, `catalog_new_identity_enabled = false`, and
  `catalog_retirement_enabled = false`;
- 198 BOQs, 1,547 BOQ items, zero unversioned BOQs;
- Factor F current `2569.0.0`, 36 rows;
- Production touched: **No**.

## 5. Remaining P-37 exit path

Codex has already exercised and recorded the corrected flow, realistic 710+18
scale, leave/return/reload recovery, final review, stale rejection, one-batch
confirmation mechanics, exact replay, accepted-state readback, reset, and
cleanup. The owner does not need to repeat those gates or submit another
placement batch.

P-37 may be reconsidered after one fresh no-reset, keyboard-only pass without
developer or SQL guidance:

1. Codex prepares a temporary Local-only 710+18 fixture; no Local reset is
   required and no Production environment is involved;
2. the owner uses `Tab`/`Shift+Tab` with visible focus and `Enter`/`Space` on
   native buttons to open/close the row editor, operate category and insertion-
   gap controls, move same-gap siblings, open/close final review, and verify
   focus returns to the invoking control; gap search, `ArrowDown`, and `Enter`
   selection are already passed and need only a brief confirmation in this
   continuous keyboard path;
3. stop before the final placement submission, then record an explicit owner
   P-37 accept/hold decision against corrective source checkpoint
   `96c2ac6892e8ffe9d020c2dff641a847157cd4b2`.

Until complete owner keyboard re-UAT and explicit acceptance pass,
WP-8 remains **In progress**, P-37 remains **HOLD**, Add/Supplement remains
hidden for release, and P-12 through P-15 remain unauthorized.
