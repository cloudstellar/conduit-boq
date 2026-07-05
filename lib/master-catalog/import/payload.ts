import type {
  CatalogErrorCode,
  CatalogImportIdentityOutcome,
  CatalogImportPayloadV1,
  NormalizedCatalogRowCandidate,
  ParserDiagnostic,
} from './types'

const UTF8_ENCODER = new TextEncoder()

export const CATALOG_IMPORT_PAYLOAD_SCHEMA_VERSION = 'catalog-import-payload/1'
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
  'itemTypeCode',
  'itemName',
  'unit',
  'materialCost',
  'laborCost',
  'unitCost',
  'categoryCode',
  'identityOutcome',
  'priceAuthorityReference',
] as const

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const BARE_SHA256_PATTERN = /^[0-9a-f]{64}$/
const MONEY_PATTERN = /^(0|[1-9][0-9]*)\.[0-9]{2}$/
const CANDIDATE_CODE_PATTERN = /^[A-Z0-9]{3}-[A-Z0-9]{3}-[0-9]{3}$/
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

export async function validateCatalogImportPayloadV1(
  input: unknown,
  options: CatalogImportPayloadValidationOptions = {},
): Promise<ValidatedCatalogImportPayloadV1> {
  const maxPayloadBytes = options.maxPayloadBytes ?? CATALOG_IMPORT_NORMALIZED_PAYLOAD_LIMIT_BYTES
  const maxRows = options.maxRows ?? CATALOG_IMPORT_ROW_LIMIT
  const declaredPayloadBytes = getJsonByteLength(input)

  if (declaredPayloadBytes > maxPayloadBytes) {
    throw validationError('IMPORT_PAYLOAD_TOO_LARGE', 'Normalized payload exceeds byte limit', [{
      code: 'IMPORT_PAYLOAD_TOO_LARGE',
      message: 'Normalized payload exceeds byte limit',
    }])
  }

  const rawPayload = requirePlainObject(input, 'payload')
  assertExactKeys(rawPayload, TOP_LEVEL_KEYS, 'payload')

  const rowsValue = rawPayload.rows

  if (!Array.isArray(rowsValue)) {
    throw fieldError('rows', 'VALIDATION_FAILED', 'rows must be an array')
  }

  if (rowsValue.length === 0) {
    throw fieldError('rows', 'VALIDATION_FAILED', 'At least one normalized row is required')
  }

  if (rowsValue.length > maxRows) {
    throw validationError('IMPORT_ROW_LIMIT_EXCEEDED', 'Normalized row limit exceeded', [{
      field: 'rows',
      code: 'IMPORT_ROW_LIMIT_EXCEEDED',
      message: 'Normalized row limit exceeded',
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
    throw validationError('IMPORT_PAYLOAD_TOO_LARGE', 'Normalized payload exceeds byte limit', [{
      code: 'IMPORT_PAYLOAD_TOO_LARGE',
      message: 'Normalized payload exceeds byte limit',
    }])
  }

  return {
    payload,
    normalizedPayloadJson,
    normalizedPayloadHash: await hashCatalogImportPayloadV1(payload),
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
      itemTypeCode: row.itemTypeCode,
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

function normalizeSource(value: unknown): CatalogImportPayloadV1['source'] {
  const source = requirePlainObject(value, 'source')
  assertExactKeys(source, SOURCE_KEYS, 'source')

  const sizeBytes = readPositiveInteger(source.sizeBytes, 'source.sizeBytes')

  if (sizeBytes > CATALOG_IMPORT_RAW_FILE_LIMIT_BYTES) {
    throw fieldError(
      'source.sizeBytes',
      'IMPORT_FILE_TOO_LARGE',
      'Raw workbook file size exceeds the profile limit',
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
    itemTypeCode: readPatternText(
      row.itemTypeCode,
      `rows.${index}.itemTypeCode`,
      CODE_GROUP_PATTERN,
      16,
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

function readMode(value: unknown): CatalogImportPayloadV1['mode'] {
  if (value === 'full' || value === 'supplement') {
    return value
  }

  throw fieldError('mode', 'VALIDATION_FAILED', 'Import mode is not recognized')
}

function readIdentityOutcome(
  value: unknown,
  field: string,
): CatalogImportIdentityOutcome {
  if (typeof value === 'string' && IDENTITY_OUTCOMES.includes(value as CatalogImportIdentityOutcome)) {
    return value as CatalogImportIdentityOutcome
  }

  throw fieldError(field, 'VALIDATION_FAILED', 'Identity outcome is not recognized')
}

function readLiteral<T extends string>(value: unknown, literal: T, field: string): T {
  if (value === literal) {
    return literal
  }

  throw fieldError(field, 'VALIDATION_FAILED', `${field} must match the approved value`)
}

function readPatternText(
  value: unknown,
  field: string,
  pattern: RegExp,
  maxLength: number,
): string {
  const text = readText(value, field, maxLength)

  if (!pattern.test(text)) {
    throw fieldError(field, 'VALIDATION_FAILED', `${field} does not match the approved format`)
  }

  return text
}

function readMoney(value: unknown, field: string): string {
  const money = readText(value, field, 32)

  if (!MONEY_PATTERN.test(money)) {
    throw fieldError(field, 'VALIDATION_FAILED', 'Money must be a two-decimal string')
  }

  return money
}

function readText(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== 'string') {
    throw fieldError(field, 'VALIDATION_FAILED', `${field} must be a string`)
  }

  const normalized = value.trim().normalize('NFC')

  if (normalized.length === 0) {
    throw fieldError(field, 'VALIDATION_FAILED', `${field} must not be blank`)
  }

  if (normalized.length > maxLength) {
    throw fieldError(field, 'VALIDATION_FAILED', `${field} exceeds the text limit`)
  }

  if (CONTROL_CHARACTER_PATTERN.test(normalized)) {
    throw fieldError(field, 'VALIDATION_FAILED', `${field} contains control characters`)
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
    throw fieldError(field, 'VALIDATION_FAILED', `${field} must be a nonnegative integer`)
  }

  return value
}

function readPositiveInteger(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    throw fieldError(field, 'VALIDATION_FAILED', `${field} must be a positive integer`)
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
    throw validationError('VALIDATION_FAILED', 'Payload schema validation failed', [
      ...unexpected.map((key) => ({
        field: `${path}.${key}`,
        code: 'VALIDATION_FAILED',
        message: 'Unknown key is not allowed',
      })),
      ...missing.map((key) => ({
        field: `${path}.${key}`,
        code: 'VALIDATION_FAILED',
        message: 'Required key is missing',
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
        'Duplicate canonical code is not allowed',
      )
    }

    seen.add(row.canonicalCode)
  }
}

function assertMoneySum(
  materialCost: string,
  laborCost: string,
  unitCost: string,
  field: string,
): void {
  if (moneyToCents(materialCost) + moneyToCents(laborCost) !== moneyToCents(unitCost)) {
    throw fieldError(field, 'VALIDATION_FAILED', 'Material and labor costs must equal unit cost')
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
    throw fieldError(field, 'VALIDATION_FAILED', `${field} must be a JSON object`)
  }

  return value as JsonObject
}

function getJsonByteLength(value: unknown): number {
  try {
    return UTF8_ENCODER.encode(JSON.stringify(value)).byteLength
  } catch {
    throw validationError('VALIDATION_FAILED', 'Payload must be JSON serializable', [{
      code: 'VALIDATION_FAILED',
      message: 'Payload must be JSON serializable',
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
