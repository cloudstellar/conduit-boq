import type {
  CatalogImportIdentityOutcome,
  CatalogParserProfile,
  CanonicalImportField,
  ParseContext,
  ParserDiagnostic,
  ProfileDetection,
  UnknownWorkbookRow,
  WorkbookCellValue,
  WorkbookInfo,
  WorkbookSheetInfo,
} from '../types'
import { CatalogParserProfileError } from '../types'

const MONEY_PATTERN = /^(0|[1-9][0-9]*)\.[0-9]{2}$/
const CANDIDATE_CODE_PATTERN = /^[A-Z0-9]{3}-[A-Z0-9]{3}-[0-9]{3}$/
const CODE_GROUP_PATTERN = /^[A-Z0-9]{3}$/
const SOURCE_ROW_PATTERN = /^[1-9][0-9]*$/
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/
const MAX_ITEM_NAME_LENGTH = 500

export const NT_ITEM_MASTER_2568_REQUIRED_HEADERS = {
  itemCode: 'item_code',
  workContextCode: 'AAA',
  workContextNameTh: 'AAA_name_th',
  itemTypeCode: 'TTT',
  itemTypeNameTh: 'TTT_name_th',
  itemName: 'description_th',
  unit: 'unit',
  materialCost: 'material_cost',
  laborCost: 'labor_cost',
  unitCost: 'total_cost',
  sourceSheet: 'source_sheet',
  sourceRow: 'source_row',
} as const satisfies Readonly<Record<CanonicalImportField, string>>

export const NT_ITEM_MASTER_2568_IGNORED_HEADERS = [
  'k_formula_id',
  'k_formula_name_th',
  'is_k_exempt',
  'k_mapping_method',
  'k_mapping_basis',
  'k_mapping_note',
] as const

export const NT_ITEM_MASTER_2568_PROFILE: CatalogParserProfile = {
  id: 'nt-item-master-2568',
  version: '1',
  displayName: 'NT Item Master 2568',
  acceptedExtensions: ['.xlsx'],
  requiredSheet: '01_Item_Master_Final',
  headerRow: 1,
  firstDataRow: 2,
  maxRows: 1500,
  requiredHeaders: NT_ITEM_MASTER_2568_REQUIRED_HEADERS,
  optionalHeaders: {},
  ignoredHeaders: NT_ITEM_MASTER_2568_IGNORED_HEADERS,
  detect: detectNtItemMaster2568Profile,
  normalizeRow: normalizeNtItemMaster2568Row,
}

export function detectNtItemMaster2568Profile(
  workbookInfo: WorkbookInfo,
): ProfileDetection {
  const errors: ParserDiagnostic[] = []

  if (!hasAcceptedExtension(workbookInfo.filename)) {
    errors.push({
      field: 'filename',
      code: 'IMPORT_PROFILE_NOT_RECOGNIZED',
      message: 'Workbook must use the approved .xlsx extension',
    })
  }

  const matchingSheets = workbookInfo.sheets.filter(
    (sheet) => sheet.name.trim() === NT_ITEM_MASTER_2568_PROFILE.requiredSheet,
  )

  if (matchingSheets.length === 0) {
    errors.push({
      field: 'sheet',
      code: 'IMPORT_PROFILE_NOT_RECOGNIZED',
      message: 'Required profile sheet is missing',
    })
  }

  if (matchingSheets.length > 1) {
    errors.push({
      field: 'sheet',
      code: 'IMPORT_PROFILE_NOT_RECOGNIZED',
      message: 'Required profile sheet appears more than once',
    })
  }

  const sheet = matchingSheets[0]

  if (sheet) {
    errors.push(...validateSheetHeaders(sheet))
    errors.push(...validateSheetRows(sheet))
  }

  return {
    matched: errors.length === 0,
    confidence: errors.length === 0 ? 'exact' : 'none',
    errors,
  }
}

