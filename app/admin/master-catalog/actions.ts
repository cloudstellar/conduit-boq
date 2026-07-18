'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { loadCatalogAdminGate } from '@/lib/master-catalog/admin/readModel';
import {
  CatalogImportPayloadValidationError,
  validateCatalogImportPayload,
  validateCatalogImportPayloadHash,
} from '@/lib/master-catalog/import/payload';
import {
  CatalogImportServerValidationError,
  validateCatalogImportAgainstDraft,
} from '@/lib/master-catalog/admin/importValidation';
import {
  type CatalogRpcTransportOperation,
  type CatalogMutationState,
  type CatalogRpcActionResponse,
  buildAbandonCatalogDraftArgs,
  buildPublishCatalogVersionArgs,
  buildPlaceCatalogItemsArgs,
  buildRestoreCatalogPointerArgs,
  buildManualCatalogChangeArgs,
  createCatalogMutationError,
  createCatalogRpcTransportError,
  mapCatalogRpcActionResponse,
  validateCatalogPublishVersionConfirmation,
} from '@/lib/master-catalog/admin/actionModel';
import { logMasterCatalogOperation } from '@/lib/master-catalog/observability';
import {
  classifyCatalogVersionTransition,
  isCatalogAnnualEffectiveYearAllowed,
  parseCatalogVersionString,
  type CatalogVersionTransition,
} from '@/lib/master-catalog/versioning';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type SupabaseActionError = {
  code?: string;
};

export async function createCatalogDraftAction(
  _previousState: CatalogMutationState,
  formData: FormData,
): Promise<CatalogMutationState> {
  const requestId = readOperationRequestId(formData);
  if (typeof requestId !== 'string') return requestId;

  const supabase = await createClient();
  const gate = await loadCatalogAdminGate(supabase);

  if (gate.state !== 'enabled') {
    return createCatalogMutationError('ระบบบัญชีราคาสำหรับผู้ดูแลยังไม่เปิดใช้งาน', 'FORBIDDEN');
  }

  const name = readRequiredActionText(formData, 'name', 'ชื่อฉบับร่าง');
  const reason = readRequiredActionText(formData, 'reason', 'เหตุผล');
  const baseVersionId = readRequiredActionText(formData, 'baseVersionId', 'เวอร์ชันฐาน');
  const versionIntent = readCatalogVersionIntent(formData);
  const expectedVersionString = readRequiredActionText(
    formData,
    'expectedVersionString',
    'เลขฉบับที่ตรวจสอบแล้ว',
  );

  if (typeof name !== 'string') return name;
  if (typeof reason !== 'string') return reason;
  if (typeof baseVersionId !== 'string') return baseVersionId;
  if (!UUID_PATTERN.test(baseVersionId)) {
    return createCatalogMutationError('รหัสเวอร์ชันฐานไม่ถูกต้อง');
  }
  if (typeof versionIntent !== 'string') return versionIntent;
  if (typeof expectedVersionString !== 'string') return expectedVersionString;

  const expectedVersion = parseCatalogVersionString(expectedVersionString);
  if (!expectedVersion) {
    return createCatalogMutationError('เลขฉบับที่ตรวจสอบแล้วไม่ถูกต้อง');
  }

  if (versionIntent === 'annual') {
    const effectiveYear = readVersionSegment(formData, 'effectiveYear', 'ปี พ.ศ. ที่มีผลใช้งาน');
    if (typeof effectiveYear !== 'number') return effectiveYear;
    if (effectiveYear !== expectedVersion.major) {
      return createCatalogMutationError('ปีที่มีผลใช้งานไม่ตรงกับเลขฉบับที่ตรวจสอบแล้ว');
    }
  }

  const { data: baseVersion, error: baseVersionError } = await supabase
    .from('price_list_versions')
    .select('version_string')
    .eq('id', baseVersionId)
    .maybeSingle();

  const parsedBaseVersion = baseVersion?.version_string
    ? parseCatalogVersionString(String(baseVersion.version_string))
    : null;
  if (baseVersionError || !parsedBaseVersion) {
    return createCatalogMutationError('อ่านเวอร์ชันฐานไม่สำเร็จ', 'DRAFT_BASE_STALE');
  }

  if (
    versionIntent === 'annual'
    && !isCatalogAnnualEffectiveYearAllowed(parsedBaseVersion, expectedVersion.major)
  ) {
    return createCatalogMutationError(
      'ปี พ.ศ. ที่มีผลใช้งานต้องอยู่ภายใน 10 ปีถัดจากเวอร์ชันฐาน',
      'VERSION_EFFECTIVE_YEAR_OUT_OF_RANGE',
    );
  }

  if (classifyCatalogVersionTransition(parsedBaseVersion, expectedVersion) !== versionIntent) {
    return createCatalogMutationError(
      'วัตถุประสงค์ของฉบับใหม่ไม่ตรงกับเลขเวอร์ชันตาม ADR-003',
      'VERSION_TRANSITION_INVALID',
    );
  }

  const startedAt = Date.now();
  const { data, error } = await supabase.rpc('create_catalog_draft', {
    p_base_version_id: baseVersionId,
    p_version_major: expectedVersion.major,
    p_version_minor: expectedVersion.minor,
    p_version_patch: expectedVersion.patch,
    p_name: name,
    p_reason: reason,
    p_request_id: requestId,
  });

  if (error) {
    return mapRpcTransportError('createCatalogDraft', error, requestId, {
      startedAt,
      versionId: baseVersionId,
    });
  }

  const result = mapCatalogRpcActionResponse(
    data as CatalogRpcActionResponse,
    `สร้างฉบับร่าง ${expectedVersionString} แล้ว`,
  );
  logMasterCatalogOperation({
    operation: 'createCatalogDraft',
    outcome: result.status === 'success' ? 'success' : 'rejected',
    startedAt,
    requestId: result.requestId ?? requestId,
    versionId: result.versionId ?? baseVersionId,
    code: result.code,
  });

  if (result.status === 'success') {
    revalidateMasterCatalogPaths(result.versionId);
  }

  return result;
}

