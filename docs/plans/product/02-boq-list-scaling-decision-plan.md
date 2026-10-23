# BOQ / Project List Scaling Decision Plan

**Decision ID:** `LIST-1`

**Status:** LIST-1B L1 RELEASED/CLOSED; L1.1/L2 REMAIN DEFERRED AND UNAPPROVED

**Recorded completion — 2026-10-23:** after the separately approved local
implementation/tests and Solo release, exact L1 commit
`b1ce4495e4f1ec7c675b1341c2121d7b3e0b589f` passed CI and was observed
Vercel Production Ready/Current. The bounded no-write smoke passed list
navigation/search/sort, multi-route dialog, saved Print and return. Use the
[L1 Production result](../../06_engineering/LIST_1B_L1_PRODUCTION_RELEASE_RESULT_20261023.md)
for exact scope, source/target, residuals and NOT RUN limits; it is a dated
receipt, not a new live guarantee. [Local result](../../06_engineering/LIST_1B_L1_LOCAL_RESULT_20261023.md)
retains the real Docker/API/browser evidence and cleanup. Section 13 now records
the completed L1 choices. Earlier review/implementation proposals preserve their
stages; neither their old TBD labels nor this closeout authorizes another
implementation, DB/Production, stage/commit/push/deploy or migration operation.
Migrations 027–031 remain immutable/no-replay; all L1 release authority is consumed.
The next proposed work is S0/user minimum with parallel IT/SSO discovery under
[Roadmap #09](./09-integrated-roadmap-and-it-decision-handoff.md), not automatic
L1.1/L2 or the three deferred market additions.

**Prepared:** 2026-08-31; scope refinement 2026-09-05; adjacent-work status
aligned 2026-10-12; adjacent planning pointer added 2026-10-14;
Owner review brief and official product comparison refined 2026-10-23 (Asia/Bangkok)

**Scope:** The `/boq` register that users commonly call the project list,
especially the active Admin view that can see every BOQ allowed by RLS

**Related plan:**
[Conduit BOQ Product Evolution Decision Plan](./01-conduit-boq-product-evolution-decision-plan.md)

**Adjacent completed work:** `DUP-1` Atomic BOQ Duplicate was released and
verified in Production on 2026-08-31 under
[Result #04](./04-atomic-boq-duplicate-production-release-result.md). Its
authority is consumed. LIST-1B L1 was a separate release; its completion is recorded above.

**Recorded pre-L1 adjacent evidence:** the BOQ Save NULL authorization guard is
`PRODUCTION PASS` through immutable migration 030. Quantity Input Safety is
also `PRODUCTION PASS`: runtime/tests `b18e69a` reached exact `main` source
`4d285f8` and passed Q-B no-write verification. See [Quantity Plan
#06](./06-r0a-quantity-input-safety-release-plan.md) and [Production Result
#08](./08-r0a-quantity-input-safety-production-release-result.md). Its
Production smoke confirmed one bounded multi-route mismatch: `UI Test #5`
showed one route in the list while its editor/database had two. A genuine
one-route BOQ showing one is correct. Code inspection and logs separately
confirm the per-row query design, missing explicit error state, dual responsive
mounts, and high request amplification; they do not prove which condition
triggered that badge observation. That original exact trigger/prevalence
remains unknown. L1 removes the per-row loading/error-state design under its
own approval; its passing smoke does not retroactively establish that cause.
Quantity authority itself never authorized LIST-1; the later L1 choices and
consumed release authority are recorded above and in §13.

**Remaining planning scope — 2026-10-23:**
[Integrated Roadmap and IT Decision Handoff #09](./09-integrated-roadmap-and-it-decision-handoff.md)
controls S0/user minimum → wider R0/D0 → W-H → R1/R2 and parallel IT/SSO
discovery after completed A/B/031/L1. Internal-all hosting remains an Owner
assumption, not IT-approved policy. Optional L1.1/L2 need separate value/scope
approval and do not become prerequisites for S0.

**Research basis:**
[BOQ Register Pagination Best-Practice Research](./03-boq-list-pagination-best-practice-research.md)

## 0. Owner review brief — 2026-10-23

**สถานะของส่วน 0: REVIEW-STAGE CHRONOLOGY ก่อนอนุมัติ L1**

ข้อเสนอ/คำว่า TBD และแผนทดสอบในส่วน 0–12 เก็บไว้ตามขั้น review เดิม
สถานะปัจจุบันให้ยึด completion ด้านบนและ decision sheet §13; ไม่ใช่งานที่ยัง
ต้องเริ่มหรือสิทธิ์รัน tests/Production ซ้ำ ผลจริงมีขอบเขตตาม release receipts

Dependency A และ stale Copy B ปิดแล้วตาม
[B final closeout](../../06_engineering/STALE_COPY_B_RELEASE_CLOSEOUT_20261023.md)
Production HTTP ของ B คง NOT RUN ตาม Owner decision ไม่เป็น prerequisite
probe ค้างก่อน LIST-1B การตัดสินใจนี้ไม่ยกเว้นการทดสอบของ LIST-1B
รอบ review นี้อ่านโค้ด/เอกสารในเครื่องและแหล่งสาธารณะทางการ ไม่มี Docker/Production operation
ดู [ผลเทียบ Procore / Autodesk / Trimble / RIB และข้อจำกัดหลักฐาน](./03-boq-list-pagination-best-practice-research.md#0-fresh-official-product-review--2026-10-23)
ข้อเสนอด้านล่างแทน recommendation ก่อนหน้าเฉพาะ LIST L1 ไม่ใช่ Owner approval

### 0.1 ปัญหาและขอบเขต L1 ที่เสนอให้ยืนยันเป็นชุดเดียว

หลักฐาน mismatch ที่ยืนยันยังมีเพียง `UI Test #5`: list 1 แต่ editor/DB 2
ไม่สรุป prevalence/exact trigger และ BOQ ที่มีหนึ่ง route แสดง 1 เป็นปกติ
โค้ดที่ตรวจในรอบก่อน L1 โหลด BOQ ทั้งชุด, search ใน browser, ใช้ array length เป็น total
และให้ badge ที่ mount ใน desktop/mobile ยิง route query แยกต่อแถว

| เรื่อง | ข้อเสนอ ณ รอบ review ก่อนอนุมัติ L1 |
|---|---|
| Pagination | เลขหน้า fixed 25 BOQs; แบ่งที่ PostgreSQL/PostgREST ภายใต้ session/RLS ผู้ใช้ |
| Result/count | search/filter/sort ทั้งผลที่มีสิทธิ์ก่อน range; exact visible count และ row predicate เดียวกัน |
| Search | project name, BOQ number, estimator และ legacy `boq.route`; canonical child-route search ยังไม่รวม; `%`/`_`/`*` เสนอเป็นตัวอักษรปกติ ไม่ใช่ wildcard syntax |
| Filters | L1 คงขอบเขตทั้งหมดที่มีสิทธิ์ตาม RLS เดิม; พัก controls ใหม่ ของฉัน/สถานะ/หน่วยงานไว้ L2 ไม่สร้าง ownership หรือ workflow semantics เพื่อทำ pagination |
| Default order | คงแนวเดิม “สร้างล่าสุด”: `created_at DESC NULLS LAST, id DESC`; เพิ่ม unique tie-breaker ไม่เปลี่ยน timestamp contract; last-edited sort รอ audit แยกใน L2 |
| Other sorts | document date ใหม่ก่อน และ project name A–Z ตาม DB collation พร้อม null/tie rule ใน §6; amount sort รอ field/label ชัด เพราะ mobile ใช้ `total_cost` แต่ desktop ใช้ `total_with_factor_f` ไม่เปลี่ยนสูตรหรือราคาใน LIST |
| Routes | เริ่มจาก page/count 1 request + route batch 1 ครั้งสำหรับ page IDs; embed เป็นทางเลือกเมื่อพิสูจน์ความครบ/ขอบเขตได้ badge รับข้อมูลจาก parent ไม่มี query ต่อแถว/ต่อคลิก |
| Page state | page/filter/sort ที่ไม่อ่อนไหวใน URL; free-text `q` + page เก็บเป็นหน่วยเดียวใน session แยกตามผู้ใช้และล้างเมื่อ logout; Data API URL/logging ยังอาจมีคำค้น ต้องเลือกนโยบายนี้อย่างรู้ข้อจำกัด |
| Copy | รักษา RPC/031, request UUID, source token และ recovery เดิม; trusted eligibility projection รอ L1.1; current prices ใช้ Create New |
| Scope limit | ใช้ components/packages เดิม; L2 filters และ L1.1 รอก่อน; ไม่รวม S0/SSO, D0, workflow/W-H, Expression หรือข้อเสนอ market-research ที่ Owner พักไว้ |

ตารางนี้เป็น recommendation bundle เพื่อให้ review ง่าย ไม่เปลี่ยน Owner choice
ใน §13 จาก TBD เป็น approved การเลือกทิศทางไม่อนุมัติ local implementation,
DB test/setup, migration, Production หรือ publication โดยอัตโนมัติ

### 0.2 RouteBadge ต้องแยกข้อมูลว่าง ข้อมูลเดิม และโหลดผิดพลาด

- สำเร็จและมี child rows: จำนวน/ชื่อจาก `boq_routes` เท่านั้น ชื่อที่มี comma
  เป็นหนึ่งชื่อ ไม่ split comma หรือสร้าง count จากข้อความ
- สำเร็จและไม่มี child rows: จึงพิจารณา legacy fallback เป็นข้อความเดิมหนึ่งค่า
  พร้อมระบุว่าเป็นข้อมูลเดิม; ถ้าไม่มี legacy text ให้แสดงสถานะไม่มีเส้นทาง
- route-only query error หรือ partial result: badge ของหน้านั้นแสดงโหลดไม่สำเร็จ
  และ retry batch เดียว ไม่แสดงเป็น 0, 1 หรือ fallback เสมือนโหลดสำเร็จ
  BOQ rows/count ที่สำเร็จยังใช้ได้พร้อม actions ที่ไม่ขึ้นต่อ routes; ถ้าเป็น
  auth/session/permission failure ให้ invalidate ทั้งหน้า ไม่คงข้อมูลข้ามผู้ใช้
- **25 BOQs ไม่ได้แปลว่า routes จะไม่เกิน API cap** batch ต้องตรวจความครบ
  เช่น exact count เทียบ returned rows ด้วย semantics ที่ทดสอบจริง; field ขั้นต่ำ
  ได้แก่ `id, boq_id, route_order, route_name` สำหรับ map/order ที่คงที่
  count นี้นับเฉพาะ routes ที่ RLS อนุญาต ต้องทดสอบ parent/child visibility
  ตาม persona ไม่ใช้ service-role count; ห้ามคัดลอก full-row fetch จาก editor
  หรือเพิ่ม per-row pagination เอง
- ถ้าหนึ่ง batch โหลดครบไม่ได้ในกรณีที่ต้องรองรับ ให้หยุดทบทวน query design
  ก่อนเสนอ release ไม่เพิ่ม RPC/index หรือเปลี่ยน cap โดยไม่มีหลักฐาน/อำนาจใหม่

### 0.3 แผน local implementation/test ภายหลังอนุมัติ

1. ตรวจ existing Docker และ relevant BOQ/route/RLS/API contracts เทียบหลักฐาน
   post-031 ที่มีแล้ว ไม่เริ่ม reset/restore หรือ replay 027–031 อัตโนมัติ
2. ทำ query/state adapter ร่วมใน `lib/boq/`, ปรับ `app/boq/page.tsx` และ
   `components/boq/RouteBadge.tsx`; เพิ่มเฉพาะ tests ที่พิสูจน์พฤติกรรมเหล่านี้
   exact file allowlist ให้ทบทวนก่อน implementation; ไม่เปลี่ยน package/lock
3. ใช้ query identity ร่วมสำหรับ rows/count/routes รวม actor/auth generation;
   เก็บ selected columns ให้ครบ Copy/Factor candidate checks และ `updated_at`
   ไม่ใช้ `*`; debounce search ประมาณ 300 ms และ ignore reply เก่าถึงแม้ cancel แล้ว
   ระหว่าง transition ทำ row actions ใช้งานไม่ได้ทั้ง keyboard/pointer
   rows/count commit เป็นชุดของ main query; routes มี loading/error ของชุดนั้นเอง
   การจัด state พร้อมกันใน UI ไม่ใช่ shared DB snapshot ระหว่างสอง requests
4. ทดสอบด้วย synthetic fixtures บน Docker เดิมตาม scope ที่อนุมัติในอนาคต:

| Gate | ผลที่ต้องพิสูจน์ |
|---|---|
| Completeness | >1,000 BOQs; พบ match ที่อยู่นอก API cap เดิม; search/filter/count ใช้ทั้งผลก่อน range |
| RLS | Admin/owner/assignee/staff/managers/procurement/pending/inactive/out-of-scope ได้ rows/count ตรงสิทธิ์ โดยไม่แก้ policy ใน pagination |
| Order/state | tie/null timestamps, fixed-dataset page traversal ไม่ซ้ำ/ขาด; เปลี่ยนตัวกรองกลับหน้า 1; Back/Forward/return และ session-only search ถูกต้อง |
| Races/recovery | delayed replies, logout/account change, HTTP416/PGRST103, page URL ผิด, ลบรายการสุดท้ายของหน้า; main error แยกจาก empty, route-only error ไม่ลบ good rows, auth failure ล้างทั้งหน้า |
| Route correctness | 0/1/2+ routes, comma names, legacy-only, query error และ partial/capped results; error ไม่กลายเป็น badge 1 |
| Network | happy path BOQ page/count 1 + route batch ไม่เกิน 1; จำนวนไม่โตตามจำนวน BOQ หรือ desktop/mobile mount; นับ Auth/profile work แยก |
| Regression | Create/Open/Edit/Print/allowed Delete, preserve และ selected-Factor Copy ตามเดิม, retry UUID/source-token และ stale/reload recovery รองรับ 031 |
| UI/quality | 390/768/1024/1440 px, zoom/keyboard/focus/loading; lint/tests/TypeScript/build และ relevant local Node 24 checks |

5. วัด local p50/p95 และ payload bytes ของ page 1/deep common page ระบุ
   fixture size/persona/environment พร้อม exact-count cost แล้วกำหนด latency
   budget ก่อนเสนอ release ไม่เพิ่ม index หรือรับประกันตัวเลขก่อนวัด
6. รายงาน exact source/target/PASS/FAIL/NOT RUN ให้ Owner ตรวจ ก่อนอนุมัติ
   commit/push/deploy แยก ไม่มี Production probe เป็นข้อบังคับใหม่ของ plan นี้

ความยากระดับกลาง จุดเสี่ยงหลักคือ missing results/count leak, stale response
หรือ Copy intent, route truncation และ offset page เปลี่ยนเมื่อมีข้อมูลใหม่
เลขหน้าไม่ได้รับประกัน snapshot เดิมระหว่าง concurrent edits ความสำเร็จของ
L1 วัดจากความครบ/สิทธิ์/จำนวน request และ regression ที่พิสูจน์จริง ส่วนเวลา
5–8 engineer-days ใน §11 เป็น estimate เดิม ไม่ใช่ commitment ของรอบนี้

### 0.4 ความเสี่ยงและเกณฑ์ตัดสินใจที่เหมาะกับ Solo

ตารางนี้ประเมินความเสี่ยงของการเปลี่ยนแปลงที่เสนอ ไม่ใช่รายงานว่าเหตุเหล่านี้เกิดแล้ว

| ความเสี่ยง | วิธีป้องกัน / ถ้าไม่ผ่าน |
|---|---|
| ค้นหาไม่ครบหรือ count เผยข้อมูลนอกสิทธิ์ — สูง | query ทั้งผลก่อน range ด้วย session ผู้ใช้เดียวกัน; fixtures >1,000 และ persona tests; ไม่ใช้ service role มาชดเชย count |
| badge กลับเป็น 1 เมื่อโหลด routes ผิด — สูง | explicit loading/error/legacy/empty; exact visible route count ต้องเท่าจำนวน rows ที่คืน; partial ถือ FAIL ไม่ fallback |
| reply เก่าหรือข้อมูลคนละบัญชีทำให้ Copy ผิด — สูง | query + actor generation, ล้าง state ตอน logout, stable BOQ IDs, lock stale actions และรักษา source token/request UUID/031 |
| เพิ่ม “ของฉัน/อนุมัติ” แล้วเปลี่ยนความหมายธุรกิจ — กลาง–สูง | ไม่เพิ่ม controls เหล่านี้ใน L1; S0/W-H และ L2 ตัดสิน semantics แยก |
| offset เลื่อนหน้าเมื่อมีคนสร้าง/ลบ — กลาง | คง created order, refresh หลังกลับ editor/การลบ, อธิบายว่าเป็น live register; พิจารณา cursor เมื่อวัดปัญหาจริง ไม่สัญญา snapshot |
| count ช้าหรือ batch เกิน cap — กลาง | วัด count แยกและตรวจ completeness; HOLD หากข้อมูลที่ต้องรองรับไม่ครบ ไม่เพิ่ม cap/RPC/index แบบแฝง |
| คำค้นติด URL/logs — ตามข้อมูลที่ค้น | session-only q ลดการติด browser URL แต่ Data API logs ยังอาจมี; ถ้า IT ห้าม ต้องแยก transport decision ก่อน release |
| dependency/ขอบเขตโตจนดูแลยาก — กลาง | ใช้ components เดิม ไม่เพิ่ม grid package, bulk actions, saved views, schema หรือ account workflow ใน L1 |

**ทำให้สำเร็จ:** จบ L0 ด้วย decision bundle ใน §13 → หลังอนุมัติจึงทำ L1
และทดสอบ Docker เดิม → สรุป source/target/results/limits → ขออนุมัติ release
แยกตาม working agreement ไม่เพิ่ม PR/stack/backup ที่ไม่มีเหตุผล
ไม่รวม optional L1.1/L2 หรือข้อเสนอที่ Owner พักไว้เป็นเงื่อนไขบังคับของ L1

## 1. Authority and decision requested

This document records a product and technical recommendation only. It does not
authorize code edits, a schema/index/RPC change, migration, Preview or
Production deployment, commit, push, data mutation, catalog operation, Factor F
change, or historical BOQ cleanup.

This LIST-1 document does not grant authority for pagination implementation.
The separate DUP-1 instruction was executed and consumed for its exact forward
migration, application release, and bounded Production verification: normal
Atomic Preserve Copy plus a separate Selected-Factor Copy for eligible legacy
BOQs, both preserving the source Catalog/items/prices. Its result does not
authorize LIST-1 or broaden DUP-1 into Catalog/Factor publication, repricing,
or source-BOQ mutation.

The Owner decision requested is:

> Should the BOQ register move to server-side numbered pagination with
> server-side search/filter/sort and bounded route loading?

The Owner must also decide whether the optional trusted batched Copy-eligibility
projection belongs in first release `L1` or a separately authorized `L1.1`.
The lower-blast-radius recommendation is `L1.1`: preserve current candidate UI
behavior in L1 and keep the existing trusted Copy RPC as final authority.

**Research-backed recommendation:** yes. Choose `LIST-1B` below with an
initial fixed first-release page size of 25. Server-side whole-result
operations, deterministic ordering, RLS-consistent count, and bounded related
data are correctness requirements. Numbered navigation and 25 rows are the
selected Conduit v1 product design, not universal rules. Do not implement
client-only pagination or infinite scroll for this Admin/register context.

## 2. Important domain clarification

The current screen is a **BOQ register**, not a true distinct-project table.
Each row is one `boq` record containing free-text `project_name`; two BOQs can
refer to the same project name. This plan paginates BOQs. Grouping multiple BOQs
under a first-class Project entity is a separate long-term data/workflow
decision and is not required to solve the current list problem.

## 3. Verified current behavior

**Evidence phase:** this section describes the pre-L1 source/research snapshot,
not the released `b1ce4495…` adapter. Its old line anchors identify historical
code positions; use the L1 result and current source for implemented behavior.

The code and dated evidence show that list scale is already a real problem, not
only a future optimization:

- The page still loads every RLS-visible row using `select('*')` plus Catalog
  and Factor-version labels, with no `limit()` or `range()`, in
  [app/boq/page.tsx](../../../app/boq/page.tsx#L118-L140).
- Search runs only over the rows already loaded into browser memory in
  [app/boq/page.tsx](../../../app/boq/page.tsx#L142-L147).
- Ordering uses only `created_at DESC`; equal timestamps have no deterministic
  tie-breaker in
  [app/boq/page.tsx](../../../app/boq/page.tsx#L122-L129).
- The header calls `boqList.length` “ทั้งหมด”, although it is only the number of
  rows returned by the API, in
  [app/boq/page.tsx](../../../app/boq/page.tsx#L254-L256).
- Mobile cards and the desktop table are both mounted and mapped even though
  CSS hides one presentation at a time, in
  [app/boq/page.tsx](../../../app/boq/page.tsx#L289-L299) and
  [app/boq/page.tsx](../../../app/boq/page.tsx#L377-L400).
- Every mounted `RouteBadge` immediately issues its own `boq_routes` request in
  [RouteBadge.tsx](../../../components/boq/RouteBadge.tsx#L30-L42). The two
  responsive render trees therefore produce approximately `2N` route requests
  plus the main list request.
- The dated 2026-08-31 read-only evidence observed `263` BOQs and `326` routes.
  At that size, the current Admin page can initiate approximately `527`
  list/route requests before authentication-related work. See the
  [aggregate evidence](./evidence/2026-08-30-quantity-entry/03-production-readonly-aggregate-evidence.md).
- The repository's local Data API cap is `1,000` rows in
  [supabase/config.toml](../../../supabase/config.toml#L16-L18). The current
  cloud value still requires a fresh read-only preflight, but Supabase also
  documents a default maximum of 1,000 returned rows and recommends range
  queries for pagination.
- Admin visibility is intentionally broad: the current RLS policy permits an
  active Admin to select all BOQs, while other roles are scope-limited. This is
  why Admin experiences the scaling problem first. RLS remains the authority;
  UI filters must not replace it.
- Whole-BOQ Copy is live through the atomic trusted DUP-1 operation. Normal Copy
  and the separate selected-Factor legacy action must remain correct across
  pagination/search transitions; LIST-1 must not reintroduce the former
  multi-request browser copy or duplicate the RPC eligibility predicate.

The current `/price-list` page has page controls, but it first loads all rows
and then slices the array in memory. Its controls may inform visual style, but
its data-loading design must not be copied for this register.

## 4. Options

| Option | Model | Advantages | Disadvantages / risks | Decision |
|---|---|---|---|---|
| `LIST-1A` | Client-side pagination after loading all BOQs | Smallest UI edit; can reuse the price-list pattern | Still downloads all rows; search/count still fails at the row cap; N+1 remains; no long-term scale benefit | Reject |
| `LIST-1B` | Server-side numbered pages using filtered count + bounded range | Familiar for Admin review; supports page numbers, total, Back/Forward, bookmarks, and returning to a known place | Offset pages can shift if new BOQs are inserted while browsing; requires correct server search/count/URL state | **Recommend now** |
| `LIST-1C` | Cursor/keyset with Previous/Next or Load more | Stable and efficient for very large or rapidly changing datasets; avoids deep offset cost | Cannot jump naturally to page N; total/progress and return-to-position are harder; more state/edge cases | Reconsider only after measured need |
| `LIST-1D` | Infinite scroll | Continuous browsing and valid for some feed/simple-list products | Poor fit for this Admin register's keyboard navigation, random access, counts, comparison, footer access, and position restoration | Reject for this context |

At the dated 2026-08-31 observation of `263` rows, 25-row numbered server pages produce about 11 pages
and give the best balance. If measured deep-page p95 latency, query plans,
mutation churn, or a much larger authorized result makes offset navigation
materially worse, keyset pagination can replace the transport without changing
the list's search/filter contract. Row count alone is not the upgrade trigger.

## 5. Proposed first-release UX contract

### Desktop

- Initial fixed `25` BOQs per page; this reduces first-release state and is a
  measured product hypothesis, not a permanent best-practice constant. Do not
  add a page-size selector until usage proves a need.
- Show `รายการ 1–25 จาก 263` using the RLS-filtered server count.
- Use Previous, compact page numbers, ellipses, and Next. Include first/last
  pages when space permits; hide pagination when there is only one page. Page 1
  has no usable Previous action and the final page has no usable Next action;
  absent/disabled controls follow the chosen component's accessible semantics.
- Keep project name as the primary label and the current document date and
  estimator identification; show BOQ number when present. Default order is
  labeled “สร้างล่าสุด”. No new last-edited label or account-directory query
  is required in L1; the free-text estimator is not an account owner.
- Keep one primary row action such as Open/Edit; permission-dependent secondary
  actions must reflect `can()` and RLS rather than failing only after a click.
- Normal Copy is a current secondary row action when the actor/source pass the
  UI's candidate-level checks. Its label/help states that Catalog, prices, and
  Factor F are preserved. The trusted RPC remains the final eligibility
  authority and may fail the action closed; a future LIST-1 projection may make
  that decision available to the list without weakening the RPC check. Do not
  label it as current-price copy.

### Mobile

- Use `ก่อนหน้า · หน้า X/Y · ถัดไป`; do not render a long page-number strip.
- Keep the compact card view, one primary Open action, and move secondary
  actions into an accessible overflow menu where appropriate.
- Use the same DUP-1 eligibility and wording on mobile. Do not expose a disabled
  control whose reason is unavailable to keyboard or assistive-technology users.
- Use a Conduit touch-target goal of at least 44 × 44 CSS px and do not hide the
  result count or active filters; this is a product goal, not a claim that WCAG
  AA universally requires 44 × 44.

### Shared list behavior

- Keep non-sensitive structured list state in the URL, conceptually:
  `?page=2&sort=created_desc`. Scope/status controls are deferred to L2; RLS
  still defines the complete authorized set in L1.
- Free-text `q` needs an explicit confidentiality decision before it is placed
  in the URL. Project/customer terms in URLs may persist in browser history,
  logs, analytics, screenshots, copied links, and referrers. The safer default
  for the application URL is same-session state; URL-backed `q` is acceptable
  only after the Owner accepts the data-classification and logging behavior.
  This does not remove the term from a direct PostgREST Data API request URL;
  its service/network logging policy must also be reviewed.
- Back/Forward and return from an Edit page restore the permitted state when it
  still exists. A bookmark restores structured URL state only. Under the safer
  session-only search policy, `q` and its associated page remain one
  same-session state unit; if that session state is absent, clear `q` and reset
  to page 1 under the remaining structured filters rather than applying a stale
  page number to a different result set.
- Changing search, any supported filter, or sort resets to page 1. Search
  remains as-you-type with approximately 300 ms debounce; distinguish draft
  input from the applied query, show updating state, and clear the debounce on
  unmount/logout. L1 does not introduce Mine/status controls.
- Return from the editor revalidates the current page/count and route batch
  once. Provide ordinary Refresh/retry, without polling or realtime. A later
  page fetch can see concurrent writes; this is a live register, not a frozen
  multi-page audit snapshot.
- An invalid or out-of-range page supplied by URL redirects to page 1.
- Validate the entire `page` value as a finite positive safe integer and bound
  the derived offset before querying; do not accept partial `parseInt` values
  or overflow. If a stale valid page returns `PGRST103` / HTTP 416, refetch
  page 1 once under the same actor/query and canonicalize the URL; repeated
  failure shows error/retry, never a recovery loop. This is an allowed extra
  request beyond the happy path. A zero-result set shows an honest empty state
  without `หน้า 1/0` or an invented 1–25 range.
- Deleting the final row on a page refetches count and moves to the last
  remaining page, normally the immediately preceding page, instead of showing
  a false empty state.
- Show a structural skeleton on initial load. During page/filter transitions,
  old rows may remain beneath a visible busy overlay to avoid layout collapse,
  with `aria-busy="true"`, but their row actions must be inert while stale.
  Inert means neither pointer nor keyboard activation is possible; ARIA alone
  is not an interaction lock. Before making a subtree inert, move focus to the
  initiating control or loading/status element. On main-query failure, replace
  the active result area with error/retry for the attempted controls, or restore
  controls and results together to the last committed query. Never show new
  controls with old rows/count as though they were current. Route-only failure
  leaves successful main rows/count usable with unavailable badges and one
  page-batch retry. Auth/session/permission failure invalidates the whole page.
- Distinguish “ยังไม่มี BOQ” from “ไม่พบตามตัวกรอง” and offer “ล้างตัวกรอง”.
- On query-intent change, close/invalidate any unsubmitted Copy dialog so it
  cannot submit against a newly displayed page. An already submitted Copy
  retains its captured BOQ ID/source token/request UUID and pending/recovery
  state until it settles; cancellation does not prove a server mutation was
  cancelled. Keep existing idempotent retry semantics, without automatic
  resubmission or generating a second UUID because list state changed. Bind
  completion/recovery/navigation to the captured actor/auth generation too; a
  previous session must not navigate or reveal its result to a new actor.
- Selected-Factor Copy is a separate, explicit action for a candidate unbound,
  Catalog-bound legacy BOQ. DUP-1 performs its final eligibility check inside
  the trusted copy RPC and sends permanent failures to Create New. An optional
  `L1.1` may add one trusted batched eligibility projection for the bounded page
  so ineligible actions can be hidden without duplicating the predicate in the
  browser or adding one Factor/version query per row. L1 must preserve the
  current fail-closed RPC behavior even when the projection is deferred. The
  selected-Factor path
  preserves the old Catalog/items/prices, clears old Factor-derived snapshots/
  totals, and blocks official output until trusted save. Current Catalog prices
  always require Create New; LIST-1 does not introduce Requote/Reprice/Rebase.

## 6. Search, filter, and sort contract

Pagination must be applied **after** RLS, search, filters, and ordering. Applying
pagination first and then filtering the current 25 rows is a release-blocking
missing-results bug.

### `L1` initial controls

- Search: project name, BOQ number, estimator, and the current legacy route
  field. Canonical child-route search needs a separately designed RLS-safe
  query; do not falsely claim it until tested.
- Scope: all BOQs authorized by the existing RLS, as today. New Mine/status
  controls are deferred to L2; do not define ownership or approval workflow to
  deliver pagination. Whole-result filtering remains the technical contract
  for any supported predicate.
- Recommended default: “สร้างล่าสุด”, `created_at DESC NULLS LAST, id DESC`.
  This retains the current primary order and adds a unique tie-breaker. Audit
  the relevant existing column/order contracts locally without changing their
  write semantics. Keep `updated_at` selected for the existing Copy source token.
- Other sorts: `document_date DESC NULLS LAST, id DESC` and
  `project_name ASC NULLS LAST, id ASC` using the database collation; verify
  Thai/Latin names locally and do not promise natural Thai dictionary ordering
  without evidence. No client sort of the fetched 25 rows.
- Defer amount sort until its field/label is selected; mobile and desktop
  currently display different amount fields. No accounting change is implied.
- Last-edited sorting belongs to L2 only after supported-write/null semantics
  are audited; do not add a timestamp trigger or label an unproven timestamp
  “แก้ไขล่าสุด” as part of LIST.

Search should debounce approximately 300 ms, cancel where supported and always
ignore stale requests using query identity plus actor/auth generation. Never
interpolate raw `q` into PostgREST `.or()` grammar: URL encoding alone does not escape that
grammar. Define whether LIKE wildcards are literal or supported syntax and test
commas, periods, parentheses, quotes, backslashes, `%`, `_`, and `*`. A slow
response for an old query must not overwrite a newer result.

### `L2` Admin findability controls

Add only after the base list is stable:

- Mine/status filters after their ownership/status meaning is approved;
- department and sector;
- creator/account owner;
- audited last-edited sort and date range; and
- active filter chips plus Clear all.

A possible Mine predicate is creator OR assignee, but it is not selected or
implemented in L1. No status control grants approval/issue authority; W-H is
separate. Basic search clear, return-to-list state and accessibility are L1
requirements, not optional L2 polish.

Do not expose emails merely to populate an owner filter. Any profile directory
query must have its own authorized projection and RLS/permission review.

### `L3` evidence-driven enhancements

Saved/named views, shared views, configurable columns, bulk actions, and a
first-class Project grouping model come later only if repeated use proves their
value. URL presets cover most early “saved view” needs without adding a table.

## 7. Data-query contract

“Server-side pagination” here means that Postgres/PostgREST returns only the
requested authorized slice; it does not require a privileged Next.js server or
an RLS-bypassing RPC.

The query design must:

1. call `requireActiveProfile` as today and query with the end-user session;
2. centralize page, page size, search, filters, sort, count mode, and request
   identity in one canonical query adapter;
3. select only list fields, never `*`;
4. apply the same server search/filter set to the rows and exact count;
5. apply the selected deterministic order; default `created_at` + `id`;
6. use a bounded range for 25 rows;
7. default to one RLS-protected route batch for the current 25 BOQ IDs,
   selecting `id, boq_id, route_order, route_name` with stable parent/order/id
   ordering and exact visible count in that same response. Returned rows must
   equal the non-null exact count; a cap/partial result is an error, not empty.
   Feed badges from the parent result, without per-row/per-click requests.
   Embedding is optional only if local evidence proves equivalent child
   completeness, RLS behavior and suitable payload; preserve parents with no
   routes and nullable Catalog/Factor relationships (no accidental inner join).
   It is not a mandatory spike;
8. return and render only the authorized count; and
9. cancel where supported and reject stale responses using query + actor/auth
   generation and attempt ID, including retries, logout, account change and
   unmount. Clear per-user session state on logout; never reuse another actor's cached result.

The main selected-column allowlist must preserve every field used by list
rendering, current Copy/Factor candidate checks, captured source BOQ and
`updated_at` source-token behavior. Use BOQ IDs, never page/array positions,
for action identity. Do not narrow fields by looking only at visible columns.

Rows/count/normalized controls/page commit as one UI query generation; route
state is keyed to that actor/generation and exact page IDs and may independently
load or fail. Two HTTP requests do **not** share one database snapshot. Ordinary
concurrent changes between them can appear until refresh; do not claim that UI
state consistency proves transactional BOQ/route consistency. No long-running
snapshot, realtime channel, polling or new RPC is proposed for this register.

Target request behavior per list state is bounded: the happy path uses one BOQ
page/count request and one current-page route batch by default (skip when
there are no BOQ IDs). A proven embedded alternative has no separate batch.
Invalid-range recovery may add a request; request count must never grow per BOQ row.

Use an exact RLS-visible count for the proposed first release, subject to the
local performance gate. Measure count latency
separately. If it later exceeds an agreed budget, a reviewed release may use an
estimated count or indeterminate/`hasNextPage` navigation; it must never label a
page-length value as “ทั้งหมด”. An estimated/planned total must not drive
authoritative `หน้า X/Y`, an exact last-page link, or clamping; label it as
approximate or switch to Previous/Next with `hasNextPage`.

MUI, AG Grid, and other enterprise grids are behavioral references only. L1
does not justify a new grid dependency, license surface, or design-system
migration; the existing Conduit components can implement this contract.

Do not introduce a `SECURITY DEFINER` listing/count function to solve query
convenience; it could bypass RLS. If a future view or RPC is genuinely required,
use end-user context, security-invoker semantics where supported, explicit
grants, and persona tests.

## 8. Index and migration position

The first page/search implementation may not need a database migration;
measurement must decide. Existing repository evidence includes indexes for owner,
organization scope, and status; verify the actual `created_at, id` order/index
contract locally before proposing any new index. Current Production row count
is unknown in this review; the 263-row evidence is dated 2026-08-31.

Before proposing an index:

- obtain a fresh read-only schema/index/null preflight;
- measure representative Admin, department, sector, owner, status, and search
  queries with authenticated role-shaped evidence. Use
  `EXPLAIN (ANALYZE, BUFFERS)` only in local/staging; do not run it against
  Production without separate explicit diagnostic authority;
- add only the smallest justified composite order/scope index; and
- measure exact-count and wildcard-search cost separately.

Before L1 release, record a representative local/staging baseline and agree a
numeric latency budget for page 1 and the deepest commonly used page under the
required personas. Record p50/p95, payload bytes, fixture size and environment;
a few best-case samples are not a credible p95. Isolate exact-count cost with paired diagnostics with and
without `count: 'exact'`. A cursor review is triggered by a recorded budget
breach, deep-offset query evidence, or unacceptable mutation churn—not by an
unmeasured row threshold.

An order index or later trigram text-search index has storage and write cost.
Do not add one by assumption from the dated 263-row observation. Any justified index is a newly
approved forward product migration after 031. Never edit, retry, or replay
migrations 027/028/029/030/031.

## 9. RLS and adjacent permission finding

- Pagination, filters, and count must preserve the current row scope for Admin,
  staff, manager, owner/assignee, pending/inactive, and procurement personas.
- A count visible to one persona must never include rows hidden by that
  persona's RLS policy.
- Client-side scope controls are convenience only; they are not authorization.
- The current access banner says Procurement sees approved departmental BOQs,
  while repository policy evidence does not clearly enforce that status filter.
  This is a separate authority/UI wording decision. Do not “fix” it with a
  client filter inside pagination or silently change RLS as part of LIST-1.

## 10. Accessibility and established product pattern

This is a searchable administrative register, not an activity feed. The cited
government case-list and enterprise design systems support explicit
search/filter/sort, navigable pages, result-state visibility, and restorable
non-sensitive state for this context.

- Pagination is a semantic navigation landmark with accessible Previous/Next
  labels and `aria-current="page"`.
- Search-as-you-type retains focus in the field and uses one polite result
  announcement after debounce. Sort retains focus on its control and announces
  the update. An explicitly applied filter may focus the result description or
  use a polite status announcement, but not both. Pagination changes the URL,
  updates the document title with the page number, and moves scroll/focus to the
  result area.
- Compact page links adapt to viewport width and zoom.
- Infinite scroll is excluded. The GOV.UK Design System specifically warns
  that automatic infinite scroll causes problems for keyboard users and shows
  numbered pagination for lists of similar case/search-result items.

References:

- [GOV.UK Pagination](https://design-system.service.gov.uk/components/pagination/)
- [Carbon Design System Pagination](https://www.carbondesignsystem.com/building-blocks/core/components/pagination/guidelines)
- [PatternFly Pagination](https://www.patternfly.org/components/pagination/design-guidelines/)
- [GitHub Primer DataTable guidelines](https://primer.style/product/components/data-table/guidelines/)
- [VA.gov Search Results](https://design.va.gov/templates/search-results)
- [MUI server-side pagination](https://mui.com/x/react-data-grid/pagination/)
- [Supabase JavaScript select/count](https://supabase.com/docs/reference/javascript/select)
- [Supabase range pagination](https://supabase.com/docs/reference/javascript/using-modifiers-range)
- [Full LIST-1 research and source map](./03-boq-list-pagination-best-practice-research.md)

## 11. Staged delivery and effort

These are planning ranges, not implementation approval or commitments.

### `L0` — Decision only (current)

- Record the problem, selected option, UX/query/security contract, tests, and
  authority boundary.
- No code, schema, or external state change.

### `L1` — Bounded BOQ register (approximately 5–8 engineer-days)

- server-side page/count and selected columns;
- deterministic ordering, safe structured URL state, and the selected
  free-text search confidentiality policy;
- initial fixed 25-row desktop/mobile pagination;
- batched route loading and removal of list-level N+1;
- one responsive result/data contract, stale-action protection, and
  loading/error/empty/no-result handling; and
- persona, race, responsive, and network-count tests.

L1 keeps the existing Copy RPC as final eligibility authority and does not add
a privileged eligibility projection unless the Owner explicitly includes that
scope with its database/security gates.

### `L1.1` — Optional trusted Copy-eligibility projection

- one bounded current-page projection that reuses, rather than weakly
  reimplements, the trusted eligibility contract;
- RLS/ACL/persona and direct-call tests proving no source existence or Factor
  detail leaks outside the caller's authorized BOQ scope; and
- a separately approved schema/RPC/migration path only if implementation
  evidence shows a database object is required.

L1.1 and L2 do not automatically displace S0 or the broader #09 release order.
Schedule them only when their value is approved. L1.1 improves row-action
accuracy but is not required for safe pagination: the
existing RPC continues to fail ineligible Copy requests closed and provide the
current recovery path.

### `L2` — Admin findability polish (approximately 3–5 engineer-days)

- approved Mine/status/department/sector/owner/date filters and audited
  last-edited sorting;
- active filter chips for the new controls;
- optional further mobile presentation polish; required L1 keyboard/focus and
  return-to-list behavior must already pass; and
- measured index proposal only if query evidence requires it.

### `L3` — Later, evidence only

- cursor/keyset transport if deep offsets or churn become a measured problem;
- named/saved/shared views;
- configurable columns or bulk action. Any bulk action must distinguish “25 on
  this page” from “all N matching filters”, use stable IDs, and re-authorize at
  action time. “All matching” must explicitly choose a live filter predicate or
  a captured snapshot; destructive actions require confirmation using the
  server-authorized current set/count; and
- true Project grouping/entity if the business distinguishes Project from BOQ.

This original sequencing placed LIST-1 after DUP-1/030/R0A and before DB-1.
L1 has since been released without a schema change. The remaining sequence is
S0/user minimum → wider R0/D0 → W-H → R1/R2 under #09; L1.1/L2 do not
replace it automatically. The wider calculation contract must still close
before expression implementation.

## 12. Test and release gates

Minimum scenarios:

| Area | Required evidence |
|---|---|
| Completeness | More than 1,000 fixtures; search must find a match beyond the former first 1,000 and the displayed count/range must be correct. |
| Ordering | Against a fixed dataset with no concurrent mutation, many BOQs with identical/null timestamps appear exactly once with no duplicate/missing ID across all numbered pages. Concurrent-mutation behavior is tested separately and is not promised to be snapshot-stable. |
| Search/filter | Search and each filter operate on the entire RLS-visible result before range; a filter change resets to page 1. |
| Search grammar | Commas, periods, parentheses, quotes, backslashes, `%`, `_`, and `*` cannot break or broaden a PostgREST `.or()` query; raw `q` is never interpolated, and wildcard semantics match the documented product choice. |
| Races | Rapid search/sort changes, retries, actor/logout changes and late Copy completions cannot let an old response replace the new state, navigate or expose prior-actor results. |
| Transition safety | Main rows/count/page/controls commit as one UI query generation; routes use the same actor/generation/page IDs with explicit loading/error. This is not a DB snapshot across requests. Previous rows are busy and inert to pointer/keyboard; main failure shows error/retry or restores prior controls/results together; route-only failure keeps good rows; auth failure invalidates all. |
| Mutation | Insert/delete during browsing is explained; deleting the final row clamps/refetches safely. |
| Page recovery | Reject malformed/non-safe/negative/overflow pages; one guarded `PGRST103` / HTTP 416 recovery to page 1, then explicit retry on failure, no loop; zero results never show page 1/0; in-app deletion moves to the last remaining page. |
| URL/state | Structured state survives its promised navigation paths. Under session-only search, `q` and its page restore only when the session state exists; otherwise search clears and page resets to 1. Tests separately verify browser page URL/history/bookmarks and the selected PostgREST request/logging policy. |
| Routes | One complete page batch by default, exact visible route count equals returned rows; test >API-cap child rows across 25 BOQs and delayed failure. No false 0/1/legacy fallback on error/partial data. One-route = 1 and comma names remain correct. Request count does not grow per BOQ row/mount/click. |
| Personas | Active Admin, owner, assignee, staff, department/sector manager, procurement, pending/inactive, and out-of-scope users see matching rows and counts. |
| Responsive/a11y | 390, 768, 1024, and 1440 px plus zoom, keyboard, focus, landmark, current-page, boundary Previous/Next, page-number document title, loading, error, empty, and no-result checks. |
| Regression | Open unsubmitted vs in-flight Copy dialogs survive/query-change safely using the explicit captured intent/UUID contract. Create, Open/Edit, Print, allowed Delete, and return-to-list behavior retain intended permissions. Current normal Atomic Preserve Copy is a candidate/advisory action whose final eligibility is decided by the trusted RPC (or surfaced by a future trusted LIST-1 projection); Selected-Factor Copy remains a separate eligible-legacy action, current-price guidance points to Create New, and pagination/search transitions cannot submit a stale/duplicate copy request. |

GO only when:

- row and count scope match RLS for every required persona;
- search covers all authorized pages;
- ordering is deterministic;
- network requests remain bounded per page;
- no error state is rendered as a genuine empty state; and
- no new index/migration is assumed without evidence and separate authority.

STOP if:

- count leaks the existence of out-of-scope BOQs;
- search covers only the current page;
- any per-row route query remains on initial list load;
- rows duplicate/disappear under the approved fixed-dataset ordering fixtures;
- a view/RPC bypasses RLS; or
- implementation requires replaying or changing migrations 027/028/029/030/031.

## 13. Owner decision sheet

Updated after the separate L1 local and Solo publication approvals on
2026-10-23. L1 is released at `b1ce4495…`; its execution/publication authority
is consumed. This current decision record authorizes no further operation.
B/031 remain closed with B Production HTTP **NOT RUN**, not a required new probe.

| Decision | Recommendation | Owner choice |
|---|---|---|
| Pagination model | `LIST-1B` server-side numbered pages | Approved and released L1 |
| Initial page size | Fixed 25 as a measured v1 default; selector later only if needed | Approved 25 |
| Default sort | Preserve newest-created order (`created_at DESC NULLS LAST, id DESC`); keep updated_at only for existing Copy token, defer last-edited sort | Approved |
| Initial filters/search/sorts | All RLS-visible scope; project/BOQ number/estimator/legacy-route search, literal wildcard characters and ~300 ms debounce; created/document-date/project-name sorts; defer new Mine/status controls and amount sort | Approved L1; extras deferred |
| Free-text URL/transport policy | Session-only `q` and related page per actor; clear on logout; structured non-sensitive state in URL | Approved; Owner acknowledged Data API URL/log exposure |
| Count policy | Exact visible count now; reviewed estimated/indeterminate fallback only after measured need | Approved exact count |
| Admin L2 filters | Defer new Mine/status/department/sector/owner/date controls and last-edited sort from L1; no new directory permission or workflow semantics | Deferred; no implementation authority |
| Route behavior | One complete current-page batch with count/partial-result guard; no per-row/per-click query, no fallback on error | Approved; cap overflow shows unavailable |
| Copy eligibility projection | Defer optional trusted projection to L1.1; keep current RPC final authority in L1 | Deferred; preserve 031/token/UUID/recovery |
| First implementation order | A/B/031 closed → L1 released; remaining S0 → wider R0/D0 → W-H → Expression sequence follows #09 | L1 closed; next scope requires new approval |

## 14. Proposed approval wording

**Historical direction-only template:** the separate later approvals and actual
L1 release are recorded above. This template is not a fresh request or authority.

```text
APPROVE LIST-1 PRODUCT DIRECTION — LEVEL A ONLY:
LIST-1B server-side numbered pagination;
initial fixed 25 rows per page as a measured v1 default;
server search/filter/sort/count before range;
preserve newest-created default with unique id tie-breaker;
L1 search + created/document-date/project-name sorts; new Mine/status filters
and last-edited/amount sorts deferred;
URL-restorable non-sensitive structured state;
free-text search follows the separately selected confidentiality policy;
bounded route batch with no per-row initial query;
existing Copy RPC remains final authority; optional trusted eligibility
projection is deferred to separately approved L1.1;
RLS remains authoritative.
This records direction/documentation only. It does not authorize code edits,
commit, push, Preview, schema/index/RPC/migration work, Production deployment,
or any Production write.
```

The completed DUP-1 release did not grant LIST-1 approval; L1 used separate
local and publication authority. Any future LIST extension must preserve the
verified Copy eligibility/actions, avoid per-row Factor queries and retain the
D9 preserve/reset semantics under its own new approval.
