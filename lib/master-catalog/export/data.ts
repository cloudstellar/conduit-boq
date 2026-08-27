import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { UserRole } from '../../types/auth';
import {
  CANONICAL_CATALOG_DATASET_ROW_KEYS,
  canonicalizeCatalogDatasetRows,
  hashCanonicalCatalogDatasetRows,
  type CanonicalCatalogDatasetRow,
} from '../hash/canonicalDataset';
import { loadCatalogAdminGateProjection } from '../admin/adminGate';
import {
  loadCurrentAuthorization,
  type AuthorizationSource,
} from '../../auth/authorization';

export const CATALOG_EXPORT_SPEC_REVISION = 'phase4-official-export-spec-2026-06-22';
export const CATALOG_CANONICALIZATION_REVISION = 'phase4-canonical-dataset-v1';
export const CATALOG_EXPORT_DOCUMENT_TITLE =
  'รายการบัญชีราคามาตรฐานงานก่อสร้างท่อร้อยสายสื่อสารใต้ดิน';
export const CATALOG_EXPORT_DEPARTMENT_FOOTER =
  'ส่วนวิศวกรรมท่อร้อยสาย (วทฐฐ.)';
export const CATALOG_EXPORT_APP_NAME = 'Conduit BOQ';
export const CATALOG_EXPORT_ICT_TIME_ZONE = 'Asia/Bangkok';

export function makeCatalogExportDocumentTitle(versionString: string): string {
  return `${CATALOG_EXPORT_DOCUMENT_TITLE} ${makeCatalogExportYearLabel(versionString)}`;
}

export function makeCatalogExportYearLabel(versionString: string): string {
  return `ประจำปี ${catalogYearFromVersion(versionString)}`;
}

export type CatalogExportVersionStatus = 'draft' | 'active' | 'archived' | 'abandoned';

export interface CatalogExportProfile {
  id: string;
  email: string | null;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  displayName: string;
  isActiveAdmin: boolean;
  canReadPublishedCatalog: boolean;
  authorizationSource?: AuthorizationSource;
}

export interface CatalogExportVersion {
  id: string;
  officialVersionString: string | null;
  targetVersionString: string;
  draftReference: string | null;
  name: string;
  status: CatalogExportVersionStatus;
  isDefaultMirror: boolean;
  isCurrentDefault: boolean;
  basedOnVersionId: string | null;
  basedOnVersionString: string | null;
  effectiveDate: string | null;
  approvalReference: string | null;
  approvalDocumentDate: string | null;
  publishedAt: string | null;
  publishedByDisplayName: string | null;
  datasetHash: string | null;
  itemCount: number | null;
  lockVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogExportRow {
  id: string;
  sequence: number;
  identityId: string;
  itemCode: string;
  itemName: string;
  unit: string;
  materialCost: number;
  laborCost: number;
  unitCost: number;
  categoryCode: string | null;
  categoryName: string | null;
  workContextCode: string | null;
  workContextNameTh: string | null;
  workContextNameEn: string | null;
  itemTypeCode: string | null;
  itemTypeNameTh: string | null;
  itemTypeNameEn: string | null;
  isActive: boolean;
  displayOrder: number;
  canonicalRow: CanonicalCatalogDatasetRow;
  canonicalRowJson: string;
}

export interface CatalogExportDictionaryRow {
  workContextCode: string;
  workContextNameTh: string;
  workContextNameEn: string | null;
  itemTypeCode: string;
  itemTypeNameTh: string;
  itemTypeNameEn: string | null;
  itemCount: number;
  note: string;
}

export interface CatalogExportChangeSet {
  id: string;
  importId: string | null;
  changeType: string;
  reason: string;
  actorDisplayName: string;
  beforeLockVersion: number | null;
  afterLockVersion: number | null;
  createdAt: string;
  itemActionCounts: CatalogExportChangeActionCounts;
  importSourceFilename: string | null;
  importSourceFileSha256: string | null;
  importArchiveReference: string | null;
}

export interface CatalogExportChangeActionCounts {
  add: number;
  update: number;
  retire: number;
  recode: number;
}

export interface CatalogExportDataset {
  version: CatalogExportVersion;
  exportedAt: Date;
  exportedAtIso: string;
  exportedDateIsoIct: string;
  exportedBy: CatalogExportProfile;
  rows: CatalogExportRow[];
  dictionaryRows: CatalogExportDictionaryRow[];
  changeSets: CatalogExportChangeSet[];
  changeSummaryScope: 'admin' | 'limited';
  canonicalJson: string;
  canonicalDatasetHash: string;
  counts: {
    rowCount: number;
    activeRows: number;
    inactiveRows: number;
    dictionaryGroups: number;
  };
  isOfficialPublishedExport: boolean;
  isDraftExport: boolean;
}

export class CatalogExportError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status = 500) {
    super(message);
    this.name = 'CatalogExportError';
    this.code = code;
    this.status = status;
  }
}

