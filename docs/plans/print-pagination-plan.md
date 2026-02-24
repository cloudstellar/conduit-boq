# Print Pagination Overflow Fix

แก้ปัญหาเนื้อหาล้นหน้าเมื่อพิมพ์ BOQ ที่มีรายการจำนวนมาก ทำให้เลขหน้าผิด, header/footer หาย, และ layout เสีย ทั้งบนหน้าจอ preview และตอนพิมพ์จริง

## User Review Required

> [!IMPORTANT]
> การเปลี่ยนแปลงนี้จะ **refactor หน้า print ทั้งหมด** (~1039 บรรทัด) — ควรสร้าง git branch ก่อน implement

> [!WARNING]
> **Export PDF** — ใช้ browser native `window.print()` → Save as PDF (ไม่ต้องเพิ่ม library)
> **Export Excel** — `xlsx` มีอยู่ใน `package.json` แล้ว พร้อมใช้งาน

---

## Proposed Changes

### Print Utilities

#### [NEW] [printUtils.ts](file:///Users/cloud/Cloudstellar/conduit-boq/lib/printUtils.ts)

Utility functions สำหรับคำนวณ pagination:

1. **`estimateInfoHeight()`** — ประมาณความสูง info section จากความยาวข้อความ (ชื่อเส้นทาง, ชื่อโครงการ, พื้นที่ก่อสร้าง)
2. **`calculateMaxItemsForPage()`** — คำนวณจำนวนรายการสูงสุดต่อหน้า โดยหักพื้นที่ header/footer ออกจากพื้นที่กระดาษ A4 Landscape
3. **`chunkItems()`** — ตัดรายการเป็น chunk ตามจำนวนสูงสุดที่คำนวณได้
4. **`chunkSummaryRoutes()`** — ตัดเส้นทางในหน้าสรุปเป็น chunk (หน้าสุดท้ายเผื่อที่สำหรับ calc summary + footer)
5. **`countTotalPages()`** — นับจำนวนหน้าทั้งหมดสำหรับ section ปร.4(ก) และ section สรุป

ค่าคงที่ที่ใช้ (mm, based on A4 Landscape):
```
USABLE_HEIGHT = 190mm (210 - 20 margin)
HEADER_HEIGHT = 15mm
TITLE_HEIGHT  = 8mm
UNIT_LABEL    = 5mm
TABLE_HEADER  = 12mm
ROW_HEIGHT    = 6mm (conservative)
FOOTER_HEIGHT = 30mm (เงื่อนไข + ลายเซ็น)
TOTALS_ROW    = 8mm
SAFETY_MARGIN = 10mm
```

---

### Print Page Refactor

#### [MODIFY] [page.tsx](file:///Users/cloud/Cloudstellar/conduit-boq/app/boq/%5Bid%5D/print/page.tsx)

แบ่ง refactor เป็น 4 ส่วน:

##### ส่วน 1: หน้ารายการแต่ละเส้นทาง (Route Detail Pages)
- **เดิม:** 1 `<div className="print-page">` ต่อ 1 route → ล้นถ้ารายการเยอะ
- **ใหม่:** ใช้ `chunkItems()` ตัดรายการ → สร้าง `<div className="print-page">` แต่ละ chunk
- แต่ละหน้ามี: Header (พร้อมเลขหน้าถูกต้อง) + Table Header + Items
- หน้ากลาง: แสดง `"ต่อหน้าถัดไป..."` แทน footer
- หน้าสุดท้ายของ route: แสดง Totals Row + Footer เต็มรูปแบบ

##### ส่วน 2: หน้ารวมทุกเส้นทาง (Consolidated Items Page)
- **เดิม:** 1 หน้า ไม่ว่ารายการรวมจะมีกี่ข้อ
- **ใหม่:** ใช้ `chunkItems()` เช่นกัน ตัดรายการรวมเป็นหลายหน้า
- Logic เลขหน้าต่อเนื่องจาก Route Detail Pages

