const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const EXCEL_FILE_PATH = '/Users/cloud/Cloudstellar/files/ราคา PN6 24-4-69.xlsx';
const OUTPUT_SQL_PATH = path.join(__dirname, 'insert_pn6_items.sql');
const OUTPUT_ROLLBACK_SQL_PATH = path.join(__dirname, 'rollback_pn6_items.sql');
const OUTPUT_MANIFEST_PATH = path.join(__dirname, 'verification_manifest.json');

// Canonical Database Categories Map (exact strings in DB)
const CANONICAL_CATEGORIES = {
  '1.3': '1.3.   งานวางท่อ HDPE หุ้มคอนกรีตเสริมเหล็ก (ค.ส.ล.)  (High Density Polyethylene Conduit)',
  '2.3': '2.3.   งานวางท่อ  HDPE กลบทราย  (High Density Polyethylene Conduit)',
  '2.3.1': '2.3.   งานวางท่อ  HDPE กลบทราย  (High Density Polyethylene Conduit)', // Map to existing 2.3
  '5': '5.  งานสร้างจุดเชื่อมท่อคอนกรีตเสริมเหล็ก',
  '6.1': '6.1.   งานสร้างท่อโค้งขึ้นเสา (Riser Pole)',
  '6.1.2': '6.1.   งานสร้างท่อโค้งขึ้นเสา (Riser Pole)' // Map to existing 6.1
};

// Normalize whitespace helper
function normalizeName(str) {
  if (!str) return '';
  return str.toString().replace(/\s+/g, ' ').trim();
}

// SQL escape string helper
function escapeSql(str) {
  if (!str) return '';
  return str.toString().replace(/'/g, "''");
}

// Safe numeric parsing for costs
function parseCost(val, columnName, itemContext) {
  if (val === undefined || val === null || val.toString().trim() === '') {
    return 0;
  }
  
  // Clean all commas and spaces (e.g. "1,202" -> "1202")
  const cleaned = val.toString().replace(/,/g, '').trim();
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed) || parsed < 0) {
    console.error(`❌ Cost Parsing Error: Invalid cost value "${val}" found in ${columnName} for item: "${itemContext}"`);
    process.exit(1);
  }
  
  return parsed;
}

