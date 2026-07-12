import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as XLSX from 'xlsx'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const evidencePath = join(
  root,
  'docs/plans/master-catalog/evidence/phase4-reconciliation-draft.csv',
)
const dictionaryPath = join(
  root,
  'docs/plans/master-catalog/10-phase4-structured-code-dictionary.md',
)
const outputPath = join(
  root,
  'lib/master-catalog/import/data/phase4-first-rollout-authority.json',
)
const migrationPath = join(
  root,
  'migrations/020_master_catalog_phase4_admin_workflow_hardening.sql',
)

const SQL_AUTHORITY_START = '  -- BEGIN GENERATED WP-6.6 AUTHORITY JSON'
const SQL_AUTHORITY_END = '  -- END GENERATED WP-6.6 AUTHORITY JSON'

const EXPECTED_EVIDENCE_SHA256 =
  '4627e413bea3c6a72b544f71cf0b91f4bff5c8d4199a799373140f4c969a338a'
const AUTHORITY_SCHEMA_VERSION = 'phase4-first-rollout-authority/1'
const AUTHORITY_DECISION_SET = 'P-02..P-07 approved 2026-07-04'

const approvedProductionOnlyCodes = new Map([
  ['ITEM-0139', 'ITEM-0139'],
  ['ITEM-0491', 'FTW-CON-002'],
  ['ITEM-0683', 'CIC-H06-001'],
  ['ITEM-0684', 'CIC-H06-002'],
  ['ITEM-0685', 'CIC-H06-003'],
  ['ITEM-0686', 'CIC-H06-004'],
  ['ITEM-0687', 'CIC-H06-005'],
  ['ITEM-0688', 'CIC-H06-006'],
  ['ITEM-0689', 'CIC-H06-007'],
  ['ITEM-0690', 'CIC-H06-008'],
  ['ITEM-0691', 'CIC-H06-009'],
  ['ITEM-0692', 'CIC-H06-010'],
  ['ITEM-0699', 'JNT-PVC-013'],
  ['ITEM-0700', 'RSR-PL0-040'],
  ['ITEM-0701', 'RSR-PL0-041'],
  ['ITEM-0702', 'RSR-PL0-042'],
  ['ITEM-0707', 'RSR-PL0-043'],
  ['ITEM-0708', 'RSR-PL0-044'],
  ['ITEM-0709', 'RSR-PL0-045'],
  ['ITEM-0710', 'RSR-PL0-046'],
])

const approvedHdpeCrossingCodes = new Map([
  ['ITEM-0124', 'CRS-H06-001'],
  ['ITEM-0125', 'CRS-H06-002'],
  ['ITEM-0126', 'CRS-H06-003'],
  ['ITEM-0127', 'CRS-H06-004'],
  ['ITEM-0128', 'CRS-H06-005'],
  ['ITEM-0129', 'CRS-H06-006'],
  ['ITEM-0130', 'CRS-H06-007'],
  ['ITEM-0131', 'CRS-H08-001'],
  ['ITEM-0132', 'CRS-H08-002'],
  ['ITEM-0133', 'CRS-H08-003'],
  ['ITEM-0134', 'CRS-H08-004'],
  ['ITEM-0135', 'CRS-H08-005'],
  ['ITEM-0136', 'CRS-H08-006'],
  ['ITEM-0137', 'CRS-H08-007'],
  ['ITEM-0138', 'CRS-H08-008'],
])

const evidenceBytes = readFileSync(evidencePath)
const evidenceSha256 = sha256(evidenceBytes)
assert(
  evidenceSha256 === EXPECTED_EVIDENCE_SHA256,
  `Reconciliation evidence SHA-256 changed: ${evidenceSha256}`,
)

const workbook = XLSX.read(evidenceBytes, { type: 'buffer' })
const worksheet = workbook.Sheets[workbook.SheetNames[0]]
const evidenceRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' })
const productionRows = evidenceRows.filter((row) => text(row.record_scope) === 'production')
const workbookOnlyRows = evidenceRows.filter(
  (row) => text(row.record_scope) === 'workbook_candidate',
)

assert(productionRows.length === 710, 'Authority generation requires exactly 710 Production rows')
assert(workbookOnlyRows.length === 18, 'Authority generation requires exactly 18 workbook-only evidence rows')

const mappings = productionRows
  .map((row) => buildMapping(row))
  .sort((left, right) => left.legacy_item_code.localeCompare(right.legacy_item_code, 'en'))

const sourceExclusions = workbookOnlyRows
  .filter((row) => text(row.canonical_code_candidate) !== 'FTW-CON-002')
  .map((row) => ({
    source_item_code: requiredText(row.canonical_code_candidate, 'source exclusion code'),
    disposition: 'deferred_not_publishable',
    reason: 'P-05 deferred workbook-only source row from the first structured-code rollout',
  }))
  .sort((left, right) => left.source_item_code.localeCompare(right.source_item_code, 'en'))

