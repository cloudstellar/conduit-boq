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
  buildFieldFacingPdfPresentation,
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
  'Draft dataset SHA-256 (ข้อมูลครบทั้งฉบับ รวมรายการยกเลิกใช้) - ไม่ใช่ค่าแฮชการเผยแพร่ทางการ';
// Keep print pages below the measured Chrome PDF overflow threshold because long
// Thai item names wrap and can otherwise spill into sparse overflow pages.
const PRICE_PAGE_ROW_LIMIT = 40;
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
  const pdfPresentation = buildFieldFacingPdfPresentation(
    dataset.rows,
    dataset.version.status,
  );
  const pricePages = paginateCatalogPdfRows(
    pdfPresentation.rows,
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
    displayedItemCount: pdfPresentation.displayedItemCount,
    totalItemCount: pdfPresentation.totalItemCount,
    excludedInactiveItemCount: pdfPresentation.excludedInactiveItemCount,
    canonicalDatasetHash: dataset.canonicalDatasetHash,
  }).map((row) => dataset.isDraftExport && row.hash
    ? { ...row, label: DRAFT_DATASET_HASH_LABEL }
    : row);
  const footerRight = dataset.isDraftExport
    ? `${DRAFT_PDF_MARK} | ${dataset.version.draftReference ?? `v${documentVersionString}`}`
    : `v${documentVersionString} | ${formatThaiDate(dataset.version.effectiveDate)}`;
  const priceListTitle = makeCatalogExportDocumentTitle(documentVersionString);
  const coverYearLabel = makeFieldFacingPdfYearLabel(documentVersionString);
  const totalPageCount = pricePages.length + 1;

  return (
    <main
      className={`${ntDocumentFont.className} print-root`}
      data-pdf-policy={dataset.isDraftExport ? 'draft-all-mark-inactive' : 'official-active-only'}
      data-pdf-total-rows={pdfPresentation.totalItemCount}
      data-pdf-displayed-rows={pdfPresentation.displayedItemCount}
      data-pdf-inactive-rows={pdfPresentation.inactiveItemCount}
      data-pdf-excluded-inactive-rows={pdfPresentation.excludedInactiveItemCount}
      data-pdf-hash-scope="complete-version-including-inactive"
    >
      <style>{`
	        @page {
	          size: A4 portrait;
              margin: 0;
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
        .repeat-doc-header {
          display: block;
          width: 198mm;
          max-width: 100%;
          margin: 0 auto 2mm;
          color: #111827;
        }
        .price-page-heading {
          position: absolute;
          top: 12mm;
          right: 5mm;
          left: 5mm;
          z-index: 3;
        }
        .print-fixed-price-heading { display: none; }
        .print-fixed-logo, .print-fixed-title, .print-fixed-draft { display: none; }
        .price-page-rows { padding-top: 33.5mm; }
        .price-page-rows.with-draft-heading { padding-top: 40.2mm; }
        .repeat-logo {
          display: block;
          width: 56mm;
          height: auto;
          margin: 0 auto;
        }
        .repeat-title {
          margin-top: 3mm;
          font-size: 15.5pt;
          font-weight: 700;
          line-height: 1.15;
          text-align: center;
        }
        .repeat-draft-mark {
          margin-top: 3mm;
          color: #991b1b;
          font-size: 10.5pt;
          font-weight: 700;
          line-height: 1;
          text-align: center;
        }
        .currency-line {
          margin-bottom: 2mm;
          font-size: 10pt;
          font-weight: 400;
          text-align: right;
        }
	        .column-header-grid {
	          display: grid;
	          grid-template-columns: 7.5mm minmax(0, 1fr) 12.5mm 17mm 17mm 20mm;
	          width: 198mm;
	          max-width: 100%;
	          margin: 0 auto;
	        }
	        .column-header-cell {
	          background: #fff1a8;
	          border: 0.75pt solid #111827;
	          border-top-width: 1.1pt;
	          border-bottom-width: 1.1pt;
	          padding: 0.55mm 0.65mm;
	          font-size: 10.4pt;
          font-weight: 700;
          line-height: 1.1;
          text-align: center;
          white-space: nowrap;
        }
        .column-header-cell + .column-header-cell { border-left: 0; }
        .price-data-table { margin-top: -0.75pt; }
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
        .inactive-row td {
          background: #fff7ed;
          color: #7c2d12;
        }
        .inactive-mark {
          display: inline-block;
          margin-left: 1.5mm;
          border: 0.75pt solid #c2410c;
          border-radius: 2mm;
          padding: 0.2mm 1.2mm;
          color: #9a3412;
          font-size: 8.8pt;
          font-weight: 700;
          line-height: 1;
          white-space: nowrap;
        }
        .page-footer {
          position: absolute;
          right: 5mm;
          bottom: 5mm;
          left: 5mm;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: end;
          gap: 4mm;
          border-top: 1px solid #d4d4d8;
          padding-top: 2mm;
          font-size: 10pt;
          color: #52525b;
        }
        .page-footer-center { text-align: center; }
        .page-footer-right { text-align: right; }
        @media print {
          body { background: white; }
          .toolbar { display: none; }
          .print-fixed-price-heading {
            display: block;
            position: fixed;
            top: 12mm;
            right: 5mm;
            left: 5mm;
            z-index: 9999;
          }
          .print-fixed-logo {
            display: block;
            position: fixed;
            top: 12mm;
            right: 5mm;
            left: 5mm;
            z-index: 9999;
          }
          .print-fixed-title {
            display: block;
            position: fixed;
            top: 25.75mm;
            right: 5mm;
            left: 5mm;
            z-index: 9999;
            margin-top: 0;
          }
          .print-fixed-draft {
            display: block;
            position: fixed;
            top: 35.05mm;
            right: 5mm;
            left: 5mm;
            z-index: 9999;
            margin-top: 0;
          }
          .sheet {
            width: 210mm;
            /* 290 mm content + 7 mm trailing spacer = one exact 297 mm A4 slot. */
            height: 290mm;
            min-height: 290mm;
            margin: 0 0 7mm;
            overflow: hidden;
            padding: 12mm 5mm 16mm;
            box-shadow: none;
            break-after: auto;
            page-break-after: auto;
          }
          .price-section {
            margin-top: 0;
            min-height: 290mm;
            background: transparent;
          }
          .cover-sheet {
            z-index: 10000;
            background: white;
          }
        }
      `}</style>
      <MasterCatalogPrintToolbar filename={filename} versionId={dataset.version.id} />
      <div className="print-fixed-logo">
        <img
          src="/brand/nt/nt-logo-company-lockup.png"
          alt=""
          className="repeat-logo"
        />
      </div>
      <div className="print-fixed-title repeat-title" aria-hidden="true">
        {priceListTitle}
      </div>
      {dataset.isDraftExport ? (
        <div className="print-fixed-draft repeat-draft-mark" aria-hidden="true">
          {DRAFT_PDF_MARK}
        </div>
      ) : null}
      <PricePageHeader
        className="print-fixed-price-heading"
        priceListTitle={priceListTitle}
        draftMark={dataset.isDraftExport ? DRAFT_PDF_MARK : null}
      />
      <article className="sheet cover-sheet">
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
        <PageFooter
          footerRight={footerRight}
          pageNumber={1}
          totalPageCount={totalPageCount}
        />
      </article>
      {pricePages.map((page, index) => (
        <article className="sheet price-section" key={`price-page-${index}`}>
          <PricePageHeader
            className="screen-price-page-heading"
            priceListTitle={priceListTitle}
            draftMark={dataset.isDraftExport ? DRAFT_PDF_MARK : null}
          />
          <div className="price-watermark" aria-hidden="true">
            {WATERMARK_NOTICE_TEXT}
          </div>
          <div
            className={`content price-page-rows${dataset.isDraftExport ? ' with-draft-heading' : ''}`}
          >
            <PricePageTable
              entries={page.entries}
            />
          </div>
          <PageFooter
            footerRight={footerRight}
            pageNumber={index + 2}
            totalPageCount={totalPageCount}
          />
        </article>
      ))}
    </main>
  );
}

