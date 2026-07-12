import type {
  CatalogErrorCode,
  CatalogImportIdentityOutcome,
  CatalogImportPayloadV1,
  CatalogImportPayloadV2,
  NormalizedCatalogImportRowV2,
  NormalizedCatalogRowCandidate,
  ParserDiagnostic,
} from './types'

const UTF8_ENCODER = new TextEncoder()

export const CATALOG_IMPORT_PAYLOAD_SCHEMA_VERSION = 'catalog-import-payload/1'
export const CATALOG_IMPORT_PAYLOAD_SCHEMA_VERSION_V2 = 'catalog-import-payload/2'
export const CATALOG_IMPORT_PAYLOAD_PROFILE_ID = 'nt-item-master-2568'
export const CATALOG_IMPORT_PAYLOAD_PROFILE_VERSION = '1'

export const CATALOG_IMPORT_NORMALIZED_PAYLOAD_LIMIT_BYTES = 750 * 1024
export const CATALOG_IMPORT_RAW_FILE_LIMIT_BYTES = 20 * 1024 * 1024
export const CATALOG_IMPORT_ROW_LIMIT = 1500

const TOP_LEVEL_KEYS = [
  'schemaVersion',
  'parserProfileId',
  'parserProfileVersion',
  'mode',
  'versionId',
  'expectedLockVersion',
  'requestId',
  'reason',
  'source',
  'retirementApprovalReference',
  'retirementConfirmedCount',
  'rows',
] as const

const TOP_LEVEL_KEYS_V2 = [
  'schemaVersion',
  'parserProfileId',
  'parserProfileVersion',
  'mode',
  'versionId',
  'expectedLockVersion',
  'requestId',
  'reason',
  'source',
  'priceAuthorityReference',
  'retirementApprovalReference',
  'retirementConfirmedCount',
  'rows',
] as const

const SOURCE_KEYS = [
  'filename',
  'sizeBytes',
  'sha256',
  'physicalArchiveReference',
] as const

const ROW_KEYS = [
  'sourceRow',
  'sourceReference',
  'legacyItemCode',
  'canonicalCode',
  'workContextCode',
  'workContextNameTh',
  'itemTypeCode',
  'itemTypeNameTh',
  'itemName',
  'unit',
  'materialCost',
  'laborCost',
  'unitCost',
  'categoryCode',
  'identityOutcome',
  'priceAuthorityReference',
] as const

const ROW_KEYS_V2 = [
  'sourceRow',
  'sourceReference',
  'sourceItemCode',
  'legacyItemCode',
  'targetIdentityId',
  'targetItemCode',
  'workContextCode',
  'workContextNameTh',
  'itemTypeCode',
  'itemTypeNameTh',
  'itemName',
  'unit',
  'materialCost',
  'laborCost',
  'unitCost',
  'categoryId',
  'categoryCode',
  'codeGroupId',
  'identityOutcome',
  'priceAuthorityReference',
] as const

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const BARE_SHA256_PATTERN = /^[0-9a-f]{64}$/
const MONEY_PATTERN = /^(0|[1-9][0-9]*)\.[0-9]{2}$/
const CANDIDATE_CODE_PATTERN = /^[A-Z0-9]{3}-[A-Z0-9]{3}-[0-9]{3}$/
const LEGACY_CODE_PATTERN = /^ITEM-[0-9]{4}$/
const CODE_GROUP_PATTERN = /^[A-Z0-9]{3}$/
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/
const IDENTITY_OUTCOMES: readonly CatalogImportIdentityOutcome[] = [
  'retain',
  'recode',
  'candidate_add',
  'retire',
]

type JsonObject = Record<string, unknown>

export interface ValidatedCatalogImportPayloadV1 {
  payload: CatalogImportPayloadV1
  normalizedPayloadJson: string
  normalizedPayloadHash: string
}

export interface ValidatedCatalogImportPayloadV2 {
  payload: CatalogImportPayloadV2
  normalizedPayloadJson: string
  normalizedPayloadHash: string
}

export type ValidatedCatalogImportPayload =
  | ValidatedCatalogImportPayloadV1
  | ValidatedCatalogImportPayloadV2

export interface CatalogImportPayloadValidationOptions {
  maxPayloadBytes?: number
  maxRows?: number
}

export class CatalogImportPayloadValidationError extends Error {
  code: CatalogErrorCode
  diagnostics: ParserDiagnostic[]

  constructor(code: CatalogErrorCode, message: string, diagnostics: ParserDiagnostic[]) {
    super(message)
    this.name = 'CatalogImportPayloadValidationError'
    this.code = code
    this.diagnostics = diagnostics
  }
}

