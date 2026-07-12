import { describe, expect, it } from 'vitest';
import { loadCatalogImportContext } from '../lib/master-catalog/admin/importContext';

const CURRENT_ID = '00000000-0000-4000-8000-000000000001';
const CURRENT_DRAFT_ID = '00000000-0000-4000-8000-000000000101';
const STALE_DRAFT_ID = '00000000-0000-4000-8000-000000000102';

function mockSupabase(options: { pointerId: string | null; pointerError?: boolean }) {
  const draftRows = [
    {
      id: CURRENT_DRAFT_ID,
      version_string: '2568.1.0',
      status: 'draft',
      lock_version: 3,
      based_on_version_id: CURRENT_ID,
      created_at: '2026-07-12T00:00:00Z',
    },
    {
      id: STALE_DRAFT_ID,
      version_string: '2568.0.1',
      status: 'draft',
      lock_version: 1,
      based_on_version_id: '00000000-0000-4000-8000-000000000099',
      created_at: '2026-07-11T00:00:00Z',
    },
  ];

  return {
    from(table: string) {
      const result = table === 'price_list_versions'
        ? { data: draftRows, error: null }
        : { data: null, error: null };
      const query = {
        select: () => query,
        eq: () => query,
        in: () => query,
        order: () => query,
        async maybeSingle() {
          if (table !== 'price_list_default_version') {
            throw new Error(`Unexpected maybeSingle table: ${table}`);
          }
          return options.pointerError
            ? { data: null, error: new Error('pointer unavailable') }
            : { data: options.pointerId ? { version_id: options.pointerId } : null, error: null };
        },
        then(resolve: (value: typeof result) => unknown) {
          return Promise.resolve(result).then(resolve);
        },
      };
      return query;
    },
  } as unknown as Parameters<typeof loadCatalogImportContext>[0];
}

describe('Master Catalog import context', () => {
  it('lists every draft but never chooses one without an explicit draftId', async () => {
    const context = await loadCatalogImportContext(mockSupabase({ pointerId: CURRENT_ID }));

    expect(context.draft).toBeNull();
    expect(context.drafts).toEqual([
      expect.objectContaining({ id: CURRENT_DRAFT_ID, isCurrentBase: true }),
      expect.objectContaining({ id: STALE_DRAFT_ID, isCurrentBase: false }),
    ]);
    expect(context.authorityReady).toBe(false);
  });

  it('selects an explicit stale draft as read-only and does not load mutation authority', async () => {
    const context = await loadCatalogImportContext(
      mockSupabase({ pointerId: CURRENT_ID }),
      STALE_DRAFT_ID,
    );

    expect(context.draft).toMatchObject({ id: STALE_DRAFT_ID, isCurrentBase: false });
    expect(context.authorityReady).toBe(false);
    expect(context.parseContext).toEqual({});
    expect(context.warnings).toContain(
      'ฉบับร่างนี้อ้างอิงฐานเก่า จึงเปิดดูได้อย่างเดียวและห้ามสร้างการนำเข้าใหม่',
    );
  });

  it('fails closed when the current pointer cannot be resolved', async () => {
    const context = await loadCatalogImportContext(mockSupabase({
      pointerId: null,
      pointerError: true,
    }));

    expect(context.draft).toBeNull();
    expect(context.drafts.every((draft) => !draft.isCurrentBase)).toBe(true);
    expect(context.warnings).toContain(
      'โหลดเวอร์ชันใช้งานปัจจุบันสำหรับตรวจฐานของฉบับร่างไม่สำเร็จ',
    );
  });
});
