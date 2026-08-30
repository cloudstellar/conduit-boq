import type { SupabaseClient } from '@supabase/supabase-js';
import { requireActiveProfile } from '@/lib/auth/authorization';

export const DUPLICATE_BOQ_RPC = 'duplicate_boq_atomic';

export type DuplicateBOQMode = 'preserve' | 'select_factor';
export type DuplicateBOQRecoveryAction =
  | 'retry'
  | 'reload'
  | 'open_source'
  | 'create_new'
  | 'dismiss';

export interface DuplicateBOQRequest {
  sourceBOQId: string;
  requestId: string;
  expectedSourceUpdatedAt: string;
  mode: DuplicateBOQMode;
  factorReferenceVersionId?: string | null;
}

export interface DuplicateBOQResult {
  success: true;
  boq_id: string;
  source_boq_id: string;
  mode: DuplicateBOQMode;
  factor_reference_version_id: string;
  duplicateRequest: boolean;
}

interface ErrorWithCode {
  code?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDuplicateBOQResult(
  value: unknown,
  request: DuplicateBOQRequest,
): value is DuplicateBOQResult {
  if (!isRecord(value)) return false;

  return value.success === true
    && typeof value.boq_id === 'string'
    && value.boq_id.length > 0
    && value.source_boq_id === request.sourceBOQId
    && value.mode === request.mode
    && typeof value.factor_reference_version_id === 'string'
    && value.factor_reference_version_id.length > 0
    && (
      request.mode !== 'select_factor'
      || value.factor_reference_version_id === request.factorReferenceVersionId
    )
    && typeof value.duplicateRequest === 'boolean';
}

export async function duplicateBOQAtomic(
  supabase: SupabaseClient,
  request: DuplicateBOQRequest,
): Promise<DuplicateBOQResult> {
  await requireActiveProfile(supabase);

  const { data, error } = await supabase.rpc(DUPLICATE_BOQ_RPC, {
    p_source_boq_id: request.sourceBOQId,
    p_request_id: request.requestId,
    p_expected_source_updated_at: request.expectedSourceUpdatedAt,
    p_mode: request.mode,
    p_factor_reference_version_id: request.factorReferenceVersionId ?? null,
  });

  if (error) throw error;

  if (!isDuplicateBOQResult(data, request)) {
    const responseError = new Error('Invalid atomic duplicate response') as ErrorWithCode & Error;
    responseError.code = 'INVALID_DUPLICATE_RESPONSE';
    throw responseError;
  }

  return data;
}

export function isDuplicateBOQSourceStaleError(error: unknown): boolean {
  return isRecord(error) && error.code === '40001';
}

export function getDuplicateBOQRecoveryAction(
  error: unknown,
  mode: DuplicateBOQMode,
): DuplicateBOQRecoveryAction {
  const code = isRecord(error) && typeof error.code === 'string'
    ? error.code
    : '';

  if (code === '40001') return 'reload';
  if (mode === 'preserve' && code === '22023') return 'open_source';
  if (code === '22023' || code === '55000') return 'create_new';
  if (
    code === '42501'
    || code === 'P0002'
    || code === 'PGRST202'
    || code === 'UNAUTHENTICATED'
    || code === 'ACCOUNT_NOT_ACTIVE'
    || code === 'AUTHORIZATION_UNAVAILABLE'
  ) {
    return 'dismiss';
  }

  return 'retry';
}

export function getDuplicateBOQErrorMessage(
  error: unknown,
  mode: DuplicateBOQMode,
): string {
  const code = isRecord(error) && typeof error.code === 'string'
    ? error.code
    : '';

  if (
    code === '42501'
    || code === 'UNAUTHENTICATED'
    || code === 'ACCOUNT_NOT_ACTIVE'
    || code === 'AUTHORIZATION_UNAVAILABLE'
  ) {
    return 'บัญชีของคุณไม่มีสิทธิ์คัดลอก BOQ นี้ หรือสถานะบัญชีไม่พร้อมใช้งาน';
  }

  if (code === 'P0002') {
    return 'ไม่พบ BOQ ต้นฉบับ หรือคุณไม่มีสิทธิ์เข้าถึงรายการนี้';
  }

  if (code === '40001') {
    return 'BOQ ต้นฉบับเปลี่ยนแปลงแล้ว กรุณาโหลดข้อมูลใหม่ก่อนคัดลอกอีกครั้ง';
  }

  if (code === '22023') {
    return mode === 'preserve'
      ? 'BOQ นี้ไม่เข้าเงื่อนไขการคัดลอกแบบรักษาข้อมูลเดิม หากเป็น BOQ เก่าให้เปิดหน้าแก้ไขแล้วเลือกเวอร์ชัน Factor F'
      : 'BOQ หรือเวอร์ชัน Factor F นี้ไม่เข้าเงื่อนไขการคัดลอกอย่างปลอดภัย กรุณาสร้าง BOQ ใหม่หากต้องการทำงานต่อ';
  }

  if (code === '55000') {
    return 'ข้อมูลต้นฉบับไม่ครบหรือไม่สอดคล้องตามเกณฑ์ที่ปลอดภัย ระบบจึงไม่สร้างสำเนา กรุณาสร้าง BOQ ใหม่แทน';
  }

  if (code === 'PGRST202') {
    return 'ระบบคัดลอกแบบ atomic ยังไม่พร้อมใช้งาน กรุณาติดต่อผู้ดูแลระบบ';
  }

  if (code === 'INVALID_DUPLICATE_RESPONSE') {
    return 'ระบบได้รับผลการคัดลอกที่ไม่สมบูรณ์ จึงยังไม่เปิดสำเนา กรุณาลองอีกครั้ง';
  }

  return 'ไม่สามารถคัดลอก BOQ ได้ ระบบไม่ได้เปลี่ยนแปลงต้นฉบับ กรุณาลองอีกครั้ง';
}
