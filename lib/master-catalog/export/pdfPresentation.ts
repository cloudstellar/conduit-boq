import {
  makeCatalogExportYearLabel,
  type CatalogExportVersionStatus,
} from './data';

export type FieldFacingPdfStampRow = {
  label: string;
  value: string;
  hash?: boolean;
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

export function buildFieldFacingPdfStamp(input: {
  versionString: string;
  draftReference?: string | null;
  isDraft?: boolean;
  statusText: string;
  effectiveDate: string;
  itemCount: number;
  canonicalDatasetHash: string;
}): FieldFacingPdfStampRow[] {
  return [
    ...(input.isDraft
      ? [
          { label: 'รหัสร่าง', value: input.draftReference ?? '-' },
          { label: 'เลขฉบับเป้าหมาย', value: input.versionString },
        ]
      : [{ label: 'ฉบับบัญชีราคา', value: input.versionString }]),
    { label: 'สถานะ', value: input.statusText },
    { label: 'วันที่มีผล', value: input.effectiveDate },
    { label: 'จำนวนรายการ', value: input.itemCount.toLocaleString('th-TH') },
    { label: 'Dataset SHA-256', value: input.canonicalDatasetHash, hash: true },
  ];
}
