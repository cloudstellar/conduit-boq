# Conduit BOQ

ระบบจัดทำและบริหารประมาณราคางานท่อร้อยสายสื่อสารใต้ดิน (Bill of
Quantities) สำหรับการใช้งานภายใน บมจ. โทรคมนาคมแห่งชาติ (NT)

[![Next.js](https://img.shields.io/badge/Next.js-16.x-black.svg)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E.svg)](https://supabase.com/)

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
> Quantity Input Safety เป็น **LOCAL COMMITTED CANDIDATE** ที่ทำ ทดสอบ และ
> freeze ไว้ใน local commits `b18e69a` (runtime/tests) และ `a467d38` (docs)
> แล้ว แต่ยังไม่มี upstream, push, Preview, merge หรือ Production release
> ดูขอบเขตและงานค้างที่
> [R0A release-candidate plan](docs/plans/product/06-r0a-quantity-input-safety-release-plan.md)
> LIST-1B และ Full Quantity Expression ยังเป็นงานแยกที่ไม่ได้รับ implementation
> authority

- สร้างและแก้ไข BOQ แบบหลายเส้นทาง (Multi-Route)
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
| Web | Next.js 16 App Router, React 19, TypeScript |
| UI | Tailwind CSS 4, shadcn/ui, Radix UI |
| Database/Auth | Supabase PostgreSQL, Auth, RLS, RPC |
| Hosting | Vercel |
| Quality | ESLint, Vitest, Next production build |

## เริ่มพัฒนา

### สิ่งที่ต้องมี

- Node.js 22 (รุ่นเดียวกับ CI)
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
- [Product evolution decision plan](docs/plans/product/01-conduit-boq-product-evolution-decision-plan.md)
  สำหรับลำดับพัฒนาระยะยาว
- [BOQ list scaling plan](docs/plans/product/02-boq-list-scaling-decision-plan.md)
- [Quantity Input Safety local candidate](docs/plans/product/06-r0a-quantity-input-safety-release-plan.md)
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

- Atomic Duplicate เปิดใช้แล้วโดย migration 029 และ application ที่ตรงกัน;
  สถานะ/ข้อจำกัดให้ยึด [AI handoff](docs/08_ai/AI_HANDOFF.md) และ
  [release result](docs/plans/product/04-atomic-boq-duplicate-production-release-result.md)
- Quantity Input Safety ที่ห้าม `5*2`/`5x2` ถูกแปลงเงียบเป็น `52` ทำและทดสอบ
  แล้วและ freeze เป็น local commits สองรายการ ลำดับถัดไปตาม Solo Preview ที่
  Owner เลือกคือ Q-A ระยะ 2 push branch เดิมและตรวจ Preview โดยไม่มี PR หรือ
  CI แยก -> ตัดสินใจเรื่อง current-schema persistence evidence -> Q-B
  แยกสำหรับ integrate/push `main` และ Production -> จึงพิจารณา `LIST-1B`;
  candidate นี้ยังไม่มี parser, formula persistence หรือ database change
- หน้ารายการ BOQ ยังส่ง query แบบไม่แบ่งหน้าและค้นหาเฉพาะแถวที่ browser ได้รับ;
  การแบ่งหน้าแบบ server-side แบบมีเลขหน้าเป็นงานหลัก `LIST-1B` ถัดจาก guard;
  keyset เป็นทางเลือกภายหลังเมื่อมีหลักฐานด้าน deep-page performance หรือ
  mutation churn
- `LIST-1B` รุ่นแรกเสนอ 25 แถว, whole-result server search/filter/sort/count
  และ route batch เดียว; optional trusted Copy-eligibility projection เสนอให้
  แยกเป็น `L1.1` โดย RPC เดิมยังเป็น final authority
- Quantity Expression ยังเป็นแผน: `*` จะเป็นรูปแบบ canonical และรับ
  `x`, `X`, `×` เป็น alias สูตรจะแสดงเฉพาะ editor ส่วน PDF/Excel แสดงตัวเลข
  เท่านั้น
- งาน account/security `S0` เป็น lane แยกที่ยังไม่ได้อนุมัติ implementation:
  พิจารณา invite/pre-provision, MFA/AAL2 และ session policy ก่อน แล้วประเมิน
  enterprise SSO ภายหลัง

## Version และการ release

เลขรุ่นข้อมูล เช่น Master Catalog `2568.1.0`, เวอร์ชัน package และ Git SHA
เป็นคนละ domain ห้ามใช้แทนกัน ตามกระบวนการ release ของ repository การเปลี่ยน
application ใช้ pull request เข้า `main` เป็นค่าเริ่มต้นและต้องตรวจ deployment
แยกต่างหาก สำหรับ R0A นี้ Owner เลือก bounded Solo Preview exception: ใช้
local checks กับ exact commits เป็น quality gate, push branch เพื่อ Preview,
แล้วขออนุมัติ integrate/push `main` แยกอีกครั้ง การ integrate ไม่ได้ apply
Supabase migration อัตโนมัติ และ workflow ที่รันเมื่อ push `main` ไม่ถูกปิด

โครงการนี้เป็นซอฟต์แวร์ภายใน (Private — NT Internal Use Only)
