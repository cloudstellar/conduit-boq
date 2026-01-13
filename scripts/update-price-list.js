const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://otlssvssvgkohqwuuiir.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bHNzdnNzdmdrb2hxd3V1aWlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMzQ1ODksImV4cCI6MjA4MzYxMDU4OX0.QfPnAZA4Q2h6HG2BE4OpcP7aTmafTcammhtS8dx6FUU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updatePriceList() {
  // Read xlsx file
  const workbook = XLSX.readFile('public/price_list_2568.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Extract items from xlsx
  const xlsxItems = [];
  let itemCount = 0;
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length < 10) continue;
    
    const itemNo = row[3];
    const itemName = row[4]?.toString().trim();
    const unit = row[6];
    const materialCost = row[7];
    const laborCost = row[8];
    const totalCost = row[9];
    
    // Skip if no item number or not numeric
    if (!itemNo || isNaN(parseInt(itemNo))) continue;
    if (!itemName || !unit) continue;
    
    itemCount++;
    xlsxItems.push({
      item_code: 'ITEM-' + String(itemCount).padStart(4, '0'),
      item_name: itemName,
      material_cost: Math.round(parseFloat(materialCost) || 0),
      labor_cost: Math.round(parseFloat(laborCost) || 0),
      unit_cost: Math.round(parseFloat(totalCost) || 0)
    });
  }

  console.log('Total items in xlsx:', xlsxItems.length);

  // Get current items from database
  const { data: dbItems, error } = await supabase
    .from('price_list')
    .select('item_code, item_name, material_cost, labor_cost, unit_cost')
    .order('item_code');

  if (error) {
    console.error('Error fetching from database:', error);
    return;
  }

  console.log('Total items in database:', dbItems.length);

  // Update all items by matching item_name
  let updatedCount = 0;
  let notFoundCount = 0;
  const notFoundItems = [];

  for (const xlsxItem of xlsxItems) {
    // Find matching item in database by item_name (cleaned)
    const cleanXlsxName = xlsxItem.item_name.replace(/\s+/g, ' ').trim();

    const dbItem = dbItems.find(db => {
      const cleanDbName = db.item_name.replace(/\s+/g, ' ').trim();
      return cleanDbName === cleanXlsxName;
    });

    if (dbItem) {
      // Update the database with xlsx prices
      const { error: updateError } = await supabase
        .from('price_list')
        .update({
          material_cost: xlsxItem.material_cost,
          labor_cost: xlsxItem.labor_cost,
          unit_cost: xlsxItem.unit_cost
        })
        .eq('item_code', dbItem.item_code);

      if (updateError) {
        console.error('Error updating', dbItem.item_code, ':', updateError);
      } else {
        updatedCount++;
      }
    } else {
      notFoundCount++;
      notFoundItems.push(cleanXlsxName.substring(0, 60));
    }
  }

  console.log('\n--- Summary ---');
  console.log('Updated:', updatedCount, 'items');
  console.log('Not found in DB:', notFoundCount, 'items');

  if (notFoundItems.length > 0) {
    console.log('\nItems not found:');
    notFoundItems.slice(0, 20).forEach(name => console.log('  -', name));
  }
}

updatePriceList().catch(console.error);

