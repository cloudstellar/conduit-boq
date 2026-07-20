import { describe, expect, it } from 'vitest';
import type { CatalogPlacementAssignment } from '../lib/master-catalog/admin/placement';
import {
  CATALOG_PLACEMENT_STORAGE_SCHEMA_VERSION,
  catalogPlacementStorageKey,
  catalogPlacementStoragePrefix,
  createCatalogPlacementStoragePayload,
  parseCatalogPlacementStoragePayload,
} from '../lib/master-catalog/admin/placementStorage';

const VERSION_ID = '00000000-0000-4000-8000-000000000001';
const suggestedAssignments: CatalogPlacementAssignment[] = [
  {
    identityId: 'new-a',
    categoryId: 'category-a',
    anchorIdentityId: 'anchor-a',
    relation: 'after',
    batchOrder: 0,
  },
  {
    identityId: 'new-b',
    categoryId: 'category-a',
    anchorIdentityId: 'anchor-a',
    relation: 'after',
    batchOrder: 1,
  },
];

describe('Master Catalog placement browser storage', () => {
  it('binds browser-only choices to version, lock, and placement revision', () => {
    expect(catalogPlacementStoragePrefix(VERSION_ID)).toBe(
      `master-catalog-placement:${VERSION_ID}:`,
    );
    expect(catalogPlacementStorageKey(VERSION_ID, 7, 3)).toBe(
      `master-catalog-placement:${VERSION_ID}:7:3`,
    );
  });

  it('records whether a current payload contains an operator change', () => {
    const untouched = createCatalogPlacementStoragePayload(
      suggestedAssignments,
      suggestedAssignments,
    );
    const modified = createCatalogPlacementStoragePayload(
      [
        { ...suggestedAssignments[0], anchorIdentityId: 'anchor-b' },
        suggestedAssignments[1],
      ],
      suggestedAssignments,
    );

    expect(untouched).toMatchObject({
      schemaVersion: CATALOG_PLACEMENT_STORAGE_SCHEMA_VERSION,
      hasUserChanges: false,
    });
    expect(modified.hasUserChanges).toBe(true);
    expect(parseCatalogPlacementStoragePayload(modified, suggestedAssignments)).toMatchObject({
      schemaVersion: CATALOG_PLACEMENT_STORAGE_SCHEMA_VERSION,
      hasUserChanges: true,
    });
  });

  it('does not warn for untouched schema-3 suggestions discarded after a revision change', () => {
    const untouched = createCatalogPlacementStoragePayload(
      suggestedAssignments,
      suggestedAssignments,
    );
    const recalculatedSuggestions = [
      { ...suggestedAssignments[0], anchorIdentityId: 'anchor-new' },
      suggestedAssignments[1],
    ];

    expect(parseCatalogPlacementStoragePayload(
      untouched,
      recalculatedSuggestions,
      { requireSameScope: false },
    )).toMatchObject({ hasUserChanges: false });
  });

  it('detects modified legacy choices conservatively and rejects the wrong current scope', () => {
    const legacyPayload = {
      schemaVersion: 2,
      assignments: [
        { ...suggestedAssignments[0], anchorIdentityId: 'anchor-b' },
        suggestedAssignments[1],
      ],
    };

    expect(parseCatalogPlacementStoragePayload(
      legacyPayload,
      suggestedAssignments,
      { requireSameScope: false },
    )).toMatchObject({
      schemaVersion: 2,
      hasUserChanges: true,
    });
    expect(parseCatalogPlacementStoragePayload(
      legacyPayload,
      [suggestedAssignments[0]],
    )).toBeNull();
  });
});
