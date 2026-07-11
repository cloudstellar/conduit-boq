import { describe, expect, it } from 'vitest';
import { loadCatalogImportContext } from '../lib/master-catalog/admin/importContext';

describe('Master Catalog import context', () => {
  it('selects a draft only when it is based on the current pointer', async () => {
    const filters: Array<{ table: string; column: string; value: unknown }> = [];
    const supabase = {
      from(table: string) {
        const query = {
          select: () => query,
          eq(column: string, value: unknown) {
            filters.push({ table, column, value });
            return query;
          },
          order: () => query,
          limit: () => query,
          async maybeSingle() {
            if (table === 'price_list_default_version') {
              return { data: { version_id: 'current-version-id' }, error: null };
            }
            if (table === 'price_list_versions') {
              return { data: null, error: null };
            }
            throw new Error(`Unexpected table: ${table}`);
          },
        };
        return query;
      },
    } as unknown as Parameters<typeof loadCatalogImportContext>[0];

    const context = await loadCatalogImportContext(supabase);

    expect(context.draft).toBeNull();
    expect(filters).toContainEqual({
      table: 'price_list_versions',
      column: 'based_on_version_id',
      value: 'current-version-id',
    });
  });

  it('fails closed when the current pointer cannot be resolved', async () => {
    const supabase = {
      from() {
        const query = {
          select: () => query,
          eq: () => query,
          maybeSingle: async () => ({ data: null, error: new Error('pointer unavailable') }),
        };
        return query;
      },
    } as unknown as Parameters<typeof loadCatalogImportContext>[0];

    const context = await loadCatalogImportContext(supabase);

    expect(context.draft).toBeNull();
    expect(context.warnings).toContain(
      'โหลด current default สำหรับเลือกฉบับร่าง import ไม่สำเร็จ',
    );
  });
});
