# AI Context — Mandatory Agent Rules

> **Status:** CANONICAL  
> **Aligned:** 2026-10-12

Read [AI Handoff](./AI_HANDOFF.md) first. For Master Catalog current-state and
no-replay decisions, [Handoff
#106](../plans/master-catalog/106-phase4-master-catalog-exact-remaining-work-handoff.md)
and [Result
#107](../plans/master-catalog/107-phase4-p49-master-catalog-final-closeout-result.md)
override dated status prose in older plan records.

## Authority and safety

Without explicit current permission, do not commit/push/merge/rebase, deploy, mutate
Production, apply a migration, change runtime flags, publish/restore a catalog,
add/remove packages, or delete files. An approval recorded in a historical
result proves what happened then; it does not authorize another run. A one-shot
authorization is consumed by its recorded operation and cannot be reused.

For the completed Master Catalog phase:

- migrations 027 and 028 are immutable, applied-once, no-replay artifacts;
- the completed Master Catalog repository/document convergence did not require
  migration 029; 029 was later applied only for DUP-1 as described below;
- P-13, P-14, P-14C, P-15 and R-01 through R-05 are complete and no-replay;
- existing BOQs and Factor F must not be changed by convergence work; and
- the accepted expanded-persona residual must never be relabelled PASS.

For the completed Atomic BOQ Duplicate release:

- migration 029 is a new product migration after 028, applied exactly once as
  `20260831004110/atomic_boq_duplicate`; it was not a Master Catalog
  convergence migration;
- migrations 027, 028, and 029 are immutable/no-replay;
- normal Copy preserves the source Catalog, items, prices, Factor provenance,
  and cost basis; selected-Factor Copy is a separate eligible-legacy flow;
- current Catalog/default prices require Create New; never silently requote,
  reprice, repair, rebase, or backfill a copied/source BOQ; and
- the authoritative execution receipt is [DUP-1 Production Release
  Result](../plans/product/04-atomic-boq-duplicate-production-release-result.md).

For the completed BOQ Save NULL authorization correction:

- migration 030 was applied exactly once as
  `20261012100608/boq_save_null_authorization_guard` and changes only the final
  authorization denial from `IF NOT v_is_authorized` to
  `IF v_is_authorized IS NOT TRUE`;
- migrations 027, 028, 029 and 030 are immutable/no-replay;
- the authoritative receipt is [BOQ Save Guard Production Result
  #04](../plans/security/04-boq-save-null-authorization-production-release-result.md);
  and
- that authority is consumed and grants no Quantity, broader S0, deployment,
  database, account, Catalog, Factor, or BOQ-data operation.

For the later repository-only closeout, use [Post-DUP-1 Repository Custody
Result](../plans/product/05-post-dup1-repository-custody-result.md). It records
docs PR #10, the dated Production deployment observation, and the separately
approved deletion of exactly the two atomic branches plus
`codex/main-convergence`. Result #04's earlier `branchDeleted: false` remains
frozen chronology. The cleanup permission is consumed and grants no authority
for another branch/worktree or archive operation.

Documentation PR #11 later published that custody record and current handoff
cross-references as `main` commit
`a3deb9cc0c2a7930dd3036196afedb04550bfb25`. Treat it as a dated repository
checkpoint, not a new application-release identity or perpetual live Git/Vercel
claim. See [AI Handoff — Later handoff-publication
checkpoint](./AI_HANDOFF.md#later-handoff-publication-checkpoint).

## Critical implementation patterns

### Auth deadlock prevention

Never call async Supabase work directly inside `onAuthStateChange`; defer it:

```typescript
supabase.auth.onAuthStateChange((event, session) => {
  setTimeout(() => { handleSession(session) }, 0)
})
```

### Authorization is cross-layer

The Owner-approved 2026-09-08 metadata review found a NULL scope-authorization
defect in the deployed Save RPC. The narrow forward correction was later
committed as `cb2bb60`, applied to Production once as migration 030, and closed
in repository commit `7c09ab8`. Use the [Save guard plan and local
result](../plans/security/02-boq-save-null-authorization-guard-plan-and-result.md),
[executed runbook](../plans/security/03-boq-save-null-authorization-production-runbook.md),
and [Production Result #04](../plans/security/04-boq-save-null-authorization-production-release-result.md)
for the bounded evidence and residuals. Do not infer that this one guard closes
the wider S0/Auth/Security lane.

UI permission helpers are not security boundaries. Align product rules,
middleware/routes, server actions, grants, RLS, protected columns, RPC bodies
and ACLs, service-role paths, and real authenticated tests. Database controls
remain authoritative for direct Data API/RPC access.

For DUP-1, the typed client and visible Copy actions are UX contracts only.
`public.duplicate_boq_atomic` must re-check `auth.uid()`, active allowed role,
source scope, mode/Factor eligibility, graph integrity, expected source token,
and request-key reuse inside the database. Never reproduce that full predicate
client-side and treat it as authorization.

### Numeric input must fail closed

Never remove unsupported operators or letters and then commit the remaining
digits as though they were the user's intended quantity. The previous
`QuantityEditor` could turn `5*2` or `5x2` into `52`. The Owner approved local
draft/confirm/cancel and numeric-only safety work on 2026-09-08; see the
[current local checkpoint](./AI_HANDOFF.md#local-quantity-safety-work--2026-09-08)
and [R0A release candidate plan](../plans/product/06-r0a-quantity-input-safety-release-plan.md)
for the exact scope and release boundary. After the local trial, the Owner
requested real-time calculation during typing: valid numeric drafts update
the displayed quantities and totals immediately; rejected syntax retains the
latest valid preview, and Cancel restores the starting quantity and totals.
Save must still reject invalid drafts. New input is limited to 2 decimal places without
silent rounding; existing loaded data is not backfilled. Save must match one
BOQ/revision/total/reference-version calculation, rather than merely accepting
a Factor bracket that also happened to fit an earlier total. Local approval
does not authorize a formula parser, new persisted quantity fields, schema/RPC
change or migration. The 2026-09-08 local-work approval did not authorize a
commit or deployment; a later separate Q-A phase 1 authority froze the reviewed
candidate as runtime/tests commit `b18e69a` plus docs commit `a467d38` and is
now consumed.

The Owner later explicitly chose to restore the previous route-total behavior:
loading synchronizes only the selected route, selecting a route synchronizes
that route, and quantity edits update their own route. Preserve summaries of
other unopened routes; do not normalize all loaded summaries as an input-safety
side effect. This preserves an existing behavior, not an accounting-parity fix.
For evidence limits and the pre-existing rounding risk, see the local behavior
review in the handoff. A passing mock Save or test count is not proof of real
database persistence or Print/PDF/Excel parity.

The later isolated persistence checkpoint used only new, explicitly identified
test BOQs in an already-running loopback database. Actual helper/RPC/reload
checks passed there, but that database has a pre-P49 Save RPC and older Catalog
state. Do not describe it as current Production-equivalent acceptance or replay
027/028/029/030 to make it equivalent. See the handoff's
[isolated local checkpoint](./AI_HANDOFF.md#isolated-local-persistence-checkpoint--2026-09-08)
for exact fixture IDs, observed results, and remaining acceptance gates. The
later Owner-approved Chrome check verified real Excel downloads and rendered
PDFs for the two-route and interpolated-Factor local fixtures. Do not extend
that result to all BOQs, native Excel rendering, or the current Production
schema; those limits remain recorded in the handoff.

## Source-of-truth map

| Topic | Canonical location |
|---|---|
| Current repository handoff | [`08_ai/AI_HANDOFF.md`](./AI_HANDOFF.md) |
| Host-local canonical checkout and archive custody | [AI Handoff — Host-local workspace handoff](./AI_HANDOFF.md#host-local-workspace-handoff--2026-08-29) |
| Master Catalog final state | [Handoff #106](../plans/master-catalog/106-phase4-master-catalog-exact-remaining-work-handoff.md) and [Result #107](../plans/master-catalog/107-phase4-p49-master-catalog-final-closeout-result.md) |
| Atomic BOQ Duplicate Production result | [`plans/product/04-atomic-boq-duplicate-production-release-result.md`](../plans/product/04-atomic-boq-duplicate-production-release-result.md) |
| Post-DUP-1 repository custody | [`plans/product/05-post-dup1-repository-custody-result.md`](../plans/product/05-post-dup1-repository-custody-result.md) |
| BOQ Save NULL guard Production result | [`plans/security/04-boq-save-null-authorization-production-release-result.md`](../plans/security/04-boq-save-null-authorization-production-release-result.md) |
| Current work and immediate Owner decisions | [AI Handoff — Current work register](./AI_HANDOFF.md#current-work-register--2026-10-12) |
| Product evolution decisions | [`plans/product/01-conduit-boq-product-evolution-decision-plan.md`](../plans/product/01-conduit-boq-product-evolution-decision-plan.md) |
| LIST-1 proposed design | [`plans/product/02-boq-list-scaling-decision-plan.md`](../plans/product/02-boq-list-scaling-decision-plan.md) |
| Quantity Input Safety local candidate | [`plans/product/06-r0a-quantity-input-safety-release-plan.md`](../plans/product/06-r0a-quantity-input-safety-release-plan.md) |
| Database schema | [`04_data/DATABASE_SCHEMA.md`](../04_data/DATABASE_SCHEMA.md) |
| Production migration ledger | [`04_data/MIGRATIONS.md`](../04_data/MIGRATIONS.md) |
| Current security model | [`04_data/SECURITY_MODEL.md`](../04_data/SECURITY_MODEL.md) |
| Historical integrity guidance | [`04_data/DATA_INTEGRITY.md`](../04_data/DATA_INTEGRITY.md) (dated gaps are historical; use #106/#107 for completion) |
| Domain entities | [`03_domain/DOMAIN_MODEL.md`](../03_domain/DOMAIN_MODEL.md) (dated reference baseline; current schema/access docs override) |
| Calculation rules | [`05_calculation/CALCULATION_RULES.md`](../05_calculation/CALCULATION_RULES.md) |
| Engineering patterns | [`06_engineering/`](../06_engineering/) |

When documentation and mutable Production state might differ, do not guess.
Use the latest durable result for historical truth and obtain separately
authorized fresh read-only evidence for a live claim.

The canonical checkout/archive paths in AI Handoff are observations about this
host, not portable application or Production state. Start normal work only in
the canonical checkout. Do not inspect, copy, clean, upload, or delete the
archive or its protected contents without fresh explicit approval.

For this repository convergence, Production was reconfirmed read-only at
`2026-08-29 01:38:54 +07` against the closeout state summarized in
[AI Handoff](./AI_HANDOFF.md). The check made no Production mutation and does
not authorize a later write, migration, deployment, or replay.

That dated convergence observation ended at migration 028. DUP-1 was later
separately authorized, applied, deployed, and closed on 2026-08-31. Its latest
independent read-only postflight at `2026-08-31 00:55:26 UTC` reconfirmed 029,
zero private request-ledger rows, `263/326/2617` BOQ/route/item counts, unchanged
Catalog/Factor hashes and pointers, and unchanged BOQ policy fingerprints. It
also grants no future write, migration, deployment, or replay authority.

The later repository-custody observation recorded docs PR #10 merge
`07dd75558b513037a1d38b576ffe03be356623c2`, its Ready/Current Production
deployment at that instant, and absence of the three explicitly deleted branch
refs. Those Git/Vercel facts are dated evidence, not perpetual current state.
Always inspect the live checkout/upstream and deployment when present identity
matters; do not replace the frozen DUP-1 application merge
`0e76ed39e68746c9bd6003da69a03f096ae482a3` with a docs-only merge.

PR #11 later published the custody documentation as
`a3deb9cc0c2a7930dd3036196afedb04550bfb25`. A local read-only check on
2026-09-05 observed clean `main` equal to the local `origin/main` tracking ref
with only local branch `main`. Recheck before acting; this observation grants no
commit, push, deployment, database, Production, branch-deletion, or archive
authority.

That clean observation predates the **2026-09-05 handoff checkpoint**. That
documentation-only alignment covered exactly eight files listed in [AI
Handoff — Handoff-alignment
changeset](./AI_HANDOFF.md#handoff-alignment-changeset--2026-09-05). Verify
live whether the changeset is committed and whether any diff remains; preserve
uncommitted handoff work unless the Owner directs otherwise. This record grants
no later commit, push, PR, merge, deployment, database, or Production
authority.

The current recommended sequence is: Q-A phase 1 local freeze (complete and
consumed) -> Q-A phase 2 direct branch push and Preview under the Owner-selected
Solo path, with no PR or separate CI gate -> persistence-residual decision ->
separate Q-B reviewed `main` integration and Production deployment ->
decide/implement LIST-1B -> address wider R0/D0 before R1/R2 Quantity
Expression. The candidate is locally committed but remains unpushed and
unreleased at its recorded checkpoint. Each external operation still requires
its applicable current approval.
`S0` authentication/security remains a separate parallel lane. No plan text
itself grants implementation or external-operation authority.

## Completion check

- Run checks proportionate to the change and report what actually ran.
- Do not claim an unrun suite or live verification as PASS.
- Preserve historical records; add a supersession pointer instead of rewriting
  their chronology.
- Update the canonical handoff when the durable current state genuinely changes.
