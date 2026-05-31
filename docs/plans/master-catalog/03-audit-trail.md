# 🔬 Architecture Analysis v7 — Final Audit Trail (Proposal v9 / Plan v8)

> เอกสารนี้เป็น **audit trail** ของทุกรอบ review พร้อมสถานะปัจจุบัน

---

## Proposal Change Log (v1 → v9)

| Round | จุดที่แก้ | สถานะ |
|---|---|---|
| v2 | `make_version_default` → one-statement swap | ✅ |
| v3 | แยก `NOT FOUND` กับ `NULL` ใน `save_boq_with_routes` | ✅ |
| v3 | เปลี่ยน description Section 1.2 ให้ตรง SQL | ✅ |
| v4 | ครอบ DROP/ADD unique ด้วย `BEGIN;...COMMIT;` | ✅ |
| v4 | เพิ่ม `set_updated_at()` trigger | ✅ |
| v5 | เพิ่ม `AND status = 'active'` ใน RPC ทั้ง 3 ตัว | ✅ |
| v5 | เพิ่ม `WITH CHECK` ใน RLS `FOR ALL` ทั้ง 3 policies | ✅ |
| v5 | เพิ่ม NULL role guard หลัง SELECT user_profiles | ✅ |
| v5 | เพิ่ม Supabase migration runner context comment | ✅ |
| v6 | เพิ่ม `FOR UPDATE` row lock | ✅ |
| v6 | เพิ่ม RLS read exposure design decision | ✅ |
| v6 | เพิ่ม SECURITY DEFINER schema design decision | ✅ |
| v7 | เพิ่ม `lock_timeout`/`statement_timeout` ก่อน DDL | ✅ |
| v7 | เพิ่ม assertion comment สำหรับ `ON CONFLICT DO NOTHING` | ✅ |
| v7 | เพิ่ม BOQ direct-write RLS known risk note | ✅ |
| v8 | เปลี่ยน `SET` → `SET LOCAL` + `RESET` หลัง COMMIT | ✅ |
| **v9** | **[P0 FIX] Pending user: เปลี่ยน `status='active'` → `IN ('active','pending')` + pending logic** | ✅ |
| **v9** | **[P0 FIX] Legacy BOQ: ลบ `OR v_boq_created_by IS NULL` จาก manager ทุก role** | ✅ |
| **v9** | **[BEST PRACTICE] ย้าย `ENABLE RLS` ติดกับ `CREATE TABLE` (ปิด gap)** | ✅ |

---

## Implementation Plan Change Log

| Round | จุดที่แก้ | สถานะ |
|---|---|---|
| v4 | Phase 1A: เพิ่ม `updated_at` trigger | ✅ |
| v4 | Phase 4: Audit log trigger เลื่อนมา | ✅ |
| v5 | Phase 0: เพิ่ม preflight queries + post-backfill | ✅ |
| v5 | Phase 2: เพิ่ม TypeScript type update + `lib/supabase.ts` | ✅ |
| v5 | Phase 1A: migration runner context note | ✅ |
| v6 | Phase 2: แก้ numbering เป็น 1→6 | ✅ |
| v6 | Phase 3: เพิ่ม re-verification SQL 3 ตัว | ✅ |
| v8 | Phase 0: เพิ่ม Backup/Snapshot step | ✅ |
| v8 | Phase 0: เพิ่ม Rollback Decision Tree | ✅ |
| v8 | Phase 0: เพิ่ม `boq_routes` ใน RLS check | ✅ |
| v8 | Phase 0: เพิ่ม constraint name verification query | ✅ |
| v8 | Phase 0: เพิ่ม 2568.0.0 assertion query | ✅ |
| v8 | Phase 1A: เปลี่ยน `SET` → `SET LOCAL` + `RESET` | ✅ |
| v8 | Phase 1A: แก้ inactive user blocking scope | ✅ |

---

## Decision Log