export function normalizeNtItemMaster2568Row(
  row: UnknownWorkbookRow,
  context: ParseContext,
) {
  const headers = NT_ITEM_MASTER_2568_REQUIRED_HEADERS
  const canonicalCode = readTextCell(row, headers.itemCode, 'item_code', 64)
  const workContextCode = readTextCell(row, headers.workContextCode, 'AAA', 16)
  const workContextNameTh = readTextCell(row, headers.workContextNameTh, 'AAA_name_th', 200)
  const itemTypeCode = readTextCell(row, headers.itemTypeCode, 'TTT', 16)
  const itemTypeNameTh = readTextCell(row, headers.itemTypeNameTh, 'TTT_name_th', 200)
  const sourceSheet = readTextCell(row, headers.sourceSheet, 'source_sheet', 128)
  const sourceRow = readSourceRow(row, headers.sourceRow)
  const materialCost = readMoneyCell(row, headers.materialCost, 'material_cost')
  const laborCost = readMoneyCell(row, headers.laborCost, 'labor_cost')
  const unitCost = readMoneyCell(row, headers.unitCost, 'total_cost')

  assertPattern(canonicalCode, CANDIDATE_CODE_PATTERN, 'item_code')
  assertPattern(workContextCode, CODE_GROUP_PATTERN, 'AAA')
  assertPattern(itemTypeCode, CODE_GROUP_PATTERN, 'TTT')
  assertMoneySum(materialCost, laborCost, unitCost)

  const groupKey = `${workContextCode}-${itemTypeCode}`
  const categoryCode = readContextText(
    context.categoryCodeByGroup?.[groupKey],
    'categoryCode',
    'IMPORT_RECONCILIATION_REQUIRED',
    'Category reconciliation is required for the AAA-TTT group',
  )

  return {
    sourceRow,
    sourceReference: `${sourceSheet}:${sourceRow}`,
    legacyItemCode: readOptionalContextText(
      context.legacyItemCodeByCanonicalCode?.[canonicalCode],
      'legacyItemCode',
    ),
    canonicalCode,
    workContextCode,
    workContextNameTh,
    itemTypeCode,
    itemTypeNameTh,
    itemName: readTextCell(row, headers.itemName, 'description_th', MAX_ITEM_NAME_LENGTH),
    unit: readTextCell(row, headers.unit, 'unit', 64),
    materialCost,
    laborCost,
    unitCost,
    categoryCode,
    identityOutcome: readIdentityOutcome(
      context.identityOutcomeByCanonicalCode?.[canonicalCode],
    ),
    priceAuthorityReference: readOptionalContextText(
      context.priceAuthorityReferenceByCanonicalCode?.[canonicalCode],
      'priceAuthorityReference',
    ),
  }
}

function hasAcceptedExtension(filename: string): boolean {
  return filename.trim().toLowerCase().endsWith('.xlsx')
}

function validateSheetHeaders(sheet: WorkbookSheetInfo): ParserDiagnostic[] {
  const diagnostics: ParserDiagnostic[] = []
  const headerCounts = countHeaders(sheet.headers)

  for (const header of Object.values(NT_ITEM_MASTER_2568_REQUIRED_HEADERS)) {
    if (!headerCounts.has(header)) {
      diagnostics.push({
        row: NT_ITEM_MASTER_2568_PROFILE.headerRow,
        field: header,
        code: 'IMPORT_PROFILE_NOT_RECOGNIZED',
        message: 'Required profile header is missing',
      })
    }
  }

  for (const [header, count] of headerCounts) {
    if (count > 1) {
      diagnostics.push({
        row: NT_ITEM_MASTER_2568_PROFILE.headerRow,
        field: header,
        code: 'IMPORT_PROFILE_NOT_RECOGNIZED',
        message: 'Duplicate header is not allowed',
      })
    }
  }

  return diagnostics
}

function validateSheetRows(sheet: WorkbookSheetInfo): ParserDiagnostic[] {
  const diagnostics: ParserDiagnostic[] = []

  if (sheet.dataRows.length === 0) {
    diagnostics.push({
      row: NT_ITEM_MASTER_2568_PROFILE.firstDataRow,
      code: 'IMPORT_PROFILE_NOT_RECOGNIZED',
      message: 'At least one candidate data row is required',
    })
  }

  if (sheet.dataRows.length > NT_ITEM_MASTER_2568_PROFILE.maxRows) {
    diagnostics.push({
      code: 'IMPORT_ROW_LIMIT_EXCEEDED',
      message: 'Parsed item row limit exceeded',
    })
  }

  return diagnostics
}

function countHeaders(headers: readonly string[]): Map<string, number> {
  const counts = new Map<string, number>()

  for (const header of headers) {
    const normalizedHeader = header.trim()

    if (normalizedHeader.length === 0) {
      continue
    }

    counts.set(normalizedHeader, (counts.get(normalizedHeader) ?? 0) + 1)
  }

  return counts
}

function readTextCell(
  row: UnknownWorkbookRow,
  header: string,
  field: string,
  maxLength: number,
): string {
  const value = row[header]

  if (typeof value !== 'string') {
    throw new CatalogParserProfileError('Workbook row validation failed', [{
      field,
      code: 'VALIDATION_FAILED',
      message: describeRejectedCell(value),
    }])
  }

  const normalized = value.trim().normalize('NFC')

  if (normalized.length === 0) {
    throw new CatalogParserProfileError('Workbook row validation failed', [{
      field,
      code: 'VALIDATION_FAILED',
      message: 'Required cell is blank',
    }])
  }

  if (normalized.length > maxLength) {
    throw new CatalogParserProfileError('Workbook row validation failed', [{
      field,
      code: 'VALIDATION_FAILED',
      message: 'Required cell text exceeds the profile limit',
    }])
  }

  if (CONTROL_CHARACTER_PATTERN.test(normalized)) {
    throw new CatalogParserProfileError('Workbook row validation failed', [{
      field,
      code: 'VALIDATION_FAILED',
      message: 'Control characters are not allowed',
    }])
  }

  return normalized
}

