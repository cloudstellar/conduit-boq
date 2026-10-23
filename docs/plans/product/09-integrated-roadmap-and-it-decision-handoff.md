# Conduit BOQ — Integrated Roadmap and IT Decision Handoff

**Recorded:** 2026-10-14; release/status alignment 2026-10-23 (Asia/Bangkok)

**Status:** A/B/031 AND LIST-1B L1 CLOSED; REMAINING ROADMAP PROPOSED;
S0/USER MINIMUM NEXT, WITH PARALLEL IT/SSO DISCOVERY

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

**Current authority:** the Owner approved local editing of the named 48 Markdown
documents only. No new implementation, package/lockfile, schema/RPC/migration,
account/data, DB/Production, stage/commit/push/deploy or archive operation is
authorized. Older implementation/publication approvals are completed receipts,
not standing authority. IT hosting/SSO policy and future product decisions
remain open as specified below.

เอกสารนี้เป็นจุดอ้างอิงหลักสำหรับ **ลำดับงานและเงื่อนไขการตัดสินใจปัจจุบัน**
โดย supersede เฉพาะคำแนะนำด้านลำดับ, provisioning/SSO และการค้นหา BOQ
approval authority ใน [Product Plan #01](./01-conduit-boq-product-evolution-decision-plan.md)
ส่วนรายละเอียดเทคนิคและทางเลือกเดิมยังใช้อ้างอิงได้ตามข้อจำกัดของแต่ละส่วน
เอกสาร release result ทั้งหมดคงเป็นหลักฐานตามเวลาที่บันทึก ไม่แก้ chronology
หรือถือว่า approval ที่ใช้แล้วอนุญาตงานใหม่

แนวคิดเดิมที่ย่อไว้และผลเทียบระบบสากลเก็บใน
[Research / Capability Backlog #10](./10-global-estimating-research-and-capability-backlog.md)
เพื่อค้นคืนได้ ไม่เปลี่ยนลำดับหรือเพิ่ม implementation scope ตาม backlog

## 1. ข้อเท็จจริง ข้อเสนอ และสิ่งที่ยังไม่ทราบ

| ประเด็น | สิ่งที่ทราบ | สถานะการตัดสินใจ |
|---|---|---|
| ผู้ดูแล | Owner ดูแลระบบคนเดียว | ใช้ release เล็กที่ตรวจรับได้ ไม่เพิ่ม PR/process โดยไม่มีเหตุผล |
| BOQ ฉบับใช้งาน | Owner ยืนยันว่าได้รับอนุมัติจากเอกสารจริง โดยผู้จัดการส่วนวิศวกรรมท่อร้อยสาย | ข้อเท็จจริงของกระบวนการธุรกิจ; W-H เป็นแนวทางเสนอ ยังไม่อนุมัติ implementation |
| Organizational SSO | องค์กรมี SSO และ Owner ต้องการเชื่อม | ยังไม่ทราบผู้ให้บริการ, protocol, attributes, licensing และผู้ประสานงาน |
| Internal hosting | Owner คาดว่า IT อาจให้ย้ายทั้งระบบภายในเพราะความกังวลเรื่องข้อมูลส่วนบุคคล | สมมติฐานเบื้องต้น ยังไม่ใช่นโยบายที่ IT ยืนยัน หรือหลักฐาน compliance |
| User management | มี profile/organization, 5 roles, approve/reject, suspend/deactivate/reactivate และ authorization audit เดิม | ต้องกำหนด provisioning, source of truth, offboarding/session และสิทธิ์ใหม่ให้ตรงนโยบาย |
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

Next proposed: S0 + user-management minimum
  -> wider R0/D0 accounting and trusted-write contract
  -> W-H frozen revision + external signed-paper evidence
  -> R1/R2 Quantity Expression
  -> revision diff / reporting / downstream handoff ตามหลักฐานการใช้งาน

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
- W-H ไม่ต้องรอ Expression; การแก้สูตรเป็นงาน productivity ถัดจากความถูกต้อง
- SSO ไม่จำเป็นต้องปิดก่อนทุก feature เว้นแต่นโยบาย IT บังคับ ต้องรักษา
  authorization ของบัญชีปัจจุบันระหว่างรอและไม่ใช้การรอ SSO เลื่อน security defect
- หากพบ security defect ใหม่ที่เร่งด่วน ให้ประเมินลำดับใหม่ตามหลักฐาน
  ไม่รวมการแก้โดยไม่มี approval เข้ากับ release อื่น

## 4. Work packages, ความเสี่ยง และเกณฑ์ผ่าน

| งาน | Local-only candidate หลังอนุมัติใหม่ | ความยาก / ความเสี่ยง | เกณฑ์ผ่านก่อนขอ release |
|---|---|---|---|
| S0 minimum | permission matrix และ trusted boundaries; admission แยกจาก login/recovery; privileged assurance/session/offboarding ตาม policy | กลาง–สูง: bypass, lockout, session ยังใช้ได้หลังปิดบัญชี | direct API/RPC tests ทุก persona, recovery/expired links, revocation SLA, approved emergency recovery; ไม่สมมติ corporate MFA เป็น Supabase AAL2 |
| User-management usability | ต่อทะเบียนเดิมด้วย pagination/search/filter ที่อนุมัติ; rejection/resubmission และ audit history ชัด | ต่ำ–กลาง: หารายการไม่ครบหรือเปิดเผยข้อมูลเกิน scope | ทะเบียนเกิน 100 รายการเข้าถึงครบตามสิทธิ์; count/search ครอบคลุมผลทั้งหมด; เหตุผลและ actor/time ถูกต้อง |
| Wider R0/D0 | ปิด rounding/precision/zero/max/incomplete-by-action; trusted numeric write และ fixture harness บน baseline ที่อนุมัติ | สูงด้านตัวเลข: Save/reload/output ไม่ตรงกัน | Owner-approved vectors ตรงตั้งแต่ component/item/route/BOQ ถึง Save/reload/Print/PDF/Excel; tampered/inconsistent writes ถูกปฏิเสธแบบ atomic |
| W-H | แยก candidate 1: frozen revision/package; candidate 2: external approval evidence/status/reconciliation | กลาง–สูง: ลงนามคนละฉบับ, mutable issued data, authority สับสน | หลักฐานผูก exact immutable revision; เลขฉบับ/สถานะ output ชัด; correction สร้างฉบับใหม่; ทดลอง supersede/void และ concurrent/stale actions |
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
และสิทธิ์ business action กติกาข้อมูล/สิทธิ์ออกแบบได้ก่อนทราบ IdP แต่ยังไม่สร้าง
ตารางหรือ RPC ในงานเอกสาร และยังไม่ตรึง protocol หรือวิธี provision

- Owner/IT ต้องกำหนด source of truth ของชื่อ รหัสพนักงาน สังกัด และกลุ่มสิทธิ์
  รวม joiner/mover/leaver, contractors/procurement และคนที่รับรองการเปลี่ยนสิทธิ์
- คงความเชื่อมโยง `user_profiles.id`, `boq.created_by`, `boq.assigned_to`
  ซึ่งอ้าง Auth UUID; การเปลี่ยนตัวตนต้องมี mapping/migration ที่อนุมัติใหม่
  ห้ามรวมบัญชีอัตโนมัติด้วย email หรือถือว่าบัญชี SSO เชื่อมบัญชี password เอง
- อย่าสร้าง Invite/pre-provision หรือ native password/MFA UX เต็มระบบก่อนเลือก
  admission/authenticator เป้าหมาย อาจใช้ bridge แบบเล็กเมื่อมีเหตุผลและอนุมัติ
- suspend/deactivate ที่บล็อก business access ไม่เท่ากับ session revocation
  ต้องกำหนดและทดสอบทั้งการเข้าถึงและการ refresh ตาม SLA
- UI checks เป็นเพียง UX; trusted API/RPC/grants/RLS/protected columns ต้อง
  enforce current active profile + role + scope + exact action ตามกติกาเดียวกัน
- พัฒนาทะเบียนเดิมแทนสร้าง approve/reject/role/suspend workflow ซ้ำ
  [Admin UI](../../../app/admin/page.tsx) เรียกเพียง 100 รายการแรกด้วย null cursor;
  ต้องประเมินขอบเขต search/pagination ที่เหมาะสมโดยยังไม่สำรวจ accounts จริง

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

เสนอ flow: ร่าง -> ตรึงฉบับส่งลงนาม -> บันทึกหลักฐานเป็นฉบับใช้งาน ->
ถูกแทนที่/ยกเลิก ชื่อสถานะและ transition ยังไม่ใช่ schema ที่อนุมัติ

- หลักฐานต้องผูก header/routes/items/prices/Catalog/Factor ของ revision เดียว
  ไม่อ้างถึง mutable BOQ ปัจจุบันด้วย ID อย่างเดียว
- แยกผู้ลงนามจริง (ผู้จัดการส่วนวิศวกรรมท่อร้อยสาย) ออกจากผู้บันทึกในแอป
  การบันทึกหลักฐานไม่สร้าง authority อนุมัติในแอปโดยอัตโนมัติ
- กำหนดเลขฉบับ, วันที่อนุมัติ, document reference/attachment ตาม policy,
  recorder/time, access และ retention; ไม่ถือว่าต้องมี upload ใน release แรก
- Correction สร้าง draft/revision ใหม่และอ้างฉบับก่อนหน้า; ห้ามแก้ issued
  revision ย้อนหลัง; ทดสอบ reconciliation ระหว่างเอกสารและสถานะในแอป
- BOQ เก่าที่มีเอกสารอนุมัติแล้วต้องมี policy รับรองแยก ไม่ promote drafts
  อัตโนมัติ และไม่อ้าง ordinary Copy เป็น revision workflow

W1 in-app approval ใช้เฉพาะเมื่อองค์กรโอน authority มาให้แอปโดยยืนยันใหม่
W2 configurable engine, ERP integration, GIS/as-built และ AI รอ use case ที่
มีหลักฐาน ไม่เป็น prerequisite ของ W-H

## 8. Decision register

| ID | ผู้ตัดสินใจ / เมื่อไร | สิ่งที่ต้องปิด | สถานะ |
|---|---|---|---|
| SEQ | Owner ก่อนเปิด candidate ถัดไป | รับหรือปรับ remaining sequence และ scope S0/user minimum; IT discovery คู่ขนาน | S0 NEXT PROPOSED; local docs only, no implementation authority |
| DEP | Owner ก่อน package release ใหม่ | A8 exact scope ปิดแล้ว; advisory/update ใหม่ต้องตรวจใหม่และแยก approval | CLOSED A `a3114fc`; authority/exception consumed; CI audit scope ยังแยก |
| IT-H | IT + Owner ก่อนเลือก target/release destination | internal data boundary, transition permission, architecture, operations/backup/cutover ownership | TBD; internal-all ยังเป็น assumption |
| IT-I | IT + Owner ก่อน SSO pilot | IdP/protocol/entitlement, provisioning/mapping, assurance/session/offboarding/recovery | TBD; provider/protocol unknown |
| LIST | Owner ก่อน LIST extension ใหม่ | L1 choices/release ปิดแล้ว; L1.1/L2 ต้องเลือกคุณค่า/scope ใหม่ | CLOSED L1 `b1ce4495…`; L1.1/L2 deferred ตาม [Plan #02](./02-boq-list-scaling-decision-plan.md#13-owner-decision-sheet) ไม่เป็น S0 prerequisite |
| UM/S0 | Owner + IT ก่อน security changes | role/scope matrix, source of truth, joiner/mover/leaver, recorder authority, revocation/recovery | TBD; reuse existing account workflow |
| D0/D4 | Owner/ผู้รับรองบัญชีก่อน numeric contract | exact rounding stages, precision/zero/max/incomplete-by-action, trusted-write/output fixtures | TBD; R0A ไม่ได้ปิด wider accounting |
| W-H | Owner ก่อน frozen/issued package | revision numbering, recorder/delegation, evidence minimum, output status, corrections/void/supersede, legacy policy | External paper authority confirmed; design/implementation TBD |
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
เช่น authorization, numeric parity และ immutable issued revision ทั้งหมด
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

ขั้นถัดไปหลัง docs alignment: เสนอ S0/user-management minimum เพื่อให้ Owner
เลือก permission/admission/offboarding/recovery scope โดยเริ่มจากระบบผู้ใช้เดิม
และให้ IT ตอบ hosting/SSO questions คู่ขนานก่อนเลือก protocol/target ไม่เริ่ม
schema, account changes หรือ implementation จาก roadmap นี้ Wider R0/D0,
W-H และ Expression ต้องปิด decision/อนุมัติ candidate ของตนตามลำดับ

ใช้ checks ที่เหมาะกับแต่ละงานและรายงานเฉพาะสิ่งที่รันจริง ตรวจรับ candidate
ก่อนขอ source/release approval; ไม่เพิ่ม PR/process โดยไม่มีเหตุผล และไม่
อนุมานว่า local implementation approval อนุญาต commit/push/deploy/database write

Primary references (ต้องตรวจใหม่ก่อนเลือก version/configuration):

- [Next.js official blog](https://nextjs.org/blog)
- [npm Next latest](https://registry.npmjs.org/next/latest)
- [npm eslint-config-next latest](https://registry.npmjs.org/eslint-config-next/latest)
- [Supabase self-hosting](https://supabase.com/docs/guides/self-hosting)
- [Supabase restore from managed platform](https://supabase.com/docs/guides/self-hosting/restore-from-platform)
- [Supabase SAML account behavior](https://supabase.com/docs/guides/auth/enterprise-sso/auth-sso-saml#user-accounts-and-identities)
- [Supabase session controls](https://supabase.com/docs/guides/auth/sessions)
- [Supabase MFA](https://supabase.com/docs/guides/auth/auth-mfa)
