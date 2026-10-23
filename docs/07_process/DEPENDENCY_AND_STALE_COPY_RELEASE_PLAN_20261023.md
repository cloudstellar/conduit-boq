# แผน Dependency ก่อน → Stale Copy แยกชุด — 23 ตุลาคม 2026

**สถานะล่าสุด: A และ B ปิดงานแล้ว / Production HTTP ของ B = NOT RUN ตามการตัดสินใจ Owner**

Owner เลือกไม่ทดสอบ stale Copy ผ่าน Production HTTP เพิ่ม และสั่งปิด B โดยคง
NOT RUN ตามจริง ดู [B final closeout](../06_engineering/STALE_COPY_B_RELEASE_CLOSEOUT_20261023.md)
Client `42e01c5`, migration ledger `20261023063934`, local integration/quality
และ Production metadata/ledger postflight เป็นหลักฐานที่ใช้ปิดขอบเขตนี้
HTTP probe ไม่เป็นงานค้างบังคับของ B ไม่ขออนุมัติเดิมซ้ำโดยอัตโนมัติ และไม่อ้าง
full live business-flow PASS การตัดสินใจนี้ไม่ลดเกณฑ์ทดสอบ LIST-1B/งานถัดไป
ขอบเขต execution ใช้สิ้นสุดแล้ว รอบนี้ทำเฉพาะเอกสาร local ไม่มี Production
หรือ commit/push/deploy ข้อความ plan/stage ด้านล่างคง chronology เดิม

Owner อนุมัติ DB step ภายหลังในช่วงงด Copy 15 นาทีและไม่มี DDL อื่นแล้ว:
preflight ผ่าน → apply 031 ครั้งเดียว → postflight metadata/ledger และ independent
review ผ่าน Ledger จริงคือ `20261023063934/boq_duplicate_stale_conflict_guard`
ดู [ผล Production 031](../06_engineering/STALE_COPY_031_PRODUCTION_MIGRATION_RESULT_20261023.md)
ไม่มี business RPC หรือ commit/push/deploy เพิ่ม จึงยังไม่อ้าง full Production
stale HTTP PASS อำนาจ execution ใช้สิ้นสุดแล้ว; 027–031 immutable/no-replay
ข้อความ 031-unapproved ด้านล่างเป็น chronology ก่อนการอนุมัติ/รันครั้งนี้

Owner อนุมัติ client B แบบ Solo ในภายหลังและปล่อย exact B4 ที่ `42e01c5`
แล้ว: Quality 658 tests ผ่าน, Vercel Production Ready/current ตรง source
ดู [ผล client B](../06_engineering/STALE_COPY_B_CLIENT_PRODUCTION_RELEASE_RESULT_20261023.md)
031 อยู่ใน commit เป็น SQL source เท่านั้น ไม่มี DB operation/migration
และยังไม่อนุมัติ apply หรือ business RPC proof ขั้น client ปิดแล้ว แต่ stale
Copy ฝั่ง DB ยังไม่ปิด อำนาจ publication ใช้สิ้นสุด; เอกสารนี้ยัง local ไม่มี
push เอกสารรอบสอง ข้อความ A-only/B-unapproved ด้านล่างเป็น chronology เดิม

Owner อนุมัติ A แบบ Solo ในภายหลัง และดำเนินการครบที่ commit `a3114fc`:
Quality ผ่าน, Vercel Production Ready/Current และ bounded public HTTP checks
ผ่าน ดู [ผลปล่อย A](../06_engineering/DEPENDENCY_A_PRODUCTION_RELEASE_RESULT_20261023.md)
ข้อยกเว้น stale Copy ถูกใช้สิ้นสุดสำหรับ A แล้ว แต่ FAIL ยังต้องติดตามจน B แก้เสร็จ
B/client/031 ยังไม่อนุมัติ ไม่มี DB operation/migration หรือ push เอกสารรอบสอง
เอกสาร closeout นี้คงอยู่ local; ข้อความรอบจัดทำแผนด้านล่างเก็บตาม chronology
จึงไม่ใช่คำอธิบายว่าการปล่อย A ภายหลังยังไม่เกิดขึ้น

