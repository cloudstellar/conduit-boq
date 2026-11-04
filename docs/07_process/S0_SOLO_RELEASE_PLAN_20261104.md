# S0 — แผนปล่อยแบบ Solo ฉบับย่อ

**Prepared:** 2026-11-04. **Revised:** 2026-11-05 (Asia/Bangkok). **Status: SOURCE PUBLICATION APPROVED — PREFLIGHT PENDING; 032 APPLY FORBIDDEN.**

ลำดับที่เสนอ: preflight → ปล่อยเฉพาะ 25 ไฟล์ → CI/Vercel → งดเขียน BOQ 15 นาที → Supabase MCP เดิมหนึ่งครั้ง → ตรวจ metadata/history. ให้แพลตฟอร์มบันทึก history; ไม่เพิ่ม psql, custom ledger writer, guards, package หรือรอบ fixture ใหม่ในแผนนี้.

Owner อนุมัติข้อ1–2: อัปเดตผลตรวจ transaction/manifest, read-only preflight, stage/commit/push/deploy เฉพาะ25ไฟล์, CI/Vercel/anonymous no-write smoke และ conditional client rollback ตามแผน. หาก preflight ไม่ตรงให้หยุด. คง032เดิม;ยังห้าม apply032/แก้DB/replay027–032/รวมA1หรือparity9. การอนุมัตินี้เป็น source publication หนึ่งชุด ไม่ใช่อนุมัติรัน SQL.

## 1. What ships and what changes for users

032 เพิ่ม restrictive INSERT/UPDATE/DELETE guards รวม 9 จุดบน `boq`, `boq_routes`, `boq_items`: ต้องเป็น current active `admin`, `dept_manager`, `sector_manager` หรือ `staff` และยังต้องผ่าน ownership/assignment/scope เดิม. ปิด procurement direct-write ที่ Save/Copy ปฏิเสธอยู่แล้ว; คง SELECT และไม่เพิ่มสิทธิ์ manager/assignee.

Application เปลี่ยนเพียง `prefetch={false}` ที่ NT-logo Link ของ Login. คงบัญชี/รหัสผ่าน/สังกัด/สูตร/ราคา/BOQ/Catalog/Factor F และแยก UM-A1 application. Active users คงสิทธิ์เดิม; actual-affiliation-NULL มี source compatibility แต่ fresh case ยังคงเป็น accepted NOT RUN.

## 2. Exact source and proposed 25-file envelope

ฐานในเครื่อง: `main == local origin/main == 67c1e6fbf80da77d5bb6d6e115d3fa06016611b5`, tree `ec3dc96e53a27c59612b2670ed57d49d0c807584`; index ว่าง. คง **5source+20Markdown** เดิม และ refresh content manifest หลังแก้เอกสาร/ก่อน stage. Snapshot hosted Nov5 อยู่ข้อ3 ไม่ใช่สถานะสดถาวร.

**Five source paths**, exactly matching the R5 qualified candidate:

| Path | SHA-256 |
|---|---|
| `app/login/page.tsx` | `d5d11a8f8df9491ad9e1e22b749b76d44759365d766624753522d92d8fa8d6a8` |
| `migrations/032_s0_boq_writer_boundary.sql` | `592872b3488a51e80866f2f67129ddbdef644408ffd93266bb89bb8033fbd41f` |
| `scripts/test-s0-boq-writer-boundary-local.mjs` | `42bf4e9bb7e10ae6336418034ad3bf64c5a38896346287c64520ad7a6ad42f8b` |
| `tests/boq-writer-role-boundary-migration.test.ts` | `e441f8ec3c9932cb0e51a3237fd20d6e223c70c7f61d39bdf26da83641e962b3` |
| `tests/s0-local-runner-safety.test.ts` | `a742c8f4f194cf9ef76cd2234159a3a5d3a299d40b1a7ab8ad3c35e1d7dd7b42` |

The local-only runner is included because the safety tests import its pure functions. Default/help/import are dry; it is not a Production migration executor. Its old fixtures/proofs must stay closed. Private UI helpers/coordinators and real UM runners are excluded.

**Twenty Markdown paths**, required for complete handoff and link closure:

