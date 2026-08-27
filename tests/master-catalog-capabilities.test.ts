import { describe, expect, it } from 'vitest';
import {
  CATALOG_CAPABILITIES_RPC,
  loadCatalogCapabilityFlags,
} from '../lib/master-catalog/admin/capabilities';

type CapabilityMockOptions = {
  rpcData?: unknown;
  rpcError?: unknown;
  fallbackData?: unknown;
  fallbackError?: unknown;
  throwRpc?: boolean;
  rawReads?: string[];
};

function mockSupabase(options: CapabilityMockOptions = {}) {
  const fallbackResult = {
    data: options.fallbackData ?? [],
    error: options.fallbackError ?? null,
  };
  const query = {
    select: () => query,
    in: async () => fallbackResult,
  };

  return {
    rpc: async (name: string) => {
      expect(name).toBe(CATALOG_CAPABILITIES_RPC);
      if (options.throwRpc) throw new Error('transport unavailable');
      return {
        data: options.rpcData ?? [],
        error: options.rpcError ?? null,
      };
    },
    from: (table: string) => {
      options.rawReads?.push(table);
      return query;
    },
  } as unknown as Parameters<typeof loadCatalogCapabilityFlags>[0];
}

describe('Master Catalog capability gates', () => {
  it('uses one bounded capability row without reading raw settings', async () => {
    const rawReads: string[] = [];
    const result = await loadCatalogCapabilityFlags(mockSupabase({
      rpcData: [{
        new_identity_enabled: true,
        retirement_enabled: false,
        configuration_valid: true,
      }],
      rawReads,
    }));

    expect(result).toEqual({
      flags: {
        newIdentityEnabled: true,
        retirementEnabled: false,
      },
      warning: null,
    });
    expect(rawReads).toEqual([]);
  });

  it('fails closed on absent, malformed, or unauthorized capability rows', async () => {
    for (const rpcData of [
      [],
      [{
        new_identity_enabled: false,
        retirement_enabled: false,
        configuration_valid: false,
      }],
      [{
        new_identity_enabled: 'true',
        retirement_enabled: false,
        configuration_valid: true,
      }],
      [
        {
          new_identity_enabled: false,
          retirement_enabled: false,
          configuration_valid: true,
        },
        {
          new_identity_enabled: false,
          retirement_enabled: false,
          configuration_valid: true,
        },
      ],
    ]) {
      const result = await loadCatalogCapabilityFlags(mockSupabase({ rpcData }));
      expect(result.flags).toEqual({
        newIdentityEnabled: false,
        retirementEnabled: false,
      });
      expect(result.warning).toContain('จึงซ่อนการเพิ่มรายการ');
    }
  });

  it('uses the raw read-only fallback only for the exact missing RPC result', async () => {
    const rawReads: string[] = [];
    const result = await loadCatalogCapabilityFlags(mockSupabase({
      rpcError: {
        code: 'PGRST202',
        message: `Could not find public.${CATALOG_CAPABILITIES_RPC}`,
      },
      fallbackData: [
        { key: 'catalog_new_identity_enabled', value: true },
        { key: 'catalog_retirement_enabled', value: false },
      ],
      rawReads,
    }));

    expect(result).toEqual({
      flags: {
        newIdentityEnabled: true,
        retirementEnabled: false,
      },
      warning: null,
    });
    expect(rawReads).toEqual(['app_settings']);
  });

  it('does not fall back on permission, unknown, or transport errors', async () => {
    for (const options of [
      { rpcError: { code: '42501', message: 'permission denied' } },
      { rpcError: { code: 'PGRST202', message: 'Could not find another_function' } },
      { throwRpc: true },
    ]) {
      const rawReads: string[] = [];
      const result = await loadCatalogCapabilityFlags(mockSupabase({
        ...options,
        rawReads,
      }));

      expect(result.flags).toEqual({
        newIdentityEnabled: false,
        retirementEnabled: false,
      });
      expect(result.warning).toContain('จึงซ่อนการเพิ่มรายการ');
      expect(rawReads).toEqual([]);
    }
  });

  it('fails closed when the legacy fallback is incomplete or malformed', async () => {
    for (const fallbackData of [
      [],
      [{ key: 'catalog_new_identity_enabled', value: true }],
      [
        { key: 'catalog_new_identity_enabled', value: true },
        { key: 'catalog_retirement_enabled', value: 'true' },
      ],
      [
        { key: 'catalog_new_identity_enabled', value: true },
        { key: 'catalog_new_identity_enabled', value: false },
      ],
    ]) {
      const result = await loadCatalogCapabilityFlags(mockSupabase({
        rpcError: {
          code: 'PGRST202',
          message: `Could not find ${CATALOG_CAPABILITIES_RPC}`,
        },
        fallbackData,
      }));

      expect(result.flags).toEqual({
        newIdentityEnabled: false,
        retirementEnabled: false,
      });
      expect(result.warning).toContain('จึงซ่อนการเพิ่มรายการ');
    }

    const fallbackErrorResult = await loadCatalogCapabilityFlags(mockSupabase({
      rpcError: {
        code: 'PGRST202',
        message: `Could not find ${CATALOG_CAPABILITIES_RPC}`,
      },
      fallbackError: new Error('settings unavailable'),
    }));
    expect(fallbackErrorResult.flags).toEqual({
      newIdentityEnabled: false,
      retirementEnabled: false,
    });
    expect(fallbackErrorResult.warning).toContain('จึงซ่อนการเพิ่มรายการ');
  });
});
