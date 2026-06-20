#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SNAPSHOT_DIR="$ROOT_DIR/supabase/.snapshots"
LOCAL_ENV="$ROOT_DIR/supabase/.env.local"
DB_CONTAINER="supabase_db_conduit-boq-local"

cd "$ROOT_DIR"

for file in auth-data-scrubbed.sql public-data.sql; do
  if [[ ! -f "$SNAPSHOT_DIR/$file" ]]; then
    echo "Missing local snapshot: $SNAPSHOT_DIR/$file" >&2
    exit 1
  fi
done

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

docker cp "$SNAPSHOT_DIR/auth-data-scrubbed.sql" "$DB_CONTAINER:/tmp/auth-data.sql"
docker cp "$SNAPSHOT_DIR/public-data.sql" "$DB_CONTAINER:/tmp/public-data.sql"
docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/auth-data.sql
docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -f /tmp/public-data.sql

docker cp migrations/009_master_catalog_p0_containment.sql "$DB_CONTAINER:/tmp/009.sql"
docker cp migrations/010_master_catalog_phase1a_versioning.sql "$DB_CONTAINER:/tmp/010.sql"
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

npm run db:local:seed-users
npm run db:local:smoke-auth

docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -Atc \
  "SELECT json_build_object(
    'boq', (SELECT count(*) FROM public.boq),
    'boq_items', (SELECT count(*) FROM public.boq_items),
    'price_list', (SELECT count(*) FROM public.price_list),
    'unversioned_boqs', (SELECT count(*) FROM public.boq WHERE price_list_version_id IS NULL),
    'missing_categories', (SELECT count(*) FROM public.boq_items WHERE price_list_id IS NOT NULL AND category IS NULL),
    'anon_save_rpc', has_function_privilege('anon','public.save_boq_with_routes(uuid,jsonb,jsonb)','EXECUTE')
  );"

echo "Local Master Catalog environment is ready."
echo "Studio: http://127.0.0.1:55323"
echo "App API: http://127.0.0.1:55321"