6. `AGENTS.md`
7. `docs/07_process/RELEASE_PROCESS.md`
8. `docs/08_ai/AI_CONTEXT.md`
9. `docs/08_ai/AI_HANDOFF.md`
10. `docs/08_ai/LESSONS_LEARNED.md`
11. `docs/LOCAL_SUPABASE.md`
12. `docs/ai/UX_GUIDELINES.md`
13. `docs/plans/product/01-conduit-boq-product-evolution-decision-plan.md`
14. `docs/plans/product/09-integrated-roadmap-and-it-decision-handoff.md`
15. `docs/plans/product/10-global-estimating-research-and-capability-backlog.md`
16. `docs/plans/product/11-nt-brand-system-and-sitewide-ui-rollout-plan.md`
17. `docs/plans/product/12-user-management-um-a-and-um-b-plan.md`
18. `docs/plans/security/05-s0-boq-writer-boundary-plan.md`
19. `docs/06_engineering/UM_A1_LOCAL_RESULT.md`
20. `docs/06_engineering/UM_A1_CORRECTIVE_LOCAL_RESULT.md`
21. `docs/06_engineering/UM_A1_REAL_DOCKER_LOCAL_RESULT.md`
22. `docs/06_engineering/UM_A1_SETTLED_VISUAL_LOCAL_RESULT.md`
23. `docs/07_process/UM_A1_SOLO_RELEASE_PLAN_20261102.md`
24. `docs/06_engineering/S0_BOQ_WRITER_BOUNDARY_LOCAL_RESULT.md`
25. `docs/07_process/S0_SOLO_RELEASE_PLAN_20261104.md`

The UM/NT documents are plans or dated local receipts referenced by mandatory handoff, not UM-A1 application code. Including them prevents broken links in a fresh clone. This envelope excludes all nine A1 code/test/mock paths. No partial index editing or unreviewed document substitution is proposed. Final path/content hashes must be refreshed after all plan edits and checked before staging.

### Explicit exclusions

- A1 runtime five: `app/admin/page.tsx`, its two `_components` files, `lib/admin/users/directory.ts`, `presentation.ts`.
- A1 tests three plus `scripts/test-um-a1-client.mjs`.
- Parity nine: `scripts/local-db-parity-{fixtures,schema}.mjs`, `scripts/local-db-parity.mjs`, `scripts/local-db-parity.test.mjs`, `supabase/local/parity-capture.sql`, and the four JSONs under `supabase/local/baselines/20261023-production-contract/`.
- The four real UM runners, `supabase/local/um-a1/**`, all private fixture/capture/evidence files and backups/archives.
- `.env*`, keys, tokens, identities, raw query/response bodies, screenshots, ignored outputs, dependencies, package/lockfile, CI/Vercel/Supabase/Docker config and other application paths.

Keep those files and original credentials/data byte-identical and unstaged. Never use blanket staging, reset, restore, force push or a whole-directory migration command. Migrations 027–032 are immutable/no-replay.

## 3. Evidence and limits

