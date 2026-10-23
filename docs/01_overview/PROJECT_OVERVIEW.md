# Project Overview
## ระบบประมาณราคาท่อร้อยสายสื่อสารใต้ดิน (Conduit BOQ)

**Last Updated:** 2026-10-23
**Historical application-version label:** 1.2.0
**Status:** Production

<!-- INTEGRATED_ROADMAP_PLANNING_20261014 -->
> [!IMPORTANT]
> **Recorded state and remaining roadmap (2026-10-23):** Master Catalog/P-49,
> DUP-1, Save guard and numeric-only R0A retain their recorded closeouts.
> Dependency A `a3114fc`, B client `42e01c5` and Production 031 are closed;
> B HTTP remains **NOT RUN** by Owner choice, not a pending required probe.
> [LIST-1B L1](../06_engineering/LIST_1B_L1_PRODUCTION_RELEASE_RESULT_20261023.md)
> released at `b1ce4495e4f1ec7c675b1341c2121d7b3e0b589f`; its Production QA
> was bounded/no-write. These are receipt-based facts, not a new live check.
> [Roadmap #09](../plans/product/09-integrated-roadmap-and-it-decision-handoff.md)
> now proposes S0/user minimum → wider R0/D0 → W-H → R1/R2, with IT/SSO
> discovery in parallel. IdP/protocol and internal-all hosting policy remain
> unconfirmed. W-H records real-paper approval by the conduit engineering
> section manager; an in-app approval/revision workflow is not yet implemented.
> L1.1/L2 and the three deferred market additions are not prerequisites.
> Use the [Security Model](../04_data/SECURITY_MODEL.md) for existing access
> boundaries. Success metrics below are baseline targets, not measured results.
> Migrations 027–031 are immutable/no-replay. This task permits local docs only,
> no implementation, DB/Production or stage/commit/push/deploy operation.

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

- Detailed requirements baseline: [PRD.md](./PRD.md)
- Current proposed roadmap and decisions: [Integrated Roadmap #09](../plans/product/09-integrated-roadmap-and-it-decision-handoff.md)
- Phase roadmap: [ROADMAP.md](./ROADMAP.md)
- Implementation status: [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