export async function abandonCatalogDraftAction(
  _previousState: CatalogMutationState,
  formData: FormData,
): Promise<CatalogMutationState> {
  const requestId = readOperationRequestId(formData);
  if (typeof requestId !== 'string') return requestId;

  const supabase = await createClient();
  const gate = await loadCatalogAdminGate(supabase);

  if (gate.state !== 'enabled') {
    return createCatalogMutationError(
      'ระบบบัญชีราคาสำหรับผู้ดูแลยังไม่เปิดใช้งาน',
      'FORBIDDEN',
    );
  }

  const args = buildAbandonCatalogDraftArgs(formData, requestId);
  if ('status' in args) return args;

  const startedAt = Date.now();
  const { data, error } = await supabase.rpc('abandon_catalog_draft', args);

  if (error) {
    return mapRpcTransportError('abandonCatalogDraft', error, requestId, {
      startedAt,
      versionId: args.p_version_id,
    });
  }

  const result = mapCatalogRpcActionResponse(
    data as CatalogRpcActionResponse,
    'ยกเลิกฉบับร่างและเก็บไว้เป็นประวัติแล้ว',
  );
  logMasterCatalogOperation({
    operation: 'abandonCatalogDraft',
    outcome: result.status === 'success' ? 'success' : 'rejected',
    startedAt,
    requestId: result.requestId ?? requestId,
    versionId: result.versionId ?? args.p_version_id,
    code: result.code,
  });

  if (result.status === 'success') {
    revalidateMasterCatalogPaths(result.versionId ?? args.p_version_id);
  }

  return result;
}

