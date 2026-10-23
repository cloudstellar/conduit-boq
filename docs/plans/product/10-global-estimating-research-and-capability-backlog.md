# Global Estimating Research and Capability Backlog

**Recorded:** 2026-10-14; disposition aligned 2026-10-23 (Asia/Bangkok)

**Status:** RESEARCH / BACKLOG REFERENCE — NO IMPLEMENTATION AUTHORITY

เอกสารนี้เก็บผลวิเคราะห์ระบบ estimating/BOQ สากลและแนวคิดเดิมที่ยังไม่ได้
เป็นงานระยะใกล้ เพื่อให้ไม่สูญหายจากการย่อ roadmap ลำดับและ decision ปัจจุบัน
ให้ยึด [Integrated Roadmap #09](./09-integrated-roadmap-and-it-decision-handoff.md)
ไม่ใช่ feature list ของผู้ขายหรือ time horizon เดิมใน #01

Owner อนุญาตการบันทึกและปรับเอกสารเท่านั้น ไม่อนุมัติ implementation,
package/lockfile, schema/RPC/migration, account/data, commit/push/deploy หรือ
Production/archival operation ผลวิจัยไม่เปลี่ยน TBD เป็น approved

**Current disposition — 2026-10-23:** A/B/031 และ
[LIST-1B L1](../../06_engineering/LIST_1B_L1_PRODUCTION_RELEASE_RESULT_20261023.md)
ปิดแล้วตาม receipts; B Production HTTP ยังคง **NOT RUN** ตาม Owner decision
งานถัดไปที่เสนอคือ S0/user minimum พร้อม IT/SSO discovery คู่ขนานตาม #09
L1.1/L2 และสามข้อที่ Owner พักไว้ไม่กลายเป็น prerequisite ใหม่ การจัดเอกสารนี้
ไม่ตรวจ Production สดและไม่อนุมัติงาน implementation/release ถัดไป

## 1. Business context และ Owner disposition

- Owner ดูแลระบบคนเดียว และต้องการ release เล็กที่ตรวจรับได้
- ปริมาณมาจากการถอดแบบลง Excel แล้วนำมากรอกใน Conduit ตามคำยืนยัน Owner
- ฉบับใช้งานผ่านเอกสารจริงที่ลงนามโดยผู้จัดการส่วนวิศวกรรมท่อร้อยสาย
- องค์กรมี SSO แต่ IdP/protocol ยังไม่ทราบ; internal-all hosting ยังไม่ใช่
  นโยบายที่ IT ยืนยัน ความสามารถ cloud ของผู้ขายไม่พิสูจน์ความเหมาะสมนี้
- หลังอ่านข้อเสนอวิจัย Owner ให้พักสามข้อ: Excel quantity intake พร้อม review,
  business scope/quantity-source provenance เพิ่มเติม และ extra pre-issue
  quality/stale-save enhancements ตาม [#09 §8.1](./09-integrated-roadmap-and-it-decision-handoff.md#81-owner-deferral-of-market-research-additions--2026-10-14)
  จึงไม่นำมาเพิ่ม release หรือ prerequisite และไม่ย้าย Expression ไปอยู่หลัง
  งานเหล่านี้ ใช้ workflow Excel/กรอกเดิมต่อได้ภายใต้ขอบเขตปัจจุบัน

การพักนี้ไม่เปลี่ยน S0/D0/W-H contracts เดิม หรืออ้างว่า defect ที่ยืนยันแล้ว
เป็น PASS แต่ห้ามเปลี่ยนชื่อส่วนเพิ่มเติมที่พักไว้แล้วนำกลับเป็นงานบังคับ

## 2. ผลเทียบจาก official sources

ตรวจหน้า product/documentation ใน session วันที่ 2026-10-14 ตารางนี้เป็น
ตัวแทน workflow หลายประเภท ไม่ใช่ผลจัดอันดับส่วนแบ่งตลาด การยืนยันคือ
ความสามารถที่เอกสารทางการระบุ ไม่ใช่การทดสอบ correctness/performance หรือ
การรับรอง licensing/deployment/SSO สำหรับองค์กรนี้

| ระบบ / primary source | ความสามารถที่พบ | Lesson สำหรับการพิจารณาในอนาคต |
|---|---|---|
| [RIB CostX](https://www.rib-software.com/en/rib-costx) | PDF/CAD/BIM quantity takeoff, workbooks เชื่อม quantities/cost database, revision comparison, audit trace และ corporate reports | ปริมาณและผลกระทบจากการแก้แบบควรอธิบายได้; native takeoff/BIM เป็น candidate ใหญ่ ไม่ใช่ prerequisite ของ Conduit |
| [Trimble Accubid Anywhere](https://www.trimble.com/en/products/trimble-accubid-anywhere) | MEP/electrical estimating, conduit/material attributes, assemblies, linked takeoff และ original-estimate-based change orders | ศึกษาแม่แบบงานท่อและการเปลี่ยนงานจากฐานเดิมเมื่อมีกรณีซ้ำจริง; ไม่ยืมนโยบาย live supplier pricing มาเปลี่ยน snapshot เก่า |
| [Trimble WinEst](https://www.trimble.com/en/products/winest) | Database-driven estimates, reusable assemblies และ cost history; closed-loop estimated/as-built modeling บนหน้าผลิตภัณฑ์อ้างถึง Modelogix ที่เชื่อมต่อ | เก็บ source/versions ของ reusable basis และทดสอบตัวอย่างก่อนใช้; ไม่ถือว่า WinEst เดี่ยวมี actual-cost workflow ทั้งชุด |
| [Autodesk Forma Estimate](https://www.autodesk.com/products/forma-estimate/overview) / [Forma Takeoff](https://construction.autodesk.com/tools/construction-takeoff-software/) | Connected 2D/3D quantities, cost library, structured grouping และ reports | ศึกษาการเชื่อม documents/quantity/cost โดยรักษา bound Catalog/Factor/price snapshots ของเรา |
| [Procore Estimating](https://support.procore.com/products/online/user-guide/project-level/estimating) | Catalog/assemblies, estimates/change orders, scope lists และ budget handoff | การส่งต่อข้อมูลต้องกำหนด cost codes/types, field ownership และ revision ที่ใช้ ไม่ส่งยอดรวมอย่างเดียว |
| [Bluebeam Revu](https://www.bluebeam.com/resources/pdf-markup-for-estimators-2026-guide/) | Measurement markup คู่ quantity records บน PDF และส่งต่อ quantities ไป Excel | ลดการคีย์ซ้ำและเปิดให้ตรวจที่มาปริมาณเป็นแนวคิดที่ศึกษาได้; Excel intake/provenance ใหม่ของ Conduit ถูก Owner พักไว้ |

หลักฐานเฉพาะพฤติกรรมที่ใช้ในการวิเคราะห์:

- Autodesk แสดง warning เมื่อ takeoff ยังอ้าง file version ก่อนหน้า:
  [Versions in Sheets & Models](https://help.autodesk.com/cloudhelp/ENU/Takeoff-Files/files/Version_in_Sheets_Models.html)
- Procore มี estimate-specific/reusable inclusions และ exclusions:
  [Scope lists](https://support.procore.com/products/online/user-guide/project-level/estimating/tutorials/add-inclusions-and-exclusions-to-estimates)
- Procore budget handoff ต้อง mapping cost codes/types และมีข้อจำกัด:
  [Send estimate to budget](https://support.procore.com/products/online/user-guide/project-level/estimating/tutorials/send-an-estimate-to-the-budget)
- Procore export อธิบายการไม่คิดยอด assembly header และ components ซ้ำ:
  [Export estimate](https://support.procore.com/products/online/user-guide/project-level/estimating/tutorials/export-an-estimate)
- RIB Candy ครอบคลุม resource estimating, valuations/variations และ cost
  control; procurement/accounting ต่อผ่าน BuildSmart:
  [Candy official](https://www.rib-software.com/en/rib-candy)

## 3. Capability backlog register

สถานะ Later/Discovery หมายถึงเก็บไว้พิจารณาตามกรณีใช้งาน ไม่ใช่คำสั่งให้สร้าง
ทุกอย่าง ผู้ตัดสินใจต้องเลือก scope และอนุมัติใหม่ก่อนเปิด candidate

| Capability | ที่มา / coverage | สถานะปัจจุบัน | เงื่อนไขก่อนนำกลับมา |
|---|---|---|---|
| Catalog, normal Atomic Copy, NULL Save guard, numeric-only R0A | receipts ใน #09 §2 | CLOSED; consumed authority | residual ไม่ใช่งาน replay; business release ใหม่ต้องอนุมัติใหม่ |
| Dependency A, stale Copy B/031, LIST-1B L1 | completed receipts ใน #09 §2 | CLOSED; consumed authority | B HTTP NOT RUN; L1 bounded no-write PASS ไม่ใช่ blanket behavior PASS; ไม่เปิด probes/replay ซ้ำ |
| S0/user minimum, wider R0/D0, W-H, Expression | remaining main sequence ใน #09 | PROPOSED; S0 NEXT | ปิด decision/approved local scope ตาม #09 ไม่ใช่ implementation approval จากตารางนี้ |
| Templates/assemblies สำหรับงานซ้ำ | [#01 R4](./01-conduit-boq-product-evolution-decision-plan.md#r4--revision-diff-reporting-and-optional-sso-612-months) | LATER / DISCOVERY | ตัวอย่างงานซ้ำที่ Owner เลือก; numeric/item model พร้อม; template version ไม่เปลี่ยน BOQ เก่า |
| Line/amount revision diff และ change reasons | #01 R4; #09 กล่าวโดยรวม | LATER หลัง frozen revisions | ความหมาย added/removed/quantity/price/Factor delta และวิธีจับคู่รายการที่ตกลง; ไม่บังคับ full DB-2 กับ W-H แรก |
| Stable logical line identity / structured measurements (DB-2) | [#01 DB-2](./01-conduit-boq-product-evolution-decision-plan.md#db-2--structured-measurement-provenance-and-save-revisions) | CONDITIONAL DESIGN, ไม่เริ่ม schema | มี audit/measurement use case ที่ Owner เปิดใหม่; เคารพการพัก provenance เพิ่มเติม |
| Variation/change-order model | #01 R5 | LATER | กติกางานเพิ่มลด/ราคาที่อนุมัติ; preserve signed baseline; ไม่ใช้ negative quantity เป็นทางลัด |
| Procurement package / acknowledgement / reconciliation | #01 R4/R5; #09 downstream handoff | LATER | เจ้าของระบบปลายทาง, field ownership, exact revision; เริ่ม package มาตรฐานก่อน API/ERP เต็มรูปแบบ |
| Committed/actual cost และ variance | #01 R5 | LATER, DATA OWNER REQUIRED | แหล่ง actual ที่เชื่อถือได้และความละเอียดที่ต้องใช้; แยก revised estimate, commitment และ actual |
| First-class Project entity / หลาย BOQ ต่อโครงการ | [#02 domain clarification](./02-boq-list-scaling-decision-plan.md#2-important-domain-clarification) | DISCOVERY, ไม่ขยาย L1 | ปัญหา grouping ที่ free-text project_name แก้ไม่ได้; ไม่สร้าง schema เพียงเพื่อ pagination |
| LIST L2/L3 filters, views, columns, bulk actions | #02 L2/L3 | LATER / MEASURED NEED | usage และสิทธิ์แต่ละ action; ไม่รวมกับ L1 โดยอัตโนมัติ |
| Mobile/editor usability และ real-device acceptance | #01 D7/R0/R1 | EXISTING OPEN SCOPE DECISION | cohort/viewport ที่ Owner เลือก; ไม่อ้าง R0A QA เป็น full mobile/large-BOQ acceptance |
| Product/reporting measures | #01 §17 และ product brief ตามเวลาเดิม | LATER, MINIMAL BASELINE | นิยามที่ตกลงและข้อมูลปัจจุบัน; ไม่คัดลอกตัวเลข June เป็น baseline สด หรือสร้าง telemetry ใหม่อัตโนมัติ |
| Notifications / in-app action views | overview historical roadmap | LATER / DISCOVERY | lifecycle, ผู้รับและช่องทางที่ต้องการ; external messages ต้องอนุมัติส่งอย่างชัดเจน |
| Offline/PWA, field/GIS/as-built | #01 R6A | DEFERRED / EVIDENCE-GATED | field owner, sync/conflict/evidence policy และ pilot ที่มีประโยชน์จริง |
| AI/model wizard | #01 R6B และแนวคิดเก่า | DEFERRED / EVIDENCE-GATED | bounded use case, source quality และ human review; ไม่ auto-insert/approve |
| Factor F admin/import usability เพิ่มเติม | historical implementation ideas | INDEPENDENT FUTURE GOVERNANCE DECISION | มีความต้องการจาก Owner; ไม่ reopen release ที่ปิดแล้วหรือแก้ dataset/default/snapshots จากงานเอกสาร |
| Excel quantity intake พร้อม review | ใหม่จาก workflow ที่ Owner ให้ข้อมูล | OWNER DEFERRED — NOT NEAR-TERM | Owner เลือกเปิดใหม่; ไม่เลื่อน Expression เพื่อรองานนี้ |
| Business scope / quantity-source provenance เพิ่มเติม | ใหม่จาก market research | OWNER DEFERRED — NOT NEAR-TERM | Owner เลือกเปิดใหม่; ไม่เพิ่ม source fields หรือ gate ทางอ้อม |
| Extra pre-issue quality / stale-save enhancements | ส่วนเพิ่มเติมจาก market research | OWNER DEFERRED — NOT NEAR-TERM | Owner เลือกเปิดใหม่; S0/D0/W-H contracts เดิมยังคงเดิม |

## 4. ข้อจำกัดในการนำแนวคิดเดิมกลับมา

- Normal Copy คงราคา/Catalog/Factor; current prices ใช้ Create New ไม่ revive
  Requote/Rebase จาก historical plans โดยถือว่า DUP-1 เคยอนุมัติไว้
- ไม่ cleanup/backfill BOQ เก่าจากคำแนะนำใน product brief เดือน June
- Formula persistence DB-1 เป็น editing context ไม่ใช่ measurement evidence
  หรือ immutable approval history โดยตัวมันเอง
- เก็บ approval authority ไว้ที่ signed-paper process ตามคำยืนยัน Owner
  ผู้บันทึกหลักฐานในแอปไม่เป็น approver โดยอัตโนมัติ
- ไม่เลือก architecture/SSO จาก feature list ของ vendor; รอ IT ยืนยัน target
- ใช้ #09 สำหรับลำดับปัจจุบันและขอบเขตที่อนุมัติ ห้ามให้ backlog นี้ขยายงาน
  โดยอัตโนมัติ และห้าม replay migrations 027–030
