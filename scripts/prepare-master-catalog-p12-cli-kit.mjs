#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import {
  accessSync,
  constants as fileSystemConstants,
  readFileSync,
  realpathSync,
} from 'node:fs'
import {
  chmod,
  copyFile,
  lstat,
  mkdir,
  readFile,
  realpath,
  rm,
  writeFile,
} from 'node:fs/promises'
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
} from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'

export const KIT_SCHEMA = 'conduit-boq/master-catalog-p12-cli-kit/v2'
export const REQUIRED_SUPABASE_CLI_VERSION = '2.107.0'
export const REQUIRED_POSTGRES_MAJOR = 17
export const CLIENT_TIMEOUT_SECONDS = 180
export const APPLICATION_CANDIDATE =
  '5068f944af2aa3fe8446c77c8ae8d48673cb260b'
export const P12_KIT_GENERATOR_SOURCE =
  'scripts/prepare-master-catalog-p12-cli-kit.mjs'
export const P12_RUNNER_SOURCE =
  'scripts/run-master-catalog-p12-cli-step.mjs'

export const HISTORICAL_MIGRATIONS = Object.freeze([
  {
    ordinal: '009',
    sourceFile: '009_master_catalog_p0_containment.sql',
    version: '20260621045208',
    ledgerName: 'master_catalog_p0_containment',
  },
  {
    ordinal: '010',
    sourceFile: '010_master_catalog_phase1a_versioning.sql',
    version: '20260621052517',
    ledgerName: 'master_catalog_phase1a_versioning',
  },
  {
    ordinal: '011',
    sourceFile: '011_master_catalog_phase1b_hardening.sql',
    version: '20260621104056',
    ledgerName: 'master_catalog_phase1b_hardening',
  },
  {
    ordinal: '012',
    sourceFile: '012_factor_f_version_foundation.sql',
    version: '20260628190218',
    ledgerName: 'factor_f_version_foundation',
  },
  {
    ordinal: '013',
    sourceFile: '013_factor_f_seed_current_baseline.sql',
    version: '20260628190357',
    ledgerName: 'factor_f_seed_current_baseline',
  },
  {
    ordinal: '014',
    sourceFile: '014_factor_f_publish_2569_0_0.sql',
    version: '20260628190621',
    ledgerName: 'factor_f_publish_2569_0_0',
  },
  {
    ordinal: '015',
    sourceFile: '015_factor_f_repair_legacy_snapshot_metadata.sql',
    version: '20260628190757',
    ledgerName: 'factor_f_repair_legacy_snapshot_metadata',
  },
  {
    ordinal: '016',
    sourceFile: '016_hotfix_preserve_boq_item_suffix.sql',
    version: '20260706090832',
    ledgerName: 'hotfix_preserve_boq_item_suffix',
  },
])

