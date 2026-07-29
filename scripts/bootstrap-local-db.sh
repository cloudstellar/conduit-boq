#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SNAPSHOT_DIR="$ROOT_DIR/supabase/.snapshots"
LOCAL_ENV="$ROOT_DIR/supabase/.env.local"
DB_CONTAINER="supabase_db_conduit-boq-local"
PUBLIC_DATA_SNAPSHOT="${PUBLIC_DATA_SNAPSHOT:-$SNAPSHOT_DIR/public-data.sql}"
LOCAL_API_URL="http://127.0.0.1:55321"

cd "$ROOT_DIR"

if [[ ! -f "$SNAPSHOT_DIR/auth-data-scrubbed.sql" ]]; then
  echo "Missing local snapshot: $SNAPSHOT_DIR/auth-data-scrubbed.sql" >&2
  exit 1
fi

if [[ ! -f "$PUBLIC_DATA_SNAPSHOT" ]]; then
  echo "Missing public-data snapshot: $PUBLIC_DATA_SNAPSHOT" >&2
  exit 1
fi

if [[ ! -f "$LOCAL_ENV" ]]; then
  echo "Missing local-only credentials: $LOCAL_ENV" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$LOCAL_ENV"
set +a

: "${LOCAL_SUPABASE_SECRET_KEY:?Missing LOCAL_SUPABASE_SECRET_KEY in $LOCAL_ENV}"

wait_for_local_rest_schema() {
  local attempt

  for attempt in {1..30}; do
    if curl --fail --silent --output /dev/null \
      --connect-timeout 2 \
      --max-time 5 \
      --header "apikey: $LOCAL_SUPABASE_SECRET_KEY" \
      "$LOCAL_API_URL/rest/v1/organizations?select=id&limit=1"; then
      echo "Local PostgREST schema cache is ready."
      return 0
    fi

    if (( attempt < 30 )); then
      sleep 1
    fi
  done

  echo "Local PostgREST schema cache did not become ready after 30 attempts." >&2
  return 1
}

npm run db:local:start
npx supabase db reset --local --no-seed

docker cp supabase/local/production-baseline.sql "$DB_CONTAINER:/tmp/production-baseline.sql"
docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/production-baseline.sql

docker cp "$SNAPSHOT_DIR/auth-data-scrubbed.sql" "$DB_CONTAINER:/tmp/auth-data.sql"
docker cp "$PUBLIC_DATA_SNAPSHOT" "$DB_CONTAINER:/tmp/public-data.sql"
docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/auth-data.sql
docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/public-data.sql

docker cp migrations/009_master_catalog_p0_containment.sql "$DB_CONTAINER:/tmp/009.sql"
docker cp migrations/010_master_catalog_phase1a_versioning.sql "$DB_CONTAINER:/tmp/010.sql"
docker cp migrations/011_master_catalog_phase1b_hardening.sql "$DB_CONTAINER:/tmp/011.sql"
docker cp migrations/012_factor_f_version_foundation.sql "$DB_CONTAINER:/tmp/012.sql"
docker cp migrations/013_factor_f_seed_current_baseline.sql "$DB_CONTAINER:/tmp/013.sql"
docker cp migrations/014_factor_f_publish_2569_0_0.sql "$DB_CONTAINER:/tmp/014.sql"
docker cp migrations/015_factor_f_repair_legacy_snapshot_metadata.sql "$DB_CONTAINER:/tmp/015.sql"
docker cp migrations/016_hotfix_preserve_boq_item_suffix.sql "$DB_CONTAINER:/tmp/016.sql"
docker cp migrations/017_master_catalog_phase4_foundation.sql "$DB_CONTAINER:/tmp/017.sql"
docker cp migrations/017a_master_catalog_phase4_global_function_default_privileges.sql "$DB_CONTAINER:/tmp/017a.sql"
docker cp migrations/018_master_catalog_phase4_draft_mutation.sql "$DB_CONTAINER:/tmp/018.sql"
docker cp migrations/019_master_catalog_phase4_publish_pointer.sql "$DB_CONTAINER:/tmp/019.sql"
docker cp migrations/020_master_catalog_phase4_admin_workflow_hardening.sql "$DB_CONTAINER:/tmp/020.sql"
docker cp migrations/021_master_catalog_phase4_placement_governance.sql "$DB_CONTAINER:/tmp/021.sql"
docker cp migrations/022_master_catalog_phase4_draft_identity_and_release_number.sql "$DB_CONTAINER:/tmp/022.sql"
docker cp migrations/023_master_catalog_phase4_published_code_rls_scope.sql "$DB_CONTAINER:/tmp/023.sql"
docker cp migrations/024_master_catalog_phase4_set_based_placement_invalidation.sql "$DB_CONTAINER:/tmp/024.sql"
docker cp migrations/025_master_catalog_phase4_withdraw_order_compaction.sql "$DB_CONTAINER:/tmp/025.sql"
docker cp migrations/026_master_catalog_phase4_catalog_action_error_acl.sql "$DB_CONTAINER:/tmp/026.sql"
docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/009.sql
docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/010.sql

docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -c \
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_boq_price_list_version_id ON public.boq(price_list_version_id);'
docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -c \
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_boq_items_price_list_id ON public.boq_items(price_list_id);'
docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -c \
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_boq_items_boq_id ON public.boq_items(boq_id);'
docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -c \
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_price_list_audit_logs_version_id ON public.price_list_audit_logs(version_id);'

docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -c \
  'UPDATE public.boq_items bi SET category = pl.category FROM public.price_list pl WHERE bi.price_list_id = pl.id AND bi.price_list_id IS NOT NULL AND bi.category IS NULL;'
docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/011.sql
docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/012.sql
docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/013.sql
docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/014.sql
docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/015.sql
docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/016.sql
docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/017.sql
docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/017a.sql
docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/018.sql
docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/019.sql
docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/020.sql
docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/021.sql
docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/022.sql
docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/023.sql
docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/024.sql
docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/025.sql
docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/026.sql

wait_for_local_rest_schema
npm run db:local:seed-users
npm run db:local:smoke-auth
npm run db:local:smoke-master-catalog

docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -Atc \
  "SELECT json_build_object(
    'boq', (SELECT count(*) FROM public.boq),
    'boq_items', (SELECT count(*) FROM public.boq_items),
    'price_list', (SELECT count(*) FROM public.price_list),
    'unversioned_boqs', (SELECT count(*) FROM public.boq WHERE price_list_version_id IS NULL),
    'missing_categories', (SELECT count(*) FROM public.boq_items WHERE price_list_id IS NOT NULL AND category IS NULL),
    'anon_save_rpc', has_function_privilege('anon','public.save_boq_with_routes(uuid,jsonb,jsonb)','EXECUTE'),
    'version_nullable', (SELECT is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'boq' AND column_name = 'price_list_version_id'),
    'immutable_trigger', EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid = 'public.boq'::regclass AND tgname = 'trigger_prevent_boq_version_modification' AND NOT tgisinternal),
    'guard_is_invoker', (SELECT NOT prosecdef FROM pg_proc WHERE oid = 'public.prevent_boq_version_modification()'::regprocedure),
    'factor_f_default_version', (
      SELECT v.version_string
      FROM public.factor_reference_default_version dv
      JOIN public.factor_reference_versions v ON v.id = dv.version_id
      WHERE dv.id = true
    ),
    'factor_f_2569_row_count', (
      SELECT count(*)
      FROM public.factor_reference_rows r
      JOIN public.factor_reference_versions v ON v.id = r.version_id
      WHERE v.version_string = '2569.0.0'
    ),
    'factor_f_partial_legacy_snapshots_remaining', (
      SELECT count(*)
      FROM public.boq
      WHERE factor_reference_version_id IS NULL
        AND factor_f IS NOT NULL
        AND (
          factor_f_raw IS NULL
          OR factor_f_lower_cost IS NULL
          OR factor_f_upper_cost IS NULL
          OR factor_f_lower_value IS NULL
          OR factor_f_upper_value IS NULL
        )
    )
  );"

echo "Local Master Catalog and Factor F environment is ready."
echo "Studio: http://127.0.0.1:55323"
echo "App API: http://127.0.0.1:55321"
