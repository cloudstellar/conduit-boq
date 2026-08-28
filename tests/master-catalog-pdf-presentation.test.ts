import { describe, expect, it } from 'vitest';
import {
  buildFieldFacingPdfPresentation,
  buildFieldFacingPdfStamp,
  getFieldFacingPdfStatus,
  getNonCurrentPdfNotice,
  makeFieldFacingPdfYearLabel,
} from '../lib/master-catalog/export/pdfPresentation';

describe('Master Catalog field-facing PDF presentation', () => {
  it('keeps field-facing version, status, truthful counts, and the complete-dataset hash', () => {
    const rows = buildFieldFacingPdfStamp({
      versionString: '2568.0.0',
      statusText: 'เผยแพร่แล้ว',
      effectiveDate: '1 ม.ค. 2569 (2026-01-01)',
      displayedItemCount: 700,
      totalItemCount: 710,
      excludedInactiveItemCount: 10,
      canonicalDatasetHash: 'sha256:test',
    });

    expect(rows.map((row) => row.label)).toEqual([
      'ฉบับบัญชีราคา',
      'สถานะ',
      'วันที่มีผล',
      'จำนวนรายการที่แสดงในเอกสาร',
      'จำนวนรายการทั้งหมดในฉบับ',
      'รายการยกเลิกใช้ที่ไม่แสดง',
      'Dataset SHA-256 (ข้อมูลครบทั้งฉบับ รวมรายการยกเลิกใช้)',
    ]);
    expect(rows.slice(3, 6).map((row) => row.value)).toEqual([
      '700',
      '710',
      '10',
    ]);
    expect(rows.find((row) => row.hash)).toMatchObject({
      value: 'sha256:test',
      hash: true,
    });
  });

  it('uses Thai status text and warns only for non-current non-draft exports', () => {
    expect(getFieldFacingPdfStatus('draft')).toBe('ฉบับร่าง');
    expect(getFieldFacingPdfStatus('active')).toBe('เผยแพร่แล้ว');
    expect(getFieldFacingPdfStatus('archived')).toBe('จัดเก็บถาวร');
    expect(getFieldFacingPdfStatus('abandoned')).toBe('ยกเลิกฉบับร่าง');
    expect(getNonCurrentPdfNotice(false, true)).toBeNull();
    expect(getNonCurrentPdfNotice(true, false)).toBeNull();
    expect(getNonCurrentPdfNotice(false, false))
      .toBe('เอกสารอ้างอิงย้อนหลัง - ไม่ใช่รุ่นใช้งานปัจจุบัน');
  });

  it('labels a review PDF by immutable draft reference and target version', () => {
    const rows = buildFieldFacingPdfStamp({
      versionString: '2568.1.0',
      draftReference: '2568.1.0-D001',
      isDraft: true,
      statusText: 'ฉบับร่าง',
      effectiveDate: '-',
      displayedItemCount: 710,
      totalItemCount: 710,
      excludedInactiveItemCount: 0,
      canonicalDatasetHash: 'sha256:test',
    });

    expect(rows.slice(0, 2)).toEqual([
      { label: 'รหัสร่าง', value: '2568.1.0-D001' },
      { label: 'เลขฉบับเป้าหมาย', value: '2568.1.0' },
    ]);
  });

  it('keeps the catalog year as a distinct Thai cover line', () => {
    expect(makeFieldFacingPdfYearLabel('2568.0.0')).toBe('ประจำปี 2568');
    expect(makeFieldFacingPdfYearLabel('2569.1.0')).toBe('ประจำปี 2569');
  });

  it('filters inactive rows only for published and archived PDFs', () => {
    const input = [
      { id: 'inactive-first', isActive: false },
      { id: 'active-1', isActive: true },
      { id: 'inactive-middle', isActive: false },
      { id: 'active-2', isActive: true },
      { id: 'inactive-last', isActive: false },
    ];

    for (const status of ['active', 'archived'] as const) {
      expect(buildFieldFacingPdfPresentation(input, status)).toEqual({
        rows: [input[1], input[3]],
        displayedItemCount: 2,
        totalItemCount: 5,
        inactiveItemCount: 3,
        excludedInactiveItemCount: 3,
      });
    }

    expect(input.map((row) => row.id)).toEqual([
      'inactive-first',
      'active-1',
      'inactive-middle',
      'active-2',
      'inactive-last',
    ]);
  });

  it('keeps every row in draft review PDFs and excludes none', () => {
    const input = [
      { id: 'active', isActive: true },
      { id: 'inactive', isActive: false },
    ];

    expect(buildFieldFacingPdfPresentation(input, 'draft')).toEqual({
      rows: input,
      displayedItemCount: 2,
      totalItemCount: 2,
      inactiveItemCount: 1,
      excludedInactiveItemCount: 0,
    });
  });

  it('keeps the compact single count for an all-active official PDF', () => {
    const rows = buildFieldFacingPdfStamp({
      versionString: '2568.1.0',
      statusText: 'เผยแพร่แล้ว',
      effectiveDate: '26 ส.ค. 2569 (2026-08-26)',
      displayedItemCount: 710,
      totalItemCount: 710,
      excludedInactiveItemCount: 0,
      canonicalDatasetHash: 'sha256:test',
    });

    expect(rows.map((row) => row.label)).toContain('จำนวนรายการ');
    expect(rows.map((row) => row.label)).not.toContain(
      'รายการยกเลิกใช้ที่ไม่แสดง',
    );
  });

  it('rejects unsupported abandoned-version presentation', () => {
    expect(() => buildFieldFacingPdfPresentation([], 'abandoned')).toThrow(
      'Abandoned catalog versions are not PDF-exportable',
    );
  });
});
