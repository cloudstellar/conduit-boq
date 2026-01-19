# Implementation Plan
## ระบบประมาณราคาท่อร้อยสายสื่อสารใต้ดิน (Conduit BOQ)

---

## 📋 Project Overview

**Status:** 🚧 v1.2.0 In Progress  
**Current Version:** v1.1.0  
**Next Release:** v1.2.0-admin-security  
**Production URL:** Deployed on Vercel  

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT                             │
│  Next.js 15 + React 19 + TypeScript + Tailwind CSS 4    │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    SUPABASE                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Auth      │  │  Database   │  │   Storage   │     │
│  │  (OAuth)    │  │ (PostgreSQL)│  │  (Future)   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                          │                              │
│                    ┌─────────────┐                      │
│                    │     RLS     │                      │
│                    │  Policies   │                      │
│                    └─────────────┘                      │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                      VERCEL                             │
│               (Hosting + Edge Functions)                │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
conduit-boq/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin panel
│   ├── api/               # API routes
│   ├── auth/              # Auth callback
│   ├── blocked/           # Blocked user page
│   ├── boq/               # BOQ pages
│   │   ├── [id]/          # View/Edit BOQ
│   │   └── create/        # Create BOQ
│   ├── login/             # Login page
│   ├── onboarding/        # Onboarding flow
│   ├── price-list/        # Price list viewer
│   └── profile/           # User profile
├── components/            # Reusable components
│   ├── auth/              # Auth components
│   └── boq/               # BOQ components
├── lib/                   # Libraries & utilities
│   ├── context/           # React contexts
│   ├── hooks/             # Custom hooks
│   ├── supabase/          # Supabase clients
│   └── types/             # TypeScript types
├── migrations/            # SQL migrations
├── scripts/               # Utility scripts
└── docs/                  # Documentation
```

---

## ✅ Phase 1: Foundation (COMPLETED)

### 1.1 Database Setup
- [x] Price list table with 518 items
- [x] BOQ table with ownership columns
- [x] BOQ routes table (multi-route support)
- [x] BOQ items table with route reference
- [x] Organizations, Departments, Sectors tables
- [x] User profiles table with roles

### 1.2 Authentication
- [x] Google OAuth integration
- [x] Auto-create user profile on signup
- [x] Onboarding flow for new users
- [x] Email domain restriction (optional)
- [x] Session management with middleware

### 1.3 Authorization
- [x] Row Level Security (RLS) policies
- [x] Client-side permission checks
- [x] Role-based access control (RBAC)
- [x] Separation of Duties

### 1.4 Core Features
- [x] Create/Edit/Delete BOQ
- [x] Multi-route BOQ support
- [x] Price list search & selection
- [x] Factor F calculation
- [x] VAT calculation
- [x] User profile management

### 1.5 Admin Features
- [x] User management (role, status)
- [x] Email domain restriction setting
- [x] Pending user approval

---

## 🔴 Sprint v1.2.0: Admin Permission Security (IN PROGRESS)

**Branch:** `feature/admin-permission-security`

### New Features
- [ ] Hybrid onboarding (requested_* → admin approve)
- [ ] Admin approve/reject RPC functions
- [ ] Trigger: lock org fields after onboarding
- [ ] RLS: pending users see own-only
- [ ] RLS: legacy BOQ admin-only

### Migrations
| File | Description |
|------|-------------|
| `007_add_requested_org_columns.sql` | Add 7 onboarding/audit columns |
| `008_rls_and_trigger.sql` | RLS + Trigger + RPC |

### Verification
- 10 security test cases in `scripts/test-rls-security.sql`
- See `docs/SECURITY.md` for access matrix

---

## 🚧 Phase 2: Workflow (PLANNED)

### 2.1 Approval Workflow
- [ ] BOQ status flow: draft → pending_review → pending_approval → approved
- [ ] Sector Manager: pending_review → pending_approval
- [ ] Dept Manager: pending_approval → approved
- [ ] Rejection with comments

### 2.2 Notifications
- [ ] Email notifications for approval requests
- [ ] In-app notification center
- [ ] Status change alerts

### 2.3 Committee Management
- [ ] Create procurement committees
- [ ] Assign members to committees
- [ ] Link approved BOQ to committees

### 2.4 Export & Reports
- [ ] PDF export with company template
- [ ] Excel export
- [ ] Summary reports by department/sector

---

## 🔮 Phase 3: Enhancement (FUTURE)

### 3.1 Advanced Features
- [ ] BOQ versioning/history
- [ ] BOQ templates
- [ ] Copy/Clone BOQ
- [ ] Batch operations

### 3.2 Mobile & Offline
- [ ] Progressive Web App (PWA)
- [ ] Offline support
- [ ] Mobile-optimized UI

### 3.3 Integrations
- [ ] NT internal systems
- [ ] Document management
- [ ] ERP integration

### 3.4 Analytics
- [ ] Dashboard with metrics
- [ ] Cost trends
- [ ] User activity reports

---

## 🗄️ Database Migrations

| File | Description | Status |
|------|-------------|--------|
| `001_backup_before_migration.sql` | Backup queries | ✅ |
| `002_add_multi_route_support.sql` | Multi-route tables | ✅ |
| `003_add_construction_area_to_routes.sql` | Route areas | ✅ |
| `004_phase1a_auth_ownership.sql` | Auth & ownership | ✅ |
| `005_phase1a_seed_and_rls.sql` | Seed data & RLS | ✅ |
| `006_phase1a_rls_write_and_approval.sql` | RLS policies | ✅ |
| `007_add_requested_org_columns.sql` | Onboarding columns | ⏳ v1.2.0 |
| `008_rls_and_trigger.sql` | RLS + Trigger + RPC | ⏳ v1.2.0 |

---

## 🔧 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...

# Optional
SUPABASE_SERVICE_ROLE_KEY=eyJhbG... (for admin operations)
```

---

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
- Push to `main` branch
- Vercel auto-deploys

### Manual Deploy
```bash
vercel --prod
```

---

## 📞 Contacts

- **Project Owner:** NT
- **Development:** Augment Agent
- **Hosting:** Vercel
- **Database:** Supabase (ap-south-1)

