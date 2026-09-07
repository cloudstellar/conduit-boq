import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import type { LineItem } from '../components/boq/LineItemsTable';
import type { Route } from '../components/boq/RouteManager';
import { buildBOQRoutesPayload, loadBOQEditorData } from '../lib/boq/editorData';

interface QueryResult {
  data: unknown;
  error: unknown;
  count: number | null;
}

function result(data: unknown[], count = data.length): QueryResult {
  return { data, count, error: null };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(settle => { resolve = settle; });
  return { promise, resolve };
}

function mockClient(responses: Record<string, (QueryResult | Promise<QueryResult>)[]>) {
  const queries: {
    table: string;
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    is: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
  }[] = [];
  const from = vi.fn((table: string) => {
    const response = responses[table]?.shift();
    if (!response) throw new Error(`Unexpected query: ${table}`);
    const promise = Promise.resolve(response);
    const query = {
      table,
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: promise.then.bind(promise),
    };
    queries.push(query);
    return query;
  });
  return { client: { from } as unknown as SupabaseClient, from, queries };
}

const routeA: Route = {
  id: 'route-a', route_order: 1, route_name: 'A',
  route_description: '', construction_area: '',
  total_material_cost: 10, total_labor_cost: 20, total_cost: 30,
};
const routeB: Route = { ...routeA, id: 'route-b', route_order: 2, route_name: 'B' };
const item: LineItem = {
  id: 'item-a', item_order: 2, price_list_id: 'price-a', item_name: 'รายการทดสอบ',
  quantity: 1.234, unit: 'เมตร', material_cost_per_unit: 10.25,
  labor_cost_per_unit: 20.75, unit_cost: 31,
  total_material_cost: 12.6075, total_labor_cost: 25.5225, total_cost: 38.13,
  remarks: 'หมายเหตุ', category: '2',
};

describe('complete BOQ editor loading', () => {
  it('waits for every route item response and preserves server ordering and item values', async () => {
    const firstItems = deferred<QueryResult>();
    const secondItems = deferred<QueryResult>();
    const { client, queries } = mockClient({
      boq_routes: [result([
        { ...routeB, total_material_cost: '10', total_labor_cost: '20', total_cost: '30' },
        routeA,
      ])],
      boq_items: [firstItems.promise, secondItems.promise],
    });
    const settled = vi.fn();
    const loading = loadBOQEditorData(client, 'boq-a');
    void loading.then(settled);
    await vi.waitFor(() => expect(queries).toHaveLength(3));
    secondItems.resolve(result([]));
    await Promise.resolve();
    expect(settled).not.toHaveBeenCalled();
    const orderedItems = [{ ...item, id: 'first', item_order: 1 }, item];
    firstItems.resolve(result(orderedItems));

    await expect(loading).resolves.toEqual({
      routes: [routeB, routeA],
      routeItems: { 'route-b': orderedItems, 'route-a': [] },
      activeRouteId: 'route-b',
    });
    expect(queries[0].eq).toHaveBeenCalledWith('boq_id', 'boq-a');
    expect(queries[0].order).toHaveBeenCalledWith('route_order');
    expect(queries[1].eq).toHaveBeenCalledWith('route_id', 'route-b');
    expect(queries[2].eq).toHaveBeenCalledWith('route_id', 'route-a');
    for (const query of queries) expect(query.select).toHaveBeenCalledWith('*', { count: 'exact' });
    for (const query of queries.slice(1)) expect(query.order).toHaveBeenCalledWith('item_order');
  });

  it.each(['routes', 'items', 'legacy'])('rejects a %s query error instead of returning a partial graph', async stage => {
    const failure = { message: 'query failed', code: 'TEST' };
    const failed: QueryResult = { data: null, count: null, error: failure };
    const { client, from } = mockClient({
      boq_routes: [stage === 'routes' ? failed : result(stage === 'legacy' ? [] : [routeA, routeB])],
      boq_items: stage === 'items' ? [result([item]), failed] : [failed],
    });
    await expect(loadBOQEditorData(client, 'boq-a')).rejects.toBe(failure);
    if (stage === 'routes') expect(from).toHaveBeenCalledTimes(1);
  });

  const incomplete: [string, QueryResult][] = [
    ['null data', { data: null, count: 0, error: null }],
    ['non-array data', { data: {}, count: 0, error: null }],
    ['missing count', { data: [], count: null, error: null }],
    ['truncated data', { data: [], count: 1, error: null }],
    ['inconsistent count', { data: [item], count: 0, error: null }],
  ];
  describe.each(['routes', 'items', 'legacy'])('%s response completeness', stage => {
    it.each(incomplete)('rejects %s', async (_label, invalid) => {
      const { client } = mockClient({
        boq_routes: [stage === 'routes' ? invalid : result(stage === 'legacy' ? [] : [routeA])],
        boq_items: [invalid],
      });
      await expect(loadBOQEditorData(client, 'boq-a')).rejects.toThrow('ไม่ครบ');
    });
  });

  it('creates the existing initial route only after both empty responses succeed', async () => {
    const { client, queries } = mockClient({ boq_routes: [result([])], boq_items: [result([])] });
    const loaded = await loadBOQEditorData(client, 'new-boq');
    expect(loaded.routes).toEqual([{
      id: loaded.activeRouteId, route_order: 1, route_name: 'เส้นทาง 1',
      route_description: '', construction_area: '',
      total_material_cost: 0, total_labor_cost: 0, total_cost: 0,
    }]);
    expect(loaded.routeItems).toEqual({ [loaded.activeRouteId]: [] });
    expect(queries[1].eq).toHaveBeenCalledWith('boq_id', 'new-boq');
    expect(queries[1].is).toHaveBeenCalledWith('route_id', null);
    expect(buildBOQRoutesPayload(loaded.routes, loaded.routeItems)[0].items).toEqual([]);
  });

  it('preserves pure legacy items and their stored totals without recalculating prices', async () => {
    const legacyItems = [item, { ...item, id: 'custom', price_list_id: null }];
    const { client } = mockClient({ boq_routes: [result([])], boq_items: [result(legacyItems)] });
    const loaded = await loadBOQEditorData(client, 'legacy-boq');
    expect(loaded.routes[0]).toMatchObject({
      route_name: 'เส้นทางหลัก', route_order: 1,
      total_material_cost: item.total_material_cost * 2,
      total_labor_cost: item.total_labor_cost * 2,
      total_cost: item.total_cost * 2,
    });
    expect(loaded.routeItems[loaded.activeRouteId]).toEqual(legacyItems);
    expect(loaded.routes[0].id).toBe(loaded.activeRouteId);
  });
});

