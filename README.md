# Conduit BOQ
## ระบบประมาณราคาท่อร้อยสายสื่อสารใต้ดิน (Underground Conduit BOQ System)

[![Version](https://img.shields.io/badge/version-1.4.0-blue.svg)](https://github.com/cloudstellar/conduit-boq/releases/tag/v1.4.0)
[![Next.js](https://img.shields.io/badge/Next.js-16.x-black.svg)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green.svg)](https://supabase.com/)

<!-- MASTER_CATALOG_CURRENT_STATE_20260829 -->
> [!IMPORTANT]
> **Master Catalog current state:** Phase 4 and P-49 are complete end-to-end.
> Use [Canonical Final Handoff #106](docs/plans/master-catalog/106-phase4-master-catalog-exact-remaining-work-handoff.md)
> and [Final Closeout Result #107](docs/plans/master-catalog/107-phase4-p49-master-catalog-final-closeout-result.md)
> as the current authority. A read-only Production recheck at
> `2026-08-29 01:38:54 +07` reconfirmed migrations 027 then 028 (no 029),
> catalog `2568.1.0` at `710/710`, the reviewed prices, the three catalog flags
> plus migration-028 functions/raw `app_settings` ACL, unchanged Factor F, and
> `0` working drafts at that instant; it made
> no write. Dated rollout or gate wording elsewhere is historical chronology,
> not current work or replay authority.

---

## 📖 Overview

**Conduit BOQ** คือ Web Application สำหรับการจัดทำและบริหาร **ประมาณราคางานท่อร้อยสายสื่อสารใต้ดิน (Bill of Quantities – BOQ)**  
พัฒนาขึ้นเพื่อรองรับการใช้งานภายใน **บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน) – NT**

ระบบถูกออกแบบให้รองรับ
- งานประมาณราคาด้านโครงสร้างพื้นฐานโทรคมนาคม
- การวางแผนงบประมาณระยะสั้น–ระยะยาว
- การกำกับดูแลตามโครงสร้างองค์กร (RBAC)
- การต่อยอดสู่ระบบแผนที่, As-built, และ Asset Management ในอนาคต

---

## ✨ Key Features

- 📋 สร้าง BOQ ได้อย่างเป็นระบบและรวดเร็ว
- 🛣️ รองรับงานหลายเส้นทาง (Multi-Route / Multi-Segment)
- 💰 คำนวณราคาอัตโนมัติ  
  - Factor F จากคอลัมน์ `factor` ("รวมในรูป Factor") พร้อม snapshot ตอนบันทึก
  - VAT  
  - รวมยอดตามมาตรฐานองค์กร
- 📊 Price List มาตรฐานปัจจุบัน (710 รายการ: ฐานเดิม 682 + PN6 เพิ่ม 28)
- 🔐 Authentication & Authorization ระดับองค์กร
- 👥 Role-Based Access Control (RBAC)
- 🧾 แยกบทบาท “ผู้จัดทำ / ผู้ตรวจสอบ / ผู้อนุมัติ” อย่างชัดเจน
- 🏗️ รองรับการขยายสู่  
  - ระบบแผนที่ (GIS / Route ID)  
  - ระบบแผนงบประมาณ  
  - ระบบติดตามงานก่อสร้าง (As-Built)

---

## 🛠️ Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| UI / Styling | Tailwind CSS 4 |
| Backend | Supabase (PostgreSQL, Auth, RLS) |
| Hosting | Vercel |
| Auth | Supabase Auth (Email/Password) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm
- Supabase Account

### Installation

```bash
# Clone repository
git clone https://github.com/cloudstellar/conduit-boq.git
cd conduit-boq

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with Supabase credentials

# Run development server
npm run dev
