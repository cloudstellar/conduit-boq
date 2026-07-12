import type { SupabaseClient } from '@supabase/supabase-js';
import {
  loadCatalogVersionWorkspace,
  type CatalogWorkspaceItem,
} from './catalogWorkspace';
import {
  loadCatalogCapabilityFlags,
  type CatalogCapabilityFlags,
} from './capabilities';
import type {
  CatalogImportAuthoritativeRow,
  CatalogImportIdentityOutcome,
  ParseContext,
} from '@/lib/master-catalog/import/types';

export interface CatalogImportDraftOption {
  id: string;
  versionString: string;
  status: string;
  lockVersion: number;
  basedOnVersionId: string | null;
  isCurrentBase: boolean;
}

export interface CatalogImportEvidenceCounts {
  mappings: number;
  workbookMatchedRows: number;
  productionOnlyRows: number;
  deferredWorkbookRows: number;
  recodeRows: number;
  retainedRows: number;
  codeGroups: number;
}

export interface CatalogImportContextModel {
  drafts: CatalogImportDraftOption[];
  draft: CatalogImportDraftOption | null;
  parseContext: ParseContext;
  evidenceCounts: CatalogImportEvidenceCounts;
  authorityReady: boolean;
  capabilities: CatalogCapabilityFlags;
  warnings: string[];
}

type MappingRow = {
  identity_id: unknown;
  legacy_item_code: unknown;
  source_item_code: unknown;
  target_item_code: unknown;
  identity_outcome: unknown;
  work_context_code: unknown;
  item_type_code: unknown;
};

const EMPTY_COUNTS: CatalogImportEvidenceCounts = {
  mappings: 0,
  workbookMatchedRows: 0,
  productionOnlyRows: 0,
  deferredWorkbookRows: 0,
  recodeRows: 0,
  retainedRows: 0,
  codeGroups: 0,
};

