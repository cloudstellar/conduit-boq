# Changelog
## NT Conduit BOQ Documentation

---

## 2026-10-23 — C documentation alignment (local; unpublished)

- Owner approved the existing 48 Markdown documents for local convergence,
  link checks and documentation contract tests. Nine parity tooling/baseline
  artifacts remain excluded and unchanged; no runtime/package/migration change.
- Aligned current entry points, roadmap, stack and local-guidance boundaries to
  completed A/B/031 and L1. Older entries and execution receipts retain their
  as-of-stage facts, including predecessor FAIL and the local 031 authority error.
- B Production HTTP stays **NOT RUN**, closed by Owner decision. No extra probe,
  Docker/DB operation, Production access, stage/commit/push/deploy is part of C.
  A later docs-only push still needs explicit approval and may trigger Vercel.

## 2026-10-23 — LIST-1B L1 Solo Production release

- Exact 15-file commit `b1ce4495e4f1ec7c675b1341c2121d7b3e0b589f`, tree
  `bc47a60a9d97f2ba655f7bafedd4f0a3154a20d7`, from B `42e01c5`; one normal
  push, no C/tooling/package/DB/migration changes.
- Quality run `39947480932`: 762 tests/59 files, lint 0 errors/3 existing
  warnings, build PASS. Vercel `47nXCLuL9ZhXLkDiGWaEfqGhx5df` was Ready/Current
  at exact L1; approximately 14 minutes of bounded Owner no-write smoke passed.
- Page1/2/search/sort/Back/route dialog/Print passed; sampled former mismatch
  displayed badge2/dialog2. Page/count1GET + route batch1GET per observed attempt,
  excluding normal Auth/profile, CORS and Next prefetch calls.
- The [L1 receipt](./06_engineering/LIST_1B_L1_PRODUCTION_RELEASE_RESULT_20261023.md)
  retains search URL/log exposure, route cap/concurrency, sandbox cold-build and
  reported-version limits, plus cosmetic favicon404. No write probes or rollback
  ran; L1.1/L2 and other roadmap work remain unapproved.

## 2026-10-23 — Production 031 and bounded B final closeout

- Separately approved Production 031 ran once, actual ledger
  `20261023063934/boq_duplicate_stale_conflict_guard`, OID `112777`, successor
  SHA `508f70695e5f5578734570d356c5a0921cab0e0dc0a207e8ffcc9aca313b68b2`;
  selected metadata/security/ledger postflight and independent review passed.
- No business RPC ran. Owner then chose no additional stale HTTP probe and
  closed B on recorded local/quality/deployment and metadata/ledger evidence.
  **Production stale HTTP remains NOT RUN**, not full behavior PASS or a required
  pending task; this decision does not waive future release tests.
- See [031 receipt](./06_engineering/STALE_COPY_031_PRODUCTION_MIGRATION_RESULT_20261023.md)
  and [B final closeout](./06_engineering/STALE_COPY_B_RELEASE_CLOSEOUT_20261023.md).
  027–031 remain immutable/no-replay; no new Git publication occurred in this DB step.

## 2026-10-23 — B client Solo Production release

- Published exact B4 `42e01c56fe2eacb5239abc8d296ca1848c48a03b`, tree
  `6283410f997d00fc808cd9d8f7153b9bc381786f`; Quality658 PASS and Vercel
  `Gf8gmTN8H5k7dYebeEzRwV5DwjW5` Ready/Current at that stage.
- Client accepts legacy `40001` and only `PT409` + `BOQ_SOURCE_STALE` as stale;
  request UUID/source token/recovery remain. 031 was SQL source only during
  client publication; its later DB execution is a separate entry above.
- [Client receipt](./06_engineering/STALE_COPY_B_CLIENT_PRODUCTION_RELEASE_RESULT_20261023.md)
  remains frozen. C was excluded. Each older entry below describes its own
  stage; its "current", "unreleased" or "unapproved" wording is not today's status.

## 2026-10-23 — Dependency A Solo Production release

- Published only the approved A8 commit `a3114fc0eda2eb8d898ad2949ebc71250515df1f`:
  Next/config16.4.2, PostCSS8.5.23, Sharp0.35.5 lock and bounded lint corrections.
- Fresh production audit0; representative Node24 host/native checks passed.
  Quality39907043530 passed643 tests; Vercel6WnAcbAV88JxGJ7bHsW5Jgy85pCz is
  Production Ready/Current. Bounded public-login/script HTTP checks passed;
  authenticated BOQ/Print, app browser/console and Production DB QA were NOT RUN.
