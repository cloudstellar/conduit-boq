# Master Catalog Phase 4 Admin Operating Procedure

**Status:** Procedure amended under P-22/P-23; source/static implementation of the
one-working-draft, audited-abandon, item-first, and final snapshot-review flow
passed on `ac31feb`, and G1 Local DB/concurrency evidence passed on `e463270`.
P-23 owner-approved the persistent operator identity, information-only global
navigation, exact-draft import, and explicit review-export semantics on
2026-07-13. Its working-tree UI/static/browser checkpoint passed and awaits
owner review/commit before an exact G2 candidate is named. WP-6.6 closeout
remains on Hold for G2 independent
rebuild/P-20 comparison and G3 owner review. Prior `3bfc74e` evidence is
historical. P-18/P-19 where applicable and independent intended-admin WP-8 UAT
remain pending. The Local UI must not be treated as Production-ready until
those gates pass.
**Audience:** Active Master Catalog administrators
**Rule:** A draft is not official; published versions are immutable

## 1. Before starting

Confirm you are signed in with an active admin account and have:

- the change reason and requested scope;
- approval/source reference and physical filing location;
- the intended version/effective date;
- permission to change price data, if any;
- a current view of the active/default catalog.

The Master Catalog header must show the signed-in admin and role. In Local it
must also show the environment from the explicit Local configuration. Stop if
the displayed operator or environment is not the one intended for the work.

Do not continue when another admin is publishing, the current pointer is
unexpected, or the source/approval reference is unclear.

Factor F is not administered through this Master Catalog procedure. If Factor F
must change, stop and use ADR-005 plus the separate Factor F Change Request.
Do not update Factor F rows in place and do not backfill old BOQs with a current
factor version by assumption.

## 2. Status meanings

| Status | Meaning | Can edit? | Can users use for new BOQs? |
|---|---|---|---|
| Draft | Working copy; not official | Yes, by active admin | No |
| Published/Active | Official immutable version | No | Only when singleton pointer selects it |
| Archived | Official historical version | No | No, but readable/exportable |
| Stale Draft | Draft whose base is no longer Current; comparison only | No | No |
| Abandoned | Never-published working attempt closed with an audited reason; history only | No | No |

The “current” badge follows the singleton pointer, not a screen-local choice.
Phase 4 Core has no Archive action. A former current version remains
Published/Active and readable/exportable; archival is a later separately
approved maintenance capability.

## 3. Create a draft

1. Open **บัญชีราคามาตรฐาน → บัญชีปัจจุบัน**.
2. Confirm the version marked current.
3. Check whether the Current version already has a working draft. Only one is
   allowed; open it rather than creating a competing release workspace.
4. When none exists, choose the business intent:
   **ประจำปีใหม่**, **ปรับปรุง/เพิ่มเติม**, or **แก้ไขข้อมูลเดิม**.
5. For **ประจำปีใหม่**, enter the owner-designated effective BE year. Do not
   infer it from the preparation, publication, or deployment date. It must be
   from the year after the current base through 10 years after that base; the
   form shows the exact allowed range.
6. Review the system-planned version and every lower reserved number shown. The
   registry includes active, archived, draft, and abandoned versions.
7. Enter a specific draft name and reason, then acknowledge that the number will
   remain reserved even if the draft is later abandoned.
8. Select **สร้างและเปิดพื้นที่ทำงาน** once. A successful create opens that
   exact draft automatically. If another admin reserves the number first, the
   screen reloads the registry and proposes the next valid number; review that
   new number before submitting again. Use **ลองโหลดทะเบียนใหม่** if the
   registry read itself failed. Do not resubmit a stale displayed number.

If creation fails, read the red Thai message before retrying. The page may
refresh registry data in the background, but the message must remain visible
and receive focus. Expand **ข้อมูลสำหรับติดตามปัญหา** only when support asks
for the problem code or request ID. Never treat those technical identifiers as
business approval evidence.

Use **ปรับปรุง/เพิ่มเติม** for newly approved price/item/policy content. Use
**แก้ไขข้อมูลเดิม** only to restore the same approved official source. If a
change contains both, use the higher-impact revision. Editing within the same
unpublished draft does not create another catalog version.

