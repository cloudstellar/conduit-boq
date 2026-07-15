import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserRole } from '@/lib/types/auth';
import {
  loadCatalogVersionWorkspace,
  loadCatalogVersionItemsSnapshot,
  type CatalogCategoryOption,
  type CatalogCodeGroupOption,
  type CatalogWorkspaceItem,
} from './catalogWorkspace';
import {
  buildCatalogFinalReviewSnapshot,
  type CatalogFinalReviewSnapshot,
} from './catalogDiff';
import { isCatalogAdminEnabled } from './flags';
import {
  loadCatalogCapabilityFlags,
  type CatalogCapabilityFlags,
} from './capabilities';
import {
  parseCatalogVersionString,
  type CatalogVersionRegistryEntry,
} from '../versioning';

export { isCatalogAdminEnabled } from './flags';

export type CatalogAdminSection = 'overview' | 'versions' | 'history';
export type CatalogVersionStatus = 'draft' | 'active' | 'archived' | 'abandoned';
export type CatalogImportStatus = 'validated' | 'applied' | 'rejected';
export type CatalogChangeType =
  | 'clone'
  | 'import'
  | 'manual'
  | 'abandon'
  | 'publish'
  | 'restore'
  | 'placement';

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
  physicalArchiveReference: string | null;
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
  physicalArchiveReference: string | null;
  normalizedPayloadHash: string;
  status: CatalogImportStatus;
  errorSummary: string | null;
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

export interface FactorFDefaultSummary {
  versionId: string | null;
  versionString: string | null;
  status: string | null;
}

export interface CatalogPublishReadiness {
  versionFound: boolean;
  versionStatus: CatalogVersionStatus | null;
  basedOnVersionId: string | null;
  currentVersionId: string | null;
  baseIsCurrent: boolean;
  newIdentityCount: number;
  activeCanonicalCodeCount: number;
  structuredCodeGuardApplies: boolean;
  unapprovedLegacyActiveCount: number;
  inactiveRowCount: number;
  retiredPdfPolicyRequired: boolean;
  placementGovernanceAvailable: boolean;
  placementRevision: number;
  acceptedPlacementRevision: number | null;
  placementReviewId: string | null;
  placementChangeSetId: string | null;
  placementReviewRequired: boolean;
  placementReviewCurrent: boolean;
  orderContiguous: boolean;
  inheritedOrderPreserved: boolean;
  expectedOrderMatches: boolean;
  qualityPassed: boolean;
  dataset: {
    itemCount: number;
    activeItemCount: number;
    inactiveItemCount: number;
    datasetHash: string | null;
    quality: Record<string, number>;
  } | null;
  canPublish: boolean;
}

export interface CatalogPlacementWorkspace {
  version: {
    id: string;
    versionString: string;
    status: CatalogVersionStatus;
    basedOnVersionId: string | null;
    lockVersion: number;
  };
  currentVersionId: string | null;
  placementRevision: number;
  readiness: CatalogPublishReadiness | null;
  baseItems: CatalogWorkspaceItem[];
  newItems: CatalogWorkspaceItem[];
  inheritedItems: CatalogWorkspaceItem[];
  categories: CatalogCategoryOption[];
  capabilities: CatalogCapabilityFlags;
  complete: boolean;
  editable: boolean;
  warnings: string[];
}

export interface CatalogAdminOverview {
  defaultVersion: CatalogVersionSummary | null;
  draftPublishReadiness: CatalogPublishReadiness | null;
  factorFDefault: FactorFDefaultSummary;
  versions: CatalogVersionSummary[];
  versionRegistry: CatalogVersionRegistryEntry[] | null;
  drafts: CatalogVersionSummary[];
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
  baseVersion: CatalogVersionSummary | null;
  currentVersion: CatalogVersionSummary | null;
  counts: {
    rows: number | null;
    activeRows: number | null;
    inactiveRows: number | null;
    categories: number | null;
    codeGroups: number | null;
    imports: number | null;
    changeSets: number | null;
  };
  items: CatalogWorkspaceItem[];
  categories: CatalogCategoryOption[];
  codeGroups: CatalogCodeGroupOption[];
  currentVersionId: string | null;
  isStaleDraft: boolean;
  publishReadiness: CatalogPublishReadiness | null;
  capabilities: CatalogCapabilityFlags;
  imports: CatalogImportSummary[];
  changeSets: CatalogChangeSetSummary[];
  warnings: string[];
}

