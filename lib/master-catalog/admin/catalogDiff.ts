import type { CatalogWorkspaceItem } from './catalogWorkspace';

export type CatalogFinalChangeType =
  | 'added'
  | 'recoded'
  | 'details'
  | 'price'
  | 'category'
  | 'status'
  | 'order'
  | 'missing'
  | 'unchanged';

export type CatalogDiffField =
  | 'itemCode'
  | 'itemName'
  | 'unit'
  | 'materialCost'
  | 'laborCost'
  | 'unitCost'
  | 'categoryCode'
  | 'isActive'
  | 'displayOrder';

export interface CatalogFieldDifference {
  field: CatalogDiffField;
  baseValue: string | number | boolean | null;
  draftValue: string | number | boolean | null;
}

export interface CatalogFinalDiffRow {
  identityId: string;
  baseItem: CatalogWorkspaceItem | null;
  draftItem: CatalogWorkspaceItem | null;
  changeTypes: CatalogFinalChangeType[];
  fields: CatalogFieldDifference[];
}

export interface CatalogFinalDiffSummary {
  baseItemCount: number;
  draftItemCount: number;
  affectedItemCount: number;
  addedCount: number;
  recodedCount: number;
  detailsCount: number;
  priceCount: number;
  categoryCount: number;
  statusCount: number;
  orderCount: number;
  missingFromDraftCount: number;
  unchangedCount: number;
  authoritySensitiveCount: number;
}

export interface CatalogFinalSnapshotDiff {
  rows: CatalogFinalDiffRow[];
  summary: CatalogFinalDiffSummary;
}

export type CatalogFinalReviewIssueCode =
  | 'DRAFT_CHANGED_DURING_REVIEW'
  | 'BASE_SNAPSHOT_INCOMPLETE'
  | 'DRAFT_SNAPSHOT_INCOMPLETE'
  | 'BASE_IDENTITY_DUPLICATED'
  | 'DRAFT_IDENTITY_DUPLICATED'
  | 'BASE_IDENTITY_MISSING_FROM_DRAFT';

export interface CatalogFinalReviewIssue {
  code: CatalogFinalReviewIssueCode;
  message: string;
}

export interface CatalogFinalReviewSnapshot {
  state: 'ready' | 'stale' | 'incomplete';
  reviewedLockVersion: number | null;
  diff: CatalogFinalSnapshotDiff | null;
  issues: CatalogFinalReviewIssue[];
}

export interface BuildCatalogFinalReviewSnapshotInput {
  baseItems: CatalogWorkspaceItem[];
  draftItems: CatalogWorkspaceItem[];
  expectedBaseItemCount: number;
  expectedDraftItemCount: number;
  beforeLockVersion: number;
  afterLockVersion: number;
}

const COMPARED_FIELDS: Array<{
  field: CatalogDiffField;
  type: Exclude<CatalogFinalChangeType, 'added' | 'missing' | 'unchanged'>;
}> = [
  { field: 'itemCode', type: 'recoded' },
  { field: 'itemName', type: 'details' },
  { field: 'unit', type: 'details' },
  { field: 'materialCost', type: 'price' },
  { field: 'laborCost', type: 'price' },
  { field: 'unitCost', type: 'price' },
  { field: 'categoryCode', type: 'category' },
  { field: 'isActive', type: 'status' },
  { field: 'displayOrder', type: 'order' },
];

export function buildCatalogFinalReviewSnapshot({
  baseItems,
  draftItems,
  expectedBaseItemCount,
  expectedDraftItemCount,
  beforeLockVersion,
  afterLockVersion,
}: BuildCatalogFinalReviewSnapshotInput): CatalogFinalReviewSnapshot {
  if (beforeLockVersion !== afterLockVersion) {
    return {
      state: 'stale',
      reviewedLockVersion: null,
      diff: null,
      issues: [{
        code: 'DRAFT_CHANGED_DURING_REVIEW',
        message: 'ฉบับร่างเปลี่ยนระหว่างโหลดผลเปรียบเทียบ กรุณาตรวจใหม่',
      }],
    };
  }

  const issues: CatalogFinalReviewIssue[] = [];

  if (baseItems.length !== expectedBaseItemCount) {
    issues.push({
      code: 'BASE_SNAPSHOT_INCOMPLETE',
      message: `โหลดเวอร์ชันฐานได้ ${baseItems.length} จาก ${expectedBaseItemCount} รายการ`,
    });
  }

  if (draftItems.length !== expectedDraftItemCount) {
    issues.push({
      code: 'DRAFT_SNAPSHOT_INCOMPLETE',
      message: `โหลดฉบับร่างได้ ${draftItems.length} จาก ${expectedDraftItemCount} รายการ`,
    });
  }

  if (hasDuplicateIdentity(baseItems)) {
    issues.push({
      code: 'BASE_IDENTITY_DUPLICATED',
      message: 'เวอร์ชันฐานมีตัวตนรายการซ้ำ จึงเปรียบเทียบอย่างปลอดภัยไม่ได้',
    });
  }

  if (hasDuplicateIdentity(draftItems)) {
    issues.push({
      code: 'DRAFT_IDENTITY_DUPLICATED',
      message: 'ฉบับร่างมีตัวตนรายการซ้ำ จึงเปรียบเทียบอย่างปลอดภัยไม่ได้',
    });
  }

  if (issues.length > 0) {
    return {
      state: 'incomplete',
      reviewedLockVersion: null,
      diff: null,
      issues,
    };
  }

  const diff = buildCatalogFinalSnapshotDiff(baseItems, draftItems);

  if (diff.summary.missingFromDraftCount > 0) {
    return {
      state: 'incomplete',
      reviewedLockVersion: null,
      diff: null,
      issues: [{
        code: 'BASE_IDENTITY_MISSING_FROM_DRAFT',
        message: 'ฉบับร่างขาดรายการที่สืบทอดจากเวอร์ชันฐาน กรุณาตรวจความครบถ้วนก่อนเผยแพร่',
      }],
    };
  }

  return {
    state: 'ready',
    reviewedLockVersion: afterLockVersion,
    diff,
    issues: [],
  };
}