##### ส่วน 3: หน้าสรุป Factor F / VAT (Summary Page)
- **เดิม:** `หน้าที่ 1/1` เสมอ
- **ใหม่:** ใช้ `chunkSummaryRoutes()` ตัดเส้นทางเป็นหลายหน้า
  - หน้าสุดท้ายมี: แถวรวม + Calc Summary + Thai Amount + Footer
  - หน้าก่อนหน้ามี: แค่ตาราง + `"ต่อหน้าถัดไป..."`
- เลขหน้า: `1/N` ถึง `N/N` (numbering แยกจาก section ปร.4)

##### ส่วน 4: CSS Safety
เพิ่ม CSS rules ใน `@media print`:
```css
tr { page-break-inside: avoid; }
.boq-table td, .summary-table td {
  white-space: nowrap;  /* บังคับ 1 บรรทัดต่อแถว — ข้อความยาวจะถูก split เป็นหลายแถวโดย JS */
  overflow: hidden;
}
```

---

### Extract Reusable Components

เพื่อลดการซ้ำซ้อนของ Header/Footer ที่ต้อง render ซ้ำทุกหน้า จะ extract เป็น sub-components ภายใน `page.tsx`:

| Component | หน้าที่ |
|---|---|
| `PageHeader` | Logo + เลขหน้า + แบบ ปร.4(ก) |
| `InfoSection` | ส่วนงาน, บัญชีราคา, เส้นทาง, โครงการ |
| `BOQTableHeader` | `<thead>` ของตาราง 10 คอลัมน์ |
| `PageFooter` | เงื่อนไข + หมายเหตุ + ลายเซ็น |
| `ContinueIndicator` | `"ต่อหน้าถัดไป..."` สำหรับหน้ากลาง |

> [!NOTE]
> Sub-components อยู่ใน file เดียวกัน (ไม่ export) เพราะใช้เฉพาะหน้า print

#### ตัวอย่าง: หน้ากลาง vs หน้าสุดท้ายของ Route

