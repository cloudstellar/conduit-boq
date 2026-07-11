import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import ExcelJS from 'exceljs';
import { afterEach, describe, expect, it } from 'vitest';
import {
  ARTIFACT_MANIFEST_SCHEMA_VERSION,
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
  it('discovers moved headers semantically and verifies one retained artifact pair', async () => {
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
    expect(result.artifacts.pdf?.semantic.pageCount).toBe(3);
    expect(result.manifestPath).toBe('artifact-manifest.json');
    expect(result.artifacts.excel?.path).toBe('catalog.xlsx');
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
  includeFormula?: boolean;
  priceItemName?: string;
  verificationItemName?: string;
} = {}): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'master-catalog-artifacts-'));
  temporaryDirectories.push(directory);

  const excelPath = join(directory, 'catalog.xlsx');
  const pdfPath = join(directory, 'catalog.pdf');
  const printHtmlPath = join(directory, 'catalog-print.html');
  const workbook = makeWorkbook(options);
  const workbookBuffer = Buffer.from(await workbook.xlsx.writeBuffer());
  const pdfBuffer = makePdf(3);
  const printHtmlBuffer = Buffer.from(
    `<html><body>รายการบัญชีราคามาตรฐานงานก่อสร้างท่อร้อยสายสื่อสารใต้ดิน ${DATASET_HASH}</body></html>`,
  );

  await Promise.all([
    writeFile(excelPath, workbookBuffer),
    writeFile(pdfPath, pdfBuffer),
    writeFile(printHtmlPath, printHtmlBuffer),
  ]);

  const manifest = {
    schemaVersion: ARTIFACT_MANIFEST_SCHEMA_VERSION,
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
    version: { ...VERSION, datasetHash: DATASET_HASH },
    domProof: {
      readyState: 'complete',
      fontsReady: true,
      imagesReady: true,
      rowCount: 2,
      firstSeqInDom: 1,
      lastSeqInDom: 2,
      uniqueSeqCount: 2,
      sequenceBreakCount: 0,
      priceSectionCount: 2,
      expectedPageCount: 3,
      hashPresent: true,
      watermarkPresent: true,
    },
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

function makeWorkbook(options: {
  includeFormula?: boolean;
  priceItemName?: string;
  verificationItemName?: string;
}): ExcelJS.Workbook {
  const workbook = new ExcelJS.Workbook();
  const documentSheet = workbook.addWorksheet('ข้อมูลเอกสาร');
  const priceSheet = workbook.addWorksheet('รายการราคา');
  const dictionarySheet = workbook.addWorksheet('พจนานุกรมรหัส');
  workbook.addWorksheet('สรุปการเปลี่ยนแปลง');
  const verificationSheet = workbook.addWorksheet('ข้อมูลตรวจสอบ');

  documentSheet.addRows([
    ['ชื่อเอกสาร', 'บัญชีราคาทดสอบ'],
    ['ฉบับบัญชีราคา', VERSION.versionString],
    ['จำนวนรายการภายใต้ค่าแฮชชุดข้อมูล', String(VERSION.itemCount)],
    ['ค่าแฮชชุดข้อมูล SHA-256', DATASET_HASH],
  ]);

  for (let index = 0; index < 6; index += 1) priceSheet.addRow([`title-${index}`]);
  priceSheet.addRow([
    'ลำดับ', 'รหัสรายการ', 'รายการ', 'หน่วย', 'ค่าวัสดุ (บาท)',
    'ค่าแรง (บาท)', 'ราคาต่อหน่วย (บาท)', 'หมวดหมู่', 'รหัสบริบทงาน',
    'บริบทงาน', 'รหัสชนิดรายการ', 'ชนิดรายการ', 'สถานะ',
  ]);
  CANONICAL_ROWS.forEach((row, index) => {
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
      'ใช้งาน',
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
  CANONICAL_ROWS.forEach((row, index) => {
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