const VERSION_COLUMNS = [
  'id',
  'version_string',
  'target_version_string',
  'draft_reference',
  'name',
  'status',
  'is_default',
  'based_on_version_id',
  'effective_date',
  'approval_reference',
  'approval_document_date',
  'published_at',
  'published_by_display_name',
  'dataset_hash',
  'item_count',
  'lock_version',
  'created_at',
  'updated_at',
].join(',');

const PRICE_LIST_COLUMNS = [
  'id',
  'identity_id',
  'item_code',
  'item_name',
  'unit',
  'material_cost',
  'labor_cost',
  'unit_cost',
  'category',
  'category_id',
  'code_group_id',
  'is_active',
  'display_order',
].join(',');

const CATEGORY_COLUMNS = 'id,code,name,display_order';
const CODE_GROUP_COLUMNS = [
  'id',
  'work_context_code',
  'work_context_name_th',
  'work_context_name_en',
  'item_type_code',
  'item_type_name_th',
  'item_type_name_en',
  'display_order',
].join(',');
const CHANGE_SET_COLUMNS = [
  'id',
  'version_id',
  'import_id',
  'change_type',
  'reason',
  'actor_display_name',
  'before_lock_version',
  'after_lock_version',
  'created_at',
].join(',');
const IMPORT_COLUMNS = [
  'id',
  'mode',
  'source_filename',
  'source_file_sha256',
  'physical_archive_reference',
  'status',
  'created_at',
  'applied_at',
].join(',');
const CHANGE_ITEM_COLUMNS = 'id,change_set_id,identity_id,action';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const CATALOG_EXPORT_QUERY_PAGE_SIZE = 1000;

type PagedQueryResult = {
  data: unknown;
  error: unknown;
};

type PagedQuery = {
  range: (from: number, to: number) => PromiseLike<PagedQueryResult>;
};

