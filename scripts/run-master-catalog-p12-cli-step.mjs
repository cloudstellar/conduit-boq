#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process'
import {
  chmod,
  lstat,
  mkdir,
  readFile,
  readdir,
  realpath,
  rename,
  writeFile,
} from 'node:fs/promises'
import {
  basename,
  dirname,
  isAbsolute,
  join,
  parse as parsePath,
  relative,
  resolve,
  sep as pathSeparator,
} from 'node:path'
import { pathToFileURL } from 'node:url'
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
  assertSupabaseCliVersion,
  extractOwnedObjectTargets,
  ledgerFilename,
  sha256Bytes,
  sha256File,
} from './prepare-master-catalog-p12-cli-kit.mjs'

export const APPROVAL_SCHEMA =
  'conduit-boq/master-catalog-p12-production-approval/v2'
export const APPROVAL_SCOPE =
  'P-12-migrations-017-017a-018-through-025-only'
export const PRODUCTION_PROJECT_REF = 'otlssvssvgkohqwuuiir'
export const PRODUCTION_DATABASE_HOST =
  'aws-1-ap-south-1.pooler.supabase.com'
export const PRODUCTION_DATABASE_PORT = '5432'
export const PRODUCTION_DATABASE_USER =
  'postgres.otlssvssvgkohqwuuiir'
export const PRODUCTION_DATABASE_NAME = 'postgres'
export const REQUIRED_CURRENT_USER = 'postgres'
export const PRODUCTION_KEYCHAIN_SERVICE =
  'Conduit BOQ Production DB'
export const PRODUCTION_KEYCHAIN_ACCOUNT = PRODUCTION_PROJECT_REF
export const REHEARSAL_PASSWORD_ENV = 'P12_REHEARSAL_DB_PASSWORD'
export const REHEARSAL_DATABASE_NAME = 'conduit_p12_rehearsal'
export const REHEARSAL_SENTINEL_SCHEMA = 'p12_rehearsal_guard'
export const REHEARSAL_SENTINEL_TABLE = 'disposable_target'
export const REHEARSAL_SENTINEL_PURPOSE =
  'conduit-boq-phase4-p12-disposable-isolated-pg17'
export const PRIOR_STEP_SIGNOFF_SCHEMA =
  'conduit-boq/master-catalog-p12-prior-step-verifier-signoff/v1'
export const EVIDENCE_MANIFEST_SCHEMA =
  'conduit-boq/master-catalog-p12-cli-evidence-manifest/v1'
export const FINAL_CLOSEOUT_SIGNOFF_SCHEMA =
  'conduit-boq/master-catalog-p12-final-verifier-closeout/v1'
export const FINAL_CLOSEOUT_EVIDENCE_MANIFEST_SCHEMA =
  'conduit-boq/master-catalog-p12-final-closeout-evidence-manifest/v1'
export const SCHEMA_SHAPE_CONTRACT_SCHEMA =
  'conduit-boq/master-catalog-p12-schema-shape-contract/v2'
export const SCHEMA_SHAPE_SCOPE =
  'public-private-table-columns-constraints-indexes/v1'
export const SCHEMA_SHAPE_GITHUB_REVIEW_PROVIDER =
  'github-pull-request-review'
export const SCHEMA_SHAPE_GITHUB_REPOSITORY =
  'cloudstellar/conduit-boq'
export const SCHEMA_CALIBRATION_EVIDENCE_MANIFEST_SCHEMA =
  'conduit-boq/master-catalog-p12-schema-calibration-evidence-manifest/v1'
export const SCHEMA_CALIBRATION_MODE =
  'rehearsal-schema-calibration'
export const HOTFIX_016_FUNCTION_SIGNATURE =
  'public.save_boq_with_routes(uuid,jsonb,jsonb)'
export const HOTFIX_016_PROSRC_LENGTH = 7451
export const HOTFIX_016_PROSRC_SHA256 =
  '7187ffb568617783146d4b5f8db8021147cd212a578e655879c49f32f9fb54f0'
export const QUERY_TIMEOUT_MS = 30_000
export const INTERRUPT_GRACE_MS = 5_000
export const SNAPSHOT_QUERY_BUDGET_COUNT = 15
export const WRITE_BOUNDARY_QUERY_BUDGET_COUNT = 1
export const QUERY_OPERATION_BUDGET_MS =
  QUERY_TIMEOUT_MS + INTERRUPT_GRACE_MS
export const PREFLIGHT_BUDGET_MS =
  QUERY_OPERATION_BUDGET_MS * SNAPSHOT_QUERY_BUDGET_COUNT
export const POSTFLIGHT_BUDGET_MS =
  QUERY_OPERATION_BUDGET_MS * SNAPSHOT_QUERY_BUDGET_COUNT
export const CLOCK_SAFETY_MARGIN_MS = 5_000
export const MIGRATION_WRITE_BUDGET_MS =
  CLIENT_TIMEOUT_SECONDS * 1000
  + INTERRUPT_GRACE_MS
  + CLOCK_SAFETY_MARGIN_MS
export const INITIAL_WINDOW_BUDGET_MS =
  PREFLIGHT_BUDGET_MS
  + QUERY_OPERATION_BUDGET_MS * WRITE_BOUNDARY_QUERY_BUDGET_COUNT
  + MIGRATION_WRITE_BUDGET_MS
  + POSTFLIGHT_BUDGET_MS
export const PRE_MIGRATION_WINDOW_BUDGET_MS =
  QUERY_OPERATION_BUDGET_MS * WRITE_BOUNDARY_QUERY_BUDGET_COUNT
  + MIGRATION_WRITE_BUDGET_MS
  + POSTFLIGHT_BUDGET_MS
export const FINAL_CLOSEOUT_WINDOW_BUDGET_MS =
  POSTFLIGHT_BUDGET_MS
  + CLOCK_SAFETY_MARGIN_MS
export const P12_AUTHORITY_FILES = Object.freeze([
  'docs/04_data/MIGRATIONS.md',
  'docs/plans/master-catalog/12-phase4-production-runbook.md',
  'docs/plans/master-catalog/19-phase4-decision-register.md',
  'docs/plans/master-catalog/25-phase4-execution-progress-tracker.md',
  'docs/plans/master-catalog/39-phase4-p12-production-readiness-package.md',
  'docs/plans/master-catalog/40-phase4-p12-owner-decision-checklist.md',
  'docs/plans/master-catalog/41-phase4-p12-cli-execution-runbook.md',
  'docs/plans/master-catalog/43-phase4-p12-private-function-default-privilege-finding.md',
])
export const P12_RUNNER_AUTHORITY_FILE =
  'docs/plans/master-catalog/40-phase4-p12-owner-decision-checklist.md'
export const P12_RUNNER_AUTHORITY_MARKER = 'P12_RUNNER_AUTHORITY_V1'
export const CLI_USAGE = `Usage:
  node scripts/run-master-catalog-p12-cli-step.mjs --mode <rehearsal|production> --kit <absolute-path> --step <017|017a|018-025> --db-url <passwordless-url> --evidence <absolute-new-path> --executor-label <label> --schema-shape-contract <absolute-0600-json> --advisor-artifact <absolute-path> --advisor-artifact-sha256 <sha256> [mode-specific options]
  node scripts/run-master-catalog-p12-cli-step.mjs closeout --mode <rehearsal|production> --kit <absolute-path> --db-url <passwordless-url> --evidence <absolute-new-path> --step-025-evidence-manifest <absolute-path> --final-signoff <absolute-0600-json> --verifier-label <label> --schema-shape-contract <absolute-0600-json> --advisor-artifact <absolute-path> --advisor-artifact-sha256 <sha256> [mode-specific options]
  node scripts/run-master-catalog-p12-cli-step.mjs calibrate-schema --kit <absolute-path> --stage <016|017|017a|018-025> --db-url <isolated-rehearsal-passwordless-url> --evidence <absolute-new-path> --executor-label <label> --rehearsal-sentinel <nonce> [--prior-calibration-manifest <absolute-path>]

Migration mode-specific options:
  rehearsal: --rehearsal-sentinel <nonce>; every step after 017 also requires --prior-step-signoff <absolute-0600-json>
  production: --approval-record <absolute-0600-json>; every step after 017 also requires --prior-step-signoff <absolute-0600-json>

Final closeout mode-specific options:
  rehearsal: --rehearsal-sentinel <nonce>
  production: --approval-record <absolute-0600-json>

Final closeout is read-only, applies no migration, leaves all Phase 4 flags false, and does not authorize P-13.
Schema calibration is isolated-rehearsal-only, applies at most one migration file per invocation, never advances automatically, and can never authorize Production.
`

const MAX_CAPTURE_BYTES = 5 * 1024 * 1024
const MAX_EXTERNAL_ARTIFACT_BYTES = 5 * 1024 * 1024
const FEATURE_FLAGS = Object.freeze([
  'catalog_admin_enabled',
  'catalog_new_identity_enabled',
  'catalog_retirement_enabled',
])
export const SCHEMA_SHAPE_STAGES = Object.freeze([
  '016',
  ...PHASE4_MIGRATIONS.map((migration) => migration.ordinal),
])
export const SCHEMA_SHAPE_CONTRACT_PAYLOAD_KEYS = Object.freeze([
  'schema',
  'scope',
  'applicationCandidate',
  'sourceToolingGitHead',
  'kitManifestPath',
  'kitManifestSha256',
  'generatorSourceSha256',
  'runnerSourceSha256',
  'supabaseCliVersion',
  'postgresMajor',
  'migrationHashes',
  'fingerprints',
  'captureExecutor',
  'pass1EvidenceManifestPath',
  'pass1EvidenceManifestSha256',
])
export const SCHEMA_SHAPE_GITHUB_REVIEW_KEYS = Object.freeze([
  'provider',
  'repository',
  'pullNumber',
  'reviewId',
  'htmlUrl',
  'state',
  'reviewerLogin',
  'reviewerType',
  'commitId',
  'submittedAt',
  'reviewedPayloadSha256',
  'expectedBodyMarker',
])

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function canonicalJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(',')}]`
  }
  if (value !== null && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

export function schemaShapeContractReviewPayload(record) {
  assertPlainObject(record, 'Schema-shape contract review payload source')
  return Object.fromEntries(
    SCHEMA_SHAPE_CONTRACT_PAYLOAD_KEYS.map((key) => [key, record[key]]),
  )
}

export function schemaShapeContractReviewPayloadSha256(record) {
  return sha256Bytes(Buffer.from(
    canonicalJson(schemaShapeContractReviewPayload(record)),
    'utf8',
  ))
}

export function expectedSchemaShapeGithubReviewMarker(
  record,
  reviewedPayloadSha256 =
    schemaShapeContractReviewPayloadSha256(record),
) {
  return [
    'P12_SCHEMA_REVIEW_V1',
    `source=${record.sourceToolingGitHead}`,
    `kit=${record.kitManifestSha256}`,
    `pass1=${record.pass1EvidenceManifestSha256}`,
    `payload=${reviewedPayloadSha256}`,
  ].join(' ')
}

function isPathInside(parent, candidate) {
  const pathFromParent = relative(parent, candidate)
  return (
    pathFromParent === ''
    || (!pathFromParent.startsWith('..') && !isAbsolute(pathFromParent))
  )
}

function assertPlainObject(value, label) {
  assert(
    value !== null && typeof value === 'object' && !Array.isArray(value),
    `${label} must be an object`,
  )
}

function assertExactKeys(actual, expected, label) {
  assertPlainObject(actual, label)
  const actualKeys = Object.keys(actual).sort()
  const expectedKeys = [...expected].sort()
  assert(
    JSON.stringify(actualKeys) === JSON.stringify(expectedKeys),
    `${label} keys do not match the frozen manifest`,
  )
}

function assertTimestampWithZone(value, label) {
  assert(
    typeof value === 'string'
      && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
      && Number.isFinite(Date.parse(value)),
    `${label} must be an ISO-8601 timestamp with an explicit timezone`,
  )
}

export function validateSchemaShapeGithubReview(
  record,
  {
    now = new Date(),
  } = {},
) {
  assertPlainObject(record, 'Schema-shape contract')
  const review = record.githubReview
  assertExactKeys(
    review,
    SCHEMA_SHAPE_GITHUB_REVIEW_KEYS,
    'Schema-shape contract GitHub review',
  )
  assert(
    review.provider === SCHEMA_SHAPE_GITHUB_REVIEW_PROVIDER,
    'Schema-shape contract GitHub review provider differs',
  )
  assert(
    review.repository === SCHEMA_SHAPE_GITHUB_REPOSITORY,
    'Schema-shape contract GitHub review repository differs',
  )
  assert(
    Number.isSafeInteger(review.pullNumber) && review.pullNumber > 0,
    'Schema-shape contract GitHub review pull number must be a positive integer',
  )
  assert(
    typeof review.reviewId === 'string'
      && /^[1-9][0-9]*$/.test(review.reviewId),
    'Schema-shape contract GitHub review ID must be a positive decimal string',
  )
  assert(
    typeof review.htmlUrl === 'string',
    'Schema-shape contract GitHub review URL must be a string',
  )
  const reviewUrlMatch = review.htmlUrl.match(
    /^https:\/\/github\.com\/cloudstellar\/conduit-boq\/pull\/([1-9][0-9]*)#pullrequestreview-([1-9][0-9]*)$/,
  )
  assert(
    reviewUrlMatch !== null,
    'Schema-shape contract GitHub review URL must use the exact repository review grammar',
  )
  assert(
    Number(reviewUrlMatch[1]) === review.pullNumber
      && reviewUrlMatch[2] === review.reviewId,
    'Schema-shape contract GitHub review URL identifiers differ',
  )
  assert(
    review.htmlUrl
      === `https://github.com/${SCHEMA_SHAPE_GITHUB_REPOSITORY}/pull/${review.pullNumber}#pullrequestreview-${review.reviewId}`,
    'Schema-shape contract GitHub review URL is not canonical',
  )
  assert(
    review.state === 'APPROVED',
    'Schema-shape contract GitHub review state must be APPROVED',
  )
  assert(
    review.reviewerType === 'User',
    'Schema-shape contract GitHub reviewer type must be User',
  )
  assert(
    typeof review.reviewerLogin === 'string'
      && /^(?!.*--)[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?$/.test(
        review.reviewerLogin,
      ),
    'Schema-shape contract GitHub reviewer login must be a canonical lowercase user login',
  )
  assert(
    /^[0-9a-f]{40}$/.test(review.commitId ?? '')
      && review.commitId === record.sourceToolingGitHead,
    'Schema-shape contract GitHub review commit differs from the source/tooling Git HEAD',
  )
  assertTimestampWithZone(
    review.submittedAt,
    'Schema-shape contract GitHub review submittedAt',
  )
  assert(
    Date.parse(review.submittedAt) <= now.getTime(),
    'Schema-shape contract GitHub review is in the future',
  )
  const reviewedPayloadSha256 =
    schemaShapeContractReviewPayloadSha256(record)
  assert(
    /^[0-9a-f]{64}$/.test(review.reviewedPayloadSha256 ?? '')
      && review.reviewedPayloadSha256 === reviewedPayloadSha256,
    'Schema-shape contract GitHub reviewed payload SHA-256 differs',
  )
  assert(
    review.expectedBodyMarker
      === expectedSchemaShapeGithubReviewMarker(
        record,
        reviewedPayloadSha256,
      ),
    'Schema-shape contract GitHub review body marker differs',
  )
  return review
}

function assertNoSecretFields(value, path = 'approval record') {
  if (Array.isArray(value)) {
    value.forEach((entry, index) =>
      assertNoSecretFields(entry, `${path}[${index}]`))
    return
  }
  if (value === null || typeof value !== 'object') {
    return
  }
  for (const [key, entry] of Object.entries(value)) {
    assert(
      !/(?:password|passphrase|secret|token|credential)/i.test(key),
      `${path} must not contain secret-bearing fields`,
    )
    assertNoSecretFields(entry, `${path}.${key}`)
  }
}

function exactFrozenMap(key) {
  return Object.fromEntries(
    PHASE4_MIGRATIONS.map((migration) => [
      migration.sourceFile,
      migration[key],
    ]),
  )
}

function assertFrozenMap(actual, expected, label) {
  for (const [key, expectedValue] of Object.entries(expected)) {
    assert(actual[key] === expectedValue, `${label} differs for ${key}`)
  }
}

/**
 * @param {Record<string, any>} record
 * @param {{
 *   now?: Date,
 *   currentHead?: string,
 *   minimumRemainingMs?: number,
 *   windowPhase?: string,
 * }} [options]
 */
export function validateApprovalRecord(
  record,
  {
    now = new Date(),
    currentHead,
    minimumRemainingMs = 0,
    windowPhase = 'approval validation',
  } = {},
) {
  assertPlainObject(record, 'Approval record')
  assertNoSecretFields(record)
  assertExactKeys(
    record,
    [
      'schema',
      'decision',
      'scope',
      'projectRef',
      'applicationCandidate',
      'executionGitHead',
      'approvedBy',
      'ownerApprovalReference',
      'preflightEvidenceReference',
      'executor',
      'independentVerifier',
      'verifierPresentDuringWindow',
      'expectedCurrentUser',
      'catalogAuthorityFingerprintSha256',
      'schemaShapeContractSha256',
      'supabaseCliVersion',
      'postgresMajor',
      'clientTimeoutSeconds',
      'phase4FlagsMustNeverBeTrue',
      'freshBackupVerified',
      'isolatedRestoreVerified',
      'backupChecksumVerified',
      'advisorsTriaged',
      'advisorArtifactPath',
      'advisorArtifactSha256',
      'advisorArtifactCapturedAt',
      'pass2VerificationEvidenceManifestPath',
      'pass2VerificationEvidenceManifestSha256',
      'githubReviewCheckedAt',
      'remoteCiRecorded',
      'rollbackMode',
      'automaticNextStep',
      'authorityFileHashes',
      'migrationHashes',
      'ledgerVersions',
      'approvedAt',
      'maintenanceWindow',
    ],
    'Approval record',
  )
  assert(record.schema === APPROVAL_SCHEMA, 'Approval record schema is not frozen P-12 v2')
  assert(record.decision === 'GO', 'Approval record must contain an explicit GO decision')
  assert(
    record.scope === APPROVAL_SCOPE,
    'Approval record scope is not the exact P-12 017, 017a, 018-025 sequence',
  )
  assert(record.projectRef === PRODUCTION_PROJECT_REF, 'Approval record project ref is not Production')
  assert(
    record.applicationCandidate === APPLICATION_CANDIDATE,
    'Approval record application candidate does not match the frozen candidate',
  )
  assert(
    typeof record.executionGitHead === 'string'
      && /^[0-9a-f]{40}$/.test(record.executionGitHead),
    'Approval record executionGitHead must be a full commit SHA',
  )
  if (currentHead) {
    assert(
      record.executionGitHead === currentHead,
      'Current Git HEAD does not match the approved executionGitHead',
    )
  }
  assert(
    typeof record.approvedBy === 'string' && record.approvedBy.trim(),
    'Approval record must name the Owner approver',
  )
  assert(
    typeof record.ownerApprovalReference === 'string'
      && /\bP-12\b/.test(record.ownerApprovalReference),
    'Approval record must reference the recorded P-12 decision',
  )
  assert(
    typeof record.preflightEvidenceReference === 'string'
      && record.preflightEvidenceReference.trim(),
    'Approval record must reference the reviewed PRE-P-12 evidence',
  )
  assert(
    typeof record.executor === 'string' && record.executor.trim(),
    'Approval record must name the migration executor',
  )
  assert(
    typeof record.independentVerifier === 'string'
      && record.independentVerifier.trim(),
    'Approval record must name the independent verifier',
  )
  assert(
    record.executor.trim().toLocaleLowerCase()
      !== record.independentVerifier.trim().toLocaleLowerCase(),
    'Executor and independent verifier must be different people',
  )
  assert(record.verifierPresentDuringWindow === true, 'Independent verifier presence is not approved')
  assert(record.expectedCurrentUser === REQUIRED_CURRENT_USER, 'Approved current_user must be postgres')
  assert(
    /^[0-9a-f]{64}$/.test(
      record.catalogAuthorityFingerprintSha256 ?? '',
    ),
    'Approved catalog authority fingerprint must be a SHA-256 derived from the authorized Production snapshot',
  )
  assert(
    /^[0-9a-f]{64}$/.test(record.schemaShapeContractSha256 ?? ''),
    'Approved schema-shape contract SHA-256 is invalid',
  )
  assert(record.supabaseCliVersion === REQUIRED_SUPABASE_CLI_VERSION, 'Approved Supabase CLI version is not 2.107.0')
  assert(record.postgresMajor === REQUIRED_POSTGRES_MAJOR, 'Approved PostgreSQL major is not 17')
  assert(record.clientTimeoutSeconds === CLIENT_TIMEOUT_SECONDS, 'Approved client timeout is not 180 seconds')
  assert(
    record.phase4FlagsMustNeverBeTrue === true,
    'Phase 4 never-true flag gate is not approved',
  )
  assert(record.freshBackupVerified === true, 'Fresh in-window backup is not verified')
  assert(record.isolatedRestoreVerified === true, 'Fresh backup isolated restore is not verified')
  assert(record.backupChecksumVerified === true, 'Fresh backup checksum is not verified')
  assert(record.advisorsTriaged === true, 'Production advisor findings are not triaged')
  assert(
    typeof record.advisorArtifactPath === 'string'
      && isAbsolute(record.advisorArtifactPath),
    'Approval advisor artifact path must be absolute',
  )
  assert(
    /^[0-9a-f]{64}$/.test(record.advisorArtifactSha256 ?? ''),
    'Approval advisor artifact SHA-256 is invalid',
  )
  assertTimestampWithZone(
    record.advisorArtifactCapturedAt,
    'Approval advisorArtifactCapturedAt',
  )
  assert(
    typeof record.pass2VerificationEvidenceManifestPath === 'string'
      && isAbsolute(record.pass2VerificationEvidenceManifestPath),
    'Approval pass-2 verification evidence manifest path must be absolute',
  )
  assert(
    /^[0-9a-f]{64}$/.test(
      record.pass2VerificationEvidenceManifestSha256 ?? '',
    ),
    'Approval pass-2 verification evidence manifest SHA-256 is invalid',
  )
  assertTimestampWithZone(
    record.githubReviewCheckedAt,
    'Approval githubReviewCheckedAt',
  )
  assert(record.remoteCiRecorded === true, 'Remote CI status is not recorded')
  assert(record.rollbackMode === 'stop-and-fix-forward', 'Rollback mode must be stop-and-fix-forward')
  assert(record.automaticNextStep === false, 'Automatic next-step execution must be false')

  assertExactKeys(
    record.authorityFileHashes,
    P12_AUTHORITY_FILES,
    'Approval authorityFileHashes',
  )
  for (const authorityPath of P12_AUTHORITY_FILES) {
    assert(
      /^[0-9a-f]{64}$/.test(record.authorityFileHashes[authorityPath]),
      `Approval authority hash is invalid for ${authorityPath}`,
    )
  }
  assertExactKeys(
    record.migrationHashes,
    PHASE4_MIGRATIONS.map((migration) => migration.sourceFile),
    'Approval migrationHashes',
  )
  assertExactKeys(
    record.ledgerVersions,
    PHASE4_MIGRATIONS.map((migration) => migration.sourceFile),
    'Approval ledgerVersions',
  )
  assertFrozenMap(
    record.migrationHashes,
    exactFrozenMap('sha256'),
    'Approval migration hashes',
  )
  assertFrozenMap(
    record.ledgerVersions,
    exactFrozenMap('version'),
    'Approval ledger versions',
  )

  assertTimestampWithZone(record.approvedAt, 'approvedAt')
  assertPlainObject(record.maintenanceWindow, 'maintenanceWindow')
  assertExactKeys(
    record.maintenanceWindow,
    ['startsAt', 'endsAt'],
    'maintenanceWindow',
  )
  assertTimestampWithZone(record.maintenanceWindow.startsAt, 'maintenanceWindow.startsAt')
  assertTimestampWithZone(record.maintenanceWindow.endsAt, 'maintenanceWindow.endsAt')

  const nowMs = now.getTime()
  const approvedAtMs = Date.parse(record.approvedAt)
  const advisorArtifactCapturedAtMs =
    Date.parse(record.advisorArtifactCapturedAt)
  const githubReviewCheckedAtMs =
    Date.parse(record.githubReviewCheckedAt)
  const startsAtMs = Date.parse(record.maintenanceWindow.startsAt)
  const endsAtMs = Date.parse(record.maintenanceWindow.endsAt)
  assert(approvedAtMs <= nowMs, 'P-12 approval timestamp is in the future')
  assert(
    advisorArtifactCapturedAtMs <= approvedAtMs,
    'Approval baseline advisor artifact was captured after Owner approval',
  )
  assert(
    githubReviewCheckedAtMs <= approvedAtMs,
    'Authenticated GitHub review recheck occurred after Owner approval',
  )
  assert(startsAtMs < endsAtMs, 'Maintenance window end must be after its start')
  assert(
    nowMs >= startsAtMs && nowMs <= endsAtMs,
    'Current time is outside the exact approved maintenance window',
  )
  assert(
    endsAtMs - nowMs >= minimumRemainingMs,
    `${windowPhase} does not have the required remaining maintenance-window budget`,
  )

  return record
}

export function assertMaintenanceWindowBudget(
  approval,
  {
    now = new Date(),
    minimumRemainingMs,
    windowPhase,
  },
) {
  assert(
    Number.isInteger(minimumRemainingMs) && minimumRemainingMs >= 0,
    'Maintenance-window budget must be a nonnegative integer',
  )
  return validateApprovalRecord(approval, {
    now,
    minimumRemainingMs,
    windowPhase,
  })
}

function decodeUrlComponent(value, label) {
  try {
    return decodeURIComponent(value)
  } catch {
    throw new Error(`${label} is not valid percent-encoding`)
  }
}

export function validatePasswordlessDbUrl(rawUrl, mode) {
  assert(mode === 'rehearsal' || mode === 'production', 'Mode must be rehearsal or production')
  assert(typeof rawUrl === 'string' && rawUrl.trim() === rawUrl, 'Database URL must be a non-empty exact string')

  let parsed
  try {
    parsed = new URL(rawUrl)
  } catch {
    throw new Error('Database URL is invalid')
  }

  assert(
    parsed.protocol === 'postgresql:' || parsed.protocol === 'postgres:',
    'Database URL must use postgresql:// or postgres://',
  )
  assert(parsed.username, 'Database URL must include a username')
  assert(parsed.password === '', 'Database URL must not contain a password')
  assert(parsed.hash === '', 'Database URL must not contain a fragment')

  const allowedQueryKeys = new Set(['sslmode'])
  for (const key of parsed.searchParams.keys()) {
    assert(
      allowedQueryKeys.has(key.toLowerCase()),
      `Database URL query parameter is not allowed: ${key}`,
    )
  }
  assert(
    [...parsed.searchParams.keys()].length <= 1,
    'Database URL must not repeat connection parameters',
  )

  if (mode === 'rehearsal') {
    assert(
      ['127.0.0.1', '::1', '[::1]'].includes(parsed.hostname),
      'Rehearsal mode requires an explicit loopback IP address',
    )
    assert(parsed.port !== '', 'Rehearsal database URL must use an explicit port')
    assert(
      decodeUrlComponent(parsed.pathname.slice(1), 'Rehearsal database name')
        === REHEARSAL_DATABASE_NAME,
      `Rehearsal database name must be ${REHEARSAL_DATABASE_NAME}; Local Supabase postgres is prohibited`,
    )
    assert(
      parsed.searchParams.get('sslmode') === 'disable',
      'Isolated loopback rehearsal URL must set sslmode=disable',
    )
  } else {
    assert(parsed.hostname === PRODUCTION_DATABASE_HOST, 'Production database host is not the frozen Session-pooler host')
    assert(parsed.port === PRODUCTION_DATABASE_PORT, 'Production database port must be 5432 Session mode')
    assert(
      decodeUrlComponent(parsed.username, 'Database username')
        === PRODUCTION_DATABASE_USER,
      'Production database username is not the frozen project-scoped user',
    )
    assert(
      decodeUrlComponent(parsed.pathname.slice(1), 'Database name')
        === PRODUCTION_DATABASE_NAME,
      'Production database name must be postgres',
    )
    assert(
      parsed.searchParams.get('sslmode') === 'require',
      'Production database URL must set sslmode=require',
    )
  }

  return parsed
}