export const PHASE4_MIGRATIONS = Object.freeze([
  {
    ordinal: '017',
    sourceFile: '017_master_catalog_phase4_foundation.sql',
    version: '20260728001700',
    ledgerName: 'master_catalog_phase4_foundation',
    sha256: 'fc3bd3a9e144db7e78fb7d777fad8b3e49bae99717aae07ef27a296bf0cf198c',
  },
  {
    ordinal: '017a',
    sourceFile:
      '017a_master_catalog_phase4_global_function_default_privileges.sql',
    version: '20260728001730',
    ledgerName:
      'master_catalog_phase4_global_function_default_privileges',
    sha256: '12cf6687b6339efa17635ac29ddfdb5150210a96e0640b0e9182a4cda64497a7',
  },
  {
    ordinal: '018',
    sourceFile: '018_master_catalog_phase4_draft_mutation.sql',
    version: '20260728001800',
    ledgerName: 'master_catalog_phase4_draft_mutation',
    sha256: 'd78704bb90d551a29b59f0d0032052fa5f1773b8c07721cf6e8f6e03be044e73',
  },
  {
    ordinal: '019',
    sourceFile: '019_master_catalog_phase4_publish_pointer.sql',
    version: '20260728001900',
    ledgerName: 'master_catalog_phase4_publish_pointer',
    sha256: '841692aae1b3160c67db160f73bc7042c2d83fe7259e446ef1d1c73928c00bb9',
  },
  {
    ordinal: '020',
    sourceFile: '020_master_catalog_phase4_admin_workflow_hardening.sql',
    version: '20260728002000',
    ledgerName: 'master_catalog_phase4_admin_workflow_hardening',
    sha256: 'e07e0c4161077efba7bc4f6ebf95518d0cc1bc7e4628a43a128dd899bd1aef93',
  },
  {
    ordinal: '021',
    sourceFile: '021_master_catalog_phase4_placement_governance.sql',
    version: '20260728002100',
    ledgerName: 'master_catalog_phase4_placement_governance',
    sha256: 'e4de258756bbfbda0508e55d7b76ba2e907f644625b49bc29d4a4d7ac42fa714',
  },
  {
    ordinal: '022',
    sourceFile: '022_master_catalog_phase4_draft_identity_and_release_number.sql',
    version: '20260728002200',
    ledgerName: 'master_catalog_phase4_draft_identity_and_release_number',
    sha256: '9fc8f951fa5b3f3d7de928cce877a265d9333fda46850dd7564b22cd424c41f3',
  },
  {
    ordinal: '023',
    sourceFile: '023_master_catalog_phase4_published_code_rls_scope.sql',
    version: '20260728002300',
    ledgerName: 'master_catalog_phase4_published_code_rls_scope',
    sha256: 'cbe01f63c6dd822edb29e1f7a31bfd27d5cb063e4d7d7e3878567875434d0a88',
  },
  {
    ordinal: '024',
    sourceFile: '024_master_catalog_phase4_set_based_placement_invalidation.sql',
    version: '20260728002400',
    ledgerName: 'master_catalog_phase4_set_based_placement_invalidation',
    sha256: 'd3aa11282fa4b2d4bac058bde3851287c551556ba5eac307277f086ba3d86b25',
  },
  {
    ordinal: '025',
    sourceFile: '025_master_catalog_phase4_withdraw_order_compaction.sql',
    version: '20260728002500',
    ledgerName: 'master_catalog_phase4_withdraw_order_compaction',
    sha256: '00d79d7750aa52ba7f003f6bb82fedb1d31ab111be417d74329c1cd3d899f76f',
  },
  {
    ordinal: '026',
    sourceFile:
      '026_master_catalog_phase4_catalog_action_error_acl.sql',
    version: '20260729002600',
    ledgerName: 'master_catalog_phase4_catalog_action_error_acl',
    sha256: '472fa04b81bc8e96e9b507e20fc20cfee3114c80fda45f2ffba3893480920d8a',
  },
])

export const REPOSITORY_ROOT = resolve(
  fileURLToPath(new URL('..', import.meta.url)),
)
export const MIGRATIONS_ROOT = join(REPOSITORY_ROOT, 'migrations')
const requireFromThisModule = createRequire(import.meta.url)

const SUPABASE_NATIVE_PACKAGE_CANDIDATES = Object.freeze({
  darwin: {
    arm64: ['darwin-arm64'],
    x64: ['darwin-x64'],
  },
  linux: {
    arm64: ['linux-arm64', 'linux-arm64-musl'],
    x64: ['linux-x64', 'linux-x64-musl'],
  },
  win32: {
    arm64: ['windows-arm64'],
    x64: ['windows-x64'],
  },
})