export async function loadCatalogExportDataset(
  supabase: SupabaseClient,
  versionId: string,
): Promise<CatalogExportDataset> {
  if (!UUID_PATTERN.test(versionId)) {
    throw new CatalogExportError(
      'CATALOG_EXPORT_INVALID_VERSION_ID',
      'Catalog version id is invalid',
      400,
    );
  }

  const { user, profile } = await loadExporterProfile(supabase);
  const version = await loadVersion(supabase, versionId);

  await assertExportAccess(supabase, version, user, profile);

  const [currentDefaultVersionId, baseVersionString, rows, categories, codeGroups] =
    await Promise.all([
      loadCurrentDefaultVersionId(supabase),
      version.basedOnVersionId
        ? loadVersionString(supabase, version.basedOnVersionId)
        : Promise.resolve(null),
      loadPriceRows(supabase, version.id),
      loadCategories(supabase, version.id),
      loadCodeGroups(supabase, version.id),
    ]);

  const exportRows = buildExportRows(rows, categories, codeGroups);
  const canonicalRows = exportRows.map((row) => row.canonicalRow);
  const canonicalJson = canonicalizeCatalogDatasetRows(canonicalRows);
  const canonicalDatasetHash = await hashCanonicalCatalogDatasetRows(canonicalRows);
  const orderedCanonicalRows = JSON.parse(canonicalJson) as CanonicalCatalogDatasetRow[];
  const orderedRows = orderExportRowsByCanonicalRows(exportRows, orderedCanonicalRows);
  const dictionaryRows = buildDictionaryRows(orderedRows, codeGroups);

  const versionWithContext: CatalogExportVersion = {
    ...version,
    basedOnVersionString: baseVersionString,
    isCurrentDefault: currentDefaultVersionId === version.id,
  };

  if (isPublishedStatus(version.status)) {
    assertPublishedMetadataMatches(version, orderedRows.length, canonicalDatasetHash);
  }

  const changeSets = profile.isActiveAdmin
    ? await loadChangeSummary(supabase, version.id)
    : [];

  const exportedAt = new Date();

  return {
    version: versionWithContext,
    exportedAt,
    exportedAtIso: exportedAt.toISOString(),
    exportedDateIsoIct: formatIctDateIso(exportedAt),
    exportedBy: profile,
    rows: orderedRows,
    dictionaryRows,
    changeSets,
    changeSummaryScope: profile.isActiveAdmin ? 'admin' : 'limited',
    canonicalJson,
    canonicalDatasetHash,
    counts: {
      rowCount: orderedRows.length,
      activeRows: orderedRows.filter((row) => row.isActive).length,
      inactiveRows: orderedRows.filter((row) => !row.isActive).length,
      dictionaryGroups: dictionaryRows.length,
    },
    isOfficialPublishedExport: isPublishedStatus(version.status),
    isDraftExport: version.status === 'draft',
  };
}

export function makeCatalogExportFilename(
  dataset: CatalogExportDataset,
  extension: 'xlsx' | 'pdf',
): string {
  const dateForFilename = dataset.version.effectiveDate ?? dataset.exportedDateIsoIct;
  const compactDate = sanitizeDateForFilename(dateForFilename);
  const documentVersion = dataset.isDraftExport
    ? dataset.version.targetVersionString
    : dataset.version.officialVersionString;
  if (!documentVersion) {
    throw new CatalogExportError(
      'CATALOG_EXPORT_OFFICIAL_VERSION_MISSING',
      'Published catalog has no official version identifier',
      409,
    );
  }
  const version = sanitizeVersionForFilename(documentVersion);
  let draftReference: string | null = null;
  if (dataset.isDraftExport) {
    if (!dataset.version.draftReference) {
      throw new CatalogExportError(
        'CATALOG_EXPORT_DRAFT_IDENTITY_MISSING',
        'Draft catalog has no immutable draft reference',
        409,
      );
    }
    draftReference = sanitizeVersionForFilename(dataset.version.draftReference);
  }
  const prefix = draftReference ? `DRAFT-${draftReference}-` : '';

  return `${prefix}NT-Master-Catalog-v${version}-${compactDate}.${extension}`;
}

export function verificationSheetHeaders(): string[] {
  return [...CANONICAL_CATALOG_DATASET_ROW_KEYS, '_canonical_row_json'];
}

function assertPublishedMetadataMatches(
  version: CatalogExportVersion,
  rowCount: number,
  canonicalDatasetHash: string,
): void {
  if (!version.datasetHash || !version.itemCount) {
    throw new CatalogExportError(
      'CATALOG_EXPORT_METADATA_INCOMPLETE',
      'Published catalog export metadata is incomplete',
      409,
    );
  }

  if (!version.officialVersionString) {
    throw new CatalogExportError(
      'CATALOG_EXPORT_OFFICIAL_VERSION_MISSING',
      'Published catalog has no official version identifier',
      409,
    );
  }

  if (version.itemCount !== rowCount) {
    throw new CatalogExportError(
      'CATALOG_EXPORT_COUNT_MISMATCH',
      'Published catalog row count no longer matches stored metadata',
      409,
    );
  }

  if (version.datasetHash !== canonicalDatasetHash) {
    throw new CatalogExportError(
      'CATALOG_EXPORT_HASH_MISMATCH',
      'Published catalog dataset hash no longer matches stored metadata',
      409,
    );
  }
}