export function redactSensitiveText(text, secrets = []) {
  let redacted = String(text ?? '')
  for (const secret of secrets) {
    if (!secret) {
      continue
    }
    redacted = redacted.split(secret).join('[REDACTED]')
    redacted = redacted
      .split(encodeURIComponent(secret))
      .join('[REDACTED]')
  }
  redacted = redacted.replace(
    /\b(postgres(?:ql)?:\/\/[^:\s/@]+):[^@\s/]+@/gi,
    '$1:[REDACTED]@',
  )
  return redacted
}

export function validateRehearsalSentinelNonce(nonce) {
  assert(
    typeof nonce === 'string'
      && /^[A-Za-z0-9][A-Za-z0-9._-]{31,127}$/.test(nonce),
    'Rehearsal sentinel nonce must be 32-128 nonsecret URL-safe characters',
  )
  return nonce
}

export function rehearsalSentinelSql(nonce) {
  validateRehearsalSentinelNonce(nonce)
  return `
select
  current_database()::text as database_name,
  count(*)::integer as total_rows,
  count(*) filter (
    where id = true
      and nonce = ${sqlLiteral(nonce)}
      and purpose = ${sqlLiteral(REHEARSAL_SENTINEL_PURPOSE)}
      and disposable = true
  )::integer as exact_rows,
  pg_get_userbyid(c.relowner)::text as table_owner
from ${REHEARSAL_SENTINEL_SCHEMA}.${REHEARSAL_SENTINEL_TABLE} sentinel
cross join pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = ${sqlLiteral(REHEARSAL_SENTINEL_SCHEMA)}
  and c.relname = ${sqlLiteral(REHEARSAL_SENTINEL_TABLE)}
  and c.relkind in ('r', 'p')
group by c.relowner;
`
}

function normalizeLedgerRow(row) {
  return {
    version: String(row.version),
    name: String(row.name),
  }
}

export function validateLedgerRows(rows, expectedMigrations, label = 'Migration ledger') {
  assert(Array.isArray(rows), `${label} query did not return rows`)
  const actual = rows.map(normalizeLedgerRow)
  const expected = expectedMigrations.map((migration) => ({
    version: migration.version,
    name: migration.ledgerName,
  }))
  assert(
    JSON.stringify(actual) === JSON.stringify(expected),
    `${label} does not match the exact expected 009-025 prefix`,
  )
  return actual
}

export function buildSupabaseQueryArgs({ dbUrl, sql, workdir }) {
  return [
    'db',
    'query',
    '--db-url',
    dbUrl,
    '--output',
    'json',
    '--workdir',
    workdir,
    sql,
  ]
}

export function buildSupabaseMigrationArgs({ dbUrl, workdir }) {
  return [
    'migration',
    'up',
    '--db-url',
    dbUrl,
    '--workdir',
    workdir,
    '--yes',
  ]
}

async function resolveExistingExternalPath(requestedPath, label, expectedType) {
  assert(
    typeof requestedPath === 'string' && isAbsolute(requestedPath),
    `${label} path must be absolute`,
  )
  await assertNoSymlinkComponents(requestedPath)
  const repositoryRealPath = await realpath(REPOSITORY_ROOT)
  const requestedStats = await lstat(requestedPath)
  assert(!requestedStats.isSymbolicLink(), `${label} path must not be a symbolic link`)
  if (expectedType === 'file') {
    assert(requestedStats.isFile(), `${label} path must be a regular file`)
  } else {
    assert(requestedStats.isDirectory(), `${label} path must be a directory`)
  }
  const resolvedPath = await realpath(requestedPath)
  assert(
    !isPathInside(repositoryRealPath, resolvedPath),
    `${label} path must be outside the repository`,
  )
  return { resolvedPath, stats: requestedStats }
}

async function assertNoSymlinkComponents(path) {
  assert(isAbsolute(path), 'Symlink-component validation requires an absolute path')
  const root = parsePath(path).root
  const segments = path
    .slice(root.length)
    .split(pathSeparator)
    .filter(Boolean)
  let current = root
  for (const segment of segments) {
    current = join(current, segment)
    const stats = await lstat(current)
    assert(
      !stats.isSymbolicLink(),
      `Path component must not be a symbolic link: ${current}`,
    )
  }
}

async function resolveNewEvidenceDirectory(requestedPath) {
  assert(
    typeof requestedPath === 'string' && isAbsolute(requestedPath),
    'Evidence path must be absolute',
  )
  await assertNoSymlinkComponents(dirname(requestedPath))
  const repositoryRealPath = await realpath(REPOSITORY_ROOT)
  const parentRealPath = await realpath(dirname(requestedPath))
  const resolvedPath = join(parentRealPath, basename(requestedPath))
  assert(
    !isPathInside(repositoryRealPath, resolvedPath),
    'Evidence path must be outside the repository',
  )
  try {
    await lstat(resolvedPath)
    throw new Error('Evidence path must not already exist')
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      throw error
    }
  }
  return resolvedPath
}

function schemaStageBeforeStep(step) {
  const phaseIndex = PHASE4_MIGRATIONS.findIndex(
    (migration) => migration.ordinal === step,
  )
  assert(phaseIndex >= 0, 'Schema stage step is not in the frozen Phase 4 sequence')
  return phaseIndex === 0
    ? '016'
    : PHASE4_MIGRATIONS[phaseIndex - 1].ordinal
}

export function assertReviewedBridgeSequence(stage) {
  const ordinals = PHASE4_MIGRATIONS.map((migration) => migration.ordinal)
  assert(
    JSON.stringify(ordinals)
      === JSON.stringify([
        '017',
        '017a',
        '018',
        '019',
        '020',
        '021',
        '022',
        '023',
        '024',
        '025',
      ]),
    'Frozen Phase 4 sequence must be exactly 017, 017a, 018 through 025',
  )
  assert(
    new Set(ordinals).size === ordinals.length,
    'Frozen Phase 4 sequence contains a duplicate stage',
  )
  for (let index = 1; index < PHASE4_MIGRATIONS.length; index += 1) {
    assert(
      PHASE4_MIGRATIONS[index - 1].version
        < PHASE4_MIGRATIONS[index].version,
      'Frozen Phase 4 ledger versions are not strictly increasing',
    )
  }
  if (stage !== '016') {
    assert(
      ordinals.includes(stage),
      `Unknown reviewed Phase 4 stage: ${stage}`,
    )
  }
  if (stage === '018') {
    assert(
      schemaStageBeforeStep(stage) === '017a',
      'Stage 018 must be immediately preceded by the reviewed 017a bridge',
    )
  }
}

export function expectedSchemaShapeFingerprint(contract, stage) {
  assert(
    SCHEMA_SHAPE_STAGES.includes(stage),
    `Unknown schema-shape stage: ${stage}`,
  )
  const fingerprint = contract.record.fingerprints[stage]
  assert(
    /^[0-9a-f]{64}$/.test(fingerprint ?? ''),
    `Schema-shape contract is missing stage ${stage}`,
  )
  return fingerprint
}

/**
 * @param {string} path
 * @param {{
 *   kit: {
 *     manifestPath: string,
 *     manifest: Record<string, any>,
 *   },
 *   expectedSha256?: string,
 *   now?: Date,
 * }} options
 */
export async function loadSchemaShapeContract(
  path,
  {
    kit,
    expectedSha256,
    now = new Date(),
  },
) {
  const {
    resolvedPath,
    stats,
  } = await resolveExistingExternalPath(
    path,
    'Schema-shape contract',
    'file',
  )
  if (typeof process.getuid === 'function') {
    assert(
      stats.uid === process.getuid(),
      'Schema-shape contract must be owned by the executing OS user',
    )
  }
  assert(
    (stats.mode & 0o777) === 0o600,
    'Schema-shape contract permissions must be exactly 0600',
  )
  assert(stats.size <= 128 * 1024, 'Schema-shape contract is unexpectedly large')
  const raw = await readFile(resolvedPath, 'utf8')
  const sha256 = sha256Bytes(Buffer.from(raw, 'utf8'))
  if (expectedSha256) {
    assert(
      sha256 === expectedSha256,
      'Schema-shape contract SHA-256 differs from the approved binding',
    )
  }
  const record = JSON.parse(raw)
  assertPlainObject(record, 'Schema-shape contract')
  assertNoSecretFields(record, 'Schema-shape contract')
  assertExactKeys(
    record,
    [
      ...SCHEMA_SHAPE_CONTRACT_PAYLOAD_KEYS,
      'githubReview',
    ],
    'Schema-shape contract',
  )
  assert(
    record.schema === SCHEMA_SHAPE_CONTRACT_SCHEMA,
    'Schema-shape contract schema is not frozen v2',
  )
  assert(
    record.scope === SCHEMA_SHAPE_SCOPE,
    'Schema-shape contract scope differs',
  )
  assert(
    record.applicationCandidate === APPLICATION_CANDIDATE,
    'Schema-shape contract application candidate differs',
  )
  assert(
    record.sourceToolingGitHead === kit.manifest.sourceGitHead,
    'Schema-shape contract is bound to a different source/tooling Git HEAD',
  )
  assert(
    record.kitManifestPath === kit.manifestPath,
    'Schema-shape contract is bound to a different canonical kit manifest path',
  )
  assert(
    /^[0-9a-f]{64}$/.test(record.kitManifestSha256 ?? ''),
    'Schema-shape contract kit manifest SHA-256 is invalid',
  )
  assert(
    record.kitManifestSha256 === await sha256File(kit.manifestPath),
    'Schema-shape contract kit manifest SHA-256 differs',
  )
  assert(
    record.generatorSourceSha256
      === kit.manifest.generatorSourceSha256,
    'Schema-shape contract generator source SHA-256 differs from the exact kit',
  )
  assert(
    record.runnerSourceSha256 === kit.manifest.runnerSourceSha256,
    'Schema-shape contract runner source SHA-256 differs from the exact kit',
  )
  assert(
    record.supabaseCliVersion === REQUIRED_SUPABASE_CLI_VERSION,
    'Schema-shape contract Supabase CLI version differs',
  )
  assert(
    record.postgresMajor === REQUIRED_POSTGRES_MAJOR,
    'Schema-shape contract PostgreSQL major differs',
  )
  assertExactKeys(
    record.migrationHashes,
    PHASE4_MIGRATIONS.map((migration) => migration.sourceFile),
    'Schema-shape contract migration hashes',
  )
  assertFrozenMap(
    record.migrationHashes,
    exactFrozenMap('sha256'),
    'Schema-shape contract migration hashes',
  )
  assertExactKeys(
    record.fingerprints,
    SCHEMA_SHAPE_STAGES,
    'Schema-shape contract fingerprints',
  )
  for (const stage of SCHEMA_SHAPE_STAGES) {
    assert(
      /^[0-9a-f]{64}$/.test(record.fingerprints[stage] ?? ''),
      `Schema-shape contract fingerprint is invalid for ${stage}`,
    )
  }
  assert(
    typeof record.captureExecutor === 'string'
      && record.captureExecutor.trim(),
    'Schema-shape contract must name the pass-1 capture executor',
  )
  assert(
    typeof record.pass1EvidenceManifestPath === 'string'
      && isAbsolute(record.pass1EvidenceManifestPath),
    'Schema-shape contract pass-1 evidence manifest path must be absolute',
  )
  assert(
    /^[0-9a-f]{64}$/.test(
      record.pass1EvidenceManifestSha256 ?? '',
    ),
    'Schema-shape contract pass-1 evidence manifest SHA-256 is invalid',
  )
  const githubReview = validateSchemaShapeGithubReview(record, { now })
  assert(
    githubReview.reviewerLogin.toLocaleLowerCase()
      !== record.captureExecutor.trim().toLocaleLowerCase(),
    'Schema-shape contract reviewer must be distinct from the pass-1 capture executor',
  )
  const pass1Evidence = await loadSchemaCalibrationManifest(
    record.pass1EvidenceManifestPath,
    {
      expectedSha256: record.pass1EvidenceManifestSha256,
      kit,
      expectedFinalStage:
        SCHEMA_SHAPE_STAGES[SCHEMA_SHAPE_STAGES.length - 1],
    },
  )
  assert(
    pass1Evidence.manifest.captureExecutor
      === record.captureExecutor,
    'Schema-shape contract capture executor differs from pass-1 evidence',
  )
  assert(
    canonicalJson(pass1Evidence.manifest.fingerprints)
      === canonicalJson(record.fingerprints),
    'Schema-shape contract fingerprints differ from pass-1 evidence',
  )
  assert(
    Date.parse(githubReview.submittedAt)
      > Date.parse(pass1Evidence.manifest.createdAt),
    'Schema-shape contract review must occur after pass-1 evidence completion',
  )
  return {
    path: resolvedPath,
    sha256,
    record,
    pass1Evidence,
  }
}

/**
 * @param {string} path
 * @param {string} expectedSha256
 * @param {string} [label]
 */
export async function loadBoundAdvisorArtifact(
  path,
  expectedSha256,
  label = 'Advisor artifact',
) {
  assert(
    /^[0-9a-f]{64}$/.test(expectedSha256 ?? ''),
    `${label} SHA-256 is invalid`,
  )
  const {
    resolvedPath,
    stats,
  } = await resolveExistingExternalPath(path, label, 'file')
  if (typeof process.getuid === 'function') {
    assert(
      stats.uid === process.getuid(),
      `${label} must be owned by the executing OS user`,
    )
  }
  assert(
    (stats.mode & 0o077) === 0,
    `${label} must deny group and other access`,
  )
  assert(
    stats.size > 0 && stats.size <= MAX_EXTERNAL_ARTIFACT_BYTES,
    `${label} size is outside the bounded evidence limit`,
  )
  const actualSha256 = await sha256File(resolvedPath)
  assert(
    actualSha256 === expectedSha256,
    `${label} SHA-256 differs from the bound value`,
  )
  return {
    path: resolvedPath,
    sha256: actualSha256,
    bytes: stats.size,
  }
}

export async function loadPass2VerificationEvidenceManifest(
  path,
  expectedSha256,
  {
    kit,
    schemaShapeContract,
    approval,
  },
) {
  const pass2Kit = await verifyKit(
    kit.kitRoot,
    '025',
    'rehearsal',
  )
  const pass2KitManifestSha256 =
    await sha256File(pass2Kit.manifestPath)
  assert(
    pass2KitManifestSha256
      === schemaShapeContract.record.kitManifestSha256,
    'Pass-2 verification kit differs from the schema-shape contract',
  )
  const {
    resolvedPath,
    stats,
  } = await resolveExistingExternalPath(
    path,
    'Pass-2 verifying rehearsal evidence manifest',
    'file',
  )
  if (typeof process.getuid === 'function') {
    assert(
      stats.uid === process.getuid(),
      'Pass-2 evidence manifest must be owned by the executing OS user',
    )
  }
  assert(
    (stats.mode & 0o077) === 0,
    'Pass-2 evidence manifest must deny group and other access',
  )
  assert(
    stats.size > 0 && stats.size <= 64 * 1024,
    'Pass-2 evidence manifest size is outside the bounded limit',
  )
  const raw = await readFile(resolvedPath, 'utf8')
  const sha256 = sha256Bytes(Buffer.from(raw, 'utf8'))
  assert(
    sha256 === expectedSha256,
    'Pass-2 evidence manifest SHA-256 differs from the approval binding',
  )
  const manifest = JSON.parse(raw)
  assertPlainObject(manifest, 'Pass-2 evidence manifest')
  assertNoSecretFields(manifest, 'Pass-2 evidence manifest')
  assertExactKeys(
    manifest,
    [
      'schema',
      'createdAt',
      'mode',
      'gitHead',
      'kitManifestSha256',
      'step025EvidenceManifestSha256',
      'finalCloseoutSignoffSha256',
      'p13Authorized',
      'files',
    ],
    'Pass-2 evidence manifest',
  )
  assert(
    manifest.schema === FINAL_CLOSEOUT_EVIDENCE_MANIFEST_SCHEMA,
    'Pass-2 evidence manifest is not a final closeout manifest',
  )
  assert(
    manifest.mode === 'rehearsal',
    'Pass-2 verification must be a rehearsal, never Production',
  )
  assert(
    manifest.gitHead
      === schemaShapeContract.record.sourceToolingGitHead,
    'Pass-2 evidence Git HEAD differs from the contract source/tooling HEAD',
  )
  assert(
    manifest.kitManifestSha256
      === schemaShapeContract.record.kitManifestSha256
      && manifest.kitManifestSha256
        === pass2KitManifestSha256,
    'Pass-2 evidence is bound to a different exact kit',
  )
  assert(
    manifest.p13Authorized === false,
    'Pass-2 evidence must not authorize P-13',
  )
  assertTimestampWithZone(
    manifest.createdAt,
    'Pass-2 evidence manifest createdAt',
  )

  assertPlainObject(manifest.files, 'Pass-2 evidence files')
  assertExactKeys(
    manifest.files,
    [
      '00-closeout-context.json',
      '01-live-closeout-snapshot.json',
      '02-closeout-outcome.json',
    ],
    'Pass-2 evidence files',
  )
  const evidenceRoot = dirname(resolvedPath)
  const evidencePaths = {}
  for (const [name, expectedFileSha256] of Object.entries(
    manifest.files,
  )) {
    assert(
      /^[0-9a-f]{64}$/.test(expectedFileSha256),
      `Pass-2 evidence file SHA-256 is invalid for ${name}`,
    )
    const evidencePath = join(evidenceRoot, name)
    await assertNoSymlinkComponents(evidencePath)
    const evidenceStats = await lstat(evidencePath)
    assert(
      evidenceStats.isFile() && !evidenceStats.isSymbolicLink(),
      `Pass-2 evidence entry is not a regular file: ${name}`,
    )
    assert(
      (evidenceStats.mode & 0o077) === 0,
      `Pass-2 evidence file must deny group and other access: ${name}`,
    )
    assert(
      await sha256File(evidencePath) === expectedFileSha256,
      `Pass-2 evidence file hash differs for ${name}`,
    )
    evidencePaths[name] = evidencePath
  }
  const context = JSON.parse(
    await readFile(evidencePaths['00-closeout-context.json'], 'utf8'),
  )
  const liveSnapshot = JSON.parse(
    await readFile(
      evidencePaths['01-live-closeout-snapshot.json'],
      'utf8',
    ),
  )
  const outcome = JSON.parse(
    await readFile(evidencePaths['02-closeout-outcome.json'], 'utf8'),
  )
  for (const [value, label] of [
    [context, 'Pass-2 closeout context'],
    [liveSnapshot, 'Pass-2 live closeout snapshot'],
    [outcome, 'Pass-2 closeout outcome'],
  ]) {
    assertPlainObject(value, label)
    assertNoSecretFields(value, label)
  }
  assertExactKeys(
    context,
    [
      'schema',
      'mode',
      'gitHead',
      'applicationCandidate',
      'kitManifestSha256',
      'schemaShapeContractPath',
      'schemaShapeContractSha256',
      'sourceToolingGitHead',
      'pass1EvidenceManifestPath',
      'pass1EvidenceManifestSha256',
      'expectedSchemaShapeSha256',
      'advisorArtifactPath',
      'advisorArtifactSha256',
      'advisorArtifactBytes',
      'advisorArtifactCapturedAt',
      'step025EvidenceManifestPath',
      'step025EvidenceManifestSha256',
      'finalCloseoutSignoffPath',
      'finalCloseoutSignoffSha256',
      'step025Executor',
      'independentVerifier',
      'rehearsalSentinelNonceSha256',
      'supabaseCliVersion',
      'postgresMajor',
      'readOnly',
      'migrationPerformed',
      'p13Authorized',
      'automaticNextStep',
    ],
    'Pass-2 closeout context',
  )
  assertExactKeys(
    outcome,
    [
      'finishedAt',
      'finalCloseoutVerified',
      'independentVerifier',
      'independentVerificationCompleted',
      'securityContractReviewed',
      'advisorDeltaTriaged',
      'liveBoundaryRechecked',
      'step025EvidenceConsumed',
      'finalSignoffConsumed',
      'readOnly',
      'migrationPerformed',
      'phase4FlagsRemainFalse',
      'p13Authorized',
      'automaticNextStep',
      'closeoutError',
      'operatorInstruction',
    ],
    'Pass-2 closeout outcome',
  )
  assert(
    context.schema
      === 'conduit-boq/master-catalog-p12-final-closeout-evidence/v1'
      && context.mode === 'rehearsal'
      && context.gitHead
        === schemaShapeContract.record.sourceToolingGitHead
      && context.sourceToolingGitHead
        === schemaShapeContract.record.sourceToolingGitHead
      && context.applicationCandidate === APPLICATION_CANDIDATE
      && context.kitManifestSha256
        === schemaShapeContract.record.kitManifestSha256
      && context.supabaseCliVersion
        === REQUIRED_SUPABASE_CLI_VERSION
      && context.postgresMajor === REQUIRED_POSTGRES_MAJOR
      && context.readOnly === true
      && context.migrationPerformed === false
      && context.p13Authorized === false
      && context.automaticNextStep === false,
    'Pass-2 closeout context differs from the contract source and kit',
  )
  assert(
    context.schemaShapeContractPath === schemaShapeContract.path
      &&
    context.schemaShapeContractSha256
      === schemaShapeContract.sha256,
    'Pass-2 closeout context is bound to a different schema-shape contract',
  )
  assert(
    context.pass1EvidenceManifestPath
      === schemaShapeContract.record.pass1EvidenceManifestPath
      && context.pass1EvidenceManifestSha256
        === schemaShapeContract.record.pass1EvidenceManifestSha256,
    'Pass-2 closeout context is bound to different pass-1 evidence',
  )
  assert(
    context.expectedSchemaShapeSha256
      === expectedSchemaShapeFingerprint(
        schemaShapeContract,
        '025',
      ),
    'Pass-2 closeout context has a different reviewed 025 schema shape',
  )
  assert(
    context.independentVerifier
      === schemaShapeContract.record.githubReview.reviewerLogin,
    'Pass-2 verifier differs from the schema-shape contract reviewer',
  )
  assert(
    /^[0-9a-f]{64}$/.test(
      context.rehearsalSentinelNonceSha256 ?? '',
    ),
    'Pass-2 closeout context rehearsal sentinel binding is invalid',
  )
  const pass2AdvisorArtifact = await loadBoundAdvisorArtifact(
    context.advisorArtifactPath,
    context.advisorArtifactSha256,
    'Pass-2 final advisor artifact',
  )
  assert(
    context.advisorArtifactBytes === pass2AdvisorArtifact.bytes,
    'Pass-2 closeout context advisor artifact byte count differs',
  )
  const finalCloseoutSignoff = await loadFinalCloseoutSignoff(
    context.finalCloseoutSignoffPath,
    {
      mode: 'rehearsal',
      currentHead:
        schemaShapeContract.record.sourceToolingGitHead,
      kitManifestSha256: pass2KitManifestSha256,
      objectTargets: pass2Kit.step.objectTargetsAfter,
      schemaShapeContract,
      advisorArtifact: pass2AdvisorArtifact,
      now: new Date(manifest.createdAt),
    },
  )
  assert(
    context.finalCloseoutSignoffPath
      === finalCloseoutSignoff.path
      && context.finalCloseoutSignoffSha256
        === finalCloseoutSignoff.sha256
      && manifest.finalCloseoutSignoffSha256
        === finalCloseoutSignoff.sha256,
    'Pass-2 final closeout signoff path or SHA-256 binding differs',
  )
  assert(
    context.step025EvidenceManifestPath
      === finalCloseoutSignoff.step025Evidence.path
      && context.step025EvidenceManifestSha256
        === finalCloseoutSignoff.step025Evidence.sha256
      && manifest.step025EvidenceManifestSha256
        === finalCloseoutSignoff.step025Evidence.sha256,
    'Pass-2 step 025 evidence path or SHA-256 binding differs',
  )
  assert(
    context.step025Executor
      === finalCloseoutSignoff.signoff.step025Executor
      && context.independentVerifier
        === finalCloseoutSignoff.signoff.independentVerifier
      && context.advisorArtifactCapturedAt
        === finalCloseoutSignoff.signoff.advisorArtifactCapturedAt,
    'Pass-2 context differs from the final closeout signoff',
  )
  assertTimestampWithZone(
    liveSnapshot.capturedAt,
    'Pass-2 live closeout snapshot capturedAt',
  )
  validateIdentity([liveSnapshot.identity], 'rehearsal')
  assertFinalCloseoutSnapshotMatches(
    finalCloseoutSignoff.step025Evidence.postflight,
    liveSnapshot,
  )
  for (const sentinel of [
    liveSnapshot.disposableRehearsalTarget,
    liveSnapshot.disposableRehearsalTargetAfter,
  ]) {
    assertPlainObject(
      sentinel,
      'Pass-2 disposable rehearsal sentinel',
    )
    assert(
      sentinel.databaseName === REHEARSAL_DATABASE_NAME
        && sentinel.tableOwner === REQUIRED_CURRENT_USER
        && sentinel.purpose === REHEARSAL_SENTINEL_PURPOSE
        && sentinel.nonceSha256
          === context.rehearsalSentinelNonceSha256,
      'Pass-2 disposable rehearsal sentinel binding differs',
    )
  }
  assert(
    outcome.finalCloseoutVerified === true
      && outcome.independentVerifier
        === finalCloseoutSignoff.signoff.independentVerifier
      && outcome.independentVerificationCompleted === true
      && outcome.securityContractReviewed === true
      && outcome.advisorDeltaTriaged === true
      && outcome.liveBoundaryRechecked === true
      && outcome.step025EvidenceConsumed === true
      && outcome.finalSignoffConsumed === true
      && outcome.readOnly === true
      && outcome.migrationPerformed === false
      && outcome.phase4FlagsRemainFalse === true
      && outcome.p13Authorized === false
      && outcome.automaticNextStep === false
      && outcome.closeoutError === null,
    'Pass-2 closeout outcome is not a complete non-authorizing verification',
  )
  assertTimestampWithZone(
    outcome.finishedAt,
    'Pass-2 closeout outcome finishedAt',
  )
  assert(
    Date.parse(finalCloseoutSignoff.signoff.reviewedAt)
      <= Date.parse(liveSnapshot.capturedAt)
      && Date.parse(liveSnapshot.capturedAt)
        <= Date.parse(outcome.finishedAt)
      && Date.parse(outcome.finishedAt)
        <= Date.parse(manifest.createdAt),
    'Pass-2 closeout evidence chronology is invalid',
  )
  assert(
    resolvedPath
      === approval.pass2VerificationEvidenceManifestPath,
    'Pass-2 evidence canonical path differs from the approval binding',
  )
  assert(
    sha256
      === approval.pass2VerificationEvidenceManifestSha256,
    'Pass-2 evidence SHA-256 differs from the approval binding',
  )
  assert(
    Date.parse(manifest.createdAt)
      > Date.parse(
        schemaShapeContract.record.githubReview.submittedAt,
      ),
    'Pass-2 verifying rehearsal must complete after contract review',
  )
  assert(
    Date.parse(manifest.createdAt) <= Date.parse(approval.approvedAt),
    'Pass-2 verifying rehearsal must complete before Owner P-12 approval',
  )
  assert(
    Date.parse(manifest.createdAt)
      <= Date.parse(approval.githubReviewCheckedAt),
    'Authenticated GitHub review recheck must occur after pass-2 verification',
  )
  assert(
    Date.parse(approval.advisorArtifactCapturedAt)
      >= Date.parse(manifest.createdAt),
    'Approval baseline advisor artifact must be captured after pass-2 verification',
  )
  return {
    path: resolvedPath,
    sha256,
    manifest,
    context,
    liveSnapshot,
    outcome,
    advisorArtifact: pass2AdvisorArtifact,
    finalCloseoutSignoff,
    kit: pass2Kit,
  }
}

