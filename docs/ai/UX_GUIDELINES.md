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
- ใช้ **Combobox** (Popover + Command) ไม่ใช่ Select
- Dropdown height: `max-h-[min(50vh,420px)]`
- 2-line option: ชื่อ + code/unit

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