The new draft records `based_on_version_id`. If the current pointer changes
later, the draft becomes stale and cannot publish. Create a new draft from the
new Current version and deliberately reapply still-approved changes. The stale
draft remains read-only for comparison; Phase 4 Core does not rebase it.

To start over while the same base remains Current, choose **Abandon draft**,
confirm the exact draft/lock, and record a specific reason. The system retains
all rows and audit history as read-only and then permits a fresh clone. Never
delete a draft, use Archived for this purpose, or attempt to reopen an
abandoned draft.

Abandon never frees its version number. A replacement uses the next reserved
number in the selected lane. If an annual `{year}.0.0` draft was abandoned, keep
the truthful owner-designated year and use the next patch-0 revision proposed by
the system; never reuse the cancelled number or change the year merely to pass
validation.

For first structured-code rollout, choose **ปรับปรุง/เพิ่มเติม** from
`2568.0.0`; `2568.1.0` is the expected candidate only when that number has not
already been reserved. Confirm all 710 names, units, and prices are unchanged
before applying mappings.

## 4. Manual add

Use when one approved item must be added without replacing a workbook.

1. Open the draft and choose **Add item**.
2. Select an approved category and `AAA/TTT` code group. Do not type a new
   taxonomy name or choose a numeric suffix.
3. Let the server reserve the next never-issued sequence in that group; stop if
   capacity review is required at 900.
4. Enter item name, unit, material cost, and labor cost.
5. Confirm calculated unit cost.
6. Enter a specific reason and real price-authority reference.
7. Review the before/after preview and save.

The item is not usable by ordinary users until the draft is published/current.
Under P-18, any draft containing a newly added/supplement identity must remain
unpublishable until placement governance is approved. The WP-6.5 guard should
return `P18_PLACEMENT_REVIEW_REQUIRED` and keep the draft available for review.
The Local WP-6.5 guard safely exposes this count, but WP-6.6 and WP-7.5 must
complete the operator path before it is release-ready.
The draft/import preview must show this publication hold immediately after the
new identity appears, together with the placement decision needed; do not wait
until the final Publish click to inform the operator.

## 5. Manual edit

1. Search by legacy code, canonical code, or item name.
2. Confirm the search covers the complete selected version, then open the exact
   item and verify its identity/history/current values.
3. Choose **Edit in this draft**.
4. Change only approved fields.
5. Enter the reason; name, unit, or money changes also require price authority.
6. Review highlighted field differences and save.

If another admin saved first, the system returns a lock conflict. Refresh,
review their change, and reapply deliberately. Do not overwrite blindly.

## 6. Retire an item

1. Open the item in the draft.
2. Choose **Retire from this version**.
3. Confirm affected code, identity, and whether a replacement exists.
4. Enter reason and optional replacement reference.
5. Review Full-import/retirement warnings and confirm.

Retirement removes the item from the new version's active set; it does not
delete identity, code registry, history, prior versions, or historical BOQs.
Until P-19 is approved, show that a draft with retired rows cannot produce a
final field-facing PDF and identify the required owner/data-custodian policy
before the operator proceeds to publication readiness.

## 7. Recode an item

1. Open item history and confirm stable identity.
2. Choose **Recode in this draft**.
3. Select the approved group and let the server allocate the next never-issued
   code. Do not reuse a gap or type an arbitrary suffix.
4. Confirm the legacy code remains registered to the same identity.
5. Enter reason and review the recode diff.
6. Save.

Never reuse a retired code or change a published row in place.

### 7.1 Correct a mistaken draft action

- Use **Reactivate in this draft** when an inherited identity was retired by
  mistake. Confirm the same identity/code and review the old/new active state.
- Use **Withdraw new draft item** only when the identity was created in this
  draft and has never existed in the base/published catalog. This removes the
  provisional draft row but retains identity, code reservation, and audit.
- Never correct a mistake by deleting audit, reusing the code, or direct SQL.
- If the action is not eligible, keep the draft and create a deliberate new
  change/draft under the displayed recovery instruction.

