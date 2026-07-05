export type CatalogErrorCode =
  | 'AUTH_REQUIRED'
  | 'FORBIDDEN'
  | 'VALIDATION_FAILED'
  | 'IMPORT_FILE_TOO_LARGE'
  | 'IMPORT_ROW_LIMIT_EXCEEDED'
  | 'IMPORT_PAYLOAD_TOO_LARGE'
  | 'IMPORT_PROFILE_NOT_RECOGNIZED'
  | 'IMPORT_PRICE_AUTHORITY_REQUIRED'
  | 'IMPORT_RECONCILIATION_REQUIRED'
  | 'IMPORT_RETIREMENT_APPROVAL_REQUIRED'
  | 'CATALOG_CODE_CAPACITY_REVIEW_REQUIRED'
  | 'DRAFT_NOT_FOUND'
  | 'DRAFT_NOT_EDITABLE'
  | 'DRAFT_LOCK_CONFLICT'
  | 'DRAFT_BASE_STALE'
  | 'REQUEST_ALREADY_PROCESSED'
  | 'PUBLISH_EVIDENCE_REQUIRED'
  | 'PUBLISH_VALIDATION_FAILED'
  | 'EXPORT_HASH_MISMATCH'
  | 'INTERNAL_ERROR'

export type CanonicalImportField =
  | 'itemCode'
  | 'workContextCode'
  | 'workContextNameTh'
  | 'itemTypeCode'
  | 'itemTypeNameTh'
  | 'itemName'
  | 'unit'
  | 'materialCost'
  | 'laborCost'
  | 'unitCost'
  | 'sourceSheet'
  | 'sourceRow'

export type WorkbookFormulaCell = {
  kind: 'formula'
  formula?: string
}

export type WorkbookErrorCell = {
  kind: 'error'
  error?: string
}

export type WorkbookCellValue =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined
  | WorkbookFormulaCell
  | WorkbookErrorCell

export type UnknownWorkbookRow = Readonly<Record<string, WorkbookCellValue>>

export interface WorkbookSheetInfo {
  name: string
  headers: readonly string[]
  dataRows: readonly UnknownWorkbookRow[]
}

export interface WorkbookInfo {
  filename: string
  sheets: readonly WorkbookSheetInfo[]
}

export interface ParserDiagnostic {
  row?: number
  field?: string
  code: CatalogErrorCode | string
  message: string
}

export interface ProfileDetection {
  matched: boolean
  confidence: 'exact' | 'none'
  errors: ParserDiagnostic[]
}

export type CatalogImportIdentityOutcome =
  | 'retain'
  | 'recode'
  | 'candidate_add'
  | 'retire'

export interface NormalizedCatalogRowCandidate {
  sourceRow: number
  sourceReference: string
  legacyItemCode: string | null
  canonicalCode: string
  workContextCode: string
  workContextNameTh: string
  itemTypeCode: string
  itemTypeNameTh: string
  itemName: string
  unit: string
  materialCost: string
  laborCost: string
  unitCost: string
  categoryCode: string
  identityOutcome: CatalogImportIdentityOutcome
  priceAuthorityReference: string | null
}

export interface CatalogImportPayloadV1 {
  schemaVersion: 'catalog-import-payload/1'
  parserProfileId: 'nt-item-master-2568'
  parserProfileVersion: '1'
  mode: 'full' | 'supplement'
  versionId: string
  expectedLockVersion: number
  requestId: string
  reason: string
  source: {
    filename: string
    sizeBytes: number
    sha256: string
    physicalArchiveReference: string
  }
  retirementApprovalReference: string | null
  retirementConfirmedCount: number | null
  rows: NormalizedCatalogRowCandidate[]
}

export interface CatalogImportApplyPayloadV1 extends CatalogImportPayloadV1 {
  validatedImportId: string
  applyRequestId: string
}

export interface ParseContext {
  legacyItemCodeByCanonicalCode?: Readonly<Record<string, string>>
  categoryCodeByCanonicalCode?: Readonly<Record<string, string>>
  categoryCodeByGroup?: Readonly<Record<string, string>>
  identityOutcomeByCanonicalCode?: Readonly<Record<string, CatalogImportIdentityOutcome>>
  priceAuthorityReferenceByCanonicalCode?: Readonly<Record<string, string>>
}

export interface CatalogParserProfile {
  id: string
  version: string
  displayName: string
  acceptedExtensions: readonly ['.xlsx']
  requiredSheet: string
  headerRow: number
  firstDataRow: number
  maxRows: number
  requiredHeaders: Readonly<Record<CanonicalImportField, string>>
  optionalHeaders: Readonly<Partial<Record<CanonicalImportField, string>>>
  ignoredHeaders: readonly string[]
  detect: (workbookInfo: WorkbookInfo) => ProfileDetection
  normalizeRow: (
    row: UnknownWorkbookRow,
    context: ParseContext,
  ) => NormalizedCatalogRowCandidate
}

export class CatalogParserProfileError extends Error {
  diagnostics: ParserDiagnostic[]

  constructor(message: string, diagnostics: ParserDiagnostic[]) {
    super(message)
    this.name = 'CatalogParserProfileError'
    this.diagnostics = diagnostics
  }
}
