# Conduit BOQ Documentation Index

เอกสารนี้เป็นสารบัญสำหรับค้นหา source of truth ที่ถูกต้อง ไม่ใช่สถานะ
Production แบบ live และไม่ใช่สิทธิ์ให้ deploy, apply migration หรือแก้ข้อมูล

> [!IMPORTANT]
> ก่อนเปลี่ยน repository ให้อ่าน [`AGENTS.md`](../AGENTS.md),
> [`08_ai/AI_HANDOFF.md`](./08_ai/AI_HANDOFF.md),
> [`08_ai/AI_CONTEXT.md`](./08_ai/AI_CONTEXT.md) และ
> [`08_ai/LESSONS_LEARNED.md`](./08_ai/LESSONS_LEARNED.md) ตามลำดับ

## Current authority

สรุปนี้อ้าง receipts ที่บันทึกแล้ววันที่ 2026-10-23: A → B client → Production
031 → B final closeout → L1 Production งานปัจจุบันคือ local C alignment
48 Markdown documents; tooling/baseline 9 ไฟล์ยังแยกอยู่ ไม่มี Production
inspection, stage/commit/push/deploy หรือ DB operation ใหม่

| เอกสาร | ใช้สำหรับ | ข้อจำกัด |
|---|---|---|
| [L1 Production Result](./06_engineering/LIST_1B_L1_PRODUCTION_RELEASE_RESULT_20261023.md) | ล่าสุดที่บันทึก: exact `b1ce449`, 15 ไฟล์, Quality 762 tests, Vercel Ready/Current และ bounded no-write smoke PASS | ไม่ใช่ Copy/Save write หรือทุก Production persona PASS; ข้อจำกัดและ favicon residual อยู่ใน receipt; ไม่มีสิทธิ์ publication รอบใหม่ |
| [Dependency A Production Result](./06_engineering/DEPENDENCY_A_PRODUCTION_RELEASE_RESULT_20261023.md) | A8 `a3114fc`, Quality/Vercel และ audit0 ณ release A | frozen A-stage receipt; stale FAIL exception ใช้เฉพาะ A และสิ้นสุดแล้ว; ข้อความ B/031-unapproved เป็นช่วงก่อน B |
| [B Client Production Result](./06_engineering/STALE_COPY_B_CLIENT_PRODUCTION_RELEASE_RESULT_20261023.md) | exact `42e01c5`, compatible client/SQL source และ Quality 658 | frozen client-publication stage; ข้อความ 031-unapproved เป็นก่อน DB execution |
| [031 Production Result](./06_engineering/STALE_COPY_031_PRODUCTION_MIGRATION_RESULT_20261023.md) | apply หนึ่งครั้ง, ledger `20261023063934`, metadata/security postflight PASS | ไม่ได้เรียก business RPC; probe ที่เคยเสนอภายหลังปิดตาม B final closeout |
| [B Final Closeout](./06_engineering/STALE_COPY_B_RELEASE_CLOSEOUT_20261023.md) | client B + Production 031 ปิดตาม Owner decision | **Production HTTP NOT RUN** ไม่ใช่ PASS หรือ probe ค้างบังคับ; ไม่มี waiver ให้ L1/งานใหม่ |
| [`AGENTS.md`](../AGENTS.md) | กติกา repository, no-replay boundary และ workspace custody | ต้องตรวจ branch, HEAD, upstream และ worktree ใหม่ทุกครั้ง |
| [`AI_HANDOFF.md`](./08_ai/AI_HANDOFF.md) | handoff ปัจจุบันและลำดับ source of truth | หลักฐานที่เปลี่ยนตามเวลาไม่ใช่ live guarantee |
| [`AI_CONTEXT.md`](./08_ai/AI_CONTEXT.md) | product/code/database context และ authority boundary | ห้ามตีความ plan เป็น execution approval |
| [`LESSONS_LEARNED.md`](./08_ai/LESSONS_LEARNED.md) | invariants และข้อผิดพลาดที่ห้ามทำซ้ำ | ข้อความ chronology เก่าต้องอ่านร่วมกับ current-state addendum |
| [Master Catalog Handoff #106](./plans/master-catalog/106-phase4-master-catalog-exact-remaining-work-handoff.md) | canonical final handoff ของ Phase 4/P-49 | เป็นหลักฐานตามเวลาที่บันทึก ไม่ใช่ live mutable state |
| [Master Catalog Result #107](./plans/master-catalog/107-phase4-p49-master-catalog-final-closeout-result.md) | closeout result และ accepted residuals | ห้ามใช้ approval receipt เก่าเป็นสิทธิ์ทำงานใหม่ |
| [DUP-1 Production Result #04](./plans/product/04-atomic-boq-duplicate-production-release-result.md) | exact migration/application release, Production QA และ residuals ของ Atomic BOQ Duplicate | เป็น execution receipt ที่ใช้แล้ว ไม่ใช่สิทธิ์ deploy/mutate ซ้ำหรือเริ่ม roadmap item ถัดไป |
| [Post-DUP-1 Repository Custody Result #05](./plans/product/05-post-dup1-repository-custody-result.md) | docs PR #10, dated deployment observation และ exact branch cleanup | เป็น repository-custody receipt ที่ใช้แล้ว ไม่ใช่ live Git guarantee หรือสิทธิ์ cleanup รอบใหม่ |
| [BOQ Save Guard Production Result #04](./plans/security/04-boq-save-null-authorization-production-release-result.md) | migration 030, Production postflight และ residuals ของ NULL authorization guard | `PRODUCTION PASS`; authority consumed; ไม่ใช่สิทธิ์ replay หรือเริ่ม Quantity/S0 |
| [R0A Quantity Input Safety Plan #06](./plans/product/06-r0a-quantity-input-safety-release-plan.md) | exact candidate, validation, residuals และ Q-A/Q-B release gates | Q-A/Q-B complete; current release status points to Result #08 |
| [R0A Quantity Input Safety Preview Result #07](./plans/product/07-r0a-quantity-input-safety-preview-result.md) | exact Preview deployment, authenticated no-write QA, limitations และ consumed Q-A phase 2 authority | frozen Preview chronology; later superseded for current status by Result #08 |
| [R0A Quantity Input Safety Production Result #08](./plans/product/08-r0a-quantity-input-safety-production-release-result.md) | exact `main` source, CI/Vercel deployment, no-write Production QA และ residuals | `PRODUCTION PASS`; Q-B complete/consumed; no migration or database write |

Migrations **027–031** ถูกบันทึกว่า applied ครั้งเดียวและห้ามแก้ retry หรือ replay
โดย 029 เป็น DUP-1, 030 เป็น BOQ Save NULL guard และ 031 เป็น stale-Copy
transport correction คนละ release ไม่ใช่ Master Catalog convergence ส่วน
expanded Production persona rehearsal ของ Master Catalog
ยังเป็น accepted residual ไม่ใช่ PASS หากต้องอ้างสถานะ Production ที่เปลี่ยน
ได้ ให้เก็บ fresh read-only evidence ใหม่

Production closeout #08 and #09 §6 retain the dated pre-A dependency findings
(six Production findings including Next 16.2.9 critical). A later patched release
closed A with audit0 at that check. L1's full-install advisories are separate
evidence, not a fresh `audit:prod`. C alignment performs no new audit/registry read.

## Current product decisions and research

ลำดับงานที่เสนอปัจจุบันและเงื่อนไข IT/SSO ให้ยึด [Integrated roadmap #09](./plans/product/09-integrated-roadmap-and-it-decision-handoff.md)
ซึ่ง supersede คำแนะนำลำดับงานและการเลือก provisioning/SSO ใน #01 เฉพาะส่วนที่ระบุ
#01 ยังคงรายละเอียดทางเทคนิค ทางเลือก และประวัติการตัดสินใจ ส่วน execution
receipts เดิมยังคงเป็น authority ของผล release ตามวันที่บันทึก ข้อเสนอใน #09
ไม่อนุมัติ implementation หรือ external operation

| เอกสาร | สถานะ | เนื้อหา |
|---|---|---|
| [01 — Product Evolution Decision Plan](./plans/product/01-conduit-boq-product-evolution-decision-plan.md) | DUP-1, 030 และ R0A released; ทางเลือก/decision รายละเอียดคงเดิม; ลำดับปัจจุบันยึด #09 | Quantity safety, Quantity Expression, auth, workflow และประวัติ roadmap |
| [02 — BOQ List Scaling Decision Plan](./plans/product/02-boq-list-scaling-decision-plan.md) | L1 released at `b1ce449`; L1.1/L2 deferred | selected pagination/search/sort/count/route contract และประวัติ choices; controls/projection เพิ่มเติมยังไม่อนุมัติ |
| [03 — Pagination Best-Practice Research](./plans/product/03-boq-list-pagination-best-practice-research.md) | research evidence; ไม่ใช่ approval | หลักฐานภายนอกและ trade-off ของ pagination |
| [04 — Atomic BOQ Duplicate Production Result](./plans/product/04-atomic-boq-duplicate-production-release-result.md) | complete; released and verified 2026-08-31 | migration 029, PR/merge/deploy, database postflight, rendered QA และ residuals |
| [05 — Post-DUP-1 Repository Custody Result](./plans/product/05-post-dup1-repository-custody-result.md) | complete; exact cleanup recorded 2026-08-31 | docs PR #10, dated Production deployment evidence, branch ancestry/deletion และ consumed authority |
| [06 — R0A Quantity Input Safety Release Plan](./plans/product/06-r0a-quantity-input-safety-release-plan.md) | Q-A/Q-B complete/consumed | numeric-only input safety, realtime editor behavior, Save/Factor coherence, evidence, residuals และ Solo release path |
| [07 — R0A Quantity Input Safety Preview Result](./plans/product/07-r0a-quantity-input-safety-preview-result.md) | frozen Q-A phase 2 chronology | exact Preview source/deployment, no-write QA, no-Save proof และข้อจำกัด ณ Preview |
| [08 — R0A Quantity Input Safety Production Result](./plans/product/08-r0a-quantity-input-safety-production-release-result.md) | complete; released and verified 2026-10-12 | exact `main`/CI/Vercel identity, no-write QA, database proof และ separate LIST-1B finding |
| [09 — Integrated Roadmap and IT Decision Handoff](./plans/product/09-integrated-roadmap-and-it-decision-handoff.md) | A/B/031/L1 closed; remaining work proposed, no new implementation approval | S0/user minimum → wider R0/D0 → W-H → Expression; IT/SSO discovery คู่ขนาน, hosting/identity gates และ Owner/IT decisions |
| [10 — Global Estimating Research and Capability Backlog](./plans/product/10-global-estimating-research-and-capability-backlog.md) | research/backlog; ไม่ใช่ approval หรือ main sequence | official product comparison, แนวคิดเดิมที่ย่อไว้, Later/Discovery และข้อเสนอใหม่ 3 ข้อที่ Owner ให้พักตาม #09 §8.1 |

DUP-1 ผ่าน implementation, isolated database rehearsal, tests, Production
verification และ postflight แล้ว Migration `029_atomic_boq_duplicate.sql`
ถูก apply ครั้งเดียวเป็น `20260831004110/atomic_boq_duplicate` สำหรับ product
release ใหม่นี้ ไม่ใช่ migration ที่ใช้เพื่อ repository convergence และห้าม
แก้ไขหรือ replay 027, 028 หรือ 029

## Developer entry points

| จุดเริ่ม | ใช้สำหรับ |
|---|---|
| [Root README](../README.md) | ภาพรวม application, setup และ quality commands |
| [`package.json`](../package.json) | scripts และ dependency versions ที่ repository ใช้จริง |
| [CI quality workflow](../.github/workflows/quality.yml) | Node.js 22, `npm ci`, lint, test และ build contract |
| [Local Supabase guide](./LOCAL_SUPABASE.md) | dated local contracts/receipts, unpublished-tool custody และ unlinked safety; ไม่มี reset/test authority ใหม่ |
| [Local Database Parity Plan](./06_engineering/LOCAL_DATABASE_PARITY_PLAN.md) | design/approval chronology ของ final-state baseline; execution ภายหลังดู Result; ห้าม replay 027–030 |
| [Local Database Parity Result](./06_engineering/LOCAL_DATABASE_PARITY_RESULT.md) | frozen original captured-baseline result 46 PASS / stale Copy 1 FAIL; separate 031 overlay and later release receipts do not erase this result |
| [Stale-Copy Local Correction](./06_engineering/BOQ_DUPLICATE_STALE_CONFLICT_LOCAL_RESULT.md) | dated local 49/49 API, two-tab recovery, 664 tests/build PASS and authority correction; publication/application outcomes use later A/B/031 receipts |
| [Separate Local Release Candidates](./06_engineering/LOCAL_RELEASE_CANDIDATES_20261023.md) | original A643/A+B658 source separation/native checks; later release pointers and C/tooling separation |
| [Dependency → Stale Copy Release Plan](./07_process/DEPENDENCY_AND_STALE_COPY_RELEASE_PLAN_20261023.md) | frozen A-first/B-next plan and exception history; execution completed later under separate receipts, no reusable approval |
| Host-local `scripts/local-db-parity.mjs` | unpublished historical preparation tool, excluded with eight related tooling/baseline artifacts from this docs-only candidate; not a current post-031 restore runbook |
| [`scripts/bootstrap-local-db.sh`](../scripts/bootstrap-local-db.sh) | historical pre-027 bootstrap ledger; ห้ามใช้เป็น current parity rebuild |

CI ใช้ Node.js 22 และ `npm ci`; Vercel configured Node24.x และมี local Node24
checks ใน receipts การตรวจ lint/test/build ต้องเหมาะกับ scope; web CI ไม่แทน
database/RLS/persona rehearsal ส่วน docs-only C ใช้ link/authority/doc-contract
checks โดยไม่ติดตั้ง package หรือเรียก Docker/Production

## Database and migration sources

- [`../migrations/`](../migrations/) คือที่เก็บ forward SQL artifacts ระดับ
  repository การมีไฟล์อยู่ไม่ได้แปลว่า applied หรือ authorized
- [`04_data/MIGRATIONS.md`](./04_data/MIGRATIONS.md) เป็น migration inventory
  และ chronology ให้อ่าน current addendum/closeout ก่อนข้อความเก่า
- [`LOCAL_SUPABASE.md`](./LOCAL_SUPABASE.md) อธิบาย local target และ chronology
  ของ captured baseline/031 overlay; `scripts/local-db-parity.mjs` เป็น host-local
  unpublished tool ที่ไม่รวม C docs-only ไม่ใช่ post-031 restore runbook
  ส่วน bootstrap เก่า apply root chain ถึง 026 และไม่ใช่คำสั่ง current parity
- [`supabase/local/production-baseline.sql`](../supabase/local/production-baseline.sql)
  เป็น Local schema baseline ไม่ใช่ Production migration
- [`../migrations/README.md`](../migrations/README.md) เป็นคู่มือ historical
  multi-route migration 002 ไม่ใช่ runbook สำหรับ migration ปัจจุบัน

ห้ามเพิ่ม 027–031 เข้า bootstrap แบบเงียบ ๆ Bootstrap ปัจจุบัน
หยุดที่ 026 และไม่มี post-030 parity วิธี isolated post-028 แล้ว apply 029 ใน
[DUP-1 result](./plans/product/04-atomic-boq-duplicate-production-release-result.md)
เป็น historical rehearsal ที่ authority ใช้แล้ว ไม่ใช่คำสั่งสำหรับงานใหม่
การเตรียมฐานยึด [Local Database Parity Plan](./06_engineering/LOCAL_DATABASE_PARITY_PLAN.md)
และ [ผลดำเนินการ 2026-10-23](./06_engineering/LOCAL_DATABASE_PARITY_RESULT.md)
ซึ่งเก็บ original PARTIAL/46-of-47 ไว้ตามจริง ผล 031 overlay และ A/B/L1 อยู่ใน
receipts ถัดมา ไม่ใช่เหตุให้ restore/reset/replay เพื่อจัดเอกสาร
ห้ามใช้ `supabase link`, `supabase db push`, `supabase db pull` หรือ linked
diff จาก worktree นี้

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
- [`plans/factor-f/`](./plans/factor-f/) — หลักฐาน change/runbook/closeout ของ
  rollout 2026-06-29; F4 ปัจจุบันให้ยึด
  [`ADR-005`](./02_architecture/ADR/ADR-005-versioned-factor-f-reference.md),
  [`FACTOR_F.md`](./05_calculation/FACTOR_F.md) และ
  [DUP-1 Result #04](./plans/product/04-atomic-boq-duplicate-production-release-result.md)

อย่าแก้ historical evidence ให้ดูเหมือนเป็นสถานะปัจจุบัน หากเอกสารสองฉบับ
ขัดกัน ให้หยุดและใช้ authority hierarchy ด้านบนพร้อมตรวจ code/database ใหม่
ก่อนตัดสินใจ
