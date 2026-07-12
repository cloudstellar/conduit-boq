import type { SupabaseClient } from '@supabase/supabase-js';

export interface CatalogCapabilityFlags {
  newIdentityEnabled: boolean;
  retirementEnabled: boolean;
}

export async function loadCatalogCapabilityFlags(
  supabase: SupabaseClient,
): Promise<{ flags: CatalogCapabilityFlags; warning: string | null }> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('key,value')
    .in('key', ['catalog_new_identity_enabled', 'catalog_retirement_enabled']);

  if (error) {
    return {
      flags: { newIdentityEnabled: false, retirementEnabled: false },
      warning: 'อ่านสิทธิ์เปิดความสามารถไม่สำเร็จ จึงซ่อนการเพิ่มรายการ การนำเข้ารายการเพิ่มเติม และการยกเลิกใช้ไว้ก่อน',
    };
  }

  const values = new Map(
    (Array.isArray(data) ? data : []).map((row) => [String(row.key), row.value]),
  );

  return {
    flags: {
      newIdentityEnabled: values.get('catalog_new_identity_enabled') === true,
      retirementEnabled: values.get('catalog_retirement_enabled') === true,
    },
    warning: null,
  };
}
