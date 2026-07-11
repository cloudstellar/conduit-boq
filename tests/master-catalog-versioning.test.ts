import { describe, expect, it } from 'vitest';
import {
  classifyCatalogVersionTransition,
  formatCatalogVersion,
  parseCatalogVersionString,
  suggestNextCatalogRevision,
} from '../lib/master-catalog/versioning';

describe('Master Catalog ADR-003 version lifecycle', () => {
  it('accepts annual, revision, and patch transitions', () => {
    const base = { major: 2568, minor: 0, patch: 0 };

    expect(classifyCatalogVersionTransition(base, { major: 2570, minor: 0, patch: 0 }))
      .toBe('annual');
    expect(classifyCatalogVersionTransition(base, { major: 2568, minor: 1, patch: 0 }))
      .toBe('revision');
    expect(classifyCatalogVersionTransition(base, { major: 2568, minor: 0, patch: 1 }))
      .toBe('patch');
  });

  it('rejects duplicate, backward, and mixed transitions', () => {
    const base = { major: 2568, minor: 1, patch: 2 };

    expect(classifyCatalogVersionTransition(base, base)).toBeNull();
    expect(classifyCatalogVersionTransition(base, { major: 2567, minor: 9, patch: 9 }))
      .toBeNull();
    expect(classifyCatalogVersionTransition(base, { major: 2569, minor: 1, patch: 0 }))
      .toBeNull();
    expect(classifyCatalogVersionTransition(base, { major: 2568, minor: 2, patch: 1 }))
      .toBeNull();
  });

  it('parses, formats, and suggests the next revision without candidate hardcoding', () => {
    expect(parseCatalogVersionString('2568.0.0')).toEqual({ major: 2568, minor: 0, patch: 0 });
    expect(parseCatalogVersionString('02568.0.0')).toBeNull();
    expect(suggestNextCatalogRevision('2570.2.4')).toEqual({ major: 2570, minor: 3, patch: 0 });
    expect(formatCatalogVersion({ major: 2570, minor: 3, patch: 0 })).toBe('2570.3.0');
  });
});
