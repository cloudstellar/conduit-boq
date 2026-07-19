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
      message: 'ไฟล์ต้องใช้นามสกุล .xlsx ที่ระบบรองรับ',
    })
  }

  const matchingSheets = workbookInfo.sheets.filter(
    (sheet) => sheet.name.trim() === NT_ITEM_MASTER_2568_PROFILE.requiredSheet,
  )

  if (matchingSheets.length === 0) {
    errors.push({
      field: 'sheet',
      code: 'IMPORT_PROFILE_NOT_RECOGNIZED',
      message: 'ไม่พบแผ่นงานที่รูปแบบนำเข้ากำหนด',
    })
  }

  if (matchingSheets.length > 1) {
    errors.push({
      field: 'sheet',
      code: 'IMPORT_PROFILE_NOT_RECOGNIZED',
      message: 'พบแผ่นงานที่กำหนดมากกว่าหนึ่งแผ่น',
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
  const sourceItemCode = readTextCell(row, headers.itemCode, 'item_code', 64)
  const workContextCode = readTextCell(row, headers.workContextCode, 'AAA', 16)
  const workContextNameTh = readTextCell(row, headers.workContextNameTh, 'AAA_name_th', 200)
  const itemTypeCode = readTextCell(row, headers.itemTypeCode, 'TTT', 16)
  const itemTypeNameTh = readTextCell(row, headers.itemTypeNameTh, 'TTT_name_th', 200)
  const sourceSheet = readTextCell(row, headers.sourceSheet, 'source_sheet', 128)
  const sourceRow = readSourceRow(row, headers.sourceRow)
  const materialCost = readMoneyCell(row, headers.materialCost, 'material_cost')
  const laborCost = readMoneyCell(row, headers.laborCost, 'labor_cost')
  const unitCost = readMoneyCell(row, headers.unitCost, 'total_cost')

  assertPattern(sourceItemCode, CANDIDATE_CODE_PATTERN, 'item_code')
  assertPattern(workContextCode, CODE_GROUP_PATTERN, 'AAA')
  assertPattern(itemTypeCode, CODE_GROUP_PATTERN, 'TTT')
  assertMoneySum(materialCost, laborCost, unitCost)

  if (context.sourceExclusionCodes?.includes(sourceItemCode)) {
    throw new CatalogParserProfileError('รายการนี้ถูกเลื่อนไปจากรอบนำเข้าปัจจุบัน', [{
      row: sourceRow,
      field: 'item_code',
      code: 'IMPORT_RECONCILIATION_REQUIRED',
      message: 'รายการที่มีเฉพาะในไฟล์ต้นทางนี้ถูกเลื่อนออกและห้ามเข้าสู่รอบเผยแพร่แรก',
    }])
  }

  const authorityRow = context.authoritativeRowBySourceCode?.[sourceItemCode]

  if (authorityRow) {
    return {
      ...authorityRow,
      sourceRow,
      sourceReference: `${sourceSheet}:${sourceRow}`,
      sourceItemCode,
    }
  }

  const groupKey = `${workContextCode}-${itemTypeCode}`
  const categoryCode = readContextText(
    context.categoryCodeByCanonicalCode?.[sourceItemCode] ??
      context.categoryCodeByGroup?.[groupKey],
    'categoryCode',
    'IMPORT_RECONCILIATION_REQUIRED',
    'ต้องตรวจสอบหมวดงานให้ตรงกับกลุ่ม AAA-TTT',
  )
  const categoryId = readOptionalContextText(
    context.categoryIdByCode?.[categoryCode],
    'categoryId',
  )
  const codeGroupId = readOptionalContextText(
    context.codeGroupIdByGroup?.[groupKey],
    'codeGroupId',
  )

  return {
    sourceRow,
    sourceReference: `${sourceSheet}:${sourceRow}`,
    legacyItemCode: readOptionalContextText(
      context.legacyItemCodeByCanonicalCode?.[sourceItemCode],
      'legacyItemCode',
    ),
    canonicalCode: sourceItemCode,
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
    ...(categoryId ? { categoryId } : {}),
    ...(codeGroupId ? { codeGroupId } : {}),
    identityOutcome: readIdentityOutcome(
      context.identityOutcomeByCanonicalCode?.[sourceItemCode],
    ),
    priceAuthorityReference: readOptionalContextText(
      context.priceAuthorityReferenceByCanonicalCode?.[sourceItemCode],
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
        message: 'ไม่พบหัวคอลัมน์ที่รูปแบบนำเข้ากำหนด',
      })
    }
  }

  for (const [header, count] of headerCounts) {
    if (count > 1) {
      diagnostics.push({
        row: NT_ITEM_MASTER_2568_PROFILE.headerRow,
        field: header,
        code: 'IMPORT_PROFILE_NOT_RECOGNIZED',
        message: 'ห้ามมีหัวคอลัมน์ชื่อซ้ำ',
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
      message: 'ต้องมีข้อมูลอย่างน้อยหนึ่งแถว',
    })
  }

  if (sheet.dataRows.length > NT_ITEM_MASTER_2568_PROFILE.maxRows) {
    diagnostics.push({
      code: 'IMPORT_ROW_LIMIT_EXCEEDED',
      message: 'จำนวนแถวเกินเพดานที่ระบบรองรับ',
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
    throw new CatalogParserProfileError('ตรวจข้อมูลในแถวไม่ผ่าน', [{
      field,
      code: 'VALIDATION_FAILED',
      message: describeRejectedCell(value),
    }])
  }

  const normalized = value.trim().normalize('NFC')

  if (normalized.length === 0) {
    throw new CatalogParserProfileError('ตรวจข้อมูลในแถวไม่ผ่าน', [{
      field,
      code: 'VALIDATION_FAILED',
      message: 'ช่องข้อมูลที่จำเป็นต้องไม่ว่าง',
    }])
  }

  if (normalized.length > maxLength) {
    throw new CatalogParserProfileError('ตรวจข้อมูลในแถวไม่ผ่าน', [{
      field,
      code: 'VALIDATION_FAILED',
      message: 'ข้อความยาวเกินเพดานที่รูปแบบนำเข้ากำหนด',
    }])
  }

  if (CONTROL_CHARACTER_PATTERN.test(normalized)) {
    throw new CatalogParserProfileError('ตรวจข้อมูลในแถวไม่ผ่าน', [{
      field,
      code: 'VALIDATION_FAILED',
      message: 'ห้ามมีอักขระควบคุมในข้อความ',
    }])
  }

  return normalized
}

function readMoneyCell(
  row: UnknownWorkbookRow,
  header: string,
  field: string,
): string {
  const rawValue = row[header]

  if (typeof rawValue === 'number') {
    const scaled = rawValue * 100
    const rounded = Math.round(scaled)
    const tolerance = Number.EPSILON * Math.max(1, Math.abs(scaled)) * 4

    if (
      !Number.isFinite(rawValue)
      || rawValue < 0
      || !Number.isSafeInteger(rounded)
      || Math.abs(scaled - rounded) > tolerance
    ) {
      throw new CatalogParserProfileError('ตรวจข้อมูลในแถวไม่ผ่าน', [{
        field,
        code: 'VALIDATION_FAILED',
        message: 'จำนวนเงินต้องเป็นตัวเลขไม่ติดลบและมีทศนิยมไม่เกินสองตำแหน่ง',
      }])
    }

    const whole = Math.floor(rounded / 100)
    const fraction = String(rounded % 100).padStart(2, '0')
    return `${whole}.${fraction}`
  }

  const value = readTextCell(row, header, field, 32)

  if (!MONEY_PATTERN.test(value)) {
    throw new CatalogParserProfileError('ตรวจข้อมูลในแถวไม่ผ่าน', [{
      field,
      code: 'VALIDATION_FAILED',
      message: 'จำนวนเงินต้องมีทศนิยมสองตำแหน่ง',
    }])
  }

  return value
}

function readSourceRow(row: UnknownWorkbookRow, header: string): number {
  const value = row[header]

  if (typeof value === 'number') {
    if (!Number.isFinite(value) || !Number.isInteger(value) || value < 1) {
      throw new CatalogParserProfileError('ตรวจข้อมูลในแถวไม่ผ่าน', [{
        field: 'source_row',
        code: 'VALIDATION_FAILED',
        message: 'เลขแถวต้นทางต้องเป็นจำนวนเต็มบวก',
      }])
    }

    if (!Number.isSafeInteger(value)) {
      throw new CatalogParserProfileError('ตรวจข้อมูลในแถวไม่ผ่าน', [{
        field: 'source_row',
        code: 'VALIDATION_FAILED',
        message: 'เลขแถวต้นทางมีค่ามากเกินขอบเขตที่รองรับ',
      }])
    }

    return value
  }

  const sourceRowText = readTextCell(row, header, 'source_row', 16)

  if (!SOURCE_ROW_PATTERN.test(sourceRowText)) {
    throw new CatalogParserProfileError('ตรวจข้อมูลในแถวไม่ผ่าน', [{
      field: 'source_row',
      code: 'VALIDATION_FAILED',
      message: 'เลขแถวต้นทางต้องเป็นจำนวนเต็มบวก',
    }])
  }

  const sourceRow = Number(sourceRowText)

  if (!Number.isSafeInteger(sourceRow)) {
    throw new CatalogParserProfileError('ตรวจข้อมูลในแถวไม่ผ่าน', [{
      field: 'source_row',
      code: 'VALIDATION_FAILED',
      message: 'เลขแถวต้นทางมีค่ามากเกินขอบเขตที่รองรับ',
    }])
  }

  return sourceRow
}

function assertPattern(value: string, pattern: RegExp, field: string): void {
  if (!pattern.test(value)) {
    throw new CatalogParserProfileError('ตรวจข้อมูลในแถวไม่ผ่าน', [{
      field,
      code: 'VALIDATION_FAILED',
      message: 'ข้อมูลไม่ตรงรูปแบบที่อนุมัติ',
    }])
  }
}

function assertMoneySum(
  materialCost: string,
  laborCost: string,
  unitCost: string,
): void {
  if (moneyToCents(materialCost) + moneyToCents(laborCost) !== moneyToCents(unitCost)) {
    throw new CatalogParserProfileError('ตรวจข้อมูลในแถวไม่ผ่าน', [{
      field: 'total_cost',
      code: 'VALIDATION_FAILED',
      message: 'ค่าวัสดุรวมกับค่าแรงต้องเท่ากับราคารวม',
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
    throw new CatalogParserProfileError('ตรวจข้อมูลในแถวไม่ผ่าน', [{
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
    throw new CatalogParserProfileError('ตรวจข้อมูลในแถวไม่ผ่าน', [{
      field,
      code: 'VALIDATION_FAILED',
      message: 'ข้อมูลประกอบที่ระบุต้องเป็นข้อความและต้องไม่ว่าง',
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
    throw new CatalogParserProfileError('ตรวจข้อมูลในแถวไม่ผ่าน', [{
      field: 'identityOutcome',
      code: 'VALIDATION_FAILED',
      message: 'ผลการจับคู่ตัวตนรายการไม่อยู่ในชุดที่ระบบรองรับ',
    }])
  }

  return value
}

function describeRejectedCell(value: WorkbookCellValue): string {
  if (isWorkbookFormulaCell(value)) {
    return 'ช่องข้อมูลที่จำเป็นห้ามใช้สูตร'
  }

  if (isWorkbookErrorCell(value)) {
    return 'ช่องข้อมูลที่จำเป็นต้องไม่มีค่า error จาก Excel'
  }

  if (value instanceof Date) {
    return 'ช่องข้อมูลที่จำเป็นห้ามเป็นชนิดวันที่'
  }

  if (typeof value === 'number') {
    return 'ช่องข้อมูลที่จำเป็นต้องจัดเก็บเป็นข้อความ ไม่ใช่ชนิดตัวเลข'
  }

  if (typeof value === 'boolean') {
    return 'ช่องข้อมูลที่จำเป็นห้ามเป็นค่าจริง/เท็จ'
  }

  return 'ช่องข้อมูลที่จำเป็นต้องเป็นข้อความ'
}

function isWorkbookFormulaCell(value: WorkbookCellValue): boolean {
  return typeof value === 'object' && value !== null && 'kind' in value && value.kind === 'formula'
}

function isWorkbookErrorCell(value: WorkbookCellValue): boolean {
  return typeof value === 'object' && value !== null && 'kind' in value && value.kind === 'error'
}
