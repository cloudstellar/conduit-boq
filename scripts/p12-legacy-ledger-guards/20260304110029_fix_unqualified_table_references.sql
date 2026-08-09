-- P-12 legacy-ledger compatibility guard; this is not reconstructed migration SQL.
-- The exact version/name must already exist in the remote migration ledger.
-- If the Supabase CLI attempts to apply this file, full-ledger parity is absent.
DO $p12_legacy_ledger_guard$
BEGIN
  RAISE EXCEPTION
    'P-12 compatibility guard 20260304110029_fix_unqualified_table_references must never execute; full remote migration-ledger parity is absent';
END
$p12_legacy_ledger_guard$;