assert(sourceExclusions.length === 17, 'P-05 must leave exactly 17 source rows deferred')

const dictionaryMarkdown = readFileSync(dictionaryPath, 'utf8')
const workContexts = parseWorkContexts(dictionaryMarkdown)
const codeGroups = parseCodeGroups(dictionaryMarkdown, workContexts)

validateMappings(mappings, codeGroups, sourceExclusions)

const authorityCore = {
  schema_version: AUTHORITY_SCHEMA_VERSION,
  source_evidence_path:
    'docs/plans/master-catalog/evidence/phase4-reconciliation-draft.csv',
  source_evidence_sha256: evidenceSha256,
  decision_set: AUTHORITY_DECISION_SET,
  mappings,
  source_exclusions: sourceExclusions,
  code_groups: codeGroups,
}
const authority = {
  ...authorityCore,
  authority_sha256: sha256(Buffer.from(JSON.stringify(authorityCore), 'utf8')),
}
const output = `${JSON.stringify(authority, null, 2)}\n`

if (process.argv.includes('--check')) {
  let current = ''
  try {
    current = readFileSync(outputPath, 'utf8')
  } catch {
    fail(`Generated authority file is missing: ${outputPath}`)
  }

  assert(current === output, 'Generated authority file is stale; run this script with --write')
  assertMigrationAuthorityBlock(output)
  console.log(
    `WP-6.6 authority is current: ${mappings.length} mappings, ${codeGroups.length} groups, ${sourceExclusions.length} exclusions, ${authority.authority_sha256}`,
  )
  process.exit(0)
}

if (!process.argv.includes('--write')) {
  fail('Use --write to generate the authority file or --check to verify it')
}

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, output, 'utf8')
writeMigrationAuthorityBlock(output)
console.log(
  `Wrote ${outputPath}: ${mappings.length} mappings, ${codeGroups.length} groups, ${sourceExclusions.length} exclusions, ${authority.authority_sha256}`,
)

function buildMapping(row) {
  const identityId = requiredText(row.production_uuid, 'Production identity UUID')
  const legacyItemCode = requiredText(row.legacy_item_code, 'legacy item code')
  const sourceCandidateCode = text(row.canonical_code_candidate) || null
  const correctedCrossingCode = approvedHdpeCrossingCodes.get(legacyItemCode)
  const productionOnlyCode = approvedProductionOnlyCodes.get(legacyItemCode)
  const targetItemCode = correctedCrossingCode ?? productionOnlyCode ?? sourceCandidateCode

  assert(targetItemCode, `No approved target code exists for ${legacyItemCode}`)

  const targetIsCanonical = /^[A-Z0-9]{3}-[A-Z0-9]{3}-[0-9]{3}$/.test(targetItemCode)
  const retainedLegacyException = legacyItemCode === 'ITEM-0139' && targetItemCode === legacyItemCode
  assert(
    targetIsCanonical || retainedLegacyException,
    `Target code is outside the approved contract for ${legacyItemCode}: ${targetItemCode}`,
  )

  const groupCode = targetIsCanonical ? targetItemCode.slice(0, 7) : null

  return {
    identity_id: identityId,
    legacy_item_code: legacyItemCode,
    source_item_code:
      legacyItemCode === 'ITEM-0491' ? 'FTW-CON-002' : sourceCandidateCode,
    target_item_code: targetItemCode,
    identity_outcome: retainedLegacyException ? 'retain' : 'recode',
    work_context_code: groupCode?.slice(0, 3) ?? null,
    item_type_code: groupCode?.slice(4, 7) ?? null,
  }
}

function parseWorkContexts(markdown) {
  const rows = markdown
    .split(/\r?\n/)
    .filter((line) => /^\| [A-Z0-9]{3} \|/.test(line))
    .map(markdownCells)
    .filter((cells) => cells[0] !== 'AAA')

  assert(rows.length === 22, `Expected 22 approved work contexts, found ${rows.length}`)

  return new Map(rows.map((cells) => [cells[0], {
    name_th: cells[1],
    name_en: cells[2] || null,
  }]))
}

function parseCodeGroups(markdown, workContexts) {
  const rows = markdown
    .split(/\r?\n/)
    .filter((line) => /^\| [A-Z0-9]{3}-[A-Z0-9]{3} \|/.test(line))
    .map(markdownCells)
    .filter((cells) => cells[0] !== 'AAA-TTT')

  assert(rows.length === 65, `Expected 65 approved code groups, found ${rows.length}`)

  return rows.map((cells, displayOrder) => {
    const [workContextCode, itemTypeCode] = cells[0].split('-')
    const workContext = workContexts.get(workContextCode)
    assert(workContext, `Missing approved work-context definition for ${workContextCode}`)

    return {
      work_context_code: workContextCode,
      item_type_code: itemTypeCode,
      work_context_name_th: workContext.name_th,
      work_context_name_en: workContext.name_en,
      item_type_name_th: cells[2],
      item_type_name_en: cells[3] || null,
      display_order: displayOrder,
    }
  })
}

