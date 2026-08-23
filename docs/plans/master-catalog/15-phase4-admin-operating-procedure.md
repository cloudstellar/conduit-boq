# Master Catalog Phase 4 Admin Operating Procedure

> **Current P-50 ratification receipt (2026-08-24):** the P-50C JSON package is
> a technically verified review oracle, not an import payload. Exact P-50D V3
> Owner confirmation (ratification) is recorded under [Review Remediation
> #54](./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md),
> and the package is accepted only as local review evidence.
> Generate review-only Excel/PDF only from the later separately authorized exact
> P-14C draft. The required small repository gate is the next safe step;
> commit/push, CI/Preview, database, Production, candidate application, P-13
> through P-15, publication, and automatic continuation remain unauthorized;
> any contrary same-day wording below is superseded history.

> **Canonical term:** **exact Owner confirmation (ratification)** has the single
> meaning defined in [Review Remediation #54](./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md):
> confirm the post-build UUID and named SHA-256 values and accept P-50C only as
> local review evidence. It authorizes no candidate application, Git/CI,
> database/Production/network, P-13/P-14/P-14C/P-15, deploy, or publication.

> **P-50D V3 ratification stop boundary — reached (2026-08-24):**
> [Review Remediation #54](./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md)
> records the exact Owner ratification and then stops. No small repository
> gate, Git/CI request, candidate application, database/Production/network
> action, P-13 through P-15, deploy, or publication is authorized. This
> supersedes live wording below that names any next step; every later action
> requires a new explicit Owner instruction.

**Status:** Procedure amended under P-22/P-23; source/static implementation of the
one-working-draft, audited-abandon, item-first, and final snapshot-review flow
passed on `ac31feb`, and G1 Local DB/concurrency evidence passed on `e463270`.
P-23 owner-approved the persistent operator identity, information-only global
navigation, exact-draft import, and explicit review-export semantics on
2026-07-13. Its working-tree UI/static/browser checkpoint passed and awaits
owner review/commit before an exact G2 candidate is named. Final G1R and the
separately approved independent G2 rebuild/P-20 comparison later passed on
exact candidate `721c2c2`. The owner accepted G3/WP-6.6 on exact application
checkpoint `78e96ab3ed9993707014c4aba1d285b7592b17a1` at
2026-07-14 23:50 +07. Prior `3bfc74e` evidence is historical. G4,
P-18 technical placement, and P-36 integrated rehearsal later passed. The
corrected P-37 flow also passed Local stale/accept/replay/cleanup mechanics,
final no-reset leave/return/reload recovery, and owner keyboard/focus/
presentation UAT on pushed checkpoint `f36d896d672609653de6634e307dcc44bce6d519`.
At that checkpoint the owner did not submit the final placement batch through
the UI, so P-37 remained HOLD for that final independent submission plus the
broader core-admin, safe-error, and performance rows in
[Closure Matrix #34](./34-phase4-wp8-p37-closure-matrix.md). P-19 when triggered
and all Production gates remain pending. The Local UI must not be treated as
Production-ready until those gates pass. The first P-38 Card A run was stopped
and cleaned after the owner identified that permanently consuming a number for
an abandoned draft would create unexplained gaps in official releases. P-39 now
separates immutable draft references from reusable, unissued target versions;
see [Correction Plan #37](./37-phase4-p39-draft-identity-release-number-correction-plan.md).
P-39R also permits only one open draft across the whole catalog. A stale draft
must be inspected and audited-abandoned before another can be created; it cannot
be edited, imported, placed, readied, or published. P-38 may resume only after
the P-39R Local gates pass. P-42 further requires every mutable final-review URL
to show and retain its exact `reviewLock`. After another tab changes the draft,
reload the original review URL: it must show old/current locks, hide the diff
and publication form, and offer **เปิดฉบับตรวจล่าสุด**. Never submit a request
already known to be stale merely to prove a guard. Published and abandoned
review pages are read-only history and must not display draft-only stale-base
wording. See
[Incident Note #38](./38-phase4-p42-final-review-snapshot-binding-incident-note.md).
The scored sequence,
named safe errors, measurement budget, and cleanup remain in
[Owner UAT Script #35](./35-phase4-wp8-p37-evidence-reconciliation-and-owner-uat-script.md);
this section remains the general operating contract.

**Current P-37 disposition (2026-07-25):** the Owner explicitly accepted the
completed package under a guided-UAT variance against exact
`df44b827b290933463da5e14fa9125314660022a`. The requested button-by-button
guidance remains disclosed; this procedure must not describe that evidence as
independent/no-assistance. WP-8 is complete. Add/Supplement remains hidden
until P-14, and this procedure still grants no Production authority.

**Historical P-51 Production sequencing overlay (2026-08-18; superseded for
current execution on 2026-08-21):**
`P51_CANONICAL_PRODUCTION_SEQUENCE_V2`. This operating procedure does not grant
any gate. For the bounded first closeout, the order is separately approved
P-50R-I implementation freeze, P-50R-O PDF oracle, P-50R-X reconciliation,
then P-50D; P-50C non-Production rebuild or zero-price refreeze with review-only
artifacts marked `DRAFT – ห้ามใช้อ้างอิง`; identifier freeze and Git/CI/Preview;
P-13 fresh read-only Production manifest plus reverification of the existing
P-12 backup (not a new backup); P-14 using exact temporary
`catalog_admin_enabled=true`, `catalog_new_identity_enabled=false`,
`catalog_retirement_enabled=false` and final all-false matrices; audited-abandon
the P-14 UAT draft and prove zero working drafts; separate P-14C real Production
candidate preparation; and P-15 naming the exact Production draft reference and
final `reviewLock`. Closeout order is publish, official exports, named BOQ
canaries, final all-false flags, final invariants, then backup/isolated restore/
checksum/custody. Completion of one step never authorizes the next. If the
first P-15 closeout remains unfinished at 2026-08-25 23:59:59 +07, stop and
obtain fresh explicit Owner reapproval of the P-51 waiver; no extension is
automatic.

**Current sequencing correction (2026-08-24):**
`P51_CANONICAL_PRODUCTION_SEQUENCE_V3`. The unexecuted P-50R-I/O/X model above
is historical. The current route is `P-51D -> P-50R SOLO complete -> one exact
P-50D V3 Owner confirmation (ratification), also accepting existing verified
P-50C only as local review evidence -> separately authorized local release
commit/push + CI/Preview -> P-13/P-14/P-14C bounded window -> P-15 -> closeout
-> P-49`. P-50R SOLO keeps exact hashes, offline/read-only access, 100% row
coverage, two byte-identical passes, and Owner review of all 28 PDF pages and
every delta/exception. It does not authorize the pending confirmation or a
mutation.

One bounded-window decision may enumerate sequential P-13 flags-off deploy/
smoke, P-14 minimum-admin UAT, and P-14C creation/review of exactly one real
unpublished draft. Before advancing from P-14 to P-14C, audited-abandon the UAT
draft and prove zero working drafts, unchanged pointer/version/count/hash,
unchanged BOQ/Factor F invariants, and the expected temporary flag matrix. Stop
at the reviewed unpublished draft. P-15 remains a separate exact confirmation
bound to that draft reference and final `reviewLock`; no earlier PASS implies
publication. If the first closeout remains unfinished at 2026-08-25 23:59:59
+07, stop for fresh Owner reapproval rather than rushing Production.

**Superseded same-day P-50D/P-50C interpretation (2026-08-23):** a same-day
reading of the Owner's business intent treated `SELECTED-DELTA` as approved for
only UUID
`f2662c71-a6e5-407e-8456-8608e304b43b` / `ITEM-0429` /
`COR-PB0-002`, `0/1763/1763 -> 0/1764/1764`. The other 709 baseline rows and
all other 48 P-50R candidates remain unchanged at `2568.0.0`. Exact
[Proposal #52](./52-phase4-p50d-one-row-selected-delta-approval-proposal.md),
request `P50D-REQ-20260823-V3`, binds manifest SHA-256
`1ac28a74def993214f73659f1930acdb5caa57390504e494b21d72bbf3778429`
and selected-record SHA-256
`f63127e589e7f5302f481f55b1df54a6b741efdc1aaa3b74e94d94f84abf15df`;
the 48 unselected candidates bind to
`2194d0b5f5e9c5a2deb5590aefddd53592f031ef0e9359657b707ed3c46690be`.
The offline P-50C technical build occurred and is complete in [Result
#53](./53-phase4-p50c-one-row-offline-candidate-result-record.md), but exact
P-50D V3 Owner confirmation (ratification) and acceptance only as local review
evidence remain pending under [Review Remediation
#54](./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md).
Candidate `P50C-CANDIDATE-20260823-V1` has 710 rows and exact one-row diff;
candidate/manifest SHA-256 values are respectively
`d7a19a9dbaecff4abb18086d1f9e236ae4b5ea311477ccdb609a52c54f200611`
and `d88d3daa63db6a59f9ba973d653647224584aa9d98c3efde4cbaad78f6bfefe5`.
Published/current `2568.0.0` still contains `0/1763/1763`; only the local,
provisional `2568.1.0` candidate contains `0/1764/1764`. Database/Production/
network, candidate application, commit/push, CI/Preview, P-13, P-14, P-14C,
and P-15 authorities remain false. The marker below preserves the superseded
same-day interpretation and is not current authority.

<!-- P50C_ADMIN_PROCEDURE_CURRENT_OVERLAY_V1 {"schema":"conduit-boq/p50c-admin-procedure-current-overlay/v1","currentAsOf":"2026-08-23","p50dRequestId":"P50D-REQ-20260823-V3","p50dApproved":true,"p50cCandidateId":"P50C-CANDIDATE-20260823-V1","p50cOfflineBuildComplete":true,"candidateSha256":"d7a19a9dbaecff4abb18086d1f9e236ae4b5ea311477ccdb609a52c54f200611","diffSha256":"72e950d96bfdf81abeb3317ee280cc01e630a13447d1f38edd9ee7149f3ddf18","candidateManifestSha256":"d88d3daa63db6a59f9ba973d653647224584aa9d98c3efde4cbaad78f6bfefe5","publishedVersion":"2568.0.0","publishedCatalogChanged":false,"provisionalTarget":"2568.1.0","targetRegistryCheckPending":true,"changedValueRowCount":1,"unchangedValueRowCount":709,"databaseAccessAuthorized":false,"productionReadAuthorized":false,"productionWriteAuthorized":false,"networkAuthorized":false,"candidateApplicationAuthorized":false,"localCommitAuthorized":false,"externalGitPublicationAuthorized":false,"p13Authorized":false,"p14Authorized":false,"p14cAuthorized":false,"p15Authorized":false,"automaticNextStep":false} -->

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
| Stale Draft | Draft whose base is no longer Current; inspection and audited abandon only | No | No |
| Abandoned | Never-published working attempt closed with an audited reason; history only | No | No |

The “current” badge follows the singleton pointer, not a screen-local choice.
Phase 4 Core has no Archive action. A former current version remains
Published/Active and readable/exportable; archival is a later separately
approved maintenance capability.

## 3. Create a draft

In Production, create a draft only within an exact gate: a disposable UAT draft
under P-14 or the one real candidate under P-14C. The P-14 UAT draft must be
audited-abandoned with its immutable reference/reason/audit evidence, and the
system must show zero working drafts plus an unchanged pointer before P-14C.
P-14 does not authorize creation or mutation of the real candidate.

1. Open **บัญชีราคามาตรฐาน → บัญชีปัจจุบัน**.
2. Confirm the version marked current.
3. Check whether any working draft is already open. Only one is allowed across
   the whole catalog; open it rather than creating a competing release
   workspace. If it is stale, inspect and audited-abandon it before continuing.
4. When none exists, choose the business intent:
   **ประจำปีใหม่**, **ปรับปรุง/เพิ่มเติม**, or **แก้ไขข้อมูลเดิม**.
5. For **ประจำปีใหม่**, enter the owner-designated effective BE year. Do not
   infer it from the preparation, publication, or deployment date. It must be
   from the year after the current base through 10 years after that base; the
   form shows the exact allowed range.
6. Review the system-planned **target version** and every lower issued or
   currently claimed number shown. Published/archived versions are issued;
   another mutable draft may temporarily claim a target. Abandoned attempts do
   not consume an unissued target.
7. Enter a specific draft name and reason, then acknowledge that publication
   issues the target as an official version while abandonment releases it.
8. Select **สร้างและเปิดพื้นที่ทำงาน** once. A successful create opens that
   exact draft automatically and shows its immutable reference, such as
   `2568.1.0-D001`. The `Dnnn` suffix identifies the attempt for that target;
   never treat it as part of the official release number. If another operation claims the target first, the
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
later, the draft becomes stale and cannot mutate or publish. Inspect it, choose
**ยกเลิกฉบับร่าง**, and record a specific reason. Only after that audited
abandon may you create a new draft from the new Current version and deliberately
reapply still-approved changes. Phase 4 Core does not rebase a stale draft.

To start over from a current or stale draft, choose **ยกเลิกฉบับร่าง**, confirm
the exact draft reference/lock, and record a specific reason. The system
retains the reference, target, all rows, and audit history as read-only and then
permits a fresh clone. Never delete a draft, use Archived for this purpose, or
attempt to reopen an abandoned draft.

Abandoning a never-published draft releases its target version. A replacement
gets a new draft reference and may claim the same target. For example,
abandoning `2568.1.0-D001` allows `2568.1.0-D002` to target `2568.1.0`; no
official version was skipped. A target
cannot be reused when it is published, archived, or claimed by another mutable
draft.

For first structured-code rollout, choose **ปรับปรุง/เพิ่มเติม** from
`2568.0.0`; `2568.1.0` is the expected candidate only when that number has not
already been issued or claimed. Confirm all 710 names, units, and prices are unchanged
before applying mappings.

P-50R pre-P-15 full source-price reconciliation is complete under exact request
`P50R-SOLO-REQ-20260821-V1` with `PASS_FOR_P50D_REQUEST`. Its immutable
evidence covers 28/28 PDF pages, 67 deltas, 245 exceptions, and zero blockers.
Published/current `2568.0.0` is the authority for all 710 names, units, and
prices. The 49 technical candidates are comparison evidence, not permission to
edit a draft.

Keep the published/current stable identity
`f2662c71-a6e5-407e-8456-8608e304b43b` at material/labor/unit
`0/1763/1763`; never edit `2568.0.0` or an existing BOQ in place. P-50D V3 has
approved `0/1764/1764` only for this UUID in the later candidate. Historical
[Proposal #50](./50-phase4-p50d-exact-price-and-version-disposition-decision-proposal.md)
is superseded without approval and [Proposal #51](./51-phase4-p50d-2568-baseline-first-delta-review-proposal.md)
is the consumed selection basis. [Proposal #52](./52-phase4-p50d-one-row-selected-delta-approval-proposal.md)
is frozen but unauthorized. Use candidate `P50C-CANDIDATE-20260823-V1` only as
the unaccepted local review package; do not import it or any of the other 48
P-50R price findings.

After any later exact approval, complete every approved import first, apply only
approved identity-keyed money edits last through **แก้ไขข้อมูล**, and regenerate
the entire review/hash/export evidence. Any later import invalidates the review
lock/manifest equality and requires a fresh reconciliation/diff. If those gates
do not pass, P-15 remains held unless a separate price-risk decision is
recorded. See [P-50 Plan #46](./46-phase4-p50-known-price-erratum-pre-p15-reconciliation-and-release-decision-plan.md)
and [consumed P-50R Request/Result #49](./49-phase4-p50r-exact-price-reconciliation-evidence-scope-request.md).
The offline P-50C build is complete. Git, database/Production/network access,
candidate application, P-13, P-14, P-14C, P-15, deploy, flags, and publication
remain unauthorized.

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
Under P-18, any draft containing a newly added/supplement identity remains
unpublishable until its current placement batch is accepted. The guard returns
`P18_PLACEMENT_REVIEW_REQUIRED` and keeps the draft available for review.
WP-7.5 now implements that operator path and its separately approved P-32 Local
DB/browser evidence passed. P-33 accepted the bounded technical checkpoint on
2026-07-15 13:54 +07. P-34 exact source checkpoint `0780925` then implemented
truthful dirty state, recoverable choices/navigation guard, exception filters,
keyboard-complete before/after controls, and complete impact confirmation. The
first P-37 intended-admin session later rejected that direct control model; the
current UI presents one insertion-gap choice while mapping it to the unchanged
same-category anchor/relation contract. See
[Review Note #33](./33-phase4-wp8-p37-uat-ux-correction-note.md).
Add/Supplement remain hidden or disabled until the separate integrated WP-8/
P-14 performance, accessibility/recovery, and intended-admin release gates pass.
The draft/import preview must show this publication hold immediately after the
new identity appears, together with the placement decision needed; do not wait
until the final Publish click to inform the operator.

### 4.1 Confirm placement for new items

Use this task after one or more manual/Supplement additions exist in the same
draft. Do not create another version and do not confirm 710 inherited rows one
by one.

1. Open the exact current-base draft and choose **จัดตำแหน่งรายการใหม่**.
2. Confirm that the page count equals every pending new identity. Search and
   paging only change the visible subset; the final confirmation always covers
   the complete pending batch.
3. The page opens on **ทั้งหมด** and shows **ระบบจัดให้** for complete
   suggestions. The admin does not have to click or approve every suggested row.
   Use **ปรับในหน้านี้** or **ต้องแก้** only to narrow the review when needed.
4. Read the actual final **ก่อนหน้า / รายการใหม่นี้ / ถัดไป** preview. If it is
   correct, leave that row unchanged.
5. For a wrong row, choose **เปลี่ยนตำแหน่ง**, select a category that contains
   inherited items, then select one insertion gap: **ต้นหมวด**, **ระหว่าง ...
   และ ...**, or **ท้ายหมวด**. The UI maps the gap to the accepted inherited
   anchor/relation payload; another new item is never used as an anchor.
6. When several new items share one insertion gap, use the up/down buttons to
   set their order within that group. The buttons are initially folded under
   **เปลี่ยนลำดับในช่วงนี้** so a complete system suggestion does not look like
   unfinished work. This cannot reorder inherited identities.
7. Review each final sequence number and immediate previous/next item. The final
   summary separately shows receiving categories and the count of inherited
   sequence numbers that will shift.
8. Choose the visible **ตรวจสรุปก่อนบันทึกทั้งชุด** action above the list, or
   the equivalent count-labelled action below the list, enter the real
   placement rationale, and confirm once. The operation records the new rows
   and every shifted row in one append-only change set/review.
9. If the draft changed after the page loaded, reload and review the current
   batch. Do not retry with a new hidden request ID or repair `display_order`
   directly.

After a batch is accepted, changing any local category, insertion gap, or
sibling order must immediately show **ปรับในหน้านี้ · ยังไม่บันทึก** and replace
the accepted-state claim. Do not leave the page believing those local choices
were saved. Use the supported return path or respond to the leave/reload warning
so the pending choices can be continued safely. The warning states that browser
recovery is not a draft save. A page-level accepted message must never override
a locally dirty workspace state.

After **ยกเลิกการปรับทั้งหมด**, verify that the counts return to the complete
system-suggested batch, the reset action disappears, and any
**กู้คืนตัวเลือกที่ยังไม่ยืนยันแล้ว** alert also disappears. A recovery alert
must describe pending browser-local work only; do not continue from a stale
claim.

Adding/withdrawing a new identity or changing placement-relevant category,
active state, order, or inherited-anchor topology makes the accepted placement
stale. Name, unit, and price edits alone still require normal authority/review
but do not create an unrelated placement task.

## 5. Manual edit

1. Search by legacy code, canonical code, or item name.
2. Confirm the search covers the complete selected version, then open the exact
   item and verify its identity/history/current values.
3. Choose **แก้ไขข้อมูล**.
4. Change only approved fields.
5. Enter the reason; name, unit, or money changes also require price authority.
6. Review highlighted field differences and save.

If another admin saved first, the system returns a lock conflict. Refresh,
review their change, and reapply deliberately. Do not overwrite blindly.

## 6. Retire an item

1. Open the item in the draft.
2. Choose **ยกเลิกใช้**.
3. Confirm affected code, identity, and whether a replacement exists.
4. Enter reason and optional replacement reference.
5. Select **บันทึกในฉบับร่าง**, then review the confirmation summary for the
   exact item, result, reason, and BOQ/audit effect.
6. Choose **ยืนยันยกเลิกใช้** only when the summary is correct; otherwise choose
   **กลับไปตรวจ**. Cancelling must create no mutation.

Retirement removes the item from the new version's active set; it does not
delete identity, code registry, history, prior versions, or historical BOQs.
Until P-19 is approved, show that a draft with retired rows cannot produce a
final field-facing PDF and identify the required owner/data-custodian policy
before the operator proceeds to publication readiness.

## 7. Recode an item

1. Open item history and confirm stable identity.
2. Choose **เปลี่ยนกลุ่มและจัดสรรรหัสใหม่**.
3. Select the approved group and let the server allocate the next never-issued
   code. Do not reuse a gap or type an arbitrary suffix.
4. Confirm the legacy code remains registered to the same identity.
5. Enter the reason and select **บันทึกในฉบับร่าง**.
6. Review the confirmation summary for the exact item, target group, reason,
   and BOQ/audit effect. Choose **ยืนยันเปลี่ยนรหัส** only when it is correct;
   otherwise choose **กลับไปตรวจ**. Cancelling must create no mutation.

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
baseline—obtain an owner approval reference for the exact count before selecting
**ยืนยันและบันทึกลงฉบับร่าง**.

### Parse and preview

1. Select the local `.xlsx`; the raw file stays in the browser.
2. Select **เตรียมรายการตรวจสอบ** and wait for sheet/header/profile and source
   hash validation. This step runs in the browser and does not yet check the
   candidate against the draft.
3. Enter physical archive reference and reason.
4. Select **ให้เซิร์ฟเวอร์ตรวจผลต่าง**. Review the complete server-recomputed
   row diff, not only browser summary
   counts. Confirm add/update/recode/retire/unchanged rows and every exact Full
   omission.
5. Filter errors, warnings, price differences, adds, retires, and recodes.
6. Review publication holds for new-identity placement and retired-row PDF
   policy before saving; the UI must not present a draft save as
   publication-ready.
7. For approved new rows, enter the real batch price-authority reference and
   any explicit row override where the evidence differs.
8. Resolve every blocking row.

Browser validation is only a preview. The server revalidates the submitted
normalized data. Browser-only preview creates no import record; server
validation records `validated` or `rejected`.

### Confirm and save to the draft

1. Confirm expected draft and lock version.
2. When the mass-retirement threshold is reached, type the exact count and
   enter the owner approval reference.
3. Select **ยืนยันและบันทึกลงฉบับร่าง** once. The system resubmits the
   normalized payload for server hash comparison; the raw workbook still stays
   local and is not uploaded.
4. The screen creates and retains one save operation ID; the validated import
   transitions once to `applied`.
5. If the result is uncertain, confirm that the submitted editable values remain
   visible, then refresh import/change history before retrying. Retry the same
   intended save with the same operation ID so the prior result is returned.
   Do not reconstruct the payload from memory or start a new operation ID until
   the prior result is known or the operator explicitly begins a different save.
6. After success, the server redirects to the same draft workspace. Confirm the
   durable success notice shows the source filename, resulting draft row count,
   and incremented draft revision. Use **ตรวจรายการที่เปลี่ยน** to continue review;
   use **นำเข้าไฟล์อื่นเพิ่ม** only for a deliberately separate import.
7. Confirm the applied import record, created change set, and affected item
   histories before leaving the workflow.
8. If the form silently returns to Step 1 without the success notice, or a
   selected-file badge remains after a fresh page load while the file input is
   empty, stop. Do not choose the file or submit again merely to obtain visual
   confirmation. Open the draft workspace and change/import history to
   determine whether the operation was applied, and retain any displayed
   request/problem code for recovery.

K-formula columns are ignored/excluded in Phase 4 Core.

Factor F columns or worksheets are also excluded from Master Catalog import.
They require the separate Factor F process.

## 9. Review a draft

Choose **ตรวจฉบับสุดท้าย** from the draft workspace. It must compare the
complete final database snapshots against the exact base by stable identity,
not only list import events. The URL and page must show the same reviewed
`reviewLock`; record it with the review evidence.

For P-14C, also freeze the exact Production draft reference, target, base/
pointer, mutation request IDs, final `reviewLock`, candidate dataset hash,
complete diff/counts, and approval/source identifiers. Generate only
review-only Excel/PDF artifacts labelled `DRAFT – ห้ามใช้อ้างอิง` and record
their binary hashes against that dataset hash. Any later manual change or import
invalidates the lock and this evidence package. P-14C ends with the draft
unpublished and does not authorize official exports.

For a high-volume review, use the page as a controlled review queue:

1. Start from **รายการที่ได้รับผล**, then select each summary count to filter
   that change type. One item can belong to more than one type, so category
   totals can overlap and must not be added together as an item total.
2. Use code/name/category search to investigate a named item. Use 50 rows per
   page for normal review; use 100 only when the operator can scan the denser
   page reliably. Select a page directly instead of stepping through every
   preceding page.
3. A one-field change shows its old/new value immediately. A compound change
   first shows the number and names of changed fields; expand that row to inspect
   every old/new value. Use **ขยายรายละเอียดทั้งหมดในหน้านี้** only when reviewing
   all compound rows on the current page as one batch.
4. When opening an item from review, return through the provided review link so
   reviewed lock, search, type, page size, and page context are retained. After
   saving, the original review becomes stale. Reload its same URL, verify that
   it hides diff/publication controls, then use **เปิดฉบับตรวจล่าสุด**.
5. On a narrow screen, use the stacked item list; it contains the same change
   types, old/new values, and exact-item edit route as the desktop table. Do not
   treat mobile layout as a reduced evidence view.

Before requesting publication, verify:

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

In Production, do not begin publication without a separate P-15 decision naming
the exact draft reference, final `reviewLock`, target, current base/pointer,
exact approved P-50D V3 one-row selected manifest or another exact later
approved manifest,
rollback target, named canaries, temporary/final flag matrices, and one operation request ID. P-14 and
P-14C do not authorize publication. Re-read these values immediately before
submit and stop on the first mismatch.

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
8. Confirm the draft reference, final reviewed `reviewLock`, target version, and
   current base/pointer exactly match the P-15 decision.
9. Confirm explicit Owner P-15 approval to issue this exact reviewed draft and
   target as the official version.
10. Select **ตรวจและยืนยันการเผยแพร่**. In the confirmation dialog, recheck the
    current version, target version, reviewed draft revision, item count,
    immutability, and BOQ effect.
11. Type the exact target version when prompted. A mismatch keeps
    **ยืนยันและเผยแพร่** disabled and the Server Action must reject it before
    the publish RPC even if client validation is bypassed. Choose
    **กลับไปตรวจ** to cancel with no publication effect.
12. Publish from this review page once. The screen retains this publish
    operation ID until a definitive result and submits the exact reviewed lock
    version.

If publication succeeds, the target becomes the immutable official version and
the pointer moves atomically. Do not attempt to edit it.

## 11. Generate official exports

Official exports are a post-P-15 closeout action. No pre-publication Excel/PDF
may be renamed, filed, or distributed as official.

1. Open the exact published version, not merely “current.”
2. Choose **ส่งออกเอกสาร → Excel สำหรับตรวจสอบ** or
   **เปิดหน้าพิมพ์/บันทึก PDF**. The PDF choice opens the browser print view;
   print or save the file from that view. On a draft the equivalent menu is
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

### 11.1 P-51 ordered closeout

After the exact P-15 publish succeeds, complete these steps in order:

1. Verify the atomic publish result, singleton pointer, published version,
   item count, dataset hash, and publish audit/change-set ID.
2. Generate, verify, hash, visually inspect, and file official Excel/PDF from
   that published database version.
3. Run the named new/old/duplicate/open-tab BOQ canaries. Confirm a new BOQ uses
   the approved current catalog, existing and duplicated BOQs retain their
   source catalog/Factor F bindings and snapshots, an already open create tab
   revalidates before save, and edit/print/export remain usable.
4. Restore and verify the exact final matrix:
   `catalog_admin_enabled=false`, `catalog_new_identity_enabled=false`, and
   `catalog_retirement_enabled=false`.
5. Record final invariants: singleton pointer plus published version/count/hash,
   zero working drafts, publish audit, unchanged historical BOQ bindings/
   snapshots, unchanged Factor F pointer/rows/hash, unchanged grants/RLS, and no
   monitored auth/profile/RPC drift.
6. Only then create the post-publication encrypted backup, complete the isolated
   restore and checksum verification, and record independent custody.

Stop on the first failure. Do not claim closeout or use a backup taken before
the official exports, canaries, final flags, and invariant snapshot as final
closeout evidence.

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
| Working draft already exists | Open the one existing workspace. If it is stale or the attempt truly must be replaced, inspect it and use audited abandon with a reason before creating another draft |
| Draft review changed | The draft was edited after review. Return to final comparison, inspect the new state, and publish only with the refreshed lock |
| เลขเวอร์ชันที่พิมพ์ไม่ตรง | Return to the confirmation summary and type the displayed target version exactly. Do not retry by changing the URL, request ID, or hidden fields |
| Draft base stale | Inspect and audited-abandon the stale draft with a reason, then create a new draft from Current and deliberately reapply approved changes; do not publish/rebase it |
| Current restore version unavailable | Keep Restore closed, reload the version data, and verify both current and target before confirming |
| Publish evidence required | Complete real approval metadata; do not use placeholder text |
| Draft is stale/read-only | The only allowed command is audited abandon. After abandoning it, create a current-base draft and deliberately reapply approved changes; do not rebase or force it |
| Export hash mismatch | Do not distribute; report with request/version/hash details |
| Placement review required | Keep the draft; open **จัดตำแหน่งรายการใหม่**, review every pending new item as one batch, confirm with a real reason, then reload publication readiness |
| Placement changed after page load | Reload the exact draft and placement page, inspect the current batch, and confirm again; never force hidden revision/order values |
| Retired-row PDF policy required | Keep the draft; do not file the field-facing PDF until P-19 is approved |
| Result uncertain / timed out | Do not repeatedly create new submissions. Confirm the submitted values remain visible, copy the request ID, refresh audit/state, and retry only through the same operation when instructed; report any cleared field before retrying |
| Factor F change requested | Out of scope for this procedure; do not edit Master Catalog data, Factor F data, or legacy BOQs |

## 14. Prohibited actions

- Direct database/table edits outside approved migration/functions
- Editing or deleting a published version
- Deleting a draft, relabelling it Archived to start over, mutating an
  abandoned draft, or performing any stale-draft command other than audited
  abandon
- Creating competing mutable drafts anywhere in the catalog workflow
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

For the current P-37 closure run, execute Cards A-G in
[Owner UAT Script #35](./35-phase4-wp8-p37-evidence-reconciliation-and-owner-uat-script.md)
instead of improvising from this general checklist. Note #35 reuses only
actor-independent evidence and requires E-01 invalid authority, E-02 retirement
hold, and the URL-bound stale final-review prevention/recovery state as the
three non-destructive recovery checks. Stale
placement and uncertain response are recorded separately and are not
double-counted.

The developer must first follow
[Preflight Note #36](./36-phase4-wp8-p38-no-reset-owner-uat-preflight.md): run
`db:local:p38:verify-inputs` and read-only `status`, then run `prepare` only on
the exact clean pushed checkpoint. E-01 uses one valid but unmapped Local
candidate because mapped workbook names/units/prices are replaced by
Production authority during parsing. The harness never creates or abandons an
Owner draft and keeps retirement disabled.

Developer DB/transport fault-injection evidence may prepare and verify the
uncertain-response example, but it does not substitute for the intended admin
recognizing the message and completing the recovery through the UI.

1. identify the one global workspace, create an ADR-003-valid draft when
   none exists, record its immutable draft reference and target, abandon/recreate
   one test attempt with a reason, verify the replacement has a new draft
   reference but may reuse the unissued target, and explain why stale/abandoned
   drafts remain read-only;
2. search the complete catalog including first/middle/last rows and inspect one
   item's field-level history;
3. preview an approved workbook and explain Full versus Supplement impact,
   complete row diff/omissions, and price authority;
4. add or import several approved new identities; distinguish system-suggested,
   admin-modified, incomplete/invalid, unconfirmed, and accepted placement
   states; filter to rows requiring attention; place them as one batch without
   confirming inherited rows individually; explain affected categories and the
   shifted-row count; change one accepted local assignment and recognize that
   it is **ยังไม่ยืนยัน**; exercise the leave/reload recovery; and recover from
   one stale-placement response;
5. recognize and recover from at least three representative safe
   validation/prevention states, including URL-bound stale final review,
   retirement hold, and invalid authority;
6. perform one eligible reactivate or never-published withdraw correction and
   explain what identity/code/audit evidence remains;
7. review the authoritative final snapshot diff, compound/reverted behavior,
   item history, authenticated publisher/archive evidence, and publication
   readiness without SQL;
8. locate version/status/count/hash in Excel/PDF and distinguish dataset hash
   from binary file hash;
9. handle an uncertain-response example using the same request ID, verify that
   submitted fields remain unchanged before retry, and confirm they reset only
   after success;
10. restore to a safe screen without an irreversible mistake or developer help.
11. edit after opening final review, reload the original lock-bound URL,
    observe that its publication controls are removed, and open a fresh review;
    do not perform a successful publication rehearsal.

Record task completion, misunderstood wording, recovery outcome, elapsed time,
browser/device, and reviewer. A failed or developer-dependent critical task
blocks P-14 until the UX/procedure is corrected and rerun.

For placement, also record the agreed realistic new-item batch size and
interaction evidence against 710 inherited rows: initial render, search,
insertion-gap selection, preview recalculation, paging, sibling movement, and
confirmation.
Material stutter, focus loss, layout shift, contradictory accepted/dirty state,
or a keyboard-incomplete required control blocks P-14 unless corrected and
rerun or explicitly accepted with an owner, rationale, remediation owner, and
due date. Drag and drop is not required and may never replace the visible
category/insertion-gap/up-down path.

## Current P-50 authority correction — 2026-08-24

The earlier P-50C admin marker is preserved as superseded chronology. Current
authority is exact Owner confirmation (ratification) pending, with P-50C not
yet accepted even as local review evidence. Git and every operating gate remain
separate and held.

<!-- P50C_ADMIN_PROCEDURE_REVIEW_CORRECTION_V1 {"schema":"conduit-boq/p50c-admin-procedure-review-correction/v1","recordedAt":"2026-08-24","supersedesCurrentAuthorityOf":"P50C_ADMIN_PROCEDURE_CURRENT_OVERLAY_V1","p50dRequestId":"P50D-REQ-20260823-V3","exactOwnerConfirmationPending":true,"exactOwnerRatificationPending":true,"p50dApproved":false,"p50cTechnicalBuildOccurred":true,"p50cDataReviewPassed":true,"p50cCandidateAccepted":false,"p50cCandidateRole":"unaccepted-local-review-evidence","p50cCandidateId":"P50C-CANDIDATE-20260823-V1","candidateSha256":"d7a19a9dbaecff4abb18086d1f9e236ae4b5ea311477ccdb609a52c54f200611","diffSha256":"72e950d96bfdf81abeb3317ee280cc01e630a13447d1f38edd9ee7149f3ddf18","candidateManifestSha256":"d88d3daa63db6a59f9ba973d653647224584aa9d98c3efde4cbaad78f6bfefe5","nextOwnerDecision":"confirm-ratify-or-hold-exact-p50d-v3","candidateApplicationAuthorized":false,"localCommitAuthorized":false,"externalGitPublicationAuthorized":false,"ciPreviewAuthorized":false,"databaseAccessAuthorized":false,"productionReadAuthorized":false,"productionWriteAuthorized":false,"networkAuthorized":false,"p13Authorized":false,"p14Authorized":false,"p14cAuthorized":false,"p15Authorized":false,"automaticNextStep":false} -->

## Current P-50D V3 ratification receipt mirror — 2026-08-24

This append-only successor supersedes only the live pending interpretation
above. The canonical authority remains the exact receipt and marker in
[Review Remediation #54](./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md).
Exact P-50D V3 ratification is recorded, and
`P50C-CANDIDATE-20260823-V1` is accepted only as local review evidence.
Published/current `2568.0.0` remains unchanged, including `ITEM-0429` at
`0/1763/1763`; provisional local `2568.1.0` review evidence contains the
selected row at `0/1764/1764` and still requires a fresh issued/claimed
registry check.

This receipt authorizes no candidate application, source/catalog/BOQ/pointer/
Factor F mutation, commit, push, CI/Preview, database, Production, network,
P-13, P-14, P-14C, P-15, deployment, or publication. The next safe step is
the required small repository gate. Only after it passes may a separate exact
local commit/push and CI/Preview authorization request be prepared; nothing
continues automatically.

<!-- P50D_V3_ADMIN_PROCEDURE_RATIFICATION_RECEIPT_V1 {"schema":"conduit-boq/p50d-v3-admin-procedure-ratification-receipt/v1","recordedAt":"2026-08-24T00:44:15+07:00","canonicalReceiptMarker":"P50D_V3_EXACT_OWNER_RATIFICATION_RECEIPT_V1","canonicalReceiptDocument":"./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md","resolvesRequestId":"P50D-V3-RATIFY-REQ-20260823-V1","p50dRequestId":"P50D-REQ-20260823-V3","confirmationReceived":true,"exactOwnerConfirmationPending":false,"exactOwnerRatificationPending":false,"p50dDecisionApproved":true,"p50dV3Confirmed":true,"p50dV3Ratified":true,"p50dAuthorized":true,"p50dAuthorityScope":"decision-record-only","p50dFurtherActionAuthorized":false,"selectedIdentityId":"f2662c71-a6e5-407e-8456-8608e304b43b","selectedLegacyItemCode":"ITEM-0429","selectedTargetItemCode":"COR-PB0-002","baselinePrice":[0,1763,1763],"candidatePrice":[0,1764,1764],"p50dManifestSha256":"1ac28a74def993214f73659f1930acdb5caa57390504e494b21d72bbf3778429","selectedRecordsSha256":"f63127e589e7f5302f481f55b1df54a6b741efdc1aaa3b74e94d94f84abf15df","p50cCandidateId":"P50C-CANDIDATE-20260823-V1","p50cTechnicalBuildOccurred":true,"p50cDataReviewPassed":true,"p50cCandidateAccepted":true,"acceptsCandidateAs":"local-review-evidence-only","p50cFurtherExecutionAuthorized":false,"candidateSha256":"d7a19a9dbaecff4abb18086d1f9e236ae4b5ea311477ccdb609a52c54f200611","diffSha256":"72e950d96bfdf81abeb3317ee280cc01e630a13447d1f38edd9ee7149f3ddf18","candidateManifestSha256":"d88d3daa63db6a59f9ba973d653647224584aa9d98c3efde4cbaad78f6bfefe5","unchangedBaselineRowCount":709,"unselectedExternalCandidateCount":48,"retainBaselineEvidenceCount":18,"authorityExclusionCount":17,"explicitlyUnselectedAdjacentItems":["ITEM-0427","ITEM-0430","ITEM-0431"],"rowClassification":"same-basis-correction","overallReleaseClassification":"structured-code-revision-with-one-selected-price-delta","currentPublishedVersion":"2568.0.0","currentPublishedCatalogChanged":false,"provisionalTargetVersion":"2568.1.0","targetRegistryCheckPending":true,"historicalZeroPriceGateSupersededForSelectedLocalCandidateUuidOnly":true,"historicalBoqRepriceAuthorized":false,"changesPriorBusinessIntent":false,"nextSafeStep":"none-stop-after-recording-ratification","smallRepositoryGateRequired":false,"separateGitCiAuthorizationRequired":true,"gitCiAuthorizationGranted":false,"candidateApplicationAuthorized":false,"localCommitAuthorized":false,"externalGitPublicationAuthorized":false,"ciPreviewAuthorized":false,"databaseAccessAuthorized":false,"productionReadAuthorized":false,"productionWriteAuthorized":false,"networkAuthorized":false,"sourceMutationAuthorized":false,"catalogMutationAuthorized":false,"boqMutationAuthorized":false,"pointerMutationAuthorized":false,"factorFMutationAuthorized":false,"p13Authorized":false,"p14Authorized":false,"p14cAuthorized":false,"p15Authorized":false,"deployAuthorized":false,"publicationAuthorized":false,"automaticNextStep":false,"supersedesCurrentAuthorityOf":"P50C_ADMIN_PROCEDURE_REVIEW_CORRECTION_V1"} -->
