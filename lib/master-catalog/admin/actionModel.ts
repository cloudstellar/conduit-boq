export type CatalogMutationStatus = 'idle' | 'success' | 'error';

export interface CatalogMutationState {
  status: CatalogMutationStatus;
  message: string;
  code?: string;
  versionId?: string;
  lockVersion?: number;
  changeSetId?: string;
  duplicateRequest?: boolean;
}

export interface CatalogRpcActionResponse {
  ok?: boolean;
  data?: {
    versionId?: string;
    lockVersion?: number;
    changeSetId?: string;
    duplicateRequest?: boolean;
  };
  error?: {
    code?: string;
    message?: string;
    retryable?: boolean;
  };
}

export interface CatalogManualChangeArgs {
  p_version_id: string;
  p_change_payload: {
    operation: 'manual';
    changes: Record<string, unknown>[];
  };
  p_expected_lock_version: number;
  p_reason: string;
  p_request_id: string;
  p_import_id: null;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CANDIDATE_CODE_PATTERN = /^[A-Z0-9]{3}-[A-Z0-9]{3}-[0-9]{3}$/;
const CODE_GROUP_PATTERN = /^[A-Z0-9]{3}$/;
const MONEY_PATTERN = /^(0|[1-9][0-9]*)\.[0-9]{2}$/;
const MANUAL_ACTIONS = ['retire', 'update', 'recode', 'add'] as const;

type ManualAction = typeof MANUAL_ACTIONS[number];

export function createIdleCatalogMutationState(): CatalogMutationState {
  return { status: 'idle', message: '' };
}

export function createCatalogMutationError(
  message: string,
  code = 'VALIDATION_FAILED',
): CatalogMutationState {
  return { status: 'error', message, code };
}

export function mapCatalogRpcActionResponse(
  response: CatalogRpcActionResponse | null | undefined,
  successMessage: string,
): CatalogMutationState {
  if (!response) {
    return createCatalogMutationError('ไม่ได้รับผลลัพธ์จาก Master Catalog RPC', 'INTERNAL_ERROR');
  }

  if (!response.ok) {
    return createCatalogMutationError(
      response.error?.message ?? 'Master Catalog RPC ปฏิเสธรายการนี้',
      response.error?.code ?? 'VALIDATION_FAILED',
    );
  }

  return {
    status: 'success',
    message: successMessage,
    versionId: response.data?.versionId,
    lockVersion: response.data?.lockVersion,
    changeSetId: response.data?.changeSetId,
    duplicateRequest: response.data?.duplicateRequest,
  };
}

export function buildManualCatalogChangeArgs(
  formData: FormData,
  requestId: string,
): CatalogManualChangeArgs | CatalogMutationState {
  try {
    return buildManualCatalogChangeArgsUnsafe(formData, requestId);
  } catch (error) {
    if (error instanceof RequiredFieldError) {
      return createCatalogMutationError(error.message);
    }
    throw error;
  }
}

function buildManualCatalogChangeArgsUnsafe(
  formData: FormData,
  requestId: string,
): CatalogManualChangeArgs | CatalogMutationState {
  const versionId = readRequiredText(formData, 'versionId', 'version id');
  if (!UUID_PATTERN.test(versionId)) {
    return createCatalogMutationError('version id ไม่ถูกต้อง');
  }

  if (!UUID_PATTERN.test(requestId)) {
    return createCatalogMutationError('request id ไม่ถูกต้อง');
  }

  const expectedLockVersion = readInteger(formData, 'expectedLockVersion', 'lock version');
  if (expectedLockVersion instanceof Error) {
    return createCatalogMutationError(expectedLockVersion.message);
  }

  const reason = readRequiredText(formData, 'reason', 'reason');
  const action = readRequiredText(formData, 'action', 'action') as ManualAction;

  if (!MANUAL_ACTIONS.includes(action)) {
    return createCatalogMutationError('action ไม่อยู่ในชุดที่ WP-4 อนุญาต');
  }

  const change = buildManualChange(formData, action);
  if (isCatalogMutationState(change)) {
    return change;
  }

  return {
    p_version_id: versionId,
    p_change_payload: {
      operation: 'manual',
      changes: [change],
    },
    p_expected_lock_version: expectedLockVersion,
    p_reason: reason,
    p_request_id: requestId,
    p_import_id: null,
  };
}

function buildManualChange(
  formData: FormData,
  action: ManualAction,
): Record<string, unknown> | CatalogMutationState {
  if (action === 'retire') {
    return {
      action,
      legacyItemCode: readRequiredText(formData, 'targetItemCode', 'target item code'),
      identityOutcome: 'retire',
    };
  }

  if (action === 'update') {
    const change: Record<string, unknown> = {
      action,
      legacyItemCode: readRequiredText(formData, 'targetItemCode', 'target item code'),
      priceAuthorityReference: readRequiredText(
        formData,
        'priceAuthorityReference',
        'price authority reference',
      ),
    };

    let changed = false;
    for (const field of ['itemName', 'unit', 'categoryCode'] as const) {
      const value = readOptionalText(formData, field);
      if (value) {
        change[field] = value;
        changed = true;
      }
    }

    for (const field of ['materialCost', 'laborCost', 'unitCost'] as const) {
      const value = readOptionalText(formData, field);
      if (value) {
        if (!MONEY_PATTERN.test(value)) {
          return createCatalogMutationError(`${field} ต้องเป็นเลขทศนิยมสองตำแหน่ง`);
        }
        change[field] = value;
        changed = true;
      }
    }

    if (!changed) {
      return createCatalogMutationError('update ต้องมีอย่างน้อยหนึ่ง field ที่ต้องการเปลี่ยน');
    }

    return change;
  }

  if (action === 'recode') {
    const canonicalCode = readRequiredText(formData, 'canonicalCode', 'canonical code');
    const canonicalCodeError = validateCanonicalCode(canonicalCode);
    if (canonicalCodeError) return canonicalCodeError;

    const group = readCodeGroupFields(formData);
    if (isCatalogMutationState(group)) {
      return group;
    }
    const categoryCode = readOptionalText(formData, 'categoryCode');

    return {
      action,
      legacyItemCode: readRequiredText(formData, 'targetItemCode', 'target item code'),
      canonicalCode,
      identityOutcome: 'recode',
      ...(categoryCode ? { categoryCode } : {}),
      ...group,
    };
  }

  const canonicalCode = readRequiredText(formData, 'canonicalCode', 'canonical code');
  const canonicalCodeError = validateCanonicalCode(canonicalCode);
  if (canonicalCodeError) return canonicalCodeError;

  const group = readCodeGroupFields(formData);
  if (isCatalogMutationState(group)) {
    return group;
  }

  const money = readMoneyFields(formData);
  if (isCatalogMutationState(money)) {
    return money;
  }

  return {
    action,
    canonicalCode,
    identityOutcome: 'candidate_add',
    itemName: readRequiredText(formData, 'itemName', 'item name'),
    unit: readRequiredText(formData, 'unit', 'unit'),
    categoryCode: readRequiredText(formData, 'categoryCode', 'category code'),
    priceAuthorityReference: readRequiredText(
      formData,
      'priceAuthorityReference',
      'price authority reference',
    ),
    ...group,
    ...money,
  };
}

function readCodeGroupFields(formData: FormData): Record<string, string> | CatalogMutationState {
  const workContextCode = readRequiredText(formData, 'workContextCode', 'work context code');
  const itemTypeCode = readRequiredText(formData, 'itemTypeCode', 'item type code');

  if (!CODE_GROUP_PATTERN.test(workContextCode) || !CODE_GROUP_PATTERN.test(itemTypeCode)) {
    return createCatalogMutationError('group code ต้องเป็นตัวอักษร/ตัวเลข 3 ตัว');
  }

  return {
    workContextCode,
    workContextNameTh: readRequiredText(formData, 'workContextNameTh', 'work context name'),
    itemTypeCode,
    itemTypeNameTh: readRequiredText(formData, 'itemTypeNameTh', 'item type name'),
  };
}

function validateCanonicalCode(canonicalCode: string): CatalogMutationState | null {
  if (!CANDIDATE_CODE_PATTERN.test(canonicalCode)) {
    return createCatalogMutationError('canonical code ต้องอยู่ในรูป AAA-TTT-001');
  }

  const suffix = Number(canonicalCode.slice(-3));
  if (suffix >= 900) {
    return createCatalogMutationError(
      'canonical code sequence 900 ขึ้นไปต้องรอ capacity review',
      'CATALOG_CODE_CAPACITY_REVIEW_REQUIRED',
    );
  }

  return null;
}

function readMoneyFields(formData: FormData): Record<string, string> | CatalogMutationState {
  const money = {
    materialCost: readRequiredText(formData, 'materialCost', 'material cost'),
    laborCost: readRequiredText(formData, 'laborCost', 'labor cost'),
    unitCost: readRequiredText(formData, 'unitCost', 'unit cost'),
  };

  if (
    !MONEY_PATTERN.test(money.materialCost) ||
    !MONEY_PATTERN.test(money.laborCost) ||
    !MONEY_PATTERN.test(money.unitCost)
  ) {
    return createCatalogMutationError('ราคา/ต้นทุนต้องเป็นเลขทศนิยมสองตำแหน่ง');
  }

  return money;
}

function readRequiredText(formData: FormData, key: string, label: string): string {
  const value = formData.get(key);
  const text = typeof value === 'string' ? value.trim().normalize('NFC') : '';

  if (!text) {
    throw new RequiredFieldError(`${label} ต้องไม่ว่าง`);
  }

  return text;
}

function readOptionalText(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  const text = typeof value === 'string' ? value.trim().normalize('NFC') : '';
  return text || null;
}

function readInteger(formData: FormData, key: string, label: string): number | Error {
  const raw = readRequiredText(formData, key, label);
  const parsed = Number(raw);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return new Error(`${label} ต้องเป็นจำนวนเต็มไม่ติดลบ`);
  }

  return parsed;
}

class RequiredFieldError extends Error {}

function isCatalogMutationState(value: unknown): value is CatalogMutationState {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    'message' in value
  );
}
