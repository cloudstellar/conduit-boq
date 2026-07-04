import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outDir = "/Users/cloud/Cloudstellar/conduit-boq/output/master-catalog/p11-preview";
const dataPath = path.join(outDir, "p11_preview_source_data.json");
const logoPath = "/Users/cloud/Cloudstellar/conduit-boq/CI/NT_4_v3.png";
const workbookPath = path.join(outDir, "DRAFT-PREVIEW-NT-Master-Catalog-v2568.1.0-p11-preview.xlsx");

const colors = {
  darkGray: "#545859",
  black: "#101820",
  white: "#FFFFFF",
  lightYellow: "#FFF4BF",
  lightGray: "#F4F6F7",
  border: "#D9DEE2",
  danger: "#B91C1C",
};

const canonicalKeys = [
  "identity_id",
  "item_code",
  "item_name",
  "unit",
  "material_cost",
  "labor_cost",
  "unit_cost",
  "category_code",
  "category_name",
  "work_context_code",
  "work_context_name_th",
  "item_type_code",
  "item_type_name_th",
  "is_active",
  "display_order",
];

const source = JSON.parse(await fs.readFile(dataPath, "utf8"));
const rows = source.rows;

function canonicalRow(row) {
  const object = {};
  for (const key of canonicalKeys) object[key] = row[key];
  return object;
}

function canonicalJson(row) {
  return JSON.stringify(canonicalRow(row));
}

const canonicalArrayText = `[${rows.map(canonicalJson).join(",")}]\n`;
const datasetHash = `sha256:${crypto.createHash("sha256").update(canonicalArrayText, "utf8").digest("hex")}`;
const shortHash = `${datasetHash.slice(0, "sha256:".length + 12)}...`;

function styleTitle(range) {
  range.format = {
    font: { bold: true, size: 16, color: colors.black, name: "NT" },
    fill: colors.white,
  };
}

function styleHeader(range) {
  range.format = {
    fill: colors.darkGray,
    font: { bold: true, color: colors.white, name: "NT" },
    wrapText: true,
    verticalAlignment: "middle",
    horizontalAlignment: "center",
    borders: { preset: "all", style: "thin", color: colors.border },
  };
}

function styleTable(range) {
  range.format = {
    font: { name: "NT", size: 10, color: colors.black },
    wrapText: true,
    verticalAlignment: "top",
    borders: { preset: "all", style: "thin", color: colors.border },
  };
}

function setWidths(sheet, widths) {
  widths.forEach((width, index) => {
    sheet.getRangeByIndexes(0, index, 1, 1).format.columnWidth = width;
  });
}

async function addLogo(sheet, cell = { row: 0, col: 0 }, size = { widthPx: 260, heightPx: 52 }) {
  const logo = await fs.readFile(logoPath);
  const dataUrl = `data:image/png;base64,${logo.toString("base64")}`;
  sheet.images.add({
    dataUrl,
    anchor: { from: cell, extent: size },
  });
}

const workbook = Workbook.create();

const doc = workbook.worksheets.add("ข้อมูลเอกสาร");
doc.showGridLines = false;
await addLogo(doc, { row: 0, col: 0 }, { widthPx: 300, heightPx: 58 });
doc.getRange("A5:I5").merge();
doc.getRange("A5").values = [["P-11 PREVIEW - NOT AN OFFICIAL MASTER CATALOG EXPORT"]];
styleTitle(doc.getRange("A5"));
const metadata = [
  ["สถานะเอกสาร", "DRAFT PREVIEW ONLY - not official, not P-11 approval"],
  ["รูปแบบ PDF ที่แนะนำ", "A4 portrait สำหรับ price-list ที่คนหน้างานอ่าน/พิมพ์ใช้งาน; Excel เป็น 13-column audit/export"],
  ["Version string", "2568.1.0 candidate draft/rehearsal"],
  ["Preview item count", rows.length],
  ["Preview dataset hash", datasetHash],
  ["Short footer hash", `${shortHash} ใช้ระบุชุดไฟล์แบบย่อเท่านั้น; ตรวจจริงต้องใช้ full hash ด้านบนหรือ sheet ข้อมูลตรวจสอบ`],
  ["Source", source.source],
  ["Boundary", "Production-derived representative rows only; final P-11 requires DB-generated artifacts and server recomputed count/hash"],
];
doc.getRange("A8:B15").values = metadata;
styleHeader(doc.getRange("A8:A15"));
styleTable(doc.getRange("B8:B15"));
setWidths(doc, [34, 150, 20, 20, 20, 20, 20, 20, 20]);

const price = workbook.worksheets.add("รายการราคา");
price.showGridLines = false;
price.getRange("A1:M1").merge();
price.getRange("A1").values = [["DRAFT PREVIEW - รายการราคา (production-derived sample rows)"]];
styleTitle(price.getRange("A1"));
const priceHeaders = [
  "ลำดับ",
  "รหัสรายการ",
  "รายการ",
  "หน่วย",
  "ค่าวัสดุ (บาท)",
  "ค่าแรง (บาท)",
  "ราคาต่อหน่วย (บาท)",
  "หมวดหมู่",
  "รหัสบริบทงาน",
  "บริบทงาน",
  "รหัสชนิดรายการ",
  "ชนิดรายการ",
  "สถานะ",
];
const priceRows = rows.map((row, index) => [
  index + 1,
  row.item_code,
  row.item_name,
  row.unit,
  Number(row.material_cost),
  Number(row.labor_cost),
  Number(row.unit_cost),
  row.category_name,
  row.work_context_code,
  row.work_context_name_th,
  row.item_type_code,
  row.item_type_name_th,
  row.is_active ? "ใช้งาน" : "ยกเลิกใช้",
]);
price.getRange("A3:M3").values = [priceHeaders];
price.getRange(`A4:M${3 + priceRows.length}`).values = priceRows;
styleHeader(price.getRange("A3:M3"));
styleTable(price.getRange(`A4:M${3 + priceRows.length}`));
price.getRange(`E4:G${3 + priceRows.length}`).format.numberFormat = "#,##0.00";
price.freezePanes.freezeRows(3);
setWidths(price, [10, 18, 62, 10, 14, 14, 16, 42, 18, 42, 18, 32, 12]);

