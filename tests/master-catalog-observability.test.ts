import { afterEach, describe, expect, it, vi } from 'vitest';
import { logMasterCatalogOperation } from '../lib/master-catalog/observability';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Master Catalog structured operation logs', () => {
  it('emits only bounded correlation metadata for a successful operation', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    logMasterCatalogOperation({
      operation: 'publishCatalogVersion',
      outcome: 'success',
      startedAt: Date.now() - 5,
      requestId: '00000000-0000-4000-8000-000000000101',
      versionId: '00000000-0000-4000-8000-000000000001',
      versionString: '2568.1.0',
    });

    expect(info).toHaveBeenCalledOnce();
    const event = info.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(event).toMatchObject({
      event: 'master_catalog_operation',
      operation: 'publishCatalogVersion',
      outcome: 'success',
      requestId: '00000000-0000-4000-8000-000000000101',
      versionId: '00000000-0000-4000-8000-000000000001',
      versionString: '2568.1.0',
    });
    expect(event.durationMs).toEqual(expect.any(Number));
    expect(Object.keys(event).sort()).toEqual([
      'durationMs',
      'event',
      'operation',
      'outcome',
      'requestId',
      'versionId',
      'versionString',
    ]);
  });

  it('uses error severity and strips control characters from bounded codes', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    logMasterCatalogOperation({
      operation: 'exportCatalogExcel',
      outcome: 'failed',
      startedAt: Date.now(),
      requestId: 'request\ncorrelation',
      code: `${'X'.repeat(140)}\nraw-detail`,
    });

    const event = error.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(event.requestId).toBe('request correlation');
    expect(String(event.code)).toHaveLength(128);
    expect(String(event.code)).not.toContain('\n');
  });
});
