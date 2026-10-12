# Lessons Learned & AI Constitution
## Conduit BOQ System

**Last Updated:** 2026-10-12
**Status:** Living Document (Update constantly)

<!-- MASTER_CATALOG_CURRENT_STATE_20260829 -->
> [!IMPORTANT]
> **Current-state addendum (2026-08-29):** Master Catalog Phase 4 and P-49 are
> complete end-to-end. [Handoff #106](../plans/master-catalog/106-phase4-master-catalog-exact-remaining-work-handoff.md)
> and [Result #107](../plans/master-catalog/107-phase4-p49-master-catalog-final-closeout-result.md)
> supersede dated `HOLD`, deferred-remediation, and migration-candidate wording
> below. A read-only Production recheck at `2026-08-29 01:38:54 +07`
> reconfirmed 027 then 028 with no 029, catalog `2568.1.0` at `710/710`, its
> reviewed prices, unchanged Factor F, the three catalog flags plus
> migration-028 functions/raw `app_settings` ACL, and `0` working drafts at
> that instant; it performed no write. The older statements
> remain historical chronology and must not be replayed.

<!-- DUP1_CURRENT_STATE_20260831 -->
> [!IMPORTANT]
> **Later product-release addendum:** Migration 029 was subsequently applied
> once for the separate Atomic BOQ Duplicate release as
> `20260831004110/atomic_boq_duplicate`; see
> [DUP-1 Production Result](../plans/product/04-atomic-boq-duplicate-production-release-result.md).
> The 2026-08-29 “no 029” observation above is still valid chronology for the
> Master Catalog closeout. Migrations 027/028/029 are now immutable/no-replay.

<!-- SAVE_GUARD_PRODUCTION_CLOSEOUT_20261012 -->
> [!IMPORTANT]
> **Current security addendum:** Migration 030 was later applied exactly once
> as `20261012100608/boq_save_null_authorization_guard`; see
> [BOQ Save Guard Production Result #04](../plans/security/04-boq-save-null-authorization-production-release-result.md).
> It fixes only the NULL authorization decision in the existing Save RPC and
> does not close wider S0/Auth/Security work. Migrations 027–030 are immutable,
> no-replay, and the release authority is consumed. Quantity Input Safety was
> not part of that security release; it later reached `PRODUCTION PASS` at exact
> source `4d285f8`. See [Production Result #08](../plans/product/08-r0a-quantity-input-safety-production-release-result.md).

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

### 1.4 Security Permission Logic — Triangulate All Sources
- **Lesson (2026-05):** Master Catalog migration เขียน RPC permission check อ้างอิงจาก `permissions.ts` ตัวเดียว โดยไม่เทียบกับ `SECURITY.md` และ RLS ใน `008_rls_and_trigger.sql` ส่งผลให้:
  1. **Pending user ถูกบล็อก** — RPC ใส่ `status = 'active'` แต่ canonical rule อนุญาต pending save own BOQ
  2. **Legacy BOQ เปิดให้ manager** — `permissions.ts` อนุญาต แต่ `SECURITY.md` + RLS บอก admin-only
  3. **Canonical sources ขัดกันเอง** ระหว่าง `permissions.ts` กับ `SECURITY.md` โดยไม่มีใครเห็น
- **Rule:** ก่อนเขียน permission logic ใหม่ **ต้องเปิด 3 ไฟล์วางข้างกันเสมอ**:
  1. `docs/SECURITY.md` — Access Matrix (source of truth)
  2. `lib/permissions.ts` — Client-side UI checks
  3. `migrations/008_rls_and_trigger.sql` — DB-level enforcement
- **Rule:** ถ้า 3 ไฟล์ขัดกัน → ยึดตาม `SECURITY.md` + RLS (เข้มกว่า) แล้ว flag ให้แก้ `permissions.ts`

### 1.5 P-49 correction — authorization is cross-layer, not three-file

- **Historical note:** the 2026-05 lesson correctly records the old
  pending-own-BOQ contract and why the earlier RPC was written that way. P-49
  supersedes that business intent on 2026-08-17; do not rewrite the historical
  event as if pending was always profile-only.
- **New rule:** compare the complete chain: product decision -> UI permission ->
  middleware/route classifier -> server/API actions -> table grants -> RLS ->
  trigger/protected columns -> RPC body/ACL -> service-role boundary -> real
  authenticated tests. Choosing the strictest of only three files can still
  leave a bypass in another layer.
- **New rule:** UI redirects and hidden buttons are not authorization. Supabase
  clients can call Data API/RPC directly; PostgreSQL and every privileged server
  path must enforce the same status x resource x action matrix.
- **New rule:** a pending profile's stored `role` grants no authority. Check
  current `status='active'` together with role before every privileged action,
  and never permit self-service mutation of role/status or approval/audit fields.
- **Historical gate at 2026-08-18:** P-49 remained open/high, while P-51
  accepted the risk temporarily and deferred remediation until after the exact
  first P-15 closeout. P-13 was separately unauthorized; the P-49 matrix
  remained mandatory for later remediation rather than silently waived. See
  [P-51 Plan](../plans/master-catalog/48-phase4-p51-risk-accepted-master-catalog-closeout-plan.md).

### 1.6 Atomic copy — one trusted intent, one graph or none

- Never restore a whole-BOQ copy as multiple browser inserts. Use one guarded,
  atomic, idempotent database operation with a stable request key and expected
  source-write token.
- Button visibility and typed client validation are UX only. The database must
  re-authorize actor/status/role/source and validate the complete graph, mode,
  Factor eligibility, ACL, and retry contract.
- Preserve mode means preserve Catalog/items/prices/Factor provenance. Choosing
  current prices is a new clean BOQ, not a hidden requote/rebase.
- A selected-Factor legacy copy must clear Factor-derived state and block
  official output until trusted review/save. Never “repair” a bad source during
  copy.
- A private idempotency ledger is durable evidence. Do not ad-hoc-delete rows or
  add a cleanup job without designing retention against response-loss retries.

### 1.7 Numeric input — never turn rejected syntax into another number

- **Lesson (2026-09):** removing unsupported characters from a numeric input can
  silently change user intent. The deployed/base predecessor sanitizer can turn `5*2`,
  `5x2`, `5X2`, or `5×2` into `52` and publish that number immediately.
- **Rule:** rejected syntax must never be converted into and committed as a
  different numeric value. It must not change the last valid quantity, totals,
  save payload, Print/PDF, or Excel state.
- **R0A status:** the Owner approved local implementation/testing on 2026-09-08.
  The candidate was frozen as runtime/tests commit `b18e69a` followed by docs
  commit `a467d38`, then verified in Preview at exact source `5527fe9` under the
  no-PR/no-separate-CI Solo path. Q-B later fast-forwarded exact source
  `4d285f8` to `main`; GitHub Quality, Vercel Production and authenticated
  no-write verification passed. Q-A/Q-B authorities are consumed. Keep the
  guard numeric-only, retain unsupported
  text as a visible invalid draft, and show an accessible explanation. R0A does
  not evaluate an expression or create formula history.
  A future expression parser requires a bounded grammar, canonical decimal
  semantics, parser versioning, trusted-save validation, and separate approval.
- **R0A verification:** cover typing and paste for `*`, `x`, `X`, and
  `×`, plus blur, Enter, correction, mobile input, save/reload, and a regression
  proving that no invalid draft is committed as concatenated digits.

---

### 1.8 SQL authorization must reject unknown decisions

- SQL booleans can be TRUE, FALSE or NULL. For an allow predicate, deny when
  `predicate IS NOT TRUE`; `IF NOT predicate` skips the denial when it is NULL.
- Test nullable owner/assignee/scope combinations against an existing resource
  and the actual privileged function. A missing-resource probe tests an earlier
  guard and cannot prove the later scope decision is correct.
- A `SECURITY DEFINER` function owned by the table owner cannot rely on the
  caller's RLS to repair its own missing authorization check.
- The 2026-09-08 Save finding and local proof are recorded in the
  [plan and local result](../plans/security/02-boq-save-null-authorization-guard-plan-and-result.md).
  The correction was later applied once as migration 030 and closed in
  [Production Result #04](../plans/security/04-boq-save-null-authorization-production-release-result.md).
  This is evidence, not authority to edit or replay migrations 027–030.

### 1.9 A green build does not mean the dependency graph is safe

- The Quantity `main` workflow passed install, lint, tests, and build, while
  `npm ci` still reported 20 advisories. A fresh `npm audit --omit=dev` reported
  six Production dependency findings: one critical, four high, and one
  moderate. Direct `next@16.2.9` was critical and npm identified `16.4.0` as a
  non-major fix path.
- Treat install/audit output as its own gate. Never summarize a passing build
  as a passing dependency or security audit when CI does not run that check.
- Patch and validate dependency advisories as a separate release. Do not mix
  the upgrade into LIST-1B, Quantity Expression, database work, or a docs-only
  closeout.

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

### 3.2 AI Handoff & Document Verification
- Always verify documentation against code before ending a session.
- Run `VERIFICATION_REPORT.md` if unsure about discrepancies.
- **Rule (2026-05):** ก่อนบอกว่า "เอกสารตรงกันแล้ว" **ต้อง diff จริง ไม่ใช่แค่จำ** — ถ้า edit ถูก cancel/fail ต้องตรวจว่าไฟล์ถูกแก้จริงหรือไม่
- **Rule (2026-05):** ก่อน commit เอกสารลง repo ต้องตรวจว่าเป็น version ล่าสุดที่ผ่าน review แล้ว
