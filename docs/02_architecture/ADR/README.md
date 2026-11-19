# Architecture decision records — reading index

Inventory checked locally on 2026-11-19. This is an index of existing decisions,
not a new ADR, a replacement decision or authority to operate a system.

## Read existing decisions before proposing changes

Before a material design choice, discover the ADRs currently present in this
directory and read the relevant records, amendments and linked final results.
Identify which accepted constraints the proposal preserves, extends or would
supersede. Do not treat a record only as a formatting template or assume ADR-001
covers every subject. This dated list must not hide later added records.

| Existing canonical record | Subject and when it applies |
|---|---|
| [ADR-001](./ADR-001-supabase-rls-authorization.md) | RLS as the primary authorization layer; read for access/security design, with later permission contracts and security closeouts. |
| [ADR-002](./ADR-002-versioned-master-catalog.md) | Versioned Master Catalog, default pointer and BOQ snapshot boundaries. |
| [ADR-003](./ADR-003-master-catalog-rollout-and-version-numbering.md) | Master Catalog rollout, version numbering, intent and lifecycle amendments. |
| [ADR-004](./ADR-004-phase4-catalog-governance-and-official-publication.md) | Master Catalog governance, administration and official publication. |
| [ADR-005](./ADR-005-versioned-factor-f-reference.md) | Separate versioned Factor F references, saved snapshots and legacy handling. |

Decision status, implementation status and permission to run an operation are
different. Read each record's dated addenda and the relevant current closeout:
[current handoff](../../08_ai/AI_HANDOFF.md#current-resume-checkpoint),
[Roadmap #09](../../plans/product/09-integrated-roadmap-and-it-decision-handoff.md),
[Master Catalog #106](../../plans/master-catalog/106-phase4-master-catalog-exact-remaining-work-handoff.md)
and [#107](../../plans/master-catalog/107-phase4-p49-master-catalog-final-closeout-result.md).
An old summary table or baseline policy list is not proof of current runtime
behavior. A local document review makes no fresh Production observation.

## Preserve identity and history

The legacy [ADR-001 path](../../ai/DECISIONS/ADR-001-supabase-rls-authorization.md)
now points to the canonical record and retains its original body as a frozen
historical snapshot. That body matched canonical ADR-001 at the inventory;
the canonical ADR-001 was not changed. It is the same decision, not a second
decision or a newly allocated number. Maintain architectural decisions only in
this canonical directory; do not synchronize new edits into historical copies.

For a future reviewed architectural decision, check the existing filenames and
references before allocating an unused identifier. Never reuse ADR-001 or another
existing number for a different decision. Preserve accepted rationale; explain
a proposed supersession, record the Owner's decision and link both records.
Use the [engineering decision review](../../07_process/RELEASE_PROCESS.md#engineering-decision-review)
for the decision content and proportionality. A routine implementation choice
can remain in its active plan without creating a new ADR.