export async function validateCatalogImportPayload(
  input: unknown,
  options: CatalogImportPayloadValidationOptions = {},
): Promise<ValidatedCatalogImportPayload> {
  const payload = requirePlainObject(input, 'payload')

  if (payload.schemaVersion === CATALOG_IMPORT_PAYLOAD_SCHEMA_VERSION_V2) {
    return validateCatalogImportPayloadV2(input, options)
  }

  return validateCatalogImportPayloadV1(input, options)
}

export async function validateCatalogImportPayloadHash(
  input: unknown,
  expectedNormalizedPayloadHash: string,
  options: CatalogImportPayloadValidationOptions = {},
): Promise<ValidatedCatalogImportPayload> {
  const expectedHash = readPatternText(
    expectedNormalizedPayloadHash,
    'normalizedPayloadHash',
    BARE_SHA256_PATTERN,
    64,
  )
  const validated = await validateCatalogImportPayload(input, options)

  if (validated.normalizedPayloadHash !== expectedHash) {
    throw fieldError(
      'normalizedPayloadHash',
      'VALIDATION_FAILED',
      'Normalized payload hash does not match the validated import record',
    )
  }

  return validated
}

export function buildCatalogImportRowsV2(
  rows: readonly NormalizedCatalogRowCandidate[],
): NormalizedCatalogImportRowV2[] {
  return rows.map((row, index) => {
    const categoryId = row.categoryId
    const isNewIdentity = row.identityOutcome === 'candidate_add'

    if (!categoryId || !UUID_PATTERN.test(categoryId)) {
      throw fieldError(
        `rows.${index}.categoryId`,
        'CATALOG_AUTHORITY_NOT_FOUND',
        'หมวดงานต้องมาจากชุดข้อมูลที่อนุมัติของเวอร์ชันนี้',
      )
    }

    if (
      (isNewIdentity || row.identityOutcome === 'recode')
      && (!row.codeGroupId || !UUID_PATTERN.test(row.codeGroupId))
    ) {
      throw fieldError(
        `rows.${index}.codeGroupId`,
        'CATALOG_AUTHORITY_NOT_FOUND',
        'กลุ่มรหัสต้องมาจากชุดข้อมูลที่อนุมัติของเวอร์ชันนี้',
      )
    }

    return {
      sourceRow: row.sourceRow,
      sourceReference: row.sourceReference,
      sourceItemCode: row.sourceItemCode ?? row.canonicalCode,
      legacyItemCode: row.legacyItemCode,
      targetIdentityId: isNewIdentity ? null : row.targetIdentityId ?? null,
      targetItemCode: isNewIdentity ? null : row.canonicalCode,
      workContextCode: row.workContextCode,
      workContextNameTh: row.workContextNameTh,
      itemTypeCode: row.itemTypeCode,
      itemTypeNameTh: row.itemTypeNameTh,
      itemName: row.itemName,
      unit: row.unit,
      materialCost: row.materialCost,
      laborCost: row.laborCost,
      unitCost: row.unitCost,
      categoryId,
      categoryCode: row.categoryCode,
      codeGroupId: row.codeGroupId ?? null,
      identityOutcome: row.identityOutcome,
      priceAuthorityReference: row.priceAuthorityReference,
    }
  })
}

