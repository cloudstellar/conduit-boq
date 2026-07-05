import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { SupabaseClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import type { CatalogImportIdentityOutcome, ParseContext } from '@/lib/master-catalog/import/types';

export interface CatalogImportDraftOption {
  id: string;
  versionString: string;
  status: string;
  lockVersion: number;
}

export interface CatalogImportEvidenceCounts {
  totalRecords: number;
  productionRows: number;
  workbookRows: number;
  exactPriceMatches: number;
  priceDifferences: number;
  productionOnlyRows: number;
  workbookOnlyRows: number;
  hdpeCrossingConflicts: number;
}

export interface CatalogImportContextModel {
  draft: CatalogImportDraftOption | null;
  parseContext: ParseContext;
  evidenceCounts: CatalogImportEvidenceCounts;
  warnings: string[];
}

type ReconciliationRow = Record<string, string | number | boolean | null | undefined>;

const RECONCILIATION_CSV_PATH = join(
  process.cwd(),
  'docs/plans/master-catalog/evidence/phase4-reconciliation-draft.csv',
);

export async function loadCatalogImportContext(
  supabase: SupabaseClient,
): Promise<CatalogImportContextModel> {
  const warnings: string[] = [];
  const [draft, reconciliationRows] = await Promise.all([
    loadPhase4Draft(supabase, warnings),
    Promise.resolve(readReconciliationRows(warnings)),
  ]);

  if (!draft) {
    return {
      draft,
      parseContext: {},
      evidenceCounts: countReconciliationRows(reconciliationRows),
      warnings,
    };
  }

  const draftRowsByLegacyCode = await loadDraftRowsByLegacyCode(supabase, draft.id, warnings);
  const parseContext = buildParseContext(reconciliationRows, draftRowsByLegacyCode);

  return {
    draft,
    parseContext,
    evidenceCounts: countReconciliationRows(reconciliationRows),
    warnings,
  };
}

async function loadPhase4Draft(
  supabase: SupabaseClient,
  warnings: string[],
): Promise<CatalogImportDraftOption | null> {
  const { data, error } = await supabase
    .from('price_list_versions')
    .select('id,version_string,status,lock_version')
    .eq('version_string', '2568.1.0')
    .eq('status', 'draft')
    .maybeSingle();

  if (error) {
    warnings.push('โหลด draft 2568.1.0 สำหรับ import ไม่สำเร็จ');
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    id: String(data.id),
    versionString: String(data.version_string ?? ''),
    status: String(data.status ?? ''),
    lockVersion: toNonnegativeInteger(data.lock_version),
  };
}

async function loadDraftRowsByLegacyCode(
  supabase: SupabaseClient,
  versionId: string,
  warnings: string[],
): Promise<Map<string, { categoryCode: string | null }>> {
  const { data, error } = await supabase
    .from('price_list')
    .select('item_code,category')
    .eq('version_id', versionId);

  if (error) {
    warnings.push('โหลด draft rows สำหรับ import context ไม่สำเร็จ');
    return new Map();
  }

  return new Map(
    rowsFromResult(data).map((row) => [
      String(row.item_code ?? ''),
      { categoryCode: toNullableString(row.category) },
    ]),
  );
}

function readReconciliationRows(warnings: string[]): ReconciliationRow[] {
  try {
    const workbook = XLSX.read(readFileSync(RECONCILIATION_CSV_PATH), { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      warnings.push('ไม่พบ sheet ใน reconciliation CSV');
      return [];
    }

    return XLSX.utils.sheet_to_json<ReconciliationRow>(
      workbook.Sheets[firstSheetName],
      { defval: '' },
    );
  } catch {
    warnings.push('อ่าน reconciliation CSV สำหรับ import context ไม่สำเร็จ');
    return [];
  }
}

function buildParseContext(
  rows: ReconciliationRow[],
  draftRowsByLegacyCode: ReadonlyMap<string, { categoryCode: string | null }>,
): ParseContext {
  const legacyItemCodeByCanonicalCode: Record<string, string> = {};
  const categoryCodeByCanonicalCode: Record<string, string> = {};
  const identityOutcomeByCanonicalCode: Record<string, CatalogImportIdentityOutcome> = {};
  const categoryCodesByGroup = new Map<string, Set<string>>();

  for (const row of rows) {
    const canonicalCode = text(row.canonical_code_candidate);
    const legacyItemCode = text(row.legacy_item_code);
    const recordScope = text(row.record_scope);

    if (!canonicalCode) {
      continue;
    }

    if (recordScope === 'workbook_candidate') {
      identityOutcomeByCanonicalCode[canonicalCode] = 'candidate_add';
      continue;
    }

    if (!legacyItemCode) {
      continue;
    }

    const draftRow = draftRowsByLegacyCode.get(legacyItemCode);
    const categoryCode = draftRow?.categoryCode;

    legacyItemCodeByCanonicalCode[canonicalCode] = legacyItemCode;
    identityOutcomeByCanonicalCode[canonicalCode] =
      text(row.identity_outcome) === 'retain' ? 'retain' : 'recode';

    if (categoryCode) {
      categoryCodeByCanonicalCode[canonicalCode] = categoryCode;
      const group = canonicalCode.slice(0, 7);
      const categories = categoryCodesByGroup.get(group) ?? new Set<string>();
      categories.add(categoryCode);
      categoryCodesByGroup.set(group, categories);
    }
  }

  const categoryCodeByGroup = Object.fromEntries(
    [...categoryCodesByGroup.entries()]
      .filter(([, categories]) => categories.size === 1)
      .map(([group, categories]) => [group, [...categories][0]]),
  );

  return {
    legacyItemCodeByCanonicalCode,
    categoryCodeByCanonicalCode,
    categoryCodeByGroup,
    identityOutcomeByCanonicalCode,
    priceAuthorityReferenceByCanonicalCode: {},
  };
}

function countReconciliationRows(rows: ReconciliationRow[]): CatalogImportEvidenceCounts {
  return {
    totalRecords: rows.length,
    productionRows: rows.filter((row) => text(row.record_scope) === 'production').length,
    workbookRows: rows.filter((row) => text(row.record_scope) === 'workbook_candidate').length,
    exactPriceMatches: rows.filter((row) => text(row.match_status) === 'name_unit_price_exact').length,
    priceDifferences: rows.filter((row) => text(row.match_status) === 'name_unit_match_price_diff').length,
    productionOnlyRows: rows.filter((row) => text(row.match_status) === 'production_only').length,
    workbookOnlyRows: rows.filter((row) => text(row.match_status) === 'workbook_only').length,
    hdpeCrossingConflicts: rows.filter((row) => text(row.taxonomy_status) === 'hdpe_coded_as_gip_conflict').length,
  };
}

function rowsFromResult(data: unknown): Record<string, unknown>[] {
  return Array.isArray(data) ? data as Record<string, unknown>[] : [];
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : String(value ?? '').trim();
}

function toNullableString(value: unknown): string | null {
  const valueText = text(value);
  return valueText.length > 0 ? valueText : null;
}

function toNonnegativeInteger(value: unknown): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}
