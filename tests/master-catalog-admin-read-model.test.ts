import { describe, expect, it } from 'vitest';
import {
  formatThaiNumber,
  isActiveAdminProfile,
  isCatalogAdminEnabled,
  loadCatalogAdminGate,
  loadCatalogAdminOverview,
  loadCatalogVersionReview,
  loadCatalogVersionsRegisterPage,
  shortHash,
} from '../lib/master-catalog/admin/readModel';

type GateClientOptions = {
  user: { id: string } | null;
  profile?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    status: string;
  } | null;
  profileError?: Error | null;
  setting?: { value: unknown } | null;
  settingError?: Error | null;
};

function createGateClient(options: GateClientOptions): Parameters<typeof loadCatalogAdminGate>[0] {
  return {
    auth: {
      getUser: async () => ({ data: { user: options.user } }),
    },
    from: (table: string) => {
      const query = {
        select: () => query,
        eq: () => query,
        maybeSingle: async () => {
          if (table === 'user_profiles') {
            return {
              data: options.profile ?? null,
              error: options.profileError ?? null,
            };
          }

          if (table === 'app_settings') {
            return {
              data: options.setting ?? null,
              error: options.settingError ?? null,
            };
          }

          throw new Error(`Unexpected table: ${table}`);
        },
      };

      return query;
    },
  } as unknown as Parameters<typeof loadCatalogAdminGate>[0];
}

function createOverviewClientWithFactorPointerError(): Parameters<typeof loadCatalogAdminOverview>[0] {
  const queryResult = (table: string) => {
    if (table === 'factor_reference_default_version') {
      return {
        data: null,
        error: new Error('factor pointer unavailable'),
      };
    }

    if (table === 'price_list_default_version') {
      return { data: null, error: null };
    }

    if (table === 'catalog_item_identities' || table === 'catalog_item_codes') {
      return { count: 0, error: null };
    }

    return { data: [], error: null };
  };

  return {
    from: (table: string) => {
      const query = {
        select: () => query,
        order: () => query,
        limit: () => query,
        eq: () => query,
        maybeSingle: async () => queryResult(table),
        then: (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) =>
          Promise.resolve(queryResult(table)).then(resolve, reject),
      };

      return query;
    },
  } as unknown as Parameters<typeof loadCatalogAdminOverview>[0];
}

function createRegisterClient(error: { code: string; message: string }) {
  let fallbackReads = 0;
  const result = { data: [], error: null };
  const client = {
    rpc: async () => ({ data: null, error }),
    from: () => {
      fallbackReads += 1;
      const query = {
        select: () => query,
        order: () => query,
        limit: () => query,
        lt: () => query,
        or: () => query,
        then: (resolve: (value: typeof result) => unknown) =>
          Promise.resolve(result).then(resolve),
      };
      return query;
    },
  } as unknown as Parameters<typeof loadCatalogVersionsRegisterPage>[0];

  return { client, fallbackReads: () => fallbackReads };
}

