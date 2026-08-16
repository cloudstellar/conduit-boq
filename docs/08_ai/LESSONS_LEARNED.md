# Lessons Learned & AI Constitution
## Conduit BOQ System

**Last Updated:** 2026-08-17
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
- **Gate:** P-13 remains hard-stopped until the P-49 matrix passes. See
  [P-49 Plan](../plans/master-catalog/45-phase4-p49-pending-authorization-hardening-plan.md).

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

### 3.2 AI Handoff & Document Verification
- Always verify documentation against code before ending a session.
- Run `VERIFICATION_REPORT.md` if unsure about discrepancies.
- **Rule (2026-05):** ก่อนบอกว่า "เอกสารตรงกันแล้ว" **ต้อง diff จริง ไม่ใช่แค่จำ** — ถ้า edit ถูก cancel/fail ต้องตรวจว่าไฟล์ถูกแก้จริงหรือไม่
- **Rule (2026-05):** ก่อน commit เอกสารลง repo ต้องตรวจว่าเป็น version ล่าสุดที่ผ่าน review แล้ว