export async function validateCatalogImportPayloadV1(
  input: unknown,
  options: CatalogImportPayloadValidationOptions = {},
): Promise<ValidatedCatalogImportPayloadV1> {
  const maxPayloadBytes = options.maxPayloadBytes ?? CATALOG_IMPORT_NORMALIZED_PAYLOAD_LIMIT_BYTES
  const maxRows = options.maxRows ?? CATALOG_IMPORT_ROW_LIMIT
  const declaredPayloadBytes = getJsonByteLength(input)

  if (declaredPayloadBytes > maxPayloadBytes) {
    throw validationError('IMPORT_PAYLOAD_TOO_LARGE', 'ข้อมูลที่เตรียมส่งมีขนาดเกินเพดาน', [{
      code: 'IMPORT_PAYLOAD_TOO_LARGE',
      message: 'ข้อมูลที่เตรียมส่งมีขนาดเกินเพดาน',
    }])
  }

  const rawPayload = requirePlainObject(input, 'payload')
  assertExactKeys(rawPayload, TOP_LEVEL_KEYS, 'payload')

  const rowsValue = rawPayload.rows

  if (!Array.isArray(rowsValue)) {
    throw fieldError('rows', 'VALIDATION_FAILED', 'rows ต้องเป็นชุดรายการ')
  }

  if (rowsValue.length === 0) {
    throw fieldError('rows', 'VALIDATION_FAILED', 'ต้องมีข้อมูลที่จัดรูปแบบแล้วอย่างน้อยหนึ่งรายการ')
  }

  if (rowsValue.length > maxRows) {
    throw validationError('IMPORT_ROW_LIMIT_EXCEEDED', 'จำนวนรายการเกินเพดานที่รองรับ', [{
      field: 'rows',
      code: 'IMPORT_ROW_LIMIT_EXCEEDED',
      message: 'จำนวนรายการเกินเพดานที่รองรับ',
    }])
  }

  const payload: CatalogImportPayloadV1 = {
    schemaVersion: readLiteral(
      rawPayload.schemaVersion,
      CATALOG_IMPORT_PAYLOAD_SCHEMA_VERSION,
      'schemaVersion',
    ),
    parserProfileId: readLiteral(
      rawPayload.parserProfileId,
      CATALOG_IMPORT_PAYLOAD_PROFILE_ID,
      'parserProfileId',
    ),
    parserProfileVersion: readLiteral(
      rawPayload.parserProfileVersion,
      CATALOG_IMPORT_PAYLOAD_PROFILE_VERSION,
      'parserProfileVersion',
    ),
    mode: readMode(rawPayload.mode),
    versionId: readPatternText(rawPayload.versionId, 'versionId', UUID_PATTERN, 64),
    expectedLockVersion: readNonnegativeInteger(
      rawPayload.expectedLockVersion,
      'expectedLockVersion',
    ),
    requestId: readPatternText(rawPayload.requestId, 'requestId', UUID_PATTERN, 64),
    reason: readText(rawPayload.reason, 'reason', 500),
    source: normalizeSource(rawPayload.source),
    retirementApprovalReference: readOptionalText(
      rawPayload.retirementApprovalReference,
      'retirementApprovalReference',
      255,
    ),
    retirementConfirmedCount: readOptionalNonnegativeInteger(
      rawPayload.retirementConfirmedCount,
      'retirementConfirmedCount',
    ),
    rows: rowsValue.map((row, index) => normalizeRow(row, index)),
  }

  assertUniqueCanonicalCodes(payload.rows)

  const normalizedPayloadJson = canonicalizeCatalogImportPayloadV1(payload)
  const normalizedPayloadBytes = UTF8_ENCODER.encode(normalizedPayloadJson).byteLength

  if (normalizedPayloadBytes > maxPayloadBytes) {
    throw validationError('IMPORT_PAYLOAD_TOO_LARGE', 'ข้อมูลที่เตรียมส่งมีขนาดเกินเพดาน', [{
      code: 'IMPORT_PAYLOAD_TOO_LARGE',
      message: 'ข้อมูลที่เตรียมส่งมีขนาดเกินเพดาน',
    }])
  }

  return {
    payload,
    normalizedPayloadJson,
    normalizedPayloadHash: await hashCatalogImportPayloadV1(payload),
  }
}

