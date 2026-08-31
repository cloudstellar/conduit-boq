-- Aggregate-only Production planning evidence.
-- Query version: product-planning-readonly-v4
-- No DDL/DML, row identifiers, names, email addresses, IP addresses, agents,
-- tokens, secrets, expressions, project names, or BOQ numbers are selected.

with
item_stats as (
  select
    count(*)::bigint as item_rows,
    count(*) filter (where quantity = 0)::bigint as zero_quantity_rows,
    count(*) filter (where quantity < 0)::bigint as negative_quantity_rows,
    min(quantity) as min_quantity,
    max(quantity) as max_quantity,
    count(*) filter (
      where abs(coalesce(total_material_cost, 0) - round(quantity * coalesce(material_cost_per_unit, 0), 2)) > 0.01
         or abs(coalesce(total_labor_cost, 0) - round(quantity * coalesce(labor_cost_per_unit, 0), 2)) > 0.01
    )::bigint as component_mismatch_gt_001_rows,
    count(*) filter (
      where greatest(
        abs(coalesce(total_material_cost, 0) - round(quantity * coalesce(material_cost_per_unit, 0), 2)),
        abs(coalesce(total_labor_cost, 0) - round(quantity * coalesce(labor_cost_per_unit, 0), 2))
      ) > 1
    )::bigint as component_mismatch_gt_1_rows,
    max(greatest(
      abs(coalesce(total_material_cost, 0) - round(quantity * coalesce(material_cost_per_unit, 0), 2)),
      abs(coalesce(total_labor_cost, 0) - round(quantity * coalesce(labor_cost_per_unit, 0), 2))
    )) as max_component_mismatch,
    count(*) filter (
      where abs(coalesce(total_cost, 0) - (coalesce(total_material_cost, 0) + coalesce(total_labor_cost, 0))) > 0
    )::bigint as item_total_any_mismatch_rows,
    count(*) filter (
      where abs(coalesce(total_cost, 0) - (coalesce(total_material_cost, 0) + coalesce(total_labor_cost, 0))) > 0.01
    )::bigint as item_total_mismatch_gt_001_rows,
    max(abs(coalesce(total_cost, 0) - (coalesce(total_material_cost, 0) + coalesce(total_labor_cost, 0)))) as max_item_total_mismatch,
    count(*) filter (where route_id is null)::bigint as unlinked_item_rows
  from public.boq_items
),
route_rollup as (
  select
    r.id,
    r.boq_id,
    r.total_material_cost,
    r.total_labor_cost,
    r.total_cost,
    count(i.id)::bigint as linked_item_rows,
    coalesce(sum(i.total_material_cost), 0) as sum_material,
    coalesce(sum(i.total_labor_cost), 0) as sum_labor,
    coalesce(sum(i.total_cost), 0) as sum_total
  from public.boq_routes r
  left join public.boq_items i on i.route_id = r.id
  group by r.id
),
route_stats as (
  select
    count(*)::bigint as route_rows,
    count(*) filter (
      where abs(coalesce(total_material_cost, 0) - sum_material) > 0.01
         or abs(coalesce(total_labor_cost, 0) - sum_labor) > 0.01
         or abs(coalesce(total_cost, 0) - sum_total) > 0.01
    )::bigint as route_mismatch_gt_001_rows,
    count(*) filter (
      where linked_item_rows = 0
        and (
          abs(coalesce(total_material_cost, 0) - sum_material) > 0.01
          or abs(coalesce(total_labor_cost, 0) - sum_labor) > 0.01
          or abs(coalesce(total_cost, 0) - sum_total) > 0.01
        )
    )::bigint as mismatched_routes_with_zero_linked_items,
    count(*) filter (
      where linked_item_rows = 0
        and (
          abs(coalesce(total_material_cost, 0) - sum_material) > 0.01
          or abs(coalesce(total_labor_cost, 0) - sum_labor) > 0.01
          or abs(coalesce(total_cost, 0) - sum_total) > 0.01
        )
        and exists (
          select 1
          from public.boq_items unlinked
          where unlinked.boq_id = route_rollup.boq_id
            and unlinked.route_id is null
        )
    )::bigint as mismatched_zero_item_routes_whose_boq_has_unlinked_items,
    max(greatest(
      abs(coalesce(total_material_cost, 0) - sum_material),
      abs(coalesce(total_labor_cost, 0) - sum_labor),
      abs(coalesce(total_cost, 0) - sum_total)
    )) as max_route_mismatch
  from route_rollup
),
boq_rollup as (
  select
    b.id,
    b.status,
    b.total_material_cost,
    b.total_labor_cost,
    b.total_cost,
    coalesce(sum(r.total_material_cost), 0) as sum_material,
    coalesce(sum(r.total_labor_cost), 0) as sum_labor,
    coalesce(sum(r.total_cost), 0) as sum_total
  from public.boq b
  left join public.boq_routes r on r.boq_id = b.id
  group by b.id
),
boq_stats as (
  select
    count(*)::bigint as boq_rows,
    count(*) filter (
      where abs(coalesce(total_material_cost, 0) - sum_material) > 0.01
         or abs(coalesce(total_labor_cost, 0) - sum_labor) > 0.01
         or abs(coalesce(total_cost, 0) - sum_total) > 0.01
    )::bigint as boq_mismatch_gt_001_rows
  from boq_rollup
),
boq_status_counts as (
  select jsonb_object_agg(status_key, status_count) as status_counts
  from (
    select coalesce(status, '<null>') as status_key, count(*)::bigint as status_count
    from public.boq
    group by coalesce(status, '<null>')
  ) x
),
profile_counts as (
  select jsonb_object_agg(status_key, status_count) as status_counts
  from (
    select coalesce(status, '<null>') as status_key, count(*)::bigint as status_count
    from public.user_profiles
    group by coalesce(status, '<null>')
  ) x
),
identity_counts as (
  select jsonb_object_agg(provider_key, provider_count) as provider_counts
  from (
    select coalesce(provider, '<null>') as provider_key, count(*)::bigint as provider_count
    from auth.identities
    group by coalesce(provider, '<null>')
  ) x
),
session_aal_counts as (
  select jsonb_object_agg(aal_key, aal_count) as aal_counts
  from (
    select coalesce(aal::text, '<null>') as aal_key, count(*)::bigint as aal_count
    from auth.sessions
    group by coalesce(aal::text, '<null>')
  ) x
),
auth_stats as (
  select
    (select count(*)::bigint from auth.users where deleted_at is null) as nondeleted_auth_users,
    (select count(*)::bigint from public.user_profiles) as profile_rows,
    (select count(*)::bigint from auth.users u left join public.user_profiles p on p.id = u.id where u.deleted_at is null and p.id is null) as auth_users_without_profile,
    (select count(*)::bigint from public.user_profiles p left join auth.users u on u.id = p.id and u.deleted_at is null where u.id is null) as profiles_without_nondeleted_auth_user,
    (select count(*)::bigint from auth.users where deleted_at is null and email_confirmed_at is not null) as email_confirmed_auth_users,
    (select status_counts from profile_counts) as profile_status_counts,
    (select provider_counts from identity_counts) as identity_provider_counts,
    (select count(*)::bigint from auth.mfa_factors) as mfa_factor_rows,
    (select count(*)::bigint from auth.mfa_factors where status::text = 'verified') as verified_mfa_factor_rows,
    (select count(*)::bigint from auth.sessions) as session_rows,
    (select count(distinct user_id)::bigint from auth.sessions) as session_distinct_users,
    (select count(*)::bigint from auth.sessions where not_after is null) as sessions_not_after_null,
    (select count(*)::bigint from auth.sessions where not_after > now()) as sessions_not_after_future,
    (select count(*)::bigint from auth.sessions where not_after <= now()) as sessions_not_after_past_or_now,
    (select count(*)::bigint from auth.sessions where refreshed_at >= (now() at time zone 'utc') - interval '30 days') as sessions_refreshed_within_30d,
    (select aal_counts from session_aal_counts) as session_aal_counts
),
payload as (
  select jsonb_build_object(
    'query_version', 'product-planning-readonly-v4',
    'items', to_jsonb(item_stats),
    'routes', to_jsonb(route_stats),
    'boqs', to_jsonb(boq_stats) || jsonb_build_object('status_counts', boq_status_counts.status_counts),
    'auth', to_jsonb(auth_stats)
  ) as result
  from item_stats, route_stats, boq_stats, boq_status_counts, auth_stats
)
select
  clock_timestamp() as observed_at,
  current_setting('TimeZone') as database_timezone,
  result,
  md5(result::text) as result_md5
from payload;
