import type { SupabaseClient } from '@supabase/supabase-js';
import {
  loadCatalogCapabilityFlags,
  type CatalogCapabilityFlags,
} from './capabilities';

const ITEM_PAGE_SIZE = 500;
export const CATALOG_CLIENT_FILTER_ROW_LIMIT = 2_000;

export interface CatalogCategoryOption {
  id: string;
  code: string;
  name: string;
  displayOrder: number;
}

export interface CatalogCodeGroupOption {
  id: string;
  workContextCode: string;
  workContextNameTh: string;
  itemTypeCode: string;
  itemTypeNameTh: string;
  displayOrder: number;
}

export interface CatalogWorkspaceItem {
  id: string;
  identityId: string;
  itemCode: string;
  itemName: string;
  unit: string;
  materialCost: number;
  laborCost: number;
  unitCost: number;
  categoryCode: string;
  categoryId: string;
  codeGroupId: string | null;
  isActive: boolean;
  displayOrder: number;
}

export interface CatalogVersionWorkspace {
  items: CatalogWorkspaceItem[];
  categories: CatalogCategoryOption[];
  codeGroups: CatalogCodeGroupOption[];
  totalItems: number;
  warnings: string[];
}

export interface CatalogItemDetail extends CatalogWorkspaceItem {
  versionId: string;
  versionString: string;
  versionStatus: string;
  lockVersion: number;
  basedOnVersionId: string | null;
  currentVersionId: string | null;
  baseHasIdentity: boolean;
  hasPublishedIdentity: boolean;
  codeHistory: Array<{
    itemCode: string;
    codeKind: string;
    firstSeenVersionId: string;
    createdAt: string;
  }>;
  categories: CatalogCategoryOption[];
  codeGroups: CatalogCodeGroupOption[];
  capabilities: CatalogCapabilityFlags;
  mutationReady: boolean;
  warnings: string[];
}

export interface CatalogIdentityHistoryEntry {
  id: string;
  versionId: string;
  changeType: string;
  reason: string;
  actorDisplayName: string;
  createdAt: string;
  action: string;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  priceAuthorityReference: string | null;
}

export interface CatalogIdentityHistoryPage {
  rows: CatalogIdentityHistoryEntry[];
  nextCursor: { createdAt: string; id: string } | null;
  warnings: string[];
}

