import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import ExcelJS from 'exceljs';
import { afterEach, describe, expect, it } from 'vitest';
import {
  ARTIFACT_MANIFEST_SCHEMA_VERSION,
  ARTIFACT_PDF_HASH_SCOPE,
  ARTIFACT_PDF_PRESENTATION_POLICY,
  countPdfPages,
  sha256,
  verifyMasterCatalogArtifacts,
} from '../scripts/verify-master-catalog-artifacts.mjs';

const temporaryDirectories: string[] = [];
const VERSION = {
  id: '00000000-0000-4000-8000-000000000100',
  versionString: '2568.0.0',
  status: 'active',
  isCurrentDefault: true,
  itemCount: 2,
  effectiveDate: '2026-01-01',
};
const CANONICAL_ROWS = [
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
    display_order: 0,
  },
  {
    identity_id: '00000000-0000-4000-8000-000000000002',
    item_code: 'AAA-BBB-002',
    item_name: 'รายการทดสอบ 2',
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
    is_active: true,
    display_order: 1,
  },
];
const CANONICAL_JSON = `[${CANONICAL_ROWS.map((row) => JSON.stringify(row)).join(',')}]\n`;
const DATASET_HASH = `sha256:${sha256(Buffer.from(CANONICAL_JSON))}`;
const DEPARTMENT_FOOTER = 'ส่วนวิศวกรรมท่อร้อยสาย (วทฐฐ.)';

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true })),
  );
});

describe('Master Catalog artifact verifier', () => {
  it('verifies schema 2 complete-data Excel with the P-19 official PDF proof', async () => {
    const manifestPath = await writeFixture();
    const result = await verifyMasterCatalogArtifacts(manifestPath);

    expect(result.status).toBe('passed');
    expect(result.failures).toEqual([]);
    expect(result.artifacts.excel?.semantic).toMatchObject({
      priceHeaderRow: 7,
      verificationHeaderRow: 5,
      priceDataRows: 2,
      verificationDataRows: 2,
      reconstructedDatasetHash: DATASET_HASH,
    });
    expect(result.artifacts.pdf?.semantic.pageCount).toBe(2);
    expect(result.manifestPath).toBe('artifact-manifest.json');
    expect(result.artifacts.excel?.path).toBe('catalog.xlsx');
  });

  it('remains backward-compatible with a historical schema 1 manifest', async () => {
    const manifestPath = await writeFixture({ schemaVersion: 1 });
    const result = await verifyMasterCatalogArtifacts(manifestPath);

    expect(result.status).toBe('passed');
    expect(result.failures).toEqual([]);
    expect(result.artifacts.pdf?.semantic.pageCount).toBe(3);
  });

  it('accepts a mixed official PDF that excludes inactive rows while Excel stays complete', async () => {
    const manifestPath = await writeFixture({ inactiveSecondRow: true });
    const result = await verifyMasterCatalogArtifacts(manifestPath);

    expect(result.status).toBe('passed');
    expect(result.failures).toEqual([]);
    expect(result.artifacts.excel?.semantic).toMatchObject({
      priceDataRows: 2,
      verificationDataRows: 2,
    });
  });

  it('accepts a mixed draft PDF only when every inactive row is visibly marked', async () => {
    const manifestPath = await writeFixture({
      inactiveSecondRow: true,
      versionStatus: 'draft',
    });
    const result = await verifyMasterCatalogArtifacts(manifestPath);

    expect(result.status).toBe('passed');
    expect(result.failures).toEqual([]);
  });

  it('fails closed when category-local sequence proof contains a break', async () => {
    const manifestPath = await writeFixture({
      domProof: { categorySequenceBreakCount: 1 },
    });
    const result = await verifyMasterCatalogArtifacts(manifestPath);

    expect(result.status).toBe('failed');
    expect(result.failures).toContain('DOM category-local sequence contains a break');
  });

  it('fails closed instead of coercing a null schema 2 count to zero', async () => {
    const manifestPath = await writeFixture({
      pdfPresentation: { inactiveItemCount: null },
    });
    const result = await verifyMasterCatalogArtifacts(manifestPath);

    expect(result.status).toBe('failed');
    expect(result.failures).toContain('Manifest PDF inactive item count is invalid');
  });

  it('fails closed when an official PDF renders an inactive row', async () => {
    const manifestPath = await writeFixture({
      inactiveSecondRow: true,
      domProof: {
        activeRowCount: 0,
        inactiveRowCount: 1,
        inactiveMarkedRowCount: 1,
      },
    });
    const result = await verifyMasterCatalogArtifacts(manifestPath);

    expect(result.status).toBe('failed');
    expect(result.failures).toContain('Official DOM contains an inactive row');
  });

  it('fails closed when PDF and Excel have the same row count but one PDF field is wrong', async () => {
    const manifestPath = await writeFixture({
      pdfFirstItemName: 'ชื่อใน PDF ที่ไม่ตรงกับ Excel canonical',
    });
    const result = await verifyMasterCatalogArtifacts(manifestPath);

    expect(result.status).toBe('failed');
    expect(result.failures).toContain(
      'PDF/Excel row parity mismatch at index 0 (AAA-BBB-001): itemName',
    );
  });

  it('fails closed on same-count PDF cost drift', async () => {
    const manifestPath = await writeFixture({ pdfFirstLaborCost: '25.01' });
    const result = await verifyMasterCatalogArtifacts(manifestPath);

    expect(result.status).toBe('failed');
    expect(result.failures).toContain(
      'PDF/Excel row parity mismatch at index 0 (AAA-BBB-001): laborCost',
    );
  });

  it('fails closed when PDF identities are in the wrong order', async () => {
    const manifestPath = await writeFixture({ reversePdfRows: true });
    const result = await verifyMasterCatalogArtifacts(manifestPath);

    expect(result.status).toBe('failed');
    expect(result.failures).toContain(
      'PDF/Excel row parity mismatch at index 0 (AAA-BBB-001): identityId',
    );
  });

  it('fails closed when the workbook contains a formula even if the binary hash matches', async () => {
    const manifestPath = await writeFixture({ includeFormula: true });
    const result = await verifyMasterCatalogArtifacts(manifestPath);

    expect(result.status).toBe('failed');
    expect(result.failures).toContain('Excel formula or hyperlink found: พจนานุกรมรหัส!A1');
  });

  it('counts physical PDF page objects without confusing the Pages tree', () => {
    expect(countPdfPages(makePdf(4))).toBe(4);
  });

  it('fails closed when a visible price row drifts from its canonical row', async () => {
    const manifestPath = await writeFixture({ priceItemName: 'ชื่อที่ไม่ตรง canonical' });
    const result = await verifyMasterCatalogArtifacts(manifestPath);

    expect(result.status).toBe('failed');
    expect(result.failures).toContain(
      'Excel price field mismatch: AAA-BBB-001.itemName',
    );
  });

  it('fails closed when verification columns drift from canonical JSON', async () => {
    const manifestPath = await writeFixture({ verificationItemName: 'ชื่อที่ไม่ตรง JSON' });
    const result = await verifyMasterCatalogArtifacts(manifestPath);

    expect(result.status).toBe('failed');
    expect(result.failures).toContain('Excel verification field mismatch: ข้อมูลตรวจสอบ!C6');
  });
});

