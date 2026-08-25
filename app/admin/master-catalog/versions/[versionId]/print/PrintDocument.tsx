/* eslint-disable @next/next/no-img-element -- Plain public images keep the print/PDF table headers stable. */
import localFont from 'next/font/local';
import {
  CATALOG_EXPORT_DOCUMENT_TITLE,
  CATALOG_EXPORT_DEPARTMENT_FOOTER,
  makeCatalogExportDocumentTitle,
  makeCatalogExportFilename,
  type CatalogExportDataset,
  type CatalogExportRow,
} from '@/lib/master-catalog/export/data';
import {
  buildFieldFacingPdfStamp,
  getFieldFacingPdfStatus,
  getNonCurrentPdfNotice,
  makeFieldFacingPdfYearLabel,
} from '@/lib/master-catalog/export/pdfPresentation';
import {
  formatCatalogPdfCategoryHeading,
  paginateCatalogPdfRows,
  type CatalogPdfPageEntry,
} from '@/lib/master-catalog/export/pdfLayout';
import { MasterCatalogPrintToolbar } from './PrintToolbar';

const ntDocumentFont = localFont({
  src: [
    {
      path: '../../../../../fonts/nt/NT-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../../../fonts/nt/NT-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
});

const DOCUMENT_FONT_FAMILY = `${ntDocumentFont.style.fontFamily}, "TH Sarabun New", Arial, sans-serif`;
const WATERMARK_NOTICE_LINES = [
  'รายการบัญชีราคานี้ไม่ใช่ราคาก่อสร้างที่แท้จริงหรือถูกต้องตรงกับราคาก่อสร้าง',
  'แต่เป็นเพียงราคาโดยประมาณซึ่งใกล้เคียงกับราคาก่อสร้างจริงเท่านั้น',
  '(สำหรับกิจการ บมจ.โทรคมนาคมแห่งชาติ เท่านั้น มิให้เผยแพร่ก่อนได้รับอนุญาต)',
];
const WATERMARK_NOTICE_TEXT = WATERMARK_NOTICE_LINES.join('\n');
const DRAFT_PDF_MARK = 'DRAFT - ห้ามใช้อ้างอิง';
const DRAFT_DATASET_HASH_LABEL =
  'Draft dataset hash - not an official publication hash';
// Keep print pages below the measured Chrome PDF overflow threshold because long
// Thai item names wrap and can otherwise spill into sparse overflow pages.
const PRICE_PAGE_ROW_LIMIT = 45;
// The repeated draft line adds roughly 6.7 mm (line plus flex gap), so reserve
// two normal row units rather than risking a sparse overflow page.
const DRAFT_PRICE_PAGE_ROW_LIMIT = PRICE_PAGE_ROW_LIMIT - 2;

export function MasterCatalogPrintDocument({
  dataset,
}: {
  dataset: CatalogExportDataset;
}) {
  const documentVersionString = dataset.isDraftExport
    ? dataset.version.targetVersionString
    : dataset.version.officialVersionString ?? dataset.version.targetVersionString;
  const pricePages = paginateCatalogPdfRows(
    dataset.rows,
    dataset.isDraftExport ? DRAFT_PRICE_PAGE_ROW_LIMIT : PRICE_PAGE_ROW_LIMIT,
  );
  const filename = makeCatalogExportFilename(dataset, 'pdf');
  const statusText = getFieldFacingPdfStatus(dataset.version.status);
  const nonCurrentNotice = getNonCurrentPdfNotice(
    dataset.isDraftExport,
    dataset.version.isCurrentDefault,
  );
  const stampRows = buildFieldFacingPdfStamp({
    versionString: documentVersionString,
    draftReference: dataset.version.draftReference,
    isDraft: dataset.isDraftExport,
    statusText,
    effectiveDate: displayDateWithIso(dataset.version.effectiveDate),
    itemCount: dataset.counts.rowCount,
    canonicalDatasetHash: dataset.canonicalDatasetHash,
  }).map((row) => dataset.isDraftExport && row.hash
    ? { ...row, label: DRAFT_DATASET_HASH_LABEL }
    : row);
  const footerRight = dataset.isDraftExport
    ? `${DRAFT_PDF_MARK} | ${dataset.version.draftReference ?? `v${documentVersionString}`}`
    : `v${documentVersionString} | ${formatThaiDate(dataset.version.effectiveDate)}`;
  const priceListTitle = makeCatalogExportDocumentTitle(documentVersionString);
  const coverYearLabel = makeFieldFacingPdfYearLabel(documentVersionString);

  return (
    <main className={`${ntDocumentFont.className} print-root`}>
      <style>{`
	        @page {
	          size: A4 portrait;
	          margin: 12mm 5mm 16mm;
	          @bottom-left {
	            content: "${cssString(CATALOG_EXPORT_DEPARTMENT_FOOTER)}";
	            font-family: ${DOCUMENT_FONT_FAMILY};
	            font-size: 10pt;
	          }
	          @bottom-center {
	            content: "หน้า " counter(page) "/" counter(pages);
	            font-family: ${DOCUMENT_FONT_FAMILY};
	            font-size: 10pt;
	          }
	          @bottom-right {
	            content: "${cssString(footerRight)}";
	            font-family: ${DOCUMENT_FONT_FAMILY};
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
	          font-family: ${DOCUMENT_FONT_FAMILY};
	          font-size: 11.4pt;
	          line-height: 1.06;
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
	          padding: 12mm 5mm 16mm;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
        }
        .price-watermark {
          position: absolute;
          top: 97mm;
          right: -10mm;
          left: -10mm;
          z-index: 2;
          pointer-events: none;
          transform: rotate(-24deg);
          text-align: center;
          color: rgba(185, 28, 28, 0.18);
          font-size: 18pt;
          font-weight: 700;
          line-height: 1.35;
          white-space: pre;
        }
        .content { position: relative; z-index: 1; }
        .cover-content {
          min-height: 245mm;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          padding-top: 22mm;
        }
        .doc-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6mm;
          text-align: center;
          border-bottom: 3px solid #ffd100;
          padding-bottom: 8mm;
        }
        .cover-content .doc-header {
          width: 176mm;
          max-width: 100%;
          align-self: center;
        }
        .doc-logo {
          display: block;
          width: 64mm;
          height: auto;
        }
        .cover-title-block {
          display: flex;
          flex-direction: column;
          gap: 2mm;
        }
        h1 {
          margin: 0;
          font-size: 18pt;
          font-weight: 700;
          line-height: 1.1;
        }
        .cover-year {
          color: #111827;
          font-size: 18pt;
          font-weight: 700;
          line-height: 1.1;
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
        .non-current-banner {
          margin-top: 8px;
          border: 1px solid #fcd34d;
          background: #fffbeb;
          color: #92400e;
          padding: 6px 8px;
          text-align: center;
          font-weight: 700;
        }
        .stamp-grid {
          display: grid;
          grid-template-columns: 36mm minmax(0, 1fr);
          gap: 0;
          width: 176mm;
          max-width: 100%;
          align-self: center;
          margin: 10mm auto 0;
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
        .price-section {
          margin-top: 12px;
          min-height: calc(297mm - 28mm);
          break-before: page;
        }
	        table {
	          width: 198mm;
	          max-width: 100%;
	          margin: 0 auto;
	          border-collapse: collapse;
	          table-layout: fixed;
          font-size: 10.2pt;
          line-height: 1;
        }
        thead { display: table-header-group; }
        tfoot { display: table-footer-group; }
	        th, td {
	          border: 0.75pt solid #111827;
	          padding: 0.55mm 0.65mm;
	          vertical-align: top;
	        }
        th {
          background: white;
          color: #111827;
          font-weight: 700;
          text-align: center;
        }
	        .col-seq { width: 7.5mm; }
	        .col-item { width: 124mm; }
	        .col-unit { width: 12.5mm; }
	        .col-money { width: 17mm; }
	        .col-total { width: 20mm; }
        .repeat-doc-cell {
          border: 0;
          padding: 0 0 4mm;
          background: white;
        }
        .repeat-doc-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3mm;
          color: #111827;
        }
        .repeat-logo {
          display: block;
          width: 56mm;
          height: auto;
        }
        .repeat-title {
          font-size: 15.5pt;
          font-weight: 700;
          line-height: 1.15;
          text-align: center;
        }
        .repeat-draft-mark {
          color: #991b1b;
          font-size: 10.5pt;
          font-weight: 700;
          line-height: 1;
          text-align: center;
        }
        .currency-row th {
          border: 0;
          padding: 0 0 2mm;
          background: white;
          font-size: 10pt;
          font-weight: 400;
          text-align: right;
        }
	        .column-header-row th {
	          background: #fff1a8;
	          border-top-width: 1.1pt;
	          border-bottom-width: 1.1pt;
	          font-size: 10.4pt;
          line-height: 1.1;
          white-space: nowrap;
        }
        tr { break-inside: avoid; page-break-inside: avoid; }
        .category-row td {
          background: #f3f4f6;
          font-weight: 700;
          border-top-width: 1.1pt;
          border-bottom-width: 1.1pt;
        }
        .seq { text-align: center; }
        .unit { padding-left: 1.4mm; padding-right: 1.4mm; text-align: center; }
	        .money {
          font-size: 9.9pt;
          text-align: right;
          font-variant-numeric: tabular-nums;
        }
	        .item-name {
	          width: auto;
	          hyphens: none;
	          overflow-wrap: normal;
	          word-break: normal;
	        }
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
          /*
           * Rows are already pre-paginated into explicit logical tables.
           * Chromium 151 can clip the last table-header-group above the media
           * box, so print each logical thead once instead of repeating it.
           */
          thead { display: table-row-group; }
          .sheet {
            width: auto;
            min-height: auto;
            margin: 0;
            padding: 0;
            box-shadow: none;
          }
          .price-section {
            margin-top: 0;
            min-height: calc(297mm - 28mm);
            break-before: page;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .footer-fallback { display: none; }
        }
      `}</style>
      <MasterCatalogPrintToolbar filename={filename} versionId={dataset.version.id} />
      <article className="sheet">
        <div className="content cover-content">
          <header className="doc-header">
            <img
              src="/brand/nt/nt-logo-company-lockup.png"
              alt="NT"
              className="doc-logo"
            />
            <div className="cover-title-block">
              <h1>{CATALOG_EXPORT_DOCUMENT_TITLE}</h1>
              <div className="cover-year">{coverYearLabel}</div>
            </div>
          </header>
          {dataset.isDraftExport ? (
            <div className="draft-banner">{DRAFT_PDF_MARK}</div>
          ) : null}
          {nonCurrentNotice ? (
            <div className="non-current-banner">{nonCurrentNotice}</div>
          ) : null}
          <section className="stamp-grid" aria-label="Official document summary">
            {stampRows.map((row) => (
              <StampRow key={row.label} {...row} />
            ))}
          </section>
        </div>
      </article>
      {pricePages.map((page, index) => (
        <article className="sheet price-section" key={`price-page-${index}`}>
          <div className="price-watermark" aria-hidden="true">
            {WATERMARK_NOTICE_TEXT}
          </div>
          <div className="content">
            <PricePageTable
              entries={page.entries}
              priceListTitle={priceListTitle}
              draftMark={dataset.isDraftExport ? DRAFT_PDF_MARK : null}
            />
            <div className="footer-fallback">
              {CATALOG_EXPORT_DEPARTMENT_FOOTER} | {footerRight}
            </div>
          </div>
        </article>
      ))}
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

function PricePageTable({
  entries,
  priceListTitle,
  draftMark,
}: {
  entries: CatalogPdfPageEntry<CatalogExportRow>[];
  priceListTitle: string;
  draftMark: string | null;
}) {
  return (
    <table>
      <colgroup>
        <col className="col-seq" />
        <col className="col-item" />
        <col className="col-unit" />
        <col className="col-money" />
        <col className="col-money" />
        <col className="col-total" />
      </colgroup>
      <thead>
        <tr className="repeat-doc-row">
          <th colSpan={6} className="repeat-doc-cell">
            <div className="repeat-doc-header">
              <img
                src="/brand/nt/nt-logo-company-lockup.png"
                alt="NT"
                className="repeat-logo"
              />
              <div className="repeat-title">{priceListTitle}</div>
              {draftMark ? (
                <div className="repeat-draft-mark">{draftMark}</div>
              ) : null}
            </div>
          </th>
        </tr>
        <tr className="currency-row">
          <th colSpan={6}>(หน่วยเงิน: บาท)</th>
        </tr>
        <tr className="column-header-row">
          <th className="seq">ที่</th>
          <th className="item-name">รายการวัสดุ</th>
          <th className="unit">หน่วยนับ</th>
          <th className="money">ค่าวัสดุ</th>
          <th className="money">ค่าแรง</th>
          <th className="money">ราคาต่อหน่วย</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) =>
          entry.kind === 'category' ? (
            <CategoryRow
              key={entry.key}
              category={entry.category}
              categoryCode={entry.categoryCode}
              categoryKey={entry.categoryKey}
              isContinuation={entry.isContinuation}
            />
          ) : (
            <PriceRow
              key={entry.row.id}
              row={entry.row}
              categoryKey={entry.categoryKey}
              localSequence={entry.localSequence}
            />
          ),
        )}
      </tbody>
    </table>
  );
}

function CategoryRow({
  category,
  categoryCode,
  categoryKey,
  isContinuation,
}: {
  category: string;
  categoryCode: string | null;
  categoryKey: string;
  isContinuation: boolean;
}) {
  return (
    <tr
      className="category-row"
      data-category-key={categoryKey}
      data-category-code={categoryCode ?? ''}
      data-category-label={category}
      data-category-continuation={isContinuation ? 'true' : 'false'}
    >
      <td colSpan={6}>
        {formatCatalogPdfCategoryHeading({
          category,
          categoryCode,
          isContinuation,
        })}
      </td>
    </tr>
  );
}

function PriceRow({
  row,
  categoryKey,
  localSequence,
}: {
  row: CatalogExportRow;
  categoryKey: string;
  localSequence: number;
}) {
  return (
    <tr
      data-display-order={row.displayOrder}
      data-category-key={categoryKey}
      data-category-sequence={localSequence}
    >
      <td className="seq">{localSequence.toLocaleString('th-TH')}</td>
      <td className="item-name">{row.itemName}</td>
      <td className="unit">{row.unit}</td>
      <td className="money">{formatMoney(row.materialCost)}</td>
      <td className="money">{formatMoney(row.laborCost)}</td>
      <td className="money">{formatMoney(row.unitCost)}</td>
    </tr>
  );
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

function formatMoney(value: number): string {
  return value.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function cssString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
