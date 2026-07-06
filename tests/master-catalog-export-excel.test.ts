import ExcelJS from 'exceljs';
import { describe, expect, it } from 'vitest';
import { buildCatalogExportWorkbookBuffer } from '../lib/master-catalog/export/excel';
import {
  CATALOG_EXPORT_DOCUMENT_TITLE,
  type CatalogExportDataset,
  type CatalogExportRow,
} from '../lib/master-catalog/export/data';
import {
  canonicalizeCatalogDatasetRows,
  hashCanonicalCatalogDatasetRows,
  type CanonicalCatalogDatasetRow,
} from '../lib/master-catalog/hash/canonicalDataset';

const CANONICAL_ROWS: CanonicalCatalogDatasetRow[] = [
  {
    identity_id: '00000000-0000-4000-8000-000000000002',
    item_code: 'AAA-BBB-002',
    item_name: '=HYPERLINK("https://example.invalid","bad")',
    unit: 'จุด',
    material_cost: '0.00',
    labor_cost: '75.50',
    unit_cost: '75.50',
    category_code: '1.1',
    category_name: 'หมวดทดสอบ',
    work_context_code: 'AAA',
    work_context_name_th: 'กลุ่มงานทดสอบ',
    item_type_code: 'BBB',
    item_type_name_th: 'ชนิดทดสอบ',
    is_active: false,
    display_order: 2,
  },
  {
    identity_id: '00000000-0000-4000-8000-000000000001',
    item_code: 'AAA-BBB-001',
    item_name: 'รายการทดสอบ 1',
    unit: 'ม.',
    material_cost: '100.00',
    labor_cost: '25.00',
    unit_cost: '125.00',
    category_code: '1.1',
    category_name: 'หมวดทดสอบ',
    work_context_code: 'AAA',
    work_context_name_th: 'กลุ่มงานทดสอบ',
    item_type_code: 'BBB',
    item_type_name_th: 'ชนิดทดสอบ',
    is_active: true,
    display_order: 1,
  },
];

describe('Master Catalog official Excel export', () => {
  it('creates the exact five-sheet workbook and reconstructable verification hash', async () => {
    const dataset = await makeDataset();
    const workbook = await loadWorkbook(await buildCatalogExportWorkbookBuffer(dataset));

    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual([
      'ข้อมูลเอกสาร',
      'รายการราคา',
      'พจนานุกรมรหัส',
      'สรุปการเปลี่ยนแปลง',
      'ข้อมูลตรวจสอบ',
    ]);
    expect(workbook.title).toBe(CATALOG_EXPORT_DOCUMENT_TITLE);

    const priceSheet = workbook.getWorksheet('รายการราคา');
    expect(priceSheet).toBeDefined();
    expect(readRowValues(priceSheet!, 3, 13)).toEqual([
      'ลำดับ',
      'รหัสรายการ',
      'รายการ',
      'หน่วย',
      'ค่าวัสดุ (บาท)',
      'ค่าแรง (บาท)',
      'ราคาต่อหน่วย (บาท)',
      'หมวดหมู่',
      'รหัสบริบทงาน',
      'บริบทงาน',
      'รหัสชนิดรายการ',
      'ชนิดรายการ',
      'สถานะ',
    ]);
    expect(priceSheet!.getCell(4, 5).value).toBe(100);
    expect(priceSheet!.getCell(4, 5).numFmt).toBe('#,##0.00');

    const verificationSheet = workbook.getWorksheet('ข้อมูลตรวจสอบ');
    expect(verificationSheet).toBeDefined();
    expect(readRowValues(verificationSheet!, 1, 16)).toEqual([
      'identity_id',
      'item_code',
      'item_name',
      'unit',
      'material_cost',
      'labor_cost',
      'unit_cost',
      'category_code',
      'category_name',
      'work_context_code',
      'work_context_name_th',
      'item_type_code',
      'item_type_name_th',
      'is_active',
      'display_order',
      '_canonical_row_json',
    ]);

    const canonicalRowJsonValues = dataset.rows.map((_, index) =>
      String(verificationSheet!.getCell(index + 2, 16).value),
    );
    const reconstructedCanonicalJson = `[${canonicalRowJsonValues.join(',')}]\n`;
    const reconstructedRows = JSON.parse(reconstructedCanonicalJson) as CanonicalCatalogDatasetRow[];

    expect(reconstructedCanonicalJson).toBe(dataset.canonicalJson);
    await expect(hashCanonicalCatalogDatasetRows(reconstructedRows))
      .resolves.toBe(dataset.canonicalDatasetHash);
  });

  it('keeps formula-looking strings inert and avoids formulas or hyperlinks', async () => {
    const dataset = await makeDataset();
    const workbook = await loadWorkbook(await buildCatalogExportWorkbookBuffer(dataset));
    const priceSheet = workbook.getWorksheet('รายการราคา')!;
    const verificationSheet = workbook.getWorksheet('ข้อมูลตรวจสอบ')!;

    expect(priceSheet.getCell(5, 3).value).toBe('\'=HYPERLINK("https://example.invalid","bad")');
    expect(verificationSheet.getCell(3, 3).value).toBe('=HYPERLINK("https://example.invalid","bad")');

    workbook.eachSheet((sheet) => {
      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          expect(isFormulaOrHyperlink(cell.value)).toBe(false);
        });
      });
    });
  });

  it('marks draft workbooks as non-official reference artifacts', async () => {
    const dataset = await makeDataset({ draft: true });
    const workbook = await loadWorkbook(await buildCatalogExportWorkbookBuffer(dataset));
    const documentSheet = workbook.getWorksheet('ข้อมูลเอกสาร')!;
    const priceSheet = workbook.getWorksheet('รายการราคา')!;
    const documentValues = collectSheetValues(documentSheet);

    expect(documentValues).toContain('DRAFT – ห้ามใช้อ้างอิง');
    expect(documentValues).toContain('Draft dataset hash');
    expect(documentValues).toContain('Draft dataset hash - not an official publication hash');
    expect(priceSheet.getCell(1, 1).value)
      .toBe(`DRAFT – ห้ามใช้อ้างอิง | ${CATALOG_EXPORT_DOCUMENT_TITLE}`);
  });
});

