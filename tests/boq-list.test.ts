import { createClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import {
  BOQ_LIST_COLUMNS,
  BOQListError,
  LIST_MAX_OFFSET,
  LIST_PAGE_SIZE,
  LIST_SEARCH_MAX_LENGTH,
  buildBOQListSearch,
  fetchBOQPage,
  fetchBOQRoutes,
  isListAuthorizationError,
  isListRangeError,
  normalizeBOQListState,
  type ListSort,
} from '../lib/boq/list';

const uuid = (number: number) => `00000000-0000-4000-8000-${number.toString(16).padStart(12, '0')}`;
const state = { page: 1, q: '', sort: 'created_desc' as const };
const row = (number: number) => ({
  id: uuid(number),
  boq_number: `BOQ-${number}`,
  estimator_name: 'Local unit actor',
  document_date: '2026-10-23',
  project_name: `Project ${number}`,
  route: null,
  updated_at: '2026-10-23T01:02:03.123456+00:00',
  factor_f: 1.2345,
  factor_f_raw: 1.23456789,
  catalog_version: { version_string: '2568.1.0' },
  factor_version: { version_string: '2569.0.0' },
});

function clientFor(
  data: unknown,
  count: number | null,
  options: { status?: number; error?: unknown } = {},
) {
  const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response(
    JSON.stringify(options.error ?? data),
    {
      status: options.status ?? 200,
      headers: {
        'content-type': 'application/json',
        ...(count === null ? {} : { 'content-range': `0-${Math.max(0, Array.isArray(data) ? data.length - 1 : 0)}/${count}` }),
      },
    },
  ));
  const client = createClient('http://127.0.0.1:54321', 'unit-only-publishable-key', {
    global: { fetch },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return {
    client,
    fetch,
    url: () => new URL(String(fetch.mock.calls[0][0])),
    headers: () => new Headers(fetch.mock.calls[0][1]?.headers),
  };
}

describe('BOQ list query state', () => {
  it.each([undefined, null, '', '0', '-1', '2.5', '2tail', '1e2', ' 2 ', 'Infinity', '0x10', 0, -1, NaN, Infinity, 2.5, Number.MAX_SAFE_INTEGER])(
    'normalizes invalid page %j to page one before sending a request', (page) => {
      expect(normalizeBOQListState({ page }).page).toBe(1);
    },
  );

  it('accepts whole decimal pages and bounds the inclusive range arithmetic', () => {
    expect(normalizeBOQListState({ page: '12' }).page).toBe(12);
    const maxPage = LIST_MAX_OFFSET / LIST_PAGE_SIZE + 1;
    expect(normalizeBOQListState({ page: maxPage }).page).toBe(maxPage);
    expect(normalizeBOQListState({ page: maxPage + 1 }).page).toBe(1);
  });

  it('uses only supported sorts and trims the search text without modifying its interior', () => {
    expect(normalizeBOQListState({ page: '2', q: '  ท่อ A, B  ', sort: 'project_asc' }))
      .toEqual({ page: 2, q: 'ท่อ A, B', sort: 'project_asc' });
    expect(normalizeBOQListState({ sort: 'total_cost' }).sort).toBe('created_desc');
  });

  it.each(['x'.repeat(LIST_SEARCH_MAX_LENGTH + 1), 'bad\u0000term', 'line\nbreak', 'bad\u007fterm'])(
    'rejects unsupported search input without including its text in the error', (q) => {
      expect(() => normalizeBOQListState({ q })).toThrowError(BOQListError);
      try {
        normalizeBOQListState({ q });
      } catch (error) {
        expect(error).toMatchObject({ kind: 'invalid', code: 'INVALID_LIST_SEARCH' });
        expect((error as Error).message).not.toContain(q);
      }
    },
  );

  it.each([
    'ธรรมดา', 'A, B', 'A.B', '(A:B)', 'a"b', 'A\\B', '100%', 'A_B', 'A*B',
    '.*', 'a|b', '[A-Z]+', 'x),id.not.is.null', '^start$ and {2}?',
  ])('encodes %j as literal case-insensitive text, not regex or PostgREST grammar', (q) => {
    const expression = buildBOQListSearch(q);
    // A quoted PostgREST value escapes backslashes/quotes just like a JSON
    // string for these bounded, non-control-character inputs.
    const terms = [...expression.matchAll(/(project_name|boq_number|estimator_name|route)\.imatch\.("(?:\\.|[^"\\])*")/g)];
    expect(terms).toHaveLength(4);
    expect(terms.map(term => term[1])).toEqual(['project_name', 'boq_number', 'estimator_name', 'route']);
    const pattern = JSON.parse(terms[0][2]) as string;
    const literalPattern = new RegExp(pattern, 'i');
    expect(literalPattern.test(`prefix ${q} suffix`)).toBe(true);
    expect(literalPattern.test('definitely unrelated')).toBe(false);
    expect(new Set(terms.map(term => term[2])).size).toBe(1);
  });

  it('does not reinterpret wildcard characters as arbitrary matches', () => {
    const pattern = (q: string) => JSON.parse(buildBOQListSearch(q).match(/\.imatch\.("(?:\\.|[^"\\])*")/)![1]) as string;
    expect(new RegExp(pattern('A*B'), 'i').test('A wildcard B')).toBe(false);
    expect(new RegExp(pattern('100%'), 'i').test('1000')).toBe(false);
    expect(new RegExp(pattern('A_B'), 'i').test('AxB')).toBe(false);
    expect(buildBOQListSearch('')).toBe('');
  });
});

describe('BOQ page transport', () => {
  it('gets one server page with exact total, explicit Copy fields and a unique server order', async () => {
    const rows = Array.from({ length: 25 }, (_, index) => row(index + 1));
    const stub = clientFor(rows, 77);
    await expect(fetchBOQPage(stub.client, { ...state, page: 2, q: 'A*B' }))
      .resolves.toEqual({ rows, count: 77, page: 2 });
    expect(stub.fetch).toHaveBeenCalledTimes(1);
    expect(stub.url().pathname).toBe('/rest/v1/boq');
    expect(stub.url().searchParams.get('offset')).toBe('25');
    expect(stub.url().searchParams.get('limit')).toBe('25');
    expect(stub.url().searchParams.get('order')).toBe('created_at.desc.nullslast,id.desc');
    expect(stub.url().searchParams.get('or')).toBe(`(${buildBOQListSearch('A*B')})`);
    expect(stub.headers().get('prefer')).toBe('count=exact');
    expect(stub.url().searchParams.get('select')).toBe(BOQ_LIST_COLUMNS);
    expect(BOQ_LIST_COLUMNS).not.toContain('*');
    for (const column of [
      'updated_at', 'factor_f_raw', 'factor_f_lower_cost', 'factor_f_upper_cost',
      'factor_f_lower_value', 'factor_f_upper_value', 'created_by', 'assigned_to',
      'org_id', 'department_id', 'sector_id',
    ]) {
      expect(BOQ_LIST_COLUMNS.split(',')).toContain(column);
    }
  });

  it.each([
    ['document_desc', 'document_date.desc.nullslast,id.desc'],
    ['project_asc', 'project_name.asc.nullslast,id.asc'],
  ] as const)('orders %s on the server with a matching id tie-breaker', async (sort: ListSort, order) => {
    const stub = clientFor([row(1)], 1);
    await fetchBOQPage(stub.client, { ...state, sort });
    expect(stub.url().searchParams.get('order')).toBe(order);
  });

  it('accepts an honest empty result and a short final page', async () => {
    const empty = clientFor([], 0);
    await expect(fetchBOQPage(empty.client, state)).resolves.toEqual({ rows: [], count: 0, page: 1 });
    const final = clientFor([row(1), row(2)], 27);
    await expect(fetchBOQPage(final.client, { ...state, page: 2 })).resolves.toMatchObject({ count: 27, page: 2 });
  });

  it.each([
    [[], null], [null, 0], [[row(1)], 26], [Array.from({ length: 26 }, (_, i) => row(i + 1)), 26],
  ])('rejects missing count/data or a capped/oversized page', async (data, count) => {
    const stub = clientFor(data, count as number | null);
    await expect(fetchBOQPage(stub.client, state)).rejects.toMatchObject({ kind: 'incomplete' });
  });

  it('rejects duplicated IDs instead of showing two copies of the same BOQ', async () => {
    const stub = clientFor([row(1), row(1)], 2);
    await expect(fetchBOQPage(stub.client, state)).rejects.toMatchObject({ code: 'INVALID_LIST_RESULT' });
  });

  it.each([
    { status: 416, error: { code: 'PGRST103', message: 'out of range' }, count: null },
    { status: 200, error: undefined, count: 1 },
  ])('classifies a stale out-of-range page for one caller-controlled recovery', async ({ status, error, count }) => {
    const stub = clientFor([], count, { status, error });
    const errorResult = await fetchBOQPage(stub.client, { ...state, page: 3 }).catch(error => error);
    expect(isListRangeError(errorResult)).toBe(true);
    expect(stub.fetch).toHaveBeenCalledTimes(1);
  });

  it.each([401, 403])('classifies HTTP %s as a whole-page authorization failure', async (status) => {
    const stub = clientFor(null, null, { status, error: { code: '42501', message: 'denied' } });
    const error = await fetchBOQPage(stub.client, state).catch(error => error);
    expect(isListAuthorizationError(error)).toBe(true);
    expect(error).toMatchObject({ kind: 'authorization', status });
  });

  it('keeps ordinary API failure separate from empty or authorization state, without leaking the query', async () => {
    const stub = clientFor(null, null, { status: 400, error: { code: 'PGRST100', message: 'private search text', details: 'private search text' } });
    const error = await fetchBOQPage(stub.client, state).catch(error => error);
    expect(error).toMatchObject({ kind: 'request', code: 'PGRST100' });
    expect(isListAuthorizationError(error)).toBe(false);
    expect(isListRangeError(error)).toBe(false);
    expect(JSON.stringify(error)).not.toContain('private search text');
    expect(error.message).not.toContain('private search text');
  });

  it('forwards cancellation but does not implement automatic recovery/retry', async () => {
    const stub = clientFor([], 0);
    const controller = new AbortController();
    await fetchBOQPage(stub.client, state, { signal: controller.signal });
    expect(stub.fetch.mock.calls[0][1]?.signal).toBe(controller.signal);
    expect(stub.fetch).toHaveBeenCalledTimes(1);
  });
});

describe('current-page route batch', () => {
  const route = (id: number, parent: number, order: number, name: string) => ({
    id: uuid(id), boq_id: uuid(parent), route_order: order, route_name: name,
  });

  it('gets routes once, preserves comma names and returns empty arrays for true zero-route parents', async () => {
    const stub = clientFor([
      route(101, 1, 1, 'A, B'), route(102, 1, 2, 'C'), route(103, 2, 1, 'one route'),
    ], 3);
    await expect(fetchBOQRoutes(stub.client, [uuid(1), uuid(2), uuid(3)]))
      .resolves.toEqual({ [uuid(1)]: ['A, B', 'C'], [uuid(2)]: ['one route'], [uuid(3)]: [] });
    expect(stub.fetch).toHaveBeenCalledTimes(1);
    expect(stub.url().pathname).toBe('/rest/v1/boq_routes');
    expect(stub.url().searchParams.get('select')).toBe('id,boq_id,route_order,route_name');
    expect(stub.url().searchParams.get('boq_id')).toBe(`in.(${uuid(1)},${uuid(2)},${uuid(3)})`);
    expect(stub.url().searchParams.get('order')).toBe('boq_id.asc,route_order.asc,id.asc');
    expect(stub.headers().get('prefer')).toBe('count=exact');
  });

  it('does not issue a route query for an empty page', async () => {
    const stub = clientFor([], 0);
    await expect(fetchBOQRoutes(stub.client, [])).resolves.toEqual({});
    expect(stub.fetch).not.toHaveBeenCalled();
  });

  it.each([
    [[route(101, 1, 1, 'A')], 2], [[route(101, 1, 1, 'A')], null], [null, 0],
  ])('refuses missing or partial route data rather than inventing a legacy count', async (data, count) => {
    const stub = clientFor(data, count as number | null);
    await expect(fetchBOQRoutes(stub.client, [uuid(1)])).rejects.toMatchObject({ kind: 'incomplete' });
  });

  it.each([
    [route(101, 9, 1, 'outside page')],
    [route(101, 1, 1, 'A'), route(101, 1, 2, 'duplicate')],
    [{ ...route(101, 1, 1, 'A'), route_name: null }],
    [{ ...route(101, 1, 1, 'A'), route_order: 1.5 }],
  ])('rejects routes outside the requested page or malformed identities/order/names', async (...rows) => {
    const stub = clientFor(rows, rows.length);
    await expect(fetchBOQRoutes(stub.client, [uuid(1)])).rejects.toMatchObject({ code: 'INVALID_ROUTE_RESULT' });
  });

  it.each([
    ['unsafe syntax'], [uuid(1), uuid(1)], Array.from({ length: 26 }, (_, i) => uuid(i + 1)),
  ])('rejects invalid or oversized parent scopes before any request', async (...ids) => {
    const stub = clientFor([], 0);
    await expect(fetchBOQRoutes(stub.client, ids)).rejects.toMatchObject({ code: 'INVALID_ROUTE_PAGE' });
    expect(stub.fetch).not.toHaveBeenCalled();
  });

  it('classifies route permission errors so the caller invalidates the whole actor page', async () => {
    const stub = clientFor(null, null, { status: 403, error: { code: '42501', message: 'denied' } });
    const error = await fetchBOQRoutes(stub.client, [uuid(1)]).catch(error => error);
    expect(isListAuthorizationError(error)).toBe(true);
  });
});

describe('shared list error classification', () => {
  it('recognizes existing active-profile errors as authorization failures', () => {
    expect(isListAuthorizationError({ code: 'ACCOUNT_NOT_ACTIVE' })).toBe(true);
    expect(isListAuthorizationError({ code: 'AUTHORIZATION_UNAVAILABLE' })).toBe(true);
    expect(isListAuthorizationError({ code: 'UNAUTHENTICATED' })).toBe(true);
    expect(isListAuthorizationError({ code: 'PGRST301' })).toBe(true);
    expect(isListAuthorizationError(null)).toBe(false);
    expect(isListRangeError(undefined)).toBe(false);
  });
});
