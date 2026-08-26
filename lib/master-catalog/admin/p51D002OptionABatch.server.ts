import 'server-only';

import { createHash } from 'node:crypto';
import type { CatalogManualChangeArgs } from './actionModel';
import optionADiffJson from '../../../docs/plans/master-catalog/evidence/p51-option-a-v1/diff.json';

export const P51_D002_BATCH_CONFIRMATION = 'APPLY P51-D002-OPTION-A-48';
export const P51_D002_DRAFT_REFERENCE = '2568.1.0-D002';
export const P51_D002_TARGET_VERSION = '2568.1.0';
export const P51_D002_EXPECTED_LOCK_VERSION = 2;
export const P51_D002_EXPECTED_POST_LOCK_VERSION = 3;

const PUBLIC_DIFF_SHA256 =
  'f522e722a76ef78a7442c8d071abfe311be94c8b3c5d74779da499efceb5c370';
const PUBLIC_DIFF_BYTES = 96778;
const EXPECTED_CHANGE_PAYLOAD_SHA256 =
  'fd82f6876be4e258e51c0e736e5c744052edae3c66b6d4338446ee3d29a2c2c3';
const EXPECTED_IDENTITY_CODE_SELECTION_SHA256 =
  'c6b45ee3570b0a407f9bda6e1729e462d635d9745babbfe1de66e6a98db9d39a';
const EXPECTED_PRICE_AUTHORITY_REFERENCE = 'MC-2568.1.0-COR-001';
const EXPECTED_REASON =
  'P-51 Option A: apply 48 approved labor/unit corrections to 2568.1.0-D002; no other fields; authority MC-2568.1.0-COR-001';
const REQUEST_NAMESPACE_LABEL =
  'conduit-boq/p51-d002-option-a-48/request-namespace/v1';
const EXPECTED_ROW_KEYS = [
  'action',
  'targetIdentityId',
  'targetItemCode',
  'laborCost',
  'unitCost',
  'priceAuthorityReference',
] as const;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ITEM_0429_IDENTITY_ID = 'f2662c71-a6e5-407e-8456-8608e304b43b';
const ITEM_0615_IDENTITY_ID = '40779d45-c955-458e-8744-35f698d1a872';

export type P51D002BatchErrorCode =
  | 'P51_D002_CONFIRMATION_MISMATCH'
  | 'P51_D002_ORACLE_MISMATCH'
  | 'P51_D002_TARGET_READ_FAILED'
  | 'P51_D002_TARGET_MISMATCH'
  | 'P51_D002_VERSION_ID_INVALID';

export class P51D002BatchPreparationError extends Error {
  constructor(
    public readonly code: P51D002BatchErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'P51D002BatchPreparationError';
  }
}

export type P51D002TargetMode = 'first-use' | 'uncertain-classification';

export interface P51D002ResolvedTarget {
  versionId: string;
  draftReference: typeof P51_D002_DRAFT_REFERENCE;
  targetVersionString: typeof P51_D002_TARGET_VERSION;
  status: 'draft';
  observedLockVersion: 2 | 3;
  mode: P51D002TargetMode;
}

export interface P51D002TargetReadEnvelope {
  data: unknown;
  error: unknown;
}

export interface P51D002PanelVisibilityInput {
  gateState: string;
  isStaleDraft: boolean;
  status: string;
  draftReference: string | null;
  targetVersionString: string;
  lockVersion: number;
}

export interface P51D002PublicPayloadVerification {
  publicDiffSha256: string;
  publicDiffBytes: number;
  changePayloadSha256: string;
  identityCodeSelectionSha256: string;
  changedRowCount: number;
  unchangedRowCount: number;
  changes: Record<string, unknown>[];
}

export type P51D002RpcResponseClassification =
  | 'expected-success'
  | 'definitive-rejection'
  | 'uncertain';

export interface P51D002RpcTransportError {
  code?: string;
}

export interface P51D002RpcExecution {
  args: CatalogManualChangeArgs;
  data: unknown;
  error: P51D002RpcTransportError | null;
  responseClassification: P51D002RpcResponseClassification;
}