async function makeDataset(options: { draft?: boolean } = {}): Promise<CatalogExportDataset> {
  const canonicalJson = canonicalizeCatalogDatasetRows(CANONICAL_ROWS);
  const canonicalDatasetHash = await hashCanonicalCatalogDatasetRows(CANONICAL_ROWS);
  const orderedRows = JSON.parse(canonicalJson) as CanonicalCatalogDatasetRow[];
  const exportRows: CatalogExportRow[] = orderedRows.map((row, index) => ({
    id: `row-${index}`,
    sequence: row.display_order + 1,
    identityId: row.identity_id,
    itemCode: row.item_code,
    itemName: row.item_name,
    unit: row.unit,
    materialCost: Number(row.material_cost),
    laborCost: Number(row.labor_cost),
    unitCost: Number(row.unit_cost),
    categoryCode: row.category_code,
    categoryName: row.category_name,
    workContextCode: row.work_context_code,
    workContextNameTh: row.work_context_name_th,
    workContextNameEn: null,
    itemTypeCode: row.item_type_code,
    itemTypeNameTh: row.item_type_name_th,
    itemTypeNameEn: null,
    isActive: row.is_active,
    displayOrder: row.display_order,
    canonicalRow: row,
    canonicalRowJson: JSON.stringify(row),
  }));

  return {
    version: {
      id: '00000000-0000-4000-8000-000000000100',
      versionString: '2568.1.0',
      name: 'Phase 4 test catalog',
      status: options.draft ? 'draft' : 'active',
      isDefaultMirror: !options.draft,
      isCurrentDefault: !options.draft,
      basedOnVersionId: '00000000-0000-4000-8000-000000000099',
      basedOnVersionString: '2568.0.0',
      effectiveDate: options.draft ? null : '2026-06-22',
      approvalReference: options.draft ? null : 'TEST-APPROVAL',
      approvalDocumentDate: options.draft ? null : '2026-06-21',
      publishedAt: options.draft ? null : '2026-06-22T02:00:00.000Z',
      publishedByDisplayName: options.draft ? null : 'Publisher',
      datasetHash: options.draft ? null : canonicalDatasetHash,
      itemCount: options.draft ? null : exportRows.length,
      lockVersion: 1,
      createdAt: '2026-06-21T02:00:00.000Z',
      updatedAt: '2026-06-22T02:00:00.000Z',
    },
    exportedAt: new Date('2026-06-22T05:00:00.000Z'),
    exportedAtIso: '2026-06-22T05:00:00.000Z',
    exportedDateIsoIct: '2026-06-22',
    exportedBy: {
      id: '00000000-0000-4000-8000-000000000010',
      email: 'exporter@ntplc.co.th',
      firstName: 'Export',
      lastName: 'User',
      role: 'admin',
      status: 'active',
      displayName: 'Export User',
      isActiveAdmin: true,
      canReadPublishedCatalog: true,
    },
    rows: exportRows,
    dictionaryRows: [{
      workContextCode: 'AAA',
      workContextNameTh: 'กลุ่มงานทดสอบ',
      workContextNameEn: null,
      itemTypeCode: 'BBB',
      itemTypeNameTh: 'ชนิดทดสอบ',
      itemTypeNameEn: null,
      itemCount: 2,
      note: '',
    }],
    changeSets: [{
      id: '00000000-0000-4000-8000-000000000200',
      importId: null,
      changeType: 'manual',
      reason: 'test change',
      actorDisplayName: 'Export User',
      beforeLockVersion: 0,
      afterLockVersion: 1,
      createdAt: '2026-06-22T03:00:00.000Z',
      itemActionCounts: { add: 1, update: 1, retire: 0, recode: 0 },
      importSourceFilename: null,
      importSourceFileSha256: null,
      importArchiveReference: null,
    }],
    changeSummaryScope: 'admin',
    canonicalJson,
    canonicalDatasetHash,
    counts: {
      rowCount: exportRows.length,
      activeRows: 1,
      inactiveRows: 1,
      dictionaryGroups: 1,
    },
    isOfficialPublishedExport: !options.draft,
    isDraftExport: Boolean(options.draft),
  };
}

async function loadWorkbook(buffer: Buffer): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
  await workbook.xlsx.load(arrayBuffer);
  return workbook;
}

function readRowValues(sheet: ExcelJS.Worksheet, rowIndex: number, columns: number): unknown[] {
  return Array.from({ length: columns }, (_, index) => sheet.getCell(rowIndex, index + 1).value);
}

function collectSheetValues(sheet: ExcelJS.Worksheet): unknown[] {
  const values: unknown[] = [];
  sheet.eachRow((row) => {
    row.eachCell((cell) => values.push(cell.value));
  });
  return values;
}

function isFormulaOrHyperlink(value: ExcelJS.CellValue): boolean {
  if (!value || typeof value !== 'object' || value instanceof Date) {
    return false;
  }

  return 'formula' in value || 'hyperlink' in value;
}
