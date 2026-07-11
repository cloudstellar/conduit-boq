export interface CatalogVersionNumber {
  major: number;
  minor: number;
  patch: number;
}

export type CatalogVersionTransition = 'annual' | 'revision' | 'patch';

const VERSION_PATTERN = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/;

export function parseCatalogVersionString(value: string): CatalogVersionNumber | null {
  const match = VERSION_PATTERN.exec(value.trim());
  if (!match) return null;

  const version = {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
  return isCatalogVersionNumber(version) ? version : null;
}

export function formatCatalogVersion(version: CatalogVersionNumber): string {
  if (!isCatalogVersionNumber(version)) {
    throw new Error('Catalog version segments must be nonnegative safe integers');
  }
  return `${version.major}.${version.minor}.${version.patch}`;
}

export function classifyCatalogVersionTransition(
  base: CatalogVersionNumber,
  candidate: CatalogVersionNumber,
): CatalogVersionTransition | null {
  if (!isCatalogVersionNumber(base) || !isCatalogVersionNumber(candidate)) return null;

  if (candidate.major > base.major && candidate.minor === 0 && candidate.patch === 0) {
    return 'annual';
  }
  if (
    candidate.major === base.major
    && candidate.minor > base.minor
    && candidate.patch === 0
  ) {
    return 'revision';
  }
  if (
    candidate.major === base.major
    && candidate.minor === base.minor
    && candidate.patch > base.patch
  ) {
    return 'patch';
  }
  return null;
}

export function suggestNextCatalogRevision(
  baseVersionString: string | null,
): CatalogVersionNumber | null {
  if (!baseVersionString) return null;
  const base = parseCatalogVersionString(baseVersionString);
  if (!base) return null;
  return { major: base.major, minor: base.minor + 1, patch: 0 };
}

function isCatalogVersionNumber(value: CatalogVersionNumber): boolean {
  return [value.major, value.minor, value.patch].every(
    (segment) => Number.isSafeInteger(segment) && segment >= 0,
  );
}