const SEALED_PUBLIC_PAYLOAD = verifyAndBuildP51D002PublicPayload();

export function shouldShowP51D002OptionAPanel(
  input: P51D002PanelVisibilityInput,
): boolean {
  return input.gateState === 'enabled'
    && input.isStaleDraft === false
    && input.status === 'draft'
    && input.draftReference === P51_D002_DRAFT_REFERENCE
    && input.targetVersionString === P51_D002_TARGET_VERSION
    && (
      input.lockVersion === P51_D002_EXPECTED_LOCK_VERSION
      || input.lockVersion === P51_D002_EXPECTED_POST_LOCK_VERSION
    );
}

export async function resolveP51D002RuntimeTarget(
  routeVersionId: unknown,
  read: (canonicalVersionId: string) => PromiseLike<P51D002TargetReadEnvelope>,
): Promise<P51D002ResolvedTarget> {
  const versionId = canonicalizeP51D002VersionId(routeVersionId);
  let envelope: P51D002TargetReadEnvelope;

  try {
    envelope = await read(versionId);
  } catch {
    throw new P51D002BatchPreparationError(
      'P51_D002_TARGET_READ_FAILED',
      'อ่านฉบับร่าง D002 ไม่สำเร็จ จึงยังไม่มีการส่งคำขอแก้ไข',
    );
  }

  if (
    envelope === null
    || typeof envelope !== 'object'
    || Array.isArray(envelope)
    || envelope.error !== null
  ) {
    throw new P51D002BatchPreparationError(
      'P51_D002_TARGET_READ_FAILED',
      'อ่านฉบับร่าง D002 ไม่สำเร็จ จึงยังไม่มีการส่งคำขอแก้ไข',
    );
  }

  const row = requireRecord(
    envelope.data,
    'P51_D002_TARGET_READ_FAILED',
    'ไม่พบฉบับร่าง D002 ที่อนุมัติ จึงยังไม่มีการส่งคำขอแก้ไข',
  );
  const resolvedId = typeof row.id === 'string'
    ? canonicalizeP51D002VersionId(row.id)
    : null;

  if (
    resolvedId !== versionId
    || row.draft_reference !== P51_D002_DRAFT_REFERENCE
    || row.target_version_string !== P51_D002_TARGET_VERSION
    || row.status !== 'draft'
    || (row.lock_version !== P51_D002_EXPECTED_LOCK_VERSION
      && row.lock_version !== P51_D002_EXPECTED_POST_LOCK_VERSION)
  ) {
    throw new P51D002BatchPreparationError(
      'P51_D002_TARGET_MISMATCH',
      'หน้าปัจจุบันไม่ตรงกับฉบับร่าง D002 และรุ่นแก้ไขที่อนุมัติ จึงยังไม่มีการส่งคำขอ',
    );
  }

  const observedLockVersion = row.lock_version;
  return {
    versionId,
    draftReference: P51_D002_DRAFT_REFERENCE,
    targetVersionString: P51_D002_TARGET_VERSION,
    status: 'draft',
    observedLockVersion,
    mode: observedLockVersion === P51_D002_EXPECTED_LOCK_VERSION
      ? 'first-use'
      : 'uncertain-classification',
  };
}

export function canonicalizeP51D002VersionId(value: unknown): string {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    throw new P51D002BatchPreparationError(
      'P51_D002_VERSION_ID_INVALID',
      'รหัสฉบับร่าง D002 ไม่ถูกต้อง',
    );
  }
  return value.toLowerCase();
}

export function deriveP51D002RequestId(versionId: string): string {
  const canonicalVersionId = canonicalizeP51D002VersionId(versionId);
  const namespaceBytes = createHash('sha256')
    .update(REQUEST_NAMESPACE_LABEL, 'utf8')
    .digest()
    .subarray(0, 16);
  namespaceBytes[6] = (namespaceBytes[6] & 0x0f) | 0x50;
  namespaceBytes[8] = (namespaceBytes[8] & 0x3f) | 0x80;

  const requestBytes = createHash('sha1')
    .update(namespaceBytes)
    .update(canonicalVersionId, 'utf8')
    .digest()
    .subarray(0, 16);
  requestBytes[6] = (requestBytes[6] & 0x0f) | 0x50;
  requestBytes[8] = (requestBytes[8] & 0x3f) | 0x80;

  return formatUuid(requestBytes);
}

