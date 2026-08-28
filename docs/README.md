# Conduit BOQ
## ระบบประมาณราคาท่อร้อยสายสื่อสารใต้ดิน

---

> [!IMPORTANT]
> AI agents and maintainers must start at
> [`08_ai/AI_HANDOFF.md`](./08_ai/AI_HANDOFF.md). For the completed Master
> Catalog Production state, [Handoff
> #106](./plans/master-catalog/106-phase4-master-catalog-exact-remaining-work-handoff.md)
> and [Result
> #107](./plans/master-catalog/107-phase4-p49-master-catalog-final-closeout-result.md)
> are canonical. The older [`docs/ai/`](./ai/README.md) tree is historical.

## 📖 Overview

ระบบ Conduit BOQ เป็น web application สำหรับประมาณราคางานท่อร้อยสายสื่อสารใต้ดิน พัฒนาสำหรับ บมจ. โทรคมนาคมแห่งชาติ (NT)

### ✨ Key Features
- 📋 สร้าง BOQ (Bill of Quantities) ได้รวดเร็ว
- 🛣️ รองรับหลายเส้นทาง (Multi-Route)
- 💰 คำนวณ Factor F จากคอลัมน์ `factor` และ VAT อัตโนมัติ
- 📊 Price List มาตรฐานปัจจุบัน 710 รายการ
- 🔐 ระบบ Authentication & Authorization
- 👥 Role-Based Access Control (RBAC)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Backend | Supabase (PostgreSQL + Auth) |
| Hosting | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

```bash
# Clone repository
git clone https://github.com/cloudstellar/conduit-boq.git
cd conduit-boq

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 📁 Project Structure

```
conduit-boq/
├── app/                    # Next.js App Router pages
├── components/             # Reusable React components
├── lib/                    # Libraries & utilities
│   ├── context/           # React contexts
│   ├── hooks/             # Custom hooks
│   ├── supabase/          # Supabase clients
│   └── types/             # TypeScript types
├── migrations/            # SQL migrations
└── docs/                  # Documentation
```

---

## 📚 Documentation

### User & Business Documentation
| Document | Description |
|----------|-------------|
| [PRODUCT_BRIEF_AND_MEASUREMENT_PLAN.md](./PRODUCT_BRIEF_AND_MEASUREMENT_PLAN.md) | Product brief, objectives, benefits, workflow, KPIs, and measurement plan |
| [CODEBASE_DATABASE_MAP.md](./CODEBASE_DATABASE_MAP.md) | Detailed codebase and production database map |
| [km/README.md](./km/README.md) | Knowledge Management competition document packet |
| [PRD.md](./PRD.md) | Product Requirements Document |
| [KNOWLEDGE_BASE.md](./01_overview/KNOWLEDGE_BASE.md) | User guide & troubleshooting |
| [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) | Technical implementation details |
| [Engineering docs](./06_engineering/) | Current developer technical references |
| [DATABASE_SCHEMA.md](./04_data/DATABASE_SCHEMA.md) | Database tables and relationships |

### Current AI Handoff (`docs/08_ai/`)

| Document | Description |
|----------|-------------|
| [AI_HANDOFF.md](./08_ai/AI_HANDOFF.md) | **START HERE** — current repository and Master Catalog handoff |
| [AI_CONTEXT.md](./08_ai/AI_CONTEXT.md) | Current agent authority, safety, and source-of-truth map |
| [LESSONS_LEARNED.md](./08_ai/LESSONS_LEARNED.md) | Durable technical lessons and invariants |
| [Historical `docs/ai/` index](./ai/README.md) | Legacy Phase 1/2 context; not current status authority |

---

## 👥 User Roles

| Role | Description |
|------|-------------|
| Admin | ผู้ดูแลระบบ - จัดการทุกอย่าง |
| Dept Manager | ผู้จัดการฝ่าย - อนุมัติ BOQ ของฝ่าย |
| Sector Manager | ผู้จัดการส่วน - Review BOQ ของส่วน |
| Staff | พนักงาน - สร้าง/แก้ไข BOQ ของตัวเอง |
| Procurement | จัดซื้อจัดจ้าง - ดู BOQ ที่อนุมัติแล้ว |

---

## 🔐 Security

- **Authentication:** Supabase Auth (Email/Password)
- **Authorization:** Row Level Security (RLS) at database level
- **Separation of Duties:** ผู้สร้าง BOQ ไม่สามารถอนุมัติเองได้

---

## 📝 Scripts

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Build for production
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint
```

---

## 🗄️ Database

### Core Tables
- `boq` - BOQ header
- `boq_routes` - เส้นทางของ BOQ
- `boq_items` - รายการใน BOQ
- `price_list` - ราคามาตรฐาน

### Auth Tables
- `organizations` - องค์กร
- `departments` - ฝ่าย
- `sectors` - ส่วน
- `user_profiles` - ข้อมูลผู้ใช้

---

## 🚢 Deployment

Production deployment is automated via Vercel:
1. Push to `main` branch
2. Vercel auto-builds and deploys

---

## 📞 Support

- **Issues:** GitHub Issues
- **Email:** admin@ntplc.co.th

---

## 📄 License

Private - NT Internal Use Only