Owner ระบุว่า “ยอมรับ stale Copy FAIL ชั่วคราวเฉพาะ dependency release นี้ครับ
เตรียมแผนปล่อย dependency ก่อน แล้วตามด้วย stale Copy แยกชุด ให้ผมตรวจก่อน
โดยยังไม่ commit/push/deploy หรือแตะ Production”

รอบนี้ทำเฉพาะเอกสารและตรวจไฟล์/hash ในเครื่อง ไม่มี staging, commit/push,
deployment, Production request, runtime/package change, DB test/write/reset
หรือ migration application/replay แผนนี้ไม่ใช่คำสั่งให้เริ่มดำเนินการ

| ลำดับ | สิ่งที่จะปล่อย | ขอบเขตฐานข้อมูล |
|---|---|---|
| **A — Dependency security** | 8 ไฟล์ dependency/lint ที่ตรวจแล้ว | ไม่มี migration/RPC/schema/data change; stale Copy เดิมยังเป็น FAIL ที่ Owner ยอมรับเฉพาะ A |
| **B — Stale Copy** | client ที่รองรับ error เก่า/ใหม่ + 031 + tests/support แยกจาก A | หลัง client พร้อม จึง apply 031 ครั้งเดียวใน window ที่อนุมัติอย่างเจาะจง |

## 1. ข้อยกเว้นที่ยอมรับแล้ว — ใช้กับ A เท่านั้น

- ผูกกับ A 8 ไฟล์ตามข้อ 2, base `b144bcae98b543ab231c503f435f261f946b9f89`
  และ hash ในท้ายแผนนี้ ไม่มี 031 หรือ stale-client patch รวมอยู่
- ยอมรับเฉพาะ known stale-source Copy failure ของ RPC เดิมที่ใช้ `40001`:
  หลักฐาน local ก่อน 031 คือ API **46 PASS / 1 FAIL** และ retest บน actual
  PostgREST 14.5 timeout **15,003 ms** ผล FAIL คงเดิม ไม่เปลี่ยนเป็น PASS
- Production impact/prevalence ของ stale Copy ยังไม่ได้ทดสอบ ข้อยกเว้นไม่ได้
  รับรองว่าปัญหานี้ไม่มีผลต่อบริการ และไม่อนุญาตให้ยิงกรณีค้างซ้ำใน Production
- ไม่ยกเว้น audit/security findings ใหม่, regression ใหม่, authorization,
  ราคา/การคำนวณ, unknown relevant parity หรือเงื่อนไขอื่นของ release
- ใช้ตัดสินใจปล่อย **A ครั้งนี้** และถูกใช้สิ้นสุดเมื่อปิด A ไม่ส่งต่อไป B,
  release อื่น, rollback หรือ source/scope ที่เปลี่ยนอย่างมีสาระสำคัญ
  หลังปิด A ปัญหาเดิมยังต้องติดตามจน B แก้เสร็จ ไม่ถือว่าหายไปตามข้อยกเว้น
- ไม่ต้องขอการยอมรับข้อยกเว้นเดิมซ้ำสำหรับ A นี้ แต่การเผยแพร่และ Production
  operations ยังต้องมีการอนุมัติขั้น execution ตามขอบเขตที่ระบุด้านล่าง

## 2. Source ที่จะใช้

Git ที่ตรวจในเครื่อง: `main`, HEAD `b144bcae98b543ab231c503f435f261f946b9f89`,
มีงานเดิมค้างใน worktree และไม่มี staged changes ยังไม่ได้ตรวจ remote/live
deployment ในรอบนี้ ค่าดังกล่าวต้องตรวจสดอีกครั้งเมื่อได้รับ execution approval

**A: stage/commit เฉพาะ 8 ไฟล์นี้เมื่ออนุมัติแล้ว**

1. `package.json`
2. `package-lock.json`
3. `app/admin/master-catalog/_components/MasterCatalogPlacementWorkspace.tsx`
4. `app/boq/create/page.tsx`
5. `app/price-list/page.tsx`
6. `hooks/use-mobile.ts`
7. `lib/hooks/useDashboardData.ts`
8. `tests/master-catalog-operator-workflow.test.ts`

