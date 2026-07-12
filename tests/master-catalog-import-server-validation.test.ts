import { describe, expect, it } from 'vitest';
import {
  assertCatalogImportPayloadIsDraftSafe,
  collectCatalogImportValidationDiagnostics,
  type CatalogImportDraftSnapshot,
} from '../lib/master-catalog/admin/importValidation';
import type {
  CatalogImportPayloadV1,
  NormalizedCatalogRowCandidate,
} from '../lib/master-catalog/import/types';

const VERSION_ID = '00000000-0000-4000-8000-000000000001';
const REQUEST_ID = '00000000-0000-4000-8000-000000000101';

function makeRow(
  overrides: Partial<NormalizedCatalogRowCandidate> = {},
): NormalizedCatalogRowCandidate {
  return {
    sourceRow: 2,
    sourceReference: '01_Item_Master_Final:2',
    legacyItemCode: 'ITEM-0001',
    canonicalCode: 'SMK-RCD-001',
    workContextCode: 'SMK',
    workContextNameTh: 'กลุ่มงานทดสอบ',
    itemTypeCode: 'RCD',
    itemTypeNameTh: 'งานเปลี่ยนรหัส',
    itemName: 'รายการเดิม',
    unit: 'ม.',
    materialCost: '100.00',
    laborCost: '25.00',
    unitCost: '125.00',
    categoryCode: 'SMOKE',
    identityOutcome: 'recode',
    priceAuthorityReference: null,
    ...overrides,
  };
}

function makePayload(
  overrides: Partial<CatalogImportPayloadV1> = {},
): CatalogImportPayloadV1 {
  return {
    schemaVersion: 'catalog-import-payload/1',
    parserProfileId: 'nt-item-master-2568',
    parserProfileVersion: '1',
    mode: 'supplement',
    versionId: VERSION_ID,
    expectedLockVersion: 3,
    requestId: REQUEST_ID,
    reason: 'WP-4 local-only import validation test',
    source: {
      filename: 'local-import.xlsx',
      sizeBytes: 12000,
      sha256: 'a'.repeat(64),
      physicalArchiveReference: 'local-test-only',
    },
    retirementApprovalReference: null,
    retirementConfirmedCount: null,
    rows: [makeRow()],
    ...overrides,
  };
}

function makeSnapshot(
  overrides: Partial<CatalogImportDraftSnapshot> = {},
): CatalogImportDraftSnapshot {
  return {
    status: 'draft',
    lockVersion: 3,
    basedOnVersionId: '00000000-0000-4000-8000-000000000010',
    currentVersionId: '00000000-0000-4000-8000-000000000010',
    rows: [
      {
        itemCode: 'ITEM-0001',
        identityId: '00000000-0000-4000-8000-000000000201',
        itemName: 'รายการเดิม',
        unit: 'ม.',
        materialCost: '100.00',
        laborCost: '25.00',
        unitCost: '125.00',
        categoryCode: 'SMOKE',
        categoryId: '00000000-0000-4000-8000-000000000301',
        codeGroupId: null,
        isActive: true,
      },
    ],
    codeReservations: [],
    categoryIds: ['00000000-0000-4000-8000-000000000301'],
    codeGroupIds: ['00000000-0000-4000-8000-000000000401'],
    ...overrides,
  };
}

describe('Master Catalog import server validation', () => {
  it('accepts a safe recode that preserves Production name, unit, and prices', () => {
    expect(() => assertCatalogImportPayloadIsDraftSafe(
      makePayload(),
      makeSnapshot(),
    )).not.toThrow();
  });

  it('blocks workbook price or wording deltas unless authority evidence is supplied', () => {
    const diagnostics = collectCatalogImportValidationDiagnostics(
      makePayload({
        rows: [makeRow({ materialCost: '101.00', unitCost: '126.00' })],
      }),
      makeSnapshot(),
    );

    expect(diagnostics).toContainEqual(expect.objectContaining({
      code: 'IMPORT_PRICE_AUTHORITY_REQUIRED',
      field: 'priceAuthorityReference',
    }));
  });

  it('blocks HDPE Crossing rows that still use CRS-GIP conflict codes', () => {
    const diagnostics = collectCatalogImportValidationDiagnostics(
      makePayload({
        rows: [makeRow({
          canonicalCode: 'CRS-GIP-018',
          itemName: 'งานวางท่อ 1-Ø110 มม. HDPE PE80 PN6 CROSSING',
        })],
      }),
      makeSnapshot(),
    );

    expect(diagnostics).toContainEqual(expect.objectContaining({
      code: 'IMPORT_RECONCILIATION_REQUIRED',
      field: 'canonicalCode',
    }));
  });

  it('blocks full imports whose omissions reach the retirement threshold', () => {
    const activeRows = Array.from({ length: 20 }, (_, index) => ({
      itemCode: `ITEM-${String(index + 1).padStart(4, '0')}`,
      identityId: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
      itemName: index === 0 ? 'รายการเดิม' : `รายการ ${index + 1}`,
      unit: 'ม.',
      materialCost: '100.00',
      laborCost: '25.00',
      unitCost: '125.00',
      categoryCode: 'SMOKE',
      categoryId: '00000000-0000-4000-8000-000000000301',
      codeGroupId: null,
      isActive: true,
    }));
    const diagnostics = collectCatalogImportValidationDiagnostics(
      makePayload({ mode: 'full' }),
      makeSnapshot({ rows: activeRows }),
    );

    expect(diagnostics).toContainEqual(expect.objectContaining({
      code: 'IMPORT_RETIREMENT_APPROVAL_REQUIRED',
      field: 'retirementConfirmedCount',
    }));
  });

  it('blocks workbook-only candidate adds without price authority evidence', () => {
    const diagnostics = collectCatalogImportValidationDiagnostics(
      makePayload({
        rows: [makeRow({
          legacyItemCode: null,
          canonicalCode: 'SMK-ADD-001',
          identityOutcome: 'candidate_add',
        })],
      }),
      makeSnapshot(),
    );

    expect(diagnostics).toContainEqual(expect.objectContaining({
      code: 'IMPORT_PRICE_AUTHORITY_REQUIRED',
      field: 'priceAuthorityReference',
    }));
  });
});