export function resolveNativeSupabaseCliBinary({
  platform = process.platform,
  architecture = process.arch,
} = {}) {
  const suffixes =
    SUPABASE_NATIVE_PACKAGE_CANDIDATES[platform]?.[architecture]
  assert(
    Array.isArray(suffixes),
    `Unsupported Supabase CLI platform: ${platform}-${architecture}`,
  )

  for (const suffix of suffixes) {
    const packageName = `@supabase/cli-${suffix}`
    try {
      const packageJsonPath = requireFromThisModule.resolve(
        `${packageName}/package.json`,
      )
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
      assert(
        packageJson.version === REQUIRED_SUPABASE_CLI_VERSION,
        `${packageName} must be exactly ${REQUIRED_SUPABASE_CLI_VERSION}`,
      )
      const executableName = platform === 'win32'
        ? 'supabase.exe'
        : 'supabase'
      const binaryPath = realpathSync(
        join(dirname(packageJsonPath), 'bin', executableName),
      )
      accessSync(binaryPath, fileSystemConstants.X_OK)
      return binaryPath
    } catch (error) {
      if (
        error?.code === 'MODULE_NOT_FOUND'
        || error?.code === 'ENOENT'
        || error?.code === 'EACCES'
      ) {
        continue
      }
      throw error
    }
  }

  throw new Error(
    `No exact native Supabase CLI binary is installed for ${platform}-${architecture}`,
  )
}

// This is intentionally the native platform binary, not node_modules/.bin's
// JavaScript shim. Timeout signals must reach the database client process
// directly rather than only terminating its wrapper.
export const LOCAL_SUPABASE_CLI = resolveNativeSupabaseCliBinary()

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

export function ledgerFilename(migration) {
  return `${migration.version}_${migration.ledgerName}.sql`
}

export function sha256Bytes(bytes) {
  return createHash('sha256').update(bytes).digest('hex')
}

export async function sha256File(path) {
  return sha256Bytes(await readFile(path))
}

function isPathInside(parent, candidate) {
  const pathFromParent = relative(parent, candidate)
  return (
    pathFromParent === ''
    || (!pathFromParent.startsWith('..') && !isAbsolute(pathFromParent))
  )
}

async function pathExists(path) {
  try {
    await lstat(path)
    return true
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return false
    }
    throw error
  }
}

export async function resolveNewExternalDirectory(
  requestedPath,
  repositoryRoot = REPOSITORY_ROOT,
) {
  assert(
    typeof requestedPath === 'string' && isAbsolute(requestedPath),
    'Output path must be absolute',
  )

  const repositoryRealPath = await realpath(repositoryRoot)
  const parentRealPath = await realpath(dirname(requestedPath))
  const resolvedTarget = join(parentRealPath, basename(requestedPath))

  assert(
    !isPathInside(repositoryRealPath, resolvedTarget),
    'Output path must be outside the repository',
  )
  assert(
    !(await pathExists(resolvedTarget)),
    'Output path must not already exist',
  )

  return resolvedTarget
}

function uniqueSortedObjects(objects) {
  const keys = new Map()
  for (const object of objects) {
    keys.set(`${object.schema}.${object.name}`, object)
  }
  return [...keys.values()].sort((left, right) =>
    `${left.schema}.${left.name}`.localeCompare(`${right.schema}.${right.name}`),
  )
}