Next/config 16.4.2, PostCSS override 8.5.23, resolved Sharp 0.35.5;
React/DOM 19.2.3 และ ExcelJS/UUID override ตาม lock ที่ตรวจแล้ว ไม่เพิ่ม package
หรือเปลี่ยน lock อีกเพื่อเตรียม release โดยไม่มีเหตุและการ review ใหม่

**B: หลัง A ปิดแล้ว ใช้ A เป็น base และเพิ่มเฉพาะ 4 ไฟล์นี้**

1. `lib/boq/duplicate.ts`
2. `tests/duplicate-boq-client.test.ts`
3. `migrations/031_boq_duplicate_stale_conflict_guard.sql`
4. `scripts/smoke-local-db-parity.mjs` — test support ไม่ใช่ Production runner

ไฟล์ support ข้อ 4 ยัง untracked และมี shared baseline harness อยู่ด้วย
ต้อง review ทั้งไฟล์ก่อนรวม ไม่อ้างว่า diff ทั้งไฟล์เป็นงาน stale Copy ใหม่ทั้งหมด
มันรับ fixture/SQL callback จาก caller และไม่ต้อง publish baseline restore,
seeding, schema capture หรือ credential files ตามไปด้วย

งาน roadmap/baseline/เอกสารเดิมกลุ่ม C คงอยู่ในเครื่อง ไม่ใช้ `git add .`, broad
stash/clean, reset หรือ cleanup เพื่อทำให้ checkout สะอาด แผน/หลักฐาน review
รอบนี้ยังเป็นเอกสาร local; code commits A/B ข้างต้นไม่รวมเอกสารเหล่านี้โดยอัตโนมัติ
หากจะ publish เอกสารภายหลังต้องเลือกชุดที่ลิงก์ครบและอนุมัติผล auto-deploy ด้วย

## 3. หลักฐานที่มีแล้ว และขอบเขตที่ยังไม่ใช่ PASS

| หลักฐาน local | A | A+B หลัง dependency |
|---|---|---|
| Source แยกจาก HEAD ด้วย allowlist/hash | PASS | PASS |
| Vitest | 56 files / **643 PASS** | 56 files / **658 PASS** |
| Lint | 0 errors / 3 warnings เดิม | เช่นเดียวกัน |
| TypeScript / default Next production build | PASS / PASS | PASS / PASS |
| Production dependency audit | **0 findings** บน lock เดียวกัน | lock ไม่เปลี่ยน |
| Native dependencies | Darwin arm64, Linux arm64 และ Linux x64 smoke PASS | ใช้ graph เดียวกับ A |
| DB/API/browser | dated pre-031 evidence; stale FAIL ตามข้อยกเว้น | dated **49 API PASS** และ UI สองแท็บ deny → reload → Copy ใหม่ PASS |

649/664 tests เดิมรวม 6 tests ของเครื่องมือ baseline C; จำนวน 643/658 เกิดจาก
การแยก source ไม่ได้ skip test ปัจจุบัน local DB เป็น **captured baseline +031**
ห้ามใช้ A ที่ทดสอบกับ DB นี้อ้างว่าได้ทดสอบ predecessor เดิมใหม่แล้ว ไม่ reset
DB หรือ replay 027–031 เพื่อสลับ target ใช้ dated receipts และระบุ target ให้ตรง

หลักฐานก่อนหน้านี้เก็บทั้ง attempt ที่ FAIL และผลแก้สภาพแวดล้อมแล้วผ่านไว้
Linux x64 เป็น Docker Desktop บน arm64 host ไม่ใช่การรับรองเครื่อง Vercel จริง
Production runtime/config, remote Git, source commit/deployment IDs ใหม่ และ
031 target preflight ยัง **NOT RUN** ในรอบแผนนี้

11 dev audit findings ยังเป็นงานแยก Selected-Factor stale browser recovery และ
browser request-count/UUID tracing ไม่ได้ capture; real API สอง Copy modes ผ่าน
ไม่อ้าง full browser/load/SSO/wider D0 PASS และไม่เปิดงาน PDF ที่ Owner deferred

