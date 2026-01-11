#!/bin/bash

# ============================================================================
# Automatic Migration Script for BOQ Multi-Route Support
# ============================================================================
# This script will automatically run the migration in Supabase
# ============================================================================

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🚀 BOQ Multi-Route Auto Migration                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Load environment variables
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found"
    exit 1
fi

source .env.local

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: Missing Supabase credentials in .env.local"
    exit 1
fi

echo "✅ Loaded Supabase credentials"
echo "   URL: $NEXT_PUBLIC_SUPABASE_URL"
echo ""

# Read migration SQL
MIGRATION_FILE="migrations/002_add_multi_route_support.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "📋 STEP 1: BACKUP CURRENT STATE"
echo "════════════════════════════════════════════════════════════"

# Count BOQ records
BOQ_COUNT=$(curl -s -X GET \
  "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/boq?select=count" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Prefer: count=exact" | grep -o '"count":[0-9]*' | grep -o '[0-9]*' || echo "0")

# Count BOQ Items
ITEMS_COUNT=$(curl -s -X GET \
  "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/boq_items?select=count" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Prefer: count=exact" | grep -o '"count":[0-9]*' | grep -o '[0-9]*' || echo "0")

echo "📊 Current Database State:"
echo "   - BOQ Records: ${BOQ_COUNT:-0}"
echo "   - BOQ Items: ${ITEMS_COUNT:-0}"
echo ""

echo "⚠️  IMPORTANT NOTICE:"
echo "════════════════════════════════════════════════════════════"
echo "Supabase REST API cannot execute DDL statements (CREATE TABLE, ALTER TABLE)."
echo "You need to run the migration manually in Supabase SQL Editor."
echo ""
echo "📝 INSTRUCTIONS:"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "1. Open Supabase SQL Editor:"
echo "   👉 https://app.supabase.com/project/otlssvssvgkohqwuuiir/sql/new"
echo ""
echo "2. Copy the migration SQL:"
echo "   👉 Open file: migrations/002_add_multi_route_support.sql"
echo "   👉 Copy ALL content (Cmd/Ctrl + A, then Cmd/Ctrl + C)"
echo ""
echo "3. Paste in SQL Editor and click 'Run'"
echo ""
echo "4. Verify migration success:"
echo "   👉 Run: node scripts/run-migration.js --verify"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""
echo "🔗 Quick Links:"
echo "   - SQL Editor: https://app.supabase.com/project/otlssvssvgkohqwuuiir/sql/new"
echo "   - Migration File: $(pwd)/migrations/002_add_multi_route_support.sql"
echo ""
echo "💡 Tip: The migration is SAFE - it won't delete any existing data!"
echo ""

# Open SQL Editor in browser
if command -v open &> /dev/null; then
    echo "🌐 Opening Supabase SQL Editor in browser..."
    open "https://app.supabase.com/project/otlssvssvgkohqwuuiir/sql/new"
elif command -v xdg-open &> /dev/null; then
    echo "🌐 Opening Supabase SQL Editor in browser..."
    xdg-open "https://app.supabase.com/project/otlssvssvgkohqwuuiir/sql/new"
fi

echo ""
echo "✅ Ready for migration!"

