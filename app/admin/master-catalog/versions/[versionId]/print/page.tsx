import Image from 'next/image';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  CATALOG_EXPORT_APP_NAME,
  CATALOG_EXPORT_DOCUMENT_TITLE,
  CATALOG_EXPORT_SPEC_REVISION,
  CatalogExportError,
  loadCatalogExportDataset,
  makeCatalogExportFilename,
  type CatalogExportDataset,
  type CatalogExportRow,
} from '@/lib/master-catalog/export/data';
import { MasterCatalogPrintToolbar } from './PrintToolbar';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function MasterCatalogPrintPage({
  params,
}: {
  params: Promise<{ versionId: string }>;
}) {
  const { versionId } = await params;
  const supabase = await createClient();
  let dataset: CatalogExportDataset;

  try {
    dataset = await loadCatalogExportDataset(supabase, versionId);
  } catch (error) {
    if (
      error instanceof CatalogExportError &&
      error.code === 'CATALOG_EXPORT_UNAUTHENTICATED'
    ) {
      redirect(`/login?redirectTo=/admin/master-catalog/versions/${versionId}/print`);
    }

    return <PrintError error={error} />;
  }

  return <PrintDocument dataset={dataset} />;
}

function PrintDocument({ dataset }: { dataset: CatalogExportDataset }) {
  const groupedRows = groupRowsByCategory(dataset.rows);
  const filename = makeCatalogExportFilename(dataset, 'pdf');
  const statusText = dataset.isDraftExport
    ? 'Draft'
    : dataset.version.status === 'archived'
      ? 'Archived'
      : 'Published';
  const footerRight = dataset.isDraftExport
    ? `v${dataset.version.versionString} | Draft`
    : `v${dataset.version.versionString} | ${formatThaiDate(dataset.version.effectiveDate)}`;

  return (
    <main className="print-root">
      <style>{`
        @page {
          size: A4 portrait;
          margin: 13mm 10mm 16mm;
          @bottom-left {
            content: "ฝ่ายท่อร้อยสาย (ทฐฐ.)";
            font-family: "TH Sarabun New", Arial, sans-serif;
            font-size: 10pt;
          }
          @bottom-center {
            content: "หน้า " counter(page) "/" counter(pages);
            font-family: "TH Sarabun New", Arial, sans-serif;
            font-size: 10pt;
          }
          @bottom-right {
            content: "${cssString(footerRight)}";
            font-family: "TH Sarabun New", Arial, sans-serif;
            font-size: 10pt;
          }
        }
        * { box-sizing: border-box; }
        @font-face {
          font-family: "TH Sarabun New";
          src: url("/fonts/THSarabunNew.ttf") format("truetype");
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: "TH Sarabun New";
          src: url("/fonts/THSarabunNew Bold.ttf") format("truetype");
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        body { margin: 0; background: #f3f4f6; }
        .print-root {
          min-height: 100vh;
          color: #111827;
          font-family: "TH Sarabun New", Arial, sans-serif;
          font-size: 14pt;
          line-height: 1.25;
        }
        .toolbar {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid #d4d4d8;
          background: white;
          font-family: Arial, sans-serif;
          font-size: 14px;
        }
        .toolbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .toolbar a, .toolbar button {
          min-height: 36px;
          border: 1px solid #a1a1aa;
          border-radius: 6px;
          background: white;
          color: #111827;
          cursor: pointer;
          padding: 8px 12px;
          text-decoration: none;
        }
        .sheet {
          position: relative;
          width: 210mm;
          min-height: 297mm;
          margin: 14px auto;
          overflow: hidden;
          background: white;
          padding: 12mm 10mm 16mm;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
        }
        .watermark {
          position: fixed;
          inset: 30% 4%;
          z-index: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          transform: rotate(-24deg);
          text-align: center;
          color: rgba(185, 28, 28, 0.16);
          font-size: 28pt;
          font-weight: 700;
          line-height: 1.2;
          white-space: pre-line;
        }
        .content { position: relative; z-index: 1; }
        .doc-header {
          display: grid;
          grid-template-columns: 64px minmax(0, 1fr);
          align-items: center;
          gap: 12px;
          border-bottom: 3px solid #ffd100;
          padding-bottom: 8px;
        }
        .doc-logo { width: 64px; height: auto; }
        h1 {
          margin: 0;
          font-size: 20pt;
          line-height: 1.1;
        }
        .subtitle {
          margin-top: 3px;
          color: #52525b;
          font-size: 13pt;
        }
        .draft-banner {
          margin-top: 8px;
          border: 1px solid #fecdd3;
          background: #ffe4e6;
          color: #991b1b;
          padding: 6px 8px;
          text-align: center;
          font-weight: 700;
        }
        .stamp-grid {
          display: grid;
          grid-template-columns: 36mm minmax(0, 1fr);
          gap: 0;
          margin-top: 10px;
          border: 1px solid #d4d4d8;
          border-bottom: 0;
        }
        .stamp-key, .stamp-value {
          min-height: 8mm;
          border-bottom: 1px solid #d4d4d8;
          padding: 3px 5px;
          word-break: break-word;
        }
        .stamp-key {
          background: #f7f7f7;
          font-weight: 700;
        }
        .stamp-value.hash {
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          font-size: 8.5pt;
          line-height: 1.25;
        }
        .price-section { margin-top: 12px; break-before: page; }
        .currency-note {
          margin: 0 0 4px;
          text-align: right;
          font-size: 12pt;
          font-weight: 700;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        thead { display: table-header-group; }
        tfoot { display: table-footer-group; }
        th, td {
          border: 1px solid #737373;
          padding: 2.2mm 1.8mm;
          vertical-align: top;
        }
        th {
          background: #f3f4f6;
          font-weight: 700;
          text-align: center;
        }
        tr { break-inside: avoid; page-break-inside: avoid; }
        .category-row td {
          background: #fff7cc;
          font-weight: 700;
        }
        .seq { width: 10mm; text-align: center; }
        .unit { width: 17mm; text-align: center; }
        .money { width: 24mm; text-align: right; font-variant-numeric: tabular-nums; }
        .item-name { width: auto; }
        .footer-fallback {
          display: none;
          margin-top: 8mm;
          border-top: 1px solid #d4d4d8;
          padding-top: 2mm;
          font-size: 10pt;
          color: #52525b;
        }
        @media print {
          body { background: white; }
          .toolbar { display: none; }
          .sheet {
            width: auto;
            min-height: auto;
            margin: 0;
            padding: 0;
            box-shadow: none;
          }
          .price-section { break-before: page; }
          .footer-fallback { display: none; }
        }
      `}</style>
      <MasterCatalogPrintToolbar filename={filename} versionId={dataset.version.id} />
      <article className="sheet">
        <div className="watermark" aria-hidden="true">
          รายการบัญชีราคานี้ไม่ใช่ราคาก่อสร้างที่แท้จริงหรือถูกต้องตรงกับราคาก่อสร้าง{'\n'}
          แต่เป็นเพียงราคาโดยประมาณซึ่งใกล้เคียงกับราคาก่อสร้างจริงเท่านั้น{'\n'}
          (สำหรับกิจการ บมจ.โทรคมนาคมแห่งชาติ เท่านั้น มิให้เผยแพร่ก่อนได้รับอนุญาต)
        </div>
        <div className="content">
          <header className="doc-header">
            <Image
              src="/nt_logo.png"
              alt="NT"
              width={64}
              height={64}
              className="doc-logo"
              priority
            />
            <div>
              <h1>{CATALOG_EXPORT_DOCUMENT_TITLE}</h1>
              <div className="subtitle">
                v{dataset.version.versionString} | {statusText} | Current Default:{' '}
                {dataset.version.isCurrentDefault ? 'Yes' : 'No'}
              </div>
            </div>
          </header>
          {dataset.isDraftExport ? (
            <div className="draft-banner">DRAFT – ห้ามใช้อ้างอิง</div>
          ) : null}
          <section className="stamp-grid" aria-label="Official document summary">
            <StampRow label="หน่วยงาน" value="บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน)" />
            <StampRow label="เวอร์ชัน" value={dataset.version.versionString} />
            <StampRow label="สถานะ" value={statusText} />
            <StampRow label="Current Default" value={dataset.version.isCurrentDefault ? 'Yes' : 'No'} />
            <StampRow label="วันที่มีผล" value={displayDateWithIso(dataset.version.effectiveDate)} />
            <StampRow label="เลขที่อนุมัติ" value={dataset.version.approvalReference ?? '-'} />
            <StampRow label="วันที่เอกสารอนุมัติ" value={displayDateWithIso(dataset.version.approvalDocumentDate)} />
            <StampRow label="เผยแพร่โดย" value={dataset.version.publishedByDisplayName ?? '-'} />
            <StampRow label="Exported at/by" value={`${formatThaiDateTime(dataset.exportedAtIso)} / ${dataset.exportedBy.displayName}`} />
            <StampRow label="จำนวนรายการ" value={dataset.counts.rowCount.toLocaleString('th-TH')} />
            <StampRow label="Dataset SHA-256" value={dataset.canonicalDatasetHash} hash />
            <StampRow label="Generated by" value={`${CATALOG_EXPORT_APP_NAME} | ${CATALOG_EXPORT_SPEC_REVISION}`} />
          </section>
        </div>
      </article>
      <article className="sheet price-section">
        <div className="watermark" aria-hidden="true">
          รายการบัญชีราคานี้ไม่ใช่ราคาก่อสร้างที่แท้จริงหรือถูกต้องตรงกับราคาก่อสร้าง{'\n'}
          แต่เป็นเพียงราคาโดยประมาณซึ่งใกล้เคียงกับราคาก่อสร้างจริงเท่านั้น{'\n'}
          (สำหรับกิจการ บมจ.โทรคมนาคมแห่งชาติ เท่านั้น มิให้เผยแพร่ก่อนได้รับอนุญาต)
        </div>
        <div className="content">
          <p className="currency-note">(หน่วยเงิน: บาท)</p>
          <table>
            <thead>
              <tr>
                <th className="seq">ลำดับ</th>
                <th className="item-name">รายการ</th>
                <th className="unit">หน่วยนับ</th>
                <th className="money">ค่าวัสดุ</th>
                <th className="money">ค่าแรง</th>
                <th className="money">ราคาต่อหน่วย</th>
              </tr>
            </thead>
            <tbody>
              {groupedRows.map((group) => (
                <PriceGroup
                  key={group.category}
                  category={group.category}
                  rows={group.rows}
                />
              ))}
            </tbody>
          </table>
          <div className="footer-fallback">
            ฝ่ายท่อร้อยสาย (ทฐฐ.) | {footerRight}
          </div>
        </div>
      </article>
    </main>
  );
}