## 4. เส้นทางเผยแพร่ที่เสนอ — Solo, ไม่เพิ่ม PR โดยอัตโนมัติ

เสนอ direct Solo สำหรับแต่ละ release: ตรวจ diff/source ในเครื่อง → commit
allowlist ที่ตรงหลักฐาน → ตรวจ commit จริงอีกครั้ง → push `main` เมื่อได้รับ
อนุมัติที่รวมผล Production auto-deploy แล้ว จากนั้นตรวจ CI/Vercel และ postflight
ไม่สร้าง branch/PR/stack/backup เพิ่มเป็นข้อบังคับ และไม่ลบ branch/worktree ใด

ข้อเท็จจริงจาก `.github/workflows/quality.yml`: feature-branch push ใหม่ไม่ทำให้
Quality รัน; workflow รันบน PR หรือ push `main`/legacy branch ที่ระบุเท่านั้น
Quality ทำ install/lint/test/build ไม่ทำ audit:prod, standalone TypeScript,
native smoke, Docker/API/browser หรือ migration

**เส้นทาง Solo นี้ CI และ Vercel อาจเริ่มคู่กันหลัง push main จึงไม่ใช่ CI gate
ก่อน Production** ต้องให้ Owner เห็นและเลือกเส้นทางนี้ในการอนุมัติ execution
หาก Owner ต้องการ CI ผ่านก่อน Production ให้เปลี่ยนเป็นหนึ่ง PR ต่อ release
โดยใช้ workflow เดิม แทนการสมมติว่า feature-branch push มี CI; ไม่เปลี่ยน workflow
หรือสร้าง PR ในรอบนี้ อำนาจ Solo จาก R0A/030 เดิมไม่ถูกนำมาใช้ซ้ำ

Preview ไม่ใช่ข้อบังคับของแผน Solo นี้ ถ้าเลือกใช้ PR/Preview ภายหลัง ต้องยืนยัน
backend/credentials เป็น non-Production **ก่อน push ที่จะสร้าง Preview** หากไม่มี
target ที่ปลอดภัยให้ HOLD Preview; ห้ามชี้ไป Production แล้วพึ่งเพียงการไม่กด Save
CI placeholder env ไม่ใช่หลักฐานว่า Vercel Preview แยกจาก Production

## 5. ขั้นตอน A — ไม่มี DB change

1. **Preflight หลังอนุมัติ:** ตรวจ Git/remote/base และ runtime/diff เทียบ allowlist
   กับ hash; ถ้า main เปลี่ยนให้ทบทวน delta ไม่ rebase/cherry-pick/overwrite เงียบ ๆ
   ตรวจ deployment project/branch/build/runtime และ rollback target ที่จะใช้
   โดยเก็บเฉพาะข้อมูลจำเป็น ไม่เผย secret ไม่มี DB write/migration ใน A
2. **ก่อน push:** ยืนยัน exact source และหลักฐาน quality/audit/native/local DB
   ที่ยังใช้ได้ รันซ้ำเฉพาะสิ่งที่เปลี่ยนหรือหลักฐานไม่พอ ไม่ยิง known hanging case
   เพื่อให้เขียว ไม่สร้าง Catalog draft/Publish/Restore หรือเปลี่ยน Factor/accounts
3. **Publication:** stage เฉพาะ A8; ตรวจ staged names/content; commit และตรวจ
   commit tree ว่าตรง candidate ก่อน push main ตามเส้นทางที่ Owner เลือก/อนุมัติ
   การอนุมัติ push main ต้องรวมการ deploy ที่เกิดอัตโนมัติ ไม่มี housekeeping push แฝง
4. **Postflight ที่อนุมัติไว้:** ตรวจ exact commit/tree, GitHub Quality และ Vercel
   Production Ready/Current, build/dependency version evidence และ console/UI
   ที่อนุมัติให้อ่าน หากอนุมัติ saved-BOQ view/Print QA ให้ระบุ sample/actor ก่อน
   execution; ไม่มี Create/Save/Copy/Delete, Catalog/Factor/account write หรือ stale probe
