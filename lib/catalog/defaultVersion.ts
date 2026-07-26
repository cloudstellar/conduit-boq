import type { SupabaseClient } from '@supabase/supabase-js';
import { parseCatalogVersionString } from '../master-catalog/versioning';

export const DEFAULT_CATALOG_UNAVAILABLE_MESSAGE =
  'ไม่พบเวอร์ชันราคากลางเริ่มต้นที่เปิดใช้งาน กรุณาติดต่อผู้ดูแลระบบ';

export const BOUND_CATALOG_UNAVAILABLE_MESSAGE =
  'ไม่พบฉบับบัญชีราคาที่ผูกกับใบประมาณราคา กรุณาติดต่อผู้ดูแลระบบ';

export interface CatalogVersionSummary {
  id: string;
  versionString: string;
  year: number;
  status: 'active' | 'archived';
}

interface CatalogVersionRow {
  id: string;
  version_string: string | null;
  status: string;
}

function toCatalogVersionSummary(
  version: CatalogVersionRow,
  unavailableMessage: string,
): CatalogVersionSummary {
  const parsed = version.version_string
    ? parseCatalogVersionString(version.version_string)
    : null;

  if (
    !parsed
    || (version.status !== 'active' && version.status !== 'archived')
  ) {
    throw new Error(unavailableMessage);
  }

  return {
    id: version.id,
    versionString: version.version_string!,
    year: parsed.major,
    status: version.status,
  };
}

export async function getActiveDefaultPriceListVersion(
  supabase: SupabaseClient,
): Promise<CatalogVersionSummary> {
  const { data: pointer, error: pointerError } = await supabase
    .from('price_list_default_version')
    .select('version_id')
    .eq('id', true)
    .maybeSingle();

  if (pointerError) {
    throw new Error(`${DEFAULT_CATALOG_UNAVAILABLE_MESSAGE}: ${pointerError.message}`);
  }

  if (!pointer?.version_id) {
    throw new Error(DEFAULT_CATALOG_UNAVAILABLE_MESSAGE);
  }

  const { data: version, error: versionError } = await supabase
    .from('price_list_versions')
    .select('id, version_string, status')
    .eq('id', pointer.version_id)
    .eq('status', 'active')
    .maybeSingle();

  if (versionError) {
    throw new Error(`${DEFAULT_CATALOG_UNAVAILABLE_MESSAGE}: ${versionError.message}`);
  }

  if (!version || version.status !== 'active') {
    throw new Error(DEFAULT_CATALOG_UNAVAILABLE_MESSAGE);
  }

  return toCatalogVersionSummary(
    version as CatalogVersionRow,
    DEFAULT_CATALOG_UNAVAILABLE_MESSAGE,
  );
}

export async function getActiveDefaultPriceListVersionId(
  supabase: SupabaseClient,
): Promise<string> {
  const version = await getActiveDefaultPriceListVersion(supabase);
  return version.id;
}

export async function getPriceListVersionSummary(
  supabase: SupabaseClient,
  versionId: string,
): Promise<CatalogVersionSummary> {
  const { data: version, error } = await supabase
    .from('price_list_versions')
    .select('id, version_string, status')
    .eq('id', versionId)
    .maybeSingle();

  if (error) {
    throw new Error(`${BOUND_CATALOG_UNAVAILABLE_MESSAGE}: ${error.message}`);
  }

  if (!version) {
    throw new Error(BOUND_CATALOG_UNAVAILABLE_MESSAGE);
  }

  return toCatalogVersionSummary(
    version as CatalogVersionRow,
    BOUND_CATALOG_UNAVAILABLE_MESSAGE,
  );
}
