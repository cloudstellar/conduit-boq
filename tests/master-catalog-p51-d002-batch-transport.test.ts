import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const actionMocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  loadCatalogAdminGate: vi.fn(),
  logMasterCatalogOperation: vi.fn(),
  redirect: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock('next/cache', () => ({ revalidatePath: actionMocks.revalidatePath }));
vi.mock('next/navigation', () => ({ redirect: actionMocks.redirect }));
vi.mock('@/lib/supabase/server', () => ({ createClient: actionMocks.createClient }));
vi.mock('@/lib/master-catalog/admin/readModel', () => ({
  loadCatalogAdminGate: actionMocks.loadCatalogAdminGate,
}));
vi.mock('@/lib/master-catalog/import/payload', () => {
  class CatalogImportPayloadValidationError extends Error {
    code = 'VALIDATION_FAILED';
    diagnostics = [];
  }
  return {
    CatalogImportPayloadValidationError,
    validateCatalogImportPayload: vi.fn(),
    validateCatalogImportPayloadHash: vi.fn(),
  };
});
vi.mock('@/lib/master-catalog/admin/importValidation', () => {
  class CatalogImportServerValidationError extends Error {
    code = 'VALIDATION_FAILED';
    diagnostics = [];
  }
  return {
    CatalogImportServerValidationError,
    validateCatalogImportAgainstDraft: vi.fn(),
  };
});
vi.mock('@/lib/master-catalog/admin/capabilities', () => ({
  loadCatalogCapabilityFlags: vi.fn(),
}));
vi.mock('@/lib/master-catalog/admin/actionModel', async () => (
  import('../lib/master-catalog/admin/actionModel')
));
vi.mock('@/lib/master-catalog/observability', () => ({
  logMasterCatalogOperation: actionMocks.logMasterCatalogOperation,
}));
vi.mock('@/lib/master-catalog/admin/navigation', () => ({
  catalogImportSuccessHref: vi.fn(),
  catalogItemMutationSuccessHref: vi.fn(),
  catalogWithdrawSuccessHref: vi.fn(),
}));
vi.mock('@/lib/master-catalog/versioning', () => ({
  classifyCatalogVersionTransition: vi.fn(),
  isCatalogAnnualEffectiveYearAllowed: vi.fn(),
  parseCatalogVersionString: vi.fn(),
}));
vi.mock('@/lib/master-catalog/admin/p51D002OptionABatch.server', async () => (
  import('../lib/master-catalog/admin/p51D002OptionABatch.server')
));

import optionADiff from '../docs/plans/master-catalog/evidence/p51-option-a-v1/diff.json';
import {
  P51D002BatchPreparationError,
  P51_D002_BATCH_CONFIRMATION,
  P51_D002_DRAFT_REFERENCE,
  P51_D002_TARGET_VERSION,
  buildP51D002OptionABatchArgs,
  classifyP51D002OptionABatchResponse,
  deriveP51D002RequestId,
  executeP51D002OptionABatchRpc,
  resolveP51D002RuntimeTarget,
  shouldShowP51D002OptionAPanel,
  verifyAndBuildP51D002PublicPayload,
  type P51D002ResolvedTarget,
} from '../lib/master-catalog/admin/p51D002OptionABatch.server';
import { applyP51D002OptionABatchAction } from '../app/admin/master-catalog/actions';

const ROOT = resolve(import.meta.dirname, '..');
const TEST_VERSION_ID = '00000000-0000-4000-8000-000000000000';
const OTHER_VERSION_ID = '00000000-0000-4000-8000-000000000001';
const TEST_CHANGE_SET_ID = '00000000-0000-4000-8000-000000000002';
const TEST_REQUEST_ID = '52e4c437-5218-5571-91e1-b60827b2ad61';
const IDLE_STATE = { status: 'idle', message: '' } as const;

