# แผนปล่อย LIST-1B L1 แบบ Solo — 23 ตุลาคม 2026

**สถานะ: เสนอให้ Owner ตรวจเท่านั้น — ยังไม่อนุมัติ execution**

รอบจัดทำแผนนี้ตรวจไฟล์/Git/หลักฐานในเครื่อง เตรียม source จำลองสำหรับตรวจ
คุณภาพใน `/private/tmp` และอ่านคู่มือสาธารณะของ Vercel เท่านั้น ไม่มี Production
request, DB operation, staging, commit, push หรือ deployment แผนนี้ไม่ใช่
คำสั่งให้เริ่ม preflight ที่เข้าถึงระบบภายนอกหรือเผยแพร่ทันที

## 1. ข้อเสนอและขอบเขต

เส้นทางปกติเสนอ **หนึ่ง commit / หนึ่ง push ไป main / หนึ่ง Production deployment**
ผ่านเส้นทาง Solo เดิม ไม่เพิ่ม PR, branch, stack, migration หรือ package
หลัง Owner อนุมัติ execution จึงทำ preflight → เผยแพร่เฉพาะชุดที่ผ่าน →
ตรวจ CI/Vercel และ smoke แบบไม่แก้ business data หากผิดเงื่อนไขให้ HOLD
ก่อน push หรือใช้ rollback ตามขอบเขตที่อนุมัติแล้วหลัง push

L1 ประกอบด้วยเลขหน้า 25 BOQs, whole-result authorized search/sort/exact count,
unique ID tie-breaker, page/count 1 request และ route batch ไม่เกิน 1 ต่อหน้า,
session-only search แยก actor และ Copy/031/token/UUID/recovery เดิม
ไม่รวม Mine/status/หน่วยงาน filters, last-edited/amount sort, eligibility
projection, SSO, workflow, Quantity Expression หรือการแก้ PDF ที่พักไว้

## 2. Exact source และไฟล์ที่จะเผยแพร่

Base ที่ตรวจในเครื่อง: `main`, HEAD/upstream/local `origin/main` เท่ากับ
`42e01c56fe2eacb5239abc8d296ca1848c48a03b` ไม่มี staged files
เป็นค่าของ local refs ไม่ใช่ผลตรวจ remote หรือ Production สด

**เสนอ allowlist 15 ไฟล์เท่านั้น**: runtime 6 + tests 7 + เอกสาร L1 2

| # | Path | ขอบเขต |
|---|---|---|
| 1 | `app/boq/page.tsx` | list UI, pagination, actions/Copy intent |
| 2 | `components/boq/RouteBadge.tsx` | parent-fed route states/dialog |
| 3 | `lib/hooks/useUser.ts` | clear list session on logout |
| 4 | `lib/boq/list.ts` | new page/count/route adapter |
| 5 | `lib/boq/listSession.ts` | new per-actor session/History helpers |
| 6 | `lib/boq/useBOQList.ts` | new shared query/race controller |
| 7 | `tests/boq-list.test.ts` | new adapter contracts |
| 8 | `tests/boq-list-session.test.ts` | new session/History contracts |
| 9 | `tests/route-badge.test.tsx` | new badge contracts |
| 10 | `tests/master-catalog-admin-edit-completion.test.ts` | named authority callouts; retain historical assertions |
| 11 | `tests/master-catalog-phase2-contracts.test.ts` | captured Copy ID/UUID/token assertion |
| 12 | `tests/master-catalog-wp7-contracts.test.ts` | captured Copy ID/UUID/token assertion |
| 13 | `tests/p49-application-authorization.test.ts` | captured Copy ID/UUID/token assertion |
| 14 | `docs/06_engineering/LIST_1B_L1_LOCAL_RESULT_20261023.md` | self-contained local evidence/limits |
| 15 | `docs/07_process/LIST_1B_L1_SOLO_RELEASE_PLAN_20261023.md` | this reviewed release plan |

Runtime/test 13-file SHA-256:
`00032d9199e7a9e8f11aa925174b60cf6f90e5ec518f24e2f76ebc7b794a32a8`.
Digest hashes the sorted compact JSON relative-path/SHA-256 map, UTF-8.
ก่อน stage ต้อง freeze hash ของเอกสาร 2 ไฟล์และ full candidate manifest ด้วย
ก่อน push ต้องตรวจ parent/tree และ actual commit bytes ตรง manifest ทุกไฟล์
ยังไม่มี release commit/tree ID ในรอบแผนนี้

