# ADR-001: Supabase RLS as Primary Authorization Layer

**Status:** Accepted  
**Date:** 2026-01-19  
**Decision Makers:** Development Team

---

## Context

The Conduit BOQ system requires authorization to control:
1. Which users can view which BOQs
2. Who can edit, delete, or approve BOQs
3. Access based on organizational hierarchy (Org → Dept → Sector)
4. Separation of Duties (creator ≠ approver)

### Options Considered

1. **API Middleware Authorization**
   - All database access through API routes
   - Middleware checks permissions before query
   - More control, more code

2. **Supabase Row Level Security (RLS)**
   - Database-level policies
   - Direct client-to-database queries
   - Less code, enforced at database layer

3. **Hybrid Approach**
   - RLS for read operations
   - API middleware for write operations
   - Complex, two authorization systems

---

## Decision

**Use Supabase RLS as the primary authorization layer.**

All authorization is enforced through PostgreSQL RLS policies. Client applications query the database directly via Supabase SDK, and RLS policies determine what data is accessible.

---

## Rationale

### Why RLS?

1. **Security by Default**
   - Even if frontend code has bugs, data is protected
   - Policies are evaluated at database level
   - Cannot be bypassed by client code

2. **Reduced API Surface**
   - No need for API routes for every data operation
   - Direct Supabase SDK calls from client
   - Faster development

3. **Single Source of Truth**
   - Authorization logic in one place (database)
   - No sync issues between API and frontend rules
   - Easier to audit

4. **Performance**
   - Policies use database indexes
   - No extra network hop to API
   - PostgreSQL optimizes policy evaluation

5. **Supabase Alignment**
   - This is the recommended Supabase pattern
   - Well-documented and supported
   - Active community

### Why Not API Middleware?

1. **More Code to Maintain**
   - Every operation needs an API route
   - Duplicate authorization logic
   - More surface for bugs

2. **Performance Overhead**
   - Extra network hop (client → API → database)
   - API cold starts on serverless

3. **Already Using Supabase**
   - Would need custom API layer
   - Loses Supabase SDK benefits
   - More infrastructure complexity

---

## Consequences

### Positive

- ✅ Simpler architecture
- ✅ Security enforced at database level
- ✅ Faster development time
- ✅ Better performance (direct queries)
- ✅ Aligned with Supabase best practices

### Negative

- ⚠️ Complex policies can be hard to debug
- ⚠️ Policy changes require database migration
- ⚠️ Limited error messages (generic "permission denied")
- ⚠️ All team members need to understand RLS

### Mitigations

1. **Testing RLS Policies**
   - Create test users with different roles
   - Verify access in Supabase dashboard
   - Document expected behavior

2. **Debugging**
   - Use `pg_policies` view to inspect policies
   - Test with `SET ROLE` in SQL console
   - Log policy violations

3. **Documentation**
   - All policies documented in DATABASE_SCHEMA.md
   - Migration files annotated
   - Policy rationale in comments

---

## Implementation

### Current RLS Policies (Phase 1)

**BOQ Table:**
- Admin: Full access
- Dept Manager: Department scope
- Sector Manager: Sector + department read
- Staff: Own + assigned + same sector
- Procurement: Department read-only
- Legacy data (null owner): All authenticated

**User Profiles:**
- Users can read own profile
- Admin can read/update all
- Managers can read profiles in hierarchy

### Policy Location

- `migrations/005_phase1a_seed_and_rls.sql`
- `migrations/006_phase1a_rls_write_and_approval.sql`

---

## Related Decisions

- Client-side `can()` function for UI only (see `lib/permissions.ts`)
- Separation of Duties enforced in both RLS and UI
- Legacy data handling (null owner = visible to all)

---

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