async function main() {
  console.log('🚀 Phase 1: Parsing Excel file...');
  
  if (!fs.existsSync(EXCEL_FILE_PATH)) {
    console.error(`❌ Excel file not found at: ${EXCEL_FILE_PATH}`);
    process.exit(1);
  }

  const workbook = XLSX.readFile(EXCEL_FILE_PATH);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const excelItems = [];
  let currentExcelCategory = '';

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length < 2) continue;

    const itemNo = row[0];
    const itemNameRaw = row[1];
    const unit = row[3];
    const materialCostRaw = row[4];
    const laborCostRaw = row[5];
    const totalCostRaw = row[6];

    if (!itemNameRaw) continue;

    // Check if category header: no unit and empty/undefined costs
    const isUnitEmpty = !unit || unit.toString().trim() === '';
    const isMaterialEmpty = materialCostRaw === undefined || materialCostRaw === null || materialCostRaw.toString().trim() === '';
    const isLaborEmpty = laborCostRaw === undefined || laborCostRaw === null || laborCostRaw.toString().trim() === '';

    if (isUnitEmpty && isMaterialEmpty && isLaborEmpty) {
      currentExcelCategory = normalizeName(itemNameRaw);
      continue;
    }

    if (isUnitEmpty || (isMaterialEmpty && isLaborEmpty)) continue;
    if (!itemNo || isNaN(parseInt(itemNo))) continue;

    // Clean name spacing: "6-Ø110 มม.HDPE" -> "6-Ø110 มม. HDPE"
    let itemName = normalizeName(itemNameRaw);
    itemName = itemName.replace(/มม\.HDPE/g, 'มม. HDPE');

    // Safe parsing of costs
    const materialCost = Math.round(parseCost(materialCostRaw, 'ค่าวัสดุ', itemName));
    const laborCost = Math.round(parseCost(laborCostRaw, 'ค่าแรง', itemName));
    const totalCost = Math.round(parseCost(totalCostRaw, 'รวมค่าวัสดุ+ค่าแรง', itemName));

    excelItems.push({
      item_name: itemName,
      unit: normalizeName(unit),
      material_cost: materialCost,
      labor_cost: laborCost,
      unit_cost: totalCost,
      excel_category: currentExcelCategory
    });
  }

  console.log(`✅ Parsed ${excelItems.length} items from Excel.`);
  if (excelItems.length !== 28) {
    console.error(`❌ Expected exactly 28 items, but parsed ${excelItems.length}. Aborting.`);
    process.exit(1);
  }

  // --- Strict Internal Duplicate Check ---
  console.log('🔄 Checking for internal duplicates in Excel...');
  const seenExcelNames = new Set();
  for (const item of excelItems) {
    const norm = item.item_name.toLowerCase();
    if (seenExcelNames.has(norm)) {
      console.error(`❌ Duplicate item found in Excel itself: "${item.item_name}". Aborting.`);
      process.exit(1);
    }
    seenExcelNames.add(norm);
  }
  console.log('✅ No internal duplicates found in Excel.');

  // --- Category Mapping ---
  console.log('🔄 Mapping categories to canonical database values...');
  const itemsWithCanonical = excelItems.map((item, index) => {
    // Determine category key (e.g. prefix "1.3.", "2.3.1", "5.", "6.1.2")
    const matchPrefix = item.excel_category.match(/^(\d+(?:\.\d+)*)\.?/);
    if (!matchPrefix) {
      console.error(`❌ Could not determine category prefix for: "${item.excel_category}". Aborting.`);
      process.exit(1);
    }
    
    const prefix = matchPrefix[1];
    const canonicalCategory = CANONICAL_CATEGORIES[prefix];
    
    if (!canonicalCategory) {
      console.error(`❌ No canonical category mapped for prefix "${prefix}" (${item.excel_category}). Aborting.`);
      process.exit(1);
    }

    const itemCode = `ITEM-${String(683 + index).padStart(4, '0')}`;
    const itemId = crypto.randomUUID();

    return {
      ...item,
      id: itemId,
      item_code: itemCode,
      category: canonicalCategory
    };
  });

  // --- Generate Verification Manifest ---
  console.log('🔄 Writing verification manifest...');
  fs.writeFileSync(OUTPUT_MANIFEST_PATH, JSON.stringify(itemsWithCanonical, null, 2), 'utf8');
  console.log(`✅ Verification manifest saved to: ${OUTPUT_MANIFEST_PATH}`);

  // --- Generate Hardened SQL File with Staging Table ---
  console.log('🔄 Generating SQL transaction file with Temp Staging Table and Hardened Assertions...');
  
  let sqlContent = `-- SQL Import Script for 28 PN6 Catalog Items
-- Generated dynamically on ${new Date().toISOString()}

BEGIN;

-- Lock table in SHARE ROW EXCLUSIVE MODE to prevent concurrent edits and deadlocks
LOCK TABLE public.price_list IN SHARE ROW EXCLUSIVE MODE NOWAIT;

-- 1. Create Temporary Staging Table
CREATE TEMP TABLE temp_price_list_staging (
  id UUID,
  item_code VARCHAR,
  item_name TEXT,
  unit VARCHAR,
  material_cost NUMERIC,
  labor_cost NUMERIC,
  unit_cost NUMERIC,
  category VARCHAR,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) ON COMMIT DROP;

-- 2. Populate Temporary Staging Table with Candidate Items
INSERT INTO temp_price_list_staging (id, item_code, item_name, unit, material_cost, labor_cost, unit_cost, category, is_active, created_at, updated_at)
VALUES
`;

  const valuesSql = itemsWithCanonical.map(item => {
    return `  ('${item.id}', '${item.item_code}', '${escapeSql(item.item_name)}', '${escapeSql(item.unit)}', ${item.material_cost}, ${item.labor_cost}, ${item.unit_cost}, '${escapeSql(item.category)}', true, now(), now())`;
  }).join(',\n');
  
  sqlContent += valuesSql;
  sqlContent += `;

-- 3. Execute Hardened Assertions & Transaction Logic
DO $$
DECLARE
  staging_row_count integer;
  inserted_row_count integer;
  code_conflict_count integer;
  internal_dup_count integer;
  production_dup_count integer;
  cost_mismatch_count integer;
  invalid_category_count integer;
BEGIN
  -- Assertion A: Verify exactly 28 items exist in the staging table
  SELECT COUNT(*) INTO staging_row_count FROM temp_price_list_staging;
  IF staging_row_count <> 28 THEN
    RAISE EXCEPTION 'Assertion A Failed: Expected exactly 28 staging rows, found %.', staging_row_count;
  END IF;

  -- Assertion B: Ensure there are no internal duplicates in the staging table itself (after spacing normalization)
  SELECT COUNT(*) INTO internal_dup_count
  FROM (
    SELECT LOWER(TRIM(REGEXP_REPLACE(item_name, '\\s+', ' ', 'g'))) AS norm_name
    FROM temp_price_list_staging
    GROUP BY norm_name
    HAVING COUNT(*) > 1
  ) dups;
  
  IF internal_dup_count > 0 THEN
    RAISE EXCEPTION 'Assertion B Failed: Internal duplicate items found within the candidate list itself.';
  END IF;

  -- Assertion C: Ensure target item_codes do not already exist in production
  SELECT COUNT(*) INTO code_conflict_count
  FROM temp_price_list_staging t
  JOIN public.price_list pl ON pl.item_code = t.item_code;

  IF code_conflict_count > 0 THEN
    RAISE EXCEPTION 'Assertion C Failed: Some candidate item codes are already in use in the price_list table.';
  END IF;

  -- Assertion D: Ensure none of the candidate item names already exist in production (whitespace-normalized duplicate check)
  SELECT COUNT(*) INTO production_dup_count
  FROM temp_price_list_staging t
  JOIN public.price_list pl ON 
    LOWER(TRIM(REGEXP_REPLACE(pl.item_name, '\\s+', ' ', 'g'))) = LOWER(TRIM(REGEXP_REPLACE(t.item_name, '\\s+', ' ', 'g')));

  IF production_dup_count > 0 THEN
    RAISE EXCEPTION 'Assertion D Failed: Candidate items already exist in the database (whitespace-normalized name duplicate check).';
  END IF;

  -- Assertion E: Ensure material_cost + labor_cost matches unit_cost for all items
  SELECT COUNT(*) INTO cost_mismatch_count
  FROM temp_price_list_staging
  WHERE material_cost + labor_cost <> unit_cost;

  IF cost_mismatch_count > 0 THEN
    RAISE EXCEPTION 'Assertion E Failed: Material cost + labor cost does not equal unit cost for some candidate items.';
  END IF;

  -- Assertion F: Verify that target categories are valid and exist in production (NULL-safe check using NOT EXISTS)
  SELECT COUNT(*) INTO invalid_category_count
  FROM temp_price_list_staging t
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.price_list pl
    WHERE pl.category = t.category
  );

  IF invalid_category_count > 0 THEN
    RAISE EXCEPTION 'Assertion F Failed: One or more categories do not match any canonical categories in production.';
  END IF;

  -- 4. Apply Staged Items to Production
  INSERT INTO public.price_list (id, item_code, item_name, unit, material_cost, labor_cost, unit_cost, category, is_active, created_at, updated_at)
  SELECT id, item_code, item_name, unit, material_cost, labor_cost, unit_cost, category, is_active, created_at, updated_at
  FROM temp_price_list_staging;

  -- 5. Verify exact row count of 28 rows inserted to production
  GET DIAGNOSTICS inserted_row_count = ROW_COUNT;
  IF inserted_row_count <> 28 THEN
    RAISE EXCEPTION 'Assertion G Failed: Expected exactly 28 rows inserted to public.price_list, got %.', inserted_row_count;
  END IF;

  RAISE NOTICE 'SRE Assertions Verified. Successfully imported exactly 28 catalog items.';
END $$;

COMMIT;
`;

  fs.writeFileSync(OUTPUT_SQL_PATH, sqlContent, 'utf8');
  console.log(`✅ Hardened SQL transaction script generated at: ${OUTPUT_SQL_PATH}`);
  
  // --- Generate Hardened Rollback SQL File ---
  console.log('🔄 Generating SQL rollback file with strict SRE safety validations...');
  
  let rollbackSql = `-- SQL Rollback Script for 28 PN6 Catalog Items
-- Generated dynamically on ${new Date().toISOString()}

BEGIN;

-- Lock table in SHARE ROW EXCLUSIVE MODE to prevent concurrent edits and deadlocks
LOCK TABLE public.price_list IN SHARE ROW EXCLUSIVE MODE NOWAIT;

DO $$
DECLARE
  referenced_count integer;
  deleted_row_count integer;
BEGIN
  -- 1. Pre-flight Check: Verify that NONE of the 28 UUIDs are referenced in boq_items
  SELECT COUNT(*) INTO referenced_count
  FROM public.boq_items
  WHERE price_list_id IN (
`;

  const rollbackUuidsSql = itemsWithCanonical.map(item => `    '${item.id}'`).join(',\n');
  rollbackSql += rollbackUuidsSql;
  rollbackSql += `
  );

  IF referenced_count > 0 THEN
    RAISE EXCEPTION 'Rollback Failed: One or more imported catalog items are already referenced in active BOQs (referenced count: %). Use is_active = false or forward-fix instead.', referenced_count;
  END IF;

  -- 2. Execute deletion of the 28 imported items
  DELETE FROM public.price_list
  WHERE id IN (
`;

  rollbackSql += rollbackUuidsSql;
  rollbackSql += `
  );

  -- 3. Assert that exactly 28 rows were deleted
  GET DIAGNOSTICS deleted_row_count = ROW_COUNT;
  IF deleted_row_count <> 28 THEN
    RAISE EXCEPTION 'Rollback Assertion Failed: Expected to delete exactly 28 rows, but % rows were affected.', deleted_row_count;
  END IF;

  RAISE NOTICE 'Rollback Success: Successfully removed exactly 28 catalog items.';
END $$;

COMMIT;
`;

  fs.writeFileSync(OUTPUT_ROLLBACK_SQL_PATH, rollbackSql, 'utf8');
  console.log(`✅ Hardened Rollback SQL script generated at: ${OUTPUT_ROLLBACK_SQL_PATH}`);
  
  console.log('\n🎉 Phase 1 Completed successfully!');
  console.log('Proceed to Phase 2 for User review.');
}

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
