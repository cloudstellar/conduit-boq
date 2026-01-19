# Roadmap
## Conduit BOQ System

**Last Updated:** 2026-01-19

---

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Phase 1 (COMPLETED)     │  Phase 2 (PLANNED)   │  Phase 3     │
│  Foundation              │  Workflow            │  Enhancement │
│                          │                      │              │
│  ✅ Auth                 │  □ Approval flow     │  □ Versioning│
│  ✅ BOQ CRUD             │  □ Notifications     │  □ Mobile    │
│  ✅ Multi-Route          │  □ Committee mgmt    │  □ PWA       │
│  ✅ Price List           │  □ PDF/Excel export  │  □ Analytics │
│  ✅ Factor F             │  □ Rejection flow    │  □ Integration│
│  ✅ RLS                  │                      │              │
│  ✅ Admin Panel          │                      │              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Foundation ✅ COMPLETED

**Goal:** Core BOQ functionality with authentication and authorization

### 1.1 Authentication
- [x] Google OAuth integration
- [x] Auto-create user profile on signup
- [x] Onboarding flow for new users
- [x] Email domain restriction (optional)
- [x] Session management with middleware

### 1.2 Authorization
- [x] Row Level Security (RLS) policies
- [x] Client-side permission checks (`can()`)
- [x] Role-based access control (RBAC)
- [x] Separation of Duties

### 1.3 BOQ Management
- [x] Create BOQ with project details
- [x] Multi-route support (1:N routes per BOQ)
- [x] Add items from price list
- [x] Calculate totals automatically
- [x] Edit and delete BOQ (with permissions)

### 1.4 Price List
- [x] 518 standard items
- [x] 52 categories
- [x] Search and filter
- [x] Read-only display

### 1.5 Factor F
- [x] Factor reference table
- [x] Interpolation calculation
- [x] VAT calculation (7%)

### 1.6 Admin Panel
- [x] User management
- [x] Role assignment
- [x] Status management (active/pending/suspended)
- [x] Email domain settings

### 1.7 Organization Structure
- [x] Organizations, Departments, Sectors tables
- [x] User assignment to sector
- [x] Hierarchical access control

---

## Phase 2: Workflow (PLANNED)

**Goal:** Approval workflow and document management

### 2.1 Approval Workflow
- [ ] BOQ status flow: draft → pending_review → pending_approval → approved
- [ ] Sector Manager review (pending_review → pending_approval)
- [ ] Dept Manager approval (pending_approval → approved)
- [ ] Rejection with comments

### 2.2 Notifications
- [ ] Email notifications for approval requests
- [ ] In-app notification center
- [ ] Status change alerts
- [ ] Due date reminders

### 2.3 Committee Management
- [ ] Create procurement committees
- [ ] Assign members to committees
- [ ] Link approved BOQ to committees
- [ ] Committee meeting records

### 2.4 Export & Reports
- [ ] PDF export with company template
- [ ] Excel export
- [ ] Summary reports by department/sector
- [ ] Cost analysis reports

---

## Phase 3: Enhancement (FUTURE)

**Goal:** Mobile support, integrations, and analytics

### 3.1 Advanced BOQ Features
- [ ] BOQ versioning/history
- [ ] BOQ templates
- [ ] Copy/Clone BOQ
- [ ] Batch operations
- [ ] BOQ comparison

### 3.2 Mobile & Offline
- [ ] Progressive Web App (PWA)
- [ ] Offline data entry
- [ ] Mobile-optimized UI
- [ ] Field data collection

### 3.3 Integrations
- [ ] NT internal systems
- [ ] Document management system
- [ ] ERP integration
- [ ] GIS/Mapping integration

### 3.4 Analytics
- [ ] Dashboard with metrics
- [ ] Cost trends over time
- [ ] User activity reports
- [ ] Budget vs actual analysis

---

## Out of Scope (Not Planned)

These features are explicitly NOT in any phase:

1. **Inventory Management** - Tracking physical materials
2. **Vendor Management** - Supplier database and pricing
3. **Purchase Orders** - Actual procurement execution
4. **Field Operations** - Work orders, crew scheduling
5. **Asset Management** - Installed asset tracking
6. **Billing/Invoicing** - Financial transactions

---

## Dependencies

### Phase 2 Dependencies
- Phase 1 must be stable in production
- User adoption feedback collected
- Approval workflow requirements finalized

### Phase 3 Dependencies
- Phase 2 workflow proven
- Mobile usage patterns identified
- Integration APIs available from NT

