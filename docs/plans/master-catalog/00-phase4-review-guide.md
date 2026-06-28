# Phase 4 Review Guide

**Prepared:** 2026-06-22
**Purpose:** ให้เจ้าของระบบ review ชุดเอกสารตามลำดับโดยไม่สับสนกับ Phase เดิม

## สถานะสั้นที่สุด

- Production Phase 0 → 1A → 2 → 1B: **เสร็จและใช้งานอยู่**
- Current Master Catalog: **`2568.0.0`, 710 รายการ**
- Factor F versioning: **เสร็จแล้วก่อน Phase 4; default ปัจจุบันคือ
  `2569.0.0` และ BOQ เก่าไม่ได้ถูก backfill**
- Phase 4 Admin/Import/Publish/Official Export: **ยังไม่เริ่ม implement**
- รอบถัดไปของ Phase 4: **เริ่มจาก baseline หลัง Factor F `012-015` และ
  migration ถัดไปคือ `016+`**
- เอกสาร Phase 4 ต้องใช้ live preflight count เสมอ เพราะ BOQ ใหม่อาจเพิ่ม
  ระหว่างรอ implement

## ลำดับแนะนำในการ review

1. [แผนสถาปัตยกรรม Revision 8](./08-phase4-architecture-ci-plan.md) — อ่านภาพรวม ขอบเขต และเหตุผล
2. [ผลพิจารณารีวิวภายนอก](./21-phase4-architecture-review-disposition.md) — ดูว่าข้อใดรับ/ไม่รับและเพราะอะไร
3. [ADR-004](../../02_architecture/ADR/ADR-004-phase4-catalog-governance-and-official-publication.md) — อนุมัติหลักการที่เปลี่ยนยาก
4. [Phase 4 Change Request](./09-phase4-change-request.md) — อนุมัติ scope/ความเสี่ยง/แต่ละ Production gate
5. [Decision Register](./19-phase4-decision-register.md) — ดูสิ่งที่ล็อกแล้ว/ยังรอตัดสินใจและ gate ที่เกี่ยวข้อง
6. [Reconciliation Report](./11-phase4-reconciliation-report.md) — ตรวจว่าข้อมูล 710/708 ถูกจัดการอย่างไร
7. [Code Dictionary](./10-phase4-structured-code-dictionary.md) — ตรวจความหมาย AAA/TTT และจุดผิด 16 Crossing
8. [Database/Security Contract](./17-phase4-database-security-contract.md) — ตรวจ schema, RLS/grants, function และ migration order
9. [Lean Threat Model](./18-phase4-threat-model.md) — ตรวจความเสี่ยง/control/หลักฐานทดสอบ
10. [Parser/Hash Specification](./14-phase4-parser-and-canonical-hash-spec.md) — สัญญาเชิงเทคนิคที่ทำให้ import/export ทำซ้ำได้
11. [Official Export Specification](./20-phase4-official-export-spec.md) — อนุมัติรูปแบบ Excel/PDF, stamp และ hash
12. [Production Runbook](./12-phase4-production-runbook.md) — ขั้นตอนจริง จุดหยุด และ rollback
13. [Verification Report](./13-phase4-verification-report.md) — หลักฐานที่ต้องกรอกเมื่อ implement/rollout
14. [Admin Operating Procedure](./15-phase4-admin-operating-procedure.md) — วิธีใช้งานของผู้ดูแลระบบ
15. [Release Note Template](./16-phase4-release-note-template.md) — เอกสารต่อหนึ่งเวอร์ชันที่ publish

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
| อนุมัติชุด P-01: Revision 8, ADR, CR และ contracts สำหรับ implementation/local rehearsal | ยังไม่เริ่ม Phase 4A |
| `ITEM-0131` / `ITEM-0139` จะคงทั้งคู่หรือ retire ตัวใด | candidate ยังล็อกไม่ได้; ห้าม merge UUID/history |
| แก้รหัส HDPE Crossing 16 รายการอย่างไร | code dictionary ยัง publish ไม่ได้ |
| รหัส canonical ของ Production-only 20 รายการ | candidate 710 แถวยังไม่ครบ |
| Workbook-only 18 รายการจะ defer ทั้งหมดหรือมี price authority | ยังเพิ่มเป็นของจริงไม่ได้ |
| อนุมัติ AAA/TTT ทั้ง 22/62 กลุ่ม | structured code ยังเป็นเพียง candidate |
| Runtime font/logo derivative ใด commit/deploy ได้ | CI implementation ยังเริ่มไม่ได้ |
| Metadata จริงของ baseline `2568.0.0` | ยัง validate publication-completeness constraint ไม่ได้ |
| รูปแบบตัวอย่าง Excel/PDF ตาม Export Spec | ยังปิดงาน export acceptance ไม่ได้ |
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
ถูกอนุมัติแล้ว รายการเหล่านั้นยังต้องปิดตาม P-02 ถึง P-11 ก่อน candidate
freeze, final backfill, export acceptance หรือ publication gate ที่เกี่ยวข้อง