- [A result](./06_engineering/DEPENDENCY_A_PRODUCTION_RELEASE_RESULT_20261023.md)
  records exact source, tests and limits. The known stale-Copy FAIL remains
  tracked; its A-only exception and publication authority are consumed.
  B/031 remain local/unapproved; no DB mutation/reset/migration occurred.
  Closeout docs and existing C work stay local, with no second commit/push/deploy.

## 2026-10-23 — A-only exception accepted; two-release plan for review

- Owner explicitly accepted the preserved stale-Copy FAIL temporarily for the
  exact dependency/lint candidate A, then B as a separate next release. The
  exception is accepted and consumed at A closeout; it does not cover B or
  new failures and grants no publication/Production authority.
- Added a [reviewable A/B plan](./07_process/DEPENDENCY_AND_STALE_COPY_RELEASE_PLAN_20261023.md)
  with exact allowlists/hashes, Solo/CI timing, target checks, client-before-DB
  order, 031 executor/window/ledger proposal, bounded QA and recovery limits.
- Planning/docs only: no runtime/package/DB/test change, staging, commit/push,
  deployment or Production access. Historical FAIL/approval-correction receipts
  and immutable 027–031 artifacts remain unchanged.

## 2026-10-23 — Prospective authority correction and local source separation

- Recorded that the earlier 031 creation/application overinterpreted the Owner's
  request to continue; later local approval is prospective. Kept original
  receipts/SQL/hash and current DB unchanged.
- Added future 031 execution conditions, including no concurrent DDL and no
  unresolved in-flight Copy retries; no automatic restart/reversal/ledger repair.
- Exact A-only checks: 643 tests, lint, TypeScript/build PASS. A+B: 658 tests
  and the same quality gates PASS. Six separate baseline-tooling tests explain
  the previous 649/664 totals. Fresh Production audit 0 and Linux x64 native
  Production-only install/Sharp smoke PASS.
- READ ONLY local postflight matched 30 table fingerprints and 031 metadata.
  No DB writes, reset/replay, Production access or Git publication. See the
  [local preparation result](./06_engineering/LOCAL_RELEASE_CANDIDATES_20261023.md).

## 2026-10-23 — Stale-Copy local forward correction (unreleased)

- Added exact guarded forward 031 and compatible client handling for
  `PT409`/`BOQ_SOURCE_STALE`, preserving legacy `40001` recognition and all other
  Duplicate behavior. Applied once to the existing local target; no reset,
  historical migration replay or Production request.
- Fresh API **49/49**, real two-tab stale denial/reload/fresh Copy, **664 tests**,
  lint (0 errors/3 existing warnings), TypeScript and Next build passed.
- Local is captured baseline plus explicit 031 candidate. Earlier failures and
  frozen baseline remain unchanged. Dependency and conflict-fix releases stay
  separate pending Owner sequencing/approval; no commit/push/deploy. See the
  [local result](./06_engineering/BOQ_DUPLICATE_STALE_CONFLICT_LOCAL_RESULT.md).

## 2026-10-23 — Local Docker baseline prepared (unreleased; PARTIAL)

- Added final-state metadata capture/materialization, strict existing-local target
  guards, synthetic fixtures and real Auth/API/browser acceptance tooling.
  Captured application contracts match 30 tables, 96 functions and 27 triggers
  with three exact platform mappings; no migration 027–030 replay.
- Restored all seven original local usernames with the unchanged configured
  password. API result: 46 PASS / 1 stale-Copy transport FAIL. Browser checks,
  saved Print, actual five-page PDF and downloaded Excel passed the bounded
  synthetic vector. See [Local Parity Result](./06_engineering/LOCAL_DATABASE_PARITY_RESULT.md).
- Kept the real stale-Copy failure as a separate correction decision; no product
  behavior/dependency change, Production write, commit/push or deployment.

## 2026-10-15 — Local test baseline plan simplified (unreleased)

