const UTF8_ENCODER = new TextEncoder()

const MONEY_PATTERN = /^(0|[1-9][0-9]*)\.[0-9]{2}$/

export const CANONICAL_CATALOG_DATASET_ROW_KEYS = [
  'identity_id',
  'item_code',
  'item_name',
  'unit',
  'material_cost',
  'labor_cost',
  'unit_cost',
  'category_code',
  'category_name',
  'work_context_code',
  'work_context_name_th',
  'item_type_code',
  'item_type_name_th',
  'is_active',
  'display_order',
] as const

export type CanonicalCatalogDatasetRowKey =
  (typeof CANONICAL_CATALOG_DATASET_ROW_KEYS)[number]

export interface CanonicalCatalogDatasetRow {
  identity_id: string
  item_code: string
  item_name: string
  unit: string
  material_cost: string
  labor_cost: string
  unit_cost: string
  category_code: string | null
  category_name: string | null
  work_context_code: string | null
  work_context_name_th: string | null
  item_type_code: string | null
  item_type_name_th: string | null
  is_active: boolean
  display_order: number
}

export class CanonicalCatalogDatasetError extends Error {
  code: string
  field?: CanonicalCatalogDatasetRowKey

  constructor(
    code: string,
    message: string,
    field?: CanonicalCatalogDatasetRowKey,
  ) {
    super(message)
    this.name = 'CanonicalCatalogDatasetError'
    this.code = code
    this.field = field
  }
}

export function canonicalizeCatalogDatasetRows(
  rows: readonly CanonicalCatalogDatasetRow[],
): string {
  const orderedRows = rows.map(buildCanonicalCatalogDatasetRow)
    .sort(compareCanonicalCatalogDatasetRows)

  assertUniqueItemCodes(orderedRows)

  return `${JSON.stringify(orderedRows)}\n`
}

export async function hashCanonicalCatalogDatasetRows(
  rows: readonly CanonicalCatalogDatasetRow[],
): Promise<string> {
  const canonicalJson = canonicalizeCatalogDatasetRows(rows)
  const digest = await crypto.subtle.digest(
    'SHA-256',
    UTF8_ENCODER.encode(canonicalJson),
  )

  return `sha256:${bytesToHex(new Uint8Array(digest))}`
}

export function buildCanonicalCatalogDatasetRow(
  row: CanonicalCatalogDatasetRow,
): CanonicalCatalogDatasetRow {
  return {
    identity_id: normalizeRequiredText(row.identity_id, 'identity_id'),
    item_code: normalizeRequiredText(row.item_code, 'item_code'),
    item_name: normalizeRequiredText(row.item_name, 'item_name'),
    unit: normalizeRequiredText(row.unit, 'unit'),
    material_cost: normalizeMoney(row.material_cost, 'material_cost'),
    labor_cost: normalizeMoney(row.labor_cost, 'labor_cost'),
    unit_cost: normalizeMoney(row.unit_cost, 'unit_cost'),
    category_code: normalizeOptionalText(row.category_code, 'category_code'),
    category_name: normalizeOptionalText(row.category_name, 'category_name'),
    work_context_code: normalizeOptionalText(row.work_context_code, 'work_context_code'),
    work_context_name_th: normalizeOptionalText(
      row.work_context_name_th,
      'work_context_name_th',
    ),
    item_type_code: normalizeOptionalText(row.item_type_code, 'item_type_code'),
    item_type_name_th: normalizeOptionalText(row.item_type_name_th, 'item_type_name_th'),
    is_active: normalizeBoolean(row.is_active, 'is_active'),
    display_order: normalizeDisplayOrder(row.display_order, 'display_order'),
  }
}

function compareCanonicalCatalogDatasetRows(
  left: CanonicalCatalogDatasetRow,
  right: CanonicalCatalogDatasetRow,
): number {
  const itemCodeComparison = compareUtf8(left.item_code, right.item_code)

  if (itemCodeComparison !== 0) {
    return itemCodeComparison
  }

  return compareUtf8(left.identity_id, right.identity_id)
}

function assertUniqueItemCodes(rows: readonly CanonicalCatalogDatasetRow[]): void {
  const seen = new Set<string>()

  for (const row of rows) {
    if (seen.has(row.item_code)) {
      throw new CanonicalCatalogDatasetError(
        'CANONICAL_DUPLICATE_ITEM_CODE',
        'Duplicate item_code is not allowed in one canonical dataset',
        'item_code',
      )
    }

    seen.add(row.item_code)
  }
}

function compareUtf8(left: string, right: string): number {
  const leftBytes = UTF8_ENCODER.encode(left)
  const rightBytes = UTF8_ENCODER.encode(right)
  const length = Math.min(leftBytes.length, rightBytes.length)

  for (let index = 0; index < length; index += 1) {
    const byteDifference = leftBytes[index] - rightBytes[index]

    if (byteDifference !== 0) {
      return byteDifference
    }
  }

  return leftBytes.length - rightBytes.length
}

function normalizeRequiredText(
  value: unknown,
  field: CanonicalCatalogDatasetRowKey,
): string {
  if (typeof value !== 'string') {
    throw new CanonicalCatalogDatasetError(
      'CANONICAL_INVALID_STRING',
      `${field} must be a string`,
      field,
    )
  }

  const normalized = value.normalize('NFC')

  if (normalized.length === 0) {
    throw new CanonicalCatalogDatasetError(
      'CANONICAL_REQUIRED_STRING_EMPTY',
      `${field} must not be empty`,
      field,
    )
  }

  return normalized
}

function normalizeOptionalText(
  value: unknown,
  field: CanonicalCatalogDatasetRowKey,
): string | null {
  if (value === null || typeof value === 'undefined') {
    return null
  }

  if (typeof value !== 'string') {
    throw new CanonicalCatalogDatasetError(
      'CANONICAL_INVALID_OPTIONAL_STRING',
      `${field} must be a string or null`,
      field,
    )
  }

  return value.normalize('NFC')
}

function normalizeMoney(
  value: unknown,
  field: CanonicalCatalogDatasetRowKey,
): string {
  const normalized = normalizeRequiredText(value, field)

  if (!MONEY_PATTERN.test(normalized)) {
    throw new CanonicalCatalogDatasetError(
      'CANONICAL_INVALID_MONEY',
      `${field} must be a two-decimal string`,
      field,
    )
  }

  return normalized
}

function normalizeBoolean(
  value: unknown,
  field: CanonicalCatalogDatasetRowKey,
): boolean {
  if (typeof value !== 'boolean') {
    throw new CanonicalCatalogDatasetError(
      'CANONICAL_INVALID_BOOLEAN',
      `${field} must be a boolean`,
      field,
    )
  }

  return value
}

function normalizeDisplayOrder(
  value: unknown,
  field: CanonicalCatalogDatasetRowKey,
): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    throw new CanonicalCatalogDatasetError(
      'CANONICAL_INVALID_DISPLAY_ORDER',
      `${field} must be a nonnegative integer`,
      field,
    )
  }

  return value
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}
