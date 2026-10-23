# Local Docker Database — Baseline Preparation Result

> **C publication-custody note — 2026-10-23:** this is the original preparation
> receipt, including its **46 PASS / 1 FAIL**, not a current release-readiness
> verdict. Later [031 local correction](./BOQ_DUPLICATE_STALE_CONFLICT_LOCAL_RESULT.md),
> [B closeout](./STALE_COPY_B_RELEASE_CLOSEOUT_20261023.md) and
> [L1 release](./LIST_1B_L1_PRODUCTION_RELEASE_RESULT_20261023.md) have separate
> receipts; B Production HTTP remains NOT RUN. The nine parity tooling/baseline
> artifacts are host-local/unpublished and excluded from the 48-document C
> candidate. The manifest reference below is presented as an inline path to
> make that custody explicit; original observations/hashes/results are preserved.
> No restore/reset/replay or new capture is authorized by this note.

**Recorded:** 2026-10-23 (Asia/Bangkok)  
**Status:** PARTIAL / NOT RELEASE READY — schema matched; 46 API PASS / 1 stale-Copy FAIL

**Latest separate correction:** new [031/client local result](./BOQ_DUPLICATE_STALE_CONFLICT_LOCAL_RESULT.md)
records **49 fresh API PASS**, real two-tab stale recovery and final data/runtime
postflight. The existing local target now contains **captured baseline + exact
031 candidate**. Frozen Production source and this original preparation result
are unchanged; no reset, historical replay or Production request occurred in
the correction. This is not an isolated release approval.