**หน้ากลาง (มี ContinueIndicator):**
```
┌─────────────────────────────────────────────────────────────────────┐
│ 🏢 NT Logo                                         หน้าที่ 1/4   │
│                                                   แบบ ปร.4 (ก)   │
│ เส้นทาง: สาย A - จ.นครราชสีมา (1/2)                               │
├─────┬────────────────────┬──────┬──────┬──────────────┬────────────┤
│ ที่ │ รายการ             │ ปริมาณ│ หน่วย │ ค่าวัสดุ     │ ค่าแรง    │
├─────┼────────────────────┼──────┼──────┼──────────────┼────────────┤
│  1  │ ท่อ HDPE ขนาด 110 │ 500  │  ม.  │   xxx        │   xxx      │
│  2  │ ท่อ HDPE ขนาด 63  │ 200  │  ม.  │   xxx        │   xxx      │
│ ... │ ...                │ ...  │ ...  │   ...        │   ...      │
│ 15  │ บ่อพักแบบ H4       │  12  │ บ่อ  │   xxx        │   xxx      │
├─────┴────────────────────┴──────┴──────┴──────────────┴────────────┤
│                                                                   │
│                                      ─ ต่อหน้าถัดไป ─            │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

**หน้าสุดท้ายของ Route (มี Totals + Footer):**
```
┌─────────────────────────────────────────────────────────────────────┐
│ 🏢 NT Logo                                         หน้าที่ 2/4   │
│                                                   แบบ ปร.4 (ก)   │
│ เส้นทาง: สาย A - จ.นครราชสีมา (2/2)                               │
├─────┬────────────────────┬──────┬──────┬──────────────┬────────────┤
│ ที่ │ รายการ             │ ปริมาณ│ หน่วย │ ค่าวัสดุ     │ ค่าแรง    │
├─────┼────────────────────┼──────┼──────┼──────────────┼────────────┤
│ 16  │ ข้อต่อแบบ T        │  24  │ ตัว  │   xxx        │   xxx      │
│ ... │ ...                │ ...  │ ...  │   ...        │   ...      │
│ 25  │ งานตัดถนน          │ 300  │ ม.   │   xxx        │   xxx      │
├─────┴────────────────────┴──────┴──────┴──────────────┴────────────┤
│                           ผลรวมค่างานต้นทุน         1,234,567.00  │  ← Totals Row
├───────────────────────────────────────────────────────────────────┤
│ เงื่อนไข Factor F งานก่อสร้างทาง ...                              │
│ หมายเหตุ ทั้งนี้ ราคางานโครงการ ...                                │
│                                           ──────────────────      │
│                                           ผู้ประมาณราคา xxxxxx    │  ← Footer
└───────────────────────────────────────────────────────────────────┘
```

CSS สำหรับ ContinueIndicator:
```css
.continue-indicator {
  text-align: right;
  color: #999;
  font-size: 10pt;
  padding: 8px 10px 0 0;
}
```

---

### การจัดการชื่อเส้นทางยาว (Long Route Names)

> [!IMPORTANT]
> เอกสารราชการ **ห้ามใช้ `...` (ellipsis) ตัดข้อความ** ต้องแสดงข้อมูลครบถ้วน ทุกตารางใช้วิธีเดียวกัน: **ตัดข้อความยาวเป็นหลายแถว ทุกแถวสูงเท่ากัน** แถวต่อมีเฉพาะคอลัมน์ชื่อรายการ ช่องอื่นว่าง

#### กฎแยกตามตาราง:

ใช้วิธีเดียวกันหมดทุกตาราง:

| ตาราง | วิธีจัดการข้อความยาว |
|-------|---------------------|
| **ตารางรายการ (BOQ items)** | ตัดชื่อรายการเป็นหลายแถว สูงเท่ากัน |
| **ตารางรวม (Consolidated)** | ตัดชื่อรายการเป็นหลายแถว สูงเท่ากัน |
| **ตารางสรุป (Summary)** | ตัดชื่อเส้นทางเป็นหลายแถว สูงเท่ากัน |

#### ตัวอย่างตารางสรุป:
```
┌─────┬────────────────────────────┬──────────┬──────────┬──────────┬─────┐
│ ที่ │ รายการ                     │ ค่างาน   │ Factor F │ ก่อน VAT │ ... │
├─────┼────────────────────────────┼──────────┼──────────┼──────────┼─────┤
│  1  │ สาย A - จ.นครราชสีมา -   │ 1,234.00 │ 1.2750   │ 1,573.45 │     │  ← แถวแรก (มีข้อมูล)
│     │ อ.ปากช่อง - ตามแนวทาง    │          │          │          │     │  ← แถวต่อ (ช่องว่าง)
│     │ หลวงหมายเลข 2            │          │          │          │     │  ← แถวต่อ (ช่องว่าง)
│  2  │ สาย B - กรุงเทพฯ            │   987.00 │ 1.2750   │ 1,258.38 │     │  ← ชื่อสั้น 1 แถวพอ
│  3  │ สาย C - จ.ชลบุรี -          │   456.00 │ 1.2750   │   581.40 │     │
│     │ อ.ศรีราชา                   │          │          │          │     │  ← แถวต่อ
└─────┴────────────────────────────┴──────────┴──────────┴──────────┴─────┘
  ทุกแถวสูงเท่ากันหมด ✅
```

#### Implementation:

```typescript
// ตัดชื่อเส้นทางเป็นหลายบรรทัด แต่ละบรรทัดเท่ากัน
function splitRouteName(name: string, maxChars: number): string[] {
  const lines: string[] = [];
  for (let i = 0; i < name.length; i += maxChars) {
    lines.push(name.slice(i, i + maxChars));
  }
  return lines;
}

