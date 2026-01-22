# Lessons Learned & AI Constitution
## Conduit BOQ System

**Last Updated:** 2026-01-22  
**Status:** Living Document (Update constantly)

> [!IMPORTANT]
> **AI Must Read This First:** This file contains critical lessons learned from past mistakes. Ignoring these rules causes regressions.

---

## 1. Critical Technical Rules (The Constitution)

### 1.1 Auth & Deadlocks
- **Rule:** NEVER call async Supabase functions directly inside `onAuthStateChange`.
- **Reason:** It causes a deadlock where the auth state never resolves.
- **Fix:** Always wrap async logic in `setTimeout(() => { ... }, 0)`.

```typescript
// ✅ CORRECT PATTERN
supabase.auth.onAuthStateChange((event, session) => {
  setTimeout(async () => {
    await handleSession(session)
  }, 0)
})
```

### 1.2 Factor F Calculation
- **Rule:** **Truncate** to 4 decimal places. DO NOT ROUND.
- **Reason:** Legal/Financial requirement.
- **Implementation:** `Math.floor(value * 10000) / 10000`
- **Reference:** [FACTOR_F.md](../05_calculation/FACTOR_F.md)

### 1.3 Database Schema vs Migrations
- **Lesson:** Metadata in documentation might mismatch actual DB if migrations were manual.
- **Rule:** Always trust `migrations/*.sql` as the source of truth, but verified against production DB if discrepancies arise (like `onboarding_completed` column).

---

## 2. Documentation Patterns

### 2.1 Canonical Source of Truth
- We use a **01-08 Numbered Folder Structure**.
- **DO NOT** create documents outside this structure without approval.
- **DO NOT** duplicate logic across files. Link to the canonical file instead.

### 2.2 Status Mismatches
- **BOQ Status:** `draft`, `submitted`, `approved` (Phase 1)
  - *Note:* Code might contain `pending_review`/`pending_approval` for future Phase 3. Treat them as reserved/future.
- **User Status:** `active`, `pending`, `inactive`, `suspended`

---

## 3. Workflow & Process

### 3.1 Migration File Naming
- Use prefix `XXX_` (e.g., `007_`, `008_`).
- If inserting between phases, use suffix letters (e.g., `007b_`).
- **Lesson:** We accidentally had two `008_` files. Use suffixes to fix order without renaming established files.

### 3.2 AI Handoff
- Always verify documentation against code before ending a session.
- Run `VERIFICATION_REPORT.md` if unsure about discrepancies.
