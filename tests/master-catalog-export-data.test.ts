import { describe, expect, it } from 'vitest';
import {
  CATALOG_EXPORT_DOCUMENT_TITLE,
  CatalogExportError,
  loadCatalogExportDataset,
  makeCatalogExportDocumentTitle,
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
  it('builds field-facing document titles from the version major year', () => {
    expect(makeCatalogExportDocumentTitle('2568.0.0'))
      .toBe(`${CATALOG_EXPORT_DOCUMENT_TITLE} ประจำปี 2568`);
    expect(makeCatalogExportDocumentTitle('2569.1.0'))
      .toBe(`${CATALOG_EXPORT_DOCUMENT_TITLE} ประจำปี 2569`);
  });

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

  it('exports an older selected published version without following the current pointer', async () => {
    const datasetHash = await hashCanonicalCatalogDatasetRows([CANONICAL_ROW]);
    const client = createExportClient({
      datasetHash,
      currentDefaultVersionId: VERSION_ID,
    });

    const dataset = await loadCatalogExportDataset(client, BASE_VERSION_ID);

    expect(dataset.version.id).toBe(BASE_VERSION_ID);
    expect(dataset.version.versionString).toBe('2568.0.0');
    expect(dataset.version.isCurrentDefault).toBe(false);
    expect(dataset.canonicalDatasetHash).toBe(datasetHash);
    expect(makeCatalogExportFilename(dataset, 'xlsx'))
      .toBe('NT-Master-Catalog-v2568.0.0-20260622.xlsx');
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

  it('loads all selected rows with paged queries before verifying official count/hash', async () => {
    const canonicalRows = makeCanonicalRows(1001);
    const datasetHash = await hashCanonicalCatalogDatasetRows(canonicalRows);
    const calls: string[] = [];
    const client = createExportClient({ canonicalRows, datasetHash }, calls);

    const dataset = await loadCatalogExportDataset(client, VERSION_ID);

    expect(dataset.counts.rowCount).toBe(1001);
    expect(dataset.canonicalDatasetHash).toBe(datasetHash);
    expect(calls).toContain('range:price_list:0-999');
    expect(calls).toContain('range:price_list:1000-1999');
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

  it('loads an active-admin draft as a marked non-official export', async () => {
    const datasetHash = await hashCanonicalCatalogDatasetRows([CANONICAL_ROW]);
    const client = createExportClient({
      datasetHash,
      featureFlag: true,
      versionOverrides: {
        status: 'draft',
        dataset_hash: null,
        item_count: null,
        effective_date: null,
        approval_reference: null,
        approval_document_date: null,
        published_at: null,
        published_by_display_name: null,
      },
    });

    const dataset = await loadCatalogExportDataset(client, VERSION_ID);

    expect(dataset.isDraftExport).toBe(true);
    expect(dataset.isOfficialPublishedExport).toBe(false);
    expect(dataset.canonicalDatasetHash).toBe(datasetHash);
    expect(makeCatalogExportFilename(dataset, 'pdf'))
      .toMatch(/^DRAFT-NT-Master-Catalog-v2568\.1\.0-\d{8}\.pdf$/);
  });

  it('keeps an abandoned draft as non-exportable audit history', async () => {
    const datasetHash = await hashCanonicalCatalogDatasetRows([CANONICAL_ROW]);
    const client = createExportClient({
      datasetHash,
      featureFlag: true,
      versionOverrides: { status: 'abandoned' },
    });

    await expect(loadCatalogExportDataset(client, VERSION_ID))
      .rejects.toMatchObject({
        code: 'CATALOG_EXPORT_UNSUPPORTED_STATUS',
        status: 409,
      });
  });
});

type ExportClientOptions = {
  canonicalRows?: CanonicalCatalogDatasetRow[];
  currentDefaultVersionId?: string | null;
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
    item_count: options.canonicalRows?.length ?? 1,
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
      let range: { from: number; to: number } | null = null;
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
        range: (from: number, to: number) => {
          range = { from, to };
          calls.push(`range:${table}:${from}-${to}`);
          return query;
        },
        maybeSingle: async () => maybeSingle(table, filters, versionRow, baseVersionRow, options),
        then: (
          resolve: (value: unknown) => unknown,
          reject?: (reason: unknown) => unknown,
        ) => Promise.resolve(listRows(table, options, range)).then(resolve, reject),
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
    return {
      data: { version_id: options.currentDefaultVersionId ?? VERSION_ID },
      error: null,
    };
  }

  if (table === 'app_settings') {
    return { data: { value: options.featureFlag ?? true }, error: null };
  }

  throw new CatalogExportError('TEST_UNEXPECTED_TABLE', `Unexpected table: ${table}`);
}

function listRows(
  table: string,
  options: ExportClientOptions,
  range: { from: number; to: number } | null,
) {
  if (table === 'price_list') {
    return {
      data: sliceRange(toPriceRows(options.canonicalRows ?? [CANONICAL_ROW]), range),
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

function makeCanonicalRows(count: number): CanonicalCatalogDatasetRow[] {
  return Array.from({ length: count }, (_, index) => {
    const sequence = index + 1;

    return {
      ...CANONICAL_ROW,
      identity_id: `00000000-0000-4000-8000-${String(sequence).padStart(12, '0')}`,
      item_code: `AAA-BBB-${String(sequence).padStart(4, '0')}`,
      display_order: index,
    };
  });
}

function toPriceRows(rows: CanonicalCatalogDatasetRow[]): Record<string, unknown>[] {
  return rows.map((row, index) => ({
    id: `price-row-${index + 1}`,
    identity_id: row.identity_id,
    item_code: row.item_code,
    item_name: row.item_name,
    unit: row.unit,
    material_cost: row.material_cost,
    labor_cost: row.labor_cost,
    unit_cost: row.unit_cost,
    category: row.category_code,
    category_id: 'cat-1',
    code_group_id: 'group-1',
    is_active: row.is_active,
    display_order: row.display_order,
  }));
}

function sliceRange(
  rows: Record<string, unknown>[],
  range: { from: number; to: number } | null,
): Record<string, unknown>[] {
  if (!range) {
    return rows;
  }

  return rows.slice(range.from, range.to + 1);
}
