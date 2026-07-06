# Phase 4 Review Guide

**Prepared:** 2026-06-22
**Purpose:** ให้เจ้าของระบบ review ชุดเอกสารตามลำดับโดยไม่สับสนกับ Phase เดิม

## สถานะสั้นที่สุด

- Production Phase 0 → 1A → 2 → 1B: **เสร็จและใช้งานอยู่**
- Current Master Catalog: **`2568.0.0`, 710 รายการ**
- Factor F versioning: **เสร็จแล้วก่อน Phase 4; default ปัจจุบันคือ
  `2569.0.0` และ BOQ เก่าไม่ได้ถูก backfill**
- Phase 4 Admin/Import/Publish/Official Export: **local implementation ถึง
  WP-6 พร้อม owner review; WP-6.5 publish guard, WP-7/WP-8 และ Production
  gates ยังไม่เริ่ม**
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
8. [Reconciliation Report](./11-phase4-reconciliation-report.md) — ตรวจว่าข้อมูล 710/708 ถูกจัดการอย่างไร
9. [Code Dictionary](./10-phase4-structured-code-dictionary.md) — ตรวจความหมาย AAA/TTT และจุดผิด 16 Crossing
10. [Database/Security Contract](./17-phase4-database-security-contract.md) — ตรวจ schema, RLS/grants, function และ migration order
11. [Lean Threat Model](./18-phase4-threat-model.md) — ตรวจความเสี่ยง/control/หลักฐานทดสอบ
12. [Parser/Hash Specification](./14-phase4-parser-and-canonical-hash-spec.md) — สัญญาเชิงเทคนิคที่ทำให้ import/export ทำซ้ำได้
13. [Official Export Specification](./20-phase4-official-export-spec.md) — อนุมัติรูปแบบ Excel/PDF, stamp และ hash
14. [Production Runbook](./12-phase4-production-runbook.md) — ขั้นตอนจริง จุดหยุด และ rollback
15. [Verification Report](./13-phase4-verification-report.md) — หลักฐานที่ต้องกรอกเมื่อ implement/rollout
16. [Admin Operating Procedure](./15-phase4-admin-operating-procedure.md) — วิธีใช้งานของผู้ดูแลระบบ
17. [Release Note Template](./16-phase4-release-note-template.md) — เอกสารต่อหนึ่งเวอร์ชันที่ publish

ระหว่าง implementation ให้ใช้
[Execution Progress Tracker](./25-phase4-execution-progress-tracker.md)
เป็น dashboard อ่านเร็วสำหรับ owner และใช้
[Verification Report](./13-phase4-verification-report.md) เป็นหลักฐานละเอียด
ตาม gate.

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
| รูปแบบตัวอย่าง Excel/PDF ตาม Export Spec | ยังปิดงาน export acceptance ไม่ได้ |
| P-18 placement governance สำหรับ add/supplement และ structured-code exception | ต้องทำ WP-6.5 publish-boundary guard ก่อน WP-7; ห้าม publish version ที่มี identity ใหม่จนกว่า guard และ placement decision พร้อม และ `2568.1.0` ต้องมี active legacy `ITEM-####` ได้เฉพาะ `ITEM-0139` |
| P-19 PDF policy สำหรับรายการยกเลิกใช้ | ถ้า version ใดมี inactive/retired rows ต้องตัดสินใจว่าจะ exclude/mark/appendix ก่อน filed PDF |
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
  Doc #24; `/CI/` source ยัง local-only และ P-11 visual sample ยัง pending
