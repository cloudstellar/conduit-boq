# Master Catalog Phase 4 Structured-Code Dictionary

**Status:** Owner-approved for P-06 code-group meanings/backfill with
`ITEM-0139` temporary-legacy safeguard; publication remains pending
**Prepared:** 2026-06-22
**Source workbook:** `files/NT_Item_Code_Master_K_Mapping_2568.xlsx`
**Scope:** Business code `AAA-TTT-###`; not K-formula approval

**Owner decision recorded:** 2026-07-04 — approved according to the
recommendation as a candidate dictionary and code-governance framework for
implementation/local rehearsal. The owner accepts the code format, no-reuse
rule, retired-sequence reservation, sequence-900 capacity review, UUID identity
separation, explicit group metadata, and K-formula exclusion. This approval
does not authorize final taxonomy publication or candidate freeze until the
remaining Decision Register gates are resolved. P-06 below now authorizes
code-group meaning backfill with the `ITEM-0139` safeguard. P-07 resolves the
workbook-only Stamped Concrete row as a typo shadow of Production `ITEM-0491`,
so it does not authorize importing workbook wording or creating a new item.

**P-06 owner decision recorded:** 2026-07-04 — approve the 22 `AAA` and 65
`AAA-TTT` group meanings for code-group dictionary backfill and implementation.
This is not an import approval, row-count approval, workbook-only approval,
K-mapping approval, or P-07 wording correction. The revised main codes
`DRL→COR`, `FND→PAD`, and `FTP→FTW` are approved because the final workbook
uses `COR`/`PAD`/`FTW` and their meanings are clearer. `CRS-H06`/`CRS-H08`
remain approved by P-03 and `CIC-H06` by P-04.

`ITEM-0139` is an approved temporary legacy-code exception for `2568.1.0` only.
It must preserve Production name, unit, prices, identity, BOQ history, and
legacy code under P-02/P-04/P-06. Implementation must not assign a canonical
code for it by inference. If DB or publish validation cannot enforce this
exception with auditable evidence and an assertion that no other active
structured-version row has `code_group_id is null`, the rollout must stop and
return to the owner for a new decision.

## 1. How to read the code

```text
AAA-TTT-###
│   │   └── Stable sequence within the approved AAA-TTT group
│   └────── Item/material/work subtype interpreted inside AAA
└────────── Work context or primary work family
```

The code is a human-readable business key. Database identity is a UUID. The
application stores `AAA` and `TTT` group metadata explicitly and does not parse
the string for pricing or calculation.

## 2. Governance rules

1. Codes use uppercase ASCII alphanumeric segments and match
   `^[A-Z0-9]{3}-[A-Z0-9]{3}-[0-9]{3}$`.
2. `TTT` is meaningful only inside its `AAA` context.
3. A code is allocated to one stable identity and is never reassigned.
4. Retired sequences remain reserved; gaps are not refilled.
5. The next code uses the next never-issued sequence in the approved group.
6. At sequence 900, stop automatic allocation and request an owner-approved
   capacity decision. Existing codes are never renumbered.
7. Reordering the UI/export does not change codes; use `display_order`.
8. Legacy `ITEM-####` remains registered for traceability.
9. A draft code may be corrected before publication. After publication, a
   recode requires a new version and audit record.
10. K-formula fields are outside this dictionary and Phase 4 Core.

## 3. Review meaning

- `รออนุมัติ` means extracted faithfully from the candidate workbook but not
  yet approved for database publication.
- `อนุมัติตาม P-06` means the group meaning is approved for code-group
  dictionary/backfill, subject to row-level decisions and publish gates.
- `ต้องทบทวน` is a blocker requiring correction or explicit rejection.
- Candidate row counts describe the workbook, not the final 710-row Production
  catalog.

## 4. Candidate AAA dictionary (22 groups)