**ไม่เผยแพร่ mixed C bundle:** AGENTS/AI_HANDOFF/AI_CONTEXT/LESSONS และ
Product Plans #02/#09 ฉบับ local มี cumulative overlays/links ไป A/B/031/
parity/research docs ที่ยังไม่เผยแพร่ จึงไม่ stage ทั้งไฟล์ตามไปด้วยโดยอัตโนมัติ
เก็บไว้ในเครื่องพร้อมงาน C อื่น การบรรจบเอกสารทั้งชุดเป็นงานแยก
รายงาน/แผน L1 สองไฟล์ข้างต้นต้องอ่านได้โดยไม่ต้อง publish C ตามมา

Package/lockfile, `.github/workflows/quality.yml`, migration ทุกไฟล์, editor/
Print, Catalog, Factor F, accounts, reference data และ parity tools ไม่อยู่ใน
allowlist ห้าม `git add .`, broad stash/clean/reset, force-push หรือแก้ไฟล์เดิม
เพื่อทำให้ worktree ดูสะอาด ห้ามเผยแพร่ credentials, browser Auth state,
raw payloads, screenshots หรือ bulk temporary evidence

## 3. หลักฐานที่มีและ source gate

ดู [L1 local result](../06_engineering/LIST_1B_L1_LOCAL_RESULT_20261023.md)
สำหรับ exact target และข้อจำกัดตามรอบที่ทดสอบ

| หลักฐาน | สถานะ ณ จัดทำแผน |
|---|---|
| Full local 551-file snapshot, Node 24.2.0 | 768 tests / lint 0 errors (3 warnings เดิม) / TypeScript / default build PASS |
| Docker เดิม PG17.6 / PostgREST14.5 / post-031 | API31/31, Copy API4/4, final browser normal10/10 และ error/race15/15 PASS |
| Browser Copy/Delete/Create navigation | Earlier L1 snapshot 5/5 PASS; final History/touch delta และ source phase แยกไว้ตามจริง |
| Cleanup/data custody | 38 fingerprint entries / 28 public tables exact; original34BOQ/66routes/66items; 1,158 owned IDs / 7 request UUIDs ไม่มี residue |
| Clean HEAD + exact13 source projection | 530 files; 762 tests / lint 0 errors (3 warnings เดิม) / standalone TypeScript PASS; default build PASS แบบ warm cache ตามข้อจำกัดด้านล่าง |
| Fresh remote/main, Vercel target/current/config/rollback eligibility | NOT RUN — ต้องได้รับ execution/preflight approval ก่อน |
| Production smoke, business RPC, migration, publication | NOT RUN — รอบนี้ไม่อนุญาต |

ความต่าง 768 → 762 คือ **6 tests ของ C parity tooling ไม่รวมใน source ปล่อย**
ไม่ใช่ skip test ห้ามใช้ full dirty snapshot เป็น exact publication proof
source projection อยู่ที่ `/private/tmp/conduit-boq-L1-release-source-8eo17q7t/`
manifest530 SHA-256:
`3592e8cc08167fc8dd4506f7c858dc1b78777fa8aa61297920a5be74bb1c3bbd`.
หลังเพิ่มเฉพาะเอกสาร14–15 จะเป็น532 nonignored source files; hash ใหม่ต้อง
บันทึกก่อนเผยแพร่ เอกสารไม่เปลี่ยน runtime13 ที่ผ่าน local integration แล้ว

**Build chronology/limit:** fresh-cache default build ครั้งแรกติด Google Fonts;
network/root retries ติด Turbopack/PostCSS worker `binding to a port:
Operation not permitted` เก็บ failure logs ตามจริง ต่อมาคัดลอกเฉพาะ normal
compiler cache จาก final L1 app ที่ทดสอบแล้ว แล้วรัน **default Node24 build
ใหม่บน exact530 source: PASS** ไม่เปลี่ยน source/config/package/bundler หรือ
disable checks ตรวจ client output ใช้ CI placeholder backend ถูกต้อง ไม่มี
ค่า local backend เดิมติดจาก cache และ standalone TypeScript ผ่านหลัง build
ไม่ใช่การนำผล551-fileเก่ามาแทนผลใหม่ แต่ **fresh-cache build ใน sandboxนี้
ยังไม่พิสูจน์ PASS** รายงานขอบเขตนี้ก่อน Owner อนุมัติ ไม่อ้าง cold-build proof
หาก execution preflight พบ source/config/runtime drift หรือ default build
ที่จำเป็นยัง fail ให้ HOLD ไม่ใช้ข้อยกเว้น A/B หรือ CIหลังpushแทน pre-push gate

