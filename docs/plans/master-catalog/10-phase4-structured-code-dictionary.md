# Master Catalog Phase 4 Structured-Code Dictionary

**Status:** Candidate dictionary for owner/taxonomy review
**Prepared:** 2026-06-22
**Source workbook:** `files/NT_Item_Code_Master_K_Mapping_2568.xlsx`
**Scope:** Business code `AAA-TTT-###`; not K-formula approval

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
- `ต้องทบทวน` is a blocker requiring correction or explicit rejection.
- Candidate row counts describe the workbook, not the final 710-row Production
  catalog.

## 4. Candidate AAA dictionary (22 groups)

| AAA | ชื่อภาษาไทย | English name | Workbook note | Review status |
|---|---|---|---|---|
| CIC | งานวางท่อร้อยสายสื่อสารใต้ดินหุ้มคอนกรีตเสริมเหล็ก | Conduit in Concrete |  | รออนุมัติ |
| CIS | งานวางท่อร้อยสายสื่อสารใต้ดินกลบทราย | Conduit in Sand |  | รออนุมัติ |
| CRS | งานวางท่อข้ามคลอง / Crossing | Crossing |  | รออนุมัติ |
| HDD | งานดันท่อลอด / HDD / Jacking | Horizontal Directional Drilling / Jacking |  | รออนุมัติ |
| JNT | งานสร้างจุดเชื่อมท่อ | Joint |  | รออนุมัติ |
| RSR | งานสร้างท่อโค้ง / Riser | Riser |  | รออนุมัติ |
| CHB | งานสร้างบ่อพัก | Chamber |  | รออนุมัติ |
| MOD | งานดัดแปลงบ่อพัก | Modification |  | รออนุมัติ |
| WLL | งานเสริมผนังบ่อพัก | Wall Extension |  | รออนุมัติ |
| LVU | งานยกระดับคอบ่อพัก | Level Up |  | รออนุมัติ |
| LVD | งานลดระดับคอบ่อพัก | Level Down |  | รออนุมัติ |
| RPR | งานปรับปรุงท่อร้อยสาย | Repair |  | รออนุมัติ |
| COR | งานเจาะบ่อพัก | Coring / Chamber Drilling | Revised code recommendation | รออนุมัติ |
| PAD | งานสร้างฐานรับบ่อพัก/ตู้ | Pad Foundation / Base | Revised code recommendation | รออนุมัติ |
| POL | งานปักเสาสื่อสาร | Pole |  | รออนุมัติ |
| PIL | งานตอกเสาตอม่อยึดเสา | Pile for Pole |  | รออนุมัติ |
| PCD | งานตอกเสาเข็มรับท่อ | Pile for Conduit |  | รออนุมัติ |
| PLM | งานตอกเสาเข็มรับบ่อพัก | Pile for Manhole |  | รออนุมัติ |
| SUP | งานสร้างเสา Support | Support |  | รออนุมัติ |
| DRN | งานรื้อย้ายท่อระบายน้ำ | Drain |  | รออนุมัติ |
| FTW | งานซ่อมทางเท้า | Footway | Revised code recommendation | รออนุมัติ |
| RDW | งานซ่อมถนน | Roadway |  | รออนุมัติ |

## 5. Candidate AAA-TTT dictionary (62 groups)