| AAA | ชื่อภาษาไทย | English name | Workbook note | Review status |
|---|---|---|---|---|
| CIC | งานวางท่อร้อยสายสื่อสารใต้ดินหุ้มคอนกรีตเสริมเหล็ก | Conduit in Concrete |  | อนุมัติตาม P-06 |
| CIS | งานวางท่อร้อยสายสื่อสารใต้ดินกลบทราย | Conduit in Sand |  | อนุมัติตาม P-06 |
| CRS | งานวางท่อข้ามคลอง / Crossing | Crossing |  | อนุมัติตาม P-06 |
| HDD | งานดันท่อลอด / HDD / Jacking | Horizontal Directional Drilling / Jacking |  | อนุมัติตาม P-06 |
| JNT | งานสร้างจุดเชื่อมท่อ | Joint |  | อนุมัติตาม P-06 |
| RSR | งานสร้างท่อโค้ง / Riser | Riser |  | อนุมัติตาม P-06 |
| CHB | งานสร้างบ่อพัก | Chamber |  | อนุมัติตาม P-06 |
| MOD | งานดัดแปลงบ่อพัก | Modification |  | อนุมัติตาม P-06 |
| WLL | งานเสริมผนังบ่อพัก | Wall Extension |  | อนุมัติตาม P-06 |
| LVU | งานยกระดับคอบ่อพัก | Level Up |  | อนุมัติตาม P-06 |
| LVD | งานลดระดับคอบ่อพัก | Level Down |  | อนุมัติตาม P-06 |
| RPR | งานปรับปรุงท่อร้อยสาย | Repair |  | อนุมัติตาม P-06 |
| COR | งานเจาะบ่อพัก | Coring / Chamber Drilling | Revised code recommendation | อนุมัติตาม P-06 |
| PAD | งานสร้างฐานรับบ่อพัก/ตู้ | Pad Foundation / Base | Revised code recommendation | อนุมัติตาม P-06 |
| POL | งานปักเสาสื่อสาร | Pole |  | อนุมัติตาม P-06 |
| PIL | งานตอกเสาตอม่อยึดเสา | Pile for Pole |  | อนุมัติตาม P-06 |
| PCD | งานตอกเสาเข็มรับท่อ | Pile for Conduit |  | อนุมัติตาม P-06 |
| PLM | งานตอกเสาเข็มรับบ่อพัก | Pile for Manhole |  | อนุมัติตาม P-06 |
| SUP | งานสร้างเสา Support | Support |  | อนุมัติตาม P-06 |
| DRN | งานรื้อย้ายท่อระบายน้ำ | Drain |  | อนุมัติตาม P-06 |
| FTW | งานซ่อมทางเท้า | Footway | Revised code recommendation | อนุมัติตาม P-06 |
| RDW | งานซ่อมถนน | Roadway |  | อนุมัติตาม P-06 |

## 5. Candidate AAA-TTT dictionary (65 groups)