export function extractOwnedObjectTargets(sql) {
  const relations = []
  const routines = []

  const relationPattern =
    /\b(?:CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?|ALTER\s+TABLE(?:\s+IF\s+EXISTS)?)\s+(public|private)\.([a-zA-Z_][a-zA-Z0-9_$]*)/gi
  const routinePattern =
    /\b(?:CREATE\s+(?:OR\s+REPLACE\s+)?|ALTER\s+)FUNCTION\s+(public|private)\.([a-zA-Z_][a-zA-Z0-9_$]*)\s*\(/gi

  for (const match of sql.matchAll(relationPattern)) {
    relations.push({ schema: match[1].toLowerCase(), name: match[2] })
  }
  for (const match of sql.matchAll(routinePattern)) {
    routines.push({ schema: match[1].toLowerCase(), name: match[2] })
  }

  return {
    relations: uniqueSortedObjects(relations),
    routines: uniqueSortedObjects(routines),
  }
}

function mergeObjectTargets(targetSets) {
  return {
    relations: uniqueSortedObjects(
      targetSets.flatMap((targets) => targets.relations),
    ),
    routines: uniqueSortedObjects(
      targetSets.flatMap((targets) => targets.routines),
    ),
  }
}

function runGit(args) {
  const result = spawnSync('git', args, {
    cwd: REPOSITORY_ROOT,
    encoding: 'utf8',
    shell: false,
  })
  assert(result.status === 0, `git ${args[0]} failed`)
  return result.stdout.trim()
}

export function readRepositoryState() {
  const head = runGit(['rev-parse', 'HEAD'])
  const trackedStatus = runGit([
    'status',
    '--porcelain',
    '--untracked-files=no',
  ])
  return {
    gitHead: head,
    trackedWorktreeClean: trackedStatus === '',
  }
}

export function assertSupabaseCliVersion(cliPath = LOCAL_SUPABASE_CLI) {
  const cliEnvironment = {
    SUPABASE_TELEMETRY_DISABLED: '1',
  }
  for (const key of [
    'HOME',
    'LANG',
    'LC_ALL',
    'PATH',
    'SYSTEMROOT',
    'TMPDIR',
    'TZ',
  ]) {
    if (process.env[key] !== undefined) {
      cliEnvironment[key] = process.env[key]
    }
  }
  const result = spawnSync(cliPath, ['--version'], {
    cwd: REPOSITORY_ROOT,
    encoding: 'utf8',
    env: cliEnvironment,
    shell: false,
  })
  assert(result.status === 0, 'Unable to run the repository Supabase CLI')
  assert(
    result.stdout.trim() === REQUIRED_SUPABASE_CLI_VERSION,
    `Supabase CLI must be exactly ${REQUIRED_SUPABASE_CLI_VERSION}`,
  )
}

async function loadMigrationSources() {
  const sourceRows = []

  for (const migration of [
    ...HISTORICAL_MIGRATIONS,
    ...PHASE4_MIGRATIONS,
  ]) {
    const isPhase4 = typeof migration.sha256 === 'string'
    const sourcePath = join(MIGRATIONS_ROOT, migration.sourceFile)
    const bytes = await readFile(sourcePath)
    const sha256 = sha256Bytes(bytes)

    if (isPhase4) {
      assert(
        sha256 === migration.sha256,
        `${migration.sourceFile} does not match its accepted SHA-256`,
      )
    }

    sourceRows.push({
      ...migration,
      ledgerFilename: ledgerFilename(migration),
      bytes,
      sha256,
      isPhase4,
      objectTargets: isPhase4
        ? extractOwnedObjectTargets(bytes.toString('utf8'))
        : { relations: [], routines: [] },
    })
  }

  return sourceRows
}

async function makeStepDirectory(
  outputPath,
  stepMigration,
  includedMigrations,
) {
  const stepRoot = join(outputPath, 'steps', stepMigration.ordinal)
  const supabaseRoot = join(stepRoot, 'supabase')
  const migrationRoot = join(supabaseRoot, 'migrations')
  await mkdir(migrationRoot, { recursive: true, mode: 0o700 })

  await writeFile(
    join(supabaseRoot, 'config.toml'),
    `project_id = "conduit-boq-master-catalog-p12-${stepMigration.ordinal}"\n`,
    { encoding: 'utf8', mode: 0o400 },
  )

  for (const migration of includedMigrations) {
    const destination = join(migrationRoot, migration.ledgerFilename)
    await copyFile(
      join(MIGRATIONS_ROOT, migration.sourceFile),
      destination,
    )
    await chmod(destination, 0o400)
    assert(
      (await sha256File(destination)) === migration.sha256,
      `${migration.sourceFile} copy failed byte-for-byte verification`,
    )
  }

  return relative(outputPath, stepRoot)
}

function publicMigrationRecord(migration) {
  return {
    ordinal: migration.ordinal,
    sourceFile: migration.sourceFile,
    version: migration.version,
    ledgerName: migration.ledgerName,
    ledgerFilename: migration.ledgerFilename,
    sha256: migration.sha256,
  }
}

/**
 * @param {{
 *   outputPath: string,
 *   checkCliVersion?: boolean,
 *   repositoryState?: {
 *     gitHead: string,
 *     trackedWorktreeClean: boolean,
 *   },
 * }} options
 */
export async function prepareP12CliKit({
  outputPath,
  checkCliVersion = true,
  repositoryState,
}) {
  if (checkCliVersion) {
    assertSupabaseCliVersion()
  }

  const resolvedOutput = await resolveNewExternalDirectory(outputPath)
  const state = repositoryState ?? readRepositoryState()
  const sources = await loadMigrationSources()
  const generatorSourceSha256 = await sha256File(
    join(REPOSITORY_ROOT, P12_KIT_GENERATOR_SOURCE),
  )
  const runnerSourceSha256 = await sha256File(
    join(REPOSITORY_ROOT, P12_RUNNER_SOURCE),
  )
  const historical = sources.filter((migration) => !migration.isPhase4)
  const phase4 = sources.filter((migration) => migration.isPhase4)

  let created = false
  try {
    await mkdir(resolvedOutput, { mode: 0o700 })
    created = true
    await mkdir(join(resolvedOutput, 'steps'), { mode: 0o700 })

    const steps = []
    for (let index = 0; index < phase4.length; index += 1) {
      const currentMigration = phase4[index]
      const phase4ThroughCurrent = phase4.slice(0, index + 1)
      const included = [...historical, ...phase4ThroughCurrent]
      const workdir = await makeStepDirectory(
        resolvedOutput,
        currentMigration,
        included,
      )

      steps.push({
        ordinal: currentMigration.ordinal,
        workdir,
        pendingMigration: publicMigrationRecord(currentMigration),
        expectedRemoteBefore: [
          ...historical,
          ...phase4.slice(0, index),
        ].map(publicMigrationRecord),
        expectedRemoteAfter: included.map(publicMigrationRecord),
        objectTargetsBefore: mergeObjectTargets(
          phase4.slice(0, index).map((migration) => migration.objectTargets),
        ),
        objectTargetsAfter: mergeObjectTargets(
          phase4ThroughCurrent.map((migration) => migration.objectTargets),
        ),
      })
    }

    const manifest = {
      schema: KIT_SCHEMA,
      createdAt: new Date().toISOString(),
      sourceGitHead: state.gitHead,
      generatorSourceSha256,
      runnerSourceSha256,
      trackedWorktreeClean: state.trackedWorktreeClean,
      productionEligible: state.trackedWorktreeClean,
      applicationCandidate: APPLICATION_CANDIDATE,
      supabaseCliVersion: REQUIRED_SUPABASE_CLI_VERSION,
      postgresMajor: REQUIRED_POSTGRES_MAJOR,
      clientTimeoutSeconds: CLIENT_TIMEOUT_SECONDS,
      automaticNextStep: false,
      historicalMigrations: historical.map(publicMigrationRecord),
      phase4Migrations: phase4.map(publicMigrationRecord),
      steps,
    }

    const manifestPath = join(resolvedOutput, 'manifest.json')
    await writeFile(
      manifestPath,
      `${JSON.stringify(manifest, null, 2)}\n`,
      { encoding: 'utf8', mode: 0o400 },
    )

    return {
      outputPath: resolvedOutput,
      manifest,
      manifestSha256: await sha256File(manifestPath),
    }
  } catch (error) {
    if (created) {
      await rm(resolvedOutput, { recursive: true, force: false })
    }
    throw error
  }
}

function parseArguments(args) {
  let outputPath
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    if (argument === '--output') {
      assert(index + 1 < args.length, '--output requires a path')
      outputPath = args[index + 1]
      index += 1
      continue
    }
    throw new Error(`Unknown argument: ${argument}`)
  }
  assert(outputPath, 'Usage: prepare-master-catalog-p12-cli-kit.mjs --output <absolute-new-external-directory>')
  return { outputPath }
}

async function main() {
  const options = parseArguments(process.argv.slice(2))
  const result = await prepareP12CliKit(options)
  process.stdout.write(
    [
      `Prepared P-12 CLI kit: ${result.outputPath}`,
      `Manifest SHA-256: ${result.manifestSha256}`,
      `Production eligible: ${result.manifest.productionEligible}`,
      'No database connection or migration was performed.',
      '',
    ].join('\n'),
  )
}

if (
  process.argv[1]
  && import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 1
  })
}