export async function validateCatalogImportPayloadV2(
  input: unknown,
  options: CatalogImportPayloadValidationOptions = {},
): Promise<ValidatedCatalogImportPayloadV2> {
  const maxPayloadBytes = options.maxPayloadBytes ?? CATALOG_IMPORT_NORMALIZED_PAYLOAD_LIMIT_BYTES
  const maxRows = options.maxRows ?? CATALOG_IMPORT_ROW_LIMIT

  if (getJsonByteLength(input) > maxPayloadBytes) {
    throw validationError('IMPORT_PAYLOAD_TOO_LARGE', 'ข้อมูลที่เตรียมส่งมีขนาดเกินเพดาน', [{
      code: 'IMPORT_PAYLOAD_TOO_LARGE',
      message: 'ข้อมูลที่เตรียมส่งมีขนาดเกินเพดาน',
    }])
  }

  const rawPayload = requirePlainObject(input, 'payload')
  assertExactKeys(rawPayload, TOP_LEVEL_KEYS_V2, 'payload')

  if (!Array.isArray(rawPayload.rows) || rawPayload.rows.length === 0) {
    throw fieldError('rows', 'VALIDATION_FAILED', 'ต้องมีข้อมูลที่จัดรูปแบบแล้วอย่างน้อยหนึ่งรายการ')
  }

  if (rawPayload.rows.length > maxRows) {
    throw validationError('IMPORT_ROW_LIMIT_EXCEEDED', 'จำนวนรายการเกินเพดานที่รองรับ', [{
      field: 'rows',
      code: 'IMPORT_ROW_LIMIT_EXCEEDED',
      message: 'จำนวนรายการเกินเพดานที่รองรับ',
    }])
  }

  const payload: CatalogImportPayloadV2 = {
    schemaVersion: readLiteral(
      rawPayload.schemaVersion,
      CATALOG_IMPORT_PAYLOAD_SCHEMA_VERSION_V2,
      'schemaVersion',
    ),
    parserProfileId: readLiteral(
      rawPayload.parserProfileId,
      CATALOG_IMPORT_PAYLOAD_PROFILE_ID,
      'parserProfileId',
    ),
    parserProfileVersion: readLiteral(
      rawPayload.parserProfileVersion,
      CATALOG_IMPORT_PAYLOAD_PROFILE_VERSION,
      'parserProfileVersion',
    ),
    mode: readMode(rawPayload.mode),
    versionId: readPatternText(rawPayload.versionId, 'versionId', UUID_PATTERN, 64),
    expectedLockVersion: readNonnegativeInteger(
      rawPayload.expectedLockVersion,
      'expectedLockVersion',
    ),
    requestId: readPatternText(rawPayload.requestId, 'requestId', UUID_PATTERN, 64),
    reason: readText(rawPayload.reason, 'reason', 500),
    source: normalizeSource(rawPayload.source),
    priceAuthorityReference: readOptionalText(
      rawPayload.priceAuthorityReference,
      'priceAuthorityReference',
      500,
    ),
    retirementApprovalReference: readOptionalText(
      rawPayload.retirementApprovalReference,
      'retirementApprovalReference',
      500,
    ),
    retirementConfirmedCount: readOptionalNonnegativeInteger(
      rawPayload.retirementConfirmedCount,
      'retirementConfirmedCount',
    ),
    rows: rawPayload.rows.map((row, index) => normalizeRowV2(row, index)),
  }

  assertUniqueV2Rows(payload.rows)

  const normalizedPayloadJson = canonicalizeCatalogImportPayloadV2(payload)

  if (UTF8_ENCODER.encode(normalizedPayloadJson).byteLength > maxPayloadBytes) {
    throw validationError('IMPORT_PAYLOAD_TOO_LARGE', 'ข้อมูลที่เตรียมส่งมีขนาดเกินเพดาน', [{
      code: 'IMPORT_PAYLOAD_TOO_LARGE',
      message: 'ข้อมูลที่เตรียมส่งมีขนาดเกินเพดาน',
    }])
  }

  return {
    payload,
    normalizedPayloadJson,
    normalizedPayloadHash: await hashCatalogImportPayloadV2(payload),
  }
}

export async function validateCatalogImportPayloadHashV1(
  input: unknown,
  expectedNormalizedPayloadHash: string,
  options: CatalogImportPayloadValidationOptions = {},
): Promise<ValidatedCatalogImportPayloadV1> {
  const expectedHash = readPatternText(
    expectedNormalizedPayloadHash,
    'normalizedPayloadHash',
    BARE_SHA256_PATTERN,
    64,
  )
  const validated = await validateCatalogImportPayloadV1(input, options)

  if (validated.normalizedPayloadHash !== expectedHash) {
    throw fieldError(
      'normalizedPayloadHash',
      'VALIDATION_FAILED',
      'Normalized payload hash does not match the validated import record',
    )
  }

  return validated
}

export function canonicalizeCatalogImportPayloadV1(
  payload: CatalogImportPayloadV1,
): string {
  return `${JSON.stringify({
    schemaVersion: payload.schemaVersion,
    parserProfileId: payload.parserProfileId,
    parserProfileVersion: payload.parserProfileVersion,
    mode: payload.mode,
    versionId: payload.versionId,
    expectedLockVersion: payload.expectedLockVersion,
    requestId: payload.requestId,
    reason: payload.reason,
    source: {
      filename: payload.source.filename,
      sizeBytes: payload.source.sizeBytes,
      sha256: payload.source.sha256,
      physicalArchiveReference: payload.source.physicalArchiveReference,
    },
    retirementApprovalReference: payload.retirementApprovalReference,
    retirementConfirmedCount: payload.retirementConfirmedCount,
    rows: payload.rows.map((row) => ({
      sourceRow: row.sourceRow,
      sourceReference: row.sourceReference,
      legacyItemCode: row.legacyItemCode,
      canonicalCode: row.canonicalCode,
      workContextCode: row.workContextCode,
      workContextNameTh: row.workContextNameTh,
      itemTypeCode: row.itemTypeCode,
      itemTypeNameTh: row.itemTypeNameTh,
      itemName: row.itemName,
      unit: row.unit,
      materialCost: row.materialCost,
      laborCost: row.laborCost,
      unitCost: row.unitCost,
      categoryCode: row.categoryCode,
      identityOutcome: row.identityOutcome,
      priceAuthorityReference: row.priceAuthorityReference,
    })),
  })}\n`
}