## 8. Excel import

Open the exact working draft, then choose **นำเข้าชุดข้อมูล**. Import is a
draft-scoped action, not a global Master Catalog section. The route fixes the
target draft and the page shows its version/base context; do not choose the
target a second time.

The Excel/PDF files produced by **ส่งออกเพื่อตรวจ** are review artifacts, not
import templates. Import accepts only the separately approved workbook/profile
with sheet `01_Item_Master_Final` and its required headers. A future round-trip
bulk editor requires a separate owner-approved contract.

### Prepare

1. Use only the approved workbook/profile.
2. Confirm the raw file is filed physically and obtain its archive reference.
3. Confirm the draft/version/base shown by the route is exact and current.
4. Choose **Full** or **Supplement**:
   - Full: omitted current items are proposed for retirement.
   - Supplement: omitted items remain unchanged.

Every Full-import omission is shown. If retirements reach
`max(10, ceil(2% of active base))`—15 rows for the current 710-row
baseline—obtain an owner approval reference for the exact count before apply.

### Parse and preview

1. Select the local `.xlsx`; the raw file stays in the browser.
2. Wait for sheet/header/profile and source hash validation.
3. Enter physical archive reference and reason.
4. Review the complete server-recomputed row diff, not only browser summary
   counts. Confirm add/update/recode/retire/unchanged rows and every exact Full
   omission.
5. Filter errors, warnings, price differences, adds, retires, and recodes.
6. Review publication holds for new-identity placement and retired-row PDF
   policy before applying; the UI must not present apply as publication-ready.
7. For approved new rows, enter the real batch price-authority reference and
   any explicit row override where the evidence differs.
8. Resolve every blocking row.

Browser validation is only a preview. The server revalidates the submitted
normalized data. Browser-only preview creates no import record; server
validation records `validated` or `rejected`.

### Apply

1. Confirm expected draft and lock version.
2. When the mass-retirement threshold is reached, type the exact count and
   enter the owner approval reference.
3. Apply once. The system resubmits the normalized payload for server hash
   comparison; the raw workbook still stays local and is not uploaded.
4. The screen creates and retains one apply operation ID; the validated import
   transitions once to `applied`.
5. If the result is uncertain, confirm that the submitted editable values remain
   visible, then refresh import/change history before retrying. Retry the same
   intended apply with the same operation ID so the prior result is returned.
   Do not reconstruct the payload from memory or start a new operation ID until
   the prior result is known or the operator explicitly begins a different apply.
6. After success, return to the same draft workspace and confirm the success
   notice, created change set, item histories, and incremented draft revision.

K-formula columns are ignored/excluded in Phase 4 Core.

Factor F columns or worksheets are also excluded from Master Catalog import.
They require the separate Factor F process.

## 9. Review a draft

Choose **ตรวจฉบับสุดท้าย** from the draft workspace. It must compare the
complete final database snapshots against the exact base by stable identity,
not only list import events. Before requesting publication, verify:

- base version is still current;
- row counts and add/update/retire/recode totals are expected;
- compound changes show every changed old/new field; a reverted item is not
  counted as changed merely because history contains earlier edits;
- all reconciliation/taxonomy decisions are resolved;
- no unauthorized price/name/unit delta exists;
- category and code group are complete;
- unit cost equals material plus labor;
- each change has actor, reason, time, and source;
- approval/effective/archive references are complete;
- the exact selected draft is current-base and all required rows are visible;
- categories resolve to the Production-derived versioned set; code groups
  resolve to the approved P-06 dictionary; allocation
  evidence contains no caller-created suffix/taxonomy;
- P-18/P-19 publication holds are visible before publish and include the
  required recovery/decision path;
- the displayed request ID can be copied for support when a mutation result is
  uncertain.

Record the displayed draft lock as part of this review. If any manual/import
mutation occurs afterward, return to this page and review again; the prior
review must not publish the changed draft.

Use item history to inspect any suspicious change. History follows identity
through codes and versions.

## 10. Publish

Publication is high impact.

