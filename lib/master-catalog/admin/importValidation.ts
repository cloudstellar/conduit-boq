import type { SupabaseClient } from '@supabase/supabase-js';
import { loadCatalogVersionWorkspace } from './catalogWorkspace';
import type {
  CatalogErrorCode,
  CatalogImportPayload,
  NormalizedCatalogImportRowV2,
  NormalizedCatalogRowCandidate,
  ParserDiagnostic,
} from '@/lib/master-catalog/import/types';

type CatalogImportRow = NormalizedCatalogRowCandidate | NormalizedCatalogImportRowV2;

export interface CatalogImportDraftRowSnapshot {
  itemCode: string;
  identityId: string;
  itemName: string;
  unit: string;
  materialCost: string;
  laborCost: string;
  unitCost: string;
  categoryCode: string;
  categoryId: string;
  codeGroupId: string | null;
  isActive: boolean;
}

export interface CatalogImportDraftSnapshot {
  status: string;
  lockVersion: number;
  basedOnVersionId: string | null;
  currentVersionId: string | null;
  rows: CatalogImportDraftRowSnapshot[];
  codeReservations: Array<{ itemCode: string; identityId: string }>;
  categoryIds: string[];
  codeGroupIds: string[];
}

export type CatalogImportDiffAction =
  | 'add'
  | 'update'
  | 'recode'
  | 'retire'
  | 'unchanged';

export interface CatalogImportDiffRow {
  sourceRow: number | null;
  sourceReference: string;
  sourceItemCode: string | null;
  identityId: string | null;
  beforeItemCode: string | null;
  afterItemCode: string | null;
  itemName: string;
  action: CatalogImportDiffAction;
  changedFields: string[];
  priceAuthorityReference: string | null;
  omission: boolean;
}

