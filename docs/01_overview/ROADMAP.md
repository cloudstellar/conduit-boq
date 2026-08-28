# Roadmap
## Conduit BOQ System

**Last Updated:** 2026-06-29

<!-- MASTER_CATALOG_CURRENT_STATE_20260829 -->
> [!IMPORTANT]
> **Current-state addendum (2026-08-29):** Master Catalog Phase 4 and P-49 are
> complete end-to-end. See [Handoff #106](../plans/master-catalog/106-phase4-master-catalog-exact-remaining-work-handoff.md)
> and [Result #107](../plans/master-catalog/107-phase4-p49-master-catalog-final-closeout-result.md).
> The read-only Production recheck at `2026-08-29 01:38:54 +07` reconfirmed
> 027 then 028 with no 029, `2568.1.0` at `710/710`, reviewed prices, unchanged
> Factor F, the three catalog flags plus migration-028 functions/raw
> `app_settings` ACL, and `0` working drafts at that instant; it made no write.
> The June roadmap and later dated rollout/gate prose below
> are preserved as historical chronology, not current status or replay work.

---

## Historical roadmap position recorded 2026-06-29

```text
Foundation             Master Catalog baseline       Factor F versioning        Master Catalog Phase 4
COMPLETED              COMPLETED 2026-06-21          COMPLETED 2026-06-29       PLANNED / OWNER REVIEW
───────────────────    ─────────────────────────     ───────────────────────    ─────────────────────────
Auth + RLS             P0 security containment       Default 2569.0.0           Admin manual/import
BOQ + Multi-route      Version 2568.0.0              Baseline 2566.0.0          Stable identity/history
710-price catalog      Singleton default pointer     No legacy backfill         Publish + official export
Factor F snapshots     Version-locked BOQs           Snapshot repair only       Audited pointer restore
Admin onboarding       Phase 1B hardening            MC starts at 017+          NT CI catalog UI
```

Product enhancements such as notification, PWA, smart estimation, and wider
approval workflows are a separate future track. They are not prerequisites for
Master Catalog Phase 4 and should not be confused with its phase numbering.

## Foundation — completed

- [x] Supabase Auth and domain restriction
- [x] RLS, RBAC, onboarding, and pending-user administration
- [x] BOQ CRUD and multi-route support
- [x] Current Price List: 710 items
- [x] Factor F/VAT and saved calculation snapshots
- [x] BOQ PDF/Excel output

## Master Catalog baseline — completed

Completed in Production on 2026-06-21:

- [x] P0 anonymous RPC/security containment
- [x] `price_list_versions`
- [x] `price_list_default_version` singleton pointer
- [x] Current `2568.0.0` with 710 rows
- [x] Version-aware BOQ create/edit/duplicate/print/price-list/dashboard flows
- [x] Historical category snapshots
- [x] Immutable BOQ catalog version
- [x] Phase 1B `NOT NULL` hardening
- [x] Local Production-data rehearsal and Production verification

Evidence: [Master Catalog verification report](../plans/master-catalog/05-verification-report.md).

## Factor F versioning — completed

Completed in Production on 2026-06-29:

- [x] Factor F version metadata, row table, singleton pointer, and BOQ FK column
- [x] Baseline `2566.0.0` seeded from `FACTOR F 2566_7.PDF`
- [x] New default `2569.0.0` published from กค 0433.2/ว 481
- [x] Legacy snapshot metadata repaired without repricing or version backfill
- [x] Legacy BOQs remain snapshot-only unless they have exact source-version
      evidence

Evidence:
[Factor F Production Rollout Closeout](../plans/factor-f/10-production-rollout-closeout.md).

## Master Catalog Phase 4 — Historical pre-release plan snapshot

### Completed Local evidence bands

- [x] WP-0 through WP-6 implementation slices and P-11 official-export visual evidence
- [x] WP-6.5 bounded idempotency, guard, P-20, concurrency, recovery, and verifier evidence
- [x] Production hotfix `016` incorporated before Local Phase 4 `017`-`019`

These checks do not mean the complete operator workflow is release-ready.

### Required remaining Local bands

- [x] WP-6.6 closes Capability Audit #29 C-01 through C-17; owner accepted G3 on exact application checkpoint `78e96ab3ed9993707014c4aba1d285b7592b17a1` on 2026-07-14
- [ ] WP-7 permanent BOQ/hotfix `016` and Factor F regression preservation
- [ ] P-18 decision plus WP-7.5 placement, or hide Add/Supplement and retain the guard
- [ ] P-19 retired-row PDF policy when Retire is in release scope
- [ ] WP-8 clean Local rehearsal, intended-admin UAT, performance, and advisors

### Phase 4C: rehearsal and controlled Production rollout

- [ ] Clean Local reset and complete workflow rehearsal
- [ ] Production additive migration with feature flag disabled
- [ ] Compatible application deploy and admin-only smoke
- [ ] Explicit feature-enable approval
- [ ] Explicit named-version publish approval
- [ ] Export/backup/verification/release-note closeout

Plan and approval documents:

- [Phase 4 review guide](../plans/master-catalog/00-phase4-review-guide.md)
- [Phase 4 architecture plan](../plans/master-catalog/08-phase4-architecture-ci-plan.md)
- [Phase 4 Change Request](../plans/master-catalog/09-phase4-change-request.md)
- [Phase 4 capability completeness audit](../plans/master-catalog/29-phase4-owner-dev-completeness-audit.md)
- [Phase 4 execution tracker](../plans/master-catalog/25-phase4-execution-progress-tracker.md)
- [ADR-004](../02_architecture/ADR/ADR-004-phase4-catalog-governance-and-official-publication.md)

## Deferred Phase 4.2

- BOQ Rebase UI
- Additional parser profiles/generic mapping only when justified
- Server pagination after measured threshold
- Removal of legacy compatibility columns after a stable cycle
- Wider unrelated CI migration
- K-formula publication under a separate governance decision

## Future product enhancements

- Approval workflow beyond the current single authorized catalog publisher
- Notifications
- PWA/offline support
- Smart/model-assisted estimation
- Organization analytics and management reporting

Each future capability requires its own scope, security/data review, tests, and
approval; none is implied by approval of Master Catalog Phase 4.
