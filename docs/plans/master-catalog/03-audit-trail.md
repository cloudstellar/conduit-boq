# 🔬 Architecture Analysis v25 — Audit Trail (Proposal v25 / Plan v25)

> เอกสารนี้เป็น **audit trail** ของทุกรอบ review พร้อมสถานะปัจจุบัน

---

## Proposal Change Log (v1 → v25)

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
| v9 | Pending user: `IN ('active','pending')` + pending logic | ✅ |
| v9 | Legacy BOQ: ลบ `OR v_boq_created_by IS NULL` จาก manager | ✅ |
| v9 | ย้าย `ENABLE RLS` ติดกับ `CREATE TABLE` | ✅ |
| v10 | Legacy Guard: เพิ่ม early check `created_by IS NULL AND role <> admin` | ✅ |
| v11 | Section 1.2 description: ลบ 'หรือ Legacy' + เพิ่ม pending + อ้าง SECURITY.md | ✅ |
| v11 | Default trigger: เพิ่ม RAISE EXCEPTION ถ้าหา active default ไม่เจอ (fail-closed) | ✅ |
| v11 | เปลี่ยน 'Idempotent' → 'rerunnable ภายใต้ preflight assertions' | ✅ |
| v12 | REVOKE ทันทีหลัง CREATE FUNCTION (ไม่รอท้าย script) | ✅ |
| v12 | ย้าย clone/swap ไป [PHASE 4 FUNCTIONS] section พร้อม ⚠️ comment | ✅ |
| v12 | แยก GRANT: Phase 1A = SELECT only / Phase 4 = write grants (commented) | ✅ |
| **v13** | **ย้าย seed 2568.0.0 ก่อน fail-closed trigger (ปิด outage window)** | ✅ |
| **v13** | **เปลี่ยน `search_path = ''` + qualify table names ทุก function** | ✅ |
| **v13** | **เพิ่ม explicit REVOKE INSERT/UPDATE/DELETE ก่อน GRANT SELECT** | ✅ |
| **v13** | **แยก SQL เป็น 3 executable blocks: Phase 1A / Phase 1B / Phase 4** | ✅ |
| **v13** | **Phase 1B trigger: `search_path = ''`** | ✅ |
| **v14** | **เพิ่ม Lock timeout คลุม DDL ทั้งหมดของ Phase 1A (Lock Guardrail ครบ)** | ✅ |
| **v14** | **แก้ RPC `save_boq_with_routes` บังคับอ่าน category จาก DB เสมอสำหรับ item มาตรฐาน** | ✅ |
| **v14** | **เพิ่ม trigger ใน Phase 4 ป้องกัน cross-version mismatch จากการเขียนตรง** | ✅ |
| **v14** | **เพิ่ม audit trigger สำหรับ `price_list` ลงใน Phase 4 SQL block จริง** | ✅ |
| **v15** | **ครอบ RLS / Policies / Grants ทั้งชุดของ Phase 1A ใน Transaction (Atomic)** | ✅ |
| **v15** | **ครอบ DDL ของ Phase 1B (Phase 3) ด้วย lock_timeout ป้องกันตารางหน่วง** | ✅ |
| **v16** | **ครอบคำสั่งสร้างตารางเวอร์ชันและเปิด RLS ให้อยู่ใน Transaction เดียวเพื่อปิด gap** | ✅ |
| **v17** | **ปรับคำรับรอง Downtime และเพิ่มเติม Future Gates สำหรับ Phase 4 ใน Known Risks** | ✅ |
| **v18** | **แก้ `make_version_default` จาก one-statement swap เป็น Singleton Pointer Table** | ✅ |
| **v18** | **แก้ audit trigger ให้ log `INSERT` (non-draft) นอกจาก UPDATE/DELETE** | ✅ |
| **v18** | **แก้ Phase 4 audit log grant เป็น SELECT only (ห้าม UPDATE/DELETE)** | ✅ |
| **v18** | **เพิ่ม `price_list_default_version` singleton pointer table + RLS + grants** | ✅ |
| **v18** | **ปรับ Section 1.1 อ้างอิง PostgreSQL per-row unique constraint timing** | ✅ |
| **v19** | **แก้ trigger `set_default_price_list_version` ให้อ่านจาก pointer table แทน `is_default`** | ✅ |
| **v19** | **แก้ `check_default_version_exists` ให้ตรวจจาก pointer table** | ✅ |
| **v19** | **เพิ่ม seed row สำหรับ `price_list_default_version` ใน Phase 1A** | ✅ |
| **v19** | **เพิ่ม row count check ใน `make_version_default` (ป้องกัน UPDATE 0 rows เงียบ)** | ✅ |
| **v19** | **เพิ่ม trigger ห้าม archive เวอร์ชันที่ pointer ชี้อยู่** | ✅ |
| **v19** | **เปลี่ยน audit log RLS จาก `FOR ALL` เป็น admin `FOR SELECT` only** | ✅ |
| **v19** | **RPC: standard items ดึงชื่อ/ราคาจาก DB, คำนวณ totals ฝั่ง server** | ✅ |
| **v19** | **Phase 4: เปลี่ยนจาก raw DML grants เป็น Scoped RPC** | ✅ |
| **v20** | **ย้าย pointer DDL + RLS + grants + triggers มา Phase 1A (ก่อน seed) — แก้ ordering bug** | ✅ |
| **v20** | **ทำ `is_default` boolean เป็น deprecated (คงไว้ backward compat, DROP หลัง Phase 4)** | ✅ |
| **v20** | **เพิ่ม trigger ห้ามลบ singleton row + ตรวจ active version** | ✅ |
| **v20** | **RPC: เปลี่ยน 9 CASE subqueries เป็น SELECT INTO ครั้งเดียว** | ✅ |
| **v20** | **เพิ่ม `ALTER DEFAULT PRIVILEGES` ปิด auto-grant EXECUTE จาก anon** | ✅ |
| **v20** | **แก้ BOQ RLS known risk comment ให้สอดคล้องกับ P0** | ✅ |
| **v21** | **เพิ่ม DECLARE `v_pl_item_name`, `v_pl_unit`, `v_pl_material`, `v_pl_labor`, `v_pl_unit_cost`** | ✅ |
| **v21** | **Pointer DDL: เพิ่ม `DROP POLICY IF EXISTS` + ครอบ transaction** | ✅ |

