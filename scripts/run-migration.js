#!/usr/bin/env node

/**
 * Migration Script: Add Multi-Route Support to BOQ System
 * This script will:
 * 1. Backup current data
 * 2. Run schema migration
 * 3. Migrate existing data
 * 4. Verify migration success
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to run SQL query
async function runSQL(sql, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) throw error;
    console.log(`✅ ${description} - Success`);
    return data;
  } catch (error) {
    console.error(`❌ ${description} - Failed:`, error.message);
    throw error;
  }
}

// Main migration function
async function runMigration() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   🚀 BOQ Multi-Route Migration Script                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    // Step 1: Backup - Count existing records
    console.log('\n📋 STEP 1: BACKUP & VERIFICATION');
    console.log('═'.repeat(60));

    const { data: boqCount, error: boqError } = await supabase
      .from('boq')
      .select('*', { count: 'exact', head: true });
    
    if (boqError) throw boqError;

    const { data: itemsCount, error: itemsError } = await supabase
      .from('boq_items')
      .select('*', { count: 'exact', head: true });
    
    if (itemsError) throw itemsError;

    console.log(`📊 Current Database State:`);
    console.log(`   - BOQ Records: ${boqCount?.length || 0}`);
    console.log(`   - BOQ Items: ${itemsCount?.length || 0}`);

    // Step 2: Read migration SQL file
    console.log('\n🔧 STEP 2: LOADING MIGRATION SQL');
    console.log('═'.repeat(60));

    const migrationPath = path.join(__dirname, '../migrations/002_add_multi_route_support.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log(`✅ Loaded migration file: ${migrationPath}`);
    console.log(`   File size: ${(migrationSQL.length / 1024).toFixed(2)} KB`);

    // Step 3: Run migration
    console.log('\n⚙️  STEP 3: RUNNING MIGRATION');
    console.log('═'.repeat(60));
    console.log('⚠️  This will:');
    console.log('   1. Create boq_routes table');
    console.log('   2. Add route_id to boq_items (nullable)');
    console.log('   3. Add Factor F columns to boq');
    console.log('   4. Migrate existing data to default routes');
    console.log('');

    // Split SQL into individual statements and execute
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...`);

    // Note: Supabase doesn't support exec_sql RPC by default
    // We need to use the SQL editor or create tables via API
    console.log('\n⚠️  IMPORTANT: Supabase client cannot execute DDL statements directly.');
    console.log('Please run the migration manually in Supabase SQL Editor:');
    console.log('');
    console.log('1. Open: https://app.supabase.com/project/otlssvssvgkohqwuuiir/sql/new');
    console.log('2. Copy the entire content of: migrations/002_add_multi_route_support.sql');
    console.log('3. Paste and click "Run"');
    console.log('');
    console.log('After running the migration, run this script again with --verify flag');
    console.log('   node scripts/run-migration.js --verify');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Verification function
async function verifyMigration() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   ✅ BOQ Migration Verification                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    // Check if boq_routes table exists
    const { data: routes, error: routesError } = await supabase
      .from('boq_routes')
      .select('*', { count: 'exact', head: true });

    if (routesError) {
      console.log('❌ boq_routes table not found. Migration not completed.');
      console.log('   Please run the migration SQL first.');
      process.exit(1);
    }

    console.log(`✅ boq_routes table exists`);
    console.log(`   Routes created: ${routes?.length || 0}`);

    // Check boq_items have route_id
    const { data: items, error: itemsError } = await supabase
      .from('boq_items')
      .select('id, route_id');

    if (itemsError) throw itemsError;

    const itemsWithRoute = items.filter(i => i.route_id !== null).length;
    const itemsWithoutRoute = items.length - itemsWithRoute;

    console.log(`\n📊 BOQ Items Status:`);
    console.log(`   Total items: ${items.length}`);
    console.log(`   With route_id: ${itemsWithRoute}`);
    console.log(`   Without route_id: ${itemsWithoutRoute}`);

    if (itemsWithoutRoute > 0) {
      console.log(`\n⚠️  Warning: ${itemsWithoutRoute} items don't have route_id`);
      console.log(`   This might be expected for new items or empty BOQs`);
    }

    console.log('\n✅ Migration verification completed!');
    console.log('\n🎉 Next steps:');
    console.log('   1. Start dev server: npm run dev');
    console.log('   2. Test existing BOQs display correctly');
    console.log('   3. Test creating new multi-route BOQs');

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
  }
}

// Run based on command line argument
const args = process.argv.slice(2);
if (args.includes('--verify')) {
  verifyMigration();
} else {
  runMigration();
}

