# Architecture
## Conduit BOQ System

**Last Updated:** 2026-10-23
**Status:** Canonical

<!-- RELEASE_ALIGNMENT_20261023 -->
> **Recorded release state — 2026-10-23:** dependency A (`a3114fc`) and
> [stale-Copy B](../06_engineering/STALE_COPY_B_RELEASE_CLOSEOUT_20261023.md) (`42e01c5` + Production 031 ledger `20261023063934`)
> are closed. [L1 Production result](../06_engineering/LIST_1B_L1_PRODUCTION_RELEASE_RESULT_20261023.md) records exact `b1ce449`,
> Ready/Current and bounded no-write smoke PASS at its observation time.
> B Production stale HTTP remains **NOT RUN**, closed rather than a pending
> test. Migrations **027–031 are immutable/no-replay**. Earlier dated
> pending/candidate/approval wording below preserves its own stage. This local
> documentation alignment makes no fresh Production observation and grants
> no runtime, DB, reset, migration or publication authority.

> **2026-10-14 reference boundary:** The diagrams, version table and flows below
> are the dated architecture baseline, not a fresh Production inventory. Use
> [Tech Stack](../06_engineering/TECH_STACK.md) for repository dependency versions
> and [Security Model](../04_data/SECURITY_MODEL.md) for current trusted controls.
> The application has Next.js server/API paths as well as browser-to-Supabase
> calls; a static-only web server or bare PostgreSQL is not an equivalent target.
> [Integrated Roadmap #09](../plans/product/09-integrated-roadmap-and-it-decision-handoff.md)
> records proposed internal-hosting/SSO discovery: IdP/protocol and IT data
> boundary remain unconfirmed. No target architecture or migration is approved.

---

## 1. Tech Stack

The table below preserves the 2026-05-30 architecture baseline. Repository
Next/config versions are now `16.4.2`; use the maintained Tech Stack for the
recorded dependency/runtime details rather than treating this old table as live.

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 16.1.1 |
| UI Library | React | 19.2.3 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Backend | Supabase | - |
| Database | PostgreSQL | 15.x |
| Authentication | Supabase Auth | - |
| Hosting | Vercel | - |

> **Authority:** See [06_engineering/TECH_STACK.md](../06_engineering/TECH_STACK.md) for definitive versions.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    Next.js App                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐│ │
│  │  │   Pages     │  │ Components  │  │     Hooks           ││ │
│  │  │  (app/)     │  │             │  │  (useUser, etc)     ││ │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘│ │
│  │                          │                                 │ │
│  │  ┌───────────────────────┴───────────────────────────────┐│ │
│  │  │              Supabase Client SDK                       ││ │
│  │  │   @supabase/ssr (createBrowserClient)                  ││ │
│  │  └───────────────────────────────────────────────────────┘│ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        VERCEL EDGE                              │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    Middleware                              │ │
│  │              (Auth session refresh)                        │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SUPABASE                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │    Auth     │  │  Database   │  │       Storage           │ │
│  │  (Email/    │  │ (PostgreSQL)│  │     (Future)            │ │
│  │   Password) │  │             │  │                         │ │
│  └─────────────┘  └──────┬──────┘  └─────────────────────────┘ │
│                          │                                      │
│                    ┌─────┴─────┐                                │
│                    │    RLS    │                                │
│                    │ Policies  │                                │
│                    └───────────┘                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Layer Responsibilities

### 3.1 Presentation Layer (`app/`, `components/`)

**Responsibilities:**
- Render UI components
- Handle user interactions
- Client-side form validation
- Permission-based UI display (using `can()`)

**Key Files:**
- `app/page.tsx` - Dashboard
- `app/boq/page.tsx` - L1 server-paged BOQ register
- `app/boq/create/page.tsx` - BOQ creation
- `app/boq/[id]/edit/page.tsx` - BOQ editor
- `app/admin/page.tsx` - Admin panel
- `components/boq/*` - BOQ-specific components

### 3.2 State Management (`lib/hooks/`, `lib/context/`)

**Responsibilities:**
- Manage authentication state
- Cache user profile
- Provide global context

**Key Files:**
- `lib/hooks/useUser.ts` - User auth state hook
- `lib/context/AuthContext.tsx` - Auth context provider

The released list uses `lib/boq/useBOQList.ts` with `list.ts` for one authorized
25-row page/exact-count request plus at most one complete route batch.
`listSession.ts` keeps the search/page/sort unit per actor; search is absent
from shared app URLs but may appear in Data API URLs/logs. Separate list/route
requests are not one DB snapshot; auth errors invalidate the list, while route
errors retain valid rows with unavailable badges.

### 3.3 Data Access (`lib/supabase/`)

**Responsibilities:**
- Create Supabase clients
- Manage auth sessions
- Execute database queries

**Key Files:**
- `lib/supabase/client.ts` - Browser client
- `lib/supabase/server.ts` - Server client (SSR)
- `lib/supabase/middleware.ts` - Session refresh

### 3.4 Authorization (`lib/permissions.ts`)

**Responsibilities:**
- Client-side permission checks
- UI display logic
- Separation of Duties enforcement

> **Important:** The `can()` function is for UI only. Current trusted controls
> include grants, RLS, protected-column triggers and guarded RPC bodies/ACLs,
> together with privileged server/API checks; RLS alone does not validate a
> `SECURITY DEFINER` function's authorization. See the Security Model above.

### 3.5 Database Layer (Supabase PostgreSQL)

**Responsibilities:**
- Data persistence
- Row Level Security (RLS)
- Triggers for automation
- Constraints and validation

---

## 4. Data Flow

### 4.1 Authentication Flow

```
1. User enters email and password on login page
2. Supabase Auth verifies credentials
3. Session token created and stored in cookies
4. Middleware refreshes session cookies on each request
5. onAuthStateChange fires
6. useUser hook fetches profile from user_profiles
7. User is authenticated
```

### 4.2 BOQ Creation Flow

The following is a simplified historical flow. Current graph Save uses the
guarded `save_boq_with_routes` RPC; whole-BOQ Copy uses
`duplicate_boq_atomic`. Do not implement either as a browser sequence of
header/route/item inserts. See [Database Schema](../04_data/DATABASE_SCHEMA.md)
and the current release results linked there.

```
1. User fills BOQ form
2. Form validation (client-side)
3. Supabase insert to `boq` table
4. RLS policy checks ownership permissions
5. If allowed, row is created
6. Routes and items inserted with boq_id
7. Totals calculated and saved
```

### 4.3 Permission Check Flow

```
1. UI calls can(user, action, resource)
2. Permission rules evaluated
3. UI shows/hides based on result
4. User attempts action
5. RLS policy enforces at database level
6. Action succeeds or fails
```

---

## 5. Security Model

### 5.1 Authentication

This lists the historical authentication design, not a current cookie-security
verification. Session configuration must be checked in the actual clients and
target deployment; organizational SSO remains proposed under #09.

- Email/Password via Supabase Auth
- JWT tokens stored in httpOnly cookies
- Session refresh via middleware
- Optional: NT domain restriction (@ntplc.co.th)

### 5.2 Authorization
- **Client:** `can()` function for UI
- **Server:** RLS policies for data access
- See [ADR-001](./ADR/ADR-001-supabase-rls-authorization.md)

### 5.3 Data Isolation
- Users see only permitted data
- Organization → Department → Sector hierarchy
- Legacy data (no owner) = Admin-only

---

## 6. Key Architecture Decisions

### ADR-001: Supabase RLS as Primary Authorization Layer

- **Status:** Accepted
- **Decision:** Use RLS for all authorization
- **Rationale:** Security by default, reduced API surface, single source of truth
- **Full document:** [ADR/ADR-001-supabase-rls-authorization.md](./ADR/ADR-001-supabase-rls-authorization.md)

### ADR-002: Versioned Master Catalog With Singleton Default Pointer

- **Status:** Proposed
- **Decision:** Version standard-price catalogs, retain BOQ snapshots, and use a singleton active-default pointer
- **Rationale:** Historical stability, deterministic defaults, and phased production hardening
- **Full document:** [ADR/ADR-002-versioned-master-catalog.md](./ADR/ADR-002-versioned-master-catalog.md)

---

## References

- Tech versions: [06_engineering/TECH_STACK.md](../06_engineering/TECH_STACK.md)
- Security: [04_data/SECURITY_MODEL.md](../04_data/SECURITY_MODEL.md)
- Original: [docs/legacy/ai/SYSTEM_ARCHITECTURE.md](../legacy/ai/SYSTEM_ARCHITECTURE.md)