export async function applyCatalogManualChangeAction(
  _previousState: CatalogMutationState,
  formData: FormData,
): Promise<CatalogMutationState> {
  const requestId = readOperationRequestId(formData);
  if (typeof requestId !== 'string') return requestId;

  const supabase = await createClient();
  const gate = await loadCatalogAdminGate(supabase);

  if (gate.state !== 'enabled') {
    return createCatalogMutationError('ระบบบัญชีราคาสำหรับผู้ดูแลยังไม่เปิดใช้งาน', 'FORBIDDEN');
  }

  const args = buildManualCatalogChangeArgs(formData, requestId);

  if ('status' in args) {
    return args;
  }

  const startedAt = Date.now();
  const { data, error } = await supabase.rpc('apply_catalog_changes', args);

  if (error) {
    return mapRpcTransportError('applyCatalogManualChange', error, requestId, {
      startedAt,
      versionId: args.p_version_id,
    });
  }

  const result = mapCatalogRpcActionResponse(
    data as CatalogRpcActionResponse,
    'บันทึกการเปลี่ยนแปลงในฉบับร่างแล้ว',
  );
  logMasterCatalogOperation({
    operation: 'applyCatalogManualChange',
    outcome: result.status === 'success' ? 'success' : 'rejected',
    startedAt,
    requestId: result.requestId ?? requestId,
    versionId: result.versionId ?? args.p_version_id,
    code: result.code,
  });

  if (result.status === 'success') {
    revalidateMasterCatalogPaths(result.versionId ?? args.p_version_id);
  }

  return result;
}

export async function placeCatalogItemsAction(
  _previousState: CatalogMutationState,
  formData: FormData,
): Promise<CatalogMutationState> {
  const requestId = readOperationRequestId(formData);
  if (typeof requestId !== 'string') return requestId;

  const supabase = await createClient();
  const gate = await loadCatalogAdminGate(supabase);
  if (gate.state !== 'enabled') {
    return createCatalogMutationError(
      'ระบบบัญชีราคาสำหรับผู้ดูแลยังไม่เปิดใช้งาน',
      'FORBIDDEN',
    );
  }

  const args = buildPlaceCatalogItemsArgs(formData, requestId);
  if ('status' in args) return args;

  const startedAt = Date.now();
  const { data, error } = await supabase.rpc('place_catalog_items', args);
  if (error) {
    return mapRpcTransportError('placeCatalogItems', error, requestId, {
      startedAt,
      versionId: args.p_version_id,
    });
  }

  const result = mapCatalogRpcActionResponse(
    data as CatalogRpcActionResponse,
    'บันทึกตำแหน่งรายการใหม่ทั้งชุดแล้ว',
  );
  logMasterCatalogOperation({
    operation: 'placeCatalogItems',
    outcome: result.status === 'success' ? 'success' : 'rejected',
    startedAt,
    requestId: result.requestId ?? requestId,
    versionId: result.versionId ?? args.p_version_id,
    code: result.code,
  });

  if (result.status === 'success') {
    revalidateMasterCatalogPaths(result.versionId ?? args.p_version_id);
  }

  return result;
}

export async function previewCatalogImportAction(
  _previousState: CatalogMutationState,
  formData: FormData,
): Promise<CatalogMutationState> {
  const supabase = await createClient();
  const gate = await loadCatalogAdminGate(supabase);

  if (gate.state !== 'enabled') {
    return createCatalogMutationError('ระบบบัญชีราคาสำหรับผู้ดูแลยังไม่เปิดใช้งาน', 'FORBIDDEN');
  }

  const validated = await readValidatedImportPayload(formData);
  if ('status' in validated) {
    return validated;
  }

  let importPreview;
  try {
    importPreview = await validateCatalogImportAgainstDraft(supabase, validated.payload);
  } catch (error) {
    return mapImportValidationError(error);
  }

  const startedAt = Date.now();
  const { data, error } = await supabase.rpc('apply_catalog_changes', {
    p_version_id: validated.payload.versionId,
    p_change_payload: {
      operation: 'import_validate',
      payload: validated.payload,
      normalizedPayloadHash: validated.normalizedPayloadHash,
    },
    p_expected_lock_version: validated.payload.expectedLockVersion,
    p_reason: validated.payload.reason,
    p_request_id: validated.payload.requestId,
    p_import_id: null,
  });

  if (error) {
    return mapRpcTransportError(
      'previewCatalogImport',
      error,
      validated.payload.requestId,
      { startedAt, versionId: validated.payload.versionId },
    );
  }

  const result = mapCatalogRpcActionResponse(
    data as CatalogRpcActionResponse,
    'เซิร์ฟเวอร์ตรวจผลต่างและบันทึกผลตรวจแล้ว',
  );
  logMasterCatalogOperation({
    operation: 'previewCatalogImport',
    outcome: result.status === 'success' ? 'success' : 'rejected',
    startedAt,
    requestId: result.requestId ?? validated.payload.requestId,
    versionId: result.versionId ?? validated.payload.versionId,
    code: result.code,
  });

  if (result.status === 'success') {
    revalidateMasterCatalogPaths(result.versionId ?? validated.payload.versionId);
  }

  return result.status === 'success' ? { ...result, importPreview } : result;
}

