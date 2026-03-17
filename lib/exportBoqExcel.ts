'use client';

import type { Workbook, Worksheet, Style, Border, Fill } from 'exceljs';

// ──────────────────────────────────
// Types (mirror from print/page.tsx)
// ──────────────────────────────────

export interface ExportBOQData {
  id: string;
  estimator_name: string;
  document_date: string;
  project_name: string;
  department: string | null;
  total_cost: number;
}

export interface ExportBOQRoute {
  id: string;
  route_order: number;
  route_name: string;
  route_description: string | null;
  construction_area: string | null;
  total_material_cost: number;
  total_labor_cost: number;
  total_cost: number;
}

export interface ExportBOQItem {
  id: string;
  item_order: number;
  item_name: string;
  quantity: number;
  unit: string;
  material_cost_per_unit: number;
  labor_cost_per_unit: number;
  total_material_cost: number;
  total_labor_cost: number;
  total_cost: number;
  remarks: string | null;
}

export interface ExportSummaryAllocated {
  beforeVAT: number;
  vat: number;
  total: number;
}

// ──────────────────────────────────
// Styles
// ──────────────────────────────────

const thinBorder: Partial<Border> = { style: 'thin', color: { argb: '000000' } };
const allBorders = {
  top: thinBorder,
  left: thinBorder,
  bottom: thinBorder,
  right: thinBorder,
};

const headerFill: Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFF8E1' }, // light yellow
};

const totalFill: Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'E3F2FD' }, // light blue
};

const numberFormat = '#,##0.00';
const factorFormat = '0.0000';

function applyHeaderStyle(ws: Worksheet, row: number, colStart: number, colEnd: number) {
  for (let c = colStart; c <= colEnd; c++) {
    const cell = ws.getCell(row, c);
    cell.font = { bold: true, size: 12 };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.fill = headerFill;
    cell.border = allBorders;
  }
}

function applyTotalStyle(ws: Worksheet, row: number, colStart: number, colEnd: number) {
  for (let c = colStart; c <= colEnd; c++) {
    const cell = ws.getCell(row, c);
    cell.font = { bold: true, size: 12 };
    cell.border = allBorders;
    cell.fill = totalFill;
  }
}

// ──────────────────────────────────
// Sheet 1: Route Detail (per route)
// ──────────────────────────────────

