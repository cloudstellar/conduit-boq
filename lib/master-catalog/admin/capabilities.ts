import type { SupabaseClient } from '@supabase/supabase-js';
import { isExactMissingRpcError } from '../../auth/authorization';

export const CATALOG_CAPABILITIES_RPC = 'get_my_catalog_capabilities';

export interface CatalogCapabilityFlags {
  newIdentityEnabled: boolean;
  retirementEnabled: boolean;
}

const DISABLED_FLAGS: CatalogCapabilityFlags = {
  newIdentityEnabled: false,
  retirementEnabled: false,
};

const CAPABILITY_WARNING =
  'อ่านสถานะความสามารถ Master Catalog ไม่สำเร็จหรือการตั้งค่าไม่ครบ จึงซ่อนการเพิ่มรายการ การนำเข้ารายการเพิ่มเติม และการยกเลิกใช้ไว้ก่อน';

export async function loadCatalogCapabilityFlags(
  supabase: SupabaseClient,
): Promise<{ flags: CatalogCapabilityFlags; warning: string | null }> {
  try {
    const rpcResult = await supabase.rpc(CATALOG_CAPABILITIES_RPC);

    if (!rpcResult.error) {
      const rows = Array.isArray(rpcResult.data) ? rpcResult.data : [];
      const row = rows.length === 1 && isRecord(rows[0]) ? rows[0] : null;

      if (
        !row
        || row.configuration_valid !== true
        || typeof row.new_identity_enabled !== 'boolean'
        || typeof row.retirement_enabled !== 'boolean'
      ) {
        return failClosedCapabilities();
      }

      return {
        flags: {
          newIdentityEnabled: row.new_identity_enabled,
          retirementEnabled: row.retirement_enabled,
        },
        warning: null,
      };
    }

    if (!isExactMissingRpcError(rpcResult.error, CATALOG_CAPABILITIES_RPC)) {
      return failClosedCapabilities();
    }

    // Read-only compatibility for deployments that do not have the bounded RPC
    // yet. Any other RPC error fails closed and never reaches the raw table.
    const fallback = await supabase
      .from('app_settings')
      .select('key,value')
      .in('key', ['catalog_new_identity_enabled', 'catalog_retirement_enabled']);

    if (fallback.error || !Array.isArray(fallback.data) || fallback.data.length !== 2) {
      return failClosedCapabilities();
    }

    const values = new Map<string, boolean>();
    for (const value of fallback.data) {
      if (
        !isRecord(value)
        || typeof value.key !== 'string'
        || typeof value.value !== 'boolean'
        || values.has(value.key)
      ) {
        return failClosedCapabilities();
      }
      values.set(value.key, value.value);
    }

    if (
      !values.has('catalog_new_identity_enabled')
      || !values.has('catalog_retirement_enabled')
    ) {
      return failClosedCapabilities();
    }

    return {
      flags: {
        newIdentityEnabled: values.get('catalog_new_identity_enabled') === true,
        retirementEnabled: values.get('catalog_retirement_enabled') === true,
      },
      warning: null,
    };
  } catch {
    return failClosedCapabilities();
  }
}

function failClosedCapabilities(): {
  flags: CatalogCapabilityFlags;
  warning: string;
} {
  return { flags: { ...DISABLED_FLAGS }, warning: CAPABILITY_WARNING };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
