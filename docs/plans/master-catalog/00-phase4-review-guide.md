# Phase 4 Review Guide

> **Current Master Catalog full-Admin completion amendment (2026-08-28):**
> The data/publication milestone is complete (`2568.1.0`, `710` rows,
> reviewed ITEM-0429/ITEM-0615 values, XLSX/PDF passed, no historical BOQ
> reprice, no Factor F change), and P-13/P-14/P-14C/P-15 are complete and must not be
> replayed. Migration 027 was applied once and is immutable. The
> deployed Admin UI remains intentionally read-only and all three capability
> settings remain exact boolean `false`.
> [Plan #105 V2](./105-phase4-master-catalog-admin-edit-completion-plan.md)
> retains immutable published rows and sets the final staged target: Admin
> enables Edit/Recode plus eligible Withdraw/Reactivate recovery; New identity
> adds Add/Supplement and placement; Retirement adds Retire. All three settings
> are ultimately `true`. Published identities are never
> hard-deleted. P-19 direction is now active-only field-facing official PDF,
> while draft PDF visibly marks inactive rows and Excel/database/history retain
> the complete dataset. P-49 formal closeout remains pending; its unrun expanded
> Production persona rehearsal remains an accepted residual, never a
> retrospective PASS. The baseline Admin-gate commit `705eeca...` is pushed
> only to `codex/master-catalog-admin-edit`; the bounded P-19 application, tests,
> render QA, and exact PDF-to-Excel parity are complete locally at `48` files /
> `444` tests. The Owner then issued `APPROVE MASTER CATALOG FINAL`,
> authorizing R-02 through R-05 in exact staged order with no retry. It does not
> authorize catalog publication, pointer restore, BOQ mutation, Factor F mutation,
> or migration replay.
> This overlay supersedes all prior live Status/Current/next-action wording;
> all dated text below is retained as historical evidence only.

<!-- MASTER_CATALOG_ADMIN_EDIT_STATUS_V2 {"schema":"conduit-boq/master-catalog-admin-edit-status/v2","recordedAt":"2026-08-28","catalogDataPublicationComplete":true,"publishedVersion":"2568.1.0","publishedRowCount":710,"p13P14P14cP15CompleteNoReplay":true,"migration027AppliedOnceNoReplay":true,"readOnlyAdminUiLive":true,"endToEndComplete":false,"p49FormalCloseoutComplete":false,"expandedProductionPersonaTestAcceptedResidual":true,"plan":"105-phase4-master-catalog-admin-edit-completion-plan.md","target":"full-active-admin-draft-workflow","publishedHardDeleteAllowed":false,"p19Policy":"official-pdf-active-only-draft-pdf-mark-inactive","p19ImplementationComplete":true,"p19RenderedFixturesVerified":true,"p19LocalTestResult":"48-files-444-tests-pass","migration028Required":true,"migration029Required":false,"catalogAdminEnabledCurrent":false,"catalogNewIdentityEnabledCurrent":false,"catalogRetirementEnabledCurrent":false,"catalogAdminEnabledTarget":true,"catalogNewIdentityEnabledTarget":true,"catalogRetirementEnabledTarget":true,"baselineFeatureCommit":"705eeca0c86df5eda06cd4ea9efeda5b9bfeeebe","planDocsAmendmentAuthorized":true,"planDocsAmendmentComplete":true,"finalReleaseAuthorization":"APPROVE MASTER CATALOG FINAL","applicationCodeAuthorized":true,"commitAuthorized":true,"pushAuthorized":true,"mainMergeAuthorized":true,"productionReadAuthorized":true,"productionWriteAuthorized":true,"deployAuthorized":true,"flagChangeAuthorized":true,"automaticNextStep":true} -->


**Prepared:** 2026-06-22
**Purpose:** ให้เจ้าของระบบ review ชุดเอกสารตามลำดับโดยไม่สับสนกับ Phase เดิม

> **P-50I result overlay — current (2026-08-24):** the exact one-time P-50I
> approval was consumed. Preflight and the exact test target hash passed, but
> the required local gate stopped at `21/22` authority tests and `30/31` in the
> exact P-50 set. The new raw marker-name count included two examples inside
> Proposal #59's frozen diff plus the one real EOF marker; the line-anchored
> count is exactly one. Focused ESLint and deterministic P-50C checks passed.
> See [P-50I Result #60](./60-phase4-p50i-local-validation-failure-result-record.md).
> Fail-fast stopped before stage/commit/push, so local/upstream/remote remain
> `2b45f9b1679d12caac933568e89e1065d74dbd74`, the index is empty, and no new
> CI/Preview or Production action occurred. The exact P-50I test target remains
> uncommitted. Earlier P-50H/P-50I-pending wording below is chronology only.
> The preceding P-50H Quality run remains `32661774094` as recorded by Result
> #58; P-50I created no new run.
> The sole current review is the one-line repository correction in [P-50J
> Proposal #61](./61-phase4-p50j-marker-count-correction-and-ci-authorization-proposal.md);
> preparation grants no mutation, Git, CI, Production, or later-gate authority.

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

> **P-50G result overlay (2026-08-24):** the Owner returned the exact one-line
> approval for request `P50G-REQ-20260824-V1` and Proposal #55 SHA-256
> `5f2cbdb4d255613c41b2e5c46e4a8a3ba01856c2d17819752e9aeb787ee82cfc`.
> The one-time authorization was consumed once. The offline/read-only gate
> passed `3` focused files / `30` tests plus focused lint, deterministic P-50C
> check, parser syntax, and scoped diff-check; see [Result #56](./56-phase4-p50g-small-repository-gate-result.md).
> P-50G cannot be replayed from that approval. PASS authorizes only preparation
> of [P-50H Proposal #57](./57-phase4-p50h-exact-local-git-ci-preview-authorization-proposal.md)
> and its exact manifest for separate Owner review. P-50H execution, protected-
> path access, Git stage/commit/push, CI/Preview, candidate application,
> database/Production/network, P-13 through P-15, deploy, publication, waiver
> extension, and automatic continuation remain unauthorized.

> **Current status overlay (updated 2026-08-24):** P-12 is complete through `026` and the
> v7 post-`026` backup. The long readiness chronology below is retained as
> history. P-51 records the Owner's bounded sequencing decision: P-49 remains
> open/high but is deferred until after the first P-15 closeout and is not the
> sole blocker for that exact closeout; P-50 full source-price reconciliation
> moves before P-15. Exact request `P50R-SOLO-REQ-20260821-V1` has now been
> consumed and completed offline with result `PASS_FOR_P50D_REQUEST`. Its
> immutable evidence accounts for all 28 PDF pages, 67 deltas, and 245
> exceptions with zero blockers. On 2026-08-23 the Owner reaffirmed published/
> current `2568.0.0` as the baseline authority for all 710 names, units, and
> prices. The 49 technical P-50R candidates are comparison evidence only. The
> Owner then selected `SELECTED-DELTA` intent for only UUID
> `f2662c71-a6e5-407e-8456-8608e304b43b` / `ITEM-0429` /
> `COR-PB0-002`, `0/1763/1763 -> 0/1764/1764`; the other 709 baseline rows
> and all other 48 candidates remain at `2568.0.0`. Historical
> [P-50D Proposal #50](./50-phase4-p50d-exact-price-and-version-disposition-decision-proposal.md)
> remains superseded without approval. [Baseline-first Proposal #51](./51-phase4-p50d-2568-baseline-first-delta-review-proposal.md),
> request `P50D-REQ-20260823-V2`, is the preserved selection basis. Exact
> [one-row Proposal #52](./52-phase4-p50d-one-row-selected-delta-approval-proposal.md),
> request `P50D-REQ-20260823-V3`, bound manifest SHA-256
> `1ac28a74def993214f73659f1930acdb5caa57390504e494b21d72bbf3778429`,
> selected-record SHA-256
> `f63127e589e7f5302f481f55b1df54a6b741efdc1aaa3b74e94d94f84abf15df`,
> and unselected-48 SHA-256
> `2194d0b5f5e9c5a2deb5590aefddd53592f031ef0e9359657b707ed3c46690be`;
> the exact V3 manifest is frozen. The Owner's exact confirmation (ratification)
> was received at `2026-08-24T00:44:15+07:00` and is recorded in
> [Review Remediation #54](./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md).
> P-50D V3 is therefore complete only within `decision-record-only` scope. The
> bounded local offline P-50C technical build is recorded under
> [Result #53](./53-phase4-p50c-one-row-offline-candidate-result-record.md).
> Published `2568.0.0` remains `0/1763/1763`; provisional local candidate
> `P50C-CANDIDATE-20260823-V1` targets `2568.1.0` and contains only the selected
> `0/1764/1764` row. Candidate SHA-256 is
> `d7a19a9dbaecff4abb18086d1f9e236ae4b5ea311477ccdb609a52c54f200611`,
> diff SHA-256 is
> `72e950d96bfdf81abeb3317ee280cc01e630a13447d1f38edd9ee7149f3ddf18`,
> and candidate-manifest SHA-256 is
> `d88d3daa63db6a59f9ba973d653647224584aa9d98c3efde4cbaad78f6bfefe5`.
> The fresh issued/claimed target-registry check remains pending. The candidate
> is accepted only as local review evidence and is not an application/import
> payload;
> database/Production/network/application mutation,
> commit/push, CI, P-13/P-14/P-14C/P-15, deploy, flags, and publication remain
 > unauthorized. **Historical ratification boundary (later superseded only by
 > the P-50G result overlay above):** P-50D V3 ratification is complete and
 > P-50C is accepted only as local review evidence. That ratification record
 > stopped immediately and granted no later-gate authority. A later exact Owner
 > approval separately authorized the completed P-50G gate; Git/CI still
 > requires a new exact P-50H decision. Nothing continues automatically. See
 > [P-51 Plan #48](./48-phase4-p51-risk-accepted-master-catalog-closeout-plan.md).
>
> Historical PRE-P-12 `source/tooling HEAD`, `calibrate-schema`, second fresh
> full isolated rehearsal, `pass-2`, `GO HEAD`, and `HOLD` records below remain
> immutable chronology rather than current gate status.

## สถานะสั้นที่สุด

- **สถานะปัจจุบัน:** P-12 **COMPLETE** เมื่อ 2026-08-17 ตามลำดับ exact
  `017` -> `017a` -> `018`-`026` พร้อม checksum-verified v7 post-`026`
  backup/isolated restore. P-13, P-14, P-14C และ P-15 ยัง **ไม่ได้รับอนุมัติ**.
  ข้อความ `HOLD`/P-01/WP-8/P-12 request ในย่อหน้ายาวด้านล่างเป็น chronology
  ก่อน P-12 เท่านั้น ไม่ใช่สถานะ gate ปัจจุบัน.
- Production Phase 0 → 1A → 2 → 1B: **เสร็จและใช้งานอยู่**
- Current Master Catalog: **`2568.0.0`, 710 รายการ**
- Factor F versioning: **เสร็จแล้วก่อน Phase 4; default ปัจจุบันคือ
  `2569.0.0` และ BOQ เก่าไม่ได้ถูก backfill**
- Phase 4 Admin/Import/Publish/Official Export: **WP-0 ถึง WP-8 complete.
  Owner accepted P-37 เมื่อ 2026-07-25 ภายใต้ guided-UAT variance ที่เปิดเผย
  ตาม [Closure Matrix #34](./34-phase4-wp8-p37-closure-matrix.md) โดยไม่อ้างว่า
  เป็น independent/no-assistance. D005/D007/D009, safe-error recovery,
  performance baseline และ cleanup ผ่านตาม
  [Owner UAT Script #35](./35-phase4-wp8-p37-evidence-reconciliation-and-owner-uat-script.md);
  Local ปิดที่ `2568.0.0`/710, ไม่มี working draft และ flags ปิดทั้งหมด.
  [P-12 Readiness Package #39](./39-phase4-p12-production-readiness-package.md)
  เตรียม desk review, Local read-only verification และ Owner-authorized
  Production database/ledger/advisor read-only evidence แล้ว โดยไม่เขียน
  Production. Management API ยืนยันแล้วว่า Data API ไม่ expose `private`;
  exact Supabase PG17 synthetic/Local application-only restore ผ่านและ
  encrypted container เตรียมแล้ว. หลังรหัสสองค่าถูกปฏิเสธและลบ รหัสค่าที่สาม
  ผ่าน bounded read-only identity query; encrypted Production
  application-only readiness backup SHA-256 `9d306a47...` และ exact-image
  network-isolated restore ผ่าน โดยไม่ dump Auth/Storage และไม่เขียน
  Production. เมื่อ 2026-07-27 Owner อนุมัติหยุด Docker ชั่วคราวเฉพาะ
  non-force detach/read-only reopen/full checksum; ผ่านทั้งแปดรายการ,
  bundle ถูก detach อีกครั้ง และ Local services/invariants กลับมาครบโดยไม่
  reset. Exact pushed readiness/documentation HEAD `07d1d33` บันทึก remote
  `Vercel=success`; ไม่มี PR-triggered GitHub Actions run และไม่ได้อ้างว่า
  remote lint/test/build ผ่าน. เมื่อ 2026-07-28 Owner รับ disposition ของ
  guarded definers, leaked-password สำหรับ P-12/P-13 เท่านั้น และ
  `v_row_count` debt แล้ว; leaked-password ยังเป็น gate แยกก่อน P-14.
  Owner ยอมรับ single-device-loss residual แบบจำกัดเฉพาะ rollout นี้ โดยหมดอายุ
  เมื่อเริ่ม post-publication checkpoint หลัง P-15 verification ที่อนุมัติแยก
  หรือ 168 ชั่วโมงหลังบันทึกเวลาเริ่ม P-12 แล้วแต่ว่าอะไรถึงก่อน. หากวางแผน
  หยุดเกิน 24 ชั่วโมงต่อเนื่อง ต้องทำและตรวจ checksum ของ independent
  encrypted copy ก่อนหยุด; หากหยุดโดยไม่ได้วางแผนครบ 24 ชั่วโมง ต้องหยุด
  gate ถัดไปและทำ copy ให้เสร็จก่อนดำเนินการต่อ. ณ PRE-P-12 checkpoint นี้
  สถานะเป็น **HOLD**; ภายหลัง P-12 complete แล้วตาม current overlay ด้านบน.
  P-45 เสร็จที่ pushed/upstream-equal
  `d92d8ced42fc882481ebc2c4579adcf1edbebea7`. สิทธิ P-46 ถูกใช้หนึ่งครั้ง:
  canonical Local bootstrap ผ่านถึง `025` แล้ว WP-6.5 หยุดแบบ fail-closed
  เพราะ authenticated public invoker เรียก owner-only
  `private.catalog_action_error(...)` ไม่ได้. P-47 อนุมัติเฉพาะ repository
  implementation/static review ของ append-only `026` หลัง `025` พร้อม
  bootstrap/runner/cleanup/tests/docs ที่จำเป็นและ review ผ่านแล้ว. P-48
  อนุมัติเฉพาะ exact 25-file Git publication แบบหนึ่ง commit/push ไม่มี PR.
  ยังไม่อนุมัติ Local cleanup, apply/reset/retry, disposable pass, Git write
  อื่น, kit/pass หรือ Production.
  ยังต้องระบุ
  named-human executor และ named-human independent verifier ที่เป็นคนละคน,
  exact path/`current_user`/object-owner/window ก่อนขอ P-12 แยกต่างหาก. Fresh
  backup ก่อน migration, post-migration
  application-only backup/manifest หลัง verification ของ `017`, `017a`,
  `018`-`026` และก่อน P-13, รวมทั้ง final external copy/checksum ยังคงบังคับ.
  Rehearsal-only kit
  จาก dirty working tree ใช้ disposable network-isolated PostgreSQL 17 และ
  apply ได้เฉพาะ `017` ก่อน hard-stop เพราะ private-function default ACL ไม่มี;
  ไม่ได้รัน `018`-`025` และไม่ได้ migrate/write Local หรือ Production.
  [Finding #43](./43-phase4-p12-private-function-default-privilege-finding.md)
  บันทึก Owner decision เลือก Option B แล้ว; selected
  architecture/security remediation ยังต้องผ่าน fresh complete exact-source
  rehearsal ก่อนขอ P-12. Option B เป็น separately reviewed **bridge
  migration** ในลำดับหลัง `017` และก่อน
  `018` เท่านั้น; correction หลัง `025` ใช้แทน bridge นี้ไม่ได้. เหตุผลคือ
  `018` สร้าง private
  `SECURITY DEFINER` helpers 12 ตัวโดยไม่มี explicit per-function revoke และ
  grant `authenticated` ให้ `USAGE` บน schema `private`; หาก global default
  deny ยังไม่เกิด helpers เหล่านี้จะ inherit `PUBLIC EXECUTE`. Production ยัง
  ไม่ได้รับ `017` และ Production Data API ไม่ expose `private` จึงยังไม่มี
  Production exposure ใหม่ แต่ ACL/defense-in-depth contract ยัง fail.
  Owner เลือก Option B สำหรับ design/implementation/review ใน repository แล้ว:
  `017a_master_catalog_phase4_global_function_default_privileges.sql`, ledger
  `20260728001730_master_catalog_phase4_global_function_default_privileges`,
  SHA-256
  `12cf6687b6339efa17635ac29ddfdb5150210a96e0640b0e9182a4cda64497a7`,
  ลำดับ exact `017` -> `017a` -> `018`. Candidate ถอน inherited EXECUTE ของ
  `PUBLIC`/API roles รวม `service_role` ทั้ง global/`public`/`private` และ
  reassert เฉพาะ grant ที่ตั้งใจ. ห้ามแก้ `017`/`018` และห้ามเอา `017a` ไป
  patch Local ที่ผ่าน `025` แล้ว. Migration `026` ไม่ใช่ bridge; เป็น
  per-object callability fix คนละเรื่องจาก P-46: คง body/owner/signature/
  empty search path ของ pure formatter, ใช้ `SECURITY INVOKER`, grant เฉพาะ
  `authenticated`, deny `PUBLIC`/`anon`/`service_role`, และไม่เปลี่ยน
  default privileges หรือข้อมูล.
  Bridge evidence เดิมผ่าน review/static แล้ว แต่ P-46 พบ defect ใหม่และ
  หยุดตาม stop rule. หลัง P-47 ต้อง review/freeze replacement source/tooling
  HEAD, ขอ Git authorization แยก, push/ตรวจ Remote และขอ Owner reset approval
  ใหม่ก่อน corrected Local rehearsal; สิทธิ P-46 ใช้ซ้ำไม่ได้. หลัง Local
  gate ผ่านจึงพิจารณา authorization แยกเพื่อสร้าง kit เดียวสำหรับ
  `calibrate-schema` pass 1, independent contract review และ second fresh full
  isolated rehearsal พร้อม transitive pass-2 closeout. หลัง explicit Owner
  P-12 GO เท่านั้นจึงให้ Checklist #40 เป็น sole net change ที่ descendant GO
  HEAD และ Production reuse source kit. ข้อความนี้เป็น historical PRE-P-12:
  ณ เวลานั้นการเลือก Option B ไม่ใช่ P-12 และ P-12 ยัง HOLD; ภายหลัง P-12
  complete แล้วตาม exact chain ที่ระบุด้านบน.
  Add/Supplement ยังซ่อนจนถึง P-14 และ
  ณ historical checkpoint นั้น Production P-12 ถึง P-15 ยังไม่ได้อนุมัติ.
  ปัจจุบัน P-12 complete แล้ว ส่วน P-13/P-14/P-14C/P-15 ยังไม่ได้อนุมัติ.
  ใช้ Tracker เป็น authority ของ
  volatile status และใช้ Verification Report เป็น authority ของหลักฐานละเอียด**
- รอบถัดไปของ Phase 4: **เริ่มจาก baseline หลัง Factor F `012-015` และ
  production hotfix `016`; Phase 4 migrations คือ `017+`**
- เอกสาร Phase 4 ต้องใช้ live preflight count เสมอ เพราะ BOQ ใหม่อาจเพิ่ม
  ระหว่างรอ implement

## ลำดับแนะนำในการ review

1. [Post-Factor-F Adjustment Plan](./22-phase4-post-factor-f-adjustment-plan.md) — อ่านผลกระทบ ความยาก และแผนปรับหลัง Factor F ก่อนเริ่มงาน
2. [Implementation Execution Pack](./23-phase4-implementation-execution-pack.md) — checklist ลงมือทำทีละ work package
3. [แผนสถาปัตยกรรม Revision 8](./08-phase4-architecture-ci-plan.md) — อ่านภาพรวม ขอบเขต และเหตุผล
4. [ผลพิจารณารีวิวภายนอก](./21-phase4-architecture-review-disposition.md) — ดูว่าข้อใดรับ/ไม่รับและเพราะอะไร
5. [ADR-004](../../02_architecture/ADR/ADR-004-phase4-catalog-governance-and-official-publication.md) — อนุมัติหลักการที่เปลี่ยนยาก
6. [Phase 4 Change Request](./09-phase4-change-request.md) — อนุมัติ scope/ความเสี่ยง/แต่ละ Production gate
7. [Decision Register](./19-phase4-decision-register.md) — ดูสิ่งที่ล็อกแล้ว/ยังรอตัดสินใจและ gate ที่เกี่ยวข้อง
8. [Owner/Developer Capability Completeness Audit](./29-phase4-owner-dev-completeness-audit.md) — ดูคำแก้ไขขอบเขตคำว่า complete และ WP-6.6 release gates
9. [P-22 Operator Workflow Correction Plan](./31-phase4-wp66-operator-workflow-correction-plan.md) — ดู one working draft, abandon, item-first และ final-review contract พร้อม G0-G4
10. [WP-6.6 Owner Review Note](./30-phase4-wp66-owner-review-note.md) — ผล Accept G3, exact checkpoint และขอบเขตที่ยังไม่อนุมัติ
11. [P-18 Placement Governance Review Note](./28-phase4-p18-placement-governance-review-note.md) — ตรวจข้อเสนอ narrow-scope สำหรับรายการใหม่ก่อนอนุมัติ WP-7.5
12. [WP-8 P-37 Closure Matrix](./34-phase4-wp8-p37-closure-matrix.md) — เทียบ exit gate กับหลักฐานและระบุ UAT ที่ยังขาดโดยไม่ตีความเกินหลักฐาน
13. [WP-8 P-37 Evidence Reconciliation and Owner UAT Script](./35-phase4-wp8-p37-evidence-reconciliation-and-owner-uat-script.md) — ใช้เป็นสคริปต์เดียวสำหรับ Owner Cards A-G, safe errors, performance และ cleanup
14. [WP-8 P-38 No-reset Owner UAT Preflight](./36-phase4-wp8-p38-no-reset-owner-uat-preflight.md) — corrected E-01/E-02, input hashes, tracked fail-closed commands และ read-only Local baseline
15. [P-12 Production Readiness Package](./39-phase4-p12-production-readiness-package.md) — ดู exact source/migration hashes, ผล Production database/ledger/advisor/Data API read-only, readiness backup/isolated restore ที่ผ่านแล้ว และ residual/executor/window ที่ยังขาดก่อนขอ P-12
16. [P-12 Owner Decision Checklist](./40-phase4-p12-owner-decision-checklist.md) — ดู decision ที่บันทึกแล้วและ human/window/authority-sync rows ที่ยังเปิด
17. [P-12 CLI Execution Runbook](./41-phase4-p12-cli-execution-runbook.md) — exact one-file ledger, secret, timeout, owner/ACL และ rehearsal contract
18. [P-12 Private-Function Default-Privilege Finding](./43-phase4-p12-private-function-default-privilege-finding.md) — blocker จาก disposable `017` rehearsal; Owner เลือก exact Option B `017a` bridge หลัง `017`/ก่อน `018`; correction หลัง `025` ใช้แทน bridge ไม่ได้
19. [P-46 Catalog Action Error Callability Finding](./44-phase4-p46-catalog-action-error-callability-finding.md) — ผล fail-closed หลัง clean chain, root cause, exact `026` least-privilege contract และ P-47 scope
20. [P-49 Pending-Account Authorization Hardening Plan](./45-phase4-p49-pending-authorization-hardening-plan.md) — target pending profile/onboarding-only และ known cross-layer risk; remediation deferred/unapproved ภายใต้ P-51
21. [P-50 Pre-P-15 Reconciliation and Release-Decision Plan](./46-phase4-p50-known-price-erratum-pre-p15-reconciliation-and-release-decision-plan.md) — บันทึก `ITEM-0429`/`COR-PB0-002` 1763 -> 1764, บังคับ full reconciliation ก่อน P-15 และแยก exact price/version decision
22. [P-51 Risk-Accepted Master Catalog Closeout Plan](./48-phase4-p51-risk-accepted-master-catalog-closeout-plan.md) — authority ของลำดับเดียว, risk boundary, hard stops และ post-P-15 P-49 re-entry
23. [P-50R SOLO Offline Reconciliation Request and Consumed Result](./49-phase4-p50r-exact-price-reconciliation-evidence-scope-request.md) — exact request ถูกใช้ครบแล้วและได้ `PASS_FOR_P50D_REQUEST`; immutable evidence ตรวจ 28/28 หน้า, 67 deltas, 245 exceptions และ zero blockers โดยยังไม่อนุมัติราคา/version/mutation หรือ gate ถัดไป
24. [P-50D V1 Historical Proposal](./50-phase4-p50d-exact-price-and-version-disposition-decision-proposal.md) — superseded โดยไม่เคยอนุมัติ; ห้ามใช้ approval block เดิม
25. [P-50D 2568.0.0 Baseline-First Delta Review](./51-phase4-p50d-2568-baseline-first-delta-review-proposal.md) — request `P50D-REQ-20260823-V2`; เริ่ม approved set ที่ 0 และเสนอทุก delta เทียบ current baseline
26. [P-50D One-Row Selected-Delta Approval](./52-phase4-p50d-one-row-selected-delta-approval-proposal.md) — exact request `P50D-REQ-20260823-V3` freezes only `ITEM-0429`; exact Owner confirmation is recorded and complete in decision-record-only scope
27. [P-50C One-Row Offline Candidate Result](./53-phase4-p50c-one-row-offline-candidate-result-record.md) — local offline technical build complete; candidate/diff/manifest hashes frozen and accepted only as local review evidence; target registry และ Git/CI ยังรอ gate แยก
28. [P-50C Review Remediation and P-50D V3 Ratification Receipt](./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md) — canonical exact receipt `P50D_V3_EXACT_OWNER_RATIFICATION_RECEIPT_V1`; no execution/Git/Production/later-gate authority
29. [P-50G Post-Ratification Small Repository Gate Proposal](./55-phase4-p50g-post-ratification-small-repository-gate-authorization-proposal.md) — exact proposal ที่ Owner อนุมัติด้วย request ID + full SHA-256; เก็บเป็น authorization snapshot ที่ใช้สิทธิ์ครบหนึ่งครั้งแล้ว
30. [P-50G Small Repository Gate Result](./56-phase4-p50g-small-repository-gate-result.md) — ผล PASS ของ gate แบบ offline/read-only; บันทึกว่า authorization ถูก consume และไม่อนุญาต Git/CI/operation
31. [P-50H Exact Local Git/CI Preview Proposal](./57-phase4-p50h-exact-local-git-ci-preview-authorization-proposal.md) — authorization snapshot ที่ Owner อนุมัติและถูกใช้ครบหนึ่งครั้งแล้ว; ห้าม replay
32. [P-50H Local Git/CI/Preview Result](./58-phase4-p50h-local-git-ci-preview-result-record.md) — exact Git publication สำเร็จ แต่ Quality FAIL จาก hidden local snapshot dependency; authorization consumed และ P-13 hard hold
33. [P-50I Quality Fixture Remediation Proposal](./59-phase4-p50i-quality-fixture-remediation-and-ci-rerun-authorization-proposal.md) — authorization snapshot ที่ Owner อนุมัติและถูกใช้ครั้งเดียว; exact patch ลง working tree แล้วแต่ local gate หยุดก่อน Git
34. [P-50I Local Validation Failure Result](./60-phase4-p50i-local-validation-failure-result-record.md) — preflight/target PASS, test `21/22` และ P-50 set `30/31`; fail-fast ก่อน stage/commit/push และ Production ไม่ถูกแตะ
35. [P-50J Marker-Count Correction and CI Proposal](./61-phase4-p50j-marker-count-correction-and-ci-authorization-proposal.md) — ข้อเสนอแก้ regex หนึ่งจุดให้ยึดต้นบรรทัด แล้วค่อยรัน focused gate และ remote Quality/Preview; ยังไม่อนุญาต execute
36. [Post-Phase-4 DR Backlog](./42-phase4-post-phase4-disaster-recovery-backlog.md) — งาน RPO/RTO/Auth/Storage/off-device restore ภายหลัง; ไม่ใช่ P-12 blocker
37. [Reconciliation Report](./11-phase4-reconciliation-report.md) — ตรวจว่าข้อมูล 710/708 ถูกจัดการอย่างไร
38. [Code Dictionary](./10-phase4-structured-code-dictionary.md) — ตรวจความหมาย AAA/TTT และจุดผิด 16 Crossing
39. [Database/Security Contract](./17-phase4-database-security-contract.md) — ตรวจ schema, RLS/grants, function และ migration order
40. [Lean Threat Model](./18-phase4-threat-model.md) — ตรวจความเสี่ยง/control/หลักฐานทดสอบ
41. [Parser/Hash Specification](./14-phase4-parser-and-canonical-hash-spec.md) — สัญญาเชิงเทคนิคที่ทำให้ import/export ทำซ้ำได้
42. [Official Export Specification](./20-phase4-official-export-spec.md) — อนุมัติรูปแบบ Excel/PDF, stamp และ hash
43. [Production Runbook](./12-phase4-production-runbook.md) — ขั้นตอนจริง จุดหยุด และ rollback
44. [Verification Report](./13-phase4-verification-report.md) — หลักฐานที่ต้องกรอกเมื่อ implement/rollout
45. [Admin Operating Procedure](./15-phase4-admin-operating-procedure.md) — วิธีใช้งานของผู้ดูแลระบบ
46. [Release Note Template](./16-phase4-release-note-template.md) — เอกสารต่อหนึ่งเวอร์ชันที่ publish

ระหว่าง implementation ให้ใช้
[Execution Progress Tracker](./25-phase4-execution-progress-tracker.md)
เป็น dashboard อ่านเร็วสำหรับ owner และใช้
[Verification Report](./13-phase4-verification-report.md) เป็นหลักฐานละเอียด
ตาม gate.

## Authority และกฎป้องกัน drift

เอกสารแต่ละฉบับมีหน้าที่เดียวเป็นหลัก หากข้อมูลขัดกันให้หยุดและแก้ authority
ต้นทางก่อนแก้ implementation:

| เรื่อง | Authority |
|---|---|
| Architecture, trust boundary และ invariant | [Architecture Plan](./08-phase4-architecture-ci-plan.md), ADR-003/ADR-004 และ [DB Contract](./17-phase4-database-security-contract.md) |
| Owner/data decision | [Decision Register](./19-phase4-decision-register.md) |
| Work-package status, blocker และ next safe step | [Execution Progress Tracker](./25-phase4-execution-progress-tracker.md) |
| Detailed test/result/hash evidence | [Verification Report](./13-phase4-verification-report.md) |
| Local/Production execution and recovery | [Production Runbook](./12-phase4-production-runbook.md) และ [MIGRATIONS.md](../../04_data/MIGRATIONS.md) |
| Excel/PDF presentation contract | [Official Export Specification](./20-phase4-official-export-spec.md) |
| Admin workflow and UAT | [Admin Operating Procedure](./15-phase4-admin-operating-procedure.md) |
| WP-8/P-37 gate closure and remaining UAT | [P-37 Closure Matrix #34](./34-phase4-wp8-p37-closure-matrix.md) |
| WP-8/P-37 evidence reuse, Owner tasks, safe errors, performance budget และ cleanup | [Owner UAT Script #35](./35-phase4-wp8-p37-evidence-reconciliation-and-owner-uat-script.md) |
| WP-8/P-38 reproducible inputs, no-reset preflight/cleanup และ exact Local baseline | [Preflight Note #36](./36-phase4-wp8-p38-no-reset-owner-uat-preflight.md) |
| P-12 source/migration manifest, readiness matrix, managed residual และหลักฐาน Production/backup | [P-12 Readiness Package #39](./39-phase4-p12-production-readiness-package.md) |
| P-12 Owner decisions, human roles, exact owner/window และ authority-sync gate | [Owner Checklist #40](./40-phase4-p12-owner-decision-checklist.md) |
| P-12 exact CLI kit/ledger/secret/timeout/ownership execution contract | [CLI Execution Runbook #41](./41-phase4-p12-cli-execution-runbook.md) |
| P-49 pending-account business target, current cross-layer gaps และ deferred remediation target | [P-49 Pending-Account Authorization Hardening Plan #45](./45-phase4-p49-pending-authorization-hardening-plan.md) |
| P-50 known price erratum, pre-P-15 source reconciliation และ release-decision boundary | [P-50 Pre-P-15 Plan #46](./46-phase4-p50-known-price-erratum-pre-p15-reconciliation-and-release-decision-plan.md) |
| P-50R SOLO exact offline inputs, bounded implementation/output allowlists, minimum stop rules และ Owner decision fields | [P-50R SOLO Request #49](./49-phase4-p50r-exact-price-reconciliation-evidence-scope-request.md) |
| P-50D baseline-first disposition, exact selected-delta boundary และ Owner decision fields | [Frozen exact one-row Proposal #52](./52-phase4-p50d-one-row-selected-delta-approval-proposal.md) plus canonical exact Owner ratification receipt in [Review Remediation #54](./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md); P-50D V3 is complete only in decision-record-only scope. [Proposal #51](./51-phase4-p50d-2568-baseline-first-delta-review-proposal.md) เป็น V2 selection basis และ [Proposal #50](./50-phase4-p50d-exact-price-and-version-disposition-decision-proposal.md) เป็น historical V1 ที่ superseded แล้ว |
| P-50C current local candidate identity, exact diff, result hashes และ local-review-evidence-only acceptance | [P-50C Result #53](./53-phase4-p50c-one-row-offline-candidate-result-record.md) and [Ratification Receipt #54](./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md) |
| P-51 bounded risk acceptance, exact closeout sequence และ post-P-15 P-49 re-entry | [P-51 Closeout Plan #48](./48-phase4-p51-risk-accepted-master-catalog-closeout-plan.md) |
| Post-Phase-4 whole-service DR backlog | [DR Backlog #42](./42-phase4-post-phase4-disaster-recovery-backlog.md) |
| End-to-end capability completeness and release visibility | [Completeness Audit #29](./29-phase4-owner-dev-completeness-audit.md) |
| One-working-draft, abandon และ final snapshot review | [P-22 Correction Plan #31](./31-phase4-wp66-operator-workflow-correction-plan.md) |
| Version intent, reserved sequence และ item-first/create/restore correction | ADR-003 และ [P-22/P-23.1 Correction Plan #31](./31-phase4-wp66-operator-workflow-correction-plan.md) |

ห้ามคัดลอก volatile status, latest commit, artifact hash หรือ test result ไป
หลายเอกสารโดยไม่จำเป็น ให้เอกสารอื่นลิงก์ไป authority ข้างต้นแทน Current Git
HEAD เป็น authority ของ commit ปัจจุบัน; commit ที่สร้างหลักฐานแล้วจึงบันทึกใน
Tracker/Verification Report เพื่อหลีกเลี่ยง self-referential SHA drift.

การเปลี่ยน schema, permission, canonical hash, publish gate, migration order,
rollback หรือ official export ต้องแก้ authority, acceptance test และ
verification template ใน change set เดียวกัน. WP-6.5 เพิ่ม automated
consistency check สำหรับ contract ที่ตรวจด้วยเครื่องได้; tracked test นี้
implemented แล้ว และ WP-6.6 ต้องขยายให้ตรวจลำดับ work package, migration ที่
จองไว้, route/capability และ authority links ในทุก reliability/rehearsal
checkpoint.

[แผนย้าย Supabase API key](../security/01-supabase-api-key-migration-change-request.md)
เป็น maintenance แยก ไม่ต้องรวมใน Production change เดียวกับ Phase 4 และไม่
บล็อกการเริ่ม implement/local rehearsal ของ Master Catalog

## เรื่องที่ยืนยันแล้ว

- Production เป็นแหล่งจริงของชื่อ หน่วย และราคาเริ่มต้น
- Database version ที่ publish แล้วเป็น system of record
- Export Excel/PDF จากระบบต้องมี version/count/hash และใช้อ้างอิงได้
- แก้รายการแบบ manual ได้ ไม่ต้อง upload Excel ใหม่ทั้งชุด
- Manual และ Excel ใช้ audit/publish controls ชุดเดียวกัน
- ประวัติรายการตาม stable UUID identity แม้เปลี่ยนรหัส
- Raw workbook เก็บในแฟ้มจริง ไม่ใช้ Supabase Storage/signed upload
- ไม่สร้าง paid Supabase branch/project เพิ่ม
- K mapping และ BOQ Rebase อยู่นอก Phase 4 Core
- Factor F อยู่นอก Master Catalog versioning; Phase 4 ต้อง preserve
  `boq.factor_reference_version_id`, Factor F pointer, และ legacy snapshot
  policy เดิม

## เรื่องที่เจ้าของยังต้องตัดสินใจ

| เรื่อง | ผลถ้ายังไม่ตัดสินใจ |
|---|---|
| อนุมัติชุด P-01: Revision 8, ADR, CR, Post-Factor-F plan, Implementation Execution Pack และ contracts สำหรับ implementation/local rehearsal | ยังไม่เริ่ม Phase 4A |
| `ITEM-0131` / `ITEM-0139` จะคงทั้งคู่หรือ retire ตัวใด | P-02 approved retain both; ห้าม merge UUID/history |
| แก้รหัส HDPE Crossing 16 รายการอย่างไร | P-03 approved; publication ยังรอ gate ที่เหลือ |
| รหัส canonical ของ Production-only 20 รายการ | P-04 approved; `ITEM-0139` เป็น temporary legacy |
| Workbook-only 18 raw rows จะ defer ทั้งหมดหรือมี price authority | P-05/P-07 approved: 17 unresolved supplement candidates deferred; workbook `FTW-CON-002` เป็น typo shadow ของ `ITEM-0491` |
| อนุมัติ AAA/TTT ทั้ง 22/65 กลุ่ม | approved for backfill; `2568.1.0` reserved for rehearsal; publication metadata/gates ยังรอแยก |
| Runtime font/logo derivative ใด commit/deploy ได้ | P-10 approved แบบจำกัด; ใช้เฉพาะ runtime derivatives ตาม Decision Register และ [Doc #24](./24-phase4-nt-ci-runtime-asset-analysis.md) |
| Metadata จริงของ baseline `2568.0.0` | P-08 approved: effective `2026-01-01`; approval ref `เอ็นที วทฐฐ./405 ลงวันที่ 27 พ.ย. 2568`; publisher `ผู้จัดการฝ่ายท่อร้อยสาย (ทฐฐ.)` |
| รูปแบบตัวอย่าง Excel/PDF ตาม Export Spec | P-11/WP-6 accepted สำหรับ exact Local pair แล้ว; Production filing/P-15 ยังแยก |
| P-18 placement governance สำหรับ add/supplement | P-30 รับรองกติกา V1, amended WP-7.5 ผ่าน P-32 Local DB/browser/export evidence และ P-33 รับรองขอบเขตเทคนิคแล้วตาม [Review Note #28](./28-phase4-p18-placement-governance-review-note.md). P-36 integrated Local technical rehearsal และ corrected P-37 recovery/owner keyboard/focus/presentation UAT ผ่าน; Owner accepted P-37 เมื่อ 2026-07-25 ภายใต้ guided-UAT variance ที่บันทึกตามจริง. P-14 จบและห้าม replay; Add/Supplement ยังปิดจนถึง staged rollout ตาม Plan #105 V2 และ exact checks ผ่าน |
| P-19 PDF policy สำหรับรายการยกเลิกใช้ | Owner อนุมัติ direction แล้ว: official published/archived PDF แสดงเฉพาะ active, draft PDF แสดงครบและทำเครื่องหมาย `ยกเลิกใช้`; implementation/tests/render QA ยังรอและ Retirement ต้องยังปิดจนกว่าจะผ่าน |
| P-20 canonical hash portability | Owner approved deterministic baseline identity จาก Production-derived `price_list.id`; independent two-rebuild proof ของ data-bearing chain ผ่านแล้ว. `017a` และ `026` เป็น data-free ACL-only changes จึงไม่ทำให้ต้อง repeat portability reset สองรอบ; แต่ต้องมี corrected integration bootstrap ใหม่หนึ่งครั้งหลัง P-47 และต้องขอ Owner reset approval ใหม่. P-15 final hash acceptance ยังแยก |
| P-12 Production readiness | **Complete 2026-08-17.** Exact `017` -> `017a` -> `018`-`026`, objective closeout, and checksum-verified v7 post-`026` backup/isolated restore passed; all Phase 4 flags remain false. P-49 does not reopen this evidence. |
| P-49 pending-account authorization | Business target approved: pending is profile/onboarding-only and catalog `022`/`023` remains active-only. Current BOQ/RPC/Factor-F/profile/API paths are not aligned; risk remains open/high and implementation is deferred/unapproved. P-51 waives it only as blocker for the exact first closeout, then requires re-entry. |
| P-50 known price erratum | P-50R completed `PASS_FOR_P50D_REQUEST`; the frozen P-50D V3 manifest selects only `ITEM-0429` at `0/1764/1764`, and the local offline P-50C technical build proves that one-row candidate scope. Exact Owner confirmation (ratification) is recorded; P-50D V3 is complete only in decision-record-only scope and P-50C is accepted only as local review evidence. P-50H later committed/pushed the evidence package on the feature branch, but required Quality failed and the package is not release-qualified. Published `2568.0.0` remains `0/1763/1763`; historical BOQs are unchanged. No candidate application, Production, deployment, or publication authority follows. |
| P-50R evidence scope | [Request/Result #49](./49-phase4-p50r-exact-price-reconciliation-evidence-scope-request.md) is consumed and complete. The immutable package covers 28/28 pages, 67 deltas, 245 exceptions, and zero blockers. Its 49 technical candidates are comparison evidence only; published/current `2568.0.0` remains authority. No P-50D/P-50C/Git/database/Production/network/mutation or later gate is implied. |
| P-50D decision | Historical [Proposal #50](./50-phase4-p50d-exact-price-and-version-disposition-decision-proposal.md) is superseded without approval. [Proposal #51](./51-phase4-p50d-2568-baseline-first-delta-review-proposal.md) records the V2 baseline-first choice. Exact [Proposal #52](./52-phase4-p50d-one-row-selected-delta-approval-proposal.md), request `P50D-REQ-20260823-V3`, freezes only `ITEM-0429` at `0/1764/1764`; [Receipt #54](./54-phase4-p50c-review-remediation-and-p50d-v3-ratification-request.md) records exact Owner ratification and completes P-50D V3 only in decision-record-only scope. The other 709 baseline authority rows and 48 candidates remain unchanged. |
| P-50C result | [Result #53](./53-phase4-p50c-one-row-offline-candidate-result-record.md) records **TECHNICAL BUILD COMPLETE / DATA REVIEW PASSED / ACCEPTED AS LOCAL REVIEW EVIDENCE ONLY** for local offline candidate `P50C-CANDIDATE-20260823-V1`; candidate `d7a19a9...`, diff `72e950d9...`, manifest `d88d3daa...`. All other 48 candidates—including `ITEM-0427`, `ITEM-0430`, and `ITEM-0431`—remain unchanged, while the 17 exclusions remain distinct. Target `2568.1.0` remains provisional pending a fresh issued/claimed registry check. P-50H published only the review evidence on the feature branch; it did not apply the candidate, and Quality failed. DB/Production/network/application/BOQ remain untouched. |
| P-51 closeout sequencing | P-51D through P-50H are complete/consumed. P-50I was also consumed: its exact patch target passed, but [Result #60](./60-phase4-p50i-local-validation-failure-result-record.md) records local `21/22` and `30/31` failure before Git. Gate 1 remains incomplete and P-13 is hard-held. The sole current Owner review is [P-50J Proposal #61](./61-phase4-p50j-marker-count-correction-and-ci-authorization-proposal.md); it is not execution authority. The waiver needs fresh Owner reapproval if closeout is unfinished at 2026-08-25 23:59:59 +07. Nothing continues automatically. |
| WP-6.6 capability completeness | G1R/G2 ผ่าน DB/concurrency/P-20/advisor/repository บน exact candidate `721c2c2`; P-25/G3/P-26 technical paths ผ่าน และ owner accepted G3 บน exact `78e96ab` แล้ว. G4 ยังแยก ส่วน independent UAT/performance/formal accessibility อยู่ WP-8 |
| P-21/P-22/P-23/P-23.1/P-24/P-25/P-26/P-27 WP-6.6 Local-only | `020` SHA-256 `e07e0c4161077efba7bc4f6ebf95518d0cc1bc7e4628a43a128dd899bd1aef93` ผ่าน G1R/G2, P-28 เพิ่มเข้า bootstrap และ P-29/G4E ผ่าน clean chain; G3/P-26 accepted บน exact application checkpoint `78e96ab`. ไม่รวม `021` bootstrap, Factor F/hotfix expansion หรือ Production |
| Version lifecycle ตาม ADR-003 | Admin ต้องเลือก annual/revision/patch; annual year มาจาก owner; ระบบใช้ทะเบียนทุกสถานะและไม่ reuse เลข; DB บังคับเลขถัดไป. Live G1R/G2/G3 และ owner closeout ผ่านแล้ว; WP-8/P-14 ยังรอ |
| Live Production preflight หลัง Factor F rollout | ต้อง refresh ก่อนทุก Production gate; ห้ามใช้ BOQ count จาก closeout เป็นค่าตายตัว |

## ตัวเลข reconciliation ที่ต้องใช้เป็นจุดตรวจ

| รายการ | จำนวน |
|---|---:|
| Production | 710 |
| Candidate workbook | 708 |
| Match ชื่อ+หน่วย | 690 |
| ราคาตรงทั้งหมด | 648 |
| ราคาต่าง แต่ต้องรักษา Production | 42 |
| Production-only | 20 |
| Workbook-only | 18 |
| HDPE Crossing taxonomy conflict | 16 |
| Decision records ใน CSV | 728 |

## คำแนะนำการอนุมัติ

อนุมัติเป็นสองชั้น:

1. **อนุมัติหลักการและให้ implement/local rehearsal แบบจำกัดขอบเขต** หลัง
   review ADR/CR/แผนและ P-01
2. **อนุมัติ Production แยกทีละ gate** หลังเห็นผล Local, migration diff,
   backup restore, test, UI, export hash และ verification report

การอนุมัติชั้นแรกไม่ควรถือเป็นสิทธิ์ deploy หรือ publish Production อัตโนมัติ
และไม่ควรถือว่า data decisions เช่น duplicate, HDPE Crossing, Production-only,
workbook-only, CI assets, export sample หรือ baseline publication metadata
ถูกอนุมัติแล้วโดยอัตโนมัติ รายการเหล่านั้นต้องปิดตาม P-02 ถึง P-11 ก่อน
candidate freeze, final backfill, export acceptance หรือ publication gate ที่
เกี่ยวข้อง; ขณะนี้ P-02 ถึง P-08 ถูกบันทึกแล้ว, P-09 reserve `2568.1.0`
สำหรับ draft/rehearsal เท่านั้น, P-10 approved runtime CI assets แบบจำกัดตาม
Doc #24, และ P-09 publication metadata กับ P-11 ยังต้องปิดแยก

เวลาอ่านบทวิเคราะห์หรือ quick-decision guide ภายนอก ให้ถือเป็นคำแนะนำ ไม่ใช่
authority โดยตรง:

- P-02 approved ให้ retain `ITEM-0131` และ `ITEM-0139` ทั้งคู่ใน `2568.1.0`;
  `ITEM-0139` เป็น future-retirement candidate เท่านั้น และห้าม merge
  UUID/history
- P-03 approved ให้แยก HDPE Crossing เป็น `CRS-H06`/`CRS-H08`; `CRS-GIP-025`
  ยัง deferred ตาม P-05
- P-06 approved 22/65 group meanings สำหรับ backfill โดยมี `ITEM-0139`
  temporary-legacy safeguard; P-07 approved ให้ใช้ Production `ITEM-0491`
  wording สำหรับ `FTW-CON-002` และ reject workbook typo; P-08 approved legacy
  `2568.0.0` baseline metadata แล้ว; P-09 reserve `2568.1.0` สำหรับ
  draft/rehearsal เท่านั้น และ publication ยังรอ metadata/gates ที่เหลือ
- P-10 approved เฉพาะ runtime derivatives ที่ระบุใน Decision Register และ
  Doc #24; `/CI/` source ยัง local-only และ P-11 exact Local replacement pair
  ได้รับการยอมรับแล้ว ส่วน Production filing ยังรอ P-15