5. **ปิด A:** บันทึก PASS/FAIL/NOT RUN กับ source/deploy IDs จริง ยังคง stale FAIL
   เป็น accepted residual ของ A และใช้ข้อยกเว้นครั้งนี้สิ้นสุด ไม่เรียก stale PASS
   จากนั้นเตรียม B เป็น release ถัดไป ไม่แทรก LIST-1B/S0/Expression เข้า release นี้

## 6. ขั้นตอน B — client ก่อน แล้ว 031 ใน window เฉพาะ

1. ใช้ source ที่ปิด A แล้วเป็น base; เทียบ B4 hashes กับแผนและ A+B receipts
   หาก A เปลี่ยนอย่างมีสาระสำคัญให้ทดสอบส่วนที่ได้รับผลใหม่ ไม่มี B-only validation
   บน Next เก่าที่จะนำมาใช้แทนลำดับ A → B นี้
2. เผยแพร่ compatible client ตามเส้นทางที่อนุมัติ แล้วตรวจ commit/CI/deployment
   ให้พร้อม **ก่อน DB step** client รองรับทั้ง `40001` และ exact
   `PT409` + `BOQ_SOURCE_STALE`; แท็บเก่าอาจเห็น generic retry จน refresh
3. **Immediate DB preflight ภายใต้สิทธิ์ B ที่อนุมัติใหม่:** ตรวจ project
   `otlssvssvgkohqwuuiir`/database `postgres`, session/current user `postgres`,
   predecessor hash, owner/ACL/config และ metadata ของ current-profile/BOQ/ledger
   contracts ที่เกี่ยวข้อง เทียบ captured baseline; ตรวจ ledger ว่ายังไม่ apply
   target/later conflict และ contention/retrying Copy ใช้ READ ONLY transaction เก็บ target OID ก่อนรัน
   ไม่บังคับให้ OID ตรงกับ local `51020` ถ้า target เป็น successor อยู่แล้วให้ HOLD
4. กำหนด operator/window ที่ไม่มี DDL อื่นแก้ function/security metadata และควบคุม
   new Copy submissions ด้วยวิธีที่ Owner เลือก ไม่มี flag/account permission ใหม่
   หากมี Copy retry ค้างให้ HOLD; ไม่ restart/terminate session โดยอัตโนมัติ
5. **Proposed executor:** ใช้ Supabase migration API แบบที่บันทึกใน 030 closeout
   (`supabase_apply_migration`) เมื่อยืนยัน tool/role/target และอนุมัติแล้ว เรียก
   ครั้งเดียวด้วยชื่อ `boq_duplicate_stale_conflict_guard` และ bytes 031 ที่ rehash
   ทันทีก่อนรัน จากนั้นอ่าน generated ledger identity จริง ไม่ประดิษฐ์ timestamp
   หาก executor ใช้ไม่ได้ให้ HOLD ไม่ fallback raw SQL/db push/link/reset เอง
   ห้าม replay 027–030 และห้าม apply 031 ซ้ำบน local ที่เป็น successor อยู่แล้ว
6. **Postflight:** ตรวจ successor hash, target OID/metadata/ACL/config ก่อน–หลัง,
   ledger target ใหม่หนึ่งรายการ และไม่มี unexpected business/reference/account
   changes หรือ retry ค้าง การ deploy source SQL ไม่ใช่หลักฐานว่า migration รันแล้ว
7. **Production HTTP proof ที่เสนอให้ระบุใน B approval:** หนึ่ง bounded stale
   Copy POST แบบ preserve บน sample/actor ที่ Owner ระบุ ใช้ fresh request UUID
   และ token เก่าที่แน่นอน คาด HTTP409/`PT409`/marker ภายใน timeout 5 วินาที
   ไม่ retry อัตโนมัติ ตรวจว่าไม่มี BOQ/routes/items/request-ledger/authorization-event residue
   แม้คาดว่าจะ rollback ทั้ง request ก็เป็น business RPC ซึ่งต้องอนุมัติให้ทดสอบ
   อย่างเจาะจง หากไม่อนุมัติ ให้บันทึก Production HTTP **NOT RUN** และไม่ประกาศ
   full Production stale-Copy behavior PASS; ห้ามเพิ่ม normal Copy/Save writes เอง