async function assertExportAccess(
  supabase: SupabaseClient,
  version: CatalogExportVersion,
  _user: User,
  profile: CatalogExportProfile,
): Promise<void> {
  if (version.status === 'draft') {
    if (!version.targetVersionString || !version.draftReference) {
      throw new CatalogExportError(
        'CATALOG_EXPORT_DRAFT_IDENTITY_MISSING',
        'Draft catalog has no immutable target or draft reference',
        409,
      );
    }

    if (!profile.isActiveAdmin) {
      throw new CatalogExportError(
        'CATALOG_EXPORT_FORBIDDEN',
        'Draft catalog exports require an active admin profile',
        403,
      );
    }

    if (profile.authorizationSource !== 'v2') {
      throw new CatalogExportError(
        'CATALOG_EXPORT_FORBIDDEN',
        'Draft catalog exports require the bounded active-admin gate',
        403,
      );
    }

    const gate = await loadCatalogAdminGateProjection(supabase);
    if (!gate.enabled) {
      throw new CatalogExportError(
        'CATALOG_EXPORT_FORBIDDEN',
        'Draft catalog exports require the admin feature gate',
        403,
      );
    }

    return;
  }

  if (!isPublishedStatus(version.status)) {
    throw new CatalogExportError(
      'CATALOG_EXPORT_UNSUPPORTED_STATUS',
      'Catalog version status is not exportable',
      409,
    );
  }

  if (!profile.canReadPublishedCatalog) {
    throw new CatalogExportError(
      'CATALOG_EXPORT_FORBIDDEN',
      'Catalog export requires an active authenticated profile',
      403,
    );
  }
}

async function loadExporterProfile(
  supabase: SupabaseClient,
): Promise<{ user: User; profile: CatalogExportProfile }> {
  const authorization = await loadCurrentAuthorization(supabase);
  if (authorization.state === 'unauthenticated') {
    throw new CatalogExportError(
      'CATALOG_EXPORT_UNAUTHENTICATED',
      'Authentication is required for catalog export',
      401,
    );
  }
  if (authorization.state !== 'active') {
    throw new CatalogExportError(
      'CATALOG_EXPORT_FORBIDDEN',
      'A readable user profile is required for catalog export',
      403,
    );
  }

  const user = authorization.user;
  const data = authorization.profile;

  const firstName = String(data.first_name ?? '');
  const lastName = String(data.last_name ?? '');
  const email = toNullableString(data.email);
  const displayName =
    [firstName, lastName].filter(Boolean).join(' ').trim() ||
    email ||
    'Authenticated user';
  const role = data.role as UserRole;
  const status = data.status as CatalogExportProfile['status'];

  return {
    user,
    profile: {
      id: String(data.id),
      email,
      firstName,
      lastName,
      role,
      status,
      displayName,
      isActiveAdmin: role === 'admin' && status === 'active',
      canReadPublishedCatalog: status === 'active',
      authorizationSource: authorization.source,
    },
  };
}

