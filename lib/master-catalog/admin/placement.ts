import type { CatalogWorkspaceItem } from './catalogWorkspace';

export type CatalogPlacementRelation = 'before' | 'after';

export interface CatalogPlacementAssignment {
  identityId: string;
  categoryId: string;
  anchorIdentityId: string;
  relation: CatalogPlacementRelation;
  batchOrder: number;
}

export interface CatalogPlacementPreview {
  orderedItems: CatalogWorkspaceItem[];
  affectedIdentityIds: string[];
}

export type CatalogPlacementAssignmentValidity = 'complete' | 'incomplete' | 'invalid';

export class CatalogPlacementValidationError extends Error {
  constructor(
    readonly code:
      | 'PLACEMENT_SCOPE_INVALID'
      | 'PLACEMENT_ANCHOR_INVALID'
      | 'PLACEMENT_ORDER_INVALID',
    message: string,
  ) {
    super(message);
    this.name = 'CatalogPlacementValidationError';
  }
}

export function suggestCatalogPlacements(
  newItems: CatalogWorkspaceItem[],
  inheritedItems: CatalogWorkspaceItem[],
): CatalogPlacementAssignment[] {
  const anchors = [...inheritedItems].sort(compareDisplayOrder);

  return [...newItems]
    .sort(compareDisplayOrder)
    .map((item, batchOrder) => {
      const sameCategory = anchors.filter((anchor) => anchor.categoryId === item.categoryId);
      const previous = sameCategory
        .filter((anchor) => anchor.displayOrder < item.displayOrder)
        .at(-1);
      const anchor = previous ?? sameCategory[0];

      return {
        identityId: item.identityId,
        categoryId: item.categoryId,
        anchorIdentityId: anchor?.identityId ?? '',
        relation: previous ? 'after' : 'before',
        batchOrder,
      };
    });
}

export function buildCatalogPlacementPreview(
  baseItems: CatalogWorkspaceItem[],
  draftItems: CatalogWorkspaceItem[],
  assignments: CatalogPlacementAssignment[],
): CatalogPlacementPreview {
  const base = [...baseItems].sort(compareDisplayOrder);
  const draft = [...draftItems].sort(compareDisplayOrder);
  const baseIdentityIds = new Set(base.map((item) => item.identityId));
  const draftByIdentity = new Map(draft.map((item) => [item.identityId, item]));
  const inherited = draft.filter((item) => baseIdentityIds.has(item.identityId));
  const newItems = draft.filter((item) => !baseIdentityIds.has(item.identityId));

  if (!sameIdentityOrder(base, inherited)) {
    throw new CatalogPlacementValidationError(
      'PLACEMENT_ORDER_INVALID',
      'ลำดับรายการเดิมไม่ตรงกับเวอร์ชันฐาน',
    );
  }

  if (
    assignments.length !== newItems.length
    || new Set(assignments.map((entry) => entry.identityId)).size !== assignments.length
    || assignments.some((entry) => baseIdentityIds.has(entry.identityId))
    || newItems.some((item) => !assignments.some((entry) => entry.identityId === item.identityId))
  ) {
    throw new CatalogPlacementValidationError(
      'PLACEMENT_SCOPE_INVALID',
      'ต้องกำหนดตำแหน่งรายการใหม่ทุกครบทุกรายการเพียงครั้งเดียว',
    );
  }

  const batchOrders = assignments.map((entry) => entry.batchOrder);
  if (
    batchOrders.some((value) => !Number.isSafeInteger(value) || value < 0)
    || new Set(batchOrders).size !== assignments.length
    || Math.min(...batchOrders) !== 0
    || Math.max(...batchOrders) !== assignments.length - 1
  ) {
    throw new CatalogPlacementValidationError(
      'PLACEMENT_ORDER_INVALID',
      'ลำดับภายในชุดต้องต่อเนื่องตั้งแต่ศูนย์',
    );
  }

  const assignmentsByAnchor = new Map<string, CatalogPlacementAssignment[]>();
  for (const assignment of assignments) {
    const item = draftByIdentity.get(assignment.identityId);
    const anchor = draftByIdentity.get(assignment.anchorIdentityId);
    if (
      !item
      || !anchor
      || !baseIdentityIds.has(anchor.identityId)
      || anchor.categoryId !== assignment.categoryId
      || assignment.identityId === assignment.anchorIdentityId
      || (assignment.relation !== 'before' && assignment.relation !== 'after')
    ) {
      throw new CatalogPlacementValidationError(
        'PLACEMENT_ANCHOR_INVALID',
        'รายการอ้างอิงต้องเป็นรายการเดิมในหมวดงานที่เลือก',
      );
    }

    const key = `${assignment.anchorIdentityId}:${assignment.relation}`;
    const group = assignmentsByAnchor.get(key) ?? [];
    group.push(assignment);
    assignmentsByAnchor.set(key, group);
  }

  const orderedItems: CatalogWorkspaceItem[] = [];
  for (const baseItem of base) {
    const inheritedItem = draftByIdentity.get(baseItem.identityId);
    if (!inheritedItem) {
      throw new CatalogPlacementValidationError(
        'PLACEMENT_SCOPE_INVALID',
        'ฉบับร่างมีรายการเดิมไม่ครบตามเวอร์ชันฐาน',
      );
    }

    appendAssignedItems('before', baseItem.identityId);
    orderedItems.push(inheritedItem);
    appendAssignedItems('after', baseItem.identityId);
  }

  const resequenced = orderedItems.map((item, displayOrder) => ({ ...item, displayOrder }));
  const affectedIdentityIds = resequenced
    .filter((item) => {
      const previous = draftByIdentity.get(item.identityId);
      return !baseIdentityIds.has(item.identityId)
        || previous?.displayOrder !== item.displayOrder
        || previous?.categoryId !== item.categoryId;
    })
    .map((item) => item.identityId);

  return { orderedItems: resequenced, affectedIdentityIds };

  function appendAssignedItems(
    relation: CatalogPlacementRelation,
    anchorIdentityId: string,
  ) {
    const entries = [...(assignmentsByAnchor.get(`${anchorIdentityId}:${relation}`) ?? [])]
      .sort((left, right) => left.batchOrder - right.batchOrder);
    for (const entry of entries) {
      const item = draftByIdentity.get(entry.identityId);
      const anchor = draftByIdentity.get(anchorIdentityId);
      if (!item || !anchor) continue;
      orderedItems.push({
        ...item,
        categoryId: entry.categoryId,
        categoryCode: anchor.categoryCode,
      });
    }
  }
}

