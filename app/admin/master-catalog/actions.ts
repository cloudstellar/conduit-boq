'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { loadCatalogAdminGate } from '@/lib/master-catalog/admin/readModel';
import {
  CatalogImportPayloadValidationError,
  validateCatalogImportPayloadHashV1,
  validateCatalogImportPayloadV1,
} from '@/lib/master-catalog/import/payload';
import {
  CatalogImportServerValidationError,
  validateCatalogImportAgainstDraft,
} from '@/lib/master-catalog/admin/importValidation';
import {
  type CatalogMutationState,
  type CatalogRpcActionResponse,
  buildManualCatalogChangeArgs,
  createCatalogMutationError,
  mapCatalogRpcActionResponse,
} from '@/lib/master-catalog/admin/actionModel';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function createCatalogDraftAction(
  _previousState: CatalogMutationState,
  formData: FormData,
): Promise<CatalogMutationState> {
  const supabase = await createClient();
  const gate = await loadCatalogAdminGate(supabase);

  if (gate.state !== 'enabled') {
    return createCatalogMutationError('Master Catalog admin gate ยังไม่เปิด', 'FORBIDDEN');
  }

  const name = readRequiredActionText(formData, 'name', 'draft name');
  const reason = readRequiredActionText(formData, 'reason', 'reason');

  if (typeof name !== 'string') return name;
  if (typeof reason !== 'string') return reason;

  const { data: pointer, error: pointerError } = await supabase
    .from('price_list_default_version')
    .select('version_id')
    .eq('id', true)
    .maybeSingle();

  if (pointerError || !pointer?.version_id) {
    return createCatalogMutationError('อ่าน current catalog default ไม่สำเร็จ', 'DRAFT_BASE_STALE');
  }

  const requestId = randomUUID();
  const { data, error } = await supabase.rpc('create_catalog_draft', {
    p_base_version_id: pointer.version_id,
    p_version_major: 2568,
    p_version_minor: 1,
    p_version_patch: 0,
    p_name: name,
    p_reason: reason,
    p_request_id: requestId,
  });

  if (error) {
    return createCatalogMutationError(error.message, 'INTERNAL_ERROR');
  }

  const result = mapCatalogRpcActionResponse(
    data as CatalogRpcActionResponse,
    'สร้าง draft 2568.1.0 แล้ว',
  );

  if (result.status === 'success') {
    revalidateMasterCatalogPaths(result.versionId);
  }

  return result;
}

export async function applyCatalogManualChangeAction(
  _previousState: CatalogMutationState,
  formData: FormData,
): Promise<CatalogMutationState> {
  const supabase = await createClient();
  const gate = await loadCatalogAdminGate(supabase);

  if (gate.state !== 'enabled') {
    return createCatalogMutationError('Master Catalog admin gate ยังไม่เปิด', 'FORBIDDEN');
  }

  const args = buildManualCatalogChangeArgs(formData, randomUUID());

  if ('status' in args) {
    return args;
  }

  const { data, error } = await supabase.rpc('apply_catalog_changes', args);

  if (error) {
    return createCatalogMutationError(error.message, 'INTERNAL_ERROR');
  }

  const result = mapCatalogRpcActionResponse(
    data as CatalogRpcActionResponse,
    'บันทึก draft change set แล้ว',
  );

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
    return createCatalogMutationError('Master Catalog admin gate ยังไม่เปิด', 'FORBIDDEN');
  }

  const validated = await readValidatedImportPayload(formData);
  if ('status' in validated) {
    return validated;
  }

  try {
    await validateCatalogImportAgainstDraft(supabase, validated.payload);
  } catch (error) {
    return mapImportValidationError(error);
  }

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
    return createCatalogMutationError(error.message, 'INTERNAL_ERROR');
  }

  const result = mapCatalogRpcActionResponse(
    data as CatalogRpcActionResponse,
    'บันทึก import validation แล้ว',
  );

  if (result.status === 'success') {
    revalidateMasterCatalogPaths(result.versionId ?? validated.payload.versionId);
  }

  return result;
}

export async function applyCatalogImportAction(
  _previousState: CatalogMutationState,
  formData: FormData,
): Promise<CatalogMutationState> {
  const supabase = await createClient();
  const gate = await loadCatalogAdminGate(supabase);

  if (gate.state !== 'enabled') {
    return createCatalogMutationError('Master Catalog admin gate ยังไม่เปิด', 'FORBIDDEN');
  }

  const importId = readRequiredActionText(formData, 'importId', 'import id');
  if (typeof importId !== 'string') return importId;

  if (!UUID_PATTERN.test(importId)) {
    return createCatalogMutationError('import id ไม่ถูกต้อง');
  }

  const { data: importRecord, error: importError } = await supabase
    .from('catalog_imports')
    .select('id,version_id,status,normalized_payload_hash')
    .eq('id', importId)
    .maybeSingle();

  if (importError) {
    return createCatalogMutationError('โหลด import validation ไม่สำเร็จ', 'INTERNAL_ERROR');
  }

  if (!importRecord) {
    return createCatalogMutationError('ไม่พบ import validation ที่เลือก', 'VALIDATION_FAILED');
  }

  if (importRecord.status !== 'validated') {
    return createCatalogMutationError(
      'Import batch นี้ถูก apply หรือ reject แล้ว',
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

  const applyRequestId = randomUUID();
  const { data, error } = await supabase.rpc('apply_catalog_changes', {
    p_version_id: validated.payload.versionId,
    p_change_payload: {
      operation: 'import_apply',
      payload: validated.payload,
      normalizedPayloadHash: validated.normalizedPayloadHash,
    },
    p_expected_lock_version: validated.payload.expectedLockVersion,
    p_reason: validated.payload.reason,
    p_request_id: applyRequestId,
    p_import_id: importId,
  });

  if (error) {
    return createCatalogMutationError(error.message, 'INTERNAL_ERROR');
  }

  const result = mapCatalogRpcActionResponse(
    data as CatalogRpcActionResponse,
    'Apply import เข้า draft แล้ว',
  );

  if (result.status === 'success') {
    revalidateMasterCatalogPaths(result.versionId ?? validated.payload.versionId);
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

async function readValidatedImportPayload(
  formData: FormData,
  expectedNormalizedPayloadHash?: string,
) {
  const payloadJson = readRequiredActionText(formData, 'payloadJson', 'normalized import payload');
  if (typeof payloadJson !== 'string') return payloadJson;

  let parsed: unknown;
  try {
    parsed = JSON.parse(payloadJson);
  } catch {
    return createCatalogMutationError('normalized import payload ต้องเป็น JSON ที่ถูกต้อง');
  }

  try {
    if (expectedNormalizedPayloadHash) {
      return await validateCatalogImportPayloadHashV1(parsed, expectedNormalizedPayloadHash);
    }

    return await validateCatalogImportPayloadV1(parsed);
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

  return createCatalogMutationError('Import validation ไม่สำเร็จ', 'INTERNAL_ERROR');
}

function revalidateMasterCatalogPaths(versionId: string | undefined) {
  revalidatePath('/admin/master-catalog');
  revalidatePath('/admin/master-catalog/versions');
  revalidatePath('/admin/master-catalog/history');
  revalidatePath('/admin/master-catalog/import');

  if (versionId) {
    revalidatePath(`/admin/master-catalog/versions/${versionId}`);
  }
}