function assertReviewedExecutionBindings({
  schemaShapeContract,
  approval,
  executorLabel,
}) {
  if (approval) {
    assert(
      schemaShapeContract.sha256
        === approval.schemaShapeContractSha256,
      'Schema-shape contract differs from the approved binding',
    )
    assert(
      schemaShapeContract.record.githubReview.reviewerLogin
        === approval.independentVerifier,
      'Schema-shape contract reviewer differs from the approved independent verifier',
    )
    assert(
      Date.parse(approval.githubReviewCheckedAt)
        >= Date.parse(
          schemaShapeContract.record.githubReview.submittedAt,
        ),
      'Authenticated GitHub review recheck predates the contract review',
    )
  }
  if (executorLabel) {
    assert(
      schemaShapeContract.record.githubReview.reviewerLogin
        .toLocaleLowerCase()
        !== executorLabel.trim().toLocaleLowerCase(),
      'Schema-shape contract must be independently reviewed by someone other than the migration executor',
    )
  }
}

function assertApprovalBaselineAdvisor(approval, advisorArtifact) {
  assert(
    advisorArtifact.path === approval.advisorArtifactPath,
    'Step 017 advisor artifact canonical path differs from the approved baseline',
  )
  assert(
    advisorArtifact.sha256 === approval.advisorArtifactSha256,
    'Step 017 advisor artifact SHA-256 differs from the approved baseline',
  )
}

function migrationRecordMatches(actual, expected) {
  return (
    actual?.ordinal === expected.ordinal
    && actual?.sourceFile === expected.sourceFile
    && actual?.version === expected.version
    && actual?.ledgerName === expected.ledgerName
    && actual?.ledgerFilename === ledgerFilename(expected)
    && (
      expected.sha256
        ? actual?.sha256 === expected.sha256
        : /^[0-9a-f]{64}$/.test(actual?.sha256 ?? '')
    )
  )
}

function assertMigrationArray(actual, expected, label) {
  assert(Array.isArray(actual) && actual.length === expected.length, `${label} length is not frozen`)
  actual.forEach((migration, index) => {
    assert(
      migrationRecordMatches(migration, expected[index]),
      `${label} entry ${expected[index].ordinal} is not frozen`,
    )
  })
}

function mergeTargets(targetSets) {
  const output = { relations: new Map(), routines: new Map() }
  for (const targets of targetSets) {
    for (const type of ['relations', 'routines']) {
      for (const target of targets[type]) {
        output[type].set(`${target.schema}.${target.name}`, target)
      }
    }
  }
  return {
    relations: [...output.relations.values()].sort((left, right) =>
      `${left.schema}.${left.name}`.localeCompare(`${right.schema}.${right.name}`)),
    routines: [...output.routines.values()].sort((left, right) =>
      `${left.schema}.${left.name}`.localeCompare(`${right.schema}.${right.name}`)),
  }
}

export async function verifyKit(kitPath, ordinal, mode) {
  const {
    resolvedPath: kitRoot,
    stats: kitStats,
  } = await resolveExistingExternalPath(
    kitPath,
    'Kit',
    'directory',
  )
  if (mode === 'production') {
    if (typeof process.getuid === 'function') {
      assert(kitStats.uid === process.getuid(), 'Kit must be owned by the executing OS user')
    }
    assert((kitStats.mode & 0o077) === 0, 'Kit directory must deny group and other access')
  }
  const manifestPath = join(kitRoot, 'manifest.json')
  await assertNoSymlinkComponents(manifestPath)
  const manifestStats = await lstat(manifestPath)
  assert(manifestStats.isFile() && !manifestStats.isSymbolicLink(), 'Kit manifest must be a regular file')
  if (mode === 'production') {
    assert((manifestStats.mode & 0o077) === 0, 'Kit manifest must deny group and other access')
  }
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))

  assert(manifest.schema === KIT_SCHEMA, 'Kit manifest schema is not frozen v1')
  assert(
    typeof manifest.sourceGitHead === 'string'
      && /^[0-9a-f]{40}$/.test(manifest.sourceGitHead),
    'Kit sourceGitHead must be a full commit SHA',
  )
  for (const [field, label, sourcePath] of [
    [
      'generatorSourceSha256',
      'generator source',
      P12_KIT_GENERATOR_SOURCE,
    ],
    ['runnerSourceSha256', 'runner source', P12_RUNNER_SOURCE],
  ]) {
    assert(
      /^[0-9a-f]{64}$/.test(manifest[field] ?? ''),
      `Kit ${label} SHA-256 is invalid`,
    )
    assert(
      manifest[field]
        === await sha256File(join(REPOSITORY_ROOT, sourcePath)),
      `Kit ${label} differs from the current tooling source`,
    )
  }
  assert(manifest.applicationCandidate === APPLICATION_CANDIDATE, 'Kit application candidate is not frozen')
  assert(manifest.supabaseCliVersion === REQUIRED_SUPABASE_CLI_VERSION, 'Kit Supabase CLI version is not frozen')
  assert(manifest.postgresMajor === REQUIRED_POSTGRES_MAJOR, 'Kit PostgreSQL major is not frozen')
  assert(manifest.clientTimeoutSeconds === CLIENT_TIMEOUT_SECONDS, 'Kit client timeout is not frozen')
  assert(manifest.automaticNextStep === false, 'Kit must prohibit automatic next-step execution')
  if (mode === 'production') {
    assert(manifest.productionEligible === true, 'Kit was prepared from a tracked-dirty worktree')
    assert(manifest.trackedWorktreeClean === true, 'Kit does not record a clean tracked worktree')
  }

  assertMigrationArray(
    manifest.historicalMigrations,
    HISTORICAL_MIGRATIONS,
    'Historical migration manifest',
  )
  assertMigrationArray(
    manifest.phase4Migrations,
    PHASE4_MIGRATIONS,
    'Phase 4 migration manifest',
  )

  const phaseIndex = PHASE4_MIGRATIONS.findIndex(
    (migration) => migration.ordinal === ordinal,
  )
  assert(phaseIndex >= 0, 'Step is not in the frozen Phase 4 migration sequence')
  const step = manifest.steps?.find((candidate) => candidate.ordinal === ordinal)
  assert(step, `Kit does not contain step ${ordinal}`)
  const expectedAfter = [
    ...HISTORICAL_MIGRATIONS,
    ...PHASE4_MIGRATIONS.slice(0, phaseIndex + 1),
  ]
  const manifestBefore = [
    ...manifest.historicalMigrations,
    ...manifest.phase4Migrations.slice(0, phaseIndex),
  ]
  const manifestAfter = [
    ...manifest.historicalMigrations,
    ...manifest.phase4Migrations.slice(0, phaseIndex + 1),
  ]
  assertMigrationArray(step.expectedRemoteBefore, manifestBefore, `Step ${ordinal} before-ledger`)
  assertMigrationArray(step.expectedRemoteAfter, manifestAfter, `Step ${ordinal} after-ledger`)
  assert(
    migrationRecordMatches(step.pendingMigration, PHASE4_MIGRATIONS[phaseIndex]),
    `Step ${ordinal} pending migration is not exact`,
  )

  const stepRoot = resolve(kitRoot, step.workdir)
  assert(isPathInside(kitRoot, stepRoot), 'Step workdir escapes the kit')
  await assertNoSymlinkComponents(stepRoot)
  const supabaseRoot = join(stepRoot, 'supabase')
  const configPath = join(supabaseRoot, 'config.toml')
  const migrationRoot = join(stepRoot, 'supabase', 'migrations')
  await assertNoSymlinkComponents(configPath)
  await assertNoSymlinkComponents(migrationRoot)
  const configStats = await lstat(configPath)
  assert(
    configStats.isFile() && !configStats.isSymbolicLink(),
    'Step config.toml must be a regular file',
  )
  assert(
    await readFile(configPath, 'utf8')
      === `project_id = "conduit-boq-master-catalog-p12-${ordinal}"\n`,
    'Step config.toml does not match the frozen minimal project configuration',
  )
  if (mode === 'production') {
    assert(
      (configStats.mode & 0o077) === 0,
      'Step config.toml must deny group and other access',
    )
  }
  const actualFiles = (await readdir(migrationRoot)).sort()
  const expectedFiles = expectedAfter.map(ledgerFilename).sort()
  assert(
    JSON.stringify(actualFiles) === JSON.stringify(expectedFiles),
    `Step ${ordinal} workdir does not contain the exact cumulative migration set`,
  )

  const sourceTargets = []
  for (const migration of expectedAfter) {
    const migrationPath = join(migrationRoot, ledgerFilename(migration))
    await assertNoSymlinkComponents(migrationPath)
    const migrationStats = await lstat(migrationPath)
    assert(
      migrationStats.isFile() && !migrationStats.isSymbolicLink(),
      `${migration.sourceFile} kit copy must be a regular file`,
    )
    if (mode === 'production') {
      assert(
        (migrationStats.mode & 0o077) === 0,
        `${migration.sourceFile} kit copy must deny group and other access`,
      )
    }
    const actualSha = await sha256File(migrationPath)
    const repositorySha = await sha256File(
      join(REPOSITORY_ROOT, 'migrations', migration.sourceFile),
    )
    const manifestMigration = [
      ...manifest.historicalMigrations,
      ...manifest.phase4Migrations,
    ].find((candidate) => candidate.ordinal === migration.ordinal)
    assert(actualSha === manifestMigration.sha256, `${migration.sourceFile} kit copy hash drifted`)
    assert(
      actualSha === repositorySha,
      `${migration.sourceFile} kit copy differs from the approved Git worktree`,
    )

    if (migration.sha256) {
      assert(actualSha === migration.sha256, `${migration.sourceFile} no longer matches the accepted hash`)
      sourceTargets.push(
        extractOwnedObjectTargets(await readFile(migrationPath, 'utf8')),
      )
    }
  }

  const targetsAfter = mergeTargets(sourceTargets)
  const targetsBefore = mergeTargets(sourceTargets.slice(0, -1))
  assert(
    JSON.stringify(step.objectTargetsBefore) === JSON.stringify(targetsBefore),
    `Step ${ordinal} before-object inventory is not derived from the exact SQL`,
  )
  assert(
    JSON.stringify(step.objectTargetsAfter) === JSON.stringify(targetsAfter),
    `Step ${ordinal} after-object inventory is not derived from the exact SQL`,
  )

  return {
    kitRoot,
    manifestPath,
    manifest,
    step,
    stepRoot,
  }
}

function runGit(args) {
  const result = spawnSync('git', args, {
    cwd: REPOSITORY_ROOT,
    encoding: 'utf8',
    shell: false,
  })
  assert(result.status === 0, `git ${args[0]} guard failed`)
  return result.stdout.trim()
}

function readCommittedGitFile(head, path) {
  const result = spawnSync('git', ['show', `${head}:${path}`], {
    cwd: REPOSITORY_ROOT,
    encoding: null,
    maxBuffer: 5 * 1024 * 1024,
    shell: false,
  })
  assert(result.status === 0, `Unable to read committed authority file ${path}`)
  return result.stdout
}

function parseCommittedAuthorityMarker(bytes) {
  const source = bytes.toString('utf8')
  const escapedMarker = P12_RUNNER_AUTHORITY_MARKER.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&',
  )
  const matches = [
    ...source.matchAll(
      new RegExp(
        `<!--\\s*${escapedMarker}\\s+(\\{[^\\n]+\\})\\s*-->`,
        'g',
      ),
    ),
  ]
  assert(
    matches.length === 1,
    `Committed Checklist #40 must contain exactly one ${P12_RUNNER_AUTHORITY_MARKER} marker`,
  )
  let marker
  try {
    marker = JSON.parse(matches[0][1])
  } catch {
    throw new Error(`Committed ${P12_RUNNER_AUTHORITY_MARKER} marker is not valid JSON`)
  }
  return marker
}

function verifyCommittedAuthorityBindings(approval, currentHead) {
  const committedFiles = new Map()
  for (const path of P12_AUTHORITY_FILES) {
    const committedBytes = readCommittedGitFile(currentHead, path)
    committedFiles.set(path, committedBytes)
    assert(
      sha256Bytes(committedBytes) === approval.authorityFileHashes[path],
      `Approval is not bound to committed authority file ${path}`,
    )
  }

  const marker = parseCommittedAuthorityMarker(
    committedFiles.get(P12_RUNNER_AUTHORITY_FILE),
  )
  const expectedMarker = {
    decision: 'GO',
    applicationCandidate: approval.applicationCandidate,
    ownerApprovalReference: approval.ownerApprovalReference,
    approvedAt: approval.approvedAt,
    executor: approval.executor,
    independentVerifier: approval.independentVerifier,
    schemaShapeContractSha256:
      approval.schemaShapeContractSha256,
    pass2VerificationEvidenceManifestSha256:
      approval.pass2VerificationEvidenceManifestSha256,
    maintenanceWindow: approval.maintenanceWindow,
  }
  assertExactKeys(
    marker,
    Object.keys(expectedMarker),
    `Committed ${P12_RUNNER_AUTHORITY_MARKER}`,
  )
  for (const [key, expectedValue] of Object.entries(expectedMarker)) {
    assert(
      canonicalJson(marker[key]) === canonicalJson(expectedValue),
      `Committed ${P12_RUNNER_AUTHORITY_MARKER} differs for ${key}`,
    )
  }
}

export function validateProductionHeadDelta(changedPaths) {
  assert(
    Array.isArray(changedPaths)
      && changedPaths.length === 1
      && changedPaths[0] === P12_RUNNER_AUTHORITY_FILE,
    `Production execution HEAD may differ from the source/tooling HEAD only by ${P12_RUNNER_AUTHORITY_FILE}`,
  )
  return changedPaths
}

function assertCommittedSourceBindings(
  sourceToolingHead,
  currentHead,
  schemaShapeContract,
) {
  const ancestor = spawnSync(
    'git',
    ['merge-base', '--is-ancestor', sourceToolingHead, currentHead],
    {
      cwd: REPOSITORY_ROOT,
      encoding: 'utf8',
      shell: false,
    },
  )
  assert(
    ancestor.status === 0,
    'Production execution HEAD must descend from the contract source/tooling HEAD',
  )
  const changedPaths = runGit([
    'diff',
    '--name-only',
    '--diff-filter=ACDMRTUXB',
    sourceToolingHead,
    currentHead,
  ]).split('\n').filter(Boolean)
  validateProductionHeadDelta(changedPaths)

  const sourceChecklist = readCommittedGitFile(
    sourceToolingHead,
    P12_RUNNER_AUTHORITY_FILE,
  ).toString('utf8')
  assert(
    !sourceChecklist.includes(P12_RUNNER_AUTHORITY_MARKER),
    'Source/tooling HEAD must predate the committed P-12 GO marker',
  )

  for (const [path, expectedSha256] of [
    [
      P12_KIT_GENERATOR_SOURCE,
      schemaShapeContract.record.generatorSourceSha256,
    ],
    [
      P12_RUNNER_SOURCE,
      schemaShapeContract.record.runnerSourceSha256,
    ],
    ...PHASE4_MIGRATIONS.map((migration) => [
      `migrations/${migration.sourceFile}`,
      schemaShapeContract.record.migrationHashes[migration.sourceFile],
    ]),
  ]) {
    assert(
      sha256Bytes(readCommittedGitFile(sourceToolingHead, path))
        === expectedSha256,
      `Contract-bound source/tooling content differs at ${path}`,
    )
    assert(
      sha256Bytes(readCommittedGitFile(currentHead, path))
        === expectedSha256,
      `Production GO-marker HEAD changed contract-bound content at ${path}`,
    )
  }
}

function verifyProductionGitGuards(
  manifest,
  approval,
  schemaShapeContract,
) {
  const currentHead = runGit(['rev-parse', 'HEAD'])
  const trackedStatus = runGit([
    'status',
    '--porcelain',
    '--untracked-files=no',
  ])
  assert(trackedStatus === '', 'Production execution requires a clean tracked worktree')
  const upstreamHead = runGit(['rev-parse', '@{upstream}'])
  assert(
    upstreamHead === currentHead,
    'Production execution requires the approved HEAD to equal its pushed upstream',
  )
  validateApprovalRecord(approval, { currentHead })
  assert(
    manifest.sourceGitHead
      === schemaShapeContract.record.sourceToolingGitHead,
    'Kit source/tooling HEAD differs from the schema-shape contract',
  )
  assertCommittedSourceBindings(
    manifest.sourceGitHead,
    currentHead,
    schemaShapeContract,
  )
  verifyCommittedAuthorityBindings(approval, currentHead)
  return currentHead
}

async function loadApprovalRecord(path) {
  const { resolvedPath, stats } = await resolveExistingExternalPath(
    path,
    'Approval record',
    'file',
  )
  if (typeof process.getuid === 'function') {
    assert(stats.uid === process.getuid(), 'Approval record must be owned by the executing OS user')
  }
  assert(
    (stats.mode & 0o777) === 0o600,
    'Approval record permissions must be exactly 0600',
  )
  assert(stats.size <= 64 * 1024, 'Approval record is unexpectedly large')
  const raw = await readFile(resolvedPath, 'utf8')
  const record = JSON.parse(raw)
  validateApprovalRecord(record)
  return {
    record,
    path: resolvedPath,
    sha256: sha256Bytes(Buffer.from(raw, 'utf8')),
  }
}

function readProductionPassword() {
  const result = spawnSync(
    '/usr/bin/security',
    [
      'find-generic-password',
      '-w',
      '-s',
      PRODUCTION_KEYCHAIN_SERVICE,
      '-a',
      PRODUCTION_KEYCHAIN_ACCOUNT,
    ],
    {
      encoding: 'utf8',
      maxBuffer: 64 * 1024,
      shell: false,
    },
  )
  assert(
    result.status === 0,
    'Unable to read the Production database credential from the fixed Keychain item',
  )
  const password = result.stdout.replace(/\r?\n$/, '')
  assert(password.length > 0, 'The fixed Production Keychain item is empty')
  return password
}

function readRehearsalPassword() {
  const password = process.env[REHEARSAL_PASSWORD_ENV]
  assert(
    typeof password === 'string' && password.length > 0,
    `Rehearsal mode requires ${REHEARSAL_PASSWORD_ENV} in the process environment`,
  )
  return password
}

/**
 * @param {{
 *   password: string,
 *   mode: 'rehearsal' | 'production',
 *   baseEnvironment?: Record<string, string | undefined>,
 * }} options
 * @returns {Record<string, string>}
 */
export function buildCliEnvironment({
  password,
  mode,
  baseEnvironment = process.env,
}) {
  assert(
    mode === 'rehearsal' || mode === 'production',
    'CLI environment mode must be rehearsal or production',
  )
  /** @type {Record<string, string>} */
  const environment = {}
  for (const key of [
    'HOME',
    'LANG',
    'LC_ALL',
    'PATH',
    'SSL_CERT_DIR',
    'SSL_CERT_FILE',
    'SYSTEMROOT',
    'TERM',
    'TMPDIR',
    'TZ',
  ]) {
    const value = baseEnvironment[key]
    if (value !== undefined) {
      environment[key] = value
    }
  }
  // CLI 2.107.0's explicit --db-url path delegates password lookup to libpq;
  // the package-specific SUPABASE_DB_PASSWORD variable is not consumed there.
  // PGPASSWORD remains process-memory-only and is never placed in argv/evidence.
  environment.PGPASSWORD = password
  environment.SUPABASE_TELEMETRY_DISABLED = '1'
  environment.PGSSLMODE = mode === 'production' ? 'require' : 'disable'
  return environment
}

function signalProcessGroup(child, signal) {
  if (!child.pid) {
    return false
  }
  try {
    if (process.platform === 'win32') {
      return child.kill(signal)
    }
    process.kill(-child.pid, signal)
    return true
  } catch (error) {
    if (error?.code === 'ESRCH') {
      return false
    }
    throw error
  }
}

/**
 * @param {string} command
 * @param {string[]} args
 * @param {{
 *   password: string,
 *   mode: 'rehearsal' | 'production',
 *   timeoutMs: number,
 *   interruptGraceMs?: number,
 * }} options
 */