function versionRow(
  lockVersion: number,
  overrides: Record<string, unknown> = {},
) {
  return {
    id: TEST_VERSION_ID,
    target_version_string: P51_D002_TARGET_VERSION,
    draft_reference: P51_D002_DRAFT_REFERENCE,
    status: 'draft',
    lock_version: lockVersion,
    ...overrides,
  };
}

async function resolvedTarget(lockVersion = 2): Promise<P51D002ResolvedTarget> {
  return resolveP51D002RuntimeTarget(
    TEST_VERSION_ID,
    vi.fn().mockResolvedValue({ data: versionRow(lockVersion), error: null }),
  );
}

function confirmationForm(
  confirmation = P51_D002_BATCH_CONFIRMATION,
  versionId = TEST_VERSION_ID,
): FormData {
  const formData = new FormData();
  formData.set('versionId', versionId);
  formData.set('confirmation', confirmation);
  return formData;
}

function successResponse({ duplicate = false } = {}) {
  return {
    ok: true,
    requestId: TEST_REQUEST_ID,
    data: {
      versionId: TEST_VERSION_ID,
      changeSetId: TEST_CHANGE_SET_ID,
      lockVersion: 3,
      ...(duplicate
        ? {}
        : { changedItems: 48, retiredByFullImportOmission: 0 }),
      duplicateRequest: duplicate,
    },
  };
}

function definitiveRejection() {
  return {
    ok: false,
    requestId: TEST_REQUEST_ID,
    error: {
      code: 'DRAFT_LOCK_CONFLICT',
      message: 'Draft lock version is stale',
      retryable: true,
    },
  };
}

function createDatabaseMock({
  row = versionRow(2),
  readError = null,
  rpcResult = { data: successResponse(), error: null },
}: {
  row?: unknown;
  readError?: unknown;
  rpcResult?: unknown;
} = {}) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: row, error: readError });
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });
  const rpc = vi.fn().mockResolvedValue(rpcResult);
  return { supabase: { from, rpc }, from, select, eq, maybeSingle, rpc };
}