export function buildP51D002OptionABatchArgs(
  confirmation: unknown,
  target: P51D002ResolvedTarget,
): CatalogManualChangeArgs {
  if (
    typeof confirmation !== 'string'
    || confirmation.normalize('NFC') !== P51_D002_BATCH_CONFIRMATION
  ) {
    throw new P51D002BatchPreparationError(
      'P51_D002_CONFIRMATION_MISMATCH',
      `กรุณาพิมพ์ ${P51_D002_BATCH_CONFIRMATION} ให้ตรงทุกตัว`,
    );
  }

  assertResolvedTarget(target);
  return {
    p_version_id: target.versionId,
    p_change_payload: {
      operation: 'manual',
      changes: structuredClone(SEALED_PUBLIC_PAYLOAD.changes),
    },
    p_expected_lock_version: P51_D002_EXPECTED_LOCK_VERSION,
    p_reason: EXPECTED_REASON,
    p_request_id: deriveP51D002RequestId(target.versionId),
    p_import_id: null,
  };
}

export async function executeP51D002OptionABatchRpc(
  input: { confirmation: unknown; target: P51D002ResolvedTarget },
  invoke: (args: CatalogManualChangeArgs) => PromiseLike<unknown>,
): Promise<P51D002RpcExecution> {
  const args = buildP51D002OptionABatchArgs(input.confirmation, input.target);
  let result: unknown;

  try {
    result = await invoke(args);
  } catch (error) {
    result = {
      data: null,
      error: { code: readTransportErrorCode(error) ?? 'P51_D002_TRANSPORT_THROW' },
    };
  }

  if (
    result === null
    || typeof result !== 'object'
    || Array.isArray(result)
    || !Object.hasOwn(result, 'data')
    || !Object.hasOwn(result, 'error')
  ) {
    return malformedTransportEnvelope(args);
  }

  const envelope = result as Record<string, unknown>;
  if (
    envelope.error !== null
    && (typeof envelope.error !== 'object' || Array.isArray(envelope.error))
  ) {
    return malformedTransportEnvelope(args);
  }

  const data = envelope.data;
  const error = envelope.error as P51D002RpcTransportError | null;
  return {
    args,
    data,
    error,
    responseClassification: error
      ? 'uncertain'
      : classifyP51D002OptionABatchResponse(data, {
          requestId: args.p_request_id,
          versionId: args.p_version_id,
          targetMode: input.target.mode,
        }),
  };
}

export function classifyP51D002OptionABatchResponse(
  value: unknown,
  expected: {
    requestId: string;
    versionId: string;
    targetMode: P51D002TargetMode;
  },
): P51D002RpcResponseClassification {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return 'uncertain';
  }

  const response = value as Record<string, unknown>;
  if (response.ok === false) {
    const error = response.error !== null
      && typeof response.error === 'object'
      && !Array.isArray(response.error)
      ? response.error as Record<string, unknown>
      : null;
    if (
      response.requestId !== expected.requestId
      || response.data !== undefined
      || typeof error?.code !== 'string'
      || error.code.trim().length === 0
      || typeof error.message !== 'string'
      || error.message.trim().length === 0
      || typeof error.retryable !== 'boolean'
    ) {
      return 'uncertain';
    }
    return 'definitive-rejection';
  }

  if (
    response.ok !== true
    || response.requestId !== expected.requestId
    || response.error !== undefined
    || response.data === null
    || typeof response.data !== 'object'
    || Array.isArray(response.data)
  ) {
    return 'uncertain';
  }

  const data = response.data as Record<string, unknown>;
  if (
    data.versionId !== expected.versionId
    || data.lockVersion !== P51_D002_EXPECTED_POST_LOCK_VERSION
    || typeof data.changeSetId !== 'string'
    || !UUID_PATTERN.test(data.changeSetId)
  ) {
    return 'uncertain';
  }

  if (data.duplicateRequest === true) {
    return data.changedItems === undefined
      && data.retiredByFullImportOmission === undefined
      ? 'expected-success'
      : 'uncertain';
  }

  return expected.targetMode === 'first-use'
    && data.duplicateRequest === false
    && data.changedItems === 48
    && data.retiredByFullImportOmission === 0
    ? 'expected-success'
    : 'uncertain';
}

