import type { SupabaseClient } from '@supabase/supabase-js';
import type { FactorReferenceCondition, FactorReferenceRow } from './factorF';

export const FACTOR_REFERENCE_VERSION_REQUIRED_MESSAGE =
  'ใบประมาณราคานี้ยังไม่ได้ผูกกับเวอร์ชัน Factor F และไม่สามารถคำนวณจากตารางล่าสุดโดยอัตโนมัติได้';

export const DEFAULT_FACTOR_REFERENCE_UNAVAILABLE_MESSAGE =
  'ไม่พบเวอร์ชัน Factor F เริ่มต้นที่เปิดใช้งาน กรุณาติดต่อผู้ดูแลระบบ';

export interface FactorReferenceVersionData extends FactorReferenceCondition {
  id: string;
  version_string: string;
  name: string;
  status: 'draft' | 'active' | 'archived';
}

export async function getActiveFactorReferenceVersion(
  supabase: SupabaseClient,
  versionId: string,
): Promise<FactorReferenceVersionData> {
  const { data, error } = await supabase
    .from('factor_reference_versions')
    .select(`
      id,
      version_string,
      name,
      status,
      advance_payment_percent,
      retention_percent,
      loan_interest_percent,
      vat_percent
    `)
    .eq('id', versionId)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    throw new Error(`ไม่สามารถอ่านเวอร์ชัน Factor F ได้: ${error.message}`);
  }

  if (!data) {
    throw new Error('ไม่พบเวอร์ชัน Factor F ที่เปิดใช้งานสำหรับ BOQ นี้');
  }

  return data as FactorReferenceVersionData;
}

export async function getActiveDefaultFactorReferenceVersion(
  supabase: SupabaseClient,
): Promise<FactorReferenceVersionData> {
  const { data: pointer, error: pointerError } = await supabase
    .from('factor_reference_default_version')
    .select('version_id')
    .eq('id', true)
    .maybeSingle();

  if (pointerError) {
    throw new Error(`${DEFAULT_FACTOR_REFERENCE_UNAVAILABLE_MESSAGE}: ${pointerError.message}`);
  }

  if (!pointer?.version_id) {
    throw new Error(DEFAULT_FACTOR_REFERENCE_UNAVAILABLE_MESSAGE);
  }

  return getActiveFactorReferenceVersion(supabase, pointer.version_id);
}

export async function listActiveFactorReferenceVersions(
  supabase: SupabaseClient,
): Promise<FactorReferenceVersionData[]> {
  const { data, error } = await supabase
    .from('factor_reference_versions')
    .select(`
      id,
      version_string,
      name,
      status,
      advance_payment_percent,
      retention_percent,
      loan_interest_percent,
      vat_percent
    `)
    .eq('status', 'active')
    .order('version_string', { ascending: false });

  if (error) {
    throw new Error(`ไม่สามารถอ่านรายการเวอร์ชัน Factor F ได้: ${error.message}`);
  }

  return (data || []) as FactorReferenceVersionData[];
}

export async function getFactorReferenceRowsForVersion(
  supabase: SupabaseClient,
  versionId: string | null,
): Promise<FactorReferenceRow[]> {
  if (!versionId) {
    throw new Error(FACTOR_REFERENCE_VERSION_REQUIRED_MESSAGE);
  }

  const { data, error } = await supabase
    .from('factor_reference_rows')
    .select('cost_million, factor')
    .eq('version_id', versionId)
    .order('cost_million', { ascending: true });

  if (error) {
    throw new Error(`ไม่สามารถอ่านตาราง Factor F ตามเวอร์ชันได้: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error('ไม่พบข้อมูลอ้างอิง Factor F สำหรับเวอร์ชันนี้');
  }

  return data.map((row) => ({
    cost_million: Number(row.cost_million),
    factor: Number(row.factor),
  }));
}
