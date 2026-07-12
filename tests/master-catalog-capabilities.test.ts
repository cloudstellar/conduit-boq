import { describe, expect, it } from 'vitest';
import { loadCatalogCapabilityFlags } from '../lib/master-catalog/admin/capabilities';

function mockSupabase(options: {
  data?: Array<{ key: string; value: unknown }>;
  error?: Error;
}) {
  const result = {
    data: options.data ?? [],
    error: options.error ?? null,
  };
  const query = {
    select: () => query,
    in: async () => result,
  };

  return {
    from: () => query,
  } as unknown as Parameters<typeof loadCatalogCapabilityFlags>[0];
}

describe('Master Catalog capability gates', () => {
  it('fails closed when settings are absent', async () => {
    const result = await loadCatalogCapabilityFlags(mockSupabase({}));

    expect(result.flags).toEqual({
      newIdentityEnabled: false,
      retirementEnabled: false,
    });
    expect(result.warning).toBeNull();
  });

  it('enables only settings whose JSON value is exactly true', async () => {
    const result = await loadCatalogCapabilityFlags(mockSupabase({
      data: [
        { key: 'catalog_new_identity_enabled', value: true },
        { key: 'catalog_retirement_enabled', value: 'true' },
      ],
    }));

    expect(result.flags).toEqual({
      newIdentityEnabled: true,
      retirementEnabled: false,
    });
  });

  it('fails closed and warns when settings cannot be read', async () => {
    const result = await loadCatalogCapabilityFlags(mockSupabase({
      error: new Error('settings unavailable'),
    }));

    expect(result.flags).toEqual({
      newIdentityEnabled: false,
      retirementEnabled: false,
    });
    expect(result.warning).toContain('จึงซ่อนการเพิ่มรายการ');
  });
});