export async function hashCatalogImportPayloadV1(
  payload: CatalogImportPayloadV1,
): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    UTF8_ENCODER.encode(canonicalizeCatalogImportPayloadV1(payload)),
  )

  return bytesToHex(new Uint8Array(digest))
}

export function canonicalizeCatalogImportPayloadV2(
  payload: CatalogImportPayloadV2,
): string {
  return `${JSON.stringify({
    schemaVersion: payload.schemaVersion,
    parserProfileId: payload.parserProfileId,
    parserProfileVersion: payload.parserProfileVersion,
    mode: payload.mode,
    versionId: payload.versionId,
    expectedLockVersion: payload.expectedLockVersion,
    requestId: payload.requestId,
    reason: payload.reason,
    source: {
      filename: payload.source.filename,
      sizeBytes: payload.source.sizeBytes,
      sha256: payload.source.sha256,
      physicalArchiveReference: payload.source.physicalArchiveReference,
    },
    priceAuthorityReference: payload.priceAuthorityReference,
    retirementApprovalReference: payload.retirementApprovalReference,
    retirementConfirmedCount: payload.retirementConfirmedCount,
    rows: payload.rows.map((row) => ({
      sourceRow: row.sourceRow,
      sourceReference: row.sourceReference,
      sourceItemCode: row.sourceItemCode,
      legacyItemCode: row.legacyItemCode,
      targetIdentityId: row.targetIdentityId,
      targetItemCode: row.targetItemCode,
      workContextCode: row.workContextCode,
      workContextNameTh: row.workContextNameTh,
      itemTypeCode: row.itemTypeCode,
      itemTypeNameTh: row.itemTypeNameTh,
      itemName: row.itemName,
      unit: row.unit,
      materialCost: row.materialCost,
      laborCost: row.laborCost,
      unitCost: row.unitCost,
      categoryId: row.categoryId,
      categoryCode: row.categoryCode,
      codeGroupId: row.codeGroupId,
      identityOutcome: row.identityOutcome,
      priceAuthorityReference: row.priceAuthorityReference,
    })),
  })}\n`
}

export async function hashCatalogImportPayloadV2(
  payload: CatalogImportPayloadV2,
): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    UTF8_ENCODER.encode(canonicalizeCatalogImportPayloadV2(payload)),
  )

  return bytesToHex(new Uint8Array(digest))
}

function normalizeSource(value: unknown): CatalogImportPayloadV1['source'] {
  const source = requirePlainObject(value, 'source')
  assertExactKeys(source, SOURCE_KEYS, 'source')

  const sizeBytes = readPositiveInteger(source.sizeBytes, 'source.sizeBytes')

  if (sizeBytes > CATALOG_IMPORT_RAW_FILE_LIMIT_BYTES) {
    throw fieldError(
      'source.sizeBytes',
      'IMPORT_FILE_TOO_LARGE',
      'ขนาดไฟล์ Excel เกินเพดานที่รูปแบบนำเข้ารองรับ',
    )
  }

  return {
    filename: readText(source.filename, 'source.filename', 255),
    sizeBytes,
    sha256: readPatternText(source.sha256, 'source.sha256', BARE_SHA256_PATTERN, 64),
    physicalArchiveReference: readText(
      source.physicalArchiveReference,
      'source.physicalArchiveReference',
      255,
    ),
  }
}

function normalizeRow(value: unknown, index: number): NormalizedCatalogRowCandidate {
  const row = requirePlainObject(value, `rows.${index}`)
  assertExactKeys(row, ROW_KEYS, `rows.${index}`)

  const materialCost = readMoney(row.materialCost, `rows.${index}.materialCost`)
  const laborCost = readMoney(row.laborCost, `rows.${index}.laborCost`)
  const unitCost = readMoney(row.unitCost, `rows.${index}.unitCost`)

  assertMoneySum(materialCost, laborCost, unitCost, `rows.${index}.unitCost`)

  return {
    sourceRow: readPositiveInteger(row.sourceRow, `rows.${index}.sourceRow`),
    sourceReference: readText(row.sourceReference, `rows.${index}.sourceReference`, 200),
    legacyItemCode: readOptionalText(row.legacyItemCode, `rows.${index}.legacyItemCode`, 64),
    canonicalCode: readPatternText(
      row.canonicalCode,
      `rows.${index}.canonicalCode`,
      CANDIDATE_CODE_PATTERN,
      64,
    ),
    workContextCode: readPatternText(
      row.workContextCode,
      `rows.${index}.workContextCode`,
      CODE_GROUP_PATTERN,
      16,
    ),
    workContextNameTh: readText(
      row.workContextNameTh,
      `rows.${index}.workContextNameTh`,
      200,
    ),
    itemTypeCode: readPatternText(
      row.itemTypeCode,
      `rows.${index}.itemTypeCode`,
      CODE_GROUP_PATTERN,
      16,
    ),
    itemTypeNameTh: readText(
      row.itemTypeNameTh,
      `rows.${index}.itemTypeNameTh`,
      200,
    ),
    itemName: readText(row.itemName, `rows.${index}.itemName`, 500),
    unit: readText(row.unit, `rows.${index}.unit`, 64),
    materialCost,
    laborCost,
    unitCost,
    categoryCode: readText(row.categoryCode, `rows.${index}.categoryCode`, 64),
    identityOutcome: readIdentityOutcome(row.identityOutcome, `rows.${index}.identityOutcome`),
    priceAuthorityReference: readOptionalText(
      row.priceAuthorityReference,
      `rows.${index}.priceAuthorityReference`,
      255,
    ),
  }
}

