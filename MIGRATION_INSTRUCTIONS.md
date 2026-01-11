# 🚀 Migration Instructions - Multi-Route BOQ Support

## 📊 Current Database State
- **BOQ Records:** 14
- **BOQ Items:** 2

## ✅ Migration is SAFE
- ✅ No data will be deleted
- ✅ All changes are backward compatible
- ✅ Existing BOQs will work normally
- ✅ Can rollback if needed

---

## 🎯 Quick Start (3 Steps)

### Step 1: Open Supabase SQL Editor

Click this link (already opened in your browser):
👉 **https://app.supabase.com/project/otlssvssvgkohqwuuiir/sql/new**

---

### Step 2: Copy & Paste Migration SQL

**Option A: Copy from file**
1. Open file: `migrations/002_add_multi_route_support.sql`
2. Select all (Cmd/Ctrl + A)
3. Copy (Cmd/Ctrl + C)
4. Paste in SQL Editor
5. Click **"Run"** button

**Option B: Use terminal command**
```bash
# Copy migration SQL to clipboard (macOS)
cat migrations/002_add_multi_route_support.sql | pbcopy

# Then paste in SQL Editor and click Run
```

---

### Step 3: Verify Migration

After running the SQL, verify it worked:

```bash
node scripts/run-migration.js --verify
```

**Expected output:**
```
✅ boq_routes table exists
   Routes created: 1 (or more)

📊 BOQ Items Status:
   Total items: 2
   With route_id: 2
   Without route_id: 0

✅ Migration verification completed!
```

---

## 📋 What the Migration Does

### 1. Creates New Table: `boq_routes`
Stores multiple routes for each BOQ project.

### 2. Updates `boq_items` Table
Adds `route_id` column (nullable - won't break existing data).

### 3. Updates `boq` Table
Adds Factor F calculation columns.

### 4. Migrates Existing Data
- Creates a default route for each BOQ that has items
- Links all existing items to their default route
- Preserves all totals and calculations

---

## 🔍 Verification Queries

After migration, you can run these in SQL Editor to verify:

```sql
-- Check routes were created
SELECT COUNT(*) as routes_created FROM boq_routes;

-- Check items are linked to routes
SELECT 
    COUNT(*) as total_items,
    COUNT(route_id) as items_with_route
FROM boq_items;

-- Verify totals match
SELECT 
    b.project_name,
    b.total_cost as boq_total,
    br.total_cost as route_total,
    CASE WHEN b.total_cost = br.total_cost THEN '✓ OK' ELSE '⚠ DIFF' END as status
FROM boq b
JOIN boq_routes br ON br.boq_id = b.id
WHERE br.route_order = 1;
```

---

## 🔄 Rollback (If Needed)

If something goes wrong, you can rollback:

```bash
# In Supabase SQL Editor, run:
# migrations/002_rollback_multi_route_support.sql
```

This will remove all changes and restore to previous state.

---

## 🆘 Troubleshooting

### Error: "relation already exists"
✅ Migration already ran successfully. Skip to Step 3 (Verify).

### Error: "permission denied"
❌ Check that you're using the correct Supabase project.

### Items not showing route_id
⚠️ Re-run the migration SQL (it's safe to run multiple times).

---

## 📞 Next Steps After Migration

1. ✅ Verify migration (Step 3 above)
2. 🚀 Start dev server: `npm run dev`
3. 🧪 Test existing BOQs display correctly
4. ✨ Test creating new multi-route BOQs

---

## 🎉 Ready?

**Current Status:**
- [x] Supabase connected
- [x] Migration SQL ready
- [x] SQL Editor opened
- [ ] **👉 Run migration SQL**
- [ ] Verify migration
- [ ] Test application

**Go to Step 2 above and run the migration!** 🚀

