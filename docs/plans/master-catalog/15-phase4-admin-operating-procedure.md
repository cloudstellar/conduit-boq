# Master Catalog Phase 4 Admin Operating Procedure

**Status:** Draft procedure for UI implementation and training
**Audience:** Active Master Catalog administrators
**Rule:** A draft is not official; published versions are immutable

## 1. Before starting

Confirm you are signed in with an active admin account and have:

- the change reason and requested scope;
- approval/source reference and physical filing location;
- the intended version/effective date;
- permission to change price data, if any;
- a current view of the active/default catalog.

Do not continue when another admin is publishing, the current pointer is
unexpected, or the source/approval reference is unclear.

## 2. Status meanings

| Status | Meaning | Can edit? | Can users use for new BOQs? |
|---|---|---|---|
| Draft | Working copy; not official | Yes, by active admin | No |
| Published/Active | Official immutable version | No | Only when singleton pointer selects it |
| Archived | Official historical version | No | No, but readable/exportable |

The “current” badge follows the singleton pointer, not a screen-local choice.
Phase 4 Core has no Archive action. A former current version remains
Published/Active and readable/exportable; archival is a later separately
approved maintenance capability.

## 3. Create a draft

1. Open **Master Catalog → Versions**.
2. Confirm the version marked current.
3. Select **Create draft from current version**.
4. Enter the proposed version, effective date, and reason.
5. Review the base version and expected row count.
6. Confirm creation once.

The new draft records `based_on_version_id`. If the current pointer changes
later, the draft becomes stale and cannot publish. Create a new draft from the
new Current version and deliberately reapply still-approved changes. The stale
draft remains read-only for comparison; Phase 4 Core does not rebase it.

For first structured-code rollout, clone `2568.0.0` to `2568.1.0` and confirm
all 710 names, units, and prices are unchanged before applying mappings.

## 4. Manual add

Use when one approved item must be added without replacing a workbook.

1. Open the draft and choose **Add item**.
2. Allocate/enter an approved code and code group.
3. Enter item name, unit, category, material cost, and labor cost.
4. Confirm calculated unit cost.
5. Enter a specific reason and approval reference when price authority applies.
6. Review the before/after preview and save.

The item is not usable by ordinary users until the draft is published/current.

## 5. Manual edit

1. Search by legacy code, canonical code, or item name.
2. Open the item and verify its identity/history.
3. Choose **Edit in this draft**.
4. Change only approved fields.
5. Enter the reason; price changes also require price authority.
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

## 7. Recode an item

1. Open item history and confirm stable identity.
2. Choose **Recode in this draft**.
3. Enter a never-issued approved canonical code and group.
4. Confirm the legacy code remains registered to the same identity.
5. Enter reason and review the recode diff.
6. Save.

Never reuse a retired code or change a published row in place.

## 8. Excel import

### Prepare

1. Use only the approved workbook/profile.
2. Confirm the raw file is filed physically and obtain its archive reference.
3. Choose **Full** or **Supplement**:
   - Full: omitted current items are proposed for retirement.
   - Supplement: omitted items remain unchanged.

Every Full-import omission is shown. If retirements reach
`max(10, ceil(2% of active base))`—15 rows for the current 710-row
baseline—obtain an owner approval reference for the exact count before apply.

### Parse and preview

1. Select the local `.xlsx`; the raw file stays in the browser.
2. Wait for sheet/header/profile and source hash validation.
3. Enter physical archive reference and reason.
4. Review summary counts and row-level diff.
5. Filter errors, warnings, price differences, adds, retires, and recodes.
6. Resolve every blocking row.

Browser validation is only a preview. The server revalidates the submitted
normalized data. Browser-only preview creates no import record; server
validation records `validated` or `rejected`.

### Apply

1. Confirm expected draft and lock version.
2. When the mass-retirement threshold is reached, type the exact count and
   enter the owner approval reference.
3. Apply once. The system resubmits the normalized payload for server hash
   comparison; the raw workbook still stays local and is not uploaded.
