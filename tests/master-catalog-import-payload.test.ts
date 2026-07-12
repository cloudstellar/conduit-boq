import { describe, expect, it } from 'vitest'
import {
  CATALOG_IMPORT_NORMALIZED_PAYLOAD_LIMIT_BYTES,
  CATALOG_IMPORT_RAW_FILE_LIMIT_BYTES,
  CatalogImportPayloadValidationError,
  buildCatalogImportRowsV2,
  canonicalizeCatalogImportPayloadV2,
  canonicalizeCatalogImportPayloadV1,
  validateCatalogImportPayload,
  validateCatalogImportPayloadV2,
  validateCatalogImportPayloadHashV1,
  validateCatalogImportPayloadV1,
} from '../lib/master-catalog/import/payload'
import type {
  CatalogImportPayloadV1,
  CatalogImportPayloadV2,
  NormalizedCatalogImportRowV2,
  NormalizedCatalogRowCandidate,
} from '../lib/master-catalog/import/types'

const VERSION_ID = '00000000-0000-4000-8000-000000000001'
const REQUEST_ID = '00000000-0000-4000-8000-000000000101'
const SOURCE_HASH = '1111111111111111111111111111111111111111111111111111111111111111'
const IDENTITY_ID = '00000000-0000-4000-8000-000000000201'
const CATEGORY_ID = '00000000-0000-4000-8000-000000000301'
const GROUP_ID = '00000000-0000-4000-8000-000000000401'

function makeRow(
  overrides: Partial<NormalizedCatalogRowCandidate> = {},
): NormalizedCatalogRowCandidate {
  return {
    sourceRow: 2,
    sourceReference: '01_Item_Master_Final:2',
    legacyItemCode: 'ITEM-0001',
    canonicalCode: 'AAA-BBB-001',
    workContextCode: 'AAA',
    workContextNameTh: 'กลุ่มงานทดสอบ',
    itemTypeCode: 'BBB',
    itemTypeNameTh: 'ชนิดทดสอบ',
    itemName: 'รายการทดสอบ 1',
    unit: 'ม.',
    materialCost: '100.00',
    laborCost: '25.00',
    unitCost: '125.00',
    categoryCode: '1.1',
    identityOutcome: 'retain',
    priceAuthorityReference: null,
    ...overrides,
  }
}

function makePayload(
  overrides: Partial<CatalogImportPayloadV1> = {},
): CatalogImportPayloadV1 {
  return {
    schemaVersion: 'catalog-import-payload/1',
    parserProfileId: 'nt-item-master-2568',
    parserProfileVersion: '1',
    mode: 'full',
    versionId: VERSION_ID,
    expectedLockVersion: 3,
    requestId: REQUEST_ID,
    reason: 'local rehearsal only',
    source: {
      filename: 'production-derived-readonly-fixture.xlsx',
      sizeBytes: 12000,
      sha256: SOURCE_HASH,
      physicalArchiveReference: 'P-09-draft-rehearsal',
    },
    retirementApprovalReference: null,
    retirementConfirmedCount: null,
    rows: [makeRow()],
    ...overrides,
  }
}

