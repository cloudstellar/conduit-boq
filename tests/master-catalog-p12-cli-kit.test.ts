import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rm,
  stat,
  symlink,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  APPLICATION_CANDIDATE,
  CLIENT_TIMEOUT_SECONDS,
  FULL_PRE_017_LEDGER_SEQUENCE,
  HISTORICAL_MIGRATIONS,
  KIT_SCHEMA,
  LEGACY_LEDGER_COMPATIBILITY_GUARDS,
  LOCAL_SUPABASE_CLI,
  P12_KIT_GENERATOR_SOURCE,
  P12_LEGACY_LEDGER_GUARD_SOURCE_ROOT,
  P12_RUNNER_SOURCE,
  PHASE4_MIGRATIONS,
  REPOSITORY_ROOT,
  REQUIRED_POSTGRES_MAJOR,
  REQUIRED_SUPABASE_CLI_VERSION,
  assertStrictFullLedgerSequence,
  compatibilityGuardSourcesMatchHead,
  extractOwnedObjectTargets,
  ledgerFilename,
  prepareP12CliKit,
  resolveNativeSupabaseCliBinary,
  resolveNewExternalDirectory,
  sha256File,
} from '../scripts/prepare-master-catalog-p12-cli-kit.mjs';
import {
  APPROVAL_SCHEMA,
  APPROVAL_SCOPE,
  CLI_USAGE,
  CATALOG_ACTION_ERROR_SIGNATURE,
  EVIDENCE_MANIFEST_SCHEMA,
  FINAL_CLOSEOUT_CONTEXT_SCHEMA,
  FINAL_CLOSEOUT_EVIDENCE_MANIFEST_SCHEMA,
  FINAL_CLOSEOUT_SIGNOFF_SCHEMA,
  FINAL_MIGRATION_ORDINAL,
  HOTFIX_016_FUNCTION_SIGNATURE,
  HOTFIX_016_PROSRC_LENGTH,
  HOTFIX_016_PROSRC_SHA256,
  HOTFIX_016_SQL,
  INITIAL_WINDOW_BUDGET_MS,
  LEGACY_SCHEMA_SHAPE_CONTRACT_SCHEMA,
  POSTFLIGHT_BUDGET_MS,
  PRE_MIGRATION_WINDOW_BUDGET_MS,
  P12_AUTHORITY_FILES,
  P12_RUNNER_AUTHORITY_FILE,
  PRIOR_STEP_SIGNOFF_SCHEMA,
  PRODUCTION_DATABASE_HOST,
  PRODUCTION_DATABASE_PORT,
  PRODUCTION_DATABASE_USER,
  PRODUCTION_PROJECT_REF,
  REHEARSAL_DATABASE_NAME,
  REHEARSAL_SENTINEL_PURPOSE,
  REQUIRED_CURRENT_USER,
  SCHEMA_SHAPE_CONTRACT_SCHEMA,
  SCHEMA_SHAPE_CONTINUITY_SCHEMA,
  SCHEMA_SHAPE_GITHUB_REPOSITORY,
  SCHEMA_SHAPE_GITHUB_REVIEW_PROVIDER,
  SCHEMA_CALIBRATION_EVIDENCE_MANIFEST_SCHEMA,
  SCHEMA_CALIBRATION_MODE,
  SCHEMA_SHAPE_SCOPE,
  SCHEMA_SHAPE_STAGES,
  assertCatalogUnchanged,
  assertFactorAndBoqUnchanged,
  assertHotfix016Unchanged,
  assertReviewedBridgeSequence,
  buildCliEnvironment,
  buildSupabaseMigrationArgs,
  buildSupabaseQueryArgs,
  containsActiveAuthorityMarker,
  expectedFeatureFlags,
  expectedSchemaShapeGithubReviewMarker,
  expectedSchemaShapeFingerprint,
  loadBoundAdvisorArtifact,
  loadFinalCloseoutSignoff,
  loadPass2VerificationEvidenceManifest,
  loadPriorStepSignoff,
  loadSchemaShapeContract,
  parseArguments,
  parseCalibrationArguments,
  parseCloseoutArguments,
  parseQueryRows,
  publishEvidenceManifestCommit,
  redactSensitiveText,
  runCapturedProcess,
  schemaShapeContractReviewPayloadSha256,
  schemaShapeContractSurface,
  snapshotQueryDefinitions,
  validateApprovalRecord,
  validateCatalogActionErrorAcl,
  validateCatalogSnapshot,
  validateFactorAndBoq,
  validateFlags,
  validateFunctionDefaultAclForMigrations,
  validateHotfix016,
  validateLedgerRows,
  validatePasswordlessDbUrl,
  validatePrivateSchemaAcl,
  validateProductionHeadDelta,
  validateRequiredFunctionDefaultAcl,
  validateSchemaShape,
  validateSchemaShapeGithubReview,
  validateWriteBoundaryRow,
  verifyKit,
  writeBoundarySql,
} from '../scripts/run-master-catalog-p12-cli-step.mjs';

const createdTemporaryRoots: string[] = [];

// Independent literal regression fixture. Do not derive this from the
// generator constants: the original defect passed because tests repeated the
// same incomplete post-009 assumption as the kit.
const KNOWN_PRODUCTION_PRE_009_LEDGER = Object.freeze([
  ['20260302034458', 'add_fk_indexes'],
  ['20260302034725', 'enable_rls_factor_reference'],
  ['20260304105854', 'fix_function_search_path'],
  ['20260304110029', 'fix_unqualified_table_references'],
  ['20260306092423', 'fix_search_path_to_public'],
  ['20260316154955', 'add_factor_f_snapshot_columns'],
  ['20260316160554', 'update_save_boq_rpc_with_factor_f_snapshot'],
]);

const KNOWN_PRODUCTION_PRE_009_GUARD_HASHES = Object.freeze([
  '333046c6e79fcbdc67b998c7a3d62119ec12f381f86a82c932160484818bcb5d',
  '34cb618c4b1fadad5267249048883bd0681cf8f34f7c829d767a46f3b53fae46',
  '23830717e05f1fb3e52cb05aa14128951a33341ee05f21107c17e5efaa9596b5',
  'ddad2ee15a76a30c4890ce20ab1e00afe4e44783ec306d8b1b7d5376b96ee846',
  '01bae7ad3e3c3a3d9ddc239c8e456ee9c9dea48179c621043d53e5defb513668',
  'fd0a134b51d3c1ffb36448e463f08416321adf92813c91cc4fc6d30a640655e9',
  'f5bef3f3a6e9a311832ffe061043aa9f1fc49fca8d85b27ca6a6ba42a7991cab',
]);

async function temporaryRoot() {
  const root = await mkdtemp(join(tmpdir(), 'conduit-p12-cli-kit-test-'));
  createdTemporaryRoots.push(root);
  return root;
}

async function cleanupTemporaryRoots() {
  while (createdTemporaryRoots.length > 0) {
    const root = createdTemporaryRoots.pop();
    if (root) {
      await rm(root, { recursive: true, force: true });
    }
  }
}

function approvalRecord(
  overrides: Record<string, unknown> = {},
) {
  return {
    schema: APPROVAL_SCHEMA,
    decision: 'GO',
    scope: APPROVAL_SCOPE,
    projectRef: PRODUCTION_PROJECT_REF,
    applicationCandidate: APPLICATION_CANDIDATE,
    executionGitHead: 'a'.repeat(40),
    approvedBy: 'Owner',
    ownerApprovalReference: 'Decision Register P-12',
    preflightEvidenceReference: 'Package #39 / Checklist #40',
    executor: 'Executor A',
    independentVerifier: 'verifier-b',
    verifierPresentDuringWindow: true,
    expectedCurrentUser: REQUIRED_CURRENT_USER,
    catalogAuthorityFingerprintSha256: '6'.repeat(64),
    schemaShapeContractSha256: '8'.repeat(64),
    supabaseCliVersion: REQUIRED_SUPABASE_CLI_VERSION,
    postgresMajor: REQUIRED_POSTGRES_MAJOR,
    clientTimeoutSeconds: CLIENT_TIMEOUT_SECONDS,
    phase4FlagsMustNeverBeTrue: true,
    freshBackupVerified: true,
    isolatedRestoreVerified: true,
    backupChecksumVerified: true,
    advisorsTriaged: true,
    advisorArtifactPath: '/external/p12-advisor-artifact.json',
    advisorArtifactSha256: '9'.repeat(64),
    advisorArtifactCapturedAt: '2026-07-28T08:50:00+07:00',
    pass2VerificationEvidenceManifestPath:
      '/external/pass2/05-closeout-evidence-manifest.json',
    pass2VerificationEvidenceManifestSha256: 'a'.repeat(64),
    githubReviewCheckedAt: '2026-07-28T08:55:00+07:00',
    remoteCiRecorded: true,
    rollbackMode: 'stop-and-fix-forward',
    automaticNextStep: false,
    authorityFileHashes: Object.fromEntries(
      P12_AUTHORITY_FILES.map((path) => [path, 'b'.repeat(64)]),
    ),
    migrationHashes: Object.fromEntries(
      PHASE4_MIGRATIONS.map((migration) => [
        migration.sourceFile,
        migration.sha256,
      ]),
    ),
    ledgerVersions: Object.fromEntries(
      PHASE4_MIGRATIONS.map((migration) => [
        migration.sourceFile,
        migration.version,
      ]),
    ),
    approvedAt: '2026-07-28T09:00:00+07:00',
    maintenanceWindow: {
      startsAt: '2026-07-28T09:30:00+07:00',
      endsAt: '2026-07-28T11:30:00+07:00',
    },
    ...overrides,
  };
}

function schemaShapeSnapshot(
  fingerprint = '8'.repeat(64),
  overrides: Record<string, unknown> = {},
) {
  return {
    schema_shape_fingerprint_sha256: fingerprint,
    columns: [{
      schema_name: 'public',
      relation_name: 'price_list',
      ordinal_position: 1,
      column_name: 'id',
      data_type: 'uuid',
      not_null: true,
      column_default: 'gen_random_uuid()',
    }],
    constraints: [{
      schema_name: 'public',
      relation_name: 'price_list',
      constraint_name: 'price_list_pkey',
      validated: true,
    }],
    indexes: [{
      schema_name: 'public',
      relation_name: 'price_list',
      index_name: 'price_list_pkey',
      is_valid: true,
      is_ready: true,
      is_live: true,
    }],
    index_runtime_diagnostics: [{
      schema_name: 'public',
      relation_name: 'price_list',
      index_name: 'price_list_pkey',
      check_xmin: false,
    }],
    ...overrides,
  };
}

const distinctSchemaFingerprints = Object.fromEntries(
  SCHEMA_SHAPE_STAGES.map((stage, index) => [
    stage,
    ((index + 1) % 16).toString(16).repeat(64),
  ]),
);

function schemaShapeContractRecord({
  schema = LEGACY_SCHEMA_SHAPE_CONTRACT_SCHEMA,
  gitHead = 'a'.repeat(40),
  kitManifestPath = '/external/kit/manifest.json',
  kitManifestSha256 = 'c'.repeat(64),
  generatorSourceSha256 = 'd'.repeat(64),
  runnerSourceSha256 = 'e'.repeat(64),
  pass1EvidenceManifestPath =
    '/external/pass1/05-schema-calibration-evidence-manifest.json',
  pass1EvidenceManifestSha256 = 'f'.repeat(64),
  captureExecutor = 'Capture Executor A',
  reviewerLogin = 'verifier-b',
  reviewSubmittedAt = '2026-07-28T08:30:00+07:00',
  pullNumber = 42,
  reviewId = '987654321',
}: {
  schema?: string;
  gitHead?: string;
  kitManifestPath?: string;
  kitManifestSha256?: string;
  generatorSourceSha256?: string;
  runnerSourceSha256?: string;
  pass1EvidenceManifestPath?: string;
  pass1EvidenceManifestSha256?: string;
  captureExecutor?: string;
  reviewerLogin?: string;
  reviewSubmittedAt?: string;
  pullNumber?: number;
  reviewId?: string;
} = {}) {
  const payload = {
    schema,
    scope: SCHEMA_SHAPE_SCOPE,
    applicationCandidate: APPLICATION_CANDIDATE,
    sourceToolingGitHead: gitHead,
    kitManifestPath,
    kitManifestSha256,
    generatorSourceSha256,
    runnerSourceSha256,
    supabaseCliVersion: REQUIRED_SUPABASE_CLI_VERSION,
    postgresMajor: REQUIRED_POSTGRES_MAJOR,
    migrationHashes: Object.fromEntries(
      PHASE4_MIGRATIONS.map((migration) => [
        migration.sourceFile,
        migration.sha256,
      ]),
    ),
    fingerprints: distinctSchemaFingerprints,
    captureExecutor,
    pass1EvidenceManifestPath,
    pass1EvidenceManifestSha256,
  };
  const reviewedPayloadSha256 =
    schemaShapeContractReviewPayloadSha256(payload);
  return {
    ...payload,
    githubReview: {
      provider: SCHEMA_SHAPE_GITHUB_REVIEW_PROVIDER,
      repository: SCHEMA_SHAPE_GITHUB_REPOSITORY,
      pullNumber,
      reviewId,
      htmlUrl:
        `https://github.com/${SCHEMA_SHAPE_GITHUB_REPOSITORY}/pull/${pullNumber}#pullrequestreview-${reviewId}`,
      state: 'APPROVED',
      reviewerLogin,
      reviewerType: 'User',
      commitId: gitHead,
      submittedAt: reviewSubmittedAt,
      reviewedPayloadSha256,
      expectedBodyMarker: expectedSchemaShapeGithubReviewMarker(
        payload,
        reviewedPayloadSha256,
      ),
    },
  };
}