const ITEM_COLUMNS = [
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

export async function loadCatalogVersionWorkspace(
  supabase: SupabaseClient,
  versionId: string,
): Promise<CatalogVersionWorkspace> {
  const warnings: string[] = [];
  const [totalResult, categoriesResult, groupsResult] = await Promise.all([
    supabase
      .from('price_list')
      .select('id', { count: 'exact', head: true })
      .eq('version_id', versionId),
    supabase
      .from('price_list_categories')
      .select('id,code,name,display_order')
      .eq('version_id', versionId)
      .order('display_order', { ascending: true })
      .order('code', { ascending: true }),
    supabase
      .from('catalog_code_groups')
      .select('id,work_context_code,work_context_name_th,item_type_code,item_type_name_th,display_order')
      .eq('version_id', versionId)
      .order('display_order', { ascending: true })
      .order('work_context_code', { ascending: true })
      .order('item_type_code', { ascending: true }),
  ]);

  if (totalResult.error) warnings.push('นับรายการของเวอร์ชันไม่สำเร็จ');
  if (categoriesResult.error) warnings.push('โหลดหมวดงานที่อนุมัติไว้ไม่สำเร็จ');
  if (groupsResult.error) warnings.push('โหลดกลุ่มรหัสที่อนุมัติไว้ไม่สำเร็จ');

  const totalItems = totalResult.count ?? 0;

  if (totalItems > CATALOG_CLIENT_FILTER_ROW_LIMIT) {
    warnings.push(
      `เวอร์ชันมี ${totalItems.toLocaleString('th-TH')} รายการ เกินเพดาน `
      + `${CATALOG_CLIENT_FILTER_ROW_LIMIT.toLocaleString('th-TH')} รายการสำหรับการค้นหาฝั่งหน้าจอ`,
    );

    return {
      items: [],
      categories: mapCategories(categoriesResult.data),
      codeGroups: mapCodeGroups(groupsResult.data),
      totalItems,
      warnings,
    };
  }

  const items: CatalogWorkspaceItem[] = [];

  for (let offset = 0; offset < totalItems; offset += ITEM_PAGE_SIZE) {
    const { data, error } = await supabase
      .from('price_list')
      .select(ITEM_COLUMNS)
      .eq('version_id', versionId)
      .order('display_order', { ascending: true })
      .order('item_code', { ascending: true })
      .range(offset, Math.min(offset + ITEM_PAGE_SIZE - 1, totalItems - 1));

    if (error) {
      warnings.push(`โหลดรายการช่วงที่ ${Math.floor(offset / ITEM_PAGE_SIZE) + 1} ไม่สำเร็จ`);
      break;
    }

    items.push(...rows(data).map(mapWorkspaceItem));
  }

  if (items.length !== totalItems) {
    warnings.push(
      `โหลดรายการได้ ${items.length.toLocaleString('th-TH')} จาก `
      + `${totalItems.toLocaleString('th-TH')} รายการ จึงปิดเครื่องมือแก้ไขไว้ก่อน`,
    );
  }

  return {
    items,
    categories: mapCategories(categoriesResult.data),
    codeGroups: mapCodeGroups(groupsResult.data),
    totalItems,
    warnings,
  };
}

export async function loadCatalogItemDetail(
  supabase: SupabaseClient,
  versionId: string,
  identityId: string,
): Promise<CatalogItemDetail | null> {
  const warnings: string[] = [];
  const [versionResult, itemResult, pointerResult, categoriesResult, groupsResult, codesResult, capabilityResult] =
    await Promise.all([
      supabase
        .from('price_list_versions')
        .select('id,version_string,status,lock_version,based_on_version_id')
        .eq('id', versionId)
        .maybeSingle(),
      supabase
        .from('price_list')
        .select(ITEM_COLUMNS)
        .eq('version_id', versionId)
        .eq('identity_id', identityId)
        .maybeSingle(),
      supabase
        .from('price_list_default_version')
        .select('version_id')
        .eq('id', true)
        .maybeSingle(),
      supabase
        .from('price_list_categories')
        .select('id,code,name,display_order')
        .eq('version_id', versionId)
        .order('display_order', { ascending: true })
        .order('code', { ascending: true }),
      supabase
        .from('catalog_code_groups')
        .select('id,work_context_code,work_context_name_th,item_type_code,item_type_name_th,display_order')
        .eq('version_id', versionId)
        .order('display_order', { ascending: true })
        .order('work_context_code', { ascending: true })
        .order('item_type_code', { ascending: true }),
      supabase
        .from('catalog_item_codes')
        .select('item_code,code_kind,first_seen_version_id,created_at')
        .eq('identity_id', identityId)
        .order('created_at', { ascending: true })
        .order('item_code', { ascending: true }),
      loadCatalogCapabilityFlags(supabase),
    ]);

  if (versionResult.error) {
    throw new Error('โหลดเวอร์ชันบัญชีราคาไม่สำเร็จ');
  }
  if (itemResult.error) {
    throw new Error('โหลดรายการบัญชีราคาไม่สำเร็จ');
  }
  if (!versionResult.data || !itemResult.data) {
    return null;
  }

  if (pointerResult.error) warnings.push('อ่านเวอร์ชันใช้งานปัจจุบันไม่สำเร็จ');
  if (categoriesResult.error) warnings.push('โหลดหมวดงานที่อนุมัติไว้ไม่สำเร็จ');
  if (groupsResult.error) warnings.push('โหลดกลุ่มรหัสที่อนุมัติไว้ไม่สำเร็จ');
  if (codesResult.error) warnings.push('โหลดประวัติรหัสของรายการไม่สำเร็จ');
  if (capabilityResult.warning) warnings.push(capabilityResult.warning);

  const basedOnVersionId = nullableString(versionResult.data.based_on_version_id);
  const [baseResult, publishedResult] = await Promise.all([
    basedOnVersionId
      ? supabase
          .from('price_list')
          .select('id', { count: 'exact', head: true })
          .eq('version_id', basedOnVersionId)
          .eq('identity_id', identityId)
      : Promise.resolve({ count: 0, error: null }),
    supabase
      .from('price_list')
      .select('version_id,price_list_versions!inner(status)', { count: 'exact', head: true })
      .eq('identity_id', identityId)
      .in('price_list_versions.status', ['active', 'archived']),
  ]);

  if (baseResult.error) warnings.push('ตรวจสายสืบทอดจากเวอร์ชันฐานไม่สำเร็จ');
  if (publishedResult.error) warnings.push('ตรวจประวัติการเผยแพร่ของรายการไม่สำเร็จ');

  return {
    ...mapWorkspaceItem(object(itemResult.data) ?? {}),
    versionId,
    versionString: String(versionResult.data.version_string ?? ''),
    versionStatus: String(versionResult.data.status ?? ''),
    lockVersion: number(versionResult.data.lock_version),
    basedOnVersionId,
    currentVersionId: nullableString(pointerResult.data?.version_id),
    baseHasIdentity: (baseResult.count ?? 0) > 0,
    hasPublishedIdentity: (publishedResult.count ?? 0) > 0,
    codeHistory: rows(codesResult.data).map((row) => ({
      itemCode: String(row.item_code ?? ''),
      codeKind: String(row.code_kind ?? ''),
      firstSeenVersionId: String(row.first_seen_version_id ?? ''),
      createdAt: String(row.created_at ?? ''),
    })),
    categories: mapCategories(categoriesResult.data),
    codeGroups: mapCodeGroups(groupsResult.data),
    capabilities: capabilityResult.flags,
    mutationReady:
      !pointerResult.error
      && Boolean(pointerResult.data?.version_id)
      && !categoriesResult.error
      && rows(categoriesResult.data).length > 0
      && !groupsResult.error
      && rows(groupsResult.data).length > 0
      && !codesResult.error
      && !capabilityResult.warning
      && !baseResult.error
      && !publishedResult.error,
    warnings,
  };
}

export async function loadCatalogIdentityHistoryPage(
  supabase: SupabaseClient,
  identityId: string,
  cursor?: { createdAt: string; id: string },
): Promise<CatalogIdentityHistoryPage> {
  const warnings: string[] = [];
  const { data, error } = await supabase.rpc('get_catalog_identity_history_page', {
    p_identity_id: identityId,
    p_limit: 25,
    p_before_created_at: cursor?.createdAt ?? null,
    p_before_id: cursor?.id ?? null,
  });

  if (!error) {
    const result = object(data);
    const nextCursor = object(result?.nextCursor);
    return {
      rows: rows(result?.rows).map(mapIdentityHistory),
      nextCursor: nextCursor
        ? {
            createdAt: String(nextCursor.createdAt ?? ''),
            id: String(nextCursor.id ?? ''),
          }
        : null,
      warnings,
    };
  }

  if (!isMissingCatalogRpc(error)) {
    return {
      rows: [],
      nextCursor: null,
      warnings: ['โหลดประวัติรายการแบบแบ่งหน้าไม่สำเร็จ'],
    };
  }

  warnings.push('Local schema ยังไม่มี RPC ประวัติแบบแบ่งหน้า จึงแสดงประวัติแบบอ่านอย่างย่อ');
  const { data: itemRows, error: itemError } = await supabase
    .from('catalog_change_items')
    .select('id,change_set_id,identity_id,action,old_values,new_values')
    .eq('identity_id', identityId)
    .limit(100);

  if (itemError) {
    return { rows: [], nextCursor: null, warnings: [...warnings, 'โหลดประวัติรายการไม่สำเร็จ'] };
  }

  const changeItems = rows(itemRows);
  const changeSetIds = changeItems.map((row) => String(row.change_set_id ?? '')).filter(Boolean);

  if (changeSetIds.length === 0) return { rows: [], nextCursor: null, warnings };

  const { data: setRows, error: setError } = await supabase
    .from('catalog_change_sets')
    .select('id,version_id,change_type,reason,actor_display_name,created_at')
    .in('id', changeSetIds);

  if (setError) {
    return { rows: [], nextCursor: null, warnings: [...warnings, 'โหลดชุดการเปลี่ยนแปลงไม่สำเร็จ'] };
  }

  const setById = new Map(rows(setRows).map((row) => [String(row.id ?? ''), row]));
  const history = changeItems.flatMap((item) => {
    const set = setById.get(String(item.change_set_id ?? ''));
    if (!set) return [];
    return [mapIdentityHistory({ ...set, ...item, id: set.id })];
  }).sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  return { rows: history.slice(0, 25), nextCursor: null, warnings };
}

function mapWorkspaceItem(row: Record<string, unknown>): CatalogWorkspaceItem {
  return {
    id: String(row.id ?? ''),
    identityId: String(row.identity_id ?? ''),
    itemCode: String(row.item_code ?? ''),
    itemName: String(row.item_name ?? ''),
    unit: String(row.unit ?? ''),
    materialCost: number(row.material_cost),
    laborCost: number(row.labor_cost),
    unitCost: number(row.unit_cost),
    categoryCode: String(row.category ?? ''),
    categoryId: String(row.category_id ?? ''),
    codeGroupId: nullableString(row.code_group_id),
    isActive: row.is_active === true,
    displayOrder: number(row.display_order),
  };
}

function mapCategories(data: unknown): CatalogCategoryOption[] {
  return rows(data).map((row) => ({
    id: String(row.id ?? ''),
    code: String(row.code ?? ''),
    name: String(row.name ?? ''),
    displayOrder: number(row.display_order),
  }));
}

function mapCodeGroups(data: unknown): CatalogCodeGroupOption[] {
  return rows(data).map((row) => ({
    id: String(row.id ?? ''),
    workContextCode: String(row.work_context_code ?? ''),
    workContextNameTh: String(row.work_context_name_th ?? ''),
    itemTypeCode: String(row.item_type_code ?? ''),
    itemTypeNameTh: String(row.item_type_name_th ?? ''),
    displayOrder: number(row.display_order),
  }));
}

function mapIdentityHistory(row: Record<string, unknown>): CatalogIdentityHistoryEntry {
  return {
    id: String(row.id ?? ''),
    versionId: String(row.version_id ?? ''),
    changeType: String(row.change_type ?? ''),
    reason: String(row.reason ?? ''),
    actorDisplayName: String(row.actor_display_name ?? ''),
    createdAt: String(row.created_at ?? ''),
    action: String(row.action ?? ''),
    oldValues: object(row.old_values),
    newValues: object(row.new_values),
    priceAuthorityReference: nullableString(row.price_authority_reference),
  };
}

function rows(data: unknown): Record<string, unknown>[] {
  return Array.isArray(data) ? data as Record<string, unknown>[] : [];
}

function object(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  return data as Record<string, unknown>;
}

function nullableString(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value);
  return text.length > 0 ? text : null;
}

function number(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isMissingCatalogRpc(error: { code?: string; message?: string } | null): boolean {
  return error?.code === 'PGRST202'
    || /could not find the function.*schema cache/i.test(error?.message ?? '');
}
