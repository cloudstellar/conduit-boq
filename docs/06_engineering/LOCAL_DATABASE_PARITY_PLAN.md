# Local Docker Database — Production-equivalent Baseline Preparation Plan

**Plan ID:** LOCAL-DB-PARITY
**Recorded:** 2026-10-14 (Asia/Bangkok)
**Plan refined:** 2026-10-15 (Asia/Bangkok)
**Status at planning (2026-10-15):** PLAN ONLY — NO DATABASE / CONTAINER CHANGE AUTHORIZED

> **Later execution boundary — 2026-10-23:** the Owner subsequently authorized
> the bounded local preparation/reset/restore/synthetic fixtures/tests and
> read-only Production schema capture described here. See the
> [execution result](./LOCAL_DATABASE_PARITY_RESULT.md) for the final
> **PARTIAL** result: captured app contracts match, API 46 PASS / 1 stale-Copy
> FAIL, original seven local accounts and bounded UI/output checks PASS. The plan-only statements below retain the earlier approval history;
> they do not authorize a product fix, dependency update, Git publication,
> Production write or replay of 027–030. Keep existing local usernames/password.

Owner ให้จัดทำแผนและบันทึกใน repository เท่านั้น ยังไม่อนุมัติการสร้าง/เริ่ม/
reset/restore/seed ฐานหรือ container, เปลี่ยน config/scripts/packages, export
Production, commit/push/deploy หรือแก้ข้อมูลใด ๆ **ห้าม replay migrations
027–030** รวมถึงการเปลี่ยนชื่อหรือรวมไฟล์เหล่านั้นไว้ใน runner ใหม่