describe('P-51 D002 public-safe transport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('derives the UUIDv5 request from an independent fixed vector', () => {
    expect(deriveP51D002RequestId(TEST_VERSION_ID)).toBe(TEST_REQUEST_ID);
    expect(deriveP51D002RequestId(TEST_VERSION_ID.toUpperCase())).toBe(TEST_REQUEST_ID);
  });

  it('seals the exact public 48-row payload, hashes, exclusions, and ITEM-0615', async () => {
    const publicDiffBytes = readFileSync(
      resolve(ROOT, 'docs/plans/master-catalog/evidence/p51-option-a-v1/diff.json'),
    );
    const verification = verifyAndBuildP51D002PublicPayload();
    const target = await resolvedTarget();
    const args = buildP51D002OptionABatchArgs(P51_D002_BATCH_CONFIRMATION, target);
    const expectedRows = optionADiff.d002_incremental_comparison.records.map((record) => ({
      action: 'update',
      targetIdentityId: record.stable_identity_id,
      targetItemCode: record.target_item_code,
      laborCost: record.after.labor_cost.toFixed(2),
      unitCost: record.after.unit_cost.toFixed(2),
      priceAuthorityReference: 'MC-2568.1.0-COR-001',
    }));
    const selection = expectedRows.map((row) => ({
      stable_identity_id: row.targetIdentityId,
      target_item_code: row.targetItemCode,
    }));

    expect(verification).toMatchObject({
      publicDiffSha256: 'f522e722a76ef78a7442c8d071abfe311be94c8b3c5d74779da499efceb5c370',
      publicDiffBytes: 96778,
      changePayloadSha256: 'fd82f6876be4e258e51c0e736e5c744052edae3c66b6d4338446ee3d29a2c2c3',
      identityCodeSelectionSha256: 'c6b45ee3570b0a407f9bda6e1729e462d635d9745babbfe1de66e6a98db9d39a',
      changedRowCount: 48,
      unchangedRowCount: 662,
    });
    expect(publicDiffBytes.byteLength).toBe(96778);
    expect(createHash('sha256').update(publicDiffBytes).digest('hex')).toBe(
      'f522e722a76ef78a7442c8d071abfe311be94c8b3c5d74779da499efceb5c370',
    );
    expect(args.p_change_payload.changes).toEqual(expectedRows);
    expect(createHash('sha256')
      .update(`${JSON.stringify(args.p_change_payload)}\n`)
      .digest('hex')).toBe(verification.changePayloadSha256);
    expect(createHash('sha256')
      .update(`${JSON.stringify(selection)}\n`)
      .digest('hex')).toBe(verification.identityCodeSelectionSha256);
    expect(args.p_change_payload.changes).toHaveLength(48);
    expect(args.p_change_payload.changes).not.toContainEqual(
      expect.objectContaining({ targetItemCode: 'COR-PB0-002' }),
    );
    expect(args.p_change_payload.changes).toContainEqual({
      action: 'update',
      targetIdentityId: '40779d45-c955-458e-8744-35f698d1a872',
      targetItemCode: 'LVU-MH0-002',
      laborCost: '7427.00',
      unitCost: '10296.00',
      priceAuthorityReference: 'MC-2568.1.0-COR-001',
    });
  });

  it('rejects any changed public oracle before args can be built', () => {
    const changed = structuredClone(optionADiff) as unknown as Record<string, unknown>;
    const incremental = changed.d002_incremental_comparison as Record<string, unknown>;
    incremental.changed_row_count = 47;
    expect(() => verifyAndBuildP51D002PublicPayload(changed))
      .toThrow(P51D002BatchPreparationError);
  });

  it('returns a fresh clone while preserving the immutable fingerprint for lock 2 and lock 3', async () => {
    const firstUse = buildP51D002OptionABatchArgs(
      P51_D002_BATCH_CONFIRMATION,
      await resolvedTarget(2),
    );
    const classification = buildP51D002OptionABatchArgs(
      P51_D002_BATCH_CONFIRMATION,
      await resolvedTarget(3),
    );

    expect(firstUse).toEqual(classification);
    expect(firstUse).toMatchObject({
      p_version_id: TEST_VERSION_ID,
      p_expected_lock_version: 2,
      p_request_id: TEST_REQUEST_ID,
      p_import_id: null,
    });
    expect(firstUse.p_reason).toBe(
      'P-51 Option A: apply 48 approved labor/unit corrections to 2568.1.0-D002; no other fields; authority MC-2568.1.0-COR-001',
    );
    firstUse.p_change_payload.changes[0].laborCost = '0.00';
    const rebuilt = buildP51D002OptionABatchArgs(
      P51_D002_BATCH_CONFIRMATION,
      await resolvedTarget(2),
    );
    expect(rebuilt.p_change_payload.changes[0].laborCost).not.toBe('0.00');
  });

  it('resolves only the exact authenticated D002 target and classifies lock 2/3 modes', async () => {
    const read2 = vi.fn().mockResolvedValue({ data: versionRow(2), error: null });
    const read3 = vi.fn().mockResolvedValue({ data: versionRow(3), error: null });
    await expect(resolveP51D002RuntimeTarget(TEST_VERSION_ID, read2)).resolves
      .toMatchObject({ observedLockVersion: 2, mode: 'first-use' });
    await expect(resolveP51D002RuntimeTarget(TEST_VERSION_ID, read3)).resolves
      .toMatchObject({ observedLockVersion: 3, mode: 'uncertain-classification' });
    expect(read2).toHaveBeenCalledWith(TEST_VERSION_ID);
    expect(read3).toHaveBeenCalledWith(TEST_VERSION_ID);
  });

  it.each([
    ['exact lock 2', {}, true],
    ['exact lock 3', { lockVersion: 3 }, true],
    ['unauthenticated', { gateState: 'unauthenticated' }, false],
    ['forbidden', { gateState: 'forbidden' }, false],
    ['disabled', { gateState: 'disabled' }, false],
    ['stale', { isStaleDraft: true }, false],
    ['active', { status: 'active' }, false],
    ['wrong reference', { draftReference: '2568.1.0-D003' }, false],
    ['wrong target', { targetVersionString: '2568.1.1' }, false],
    ['lock 1', { lockVersion: 1 }, false],
    ['lock 4', { lockVersion: 4 }, false],
  ])('shows the panel only for %s', (_label, overrides, expected) => {
    expect(shouldShowP51D002OptionAPanel({
      gateState: 'enabled',
      isStaleDraft: false,
      status: 'draft',
      draftReference: P51_D002_DRAFT_REFERENCE,
      targetVersionString: P51_D002_TARGET_VERSION,
      lockVersion: 2,
      ...overrides,
    })).toBe(expected);
  });

  it('rejects an invalid route before read and rejects read failures before RPC preparation', async () => {
    const read = vi.fn();
    await expect(resolveP51D002RuntimeTarget('not-a-uuid', read))
      .rejects.toMatchObject({ code: 'P51_D002_VERSION_ID_INVALID' });
    expect(read).not.toHaveBeenCalled();

    await expect(resolveP51D002RuntimeTarget(
      TEST_VERSION_ID,
      vi.fn().mockResolvedValue({ data: null, error: { code: 'READ_FAILED' } }),
    )).rejects.toMatchObject({ code: 'P51_D002_TARGET_READ_FAILED' });
    await expect(resolveP51D002RuntimeTarget(
      TEST_VERSION_ID,
      vi.fn().mockRejectedValue(new Error('read failed')),
    )).rejects.toMatchObject({ code: 'P51_D002_TARGET_READ_FAILED' });
  });

  it.each([
    ['wrong ID', { id: OTHER_VERSION_ID }],
    ['wrong reference', { draft_reference: '2568.1.0-D003' }],
    ['wrong target', { target_version_string: '2568.1.1' }],
    ['wrong status', { status: 'active' }],
    ['lock 1', { lock_version: 1 }],
    ['lock 4', { lock_version: 4 }],
  ])('rejects %s before RPC preparation', async (_label, overrides) => {
    await expect(resolveP51D002RuntimeTarget(
      TEST_VERSION_ID,
      vi.fn().mockResolvedValue({ data: versionRow(2, overrides), error: null }),
    )).rejects.toMatchObject({ code: 'P51_D002_TARGET_MISMATCH' });
  });

  it('rejects a wrong confirmation before the RPC call', async () => {
    const invoke = vi.fn();
    for (const confirmation of [
      'wrong',
      ` ${P51_D002_BATCH_CONFIRMATION}`,
      `${P51_D002_BATCH_CONFIRMATION} `,
    ]) {
      await expect(executeP51D002OptionABatchRpc(
        { confirmation, target: await resolvedTarget() },
        invoke,
      )).rejects.toMatchObject({ code: 'P51_D002_CONFIRMATION_MISMATCH' });
    }
    expect(invoke).not.toHaveBeenCalled();
  });

  it('classifies only exact first-use, replay, and rejection responses', () => {
    const expected = {
      requestId: TEST_REQUEST_ID,
      versionId: TEST_VERSION_ID,
      targetMode: 'first-use' as const,
    };
    expect(classifyP51D002OptionABatchResponse(successResponse(), expected))
      .toBe('expected-success');
    expect(classifyP51D002OptionABatchResponse(successResponse({ duplicate: true }), expected))
      .toBe('expected-success');
    expect(classifyP51D002OptionABatchResponse(definitiveRejection(), expected))
      .toBe('definitive-rejection');

    const malformedCases = [
      null,
      { ...successResponse(), requestId: OTHER_VERSION_ID },
      { ...successResponse(), data: { ...successResponse().data, versionId: OTHER_VERSION_ID } },
      { ...successResponse(), data: { ...successResponse().data, lockVersion: 4 } },
      { ...successResponse(), data: { ...successResponse().data, changedItems: 47 } },
      { ...successResponse(), data: { ...successResponse().data, retiredByFullImportOmission: 1 } },
      { ...definitiveRejection(), error: { code: 'DRAFT_LOCK_CONFLICT' } },
      { ...definitiveRejection(), data: null },
    ];
    for (const value of malformedCases) {
      expect(classifyP51D002OptionABatchResponse(value, expected)).toBe('uncertain');
    }
    expect(classifyP51D002OptionABatchResponse(successResponse(), {
      ...expected,
      targetMode: 'uncertain-classification',
    })).toBe('uncertain');
    expect(classifyP51D002OptionABatchResponse(successResponse({ duplicate: true }), {
      ...expected,
      targetMode: 'uncertain-classification',
    })).toBe('expected-success');
  });

  it('invokes exactly once and never retries any response class or thrown transport', async () => {
    const target = await resolvedTarget();
    const cases = [
      { data: successResponse(), error: null },
      { data: successResponse({ duplicate: true }), error: null },
      { data: definitiveRejection(), error: null },
      { data: null, error: { code: 'NETWORK_ERROR' } },
      null,
    ];

    for (const result of cases) {
      const invoke = vi.fn().mockResolvedValue(result);
      await executeP51D002OptionABatchRpc(
        { confirmation: P51_D002_BATCH_CONFIRMATION, target },
        invoke,
      );
      expect(invoke).toHaveBeenCalledTimes(1);
    }

    const thrown = vi.fn().mockRejectedValue({ code: 'NETWORK_THROW' });
    const execution = await executeP51D002OptionABatchRpc(
      { confirmation: P51_D002_BATCH_CONFIRMATION, target },
      thrown,
    );
    expect(thrown).toHaveBeenCalledTimes(1);
    expect(execution).toMatchObject({
      error: { code: 'NETWORK_THROW' },
      responseClassification: 'uncertain',
    });
  });

  it('keeps unauthenticated, forbidden, and disabled actions outside read and RPC boundaries', async () => {
    for (const state of ['unauthenticated', 'forbidden', 'disabled']) {
      const db = createDatabaseMock();
      actionMocks.createClient.mockResolvedValue(db.supabase);
      actionMocks.loadCatalogAdminGate.mockResolvedValue({ state });

      const result = await applyP51D002OptionABatchAction(
        IDLE_STATE,
        confirmationForm(),
      );
      expect(result).toMatchObject({ status: 'error', code: 'FORBIDDEN' });
      expect(db.from).not.toHaveBeenCalled();
      expect(db.rpc).not.toHaveBeenCalled();
    }
  });

  it('reads the exact target and runs an enabled lock-2 action once', async () => {
    const db = createDatabaseMock();
    actionMocks.createClient.mockResolvedValue(db.supabase);
    actionMocks.loadCatalogAdminGate.mockResolvedValue({ state: 'enabled' });

    const result = await applyP51D002OptionABatchAction(
      IDLE_STATE,
      confirmationForm(),
    );

    expect(db.from).toHaveBeenCalledWith('price_list_versions');
    expect(db.select).toHaveBeenCalledWith(
      'id,target_version_string,draft_reference,status,lock_version',
    );
    expect(db.eq).toHaveBeenCalledWith('id', TEST_VERSION_ID);
    expect(db.maybeSingle).toHaveBeenCalledTimes(1);
    expect(db.rpc).toHaveBeenCalledTimes(1);
    expect(db.rpc).toHaveBeenCalledWith(
      'apply_catalog_changes',
      expect.objectContaining({
        p_version_id: TEST_VERSION_ID,
        p_expected_lock_version: 2,
        p_request_id: TEST_REQUEST_ID,
      }),
    );
    expect(result).toMatchObject({
      status: 'success',
      requestId: TEST_REQUEST_ID,
      versionId: TEST_VERSION_ID,
      lockVersion: 3,
      changedItems: 48,
    });
    expect(actionMocks.revalidatePath).toHaveBeenCalled();
  });

  it('uses the identical fingerprint for the enabled lock-3 classification path', async () => {
    const db = createDatabaseMock({
      row: versionRow(3),
      rpcResult: { data: successResponse({ duplicate: true }), error: null },
    });
    actionMocks.createClient.mockResolvedValue(db.supabase);
    actionMocks.loadCatalogAdminGate.mockResolvedValue({ state: 'enabled' });

    const result = await applyP51D002OptionABatchAction(
      IDLE_STATE,
      confirmationForm(),
    );
    expect(db.rpc).toHaveBeenCalledTimes(1);
    expect(db.rpc.mock.calls[0][1]).toMatchObject({
      p_expected_lock_version: 2,
      p_request_id: TEST_REQUEST_ID,
    });
    expect(result).toMatchObject({
      status: 'success',
      duplicateRequest: true,
      requestId: TEST_REQUEST_ID,
    });
    expect(result.message).toContain('ไม่มีการบันทึกซ้ำ');
  });

  it('treats a fresh-success shape after a lock-3 pre-read as uncertain', async () => {
    const db = createDatabaseMock({ row: versionRow(3) });
    actionMocks.createClient.mockResolvedValue(db.supabase);
    actionMocks.loadCatalogAdminGate.mockResolvedValue({ state: 'enabled' });

    const result = await applyP51D002OptionABatchAction(
      IDLE_STATE,
      confirmationForm(),
    );
    expect(db.rpc).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      status: 'error',
      code: 'CATALOG_OUTCOME_UNCERTAIN',
      requestId: TEST_REQUEST_ID,
      outcomeUncertain: true,
    });
  });

  it('rejects target/read/confirmation failures in the enabled action before RPC', async () => {
    const cases = [
      { row: versionRow(4), form: confirmationForm(), code: 'P51_D002_TARGET_MISMATCH' },
      { row: null, form: confirmationForm(), code: 'P51_D002_TARGET_READ_FAILED' },
      { row: versionRow(2), form: confirmationForm('wrong'), code: 'P51_D002_CONFIRMATION_MISMATCH' },
    ];

    for (const testCase of cases) {
      const db = createDatabaseMock({ row: testCase.row });
      actionMocks.createClient.mockResolvedValue(db.supabase);
      actionMocks.loadCatalogAdminGate.mockResolvedValue({ state: 'enabled' });
      const result = await applyP51D002OptionABatchAction(IDLE_STATE, testCase.form);
      expect(result).toMatchObject({ status: 'error', code: testCase.code });
      expect(db.rpc).not.toHaveBeenCalled();
    }
  });

  it('maps RPC transport throw and malformed response to the derived-request uncertain state', async () => {
    for (const buildRpcResult of [
      () => Promise.reject({ code: 'NETWORK_THROW' }),
      () => Promise.resolve(null),
    ]) {
      const db = createDatabaseMock();
      db.rpc.mockImplementation(buildRpcResult);
      actionMocks.createClient.mockResolvedValue(db.supabase);
      actionMocks.loadCatalogAdminGate.mockResolvedValue({ state: 'enabled' });
      const result = await applyP51D002OptionABatchAction(
        IDLE_STATE,
        confirmationForm(),
      );
      expect(db.rpc).toHaveBeenCalledTimes(1);
      expect(result).toMatchObject({
        status: 'error',
        code: 'CATALOG_OUTCOME_UNCERTAIN',
        requestId: TEST_REQUEST_ID,
        retryable: true,
        outcomeUncertain: true,
      });
    }
  });

  it('preserves database duplicate lookup before draft lock conflict', () => {
    const migration = readFileSync(
      resolve(ROOT, 'migrations/020_master_catalog_phase4_admin_workflow_hardening.sql'),
      'utf8',
    );
    const functionStart = migration.indexOf(
      'CREATE OR REPLACE FUNCTION private.apply_catalog_changes_impl(',
    );
    const functionEnd = migration.indexOf('$function$;', functionStart);
    const implementation = migration.slice(functionStart, functionEnd);
    const adminGateGuard = implementation.indexOf(
      'IF NOT private.catalog_admin_enabled() THEN',
    );
    const existingRequestLookup = implementation.indexOf(
      'FROM public.catalog_change_sets\n      WHERE request_id = p_request_id;',
    );
    const duplicateReturn = implementation.indexOf("'duplicateRequest', true", existingRequestLookup);
    const draftLock = implementation.indexOf(
      'FROM public.price_list_versions\n    WHERE id = p_version_id\n    FOR UPDATE;',
    );
    const staleLock = implementation.indexOf("'DRAFT_LOCK_CONFLICT'");

    expect(adminGateGuard).toBeGreaterThan(-1);
    expect(existingRequestLookup).toBeGreaterThan(adminGateGuard);
    expect(duplicateReturn).toBeGreaterThan(existingRequestLookup);
    expect(draftLock).toBeGreaterThan(duplicateReturn);
    expect(staleLock).toBeGreaterThan(draftLock);
  });

  it('keeps the UI exact, narrow, server-owned, and separate from generic editing', () => {
    const actions = readFileSync(resolve(ROOT, 'app/admin/master-catalog/actions.ts'), 'utf8');
    const helper = readFileSync(
      resolve(ROOT, 'lib/master-catalog/admin/p51D002OptionABatch.server.ts'),
      'utf8',
    );
    const panel = readFileSync(
      resolve(ROOT, 'app/admin/master-catalog/_components/MasterCatalogP51D002OptionAPanel.tsx'),
      'utf8',
    );
    const views = readFileSync(
      resolve(ROOT, 'app/admin/master-catalog/_components/MasterCatalogAdminViews.tsx'),
      'utf8',
    );
    const start = actions.indexOf('export async function applyP51D002OptionABatchAction');
    const end = actions.indexOf('export async function placeCatalogItemsAction');
    const action = actions.slice(start, end);

    expect(start).toBeGreaterThan(-1);
    expect(action.indexOf('loadCatalogAdminGate(supabase)')).toBeLessThan(
      action.indexOf('resolveP51D002RuntimeTarget('),
    );
    expect(action).toContain("formData.get('versionId')");
    expect(action).toContain("formData.get('confirmation')");
    expect(action.match(/\.rpc\(/g)).toHaveLength(1);
    expect(action).not.toMatch(/changesJson|expectedLockVersion'|requestId'|priceAuthority/);
    expect(helper).toContain("import 'server-only';");
    expect(helper).toContain('evidence/p51-option-a-v1/diff.json');
    expect(helper).not.toMatch(/service_role|SUPABASE_SERVICE_ROLE_KEY|execute_sql|supabase\.from\(|fetch\s*\(/);
    expect(panel.match(/name="[^"]+"/g)?.sort()).toEqual([
      'name="confirmation"',
      'name="versionId"',
    ]);
    expect(panel).toContain('ไม่แก้ BOQ เดิมย้อนหลัง');
    expect(panel).toContain('ITEM-0615');
    expect(panel).not.toMatch(/name="(?:changes|requestId|expectedLockVersion|priceAuthority)/);
    expect(views).toContain('shouldShowP51D002OptionAPanel({');
    expect(views).toContain('gateState: gate.state');
    expect(views).toContain('isStaleDraft: detail.isStaleDraft');
    expect(views).toContain('draftReference: version.draftReference');
    expect(views).toContain('targetVersionString: version.targetVersionString');
    expect(views).toContain('lockVersion: version.lockVersion');
  });
});
