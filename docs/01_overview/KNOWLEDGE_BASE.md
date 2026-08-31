# Knowledge Base
## ระบบประมาณราคาท่อร้อยสายสื่อสารใต้ดิน (Conduit BOQ)

---

## 📖 สารบัญ

1. [ภาพรวมระบบ](#1-ภาพรวมระบบ)
2. [โครงสร้างองค์กร](#2-โครงสร้างองค์กร)
3. [บทบาทและสิทธิ์](#3-บทบาทและสิทธิ์)
4. [การใช้งานระบบ](#4-การใช้งานระบบ)
5. [การคำนวณ](#5-การคำนวณ)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. ภาพรวมระบบ

### 1.1 Conduit BOQ คืออะไร?
ระบบสำหรับประมาณราคางานท่อร้อยสายสื่อสารใต้ดิน โดยใช้ราคามาตรฐานที่กำหนดไว้ รองรับการสร้าง BOQ หลายเส้นทาง และคำนวณค่า Factor F, VAT อัตโนมัติ

### 1.2 คำศัพท์สำคัญ

| คำศัพท์ | ความหมาย |
|--------|---------|
| **BOQ** | Bill of Quantities - ใบประมาณราคา |
| **Route** | เส้นทางการวางท่อ |
| **Factor F** | ค่าสัมประสิทธิ์ปรับราคา |
| **Material Cost** | ค่าวัสดุ |
| **Labor Cost** | ค่าแรง |
| **Unit Cost** | ราคาต่อหน่วย (วัสดุ + แรง) |

---

## 2. โครงสร้างองค์กร

```
NT (Organization)
├── ฝ่าย A (Department)
│   ├── ส่วน A1 (Sector)
│   │   ├── พนักงาน 1
│   │   └── พนักงาน 2
│   └── ส่วน A2 (Sector)
│       └── พนักงาน 3
└── ฝ่าย B (Department)
    └── ส่วน B1 (Sector)
        └── พนักงาน 4
```

### ความสัมพันธ์
- 1 Organization มีหลาย Department
- 1 Department มีหลาย Sector
- 1 Sector มีหลาย Staff

---

## 3. บทบาทและสิทธิ์

### 3.1 User Roles

| Role | TH | สิทธิ์หลัก |
|------|-----|----------|
| `admin` | ผู้ดูแลระบบ | ทุกอย่าง |
| `dept_manager` | ผู้จัดการฝ่าย | อนุมัติ BOQ ของฝ่าย |
| `sector_manager` | ผู้จัดการส่วน | Review BOQ ของส่วน |
| `staff` | พนักงาน | สร้าง/แก้ไข BOQ ของตัวเอง |
| `procurement` | จัดซื้อจัดจ้าง | ดู BOQ ที่อนุมัติแล้วเท่านั้น |

### 3.2 User Status

| Status | ความหมาย |
|--------|---------|
| `active` | ใช้งานได้ปกติ |
| `pending` | รออนุมัติจาก Admin |
| `inactive` | ไม่ active (ยังไม่ถูกลบ) |
| `suspended` | ถูกระงับการใช้งาน |

### 3.3 Permission Matrix - BOQ

| Action | Staff | Sector Mgr | Dept Mgr | Admin |
|--------|-------|------------|----------|-------|
| Create | ✅ Own | ✅ Sector | ✅ Dept | ✅ All |
| Read | ✅ Own/Sector | ✅ Sector/Dept | ✅ Dept | ✅ All |
| Update | ✅ Own | ✅ Sector | ✅ Dept | ✅ All |
| Delete | ✅ Own (draft) | ✅ Sector | ✅ Dept | ✅ All |
| Approve | ❌ | ✅ pending_review | ✅ pending_approval | ✅ All |

### 3.4 Separation of Duties
- ผู้สร้าง BOQ ไม่สามารถอนุมัติ BOQ นั้นเองได้
- ป้องกันการทุจริต

---

## 4. การใช้งานระบบ

### 4.1 Login
1. เข้า URL ระบบ
2. คลิก "เข้าสู่ระบบด้วย Google"
3. เลือก account @ntplc.co.th (ถ้ามี restriction)
4. ครั้งแรก: กรอก onboarding form

### 4.2 สร้าง BOQ

**ขั้นตอน:**
1. หน้าแรก → "สร้างใบประมาณราคาใหม่"
2. กรอกข้อมูลโครงการ:
   - ชื่อผู้ประมาณราคา (auto-fill จาก profile)
   - วันที่เอกสาร
   - ชื่อโครงการ
   - หน่วยงาน (auto-fill จาก profile)
3. คลิก "สร้างใบประมาณราคา"
4. เพิ่มเส้นทาง (Route) ถ้าต้องการ
5. เพิ่มรายการจาก Price List
6. บันทึก

### 4.3 Multi-Route BOQ

**เมื่อไหร่ใช้ Multi-Route?**
- โครงการมีหลายเส้นทาง (เช่น สายเหนือ, สายใต้)
- ต้องการแยก cost ตามพื้นที่

**วิธีใช้:**
1. ใน BOQ Editor → คลิก "เพิ่มเส้นทาง"
2. ตั้งชื่อ route (เช่น "เส้นทาง A - ถนนสุขุมวิท")
3. ระบุพื้นที่ก่อสร้าง
4. เพิ่มรายการในแต่ละ route
5. ระบบรวม total ทุก route ให้อัตโนมัติ

### 4.4 Factor F

**สูตร:**
```
Total with Factor F = Grand Total × Factor F
VAT = Total with Factor F (ปัดแล้ว) × VAT rate ของ Factor F version
Total with VAT = Total with Factor F (ปัดแล้ว) + VAT (ปัดแล้ว)
```

Factor F version ที่ published อยู่ในปัจจุบันและ legacy fallback ใช้ VAT 7%
เหมือนเดิม ระบบดึง rate จาก metadata ของ version และผู้ใช้ไม่สามารถ override
แยกตามโครงการหรือ route ได้

**ตัวอย่าง:**
- Grand Total = 1,000,000 บาท
- Factor F = 1.0537
- Total with Factor F = 1,053,700 บาท
- Total with VAT = 1,127,459 บาท

---

## 5. การคำนวณ

### 5.1 Item Cost
```
Total Material = Quantity × Material Cost per Unit
Total Labor = Quantity × Labor Cost per Unit
Total Cost = Total Material + Total Labor
```

### 5.2 Route Cost
```
Route Total = ผลรวมของ Total Cost ทุกรายการใน Route
Route with Factor F = Route Total × Factor F
```

### 5.3 BOQ Cost
```
Grand Total = ผลรวมของ Route Total ทุก Route
Grand Total with Factor F = Grand Total × Factor F
VAT = Grand Total with Factor F (ปัดแล้ว) × bound vatRate
Grand Total with VAT = Grand Total with Factor F (ปัดแล้ว) + VAT (ปัดแล้ว)
```

---

## 6. Troubleshooting

### ❓ Login ไม่ได้
- ตรวจสอบว่าใช้ email @ntplc.co.th (ถ้ามี restriction)
- ลอง clear cookies และ login ใหม่
- ติดต่อ Admin ถ้า account ถูก suspended

### ❓ สร้าง BOQ ไม่ได้
- ตรวจสอบว่า status เป็น "active"
- pending users อาจมี permission จำกัด
- ติดต่อ Admin เพื่อขอ activate

### ❓ ไม่เห็น BOQ ของคนอื่น
- Staff เห็นเฉพาะ BOQ ของตัวเองและส่วนเดียวกัน
- ต้องการเห็นมากกว่านี้ → ติดต่อ Admin เพื่อเปลี่ยน role

### ❓ อนุมัติ BOQ ไม่ได้
- ตรวจสอบ role มีสิทธิ์ approve หรือไม่
- ตรวจสอบว่าไม่ได้เป็นผู้สร้าง BOQ นั้น (Separation of Duties)

---

## 📞 ติดต่อ Support
- Email: suthorn@ntplc.co.th
- ระบบ: เมนู Profile → ติดต่อผู้ดูแล
