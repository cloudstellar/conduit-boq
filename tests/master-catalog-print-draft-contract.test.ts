import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const PRINT_DOCUMENT = readFileSync(
  resolve(
    process.cwd(),
    'app/admin/master-catalog/versions/[versionId]/print/PrintDocument.tsx',
  ),
  'utf8',
);
const MUTATION_PANEL = readFileSync(
  resolve(
    process.cwd(),
    'app/admin/master-catalog/_components/MasterCatalogMutationPanel.tsx',
  ),
  'utf8',
);
const IMPORT_PANEL = readFileSync(
  resolve(
    process.cwd(),
    'app/admin/master-catalog/_components/MasterCatalogImportPanel.tsx',
  ),
  'utf8',
);

describe('Master Catalog draft print contract', () => {
  it('uses one exact draft mark on the cover, every price-page header, and footer', () => {
    expect(PRINT_DOCUMENT).toContain(
      "const DRAFT_PDF_MARK = 'DRAFT - ห้ามใช้อ้างอิง';",
    );
    expect(PRINT_DOCUMENT).toContain(
      '<div className="draft-banner">{DRAFT_PDF_MARK}</div>',
    );
    expect(PRINT_DOCUMENT).toContain(
      '<div className="repeat-draft-mark">{draftMark}</div>',
    );
    expect(PRINT_DOCUMENT).toContain(
      'draftMark={dataset.isDraftExport ? DRAFT_PDF_MARK : null}',
    );
    expect(PRINT_DOCUMENT).toContain(
      '? `${DRAFT_PDF_MARK} | ${dataset.version.draftReference',
    );
  });

  it('labels a draft hash as non-official while retaining draft reference and target fields', () => {
    expect(PRINT_DOCUMENT).toContain(
      "'Draft dataset SHA-256 (ข้อมูลครบทั้งฉบับ รวมรายการยกเลิกใช้) - ไม่ใช่ค่าแฮชการเผยแพร่ทางการ';",
    );
    expect(PRINT_DOCUMENT).toContain(
      '? { ...row, label: DRAFT_DATASET_HASH_LABEL }',
    );
    expect(PRINT_DOCUMENT).toContain(
      'draftReference: dataset.version.draftReference',
    );
    expect(PRINT_DOCUMENT).toContain('versionString: documentVersionString');
  });

  it('keeps the exact three-line price disclaimer separate from draft status', () => {
    const watermarkMatch = PRINT_DOCUMENT.match(
      /const WATERMARK_NOTICE_LINES = \[([\s\S]*?)\];/,
    );

    expect(watermarkMatch?.[1]).toContain(
      'รายการบัญชีราคานี้ไม่ใช่ราคาก่อสร้างที่แท้จริงหรือถูกต้องตรงกับราคาก่อสร้าง',
    );
    expect(watermarkMatch?.[1]).toContain(
      'แต่เป็นเพียงราคาโดยประมาณซึ่งใกล้เคียงกับราคาก่อสร้างจริงเท่านั้น',
    );
    expect(watermarkMatch?.[1]).toContain(
      '(สำหรับกิจการ บมจ.โทรคมนาคมแห่งชาติ เท่านั้น มิให้เผยแพร่ก่อนได้รับอนุญาต)',
    );
    expect(watermarkMatch?.[1]).not.toContain('DRAFT');
    expect(watermarkMatch?.[1]?.match(/^\s*'.*',?$/gm)).toHaveLength(3);
  });

  it('guards pre-paginated tables from Chromium last-page header clipping', () => {
    const printCss = PRINT_DOCUMENT.split('@media print {')[1]
      ?.split('      `}</style>')[0];

    expect(printCss).toContain('height: 290mm;');
    expect(printCss).toContain('margin: 0 0 7mm;');
    expect(printCss).toContain('.print-fixed-price-heading');
    expect(printCss).toContain('position: fixed;');
    expect(PRINT_DOCUMENT).toContain('className="screen-price-page-heading"');
    expect(PRINT_DOCUMENT).toContain('className="print-fixed-logo"');
    expect(PRINT_DOCUMENT).toContain('className="print-fixed-title repeat-title"');
    expect(PRINT_DOCUMENT).toContain(
      'className="print-fixed-draft repeat-draft-mark"',
    );
    expect(PRINT_DOCUMENT).not.toContain('<thead>');
    expect(PRINT_DOCUMENT).toContain(
      '<div className="repeat-draft-mark">{draftMark}</div>',
    );
  });

  it('exposes normalized category heading fields for artifact proof', () => {
    expect(PRINT_DOCUMENT).toContain(
      "data-category-code={categoryCode ?? ''}",
    );
    expect(PRINT_DOCUMENT).toContain('data-category-label={category}');
  });

  it('uses presentation-filtered rows and visibly marks inactive draft rows', () => {
    expect(PRINT_DOCUMENT).toContain('pdfPresentation.rows');
    expect(PRINT_DOCUMENT).toContain(
      "data-pdf-policy={dataset.isDraftExport ? 'draft-all-mark-inactive' : 'official-active-only'}",
    );
    expect(PRINT_DOCUMENT).toContain('data-pdf-total-rows');
    expect(PRINT_DOCUMENT).toContain('data-pdf-displayed-rows');
    expect(PRINT_DOCUMENT).toContain('data-pdf-excluded-inactive-rows');
    expect(PRINT_DOCUMENT).toContain(
      'data-pdf-hash-scope="complete-version-including-inactive"',
    );
    expect(PRINT_DOCUMENT).toContain(
      "data-row-active={row.isActive ? 'true' : 'false'}",
    );
    for (const attribute of [
      'data-identity-id',
      'data-item-code',
      'data-item-name',
      'data-unit',
      'data-material-cost',
      'data-labor-cost',
      'data-unit-cost',
      'data-category-local-sequence',
    ]) {
      expect(PRINT_DOCUMENT).toContain(attribute);
    }
    expect(PRINT_DOCUMENT).toContain(
      '<span className="inactive-mark">ยกเลิกใช้</span>',
    );
    expect(PRINT_DOCUMENT).toContain('.inactive-row td');
  });

  it('shows the approved active-only PDF policy instead of pending-policy copy', () => {
    for (const panel of [MUTATION_PANEL, IMPORT_PANEL]) {
      expect(panel).toContain('PDF ฉบับร่าง');
      expect(panel).toContain('จะแสดงเฉพาะรายการใช้งาน');
      expect(panel).toContain('Dataset SHA-256');
      expect(panel).not.toContain('จนกว่านโยบายการแสดงรายการยกเลิกใช้จะได้รับอนุมัติ');
      expect(panel).not.toContain('ต้องยืนยันนโยบายเอกสารสำหรับรายการยกเลิกใช้');
    }
  });
});