| AAA-TTT | ชื่อกลุ่มหลัก | ชนิดรายการ | English type | Candidate rows | Example | Review status |
|---|---|---|---|---:|---|---|
| CIC-GIP | งานวางท่อร้อยสายสื่อสารใต้ดินหุ้มคอนกรีตเสริมเหล็ก | GIP | Galvanized Iron / Steel Pipe | 6 | งานวางท่อ 1-Ø3" GIP หุ้ม ค.ส.ล. | รออนุมัติ |
| CIC-H08 | งานวางท่อร้อยสายสื่อสารใต้ดินหุ้มคอนกรีตเสริมเหล็ก | HDPE PN8 | HDPE PN8 | 10 | งานวางท่อ 1-Ø110 มม. HDPE PE80 PN8 หุ้ม ค.ส.ล. | รออนุมัติ |
| CIC-H10 | งานวางท่อร้อยสายสื่อสารใต้ดินหุ้มคอนกรีตเสริมเหล็ก | HDPE PN10 | HDPE PN10 | 10 | งานวางท่อ 1-Ø110 มม. HDPE PE80 PN10 หุ้ม ค.ส.ล. | รออนุมัติ |
| CIC-PV2 | งานวางท่อร้อยสายสื่อสารใต้ดินหุ้มคอนกรีตเสริมเหล็ก | PVC + PVC | PVC + PVC | 3 | งานวางท่อ 2-Ø3" + 4-Ø4" PVC หุ้ม ค.ส.ล. | รออนุมัติ |
| CIC-PVC | งานวางท่อร้อยสายสื่อสารใต้ดินหุ้มคอนกรีตเสริมเหล็ก | PVC | PVC | 12 | งานวางท่อ 1-Ø1½" PVC หุ้ม ค.ส.ล. | รออนุมัติ |
| CIS-D02 | งานวางท่อร้อยสายสื่อสารใต้ดินกลบทราย | HDPE 2 ขนาด / Double | HDPE Double / Two-Size | 1 | งานวางท่อ 6-Ø125 มม. + 1-Ø160 มม. HDPE PE80 PN10 กลบทราย | รออนุมัติ |
| CIS-GIP | งานวางท่อร้อยสายสื่อสารใต้ดินกลบทราย | GIP | Galvanized Iron / Steel Pipe | 9 | งานวางท่อ 1-Ø3" GIP กลบทราย | รออนุมัติ |
| CIS-H06 | งานวางท่อร้อยสายสื่อสารใต้ดินกลบทราย | HDPE PN6 | HDPE PN6 | 12 | งานวางท่อ 1-Ø90 มม. HDPE PE80 PN6 กลบทราย | รออนุมัติ |
| CIS-H08 | งานวางท่อร้อยสายสื่อสารใต้ดินกลบทราย | HDPE PN8 | HDPE PN8 | 20 | งานวางท่อ 1-Ø63 มม. HDPE PE80 PN8 กลบทราย | รออนุมัติ |
| CIS-H10 | งานวางท่อร้อยสายสื่อสารใต้ดินกลบทราย | HDPE PN10 | HDPE PN10 | 17 | งานวางท่อ 1-Ø63 มม. HDPE PE80 PN10 กลบทราย | รออนุมัติ |
| CIS-PV2 | งานวางท่อร้อยสายสื่อสารใต้ดินกลบทราย | PVC + PVC | PVC + PVC | 7 | งานวางท่อ 2-Ø3" + 1-Ø4" PVC กลบทราย | รออนุมัติ |
| CIS-PVC | งานวางท่อร้อยสายสื่อสารใต้ดินกลบทราย | PVC | PVC | 31 | งานวางท่อ 1-Ø1½" PVC กลบทราย | รออนุมัติ |
| CRS-GIP | งานวางท่อข้ามคลอง / Crossing | GIP | Galvanized Iron / Steel Pipe | 33 | งานวางท่อ 1-Ø3" GIP CROSSING | ต้องทบทวน: มี HDPE 16 แถวปะปน |
| HDD-D02 | งานดันท่อลอด / HDD / Jacking | HDPE 2 ขนาด / Double | HDPE Double / Two-Size | 2 | งานดันท่อลอด 2-Ø110 มม.+6-Ø125 มม. HDPE PE80 PN10 (HDD) | รออนุมัติ |
| HDD-GJK | งานดันท่อลอด / HDD / Jacking | Pipe Jacking (GIP) | GIP Pipe Jacking | 7 | งานดันท่อลอด 2-Ø3" GIP | รออนุมัติ |
| HDD-H06 | งานดันท่อลอด / HDD / Jacking | HDPE PN6 | HDPE PN6 | 3 | งานดันท่อลอด 1-Ø63 มม. HDPE PE80 PN6 (HDD) | รออนุมัติ |
| HDD-H08 | งานดันท่อลอด / HDD / Jacking | HDPE PN8 | HDPE PN8 | 24 | งานดันท่อลอด 1-Ø110 มม. HDPE PE80 PN8 (HDD) | รออนุมัติ |
| HDD-H10 | งานดันท่อลอด / HDD / Jacking | HDPE PN10 | HDPE PN10 | 27 | งานดันท่อลอด 1-Ø110 มม. HDPE PE80 PN10 (HDD) | รออนุมัติ |
| HDD-PJK | งานดันท่อลอด / HDD / Jacking | Pipe Jacking (Steel Casing) | Steel Casing Pipe Jacking | 3 | งานดันท่อปลอกเหล็กขนาด Ø800 มม.x 9 มม. | รออนุมัติ |
| JNT-PVC | งานสร้างจุดเชื่อมท่อ | PVC | PVC | 12 | งานสร้างจุดเชื่อมท่อ 2-Ø3" PVC หุ้ม ค.ส.ล. (0.29x0.44x1.00 ม.) | รออนุมัติ |
| RSR-CB0 | งานสร้างท่อโค้ง / Riser | Riser ขึ้นตู้ผ่าน | Cabinet Riser | 4 | งานสร้างท่อโค้ง 2-Ø110 มม. HDPE PE80 PN8 ขึ้นตู้ผ่าน ตามแบบมาตรฐานเลขที่ 152 | รออนุมัติ |
| RSR-DT3 | งานสร้างท่อโค้ง / Riser | Riser แยก Distribution | Distribution Branch | 7 | งานสร้างท่อแยก Distribution 3 Way Y Ø4" Reduce Ø2" | รออนุมัติ |
| RSR-PL0 | งานสร้างท่อโค้ง / Riser | Riser ขึ้นเสา | Pole Riser | 39 | งานสร้างท่อโค้ง 1-Ø2" GIP ขึ้นเสา ตามแบบมาตรฐานเลขที่ 152 | รออนุมัติ |
| RSR-SVC | งานสร้างท่อโค้ง / Riser | Riser Service | Service Riser | 3 | งานสร้างท่อโค้ง RISER SERVICE 1-Ø1½" PVC 0.25 ม. | รออนุมัติ |
| RSR-TB0 | งานสร้างท่อโค้ง / Riser | Riser ขึ้นตู้สาธารณะ/Terminal Box | Terminal Box Riser | 6 | งานสร้างท่อโค้งขึ้นตู้สาธารณะ Riser Steel Pole Type A 1-Ø2" (2.50 m) To Terminal Box | รออนุมัติ |
| RSR-WL0 | งานสร้างท่อโค้ง / Riser | Riser ขึ้นผนัง | Wall Riser | 11 | งานสร้างท่อโค้ง 1-Ø2" GIP ขึ้นผนัง ตามแบบมาตรฐานเลขที่ 152 | รออนุมัติ |
| CHB-HH0 | งานสร้างบ่อพัก | Handhole | Handhole | 2 | งานสร้างบ่อพักย่อย HandHole (HH-01) ขนาด 1.00x1.72x1.65 ม. ฝาค.ส.ล.กลม | รออนุมัติ |
| CHB-MH0 | งานสร้างบ่อพัก | Manhole | Manhole | 33 | งานสร้างบ่อพัก (MH) TYPE A-1 ฝาค.ส.ล. ตามแบบมาตรฐานเลขที่ 104 | รออนุมัติ |
| CHB-PB0 | งานสร้างบ่อพัก | Pull Box | Pull Box | 12 | งานสร้างบ่อพักย่อย (PB) JUF-6 ฝาค.ส.ล. 1 ฝา | รออนุมัติ |
| MOD-FMH | งานดัดแปลงบ่อพัก | เปลี่ยนฝา/เฟรม MH | MH Cover/Frame Replacement | 3 | งานเปลี่ยนฝาบ่อพัก (MH) ฝาค.ส.ล. | รออนุมัติ |
| MOD-FPB | งานดัดแปลงบ่อพัก | เปลี่ยนฝา/เฟรม PB | PB Cover/Frame Replacement | 7 | งานเปลี่ยนฝาบ่อพักย่อย (PB) ฝาค.ส.ล. | รออนุมัติ |
| MOD-MH0 | งานดัดแปลงบ่อพัก | Manhole | Manhole | 9 | งาน M. บ่อพัก (MH) TYPE A-1 ฝาเหล็กขยายออก 0.80 ม. (ไม่เปลี่ยนเฟรม - ไม่เปลี่ยนฝา) | รออนุมัติ |
| MOD-PB0 | งานดัดแปลงบ่อพัก | Pull Box | Pull Box | 6 | งาน M. บ่อพักย่อย (PB) JUF-6 ฝาค.ส.ล. 1 ฝา เป็น 3 ฝา | รออนุมัติ |
| WLL-MH0 | งานเสริมผนังบ่อพัก | Manhole | Manhole | 9 | งานเสริมผนังบ่อพัก (MH) TYPE A-1 ฝาเหล็ก (เพิ่มหน้าต่างเป็น 2-Ø4") (เปลี่ยนเฟรม - เปลี่ยนฝาเหล็ก) | รออนุมัติ |
| WLL-PB0 | งานเสริมผนังบ่อพัก | Pull Box | Pull Box | 25 | งานเสริมผนังบ่อพัก (PB) JUF-6 (เปลี่ยนเฟรม - ไม่เปลี่ยนฝา) | รออนุมัติ |
| LVU-MH0 | งานยกระดับคอบ่อพัก | Manhole | Manhole | 56 | งานยกระดับคอบ่อพัก (MH) A-1 (ไม่เปลี่ยนฝา - ไม่เปลี่ยนเฟรม) 1 ฝา ระดับ +0.05 ม. | รออนุมัติ |
| LVU-PB0 | งานยกระดับคอบ่อพัก | Pull Box | Pull Box | 120 | งานยกระดับคอบ่อพักย่อย (PB) JUF-11 ฝาค.ส.ล. (ไม่เปลี่ยนฝา - ไม่เปลี่ยนเฟรม) ระดับ +0.05 ม. | รออนุมัติ |
| LVD-MH0 | งานลดระดับคอบ่อพัก | Manhole | Manhole | 8 | งานลดระดับคอบ่อพัก (MH (ไม่เปลี่ยนเฟรม - ไม่เปลี่ยนฝาเหล็ก) 1 ฝา | รออนุมัติ |
| RPR-BRK | งานปรับปรุงท่อร้อยสาย | ทุบค.ส.ล.หุ้มท่อ | Break Concrete Encasement | 2 | งานทุบค.ส.ล.หุ้มท่อ 12-Ø4" PVC (พร้อมขนเศษวัสดุทิ้ง) | รออนุมัติ |
| RPR-CUT | งานปรับปรุงท่อร้อยสาย | ตัดท่อเดิม | Cut Existing Conduit | 5 | งานตัดท่อเดิมในบ่อพัก 12-Ø4" PVC (มีเคเบิลในท่อ) | รออนุมัติ |
| RPR-REM | งานปรับปรุงท่อร้อยสาย | รื้อท่อเดิม | Remove Existing Conduit | 1 | งานรื้อท่อเดิม 12-Ø4" GIP ข้ามคลอง พร้อมเหล็กรัดท่อ | รออนุมัติ |
| COR-MH0 | งานเจาะบ่อพัก | Manhole | Manhole | 2 | งานเจาะหน้าต่างบ่อพัก (MH) | รออนุมัติ |
| COR-PB0 | งานเจาะบ่อพัก | Pull Box | Pull Box | 2 | งานเจาะหน้าต่างบ่อพักย่อย (PB) | รออนุมัติ |
| PAD-CAB | งานสร้างฐานรับบ่อพัก/ตู้ | ฐานรับ Cabinet | Cabinet Base | 6 | งานสร้างฐานรับตู้ผ่าน (แบบในร่องน้ำ) | รออนุมัติ |
| PAD-PB0 | งานสร้างฐานรับบ่อพัก/ตู้ | Pull Box | Pull Box | 3 | งานสร้างฐานรับบ่อพักย่อย (PB) JUF-11 (แบบในร่องน้ำ) | รออนุมัติ |
| POL-RCC | งานปักเสาสื่อสาร | คอนกรีตเสริมเหล็ก | Reinforced Concrete | 3 | งานปักเสาสื่อสารคอนกรีตเสริมเหล็กขนาด 8.00 ม. | รออนุมัติ |
| POL-STL | งานปักเสาสื่อสาร | Steel | Steel | 5 | เสา STEEL POLE ขนาด Ø3" ยาว 2.00 ม. | รออนุมัติ |
| PIL-STD | งานตอกเสาตอม่อยึดเสา | มาตรฐาน | Standard | 15 | เสา คอร.ขนาด 0.25x0.25x3.50 ม. | รออนุมัติ |
| PCD-STD | งานตอกเสาเข็มรับท่อ | มาตรฐาน | Standard | 1 | งานตอกเสาเข็ม Section T 10x12 ซม. x 3.00 ม. รับท่อ ตามแบบมาตรฐานเลขที่ 140 | รออนุมัติ |
| PLM-STD | งานตอกเสาเข็มรับบ่อพัก | มาตรฐาน | Standard | 1 | งานตอกเสาเข็ม Section T 10x12 ซม. x 3.00 ม. รับบ่อพัก ตามแบบมาตรฐานเลขที่ 141 | รออนุมัติ |
| SUP-142 | งานสร้างเสา Support | แบบมาตรฐาน 142 | Std. Drawing 142 | 6 | เสา Support ขนาด 0.20x0.20x5.00 ม. ตามแบบมาตรฐานเลขที่ 142 | รออนุมัติ |
| SUP-154 | งานสร้างเสา Support | แบบมาตรฐาน 154 | Std. Drawing 154 | 6 | เสา Support ขนาด 0.25x0.25x6.00 ม. ตามแบบมาตรฐานเลขที่ 154 | รออนุมัติ |
| DRN-STD | งานรื้อย้ายท่อระบายน้ำ | มาตรฐาน | Standard | 3 | งานรื้อย้ายท่อระบายน้ำขนาด Ø0.30 ม.x1.00 ม. | รออนุมัติ |
| FTW-ASP | งานซ่อมทางเท้า | แอสฟัลต์ | Asphalt | 1 | งานซ่อมทางเท้าเทแอสฟัลต์หนา 0.04 ม. | รออนุมัติ |
| FTW-BLK | งานซ่อมทางเท้า | บล็อก/อินเตอร์ล็อค | Block / Interlock | 3 | งานซ่อมทางเท้าปูอิฐอินเตอร์ล็อค (แบบธรรมดา) ตามแบบมาตรฐานเลขที่ ฟ. 1304 | รออนุมัติ |
| FTW-CON | งานซ่อมทางเท้า | คอนกรีต | Concrete | 2 | งานซ่อมทางเท้าเทคอนกรีตหนา 0.06 ม. ตีเส้น | รออนุมัติ |
| FTW-CUR | งานซ่อมทางเท้า | คันหิน/ราง | Curb / Gutter | 3 | งานซ่อมคันหิน ตามแบบมาตรฐานเลขที่ ถ. 620/29 | รออนุมัติ |
| FTW-SLB | งานซ่อมทางเท้า | แผ่น/กระเบื้อง/หิน | Slab / Tile / Granite | 7 | งานซ่อมทางเท้าปูกระเบื้อง CERAMIC ขนาด 0.30 x 0.30 ม. | รออนุมัติ |
| RDW-AC0 | งานซ่อมถนน | ถนนแอสฟัลต์ | Asphalt Pavement | 8 | งานซ่อมถนนแอสฟัลต์ชั่วคราว | รออนุมัติ |
| RDW-GRV | งานซ่อมถนน | หินคลุก | Gravel / Crushed Rock | 1 | งานซ่อมถนนหินคลุกบดอัดแน่น หนา 0.20 ม. | รออนุมัติ |
| RDW-RC0 | งานซ่อมถนน | ถนนคอนกรีตเสริมเหล็ก | Reinforced Concrete Pavement | 12 | งานซ่อมถนนคอนกรีตเสริมเหล็กหนา 0.06 ม. | รออนุมัติ |
| RDW-THM | งานซ่อมถนน | Thermoplastic | Thermoplastic Marking | 1 | งานทาสี THERMO PLASTIC | รออนุมัติ |

## 6. Blocking review items

1. Split the 16 HDPE Crossing candidates out of `CRS-GIP` into an approved
   HDPE subtype; do not merely change K mapping.
2. Decide final canonical codes for 20 Production-only rows.
3. Keep 18 workbook-only rows deferred unless separate price authority exists.
4. Decide whether to retain both `ITEM-0131` / `ITEM-0139` identities or retire
   the erroneous duplicate in the candidate; never merge their UUID/history.
5. Confirm `DRL→COR`, `FND→PAD`, and `FTP→FTW` renaming proposals.
6. Correct or reject the repeated wording associated with `FTW-CON-002`.

## 7. Approval record

| Role | Name | Decision | Timestamp | Notes |
|---|---|---|---|---|
| Catalog owner |  | Pending |  |  |
| Engineering/domain reviewer |  | Pending |  |  |
| Data steward |  | Pending |  |  |

Approval applies to a fingerprinted version of this document and the row-level
reconciliation artifact. Editing the dictionary after approval requires a new
review record.