แผนนี้เป็นการเตรียม environment ทดสอบ ไม่ใช่ product migration หรือการย้าย
Production เข้าองค์กร ลำดับผลิตภัณฑ์และข้อเสนอที่ Owner พักไว้ยังยึด
[Roadmap #09](../plans/product/09-integrated-roadmap-and-it-decision-handoff.md)
แผนนี้ไม่เพิ่ม Excel intake, scope/provenance enhancements หรือ quality
features ที่ Owner พักไว้เป็น product prerequisites

**ข้อปรับแผน 2026-10-15:** ฐานนี้ใช้ทดสอบ หากใช้ข้อมูลสมมติที่สร้างใหม่ได้
ไม่ต้อง backup ฐานทดสอบก่อน rebuild และไม่ต้องสร้าง Docker อีกชุดเป็นข้อบังคับ
แนวทางหลักคือเตรียม baseline ปัจจุบัน แล้ว rebuild `conduit-boq-local` เดิม
เมื่อได้รับอนุมัติ execution ไฟล์ backup/snapshot ของ Owner เป็นอีกส่วนหนึ่ง
ที่ไม่แตะและไม่เป็น prerequisite เมื่อไม่ได้เลือกใช้เป็น input ข้อเสนอนี้
แทนที่แนวทางเดิมที่กำหนดให้เก็บฐานทดสอบเดิมและสร้าง candidate แยกทุกครั้ง
ยังไม่มีการอนุมัติ reset หรือลบข้อมูลทดสอบในรอบจัดทำเอกสารนี้

วิธีทำงานก่อน Production ยึด [release working agreement](../07_process/RELEASE_PROCESS.md#working-agreement-20261015)
เป้าหมายของแผนนี้คือทำให้ฐานทดสอบเดิมพร้อมพิสูจน์พฤติกรรมปัจจุบัน ไม่เพิ่ม
ขั้นตอนสำรองหรือระบบทดสอบใหม่เป็นข้อบังคับ และไม่อ้าง CI/build เป็น DB PASS

## 1. สถานะที่ตรวจพบและความหมายของ local สองส่วน

| ส่วน | หลักฐาน/สถานะวันที่ 2026-10-14 | แนวทาง |
|---|---|---|
| ฐานทดสอบเดิม | Local Supabase project `conduit-boq-local`; Docker inventory พบ 7 containers ใน daemon ที่ตรวจ และ PostgreSQL 17.6 | เสนอ rebuild ชุดเดิมด้วยข้อมูลทดสอบที่สร้างใหม่ได้เมื่ออนุมัติ; งานเอกสารนี้ยังไม่ reset/stop/delete |
| Backup/snapshot | Owner ยืนยันว่าเป็นไฟล์ที่เก็บในเครื่อง ไม่ใช่ฐาน Docker อีกชุด; ยังไม่ระบุตำแหน่งและวัน capture | รักษาต้นฉบับ ไม่ค้น protected archive ไม่แก้/ย้าย/ลบ/upload หรือ restore โดยอนุมาน authority |
| Stack แยก (ทางเลือก) | ยังไม่มีการสร้าง | ใช้เฉพาะเมื่อมีเหตุให้ต้องทดสอบคู่กับฐานเดิม; ไม่เป็นข้อบังคับของแผน |

พอร์ตเดิม: API 55321, DB 55322, Studio 55323, Mailpit 55324; PostgreSQL image
ที่สังเกตคือ `public.ecr.aws/supabase/postgres:17.6.1.136` ไม่ใช่การตรวจรุ่น
Production สด ผล READ ONLY metadata ของฐาน local เดิม:

| Probe | ผล |
|---|---|
| `save_boq_with_routes` | มี |
| final Save `IF v_is_authorized IS NOT TRUE` ของ 030 | ไม่พบ pattern ที่ตรวจ |
| `duplicate_boq_atomic` ของ DUP-1 | ไม่พบ |
| `get_admin_profiles_page` ของ P-49 | ไม่พบ |

probes เหล่านี้ยืนยันช่องว่างบางส่วน ไม่ใช่ full schema audit และไม่บอกว่า
ทุก object ใน local อยู่ที่ migration ใด Bootstrap source หยุด 026 ตาม
[Local Supabase guide](../LOCAL_SUPABASE.md#applied-027030-and-local-parity-boundary)
จึงยังไม่ใช่ current Production-equivalent acceptance environment

**ตรวจซ้ำแบบ read-only 2026-10-15 เวลา 09:22 Bangkok:** local metadata
ที่ `2026-10-15T02:22:07.437546Z` ให้ผล probes สี่รายการข้างต้นเหมือนเดิม
ใช้ `BEGIN READ ONLY` และ `ROLLBACK`; ไม่อ่าน business rows หรือ Production
จึงยังมีช่องว่างเดิม ข้อมูลนี้ไม่ใช่ผล full schema audit หรือการทดสอบ Save

การตรวจ metadata ใน session ก่อนจัดแผนใช้ READ ONLY transaction และ rollback
ไม่ได้อ่าน BOQ/accounts/Catalog/Factor rows หรือทำ write ในฐาน ส่วน directory
`supabase/.snapshots/` ไม่พบใน canonical checkout ที่ตรวจ นี่ไม่ได้พิสูจน์ว่า
ไฟล์ backup ของ Owner สูญหายหรือไม่มีอยู่ที่อื่น ตำแหน่ง/ความสด/restore proof
ต้องยืนยันเฉพาะหากเลือกใช้ไฟล์นั้น ไม่ต้องค้นหาเพื่อเริ่มเตรียมฐานทดสอบใหม่

## 2. เป้าหมายและขอบเขตคำว่า equivalent

เป้าหมายคือ local test environment ที่มี **implemented database contracts
ตรงกับ source Production ที่ capture และได้รับอนุมัติ** พร้อม fixtures สำหรับ
ทดสอบจริงผ่าน Auth/Data API/RPC และบันทึก differences ที่ยอมรับอย่างชัดเจน

- ต้องเทียบ app-owned schema, private helpers, grants/RLS/triggers/RPC และ
  app-owned attachments บน managed Auth schema ไม่ใช่เทียบจำนวน tables อย่างเดียว
- Local test data ใช้ synthetic เป็น default ไม่ต้องเท่ากับ business rows หรือ
  Auth users ของ Production แต่ความสัมพันธ์/บทบาท/สถานะต้องถูกต้อง
- แยก contract parity, approved reference-data parity และ actual workload/
  performance evidence; synthetic fixture PASS ไม่พิสูจน์ full Production scale
- Auth/service configuration ต่างที่จำเป็นสำหรับ local ต้องอยู่ใน exception
  register ไม่อ้างว่า SMTP/SSO/Storage/Realtime หรือ cloud services ผ่านถ้าไม่ทดสอบ
- ไม่ปิด wider S0/D0, expanded Production persona residual หรือ future W-H/
  Expression ด้วย baseline PASS; แผนนี้ยังไม่สร้าง future schema/RPC เหล่านั้น
- ฐานทดสอบกับ backup มีหน้าที่แยกกัน Restoreable test baseline ไม่แทน encrypted
  Production backup, retention และ disaster-recovery proof แต่ไม่บังคับทำ backup
  ให้ฐานทดสอบที่ใช้ข้อมูลสมมติและสร้างใหม่ได้

## 3. วิธีได้ baseline โดยไม่ replay 027–030

เสนอใช้ **current-state schema materialization** จาก approved schema/metadata
capture แล้ว restore ลงฐานทดสอบที่ว่างหลัง rebuild และระบุ target ชัดเจน
baseline ประกอบด้วย final object definitions/ACL/config ณ จุด capture รวม
final contracts ของ 027–030 ไม่ใช่ predecessor -> patch -> replay history

1. ขออนุมัติ fresh Production **read-only metadata/schema capture** แยกก่อน
   เมื่อดำเนินการจริง รวมเฉพาะ runtime settings/reference hashes หรือ boolean
   flags ที่จำเป็นและได้รับอนุมัติ ไม่ export BOQ/accounts/business rows เอง
2. ระบุ source project, capture point, exact app identity, PG/extension versions,
   object inventory และ snapshot-consistency method; หาก source เปลี่ยนระหว่าง
   capture ให้ recapture/resolve ก่อนใช้ ไม่ประกอบหลายเวลาราวกับเป็น baseline เดียว
3. คัด app-owned public/private objects และ Auth attachments ที่จำเป็น แยกจาก
   platform-owned Auth schema ห้ามทับ managed Auth ของ local แบบ blind restore
4. Review/sanitize raw capture ก่อนเก็บ artifact ที่แชร์ได้ คง function owners,
   ACL/default privileges และ configuration ใน final contract ห้ามใช้การตัด
   owners/ACL ออกโดยไม่ออกแบบ mapping และตรวจสิทธิ์กลับให้ครบ
5. Materialize artifacts ใหม่จาก capture ที่ตรวจรับ ไม่คัด migrations 027–030
   มาเป็น SQL bundle หรือเรียกไฟล์เหล่านั้นทางอ้อม ตรวจ restore inputs/runner
   ก่อน execution ว่าไม่มี migration replay/predecessor patch path
6. เก็บ observed Production migration ledger เป็น provenance ใน manifest แยก
   จาก local restore lineage ไม่ใช้ migration repair/ปลอม local ledger ว่าเคย
   apply 027–030 และไม่สร้าง migration จาก expected empty-CLI-ledger drift

Proposed artifact layout (ยังไม่สร้าง SQL/scripts ในรอบนี้):

```text
supabase/local/baselines/<approved-baseline-id>/
  manifest.json
  schema.sql                 # final app-state materialization, no historical replay
  semantic-contract.json
  approved-differences.json
  synthetic-fixtures.sql    # reviewed fixture setup only
  verification-receipt.json
```

อยู่ภายนอก `migrations/` และ `supabase/migrations/` ไม่เป็น Production migration
Raw dump, credentials, actual Auth data, private backups และ unsanitized evidence
ไม่เข้า Git; ก่อนสร้าง artifacts ต้องกำหนด custody/ignore/review rules ที่อนุมัติ
หากมีเพียง repository/dated receipts เป็น source ให้เรียก test candidate เท่านั้น
ยังอ้าง live Production equivalence ไม่ได้

## 4. Proposed execution phases และจุดอนุมัติ

| Phase | งานในอนาคต | เงื่อนไขก่อนเริ่ม / ผลที่ต้องได้ |
|---|---|---|
| L0 — Planning | แผนนี้, cross-references และ gap inventory | อนุมัติแล้วเฉพาะเอกสาร; ไม่ทำ container/DB/config change |
| L1 — Current source | เก็บ fresh schema/metadata ที่จำเป็นเพื่อเตรียม baseline | อนุมัติ Production read-only capture scope ก่อน; ไม่รวม business-data export หรือการค้น backup โดยอัตโนมัติ |
| L2 — Restore/test tooling | เตรียม final-state schema, fixture setup และตัวตรวจเทียบสำหรับ `conduit-boq-local` เดิม | อนุมัติ local implementation/files scope ก่อนเขียน SQL/scripts/config; ตรวจว่าไม่มี 027–030 replay หรือเรียก bootstrap เก่าตรง ๆ |
| L3 — Rebuild และทดสอบ | Rebuild ฐานทดสอบเดิม restore final-state baseline ใส่ synthetic fixtures แล้วทดสอบ §7 | อนุมัติ exact local target และ reset/restore/test writes ก่อน; ใช้ข้อมูลทดสอบที่สร้างใหม่ได้จึงไม่ต้อง backup หรือสร้าง stack แยก; บันทึกผลและ differences |

ใช้ release/approval ที่เล็กและ reviewable ตาม Solo workflow ไม่เพิ่ม PR โดย
ไม่มีเหตุผล L2/L3 รวมเป็น local implementation/testing scope เดียวได้เมื่อ
ขอบเขตชัดเจน ไม่ต้องมี adoption release แยกสำหรับฐานทดสอบ แต่การจัดทำแผนนี้
ยังไม่อนุญาต phases ถัดไป

### Target ที่เสนอสำหรับ L3

- ใช้ project ID `conduit-boq-local` และ port range 55320–55329 เดิม ไม่เพิ่ม
  stack/volume/port range อีกชุดเป็นข้อบังคับ
- เริ่มจาก Supabase Auth/Data API/PG ที่แอปใช้; PG major/extension versions
  และ image digest pin ตาม approved capture/compatibility decision
- app test origin ใช้ `http://localhost:3000` โดย auth site/callback ต้อง
  สอดคล้องกัน และใช้ local Supabase URL/key ใน process/build ที่ระบุ
- target checks ต้อง pin local Unix Docker daemon + exact container/database/
  labels/project/API port ไม่รับ inherited remote Docker/DB URL โดยเงียบ ๆ
- Rebuild จำกัดเฉพาะฐานทดสอบ target นี้เมื่ออนุมัติ ห้าม broad prune/cleanup
  หรือรวม backup/snapshot files และทรัพยากรอื่นเข้ามา

หากภายหลังมีข้อมูลทดสอบที่ต้องเก็บไว้หรือจำเป็นต้องเปรียบเทียบฐานสองชุด
จึงค่อยเลือกเก็บเฉพาะข้อมูลนั้นหรือใช้ stack แยก ไม่มีข้อกำหนดให้ค้น backup
หรือทำ recovery rehearsal ก่อน rebuild ฐานทดสอบที่สร้างใหม่ได้

## 5. Semantic parity matrix

| Layer | สิ่งที่ต้อง capture/เทียบ | สิ่งที่ไม่ใช้เป็นหลักฐานเพียงอย่างเดียว |
|---|---|---|
| Relations | schemas/tables/views/sequences, columns/types/defaults/checks/FKs/unique/indexes และ dependencies | จำนวน tables, migration เลขล่าสุด |
| Security | schema/table/column/function grants, role attributes/membership/inheritance รวม SUPERUSER/BYPASSRLS/effective privileges, global/schema default privileges, RLS enabled/forced, policy role/command/permissive/USING/WITH CHECK | ACL เท่ากันแต่ role bypass ต่างกัน, UI ปุ่มซ่อน หรือการใช้ service key ให้ test ผ่าน |
| Functions | signatures/arg names/defaults/result/body, owners/language, definer/invoker, volatility/parallel/config/search_path/timeouts และ overload inventory | OID/filenode ของคนละฐาน หรือชื่อ function เหมือนกัน |
| Triggers | definition/enabled/order, protected columns, app-owned `auth.users` attachments และ dependency functions | trigger ชื่อเหมือนกัน หรือปิด trigger เพื่อ seed |
| Runtime | PG/extensions/app-relevant settings, timezone/collation/locale, Auth/PostgREST images/config, exposed schemas/search path/max_rows, redirects/session/admission nonsecret settings | version ใน package.json หรือ local config เท่ากับ Production โดยสมมติ |
| References | approved Catalog/Factor fixture versions/defaults/flags/hashes และ trusted price behavior | synthetic references เท่ากับราคาจริงทุกกรณี |
| Behavior | authenticated personas, denials/no residue, atomic Save/Copy, retries/races, saved output | postgres SET ROLE/mock Auth หรือ Vitest source checks อย่างเดียว |

Successor contracts ที่ต้องพบใน final baseline:

- P-49: current active-profile predicates, pending defaults, protected profile
  mutations, append-only `user_authorization_events`, current profile/Admin RPCs
- 028: private bounded catalog gate projection + public wrapper; raw
  `app_settings` ไม่เปิด anonymous/authenticated API ตาม final ACL
- DUP-1: `private.boq_copy_requests`, trusted owner-only graph helper และ
  `duplicate_boq_atomic` พร้อม exact signatures/ACL/guards
- 030: final Save denial เป็น `IF v_is_authorized IS NOT TRUE` และ function
  owner/ACL/config/calculations เดิมครบ; ไม่มี predecessor overload/broad grant

Normalize environment-specific role identities ด้วย mapping ที่ตรวจรับ แต่ไม่
เปลี่ยนความหมาย privilege ห้าม blind restore platform roles/password hashes
เทียบ scoped effective privileges และ owner paths พร้อม approved exceptions
เมื่อ managed platform กับ local มี role posture ต่างกัน
ข้อแตกต่างทุกข้อมี owner/reason/test evidence และ
เป็น MATCH / APPROVED EXCEPTION / UNVERIFIED DRIFT ถ้า critical drift ยังไม่
อธิบายหรือ Auth attachments ไม่ครบ ห้ามใช้ฐานทดสอบนี้เป็นหลักฐาน release PASS

## 6. Fixtures และเครื่องมือเดิมที่ต้องประเมินก่อน reuse

Default fixtures ใช้ข้อมูลสมมติและ Auth UUID ใหม่ที่สัมพันธ์กันถูกต้อง:

- coherent org -> department -> sector tree ทั้ง active/inactive/cross-scope
- 5 roles, active/pending/suspended/inactive/missing-profile, owner/assignee/null
  และ nullable-scope combinations ที่ทดสอบ authorization ได้จริง
- normal/multi-route BOQs รวมชื่อ route ที่มี comma; legacy และ complete/
  incomplete Factor-bound graphs ตาม existing Copy/output contract
- approved numeric vectors ที่ใช้วัด current behavior โดยไม่แต่ง D0 decisions
  หรือแก้ residual การปัดเศษของระบบเดิมในขั้นเตรียม environment
- synthetic reference fixture เป็น default; หากต้องการ official Catalog/Factor
  dataset/hash parity ต้องอนุมัติ immutable reference source และ local setup scope
  ใหม่ โดยไม่ publish/restore/reprice เปลี่ยน Production หรือ BOQ เก่า

ห้ามนำ Production password hashes/sessions/refresh tokens/OTP/MFA/provider
identities/JWT-signing secrets เข้ามา ใช้ passwords/keys เฉพาะ local test
ข้อมูล BOQ จริงหรือ sanitized snapshot ต้องได้รับ approval/provenance review
แยก ไม่ใช้ไฟล์ backup ที่ Owner กล่าวถึงเป็น input โดยอัตโนมัติ

| เครื่องมือเดิม | เหตุผลที่ยังใช้ตรง ๆ ไม่ได้ | แนวทางที่เสนอ |
|---|---|---|
| `scripts/bootstrap-local-db.sh` | reset ชุดเดิม, restore ignored snapshots, apply 009–026, category backfill, seed/write smoke | ห้ามรันตรง ๆ เพื่อแผนนี้; เตรียม final-state restore สำหรับ local target ที่ตรวจแล้ว |
| `supabase/local/production-baseline.sql` | historical public-schema capture ไม่ใช่ post-030; ชื่อไม่ได้พิสูจน์ความสด/private/Auth attachments/ACL | preserve ของเดิม; สร้าง approved capture artifact ใหม่ |
| `scripts/seed-local-users.mjs` | first org/dept/sector อาจไม่สัมพันธ์; service-key profile upsert authority fields ไม่เข้ากับ P-49 revoke/trigger guards | reviewed coherent fixtures + controlled local restore/bootstrap-admin boundary; ห้ามลด ACL/RLS/trigger เพื่อให้ seed ผ่าน |
| `scripts/smoke-local-auth.mjs` | active Admin เท่านั้น; สร้าง Auth session ไม่ใช่ read-only | ปรับใช้แนวคิดใน local harness ที่ครอบคลุม persona จริงหลังอนุมัติ |
| `scripts/test-boq-save-null-authorization.mjs` | รัน 030 และทดลอง replay rejection | ห้ามรัน; reuse เฉพาะ case definitions/assertion ideas กับ RPC ที่ restore เป็น final state แล้ว |
| SQL predecessor/smoke fixtures ของ 029/030 | mock Auth/catalog gates หรือปิด triggers; เป็น bounded historical tests | ไม่ restore/run ทั้งชุด; adapt cases โดยตรวจ final contract ไม่เพิ่ม bypass/stubs |
| Master Catalog smoke/concurrency scripts | บางตัวทำ writes/publish/restore หรือ guard target ตาม naming ไม่ครบ | review ทีละ script; เลือกเฉพาะ approved synthetic test actions ใน local test target |

Fixture setup ต้องมีลำดับ Auth user -> protected profile -> coherent business
graph ที่ถูกต้อง Bootstrap Admin ใช้ privileged **local setup boundary** ที่
ตรวจและอนุมัติ ไม่ใช่ production account operation ทดสอบทุก RPC ภายหลังด้วย
normal public key + real Auth JWT ตรวจ final grants/triggers/config อีกครั้ง
ไม่มี test-only bypass/helpers/disabled trigger หลงเหลือใน accepted baseline

## 7. Acceptance ของฐานทดสอบ

1. Manifest/hash ตรงกับ approved source/target; rebuild/restore ฐานทดสอบได้
   reproducibly โดยไม่เรียก 027–030 และไม่แตะไฟล์ backup ของ Owner
2. Semantic diff ครบ §5; ไม่มี unexplained permissions/function/Auth drift
3. Real local Auth login + Data API/RPC positive/negative personas รวม pending,
   inactive/suspended, missing profile, cross-scope และ SQL NULL scope
4. Profile/Admin transitions ใช้ trusted controls; direct authority-field writes
   ถูกปฏิเสธ; final ACL/config ตรง ไม่ใช้ service role เป็น business actor
5. Save valid vectors -> reload -> saved Print/PDF/Excel ตรงตาม current contract;
   unauthorized/invalid requests ถูกปฏิเสธโดยไม่ทิ้ง partial business graph หรือ
   unauthorized audit/private-ledger mutation ส่วน forged Catalog unit/price/
   category/amount fields ใช้ existing ignored/rederived contract ไม่สร้าง
   rejection policy หรือแก้ known numeric residual ใหม่ในงาน baseline
6. Atomic Copy preserve semantics, eligible selected-Factor output lock, retry/
   idempotency/concurrency และ stale requests; ไม่ silently reprice Catalog/Factor
7. Auth callback/origin/session behavior ตรวจจริง; config ปัจจุบันใช้
   127.0.0.1 site URL แต่คู่มือใช้ localhost จึงต้องทำ local origin ให้สอดคล้อง
8. Services ที่ excluded จาก local start (Storage/Realtime/Edge runtime ฯลฯ),
   SMTP/SSO และ platform differences ระบุเป็น exception/unverified แยก
9. Checks ที่เหมาะกับ source/harness ที่เปลี่ยนหลังอนุมัติ เช่น lint/typecheck/
   tests/build; build ไม่แทน database/Auth/output acceptance
10. Receipt ระบุ source timestamp, hashes, image digests, scope/cases/results,
    accepted exceptions และ known residuals; หากทดสอบไม่ผ่านให้แก้ baseline/
    tooling แล้ว rebuild ใหม่ ไม่ต้องเก็บฐานทดสอบเก่าเป็น rollback ทุกครั้ง

ผ่านเฉพาะ synthetic/contract test ให้รายงานระดับนั้น ไม่เรียก live Production
equivalent หรือ accounting PASS เกินหลักฐาน R0A/master-catalog persona residual
เดิมยังไม่กลายเป็น PASS และยังไม่พิสูจน์ future W-H/Expression implementation

## 8. ขอบเขต rebuild และ decision ที่ต้องปิด

- ก่อน L3 ระบุ exact local test target และขอบเขต reset ให้ชัดเจน การอนุมัติ
  ในอนาคตต้องครอบคลุมการแทนที่ข้อมูลทดสอบเดิมด้วย fixtures ที่สร้างใหม่ได้
- ไม่บังคับ backup ฐานทดสอบหรือสร้าง stack แยก หากมีข้อมูลที่ต้องเก็บเฉพาะ
  จึงค่อยเลือกวิธีเก็บก่อน reset ไม่สมมติว่าการอนุมัติเอกสารอนุญาตลบข้อมูลแล้ว
- ไฟล์ backup/snapshot ของ Owner คงไว้ ไม่ค้น/restore/overwrite โดยอัตโนมัติ
  ตำแหน่งและวัน capture ต้องยืนยันเฉพาะเมื่อเลือกใช้ไฟล์นั้นเป็น input
- เมื่อทดสอบไม่ผ่าน เก็บผล failure แล้วแก้ baseline/tooling และ rebuild ใหม่
  ได้ภายใน execution scope ที่อนุมัติ ไม่ต้องมีฐานเก่าหรือ adoption ceremony

| Decision | สถานะปัจจุบัน |
|---|---|
| Fresh Production metadata/schema capture method/scope | ต้องอนุมัติใหม่; ไม่มี capture ในการเขียนแผนนี้ |
| Local target/reset scope และ image/origin compatibility | เสนอใช้ `conduit-boq-local` เดิม; ยังไม่อนุมัติ reset |
| Synthetic vs approved immutable reference fixtures | synthetic default เสนอ; full reference fidelity ต้องเลือก scope |
| Local fixture/Admin bootstrap + harness design | ต้อง review/อนุมัติ implementation ก่อนสร้าง scripts/SQL |
| Local implementation/rebuild/restore/test writes | ยังไม่อนุมัติ; ไม่บังคับ backup หรือ stack แยก |
| Backup/snapshot input | ไม่ใช้เป็น default และไม่เป็น blocker; ระบุ path/capture/custody เฉพาะหากเลือกใช้ |

## 9. Sources และขั้นถัดไป

- [Local Supabase guide](../LOCAL_SUPABASE.md)
- [Bootstrap source](../../scripts/bootstrap-local-db.sh), [old seed](../../scripts/seed-local-users.mjs), [Auth smoke](../../scripts/smoke-local-auth.mjs)
- [Schema](../04_data/DATABASE_SCHEMA.md), [Security](../04_data/SECURITY_MODEL.md), [migration ledger](../04_data/MIGRATIONS.md)
- [Master Catalog #106](../plans/master-catalog/106-phase4-master-catalog-exact-remaining-work-handoff.md) / [#107](../plans/master-catalog/107-phase4-p49-master-catalog-final-closeout-result.md)
- [DUP-1 receipt](../plans/product/04-atomic-boq-duplicate-production-release-result.md)
- [Save NULL guard receipt](../plans/security/04-boq-save-null-authorization-production-release-result.md)
- [Supabase multiple local projects](https://supabase.com/docs/guides/local-development/running-multiple-local-projects)
- [Supabase platform restore](https://supabase.com/docs/guides/self-hosting/restore-from-platform)
- [PostgreSQL 17 pg_dump](https://www.postgresql.org/docs/17/app-pgdump.html)

Official workflows เป็น technical references ไม่ override repo no-link/no-replay
boundary ห้ามนำตัวอย่าง db pull/push/reset/migration repair มาใช้โดยอนุมาน
อนุมัติ ขั้นถัดไปคือเลือก L1 metadata capture scope แล้วเตรียม L2/L3 สำหรับ
rebuild ฐานทดสอบเดิมเมื่ออนุมัติ ไม่ต้องระบุ backup location หรือสร้างอีก stack
เพื่อทำขั้นนี้
ยังไม่แก้ฐานข้อมูล/scripts/config และยังไม่ commit/push แผนในรอบนี้
