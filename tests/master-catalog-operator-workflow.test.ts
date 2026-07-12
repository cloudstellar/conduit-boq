import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), 'utf8');
}

describe('Master Catalog P-22 operator workflow', () => {
  it('keeps the item workspace before history and final review on a draft page', () => {
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
    expect(detail.indexOf('/review')).toBeGreaterThan(detail.indexOf('<RecentImports'));
    expect(detail).not.toContain('เผยแพร่เวอร์ชันนี้');
    expect(detail).toContain('<MasterCatalogDraftAbandonPanel');
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
});
