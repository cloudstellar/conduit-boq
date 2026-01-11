# 🚀 Multi-Route BOQ Migration Guide

## 📋 Overview
This migration adds multi-route support to the BOQ system while preserving all existing data.

## ✅ Safety Guarantees
- ✅ **No data loss** - All existing BOQ and items are preserved
- ✅ **Backward compatible** - Old BOQs will work with new system
- ✅ **Automatic migration** - Existing items are linked to default routes
- ✅ **Rollback available** - Can revert if needed

---

## 🎯 Migration Steps

### Step 1: Backup (5 minutes)

1. Open Supabase Dashboard: https://app.supabase.com
2. Go to **SQL Editor**
3. Open file: `migrations/001_backup_before_migration.sql`
4. Copy all queries and run in SQL Editor
5. **Save the results** (screenshot or export to CSV)

**What to verify:**
- Total BOQ count
- Total items count
- All BOQs have matching totals

---

### Step 2: Run Migration (2 minutes)

1. Still in **SQL Editor**
2. Click **New Query**
3. Open file: `migrations/002_add_multi_route_support.sql`
4. Copy **entire file** and paste into SQL Editor
5. Click **Run** (or press Cmd/Ctrl + Enter)

**Expected output:**
```
✅ Migration completed successfully!
routes_created: X
items_migrated: Y
```

---

### Step 3: Verify Migration (3 minutes)

The migration script includes verification queries at the end. Check:

1. **All items have route_id:**
   - `with_route_id` should equal `count`
   - `without_route_id` should be 0

2. **Routes created for all BOQs:**
   - `boqs_with_items` should equal `boqs_with_routes`

3. **Totals match:**
   - All rows should show `✓ OK` status
   - No `⚠ MISMATCH` entries

---

### Step 4: Test Application (5 minutes)

1. Restart dev server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000

3. **Test existing BOQ:**
   - Open an old BOQ
   - Should display normally with 1 route
   - All items should be visible

4. **Test new multi-route BOQ:**
   - Create new BOQ
   - Add multiple routes
   - Add items to different routes
   - Verify totals calculate correctly

---

## 🔄 Rollback (If Needed)

If something goes wrong:

1. Open **SQL Editor**
2. Open file: `migrations/002_rollback_multi_route_support.sql`
3. Run the entire script
4. This will:
   - Remove `boq_routes` table
   - Remove `route_id` from `boq_items`
   - Restore to pre-migration state

**Note:** You'll lose any new multi-route BOQs created after migration.

---

## 📊 What Changes?

### Database Schema

**New Table:**
```sql
boq_routes
├── id (UUID)
├── boq_id (FK to boq)
├── route_order (INT)
├── route_name (TEXT)
├── total_material_cost (DECIMAL)
├── total_labor_cost (DECIMAL)
└── total_cost (DECIMAL)
```

**Modified Table:**
```sql
boq_items
└── + route_id (UUID, nullable, FK to boq_routes)

boq
├── + factor_f (DECIMAL)
├── + total_with_factor_f (DECIMAL)
└── + total_with_vat (DECIMAL)
```

### Data Migration

For each existing BOQ with items:
1. Creates a default route (route_order = 1)
2. Uses existing `boq.route` as route name (or "เส้นทางหลัก")
3. Links all items to this default route
4. Copies totals from BOQ to route

---

## 🆘 Troubleshooting

### Error: "relation already exists"
- Migration was already run
- Check if `boq_routes` table exists
- If yes, skip to Step 3 (Verify)

### Error: "column already exists"
- Partial migration completed
- Safe to re-run the migration (uses IF NOT EXISTS)

### Items not showing in app
- Check browser console for errors
- Verify route_id is set: `SELECT COUNT(*) FROM boq_items WHERE route_id IS NULL`
- Should be 0 for migrated data

### Totals don't match
- Run verification query from migration
- Check for rounding differences (< 0.01 is OK)
- If large difference, contact support

---

## 📞 Support

If you encounter issues:
1. Check verification queries output
2. Review browser console errors
3. Check Supabase logs
4. Have backup results ready

---

## ✅ Success Checklist

- [ ] Backup queries completed and saved
- [ ] Migration script ran successfully
- [ ] Verification queries show all OK
- [ ] Old BOQs display correctly
- [ ] Can create new multi-route BOQs
- [ ] Totals calculate correctly
- [ ] Print page works for both old and new BOQs

---

**Ready to start?** Begin with Step 1: Backup

