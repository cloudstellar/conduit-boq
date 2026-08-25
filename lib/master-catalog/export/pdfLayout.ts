export interface CatalogPdfLayoutRow {
  id: string;
  sequence: number;
  itemCode: string;
  categoryCode: string | null;
  categoryName: string | null;
  displayOrder: number;
}

export interface CatalogPdfCategoryEntry {
  kind: 'category';
  key: string;
  categoryKey: string;
  categoryCode: string | null;
  category: string;
  isContinuation: boolean;
}

export interface CatalogPdfRowEntry<Row extends CatalogPdfLayoutRow> {
  kind: 'row';
  row: Row;
  categoryKey: string;
  localSequence: number;
}

export type CatalogPdfPageEntry<Row extends CatalogPdfLayoutRow> =
  | CatalogPdfCategoryEntry
  | CatalogPdfRowEntry<Row>;

export interface CatalogPdfPage<Row extends CatalogPdfLayoutRow> {
  entries: CatalogPdfPageEntry<Row>[];
}

interface CatalogPdfCategoryGroup<Row extends CatalogPdfLayoutRow> {
  key: string;
  categoryCode: string | null;
  category: string;
  rows: Row[];
}

const UNCATEGORIZED_KEY = 'uncategorized';
const UNCATEGORIZED_LABEL = 'ไม่ระบุหมวดหมู่';

/**
 * Builds presentation-only PDF pages. The source rows and their global
 * displayOrder values are not changed.
 */
export function paginateCatalogPdfRows<Row extends CatalogPdfLayoutRow>(
  rows: readonly Row[],
  rowLimit: number,
): CatalogPdfPage<Row>[] {
  if (!Number.isInteger(rowLimit) || rowLimit < 2) {
    throw new RangeError('Catalog PDF row limit must be an integer of at least 2');
  }

  const pages: CatalogPdfPage<Row>[] = [];
  let entries: CatalogPdfPageEntry<Row>[] = [];
  let rowUnits = 0;

  const pushPage = () => {
    if (entries.length === 0) return;

    pages.push({ entries });
    entries = [];
    rowUnits = 0;
  };

  const addCategory = (
    group: CatalogPdfCategoryGroup<Row>,
    isContinuation: boolean,
  ) => {
    entries.push({
      kind: 'category',
      key: `category-${pages.length}-${group.key}`,
      categoryKey: group.key,
      categoryCode: group.categoryCode,
      category: group.category,
      isContinuation,
    });
    rowUnits += 1;
  };

  for (const group of groupCatalogPdfRows(rows)) {
    // Keep a category heading together with at least its first item row.
    if (rowUnits + 2 > rowLimit) {
      pushPage();
    }

    addCategory(group, false);

    for (let index = 0; index < group.rows.length; index += 1) {
      if (rowUnits + 1 > rowLimit) {
        pushPage();
        addCategory(group, true);
      }

      entries.push({
        kind: 'row',
        row: group.rows[index],
        categoryKey: group.key,
        localSequence: index + 1,
      });
      rowUnits += 1;
    }
  }

  pushPage();
  return pages;
}

function groupCatalogPdfRows<Row extends CatalogPdfLayoutRow>(
  rows: readonly Row[],
): CatalogPdfCategoryGroup<Row>[] {
  const groupsByKey = new Map<string, CatalogPdfCategoryGroup<Row>>();

  for (const row of displayOrderedRows(rows)) {
    const key = categoryKey(row);
    const existing = groupsByKey.get(key);

    if (existing) {
      existing.rows.push(row);
      continue;
    }

    groupsByKey.set(key, {
      key,
      categoryCode: normalizedText(row.categoryCode),
      category: categoryLabel(row),
      rows: [row],
    });
  }

  return [...groupsByKey.values()];
}

export function formatCatalogPdfCategoryHeading(input: Pick<
  CatalogPdfCategoryEntry,
  'categoryCode' | 'category' | 'isContinuation'
>): string {
  const categoryCode = normalizedText(input.categoryCode);
  const category = normalizedText(input.category) ?? UNCATEGORIZED_LABEL;
  const codeWithTerminator = categoryCode && !categoryCode.endsWith('.')
    ? `${categoryCode}.`
    : categoryCode;
  let heading = category;

  if (codeWithTerminator) {
    heading = category === categoryCode
      ? codeWithTerminator
      : `${codeWithTerminator} ${category}`;
  }

  return input.isContinuation ? `${heading} (ต่อ)` : heading;
}

function categoryKey(row: CatalogPdfLayoutRow): string {
  const code = normalizedText(row.categoryCode);
  if (code) return `code:${encodeURIComponent(code)}`;

  const name = normalizedText(row.categoryName);
  if (name) return `name:${encodeURIComponent(name)}`;

  return UNCATEGORIZED_KEY;
}

function categoryLabel(row: CatalogPdfLayoutRow): string {
  return normalizedText(row.categoryName)
    ?? normalizedText(row.categoryCode)
    ?? UNCATEGORIZED_LABEL;
}

function normalizedText(value: string | null): string | null {
  const normalized = value?.normalize('NFC').trim();
  return normalized ? normalized : null;
}

function displayOrderedRows<Row extends CatalogPdfLayoutRow>(
  rows: readonly Row[],
): Row[] {
  return [...rows].sort(compareDisplayRows);
}

function compareDisplayRows(
  left: CatalogPdfLayoutRow,
  right: CatalogPdfLayoutRow,
): number {
  if (left.displayOrder !== right.displayOrder) {
    return left.displayOrder - right.displayOrder;
  }

  if (left.sequence !== right.sequence) {
    return left.sequence - right.sequence;
  }

  return left.itemCode.localeCompare(right.itemCode, 'en');
}