export async function loadCatalogImportContext(
  supabase: SupabaseClient,
  selectedDraftId?: string,
): Promise<CatalogImportContextModel> {
  const warnings: string[] = [];
  const [pointerResult, draftsResult, capabilityResult] = await Promise.all([
    supabase
      .from('price_list_default_version')
      .select('version_id')
      .eq('id', true)
      .maybeSingle(),
    supabase
      .from('price_list_versions')
      .select('id,version_string,status,lock_version,based_on_version_id,created_at')
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false }),
    loadCatalogCapabilityFlags(supabase),
  ]);

  if (pointerResult.error || !pointerResult.data?.version_id) {
    warnings.push('โหลดเวอร์ชันใช้งานปัจจุบันสำหรับตรวจฐานของฉบับร่างไม่สำเร็จ');
  }
  if (draftsResult.error) {
    warnings.push('โหลดทะเบียนฉบับร่างไม่สำเร็จ');
  }
  if (capabilityResult.warning) warnings.push(capabilityResult.warning);

  const currentVersionId = nullableString(pointerResult.data?.version_id);
  const drafts = rows(draftsResult.data).map((row) => {
    const basedOnVersionId = nullableString(row.based_on_version_id);
    return {
      id: String(row.id ?? ''),
      versionString: String(row.version_string ?? ''),
      status: String(row.status ?? ''),
      lockVersion: nonnegativeInteger(row.lock_version),
      basedOnVersionId,
      isCurrentBase: currentVersionId !== null && basedOnVersionId === currentVersionId,
    };
  });
  const draft = selectedDraftId
    ? drafts.find((candidate) => candidate.id === selectedDraftId) ?? null
    : null;

  if (selectedDraftId && !draft) {
    warnings.push('ไม่พบฉบับร่างที่ระบุในทะเบียนปัจจุบัน');
  }

  if (!draft) {
    return {
      drafts,
      draft: null,
      parseContext: {},
      evidenceCounts: EMPTY_COUNTS,
      authorityReady: false,
      capabilities: capabilityResult.flags,
      warnings,
    };
  }

  if (!draft.isCurrentBase) {
    warnings.push('ฉบับร่างนี้อ้างอิงฐานเก่า จึงเปิดดูได้อย่างเดียวและห้ามสร้างการนำเข้าใหม่');
    return {
      drafts,
      draft,
      parseContext: {},
      evidenceCounts: EMPTY_COUNTS,
      authorityReady: false,
      capabilities: capabilityResult.flags,
      warnings,
    };
  }

  const [mappingResult, exclusionResult, workspace] = await Promise.all([
    supabase
      .from('catalog_first_rollout_mappings')
      .select('identity_id,legacy_item_code,source_item_code,target_item_code,identity_outcome,work_context_code,item_type_code')
      .order('legacy_item_code', { ascending: true }),
    supabase
      .from('catalog_first_rollout_source_exclusions')
      .select('source_item_code')
      .order('source_item_code', { ascending: true }),
    loadCatalogVersionWorkspace(supabase, draft.id),
  ]);

  warnings.push(...workspace.warnings);
  if (mappingResult.error) warnings.push('โหลดชุดจับคู่ที่รับรองสำหรับรอบเผยแพร่แรกไม่สำเร็จ');
  if (exclusionResult.error) warnings.push('โหลดรายการจากไฟล์ต้นทางที่เลื่อนไปรอบถัดไปไม่สำเร็จ');

  const mappings = rows(mappingResult.data) as MappingRow[];
  const exclusions = rows(exclusionResult.data)
    .map((row) => String(row.source_item_code ?? ''))
    .filter(Boolean);
  const itemByIdentity = new Map(
    workspace.items.map((item) => [item.identityId, item]),
  );
  const groupByKey = new Map(
    workspace.codeGroups.map((group) => [
      `${group.workContextCode}-${group.itemTypeCode}`,
      group,
    ]),
  );
  const categoryIdByCode = Object.fromEntries(
    workspace.categories.map((category) => [category.code, category.id]),
  );
  const codeGroupIdByGroup = Object.fromEntries(
    workspace.codeGroups.map((group) => [
      `${group.workContextCode}-${group.itemTypeCode}`,
      group.id,
    ]),
  );
  const authoritativeRowBySourceCode: Record<string, CatalogImportAuthoritativeRow> = {};
  const supplementalRows: CatalogImportAuthoritativeRow[] = [];
  const categoryCodesByGroup = new Map<string, Set<string>>();
  let unresolvedMappings = 0;

  for (const mapping of mappings) {
    const identityId = String(mapping.identity_id ?? '');
    const item = itemByIdentity.get(identityId);
    const legacyItemCode = String(mapping.legacy_item_code ?? '');
    const sourceItemCode = nullableString(mapping.source_item_code);
    const targetItemCode = String(mapping.target_item_code ?? '');
    const identityOutcome = mapping.identity_outcome === 'retain' ? 'retain' : 'recode';
    const workContextCode = nullableString(mapping.work_context_code);
    const itemTypeCode = nullableString(mapping.item_type_code);
    const group = workContextCode && itemTypeCode
      ? groupByKey.get(`${workContextCode}-${itemTypeCode}`)
      : null;

    if (!item || (identityOutcome === 'recode' && !group)) {
      unresolvedMappings += 1;
      continue;
    }

    const authorityRow = buildAuthorityRow({
      item,
      identityId,
      legacyItemCode,
      sourceItemCode: sourceItemCode ?? legacyItemCode,
      targetItemCode,
      identityOutcome,
      workContextCode: workContextCode ?? 'LEG',
      workContextNameTh: group?.workContextNameTh ?? 'คงรหัสเดิมตามข้อยกเว้น',
      itemTypeCode: itemTypeCode ?? 'LEG',
      itemTypeNameTh: group?.itemTypeNameTh ?? 'คงรหัสเดิมตามข้อยกเว้น',
      codeGroupId: group?.id ?? null,
    });

    if (sourceItemCode) {
      authoritativeRowBySourceCode[sourceItemCode] = authorityRow;
    } else {
      supplementalRows.push(authorityRow);
    }

    if (group) {
      const groupKey = `${group.workContextCode}-${group.itemTypeCode}`;
      const categories = categoryCodesByGroup.get(groupKey) ?? new Set<string>();
      categories.add(item.categoryCode);
      categoryCodesByGroup.set(groupKey, categories);
    }
  }

  if (unresolvedMappings > 0) {
    warnings.push(`ชุดจับคู่ที่รับรองหาอำนาจข้อมูลของฉบับร่างไม่ครบ ${unresolvedMappings.toLocaleString('th-TH')} รายการ`);
  }

  const evidenceCounts: CatalogImportEvidenceCounts = {
    mappings: mappings.length,
    workbookMatchedRows: Object.keys(authoritativeRowBySourceCode).length,
    productionOnlyRows: supplementalRows.length,
    deferredWorkbookRows: exclusions.length,
    recodeRows: mappings.filter((row) => row.identity_outcome === 'recode').length,
    retainedRows: mappings.filter((row) => row.identity_outcome === 'retain').length,
    codeGroups: workspace.codeGroups.length,
  };
  const authorityReady =
    mappings.length === 710
    && exclusions.length === 17
    && workspace.codeGroups.length === 65
    && workspace.items.length === workspace.totalItems
    && unresolvedMappings === 0;

  if (!authorityReady) {
    warnings.push('ข้อมูลอ้างอิงรอบเผยแพร่แรกยังไม่ครบ 710 รายการ / 65 กลุ่มรหัส / 17 รายการเลื่อนออก');
  }

  const categoryCodeByGroup = Object.fromEntries(
    [...categoryCodesByGroup.entries()]
      .filter(([, categories]) => categories.size === 1)
      .map(([groupKey, categories]) => [groupKey, [...categories][0]]),
  );

  return {
    drafts,
    draft,
    parseContext: {
      authoritativeRowBySourceCode,
      sourceExclusionCodes: exclusions,
      supplementalRows,
      categoryCodeByGroup,
      categoryIdByCode,
      codeGroupIdByGroup,
      priceAuthorityReferenceByCanonicalCode: {},
    },
    evidenceCounts,
    authorityReady,
    capabilities: capabilityResult.flags,
    warnings,
  };
}