8. ปิด B พร้อม ledger/source/deployment/QA receipt และข้อจำกัดจริง ข้อยกเว้นของ A
   ไม่ยกเว้น failed stale test ของ B และไม่อนุญาตการแก้ S0/D0/graph-token model เพิ่ม

## 7. เงื่อนไข HOLD และการรับมือ

| เหตุการณ์ | สิ่งที่ทำ |
|---|---|
| A source/lock/scope เปลี่ยน, audit finding หรือ regression ใหม่ | HOLD และ review ผลกระทบ; exception นี้ไม่กลบปัญหาใหม่ |
| CI/Vercel/actual source ไม่ตรงหรือไม่ผ่าน | ไม่ closeout; เก็บหลักฐานและใช้เฉพาะ recovery ที่อนุมัติ |
| 031 predecessor/owner/ACL/config/role/ledger ไม่ตรง | หยุดก่อน write ไม่แก้ hash constants หรือ bypass guard |
| มี DDL ซ้อนหรือ Copy retry ที่ยังไม่จัดการ | เลื่อน DB step; ไม่ตีความ advisory lock เป็นการกัน DDL ทุก session |
| Guard/DDL ล้มเหลวก่อน transaction commit | transaction rollback ตามปกติ; ตรวจผลจริงและหยุด ไม่ retry blind |
| เกิดปัญหาหลัง commit 031 หรือ HTTP timeout | HOLD ไม่มีการคืน `40001`, replay, ledger repair หรือ restart/kill อัตโนมัติ |

A rollback ไป deployment เก่าจะนำ dependency vulnerabilities กลับมา จึงต้องระบุ
exact rollback target/เงื่อนไขและการยอมรับความเสี่ยงใน execution approval หรือใช้
fix-forward ที่ review แล้ว ไม่ใช่สิทธิ์ที่เกิดจาก stale exception หาก B ถูก apply แล้ว
การ rollback แอป A ต้องรักษา client compatibility ของ B ห้ามย้อนทั้งระบบตาม baseline เก่า

ก่อนขั้น publish/DB write ต้องเติมค่าจริงที่รอบนี้ยังไม่ตรวจ: remote main, release commit/tree,
deployment/rollback IDs และ runtime/config, operator/window, QA actor/sample/request
และ recovery action ที่ยอมให้ทำ ไม่มีการกรอกค่าปัจจุบันจาก historical receipt แทน
ข้อมูล live เหล่านี้เก็บใน preflight ภายใต้การอนุมัติ A/B ภายหลังได้ หากทำให้ขอบเขต
ต่างจากที่ Owner อนุมัติให้ HOLD แล้วเสนอปรับแผนก่อน ไม่เริ่ม write/deploy โดยคาดเดา

## 8. ขอบเขตการอนุมัติขั้นถัดไป

ตอนนี้ Owner อนุมัติ **ข้อยกเว้น A และการจัดทำแผน** แล้วเท่านั้น หลังตรวจแผน
สามารถอนุมัติ A ครั้งเดียวให้ครอบคลุม local stage/commit, remote/config preflight,
push/main auto-deploy, CI/deployment observation และ no-write QA ที่ระบุ โดยเลือก
เส้นทาง Solo หรือ PR และ recovery scope ให้ชัด ไม่ต้องขอข้อยกเว้น A เดิมซ้ำ

B เป็นการอนุมัติแยกจาก A ให้ระบุ client publication และ 031 DB window เป็นคนละ
รายการภายในคำอนุมัติเดียวกันได้ รวมถึงว่าจะอนุญาต one-request HTTP proof/recovery
ใดบ้าง การอนุมัติ A ไม่เริ่ม B อัตโนมัติ และแผนนี้ไม่อนุมัติ B หรือ Production write
Owner อาจอนุมัติ execution ของ A และ B ในข้อความเดียวกันได้เมื่อแยกขอบเขตครบ
โดยยังคงเป็นสอง releases; ไม่บังคับให้ขอซ้ำภายในขั้นตอนที่อนุมัติไว้แล้ว