function normalizeRowV2(value: unknown, index: number): NormalizedCatalogImportRowV2 {
  const path = `rows.${index}`
  const row = requirePlainObject(value, path)
  assertExactKeys(row, ROW_KEYS_V2, path)

  const materialCost = readMoney(row.materialCost, `${path}.materialCost`)
  const laborCost = readMoney(row.laborCost, `${path}.laborCost`)
  const unitCost = readMoney(row.unitCost, `${path}.unitCost`)
  const identityOutcome = readIdentityOutcome(row.identityOutcome, `${path}.identityOutcome`)
  const sourceItemCode = readText(row.sourceItemCode, `${path}.sourceItemCode`, 64)
  const targetIdentityId = readOptionalPatternText(
    row.targetIdentityId,
    `${path}.targetIdentityId`,
    UUID_PATTERN,
    64,
  )
  const targetItemCode = readOptionalCatalogCode(
    row.targetItemCode,
    `${path}.targetItemCode`,
  )
  const codeGroupId = readOptionalPatternText(
    row.codeGroupId,
    `${path}.codeGroupId`,
    UUID_PATTERN,
    64,
  )

  if (!CANDIDATE_CODE_PATTERN.test(sourceItemCode) && !LEGACY_CODE_PATTERN.test(sourceItemCode)) {
    throw fieldError(
      `${path}.sourceItemCode`,
      'VALIDATION_FAILED',
      'รหัสรายการต้นทางไม่อยู่ในรูปแบบที่รองรับ',
    )
  }

  if (identityOutcome === 'candidate_add') {
    if (targetIdentityId !== null || targetItemCode !== null) {
      throw fieldError(
        `${path}.targetIdentityId`,
        'CATALOG_CODE_SERVER_ALLOCATION_REQUIRED',
        'รายการใหม่ห้ามระบุตัวตนรายการหรือรหัสเป้าหมายเอง',
      )
    }

    if (codeGroupId === null) {
      throw fieldError(
        `${path}.codeGroupId`,
        'CATALOG_AUTHORITY_NOT_FOUND',
        'รายการใหม่ต้องเลือกกลุ่มรหัสที่อนุมัติไว้',
      )
    }
  } else if (targetIdentityId === null || targetItemCode === null) {
    throw fieldError(
      `${path}.targetIdentityId`,
      'IMPORT_RECONCILIATION_REQUIRED',
      'รายการเดิมต้องระบุตัวตนรายการและรหัสเป้าหมายให้ตรงกัน',
    )
  }

  if (identityOutcome === 'recode' && codeGroupId === null) {
    throw fieldError(
      `${path}.codeGroupId`,
      'CATALOG_AUTHORITY_NOT_FOUND',
      'การเปลี่ยนรหัสต้องเลือกกลุ่มรหัสที่อนุมัติไว้',
    )
  }

  assertMoneySum(materialCost, laborCost, unitCost, `${path}.unitCost`)

  return {
    sourceRow: readPositiveInteger(row.sourceRow, `${path}.sourceRow`),
    sourceReference: readText(row.sourceReference, `${path}.sourceReference`, 200),
    sourceItemCode,
    legacyItemCode: readOptionalText(row.legacyItemCode, `${path}.legacyItemCode`, 64),
    targetIdentityId,
    targetItemCode,
    workContextCode: readPatternText(
      row.workContextCode,
      `${path}.workContextCode`,
      CODE_GROUP_PATTERN,
      16,
    ),
    workContextNameTh: readText(row.workContextNameTh, `${path}.workContextNameTh`, 200),
    itemTypeCode: readPatternText(
      row.itemTypeCode,
      `${path}.itemTypeCode`,
      CODE_GROUP_PATTERN,
      16,
    ),
    itemTypeNameTh: readText(row.itemTypeNameTh, `${path}.itemTypeNameTh`, 200),
    itemName: readText(row.itemName, `${path}.itemName`, 500),
    unit: readText(row.unit, `${path}.unit`, 64),
    materialCost,
    laborCost,
    unitCost,
    categoryId: readPatternText(row.categoryId, `${path}.categoryId`, UUID_PATTERN, 64),
    categoryCode: readText(row.categoryCode, `${path}.categoryCode`, 64),
    codeGroupId,
    identityOutcome,
    priceAuthorityReference: readOptionalText(
      row.priceAuthorityReference,
      `${path}.priceAuthorityReference`,
      500,
    ),
  }
}

