import {
  CATALOG_IMPORT_RAW_FILE_LIMIT_BYTES,
  CATALOG_IMPORT_ROW_LIMIT,
} from './payload'
import type {
  ParserDiagnostic,
  WorkbookCellValue,
  WorkbookErrorCell,
  WorkbookFormulaCell,
  WorkbookInfo,
  WorkbookSheetInfo,
} from './types'

type WorksheetLike = {
  name: string
  rowCount: number
  columnCount: number
  state?: string
  getRow: (rowNumber: number) => RowLike
}

type RowLike = {
  getCell: (columnNumber: number) => CellLike
}

type CellLike = {
  value: unknown
}

export interface CatalogWorkbookParseInput {
  filename: string
  sizeBytes: number
  arrayBuffer: ArrayBuffer
}

export interface CatalogWorkbookParseResult {
  source: {
    filename: string
    sizeBytes: number
    sha256: string
  }
  workbookInfo: WorkbookInfo
}

export interface CatalogWorkbookParseOptions {
  maxRawFileBytes?: number
  maxRowsPerSheet?: number
}

export class CatalogWorkbookParseError extends Error {
  diagnostics: ParserDiagnostic[]

  constructor(message: string, diagnostics: ParserDiagnostic[]) {
    super(message)
    this.name = 'CatalogWorkbookParseError'
    this.diagnostics = diagnostics
  }
}

export async function parseCatalogWorkbookInfoFromXlsx(
  input: CatalogWorkbookParseInput,
  options: CatalogWorkbookParseOptions = {},
): Promise<CatalogWorkbookParseResult> {
  const maxRawFileBytes = options.maxRawFileBytes ?? CATALOG_IMPORT_RAW_FILE_LIMIT_BYTES
  const maxRowsPerSheet = options.maxRowsPerSheet ?? CATALOG_IMPORT_ROW_LIMIT
  const filename = input.filename.trim()

  if (filename.length === 0) {
    throw parseError('Workbook filename is required', [{
      field: 'filename',
      code: 'VALIDATION_FAILED',
      message: 'Workbook filename is required',
    }])
  }

  if (input.sizeBytes !== input.arrayBuffer.byteLength) {
    throw parseError('Workbook file size metadata does not match the selected bytes', [{
      field: 'sizeBytes',
      code: 'VALIDATION_FAILED',
      message: 'Workbook file size metadata does not match the selected bytes',
    }])
  }

  if (input.sizeBytes < 1) {
    throw parseError('Workbook file size must be positive', [{
      field: 'sizeBytes',
      code: 'VALIDATION_FAILED',
      message: 'Workbook file size must be positive',
    }])
  }

  if (input.sizeBytes > maxRawFileBytes) {
    throw parseError('Raw workbook file size exceeds the profile limit', [{
      field: 'sizeBytes',
      code: 'IMPORT_FILE_TOO_LARGE',
      message: 'Raw workbook file size exceeds the profile limit',
    }])
  }

  const sha256 = await hashArrayBuffer(input.arrayBuffer)
  const ExcelJS = (await import('exceljs')).default
  const workbook = new ExcelJS.Workbook()

  await workbook.xlsx.load(
    input.arrayBuffer as Parameters<typeof workbook.xlsx.load>[0],
  )

  return {
    source: {
      filename,
      sizeBytes: input.sizeBytes,
      sha256,
    },
    workbookInfo: {
      filename,
      sheets: workbook.worksheets
        .filter(isVisibleWorksheet)
        .map((worksheet: WorksheetLike) => worksheetToInfo(worksheet, maxRowsPerSheet)),
    },
  }
}

function worksheetToInfo(
  worksheet: WorksheetLike,
  maxRowsPerSheet: number,
): WorkbookSheetInfo {
  const headers = readHeaders(worksheet)
  const dataRows = []

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber)
    const workbookRow = rowToObject(row, headers)

    if (!isCandidateDataRow(workbookRow)) {
      continue
    }

    dataRows.push(workbookRow)

    if (dataRows.length > maxRowsPerSheet) {
      break
    }
  }

  return {
    name: worksheet.name,
    headers,
    dataRows,
  }
}

function readHeaders(worksheet: WorksheetLike): string[] {
  const headerRow = worksheet.getRow(1)
  const headers = []

  for (let columnNumber = 1; columnNumber <= worksheet.columnCount; columnNumber += 1) {
    headers.push(cellToHeaderText(headerRow.getCell(columnNumber).value))
  }

  return headers
}

function rowToObject(
  row: RowLike,
  headers: readonly string[],
): Record<string, WorkbookCellValue> {
  const workbookRow: Record<string, WorkbookCellValue> = {}

  headers.forEach((header, index) => {
    const normalizedHeader = header.trim()

    if (normalizedHeader.length === 0) {
      return
    }

    workbookRow[normalizedHeader] = cellToWorkbookValue(row.getCell(index + 1).value)
  })

  return workbookRow
}

function isCandidateDataRow(row: Record<string, WorkbookCellValue>): boolean {
  return Object.values(row).some((value) => {
    if (typeof value === 'string') {
      return value.trim().length > 0
    }

    return value !== null && typeof value !== 'undefined'
  })
}

function cellToHeaderText(value: unknown): string {
  const normalized = cellToWorkbookValue(value)

  if (typeof normalized === 'string') {
    return normalized.trim()
  }

  if (typeof normalized === 'number' || typeof normalized === 'boolean') {
    return String(normalized).trim()
  }

  return ''
}

function cellToWorkbookValue(value: unknown): WorkbookCellValue {
  if (
    value === null ||
    typeof value === 'undefined' ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value instanceof Date
  ) {
    return value
  }

  if (!isPlainObject(value)) {
    return String(value)
  }

  const formula = getFormulaText(value)

  if (typeof formula === 'string') {
    return {
      kind: 'formula',
      formula,
    } satisfies WorkbookFormulaCell
  }

  if (typeof value.error === 'string') {
    return {
      kind: 'error',
      error: value.error,
    } satisfies WorkbookErrorCell
  }

  if (Array.isArray(value.richText)) {
    return value.richText.map((part) => {
      if (isPlainObject(part) && typeof part.text === 'string') {
        return part.text
      }

      return ''
    }).join('')
  }

  if (typeof value.text === 'string') {
    return value.text
  }

  if (typeof value.result !== 'undefined') {
    return cellToWorkbookValue(value.result)
  }

  return String(value)
}

function isVisibleWorksheet(worksheet: WorksheetLike): boolean {
  return worksheet.state !== 'hidden' && worksheet.state !== 'veryHidden'
}

function getFormulaText(value: Record<string, unknown>): string | undefined {
  if (typeof value.formula === 'string') {
    return value.formula
  }

  if (typeof value.sharedFormula === 'string') {
    return value.sharedFormula
  }

  return undefined
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype
}

async function hashArrayBuffer(arrayBuffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', arrayBuffer)

  return bytesToHex(new Uint8Array(digest))
}

function parseError(
  message: string,
  diagnostics: ParserDiagnostic[],
): CatalogWorkbookParseError {
  return new CatalogWorkbookParseError(message, diagnostics)
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}