export function verifyAndBuildP51D002PublicPayload(
  value: unknown = optionADiffJson,
): P51D002PublicPayloadVerification {
  const diff = requireRecord(
    value,
    'P51_D002_ORACLE_MISMATCH',
    'Option A public diff must be an object',
  );
  const publicDiff = prettyJsonBytes(diff);
  const publicDiffBytes = Buffer.byteLength(publicDiff);
  const publicDiffSha256 = sha256(publicDiff);
  assertOracle(publicDiffBytes === PUBLIC_DIFF_BYTES, `public diff byte size changed: ${publicDiffBytes}`);
  assertOracle(publicDiffSha256 === PUBLIC_DIFF_SHA256, `public diff SHA-256 changed: ${publicDiffSha256}`);
  assertOracle(diff.schema === 'conduit-boq/p51-option-a-diff/v1', 'public diff schema changed');
  assertOracle(diff.candidate_id === 'P51-OPTION-A-CANDIDATE-20260826-V1', 'candidate ID changed');
  assertOracle(diff.artifact_role === 'local-review-oracle-not-direct-import-payload', 'artifact role changed');

  const baseline = requireRecord(
    diff.published_baseline_comparison,
    'P51_D002_ORACLE_MISMATCH',
    'published baseline comparison must be an object',
  );
  const incremental = requireRecord(
    diff.d002_incremental_comparison,
    'P51_D002_ORACLE_MISMATCH',
    'D002 incremental comparison must be an object',
  );
  const baselineRecords = requireArray(
    baseline.records,
    'P51_D002_ORACLE_MISMATCH',
    'published baseline records must be an array',
  );
  const incrementalRecords = requireArray(
    incremental.records,
    'P51_D002_ORACLE_MISMATCH',
    'D002 incremental records must be an array',
  );

  assertOracle(baseline.reference_version === '2568.0.0', 'published baseline version changed');
  assertOracle(baseline.changed_row_count === 49, 'published baseline changed-row count changed');
  assertOracle(baseline.unchanged_row_count === 661, 'published baseline unchanged-row count changed');
  assertOracle(baselineRecords.length === 49, `expected 49 baseline rows, found ${baselineRecords.length}`);
  assertOracle(incremental.reference_draft === P51_D002_DRAFT_REFERENCE, 'D002 reference changed');
  assertOracle(incremental.changed_row_count === 48, 'D002 changed-row count changed');
  assertOracle(incremental.unchanged_row_count === 662, 'D002 unchanged-row count changed');
  assertOracle(incrementalRecords.length === 48, `expected 48 D002 rows, found ${incrementalRecords.length}`);

  const baselineWithoutItem0429 = baselineRecords.filter((record) => (
    requireRecord(record, 'P51_D002_ORACLE_MISMATCH', 'baseline row must be an object')
      .legacy_item_code !== 'ITEM-0429'
  ));
  assertOracle(
    JSON.stringify(baselineWithoutItem0429) === JSON.stringify(incrementalRecords),
    'D002 rows no longer equal the ordered baseline corrections excluding ITEM-0429',
  );

  const item0429 = baselineRecords
    .map((record) => requireRecord(
      record,
      'P51_D002_ORACLE_MISMATCH',
      'baseline row must be an object',
    ))
    .filter((record) => record.legacy_item_code === 'ITEM-0429');
  assertOracle(item0429.length === 1, 'ITEM-0429 baseline correction count changed');
  verifyItem0429(item0429[0]);

  const identities = new Set<string>();
  const itemCodes = new Set<string>();
  const changes: Record<string, unknown>[] = [];
  const identityCodeSelection: Array<{
    stable_identity_id: string;
    target_item_code: string;
  }> = [];
  let item0615Found = false;

  for (const [index, valueRecord] of incrementalRecords.entries()) {
    const record = requireRecord(
      valueRecord,
      'P51_D002_ORACLE_MISMATCH',
      `D002 row ${index + 1} must be an object`,
    );
    const before = requireRecord(record.before, 'P51_D002_ORACLE_MISMATCH', `D002 row ${index + 1} before values must be an object`);
    const after = requireRecord(record.after, 'P51_D002_ORACLE_MISMATCH', `D002 row ${index + 1} after values must be an object`);
    const delta = requireRecord(record.delta, 'P51_D002_ORACLE_MISMATCH', `D002 row ${index + 1} delta must be an object`);
    const identityId = record.stable_identity_id;
    const itemCode = record.target_item_code;
    const changeFields = record.change_fields;

    assertOracle(typeof identityId === 'string' && UUID_PATTERN.test(identityId), `D002 row ${index + 1} identity is invalid`);
    assertOracle(typeof itemCode === 'string' && itemCode.length > 0, `D002 row ${index + 1} item code is invalid`);
    assertOracle(record.source_item_code === itemCode, `D002 row ${index + 1} source/target code changed`);
    assertOracle(
      Array.isArray(changeFields)
      && JSON.stringify(changeFields) === JSON.stringify(['labor_cost', 'unit_cost']),
      `D002 row ${index + 1} changed fields changed`,
    );

    const beforeMaterial = requireMoneyNumber(before.material_cost, `D002 row ${index + 1} before material`);
    const beforeLabor = requireMoneyNumber(before.labor_cost, `D002 row ${index + 1} before labor`);
    const beforeUnit = requireMoneyNumber(before.unit_cost, `D002 row ${index + 1} before unit`);
    const afterMaterial = requireMoneyNumber(after.material_cost, `D002 row ${index + 1} after material`);
    const afterLabor = requireMoneyNumber(after.labor_cost, `D002 row ${index + 1} after labor`);
    const afterUnit = requireMoneyNumber(after.unit_cost, `D002 row ${index + 1} after unit`);
    assertOracle(beforeMaterial === afterMaterial, `D002 row ${index + 1} material changed`);
    assertOracle(beforeMaterial + beforeLabor === beforeUnit, `D002 row ${index + 1} before arithmetic changed`);
    assertOracle(afterMaterial + afterLabor === afterUnit, `D002 row ${index + 1} after arithmetic changed`);
    assertOracle(delta.material_cost === 0, `D002 row ${index + 1} material delta changed`);
    assertOracle(delta.labor_cost === afterLabor - beforeLabor, `D002 row ${index + 1} labor delta changed`);
    assertOracle(delta.unit_cost === afterUnit - beforeUnit, `D002 row ${index + 1} unit delta changed`);
    assertOracle(!identities.has(identityId), `duplicate identity at D002 row ${index + 1}`);
    assertOracle(!itemCodes.has(itemCode), `duplicate item code at D002 row ${index + 1}`);
    assertOracle(identityId !== ITEM_0429_IDENTITY_ID, 'ITEM-0429 must remain excluded from D002 payload');

    identities.add(identityId);
    itemCodes.add(itemCode);
    identityCodeSelection.push({ stable_identity_id: identityId, target_item_code: itemCode });
    changes.push({
      action: 'update',
      targetIdentityId: identityId,
      targetItemCode: itemCode,
      laborCost: afterLabor.toFixed(2),
      unitCost: afterUnit.toFixed(2),
      priceAuthorityReference: EXPECTED_PRICE_AUTHORITY_REFERENCE,
    });

    if (identityId === ITEM_0615_IDENTITY_ID) {
      item0615Found = record.legacy_item_code === 'ITEM-0615'
        && itemCode === 'LVU-MH0-002'
        && afterMaterial === 2869
        && afterLabor === 7427
        && afterUnit === 10296;
    }
  }

  assertOracle(item0615Found, 'ITEM-0615 correction changed');
  assertOracle(changes.length === 48, `expected 48 changes, found ${changes.length}`);
  assertOracle(changes.every((change) => (
    JSON.stringify(Object.keys(change)) === JSON.stringify(EXPECTED_ROW_KEYS)
  )), 'change-row key contract changed');

  const changePayload = { operation: 'manual', changes } as const;
  const changePayloadSha256 = sha256(canonicalJsonBytes(changePayload));
  const identityCodeSelectionSha256 = sha256(canonicalJsonBytes(identityCodeSelection));
  assertOracle(changePayloadSha256 === EXPECTED_CHANGE_PAYLOAD_SHA256, `change payload SHA-256 changed: ${changePayloadSha256}`);
  assertOracle(identityCodeSelectionSha256 === EXPECTED_IDENTITY_CODE_SELECTION_SHA256, `identity/code SHA-256 changed: ${identityCodeSelectionSha256}`);

  return {
    publicDiffSha256,
    publicDiffBytes,
    changePayloadSha256,
    identityCodeSelectionSha256,
    changedRowCount: changes.length,
    unchangedRowCount: 662,
    changes: structuredClone(changes),
  };
}

