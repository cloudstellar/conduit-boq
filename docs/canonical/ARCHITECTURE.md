# Architecture
## Conduit BOQ System — Canonical Reference

**Last Updated:** 2026-01-22  
**Status:** Canonical  
**Source:** Migrated from `docs/ai/SYSTEM_ARCHITECTURE.md`, `docs/TECHNICAL.md`, `docs/ai/DECISIONS/ADR-001*.md`

---

## 1. High-Level Architecture

> **Source:** [SYSTEM_ARCHITECTURE.md](file:///Users/cloud/Cloudstellar/conduit-boq/docs/legacy/ai/SYSTEM_ARCHITECTURE.md) Section 2

```
Browser → Next.js (Vercel) → Supabase (PostgreSQL + Auth)
                 ↓
          RLS Policies (Security)
```

---

## 2. Layer Responsibilities

> **Source:** [SYSTEM_ARCHITECTURE.md](file:///Users/cloud/Cloudstellar/conduit-boq/docs/legacy/ai/SYSTEM_ARCHITECTURE.md) Section 3

### 2.1 Presentation Layer (`app/`, `components/`)
### 2.2 State Management (`lib/hooks/`, `lib/context/`)
### 2.3 Data Access (`lib/supabase/`)
### 2.4 Authorization (`lib/permissions.ts`)
### 2.5 Database Layer (Supabase PostgreSQL)

---

## 3. Data Flow

> **Source:** [SYSTEM_ARCHITECTURE.md](file:///Users/cloud/Cloudstellar/conduit-boq/docs/legacy/ai/SYSTEM_ARCHITECTURE.md) Section 4

### 3.1 Authentication Flow
### 3.2 BOQ Creation Flow
### 3.3 Permission Check Flow

---

## 4. Security Model

> **Source:** [SYSTEM_ARCHITECTURE.md](file:///Users/cloud/Cloudstellar/conduit-boq/docs/legacy/ai/SYSTEM_ARCHITECTURE.md) Section 5

### 4.1 Authentication
### 4.2 Authorization
### 4.3 Data Isolation

---

## 5. Key Architecture Decisions

> **Source:** [ADR-001-supabase-rls-authorization.md](file:///Users/cloud/Cloudstellar/conduit-boq/docs/ai/DECISIONS/ADR-001-supabase-rls-authorization.md)

### ADR-001: Supabase RLS as Primary Authorization Layer
- **Status:** Accepted
- **Decision:** Use RLS for all authorization
- **Rationale:** Security by default, reduced API surface, single source of truth

---

## References

- Original: [docs/ai/SYSTEM_ARCHITECTURE.md](file:///Users/cloud/Cloudstellar/conduit-boq/docs/legacy/ai/SYSTEM_ARCHITECTURE.md)
- Original: [docs/TECHNICAL.md](file:///Users/cloud/Cloudstellar/conduit-boq/docs/legacy/TECHNICAL.md)
- ADR: [docs/ai/DECISIONS/ADR-001-supabase-rls-authorization.md](file:///Users/cloud/Cloudstellar/conduit-boq/docs/ai/DECISIONS/ADR-001-supabase-rls-authorization.md)
