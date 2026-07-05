import { describe, expect, it } from 'vitest';
import {
  formatThaiNumber,
  isActiveAdminProfile,
  isCatalogAdminEnabled,
  loadCatalogAdminGate,
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

describe('Master Catalog admin read model helpers', () => {
  it('parses catalog_admin_enabled values conservatively', () => {
    expect(isCatalogAdminEnabled(true)).toBe(true);
    expect(isCatalogAdminEnabled('true')).toBe(true);
    expect(isCatalogAdminEnabled(' TRUE ')).toBe(true);
    expect(isCatalogAdminEnabled(1)).toBe(true);

    expect(isCatalogAdminEnabled(false)).toBe(false);
    expect(isCatalogAdminEnabled('false')).toBe(false);
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
      .toBe('6e5bc5cd61b3…8c4b0fe0');
    expect(shortHash('6e5bc5cd61b370a5988a4374758cd60b77a5dc1c22e04d81fd1520378c4b0fe0'))
      .toBe('6e5bc5cd61b3…8c4b0fe0');
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
      setting: { value: 'true' },
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