async function loadVersion(
  supabase: SupabaseClient,
  versionId: string,
): Promise<CatalogExportVersion> {
  const { data, error } = await supabase
    .from('price_list_versions')
    .select(VERSION_COLUMNS)
    .eq('id', versionId)
    .maybeSingle();

  if (error) {
    throw queryError('CATALOG_EXPORT_VERSION_QUERY_FAILED', 'Could not load catalog version');
  }

  if (!data) {
    throw new CatalogExportError(
      'CATALOG_EXPORT_VERSION_NOT_FOUND',
      'Catalog version was not found',
      404,
    );
  }

  const row = data as unknown as Record<string, unknown>;
  const status = (row.status ?? 'draft') as CatalogExportVersionStatus;
  const claimedVersionString = toNullableString(row.version_string);
  const targetVersionString = String(
    row.target_version_string ?? claimedVersionString ?? '',
  );

  return {
    id: String(row.id),
    officialVersionString:
      status === 'active' || status === 'archived' ? claimedVersionString : null,
    targetVersionString,
    draftReference: toNullableString(row.draft_reference),
    name: String(row.name ?? ''),
    status,
    isDefaultMirror: Boolean(row.is_default),
    isCurrentDefault: false,
    basedOnVersionId: toNullableString(row.based_on_version_id),
    basedOnVersionString: null,
    effectiveDate: toIsoDateOrNull(row.effective_date),
    approvalReference: toNullableString(row.approval_reference),
    approvalDocumentDate: toIsoDateOrNull(row.approval_document_date),
    publishedAt: toNullableString(row.published_at),
    publishedByDisplayName: toNullableString(row.published_by_display_name),
    datasetHash: toNullableString(row.dataset_hash),
    itemCount: toNullableNumber(row.item_count),
    lockVersion: toNullableNumber(row.lock_version) ?? 0,
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
  };
}

async function loadVersionString(
  supabase: SupabaseClient,
  versionId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('price_list_versions')
    .select('version_string')
    .eq('id', versionId)
    .maybeSingle();

  if (error) {
    throw queryError(
      'CATALOG_EXPORT_BASE_VERSION_QUERY_FAILED',
      'Could not load base catalog version',
    );
  }

  return toNullableString(data?.version_string);
}

async function loadCurrentDefaultVersionId(supabase: SupabaseClient): Promise<string | null> {
  const { data, error } = await supabase
    .from('price_list_default_version')
    .select('version_id')
    .eq('id', true)
    .maybeSingle();

  if (error) {
    throw queryError(
      'CATALOG_EXPORT_DEFAULT_QUERY_FAILED',
      'Could not load current default catalog pointer',
    );
  }

  return toNullableString(data?.version_id);
}

async function loadPriceRows(
  supabase: SupabaseClient,
  versionId: string,
): Promise<Record<string, unknown>[]> {
  return loadPagedRows(
    () => supabase
      .from('price_list')
      .select(PRICE_LIST_COLUMNS)
      .eq('version_id', versionId)
      .order('item_code', { ascending: true })
      .order('identity_id', { ascending: true }) as unknown as PagedQuery,
    'CATALOG_EXPORT_ROWS_QUERY_FAILED',
    'Could not load catalog rows',
  );
}

async function loadCategories(
  supabase: SupabaseClient,
  versionId: string,
): Promise<Map<string, Record<string, unknown>>> {
  const rows = await loadPagedRows(
    () => supabase
      .from('price_list_categories')
      .select(CATEGORY_COLUMNS)
      .eq('version_id', versionId)
      .order('display_order', { ascending: true })
      .order('id', { ascending: true }) as unknown as PagedQuery,
    'CATALOG_EXPORT_CATEGORIES_QUERY_FAILED',
    'Could not load catalog categories',
  );

  return new Map(rows.map((row) => [String(row.id), row]));
}

async function loadCodeGroups(
  supabase: SupabaseClient,
  versionId: string,
): Promise<Map<string, Record<string, unknown>>> {
  const rows = await loadPagedRows(
    () => supabase
      .from('catalog_code_groups')
      .select(CODE_GROUP_COLUMNS)
      .eq('version_id', versionId)
      .order('display_order', { ascending: true })
      .order('id', { ascending: true }) as unknown as PagedQuery,
    'CATALOG_EXPORT_CODE_GROUPS_QUERY_FAILED',
    'Could not load catalog code groups',
  );

  return new Map(rows.map((row) => [String(row.id), row]));
}

