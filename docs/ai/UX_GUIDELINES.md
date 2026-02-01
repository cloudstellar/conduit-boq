# UX Guidelines for BOQ Application

> สร้าง: 2026-01-31 | ปรับปรุง: 2026-01-31

## 1. หลัก UX พื้นฐาน

### Navigation / Tabs
- ต้องมี **container + state** ชัดเจน (active/hover/focus/disabled)
- ใช้ semantic tokens: `bg-muted/40`, `border-border`, `rounded-lg`
- เพิ่ม focus ring สำหรับ accessibility

### Data Entry Tables
- **Desktop**: ใช้ Table ปกติ
- **Mobile (< md)**: ใช้ Card layout
- Breakpoint: `md:` (768px) เป็นมาตรฐาน

### Quantity Input (ตัวเลข)
- **Draft string pattern**: เก็บ string → commit on blur
- ใช้ `inputMode="decimal"` ไม่ใช่ `type="number"`
- แสดง stepper (+/-) เสมอ
- Select all on focus

### Item Selection (รายการยาว)
- ใช้ **Popover + Command** (portal) ไม่ใช่ absolute div
- Dropdown height: `max-h-[min(70vh,560px)]` ที่ **CommandList** ไม่ใช่ Command
- Width: `w-[--radix-popover-trigger-width]`
- Compact items: `line-clamp-1` เพื่อเห็นรายการมากขึ้น

---

## ⚠️ DO NOT (Anti-patterns - เรียนรู้จากความผิดพลาด)

> **CRITICAL**: ถ้าเห็นปัญหา horizontal scroll บน table ที่มี 10+ columns
> **อย่าทำ** สิ่งเหล่านี้ เพราะทดลองแล้วไม่แก้ปัญหา:

### ❌ table-fixed + fixed column widths
```tsx
// ไม่แก้ horizontal scroll - ทำให้แย่ลง!
<Table className="table-fixed w-full">
  <TableHead className="w-8">...</TableHead>
  <TableHead className="w-auto">รายการ</TableHead>  // ไม่ wrap!
  <TableHead className="w-28">...</TableHead>
</Table>
```
**ปัญหา**: แม้ใส่ `whitespace-normal` + `break-words` ก็ไม่ทำให้ text wrap

### ❌ truncate แทน wrap
```tsx
// ตัด text ออก ไม่ใช่ wrap
<div className="truncate">ชื่อรายการยาว...</div>
```
**ปัญหา**: ข้อมูลหายไป ไม่ใช่ wrap

### ✅ วิธีที่ควรทำ (ยังไม่ได้ทดสอบ)
1. **ซ่อนบาง columns บน responsive** ด้วย `hidden xl:table-cell`
2. **ใช้ Card layout บน mobile** แทน Table
3. อาจต้อง **refactor component structure** ไม่ใช่แค่ CSS

### 🔍 Root Cause Analysis Needed
ปัญหา horizontal scroll มักเกิดจาก:
- Parent container มี fixed width หรือ overflow issues
- shadcn Table component มี default styles ที่ override
- Content ใน cells กว้างเกินไป (เช่น numbers, QuantityEditor)

**ต้องวิเคราะห์ DevTools** ก่อนแก้ ไม่ใช่เดาว่า CSS ไหนจะแก้ได้

---

## 2. Constants & Policies

```typescript
// ควรกำหนดใน component ไม่ปล่อยเป็น magic number

// Quantity Editor
const DEFAULT_QTY_STEP = 1;  // จะเปลี่ยนเป็น item.step เมื่อมี metadata

// Breakpoints
// Table: hidden md:block
// Card: block md:hidden

// Dropdown height
// max-h-[min(50vh,420px)]
```

---

## 3. Component Patterns

### QuantityEditor
```
Location: components/boq/QuantityEditor.tsx
Props: value, onChange, step?, min?, className?
Pattern: Draft string → commit on blur
Features: stepper (+/-), select on focus, sanitize decimal
```

### ItemSearch
```
Location: components/boq/ItemSearch.tsx
Pattern: Command (not Select)
Behavior: Keep open when category selected
State: Don't clear results on select
```

---

## 4. สิ่งที่ต้องทำในอนาคต

| Item | Description | Priority |
|------|-------------|----------|
| `item.step` metadata | เพิ่ม step field ใน price_list | Low |
| Virtualized list | สำหรับ catalog > 1000 items | Low |
| Press & hold stepper | เพิ่ม/ลดเร็วขึ้นเมื่อกดค้าง | Low |

---

## 5. Verification Checklist

### Visual
- [ ] Tabs มี container + active state ชัด
- [ ] ชื่อรายการ clamp ไม่ดัน layout

### Quantity
- [ ] พิมพ์ "." แล้ว blur → 0
- [ ] กด +/- แล้ว draft sync
- [ ] มือถือเปิด numeric keyboard

### Dropdown
- [ ] สูงขึ้น เห็นรายการมากขึ้น
- [ ] เพิ่มรายการหมวดเดิมได้ต่อเนื่อง

### Mobile
- [ ] 375px ไม่มี horizontal scroll
- [ ] Card layout ทำงานถูกต้อง

---

## 6. BOQ List Table Patterns (2026-02-01)

### Route Column: Badge + Dialog
```
┌─ Table Cell ─┐     ┌─ Dialog (on click) ─────────────────────┐
│ [5 เส้นทาง] │ --> │ รายการเส้นทาง (5 เส้นทาง)               │
└──────────────┘     │ • เส้นทาง 1 ชื่อเต็ม ไม่ clamp        │
                     │ • เส้นทาง 2 ชื่อเต็ม ไม่ clamp        │
                     └─────────────────────────────────────────┘
```

**Why Badge + Dialog:**
- Table cells stay compact
- Route names often long (50+ chars)
- Users can see count at a glance
- Full details on demand

**Component:** `RouteBadge.tsx`

---

### Column Layout (7 columns)

| Column | Width | Content |
|--------|-------|---------|
| โครงการ | 380px | line-clamp-4 |
| เส้นทาง | 100px | Badge "N เส้นทาง" |
| ผู้ประมาณราคา | 150px | full name, line-clamp-2 |
| ก่อน VAT | 140px | `total_with_factor_f` (snapshot) |
| สถานะ | 90px | Badge color-coded |
| วันที่ | 100px | DD MMM format |
| จัดการ | 120px | icon buttons: edit/print/copy/delete |

**Key Decisions:**
- "ก่อน VAT" uses snapshot value, not calculated
- Estimator shows full name (not abbreviated)
- Actions are icon-only with tooltips