export async function applyCatalogImportAction(
  _previousState: CatalogMutationState,
  formData: FormData,
): Promise<CatalogMutationState> {
  const requestId = readOperationRequestId(formData);
  if (typeof requestId !== 'string') return requestId;

  const supabase = await createClient();
  const gate = await loadCatalogAdminGate(supabase);

  if (gate.state !== 'enabled') {
    return createCatalogMutationError('ระบบบัญชีราคาสำหรับผู้ดูแลยังไม่เปิดใช้งาน', 'FORBIDDEN');
  }

  const importId = readRequiredActionText(formData, 'importId', 'รหัสชุดการนำเข้า');
  if (typeof importId !== 'string') return importId;

  if (!UUID_PATTERN.test(importId)) {
    return createCatalogMutationError('รหัสชุดการนำเข้าไม่ถูกต้อง');
  }

  const { data: importRecord, error: importError } = await supabase
    .from('catalog_imports')
    .select('id,version_id,status,normalized_payload_hash')
    .eq('id', importId)
    .maybeSingle();

  if (importError) {
    return createCatalogMutationError('โหลดผลตรวจการนำเข้าไม่สำเร็จ', 'INTERNAL_ERROR');
  }

  if (!importRecord) {
    return createCatalogMutationError('ไม่พบผลตรวจการนำเข้าที่เลือก', 'VALIDATION_FAILED');
  }

  if (importRecord.status !== 'validated') {
    return createCatalogMutationError(
      'ชุดการนำเข้านี้ถูกบันทึกหรือปฏิเสธไปแล้ว',
      'REQUEST_ALREADY_PROCESSED',
    );
  }

  const validated = await readValidatedImportPayload(
    formData,
    String(importRecord.normalized_payload_hash ?? ''),
  );
  if ('status' in validated) {
    return validated;
  }

  try {
    await validateCatalogImportAgainstDraft(supabase, validated.payload);
  } catch (error) {
    return mapImportValidationError(error);
  }

  const startedAt = Date.now();
  const { data, error } = await supabase.rpc('apply_catalog_changes', {
    p_version_id: validated.payload.versionId,
    p_change_payload: {
      operation: 'import_apply',
      payload: validated.payload,
      normalizedPayloadHash: validated.normalizedPayloadHash,
    },
    p_expected_lock_version: validated.payload.expectedLockVersion,
    p_reason: validated.payload.reason,
    p_request_id: requestId,
    p_import_id: importId,
  });

  if (error) {
    return mapRpcTransportError('applyCatalogImport', error, requestId, {
      startedAt,
      versionId: validated.payload.versionId,
    });
  }

  const result = mapCatalogRpcActionResponse(
    data as CatalogRpcActionResponse,
    'ยืนยันและบันทึกการนำเข้าลงฉบับร่างแล้ว',
  );
  logMasterCatalogOperation({
    operation: 'applyCatalogImport',
    outcome: result.status === 'success' ? 'success' : 'rejected',
    startedAt,
    requestId: result.requestId ?? requestId,
    versionId: result.versionId ?? validated.payload.versionId,
    code: result.code,
  });

  if (result.status === 'success') {
    revalidateMasterCatalogPaths(result.versionId ?? validated.payload.versionId);
  }

  return result;
}