function readMoneyCell(
  row: UnknownWorkbookRow,
  header: string,
  field: string,
): string {
  const value = readTextCell(row, header, field, 32)

  if (!MONEY_PATTERN.test(value)) {
    throw new CatalogParserProfileError('Workbook row validation failed', [{
      field,
      code: 'VALIDATION_FAILED',
      message: 'Money must be a two-decimal string',
    }])
  }

  return value
}

function readSourceRow(row: UnknownWorkbookRow, header: string): number {
  const sourceRowText = readTextCell(row, header, 'source_row', 16)

  if (!SOURCE_ROW_PATTERN.test(sourceRowText)) {
    throw new CatalogParserProfileError('Workbook row validation failed', [{
      field: 'source_row',
      code: 'VALIDATION_FAILED',
      message: 'Source row must be a positive integer string',
    }])
  }

  const sourceRow = Number(sourceRowText)

  if (!Number.isSafeInteger(sourceRow)) {
    throw new CatalogParserProfileError('Workbook row validation failed', [{
      field: 'source_row',
      code: 'VALIDATION_FAILED',
      message: 'Source row exceeds the safe integer limit',
    }])
  }

  return sourceRow
}

function assertPattern(value: string, pattern: RegExp, field: string): void {
  if (!pattern.test(value)) {
    throw new CatalogParserProfileError('Workbook row validation failed', [{
      field,
      code: 'VALIDATION_FAILED',
      message: 'Cell does not match the approved profile format',
    }])
  }
}

function assertMoneySum(
  materialCost: string,
  laborCost: string,
  unitCost: string,
): void {
  if (moneyToCents(materialCost) + moneyToCents(laborCost) !== moneyToCents(unitCost)) {
    throw new CatalogParserProfileError('Workbook row validation failed', [{
      field: 'total_cost',
      code: 'VALIDATION_FAILED',
      message: 'Material and labor costs must equal total cost',
    }])
  }
}

function moneyToCents(value: string): bigint {
  const [whole, cents] = value.split('.')
  return BigInt(whole) * BigInt(100) + BigInt(cents)
}

function readContextText(
  value: string | undefined,
  field: string,
  code: 'IMPORT_RECONCILIATION_REQUIRED',
  message: string,
): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new CatalogParserProfileError('Workbook row validation failed', [{
      field,
      code,
      message,
    }])
  }

  return value.trim().normalize('NFC')
}

function readOptionalContextText(
  value: string | undefined,
  field: string,
): string | null {
  if (typeof value === 'undefined' || value === null) {
    return null
  }

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new CatalogParserProfileError('Workbook row validation failed', [{
      field,
      code: 'VALIDATION_FAILED',
      message: 'Optional context value must be a nonblank string when present',
    }])
  }

  return value.trim().normalize('NFC')
}

function readIdentityOutcome(
  value: CatalogImportIdentityOutcome | undefined,
): CatalogImportIdentityOutcome {
  if (typeof value === 'undefined') {
    return 'candidate_add'
  }

  if (!['retain', 'recode', 'candidate_add', 'retire'].includes(value)) {
    throw new CatalogParserProfileError('Workbook row validation failed', [{
      field: 'identityOutcome',
      code: 'VALIDATION_FAILED',
      message: 'Identity outcome is not recognized',
    }])
  }

  return value
}

function describeRejectedCell(value: WorkbookCellValue): string {
  if (isWorkbookFormulaCell(value)) {
    return 'Formula cells are not allowed in required fields'
  }

  if (isWorkbookErrorCell(value)) {
    return 'Error cells are not allowed in required fields'
  }

  if (value instanceof Date) {
    return 'Date cells are not allowed in required fields'
  }

  if (typeof value === 'number') {
    return 'Number cells are not allowed in required fields'
  }

  if (typeof value === 'boolean') {
    return 'Boolean cells are not allowed in required fields'
  }

  return 'Required cell must be a text value'
}

function isWorkbookFormulaCell(value: WorkbookCellValue): boolean {
  return typeof value === 'object' && value !== null && 'kind' in value && value.kind === 'formula'
}

function isWorkbookErrorCell(value: WorkbookCellValue): boolean {
  return typeof value === 'object' && value !== null && 'kind' in value && value.kind === 'error'
}