export interface CatalogImportDiff {
  rows: CatalogImportDiffRow[];
  summary: Record<CatalogImportDiffAction, number> & {
    total: number;
    omissions: number;
    authorityFieldChanges: number;
  };
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

const HDPE_AS_GIP_CROSSING_PATTERN = /^CRS-GIP-(018|019|02[0-9]|03[0-3])$/;

export async function validateCatalogImportAgainstDraft(
  supabase: SupabaseClient,
  payload: CatalogImportPayload,
): Promise<CatalogImportDiff> {
  const snapshot = await loadCatalogImportDraftSnapshot(supabase, payload);
  return assertCatalogImportPayloadIsDraftSafe(payload, snapshot);
}

export function assertCatalogImportPayloadIsDraftSafe(
  payload: CatalogImportPayload,
  snapshot: CatalogImportDraftSnapshot,
): CatalogImportDiff {
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

  return buildCatalogImportDiff(payload, snapshot);
}

export function collectCatalogImportValidationDiagnostics(
  payload: CatalogImportPayload,
  snapshot: CatalogImportDraftSnapshot,
): ParserDiagnostic[] {
  const diagnostics: ParserDiagnostic[] = [];

  if (snapshot.status !== 'draft') {
    diagnostics.push({
      field: 'versionId',
      code: 'DRAFT_NOT_EDITABLE',
      message: 'นำเข้าได้เฉพาะเวอร์ชันที่เป็นฉบับร่าง',
    });
  }

  if (!snapshot.currentVersionId || snapshot.basedOnVersionId !== snapshot.currentVersionId) {
    diagnostics.push({
      field: 'versionId',
      code: 'DRAFT_BASE_STALE',
      message: 'ฉบับร่างไม่ได้อ้างอิงเวอร์ชันใช้งานปัจจุบันแล้ว',
    });
  }

  if (snapshot.lockVersion !== payload.expectedLockVersion) {
    diagnostics.push({
      field: 'expectedLockVersion',
      code: 'DRAFT_LOCK_CONFLICT',
      message: 'ฉบับร่างถูกเปลี่ยนแปลงหลังเตรียมข้อมูลตรวจสอบ',
    });
  }

  const rowsByCode = new Map(snapshot.rows.map((row) => [row.itemCode, row]));
  const rowsByIdentity = new Map(snapshot.rows.map((row) => [row.identityId, row]));
  const codeReservations = new Map(
    snapshot.codeReservations.map((row) => [row.itemCode, row.identityId]),
  );
  const categoryIds = new Set(snapshot.categoryIds);
  const codeGroupIds = new Set(snapshot.codeGroupIds);
  const seenIdentityIds = new Set<string>();

  for (const row of payload.rows) {
    diagnostics.push(...validateImportRow({
      row,
      batchPriceAuthority: getBatchPriceAuthority(payload),
      rowsByCode,
      rowsByIdentity,
      codeReservations,
      categoryIds,
      codeGroupIds,
      seenIdentityIds,
    }));
  }

  if (payload.mode === 'full') {
    const activeRows = snapshot.rows.filter((row) => row.isActive);
    const retireCount = activeRows.filter((row) => !seenIdentityIds.has(row.identityId)).length;
    const retireThreshold = Math.max(10, Math.ceil(activeRows.length * 0.02));

    if (
      retireCount >= retireThreshold
      && (
        !payload.retirementApprovalReference
        || payload.retirementConfirmedCount !== retireCount
      )
    ) {
      diagnostics.push({
        field: 'retirementConfirmedCount',
        code: 'IMPORT_RETIREMENT_APPROVAL_REQUIRED',
        message: `การนำเข้าทั้งบัญชีจะยกเลิกใช้ ${retireCount} รายการ ต้องมีหลักฐานอนุมัติและยืนยันจำนวนให้ตรงกัน`,
      });
    }
  }

  return diagnostics;
}

async function loadCatalogImportDraftSnapshot(
  supabase: SupabaseClient,
  payload: CatalogImportPayload,
): Promise<CatalogImportDraftSnapshot> {
  const [versionResult, pointerResult, workspace, codeReservationsResult] = await Promise.all([
    supabase
      .from('price_list_versions')
      .select('id,status,lock_version,based_on_version_id')
      .eq('id', payload.versionId)
      .maybeSingle(),
    supabase
      .from('price_list_default_version')
      .select('version_id')
      .eq('id', true)
      .maybeSingle(),
    loadCatalogVersionWorkspace(supabase, payload.versionId),
    loadCodeReservations(supabase, payload.rows.map(getTargetItemCode).filter(isString)),
  ]);

  if (versionResult.error || !versionResult.data) {
    throw new CatalogImportServerValidationError(
      versionResult.data ? 'INTERNAL_ERROR' : 'DRAFT_NOT_FOUND',
      versionResult.data
        ? 'โหลดฉบับร่างสำหรับตรวจการนำเข้าไม่สำเร็จ'
        : 'ไม่พบฉบับร่างบัญชีราคาที่ระบุ',
    );
  }

  if (
    pointerResult.error
    || workspace.warnings.length > 0
    || workspace.items.length !== workspace.totalItems
    || codeReservationsResult.error
  ) {
    throw new CatalogImportServerValidationError(
      'INTERNAL_ERROR',
      'โหลดรายการ หมวดงาน กลุ่มรหัส หรือทะเบียนรหัสของฉบับร่างได้ไม่ครบ',
    );
  }

  return {
    status: String(versionResult.data.status ?? ''),
    lockVersion: nonnegativeInteger(versionResult.data.lock_version),
    basedOnVersionId: nullableString(versionResult.data.based_on_version_id),
    currentVersionId: nullableString(pointerResult.data?.version_id),
    rows: workspace.items.map((row) => ({
      itemCode: row.itemCode,
      identityId: row.identityId,
      itemName: row.itemName,
      unit: row.unit,
      materialCost: money(row.materialCost),
      laborCost: money(row.laborCost),
      unitCost: money(row.unitCost),
      categoryCode: row.categoryCode,
      categoryId: row.categoryId,
      codeGroupId: row.codeGroupId,
      isActive: row.isActive,
    })),
    codeReservations: rows(codeReservationsResult.data).map((row) => ({
      itemCode: String(row.item_code ?? ''),
      identityId: String(row.identity_id ?? ''),
    })),
    categoryIds: workspace.categories.map((category) => category.id),
    codeGroupIds: workspace.codeGroups.map((group) => group.id),
  };
}

async function loadCodeReservations(
  supabase: SupabaseClient,
  itemCodes: string[],
): Promise<{ data: unknown; error: { message?: string } | null }> {
  const uniqueCodes = [...new Set(itemCodes)];
  if (uniqueCodes.length === 0) return { data: [], error: null };
  const chunks = Array.from(
    { length: Math.ceil(uniqueCodes.length / 100) },
    (_, index) => uniqueCodes.slice(index * 100, (index + 1) * 100),
  );
  const results = await Promise.all(chunks.map((chunk) => supabase
    .from('catalog_item_codes')
    .select('item_code,identity_id')
    .in('item_code', chunk)));
  const failed = results.find((result) => result.error);

  return failed
    ? { data: [], error: failed.error }
    : { data: results.flatMap((result) => rows(result.data)), error: null };
}

function validateImportRow(input: {
  row: CatalogImportRow;
  batchPriceAuthority: string | null;
  rowsByCode: ReadonlyMap<string, CatalogImportDraftRowSnapshot>;
  rowsByIdentity: ReadonlyMap<string, CatalogImportDraftRowSnapshot>;
  codeReservations: ReadonlyMap<string, string>;
  categoryIds: ReadonlySet<string>;
  codeGroupIds: ReadonlySet<string>;
  seenIdentityIds: Set<string>;
}): ParserDiagnostic[] {
  const { row } = input;
  const diagnostics: ParserDiagnostic[] = [];
  const targetItemCode = getTargetItemCode(row);
  const targetIdentityId = getTargetIdentityId(row);
  const categoryId = getCategoryId(row);
  const codeGroupId = getCodeGroupId(row);
  const priceAuthority = row.priceAuthorityReference ?? input.batchPriceAuthority;

  if (categoryId && !input.categoryIds.has(categoryId)) {
    diagnostics.push(rowDiagnostic(
      row,
      'categoryId',
      'CATALOG_AUTHORITY_NOT_FOUND',
      'หมวดงานไม่อยู่ในชุดข้อมูลที่อนุมัติของฉบับร่างนี้',
    ));
  }

  if (codeGroupId && !input.codeGroupIds.has(codeGroupId)) {
    diagnostics.push(rowDiagnostic(
      row,
      'codeGroupId',
      'CATALOG_AUTHORITY_NOT_FOUND',
      'กลุ่มรหัสไม่อยู่ในชุดข้อมูลที่อนุมัติของฉบับร่างนี้',
    ));
  }

  if (row.identityOutcome === 'candidate_add') {
    if (!priceAuthority) {
      diagnostics.push(rowDiagnostic(
        row,
        'priceAuthorityReference',
        'IMPORT_PRICE_AUTHORITY_REQUIRED',
        'รายการใหม่ต้องมีเอกสารอ้างอิงชื่อ หน่วย และราคา',
      ));
    }

    if (!categoryId || !codeGroupId) {
      diagnostics.push(rowDiagnostic(
        row,
        'codeGroupId',
        'CATALOG_AUTHORITY_NOT_FOUND',
        'รายการใหม่ต้องเลือกหมวดงานและกลุ่มรหัสที่อนุมัติไว้',
      ));
    }

    if (targetItemCode && input.codeReservations.has(targetItemCode)) {
      diagnostics.push(rowDiagnostic(
        row,
        'targetItemCode',
        'IMPORT_RECONCILIATION_REQUIRED',
        'รหัสรายการนี้ถูกจัดสรรให้รายการอื่นแล้ว',
      ));
    }

    return diagnostics;
  }

  const existing = targetIdentityId
    ? input.rowsByIdentity.get(targetIdentityId)
    : resolveExistingDraftRow(row, input.rowsByCode);

  if (!existing) {
    diagnostics.push(rowDiagnostic(
      row,
      'targetIdentityId',
      'IMPORT_RECONCILIATION_REQUIRED',
      'จับคู่รายการในฉบับร่างจากตัวตนรายการหรือรหัสที่ระบุไม่ได้',
    ));
    return diagnostics;
  }

  if (input.seenIdentityIds.has(existing.identityId)) {
    diagnostics.push(rowDiagnostic(
      row,
      'targetIdentityId',
      'IMPORT_RECONCILIATION_REQUIRED',
      'ข้อมูลนำเข้าอ้างถึงรายการเดียวกันมากกว่าหนึ่งครั้ง',
    ));
  } else {
    input.seenIdentityIds.add(existing.identityId);
  }

  if (row.identityOutcome === 'retire') return diagnostics;

  if (rowWouldChangeAuthorityFields(row, existing) && !priceAuthority) {
    diagnostics.push(rowDiagnostic(
      row,
      'priceAuthorityReference',
      'IMPORT_PRICE_AUTHORITY_REQUIRED',
      'ชื่อ หน่วย หรือราคาที่ต่างจากฐานต้องมีเอกสารอ้างอิงที่ชัดเจน',
    ));
  }

  if (isBlockedHdpeAsGipCrossing(row)) {
    diagnostics.push(rowDiagnostic(
      row,
      getTargetCodeField(row),
      'IMPORT_RECONCILIATION_REQUIRED',
      'รายการ HDPE Crossing ห้ามใช้กลุ่มรหัส CRS-GIP',
    ));
  }

  const reservedIdentityId = targetItemCode
    ? input.codeReservations.get(targetItemCode)
    : null;
  if (
    targetItemCode
    && targetItemCode !== existing.itemCode
    && reservedIdentityId
    && reservedIdentityId !== existing.identityId
  ) {
    diagnostics.push(rowDiagnostic(
      row,
      'targetItemCode',
      'IMPORT_RECONCILIATION_REQUIRED',
      'รหัสรายการนี้ถูกจัดสรรให้รายการอื่นแล้ว',
    ));
  }

  if (row.identityOutcome === 'retain' && changedFields(row, existing).length > 0) {
    diagnostics.push(rowDiagnostic(
      row,
      'identityOutcome',
      'IMPORT_RECONCILIATION_REQUIRED',
      'รายการที่คงเดิมต้องตรงกับข้อมูลปัจจุบันของฉบับร่างทุกช่อง',
    ));
  }

  return diagnostics;
}

function buildCatalogImportDiff(
  payload: CatalogImportPayload,
  snapshot: CatalogImportDraftSnapshot,
): CatalogImportDiff {
  const rowsByCode = new Map(snapshot.rows.map((row) => [row.itemCode, row]));
  const rowsByIdentity = new Map(snapshot.rows.map((row) => [row.identityId, row]));
  const seenIdentityIds = new Set<string>();
  const diffRows: CatalogImportDiffRow[] = [];

  for (const row of payload.rows) {
    const targetIdentityId = getTargetIdentityId(row);
    const existing = targetIdentityId
      ? rowsByIdentity.get(targetIdentityId)
      : resolveExistingDraftRow(row, rowsByCode);
    const targetItemCode = getTargetItemCode(row);
    const fields = existing ? changedFields(row, existing) : [];
    let action: CatalogImportDiffAction;

    if (row.identityOutcome === 'candidate_add') action = 'add';
    else if (row.identityOutcome === 'retire') action = 'retire';
    else if (targetItemCode && existing && targetItemCode !== existing.itemCode) action = 'recode';
    else if (fields.length > 0) action = 'update';
    else action = 'unchanged';

    if (existing) seenIdentityIds.add(existing.identityId);

    diffRows.push({
      sourceRow: row.sourceRow,
      sourceReference: row.sourceReference,
      sourceItemCode: getSourceItemCode(row),
      identityId: existing?.identityId ?? targetIdentityId,
      beforeItemCode: existing?.itemCode ?? null,
      afterItemCode: action === 'retire' ? existing?.itemCode ?? null : targetItemCode,
      itemName: row.itemName,
      action,
      changedFields: fields,
      priceAuthorityReference:
        row.priceAuthorityReference ?? getBatchPriceAuthority(payload),
      omission: false,
    });
  }

  if (payload.mode === 'full') {
    for (const existing of snapshot.rows) {
      if (existing.isActive && !seenIdentityIds.has(existing.identityId)) {
        diffRows.push({
          sourceRow: null,
          sourceReference: 'full-import-omission',
          sourceItemCode: null,
          identityId: existing.identityId,
          beforeItemCode: existing.itemCode,
          afterItemCode: existing.itemCode,
          itemName: existing.itemName,
          action: 'retire',
          changedFields: ['isActive'],
          priceAuthorityReference: null,
          omission: true,
        });
      }
    }
  }

  const summary = {
    add: 0,
    update: 0,
    recode: 0,
    retire: 0,
    unchanged: 0,
    total: diffRows.length,
    omissions: 0,
    authorityFieldChanges: 0,
  } satisfies CatalogImportDiff['summary'];

  for (const row of diffRows) {
    summary[row.action] += 1;
    if (row.omission) summary.omissions += 1;
    if (row.changedFields.some((field) => AUTHORITY_FIELDS.has(field))) {
      summary.authorityFieldChanges += 1;
    }
  }

  return { rows: diffRows, summary };
}

const AUTHORITY_FIELDS = new Set([
  'itemName',
  'unit',
  'materialCost',
  'laborCost',
  'unitCost',
]);

function changedFields(
  row: CatalogImportRow,
  existing: CatalogImportDraftRowSnapshot,
): string[] {
  const fields: string[] = [];
  if (row.itemName !== existing.itemName) fields.push('itemName');
  if (row.unit !== existing.unit) fields.push('unit');
  if (row.materialCost !== existing.materialCost) fields.push('materialCost');
  if (row.laborCost !== existing.laborCost) fields.push('laborCost');
  if (row.unitCost !== existing.unitCost) fields.push('unitCost');
  if (row.categoryCode !== existing.categoryCode) fields.push('category');
  if (getCodeGroupId(row) !== null && getCodeGroupId(row) !== existing.codeGroupId) {
    fields.push('codeGroup');
  }
  if (getTargetItemCode(row) !== null && getTargetItemCode(row) !== existing.itemCode) {
    fields.push('itemCode');
  }
  return fields;
}

function resolveExistingDraftRow(
  row: CatalogImportRow,
  rowsByCode: ReadonlyMap<string, CatalogImportDraftRowSnapshot>,
): CatalogImportDraftRowSnapshot | undefined {
  if (row.legacyItemCode) {
    const byLegacy = rowsByCode.get(row.legacyItemCode);
    if (byLegacy) return byLegacy;
  }
  const targetItemCode = getTargetItemCode(row);
  return targetItemCode ? rowsByCode.get(targetItemCode) : undefined;
}

function rowWouldChangeAuthorityFields(
  row: CatalogImportRow,
  existing: CatalogImportDraftRowSnapshot,
): boolean {
  return changedFields(row, existing).some((field) => AUTHORITY_FIELDS.has(field));
}

function isBlockedHdpeAsGipCrossing(row: CatalogImportRow): boolean {
  const targetItemCode = getTargetItemCode(row);
  return Boolean(
    targetItemCode
    && HDPE_AS_GIP_CROSSING_PATTERN.test(targetItemCode)
    && row.itemName.toUpperCase().includes('HDPE'),
  );
}

function getTargetItemCode(row: CatalogImportRow): string | null {
  return ('targetItemCode' in row ? row.targetItemCode : row.canonicalCode) ?? null;
}

function getTargetIdentityId(row: CatalogImportRow): string | null {
  return row.targetIdentityId ?? null;
}

function getCategoryId(row: CatalogImportRow): string | null {
  return row.categoryId ?? null;
}

function getCodeGroupId(row: CatalogImportRow): string | null {
  return row.codeGroupId ?? null;
}

function getSourceItemCode(row: CatalogImportRow): string | null {
  return row.sourceItemCode ?? ('canonicalCode' in row ? row.canonicalCode : null);
}

function getTargetCodeField(row: CatalogImportRow): string {
  return 'targetItemCode' in row ? 'targetItemCode' : 'canonicalCode';
}

function getBatchPriceAuthority(payload: CatalogImportPayload): string | null {
  return 'priceAuthorityReference' in payload ? payload.priceAuthorityReference : null;
}

function rowDiagnostic(
  row: CatalogImportRow,
  field: string,
  code: CatalogErrorCode,
  message: string,
): ParserDiagnostic {
  return { row: row.sourceRow, field, code, message };
}

function pickPrimaryErrorCode(diagnostics: ParserDiagnostic[]): CatalogErrorCode {
  const priorities: CatalogErrorCode[] = [
    'DRAFT_NOT_EDITABLE',
    'DRAFT_BASE_STALE',
    'DRAFT_LOCK_CONFLICT',
    'IMPORT_RETIREMENT_APPROVAL_REQUIRED',
    'CATALOG_AUTHORITY_NOT_FOUND',
    'IMPORT_PRICE_AUTHORITY_REQUIRED',
    'IMPORT_RECONCILIATION_REQUIRED',
    'VALIDATION_FAILED',
  ];
  const codes = new Set(diagnostics.map((diagnostic) => diagnostic.code));
  return priorities.find((code) => codes.has(code)) ?? 'VALIDATION_FAILED';
}

function summarizeDiagnostics(code: CatalogErrorCode, diagnostics: ParserDiagnostic[]): string {
  if (code === 'DRAFT_LOCK_CONFLICT') return 'ฉบับร่างถูกเปลี่ยนแปลงหลังเตรียมข้อมูลตรวจสอบ';
  if (code === 'DRAFT_BASE_STALE') return 'ฉบับร่างไม่ได้อ้างอิงเวอร์ชันใช้งานปัจจุบันแล้ว';
  if (code === 'IMPORT_RETIREMENT_APPROVAL_REQUIRED') {
    return 'จำนวนรายการที่จะยกเลิกใช้ต้องมีหลักฐานอนุมัติและยืนยันให้ตรงกัน';
  }
  if (code === 'CATALOG_AUTHORITY_NOT_FOUND') {
    return 'ข้อมูลนำเข้าอ้างถึงหมวดงานหรือกลุ่มรหัสนอกชุดที่อนุมัติของฉบับร่าง';
  }
  if (code === 'IMPORT_PRICE_AUTHORITY_REQUIRED') {
    return 'ข้อมูลนำเข้าต้องมีเอกสารอ้างอิงชื่อ หน่วย หรือราคา';
  }
  if (code === 'IMPORT_RECONCILIATION_REQUIRED') return 'ข้อมูลนำเข้ายังมีรายการที่ต้องตรวจสอบและจับคู่';
  return `ตรวจข้อมูลนำเข้าพบปัญหา ${diagnostics.length} รายการ`;
}

function rows(data: unknown): Record<string, unknown>[] {
  return Array.isArray(data) ? data as Record<string, unknown>[] : [];
}

function nullableString(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value);
  return text.length > 0 ? text : null;
}

function nonnegativeInteger(value: unknown): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

function money(value: number): string {
  return value.toFixed(2);
}

function isString(value: string | null): value is string {
  return value !== null;
}
