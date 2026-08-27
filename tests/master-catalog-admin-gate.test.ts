import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import {
  CATALOG_ADMIN_GATE_RPC,
  CATALOG_ADMIN_GATE_WARNING,
  loadCatalogAdminGateProjection,
} from '../lib/master-catalog/admin/adminGate';

function client(result: unknown, error: unknown = null): SupabaseClient {
  return {
    rpc: async (name: string) => {
      if (name !== CATALOG_ADMIN_GATE_RPC) {
        throw new Error(`Unexpected RPC: ${name}`);
      }
      return { data: result, error };
    },
    from: () => {
      throw new Error('The bounded gate must never read a raw table');
    },
  } as unknown as SupabaseClient;
}

describe('Master Catalog bounded admin gate projection', () => {
  it('accepts only one valid boolean row', async () => {
    await expect(loadCatalogAdminGateProjection(client([{
      admin_enabled: true,
      configuration_valid: true,
    }]))).resolves.toEqual({ enabled: true, issue: null });

    await expect(loadCatalogAdminGateProjection(client([{
      admin_enabled: false,
      configuration_valid: true,
    }]))).resolves.toEqual({ enabled: false, issue: null });
  });

  it.each([
    null,
    {},
    [],
    [
      { admin_enabled: true, configuration_valid: true },
      { admin_enabled: true, configuration_valid: true },
    ],
    [{ admin_enabled: 'true', configuration_valid: true }],
    [{ admin_enabled: true, configuration_valid: false }],
    [{ admin_enabled: true }],
  ])('fails closed on malformed projection data: %j', async (data) => {
    await expect(loadCatalogAdminGateProjection(client(data))).resolves.toEqual({
      enabled: false,
      issue: CATALOG_ADMIN_GATE_WARNING,
    });
  });

  it('fails closed on RPC errors and thrown transports', async () => {
    await expect(loadCatalogAdminGateProjection(client(null, {
      code: '42501',
      message: 'permission denied',
    }))).resolves.toEqual({
      enabled: false,
      issue: CATALOG_ADMIN_GATE_WARNING,
    });

    const throwingClient = {
      rpc: async () => {
        throw new Error('transport unavailable');
      },
      from: () => {
        throw new Error('The bounded gate must never read a raw table');
      },
    } as unknown as SupabaseClient;

    await expect(loadCatalogAdminGateProjection(throwingClient)).resolves.toEqual({
      enabled: false,
      issue: CATALOG_ADMIN_GATE_WARNING,
    });
  });
});