function readMode(value: unknown): CatalogImportPayloadV1['mode'] {
  if (value === 'full' || value === 'supplement') {
    return value
  }

  throw fieldError('mode', 'VALIDATION_FAILED', 'รูปแบบการนำเข้าไม่อยู่ในชุดที่ระบบรองรับ')
}

function readIdentityOutcome(
  value: unknown,
  field: string,
): CatalogImportIdentityOutcome {
  if (typeof value === 'string' && IDENTITY_OUTCOMES.includes(value as CatalogImportIdentityOutcome)) {
    return value as CatalogImportIdentityOutcome
  }

  throw fieldError(field, 'VALIDATION_FAILED', 'ผลการจับคู่ตัวตนรายการไม่อยู่ในชุดที่ระบบรองรับ')
}

function readLiteral<T extends string>(value: unknown, literal: T, field: string): T {
  if (value === literal) {
    return literal
  }

  throw fieldError(field, 'VALIDATION_FAILED', `${field} ต้องตรงกับค่าที่อนุมัติ`)
}

function readPatternText(
  value: unknown,
  field: string,
  pattern: RegExp,
  maxLength: number,
): string {
  const text = readText(value, field, maxLength)

  if (!pattern.test(text)) {
    throw fieldError(field, 'VALIDATION_FAILED', `${field} ไม่ตรงรูปแบบที่อนุมัติ`)
  }

  return text
}

function readOptionalPatternText(
  value: unknown,
  field: string,
  pattern: RegExp,
  maxLength: number,
): string | null {
  const text = readOptionalText(value, field, maxLength)

  if (text !== null && !pattern.test(text)) {
    throw fieldError(field, 'VALIDATION_FAILED', `${field} ไม่ตรงรูปแบบที่อนุมัติ`)
  }

  return text
}

function readOptionalCatalogCode(value: unknown, field: string): string | null {
  const text = readOptionalText(value, field, 64)

  if (
    text !== null
    && !CANDIDATE_CODE_PATTERN.test(text)
    && !LEGACY_CODE_PATTERN.test(text)
  ) {
    throw fieldError(field, 'VALIDATION_FAILED', `${field} ไม่อยู่ในรูปแบบที่รองรับ`)
  }

  return text
}

function readMoney(value: unknown, field: string): string {
  const money = readText(value, field, 32)

  if (!MONEY_PATTERN.test(money)) {
    throw fieldError(field, 'VALIDATION_FAILED', 'จำนวนเงินต้องมีทศนิยมสองตำแหน่ง')
  }

  return money
}

function readText(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== 'string') {
    throw fieldError(field, 'VALIDATION_FAILED', `${field} ต้องเป็นข้อความ`)
  }

  const normalized = value.trim().normalize('NFC')

  if (normalized.length === 0) {
    throw fieldError(field, 'VALIDATION_FAILED', `${field} ต้องไม่ว่าง`)
  }

  if (normalized.length > maxLength) {
    throw fieldError(field, 'VALIDATION_FAILED', `${field} ยาวเกินเพดานที่รองรับ`)
  }

  if (CONTROL_CHARACTER_PATTERN.test(normalized)) {
    throw fieldError(field, 'VALIDATION_FAILED', `${field} มีอักขระควบคุมที่ไม่อนุญาต`)
  }

  return normalized
}

function readOptionalText(
  value: unknown,
  field: string,
  maxLength: number,
): string | null {
  if (value === null) {
    return null
  }

  return readText(value, field, maxLength)
}

function readNonnegativeInteger(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    throw fieldError(field, 'VALIDATION_FAILED', `${field} ต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป`)
  }

  return value
}

function readPositiveInteger(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    throw fieldError(field, 'VALIDATION_FAILED', `${field} ต้องเป็นจำนวนเต็มบวก`)
  }

  return value
}

