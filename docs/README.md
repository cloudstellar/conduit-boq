# Conduit BOQ Documentation Index

เอกสารนี้เป็นสารบัญสำหรับค้นหา source of truth ที่ถูกต้อง ไม่ใช่สถานะ
Production แบบ live และไม่ใช่สิทธิ์ให้ deploy, apply migration หรือแก้ข้อมูล

> [!IMPORTANT]
> ก่อนเปลี่ยน repository ให้อ่าน [`AGENTS.md`](../AGENTS.md),
> [`08_ai/AI_HANDOFF.md`](./08_ai/AI_HANDOFF.md),
> [`08_ai/AI_CONTEXT.md`](./08_ai/AI_CONTEXT.md) และ
> [`08_ai/LESSONS_LEARNED.md`](./08_ai/LESSONS_LEARNED.md) ตามลำดับ

## Current authority

| เอกสาร | ใช้สำหรับ | ข้อจำกัด |
|---|---|---|
| [`AGENTS.md`](../AGENTS.md) | กติกา repository, no-replay boundary และ workspace custody | ต้องตรวจ branch, HEAD, upstream และ worktree ใหม่ทุกครั้ง |
| [`AI_HANDOFF.md`](./08_ai/AI_HANDOFF.md) | handoff ปัจจุบันและลำดับ source of truth | หลักฐานที่เปลี่ยนตามเวลาไม่ใช่ live guarantee |
| [`AI_CONTEXT.md`](./08_ai/AI_CONTEXT.md) | product/code/database context และ authority boundary | ห้ามตีความ plan เป็น execution approval |
| [`LESSONS_LEARNED.md`](./08_ai/LESSONS_LEARNED.md) | invariants และข้อผิดพลาดที่ห้ามทำซ้ำ | ข้อความ chronology เก่าต้องอ่านร่วมกับ current-state addendum |
| [Master Catalog Handoff #106](./plans/master-catalog/106-phase4-master-catalog-exact-remaining-work-handoff.md) | canonical final handoff ของ Phase 4/P-49 | เป็นหลักฐานตามเวลาที่บันทึก ไม่ใช่ live mutable state |
| [Master Catalog Result #107](./plans/master-catalog/107-phase4-p49-master-catalog-final-closeout-result.md) | closeout result และ accepted residuals | ห้ามใช้ approval receipt เก่าเป็นสิทธิ์ทำงานใหม่ |

Migration 027 และ 028 ถูกบันทึกว่า applied ครั้งเดียวและห้ามแก้ retry หรือ
replay ส่วน expanded Production persona rehearsal ยังเป็น accepted residual
ไม่ใช่ PASS หากต้องอ้างสถานะ Production ที่เปลี่ยนได้ ให้เก็บ fresh read-only
evidence ใหม่

## Current product decisions and research

| เอกสาร | สถานะ | เนื้อหา |
|---|---|---|
| [01 — Product Evolution Decision Plan](./plans/product/01-conduit-boq-product-evolution-decision-plan.md) | D2/D3/D9 ถูกเลือก; exact DUP-1 Production release ได้รับอนุญาตและกำลังดำเนินการ; decision อื่นยังมี TBD | roadmap, Atomic Duplicate, Quantity Expression, auth, workflow และระยะยาว |
| [02 — BOQ List Scaling Decision Plan](./plans/product/02-boq-list-scaling-decision-plan.md) | proposed; LIST-1 ยังไม่มี implementation authority | server pagination, search/filter/sort, RLS count และ bounded route loading |
| [03 — Pagination Best-Practice Research](./plans/product/03-boq-list-pagination-best-practice-research.md) | research evidence; ไม่ใช่ approval | หลักฐานภายนอกและ trade-off ของ pagination |

DUP-1 ต้องไม่ถูกเรียกว่าใช้งานแล้วจนกว่า implementation, isolated database
rehearsal, tests, Production verification และ postflight evidence จะผ่าน Migration
`029_atomic_boq_duplicate.sql` เป็น forward-development artifact สำหรับงานใหม่
ไม่ใช่ migration ที่ใช้เพื่อ repository convergence และยังห้ามอ้างว่า applied
หรือ released

## Developer entry points

| จุดเริ่ม | ใช้สำหรับ |
|---|---|
| [Root README](../README.md) | ภาพรวม application, setup และ quality commands |
| [`package.json`](../package.json) | scripts และ dependency versions ที่ repository ใช้จริง |
| [CI quality workflow](../.github/workflows/quality.yml) | Node.js 22, `npm ci`, lint, test และ build contract |
| [Local Supabase guide](./LOCAL_SUPABASE.md) | Local-only commands, destructive reset warning และ unlinked safety |
| [`scripts/bootstrap-local-db.sh`](../scripts/bootstrap-local-db.sh) | executable source ของ Local bootstrap ledger ปัจจุบัน |

ใช้ Node.js 22 และ `npm ci` ให้ตรงกับ CI ตรวจสอบ `npm run lint`, `npm test`
และ `npm run build` ก่อนส่งมอบ แต่ web CI ไม่ได้แทน database/RLS/persona
rehearsal

## Database and migration sources

- [`../migrations/`](../migrations/) คือที่เก็บ forward SQL artifacts ระดับ
  repository การมีไฟล์อยู่ไม่ได้แปลว่า applied หรือ authorized
- [`04_data/MIGRATIONS.md`](./04_data/MIGRATIONS.md) เป็น migration inventory
  และ chronology ให้อ่าน current addendum/closeout ก่อนข้อความเก่า
- [`LOCAL_SUPABASE.md`](./LOCAL_SUPABASE.md) และ
  [`scripts/bootstrap-local-db.sh`](../scripts/bootstrap-local-db.sh) เป็นคู่
  สำหรับ Local rebuild ปัจจุบัน ซึ่ง apply root chain ถึง 026 เท่านั้น
- [`supabase/local/production-baseline.sql`](../supabase/local/production-baseline.sql)
  เป็น Local schema baseline ไม่ใช่ Production migration
- [`../migrations/README.md`](../migrations/README.md) เป็นคู่มือ historical
  multi-route migration 002 ไม่ใช่ runbook สำหรับ migration ปัจจุบัน

ห้ามเพิ่ม 027, 028 หรือ 029 เข้า bootstrap แบบเงียบ ๆ Bootstrap ปัจจุบันยัง
ไม่มี post-028 parity ดังนั้น DUP-1/029 ต้องใช้ isolated database ที่สร้างจาก
approved post-028-equivalent contract แล้ว apply 029 แยกเพื่อ rehearse เมื่อ
ได้รับอนุญาต ห้ามใช้ `supabase link`, `supabase db push`, `supabase db pull`
หรือ linked diff จาก worktree นี้

## Reference documentation by topic

เอกสารต่อไปนี้เป็น reference ตามหัวข้อ ต้องเทียบกับ code, root migrations,
current handoff และ fresh database evidence เมื่อข้อมูลขัดกัน:

| หัวข้อ | เอกสาร |
|---|---|
| Product overview | [`01_overview/`](./01_overview/) |
| Architecture and ADRs | [`02_architecture/`](./02_architecture/) |
| Domain and access concepts | [`03_domain/`](./03_domain/) |
| Schema, integrity, RLS and migration chronology | [`04_data/`](./04_data/) |
| Calculation, Factor F and VAT | [`05_calculation/`](./05_calculation/) |
| Engineering conventions | [`06_engineering/`](./06_engineering/) |
| Change/release process | [`07_process/`](./07_process/) |
| Security cross-layer summary | [`SECURITY.md`](./SECURITY.md) |
| Local operational instructions | [`LOCAL_SUPABASE.md`](./LOCAL_SUPABASE.md) |

## Historical and audit material

รายการต่อไปนี้เก็บไว้เพื่อ chronology/audit และต้องไม่ใช้เป็น current
operational authority เว้นแต่เอกสาร current ข้างต้นจะ adopt อย่างชัดเจน:

- [`docs/ai/`](./ai/) — Phase 1/2 agent handoffs, plans และ UX notes
- [`docs/legacy/`](./legacy/) — legacy schema/technical references
- [`CANONICAL_ORDER.md`](./CANONICAL_ORDER.md) — draft documentation migration
  plan ลงวันที่ 2026-01 ไม่ใช่ current authority map
- root-level historical PRD/implementation/KM material เช่น [`PRD.md`](./PRD.md),
  [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md),
  [`PRODUCT_BRIEF_AND_MEASUREMENT_PLAN.md`](./PRODUCT_BRIEF_AND_MEASUREMENT_PLAN.md)
  และ [`km/`](./km/)
- [`CODEBASE_DATABASE_MAP.md`](./CODEBASE_DATABASE_MAP.md) — dated 2026-06-11
  code/database snapshot with later supersession notes; useful chronology, not
  live database authority
- Master Catalog plans ก่อน #106/#107 รวมถึงข้อความ `HOLD`, `pending`,
  `unauthorized` หรือ `current` ที่ถูกเก็บไว้เป็นหลักฐานตามเวลา
- [`MIGRATION_MAP.md`](./MIGRATION_MAP.md) และคู่มือ migration เก่าที่บรรยาย
  workflow ก่อน current closeout

อย่าแก้ historical evidence ให้ดูเหมือนเป็นสถานะปัจจุบัน หากเอกสารสองฉบับ
ขัดกัน ให้หยุดและใช้ authority hierarchy ด้านบนพร้อมตรวจ code/database ใหม่
ก่อนตัดสินใจ