function PageFooter({
  footerRight,
  pageNumber,
  totalPageCount,
}: {
  footerRight: string;
  pageNumber: number;
  totalPageCount: number;
}) {
  return (
    <footer className="page-footer">
      <span>{CATALOG_EXPORT_DEPARTMENT_FOOTER}</span>
      <span className="page-footer-center">หน้า {pageNumber}/{totalPageCount}</span>
      <span className="page-footer-right">{footerRight}</span>
    </footer>
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

function PricePageHeader({
  className,
  priceListTitle,
  draftMark,
}: {
  className: string;
  priceListTitle: string;
  draftMark: string | null;
}) {
  return (
    <div className={`price-page-heading ${className}`}>
      <header className="repeat-doc-header">
        <img
          src="/brand/nt/nt-logo-company-lockup.png"
          alt="NT"
          className="repeat-logo"
        />
        <div className="repeat-title">{priceListTitle}</div>
        {draftMark ? (
          <div className="repeat-draft-mark">{draftMark}</div>
        ) : null}
      </header>
      <div className="currency-line">(หน่วยเงิน: บาท)</div>
      <div className="column-header-grid" role="row" aria-label="หัวตารางรายการราคา">
        <div className="column-header-cell seq" role="columnheader">ที่</div>
        <div className="column-header-cell item-name" role="columnheader">รายการวัสดุ</div>
        <div className="column-header-cell unit" role="columnheader">หน่วยนับ</div>
        <div className="column-header-cell money" role="columnheader">ค่าวัสดุ</div>
        <div className="column-header-cell money" role="columnheader">ค่าแรง</div>
        <div className="column-header-cell money" role="columnheader">ราคาต่อหน่วย</div>
      </div>
    </div>
  );
}

function PricePageTable({
  entries,
}: {
  entries: CatalogPdfPageEntry<CatalogExportRow>[];
}) {
  return (
    <>
      <table className="price-data-table">
        <colgroup>
          <col className="col-seq" />
          <col className="col-item" />
          <col className="col-unit" />
          <col className="col-money" />
          <col className="col-money" />
          <col className="col-total" />
        </colgroup>
        <tbody className="print-page-body">
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
    </>
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
      className={row.isActive ? undefined : 'inactive-row'}
      data-row-active={row.isActive ? 'true' : 'false'}
      data-identity-id={row.identityId}
      data-item-code={row.itemCode}
      data-item-name={row.itemName}
      data-unit={row.unit}
      data-material-cost={row.materialCost.toFixed(2)}
      data-labor-cost={row.laborCost.toFixed(2)}
      data-unit-cost={row.unitCost.toFixed(2)}
      data-category-code={row.categoryCode ?? ''}
      data-category-name={row.categoryName ?? ''}
      data-display-order={row.displayOrder}
      data-category-key={categoryKey}
      data-category-sequence={localSequence}
      data-category-local-sequence={localSequence}
    >
      <td className="seq">{localSequence.toLocaleString('th-TH')}</td>
      <td className="item-name">
        {row.itemName}
        {row.isActive ? null : (
          <span className="inactive-mark">ยกเลิกใช้</span>
        )}
      </td>
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