const dict = workbook.worksheets.add("พจนานุกรมรหัส");
dict.showGridLines = false;
dict.getRange("A1:H1").merge();
dict.getRange("A1").values = [["DRAFT PREVIEW - พจนานุกรมรหัส (excerpt from production-derived sample)"]];
styleTitle(dict.getRange("A1"));
const uniqueGroups = [];
const seen = new Set();
for (const row of rows) {
  const key = `${row.work_context_code}|${row.item_type_code}|${row.category_code}`;
  if (seen.has(key)) continue;
  seen.add(key);
  uniqueGroups.push([
    row.work_context_code,
    row.work_context_name_th,
    "",
    row.item_type_code,
    row.item_type_name_th,
    row.category_code,
    row.category_name,
    "preview excerpt",
  ]);
}
dict.getRange("A3:H3").values = [[
  "รหัสบริบทงาน",
  "ชื่อบริบทงาน (ไทย)",
  "Work Context Name (English)",
  "รหัสชนิดรายการ",
  "ชื่อชนิดรายการ (ไทย)",
  "รหัสหมวด",
  "ชื่อหมวด",
  "หมายเหตุ",
]];
dict.getRange(`A4:H${3 + uniqueGroups.length}`).values = uniqueGroups;
styleHeader(dict.getRange("A3:H3"));
styleTable(dict.getRange(`A4:H${3 + uniqueGroups.length}`));
setWidths(dict, [18, 46, 28, 18, 34, 18, 52, 22]);

const changes = workbook.worksheets.add("สรุปการเปลี่ยนแปลง");
changes.showGridLines = false;
changes.getRange("A1:G1").merge();
changes.getRange("A1").values = [["DRAFT PREVIEW - สรุปการเปลี่ยนแปลง"]];
styleTitle(changes.getRange("A1"));
const changeRows = rows.map((row) => [
  row.legacy_item_code,
  row.item_code,
  row.item_name,
  row.change_type,
  row.note,
  "production-derived preview evidence",
  "2026-07-04",
]);
changes.getRange("A3:G3").values = [[
  "รหัสเดิม",
  "รหัสรายการใหม่",
  "รายการ",
  "ประเภท",
  "หมายเหตุ",
  "Evidence",
  "Timestamp",
]];
changes.getRange(`A4:G${3 + changeRows.length}`).values = changeRows;
styleHeader(changes.getRange("A3:G3"));
styleTable(changes.getRange(`A4:G${3 + changeRows.length}`));
setWidths(changes, [16, 18, 62, 24, 42, 34, 16]);

const verify = workbook.worksheets.add("ข้อมูลตรวจสอบ");
verify.showGridLines = false;
verify.getRange("A1:P1").merge();
verify.getRange("A1").values = [["DRAFT PREVIEW - ข้อมูลตรวจสอบ (full hash and canonical sample rows)"]];
styleTitle(verify.getRange("A1"));
verify.getRange("A2:P2").merge();
verify.getRange("A2").values = [[`Full preview dataset hash: ${datasetHash}`]];
verify.getRange("A2").format = { font: { name: "NT", bold: true, color: colors.danger }, fill: colors.lightYellow };
const verifyHeaders = [...canonicalKeys, "_canonical_row_json"];
const verifyRows = rows.map((row) => [
  ...canonicalKeys.map((key) => row[key] === null ? "null" : row[key]),
  canonicalJson(row),
]);
verify.getRange("A4:P4").values = [verifyHeaders];
verify.getRange(`A5:P${4 + verifyRows.length}`).values = verifyRows;
styleHeader(verify.getRange("A4:P4"));
styleTable(verify.getRange(`A5:P${4 + verifyRows.length}`));
verify.getRange(`E5:G${4 + verifyRows.length}`).format.numberFormat = "@";
verify.freezePanes.freezeRows(4);
setWidths(verify, [38, 18, 62, 10, 14, 14, 14, 18, 40, 18, 46, 18, 32, 12, 14, 110]);

for (const sheet of [doc, price, dict, changes, verify]) {
  const used = sheet.getUsedRange();
  used.format.font = { name: "NT" };
  used.format.wrapText = true;
  used.format.autofitRows();
}

const renderedSheets = [
  ["ข้อมูลเอกสาร", "preview-sheet-document.png"],
  ["รายการราคา", "preview-sheet-price-list.png"],
  ["ข้อมูลตรวจสอบ", "preview-sheet-verification.png"],
];

for (const [sheetName, fileName] of renderedSheets) {
  const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(path.join(outDir, fileName), new Uint8Array(await preview.arrayBuffer()));
}

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(workbookPath);

const qa = {
  workbookPath,
  datasetHash,
  itemCount: rows.length,
  source: source.source,
  sheetOrder: ["ข้อมูลเอกสาร", "รายการราคา", "พจนานุกรมรหัส", "สรุปการเปลี่ยนแปลง", "ข้อมูลตรวจสอบ"],
  priceColumns: priceHeaders,
  verificationColumns: verifyHeaders,
};
await fs.writeFile(path.join(outDir, "p11-preview-workbook-qa.json"), JSON.stringify(qa, null, 2));
console.log(JSON.stringify(qa, null, 2));
