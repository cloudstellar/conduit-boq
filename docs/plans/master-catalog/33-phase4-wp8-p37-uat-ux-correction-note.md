# Phase 4 WP-8 P-37 Intended-Admin UAT and Placement UX Correction Note

**Status:** P-37 remains **HOLD**. The first no-reset intended-admin Local UAT
session on 2026-07-17 failed the comprehension gate before any placement batch
was confirmed. A bounded UI correction is implemented and pushed. A
2026-07-18 Local-only continuation then passed controlled stale-lock rejection,
one accepted placement, same-request idempotent replay, accepted-state route
readback, and audited cleanup. Corrected source checkpoint
`e6d79d77bd8fb8d6a0211d7d7b440d2136cb6512` is pushed. Owner re-UAT for
complete keyboard traversal and leave/reload recovery remains open; those
operator gates are not inferred from RPC or screenshot evidence.

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

In the final Browser Use session, automated click/type calls focused controls
but did not dispatch this React/Radix client's state-changing events. The
technical RPC/route evidence above is retained, but complete keyboard and
leave/reload recovery are therefore deliberately not marked passed.

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

## 4. Current Local state

The temporary UAT fixture was audited-abandoned after evidence capture:

- active pointer `2568.0.0`, 710 rows, canonical hash unchanged;
- zero working drafts; test version `2568.13.0` is `abandoned` with 728 retained
  audit rows, lock `4`, and placement revision `2`;
- `catalog_admin_enabled = false`, `catalog_new_identity_enabled = false`, and
  `catalog_retirement_enabled = false`;
- 198 BOQs, 1,547 BOQ items, zero unversioned BOQs;
- Factor F current `2569.0.0`, 36 rows;
- Production touched: **No**.

## 5. Remaining P-37 exit path

P-37 may be reconsidered only after the intended admin can complete the
remaining corrected-flow gates without developer or SQL guidance. The stale,
single-confirmation, duplicate-replay, accepted-state, and cleanup mechanics in
steps 5-7 below passed technically on 2026-07-18, but operator comprehension is
not inferred:

1. explain the system-suggested batch and the meaning of shifted inherited
   sequence numbers;
2. inspect all rows, search/filter, change one insertion gap, and reorder two
   new rows in the same gap;
3. complete the supported controls by keyboard with visible focus;
4. leave/reload and recover the browser-local choices;
5. recognize the stale-placement response and choose the correct recovery path
   in the UI; the DB stale/retry/idempotency contract is already proven;
6. inspect the final summary, enter a reason, and explain the one-batch
   confirmation; the Local batch was already accepted once for technical
   evidence;
7. verify the accepted state/final review; audited fixture cleanup and disabled
   baseline restoration are already complete;
8. record exact commit/push provenance: corrected source checkpoint
   `e6d79d77bd8fb8d6a0211d7d7b440d2136cb6512` is pushed. Focused/full tests,
   TypeScript, lint, production build, authority consistency, and diff checks
   passed on the same source candidate on 2026-07-18.

Until owner keyboard/leave-reload re-UAT and explicit acceptance pass,
WP-8 remains **In progress**, P-37 remains **HOLD**, Add/Supplement remains
hidden for release, and P-12 through P-15 remain unauthorized.
