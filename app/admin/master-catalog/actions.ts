'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { loadCatalogAdminGate } from '@/lib/master-catalog/admin/readModel';
import {
  type CatalogMutationState,
  type CatalogRpcActionResponse,
  buildManualCatalogChangeArgs,
  createCatalogMutationError,
  mapCatalogRpcActionResponse,
} from '@/lib/master-catalog/admin/actionModel';

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

function revalidateMasterCatalogPaths(versionId: string | undefined) {
  revalidatePath('/admin/master-catalog');
  revalidatePath('/admin/master-catalog/versions');
  revalidatePath('/admin/master-catalog/history');
  revalidatePath('/admin/master-catalog/import');

  if (versionId) {
    revalidatePath(`/admin/master-catalog/versions/${versionId}`);
  }
}