describe('Master Catalog import payload validation', () => {
  it('normalizes a valid payload, preserves exact schema order, and hashes deterministically', async () => {
    const validated = await validateCatalogImportPayloadV1(makePayload({
      reason: '  local rehearsal only  ',
      rows: [makeRow({
        itemName: 'Cafe\u0301',
      })],
    }))

    expect(validated.payload.reason).toBe('local rehearsal only')
    expect(validated.payload.rows[0].itemName).toBe('Café')
    expect(validated.normalizedPayloadJson).toBe(
      canonicalizeCatalogImportPayloadV1(validated.payload),
    )
    expect(validated.normalizedPayloadJson.endsWith('\n')).toBe(true)
    expect(validated.normalizedPayloadHash).toMatch(/^[0-9a-f]{64}$/)

    await expect(validateCatalogImportPayloadHashV1(
      validated.payload,
      validated.normalizedPayloadHash,
    )).resolves.toMatchObject({
      normalizedPayloadHash: validated.normalizedPayloadHash,
    })
  })

  it('rejects unknown top-level, source, row, K, and Factor F-looking keys', async () => {
    await expect(validateCatalogImportPayloadV1({
      ...makePayload(),
      unexpected: true,
    })).rejects.toMatchObject({
      code: 'VALIDATION_FAILED',
      diagnostics: [expect.objectContaining({ field: 'payload.unexpected' })],
    })

    await expect(validateCatalogImportPayloadV1(makePayload({
      source: {
        ...makePayload().source,
        unexpected: true,
      } as CatalogImportPayloadV1['source'],
    }))).rejects.toMatchObject({
      code: 'VALIDATION_FAILED',
      diagnostics: [expect.objectContaining({ field: 'source.unexpected' })],
    })

    await expect(validateCatalogImportPayloadV1(makePayload({
      rows: [{
        ...makeRow(),
        k_formula_id: 'blocked',
      } as NormalizedCatalogRowCandidate],
    }))).rejects.toMatchObject({
      code: 'VALIDATION_FAILED',
      diagnostics: [expect.objectContaining({ field: 'rows.0.k_formula_id' })],
    })

    await expect(validateCatalogImportPayloadV1(makePayload({
      rows: [{
        ...makeRow(),
        factor_f_version: 'blocked',
      } as NormalizedCatalogRowCandidate],
    }))).rejects.toMatchObject({
      code: 'VALIDATION_FAILED',
      diagnostics: [expect.objectContaining({ field: 'rows.0.factor_f_version' })],
    })
  })

  it('enforces payload, raw-file, and row limits before import mutation', async () => {
    await expect(validateCatalogImportPayloadV1(makePayload({
      reason: 'x'.repeat(CATALOG_IMPORT_NORMALIZED_PAYLOAD_LIMIT_BYTES + 1),
    }))).rejects.toMatchObject({
      code: 'IMPORT_PAYLOAD_TOO_LARGE',
    })

    await expect(validateCatalogImportPayloadV1(makePayload({
      source: {
        ...makePayload().source,
        sizeBytes: CATALOG_IMPORT_RAW_FILE_LIMIT_BYTES + 1,
      },
    }))).rejects.toMatchObject({
      code: 'IMPORT_FILE_TOO_LARGE',
    })

    await expect(validateCatalogImportPayloadV1(makePayload({
      rows: Array.from({ length: 1501 }, () => makeRow()),
    }))).rejects.toMatchObject({
      code: 'IMPORT_ROW_LIMIT_EXCEEDED',
    })
  })

  it('rejects money drift, numeric money, duplicate codes, and malformed source metadata', async () => {
    await expect(validateCatalogImportPayloadV1(makePayload({
      rows: [makeRow({ unitCost: '126.00' })],
    }))).rejects.toBeInstanceOf(CatalogImportPayloadValidationError)

    await expect(validateCatalogImportPayloadV1(makePayload({
      rows: [{
        ...makeRow(),
        materialCost: 100,
      } as unknown as NormalizedCatalogRowCandidate],
    }))).rejects.toMatchObject({
      code: 'VALIDATION_FAILED',
      diagnostics: [expect.objectContaining({ field: 'rows.0.materialCost' })],
    })

    await expect(validateCatalogImportPayloadV1(makePayload({
      rows: [
        makeRow(),
        makeRow({
          sourceRow: 3,
          sourceReference: '01_Item_Master_Final:3',
        }),
      ],
    }))).rejects.toMatchObject({
      code: 'VALIDATION_FAILED',
      diagnostics: [expect.objectContaining({ field: 'rows.canonicalCode' })],
    })

    await expect(validateCatalogImportPayloadV1(makePayload({
      source: {
        ...makePayload().source,
        sha256: 'not-a-hash',
      },
    }))).rejects.toMatchObject({
      code: 'VALIDATION_FAILED',
      diagnostics: [expect.objectContaining({ field: 'source.sha256' })],
    })

    await expect(validateCatalogImportPayloadV1(makePayload({
      source: {
        ...makePayload().source,
        sha256: `sha256:${SOURCE_HASH}`,
      },
    }))).rejects.toMatchObject({
      code: 'VALIDATION_FAILED',
      diagnostics: [expect.objectContaining({ field: 'source.sha256' })],
    })

    await expect(validateCatalogImportPayloadV1(makePayload({
      requestId: 'request-2568-0001',
    }))).rejects.toMatchObject({
      code: 'VALIDATION_FAILED',
      diagnostics: [expect.objectContaining({ field: 'requestId' })],
    })

    await expect(validateCatalogImportPayloadV1(makePayload({
      source: {
        ...makePayload().source,
        sizeBytes: 0,
      },
    }))).rejects.toMatchObject({
      code: 'VALIDATION_FAILED',
      diagnostics: [expect.objectContaining({ field: 'source.sizeBytes' })],
    })
  })

  it('rejects normalized payload hash mismatches from tampered replay payloads', async () => {
    const validated = await validateCatalogImportPayloadV1(makePayload())

    await expect(validateCatalogImportPayloadHashV1(
      makePayload({ reason: 'tampered replay' }),
      validated.normalizedPayloadHash,
    )).rejects.toMatchObject({
      code: 'VALIDATION_FAILED',
      diagnostics: [expect.objectContaining({ field: 'normalizedPayloadHash' })],
    })
  })
})