ใช้หลักฐาน Docker/Copy เดิมที่ runtime และ relevant contracts ตรงกันได้
ไม่ reset/reseed/replay เพื่อเตรียม release ใหม่โดยไม่มีเหตุ หากพบ runtime,
contract หรือ target drift ที่กระทบหลักฐาน ให้ HOLD และรายงานขอบเขต retest
ไม่แก้ source/package/ฐานข้อมูลระหว่าง release preflight โดยอัตโนมัติ

## 4. Preflight หลังได้รับอนุมัติ — ทำก่อน stage/commit/push

1. **Custody/source:** อ่านคำสั่งล่าสุด ตรวจ HEAD/index/dirty work และ fresh
   remote main ต้องยังเป็น exact B base ตรวจ13 runtime hashes, package/lock/
   migrations unchanged และ allowlist15 ไม่มีไฟล์ C หรือ secrets ปะปน
   ถ้า remote/index/source ต่างอย่างไม่ทราบสาเหตุให้หยุด ไม่ rebase/overwrite
2. **Exact candidate:** ตรวจ snapshot `B + 15 files`, hashes/diff/links และ
   Node24 quality evidence ครบ พร้อมรับทราบ warm-cache/fresh-cache limit ข้างต้น
   ถ้าต่างเพียงเอกสารให้ตรวจเอกสาร ไม่จำเป็นต้อง
   ทำ Docker integration ซ้ำ ถ้า code เปลี่ยนให้กลับสู่ local correction/retest
3. **Hosted target แบบ read-only:** ยืนยัน project/repository/Production branch,
   current source, domains, Node24.x, build/install/ignored-build settings และ
   automatic domain assignment ไม่เปลี่ยน config/variables หรือสร้าง CLI link
   recorded project คือ `cloudwho-2662s-projects/conduit-boq`; domains คือ
   `boq.ntconduit.com` และ `conduit-boq.vercel.app` ต้องตรวจสด ไม่ใช้ receipt
   เก่าแทน live state ไม่พิมพ์ secret values
4. **Relevant contract แบบ metadata-only:** reuse post-031 receipts ประกอบ
   targeted read-only ตรวจ BOQ/route selected/search/order fields, joins,
   read grants/RLS, API version/cap และ031 definition/ledger identity เท่านั้น
   ไม่อ่าน business rows ไม่เรียก Copy/Save/business RPC ไม่ capture/restore
   ทั้ง DB หากตรวจไม่ได้หรือ contract drift กระทบผล local ให้ HOLD
5. **Rollback target:** ตรวจ B artifact ยังอยู่/Ready/retained พร้อม plan,
   permission/policy/domain/config ที่รองรับการกลับ B หลัง L1 เป็น Current
   ไม่ execute rollback test และไม่ HOLD เพียงเพราะ B ที่กำลัง Current ไม่มี
   เมนู rollback-to-itself ต้องตรวจ eligibility ของ exact B อีกครั้งก่อน
   rollback จริง หาก target/policy ใช้ไม่ได้ให้ HOLD ก่อน release ไม่สร้าง
   deployment สำรองหรือปรับ settings แทนเอง

Recorded Production031 คือ ledger `20261023063934/boq_duplicate_stale_conflict_guard`,
definition SHA `508f70695e5f5578734570d356c5a0921cab0e0dc0a207e8ffcc9aca313b68b2`.
นี่เป็น dated evidence ที่ต้องเทียบเฉพาะเมื่อได้รับ read-only approval ไม่ใช่
อำนาจเข้า Production ตอนนี้ และไม่ใช่เหตุให้ apply/replay031

## 5. เผยแพร่และตรวจหลังปล่อย — เฉพาะเมื่ออนุมัติ execution

1. Stage เฉพาะ15 paths ตรวจ staged diff/byte hashes/absence of secrets แล้ว
   commit หนึ่งชุดจาก B base ตรวจ actual commit/tree/source กับ manifest
   อีกครั้ง หาก staged mismatch ให้หยุดก่อน push โดยรักษางาน C
2. ตรวจ remote main อีกครั้งก่อน direct fast-forward push จาก main ใช้
   normal push เท่านั้น ไม่ force ไม่เพิ่ม branch/PR หรือแก้ workflow
3. Push นี้อาจเริ่ม **GitHub Quality กับ Vercel Production พร้อมกัน**:
   CI ไม่ใช่ gate ก่อน Production ในเส้นทาง Solo ต้องรับข้อเท็จจริงนี้ใน approval
   `.github/workflows/quality.yml` ใช้ Node22, npm ci/lint/tests/build;
   ไม่รัน Docker, audit หรือ standalone tsc และไม่ apply migration