**Later transport follow-up — 2026-10-23:** the separately approved one-shot
Production metadata read reported PostgREST 14.5. The approved REST-only local
replacement now runs actual 14.5 on the same DB/container/start/volume with no
reset or migration. One fresh stale-Copy request still timed out at 15,003 ms;
30 application-table fingerprints and semantic contracts remained unchanged.
REST-only cleanup ended retry activity. See the
[canonical addendum](./DEPENDENCY_SECURITY_LOCAL_RESULT.md#postgrest-145-alignment-and-stale-copy-retest--2026-10-23)
for exact evidence and limits. The original 46/47 execution below remains its
dated result, not a newly rerun full suite or Production behavior test.

Owner ให้ดำเนินการเตรียม/rebuild ฐานทดสอบเดิม ใส่ข้อมูลสมมติและทดสอบจริง
รวมถึงอ่าน Production schema/metadata เพื่อเทียบได้แล้ว การอนุมัติล่าสุดนี้
แทนที่สถานะ documentation-only ในเอกสารเดิม **เฉพาะขอบเขต local preparation
และ Production read-only metadata** ไม่อนุญาต Production/business writes,
commit/push/deploy, account operations ใน Production หรือการ replay/repackage
migrations 027–030

ใช้ [Local Database Parity Plan](./LOCAL_DATABASE_PARITY_PLAN.md) สำหรับวิธี
materialize final state และ [working agreement](../07_process/RELEASE_PROCESS.md#working-agreement-20261015)
สำหรับการรายงานสิ่งที่ทดสอบจริง ผลนี้ยังไม่ใช่ release-ready หรือ full
Production-platform PASS

## Source, target และสิ่งที่ดำเนินการแล้ว

| รายการ | หลักฐาน/ขอบเขต |
|---|---|
| Source | Production project `otlssvssvgkohqwuuiir`; single repeatable-read READ ONLY catalog snapshot เวลา `2026-10-22T18:44:51.443243Z` หรือ **23 ตุลาคม 2026 เวลา 01:44:51 Bangkok** |
| ข้อมูลที่อ่านจาก Production | schema/functions/permissions และ nonsecret platform metadata; **0 business rows, 0 Production writes** ไม่มี login/Save/Copy หรือการเรียกกรณีผิดพลาดเพื่อทดสอบ Production API |
| Local target | project `conduit-boq-local`, database `postgres`, container `supabase_db_conduit-boq-local`; API `http://127.0.0.1:55321`, DB port 55322 |
| Local database | PostgreSQL 17.6; image `public.ecr.aws/supabase/postgres:17.6.1.136`, image ID `sha256:f371b5f3f2ac0a05703f33d6e6134515fb2498cab708fb948a0aeb7481467c00` |
| Repository source | `main` HEAD `b144bcae98b543ab231c503f435f261f946b9f89`; local uncommitted baseline tooling/docs เป็น changeset ของงานนี้ ไม่ได้เปลี่ยน application runtime, package หรือ lockfile |
| Final local run | `2026-10-22T18:56:57.884Z`–`18:57:05.044Z` หรือ **23 ตุลาคม 2026 เวลา 01:56:57–01:57:05 Bangkok** สำหรับ restore/API receipt; browser/output checks เกิดต่อจากนั้น |
| Final container identity | `4c570d111a6bc112454eaeb477df8fb4bf2c708738c2968e3e08483fd74b5966` |
| วิธี restore | final object definitions จาก metadata capture; pre-data definitions → synthetic reference fixtures → post-data constraints/triggers/policies/ACL → synthetic Auth/personas ไม่มีการเรียก migration 027–030 หรือ runner เก่าที่ apply 030 |
| ข้อมูลทดสอบ | synthetic Catalog/Factor/organization/BOQ graphs และ local Auth UUIDs; ไม่ใช่ชุดราคา/BOQ/accounts จริงของ Production |
| Existing local state | ใช้ target เดิมตามอนุมัติ ไม่บังคับ backup ฐานทดสอบหรือ stack เพิ่ม ไม่ใช้/แก้ไฟล์ backup ของ Owner หรือ protected archive |

App-owned schema/materialization เปรียบเทียบแล้วตรง **30 tables, 96 functions,
27 triggers** รวม app-owned Auth attachment, table/column/function ACL, owners,
configuration, grants/default privileges, constraints และ RLS/policies ไม่มี
unexplained application-contract difference ใน semantic verification ที่ผ่าน

มี technical environment mappings สามกลุ่มที่บันทึกค่า expected/actual แบบ
เจาะจง ไม่ใช่การแก้ platform privileges ให้ดูตรงกันหรือ Owner release waiver:

- **Extensions:** ชื่อ/version/schema ของ extensions เดิมตรงกัน แต่ owner ของ
  `pgcrypto`, `uuid-ossp`, `pg_stat_statements` ต่างตาม managed/CLI platform;
  local มี `pg_net` เพิ่มโดยไม่มี app function อ้างถึง
- **Memberships:** local `postgres` รับ platform functions/realtime roles เพิ่ม;
  Production มี incoming `cli_login_postgres` ที่ local ไม่มี ไม่มี membership
  ใหม่ให้ application actors
- **Role inventory:** local platform roles เพิ่มสองชื่อ แต่ attributes ของ
  source roles เดิม รวม `anon`, `authenticated`, `service_role`, `authenticator`,
  `supabase_auth_admin` และ `postgres` ตรงกัน

ผลนี้เป็น **PASS เฉพาะ captured application contracts พร้อม recorded platform
mappings** ไม่รับรอง unused platform services, SSO/SMTP, Production load,
reference-data fidelity หรือทุก behavior ที่ยังไม่ทดสอบ

## Test evidence และข้อผิดพลาดที่ต้องรักษาไว้

| Gate / attempt | ผลที่บันทึกจริง |
|---|---|
| Semantic verification | **PASS:** 0 unexplained application differences ทั้งก่อน/หลัง final fixture/API run พร้อมสาม exact platform mappings ข้างต้น |
| API attempt แรก — chronology preserved | ผ่าน 25 cases ก่อนหยุดด้วย **FAIL** ที่ stale Copy HTTP error contract; เก็บ receipt เดิมไว้ |
| API attempt ถัดมา — chronology preserved | 35 cases: 34 PASS และ stale Copy FAIL ที่ carry จากหลักฐานเดิม; จากนั้นหยุดที่ legacy setup UPDATE Factor binding ถูก guard ปฏิเสธอย่างถูกต้อง |
| Legacy fixture correction | **DONE:** สร้าง synthetic legacy header/routes/items ที่ Factor-unbound ตั้งแต่ pre-data stage; ไม่ปิด trigger และไม่ UPDATE immutable binding เพื่อสร้าง test case |
| Final real JWT / Data API / RPC run | **PARTIAL:** 47 cases = **46 PASS / 1 FAIL**; failed stale Copy ยังคงบันทึก ไม่ยิง request ที่รู้ว่าค้างซ้ำเพื่ออ้าง PASS |
| Original local accounts | **PASS:** ทั้งเจ็ด `local.*` login และ role/status profile checks ด้วย `LOCAL_TEST_PASSWORD` เดิม; `supabase/.env.local` ไม่เปลี่ยน |
| Browser original Admin login | **PASS:** ใช้ `local.admin@ntplc.co.th` และ password เดิมเข้า local app จริง |
| Browser Quantity invalid/Escape | **PASS เฉพาะกรณีที่ทดสอบ:** `5x2` คงเป็น invalid draft, DB graph ไม่เปลี่ยน; Escape คืนค่าที่บันทึกไว้ |
| Browser focused Save/reload | **PASS:** แก้ quantity แรกเป็น `5.25`, Save แล้ว reload; DB ยืนยัน `[5.25, 2.5]`, base `387.50`, before VAT `426.25`, final `456.09`; จากนั้นคืน golden quantity แรกเป็น `4.25` |
| Saved Print | **PASS:** เปิด saved-version Print และเทียบ golden totals `337.50 / 371.25 / VAT 25.99 / 397.24` |
| Downloaded Excel | **PASS เฉพาะ synthetic vector:** download `.xlsx` จริง ตรวจ workbook **5 sheets** และตัวเลข golden vector; ไม่ใช่ official reference dataset หรือ wider D0 parity |
| Actual PDF | **PASS เฉพาะ synthetic vector:** Chrome Save as PDF **5 pages / 312,976 bytes**; extracted quantities/version/totals ตรง และตรวจภาพ render ทั้งห้าหน้าแล้ว; ไม่ใช่ full accounting certification |
| Selected-Factor browser output gate | **PASS:** direct Print ของสำเนาที่รอ Save แสดงข้อความบล็อก ไม่มี Print/Excel controls; สำเนาที่ trusted Save แล้วแสดง preview และ controls ครบ |
| Normal Copy through UI | **PASS:** เปิด dialog ของต้นฉบับ ยืนยันแล้วได้ editor ของ BOQ ID ใหม่ โดย quantity/ราคา/Catalog/Factor และยอดตรงต้นฉบับ; ไม่ใช่ stale case |
| Browser total and console | **11 cases PASS**; 0 errors / 0 warnings ที่ captured console ของแท็บทดสอบ ไม่รับรองทุก browser/viewport หรือ Production |
| Repository verification | **PASS:** Vitest 57 files / 649 tests และ targeted ESLint 5 files บน v24.2.0; build ไม่รันเพราะไม่แก้ application runtime/dependencies/config; ไม่ใช้ผลนี้แทน failed DB-flow gate |
| Production API impact | **NOT TESTED:** ไม่ probe stale Copy และไม่ทดสอบ business behavior บน Production |

46 API PASS ครอบคลุม current-profile/status gates รวม pending ที่เก็บ role
admin, inactive/suspended/missing-profile, cross-scope/NULL scope และ direct
Save denial; valid Save/reload, invalid quantity/name/version rollback,
Catalog-authoritative item fields, Copy preserve, retries/idempotency/concurrency,
parameter reuse และ selected-Factor reset → trusted Save เดิม รายละเอียดกรณี
อยู่ใน `api-smoke-results.json` ไม่ใช่การรับรอง SSO, broader S0, wider D0,
W-H หรือ Quantity Expression

### Stale Copy เป็น FAIL จริง ไม่ใช่ test waiver

Final `duplicate_boq_atomic` ที่ capture มาใช้ SQLSTATE `40001` เมื่อ expected
source token เก่า การทดสอบจริงผ่าน local PostgREST **14.13** ไม่คืน error
ตาม contract; Supabase client ไม่ได้รับ SQLSTATE และ raw HTTP request timeout
ที่ 15 วินาที พบ retry loop ที่ local transport ซึ่งต้องรักษาเป็น failed gate

[Supabase official Knowledge Base](https://supabase.com/kb/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions)
อธิบายว่า PostgREST 14 อาจ retry `40001` จาก custom RPC อย่างไม่สิ้นสุด และ
ระบุแก้ใน PostgREST 16 หลักฐานนี้สนับสนุนการวินิจฉัย local แต่ **ไม่พิสูจน์
ว่า Production API ใช้รุ่นใดหรือได้รับผลแล้ว** การแก้ RPC/platform เป็น scope
ใหม่แยกจากการ restore baseline ห้ามแก้/replay 029 เพื่อกลบ failure

หยุด request ค้างโดย restart เฉพาะ local REST container แล้ว schema ไม่เปลี่ยน
การปฏิเสธ nullable/invalid requests หรือผ่าน unit/build ไม่แทน failed stale
Copy gate และ current Save ยังรับ header/route totals จาก client ตาม contract
ปัจจุบัน จึงไม่ใช่ wider D0 trusted-write/accounting PASS

## Durable handoff และงานที่ยังเหลือ

Baseline metadata artifacts จัดเก็บใน host-local/unpublished
`supabase/local/baselines/20261023-production-contract/manifest.json`
ได้แก่ `source.json`, `manifest.json` และ `platform-differences.json` มีเฉพาะ
schema/permission/nonsecret metadata พร้อม sanitized `acceptance.json` ที่เก็บ
case names/statuses และ output assertions โดยไม่มี passwords/tokens หรือ actual
Production Auth/business rows ใช้ source/tooling hashes และ scope ใน manifest;
การมี metadata source ไม่เปลี่ยน partial acceptance ให้เป็น PASS

- Captured source file SHA-256: `188b515ddc444dc584e09e3f360f0f95888e70ee464f5d86dfbc39e08661b85e`
- Capture query SHA-256: `198ec2316f1f17e505b71ad32de24c1ce4bb16d315c21faa4eb81a0c4f148577`
- Final materialized pre-data SHA-256: `00dd4c58b0fdc370bb4fc1899aa794aa2039d00444b87289d23b9a4887422404`
- Final materialized post-data SHA-256: `c57385e2b56357ba0f66d249f87c14834a94a41b0ed701275fbbdd4c2580f209`

Host-local evidence ไม่ใช่ portable source of truth หรือ prerequisite ที่ต้อง
มีเพื่ออ่าน handoff ข้อมูล credential อยู่เฉพาะ private task directory และ
ไม่ควรแสดงหรือคัดลอกเข้า repository

**Earlier attempts retained:**
`/private/tmp/conduit-boq-local-parity-20261023-yv51o54d/`

- `first-attempt-api-smoke-results.json`, `first-attempt-test-receipt.json`:
  ผลรอบแรกที่หยุดหลัง 25 PASS
- `api-smoke-results.json`, `test-receipt.json`: ผลรอบถัดมาและ legacy fixture
  guard rejection; ไม่เขียนทับ failed evidence ให้ดูผ่าน
- `stale-copy-diagnostic.json`: actual local timeout/retry-loop finding
- `verify-receipt.json`, `reviewed-platform-differences.json`: semantic match
  และขอบเขต technical mapping

**Final restored target and browser/output evidence:**
`/private/tmp/conduit-boq-local-parity-20261023-final-i823shm_/`

- `restore-receipt.json`, `semantic-comparison.json`, `api-smoke-results.json`:
  final source/target, matching contracts, 46 PASS / 1 FAIL และ fixture IDs
- `existing-local-accounts-results.json`: เจ็ดชื่อเดิมกับ role/status/login PASS;
  ไม่มี password/token ใน summary
- `unchanged-input-hashes.json`: hash checkpoints ของ local env/config และ
  package/lockfile; ไม่แก้ password หรือ configuration เพื่อให้ login ผ่าน
- `browser-invalid-quantity.png`, `ui-invalid-persistence.json`: invalid draft
  และ DB persistence observation
- `browser-save-5-25-db.json`, `browser-saved-editor.png`: focused Save/reload
  กับ DB quantities/totals; คืนข้อมูลเป็น golden vector ภายหลัง
- `browser-print.png`, `browser-print-dom.txt`, `browser-export.xlsx`,
  `browser-print.pdf`: actual saved outputs ของ local synthetic BOQ
- `browser-results.json`: 11 actual UI cases; `excel-verification.json`: 16 numeric
  assertions; `pdf-verification.json`: five-page content checks and visual review
- `browser-factor-blocked.png`, `browser-factor-saved.png`,
  `browser-normal-copy.png`: actual gate/Copy views; `verify-receipt.json`: final
  read-only semantic check หลัง UI ยังตรง baseline

ใช้ [current runner guide](../LOCAL_SUPABASE.md#current-final-state-runner)
สำหรับ command modes, capture-source และ target conventions `restore`/`test`
มี local Auth/business writes และต้องอยู่ในอนุมัติของงานนั้น; `verify` อ่าน
metadata ไม่ได้พิสูจน์ API/browser flows หรือแก้ failed gate

ชื่อผู้ใช้เดิมทั้งเจ็ดกลับมาใช้งานได้แล้วตามหลักฐาน โดยสร้าง UUID เฉพาะ local
ใหม่หลัง rebuild ไม่ได้นำ Production account UUID/password/session มาใช้
`parity.*` เป็น actors เพิ่มสำหรับ automated negative/NULL-scope tests และ
ไม่แทนที่ช่องทางเข้าใช้งานเดิมของ Owner

**งานคงเหลือ:** รักษา stale Copy เป็น FAIL จนแก้ RPC/platform ใน scope ใหม่
ที่ได้รับอนุมัติและผ่านกรณีเดิมครบ สรุป PDF numeric/selected-Factor browser
checks ตามหลักฐานที่ตรวจจริงต่อจากนี้ การผ่าน numeric vector หนึ่งชุดและ
semantic match ไม่ใช่ wider D0 accounting PASS และไม่ลบ accepted residual
ของ release เก่า ไม่มี commit/push/deploy, Production mutation หรือ approval
ให้แก้ immutable migrations 027–030 จากผล local preparation นี้


## Proposed next correction — not authorized by this result

1. แยก stale-Copy correction เป็น scope เล็ก: ตรวจ Production transport version
   แบบ read-only และทบทวน error contract โดยไม่ยิงกรณี business failure บน
   Production; ไม่อัปเกรดเฉพาะ local เพื่อซ่อนผลทดสอบ
2. เมื่อ Owner อนุมัติ จึงเลือก supported error code ที่ไม่เข้าวง retry พร้อม
   client handling/tests ที่ตรงกัน หากเปลี่ยน DB ให้ใช้ **new forward migration**
   ห้ามแก้/replay 029 หรือ migration 027–030 อื่น
3. ทดสอบ stale token ผ่าน real JWT/HTTP ให้ได้ bounded error, ไม่เกิดสำเนา/route/
   item/request residue และไม่มี backend ค้าง; rerun normal Copy, idempotency/
   concurrency, scope/status denial และ selected-Factor/Save/output ที่เกี่ยวข้อง
4. เสนอ source/diff/test evidence ให้ Owner อนุมัติ release operations แยกภายหลัง
   ระหว่างนี้งาน dependency-security ยังเป็น release แรกตาม roadmap และไม่รวม
   defect correction หรือ feature work เข้าไปโดยอัตโนมัติ

Final local dev server ถูกคงไว้ที่ `http://127.0.0.1:3000` สำหรับชุดทดสอบนี้
ใช้ origin เดียวตลอด session; localhost เป็นคนละ origin และต้อง login ใหม่
ไม่ได้ start Production หรือ deploy แอป การเตรียมฐานรอบนี้เสร็จและบันทึกผล
PARTIAL แล้ว ไม่ใช่การอนุมัติ reset หรือแก้ product/platform ซ้ำโดยอัตโนมัติ

Diff whitespace และ local links/anchors ผ่าน 536 จุดใน Markdown ที่เปลี่ยน
38 ไฟล์; ไม่มี credentials ใน new repository artifacts ตาม pattern checks
HEAD ยังเป็น `b144bcae98b543ab231c503f435f261f946b9f89` บน `main`, staging ว่าง
การเปลี่ยนแปลงก่อนหน้านี้และงานรอบนี้ยังอยู่ local/uncommitted ทั้งหมด