function createVersionReviewClient({
  finalLockVersion = 7,
  pointerMovesAfterSnapshots = false,
}: {
  finalLockVersion?: number;
  pointerMovesAfterSnapshots?: boolean;
} = {}) {
  const draftId = '11111111-1111-4111-8111-111111111111';
  const baseId = '22222222-2222-4222-8222-222222222222';
  const otherPointerId = '33333333-3333-4333-8333-333333333333';
  let snapshotPageReads = 0;
  let pointerReadAfterSnapshots = false;
  const versionRows: Record<string, Record<string, unknown>> = {
    [draftId]: {
      id: draftId,
      version_string: '2568.1.0',
      name: 'ฉบับร่างทดสอบ',
      status: 'draft',
      is_default: false,
      based_on_version_id: baseId,
      item_count: 1,
      lock_version: 7,
      created_at: '2026-07-12T00:00:00.000Z',
      updated_at: '2026-07-12T00:00:00.000Z',
    },
    [baseId]: {
      id: baseId,
      version_string: '2568.0.0',
      name: 'บัญชีราคาใช้งาน',
      status: 'active',
      is_default: true,
      based_on_version_id: null,
      item_count: 1,
      lock_version: 2,
      created_at: '2026-07-01T00:00:00.000Z',
      updated_at: '2026-07-01T00:00:00.000Z',
    },
  };
  const itemRows: Record<string, Record<string, unknown>[]> = {
    [baseId]: [{
      id: 'base-row',
      identity_id: '44444444-4444-4444-8444-444444444444',
      item_code: 'ITEM-0001',
      item_name: 'รายการฐาน',
      unit: 'รายการ',
      material_cost: 10,
      labor_cost: 5,
      unit_cost: 15,
      category: 'CAT-A',
      category_id: '55555555-5555-4555-8555-555555555555',
      code_group_id: null,
      is_active: true,
      display_order: 0,
    }],
    [draftId]: [{
      id: 'draft-row',
      identity_id: '44444444-4444-4444-8444-444444444444',
      item_code: 'ITEM-0001',
      item_name: 'รายการแก้ไข',
      unit: 'รายการ',
      material_cost: 10,
      labor_cost: 5,
      unit_cost: 15,
      category: 'CAT-A',
      category_id: '66666666-6666-4666-8666-666666666666',
      code_group_id: null,
      is_active: true,
      display_order: 0,
    }],
  };

  const client = {
    rpc: async () => ({
      data: {
        versionFound: true,
        versionStatus: 'draft',
        basedOnVersionId: baseId,
        currentVersionId: baseId,
        baseIsCurrent: true,
        newIdentityCount: 0,
        activeCanonicalCodeCount: 0,
        structuredCodeGuardApplies: false,
        unapprovedLegacyActiveCount: 0,
        inactiveRowCount: 0,
        retiredPdfPolicyRequired: false,
        qualityPassed: true,
        dataset: {
          itemCount: 1,
          activeItemCount: 1,
          datasetHash: 'sha256:test',
          canonicalJsonBytes: 100,
        },
        canPublish: true,
      },
      error: null,
    }),
    from: (table: string) => {
      const state: {
        columns?: string;
        head?: boolean;
        filters: Record<string, unknown>;
        from?: number;
        to?: number;
      } = { filters: {} };

      const result = () => {
        if (table === 'price_list_versions') {
          const versionId = String(state.filters.id ?? '');
          const row = versionRows[versionId] ?? null;
          if (state.columns === 'id,status,lock_version,based_on_version_id' && row) {
            return {
              data: { ...row, lock_version: finalLockVersion },
              error: null,
            };
          }
          return { data: row, error: null };
        }

        if (table === 'price_list_default_version') {
          pointerReadAfterSnapshots = snapshotPageReads === 2;
          return {
            data: {
              version_id: pointerMovesAfterSnapshots ? otherPointerId : baseId,
            },
            error: null,
          };
        }

        if (table === 'price_list') {
          const versionId = String(state.filters.version_id ?? '');
          const rows = itemRows[versionId] ?? [];
          if (state.head) return { data: null, count: rows.length, error: null };
          snapshotPageReads += 1;
          return {
            data: rows.slice(state.from ?? 0, (state.to ?? rows.length - 1) + 1),
            error: null,
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      };

      const query = {
        select: (columns: string, options?: { head?: boolean }) => {
          state.columns = columns;
          state.head = options?.head;
          return query;
        },
        eq: (column: string, value: unknown) => {
          state.filters[column] = value;
          return query;
        },
        order: () => query,
        range: (from: number, to: number) => {
          state.from = from;
          state.to = to;
          return query;
        },
        maybeSingle: async () => result(),
        then: (
          resolve: (value: ReturnType<typeof result>) => unknown,
          reject?: (reason: unknown) => unknown,
        ) => Promise.resolve(result()).then(resolve, reject),
      };
      return query;
    },
  } as unknown as Parameters<typeof loadCatalogVersionReview>[0];

  return {
    client,
    draftId,
    pointerReadAfterSnapshots: () => pointerReadAfterSnapshots,
  };
}

describe('Master Catalog admin read model helpers', () => {
  it('requires the catalog_admin_enabled value to be JSON boolean true', () => {
    expect(isCatalogAdminEnabled(true)).toBe(true);

    expect(isCatalogAdminEnabled(false)).toBe(false);
    expect(isCatalogAdminEnabled('true')).toBe(false);
    expect(isCatalogAdminEnabled(' TRUE ')).toBe(false);
    expect(isCatalogAdminEnabled('false')).toBe(false);
    expect(isCatalogAdminEnabled(1)).toBe(false);
    expect(isCatalogAdminEnabled(0)).toBe(false);
    expect(isCatalogAdminEnabled(null)).toBe(false);
    expect(isCatalogAdminEnabled({ enabled: true })).toBe(false);
  });

  it('allows only active admins through the admin predicate', () => {
    expect(isActiveAdminProfile({ role: 'admin', status: 'active' })).toBe(true);
    expect(isActiveAdminProfile({ role: 'admin', status: 'pending' })).toBe(false);
    expect(isActiveAdminProfile({ role: 'staff', status: 'active' })).toBe(false);
    expect(isActiveAdminProfile(null)).toBe(false);
  });

  it('shortens dataset and support hashes without changing empty states', () => {
    expect(shortHash(null)).toBe('ยังไม่มี hash');
    expect(shortHash('abc123')).toBe('abc123');
    expect(shortHash('sha256:6e5bc5cd61b370a5988a4374758cd60b77a5dc1c22e04d81fd1520378c4b0fe0'))
      .toBe('sha256:6e5bc5cd61b3…');
    expect(shortHash('6e5bc5cd61b370a5988a4374758cd60b77a5dc1c22e04d81fd1520378c4b0fe0'))
      .toBe('6e5bc5cd61b3…');
  });

  it('formats nullable Thai numbers for admin metrics', () => {
    expect(formatThaiNumber(710)).toBe('710');
    expect(formatThaiNumber(1200)).toBe('1,200');
    expect(formatThaiNumber(null)).toBe('-');
  });

});

describe('Master Catalog admin gate', () => {
  const activeAdminProfile = {
    id: 'user-admin',
    email: 'local.admin@ntplc.co.th',
    first_name: 'Local',
    last_name: 'admin',
    role: 'admin',
    status: 'active',
  };

  it('redirects unauthenticated users before reading admin data', async () => {
    await expect(loadCatalogAdminGate(createGateClient({ user: null })))
      .resolves.toEqual({ state: 'unauthenticated' });
  });

  it('forbids authenticated users who are not active admins', async () => {
    const gate = await loadCatalogAdminGate(createGateClient({
      user: { id: 'user-staff' },
      profile: {
        id: 'user-staff',
        email: 'local.staff@ntplc.co.th',
        first_name: 'Local',
        last_name: 'staff',
        role: 'staff',
        status: 'active',
      },
    }));

    expect(gate).toMatchObject({
      state: 'forbidden',
      profile: {
        email: 'local.staff@ntplc.co.th',
        role: 'staff',
        status: 'active',
      },
    });
  });

  it('keeps active admins behind the disabled catalog flag by default', async () => {
    const gate = await loadCatalogAdminGate(createGateClient({
      user: { id: 'user-admin' },
      profile: activeAdminProfile,
      setting: { value: false },
    }));

    expect(gate).toMatchObject({
      state: 'disabled',
      flagIssue: null,
      profile: {
        email: 'local.admin@ntplc.co.th',
        role: 'admin',
        status: 'active',
      },
    });
  });

  it('enables the admin surface only when the active admin flag is true', async () => {
    const gate = await loadCatalogAdminGate(createGateClient({
      user: { id: 'user-admin' },
      profile: activeAdminProfile,
      setting: { value: true },
    }));

    expect(gate).toMatchObject({
      state: 'enabled',
      profile: {
        email: 'local.admin@ntplc.co.th',
        role: 'admin',
        status: 'active',
      },
    });
  });
});

describe('Master Catalog admin overview', () => {
  it('surfaces Factor F default read errors as warnings', async () => {
    const overview = await loadCatalogAdminOverview(createOverviewClientWithFactorPointerError());

    expect(overview.factorFDefault).toEqual({
      versionId: null,
      versionString: null,
      status: null,
    });
    expect(overview.warnings).toContain('โหลดตัวชี้เวอร์ชัน Factor F ที่ใช้งานไม่สำเร็จ');
  });
});

describe('Master Catalog final version review', () => {
  it('carries the exact stable lock only after complete snapshots and a final pointer read', async () => {
    const fixture = createVersionReviewClient();

    const review = await loadCatalogVersionReview(fixture.client, fixture.draftId);

    expect(fixture.pointerReadAfterSnapshots()).toBe(true);
    expect(review).toMatchObject({
      isCurrentBase: true,
      canPublishReviewedState: true,
      snapshot: {
        state: 'ready',
        reviewedLockVersion: 7,
        diff: { summary: { affectedItemCount: 1, detailsCount: 1 } },
      },
    });
  });

  it('fails closed when the draft lock or current pointer changes during review', async () => {
    const changedLock = createVersionReviewClient({ finalLockVersion: 8 });
    const movedPointer = createVersionReviewClient({ pointerMovesAfterSnapshots: true });

    const [lockReview, pointerReview] = await Promise.all([
      loadCatalogVersionReview(changedLock.client, changedLock.draftId),
      loadCatalogVersionReview(movedPointer.client, movedPointer.draftId),
    ]);

    expect(lockReview).toMatchObject({
      canPublishReviewedState: false,
      snapshot: {
        state: 'stale',
        reviewedLockVersion: null,
        issues: [{ code: 'DRAFT_CHANGED_DURING_REVIEW' }],
      },
    });
    expect(pointerReview).toMatchObject({
      isCurrentBase: false,
      canPublishReviewedState: false,
      snapshot: { state: 'ready', reviewedLockVersion: 7 },
    });
  });
});

describe('Master Catalog register fallback', () => {
  it('uses the old-schema fallback only when the cursor RPC is missing', async () => {
    const missing = createRegisterClient({
      code: 'PGRST202',
      message: 'Could not find the function public.get_catalog_versions_page in the schema cache',
    });

    const page = await loadCatalogVersionsRegisterPage(missing.client);

    expect(missing.fallbackReads()).toBe(1);
    expect(page.warnings).toContain(
      'Local schema ยังไม่มี RPC ทะเบียนแบบแบ่งหน้า จึงใช้ทะเบียนแบบย่อชั่วคราว',
    );
  });

  it('fails closed instead of masking an operational RPC error', async () => {
    const unavailable = createRegisterClient({
      code: '42501',
      message: 'permission denied',
    });

    const page = await loadCatalogVersionsRegisterPage(unavailable.client);

    expect(unavailable.fallbackReads()).toBe(0);
    expect(page).toEqual({
      rows: [],
      nextCursor: null,
      warnings: ['โหลดทะเบียนเวอร์ชันแบบแบ่งหน้าไม่สำเร็จ'],
    });
  });
});
