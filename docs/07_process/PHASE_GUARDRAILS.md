# Phase Guardrails
## Conduit BOQ System

> **Status:** DRAFT – CANONICAL SKELETON  
> **Last Updated:** 2026-01-22  
> **Source:** Migrated from `docs/ai/PHASE2_PLAN.md`

---

## Phase 2 Roadmap (FROZEN)

**Strategy:** Foundation → Output → Input → Governance

### Phase 2A: Foundation
⛔ **Infrastructure only — No feature logic**

1. Create `price_list_versions` + seed "2568"
2. Add `version_id` to `price_list` + backfill
3. Add `price_list_version_id` to `boq` + backfill
4. Create `system_event_log`
5. Add triggers (active-only, immutable)
6. UI header: Version + Year + Status

### Phase 2B: Reporting
- Summary per Dept/Sector
- PDF Export
- Copy/Requote dropdown

### Phase 2C: Smart Estimation
- Model-based BOQ generation
- Wizard UI

### Phase 2D: Governance
- Audit Log
- Version Comparison

---

## Key Integrity Rules

### Rule A: Versioning
| Rule | Implementation |
|------|----------------|
| One default | `UNIQUE WHERE is_default = true` |
| Default = active | Constraint |
| Switch default = atomic | Transaction |
| Active-only BOQ | Trigger + log |
| Immutable version_id | Trigger + log |

### Rule B: Snapshot
- No auto-update: Changes don't affect existing BOQs
- BOQ = Frozen after creation

---

## References
- Source: [docs/ai/PHASE2_PLAN.md](../ai/PHASE2_PLAN.md)