export function runCapturedProcess(command, args, {
  password,
  mode,
  timeoutMs,
  interruptGraceMs = INTERRUPT_GRACE_MS,
}) {
  return new Promise((resolvePromise, rejectPromise) => {
    const stdoutChunks = []
    const stderrChunks = []
    let capturedBytes = 0
    let timedOut = false
    let hardKilled = false
    let closed = false
    let settled = false
    let closeResult
    let graceCompleted = false
    let hardKillTimer

    const child = spawn(command, args, {
      cwd: REPOSITORY_ROOT,
      detached: process.platform !== 'win32',
      env: buildCliEnvironment({ password, mode }),
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    const finalize = () => {
      if (
        settled
        || !closeResult
        || (timedOut && !graceCompleted)
      ) {
        return
      }
      settled = true
      if (capturedBytes > MAX_CAPTURE_BYTES) {
        rejectPromise(new Error('Supabase CLI output exceeded the bounded capture limit'))
        return
      }
      resolvePromise({
        ...closeResult,
        timedOut,
        hardKilled,
        stdout: Buffer.concat(stdoutChunks).toString('utf8'),
        stderr: Buffer.concat(stderrChunks).toString('utf8'),
      })
    }

    const append = (target, chunk) => {
      capturedBytes += chunk.length
      if (capturedBytes > MAX_CAPTURE_BYTES) {
        hardKilled = true
        signalProcessGroup(child, 'SIGKILL')
        return
      }
      target.push(chunk)
    }
    child.stdout.on('data', (chunk) => append(stdoutChunks, chunk))
    child.stderr.on('data', (chunk) => append(stderrChunks, chunk))

    const timeout = setTimeout(() => {
      if (closed) {
        return
      }
      timedOut = true
      signalProcessGroup(child, 'SIGINT')
      hardKillTimer = setTimeout(() => {
        hardKilled = signalProcessGroup(child, 'SIGKILL')
        graceCompleted = true
        finalize()
      }, interruptGraceMs)
    }, timeoutMs)

    child.once('error', (error) => {
      if (settled) {
        return
      }
      settled = true
      clearTimeout(timeout)
      clearTimeout(hardKillTimer)
      signalProcessGroup(child, 'SIGKILL')
      rejectPromise(new Error(`Unable to start frozen Supabase CLI: ${error.code ?? 'unknown error'}`))
    })

    child.once('close', (code, signal) => {
      closed = true
      clearTimeout(timeout)
      closeResult = { code, signal }
      if (!timedOut) {
        graceCompleted = true
      }
      finalize()
    })
  })
}

export function parseQueryRows(stdout) {
  let parsed
  try {
    parsed = JSON.parse(stdout.trim())
  } catch {
    throw new Error('Supabase CLI query output was not valid JSON')
  }
  if (Array.isArray(parsed)) {
    return parsed
  }
  if (Array.isArray(parsed?.result)) {
    return parsed.result
  }
  if (Array.isArray(parsed?.data)) {
    return parsed.data
  }
  if (Array.isArray(parsed?.rows)) {
    return parsed.rows
  }
  throw new Error('Supabase CLI query output did not contain a row array')
}

async function runQuery({ dbUrl, password, mode, workdir, sql }) {
  const result = await runCapturedProcess(
    LOCAL_SUPABASE_CLI,
    buildSupabaseQueryArgs({ dbUrl, sql, workdir }),
    {
      password,
      mode,
      timeoutMs: QUERY_TIMEOUT_MS,
    },
  )
  assert(!result.timedOut, 'Read-only CLI query timed out; stop without migration')
  if (result.code !== 0) {
    const safeDetail = redactSensitiveText(result.stderr, [password])
      .trim()
      .slice(0, 1000)
    throw new Error(
      safeDetail
        ? `Read-only CLI query failed: ${safeDetail}`
        : 'Read-only CLI query failed',
    )
  }
  return parseQueryRows(result.stdout)
}

const IDENTITY_SQL = `
select
  current_user::text as current_user_name,
  session_user::text as session_user_name,
  current_database()::text as database_name,
  current_setting('server_version_num')::text as server_version_num;
`

const LEDGER_SQL = `
select version::text as version, name::text as name
from supabase_migrations.schema_migrations
where version >= '20260621045208'
order by version;
`

const FLAGS_SQL = `
select key::text as key, value::text as value
from public.app_settings
where key in (
  'catalog_admin_enabled',
  'catalog_new_identity_enabled',
  'catalog_retirement_enabled'
)
order by key;
`

const CATALOG_SQL = `
select
  count(*)::integer as price_rows,
  count(distinct item_code)::integer as distinct_codes,
  count(*) filter (where item_code is null or btrim(item_code) = '')::integer as missing_codes,
  count(*) filter (where item_name is null or btrim(item_name) = '')::integer as missing_names,
  count(*) filter (where unit is null or btrim(unit) = '')::integer as missing_units,
  count(*) filter (
    where material_cost is null or labor_cost is null or unit_cost is null
  )::integer as missing_costs,
  count(*) filter (
    where unit_cost is distinct from material_cost + labor_cost
  )::integer as unit_cost_mismatches,
  count(*) filter (
    where version_id is distinct from (
      select version_id from public.price_list_default_version where id = true
    )
  )::integer as noncurrent_price_rows,
  (
    select encode(
      pg_catalog.sha256(
        convert_to(
          coalesce(
            jsonb_agg(
              jsonb_build_array(
                authority.id::text,
                authority.version_id::text,
                authority.item_code,
                authority.item_name,
                authority.unit,
                to_char(
                  authority.material_cost,
                  'FM999999999999990.00'
                ),
                to_char(
                  authority.labor_cost,
                  'FM999999999999990.00'
                ),
                to_char(
                  authority.unit_cost,
                  'FM999999999999990.00'
                ),
                authority.category,
                authority.is_active
              )
              order by
                authority.item_code collate "C",
                authority.id
            )::text,
            '[]'
          ),
          'UTF8'
        )
      ),
      'hex'
    )::text
    from public.price_list authority
  ) as catalog_authority_fingerprint_sha256
from public.price_list;
`

const CATALOG_POINTER_SQL = `
select
  v.version_string::text as version_string,
  v.status::text as status,
  v.is_default as is_default,
  (
    select count(*)::integer
    from public.price_list_versions draft
    where draft.status = 'draft'
  ) as draft_count
from public.price_list_default_version d
join public.price_list_versions v on v.id = d.version_id
where d.id = true;
`

const FACTOR_AND_BOQ_SQL = `
select
  (
    select v.version_string::text
    from public.factor_reference_default_version d
    join public.factor_reference_versions v on v.id = d.version_id
    where d.id = true
  ) as factor_default_version,
  (
    select v.status::text
    from public.factor_reference_default_version d
    join public.factor_reference_versions v on v.id = d.version_id
    where d.id = true
  ) as factor_default_status,
  (
    select v.row_count::integer
    from public.factor_reference_default_version d
    join public.factor_reference_versions v on v.id = d.version_id
    where d.id = true
  ) as factor_default_row_count,
  (
    select v.dataset_hash::text
    from public.factor_reference_default_version d
    join public.factor_reference_versions v on v.id = d.version_id
    where d.id = true
  ) as factor_default_dataset_hash,
  (select count(*)::integer from public.factor_reference_versions) as factor_version_count,
  (select count(*)::integer from public.factor_reference_rows) as factor_reference_rows,
  (select count(*)::integer from public.boq) as boq_count,
  (select count(*)::integer from public.boq_items) as boq_item_count,
  (
    select count(*)::integer
    from public.boq
    where price_list_version_id is null
  ) as boq_missing_price_version,
  (
    select count(*)::integer
    from public.boq b
    cross join public.price_list_default_version d
    where d.id = true
      and b.price_list_version_id is distinct from d.version_id
  ) as boq_noncurrent_price_version,
  (
    select count(*)::integer
    from public.boq_items item
    left join public.price_list price on price.id = item.price_list_id
    where item.price_list_id is not null
      and price.id is null
  ) as boq_item_missing_price_row,
  (
    select count(*)::integer
    from public.boq_items item
    join public.boq b on b.id = item.boq_id
    join public.price_list price on price.id = item.price_list_id
    where price.version_id is distinct from b.price_list_version_id
  ) as boq_item_cross_version,
  (
    select count(*)::integer
    from public.boq
    where factor_reference_version_id is not null
  ) as boq_bound_factor_version,
  (
    select encode(
      pg_catalog.sha256(
        convert_to(
          coalesce(
            jsonb_agg(to_jsonb(v) order by v.id)::text,
            '[]'
          ),
          'UTF8'
        )
      ),
      'hex'
    )::text
    from public.factor_reference_versions v
  ) as factor_versions_fingerprint_sha256,
  (
    select encode(
      pg_catalog.sha256(
        convert_to(
          coalesce(
            jsonb_agg(
              to_jsonb(r)
              order by r.version_id, r.display_order, r.id
            )::text,
            '[]'
          ),
          'UTF8'
        )
      ),
      'hex'
    )::text
    from public.factor_reference_rows r
  ) as factor_rows_fingerprint_sha256,
  (
    select encode(
      pg_catalog.sha256(
        convert_to(
          coalesce(
            jsonb_agg(to_jsonb(d) order by d.id)::text,
            '[]'
          ),
          'UTF8'
        )
      ),
      'hex'
    )::text
    from public.factor_reference_default_version d
  ) as factor_default_fingerprint_sha256,
  (
    select encode(
      pg_catalog.sha256(
        convert_to(
          coalesce(
            jsonb_agg(
              jsonb_build_array(
                b.id::text,
                b.factor_reference_version_id::text
              )
              order by b.id
            )::text,
            '[]'
          ),
          'UTF8'
        )
      ),
      'hex'
    )::text
    from public.boq b
  ) as boq_factor_bindings_fingerprint_sha256;
`

const HOTFIX_016_SQL = `
select
  format(
    '%I.%I(%s)',
    n.nspname,
    p.proname,
    pg_get_function_identity_arguments(p.oid)
  )::text as signature,
  pg_get_userbyid(p.proowner)::text as owner,
  length(p.prosrc)::integer as prosrc_length,
  encode(
    pg_catalog.sha256(convert_to(p.prosrc, 'UTF8')),
    'hex'
  )::text as prosrc_sha256,
  p.prosecdef as security_definer,
  coalesce(array_to_string(p.proconfig, ','), '')::text as function_config,
  exists (
    select 1
    from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) privilege
    where privilege.grantee = 0
      and privilege.privilege_type = 'EXECUTE'
  ) as public_execute,
  has_function_privilege('anon', p.oid, 'EXECUTE') as anon_execute,
  has_function_privilege(
    'authenticated',
    p.oid,
    'EXECUTE'
  ) as authenticated_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where p.oid = to_regprocedure(
  'public.save_boq_with_routes(uuid,jsonb,jsonb)'
);
`

const SCHEMA_SHAPE_SQL = `
with column_rows as (
  select
    n.nspname::text as schema_name,
    c.relname::text as relation_name,
    c.relkind::text as relation_kind,
    c.relpersistence::text as persistence,
    a.attnum::integer as ordinal_position,
    a.attname::text as column_name,
    format_type(a.atttypid, a.atttypmod)::text as data_type,
    a.attnotnull as not_null,
    pg_get_expr(ad.adbin, ad.adrelid, true)::text as column_default,
    a.attidentity::text as identity_kind,
    a.attgenerated::text as generated_kind,
    case
      when coll.oid is null then null
      else format('%I.%I', coll_ns.nspname, coll.collname)
    end::text as collation
  from pg_attribute a
  join pg_class c on c.oid = a.attrelid
  join pg_namespace n on n.oid = c.relnamespace
  left join pg_attrdef ad
    on ad.adrelid = a.attrelid
   and ad.adnum = a.attnum
  left join pg_collation coll on coll.oid = a.attcollation
  left join pg_namespace coll_ns on coll_ns.oid = coll.collnamespace
  where n.nspname in ('public', 'private')
    and c.relkind in ('r', 'p')
    and a.attnum > 0
    and not a.attisdropped
),
constraint_rows as (
  select
    n.nspname::text as schema_name,
    c.relname::text as relation_name,
    con.conname::text as constraint_name,
    con.contype::text as constraint_type,
    con.convalidated as validated,
    con.condeferrable as deferrable,
    con.condeferred as initially_deferred,
    con.connoinherit as no_inherit,
    pg_get_constraintdef(con.oid, true)::text as definition
  from pg_constraint con
  join pg_class c on c.oid = con.conrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname in ('public', 'private')
    and c.relkind in ('r', 'p')
),
index_rows as (
  select
    table_ns.nspname::text as schema_name,
    table_class.relname::text as relation_name,
    index_class.relname::text as index_name,
    pg_get_userbyid(index_class.relowner)::text as owner,
    access_method.amname::text as access_method,
    tablespace.spcname::text as tablespace,
    index_row.indisunique as is_unique,
    index_row.indisprimary as is_primary,
    index_row.indisexclusion as is_exclusion,
    index_row.indimmediate as is_immediate,
    index_row.indisclustered as is_clustered,
    index_row.indisreplident as is_replica_identity,
    index_row.indisvalid as is_valid,
    index_row.indisready as is_ready,
    index_row.indislive as is_live,
    index_row.indcheckxmin as check_xmin,
    index_row.indnullsnotdistinct as nulls_not_distinct,
    pg_get_indexdef(index_row.indexrelid, 0, true)::text as definition,
    pg_get_expr(
      index_row.indpred,
      index_row.indrelid,
      true
    )::text as predicate
  from pg_index index_row
  join pg_class table_class on table_class.oid = index_row.indrelid
  join pg_namespace table_ns on table_ns.oid = table_class.relnamespace
  join pg_class index_class on index_class.oid = index_row.indexrelid
  join pg_am access_method on access_method.oid = index_class.relam
  left join pg_tablespace tablespace
    on tablespace.oid = index_class.reltablespace
  where table_ns.nspname in ('public', 'private')
    and table_class.relkind in ('r', 'p')
),
shape as (
  select jsonb_build_object(
    'columns',
    coalesce(
      (
        select jsonb_agg(
          to_jsonb(column_row)
          order by
            column_row.schema_name collate "C",
            column_row.relation_name collate "C",
            column_row.ordinal_position
        )
        from column_rows column_row
      ),
      '[]'::jsonb
    ),
    'constraints',
    coalesce(
      (
        select jsonb_agg(
          to_jsonb(constraint_row)
          order by
            constraint_row.schema_name collate "C",
            constraint_row.relation_name collate "C",
            constraint_row.constraint_name collate "C"
        )
        from constraint_rows constraint_row
      ),
      '[]'::jsonb
    ),
    'indexes',
    coalesce(
      (
        select jsonb_agg(
          to_jsonb(index_row)
          order by
            index_row.schema_name collate "C",
            index_row.relation_name collate "C",
            index_row.index_name collate "C"
        )
        from index_rows index_row
      ),
      '[]'::jsonb
    )
  ) as payload
)
select
  encode(
    pg_catalog.sha256(convert_to(payload::text, 'UTF8')),
    'hex'
  )::text as schema_shape_fingerprint_sha256,
  payload->'columns' as columns,
  payload->'constraints' as constraints,
  payload->'indexes' as indexes
from shape;
`

function sqlLiteral(value) {
  return `'${String(value).replaceAll("'", "''")}'`
}

function withoutTrailingSemicolon(sql) {
  return sql.trim().replace(/;$/, '')
}

export function writeBoundarySql(sentinelNonce) {
  const sentinelExpression = sentinelNonce
    ? `(
        select to_jsonb(sentinel_row)
        from (
          ${withoutTrailingSemicolon(
            rehearsalSentinelSql(sentinelNonce),
          )}
        ) sentinel_row
      )`
    : 'null::jsonb'
  return `
select
  (
    select to_jsonb(identity_row)
    from (
      ${withoutTrailingSemicolon(IDENTITY_SQL)}
    ) identity_row
  ) as identity,
  (
    select coalesce(
      jsonb_agg(to_jsonb(ledger_row) order by ledger_row.version),
      '[]'::jsonb
    )
    from (
      ${withoutTrailingSemicolon(LEDGER_SQL)}
    ) ledger_row
  ) as ledger,
  (
    select coalesce(
      jsonb_agg(to_jsonb(flag_row) order by flag_row.key),
      '[]'::jsonb
    )
    from (
      ${withoutTrailingSemicolon(FLAGS_SQL)}
    ) flag_row
  ) as flags,
  (
    select to_jsonb(catalog_row)
    from (
      ${withoutTrailingSemicolon(CATALOG_SQL)}
    ) catalog_row
  ) as catalog,
  (
    select to_jsonb(pointer_row)
    from (
      ${withoutTrailingSemicolon(CATALOG_POINTER_SQL)}
    ) pointer_row
  ) as catalog_pointer,
  (
    select to_jsonb(factor_and_boq_row)
    from (
      ${withoutTrailingSemicolon(FACTOR_AND_BOQ_SQL)}
    ) factor_and_boq_row
  ) as factor_and_boq,
  (
    select to_jsonb(hotfix016_row)
    from (
      ${withoutTrailingSemicolon(HOTFIX_016_SQL)}
    ) hotfix016_row
  ) as hotfix016,
  ${sentinelExpression} as disposable_target;
`
}

function targetValues(targets) {
  if (targets.length === 0) {
    return `select null::text as schema_name, null::text as object_name where false`
  }
  return `values ${targets
    .map((target) => `(${sqlLiteral(target.schema)}, ${sqlLiteral(target.name)})`)
    .join(',\n')}`
}

function relationInventorySql(targets) {
  return `
with targets(schema_name, object_name) as (
  ${targetValues(targets)}
)
select
  t.schema_name,
  t.object_name,
  c.oid::text as oid,
  pg_get_userbyid(c.relowner)::text as owner,
  c.relkind::text as relation_kind,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced,
  coalesce(c.relacl::text, '') as acl
from targets t
left join pg_namespace n on n.nspname = t.schema_name
left join pg_class c
  on c.relnamespace = n.oid
 and c.relname = t.object_name
 and c.relkind in ('r', 'p', 'v', 'm', 'S', 'f')
order by t.schema_name, t.object_name;
`
}

function routineInventorySql(targets) {
  return `
with targets(schema_name, object_name) as (
  ${targetValues(targets)}
)
select
  t.schema_name,
  t.object_name,
  p.oid::text as oid,
  p.oid::regprocedure::text as signature,
  pg_get_userbyid(p.proowner)::text as owner,
  p.prosecdef as security_definer,
  coalesce(array_to_string(p.proconfig, ','), '') as function_config,
  coalesce(p.proacl::text, '') as acl,
  md5(pg_get_functiondef(p.oid))::text as definition_md5,
  md5(p.prosrc)::text as body_md5,
  exists (
    select 1
    from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) privilege
    where privilege.grantee = 0
      and privilege.privilege_type = 'EXECUTE'
  ) as public_execute,
  case
    when to_regrole('anon') is null then null
    else has_function_privilege(to_regrole('anon'), p.oid, 'EXECUTE')
  end as anon_execute,
  case
    when to_regrole('authenticated') is null then null
    else has_function_privilege(to_regrole('authenticated'), p.oid, 'EXECUTE')
  end as authenticated_execute,
  case
    when to_regrole('service_role') is null then null
    else has_function_privilege(to_regrole('service_role'), p.oid, 'EXECUTE')
  end as service_role_execute
from targets t
left join pg_namespace n on n.nspname = t.schema_name
left join pg_proc p
  on p.pronamespace = n.oid
 and p.proname = t.object_name
order by t.schema_name, t.object_name, signature;
`
}

function policyInventorySql(targets) {
  return `
with targets(schema_name, object_name) as (
  ${targetValues(targets)}
)
select
  t.schema_name,
  t.object_name,
  policy.policyname::text as policy_name,
  policy.permissive::text as permissive,
  coalesce(policy.roles::text, '') as roles,
  policy.cmd::text as command,
  coalesce(policy.qual, '')::text as using_expression,
  coalesce(policy.with_check, '')::text as check_expression
from targets t
left join pg_policies policy
  on policy.schemaname = t.schema_name
 and policy.tablename = t.object_name
order by t.schema_name, t.object_name, policy.policyname;
`
}

function relationGrantInventorySql(targets) {
  return `
with targets(schema_name, object_name) as (
  ${targetValues(targets)}
)
select
  t.schema_name,
  t.object_name,
  grant_row.grantee::text as grantee,
  grant_row.privilege_type::text as privilege_type,
  grant_row.is_grantable::text as is_grantable
from targets t
left join information_schema.role_table_grants grant_row
  on grant_row.table_schema = t.schema_name
 and grant_row.table_name = t.object_name
order by
  t.schema_name,
  t.object_name,
  grant_row.grantee,
  grant_row.privilege_type;
`
}

function triggerInventorySql(targets) {
  return `
with targets(schema_name, object_name) as (
  ${targetValues(targets)}
)
select
  t.schema_name,
  t.object_name,
  trigger_row.tgname::text as trigger_name,
  trigger_row.tgenabled::text as enabled_state,
  md5(pg_get_triggerdef(trigger_row.oid, true))::text as definition_md5
from targets t
left join pg_namespace n on n.nspname = t.schema_name
left join pg_class c
  on c.relnamespace = n.oid
 and c.relname = t.object_name
left join pg_trigger trigger_row
  on trigger_row.tgrelid = c.oid
 and not trigger_row.tgisinternal
order by t.schema_name, t.object_name, trigger_row.tgname;
`
}

const DEFAULT_ACL_SQL = `
select
  coalesce(n.nspname, '')::text as schema_name,
  d.defaclobjtype::text as object_type,
  coalesce(d.defaclacl::text, '') as acl,
  exists (
    select 1
    from aclexplode(d.defaclacl) privilege
    where privilege.grantee = 0
      and privilege.privilege_type = 'EXECUTE'
  ) as public_execute,
  exists (
    select 1
    from aclexplode(d.defaclacl) privilege
    join pg_roles role on role.oid = privilege.grantee
    where role.rolname = 'anon'
      and privilege.privilege_type = 'EXECUTE'
  ) as anon_execute,
  exists (
    select 1
    from aclexplode(d.defaclacl) privilege
    join pg_roles role on role.oid = privilege.grantee
    where role.rolname = 'authenticated'
      and privilege.privilege_type = 'EXECUTE'
  ) as authenticated_execute,
  exists (
    select 1
    from aclexplode(d.defaclacl) privilege
    join pg_roles role on role.oid = privilege.grantee
    where role.rolname = 'service_role'
      and privilege.privilege_type = 'EXECUTE'
  ) as service_role_execute
from pg_default_acl d
left join pg_namespace n on n.oid = d.defaclnamespace
where d.defaclrole = to_regrole('postgres')
  and (
    d.defaclnamespace = 0
    or n.nspname in ('private', 'public')
  )
order by schema_name, object_type;
`

const PRIVATE_SCHEMA_ACL_SQL = `
select
  n.nspname::text as schema_name,
  pg_get_userbyid(n.nspowner)::text as owner,
  coalesce(n.nspacl::text, '') as acl,
  has_schema_privilege('anon', n.oid, 'USAGE') as anon_usage,
  has_schema_privilege('anon', n.oid, 'CREATE') as anon_create,
  has_schema_privilege('authenticated', n.oid, 'USAGE') as authenticated_usage,
  has_schema_privilege('authenticated', n.oid, 'CREATE') as authenticated_create,
  has_schema_privilege('service_role', n.oid, 'USAGE') as service_role_usage,
  has_schema_privilege('service_role', n.oid, 'CREATE') as service_role_create,
  exists (
    select 1
    from aclexplode(coalesce(n.nspacl, acldefault('n', n.nspowner))) privilege
    where privilege.grantee = 0
      and privilege.privilege_type = 'USAGE'
  ) as public_usage,
  exists (
    select 1
    from aclexplode(coalesce(n.nspacl, acldefault('n', n.nspowner))) privilege
    where privilege.grantee = 0
      and privilege.privilege_type = 'CREATE'
  ) as public_create
from pg_namespace n
where n.nspname = 'private';
`

function validateIdentity(rows, mode) {
  assert(rows.length === 1, 'Database identity query must return exactly one row')
  const row = rows[0]
  assert(row.current_user_name === REQUIRED_CURRENT_USER, 'Database current_user is not postgres')
  assert(row.session_user_name === REQUIRED_CURRENT_USER, 'Database session_user is not postgres')
  const expectedDatabase = mode === 'rehearsal'
    ? REHEARSAL_DATABASE_NAME
    : PRODUCTION_DATABASE_NAME
  assert(
    row.database_name === expectedDatabase,
    `Connected database is not the required ${expectedDatabase} target`,
  )
  const versionNumber = Number.parseInt(row.server_version_num, 10)
  assert(
    Number.isFinite(versionNumber)
      && Math.floor(versionNumber / 10_000) === REQUIRED_POSTGRES_MAJOR,
    'Database server is not PostgreSQL major 17',
  )
  return row
}

function validateRehearsalSentinel(rows) {
  assert(
    rows.length === 1,
    'Disposable rehearsal sentinel query must return exactly one ownership row',
  )
  const row = rows[0]
  assert(
    row.database_name === REHEARSAL_DATABASE_NAME,
    'Disposable rehearsal sentinel is not in the isolated rehearsal database',
  )
  assert(Number(row.total_rows) === 1, 'Disposable rehearsal sentinel table must contain exactly one row')
  assert(Number(row.exact_rows) === 1, 'Disposable rehearsal sentinel nonce/purpose does not match')
  assert(row.table_owner === REQUIRED_CURRENT_USER, 'Disposable rehearsal sentinel is not owned by postgres')
  return row
}

export function expectedFeatureFlags(expectedMigrations) {
  const completedPhaseOrdinals = new Set(
    expectedMigrations
      .filter((migration) =>
        PHASE4_MIGRATIONS.some(
          (phaseMigration) =>
            phaseMigration.ordinal === migration.ordinal,
        ))
      .map((migration) => migration.ordinal),
  )
  if (completedPhaseOrdinals.has('020')) {
    return [...FEATURE_FLAGS]
  }
  if (completedPhaseOrdinals.has('017')) {
    return ['catalog_admin_enabled']
  }
  return []
}

export function validateFlags(rows, expectedMigrations) {
  const expectedFlags = expectedFeatureFlags(expectedMigrations)
  assert(
    rows.length === expectedFlags.length,
    'Phase 4 feature-flag rows do not match the exact migration stage',
  )
  const actual = Object.fromEntries(rows.map((row) => [row.key, row.value]))
  assertExactKeys(actual, expectedFlags, 'Phase 4 feature flags')
  for (const flag of expectedFlags) {
    assert(actual[flag] === 'false', `${flag} is not false`)
  }
  return actual
}

function validateCatalog(rows, pointerRows) {
  assert(rows.length === 1, 'Catalog baseline query must return one row')
  assert(pointerRows.length === 1, 'Catalog pointer query must return one row')
  const row = rows[0]
  const pointer = pointerRows[0]
  assert(Number(row.price_rows) === 710, 'Production catalog row count is not 710')
  assert(Number(row.distinct_codes) === 710, 'Production distinct catalog code count is not 710')
  for (const field of [
    'missing_codes',
    'missing_names',
    'missing_units',
    'missing_costs',
    'unit_cost_mismatches',
    'noncurrent_price_rows',
  ]) {
    assert(Number(row[field]) === 0, `Catalog baseline ${field} is not zero`)
  }
  assert(
    /^[0-9a-f]{64}$/.test(
      row.catalog_authority_fingerprint_sha256 ?? '',
    ),
    'Catalog authority fingerprint is not a SHA-256',
  )
  assert(pointer.version_string === '2568.0.0', 'Production catalog pointer is not 2568.0.0')
  assert(pointer.status === 'active', 'Production catalog pointer is not active')
  assert(pointer.is_default === true, 'Production catalog pointer mirror is not default')
  assert(Number(pointer.draft_count) === 0, 'Unexpected catalog draft exists during P-12')
  return { ...row, pointer }
}

export function validateCatalogSnapshot(snapshot) {
  assertPlainObject(snapshot, 'Catalog snapshot')
  const { pointer, ...row } = snapshot
  return validateCatalog([row], [pointer])
}

export function assertCatalogUnchanged(before, after) {
  for (const field of [
    'price_rows',
    'distinct_codes',
    'catalog_authority_fingerprint_sha256',
  ]) {
    assert(
      String(after[field]) === String(before[field]),
      `Catalog authority field changed during migration: ${field}`,
    )
  }
  assert(
    canonicalJson(after.pointer) === canonicalJson(before.pointer),
    'Catalog pointer changed during migration',
  )
}

function assertApprovedCatalogFingerprint(catalog, approval) {
  assert(
    catalog.catalog_authority_fingerprint_sha256
      === approval.catalogAuthorityFingerprintSha256,
    'Live catalog authority fingerprint differs from the approved Production snapshot binding',
  )
}

const FACTOR_AND_BOQ_FINGERPRINT_FIELDS = Object.freeze([
  'factor_versions_fingerprint_sha256',
  'factor_rows_fingerprint_sha256',
  'factor_default_fingerprint_sha256',
  'boq_factor_bindings_fingerprint_sha256',
])

export function validateFactorAndBoq(rows) {
  assert(rows.length === 1, 'Factor F / BOQ baseline query must return one row')
  const row = rows[0]
  assert(row.factor_default_version === '2569.0.0', 'Factor F pointer is not 2569.0.0')
  assert(row.factor_default_status === 'active', 'Factor F pointer is not active')
  assert(Number(row.factor_default_row_count) === 36, 'Factor F default row count is not 36')
  assert(
    row.factor_default_dataset_hash
      === 'sha256:4f35b267bde3007439aebb193be1e53bdcea5a7acce95b5a7bbf5828018ef1a6',
    'Factor F default dataset hash drifted',
  )
  assert(Number(row.factor_version_count) === 2, 'Factor F version count is not 2')
  assert(Number(row.factor_reference_rows) === 73, 'Factor F versioned row count is not 73')
  assert(Number(row.boq_missing_price_version) === 0, 'A BOQ is missing its catalog version binding')
  assert(Number(row.boq_noncurrent_price_version) === 0, 'A BOQ is bound to a noncurrent catalog version')
  assert(Number(row.boq_item_missing_price_row) === 0, 'A BOQ item points to a missing catalog row')
  assert(Number(row.boq_item_cross_version) === 0, 'A BOQ item crosses its BOQ catalog version')
  for (const field of FACTOR_AND_BOQ_FINGERPRINT_FIELDS) {
    assert(
      /^[0-9a-f]{64}$/.test(row[field] ?? ''),
      `Factor F / BOQ ${field} is not a SHA-256 fingerprint`,
    )
  }
  return row
}

export function validateHotfix016(rows) {
  assert(
    rows.length === 1,
    'Hotfix 016 function query must return exactly one routine',
  )
  const row = rows[0]
  assert(
    row.signature === HOTFIX_016_FUNCTION_SIGNATURE,
    'Hotfix 016 save_boq_with_routes signature is missing or changed',
  )
  assert(row.owner === REQUIRED_CURRENT_USER, 'Hotfix 016 function is not owned by postgres')
  assert(
    Number(row.prosrc_length) === HOTFIX_016_PROSRC_LENGTH,
    'Hotfix 016 function body length drifted',
  )
  assert(
    row.prosrc_sha256 === HOTFIX_016_PROSRC_SHA256,
    'Hotfix 016 function body SHA-256 drifted',
  )
  assert(row.security_definer === true, 'Hotfix 016 function is not SECURITY DEFINER')
  assert(
    row.function_config === 'search_path=""',
    'Hotfix 016 function search_path is not exactly empty',
  )
  assert(row.public_execute === false, 'Hotfix 016 function grants EXECUTE to PUBLIC')
  assert(row.anon_execute === false, 'Hotfix 016 function is executable by anon')
  assert(
    row.authenticated_execute === true,
    'Hotfix 016 function is not executable by authenticated',
  )
  return row
}

export function validateSchemaShape(
  rows,
  expectedFingerprint,
  label = 'Schema shape',
) {
  const row = validateCapturedSchemaShape(rows, label)
  assert(
    row.schema_shape_fingerprint_sha256 === expectedFingerprint,
    `${label} fingerprint differs from the reviewed stage contract`,
  )
  return row
}

export function validateCapturedSchemaShape(
  rows,
  label = 'Schema shape',
) {
  assert(rows.length === 1, `${label} query must return exactly one row`)
  const row = rows[0]
  assert(
    /^[0-9a-f]{64}$/.test(
      row.schema_shape_fingerprint_sha256 ?? '',
    ),
    `${label} fingerprint is not a SHA-256`,
  )
  for (const field of ['columns', 'constraints', 'indexes']) {
    assert(
      Array.isArray(row[field]) && row[field].length > 0,
      `${label} ${field} inventory is missing`,
    )
  }
  for (const constraint of row.constraints) {
    assert(
      constraint.validated === true,
      `${label} contains an unvalidated constraint: ${constraint.schema_name}.${constraint.relation_name}.${constraint.constraint_name}`,
    )
  }
  for (const index of row.indexes) {
    assert(
      index.is_valid === true
        && index.is_ready === true
        && index.is_live === true,
      `${label} contains an invalid, unready, or non-live index: ${index.schema_name}.${index.index_name}`,
    )
  }
  return row
}

function validateOwnedInventory(rows, targets, label) {
  const targetKeys = new Set(
    targets.map((target) => `${target.schema}.${target.name}`),
  )
  const foundKeys = new Set()
  for (const row of rows) {
    const key = `${row.schema_name}.${row.object_name}`
    if (row.oid) {
      foundKeys.add(key)
      assert(row.owner === REQUIRED_CURRENT_USER, `${label} ${key} is not owned by postgres`)
      if (
        label === 'Relation'
        && row.schema_name === 'public'
        && ['r', 'p'].includes(row.relation_kind)
      ) {
        assert(row.rls_enabled === true, `Public relation ${key} does not have RLS enabled`)
      }
    }
  }
  for (const key of targetKeys) {
    assert(foundKeys.has(key), `${label} ${key} is missing`)
  }
}

function validateRoutineAcl(rows, expectedMigrations) {
  const bridgeApplied = expectedMigrations.some(
    (migration) => migration.ordinal === '017a',
  )
  for (const row of rows) {
    if (!row.oid) {
      continue
    }
    assert(row.public_execute === false, `Routine ${row.signature} grants EXECUTE to PUBLIC`)
    assert(row.anon_execute === false, `Routine ${row.signature} is executable by anon`)
    if (bridgeApplied) {
      assert(
        row.service_role_execute === false,
        `Routine ${row.signature} is executable by service_role`,
      )
    }
  }
}

export function validateRequiredFunctionDefaultAcl(rows) {
  const globalFunctionAcl = rows.find(
    (row) => row.schema_name === '' && row.object_type === 'f',
  )
  assert(
    globalFunctionAcl,
    'Global postgres-owner function default ACL is missing; schema-scoped REVOKE is not sufficient',
  )
  assert(
    globalFunctionAcl.acl === '{postgres=X/postgres}',
    'Global postgres-owner function default ACL is not the exact deny-by-default posture',
  )
  assert(globalFunctionAcl.public_execute === false, 'Global function default ACL grants PUBLIC execute')
  assert(globalFunctionAcl.anon_execute === false, 'Global function default ACL grants anon execute')
  assert(globalFunctionAcl.authenticated_execute === false, 'Global function default ACL grants authenticated execute')
  assert(globalFunctionAcl.service_role_execute === false, 'Global function default ACL grants service_role execute')

  const publicFunctionAcls = rows.filter(
    (row) => row.schema_name === 'public' && row.object_type === 'f',
  )
  assert(
    publicFunctionAcls.length <= 1,
    'Public-schema postgres-owner function default ACL is duplicated',
  )

  const privateFunctionAcls = rows.filter(
    (row) => row.schema_name === 'private' && row.object_type === 'f',
  )
  assert(
    privateFunctionAcls.length <= 1,
    'Private-schema postgres-owner function default ACL is duplicated',
  )

  for (const row of [
    ...publicFunctionAcls,
    ...privateFunctionAcls,
  ]) {
    assert(
      row.acl === '{postgres=X/postgres}',
      `${row.schema_name} schema function default ACL is not owner-only`,
    )
    assert(row.public_execute === false, `${row.schema_name} schema function default ACL grants PUBLIC execute`)
    assert(row.anon_execute === false, `${row.schema_name} schema function default ACL grants anon execute`)
    assert(row.authenticated_execute === false, `${row.schema_name} schema function default ACL grants authenticated execute`)
    assert(row.service_role_execute === false, `${row.schema_name} schema function default ACL grants service_role execute`)
  }
}

export function validateFunctionDefaultAclForMigrations(
  rows,
  expectedMigrations,
) {
  const foundationApplied = expectedMigrations.some(
    (migration) => migration.ordinal === '017',
  )
  if (!foundationApplied) {
    return
  }

  const bridgeApplied = expectedMigrations.some(
    (migration) => migration.ordinal === '017a',
  )
  const globalFunctionAcl = rows.find(
    (row) => row.schema_name === '' && row.object_type === 'f',
  )
  if (!bridgeApplied) {
    assert(
      !globalFunctionAcl,
      'Global postgres-owner function default ACL appeared before the reviewed 017a bridge',
    )
    return
  }

  validateRequiredFunctionDefaultAcl(rows)
}

export function validatePrivateSchemaAcl(rows, expectedMigrations) {
  assert(rows.length === 1, 'Private schema ACL inventory is missing')
  const row = rows[0]
  assert(row.owner === REQUIRED_CURRENT_USER, 'Private schema is not owned by postgres')
  assert(row.public_usage === false, 'Private schema grants USAGE to PUBLIC')
  assert(row.public_create === false, 'Private schema grants CREATE to PUBLIC')
  assert(row.anon_usage === false, 'Private schema grants USAGE to anon')
  assert(row.anon_create === false, 'Private schema grants CREATE to anon')
  assert(
    row.service_role_usage === true,
    'Private schema does not grant the reviewed USAGE to service_role',
  )
  assert(
    row.service_role_create === false,
    'Private schema grants CREATE to service_role',
  )
  assert(
    row.authenticated_create === false,
    'Private schema grants CREATE to authenticated',
  )
  const authenticatedUsageExpected = expectedMigrations.some(
    (migration) => migration.ordinal === '018',
  )
  assert(
    row.authenticated_usage === authenticatedUsageExpected,
    authenticatedUsageExpected
      ? 'Private schema does not grant the reviewed authenticated USAGE required after migration 018'
      : 'Private schema grants authenticated USAGE before migration 018',
  )
}

async function collectSnapshot({
  dbUrl,
  password,
  mode,
  step,
  workdir,
  expectedMigrations,
  expectedSchemaShapeFingerprint,
  objectTargets,
}) {
  const completeReadOnlySnapshot = {
    capturedAt: new Date().toISOString(),
    complete: true,
    results: {},
  }
  // Keep the operator path deliberately serial: every query is bounded and
  // the runner never consumes a burst of pooler connections during a change
  // window. Capture every read-only result even when an earlier query fails so
  // uncertain outcomes retain the complete reviewed snapshot surface.
  for (const { name, sql } of snapshotQueryDefinitions(objectTargets)) {
    try {
      completeReadOnlySnapshot.results[name] = {
        rows: await runQuery({
          dbUrl,
          password,
          mode,
          workdir,
          sql,
        }),
      }
    } catch (error) {
      completeReadOnlySnapshot.results[name] = {
        error: redactSensitiveText(error.message, [password]),
      }
    }
  }

  const rowsFor = (name) => {
    const result = completeReadOnlySnapshot.results[name]
    if (!result || result.error) {
      throw new Error(
        result?.error
          ? `Read-only snapshot query ${name} failed: ${result.error}`
          : `Read-only snapshot query ${name} is missing`,
      )
    }
    return result.rows
  }

  try {
    const identityRows = rowsFor('identity')
    const ledgerRows = rowsFor('ledger')
    const flagRows = rowsFor('flags')
    const catalogRows = rowsFor('catalog')
    const pointerRows = rowsFor('catalogPointer')
    const factorRows = rowsFor('factorAndBoq')
    const hotfix016Rows = rowsFor('hotfix016')
    const schemaShapeRows = rowsFor('schemaShape')
    const relationRows = rowsFor('relations')
    const routineRows = rowsFor('routines')
    const policyRows = rowsFor('policies')
    const relationGrantRows = rowsFor('relationGrants')
    const triggerRows = rowsFor('triggers')
    const defaultAclRows = rowsFor('defaultPrivileges')
    const privateSchemaAclRows = rowsFor('privateSchema')

    const identity = validateIdentity(identityRows, mode)
    const ledger = validateLedgerRows(
      ledgerRows,
      expectedMigrations,
      `${step} migration ledger`,
    )
    const flags = validateFlags(flagRows, expectedMigrations)
    const catalog = validateCatalog(catalogRows, pointerRows)
    const factorAndBoq = validateFactorAndBoq(factorRows)
    const hotfix016 = validateHotfix016(hotfix016Rows)
    const schemaShape = validateSchemaShape(
      schemaShapeRows,
      expectedSchemaShapeFingerprint,
      `${step} schema shape`,
    )
    validateOwnedInventory(
      relationRows,
      objectTargets.relations,
      'Relation',
    )
    validateOwnedInventory(
      routineRows,
      objectTargets.routines,
      'Routine',
    )
    validateRoutineAcl(routineRows, expectedMigrations)
    const foundationApplied = expectedMigrations.some(
      (migration) => migration.ordinal === '017',
    )
    if (foundationApplied) {
      validateFunctionDefaultAclForMigrations(
        defaultAclRows,
        expectedMigrations,
      )
      validatePrivateSchemaAcl(
        privateSchemaAclRows,
        expectedMigrations,
      )
    }

    return {
      capturedAt: completeReadOnlySnapshot.capturedAt,
      identity,
      ledger,
      flags,
      catalog,
      factorAndBoq,
      hotfix016,
      schemaShape,
      ownershipAndAclInventory: {
        relations: relationRows,
        routines: routineRows,
        policies: policyRows,
        relationGrants: relationGrantRows,
        triggers: triggerRows,
        defaultPrivileges: defaultAclRows,
        privateSchema: privateSchemaAclRows,
      },
    }
  } catch (error) {
    error.completeReadOnlySnapshot = completeReadOnlySnapshot
    throw error
  }
}

export function snapshotQueryDefinitions(objectTargets) {
  return [
    { name: 'identity', sql: IDENTITY_SQL },
    { name: 'ledger', sql: LEDGER_SQL },
    { name: 'flags', sql: FLAGS_SQL },
    { name: 'catalog', sql: CATALOG_SQL },
    { name: 'catalogPointer', sql: CATALOG_POINTER_SQL },
    { name: 'factorAndBoq', sql: FACTOR_AND_BOQ_SQL },
    { name: 'hotfix016', sql: HOTFIX_016_SQL },
    { name: 'schemaShape', sql: SCHEMA_SHAPE_SQL },
    {
      name: 'relations',
      sql: relationInventorySql(objectTargets.relations),
    },
    {
      name: 'routines',
      sql: routineInventorySql(objectTargets.routines),
    },
    {
      name: 'policies',
      sql: policyInventorySql(objectTargets.relations),
    },
    {
      name: 'relationGrants',
      sql: relationGrantInventorySql(objectTargets.relations),
    },
    {
      name: 'triggers',
      sql: triggerInventorySql(objectTargets.relations),
    },
    { name: 'defaultPrivileges', sql: DEFAULT_ACL_SQL },
    { name: 'privateSchema', sql: PRIVATE_SCHEMA_ACL_SQL },
  ]
}

export function assertFactorAndBoqUnchanged(before, after) {
  for (const field of [
    'factor_default_version',
    'factor_default_status',
    'factor_default_row_count',
    'factor_default_dataset_hash',
    'factor_version_count',
    'factor_reference_rows',
    'boq_count',
    'boq_item_count',
    'boq_bound_factor_version',
    ...FACTOR_AND_BOQ_FINGERPRINT_FIELDS,
  ]) {
    assert(
      String(after[field]) === String(before[field]),
      `Factor F / BOQ field changed during migration: ${field}`,
    )
  }
}

export function assertHotfix016Unchanged(before, after) {
  assert(
    canonicalJson(after) === canonicalJson(before),
    'Hotfix 016 save_boq_with_routes posture or body changed during migration',
  )
}

async function writeEvidenceFile(evidenceRoot, name, value) {
  const path = join(evidenceRoot, name)
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, {
    encoding: 'utf8',
    mode: 0o400,
  })
  await chmod(path, 0o400)
}

function writePostCommitNotice(message) {
  try {
    process.stdout.write(message, () => undefined)
  } catch {
    // The already-published manifest is the authoritative commit point.
    return false
  }
  return true
}

export async function publishEvidenceManifestCommit(
  evidenceRoot,
  name,
  manifest,
) {
  assert(
    basename(name) === name && name.endsWith('.json'),
    'Evidence manifest filename must be a basename ending in .json',
  )
  const finalPath = join(evidenceRoot, name)
  const pendingPath = join(evidenceRoot, `.${name}.pending`)
  await writeFile(
    pendingPath,
    `${JSON.stringify(manifest, null, 2)}\n`,
    {
      encoding: 'utf8',
      mode: 0o400,
      flag: 'wx',
    },
  )
  await chmod(pendingPath, 0o400)
  const pendingStats = await lstat(pendingPath)
  assert(
    pendingStats.isFile()
      && !pendingStats.isSymbolicLink()
      && (pendingStats.mode & 0o077) === 0,
    'Pending evidence manifest is not a protected regular file',
  )
  const published = {
    manifest,
    path: finalPath,
    sha256: await sha256File(pendingPath),
  }
  // COMMIT POINT: all content, permission, and hash checks happen against the
  // pending file. Atomic publication is the last fallible operation; callers
  // must not add an awaited finalization step after this rename.
  await rename(pendingPath, finalPath)
  return published
}

async function writeEvidenceManifest(evidenceRoot, context) {
  const evidenceFiles = (await readdir(evidenceRoot))
    .filter((name) => name !== '05-evidence-manifest.json')
    .sort()
  const files = {}
  for (const name of evidenceFiles) {
    const path = join(evidenceRoot, name)
    const stats = await lstat(path)
    assert(
      stats.isFile() && !stats.isSymbolicLink(),
      `Evidence entry must be a regular file: ${name}`,
    )
    files[name] = await sha256File(path)
  }
  const manifest = {
    schema: EVIDENCE_MANIFEST_SCHEMA,
    createdAt: new Date().toISOString(),
    step: context.step,
    mode: context.mode,
    gitHead: context.gitHead,
    kitManifestSha256: context.kitManifestSha256,
    files,
  }
  return publishEvidenceManifestCommit(
    evidenceRoot,
    '05-evidence-manifest.json',
    manifest,
  )
}

const SCHEMA_CALIBRATION_EVIDENCE_FILES = Object.freeze([
  '00-calibration-context.json',
  '01-calibration-preflight.json',
  '01-calibration-write-boundary.json',
  '02-calibration-cli-output.json',
  '03-schema-capture.json',
  '04-calibration-outcome.json',
])

export async function loadSchemaCalibrationManifest(
  path,
  {
    expectedSha256,
    kit,
    expectedFinalStage,
    expectedExecutor,
    seenPaths = new Set(),
  },
) {
  const {
    resolvedPath,
    stats,
  } = await resolveExistingExternalPath(
    path,
    'Schema calibration evidence manifest',
    'file',
  )
  assert(
    !seenPaths.has(resolvedPath),
    'Schema calibration evidence chain contains a cycle',
  )
  seenPaths.add(resolvedPath)
  if (typeof process.getuid === 'function') {
    assert(
      stats.uid === process.getuid(),
      'Schema calibration manifest must be owned by the executing OS user',
    )
  }
  assert(
    (stats.mode & 0o077) === 0,
    'Schema calibration manifest must deny group and other access',
  )
  assert(
    stats.size > 0 && stats.size <= 128 * 1024,
    'Schema calibration manifest size is outside the bounded limit',
  )
  const raw = await readFile(resolvedPath, 'utf8')
  const sha256 = sha256Bytes(Buffer.from(raw, 'utf8'))
  if (expectedSha256) {
    assert(
      sha256 === expectedSha256,
      'Schema calibration manifest SHA-256 differs from its binding',
    )
  }
  const manifest = JSON.parse(raw)
  assertPlainObject(manifest, 'Schema calibration manifest')
  assertNoSecretFields(manifest, 'Schema calibration manifest')
  assertExactKeys(
    manifest,
    [
      'schema',
      'createdAt',
      'mode',
      'sourceToolingGitHead',
      'kitManifestPath',
      'kitManifestSha256',
      'generatorSourceSha256',
      'runnerSourceSha256',
      'captureExecutor',
      'stage',
      'fingerprints',
      'priorCalibrationManifestPath',
      'priorCalibrationManifestSha256',
      'automaticNextStep',
      'productionAuthorized',
      'files',
    ],
    'Schema calibration manifest',
  )
  assert(
    manifest.schema
      === SCHEMA_CALIBRATION_EVIDENCE_MANIFEST_SCHEMA,
    'Schema calibration manifest schema is invalid',
  )
  assert(
    manifest.mode === SCHEMA_CALIBRATION_MODE,
    'Schema calibration manifest is not rehearsal-only',
  )
  assert(
    manifest.sourceToolingGitHead === kit.manifest.sourceGitHead,
    'Schema calibration manifest source/tooling HEAD differs from the kit',
  )
  assert(
    manifest.kitManifestPath === kit.manifestPath
      && manifest.kitManifestSha256
        === await sha256File(kit.manifestPath),
    'Schema calibration manifest differs from the exact kit',
  )
  assert(
    manifest.generatorSourceSha256
      === kit.manifest.generatorSourceSha256
      && manifest.runnerSourceSha256
        === kit.manifest.runnerSourceSha256,
    'Schema calibration manifest tooling hashes differ from the kit',
  )
  assert(
    typeof manifest.captureExecutor === 'string'
      && manifest.captureExecutor.trim()
      && (!expectedExecutor
        || manifest.captureExecutor === expectedExecutor),
    'Schema calibration capture executor differs',
  )
  assertTimestampWithZone(
    manifest.createdAt,
    'Schema calibration manifest createdAt',
  )
  assert(
    manifest.automaticNextStep === false
      && manifest.productionAuthorized === false,
    'Schema calibration evidence must prohibit automatic and Production authorization',
  )
  const stageIndex = SCHEMA_SHAPE_STAGES.indexOf(manifest.stage)
  assert(stageIndex >= 0, 'Schema calibration stage is not frozen')
  if (expectedFinalStage) {
    assert(
      manifest.stage === expectedFinalStage,
      'Schema calibration manifest is not the complete final pass-1 stage',
    )
  }
  const expectedFingerprintStages =
    SCHEMA_SHAPE_STAGES.slice(0, stageIndex + 1)
  assertExactKeys(
    manifest.fingerprints,
    expectedFingerprintStages,
    'Schema calibration cumulative fingerprints',
  )
  for (const stage of expectedFingerprintStages) {
    assert(
      /^[0-9a-f]{64}$/.test(manifest.fingerprints[stage] ?? ''),
      `Schema calibration fingerprint is invalid for ${stage}`,
    )
  }
  assertExactKeys(
    manifest.files,
    SCHEMA_CALIBRATION_EVIDENCE_FILES,
    'Schema calibration evidence files',
  )

  const evidenceRoot = dirname(resolvedPath)
  const evidencePaths = {}
  for (const name of SCHEMA_CALIBRATION_EVIDENCE_FILES) {
    const expectedFileSha256 = manifest.files[name]
    assert(
      /^[0-9a-f]{64}$/.test(expectedFileSha256 ?? ''),
      `Schema calibration evidence SHA-256 is invalid for ${name}`,
    )
    const evidencePath = join(evidenceRoot, name)
    await assertNoSymlinkComponents(evidencePath)
    const evidenceStats = await lstat(evidencePath)
    assert(
      evidenceStats.isFile() && !evidenceStats.isSymbolicLink(),
      `Schema calibration evidence is not a regular file: ${name}`,
    )
    assert(
      (evidenceStats.mode & 0o077) === 0,
      `Schema calibration evidence must deny group and other access: ${name}`,
    )
    assert(
      await sha256File(evidencePath) === expectedFileSha256,
      `Schema calibration evidence hash differs for ${name}`,
    )
    evidencePaths[name] = evidencePath
  }
  const context = JSON.parse(
    await readFile(evidencePaths['00-calibration-context.json'], 'utf8'),
  )
  const capture = JSON.parse(
    await readFile(evidencePaths['03-schema-capture.json'], 'utf8'),
  )
  const writeBoundary = JSON.parse(
    await readFile(
      evidencePaths['01-calibration-write-boundary.json'],
      'utf8',
    ),
  )
  const outcome = JSON.parse(
    await readFile(evidencePaths['04-calibration-outcome.json'], 'utf8'),
  )
  assert(
    context.mode === SCHEMA_CALIBRATION_MODE
      && context.stage === manifest.stage
      && context.sourceToolingGitHead === manifest.sourceToolingGitHead
      && context.kitManifestSha256 === manifest.kitManifestSha256
      && context.captureExecutor === manifest.captureExecutor
      && context.automaticNextStep === false
      && context.productionAuthorized === false,
    'Schema calibration context differs from its manifest',
  )
  assertTimestampWithZone(capture.capturedAt, 'Schema capture capturedAt')
  assertPlainObject(
    writeBoundary,
    'Schema calibration write-boundary evidence',
  )
  assertNoSecretFields(
    writeBoundary,
    'Schema calibration write-boundary evidence',
  )
  assertExactKeys(
    writeBoundary,
    manifest.stage === '016'
      ? [
        'capturedAt',
        'stage',
        'migrationPerformed',
        'skipped',
        'automaticNextStep',
        'productionAuthorized',
      ]
      : [
        'capturedAt',
        'stage',
        'migrationPerformed',
        'skipped',
        'disposableTarget',
        'snapshot',
        'automaticNextStep',
        'productionAuthorized',
      ],
    'Schema calibration write-boundary evidence',
  )
  assertTimestampWithZone(
    writeBoundary.capturedAt,
    'Schema calibration write-boundary capturedAt',
  )
  assert(
    writeBoundary.stage === manifest.stage
      && writeBoundary.migrationPerformed === (manifest.stage !== '016')
      && writeBoundary.skipped === (manifest.stage === '016')
      && writeBoundary.automaticNextStep === false
      && writeBoundary.productionAuthorized === false,
    'Schema calibration write-boundary state differs from its stage',
  )
  if (manifest.stage !== '016') {
    assertPlainObject(
      writeBoundary.disposableTarget,
      'Schema calibration write-boundary sentinel',
    )
    assert(
      writeBoundary.disposableTarget.databaseName
        === REHEARSAL_DATABASE_NAME
        && writeBoundary.disposableTarget.tableOwner
          === REQUIRED_CURRENT_USER
        && writeBoundary.disposableTarget.purpose
          === REHEARSAL_SENTINEL_PURPOSE
        && /^[0-9a-f]{64}$/.test(
          writeBoundary.disposableTarget.nonceSha256 ?? '',
        ),
      'Schema calibration write-boundary sentinel differs',
    )
    assertPlainObject(
      writeBoundary.snapshot,
      'Schema calibration write-boundary snapshot',
    )
    validateIdentity(
      [writeBoundary.snapshot.identity],
      'rehearsal',
    )
    validateLedgerRows(
      writeBoundary.snapshot.ledger,
      [
        ...HISTORICAL_MIGRATIONS,
        ...PHASE4_MIGRATIONS.slice(0, stageIndex - 1),
      ],
      `Calibration stage ${manifest.stage} write-boundary ledger`,
    )
    assert(
      writeBoundary.snapshot.schemaShape
        .schema_shape_fingerprint_sha256
        === manifest.fingerprints[
          SCHEMA_SHAPE_STAGES[stageIndex - 1]
        ],
      'Schema calibration write-boundary schema differs from prior stage',
    )
  }
  assert(
    capture.stage === manifest.stage
      && canonicalJson(capture.fingerprints)
        === canonicalJson(manifest.fingerprints),
    'Schema capture differs from cumulative manifest fingerprints',
  )
  assertPlainObject(
    capture.snapshot,
    'Schema calibration captured snapshot',
  )
  const schemaShape = validateCapturedSchemaShape(
    [capture.snapshot.schemaShape],
    `Calibration stage ${manifest.stage} schema shape`,
  )
  assert(
    schemaShape.schema_shape_fingerprint_sha256
      === manifest.fingerprints[manifest.stage],
    'Schema calibration current fingerprint differs from raw capture',
  )
  assertTimestampWithZone(
    outcome.finishedAt,
    'Schema calibration outcome finishedAt',
  )
  assert(
    outcome.calibrationSuccess === true
      && outcome.uncertainOutcome === false
      && outcome.migrationPerformed === (manifest.stage !== '016')
      && outcome.automaticNextStep === false
      && outcome.productionAuthorized === false,
    'Schema calibration outcome is not a successful non-authorizing manual step',
  )
  assert(
    Date.parse(manifest.createdAt)
      >= Date.parse(outcome.finishedAt)
      && Date.parse(manifest.createdAt)
        >= Date.parse(capture.capturedAt),
    'Schema calibration manifest predates its evidence',
  )

  let prior
  if (stageIndex === 0) {
    assert(
      manifest.priorCalibrationManifestPath === null
        && manifest.priorCalibrationManifestSha256 === null,
      'Baseline 016 calibration must not claim prior evidence',
    )
  } else {
    assert(
      typeof manifest.priorCalibrationManifestPath === 'string'
        && isAbsolute(manifest.priorCalibrationManifestPath)
        && /^[0-9a-f]{64}$/.test(
          manifest.priorCalibrationManifestSha256 ?? '',
        ),
      'Schema calibration stage requires an exact prior manifest binding',
    )
    prior = await loadSchemaCalibrationManifest(
      manifest.priorCalibrationManifestPath,
      {
        expectedSha256:
          manifest.priorCalibrationManifestSha256,
        kit,
        expectedFinalStage:
          SCHEMA_SHAPE_STAGES[stageIndex - 1],
        expectedExecutor: manifest.captureExecutor,
        seenPaths,
      },
    )
    for (const priorStage of SCHEMA_SHAPE_STAGES.slice(0, stageIndex)) {
      assert(
        manifest.fingerprints[priorStage]
          === prior.manifest.fingerprints[priorStage],
        `Schema calibration fingerprint chain changed at ${priorStage}`,
      )
    }
    assert(
      Date.parse(capture.capturedAt)
        > Date.parse(prior.manifest.createdAt),
      'Schema calibration stage does not follow prior evidence chronologically',
    )
  }
  return {
    path: resolvedPath,
    sha256,
    manifest,
    evidencePaths,
    context,
    writeBoundary,
    capture,
    outcome,
    prior,
  }
}

async function writeSchemaCalibrationManifest(
  evidenceRoot,
  context,
  fingerprints,
) {
  const files = {}
  for (const name of SCHEMA_CALIBRATION_EVIDENCE_FILES) {
    files[name] = await sha256File(join(evidenceRoot, name))
  }
  const manifest = {
    schema: SCHEMA_CALIBRATION_EVIDENCE_MANIFEST_SCHEMA,
    createdAt: new Date().toISOString(),
    mode: SCHEMA_CALIBRATION_MODE,
    sourceToolingGitHead: context.sourceToolingGitHead,
    kitManifestPath: context.kitManifestPath,
    kitManifestSha256: context.kitManifestSha256,
    generatorSourceSha256: context.generatorSourceSha256,
    runnerSourceSha256: context.runnerSourceSha256,
    captureExecutor: context.captureExecutor,
    stage: context.stage,
    fingerprints,
    priorCalibrationManifestPath:
      context.priorCalibrationManifestPath ?? null,
    priorCalibrationManifestSha256:
      context.priorCalibrationManifestSha256 ?? null,
    automaticNextStep: false,
    productionAuthorized: false,
    files,
  }
  return publishEvidenceManifestCommit(
    evidenceRoot,
    '05-schema-calibration-evidence-manifest.json',
    manifest,
  )
}

function expectedPriorStep(currentStep) {
  const currentIndex = PHASE4_MIGRATIONS.findIndex(
    (migration) => migration.ordinal === currentStep,
  )
  assert(currentIndex > 0, 'Step does not have a prior Phase 4 migration')
  return PHASE4_MIGRATIONS[currentIndex - 1].ordinal
}

/**
 * @param {string} path
 * @param {{
 *   currentStep: string,
 *   currentHead: string,
 *   kitManifestSha256: string,
 *   approval?: Record<string, any>,
 *   approvalRecordSha256?: string,
 *   schemaShapeContract: {
 *     path: string,
 *     sha256: string,
 *     record: Record<string, any>,
 *   },
 *   advisorArtifact: {
 *     path: string,
 *     sha256: string,
 *   },
 *   now?: Date,
 * }} options
 */
export async function loadPriorStepSignoff(
  path,
  {
    currentStep,
    currentHead,
    kitManifestSha256,
    approval,
    approvalRecordSha256,
    schemaShapeContract,
    advisorArtifact,
    now = new Date(),
  },
) {
  const {
    resolvedPath,
    stats,
  } = await resolveExistingExternalPath(
    path,
    'Prior-step verifier signoff',
    'file',
  )
  if (typeof process.getuid === 'function') {
    assert(
      stats.uid === process.getuid(),
      'Prior-step verifier signoff must be owned by the executing OS user',
    )
  }
  assert(
    (stats.mode & 0o777) === 0o600,
    'Prior-step verifier signoff permissions must be exactly 0600',
  )
  assert(stats.size <= 64 * 1024, 'Prior-step verifier signoff is unexpectedly large')

  const raw = await readFile(resolvedPath, 'utf8')
  const signoff = JSON.parse(raw)
  assertPlainObject(signoff, 'Prior-step verifier signoff')
  assertNoSecretFields(signoff)
  assertExactKeys(
    signoff,
    [
      'schema',
      'decision',
      'previousStep',
      'authorizedNextStep',
      'executionGitHead',
      'kitManifestSha256',
      'previousExecutor',
      'verifier',
      'ownershipAclRlsReviewed',
      'functionPostureAndBodyFingerprintsReviewed',
      'ledgerAndFlagsReviewed',
      'advisorDeltaTriaged',
      'schemaShapeContractSha256',
      'priorSchemaShapeFingerprintSha256',
      'advisorArtifactPath',
      'advisorArtifactSha256',
      'advisorArtifactCapturedAt',
      'reviewedAt',
      'priorEvidenceManifestPath',
      'priorEvidenceManifestSha256',
      'priorOutcomeSha256',
      'priorPostflightSha256',
      ...(approval ? ['approvalRecordSha256'] : []),
    ],
    'Prior-step verifier signoff',
  )
  const priorStep = expectedPriorStep(currentStep)
  assert(
    signoff.schema === PRIOR_STEP_SIGNOFF_SCHEMA,
    'Prior-step verifier signoff schema is not frozen v1',
  )
  assert(
    signoff.decision === 'SECURITY_VERIFIED',
    'Prior-step verifier decision must be SECURITY_VERIFIED',
  )
  assert(signoff.previousStep === priorStep, 'Prior-step verifier record is bound to the wrong previous step')
  assert(signoff.authorizedNextStep === currentStep, 'Prior-step verifier record is bound to the wrong next step')
  assert(signoff.executionGitHead === currentHead, 'Prior-step verifier record is bound to a different Git HEAD')
  assert(signoff.kitManifestSha256 === kitManifestSha256, 'Prior-step verifier record is bound to a different kit')
  assert(
    signoff.schemaShapeContractSha256
      === schemaShapeContract.sha256,
    'Prior-step verifier record is bound to a different schema-shape contract',
  )
  const expectedPriorSchemaShapeFingerprint =
    expectedSchemaShapeFingerprint(schemaShapeContract, priorStep)
  assert(
    signoff.priorSchemaShapeFingerprintSha256
      === expectedPriorSchemaShapeFingerprint,
    'Prior-step verifier schema-shape fingerprint differs from the reviewed stage contract',
  )
  assert(
    signoff.advisorArtifactPath === advisorArtifact.path,
    'Prior-step verifier advisor artifact path differs from the current bound artifact',
  )
  assert(
    signoff.advisorArtifactSha256 === advisorArtifact.sha256,
    'Prior-step verifier advisor artifact SHA-256 differs from the current bound artifact',
  )
  assertTimestampWithZone(
    signoff.advisorArtifactCapturedAt,
    'Prior-step advisorArtifactCapturedAt',
  )
  assert(
    typeof signoff.previousExecutor === 'string'
      && signoff.previousExecutor.trim(),
    'Prior-step verifier record must name the previous executor',
  )
  assert(
    typeof signoff.verifier === 'string' && signoff.verifier.trim(),
    'Prior-step verifier record must name the verifier',
  )
  assert(
    signoff.verifier
      === schemaShapeContract.record.githubReview.reviewerLogin,
    'Prior-step verifier differs from the schema-shape contract reviewer',
  )
  assert(
    signoff.previousExecutor.trim().toLocaleLowerCase()
      !== signoff.verifier.trim().toLocaleLowerCase(),
    'Prior-step verifier must be distinct from the previous executor',
  )
  for (const field of [
    'ownershipAclRlsReviewed',
    'functionPostureAndBodyFingerprintsReviewed',
    'ledgerAndFlagsReviewed',
    'advisorDeltaTriaged',
  ]) {
    assert(signoff[field] === true, `Prior-step verifier record must affirm ${field}`)
  }
  assertTimestampWithZone(signoff.reviewedAt, 'Prior-step reviewedAt')
  assert(Date.parse(signoff.reviewedAt) <= now.getTime(), 'Prior-step verifier review is in the future')

  if (approval) {
    assert(signoff.previousExecutor === approval.executor, 'Prior-step executor differs from the P-12 approval')
    assert(signoff.verifier === approval.independentVerifier, 'Prior-step verifier differs from the P-12 approval')
    assert(
      signoff.approvalRecordSha256 === approvalRecordSha256,
      'Prior-step verifier record is bound to a different P-12 approval file',
    )
    assert(
      Date.parse(signoff.reviewedAt)
        >= Date.parse(approval.maintenanceWindow.startsAt)
        && Date.parse(signoff.reviewedAt)
          <= Date.parse(approval.maintenanceWindow.endsAt),
      'Prior-step verifier review is outside the P-12 maintenance window',
    )
  } else {
    assert(
      signoff.approvalRecordSha256 === undefined,
      'Rehearsal prior-step signoff must not claim a Production approval',
    )
  }

  for (const field of [
    'priorEvidenceManifestSha256',
    'priorOutcomeSha256',
    'priorPostflightSha256',
    'priorSchemaShapeFingerprintSha256',
    'advisorArtifactSha256',
  ]) {
    assert(/^[0-9a-f]{64}$/.test(signoff[field]), `${field} must be a SHA-256`)
  }

  const {
    resolvedPath: evidenceManifestPath,
  } = await resolveExistingExternalPath(
    signoff.priorEvidenceManifestPath,
    'Prior evidence manifest',
    'file',
  )
  assert(
    await sha256File(evidenceManifestPath)
      === signoff.priorEvidenceManifestSha256,
    'Prior evidence manifest SHA-256 does not match the verifier record',
  )
  const evidenceManifest = JSON.parse(
    await readFile(evidenceManifestPath, 'utf8'),
  )
  assertExactKeys(
    evidenceManifest,
    [
      'schema',
      'createdAt',
      'step',
      'mode',
      'gitHead',
      'kitManifestSha256',
      'files',
    ],
    'Prior evidence manifest',
  )
  assert(evidenceManifest.schema === EVIDENCE_MANIFEST_SCHEMA, 'Prior evidence manifest schema is invalid')
  assert(evidenceManifest.step === priorStep, 'Prior evidence manifest step is invalid')
  assert(evidenceManifest.gitHead === currentHead, 'Prior evidence manifest Git HEAD differs')
  assert(evidenceManifest.kitManifestSha256 === kitManifestSha256, 'Prior evidence manifest kit differs')
  assertTimestampWithZone(
    evidenceManifest.createdAt,
    'Prior evidence manifest createdAt',
  )
  assertExactKeys(
    evidenceManifest.files,
    [
      '00-context.json',
      '01-preflight.json',
      '01-preflight-write-boundary.json',
      '02-cli-output.json',
      '02-migration-outcome.json',
      '03-postflight.json',
    ],
    'Prior evidence manifest files',
  )

  const evidenceRoot = dirname(evidenceManifestPath)
  const priorFiles = {}
  for (const [name, expectedSha] of Object.entries(evidenceManifest.files)) {
    assert(/^[0-9a-f]{64}$/.test(expectedSha), `Prior evidence hash is invalid for ${name}`)
    const evidencePath = join(evidenceRoot, name)
    await assertNoSymlinkComponents(evidencePath)
    const evidenceStats = await lstat(evidencePath)
    assert(evidenceStats.isFile(), `Prior evidence entry is not a file: ${name}`)
    if (typeof process.getuid === 'function') {
      assert(
        evidenceStats.uid === process.getuid(),
        `Prior evidence file is not owned by the executing OS user: ${name}`,
      )
    }
    assert(
      (evidenceStats.mode & 0o077) === 0,
      `Prior evidence file must deny group and other access: ${name}`,
    )
    assert(
      await sha256File(evidencePath) === expectedSha,
      `Prior evidence file hash differs for ${name}`,
    )
    priorFiles[name] = evidencePath
  }
  assert(
    evidenceManifest.files['02-migration-outcome.json']
      === signoff.priorOutcomeSha256,
    'Prior outcome SHA differs between manifest and verifier record',
  )
  assert(
    evidenceManifest.files['03-postflight.json']
      === signoff.priorPostflightSha256,
    'Prior postflight SHA differs between manifest and verifier record',
  )

  const context = JSON.parse(
    await readFile(priorFiles['00-context.json'], 'utf8'),
  )
  const outcome = JSON.parse(
    await readFile(priorFiles['02-migration-outcome.json'], 'utf8'),
  )
  const postflight = JSON.parse(
    await readFile(priorFiles['03-postflight.json'], 'utf8'),
  )
  assert(context.step === priorStep, 'Prior evidence context step differs')
  assert(
    context.mode === (approval ? 'production' : 'rehearsal'),
    'Prior evidence context mode differs',
  )
  assert(context.gitHead === currentHead, 'Prior evidence context Git HEAD differs')
  assert(context.kitManifestSha256 === kitManifestSha256, 'Prior evidence context kit differs')
  assert(context.executor === signoff.previousExecutor, 'Prior evidence executor differs from verifier record')
  assert(
    context.schemaShapeContractSha256
      === schemaShapeContract.sha256,
    'Prior evidence context schema-shape contract differs',
  )
  assert(
    typeof context.preStepAdvisorArtifactPath === 'string'
      && isAbsolute(context.preStepAdvisorArtifactPath)
      && /^[0-9a-f]{64}$/.test(
        context.preStepAdvisorArtifactSha256 ?? '',
      ),
    'Prior evidence context is missing its pre-step advisor artifact binding',
  )
  if (approval) {
    assert(
      context.approvalRecordSha256 === approvalRecordSha256,
      'Prior evidence context is bound to a different P-12 approval file',
    )
  }
  assert(outcome.mechanicalSuccess === true, 'Prior step was not a mechanical success')
  assert(outcome.uncertainOutcome === false, 'Prior step outcome is uncertain')
  assert(outcome.securityContractVerifierRequired === true, 'Prior outcome did not require security verification')
  assert(outcome.automaticNextStep === false, 'Prior outcome allowed automatic chaining')
  assertTimestampWithZone(outcome.finishedAt, 'Prior outcome finishedAt')
  assertTimestampWithZone(
    postflight.capturedAt,
    'Prior postflight capturedAt',
  )
  assert(
    Date.parse(signoff.reviewedAt) >= Date.parse(outcome.finishedAt),
    'Prior-step verifier review predates the migration outcome',
  )
  assert(
    Date.parse(signoff.reviewedAt)
      >= Date.parse(postflight.capturedAt),
    'Prior-step verifier review predates the postflight capture',
  )
  assert(
    Date.parse(signoff.advisorArtifactCapturedAt)
      >= Date.parse(postflight.capturedAt)
      && Date.parse(signoff.advisorArtifactCapturedAt)
        >= Date.parse(outcome.finishedAt)
      && Date.parse(signoff.advisorArtifactCapturedAt)
        <= Date.parse(signoff.reviewedAt),
    'Prior-step advisor artifact was not freshly captured after the previous step and before verifier review',
  )
  assert(
    Date.parse(signoff.reviewedAt)
      >= Date.parse(evidenceManifest.createdAt),
    'Prior-step verifier review predates the evidence manifest',
  )

  const priorIndex = PHASE4_MIGRATIONS.findIndex(
    (migration) => migration.ordinal === priorStep,
  )
  validateLedgerRows(
    postflight.ledger,
    [
      ...HISTORICAL_MIGRATIONS,
      ...PHASE4_MIGRATIONS.slice(0, priorIndex + 1),
    ],
    'Prior postflight ledger',
  )
  validateSchemaShape(
    [postflight.schemaShape],
    expectedPriorSchemaShapeFingerprint,
    `Prior postflight ${priorStep} schema shape`,
  )

  return {
    path: resolvedPath,
    sha256: sha256Bytes(Buffer.from(raw, 'utf8')),
    signoff,
    evidenceManifestPath,
  }
}

const SUCCESSFUL_STEP_EVIDENCE_FILES = Object.freeze([
  '00-context.json',
  '01-preflight.json',
  '01-preflight-write-boundary.json',
  '02-cli-output.json',
  '02-migration-outcome.json',
  '03-postflight.json',
])

async function loadSuccessfulStepEvidenceManifest(
  path,
  {
    step,
    mode,
    currentHead,
    kitManifestSha256,
    objectTargets,
    approvalRecordSha256,
    schemaShapeContract,
  },
) {
  const {
    resolvedPath,
    stats,
  } = await resolveExistingExternalPath(
    path,
    `${step} evidence manifest`,
    'file',
  )
  if (typeof process.getuid === 'function') {
    assert(
      stats.uid === process.getuid(),
      `${step} evidence manifest must be owned by the executing OS user`,
    )
  }
  assert(
    (stats.mode & 0o077) === 0,
    `${step} evidence manifest must deny group and other access`,
  )
  assert(stats.size <= 64 * 1024, `${step} evidence manifest is unexpectedly large`)

  const raw = await readFile(resolvedPath, 'utf8')
  const manifest = JSON.parse(raw)
  assertExactKeys(
    manifest,
    [
      'schema',
      'createdAt',
      'step',
      'mode',
      'gitHead',
      'kitManifestSha256',
      'files',
    ],
    `${step} evidence manifest`,
  )
  assert(manifest.schema === EVIDENCE_MANIFEST_SCHEMA, `${step} evidence manifest schema is invalid`)
  assert(manifest.step === step, `${step} evidence manifest step is invalid`)
  assert(manifest.mode === mode, `${step} evidence manifest mode differs`)
  assert(manifest.gitHead === currentHead, `${step} evidence manifest Git HEAD differs`)
  assert(manifest.kitManifestSha256 === kitManifestSha256, `${step} evidence manifest kit differs`)
  assertTimestampWithZone(manifest.createdAt, `${step} evidence manifest createdAt`)
  assertExactKeys(
    manifest.files,
    SUCCESSFUL_STEP_EVIDENCE_FILES,
    `${step} evidence manifest files`,
  )

  const evidenceRoot = dirname(resolvedPath)
  const evidencePaths = {}
  for (const name of SUCCESSFUL_STEP_EVIDENCE_FILES) {
    const expectedSha256 = manifest.files[name]
    assert(
      /^[0-9a-f]{64}$/.test(expectedSha256),
      `${step} evidence hash is invalid for ${name}`,
    )
    const evidencePath = join(evidenceRoot, name)
    await assertNoSymlinkComponents(evidencePath)
    const evidenceStats = await lstat(evidencePath)
    assert(
      evidenceStats.isFile() && !evidenceStats.isSymbolicLink(),
      `${step} evidence entry is not a regular file: ${name}`,
    )
    if (typeof process.getuid === 'function') {
      assert(
        evidenceStats.uid === process.getuid(),
        `${step} evidence file is not owned by the executing OS user: ${name}`,
      )
    }
    assert(
      (evidenceStats.mode & 0o077) === 0,
      `${step} evidence file must deny group and other access: ${name}`,
    )
    assert(
      await sha256File(evidencePath) === expectedSha256,
      `${step} evidence file hash differs for ${name}`,
    )
    evidencePaths[name] = evidencePath
  }

  const context = JSON.parse(
    await readFile(evidencePaths['00-context.json'], 'utf8'),
  )
  const outcome = JSON.parse(
    await readFile(evidencePaths['02-migration-outcome.json'], 'utf8'),
  )
  const postflight = JSON.parse(
    await readFile(evidencePaths['03-postflight.json'], 'utf8'),
  )
  for (const [value, label] of [
    [context, `${step} evidence context`],
    [outcome, `${step} migration outcome`],
    [postflight, `${step} postflight`],
  ]) {
    assertPlainObject(value, label)
    assertNoSecretFields(value, label)
  }

  assert(context.mode === mode, `${step} evidence context mode differs`)
  assert(context.step === step, `${step} evidence context step differs`)
  assert(context.gitHead === currentHead, `${step} evidence context Git HEAD differs`)
  assert(context.kitManifestSha256 === kitManifestSha256, `${step} evidence context kit differs`)
  assert(
    typeof context.executor === 'string' && context.executor.trim(),
    `${step} evidence context does not name the executor`,
  )
  assert(
    context.schemaShapeContractSha256
      === schemaShapeContract.sha256,
    `${step} evidence context is bound to a different schema-shape contract`,
  )
  assert(
    typeof context.preStepAdvisorArtifactPath === 'string'
      && isAbsolute(context.preStepAdvisorArtifactPath)
      && /^[0-9a-f]{64}$/.test(
        context.preStepAdvisorArtifactSha256 ?? '',
      ),
    `${step} evidence context is missing its pre-step advisor artifact binding`,
  )
  if (mode === 'production') {
    assert(
      context.approvalRecordSha256 === approvalRecordSha256,
      `${step} evidence context is bound to a different P-12 approval`,
    )
  } else {
    assert(
      context.approvalRecordSha256 === undefined,
      `Rehearsal ${step} evidence must not claim a Production approval`,
    )
  }

  assert(outcome.mechanicalSuccess === true, `${step} was not a mechanical success`)
  assert(outcome.uncertainOutcome === false, `${step} outcome is uncertain`)
  assert(outcome.verifiedSuccess === false, `${step} outcome improperly self-declared verified success`)
  assert(outcome.securityContractVerifierRequired === true, `${step} did not require independent security verification`)
  assert(outcome.automaticNextStep === false, `${step} outcome allowed automatic chaining`)
  assertTimestampWithZone(outcome.finishedAt, `${step} outcome finishedAt`)
  assertTimestampWithZone(postflight.capturedAt, `${step} postflight capturedAt`)

  const expectedStepMigrations = [
    ...HISTORICAL_MIGRATIONS,
    ...PHASE4_MIGRATIONS.slice(
      0,
      PHASE4_MIGRATIONS.findIndex(
        (migration) => migration.ordinal === step,
      ) + 1,
    ),
  ]
  validateIdentity([postflight.identity], mode)
  validateLedgerRows(
    postflight.ledger,
    expectedStepMigrations,
    `${step} postflight ledger`,
  )
  assertPlainObject(postflight.flags, `${step} postflight flags`)
  validateFlags(
    Object.entries(postflight.flags).map(([key, value]) => ({
      key,
      value,
    })),
    expectedStepMigrations,
  )
  validateCatalogSnapshot(postflight.catalog)
  validateFactorAndBoq([postflight.factorAndBoq])
  validateHotfix016([postflight.hotfix016])
  validateSchemaShape(
    [postflight.schemaShape],
    expectedSchemaShapeFingerprint(schemaShapeContract, step),
    `${step} evidence schema shape`,
  )
  assertPlainObject(
    postflight.ownershipAndAclInventory,
    `${step} ownership and ACL inventory`,
  )
  validateOwnedInventory(
    postflight.ownershipAndAclInventory.relations,
    objectTargets.relations,
    'Relation',
  )
  validateOwnedInventory(
    postflight.ownershipAndAclInventory.routines,
    objectTargets.routines,
    'Routine',
  )
  validateRoutineAcl(
    postflight.ownershipAndAclInventory.routines,
    expectedStepMigrations,
  )
  validateFunctionDefaultAclForMigrations(
    postflight.ownershipAndAclInventory.defaultPrivileges,
    expectedStepMigrations,
  )
  validatePrivateSchemaAcl(
    postflight.ownershipAndAclInventory.privateSchema,
    expectedStepMigrations,
  )

  return {
    path: resolvedPath,
    sha256: sha256Bytes(Buffer.from(raw, 'utf8')),
    manifest,
    evidencePaths,
    context,
    outcome,
    postflight,
  }
}

/**
 * @param {string} path
 * @param {{
 *   mode: 'rehearsal' | 'production',
 *   currentHead: string,
 *   kitManifestSha256: string,
 *   objectTargets: {
 *     relations: Array<Record<string, any>>,
 *     routines: Array<Record<string, any>>,
 *   },
 *   approval?: Record<string, any>,
 *   approvalRecordSha256?: string,
 *   schemaShapeContract: {
 *     path: string,
 *     sha256: string,
 *     record: Record<string, any>,
 *   },
 *   advisorArtifact: {
 *     path: string,
 *     sha256: string,
 *   },
 *   now?: Date,
 * }} options
 */
export async function loadFinalCloseoutSignoff(
  path,
  {
    mode,
    currentHead,
    kitManifestSha256,
    objectTargets,
    approval,
    approvalRecordSha256,
    schemaShapeContract,
    advisorArtifact,
    now = new Date(),
  },
) {
  const {
    resolvedPath,
    stats,
  } = await resolveExistingExternalPath(
    path,
    'Final independent-verifier closeout signoff',
    'file',
  )
  if (typeof process.getuid === 'function') {
    assert(
      stats.uid === process.getuid(),
      'Final closeout signoff must be owned by the executing OS user',
    )
  }
  assert(
    (stats.mode & 0o777) === 0o600,
    'Final closeout signoff permissions must be exactly 0600',
  )
  assert(stats.size <= 64 * 1024, 'Final closeout signoff is unexpectedly large')

  const raw = await readFile(resolvedPath, 'utf8')
  const signoff = JSON.parse(raw)
  assertPlainObject(signoff, 'Final closeout signoff')
  assertNoSecretFields(signoff, 'Final closeout signoff')
  assertExactKeys(
    signoff,
    [
      'schema',
      'decision',
      'step',
      'executionGitHead',
      'kitManifestSha256',
      'step025Executor',
      'independentVerifier',
      'independentVerificationCompleted',
      'securityContractReviewed',
      'advisorDeltaTriaged',
      'ownershipAclRlsReviewed',
      'functionPostureAndBodyFingerprintsReviewed',
      'hotfix016PostureAndBodyReviewed',
      'factorAndBoqFingerprintsReviewed',
      'ledgerAndFlagsReviewed',
      'schemaShapeContractSha256',
      'step025SchemaShapeFingerprintSha256',
      'advisorArtifactPath',
      'advisorArtifactSha256',
      'advisorArtifactCapturedAt',
      'p13Authorized',
      'automaticNextStep',
      'reviewedAt',
      'step025EvidenceManifestPath',
      'step025EvidenceManifestSha256',
      'step025OutcomeSha256',
      'step025PostflightSha256',
      ...(approval ? ['approvalRecordSha256'] : []),
    ],
    'Final closeout signoff',
  )
  assert(
    signoff.schema === FINAL_CLOSEOUT_SIGNOFF_SCHEMA,
    'Final closeout signoff schema is not frozen v1',
  )
  assert(
    signoff.decision === 'P12_EXECUTION_VERIFIED',
    'Final closeout decision must be P12_EXECUTION_VERIFIED',
  )
  assert(signoff.step === '025', 'Final closeout must be bound to step 025')
  assert(signoff.executionGitHead === currentHead, 'Final closeout is bound to a different Git HEAD')
  assert(signoff.kitManifestSha256 === kitManifestSha256, 'Final closeout is bound to a different kit')
  assert(
    signoff.schemaShapeContractSha256
      === schemaShapeContract.sha256,
    'Final closeout is bound to a different schema-shape contract',
  )
  const expectedStep025SchemaShapeFingerprint =
    expectedSchemaShapeFingerprint(schemaShapeContract, '025')
  assert(
    signoff.step025SchemaShapeFingerprintSha256
      === expectedStep025SchemaShapeFingerprint,
    'Final closeout schema-shape fingerprint differs from the reviewed 025 stage contract',
  )
  assert(
    signoff.advisorArtifactPath === advisorArtifact.path,
    'Final closeout advisor artifact path differs from the current bound artifact',
  )
  assert(
    signoff.advisorArtifactSha256 === advisorArtifact.sha256,
    'Final closeout advisor artifact SHA-256 differs from the current bound artifact',
  )
  assertTimestampWithZone(
    signoff.advisorArtifactCapturedAt,
    'Final closeout advisorArtifactCapturedAt',
  )
  for (const [field, label] of [
    ['step025Executor', 'step 025 executor'],
    ['independentVerifier', 'independent verifier'],
  ]) {
    assert(
      typeof signoff[field] === 'string'
        && signoff[field].trim() === signoff[field]
        && signoff[field].length > 0
        && signoff[field].length <= 200
        && !/[\u0000-\u001f\u007f]/.test(signoff[field]),
      `Final closeout must name an exact single-line ${label}`,
    )
  }
  assert(
    signoff.step025Executor.toLocaleLowerCase()
      !== signoff.independentVerifier.toLocaleLowerCase(),
    'Final closeout verifier must be distinct from the step 025 executor',
  )
  assert(
    signoff.independentVerifier
      === schemaShapeContract.record.githubReview.reviewerLogin,
    'Final closeout verifier differs from the schema-shape contract reviewer',
  )
  for (const field of [
    'independentVerificationCompleted',
    'securityContractReviewed',
    'advisorDeltaTriaged',
    'ownershipAclRlsReviewed',
    'functionPostureAndBodyFingerprintsReviewed',
    'hotfix016PostureAndBodyReviewed',
    'factorAndBoqFingerprintsReviewed',
    'ledgerAndFlagsReviewed',
  ]) {
    assert(signoff[field] === true, `Final closeout signoff must affirm ${field}`)
  }
  assert(signoff.p13Authorized === false, 'Final closeout must not authorize P-13')
  assert(signoff.automaticNextStep === false, 'Final closeout must prohibit automatic next steps')
  assertTimestampWithZone(signoff.reviewedAt, 'Final closeout reviewedAt')
  assert(Date.parse(signoff.reviewedAt) <= now.getTime(), 'Final closeout review is in the future')
  for (const field of [
    'step025EvidenceManifestSha256',
    'step025OutcomeSha256',
    'step025PostflightSha256',
    'step025SchemaShapeFingerprintSha256',
    'advisorArtifactSha256',
  ]) {
    assert(/^[0-9a-f]{64}$/.test(signoff[field]), `${field} must be a SHA-256`)
  }

  if (approval) {
    assert(signoff.step025Executor === approval.executor, 'Final closeout executor differs from the P-12 approval')
    assert(signoff.independentVerifier === approval.independentVerifier, 'Final closeout verifier differs from the P-12 approval')
    assert(
      signoff.approvalRecordSha256 === approvalRecordSha256,
      'Final closeout is bound to a different P-12 approval',
    )
    assert(
      Date.parse(signoff.reviewedAt)
        >= Date.parse(approval.maintenanceWindow.startsAt)
        && Date.parse(signoff.reviewedAt)
          <= Date.parse(approval.maintenanceWindow.endsAt),
      'Final closeout review is outside the P-12 maintenance window',
    )
  } else {
    assert(
      signoff.approvalRecordSha256 === undefined,
      'Rehearsal final closeout must not claim a Production approval',
    )
  }

  const step025Evidence = await loadSuccessfulStepEvidenceManifest(
    signoff.step025EvidenceManifestPath,
    {
      step: '025',
      mode,
      currentHead,
      kitManifestSha256,
      objectTargets,
      approvalRecordSha256,
      schemaShapeContract,
    },
  )
  if (approval) {
    assertApprovedCatalogFingerprint(
      step025Evidence.postflight.catalog,
      approval,
    )
  }
  assert(
    step025Evidence.sha256 === signoff.step025EvidenceManifestSha256,
    'Step 025 evidence manifest SHA-256 differs from the final closeout signoff',
  )
  assert(
    step025Evidence.manifest.files['02-migration-outcome.json']
      === signoff.step025OutcomeSha256,
    'Step 025 outcome SHA-256 differs from the final closeout signoff',
  )
  assert(
    step025Evidence.manifest.files['03-postflight.json']
      === signoff.step025PostflightSha256,
    'Step 025 postflight SHA-256 differs from the final closeout signoff',
  )
  assert(
    step025Evidence.context.executor === signoff.step025Executor,
    'Step 025 evidence executor differs from the final closeout signoff',
  )
  assert(
    step025Evidence.context.schemaShapeContractSha256
      === schemaShapeContract.sha256,
    'Step 025 evidence schema-shape contract differs from the final closeout signoff',
  )
  assert(
    Date.parse(signoff.reviewedAt)
      >= Date.parse(step025Evidence.outcome.finishedAt),
    'Final closeout review predates the step 025 outcome',
  )
  assert(
    Date.parse(signoff.reviewedAt)
      >= Date.parse(step025Evidence.postflight.capturedAt),
    'Final closeout review predates the step 025 postflight',
  )
  assert(
    Date.parse(signoff.advisorArtifactCapturedAt)
      >= Date.parse(step025Evidence.postflight.capturedAt)
      && Date.parse(signoff.advisorArtifactCapturedAt)
        >= Date.parse(step025Evidence.outcome.finishedAt)
      && Date.parse(signoff.advisorArtifactCapturedAt)
        <= Date.parse(signoff.reviewedAt),
    'Final advisor artifact was not freshly captured after step 025 and before closeout review',
  )
  assert(
    Date.parse(signoff.reviewedAt)
      >= Date.parse(step025Evidence.manifest.createdAt),
    'Final closeout review predates the step 025 evidence manifest',
  )

  return {
    path: resolvedPath,
    sha256: sha256Bytes(Buffer.from(raw, 'utf8')),
    signoff,
    step025Evidence,
  }
}

export function parseArguments(args) {
  const options = {}
  for (let index = 0; index < args.length; index += 1) {
    const key = args[index]
    assert(
      [
        '--mode',
        '--kit',
        '--step',
        '--db-url',
        '--evidence',
        '--approval-record',
        '--rehearsal-sentinel',
        '--prior-step-signoff',
        '--executor-label',
        '--schema-shape-contract',
        '--advisor-artifact',
        '--advisor-artifact-sha256',
      ].includes(key),
      `Unknown argument: ${key}`,
    )
    assert(index + 1 < args.length, `${key} requires a value`)
    options[key.slice(2).replaceAll('-', '_')] = args[index + 1]
    index += 1
  }
  for (const required of [
    'mode',
    'kit',
    'step',
    'db_url',
    'evidence',
    'executor_label',
    'schema_shape_contract',
    'advisor_artifact',
    'advisor_artifact_sha256',
  ]) {
    assert(options[required], `Missing --${required.replaceAll('_', '-')}`)
  }
  assert(
    options.mode === 'rehearsal' || options.mode === 'production',
    '--mode must be rehearsal or production',
  )
  if (options.mode === 'production') {
    assert(options.approval_record, 'Production mode requires --approval-record')
    assert(
      !options.rehearsal_sentinel,
      'Production mode must not accept a rehearsal sentinel',
    )
  } else {
    assert(!options.approval_record, 'Rehearsal mode must not accept a Production approval record')
    assert(
      options.rehearsal_sentinel,
      'Rehearsal mode requires --rehearsal-sentinel',
    )
    validateRehearsalSentinelNonce(options.rehearsal_sentinel)
  }
  assert(
    PHASE4_MIGRATIONS.some((migration) => migration.ordinal === options.step),
    '--step is not in the frozen Phase 4 migration sequence',
  )
  assertReviewedBridgeSequence(options.step)
  assert(
    /^[0-9a-f]{64}$/.test(options.advisor_artifact_sha256),
    '--advisor-artifact-sha256 must be a SHA-256',
  )
  assert(
    options.executor_label === options.executor_label.trim()
      && options.executor_label.length <= 200
      && !/[\u0000-\u001f\u007f]/.test(options.executor_label),
    '--executor-label must be a non-empty single-line label of at most 200 characters',
  )
  if (options.step === '017') {
    assert(
      !options.prior_step_signoff,
      'Step 017 must not accept a prior-step signoff',
    )
  } else {
    assert(
      options.prior_step_signoff,
      `Step ${options.step} requires --prior-step-signoff`,
    )
  }
  return options
}

export function parseCloseoutArguments(args) {
  const options = {}
  for (let index = 0; index < args.length; index += 1) {
    const key = args[index]
    assert(
      [
        '--mode',
        '--kit',
        '--db-url',
        '--evidence',
        '--approval-record',
        '--rehearsal-sentinel',
        '--step-025-evidence-manifest',
        '--final-signoff',
        '--verifier-label',
        '--schema-shape-contract',
        '--advisor-artifact',
        '--advisor-artifact-sha256',
      ].includes(key),
      `Unknown closeout argument: ${key}`,
    )
    assert(index + 1 < args.length, `${key} requires a value`)
    options[key.slice(2).replaceAll('-', '_')] = args[index + 1]
    index += 1
  }
  for (const required of [
    'mode',
    'kit',
    'db_url',
    'evidence',
    'step_025_evidence_manifest',
    'final_signoff',
    'verifier_label',
    'schema_shape_contract',
    'advisor_artifact',
    'advisor_artifact_sha256',
  ]) {
    assert(
      options[required],
      `Missing closeout --${required.replaceAll('_', '-')}`,
    )
  }
  assert(
    options.mode === 'rehearsal' || options.mode === 'production',
    'Closeout --mode must be rehearsal or production',
  )
  if (options.mode === 'production') {
    assert(
      options.approval_record,
      'Production closeout requires --approval-record',
    )
    assert(
      !options.rehearsal_sentinel,
      'Production closeout must not accept a rehearsal sentinel',
    )
  } else {
    assert(
      !options.approval_record,
      'Rehearsal closeout must not accept a Production approval record',
    )
    assert(
      options.rehearsal_sentinel,
      'Rehearsal closeout requires --rehearsal-sentinel',
    )
    validateRehearsalSentinelNonce(options.rehearsal_sentinel)
  }
  assert(
    options.verifier_label === options.verifier_label.trim()
      && options.verifier_label.length <= 200
      && !/[\u0000-\u001f\u007f]/.test(options.verifier_label),
    '--verifier-label must be a non-empty single-line label of at most 200 characters',
  )
  assert(
    /^[0-9a-f]{64}$/.test(options.advisor_artifact_sha256),
    'Closeout --advisor-artifact-sha256 must be a SHA-256',
  )
  return options
}

export function parseCalibrationArguments(args) {
  const options = {}
  for (let index = 0; index < args.length; index += 1) {
    const key = args[index]
    assert(
      [
        '--kit',
        '--stage',
        '--db-url',
        '--evidence',
        '--executor-label',
        '--rehearsal-sentinel',
        '--prior-calibration-manifest',
      ].includes(key),
      `Unknown schema calibration argument: ${key}`,
    )
    assert(index + 1 < args.length, `${key} requires a value`)
    options[key.slice(2).replaceAll('-', '_')] = args[index + 1]
    index += 1
  }
  for (const required of [
    'kit',
    'stage',
    'db_url',
    'evidence',
    'executor_label',
    'rehearsal_sentinel',
  ]) {
    assert(
      options[required],
      `Missing schema calibration --${required.replaceAll('_', '-')}`,
    )
  }
  assert(
    SCHEMA_SHAPE_STAGES.includes(options.stage),
    `Schema calibration --stage must be one of ${SCHEMA_SHAPE_STAGES.join(', ')}`,
  )
  assertReviewedBridgeSequence(options.stage)
  validatePasswordlessDbUrl(options.db_url, 'rehearsal')
  validateRehearsalSentinelNonce(options.rehearsal_sentinel)
  assert(
    options.executor_label === options.executor_label.trim()
      && options.executor_label.length > 0
      && options.executor_label.length <= 200
      && !/[\u0000-\u001f\u007f]/.test(options.executor_label),
    'Schema calibration --executor-label must be a non-empty single-line label',
  )
  if (options.stage === '016') {
    assert(
      !options.prior_calibration_manifest,
      'Baseline 016 calibration must not accept prior calibration evidence',
    )
  } else {
    assert(
      options.prior_calibration_manifest,
      `Schema calibration stage ${options.stage} requires --prior-calibration-manifest`,
    )
  }
  return options
}

async function verifyDisposableRehearsalTarget({
  dbUrl,
  password,
  workdir,
  nonce,
}) {
  const rows = await runQuery({
    dbUrl,
    password,
    mode: 'rehearsal',
    workdir,
    sql: rehearsalSentinelSql(nonce),
  })
  const sentinel = validateRehearsalSentinel(rows)
  return {
    databaseName: sentinel.database_name,
    tableOwner: sentinel.table_owner,
    purpose: REHEARSAL_SENTINEL_PURPOSE,
    nonceSha256: sha256Bytes(Buffer.from(nonce, 'utf8')),
  }
}

async function collectCalibrationSnapshot({
  dbUrl,
  password,
  workdir,
  stage,
  expectedMigrations,
}) {
  const query = (sql) => runQuery({
    dbUrl,
    password,
    mode: 'rehearsal',
    workdir,
    sql,
  })
  const identity = validateIdentity(await query(IDENTITY_SQL), 'rehearsal')
  const ledger = validateLedgerRows(
    await query(LEDGER_SQL),
    expectedMigrations,
    `Calibration stage ${stage} migration ledger`,
  )
  const flags = validateFlags(
    await query(FLAGS_SQL),
    expectedMigrations,
  )
  const catalog = validateCatalog(
    await query(CATALOG_SQL),
    await query(CATALOG_POINTER_SQL),
  )
  const factorAndBoq = validateFactorAndBoq(
    await query(FACTOR_AND_BOQ_SQL),
  )
  const hotfix016 = validateHotfix016(await query(HOTFIX_016_SQL))
  const schemaShape = validateCapturedSchemaShape(
    await query(SCHEMA_SHAPE_SQL),
    `Calibration stage ${stage} schema shape`,
  )
  return {
    capturedAt: new Date().toISOString(),
    identity,
    ledger,
    flags,
    catalog,
    factorAndBoq,
    hotfix016,
    schemaShape,
  }
}

async function collectCalibrationWriteBoundary({
  dbUrl,
  password,
  workdir,
  stage,
  expectedMigrations,
  expectedSchemaShapeFingerprint,
  sentinelNonce,
}) {
  const disposableTarget = await verifyDisposableRehearsalTarget({
    dbUrl,
    password,
    workdir,
    nonce: sentinelNonce,
  })
  const snapshot = await collectCalibrationSnapshot({
    dbUrl,
    password,
    workdir,
    stage,
    expectedMigrations,
  })
  assert(
    snapshot.schemaShape.schema_shape_fingerprint_sha256
      === expectedSchemaShapeFingerprint,
    'Calibration live schema changed at the final write boundary',
  )
  return {
    capturedAt: new Date().toISOString(),
    disposableTarget,
    snapshot,
  }
}

export async function executeSchemaCalibration(options) {
  assertSupabaseCliVersion()
  validatePasswordlessDbUrl(options.db_url, 'rehearsal')
  validateRehearsalSentinelNonce(options.rehearsal_sentinel)
  const stageIndex = SCHEMA_SHAPE_STAGES.indexOf(options.stage)
  assert(stageIndex >= 0, 'Unknown schema calibration stage')
  assertReviewedBridgeSequence(options.stage)
  const migrationPerformed = options.stage !== '016'
  const kitOrdinal = migrationPerformed
    ? options.stage
    : PHASE4_MIGRATIONS[0].ordinal
  const kit = await verifyKit(options.kit, kitOrdinal, 'rehearsal')
  const sourceToolingGitHead = runGit(['rev-parse', 'HEAD'])
  assert(
    sourceToolingGitHead === kit.manifest.sourceGitHead,
    'Schema calibration requires the exact kit source/tooling HEAD',
  )
  const kitManifestSha256 = await sha256File(kit.manifestPath)
  const evidenceRoot = await resolveNewEvidenceDirectory(
    options.evidence,
  )

  let priorCalibration
  if (migrationPerformed) {
    priorCalibration = await loadSchemaCalibrationManifest(
      options.prior_calibration_manifest,
      {
        kit,
        expectedFinalStage:
          SCHEMA_SHAPE_STAGES[stageIndex - 1],
        expectedExecutor: options.executor_label,
      },
    )
  }
  const password = readRehearsalPassword()
  await mkdir(evidenceRoot, { mode: 0o700 })
  const context = {
    schema: 'conduit-boq/master-catalog-p12-schema-calibration-context/v1',
    mode: SCHEMA_CALIBRATION_MODE,
    stage: options.stage,
    sourceToolingGitHead,
    kitManifestPath: kit.manifestPath,
    kitManifestSha256,
    generatorSourceSha256: kit.manifest.generatorSourceSha256,
    runnerSourceSha256: kit.manifest.runnerSourceSha256,
    captureExecutor: options.executor_label,
    priorCalibrationManifestPath: priorCalibration?.path,
    priorCalibrationManifestSha256: priorCalibration?.sha256,
    rehearsalSentinelNonceSha256: sha256Bytes(
      Buffer.from(options.rehearsal_sentinel, 'utf8'),
    ),
    migrationPerformed,
    automaticNextStep: false,
    productionAuthorized: false,
  }
  await writeEvidenceFile(
    evidenceRoot,
    '00-calibration-context.json',
    context,
  )

  const workdir = kit.stepRoot
  const expectedBefore = migrationPerformed
    ? kit.step.expectedRemoteBefore
    : HISTORICAL_MIGRATIONS
  const expectedAfter = migrationPerformed
    ? kit.step.expectedRemoteAfter
    : HISTORICAL_MIGRATIONS
  const disposableTarget = await verifyDisposableRehearsalTarget({
    dbUrl: options.db_url,
    password,
    workdir,
    nonce: options.rehearsal_sentinel,
  })
  const preflight = await collectCalibrationSnapshot({
    dbUrl: options.db_url,
    password,
    workdir,
    stage: schemaStageBeforeStep(
      migrationPerformed
        ? options.stage
        : PHASE4_MIGRATIONS[0].ordinal,
    ),
    expectedMigrations: expectedBefore,
  })
  preflight.disposableTarget = disposableTarget
  if (priorCalibration) {
    const priorSnapshot = priorCalibration.capture.snapshot
    assert(
      preflight.schemaShape.schema_shape_fingerprint_sha256
        === priorCalibration.manifest.fingerprints[
          SCHEMA_SHAPE_STAGES[stageIndex - 1]
        ],
      'Live calibration schema differs from prior chained evidence',
    )
    assertCatalogUnchanged(priorSnapshot.catalog, preflight.catalog)
    assertFactorAndBoqUnchanged(
      priorSnapshot.factorAndBoq,
      preflight.factorAndBoq,
    )
    assertHotfix016Unchanged(
      priorSnapshot.hotfix016,
      preflight.hotfix016,
    )
  }
  await writeEvidenceFile(
    evidenceRoot,
    '01-calibration-preflight.json',
    preflight,
  )

  let migrationResult = {
    code: 0,
    signal: null,
    timedOut: false,
    hardKilled: false,
    stdout: '',
    stderr: '',
  }
  let processError
  let finalWriteBoundary
  const startedAt = new Date().toISOString()
  if (migrationPerformed) {
    const finalKit = await verifyKit(
      options.kit,
      options.stage,
      'rehearsal',
    )
    assert(
      await sha256File(finalKit.manifestPath)
        === kitManifestSha256,
      'Calibration kit changed after preflight',
    )
    assert(
      runGit(['rev-parse', 'HEAD']) === sourceToolingGitHead,
      'Calibration source/tooling HEAD changed after preflight',
    )
    const finalPriorCalibration =
      await loadSchemaCalibrationManifest(
        options.prior_calibration_manifest,
        {
          expectedSha256: priorCalibration.sha256,
          kit: finalKit,
          expectedFinalStage:
            SCHEMA_SHAPE_STAGES[stageIndex - 1],
          expectedExecutor: options.executor_label,
        },
      )
    assert(
      finalPriorCalibration.sha256 === priorCalibration.sha256,
      'Prior calibration evidence changed after preflight',
    )

    // LAST AWAITED OPERATION BEFORE SPAWN: this rechecks the isolated
    // sentinel, exact ledger/flags/catalog/Factor F/hotfix, and live schema.
    // No local or external evidence check may be inserted below this boundary.
    finalWriteBoundary = await collectCalibrationWriteBoundary({
        dbUrl: options.db_url,
        password,
        workdir: finalKit.stepRoot,
        stage: options.stage,
        expectedMigrations: finalKit.step.expectedRemoteBefore,
        expectedSchemaShapeFingerprint:
          preflight.schemaShape.schema_shape_fingerprint_sha256,
        sentinelNonce: options.rehearsal_sentinel,
      })
    try {
      migrationResult = await runCapturedProcess(
        LOCAL_SUPABASE_CLI,
        buildSupabaseMigrationArgs({
          dbUrl: options.db_url,
          workdir: finalKit.stepRoot,
        }),
        {
          password,
          mode: 'rehearsal',
          timeoutMs: CLIENT_TIMEOUT_SECONDS * 1000,
        },
      )
    } catch (error) {
      processError = redactSensitiveText(
        error.message,
        [password, options.rehearsal_sentinel],
      )
      migrationResult = {
        code: null,
        signal: null,
        timedOut: false,
        hardKilled: false,
        stdout: '',
        stderr: '',
      }
    }
  }
  const finishedAt = new Date().toISOString()
  const safeStdout = redactSensitiveText(
    migrationResult.stdout,
    [password, options.rehearsal_sentinel],
  )
  const safeStderr = redactSensitiveText(
    migrationResult.stderr,
    [password, options.rehearsal_sentinel],
  )

  let capturedSnapshot
  let captureError
  try {
    capturedSnapshot = migrationPerformed
      ? await collectCalibrationSnapshot({
        dbUrl: options.db_url,
        password,
        workdir,
        stage: options.stage,
        expectedMigrations: expectedAfter,
      })
      : preflight
    assertCatalogUnchanged(preflight.catalog, capturedSnapshot.catalog)
    assertFactorAndBoqUnchanged(
      preflight.factorAndBoq,
      capturedSnapshot.factorAndBoq,
    )
    assertHotfix016Unchanged(
      preflight.hotfix016,
      capturedSnapshot.hotfix016,
    )
    if (migrationPerformed) {
      capturedSnapshot.disposableTarget =
        await verifyDisposableRehearsalTarget({
          dbUrl: options.db_url,
          password,
          workdir,
          nonce: options.rehearsal_sentinel,
        })
    }
  } catch (error) {
    captureError = redactSensitiveText(
      error.message,
      [password, options.rehearsal_sentinel],
    )
  }
  const cleanCliExit =
    migrationResult.code === 0
    && !migrationResult.timedOut
    && !migrationResult.hardKilled
    && !processError
  const calibrationSuccess = Boolean(
    cleanCliExit && capturedSnapshot && !captureError,
  )
  const fingerprints = {
    ...(priorCalibration?.manifest.fingerprints ?? {}),
    ...(capturedSnapshot
      ? {
        [options.stage]:
          capturedSnapshot.schemaShape
            .schema_shape_fingerprint_sha256,
      }
      : {}),
  }
  const outcome = {
    startedAt,
    finishedAt,
    calibrationSuccess,
    migrationPerformed,
    cliExitCode: migrationResult.code,
    timedOut: migrationResult.timedOut,
    hardKilledAfterGrace: migrationResult.hardKilled,
    processError,
    captureError,
    uncertainOutcome: !calibrationSuccess,
    automaticNextStep: false,
    productionAuthorized: false,
    operatorInstruction: calibrationSuccess
      ? 'Stop. Review this one-stage calibration evidence and invoke the next frozen stage manually.'
      : 'Hard stop. Calibration evidence is incomplete and cannot be used for a schema contract.',
  }
  const calibrationWriteBoundary = migrationPerformed
    ? {
      ...finalWriteBoundary,
      stage: options.stage,
      migrationPerformed: true,
      skipped: false,
      automaticNextStep: false,
      productionAuthorized: false,
    }
    : {
      capturedAt: preflight.capturedAt,
      stage: options.stage,
      migrationPerformed: false,
      skipped: true,
      automaticNextStep: false,
      productionAuthorized: false,
    }
  let evidenceManifest
  try {
    // Persist the calibration after-state first; no evidence write after the
    // isolated CLI invocation may suppress the capture attempt above.
    await writeEvidenceFile(
      evidenceRoot,
      '03-schema-capture.json',
      {
        capturedAt:
          capturedSnapshot?.capturedAt ?? new Date().toISOString(),
        stage: options.stage,
        fingerprints,
        snapshot: capturedSnapshot,
        captureError,
      },
    )
    await writeEvidenceFile(
      evidenceRoot,
      '01-calibration-write-boundary.json',
      calibrationWriteBoundary,
    )
    await writeEvidenceFile(
      evidenceRoot,
      '02-calibration-cli-output.json',
      {
        startedAt,
        finishedAt,
        migrationPerformed,
        stdout: safeStdout,
        stderr: safeStderr,
        processError,
      },
    )
    await writeEvidenceFile(
      evidenceRoot,
      '04-calibration-outcome.json',
      outcome,
    )
    evidenceManifest = await writeSchemaCalibrationManifest(
      evidenceRoot,
      context,
      fingerprints,
    )
  } catch (error) {
    throw new Error(
      [
        'Schema calibration evidence persistence failed after the isolated after-state attempt.',
        'The evidence cannot authorize a schema contract or Production.',
        redactSensitiveText(
          error.message,
          [password, options.rehearsal_sentinel],
        ),
      ].join(' '),
    )
  }
  if (!calibrationSuccess) {
    throw new Error(
      `Schema calibration failed and cannot authorize Production; evidence manifest: ${evidenceManifest.path}`,
    )
  }
  writePostCommitNotice(
    [
      `Schema calibration stage ${options.stage} completed on the isolated rehearsal target.`,
      `Evidence manifest: ${evidenceManifest.path}`,
      `Evidence manifest SHA-256: ${evidenceManifest.sha256}`,
      'Stop. No next stage ran automatically. This evidence cannot authorize Production.',
      '',
    ].join('\n'),
  )
  return {
    evidenceRoot,
    evidenceManifest,
    outcome,
    capturedSnapshot,
  }
}

async function collectWriteBoundary({
  dbUrl,
  password,
  mode,
  workdir,
  expectedMigrations,
  expectedCatalog,
  expectedFactorAndBoq,
  expectedHotfix016,
  approval,
  sentinelNonce,
}) {
  const boundaryRows = await runQuery({
    dbUrl,
    password,
    mode,
    workdir,
    sql: writeBoundarySql(
      mode === 'rehearsal' ? sentinelNonce : undefined,
    ),
  })
  assert(
    boundaryRows.length === 1,
    'Immediate pre-write boundary must return exactly one MVCC row',
  )
  return {
    capturedAt: new Date().toISOString(),
    ...validateWriteBoundaryRow({
      boundary: boundaryRows[0],
      mode,
      expectedMigrations,
      expectedCatalog,
      expectedFactorAndBoq,
      expectedHotfix016,
      approval,
    }),
  }
}

export function validateWriteBoundaryRow({
  boundary,
  mode,
  expectedMigrations,
  expectedCatalog,
  expectedFactorAndBoq,
  expectedHotfix016,
  approval = undefined,
}) {
  assertPlainObject(boundary, 'Immediate pre-write boundary row')
  const disposableTarget = mode === 'rehearsal'
    ? validateRehearsalSentinel([boundary.disposable_target])
    : undefined
  const identity = validateIdentity([boundary.identity], mode)
  const ledger = validateLedgerRows(
    boundary.ledger,
    expectedMigrations,
    'Immediate pre-write migration ledger',
  )
  const flags = validateFlags(
    boundary.flags,
    expectedMigrations,
  )
  const catalog = validateCatalog(
    [boundary.catalog],
    [boundary.catalog_pointer],
  )
  assertCatalogUnchanged(expectedCatalog, catalog)
  if (approval) {
    assertApprovedCatalogFingerprint(catalog, approval)
  }
  const factorAndBoq = validateFactorAndBoq([
    boundary.factor_and_boq,
  ])
  assertFactorAndBoqUnchanged(
    expectedFactorAndBoq,
    factorAndBoq,
  )
  const hotfix016 = validateHotfix016([boundary.hotfix016])
  assertHotfix016Unchanged(expectedHotfix016, hotfix016)
  return {
    disposableTarget,
    identity,
    ledger,
    flags,
    catalog,
    factorAndBoq,
    hotfix016,
  }
}

function assertFinalCloseoutSnapshotMatches(step025Postflight, liveSnapshot) {
  assert(
    canonicalJson(liveSnapshot.ledger)
      === canonicalJson(step025Postflight.ledger),
    'Live final-closeout ledger differs from step 025 postflight',
  )
  assert(
    canonicalJson(liveSnapshot.flags)
      === canonicalJson(step025Postflight.flags),
    'Live final-closeout feature flags differ from step 025 postflight',
  )
  assertCatalogUnchanged(
    step025Postflight.catalog,
    liveSnapshot.catalog,
  )
  assertFactorAndBoqUnchanged(
    step025Postflight.factorAndBoq,
    liveSnapshot.factorAndBoq,
  )
  assertHotfix016Unchanged(
    step025Postflight.hotfix016,
    liveSnapshot.hotfix016,
  )
  assert(
    canonicalJson(liveSnapshot.schemaShape)
      === canonicalJson(step025Postflight.schemaShape),
    'Live final-closeout schema shape differs from step 025 postflight',
  )
  assert(
    canonicalJson(liveSnapshot.ownershipAndAclInventory)
      === canonicalJson(step025Postflight.ownershipAndAclInventory),
    'Live final-closeout ownership/ACL/RLS inventory differs from step 025 postflight',
  )
}

async function writeFinalCloseoutEvidenceManifest(
  evidenceRoot,
  context,
) {
  const evidenceFiles = (await readdir(evidenceRoot))
    .filter((name) => name !== '05-closeout-evidence-manifest.json')
    .sort()
  const files = {}
  for (const name of evidenceFiles) {
    const path = join(evidenceRoot, name)
    const stats = await lstat(path)
    assert(
      stats.isFile() && !stats.isSymbolicLink(),
      `Closeout evidence entry must be a regular file: ${name}`,
    )
    files[name] = await sha256File(path)
  }
  const manifest = {
    schema: FINAL_CLOSEOUT_EVIDENCE_MANIFEST_SCHEMA,
    createdAt: new Date().toISOString(),
    mode: context.mode,
    gitHead: context.gitHead,
    kitManifestSha256: context.kitManifestSha256,
    step025EvidenceManifestSha256:
      context.step025EvidenceManifestSha256,
    finalCloseoutSignoffSha256:
      context.finalCloseoutSignoffSha256,
    p13Authorized: false,
    files,
  }
  return publishEvidenceManifestCommit(
    evidenceRoot,
    '05-closeout-evidence-manifest.json',
    manifest,
  )
}

export async function executeP12FinalCloseout(options) {
  assertSupabaseCliVersion()
  validatePasswordlessDbUrl(options.db_url, options.mode)
  assert(
    typeof options.verifier_label === 'string'
      && options.verifier_label.trim() === options.verifier_label
      && options.verifier_label.length > 0,
    'Final closeout requires an exact --verifier-label',
  )
  if (options.mode === 'rehearsal') {
    validateRehearsalSentinelNonce(options.rehearsal_sentinel)
  }

  const kit = await verifyKit(options.kit, '025', options.mode)
  const evidenceRoot = await resolveNewEvidenceDirectory(options.evidence)
  const kitManifestSha256 = await sha256File(kit.manifestPath)

  let approval
  let approvalPath
  let approvalRecordSha256
  let gitHead = runGit(['rev-parse', 'HEAD'])
  if (options.mode === 'production') {
    const loadedApproval = await loadApprovalRecord(
      options.approval_record,
    )
    approval = loadedApproval.record
    approvalPath = loadedApproval.path
    approvalRecordSha256 = loadedApproval.sha256
  }
  const schemaShapeContract = await loadSchemaShapeContract(
    options.schema_shape_contract,
    {
      kit,
      expectedSha256: approval?.schemaShapeContractSha256,
    },
  )
  let pass2VerificationEvidence
  if (approval) {
    gitHead = verifyProductionGitGuards(
      kit.manifest,
      approval,
      schemaShapeContract,
    )
    pass2VerificationEvidence =
      await loadPass2VerificationEvidenceManifest(
        approval.pass2VerificationEvidenceManifestPath,
        approval.pass2VerificationEvidenceManifestSha256,
        {
          kit,
          schemaShapeContract,
          approval,
        },
      )
    assertMaintenanceWindowBudget(approval, {
      minimumRemainingMs: FINAL_CLOSEOUT_WINDOW_BUDGET_MS,
      windowPhase: 'Initial final-closeout boundary',
    })
  }
  const advisorArtifact = await loadBoundAdvisorArtifact(
    options.advisor_artifact,
    options.advisor_artifact_sha256,
  )
  assertReviewedExecutionBindings({
    schemaShapeContract,
    approval,
  })
  if (!approval) {
    assert(
      gitHead === schemaShapeContract.record.sourceToolingGitHead,
      'Verifying rehearsal must run at the contract source/tooling HEAD',
    )
  }

  const finalCloseoutSignoff = await loadFinalCloseoutSignoff(
    options.final_signoff,
    {
      mode: options.mode,
      currentHead: gitHead,
      kitManifestSha256,
      objectTargets: kit.step.objectTargetsAfter,
      approval,
      approvalRecordSha256,
      schemaShapeContract,
      advisorArtifact,
    },
  )
  assert(
    finalCloseoutSignoff.signoff.independentVerifier
      === options.verifier_label,
    '--verifier-label differs from the final closeout signoff',
  )
  const {
    resolvedPath: cliStep025EvidenceManifestPath,
  } = await resolveExistingExternalPath(
    options.step_025_evidence_manifest,
    'CLI step 025 evidence manifest',
    'file',
  )
  assert(
    cliStep025EvidenceManifestPath
      === finalCloseoutSignoff.step025Evidence.path,
    '--step-025-evidence-manifest differs from the final closeout signoff',
  )

  const password = options.mode === 'production'
    ? readProductionPassword()
    : readRehearsalPassword()
  await mkdir(evidenceRoot, { mode: 0o700 })
  const closeoutContext = {
    schema: 'conduit-boq/master-catalog-p12-final-closeout-evidence/v1',
    mode: options.mode,
    gitHead,
    applicationCandidate: APPLICATION_CANDIDATE,
    kitManifestSha256,
    approvalRecordPath: approvalPath,
    approvalRecordSha256,
    ownerApprovalReference: approval?.ownerApprovalReference,
    approvedCatalogAuthorityFingerprintSha256:
      approval?.catalogAuthorityFingerprintSha256,
    schemaShapeContractPath: schemaShapeContract.path,
    schemaShapeContractSha256: schemaShapeContract.sha256,
    sourceToolingGitHead:
      schemaShapeContract.record.sourceToolingGitHead,
    pass1EvidenceManifestPath:
      schemaShapeContract.pass1Evidence.path,
    pass1EvidenceManifestSha256:
      schemaShapeContract.pass1Evidence.sha256,
    pass2VerificationEvidenceManifestPath:
      pass2VerificationEvidence?.path,
    pass2VerificationEvidenceManifestSha256:
      pass2VerificationEvidence?.sha256,
    expectedSchemaShapeSha256:
      expectedSchemaShapeFingerprint(schemaShapeContract, '025'),
    advisorArtifactPath: advisorArtifact.path,
    advisorArtifactSha256: advisorArtifact.sha256,
    advisorArtifactBytes: advisorArtifact.bytes,
    advisorArtifactCapturedAt:
      finalCloseoutSignoff.signoff.advisorArtifactCapturedAt,
    step025EvidenceManifestPath:
      finalCloseoutSignoff.step025Evidence.path,
    step025EvidenceManifestSha256:
      finalCloseoutSignoff.step025Evidence.sha256,
    finalCloseoutSignoffPath: finalCloseoutSignoff.path,
    finalCloseoutSignoffSha256: finalCloseoutSignoff.sha256,
    step025Executor:
      finalCloseoutSignoff.signoff.step025Executor,
    independentVerifier: options.verifier_label,
    rehearsalSentinelNonceSha256: options.rehearsal_sentinel
      ? sha256Bytes(Buffer.from(options.rehearsal_sentinel, 'utf8'))
      : undefined,
    supabaseCliVersion: REQUIRED_SUPABASE_CLI_VERSION,
    postgresMajor: REQUIRED_POSTGRES_MAJOR,
    readOnly: true,
    migrationPerformed: false,
    p13Authorized: false,
    automaticNextStep: false,
  }
  await writeEvidenceFile(
    evidenceRoot,
    '00-closeout-context.json',
    closeoutContext,
  )

  let liveSnapshot
  let closeoutError
  try {
    const immediateKit = await verifyKit(
      options.kit,
      '025',
      options.mode,
    )
    assert(
      await sha256File(immediateKit.manifestPath)
        === kitManifestSha256,
      'Kit manifest changed before final-closeout live boundary',
    )
    if (approval) {
      const immediateApproval = await loadApprovalRecord(
        options.approval_record,
      )
      assert(
        immediateApproval.sha256 === approvalRecordSha256,
        'P-12 approval changed before final-closeout live boundary',
      )
      gitHead = verifyProductionGitGuards(
        immediateKit.manifest,
        approval,
        schemaShapeContract,
      )
      assertMaintenanceWindowBudget(approval, {
        minimumRemainingMs: FINAL_CLOSEOUT_WINDOW_BUDGET_MS,
        windowPhase: 'Immediate final-closeout live boundary',
      })
    } else {
      assert(
        runGit(['rev-parse', 'HEAD']) === gitHead,
        'Git HEAD changed before rehearsal final-closeout live boundary',
      )
    }
    const immediateSchemaShapeContract = await loadSchemaShapeContract(
      options.schema_shape_contract,
      {
        kit: immediateKit,
        expectedSha256: schemaShapeContract.sha256,
      },
    )
    const immediateAdvisorArtifact = await loadBoundAdvisorArtifact(
      options.advisor_artifact,
      advisorArtifact.sha256,
    )
    assertReviewedExecutionBindings({
      schemaShapeContract: immediateSchemaShapeContract,
      approval,
    })
    if (approval) {
      const immediatePass2VerificationEvidence =
        await loadPass2VerificationEvidenceManifest(
          approval.pass2VerificationEvidenceManifestPath,
          approval.pass2VerificationEvidenceManifestSha256,
          {
            kit: immediateKit,
            schemaShapeContract: immediateSchemaShapeContract,
            approval,
          },
        )
      assert(
        immediatePass2VerificationEvidence.sha256
          === pass2VerificationEvidence.sha256,
        'Pass-2 verification evidence changed before final closeout',
      )
    }
    const immediateSignoff = await loadFinalCloseoutSignoff(
      options.final_signoff,
      {
        mode: options.mode,
        currentHead: gitHead,
        kitManifestSha256,
        objectTargets: immediateKit.step.objectTargetsAfter,
        approval,
        approvalRecordSha256,
        schemaShapeContract: immediateSchemaShapeContract,
        advisorArtifact: immediateAdvisorArtifact,
      },
    )
    assert(
      immediateSignoff.sha256 === finalCloseoutSignoff.sha256,
      'Final closeout signoff changed before the live boundary',
    )

    const disposableTarget = options.mode === 'rehearsal'
      ? await verifyDisposableRehearsalTarget({
        dbUrl: options.db_url,
        password,
        workdir: immediateKit.stepRoot,
        nonce: options.rehearsal_sentinel,
      })
      : undefined
    liveSnapshot = await collectSnapshot({
      dbUrl: options.db_url,
      password,
      mode: options.mode,
      step: '025',
      workdir: immediateKit.stepRoot,
      expectedMigrations: [
        ...HISTORICAL_MIGRATIONS,
        ...PHASE4_MIGRATIONS,
      ],
      expectedSchemaShapeFingerprint:
        expectedSchemaShapeFingerprint(schemaShapeContract, '025'),
      objectTargets: immediateKit.step.objectTargetsAfter,
    })
    liveSnapshot.disposableRehearsalTarget = disposableTarget
    assertFinalCloseoutSnapshotMatches(
      finalCloseoutSignoff.step025Evidence.postflight,
      liveSnapshot,
    )
    if (approval) {
      assertApprovedCatalogFingerprint(liveSnapshot.catalog, approval)
    }
    if (options.mode === 'rehearsal') {
      liveSnapshot.disposableRehearsalTargetAfter =
        await verifyDisposableRehearsalTarget({
          dbUrl: options.db_url,
          password,
          workdir: immediateKit.stepRoot,
          nonce: options.rehearsal_sentinel,
        })
    }

    const completedSchemaShapeContract = await loadSchemaShapeContract(
      options.schema_shape_contract,
      {
        kit: immediateKit,
        expectedSha256: schemaShapeContract.sha256,
      },
    )
    const completedAdvisorArtifact = await loadBoundAdvisorArtifact(
      options.advisor_artifact,
      advisorArtifact.sha256,
    )
    const completedSignoff = await loadFinalCloseoutSignoff(
      options.final_signoff,
      {
        mode: options.mode,
        currentHead: gitHead,
        kitManifestSha256,
        objectTargets: immediateKit.step.objectTargetsAfter,
        approval,
        approvalRecordSha256,
        schemaShapeContract: completedSchemaShapeContract,
        advisorArtifact: completedAdvisorArtifact,
      },
    )
    assert(
      completedSignoff.sha256 === finalCloseoutSignoff.sha256,
      'Final closeout signoff changed during the live boundary',
    )
    if (approval) {
      verifyProductionGitGuards(
        immediateKit.manifest,
        approval,
        schemaShapeContract,
      )
      assertMaintenanceWindowBudget(approval, {
        minimumRemainingMs: 0,
        windowPhase: 'Completed final-closeout boundary',
      })
    } else {
      assert(
        runGit(['rev-parse', 'HEAD']) === gitHead,
        'Git HEAD changed during rehearsal final closeout',
      )
    }
    await writeEvidenceFile(
      evidenceRoot,
      '01-live-closeout-snapshot.json',
      liveSnapshot,
    )
  } catch (error) {
    closeoutError = redactSensitiveText(
      error.message,
      [password, options.rehearsal_sentinel],
    )
    const completeFailureSnapshot =
      error.completeReadOnlySnapshot
      ?? (liveSnapshot
        ? {
          capturedAt: liveSnapshot.capturedAt,
          complete: true,
          validatedSnapshot: liveSnapshot,
        }
        : undefined)
    await writeEvidenceFile(
      evidenceRoot,
      '01-live-closeout-unavailable.json',
      {
        capturedAt: new Date().toISOString(),
        error: closeoutError,
        completeReadOnlySnapshot:
          completeFailureSnapshot,
        finalCloseoutVerified: false,
        migrationPerformed: false,
        p13Authorized: false,
        automaticNextStep: false,
      },
    )
  }

  const finalCloseoutVerified = Boolean(
    liveSnapshot && !closeoutError,
  )
  const outcome = {
    finishedAt: new Date().toISOString(),
    finalCloseoutVerified,
    independentVerifier:
      finalCloseoutSignoff.signoff.independentVerifier,
    independentVerificationCompleted:
      finalCloseoutSignoff.signoff.independentVerificationCompleted,
    securityContractReviewed:
      finalCloseoutSignoff.signoff.securityContractReviewed,
    advisorDeltaTriaged:
      finalCloseoutSignoff.signoff.advisorDeltaTriaged,
    liveBoundaryRechecked: finalCloseoutVerified,
    step025EvidenceConsumed: true,
    finalSignoffConsumed: true,
    readOnly: true,
    migrationPerformed: false,
    phase4FlagsRemainFalse: finalCloseoutVerified,
    p13Authorized: false,
    automaticNextStep: false,
    closeoutError,
    operatorInstruction: finalCloseoutVerified
      ? 'P-12 execution evidence closeout is complete. Stop: P-13 remains a separate Owner decision.'
      : 'Hard stop. P-12 final closeout is not verified; do not infer P-13 approval.',
  }
  await writeEvidenceFile(
    evidenceRoot,
    '02-closeout-outcome.json',
    outcome,
  )
  const evidenceManifest = await writeFinalCloseoutEvidenceManifest(
    evidenceRoot,
    closeoutContext,
  )

  if (!finalCloseoutVerified) {
    throw new Error(
      `P-12 final closeout is not verified; evidence manifest: ${evidenceManifest.path}`,
    )
  }

  writePostCommitNotice(
    [
      'P-12 final independent-verifier closeout completed.',
      `Evidence: ${evidenceRoot}`,
      `Evidence manifest SHA-256: ${evidenceManifest.sha256}`,
      'No migration was applied. This does not authorize P-13.',
      '',
    ].join('\n'),
  )
  return {
    evidenceRoot,
    evidenceManifest,
    outcome,
    liveSnapshot,
  }
}

export async function executeP12Step(options) {
  assertSupabaseCliVersion()
  validatePasswordlessDbUrl(options.db_url, options.mode)
  assertReviewedBridgeSequence(options.step)
  assert(
    typeof options.executor_label === 'string'
      && options.executor_label.trim() === options.executor_label
      && options.executor_label.length > 0,
    'Execution requires an exact --executor-label',
  )
  if (options.mode === 'rehearsal') {
    validateRehearsalSentinelNonce(options.rehearsal_sentinel)
  }
  if (options.step !== '017') {
    assert(
      options.prior_step_signoff,
      `Step ${options.step} requires a prior-step verifier signoff`,
    )
  }

  const kit = await verifyKit(options.kit, options.step, options.mode)
  const evidenceRoot = await resolveNewEvidenceDirectory(options.evidence)
  const kitManifestSha256 = await sha256File(kit.manifestPath)

  let approval
  let approvalPath
  let approvalRecordSha256
  let gitHead = runGit(['rev-parse', 'HEAD'])
  if (options.mode === 'production') {
    const loaded = await loadApprovalRecord(options.approval_record)
    approval = loaded.record
    approvalPath = loaded.path
    approvalRecordSha256 = loaded.sha256
  }
  const schemaShapeContract = await loadSchemaShapeContract(
    options.schema_shape_contract,
    {
      kit,
      expectedSha256: approval?.schemaShapeContractSha256,
    },
  )
  let pass2VerificationEvidence
  if (approval) {
    gitHead = verifyProductionGitGuards(
      kit.manifest,
      approval,
      schemaShapeContract,
    )
    pass2VerificationEvidence =
      await loadPass2VerificationEvidenceManifest(
        approval.pass2VerificationEvidenceManifestPath,
        approval.pass2VerificationEvidenceManifestSha256,
        {
          kit,
          schemaShapeContract,
          approval,
        },
      )
    assert(
      options.executor_label === approval.executor,
      '--executor-label does not match the committed P-12 executor',
    )
    assertMaintenanceWindowBudget(approval, {
      minimumRemainingMs: INITIAL_WINDOW_BUDGET_MS,
      windowPhase: 'Initial production preflight',
    })
  }
  const advisorArtifact = await loadBoundAdvisorArtifact(
    options.advisor_artifact,
    options.advisor_artifact_sha256,
  )
  assertReviewedExecutionBindings({
    schemaShapeContract,
    approval,
    executorLabel: options.executor_label,
  })
  if (!approval) {
    assert(
      gitHead === schemaShapeContract.record.sourceToolingGitHead,
      'Verifying rehearsal must run at the contract source/tooling HEAD',
    )
  }
  if (approval && options.step === '017') {
    assertApprovalBaselineAdvisor(approval, advisorArtifact)
  }

  let priorStepSignoff
  if (options.step !== '017') {
    priorStepSignoff = await loadPriorStepSignoff(
      options.prior_step_signoff,
      {
        currentStep: options.step,
        currentHead: gitHead,
        kitManifestSha256,
        approval,
        approvalRecordSha256,
        schemaShapeContract,
        advisorArtifact,
      },
    )
  }

  const password = options.mode === 'production'
    ? readProductionPassword()
    : readRehearsalPassword()

  await mkdir(evidenceRoot, { mode: 0o700 })
  const evidenceContext = {
    schema: 'conduit-boq/master-catalog-p12-cli-evidence/v1',
    mode: options.mode,
    step: options.step,
    gitHead,
    applicationCandidate: APPLICATION_CANDIDATE,
    kitManifestSha256,
    approvalRecordPath: approvalPath,
    approvalRecordSha256,
    ownerApprovalReference: approval?.ownerApprovalReference,
    approvedCatalogAuthorityFingerprintSha256:
      approval?.catalogAuthorityFingerprintSha256,
    schemaShapeContractPath: schemaShapeContract.path,
    schemaShapeContractSha256: schemaShapeContract.sha256,
    sourceToolingGitHead:
      schemaShapeContract.record.sourceToolingGitHead,
    pass1EvidenceManifestPath:
      schemaShapeContract.pass1Evidence.path,
    pass1EvidenceManifestSha256:
      schemaShapeContract.pass1Evidence.sha256,
    pass2VerificationEvidenceManifestPath:
      pass2VerificationEvidence?.path,
    pass2VerificationEvidenceManifestSha256:
      pass2VerificationEvidence?.sha256,
    expectedSchemaShapeBeforeSha256:
      expectedSchemaShapeFingerprint(
        schemaShapeContract,
        schemaStageBeforeStep(options.step),
      ),
    expectedSchemaShapeAfterSha256:
      expectedSchemaShapeFingerprint(
        schemaShapeContract,
        options.step,
      ),
    preStepAdvisorArtifactPath: advisorArtifact.path,
    preStepAdvisorArtifactSha256: advisorArtifact.sha256,
    preStepAdvisorArtifactBytes: advisorArtifact.bytes,
    executor: options.executor_label,
    independentVerifier: approval?.independentVerifier,
    priorStepSignoffPath: priorStepSignoff?.path,
    priorStepSignoffSha256: priorStepSignoff?.sha256,
    rehearsalSentinelNonceSha256: options.rehearsal_sentinel
      ? sha256Bytes(Buffer.from(options.rehearsal_sentinel, 'utf8'))
      : undefined,
    supabaseCliVersion: REQUIRED_SUPABASE_CLI_VERSION,
    postgresMajor: REQUIRED_POSTGRES_MAJOR,
    clientTimeoutSeconds: CLIENT_TIMEOUT_SECONDS,
    automaticNextStep: false,
  }
  await writeEvidenceFile(evidenceRoot, '00-context.json', evidenceContext)

  const disposableRehearsalTarget = options.mode === 'rehearsal'
    ? await verifyDisposableRehearsalTarget({
      dbUrl: options.db_url,
      password,
      workdir: kit.stepRoot,
      nonce: options.rehearsal_sentinel,
    })
    : undefined
  let preflight
  try {
    preflight = await collectSnapshot({
      dbUrl: options.db_url,
      password,
      mode: options.mode,
      step: options.step,
      workdir: kit.stepRoot,
      expectedMigrations: kit.step.expectedRemoteBefore,
      expectedSchemaShapeFingerprint:
        expectedSchemaShapeFingerprint(
          schemaShapeContract,
          schemaStageBeforeStep(options.step),
        ),
      objectTargets: kit.step.objectTargetsBefore,
    })
  } catch (error) {
    await writeEvidenceFile(
      evidenceRoot,
      '01-preflight-unavailable.json',
      {
        capturedAt: new Date().toISOString(),
        error: redactSensitiveText(
          error.message,
          [password, options.rehearsal_sentinel],
        ),
        completeReadOnlySnapshot:
          error.completeReadOnlySnapshot,
        migrationPerformed: false,
        automaticNextStep: false,
      },
    )
    throw error
  }
  if (approval) {
    assertApprovedCatalogFingerprint(preflight.catalog, approval)
  }
  preflight.disposableRehearsalTarget = disposableRehearsalTarget
  await writeEvidenceFile(evidenceRoot, '01-preflight.json', preflight)

  // Re-read every local and external binding before the final database
  // boundary. No preflight result may authorize changed Git, kit, approval,
  // contract, pass-2 evidence, advisor artifact, or verifier signoff state.
  const finalWriteKit = await verifyKit(
    options.kit,
    options.step,
    options.mode,
  )
  assert(
    await sha256File(finalWriteKit.manifestPath) === kitManifestSha256,
    'Kit manifest changed at the final write boundary',
  )
  if (approval) {
    const finalApprovalRecord = await loadApprovalRecord(
      options.approval_record,
    )
    assert(
      finalApprovalRecord.sha256 === approvalRecordSha256,
      'P-12 approval record changed at the final write boundary',
    )
    gitHead = verifyProductionGitGuards(
      finalWriteKit.manifest,
      approval,
      schemaShapeContract,
    )
  } else {
    assert(
      runGit(['rev-parse', 'HEAD']) === gitHead,
      'Git HEAD changed at the final rehearsal write boundary',
    )
  }
  const finalSchemaShapeContract = await loadSchemaShapeContract(
    options.schema_shape_contract,
    {
      kit: finalWriteKit,
      expectedSha256: schemaShapeContract.sha256,
    },
  )
  const finalAdvisorArtifact = await loadBoundAdvisorArtifact(
    options.advisor_artifact,
    advisorArtifact.sha256,
  )
  assertReviewedExecutionBindings({
    schemaShapeContract: finalSchemaShapeContract,
    approval,
    executorLabel: options.executor_label,
  })
  if (approval && options.step === '017') {
    assertApprovalBaselineAdvisor(approval, finalAdvisorArtifact)
  }
  if (approval) {
    const finalPass2VerificationEvidence =
      await loadPass2VerificationEvidenceManifest(
        approval.pass2VerificationEvidenceManifestPath,
        approval.pass2VerificationEvidenceManifestSha256,
        {
          kit: finalWriteKit,
          schemaShapeContract: finalSchemaShapeContract,
          approval,
        },
      )
    assert(
      finalPass2VerificationEvidence.sha256
        === pass2VerificationEvidence.sha256,
      'Pass-2 verification evidence changed before the final write boundary',
    )
  }
  if (options.step !== '017') {
    const finalSignoff = await loadPriorStepSignoff(
      options.prior_step_signoff,
      {
        currentStep: options.step,
        currentHead: gitHead,
        kitManifestSha256,
        approval,
        approvalRecordSha256,
        schemaShapeContract: finalSchemaShapeContract,
        advisorArtifact: finalAdvisorArtifact,
      },
    )
    assert(
      finalSignoff.sha256 === priorStepSignoff.sha256,
      'Prior-step verifier signoff changed at the final write boundary',
    )
  }
  if (approval) {
    assertMaintenanceWindowBudget(approval, {
      minimumRemainingMs: PRE_MIGRATION_WINDOW_BUDGET_MS,
      windowPhase: 'Immediate pre-migration boundary',
    })
  }

  const startedAt = new Date().toISOString()
  process.stdout.write(
    `Preflight passed. Applying exactly migration ${options.step}; no later step will run automatically.\n`,
  )
  // LAST AWAITED OPERATION BEFORE SPAWN: all Git/kit/approval/contract/
  // pass-2/advisor/signoff/budget checks above are complete. This single
  // database boundary rechecks role, ledger, flags, operational catalog,
  // BOQ/Factor F, and hotfix 016 in one final MVCC statement;
  // runCapturedProcess spawns immediately.
  const writeBoundary = await collectWriteBoundary({
    dbUrl: options.db_url,
    password,
    mode: options.mode,
    workdir: finalWriteKit.stepRoot,
    expectedMigrations: finalWriteKit.step.expectedRemoteBefore,
    expectedCatalog: preflight.catalog,
    expectedFactorAndBoq: preflight.factorAndBoq,
    expectedHotfix016: preflight.hotfix016,
    approval,
    sentinelNonce: options.rehearsal_sentinel,
  })
  preflight.immediateWriteBoundary = writeBoundary
  let migrationResult
  let processError
  try {
    migrationResult = await runCapturedProcess(
      LOCAL_SUPABASE_CLI,
      buildSupabaseMigrationArgs({
        dbUrl: options.db_url,
        workdir: finalWriteKit.stepRoot,
      }),
      {
        password,
        mode: options.mode,
        timeoutMs: CLIENT_TIMEOUT_SECONDS * 1000,
      },
    )
  } catch (error) {
    processError = redactSensitiveText(
      error.message,
      [password, options.rehearsal_sentinel],
    )
    migrationResult = {
      code: null,
      signal: null,
      timedOut: false,
      hardKilled: false,
      stdout: '',
      stderr: '',
    }
  }
  const finishedAt = new Date().toISOString()
  const sensitiveValues = [password, options.rehearsal_sentinel]
  const safeStdout = redactSensitiveText(
    migrationResult.stdout,
    sensitiveValues,
  )
  const safeStderr = redactSensitiveText(
    migrationResult.stderr,
    sensitiveValues,
  )

  let postflight
  let postflightError
  let postMigrationWindowValid = true
  let postMigrationWindowError
  let completeFailureSnapshot
  if (approval) {
    try {
      assertMaintenanceWindowBudget(approval, {
        minimumRemainingMs: POSTFLIGHT_BUDGET_MS,
        windowPhase: 'Immediate post-migration boundary',
      })
    } catch (error) {
      postMigrationWindowValid = false
      postMigrationWindowError = redactSensitiveText(
        error.message,
        sensitiveValues,
      )
    }
  }
  if (postMigrationWindowValid) {
    try {
      // Attempt the complete bounded read-only after-state before any
      // post-CLI evidence write. Production does not start this query set
      // without the full approved postflight budget; a separately authorized
      // forensic reconciliation is required if that budget is already gone.
      postflight = await collectSnapshot({
        dbUrl: options.db_url,
        password,
        mode: options.mode,
        step: options.step,
        workdir: finalWriteKit.stepRoot,
        expectedMigrations: finalWriteKit.step.expectedRemoteAfter,
        expectedSchemaShapeFingerprint:
          expectedSchemaShapeFingerprint(
            schemaShapeContract,
            options.step,
          ),
        objectTargets: finalWriteKit.step.objectTargetsAfter,
      })
      assertFactorAndBoqUnchanged(
        preflight.factorAndBoq,
        postflight.factorAndBoq,
      )
      assertCatalogUnchanged(preflight.catalog, postflight.catalog)
      if (approval) {
        assertApprovedCatalogFingerprint(postflight.catalog, approval)
      }
      assertHotfix016Unchanged(preflight.hotfix016, postflight.hotfix016)
      if (options.mode === 'rehearsal') {
        postflight.disposableRehearsalTarget =
          await verifyDisposableRehearsalTarget({
            dbUrl: options.db_url,
            password,
            workdir: finalWriteKit.stepRoot,
            nonce: options.rehearsal_sentinel,
          })
      }
    } catch (error) {
      postflightError = redactSensitiveText(
        error.message,
        sensitiveValues,
      )
      completeFailureSnapshot =
        error.completeReadOnlySnapshot
        ?? (postflight
          ? {
            capturedAt: postflight.capturedAt,
            complete: true,
            validatedSnapshot: postflight,
          }
          : undefined)
    }
  } else {
    postflightError = postMigrationWindowError
  }
  if (approval && postflight) {
    try {
      assertMaintenanceWindowBudget(approval, {
        minimumRemainingMs: 0,
        windowPhase: 'Completed postflight boundary',
      })
    } catch (error) {
      postMigrationWindowValid = false
      const finalWindowError = redactSensitiveText(
        error.message,
        sensitiveValues,
      )
      postMigrationWindowError = postMigrationWindowError
        ? `${postMigrationWindowError}; ${finalWindowError}`
        : finalWindowError
    }
  }

  // Persist the after-state first. Evidence media can still fail externally,
  // but no local evidence write is allowed to prevent the bounded read-only
  // reconciliation attempt after a native CLI invocation.
  try {
    if (postflight && !postflightError) {
      await writeEvidenceFile(
        evidenceRoot,
        '03-postflight.json',
        postflight,
      )
    } else {
      await writeEvidenceFile(
        evidenceRoot,
        '03-postflight-unavailable.json',
        {
          capturedAt: new Date().toISOString(),
          error: postflightError,
          completeReadOnlySnapshot:
            completeFailureSnapshot,
          outcomeMustBeTreatedAsUncertain: true,
        },
      )
      if (completeFailureSnapshot) {
        await writeEvidenceFile(
          evidenceRoot,
          '03-failure-after-state.json',
          {
            ...completeFailureSnapshot,
            outcomeMustBeTreatedAsUncertain: true,
          },
        )
      }
    }
    await writeEvidenceFile(
      evidenceRoot,
      '01-preflight-write-boundary.json',
      writeBoundary,
    )
    await writeEvidenceFile(evidenceRoot, '02-cli-output.json', {
      startedAt,
      finishedAt,
      stdout: safeStdout,
      stderr: safeStderr,
      processError,
    })
  } catch (error) {
    throw new Error(
      [
        'Post-migration evidence persistence failed after the bounded read-only after-state attempt.',
        'Treat the outcome as uncertain; do not start another migration.',
        redactSensitiveText(error.message, sensitiveValues),
      ].join(' '),
    )
  }
  if (safeStdout.trim()) {
    process.stdout.write(`${safeStdout.trim()}\n`)
  }
  if (safeStderr.trim()) {
    process.stderr.write(`${safeStderr.trim()}\n`)
  }

  const cleanCliExit =
    migrationResult.code === 0
    && !migrationResult.timedOut
    && !migrationResult.hardKilled
    && !processError
  const mechanicalSuccess =
    cleanCliExit
    && postflight
    && !postflightError
    && postMigrationWindowValid
  const outcome = {
    startedAt,
    finishedAt,
    cliExitCode: migrationResult.code,
    cliSignal: migrationResult.signal,
    timedOut: migrationResult.timedOut,
    sigintSent: migrationResult.timedOut,
    hardKilledAfterGrace: migrationResult.hardKilled,
    postflightVerified: Boolean(postflight && !postflightError),
    mechanicalSuccess: Boolean(mechanicalSuccess),
    verifiedSuccess: false,
    securityContractVerifierRequired: true,
    uncertainOutcome: !mechanicalSuccess,
    processError,
    postflightError,
    postMigrationWindowError,
    automaticNextStep: false,
    operatorInstruction: mechanicalSuccess
      ? 'Mechanical execution and bounded postflight capture completed. Stop: independent security-contract verification is required before any separately invoked next step.'
      : 'Hard stop. Keep flags false; reconcile ledger and database state before any separately approved action.',
  }
  let evidenceManifest
  try {
    await writeEvidenceFile(
      evidenceRoot,
      '02-migration-outcome.json',
      outcome,
    )
    evidenceManifest = await writeEvidenceManifest(
      evidenceRoot,
      evidenceContext,
    )
  } catch (error) {
    throw new Error(
      [
        'Post-migration evidence finalization failed after the bounded read-only after-state attempt.',
        'Treat the outcome as uncertain; do not start another migration.',
        redactSensitiveText(error.message, sensitiveValues),
      ].join(' '),
    )
  }

  if (!mechanicalSuccess) {
    throw new Error(
      `Migration ${options.step} is not a mechanical success; outcome is uncertain and execution is stopped`,
    )
  }

  writePostCommitNotice(
    [
      `Migration ${options.step} mechanical execution and bounded postflight capture completed.`,
      `Evidence: ${evidenceRoot}`,
      `Evidence manifest SHA-256: ${evidenceManifest.sha256}`,
      'This is not full ACL/RLS/function security acceptance.',
      'Stopped after one file. A 0600 independent-verifier signoff is required before any next invocation.',
      '',
    ].join('\n'),
  )
  return {
    evidenceRoot,
    evidenceManifest,
    outcome,
    postflight,
  }
}

async function main() {
  const args = process.argv.slice(2)
  if (
    args.length === 0
    || args[0] === '--help'
    || args[0] === '-h'
    || (args[0] === 'closeout' && args[1] === '--help')
    || (args[0] === 'calibrate-schema' && args[1] === '--help')
  ) {
    process.stdout.write(CLI_USAGE)
    return
  }
  if (args[0] === 'closeout') {
    await executeP12FinalCloseout(
      parseCloseoutArguments(args.slice(1)),
    )
    return
  }
  if (args[0] === 'calibrate-schema') {
    await executeSchemaCalibration(
      parseCalibrationArguments(args.slice(1)),
    )
    return
  }
  await executeP12Step(parseArguments(args))
}

if (
  process.argv[1]
  && import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 2
  })
}