async function writeFixture(options: {
  schemaVersion?: 1 | 2;
  versionStatus?: 'active' | 'archived' | 'draft';
  inactiveSecondRow?: boolean;
  includeFormula?: boolean;
  priceItemName?: string;
  verificationItemName?: string;
  pdfFirstItemName?: string;
  pdfFirstLaborCost?: string;
  reversePdfRows?: boolean;
  domProof?: Record<string, unknown>;
  pdfPresentation?: Record<string, unknown>;
} = {}): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'master-catalog-artifacts-'));
  temporaryDirectories.push(directory);

  const schemaVersion = options.schemaVersion ?? ARTIFACT_MANIFEST_SCHEMA_VERSION;
  const canonicalRows = options.inactiveSecondRow
    ? CANONICAL_ROWS.map((row, index) => index === 1 ? { ...row, is_active: false } : row)
    : CANONICAL_ROWS;
  const canonicalJson = `[${canonicalRows.map((row) => JSON.stringify(row)).join(',')}]\n`;
  const datasetHash = `sha256:${sha256(Buffer.from(canonicalJson))}`;
  const status = options.versionStatus ?? 'active';
  const activeItemCount = canonicalRows.filter((row) => row.is_active).length;
  const inactiveItemCount = canonicalRows.length - activeItemCount;
  const version = {
    ...VERSION,
    status,
    itemCount: canonicalRows.length,
    activeItemCount,
    inactiveItemCount,
    datasetHash,
  };
  const displayedItemCount = status === 'draft' ? version.itemCount : activeItemCount;
  const excludedInactiveItemCount = status === 'draft' ? 0 : inactiveItemCount;
  const displayedRows = makePdfParityRows(canonicalRows, status);
  if (options.pdfFirstItemName && displayedRows[0]) {
    displayedRows[0] = { ...displayedRows[0], itemName: options.pdfFirstItemName };
  }
  if (options.pdfFirstLaborCost && displayedRows[0]) {
    displayedRows[0] = { ...displayedRows[0], laborCost: options.pdfFirstLaborCost };
  }
  if (options.reversePdfRows) displayedRows.reverse();
  const pdfPresentation = {
    policy: ARTIFACT_PDF_PRESENTATION_POLICY,
    mode: status === 'draft' ? 'draft-all-mark-inactive' : 'official-active-only',
    hashScope: ARTIFACT_PDF_HASH_SCOPE,
    totalItemCount: version.itemCount,
    displayedItemCount,
    inactiveItemCount,
    excludedInactiveItemCount,
    ...options.pdfPresentation,
  };
  const domProof = schemaVersion === 1
    ? {
        readyState: 'complete',
        fontsReady: true,
        imagesReady: true,
        rowCount: version.itemCount,
        firstSeqInDom: 1,
        lastSeqInDom: version.itemCount,
        uniqueSeqCount: version.itemCount,
        sequenceBreakCount: 0,
        priceSectionCount: 2,
        expectedPageCount: 3,
        hashPresent: true,
        watermarkPresent: true,
        ...options.domProof,
      }
    : {
        readyState: 'complete',
        fontsReady: true,
        imagesReady: true,
        rowCount: displayedItemCount,
        pdfPolicy: pdfPresentation.mode,
        pdfHashScope: pdfPresentation.hashScope,
        totalItemCount: version.itemCount,
        displayedItemCount,
        activeItemCount,
        inactiveItemCount,
        excludedInactiveItemCount,
        activeRowCount: activeItemCount,
        inactiveRowCount: status === 'draft' ? inactiveItemCount : 0,
        invalidRowActiveCount: 0,
        inactiveMarkedRowCount: status === 'draft' ? inactiveItemCount : 0,
        uniqueDisplayOrderCount: displayedItemCount,
        invalidDisplayOrderCount: 0,
        invalidCategoryMetadataCount: 0,
        visibleSequenceMismatchCount: 0,
        invalidParityMetadataCount: 0,
        displayedRows,
        categorySequenceBreakCount: 0,
        categoryReentryCount: 0,
        categoryCount: displayedItemCount === 0 ? 0 : 1,
        priceSectionCount: displayedItemCount === 0 ? 0 : 1,
        expectedPageCount: displayedItemCount === 0 ? 1 : 2,
        hashPresent: true,
        hashScopeLabelPresent: true,
        watermarkPresent: true,
        ...options.domProof,
      };
  const excelPath = join(directory, 'catalog.xlsx');
  const pdfPath = join(directory, 'catalog.pdf');
  const printHtmlPath = join(directory, 'catalog-print.html');
  const workbook = makeWorkbook(options, version, canonicalRows, datasetHash);
  const workbookBuffer = Buffer.from(await workbook.xlsx.writeBuffer());
  const pdfBuffer = makePdf(Number(domProof.expectedPageCount));
  const printHtmlBuffer = Buffer.from(
    `<html><body>รายการบัญชีราคามาตรฐานงานก่อสร้างท่อร้อยสายสื่อสารใต้ดิน ${datasetHash}</body></html>`,
  );

  await Promise.all([
    writeFile(excelPath, workbookBuffer),
    writeFile(pdfPath, pdfBuffer),
    writeFile(printHtmlPath, printHtmlBuffer),
  ]);

  const manifest = {
    schemaVersion,
    generatedAt: '2026-07-11T05:11:00.000Z',
    gitCommit: '0'.repeat(40),
    gitBranch: 'codex/master-catalog-phase4',
    environment: 'local',
    source: {
      appOrigin: 'http://127.0.0.1:3002',
      routeKind: 'authenticated selected-version server export',
      actorRole: 'admin',
      excelRequestId: '00000000-0000-4000-8000-000000000099',
    },
    version: schemaVersion === 1
      ? {
          ...VERSION,
          status,
          itemCount: version.itemCount,
          datasetHash,
        }
      : version,
    ...(schemaVersion === 1 ? {} : { pdfPresentation }),
    domProof,
    artifacts: {
      excel: binaryEntry('catalog.xlsx', workbookBuffer),
      pdf: binaryEntry('catalog.pdf', pdfBuffer),
      printHtml: binaryEntry('catalog-print.html', printHtmlBuffer),
    },
  };
  const manifestPath = join(directory, 'artifact-manifest.json');
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  return manifestPath;
}

