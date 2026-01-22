# System Layers
## Conduit BOQ System — Developer Guide

**Last Updated:** 2026-01-22  
**Status:** Canonical

---

## 1. Client-Server Flow

```
Browser → Next.js (Vercel) → Supabase (PostgreSQL + Auth)
                ↓
         RLS Policies (Security)
```

---

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
- [ ] Login with Google
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
