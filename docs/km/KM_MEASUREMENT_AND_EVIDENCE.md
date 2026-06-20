# KM Measurement and Evidence

**หัวข้อ:** หลักฐานและตัวชี้วัดผลการนำ Critical Knowledge ไปใช้  
**วันที่ข้อมูล:** 11 มิถุนายน 2569  
**แหล่งข้อมูล:** production Supabase project `Conduit Price List` (`otlssvssvgkohqwuuiir`) และเอกสารใน repository  

---

## 1. Evidence Summary

| Evidence | Current value | KM Interpretation |
|---|---:|---|
| BOQ records | 187 | ความรู้ถูกนำไปใช้สร้างงานจริง |
| BOQ routes | 209 | รองรับความรู้เรื่องการแยกเส้นทาง |
| BOQ items | 1,475 | รายการ BOQ ถูกจัดเก็บเป็น structured data |
| Active price list | 710 | ราคากลางถูกทำเป็นฐานข้อมูลกลาง |
| Price categories | 52 | จัดหมวดหมู่ความรู้เพื่อค้นหาและใช้งาน |
| Factor reference rows | 37 | ความรู้ด้าน Factor F ถูกจัดเป็น reference |
| User profiles | 20 | มี community ผู้ใช้และผู้ดูแล |
| Active users | 16 | มีฐานผู้ใช้งานจริง |
| Pending users | 4 | มี pipeline ของผู้ใช้งานใหม่ |
| Unit cost mismatch | 0 | ราคากลางผ่าน integrity check |
| BOQ-level route mismatch | 0 | ยอดรวมระดับ BOQ ตรวจสอบได้ |

---

## 2. KPI Dashboard for KM Submission

| KPI | Baseline / Current | Target | Evidence Needed |
|---|---:|---:|---|
| ลดเวลาจัดทำ BOQ | manual 2-3 ชั่วโมง | ไม่เกิน 30 นาที | time study, user survey, event log |
| จำนวน BOQ ที่ใช้ระบบ | 187 | เพิ่มต่อเนื่อง | database count |
| ความครบถ้วนของ price list | 710 active items | ตรงตาม catalog official | price list report |
| ความถูกต้องของราคาต่อหน่วย | 0 mismatch | 0 mismatch | SQL integrity result |
| การใช้ multi-route | 209 routes | เพิ่มตามงานจริง | route count |
| ความครบถ้วน Factor F snapshot | 113/187 BOQ | BOQ ใหม่ครบ 100% | snapshot check |
| การลดข้อมูล legacy | 24 legacy BOQ | ลด/จัดประเภทชัดเจน | cleanup report |
| การถ่ายทอดความรู้ | เอกสารพร้อม | อย่างน้อย 2 กิจกรรม | attendance, minutes |

---

## 3. Evidence to Attach

ควรเตรียมหลักฐานประกอบชุดส่งประกวด:

| Evidence | ตัวอย่างหลักฐาน |
|---|---|
| Screenshot ระบบ | Dashboard, BOQ create/edit, price list, print/export |
| รายงาน production snapshot | ตาราง count จาก database |
| ตัวอย่าง BOQ output | PDF/print screenshot หรือ Excel export |
| Knowledge map | `CRITICAL_KNOWLEDGE_MAP.md` |
| Workflow before/after | `BEFORE_AFTER_WORKFLOW.md` |
| SOP / คู่มือ | `SOP_CONDUIT_BOQ_WORKFLOW.md` |
| กิจกรรม KM | รูปกิจกรรม, agenda, attendance, minutes |
| Test/validation | ผล `npm test`, integrity checks, price mismatch checks |

---

## 4. Data Quality Findings

| Finding | Current value | Action |
|---|---:|---|
| `price_list.unit_cost` mismatch | 0 | Maintain integrity check |
| BOQ-level route total mismatch | 0 | Maintain integrity check |
| route total mismatch | 2 routes | Cleanup and add validation |
| items without route | 5 items | Backfill or classify as legacy |
| BOQs without Factor F snapshot | 74 | Backfill or validate on next save |
| legacy BOQs without creator | 24 | Classify or migrate ownership |

---

## 5. Measurement Gaps

Current production data proves usage and data quality, but some competition-friendly metrics require additional collection:

| Gap | Why it matters | Suggested fix |
|---|---|---|
| Time-to-create not logged | Needed to prove speed improvement | Add event log or conduct time study |
| Print/export count not logged | Shows completed work/output | Add `boq_printed`, `boq_exported_excel` event |
| User satisfaction not captured | Shows adoption quality | Short survey after training |
| Error reduction not formally tracked | Shows quality improvement | Compare manual issue log vs system integrity checks |
| Training records not stored | Shows KM dissemination | Keep attendance and minutes |

---

## 6. Recommended Event Log

To strengthen future KM evidence:

| Event | Purpose |
|---|---|
| `boq_created` | start time for BOQ creation |
| `boq_first_item_added` | catalog search/use evidence |
| `boq_saved_with_totals` | completion checkpoint |
| `boq_printed` | output evidence |
| `boq_exported_excel` | handoff evidence |
| `boq_submitted` | future workflow evidence |
| `boq_approved` | future governance evidence |
| `price_item_search_no_result` | catalog improvement signal |

---

## 7. Evidence Narrative

ข้อมูล production แสดงให้เห็นว่าการจัดการความรู้ไม่ได้หยุดอยู่ที่เอกสาร แต่ถูกนำไปใช้งานจริงในระบบ Conduit BOQ แล้ว โดยความรู้ด้านราคากลางถูกแปลงเป็น price list 710 รายการ ความรู้ด้านการแยกเส้นทางถูกแปลงเป็น route records 209 รายการ และความรู้ด้านรายการ BOQ ถูกใช้งานเป็น line items 1,475 รายการ

การตรวจสอบ integrity ยังแสดงว่าราคาต่อหน่วยใน price list ไม่มี mismatch และยอดรวมระดับ BOQ เทียบกับ route ไม่พบ mismatch ซึ่งเป็นหลักฐานว่าการนำความรู้ไปใช้ผ่านระบบช่วยเพิ่มมาตรฐานและความตรวจสอบได้ของกระบวนการ

