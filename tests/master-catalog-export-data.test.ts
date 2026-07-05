import { describe, expect, it } from 'vitest';
import {
  CatalogExportError,
  loadCatalogExportDataset,
  makeCatalogExportFilename,
} from '../lib/master-catalog/export/data';
import {
  hashCanonicalCatalogDatasetRows,
  type CanonicalCatalogDatasetRow,
} from '../lib/master-catalog/hash/canonicalDataset';

const VERSION_ID = '00000000-0000-4000-8000-000000000100';
const BASE_VERSION_ID = '00000000-0000-4000-8000-000000000099';

const CANONICAL_ROW: CanonicalCatalogDatasetRow = {
  identity_id: '00000000-0000-4000-8000-000000000001',
  item_code: 'AAA-BBB-001',
  item_name: 'รายการทดสอบ',
  unit: 'ม.',
  material_cost: '100.00',
  labor_cost: '25.00',
  unit_cost: '125.00',
  category_code: '1.1',
  category_name: 'หมวดทดสอบ',
  work_context_code: 'AAA',
  work_context_name_th: 'กลุ่มงานทดสอบ',
  item_type_code: 'BBB',
  item_type_name_th: 'ชนิดทดสอบ',
  is_active: true,
  display_order: 1,
};

describe('Master Catalog export data loader', () => {
  it('loads a selected published version, verifies count/hash, and avoids BOQ/Factor F tables', async () => {
    const datasetHash = await hashCanonicalCatalogDatasetRows([CANONICAL_ROW]);
    const calls: string[] = [];
    const client = createExportClient({ datasetHash }, calls);

    const dataset = await loadCatalogExportDataset(client, VERSION_ID);

    expect(dataset.version.versionString).toBe('2568.1.0');
    expect(dataset.version.basedOnVersionString).toBe('2568.0.0');
    expect(dataset.canonicalDatasetHash).toBe(datasetHash);
    expect(dataset.counts.rowCount).toBe(1);
    expect(makeCatalogExportFilename(dataset, 'xlsx'))
      .toBe('NT-Master-Catalog-v2568.1.0-20260622.xlsx');
    expect(calls.some((table) => table.includes('boq'))).toBe(false);
    expect(calls.some((table) => table.includes('factor_'))).toBe(false);
  });

  it('fails closed when published item_count does not match selected rows', async () => {
    const datasetHash = await hashCanonicalCatalogDatasetRows([CANONICAL_ROW]);
    const client = createExportClient({
      datasetHash,
      versionOverrides: { item_count: 2 },
    });

    await expect(loadCatalogExportDataset(client, VERSION_ID))
      .rejects.toMatchObject({
        code: 'CATALOG_EXPORT_COUNT_MISMATCH',
        status: 409,
      });
  });

  it('keeps draft export behind the active-admin feature gate', async () => {
    const datasetHash = await hashCanonicalCatalogDatasetRows([CANONICAL_ROW]);
    const client = createExportClient({
      datasetHash,
      featureFlag: false,
      versionOverrides: {
        status: 'draft',
        dataset_hash: null,
        item_count: 1,
        effective_date: null,
      },
    });

    await expect(loadCatalogExportDataset(client, VERSION_ID))
      .rejects.toMatchObject({
        code: 'CATALOG_EXPORT_FORBIDDEN',
        status: 403,
      });
  });
});

type ExportClientOptions = {
  datasetHash: string;
  featureFlag?: boolean;
  versionOverrides?: Record<string, unknown>;
};

