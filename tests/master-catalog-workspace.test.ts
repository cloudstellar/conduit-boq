import { describe, expect, it } from 'vitest';
import {
  CATALOG_CLIENT_FILTER_ROW_LIMIT,
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

function mockWorkspaceClient(rowCount: number) {
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
          return { data: priceRows.slice(start, end + 1), error: null };
        },
        then: (resolve: (value: unknown) => unknown) => {
          if (table === 'price_list' && countQuery) {
            return Promise.resolve({ count: rowCount, error: null }).then(resolve);
          }
          if (table === 'price_list_categories') {
            return Promise.resolve({
              data: [{ id: 'category-1', code: 'CAT', name: 'หมวดทดสอบ', display_order: 0 }],
              error: null,
            }).then(resolve);
          }
          if (table === 'catalog_code_groups') {
            return Promise.resolve({
              data: [{
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
    expect(workspace.warnings).toEqual([]);
  });

  it('fails closed before loading unbounded client-filter data', async () => {
    const mock = mockWorkspaceClient(CATALOG_CLIENT_FILTER_ROW_LIMIT + 1);

    const workspace = await loadCatalogVersionWorkspace(mock.client, 'version-1');

    expect(mock.ranges).toEqual([]);
    expect(workspace.items).toEqual([]);
    expect(workspace.totalItems).toBe(CATALOG_CLIENT_FILTER_ROW_LIMIT + 1);
    expect(workspace.warnings.join(' ')).toContain('เกินเพดาน');
  });
});