describe('Master Catalog import payload v2 authority contract', () => {
  function rowV2(
    overrides: Partial<NormalizedCatalogImportRowV2> = {},
  ): NormalizedCatalogImportRowV2 {
    return {
      sourceRow: 2,
      sourceReference: '01_Item_Master_Final:2',
      sourceItemCode: 'AAA-BBB-001',
      legacyItemCode: 'ITEM-0001',
      targetIdentityId: IDENTITY_ID,
      targetItemCode: 'AAA-BBB-001',
      workContextCode: 'AAA',
      workContextNameTh: 'กลุ่มงานทดสอบ',
      itemTypeCode: 'BBB',
      itemTypeNameTh: 'ชนิดทดสอบ',
      itemName: 'รายการทดสอบ 1',
      unit: 'ม.',
      materialCost: '100.00',
      laborCost: '25.00',
      unitCost: '125.00',
      categoryId: CATEGORY_ID,
      categoryCode: '1.1',
      codeGroupId: GROUP_ID,
      identityOutcome: 'recode',
      priceAuthorityReference: null,
      ...overrides,
    }
  }

  function payloadV2(
    overrides: Partial<CatalogImportPayloadV2> = {},
  ): CatalogImportPayloadV2 {
    return {
      schemaVersion: 'catalog-import-payload/2',
      parserProfileId: 'nt-item-master-2568',
      parserProfileVersion: '1',
      mode: 'full',
      versionId: VERSION_ID,
      expectedLockVersion: 3,
      requestId: REQUEST_ID,
      reason: 'ตรวจ rollout แรก',
      source: makePayload().source,
      priceAuthorityReference: null,
      retirementApprovalReference: null,
      retirementConfirmedCount: null,
      rows: [rowV2()],
      ...overrides,
    }
  }

  it('hashes exact identity/category/group rows and dispatches by schema version', async () => {
    const validated = await validateCatalogImportPayload(payloadV2())

    expect(validated.payload.schemaVersion).toBe('catalog-import-payload/2')
    expect(validated.normalizedPayloadJson).toBe(
      canonicalizeCatalogImportPayloadV2(validated.payload as CatalogImportPayloadV2),
    )
    expect(validated.normalizedPayloadHash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('removes caller-selected codes for new identities and keeps approved dictionary IDs', async () => {
    const rows = buildCatalogImportRowsV2([makeRow({
      legacyItemCode: null,
      identityOutcome: 'candidate_add',
      targetIdentityId: null,
      categoryId: CATEGORY_ID,
      codeGroupId: GROUP_ID,
      priceAuthorityReference: 'หนังสืออนุมัติราคาใหม่',
    })])

    expect(rows[0]).toMatchObject({
      targetIdentityId: null,
      targetItemCode: null,
      categoryId: CATEGORY_ID,
      codeGroupId: GROUP_ID,
    })

    await expect(validateCatalogImportPayloadV2(payloadV2({ rows }))).resolves.toBeDefined()
  })

  it('rejects a caller-selected target code for candidate adds', async () => {
    await expect(validateCatalogImportPayloadV2(payloadV2({
      rows: [rowV2({
        legacyItemCode: null,
        targetIdentityId: null,
        targetItemCode: 'AAA-BBB-099',
        identityOutcome: 'candidate_add',
        priceAuthorityReference: 'หนังสืออนุมัติราคาใหม่',
      })],
    }))).rejects.toMatchObject({
      code: 'CATALOG_CODE_SERVER_ALLOCATION_REQUIRED',
    })
  })
})
