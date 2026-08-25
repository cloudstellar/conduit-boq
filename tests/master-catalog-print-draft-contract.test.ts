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
      "'Draft dataset hash - not an official publication hash';",
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

    expect(printCss).toContain('thead { display: table-row-group; }');
    expect(printCss).toMatch(
      /\.price-section \{[\s\S]*?break-inside: avoid;[\s\S]*?page-break-inside: avoid;/,
    );
    expect(PRINT_DOCUMENT).toContain('<thead>');
    expect(PRINT_DOCUMENT).toContain('</thead>');
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
});
