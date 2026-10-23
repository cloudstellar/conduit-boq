# Conduit BOQ

ระบบจัดทำและบริหารประมาณราคางานท่อร้อยสายสื่อสารใต้ดิน (Bill of
Quantities) สำหรับการใช้งานภายใน บมจ. โทรคมนาคมแห่งชาติ (NT)

[![Next.js](https://img.shields.io/badge/Next.js-16.x-black.svg)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E.svg)](https://supabase.com/)

## สถานะ release ที่บันทึกล่าสุด — 2026-10-23

LIST-1B L1 ปล่อยแล้วที่ exact source `b1ce449` ตาม
[Production result](docs/06_engineering/LIST_1B_L1_PRODUCTION_RELEASE_RESULT_20261023.md):
เลขหน้า 25 BOQs, ค้นหา/เรียง/นับจากผลทั้งหมดที่มีสิทธิ์ และ route batch ครั้งเดียว
Quality 762 tests, Vercel Ready/Current และ bounded no-write smoke ผ่านตาม receipt
ข้อมูลนี้เป็นผลตรวจในรอบ release ไม่ใช่การรับรอง Production สดทุกเวลา

[Dependency A](docs/06_engineering/DEPENDENCY_A_PRODUCTION_RELEASE_RESULT_20261023.md)
`a3114fc` และ [stale Copy B](docs/06_engineering/STALE_COPY_B_RELEASE_CLOSEOUT_20261023.md)
client `42e01c5` + Production 031 ปิดแยกชุดแล้ว **B Production HTTP = NOT RUN**
ตาม Owner decision ไม่ใช่ probe ค้างบังคับ Migrations **027–031 immutable/no-replay**
งานปัจจุบันคือปรับเอกสาร C 48 ไฟล์ในเครื่อง โดยแยก tooling/baseline 9 ไฟล์ไว้
ยังไม่ stage/commit/push/deploy หรือเข้า Production

<!-- MASTER_CATALOG_CURRENT_STATE_20260829 -->
> [!IMPORTANT]
> หลักฐานวันที่ 2026-08-28/29 บันทึกว่า Master Catalog Phase 4 และ P-49
> ปิดงานแล้วที่ข้อมูลรุ่น `2568.1.0` จำนวน 710 รายการ ตาม
> [Canonical Final Handoff #106](docs/plans/master-catalog/106-phase4-master-catalog-exact-remaining-work-handoff.md)
> และ [Final Closeout Result #107](docs/plans/master-catalog/107-phase4-p49-master-catalog-final-closeout-result.md)
> Migration 027 และ 028 เป็นหลักฐานที่ใช้แล้วครั้งเดียว ห้ามแก้ไขหรือ replay
> งานพัฒนาหลังจากนั้นต้องใช้ migration ใหม่แบบ forward-only
> ข้อความสถานะเก่าที่ขัดกันเป็น historical chronology ไม่ใช่สิทธิ์หรือ
> สถานะปัจจุบัน

## ความสามารถหลัก

> [!NOTE]
> Atomic Duplicate `DUP-1` เปิดใช้งานบน Production แล้วเมื่อ 2026-08-31 ผ่าน
> migration 029, application deployment และ Production desktop/mobile
> postflight ตาม
> [Production release result](docs/plans/product/04-atomic-boq-duplicate-production-release-result.md)
> Migration 029 เป็น product release ใหม่หลังงาน Master Catalog ไม่ใช่งาน
> repository convergence และห้ามแก้ไขหรือ replay

> [!IMPORTANT]
> BOQ Save NULL authorization guard เป็น **PRODUCTION PASS** แล้วผ่าน migration
> 030 ซึ่ง apply ครั้งเดียวเป็น
> `20261012100608/boq_save_null_authorization_guard` ตาม
> [Production release result](docs/plans/security/04-boq-save-null-authorization-production-release-result.md)
> Migrations 027–030 เป็น immutable/no-replay และสิทธิ์ release รอบนั้นถูกใช้
> แล้ว

> [!NOTE]
> Quantity Input Safety เป็น **PRODUCTION PASS** แล้ว: runtime/tests
> `b18e69a` ถูก carry ผ่าน Preview และ fast-forward เข้า `main` ที่ exact
> Production source `4d285f8` โดยไม่มี migration การตรวจ no-write บน
> Production ผ่านครบตาม
> [Production Result #08](docs/plans/product/08-r0a-quantity-input-safety-production-release-result.md)
> ส่วน [Preview Result #07](docs/plans/product/07-r0a-quantity-input-safety-preview-result.md)
> ยังคงเป็น chronology ของ Q-A ส่วน L1 ปล่อยภายหลังตาม receipt ข้างต้น
> Full Quantity Expression ยังเป็นงานเสนอที่ไม่ได้รับ implementation authority

- สร้างและแก้ไข BOQ แบบหลายเส้นทาง (Multi-Route)
- ทะเบียน BOQ แบ่งหน้า 25 รายการ ค้นหา/เรียง/นับภายใต้สิทธิ์จากผลทั้งหมด
  พร้อม route badge ที่แยก loading/error/empty/legacy และตรวจความครบของ batch
- เลือกรายการจาก Master Catalog แบบมีเวอร์ชัน และเก็บราคาเป็น snapshot ของ
  BOQ เดิม
- คำนวณค่าวัสดุ ค่าแรง Factor F, VAT และยอดรวม
- คัดลอก BOQ แบบ atomic โดยรักษา Catalog ราคา และ Factor F ของต้นฉบับ
- สำหรับ BOQ legacy ที่ยังไม่ผูกเวอร์ชัน Factor F และมียอดมากกว่าศูนย์ซึ่ง
  ผ่านการตรวจความครบถ้วน สามารถสร้างสำเนาแล้วเลือก Factor F ที่ active ก่อน
  ตรวจสอบและบันทึกใหม่; รายการที่ไม่ผ่านให้ใช้ “สร้างใหม่”
- เปิดหน้าพิมพ์/Save as PDF และส่งออก Excel โดยแสดงเฉพาะค่าตัวเลข
- Supabase Auth, Row Level Security และสิทธิ์ตามบทบาท/หน่วยงาน
- Admin workflow สำหรับบริหารผู้ใช้และ Master Catalog

การคัดลอกไม่ใช่การอัปเดตราคา หากต้องการ Catalog และราคาปัจจุบัน ให้ใช้
“สร้างใหม่” เพื่อหลีกเลี่ยงการผสมข้อมูลคนละรุ่นไว้ในเอกสารเดียว

## Technology

| Layer | Technology |
|---|---|
| Web | Next.js 16.4.2 App Router, React 19, TypeScript |
| UI | Tailwind CSS 4, shadcn/ui, Radix UI |
| Database/Auth | Supabase PostgreSQL, Auth, RLS, RPC |
| Hosting | Vercel |
| Quality | ESLint, Vitest, Next production build |

## เริ่มพัฒนา

### สิ่งที่ต้องมี

- Node.js 22 (รุ่นเดียวกับ CI)
- Hosted Vercel ใช้ Node 24.x ตาม release receipt; รอบ A/B/L1 มี local Node 24 checks แยกไว้
- npm
- Supabase project สำหรับพัฒนา หรือ Local Supabase ตามคู่มือของ repository

### ติดตั้งและรัน

```bash
git clone https://github.com/cloudstellar/conduit-boq.git
cd conduit-boq
npm ci
cp .env.example .env.local
npm run dev
```

เปิด `http://localhost:3000` และกำหนดค่า public client credentials ใน
`.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

ห้ามใส่ `service_role` key หรือรหัสผ่านฐานข้อมูลไว้ในตัวแปรที่ขึ้นต้นด้วย
`NEXT_PUBLIC_` และห้าม commit ไฟล์ `.env.local`

หากต้องใช้ฐานข้อมูล Local แบบเต็ม โปรดอ่าน
[Local Supabase guide](docs/LOCAL_SUPABASE.md) ก่อน เนื่องจากคำสั่ง bootstrap
จะ reset เฉพาะฐานข้อมูล Local และ repository นี้ต้องคงสถานะ unlinked จาก
Production

## ตรวจคุณภาพ

```bash
npm run lint
npm test
npm run build
```

CI ใช้ Node.js 22 และรันทั้งสามคำสั่งกับทุก pull request การแก้ฐานข้อมูลต้อง
ผ่านการ rehearse และตรวจ preflight/postcondition แยกจากการ build web app

## โครงสร้างหลัก

```text
app/                 Next.js routes และหน้าจอ
components/          UI และ BOQ editors
lib/                 domain logic, permissions และ Supabase clients
migrations/          forward migration artifacts; ไฟล์ใน Git ไม่ใช่หลักฐานว่า applied
supabase/local/      Local-only schema baseline
scripts/             verification และ operational helpers
tests/               Vitest contract/regression tests
docs/                product, architecture, data, process และ handoff
```

## เอกสารที่ควรอ่าน

- [Documentation index](docs/README.md)
- [AI handoff](docs/08_ai/AI_HANDOFF.md) และ
  [AI context](docs/08_ai/AI_CONTEXT.md) สำหรับข้อจำกัดปัจจุบัน
- [Integrated roadmap and IT decision handoff](docs/plans/product/09-integrated-roadmap-and-it-decision-handoff.md)
  สำหรับลำดับงานที่เสนอปัจจุบัน เงื่อนไข IT/SSO และ decision ที่ยังเปิดอยู่
- [Research and capability backlog](docs/plans/product/10-global-estimating-research-and-capability-backlog.md)
  สำหรับแนวคิดเดิม/ผลเทียบระบบสากลและสถานะ Later/Deferred; ไม่เพิ่มงานอัตโนมัติ
- [Product evolution decision plan](docs/plans/product/01-conduit-boq-product-evolution-decision-plan.md)
  สำหรับรายละเอียด ทางเลือก และประวัติการตัดสินใจ; ลำดับงานเดิมให้ยึด overlay ใน #09
- [BOQ list scaling plan](docs/plans/product/02-boq-list-scaling-decision-plan.md)
- [Local database parity plan](docs/06_engineering/LOCAL_DATABASE_PARITY_PLAN.md)
- [Local database preparation result](docs/06_engineering/LOCAL_DATABASE_PARITY_RESULT.md) — captured app contracts matched; API 46 PASS / 1 stale-Copy FAIL; original local logins and bounded UI/outputs PASS; PARTIAL
  สำหรับ rebuild ฐานทดสอบเดิมด้วย current-state baseline เมื่ออนุมัติ; ไม่บังคับ backup/stack แยก ไม่ replay 027–030 และไม่แตะไฟล์ backup ของ Owner
- [Quantity Input Safety release plan](docs/plans/product/06-r0a-quantity-input-safety-release-plan.md),
  [Preview result](docs/plans/product/07-r0a-quantity-input-safety-preview-result.md)
  และ [Production result](docs/plans/product/08-r0a-quantity-input-safety-production-release-result.md)
- [BOQ Save guard Production result](docs/plans/security/04-boq-save-null-authorization-production-release-result.md)
- [BOQ list pagination research](docs/plans/product/03-boq-list-pagination-best-practice-research.md)
- [Atomic BOQ Duplicate Production result](docs/plans/product/04-atomic-boq-duplicate-production-release-result.md)
- [Database schema](docs/04_data/DATABASE_SCHEMA.md),
  [migrations](docs/04_data/MIGRATIONS.md) และ
  [security model](docs/04_data/SECURITY_MODEL.md)
- [Change process](docs/07_process/CHANGE_PROCESS.md) และ
  [release process](docs/07_process/RELEASE_PROCESS.md)

เอกสารใต้ `docs/ai/` เป็นประวัติ Phase 1/2 ไม่ใช่ authority ของสถานะปัจจุบัน

## ขอบเขตและแผนถัดไป

Dependency A, B/031 และ `LIST-1B L1` ปิดแล้ว ลำดับงานเสนอที่เหลือคือ
`S0`/user management ขั้นจำเป็น → wider `R0/D0` → `W-H` ฉบับใช้งานตาม
เอกสารอนุมัติภายนอก → `R1/R2` Quantity Expression โดยเริ่มสอบถาม IT เรื่อง
hosting และ SSO ควบคู่ทันที ลำดับ deploy จริงขึ้นกับนโยบาย IT ที่ยืนยันแล้ว;
ข้อสันนิษฐานว่าต้องย้ายทั้งหมดภายในองค์กรยังไม่ใช่ข้อกำหนดที่ IT รับรอง
รายละเอียดและเงื่อนไขยึด [Integrated roadmap #09](docs/plans/product/09-integrated-roadmap-and-it-decision-handoff.md)
ข้อเสนอนี้ไม่อนุมัติ implementation, migration, commit/push หรือ deployment

Owner ให้พักข้อเสนอเพิ่มเติมจากงานวิจัย 3 เรื่อง: Excel quantity intake,
ข้อมูลขอบเขตงาน/ที่มาปริมาณเพิ่มเติม และ extra pre-issue quality/stale-save
enhancements จึงไม่เพิ่มเป็น release หรือ prerequisite ก่อน Expression
ตาม [#09 §8.1](docs/plans/product/09-integrated-roadmap-and-it-decision-handoff.md#81-owner-deferral-of-market-research-additions--2026-10-14)

- Atomic Duplicate เปิดใช้แล้วโดย migration 029 และ application ที่ตรงกัน;
  สถานะ/ข้อจำกัดให้ยึด [AI handoff](docs/08_ai/AI_HANDOFF.md) และ
  [release result](docs/plans/product/04-atomic-boq-duplicate-production-release-result.md)
- Quantity Input Safety ที่ห้าม `5*2`/`5x2` ถูกแปลงเงียบเป็น `52` และคำนวณ
  numeric draft แบบ real time เปิดใช้บน Production แล้วที่ `main` `4d285f8`;
  ไม่มี parser, formula persistence หรือ database change การตรวจ Production
  พบ mismatch ที่ยืนยันแล้วหนึ่งกรณี: `UI Test #5` มีสอง route ใน Editor/ฐานข้อมูล
  แต่หน้า `/boq` แสดง `1` ส่วน BOQ ที่มี route เดียวและแสดง `1` ถือว่าปกติ
  ข้อมูลไม่ได้หาย และยังไม่ทราบ trigger ที่แน่ชัดของ badge observation นั้น โค้ด
  per-row query/error fallback กับ request amplification เป็นความเสี่ยงของ
  predecessor ไม่ใช่ Quantity regression ต่อมา L1 เปลี่ยนเป็น route batch
  และ smoke ของตัวอย่างเดิมแสดง badge 2/dialog 2 โดยยังไม่อ้างว่ารู้ trigger
  หรือ prevalence ของ observation เดิม
- ผล Production dependency audit ที่บันทึกวันที่ 2026-10-12/14 แยกจาก R0A
  พบ 6 รายการ รวม `next@16.2.9` critical และเสนอ `16.4.0` เป็น candidate
  แบบไม่ข้าม major เป็นหลักฐานก่อน A ซึ่งภายหลัง patch และบันทึก audit0 แล้ว
  ไม่ใช้ audit เก่าเป็นผลปัจจุบัน และไม่ใช้ CI install advisories แทน audit:prod
- `LIST-1B L1` ที่ปล่อยแล้วใช้ 25 แถว, whole-result authorized search/sort/count
  และ route batch เดียว คำค้นเก็บใน session แยกผู้ใช้ แต่ยังอาจอยู่ใน Data API
  URLs/logs; page/count กับ routes ไม่ใช่ shared DB snapshot ขณะมี concurrent edits
- `L1.1` eligibility projection และ `L2` filters/sorts เพิ่มเติมยัง deferred;
  keyset ต้องมีเหตุผลจาก deep-page performance/mutation churn ก่อน RPC เดิม
  ยังเป็น final authority ของ Copy ไม่มีงานเหล่านี้แทรกก่อน S0 อัตโนมัติ
- Quantity Expression ยังเป็นแผน: `*` จะเป็นรูปแบบ canonical และรับ
  `x`, `X`, `×` เป็น alias สูตรจะแสดงเฉพาะ editor ส่วน PDF/Excel แสดงตัวเลข
  เท่านั้น
- งาน account/security `S0` เป็น lane แยกที่ยังไม่ได้อนุมัติ implementation:
  เสนอให้ปิดกติกาสิทธิ์ ข้อมูลผู้ใช้ การย้ายสังกัด/ปิดบัญชี session และ recovery
  ขั้นจำเป็นก่อน wider `R0/D0` และ `W-H`; มี organizational SSO แต่ยังไม่ทราบ
  IdP/protocol จึงเริ่ม discovery ตอนนี้และยังไม่เลือกวิธี provisioning หรือ
  สร้างระบบ Invite/รหัสผ่านใหม่ก่อนข้อมูล IT ชัดเจน
- Owner ยืนยันว่า BOQ “ฉบับใช้งาน” ผ่านการอนุมัติจากเอกสารจริงโดยผู้จัดการ
  ส่วนวิศวกรรมท่อร้อยสาย แนวทางที่เสนอคือ `W-H`: ตรึง revision ส่งลงนาม
  บันทึกหลักฐานอนุมัติ และควบคุมการแทนที่/ยกเลิก ก่อน Quantity Expression;
  ผู้บันทึกหลักฐานในแอป หลักฐานขั้นต่ำ และการจัดการ BOQ ที่อนุมัติแล้ว ยังต้อง
  ตัดสินใจแยก และยังไม่มี implementation authority

## Version และการ release

เลขรุ่นข้อมูล เช่น Master Catalog `2568.1.0`, เวอร์ชัน package และ Git SHA
เป็นคนละ domain ห้ามใช้แทนกัน ตามกระบวนการ release ของ repository การเปลี่ยน
application ใช้ pull request เข้า `main` เป็นค่าเริ่มต้นและต้องตรวจ deployment
แยกต่างหาก สำหรับ R0A นี้ Owner เลือก bounded Solo path: ใช้ local checks กับ
exact commits เป็น quality gate, push branch เพื่อ Preview แล้วอนุมัติ
fast-forward `main`/Production แยกอีกครั้ง การ integrate ไม่ได้ apply Supabase
migration และ workflow หลัง push `main` ผ่านครบตาม Result #08 ต่อมา A/B/L1
ใช้ bounded Solo direct-to-main คนละชุดตาม approval ของแต่ละ release
การแก้เอกสาร C ครั้งนี้ยังไม่อนุมัติ publication; docs-only push อาจเริ่ม
CI และ Vercel พร้อมกันได้เช่นเดิม ห้ามถือว่าเอกสารมีสิทธิ์ deploy อัตโนมัติ

โครงการนี้เป็นซอฟต์แวร์ภายใน (Private — NT Internal Use Only)
