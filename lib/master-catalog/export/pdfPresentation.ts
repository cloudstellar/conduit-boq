import {
  makeCatalogExportYearLabel,
  type CatalogExportVersionStatus,
} from './data';

export type FieldFacingPdfStampRow = {
  label: string;
  value: string;
  hash?: boolean;
};

export type FieldFacingPdfPresentation<Row> = {
  rows: Row[];
  displayedItemCount: number;
  totalItemCount: number;
  inactiveItemCount: number;
  excludedInactiveItemCount: number;
};

export function makeFieldFacingPdfYearLabel(versionString: string): string {
  return makeCatalogExportYearLabel(versionString);
}

export function getFieldFacingPdfStatus(
  status: CatalogExportVersionStatus,
): string {
  if (status === 'draft') return 'ฉบับร่าง';
  if (status === 'abandoned') return 'ยกเลิกฉบับร่าง';
  return status === 'active' ? 'เผยแพร่แล้ว' : 'จัดเก็บถาวร';
}

export function getNonCurrentPdfNotice(
  isDraftExport: boolean,
  isCurrentDefault: boolean,
): string | null {
  if (isDraftExport || isCurrentDefault) return null;
  return 'เอกสารอ้างอิงย้อนหลัง - ไม่ใช่รุ่นใช้งานปัจจุบัน';
}

export function buildFieldFacingPdfPresentation<Row extends { isActive: boolean }>(
  rows: readonly Row[],
  status: CatalogExportVersionStatus,
): FieldFacingPdfPresentation<Row> {
  if (status === 'abandoned') {
    throw new RangeError('Abandoned catalog versions are not PDF-exportable');
  }

  const presentationRows = status === 'draft'
    ? [...rows]
    : rows.filter((row) => row.isActive);
  const inactiveItemCount = rows.filter((row) => !row.isActive).length;

  return {
    rows: presentationRows,
    displayedItemCount: presentationRows.length,
    totalItemCount: rows.length,
    inactiveItemCount,
    excludedInactiveItemCount: status === 'draft'
      ? 0
      : inactiveItemCount,
  };
}

export function buildFieldFacingPdfStamp(input: {
  versionString: string;
  draftReference?: string | null;
  isDraft?: boolean;
  statusText: string;
  effectiveDate: string;
  displayedItemCount: number;
  totalItemCount: number;
  excludedInactiveItemCount: number;
  canonicalDatasetHash: string;
}): FieldFacingPdfStampRow[] {
  const countRows: FieldFacingPdfStampRow[] = input.excludedInactiveItemCount > 0
    ? [
        {
          label: 'จำนวนรายการที่แสดงในเอกสาร',
          value: input.displayedItemCount.toLocaleString('th-TH'),
        },
        {
          label: 'จำนวนรายการทั้งหมดในฉบับ',
          value: input.totalItemCount.toLocaleString('th-TH'),
        },
        {
          label: 'รายการยกเลิกใช้ที่ไม่แสดง',
          value: input.excludedInactiveItemCount.toLocaleString('th-TH'),
        },
      ]
    : [
        {
          label: 'จำนวนรายการ',
          value: input.totalItemCount.toLocaleString('th-TH'),
        },
      ];

  return [
    ...(input.isDraft
      ? [
          { label: 'รหัสร่าง', value: input.draftReference ?? '-' },
          { label: 'เลขฉบับเป้าหมาย', value: input.versionString },
        ]
      : [{ label: 'ฉบับบัญชีราคา', value: input.versionString }]),
    { label: 'สถานะ', value: input.statusText },
    { label: 'วันที่มีผล', value: input.effectiveDate },
    ...countRows,
    {
      label: 'Dataset SHA-256 (ข้อมูลครบทั้งฉบับ รวมรายการยกเลิกใช้)',
      value: input.canonicalDatasetHash,
      hash: true,
    },
  ];
}
