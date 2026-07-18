export interface CatalogVersionNumber {
  major: number;
  minor: number;
  patch: number;
}

export type CatalogVersionTransition = 'annual' | 'revision' | 'patch';

export interface CatalogVersionRegistryEntry {
  targetVersionString: string;
  status?: string;
}

export interface CatalogVersionSuggestion {
  transition: CatalogVersionTransition;
  version: CatalogVersionNumber;
  occupiedVersions: CatalogVersionRegistryEntry[];
}

export const CATALOG_VERSION_SEGMENT_MAX = 2_147_483_647;
export const CATALOG_ANNUAL_YEAR_MAX_AHEAD = 10;

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

  if (candidate.major > base.major && candidate.patch === 0) {
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

export function suggestCatalogVersion(input: {
  baseVersionString: string | null;
  transition: CatalogVersionTransition;
  registry: readonly CatalogVersionRegistryEntry[];
  effectiveYear?: number | null;
}): CatalogVersionSuggestion | null {
  if (!input.baseVersionString) return null;
  const base = parseCatalogVersionString(input.baseVersionString);
  if (!base) return null;

  const registry = normalizeRegistry(input.registry);
  let version: CatalogVersionNumber;
  let occupiedVersions: CatalogVersionRegistryEntry[];

  if (input.transition === 'annual') {
    const effectiveYear = input.effectiveYear;
    if (
      typeof effectiveYear !== 'number'
      || !isCatalogAnnualEffectiveYearAllowed(base, effectiveYear)
    ) return null;
    const sameYear = registry.filter((entry) => entry.version.major === effectiveYear);
    version = {
      major: effectiveYear,
      minor: nextSegment(sameYear.map((entry) => entry.version.minor), -1),
      patch: 0,
    };
    occupiedVersions = sameYear.map(({ reference }) => reference);
  } else if (input.transition === 'revision') {
    const sameYear = registry.filter((entry) => entry.version.major === base.major);
    version = {
      major: base.major,
      minor: nextSegment(sameYear.map((entry) => entry.version.minor), base.minor),
      patch: 0,
    };
    occupiedVersions = sameYear
      .filter((entry) => entry.version.minor > base.minor)
      .map(({ reference }) => reference);
  } else {
    const sameRevision = registry.filter(
      (entry) => entry.version.major === base.major && entry.version.minor === base.minor,
    );
    version = {
      major: base.major,
      minor: base.minor,
      patch: nextSegment(sameRevision.map((entry) => entry.version.patch), base.patch),
    };
    occupiedVersions = sameRevision
      .filter((entry) => entry.version.patch > base.patch)
      .map(({ reference }) => reference);
  }

  if (classifyCatalogVersionTransition(base, version) !== input.transition) return null;

  return {
    transition: input.transition,
    version,
    occupiedVersions,
  };
}

export function getCatalogAnnualEffectiveYearRange(
  base: CatalogVersionNumber,
): { min: number; max: number } | null {
  if (!isCatalogVersionNumber(base)) return null;

  const min = base.major + 1;
  if (min > CATALOG_VERSION_SEGMENT_MAX) return null;

  return {
    min,
    max: Math.min(base.major + CATALOG_ANNUAL_YEAR_MAX_AHEAD, CATALOG_VERSION_SEGMENT_MAX),
  };
}

export function isCatalogAnnualEffectiveYearAllowed(
  base: CatalogVersionNumber,
  effectiveYear: number | null | undefined,
): boolean {
  const range = getCatalogAnnualEffectiveYearRange(base);
  return Boolean(
    range
    && typeof effectiveYear === 'number'
    && Number.isSafeInteger(effectiveYear)
    && effectiveYear >= range.min
    && effectiveYear <= range.max,
  );
}

function normalizeRegistry(registry: readonly CatalogVersionRegistryEntry[]) {
  const unique = new Map<string, {
    reference: CatalogVersionRegistryEntry;
    version: CatalogVersionNumber;
  }>();

  for (const reference of registry) {
    if (reference.status === 'abandoned') continue;
    const version = parseCatalogVersionString(reference.targetVersionString);
    if (!version || unique.has(reference.targetVersionString)) continue;
    unique.set(reference.targetVersionString, { reference, version });
  }

  return [...unique.values()].sort((left, right) =>
    left.version.major - right.version.major
    || left.version.minor - right.version.minor
    || left.version.patch - right.version.patch);
}

function nextSegment(usedSegments: readonly number[], floor: number): number {
  return Math.max(floor, ...usedSegments) + 1;
}

function isCatalogVersionNumber(value: CatalogVersionNumber): boolean {
  return [value.major, value.minor, value.patch].every(
    (segment) => Number.isSafeInteger(segment)
      && segment >= 0
      && segment <= CATALOG_VERSION_SEGMENT_MAX,
  );
}