function factorAndBoqSnapshot(
  overrides: Record<string, unknown> = {},
) {
  return {
    factor_default_version: '2569.0.0',
    factor_default_status: 'active',
    factor_default_row_count: 36,
    factor_default_dataset_hash:
      'sha256:4f35b267bde3007439aebb193be1e53bdcea5a7acce95b5a7bbf5828018ef1a6',
    factor_version_count: 2,
    factor_reference_rows: 73,
    boq_count: 234,
    boq_item_count: 2270,
    boq_missing_price_version: 0,
    boq_noncurrent_price_version: 0,
    boq_item_missing_price_row: 0,
    boq_item_cross_version: 0,
    boq_bound_factor_version: 32,
    factor_versions_fingerprint_sha256: '1'.repeat(64),
    factor_rows_fingerprint_sha256: '2'.repeat(64),
    factor_default_fingerprint_sha256: '3'.repeat(64),
    boq_factor_bindings_fingerprint_sha256: '4'.repeat(64),
    ...overrides,
  };
}

function catalogSnapshot(
  overrides: Record<string, unknown> = {},
) {
  return {
    price_rows: 710,
    distinct_codes: 710,
    missing_codes: 0,
    missing_names: 0,
    missing_units: 0,
    missing_costs: 0,
    unit_cost_mismatches: 0,
    noncurrent_price_rows: 0,
    catalog_authority_fingerprint_sha256: '6'.repeat(64),
    pointer: {
      version_string: '2568.0.0',
      status: 'active',
      is_default: true,
      draft_count: 0,
    },
    ...overrides,
  };
}

function hotfix016Snapshot(
  overrides: Record<string, unknown> = {},
) {
  return {
    signature: HOTFIX_016_FUNCTION_SIGNATURE,
    owner: REQUIRED_CURRENT_USER,
    prosrc_length: HOTFIX_016_PROSRC_LENGTH,
    prosrc_sha256: HOTFIX_016_PROSRC_SHA256,
    security_definer: true,
    function_config: 'search_path=""',
    public_execute: false,
    anon_execute: false,
    authenticated_execute: true,
    ...overrides,
  };
}

function requiredFunctionDefaultAcl(schemaName = '') {
  return {
    schema_name: schemaName,
    object_type: 'f',
    acl: '{postgres=X/postgres}',
    public_execute: false,
    anon_execute: false,
    authenticated_execute: false,
    service_role_execute: false,
  };
}

function privateSchemaAcl(authenticatedUsage: boolean) {
  return {
    schema_name: 'private',
    owner: REQUIRED_CURRENT_USER,
    acl: authenticatedUsage
      ? '{postgres=UC/postgres,authenticated=U/postgres}'
      : '{postgres=UC/postgres}',
    public_usage: false,
    public_create: false,
    anon_usage: false,
    anon_create: false,
    authenticated_usage: authenticatedUsage,
    authenticated_create: false,
    service_role_usage: true,
    service_role_create: false,
  };
}

function catalogActionErrorRoutine(
  overrides: Record<string, unknown> = {},
) {
  return {
    schema_name: 'private',
    object_name: 'catalog_action_error',
    oid: '42',
    signature: CATALOG_ACTION_ERROR_SIGNATURE,
    owner: REQUIRED_CURRENT_USER,
    security_definer: false,
    function_config: 'search_path=""',
    acl: '{postgres=X/postgres,authenticated=X/postgres}',
    public_execute: false,
    anon_execute: false,
    authenticated_execute: true,
    service_role_execute: false,
    ...overrides,
  };
}

function processIsAlive(pid: number) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function writeSecureJson(
  path: string,
  value: unknown,
  mode = 0o400,
) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, {
    mode,
  });
  await chmod(path, mode);
}

async function writeCalibrationChain(
  root: string,
  kit: {
    manifestPath: string;
    manifest: {
      sourceGitHead: string;
      generatorSourceSha256: string;
      runnerSourceSha256: string;
    };
  },
  throughStage = SCHEMA_SHAPE_STAGES[SCHEMA_SHAPE_STAGES.length - 1],
) {
  const kitManifestSha256 = await sha256File(kit.manifestPath);
  let prior:
    | { path: string; sha256: string; manifest: unknown }
    | undefined;
  const finalIndex = SCHEMA_SHAPE_STAGES.indexOf(throughStage);
  for (let index = 0; index <= finalIndex; index += 1) {
    const stage = SCHEMA_SHAPE_STAGES[index];
    const stageRoot = join(root, `calibration-${stage}`);
    await mkdir(stageRoot, { mode: 0o700 });
    const capturedAt = new Date(
      Date.parse('2026-07-28T08:00:00+07:00') + index * 60_000,
    ).toISOString();
    const finishedAt = new Date(
      Date.parse(capturedAt) + 10_000,
    ).toISOString();
    const createdAt = new Date(
      Date.parse(capturedAt) + 20_000,
    ).toISOString();
    const fingerprints = Object.fromEntries(
      SCHEMA_SHAPE_STAGES.slice(0, index + 1).map(
        (fingerprintStage) => [
          fingerprintStage,
          distinctSchemaFingerprints[fingerprintStage],
        ],
      ),
    );
    const context = {
      mode: SCHEMA_CALIBRATION_MODE,
      stage,
      sourceToolingGitHead: kit.manifest.sourceGitHead,
      kitManifestSha256,
      captureExecutor: 'Capture Executor A',
      automaticNextStep: false,
      productionAuthorized: false,
    };
    const capture = {
      capturedAt,
      stage,
      fingerprints,
      snapshot: {
        schemaShape: schemaShapeSnapshot(
          distinctSchemaFingerprints[stage],
        ),
      },
    };
    const outcome = {
      finishedAt,
      calibrationSuccess: true,
      uncertainOutcome: false,
      migrationPerformed: stage !== '016',
      automaticNextStep: false,
      productionAuthorized: false,
    };
    const writeBoundary = stage === '016'
      ? {
          capturedAt,
          stage,
          migrationPerformed: false,
          skipped: true,
          automaticNextStep: false,
          productionAuthorized: false,
        }
      : {
          capturedAt,
          stage,
          migrationPerformed: true,
          skipped: false,
          disposableTarget: {
            databaseName: REHEARSAL_DATABASE_NAME,
            tableOwner: REQUIRED_CURRENT_USER,
            purpose: REHEARSAL_SENTINEL_PURPOSE,
            nonceSha256: 'f'.repeat(64),
          },
          snapshot: {
            identity: {
              current_user_name: REQUIRED_CURRENT_USER,
              session_user_name: REQUIRED_CURRENT_USER,
              database_name: REHEARSAL_DATABASE_NAME,
              server_version_num: '170006',
            },
            ledger: [
              ...FULL_PRE_017_LEDGER_SEQUENCE,
              ...PHASE4_MIGRATIONS.slice(0, index - 1),
            ].map((migration) => ({
              version: migration.version,
              name: migration.ledgerName,
            })),
            schemaShape: schemaShapeSnapshot(
              distinctSchemaFingerprints[
                SCHEMA_SHAPE_STAGES[index - 1]
              ],
            ),
          },
          automaticNextStep: false,
          productionAuthorized: false,
        };
    const evidence: Record<string, unknown> = {
      '00-calibration-context.json': context,
      '01-calibration-preflight.json': { capturedAt },
      '01-calibration-write-boundary.json': writeBoundary,
      '02-calibration-cli-output.json': {
        migrationPerformed: stage !== '016',
      },
      '03-schema-capture.json': capture,
      '04-calibration-outcome.json': outcome,
    };
    for (const [name, value] of Object.entries(evidence)) {
      await writeSecureJson(join(stageRoot, name), value);
    }
    const files = Object.fromEntries(
      await Promise.all(
        Object.keys(evidence).map(async (name) => [
          name,
          await sha256File(join(stageRoot, name)),
        ]),
      ),
    );
    const manifest = {
      schema: SCHEMA_CALIBRATION_EVIDENCE_MANIFEST_SCHEMA,
      createdAt,
      mode: SCHEMA_CALIBRATION_MODE,
      sourceToolingGitHead: kit.manifest.sourceGitHead,
      kitManifestPath: kit.manifestPath,
      kitManifestSha256,
      generatorSourceSha256: kit.manifest.generatorSourceSha256,
      runnerSourceSha256: kit.manifest.runnerSourceSha256,
      captureExecutor: 'Capture Executor A',
      stage,
      fingerprints,
      priorCalibrationManifestPath: prior?.path ?? null,
      priorCalibrationManifestSha256: prior?.sha256 ?? null,
      automaticNextStep: false,
      productionAuthorized: false,
      files,
    };
    const path = join(
      stageRoot,
      '05-schema-calibration-evidence-manifest.json',
    );
    await writeSecureJson(path, manifest);
    prior = {
      path,
      sha256: await sha256File(path),
      manifest,
    };
  }
  if (!prior) {
    throw new Error('Calibration fixture did not create a stage');
  }
  return prior;
}

