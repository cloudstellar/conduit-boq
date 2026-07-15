# Phase 4 Review Guide

**Prepared:** 2026-06-22
**Purpose:** ให้เจ้าของระบบ review ชุดเอกสารตามลำดับโดยไม่สับสนกับ Phase เดิม

## สถานะสั้นที่สุด

- Production Phase 0 → 1A → 2 → 1B: **เสร็จและใช้งานอยู่**
- Current Master Catalog: **`2568.0.0`, 710 รายการ**
- Factor F versioning: **เสร็จแล้วก่อน Phase 4; default ปัจจุบันคือ
  `2569.0.0` และ BOQ เก่าไม่ได้ถูก backfill**
- Phase 4 Admin/Import/Publish/Official Export: **WP-6/P-11 complete และ
  WP-6.5 ผ่านตามขอบเขต reliability ที่พิสูจน์แล้ว แต่ capability audit พบว่า
  admin workflow ยังไม่ครบ; P-22 จึง Hold WP-6.6 closeout เพื่อแก้ one working
  draft, audited abandon, item-first workspace และ final snapshot review.
  Source/static implementation ผ่านที่ `ac31feb` และ G1 Local DB/concurrency
  ผ่านที่ `e463270`; pre-amendment operator/browser preflight ผ่านที่
  `c8f6dca` และ P-23 contextual-workspace checkpoint ผ่านเป็นหลักฐานเดิม.
  P-23.1 ต่อมาปรับ explicit version intent, reserved-number sequencing,
  post-create/item-first/restore flow และแก้ candidate `020`; ดังนั้น G1 เดิม
  เป็น historical. ต่อมา owner อนุมัติ G1R แยกต่างหาก และ clean Local DB,
  concurrency, P-20 input, advisors, repository gates และ browser flow ผ่านบน
  exact checkout `721c2c2` แล้ว ต่อมา owner อนุมัติ independent G2 แยก และ
  clean rebuild/P-20 comparison ผ่านบน exact candidate เดียวกัน พร้อมคืน
  Local เป็น pointer `2568.0.0`, ไม่มี working draft และปิด catalog flags
  ทั้งหมด. ต่อมา P-25 presentation และ G3 real-route stale-review technical
  walkthrough ผ่านบน source `6599c30`; P-26 confirmation สำหรับ Publish,
  Recode และ Retire ผ่านแบบไม่ reset/publish บน candidate ที่อิง `2fd438d`
  และ cleanup คืน baseline แล้ว. Owner ยอมรับ G3/WP-6.6 บน exact
  application checkpoint `78e96ab3ed9993707014c4aba1d285b7592b17a1`
  เมื่อ 2026-07-14; หลักฐาน `3bfc74e` เป็นประวัติแต่ถูก supersede สำหรับ
  closeout รอบใหม่. G4, WP-7 และ Production ยังไม่ได้อนุมัติ**
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
12. [Reconciliation Report](./11-phase4-reconciliation-report.md) — ตรวจว่าข้อมูล 710/708 ถูกจัดการอย่างไร
13. [Code Dictionary](./10-phase4-structured-code-dictionary.md) — ตรวจความหมาย AAA/TTT และจุดผิด 16 Crossing
14. [Database/Security Contract](./17-phase4-database-security-contract.md) — ตรวจ schema, RLS/grants, function และ migration order
15. [Lean Threat Model](./18-phase4-threat-model.md) — ตรวจความเสี่ยง/control/หลักฐานทดสอบ
16. [Parser/Hash Specification](./14-phase4-parser-and-canonical-hash-spec.md) — สัญญาเชิงเทคนิคที่ทำให้ import/export ทำซ้ำได้
17. [Official Export Specification](./20-phase4-official-export-spec.md) — อนุมัติรูปแบบ Excel/PDF, stamp และ hash
18. [Production Runbook](./12-phase4-production-runbook.md) — ขั้นตอนจริง จุดหยุด และ rollback
19. [Verification Report](./13-phase4-verification-report.md) — หลักฐานที่ต้องกรอกเมื่อ implement/rollout
20. [Admin Operating Procedure](./15-phase4-admin-operating-procedure.md) — วิธีใช้งานของผู้ดูแลระบบ
21. [Release Note Template](./16-phase4-release-note-template.md) — เอกสารต่อหนึ่งเวอร์ชันที่ publish

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
| P-18 placement governance สำหรับ add/supplement | P-30 รับรองกติกา V1, amended WP-7.5 ผ่าน P-32 Local DB/browser/export evidence และ P-33 รับรองขอบเขตเทคนิคแล้วตาม [Review Note #28](./28-phase4-p18-placement-governance-review-note.md). Add/Supplement ต้องซ่อน/ปิดต่อจนผ่าน WP-8/P-14 ด้าน dirty state, review-by-exception, keyboard, performance และ intended-admin UAT |
| P-19 PDF policy สำหรับรายการยกเลิกใช้ | ถ้า version ใดมี inactive/retired rows ต้องตัดสินใจว่าจะ exclude/mark/appendix ก่อน filed PDF |
| P-20 canonical hash portability | Owner approved deterministic baseline identity จาก Production-derived `price_list.id`; independent two-rebuild proof ผ่านแล้ว และต้อง rerun หลัง migration change รวมถึง WP-8/P-15 |
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