export function buildCatalogFinalSnapshotDiff(
  baseItems: CatalogWorkspaceItem[],
  draftItems: CatalogWorkspaceItem[],
): CatalogFinalSnapshotDiff {
  const baseByIdentity = new Map(baseItems.map((item) => [item.identityId, item]));
  const draftByIdentity = new Map(draftItems.map((item) => [item.identityId, item]));
  const identityIds = new Set([...baseByIdentity.keys(), ...draftByIdentity.keys()]);

  const rows = [...identityIds]
    .map((identityId) => compareCatalogItem(
      identityId,
      baseByIdentity.get(identityId) ?? null,
      draftByIdentity.get(identityId) ?? null,
    ))
    .sort(compareDiffRows);

  const changedRows = rows.filter((row) => !row.changeTypes.includes('unchanged'));
  const countType = (type: CatalogFinalChangeType) =>
    rows.filter((row) => row.changeTypes.includes(type)).length;

  return {
    rows,
    summary: {
      baseItemCount: baseItems.length,
      draftItemCount: draftItems.length,
      affectedItemCount: changedRows.length,
      addedCount: countType('added'),
      recodedCount: countType('recoded'),
      detailsCount: countType('details'),
      priceCount: countType('price'),
      categoryCount: countType('category'),
      statusCount: countType('status'),
      orderCount: countType('order'),
      missingFromDraftCount: countType('missing'),
      unchangedCount: countType('unchanged'),
      authoritySensitiveCount: rows.filter((row) => (
        row.changeTypes.includes('details')
        || row.changeTypes.includes('price')
        || row.changeTypes.includes('added')
      )).length,
    },
  };
}

function compareCatalogItem(
  identityId: string,
  baseItem: CatalogWorkspaceItem | null,
  draftItem: CatalogWorkspaceItem | null,
): CatalogFinalDiffRow {
  if (!baseItem && draftItem) {
    return {
      identityId,
      baseItem: null,
      draftItem,
      changeTypes: ['added'],
      fields: COMPARED_FIELDS.map(({ field }) => ({
        field,
        baseValue: null,
        draftValue: draftItem[field],
      })),
    };
  }

  if (baseItem && !draftItem) {
    return {
      identityId,
      baseItem,
      draftItem: null,
      changeTypes: ['missing'],
      fields: COMPARED_FIELDS.map(({ field }) => ({
        field,
        baseValue: baseItem[field],
        draftValue: null,
      })),
    };
  }

  if (!baseItem || !draftItem) {
    throw new Error('Catalog diff identity has no base or draft row');
  }

  const fields: CatalogFieldDifference[] = [];
  const changeTypes = new Set<CatalogFinalChangeType>();

  for (const { field, type } of COMPARED_FIELDS) {
    if (baseItem[field] !== draftItem[field]) {
      fields.push({
        field,
        baseValue: baseItem[field],
        draftValue: draftItem[field],
      });
      changeTypes.add(type);
    }
  }

  return {
    identityId,
    baseItem,
    draftItem,
    changeTypes: changeTypes.size > 0 ? [...changeTypes] : ['unchanged'],
    fields,
  };
}

function compareDiffRows(left: CatalogFinalDiffRow, right: CatalogFinalDiffRow) {
  const leftItem = left.draftItem ?? left.baseItem;
  const rightItem = right.draftItem ?? right.baseItem;
  return (leftItem?.displayOrder ?? Number.MAX_SAFE_INTEGER)
    - (rightItem?.displayOrder ?? Number.MAX_SAFE_INTEGER)
    || (leftItem?.itemCode ?? '').localeCompare(rightItem?.itemCode ?? '', 'en');
}

function hasDuplicateIdentity(items: CatalogWorkspaceItem[]) {
  return new Set(items.map((item) => item.identityId)).size !== items.length;
}