4. ตรวจ exact new commit ที่ CI และ Vercel ใช้: Quality success ทุกขั้น;
   Vercel Ready/Current, domains ถูกต้อง, build/config ไม่มีเหตุผิดปกติ
   จด actual IDs/เวลา ไม่สรุป Ready จาก green build อย่างเดียว
5. **Bounded no-write smoke:** ใช้บัญชี Owner เดิมภายใต้สิทธิ์ปกติ ตรวจ `/boq`
   หน้า1/2ถ้ามี, harmless search หนึ่งคำ, sort, Back/return, route badge/dialog
   ของ BOQ เดิมไม่เกิน2รายการ (เลือก multi-route ถ้ามี) และ saved Print หนึ่ง
   รายการ ตรวจconsole/request count: page/count1 + routes≤1 ต่อ attempt;
   Auth/profile calls แยก ไม่เก็บคำค้น/BOQ contents ลง public receipt
   ห้าม Create/Save/Copy/Delete/change status หรือปรับบัญชี/Catalog/Factor F
   ถ้าต้อง login ใหม่ Auth session/sign-in logs อาจเปลี่ยนได้ตามปกติ
6. เฝ้าดูการใช้งานช่วงสั้นประมาณ10–15นาทีแล้วสรุป exact source/target/
   PASS/FAIL/NOT RUN และข้อจำกัด เขียน release receipt local โดยไม่มี
   second docs commit/push อัตโนมัติ

ไม่ต้องมี migration-style งด Copy15นาทีสำหรับ client-only release นี้
เลือกช่วงใช้งานเบา ให้รายการ Save/Copy ที่กำลังทำเสร็จก่อน reload หาก Copy
ผลยังไม่ทราบ ให้คง UUID/token และกู้ intent เดิม ไม่ force refresh/logout
หรือเริ่ม Copy ใหม่เพื่อให้ผ่าน smoke ไม่เพิ่ม stale Production RPC probe ของ B

## 6. ความเสี่ยงและเกณฑ์ HOLD/rollback

| ความเสี่ยง | การป้องกัน / การตัดสินใจ |
|---|---|
| C ถูกปนใน commit หรือ source drift | allowlist15 + full manifest + actual commit verification; mismatch HOLD |
| UI/actor leak, wrong Copy item/UUID, wrong scope/count | runtime generation guards + local evidence; พบ regression จริงหลังปล่อยให้ rollback ไม่รอ CI เขียว |
| API cap ของ routes | 1,001-route test ถูกปฏิเสธอย่างซื่อตรง; ไม่แสดง0/1/fallbackเมื่อผิดพลาด; prevalence จริงยังไม่ทราบ หากงานปกติใช้งานไม่ได้ให้ HOLD/rollback และแยก query design ใหม่ ไม่เพิ่ม RPC/cap เอง |
| Search confidentiality | Owner เลือก session-only และรับทราบ Data API URL/log exposure แล้ว; ใช้ harmless term/ไม่เผยแพร่ raw logs ไม่ขออนุมัตินโยบายเดิมซ้ำ |
| Offset/concurrent changes | stable ID/null ordering; count/rows/routes ไม่ใช่ shared DB snapshot; refresh ได้ ไม่รับรอง frozen traversal ระหว่างมีการแก้ข้อมูล |
| CI กับ Production เริ่มคู่กัน | local exact-source quality ต้องผ่านก่อน push; CI fail/build fail/currentผิดsource ให้หยุด/rollbackตามสถานะจริง |
| Local latency ไม่ใช่ hosted SLA | local20samples p95 mainสูงสุด35.79ms / main+route51.52ms; เสนอ local budget100/200ms ตามลำดับ ไม่อ้างเป็นProduction SLA/timeout threshold และไม่เพิ่ม indexโดยเดา |
| Rollback คืนข้อจำกัด list เดิม | กลับ B จะมีการโหลดแบบเดิม/RouteBadge residual; เป็นการกู้ client ชั่วคราวโดยรักษา031/data ไม่ได้แก้ defect ด้วยการ rollback DB |

HOLD ก่อน push เมื่อ required check FAIL/unknown, target/config/parity/rollback
ไม่ชัดเจน หรือพบปัญหาใหม่นอก scope หลัง push ใช้ conditional rollback หาก
L1 แสดงข้อมูลข้ามสิทธิ์/ผิดรายการ, Copy recovery ผิด, list ใช้งานปกติไม่ได้,
CI fail หรือ deployment มี regression บน source นี้ หาก deploy ใหม่ยังไม่เคย
Current และ B ยังให้บริการปกติ ให้คง B และรายงาน deploy FAIL แทน rollback ซ้ำ

