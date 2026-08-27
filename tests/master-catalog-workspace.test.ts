import { describe, expect, it } from 'vitest';
import {
  CATALOG_CLIENT_FILTER_ROW_LIMIT,
  loadCatalogIdentityHistoryPage,
  loadCatalogVersionWorkspace,
} from '../lib/master-catalog/admin/catalogWorkspace';

function makeRows(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: `row-${index}`,
    identity_id: `identity-${index}`,
    item_code: `ITEM-${String(index + 1).padStart(4, '0')}`,
    item_name: `รายการ ${index + 1}`,
    unit: 'รายการ',
    material_cost: 10,
    labor_cost: 5,
    unit_cost: 15,
    category: 'CAT',
    category_id: 'category-1',
    code_group_id: null,
    is_active: true,
    display_order: index,
  }));
}

type WorkspaceFailure =
  | 'count'
  | 'items'
  | 'categories'
  | 'empty-categories'
  | 'groups'
  | 'empty-groups';

function mockWorkspaceClient(rowCount: number, failure?: WorkspaceFailure) {
  const priceRows = makeRows(rowCount);
  const ranges: Array<[number, number]> = [];

  const client = {
    from(table: string) {
      let countQuery = false;
      const query = {
        select: (_columns: string, options?: { head?: boolean }) => {
          countQuery = options?.head === true;
          return query;
        },
        eq: () => query,
        order: () => query,
        range: async (start: number, end: number) => {
          ranges.push([start, end]);
          if (failure === 'items') {
            return { data: null, error: new Error('items unavailable') };
          }
          return { data: priceRows.slice(start, end + 1), error: null };
        },
        then: (resolve: (value: unknown) => unknown) => {
          if (table === 'price_list' && countQuery) {
            return Promise.resolve(failure === 'count'
              ? { count: null, error: new Error('count unavailable') }
              : { count: rowCount, error: null }).then(resolve);
          }
          if (table === 'price_list_categories') {
            return Promise.resolve(failure === 'categories'
              ? { data: null, error: new Error('categories unavailable') }
              : {
                  data: failure === 'empty-categories'
                    ? []
                    : [{ id: 'category-1', code: 'CAT', name: 'หมวดทดสอบ', display_order: 0 }],
                  error: null,
                }).then(resolve);
          }
          if (table === 'catalog_code_groups') {
            return Promise.resolve(failure === 'groups'
              ? { data: null, error: new Error('groups unavailable') }
              : {
                  data: failure === 'empty-groups'
                    ? []
                    : [{
                        id: 'group-1',
                        work_context_code: 'TST',
                        work_context_name_th: 'งานทดสอบ',
                        item_type_code: 'ROW',
                        item_type_name_th: 'รายการทดสอบ',
                        display_order: 0,
                      }],
                  error: null,
                }).then(resolve);
          }
          throw new Error(`Unexpected query: ${table}`);
        },
      };
      return query;
    },
  } as unknown as Parameters<typeof loadCatalogVersionWorkspace>[0];

  return { client, ranges };
}

function mockIdentityHistoryClient(eventCount = 1) {
  let rpcCalls = 0;
  let directReads = 0;
  const projections: string[] = [];
  const changeItems = Array.from({ length: eventCount }, (_, index) => ({
    id: `change-item-${String(index).padStart(4, '0')}`,
    change_set_id: `change-set-${String(index).padStart(4, '0')}`,
    identity_id: 'identity-1',
    action: 'update',
    old_values: { labor_cost: 1_763 + index },
    new_values: { labor_cost: 1_764 + index },
    price_authority_reference: `MC-TEST-${String(index).padStart(4, '0')}`,
  }));
  const changeSets = Array.from({ length: eventCount }, (_, index) => ({
    id: `change-set-${String(index).padStart(4, '0')}`,
    version_id: 'version-1',
    change_type: 'manual',
    reason: `แก้ค่าแรงครั้งที่ ${index + 1}`,
    actor_display_name: 'Admin',
    created_at: new Date(Date.UTC(2026, 0, 1, 0, 0, index)).toISOString(),
  }));
  const client = {
    rpc: async () => {
      rpcCalls += 1;
      return {
        data: null,
        error: {
          code: 'P0001',
          message: 'CATALOG_FORBIDDEN: active enabled admin profile is required',
        },
      };
    },
    from(table: string) {
      directReads += 1;
      let result = { data: [] as Record<string, unknown>[], error: null };
      const query = {
        select: (columns: string) => {
          projections.push(`${table}:${columns}`);
          return query;
        },
        eq: () => query,
        order: () => query,
        range: async (start: number, end: number) => ({
          data: table === 'catalog_change_items'
            ? changeItems.slice(start, end + 1)
            : [],
          error: null,
        }),
        in: (_column: string, ids: string[]) => {
          result = {
            data: changeSets.filter((row) => ids.includes(row.id)),
            error: null,
          };
          return query;
        },
        then: (
          resolve: (value: typeof result) => unknown,
          reject?: (reason: unknown) => unknown,
        ) => Promise.resolve(result).then(resolve, reject),
      };
      return query;
    },
  } as unknown as Parameters<typeof loadCatalogIdentityHistoryPage>[0];

  return {
    client,
    rpcCalls: () => rpcCalls,
    directReads: () => directReads,
    projections: () => projections,
  };
}

