import { describe, expect, it } from 'vitest';
import {
  buildCatalogFinalReviewSnapshot,
  buildCatalogFinalSnapshotDiff,
} from '../lib/master-catalog/admin/catalogDiff';
import type { CatalogWorkspaceItem } from '../lib/master-catalog/admin/catalogWorkspace';

function item(
  identityId: string,
  overrides: Partial<CatalogWorkspaceItem> = {},
): CatalogWorkspaceItem {
  return {
    id: `row-${identityId}`,
    identityId,
    itemCode: `ITEM-${identityId.padStart(4, '0')}`,
    itemName: `รายการ ${identityId}`,
    unit: 'หน่วย',
    materialCost: 10,
    laborCost: 5,
    unitCost: 15,
    categoryCode: 'CAT-A',
    categoryId: `category-${identityId}`,
    codeGroupId: null,
    isActive: true,
    displayOrder: Number(identityId),
    ...overrides,
  };
}

describe('Master Catalog final snapshot diff', () => {
  it('classifies each final change group and counts affected identities once', () => {
    const base = [
      item('1'),
      item('2'),
      item('3'),
      item('4'),
      item('5'),
      item('6'),
      item('7'),
      item('8'),
    ];
    const draft = [
      item('1'),
      item('2', { itemCode: 'CIC-PVC-002' }),
      item('3', { itemName: 'ชื่อใหม่', unit: 'ชุด' }),
      item('4', { materialCost: 12, unitCost: 17 }),
      item('5', { categoryCode: 'CAT-B', categoryId: 'different-version-category-id' }),
      item('6', { isActive: false }),
      item('7', { displayOrder: 70 }),
      item('8', {
        itemCode: 'CIC-PVC-008',
        itemName: 'เปลี่ยนหลายช่อง',
        materialCost: 20,
        laborCost: 10,
        unitCost: 30,
        categoryCode: 'CAT-C',
        isActive: false,
        displayOrder: 80,
      }),
      item('9', { itemCode: 'CIC-PVC-009', displayOrder: 90 }),
    ];

    const diff = buildCatalogFinalSnapshotDiff(base, draft);

    expect(diff.summary).toEqual({
      baseItemCount: 8,
      draftItemCount: 9,
      affectedItemCount: 8,
      addedCount: 1,
      recodedCount: 2,
      detailsCount: 2,
      priceCount: 2,
      categoryCount: 2,
      statusCount: 2,
      orderCount: 2,
      missingFromDraftCount: 0,
      unchangedCount: 1,
      authoritySensitiveCount: 4,
    });

    expect(diff.rows.find((row) => row.identityId === '8')?.changeTypes).toEqual([
      'recoded',
      'details',
      'price',
      'category',
      'status',
      'order',
    ]);
    expect(diff.rows.find((row) => row.identityId === '8')?.fields).toHaveLength(8);
    expect(diff.rows.find((row) => row.identityId === '9')?.changeTypes).toEqual(['added']);
  });

  it('treats a reverted item as unchanged because final snapshots match', () => {
    const base = item('1');
    const finalDraft = { ...base, id: 'draft-row-1', categoryId: 'draft-category-id' };

    const diff = buildCatalogFinalSnapshotDiff([base], [finalDraft]);

    expect(diff.summary.affectedItemCount).toBe(0);
    expect(diff.summary.unchangedCount).toBe(1);
    expect(diff.rows[0]).toMatchObject({
      changeTypes: ['unchanged'],
      fields: [],
    });
  });

  it('fails closed when either snapshot is incomplete or contains duplicate identity rows', () => {
    expect(buildCatalogFinalReviewSnapshot({
      baseItems: [item('1')],
      draftItems: [item('1')],
      expectedBaseItemCount: 2,
      expectedDraftItemCount: 1,
      beforeLockVersion: 3,
      afterLockVersion: 3,
    })).toMatchObject({
      state: 'incomplete',
      reviewedLockVersion: null,
      diff: null,
      issues: [{ code: 'BASE_SNAPSHOT_INCOMPLETE' }],
    });

    expect(buildCatalogFinalReviewSnapshot({
      baseItems: [item('1')],
      draftItems: [item('1'), item('1', { id: 'duplicate-row' })],
      expectedBaseItemCount: 1,
      expectedDraftItemCount: 2,
      beforeLockVersion: 3,
      afterLockVersion: 3,
    })).toMatchObject({
      state: 'incomplete',
      issues: [{ code: 'DRAFT_IDENTITY_DUPLICATED' }],
    });
  });

  it('fails closed when an inherited base identity is missing from the draft', () => {
    const review = buildCatalogFinalReviewSnapshot({
      baseItems: [item('1'), item('2')],
      draftItems: [item('1')],
      expectedBaseItemCount: 2,
      expectedDraftItemCount: 1,
      beforeLockVersion: 3,
      afterLockVersion: 3,
    });

    expect(review).toMatchObject({
      state: 'incomplete',
      reviewedLockVersion: null,
      diff: null,
      issues: [{ code: 'BASE_IDENTITY_MISSING_FROM_DRAFT' }],
    });
  });

  it('invalidates review when the draft lock changes during snapshot reads', () => {
    expect(buildCatalogFinalReviewSnapshot({
      baseItems: [item('1')],
      draftItems: [item('1')],
      expectedBaseItemCount: 1,
      expectedDraftItemCount: 1,
      beforeLockVersion: 3,
      afterLockVersion: 4,
    })).toEqual({
      state: 'stale',
      reviewedLockVersion: null,
      diff: null,
      issues: [{
        code: 'DRAFT_CHANGED_DURING_REVIEW',
        message: 'ฉบับร่างเปลี่ยนระหว่างโหลดผลเปรียบเทียบ กรุณาตรวจใหม่',
      }],
    });
  });

  it('returns the exact reviewed lock for a complete stable snapshot', () => {
    const review = buildCatalogFinalReviewSnapshot({
      baseItems: [item('1')],
      draftItems: [item('1', { itemName: 'ชื่อใหม่' })],
      expectedBaseItemCount: 1,
      expectedDraftItemCount: 1,
      beforeLockVersion: 7,
      afterLockVersion: 7,
    });

    expect(review.state).toBe('ready');
    expect(review.reviewedLockVersion).toBe(7);
    expect(review.diff?.summary).toMatchObject({
      affectedItemCount: 1,
      detailsCount: 1,
    });
  });
});
