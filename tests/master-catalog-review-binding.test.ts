import { describe, expect, it } from 'vitest';
import {
  parseCatalogReviewLock,
  resolveCatalogReviewBinding,
} from '../lib/master-catalog/admin/reviewBinding';

describe('Master Catalog final-review binding', () => {
  it('accepts only one safe nonnegative lock value', () => {
    expect(parseCatalogReviewLock('0')).toBe(0);
    expect(parseCatalogReviewLock('42')).toBe(42);
    expect(parseCatalogReviewLock('-1')).toBeNull();
    expect(parseCatalogReviewLock('1.0')).toBeNull();
    expect(parseCatalogReviewLock(['1', '2'])).toBeNull();
    expect(parseCatalogReviewLock(undefined)).toBeNull();
  });

  it('canonicalizes a new draft review to its current lock', () => {
    expect(resolveCatalogReviewBinding({
      isDraft: true,
      requestedLockVersion: null,
      currentLockVersion: 3,
    })).toEqual({
      state: 'canonicalize',
      requestedLockVersion: null,
      currentLockVersion: 3,
    });
  });

  it('keeps a matching draft review publishable', () => {
    expect(resolveCatalogReviewBinding({
      isDraft: true,
      requestedLockVersion: 3,
      currentLockVersion: 3,
    }).state).toBe('current');
  });

  it('keeps an old tab stale instead of silently adopting the latest lock', () => {
    expect(resolveCatalogReviewBinding({
      isDraft: true,
      requestedLockVersion: 2,
      currentLockVersion: 3,
    })).toEqual({
      state: 'stale',
      requestedLockVersion: 2,
      currentLockVersion: 3,
    });
  });

  it('never labels a published version as a stale draft review', () => {
    expect(resolveCatalogReviewBinding({
      isDraft: false,
      requestedLockVersion: 1,
      currentLockVersion: 2,
    }).state).toBe('historical');
  });
});