## 9. Frozen source hashes

| ชุด | ไฟล์ | SHA-256 |
|---|---|---|
| A | `app/admin/master-catalog/_components/MasterCatalogPlacementWorkspace.tsx` | `829caf312287ba9fe4474ea829abe4464fb2bec3c18bd5dfed70ea5d213aa912` |
| A | `app/boq/create/page.tsx` | `f176207b6f28db8e02e1571db4df4d525d739cadd980a7dbf7787ab3e3dfd501` |
| A | `app/price-list/page.tsx` | `17406caaaac508bb136b234632284ff477d8d4b62e70489233fedfbcaf956636` |
| A | `hooks/use-mobile.ts` | `f881bf529556614edecaadafdb8c9fc096bc7027687bf72444f78ab8dc34bf55` |
| A | `lib/hooks/useDashboardData.ts` | `5cae24d49fbb8ab9ad2c9a4e414d46423e67795e6420c10177ab75c22f915b29` |
| A | `tests/master-catalog-operator-workflow.test.ts` | `33c46a28e186f1d009ed66b2bb572c716b038019ed5c8b69e02f7b07e9f4f497` |
| A | `package.json` | `5b6668e82f9919b3058b87cbaec47d294abd8d46d6f7444cffa62bf0686d8c05` |
| A | `package-lock.json` | `fa4f316d70a37b972f7b4b26755e2dbf712f22bdcc519ac99aa890ac25fcbc2f` |
| B เพิ่มจาก A | `migrations/031_boq_duplicate_stale_conflict_guard.sql` | `34c67a8d505c107a2fc86e1ecf8a9ed48a3c94a31d6d169ca016e5921463adef` |
| B เพิ่มจาก A | `lib/boq/duplicate.ts` | `bc0acb8d0b673987e12e6d3ca7f69c46c30254151a556c4ae4050e8f88f4b771` |
| B เพิ่มจาก A | `tests/duplicate-boq-client.test.ts` | `354e9071b667ce553a605cea298604c56c2c54f101a5fc33280ce96963c52901` |
| B เพิ่มจาก A | `scripts/smoke-local-db-parity.mjs` | `8fac98b2e1e90b4e5fac5f47cac8d6abac5254f75c1a885f45154251fec4d872` |

031 function definition SHA-256:

- Predecessor: `d3c422a78c2434ad40c932250b734871608282bc41dce3097a853ddcc1637910`.
- Successor: `508f70695e5f5578734570d356c5a0921cab0e0dc0a207e8ffcc9aca313b68b2`.

Local snapshot manifest digests (ไม่ใช่ Git commit IDs): A
`af0ffb577e929aa0442b849d5b97358e3534896865299dad3b93a1f2ea0f5303`, A+B
`837a71f4b720eb6449040332d1a6bdbedbdfab441e48d2324fd874ac47f1ad9c`.
Artifacts อยู่ที่ `/private/tmp/conduit-boq-local-release-prep-20261023-ld_2almp/`
และ `/private/tmp/conduit-boq-stale-copy-fix-20261023-y53hlrgh/` ผล FAIL/receipts
เดิมทั้งหมดคงเดิม เอกสาร plan นี้อยู่ local สำหรับ review ก่อนเผยแพร่

อ้างอิงเอกสารใน checkout นี้: [source preparation](../06_engineering/LOCAL_RELEASE_CANDIDATES_20261023.md),
[dependency result](../06_engineering/DEPENDENCY_SECURITY_LOCAL_RESULT.md),
[031 result/authority correction](../06_engineering/BOQ_DUPLICATE_STALE_CONFLICT_LOCAL_RESULT.md),
[working agreement](./RELEASE_PROCESS.md#working-agreement-20261015),
[030 executor chronology](../plans/security/04-boq-save-null-authorization-production-release-result.md).
ลิงก์ไปเอกสาร local เหล่านี้ไม่ได้ขยาย file allowlist ของ code commits A/B