function assertResolvedTarget(target: P51D002ResolvedTarget): void {
  const canonicalVersionId = canonicalizeP51D002VersionId(target.versionId);
  if (
    canonicalVersionId !== target.versionId
    || target.draftReference !== P51_D002_DRAFT_REFERENCE
    || target.targetVersionString !== P51_D002_TARGET_VERSION
    || target.status !== 'draft'
    || (target.observedLockVersion !== P51_D002_EXPECTED_LOCK_VERSION
      && target.observedLockVersion !== P51_D002_EXPECTED_POST_LOCK_VERSION)
    || target.mode !== (
      target.observedLockVersion === P51_D002_EXPECTED_LOCK_VERSION
        ? 'first-use'
        : 'uncertain-classification'
    )
  ) {
    throw new P51D002BatchPreparationError(
      'P51_D002_TARGET_MISMATCH',
      'ฉบับร่าง D002 ไม่ตรงกับขอบเขตที่อนุมัติ',
    );
  }
}

function verifyItem0429(record: Record<string, unknown>): void {
  const before = requireRecord(record.before, 'P51_D002_ORACLE_MISMATCH', 'ITEM-0429 before values changed');
  const after = requireRecord(record.after, 'P51_D002_ORACLE_MISMATCH', 'ITEM-0429 after values changed');
  assertOracle(record.stable_identity_id === ITEM_0429_IDENTITY_ID, 'ITEM-0429 identity changed');
  assertOracle(record.target_item_code === 'COR-PB0-002', 'ITEM-0429 code changed');
  assertOracle(before.material_cost === 0 && before.labor_cost === 1763 && before.unit_cost === 1763, 'ITEM-0429 baseline values changed');
  assertOracle(after.material_cost === 0 && after.labor_cost === 1764 && after.unit_cost === 1764, 'ITEM-0429 proposed values changed');
}