Canonical: [S0 checkpoint](../plans/security/05-s0-boq-writer-boundary-plan.md#6-current-checkpoint), [R5 receipt](../06_engineering/S0_BOQ_WRITER_BOUNDARY_LOCAL_RESULT.md#r5-desktop-flow-and-cleanup--2026-11-04).

| Evidence | ผลที่มีจริง |
|---|---|
| Local 032/API/R5 desktop | Scoped PASS; R5 หนึ่ง Create/Save, quantity3.00/total176.55, cleanup PASS; runs ปิดแล้ว |
| Quality 2026-11-04 | Node24.2.0: 801tests/61files, lint0errors/3oldwarnings, TypeScript PASS; unchanged qualified Turbopack build reused. 37Auth เป็น subset ไม่บวกซ้ำ |
| ข้อจำกัดเดิม | Mobile P2 clipping/usability NOT VALIDATED; repeated image-band cause unconfirmed. Raw graph/Factor rows ไม่ retained จึง reconstruct interpolation จากไฟล์ไม่ได้. Missing-profile/active-NULL/eligible-legacy fresh cases accepted NOT RUN; B Production HTTP NOT RUN/closed |
| Bounded hosted read 2026-11-05 | Source67/CI predecessor/Vercel Ready Node24/main/auto-assignment และ DB predecessor metadata PASS:15policies/31ledger/031ตรงเดิม ไม่มีS0guards. เป็น snapshot ที่อ่านไปแล้ว ไม่ใช่ grant ให้เข้าซ้ำ |
| Proposed MCP payload | Mapping ตรวจในหน่วยความจำ; **contract review DOCUMENTED_SUPPORTED_WITH_LIMITS**, payload runtime NOT RUN. ยึด vendor contract ไม่อ้างเห็น backend transaction จริง |
| Actual S0 source release/smoke/rollback | Owner approved;preflight/actual release checks PENDING. Approval ไม่ใช่ PASS |
| Production032 apply | NOT RUN / NOT AUTHORIZED;ไม่รวมใน source release นี้ |

Existing CI ใช้ Node22; local/hosted Node24 เป็นคนละหลักฐาน. Vercel public env value ยังไม่ได้เปิดดู; ไม่เพิ่ม OTP reveal เป็นเงื่อนไขบังคับ. Supabase project URL ที่ connector ยืนยันไม่ได้พิสูจน์ค่าใน Vercel. ไม่เปิดเผย env/key หรือใช้ Production BOQ ทดสอบเพื่อปิดข้อจำกัด.

## 4. Recommended release order and approval boundaries

1. หลังอนุมัติ publication: exact25paths → actual commit CI/Vercel Ready/current → anonymous no-write smoke ตามข้อ5.
2. หลังอนุมัติ apply/write window: fresh DB preflight → MCP ตามข้อ6หนึ่งครั้ง → read-only postflight. การ publish SQL อย่างเดียวไม่ทำให้ guards active.

Owner อนุมัติสองขั้นแยกกันได้; publication ไม่ให้สิทธิ์ DDL. ไม่เพิ่ม PR/stack/backup และไม่เปิด R5 หรือรอบทดสอบคำนวณ/mobile ใหม่เมื่อ source ไม่เปลี่ยน.

## 5. Source/client preflight and proposed publication

- Refresh Git/local/remote main/index และ exact25content hashes; stop เมื่อ drift/staged path นอกชุด. รักษา excluded dirty work และตรวจ existing tests/lint/TypeScript/build inputs; app/build inputs เปลี่ยนจึงตรวจใหม่.
- ยืนยัน GitHub `cloudstellar/conduit-boq`, Vercel `cloudwho-2662s-projects/conduit-boq`, domain `boq.ntconduit.com`, repo/main/runtime/build/root/auto-assignment โดยไม่เปิด secret.
- Rollback candidate จาก snapshot Nov5: `dpl_FwQR53PBDgGATp3z5R962Hvw132Z`, `https://conduit-kroe45rlo-cloudwho-2662s-projects.vercel.app`, source67/treeตามข้อ2. Refresh ก่อนปล่อย; Hobby ใช้ immediately previous Production จึงต้องไม่มี deployment แทรก. Current ไม่ใช่ future rollback eligibility ที่ทดสอบแล้ว.
- Stage exact allowlist → ตรวจ staged content → Solo commit/normal push → ตรวจ exact commit Quality/Vercel/domain. Auto-assignment เปิดและไม่มี deployment checks: Vercel อาจ Current ก่อน GitHub CI จบ; fail/unknown ห้ามไปต่อขั้นDB.
- Smoke ที่เสนอ: clean anonymous context เปิด `/login`/static same-origin เท่านั้น ตรวจ render/console/network; block Auth/Data API/RPC/BOQ/Admin และไม่ submit form. เป็น delivery check ไม่ใช่ authenticated/RLS proof.

## 6. Separate 032 Production gate

**วิธีที่เสนอแทนการส่งไฟล์ BEGIN…COMMIT ทั้งชุดในฉบับ Nov4:** ใช้ `supabase_apply_migration` เดิม (`project_id=otlssvssvgkohqwuuiir`, proposed `name=s0_boq_writer_boundary`) ให้ runner จัดการ transaction/history ตาม [Management API guide](https://supabase.com/docs/guides/integrations/supabase-for-platforms#make-database-changes) และ [transaction warning](https://supabase.com/kb/troubleshooting/partial-migrations-and-schema-inconsistencies-from-embedded-transactions). ไม่เพิ่ม psql/custom ledger INSERT/upsert/repair.

| Artifact | SHA-256 / mapping |
|---|---|
| Immutable 032 source | `592872b3488a51e80866f2f67129ddbdef644408ffd93266bb89bb8033fbd41f` |
| Proposed UTF-8/LF execution payload | `9cc46a3d2fb4ef7dbc0bd2a0f1f1d12be445ee33d16e0cc50390f408766c5432` |
| Exact difference | เว้นเฉพาะบรรทัด top-level `BEGIN;\n` และ final `COMMIT;\n` รวม15bytes. คง comments/blank lines/SET LOCAL/locks/DO/nine guards/assertions ทุก byte ที่เหลือ; ห้าม global replace BEGIN/COMMIT ภายใน DO |

นี่เป็น **proposed execution mapping**, ไม่ใช่แก้/replayไฟล์032 และยังไม่ใช่ payload runtime PASS. Contract review เสร็จระดับ **DOCUMENTED_SUPPORTED_WITH_LIMITS**: MCP ส่ง whole query ผ่าน Management API ซึ่งระบุ auto-history/rollback on migration failure;คำแนะนำ runner รองรับ payload ไม่มี transaction ชั้นนอก. การคง SET LOCAL/locks/DO ใน transaction เดียวกันเป็นข้อสรุปตามสัญญาrunner ไม่ใช่ observed runtime. รายละเอียด backend/ledger/HTTP acknowledgement และ exactly-once ไม่ได้พิสูจน์;คง postflight/UNKNOWN/no-retry. หากพบข้อขัดแย้งให้หยุด ไม่เพิ่ม SQL guards/ตัวรันใหม่เอง. Apply ยังต้องอนุมัติแยก.

**Fresh preflight หลังอนุมัติ:** project **Conduit Price List**, database/session/current user `postgres`; source/payload hashes; portable predecessor SHA `1df6e90e98b017ff13b6e566d1c6734f48edcf9ebb0be651b85a69ebbd3e0723`; old15policies/ไม่มี9S0guards; ledger031 `20261023063934/boq_duplicate_stale_conflict_guard`; Copy definition SHA `508f70695e5f5578734570d356c5a0921cab0e0dc0a207e8ffcc9aca313b68b2` พร้อม ACL/owner/config. ตรวจ helpers/grants/RLS/triggers/constraints และ authenticated ไม่มี bypass/ownership/non-RLS privilege drift. มี successor/partial guards/ledgerชื่อใหม่เดิมอยู่แล้วให้หยุด.

**ช่วงรัน:** Owner ยืนยันงด Create/Save/Copy/Delete/direct BOQ writes **15นาที** และไม่มี DDL/migration-history writer อื่น. ตรวจ relevant active writers/waiters/idle-in-transaction ให้ clear โดยไม่ kill sessions; activity counts ศูนย์จาก snapshot เก่าไม่ใช่หลักฐานแทน. ส่ง exact proposed payload **หนึ่งครั้ง** ผ่าน MCP หลัง source release ผ่าน; ไม่ใช้ whole-directory migrate/reset/db-push หรือ fixture runner.

**Migration history / postflight:** ก่อนส่งเก็บ version/name และ fingerprint ประวัติเดิมแบบไม่เปิดเผย statements. หลัง MCP ให้แพลตฟอร์มบันทึกเอง แล้วอ่าน metadata ยืนยัน9restrictive guardsถูกต้อง/24policiesรวม, old15/031/สัญญาอื่นคงเดิม และ history เพิ่ม **หนึ่งรายการ** ชื่อที่อนุมัติ พร้อม actual platform-generated version; filename032ไม่ใช่ hosted version. เทียบ stored statements กับ execution payload ตามรูปแบบที่ระบบเก็บจริง โดยคงขอบเขต DO/dollar quoting; ไม่ใช้ `split(';')` หรืออ้าง hash ของ joined statements เท่ากับ source file. เก็บ source hash/payload hash/actual ledger identity แยกกัน; ไม่บันทึกว่าระบบรับ canonical file bytes ทั้งชุด.

Timeout/error/lost response → **UNKNOWN** จนอ่านสถานะ reconcile; ไม่ retry เปลี่ยนชื่อเพื่อส่งซ้ำ หรือซ่อม ledger. Guards committed แต่ history ขาด/ขัดกัน → HOLD. Abort ที่ยืนยันแล้วก็ไม่ให้สิทธิ์ลองใหม่เอง. ไม่อ่าน BOQ/user rows หรือเรียก business RPC ในแผนนี้.

## 7. Risks and rollback

- ความเสี่ยงหลัก: write lock ชั่วคราว, สิทธิ์เขียนถูกปฏิเสธผิดเงื่อนไข, SQL/history outcome กำกวม. ใช้ write pause/exact pre-postflight/stop rules; ไม่รับรอง zero impact.
- Conditional client rollback ได้รับอนุมัติสำหรับ source release นี้: new Login/deployment regression และ exact S0 ยัง Current จึงกลับ verified immediate predecessor. ถ้า S0 ไม่เคย Current ให้คง healthy Current. ตรวจ source/domain หลัง rollback.
- Forward client correction หนึ่งชุดที่เสนอ เปลี่ยนกลับเฉพาะ Login prop; remote main และ Current ต้องยังตรง reviewed S0. ตรวจ CI/Vercel/domain/auto-assignment หลัง rollback ก่อน promote ที่ได้รับอนุมัติ; ไม่ force-push หรือย้อนทั้ง25ไฟล์.
- **คง032guardsหลัง commit แม้ client rollback.** ปัญหาDBต้องหยุด affected writes/อ่านหลักฐานและเสนอ forward correction ใหม่; ไม่ drop guards/restore/replay/แก้ledger/เพิ่มสิทธิ์บัญชี. Rollback อาจนำ Login-prefetch limitation เดิมกลับมา. A1 ต้อง refresh base/allowlist/rollback หลัง S0 และคง S0 protection.

## 8. Owner decisions and next action

Owner อนุมัติ publication/anonymous smoke/conditional client rollback ของ exact25paths ตามฉบับนี้แล้ว โดยคง mobile/evidence/NOT RUN limits ที่บันทึกไว้. Contract review ปิดได้ระดับเอกสารทางการพร้อมข้อจำกัด;ไม่เปลี่ยน payload runtime เป็น PASS. Apply032 และ write window ยังต้องอนุมัติแยก.

Current authority คืออัปเดตเอกสาร/manifest และ source publication/anonymous smoke/conditional client rollback เท่านั้น;ก่อน stage ยังต้องผ่าน fresh preflight และ exact content checks. Production reads จำกัด source/config/rollback และ anonymous Login/static smoke. ไม่มี DB mutation/032apply/Auth/businessRPC/fixture หรือเปิด run เดิม. Approval ไม่ให้สิทธิ์ publish ซ้ำหลังงานจบ.

## 9. Local preparation checks

**Dated record — 2026-11-04, retained:** ข้อความต่อไปนี้เป็นผลฉบับเดิม ไม่ใช่ผลรันหรือ hosted state สดของ Nov5; bounded hosted read ภายหลังอยู่ข้อ3/current checkpoint.

The isolated prospective tree is HEAD67 plus the exact25 paths, with installed dependencies linked locally and CI-placeholder API values. All five source paths match R5. Of the549 qualified files,539 match and ten reviewed Markdown files differ; all358 non-Markdown qualified files match. New linked planning documents are additional allowlisted files. A1 Admin runtime remains baseline HEAD, and new A1 code/tests/mock, real runners and parity9 are absent.

Fresh Node24.2.0 checks passed801tests/61files, lint0errors/3oldwarnings and TypeScript. The three warnings are unchanged navigation warnings in blocked/useUser. Source/build inputs are identical to the qualified Turbopack/R5 app; no new build, installation, DB/Auth/Docker/browser or hosted operation was performed. Initial private projection setup/startup failures are retained as tooling failures, not product failures or successful tests.

Final checks passed:22documentation contracts,581relative links/200anchors across20Markdown, whitespace and exact25path/content/exclusion/custody checks. Both independent source and DB/order/rollback reviews found no blocker after the stated clarifications. These22contracts are included in the801fullsuite and were rechecked after Markdown edits. Private proof is `/private/tmp/s0-solo-release-preparation-20261104`; no private evidence is part of the25paths. Actual commit/CI/hosted/preflight/032 gates remain future NOT RUN.

## 10. Transaction contract review and source approval — 2026-11-05

Official source pinned to [supabase/mcp@5f0d393](https://github.com/supabase/mcp/blob/5f0d393073cbbefbc4ea7122cd1fd058aeb60e5c/packages/mcp-server-supabase/src/platform/api-platform.ts#L259): one explicit POST forwards name/query unchanged;MCPไม่splitหรือเพิ่มSQLwrapper. [Tool](https://github.com/supabase/mcp/blob/5f0d393073cbbefbc4ea7122cd1fd058aeb60e5c/packages/mcp-server-supabase/src/tools/database-operation-tools.ts#L549) returns success without actual ledger identity. Official API guide promises auto-history and rollback on schema-migration failure;KB recommends runner-owned transaction. Public tests use mocks ไม่ใช่ hosted backend proof. จึงใช้ existing MCP ตาม vendor contract พร้อม postflight/no-retry;ไม่เพิ่ม local BOQ fixture programme หรือ custom ledger writer. ยังไม่รับรอง DDL/history/ack atomicity หรือ actual032 runtime.

Owner's later explicit grant authorizes only source steps1–2 plus conditional client rollback;032apply/DB mutation/replay remain forbidden. Fresh preflight and final manifest precede staging. Actual commit/CI/Vercel/smoke outcome will be recorded in canonical S0 checkpoint;ไม่ใช้ approval แทนผลตรวจ.
