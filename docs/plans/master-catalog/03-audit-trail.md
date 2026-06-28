# 🔬 Architecture Analysis v26 — Audit Trail (Proposal v26 / Plan v26)

> เอกสารนี้เป็น **audit trail** ของทุกรอบ review พร้อมสถานะปัจจุบัน

---

## Proposal Change Log (v1 → v26)

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
| **v26** | **ย้าย default function hardening ขึ้นก่อนสร้าง, เพิ่ม explicit REVOKE ในทุก trigger helper** | ✅ |

---

## Implementation Plan Change Log (→ v26)

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
| **v26** | **เพิ่ม `MAINTAIN` ใน Step 4 และ default tables, ถอน execute 4 SECDEF functions ใน Step 5, ปลดบล็อก pending child insert, ปรับ Query 7** | ✅ |
| **v26** | **Execution draft reconciliation: DROP production `price_list_*` policy names ก่อนสร้าง catalog allowlist** | ✅ |
| **v26** | **Migration naming reconciliation: Factor F เป็น timestamped supplement; Master Catalog root sequence เริ่ม `009` และแยก `010a` concurrent-index runbook** | ✅ |
| **v26** | **Canonical docs reconciliation: sync overview/schema/integrity/guardrails ให้ใช้ singleton pointer + `price_list_audit_logs`; ติดป้าย AI plan เก่าว่า superseded** | ✅ |
| **v27** | **แยก `009` เป็น standalone P0 security hotfix และเพิ่ม quality baseline gate: lint, build, automated tests, CI, non-production rehearsal ก่อนเริ่ม `010`** | ✅ |
| **v27** | **เพิ่ม production dependency audit gate ก่อน Master Catalog rollout; remediation หรือ risk acceptance ต้อง review แยกจาก feature PR** | ✅ |
| **v28** | **บันทึก repository quality baseline merge ผ่าน PR #1 (`6d607f9`), Vercel Production deploy ผ่าน, และยืนยันว่า Production DB ยังไม่ได้ apply migration `009`-`011`** | ✅ |
| **v28** | **ถอด hardcoded legacy Supabase `anon` key จาก utility scripts; HEAD ปัจจุบันไม่มี JWT literal และไม่มี `.env` ถูก track** | ✅ |
| **v29** | **เพิ่ม live-data rule: BOQ ที่เพิ่มก่อน rollout ไม่ทำให้ต้องแก้ SQL drafts; ต้อง refresh preflight counts และ backup ก่อน execution window** | ✅ |
| **v29** | **เพิ่ม delta category backfill สองรอบรอบ Phase 2 deploy เพื่อเก็บ direct-insert duplicate จากแอปเก่าระหว่าง cutover; `011` ยังคง fail-closed** | ✅ |
| **v30** | **Factor F correction reconciliation: ใช้ `factor_reference.factor` ("รวมในรูป Factor"), แสดงผลทันทีในหน้า edit, validate snapshot สำหรับ print/export, และไม่มี silent 5M fallback** | ✅ |
| **v30** | **PN6/catalog preflight reconciliation: เอกสาร canonical ระบุ `price_list` = 710 rows จากฐานเดิม 682 + PN6 28 (`ITEM-0683` ถึง `ITEM-0710`)** | ✅ |
| **v30** | **Verification source reconciliation: ต้องยืนยัน count ผ่าน authenticated Supabase SQL/MCP; anon REST/Data API ภายใต้ RLS ไม่ใช่หลักฐาน authoritative** | ✅ |
| **v31** | **Factor F full-table gate: เปลี่ยนจาก sample 30M/40M เป็น row count, duplicate/null, ordered threshold, positive factor, และ checksum ครอบทุก numeric reference column** | ✅ |
| **v32** | **เพิ่ม ADR-003 สำหรับการเริ่ม Master Catalog rollout และเลขเวอร์ชัน: ใช้ `2568.0.0` แบบ CalVer-first / SemVer-shaped ตาม schema `major.minor.patch`** | ✅ |
| **v33** | **ปรับ ADR-003 ให้ปี segment แรกเป็นปีเริ่มใช้งานที่ owner กำหนด (`effective_be_year`) ไม่ใช่ปีจัดทำหรือปี deploy; สามารถกำหนดอนาคต เช่น `2570.0.0` ได้** | ✅ |
| **v34** | **เพิ่ม item-code governance ใน ADR-003: `item_code` เป็น business key ไม่ใช่ลำดับแสดงผล, ห้ามแก้ active version ทับเงียบ ๆ, และการ renumber ต้องออก version พร้อม audit/mapping** | ✅ |
| **v35** | **เพิ่ม future structured item-code scheme ใน ADR-003 เช่น `CIC-PVC-001`; ต้องมี segment dictionary, import validation, และ mapping จาก legacy code เมื่อ recode** | ✅ |
| **v36** | **Production P0 applied/verified 2026-06-21: ปิด anonymous SECURITY DEFINER RPC, fixed save-RPC search path, ถอน dangerous table grants, ติดตั้ง BOQ RLS allowlist โดย counts ไม่เปลี่ยน; ledger `20260621045208`** | ✅ |
| **v36** | **เพิ่ม best-practices analysis แยก: mapping Supabase/Postgres, Next.js, frontend/admin UI, alternatives, risk register, และ execution readiness checklist** | ✅ |
| **v37** | **Phase 1A gates closed: fresh MCP logical snapshot restore/checksum ตรง Production ทั้ง 10 public tables; Next.js 16.2.9 + patched transitive overrides ผ่าน build/export smoke และ Production npm audit = 0** | ✅ |
| **v37** | **Local rehearsal ครบ `009 -> 010 -> 010a -> Phase 2 -> 011`; rendered desktop/mobile, API/auth, immutable trigger, security advisor และ canonical bootstrap ผ่าน โดย Production ยังไม่ถูก apply** | ✅ |
| **v37** | **ลดสิทธิ์ `prevent_boq_version_modification` จาก SECURITY DEFINER เป็น SECURITY INVOKER เพราะ trigger เปรียบเทียบเฉพาะ OLD/NEW และไม่ต้องใช้สิทธิ์ยกระดับ** | ✅ |
| **v38** | **Production Phase 1A preflight ตรง fresh snapshot ครบ 10 public tables + ผู้ใช้จริง 20 ราย; duplicate/null = 0, Factor F checksum ตรง, active session = 0** | ✅ |
| **v38** | **Apply/verify `010` ผ่าน Supabase MCP ledger `20260621052517`; backfill ครบ 198 BOQ / 710 price rows / 1,547 category snapshots และ cross-version mismatch = 0** | ✅ |
| **v38** | **รัน `010a` แยก 4 คำสั่งแบบ concurrent นอก transaction; ทุก index `indisvalid=true` และ `indisready=true`** | ✅ |
| **v38** | **Production impersonation smoke ผ่าน: anon เห็น 0 rows และ save ไม่ได้; authenticated admin เห็น default version/710 prices/198 BOQ; legacy-create rollback smoke ถูกผูก default version อัตโนมัติและไม่ทิ้งข้อมูล** | ✅ |
| **v38** | **Pre-deploy delta gate หลังบันทึกผล rollout ยังเป็นศูนย์ทุก invalid-state และมี active default 1 รายการ; พร้อม review/merge/deploy Phase 2** | ✅ |
| **v39** | **Phase 2 [PR #2](https://github.com/cloudstellar/conduit-boq/pull/2) squash-merged ที่ `1439a7a`; Quality run #15 และ Vercel Production deploy ผ่าน** | ✅ |
| **v39** | **Authenticated Production Browser QA ผ่าน Dashboard, Price List 710 + ITEM-0710 search, BOQ 198 + AWS search, Create form, Edit/version-scoped search และ Print โดยไม่มี app console error** | ✅ |
| **v39** | **Apply/verify `011` ผ่าน Supabase MCP ledger `20260621104056`; BOQ version `NOT NULL`, immutable trigger enabled, invoker guard ปฏิเสธการเปลี่ยน version จริง** | ✅ |
| **v39** | **Post-hardening rollback create/save ผ่าน; final counts 198 / 1,547 / 217 / 710, invalid-state และ smoke rows = 0, Factor F checksum ไม่เปลี่ยน** | ✅ |
| **v40** | **เพิ่ม ADR-005 และ Factor F Change Request: Factor F เป็น versioned reference แยก, ห้าม backfill BOQ เก่าแบบเดา, และถ้าจะปรับ Factor F ตอนนี้ต้องทำ F1/F2 ก่อน F3 publish** | ✅ |
| **v41** | **Review reconciliation: ระบุ `factor_reference_rows` schema, SHA-256 canonical hash, singleton pointer detail, interpolation formula, และ F3 timing เป็นตัวเลือกตาม urgency โดยยังต้องแยก window** | ✅ |
| **v42** | **เพิ่ม Factor F implementation plan แบบ no-assumption: non-negotiable rules, F0-F4 gates, migration/app/test matrix, rollback/forward-fix, และ prompt rules สำหรับ AI/dev agent** | ✅ |
| **v43** | **ปิด minor review gaps: ADR-005 ระบุ Factor F version string แบบ `major.minor.patch` และ Architecture Plan ชี้ไปยัง Factor F CR/implementation plan** | ✅ |
| **v44** | **Owner review reconciliation: ตัด row count ที่ยังไม่ query ออกจาก assumption, ระบุ migration numbers ตาม execution order, และเพิ่ม user-impact note ระหว่าง Factor F implementation/F3 publish** | ✅ |
| **v45** | **Owner supplied 26 มิถุนายน 2569 Factor F table; plan now selects Factor F before MC Phase 4, records `รวมในรูป Factor -> factor`, 36 visible rows, and blocks invented component-percent fields** | ✅ |
| **v46** | **F0 readiness review follow-up: add version-level source condition metadata for advance payment, retention, loan interest, and VAT so print/export no longer hardcode 7% interest** | ✅ |
| **v47** | **Owner confirmations: effective date 2026-06-26, source reference กค 0433.2/ว 481, owner as reviewer, and official PDF retained outside repository** | ✅ |
| **v48** | **Production Supabase MCP verification: latest ledger `20260621104056`/`011`, `factor_reference` 37 rows/no duplicates/no invalid rows, no Factor F version tables yet, BOQ snapshots 70 complete / 136 incomplete; reserve FF `012`/`013`/`014`, superseded by v49 repair decision below** | ✅ |
| **v48** | **F0 approved: ADR-005 status changed to Accepted, CR approval gate recorded with F1/F2 foundation scope, F3 requires separate approval after baseline audit/diff/hash/owner review** | ✅ |
| **v49** | **Owner approved no-maintenance Factor F rollout with legacy snapshot metadata repair: reserve FF `012`/`013`/`014`/`015` and move MC Phase 4 to `016+`** | ✅ |
| **v50** | **Factor F Production rollout completed: `012`/`013`/`014`/`015` applied, default Factor F is `2569.0.0`, baseline `2566.0.0` remains active, legacy BOQs were not version-backfilled, partial legacy snapshots remaining = 0, and MC Phase 4 remains `016+`** | ✅ |

---

## Execution Status (2026-06-21)

| รายการ | สถานะ | หลักฐาน |
|---|---|---|
| Repository quality baseline | ✅ Merged to `main` | [PR #1](https://github.com/cloudstellar/conduit-boq/pull/1), merge commit `6d607f9` |
| Factor F correction | ✅ Merged to `main` | Uses `factor_reference.factor`, live edit display, snapshot validation, fail-closed fallback |
| Lint | ✅ Passed | `0` errors, `11` existing warnings |
| Automated tests | ✅ Passed | `npm test`: `26/26` tests across `6` files |
| Production build | ✅ Passed | `npm run build` |
| GitHub Actions | ✅ `main` gate passed | [Quality run #15](https://github.com/cloudstellar/conduit-boq/actions/runs/27901449961): install, lint, test, build |
| Vercel Production deploy | ✅ Passed | Phase 2 merge commit `1439a7a`; [Production](https://conduit-boq.vercel.app) |
| Credential hygiene | ✅ HEAD cleaned | Removed hardcoded legacy `anon` key from utility scripts; no tracked `.env` |
| Catalog/reference recheck | ✅ Verified by Supabase MCP | `price_list` 710 rows, PN6 28 rows, `factor_reference` 37 rows, checksum `e8040ffbf82beebd61bbb9c2652dd41a` |
| Catalog versioning ADR | ✅ Added | [ADR-003](../../02_architecture/ADR/ADR-003-master-catalog-rollout-and-version-numbering.md): start at `2568.0.0` |
| Factor F versioning ADR/CR | ✅ Added | [ADR-005](../../02_architecture/ADR/ADR-005-versioned-factor-f-reference.md) + [Factor F CR](../factor-f/01-versioned-factor-f-change-request.md): separate F-track before changing live factor values |
| Best-practices analysis | ✅ Added | [07-best-practices-analysis.md](./07-best-practices-analysis.md) |
| P0 containment `009` | ✅ Applied/verified | Production ledger `20260621045208` |
| Master Catalog `010` / `010a` | ✅ Applied/verified | Production ledger `20260621052517`; four concurrent indexes valid/ready |
| Master Catalog `011` | ✅ Applied/verified | Production ledger `20260621104056`; `NOT NULL` + immutable invoker trigger |

The removed legacy `anon` key remains visible in earlier git history. It is a
low-privilege public-client credential rather than a `service_role` secret, but
credential migration or rotation should be reviewed separately if historical
invalidation is required.

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
| **[v26] PG17 MAINTAIN** | **REVOKE MAINTAIN จาก tables & default tables** | ป้องกัน user ทั่วไปสั่งบำรุงรักษาตารางแคตล็อกใหม่ |
| **[v26] SECDEF functions** | **ถอนสิทธิ์ execute ฟังก์ชัน SECDEF ที่ขาดไป 4 ตัว** | ยืนยันพบ 8 ฟังก์ชันจริงจาก DB และจัดการครบถ้วน |
| **[v26] Pending duplicate** | **ปลดบล็อก INSERT ของ pending owner ใน routes/items** | บล็อก pending ทำให้สร้าง BOQ เปล่าๆ ป้องกัน copy-paste regression |
| **[v26] Query 7 fix** | **ใช้ aclexplode ตรวจ OID 0 (PUBLIC) & 'anon'** | DB จริงเก็บ PUBLIC เป็น grantee OID 0, cast ได้ '-' |
| **[v29] Live BOQ growth** | **ไม่แก้ migration drafts; refresh preflight counts และ backup ก่อน execution window** | `010` backfill ทุก row ที่ target column ยังเป็น `NULL` |
| **[v29] Cutover reconciliation** | **รัน delta category backfill ก่อนและหลัง Phase 2 deploy** | แอปเก่า duplicate BOQ แบบ direct insert และยังไม่ส่ง `category` snapshot |
| **[v30] Factor F source** | **ใช้ `factor_reference.factor` ไม่ใช่ `factor_f` เป็นตัวคูณ BOQ** | คอลัมน์ `factor` คือ "รวมในรูป Factor" ตามตารางที่ใช้งานจริง |
| **[v30] Factor F fallback** | **ไม่มี silent default เป็นค่า 5M เมื่ออ่านตารางไม่ได้** | กัน print/export และ save แสดงราคาผิดโดยไม่แจ้งผู้ใช้ |
| **[v30] Factor F snapshot** | **print/export ใช้ saved snapshot ก่อน ถ้า snapshot valid** | รักษาหลักฐานราคาเดิมของ BOQ และเลี่ยงการเปลี่ยนย้อนหลังตาม reference table |
| **[v30] PN6 count** | **ฐานปัจจุบันที่เอกสารอ้างอิงคือ 710 rows** | เดิม 682 + PN6 28; refresh ผ่าน authenticated SQL/MCP ก่อน execution window |
| **[v31] Factor F approval gate** | **ตรวจทั้งตาราง ไม่ใช่แค่ 30M/40M** | Factor F ผิดแถวเดียวทำให้ BOQ ในช่วงค่างานนั้นผิดได้ จึงต้องใช้ full-table checksum และ row-level review ถ้า checksum เปลี่ยน |
| **[v40] Factor F versioning track** | **ทำ Factor F เป็น reference version แยกจาก Master Catalog; seed current baseline สำหรับ BOQ ใหม่เท่านั้น ไม่ backfill BOQ เก่าแบบเดา** | เจ้าของต้องการปรับ Factor F ตอนนี้ จึงต้องมี F0-F3 gate ก่อนเปลี่ยน live factor values |
| **[v44] Migration ordering** | **เลข migration ของ Factor F และ Master Catalog ต้องเดินตามลำดับ execution จริง** | v49 ยืนยันว่า Factor F ใช้ `012`/`013`/`014`/`015` และ Master Catalog Phase 4 เริ่ม `016+` |
| **[v45] New Factor F source** | **ใช้ `รวมในรูป Factor` จากตาราง 26 มิถุนายน 2569 เป็น `factor` และให้ Factor F track มาก่อน MC Phase 4** | รูปที่ owner ส่งมี 36 visible rows และไม่มี operation/profit/total_expense รายแถว จึงต้อง validate source/hash และห้ามเดาค่าที่ไม่มีในตาราง |
| **[v46] Factor condition metadata** | **เก็บ advance payment, retention, loan interest, และ VAT เป็น version-level metadata** | print/export ปัจจุบัน hardcode ดอกเบี้ย 7% แต่ source 26 มิถุนายน 2569 ระบุ 6%; F1 ต้องอ่านจาก metadata |
| **[v47] Owner F3 source confirmations** | **effective date/source reference ยืนยันแล้ว แต่ F3 ยังต้องรอ diff/hash approval** | เอกสารตัวจริงเก็บภายนอกโดย owner/NT และไม่ commit `files/` โดยปริยาย |
| **[v48/v49] Production migration order** | **Factor F uses root migrations `012`/`013`/`014`/`015`; Master Catalog Phase 4 moves to `016+`** | Supabase MCP production ledger verified `011` as latest and owner approved legacy snapshot metadata repair as Factor F `015` |
| **[v32/v33] Version numbering** | **เริ่ม Master Catalog ที่ `2568.0.0`; อนาคตกำหนดปีเริ่มใช้งานได้ เช่น `2570.0.0`** | ใช้ปี พ.ศ. ที่ owner กำหนดให้เป็นปีเริ่มใช้งานเป็น segment แรก และใช้ revision/patch ตามหลัก SemVer-style; ไม่ใช้ 4-part key เพราะ schema และ convention ปัจจุบันคือ `major.minor.patch` |
| **[v34] Item code governance** | **`item_code` เป็น identity ของรายการใน catalog version** | ห้ามใช้ `item_code` เป็นลำดับแสดงผลหรือ reuse ความหมายใหม่; การเพิ่ม/แก้/renumber หลัง active ต้องมี version bump และ audit/mapping ตามระดับผลกระทบ |
| **[v35] Structured item codes** | **รองรับรหัสอนาคต เช่น `CIC-PVC-001`** | ใช้ได้เป็น approved taxonomy ของ catalog version ใหม่ แต่ต้องมี dictionary/validation และไม่ให้แอป parse string เป็น business logic โดยไม่มี metadata |
| **[v36] Best-practice analysis** | **เลือก phased versioned catalog หลังเทียบ alternatives** | Supabase/Postgres หนุน DB invariants, indexes, least privilege, short transactions; Next.js หนุน Server Components/Actions/fail-closed UI; future admin UI ต้องเป็น table-first operational workflow |

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
| **69** | **[v26] DB-verified finite patch (MAINTAIN, SECDEF, pending RLS, Query 7)** | ✅ | ✅ | ✅ |
| **70** | **[v30] Factor F correction และ preflight verification source** | ✅ | ✅ | ✅ |
| **71** | **[v31] Factor F full-table integrity gate** | ✅ | ✅ | ✅ |
| **72** | **[v32] ADR-003 catalog version numbering (`2568.0.0`)** | ✅ | ✅ | ✅ |
| **73** | **[v33] ADR-003 effective year clarification (`effective_be_year`)** | ✅ | ✅ | ✅ |
| **74** | **[v34] ADR-003 item-code governance** | ✅ | ✅ | ✅ |
| **75** | **[v35] ADR-003 structured item-code scheme support** | ✅ | ✅ | ✅ |
| **76** | **[v36] Skill-backed alternatives/risk analysis** | ✅ | ✅ | ✅ |
| **77** | **[v40] ADR-005 Factor F versioned reference / no guessed legacy backfill** | ✅ | ✅ | ✅ |
| **78** | **[v44] Factor F row-count assumption removal / migration ordering / user-impact note** | ✅ | ✅ | ✅ |
| **79** | **[v45] 26 June 2026 Factor F source candidate / Factor F-first sequencing / multiplier column mapping** | ✅ | ✅ | ✅ |
| **80** | **[v46] Version-level Factor F condition metadata for print/export source text** | ✅ | ✅ | ✅ |
| **81** | **[v47] Owner effective-date/source-reference/reviewer confirmations and external evidence retention** | ✅ | ✅ | ✅ |
| **82** | **[v48] Production Supabase MCP migration/schema verification and FF/MC migration number shift** | ✅ | ✅ | ✅ |

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
| **[v30/v31] Factor reference integrity** | Preflight before P0 and Phase 1A | ต้องตรวจทั้งตารางผ่าน authenticated Supabase SQL/MCP; app จะ fail closed ถ้าอ่าน rows ไม่ได้ และ rollout ต้องหยุดถ้า checksum/row-level review ไม่ผ่าน |