async function loadChangeSummary(
  supabase: SupabaseClient,
  versionId: string,
): Promise<CatalogExportChangeSet[]> {
  const [changeSetRows, importRows] = await Promise.all([
    loadPagedRows(
      () => supabase
        .from('catalog_change_sets')
        .select(CHANGE_SET_COLUMNS)
        .eq('version_id', versionId)
        .order('created_at', { ascending: true })
        .order('id', { ascending: true }) as unknown as PagedQuery,
      'CATALOG_EXPORT_CHANGE_SUMMARY_QUERY_FAILED',
      'Could not load catalog change summary',
    ),
    loadPagedRows(
      () => supabase
        .from('catalog_imports')
        .select(IMPORT_COLUMNS)
        .eq('version_id', versionId)
        .order('created_at', { ascending: true })
        .order('id', { ascending: true }) as unknown as PagedQuery,
      'CATALOG_EXPORT_CHANGE_SUMMARY_QUERY_FAILED',
      'Could not load catalog change summary',
    ),
  ]);

  const changeItemCounts = await loadChangeItemCounts(
    supabase,
    changeSetRows.map((row) => String(row.id)),
  );
  const importsById = new Map(importRows.map((row) => [String(row.id), row]));

  return changeSetRows.map((row) => {
    const importId = toNullableString(row.import_id);
    const importRow = importId ? importsById.get(importId) : null;

    return {
      id: String(row.id),
      importId,
      changeType: String(row.change_type ?? ''),
      reason: String(row.reason ?? ''),
      actorDisplayName: String(row.actor_display_name ?? ''),
      beforeLockVersion: toNullableNumber(row.before_lock_version),
      afterLockVersion: toNullableNumber(row.after_lock_version),
      createdAt: String(row.created_at ?? ''),
      itemActionCounts: changeItemCounts.get(String(row.id)) ?? emptyActionCounts(),
      importSourceFilename: importRow ? toNullableString(importRow.source_filename) : null,
      importSourceFileSha256: importRow ? toNullableString(importRow.source_file_sha256) : null,
      importArchiveReference: importRow ? toNullableString(importRow.physical_archive_reference) : null,
    };
  });
}

async function loadChangeItemCounts(
  supabase: SupabaseClient,
  changeSetIds: string[],
): Promise<Map<string, CatalogExportChangeActionCounts>> {
  if (changeSetIds.length === 0) {
    return new Map();
  }

  const rows = await loadPagedRows(
    () => supabase
      .from('catalog_change_items')
      .select(CHANGE_ITEM_COLUMNS)
      .in('change_set_id', changeSetIds)
      .order('change_set_id', { ascending: true })
      .order('identity_id', { ascending: true })
      .order('id', { ascending: true }) as unknown as PagedQuery,
    'CATALOG_EXPORT_CHANGE_ITEMS_QUERY_FAILED',
    'Could not load catalog change item counts',
  );

  const counts = new Map<string, CatalogExportChangeActionCounts>();

  for (const row of rows) {
    const changeSetId = String(row.change_set_id ?? '');
    const action = String(row.action ?? '');
    const current = counts.get(changeSetId) ?? emptyActionCounts();

    if (action === 'add' || action === 'update' || action === 'retire' || action === 'recode') {
      current[action] += 1;
    }

    counts.set(changeSetId, current);
  }

  return counts;
}

async function loadPagedRows(
  buildQuery: () => PagedQuery,
  errorCode: string,
  errorMessage: string,
): Promise<Record<string, unknown>[]> {
  const rows: Record<string, unknown>[] = [];

  for (let from = 0; ; from += CATALOG_EXPORT_QUERY_PAGE_SIZE) {
    const to = from + CATALOG_EXPORT_QUERY_PAGE_SIZE - 1;
    const { data, error } = await buildQuery().range(from, to);

    if (error) {
      throw queryError(errorCode, errorMessage);
    }

    const pageRows = rowsFromResult(data);
    rows.push(...pageRows);

    if (pageRows.length < CATALOG_EXPORT_QUERY_PAGE_SIZE) {
      return rows;
    }
  }
}

