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
  factor_f: number | null;
  factor_f_raw: number | null;
  factor_f_lower_cost: number | null;
  factor_f_upper_cost: number | null;
  factor_f_lower_value: number | null;
  factor_f_upper_value: number | null;
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

export interface ExportFactorRef {
  cost_million: number;
  factor: number;
}

// ──────────────────────────────────
// Default Font & Styles
// ──────────────────────────────────

const DEFAULT_FONT = 'TH Sarabun New';
const DEFAULT_SIZE = 14;

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
  fgColor: { argb: 'FFFDE7' }, // matches print preview .boq-table th
};

const totalFill: Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFFDE7' }, // matches print preview .total-row.highlight
};

const highlightFill: Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFEB3B' }, // matches print preview .highlight-box
};

const numberFormat = '#,##0.00';
const factorFormat = '0.0000';

function defaultFont(overrides?: { bold?: boolean; size?: number; italic?: boolean }) {
  return { name: DEFAULT_FONT, size: overrides?.size ?? DEFAULT_SIZE, bold: overrides?.bold, italic: overrides?.italic };
}

function applyHeaderStyle(ws: Worksheet, row: number, colStart: number, colEnd: number) {
  for (let c = colStart; c <= colEnd; c++) {
    const cell = ws.getCell(row, c);
    cell.font = defaultFont({ bold: true, size: 14 });
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.fill = headerFill;
    cell.border = allBorders;
  }
}

function applyTotalStyle(ws: Worksheet, row: number, colStart: number, colEnd: number) {
  for (let c = colStart; c <= colEnd; c++) {
    const cell = ws.getCell(row, c);
    cell.font = defaultFont({ bold: true });
    cell.border = allBorders;
    cell.fill = totalFill;
  }
}

function formatThaiDate(dateStr: string): string {
  const d = new Date(dateStr);
  const thaiMonth = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
    'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
  return `${thaiMonth[d.getMonth()]} พ.ศ. ${d.getFullYear() + 543}`;
}

