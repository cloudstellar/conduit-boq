# System Layers
## Conduit BOQ System — Developer Guide

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

> **2026-10-14 reference boundary:** The examples below are a dated developer
> baseline, not current schema/RLS specifications or executable migration
> guidance. Follow [Database Schema](../04_data/DATABASE_SCHEMA.md) and
> [Security Model](../04_data/SECURITY_MODEL.md) for the implemented contracts.
> Hosting/SSO readiness and proposed changes are tracked in
> [Integrated Roadmap #09](../plans/product/09-integrated-roadmap-and-it-decision-handoff.md);
> IdP/protocol and internal-hosting policy remain unconfirmed.

---

## 1. Client-Server Flow

The arrow chain is simplified: browser clients also call Supabase Auth/Data API
directly, while Next.js server/API code uses Supabase separately. Both browser
and server must reach the configured HTTPS API. PostgreSQL grants/RLS/triggers
and guarded RPC bodies/ACLs enforce data access, not the hosting location.

```
Browser → Next.js (Vercel) → Supabase (PostgreSQL + Auth)
                ↓
         RLS Policies (Security)
```

---

The L1 list controller/query/session modules live under `lib/boq/`. Both
responsive layouts share one controller; badges consume its page-route batch
without per-row/per-click requests. Exact count and route completeness remain
RLS-filtered; a truncated/error response is unavailable, not a fabricated count.
The two requests do not share a database snapshot. This client release did not
add a table, view, index or privileged RPC.

## 2. Key Patterns

### 2.1 Supabase Client Creation

**Client-side (Browser):**
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Server-side (SSR):**
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { /* cookie handlers */ } }
  )
}
```

### 2.2 Auth State Management

> [!CAUTION]
> **Critical Pattern — Avoid Deadlock**

```typescript
// lib/hooks/useUser.ts
supabase.auth.onAuthStateChange((event, session) => {
  // IMPORTANT: Use setTimeout to avoid deadlock
  // Making async Supabase calls inside this callback
  // will hang if not wrapped in setTimeout
  setTimeout(() => {
    handleSession(session)
  }, 0)
})
```

**Why?** The `onAuthStateChange` callback blocks while waiting for async operations. If those operations need the callback to complete first, you get a deadlock.

### 2.3 Permission Checks

**Client-side (UI display):**
```typescript
import { can } from '@/lib/permissions'

// Check if user can create BOQ
if (can(user, 'create', 'boq')) {
  // Show create button
}

// Check with context
if (can(user, 'update', 'boq', { created_by: boq.created_by })) {
  // Show edit button
}
```

**Server-side (RLS):**
RLS policies in PostgreSQL enforce actual security. Client-side checks are for UI only.

---

## 3. Database Schema Overview

### BOQ Tables

```sql
-- BOQ Header
CREATE TABLE boq (
  id UUID PRIMARY KEY,
  project_name TEXT NOT NULL,
  estimator_name TEXT,
  document_date DATE,
  department TEXT,
  status TEXT DEFAULT 'draft',
  factor_f DECIMAL(10,4) DEFAULT 1.0,
  -- Ownership
  created_by UUID REFERENCES auth.users(id),
  org_id UUID REFERENCES organizations(id),
  department_id UUID REFERENCES departments(id),
  sector_id UUID REFERENCES sectors(id),
  -- Audit
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- BOQ Routes
CREATE TABLE boq_routes (
  id UUID PRIMARY KEY,
  boq_id UUID REFERENCES boq(id) ON DELETE CASCADE,
  route_name TEXT NOT NULL,
  construction_area TEXT,
  sort_order INTEGER DEFAULT 0
);

-- BOQ Items
CREATE TABLE boq_items (
  id UUID PRIMARY KEY,
  boq_id UUID REFERENCES boq(id) ON DELETE CASCADE,
  route_id UUID REFERENCES boq_routes(id) ON DELETE CASCADE,
  item_no TEXT,
  description TEXT,
  unit TEXT,
  quantity DECIMAL,
  material_unit_cost DECIMAL,
  labor_unit_cost DECIMAL,
  sort_order INTEGER
);
```

> **Full schema:** See [04_data/DATABASE_SCHEMA.md](../04_data/DATABASE_SCHEMA.md)

---

## 4. RLS Policy Example

> **Historical illustration — do not copy or execute.** In particular,
> `OR created_by IS NULL` below does not restrict legacy rows to active Admins.
> Applied P-49 controls and migration 030 take precedence; permission helpers
> and this old excerpt are not a substitute for the current Security Model.

```sql
CREATE POLICY "Users can read own and sector BOQs"
ON boq FOR SELECT
USING (
  created_by = auth.uid()
  OR sector_id = (SELECT sector_id FROM user_profiles WHERE id = auth.uid())
  OR created_by IS NULL  -- Legacy data (admin-only in v1.2.0)
);
```

---

## 5. Testing Checklist

### Manual Testing
- [ ] Verify the current email/password login and session path; test organizational SSO only after its own approved candidate exists
- [ ] Create new BOQ
- [ ] Add routes and items
- [ ] Save and reload
- [ ] Check permissions for different roles

---

## 6. Common Issues

### Issue: Infinite loading after login
**Cause:** Deadlock in `onAuthStateChange` callback  
**Solution:** Wrap async operations in `setTimeout(() => {}, 0)`

### Issue: RLS blocking queries
**Cause:** Missing or incorrect RLS policies  
**Solution:** Check policies with `SELECT * FROM pg_policies`

### Issue: Session not persisting
**Cause:** Cookie not being set correctly  
**Solution:** Check middleware and cookie configuration

---

## References

- Original: [docs/legacy/TECHNICAL.md](../legacy/TECHNICAL.md)
- Architecture: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Permissions: [06_engineering/PERMISSION_PATTERNS.md](../06_engineering/PERMISSION_PATTERNS.md)