function emptyActionCounts(): CatalogExportChangeActionCounts {
  return { add: 0, update: 0, retire: 0, recode: 0 };
}

function buildExportRows(
  rows: Record<string, unknown>[],
  categories: ReadonlyMap<string, Record<string, unknown>>,
  codeGroups: ReadonlyMap<string, Record<string, unknown>>,
): CatalogExportRow[] {
  return rows.map((row) => {
    const category = getMapRow(categories, row.category_id);
    const codeGroup = getMapRow(codeGroups, row.code_group_id);
    const identityId = requiredString(row.identity_id, 'identity_id');
    const itemCode = requiredString(row.item_code, 'item_code');
    const itemName = requiredString(row.item_name, 'item_name');
    const unit = requiredString(row.unit, 'unit');
    const materialCostText = moneyText(row.material_cost, 'material_cost');
    const laborCostText = moneyText(row.labor_cost, 'labor_cost');
    const unitCostText = moneyText(row.unit_cost, 'unit_cost');
    const displayOrder = requiredInteger(row.display_order, 'display_order');
    const categoryCode = category ? toNullableString(category.code) : null;
    const categoryName = category ? toNullableString(category.name) : null;
    const workContextCode = codeGroup ? toNullableString(codeGroup.work_context_code) : null;
    const workContextNameTh = codeGroup ? toNullableString(codeGroup.work_context_name_th) : null;
    const itemTypeCode = codeGroup ? toNullableString(codeGroup.item_type_code) : null;
    const itemTypeNameTh = codeGroup ? toNullableString(codeGroup.item_type_name_th) : null;
    const isActive = Boolean(row.is_active);
    const canonicalRow: CanonicalCatalogDatasetRow = {
      identity_id: identityId,
      item_code: itemCode,
      item_name: itemName,
      unit,
      material_cost: materialCostText,
      labor_cost: laborCostText,
      unit_cost: unitCostText,
      category_code: categoryCode,
      category_name: categoryName,
      work_context_code: workContextCode,
      work_context_name_th: workContextNameTh,
      item_type_code: itemTypeCode,
      item_type_name_th: itemTypeNameTh,
      is_active: isActive,
      display_order: displayOrder,
    };

    return {
      id: String(row.id),
      sequence: displayOrder + 1,
      identityId,
      itemCode,
      itemName,
      unit,
      materialCost: Number(materialCostText),
      laborCost: Number(laborCostText),
      unitCost: Number(unitCostText),
      categoryCode,
      categoryName,
      workContextCode,
      workContextNameTh,
      workContextNameEn: codeGroup ? toNullableString(codeGroup.work_context_name_en) : null,
      itemTypeCode,
      itemTypeNameTh,
      itemTypeNameEn: codeGroup ? toNullableString(codeGroup.item_type_name_en) : null,
      isActive,
      displayOrder,
      canonicalRow,
      canonicalRowJson: '',
    };
  });
}

function orderExportRowsByCanonicalRows(
  rows: CatalogExportRow[],
  orderedCanonicalRows: CanonicalCatalogDatasetRow[],
): CatalogExportRow[] {
  const rowsByCanonicalKey = new Map(
    rows.map((row) => [canonicalRowKey(row.canonicalRow), row]),
  );

  return orderedCanonicalRows.map((canonicalRow) => {
    const row = rowsByCanonicalKey.get(canonicalRowKey(canonicalRow));
    if (!row) {
      throw new CatalogExportError(
        'CATALOG_EXPORT_CANONICAL_ROW_MISSING',
        'A canonical catalog row could not be mapped back to source data',
        500,
      );
    }

    return {
      ...row,
      sequence: row.displayOrder + 1,
      canonicalRow,
      canonicalRowJson: JSON.stringify(canonicalRow),
    };
  });
}

