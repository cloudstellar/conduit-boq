# Conduit BOQ
## ระบบประมาณราคาท่อร้อยสายสื่อสารใต้ดิน (Underground Conduit BOQ System)

[![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)](https://github.com/cloudstellar/conduit-boq/releases/tag/v1.2.0)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green.svg)](https://supabase.com/)

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
  - Factor F  
  - VAT  
  - รวมยอดตามมาตรฐานองค์กร
- 📊 Price List มาตรฐาน (518 รายการ)
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
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| UI / Styling | Tailwind CSS 4 |
| Backend | Supabase (PostgreSQL, Auth, RLS) |
| Hosting | Vercel |
| Auth | Supabase Auth (Google OAuth) |

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
