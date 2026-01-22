# Change Process
## Conduit BOQ System

> **Status:** DRAFT – CANONICAL SKELETON  
> **Last Updated:** 2026-01-22

---

## 1. Database Changes

### Migration Workflow
1. Create migration file in `/migrations/`
2. Test on development branch
3. Get owner approval
4. Apply to production

### Guardrails
- Backfill BEFORE `SET NOT NULL`
- Log columns NOT NULL: `action`, `table_name`, `created_at`
- Atomic transactions for schema changes

## 2. Code Changes

### Before Writing Code
- [ ] Read relevant existing code
- [ ] Check for existing patterns
- [ ] Verify database schema assumptions
- [ ] Identify downstream changes

### After Writing Code
- [ ] Verify no TypeScript errors
- [ ] Check imports are correct
- [ ] Ensure consistency with patterns
- [ ] Update tests if applicable

---

## References
- Migration Guide: [04_data/MIGRATIONS.md](../04_data/MIGRATIONS.md)
