import type { SupabaseClient } from '@supabase/supabase-js';

export const CATALOG_ADMIN_GATE_RPC = 'get_my_catalog_admin_gate';

export const CATALOG_ADMIN_GATE_WARNING =
  'อ่านสถานะเปิดแก้ไข Master Catalog ไม่สำเร็จหรือการตั้งค่าไม่ครบ จึงเปิดดูอย่างเดียวไว้ก่อน';

export interface CatalogAdminGateProjection {
  enabled: boolean;
  issue: string | null;
}

export async function loadCatalogAdminGateProjection(
  supabase: SupabaseClient,
): Promise<CatalogAdminGateProjection> {
  try {
    const rpcResult = await supabase.rpc(CATALOG_ADMIN_GATE_RPC);
    if (rpcResult.error) return failClosedAdminGate();

    const rows = Array.isArray(rpcResult.data) ? rpcResult.data : [];
    const row = rows.length === 1 && isRecord(rows[0]) ? rows[0] : null;

    if (
      !row
      || row.configuration_valid !== true
      || typeof row.admin_enabled !== 'boolean'
    ) {
      return failClosedAdminGate();
    }

    return { enabled: row.admin_enabled, issue: null };
  } catch {
    return failClosedAdminGate();
  }
}

function failClosedAdminGate(): CatalogAdminGateProjection {
  return { enabled: false, issue: CATALOG_ADMIN_GATE_WARNING };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