| คำถาม | คำตอบ | เหตุผล |
|---|---|---|
| Audit log trigger | Phase 4 | ไม่มี admin GUI ใน Phase 1A |
| `updated_at` trigger | Phase 1A | เล็ก ปลอดภัย |
| `BEGIN;...COMMIT;` | ใส่พร้อม context note | SQL Editor ใช้ / Supabase CLI ถอด |
| RPC เช็ค user status | `IN ('active','pending')` | **v9**: pending ต้อง save ได้ตาม SECURITY.md |
| RLS ใส่ `WITH CHECK` | ใช่ explicit ทุก policy | PostgreSQL best practice |
| Row lock | `FOR UPDATE` ใน BOQ SELECT | ป้องกัน concurrent save race |
| Read exposure | ยอมรับ draft/archived อ่านได้ | ราคากลาง NT = ข้อมูลสาธารณะ |
| SECURITY DEFINER schema | คงใน public schema | PostgREST + mitigations ครบ |
| Backup strategy | Supabase snapshot + baseline export | กันไม่ได้ restore |
| Rollback | Forward-fix DDL / Restore data loss | แยกตาม failure type |
| BOQ direct-write RLS | บันทึกเป็น known risk | ปัญหาเดิม ไม่เกิดจาก migration |
| `SET` vs `SET LOCAL` | ใช้ `SET LOCAL` + `RESET` หลัง COMMIT | กัน timeout leak ไป backfill |
| Inactive user read | บล็อกที่ middleware/UI ไม่ใช่ RLS SELECT | SELECT USING(true) สำหรับ authenticated |
| Constraint name | ตรวจจริงจาก `pg_constraint` ก่อน migration | Schema สร้างนอก migrations |
| **Pending user save** | **อนุญาต: own BOQ only (created_by)** | **SECURITY.md L28 + permissions.ts L93** |
| **Legacy BOQ access** | **Admin-only (ลบ manager legacy access)** | **SECURITY.md L38 + 008_rls L59** |
| **ENABLE RLS timing** | **ติดกับ CREATE TABLE ทันที** | **Supabase best practice: ปิด gap** |

---

## Cross-Validation (All 3 Documents)

| # | ประเด็น | Proposal | Plan | สอดคล้อง |
|---|---|---|---|---|
| 1 | RPC status check | ✅ `IN ('active','pending')` | ✅ | ✅ |
| 2 | RLS WITH CHECK + status | ✅ | ✅ | ✅ |
| 3 | Phase 0: preflight queries | ✅ | ✅ 7 queries + backup + rollback | ✅ |
| 4 | Phase 2: TypeScript types | ✅ | ✅ | ✅ |
| 5 | Transaction context | ✅ | ✅ | ✅ |
| 6 | Audit log → Phase 4 | ✅ | ✅ | ✅ |
| 7 | Phase 2 numbering 1→6 | N/A | ✅ | ✅ |
| 8 | FOR UPDATE row lock | ✅ | ✅ | ✅ |
| 9 | Read exposure decision | ✅ | ✅ | ✅ |
| 10 | SECURITY DEFINER decision | ✅ | ✅ | ✅ |
| 11 | Phase 3 re-verification | ✅ | ✅ | ✅ |
| 12 | Backup/Rollback | ✅ | ✅ Phase 0 items 4-5 | ✅ |
| 13 | BOQ direct-write RLS | ✅ | ✅ Phase 0 query 5 | ✅ |
| 14 | `SET LOCAL` + RESET | ✅ | ✅ | ✅ |
| 15 | 2568.0.0 assertion | ✅ | ✅ Phase 0 query 7 | ✅ |
| 16 | Constraint name check | ✅ | ✅ Phase 0 query 6 | ✅ |
| 17 | Inactive user scope | ✅ | ✅ | ✅ |
| **18** | **Pending user save allowed** | ✅ L253-258 | ✅ (consistent) | ✅ |
| **19** | **Legacy = Admin-only** | ✅ L268-277 | ✅ (matches SECURITY.md) | ✅ |
| **20** | **ENABLE RLS at creation** | ✅ L65, L83 | ✅ | ✅ |