function malformedTransportEnvelope(args: CatalogManualChangeArgs): P51D002RpcExecution {
  return {
    args,
    data: null,
    error: { code: 'P51_D002_TRANSPORT_ENVELOPE_MALFORMED' },
    responseClassification: 'uncertain',
  };
}

function readTransportErrorCode(value: unknown): string | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null;
  const code = (value as Record<string, unknown>).code;
  return typeof code === 'string' && code.trim() ? code.trim() : null;
}

function formatUuid(bytes: Uint8Array): string {
  const hex = Buffer.from(bytes).toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function prettyJsonBytes(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function canonicalJsonBytes(value: unknown): string {
  return `${JSON.stringify(value)}\n`;
}

function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function requireMoneyNumber(value: unknown, label: string): number {
  assertOracle(Number.isSafeInteger(value) && Number(value) >= 0, `${label} is invalid`);
  return Number(value);
}

function requireRecord(
  value: unknown,
  code: P51D002BatchErrorCode,
  message: string,
): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new P51D002BatchPreparationError(code, message);
  }
  return value as Record<string, unknown>;
}

function requireArray(
  value: unknown,
  code: P51D002BatchErrorCode,
  message: string,
): unknown[] {
  if (!Array.isArray(value)) {
    throw new P51D002BatchPreparationError(code, message);
  }
  return value;
}

function assertOracle(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new P51D002BatchPreparationError('P51_D002_ORACLE_MISMATCH', message);
  }
}