---

## Implementation Plan Change Log (→ v25)

| Round | จุดที่แก้ | สถานะ |
|---|---|---|
| v4 | Phase 1A: เพิ่ม `updated_at` trigger | ✅ |
| v4 | Phase 4: Audit log trigger เลื่อนมา | ✅ |
| v5 | Phase 0: เพิ่ม preflight queries + post-backfill | ✅ |
| v5 | Phase 2: เพิ่ม TypeScript type update + `lib/supabase.ts` | ✅ |
| v5 | Phase 1A: migration runner context note | ✅ |
| v6 | Phase 2: แก้ numbering เป็น 1→6 | ✅ |
| v6 | Phase 3: เพิ่ม re-verification SQL 3 ตัว | ✅ |
| v8 | Phase 1A: เปลี่ยน `SET` → `SET LOCAL` + `RESET` | ✅ |
| v8 | Phase 1A: แก้ inactive user blocking scope | ✅ |
| v9 | Phase 0: เพิ่ม Backup/Snapshot step | ✅ |
| v9 | Phase 0: เพิ่ม Rollback Decision Tree | ✅ |
| v9 | Phase 0: เพิ่ม `boq_routes` ใน RLS query | ✅ |
| v9 | Phase 0: เพิ่ม constraint name verification (query 6) | ✅ |
| v9 | Phase 0: เพิ่ม 2568.0.0 assertion (query 7) | ✅ |
| v10 | Phase 0 query 7: เพิ่ม `to_regclass` check ก่อน (ครั้งแรกยังไม่มี table) | ✅ |
| v10 | Phase 0 backup: แก้เป็น PITR + `supabase db dump`/`pg_dump` + migration script | ✅ |
| v10 | Phase 1A: เปลี่ยน 'Idempotent' → 'rerunnable ภายใต้ preflight assertions' | ✅ |
| v10 | หมายเหตุ RPC: แก้ `status = 'active'` → `status IN ('active','pending')` | ✅ |
| **v11** | **Query 7: เปลี่ยนเป็น DO $$ block paste-run ได้ทันที** | ✅ |
| **v11** | **Query 8: เพิ่ม privilege verification (information_schema.role_table_grants)** | ✅ |
| **v11** | **Test: admin direct-write ถูกบล็อกใน Phase 1A (ต้องผ่าน RPC)** | ✅ |
| **v11** | **Phase 4: clone/swap อ้าง "Phase 4 migration" ไม่ใช่ "Phase 1A"** | ✅ |
| **v11** | **Phase 4: Admin writes strategy อ้าง Phase 4 GRANT ไม่ใช่ Phase 1A** | ✅ |
| **v12** | **Assertion: RAISE WARNING → RAISE EXCEPTION (หยุด migration จริง)** | ✅ |
| **v12** | **Query 10: privilege check ย้ายไป Post-Verification (ไม่ใช่ preflight)** | ✅ |
| **v12** | **Admin test: เขียนตรงถูกบล็อก (ต้องผ่าน RPC) ใน Phase 1A** | ✅ |
| **v13** | **Preflight: แยก row-not-found (NOTICE) vs wrong-status (EXCEPTION)** | OK |
| **v13** | **Post-verification: ตรวจ PUBLIC + authenticated + anon** | OK |
| **v12** | **IMPLEMENTATION_PLAN.md: idempotent → rerunnable** | ✅ |
| **v14** | **Query 7: เพิ่ม assertion ป้องกันการซ้ำซ้อนของ active default อื่น** | ✅ |
| **v14** | **Type: ปรับ `price_list_version_id` เป็น `string | null` ใน Phase 2** | ✅ |
| **v14** | **ItemSearch Fallback: จำกัดเฉพาะ Create, ส่วน Edit เป็น fail-closed** | ✅ |
| **v15** | **Query 5: เพิ่ม `with_check` ในการสแกน pg_policies** | ✅ |
| **v15** | **Phase 0: เพิ่มขั้นตอนและรายการ FK Indexes Audit** | ✅ |
| **v15** | **Phase 2: ปรับคอมโพเนนต์ ItemSearch ให้เป็น 100% Fail-Closed เสมอ** | ✅ |
| **v16** | **Phase 0: เพิ่มคิวรีตรวจสิทธิ์ดั้งเดิมของ RPC และตรวจดัชนีเก่า** | ✅ |
| **v16** | **Phase 2: เพิ่มสเต็ป Delta Category Backfill (SRE Gate)** | ✅ |
| **v16** | **Post-Verification: เพิ่ม runbook ในการสร้างดัชนีแบบ CONCURRENTLY** | ✅ |
| **v17** | **Query 12: เปลี่ยนเป็น table_privileges เพื่อให้ครอบคลุม pseudo-role PUBLIC** | ✅ |
| **v17** | **Phase 0: ตรวจ CLI Backup Option (--data-only) และกำหนด RPC Audit Expected Results** | ✅ |
| **v17** | **Post-Verification: เพิ่มคิวรี indisvalid เพื่อตรวจจับความสมบูรณ์ของ concurrent index** | ✅ |
| **v18** | **Phase 0: เพิ่ม P0 Hotfix — Production RPC Hardening (REVOKE + auth check deploy)** | ✅ |
| **v18** | **Phase 0: เพิ่ม TRUNCATE/REFERENCES revoke จาก anon/authenticated** | ✅ |
| **v18** | **Phase 4: State Swap เปลี่ยนเป็น Singleton Pointer Table** | ✅ |
| **v18** | **เพิ่มหมายเหตุ Next.js middleware → proxy.ts deprecation** | ✅ |
| **v19** | **แก้ function signature ตาม production DB: `admin_approve_user(uuid)`, `admin_reject_user(uuid, text)`** | ✅ |
| **v19** | **เพิ่ม `TRIGGER` ในรายการ REVOKE (P0 hotfix)** | ✅ |
| **v19** | **เพิ่ม BOQ RLS tightening ใน P0 (ลบ `created_by IS NULL` + เปลี่ยน roles เป็น `authenticated`)** | ✅ |
| **v19** | **แยก RPC deployment: P0 containment (schema เดิม) vs Phase 1A (ฉบับเต็ม)** | ✅ |
| **v19** | **Phase 2 create page: เปลี่ยน `is_default` เป็น pointer table lookup** | ✅ |
| **v19** | **Phase 4: เปลี่ยน raw DML grants เป็น Scoped RPC strategy** | ✅ |
| **v20** | **P0: REVOKE จากทุก role (รวม PUBLIC + authenticated) ก่อน ปิด exposure window** | ✅ |
| **v20** | **P0: เพิ่ม boq_items + boq_routes ใน RLS tightening (ครบทุกตาราง)** | ✅ |
| **v20** | **P0: เพิ่ม status check ใน policy matrix (บล็อก inactive/pending)** | ✅ |
| **v20** | **P0: เพิ่ม PUBLIC ใน table REVOKE** | ✅ |
| **v20** | **P0: เพิ่ม `ALTER DEFAULT PRIVILEGES` ปิด auto-grant** | ✅ |
| **v20** | **P0: ครบ transaction (มี BEGIN/COMMIT)** | ✅ |
| **v20** | **แก้ L277 consistency: เปลี่ยนจาก "Phase 4 เปิด write grants" เป็น Scoped RPC** | ✅ |
| **v21** | **P0: เขียน containment RPC จริง (ไม่ใช่ placeholder) — คัดจาก production RPC + เพิ่ม auth guard** | ✅ |
| **v21** | **P0: DROP ทุก policy เก่าก่อนสร้าง allowlist ใหม่ (รวม INSERT + SELECT)** | ✅ |
| **v21** | **P0: เพิ่ม `boq_insert` / `boq_routes_select` จาก `{public}` เป็น `{authenticated}`** | ✅ |
| **v21** | **P0: ลบ `created_by IS NULL` จาก INSERT policies ของ boq_items/boq_routes** | ✅ |
| **v22** | **P0: เพิ่ม `status = 'active'` ใน owner/assignee branches ของ boq_items + boq_routes (6 policies)** | ✅ |
| **v23** | **P0: `boq_insert` เปลี่ยนจาก `active` เป็น `IN ('active', 'pending')` ตาม permissions.ts + SECURITY.md** | ✅ |
| **v24** | **P0: `boq_select` คืน 008 granular matrix (ไม่ใช้ USING(true)) — child inherit parent RLS** | ✅ |
| **v24** | **P0: `boq_insert` เพิ่ม `created_by = auth.uid()` ป้องกันปลอม owner** | ✅ |
| **v24** | **P0: `boq_items_select` + `boq_routes_select` ใช้ EXISTS แทน USING(true)** | ✅ |
| **v24** | **P0: Containment RPC เพิ่ม procurement block + pending own-only** | ✅ |
| **v25** | **`boq_insert` เพิ่ม `AND status = 'draft'` ป้องกันปลอม workflow status** | ✅ |