function formatNum(num: number): string {
  return num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function numberToThaiText(num: number): string {
  const thaiNumbers = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  if (num === 0) return 'ศูนย์บาทถ้วน';
  const baht = Math.floor(num);
  const satang = Math.round((num - baht) * 100);
  const convertGroup = (n: number): string => {
    if (n === 0) return '';
    let result = '';
    const str = n.toString();
    const len = str.length;
    for (let i = 0; i < len; i++) {
      const digit = parseInt(str[i]);
      const position = len - i - 1;
      if (digit === 0) continue;
      if (position === 1 && digit === 1) result += 'สิบ';
      else if (position === 1 && digit === 2) result += 'ยี่สิบ';
      else if (position === 0 && digit === 1 && len > 1) result += 'เอ็ด';
      else result += thaiNumbers[digit] + ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'][position];
    }
    return result;
  };
  let result = '';
  if (baht >= 1000000) {
    result += convertGroup(Math.floor(baht / 1000000)) + 'ล้าน';
    result += convertGroup(baht % 1000000);
  } else {
    result += convertGroup(baht);
  }
  result += 'บาท';
  if (satang > 0) {
    result += convertGroup(satang) + 'สตางค์';
  } else {
    result += 'ถ้วน';
  }
  return result;
}

// ──────────────────────────────────
// Sheet: Route Detail (per route)
// ──────────────────────────────────

function createRouteSheet(
  wb: Workbook,
  boq: ExportBOQData,
  route: ExportBOQRoute,
  items: ExportBOQItem[],
  sheetName: string,
) {
  const ws = wb.addWorksheet(sheetName);

  ws.pageSetup = {
    paperSize: 9,
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: { left: 0.3, right: 0.3, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 },
  };

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
  ws.getCell(r, 1).font = defaultFont({ bold: true, size: 16 });
  ws.mergeCells(r, 1, r, 10);
  r++;

  ws.getCell(r, 1).value = 'แบบฟอร์มแสดงรายการ ปริมาณงาน และราคางานก่อสร้างท่อร้อยสายสื่อสารใต้ดิน (BOQ)';
  ws.getCell(r, 1).font = defaultFont({ bold: true, size: 15 });
  ws.mergeCells(r, 1, r, 10);
  r++;

  // ── Info Section ──
  ws.getCell(r, 1).value = `ส่วนงาน: ${boq.department || 'วิศวกรรมท่อร้อยสาย (วทฐฐ.) ฝ่ายท่อร้อยสาย (ทฐฐ.)'}`;
  ws.getCell(r, 1).font = defaultFont();
  ws.mergeCells(r, 1, r, 5);
  ws.getCell(r, 6).value = `โครงการ: ${boq.project_name}`;
  ws.getCell(r, 6).font = defaultFont();
  ws.mergeCells(r, 6, r, 10);
  r++;

  ws.getCell(r, 1).value = `บัญชีราคา: งานจ้างเหมาก่อสร้างท่อร้อยสายสื่อสารใต้ดินและบ่อพัก`;
  ws.getCell(r, 1).font = defaultFont();
  ws.mergeCells(r, 1, r, 5);
  ws.getCell(r, 6).value = `พื้นที่ก่อสร้าง: ${route.construction_area || '-'}`;
  ws.getCell(r, 6).font = defaultFont();
  ws.mergeCells(r, 6, r, 10);
  r++;

  ws.getCell(r, 1).value = `เส้นทาง: ${route.route_name}`;
  ws.getCell(r, 1).font = defaultFont();
  ws.mergeCells(r, 1, r, 10);
  r++;

  // ── Unit label ──
  ws.getCell(r, 10).value = 'หน่วย - บาท';
  ws.getCell(r, 10).alignment = { horizontal: 'right' };
  ws.getCell(r, 10).font = defaultFont({ italic: true, size: 12 });
  r++;

  // ── Table Header (2 rows with merged cells) ──
  const headerRow1 = r;
  const headerRow2 = r + 1;

  ws.getCell(headerRow1, 1).value = 'ลำดับที่';
  ws.mergeCells(headerRow1, 1, headerRow2, 1);
  ws.getCell(headerRow1, 2).value = 'รายการ';
  ws.mergeCells(headerRow1, 2, headerRow2, 2);
  ws.getCell(headerRow1, 3).value = 'ปริมาณงาน';
  ws.mergeCells(headerRow1, 3, headerRow2, 3);
  ws.getCell(headerRow1, 4).value = 'หน่วย';
  ws.mergeCells(headerRow1, 4, headerRow2, 4);

  ws.getCell(headerRow1, 5).value = 'ค่าวัสดุ ไม่รวมภาษีมูลค่าเพิ่ม (1)';
  ws.mergeCells(headerRow1, 5, headerRow1, 6);
  ws.getCell(headerRow2, 5).value = 'ราคา/หน่วย';
  ws.getCell(headerRow2, 6).value = 'จำนวนเงิน';

  ws.getCell(headerRow1, 7).value = 'ค่าแรง ไม่รวมภาษีมูลค่าเพิ่ม (2)';
  ws.mergeCells(headerRow1, 7, headerRow1, 8);
  ws.getCell(headerRow2, 7).value = 'ราคา/หน่วย';
  ws.getCell(headerRow2, 8).value = 'จำนวนเงิน';

  ws.getCell(headerRow1, 9).value = 'ค่างานต้นทุน\n(3)=(1)+(2)';
  ws.mergeCells(headerRow1, 9, headerRow2, 9);
  ws.getCell(headerRow1, 10).value = 'หมายเหตุ';
  ws.mergeCells(headerRow1, 10, headerRow2, 10);

  applyHeaderStyle(ws, headerRow1, 1, 10);
  applyHeaderStyle(ws, headerRow2, 1, 10);
  ws.getRow(headerRow1).height = 28;
  ws.getRow(headerRow2).height = 20;

  r = headerRow2 + 1;

  // ── Data Rows ──
  const sortedItems = [...items].sort((a, b) => a.item_order - b.item_order);

  sortedItems.forEach((item, idx) => {
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

    for (let c = 1; c <= 10; c++) {
      ws.getCell(r, c).border = allBorders;
      ws.getCell(r, c).font = defaultFont();
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
  ws.getCell(r, 8).font = defaultFont();
  ws.mergeCells(r, 8, r, 10);
  ws.getCell(r, 8).alignment = { horizontal: 'center' };
  r++;

  if (boq.document_date) {
    ws.getCell(r, 8).value = formatThaiDate(boq.document_date);
    ws.getCell(r, 8).font = defaultFont();
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
    { width: 5 },
    { width: 40 },
    { width: 14 },
    { width: 10 },
    { width: 10 },
    { width: 16 },
    { width: 14 },
    { width: 16 },
    { width: 14 },
  ];

  const grandTotalInMillion = boq.total_cost / 1000000;
  const showFactorLTE5 = grandTotalInMillion <= 5;
  const showFactorGT5 = grandTotalInMillion > 5;

  let r = 1;

  ws.getCell(r, 1).value = 'บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน)';
  ws.getCell(r, 1).font = defaultFont({ bold: true, size: 16 });
  ws.mergeCells(r, 1, r, 9);
  r++;

  ws.getCell(r, 1).value = 'สรุปรวม บัญชีราคา งานจ้างเหมาก่อสร้างท่อร้อยสายสื่อสารใต้ดินและบ่อพัก';
  ws.getCell(r, 1).font = defaultFont({ bold: true, size: 15 });
  ws.mergeCells(r, 1, r, 9);
  r++;

  ws.getCell(r, 1).value = `ส่วนงาน: ${boq.department || 'วิศวกรรมท่อร้อยสาย (วทฐฐ.) ฝ่ายท่อร้อยสาย (ทฐฐ.)'}`;
  ws.getCell(r, 1).font = defaultFont();
  ws.mergeCells(r, 1, r, 5);
  ws.getCell(r, 6).value = `โครงการ: ${boq.project_name}`;
  ws.getCell(r, 6).font = defaultFont();
  ws.mergeCells(r, 6, r, 9);
  r++;

  ws.getCell(r, 1).value = `จำนวนเส้นทาง: ${routes.length} เส้นทาง`;
  ws.getCell(r, 1).font = defaultFont();
  ws.mergeCells(r, 1, r, 9);
  r++;
  r++;

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
      ws.getCell(r, c).font = defaultFont();
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
  ws.getCell(r, 1).font = defaultFont({ bold: true });
  ws.mergeCells(r, 1, r, 7);
  ws.getCell(r, 8).value = constructionCostBeforeVAT;
  ws.getCell(r, 8).numFmt = numberFormat;
  ws.getCell(r, 8).alignment = { horizontal: 'right' };
  ws.getCell(r, 8).font = defaultFont({ bold: true });
  r++;

  ws.getCell(r, 1).value = '(2) ภาษีมูลค่าเพิ่ม 7.00 %';
  ws.getCell(r, 1).font = defaultFont({ bold: true });
  ws.mergeCells(r, 1, r, 7);
  ws.getCell(r, 8).value = vatAmount;
  ws.getCell(r, 8).numFmt = numberFormat;
  ws.getCell(r, 8).alignment = { horizontal: 'right' };
  ws.getCell(r, 8).font = defaultFont({ bold: true });
  r++;

  ws.getCell(r, 1).value = '(1) + (2) รวมประมาณค่างานทั้งโครงการ เป็นเงินทั้งสิ้น';
  ws.getCell(r, 1).font = defaultFont({ bold: true, size: 16 });
  ws.mergeCells(r, 1, r, 7);
  ws.getCell(r, 8).value = totalWithVAT;
  ws.getCell(r, 8).numFmt = numberFormat;
  ws.getCell(r, 8).alignment = { horizontal: 'right' };
  ws.getCell(r, 8).font = defaultFont({ bold: true, size: 16 });
  ws.getCell(r, 8).fill = totalFill;
  r += 2;

  // ── Thai Baht Text ──
  ws.getCell(r, 1).value = 'ประมาณราคาค่าก่อสร้าง รวมภาษีมูลค่าเพิ่ม (VAT)';
  ws.getCell(r, 1).font = defaultFont({ bold: true });
  ws.mergeCells(r, 1, r, 4);
  ws.getCell(r, 5).value = numberToThaiText(totalWithVAT);
  ws.getCell(r, 5).font = defaultFont({ bold: true });
  ws.getCell(r, 5).fill = highlightFill;
  ws.mergeCells(r, 5, r, 9);
  r += 2;

  // ── Conditions ──
  ws.getCell(r, 1).value = 'เงื่อนไข';
  ws.getCell(r, 1).font = defaultFont({ bold: true });
  ws.getCell(r, 1).fill = highlightFill;
  ws.getCell(r, 2).value = 'Factor F งานก่อสร้างทาง เงินล่วงหน้าจ่าย 0.00 %, เงินประกันผลงานหัก 0.00 %, ดอกเบี้ยเงินกู้ 7.00 % ต่อปี, ค่าภาษีมูลค่าเพิ่ม 7.00 %';
  ws.getCell(r, 2).font = defaultFont();
  ws.mergeCells(r, 2, r, 9);
  r++;

  // ── Note ──
  ws.getCell(r, 1).value = 'หมายเหตุ';
  ws.getCell(r, 1).font = defaultFont({ bold: true });
  ws.getCell(r, 1).fill = highlightFill;
  ws.getCell(r, 2).value = 'ทั้งนี้ ราคางานโครงการ/งานก่อสร้าง ไม่ใช่ราคาค่าก่อสร้างที่แท้จริง แต่เป็นเพียงราคาโดยประมาณเท่านั้น';
  ws.getCell(r, 2).font = defaultFont();
  ws.mergeCells(r, 2, r, 9);
  r += 2;

  // ── Signature ──
  ws.getCell(r, 7).value = `ผู้ประมาณราคา ${boq.estimator_name}`;
  ws.getCell(r, 7).font = defaultFont();
  ws.mergeCells(r, 7, r, 9);
  ws.getCell(r, 7).alignment = { horizontal: 'center' };
  r++;

  if (boq.document_date) {
    ws.getCell(r, 7).value = formatThaiDate(boq.document_date);
    ws.getCell(r, 7).font = defaultFont();
    ws.mergeCells(r, 7, r, 9);
    ws.getCell(r, 7).alignment = { horizontal: 'center' };
  }
}

// ──────────────────────────────────
// Sheet: Factor F Supplement
// ──────────────────────────────────

function createFactorFSheet(
  wb: Workbook,
  boq: ExportBOQData,
  factor: number,
  lowerFactorRef: ExportFactorRef | null,
  upperFactorRef: ExportFactorRef | null,
) {
  const ws = wb.addWorksheet('Factor F');

  ws.pageSetup = {
    paperSize: 9,
    orientation: 'portrait',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 1,
    margins: { left: 0.7, right: 0.7, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 },
  };

  ws.columns = [
    { width: 8 },   // A
    { width: 40 },  // B
    { width: 5 },   // C: =
    { width: 5 },   // D: var
    { width: 8 },   // E: unit
    { width: 5 },   // F: =
    { width: 18 },  // G: value
    { width: 8 },   // H: unit
  ];

  // Calculate Factor F variables (same logic as FactorFSupplementPage)
  const A = boq.total_cost;
  const hasSnapshot = boq.factor_f_lower_cost != null && boq.factor_f_lower_cost > 0;

  const B = hasSnapshot ? boq.factor_f_lower_cost! : (lowerFactorRef?.cost_million || 5) * 1000000;
  const C = hasSnapshot ? boq.factor_f_upper_cost! : (upperFactorRef?.cost_million || (lowerFactorRef?.cost_million || 5)) * 1000000;
  const D = hasSnapshot ? boq.factor_f_lower_value! : lowerFactorRef?.factor || 1.2750;
  const E = hasSnapshot ? boq.factor_f_upper_value! : upperFactorRef?.factor || (lowerFactorRef?.factor || 1.2750);

  let factorRaw: number;
  if (hasSnapshot && boq.factor_f_raw != null) {
    factorRaw = boq.factor_f_raw;
  } else if (B === C || !upperFactorRef) {
    factorRaw = D;
  } else {
    const aMil = A / 1000000;
    const bMil = B / 1000000;
    const cMil = C / 1000000;
    factorRaw = D - ((D - E) * (aMil - bMil) / (cMil - bMil));
  }

  const factorTruncated = boq.factor_f || Math.floor(factorRaw * 10000) / 10000;
  const isExactMatch = B === C || Math.abs(factorRaw - factorTruncated) < 0.000000001;

  let r = 1;

  // ── Title ──
  ws.getCell(r, 1).value = 'บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน)';
  ws.getCell(r, 1).font = defaultFont({ bold: true, size: 16 });
  ws.mergeCells(r, 1, r, 8);
  ws.getCell(r, 1).alignment = { horizontal: 'center' };
  r += 2;

  ws.getCell(r, 1).value = 'สูตรคำนวณหาค่า Factor F ที่อยู่ระหว่างช่วงของค่างานต้นทุน';
  ws.getCell(r, 1).font = defaultFont({ bold: true, size: 16 });
  ws.mergeCells(r, 1, r, 8);
  ws.getCell(r, 1).alignment = { horizontal: 'center' };
  r += 2;

  // ── Project Info ──
  ws.getCell(r, 1).value = 'ของงานโครงการ';
  ws.getCell(r, 1).font = defaultFont({ bold: true });
  ws.getCell(r, 2).value = boq.project_name;
  ws.getCell(r, 2).font = defaultFont();
  ws.mergeCells(r, 2, r, 8);
  r++;

  ws.getCell(r, 1).value = 'ส่วนงาน';
  ws.getCell(r, 1).font = defaultFont({ bold: true });
  ws.getCell(r, 2).value = boq.department || '';
  ws.getCell(r, 2).font = defaultFont();
  ws.mergeCells(r, 2, r, 8);
  r += 2;

  // ── Condition ──
  ws.getCell(r, 1).value = 'กรณีค่างานอยู่ระหว่างช่วงของค่างานต้นทุนที่กำหนดในตาราง Factor F ให้ใช้สูตรเพื่อหาค่า Factor F ดังนี้';
  ws.getCell(r, 1).font = defaultFont({ bold: true });
  ws.mergeCells(r, 1, r, 8);
  r++;

  ws.getCell(r, 1).value = 'ใช้ Factor F งานก่อสร้างทาง ( เงินล่วงหน้าจ่าย 0.00 %, เงินประกันผลงานหัก 0.00 %, ดอกเบี้ยเงินกู้ 7.00 % ต่อปี, ค่า VAT 7.00 % )';
  ws.getCell(r, 1).font = defaultFont({ bold: true });
  ws.mergeCells(r, 1, r, 8);
  r += 2;

  // ── Formula ──
  ws.getCell(r, 1).value = 'สูตร';
  ws.getCell(r, 1).font = defaultFont({ bold: true });
  ws.getCell(r, 2).value = 'ค่า Factor F ของค่างานต้นทุน A  =  D - { (D - E) × (A - B) / (C - B) }';
  ws.getCell(r, 2).font = defaultFont({ bold: true, size: 16 });
  ws.mergeCells(r, 2, r, 8);
  r += 2;

  // ── Variables ──
  ws.getCell(r, 1).value = 'เมื่อ';
  ws.getCell(r, 1).font = defaultFont({ bold: true, size: 16 });
  r++;

  const vars = [
    ['ต้องการหาค่า Factor F ของค่างานต้นทุน', 'A', 'บาท', formatNum(A), 'บาท'],
    ['ค่างานต้นทุนตัวต่ำกว่าค่างานต้นทุน A', 'B', 'บาท', formatNum(B), 'บาท'],
    ['ค่างานต้นทุนตัวสูงกว่าค่างานต้นทุน A', 'C', 'บาท', formatNum(C), 'บาท'],
    ['ค่า Factor F ของค่างานต้นทุน B', 'D', '', D.toFixed(4), ''],
    ['ค่า Factor F ของค่างานต้นทุน C', 'E', '', E.toFixed(4), ''],
  ];

  vars.forEach(([desc, varName, unit1, val, unit2]) => {
    ws.getCell(r, 2).value = desc;
    ws.getCell(r, 2).font = defaultFont();
    ws.getCell(r, 3).value = '=';
    ws.getCell(r, 3).font = defaultFont();
    ws.getCell(r, 3).alignment = { horizontal: 'center' };
    ws.getCell(r, 4).value = varName;
    ws.getCell(r, 4).font = defaultFont({ bold: true });
    ws.getCell(r, 4).alignment = { horizontal: 'center' };
    ws.getCell(r, 5).value = unit1;
    ws.getCell(r, 5).font = defaultFont();
    ws.getCell(r, 6).value = '=';
    ws.getCell(r, 6).font = defaultFont();
    ws.getCell(r, 6).alignment = { horizontal: 'center' };
    ws.getCell(r, 7).value = val;
    ws.getCell(r, 7).font = defaultFont();
    ws.getCell(r, 7).alignment = { horizontal: 'right' };
    ws.getCell(r, 8).value = unit2;
    ws.getCell(r, 8).font = defaultFont();
    r++;
  });

  r += 2;

  // ── Calculation Result ──
  if (isExactMatch) {
    ws.getCell(r, 1).value = 'ค่า Factor F ของค่างานต้นทุน A';
    ws.getCell(r, 1).font = defaultFont({ bold: true });
    ws.mergeCells(r, 1, r, 5);
    ws.getCell(r, 6).value = '=';
    ws.getCell(r, 6).font = defaultFont();
    ws.getCell(r, 6).alignment = { horizontal: 'center' };
    ws.getCell(r, 7).value = factorTruncated.toFixed(4);
    ws.getCell(r, 7).font = defaultFont({ bold: true, size: 16 });
    ws.getCell(r, 7).alignment = { horizontal: 'right' };
    ws.getCell(r, 7).fill = highlightFill;
    r++;
    ws.getCell(r, 7).value = '(ค่างานต้นทุนตรงกับตาราง Factor F)';
    ws.getCell(r, 7).font = defaultFont({ italic: true, size: 12 });
    ws.mergeCells(r, 7, r, 8);
  } else {
    ws.getCell(r, 1).value = 'ค่า Factor F ของค่างานต้นทุน A';
    ws.getCell(r, 1).font = defaultFont({ bold: true });
    ws.mergeCells(r, 1, r, 5);
    ws.getCell(r, 6).value = '=';
    ws.getCell(r, 6).font = defaultFont();
    ws.getCell(r, 6).alignment = { horizontal: 'center' };
    ws.getCell(r, 7).value = `${D.toFixed(4)} - [ (${D.toFixed(4)} - ${E.toFixed(4)}) × (${formatNum(A)} - ${formatNum(B)}) / (${formatNum(C)} - ${formatNum(B)}) ]`;
    ws.getCell(r, 7).font = defaultFont();
    ws.mergeCells(r, 7, r, 8);
    r++;

    ws.getCell(r, 6).value = '=';
    ws.getCell(r, 6).font = defaultFont();
    ws.getCell(r, 6).alignment = { horizontal: 'center' };
    ws.getCell(r, 7).value = factorRaw;
    ws.getCell(r, 7).font = defaultFont();
    ws.getCell(r, 7).alignment = { horizontal: 'right' };
    r++;

    ws.getCell(r, 6).value = '=';
    ws.getCell(r, 6).font = defaultFont();
    ws.getCell(r, 6).alignment = { horizontal: 'center' };
    ws.getCell(r, 7).value = factorTruncated.toFixed(4);
    ws.getCell(r, 7).font = defaultFont({ bold: true, size: 16 });
    ws.getCell(r, 7).alignment = { horizontal: 'right' };
    ws.getCell(r, 7).fill = highlightFill;
    ws.getCell(r, 8).value = 'ปัดใช้ทศนิยม 4 ตำแหน่ง (ปัดทิ้ง)';
    ws.getCell(r, 8).font = defaultFont({ italic: true, size: 12 });
  }

  r += 3;

  // ── Signature ──
  ws.getCell(r, 5).value = `ผู้ประมาณราคา ${boq.estimator_name}`;
  ws.getCell(r, 5).font = defaultFont();
  ws.mergeCells(r, 5, r, 8);
  ws.getCell(r, 5).alignment = { horizontal: 'center' };
  r++;

  if (boq.document_date) {
    ws.getCell(r, 5).value = formatThaiDate(boq.document_date);
    ws.getCell(r, 5).font = defaultFont();
    ws.mergeCells(r, 5, r, 8);
    ws.getCell(r, 5).alignment = { horizontal: 'center' };
  }
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
  lowerFactorRef?: ExportFactorRef | null,
  upperFactorRef?: ExportFactorRef | null,
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

  // ── Create consolidated sheet (multi-route only) ──
  if (routes.length > 1) {
    const consolidatedMap = new Map<string, {
      item_order: number; item_name: string; quantity: number; unit: string;
      material_cost_per_unit: number; labor_cost_per_unit: number;
      total_material_cost: number; total_labor_cost: number; total_cost: number;
    }>();
    routes.forEach((route) => {
      (routeItems[route.id] || []).forEach((item) => {
        const key = item.item_name;
        if (consolidatedMap.has(key)) {
          const existing = consolidatedMap.get(key)!;
          existing.quantity += item.quantity;
          existing.total_material_cost += item.total_material_cost;
          existing.total_labor_cost += item.total_labor_cost;
          existing.total_cost += item.total_cost;
        } else {
          consolidatedMap.set(key, {
            item_order: item.item_order, item_name: item.item_name,
            quantity: item.quantity, unit: item.unit,
            material_cost_per_unit: item.material_cost_per_unit,
            labor_cost_per_unit: item.labor_cost_per_unit,
            total_material_cost: item.total_material_cost,
            total_labor_cost: item.total_labor_cost,
            total_cost: item.total_cost,
          });
        }
      });
    });

    const consolidatedItems: ExportBOQItem[] = Array.from(consolidatedMap.values())
      .sort((a, b) => a.item_order - b.item_order)
      .map((item, idx) => ({
        ...item,
        id: `consolidated-${idx}`,
        remarks: null,
      }));

    const totalMaterial = consolidatedItems.reduce((s, i) => s + i.total_material_cost, 0);
    const totalLabor = consolidatedItems.reduce((s, i) => s + i.total_labor_cost, 0);
    const totalCost = consolidatedItems.reduce((s, i) => s + i.total_cost, 0);

    const consolidatedRoute: ExportBOQRoute = {
      id: 'consolidated',
      route_order: 0,
      route_name: routes.map(r => r.route_name).join(', '),
      route_description: null,
      construction_area: routes.map(r => r.construction_area).filter(Boolean).join(', ') || null,
      total_material_cost: totalMaterial,
      total_labor_cost: totalLabor,
      total_cost: totalCost,
    };

    createRouteSheet(wb, boq, consolidatedRoute, consolidatedItems, 'ปร.4 รวมทุกเส้นทาง');
  }

  // ── Create summary sheet ──
  createSummarySheet(wb, boq, routes, allocated, factor, constructionCostBeforeVAT, vatAmount, totalWithVAT);

  // ── Create Factor F supplement sheet (if factor_f exists) ──
  if (boq.factor_f != null) {
    createFactorFSheet(wb, boq, factor, lowerFactorRef || null, upperFactorRef || null);
  }

  // ── Generate and download ──
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const fileName = `BOQ_${boq.project_name.replace(/[/\\?%*:|"<>]/g, '_')}.xlsx`;
  saveAs(blob, fileName);
}
