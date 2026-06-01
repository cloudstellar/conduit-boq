# ADR-002: Versioned Master Catalog With Singleton Default Pointer

**Status:** Proposed
**Date:** 2026-06-01
**Decision Makers:** Owner, Development Team

## Context

The existing `price_list` table contains one mutable set of standard prices.
BOQs reference price-list items but do not retain an explicit catalog version.
That makes future price revisions risky: historical BOQs can accidentally read
new labels, categories, or prices unless the catalog and BOQ snapshot boundary
is explicit.

Production inspection also found an existing anonymous
`SECURITY DEFINER` RPC exposure. That security issue must be contained before
catalog schema work begins.

## Decision

Adopt versioned master catalogs with a phased rollout:

1. Close the current RPC and privilege exposure first.
2. Add `price_list_versions` and assign every standard-price row a version.
3. Store `boq.price_list_version_id` and snapshot `boq_items.category`.
4. Use `price_list_default_version` as a singleton pointer to the active default
   catalog version.
5. Keep compatibility columns nullable until the application rollout is
   verified, then enforce `NOT NULL`.
6. Prevent historical BOQs from switching catalog versions after hardening.
7. Add admin catalog management, import, clone, and swap flows only in a later
   Phase 4 change request.

## Rationale

### Singleton Pointer

A singleton pointer avoids coordinating a boolean default flag across multiple
rows. Swapping the active default becomes one pointer update and avoids
non-deferrable partial unique-index ordering problems.

### Snapshot Boundary

BOQs retain the selected catalog version. Standard item category values are
copied into BOQ items so historical documents do not change when catalog data is
revised later.

### Phased Hardening

Nullable columns keep the current application compatible during the deployment
window. `NOT NULL` and immutable-version enforcement are applied only after
backfill and application smoke tests pass.

### Authorization

RLS remains the primary authorization layer under
[ADR-001](./ADR-001-supabase-rls-authorization.md). Scoped
`SECURITY DEFINER` RPCs are allowed only when they include internal
authorization checks, a fixed empty `search_path`, fully qualified object names,
and explicit role grants.

## Consequences

### Positive

- Historical BOQs remain stable across catalog revisions.
- New BOQs receive a deterministic active default catalog.
- Catalog reads and writes can be scoped by version.
- Security containment is deployable independently of catalog work.

### Negative

- Rollout requires multiple database migrations and an application deployment.
- Application queries must carry or derive the BOQ catalog version.
- Phase 4 admin tooling requires a separate reviewed change request.

## Rollout Artifacts

- `migrations/009_master_catalog_p0_containment.sql`
- `migrations/010_master_catalog_phase1a_versioning.sql`
- `migrations/010a_master_catalog_phase1a_indexes.sql`
- `migrations/011_master_catalog_phase1b_hardening.sql`
- [Change request](../../plans/master-catalog/04-change-request.md)
- [Verification report](../../plans/master-catalog/05-verification-report.md)

## References

- [Master Catalog proposal](../../plans/master-catalog/01-proposal.md)
- [Master Catalog implementation plan](../../plans/master-catalog/02-implementation.md)
- [Supabase Database Functions](https://supabase.com/docs/guides/database/functions)
- [PostgreSQL Row Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
