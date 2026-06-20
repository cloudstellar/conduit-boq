import type { SupabaseClient } from '@supabase/supabase-js';

export const DEFAULT_CATALOG_UNAVAILABLE_MESSAGE =
  'ไม่พบเวอร์ชันราคากลางเริ่มต้นที่เปิดใช้งาน กรุณาติดต่อผู้ดูแลระบบ';

export async function getActiveDefaultPriceListVersionId(
  supabase: SupabaseClient,
): Promise<string> {
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
    .select('id, status')
    .eq('id', pointer.version_id)
    .eq('status', 'active')
    .maybeSingle();

  if (versionError) {
    throw new Error(`${DEFAULT_CATALOG_UNAVAILABLE_MESSAGE}: ${versionError.message}`);
  }

  if (!version || version.status !== 'active') {
    throw new Error(DEFAULT_CATALOG_UNAVAILABLE_MESSAGE);
  }

  return version.id;
}