function makePdfParityRows(
  canonicalRows: typeof CANONICAL_ROWS,
  status: 'active' | 'archived' | 'draft',
) {
  const rows = status === 'draft'
    ? canonicalRows
    : canonicalRows.filter((row) => row.is_active);

  return rows.map((row, index) => ({
    identityId: row.identity_id,
    itemCode: row.item_code,
    itemName: row.item_name,
    unit: row.unit,
    materialCost: row.material_cost,
    laborCost: row.labor_cost,
    unitCost: row.unit_cost,
    categoryCode: row.category_code ?? '',
    categoryName: row.category_name ?? '',
    displayOrder: row.display_order,
    categoryLocalSequence: index + 1,
    isActive: row.is_active,
  }));
}

function makeWorkbook(options: {
  includeFormula?: boolean;
  priceItemName?: string;
  verificationItemName?: string;
}, version: typeof VERSION & {
  activeItemCount: number;
  inactiveItemCount: number;
  datasetHash: string;
}, canonicalRows: typeof CANONICAL_ROWS, datasetHash: string): ExcelJS.Workbook {
  const workbook = new ExcelJS.Workbook();
  const documentSheet = workbook.addWorksheet('ข้อมูลเอกสาร');
  const priceSheet = workbook.addWorksheet('รายการราคา');
  const dictionarySheet = workbook.addWorksheet('พจนานุกรมรหัส');
  workbook.addWorksheet('สรุปการเปลี่ยนแปลง');
  const verificationSheet = workbook.addWorksheet('ข้อมูลตรวจสอบ');

  documentSheet.addRows([
    ['ชื่อเอกสาร', 'บัญชีราคาทดสอบ'],
    ['ฉบับบัญชีราคา', version.versionString],
    ['จำนวนรายการภายใต้ค่าแฮชชุดข้อมูล', String(version.itemCount)],
    ['ค่าแฮชชุดข้อมูล SHA-256', datasetHash],
  ]);

  for (let index = 0; index < 6; index += 1) priceSheet.addRow([`title-${index}`]);
  priceSheet.addRow([
    'ลำดับ', 'รหัสรายการ', 'รายการ', 'หน่วย', 'ค่าวัสดุ (บาท)',
    'ค่าแรง (บาท)', 'ราคาต่อหน่วย (บาท)', 'หมวดหมู่', 'รหัสบริบทงาน',
    'บริบทงาน', 'รหัสชนิดรายการ', 'ชนิดรายการ', 'สถานะ',
  ]);
  canonicalRows.forEach((row, index) => {
    const excelRow = priceSheet.addRow([
      index + 1,
      row.item_code,
      index === 0 && options.priceItemName ? options.priceItemName : row.item_name,
      row.unit,
      Number(row.material_cost),
      Number(row.labor_cost),
      Number(row.unit_cost),
      row.category_name,
      row.work_context_code,
      row.work_context_name_th,
      row.item_type_code,
      row.item_type_name_th,
      row.is_active ? 'ใช้งาน' : 'ยกเลิกใช้',
    ]);
    for (const column of [5, 6, 7]) excelRow.getCell(column).numFmt = '#,##0.00';
  });

  for (let index = 0; index < 4; index += 1) verificationSheet.addRow([`title-${index}`]);
  verificationSheet.addRow([
    'identity_id', 'item_code', 'item_name', 'unit', 'material_cost',
    'labor_cost', 'unit_cost', 'category_code', 'category_name',
    'work_context_code', 'work_context_name_th', 'item_type_code',
    'item_type_name_th', 'is_active', 'display_order', '_canonical_row_json',
  ]);
  canonicalRows.forEach((row, index) => {
    const values = [...Object.values(row), JSON.stringify(row)];
    if (index === 0 && options.verificationItemName) {
      values[2] = options.verificationItemName;
    }
    verificationSheet.addRow(values);
  });

  if (options.includeFormula) dictionarySheet.getCell('A1').value = { formula: '1+1' };

  workbook.eachSheet((sheet) => {
    sheet.headerFooter.oddFooter = `&L${DEPARTMENT_FOOTER}&Cหน้า &P/&N`;
    sheet.headerFooter.evenFooter = sheet.headerFooter.oddFooter;
  });
  return workbook;
}

function makePdf(pageCount: number): Buffer {
  const pages = Array.from(
    { length: pageCount },
    (_, index) => `${index + 1} 0 obj\n<< /Type /Page >>\nendobj`,
  ).join('\n');
  return Buffer.from(`%PDF-1.4\n<< /Type /Pages /Count ${pageCount} >>\n${pages}\n%%EOF\n`);
}

function binaryEntry(path: string, buffer: Buffer) {
  return { path, bytes: buffer.length, binarySha256: sha256(buffer) };
}