describe('Master Catalog version workspace paging', () => {
  it('loads more than the default API cap in deterministic 500-row chunks', async () => {
    const mock = mockWorkspaceClient(1_201);

    const workspace = await loadCatalogVersionWorkspace(mock.client, 'version-1');

    expect(mock.ranges).toEqual([
      [0, 499],
      [500, 999],
      [1_000, 1_200],
    ]);
    expect(workspace.items).toHaveLength(1_201);
    expect(workspace.items[0]).toMatchObject({ itemCode: 'ITEM-0001', displayOrder: 0 });
    expect(workspace.items[599]).toMatchObject({ itemCode: 'ITEM-0600', displayOrder: 599 });
    expect(workspace.items[1_200]).toMatchObject({ itemCode: 'ITEM-1201', displayOrder: 1_200 });
    expect(workspace.complete).toBe(true);
    expect(workspace.mutationReady).toBe(true);
    expect(workspace.warnings).toEqual([]);
  });

  it('fails closed before loading unbounded client-filter data', async () => {
    const mock = mockWorkspaceClient(CATALOG_CLIENT_FILTER_ROW_LIMIT + 1);

    const workspace = await loadCatalogVersionWorkspace(mock.client, 'version-1');

    expect(mock.ranges).toEqual([]);
    expect(workspace.items).toEqual([]);
    expect(workspace.totalItems).toBe(CATALOG_CLIENT_FILTER_ROW_LIMIT + 1);
    expect(workspace.complete).toBe(false);
    expect(workspace.mutationReady).toBe(false);
    expect(workspace.warnings.join(' ')).toContain('เกินเพดาน');
  });

  it.each<WorkspaceFailure>([
    'count',
    'items',
    'categories',
    'empty-categories',
    'groups',
    'empty-groups',
  ])(
    'keeps mutation tools closed when the %s read is incomplete',
    async (failure) => {
      const mock = mockWorkspaceClient(3, failure);

      const workspace = await loadCatalogVersionWorkspace(mock.client, 'version-1');

      expect(workspace.mutationReady).toBe(false);
      expect(workspace.complete).toBe(!['count', 'items'].includes(failure));
      expect(workspace.warnings.length).toBeGreaterThan(0);
    },
  );
});

describe('Master Catalog identity history read mode', () => {
  it('uses the active-admin RLS path without calling the guarded RPC when the gate is disabled', async () => {
    const mock = mockIdentityHistoryClient();

    const page = await loadCatalogIdentityHistoryPage(
      mock.client,
      'identity-1',
      undefined,
      { readOnlyMode: true },
    );

    expect(mock.rpcCalls()).toBe(0);
    expect(mock.directReads()).toBe(2);
    expect(mock.projections()).toContain(
      'catalog_change_items:id,change_set_id,identity_id,action,old_values,new_values,price_authority_reference',
    );
    expect(page).toMatchObject({
      rows: [{
        id: 'change-set-0000',
        versionId: 'version-1',
        action: 'update',
        oldValues: { labor_cost: 1_763 },
        newValues: { labor_cost: 1_764 },
        priceAuthorityReference: 'MC-TEST-0000',
      }],
      nextCursor: null,
      warnings: [],
    });
  });

  it('returns deterministic read-only history pages without silently truncating them', async () => {
    const mock = mockIdentityHistoryClient(30);

    const first = await loadCatalogIdentityHistoryPage(
      mock.client,
      'identity-1',
      undefined,
      { readOnlyMode: true },
    );
    expect(first.rows).toHaveLength(25);
    expect(first.rows[0].id).toBe('change-set-0029');
    expect(first.rows[24].id).toBe('change-set-0005');
    expect(first.nextCursor).toEqual({
      createdAt: '2026-01-01T00:00:05.000Z',
      id: 'change-set-0005',
    });
    expect(first.warnings).toEqual([]);

    const second = await loadCatalogIdentityHistoryPage(
      mock.client,
      'identity-1',
      first.nextCursor ?? undefined,
      { readOnlyMode: true },
    );
    expect(second.rows.map((row) => row.id)).toEqual([
      'change-set-0004',
      'change-set-0003',
      'change-set-0002',
      'change-set-0001',
      'change-set-0000',
    ]);
    expect(second.nextCursor).toBeNull();
    expect(second.warnings).toEqual([]);
  });

  it('warns instead of claiming complete history beyond the client safety cap', async () => {
    const mock = mockIdentityHistoryClient(CATALOG_CLIENT_FILTER_ROW_LIMIT + 1);

    const page = await loadCatalogIdentityHistoryPage(
      mock.client,
      'identity-1',
      undefined,
      { readOnlyMode: true },
    );

    expect(page.rows).toHaveLength(25);
    expect(page.warnings.join(' ')).toContain('เกินเพดาน');
    expect(page.warnings.join(' ')).toContain('2,000');
  });

  it('does not report truncation when history exactly matches the client safety cap', async () => {
    const mock = mockIdentityHistoryClient(CATALOG_CLIENT_FILTER_ROW_LIMIT);

    const page = await loadCatalogIdentityHistoryPage(
      mock.client,
      'identity-1',
      undefined,
      { readOnlyMode: true },
    );

    expect(page.rows).toHaveLength(25);
    expect(page.warnings).toEqual([]);
  });

  it('keeps RPC errors fail-closed while mutation mode is enabled', async () => {
    const mock = mockIdentityHistoryClient();

    const page = await loadCatalogIdentityHistoryPage(mock.client, 'identity-1');

    expect(mock.rpcCalls()).toBe(1);
    expect(mock.directReads()).toBe(0);
    expect(page).toEqual({
      rows: [],
      nextCursor: null,
      warnings: ['โหลดประวัติรายการแบบแบ่งหน้าไม่สำเร็จ'],
    });
  });
});
