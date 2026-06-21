#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SNAPSHOT_DIR="$ROOT_DIR/supabase/.snapshots"
LOCAL_ENV="$ROOT_DIR/supabase/.env.local"
DB_CONTAINER="supabase_db_conduit-boq-local"
PUBLIC_DATA_SNAPSHOT="${PUBLIC_DATA_SNAPSHOT:-$SNAPSHOT_DIR/public-data.sql}"

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
    'guard_is_invoker', (SELECT NOT prosecdef FROM pg_proc WHERE oid = 'public.prevent_boq_version_modification()'::regprocedure)
  );"

echo "Local Master Catalog environment is ready."
echo "Studio: http://127.0.0.1:55323"
echo "App API: http://127.0.0.1:55321"