---

## Decision Log

| คำถาม | คำตอบ | เหตุผล |
|---|---|---|
| Audit log trigger | Phase 4 | ไม่มี admin GUI ใน Phase 1A |
| `updated_at` trigger | Phase 1A | เล็ก ปลอดภัย |
| `BEGIN;...COMMIT;` | ใส่พร้อม context note | SQL Editor ใช้ / Supabase CLI ถอด |
| RPC เช็ค user status | `IN ('active','pending')` | pending ต้อง save ได้ตาม SECURITY.md |
| RLS ใส่ `WITH CHECK` | ใช่ explicit ทุก policy | PostgreSQL best practice |
| Row lock | `FOR UPDATE` ใน BOQ SELECT | ป้องกัน concurrent save race |
| Read exposure | ยอมรับ draft/archived อ่านได้ | ราคากลาง NT = ข้อมูลสาธารณะ |
| SECURITY DEFINER schema | คงใน public schema | PostgREST + mitigations ครบ |
| Backup strategy | PITR restore point + `pg_dump`/`supabase db dump` | ถูกต้องตาม Supabase docs |
| Rollback | Forward-fix DDL / Restore data loss | แยกตาม failure type |
| BOQ direct-write RLS | บันทึกเป็น known risk | ปัญหาเดิม ไม่เกิดจาก migration |
| `SET` vs `SET LOCAL` | ใช้ `SET LOCAL` + `RESET` หลัง COMMIT | กัน timeout leak ไป backfill |
| Inactive user read | บล็อกที่ middleware/UI ไม่ใช่ RLS SELECT | SELECT USING(true) สำหรับ authenticated |
| Constraint name | ตรวจจริงจาก `pg_constraint` ก่อน migration | Schema สร้างนอก migrations |
| Pending user save | อนุญาต: own BOQ only (created_by) | SECURITY.md L28 + permissions.ts L93 |
| Legacy BOQ access | Admin-only (early guard + ลบ manager fallback) | SECURITY.md L38 + 008_rls L59 |
| ENABLE RLS timing | ติดกับ CREATE TABLE ทันที | Supabase best practice: ปิด gap |
| Default trigger fail | RAISE EXCEPTION (fail-closed) | ป้องกัน NULL ลอดเข้า Phase 3 |
| "Idempotent" wording | เปลี่ยนเป็น "rerunnable ภายใต้ preflight" | ON CONFLICT DO NOTHING ไม่ซ่อม row ที่ผิด |
| REVOKE timing | ทันทีหลัง CREATE FUNCTION | PostgreSQL default = PUBLIC can execute |
| clone/swap scope | Phase 4 only | ลด blast radius — มี version เดียว |
| authenticated grants | Phase 1A = SELECT / Phase 4 = write | SECURITY DEFINER ไม่ต้องใช้ write grant |
| search_path | `''` + fully-qualified tables | ตาม Supabase docs best practice |
| **Seed ordering** | **ก่อน fail-closed trigger** | ป้องกัน outage window |
| **Write REVOKE** | **Explicit REVOKE ก่อน GRANT SELECT** | GRANT เป็น additive, REVOKE ต้องทำเอง |
| **SQL block split** | **แยก 3 blocks (Phase 1A / Phase 1B / Phase 4)** | ป้องกัน copy-paste ติดตั้ง Phase 4 |
| **Privilege verification** | **Query 12 ตรวจ information_schema (Post-Verification)** | พิสูจน์ว่า REVOKE ทำงานจริง |
| **Preflight retry** | **แยก 4 cases ใน DO block** | partial run (table มี row ไม่มี) ไม่บล็อก retry |
| **REVOKE scope** | **PUBLIC + authenticated + anon** | PostgreSQL PUBLIC สืบทอดทุก role |
| **Preflight failure mode** | **RAISE EXCEPTION (ไม่ใช่ WARNING)** | ป้องกัน migration ผ่านแบบ state เสีย |
| **[v18] Default pointer** | **Singleton Pointer Table แทน boolean flag** | Non-deferrable unique ตรวจ per-row → boolean swap เสี่ยง |
| **[v18] Audit INSERT** | **Log INSERT สำหรับ non-draft versions** | ป้องกัน clone flooding โดยข้ามร่าง draft |
| **[v18] Audit log grants** | **SELECT only (ห้าม UPDATE/DELETE)** | Immutability — trigger เขียนผ่าน SECURITY DEFINER |
| **[v18] P0 RPC hardening** | **REVOKE + deploy auth-checked version ก่อน catalog** | Production: anon + SECURITY DEFINER = bypass RLS |
| **[v18] TRUNCATE/REFERENCES** | **REVOKE จาก anon/authenticated** | PostgreSQL: ไม่ถูกควบคุมด้วย RLS |
| **[v19] TRIGGER grant** | **REVOKE TRIGGER จาก anon/authenticated** | Production DB ยืนยัน: มี TRIGGER grant ทุกตาราง |
| **[v19] Function signatures** | **แก้ตาม `pg_get_function_identity_arguments` จริง** | `admin_approve_user(uuid)`, `admin_reject_user(uuid, text)` |
| **[v19] BOQ RLS {public}** | **เปลี่ยน roles จาก `{public}` เป็น `{authenticated}`, ลบ `created_by IS NULL`** | Production: anon ผ่าน RLS ได้สำหรับ legacy BOQ |
| **[v19] P0 RPC split** | **แยก containment (schema เดิม) จาก full RPC (Phase 1A)** | คอลัมน์ catalog ยังไม่มีใน production |
| **[v19] Pointer as sole SoT** | **ทุก lookup เปลี่ยนจาก `is_default` เป็น pointer table** | ตัด dual source of truth |
| **[v19] Archive protection** | **Trigger ห้าม archive default version** | pointer ชี้อยู่ต้องสลับก่อน |
| **[v19] Standard item pricing** | **Server-side price lookup + totals calculation** | ป้องกัน client-side price manipulation |
| **[v19] Scoped RPC** | **ไม่เปิด raw DML grants, ใช้ SECURITY DEFINER RPCs** | Server Actions ตรวจ session + admin role |
| **[v20] Pointer DDL ordering** | **ย้าย DDL จาก Phase 4 ไป Phase 1A (ก่อน seed)** | v19 ล้มเพราะ seed ตารางยังไม่มี |
| **[v20] is_default deprecated** | **คงไว้ backward compat, pointer = sole SoT** | ตัด dual source of truth, DROP หลัง Phase 4 |
| **[v20] Pointer delete prevention** | **Trigger ห้ามลบ singleton row** | แม้ service_role เขียนตรง |
| **[v20] Pointer active validation** | **Trigger ตรวจ pointer → active version** | ป้องกันชี้ draft/archived |
| **[v20] RPC SELECT INTO** | **เปลี่ยน 9 CASE subqueries เป็น 1 SELECT INTO** | ลด query จาก 9 เหลือ 1 ต่อ item |
| **[v20] ALTER DEFAULT PRIVILEGES** | **REVOKE EXECUTE FROM PUBLIC, anon** | Supabase auto-grant: function ใหม่ = anon EXECUTE |
| **[v20] P0 exposure window** | **REVOKE รวม authenticated ก่อน, replace RPC, GRANT กลับ** | ปิดช่วง auth-less RPC + authenticated |
| **[v20] P0 full table coverage** | **เพิ่ม boq_items + boq_routes ใน RLS tightening** | DB ยืนยัน: 4 policies ใช้ {public} |
| **[v20] P0 status check** | **เพิ่ม `status = 'active'` ใน policy matrix** | บล็อก inactive/pending แก้/ลบ |
| **[v21] RPC DECLARE fix** | **เพิ่ม 5 ตัวแปร SELECT INTO** | compile ไม่ผ่านใน v20 |
| **[v21] Containment RPC** | **SQL จริงจาก production + auth guard** | ไม่ใช่ placeholder อีกต่อไป |
| **[v21] Full policy DROP** | **DROP ทุก policy เก่าก่อน allowlist ใหม่** | PostgreSQL: permissive OR ทับ |
| **[v21] Pointer idempotency** | **DROP POLICY IF EXISTS + transaction** | rerun ได้โดยไม่ error |
| **[v22] Child policy status check** | **เพิ่ม `status = 'active'` ใน owner/assignee ทุก branch** | suspended/inactive ยัง INSERT/UPDATE/DELETE ผ่าน direct DML |
| **[v23] Pending create BOQ** | **`boq_insert` ให้ `IN ('active', 'pending')`** | P0 hotfix ไม่ควรเปลี่ยน business logic |
| **[v24] Granular SELECT** | **คืน 008 matrix แทน USING(true)** | policy subquery ผ่าน parent RLS → child inherit |
| **[v24] Owner enforcement** | **`created_by = auth.uid()` ใน INSERT** | ป้องกัน Data API ปลอม owner |
| **[v24] Child RLS inherit** | **EXISTS แทน USING(true) ใน items/routes SELECT** | PostgreSQL: subquery ผ่าน parent RLS |
| **[v24] RPC procurement block** | **เพิ่ม procurement = read-only** | ตาม permissions.ts L176 |
| **[v24] RPC pending own-only** | **pending เข้าถึงได้เฉพาะ created_by** | ตาม permissions.ts L93-110 |
| **[v25] Draft-only INSERT** | **`status = 'draft'` ใน WITH CHECK** | Data API ปลอม approved/pending ได้ |