4. A separate request ID protects this mutation; the validated import
   transitions once to `applied`.
5. If the result is uncertain, refresh import/change history before retrying;
   request ID prevents duplicate effects.
6. Review the created change set and item histories.

K-formula columns are ignored/excluded in Phase 4 Core.

## 9. Review a draft

Before requesting publication, verify:

- base version is still current;
- row counts and add/update/retire/recode totals are expected;
- all reconciliation/taxonomy decisions are resolved;
- no unauthorized price/name/unit delta exists;
- category and code group are complete;
- unit cost equals material plus labor;
- each change has actor, reason, time, and source;
- approval/effective/archive references are complete.

Use item history to inspect any suspicious change. History follows identity
through codes and versions.

## 10. Publish

Publication is high impact.

1. Open the draft's **Publish readiness** panel.
2. Resolve all blocking errors.
3. Enter/confirm approval reference, approval document date, effective date,
   physical archive reference, and publish reason.
4. Review final diff totals, item count, and warning acknowledgements.
5. Confirm the version number and current base/pointer.
6. Obtain explicit owner approval for this exact version.
7. Type/confirm the version when prompted and publish once.

If publication succeeds, the version is immutable and the pointer moves
atomically. Do not attempt to edit it.

## 11. Generate official exports

1. Open the published version, not merely “current.”
2. Choose **ส่งออก Excel** and **พิมพ์ / บันทึก PDF**.
3. Verify stamp includes version, effective date, published time/by, item count,
   and full dataset hash.
4. Confirm both export count/hash equal the version detail.
5. Visually inspect Thai text, columns, page headers, and numeric formats.
6. After each final file exists, calculate its binary SHA-256 and record it
   separately from the dataset hash in the release note.
7. File both copies in the approved physical/digital filing location.

Draft exports must show `DRAFT – ห้ามใช้อ้างอิง` and cannot be treated as
official references.

## 12. Restore the current pointer

Use only when a published current version must stop being used for new BOQs.

1. Obtain owner approval and identify the prior published target.
2. Open target version and choose **Make current (restore)**.
3. Review affected new-BOQ behavior; historical BOQs do not change.
4. Enter reason/reference and confirm once.
5. Verify pointer, badges, and audit record.
6. Create a correction catalog version; do not edit/delete the failed version.

## 13. Troubleshooting

| Message | What to do |
|---|---|
| Profile not recognized | Confirm exact workbook/sheet/header version; do not map columns manually |
| Payload/file/row too large | Stop and contact development; do not split data informally |
| Price authority required | Preserve Production price or attach separately approved price change |
| Reconciliation required | Complete identity/code decision in the approved artifact |
| Retirement approval required | Verify Full-import mode, type the exact retirement count, and enter the real owner approval reference |
| Draft lock conflict | Refresh and reconcile the other admin's change |
| Draft base stale | Create a new draft from Current and reapply approved changes; do not publish/rebase the stale draft |
| Publish evidence required | Complete real approval metadata; do not use placeholder text |
| Export hash mismatch | Do not distribute; report with request/version/hash details |

## 14. Prohibited actions

- Direct database/table edits outside approved migration/functions
- Editing or deleting a published version
- Reusing an item code
- Treating workbook row number/`item_id` as identity
- Publishing workbook price/K changes without authority
- Uploading source files to unapproved locations
- Using another person's account or placeholder approval evidence
- Repeatedly clicking high-impact actions after an uncertain response

## 15. Operator evidence checklist

- [ ] Version/base/effective date confirmed
- [ ] Source/approval/physical archive references complete
- [ ] Diff and warning totals reviewed
- [ ] Full-import retirement count/reference verified when threshold applies
- [ ] Price authority confirmed or no price change
- [ ] Request completed with recorded request ID
- [ ] Item count/dataset hash recorded after publish
- [ ] Excel/PDF verified; binary file hashes recorded; copies filed
- [ ] Verification/release note updated
