import { describe, expect, it } from 'vitest';
import type { CatalogWorkspaceItem } from '../lib/master-catalog/admin/catalogWorkspace';
import {
  buildCatalogPlacementPreview,
  moveCatalogPlacementAssignmentWithinAnchor,
  resequenceCatalogPlacementAssignments,
  suggestCatalogPlacements,
} from '../lib/master-catalog/admin/placement';

const CATEGORY_A = '00000000-0000-4000-8000-000000000301';
const CATEGORY_B = '00000000-0000-4000-8000-000000000302';

function item(
  identityId: string,
  itemCode: string,
  displayOrder: number,
  categoryId = CATEGORY_A,
): CatalogWorkspaceItem {
  return {
    id: identityId,
    identityId,
    itemCode,
    itemName: `รายการ ${itemCode}`,
    unit: 'รายการ',
    materialCost: 10,
    laborCost: 5,
    unitCost: 15,
    categoryCode: categoryId === CATEGORY_A ? 'A' : 'B',
    categoryId,
    codeGroupId: null,
    isActive: true,
    displayOrder,
  };
}

const A = item('00000000-0000-4000-8000-000000000001', 'ITEM-0001', 0);
const B = item('00000000-0000-4000-8000-000000000002', 'ITEM-0002', 1);
const C = item('00000000-0000-4000-8000-000000000003', 'ITEM-0003', 2, CATEGORY_B);
const X = item('00000000-0000-4000-8000-000000000101', 'AAA-AAA-001', 3);
const Y = item('00000000-0000-4000-8000-000000000102', 'AAA-AAA-002', 4);

describe('Master Catalog placement model', () => {
  it('places multiple new identities in one batch while preserving inherited order', () => {
    const preview = buildCatalogPlacementPreview(
      [A, B, C],
      [A, B, C, X, Y],
      [
        {
          identityId: X.identityId,
          categoryId: CATEGORY_A,
          anchorIdentityId: B.identityId,
          relation: 'before',
          batchOrder: 0,
        },
        {
          identityId: Y.identityId,
          categoryId: CATEGORY_A,
          anchorIdentityId: B.identityId,
          relation: 'before',
          batchOrder: 1,
        },
      ],
    );

    expect(preview.orderedItems.map((entry) => entry.itemCode)).toEqual([
      'ITEM-0001',
      'AAA-AAA-001',
      'AAA-AAA-002',
      'ITEM-0002',
      'ITEM-0003',
    ]);
    expect(preview.orderedItems
      .filter((entry) => entry.itemCode.startsWith('ITEM'))
      .map((entry) => entry.itemCode)).toEqual(['ITEM-0001', 'ITEM-0002', 'ITEM-0003']);
    expect(preview.affectedIdentityIds).toEqual([
      X.identityId,
      Y.identityId,
      B.identityId,
      C.identityId,
    ]);
  });

  it('rejects inherited reordering and cross-category anchors', () => {
    expect(() => buildCatalogPlacementPreview(
      [A, B, C],
      [
        { ...B, displayOrder: 0 },
        { ...A, displayOrder: 1 },
        C,
        X,
      ],
      [{
        identityId: X.identityId,
        categoryId: CATEGORY_A,
        anchorIdentityId: B.identityId,
        relation: 'after',
        batchOrder: 0,
      }],
    )).toThrow('ลำดับรายการเดิมไม่ตรงกับเวอร์ชันฐาน');

    expect(() => buildCatalogPlacementPreview(
      [A, B, C],
      [A, B, C, X],
      [{
        identityId: X.identityId,
        categoryId: CATEGORY_A,
        anchorIdentityId: C.identityId,
        relation: 'after',
        batchOrder: 0,
      }],
    )).toThrow('รายการอ้างอิงต้องเป็นรายการเดิมในหมวดงานที่เลือก');
  });

  it('suggests anchors and preserves an explicit new-item sibling order', () => {
    const suggestions = suggestCatalogPlacements([X, Y], [A, B, C]);
    expect(suggestions.map((entry) => ({
      anchor: entry.anchorIdentityId,
      relation: entry.relation,
      order: entry.batchOrder,
    }))).toEqual([
      { anchor: B.identityId, relation: 'after', order: 0 },
      { anchor: B.identityId, relation: 'after', order: 1 },
    ]);

    expect(resequenceCatalogPlacementAssignments(
      suggestions,
      [Y.identityId, X.identityId],
    ).map((entry) => [entry.identityId, entry.batchOrder])).toEqual([
      [Y.identityId, 0],
      [X.identityId, 1],
    ]);
  });

  it('moves only within the same anchor and relation group', () => {
    const assignments = [
      {
        identityId: X.identityId,
        categoryId: CATEGORY_A,
        anchorIdentityId: B.identityId,
        relation: 'after' as const,
        batchOrder: 0,
      },
      {
        identityId: '00000000-0000-4000-8000-000000000103',
        categoryId: CATEGORY_A,
        anchorIdentityId: A.identityId,
        relation: 'after' as const,
        batchOrder: 1,
      },
      {
        identityId: Y.identityId,
        categoryId: CATEGORY_A,
        anchorIdentityId: B.identityId,
        relation: 'after' as const,
        batchOrder: 2,
      },
    ];

    const moved = moveCatalogPlacementAssignmentWithinAnchor(
      assignments,
      Y.identityId,
      -1,
    );

    expect(moved.map((entry) => [entry.identityId, entry.batchOrder])).toEqual([
      [X.identityId, 2],
      ['00000000-0000-4000-8000-000000000103', 1],
      [Y.identityId, 0],
    ]);
    expect(moveCatalogPlacementAssignmentWithinAnchor(
      moved,
      Y.identityId,
      -1,
    )).toBe(moved);
  });
});