function StampRow({
  label,
  value,
  hash = false,
}: {
  label: string;
  value: string;
  hash?: boolean;
}) {
  return (
    <>
      <div className="stamp-key">{label}</div>
      <div className={hash ? 'stamp-value hash' : 'stamp-value'}>{value}</div>
    </>
  );
}

function PriceGroup({
  category,
  rows,
}: {
  category: string;
  rows: CatalogExportRow[];
}) {
  return (
    <>
      <tr className="category-row">
        <td colSpan={6}>{category}</td>
      </tr>
      {rows.map((row) => (
        <tr key={row.id}>
          <td className="seq">{row.sequence.toLocaleString('th-TH')}</td>
          <td className="item-name">{row.itemName}</td>
          <td className="unit">{row.unit}</td>
          <td className="money">{formatMoney(row.materialCost)}</td>
          <td className="money">{formatMoney(row.laborCost)}</td>
          <td className="money">{formatMoney(row.unitCost)}</td>
        </tr>
      ))}
    </>
  );
}

function PrintError({ error }: { error: unknown }) {
  const code = error instanceof CatalogExportError
    ? error.code
    : 'CATALOG_EXPORT_INTERNAL_ERROR';
  const message = error instanceof CatalogExportError
    ? error.message
    : 'Catalog print export could not be generated';

  return (
    <main style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      padding: 24,
      background: '#f4f4f5',
      color: '#18181b',
      fontFamily: 'Arial, sans-serif',
    }}>
      <section style={{
        maxWidth: 680,
        border: '1px solid #fecaca',
        borderRadius: 8,
        background: '#fff',
        padding: 24,
      }}>
        <h1 style={{ marginTop: 0, fontSize: 20 }}>ไม่สามารถสร้าง PDF/print export ได้</h1>
        <p>{message}</p>
        <p style={{ color: '#71717a', fontFamily: 'monospace' }}>{code}</p>
      </section>
    </main>
  );
}

