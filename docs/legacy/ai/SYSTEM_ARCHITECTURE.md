> [!WARNING]
> **DEPRECATED:** This file has been migrated to the canonical documentation system.
> See [docs/canonical/ARCHITECTURE.md](../../canonical/ARCHITECTURE.md) for the authoritative version.
> This file is preserved for historical reference.

# System Architecture
## Conduit BOQ System

**Last Updated:** 2026-01-19

---

## 1. Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend Framework | Next.js | 15.x |
| UI Library | React | 19.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Backend | Supabase | - |
| Database | PostgreSQL | 15.x |
| Authentication | Supabase Auth | - |
| Hosting | Vercel | - |

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
│  │  (Google    │  │ (PostgreSQL)│  │     (Future)            │ │
│  │   OAuth)    │  │             │  │                         │ │
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
- `app/boq/create/page.tsx` - BOQ creation
- `app/boq/[id]/page.tsx` - BOQ view/edit
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

**Note:** RLS policies are the actual security layer

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
1. User clicks "Login with Google"
2. Redirect to Google OAuth
3. Google returns to /auth/callback
4. Supabase exchanges code for session
5. Middleware refreshes session cookies
6. onAuthStateChange fires
7. useUser hook fetches profile from user_profiles
8. User is authenticated
```

### 4.2 BOQ Creation Flow

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
- Google OAuth via Supabase Auth
- JWT tokens stored in httpOnly cookies
- Session refresh via middleware

### 5.2 Authorization
- **Client:** `can()` function for UI
- **Server:** RLS policies for data access

### 5.3 Data Isolation
- Users see only permitted data
- Organization → Department → Sector hierarchy
- Legacy data (no owner) visible to all

---

## 6. Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL     # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY    # Admin operations (optional)
```