function createRouteSheet(
  wb: Workbook,
  boq: ExportBOQData,
  route: ExportBOQRoute,
  items: ExportBOQItem[],
  sheetName: string,
) {
  const ws = wb.addWorksheet(sheetName);

  // Page setup: A4 Landscape
  ws.pageSetup = {
    paperSize: 9, // A4
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: { left: 0.3, right: 0.3, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 },
  };

  // Column widths (10 columns: A-J)
  ws.columns = [
    { width: 5 },   // A: ลำดับที่
    { width: 45 },  // B: รายการ
    { width: 12 },  // C: ปริมาณงาน
    { width: 6 },   // D: หน่วย
    { width: 12 },  // E: ราคา/หน่วย (วัสดุ)
    { width: 14 },  // F: จำนวนเงิน (วัสดุ)
    { width: 12 },  // G: ราคา/หน่วย (แรง)
    { width: 14 },  // H: จำนวนเงิน (แรง)
    { width: 16 },  // I: ค่างานต้นทุน
    { width: 14 },  // J: หมายเหตุ
  ];

  let r = 1;

  // ── Title ──
  ws.getCell(r, 1).value = 'บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน)';
  ws.getCell(r, 1).font = { bold: true, size: 14 };
  ws.mergeCells(r, 1, r, 10);
  r++;

  ws.getCell(r, 1).value = 'แบบฟอร์มแสดงรายการ ปริมาณงาน และราคางานก่อสร้างท่อร้อยสายสื่อสารใต้ดิน (BOQ)';
  ws.getCell(r, 1).font = { bold: true, size: 13 };
  ws.mergeCells(r, 1, r, 10);
  r++;

  // ── Info Section ──
  ws.getCell(r, 1).value = `ส่วนงาน: ${boq.department || 'วิศวกรรมท่อร้อยสาย (วทฐฐ.) ฝ่ายท่อร้อยสาย (ทฐฐ.)'}`;
  ws.mergeCells(r, 1, r, 5);
  ws.getCell(r, 6).value = `โครงการ: ${boq.project_name}`;
  ws.mergeCells(r, 6, r, 10);
  r++;

  ws.getCell(r, 1).value = `บัญชีราคา: งานจ้างเหมาก่อสร้างท่อร้อยสายสื่อสารใต้ดินและบ่อพัก`;
  ws.mergeCells(r, 1, r, 5);
  ws.getCell(r, 6).value = `พื้นที่ก่อสร้าง: ${route.construction_area || '-'}`;
  ws.mergeCells(r, 6, r, 10);
  r++;

  ws.getCell(r, 1).value = `เส้นทาง: ${route.route_name}`;
  ws.mergeCells(r, 1, r, 10);
  r++;

  // ── Unit label ──
  ws.getCell(r, 10).value = 'หน่วย - บาท';
  ws.getCell(r, 10).alignment = { horizontal: 'right' };
  ws.getCell(r, 10).font = { italic: true, size: 10 };
  r++;

  // ── Table Header (2 rows with merged cells) ──
  const headerRow1 = r;
  const headerRow2 = r + 1;

  // Row 1 headers
  ws.getCell(headerRow1, 1).value = 'ลำดับที่';
  ws.mergeCells(headerRow1, 1, headerRow2, 1);

  ws.getCell(headerRow1, 2).value = 'รายการ';
  ws.mergeCells(headerRow1, 2, headerRow2, 2);

  ws.getCell(headerRow1, 3).value = 'ปริมาณงาน';
  ws.mergeCells(headerRow1, 3, headerRow2, 3);

  ws.getCell(headerRow1, 4).value = 'หน่วย';
  ws.mergeCells(headerRow1, 4, headerRow2, 4);

  // Merged: ค่าวัสดุ
  ws.getCell(headerRow1, 5).value = 'ค่าวัสดุ ไม่รวมภาษีมูลค่าเพิ่ม (1)';
  ws.mergeCells(headerRow1, 5, headerRow1, 6);
  ws.getCell(headerRow2, 5).value = 'ราคา/หน่วย';
  ws.getCell(headerRow2, 6).value = 'จำนวนเงิน';

  // Merged: ค่าแรง
  ws.getCell(headerRow1, 7).value = 'ค่าแรง ไม่รวมภาษีมูลค่าเพิ่ม (2)';
  ws.mergeCells(headerRow1, 7, headerRow1, 8);
  ws.getCell(headerRow2, 7).value = 'ราคา/หน่วย';
  ws.getCell(headerRow2, 8).value = 'จำนวนเงิน';

  ws.getCell(headerRow1, 9).value = 'ค่างานต้นทุน\n(3)=(1)+(2)';
  ws.mergeCells(headerRow1, 9, headerRow2, 9);

  ws.getCell(headerRow1, 10).value = 'หมายเหตุ';
  ws.mergeCells(headerRow1, 10, headerRow2, 10);

  // Apply header styles
  applyHeaderStyle(ws, headerRow1, 1, 10);
  applyHeaderStyle(ws, headerRow2, 1, 10);

  // Set header row height
  ws.getRow(headerRow1).height = 28;
  ws.getRow(headerRow2).height = 20;

  r = headerRow2 + 1;

  // ── Data Rows ──
  const sortedItems = [...items].sort((a, b) => a.item_order - b.item_order);

  sortedItems.forEach((item, idx) => {
    const row = ws.getRow(r);
    ws.getCell(r, 1).value = idx + 1;
    ws.getCell(r, 1).alignment = { horizontal: 'center' };
    ws.getCell(r, 2).value = item.item_name;
    ws.getCell(r, 2).alignment = { wrapText: true };
    ws.getCell(r, 3).value = item.quantity;
    ws.getCell(r, 3).numFmt = numberFormat;
    ws.getCell(r, 3).alignment = { horizontal: 'right' };
    ws.getCell(r, 4).value = item.unit;
    ws.getCell(r, 4).alignment = { horizontal: 'center' };
    ws.getCell(r, 5).value = item.material_cost_per_unit;
    ws.getCell(r, 5).numFmt = numberFormat;
    ws.getCell(r, 5).alignment = { horizontal: 'right' };
    ws.getCell(r, 6).value = item.total_material_cost;
    ws.getCell(r, 6).numFmt = numberFormat;
    ws.getCell(r, 6).alignment = { horizontal: 'right' };
    ws.getCell(r, 7).value = item.labor_cost_per_unit;
    ws.getCell(r, 7).numFmt = numberFormat;
    ws.getCell(r, 7).alignment = { horizontal: 'right' };
    ws.getCell(r, 8).value = item.total_labor_cost;
    ws.getCell(r, 8).numFmt = numberFormat;
    ws.getCell(r, 8).alignment = { horizontal: 'right' };
    ws.getCell(r, 9).value = item.total_cost;
    ws.getCell(r, 9).numFmt = numberFormat;
    ws.getCell(r, 9).alignment = { horizontal: 'right' };
    ws.getCell(r, 10).value = item.remarks || '';

    // Apply borders
    for (let c = 1; c <= 10; c++) {
      ws.getCell(r, c).border = allBorders;
      ws.getCell(r, c).font = { size: 11 };
    }

    r++;
  });

  // ── Total Row ──
  ws.getCell(r, 2).value = 'ผลรวมค่างานต้นทุน';
  ws.getCell(r, 2).alignment = { horizontal: 'right' };
  ws.getCell(r, 6).value = route.total_material_cost;
  ws.getCell(r, 6).numFmt = numberFormat;
  ws.getCell(r, 6).alignment = { horizontal: 'right' };
  ws.getCell(r, 8).value = route.total_labor_cost;
  ws.getCell(r, 8).numFmt = numberFormat;
  ws.getCell(r, 8).alignment = { horizontal: 'right' };
  ws.getCell(r, 9).value = route.total_cost;
  ws.getCell(r, 9).numFmt = numberFormat;
  ws.getCell(r, 9).alignment = { horizontal: 'right' };

  applyTotalStyle(ws, r, 1, 10);

  r += 2;

  // ── Estimator ──
  ws.getCell(r, 8).value = `ผู้ประมาณราคา ${boq.estimator_name}`;
  ws.mergeCells(r, 8, r, 10);
  ws.getCell(r, 8).alignment = { horizontal: 'center' };
  r++;

  if (boq.document_date) {
    const d = new Date(boq.document_date);
    const thaiMonth = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
      'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
    const dateStr = `${thaiMonth[d.getMonth()]} พ.ศ. ${d.getFullYear() + 543}`;
    ws.getCell(r, 8).value = dateStr;
    ws.mergeCells(r, 8, r, 10);
    ws.getCell(r, 8).alignment = { horizontal: 'center' };
  }
}