export async function publishCatalogVersionAction(
  _previousState: CatalogMutationState,
  formData: FormData,
): Promise<CatalogMutationState> {
  const requestId = readOperationRequestId(formData);
  if (typeof requestId !== 'string') return requestId;

  const supabase = await createClient();
  const gate = await loadCatalogAdminGate(supabase);

  if (gate.state !== 'enabled') {
    return createCatalogMutationError('ระบบบัญชีราคาสำหรับผู้ดูแลยังไม่เปิดใช้งาน', 'FORBIDDEN');
  }

  const args = buildPublishCatalogVersionArgs(formData, requestId);

  if ('status' in args) {
    return args;
  }

  const confirmedVersionString = readRequiredActionText(
    formData,
    'confirmedVersionString',
    'เลขเวอร์ชันยืนยัน',
  );
  if (typeof confirmedVersionString !== 'string') {
    return confirmedVersionString;
  }

  const { data: draftVersion, error: draftVersionError } = await supabase
    .from('price_list_versions')
    .select('version_string')
    .eq('id', args.p_version_id)
    .maybeSingle();

  if (draftVersionError || !draftVersion?.version_string) {
    return createCatalogMutationError(
      'อ่านเลขเวอร์ชันฉบับร่างไม่สำเร็จ กรุณาโหลดข้อมูลล่าสุดแล้วลองอีกครั้ง',
      'DRAFT_NOT_FOUND',
    );
  }

  const confirmationError = validateCatalogPublishVersionConfirmation(
    confirmedVersionString,
    String(draftVersion.version_string),
  );
  if (confirmationError) {
    return confirmationError;
  }

  const startedAt = Date.now();
  const { data, error } = await supabase.rpc('publish_catalog_version', args);

  if (error) {
    return mapRpcTransportError('publishCatalogVersion', error, requestId, {
      startedAt,
      versionId: args.p_version_id,
    });
  }

  const result = mapCatalogRpcActionResponse(
    data as CatalogRpcActionResponse,
    'เผยแพร่เวอร์ชันบัญชีราคาแล้ว',
  );
  logMasterCatalogOperation({
    operation: 'publishCatalogVersion',
    outcome: result.status === 'success' ? 'success' : 'rejected',
    startedAt,
    requestId: result.requestId ?? requestId,
    versionId: result.versionId ?? args.p_version_id,
    code: result.code,
  });

  if (result.status === 'success') {
    revalidateMasterCatalogPaths(result.versionId ?? args.p_version_id);
  }

  return result;
}

export async function restoreCatalogPointerAction(
  _previousState: CatalogMutationState,
  formData: FormData,
): Promise<CatalogMutationState> {
  const requestId = readOperationRequestId(formData);
  if (typeof requestId !== 'string') return requestId;

  const supabase = await createClient();
  const gate = await loadCatalogAdminGate(supabase);

  if (gate.state !== 'enabled') {
    return createCatalogMutationError('ระบบบัญชีราคาสำหรับผู้ดูแลยังไม่เปิดใช้งาน', 'FORBIDDEN');
  }

  const args = buildRestoreCatalogPointerArgs(formData, requestId);

  if ('status' in args) {
    return args;
  }

  const startedAt = Date.now();
  const { data, error } = await supabase.rpc('restore_catalog_pointer', args);

  if (error) {
    return mapRpcTransportError('restoreCatalogPointer', error, requestId, {
      startedAt,
      versionId: args.p_target_version_id,
    });
  }

  const result = mapCatalogRpcActionResponse(
    data as CatalogRpcActionResponse,
    'คืนเวอร์ชันบัญชีราคาที่ใช้งานแล้ว',
  );
  logMasterCatalogOperation({
    operation: 'restoreCatalogPointer',
    outcome: result.status === 'success' ? 'success' : 'rejected',
    startedAt,
    requestId: result.requestId ?? requestId,
    versionId: result.versionId ?? args.p_target_version_id,
    code: result.code,
  });

  if (result.status === 'success') {
    revalidateMasterCatalogPaths(result.versionId ?? args.p_target_version_id);
  }

  return result;
}

function readRequiredActionText(
  formData: FormData,
  key: string,
  label: string,
): string | CatalogMutationState {
  const value = formData.get(key);
  const text = typeof value === 'string' ? value.trim().normalize('NFC') : '';

  if (!text) {
    return createCatalogMutationError(`${label} ต้องไม่ว่าง`);
  }

  return text;
}

