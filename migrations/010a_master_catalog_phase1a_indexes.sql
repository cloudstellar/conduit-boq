-- =============================================================================
-- Migration 010a: Master Catalog Phase 1A - Concurrent Index Runbook
-- Status: DRAFT - RUN AFTER MIGRATION 010
--
-- IMPORTANT:
-- Run each CREATE INDEX CONCURRENTLY statement separately and outside an
-- explicit transaction. Do not paste-run all CREATE statements as one batch.
-- PostgreSQL does not allow CREATE INDEX CONCURRENTLY inside BEGIN/COMMIT.
-- =============================================================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_boq_price_list_version_id
  ON public.boq(price_list_version_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_boq_items_price_list_id
  ON public.boq_items(price_list_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_boq_items_boq_id
  ON public.boq_items(boq_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_price_list_audit_logs_version_id
  ON public.price_list_audit_logs(version_id);

-- Every expected index must exist and have indisvalid = true.
SELECT indexrelid::regclass AS index_name, indisvalid
FROM pg_index
WHERE indexrelid::regclass::text IN (
  'idx_boq_price_list_version_id',
  'idx_boq_items_price_list_id',
  'idx_boq_items_boq_id',
  'idx_price_list_audit_logs_version_id'
)
ORDER BY indexrelid::regclass::text;