// ──────────────────────────────────
// Sheet: Summary
// ──────────────────────────────────

function createSummarySheet(
  wb: Workbook,
  boq: ExportBOQData,
  routes: ExportBOQRoute[],
  allocated: ExportSummaryAllocated[],
  factor: number,
  constructionCostBeforeVAT: number,
  vatAmount: number,
  totalWithVAT: number,
) {
  const ws = wb.addWorksheet('สรุปรวม');

  ws.pageSetup = {
    paperSize: 9,
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: { left: 0.3, right: 0.3, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 },
  };

  ws.columns = [
    { width: 5 },   // A: ที่
    { width: 40 },  // B: รายการ
    { width: 14 },  // C: ค่างานต้นทุน
    { width: 10 },  // D: Factor F ≤ 5 ลบ.
    { width: 10 },  // E: Factor F > 5 ลบ.
    { width: 16 },  // F: ค่าก่อสร้างไม่รวม VAT
    { width: 14 },  // G: ภาษีมูลค่าเพิ่ม
    { width: 16 },  // H: ค่าก่อสร้างรวม VAT
    { width: 14 },  // I: หมายเหตุ
  ];

  const grandTotalInMillion = boq.total_cost / 1000000;
  const showFactorLTE5 = grandTotalInMillion <= 5;
  const showFactorGT5 = grandTotalInMillion > 5;

  let r = 1;

  // ── Title ──
  ws.getCell(r, 1).value = 'บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน)';
  ws.getCell(r, 1).font = { bold: true, size: 14 };
  ws.mergeCells(r, 1, r, 9);
  r++;

  ws.getCell(r, 1).value = 'สรุปรวม บัญชีราคา งานจ้างเหมาก่อสร้างท่อร้อยสายสื่อสารใต้ดินและบ่อพัก';
  ws.getCell(r, 1).font = { bold: true, size: 13 };
  ws.mergeCells(r, 1, r, 9);
  r++;

  // ── Info ──
  ws.getCell(r, 1).value = `ส่วนงาน: ${boq.department || 'วิศวกรรมท่อร้อยสาย (วทฐฐ.) ฝ่ายท่อร้อยสาย (ทฐฐ.)'}`;
  ws.mergeCells(r, 1, r, 5);
  ws.getCell(r, 6).value = `โครงการ: ${boq.project_name}`;
  ws.mergeCells(r, 6, r, 9);
  r++;

  ws.getCell(r, 1).value = `จำนวนเส้นทาง: ${routes.length} เส้นทาง`;
  ws.mergeCells(r, 1, r, 9);
  r++;
  r++; // blank row

  // ── Table Header ──
  const headers = [
    'ที่', 'รายการ', 'ค่างานต้นทุน\n(บาท)',
    'Factor F\n≤ 5 ลบ.', 'Factor F\n> 5 ลบ.',
    'ค่าก่อสร้าง\nไม่รวม VAT (บาท)', 'ภาษีมูลค่าเพิ่ม\n(บาท)',
    'ค่าก่อสร้าง\nรวม VAT (บาท)', 'หมายเหตุ',
  ];
  headers.forEach((h, idx) => {
    ws.getCell(r, idx + 1).value = h;
  });
  applyHeaderStyle(ws, r, 1, 9);
  ws.getRow(r).height = 36;
  r++;

  // ── Route Rows ──
  routes.forEach((route, idx) => {
    const alloc = allocated[idx];
    ws.getCell(r, 1).value = idx + 1;
    ws.getCell(r, 1).alignment = { horizontal: 'center' };
    ws.getCell(r, 2).value = route.route_name;
    ws.getCell(r, 2).alignment = { wrapText: true };
    ws.getCell(r, 3).value = route.total_cost;
    ws.getCell(r, 3).numFmt = numberFormat;
    ws.getCell(r, 3).alignment = { horizontal: 'right' };
    ws.getCell(r, 4).value = showFactorLTE5 ? factor : '';
    if (showFactorLTE5) ws.getCell(r, 4).numFmt = factorFormat;
    ws.getCell(r, 4).alignment = { horizontal: 'center' };
    ws.getCell(r, 5).value = showFactorGT5 ? factor : '';
    if (showFactorGT5) ws.getCell(r, 5).numFmt = factorFormat;
    ws.getCell(r, 5).alignment = { horizontal: 'center' };
    ws.getCell(r, 6).value = alloc.beforeVAT;
    ws.getCell(r, 6).numFmt = numberFormat;
    ws.getCell(r, 6).alignment = { horizontal: 'right' };
    ws.getCell(r, 7).value = alloc.vat;
    ws.getCell(r, 7).numFmt = numberFormat;
    ws.getCell(r, 7).alignment = { horizontal: 'right' };
    ws.getCell(r, 8).value = alloc.total;
    ws.getCell(r, 8).numFmt = numberFormat;
    ws.getCell(r, 8).alignment = { horizontal: 'right' };
    ws.getCell(r, 9).value = route.route_description || '';

    for (let c = 1; c <= 9; c++) {
      ws.getCell(r, c).border = allBorders;
      ws.getCell(r, c).font = { size: 11 };
    }

    r++;
  });

  // ── Total Row ──
  let sumCost = 0, sumBV = 0, sumVAT = 0, sumTotal = 0;
  routes.forEach((route, i) => {
    sumCost += route.total_cost;
    sumBV += allocated[i].beforeVAT;
    sumVAT += allocated[i].vat;
    sumTotal += allocated[i].total;
  });

  ws.getCell(r, 1).value = 'รวม';
  ws.mergeCells(r, 1, r, 2);
  ws.getCell(r, 1).alignment = { horizontal: 'center' };
  ws.getCell(r, 3).value = sumCost;
  ws.getCell(r, 3).numFmt = numberFormat;
  ws.getCell(r, 3).alignment = { horizontal: 'right' };
  ws.getCell(r, 4).value = showFactorLTE5 ? factor : '';
  if (showFactorLTE5) ws.getCell(r, 4).numFmt = factorFormat;
  ws.getCell(r, 4).alignment = { horizontal: 'center' };
  ws.getCell(r, 5).value = showFactorGT5 ? factor : '';
  if (showFactorGT5) ws.getCell(r, 5).numFmt = factorFormat;
  ws.getCell(r, 5).alignment = { horizontal: 'center' };
  ws.getCell(r, 6).value = sumBV;
  ws.getCell(r, 6).numFmt = numberFormat;
  ws.getCell(r, 6).alignment = { horizontal: 'right' };
  ws.getCell(r, 7).value = sumVAT;
  ws.getCell(r, 7).numFmt = numberFormat;
  ws.getCell(r, 7).alignment = { horizontal: 'right' };
  ws.getCell(r, 8).value = sumTotal;
  ws.getCell(r, 8).numFmt = numberFormat;
  ws.getCell(r, 8).alignment = { horizontal: 'right' };

  applyTotalStyle(ws, r, 1, 9);
  r += 2;

  // ── Calculation Summary ──
  ws.getCell(r, 1).value = '(1) ประมาณราคาค่าก่อสร้างทั้งโครงการ ก่อนภาษี';
  ws.mergeCells(r, 1, r, 7);
  ws.getCell(r, 8).value = constructionCostBeforeVAT;
  ws.getCell(r, 8).numFmt = numberFormat;
  ws.getCell(r, 8).alignment = { horizontal: 'right' };
  ws.getCell(r, 8).font = { bold: true, size: 12 };
  r++;

  ws.getCell(r, 1).value = '(2) ภาษีมูลค่าเพิ่ม 7.00 %';
  ws.mergeCells(r, 1, r, 7);
  ws.getCell(r, 8).value = vatAmount;
  ws.getCell(r, 8).numFmt = numberFormat;
  ws.getCell(r, 8).alignment = { horizontal: 'right' };
  ws.getCell(r, 8).font = { bold: true, size: 12 };
  r++;

  ws.getCell(r, 1).value = '(1) + (2) รวมประมาณค่างานทั้งโครงการ เป็นเงินทั้งสิ้น';
  ws.mergeCells(r, 1, r, 7);
  ws.getCell(r, 1).font = { bold: true, size: 13 };
  ws.getCell(r, 8).value = totalWithVAT;
  ws.getCell(r, 8).numFmt = numberFormat;
  ws.getCell(r, 8).alignment = { horizontal: 'right' };
  ws.getCell(r, 8).font = { bold: true, size: 13 };
  ws.getCell(r, 8).fill = totalFill;
}

