import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  CatalogErrorCode,
  CatalogImportPayloadV1,
  NormalizedCatalogRowCandidate,
  ParserDiagnostic,
} from '@/lib/master-catalog/import/types';

export interface CatalogImportDraftRowSnapshot {
  itemCode: string;
  identityId: string;
  itemName: string;
  unit: string;
  materialCost: string | number;
  laborCost: string | number;
  unitCost: string | number;
  category: string | null;
  isActive: boolean;
}

export interface CatalogImportCodeReservationSnapshot {
  itemCode: string;
  identityId: string;
}

export interface CatalogImportDraftSnapshot {
  status: string;
  lockVersion: number;
  basedOnVersionId: string | null;
  currentVersionId: string | null;
  rows: CatalogImportDraftRowSnapshot[];
  codeReservations: CatalogImportCodeReservationSnapshot[];
}

export class CatalogImportServerValidationError extends Error {
  code: CatalogErrorCode;
  diagnostics: ParserDiagnostic[];
  retryable: boolean;

  constructor(
    code: CatalogErrorCode,
    message: string,
    diagnostics: ParserDiagnostic[] = [],
    retryable = false,
  ) {
    super(message);
    this.name = 'CatalogImportServerValidationError';
    this.code = code;
    this.diagnostics = diagnostics;
    this.retryable = retryable;
  }
}

const CANDIDATE_CODE_PATTERN = /^[A-Z0-9]{3}-[A-Z0-9]{3}-[0-9]{3}$/;
const HDPE_AS_GIP_CROSSING_PATTERN = /^CRS-GIP-(018|019|02[0-9]|03[0-3])$/;

export async function validateCatalogImportAgainstDraft(
  supabase: SupabaseClient,
  payload: CatalogImportPayloadV1,
): Promise<void> {
  const snapshot = await loadCatalogImportDraftSnapshot(supabase, payload);
  assertCatalogImportPayloadIsDraftSafe(payload, snapshot);
}

export function assertCatalogImportPayloadIsDraftSafe(
  payload: CatalogImportPayloadV1,
  snapshot: CatalogImportDraftSnapshot,
): void {
  const diagnostics = collectCatalogImportValidationDiagnostics(payload, snapshot);

  if (diagnostics.length > 0) {
    const code = pickPrimaryErrorCode(diagnostics);
    throw new CatalogImportServerValidationError(
      code,
      summarizeDiagnostics(code, diagnostics),
      diagnostics.slice(0, 50),
      code === 'DRAFT_LOCK_CONFLICT',
    );
  }
}

export function collectCatalogImportValidationDiagnostics(
  payload: CatalogImportPayloadV1,
  snapshot: CatalogImportDraftSnapshot,
): ParserDiagnostic[] {
  const diagnostics: ParserDiagnostic[] = [];

  if (snapshot.status !== 'draft') {
    diagnostics.push({
      field: 'versionId',
      code: 'DRAFT_NOT_EDITABLE',
      message: 'Only draft catalog versions can be imported',
    });
  }

  if (snapshot.currentVersionId && snapshot.basedOnVersionId !== snapshot.currentVersionId) {
    diagnostics.push({
      field: 'versionId',
      code: 'DRAFT_BASE_STALE',
      message: 'Draft base is no longer the current catalog default',
    });
  }

  if (snapshot.lockVersion !== payload.expectedLockVersion) {
    diagnostics.push({
      field: 'expectedLockVersion',
      code: 'DRAFT_LOCK_CONFLICT',
      message: 'Draft lock version is stale',
    });
  }

  const rowsByCode = new Map(
    snapshot.rows.map((row) => [row.itemCode, row]),
  );
  const codeReservations = new Map(
    snapshot.codeReservations.map((row) => [row.itemCode, row.identityId]),
  );
  const seenIdentityIds = new Set<string>();

  for (const row of payload.rows) {
    const rowDiagnostics = validateImportRow(row, rowsByCode, codeReservations, seenIdentityIds);
    diagnostics.push(...rowDiagnostics);
  }

  if (payload.mode === 'full') {
    const activeRows = snapshot.rows.filter((row) => row.isActive);
    const retireCount = activeRows.filter((row) => !seenIdentityIds.has(row.identityId)).length;
    const retireThreshold = Math.max(10, Math.ceil(activeRows.length * 0.02));

    if (
      retireCount >= retireThreshold &&
      (
        !payload.retirementApprovalReference ||
        payload.retirementConfirmedCount !== retireCount
      )
    ) {
      diagnostics.push({
        field: 'retirementConfirmedCount',
        code: 'IMPORT_RETIREMENT_APPROVAL_REQUIRED',
        message: `Full import would retire ${retireCount} active rows; exact owner approval evidence is required`,
      });
    }
  }

  return diagnostics;
}

