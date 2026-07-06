import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserRole } from '@/lib/types/auth';
import { isCatalogAdminEnabled } from './flags';

export { isCatalogAdminEnabled } from './flags';

export type CatalogAdminSection = 'overview' | 'versions' | 'import' | 'history';
export type CatalogVersionStatus = 'draft' | 'active' | 'archived';
export type CatalogImportStatus = 'validated' | 'applied' | 'rejected';
export type CatalogChangeType = 'clone' | 'import' | 'manual' | 'publish' | 'restore';

export interface CatalogAdminProfile {
  id: string;
  email: string | null;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
}

export type CatalogAdminGate =
  | { state: 'unauthenticated' }
  | { state: 'forbidden'; profile: CatalogAdminProfile | null }
  | { state: 'disabled'; profile: CatalogAdminProfile; flagIssue: string | null }
  | { state: 'enabled'; profile: CatalogAdminProfile };

export interface CatalogVersionSummary {
  id: string;
  versionString: string;
  name: string;
  status: CatalogVersionStatus;
  isDefault: boolean;
  basedOnVersionId: string | null;
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

export interface CatalogImportSummary {
  id: string;
  versionId: string;
  mode: 'full' | 'supplement';
  parserProfileId: string;
  parserProfileVersion: string;
  sourceFilename: string;
  sourceFileSize: number;
  sourceFileSha256: string;
  normalizedPayloadHash: string;
  status: CatalogImportStatus;
  createdAt: string;
  appliedAt: string | null;
}

export interface CatalogChangeSetSummary {
  id: string;
  versionId: string;
  importId: string | null;
  changeType: CatalogChangeType;
  reason: string;
  actorDisplayName: string;
  beforeLockVersion: number | null;
  afterLockVersion: number | null;
  createdAt: string;
}

export interface CatalogVersionItemPreview {
  id: string;
  itemCode: string;
  itemName: string;
  unit: string;
  materialCost: number;
  laborCost: number;
  unitCost: number;
  category: string | null;
  isActive: boolean;
  displayOrder: number | null;
}

export interface FactorFDefaultSummary {
  versionId: string | null;
  versionString: string | null;
  status: string | null;
}

export interface CatalogAdminOverview {
  defaultVersion: CatalogVersionSummary | null;
  factorFDefault: FactorFDefaultSummary;
  versions: CatalogVersionSummary[];
  recentImports: CatalogImportSummary[];
  recentChangeSets: CatalogChangeSetSummary[];
  counts: {
    activeDefaultRows: number | null;
    identities: number | null;
    itemCodes: number | null;
    categories: number | null;
    codeGroups: number | null;
  };
  warnings: string[];
}

export interface CatalogVersionDetail {
  version: CatalogVersionSummary;
  counts: {
    rows: number | null;
    activeRows: number | null;
    inactiveRows: number | null;
    categories: number | null;
    codeGroups: number | null;
    imports: number | null;
    changeSets: number | null;
  };
  items: CatalogVersionItemPreview[];
  imports: CatalogImportSummary[];
  changeSets: CatalogChangeSetSummary[];
  warnings: string[];
}

const VERSION_COLUMNS = [
  'id',
  'version_string',
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

const IMPORT_COLUMNS = [
  'id',
  'version_id',
  'mode',
  'parser_profile_id',
  'parser_profile_version',
  'source_filename',
  'source_file_size',
  'source_file_sha256',
  'normalized_payload_hash',
  'status',
  'created_at',
  'applied_at',
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

export function isActiveAdminProfile(profile: {
  role?: string | null;
  status?: string | null;
} | null): boolean {
  return profile?.role === 'admin' && profile.status === 'active';
}

export function shortHash(hash: string | null | undefined): string {
  if (!hash) return 'ยังไม่มี hash';
  const prefix = hash.startsWith('sha256:') ? 'sha256:' : '';
  const normalized = prefix ? hash.slice(prefix.length) : hash;
  if (normalized.length <= 12) return hash;
  return `${prefix}${normalized.slice(0, 12)}…`;
}

export function formatThaiDate(value: string | null | undefined): string {
  if (!value) return '-';
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

export function formatThaiDateTime(value: string | null | undefined): string {
  if (!value) return '-';
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatThaiNumber(value: number | null | undefined): string {
  if (value == null) return '-';
  return value.toLocaleString('th-TH');
}

export async function loadCatalogAdminGate(
  supabase: SupabaseClient,
): Promise<CatalogAdminGate> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { state: 'unauthenticated' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id,email,first_name,last_name,role,status')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { state: 'forbidden', profile: null };
  }

  const mappedProfile: CatalogAdminProfile = {
    id: String(profile.id),
    email: profile.email ?? null,
    firstName: String(profile.first_name ?? ''),
    lastName: String(profile.last_name ?? ''),
    role: profile.role as UserRole,
    status: profile.status as CatalogAdminProfile['status'],
  };

  if (!isActiveAdminProfile(profile)) {
    return { state: 'forbidden', profile: mappedProfile };
  }

  const { data: setting, error: settingError } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'catalog_admin_enabled')
    .maybeSingle();

  if (settingError) {
    return {
      state: 'disabled',
      profile: mappedProfile,
      flagIssue: 'อ่านค่า feature flag ไม่สำเร็จ',
    };
  }

  if (!isCatalogAdminEnabled(setting?.value)) {
    return {
      state: 'disabled',
      profile: mappedProfile,
      flagIssue: setting ? null : 'ยังไม่พบ feature flag catalog_admin_enabled',
    };
  }

  return { state: 'enabled', profile: mappedProfile };
}

export async function loadCatalogAdminOverview(
  supabase: SupabaseClient,
): Promise<CatalogAdminOverview> {
  const warnings: string[] = [];

  const [versionsResult, pointerResult, importsResult, changeSetsResult, factorFDefault] =
    await Promise.all([
      supabase
        .from('price_list_versions')
        .select(VERSION_COLUMNS)
        .order('created_at', { ascending: false })
        .limit(25),
      supabase
        .from('price_list_default_version')
        .select('version_id')
        .eq('id', true)
        .maybeSingle(),
      supabase
        .from('catalog_imports')
        .select(IMPORT_COLUMNS)
        .order('created_at', { ascending: false })
        .limit(6),
      supabase
        .from('catalog_change_sets')
        .select(CHANGE_SET_COLUMNS)
        .order('created_at', { ascending: false })
        .limit(6),
      loadFactorFDefaultSummary(supabase, warnings),
    ]);

  pushError(warnings, versionsResult.error, 'โหลดรายการเวอร์ชันไม่สำเร็จ');
  pushError(warnings, pointerResult.error, 'โหลด current default catalog ไม่สำเร็จ');
  pushError(warnings, importsResult.error, 'โหลด import ล่าสุดไม่สำเร็จ');
  pushError(warnings, changeSetsResult.error, 'โหลด history ล่าสุดไม่สำเร็จ');

  const versions = rowsFromResult(versionsResult.data).map(mapVersionSummary);
  const defaultVersionId = pointerResult.data?.version_id ? String(pointerResult.data.version_id) : null;
  const defaultVersion =
    versions.find((version) => version.id === defaultVersionId) ??
    (defaultVersionId ? await loadCatalogVersionById(supabase, defaultVersionId, warnings) : null);

  const [
    activeDefaultRows,
    identities,
    itemCodes,
    categories,
    codeGroups,
  ] = await Promise.all([
    defaultVersion
      ? countPriceListRows(supabase, defaultVersion.id, true, warnings, 'นับรายการ active ของ current default ไม่สำเร็จ')
      : Promise.resolve(null),
    countTable(supabase, 'catalog_item_identities', 'id', warnings, 'นับ identities ไม่สำเร็จ'),
    countTable(supabase, 'catalog_item_codes', 'item_code', warnings, 'นับ item codes ไม่สำเร็จ'),
    defaultVersion
      ? countVersionedTable(supabase, 'price_list_categories', defaultVersion.id, warnings, 'นับ categories ไม่สำเร็จ')
      : Promise.resolve(null),
    defaultVersion
      ? countVersionedTable(supabase, 'catalog_code_groups', defaultVersion.id, warnings, 'นับ code groups ไม่สำเร็จ')
      : Promise.resolve(null),
  ]);

  return {
    defaultVersion,
    factorFDefault,
    versions,
    recentImports: rowsFromResult(importsResult.data).map(mapImportSummary),
    recentChangeSets: rowsFromResult(changeSetsResult.data).map(mapChangeSetSummary),
    counts: {
      activeDefaultRows,
      identities,
      itemCodes,
      categories,
      codeGroups,
    },
    warnings,
  };
}

export async function loadCatalogVersionDetail(
  supabase: SupabaseClient,
  versionId: string,
): Promise<CatalogVersionDetail | null> {
  const warnings: string[] = [];
  const { data: versionData, error: versionError } = await supabase
    .from('price_list_versions')
    .select(VERSION_COLUMNS)
    .eq('id', versionId)
    .maybeSingle();

  pushError(warnings, versionError, 'โหลดข้อมูลเวอร์ชันไม่สำเร็จ');
  const versionRow = rowFromResult(versionData);
  if (!versionRow) return null;

  const version = mapVersionSummary(versionRow);

  const [
    rows,
    activeRows,
    inactiveRows,
    categories,
    codeGroups,
    imports,
    changeSets,
    itemPreview,
  ] = await Promise.all([
    countPriceListRows(supabase, version.id, null, warnings, 'นับ rows ไม่สำเร็จ'),
    countPriceListRows(supabase, version.id, true, warnings, 'นับ active rows ไม่สำเร็จ'),
    countPriceListRows(supabase, version.id, false, warnings, 'นับ inactive rows ไม่สำเร็จ'),
    countVersionedTable(supabase, 'price_list_categories', version.id, warnings, 'นับ categories ไม่สำเร็จ'),
    countVersionedTable(supabase, 'catalog_code_groups', version.id, warnings, 'นับ code groups ไม่สำเร็จ'),
    countVersionedTable(supabase, 'catalog_imports', version.id, warnings, 'นับ imports ไม่สำเร็จ'),
    countVersionedTable(supabase, 'catalog_change_sets', version.id, warnings, 'นับ change sets ไม่สำเร็จ'),
    supabase
      .from('price_list')
      .select('id,item_code,item_name,unit,material_cost,labor_cost,unit_cost,category,is_active,display_order')
      .eq('version_id', version.id)
      .order('display_order', { ascending: true })
      .order('item_code', { ascending: true })
      .limit(20),
  ]);

  pushError(warnings, itemPreview.error, 'โหลดตัวอย่างรายการราคาไม่สำเร็จ');

  const [importRows, changeRows] = await Promise.all([
    loadVersionImports(supabase, version.id, 12, warnings),
    loadVersionChangeSets(supabase, version.id, 12, warnings),
  ]);

  return {
    version,
    counts: {
      rows,
      activeRows,
      inactiveRows,
      categories,
      codeGroups,
      imports,
      changeSets,
    },
    items: rowsFromResult(itemPreview.data).map(mapItemPreview),
    imports: importRows,
    changeSets: changeRows,
    warnings,
  };
}

export async function loadCatalogAdminHistory(
  supabase: SupabaseClient,
): Promise<{
  imports: CatalogImportSummary[];
  changeSets: CatalogChangeSetSummary[];
  warnings: string[];
}> {
  const warnings: string[] = [];
  const [imports, changeSets] = await Promise.all([
    supabase
      .from('catalog_imports')
      .select(IMPORT_COLUMNS)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('catalog_change_sets')
      .select(CHANGE_SET_COLUMNS)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  pushError(warnings, imports.error, 'โหลด import history ไม่สำเร็จ');
  pushError(warnings, changeSets.error, 'โหลด change history ไม่สำเร็จ');

  return {
    imports: rowsFromResult(imports.data).map(mapImportSummary),
    changeSets: rowsFromResult(changeSets.data).map(mapChangeSetSummary),
    warnings,
  };
}

async function loadCatalogVersionById(
  supabase: SupabaseClient,
  versionId: string,
  warnings: string[],
): Promise<CatalogVersionSummary | null> {
  const { data, error } = await supabase
    .from('price_list_versions')
    .select(VERSION_COLUMNS)
    .eq('id', versionId)
    .maybeSingle();
  pushError(warnings, error, 'โหลด current default version ไม่สำเร็จ');
  const row = rowFromResult(data);
  return row ? mapVersionSummary(row) : null;
}

async function loadVersionImports(
  supabase: SupabaseClient,
  versionId: string,
  limit: number,
  warnings: string[],
): Promise<CatalogImportSummary[]> {
  const { data, error } = await supabase
    .from('catalog_imports')
    .select(IMPORT_COLUMNS)
    .eq('version_id', versionId)
    .order('created_at', { ascending: false })
    .limit(limit);
  pushError(warnings, error, 'โหลด import ของเวอร์ชันไม่สำเร็จ');
  return rowsFromResult(data).map(mapImportSummary);
}

async function loadVersionChangeSets(
  supabase: SupabaseClient,
  versionId: string,
  limit: number,
  warnings: string[],
): Promise<CatalogChangeSetSummary[]> {
  const { data, error } = await supabase
    .from('catalog_change_sets')
    .select(CHANGE_SET_COLUMNS)
    .eq('version_id', versionId)
    .order('created_at', { ascending: false })
    .limit(limit);
  pushError(warnings, error, 'โหลด change sets ของเวอร์ชันไม่สำเร็จ');
  return rowsFromResult(data).map(mapChangeSetSummary);
}

async function loadFactorFDefaultSummary(
  supabase: SupabaseClient,
  warnings: string[],
): Promise<FactorFDefaultSummary> {
  const { data: pointer, error: pointerError } = await supabase
    .from('factor_reference_default_version')
    .select('version_id')
    .eq('id', true)
    .maybeSingle();

  pushError(warnings, pointerError, 'โหลด Factor F default pointer ไม่สำเร็จ');

  if (pointerError || !pointer?.version_id) {
    return { versionId: null, versionString: null, status: null };
  }

  const { data: version, error: versionError } = await supabase
    .from('factor_reference_versions')
    .select('id,version_string,status')
    .eq('id', pointer.version_id)
    .maybeSingle();

  pushError(warnings, versionError, 'โหลด Factor F default version ไม่สำเร็จ');

  return {
    versionId: String(pointer.version_id),
    versionString: version?.version_string ? String(version.version_string) : null,
    status: version?.status ? String(version.status) : null,
  };
}

async function countTable(
  supabase: SupabaseClient,
  table: string,
  column: string,
  warnings: string[],
  message: string,
): Promise<number | null> {
  const { count, error } = await supabase
    .from(table)
    .select(column, { count: 'exact', head: true });
  pushError(warnings, error, message);
  return error ? null : count;
}

async function countVersionedTable(
  supabase: SupabaseClient,
  table: string,
  versionId: string,
  warnings: string[],
  message: string,
): Promise<number | null> {
  const { count, error } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq('version_id', versionId);
  pushError(warnings, error, message);
  return error ? null : count;
}

async function countPriceListRows(
  supabase: SupabaseClient,
  versionId: string,
  isActive: boolean | null,
  warnings: string[],
  message: string,
): Promise<number | null> {
  let query = supabase
    .from('price_list')
    .select('id', { count: 'exact', head: true })
    .eq('version_id', versionId);

  if (isActive !== null) {
    query = query.eq('is_active', isActive);
  }

  const { count, error } = await query;
  pushError(warnings, error, message);
  return error ? null : count;
}

function pushError(warnings: string[], error: { message?: string } | null, message: string) {
  if (!error) return;
  warnings.push(message);
}

function rowsFromResult(data: unknown): Record<string, unknown>[] {
  return Array.isArray(data) ? (data as Record<string, unknown>[]) : [];
}

function rowFromResult(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return null;
  }
  return data as Record<string, unknown>;
}

function mapVersionSummary(row: Record<string, unknown>): CatalogVersionSummary {
  return {
    id: String(row.id),
    versionString: String(row.version_string ?? ''),
    name: String(row.name ?? ''),
    status: (row.status ?? 'draft') as CatalogVersionStatus,
    isDefault: Boolean(row.is_default),
    basedOnVersionId: toNullableString(row.based_on_version_id),
    effectiveDate: toNullableString(row.effective_date),
    approvalReference: toNullableString(row.approval_reference),
    approvalDocumentDate: toNullableString(row.approval_document_date),
    publishedAt: toNullableString(row.published_at),
    publishedByDisplayName: toNullableString(row.published_by_display_name),
    datasetHash: toNullableString(row.dataset_hash),
    itemCount: toNullableNumber(row.item_count),
    lockVersion: toNullableNumber(row.lock_version) ?? 0,
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
  };
}

function mapImportSummary(row: Record<string, unknown>): CatalogImportSummary {
  return {
    id: String(row.id),
    versionId: String(row.version_id),
    mode: (row.mode ?? 'full') as CatalogImportSummary['mode'],
    parserProfileId: String(row.parser_profile_id ?? ''),
    parserProfileVersion: String(row.parser_profile_version ?? ''),
    sourceFilename: String(row.source_filename ?? ''),
    sourceFileSize: toNullableNumber(row.source_file_size) ?? 0,
    sourceFileSha256: String(row.source_file_sha256 ?? ''),
    normalizedPayloadHash: String(row.normalized_payload_hash ?? ''),
    status: (row.status ?? 'validated') as CatalogImportStatus,
    createdAt: String(row.created_at ?? ''),
    appliedAt: toNullableString(row.applied_at),
  };
}

function mapChangeSetSummary(row: Record<string, unknown>): CatalogChangeSetSummary {
  return {
    id: String(row.id),
    versionId: String(row.version_id),
    importId: toNullableString(row.import_id),
    changeType: (row.change_type ?? 'manual') as CatalogChangeType,
    reason: String(row.reason ?? ''),
    actorDisplayName: String(row.actor_display_name ?? ''),
    beforeLockVersion: toNullableNumber(row.before_lock_version),
    afterLockVersion: toNullableNumber(row.after_lock_version),
    createdAt: String(row.created_at ?? ''),
  };
}

function mapItemPreview(row: Record<string, unknown>): CatalogVersionItemPreview {
  return {
    id: String(row.id),
    itemCode: String(row.item_code ?? ''),
    itemName: String(row.item_name ?? ''),
    unit: String(row.unit ?? ''),
    materialCost: toNullableNumber(row.material_cost) ?? 0,
    laborCost: toNullableNumber(row.labor_cost) ?? 0,
    unitCost: toNullableNumber(row.unit_cost) ?? 0,
    category: toNullableString(row.category),
    isActive: Boolean(row.is_active),
    displayOrder: toNullableNumber(row.display_order),
  };
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