function readOptionalNonnegativeInteger(value: unknown, field: string): number | null {
  if (value === null) {
    return null
  }

  return readNonnegativeInteger(value, field)
}

function assertExactKeys(
  value: JsonObject,
  expectedKeys: readonly string[],
  path: string,
): void {
  const allowed = new Set(expectedKeys)
  const seen = new Set(Object.keys(value))
  const unexpected = [...seen].filter((key) => !allowed.has(key))
  const missing = expectedKeys.filter((key) => !seen.has(key))

  if (unexpected.length > 0 || missing.length > 0) {
    throw validationError('VALIDATION_FAILED', 'โครงสร้างข้อมูลนำเข้าไม่ถูกต้อง', [
      ...unexpected.map((key) => ({
        field: `${path}.${key}`,
        code: 'VALIDATION_FAILED',
        message: 'พบช่องข้อมูลที่ระบบไม่อนุญาต',
      })),
      ...missing.map((key) => ({
        field: `${path}.${key}`,
        code: 'VALIDATION_FAILED',
        message: 'ขาดช่องข้อมูลที่จำเป็น',
      })),
    ])
  }
}

function assertUniqueCanonicalCodes(rows: readonly NormalizedCatalogRowCandidate[]): void {
  const seen = new Set<string>()

  for (const row of rows) {
    if (seen.has(row.canonicalCode)) {
      throw fieldError(
        'rows.canonicalCode',
        'VALIDATION_FAILED',
        'ห้ามมีรหัสมาตรฐานซ้ำ',
      )
    }

    seen.add(row.canonicalCode)
  }
}

function assertUniqueV2Rows(rows: readonly NormalizedCatalogImportRowV2[]): void {
  const sourceCodes = new Set<string>()
  const targetIdentityIds = new Set<string>()
  const targetItemCodes = new Set<string>()

  for (const row of rows) {
    if (sourceCodes.has(row.sourceItemCode)) {
      throw fieldError('rows.sourceItemCode', 'VALIDATION_FAILED', 'ห้ามมีรหัสต้นทางซ้ำ')
    }
    sourceCodes.add(row.sourceItemCode)

    if (row.targetIdentityId) {
      if (targetIdentityIds.has(row.targetIdentityId)) {
        throw fieldError(
          'rows.targetIdentityId',
          'IMPORT_RECONCILIATION_REQUIRED',
          'ห้ามอ้างตัวตนรายการเป้าหมายซ้ำ',
        )
      }
      targetIdentityIds.add(row.targetIdentityId)
    }

    if (row.targetItemCode) {
      if (targetItemCodes.has(row.targetItemCode)) {
        throw fieldError(
          'rows.targetItemCode',
          'IMPORT_RECONCILIATION_REQUIRED',
          'ห้ามมีรหัสรายการเป้าหมายซ้ำ',
        )
      }
      targetItemCodes.add(row.targetItemCode)
    }
  }
}

function assertMoneySum(
  materialCost: string,
  laborCost: string,
  unitCost: string,
  field: string,
): void {
  if (moneyToCents(materialCost) + moneyToCents(laborCost) !== moneyToCents(unitCost)) {
    throw fieldError(field, 'VALIDATION_FAILED', 'ค่าวัสดุรวมกับค่าแรงต้องเท่ากับราคารวมต่อหน่วย')
  }
}

function moneyToCents(value: string): bigint {
  const [whole, cents] = value.split('.')
  return BigInt(whole) * BigInt(100) + BigInt(cents)
}

function requirePlainObject(value: unknown, field: string): JsonObject {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    throw fieldError(field, 'VALIDATION_FAILED', `${field} ต้องเป็น JSON object`)
  }

  return value as JsonObject
}

function getJsonByteLength(value: unknown): number {
  try {
    return UTF8_ENCODER.encode(JSON.stringify(value)).byteLength
  } catch {
    throw validationError('VALIDATION_FAILED', 'ข้อมูลนำเข้าต้องแปลงเป็น JSON ได้', [{
      code: 'VALIDATION_FAILED',
      message: 'ข้อมูลนำเข้าต้องแปลงเป็น JSON ได้',
    }])
  }
}

function fieldError(
  field: string,
  code: CatalogErrorCode,
  message: string,
): CatalogImportPayloadValidationError {
  return validationError(code, message, [{ field, code, message }])
}

function validationError(
  code: CatalogErrorCode,
  message: string,
  diagnostics: ParserDiagnostic[],
): CatalogImportPayloadValidationError {
  return new CatalogImportPayloadValidationError(code, message, diagnostics)
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}
