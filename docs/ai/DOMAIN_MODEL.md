# Domain Model
## Conduit BOQ System

**Last Updated:** 2026-01-19

---

## 1. Entity Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORGANIZATION DOMAIN                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │ Organization │─1:N│  Department  │─1:N│    Sector    │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│                                                │                │
│                                          ┌─────┴─────┐          │
│                                          │UserProfile│          │
│                                          └─────┬─────┘          │
└────────────────────────────────────────────────┼────────────────┘
                                                 │
┌────────────────────────────────────────────────┼────────────────┐
│                       BOQ DOMAIN               │                │
│                                          ┌─────┴─────┐          │
│  ┌───────────┐                           │    BOQ    │          │
│  │ PriceList │                           └─────┬─────┘          │
│  └─────┬─────┘                                 │                │
│        │                               ┌───────┴───────┐        │
│        │                               │   BOQRoute    │        │
│        │                               └───────┬───────┘        │
│        │                                       │                │
│        │                               ┌───────┴───────┐        │
│        └───────────────────────────────│   BOQItem     │        │
│                                        └───────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Entity Definitions

### 2.1 Organization

**Purpose:** Top-level organizational unit (company)

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| name | Text | Yes | Organization name |
| code | Text | No | Short code (e.g., "NT") |
| is_active | Boolean | Yes | Active status |

**Default:** One organization: "NT"

---

### 2.2 Department (ฝ่าย)

**Purpose:** Division within organization

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| org_id | UUID | No | FK to Organization |
| code | Text | Yes | Department code |
| name | Text | Yes | Short name |
| full_name | Text | No | Full official name |
| is_active | Boolean | Yes | Active status |

**Constraint:** Unique (org_id, code)

---

### 2.3 Sector (ส่วน)

**Purpose:** Sub-division within department

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| department_id | UUID | Yes | FK to Department |
| code | Text | Yes | Sector code |
| name | Text | Yes | Short name |
| full_name | Text | No | Full official name |
| is_active | Boolean | Yes | Active status |

**Constraint:** Unique (department_id, code)

---

### 2.4 UserProfile

**Purpose:** Extended user information beyond Supabase Auth

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | PK, FK to auth.users |
| employee_id | Text | No | Employee number |
| first_name | Text | Yes | First name |
| last_name | Text | Yes | Last name |
| title | Text | No | Prefix (นาย/นาง/นางสาว) |
| position | Text | No | Job title |
| role | Enum | Yes | User role |
| status | Enum | Yes | Account status |
| org_id | UUID | No | FK to Organization |
| department_id | UUID | No | FK to Department |
| sector_id | UUID | No | FK to Sector |
| email | Text | No | Email address |
| phone | Text | No | Phone number |

**Role Values:** admin, dept_manager, sector_manager, staff, procurement  
**Status Values:** active, inactive, suspended, pending

---

### 2.5 BOQ (ใบประมาณราคา)

**Purpose:** Bill of Quantities header/master record

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| project_name | Text | Yes | Project name |
| estimator_name | Text | Yes | Estimator name |
| document_date | Date | Yes | Document date |
| boq_number | Text | No | BOQ reference number |
| status | Enum | Yes | Workflow status |
| factor_f | Decimal | No | Factor F value |
| total_cost | Decimal | Yes | Sum before Factor F |
| total_with_factor_f | Decimal | Yes | Sum × Factor F |
| total_with_vat | Decimal | Yes | Sum including VAT 7% |
| created_by | UUID | No | FK to auth.users |
| org_id | UUID | No | Inherited from creator |
| department_id | UUID | No | Inherited from creator |
| sector_id | UUID | No | Inherited from creator |

**Status Values:** draft, submitted, approved

**Invariant:** `total_with_vat = total_with_factor_f × 1.07`

---

### 2.6 BOQRoute (เส้นทาง)

**Purpose:** Physical route within a BOQ

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| boq_id | UUID | Yes | FK to BOQ (CASCADE) |
| route_name | Text | Yes | Route name |
| route_order | Integer | Yes | Sort order |
| construction_area | Text | No | Area description |

**Invariant:** One BOQ can have 1 to N routes

---

### 2.7 BOQItem (รายการ)

**Purpose:** Line item in a route

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| boq_id | UUID | Yes | FK to BOQ (CASCADE) |
| route_id | UUID | No | FK to BOQRoute (CASCADE) |
| price_list_id | UUID | No | FK to PriceList |
| item_name | Text | Yes | Item description |
| quantity | Decimal | Yes | Quantity |
| unit | Text | Yes | Unit of measure |
| material_cost_per_unit | Decimal | Yes | Material unit cost |
| labor_cost_per_unit | Decimal | Yes | Labor unit cost |
| total_cost | Decimal | Yes | Calculated total |
| item_order | Integer | Yes | Sort order |

**Invariant:** `total_cost = quantity × (material_cost_per_unit + labor_cost_per_unit)`

---

### 2.8 PriceList (บัญชีราคา)

**Purpose:** Standard unit prices for materials and labor

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| item_code | Text | Yes | Reference code |
| item_name | Text | Yes | Item description |
| unit | Text | Yes | Unit of measure |
| material_cost | Decimal | Yes | Material cost per unit |
| labor_cost | Decimal | Yes | Labor cost per unit |
| unit_cost | Decimal | Yes | Total per unit |
| category | Text | No | Category grouping |
| is_active | Boolean | Yes | Active status |

**Invariant:** `unit_cost = material_cost + labor_cost`
**Data:** 518 items across 52 categories

---

### 2.9 FactorReference

**Purpose:** Lookup table for Factor F calculation

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| cost_million | Decimal | Yes | Cost threshold (millions) |
| factor | Decimal | Yes | Base factor |
| factor_f | Decimal | Yes | Factor F value |

**Note:** Factor F is interpolated between rows based on cost_million

---

## 3. Domain Rules

### 3.1 Ownership Rules

1. **BOQ Ownership**: When created, BOQ inherits `org_id`, `department_id`, `sector_id` from creator's profile
2. **Legacy Data**: BOQs with `created_by = NULL` are accessible by all authenticated users
3. **Immutable Ownership**: Once set, ownership fields should not change

### 3.2 Access Rules

1. **Hierarchical Access**: Higher roles can see lower levels
   - Admin → All
   - Dept Manager → Department + below
   - Sector Manager → Sector + below
   - Staff → Own + same sector
   - Procurement → Approved only (read)

2. **Assigned Access**: BOQ can be assigned to another user (`assigned_to`)

### 3.3 Workflow Rules

1. **Draft**: Only creator can edit
2. **Submitted**: Locked for review
3. **Approved**: Read-only for all

### 3.4 Separation of Duties

**CRITICAL:** `created_by` ≠ `approver` for same BOQ

---

## 4. What Must NOT Be Misinterpreted

| Concept | Correct | Wrong |
|---------|---------|-------|
| Factor F | Multiplier applied to total | NOT an item-level markup |
| Route | Physical path for conduit | NOT a workflow route |
| Unit Cost | material + labor | NOT material only |
| Sector | Organizational unit | NOT geographic sector |
| Status | Workflow state | NOT active/inactive toggle |

---

## 5. Relationships Summary

```
Organization 1──N Department 1──N Sector 1──N UserProfile
                                         │
                                         │ creates
                                         ▼
                                   BOQ 1──N BOQRoute 1──N BOQItem
                                                              │
                                                              │ references
                                                              ▼
                                                          PriceList
```

