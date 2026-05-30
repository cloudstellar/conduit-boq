# Conduit BOQ
## ระบบประมาณราคาท่อร้อยสายสื่อสารใต้ดิน

---

## 📖 Overview

ระบบ Conduit BOQ เป็น web application สำหรับประมาณราคางานท่อร้อยสายสื่อสารใต้ดิน พัฒนาสำหรับ บมจ. โทรคมนาคมแห่งชาติ (NT)

### ✨ Key Features
- 📋 สร้าง BOQ (Bill of Quantities) ได้รวดเร็ว
- 🛣️ รองรับหลายเส้นทาง (Multi-Route)
- 💰 คำนวณ Factor F และ VAT อัตโนมัติ
- 📊 Price List มาตรฐาน 682 รายการ
- 🔐 ระบบ Authentication & Authorization
- 👥 Role-Based Access Control (RBAC)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript |
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
| [PRD.md](./PRD.md) | Product Requirements Document |
| [KNOWLEDGE_BASE.md](./KNOWLEDGE_BASE.md) | User guide & troubleshooting |
| [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) | Technical implementation details |
| [TECHNICAL.md](./TECHNICAL.md) | Developer technical reference |
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | Database tables and relationships |

### AI-Native Documentation (`docs/ai/`)
| Document | Description |
|----------|-------------|
| [AI_CONTEXT.md](./ai/AI_CONTEXT.md) | **START HERE** - AI agent rules and workflow |
| [PROJECT_CONTEXT.md](./ai/PROJECT_CONTEXT.md) | Business goals, users, domain terms |
| [DOMAIN_MODEL.md](./ai/DOMAIN_MODEL.md) | Entities, relationships, business rules |
| [SYSTEM_ARCHITECTURE.md](./ai/SYSTEM_ARCHITECTURE.md) | Tech stack, layers, data flow |
| [BOQ_CALCULATION_LOGIC.md](./ai/BOQ_CALCULATION_LOGIC.md) | How costs are calculated |
| [ROADMAP.md](./ai/ROADMAP.md) | Phase-based development plan |
| [HANDOFF.md](./ai/HANDOFF.md) | Session continuity template |
| [DECISIONS/ADR-001](./ai/DECISIONS/ADR-001-supabase-rls-authorization.md) | Why RLS for authorization |

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