function buildAuthorityRow(input: {
  item: CatalogWorkspaceItem;
  identityId: string;
  legacyItemCode: string;
  sourceItemCode: string;
  targetItemCode: string;
  identityOutcome: CatalogImportIdentityOutcome;
  workContextCode: string;
  workContextNameTh: string;
  itemTypeCode: string;
  itemTypeNameTh: string;
  codeGroupId: string | null;
}): CatalogImportAuthoritativeRow {
  return {
    sourceRow: input.item.displayOrder + 1,
    sourceReference: `production:${input.legacyItemCode}`,
    sourceItemCode: input.sourceItemCode,
    legacyItemCode: input.legacyItemCode,
    canonicalCode: input.targetItemCode,
    targetIdentityId: input.identityId,
    workContextCode: input.workContextCode,
    workContextNameTh: input.workContextNameTh,
    itemTypeCode: input.itemTypeCode,
    itemTypeNameTh: input.itemTypeNameTh,
    itemName: input.item.itemName,
    unit: input.item.unit,
    materialCost: money(input.item.materialCost),
    laborCost: money(input.item.laborCost),
    unitCost: money(input.item.unitCost),
    categoryCode: input.item.categoryCode,
    categoryId: input.item.categoryId,
    codeGroupId: input.codeGroupId,
    identityOutcome: input.identityOutcome,
    priceAuthorityReference: null,
  };
}

function rows(data: unknown): Record<string, unknown>[] {
  return Array.isArray(data) ? data as Record<string, unknown>[] : [];
}

function nullableString(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function nonnegativeInteger(value: unknown): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

function money(value: number): string {
  return value.toFixed(2);
}
