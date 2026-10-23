import type { SupabaseClient } from '@supabase/supabase-js';
import type { BOQ } from '@/lib/supabase';

export const LIST_PAGE_SIZE = 25;
export const LIST_SEARCH_MAX_LENGTH = 200;
// Keep both inclusive range endpoints within signed 32-bit transport bounds.
// This is an arithmetic guard, not a promise about deep-offset performance.
export const LIST_MAX_OFFSET = 2_147_483_600;

export type ListSort = 'created_desc' | 'document_desc' | 'project_asc';

export interface BOQListState {
  page: number;
  q: string;
  sort: ListSort;
}

export interface BOQListRow extends BOQ {
  catalog_version: { version_string: string | null } | null;
  factor_version: { version_string: string | null } | null;
  created_by?: string | null;
  assigned_to?: string | null;
  org_id?: string | null;
  department_id?: string | null;
  sector_id?: string | null;
}

export type BOQListErrorKind = 'authorization' | 'range' | 'incomplete' | 'request' | 'invalid';

export class BOQListError extends Error {
  readonly kind: BOQListErrorKind;
  readonly code?: string;
  readonly status?: number;

  constructor(kind: BOQListErrorKind, message: string, code?: string, status?: number) {
    super(message);
    this.name = 'BOQListError';
    this.kind = kind;
    this.code = code;
    this.status = status;
  }
}

// Retain the complete existing Copy/Factor snapshot and source-token inputs.
// Explicit projection avoids silently adding future business/private columns.
export const BOQ_LIST_COLUMNS = [
  'id', 'boq_number', 'estimator_name', 'document_date', 'project_name',
  'route', 'construction_area', 'department', 'total_material_cost',
  'total_labor_cost', 'total_cost', 'factor_f', 'factor_f_raw',
  'factor_f_lower_cost', 'factor_f_upper_cost', 'factor_f_lower_value',
  'factor_f_upper_value', 'total_with_factor_f', 'total_with_vat', 'status',
  'price_list_version_id', 'factor_reference_version_id', 'created_at', 'updated_at',
  'created_by', 'assigned_to', 'org_id', 'department_id', 'sector_id',
  'catalog_version:price_list_versions!boq_price_list_version_id_fkey(version_string)',
  'factor_version:factor_reference_versions!boq_factor_reference_version_id_fkey(version_string)',
].join(',');

const SEARCH_COLUMNS = ['project_name', 'boq_number', 'estimator_name', 'route'] as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const AUTHORIZATION_CODES = new Set([
  '42501', 'PGRST301', 'PGRST302', 'PGRST303',
  'UNAUTHENTICATED', 'ACCOUNT_NOT_ACTIVE', 'AUTHORIZATION_UNAVAILABLE', 'ADMIN_REQUIRED',
]);

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object'
    ? value as Record<string, unknown>
    : null;
}

export function isListAuthorizationError(error: unknown): boolean {
  const value = record(error);
  return error instanceof BOQListError && error.kind === 'authorization'
    || value?.status === 401
    || value?.status === 403
    || typeof value?.code === 'string' && AUTHORIZATION_CODES.has(value.code);
}

export function isListRangeError(error: unknown): boolean {
  const value = record(error);
  return error instanceof BOQListError && error.kind === 'range'
    || value?.status === 416
    || value?.code === 'PGRST103';
}

export function normalizeBOQListState(input: {
  page?: unknown;
  q?: unknown;
  sort?: unknown;
}): BOQListState {
  // Reject partial parseInt values, exponents, whitespace and non-decimal URLs.
  const suppliedPage = typeof input.page === 'number'
    ? input.page
    : typeof input.page === 'string' && /^[1-9]\d*$/.test(input.page)
      ? Number(input.page)
      : 1;
  const offset = (suppliedPage - 1) * LIST_PAGE_SIZE;
  const page = Number.isSafeInteger(suppliedPage) && suppliedPage >= 1
    && Number.isSafeInteger(offset) && offset <= LIST_MAX_OFFSET
    ? suppliedPage
    : 1;
  const q = typeof input.q === 'string' ? input.q.trim() : '';
  if (q.length > LIST_SEARCH_MAX_LENGTH || /[\u0000-\u001f\u007f]/.test(q)) {
    throw new BOQListError('invalid', 'คำค้นยาวเกินไปหรือมีอักขระที่ไม่รองรับ', 'INVALID_LIST_SEARCH');
  }
  const sort: ListSort = input.sort === 'document_desc' || input.sort === 'project_asc'
    ? input.sort
    : 'created_desc';
  return { page, q, sort };
}