function groupRowsByCategory(rows: readonly CatalogExportRow[]) {
  const groups = new Map<string, { category: string; rows: CatalogExportRow[]; minDisplayOrder: number }>();

  for (const row of [...rows].sort(compareDisplayRows)) {
    const category = row.categoryName ?? row.categoryCode ?? 'ไม่ระบุหมวดหมู่';
    const group = groups.get(category) ?? {
      category,
      rows: [],
      minDisplayOrder: row.displayOrder,
    };
    group.rows.push(row);
    group.minDisplayOrder = Math.min(group.minDisplayOrder, row.displayOrder);
    groups.set(category, group);
  }

  return [...groups.values()]
    .sort((left, right) => left.minDisplayOrder - right.minDisplayOrder)
    .map(({ category, rows }) => ({ category, rows }));
}

function compareDisplayRows(left: CatalogExportRow, right: CatalogExportRow): number {
  if (left.displayOrder !== right.displayOrder) {
    return left.displayOrder - right.displayOrder;
  }

  return left.itemCode.localeCompare(right.itemCode, 'en');
}

function displayDateWithIso(value: string | null): string {
  if (!value) return '-';
  return `${formatThaiDate(value)} (${value})`;
}

function formatThaiDate(value: string | null): string {
  if (!value) return '-';
  return new Intl.DateTimeFormat('th-TH', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${value.slice(0, 10)}T00:00:00+07:00`));
}

function formatThaiDateTime(value: string | null): string {
  if (!value) return '-';
  return new Intl.DateTimeFormat('th-TH', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatMoney(value: number): string {
  return value.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function cssString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
