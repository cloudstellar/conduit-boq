import {
  catalogPlacementAssignmentsEqual,
  type CatalogPlacementAssignment,
} from './placement';

export const CATALOG_PLACEMENT_STORAGE_SCHEMA_VERSION = 3;
const LEGACY_STORAGE_SCHEMA_VERSION = 2;

export interface CatalogPlacementStoredDraft {
  schemaVersion: 2 | 3;
  assignments: CatalogPlacementAssignment[];
  hasUserChanges: boolean;
}

export function catalogPlacementStoragePrefix(versionId: string) {
  return `master-catalog-placement:${versionId}:`;
}

export function catalogPlacementStorageKey(
  versionId: string,
  lockVersion: number,
  placementRevision: number,
) {
  return `${catalogPlacementStoragePrefix(versionId)}${lockVersion}:${placementRevision}`;
}

export function createCatalogPlacementStoragePayload(
  assignments: CatalogPlacementAssignment[],
  suggestedAssignments: CatalogPlacementAssignment[],
) {
  return {
    schemaVersion: CATALOG_PLACEMENT_STORAGE_SCHEMA_VERSION,
    assignments,
    hasUserChanges: !catalogPlacementAssignmentSetsEqual(
      assignments,
      suggestedAssignments,
    ),
  } as const;
}

export function parseCatalogPlacementStoragePayload(
  value: unknown,
  suggestedAssignments: CatalogPlacementAssignment[],
  options: { requireSameScope?: boolean } = {},
): CatalogPlacementStoredDraft | null {
  if (!isRecord(value) || !('assignments' in value)) return null;
  if (
    value.schemaVersion !== CATALOG_PLACEMENT_STORAGE_SCHEMA_VERSION
    && value.schemaVersion !== LEGACY_STORAGE_SCHEMA_VERSION
  ) {
    return null;
  }

  const assignments = parseStoredPlacementAssignments(value.assignments);
  if (!assignments) return null;
  if (
    options.requireSameScope !== false
    && !samePlacementIdentityScope(assignments, suggestedAssignments)
  ) {
    return null;
  }

  if (value.schemaVersion === CATALOG_PLACEMENT_STORAGE_SCHEMA_VERSION) {
    if (typeof value.hasUserChanges !== 'boolean') return null;
    return {
      schemaVersion: value.schemaVersion,
      assignments,
      hasUserChanges: value.hasUserChanges,
    };
  }

  return {
    schemaVersion: value.schemaVersion,
    assignments,
    hasUserChanges: !catalogPlacementAssignmentSetsEqual(
      assignments,
      suggestedAssignments,
    ),
  };
}

function catalogPlacementAssignmentSetsEqual(
  left: CatalogPlacementAssignment[],
  right: CatalogPlacementAssignment[],
) {
  if (left.length !== right.length) return false;
  const rightByIdentity = new Map(right.map((entry) => [entry.identityId, entry]));
  return left.every((entry) => catalogPlacementAssignmentsEqual(
    entry,
    rightByIdentity.get(entry.identityId),
  ));
}

function samePlacementIdentityScope(
  left: CatalogPlacementAssignment[],
  right: CatalogPlacementAssignment[],
) {
  if (left.length !== right.length) return false;
  const rightIdentityIds = new Set(right.map((entry) => entry.identityId));
  return left.every((entry) => rightIdentityIds.has(entry.identityId));
}

function parseStoredPlacementAssignments(
  value: unknown,
): CatalogPlacementAssignment[] | null {
  if (!Array.isArray(value) || !value.every(isStoredPlacementAssignment)) return null;
  if (new Set(value.map((entry) => entry.identityId)).size !== value.length) return null;
  return value;
}

function isStoredPlacementAssignment(
  entry: unknown,
): entry is CatalogPlacementAssignment {
  return isRecord(entry)
    && typeof entry.identityId === 'string'
    && typeof entry.categoryId === 'string'
    && typeof entry.anchorIdentityId === 'string'
    && (entry.relation === 'before' || entry.relation === 'after')
    && Number.isSafeInteger(entry.batchOrder)
    && Number(entry.batchOrder) >= 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
