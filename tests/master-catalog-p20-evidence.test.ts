import { describe, expect, it } from 'vitest';
import { compareP20Evidence } from '../scripts/verify-master-catalog-p20-evidence.mjs';

const BASE_EVIDENCE = {
  schemaVersion: 1,
  status: 'passed',
  generatedAt: '2026-07-11T05:00:00.000Z',
  gitCommit: 'a'.repeat(40),
  environment: 'local',
  baseVersion: '2568.0.0',
  baselineDatasetHash: `sha256:${'b'.repeat(64)}`,
  baselineIdentityRows: 710,
  baselineIdentityMappingSha256: 'c'.repeat(64),
  productionTouched: false,
};

describe('P-20 independent rebuild evidence comparison', () => {
  it('passes matching evidence from separate runs on the same reviewed commit', () => {
    const result = compareP20Evidence(BASE_EVIDENCE, {
      ...BASE_EVIDENCE,
      generatedAt: '2026-07-11T06:00:00.000Z',
    });

    expect(result.status).toBe('passed');
    expect(result.sameReviewedCommit).toBe(true);
    expect(result.failures).toEqual([]);
  });

  it('fails when identity or dataset lineage differs', () => {
    const result = compareP20Evidence(BASE_EVIDENCE, {
      ...BASE_EVIDENCE,
      generatedAt: '2026-07-11T06:00:00.000Z',
      baselineIdentityMappingSha256: 'd'.repeat(64),
    });

    expect(result.status).toBe('failed');
    expect(result.failures).toContain(
      'P-20 evidence mismatch for baselineIdentityMappingSha256',
    );
  });
});