export function buildBOQListSearch(q: string): string {
  // PostgREST 14 maps * to % for LIKE/ILIKE, even inside quoted values.
  // An escaped literal regex preserves %, _, * and all regex operators as text.
  // User-supplied regex syntax is never accepted. Bound input before building it.
  const normalized = normalizeBOQListState({ q }).q;
  if (!normalized) return '';
  const literal = normalized.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
  const quoted = `"${literal.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  return SEARCH_COLUMNS.map(column => `${column}.imatch.${quoted}`).join(',');
}

function requestError(error: unknown, status?: number): BOQListError {
  if (error instanceof BOQListError) return error;
  const value = record(error);
  const code = typeof value?.code === 'string' ? value.code : undefined;
  const response = { code, status: status ?? value?.status };
  if (isListAuthorizationError(response)) {
    return new BOQListError('authorization', 'สิทธิ์หรือเซสชันเปลี่ยนไป กรุณาเข้าสู่ระบบอีกครั้ง', code, status);
  }
  if (isListRangeError(response)) {
    return new BOQListError('range', 'หน้าที่ขอไม่มีอยู่ในผลลัพธ์ปัจจุบัน', code, status);
  }
  // Do not attach raw PostgREST messages/details: they can contain search text.
  return new BOQListError('request', 'โหลดข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง', code, status);
}

function validateCount(count: number | null): number {
  if (!Number.isSafeInteger(count) || count === null || count < 0) {
    throw new BOQListError('incomplete', 'ไม่สามารถยืนยันจำนวนข้อมูลได้ กรุณาลองอีกครั้ง', 'INCOMPLETE_LIST_RESULT');
  }
  return count;
}

export async function fetchBOQPage(
  supabase: SupabaseClient,
  input: BOQListState,
  options: { signal?: AbortSignal } = {},
): Promise<{ rows: BOQListRow[]; count: number; page: number }> {
  const state = normalizeBOQListState(input);
  const offset = (state.page - 1) * LIST_PAGE_SIZE;
  let query = supabase.from('boq').select(BOQ_LIST_COLUMNS, { count: 'exact' });
  const search = buildBOQListSearch(state.q);
  if (search) query = query.or(search);

  const ascending = state.sort === 'project_asc';
  const column = state.sort === 'project_asc' ? 'project_name'
    : state.sort === 'document_desc' ? 'document_date' : 'created_at';
  query = query.order(column, { ascending, nullsFirst: false })
    .order('id', { ascending })
    .range(offset, offset + LIST_PAGE_SIZE - 1);
  if (options.signal) query = query.abortSignal(options.signal);

  let result;
  try {
    result = await query;
  } catch (error) {
    throw requestError(error);
  }
  if (result.error || result.status === 401 || result.status === 403 || result.status === 416) {
    throw requestError(result.error, result.status);
  }
  const count = validateCount(result.count);
  if (state.page > 1 && offset >= count) {
    throw new BOQListError('range', 'หน้าที่ขอไม่มีอยู่ในผลลัพธ์ปัจจุบัน', 'PGRST103', 416);
  }
  const expectedRows = Math.min(LIST_PAGE_SIZE, Math.max(0, count - offset));
  if (!Array.isArray(result.data) || result.data.length !== expectedRows) {
    throw new BOQListError('incomplete', 'โหลดรายการไม่ครบ กรุณาลองอีกครั้ง', 'INCOMPLETE_LIST_RESULT');
  }
  const seen = new Set<string>();
  for (const row of result.data) {
    const value = record(row);
    if (!value || typeof value.id !== 'string' || !UUID.test(value.id) || seen.has(value.id)) {
      throw new BOQListError('incomplete', 'รายการที่ได้รับไม่ถูกต้อง กรุณาลองอีกครั้ง', 'INVALID_LIST_RESULT');
    }
    seen.add(value.id);
  }
  return { rows: result.data as unknown as BOQListRow[], count, page: state.page };
}

export async function fetchBOQRoutes(
  supabase: SupabaseClient,
  ids: readonly string[],
  signal?: AbortSignal,
): Promise<Record<string, string[]>> {
  if (ids.length > LIST_PAGE_SIZE || ids.some(id => !UUID.test(id)) || new Set(ids).size !== ids.length) {
    throw new BOQListError('invalid', 'ขอบเขตรายการเส้นทางไม่ถูกต้อง', 'INVALID_ROUTE_PAGE');
  }
  const routes: Record<string, string[]> = Object.fromEntries(ids.map(id => [id, []]));
  if (ids.length === 0) return routes;

  let query = supabase.from('boq_routes')
    .select('id,boq_id,route_order,route_name', { count: 'exact' })
    .in('boq_id', [...ids])
    .order('boq_id', { ascending: true })
    .order('route_order', { ascending: true })
    .order('id', { ascending: true });
  if (signal) query = query.abortSignal(signal);
  let result;
  try {
    result = await query;
  } catch (error) {
    throw requestError(error);
  }
  if (result.error || result.status === 401 || result.status === 403) {
    throw requestError(result.error, result.status);
  }
  const count = validateCount(result.count);
  if (!Array.isArray(result.data) || result.data.length !== count) {
    throw new BOQListError('incomplete', 'โหลดเส้นทางไม่ครบ กรุณาลองอีกครั้ง', 'INCOMPLETE_ROUTE_RESULT');
  }
  const seen = new Set<string>();
  for (const row of result.data) {
    if (!record(row) || typeof row.id !== 'string' || !UUID.test(row.id) || seen.has(row.id)
      || typeof row.boq_id !== 'string' || !Object.hasOwn(routes, row.boq_id)
      || !Number.isInteger(row.route_order) || typeof row.route_name !== 'string') {
      throw new BOQListError('incomplete', 'ข้อมูลเส้นทางไม่ถูกต้อง กรุณาลองอีกครั้ง', 'INVALID_ROUTE_RESULT');
    }
    seen.add(row.id);
    routes[row.boq_id].push(row.route_name);
  }
  return routes;
}
