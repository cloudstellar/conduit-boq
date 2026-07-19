import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), 'utf8');
}

describe('Master Catalog P-22 operator workflow', () => {
  it('keeps draft actions in context and the item workspace before history', () => {
    const views = source(
      'app/admin/master-catalog/_components/MasterCatalogAdminViews.tsx',
    );
    const detailStart = views.indexOf('export function MasterCatalogVersionDetailView');
    const reviewStart = views.indexOf('export function MasterCatalogVersionReviewView');
    const detail = views.slice(detailStart, reviewStart);

    expect(detailStart).toBeGreaterThan(-1);
    expect(reviewStart).toBeGreaterThan(detailStart);
    expect(detail.indexOf('<MasterCatalogVersionWorkspace')).toBeGreaterThan(-1);
    expect(detail.indexOf('<RecentImports')).toBeGreaterThan(
      detail.indexOf('<MasterCatalogVersionWorkspace'),
    );
    expect(detail.indexOf('ข้อมูลเวอร์ชันและเอกสาร')).toBeGreaterThan(
      detail.indexOf('<MasterCatalogVersionWorkspace'),
    );
    expect(detail.indexOf('/import')).toBeLessThan(
      detail.indexOf('<MasterCatalogVersionWorkspace'),
    );
    expect(detail).toContain('const isCurrentVersion = detail.currentVersionId === version.id');
    expect(detail.indexOf('/review')).toBeLessThan(
      detail.indexOf('<MasterCatalogVersionWorkspace'),
    );
    expect(detail).toContain('ส่งออกเพื่อตรวจ');
    expect(detail).toContain('Excel สำหรับตรวจสอบ');
    expect(detail).toContain('PDF สำหรับอ่าน/พิมพ์');
    expect(detail).not.toContain('ส่งออก Excel');
    expect(detail).not.toContain('เผยแพร่เวอร์ชันนี้');
    expect(detail).toContain('<MasterCatalogDraftAbandonPanel');
  });

  it('keeps global navigation informational and preserves operator context', () => {
    const views = source(
      'app/admin/master-catalog/_components/MasterCatalogAdminViews.tsx',
    );
    const headerUtilities = source(
      'app/admin/master-catalog/_components/MasterCatalogHeaderUtilities.tsx',
    );
    const accountMenu = source('components/auth/UserAccountMenu.tsx');
    const boqHeader = source('components/boq/BOQPageHeader.tsx');

    expect(views).toContain("label: 'บัญชีปัจจุบัน'");
    expect(views).toContain("label: 'ทะเบียนฉบับ'");
    expect(views).toContain("label: 'ประวัติการเปลี่ยนแปลง'");
    expect(views).not.toContain("section: 'import'");
    expect(views).toContain('<MasterCatalogHeaderUtilities gateState={gate.state} />');
    expect(headerUtilities).toContain("process.env.NEXT_PUBLIC_APP_ENV");
    expect(headerUtilities).toContain("forbidden: 'ไม่มีสิทธิ์'");
    expect(headerUtilities).toContain('<UserAccountMenu />');
    expect(accountMenu).toContain('aria-label="เปิดเมนูบัญชีผู้ใช้"');
    expect(boqHeader).toContain('<UserAccountMenu />');
  });

  it('binds import to one exact draft route without a second target selector', () => {
    const contextualRoute = source(
      'app/admin/master-catalog/versions/[versionId]/import/page.tsx',
    );
    const legacyRoute = source('app/admin/master-catalog/import/page.tsx');
    const panel = source(
      'app/admin/master-catalog/_components/MasterCatalogImportPanel.tsx',
    );
    const readModel = source('lib/master-catalog/admin/readModel.ts');

    expect(contextualRoute).toContain('loadCatalogImportContext(supabase, versionId)');
    expect(contextualRoute).toContain('loadCatalogVersionImportHistory(supabase, versionId)');
    expect(contextualRoute).not.toContain('loadCatalogAdminHistory');
    expect(contextualRoute).toContain('UUID_PATTERN.test(versionId)');
    expect(contextualRoute).toContain('notFound()');
    expect(contextualRoute).toContain('<MasterCatalogImportView');
    expect(readModel).toContain('export async function loadCatalogVersionImportHistory');
    expect(readModel).toContain(".eq('version_id', versionId)");
    expect(legacyRoute).toContain('/versions/${encodeURIComponent(draftId)}/import');
    expect(legacyRoute).not.toContain('loadCatalogImportContext');
    expect(panel).not.toContain('id="catalog-import-draft"');
    expect(panel).not.toContain('/admin/master-catalog/import?draftId=');
    expect(panel).toContain('เลือกไฟล์และหลักฐาน');
    expect(panel).toContain('ตรวจผลต่างกับเซิร์ฟเวอร์');
    expect(panel).toContain('ยืนยันบันทึกลงฉบับร่าง');
    expect(panel).toContain('01_Item_Master_Final');
    expect(panel).toContain('?notice=import-applied');
  });

  it('renders final snapshot comparison before the exact-lock publish panel', () => {
    const views = source(
      'app/admin/master-catalog/_components/MasterCatalogAdminViews.tsx',
    );
    const reviewStart = views.indexOf('export function MasterCatalogVersionReviewView');
    const itemStart = views.indexOf('export function MasterCatalogItemDetailView');
    const review = views.slice(reviewStart, itemStart);

    expect(review).toContain('<MasterCatalogFinalReviewWorkspace');
    expect(review.indexOf('<MasterCatalogPublishRestorePanel')).toBeGreaterThan(
      review.indexOf('<MasterCatalogFinalReviewWorkspace'),
    );
    expect(review).toContain("reviewBinding.state === 'current'");
    expect(review).toContain('key={`${version.id}:${reviewBinding.requestedLockVersion}`}');
    expect(review).toContain('lockVersion: reviewBinding.requestedLockVersion');
    expect(review).toContain('ฉบับตรวจในแท็บนี้เป็นรุ่นเก่าและเผยแพร่ไม่ได้');
    expect(review).toContain("isDraftReview && !review.isCurrentBase");

    const route = source(
      'app/admin/master-catalog/versions/[versionId]/review/page.tsx',
    );
    expect(route).toContain('loadCatalogVersionReview');
    expect(route).toContain('MasterCatalogVersionReviewView');
    expect(route).toContain('parseCatalogReviewLock');
    expect(route).toContain('resolveCatalogReviewBinding');
    expect(route).toContain('currentLockVersion: review.version.lockVersion');
    expect(route).toContain('?reviewLock=${reviewBinding.currentLockVersion}');
  });

  it('keeps abandon server-owned, audited, and separate from deletion', () => {
    const actions = source('app/admin/master-catalog/actions.ts');
    const panel = source(
      'app/admin/master-catalog/_components/MasterCatalogMutationPanel.tsx',
    );

    expect(actions).toContain("supabase.rpc('abandon_catalog_draft'");
    expect(actions).toContain("operation: 'abandonCatalogDraft'");
    expect(panel).toContain('<DialogTrigger asChild>');
    expect(panel).toContain("ยืนยันการยกเลิก {draftVersion.draftReference ?? 'ฉบับร่างนี้'}");
    expect(panel).toContain('ยืนยันและเก็บเป็นประวัติ');
    expect(panel).toContain('expectedLockVersion');
    expect(panel).not.toContain('delete_catalog_draft');

    const wp65Harness = source('scripts/smoke-master-catalog-wp65.mjs');
    expect(wp65Harness).toContain("target.rpc('abandon_catalog_draft'");
    expect(wp65Harness).toContain('abandonedFixtureDrafts === 3');
    expect(wp65Harness).toContain('minor: maxMinor + 1 + index');
    expect(wp65Harness).not.toContain('minor: maxMinor + 100 + index');
    expect(wp65Harness).toContain('const reusableDraftVersion = versions[1]');
    expect(wp65Harness).toContain('hasHardenedCapabilities ? reusableDraftVersion : versions[2]');
    expect(wp65Harness).toContain('hasHardenedCapabilities ? reusableDraftVersion : versions[3]');
    expect(wp65Harness).toContain('assertVersionLifecycleNegatives(adminA, base)');
    expect(wp65Harness).toContain('assertWorkingDraftGuardPrecedence(');
    expect(wp65Harness).toContain('workingDraftGuardPrecedencePassed: true');
    expect(wp65Harness).toContain("label: 'skipped annual recovery sequence'");
    expect(wp65Harness).toContain("label: 'annual version with patch'");
    expect(wp65Harness.indexOf('assertVersionLifecycleNegatives(adminA, base)')).toBeLessThan(
      wp65Harness.indexOf("createDraft(adminA, base, versions[0], 'publish race')"),
    );
  });

  it('preserves list or review context when opening an exact item', () => {
    const workspace = source(
      'app/admin/master-catalog/_components/MasterCatalogVersionWorkspace.tsx',
    );
    const finalReview = source(
      'app/admin/master-catalog/_components/MasterCatalogFinalReviewWorkspace.tsx',
    );
    const itemEditor = source(
      'app/admin/master-catalog/_components/MasterCatalogItemEditor.tsx',
    );
    const navigation = source('lib/master-catalog/admin/navigation.ts');
    const actions = source('app/admin/master-catalog/actions.ts');

    expect(workspace).toContain('returnTo=');
    expect(finalReview).toContain('returnTo=');
    expect(itemEditor).toContain('safeCatalogItemReturnHref');
    expect(navigation).toContain('parsed.pathname !== `${fallback}/review`');
    expect(actions).toContain('redirect(catalogWithdrawSuccessHref(');
    expect(workspace).toContain('ถอนรายการใหม่ออกจากฉบับร่างแล้ว');
  });

  it('keeps compound and high-volume final review scan-friendly', () => {
    const finalReview = source(
      'app/admin/master-catalog/_components/MasterCatalogFinalReviewWorkspace.tsx',
    );

    expect(finalReview).toContain('const PAGE_SIZE_OPTIONS = [50, 100] as const');
    expect(finalReview).toContain("returnParams.set('reviewPageSize', String(pageSize))");
    expect(finalReview).toContain('aria-pressed={active}');
    expect(finalReview).toContain('ยอดแต่ละประเภทจึงอาจซ้ำกัน');
    expect(finalReview).toContain('ขยายรายละเอียดทั้งหมดในหน้านี้');
    expect(finalReview).toContain('aria-expanded={expanded}');
    expect(finalReview).toContain("surface: 'desktop' | 'mobile'");
    expect(finalReview).toContain('className="divide-y rounded-md border lg:hidden"');
    expect(finalReview).toContain('className="hidden overflow-x-auto lg:block"');
    expect(finalReview).toContain('<Label htmlFor="final-review-page" className="sr-only">');
    expect(finalReview).toContain("editable ? 'ผลเปรียบเทียบฉบับสุดท้าย' : 'ผลเปรียบเทียบที่บันทึกไว้'");
    expect(finalReview).toContain('ค่าจากฐาน:');
    expect(finalReview).toContain('ค่าของฉบับนี้:');
    expect(finalReview).not.toContain('ค่าฉบับร่าง:');
  });

  it('keeps operator labels accessible and compact on narrow screens', () => {
    const itemEditor = source(
      'app/admin/master-catalog/_components/MasterCatalogItemEditor.tsx',
    );
    const workspace = source(
      'app/admin/master-catalog/_components/MasterCatalogVersionWorkspace.tsx',
    );
    const importPanel = source(
      'app/admin/master-catalog/_components/MasterCatalogImportPanel.tsx',
    );

    expect(itemEditor).toContain('id="edit-category"');
    expect(itemEditor).toContain('id="recode-code-group"');
    expect(itemEditor).toContain('<Label htmlFor={props.id}>{props.label}</Label>');
    expect(itemEditor).toContain('id={props.id} className="w-full min-w-0"');
    expect(workspace).toContain('<Label htmlFor={triggerId}>{label}</Label>');
    expect(workspace).toContain('className="w-full min-w-0"');
    expect(workspace).toContain('aria-label="หน้าก่อน"');
    expect(workspace).toContain('aria-label="หน้าถัดไป"');
    expect(importPanel).toContain('aria-label="หน้าก่อน"');
    expect(importPanel).toContain('aria-label="หน้าถัดไป"');
  });

  it('keeps accepted placement status distinct from a new pending change', () => {
    const placementWorkspace = source(
      'app/admin/master-catalog/_components/MasterCatalogPlacementWorkspace.tsx',
    );
    const adminViews = source(
      'app/admin/master-catalog/_components/MasterCatalogAdminViews.tsx',
    );
    const versionWorkspace = source(
      'app/admin/master-catalog/_components/MasterCatalogVersionWorkspace.tsx',
    );
    const placementViewStart = adminViews.indexOf('export function MasterCatalogPlacementView');
    const placementViewEnd = adminViews.indexOf('export function MasterCatalogVersionReviewView');
    const placementView = adminViews.slice(placementViewStart, placementViewEnd);

    expect(placementWorkspace).toContain('hasCatalogPlacementDraftChanges');
    expect(placementWorkspace).toContain('placementReviewAlreadyCurrent');
    expect(placementWorkspace).toContain('hasLocalAssignmentChanges');
    expect(placementWorkspace).toContain('ตำแหน่งรายการใหม่ได้รับการยืนยันแล้ว');
    expect(placementWorkspace).toContain('มีการแก้ไขตำแหน่งที่ยังไม่ยืนยัน');
    expect(placementWorkspace).toContain('เลขลำดับรายการเดิมจะเลื่อน');
    expect(placementWorkspace).toContain('บันทึกตำแหน่งชุดนี้แล้ว');
    expect(placementView).not.toContain('ตำแหน่งชุดปัจจุบันได้รับการยืนยันแล้ว');
    expect(versionWorkspace).toContain('รายการที่เพิ่มใหม่ต้องจัดตำแหน่งก่อนเผยแพร่');
    expect(versionWorkspace).not.toContain('รายการใหม่ยังไม่ได้รับการยืนยันตำแหน่ง');
  });

  it('keeps placement review recoverable, exception-led, and keyboard complete', () => {
    const placementWorkspace = source(
      'app/admin/master-catalog/_components/MasterCatalogPlacementWorkspace.tsx',
    );

    expect(placementWorkspace).toContain('const STORAGE_SCHEMA_VERSION = 2');
    expect(placementWorkspace).toContain("window.addEventListener('beforeunload'");
    expect(placementWorkspace).toContain("document.addEventListener('click', guardSameOriginNavigation, true)");
    expect(placementWorkspace).toContain('กู้คืนตัวเลือกที่ยังไม่ยืนยันแล้ว');
    expect(placementWorkspace).toContain('restoredFromStorage && hasPendingLocalChanges');
    expect(placementWorkspace).toContain('setRestoredFromStorage(false)');
    expect(placementWorkspace).toContain('ต้องแก้');
    expect(placementWorkspace).toContain('ปรับในหน้านี้');
    expect(placementWorkspace).toContain('ข้อมูลยังไม่ครบ');
    expect(placementWorkspace).toContain('ตำแหน่งไม่ถูกต้อง');
    expect(placementWorkspace).toContain('function PlacementGapCombobox');
    expect(placementWorkspace).toContain('role="combobox"');
    expect(placementWorkspace).toContain('ช่วงที่จะวางรายการนี้');
    expect(placementWorkspace).toContain('ใช้ตำแหน่งนี้');
    expect(placementWorkspace).toContain('placementEditorTriggerRef');
    expect(placementWorkspace).toContain('confirmTriggerRef');
    expect(placementWorkspace).toContain('leaveConfirmTriggerRef');
    expect(placementWorkspace).toContain('leaveConfirmTriggerRef.current = anchor;');
    expect(placementWorkspace.match(/onCloseAutoFocus=/g)).toHaveLength(3);
    expect(placementWorkspace).toContain('onCloseAutoFocus={(event) => {');
    expect(placementWorkspace).toContain('trigger.focus({ preventScroll: true });');
    expect(placementWorkspace).toContain('ตรวจสรุปก่อนบันทึกทั้งชุด');
    expect(placementWorkspace).toContain('<details className="group min-w-0">');
    expect(placementWorkspace).toContain('เปลี่ยนลำดับในช่วงนี้');
    expect(placementWorkspace).toContain('function PlacementPositionPreview');
    expect(placementWorkspace).toContain('placementCategoryLabels');
    expect(placementWorkspace).toContain('ตำแหน่งสุดท้ายของรายการใหม่');
    expect(placementWorkspace).toContain('aria-label="ตำแหน่งสุดท้ายของรายการใหม่"');
    expect(placementWorkspace.match(/<PlacementPositionPreview/g)).toHaveLength(3);
    expect(placementWorkspace).toContain('compact\n                      finalPosition={previewIndex + 1}');
    expect(placementWorkspace).toContain('label="ก่อนหน้า"');
    expect(placementWorkspace).toContain('รายการใหม่นี้ · ลำดับหลังบันทึก');
    expect(placementWorkspace).toContain('label="ถัดไป"');
  });

  it('confirms publish, recode, and retire before high-impact submission', () => {
    const panel = source(
      'app/admin/master-catalog/_components/MasterCatalogMutationPanel.tsx',
    );
    const itemEditor = source(
      'app/admin/master-catalog/_components/MasterCatalogItemEditor.tsx',
    );
    const actions = source('app/admin/master-catalog/actions.ts');
    const publishActionStart = actions.indexOf('export async function publishCatalogVersionAction');
    const restoreActionStart = actions.indexOf('export async function restoreCatalogPointerAction');
    const publishAction = actions.slice(publishActionStart, restoreActionStart);

    expect(panel).toContain('ตรวจและยืนยันการเผยแพร่');
    expect(panel).toContain('ยืนยันการเผยแพร่เป้าหมาย {draftVersion.targetVersionString}');
    expect(panel).toContain('name="confirmedVersionString"');
    expect(panel).toContain('publishConfirmationMatches');
    expect(panel).toContain('เลขเวอร์ชันต้องตรงทุกตัวก่อนระบบจะส่งคำสั่งเผยแพร่');
    expect(panel).toContain('ส่วน BOQ เดิมยังคงผูกกับเวอร์ชันที่บันทึกไว้');

    expect(publishActionStart).toBeGreaterThan(-1);
    expect(restoreActionStart).toBeGreaterThan(publishActionStart);
    expect(publishAction).toContain(
      ".select('target_version_string,draft_reference')",
    );
    expect(publishAction).not.toContain("draftVersion?.status !== 'draft'");
    expect(actions).toContain(
      'คำขอเดิมอ้างถึง ${result.draftReference} ซึ่งถูกยกเลิก',
    );
    expect(actions).toContain(
      'คำขอเดิมอ้างถึง ${result.draftReference} ซึ่งเผยแพร่เป็นเวอร์ชัน',
    );
    expect(publishAction).toContain('validateCatalogPublishVersionConfirmation(');
    expect(publishAction.indexOf('validateCatalogPublishVersionConfirmation(')).toBeLessThan(
      publishAction.indexOf("supabase.rpc('publish_catalog_version'"),
    );

    expect(itemEditor).toContain('onSubmit={handleMutationSubmit}');
    expect(itemEditor).toContain("action !== 'recode' && action !== 'retire'");
    expect(itemEditor).toContain('mutationFormRef.current.requestSubmit()');
    expect(itemEditor).toContain('ยืนยันการยกเลิกใช้ ${item.itemCode}');
    expect(itemEditor).toContain('ยืนยันการเปลี่ยนรหัส ${item.itemCode}');
    expect(itemEditor).toContain('ประวัติและ BOQ เดิมไม่ถูกเขียนทับ');
  });

  it('keeps failures visible, understandable, and free of internal workflow labels', () => {
    const views = source(
      'app/admin/master-catalog/_components/MasterCatalogAdminViews.tsx',
    );
    const panel = source(
      'app/admin/master-catalog/_components/MasterCatalogMutationPanel.tsx',
    );
    const workspace = source(
      'app/admin/master-catalog/_components/MasterCatalogVersionWorkspace.tsx',
    );
    const importPanel = source(
      'app/admin/master-catalog/_components/MasterCatalogImportPanel.tsx',
    );
    const itemEditor = source(
      'app/admin/master-catalog/_components/MasterCatalogItemEditor.tsx',
    );
    const errorAlert = source(
      'app/admin/master-catalog/_components/MasterCatalogActionErrorAlert.tsx',
    );
    const combinedOperatorSource = [panel, workspace, importPanel, itemEditor].join('\n');

    expect(views).toContain("key={overview.defaultVersion?.id ?? 'no-base'}");
    expect(views).not.toContain('key={overview.versionRegistry?.map');
    expect(combinedOperatorSource).toContain('<MasterCatalogActionErrorAlert');
    expect(combinedOperatorSource).not.toMatch(/P-18|P-19|Master Catalog RPC/);
    expect(errorAlert).toContain('aria-live="assertive"');
    expect(errorAlert).toContain('focusRef.current?.focus()');
    expect(errorAlert).toContain('}, [state]);');
    expect(errorAlert).not.toContain(
      '[state.code, state.message, state.requestId, state.status]',
    );
    expect(errorAlert).toContain('ข้อมูลสำหรับติดตามปัญหา');
  });

  it('requires business intent, plans from issued or claimed versions, and opens the new workspace', () => {
    const panel = source(
      'app/admin/master-catalog/_components/MasterCatalogMutationPanel.tsx',
    );
    const views = source(
      'app/admin/master-catalog/_components/MasterCatalogAdminViews.tsx',
    );
    const actions = source('app/admin/master-catalog/actions.ts');
    const readModel = source('lib/master-catalog/admin/readModel.ts');
    const placementWorkspace = source(
      'app/admin/master-catalog/_components/MasterCatalogPlacementWorkspace.tsx',
    );

    expect(panel).toContain('วัตถุประสงค์ของฉบับใหม่');
    expect(panel).toContain('ประจำปีใหม่');
    expect(panel).toContain('ปรับปรุง/เพิ่มเติม');
    expect(panel).toContain('แก้ไขข้อมูลเดิม');
    expect(panel).toContain('suggestCatalogVersion');
    expect(panel).toContain('getCatalogAnnualEffectiveYearRange');
    expect(panel).toContain('effectiveYearRange?.max');
    expect(panel).toContain('เลขฉบับเป้าหมาย');
    expect(panel).toContain('จะเป็นเลขทางการเมื่อเผยแพร่เท่านั้น');
    expect(panel).toContain('นำกลับมาใช้กับร่างใหม่ได้');
    expect(panel).toContain('เช่น 2568.1.0-D001');
    expect(panel).toContain('ระบบมีร่างได้ครั้งละหนึ่งฉบับ');
    expect(panel).toContain("ยืนยันการยกเลิก {draftVersion.draftReference ?? 'ฉบับร่างนี้'}");
    expect(panel).toContain("abandoned: 'ยกเลิกฉบับร่าง'");
    expect(panel).toContain('อ่านเวอร์ชันฐานหรือทะเบียนเลขเวอร์ชันไม่ครบ');
    expect(panel).toContain('ลองโหลดทะเบียนใหม่');
    expect(panel).toContain("state.code === 'VERSION_SEQUENCE_STALE'");
    expect(panel).toContain('aria-live="polite"');
    expect(panel).toContain('router.replace(`/admin/master-catalog/versions/${state.versionId}`)');
    expect(panel).not.toContain('name="versionMinor"');
    expect(panel).not.toContain('name="versionPatch"');
    expect(actions).toContain("readCatalogVersionIntent(formData)");
    expect(actions).toContain("'expectedVersionString'");
    expect(actions).toContain("'baseVersionId'");
    expect(actions).toContain('isCatalogAnnualEffectiveYearAllowed');
    expect(actions).toContain("'VERSION_EFFECTIVE_YEAR_OUT_OF_RANGE'");
    expect(actions).toContain('สร้างฉบับร่างสำหรับเป้าหมาย ${expectedVersionString} แล้ว');
    expect(readModel).toContain(".select('version_string,status', { count: 'exact' })");
    expect(readModel).toContain(".neq('status', 'abandoned')");
    expect(readModel).toContain(".not('version_string', 'is', null)");
    expect(placementWorkspace).toContain(
      'เลขเป้าหมาย {workspace.version.targetVersionString}',
    );
    expect(readModel).toContain('VERSION_REGISTRY_PAGE_SIZE');
    expect(readModel).toContain('while (versionRegistryRows.length < versionRegistryCount)');
    expect(readModel).toContain('registryStrings.size === mappedVersionRegistry.length');
    expect(readModel).toContain('ทะเบียนเลขเวอร์ชันโหลดไม่ครบ');
    expect(views).toContain('versionRegistry={overview.versionRegistry}');
    expect(views).toContain("clone: 'สร้างฉบับร่างจากเวอร์ชันฐาน'");
  });

  it('requires a current-to-target confirmation before restoring the pointer', () => {
    const panel = source(
      'app/admin/master-catalog/_components/MasterCatalogMutationPanel.tsx',
    );

    expect(panel).toContain('ตรวจและยืนยันการคืนเวอร์ชัน');
    expect(panel).toContain('เวอร์ชันปัจจุบัน');
    expect(panel).toContain('เวอร์ชันที่จะนำกลับมาใช้');
    expect(panel).toContain('การเปลี่ยนนี้จะมีผลกับ BOQ ใหม่หลังยืนยัน');
    expect(panel).toContain('ยังยืนยันเวอร์ชันปัจจุบันไม่ได้');
    expect(panel).toContain('restorableVersions.length > 0 && currentVersionString');
    expect(panel).toContain('ยืนยันเปลี่ยนเวอร์ชันใช้งาน');
    expect(panel).toContain("restoreDraftImpact === 'becomes_current'");
    expect(panel).toContain('ผลต่อ {openDraft.draftReference');
    expect(panel).toContain('จะอ้างอิงฐานอื่นและแก้ไขหรือเผยแพร่ไม่ได้');
  });
});