describe('BOQ route save payload completeness', () => {
  it('preserves the save contract, ordering and numeric values, including valid empty routes', () => {
    expect(buildBOQRoutesPayload([routeB, routeA], { 'route-b': [item], 'route-a': [] })).toEqual([
      {
        route_name: 'B', route_description: null, construction_area: null,
        total_material_cost: 10, total_labor_cost: 20, total_cost: 30,
        items: [{
          item_order: 2, price_list_id: 'price-a', item_name: 'รายการทดสอบ',
          quantity: 1.234, unit: 'เมตร', material_cost_per_unit: 10.25,
          labor_cost_per_unit: 20.75, unit_cost: 31,
          total_material_cost: 12.6075, total_labor_cost: 25.5225, total_cost: 38.13,
          remarks: 'หมายเหตุ', category: '2',
        }],
      },
      {
        route_name: 'A', route_description: null, construction_area: null,
        total_material_cost: 10, total_labor_cost: 20, total_cost: 30, items: [],
      },
    ]);
  });

  it('rejects an empty route set', () => {
    expect(() => buildBOQRoutesPayload([], {})).toThrow('ข้อมูลเส้นทาง');
  });

  it.each([
    ['missing', {}],
    ['undefined', { 'route-a': undefined }],
    ['null', { 'route-a': null }],
    ['object', { 'route-a': {} }],
    ['inherited', Object.create({ 'route-a': [] })],
    ['null record', null],
  ])('rejects %s item entries instead of silently saving empty children', (_label, entries) => {
    expect(() => buildBOQRoutesPayload([routeA], entries as Record<string, LineItem[]>)).toThrow('ไม่ครบ');
  });

  it('rejects a missing route even when another route has complete items', () => {
    expect(() => buildBOQRoutesPayload([routeA, routeB], { 'route-a': [item] })).toThrow('ไม่ครบ');
  });
});