---

## Cross-Validation (All 3 Documents)

| # | ประเด็น | Proposal | Plan | สอดคล้อง |
|---|---|---|---|---|
| 1 | RPC status check `IN ('active','pending')` | ✅ | ✅ | ✅ |
| 2 | RLS WITH CHECK + status | ✅ | ✅ | ✅ |
| 3 | Phase 0: preflight queries (9 items with DO block) | ✅ | ✅ | ✅ |
| 4 | Phase 0: backup (PITR + pg_dump) | ✅ | ✅ | ✅ |
| 5 | Phase 0: rollback tree | ✅ | ✅ | ✅ |
| 6 | Phase 0: `boq_routes` in RLS query | ✅ | ✅ | ✅ |
| 7 | Phase 0: constraint name check | ✅ | ✅ | ✅ |
| 8 | Phase 0: 2568.0.0 assertion (DO block) | ✅ | ✅ | ✅ |
| 9 | Phase 0: privilege verification (query 12, Post-Verification) | ✅ | ✅ | ✅ |
| 10 | Phase 2: TypeScript types | ✅ | ✅ | ✅ |
| 11 | Transaction context | ✅ | ✅ | ✅ |
| 12 | Audit log → Phase 4 | ✅ | ✅ | ✅ |
| 13 | FOR UPDATE row lock | ✅ | ✅ | ✅ |
| 14 | Read exposure decision | ✅ | ✅ | ✅ |
| 15 | Phase 3 re-verification | ✅ | ✅ | ✅ |
| 16 | `SET LOCAL` + RESET | ✅ | ✅ | ✅ |
| 17 | Inactive user scope | ✅ | ✅ | ✅ |
| 18 | Pending user save | ✅ | ✅ | ✅ |
| 19 | Legacy = Admin-only (early guard) | ✅ | ✅ | ✅ |
| 20 | ENABLE RLS at creation | ✅ | ✅ | ✅ |
| 21 | Section 1.2 description ตรงกับ SQL | ✅ | ✅ | ✅ |
| 22 | Default trigger fail-closed | ✅ | ✅ | ✅ |
| 23 | "rerunnable" ไม่ใช่ "idempotent" | ✅ | ✅ | ✅ |
| 24 | REVOKE ทันทีหลัง CREATE FUNCTION | ✅ | ✅ | ✅ |
| 25 | clone/swap อยู่ใน Phase 4 block แยก | ✅ (block แยก) | ✅ | ✅ |
| 26 | GRANT = SELECT only + explicit REVOKE write (Phase 1A) | ✅ | ✅ | ✅ |
| **27** | **Seed ก่อน trigger (ไม่มี outage)** | ✅ | ✅ | ✅ |
| **28** | **`search_path = ''` + qualified tables** | ✅ (ทุก function) | ✅ | ✅ |
| **29** | **SQL แยก 3 executable blocks** | ✅ | ✅ | ✅ |
| **30** | **Phase 4 plan อ้าง "Phase 4 migration"** | ✅ | ✅ | ✅ |
| **31** | **Admin direct-write ถูกบล็อกใน Phase 1A** | ✅ | ✅ | ✅ |
| **33** | **Preflight retry-safe (partial run ไม่บล็อก)** | OK | OK | OK |
| **34** | **REVOKE ครอบ PUBLIC** | OK | OK | OK |
| **32** | **Preflight assertion หยุดจริง (EXCEPTION ไม่ใช่ WARNING)** | ✅ | ✅ | ✅ |
| **35** | **[v18] Default pointer = Singleton Table** | ✅ | ✅ | ✅ |
| **36** | **[v18] Audit INSERT (non-draft)** | ✅ | ✅ | ✅ |
| **37** | **[v18] Audit log grants = SELECT only** | ✅ | ✅ | ✅ |
| **38** | **[v18] P0 RPC hardening ก่อน catalog** | ✅ | ✅ | ✅ |
| **39** | **[v18] TRUNCATE/REFERENCES revoke** | ✅ | ✅ | ✅ |
| **40** | **[v19] TRIGGER revoke** | ✅ | ✅ | ✅ |
| **41** | **[v19] Function signatures ตาม production** | ✅ | ✅ | ✅ |
| **42** | **[v19] BOQ RLS tightening (P0)** | ✅ | ✅ | ✅ |
| **43** | **[v19] P0/Phase 1A RPC split** | ✅ | ✅ | ✅ |
| **44** | **[v19] Pointer = sole source of truth** | ✅ | ✅ | ✅ |
| **45** | **[v19] Archive default protection** | ✅ | ✅ | ✅ |
| **46** | **[v19] Server-side price validation** | ✅ | ✅ | ✅ |
| **47** | **[v19] Scoped RPC (no raw DML)** | ✅ | ✅ | ✅ |
| **48** | **[v20] Pointer DDL ก่อน seed** | ✅ | ✅ | ✅ |
| **49** | **[v20] `is_default` deprecated** | ✅ | ✅ | ✅ |
| **50** | **[v20] Pointer delete/active triggers** | ✅ | ✅ | ✅ |
| **51** | **[v20] RPC SELECT INTO** | ✅ | ✅ | ✅ |
| **52** | **[v20] ALTER DEFAULT PRIVILEGES** | ✅ | ✅ | ✅ |
| **53** | **[v20] P0 full table coverage** | ✅ | ✅ | ✅ |
| **54** | **[v20] P0 status check** | ✅ | ✅ | ✅ |
| **55** | **[v20] P0 transaction wrap** | ✅ | ✅ | ✅ |
| **56** | **[v20] BOQ RLS consistency fix** | ✅ | ✅ | ✅ |
| **57** | **[v21] RPC DECLARE fix** | ✅ | ✅ | ✅ |
| **58** | **[v21] Containment RPC จริง** | ✅ | ✅ | ✅ |
| **59** | **[v21] Full policy inventory DROP** | ✅ | ✅ | ✅ |
| **60** | **[v21] Pointer idempotent** | ✅ | ✅ | ✅ |
| **61** | **[v22] Child policy status check** | ✅ | ✅ | ✅ |
| **62** | **[v23] Pending create BOQ** | ✅ | ✅ | ✅ |
| **63** | **[v24] Granular SELECT matrix** | ✅ | ✅ | ✅ |
| **64** | **[v24] Owner enforcement** | ✅ | ✅ | ✅ |
| **65** | **[v24] Child RLS inherit** | ✅ | ✅ | ✅ |
| **66** | **[v24] RPC procurement block** | ✅ | ✅ | ✅ |
| **67** | **[v24] RPC pending own-only** | ✅ | ✅ | ✅ |
| **68** | **[v25] Draft-only INSERT** | ✅ | ✅ | ✅ |