- Recorded the [release working agreement](./07_process/RELEASE_PROCESS.md#working-agreement-20261015)
  and mandatory agent/handoff pointers: inspect existing work first, perform
  affected DB-backed acceptance on local Docker with relevant current contracts,
  report source/target/PASS/FAIL/NOT RUN/limits, then obtain explicit release
  authority. CI/build alone is not database integration evidence; no extra PR,
  backup/stack or repeated in-scope approval is required.
- Recorded the 2026-10-15 09:22 Bangkok read-only local metadata recheck in the
  handoff and local plan; the same three successor RPC/guard probes remain absent.
- Refined the [Local Database Parity Plan](./06_engineering/LOCAL_DATABASE_PARITY_PLAN.md)
  to propose rebuilding the existing local test DB after execution approval.
  Backup of recreatable test data and a separate candidate stack are optional,
  replacing the requirements in the 2026-10-14 plan below. Owner backup files
  remain untouched and are not a prerequisite unless selected as input.
- No database/container/config/script change, migration replay, commit or push.

## 2026-10-14 — Local documentation alignment candidate (unreleased)

- Added the plan-only [Local Database Parity Plan](./06_engineering/LOCAL_DATABASE_PARITY_PLAN.md)
  after read-only local Docker/PG metadata checks. It preserves the existing
  test stack and Owner backup/snapshot files and proposes a separately approved
  final-state candidate, with no 027–030 replay or database/config/script change.

- Recorded [Integrated Roadmap #09](./plans/product/09-integrated-roadmap-and-it-decision-handoff.md)
  as current proposed sequencing: dependency security -> LIST-1B -> S0/user
  minimum -> wider R0/D0 -> W-H -> Quantity Expression, with IT/SSO discovery
  now and cutover order conditional on confirmed IT policy.
- Recorded signed-paper approval by the conduit engineering section manager,
  unknown IdP/protocol and unconfirmed internal-all hosting requirements.
- Recorded the Owner's deferral of the three additional market-research
  proposals; [Research/Backlog #10](./plans/product/10-global-estimating-research-and-capability-backlog.md)
  preserves comparisons and prior ideas without new release/prerequisite scope.
- Aligned active documentation entry points and reference qualifiers; preserved
  dated release receipts, financial rules and historical status boards.
- This is local documentation work, not an application release, Git
  commit/push, deployment, package update, migration or Production operation.

---

## Historical pre-A advisory plan — later completed by Dependency A

- The read-only audits recorded on 2026-10-12/14 reported six Production findings:
  one critical, four high, and one moderate. Direct `next@16.2.9` is critical;
  the recorded npm fix path offered `16.4.0` as a non-major candidate.
- Next.js has announced another out-of-band security update for 2026-10-14.
  Keep the upgrade separate from Quantity and feature work; prefer one reviewed
  dependency release after the announced patched version is available unless
  immediate remediation is chosen.
- The existing CI workflow does not run `audit:prod`; adding a CI audit gate is
  an open scope decision, not authorized by documentation alignment. Reverify
  registry/advisories before choosing a patched version; see #09 section 6.

---

## 2026-10-12 — Quantity Input Safety Production release

- Numeric-only Quantity safety, real-time editor totals, cancel/restore,
  stable draft identity and Factor-bound Save coordination are implemented and
  validated locally.
- The local freeze created runtime/tests commit `b18e69a` and documentation
  commit `a467d38`. The final clean HEAD passed 643 tests in 56 files, ESLint,
  TypeScript, production build and `git diff --check`.
- Exact Preview source `5527fe9` passed authenticated no-write Vercel Preview
  QA. Exact source `4d285f8` then fast-forwarded to `main`; GitHub Quality and
  Vercel Production passed under the Owner-selected Solo Q-B path.
- Preview verified valid real-time totals/Factor, visible rejection of `5x2`,
  Escape/Cancel, route identity, reload/no-Save behavior, and saved Print data.
  Production repeated the no-write behavior, captured a clean console, rendered
  saved Print data, and used a read-only database query to confirm unchanged
  quantity/totals/timestamps. A persistent current-schema Save and repeated
  Production Excel/PDF generation remain bounded residuals. Details:
  [Product Plan #06](./plans/product/06-r0a-quantity-input-safety-release-plan.md),
  [Preview Result #07](./plans/product/07-r0a-quantity-input-safety-preview-result.md),
  and [Production Result #08](./plans/product/08-r0a-quantity-input-safety-production-release-result.md).
- The candidate adds no formula parser, schema/RPC change or migration.
- Production confirmed one multi-route RouteBadge mismatch: `UI Test #5`
  showed one route in the register while its editor/database had two. A real
  one-route BOQ showing one is expected. Per-row queries, ignored error state,
  fallback behavior, and high request amplification remain LIST-1B risks, but
  the exact trigger for that badge observation was not captured. This is not a
  Quantity regression and no stored route was lost.

---

## 2026-10-12 — BOQ Save NULL authorization guard Production release

- Applied migration 030 once as
  `20261012100608/boq_save_null_authorization_guard` from reviewed source
  `cb2bb60`; repository closeout is `7c09ab8`.
- Changed only the final Save authorization check to reject NULL as well as
  false while preserving function identity, ACL, configuration, calculations
  and business data.
- Migrations 027–030 are immutable/no-replay; the release authority is
  consumed. Details: [Security Result
  #04](./plans/security/04-boq-save-null-authorization-production-release-result.md).

---

## 2026-09-08 — BOQ editor-load/Save guard and signed-out login correction

- PR #12 merged as `c0cb6451c4d9924f69de93df4eee80abb6cca3c9`.
- The editor blocks Save when required BOQ graph data is incomplete and login
  remains usable when no existing auth session is present.
- This repository result is separate from the later Quantity local candidate.

---

## 2026-09-01 — Post-DUP-1 repository custody alignment

- บันทึก docs PR #10 และ Vercel Production observation แบบมีวันที่ โดยแยก
  ออกจาก frozen DUP-1 application release identity
- บันทึกการลบ local/remote refs ของ `codex/atomic-boq-duplicate`,
  `codex/atomic-boq-duplicate-closeout` และ `codex/main-convergence` หลังตรวจ
  ancestry และ merge ครบแล้ว
- รักษา `branchDeleted: false` ใน Result #04 เป็น chronology ณ release closeout
  และเพิ่ม Result #05 เป็น custody overlay ภายหลัง
- ไม่มีการเปลี่ยน application runtime, database, migrations, Catalog, Factor F,
  BOQs, accounts หรือ protected archive

รายละเอียด: [Post-DUP-1 Repository Custody Result
#05](./plans/product/05-post-dup1-repository-custody-result.md)

---

## 2026-08-31 — Atomic BOQ Duplicate Production release

- เปิดใช้ **คัดลอก** แบบ atomic/idempotent: สำเนาปกติรักษา Catalog รายการ
  ราคา และ Factor F ของต้นฉบับ พร้อม reset เป็น draft ใหม่
- เพิ่ม flow แยก **คัดลอกและเลือก Factor F** สำหรับ legacy BOQ ที่เข้าเงื่อนไข;
  ระบบรักษา Catalog/items/prices เดิมและปิด Print/PDF/Excel จน review/save
  สำเร็จ
- หากต้องการราคาปัจจุบันให้ใช้ **สร้างใหม่**; ไม่มี requote/reprice/rebase
  หรือ backfill ต้นฉบับ
- Editor, route allocation, Print และ Excel derive VAT จาก bound Factor-version
  metadata; published versions ปัจจุบันและ legacy fallback ยังเป็น 7% โดยไม่มี
  Factor dataset/default-pointer change
- Apply migration 029 ครั้งเดียวเป็น
  `20260831004110/atomic_boq_duplicate`; PR #9 merge/deploy และ Production
  desktop/mobile/fail-closed/no-residue postflight ผ่านครบ

รายละเอียด: [DUP-1 Production Result](./plans/product/04-atomic-boq-duplicate-production-release-result.md)

---

## [v1.7.0] - 2026-05-31 (Calm & Professional NT Enterprise Dashboard MVP)

### 🎨 สุนทรียภาพดีไซน์: ปรับปรุงหน้าแรกสู่ Calm Enterprise Dashboard
ปรับปรุงการแสดงผลหน้าแรก (Dashboard/Home) จากเดิมที่เป็นบล็อกดีไซน์เริ่มต้นทั่วไป (AI Boilerplate) ให้กลายเป็นแดชบอร์ดระดับวิสาหกิจที่นิ่ง สะอาดตา สแกนอ่านข้อมูลได้รวดเร็ว (High Scanning Efficiency) ตามหลักการ **pbakaus/impeccable** หลีกเลี่ยงดีไซน์แบบ AI-SaaS ซ้ำซาก (ไม่มี gradient หนา, ไม่มี glow หนา, ไม่มีตัวอักษรสีเทาบนพื้นสี)

- **อัตลักษณ์องค์กร NT (NT Brand Identity)**: ใช้สีหลักคือ **สีน้ำเงิน NT (`#0056B3`)** และ **สีส้ม NT (`#F58220`)** เฉพาะจุดนำสายตา ปุ่มคำสั่งหลัก ไอคอน และขอบ Badge เพื่อความภูมิฐานและสวยงามอย่างลงตัว
- **ฟอนต์ภาษาไทยพรีเมียม (IBM Plex Sans Thai)**: นำเข้าฟอนต์ภาษาไทยผ่าน `next/font/google` ใน `app/layout.tsx` และตั้งค่าภาษาหลักของหน้าเว็บเป็น `lang="th"`
- **Tailwind Tokens**: แมปตัวแปรสี NT เข้ากับระบบดีไซน์ใน `globals.css` เป็น `@theme inline` สำหรับใช้งานใน Tailwind v4 ปราศจากสีที่ไม่มีจริงใน Palette มาตรฐาน (กำจัด slate-150, slate-250, slate-350 ออกทั้งหมด)

### 💾 ข้อมูลและสถิติ: ดึงข้อมูลจริงจาก Supabase (Dynamic stats & hook)
สร้าง Custom Hook `lib/hooks/useDashboardData.ts` ดึงตัวเลขอิงข้อมูลจริงแบบไร้ปัญหา Waterfall (ผ่าน `Promise.all` และ Query แบบจำกัดคอลัมน์)
- **สถิติส่วนบุคคล (Personal Stats)**: แสดงจำนวนใบประมาณราคาของตนเอง และยอดงบประมาณสะสมรวมภาษีสุทธิ (`total_with_vat` เป็นหลักแรกสุด)
- **การแยกสิทธิ์ข้อมูล (Stats Scope Separation)**: สิทธิ์ทั่วไปมองเห็นสถิติตนเอง ส่วนสิทธิ์ผู้จัดการ/แอดมิน (`dept_manager`, `sector_manager`, `admin`) จะมีการ์ดสรุปข้อมูลรวมของแผนกแยกบล็อกออกไปอย่างเป็นระเบียบชัดเจน
- **ข้อมูลราคากลางสด**: คำนวณจำนวนข้อมูลวัสดุและค่าแรงสดตรงจากตาราง `price_list` ด้วย Head-only query ประหยัด bandwidth
- **บอร์ดกลับไปทำงานต่อ (Recent BOQs)**: ดึง 5 ใบงานล่าสุดที่แก้ไขล่าสุดจริง (อิงตามการสั่งจัดเรียง `updated_at` Descending) เพื่อความสะดวกรวดเร็วในการกดทำต่อ

### 🧩 ชิ้นส่วนคอมโพเนนต์ย่อย (Subcomponents Composition)
จัดสัดส่วนคอมโพเนนต์ให้ยืดหยุ่น ดูแลรักษาง่ายภายใต้โฟลเดอร์ `components/dashboard/*`:
- `DashboardHeader.tsx`: ต้อนรับผู้ใช้ สังกัด และแสดง Badge สิทธิ์ พร้อมระบบ Onboarding เช็คจากตัวแปรจริง `onboarding_completed`
- `StatsGrid.tsx`: แสดงตัวเลขวิเคราะห์ข้อมูลสรุป พร้อมระบบ Skeletons รองรับสถานะโหลดช้า
- `ActionHub.tsx`: ปุ่มปฏิบัติการด่วนนำทางสร้างงาน ค้นหา และดูรายการทั้งหมด
- `RecentBOQList.tsx`: บอร์ดตารางรวมใบงานล่าสุด และแสดงสภาวะไม่มีงานค้าง (Empty State) เป็นภาษาไทยอย่างนุ่มนวล

### 📁 ไฟล์ที่เกี่ยวข้อง (8 ไฟล์)

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `app/layout.tsx` | นำเข้า IBM Plex Sans Thai ผ่าน `next/font`, เปลี่ยนภาษาเว็บหลักเป็น `lang="th"` |
| `app/globals.css` | สร้าง NT design tokens และเชื่อมฟอนต์ภาษาไทยเข้ากับระบบ Tailwind v4 |
| `lib/hooks/useDashboardData.ts` | [NEW] Custom hook ดึงและประมวลผลข้อมูลสดจากระบบด้วยความเร็วสูงและประเภทข้อมูลที่ปลอดภัย |
| `components/dashboard/DashboardHeader.tsx` | [NEW] คอมโพเนนต์แสดงสิทธิ์ สังกัด และต้อนรับผู้ใช้งาน |
| `components/dashboard/StatsGrid.tsx` | [NEW] คอมโพเนนต์สรุปตัวเลขสถิติแยกตามระดับผู้ใช้งาน |
| `components/dashboard/ActionHub.tsx` | [NEW] คอมโพเนนต์ทางด่วนสร้างและสืบค้นเอกสาร |
| `components/dashboard/RecentBOQList.tsx` | [NEW] บอร์ดแสดงเอกสารประมาณการล่าสุดเพื่อกดปฏิบัติการต่อ |
| `app/page.tsx` | ประสานงานคอมโพเนนต์ย่อย และจัดระบบความทนทานต่อสภาวะโหลด/บั๊ก (States Handling) |

---

## [v1.6.3] - 2026-03-27 (Category-Based Item Sorting)

### 🔧 ปัญหา: รายการที่เพิ่มทีหลังตกท้ายเอกสาร

20 รายการ PN8 กลบทราย ถูกเพิ่มเข้า `price_list` เป็น **ITEM-0663~0682** (category `2.3.`) แต่ `item_order` ที่ derive จาก `item_code` ทำให้ sort ตกท้ายเอกสาร (order 669 > 662 ซึ่งเป็นรายการสุดท้ายของชุดเดิม)

### 🛡️ การแก้ไข: Sort by Category → item_order

เปลี่ยนจาก sort by `item_order` อย่างเดียว เป็น **sort by `category` (natural sort) → `item_order`** ภายใน category เดียวกัน:

```typescript
function sortItemsByCategory(items) {
  return items.sort((a, b) => {
    const cmp = a.category.localeCompare(b.category, undefined, { numeric: true });
    if (cmp !== 0) return cmp;           // "2.3." < "10.2." (natural sort)
    return a.item_order - b.item_order;   // ภายใน category เดียวกัน
  });
}
```

**วิธีดึง category:** Join `price_list(category)` ผ่าน FK `boq_items.price_list_id` — ไม่ต้อง migration

### 📦 ไฟล์ที่เปลี่ยน (4 ไฟล์)

| ไฟล์ | เปลี่ยนแปลง |
|------|-----------|
| `LineItemsTable.tsx` | เพิ่ม `category?` ใน `LineItem` interface |
| `MultiRouteEditor.tsx` | Join price_list, แนบ category, sort ก่อนแสดงผล |
| `print/page.tsx` | Join price_list, sort route + consolidated pages |
| `exportBoqExcel.ts` | เพิ่ม category ใน ExportBOQItem, sort route + consolidated |

### ⚠️ หลักการสำคัญ (สำหรับ AI session ถัดไป)

1. **item_order ไม่ใช่ลำดับจริง** — เป็นแค่ตัวเลขจาก item_code (ITEM-0669 → 669) ใช้เรียงภายใน category เดียวกันเท่านั้น
2. **category เป็น sort key หลัก** — ดึงจาก `price_list` ผ่าน FK `price_list_id` ไม่ได้เก็บใน `boq_items`
3. **ใช้ `localeCompare` กับ `{ numeric: true }`** — เพื่อให้ `"2.3."` มาก่อน `"10.2."`
4. **ไม่มี migration** — ทำง่ายเมื่อทำระบบ category/item_code ใหม่ในอนาคต เปลี่ยน sort logic ได้เลย
5. **BOQ เก่าก็ได้ประโยชน์** — พิมพ์ใหม่เมื่อไร ก็เรียงถูกเลย (แต่เลขลำดับอาจเปลี่ยน)

---

## [v1.6.2] - 2026-03-18 (Comprehensive Float Precision Safety)

### 🔢 ปัญหา: JavaScript Floating-Point Precision

JavaScript ใช้ IEEE 754 double-precision ในการเก็บตัวเลข ทำให้การคูณทศนิยมบางชุดได้ผลลัพธ์เพี้ยน:

```
2,738,389 × 1.275 → JS ได้ 3,491,445.9749999996 (ควรเป็น .975)
```

ต่างจาก Excel ที่ซ่อนความเพี้ยนโดยปัดเหลือ 15 significant digits ก่อนแสดงผล

### 🛡️ การแก้ไข: Integer Math ทุกจุดคูณ

สร้าง `safeMul()` เป็นฟังก์ชันแกนกลาง แปลงตัวเลขเป็น **จำนวนเต็ม** ก่อนคูณ:

| จุดคำนวณ | ฟังก์ชัน | Precision |
|---|---|---|
| ค่างาน × Factor F | `multiplyFactor()` | 2dp × 4dp |
| ปริมาณ × ราคา/หน่วย | `safeItemCalc()` | 2dp × 2dp |
| ค่าก่อน VAT × 0.07 | `safeMul()` (ใน `calculateVAT`) | 2dp × 4dp |
| ปัดเศษ 2 ทศนิยม | `roundMoney()` | exponential notation |

### ⚠️ เจตนารมณ์ (สำหรับ AI session ถัดไป)

> **ห้ามใช้ `*` ดิบในการคูณตัวเลขที่เกี่ยวกับเงิน/ราคาโดยเด็ดขาด**
>
> ทุกการคูณทศนิยมต้องผ่าน `safeMul()`, `multiplyFactor()`, หรือ `safeItemCalc()` เท่านั้น
> การบวก/ลบ (addition/subtraction) ไม่มีปัญหา ไม่ต้องใช้ safe function

### 📁 Files Changed
- `lib/calculation.ts` — เพิ่ม `safeMul()`, `safeItemCalc()`, ปรับ `calculateVAT()` ให้ใช้ `safeMul()`
- `components/boq/FactorFSummary.tsx` — ใช้ `multiplyFactor()` แทน `*`
- `components/boq/MultiRouteEditor.tsx` — ใช้ `safeItemCalc()` แทน `quantity * unit_cost`
- `app/boq/[id]/print/page.tsx` — ใช้ `multiplyFactor()` แทน `*`

---

## [v1.6.1] - 2026-03-18 (Rounding Precision Fix - Partial)

> **Note**: v1.6.1 แก้ได้แค่บางกรณี (exponential notation ในขั้นปัด) ยังไม่ครอบคลุมขั้นคูณ ดู v1.6.2 สำหรับการแก้ไขสมบูรณ์

### 🐛 Bug Fix
- **Float Precision in `roundMoney`**: Switched from `Math.round(value * 100) / 100` to exponential notation
- **FactorFSummary Display Consistency**: ใช้ `totalWithFactor` ที่ปัดแล้ว แทน raw `grandTotalCost * factor`

### 📁 Files
- `lib/calculation.ts` — `roundMoney()` implementation fix
- `components/boq/FactorFSummary.tsx` — display consistency fix

---

## [v1.6.0] - 2026-03-17 (Excel Export)

### 📊 Excel Export (ปร.4)
- **Export to Excel Button**: Added "Excel" button (with FileSpreadsheet icon) next to the "พิมพ์" button on the BOQ print preview page.
- **Route Detail Sheets** (`ปร.4 เส้นทาง N`): One sheet per route with 2-row merged headers, styled cells, and all item data.
- **Consolidated Sheet** (`ปร.4 รวมทุกเส้นทาง`): For multi-route BOQs, merges items with the same name across all routes (summed quantities and costs). Only appears when routes > 1.
- **Summary Sheet** (`สรุปรวม`): Factor F columns (≤5M / >5M), allocated route costs with VAT, Thai baht text (`numberToThaiText`), conditions, notes, and estimator signature.
- **Factor F Supplement Sheet** (`Factor F`): Formula display, variables A-E with values, calculation steps (raw → truncated), and signature.

### 🎨 Styling
- **Font**: TH Sarabun New applied globally via `defaultFont()` helper (fallback to system font if not installed).
- **Colors**: Header fill `#FFFDE7`, total row fill `#FFFDE7`, highlight-box `#FFEB3B` — all matching print preview CSS exactly.
- **Page Setup**: A4 landscape with fit-to-width for route/summary sheets, A4 portrait for Factor F sheet.

### 🔒 Data Correctness
- **Single Source of Truth**: Export uses the same React state as print preview — no separate DB query.
- **Checksum Validation**: Verifies route totals match sum of item totals before generating file (tolerance ≤ 0.01 baht).
- **Raw Numbers**: Sends actual numbers to Excel (not formatted strings) to preserve calculation precision.

### 🔧 Technical
- **Dynamic Import**: `exceljs` and `file-saver` loaded via `import()` on button click — zero impact on initial page bundle.
- **Dependencies Added**: `exceljs@4.4.0`, `file-saver@2.0.5`, `@types/file-saver`.
- **Branch**: Developed on `feat/excel-export`, merged to `main` via fast-forward.

### 📁 Files
- `lib/exportBoqExcel.ts` — 894 lines, core export module
- `app/boq/[id]/print/page.tsx` — +27 lines (button + handler)

---

## [v1.5.1] - 2026-03-17 (BOQ Remarks)

### 📝 Remarks Feature
- **Item-Level Remarks**: Added remarks input field in the line items editor (`LineItemsTable.tsx`).
- **Route-Level Remarks**: Repurposed `route_description` field in `MultiRouteEditor.tsx` as "หมายเหตุเส้นทาง (แสดงในหน้าสรุปรวม ปร.4)".
- **Print Layout**: Both remark columns set to symmetrical `120px` width in print CSS.
- **No Migration**: Used existing `remarks` column in `boq_items` and `route_description` in `boq_routes`.

---

## [v1.5.0] - 2026-03-17 (Factor F Supplement Page)

### 📄 Document Printing
- **Factor F Supplement Page**: Added a new final page to the print output showing the exact formula, variables, and calculation steps for Factor F interpolation.
- **Space Optimization**: Removed redundant Factor F conditions from individual item page footers to allow more rows per page. Conditions now only show on the summary page.

### 💾 Data & Calculation
- **Factor F Snapshots**: Added 5 new snapshot columns (`factor_f_raw`, `factor_f_lower_cost`, `factor_f_upper_cost`, `factor_f_lower_value`, `factor_f_upper_value`) to preserve exact interpolation variables at the time of BOQ creation.
- **Fallback Logic**: For legacy BOQs without snapshots, the system dynamically queries the `factor_reference` table during printing to construct the calculation page.
- **RPC Update**: Updated `save_boq_with_routes` to persist the new snapshot columns securely.

### 🎨 UX Improvements
- **Quick Print**: Added a "Print" button immediately next to the primary "Save" button in the BOQ editor for faster workflow.
- **Global Cursors**: Enforced `cursor: pointer` globlally on all buttons and interactive elements.

---

## [v1.4.0] - 2026-02-01 (shadcn/ui Migration Complete)

### 🎨 UI/UX Improvements

#### shadcn/ui Integration
- Migrated to shadcn/ui component library (Button, Card, Input, Table, Dialog, etc.)
- Professional design tokens with consistent styling
- Improved accessibility and keyboard navigation

#### Multi-Route Editor
- **Custom Collapsible Sidebar** replacing shadcn Sidebar (fixed positioning issue)
  - Collapsed width: 64px (route numbers as circled badges)
  - Expanded width: 240px (full route names)
  - State persistence via localStorage
  - Smooth transition animation (duration-300)
- Sticky header with toggle button + route context
- Route total summary always visible in header

#### BOQ List Table
- 7-column optimized layout
- Route badge with click-to-expand dialog
- "ก่อน VAT" column using snapshotted `total_with_factor_f`
- Icon action buttons (View, Edit, Print, Delete)

### 🔧 Technical Improvements

#### Factor F Snapshotting
- Factor values (factor_f, total_with_factor_f, total_with_vat) now saved at BOQ creation
- Historical accuracy preserved even when Factor F rates change

#### Component Architecture
- New `RouteBadge.tsx` component for route count display
- Improved props typing with TypeScript

### 📌 Migration Tags
- `v1.2.1-shadcn-phase1` → Phase 1 complete
- `v1.2.1-shadcn-phase2` → Phase 2 complete
- `v1.2.1-shadcn-done` → All migration complete
- `v1.3.0` → Factor F snapshotting
- `v1.4.0` → Custom collapsible sidebar + final polish

---

## [2026-01-22] Documentation Reorganization

### Added
- Created 01-08 numbered canonical folder structure
- Created `CANONICAL_ORDER.md` with mapping table
- Created `CHANGELOG.md` (this file)

### Structure Created
```
/docs
├── 01_overview/
├── 02_architecture/
│   └── ADR/
├── 03_domain/
├── 04_data/
├── 05_calculation/
├── 06_engineering/
├── 07_process/
├── 08_ai/
│   └── PROMPTS/
└── legacy/
```

### Migration Status
- Previous `/docs/canonical/` files being migrated to numbered structure
- Legacy files preserved in `/docs/legacy/`
- All original files retained for traceability

---

## [2026-01-22] Owner Decisions Applied

### Decisions
- **A1:** Version consistency — all docs updated to Next.js 16
- **B1:** Legacy BOQ access — documented as admin-only (RLS enforced)
- **C1:** "rejected" status — deferred to Phase 3
- **D1:** Procurement scope — clarified as approved-only

### Files Updated
- `README.md`, `docs/PRD.md` — version numbers
- `docs/SECURITY.md` — legacy access note
- `docs/ai/PROJECT_CONTEXT.md` — rejected status moved
- `docs/KNOWLEDGE_BASE.md` — procurement clarification
