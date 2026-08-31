# Product Planning Production Read-only Aggregate Evidence

**Status:** DATED READ-ONLY EVIDENCE; AGGREGATE-ONLY; NO LIVE AUTHORITY

**Query version:** `product-planning-readonly-v4`

**Observed:** `2026-08-30 17:01:54.898366+00` (database timezone `UTC`),
equivalent to `2026-08-31 00:01:54.898366+07`

**Production project reference:** `otlssvssvgkohqwuuiir`

**Execution:** Supabase read-only SQL connector; one statement containing only
CTEs and a final `SELECT`; no DDL, DML, function call with side effects, or
transactional mutation

**Exact query:**
[03-production-readonly-aggregate-query.sql](./03-production-readonly-aggregate-query.sql)

**Query SHA-256:**
`7d7bd5d92e421be704d1e9097eef266a98f35e294e6de60d6f90f7eb966a5fe7`

**Canonical result JSON MD5 returned by the query:**
`2316f109ca9697a7920279ace97959d7`

This receipt contains no row identifiers, names, emails, IP addresses, user
agents, tokens, secrets, formula text, project names, or BOQ numbers. It must
not be used as a claim about mutable live state after the observation time;
rerun an approved aggregate preflight when current truth matters.

## 1. Exact aggregate result

```json
{
  "query_version": "product-planning-readonly-v4",
  "items": {
    "item_rows": 2617,
    "zero_quantity_rows": 11,
    "negative_quantity_rows": 0,
    "min_quantity": 0,
    "max_quantity": 69690,
    "component_mismatch_gt_001_rows": 14,
    "component_mismatch_gt_1_rows": 2,
    "max_component_mismatch": 1.47,
    "item_total_any_mismatch_rows": 2,
    "item_total_mismatch_gt_001_rows": 0,
    "max_item_total_mismatch": 0.01,
    "unlinked_item_rows": 5
  },
  "routes": {
    "route_rows": 326,
    "route_mismatch_gt_001_rows": 2,
    "mismatched_routes_with_zero_linked_items": 2,
    "mismatched_zero_item_routes_whose_boq_has_unlinked_items": 2,
    "max_route_mismatch": 1372001
  },
  "boqs": {
    "boq_rows": 263,
    "status_counts": {
      "draft": 263
    },
    "boq_mismatch_gt_001_rows": 0
  },
  "auth": {
    "nondeleted_auth_users": 20,
    "profile_rows": 20,
    "auth_users_without_profile": 0,
    "profiles_without_nondeleted_auth_user": 0,
    "email_confirmed_auth_users": 19,
    "profile_status_counts": {
      "active": 16,
      "pending": 4
    },
    "identity_provider_counts": {
      "email": 20
    },
    "mfa_factor_rows": 0,
    "verified_mfa_factor_rows": 0,
    "session_rows": 73,
    "session_distinct_users": 12,
    "sessions_not_after_null": 73,
    "sessions_not_after_future": 0,
    "sessions_not_after_past_or_now": 0,
    "sessions_refreshed_within_30d": 19,
    "session_aal_counts": {
      "aal1": 73
    }
  }
}
```

## 2. Metric definitions

- A component mismatch means either stored material or labor total differs by
  more than ฿0.01 from `round(quantity × corresponding unit cost, 2)`.
- `max_component_mismatch` is the larger absolute material/labor difference
  per row, then the maximum across rows.
- An item-total mismatch compares stored item total with stored material plus
  stored labor. The two observed differences are nonzero but not above ฿0.01.
- A route mismatch compares each stored route material/labor/total with sums of
  items whose `route_id` points to that route, using a greater-than-฿0.01
  threshold.
- Both mismatched routes have zero linked items, and each route’s BOQ has at
  least one item whose `route_id` is null. The query observes five unlinked
  items overall. This supports a legacy-compatibility hypothesis; it does not
  authorize relinking or recalculation.
- A BOQ mismatch compares stored BOQ material/labor/total with sums of its
  stored route values at the same threshold.
- Auth user count excludes `auth.users.deleted_at is not null`.
- Session count is rows currently present in `auth.sessions`, not a claim that
  every row represents a concurrently usable browser session. `not_after` is
  only one field; project Auth settings and JWT/refresh behavior were not read
  by this SQL.
- “Refreshed within 30 days” compares the UTC `refreshed_at` value to query
  time minus 30 days.
- Provider `email` does not distinguish password from magic-link/OTP. The
  repository’s current UI path supplies the evidence for email/password use.

## 3. Security advisor observation

The Supabase security advisor was read at
`2026-08-30T16:54:38.862Z` (23:54:38 +07) without changing settings. It
reported:

- `WARN`: leaked-password protection disabled, with
  [Supabase remediation guidance](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection);
- `WARN`: callable `SECURITY DEFINER` functions, including the intentional
  pre-auth eligibility function and authenticated business/Admin RPCs; and
- `INFO`: RLS enabled with no policies on `public.app_settings`.

The function warnings are an inventory prompt, not proof that each function is
vulnerable. Each function requires an intent, caller, internal guard,
`search_path`, owner, grant/ACL, rate/abuse, and negative-persona disposition.
No advisor setting or database object was changed during this audit.

## 4. Interpretation boundary

- These aggregates prioritize design and test work only.
- They do not authorize a cleanup, backfill, reprice, relink, status change,
  session revocation, Auth configuration change, or catalog/Factor F action.
- Historical rows are evidence to classify and preserve.
- Before any implementation/release claim, obtain fresh read-only preflight
  evidence under a separately approved plan.
