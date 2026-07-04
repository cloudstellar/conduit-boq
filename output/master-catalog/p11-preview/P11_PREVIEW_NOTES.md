# P-11 Preview Kit Notes

Status: Draft preview only. These files are not official exports, not Production publication evidence, and not P-11 approval evidence.

Generated: 2026-07-04 ICT

## Current Files

- `DRAFT-PREVIEW-NT-Master-Catalog-v2568.1.0-p11-preview.xlsx`
- `DRAFT-PREVIEW-NT-Master-Catalog-v2568.1.0-p11-preview.pdf`
- `DRAFT-PREVIEW-NT-Master-Catalog-v2568.1.0-p11-preview-portrait.pdf`
- `p11_preview_source_data.json`
- `preview-sheet-document.png`
- `preview-sheet-price-list.png`
- `preview-sheet-verification.png`
- `p11-preview-workbook-qa.json`

## Current Preview Data

The preview now uses 12 production-derived representative rows from:

`docs/plans/master-catalog/evidence/phase4-reconciliation-draft.csv`

The sample includes real item names and real production-derived price values from these business areas:

- PVC conduit in reinforced concrete encasement.
- HDPE conduit in reinforced concrete encasement.
- GIP conduit in reinforced concrete encasement.
- PVC conduit in sand backfill.
- HDPE conduit in sand backfill.
- Crossing.
- HDD.
- Riser pole.
- Manhole.
- Footway repair.

Preview dataset hash:

`sha256:591d59fb1704721cc54f64d356e0b09d409f75006a4f9229b275f96e6b1ff139`

This is a preview-only hash for the 12 sample rows. Final P-11 must use real artifacts generated from the selected database version. The implementation must re-query the database, recompute item count and dataset hash server-side, and fail closed on mismatch.

## Code Display Decision

Recommendation: do not show `item_code` as a dedicated column in the field-facing PDF price table.

Rationale:

- The field-facing price list is used to read work descriptions, units, and unit prices.
- Codes are useful for system traceability, search, reconciliation, and audit, but they make the PDF feel like a back-office export.
- The historic NT price-list format does not rely on code columns.
- The Excel workbook remains the canonical/audit export and still shows the full 13-column business export plus verification data.
- A separate audit package can show legacy/canonical codes without mixing them into the field-facing price table.

Important exception:

- If final Production still contains visually duplicate active rows with identical business text and price, the owner may need a separate decision on how the human-facing PDF should present them. The Excel export can always preserve the exact row-level identities.

## Title And Currency Unit Decision

Use this exact Thai title for the field-facing PDF:

`รายการบัญชีราคามาตรฐานงานก่อสร้างท่อร้อยสายสื่อสารใต้ดิน`

Use `หน่วยนับ` as the PDF item-unit column label.

Show `(หน่วยเงิน: บาท)` as a small right-aligned table-level note immediately above the PDF price columns/header. Repeat it with the table header on continued pages.

Rationale:

- `หน่วยนับ` is the measurement/counting unit for each row, such as `ม.`, `จุด`, or `บ่อ`.
- `บาท` is the currency unit for the price columns, not the item unit for every row.
- It should not be part of the document title because the title names the standard price list.
- It should not be in the footer because separated or copied pages need the unit near the numbers.
- Excel already carries `(บาท)` in the money column headers and should keep that explicit form.

## SHA Display Decision

The footer must not show a truncated SHA-256 as though it were a verification value.

The current PDF footer uses this pattern instead:

`v2568.1.0 | Draft`

Reason:

- a page footer should identify the document version/status for readers;
- it is too small for a full SHA-256;
- a truncated hash is useful only as a short identifier, not as proof;
- showing `sha256:...` in the footer risks teaching readers to verify against an incomplete value;
- the full hash must remain selectable/copyable in a normal text area.

Real verification requires one of these full values:

- Full SHA-256 on the cover page.
- Full SHA-256 and `_canonical_row_json` in Excel sheet `ข้อมูลตรวจสอบ`.
- Final release/filing manifest for binary file SHA-256 after the actual files are saved.

The preview was checked with PDF text extraction. The full preview hash is selectable/searchable as:

`sha256:591d59fb1704721cc54f64d356e0b09d409f75006a4f9229b275f96e6b1ff139`

## Final PDF Verification Page Decision

Recommendation: the final field-facing PDF price list should not include a technical verification page at the end.

Rationale:

- The PDF is a human-facing price list for reading, printing, approval packets, and field reference.
- A technical verification page makes the price list look like a system/audit export rather than a standard price document.
- Code mapping, canonical JSON, and hash reconstruction belong in the Excel workbook and release/filing manifest.
- The PDF cover can carry the essential official stamp: version, status, effective date, approval reference, item count, and full dataset SHA-256.

Final PDF content order should be:

1. Cover / document metadata / full dataset SHA-256.
2. Price catalog grouped by approved display category.

Verification remains in the export package:

- PDF cover: full dataset SHA-256 and official stamp.
- Excel `ข้อมูลตรวจสอบ`: `_canonical_row_json`, row identities, item codes, count, and hash reconstruction evidence.
- Release/filing manifest: binary SHA-256 of the saved PDF/XLSX files.

The preview PDF may include a verification page only as a design-review aid. It should not be treated as the final field-facing PDF structure.

## QR Code Decision Candidate

