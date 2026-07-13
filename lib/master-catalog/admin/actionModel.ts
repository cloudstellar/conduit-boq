import type { CatalogImportDiff } from './importValidation';

export type CatalogMutationStatus = 'idle' | 'success' | 'error';

export interface CatalogMutationState {
  status: CatalogMutationStatus;
  message: string;
  code?: string;
  versionId?: string;
  lockVersion?: number;
  changeSetId?: string;
  itemCount?: number;
  datasetHash?: string;
  importId?: string;
  importStatus?: string;
  normalizedPayloadHash?: string;
  changedItems?: number;
  retiredByFullImportOmission?: number;
  duplicateRequest?: boolean;
  requestId?: string;
  retryable?: boolean;
  outcomeUncertain?: boolean;
  importPreview?: CatalogImportDiff;
  diagnostics?: Array<{
    row?: number;
    field?: string;
    code: string;
    message: string;
  }>;
}

export interface CatalogRpcActionResponse {
  ok?: boolean;
  requestId?: string;
  data?: {
    versionId?: string;
    lockVersion?: number;
    changeSetId?: string;
    targetVersionId?: string;
    itemCount?: number;
    datasetHash?: string;
    importId?: string;
    status?: string;
    normalizedPayloadHash?: string;
    changedItems?: number;
    retiredByFullImportOmission?: number;
    duplicateRequest?: boolean;
  };
  error?: {
    code?: string;
    message?: string;
    retryable?: boolean;
    diagnostics?: CatalogMutationState['diagnostics'];
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

export interface CatalogPublishVersionArgs {
  p_version_id: string;
  p_expected_lock_version: number;
  p_approval_metadata: {
    effectiveDate: string;
    approvalReference: string;
    approvalDocumentDate: string;
    physicalArchiveReference: string;
  };
  p_reason: string;
  p_request_id: string;
}

export interface CatalogAbandonDraftArgs {
  p_version_id: string;
  p_expected_lock_version: number;
  p_reason: string;
  p_request_id: string;
}

export interface CatalogRestorePointerArgs {
  p_target_version_id: string;
  p_reason: string;
  p_request_id: string;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MONEY_PATTERN = /^(0|[1-9][0-9]*)\.[0-9]{2}$/;
const MANUAL_ACTIONS = [
  'retire',
  'update',
  'recode',
  'add',
  'reactivate',
  'withdraw',
] as const;
const SAFE_RPC_ACTION_ERROR_CODES = new Set([
  'CATALOG_CODE_CAPACITY_REVIEW_REQUIRED',
  'CATALOG_AUTHORITY_NOT_FOUND',
  'CATALOG_CODE_SERVER_ALLOCATION_REQUIRED',
  'CATALOG_WITHDRAW_NOT_ALLOWED',
  'CATALOG_NEW_IDENTITY_DISABLED',
  'CATALOG_RETIREMENT_DISABLED',
  'DRAFT_ALREADY_EXISTS',
  'DRAFT_BASE_STALE',
  'DRAFT_LOCK_CONFLICT',
  'DRAFT_NOT_EDITABLE',
  'DRAFT_NOT_FOUND',
  'FORBIDDEN',
  'IMPORT_PRICE_AUTHORITY_REQUIRED',
  'IMPORT_RECONCILIATION_REQUIRED',
  'IMPORT_RETIREMENT_APPROVAL_REQUIRED',
  'POINTER_ALREADY_CURRENT',
  'P18_PLACEMENT_REVIEW_REQUIRED',
  'PUBLICATION_METADATA_REQUIRED',
  'PUBLICATION_VALIDATION_FAILED',
  'REQUEST_ALREADY_PROCESSED',
  'REQUEST_ID_PAYLOAD_MISMATCH',
  'STRUCTURED_CODE_EXCEPTION_REVIEW_REQUIRED',
  'TARGET_VERSION_NOT_PUBLISHED',
  'VALIDATION_FAILED',
  'VERSION_NOT_PUBLISHABLE',
  'VERSION_NOT_RESTORABLE',
  'VERSION_TRANSITION_INVALID',
]);
const RPC_ACTION_ERROR_MESSAGES_TH: Record<string, string> = {
  CATALOG_CODE_CAPACITY_REVIEW_REQUIRED: 'ลำดับรหัสของกลุ่มนี้ถึงจุดที่ต้องทบทวนก่อนจัดสรรรหัสเพิ่ม',
  CATALOG_AUTHORITY_NOT_FOUND: 'หมวดงานหรือกลุ่มรหัสไม่อยู่ในชุดข้อมูลที่อนุมัติของฉบับร่างนี้',
  CATALOG_CODE_SERVER_ALLOCATION_REQUIRED: 'กรุณาเลือกกลุ่มรหัสและให้ระบบจัดสรรรหัสรายการ',
  CATALOG_WITHDRAW_NOT_ALLOWED: 'ถอนรายการนี้ออกจากฉบับร่างไม่ได้ กรุณาตรวจประวัติการเผยแพร่ก่อน',
  CATALOG_NEW_IDENTITY_DISABLED: 'ยังไม่เปิดการเพิ่มรายการใหม่สำหรับรอบเผยแพร่นี้',
  CATALOG_RETIREMENT_DISABLED: 'ยังไม่เปิดการยกเลิกใช้รายการสำหรับรอบเผยแพร่นี้',
  DRAFT_ALREADY_EXISTS: 'เวอร์ชันฐานนี้มีฉบับร่างที่กำลังทำงานอยู่แล้ว กรุณาเปิดฉบับร่างเดิม หรือยกเลิกฉบับร่างเดิมพร้อมระบุเหตุผลก่อนสร้างใหม่',
  DRAFT_BASE_STALE: 'ฉบับร่างนี้อ้างอิงเวอร์ชันฐานเก่า กรุณาสร้างฉบับร่างใหม่จากเวอร์ชันใช้งานปัจจุบัน',
  DRAFT_LOCK_CONFLICT: 'ฉบับร่างถูกเปลี่ยนแปลงหลังเปิดหน้าจอนี้ กรุณาโหลดข้อมูลล่าสุดแล้วตรวจอีกครั้ง',
  DRAFT_NOT_EDITABLE: 'แก้ไขได้เฉพาะฉบับร่างที่อ้างอิงเวอร์ชันใช้งานปัจจุบัน',
  DRAFT_NOT_FOUND: 'ไม่พบฉบับร่างที่ระบุ',
  FORBIDDEN: 'บัญชีนี้ไม่มีสิทธิ์ดำเนินการกับบัญชีราคามาตรฐาน',
  IMPORT_PRICE_AUTHORITY_REQUIRED: 'การเปลี่ยนชื่อ หน่วย หรือราคาต้องมีเอกสารอ้างอิงที่ตรวจสอบได้',
  IMPORT_RECONCILIATION_REQUIRED: 'ข้อมูลนำเข้ายังมีจุดที่ต้องจับคู่หรือตรวจสอบให้ตรงกับฉบับร่าง',
  IMPORT_RETIREMENT_APPROVAL_REQUIRED: 'จำนวนรายการที่จะยกเลิกใช้ต้องมีหลักฐานอนุมัติและยืนยันจำนวนให้ตรงกัน',
  POINTER_ALREADY_CURRENT: 'เวอร์ชันนี้เป็นเวอร์ชันใช้งานปัจจุบันอยู่แล้ว',
  P18_PLACEMENT_REVIEW_REQUIRED: 'รายการเพิ่มใหม่ยังต้องผ่านการพิจารณาตำแหน่งตาม P-18 ก่อนเผยแพร่',
  PUBLICATION_METADATA_REQUIRED: 'กรุณาระบุข้อมูลเอกสารอนุมัติและที่เก็บไฟล์ให้ครบ',
  PUBLICATION_VALIDATION_FAILED: 'ฉบับร่างยังไม่ผ่านเงื่อนไขเผยแพร่ กรุณาตรวจผลความพร้อม',
  REQUEST_ALREADY_PROCESSED: 'คำขอนี้ถูกดำเนินการแล้ว ระบบจะไม่บันทึกซ้ำ',
  REQUEST_ID_PAYLOAD_MISMATCH: 'รหัสคำขอนี้เคยใช้กับข้อมูลอีกชุด กรุณาเริ่มรายการใหม่',
  STRUCTURED_CODE_EXCEPTION_REVIEW_REQUIRED: 'รหัสเดิมที่ไม่ใช่ข้อยกเว้นยังต้องได้รับการทบทวนก่อนเผยแพร่',
  TARGET_VERSION_NOT_PUBLISHED: 'เวอร์ชันเป้าหมายยังไม่เคยเผยแพร่ จึงนำกลับมาใช้งานไม่ได้',
  VALIDATION_FAILED: 'ตรวจข้อมูลไม่ผ่าน กรุณาตรวจช่องข้อมูลและผลตรวจแล้วลองใหม่',
  VERSION_NOT_PUBLISHABLE: 'เวอร์ชันนี้ยังไม่อยู่ในสถานะที่เผยแพร่ได้',
  VERSION_NOT_RESTORABLE: 'เวอร์ชันนี้ไม่เข้าเงื่อนไขสำหรับนำกลับมาใช้งาน',
  VERSION_SEQUENCE_STALE: 'เลขฉบับนี้ถูกสงวนโดยรายการอื่นแล้ว ระบบกำลังโหลดทะเบียนล่าสุดเพื่อเสนอเลขใหม่',
  VERSION_TRANSITION_INVALID: 'ไม่อนุญาตให้เปลี่ยนสถานะเวอร์ชันตามลำดับนี้',
};
const RPC_TRANSPORT_ERROR_MESSAGES = {
  abandonCatalogDraft: 'ยกเลิกฉบับร่างไม่สำเร็จจากระบบฐานข้อมูล',
  applyCatalogImport: 'บันทึกการนำเข้าไม่สำเร็จจากระบบฐานข้อมูล',
  applyCatalogManualChange: 'บันทึกการเปลี่ยนแปลงในฉบับร่างไม่สำเร็จจากระบบฐานข้อมูล',
  createCatalogDraft: 'สร้างฉบับร่างไม่สำเร็จจากระบบฐานข้อมูล',
  previewCatalogImport: 'บันทึกผลตรวจการนำเข้าไม่สำเร็จจากระบบฐานข้อมูล',
  publishCatalogVersion: 'เผยแพร่เวอร์ชันบัญชีราคาไม่สำเร็จจากระบบฐานข้อมูล',
  restoreCatalogPointer: 'คืนเวอร์ชันใช้งานไม่สำเร็จจากระบบฐานข้อมูล',
} as const;

type ManualAction = typeof MANUAL_ACTIONS[number];
export type CatalogRpcTransportOperation = keyof typeof RPC_TRANSPORT_ERROR_MESSAGES;

export function createIdleCatalogMutationState(): CatalogMutationState {
  return { status: 'idle', message: '' };
}

export function isDefinitiveCatalogMutationOutcome(
  state: CatalogMutationState,
): boolean {
  return state.status !== 'idle' && state.outcomeUncertain !== true;
}

export function shouldBeginNewCatalogOperation(
  previousState: CatalogMutationState | null,
  nextState: CatalogMutationState,
  previousScopeKey: string,
  nextScopeKey: string,
): boolean {
  return previousState === null
    || previousScopeKey !== nextScopeKey
    || (
      previousState !== nextState
      && isDefinitiveCatalogMutationOutcome(nextState)
    );
}

export function shouldPreserveCatalogOperationInput(
  state: CatalogMutationState,
): boolean {
  return state.status !== 'success';
}

export function createCatalogMutationError(
  message: string,
  code = 'VALIDATION_FAILED',
  diagnostics?: CatalogMutationState['diagnostics'],
  metadata: Pick<
    CatalogMutationState,
    'requestId' | 'retryable' | 'outcomeUncertain'
  > = {},
): CatalogMutationState {
  return { status: 'error', message, code, diagnostics, ...metadata };
}

export function createCatalogRpcTransportError(
  operation: CatalogRpcTransportOperation,
  requestId: string,
): CatalogMutationState {
  return createCatalogMutationError(
    `${RPC_TRANSPORT_ERROR_MESSAGES[operation]} ผลลัพธ์อาจถูกบันทึกแล้ว กรุณาลองซ้ำด้วยรหัสคำขอเดิม`,
    'INTERNAL_ERROR',
    undefined,
    { requestId, retryable: true, outcomeUncertain: true },
  );
}

export function mapCatalogRpcActionResponse(
  response: CatalogRpcActionResponse | null | undefined,
  successMessage: string,
): CatalogMutationState {
  if (!response) {
    return createCatalogMutationError('ไม่ได้รับผลลัพธ์จาก Master Catalog RPC', 'INTERNAL_ERROR');
  }

  if (!response.ok) {
    const code = response.error?.code ?? 'VALIDATION_FAILED';
    return createCatalogMutationError(
      readSafeRpcActionErrorMessage(code, response.error?.message),
      code,
      response.error?.diagnostics,
      {
        requestId: response.requestId,
        retryable: response.error?.retryable,
        outcomeUncertain: false,
      },
    );
  }

  return {
    status: 'success',
    message: successMessage,
    versionId: response.data?.versionId ?? response.data?.targetVersionId,
    lockVersion: response.data?.lockVersion,
    changeSetId: response.data?.changeSetId,
    itemCount: response.data?.itemCount,
    datasetHash: response.data?.datasetHash,
    importId: response.data?.importId,
    importStatus: response.data?.status,
    normalizedPayloadHash: response.data?.normalizedPayloadHash,
    changedItems: response.data?.changedItems,
    retiredByFullImportOmission: response.data?.retiredByFullImportOmission,
    duplicateRequest: response.data?.duplicateRequest,
    requestId: response.requestId,
    outcomeUncertain: false,
  };
}

export function buildPublishCatalogVersionArgs(
  formData: FormData,
  requestId: string,
): CatalogPublishVersionArgs | CatalogMutationState {
  try {
    const versionId = readRequiredText(formData, 'versionId', 'รหัสเวอร์ชัน');
    if (!UUID_PATTERN.test(versionId)) {
      return createCatalogMutationError('รหัสเวอร์ชันไม่ถูกต้อง');
    }

    if (!UUID_PATTERN.test(requestId)) {
      return createCatalogMutationError('รหัสคำขอไม่ถูกต้อง');
    }

    const expectedLockVersion = readInteger(formData, 'expectedLockVersion', 'รุ่นแก้ไข');
    if (expectedLockVersion instanceof Error) {
      return createCatalogMutationError(expectedLockVersion.message);
    }

    const effectiveDate = readRequiredDate(formData, 'effectiveDate', 'วันที่มีผล');
    if (isCatalogMutationState(effectiveDate)) return effectiveDate;

    const approvalDocumentDate = readRequiredDate(
      formData,
      'approvalDocumentDate',
      'วันที่เอกสารอนุมัติ',
    );
    if (isCatalogMutationState(approvalDocumentDate)) return approvalDocumentDate;

    return {
      p_version_id: versionId,
      p_expected_lock_version: expectedLockVersion,
      p_approval_metadata: {
        effectiveDate,
        approvalReference: readRequiredText(formData, 'approvalReference', 'เลขที่เอกสารอนุมัติ'),
        approvalDocumentDate,
        physicalArchiveReference: readRequiredText(
          formData,
          'physicalArchiveReference',
          'ที่เก็บเอกสารและไฟล์ฉบับอนุมัติ',
        ),
      },
      p_reason: readRequiredText(formData, 'reason', 'เหตุผล'),
      p_request_id: requestId,
    };
  } catch (error) {
    if (error instanceof RequiredFieldError) {
      return createCatalogMutationError(error.message);
    }
    throw error;
  }
}

export function buildAbandonCatalogDraftArgs(
  formData: FormData,
  requestId: string,
): CatalogAbandonDraftArgs | CatalogMutationState {
  try {
    const versionId = readRequiredText(formData, 'versionId', 'รหัสฉบับร่าง');
    if (!UUID_PATTERN.test(versionId)) {
      return createCatalogMutationError('รหัสฉบับร่างไม่ถูกต้อง');
    }

    if (!UUID_PATTERN.test(requestId)) {
      return createCatalogMutationError('รหัสคำขอไม่ถูกต้อง');
    }

    const expectedLockVersion = readInteger(
      formData,
      'expectedLockVersion',
      'รุ่นแก้ไข',
    );
    if (expectedLockVersion instanceof Error) {
      return createCatalogMutationError(expectedLockVersion.message);
    }

    return {
      p_version_id: versionId,
      p_expected_lock_version: expectedLockVersion,
      p_reason: readRequiredText(formData, 'reason', 'เหตุผลที่ยกเลิกฉบับร่าง'),
      p_request_id: requestId,
    };
  } catch (error) {
    if (error instanceof RequiredFieldError) {
      return createCatalogMutationError(error.message);
    }
    throw error;
  }
}

export function buildRestoreCatalogPointerArgs(
  formData: FormData,
  requestId: string,
): CatalogRestorePointerArgs | CatalogMutationState {
  try {
    const targetVersionId = readRequiredText(formData, 'targetVersionId', 'รหัสเวอร์ชันเป้าหมาย');
    if (!UUID_PATTERN.test(targetVersionId)) {
      return createCatalogMutationError('รหัสเวอร์ชันเป้าหมายไม่ถูกต้อง');
    }

    if (!UUID_PATTERN.test(requestId)) {
      return createCatalogMutationError('รหัสคำขอไม่ถูกต้อง');
    }

    return {
      p_target_version_id: targetVersionId,
      p_reason: readRequiredText(formData, 'reason', 'เหตุผล'),
      p_request_id: requestId,
    };
  } catch (error) {
    if (error instanceof RequiredFieldError) {
      return createCatalogMutationError(error.message);
    }
    throw error;
  }
}

function readSafeRpcActionErrorMessage(
  code: string,
  message: string | undefined,
): string {
  if (message && SAFE_RPC_ACTION_ERROR_CODES.has(code)) {
    return RPC_ACTION_ERROR_MESSAGES_TH[code] ?? message;
  }

  return 'Master Catalog RPC ปฏิเสธรายการนี้';
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
  const versionId = readRequiredText(formData, 'versionId', 'รหัสเวอร์ชัน');
  if (!UUID_PATTERN.test(versionId)) {
    return createCatalogMutationError('รหัสเวอร์ชันไม่ถูกต้อง');
  }

  if (!UUID_PATTERN.test(requestId)) {
    return createCatalogMutationError('รหัสคำขอไม่ถูกต้อง');
  }

  const expectedLockVersion = readInteger(formData, 'expectedLockVersion', 'รุ่นแก้ไข');
  if (expectedLockVersion instanceof Error) {
    return createCatalogMutationError(expectedLockVersion.message);
  }

  const reason = readRequiredText(formData, 'reason', 'เหตุผล');
  const action = readRequiredText(formData, 'action', 'การดำเนินการ') as ManualAction;

  if (!MANUAL_ACTIONS.includes(action)) {
    return createCatalogMutationError('การดำเนินการไม่อยู่ในชุดที่อนุญาต');
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
  const targetIdentityId = action === 'add'
    ? null
    : readRequiredUuid(formData, 'targetIdentityId', 'ตัวตนรายการ');

  if (isCatalogMutationState(targetIdentityId)) return targetIdentityId;

  if (action === 'retire' || action === 'reactivate' || action === 'withdraw') {
    return {
      action,
      targetIdentityId,
      ...(readOptionalText(formData, 'targetItemCode')
        ? { targetItemCode: readOptionalText(formData, 'targetItemCode') }
        : {}),
    };
  }

  if (action === 'update') {
    const categoryId = readRequiredUuid(formData, 'categoryId', 'หมวดงาน');
    if (isCatalogMutationState(categoryId)) return categoryId;

    const money = readMoneyFields(formData);
    if (isCatalogMutationState(money)) return money;

    return {
      action,
      targetIdentityId,
      targetItemCode: readRequiredText(formData, 'targetItemCode', 'รหัสรายการ'),
      itemName: readRequiredText(formData, 'itemName', 'ชื่อรายการ'),
      unit: readRequiredText(formData, 'unit', 'หน่วยนับ'),
      categoryId,
      priceAuthorityReference: readOptionalText(formData, 'priceAuthorityReference'),
      ...money,
    };
  }

  if (action === 'recode') {
    const codeGroupId = readRequiredUuid(formData, 'codeGroupId', 'กลุ่มรหัส');
    if (isCatalogMutationState(codeGroupId)) return codeGroupId;
    const categoryId = readRequiredUuid(formData, 'categoryId', 'หมวดงาน');
    if (isCatalogMutationState(categoryId)) return categoryId;

    return {
      action,
      targetIdentityId,
      targetItemCode: readRequiredText(formData, 'targetItemCode', 'รหัสรายการ'),
      identityOutcome: 'recode',
      categoryId,
      codeGroupId,
    };
  }

  const money = readMoneyFields(formData);
  if (isCatalogMutationState(money)) return money;
  const categoryId = readRequiredUuid(formData, 'categoryId', 'หมวดงาน');
  if (isCatalogMutationState(categoryId)) return categoryId;
  const codeGroupId = readRequiredUuid(formData, 'codeGroupId', 'กลุ่มรหัส');
  if (isCatalogMutationState(codeGroupId)) return codeGroupId;

  return {
    action,
    identityOutcome: 'candidate_add',
    itemName: readRequiredText(formData, 'itemName', 'ชื่อรายการ'),
    unit: readRequiredText(formData, 'unit', 'หน่วยนับ'),
    categoryId,
    codeGroupId,
    priceAuthorityReference: readRequiredText(
      formData,
      'priceAuthorityReference',
      'เอกสารอ้างอิงชื่อ หน่วย และราคา',
    ),
    ...money,
  };
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

function readRequiredUuid(
  formData: FormData,
  key: string,
  label: string,
): string | CatalogMutationState {
  const value = readRequiredText(formData, key, label);

  if (!UUID_PATTERN.test(value)) {
    return createCatalogMutationError(`${label} ไม่ถูกต้อง`);
  }

  return value;
}

function readInteger(formData: FormData, key: string, label: string): number | Error {
  const raw = readRequiredText(formData, key, label);
  const parsed = Number(raw);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return new Error(`${label} ต้องเป็นจำนวนเต็มไม่ติดลบ`);
  }

  return parsed;
}

function readRequiredDate(
  formData: FormData,
  key: string,
  label: string,
): string | CatalogMutationState {
  const value = readRequiredText(formData, key, label);

  if (!DATE_PATTERN.test(value)) {
    return createCatalogMutationError(`${label} ต้องอยู่ในรูป YYYY-MM-DD`);
  }

  return value;
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
