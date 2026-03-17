# Implementation Plan
## ระบบประมาณราคาท่อร้อยสายสื่อสารใต้ดิน (Conduit BOQ)

---

## 📋 Project Overview

**Current Version:** v1.2.0  
**Production URL:** Deployed on Vercel  

---

## 🏗️ Architecture

```
Next.js 16 + React 19 + TypeScript + Tailwind CSS 4
                    │
                    ▼
             SUPABASE (Auth + PostgreSQL + RLS)
                    │
                    ▼
                 VERCEL
```

---

## ✅ Phase 1: Foundation (COMPLETED v1.2.0)

- [x] Price list (518 items, 52 categories)
- [x] BOQ with multi-route support
- [x] Organizations, Departments, Sectors
- [x] Google OAuth + Auto-create profile
- [x] RLS policies + RBAC
- [x] Admin: approve/reject pending users
- [x] Onboarding flow with requested_* fields

---

## 🚧 Phase 2: Modernization & Versioning (PLANNED)

**Strategy:** Foundation → Output → Input → Governance

### 🔐 Key Integrity Rules

**Rule A: Versioning**
| Rule | Implementation |
|------|----------------|
| One default | `UNIQUE WHERE is_default = true` |
| Default = active | Constraint |
| Switch default = atomic | Transaction |
| Active-only BOQ | Trigger + log |
| Immutable version_id | Trigger + log |
| No duplicate items | `UNIQUE (version_id, item_code)` |

**Rule B: Snapshot**
- No auto-update: Changes don't affect existing BOQs
- BOQ = Frozen after creation
- Traceable: `source_model_id`, `cloned_from_boq_id`

---

### 📅 Phase 2A: Foundation
⛔ **Infrastructure only**

**Order:**
1. `price_list_versions` + seed "2568"
2. `price_list.version_id` + backfill + unique
3. `boq.price_list_version_id` + backfill + NOT NULL
4. `system_event_log` (use `created_at`)
5. Triggers + logging
6. UI/PDF version display

**Guardrails:**
- Backfill before NOT NULL
- Atomic default switch
- Log: `action`, `table_name`, `created_at` = NOT NULL

---

### 📈 Phase 2B: Reporting
- Summary per Dept/Sector (Read-only)
- Filters + PDF Export

**Copy/Requote:**
```
คัดลอก ▼
├─ คัดลอก BOQ (ราคาเดิม)
└─ Requote เป็นราคาปี...
```
- Requote → `cloned_from_boq_id = source`
- Requote → target `version.status = 'active'`
- Not found → costs = NULL

---

### 🧠 Phase 2C: Smart Estimation
- `source_model_id` NULLABLE + FK to `models`
- Wizard UI + Model CRUD

---

### 🔐 Phase 2D: Governance
- BOQ Audit Log
- Version Comparison

---

## 🔮 Phase 3: Enhancement (FUTURE)

- [ ] Approval workflow (draft → approved)
- [ ] Notifications
- [x] ~~PDF/Excel export with template~~ → ✅ Completed in v1.6.0 (Excel export via `exceljs`, see `lib/exportBoqExcel.ts`)
- [ ] PWA / Offline support
- [ ] Mobile-optimized UI

---

## 🗄️ Database Migrations

| File | Description | Status |
|------|-------------|--------|
| 001-006 | Phase 1 foundation | ✅ |
| 007 | Onboarding columns | ✅ v1.2.0 |
| 008 | RLS + Trigger + RPC | ✅ v1.2.0 |
| 009+ | Phase 2A versioning | ⏳ Planned |

---

## 🚀 Deployment

```bash
npm run dev      # Development
vercel --prod    # Production
```