1. Open **Review changes before publication** from the draft workspace.
2. Resolve all blocking errors.
3. Enter/confirm approval reference, approval document date, effective date,
   physical archive reference, and publish reason.
   The publisher actor/name is shown from the signed-in profile and is not a
   free-text evidence field.
4. Review the complete final diff totals, changed rows/fields, item count, and
   warning acknowledgements.
5. Confirm no add/supplement/new identity rows are present unless P-18
   placement governance and guard evidence are approved.
6. If the draft has begun the structured-code rollout by containing any active
   canonical `AAA-TTT-NNN` row, confirm no active legacy `ITEM-####` row remains
   except the approved `ITEM-0139` exception. An unchanged legacy-only clone does
   not activate this rollout guard.
7. If any inactive/retired rows are present, confirm P-19 official PDF policy.
8. Confirm the version number and current base/pointer.
9. Obtain explicit owner approval for this exact version.
10. Type/confirm the version when prompted and publish from this review page
    once. The screen retains this publish operation ID until a definitive
    result and submits the exact reviewed lock version.

If publication succeeds, the version is immutable and the pointer moves
atomically. Do not attempt to edit it.

## 11. Generate official exports

1. Open the published version, not merely “current.”
2. Choose **ส่งออกเอกสาร → Excel สำหรับตรวจสอบ** or
   **PDF สำหรับอ่าน/พิมพ์**. On a draft the equivalent menu is
   **ส่งออกเพื่อตรวจ** and every artifact remains non-official.
3. Verify the field-facing PDF cover includes only organization,
   `ฉบับบัญชีราคา`, Thai status, effective date, item count, and full dataset
   hash. Verify complete approval/publication/export metadata separately in
   Excel/release/filing evidence.
4. Confirm both export count/hash equal the version detail.
5. Visually inspect Thai text, columns, page headers, and numeric formats.
6. After each final file exists, calculate its binary SHA-256 and record it
   separately from the dataset hash in the release note.
7. File both copies in the approved physical/digital filing location.

For retained Local P-11 evidence only, commit the reviewed implementation first,
run `npm run artifacts:master-catalog:generate` against the Local app, and retain
the resulting new directory only when its tracked semantic verification says
`passed`. The generator refuses a dirty tracked tree and never overwrites an
existing evidence directory. Rerun an existing pair with
`npm run artifacts:master-catalog:verify -- <artifact-manifest.json>`. These
commands do not authorize Production publication or replace final owner visual
confirmation.

Draft exports must show `DRAFT – ห้ามใช้อ้างอิง` and cannot be treated as
official references.

## 12. Restore the current pointer

Use only when a published current version must stop being used for new BOQs.

1. Obtain owner approval and identify the prior published target.
2. Open the exact target version and choose **คืนเวอร์ชันใช้งาน**.
3. Enter a specific reason, then open the confirmation summary.
4. Verify the displayed current-to-target versions and acknowledge that new
   BOQs will use the target while historical BOQs do not change.
   If the current version cannot be loaded, the control stays closed; reload
   the data and do not confirm from a blank or assumed current value.
5. Verify pointer, badges, and audit record.
6. Create a correction catalog version; do not edit/delete the failed version.

## 13. Troubleshooting