describe.sequential('Master Catalog P-12 CLI kit', () => {
  afterEach(async () => {
    await cleanupTemporaryRoots();
  });

  it('freezes exact historical and Phase 4 ledger mappings', () => {
    expect(LEGACY_LEDGER_COMPATIBILITY_GUARDS.map((migration) => [
      migration.version,
      migration.ledgerName,
    ])).toEqual(KNOWN_PRODUCTION_PRE_009_LEDGER);
    expect(FULL_PRE_017_LEDGER_SEQUENCE.map((migration) => [
      migration.version,
      migration.ledgerName,
    ])).toEqual([
      ...KNOWN_PRODUCTION_PRE_009_LEDGER,
      ...HISTORICAL_MIGRATIONS.map((migration) => [
        migration.version,
        migration.ledgerName,
      ]),
    ]);
    expect(assertStrictFullLedgerSequence()).toHaveLength(
      FULL_PRE_017_LEDGER_SEQUENCE.length + PHASE4_MIGRATIONS.length,
    );
    expect(() => assertStrictFullLedgerSequence([
      FULL_PRE_017_LEDGER_SEQUENCE[0],
      FULL_PRE_017_LEDGER_SEQUENCE[0],
    ])).toThrow('strictly ordered');

    expect(HISTORICAL_MIGRATIONS.map((migration) => [
      migration.ordinal,
      migration.version,
    ])).toEqual([
      ['009', '20260621045208'],
      ['010', '20260621052517'],
      ['011', '20260621104056'],
      ['012', '20260628190218'],
      ['013', '20260628190357'],
      ['014', '20260628190621'],
      ['015', '20260628190757'],
      ['016', '20260706090832'],
    ]);

    expect(PHASE4_MIGRATIONS.map((migration) => [
      migration.ordinal,
      migration.version,
    ])).toEqual([
      ['017', '20260728001700'],
      ['017a', '20260728001730'],
      ['018', '20260728001800'],
      ['019', '20260728001900'],
      ['020', '20260728002000'],
      ['021', '20260728002100'],
      ['022', '20260728002200'],
      ['023', '20260728002300'],
      ['024', '20260728002400'],
      ['025', '20260728002500'],
      ['026', '20260729002600'],
    ]);
    expect(PHASE4_MIGRATIONS.every(
      (migration) => /^[0-9a-f]{64}$/.test(migration.sha256),
    )).toBe(true);
    expect(P12_AUTHORITY_FILES).toContain(
      'docs/plans/master-catalog/43-phase4-p12-private-function-default-privilege-finding.md',
    );
    expect(P12_AUTHORITY_FILES).toContain(
      'docs/plans/master-catalog/44-phase4-p46-catalog-action-error-callability-finding.md',
    );
  });

  it('keeps every pre-009 compatibility guard hash-bound and fail-closed', async () => {
    expect(LEGACY_LEDGER_COMPATIBILITY_GUARDS.map(
      (guard) => guard.sha256,
    )).toEqual(KNOWN_PRODUCTION_PRE_009_GUARD_HASHES);
    expect(compatibilityGuardSourcesMatchHead('0'.repeat(40))).toBe(false);
    for (const guard of LEGACY_LEDGER_COMPATIBILITY_GUARDS) {
      expect(guard.compatibilityGuard).toBe(true);
      expect(guard.executionPolicy).toBe('must-already-exist-never-apply');
      const sourcePath = join(
        REPOSITORY_ROOT,
        P12_LEGACY_LEDGER_GUARD_SOURCE_ROOT,
        guard.sourceFile,
      );
      const sql = await readFile(sourcePath, 'utf8');
      expect(await sha256File(sourcePath)).toBe(guard.sha256);
      expect(sql).toContain('this is not reconstructed migration SQL');
      expect(sql).toContain('RAISE EXCEPTION');
      expect(sql).toContain(`${guard.version}_${guard.ledgerName} must never execute`);
    }
  });

  it('resolves the exact native Supabase binary instead of the JavaScript shim', async () => {
    expect(resolveNativeSupabaseCliBinary()).toBe(LOCAL_SUPABASE_CLI);
    expect(LOCAL_SUPABASE_CLI).toMatch(
      /node_modules\/@supabase\/cli-[^/]+\/bin\/supabase(?:\.exe)?$/,
    );
    expect(LOCAL_SUPABASE_CLI).not.toMatch(/\.js$/);
    expect((await stat(LOCAL_SUPABASE_CLI)).isFile()).toBe(true);
  });

  it('prepares eleven cumulative one-pending-file workdirs with byte-exact copies', async () => {
    const root = await temporaryRoot();
    const outputPath = join(root, 'kit');
    const result = await prepareP12CliKit({
      outputPath,
      checkCliVersion: false,
      repositoryState: {
        gitHead: 'a'.repeat(40),
        trackedWorktreeClean: true,
      },
    });

    expect(result.outputPath).toBe(await realpath(outputPath));
    expect(result.manifest.schema).toBe(KIT_SCHEMA);
    expect(result.manifest.compatibilityGuardsTrackedAtHead).toBe(false);
    expect(result.manifest.productionEligible).toBe(false);
    expect(result.manifest.steps).toHaveLength(11);
    expect(result.manifest.applicationCandidate).toBe(APPLICATION_CANDIDATE);
    expect(result.manifest.generatorSourceSha256).toBe(
      await sha256File(join(REPOSITORY_ROOT, P12_KIT_GENERATOR_SOURCE)),
    );
    expect(result.manifest.runnerSourceSha256).toBe(
      await sha256File(join(REPOSITORY_ROOT, P12_RUNNER_SOURCE)),
    );
    expect(JSON.stringify(result.manifest)).not.toMatch(
      /password|passphrase|secret|credential/i,
    );

    for (let phaseIndex = 0; phaseIndex < PHASE4_MIGRATIONS.length; phaseIndex += 1) {
      const phaseMigration = PHASE4_MIGRATIONS[phaseIndex];
      const step = result.manifest.steps[phaseIndex];
      const migrationRoot = join(outputPath, step.workdir, 'supabase', 'migrations');
      const expected = [
        ...FULL_PRE_017_LEDGER_SEQUENCE,
        ...PHASE4_MIGRATIONS.slice(0, phaseIndex + 1),
      ];
      const files = (await readdir(migrationRoot)).sort();

      expect(step.ordinal).toBe(phaseMigration.ordinal);
      expect(step.pendingMigration.sourceFile).toBe(phaseMigration.sourceFile);
      expect(step.expectedRemoteBefore).toHaveLength(
        FULL_PRE_017_LEDGER_SEQUENCE.length + phaseIndex,
      );
      expect(step.expectedRemoteAfter).toHaveLength(expected.length);
      expect(files).toEqual(expected.map(ledgerFilename).sort());

      for (const migration of expected) {
        const sourceRoot = 'compatibilityGuard' in migration
          && migration.compatibilityGuard === true
          ? P12_LEGACY_LEDGER_GUARD_SOURCE_ROOT
          : 'migrations';
        const sourcePath = join(REPOSITORY_ROOT, sourceRoot, migration.sourceFile);
        const copyPath = join(migrationRoot, ledgerFilename(migration));
        expect(await readFile(copyPath)).toEqual(await readFile(sourcePath));
        expect(await sha256File(copyPath)).toBe(
          step.expectedRemoteAfter.find(
            (candidate: { ordinal: string }) =>
              candidate.ordinal === migration.ordinal,
          )?.sha256,
        );
      }
    }

    const manifestMode = (await stat(join(outputPath, 'manifest.json'))).mode & 0o777;
    expect(manifestMode).toBe(0o400);

    const externalConfig = join(root, 'external-config.toml');
    await writeFile(
      externalConfig,
      'project_id = "conduit-boq-master-catalog-p12-017"\n',
    );
    const stepConfig = join(
      outputPath,
      result.manifest.steps[0].workdir,
      'supabase',
      'config.toml',
    );
    await unlink(stepConfig);
    await symlink(externalConfig, stepConfig);
    await expect(
      verifyKit(outputPath, '017', 'rehearsal'),
    ).rejects.toThrow('symbolic link');
  }, 15_000);

  it('refuses relative, in-repository, and already-existing output paths', async () => {
    await expect(
      resolveNewExternalDirectory('relative/p12-kit'),
    ).rejects.toThrow('absolute');
    await expect(
      resolveNewExternalDirectory(
        join(REPOSITORY_ROOT, '.p12-cli-kit-must-not-be-created'),
      ),
    ).rejects.toThrow('outside the repository');

    const root = await temporaryRoot();
    await expect(resolveNewExternalDirectory(root)).rejects.toThrow(
      'must not already exist',
    );
  });

  it('derives the ownership inventory from reviewed SQL object declarations', async () => {
    const sql = await readFile(
      join(REPOSITORY_ROOT, 'migrations', '018_master_catalog_phase4_draft_mutation.sql'),
      'utf8',
    );
    const targets = extractOwnedObjectTargets(sql);

    expect(targets.routines).toContainEqual({
      schema: 'private',
      name: 'apply_catalog_changes_impl',
    });
    expect(targets.routines).toContainEqual({
      schema: 'public',
      name: 'apply_catalog_changes',
    });
  });

  it('keeps the migration 026 ALTER FUNCTION target in both ownership inventories', async () => {
    const migration026 = PHASE4_MIGRATIONS.find(
      (migration) => migration.ordinal === '026',
    );
    expect(migration026).toBeDefined();
    const sql = await readFile(
      join(
        REPOSITORY_ROOT,
        'migrations',
        migration026!.sourceFile,
      ),
      'utf8',
    );
    expect(extractOwnedObjectTargets(sql).routines).toContainEqual({
      schema: 'private',
      name: 'catalog_action_error',
    });

    const root = await temporaryRoot();
    const result = await prepareP12CliKit({
      outputPath: join(root, 'kit'),
      checkCliVersion: false,
      repositoryState: {
        gitHead: 'a'.repeat(40),
        trackedWorktreeClean: true,
      },
    });
    const step026 = result.manifest.steps.find(
      (step: { ordinal: string }) => step.ordinal === '026',
    );
    const expectedTarget = {
      schema: 'private',
      name: 'catalog_action_error',
    };
    expect(step026?.objectTargetsBefore.routines).toContainEqual(
      expectedTarget,
    );
    expect(step026?.objectTargetsAfter.routines).toContainEqual(
      expectedTarget,
    );
  });

  it('accepts only passwordless loopback rehearsal and frozen Production URLs', () => {
    expect(() => validatePasswordlessDbUrl(
      `postgresql://postgres@127.0.0.1:55432/${REHEARSAL_DATABASE_NAME}?sslmode=disable`,
      'rehearsal',
    )).not.toThrow();
    expect(() => validatePasswordlessDbUrl(
      'postgresql://postgres:visible@127.0.0.1:55432/postgres',
      'rehearsal',
    )).toThrow('must not contain a password');
    expect(() => validatePasswordlessDbUrl(
      'postgresql://postgres@example.com:5432/postgres',
      'rehearsal',
    )).toThrow('loopback IP');
    expect(() => validatePasswordlessDbUrl(
      'postgresql://postgres@127.0.0.1:55432/postgres?sslmode=disable',
      'rehearsal',
    )).toThrow('Local Supabase postgres is prohibited');
    expect(() => validatePasswordlessDbUrl(
      `postgresql://postgres@127.0.0.1:55432/${REHEARSAL_DATABASE_NAME}?sslmode=require`,
      'rehearsal',
    )).toThrow('sslmode=disable');

    const productionUrl =
      `postgresql://${PRODUCTION_DATABASE_USER}`
      + `@${PRODUCTION_DATABASE_HOST}:${PRODUCTION_DATABASE_PORT}`
      + '/postgres?sslmode=require';
    expect(() => validatePasswordlessDbUrl(
      productionUrl,
      'production',
    )).not.toThrow();
    expect(() => validatePasswordlessDbUrl(
      productionUrl.replace('sslmode=require', 'sslmode=disable'),
      'production',
    )).toThrow('sslmode=require');
  });

  it('never places a password in constructed Supabase CLI arguments', () => {
    const dbUrl = 'postgresql://postgres@127.0.0.1:55432/postgres';
    const queryArgs = buildSupabaseQueryArgs({
      dbUrl,
      sql: 'select 1',
      workdir: '/external/step-017',
    });
    const migrationArgs = buildSupabaseMigrationArgs({
      dbUrl,
      workdir: '/external/step-017',
    });

    expect(queryArgs).toContain(dbUrl);
    expect(migrationArgs).toContain(dbUrl);
    expect([...queryArgs, ...migrationArgs].join(' ')).not.toContain(
      'test-password',
    );
    expect(migrationArgs.filter((argument) => argument === 'migration')).toHaveLength(1);
    expect(migrationArgs).not.toContain('--include-all');
  });

  it('uses libpq password and explicit SSL mode only in the child environment', () => {
    const production = buildCliEnvironment({
      password: 'process-only',
      mode: 'production',
      baseEnvironment: {
        PGHOST: 'must-be-removed',
        PGPASSFILE: '/must/be/removed',
        SUPABASE_DB_PASSWORD: 'must-be-replaced',
      },
    });
    expect(production.PGPASSWORD).toBe('process-only');
    expect(production.PGSSLMODE).toBe('require');
    expect(production.PGHOST).toBeUndefined();
    expect(production.PGPASSFILE).toBeUndefined();
    expect(production.SUPABASE_DB_PASSWORD).toBeUndefined();

    const rehearsal = buildCliEnvironment({
      password: 'process-only',
      mode: 'rehearsal',
      baseEnvironment: {},
    });
    expect(rehearsal.PGSSLMODE).toBe('disable');
  });

  it('parses the exact CLI 2.107.0 db-query rows envelope', () => {
    expect(parseQueryRows(JSON.stringify({
      boundary: 'query',
      rows: [{ value: 1 }],
      warning: null,
    }))).toEqual([{ value: 1 }]);
  });

  it('binds feature-flag rows to the immutable migration stage', () => {
    expect(expectedFeatureFlags(FULL_PRE_017_LEDGER_SEQUENCE)).toEqual([]);
    expect(validateFlags([], FULL_PRE_017_LEDGER_SEQUENCE)).toEqual({});

    const through017 = [
      ...FULL_PRE_017_LEDGER_SEQUENCE,
      PHASE4_MIGRATIONS[0],
    ];
    expect(expectedFeatureFlags(through017)).toEqual([
      'catalog_admin_enabled',
    ]);
    expect(validateFlags([
      { key: 'catalog_admin_enabled', value: 'false' },
    ], through017)).toEqual({
      catalog_admin_enabled: 'false',
    });
    expect(() => validateFlags([
      { key: 'catalog_admin_enabled', value: 'true' },
    ], through017)).toThrow('is not false');

    const through020 = [
      ...FULL_PRE_017_LEDGER_SEQUENCE,
      ...PHASE4_MIGRATIONS.slice(0, 5),
    ];
    expect(expectedFeatureFlags(through020)).toEqual([
      'catalog_admin_enabled',
      'catalog_new_identity_enabled',
      'catalog_retirement_enabled',
    ]);
  });

  it('proves the exact hotfix 016 function body and guarded execution posture', () => {
    expect(HOTFIX_016_SQL).toContain(
      'pg_catalog.oidvectortypes(p.proargtypes)',
    );
    expect(HOTFIX_016_SQL).not.toContain(
      'pg_get_function_identity_arguments',
    );
    const exact = hotfix016Snapshot();
    expect(validateHotfix016([exact])).toEqual(exact);
    expect(() => validateHotfix016([
      hotfix016Snapshot({ prosrc_length: HOTFIX_016_PROSRC_LENGTH - 1 }),
    ])).toThrow('body length');
    expect(() => validateHotfix016([
      hotfix016Snapshot({ prosrc_sha256: '0'.repeat(64) }),
    ])).toThrow('body SHA-256');
    expect(() => validateHotfix016([
      hotfix016Snapshot({ function_config: 'search_path=public' }),
    ])).toThrow('search_path');
    expect(() => validateHotfix016([
      hotfix016Snapshot({ public_execute: true }),
    ])).toThrow('PUBLIC');
    expect(() => validateHotfix016([
      hotfix016Snapshot({ authenticated_execute: false }),
    ])).toThrow('authenticated');
    expect(() => assertHotfix016Unchanged(
      exact,
      hotfix016Snapshot({ anon_execute: true }),
    )).toThrow('changed during migration');
  });

  it('uses deterministic Factor F and per-BOQ binding fingerprints across a step', () => {
    const exact = factorAndBoqSnapshot();
    expect(validateFactorAndBoq([exact])).toEqual(exact);
    expect(() => validateFactorAndBoq([
      factorAndBoqSnapshot({
        factor_rows_fingerprint_sha256: 'not-a-sha',
      }),
    ])).toThrow('SHA-256 fingerprint');
    expect(() => assertFactorAndBoqUnchanged(
      exact,
      factorAndBoqSnapshot({
        boq_factor_bindings_fingerprint_sha256: '5'.repeat(64),
      }),
    )).toThrow('boq_factor_bindings_fingerprint_sha256');
    expect(() => assertFactorAndBoqUnchanged(
      exact,
      factorAndBoqSnapshot({ boq_count: 235 }),
    )).toThrow('boq_count');
    expect(() => assertFactorAndBoqUnchanged(
      exact,
      factorAndBoqSnapshot({ boq_item_count: 2269 }),
    )).toThrow('boq_item_count');
  });

  it('pins a deterministic operational catalog-authority fingerprint across each step', () => {
    const exact = catalogSnapshot();
    expect(validateCatalogSnapshot(exact)).toEqual(exact);
    expect(() => validateCatalogSnapshot(catalogSnapshot({
      catalog_authority_fingerprint_sha256: 'not-a-sha',
    }))).toThrow('Catalog authority fingerprint');
    expect(() => assertCatalogUnchanged(
      exact,
      catalogSnapshot({
        catalog_authority_fingerprint_sha256: '7'.repeat(64),
      }),
    )).toThrow('catalog_authority_fingerprint_sha256');
  });

  it('fails closed on schema-shape drift and incomplete constraint/index readiness', () => {
    const fingerprint = '8'.repeat(64);
    expect(validateSchemaShape(
      [schemaShapeSnapshot(fingerprint)],
      fingerprint,
    )).toEqual(schemaShapeSnapshot(fingerprint));
    expect(() => validateSchemaShape(
      [schemaShapeSnapshot('7'.repeat(64))],
      fingerprint,
    )).toThrow('reviewed stage contract');
    expect(() => validateSchemaShape(
      [schemaShapeSnapshot(fingerprint, {
        constraints: [{
          schema_name: 'public',
          relation_name: 'price_list',
          constraint_name: 'price_list_check',
          validated: false,
        }],
      })],
      fingerprint,
    )).toThrow('unvalidated constraint');
    expect(() => validateSchemaShape(
      [schemaShapeSnapshot(fingerprint, {
        indexes: [{
          schema_name: 'public',
          relation_name: 'price_list',
          index_name: 'price_list_pkey',
          is_valid: true,
          is_ready: false,
          is_live: true,
        }],
      })],
      fingerprint,
    )).toThrow('invalid, unready, or non-live index');
  });

  it('keeps indcheckxmin diagnostic-only while preserving structural index gates', () => {
    expect(SCHEMA_SHAPE_SCOPE).toBe(
      'public-private-table-columns-constraints-indexes/v2',
    );
    const queryDefinitions = snapshotQueryDefinitions({
      relations: [],
      routines: [],
    });
    const ledgerSql = queryDefinitions.find(
      ({ name }) => name === 'ledger',
    )?.sql ?? '';
    expect(ledgerSql).toContain('from supabase_migrations.schema_migrations');
    expect(ledgerSql).not.toContain('where version');
    const schemaShapeSql = queryDefinitions.find(
      ({ name }) => name === 'schemaShape',
    )?.sql ?? '';
    expect(schemaShapeSql).toContain(
      "to_jsonb(index_row) - 'check_xmin'",
    );
    expect(schemaShapeSql).toContain(
      'index_row.indcheckxmin as check_xmin',
    );
    expect(schemaShapeSql).toContain('as index_runtime_diagnostics');
    expect(schemaShapeSql).toContain('index_row.indisvalid as is_valid');
    expect(schemaShapeSql).toContain('index_row.indisready as is_ready');
    expect(schemaShapeSql).toContain('index_row.indislive as is_live');

    const before = schemaShapeSnapshot();
    const after = schemaShapeSnapshot(undefined, {
      index_runtime_diagnostics: [{
        schema_name: 'public',
        relation_name: 'price_list',
        index_name: 'price_list_pkey',
        check_xmin: true,
      }],
    });
    expect(schemaShapeContractSurface(after)).toEqual(
      schemaShapeContractSurface(before),
    );
    expect(validateSchemaShape([after], '8'.repeat(64))).toEqual(after);
  });

  it('serializes a null error for successful final closeout evidence', async () => {
    const runnerSource = await readFile(
      join(REPOSITORY_ROOT, P12_RUNNER_SOURCE),
      'utf8',
    );
    expect(runnerSource).toContain('let closeoutError = null');
    expect(runnerSource).toContain(
      'liveSnapshot && closeoutError === null',
    );
    expect(runnerSource).toContain(
      'canonicalJson(schemaShapeContractSurface(liveSnapshot.schemaShape))',
    );
  });

  it('captures all fifteen read-only snapshot surfaces for failure evidence', () => {
    expect(snapshotQueryDefinitions({
      relations: [],
      routines: [],
    }).map(({ name }) => name)).toEqual([
      'identity',
      'ledger',
      'flags',
      'catalog',
      'catalogPointer',
      'factorAndBoq',
      'hotfix016',
      'schemaShape',
      'relations',
      'routines',
      'policies',
      'relationGrants',
      'triggers',
      'defaultPrivileges',
      'privateSchema',
    ]);
  });

  it('binds schema review to an exact approved GitHub PR review envelope', () => {
    const record = schemaShapeContractRecord();
    expect(SCHEMA_SHAPE_CONTRACT_SCHEMA).toBe(
      'conduit-boq/master-catalog-p12-schema-shape-contract/v4',
    );
    expect(LEGACY_SCHEMA_SHAPE_CONTRACT_SCHEMA).toBe(
      'conduit-boq/master-catalog-p12-schema-shape-contract/v3',
    );
    expect(validateSchemaShapeGithubReview(record, {
      now: new Date('2026-07-28T09:00:00+07:00'),
    })).toEqual(record.githubReview);
    expect(record.githubReview.expectedBodyMarker).toBe(
      [
        'P12_SCHEMA_REVIEW_V1',
        `source=${record.sourceToolingGitHead}`,
        `kit=${record.kitManifestSha256}`,
        `pass1=${record.pass1EvidenceManifestSha256}`,
        `payload=${record.githubReview.reviewedPayloadSha256}`,
      ].join(' '),
    );

    const continuity = {
      schema: SCHEMA_SHAPE_CONTINUITY_SCHEMA,
      priorSchemaShapeContractPath: '/external/legacy-contract.json',
      priorSchemaShapeContractSha256: '1'.repeat(64),
      priorPass2VerificationEvidenceManifestPath:
        '/external/legacy-pass2/05-closeout-evidence-manifest.json',
      priorPass2VerificationEvidenceManifestSha256: '2'.repeat(64),
      failedProductionAttempt: {
        evidenceManifestPath: '/external/failed-017/05-evidence-manifest.json',
        evidenceManifestSha256: '3'.repeat(64),
        files: {},
      },
      focusedIsolated017Proof: {
        evidenceManifestPath:
          '/external/focused-017/05-schema-calibration-evidence-manifest.json',
        evidenceManifestSha256: '4'.repeat(64),
        proofResultPath: '/external/focused-017/99-proof-result.json',
        proofResultSha256: '5'.repeat(64),
      },
    };
    const v4Payload = {
      ...record,
      schema: SCHEMA_SHAPE_CONTRACT_SCHEMA,
      continuity,
    };
    delete (v4Payload as { githubReview?: unknown }).githubReview;
    const v4PayloadSha256 = schemaShapeContractReviewPayloadSha256(v4Payload);
    expect(expectedSchemaShapeGithubReviewMarker(
      v4Payload,
      v4PayloadSha256,
    )).toBe([
      'P12_SCHEMA_REVIEW_V2',
      `source=${v4Payload.sourceToolingGitHead}`,
      `kit=${v4Payload.kitManifestSha256}`,
      `legacy=${continuity.priorSchemaShapeContractSha256}`,
      `pass2=${continuity.priorPass2VerificationEvidenceManifestSha256}`,
      `failed=${continuity.failedProductionAttempt.evidenceManifestSha256}`,
      `proof=${continuity.focusedIsolated017Proof.evidenceManifestSha256}`,
      `payload=${v4PayloadSha256}`,
    ].join(' '));

    const payloadTampered = structuredClone(record);
    payloadTampered.scope = `${SCHEMA_SHAPE_SCOPE}-tampered`;
    expect(() => validateSchemaShapeGithubReview(payloadTampered)).toThrow(
      'reviewed payload SHA-256 differs',
    );

    const markerTampered = structuredClone(record);
    markerTampered.githubReview.expectedBodyMarker += '-tampered';
    expect(() => validateSchemaShapeGithubReview(markerTampered)).toThrow(
      'review body marker differs',
    );

    const urlTampered = structuredClone(record);
    urlTampered.githubReview.htmlUrl =
      'https://github.com/cloudstellar/conduit-boq/pull/42?review=987654321';
    expect(() => validateSchemaShapeGithubReview(urlTampered)).toThrow(
      'exact repository review grammar',
    );

    const stateTampered = structuredClone(record);
    stateTampered.githubReview.state = 'COMMENTED';
    expect(() => validateSchemaShapeGithubReview(stateTampered)).toThrow(
      'state must be APPROVED',
    );

    const commitTampered = structuredClone(record);
    commitTampered.githubReview.commitId = 'b'.repeat(40);
    expect(() => validateSchemaShapeGithubReview(commitTampered)).toThrow(
      'commit differs from the source/tooling Git HEAD',
    );

    const botReviewer = structuredClone(record);
    botReviewer.githubReview.reviewerType = 'Bot';
    expect(() => validateSchemaShapeGithubReview(botReviewer)).toThrow(
      'reviewer type must be User',
    );

    const nonCanonicalLogin = structuredClone(record);
    nonCanonicalLogin.githubReview.reviewerLogin = 'Verifier-B';
    expect(() => validateSchemaShapeGithubReview(
      nonCanonicalLogin,
    )).toThrow('canonical lowercase user login');

    const extraReviewField = structuredClone(record);
    Object.assign(extraReviewField.githubReview, {
      reviewBody: 'unbound',
    });
    expect(() => validateSchemaShapeGithubReview(
      extraReviewField,
    )).toThrow('keys do not match the frozen manifest');
  });

  it('loads only a frozen reviewed schema contract and exact advisor artifact', async () => {
    const root = await realpath(await temporaryRoot());
    const kitResult = await prepareP12CliKit({
      outputPath: join(root, 'kit'),
      checkCliVersion: false,
      repositoryState: {
        gitHead: 'a'.repeat(40),
        trackedWorktreeClean: true,
      },
    });
    const kit = {
      manifestPath: join(kitResult.outputPath, 'manifest.json'),
      manifest: kitResult.manifest,
    };
    const pass1 = await writeCalibrationChain(root, kit);
    const contractPath = join(root, 'schema-contract.json');
    await writeSecureJson(
      contractPath,
      schemaShapeContractRecord({
        kitManifestPath: kit.manifestPath,
        kitManifestSha256: await sha256File(kit.manifestPath),
        generatorSourceSha256:
          kit.manifest.generatorSourceSha256,
        runnerSourceSha256: kit.manifest.runnerSourceSha256,
        pass1EvidenceManifestPath: pass1.path,
        pass1EvidenceManifestSha256: pass1.sha256,
      }),
      0o600,
    );
    const contractSha256 = await sha256File(contractPath);
    const contract = await loadSchemaShapeContract(contractPath, {
      kit,
      expectedSha256: contractSha256,
      now: new Date('2026-07-28T09:00:00+07:00'),
    });
    expect(
      expectedSchemaShapeFingerprint(
        contract,
        FINAL_MIGRATION_ORDINAL,
      ),
    ).toBe(distinctSchemaFingerprints[FINAL_MIGRATION_ORDINAL]);
    expect(contract.pass1Evidence.manifest.stage).toBe(
      FINAL_MIGRATION_ORDINAL,
    );
    await expect(loadSchemaShapeContract(contractPath, {
      kit,
      expectedSha256: contractSha256,
      requireV4: true,
    })).rejects.toThrow(
      'requires a fresh v4 continuity schema-shape contract',
    );

    await chmod(contractPath, 0o400);
    await expect(loadSchemaShapeContract(contractPath, {
      kit,
      expectedSha256: contractSha256,
    })).rejects.toThrow('exactly 0600');

    const selfReviewedContractPath = join(
      root,
      'self-reviewed-schema-contract.json',
    );
    await writeSecureJson(
      selfReviewedContractPath,
      schemaShapeContractRecord({
        kitManifestPath: kit.manifestPath,
        kitManifestSha256: await sha256File(kit.manifestPath),
        generatorSourceSha256:
          kit.manifest.generatorSourceSha256,
        runnerSourceSha256: kit.manifest.runnerSourceSha256,
        pass1EvidenceManifestPath: pass1.path,
        pass1EvidenceManifestSha256: pass1.sha256,
        captureExecutor: 'verifier-b',
        reviewerLogin: 'verifier-b',
      }),
      0o600,
    );
    await expect(loadSchemaShapeContract(
      selfReviewedContractPath,
      { kit },
    )).rejects.toThrow('distinct from the pass-1 capture executor');

    const earlyReviewContractPath = join(
      root,
      'early-review-schema-contract.json',
    );
    await writeSecureJson(
      earlyReviewContractPath,
      schemaShapeContractRecord({
        kitManifestPath: kit.manifestPath,
        kitManifestSha256: await sha256File(kit.manifestPath),
        generatorSourceSha256:
          kit.manifest.generatorSourceSha256,
        runnerSourceSha256: kit.manifest.runnerSourceSha256,
        pass1EvidenceManifestPath: pass1.path,
        pass1EvidenceManifestSha256: pass1.sha256,
        reviewSubmittedAt: '2026-07-28T08:05:00+07:00',
      }),
      0o600,
    );
    await expect(loadSchemaShapeContract(
      earlyReviewContractPath,
      { kit },
    )).rejects.toThrow(
      'review must occur after pass-1 evidence completion',
    );

    const legacyContract = schemaShapeContractRecord({
      kitManifestPath: kit.manifestPath,
      kitManifestSha256: await sha256File(kit.manifestPath),
      generatorSourceSha256:
        kit.manifest.generatorSourceSha256,
      runnerSourceSha256: kit.manifest.runnerSourceSha256,
      pass1EvidenceManifestPath: pass1.path,
      pass1EvidenceManifestSha256: pass1.sha256,
    }) as Record<string, unknown>;
    delete legacyContract.githubReview;
    Object.assign(legacyContract, {
      reviewedBy: 'Verifier B',
      reviewReference: 'legacy free-form review',
      reviewedAt: '2026-07-28T08:30:00+07:00',
    });
    const legacyContractPath = join(
      root,
      'legacy-schema-contract.json',
    );
    await writeSecureJson(legacyContractPath, legacyContract, 0o600);
    await expect(loadSchemaShapeContract(
      legacyContractPath,
      { kit },
    )).rejects.toThrow('keys do not match the frozen manifest');

    const advisorPath = join(root, 'advisors.json');
    await writeSecureJson(advisorPath, { findings: [] }, 0o400);
    const advisorSha256 = await sha256File(advisorPath);
    await expect(loadBoundAdvisorArtifact(
      advisorPath,
      advisorSha256,
    )).resolves.toMatchObject({
      path: advisorPath,
      sha256: advisorSha256,
    });
    await expect(loadBoundAdvisorArtifact(
      advisorPath,
      '0'.repeat(64),
    )).rejects.toThrow('differs from the bound value');
  });

  it('requires owner-only global/public function defaults and binds them to the 017a stage', () => {
    const exactDefaults = [
      requiredFunctionDefaultAcl(),
      requiredFunctionDefaultAcl('public'),
    ];
    expect(() => validateRequiredFunctionDefaultAcl([
      ...exactDefaults,
    ])).not.toThrow();
    expect(() => validateRequiredFunctionDefaultAcl([{
      ...requiredFunctionDefaultAcl(),
      schema_name: 'private',
    }, requiredFunctionDefaultAcl('public')])).toThrow('Global postgres-owner');
    expect(() => validateRequiredFunctionDefaultAcl([
      {
        ...requiredFunctionDefaultAcl(),
        acl: '{postgres=X/postgres,=X/postgres}',
        public_execute: true,
      },
      requiredFunctionDefaultAcl('public'),
    ])).toThrow('exact deny-by-default');
    expect(() => validateRequiredFunctionDefaultAcl([
      requiredFunctionDefaultAcl(),
      {
        ...requiredFunctionDefaultAcl('public'),
        acl: '{postgres=X/postgres,service_role=X/postgres}',
        service_role_execute: true,
      },
    ])).toThrow('not owner-only');

    const through017 = [
      ...FULL_PRE_017_LEDGER_SEQUENCE,
      PHASE4_MIGRATIONS[0],
    ];
    const preBridgePublicDefault = {
      ...requiredFunctionDefaultAcl('public'),
      acl: '{postgres=X/postgres,service_role=X/postgres}',
      service_role_execute: true,
    };
    expect(() => validateFunctionDefaultAclForMigrations(
      [preBridgePublicDefault],
      through017,
    )).not.toThrow();
    expect(() => validateFunctionDefaultAclForMigrations(
      [requiredFunctionDefaultAcl(), preBridgePublicDefault],
      through017,
    )).toThrow('appeared before the reviewed 017a bridge');

    const through017a = [
      ...FULL_PRE_017_LEDGER_SEQUENCE,
      ...PHASE4_MIGRATIONS.slice(0, 2),
    ];
    expect(() => validateFunctionDefaultAclForMigrations(
      exactDefaults,
      through017a,
    )).not.toThrow();
    expect(() => validateFunctionDefaultAclForMigrations(
      [requiredFunctionDefaultAcl('public')],
      through017a,
    )).toThrow('Global postgres-owner');
  });

  it('binds authenticated private-schema USAGE to the exact reviewed migration stage', () => {
    const through017 = [
      ...FULL_PRE_017_LEDGER_SEQUENCE,
      PHASE4_MIGRATIONS[0],
    ];
    expect(() => validatePrivateSchemaAcl(
      [privateSchemaAcl(false)],
      through017,
    )).not.toThrow();
    expect(() => validatePrivateSchemaAcl(
      [privateSchemaAcl(true)],
      through017,
    )).toThrow('before migration 018');

    const through017a = [
      ...FULL_PRE_017_LEDGER_SEQUENCE,
      ...PHASE4_MIGRATIONS.slice(0, 2),
    ];
    expect(() => validatePrivateSchemaAcl(
      [privateSchemaAcl(false)],
      through017a,
    )).not.toThrow();
    expect(() => validatePrivateSchemaAcl(
      [privateSchemaAcl(true)],
      through017a,
    )).toThrow('before migration 018');

    for (let phaseIndex = 2; phaseIndex < PHASE4_MIGRATIONS.length; phaseIndex += 1) {
      const expectedMigrations = [
        ...FULL_PRE_017_LEDGER_SEQUENCE,
        ...PHASE4_MIGRATIONS.slice(0, phaseIndex + 1),
      ];
      expect(() => validatePrivateSchemaAcl(
        [privateSchemaAcl(true)],
        expectedMigrations,
      )).not.toThrow();
      expect(() => validatePrivateSchemaAcl(
        [privateSchemaAcl(false)],
        expectedMigrations,
      )).toThrow('required after migration 018');
    }

    expect(() => validatePrivateSchemaAcl([{
      ...privateSchemaAcl(true),
      public_usage: true,
    }], [
      ...FULL_PRE_017_LEDGER_SEQUENCE,
      ...PHASE4_MIGRATIONS.slice(0, 3),
    ])).toThrow('PUBLIC');
    expect(() => validatePrivateSchemaAcl([{
      ...privateSchemaAcl(true),
      anon_usage: true,
    }], [
      ...FULL_PRE_017_LEDGER_SEQUENCE,
      ...PHASE4_MIGRATIONS.slice(0, 3),
    ])).toThrow('anon');
    expect(() => validatePrivateSchemaAcl([{
      ...privateSchemaAcl(true),
      authenticated_create: true,
    }], [
      ...FULL_PRE_017_LEDGER_SEQUENCE,
      ...PHASE4_MIGRATIONS.slice(0, 3),
    ])).toThrow('CREATE to authenticated');
    expect(() => validatePrivateSchemaAcl([{
      ...privateSchemaAcl(true),
      service_role_usage: false,
    }], [
      ...FULL_PRE_017_LEDGER_SEQUENCE,
      ...PHASE4_MIGRATIONS.slice(0, 3),
    ])).toThrow('service_role');
  });

  it('requires the exact least-privilege catalog_action_error posture after migration 026', () => {
    const through025 = [
      ...FULL_PRE_017_LEDGER_SEQUENCE,
      ...PHASE4_MIGRATIONS.slice(0, -1),
    ];
    expect(() => validateCatalogActionErrorAcl(
      [catalogActionErrorRoutine({ security_definer: true })],
      through025,
    )).not.toThrow();

    const through026 = [
      ...FULL_PRE_017_LEDGER_SEQUENCE,
      ...PHASE4_MIGRATIONS,
    ];
    expect(() => validateCatalogActionErrorAcl(
      [catalogActionErrorRoutine()],
      through026,
    )).not.toThrow();
    expect(() => validateCatalogActionErrorAcl(
      [catalogActionErrorRoutine({ security_definer: true })],
      through026,
    )).toThrow('SECURITY INVOKER');
    expect(() => validateCatalogActionErrorAcl(
      [catalogActionErrorRoutine({
        acl:
          '{postgres=X/postgres,authenticated=X*/postgres}',
      })],
      through026,
    )).toThrow('without grant option');
    expect(() => validateCatalogActionErrorAcl(
      [catalogActionErrorRoutine({ service_role_execute: true })],
      through026,
    )).toThrow('service_role');
    expect(() => validateCatalogActionErrorAcl(
      [
        catalogActionErrorRoutine(),
        catalogActionErrorRoutine({
          oid: '43',
          signature: 'private.catalog_action_error(text)',
        }),
      ],
      through026,
    )).toThrow('exactly one');
  });

  it('requires disposable sentinel and prior verifier signoff CLI boundaries', () => {
    const common = [
      '--mode', 'rehearsal',
      '--kit', '/external/kit',
      '--db-url',
      `postgresql://postgres@127.0.0.1:55432/${REHEARSAL_DATABASE_NAME}?sslmode=disable`,
      '--evidence', '/external/evidence',
      '--executor-label', 'Rehearsal executor',
      '--schema-shape-contract', '/external/schema-shape-contract.json',
      '--advisor-artifact', '/external/advisors.json',
      '--advisor-artifact-sha256', '9'.repeat(64),
      '--rehearsal-sentinel', 'n'.repeat(32),
    ];
    expect(parseArguments([
      ...common,
      '--step', '017',
    ])).toMatchObject({
      step: '017',
      rehearsal_sentinel: 'n'.repeat(32),
    });
    expect(() => parseArguments([
      ...common.filter((value, index) =>
        value !== '--rehearsal-sentinel'
        && common[index - 1] !== '--rehearsal-sentinel'),
      '--step', '017',
    ])).toThrow('requires --rehearsal-sentinel');
    expect(() => parseArguments([
      ...common,
      '--step', '017a',
    ])).toThrow('Step 017a requires --prior-step-signoff');
    expect(parseArguments([
      ...common,
      '--step', '017a',
      '--prior-step-signoff', '/external/signoff.json',
    ])).toMatchObject({ step: '017a' });
    expect(parseArguments([
      ...common,
      '--step', '018',
      '--prior-step-signoff', '/external/signoff.json',
    ])).toMatchObject({ step: '018' });
  });

  it('provides the exact isolated calibration path through the reviewed bridge', () => {
    const common = [
      '--kit', '/external/kit',
      '--db-url',
      `postgresql://postgres@127.0.0.1:55432/${REHEARSAL_DATABASE_NAME}?sslmode=disable`,
      '--evidence', '/external/calibration',
      '--executor-label', 'Capture Executor A',
      '--rehearsal-sentinel', 'n'.repeat(32),
    ];
    expect(parseCalibrationArguments([
      ...common,
      '--stage', '016',
    ])).toMatchObject({
      stage: '016',
      executor_label: 'Capture Executor A',
    });
    expect(() => parseCalibrationArguments([
      ...common,
      '--stage', '017',
    ])).toThrow('requires --prior-calibration-manifest');
    expect(parseCalibrationArguments([
      ...common,
      '--stage', '017',
      '--prior-calibration-manifest', '/external/016-manifest.json',
    ])).toMatchObject({
      stage: '017',
    });
    expect(parseCalibrationArguments([
      ...common,
      '--stage', '017a',
      '--prior-calibration-manifest', '/external/017-manifest.json',
    ])).toMatchObject({ stage: '017a' });
    expect(parseCalibrationArguments([
      ...common,
      '--stage', '018',
      '--prior-calibration-manifest', '/external/017a-manifest.json',
    ])).toMatchObject({ stage: '018' });
    expect(() => parseCalibrationArguments([
      ...common,
      '--stage', '016',
      '--mode', 'production',
    ])).toThrow('Unknown schema calibration argument');
    expect(() => assertReviewedBridgeSequence('017a')).not.toThrow();
    expect(() => assertReviewedBridgeSequence('018')).not.toThrow();
    expect(CLI_USAGE).toContain('calibrate-schema');
    expect(CLI_USAGE).toContain('can never authorize Production');
  });

  it('freezes the bridge as the only immediate predecessor of 018', () => {
    expect(PHASE4_MIGRATIONS.slice(0, 3).map(
      (migration) => migration.ordinal,
    )).toEqual(['017', '017a', '018']);
    expect(
      PHASE4_MIGRATIONS[0].version < PHASE4_MIGRATIONS[1].version,
    ).toBe(true);
    expect(
      PHASE4_MIGRATIONS[1].version < PHASE4_MIGRATIONS[2].version,
    ).toBe(true);
  });

  it('keeps calibration preflight immutable and records the write boundary separately', async () => {
    const source = await readFile(
      join(REPOSITORY_ROOT, P12_RUNNER_SOURCE),
      'utf8',
    );
    const calibrationEntry = source.indexOf(
      'export async function executeSchemaCalibration',
    );
    const nextEntry = source.indexOf(
      'async function collectWriteBoundary',
      calibrationEntry,
    );
    const calibrationSource = source.slice(calibrationEntry, nextEntry);
    expect(
      calibrationSource.match(
        /'01-calibration-preflight\.json'/g,
      ),
    ).toHaveLength(1);
    expect(
      calibrationSource.match(
        /'01-calibration-write-boundary\.json'/g,
      ),
    ).toHaveLength(1);
    expect(
      calibrationSource.match(
        /'03-schema-capture\.json'/g,
      ),
    ).toHaveLength(1);
    expect(calibrationSource).not.toContain(
      'preflight.immediateWriteBoundary',
    );
    const migrationSpawn = calibrationSource.indexOf(
      'migrationResult = await runCapturedProcess',
    );
    const afterStateCapture = calibrationSource.indexOf(
      'capturedSnapshot = migrationPerformed',
      migrationSpawn,
    );
    const afterStateWrite = calibrationSource.indexOf(
      "'03-schema-capture.json'",
      afterStateCapture,
    );
    expect(
      migrationSpawn < afterStateCapture
        && afterStateCapture < afterStateWrite,
    ).toBe(true);
    expect(
      calibrationSource.slice(migrationSpawn, afterStateCapture),
    ).not.toContain('writeEvidenceFile');
  });

  it('uses one MVCC statement for the last database write boundary', () => {
    const sql = writeBoundarySql('n'.repeat(32));
    expect(sql).toContain('as identity');
    expect(sql).toContain('as ledger');
    expect(sql).toContain('as flags');
    expect(sql).toContain('as catalog');
    expect(sql).toContain('as catalog_pointer');
    expect(sql).toContain('as factor_and_boq');
    expect(sql).toContain('as hotfix016');
    expect(sql).toContain('as disposable_target');
    expect(sql.trim().match(/;$/)).not.toBeNull();
    expect(sql.match(/;/g)).toHaveLength(1);
  });

  it('reserves the final MVCC query in the immediate pre-migration budget', () => {
    expect(INITIAL_WINDOW_BUDGET_MS).toBe(1_275_000);
    expect(PRE_MIGRATION_WINDOW_BUDGET_MS).toBe(750_000);
    expect(POSTFLIGHT_BUDGET_MS).toBe(525_000);
  });

  it('publishes a hash-verified evidence manifest at one final atomic commit point', async () => {
    const root = await temporaryRoot();
    const manifest = {
      schema: EVIDENCE_MANIFEST_SCHEMA,
      step: '017',
      mechanicalSuccess: true,
    };
    const published = await publishEvidenceManifestCommit(
      root,
      '05-evidence-manifest.json',
      manifest,
    );

    expect(JSON.parse(await readFile(published.path, 'utf8')))
      .toEqual(manifest);
    expect(published.sha256).toBe(await sha256File(published.path));
    expect((await stat(published.path)).mode & 0o077).toBe(0);
    expect(await readdir(root)).toEqual(['05-evidence-manifest.json']);

    const source = await readFile(
      join(REPOSITORY_ROOT, P12_RUNNER_SOURCE),
      'utf8',
    );
    const entry = source.indexOf(
      'export async function publishEvidenceManifestCommit',
    );
    const nextEntry = source.indexOf(
      'async function writeEvidenceManifest',
      entry,
    );
    const commitSource = source.slice(entry, nextEntry);
    const renameCommit = commitSource.indexOf(
      'await rename(pendingPath, finalPath)',
    );
    expect(renameCommit).toBeGreaterThan(0);
    expect(commitSource.slice(renameCommit + 1)).not.toMatch(/\bawait\b/);
  });

  it('validates BOQ, Factor F, and hotfix 016 inside the immediate write boundary', async () => {
    const source = await readFile(
      join(REPOSITORY_ROOT, P12_RUNNER_SOURCE),
      'utf8',
    );
    const boundaryEntry = source.indexOf(
      'async function collectWriteBoundary',
    );
    const nextEntry = source.indexOf(
      'function assertFinalCloseoutSnapshotMatches',
      boundaryEntry,
    );
    const boundarySource = source.slice(boundaryEntry, nextEntry);
    expect(boundarySource).toContain('validateFactorAndBoq');
    expect(boundarySource).toContain('assertFactorAndBoqUnchanged');
    expect(boundarySource).toContain('validateHotfix016');
    expect(boundarySource).toContain('assertHotfix016Unchanged');
  });

  it('rejects BOQ, Factor F, or hotfix drift in the immediate boundary row', () => {
    const catalog = catalogSnapshot();
    const {
      pointer: catalogPointer,
      ...catalogRow
    } = catalog;
    const factorAndBoq = factorAndBoqSnapshot();
    const hotfix016 = hotfix016Snapshot();
    const boundary = {
      identity: {
        current_user_name: REQUIRED_CURRENT_USER,
        session_user_name: REQUIRED_CURRENT_USER,
        database_name: REHEARSAL_DATABASE_NAME,
        server_version_num: '170006',
      },
      ledger: FULL_PRE_017_LEDGER_SEQUENCE.map((migration) => ({
        version: migration.version,
        name: migration.ledgerName,
      })),
      flags: [],
      catalog: catalogRow,
      catalog_pointer: catalogPointer,
      factor_and_boq: factorAndBoq,
      hotfix016,
      disposable_target: {
        database_name: REHEARSAL_DATABASE_NAME,
        total_rows: 1,
        exact_rows: 1,
        table_owner: REQUIRED_CURRENT_USER,
      },
    };
    const validate = (candidate: Record<string, unknown>) =>
      validateWriteBoundaryRow({
        boundary: candidate,
        mode: 'rehearsal',
        expectedMigrations: FULL_PRE_017_LEDGER_SEQUENCE,
        expectedCatalog: catalog,
        expectedFactorAndBoq: factorAndBoq,
        expectedHotfix016: hotfix016,
      });

    expect(validate(boundary)).toMatchObject({
      factorAndBoq,
      hotfix016,
    });
    expect(() => validate({
      ...boundary,
      factor_and_boq: {
        ...factorAndBoq,
        boq_count: Number(factorAndBoq.boq_count) + 1,
      },
    })).toThrow('boq_count');
    expect(() => validate({
      ...boundary,
      hotfix016: {
        ...hotfix016,
        prosrc_sha256: '0'.repeat(64),
      },
    })).toThrow('body SHA-256 drifted');
  });

  it('allows only the committed Owner checklist marker between source and Production GO heads', () => {
    expect(validateProductionHeadDelta([
      P12_RUNNER_AUTHORITY_FILE,
    ])).toEqual([P12_RUNNER_AUTHORITY_FILE]);
    expect(() => validateProductionHeadDelta([])).toThrow(
      'may differ from the source/tooling HEAD only',
    );
    expect(() => validateProductionHeadDelta([
      P12_RUNNER_AUTHORITY_FILE,
      P12_RUNNER_SOURCE,
    ])).toThrow('may differ from the source/tooling HEAD only');
  });

  it('distinguishes an active P-12 authority marker from explanatory prose', () => {
    expect(containsActiveAuthorityMarker(
      'A fresh `P12_RUNNER_AUTHORITY_V2` checkpoint is required.',
      'P12_RUNNER_AUTHORITY_V2',
    )).toBe(false);
    expect(containsActiveAuthorityMarker(
      '<!-- P12_RUNNER_AUTHORITY_V2 {"decision":"GO"} -->',
      'P12_RUNNER_AUTHORITY_V2',
    )).toBe(true);
  });

  it('keeps every external guard before the single last-await database boundary and immediate spawn', async () => {
    const source = await readFile(
      join(REPOSITORY_ROOT, P12_RUNNER_SOURCE),
      'utf8',
    );
    const stepEntry = source.indexOf(
      'export async function executeP12Step',
    );
    const finalKitGuard = source.indexOf(
      'const finalWriteKit = await verifyKit',
      stepEntry,
    );
    const finalPass2Guard = source.indexOf(
      'await loadPass2VerificationEvidenceManifest',
      finalKitGuard,
    );
    const finalBudgetGuard = source.indexOf(
      "windowPhase: 'Immediate pre-migration boundary'",
      finalPass2Guard,
    );
    const lastAwaitMarker = source.indexOf(
      'LAST AWAITED OPERATION BEFORE SPAWN',
      finalBudgetGuard,
    );
    const writeBoundary = source.indexOf(
      'const writeBoundary = await collectWriteBoundary',
      lastAwaitMarker,
    );
    const boundaryAssigned = source.indexOf(
      'preflight.immediateWriteBoundary = writeBoundary',
      writeBoundary,
    );
    const migrationSpawn = source.indexOf(
      'migrationResult = await runCapturedProcess',
      boundaryAssigned,
    );
    expect([
      stepEntry,
      finalKitGuard,
      finalPass2Guard,
      finalBudgetGuard,
      lastAwaitMarker,
      writeBoundary,
      boundaryAssigned,
      migrationSpawn,
    ].every((index) => index >= 0)).toBe(true);
    expect(
      stepEntry
        < finalKitGuard
        && finalKitGuard < finalPass2Guard
        && finalPass2Guard < finalBudgetGuard
        && finalBudgetGuard < lastAwaitMarker
        && lastAwaitMarker < writeBoundary
        && writeBoundary < boundaryAssigned
        && boundaryAssigned < migrationSpawn,
    ).toBe(true);
    expect(
      source.slice(boundaryAssigned, migrationSpawn),
    ).not.toMatch(/\bawait\b/);
  });

  it('attempts the bounded read-only after-state before any post-CLI evidence write', async () => {
    const source = await readFile(
      join(REPOSITORY_ROOT, P12_RUNNER_SOURCE),
      'utf8',
    );
    const stepEntry = source.indexOf(
      'export async function executeP12Step',
    );
    const migrationSpawn = source.indexOf(
      'migrationResult = await runCapturedProcess',
      stepEntry,
    );
    const postflightCapture = source.indexOf(
      'postflight = await collectSnapshot',
      migrationSpawn,
    );
    const afterStateWrite = source.indexOf(
      "'03-postflight.json'",
      postflightCapture,
    );
    const boundaryEvidenceWrite = source.indexOf(
      "'01-preflight-write-boundary.json'",
      afterStateWrite,
    );
    expect([
      stepEntry,
      migrationSpawn,
      postflightCapture,
      afterStateWrite,
      boundaryEvidenceWrite,
    ].every((index) => index >= 0)).toBe(true);
    expect(
      migrationSpawn < postflightCapture
        && postflightCapture < afterStateWrite
        && afterStateWrite < boundaryEvidenceWrite,
    ).toBe(true);
    expect(
      source.slice(migrationSpawn, postflightCapture),
    ).not.toContain('writeEvidenceFile');
    expect(
      source.slice(migrationSpawn, postflightCapture),
    ).toContain('postMigrationWindowError');
  });

  it('freezes a separate read-only final-closeout CLI boundary', () => {
    const common = [
      '--mode', 'rehearsal',
      '--kit', '/external/kit',
      '--db-url',
      `postgresql://postgres@127.0.0.1:55432/${REHEARSAL_DATABASE_NAME}?sslmode=disable`,
      '--evidence', '/external/closeout-evidence',
      '--final-migration-evidence-manifest',
      '/external/026/05-evidence-manifest.json',
      '--final-signoff', '/external/final-signoff.json',
      '--verifier-label', 'verifier-b',
      '--schema-shape-contract', '/external/schema-shape-contract.json',
      '--advisor-artifact', '/external/advisors.json',
      '--advisor-artifact-sha256', '9'.repeat(64),
      '--rehearsal-sentinel', 'n'.repeat(32),
    ];
    expect(parseCloseoutArguments(common)).toMatchObject({
      mode: 'rehearsal',
      verifier_label: 'verifier-b',
      final_migration_evidence_manifest:
        '/external/026/05-evidence-manifest.json',
    });
    expect(() => parseCloseoutArguments([
      ...common,
      '--step', FINAL_MIGRATION_ORDINAL,
    ])).toThrow('Unknown closeout argument');
    expect(() => parseCloseoutArguments(
      common.filter((value, index) =>
        value !== '--final-signoff'
        && common[index - 1] !== '--final-signoff'),
    )).toThrow('Missing closeout --final-signoff');
    expect(CLI_USAGE).toContain('Final closeout is read-only');
    expect(CLI_USAGE).toContain('does not authorize P-13');
  });

  it('validates a 0600 prior-step verifier signoff against hashed evidence', async () => {
    const root = await realpath(await temporaryRoot());
    const gitHead = 'a'.repeat(40);
    const kitManifestSha256 = 'c'.repeat(64);
    const schemaShapeContract = {
      path: join(root, 'schema-contract.json'),
      sha256: '8'.repeat(64),
      record: schemaShapeContractRecord({ gitHead }),
    };
    const advisorArtifact = {
      path: join(root, 'advisors.json'),
      sha256: '9'.repeat(64),
    };
    const files: Record<string, unknown> = {
      '00-context.json': {
        mode: 'rehearsal',
        step: '017',
        gitHead,
        kitManifestSha256,
        executor: 'Executor A',
        schemaShapeContractSha256: schemaShapeContract.sha256,
        preStepAdvisorArtifactPath: join(root, 'baseline-advisors.json'),
        preStepAdvisorArtifactSha256: '7'.repeat(64),
      },
      '01-preflight.json': { capturedAt: '2026-07-28T09:00:00+07:00' },
      '01-preflight-write-boundary.json': {
        capturedAt: '2026-07-28T09:01:00+07:00',
      },
      '02-cli-output.json': { stdout: '', stderr: '' },
      '02-migration-outcome.json': {
        finishedAt: '2026-07-28T09:02:00+07:00',
        mechanicalSuccess: true,
        uncertainOutcome: false,
        securityContractVerifierRequired: true,
        automaticNextStep: false,
      },
      '03-postflight.json': {
        capturedAt: '2026-07-28T09:02:30+07:00',
        ledger: [
          ...FULL_PRE_017_LEDGER_SEQUENCE,
          PHASE4_MIGRATIONS[0],
        ].map((migration) => ({
          version: migration.version,
          name: migration.ledgerName,
        })),
        schemaShape: schemaShapeSnapshot(
          distinctSchemaFingerprints['017'],
        ),
      },
    };

    for (const [name, value] of Object.entries(files)) {
      await writeSecureJson(join(root, name), value);
    }
    const fileHashes = Object.fromEntries(
      await Promise.all(
        Object.keys(files).map(async (name) => [
          name,
          await sha256File(join(root, name)),
        ]),
      ),
    );
    const evidenceManifestPath = join(root, '05-evidence-manifest.json');
    await writeSecureJson(evidenceManifestPath, {
      schema: EVIDENCE_MANIFEST_SCHEMA,
      createdAt: '2026-07-28T09:03:00+07:00',
      step: '017',
      mode: 'rehearsal',
      gitHead,
      kitManifestSha256,
      files: fileHashes,
    });
    const signoffPath = join(root, '017-signoff.json');
    await writeSecureJson(signoffPath, {
      schema: PRIOR_STEP_SIGNOFF_SCHEMA,
      decision: 'SECURITY_VERIFIED',
      previousStep: '017',
      authorizedNextStep: '017a',
      executionGitHead: gitHead,
      kitManifestSha256,
      previousExecutor: 'Executor A',
      verifier: 'verifier-b',
      ownershipAclRlsReviewed: true,
      functionPostureAndBodyFingerprintsReviewed: true,
      ledgerAndFlagsReviewed: true,
      advisorDeltaTriaged: true,
      schemaShapeContractSha256: schemaShapeContract.sha256,
      priorSchemaShapeFingerprintSha256:
        distinctSchemaFingerprints['017'],
      advisorArtifactPath: advisorArtifact.path,
      advisorArtifactSha256: advisorArtifact.sha256,
      advisorArtifactCapturedAt: '2026-07-28T09:03:00+07:00',
      reviewedAt: '2026-07-28T09:04:00+07:00',
      priorEvidenceManifestPath: evidenceManifestPath,
      priorEvidenceManifestSha256:
        await sha256File(evidenceManifestPath),
      priorOutcomeSha256: fileHashes['02-migration-outcome.json'],
      priorPostflightSha256: fileHashes['03-postflight.json'],
    }, 0o600);

    await expect(loadPriorStepSignoff(signoffPath, {
      currentStep: '017a',
      currentHead: gitHead,
      kitManifestSha256,
      schemaShapeContract,
      advisorArtifact,
      now: new Date('2026-07-28T09:05:00+07:00'),
    })).resolves.toMatchObject({
      path: signoffPath,
      signoff: {
        decision: 'SECURITY_VERIFIED',
        previousStep: '017',
        authorizedNextStep: '017a',
      },
    });

    const validPriorSignoff = JSON.parse(
      await readFile(signoffPath, 'utf8'),
    );
    await writeSecureJson(signoffPath, {
      ...validPriorSignoff,
      advisorArtifactCapturedAt: '2026-07-28T09:01:00+07:00',
    }, 0o600);
    await expect(loadPriorStepSignoff(signoffPath, {
      currentStep: '017a',
      currentHead: gitHead,
      kitManifestSha256,
      schemaShapeContract,
      advisorArtifact,
      now: new Date('2026-07-28T09:05:00+07:00'),
    })).rejects.toThrow('not freshly captured');
  });

  it('requires an exact 0600 final verifier closeout bound to complete final-migration evidence', async () => {
    const root = await realpath(await temporaryRoot());
    const gitHead = 'a'.repeat(40);
    const preparedKit = await prepareP12CliKit({
      outputPath: join(root, 'kit'),
      checkCliVersion: false,
      repositoryState: {
        gitHead,
        trackedWorktreeClean: true,
      },
    });
    const kit = await verifyKit(
      preparedKit.outputPath,
      FINAL_MIGRATION_ORDINAL,
      'rehearsal',
    );
    const kitManifestSha256 = await sha256File(kit.manifestPath);
    const schemaShapeContract = {
      path: join(root, 'schema-contract.json'),
      sha256: '8'.repeat(64),
      record: schemaShapeContractRecord({
        gitHead,
        kitManifestPath: kit.manifestPath,
        kitManifestSha256,
        generatorSourceSha256:
          kit.manifest.generatorSourceSha256,
        runnerSourceSha256: kit.manifest.runnerSourceSha256,
        pass1EvidenceManifestPath:
          join(root, 'pass1-evidence-manifest.json'),
        pass1EvidenceManifestSha256: 'f'.repeat(64),
      }),
    };
    const advisorArtifactPath = join(root, 'advisors.json');
    await writeSecureJson(
      advisorArtifactPath,
      { findings: [] },
    );
    const advisorArtifact = {
      path: advisorArtifactPath,
      sha256: await sha256File(advisorArtifactPath),
    };
    const ownershipAndAclInventory = {
      relations: kit.step.objectTargetsAfter.relations.map(
        (target: { schema: string; name: string }, index: number) => ({
          schema_name: target.schema,
          object_name: target.name,
          oid: String(index + 1),
          owner: REQUIRED_CURRENT_USER,
          relation_kind: 'r',
          rls_enabled: true,
        }),
      ),
      routines: kit.step.objectTargetsAfter.routines.map(
        (target: { schema: string; name: string }, index: number) =>
          target.schema === 'private'
            && target.name === 'catalog_action_error'
            ? catalogActionErrorRoutine({
                oid: String(index + 1),
              })
            : {
                schema_name: target.schema,
                object_name: target.name,
                oid: String(index + 1),
                owner: REQUIRED_CURRENT_USER,
                signature: `${target.schema}.${target.name}()`,
                security_definer: false,
                function_config: 'search_path=""',
                acl: '{postgres=X/postgres}',
                public_execute: false,
                anon_execute: false,
                authenticated_execute: false,
                service_role_execute: false,
              },
      ),
      policies: [],
      relationGrants: [],
      triggers: [],
      defaultPrivileges: [
        requiredFunctionDefaultAcl(),
        requiredFunctionDefaultAcl('public'),
      ],
      privateSchema: [privateSchemaAcl(true)],
    };
    const files: Record<string, unknown> = {
      '00-context.json': {
        mode: 'rehearsal',
        step: FINAL_MIGRATION_ORDINAL,
        gitHead,
        kitManifestSha256,
        executor: 'Executor A',
        schemaShapeContractSha256: schemaShapeContract.sha256,
        preStepAdvisorArtifactPath: join(root, 'post-024-advisors.json'),
        preStepAdvisorArtifactSha256: '7'.repeat(64),
      },
      '01-preflight.json': {
        capturedAt: '2026-07-28T10:00:00+07:00',
      },
      '01-preflight-write-boundary.json': {
        capturedAt: '2026-07-28T10:00:30+07:00',
      },
      '02-cli-output.json': {
        stdout: '',
        stderr: '',
      },
      '02-migration-outcome.json': {
        finishedAt: '2026-07-28T10:01:00+07:00',
        mechanicalSuccess: true,
        verifiedSuccess: false,
        uncertainOutcome: false,
        securityContractVerifierRequired: true,
        automaticNextStep: false,
      },
      '03-postflight.json': {
        capturedAt: '2026-07-28T10:01:30+07:00',
        identity: {
          current_user_name: REQUIRED_CURRENT_USER,
          session_user_name: REQUIRED_CURRENT_USER,
          database_name: REHEARSAL_DATABASE_NAME,
          server_version_num: '170006',
        },
        ledger: [
          ...FULL_PRE_017_LEDGER_SEQUENCE,
          ...PHASE4_MIGRATIONS,
        ].map((migration) => ({
          version: migration.version,
          name: migration.ledgerName,
        })),
        flags: {
          catalog_admin_enabled: 'false',
          catalog_new_identity_enabled: 'false',
          catalog_retirement_enabled: 'false',
        },
        catalog: catalogSnapshot(),
        factorAndBoq: factorAndBoqSnapshot(),
        hotfix016: hotfix016Snapshot(),
        schemaShape: schemaShapeSnapshot(
          distinctSchemaFingerprints[FINAL_MIGRATION_ORDINAL],
        ),
        ownershipAndAclInventory,
      },
    };
    for (const [name, value] of Object.entries(files)) {
      await writeSecureJson(join(root, name), value);
    }
    const fileHashes = Object.fromEntries(
      await Promise.all(
        Object.keys(files).map(async (name) => [
          name,
          await sha256File(join(root, name)),
        ]),
      ),
    );
    const evidenceManifestPath = join(root, '05-evidence-manifest.json');
    await writeSecureJson(evidenceManifestPath, {
      schema: EVIDENCE_MANIFEST_SCHEMA,
      createdAt: '2026-07-28T10:02:00+07:00',
      step: FINAL_MIGRATION_ORDINAL,
      mode: 'rehearsal',
      gitHead,
      kitManifestSha256,
      files: fileHashes,
    });

    const signoff = {
      schema: FINAL_CLOSEOUT_SIGNOFF_SCHEMA,
      decision: 'P12_EXECUTION_VERIFIED',
      step: FINAL_MIGRATION_ORDINAL,
      executionGitHead: gitHead,
      kitManifestSha256,
      finalMigrationExecutor: 'Executor A',
      independentVerifier: 'verifier-b',
      independentVerificationCompleted: true,
      securityContractReviewed: true,
      advisorDeltaTriaged: true,
      ownershipAclRlsReviewed: true,
      functionPostureAndBodyFingerprintsReviewed: true,
      hotfix016PostureAndBodyReviewed: true,
      factorAndBoqFingerprintsReviewed: true,
      ledgerAndFlagsReviewed: true,
      schemaShapeContractSha256: schemaShapeContract.sha256,
      finalMigrationSchemaShapeFingerprintSha256:
        distinctSchemaFingerprints[FINAL_MIGRATION_ORDINAL],
      advisorArtifactPath: advisorArtifact.path,
      advisorArtifactSha256: advisorArtifact.sha256,
      advisorArtifactCapturedAt: '2026-07-28T10:02:30+07:00',
      p13Authorized: false,
      automaticNextStep: false,
      reviewedAt: '2026-07-28T10:03:00+07:00',
      finalMigrationEvidenceManifestPath: evidenceManifestPath,
      finalMigrationEvidenceManifestSha256:
        await sha256File(evidenceManifestPath),
      finalMigrationOutcomeSha256:
        fileHashes['02-migration-outcome.json'],
      finalMigrationPostflightSha256:
        fileHashes['03-postflight.json'],
    };
    const signoffPath = join(root, 'final-migration-signoff.json');
    await writeSecureJson(signoffPath, signoff, 0o600);

    await expect(loadFinalCloseoutSignoff(signoffPath, {
      mode: 'rehearsal',
      currentHead: gitHead,
      kitManifestSha256,
      objectTargets: kit.step.objectTargetsAfter,
      schemaShapeContract,
      advisorArtifact,
      now: new Date('2026-07-28T10:04:00+07:00'),
    })).resolves.toMatchObject({
      path: signoffPath,
      signoff: {
        decision: 'P12_EXECUTION_VERIFIED',
        independentVerifier: 'verifier-b',
        p13Authorized: false,
      },
      finalMigrationEvidence: {
        path: evidenceManifestPath,
      },
    });

    const staleStep025Signoff: Record<string, unknown> = {
      ...signoff,
      schema:
        'conduit-boq/master-catalog-p12-final-verifier-closeout/v1',
      step: '025',
      step025Executor: signoff.finalMigrationExecutor,
      step025SchemaShapeFingerprintSha256:
        signoff.finalMigrationSchemaShapeFingerprintSha256,
      step025EvidenceManifestPath:
        signoff.finalMigrationEvidenceManifestPath,
      step025EvidenceManifestSha256:
        signoff.finalMigrationEvidenceManifestSha256,
      step025OutcomeSha256:
        signoff.finalMigrationOutcomeSha256,
      step025PostflightSha256:
        signoff.finalMigrationPostflightSha256,
    };
    for (const field of [
      'finalMigrationExecutor',
      'finalMigrationSchemaShapeFingerprintSha256',
      'finalMigrationEvidenceManifestPath',
      'finalMigrationEvidenceManifestSha256',
      'finalMigrationOutcomeSha256',
      'finalMigrationPostflightSha256',
    ]) {
      delete staleStep025Signoff[field];
    }
    await writeSecureJson(
      signoffPath,
      staleStep025Signoff,
      0o600,
    );
    await expect(loadFinalCloseoutSignoff(signoffPath, {
      mode: 'rehearsal',
      currentHead: gitHead,
      kitManifestSha256,
      objectTargets: kit.step.objectTargetsAfter,
      schemaShapeContract,
      advisorArtifact,
      now: new Date('2026-07-28T10:04:00+07:00'),
    })).rejects.toThrow('keys do not match the frozen manifest');

    await writeSecureJson(signoffPath, {
      ...signoff,
      advisorArtifactCapturedAt: '2026-07-28T10:00:00+07:00',
    }, 0o600);
    await expect(loadFinalCloseoutSignoff(signoffPath, {
      mode: 'rehearsal',
      currentHead: gitHead,
      kitManifestSha256,
      objectTargets: kit.step.objectTargetsAfter,
      schemaShapeContract,
      advisorArtifact,
      now: new Date('2026-07-28T10:04:00+07:00'),
    })).rejects.toThrow('not freshly captured');

    await writeSecureJson(signoffPath, {
      ...signoff,
      p13Authorized: true,
    }, 0o600);
    await expect(loadFinalCloseoutSignoff(signoffPath, {
      mode: 'rehearsal',
      currentHead: gitHead,
      kitManifestSha256,
      objectTargets: kit.step.objectTargetsAfter,
      schemaShapeContract,
      advisorArtifact,
      now: new Date('2026-07-28T10:04:00+07:00'),
    })).rejects.toThrow('must not authorize P-13');

    await writeSecureJson(signoffPath, signoff, 0o600);
    const pass2Root = join(root, 'pass2-closeout');
    await mkdir(pass2Root, { mode: 0o700 });
    const rehearsalSentinelNonceSha256 = 'd'.repeat(64);
    const closeoutContext = {
      schema: FINAL_CLOSEOUT_CONTEXT_SCHEMA,
      mode: 'rehearsal',
      gitHead,
      applicationCandidate: APPLICATION_CANDIDATE,
      kitManifestSha256,
      schemaShapeContractPath: schemaShapeContract.path,
      schemaShapeContractSha256: schemaShapeContract.sha256,
      sourceToolingGitHead: gitHead,
      pass1EvidenceManifestPath:
        schemaShapeContract.record.pass1EvidenceManifestPath,
      pass1EvidenceManifestSha256:
        schemaShapeContract.record.pass1EvidenceManifestSha256,
      expectedSchemaShapeSha256:
        distinctSchemaFingerprints[FINAL_MIGRATION_ORDINAL],
      advisorArtifactPath: advisorArtifact.path,
      advisorArtifactSha256: advisorArtifact.sha256,
      advisorArtifactBytes: (await stat(advisorArtifact.path)).size,
      advisorArtifactCapturedAt:
        signoff.advisorArtifactCapturedAt,
      finalMigrationEvidenceManifestPath: evidenceManifestPath,
      finalMigrationEvidenceManifestSha256:
        signoff.finalMigrationEvidenceManifestSha256,
      finalCloseoutSignoffPath: signoffPath,
      finalCloseoutSignoffSha256: await sha256File(signoffPath),
      finalMigrationExecutor: signoff.finalMigrationExecutor,
      independentVerifier: signoff.independentVerifier,
      rehearsalSentinelNonceSha256,
      supabaseCliVersion: REQUIRED_SUPABASE_CLI_VERSION,
      postgresMajor: REQUIRED_POSTGRES_MAJOR,
      readOnly: true,
      migrationPerformed: false,
      p13Authorized: false,
      automaticNextStep: false,
    };
    const rehearsalSentinel = {
      databaseName: REHEARSAL_DATABASE_NAME,
      tableOwner: REQUIRED_CURRENT_USER,
      purpose: REHEARSAL_SENTINEL_PURPOSE,
      nonceSha256: rehearsalSentinelNonceSha256,
    };
    const liveSnapshot = {
      ...(files['03-postflight.json'] as Record<string, unknown>),
      capturedAt: '2026-07-28T10:04:00+07:00',
      disposableRehearsalTarget: rehearsalSentinel,
      disposableRehearsalTargetAfter: rehearsalSentinel,
    };
    const closeoutOutcome = {
      finishedAt: '2026-07-28T10:04:30+07:00',
      finalCloseoutVerified: true,
      independentVerifier: signoff.independentVerifier,
      independentVerificationCompleted: true,
      securityContractReviewed: true,
      advisorDeltaTriaged: true,
      liveBoundaryRechecked: true,
      finalMigrationEvidenceConsumed: true,
      finalSignoffConsumed: true,
      readOnly: true,
      migrationPerformed: false,
      phase4FlagsRemainFalse: true,
      p13Authorized: false,
      automaticNextStep: false,
      closeoutError: null,
      operatorInstruction:
        'P-12 execution evidence closeout is complete. Stop.',
    };
    const pass2Files: Record<string, unknown> = {
      '00-closeout-context.json': closeoutContext,
      '01-live-closeout-snapshot.json': liveSnapshot,
      '02-closeout-outcome.json': closeoutOutcome,
    };
    for (const [name, value] of Object.entries(pass2Files)) {
      await writeSecureJson(join(pass2Root, name), value);
    }
    const pass2FileHashes = Object.fromEntries(
      await Promise.all(
        Object.keys(pass2Files).map(async (name) => [
          name,
          await sha256File(join(pass2Root, name)),
        ]),
      ),
    );
    const pass2ManifestPath = join(
      pass2Root,
      '05-closeout-evidence-manifest.json',
    );
    const pass2Manifest = {
      schema: FINAL_CLOSEOUT_EVIDENCE_MANIFEST_SCHEMA,
      createdAt: '2026-07-28T10:05:00+07:00',
      mode: 'rehearsal',
      gitHead,
      kitManifestSha256,
      finalMigrationEvidenceManifestSha256:
        signoff.finalMigrationEvidenceManifestSha256,
      finalCloseoutSignoffSha256:
        closeoutContext.finalCloseoutSignoffSha256,
      p13Authorized: false,
      files: pass2FileHashes,
    };
    await writeSecureJson(pass2ManifestPath, pass2Manifest);
    const pass2ManifestSha256 =
      await sha256File(pass2ManifestPath);
    const pass2Approval = approvalRecord({
      schemaShapeContractSha256: schemaShapeContract.sha256,
      pass2VerificationEvidenceManifestPath: pass2ManifestPath,
      pass2VerificationEvidenceManifestSha256:
        pass2ManifestSha256,
      advisorArtifactCapturedAt:
        '2026-07-28T10:05:30+07:00',
      githubReviewCheckedAt:
        '2026-07-28T10:05:45+07:00',
      approvedAt: '2026-07-28T10:06:00+07:00',
    });

    await expect(loadPass2VerificationEvidenceManifest(
      pass2ManifestPath,
      pass2ManifestSha256,
      {
        kit,
        schemaShapeContract,
        approval: pass2Approval,
      },
    )).resolves.toMatchObject({
      path: pass2ManifestPath,
      finalCloseoutSignoff: {
        path: signoffPath,
        finalMigrationEvidence: {
          path: evidenceManifestPath,
        },
      },
    });

    const forgedSignoffSha256 = '0'.repeat(64);
    await unlink(join(pass2Root, '00-closeout-context.json'));
    await writeSecureJson(
      join(pass2Root, '00-closeout-context.json'),
      {
        ...closeoutContext,
        finalCloseoutSignoffSha256: forgedSignoffSha256,
      },
    );
    const forgedManifest = {
      ...pass2Manifest,
      finalCloseoutSignoffSha256: forgedSignoffSha256,
      files: {
        ...pass2FileHashes,
        '00-closeout-context.json':
          await sha256File(
            join(pass2Root, '00-closeout-context.json'),
        ),
      },
    };
    await unlink(pass2ManifestPath);
    await writeSecureJson(pass2ManifestPath, forgedManifest);
    const forgedManifestSha256 =
      await sha256File(pass2ManifestPath);
    await expect(loadPass2VerificationEvidenceManifest(
      pass2ManifestPath,
      forgedManifestSha256,
      {
        kit,
        schemaShapeContract,
        approval: approvalRecord({
          schemaShapeContractSha256:
            schemaShapeContract.sha256,
          pass2VerificationEvidenceManifestPath:
            pass2ManifestPath,
          pass2VerificationEvidenceManifestSha256:
            forgedManifestSha256,
          advisorArtifactCapturedAt:
            '2026-07-28T10:05:30+07:00',
          githubReviewCheckedAt:
            '2026-07-28T10:05:45+07:00',
          approvedAt: '2026-07-28T10:06:00+07:00',
        }),
      },
    )).rejects.toThrow(
      'final closeout signoff path or SHA-256 binding differs',
    );
  });

  it.skipIf(process.platform === 'win32')(
    'interrupts and then kills the complete detached process group',
    async () => {
      const childProgram = [
        "const { spawn } = require('node:child_process');",
        "const child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' });",
        "process.stdout.write(JSON.stringify({ parent: process.pid, child: child.pid }) + '\\n');",
        'setInterval(() => {}, 1000);',
      ].join('');
      const result = await runCapturedProcess(
        process.execPath,
        ['-e', childProgram],
        {
          password: 'test-process-only',
          mode: 'rehearsal',
          timeoutMs: 200,
          interruptGraceMs: 200,
        },
      );
      const pids = JSON.parse(result.stdout.trim()) as {
        parent: number;
        child: number;
      };

      expect(result.timedOut).toBe(true);
      expect(processIsAlive(pids.parent)).toBe(false);
      expect(processIsAlive(pids.child)).toBe(false);
    },
    5_000,
  );

  it('requires an exact external P-12 approval contract and active window', () => {
    const now = new Date('2026-07-28T10:00:00+07:00');
    expect(() => validateApprovalRecord(approvalRecord(), {
      now,
      currentHead: 'a'.repeat(40),
      minimumRemainingMs: INITIAL_WINDOW_BUDGET_MS,
      windowPhase: 'test initial budget',
    })).not.toThrow();
    expect(() => validateApprovalRecord(approvalRecord({
      schema:
        'conduit-boq/master-catalog-p12-production-approval/v3',
      scope: 'P-12-migrations-017-017a-018-through-025-only',
    }), {
      now,
      currentHead: 'a'.repeat(40),
    })).toThrow('not frozen P-12 v4');
    expect(() => validateApprovalRecord(approvalRecord({
      independentVerifier: 'Executor A',
    }), {
      now,
      currentHead: 'a'.repeat(40),
    })).toThrow('must be different');
    expect(() => validateApprovalRecord(approvalRecord({
      freshBackupVerified: false,
    }), {
      now,
      currentHead: 'a'.repeat(40),
    })).toThrow('backup');
    expect(() => validateApprovalRecord(approvalRecord({
      catalogAuthorityFingerprintSha256: 'not-derived',
    }), {
      now,
      currentHead: 'a'.repeat(40),
    })).toThrow('catalog authority fingerprint');
    expect(() => validateApprovalRecord(approvalRecord({
      githubReviewCheckedAt: '2026-07-28T09:01:00+07:00',
    }), {
      now,
      currentHead: 'a'.repeat(40),
    })).toThrow('after Owner approval');
    expect(() => validateApprovalRecord(approvalRecord({
      maintenanceWindow: {
        startsAt: '2026-07-28T11:00:00+07:00',
        endsAt: '2026-07-28T12:00:00+07:00',
      },
    }), {
      now,
      currentHead: 'a'.repeat(40),
    })).toThrow('outside');
    expect(() => validateApprovalRecord(approvalRecord({
      dbPassword: 'must-never-be-accepted',
    }), {
      now,
      currentHead: 'a'.repeat(40),
    })).toThrow('secret-bearing');
    expect(() => validateApprovalRecord(approvalRecord({
      maintenanceWindow: {
        startsAt: '2026-07-28T09:30:00+07:00',
        endsAt: '2026-07-28T10:05:00+07:00',
      },
    }), {
      now,
      currentHead: 'a'.repeat(40),
      minimumRemainingMs: INITIAL_WINDOW_BUDGET_MS,
      windowPhase: 'test initial budget',
    })).toThrow('remaining maintenance-window budget');
  });

  it('blocks missing, extra, renamed, or out-of-order ledger entries', () => {
    const expected = [
      ...FULL_PRE_017_LEDGER_SEQUENCE,
      PHASE4_MIGRATIONS[0],
    ];
    const exactRows = expected.map((migration) => ({
      version: migration.version,
      name: migration.ledgerName,
    }));
    expect(validateLedgerRows(exactRows, expected)).toEqual(exactRows);
    expect(() => validateLedgerRows(exactRows.slice(0, -1), expected)).toThrow(
      'does not match',
    );
    expect(() => validateLedgerRows([
      ...exactRows,
      { version: '20260728999999', name: 'unexpected' },
    ], expected)).toThrow('does not match');
    expect(() => validateLedgerRows([
      { ...exactRows[0], name: `${exactRows[0].name}_renamed` },
      ...exactRows.slice(1),
    ], expected)).toThrow('does not match');
    expect(() => validateLedgerRows([
      exactRows[1],
      exactRows[0],
      ...exactRows.slice(2),
    ], expected)).toThrow('does not match');
  });

  it('redacts literal, encoded, and URL-embedded credentials from diagnostics', () => {
    const password = 'p@ss word';
    const diagnostic =
      `failed ${password} ${encodeURIComponent(password)} `
      + 'postgresql://postgres:visible@example.com/postgres';
    const redacted = redactSensitiveText(diagnostic, [password]);

    expect(redacted).not.toContain(password);
    expect(redacted).not.toContain(encodeURIComponent(password));
    expect(redacted).not.toContain(':visible@');
    expect(redacted).toContain('[REDACTED]');
  });
});