## 7. Rollback: client เท่านั้น คง031และข้อมูลทั้งหมด

**เป้าหมายที่บันทึกไว้:** B source
`42e01c56fe2eacb5239abc8d296ca1848c48a03b`, tree
`6283410f997d00fc808cd9d8f7153b9bc381786f`, Vercel artifact
`Gf8gmTN8H5k7dYebeEzRwV5DwjW5`. ต้องยืนยัน eligibility/current health
ใน preflight ก่อนใช้ B มี patched dependencies A และ client strict PT409
support แล้ว จึงคง031ได้ **ห้ามถอยไป A/pre-A หรือย้อน migration**

1. หาก exact L1 ของรอบนี้ยังเป็น Current และเข้าเกณฑ์ที่ Owner อนุมัติ
   rollback ไว้ ให้ตรวจ exact B eligibility อีกครั้งก่อนสลับ
   domain กลับ **exact B artifact** ผ่าน Vercel Instant Rollback แล้วตรวจ
   current/source/domains และ bounded no-write smoke ไม่แก้ DNS/DB/data
   ไม่ย้อน031 ไม่ลบ BOQ/Copy ledger ที่ถูกสร้างสำเร็จระหว่างใช้งาน
2. Instant Rollback ใช้ build เดิม ไม่ rebuild environment และความพร้อมใช้
   ขึ้นกับ deployment/plan/สิทธิ์ ต้องตรวจจริง คู่มือระบุว่าหลัง rollback
   auto-assignment ของ Production domains จะปิดจน promote deployment อื่น
   ดู [Vercel Instant Rollback](https://vercel.com/docs/instant-rollback)
   จึงห้ามคิดว่า push ถัดไปจะกลับ Production เอง
3. หลัง hosted rollback Git main ยังอยู่ L1 แต่ Production เป็น B ให้บันทึก
   mismatch นี้และงด main pushes อื่นรวม docs จนบรรจบ source ใช้ **หนึ่ง
   forward rollback commit** คืนเฉพาะ13 runtime/test paths เป็น B โดยรักษา
   เอกสาร14–15และ historical receipts ไม่ใช้ whole-commit revert ที่ลบหลักฐาน
   ตรวจ dirty C/ไม่มีงานใหม่ปะปนก่อนแตะ paths; หากมี drift ให้หยุดเสนอแผนใหม่
4. ทดสอบ forward rollback source → commit → **normal push เพิ่มหนึ่งครั้ง**
   → ตรวจ CI/Vercel → promote exact healthy rollback commit เมื่อพร้อม
   เพื่อให้ Git/runtime ตรงกันและออกจาก rollback state การ push/deploy/promote
   เพิ่มนี้ต้องรวมใน conditional rollback approval ไม่ได้ตามจาก approval
   ของแผนเฉย ๆ ไม่ promote L1 ที่ทราบว่ามีปัญหากลับอัตโนมัติ

Hosted rollback ไม่ยกเลิก RPC ที่กำลังรันและไม่ย้อน Copy ที่ commit สำเร็จ
กรณี response loss ต้องคง request UUID/source token และตรวจ/กู้ intent เดิม
ห้ามลบ ledger, สร้าง UUID ใหม่ หรือยกเลิกด้วย DB reset หาก rollback artifact
หาย/ใช้ไม่ได้ให้ HOLD ก่อน release; ไม่ถือว่า fallback ที่ยังไม่ review พร้อมแล้ว

## 8. สิ่งที่ต้องอนุมัติภายหลัง

Owner อาจอนุมัติ execution เป็นชุดเดียวเพื่อลดขั้นตอนซ้ำ: targeted read-only
preflight ตาม§4 → stage/commit/push/deploy **exact15** → ตรวจCI/Vercelและ
no-write smokeตาม§5 พร้อม conditional app rollback/หนึ่ง forward rollback
commit + normal push/deploy + promoteตาม§7เมื่อเข้าเกณฑ์เท่านั้น หาก preflight
ไม่ตรงให้หยุดก่อน push

Approval ดังกล่าวไม่รวม source fix ใหม่, package/lockfile, DB write/reset/
restore, migration/schema/RPC definition, business write probe, C publication,
account/reference change, archive หรือ release อื่น ขณะนี้ยังไม่มี execution
approval และไม่ถือว่าคำขอจัดทำแผนนี้อนุมัติส่วนใดข้างต้นแล้ว