export interface CatalogVersionReview {
  version: CatalogVersionSummary;
  baseVersion: CatalogVersionSummary;
  currentVersionId: string | null;
  isCurrentBase: boolean;
  snapshot: CatalogFinalReviewSnapshot;
  publishReadiness: CatalogPublishReadiness | null;
  canPublishReviewedState: boolean;
  warnings: string[];
}

export interface CatalogPageCursor {
  createdAt: string;
  id: string;
}

export interface CatalogRegisterPage<T> {
  rows: T[];
  nextCursor: CatalogPageCursor | null;
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
  'physical_archive_reference',
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
  'physical_archive_reference',
  'normalized_payload_hash',
  'status',
  'error_summary',
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

const VERSION_REGISTRY_PAGE_SIZE = 1_000;

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

  const [
    versionsResult,
    versionRegistryResult,
    draftsResult,
    pointerResult,
    importsResult,
    changeSetsResult,
    factorFDefault,
  ] =
    await Promise.all([
      supabase
        .from('price_list_versions')
        .select(VERSION_COLUMNS)
        .order('created_at', { ascending: false })
        .limit(25),
      supabase
        .from('price_list_versions')
        .select('version_string,status', { count: 'exact' })
        .order('major', { ascending: true })
        .order('minor', { ascending: true })
        .order('patch', { ascending: true })
        .range(0, VERSION_REGISTRY_PAGE_SIZE - 1),
      supabase
        .from('price_list_versions')
        .select(VERSION_COLUMNS)
        .eq('status', 'draft')
        .order('created_at', { ascending: false })
        .order('id', { ascending: false }),
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
  pushError(warnings, versionRegistryResult.error, 'โหลดทะเบียนเลขเวอร์ชันไม่สำเร็จ');
  pushError(warnings, draftsResult.error, 'โหลดฉบับร่างทั้งหมดไม่สำเร็จ');
  pushError(warnings, pointerResult.error, 'โหลดเวอร์ชันบัญชีราคาที่ใช้งานปัจจุบันไม่สำเร็จ');
  pushError(warnings, importsResult.error, 'โหลดการนำเข้าล่าสุดไม่สำเร็จ');
  pushError(warnings, changeSetsResult.error, 'โหลดประวัติล่าสุดไม่สำเร็จ');

  const versionRegistryRows = rowsFromResult(versionRegistryResult.data);
  let versionRegistryLoadFailed = Boolean(versionRegistryResult.error);
  const versionRegistryCount = versionRegistryResult.count;
  if (!versionRegistryLoadFailed && typeof versionRegistryCount === 'number') {
    while (versionRegistryRows.length < versionRegistryCount) {
      const pageResult = await supabase
        .from('price_list_versions')
        .select('version_string,status')
        .order('major', { ascending: true })
        .order('minor', { ascending: true })
        .order('patch', { ascending: true })
        .range(
          versionRegistryRows.length,
          Math.min(
            versionRegistryRows.length + VERSION_REGISTRY_PAGE_SIZE - 1,
            versionRegistryCount - 1,
          ),
        );
      if (pageResult.error) {
        pushError(warnings, pageResult.error, 'โหลดทะเบียนเลขเวอร์ชันหน้าถัดไปไม่สำเร็จ');
        versionRegistryLoadFailed = true;
        break;
      }
      const pageRows = rowsFromResult(pageResult.data);
      if (pageRows.length === 0) {
        versionRegistryLoadFailed = true;
        break;
      }
      versionRegistryRows.push(...pageRows);
    }
  }

  const mappedVersionRegistry = versionRegistryRows.map((row) => ({
    versionString: String(row.version_string ?? ''),
    status: String(row.status ?? ''),
  }));
  const registryStrings = new Set(mappedVersionRegistry.map((entry) => entry.versionString));
  let versionRegistry: CatalogVersionRegistryEntry[] | null = !versionRegistryLoadFailed
    && typeof versionRegistryCount === 'number'
    && versionRegistryCount === mappedVersionRegistry.length
    && registryStrings.size === mappedVersionRegistry.length
    && mappedVersionRegistry.every((entry) => parseCatalogVersionString(entry.versionString))
    ? mappedVersionRegistry
    : null;
  if (versionRegistry === null) {
    warnings.push('ทะเบียนเลขเวอร์ชันโหลดไม่ครบ จึงปิดการสร้างฉบับร่างไว้ก่อน');
  }
  const versions = rowsFromResult(versionsResult.data).map(mapVersionSummary);
  const defaultVersionId = pointerResult.data?.version_id ? String(pointerResult.data.version_id) : null;
  const defaultVersion =
    versions.find((version) => version.id === defaultVersionId) ??
    (defaultVersionId ? await loadCatalogVersionById(supabase, defaultVersionId, warnings) : null);
  if (
    versionRegistry
    && defaultVersion
    && !versionRegistry.some((entry) => entry.versionString === defaultVersion.versionString)
  ) {
    versionRegistry = null;
    warnings.push('ทะเบียนเลขเวอร์ชันไม่พบเวอร์ชันใช้งานปัจจุบัน จึงปิดการสร้างฉบับร่างไว้ก่อน');
  }
  const drafts = rowsFromResult(draftsResult.data).map(mapVersionSummary);
  if (drafts.filter((draft) => draft.basedOnVersionId === defaultVersionId).length > 1) {
    warnings.push('พบฉบับร่างที่กำลังทำงานจากเวอร์ชันฐานเดียวกันมากกว่าหนึ่งฉบับ จึงต้องแก้ฐานข้อมูลก่อนใช้งานต่อ');
  }
  const [
    activeDefaultRows,
    identities,
    itemCodes,
    categories,
    codeGroups,
  ] = await Promise.all([
    defaultVersion
      ? countPriceListRows(supabase, defaultVersion.id, true, warnings, 'นับรายการใช้งานของเวอร์ชันปัจจุบันไม่สำเร็จ')
      : Promise.resolve(null),
    countTable(supabase, 'catalog_item_identities', 'id', warnings, 'นับตัวตนรายการไม่สำเร็จ'),
    countTable(supabase, 'catalog_item_codes', 'item_code', warnings, 'นับรหัสรายการไม่สำเร็จ'),
    defaultVersion
      ? countVersionedTable(supabase, 'price_list_categories', defaultVersion.id, warnings, 'นับหมวดงานไม่สำเร็จ')
      : Promise.resolve(null),
    defaultVersion
      ? countVersionedTable(supabase, 'catalog_code_groups', defaultVersion.id, warnings, 'นับกลุ่มรหัสไม่สำเร็จ')
      : Promise.resolve(null),
  ]);

  return {
    defaultVersion,
    draftPublishReadiness: null,
    factorFDefault,
    versions,
    versionRegistry,
    drafts,
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

export async function loadCatalogPublishReadiness(
  supabase: SupabaseClient,
  versionId: string,
  warnings: string[],
): Promise<CatalogPublishReadiness | null> {
  const { data, error } = await supabase.rpc('get_catalog_publish_readiness', {
    p_version_id: versionId,
  });

  if (error) {
    pushError(warnings, error, 'ตรวจความพร้อมก่อนเผยแพร่ไม่สำเร็จ');
    return null;
  }

  const row = rowFromResult(data);

  if (!row) {
    warnings.push('ผลตรวจความพร้อมก่อนเผยแพร่ไม่อยู่ในรูปแบบที่รองรับ');
    return null;
  }

  return {
    versionFound: row.versionFound === true,
    versionStatus:
      row.versionStatus === 'draft' ||
      row.versionStatus === 'active' ||
      row.versionStatus === 'archived' ||
      row.versionStatus === 'abandoned'
        ? row.versionStatus
        : null,
    basedOnVersionId: toNullableString(row.basedOnVersionId),
    currentVersionId: toNullableString(row.currentVersionId),
    baseIsCurrent: row.baseIsCurrent === true,
    newIdentityCount: toNullableNumber(row.newIdentityCount) ?? 0,
    activeCanonicalCodeCount: toNullableNumber(row.activeCanonicalCodeCount) ?? 0,
    structuredCodeGuardApplies: row.structuredCodeGuardApplies === true,
    unapprovedLegacyActiveCount: toNullableNumber(row.unapprovedLegacyActiveCount) ?? 0,
    inactiveRowCount: toNullableNumber(row.inactiveRowCount) ?? 0,
    retiredPdfPolicyRequired: row.retiredPdfPolicyRequired === true,
    placementGovernanceAvailable: row.placementGovernanceAvailable === true,
    placementRevision: toNullableNumber(row.placementRevision) ?? 0,
    acceptedPlacementRevision: toNullableNumber(row.acceptedPlacementRevision),
    placementReviewId: toNullableString(row.placementReviewId),
    placementChangeSetId: toNullableString(row.placementChangeSetId),
    placementReviewRequired: row.placementReviewRequired === true,
    placementReviewCurrent: row.placementReviewCurrent === true,
    orderContiguous: row.orderContiguous === true,
    inheritedOrderPreserved: row.inheritedOrderPreserved === true,
    expectedOrderMatches: row.expectedOrderMatches === true,
    qualityPassed: row.qualityPassed === true,
    dataset: mapPublishDataset(row.dataset),
    canPublish: row.canPublish === true,
  };
}

export async function loadCatalogPlacementWorkspace(
  supabase: SupabaseClient,
  versionId: string,
): Promise<CatalogPlacementWorkspace | null> {
  const warnings: string[] = [];
  const { data: versionData, error: versionError } = await supabase
    .from('price_list_versions')
    .select('id,version_string,status,based_on_version_id,lock_version')
    .eq('id', versionId)
    .maybeSingle();

  pushError(warnings, versionError, 'โหลดฉบับร่างสำหรับจัดตำแหน่งไม่สำเร็จ');
  const versionRow = rowFromResult(versionData);
  if (!versionRow) return null;

  const basedOnVersionId = toNullableString(versionRow.based_on_version_id);
  const [workspace, baseSnapshot, pointerResult, readiness, capabilityResult] =
    await Promise.all([
      loadCatalogVersionWorkspace(supabase, versionId),
      basedOnVersionId
        ? loadCatalogVersionItemsSnapshot(supabase, basedOnVersionId)
        : Promise.resolve({
            items: [],
            totalItems: 0,
            complete: false,
            warnings: ['ฉบับนี้ไม่มีเวอร์ชันฐานสำหรับยืนยันตำแหน่ง'],
          }),
      supabase
        .from('price_list_default_version')
        .select('version_id')
        .eq('id', true)
        .maybeSingle(),
      loadCatalogPublishReadiness(supabase, versionId, warnings),
      loadCatalogCapabilityFlags(supabase),
    ]);

  warnings.push(...workspace.warnings, ...baseSnapshot.warnings);
  pushError(warnings, pointerResult.error, 'โหลดเวอร์ชันบัญชีราคาที่ใช้งานปัจจุบันไม่สำเร็จ');
  if (capabilityResult.warning) warnings.push(capabilityResult.warning);

  const baseIdentityIds = new Set(baseSnapshot.items.map((item) => item.identityId));
  const newItems = workspace.items.filter((item) => !baseIdentityIds.has(item.identityId));
  const inheritedItems = workspace.items.filter((item) => baseIdentityIds.has(item.identityId));
  const currentVersionId = toNullableString(pointerResult.data?.version_id);
  const status = (versionRow.status ?? 'draft') as CatalogVersionStatus;
  const complete = workspace.items.length === workspace.totalItems && baseSnapshot.complete;
  const placementGovernanceAvailable = readiness?.placementGovernanceAvailable === true;

  return {
    version: {
      id: String(versionRow.id),
      versionString: String(versionRow.version_string ?? ''),
      status,
      basedOnVersionId,
      lockVersion: toNullableNumber(versionRow.lock_version) ?? 0,
    },
    currentVersionId,
    placementRevision: readiness?.placementRevision ?? 0,
    readiness,
    baseItems: baseSnapshot.items,
    newItems,
    inheritedItems,
    categories: workspace.categories,
    capabilities: capabilityResult.flags,
    complete,
    editable:
      status === 'draft'
      && basedOnVersionId !== null
      && basedOnVersionId === currentVersionId
      && complete
      && placementGovernanceAvailable
      && capabilityResult.flags.newIdentityEnabled,
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
  const baseVersionQuery = version.basedOnVersionId
    ? supabase
        .from('price_list_versions')
        .select(VERSION_COLUMNS)
        .eq('id', version.basedOnVersionId)
        .maybeSingle()
    : Promise.resolve({ data: null, error: null });

  const [
    rows,
    activeRows,
    inactiveRows,
    categories,
    codeGroups,
    imports,
    changeSets,
    workspace,
    pointerResult,
    publishReadiness,
    capabilityResult,
    baseVersionResult,
  ] = await Promise.all([
    countPriceListRows(supabase, version.id, null, warnings, 'นับรายการทั้งหมดไม่สำเร็จ'),
    countPriceListRows(supabase, version.id, true, warnings, 'นับรายการใช้งานไม่สำเร็จ'),
    countPriceListRows(supabase, version.id, false, warnings, 'นับรายการยกเลิกใช้ไม่สำเร็จ'),
    countVersionedTable(supabase, 'price_list_categories', version.id, warnings, 'นับหมวดงานไม่สำเร็จ'),
    countVersionedTable(supabase, 'catalog_code_groups', version.id, warnings, 'นับกลุ่มรหัสไม่สำเร็จ'),
    countVersionedTable(supabase, 'catalog_imports', version.id, warnings, 'นับชุดการนำเข้าไม่สำเร็จ'),
    countVersionedTable(supabase, 'catalog_change_sets', version.id, warnings, 'นับชุดการเปลี่ยนแปลงไม่สำเร็จ'),
    loadCatalogVersionWorkspace(supabase, version.id),
    supabase
      .from('price_list_default_version')
      .select('version_id')
      .eq('id', true)
      .maybeSingle(),
    version.status === 'draft'
      ? loadCatalogPublishReadiness(supabase, version.id, warnings)
      : Promise.resolve(null),
    loadCatalogCapabilityFlags(supabase),
    baseVersionQuery,
  ]);
  warnings.push(...workspace.warnings);
  pushError(warnings, pointerResult.error, 'โหลดเวอร์ชันบัญชีราคาที่ใช้งานปัจจุบันไม่สำเร็จ');
  pushError(warnings, baseVersionResult.error, 'โหลดเวอร์ชันฐานไม่สำเร็จ');
  if (capabilityResult.warning) warnings.push(capabilityResult.warning);
  const baseVersionRow = rowFromResult(baseVersionResult.data);

  const [importRows, changeRows] = await Promise.all([
    loadVersionImports(supabase, version.id, 12, warnings),
    loadVersionChangeSets(supabase, version.id, 12, warnings),
  ]);
  const baseVersion = baseVersionRow ? mapVersionSummary(baseVersionRow) : null;
  const currentVersionId = toNullableString(pointerResult.data?.version_id);
  let currentVersion: CatalogVersionSummary | null = null;
  if (currentVersionId === version.id) {
    currentVersion = version;
  } else if (currentVersionId && currentVersionId === baseVersion?.id) {
    currentVersion = baseVersion;
  } else if (currentVersionId) {
    currentVersion = await loadCatalogVersionById(supabase, currentVersionId, warnings);
  }

  return {
    version,
    baseVersion,
    currentVersion,
    counts: {
      rows,
      activeRows,
      inactiveRows,
      categories,
      codeGroups,
      imports,
      changeSets,
    },
    items: workspace.items,
    categories: workspace.categories,
    codeGroups: workspace.codeGroups,
    currentVersionId,
    isStaleDraft:
      version.status === 'draft'
      && version.basedOnVersionId !== toNullableString(pointerResult.data?.version_id),
    publishReadiness,
    capabilities: capabilityResult.flags,
    imports: importRows,
    changeSets: changeRows,
    warnings,
  };
}

export async function loadCatalogVersionReview(
  supabase: SupabaseClient,
  versionId: string,
): Promise<CatalogVersionReview | null> {
  const warnings: string[] = [];
  const { data: initialData, error: initialError } = await supabase
    .from('price_list_versions')
    .select(VERSION_COLUMNS)
    .eq('id', versionId)
    .maybeSingle();

  pushError(warnings, initialError, 'โหลดฉบับร่างสำหรับตรวจสอบไม่สำเร็จ');
  const initialRow = rowFromResult(initialData);
  if (!initialRow) return null;

  const version = mapVersionSummary(initialRow);
  if (!version.basedOnVersionId) return null;

  const [baseResult, baseSnapshot, draftSnapshot, publishReadiness] =
    await Promise.all([
      supabase
        .from('price_list_versions')
        .select(VERSION_COLUMNS)
        .eq('id', version.basedOnVersionId)
        .maybeSingle(),
      loadCatalogVersionItemsSnapshot(supabase, version.basedOnVersionId),
      loadCatalogVersionItemsSnapshot(supabase, version.id),
      version.status === 'draft'
        ? loadCatalogPublishReadiness(supabase, version.id, warnings)
        : Promise.resolve(null),
    ]);

  pushError(warnings, baseResult.error, 'โหลดเวอร์ชันฐานสำหรับเปรียบเทียบไม่สำเร็จ');
  warnings.push(...baseSnapshot.warnings, ...draftSnapshot.warnings);

  const baseRow = rowFromResult(baseResult.data);
  if (!baseRow) {
    throw new Error('ไม่พบเวอร์ชันฐานสำหรับเปรียบเทียบฉบับร่าง');
  }
  const baseVersion = mapVersionSummary(baseRow);

  const [finalVersionResult, pointerResult] = await Promise.all([
    supabase
      .from('price_list_versions')
      .select('id,status,lock_version,based_on_version_id')
      .eq('id', version.id)
      .maybeSingle(),
    supabase
      .from('price_list_default_version')
      .select('version_id')
      .eq('id', true)
      .maybeSingle(),
  ]);
  const { data: finalData, error: finalError } = finalVersionResult;
  pushError(warnings, finalError, 'ตรวจรุ่นแก้ไขหลังโหลดผลเปรียบเทียบไม่สำเร็จ');
  pushError(warnings, pointerResult.error, 'โหลดเวอร์ชันบัญชีราคาที่ใช้งานปัจจุบันไม่สำเร็จ');
  const finalRow = rowFromResult(finalData);

  const versionChangedDuringRead = Boolean(
    finalRow
    && (
      String(finalRow.status ?? '') !== version.status
      || toNullableString(finalRow.based_on_version_id) !== version.basedOnVersionId
    )
  );

  const snapshotReadIssues = [
    ...(!baseSnapshot.complete ? [{
      code: 'BASE_SNAPSHOT_INCOMPLETE' as const,
      message: 'โหลดรายการของเวอร์ชันฐานไม่ครบ จึงปิดการเผยแพร่ไว้ก่อน',
    }] : []),
    ...(!draftSnapshot.complete ? [{
      code: 'DRAFT_SNAPSHOT_INCOMPLETE' as const,
      message: 'โหลดรายการของฉบับร่างไม่ครบ จึงปิดการเผยแพร่ไว้ก่อน',
    }] : []),
  ];

  const snapshot: CatalogFinalReviewSnapshot = snapshotReadIssues.length > 0
    ? {
        state: 'incomplete',
        reviewedLockVersion: null,
        diff: null,
        issues: snapshotReadIssues,
      }
    : !finalRow || finalError
    ? {
        state: 'incomplete',
        reviewedLockVersion: null,
        diff: null,
        issues: [{
          code: 'DRAFT_SNAPSHOT_INCOMPLETE',
          message: 'ตรวจยืนยันรุ่นแก้ไขของฉบับร่างหลังโหลดข้อมูลไม่สำเร็จ',
        }],
      }
    : versionChangedDuringRead
      ? {
          state: 'stale',
          reviewedLockVersion: null,
          diff: null,
          issues: [{
            code: 'DRAFT_CHANGED_DURING_REVIEW',
            message: 'สถานะหรือเวอร์ชันฐานเปลี่ยนระหว่างโหลดผลเปรียบเทียบ กรุณาตรวจใหม่',
          }],
        }
      : buildCatalogFinalReviewSnapshot({
          baseItems: baseSnapshot.items,
          draftItems: draftSnapshot.items,
          expectedBaseItemCount: baseVersion.itemCount ?? baseSnapshot.totalItems,
          expectedDraftItemCount: version.itemCount ?? draftSnapshot.totalItems,
          beforeLockVersion: version.lockVersion,
          afterLockVersion: toNullableNumber(finalRow.lock_version) ?? -1,
        });

  const currentVersionId = toNullableString(pointerResult.data?.version_id);
  const isCurrentBase = version.basedOnVersionId === currentVersionId;

  return {
    version,
    baseVersion,
    currentVersionId,
    isCurrentBase,
    snapshot,
    publishReadiness,
    canPublishReviewedState:
      version.status === 'draft'
      && isCurrentBase
      && snapshot.state === 'ready'
      && snapshot.reviewedLockVersion !== null
      && publishReadiness?.canPublish === true,
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

  pushError(warnings, imports.error, 'โหลดประวัติการนำเข้าไม่สำเร็จ');
  pushError(warnings, changeSets.error, 'โหลดประวัติการเปลี่ยนแปลงไม่สำเร็จ');

  return {
    imports: rowsFromResult(imports.data).map(mapImportSummary),
    changeSets: rowsFromResult(changeSets.data).map(mapChangeSetSummary),
    warnings,
  };
}

export async function loadCatalogVersionImportHistory(
  supabase: SupabaseClient,
  versionId: string,
): Promise<{
  imports: CatalogImportSummary[];
  warnings: string[];
}> {
  const warnings: string[] = [];
  const imports = await loadVersionImports(supabase, versionId, 50, warnings);

  return { imports, warnings };
}

export async function loadCatalogVersionsRegisterPage(
  supabase: SupabaseClient,
  cursor?: CatalogPageCursor,
): Promise<CatalogRegisterPage<CatalogVersionSummary>> {
  const warnings: string[] = [];
  const { data, error } = await supabase.rpc('get_catalog_versions_page', {
    p_limit: 25,
    p_before_created_at: cursor?.createdAt ?? null,
    p_before_id: cursor?.id ?? null,
  });

  if (!error) {
    const page = parseRegisterPage(data);
    return {
      rows: page.rows.map(mapVersionSummary),
      nextCursor: page.nextCursor,
      warnings,
    };
  }

  if (!isMissingCatalogRpc(error)) {
    return {
      rows: [],
      nextCursor: null,
      warnings: ['โหลดทะเบียนเวอร์ชันแบบแบ่งหน้าไม่สำเร็จ'],
    };
  }

  warnings.push('Local schema ยังไม่มี RPC ทะเบียนแบบแบ่งหน้า จึงใช้ทะเบียนแบบย่อชั่วคราว');
  let query = supabase
    .from('price_list_versions')
    .select(VERSION_COLUMNS)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(26);
  if (cursor) {
    query = query.or(
      `created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`,
    );
  }
  const fallback = await query;
  pushError(warnings, fallback.error, 'โหลดทะเบียนเวอร์ชันไม่สำเร็จ');
  return pageFromRows(rowsFromResult(fallback.data), mapVersionSummary, warnings);
}

export async function loadCatalogImportsRegisterPage(
  supabase: SupabaseClient,
  cursor?: CatalogPageCursor,
): Promise<CatalogRegisterPage<CatalogImportSummary>> {
  const warnings: string[] = [];
  const { data, error } = await supabase.rpc('get_catalog_imports_page', {
    p_version_id: null,
    p_limit: 25,
    p_before_created_at: cursor?.createdAt ?? null,
    p_before_id: cursor?.id ?? null,
  });
  if (!error) {
    const page = parseRegisterPage(data);
    return { rows: page.rows.map(mapImportSummary), nextCursor: page.nextCursor, warnings };
  }

  if (!isMissingCatalogRpc(error)) {
    return {
      rows: [],
      nextCursor: null,
      warnings: ['โหลดทะเบียนนำเข้าแบบแบ่งหน้าไม่สำเร็จ'],
    };
  }

  warnings.push('Local schema ยังไม่มี RPC ทะเบียนนำเข้าแบบแบ่งหน้า');
  let query = supabase
    .from('catalog_imports')
    .select(IMPORT_COLUMNS)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(26);
  if (cursor) {
    query = query.or(
      `created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`,
    );
  }
  const fallback = await query;
  pushError(warnings, fallback.error, 'โหลดทะเบียนนำเข้าไม่สำเร็จ');
  return pageFromRows(rowsFromResult(fallback.data), mapImportSummary, warnings);
}

export async function loadCatalogChangeSetsRegisterPage(
  supabase: SupabaseClient,
  cursor?: CatalogPageCursor,
): Promise<CatalogRegisterPage<CatalogChangeSetSummary>> {
  const warnings: string[] = [];
  const { data, error } = await supabase.rpc('get_catalog_change_sets_page', {
    p_version_id: null,
    p_limit: 25,
    p_before_created_at: cursor?.createdAt ?? null,
    p_before_id: cursor?.id ?? null,
  });
  if (!error) {
    const page = parseRegisterPage(data);
    return { rows: page.rows.map(mapChangeSetSummary), nextCursor: page.nextCursor, warnings };
  }

  if (!isMissingCatalogRpc(error)) {
    return {
      rows: [],
      nextCursor: null,
      warnings: ['โหลดทะเบียนการเปลี่ยนแปลงแบบแบ่งหน้าไม่สำเร็จ'],
    };
  }

  warnings.push('Local schema ยังไม่มี RPC ทะเบียนการเปลี่ยนแปลงแบบแบ่งหน้า');
  let query = supabase
    .from('catalog_change_sets')
    .select(CHANGE_SET_COLUMNS)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(26);
  if (cursor) {
    query = query.or(
      `created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`,
    );
  }
  const fallback = await query;
  pushError(warnings, fallback.error, 'โหลดทะเบียนการเปลี่ยนแปลงไม่สำเร็จ');
  return pageFromRows(rowsFromResult(fallback.data), mapChangeSetSummary, warnings);
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
  pushError(warnings, error, 'โหลดเวอร์ชันใช้งานปัจจุบันไม่สำเร็จ');
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
  pushError(warnings, error, 'โหลดการนำเข้าของเวอร์ชันไม่สำเร็จ');
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
  pushError(warnings, error, 'โหลดชุดการเปลี่ยนแปลงของเวอร์ชันไม่สำเร็จ');
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

  pushError(warnings, pointerError, 'โหลดตัวชี้เวอร์ชัน Factor F ที่ใช้งานไม่สำเร็จ');

  if (pointerError || !pointer?.version_id) {
    return { versionId: null, versionString: null, status: null };
  }

  const { data: version, error: versionError } = await supabase
    .from('factor_reference_versions')
    .select('id,version_string,status')
    .eq('id', pointer.version_id)
    .maybeSingle();

  pushError(warnings, versionError, 'โหลดเวอร์ชัน Factor F ที่ใช้งานไม่สำเร็จ');

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
    physicalArchiveReference: toNullableString(row.physical_archive_reference),
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
    physicalArchiveReference: toNullableString(row.physical_archive_reference),
    normalizedPayloadHash: String(row.normalized_payload_hash ?? ''),
    status: (row.status ?? 'validated') as CatalogImportStatus,
    errorSummary: toNullableString(row.error_summary),
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

function mapPublishDataset(value: unknown): CatalogPublishReadiness['dataset'] {
  const row = rowFromResult(value);
  if (!row) return null;

  const qualityRow = rowFromResult(row.quality) ?? {};
  const quality = Object.fromEntries(
    Object.entries(qualityRow)
      .map(([key, entry]) => [key, toNullableNumber(entry)])
      .filter((entry): entry is [string, number] => entry[1] !== null),
  );

  return {
    itemCount: toNullableNumber(row.itemCount) ?? 0,
    activeItemCount: toNullableNumber(row.activeItemCount) ?? 0,
    inactiveItemCount: toNullableNumber(row.inactiveItemCount) ?? 0,
    datasetHash: toNullableString(row.datasetHash),
    quality,
  };
}

function parseRegisterPage(data: unknown): {
  rows: Record<string, unknown>[];
  nextCursor: CatalogPageCursor | null;
} {
  const page = rowFromResult(data);
  const cursor = rowFromResult(page?.nextCursor);
  return {
    rows: rowsFromResult(page?.rows),
    nextCursor: cursor
      ? {
          createdAt: String(cursor.createdAt ?? ''),
          id: String(cursor.id ?? ''),
        }
      : null,
  };
}

function pageFromRows<T>(
  sourceRows: Record<string, unknown>[],
  map: (row: Record<string, unknown>) => T,
  warnings: string[],
): CatalogRegisterPage<T> {
  const visibleRows = sourceRows.slice(0, 25);
  const last = visibleRows.at(-1);
  return {
    rows: visibleRows.map(map),
    nextCursor: sourceRows.length > 25 && last
      ? { createdAt: String(last.created_at ?? ''), id: String(last.id ?? '') }
      : null,
    warnings,
  };
}

function isMissingCatalogRpc(error: { code?: string; message?: string } | null): boolean {
  return error?.code === 'PGRST202'
    || /could not find the function.*schema cache/i.test(error?.message ?? '');
}
