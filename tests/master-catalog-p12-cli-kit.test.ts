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
  HISTORICAL_MIGRATIONS,
  KIT_SCHEMA,
  LOCAL_SUPABASE_CLI,
  P12_KIT_GENERATOR_SOURCE,
  P12_RUNNER_SOURCE,
  PHASE4_MIGRATIONS,
  REPOSITORY_ROOT,
  REQUIRED_POSTGRES_MAJOR,
  REQUIRED_SUPABASE_CLI_VERSION,
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
  EVIDENCE_MANIFEST_SCHEMA,
  FINAL_CLOSEOUT_EVIDENCE_MANIFEST_SCHEMA,
  FINAL_CLOSEOUT_SIGNOFF_SCHEMA,
  HOTFIX_016_FUNCTION_SIGNATURE,
  HOTFIX_016_PROSRC_LENGTH,
  HOTFIX_016_PROSRC_SHA256,
  INITIAL_WINDOW_BUDGET_MS,
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
  snapshotQueryDefinitions,
  validateApprovalRecord,
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
    schema: SCHEMA_SHAPE_CONTRACT_SCHEMA,
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
              ...HISTORICAL_MIGRATIONS,
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
    ]);
    expect(PHASE4_MIGRATIONS.every(
      (migration) => /^[0-9a-f]{64}$/.test(migration.sha256),
    )).toBe(true);
    expect(P12_AUTHORITY_FILES).toContain(
      'docs/plans/master-catalog/43-phase4-p12-private-function-default-privilege-finding.md',
    );
  });

  it('resolves the exact native Supabase binary instead of the JavaScript shim', async () => {
    expect(resolveNativeSupabaseCliBinary()).toBe(LOCAL_SUPABASE_CLI);
    expect(LOCAL_SUPABASE_CLI).toMatch(
      /node_modules\/@supabase\/cli-[^/]+\/bin\/supabase(?:\.exe)?$/,
    );
    expect(LOCAL_SUPABASE_CLI).not.toMatch(/\.js$/);
    expect((await stat(LOCAL_SUPABASE_CLI)).isFile()).toBe(true);
  });

  it('prepares ten cumulative one-pending-file workdirs with byte-exact copies', async () => {
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
    expect(result.manifest.productionEligible).toBe(true);
    expect(result.manifest.steps).toHaveLength(10);
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
        ...HISTORICAL_MIGRATIONS,
        ...PHASE4_MIGRATIONS.slice(0, phaseIndex + 1),
      ];
      const files = (await readdir(migrationRoot)).sort();

      expect(step.ordinal).toBe(phaseMigration.ordinal);
      expect(step.pendingMigration.sourceFile).toBe(phaseMigration.sourceFile);
      expect(step.expectedRemoteBefore).toHaveLength(
        HISTORICAL_MIGRATIONS.length + phaseIndex,
      );
      expect(step.expectedRemoteAfter).toHaveLength(expected.length);
      expect(files).toEqual(expected.map(ledgerFilename).sort());

      for (const migration of expected) {
        const sourcePath = join(REPOSITORY_ROOT, 'migrations', migration.sourceFile);
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
    expect(expectedFeatureFlags(HISTORICAL_MIGRATIONS)).toEqual([]);
    expect(validateFlags([], HISTORICAL_MIGRATIONS)).toEqual({});

    const through017 = [
      ...HISTORICAL_MIGRATIONS,
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
      ...HISTORICAL_MIGRATIONS,
      ...PHASE4_MIGRATIONS.slice(0, 5),
    ];
    expect(expectedFeatureFlags(through020)).toEqual([
      'catalog_admin_enabled',
      'catalog_new_identity_enabled',
      'catalog_retirement_enabled',
    ]);
  });

  it('proves the exact hotfix 016 function body and guarded execution posture', () => {
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
      'conduit-boq/master-catalog-p12-schema-shape-contract/v2',
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
      expectedSchemaShapeFingerprint(contract, '025'),
    ).toBe(distinctSchemaFingerprints['025']);
    expect(contract.pass1Evidence.manifest.stage).toBe('025');

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
      ...HISTORICAL_MIGRATIONS,
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
      ...HISTORICAL_MIGRATIONS,
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
      ...HISTORICAL_MIGRATIONS,
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
      ...HISTORICAL_MIGRATIONS,
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
        ...HISTORICAL_MIGRATIONS,
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
      ...HISTORICAL_MIGRATIONS,
      ...PHASE4_MIGRATIONS.slice(0, 3),
    ])).toThrow('PUBLIC');
    expect(() => validatePrivateSchemaAcl([{
      ...privateSchemaAcl(true),
      anon_usage: true,
    }], [
      ...HISTORICAL_MIGRATIONS,
      ...PHASE4_MIGRATIONS.slice(0, 3),
    ])).toThrow('anon');
    expect(() => validatePrivateSchemaAcl([{
      ...privateSchemaAcl(true),
      authenticated_create: true,
    }], [
      ...HISTORICAL_MIGRATIONS,
      ...PHASE4_MIGRATIONS.slice(0, 3),
    ])).toThrow('CREATE to authenticated');
    expect(() => validatePrivateSchemaAcl([{
      ...privateSchemaAcl(true),
      service_role_usage: false,
    }], [
      ...HISTORICAL_MIGRATIONS,
      ...PHASE4_MIGRATIONS.slice(0, 3),
    ])).toThrow('service_role');
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
      ledger: HISTORICAL_MIGRATIONS.map((migration) => ({
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
        expectedMigrations: HISTORICAL_MIGRATIONS,
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
      '--step-025-evidence-manifest',
      '/external/025/05-evidence-manifest.json',
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
      step_025_evidence_manifest:
        '/external/025/05-evidence-manifest.json',
    });
    expect(() => parseCloseoutArguments([
      ...common,
      '--step', '025',
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
          ...HISTORICAL_MIGRATIONS,
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

  it('requires an exact 0600 final verifier closeout bound to complete step 025 evidence', async () => {
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
      '025',
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
        (target: { schema: string; name: string }, index: number) => ({
          schema_name: target.schema,
          object_name: target.name,
          oid: String(index + 1),
          owner: REQUIRED_CURRENT_USER,
          signature: `${target.schema}.${target.name}()`,
          public_execute: false,
          anon_execute: false,
          authenticated_execute: false,
          service_role_execute: false,
        }),
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
        step: '025',
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
          ...HISTORICAL_MIGRATIONS,
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
          distinctSchemaFingerprints['025'],
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
      step: '025',
      mode: 'rehearsal',
      gitHead,
      kitManifestSha256,
      files: fileHashes,
    });

    const signoff = {
      schema: FINAL_CLOSEOUT_SIGNOFF_SCHEMA,
      decision: 'P12_EXECUTION_VERIFIED',
      step: '025',
      executionGitHead: gitHead,
      kitManifestSha256,
      step025Executor: 'Executor A',
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
      step025SchemaShapeFingerprintSha256:
        distinctSchemaFingerprints['025'],
      advisorArtifactPath: advisorArtifact.path,
      advisorArtifactSha256: advisorArtifact.sha256,
      advisorArtifactCapturedAt: '2026-07-28T10:02:30+07:00',
      p13Authorized: false,
      automaticNextStep: false,
      reviewedAt: '2026-07-28T10:03:00+07:00',
      step025EvidenceManifestPath: evidenceManifestPath,
      step025EvidenceManifestSha256:
        await sha256File(evidenceManifestPath),
      step025OutcomeSha256:
        fileHashes['02-migration-outcome.json'],
      step025PostflightSha256:
        fileHashes['03-postflight.json'],
    };
    const signoffPath = join(root, '025-final-signoff.json');
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
      step025Evidence: {
        path: evidenceManifestPath,
      },
    });

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
      schema:
        'conduit-boq/master-catalog-p12-final-closeout-evidence/v1',
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
        distinctSchemaFingerprints['025'],
      advisorArtifactPath: advisorArtifact.path,
      advisorArtifactSha256: advisorArtifact.sha256,
      advisorArtifactBytes: (await stat(advisorArtifact.path)).size,
      advisorArtifactCapturedAt:
        signoff.advisorArtifactCapturedAt,
      step025EvidenceManifestPath: evidenceManifestPath,
      step025EvidenceManifestSha256:
        signoff.step025EvidenceManifestSha256,
      finalCloseoutSignoffPath: signoffPath,
      finalCloseoutSignoffSha256: await sha256File(signoffPath),
      step025Executor: signoff.step025Executor,
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
      step025EvidenceConsumed: true,
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
      step025EvidenceManifestSha256:
        signoff.step025EvidenceManifestSha256,
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
        step025Evidence: {
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
      ...HISTORICAL_MIGRATIONS,
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