function createExportClient(
  options: ExportClientOptions,
  calls: string[] = [],
): Parameters<typeof loadCatalogExportDataset>[0] {
  const versionRow = {
    id: VERSION_ID,
    version_string: '2568.1.0',
    name: 'Published catalog',
    status: 'active',
    is_default: true,
    based_on_version_id: BASE_VERSION_ID,
    effective_date: '2026-06-22',
    approval_reference: 'TEST-APPROVAL',
    approval_document_date: '2026-06-21',
    published_at: '2026-06-22T02:00:00.000Z',
    published_by_display_name: 'Publisher',
    dataset_hash: options.datasetHash,
    item_count: 1,
    lock_version: 1,
    created_at: '2026-06-21T02:00:00.000Z',
    updated_at: '2026-06-22T02:00:00.000Z',
    ...options.versionOverrides,
  };
  const baseVersionRow = {
    ...versionRow,
    id: BASE_VERSION_ID,
    version_string: '2568.0.0',
    based_on_version_id: null,
  };

  return {
    auth: {
      getUser: async () => ({ data: { user: { id: 'user-admin' } }, error: null }),
    },
    from: (table: string) => {
      calls.push(`from:${table}`);
      const filters = new Map<string, unknown>();
      const query = {
        select: () => query,
        eq: (column: string, value: unknown) => {
          filters.set(column, value);
          return query;
        },
        order: () => query,
        limit: () => query,
        in: (column: string, values: unknown[]) => {
          filters.set(column, values);
          return query;
        },
        maybeSingle: async () => maybeSingle(table, filters, versionRow, baseVersionRow, options),
        then: (
          resolve: (value: unknown) => unknown,
          reject?: (reason: unknown) => unknown,
        ) => Promise.resolve(listRows(table)).then(resolve, reject),
      };

      return query;
    },
  } as unknown as Parameters<typeof loadCatalogExportDataset>[0];
}

function maybeSingle(
  table: string,
  filters: ReadonlyMap<string, unknown>,
  versionRow: Record<string, unknown>,
  baseVersionRow: Record<string, unknown>,
  options: ExportClientOptions,
) {
  if (table === 'user_profiles') {
    return {
      data: {
        id: 'user-admin',
        email: 'admin@ntplc.co.th',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        status: 'active',
      },
      error: null,
    };
  }

  if (table === 'price_list_versions') {
    const id = filters.get('id');
    return {
      data: id === BASE_VERSION_ID ? baseVersionRow : versionRow,
      error: null,
    };
  }

  if (table === 'price_list_default_version') {
    return { data: { version_id: VERSION_ID }, error: null };
  }

  if (table === 'app_settings') {
    return { data: { value: options.featureFlag ?? true }, error: null };
  }

  throw new CatalogExportError('TEST_UNEXPECTED_TABLE', `Unexpected table: ${table}`);
}

function listRows(table: string) {
  if (table === 'price_list') {
    return {
      data: [{
        id: 'price-row-1',
        identity_id: CANONICAL_ROW.identity_id,
        item_code: CANONICAL_ROW.item_code,
        item_name: CANONICAL_ROW.item_name,
        unit: CANONICAL_ROW.unit,
        material_cost: 100,
        labor_cost: 25,
        unit_cost: 125,
        category: '1.1',
        category_id: 'cat-1',
        code_group_id: 'group-1',
        is_active: true,
        display_order: CANONICAL_ROW.display_order,
      }],
      error: null,
    };
  }

  if (table === 'price_list_categories') {
    return {
      data: [{
        id: 'cat-1',
        code: CANONICAL_ROW.category_code,
        name: CANONICAL_ROW.category_name,
        display_order: 1,
      }],
      error: null,
    };
  }

  if (table === 'catalog_code_groups') {
    return {
      data: [{
        id: 'group-1',
        work_context_code: CANONICAL_ROW.work_context_code,
        work_context_name_th: CANONICAL_ROW.work_context_name_th,
        work_context_name_en: null,
        item_type_code: CANONICAL_ROW.item_type_code,
        item_type_name_th: CANONICAL_ROW.item_type_name_th,
        item_type_name_en: null,
        display_order: 1,
      }],
      error: null,
    };
  }

  if (table === 'catalog_change_sets' || table === 'catalog_imports') {
    return { data: [], error: null };
  }

  throw new CatalogExportError('TEST_UNEXPECTED_TABLE', `Unexpected table: ${table}`);
}
