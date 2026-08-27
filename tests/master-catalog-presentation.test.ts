import { describe, expect, it } from 'vitest';
import {
  formatCatalogDictionaryLabel,
  formatCatalogVersionBackLabel,
} from '../lib/master-catalog/admin/presentation';

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

  it.each(['active', 'archived'])(
    'uses the issued version label for %s rows while retaining draft provenance',
    (versionStatus) => {
      expect(formatCatalogVersionBackLabel({
        versionStatus,
        draftReference: '2568.1.0-D002',
        targetVersionString: '2568.1.0',
      })).toBe('2568.1.0');
    },
  );

  it.each(['draft', 'abandoned'])(
    'uses the immutable draft reference for %s rows',
    (versionStatus) => {
      expect(formatCatalogVersionBackLabel({
        versionStatus,
        draftReference: '2568.1.0-D002',
        targetVersionString: '2568.1.0',
      })).toBe('2568.1.0-D002');
    },
  );

  it('labels a draft by its target when its reference is unavailable', () => {
    expect(formatCatalogVersionBackLabel({
      versionStatus: 'draft',
      draftReference: null,
      targetVersionString: '2568.1.0',
    })).toBe('เป้าหมาย 2568.1.0');
  });
});