function readOperationRequestId(formData: FormData): string | CatalogMutationState {
  const requestId = readRequiredActionText(formData, 'requestId', 'รหัสคำขอ');
  if (typeof requestId !== 'string') return requestId;
  if (!UUID_PATTERN.test(requestId)) {
    return createCatalogMutationError('รหัสคำขอไม่ถูกต้อง');
  }
  return requestId;
}

function readCatalogVersionIntent(
  formData: FormData,
): CatalogVersionTransition | CatalogMutationState {
  const intent = readRequiredActionText(formData, 'versionIntent', 'วัตถุประสงค์ของฉบับใหม่');
  if (typeof intent !== 'string') return intent;
  if (intent !== 'annual' && intent !== 'revision' && intent !== 'patch') {
    return createCatalogMutationError('วัตถุประสงค์ของฉบับใหม่ไม่ถูกต้อง');
  }
  return intent;
}

function readVersionSegment(
  formData: FormData,
  key: string,
  label: string,
): number | CatalogMutationState {
  const value = formData.get(key);
  const text = typeof value === 'string' ? value.trim() : '';
  if (!/^(0|[1-9][0-9]*)$/.test(text)) {
    return createCatalogMutationError(`${label} ต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป`);
  }
  const segment = Number(text);
  if (!Number.isSafeInteger(segment)) {
    return createCatalogMutationError(`${label} มีค่ามากเกินไป`);
  }
  return segment;
}

async function readValidatedImportPayload(
  formData: FormData,
  expectedNormalizedPayloadHash?: string,
) {
  const payloadJson = readRequiredActionText(formData, 'payloadJson', 'ข้อมูลนำเข้าที่ผ่านการจัดรูปแบบ');
  if (typeof payloadJson !== 'string') return payloadJson;

  let parsed: unknown;
  try {
    parsed = JSON.parse(payloadJson);
  } catch {
    return createCatalogMutationError('ข้อมูลนำเข้าที่ผ่านการจัดรูปแบบต้องเป็น JSON ที่ถูกต้อง');
  }

  try {
    if (expectedNormalizedPayloadHash) {
      return await validateCatalogImportPayloadHash(parsed, expectedNormalizedPayloadHash);
    }

    return await validateCatalogImportPayload(parsed);
  } catch (error) {
    return mapImportValidationError(error);
  }
}

function mapImportValidationError(error: unknown): CatalogMutationState {
  if (error instanceof CatalogImportPayloadValidationError) {
    return createCatalogMutationError(
      error.message,
      error.code,
      error.diagnostics.map((diagnostic) => ({
        row: diagnostic.row,
        field: diagnostic.field,
        code: String(diagnostic.code),
        message: diagnostic.message,
      })),
    );
  }

  if (error instanceof CatalogImportServerValidationError) {
    return createCatalogMutationError(
      error.message,
      error.code,
      error.diagnostics.map((diagnostic) => ({
        row: diagnostic.row,
        field: diagnostic.field,
        code: String(diagnostic.code),
        message: diagnostic.message,
      })),
    );
  }

  return createCatalogMutationError('ตรวจข้อมูลนำเข้าไม่สำเร็จ', 'INTERNAL_ERROR');
}

function revalidateMasterCatalogPaths(versionId: string | undefined) {
  revalidatePath('/admin/master-catalog');
  revalidatePath('/admin/master-catalog/versions');
  revalidatePath('/admin/master-catalog/history');
  revalidatePath('/admin/master-catalog/import');

  if (versionId) {
    revalidatePath(`/admin/master-catalog/versions/${versionId}`);
    revalidatePath(`/admin/master-catalog/versions/${versionId}/review`);
    revalidatePath(`/admin/master-catalog/versions/${versionId}/placement`);
  }
}

function mapRpcTransportError(
  operation: CatalogRpcTransportOperation,
  error: SupabaseActionError,
  requestId: string,
  context: {
    startedAt: number;
    versionId?: string;
  },
): CatalogMutationState {
  logMasterCatalogOperation({
    operation,
    outcome: 'transport_error',
    startedAt: context.startedAt,
    requestId,
    versionId: context.versionId,
    code: error.code,
  });

  return createCatalogRpcTransportError(operation, requestId);
}
