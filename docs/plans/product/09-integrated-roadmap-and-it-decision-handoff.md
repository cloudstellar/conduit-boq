# Conduit BOQ — Integrated Roadmap and IT Decision Handoff

**Recorded:** 2026-10-14; release/status alignment 2026-10-23;
NT/UM planning alignment 2026-10-24 (Asia/Bangkok)

**Status:** A/B/031 AND LIST-1B L1 CLOSED; NT BRAND DIRECTION CONFIRMED;
FOCUSED S0 → ADMIN-ONLY A1 → PRIORITY UM-B LEGACY AFFILIATION → A2 AUTH
→ REMAINING UM-B PROPOSED;
LOCAL DOCUMENTATION ONLY, WITH PARALLEL IT/SSO DISCOVERY

**Later priority refinement — 2026-11-02:** Owner confirmed having approved the
selected account's affiliation request and requested planning continuation.
A separately approved, completed one-account Production read found active staff,
all actual affiliation IDs NULL, a valid requested hierarchy, and no approval
fields/events in the sources inspected. Keep the Owner report and database
observation separate; the historical cause remains unknown. No personal
identifier/raw response belongs here. That read grant is consumed.
Prioritize the narrow [UM-B legacy-confirmation plan](./12-user-management-um-a-and-um-b-plan.md#15-um-b-priority-legacy-affiliation-confirmation-plan)
after S0/A1, ahead of A2 and broader UM-B. Current authority is local Markdown/
source/document checks only; no SQL, DB/Auth/fixtures, further Production access
or publication. This refines ordering, not old receipts or implementation scope.

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

**Current authority — 2026-10-24:** the Owner requested local planning alignment
for a consistent NT identity across the whole website. This permits Markdown
plan/handoff edits only. It does not approve final designs, application/font/
asset/configuration changes, packages/lockfile, SQL/migrations, fixtures or
account/data/DB operations, Production access, staging, commit/push/deploy or
archive access. The earlier 48-document C publication is closed; local HEAD
`67c1e6fbf80da77d5bb6d6e115d3fa06016611b5` is the observed documentation
baseline, not a fresh remote or Production inspection. Nine unpublished local
parity tooling/baseline files remain separate and unchanged. Older approvals
are consumed receipts, not standing authority.

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
| NT brand ทั้งเว็บ | Owner ยืนยันให้หน้าตาทั้งเว็บใช้อัตลักษณ์ NT ร่วมกัน โดยอ้างอิง Master Catalog | Approved direction / local planning; exact visual set, font pilot, shared files และ implementation ยังไม่อนุมัติ |
| บัญชี active แต่แสดง “(ขอ)” | Owner ยืนยันว่าเคยอนุมัติคำขอแล้ว; read-only หนึ่งบัญชี 2026-11-02 ยืนยัน actual affiliation NULL / requested hierarchy ถูกต้อง / ไม่พบ approval fields หรือ events ในแหล่งที่ตรวจ | UM-A1 แสดงตามจริง; ยก narrow UM-B legacy confirmation ก่อน A2; ยังไม่ทราบสาเหตุย้อนหลัง ไม่ auto-assign หรือถือว่าไม่เคยอนุมัติ |
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

- Migrations 027–031 immutable/no-replay ห้ามแก้หรือ replay
  การเปลี่ยนฐานข้อมูลในอนาคตต้องอนุมัติใหม่และใช้ forward migration ใหม่
- ห้ามแตะ Catalog, Factor F, BOQ data, accounts หรือ Production ในงานเอกสารนี้
- ห้ามตรวจ แก้ ย้าย ลบ หรือแชร์ protected archive
- ไม่ตรวจ live Production ในการจัด roadmap; ผล PASS ข้างต้นอ้างอิง receipt เดิม
- ก่อนจัดทำแผนเดิมวันที่ 2026-10-14 local Git สะอาดบน main; HEAD, upstream และ local
  origin/main tracking ref เท่ากับ `b144bcae98b543ab231c503f435f261f946b9f89`,
  ahead/behind 0/0 และ local branch มีเพียง main นี่เป็น dated local observation
  ไม่ใช่ live remote/deployment guarantee; หลังบันทึกเอกสาร worktree จะมี local diff

## 3. ลำดับที่เสนอและเงื่อนไขเปลี่ยนลำดับ

```text
Completed: dependency A -> B client/031/B closeout -> LIST-1B L1

Next proposed: focused S0 direct-write role boundary
  -> UM-A1 Admin directory/details + scoped NT pilot, shared Auth unchanged
  -> UM-B narrow legacy affiliation confirmation (separate reviewed scope;
     active staff/all actual IDs NULL/valid requested hierarchy;
     audit/outcome contract selected in plan; positive real-API fixture HOLD,
     approved local eligible-shape count0/0/0)
  -> UM-A2 signup/confirmation/pending follow-up under a separate reviewed scope
  -> remaining UM-B trusted transitions + account-security minimum
  -> wider R0/D0 accounting and trusted-write contract
  -> W-H draft -> operational from real-paper approval, with immutable content
  -> scoped Viewer + TOR print / blank Excel as separately selected outputs
  -> R1/R2 Quantity Expression

NT sitewide rollout: pilot -> remaining profile/Admin -> BOQ list/editor
  -> other web surfaces, in small approved releases alongside business priorities
  (exports have separate acceptance; no mandatory full-site restyle first)

IT hosting + SSO discovery เริ่มตอนนี้ควบคู่กับการตัดสินใจข้างต้น
  -> IT-approved target -> infrastructure rehearsal -> controlled cutover
  -> confirmed IdP + account continuity -> SSO pilot -> controlled rollout
```

“ควบคู่” หมายถึงประสาน IT และปิด decision ที่ไม่ขึ้นต่อกัน ไม่ได้แนะนำให้
Owner เปิดหลาย implementation/release พร้อมกัน ทั้ง hosting และ SSO ต้องมี
เกณฑ์รับรองแยกกัน แม้ IT อาจจัดให้อยู่ในโครงการหรือช่วงเวลาเดียวกัน

- ถ้า IT ยืนยันว่าปัจจุบันห้ามใช้ cloud ให้เลื่อน internal cutover เป็นงาน
  เร่งด่วนและรอปล่อย feature บน environment ที่อนุญาต ยังไม่มีคำยืนยันนี้
- L1 ปิดแล้วโดยไม่ขึ้นต่อ DB-1/Expression; L1.1/L2 ไม่แทรกก่อน S0 โดยอัตโนมัติ
  งานใหม่ต้องอนุมัติ scope/release destination ภายใต้เงื่อนไข IT ที่ยืนยันแล้ว
- S0 permission/write-boundary baseline และ D0 numeric integrity ต้องพร้อม
  ก่อนออกฉบับที่อ้างเป็นเอกสารใช้งานอย่างมี authority
- แก้ focused S0 ตาม [แผนแยก](../security/05-s0-boq-writer-boundary-plan.md)
  ก่อนปล่อย optional UM-A UX; ไม่รอ SSO หรือเปลี่ยนหน้าตาครบเว็บ
  การยืนยัน fresh local behavior และ SQL/test scope ยังต้องอนุมัติใหม่
- NT-0 เป็นงานเอกสารปัจจุบัน; เริ่ม scoped NT presentation บน /admin ใน A1
  โดย reuse primitives/assets ไม่แก้ global fonts/tokens/shared primitives
  ไม่ต้องทำ shared foundation ทั้งเว็บก่อนเริ่ม และไม่เปลี่ยนสิทธิ์/ตัวเลข/output
- UM-A1 เริ่มหลังบ้านเฉพาะทะเบียน/รายละเอียดอ่านอย่างเดียว/ป้ายสังกัด และคง
  existing RPC semantics/Catalog gate พร้อมอ่านค่าจริงกลับหลังคำสั่ง ส่วน Login/callback/middleware/session/
  domain policy/pending/profile คงเดิม UM-A2 จึงค่อยทำ signup/confirmation/
  pending ภายใต้ scope ทดสอบผู้ใช้เดิมแยก ไม่เรียกรวมว่า back-office-only
- การเลือก role+สังกัดก่อน activate และยืนยันสังกัดบัญชีเดิมเป็น trusted
  UM-B แยก ไม่ซ่อนเป็นการแก้ป้าย UI หรือเปลี่ยนบัญชีบน load/navigation/retry
- Viewer ต้องปิด status/scope/print/export matrix และทดสอบการห้ามเขียนทุก
  entry point ก่อนเปิดใช้ การมองเห็นเฉพาะฉบับใช้งานเป็นข้อเสนอสำหรับ TOR
  จึงรอ W-H ที่เกี่ยวข้อง; แบบ Excel เปล่าอาจทำก่อนหากแยกจากสถานะ/ข้อมูล BOQ
- W-H ไม่ต้องรอ Expression; การแก้สูตรเป็นงาน productivity ถัดจากความถูกต้อง
- SSO ไม่จำเป็นต้องปิดก่อนทุก feature เว้นแต่นโยบาย IT บังคับ ต้องรักษา
  authorization ของบัญชีปัจจุบันระหว่างรอและไม่ใช้การรอ SSO เลื่อน security defect
- หากพบ security defect ใหม่ที่เร่งด่วน ให้ประเมินลำดับใหม่ตามหลักฐาน
  ไม่รวมการแก้โดยไม่มี approval เข้ากับ release อื่น

## 4. Work packages, ความเสี่ยง และเกณฑ์ผ่าน

| งาน | Local-only candidate หลังอนุมัติใหม่ | ความยาก / ความเสี่ยง | เกณฑ์ผ่านก่อนขอ release |
|---|---|---|---|
| Focused S0 | [แผน writer boundary](../security/05-s0-boq-writer-boundary-plan.md): reproduce local mismatch แล้วเสนอเก้า restrictive I/U/D guards บนสาม BOQ tables โดยคง SELECT/scope/Save/Copy/031 | กลาง–สูง: ปิดช่อง procurement direct DML แล้วเผลอบล็อก writer หรือ read เดิม | ตรวจ exact metadata; synthetic direct API negative/positive matrix, no-residue และ Save/Copy regression; SQL/local DDL ต้องอนุมัติใหม่ ไม่ถือว่าปิด wider S0 ทั้งหมด |
| NT foundation / rollout | [#11](./11-nt-brand-system-and-sitewide-ui-rollout-plan.md): Master Catalog pattern, genuine assets, token/font pilot และขยายทีละ surface | กลาง: shared CSS/font กระทบหลายหน้า, Thai wrapping, asset provenance | exact affected paths, Thai/font/contrast/mobile/keyboard QA และ business regression; ไม่เปลี่ยน Print/PDF/Excel incidentally |
| UM-A1 Admin first | [#12](./12-user-management-um-a-and-um-b-plan.md): cursor directory/read-only detail, actual/requested labels, model เดียวและ scoped NT presentation/font เดิม; คง Auth/domain/global UI/RPC semantics | กลาง: wrong target ระหว่าง paging, raw IDs/ชื่อ/audit ขัดกัน, shared style หลุด scope | synthetic >100, request26/show25, truthful page counts, lookup errors/cap, canonical reread หลังคำสั่งรวม reread failure, Catalog gate/legacy fallback และ current-user regression; ไม่มี auto account writes หรือ shared Auth diff |
| Priority UM-B legacy affiliation | [#12§15–17](./12-user-management-um-a-and-um-b-plan.md#174-approved-count-result--2026-11-02): active staff/all actual IDs NULL/valid requested hierarchy; confirm only, role/status unchanged | กลาง–สูง: visibility เพิ่มได้ และ fixture หลักสร้างใหม่ผ่าน flow เดิมไม่ได้ | Audit/outcome contract selected in plan; local count0/0/0 completedREADONLY; positive fixture HOLD, no new schema/fixture authority; ordinary approval persistence regression mandatory |
| UM-A2 Auth follow-up | Signup/session/confirmation/error/resend และ pending/resubmit บน backend เดิมภายใต้ scope ใหม่ | กลาง: callback/session/recovery กระทบผู้ใช้ทั่วไป | config relevance, short username/full email, cookies/redirect/blocked regression, expired links และ mail delivery แยกจาก UI PASS; ไม่รวมใน A1 |
| Remaining UM-B + account-security minimum | trusted atomic role+org activation, broader affiliation/role transitions; reviewed-state conflict/replay/legacy compatibility และ admission/recovery/session/offboarding ตาม policy | สูง: visibility/privilege เปลี่ยน, concurrent overwrite, lockout | approved role/scope/transition matrix, server conflict guard/current state/audit/idempotency, no temporary wrong role, least privilege, bounded recovery/revocation evidence; ไม่อาศัย UI refresh/row lock/email metadata แทน reviewed-state contract |
| Wider R0/D0 | ปิด rounding/precision/zero/max/incomplete-by-action; trusted numeric write และ fixture harness บน baseline ที่อนุมัติ | สูงด้านตัวเลข: Save/reload/output ไม่ตรงกัน | Owner-approved vectors ตรงตั้งแต่ component/item/route/BOQ ถึง Save/reload/Print/PDF/Excel; tampered/inconsistent writes ถูกปฏิเสธแบบ atomic |
| W-H | บันทึก real-paper approval ของ exact BOQ content เป็น operational; ปิดทุก write path ของ content; ใช้ Copy เดิมไป draft อิสระเมื่อต้องแก้ | กลาง–สูง: ลงนามคนละเนื้อหา, issued data เปลี่ยนได้, recorder authority สับสน | อนุมัติ recorder/evidence minimum และ error/legacy policy; exact content match, lock/denial ครบ, concurrent status actions และ unchanged Copy; ไม่บังคับ revision/supersede engine |
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
- UM-A2 เสนอใช้ signup/login/recovery/confirmation เดิมและ explicit resend ของ SDK
  ไม่เพิ่ม Invite/pre-provision, password/MFA engine หรือ admission policy ใหม่
  ตรวจ hosted confirmation/SMTP/redirect/delivery ภายใต้ approval แยกภายหลัง
  ผล request accepted ไม่เท่ากับส่งถึงหรือยืนยัน email แล้ว
- UM-A1 ไม่แก้การตรวจโดเมน ค่า setting ปัจจุบัน หรือ shared Auth/session
  กลไกโดเมนเดิมครอบคลุม login/recovery/protected web access ด้วย ไม่ใช่แค่
  ผู้สมัครใหม่ และไม่ใช่ Auth ban/direct-API revocation ต้องปิด decision แยก
  ก่อนเปลี่ยนจริงเพื่อป้องกัน lockout; actual hosted values/hooks ยังไม่ตรวจใหม่
- suspend/deactivate ที่บล็อก business access ไม่เท่ากับ session revocation
  ต้องกำหนดและทดสอบทั้งการเข้าถึงและการ refresh ตาม SLA
- UI checks เป็นเพียง UX; trusted API/RPC/grants/RLS/protected columns ต้อง
  enforce current active profile + role + scope + exact action ตามกติกาเดียวกัน
- พัฒนาทะเบียนเดิมแทนสร้าง approve/reject/role/suspend workflow ซ้ำ
  [Admin UI](../../../app/admin/page.tsx) เรียกเพียง 100 รายการแรกด้วย null cursor
  แต่ RPC รองรับ cursor แล้ว UM-A เสนอ request26/show25 และ Back/Next
  ไม่เพิ่ม whole-directory search/filter/count ที่ backend ยังไม่รองรับ
  legacy fallback ต้องแสดงข้อจำกัดของ projection และคง read-only
- แยก email verification, application status, actual affiliation และ requested
  affiliation ออกจากกัน การวินิจฉัยหนึ่งบัญชีที่อนุมัติก่อนหน้านี้อธิบาย
  active+actual NULL+requested valid ไม่พิสูจน์ว่าทุกบัญชีเหมือนกันหรือใคร
  เป็นผู้เปลี่ยนในอดีต ห้ามเก็บ PII/raw result ในแผนหรือขยาย Production read
- UM-A แก้ป้ายและข้อมูลแสดงผลตามจริง ไม่ auto-copy requested values ไป actual,
  ลดสิทธิ์หรือบังคับ onboarding บัญชี active เพราะสังกัดว่าง ระดับฝ่าย/Admin
  ไม่ได้ต้องมี sector เสมอ UM-B จึงค่อยเสนอ trusted confirmation พร้อมผลต่อ
  scope และ audit; ทั้งสองชุดต้องคง approved post-S0 role boundary
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

### W-H: ฉบับใช้งานจากเอกสารลงนามจริง

**ปรับตาม Owner — 2026-10-24:** เสนอ flow ขั้นต่ำเป็น
ร่าง → บันทึกการอนุมัติจากเอกสารจริง → ฉบับใช้งานที่แก้เนื้อหาไม่ได้
เมื่อต้องแก้ ใช้ **Copy เดิม → BOQ ฉบับร่างใหม่แยกอิสระ**
ไม่บังคับ revision chain, source link, numbering engine หรือ supersede workflow
เพื่อเริ่มงานนี้ ชื่อ status/transition/schema/RPC ยังไม่อนุมัติ implementation

- ต้องยืนยันว่า header/routes/items/prices/Catalog/Factor ที่บันทึกเป็นใช้งาน
  ตรงกับเอกสารที่ลงนามจริง ไม่อ้าง mutable BOQ ID อย่างเดียว ระหว่างจัดเอกสาร
  กับบันทึกผลต้องมีวิธีจับการเปลี่ยนเนื้อหาที่เหมาะสมให้ Owner เลือก
  ไม่ถือว่าต้องสร้าง revision package หรือเพิ่ม attachment storage เสมอไป
- แยกผู้ลงนามจริง (ผู้จัดการส่วนวิศวกรรมท่อร้อยสาย) ออกจากผู้บันทึกในแอป
  การบันทึกหลักฐานไม่สร้าง authority อนุมัติในแอปโดยอัตโนมัติ
- เลือก evidence minimum เช่น วันที่อนุมัติและเลขอ้างอิงเอกสาร พร้อม recorder/time
  และ reason/audit ที่เหมาะสมตาม policy; file upload ไม่ใช่ข้อบังคับ release แรก
- ป้องกัน content update ทุกช่องทางรวม direct DML, Save และ server paths
  ห้ามพึ่งเพียงปิดปุ่ม การแก้เนื้อหาใช้ Copy เดิมโดยคงราคา/Catalog/Factor,
  source token, request UUID/recovery และ 031; ไม่สร้างความหมาย revision
  linkage ใหม่ให้ Copy ที่มีอยู่ และ current prices ยังต้อง Create New
- เลือกวิธีแก้การบันทึกอนุมัติผิดและรับรอง BOQ เก่าที่มีเอกสารแล้วโดยไม่แก้
  content ย้อนหลังหรือ promote drafts อัตโนมัติ รวม audit/current-state guards
  และ concurrent action tests เท่าที่จำเป็น ไม่บังคับเครื่อง supersede เต็มระบบ

Viewer สำหรับกรรมการ TOR เสนอให้ดูฉบับใช้งานตาม scope ที่อนุมัติ พร้อมกำหนด
สิทธิ์ print/export ชัดเจนก่อนเปิดใช้ ไม่ใช่ Viewer หลายระดับเพราะมีสามชื่อ
TOR print มีช่องชื่อสามคน/ข้อความเอกสารตามแบบโดยไม่บังคับผูกเป็น accounts
รุ่นแรกเป็นข้อมูลเฉพาะรอบพิมพ์ ไม่บันทึกชื่อกรรมการ/ข้อความเหล่านี้ลงฐานข้อมูล
ส่วน Excel ตารางเปล่าเป็น output ที่แยกออกมาทำก่อน W-H ได้หากไม่อ่านข้อมูล
หรืออ้างสถานะฉบับใช้งาน และไม่ใช่ Excel intake ที่ Owner ให้พักไว้

W1 in-app approval ใช้เฉพาะเมื่อองค์กรโอน authority มาให้แอปโดยยืนยันใหม่
W2 configurable engine, ERP integration, GIS/as-built และ AI รอ use case ที่
มีหลักฐาน ไม่เป็น prerequisite ของ W-H

## 8. Decision register

| ID | ผู้ตัดสินใจ / เมื่อไร | สิ่งที่ต้องปิด | สถานะ |
|---|---|---|---|
| SEQ | Owner ก่อนเปิด candidate ถัดไป | S0 → Admin-only A1 → narrow UM-B legacy affiliation → A2 Auth → remaining UM-B/account minimum → R0/D0 → W-H → Viewer/TOR → Expression; full-site branding เป็น incremental stream | 2026-11-02 priority planning refinement; no implementation/release authority; fixture gate และ IT policy อาจเปลี่ยน execution timing |
| NT | Owner ก่อน visual/code candidate | exact visual set, genuine logo placement, NT-font pilot, shared-file impact และ rollout paths ตาม #11 | Whole-site NT direction CONFIRMED; final designs/code/assets/fonts/releases NOT APPROVED |
| DEP | Owner ก่อน package release ใหม่ | A8 exact scope ปิดแล้ว; advisory/update ใหม่ต้องตรวจใหม่และแยก approval | CLOSED A `a3114fc`; authority/exception consumed; CI audit scope ยังแยก |
| IT-H | IT + Owner ก่อนเลือก target/release destination | internal data boundary, transition permission, architecture, operations/backup/cutover ownership | TBD; internal-all ยังเป็น assumption |
| IT-I | IT + Owner ก่อน SSO pilot | IdP/protocol/entitlement, provisioning/mapping, assurance/session/offboarding/recovery | TBD; provider/protocol unknown |
| LIST | Owner ก่อน LIST extension ใหม่ | L1 choices/release ปิดแล้ว; L1.1/L2 ต้องเลือกคุณค่า/scope ใหม่ | CLOSED L1 `b1ce4495…`; L1.1/L2 deferred ตาม [Plan #02](./02-boq-list-scaling-decision-plan.md#13-owner-decision-sheet) ไม่เป็น S0 prerequisite |
| S0-F | Owner ก่อน SQL/local reproduction | writer allowlist บน direct I/U/D, exact predecessor, synthetic local fixture/cleanup scope ตาม Security #05 | Source/captured-metadata gap confirmed; fresh behavior NOT RUN; no SQL/DDL approval |
| UM-A | Owner ก่อน named application candidate/release | A1 Admin-only directory/details/NT pilot, คง shared Auth/global styles/RPC semantics; A2 signup/callback/pending เป็น scope แยกหลัง narrow legacy confirmation ตามลำดับเสนอ | A1 local functional/visual evidence recorded; publication NOT APPROVED; no auto repair; A2 remains proposed and hosted mail unverified |
| UM-B legacy confirmation | Owner ก่อน implementation approval | active staff/all actual IDs NULL/valid requested hierarchy; Admin authority, reviewed-state/idempotency, structured audit and faithful positive local fixture ตาม #12§15–17 | AUDIT CONTRACT DEFINED IN PLAN / POSITIVE FIXTURE HOLD; approvedlocalcount0/0/0/readgrantconsumed; no SQL/fixture/furtherDB/Production approval; not a full UM-B or role redesign |
| UM-B / account minimum | Owner + IT ตามเรื่องก่อน trusted changes | role+org activation, legacy org confirmation, current-state/audit, admission/recovery/session/offboarding/source of truth | TBD; reuse existing account workflow, no auto-repair or automatic SSO grants |
| D0/D4 | Owner/ผู้รับรองบัญชีก่อน numeric contract | exact rounding stages, precision/zero/max/incomplete-by-action, trusted-write/output fixtures | TBD; R0A ไม่ได้ปิด wider accounting |
| W-H | Owner ก่อน operational candidate | recorder/delegation, exact signed-content match, evidence minimum, all-path content lock, erroneous-record/legacy policy | Real-paper manager authority and ordinary Copy→independent draft direction CONFIRMED; remaining decisions/implementation TBD; no mandatory revision engine |
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

การปรับเอกสารครั้งนี้อ้าง facts และ existing release receipts ไม่ติดตั้ง
Supabase/บริการ ไม่ทดสอบ runtime/Production สดและไม่เปลี่ยนระบบ หลักฐาน
local/Production executions ก่อนหน้านี้คงขอบเขตตาม receipts ของตน
เอกสาร Word สำหรับ IT ถูกจัดทำแยกจาก repository;
สาระ readiness และคำถาม IT อยู่ใน §7 เพื่อให้ repo เป็น handoff ที่ใช้ต่อได้
โดยไม่ขึ้นต่อไฟล์ host-local หรือการย้าย binary เข้า Git

ขั้นถัดไปหลัง docs alignment: ให้ Owner ตรวจ focused S0 scope และแผน NT/UM-A
พร้อมกันในเชิงวางแผน แล้วอนุมัติ candidate เล็กทีละชุดตาม §3 ไม่รวม SQL
เข้ากับ optional UX/branding release ขอบเขตแรกคือ Admin-only A1 พร้อม scoped
NT presentation โดยคง shared Auth/global styles/RPC semantics และเพิ่ม canonical reread ส่วน signup/
callback/pending อยู่ A2 ภายหลัง; หน้าที่เหลือทยอยตามมาหลังตรวจรับ
IT ตอบ hosting/SSO คู่ขนานก่อนเลือก protocol/target ไม่เริ่ม code, SQL,
fixture/account operations หรือ global font swap จาก roadmap นี้

ใช้ completion/retained-limit register ใน #12 เพื่อไม่ปิดงาน UM ทั้งหมดจาก A1
หรือเลื่อน data consistency ที่จำเป็นไปแบบไม่มีกำหนด คง release เล็กตาม
ขอบเขตจริง ไม่สร้างตาราง/framework/roles เพิ่มเพื่อรองรับสิ่งที่ IT ยังไม่ยืนยัน

UM-B เป็นจังหวะเสนอแก้ actual affiliation ที่ยังว่างผ่าน trusted transition
ไม่รอให้เปลี่ยนหน้าตาครบเว็บและไม่ทำเป็น automatic data cleanup ส่วน wider
R0/D0, W-H, Viewer/TOR และ Expression ปิด decisions/อนุมัติของตนตามลำดับ
ตรวจแบบ TOR/Excel ก่อนเสนอ output scope โดยคง accepted output เดิมทั้งหมด

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
