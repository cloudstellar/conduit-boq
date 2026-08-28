import { describe, expect, it } from 'vitest';
import {
  formatCatalogPdfCategoryHeading,
  paginateCatalogPdfRows,
  type CatalogPdfLayoutRow,
} from '../lib/master-catalog/export/pdfLayout';
import { buildFieldFacingPdfPresentation } from '../lib/master-catalog/export/pdfPresentation';

function row(
  id: string,
  displayOrder: number,
  categoryCode: string | null,
  categoryName: string | null,
): CatalogPdfLayoutRow {
  return {
    id,
    sequence: displayOrder + 1,
    itemCode: `ITEM-${id}`,
    categoryCode,
    categoryName,
    displayOrder,
  };
}

describe('Master Catalog PDF layout', () => {
  it('makes repeated category runs contiguous while preserving within-category order', () => {
    const pages = paginateCatalogPdfRows([
      row('A-3', 4, '1.1', 'หมวด 1.1'),
      row('B-1', 1, '1.2', 'หมวด 1.2'),
      row('A-2', 2, '1.1', 'หมวด 1.1'),
      row('B-2', 3, '1.2', 'หมวด 1.2'),
      row('A-1', 0, '1.1', 'หมวด 1.1'),
    ], 20);

    expect(pages).toHaveLength(1);
    expect(pages[0].entries.map((entry) =>
      entry.kind === 'category'
        ? `category:${entry.categoryKey}`
        : `${entry.row.id}:${entry.localSequence}`,
    )).toEqual([
      'category:code:1.1',
      'A-1:1',
      'A-2:2',
      'A-3:3',
      'category:code:1.2',
      'B-1:1',
      'B-2:2',
    ]);
  });

  it('continues a category and its local sequence across page breaks', () => {
    const pages = paginateCatalogPdfRows([
      row('A-1', 0, '10.2', 'หมวด 10.2'),
      row('A-2', 1, '10.2', 'หมวด 10.2'),
      row('A-3', 2, '10.2', 'หมวด 10.2'),
      row('A-4', 3, '10.2', 'หมวด 10.2'),
    ], 3);

    expect(pages).toHaveLength(2);
    expect(pages[0].entries).toMatchObject([
      {
        kind: 'category',
        categoryKey: 'code:10.2',
        categoryCode: '10.2',
        isContinuation: false,
      },
      { kind: 'row', localSequence: 1 },
      { kind: 'row', localSequence: 2 },
    ]);
    expect(pages[1].entries).toMatchObject([
      {
        kind: 'category',
        categoryKey: 'code:10.2',
        categoryCode: '10.2',
        isContinuation: true,
      },
      { kind: 'row', localSequence: 3 },
      { kind: 'row', localSequence: 4 },
    ]);
  });

  it('uses normalized category codes as stable keys with safe fallbacks', () => {
    const pages = paginateCatalogPdfRows([
      row('A', 0, ' 1.1 ', 'ชื่อแรก'),
      row('B', 1, '1.1', 'ชื่อที่เปลี่ยนแต่รหัสเดิม'),
      row('C', 2, null, 'ชื่อ มีช่องว่าง'),
      row('D', 3, null, null),
    ], 20);

    const categories = pages.flatMap((page) => page.entries)
      .filter((entry) => entry.kind === 'category');

    expect(categories).toMatchObject([
      { categoryKey: 'code:1.1', categoryCode: '1.1', category: 'ชื่อแรก' },
      {
        categoryKey: 'name:%E0%B8%8A%E0%B8%B7%E0%B9%88%E0%B8%AD%20%E0%B8%A1%E0%B8%B5%E0%B8%8A%E0%B9%88%E0%B8%AD%E0%B8%87%E0%B8%A7%E0%B9%88%E0%B8%B2%E0%B8%87',
        categoryCode: null,
      },
      {
        categoryKey: 'uncategorized',
        categoryCode: null,
        category: 'ไม่ระบุหมวดหมู่',
      },
    ]);
  });

  it('formats an initial heading with its visible category code', () => {
    expect(formatCatalogPdfCategoryHeading({
      categoryCode: '1.1',
      category: 'งานท่อร้อยสาย',
      isContinuation: false,
    })).toBe('1.1. งานท่อร้อยสาย');
  });

  it('keeps the same visible category code on a continuation heading', () => {
    expect(formatCatalogPdfCategoryHeading({
      categoryCode: '1.1',
      category: 'งานท่อร้อยสาย',
      isContinuation: true,
    })).toBe('1.1. งานท่อร้อยสาย (ต่อ)');
  });

  it('formats an integer category code with one terminal period', () => {
    const heading = {
      categoryCode: '22',
      category: 'งานเบ็ดเตล็ด',
    };

    expect(formatCatalogPdfCategoryHeading({
      ...heading,
      isContinuation: false,
    })).toBe('22. งานเบ็ดเตล็ด');
    expect(formatCatalogPdfCategoryHeading({
      ...heading,
      isContinuation: true,
    })).toBe('22. งานเบ็ดเตล็ด (ต่อ)');
  });

  it('trims heading fields without appending a duplicate period', () => {
    expect(formatCatalogPdfCategoryHeading({
      categoryCode: ' 1.2. ',
      category: ' งานบ่อพัก ',
      isContinuation: false,
    })).toBe('1.2. งานบ่อพัก');
  });

  it('retains the category fallback without a bogus period when code is missing', () => {
    expect(formatCatalogPdfCategoryHeading({
      categoryCode: '   ',
      category: ' งานไม่มีรหัส ',
      isContinuation: false,
    })).toBe('งานไม่มีรหัส');
    expect(formatCatalogPdfCategoryHeading({
      categoryCode: null,
      category: '   ',
      isContinuation: false,
    })).toBe('ไม่ระบุหมวดหมู่');
  });

  it('continues local sequences across multiple pages including a one-row final continuation', () => {
    const pages = paginateCatalogPdfRows([
      row('A-1', 0, '22', 'งานเบ็ดเตล็ด'),
      row('A-2', 1, '22', 'งานเบ็ดเตล็ด'),
      row('A-3', 2, '22', 'งานเบ็ดเตล็ด'),
      row('A-4', 3, '22', 'งานเบ็ดเตล็ด'),
      row('A-5', 4, '22', 'งานเบ็ดเตล็ด'),
    ], 3);

    expect(pages).toHaveLength(3);
    expect(pages.map((page) => page.entries
      .filter((entry) => entry.kind === 'category')
      .map((entry) => entry.isContinuation))).toEqual([
      [false],
      [true],
      [true],
    ]);
    expect(pages.map((page) => page.entries
      .filter((entry) => entry.kind === 'row')
      .map((entry) => entry.localSequence))).toEqual([
      [1, 2],
      [3, 4],
      [5],
    ]);
  });

  it('groups each category once even when the final block differs from the final global row', () => {
    const rows = [
      row('A-1', 0, '1.1', 'หมวด A'),
      row('B-1', 1, '1.2', 'หมวด B'),
      row('A-2', 2, '1.1', 'หมวด A'),
    ];
    const entries = paginateCatalogPdfRows(rows, 20)
      .flatMap((page) => page.entries);

    expect(entries
      .filter((entry) => entry.kind === 'category')
      .map((entry) => entry.categoryKey)).toEqual([
      'code:1.1',
      'code:1.2',
    ]);
    expect(entries
      .filter((entry) => entry.kind === 'row')
      .map((entry) => entry.row.id)).toEqual([
      'A-1',
      'A-2',
      'B-1',
    ]);
    expect(rows.at(-1)?.categoryCode).toBe('1.1');
    expect(entries.at(-1)).toMatchObject({
      kind: 'row',
      row: { categoryCode: '1.2' },
    });
  });

  it('rejects row limits that cannot hold a category heading and one item', () => {
    expect(() => paginateCatalogPdfRows([], 1)).toThrow(RangeError);
    expect(() => paginateCatalogPdfRows([], 2.5)).toThrow(RangeError);
  });

  it('omits inactive-only categories and restarts visible sequences after official filtering', () => {
    const sourceRows = [
      { ...row('inactive-a', 0, '1.1', 'หมวด A'), isActive: false },
      { ...row('active-b1', 1, '1.2', 'หมวด B'), isActive: true },
      { ...row('inactive-b', 2, '1.2', 'หมวด B'), isActive: false },
      { ...row('active-b2', 3, '1.2', 'หมวด B'), isActive: true },
    ];
    const presentation = buildFieldFacingPdfPresentation(sourceRows, 'active');
    const entries = paginateCatalogPdfRows(presentation.rows, 20)
      .flatMap((page) => page.entries);

    expect(entries
      .filter((entry) => entry.kind === 'category')
      .map((entry) => entry.categoryKey)).toEqual(['code:1.2']);
    expect(entries
      .filter((entry) => entry.kind === 'row')
      .map((entry) => [entry.row.id, entry.localSequence])).toEqual([
      ['active-b1', 1],
      ['active-b2', 2],
    ]);
    expect(sourceRows).toHaveLength(4);
  });
});