function validateMappings(authorityMappings, codeGroups, exclusions) {
  assert(authorityMappings.length === 710, 'Authority mapping must cover 710 identities')
  assert(uniqueCount(authorityMappings, 'identity_id') === 710, 'Identity UUIDs must be unique')
  assert(uniqueCount(authorityMappings, 'legacy_item_code') === 710, 'Legacy item codes must be unique')
  assert(uniqueCount(authorityMappings, 'target_item_code') === 710, 'Target item codes must be unique')
  assert(
    authorityMappings.filter((row) => row.identity_outcome === 'retain').length === 1,
    'Only ITEM-0139 may retain a legacy code',
  )
  assert(
    authorityMappings.find((row) => row.legacy_item_code === 'ITEM-0139')?.target_item_code
      === 'ITEM-0139',
    'ITEM-0139 legacy exception is missing',
  )

  const approvedGroups = new Set(
    codeGroups.map((row) => `${row.work_context_code}-${row.item_type_code}`),
  )
  const mappedGroups = new Set(
    authorityMappings
      .filter((row) => row.work_context_code && row.item_type_code)
      .map((row) => `${row.work_context_code}-${row.item_type_code}`),
  )

  assert(approvedGroups.size === 65, 'Approved code-group dictionary contains duplicates')
  assert(mappedGroups.size === 65, `Final mapping must use all 65 approved groups, found ${mappedGroups.size}`)
  for (const group of mappedGroups) {
    assert(approvedGroups.has(group), `Mapped code group is not approved by P-06: ${group}`)
  }

  const blockedCrossing = authorityMappings.filter((row) =>
    /^CRS-GIP-(018|019|02[0-9]|03[0-3])$/.test(row.target_item_code),
  )
  assert(blockedCrossing.length === 0, 'P-03 HDPE-as-GIP codes remain in the final mapping')

  const mappedSourceCodes = new Set(
    authorityMappings.map((row) => row.source_item_code).filter(Boolean),
  )
  for (const exclusion of exclusions) {
    assert(
      !mappedSourceCodes.has(exclusion.source_item_code),
      `Source code is both mapped and deferred: ${exclusion.source_item_code}`,
    )
  }
}

function authoritySqlBlock(authorityJson) {
  const indentedJson = authorityJson
    .trimEnd()
    .split('\n')
    .map((line) => `  ${line}`)
    .join('\n')

  return `${SQL_AUTHORITY_START}
  INSERT INTO phase4_wp66_authority (payload)
  VALUES (
    $phase4_wp66_authority$
${indentedJson}
    $phase4_wp66_authority$::jsonb
  );
${SQL_AUTHORITY_END}`
}

function writeMigrationAuthorityBlock(authorityJson) {
  let migration
  try {
    migration = readFileSync(migrationPath, 'utf8')
  } catch {
    fail(`Migration template is missing: ${migrationPath}`)
  }

  const nextMigration = replaceAuthorityBlock(migration, authoritySqlBlock(authorityJson))
  writeFileSync(migrationPath, nextMigration, 'utf8')
}

function assertMigrationAuthorityBlock(authorityJson) {
  let migration
  try {
    migration = readFileSync(migrationPath, 'utf8')
  } catch {
    fail(`Migration is missing: ${migrationPath}`)
  }

  const expected = replaceAuthorityBlock(migration, authoritySqlBlock(authorityJson))
  assert(
    migration === expected,
    'Migration authority block is stale; run this script with --write',
  )
}

function replaceAuthorityBlock(migration, replacement) {
  const startIndex = migration.indexOf(SQL_AUTHORITY_START)
  const endIndex = migration.indexOf(SQL_AUTHORITY_END)

  assert(startIndex >= 0, 'Migration authority start marker is missing')
  assert(endIndex > startIndex, 'Migration authority end marker is missing or out of order')

  return `${migration.slice(0, startIndex)}${replacement}${migration.slice(
    endIndex + SQL_AUTHORITY_END.length,
  )}`
}

function markdownCells(line) {
  return line
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim().replaceAll('`', ''))
}

function uniqueCount(rows, key) {
  return new Set(rows.map((row) => row[key])).size
}

function requiredText(value, label) {
  const valueText = text(value)
  assert(valueText, `${label} is required`)
  return valueText
}

function text(value) {
  return typeof value === 'string' ? value.trim() : String(value ?? '').trim()
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function assert(condition, message) {
  if (!condition) fail(message)
}

function fail(message) {
  console.error(`WP-6.6 authority generation failed: ${message}`)
  process.exit(1)
}