function buildDictionaryRows(
  rows: readonly CatalogExportRow[],
  codeGroups: ReadonlyMap<string, Record<string, unknown>>,
): CatalogExportDictionaryRow[] {
  const itemCountByCodeGroup = new Map<string, number>();

  for (const row of rows) {
    if (!row.workContextCode || !row.itemTypeCode) continue;
    const key = `${row.workContextCode}:${row.itemTypeCode}`;
    itemCountByCodeGroup.set(key, (itemCountByCodeGroup.get(key) ?? 0) + 1);
  }

  return [...codeGroups.values()]
    .map((group) => {
      const workContextCode = String(group.work_context_code ?? '');
      const itemTypeCode = String(group.item_type_code ?? '');
      const key = `${workContextCode}:${itemTypeCode}`;

      return {
        workContextCode,
        workContextNameTh: String(group.work_context_name_th ?? ''),
        workContextNameEn: toNullableString(group.work_context_name_en),
        itemTypeCode,
        itemTypeNameTh: String(group.item_type_name_th ?? ''),
        itemTypeNameEn: toNullableString(group.item_type_name_en),
        itemCount: itemCountByCodeGroup.get(key) ?? 0,
        note: '',
      };
    })
    .sort((left, right) => {
      const context = left.workContextCode.localeCompare(right.workContextCode, 'en');
      return context === 0
        ? left.itemTypeCode.localeCompare(right.itemTypeCode, 'en')
        : context;
    });
}

function isPublishedStatus(status: CatalogExportVersionStatus): boolean {
  return status === 'active' || status === 'archived';
}

function getMapRow(
  rows: ReadonlyMap<string, Record<string, unknown>>,
  id: unknown,
): Record<string, unknown> | null {
  if (id == null) return null;
  return rows.get(String(id)) ?? null;
}

function requiredString(value: unknown, field: string): string {
  const text = toNullableString(value);
  if (!text) {
    throw new CatalogExportError(
      'CATALOG_EXPORT_INVALID_ROW',
      `Catalog row is missing required field ${field}`,
      409,
    );
  }
  return text;
}

function requiredInteger(value: unknown, field: string): number {
  const number = toNullableNumber(value);
  if (number == null || !Number.isInteger(number) || number < 0) {
    throw new CatalogExportError(
      'CATALOG_EXPORT_INVALID_ROW',
      `Catalog row has invalid integer field ${field}`,
      409,
    );
  }
  return number;
}

function moneyText(value: unknown, field: string): string {
  const number = toNullableNumber(value);
  if (number == null || !Number.isFinite(number) || number < 0) {
    throw new CatalogExportError(
      'CATALOG_EXPORT_INVALID_ROW',
      `Catalog row has invalid money field ${field}`,
      409,
    );
  }

  return number.toFixed(2);
}

function canonicalRowKey(row: CanonicalCatalogDatasetRow): string {
  return `${row.item_code}\u0000${row.identity_id}`;
}

function rowsFromResult(data: unknown): Record<string, unknown>[] {
  return Array.isArray(data) ? (data as Record<string, unknown>[]) : [];
}

function toNullableString(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value);
  return text.length > 0 ? text : null;
}

function toNullableNumber(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toIsoDateOrNull(value: unknown): string | null {
  const text = toNullableString(value);
  if (!text) return null;
  const isoDate = text.slice(0, 10);
  return DATE_PATTERN.test(isoDate) ? isoDate : null;
}

function sanitizeVersionForFilename(value: string): string {
  return value.replace(/[^0-9A-Za-z._-]/g, '');
}

function sanitizeDateForFilename(value: string): string {
  return value.slice(0, 10).replace(/[^0-9]/g, '');
}

function catalogYearFromVersion(versionString: string): string {
  const [year] = versionString.split('.');
  return /^\d{4}$/.test(year) ? year : versionString;
}

function formatIctDateIso(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CATALOG_EXPORT_ICT_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function queryError(code: string, message: string): CatalogExportError {
  return new CatalogExportError(code, message, 500);
}
