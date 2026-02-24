# AI Handoff: Print Pagination Fix

> **Branch:** `feature/print-pagination`
> **แผนอยู่ที่:** `docs/plans/print-pagination-plan.md`
> **สถานะ:** แผนได้รับการอนุมัติแล้ว พร้อม implement

---

## สิ่งที่ต้องทำ

### ขั้นตอนที่ 1: สร้าง `lib/printUtils.ts`
Utility functions สำหรับ pagination:
- `splitText(text, maxChars)` — ตัดข้อความยาวเป็นหลายบรรทัด (ห้ามใช้ ellipsis เพราะเอกสารราชการ)
- `estimateInfoHeight(routeName, projectName, area)` — คำนวณความสูง info section
- `calculateMaxRowsForPage(infoHeight, isLastPage)` — คำนวณจำนวนแถวสูงสุดต่อหน้า
- `chunkItems(items, maxRows)` — ตัดรายการเป็น chunk (นับแถวต่อจาก splitText รวมด้วย)
- `chunkSummaryRoutes(routes, maxRows)` — ตัดเส้นทางสำหรับหน้าสรุป
- `countTotalPages(routeChunks, hasConsolidated)` — นับจำนวนหน้าทั้งหมด

### ขั้นตอนที่ 2: Refactor `app/boq/[id]/print/page.tsx`
1. Extract sub-components (ไม่ export, อยู่ใน file เดียวกัน):
   - `PageHeader` — Logo + เลขหน้า
   - `InfoSection` — ส่วนงาน, เส้นทาง, โครงการ
   - `BOQTableHeader` — thead 10 คอลัมน์
   - `PageFooter` — เงื่อนไข + ลายเซ็น (รับ props สำหรับข้อมูลเพิ่มเติมในอนาคต)
   - `ContinueIndicator` — "ต่อหน้าถัดไป" (เล็ก, ชิดขวา, สีเทา)
2. แก้ส่วน Route Detail Pages — ใช้ chunkItems แบ่งหน้า
3. แก้ส่วน Consolidated Items Page — ใช้ chunkItems เช่นกัน
4. แก้ส่วน Summary Page — ใช้ chunkSummaryRoutes
5. เพิ่ม CSS safety (`page-break-inside: avoid`, `white-space: nowrap`)
6. **UI/UX:** เปลี่ยนปุ่ม → shadcn `Button` + lucide icons
7. **UI/UX:** Loading → shadcn `Skeleton`, Error → shadcn `Alert`
8. **UI/UX:** เพิ่ม Sticky Preview Toolbar (ชื่อโครงการ + จำนวนหน้า + ปุ่ม)

### ขั้นตอนที่ 3: ทดสอบ
- Test กับ BOQ รายการน้อย (ต้องดูเหมือนเดิม!)
- Test กับ BOQ รายการเยอะ (>20 รายการ/เส้นทาง)
- Test กับชื่อเส้นทาง/รายการยาว
- Test Print to PDF

### ขั้นตอนที่ 4 (Optional): Export Excel
- ใช้ `xlsx` library ที่มีอยู่แล้วใน package.json

---

## กฎสำคัญ (ห้ามลืม)
1. **ห้ามใช้ `...` (ellipsis)** ตัดข้อความ — เป็นเอกสารราชการต้องแสดงครบ
2. **ข้อความยาว → ตัดเป็นหลายแถว** ทุกแถวสูงเท่ากัน แถวต่อแสดงเฉพาะคอลัมน์ชื่อ ช่องอื่นว่าง
3. **ไม่แตะ DB, RPC, calculation.ts** — เปลี่ยนเฉพาะ frontend rendering
4. **เลขหน้า 2 ระบบ:** ปร.4(ก) = ต่อเนื่องทุกเส้นทาง, สรุป = แยก numbering
5. **ลำดับการทำงาน:** fetch → merge (consolidated) → splitText → chunk → render
6. **ทดสอบกับ BOQ รายการน้อยด้วย** ว่า layout ไม่เปลี่ยนจากเดิม

---

## บัคที่ต้องระวัง
- Totals row อาจตกไปอีกหน้า → chunk สุดท้ายต้องเผื่อที่ totals + footer
- Empty row padding เดิม (บรรทัด 413-426) → ลบหรือปรับ ไม่งั้นหน้าจะเยอะเกิน
- `splitText` ต้องทำก่อน pagination count
- Consolidated merge ต้องทำก่อน splitText

---

## ไฟล์ที่เกี่ยวข้อง
- `app/boq/[id]/print/page.tsx` — ไฟล์หลักที่ต้อง refactor (1039 บรรทัด)
- `lib/calculation.ts` — ห้ามแก้ (ใช้อ้างอิง `roundMoney`, `calculateVAT`, `allocateToRoutes`)
- `lib/printUtils.ts` — ไฟล์ใหม่ที่ต้องสร้าง
- `package.json` — มี `xlsx` อยู่แล้ว (สำหรับ Excel export)
