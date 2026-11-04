# NT Brand System and Sitewide UI Rollout Plan

**Recorded:** 2026-10-24\
**Status:** Owner-approved brand direction; local planning/documentation only\
**Implementation, final visual acceptance and publication:** NOT AUTHORIZED

## 1. Decision and scope

Owner ต้องการให้อัตลักษณ์ NT และคุณภาพ UI/UX สอดคล้องกันทั้งเว็บไซต์
โดยต่อยอด Master Catalog ที่มีอยู่ ไม่ทำให้แต่ละหน้าดูเป็นคนละผลิตภัณฑ์
และไม่เปลี่ยนระบบเป็น generic SaaS dashboard ที่ใช้สีน้ำเงินเป็นแบรนด์หลัก
การอนุมัตินี้ครอบคลุมทิศทางและการปรับแผนในเครื่อง ไม่ใช่อนุมัติเปลี่ยน
runtime assets, CSS, fonts, components, application behavior หรือระบบภายนอก

ใช้แผนนี้เป็นข้อกำหนดข้ามงานภายใต้ [Roadmap #09](./09-integrated-roadmap-and-it-decision-handoff.md)
และดำเนินการทีละชุดเล็กตาม business priority โดยเริ่มกับ UM-A ไม่ทำ big-bang
restyle และไม่ให้การรอเปลี่ยนหน้าตาครบทั้งระบบขวางการแก้ security defect
ที่ยืนยันแล้วหรือการทำให้ทะเบียนผู้ใช้ใช้งานได้

แผนนี้ไม่อนุมัติ package/lockfile change, account/data operation, schema/RPC/
migration, DB reset/restore, Production read/write หรือ stage/commit/push/deploy
และไม่ให้สิทธิ์เข้าถึง `/CI/`, protected archive หรือเอกสารต้นฉบับเพิ่มเติม
Migrations 027–031 ยังคง immutable/no-replay

## 2. Evidence and actual implementation

หลักฐาน CI ที่ใช้คือ [Master Catalog Doc #24](../master-catalog/24-phase4-nt-ci-runtime-asset-analysis.md)
โดยเฉพาะ sections 4–6 และการตัดสินใจ P-10/P-11 ใน
[Decision Register #19](../master-catalog/19-phase4-decision-register.md)
เอกสารเหล่านี้บันทึก guideline provenance, source/runtime hashes และขอบเขต
runtime derivatives ที่อนุมัติแล้ว การอ้างบันทึกนี้ไม่ใช่การเปิดตรวจ manual
ต้นฉบับใหม่หรือการรับรอง CI ทั้งเว็บไซต์

| Surface / asset | สิ่งที่ source และบันทึกยืนยัน | ข้อจำกัด |
|---|---|---|
| Master Catalog web UI | พื้น neutral, header ขาว, เส้น NT Yellow, semantic components และ account menu | ยัง inherit IBM Plex Sans Thai จาก app layout; ไม่ใช่ NT-font rollout ทั้งเว็บ |
| Master Catalog official PDF/print | ใช้ NT Regular/Bold ผ่าน `next/font/local` และ full company lockup | เป็น WP-6 export slice ที่มีการรับรองแยก ไม่ใช่สิทธิ์ restyle หน้าหรือเอกสารอื่น |
| Runtime NT assets ที่มี implementation evidence | `app/fonts/nt/NT-Regular.woff2`, `app/fonts/nt/NT-Bold.woff2`, `public/brand/nt/nt-logo-company-lockup.png` | มีสามไฟล์ตาม manifest; ยังไม่เพิ่มหรือสร้าง compact logo ใหม่ |
| Legacy logo references | `public/nt_logo.svg`, `public/nt_logo.png` และการอ้างในหน้าปัจจุบัน | Doc #24 ระบุว่า provenance ยังต้อง reconcile; ห้ามเรียกว่า approved derivative ใหม่โดยไม่มีหลักฐาน |
| ภาพแนวคิด UM-A | ใช้สื่อสาร hierarchy, layout และ interaction ที่เสนอ | ไม่ใช่ runtime screenshot, font proof, CI acceptance หรือ implementation approval |

Source ที่ใช้เทียบคือ
[MasterCatalogFrame](../../../app/admin/master-catalog/_components/MasterCatalogAdminViews.tsx),
[route-state shell](../../../app/admin/master-catalog/_components/MasterCatalogRouteStateShell.tsx),
[PDF PrintDocument](../../../app/admin/master-catalog/versions/[versionId]/print/PrintDocument.tsx),
[app layout](../../../app/layout.tsx) และ [global tokens](../../../app/globals.css)
Master Catalog web header ปัจจุบันไม่มี logo ใน shell แต่มีเส้นเหลือง
ส่วน official PDF ใช้ company lockup จริง ต้องไม่กล่าวว่าทั้งสองหน้าใช้ฟอนต์
หรือ logo placement แบบเดียวกันอยู่แล้ว

## 3. Brand and visual rules

### 3.1 Core palette and semantics

| Core NT identity | Value | Intended use |
|---|---|---|
| NT Yellow | `#FFD100` | Identity accent, เส้นหัวหน้า และ selected emphasis ที่ตรวจ contrast แล้ว |
| NT Dark Gray | `#545859` | ข้อความ/ข้อมูลประกอบตาม contrast และ surface ที่เหมาะสม |
| Logo Black | `#101820` | อัตลักษณ์และข้อความเข้มตามบริบท |
| White | `#FFFFFF` | พื้นหลักและพื้นที่รอบ logo |

ใช้สีเหลืองอย่างพอดี ไม่ทำพื้นตารางข้อมูลหนาแน่นเป็นสีเหลือง และไม่ใช้
ตัวอักษรเหลืองบนพื้นขาวเป็นข้อความสำคัญ ปุ่ม/พื้นเหลืองใช้ข้อความเข้ม
ทุก interactive state ต้องตรวจ contrast กับคู่สีที่ใช้จริง

Legacy `--nt-blue` / `--nt-orange` ใน source ไม่ใช่หลักฐานว่าทั้งสองสีเป็น
core CI palette ของงานนี้ Semantic colors สำหรับ error, warning, success,
focus และ link ยังใช้ได้เมื่อสื่อความหมายชัดและเข้าถึงได้ แต่ไม่ใช้เพื่อสร้าง
แบรนด์ใหม่ที่แข่งกับ NT ห้ามเปลี่ยนทุกปุ่มเป็นสีฟ้าหรือเพิ่มสีประจำ role
จนข้อมูลดูหลากสีโดยไม่มีเหตุผล

Default primary button ปัจจุบันเป็น neutral เข้ม ใช้ primary/outline/ghost
และ destructive semantics ของ components เดิมก่อน การปรับ token ส่วนกลาง
ต้องประเมินผลต่อทุก consumer ไม่เปลี่ยนผ่าน UM-A โดยไม่ได้ตั้ง scope

### 3.2 Logo and asset custody

- ใช้ runtime asset จริงที่มี provenance ห้ามให้ AI วาด logo ใหม่ แยกส่วน
  wordmark/Vital Sign เปลี่ยนสี บีบสัดส่วน หรือสร้างภาพเลียนแบบแทนไฟล์จริง
- รักษา aspect ratio, clear space, contrast และขนาดที่อ่านชื่อบริษัทได้ตาม
  asset/guideline ที่บันทึกใน Doc #24 ไม่ใช้ค่าของ primary mark ไปบังคับ
  geometry ของ full company lockup ซึ่งเป็นคนละรูปแบบ
- หาก company lockup อ่านไม่ออกใน compact header ให้ปรับพื้นที่/ข้อความ
  หรือเสนอ derivative ที่จำเป็นพร้อม provenance และอนุมัติใหม่ ไม่สมมติว่า
  `nt-logo-primary.png` มีอยู่หรือได้รับ implementation approval แล้ว
- Reconcile legacy references เป็นราย surface: ระบุ current path, asset ที่จะใช้,
  หลักฐาน, พื้นที่วาง และผลทดสอบ ก่อนเสนอเปลี่ยน ห้ามลบไฟล์ที่ยังมี consumer
- ไม่คัดลอก guideline PDF, original TTF/OTF หรือไฟล์ทั้งหมดใน `/CI/` เข้า repo
  และไม่เข้า protected archive เพื่อหา asset เพิ่ม

### 3.3 Typography

เป้าหมายที่เสนอสำหรับ NT brand system คือ NT Regular สำหรับข้อความและ
NT Bold สำหรับหัวข้อ/น้ำหนักสำคัญ โดยใช้ WOFF2 runtime files ที่มี provenance
และ Thai-capable fallbacks แต่ยังไม่อนุมัติ global font swap ในงานเอกสารนี้

หน้าจอปัจจุบันใช้ IBM Plex Sans Thai ส่วน official Master Catalog PDF ใช้
NT fonts จริง ต้องเลือก pilot และวัด glyph coverage, วรรณยุกต์/สระไทย,
line height, wrapping, numbers, control height และ font loading ก่อนตัดสินใจ
ใช้ใน web UI NT Regular/Bold ที่มีเป็นน้ำหนัก 400/700 จึงต้องตรวจผลของ
component weights 500/600 และ synthetic bold ด้วย ไม่ถือว่ามีไฟล์ครบทุก weight

ใช้ scale ที่อ่านง่ายต่อจากของเดิม: หัวข้อประมาณ 18–20px, desktop body
ประมาณ 14–16px ตามความหนาแน่น และ metadata ประมาณ 12–14px โดยข้อมูลสำคัญ
ต้องไม่เล็กหรือจางจนอ่านยาก ตรวจมือถือและการขยายตัวอักษรด้วย ไม่เปลี่ยน
font metrics ทั้งเว็บไซต์จากการตัดสินใจบนภาพ concept เพียงภาพเดียว

## 4. Shared UI foundation

ต่อยอด components และ semantic tokens ที่มีอยู่ให้เป็นพื้นฐานบาง ๆ ร่วมกัน
ไม่เพิ่ม package, design library, custom permission engine หรือสร้าง shell
ซ้ำหลายชุดโดยไม่มีเหตุผล ขอบเขต code ของแต่ละ candidate ต้องอนุมัติภายหลัง

UM-A1 ใช้ NT color tokens และ primitives ที่มีอยู่ พร้อม inherit IBM web font
เดิมก่อน จึงไม่ต้องสร้าง palette, font loader หรือ button library ชุดที่สอง
กรอบหน้า Admin เป็น presentation บาง ๆ แยกจาก authorization/data loading
ไม่คัดลอก MasterCatalogFrame ทั้งชุดซึ่งมี Catalog gate/navigation เฉพาะงาน
หากมี consumer ที่สองที่อนุมัติจึงรวม pattern ที่ใช้ร่วมกันจริง โดยไม่สร้าง
framework เผื่อทุกหน้าหรือบังคับ release foundation แยกก่อนมีความจำเป็น

NT-font pilot ภายหลังต้องมี web font definition เดียวที่ใช้ต่อได้ และตรวจ
ทั้ง content/header และ Sheet/Dialog portal ซึ่งอาจอยู่นอก scoped wrapper
การใส่ font class ที่ wrapper เพียงแห่งเดียวไม่รับรองว่า drawer ใช้ตามแล้ว
ไม่ดึง PrintDocument มาเป็น shared web dependency เพื่อ reuse font เพราะ
export มีขอบเขตการตรวจรับของตน

แนวทางอ้างอิง Master Catalog:

- Neutral canvas, header ขาว, เส้น NT Yellow บาง และ content container
  `max-w-7xl` พร้อม responsive gutters; header ปรับความสูงตามเนื้อหา
  ไม่บังคับทุกหน้าสูง 64px หากรูปแบบ Master Catalog มีหลายแถว
- Page title/description/back navigation/account utilities มีลำดับชัด
  navigation ที่ต้องใช้จริงยังอยู่ครบ ไม่เพิ่ม sidebar หรือ KPI cards ตกแต่ง
- Reuse Button, Input, Table, Badge, Alert, Dialog และ Sheet เดิม พร้อม
  label, focus ring, disabled/busy state และข้อความ action ที่ตรงสิทธิ์จริง
- Desktop ใช้รายการ/table ที่สแกนได้; mobile ใช้ card/detail layout ที่ไม่
  บังคับเลื่อนทั้งหน้าทางแนวนอน เลือก breakpoint ตามข้อมูลและตรวจจริง
- ใช้รายละเอียดตามต้องการแทนยัดทุก field ลงในแถว ปรับ drawer ให้กว้างพอ
  และใช้พื้นที่มือถือเหมาะสม ไม่คัดลอก default width โดยไม่ตรวจเนื้อหา
- Loading, empty, no-result, unavailable, forbidden และ read-only เป็น
  คนละสถานะ ต้องแสดงทั้งข้อความและทางแก้ที่ระบบรองรับ

ใช้ [UX Guidelines](../../ai/UX_GUIDELINES.md) สำหรับ semantic states,
responsive patterns และบทเรียน layout โดยอ่านตามวันที่/ขอบเขต เอกสารนี้
ไม่ใช่คู่มือ CI และข้อความเก่าเรื่อง quantity/pending ไม่ override contracts
ปัจจุบัน การ reuse visual pattern ไม่ใช่การนำ permission หรือคำอธิบายเก่า
ที่ไม่ตรงระบบกลับมาใช้

## 5. Incremental rollout and approval boundaries

| Stage | Proposed scope | Decision / evidence required | Status |
|---|---|---|---|
| **NT-0** | บันทึกทิศทาง, source/asset inventory, shared rules และ surface-specific designs | อ้าง Doc #24/P-10/P-11 และแยก source facts จากข้อเสนอ; ภาพใช้ข้อมูลจำลอง | Local planning authorized; no runtime change |
| **NT-1** | Minimal shared tokens/runtime asset references และ typography pilot บน surface ที่ระบุ | Owner review exact visual/code scope, metric/contrast/font impact และ rollback ก่อนเริ่ม implementation | Proposed; not authorized |
| **UM-A1 pilot — Admin first** | /admin directory/read-only detail/affiliation labels และ NT presentation เฉพาะหน้านี้ | Reuse tokens/primitives/assets และ IBM font เดิม; คง RPC semantics/Catalog gate/Login/session/domain policy พร้อม canonical reread หลังคำสั่ง; ไม่แก้ global/shared files | Design/planning only; no implementation approval |
| **UM-A2 — Auth follow-up** | Signup/email-confirmation และ pending/profile ใน scope แยกภายหลัง | ตรวจ current-user/callback/cookies/recovery regression; ไม่ถือว่าเป็น back-office-only เพราะไม่เปลี่ยน schema | Proposed; separate exact review after A1 |
| **Profile / remaining Admin** | ขยาย pattern ที่ pilot ผ่านแล้วไปหน้าที่เกี่ยวข้อง | ระบุ paths, shared-component blast radius และ permission/registration regression | Proposed; incremental approval |
| **BOQ list / editor** | ปรับ visual integration โดยคง L1, numeric input และ Copy contracts | ตรวจ responsive/forms/dialogs และ DB-backed flows ที่ได้รับผลเมื่อมี execution approval | Proposed; no business-contract change |
| **Other web surfaces** | Dashboard, settings และหน้าที่เหลือจาก inventory | เลือกชุดเล็กตามคุณค่า/การใช้งานจริง ไม่ถือว่าทุกหน้าต้องเปลี่ยนพร้อมกัน | Later; not a release blocker for earlier stages |
| **Exports** | PDF/print/Excel เฉพาะเมื่อมี requirement ใหม่ชัดเจน | Acceptance แยกตามเอกสาร; คง official Master Catalog WP-6/P-11 baseline ที่ปิดแล้ว | No incidental redesign authorized |

เริ่ม NT pilot แบบ scoped ใน UM-A1 ก่อน โดยไม่ต้องแก้ global tokens/fonts
หรือ shared primitive files ส่วน broader NT-1 foundation และ UM-A2 ต้องมี
exact impact scope ภายหลัง ไม่รวมทุกหน้าเพียงเพราะใช้ชื่อ UM-A ร่วมกัน
ไม่สร้าง PR/release เพิ่มเพียงเพื่อชื่อ stage และไม่เปิดหลาย implementation
พร้อมกันสำหรับ Solo

## 6. Business and release invariants

การขยาย visual system ไม่เปลี่ยน role/status/scope, admission, Auth UUID,
account linking, RLS/grants, RPC contracts หรือกติกาและผลทางธุรกิจของการอ่าน/เขียนข้อมูล การเห็น control
สวยขึ้นไม่ทำให้ได้รับสิทธิ์เพิ่ม และ UI-only permission checks ไม่แทน
trusted enforcement

UM-A ต้องไม่แสดง pending role/org chooser, Viewer หรือปุ่มยืนยันสังกัดที่
backend ยังไม่รองรับ ต้องแยก actual NULL, unresolved reference และ lookup
failure; ไม่ถือ requested org เป็น approved org และไม่กล่าวว่าบัญชี active
เป็น pending เพราะขาดสังกัด ค่า NULL ต้องอธิบายตามบทบาท ไม่บังคับ Admin
หรือผู้ใช้ระดับฝ่ายให้มี sector เพียงเพื่อผ่านป้าย UI

ไม่เปลี่ยนราคา, Catalog pointer, Factor F, rounding, saved BOQ data หรือ
ownership เป็นผลข้างเคียงของงานหน้าตา คง Quantity numeric-only, L1 whole-result
query behavior และ Copy source token/request UUID/recovery/031 ตามขอบเขตเดิม
ไม่เพิ่ม migration หรือ replay 027–031 เพื่อทำ branding

Official Master Catalog PDF/Excel มี acceptance และข้อกำหนด font/output แยก
ห้ามเปลี่ยน PDF, BOQ print หรือ Excel incidentally จาก global CSS/font swap
คำขอเพิ่ม TOR/blank Excel เป็นงาน product ตาม roadmap ไม่ใช่สิทธิ์เปลี่ยน
เอกสารธุรกิจทุกประเภทผ่านแผน NT นี้

## 7. Acceptance for each future candidate

ก่อนเสนอ release แต่ละชุด ให้รายงาน exact files/source/target, asset paths,
source/runtime provenance, tests ที่ได้รับผล และขอบเขตที่ยัง NOT RUN โดยใช้
working agreement เดิม ไม่เพิ่ม PR หรือกระบวนการใหม่โดยไม่มีเหตุผล

| Area | Evidence needed when implementation is approved |
|---|---|
| Brand | ใช้ไฟล์จริง/สัดส่วน/clear space, core colors และ header pattern ตรงแบบที่เลือก |
| Typography | Thai glyphs/marks, weights, fallback/load failure, line wraps, tabular numbers และ layout shift |
| Accessibility | keyboard/focus/return focus, dialog naming, contrast, labels, text alongside status color, zoom/reflow |
| Responsive | representative mobile/tablet/desktop, long Thai names/email, dense rows และ drawer/form overflow |
| Truthful states | loading/error/empty/read-only แยกกัน; ไม่มี false total/global filter หรือข้อความอนุมัติที่ข้อมูลไม่รองรับ |
| Business regression | สิทธิ์และ actions เดิมไม่เปลี่ยน; affected Auth/BOQ flows ทดสอบตาม scope ที่อนุมัติบน Docker local เดิม |
| Quality / performance | focused tests, lint, TypeScript/build เมื่อเกี่ยวข้อง, font/image requests และ rendering regression |
| Export isolation | ยืนยันว่า unrelated print/PDF/Excel ไม่เปลี่ยน หรือมี acceptance ใหม่ที่อนุมัติชัดเจน |

ภาพ mockup ใช้เลือกทิศทาง ไม่ใช่ PASS ของตารางนี้ ไม่เรียก source inspection
ว่า rendered browser QA และไม่เรียก unit/build PASS ว่า database-flow PASS
งานเอกสารปัจจุบันไม่ต้องรัน Docker หรือทดสอบฐานข้อมูล

## 8. Remaining choices and next step

Brand direction ทั้งเว็บไซต์ได้รับอนุมัติแล้ว ไม่ต้องถามซ้ำว่าใช้ NT หรือไม่
สิ่งที่ยังต้องเลือกสำหรับ UI candidate แรกคือ exact Admin-only UM-A1 visual set,
ขอบเขต scoped NT presentation ที่ inherit font เดิม, logo placement ที่ใช้ asset ที่มีจริง,
affected paths, test envelope และ rollback สำหรับ code ที่เสนอ

IT/SSO discovery ดำเนินต่อคู่ขนาน ไม่สมมติ hosting/protocol และไม่เลือก
cloud/internal cutover จากงาน branding การออกแบบใช้ต่อได้เมื่อย้ายระบบ
แต่ deployment destination ต้องตรงนโยบาย IT ที่ยืนยันและ release approval

ขั้นถัดไปคือ Owner review แผนและแบบ Admin-only UM-A1 ที่สอดคล้องกับเอกสารนี้ก่อน
เปิด exact local implementation scope ไม่มี authority ให้เปลี่ยนทั้งเว็บ
อัตโนมัติ ไม่มีการเปิด Production หรือ commit/push/deploy จากการบันทึกแผน