---

## Known Risks (ยอมรับแล้ว ไม่ขวาง Phase 0-1A)

| รายการ | ทำเมื่อไหร่ | เหตุผล |
|---|---|---|
| Direct write `boq_items` bypass cross-version | Phase 4 + DB trigger | ตอนนี้มีเวอร์ชันเดียว ไม่เกิดจริง |
| ~~`make_version_default` ชน unique index?~~ | ~~Phase 4 ทดสอบก่อน deploy~~ | **[v18] แก้แล้ว — เปลี่ยนเป็น Singleton Pointer Table ตัดปัญหา per-row unique check ทั้งหมด** |
| ~~`boq`/`boq_items`/`boq_routes` RLS ยังกว้าง~~ | ~~Sprint ถัดไป~~ | **[v19] ย้ายเข้า P0 แล้ว — production DB ยืนยัน: policy ใช้ `roles={public}` + `created_by IS NULL` ทำให้ anon แก้/ลบ legacy BOQ ได้** |
| `handleDuplicate` ไม่ atomic | Sprint ถัดไป | ปัญหาเดิม ไม่เกิดจาก migration |
| ~~`handleDelete` ไม่ลบ `boq_routes`~~ | ~~Sprint ถัดไป~~ | **[v19] ไม่ใช่ปัญหา — production DB มี `ON DELETE CASCADE` บน `boq_routes.boq_id` แล้ว ปัญหาจริงคือ frontend ไม่ตรวจ delete error** |
| **[Gate Phase 4] ห้ามสร้าง BOQ ผูกกับเวอร์ชัน Draft/Archived** | Phase 4 + DB Validation | ป้องกันผู้ใช้ทั่วไปเผลอประมาณราคากลางกับเล่มที่ยังไม่ประกาศใช้ |
| **[Gate Phase 4] ห้ามเปลี่ยน `price_list.version_id` ย้อนหลัง** | Phase 4 + DB Trigger | ป้องกันข้อมูลประวัติศาสตร์คลาดเคลื่อนหลังแอดมินสร้าง standard item แล้ว |
| ~~**[Gate Phase 4] การตัดสินใจเรื่อง Audit INSERT & Clone Flooding**~~ | ~~Phase 4 Design Decision~~ | **[v18] ตัดสินใจแล้ว — log INSERT เฉพาะ non-draft versions เพื่อป้องกัน clone flooding** |
| **[v18] Production RPC: anon + SECURITY DEFINER bypass** | **P0 ก่อน Phase 0** | `save_boq_with_routes` production ไม่มี auth check + anon EXECUTE ได้ |
| ~~**[v18] TRUNCATE/REFERENCES ไม่ถูกคุมด้วย RLS**~~ | ~~**P0 ก่อน Phase 0**~~ | **[v19] แก้แล้ว — เปลี่ยนเป็น REVOKE TRUNCATE, REFERENCES, TRIGGER** |
| **[v18] Next.js middleware → proxy.ts** | Sprint ถัดไป | deprecated ใน Next.js 16 แต่ไม่ใช่ blocker |
| **[v19] Audit log: UPDATE/DELETE draft ยัง log อยู่** | Phase 4 Design | ตัดสินใจว่าจะข้าม draft log ทั้ง INSERT/UPDATE/DELETE หรือเฉพาะ INSERT |
| **[v19] Audit log: activation/import batch logging** | Phase 4 Design | กำหนดว่า batch import log เป็น 1 entry หรือ per-item |