async function loadCatalogImportDraftSnapshot(
  supabase: SupabaseClient,
  payload: CatalogImportPayloadV1,
): Promise<CatalogImportDraftSnapshot> {
  const { data: version, error: versionError } = await supabase
    .from('price_list_versions')
    .select('id,status,lock_version,based_on_version_id')
    .eq('id', payload.versionId)
    .maybeSingle();

  if (versionError) {
    throw new CatalogImportServerValidationError(
      'INTERNAL_ERROR',
      'Draft version could not be loaded for import validation',
    );
  }

  if (!version) {
    throw new CatalogImportServerValidationError(
      'DRAFT_NOT_FOUND',
      'Draft catalog version was not found',
      [{
        field: 'versionId',
        code: 'DRAFT_NOT_FOUND',
        message: 'Draft catalog version was not found',
      }],
    );
  }

  const [pointerResult, rowsResult, codeReservationsResult] = await Promise.all([
    supabase
      .from('price_list_default_version')
      .select('version_id')
      .eq('id', true)
      .maybeSingle(),
    supabase
      .from('price_list')
      .select('item_code,identity_id,item_name,unit,material_cost,labor_cost,unit_cost,category,is_active')
      .eq('version_id', payload.versionId),
    loadCodeReservations(supabase, payload.rows.map((row) => row.canonicalCode)),
  ]);

  if (pointerResult.error || rowsResult.error || codeReservationsResult.error) {
    throw new CatalogImportServerValidationError(
      'INTERNAL_ERROR',
      'Draft rows or code registry could not be loaded for import validation',
    );
  }

  return {
    status: String(version.status ?? ''),
    lockVersion: toNonnegativeInteger(version.lock_version),
    basedOnVersionId: toNullableString(version.based_on_version_id),
    currentVersionId: toNullableString(pointerResult.data?.version_id),
    rows: rowsFromResult(rowsResult.data).map((row) => ({
      itemCode: String(row.item_code ?? ''),
      identityId: String(row.identity_id ?? ''),
      itemName: String(row.item_name ?? ''),
      unit: String(row.unit ?? ''),
      materialCost: row.material_cost as string | number,
      laborCost: row.labor_cost as string | number,
      unitCost: row.unit_cost as string | number,
      category: toNullableString(row.category),
      isActive: Boolean(row.is_active),
    })),
    codeReservations: rowsFromResult(codeReservationsResult.data).map((row) => ({
      itemCode: String(row.item_code ?? ''),
      identityId: String(row.identity_id ?? ''),
    })),
  };
}

async function loadCodeReservations(
  supabase: SupabaseClient,
  itemCodes: string[],
): Promise<{
  data: unknown;
  error: { message?: string } | null;
}> {
  const uniqueCodes = [...new Set(itemCodes)].filter(Boolean);

  if (uniqueCodes.length === 0) {
    return { data: [], error: null };
  }

  return supabase
    .from('catalog_item_codes')
    .select('item_code,identity_id')
    .in('item_code', uniqueCodes);
}

function validateImportRow(
  row: NormalizedCatalogRowCandidate,
  rowsByCode: ReadonlyMap<string, CatalogImportDraftRowSnapshot>,
  codeReservations: ReadonlyMap<string, string>,
  seenIdentityIds: Set<string>,
): ParserDiagnostic[] {
  const diagnostics: ParserDiagnostic[] = [];
  const suffix = Number(row.canonicalCode.slice(-3));

  if (!CANDIDATE_CODE_PATTERN.test(row.canonicalCode)) {
    diagnostics.push(rowDiagnostic(row, 'canonicalCode', 'VALIDATION_FAILED', 'Canonical item code is not in the approved format'));
  }

  if (Number.isInteger(suffix) && suffix >= 900) {
    diagnostics.push(rowDiagnostic(
      row,
      'canonicalCode',
      'CATALOG_CODE_CAPACITY_REVIEW_REQUIRED',
      'Catalog code sequence capacity review is required',
    ));
  }

  if (isBlockedHdpeAsGipCrossing(row)) {
    diagnostics.push(rowDiagnostic(
      row,
      'canonicalCode',
      'IMPORT_RECONCILIATION_REQUIRED',
      'HDPE Crossing rows must not be imported as CRS-GIP',
    ));
  }

  if (row.identityOutcome === 'candidate_add') {
    if (!row.priceAuthorityReference) {
      diagnostics.push(rowDiagnostic(
        row,
        'priceAuthorityReference',
        'IMPORT_PRICE_AUTHORITY_REQUIRED',
        'New catalog rows require price authority evidence',
      ));
    }

    if (codeReservations.has(row.canonicalCode)) {
      diagnostics.push(rowDiagnostic(
        row,
        'canonicalCode',
        'IMPORT_RECONCILIATION_REQUIRED',
        'Catalog code is already allocated to an identity',
      ));
    }

    return diagnostics;
  }

  const existing = resolveExistingDraftRow(row, rowsByCode);

  if (!existing) {
    diagnostics.push(rowDiagnostic(
      row,
      'legacyItemCode',
      'IMPORT_RECONCILIATION_REQUIRED',
      'Existing draft row could not be resolved from the supplied code',
    ));
    return diagnostics;
  }

  if (seenIdentityIds.has(existing.identityId)) {
    diagnostics.push(rowDiagnostic(
      row,
      'legacyItemCode',
      'IMPORT_RECONCILIATION_REQUIRED',
      'Import payload references the same catalog identity more than once',
    ));
  } else {
    seenIdentityIds.add(existing.identityId);
  }

  if (row.identityOutcome === 'retire') {
    return diagnostics;
  }

  if (rowWouldChangeAuthorityFields(row, existing) && !row.priceAuthorityReference) {
    diagnostics.push(rowDiagnostic(
      row,
      'priceAuthorityReference',
      'IMPORT_PRICE_AUTHORITY_REQUIRED',
      'Name, unit, or price differences require explicit authority evidence',
    ));
  }

  const reservedIdentityId = codeReservations.get(row.canonicalCode);
  if (
    row.canonicalCode !== existing.itemCode &&
    reservedIdentityId &&
    reservedIdentityId !== existing.identityId
  ) {
    diagnostics.push(rowDiagnostic(
      row,
      'canonicalCode',
      'IMPORT_RECONCILIATION_REQUIRED',
      'Catalog code is already allocated to a different identity',
    ));
  }

  return diagnostics;
}

