# Permission Patterns
## Conduit BOQ System

**Last Updated:** 2026-01-22  
**Status:** Canonical

---

## 1. Client-Side Permission Check

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

// Check approval (separation of duties)
if (can(user, 'approve', 'boq', { created_by: boq.created_by })) {
  // Show approve button (blocked if user is creator)
}
```

---

## 2. Actions & Resources

### Available Actions
- `create` — Create new record
- `read` — View record
- `update` — Edit record
- `delete` — Remove record
- `approve` — Approve BOQ
- `assign_committee` — Assign review committee

### Resources
- `boq` — Bill of Quantities
- `user` — User management
- `price_list` — Price list
- `committee` — Review committee
- `profile` — User profile

---

## 3. BOQ Context Interface

```typescript
interface BOQContext {
  created_by?: string | null
  assigned_to?: string | null
  sector_id?: string | null
  department_id?: string | null
  status?: string
}
```

---

## 4. Role-Based Rules

### Admin
- Can do everything
- Cannot approve own BOQ (separation of duties)

### Dept Manager
- Full access to department BOQs
- Can approve BOQs in department (if not creator)

### Sector Manager
- Full access to sector BOQs
- Read access to department BOQs
- Can approve BOQs in sector (if not creator)

### Staff
- Full access to own BOQs
- Read access to same sector BOQs
- Cannot approve

### Procurement
- Read-only on approved BOQs in department

### Pending
- Own BOQ only (create, read, update)
- Cannot delete own BOQ
- Cannot approve

---

## 5. Key Rules

### Separation of Duties
```typescript
// Creator cannot approve own BOQ
if (action === 'approve' && context?.created_by === user.id) {
  return false
}
```

### Legacy Data
```typescript
// Legacy BOQs (created_by = NULL) are admin-only
// This is enforced by RLS, not just permissions.ts
const isLegacy = context?.created_by === null
```

> [!WARNING]
> RLS is the source of truth. The `can()` function is for UI display only.

---

## 6. Status-Based Rules

| User Status | Effect |
|-------------|--------|
| `active` | Full role permissions |
| `pending` | Own BOQ only |
| `inactive` | No access |
| `suspended` | No access |

---

## References

- Access Model: [03_domain/ACCESS_MODEL.md](../03_domain/ACCESS_MODEL.md)
- Code: `lib/permissions.ts`