| AAA-TTT | ชื่อกลุ่มหลัก | ชนิดรายการ | English type | Candidate rows | Example | Review status |
|---|---|---|---|---:|---|---|
| CIC-GIP | งานวางท่อร้อยสายสื่อสารใต้ดินหุ้มคอนกรีตเสริมเหล็ก | GIP | Galvanized Iron / Steel Pipe | 6 | งานวางท่อ 1-Ø3" GIP หุ้ม ค.ส.ล. | อนุมัติตาม P-06 |
| CIC-H06 | งานวางท่อร้อยสายสื่อสารใต้ดินหุ้มคอนกรีตเสริมเหล็ก | HDPE PN6 | HDPE PN6 | 10 | งานวางท่อ 1-Ø110 มม. HDPE PE80 PN6 หุ้ม ค.ส.ล. | อนุมัติสำหรับ Production-only rows ตาม P-04 |
| CIC-H08 | งานวางท่อร้อยสายสื่อสารใต้ดินหุ้มคอนกรีตเสริมเหล็ก | HDPE PN8 | HDPE PN8 | 10 | งานวางท่อ 1-Ø110 มม. HDPE PE80 PN8 หุ้ม ค.ส.ล. | อนุมัติตาม P-06 |
| CIC-H10 | งานวางท่อร้อยสายสื่อสารใต้ดินหุ้มคอนกรีตเสริมเหล็ก | HDPE PN10 | HDPE PN10 | 10 | งานวางท่อ 1-Ø110 มม. HDPE PE80 PN10 หุ้ม ค.ส.ล. | อนุมัติตาม P-06 |
| CIC-PV2 | งานวางท่อร้อยสายสื่อสารใต้ดินหุ้มคอนกรีตเสริมเหล็ก | PVC + PVC | PVC + PVC | 3 | งานวางท่อ 2-Ø3" + 4-Ø4" PVC หุ้ม ค.ส.ล. | อนุมัติตาม P-06 |
| CIC-PVC | งานวางท่อร้อยสายสื่อสารใต้ดินหุ้มคอนกรีตเสริมเหล็ก | PVC | PVC | 12 | งานวางท่อ 1-Ø1½" PVC หุ้ม ค.ส.ล. | อนุมัติตาม P-06 |
| CIS-D02 | งานวางท่อร้อยสายสื่อสารใต้ดินกลบทราย | HDPE 2 ขนาด / Double | HDPE Double / Two-Size | 1 | งานวางท่อ 6-Ø125 มม. + 1-Ø160 มม. HDPE PE80 PN10 กลบทราย | อนุมัติตาม P-06 |
| CIS-GIP | งานวางท่อร้อยสายสื่อสารใต้ดินกลบทราย | GIP | Galvanized Iron / Steel Pipe | 9 | งานวางท่อ 1-Ø3" GIP กลบทราย | อนุมัติตาม P-06 |
| CIS-H06 | งานวางท่อร้อยสายสื่อสารใต้ดินกลบทราย | HDPE PN6 | HDPE PN6 | 12 | งานวางท่อ 1-Ø90 มม. HDPE PE80 PN6 กลบทราย | อนุมัติตาม P-06 |
| CIS-H08 | งานวางท่อร้อยสายสื่อสารใต้ดินกลบทราย | HDPE PN8 | HDPE PN8 | 20 | งานวางท่อ 1-Ø63 มม. HDPE PE80 PN8 กลบทราย | อนุมัติตาม P-06 |
| CIS-H10 | งานวางท่อร้อยสายสื่อสารใต้ดินกลบทราย | HDPE PN10 | HDPE PN10 | 17 | งานวางท่อ 1-Ø63 มม. HDPE PE80 PN10 กลบทราย | อนุมัติตาม P-06 |
| CIS-PV2 | งานวางท่อร้อยสายสื่อสารใต้ดินกลบทราย | PVC + PVC | PVC + PVC | 7 | งานวางท่อ 2-Ø3" + 1-Ø4" PVC กลบทราย | อนุมัติตาม P-06 |
| CIS-PVC | งานวางท่อร้อยสายสื่อสารใต้ดินกลบทราย | PVC | PVC | 31 | งานวางท่อ 1-Ø1½" PVC กลบทราย | อนุมัติตาม P-06 |
| CRS-GIP | งานวางท่อข้ามคลอง / Crossing | GIP | Galvanized Iron / Steel Pipe | 17 | งานวางท่อ 1-Ø3" GIP CROSSING | อนุมัติหลังแยก HDPE ออกจากกลุ่มตาม P-03 |
| CRS-H06 | งานวางท่อข้ามคลอง / Crossing | HDPE PN6 | HDPE PN6 | 8 | งานวางท่อ 1-Ø110 มม. HDPE PE80 PN6 CROSSING | อนุมัติเป็น HDPE subtype ตาม P-03; `CRS-GIP-025` ยัง deferred ตาม P-05 |
| CRS-H08 | งานวางท่อข้ามคลอง / Crossing | HDPE PN8 | HDPE PN8 | 8 | งานวางท่อ 1-Ø110 มม. HDPE PE80 PN8 CROSSING | อนุมัติเป็น HDPE subtype ตาม P-03 |
| HDD-D02 | งานดันท่อลอด / HDD / Jacking | HDPE 2 ขนาด / Double | HDPE Double / Two-Size | 2 | งานดันท่อลอด 2-Ø110 มม.+6-Ø125 มม. HDPE PE80 PN10 (HDD) | อนุมัติตาม P-06 |
| HDD-GJK | งานดันท่อลอด / HDD / Jacking | Pipe Jacking (GIP) | GIP Pipe Jacking | 7 | งานดันท่อลอด 2-Ø3" GIP | อนุมัติตาม P-06 |
| HDD-H06 | งานดันท่อลอด / HDD / Jacking | HDPE PN6 | HDPE PN6 | 3 | งานดันท่อลอด 1-Ø63 มม. HDPE PE80 PN6 (HDD) | อนุมัติตาม P-06 |
| HDD-H08 | งานดันท่อลอด / HDD / Jacking | HDPE PN8 | HDPE PN8 | 24 | งานดันท่อลอด 1-Ø110 มม. HDPE PE80 PN8 (HDD) | อนุมัติตาม P-06 |
| HDD-H10 | งานดันท่อลอด / HDD / Jacking | HDPE PN10 | HDPE PN10 | 27 | งานดันท่อลอด 1-Ø110 มม. HDPE PE80 PN10 (HDD) | อนุมัติตาม P-06 |
| HDD-PJK | งานดันท่อลอด / HDD / Jacking | Pipe Jacking (Steel Casing) | Steel Casing Pipe Jacking | 3 | งานดันท่อปลอกเหล็กขนาด Ø800 มม.x 9 มม. | อนุมัติตาม P-06 |
| JNT-PVC | งานสร้างจุดเชื่อมท่อ | PVC | PVC | 13 | งานสร้างจุดเชื่อมท่อ 2-Ø3" PVC หุ้ม ค.ส.ล. (0.29x0.44x1.00 ม.) | อนุมัติตาม P-06; เพิ่ม `JNT-PVC-013` ตาม P-04 |
| RSR-CB0 | งานสร้างท่อโค้ง / Riser | Riser ขึ้นตู้ผ่าน | Cabinet Riser | 4 | งานสร้างท่อโค้ง 2-Ø110 มม. HDPE PE80 PN8 ขึ้นตู้ผ่าน ตามแบบมาตรฐานเลขที่ 152 | อนุมัติตาม P-06 |
| RSR-DT3 | งานสร้างท่อโค้ง / Riser | Riser แยก Distribution | Distribution Branch | 7 | งานสร้างท่อแยก Distribution 3 Way Y Ø4" Reduce Ø2" | อนุมัติตาม P-06 |
| RSR-PL0 | งานสร้างท่อโค้ง / Riser | Riser ขึ้นเสา | Pole Riser | 46 | งานสร้างท่อโค้ง 1-Ø2" GIP ขึ้นเสา ตามแบบมาตรฐานเลขที่ 152 | อนุมัติตาม P-06; เพิ่ม `RSR-PL0-040` ถึง `046` ตาม P-04 |
| RSR-SVC | งานสร้างท่อโค้ง / Riser | Riser Service | Service Riser | 3 | งานสร้างท่อโค้ง RISER SERVICE 1-Ø1½" PVC 0.25 ม. | อนุมัติตาม P-06 |
| RSR-TB0 | งานสร้างท่อโค้ง / Riser | Riser ขึ้นตู้สาธารณะ/Terminal Box | Terminal Box Riser | 6 | งานสร้างท่อโค้งขึ้นตู้สาธารณะ Riser Steel Pole Type A 1-Ø2" (2.50 m) To Terminal Box | อนุมัติตาม P-06 |
| RSR-WL0 | งานสร้างท่อโค้ง / Riser | Riser ขึ้นผนัง | Wall Riser | 11 | งานสร้างท่อโค้ง 1-Ø2" GIP ขึ้นผนัง ตามแบบมาตรฐานเลขที่ 152 | อนุมัติตาม P-06 |
| CHB-HH0 | งานสร้างบ่อพัก | Handhole | Handhole | 2 | งานสร้างบ่อพักย่อย HandHole (HH-01) ขนาด 1.00x1.72x1.65 ม. ฝาค.ส.ล.กลม | อนุมัติตาม P-06 |
| CHB-MH0 | งานสร้างบ่อพัก | Manhole | Manhole | 33 | งานสร้างบ่อพัก (MH) TYPE A-1 ฝาค.ส.ล. ตามแบบมาตรฐานเลขที่ 104 | อนุมัติตาม P-06 |
| CHB-PB0 | งานสร้างบ่อพัก | Pull Box | Pull Box | 12 | งานสร้างบ่อพักย่อย (PB) JUF-6 ฝาค.ส.ล. 1 ฝา | อนุมัติตาม P-06 |
| MOD-FMH | งานดัดแปลงบ่อพัก | เปลี่ยนฝา/เฟรม MH | MH Cover/Frame Replacement | 3 | งานเปลี่ยนฝาบ่อพัก (MH) ฝาค.ส.ล. | อนุมัติตาม P-06 |
| MOD-FPB | งานดัดแปลงบ่อพัก | เปลี่ยนฝา/เฟรม PB | PB Cover/Frame Replacement | 7 | งานเปลี่ยนฝาบ่อพักย่อย (PB) ฝาค.ส.ล. | อนุมัติตาม P-06 |
| MOD-MH0 | งานดัดแปลงบ่อพัก | Manhole | Manhole | 9 | งาน M. บ่อพัก (MH) TYPE A-1 ฝาเหล็กขยายออก 0.80 ม. (ไม่เปลี่ยนเฟรม - ไม่เปลี่ยนฝา) | อนุมัติตาม P-06 |
| MOD-PB0 | งานดัดแปลงบ่อพัก | Pull Box | Pull Box | 6 | งาน M. บ่อพักย่อย (PB) JUF-6 ฝาค.ส.ล. 1 ฝา เป็น 3 ฝา | อนุมัติตาม P-06 |
| WLL-MH0 | งานเสริมผนังบ่อพัก | Manhole | Manhole | 9 | งานเสริมผนังบ่อพัก (MH) TYPE A-1 ฝาเหล็ก (เพิ่มหน้าต่างเป็น 2-Ø4") (เปลี่ยนเฟรม - เปลี่ยนฝาเหล็ก) | อนุมัติตาม P-06 |
| WLL-PB0 | งานเสริมผนังบ่อพัก | Pull Box | Pull Box | 25 | งานเสริมผนังบ่อพัก (PB) JUF-6 (เปลี่ยนเฟรม - ไม่เปลี่ยนฝา) | อนุมัติตาม P-06 |
| LVU-MH0 | งานยกระดับคอบ่อพัก | Manhole | Manhole | 56 | งานยกระดับคอบ่อพัก (MH) A-1 (ไม่เปลี่ยนฝา - ไม่เปลี่ยนเฟรม) 1 ฝา ระดับ +0.05 ม. | อนุมัติตาม P-06 |
| LVU-PB0 | งานยกระดับคอบ่อพัก | Pull Box | Pull Box | 120 | งานยกระดับคอบ่อพักย่อย (PB) JUF-11 ฝาค.ส.ล. (ไม่เปลี่ยนฝา - ไม่เปลี่ยนเฟรม) ระดับ +0.05 ม. | อนุมัติตาม P-06 |
| LVD-MH0 | งานลดระดับคอบ่อพัก | Manhole | Manhole | 8 | งานลดระดับคอบ่อพัก (MH (ไม่เปลี่ยนเฟรม - ไม่เปลี่ยนฝาเหล็ก) 1 ฝา | อนุมัติตาม P-06 |
| RPR-BRK | งานปรับปรุงท่อร้อยสาย | ทุบค.ส.ล.หุ้มท่อ | Break Concrete Encasement | 2 | งานทุบค.ส.ล.หุ้มท่อ 12-Ø4" PVC (พร้อมขนเศษวัสดุทิ้ง) | อนุมัติตาม P-06 |
| RPR-CUT | งานปรับปรุงท่อร้อยสาย | ตัดท่อเดิม | Cut Existing Conduit | 5 | งานตัดท่อเดิมในบ่อพัก 12-Ø4" PVC (มีเคเบิลในท่อ) | อนุมัติตาม P-06 |
| RPR-REM | งานปรับปรุงท่อร้อยสาย | รื้อท่อเดิม | Remove Existing Conduit | 1 | งานรื้อท่อเดิม 12-Ø4" GIP ข้ามคลอง พร้อมเหล็กรัดท่อ | อนุมัติตาม P-06 |
| COR-MH0 | งานเจาะบ่อพัก | Manhole | Manhole | 2 | งานเจาะหน้าต่างบ่อพัก (MH) | อนุมัติตาม P-06 |
| COR-PB0 | งานเจาะบ่อพัก | Pull Box | Pull Box | 2 | งานเจาะหน้าต่างบ่อพักย่อย (PB) | อนุมัติตาม P-06 |
| PAD-CAB | งานสร้างฐานรับบ่อพัก/ตู้ | ฐานรับ Cabinet | Cabinet Base | 6 | งานสร้างฐานรับตู้ผ่าน (แบบในร่องน้ำ) | อนุมัติตาม P-06 |
| PAD-PB0 | งานสร้างฐานรับบ่อพัก/ตู้ | Pull Box | Pull Box | 3 | งานสร้างฐานรับบ่อพักย่อย (PB) JUF-11 (แบบในร่องน้ำ) | อนุมัติตาม P-06 |
| POL-RCC | งานปักเสาสื่อสาร | คอนกรีตเสริมเหล็ก | Reinforced Concrete | 3 | งานปักเสาสื่อสารคอนกรีตเสริมเหล็กขนาด 8.00 ม. | อนุมัติตาม P-06 |
| POL-STL | งานปักเสาสื่อสาร | Steel | Steel | 5 | เสา STEEL POLE ขนาด Ø3" ยาว 2.00 ม. | อนุมัติตาม P-06 |
| PIL-STD | งานตอกเสาตอม่อยึดเสา | มาตรฐาน | Standard | 15 | เสา คอร.ขนาด 0.25x0.25x3.50 ม. | อนุมัติตาม P-06 |
| PCD-STD | งานตอกเสาเข็มรับท่อ | มาตรฐาน | Standard | 1 | งานตอกเสาเข็ม Section T 10x12 ซม. x 3.00 ม. รับท่อ ตามแบบมาตรฐานเลขที่ 140 | อนุมัติตาม P-06 |
| PLM-STD | งานตอกเสาเข็มรับบ่อพัก | มาตรฐาน | Standard | 1 | งานตอกเสาเข็ม Section T 10x12 ซม. x 3.00 ม. รับบ่อพัก ตามแบบมาตรฐานเลขที่ 141 | อนุมัติตาม P-06 |
| SUP-142 | งานสร้างเสา Support | แบบมาตรฐาน 142 | Std. Drawing 142 | 6 | เสา Support ขนาด 0.20x0.20x5.00 ม. ตามแบบมาตรฐานเลขที่ 142 | อนุมัติตาม P-06 |
| SUP-154 | งานสร้างเสา Support | แบบมาตรฐาน 154 | Std. Drawing 154 | 6 | เสา Support ขนาด 0.25x0.25x6.00 ม. ตามแบบมาตรฐานเลขที่ 154 | อนุมัติตาม P-06 |
| DRN-STD | งานรื้อย้ายท่อระบายน้ำ | มาตรฐาน | Standard | 3 | งานรื้อย้ายท่อระบายน้ำขนาด Ø0.30 ม.x1.00 ม. | อนุมัติตาม P-06 |
| FTW-ASP | งานซ่อมทางเท้า | แอสฟัลต์ | Asphalt | 1 | งานซ่อมทางเท้าเทแอสฟัลต์หนา 0.04 ม. | อนุมัติตาม P-06 |
| FTW-BLK | งานซ่อมทางเท้า | บล็อก/อินเตอร์ล็อค | Block / Interlock | 3 | งานซ่อมทางเท้าปูอิฐอินเตอร์ล็อค (แบบธรรมดา) ตามแบบมาตรฐานเลขที่ ฟ. 1304 | อนุมัติตาม P-06 |
| FTW-CON | งานซ่อมทางเท้า | คอนกรีต | Concrete | 2 | งานซ่อมทางเท้าเทคอนกรีตหนา 0.06 ม. ตีเส้น | อนุมัติตาม P-06; `FTW-CON-002` ใช้ Production wording ตาม P-04/P-07 และ reject workbook typo |
| FTW-CUR | งานซ่อมทางเท้า | คันหิน/ราง | Curb / Gutter | 3 | งานซ่อมคันหิน ตามแบบมาตรฐานเลขที่ ถ. 620/29 | อนุมัติตาม P-06 |
| FTW-SLB | งานซ่อมทางเท้า | แผ่น/กระเบื้อง/หิน | Slab / Tile / Granite | 7 | งานซ่อมทางเท้าปูกระเบื้อง CERAMIC ขนาด 0.30 x 0.30 ม. | อนุมัติตาม P-06 |
| RDW-AC0 | งานซ่อมถนน | ถนนแอสฟัลต์ | Asphalt Pavement | 8 | งานซ่อมถนนแอสฟัลต์ชั่วคราว | อนุมัติตาม P-06 |
| RDW-GRV | งานซ่อมถนน | หินคลุก | Gravel / Crushed Rock | 1 | งานซ่อมถนนหินคลุกบดอัดแน่น หนา 0.20 ม. | อนุมัติตาม P-06 |
| RDW-RC0 | งานซ่อมถนน | ถนนคอนกรีตเสริมเหล็ก | Reinforced Concrete Pavement | 12 | งานซ่อมถนนคอนกรีตเสริมเหล็กหนา 0.06 ม. | อนุมัติตาม P-06 |
| RDW-THM | งานซ่อมถนน | Thermoplastic | Thermoplastic Marking | 1 | งานทาสี THERMO PLASTIC | อนุมัติตาม P-06 |

## 6. Blocking review items

1. Resolved by P-03: split the 16 HDPE Crossing candidates out of `CRS-GIP`
   into approved HDPE subtypes `CRS-H06` and `CRS-H08`; do not merely change K
   mapping.
2. Resolved by P-04: retain all 20 Production-only rows; assign canonical
   codes to 19 rows and keep `ITEM-0139` as temporary legacy code for this
   version.
3. Resolved by P-05/P-07: keep the raw 18 workbook-only evidence rows, but treat
   workbook `FTW-CON-002` as a typo shadow of Production `ITEM-0491`, leaving 17
   unresolved supplement candidates deferred from `2568.1.0`. They require item
   authority, price authority, corrected taxonomy/code allocation,
   owner/data-custodian approval, import preview/reconciliation, and
   dataset-hash/publish verification before any future publication.
4. Resolved by P-02: retain both `ITEM-0131` / `ITEM-0139` identities in
   `2568.1.0`; `ITEM-0139` is only a future retirement candidate after live
   evidence and owner/data-custodian confirmation. Never merge UUID/history.
5. Resolved by P-06: approve `DRL→COR`, `FND→PAD`, and `FTP→FTW` revised main
   codes for code-group dictionary/backfill.
6. Resolved by P-07: use Production `ITEM-0491` wording for canonical
   `FTW-CON-002`; reject the workbook repeated-phrase row as a typo shadow. P-07
   does not authorize importing workbook wording, creating a duplicate item, or
   cleaning Production whitespace without a separate wording correction.

## 7. Approval record

| Role | Name | Decision | Timestamp | Notes |
|---|---|---|---|---|
| Catalog owner |  | Pending |  |  |
| Engineering/domain reviewer |  | Pending |  |  |
| Data steward |  | Pending |  |  |

Approval applies to a fingerprinted version of this document and the row-level
reconciliation artifact. Editing the dictionary after approval requires a new
review record.