function resolveExistingDraftRow(
  row: NormalizedCatalogRowCandidate,
  rowsByCode: ReadonlyMap<string, CatalogImportDraftRowSnapshot>,
): CatalogImportDraftRowSnapshot | null {
  if (row.legacyItemCode) {
    const byLegacy = rowsByCode.get(row.legacyItemCode);
    if (byLegacy) return byLegacy;
  }

  return rowsByCode.get(row.canonicalCode) ?? null;
}

function rowWouldChangeAuthorityFields(
  row: NormalizedCatalogRowCandidate,
  existing: CatalogImportDraftRowSnapshot,
): boolean {
  return (
    row.itemName !== existing.itemName ||
    row.unit !== existing.unit ||
    row.materialCost !== toMoneyString(existing.materialCost) ||
    row.laborCost !== toMoneyString(existing.laborCost) ||
    row.unitCost !== toMoneyString(existing.unitCost)
  );
}

function isBlockedHdpeAsGipCrossing(row: NormalizedCatalogRowCandidate): boolean {
  return (
    HDPE_AS_GIP_CROSSING_PATTERN.test(row.canonicalCode) &&
    row.itemName.toUpperCase().includes('HDPE')
  );
}

function rowDiagnostic(
  row: NormalizedCatalogRowCandidate,
  field: string,
  code: CatalogErrorCode,
  message: string,
): ParserDiagnostic {
  return {
    row: row.sourceRow,
    field,
    code,
    message,
  };
}

function pickPrimaryErrorCode(diagnostics: readonly ParserDiagnostic[]): CatalogErrorCode {
  const priority: CatalogErrorCode[] = [
    'DRAFT_LOCK_CONFLICT',
    'DRAFT_BASE_STALE',
    'DRAFT_NOT_EDITABLE',
    'IMPORT_RETIREMENT_APPROVAL_REQUIRED',
    'IMPORT_PRICE_AUTHORITY_REQUIRED',
    'IMPORT_RECONCILIATION_REQUIRED',
    'CATALOG_CODE_CAPACITY_REVIEW_REQUIRED',
    'VALIDATION_FAILED',
  ];
  const codes = new Set(diagnostics.map((diagnostic) => diagnostic.code));
  return priority.find((code) => codes.has(code)) ?? 'VALIDATION_FAILED';
}

function summarizeDiagnostics(
  code: CatalogErrorCode,
  diagnostics: readonly ParserDiagnostic[],
): string {
  const first = diagnostics[0]?.message;
  const suffix = diagnostics.length > 1 ? ` (${diagnostics.length} diagnostics)` : '';
  return `${first ?? code}${suffix}`;
}

function rowsFromResult(data: unknown): Record<string, unknown>[] {
  return Array.isArray(data) ? data as Record<string, unknown>[] : [];
}

function toNullableString(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value);
  return text.length > 0 ? text : null;
}

function toNonnegativeInteger(value: unknown): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

function toMoneyString(value: string | number): string {
  if (typeof value === 'number') {
    return value.toFixed(2);
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(2) : value;
}
