import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const COMPARISON_FIELDS = [
  'gitCommit',
  'baseVersion',
  'baselineDatasetHash',
  'baselineIdentityRows',
  'baselineIdentityMappingSha256',
]

export function compareP20Evidence(first, second) {
  const failures = []

  for (const [label, evidence] of [['first', first], ['second', second]]) {
    if (evidence?.schemaVersion !== 1) failures.push(`${label} evidence schemaVersion must be 1`)
    if (evidence?.status !== 'passed') failures.push(`${label} evidence status must be passed`)
    if (evidence?.environment !== 'local') failures.push(`${label} evidence must be Local`)
    if (evidence?.productionTouched !== false) failures.push(`${label} evidence must say Production touched: false`)
    if (!/^sha256:[0-9a-f]{64}$/.test(evidence?.baselineDatasetHash ?? '')) {
      failures.push(`${label} baseline dataset hash is invalid`)
    }
    if (!/^[0-9a-f]{64}$/.test(evidence?.baselineIdentityMappingSha256 ?? '')) {
      failures.push(`${label} baseline identity mapping hash is invalid`)
    }
    if (!Number.isInteger(evidence?.baselineIdentityRows) || evidence.baselineIdentityRows <= 0) {
      failures.push(`${label} baseline identity row count is invalid`)
    }
  }

  for (const field of COMPARISON_FIELDS) {
    if (first?.[field] !== second?.[field]) {
      failures.push(`P-20 evidence mismatch for ${field}`)
    }
  }

  if (first?.generatedAt === second?.generatedAt) {
    failures.push('P-20 evidence timestamps must come from separate runs')
  }

  return {
    schemaVersion: 1,
    status: failures.length === 0 ? 'passed' : 'failed',
    comparedAt: new Date().toISOString(),
    baseVersion: first?.baseVersion ?? null,
    baselineDatasetHash: first?.baselineDatasetHash ?? null,
    baselineIdentityRows: first?.baselineIdentityRows ?? null,
    baselineIdentityMappingSha256: first?.baselineIdentityMappingSha256 ?? null,
    sameReviewedCommit: first?.gitCommit === second?.gitCommit,
    independentRebuildProvenanceRequiresTrackerRecord: true,
    failures,
  }
}

async function runCli() {
  const [firstPath, secondPath] = process.argv.slice(2)
  if (!firstPath || !secondPath) {
    throw new Error(
      'Usage: npm run db:local:verify-master-catalog-p20 -- <first-evidence.json> <second-evidence.json>',
    )
  }

  const [first, second] = await Promise.all([
    readFile(resolve(firstPath), 'utf8').then(JSON.parse),
    readFile(resolve(secondPath), 'utf8').then(JSON.parse),
  ])
  const result = compareP20Evidence(first, second)
  console.log(JSON.stringify(result, null, 2))
  if (result.status !== 'passed') process.exitCode = 1
}

const isDirectExecution = process.argv[1]
  && fileURLToPath(import.meta.url) === resolve(process.argv[1])
if (isDirectExecution) {
  runCli().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
