import { describe, expect, it } from 'vitest';
import {
  buildFieldFacingPdfStamp,
  getFieldFacingPdfStatus,
  getNonCurrentPdfNotice,
  makeFieldFacingPdfYearLabel,
} from '../lib/master-catalog/export/pdfPresentation';

describe('Master Catalog field-facing PDF presentation', () => {
  it('keeps only field-facing version, status, effective-date, count, and hash metadata', () => {
    const rows = buildFieldFacingPdfStamp({
      versionString: '2568.0.0',
      statusText: 'เผยแพร่แล้ว',
      effectiveDate: '1 ม.ค. 2569 (2026-01-01)',
      itemCount: 710,
      canonicalDatasetHash: 'sha256:test',
    });

    expect(rows.map((row) => row.label)).toEqual([
      'ฉบับบัญชีราคา',
      'สถานะ',
      'วันที่มีผล',
      'จำนวนรายการ',
      'Dataset SHA-256',
    ]);
    expect(rows.find((row) => row.label === 'Dataset SHA-256')).toMatchObject({
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
      itemCount: 710,
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
});
