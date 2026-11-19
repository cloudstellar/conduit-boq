# Conduit BOQ — Integrated Roadmap and IT Decision Handoff

**Recorded:** 2026-10-14; release/status alignment 2026-10-23;
NT/UM planning alignment 2026-10-24; UM-B and UM-A2 closeouts 2026-11-14;
documentation review 2026-11-19
(Asia/Bangkok)

**สถานะปัจจุบัน** A/B/031, LIST-1B L1, focused S0/032, UM-A1, UM-B
รอบแรก และ UM-A2 เสร็จตามขอบเขตที่ตรวจรับแล้ว Owner เลือกแบบ 2
สำหรับ BOQ ฉบับใช้งานใน [แผน #13](./13-boq-operational-workflow-plan.md)
รอตรวจรายละเอียดก่อนลงมือ พักงาน Admin กำหนดสังกัด
เมื่อคำขอผิดจนกว่าจะมีกรณีที่กระทบงานจริง

**UM-B รอบแรก — 2026-11-14** Production 033 และแอป `e497ffa` ผ่านการตรวจ
ตามขอบเขต release Owner ยืนยันจากหน้า Admin ว่าบัญชีจริงรายแรกแสดงสังกัดจริง
ถูกต้อง สถานะยังใช้งาน และมีประวัติใหม่หนึ่งรายการ การเห็น BOQ จากมุมผู้ใช้หลัง
ยืนยันบน Production ยังเป็น **NOT RUN** [บันทึกปิดรอบแรก #12](./12-user-management-um-a-and-um-b-plan.md#2020-first-round-production-closeout)

**Later priority refinement — 2026-11-02:** Owner confirmed having approved the
selected account's affiliation request and requested planning continuation.
A separately approved, completed one-account Production read found active staff,
all actual affiliation IDs NULL, a valid requested hierarchy, and no approval
fields/events in the sources inspected. Keep the Owner report and database
observation separate; the historical cause remains unknown. No personal
identifier/raw response belongs here. That read grant is consumed.
At that checkpoint, the [UM-B legacy-confirmation plan](./12-user-management-um-a-and-um-b-plan.md#15-um-b-priority-legacy-affiliation-confirmation-plan)
was prioritized after S0/A1, ahead of A2 and broader UM-B. The work at that
checkpoint covered local Markdown/source/document checks. SQL, DB/Auth/fixture
operations, additional Production reads and publication were outside that scope.

**Recorded completion — 2026-10-23:** dependency A `a3114fc` → B client
`42e01c5` → Production 031 ledger
`20261023063934/boq_duplicate_stale_conflict_guard` → B closeout → LIST-1B L1
`b1ce4495e4f1ec7c675b1341c2121d7b3e0b589f` are complete under their separate
approvals. B Production HTTP remains **NOT RUN** by Owner choice, not a pending
required probe. L1's CI/deployment and bounded no-write Production smoke passed;
this is not full business-write acceptance or a fresh check in this docs task.
Use the durable receipts in §2 for exact source/target/limits and
[Plan #02 §13](./02-boq-list-scaling-decision-plan.md#13-owner-decision-sheet)
for completed L1 choices. All release authority is consumed; 027–031 remain
immutable/no-replay.

The [dated official-product research #03 §0](./03-boq-list-pagination-best-practice-research.md#0-fresh-official-product-review--2026-10-23)
supported Conduit's selected L1: fixed 25, authorized whole-result search/sort/
exact count, created-order/ID tie-breaker, one page/count + one complete route
batch, and explicit main/route errors. It did not establish that vendors use
25 rows or the same backend. L1.1/L2 remain deferred; they and the Owner-deferred
three market additions are not prerequisites before S0 or Expression.
The original mismatch's exact trigger/prevalence remains unknown; L1's bounded
smoke does not retroactively prove its cause.

**Dated planning scope — 2026-10-24.** The Owner requested local planning alignment
for a consistent NT identity across the whole website. Approval at that checkpoint
covered Markdown plan/handoff edits. Final designs, app/font/assets/configuration,
packages/lockfile, SQL/migrations, fixtures, account/data/DB operations, Production
access, stage/commit/push/deploy and archive access remained outside that scope.
The earlier 48-document C publication is closed. Local HEAD
`67c1e6fbf80da77d5bb6d6e115d3fa06016611b5` is the observed documentation
baseline from that date. Nine unpublished local parity tooling/baseline files
were kept separate and unchanged. The earlier approvals were consumed.

เอกสารนี้เป็นจุดอ้างอิงหลักสำหรับ **ลำดับงานและเงื่อนไขการตัดสินใจปัจจุบัน**
โดย supersede เฉพาะคำแนะนำด้านลำดับ, provisioning/SSO, BOQ approval authority
และข้อเสนอที่บังคับ revision-chain/supersede ใน
[Product Plan #01](./01-conduit-boq-product-evolution-decision-plan.md)
ส่วนรายละเอียดเทคนิคและทางเลือกเดิมยังใช้อ้างอิงได้ตามข้อจำกัดของแต่ละส่วน
เอกสาร release result ทั้งหมดคงเป็นหลักฐานตามเวลาที่บันทึก ไม่แก้ chronology
หรือถือว่า approval ที่ใช้แล้วอนุญาตงานใหม่

แนวคิดเดิมที่ย่อไว้และผลเทียบระบบสากลเก็บใน
[Research / Capability Backlog #10](./10-global-estimating-research-and-capability-backlog.md)
เพื่อค้นคืนได้ ไม่เปลี่ยนลำดับหรือเพิ่ม implementation scope ตาม backlog

แผนย่อยปัจจุบันคือ [NT brand / sitewide UI #11](./11-nt-brand-system-and-sitewide-ui-rollout-plan.md),
[UM-A / UM-B #12](./12-user-management-um-a-and-um-b-plan.md) และ
[focused S0 writer boundary](../security/05-s0-boq-writer-boundary-plan.md)
ใช้ร่วมกัน: brand direction ได้รับการยืนยันแล้ว แต่ implementation และ
release ของแต่ละชุดยังต้องอนุมัติขอบเขตใหม่ ไม่เปิดงานทั้งเว็บโดยอัตโนมัติ

## 1. ข้อเท็จจริง ข้อเสนอ และสิ่งที่ยังไม่ทราบ

| ประเด็น | สิ่งที่ทราบ | สถานะการตัดสินใจ |
|---|---|---|
| ผู้ดูแล | Owner ดูแลระบบคนเดียว | ใช้ release เล็กที่ตรวจรับได้ ไม่เพิ่ม PR/process โดยไม่มีเหตุผล |
| BOQ ฉบับใช้งาน | Owner ยืนยันว่าได้รับอนุมัติจากเอกสารจริง โดยผู้จัดการส่วนวิศวกรรมท่อร้อยสาย | ข้อเท็จจริงของกระบวนการธุรกิจ; W-H เป็นแนวทางเสนอ ยังไม่อนุมัติ implementation |
| Organizational SSO | องค์กรมี SSO และ Owner ต้องการเชื่อม | ยังไม่ทราบผู้ให้บริการ, protocol, attributes, licensing และผู้ประสานงาน |
| Internal hosting | Owner คาดว่า IT อาจให้ย้ายทั้งระบบภายในเพราะความกังวลเรื่องข้อมูลส่วนบุคคล | สมมติฐานเบื้องต้น ยังไม่ใช่นโยบายที่ IT ยืนยัน หรือหลักฐาน compliance |
| User management | มี profile/organization, 5 roles, approve/reject, suspend/deactivate/reactivate และ authorization audit เดิม | ต้องกำหนด provisioning, source of truth, offboarding/session และสิทธิ์ใหม่ให้ตรงนโยบาย |
| NT brand ทั้งเว็บ | Owner ยืนยันแนวทางอัตลักษณ์ NT โดยอ้างอิง Master Catalog และ UM-A1 ปล่อย UI เฉพาะหน้า Admin แล้ว | การขยายไปหน้าอื่นและการแก้ font/shared files ยังรอตรวจขอบเขต |
| บัญชี active แต่แสดง “(ขอ)” | Owner ระบุว่าเคยอนุมัติคำขอแล้ว ผลอ่านหนึ่งบัญชีวันที่ 2026-11-02 พบว่าสังกัดจริงว่าง สังกัดที่ขอถูกต้อง และไม่พบ approval fields หรือ events ในแหล่งที่ตรวจ | สาเหตุย้อนหลังยังไม่ทราบ UM-A1 แสดงสังกัดจริงกับสังกัดที่ขอแยกกัน และ Owner ยืนยันสังกัดบัญชีแรกผ่าน UM-B รอบแรกแล้ว |
| การแก้ฉบับใช้งาน | Owner เลือกใช้ Copy เดิมสร้างฉบับร่างใหม่แยกอิสระ | ไม่บังคับ revision-chain/source-link/supersede engine; ฉบับใช้งานเดิมยังต้องป้องกันการแก้ย้อนหลังทุก write path |
| กรรมการ TOR | เข้ามาดูและลงนามบนกระดาษ; ต้องการแบบพิมพ์สามชื่อ/ข้อความปรับเล็กน้อย และตาราง Excel เปล่า | เสนอหนึ่ง Viewer ตาม scope/status/action ที่จะอนุมัติ; ชื่อผู้ลงนามเป็นข้อมูลเอกสาร ไม่ใช่สาม roles ใหม่ |
| วิธีเตรียมปริมาณ | Owner ยืนยันว่าถอดแบบลง Excel แล้วนำมากรอกในระบบ | ใช้เป็น business context; Owner ให้พักข้อเสนอ Excel intake และ enhancements อีกสองข้อจากการวิจัยตาม §8.1 |
| Quantity Expression | DB-1/G1 product direction: `*` canonical, `x`/`X`/`×` aliases, สูตรเฉพาะ quantity editor, output เป็นตัวเลข | ไม่อนุมัติ schema/RPC/migration/parser หรือ implementation; ต้องปิด wider R0/D0 ก่อน |

รายละเอียดที่ยังต้องตัดสินใจอยู่ใน [decision register](#8-decision-register)
การบันทึก roadmap นี้ไม่เปลี่ยนค่า TBD เป็น approved

## 2. งานที่ปิดแล้วและขอบเขตที่ต้องรักษา

| งาน | Durable receipt | ข้อจำกัดที่ยังคงอยู่ |
|---|---|---|
| Master Catalog / P-49 — PRODUCTION PASS | [#106](../master-catalog/106-phase4-master-catalog-exact-remaining-work-handoff.md), [#107](../master-catalog/107-phase4-p49-master-catalog-final-closeout-result.md) | Catalog 2568.1.0 / 710 active ตามหลักฐาน; expanded persona rehearsal เป็น accepted residual ไม่ใช่ PASS |
| Atomic BOQ Duplicate / DUP-1 — PRODUCTION PASS | [Product Result #04](./04-atomic-boq-duplicate-production-release-result.md) | Normal Copy คงราคา/Catalog/Factor; current prices ใช้ Create New; authority consumed |
| BOQ Save NULL authorization guard — PRODUCTION PASS | [Security Result #04](../security/04-boq-save-null-authorization-production-release-result.md) | migration 030 แก้ NULL guard อย่างจำกัด ไม่ได้ปิด wider S0 |
| Quantity Input Safety / R0A — PRODUCTION PASS | [Product Result #08](./08-r0a-quantity-input-safety-production-release-result.md) | Application source `4d285f81fa7ad418039ccd8428c2e55ac1e65ce8`; numeric-only ไม่ใช่ Expression; Q-A/Q-B consumed |
| Dependency A — CLOSED | [A Production result](../../06_engineering/DEPENDENCY_A_PRODUCTION_RELEASE_RESULT_20261023.md) | Exact A8 `a3114fc0eda2eb8d898ad2949ebc71250515df1f`; named stale-Copy exception consumed for A only; dated audit evidence ไม่ใช่ ongoing security guarantee |
| B client and Production 031 — CLOSED | [B client result](../../06_engineering/STALE_COPY_B_CLIENT_PRODUCTION_RELEASE_RESULT_20261023.md), [031 result](../../06_engineering/STALE_COPY_031_PRODUCTION_MIGRATION_RESULT_20261023.md), [B final closeout](../../06_engineering/STALE_COPY_B_RELEASE_CLOSEOUT_20261023.md) | Client `42e01c56fe2eacb5239abc8d296ca1848c48a03b`; ledger `20261023063934/boq_duplicate_stale_conflict_guard`; B Production HTTP **NOT RUN** by Owner choice, not a required pending task |
| LIST-1B L1 — RELEASED/CLOSED | [L1 Production result](../../06_engineering/LIST_1B_L1_PRODUCTION_RELEASE_RESULT_20261023.md), [L1 local result](../../06_engineering/LIST_1B_L1_LOCAL_RESULT_20261023.md) | `b1ce4495e4f1ec7c675b1341c2121d7b3e0b589f`; recorded CI/Vercel and bounded no-write smoke PASS; no DB/migration change; original mismatch trigger/prevalence unproven |
| Focused S0 / 032 — RELEASED | [S0 source closeout](../security/05-s0-boq-writer-boundary-plan.md#actual-source-publication-closeout--2026-11-05) · [032 result](../security/05-s0-boq-writer-boundary-plan.md#13-production032-one-shot-application--2026-11-05) | แอป `4dfdc44` และ migration `20261105001914` ผ่านในขอบเขต BOQ writer boundary กฎ 9 จุดและประวัติ migration ผ่าน ส่วน Production business HTTP/RPC **NOT RUN** |
| UM-A1 — RELEASED | [UM-A1 checkpoint](./12-user-management-um-a-and-um-b-plan.md#127-post-release-checkpoint--2026-11-06) | `a588bfe` ปล่อยทะเบียนและรายละเอียดผู้ใช้ในหน้า Admin พร้อม scoped NT UI |
| UM-B รอบแรก — CLOSED | [UM-B Production closeout](./12-user-management-um-a-and-um-b-plan.md#2020-first-round-production-closeout) | 033 `20261114115939` และแอป `e497ffaf45ddb7d97d64cdfa1f88d82b27c010ac` ผ่าน Owner ตรวจการยืนยันตามคำขอเดิมของบัญชีจริงรายแรกผ่าน การเห็น BOQ จากฝั่งผู้ใช้บน Production **NOT RUN** |
| UM-A2 — CLOSED | [UM-A2 Production closeout](./12-user-management-um-a-and-um-b-plan.md#27-um-a2-production-closeout) | `33a0f42` ชุด 7 ไฟล์ผ่าน CI, Vercel และ no-write smoke ผลลิงก์ยืนยันจริงและรีเซ็ตรหัสผ่านบน Production เป็น **NOT RUN** ตามที่ Owner ยอมรับ |

- Migrations 027–033 immutable/no-replay ห้ามแก้หรือ replay
  การเปลี่ยนฐานข้อมูลในอนาคตต้องอนุมัติใหม่และใช้ forward migration ใหม่
- ห้ามแตะ Catalog, Factor F, BOQ data, accounts หรือ Production ในงานเอกสารนี้
- ห้ามตรวจ แก้ ย้าย ลบ หรือแชร์ protected archive
- ไม่ตรวจ live Production ในการจัด roadmap; ผล PASS ข้างต้นอ้างอิง receipt เดิม
- ก่อนจัดทำแผนเดิมวันที่ 2026-10-14 local Git สะอาดบน main; HEAD, upstream และ local
  origin/main tracking ref เท่ากับ `b144bcae98b543ab231c503f435f261f946b9f89`,
  ahead/behind 0/0 และ local branch มีเพียง main นี่เป็น dated local observation
  ไม่ใช่ live remote/deployment guarantee; หลังบันทึกเอกสาร worktree จะมี local diff

<a id="product-sequencing"></a>
## 3. ลำดับที่เสนอและเงื่อนไขเปลี่ยนลำดับ

```text
Completed: dependency A -> B client/031/B closeout -> LIST-1B L1
  -> focused S0/032 -> UM-A1 Admin directory/details and scoped NT UI
  -> UM-B first round: confirm a verified existing affiliation request
  -> UM-A2 post-signup guidance and unusable confirmation links

Next: Owner reviews implementation details for W-H option 2 (plan #13)
  -> validate the R0/D0 numeric rules relevant to issuing an operational BOQ
  -> W-H release after review and qualification
  -> scoped Viewer + TOR print
  -> R1/R2 Quantity Expression

Separate: blank TOR Excel template can move earlier if it uses no BOQ data
  Admin-managed project name templates: plan separately when real naming rules are ready
  Admin affiliation assignment: deferred until an active employee is blocked
  Remaining UM-B and account security: prioritize by actual need or confirmed risk

NT sitewide rollout: pilot -> remaining profile/Admin -> BOQ list/editor
  -> other web surfaces, in small approved releases alongside business priorities
  (exports have separate acceptance; no mandatory full-site restyle first)

IT hosting + SSO discovery เมื่อติดต่อ IT ได้ เดินคู่กับงานแอปตามความพร้อม
  -> IT-approved target -> infrastructure rehearsal -> controlled cutover
  -> confirmed IdP + account continuity -> SSO pilot -> controlled rollout
```

เก็บ [แผน Admin กำหนดสังกัด](./12-user-management-um-a-and-um-b-plan.md#21-admin-assignment-for-an-incorrect-affiliation-request)
ไว้พิจารณาเมื่อมีพนักงานสถานะใช้งานที่สังกัดจริงยังว่าง ยื่นขอผิด และเข้าไม่ถึง
BOQ ที่จำเป็นต่อการทำงาน หากเกิดกรณีดังกล่าวค่อยทบทวนลำดับ ขอบเขตบัญชี
และหลักฐานรับรองสังกัดก่อนทำ

ตรวจ [แผนฉบับใช้งาน #13](./13-boq-operational-workflow-plan.md) ตามลำดับที่วางไว้
ก่อนปล่อยต้องปิดเกณฑ์ D0 ที่เกี่ยวข้องกับฉบับใช้งาน รวมถึงยอดที่บันทึก
จุดปัดเศษ และความสอดคล้องกับ Print/PDF/Excel
ให้เก็บแม่แบบชื่อโครงการไว้ในแผน โดยข้อเสนอ #13 คือแยกชุดการปล่อย
และใช้ตัวอย่างชื่อที่ใช้จริงเมื่อพร้อมออกแบบแม่แบบ

เดินหน้า User Management ด้วย Supabase Auth เดิมระหว่างรอ IT จัดการบัญชีและ
สังกัดให้ครบตามงานจริง แล้วกำหนดตารางสิทธิ์ของ BOQ แต่ละขั้นตอน เมื่อขอบเขต
ฉบับใช้งานและ Viewer/TOR ชัดจึงพิจารณากลุ่มสิทธิ์ชุดแรก เช่น กรรมการของโครงการ
หนึ่ง โดยระบุเอกสารที่เห็นได้ การพิมพ์/ส่งออก และวันสิ้นสุดสิทธิ์ รอตรวจความจำเป็น
จากหลายกรณีก่อนเพิ่มหน้าตั้งแม่แบบสิทธิ์เองใน Admin [แนวทางและกรณีเปรียบเทียบ](./12-user-management-um-a-and-um-b-plan.md#22-groups-roles-and-access-scope)

“ควบคู่” หมายถึงประสาน IT และปิด decision ที่ไม่ขึ้นต่อกัน ไม่ได้แนะนำให้
Owner เปิดหลาย implementation/release พร้อมกัน ทั้ง hosting และ SSO ต้องมี
เกณฑ์รับรองแยกกัน แม้ IT อาจจัดให้อยู่ในโครงการหรือช่วงเวลาเดียวกัน

- ถ้า IT ยืนยันว่าปัจจุบันห้ามใช้ cloud ให้เลื่อน internal cutover เป็นงาน
  เร่งด่วนและรอปล่อย feature บน environment ที่อนุญาต ยังไม่มีคำยืนยันนี้
- L1 ปิดแล้ว L1.1/L2 ยังพักไว้จนกว่า Owner จะเลือกขอบเขตและประโยชน์ของชุดถัดไป
  การอนุมัติปล่อยงานใหม่อ้างอิงเงื่อนไข IT ที่ยืนยันแล้ว
- S0 permission/write-boundary baseline และ D0 numeric integrity ต้องพร้อม
  ก่อนออกฉบับที่อ้างเป็นเอกสารใช้งานอย่างมี authority
- ใช้ focused S0/032 เป็นฐานสิทธิ์เขียน BOQ ที่ตรวจรับแล้ว งานสิทธิ์ส่วนที่เหลือ
  ยังต้องกำหนดขอบเขตและทดสอบเฉพาะชุด
- UM-A1 ปล่อยทะเบียน รายละเอียดผู้ใช้ และป้ายสังกัดด้วย UI เฉพาะหน้า Admin
  ส่วน UM-A2 แก้คำแนะนำหลังสมัครและเมื่อลิงก์ยืนยันใช้ไม่ได้ ใช้วิธีกรอกอีเมลเดิม
  และทดสอบ Login, callback, การกู้รหัสผ่าน และการส่งต่อไปหน้ารออนุมัติเดิม
- การเลือกบทบาทพร้อมสังกัดก่อนเปิดใช้บัญชีและการเปลี่ยนสังกัดที่กำหนดแล้ว
  อยู่ใน UM-B ส่วนที่เหลือ ให้กำหนดอำนาจและผลต่อสิทธิ์ก่อนอนุมัติ
- Viewer ต้องปิด status/scope/print/export matrix และทดสอบการห้ามเขียนทุก
  entry point ก่อนเปิดใช้ การมองเห็นเฉพาะฉบับใช้งานเป็นข้อเสนอสำหรับ TOR
  จึงรอ W-H ที่เกี่ยวข้อง; แบบ Excel เปล่าอาจทำก่อนหากแยกจากสถานะ/ข้อมูล BOQ
- W-H ไม่ต้องรอ Expression; การแก้สูตรเป็นงาน productivity ถัดจากความถูกต้อง
- SSO ไม่จำเป็นต้องปิดก่อนทุก feature เว้นแต่นโยบาย IT บังคับ ต้องรักษา
  authorization ของบัญชีปัจจุบันระหว่างรอและไม่ใช้การรอ SSO เลื่อน security defect
- หากพบ security defect ใหม่ที่เร่งด่วน ให้ประเมินลำดับใหม่ตามหลักฐาน
  ไม่รวมการแก้โดยไม่มี approval เข้ากับ release อื่น

## 4. Work packages, ความเสี่ยง และเกณฑ์ผ่าน

| งาน | ขอบเขตและสถานะ | ความยาก / ความเสี่ยง | หลักฐานหรือเกณฑ์ผ่าน |
|---|---|---|---|
| Focused S0 | **RELEASED** เก้ากฎสำหรับ INSERT/UPDATE/DELETE บนสามตาราง BOQ [ผล 032](../security/05-s0-boq-writer-boundary-plan.md#13-production032-one-shot-application--2026-11-05) | จำกัดสิทธิ์เขียนโดยคง SELECT, scope, Save และ Copy/031 | Production metadata/history **PASS** ข้อจำกัดของผลอยู่ใน receipt และ §2 |
| NT foundation / rollout | [#11](./11-nt-brand-system-and-sitewide-ui-rollout-plan.md): Master Catalog pattern, genuine assets, token/font pilot และขยายทีละ surface | กลาง: shared CSS/font กระทบหลายหน้า, Thai wrapping, asset provenance | exact affected paths, Thai/font/contrast/mobile/keyboard QA และ business regression; ไม่เปลี่ยน Print/PDF/Excel incidentally |
| UM-A1 Admin first | **RELEASED** ทะเบียนแบบ cursor หน้ารายละเอียด และป้ายแยกสังกัดจริงกับสังกัดที่ขอ [ผล UM-A1](./12-user-management-um-a-and-um-b-plan.md#127-post-release-checkpoint--2026-11-06) | ผูกคำสั่งกับบัญชีที่เลือกเมื่อเปลี่ยนหน้า พร้อมอ่านค่าจริงหลังคำสั่ง | GitHub Quality, Vercel และ anonymous Login smoke **PASS** |
| UM-B รอบแรก | **CLOSED** Admin ยืนยันตามคำขอเดิมเมื่อบัญชีพนักงานใช้งานอยู่ สังกัดจริงว่าง และคำขอผ่านการตรวจ [บันทึกปิดรอบแรก](./12-user-management-um-a-and-um-b-plan.md#2020-first-round-production-closeout) | สังกัดที่ยืนยันอาจเพิ่มการเห็น BOQ ที่แชร์ในส่วนงาน | ผล Docker และการยืนยันบัญชีจริงรายแรกจากหน้า Admin ผ่าน การตรวจ BOQ จากมุมผู้ใช้บน Production **NOT RUN** |
| Admin กำหนดสังกัดเมื่อคำขอผิด | **พักไว้จนมีเคสติดงาน** สำหรับพนักงานที่ใช้งานอยู่ สังกัดจริงยังว่าง และเข้าไม่ถึง BOQ ที่ต้องใช้ [ข้อเสนอแยก](./12-user-management-um-a-and-um-b-plan.md#21-admin-assignment-for-an-incorrect-affiliation-request) | กลาง: เลือกผิดส่วนงานแล้วเกิดสิทธิ์เห็น BOQ เพิ่ม กรณีข้อมูลเปลี่ยนระหว่างตรวจหรือกดยืนยันพร้อมกัน | ตรวจสิทธิ์ที่เซิร์ฟเวอร์ บันทึกสังกัดจริงและประวัติพร้อมกัน เก็บคำขอเดิม ทดสอบข้อมูลจำลองและขอบเขต BOQ บน Docker |
| UM-A2 Auth follow-up | **CLOSED** ขั้นถัดไปหลังสมัครและหน้าช่วยเหลือเมื่อลิงก์ใช้ไม่ได้ [ผล UM-A2](./12-user-management-um-a-and-um-b-plan.md#27-um-a2-production-closeout) | ลิงก์ยืนยันกับลิงก์ตั้งรหัสผ่านใช้ callback ร่วมกัน | Docker ผ่านรายกรณี ผลทดสอบลิงก์จริงทั้งสองชนิดบน Production **NOT RUN** |
| Remaining UM-B + account-security minimum | trusted atomic role+org activation, broader affiliation/role transitions; reviewed-state conflict/replay/legacy compatibility และ admission/recovery/session/offboarding ตาม policy | สูง: visibility/privilege เปลี่ยน, concurrent overwrite, lockout | approved role/scope/transition matrix, server conflict guard/current state/audit/idempotency, no temporary wrong role, least privilege, bounded recovery/revocation evidence; ไม่อาศัย UI refresh/row lock/email metadata แทน reviewed-state contract |
| Wider R0/D0 | ปิด rounding/precision/zero/max/incomplete-by-action; trusted numeric write และ fixture harness บน baseline ที่อนุมัติ | สูงด้านตัวเลข: Save/reload/output ไม่ตรงกัน | Owner-approved vectors ตรงตั้งแต่ component/item/route/BOQ ถึง Save/reload/Print/PDF/Excel; tampered/inconsistent writes ถูกปฏิเสธแบบ atomic |
| W-H | **เลือกแบบ 2 แล้ว รอตรวจรายละเอียด** ล็อกชุดในสถานะเสนออนุมัติก่อนพิมพ์ เมื่อเอกสารลงนามแล้วจึงบันทึกผลและเปลี่ยนเป็นฉบับใช้งาน ใช้ Copy เดิมสร้างฉบับร่างใหม่เมื่อต้องแก้ | กลาง–สูง: ลงนามคนละเนื้อหา, issued data เปลี่ยนได้, recorder authority สับสน | ใช้กลุ่มผู้บันทึกและเลขที่/วันที่เอกสารตามที่ Owner ระบุ ตรวจความตรงกับชุดลงนามตามวิธีอ้างอิงที่จะตกลงใน #13 รวมกรณีบันทึกผิด ตัวเลข การล็อก และ Copy เดิม |
| Viewer / TOR outputs | หนึ่ง Viewer ที่มีขอบเขตชัด และ TOR print สามชื่อ/ข้อความตามแบบ; blank Excel เป็น output candidate แยกได้ | กลาง: เห็น drafts เกินสิทธิ์, export หลุด scope, สับสนชื่อผู้ลงนามกับบัญชี | status/scope/action matrix enforced server-side, no writes ทุกทาง, แบบพิมพ์และ Excel ตรวจรับจริง; ไม่ใช้ roles สำหรับช่องชื่อสามคน |
| Internal hosting | packaging/configuration บน target ที่ IT อนุมัติ; sanitized rehearsal, backup/restore, monitoring และ cutover runbook | สูงด้านปฏิบัติการ: data loss, Auth/API ใช้ไม่ได้, rollback หลังเกิดข้อมูลใหม่ | เทียบข้อมูล/permissions/function behavior/output กับ baseline ที่ยอมรับ; restore และ cutover rehearsal ผ่าน; single writer; ผู้รับผิดชอบรับมอบ |
| Organizational SSO | protocol-specific candidate หลังรู้ IdP; approved account mapping และ pilot ผู้ใช้กลุ่มเล็ก | สูงด้าน identity: duplicate accounts, BOQ ownership สูญหาย, disabled กลับ active | ผู้ใช้เข้าถึง BOQ เดิมถูกต้อง; profile status/role ไม่ถูกยกระดับเอง; offboarding, session, recovery/rollback พิสูจน์ได้ |
| R1/R2 Expression | parser/normalization/versioning, persisted formula และ trusted result ภายใต้ DB-1/G1 direction | สูงข้าม UI/DB/output: formula/result divergence, old client overwrite | สูตร survive reopen; malformed/oversized input ถูกปฏิเสธ; legacy/concurrency รองรับ; outputs numeric-only ตรง saved truth |

ระดับความยากเป็น qualitative assessment ไม่ใช่กำหนดเวลา ช่วงเวลาของ #01/#02
เป็น planning estimates เดิม ไม่ใช้เป็น commitment สำหรับ Solo ก่อนรู้ policy,
environment, accounting decisions และความพร้อม IT ทดสอบตามขอบเขตจริง
และเพิ่ม tests เมื่อพิสูจน์ความเสี่ยงได้ ไม่เพิ่ม process เพื่อให้ checklist ยาวขึ้น

## 5. User data, permissions และ SSO

ทะเบียนเดิมมี profiles, organization/departments/sectors และ role/status อยู่แล้ว
แยก design เป็นสามชั้น: ข้อมูลบุคคล/สังกัด, identity binding กับ Auth/SSO,
และสิทธิ์ business action ออกแบบและปรับ UX บน Supabase Auth เดิมได้โดยไม่รอ
IdP แต่ยังไม่สร้างตาราง/RPC/configuration ในงานเอกสาร และไม่ตรึง protocol
หรือสร้าง user store ชุดใหม่ แผน UM-A/UM-B รายละเอียดอยู่ใน [#12](./12-user-management-um-a-and-um-b-plan.md)

- Owner/IT ต้องกำหนด source of truth ของชื่อ รหัสพนักงาน สังกัด และกลุ่มสิทธิ์
  รวม joiner/mover/leaver, contractors/procurement และคนที่รับรองการเปลี่ยนสิทธิ์
- คงความเชื่อมโยง `user_profiles.id`, `boq.created_by`, `boq.assigned_to`
  ซึ่งอ้าง Auth UUID; การเปลี่ยนตัวตนต้องมี mapping/migration ที่อนุมัติใหม่
  ห้ามรวมบัญชีอัตโนมัติด้วย email หรือถือว่าบัญชี SSO เชื่อมบัญชี password เอง
- UM-A2 ใช้ Supabase Auth เดิมเพื่อแก้ผลหลังสมัครและหน้าช่วยเหลือกรณีลิงก์ใช้ไม่ได้
  งานส่งลิงก์ซ้ำและการปรับหน้ารออนุมัติ/โปรไฟล์ให้พิจารณาภายหลัง
  ผลส่งถึงที่มีหลักฐานเป็นอีเมลสมัครหนึ่งฉบับบน UM-B ส่วนการยืนยันด้วยลิงก์จริง
  และรีเซ็ตรหัสผ่านบน UM-A2 Production เป็น **NOT RUN** ตามที่ Owner ยอมรับ
- UM-A1 ไม่แก้การตรวจโดเมน ค่า setting ปัจจุบัน หรือ shared Auth/session
  กลไกโดเมนเดิมครอบคลุม login/recovery/protected web access ด้วย ไม่ใช่แค่
  ผู้สมัครใหม่ และไม่ใช่ Auth ban/direct-API revocation ต้องปิด decision แยก
  ก่อนเปลี่ยนจริงเพื่อป้องกัน lockout; actual hosted values/hooks ยังไม่ตรวจใหม่
- suspend/deactivate ที่บล็อก business access ไม่เท่ากับ session revocation
  ต้องกำหนดและทดสอบทั้งการเข้าถึงและการ refresh ตาม SLA
- UI checks เป็นเพียง UX; trusted API/RPC/grants/RLS/protected columns ต้อง
  enforce current active profile + role + scope + exact action ตามกติกาเดียวกัน
- ใช้ทะเบียนและคำสั่ง approve/reject/role/suspend เดิมใน [Admin UI](../../../app/admin/page.tsx)
  ทะเบียน UM-A1 ขอข้อมูล 26 รายการ แสดง 25 และใช้ cursor สำหรับ Back/Next
  การค้นหา กรอง และนับทั้งทะเบียนยังอยู่นอกขอบเขต ส่วน legacy fallback คง read-only
- แยก email verification, application status, actual affiliation และ requested
  affiliation ออกจากกัน การวินิจฉัยหนึ่งบัญชีที่อนุมัติก่อนหน้านี้อธิบาย
  active+actual NULL+requested valid ไม่พิสูจน์ว่าทุกบัญชีเหมือนกันหรือใคร
  เป็นผู้เปลี่ยนในอดีต ห้ามเก็บ PII/raw result ในแผนหรือขยาย Production read
- UM-A1 แสดงป้ายตามข้อมูลปัจจุบัน UM-B รอบแรกบันทึกสังกัดจริงหลัง Admin
  ยืนยันตามคำขอและบันทึกเหตุผล บัญชีที่ยังรอตรวจคงสถานะและสิทธิ์เดิม
  แนวทางกำหนดสังกัดเมื่อคำขอผิดจะใช้ฐานสิทธิ์หลัง S0 เดียวกัน
- Admin commands เดิมแยก role/status และไม่มี expected-version comparison
  UX ต้องผูก actor/target/action/reason/request UUID และ uncertain recovery
  แต่ refresh ก่อนกดไม่รับประกันตัดทุก concurrent overwrite ได้
- A1 แยก fetched record, lookup/presenter และ command intent; หลังคำสั่งอ่าน
  projection จริงกลับ ไม่เดา actual IDs/audit จาก requested values หรือเวลาบน
  client ถ้าคำสั่งสำเร็จแต่อ่านใหม่ไม่ได้ต้องไม่รายงานว่า mutation ล้มเหลว
  หรือส่งซ้ำอัตโนมัติ ส่วน reviewed-state conflict เป็น design gate ของ UM-B
  ไม่อ้างว่า locks หรือ idempotent replay รับรองค่าปัจจุบันของ target
- SSO-ready ไม่ได้แปลว่าจะไม่ต้องย้าย identity ใดเลย เช่น Supabase SAML
  มีข้อจำกัด account linking ตาม official reference ใน #12 จึงต้องรอ IdP
  และวาง mapping/ownership continuity ก่อนเปิดใช้ ไม่สร้าง user store ใหม่
  หรือใช้ email เป็น primary key ระหว่างรอ

## 6. Dependency evidence และขอบเขต patch ที่เสนอ

**Current recorded package/source state — 2026-10-23:** A8 ปิดแล้วตาม
[A receipt](../../06_engineering/DEPENDENCY_A_PRODUCTION_RELEASE_RESULT_20261023.md):
Next/config `16.4.2`, PostCSS override `8.5.23`, locked Sharp `0.35.5`.
ผล production audit0 findings เป็นหลักฐานตามวันตรวจของ A ไม่ใช่การรับรองว่า
ไม่มี advisory ใหม่ตลอดไป; dev findings/การเพิ่ม audit ใน CI ยังเป็น scope แยก
งานเอกสารนี้ไม่ตรวจ registry/audit สดและไม่อนุมัติ package update ใหม่

**Historical observations and candidate analysis — 2026-10-14:** ตารางและ
ข้อเสนอด้านล่างเก็บรุ่น/ผลตรวจในวันเดิม ไม่ใช่ current package หรือ patch ค้าง:
ขณะนั้น package.json ใช้ Next/config 16.2.9; audit --omit=dev พบ 6 package findings
(1 critical, 4 high, 1 moderate) ไม่ใช่จำนวน CVE ทั้งหมด npm Next latest ที่
ตรวจซ้ำเวลา 18:08 +07 เป็น 16.4.0; config latest ที่ตรวจเวลา 09:32 +07 เป็น
16.4.0 ด้วย Official Next blog ยังแสดงประกาศ out-of-band security update
วันที่ 14 ตุลาคม จึงยังไม่ถือว่า 16.4.0 ครอบคลุมประกาศใหม่โดยอัตโนมัติ

| Finding | Locked path/version ที่ตรวจ | Compatible candidate ที่ต้องตรวจสดก่อนแก้ |
|---|---|---|
| next — critical | direct 16.2.9 | audit เสนอ 16.4.0 non-major; เลือก patched version ตาม advisory ล่าสุดและ align eslint-config-next |
| sharp — high | Next optional 0.34.5 | 0.35.5; Next 16.4.0 รับ ^0.35.4; ตรวจ native install ของ target platform |
| brace-expansion — high | 1.1.15 และ 2.1.1 ผ่าน ExcelJS archiver/unzip/minimatch | compatible 1.1.21 และ 2.1.7; ไม่ต้องเปลี่ยน ExcelJS feature scope |
| nanoid — high | 3.3.12 ผ่าน PostCSS | patched >=3.3.18; candidate 3.3.20 |
| source-map-js — high | 1.2.1 ผ่าน PostCSS | 1.2.2 |
| baseline-browser-mapping — moderate | 2.10.38 ผ่าน Next | patched >=2.11.0; candidate 2.11.28 |

PostCSS override 8.5.15 เป็น security pin เดิม ต้องทบทวนเจตนาอย่างชัดเจน
candidate 8.5.30 พร้อม compatible transitive versions เป็นข้อเสนอที่ตรวจแล้ว
ใน session ไม่ใช่ authorization หรือคำรับรองว่า latest เสมอ Next 16.4.0
ประกาศ PostCSS 8.5.23; single locked PostCSS node ปัจจุบันเป็น dev:true
แม้มี production Next edge ต้องตรวจ classification และ clean production-omit
install หลัง regenerate lockfile ไม่อนุมานว่ามันไม่เข้าระบบ Production
รักษา ExcelJS uuid override 11.1.1 เว้นแต่หลักฐานใหม่ต้องเปลี่ยน

ห้าม npm audit fix/fix --force และไม่ใช้ broad package update ไม่รวม React,
Supabase features, CI/process expansion หรือ database changes เข้ามาโดยอัตโนมัติ
การเพิ่ม audit:prod ใน CI เป็น scope decision แยก ยังไม่อนุมัติ

## 7. IT handoff, W-H และการดูแลต่อ

### IT ต้องยืนยันก่อนเลือก infrastructure/SSO implementation

1. Internal-only ครอบคลุมเว็บ, Auth/API, DB, files, logs/monitoring และ backups
   ทั้งหมดหรือไม่; cloud ปัจจุบันใช้ระหว่าง transition ได้หรือไม่
2. Linux/VM/containers และ Auth/DB platform ที่อนุญาต; environment ทดสอบและ
   Production แยกกัน; DNS/HTTPS, intranet/VPN และ browser/server API reachability
3. SSO provider/protocol, stable identifier, attributes/groups, test tenant,
   MFA/session policy, certificate/key rotation และ IT identity owner
4. Outbound HTTPS/npm/container/font build dependencies และ SMTP ที่อนุญาต
   รวม update channel; ห้ามคิดว่าระบบ offline เพียงเพราะ runtime อยู่ภายใน
5. จำนวนผู้ใช้/พร้อมกัน ขนาดและการเติบโตของข้อมูล งาน export ที่ต้องรองรับ
   ก่อนกำหนด sizing/availability; ไม่กำหนด Kubernetes/HA หรือขนาดเครื่องตายตัว
6. Backup retention, RPO/RTO, restore rehearsal, access/logging policy,
   incident support และเจ้าของ OS/database/SSO/certificate/application

แอปต้องใช้ Next Node runtime และ Supabase Auth/Data API/DB semantics เดิม
การเปลี่ยนเหลือ static hosting หรือ bare PostgreSQL เป็น architecture change
ใหม่ที่ไม่อนุมัติ Supabase CLI local dev/test ไม่ใช่ hardened Production
self-hosted Supabase ต้องมี security configuration และทีมรับผิดชอบดูแล
Object Storage ให้ตรวจ inventory ภายใต้ approval ใหม่; approval attachments
เป็น future requirement ไม่ใช่หลักฐานว่า app ใช้ storage อยู่แล้ว

Rehearsal งานใหม่ต้องใช้ synthetic/sanitized data และ relevant current
contracts ที่อนุมัติ รวม post-031 เมื่อเกี่ยวกับ Copy; ไม่ rebuild โดย replay
027–031 และไม่ใช้ bootstrap ที่หยุด 026 เป็น
หลักฐาน Production parity การ export/restore ข้อมูลจริงต้องอนุมัติใหม่
Owner ให้บันทึก [Local Database Parity Plan](../../06_engineering/LOCAL_DATABASE_PARITY_PLAN.md)
สำหรับ final-state baseline บน Docker เท่านั้น ข้อปรับแผน 2026-10-15 เสนอ
rebuild ฐานทดสอบเดิมเมื่ออนุมัติ โดยไม่บังคับ backup หรือ stack แยกสำหรับข้อมูล
ทดสอบที่สร้างใหม่ได้ ไฟล์ backup/snapshot ของ Owner ไม่แตะและไม่เป็น prerequisite
หากไม่ได้เลือกใช้ ข้อความว่ายังไม่อนุมัติ reset/restore/seed เป็นสถานะของแผนเดิม
วันที่จัดทำ; การอนุมัติ local preparation ภายหลังมีขอบเขตตาม receipt เท่านั้น

**ผลดำเนินการภายหลัง 2026-10-23:** Owner อนุมัติ local preparation แล้ว ดู
[Local Parity Result](../../06_engineering/LOCAL_DATABASE_PARITY_RESULT.md):
application contracts ตรง, API 46 PASS / stale Copy 1 FAIL, บัญชี local เดิม
และ bounded UI/output checks ผ่าน สถานะ PARTIAL ไม่ใช่ release-ready และ
ไม่อนุมัติ product fix/Production write/027–030 replay เพิ่ม Environment preparation
นี้เป็นผลของ captured pre-031 baseline ตามวันเดิม ไม่ถูกเปลี่ยนเป็น PASS ย้อนหลัง
ต่อมามี local031 correction, B/031 closeout และ L1 local/API/browser tests
ตาม receipts ใน §2; ไม่ใช่สิทธิ์ reset/replay หรือนำ baseline เก่ามาแทน current
post-031 contract งานเอกสารนี้ไม่รัน tooling หรือแก้ฐานข้อมูล
Cutover ต้องมี write freeze/final capture/verification/single writer;
rollback หลังมีข้อมูลใหม่ต้องมี reconciliation ไม่ใช่เพียงเปลี่ยน DNS กลับ

<a id="boq-operational-workflow"></a>
### W-H: ฉบับใช้งานจากเอกสารลงนามจริง

[แผน #13](./13-boq-operational-workflow-plan.md) ขยายวิธีจับคู่เอกสาร
การล็อกข้อมูล หน้าจอ กรณี BOQ เก่า และแผนทดสอบบน Docker
ตำแหน่งแสดงรหัสชุดและหลักฐานที่ใช้จับคู่ยังรอ Owner ตัดสินใจตาม
[รายการตรวจใน #13](./13-boq-operational-workflow-plan.md#wh-owner-decisions)

**ความหมาย** BOQ ฉบับใช้งานคือ BOQ ที่มีเนื้อหาตรงกับเอกสารที่ผู้จัดการส่วน
วิศวกรรมท่อร้อยสายลงนามอนุมัติแล้ว และมีการบันทึกผลอนุมัติไว้ในระบบ
ตามแนวทางที่เสนอ ฉบับนั้นจะล็อกเนื้อหาไว้ หากต้องแก้ให้ใช้ Copy สร้างฉบับร่างใหม่

**ข้อตกลงเดิม — 2026-10-24** เมื่อต้องแก้ฉบับใช้งาน ให้ใช้
**Copy เดิม → BOQ ฉบับร่างใหม่แยกอิสระ** รายละเอียดการจัดเก็บและสิทธิ์ในระบบ
อยู่ในขั้นออกแบบเพื่อเสนออนุมัติ implementation

**ข้อสรุปจาก Owner — 2026-11-15**

| เรื่อง | ข้อสรุป |
|---|---|
| ผู้ลงนามอนุมัติ | ผู้จัดการส่วนวิศวกรรมท่อร้อยสายลงนามในเอกสารจริง |
| ผู้บันทึกผลในระบบ | Admin, ผู้จัดการส่วน หรือผู้ได้รับมอบหมายประจำส่วนงาน |
| ข้อมูลอ้างอิง | เลขที่หนังสือเต็มและวันที่ตามเอกสารจริง ส่วนวิศวกรรมท่อร้อยสายใช้ `เอ็นที วทฐฐ./xxx` ส่วนปฏิบัติการท่อร้อยสายใช้ `เอ็นที ปทฐฐ./xxx` |
| ผู้จัดการเมื่อบันทึกผิดหรือมีฉบับใหม่มาแทน | Admin เป็นผู้จัดการกรณีบันทึกผลผิดและระบุฉบับที่ให้ใช้ต่อสำหรับ TOR |

**แบบ 2 ที่ Owner เลือก** ใช้ BOQ ใบเดิมตลอดสามสถานะ
**ฉบับร่าง → เสนออนุมัติ → ฉบับใช้งาน**

1. กด **เสนออนุมัติ** จาก BOQ ใบเดิม ระบบล็อกข้อมูลที่บันทึกไว้และออก
   รหัสชุดให้อัตโนมัติ
2. กด **พิมพ์ชุดเสนอ** เพื่อนำไปขอลงนามในเอกสารจริง
3. หลังลงนาม ผู้มีสิทธิ์เปิด BOQ ใบเดิมและกด **บันทึกผลลงนาม** ระบบแสดง
   รหัสชุดให้ตรวจความตรงกันตามวิธีอ้างอิงที่จะตกลงใน #13 ผู้บันทึกกรอก
   เลขที่หนังสือเต็มและวันที่ตามเอกสารจริง เมื่อบันทึกสำเร็จ ระบบเปลี่ยนเป็นฉบับใช้งาน

หน้าปกติแสดงคำสั่งตามสถานะและสิทธิ์ ฐานข้อมูลบังคับการเปลี่ยนสถานะ ล็อก
ข้อมูลทุกช่องทาง และเก็บประวัติในธุรกรรมเดียว ใช้การตรวจรับจาก
[แผน #13](./13-boq-operational-workflow-plan.md) ก่อนเปิดใช้

#### ถอนกลับเป็นร่างและ Copy

- **เสนออนุมัติและยังไม่ลงนาม:** ถอนชุดเสนอพร้อมเหตุผลเพื่อให้ BOQ ใบเดิม
  กลับเป็นฉบับร่างที่แก้ได้ หากส่งเอกสารออกไปแล้ว ให้เรียกคืนหรือติดต่อ
  ผู้รับให้หยุดใช้ชุดเดิมก่อนถอน เก็บประวัติการถอนและยกเลิกสิทธิ์ใช้รหัส
  ชุดเดิมบันทึกผล เมื่อเสนออีกครั้งให้ออกรหัสชุดใหม่แม้เนื้อหาจะเหมือนเดิม
- **ลงนามแล้วหรือเป็นฉบับใช้งาน:** เก็บเนื้อหาชุดที่ลงนามไว้ การแก้เนื้อหา
  ใช้ Copy สร้างฉบับร่างใบใหม่แล้วเสนอและลงนามใหม่
- **Copy ได้จากทั้งสามสถานะ** คือฉบับร่าง เสนออนุมัติ และฉบับใช้งาน
  ภายใต้สิทธิ์ Copy เดิม ผลลัพธ์เป็น BOQ ฉบับร่างใบใหม่เสมอ สถานะและเนื้อหา
  ต้นฉบับคงตามเดิม รหัสชุดเสนอ เลขที่และวันที่หนังสือ และประวัติอนุมัติอยู่กับ
  ต้นฉบับ

#### ตารางสิทธิ์ BOQ ทั้งสามสถานะ

Owner ยืนยันให้ผู้รับผิดชอบที่ได้รับมอบหมายรายใบและยังมีสิทธิ์แก้ BOQ
ใบนั้นกดเสนออนุมัติได้ ตารางนี้ใช้เป็นกติกาธุรกิจสำหรับออกแบบและตรวจแผน
ก่อนอนุมัติให้ลงมือ

| สถานะ BOQ | คำสั่ง | ผู้มีสิทธิ์และขอบเขต | วิธีมอบสิทธิ์เพิ่ม |
|---|---|---|---|
| ฉบับร่าง | **เสนออนุมัติ** แล้วล็อกชุด | ผู้จัดทำหรือผู้รับผิดชอบที่ได้รับมอบหมายให้ดูแล BOQ ใบนั้นและยังมีสิทธิ์แก้ไข ผู้จัดการส่วนสำหรับ BOQ ในส่วนที่รับผิดชอบ และ Admin ทุกส่วนงาน | ใช้สิทธิ์ตามหน้าที่และการมอบหมาย BOQ รายใบ |
| เสนออนุมัติ | **ถอนกลับเป็นร่างเดิม** | ผู้จัดทำสำหรับ BOQ ที่ตนจัดทำและยังอยู่ในขอบเขตสิทธิ์แก้ไข ผู้รับมอบหมายที่มีสิทธิ์ถอนในส่วนงาน ผู้จัดการส่วนในส่วนที่รับผิดชอบ และ Admin ทุกส่วนงาน | Admin ติ๊ก **ถอนชุดเสนออนุมัติ** แยกรายคนและส่วนงาน |
| เสนออนุมัติ | **บันทึกผลลงนาม** แล้วเปลี่ยนเป็นฉบับใช้งาน | Admin ทุกส่วนงาน ผู้จัดการส่วนในส่วนที่รับผิดชอบ หรือผู้รับมอบหมายที่มีสิทธิ์บันทึกผลในส่วนงาน เมื่อหนังสือลงนามตรงกับชุดที่ล็อกไว้ | Admin ติ๊ก **บันทึกผลลงนาม** แยกรายคนและส่วนงาน |
| ฉบับใช้งาน | **จัดการผลที่บันทึกผิดหรือเลือกฉบับที่ใช้ต่อสำหรับ TOR** | Admin เท่านั้น หากกรอกเลขที่หรือวันที่ผิด ให้แก้เฉพาะข้อมูลอ้างอิงพร้อมเก็บค่าเดิม ค่าใหม่ และเหตุผล หากอนุมัติผิดชุด ให้ระงับการใช้สำหรับ TOR และเก็บหลักฐานเดิม | สงวนให้ Admin |

สิทธิ์เสนอจากการได้รับมอบหมายให้แก้ BOQ รายใบใช้กับการเสนอใบนั้น
สิทธิ์ถอนของผู้จัดทำยึดผู้สร้าง BOQ โดยตรง ส่วนผู้รับผิดชอบรายใบที่ต้องถอน
ให้ใช้สิทธิ์ตามบทบาทหรือสิทธิ์ถอนที่ Admin มอบเพิ่ม ชุดที่เสนอและฉบับใช้งาน
ล็อกเนื้อหาไว้ การ Copy จากทั้งสามสถานะใช้สิทธิ์เดิมและได้ฉบับร่างใบใหม่
ตามกติกาข้างต้น

#### สิทธิ์ที่ Admin ติ๊กมอบได้

ในหน้าจัดการผู้ใช้ ให้ Admin
เลือกบัญชีและส่วนงาน แล้วติ๊ก **ถอนชุดเสนออนุมัติ** และ **บันทึกผลลงนาม**
แยกกัน ให้หน้าจอแสดงสิทธิ์ตามหน้าที่และสิทธิ์ที่มอบเพิ่มแยกกัน การเปลี่ยน
คนรับผิดชอบทำผ่านหน้าตั้งค่าได้หลังมีฟีเจอร์นี้

ให้เก็บประวัติการมอบหรือถอนสิทธิ์พร้อม Admin ผู้เปลี่ยน เวลา ส่วนงาน และ
สิทธิ์ที่เปลี่ยน ฐานข้อมูลตรวจสถานะบัญชี สิทธิ์ปัจจุบัน ขอบเขต BOQ และ
เงื่อนไขของชุดเสนอทุกครั้งที่ส่งคำสั่ง เมื่อถอนสิทธิ์แล้ว คำสั่งถัดไปต้องใช้
สิทธิ์ล่าสุดแม้ผู้ใช้เปิดหน้าเดิมอยู่ การมอบหมายผูกกับส่วนงานที่ระบุ
เมื่อย้ายส่วนงานให้ Admin ตรวจและมอบหมายใหม่ตามหน้าที่ ข้อเสนอนี้ให้สิทธิ์เฉพาะงานในขั้นอนุมัติ
โดยใช้ขอบเขตการเข้าถึง BOQ เดิม และคงกติกาลงนาม ล็อกเนื้อหา และตรวจเอกสาร
ก่อนบันทึก

#### เงื่อนไขถอนและหนังสือลงนามไม่ตรงชุด

การถอนใช้กับชุดเสนอที่ยังไม่ลงนาม หากส่งเอกสารออกไปแล้ว ผู้ถอนต้องยืนยัน
กับผู้รับว่าเรียกคืนหรือหยุดใช้ชุดเดิมแล้ว จากนั้นบันทึกเหตุผลพร้อมผู้ถอน
และเวลา หากตรวจไม่ได้ ให้คงสถานะเสนออนุมัติและส่งให้ Admin ประสานส่วนงาน

หากกดถอนและบันทึกผลพร้อมกัน ให้สำเร็จเพียงคำสั่งเดียวตามสถานะและรหัสชุด
ล่าสุด ถ้าถอนสำเร็จก่อน รหัสเดิมใช้บันทึกผลไม่ได้ ถ้าบันทึกผลสำเร็จก่อน
ให้ใช้ขั้นตอน Admin จัดการฉบับใช้งานเมื่อพบว่าบันทึกผิด

ถ้าหนังสือลงนามไม่ตรงกับชุดที่เลือก ให้หยุดก่อนเปลี่ยนสถานะและส่งให้ Admin
ตรวจรหัสชุด เลขที่และวันที่หนังสือ และเนื้อหากับเอกสารจริง

| ผลการตรวจ | ข้อเสนอการจัดการ |
|---|---|
| เลือก BOQ ผิดหรือพิมพ์ข้อมูลอ้างอิงผิดก่อนบันทึก และพบชุดที่ยังอยู่ในสถานะเสนออนุมัติและตรงกับเอกสาร | กลับไปเลือกชุดที่ถูกต้องหรือแก้ข้อมูลอ้างอิงตามต้นฉบับ แล้วให้ผู้มีสิทธิ์บันทึกผลตามขั้นตอน |
| หลักฐานอ้างถึงชุดที่ถอนแล้ว | เก็บรายการถอนและหลักฐานที่เกี่ยวข้อง ให้ Admin ประสานส่วนงานเพื่อออกหนังสือแก้ไขตามขั้นตอนของหน่วยงานหรือให้ลงนามชุดที่ถูกต้อง รหัสที่ถอนแล้วใช้บันทึกผลไม่ได้ |
| รายการ ปริมาณ ราคา หรือยอดต่างกัน หรือหาชุดที่ตรงไม่ได้ | เก็บเหตุผลที่พบและให้ Admin ประสานส่วนงานเพื่อตรวจเอกสาร หากยืนยันชุดที่ตรงไม่ได้หรือประสงค์ใช้เนื้อหาชุดใหม่ ให้จัดทำชุดเสนอที่ถูกต้องและขอลงนามใหม่ |
| กรอกเลขที่หรือวันที่ผิดหลังบันทึก แต่เนื้อหาและชุดที่ลงนามตรงกัน | ให้ Admin แก้เฉพาะข้อมูลอ้างอิง และเก็บค่าเดิม ค่าใหม่ ผู้แก้ เวลา และเหตุผล |
| พบภายหลังว่าบันทึกฉบับใช้งานผิดชุด | ให้ Admin ระงับการใช้ฉบับนั้นสำหรับ TOR พร้อมเหตุผลและเก็บหลักฐานกับประวัติไว้ ฉบับที่จะใช้ต่อเข้าสู่ขั้นตอนบันทึกผลจากเอกสารที่ลงนามตรงกัน |

#### ขอบเขตที่ต้องออกแบบต่อ

- ต้องยืนยันว่า header/routes/items/prices/Catalog/Factor ที่บันทึกเป็นใช้งาน
  ตรงกับเอกสารที่ลงนามจริง ไม่อ้าง mutable BOQ ID อย่างเดียว ระหว่างจัดเอกสาร
  กับบันทึกผลต้องมีวิธีจับการเปลี่ยนเนื้อหาที่เหมาะสมให้ Owner เลือก
  ไม่ถือว่าต้องสร้าง revision package หรือเพิ่ม attachment storage เสมอไป
- แยกบทบาทผู้ลงนามออกจากสิทธิ์บันทึกผลในแอป ออกแบบการตรวจสิทธิ์ตามตาราง
  และการจัดเก็บประวัติการมอบหรือถอนสิทธิ์รายคนและส่วนงาน
- บันทึกเลขที่หนังสือเต็มรวมคำนำหน้าตามที่ปรากฏในเอกสารและวันที่หนังสือ
  โดยรองรับคำนำหน้าตามส่วนงาน และเสนอให้ระบบเก็บบัญชีผู้บันทึก
  กับเวลาบันทึกแยกต่างหาก การแนบเอกสารและวิธีจัดการกรณีหนังสือหนึ่งฉบับอ้างถึง
  หลาย BOQ ยังเป็นรายละเอียดสำหรับตรวจแผน
- ป้องกัน content update ทุกช่องทางรวม direct DML, Save และ server paths
  ห้ามพึ่งเพียงปิดปุ่ม การแก้เนื้อหาใช้ Copy เดิมโดยคงราคา/Catalog/Factor,
  source token, request UUID/recovery และ 031; ไม่สร้างความหมาย revision
  linkage ใหม่ให้ Copy ที่มีอยู่ และ current prices ยังต้อง Create New
- กำหนดวิธีจัดการเมื่อหนังสือลงนามไม่ตรงชุดและเกณฑ์สำหรับ BOQ เก่าที่มี
  เอกสารลงนามแล้ว รวมถึงวิธีที่ Admin เลือกฉบับ
  ที่ใช้ต่อเมื่อมีฉบับใหม่ โดยอ้างอิงเอกสารอนุมัติของฉบับที่จะใช้ต่อ

Viewer สำหรับกรรมการ TOR เสนอให้ดูฉบับใช้งานตาม scope ที่อนุมัติ พร้อมกำหนด
สิทธิ์ print/export ชัดเจนก่อนเปิดใช้ ไม่ใช่ Viewer หลายระดับเพราะมีสามชื่อ
TOR print มีช่องชื่อสามคน/ข้อความเอกสารตามแบบโดยไม่บังคับผูกเป็น accounts
รุ่นแรกเป็นข้อมูลเฉพาะรอบพิมพ์ ไม่บันทึกชื่อกรรมการ/ข้อความเหล่านี้ลงฐานข้อมูล
ส่วน Excel ตารางเปล่าเป็น output ที่แยกออกมาทำก่อน W-H ได้หากไม่อ่านข้อมูล
หรืออ้างสถานะฉบับใช้งาน และไม่ใช่ Excel intake ที่ Owner ให้พักไว้

W1 in-app approval ใช้เฉพาะเมื่อองค์กรโอน authority มาให้แอปโดยยืนยันใหม่
W2 configurable engine, ERP integration, GIS/as-built และ AI รอ use case ที่
มีหลักฐาน ไม่เป็น prerequisite ของ W-H

#### แม่แบบชื่อโครงการ

ปัจจุบันหน้าสร้าง BOQ ให้กรอกชื่อโครงการเป็นข้อความ และ Print ใช้ชื่อที่
บันทึกไว้ ผู้ใช้เสนอให้แยกเป็นสองช่องเพื่อให้ตั้งชื่อไปในรูปแบบเดียวกัน
เมื่อใช้แม่แบบในหน้าสร้างฉบับร่าง

1. **ลักษณะงาน** เลือกจากรายการมาตรฐาน ลักษณะงานที่ Owner ระบุในตอนนี้คือ
   **งานตามแผน**, **งานจุด** และ **งานปรับปรุง**
2. **ชื่อเฉพาะของงาน** กรอกส่วนที่ระบุงานนั้น เช่น “ถนน [ชื่อถนน] ช่วง
   [จุดเริ่มต้น]–[จุดสิ้นสุด]” โดยระบบแนะนำตัวอย่างตามลักษณะงานที่เลือก

ระบบแสดงตัวอย่างชื่อเต็มตามรูปแบบ **[ลักษณะงาน] – [ชื่อเฉพาะของงาน]**
ก่อนบันทึก ผู้ใช้แก้ชื่อเฉพาะได้ระหว่างเป็นฉบับร่าง กรณีมีชื่อทางการที่ต้อง
ใช้ตามเอกสาร ให้ใช้ชื่อทางการนั้นและตรวจชื่อเต็มก่อนบันทึกเป็นฉบับใช้งาน
[หน้าสร้าง BOQ](../../../app/boq/create/page.tsx#L105)
· [หน้า Print](../../../app/boq/[id]/print/page.tsx#L200)

ให้ **Admin จัดการรายการลักษณะงานและแม่แบบชื่อ** ที่ใช้ร่วมกัน ส่วนผู้สร้าง
BOQ เลือกลักษณะงานและกรอกชื่อเฉพาะ รายการหรือแม่แบบที่ปรับใหม่ให้ใช้กับ
การตั้งชื่อครั้งถัดไป ชื่อ BOQ ที่บันทึกแล้วคงตามที่ผู้ใช้ยืนยันไว้

เก็บชื่อที่ผู้ใช้ยืนยันในช่องชื่อโครงการเดิม แสดงสถานะฉบับและเลขอ้างอิง
เอกสารอนุมัติแยกจากชื่อ เมื่อบันทึกเป็นฉบับใช้งาน ชื่อถือเป็นส่วนหนึ่งของ
เนื้อหาที่ตรวจเทียบและล็อกไว้ บันทึกทั้งสามลักษณะเป็นข้อมูลตั้งต้น
Owner จะกำหนดรูปแบบชื่อ ช่องที่ต้องกรอกในแต่ละลักษณะ และขอบเขตชุดที่จะปล่อย
เมื่อเริ่มวางแผนทำแม่แบบ โดยใช้ตัวอย่างชื่อจากงานจริง

## 8. Decision register

| ID | ผู้ตัดสินใจ / เมื่อไร | สิ่งที่ต้องปิด | สถานะ |
|---|---|---|---|
| SEQ | Owner ตรวจแผนก่อนเริ่มชุดถัดไป | เตรียม W-H → ปิดเกณฑ์ตัวเลขที่เกี่ยวข้อง → ปล่อย W-H เมื่อผ่าน → Viewer/TOR → Expression | พัก Admin กำหนดสังกัดจนมีเคสกระทบงานจริง ดู §3 |
| NT | Owner ก่อนขยาย UI ไปหน้าอื่น | exact visual set, genuine logo placement, NT-font pilot, shared-file impact และ rollout paths ตาม #11 | ยืนยันแนวทาง NT ทั้งเว็บและปล่อยเฉพาะหน้า Admin ใน UM-A1 แล้ว ส่วนงานอื่นรอตรวจขอบเขต |
| DEP | Owner ก่อน package release ใหม่ | A8 exact scope ปิดแล้ว; advisory/update ใหม่ต้องตรวจใหม่และแยก approval | CLOSED A `a3114fc`; authority/exception consumed; CI audit scope ยังแยก |
| IT-H | IT + Owner ก่อนเลือก target/release destination | internal data boundary, transition permission, architecture, operations/backup/cutover ownership | TBD; internal-all ยังเป็น assumption |
| IT-I | IT + Owner ก่อน SSO pilot | IdP/protocol/entitlement, provisioning/mapping, assurance/session/offboarding/recovery | TBD; provider/protocol unknown |
| LIST | Owner ก่อน LIST extension ใหม่ | L1 choices/release ปิดแล้ว; L1.1/L2 ต้องเลือกคุณค่า/scope ใหม่ | CLOSED L1 `b1ce4495…`; L1.1/L2 deferred ตาม [Plan #02](./02-boq-list-scaling-decision-plan.md#13-owner-decision-sheet) ไม่เป็น S0 prerequisite |
| S0-F | ขั้นนี้เสร็จแล้ว | writer allowlist สำหรับ direct I/U/D ตาม Security #05 | **CLOSED** สำหรับ focused scope ตาม §2 |
| UM-A | ปิดชุดที่อนุมัติแล้ว | ทะเบียน Admin, ขั้นตอนหลังสมัคร และหน้าช่วยเหลือเมื่อลิงก์ใช้ไม่ได้ | UM-A1 **RELEASED** และ [UM-A2 **CLOSED**](./12-user-management-um-a-and-um-b-plan.md#27-um-a2-production-closeout) |
| UM-B legacy confirmation | Owner ตรวจบัญชีจริงรายแรกแล้ว | ยืนยันตามคำขอเดิม บันทึกเหตุผลและผลต่อสังกัดจริง | **CLOSED** สำหรับรอบแรกตาม §2 |
| UM-B Admin assignment | Owner เมื่อมีเคสกระทบงานจริง | ผู้กำหนดสังกัด หลักฐานที่ใช้ยืนยัน และขอบเขตบัญชีเมื่อคำขอผิด | **พักไว้** [ข้อเสนอเดิม](./12-user-management-um-a-and-um-b-plan.md#21-admin-assignment-for-an-incorrect-affiliation-request) |
| ACCESS GROUPS | Owner ก่อนเลือกกลุ่มแรกหรือแม่แบบสิทธิ์ | สมาชิก ขอบเขต BOQ สถานะเอกสาร การกระทำที่อนุญาต วันสิ้นสุดสิทธิ์ และผลเมื่อมีหลายแหล่งสิทธิ์ | [ทิศทางให้ตรวจ](./12-user-management-um-a-and-um-b-plan.md#22-groups-roles-and-access-scope) กลุ่ม TOR เป็นตัวอย่างหลังขอบเขตฉบับใช้งานและ Viewer พร้อม |
| UM-B / account minimum | Owner + IT ตามเรื่องก่อน trusted changes | การเปิดบัญชีพร้อมบทบาทและสังกัด การแก้หรือย้ายสังกัดเดิม นโยบาย admission/recovery/session/offboarding และ source of truth | รอตัดสินใจตามขอบเขต โดยใช้บัญชีและขั้นตอนเดิมระหว่างรอ |
| D0/D4 | Owner/ผู้รับรองบัญชีก่อน numeric contract | exact rounding stages, precision/zero/max/incomplete-by-action, trusted-write/output fixtures | TBD; R0A ไม่ได้ปิด wider accounting |
| W-H | Owner ตรวจรายละเอียดก่อน implementation | ผู้ลงนามส่วนปฏิบัติการ ตำแหน่งแสดงรหัสชุดและหลักฐานที่ใช้จับคู่ การจัดเก็บเอกสาร การใช้หนังสือกับหลาย BOQ ขอบเขตผู้พิมพ์ และ BOQ เก่า | เลือกแบบ 2 แล้ว [แผน #13 รอตรวจรายละเอียด](./13-boq-operational-workflow-plan.md#wh-owner-decisions) และ [สถานะกลับมาทำต่อ](./13-boq-operational-workflow-plan.md#wh-resume-checkpoint) |
| แม่แบบชื่อโครงการ | Owner เมื่อเริ่มวางแผนทำแม่แบบ | รูปแบบชื่อ ช่องที่ต้องกรอกในแต่ละลักษณะ และขอบเขตชุดที่จะปล่อย | Admin จัดการรายการและแม่แบบ ข้อมูลตั้งต้นคือ งานตามแผน งานจุด และงานปรับปรุง |
| VIEW/TOR | Owner ก่อน role/output candidate | one Viewer scope/status/actions, print/export permissions, exact TOR three-name form และ blank Excel template | Proposed; names ไม่ใช่ roles; operational-only visibility recommendation ยังต้องตัดสินใจ |
| D1/D7/R1-R2 | Owner หลัง wider R0/D0 | editor/mobile scope, parser/persistence/versioning/concurrency and new database authority | DB-1/G1 direction retained; implementation TBD |

### 8.1 Owner deferral of market-research additions — 2026-10-14

หลังการวิเคราะห์ระบบ estimating/BOQ สากล Owner เห็นว่าข้อเสนอใหม่สามข้อ
ยังไม่ให้ประโยชน์เพียงพอในตอนนี้และให้พักไว้ จึงบันทึกเป็น **DEFERRED —
NOT IN NEAR-TERM SCOPE** ไม่เป็น release ใหม่หรือ prerequisite เพิ่ม:

1. นำปริมาณจาก Excel เข้า BOQ พร้อมหน้าตรวจทาน
2. เพิ่มข้อมูลขอบเขตงาน สมมติฐาน และที่มาปริมาณ/แบบ/revision จากข้อเสนอวิจัย
3. เพิ่มรายการตรวจคุณภาพก่อนออกฉบับและมาตรการ stale/concurrent-save จาก
   ข้อเสนอวิจัยรอบนี้

ให้พักคำแนะนำจากบทวิเคราะห์ที่จัด Excel intake หรือ enhancements เหล่านี้
เป็นงานระยะใกล้ คงลำดับใน §3 ของ #09 โดย R1/R2 Quantity Expression
ยังอยู่ในลำดับเสนอเดิม ไม่เพิ่มงานหรือเปลี่ยนชื่อข้อเสนอที่พักไว้เป็นงานบังคับ
การนำกลับมาพิจารณาต้องมีความต้องการจาก Owner และ decision ใหม่

การพักนี้ไม่แก้ runtime หรือยกเลิกกติกาเดิมของ S0, wider R0/D0 และ W-H
เช่น authorization, numeric parity และ immutable operational content ทั้งหมด
ยังเป็นขอบเขตเสนอเดิมที่ต้องตัดสินใจและอนุมัติ implementation แยกกัน
ผลวิจัยและแนวคิดอื่นเก็บไว้ใน #10 โดยมีสถานะ Later/Discovery/Deferred
อย่างชัดเจน ไม่สร้าง gate ใหม่เพื่อแทนที่สามข้อที่พักไว้

## 9. หลักฐานและขั้นถัดไป

การปรับครั้งนี้มีขอบเขตเฉพาะเอกสารในเครื่อง อ้างอิงผลปล่อยที่บันทึกไว้และ
ผลจากหน้า Admin ที่ Owner รายงาน หลักฐาน local/Production ก่อนหน้านี้ยังใช้
ตามขอบเขตที่ระบุในบันทึกของแต่ละชุด
เอกสาร Word สำหรับ IT ถูกจัดทำแยกจาก repository;
สาระ readiness และคำถาม IT อยู่ใน §7 เพื่อให้ repo เป็น handoff ที่ใช้ต่อได้
โดยไม่ขึ้นต่อไฟล์ host-local หรือการย้าย binary เข้า Git

ขั้นถัดไปให้ Owner ตรวจ [แผน BOQ ฉบับร่าง → เสนออนุมัติ → ฉบับใช้งาน](./13-boq-operational-workflow-plan.md)
โดยใช้ตัวอย่างเอกสารลงนามจากงานจริง ขอขอบเขตสำหรับลงมือและทดสอบบน Docker
หลังตรวจแผนและปิดเกณฑ์ตัวเลขที่เกี่ยวข้อง แล้วทบทวนสิทธิ์ Viewer และ
แบบพิมพ์ TOR เมื่อฉบับใช้งานผ่านการตรวจรับ

ใช้ checks ที่เหมาะกับแต่ละงานและรายงานเฉพาะสิ่งที่รันจริง ตรวจรับ candidate
ก่อนขอ source/release approval; ไม่เพิ่ม PR/process โดยไม่มีเหตุผล และไม่
อนุมานว่า local implementation approval อนุญาต commit/push/deploy/database write

**Local documentation checks — 2026-10-24:** ชุดนี้มี Markdown 12 ไฟล์
(แก้เดิม 9 / เพิ่ม 3); `git diff --check` ผ่าน, local relative links 309 จุด
และ Markdown anchors 31 จุดผ่าน Existing documentation contract tests
`master-catalog-admin-edit-completion` และ `master-catalog-authority-consistency`
ผ่าน 28/28 บน Node 24.2.0 ผลเหล่านี้เป็น documentation checks เท่านั้น
ไม่ใช่ app-rendered, Auth/mail, DB-flow, migration หรือ Production PASS
ไม่มี staging/commit/push/deploy จากการปรับแผนนี้

Primary references (ต้องตรวจใหม่ก่อนเลือก version/configuration):

- [Next.js official blog](https://nextjs.org/blog)
- [npm Next latest](https://registry.npmjs.org/next/latest)
- [npm eslint-config-next latest](https://registry.npmjs.org/eslint-config-next/latest)
- [Supabase self-hosting](https://supabase.com/docs/guides/self-hosting)
- [Supabase restore from managed platform](https://supabase.com/docs/guides/self-hosting/restore-from-platform)
- [Supabase SAML account behavior](https://supabase.com/docs/guides/auth/enterprise-sso/auth-sso-saml#user-accounts-and-identities)
- [Supabase session controls](https://supabase.com/docs/guides/auth/sessions)
- [Supabase MFA](https://supabase.com/docs/guides/auth/auth-mfa)
