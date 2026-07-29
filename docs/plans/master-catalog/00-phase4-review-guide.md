# Phase 4 Review Guide

**Prepared:** 2026-06-22
**Purpose:** ให้เจ้าของระบบ review ชุดเอกสารตามลำดับโดยไม่สับสนกับ Phase เดิม

## สถานะสั้นที่สุด

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
  gate ถัดไปและทำ copy ให้เสร็จก่อนดำเนินการต่อ. สถานะยังเป็น **HOLD**.
  P-44 executable migration/application/bootstrap/generator/runner content
  freeze ถูก commit/push แล้วที่
  `ed94c0304be2741217c7ea2c36322b426de1dfe5`; Remote แสดง
  `Vercel=success` และไม่มี PR-triggered GitHub Actions run. P-45 อนุมัติ
  authority/status-only descendant commit/push จาก `ed94c03` เท่านั้น
  โดยห้ามเปลี่ยน migration/application/bootstrap/generator/runner และห้ามรวม
  protected untracked paths. P-46 อนุมัติแบบมีเงื่อนไขให้รัน destructive
  Local bootstrap ได้ **หนึ่งครั้ง** หลัง descendant นั้น clean, pushed,
  HEAD ตรง upstream และ Remote-ready; คำสั่งนี้ reset/rebuild Local Supabase
  ทั้งก้อนแต่ไม่แตะ Production. หาก fail หรือ drift ให้เก็บ evidence แล้วหยุด
  ห้าม retry/patch/reset ครั้งที่สองโดยไม่มี Owner approval ใหม่. ยังต้องระบุ
  named-human executor และ named-human independent verifier ที่เป็นคนละคน,
  exact path/`current_user`/object-owner/window ก่อนขอ P-12 แยกต่างหาก. Fresh
  backup ก่อน migration, post-migration
  application-only backup/manifest หลัง verification ของ `017`, `017a`,
  `018`-`025` และก่อน P-13, รวมทั้ง final external copy/checksum ยังคงบังคับ.
  Rehearsal-only kit
  จาก dirty working tree ใช้ disposable network-isolated PostgreSQL 17 และ
  apply ได้เฉพาะ `017` ก่อน hard-stop เพราะ private-function default ACL ไม่มี;
  ไม่ได้รัน `018`-`025` และไม่ได้ migrate/write Local หรือ Production.
  [Finding #43](./43-phase4-p12-private-function-default-privilege-finding.md)
  บันทึก Owner decision เลือก Option B แล้ว; selected
  architecture/security remediation ยังต้องผ่าน fresh complete exact-source
  rehearsal ก่อนขอ P-12. Option B เป็น separately reviewed **bridge
  migration** ในลำดับหลัง `017` และก่อน
  `018` เท่านั้น; after-`025` ไม่ปลอดภัย. เหตุผลคือ `018` สร้าง private
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
  reassert เฉพาะ grant ที่ตั้งใจ. ห้ามแก้ `017`/`018`, ห้ามเอา `017a` ไป patch
  Local ที่ผ่าน `025` แล้ว และ migration `026` ไม่ใช่ security fix นี้.
  Evidence candidate ผ่าน independent source/architecture/security review และ
  static checks แล้ว. P-44 freeze ถูก commit/push ที่ `ed94c03` และ Remote
  `Vercel=success`; ไม่มี PR-triggered GitHub Actions run. P-45 อนุมัติเฉพาะ
  authority/status-only descendant commit/push เพื่อให้ decision record อยู่
  บน clean exact **source/tooling HEAD** เดียวกับ Local/kit โดยไม่เปลี่ยน
  executable migration/application/bootstrap/generator/runner content.
  P-46 อนุมัติ corrected canonical Local bootstrap **หนึ่งครั้ง** แบบมี
  เงื่อนไขหลัง descendant นั้น clean/pushed/Remote-ready พร้อม consolidated
  smoke/invariants. คำสั่งทำลายและสร้าง Local Supabase ใหม่ทั้งหมด แต่ไม่แตะ
  Production; หาก fail/drift ให้หยุดและต้องขอ approval ใหม่ก่อน reset อีกครั้ง.
  หลัง Local gate ผ่านจึงพิจารณา authorization แยกเพื่อสร้าง kit เดียวสำหรับ
  `calibrate-schema` pass 1, independent contract review และ second fresh full
  isolated rehearsal พร้อม transitive pass-2 closeout. หลัง explicit Owner
  P-12 GO เท่านั้นจึงให้ Checklist #40 เป็น sole net change ที่ descendant GO
  HEAD และ Production reuse source kit. การเลือก Option B ไม่ใช่ P-12; P-12
  ยัง HOLD.
  Add/Supplement ยังซ่อนจนถึง P-14 และ
  Production P-12 ถึง P-15 ยังไม่ได้อนุมัติ. ใช้ Tracker เป็น authority ของ
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
18. [P-12 Private-Function Default-Privilege Finding](./43-phase4-p12-private-function-default-privilege-finding.md) — blocker จาก disposable `017` rehearsal; Owner เลือก exact Option B `017a` bridge หลัง `017`/ก่อน `018`, ไม่ใช่ after-`025`; independent source/static review ผ่านแล้ว แต่ Git/Remote/Local และ two-pass evidence รวมถึง P-12 ยังเปิด
19. [Post-Phase-4 DR Backlog](./42-phase4-post-phase4-disaster-recovery-backlog.md) — งาน RPO/RTO/Auth/Storage/off-device restore ภายหลัง; ไม่ใช่ P-12 blocker
20. [Reconciliation Report](./11-phase4-reconciliation-report.md) — ตรวจว่าข้อมูล 710/708 ถูกจัดการอย่างไร
21. [Code Dictionary](./10-phase4-structured-code-dictionary.md) — ตรวจความหมาย AAA/TTT และจุดผิด 16 Crossing
22. [Database/Security Contract](./17-phase4-database-security-contract.md) — ตรวจ schema, RLS/grants, function และ migration order
23. [Lean Threat Model](./18-phase4-threat-model.md) — ตรวจความเสี่ยง/control/หลักฐานทดสอบ
24. [Parser/Hash Specification](./14-phase4-parser-and-canonical-hash-spec.md) — สัญญาเชิงเทคนิคที่ทำให้ import/export ทำซ้ำได้
25. [Official Export Specification](./20-phase4-official-export-spec.md) — อนุมัติรูปแบบ Excel/PDF, stamp และ hash
25. [Production Runbook](./12-phase4-production-runbook.md) — ขั้นตอนจริง จุดหยุด และ rollback
26. [Verification Report](./13-phase4-verification-report.md) — หลักฐานที่ต้องกรอกเมื่อ implement/rollout
27. [Admin Operating Procedure](./15-phase4-admin-operating-procedure.md) — วิธีใช้งานของผู้ดูแลระบบ
28. [Release Note Template](./16-phase4-release-note-template.md) — เอกสารต่อหนึ่งเวอร์ชันที่ publish

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
| P-18 placement governance สำหรับ add/supplement | P-30 รับรองกติกา V1, amended WP-7.5 ผ่าน P-32 Local DB/browser/export evidence และ P-33 รับรองขอบเขตเทคนิคแล้วตาม [Review Note #28](./28-phase4-p18-placement-governance-review-note.md). P-36 integrated Local technical rehearsal และ corrected P-37 recovery/owner keyboard/focus/presentation UAT ผ่าน; Owner accepted P-37 เมื่อ 2026-07-25 ภายใต้ guided-UAT variance ที่บันทึกตามจริง. Add/Supplement ยังซ่อน/ปิดจนถึง P-14 และต้อง re-evaluate residual ก่อน enablement |
| P-19 PDF policy สำหรับรายการยกเลิกใช้ | ถ้า version ใดมี inactive/retired rows ต้องตัดสินใจว่าจะ exclude/mark/appendix ก่อน filed PDF |
| P-20 canonical hash portability | Owner approved deterministic baseline identity จาก Production-derived `price_list.id`; independent two-rebuild proof ของ data-bearing chain ผ่านแล้ว. `017a` เป็น data-free ACL-only bridge จึงต้องทำ corrected integration bootstrap ใหม่หนึ่งครั้ง แต่ไม่ทำให้ต้อง reset ซ้ำสองรอบ; rerun เพิ่มเฉพาะเมื่อ source ที่กระทบ data/identity เปลี่ยนหรือรอบใหม่ fail และต้องมี Owner reset approval ใหม่. P-15 final hash acceptance ยังแยก |
| P-12 Production readiness | Owner-authorized Production database/ledger/advisor read-only evidence ผ่านในขอบเขตฐานข้อมูล: `2568.0.0`/710 และ authority hash ตรง Local, BOQ/Factor F links ปกติ, ledger `009`-`016` ครบ และ hotfix `016` ตรง source. Management API ยืนยันว่า Data API ไม่ expose `private`. Encrypted readiness dump `9d306a47...` จับ 234 BOQs/2,270 items; exact-image isolated restore และ 2026-07-27 non-force detach/read-only reopen/full checksum ผ่านโดยไม่ dump Auth/Storage, reset Local หรือเขียน Production. Exact pushed readiness HEAD `07d1d33` และ P-44 content-freeze ancestor `ed94c03` ต่างมี `Vercel=success` และไม่มี PR-triggered GitHub Actions run ให้บันทึก. เมื่อ 2026-07-28 Owner รับ guarded-definer, P-12/P-13 leaked-password และ `v_row_count` disposition; P-14 Auth decision ยังแยก. Same-device residual หมดอายุเมื่อเริ่ม post-publication checkpoint หลัง P-15 verification ที่อนุมัติแยก หรือ 168 ชั่วโมงหลัง P-12 เริ่ม แล้วแต่ว่าอะไรถึงก่อน และใช้กฎหยุด 24 ชั่วโมง. Independent source/architecture/security review และ static checks ผ่านแล้ว. P-45 อนุมัติ bounded authority/status-only descendant commit/push จาก `ed94c03`; P-46 อนุมัติ one-time corrected Local bootstrap แบบมีเงื่อนไขหลัง resulting descendant clean/pushed/Remote-ready. Package #39 ยัง HOLD ที่ P-45 resulting-HEAD/Remote status, corrected Local result, kit/pass 1/authenticated review/pass 2, named-human executor และ independent verifier ที่เป็นคนละคน, exact path/approved `current_user`/object-owner/window และ exact P-12 approval; fresh in-window backup/restore/sign-off, post-migration application-only backup/manifest ก่อน P-13 และ final external-copy closeout ยังบังคับ. หาก Local fail/drift ห้าม reset ซ้ำโดยไม่มี approval ใหม่. Evidence window นี้ไม่ใช่การอนุมัติ migration |
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
