# Product Requirements Document (PRD)
## ระบบประมาณราคาท่อร้อยสายสื่อสารใต้ดิน (Conduit BOQ)

**Version:** 1.0  
**วันที่:** 17 มกราคม 2569  
**สถานะ:** Production  

---

## 1. Executive Summary

### 1.1 Product Vision
ระบบ Conduit BOQ เป็นเครื่องมือสำหรับการประมาณราคางานท่อร้อยสายสื่อสารใต้ดินสำหรับ บมจ. โทรคมนาคมแห่งชาติ (NT) ช่วยให้พนักงานสามารถสร้าง BOQ (Bill of Quantities) ได้อย่างรวดเร็วและถูกต้อง โดยใช้ราคามาตรฐานที่กำหนดไว้

### 1.2 Problem Statement
- การทำ BOQ แบบ manual ใช้เวลานานและมีโอกาสผิดพลาดสูง
- ราคามาตรฐานไม่ update ทำให้ประมาณราคาไม่แม่นยำ
- ไม่มีระบบควบคุมการเข้าถึงตามโครงสร้างองค์กร
- ยากต่อการติดตามและอนุมัติเอกสาร

### 1.3 Solution
Web application ที่:
- มี price list มาตรฐาน 518 รายการ
- รองรับ multi-route BOQ (หลายเส้นทางใน 1 โครงการ)
- คำนวณ Factor F และ VAT อัตโนมัติ
- มีระบบ authentication และ authorization ตามโครงสร้างองค์กร

---

## 2. Target Users

### 2.1 User Roles

| Role | คำอธิบาย | Permissions |
|------|---------|-------------|
| **Admin** | ผู้ดูแลระบบ | จัดการ users, settings, อนุมัติทุก BOQ |
| **Dept Manager** | ผู้จัดการฝ่าย | อนุมัติ BOQ ของฝ่าย, ดูข้อมูลฝ่าย |
| **Sector Manager** | ผู้จัดการส่วน | อนุมัติ BOQ ของส่วน, review |
| **Staff** | พนักงาน | สร้าง/แก้ไข BOQ ของตัวเอง |
| **Procurement** | จัดซื้อจัดจ้าง | ดู BOQ ที่อนุมัติแล้ว |

### 2.2 Organization Structure
```
Organization (NT)
└── Department (ฝ่าย)
    └── Sector (ส่วน)
        └── Staff
```

---

## 3. Core Features

### 3.1 BOQ Management

#### 3.1.1 Create BOQ
- กรอกข้อมูลโครงการ (ชื่อโครงการ, ผู้ประมาณราคา, วันที่)
- เลือกรายการจาก price list มาตรฐาน
- ระบุปริมาณและระบบคำนวณราคาอัตโนมัติ
- บันทึกเป็น draft หรือ submit เพื่ออนุมัติ

#### 3.1.2 Multi-Route Support
- 1 BOQ สามารถมีหลายเส้นทาง (route)
- แต่ละ route มี:
  - ชื่อเส้นทาง
  - พื้นที่ก่อสร้าง
  - รายการวัสดุและค่าแรง
  - Total cost ของ route
- รวม total ทุก route เป็น grand total

#### 3.1.3 Factor F Calculation
- Factor F = ค่าสัมประสิทธิ์ปรับราคา (เช่น 1.0537)
- Total with Factor F = Grand Total × Factor F
- Total with VAT = Total with Factor F × 1.07

### 3.2 Price List

- 518 รายการมาตรฐาน
- 52 หมวดหมู่
- แต่ละรายการมี:
  - รหัสรายการ (Item Code)
  - ชื่อรายการ
  - หน่วย
  - ค่าวัสดุ (Material Cost)
  - ค่าแรง (Labor Cost)
  - ราคารวม (Unit Cost)

### 3.3 Authentication & Authorization

#### 3.3.1 Authentication
- Google OAuth (NT domain: @ntplc.co.th)
- Option: Restrict to @ntplc.co.th only
- Auto-create user profile on first login
- Onboarding flow for new users

#### 3.3.2 Authorization (RBAC)
- Row Level Security (RLS) ที่ database level
- Client-side permission checks สำหรับ UI
- Separation of Duties (ผู้สร้าง BOQ ไม่สามารถอนุมัติเองได้)

### 3.4 Admin Panel

- จัดการ users (role, status)
- ตั้งค่า email domain restriction
- ดู users ที่รอ approval (pending status)

---

## 4. Technical Requirements

### 4.1 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Hosting | Vercel |

### 4.2 Database Schema

#### Core Tables
- `boq` - BOQ header
- `boq_routes` - เส้นทางของ BOQ
- `boq_items` - รายการใน BOQ
- `price_list` - ราคามาตรฐาน

#### Auth & Org Tables
- `organizations` - องค์กร
- `departments` - ฝ่าย
- `sectors` - ส่วน
- `user_profiles` - ข้อมูลผู้ใช้

### 4.3 Security
- RLS policies สำหรับทุก table
- JWT authentication via Supabase
- HTTPS only
- Environment variables for secrets

---

## 5. Success Metrics

| Metric | Target |
|--------|--------|
| Time to create BOQ | < 30 นาที (จากเดิม 2-3 ชั่วโมง) |
| Accuracy | 100% (ใช้ราคามาตรฐาน) |
| User adoption | 80% ของ staff ที่ทำ BOQ |
| System uptime | 99.5% |

---

## 6. Future Roadmap

### Phase 2: Modernization (FROZEN)
**Strategy:** Foundation → Output → Input → Governance

- **2A: Foundation** — shadcn/ui, Price Versioning, system_event_log
- **2B: Reporting** — Summary, PDF Export, Copy/Requote
- **2C: Smart Estimation** — Model-based BOQ generation
- **2D: Governance** — Audit Log, Version Comparison

### Phase 3+ (Future)
- [ ] Approval workflow
- [ ] Notifications
- [ ] Mobile PWA / Offline
- [ ] Analytics & Reporting


