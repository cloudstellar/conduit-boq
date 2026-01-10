const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://otlssvssvgkohqwuuiir.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bHNzdnNzdmdrb2hxd3V1aWlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMzQ1ODksImV4cCI6MjA4MzYxMDU4OX0.QfPnAZA4Q2h6HG2BE4OpcP7aTmafTcammhtS8dx6FUU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function importPriceList() {
  const workbook = XLSX.readFile('รายการราคา.xlsx');
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);

  let currentCategory = '';
  let itemCount = 0;
  const items = [];

  for (const row of data) {
    const itemNo = row['__EMPTY_4'];
    const itemName = row['__EMPTY_5']?.toString().trim();
    const unit = row['__EMPTY_7'];
    const materialCost = row['__EMPTY_8'];
    const laborCost = row['__EMPTY_9'];
    const totalCost = row['__EMPTY_10'];

    // Skip header rows and empty rows
    if (!itemName || itemName === 'รายการวัสดุ' || itemName === 'ที่') continue;

    // Check if this is a category header (no unit, no costs)
    if (!unit && materialCost === undefined && laborCost === undefined) {
      currentCategory = itemName;
      continue;
    }

    // Skip rows without proper data
    if (!unit || (materialCost === undefined && laborCost === undefined)) continue;

    itemCount++;
    const itemCode = `ITEM-${String(itemCount).padStart(4, '0')}`;

    items.push({
      item_code: itemCode,
      item_name: itemName,
      unit: unit,
      material_cost: parseFloat(materialCost) || 0,
      labor_cost: parseFloat(laborCost) || 0,
      unit_cost: parseFloat(totalCost) || 0,
      category: currentCategory,
      remarks: null,
      is_active: true
    });
  }

  console.log(`Found ${items.length} items to import`);

  // Insert in batches of 50
  const batchSize = 50;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const { error } = await supabase.from('price_list').insert(batch);
    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
    } else {
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)}`);
    }
  }

  console.log('Import completed!');
  
  // Verify count
  const { count } = await supabase.from('price_list').select('*', { count: 'exact', head: true });
  console.log(`Total items in database: ${count}`);
}

importPriceList().catch(console.error);