| Message | What to do |
|---|---|
| Profile not recognized | Confirm exact workbook/sheet/header version; do not map columns manually |
| Payload/file/row too large | Stop and contact development; do not split data informally |
| Price authority required | Preserve Production price or attach separately approved price change |
| Unknown category/code group | Stop; select an approved versioned category or P-06 code group. Do not create taxonomy through an item form |
| Code capacity review required | Stop automatic allocation at sequence 900 and obtain a separate owner/data-custodian decision |
| Reconciliation required | Complete identity/code decision in the approved artifact |
| Retirement approval required | Verify Full-import mode, type the exact retirement count, and enter the real owner approval reference |
| Draft lock conflict | Refresh and reconcile the other admin's change |
| Working draft already exists | Open the existing Current-base workspace; abandon it with a reason only when the attempt truly must be replaced |
| Draft review changed | The draft was edited after review. Return to final comparison, inspect the new state, and publish only with the refreshed lock |
| Draft base stale | Create a new draft from Current and reapply approved changes; do not publish/rebase the stale draft |
| Current restore version unavailable | Keep Restore closed, reload the version data, and verify both current and target before confirming |
| Publish evidence required | Complete real approval metadata; do not use placeholder text |
| Draft is stale/read-only | Select/create a current-base draft and deliberately reapply approved changes; do not rebase or force the stale draft |
| Export hash mismatch | Do not distribute; report with request/version/hash details |
| Placement review required | Keep the draft; do not publish. Obtain approved item placement under P-18 and rerun readiness checks |
| Retired-row PDF policy required | Keep the draft; do not file the field-facing PDF until P-19 is approved |
| Result uncertain / timed out | Do not repeatedly create new submissions. Confirm the submitted values remain visible, copy the request ID, refresh audit/state, and retry only through the same operation when instructed; report any cleared field before retrying |
| Factor F change requested | Out of scope for this procedure; do not edit Master Catalog data, Factor F data, or legacy BOQs |

## 14. Prohibited actions

- Direct database/table edits outside approved migration/functions
- Editing or deleting a published version
- Deleting a draft, relabelling it Archived to start over, or mutating an
  abandoned/stale draft
- Creating competing mutable drafts from the same base
- Reusing an item code
- Typing a new category/code-group definition or arbitrary code suffix through
  an ordinary item/import workflow
- Treating workbook row number/`item_id` as identity
- Publishing workbook price/K changes without authority
- Changing Factor F through Master Catalog tools
- Backfilling legacy BOQs with a guessed Factor F version
- Auto-repricing old BOQs after a Factor F change
- Uploading source files to unapproved locations
- Using another person's account or placeholder approval evidence
- Repeatedly clicking high-impact actions after an uncertain response

## 15. Operator evidence checklist

- [ ] Version/base/effective date confirmed
- [ ] Source/approval/physical archive references complete
- [ ] Diff and warning totals reviewed
- [ ] Exact draft/item selected; complete catalog/history available
- [ ] Versioned category/P-06 code group and server-allocated code confirmed where relevant
- [ ] Full-import retirement count/reference verified when threshold applies
- [ ] Price authority confirmed or no price change
- [ ] Request completed with recorded request ID
- [ ] Item count/dataset hash recorded after publish
- [ ] Excel/PDF verified; binary file hashes recorded; copies filed
- [ ] Verification/release note updated

## 16. Intended-admin UAT before feature enablement

An intended active admin/data custodian, not the implementer, must complete this
script on the approved Local/preview environment:

Developer DB/transport fault-injection evidence may prepare and verify the
uncertain-response example, but it does not substitute for the intended admin
recognizing the message and completing the recovery through the UI.

1. identify the one current-base workspace, create an ADR-003-valid draft when
   none exists, abandon/recreate one test attempt with a reason, and explain why
   stale/abandoned drafts remain read-only;
2. search the complete catalog including first/middle/last rows and inspect one
   item's field-level history;
3. preview an approved workbook and explain Full versus Supplement impact,
   complete row diff/omissions, and price authority;
4. recognize and recover from at least three representative safe failures,
   including stale lock/base, placement/retirement hold, or invalid authority;
5. perform one eligible reactivate or never-published withdraw correction and
   explain what identity/code/audit evidence remains;
6. review the authoritative final snapshot diff, compound/reverted behavior,
   item history, authenticated publisher/archive evidence, and publication
   readiness without SQL;
7. locate version/status/count/hash in Excel/PDF and distinguish dataset hash
   from binary file hash;
8. handle an uncertain-response example using the same request ID, verify that
   submitted fields remain unchanged before retry, and confirm they reset only
   after success;
9. restore to a safe screen without an irreversible mistake or developer help.
10. edit after opening final review, observe the stale-review conflict, and
    complete a fresh review before any successful publication rehearsal.

Record task completion, misunderstood wording, recovery outcome, elapsed time,
browser/device, and reviewer. A failed or developer-dependent critical task
blocks P-14 until the UX/procedure is corrected and rerun.
