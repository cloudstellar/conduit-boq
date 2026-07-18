import { describe, expect, it } from 'vitest';
import {
  classifyCatalogVersionTransition,
  formatCatalogVersion,
  getCatalogAnnualEffectiveYearRange,
  isCatalogAnnualEffectiveYearAllowed,
  parseCatalogVersionString,
  suggestCatalogVersion,
} from '../lib/master-catalog/versioning';

describe('Master Catalog ADR-003 version lifecycle', () => {
  it('accepts annual, revision, and patch transitions', () => {
    const base = { major: 2568, minor: 0, patch: 0 };

    expect(classifyCatalogVersionTransition(base, { major: 2570, minor: 0, patch: 0 }))
      .toBe('annual');
    expect(classifyCatalogVersionTransition(base, { major: 2570, minor: 2, patch: 0 }))
      .toBe('annual');
    expect(classifyCatalogVersionTransition(base, { major: 2568, minor: 1, patch: 0 }))
      .toBe('revision');
    expect(classifyCatalogVersionTransition(base, { major: 2568, minor: 0, patch: 1 }))
      .toBe('patch');
  });

  it('rejects duplicate, backward, and mixed-segment transitions', () => {
    const base = { major: 2568, minor: 1, patch: 2 };

    expect(classifyCatalogVersionTransition(base, base)).toBeNull();
    expect(classifyCatalogVersionTransition(base, { major: 2567, minor: 9, patch: 9 }))
      .toBeNull();
    expect(classifyCatalogVersionTransition(base, { major: 2569, minor: 1, patch: 0 }))
      .toBe('annual');
    expect(classifyCatalogVersionTransition(base, { major: 2569, minor: 0, patch: 1 }))
      .toBeNull();
    expect(classifyCatalogVersionTransition(base, { major: 2568, minor: 2, patch: 1 }))
      .toBeNull();
  });

  it('parses and formats CalVer-first catalog versions', () => {
    expect(parseCatalogVersionString('2568.0.0')).toEqual({ major: 2568, minor: 0, patch: 0 });
    expect(parseCatalogVersionString('02568.0.0')).toBeNull();
    expect(parseCatalogVersionString('2147483648.0.0')).toBeNull();
    expect(formatCatalogVersion({ major: 2570, minor: 3, patch: 0 })).toBe('2570.3.0');
  });

  it('plans from issued or currently claimed versions and ignores abandoned targets', () => {
    const registry = [
      { targetVersionString: '2568.0.0', status: 'active' },
      { targetVersionString: '2568.1.0', status: 'abandoned' },
      { targetVersionString: 'not-a-version', status: 'abandoned' },
    ];

    expect(suggestCatalogVersion({
      baseVersionString: '2568.0.0',
      transition: 'revision',
      registry,
    })).toEqual({
      transition: 'revision',
      version: { major: 2568, minor: 1, patch: 0 },
      occupiedVersions: [],
    });
    expect(suggestCatalogVersion({
      baseVersionString: '2568.0.0',
      transition: 'patch',
      registry,
    })).toEqual({
      transition: 'patch',
      version: { major: 2568, minor: 0, patch: 1 },
      occupiedVersions: [],
    });
  });

  it('reuses an unissued annual target after its draft is abandoned', () => {
    const suggestion = suggestCatalogVersion({
      baseVersionString: '2568.0.0',
      transition: 'annual',
      effectiveYear: 2569,
      registry: [
        { targetVersionString: '2568.0.0', status: 'active' },
        { targetVersionString: '2569.0.0', status: 'abandoned' },
      ],
    });

    expect(suggestion).toEqual({
      transition: 'annual',
      version: { major: 2569, minor: 0, patch: 0 },
      occupiedVersions: [],
    });
    expect(suggestCatalogVersion({
      baseVersionString: '2568.0.0',
      transition: 'annual',
      effectiveYear: 2568,
      registry: [],
    })).toBeNull();
  });

  it('never reuses an issued or currently claimed target', () => {
    expect(suggestCatalogVersion({
      baseVersionString: '2568.0.0',
      transition: 'revision',
      registry: [
        { targetVersionString: '2568.0.0', status: 'active' },
        { targetVersionString: '2568.1.0', status: 'archived' },
        { targetVersionString: '2568.2.0', status: 'draft' },
      ],
    })).toEqual({
      transition: 'revision',
      version: { major: 2568, minor: 3, patch: 0 },
      occupiedVersions: [
        { targetVersionString: '2568.1.0', status: 'archived' },
        { targetVersionString: '2568.2.0', status: 'draft' },
      ],
    });
  });

  it('limits owner-designated annual years to the next ten years', () => {
    const base = { major: 2568, minor: 0, patch: 0 };

    expect(getCatalogAnnualEffectiveYearRange(base)).toEqual({ min: 2569, max: 2578 });
    expect(isCatalogAnnualEffectiveYearAllowed(base, 2569)).toBe(true);
    expect(isCatalogAnnualEffectiveYearAllowed(base, 2578)).toBe(true);
    expect(isCatalogAnnualEffectiveYearAllowed(base, 2568)).toBe(false);
    expect(isCatalogAnnualEffectiveYearAllowed(base, 2579)).toBe(false);
    expect(suggestCatalogVersion({
      baseVersionString: '2568.0.0',
      transition: 'annual',
      effectiveYear: 2579,
      registry: [],
    })).toBeNull();
  });
});
