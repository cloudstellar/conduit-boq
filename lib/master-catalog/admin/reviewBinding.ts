export type CatalogReviewBindingState =
  | 'canonicalize'
  | 'current'
  | 'stale'
  | 'unavailable'
  | 'historical';

export interface CatalogReviewBinding {
  state: CatalogReviewBindingState;
  requestedLockVersion: number | null;
  currentLockVersion: number | null;
}

export function parseCatalogReviewLock(
  value: string | string[] | undefined,
): number | null {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export function resolveCatalogReviewBinding({
  isDraft,
  requestedLockVersion,
  currentLockVersion,
}: {
  isDraft: boolean;
  requestedLockVersion: number | null;
  currentLockVersion: number | null;
}): CatalogReviewBinding {
  if (!isDraft) {
    return {
      state: 'historical',
      requestedLockVersion,
      currentLockVersion,
    };
  }

  if (currentLockVersion === null) {
    return {
      state: 'unavailable',
      requestedLockVersion,
      currentLockVersion,
    };
  }

  if (requestedLockVersion === null) {
    return {
      state: 'canonicalize',
      requestedLockVersion,
      currentLockVersion,
    };
  }

  return {
    state: requestedLockVersion === currentLockVersion ? 'current' : 'stale',
    requestedLockVersion,
    currentLockVersion,
  };
}
