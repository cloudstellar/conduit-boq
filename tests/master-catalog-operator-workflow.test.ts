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
    expect(review).toContain('lockVersion: snapshot.reviewedLockVersion');

    const route = source(
      'app/admin/master-catalog/versions/[versionId]/review/page.tsx',
    );
    expect(route).toContain('loadCatalogVersionReview');
    expect(route).toContain('MasterCatalogVersionReviewView');
  });

  it('keeps abandon server-owned, audited, and separate from deletion', () => {
    const actions = source('app/admin/master-catalog/actions.ts');
    const panel = source(
      'app/admin/master-catalog/_components/MasterCatalogMutationPanel.tsx',
    );

    expect(actions).toContain("supabase.rpc('abandon_catalog_draft'");
    expect(actions).toContain("operation: 'abandonCatalogDraft'");
    expect(panel).toContain('<DialogTrigger asChild>');
    expect(panel).toContain('ยืนยันการยกเลิกฉบับร่าง');
    expect(panel).toContain('ยืนยันและเก็บเป็นประวัติ');
    expect(panel).toContain('expectedLockVersion');
    expect(panel).not.toContain('delete_catalog_draft');

    const wp65Harness = source('scripts/smoke-master-catalog-wp65.mjs');
    expect(wp65Harness).toContain("target.rpc('abandon_catalog_draft'");
    expect(wp65Harness).toContain('abandonedFixtureDrafts === 3');
    expect(wp65Harness).toContain('minor: maxMinor + 1 + index');
    expect(wp65Harness).not.toContain('minor: maxMinor + 100 + index');
    expect(wp65Harness).toContain('assertVersionLifecycleNegatives(adminA, base)');
    expect(wp65Harness).toContain('assertWorkingDraftGuardPrecedence(');
    expect(wp65Harness).toContain('workingDraftGuardPrecedencePassed: true');
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

    expect(workspace).toContain('returnTo=');
    expect(finalReview).toContain('returnTo=');
    expect(itemEditor).toContain('safeItemReturnHref');
    expect(itemEditor).toContain('parsed.pathname !== `${fallback}/review`');
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

  it('requires business intent, plans from the complete registry, and opens the new workspace', () => {
    const panel = source(
      'app/admin/master-catalog/_components/MasterCatalogMutationPanel.tsx',
    );
    const views = source(
      'app/admin/master-catalog/_components/MasterCatalogAdminViews.tsx',
    );
    const actions = source('app/admin/master-catalog/actions.ts');
    const readModel = source('lib/master-catalog/admin/readModel.ts');

    expect(panel).toContain('วัตถุประสงค์ของฉบับใหม่');
    expect(panel).toContain('ประจำปีใหม่');
    expect(panel).toContain('ปรับปรุง/เพิ่มเติม');
    expect(panel).toContain('แก้ไขข้อมูลเดิม');
    expect(panel).toContain('suggestCatalogVersion');
    expect(panel).toContain('getCatalogAnnualEffectiveYearRange');
    expect(panel).toContain('effectiveYearRange?.max');
    expect(panel).toContain('เลขฉบับที่จะสร้าง');
    expect(panel).toContain('ระบบจึงไม่ใช้เลขเดิมซ้ำ');
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
    expect(readModel).toContain(".select('version_string,status', { count: 'exact' })");
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
  });
});