Recommendation: do not put a QR code on the final cover by default in Phase 4 Core. Add it later only if there is a stable, owner-approved verification URL.

QR code is useful only when it points to an immutable verification target, for example:

- an authenticated app verification page for the exact catalog version;
- an official archive/filing record for the exact published PDF/XLSX package;
- a static verification endpoint that displays version, item count, full dataset SHA-256, approval reference, and binary file hashes.

Do not use QR code if:

- the target URL can change or be overwritten;
- it points to a mutable current-version page instead of the exact version;
- it exposes private admin routes or tokens;
- field users cannot access it reliably;
- the document would depend on QR code as the only verification method.

If QR is added later, place it small on the cover metadata area, not in the price table, and label it:

`ตรวจสอบเอกสาร`

The full SHA-256 and approval metadata must still be printed as selectable text. QR code must be a convenience, not the source of truth.

## Watermark And Footer Decision

The field-facing price page uses a diagonal red price-disclaimer watermark above the table layer at low opacity. This avoids the table blocking the watermark while keeping item names and prices readable.

Production-generated field-facing PDF price pages, including the published official PDF, must use the same watermark wording and visual style as:

`files/รายการบัญชีราคามาตรฐานงานก่อสร้างท่อร้อยสาย 2568.pdf`

Reference watermark wording:

`รายการบัญชีราคานี้ไม่ใช่ราคาก่อสร้างที่แท้จริงหรือถูกต้องตรงกับราคาก่อสร้าง`

`แต่เป็นเพียงราคาโดยประมาณซึ่งใกล้เคียงกับราคาก่อสร้างจริงเท่านั้น`

`(สำหรับกิจการ บมจ.โทรคมนาคมแห่งชาติ เท่านั้น มิให้เผยแพร่ก่อนได้รับอนุญาต)`

This is a price-disclaimer watermark, not a Draft/Preview status mark. Draft/review status should still be shown through document status text, filename, footer, and access controls.

The cover and verification pages do not use a large diagonal watermark over the full SHA-256. This prevents watermark text from polluting copied hash text or PDF text extraction.

Footer rules:

- left footer: Thai department name, `ส่วนวิศวกรรมท่อร้อยสาย (วทฐฐ.)`;
- center footer: page number as `x/y`, for example `2/3`;
- right footer for draft preview: `v2568.1.0 | Draft`;
- right footer for published export: `v2568.1.0 | 1 ม.ค. 2570`.

## Portrait vs Landscape

Recommendation: use A4 portrait as the official human-facing PDF price list, while keeping Excel as the full 13-column machine/audit export.

Portrait strengths:

- Matches the historic NT price-list convention.
- Better for print, filing, approval packets, and field reference.
- Emphasizes item, unit, material cost, labor cost, and total unit price.
- Avoids making the PDF look like a BOQ or spreadsheet dump.

Portrait tradeoffs:

- It cannot comfortably show every structured-code dimension.
- Full dataset pagination will be longer.
- The current approved export spec still says A4 landscape for catalog tables, so choosing portrait requires a small spec amendment.

Landscape remains useful for internal audit or review, but should not be the default field-facing price-list PDF unless the owner explicitly prioritizes wide column visibility over price-list readability.

## Proposed P-11 Decision Wording

Approve the P-11 visual direction as follows:

1. Official PDF price-list layout uses A4 portrait, optimized for human reading and filing.
2. Use title `รายการบัญชีราคามาตรฐานงานก่อสร้างท่อร้อยสายสื่อสารใต้ดิน`.
3. The PDF business table shows the core field-facing price-list fields: sequence, item description, counting unit, material cost, labor cost, and total unit price.
4. Label the PDF item-unit column as `หน่วยนับ`.
5. Show `(หน่วยเงิน: บาท)` right-aligned above the PDF price columns/header and repeat it on continued price pages.
6. `item_code` is not shown as a dedicated column in the field-facing PDF price table.
7. Legacy/canonical codes remain available in the Excel workbook and release/filing evidence, not in the field-facing price table.
8. The Excel workbook remains the full 13-column canonical/business export, with the visible verification sheet and `_canonical_row_json`.
9. The footer must show version/status instead of printing a truncated hash.
10. The final field-facing PDF should not include a technical verification page at the end.
11. Do not add a QR code in Phase 4 Core unless a stable owner-approved verification URL exists.
12. Update the approved export spec before implementation because it currently states A4 landscape for catalog tables and expects footer short hash / PDF verification content differently from this decision.
13. Final P-11 approval still requires real DB-generated Excel/PDF artifacts, not this sample preview.

## Visual Checks Performed

- Compared against the historic 2568 price-list PDF.
- Generated a new portrait PDF using production-derived item names and prices.
- Removed `item_code` from the field-facing PDF price table.
- Added a separate audit code mapping page.
- Rendered PDF pages to PNG for visual inspection.
- Verified PDF text extraction can find the real item text and the full preview SHA-256.
- Regenerated Excel preview with five required sheets in the approved order.

## Known Preview Limitations

- The preview uses production-derived evidence rows, not a live DB query.
- It does not prove final pagination for 700+ rows.
- It does not exercise the final browser print route.
- The PDF preview is generated with ReportLab; final implementation should use the approved authenticated server-rendered print route.
- It does not approve final effective date, approval reference, archive reference, or Production publication.
