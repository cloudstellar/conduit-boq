import { describe, expect, it } from 'vitest';
import { formatCatalogDictionaryLabel } from '../lib/master-catalog/admin/presentation';

describe('Master Catalog admin presentation', () => {
  it('does not repeat a dictionary value backfilled into both code and name', () => {
    expect(formatCatalogDictionaryLabel(
      '6.1. งานสร้างท่อโค้งขึ้นเสา (Riser Pole)',
      '6.1. งานสร้างท่อโค้งขึ้นเสา (Riser Pole)',
    )).toBe('6.1. งานสร้างท่อโค้งขึ้นเสา (Riser Pole)');
  });

  it('combines distinct code and name values', () => {
    expect(formatCatalogDictionaryLabel('6.1', 'งานสร้างท่อโค้งขึ้นเสา'))
      .toBe('6.1 งานสร้างท่อโค้งขึ้นเสา');
  });

  it('trims values and tolerates an empty side', () => {
    expect(formatCatalogDictionaryLabel('  CAT-A  ', '  ')).toBe('CAT-A');
    expect(formatCatalogDictionaryLabel('', '  หมวดทั่วไป  ')).toBe('หมวดทั่วไป');
  });
});