// Render: แถวแรกมีข้อมูล แถวต่อเป็นช่องว่าง
// นับแถวต่อรวมใน pagination ด้วย
```

ผลต่อ Pagination: นับแถวต่อรวมในจำนวนแถวทั้งหมดต่อหน้า เช่น เส้นทางที่ชื่อยาว 3 บรรทัด = ใช้พื้นที่ 3 แถว ไม่ใช่ 1 แถว

---

### UI/UX ปรับปรุง (Screen Only — ไม่กระทบ Print)

> [!NOTE]
> เปลี่ยนเฉพาะ UI บนจอ (`print:hidden`) ไม่กระทบเอกสารที่พิมพ์ออกมา

#### 1. ปุ่มควบคุม → shadcn/ui `Button` + lucide icons
เดิม: raw `<button>` + inline SVG → ใหม่: shadcn `Button` + `Printer`, `ArrowLeft`, `FileSpreadsheet` icons

#### 2. Loading → shadcn `Skeleton`
เดิม: raw spinner → ใหม่: `Skeleton` component

#### 3. Error → shadcn `Alert`
เดิม: `<p className="text-red-600">` → ใหม่: `Alert` + `AlertCircle` icon

#### 4. Sticky Preview Toolbar
เพิ่ม toolbar ด้านบน (แทนปุ่มลอยมุมขวา) แสดง: ชื่อโครงการ + จำนวนหน้า + ปุ่มทั้งหมด
```
┌────────────────────────────────────────────────────────┐
│ ← กลับ   📄 Preview: โครงการ XXX (4 หน้า)   🖨 พิมพ์  📥 Excel │
└────────────────────────────────────────────────────────┘
```

---

### Export Features (Optional Phase)

#### Export Excel
- เพิ่มปุ่ม "📥 Excel" ข้าง print button
- ใช้ `xlsx` library (มีอยู่แล้ว) สร้าง workbook
- Sheet 1: รายการแต่ละเส้นทาง (sheet per route)
- Sheet 2: รวมทุกเส้นทาง
- Sheet 3: สรุป Factor F / VAT

#### Export PDF
- ใช้ `window.print()` ที่มีอยู่แล้ว → browser Save as PDF
- ถ้า pagination ถูกต้อง PDF ก็ถูกต้องตามไปด้วย

---

## Verification Plan

### Manual Verification (Browser Testing)

ทดสอบผ่าน browser โดยเปิดหน้า print preview:

**Test 1: Route น้อยรายการ (ไม่ล้น)**
1. เปิด BOQ ที่มี 1-2 เส้นทาง, แต่ละเส้นทางมี ≤ 10 รายการ
2. ไปที่ `/boq/{id}/print`
3. ตรวจสอบ: เลขหน้าถูกต้อง, Footer แสดงครบ, ไม่มี blank page

**Test 2: Route มีรายการเยอะ (ล้นหน้า)**
1. สร้าง/ใช้ BOQ ที่เส้นทางมี ≥ 25 รายการ
2. ตรวจสอบ: แบ่งหน้าถูกต้อง, header ซ้ำทุกหน้า, เลขหน้าต่อเนื่อง
3. หน้ากลางมี "ต่อหน้าถัดไป", หน้าสุดท้ายมี Totals + Footer

**Test 3: หลายเส้นทาง**
1. BOQ มี ≥ 3 เส้นทาง
2. ตรวจ: เลขหน้ารวมถูกต้อง, หน้ารวมทุกเส้นทาง (consolidated) แสดงถูกต้อง

**Test 4: ชื่อเส้นทาง/โครงการยาวมาก**
1. แก้ชื่อเส้นทางให้ยาว (>100 ตัวอักษร)
2. ตรวจ: info section ไม่ล้น, จำนวนรายการต่อหน้าลดลงตามที่คาดหวัง

**Test 5: Print to PDF**
1. กด Ctrl+P → Save as PDF
2. ตรวจ: PDF ได้เลขหน้าถูกต้อง, ไม่มีเนื้อหาถูกตัด

**Test 6: หน้าสรุปเส้นทางเยอะ (ถ้ามีข้อมูลทดสอบ)**
1. BOQ มี >12 เส้นทาง
2. ตรวจ: หน้าสรุปแบ่งหน้าถูกต้อง, Calc Summary อยู่หน้าสุดท้าย

> [!TIP]
> ถ้าไม่มี BOQ ที่มีรายการเยอะบน production สามารถทดสอบโดยแก้ `MAX_ITEMS` ชั่วคราวให้เป็นค่าต่ำ (เช่น 3-5) เพื่อบังคับให้เกิดการแบ่งหน้า

### Build Verification
```bash
npm run build
```
ตรวจสอบว่า build สำเร็จ ไม่มี TypeScript errors