// ──────────────────────────────────
// Main Export Function
// ──────────────────────────────────

export async function exportBoqToExcel(
  boq: ExportBOQData,
  routes: ExportBOQRoute[],
  routeItems: Record<string, ExportBOQItem[]>,
  factor: number,
  allocated: ExportSummaryAllocated[],
  constructionCostBeforeVAT: number,
  vatAmount: number,
  totalWithVAT: number,
) {
  // Dynamic import to avoid bundle bloat
  const ExcelJS = (await import('exceljs')).default;
  const { saveAs } = await import('file-saver');

  const wb = new ExcelJS.Workbook() as Workbook;
  wb.creator = 'Conduit BOQ System';
  wb.created = new Date();

  // ── Data Correctness: Checksum ──
  const stateTotal = routes.reduce((sum, r) => sum + r.total_cost, 0);
  const itemsTotal = routes.reduce((sum, route) => {
    const items = routeItems[route.id] || [];
    return sum + items.reduce((s, item) => s + item.total_cost, 0);
  }, 0);

  // Allow tiny floating point tolerance (0.01 baht)
  if (Math.abs(stateTotal - itemsTotal) > 0.01) {
    throw new Error(
      `Data Integrity Error: Route totals (${stateTotal}) do not match item totals (${itemsTotal}). ` +
      `Difference: ${Math.abs(stateTotal - itemsTotal).toFixed(2)} baht. Export aborted.`
    );
  }

  // ── Create route sheets ──
  routes.forEach((route, idx) => {
    const items = routeItems[route.id] || [];
    const sheetName = routes.length === 1
      ? 'ปร.4'
      : `ปร.4 เส้นทาง ${idx + 1}`;
    createRouteSheet(wb, boq, route, items, sheetName);
  });

  // ── Create summary sheet ──
  createSummarySheet(wb, boq, routes, allocated, factor, constructionCostBeforeVAT, vatAmount, totalWithVAT);

  // ── Generate and download ──
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const fileName = `BOQ_${boq.project_name.replace(/[/\\?%*:|"<>]/g, '_')}.xlsx`;
  saveAs(blob, fileName);
}