export function hasCatalogPlacementDraftChanges(
  currentItems: CatalogWorkspaceItem[],
  previewItems: CatalogWorkspaceItem[],
): boolean {
  if (currentItems.length !== previewItems.length) return true;

  const currentByIdentity = new Map(
    currentItems.map((item) => [item.identityId, item]),
  );

  return previewItems.some((item) => {
    const current = currentByIdentity.get(item.identityId);
    return !current
      || current.displayOrder !== item.displayOrder
      || current.categoryId !== item.categoryId;
  });
}

export function catalogPlacementAssignmentsEqual(
  left: CatalogPlacementAssignment | undefined,
  right: CatalogPlacementAssignment | undefined,
): boolean {
  if (!left || !right) return false;
  return left.identityId === right.identityId
    && left.categoryId === right.categoryId
    && left.anchorIdentityId === right.anchorIdentityId
    && left.relation === right.relation
    && left.batchOrder === right.batchOrder;
}

export function getCatalogPlacementAssignmentValidity(
  assignment: CatalogPlacementAssignment,
  validAnchorIdentityIds: ReadonlySet<string>,
): CatalogPlacementAssignmentValidity {
  if (!assignment.anchorIdentityId) return 'incomplete';
  return validAnchorIdentityIds.has(assignment.anchorIdentityId)
    ? 'complete'
    : 'invalid';
}

export function resequenceCatalogPlacementAssignments(
  assignments: CatalogPlacementAssignment[],
  orderedIdentityIds: string[],
): CatalogPlacementAssignment[] {
  const byIdentity = new Map(assignments.map((entry) => [entry.identityId, entry]));
  if (
    orderedIdentityIds.length !== assignments.length
    || new Set(orderedIdentityIds).size !== assignments.length
    || orderedIdentityIds.some((identityId) => !byIdentity.has(identityId))
  ) {
    throw new CatalogPlacementValidationError(
      'PLACEMENT_SCOPE_INVALID',
      'ลำดับรายการใหม่ไม่ตรงกับชุดที่กำลังตรวจ',
    );
  }

  return orderedIdentityIds.map((identityId, batchOrder) => ({
    ...byIdentity.get(identityId)!,
    batchOrder,
  }));
}

export function moveCatalogPlacementAssignmentWithinAnchor(
  assignments: CatalogPlacementAssignment[],
  identityId: string,
  delta: -1 | 1,
): CatalogPlacementAssignment[] {
  const selected = assignments.find((entry) => entry.identityId === identityId);
  if (!selected) return assignments;

  const siblings = assignments
    .filter((entry) => (
      entry.anchorIdentityId === selected.anchorIdentityId
      && entry.relation === selected.relation
    ))
    .sort((left, right) => left.batchOrder - right.batchOrder);
  const index = siblings.findIndex((entry) => entry.identityId === identityId);
  const targetIndex = index + delta;
  if (index < 0 || targetIndex < 0 || targetIndex >= siblings.length) return assignments;

  const target = siblings[targetIndex];
  return assignments.map((entry) => {
    if (entry.identityId === selected.identityId) {
      return { ...entry, batchOrder: target.batchOrder };
    }
    if (entry.identityId === target.identityId) {
      return { ...entry, batchOrder: selected.batchOrder };
    }
    return entry;
  });
}

function compareDisplayOrder(left: CatalogWorkspaceItem, right: CatalogWorkspaceItem) {
  return left.displayOrder - right.displayOrder || left.itemCode.localeCompare(right.itemCode);
}

function sameIdentityOrder(
  baseItems: CatalogWorkspaceItem[],
  inheritedItems: CatalogWorkspaceItem[],
) {
  return baseItems.length === inheritedItems.length
    && baseItems.every((item, index) => item.identityId === inheritedItems[index]?.identityId);
}
