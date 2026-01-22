> [!WARNING]
> **DEPRECATED:** This file has been migrated to the canonical documentation system.
> See [docs/canonical/AI_HANDOFF.md](../../canonical/AI_HANDOFF.md) for the authoritative version.
> This file is preserved for historical reference.

# Handoff Document

**Last Updated:** 2026-01-20  
**Current Phase:** Phase 2A (READY TO START)

---

## ⚠️ PREREQUISITE: Upgrade Supabase

**Before starting Phase 2A, user must:**
1. Upgrade to **Supabase Pro plan** ($25/month)
2. Create a **development branch** (~$0.32/day when active)

**Reason:** Prevents breaking production during migrations

**Project:** `Conduit Price List` (otlssvssvgkohqwuuiir)
**Org:** `cloudstellar` (exbuklnrvijrnjsetiey)

---

## 📋 Quick Status

| Item | Status |
|------|--------|
| Phase 1 | ✅ v1.2.0 Complete |
| Phase 2 Roadmap | ✅ FROZEN |
| Documentation | ✅ Complete |
| Supabase Pro | ⏳ Pending upgrade |
| Phase 2A | ⏳ Ready after upgrade |

---

## 🎯 Next Session: Start Phase 2A

### Prompt to Use:
```
อ่าน docs/ai/PHASE2_PLAN.md และ docs/ai/TASK_CHECKLIST.md แล้วเริ่ม Phase 2A: Foundation

Phase 2A ต้องทำตามลำดับนี้:
1. Create `price_list_versions` table + seed "2568"
2. Add `version_id` to `price_list` + backfill
3. Add `price_list_version_id` to `boq` + backfill
4. Create `system_event_log` table
5. Add triggers (active-only, immutable)
6. UI header: Version + Year + Status

สำคัญ: ⛔ Phase 2A = Infrastructure only, ห้ามเพิ่ม feature logic
```

---

## 📁 Key Files to Read

| Priority | File | Purpose |
|----------|------|---------|
| 1 | `docs/ai/PHASE2_PLAN.md` | Detailed roadmap + rules |
| 2 | `docs/ai/TASK_CHECKLIST.md` | What's done, what's next |
| 3 | `docs/DATABASE_SCHEMA.md` | Current schema + Phase 2 preview |
| 4 | `docs/IMPLEMENTATION_PLAN.md` | Overview |

---

## 🔐 Key Rules (Don't Forget!)

### Versioning Integrity
- One default (UNIQUE WHERE is_default = true)
- Default must be active
- Atomic default switch (transaction)
- Active-only BOQ creation
- Immutable `boq.price_list_version_id`
- UNIQUE (version_id, item_code)

### Migration Guardrails
- Backfill BEFORE SET NOT NULL
- Log columns: `action`, `table_name`, `created_at` = NOT NULL

---

## ⚠️ Watch Out For

1. **Existing Copy BOQ** (`app/boq/page.tsx` handleDuplicate) — currently copies snapshot prices
2. **Auth Deadlock** — use `setTimeout` in `onAuthStateChange`
3. **RLS is source of truth** — `lib/permissions.ts` is UI only

---

## 📊 Tech Stack

- Next.js 16
- Tailwind CSS 4
- Supabase (PostgreSQL + RLS)
- Vercel
