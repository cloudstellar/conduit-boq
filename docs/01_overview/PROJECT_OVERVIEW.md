# Project Overview
## ระบบประมาณราคาท่อร้อยสายสื่อสารใต้ดิน (Conduit BOQ)

**Last Updated:** 2026-10-12
**Historical application-version label:** 1.2.0
**Status:** Production

> [!IMPORTANT]
> **Current-state overlay:** the recorded 2026-08-28/29 Production release
> baseline is Master Catalog `2568.1.0` with 710 active rows;
> Atomic BOQ Duplicate and migrations 027–030 are live and closed under their
> recorded release results. Quantity Input Safety is a
> `PREVIEW-VERIFIED CANDIDATE` at exact Preview source `5527fe9`; it is not
> merged or released to Production. See [Preview Result #07](../plans/product/07-r0a-quantity-input-safety-preview-result.md);
> LIST-1B and Full Quantity Expression remain proposed. Use
> [AI Handoff](../08_ai/AI_HANDOFF.md) for the current work register and
> authority boundaries. The overview body describes product purpose and does
> not grant implementation or release authority.

---

## 1. What is Conduit BOQ?

**Conduit BOQ** คือ Web Application สำหรับการจัดทำและบริหาร **ประมาณราคางานท่อร้อยสายสื่อสารใต้ดิน (Bill of Quantities – BOQ)**  
พัฒนาขึ้นเพื่อรองรับการใช้งานภายใน **บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน) – NT**

ระบบช่วยให้พนักงานสามารถสร้าง BOQ ได้อย่างรวดเร็วและถูกต้อง โดยใช้ราคามาตรฐานที่กำหนดไว้

---

## 2. Problem Statement

- การทำ BOQ แบบ manual ใช้เวลานานและมีโอกาสผิดพลาดสูง
- ราคามาตรฐานไม่ update ทำให้ประมาณราคาไม่แม่นยำ
- ไม่มีระบบควบคุมการเข้าถึงตามโครงสร้างองค์กร
- ยากต่อการติดตามและอนุมัติเอกสาร

---

## 3. Solution

Web application ที่:
- Production release baseline ที่บันทึกไว้มี Master Catalog **710 รายการ**
- รองรับ **multi-route BOQ** (หลายเส้นทางใน 1 โครงการ)
- คำนวณ **Factor F** และ **VAT 7%** อัตโนมัติ
- มีระบบ **authentication** และ **authorization** ตามโครงสร้างองค์กร
- **RBAC** (Role-Based Access Control) ผ่าน Supabase RLS

---

## 4. Key Features

| Feature | Description |
|---------|-------------|
| 📋 BOQ Creation | สร้างใบประมาณราคาได้อย่างเป็นระบบและรวดเร็ว |
| 🛣️ Multi-Route | รองรับงานหลายเส้นทาง (Multi-Route / Multi-Segment) |
| 💰 Auto-Calculate | คำนวณ Factor F, VAT, รวมยอดอัตโนมัติ |
| 📊 Price List | Recorded Production baseline: Master Catalog 710 รายการ |
| 🔐 Auth | Supabase Auth (Email/Password) + Domain restriction |
| 👥 RBAC | Role-Based Access Control |
| 🧾 Separation of Duties | แยกบทบาท "ผู้จัดทำ / ผู้ตรวจสอบ / ผู้อนุมัติ" |

---

## 5. Target Users

| Role | Thai | Primary Use |
|------|------|-------------|
| `admin` | ผู้ดูแลระบบ | Manage users, settings, all BOQs |
| `dept_manager` | ผู้จัดการฝ่าย | Approve BOQs for department |
| `sector_manager` | ผู้จัดการส่วน | Review BOQs for sector |
| `staff` | พนักงาน | Create and edit own BOQs |
| `procurement` | จัดซื้อจัดจ้าง | View approved BOQs (read-only) |

---

## 6. Organization Structure

```
Organization (NT)
└── Department (ฝ่าย)
    └── Sector (ส่วน)
        └── Staff (พนักงาน)
```

---

## 7. Success Metrics

| Metric | Target |
|--------|--------|
| Time to create BOQ | < 30 นาที (จากเดิม 2-3 ชั่วโมง) |
| Accuracy | 100% (ใช้ราคามาตรฐาน) |
| User adoption | 80% ของ staff ที่ทำ BOQ |
| System uptime | 99.5% |

---

## 8. Non-Goals (Out of Scope)

These are explicitly **NOT** in current scope:

1. **Inventory management** - No tracking of actual materials
2. **Procurement execution** - No purchase orders or vendor management
3. **Field operations** - No work order or crew dispatch
4. **External integrations** - No API for third-party systems
5. **Mobile-first design** - Desktop-primary, mobile responsive later
6. **Offline support** - Requires internet connection

---

## Related Documents

- Detailed requirements: [PRD.md](../PRD.md)
- Phase roadmap: [ROADMAP.md](./ROADMAP.md)
- Implementation status: [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
