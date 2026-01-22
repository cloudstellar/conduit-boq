# Domain Rules
## Conduit BOQ System

**Last Updated:** 2026-01-22  
**Status:** Canonical

---

## 1. Business Goals

### Primary Goal
Provide NT (National Telecom Thailand) staff with a web-based tool to create accurate **Bill of Quantities (BOQ)** for underground conduit infrastructure projects.

### Success Metrics

| Metric | Target |
|--------|--------|
| Time to create BOQ | < 30 minutes (from 2-3 hours manual) |
| Calculation accuracy | 100% (using standard price list) |
| User adoption | 80% of BOQ-creating staff |
| System uptime | 99.5% |

---

## 2. Non-Goals

These are explicitly **NOT** in scope:

1. **Inventory management** - No tracking of actual materials
2. **Procurement execution** - No purchase orders or vendor management
3. **Field operations** - No work order or crew dispatch
4. **External integrations** - No API for third-party systems (Phase 3)
5. **Mobile-first design** - Desktop-primary, mobile responsive later
6. **Offline support** - Requires internet connection (PWA in Phase 3)

---

## 3. Organization Structure

```
Organization (องค์กร) — NT
└── Department (ฝ่าย)
    └── Sector (ส่วน)
        └── Staff (พนักงาน)
```

**Hierarchy Rules:**
- Users belong to exactly one Sector
- Sector belongs to exactly one Department
- Department belongs to exactly one Organization
- Visibility and permissions follow this hierarchy

---

## 4. Core Domain Terms

### 4.1 BOQ Terminology

| Term | Thai | Definition |
|------|------|------------|
| **BOQ** | ใบประมาณราคา | Bill of Quantities - a cost estimate document |
| **Route** | เส้นทาง | A physical path for conduit installation |
| **Item** | รายการ | A line item in the BOQ (material or labor) |
| **Price List** | บัญชีราคา | Standard unit prices (518 items, 52 categories) |
| **Factor F** | แฟกเตอร์ F | Cost adjustment coefficient |

### 4.2 Cost Terminology

| Term | Thai | Definition |
|------|------|------------|
| **Material Cost** | ค่าวัสดุ | Cost of physical materials |
| **Labor Cost** | ค่าแรง | Cost of installation labor |
| **Unit Cost** | ราคาต่อหน่วย | Material + Labor per unit |
| **Factor F** | ค่าสัมประสิทธิ์ | Markup for overhead, profit, interest |
| **VAT** | ภาษีมูลค่าเพิ่ม | Value Added Tax (fixed at 7%) |

### 4.3 Status Terminology

| Status | Thai | When |
|--------|------|------|
| `draft` | ร่าง | Being edited, not submitted |
| `submitted` | ส่งแล้ว | Submitted for review |
| `approved` | อนุมัติแล้ว | Approved by manager |

> **Note:** `rejected` status is planned for Phase 3 (Approval Workflow).

---

## 5. Key Business Rules

### 5.1 Ownership Rules

- BOQ is owned by its creator (`created_by`)
- BOQ inherits creator's `org_id`, `department_id`, `sector_id`
- Once set, these ownership fields are **immutable**
- Legacy BOQs (before auth system) have `created_by = NULL` → **Admin-only access**

### 5.2 Separation of Duties

> [!IMPORTANT]
> **Creator cannot approve their own BOQ**

This is enforced in both:
- **UI:** `can()` function in `lib/permissions.ts`
- **Database:** RLS policies

### 5.3 Access Hierarchy

| Role | Access Level |
|------|--------------|
| Admin | All BOQs |
| Dept Manager | Department + all sectors below |
| Sector Manager | Own sector + read department |
| Staff | Own BOQs + same sector (read) |
| Procurement | Approved BOQs only (read-only) |

### 5.4 Domain Restriction (Optional)

- Can restrict login to `@ntplc.co.th` emails only
- Configured via `app_settings` table
- Key: `allowed_email_domains`

---

## 6. External Dependencies

| System | Purpose | Integration |
|--------|---------|-------------|
| Google OAuth | Authentication | Via Supabase Auth |
| Supabase | Database + Auth + RLS | Direct SDK |
| Vercel | Hosting | Auto-deploy from main |

---

## 7. Contact

- **Project Owner:** NT (National Telecom Thailand)
- **Support Email:** suthorn@ntplc.co.th

---

## References

- Domain Model: [DOMAIN_MODEL.md](./DOMAIN_MODEL.md)
- Access Model: [ACCESS_MODEL.md](./ACCESS_MODEL.md)
- Original: [docs/legacy/ai/PROJECT_CONTEXT.md](../legacy/ai/PROJECT_CONTEXT.md)
