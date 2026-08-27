import { describe, expect, it } from 'vitest';
import {
  canReadCatalogAdmin,
  formatThaiNumber,
  isActiveAdminProfile,
  isCatalogAdminEnabled,
  loadCatalogAdminGate,
  loadCatalogAdminOverview,
  loadCatalogChangeSetsRegisterPage,
  loadCatalogImportsRegisterPage,
  loadCatalogVersionReview,
  loadCatalogVersionsRegisterPage,
  shortHash,
} from '../lib/master-catalog/admin/readModel';

type GateClientOptions = {
  user: { id: string } | null;
  profileSource?: 'legacy-read-only' | 'v2';
  profile?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    status: string;
  } | null;
  profileError?: Error | null;
  gateResult?: { data: unknown; error: unknown };
  onFrom?: (table: string) => void;
};

function createGateClient(options: GateClientOptions): Parameters<typeof loadCatalogAdminGate>[0] {
  return {
    auth: {
      getUser: async () => ({ data: { user: options.user } }),
    },
    rpc: async (name: string) => {
      if (name === 'get_my_catalog_admin_gate') {
        return options.gateResult ?? {
          data: [{ admin_enabled: false, configuration_valid: true }],
          error: null,
        };
      }
      if (name !== 'get_my_profile_v2') {
        throw new Error(`Unexpected RPC: ${name}`);
      }
      if (options.profileSource === 'v2') {
        return {
          data: options.profile
            ? [{
                ...options.profile,
                created_at: '2026-08-27T00:00:00.000Z',
                updated_at: '2026-08-27T00:00:00.000Z',
              }]
            : [],
          error: null,
        };
      }
      return {
        data: null,
        error: {
          code: 'PGRST202',
          message: 'Could not find public.get_my_profile_v2 in the schema cache',
        },
      };
    },
    from: (table: string) => {
      options.onFrom?.(table);
      const query = {
        select: () => query,
        eq: () => query,
        maybeSingle: async () => {
          if (table === 'user_profiles') {
            return {
              data: options.profile
                ? {
                    ...options.profile,
                    created_at: '2026-08-27T00:00:00.000Z',
                    updated_at: '2026-08-27T00:00:00.000Z',
                  }
                : null,
              error: options.profileError ?? null,
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

    return { data: [], error: null, count: 0 };
  };

  return {
    from: (table: string) => {
      const query = {
        select: () => query,
        order: () => query,
        limit: () => query,
        range: () => query,
        eq: () => query,
        neq: () => query,
        not: () => query,
        maybeSingle: async () => queryResult(table),
        then: (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) =>
          Promise.resolve(queryResult(table)).then(resolve, reject),
      };

      return query;
    },
  } as unknown as Parameters<typeof loadCatalogAdminOverview>[0];
}

function createOverviewClientWithPagedRegistry() {
  const defaultVersionId = '11111111-1111-4111-8111-111111111111';
  const registry = Array.from({ length: 1_001 }, (_, patch) => ({
    version_string: `2568.0.${patch}`,
    status: patch === 0 ? 'active' : 'archived',
  }));
  const defaultVersion = {
    id: defaultVersionId,
    version_string: '2568.0.0',
    name: 'บัญชีราคาใช้งาน',
    status: 'active',
    is_default: true,
    based_on_version_id: null,
    item_count: 710,
    lock_version: 0,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  };
  let registryRangeReads = 0;

  const client = {
    from: (table: string) => {
      const state: {
        columns: string;
        filters: Record<string, unknown>;
        from: number;
        to: number;
      } = { columns: '', filters: {}, from: 0, to: Number.MAX_SAFE_INTEGER };
      const result = () => {
        if (table === 'price_list_versions') {
          if (state.columns === 'version_string,status') {
            registryRangeReads += 1;
            return {
              data: registry.slice(state.from, state.to + 1),
              error: null,
              count: registry.length,
            };
          }
          return {
            data: state.filters.status === 'draft' ? [] : [defaultVersion],
            error: null,
          };
        }
        if (table === 'price_list_default_version') {
          return { data: { version_id: defaultVersionId }, error: null };
        }
        if (table === 'factor_reference_default_version') {
          return { data: null, error: null };
        }
        return { data: [], count: 0, error: null };
      };
      const query = {
        select: (columns: string) => {
          state.columns = columns;
          return query;
        },
        order: () => query,
        limit: () => query,
        range: (from: number, to: number) => {
          state.from = from;
          state.to = to;
          return query;
        },
        eq: (column: string, value: unknown) => {
          state.filters[column] = value;
          return query;
        },
        neq: () => query,
        not: () => query,
        maybeSingle: async () => result(),
        then: (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) =>
          Promise.resolve(result()).then(resolve, reject),
      };
      return query;
    },
  } as unknown as Parameters<typeof loadCatalogAdminOverview>[0];

  return { client, registryRangeReads: () => registryRangeReads };
}

function createRegisterClient(
  error: { code: string; message: string },
  fallbackRows: Record<string, unknown>[] = [],
) {
  let fallbackReads = 0;
  let rpcCalls = 0;
  const result = { data: fallbackRows, error: null };
  const client = {
    rpc: async () => {
      rpcCalls += 1;
      return { data: null, error };
    },
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

  return {
    client,
    fallbackReads: () => fallbackReads,
    rpcCalls: () => rpcCalls,
  };
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

  it('keeps the legacy authorization source read-only without raw settings access', async () => {
    const fromTables: string[] = [];
    const gate = await loadCatalogAdminGate(createGateClient({
      user: { id: 'user-admin' },
      profile: activeAdminProfile,
      onFrom: (table) => fromTables.push(table),
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
    expect(fromTables).not.toContain('app_settings');
  });

  it('keeps a valid false v2 projection read-only without an operator issue', async () => {
    const gate = await loadCatalogAdminGate(createGateClient({
      user: { id: 'user-admin' },
      profile: activeAdminProfile,
      profileSource: 'v2',
      gateResult: {
        data: [{ admin_enabled: false, configuration_valid: true }],
        error: null,
      },
    }));

    expect(gate).toMatchObject({
      state: 'disabled',
      flagIssue: null,
    });
    expect(canReadCatalogAdmin(gate)).toBe(true);
  });

  it('enables the admin surface only when the active admin flag is true', async () => {
    const gate = await loadCatalogAdminGate(createGateClient({
      user: { id: 'user-admin' },
      profile: activeAdminProfile,
      profileSource: 'v2',
      gateResult: {
        data: [{ admin_enabled: true, configuration_valid: true }],
        error: null,
      },
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

  it('allows reads for active admins in enabled or maintenance mode only', () => {
    expect(canReadCatalogAdmin({
      state: 'enabled',
      profile: {
        id: 'user-admin',
        email: null,
        firstName: 'Local',
        lastName: 'Admin',
        role: 'admin',
        status: 'active',
      },
    })).toBe(true);
    expect(canReadCatalogAdmin({
      state: 'disabled',
      flagIssue: null,
      profile: {
        id: 'user-admin',
        email: null,
        firstName: 'Local',
        lastName: 'Admin',
        role: 'admin',
        status: 'active',
      },
    })).toBe(true);
    expect(canReadCatalogAdmin({ state: 'forbidden', profile: null })).toBe(false);
    expect(canReadCatalogAdmin({ state: 'unauthenticated' })).toBe(false);
  });

  it('fails the v2 path closed with an operator issue on malformed gate data', async () => {
    const gate = await loadCatalogAdminGate(createGateClient({
      user: { id: 'user-admin' },
      profile: activeAdminProfile,
      profileSource: 'v2',
      gateResult: { data: [], error: null },
    }));

    expect(gate).toMatchObject({
      state: 'disabled',
      flagIssue: expect.any(String),
      profile: {
        id: 'user-admin',
        role: 'admin',
        status: 'active',
      },
    });
    expect(canReadCatalogAdmin(gate)).toBe(true);
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

  it('loads the complete issued-or-claimed version registry across bounded pages', async () => {
    const fixture = createOverviewClientWithPagedRegistry();

    const overview = await loadCatalogAdminOverview(fixture.client);

    expect(fixture.registryRangeReads()).toBe(2);
    expect(overview.versionRegistry).toHaveLength(1_001);
    expect(overview.versionRegistry?.at(-1)).toEqual({
      targetVersionString: '2568.0.1000',
      status: 'archived',
    });
    expect(overview.warnings).not.toContain(
      'ทะเบียนเลขเวอร์ชันโหลดไม่ครบ จึงปิดการสร้างฉบับร่างไว้ก่อน',
    );
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
  it('uses active-admin RLS reads for every register when the mutation gate is disabled', async () => {
    const guardedRpcError = {
      code: 'P0001',
      message: 'CATALOG_FORBIDDEN: active enabled admin profile is required',
    };
    const versions = createRegisterClient(guardedRpcError, [{
      id: 'version-1',
      version_string: '2568.1.0',
      name: 'บัญชีราคาปัจจุบัน',
      status: 'active',
      is_default: true,
      item_count: 710,
      lock_version: 3,
      created_at: '2026-08-26T00:00:00.000Z',
      updated_at: '2026-08-26T00:00:00.000Z',
    }]);
    const imports = createRegisterClient(guardedRpcError, [{
      id: 'import-1',
      version_id: 'version-1',
      mode: 'full',
      parser_profile_id: 'profile-1',
      parser_profile_version: '1',
      source_filename: 'catalog.xlsx',
      source_file_size: 1_024,
      source_file_sha256: 'source-hash',
      normalized_payload_hash: 'payload-hash',
      status: 'validated',
      created_at: '2026-08-25T00:00:00.000Z',
    }]);
    const changes = createRegisterClient(guardedRpcError, [{
      id: 'change-1',
      version_id: 'version-1',
      change_type: 'manual',
      reason: 'ทดสอบโหมดอ่านอย่างเดียว',
      actor_display_name: 'Admin',
      created_at: '2026-08-24T00:00:00.000Z',
    }]);

    const [versionPage, importPage, changePage] = await Promise.all([
      loadCatalogVersionsRegisterPage(versions.client, undefined, { readOnlyMode: true }),
      loadCatalogImportsRegisterPage(imports.client, undefined, { readOnlyMode: true }),
      loadCatalogChangeSetsRegisterPage(changes.client, undefined, { readOnlyMode: true }),
    ]);

    expect([versions.rpcCalls(), imports.rpcCalls(), changes.rpcCalls()]).toEqual([0, 0, 0]);
    expect([versions.fallbackReads(), imports.fallbackReads(), changes.fallbackReads()]).toEqual([
      1,
      1,
      1,
    ]);
    expect(versionPage).toMatchObject({
      rows: [{ id: 'version-1', officialVersionString: '2568.1.0' }],
      warnings: [],
    });
    expect(importPage).toMatchObject({ rows: [{ id: 'import-1' }], warnings: [] });
    expect(changePage).toMatchObject({ rows: [{ id: 'change-1' }], warnings: [] });
  });

  it('uses the old-schema fallback only when the cursor RPC is missing', async () => {
    const missing = createRegisterClient({
      code: 'PGRST202',
      message: 'Could not find the function public.get_catalog_versions_page in the schema cache',
    });

    const page = await loadCatalogVersionsRegisterPage(missing.client);

    expect(missing.rpcCalls()).toBe(1);
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

    expect(unavailable.rpcCalls()).toBe(1);
    expect(unavailable.fallbackReads()).toBe(0);
    expect(page).toEqual({
      rows: [],
      nextCursor: null,
      warnings: ['โหลดทะเบียนเวอร์ชันแบบแบ่งหน้าไม่สำเร็จ'],
    });
  });
});
