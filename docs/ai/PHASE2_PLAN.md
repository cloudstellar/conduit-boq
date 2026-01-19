# Phase 2 Roadmap (FROZEN)

**Last Updated:** 2026-01-20  
**Status:** FROZEN — Ready for implementation

---

## Strategy

**Foundation → Output → Input → Governance**

---

## 🔐 Key Integrity Rules

### Rule A: Versioning
| Rule | Implementation |
|------|----------------|
| One default | `UNIQUE WHERE is_default = true` |
| Default = active | Constraint |
| Switch default = atomic | Transaction |
| Active-only BOQ | Trigger + log |
| Immutable version_id | Trigger + log |
| No duplicate items | `UNIQUE (version_id, item_code)` |

### Rule B: Snapshot
| Principle | Description |
|-----------|-------------|
| No auto-update | Changes don't affect existing BOQs |
| BOQ = Frozen | Independent after creation |
| Traceable | `source_model_id`, `cloned_from_boq_id` |

---

## 📅 Phase 2A: Foundation
⛔ **Infrastructure only — No feature logic**

### Implementation Order
1. Create `price_list_versions` + seed "2568" (active, default)
2. Add `version_id` to `price_list` + backfill + UNIQUE index
3. Add `price_list_version_id` to `boq` + backfill + SET NOT NULL
4. Create `system_event_log` (use `created_at` not `timestamp`)
5. Add triggers (active-only, immutable) with logging
6. UI header: Version + Year + Status
7. PDF footer: Version + Year + Generated at

### Migration Guardrails
- ⚠️ Backfill before SET NOT NULL
- ⚠️ Switch default must be atomic (transaction)
- ⚠️ Log columns NOT NULL: `action`, `table_name`, `created_at`

### DoD (Definition of Done)
- [ ] Single default constraint works
- [ ] Default must be active
- [ ] `UNIQUE (version_id, item_code)` enforced
- [ ] Triggers log rejection to `system_event_log`
- [ ] UI header: Version + Year + Status
- [ ] PDF footer: Version + Year + Generated at

---

## 📈 Phase 2B: Reporting
- Summary per Dept/Sector (Read-only)
- Filters: Year, Dept, Status
- PDF Export

### Copy/Requote Dropdown
```
คัดลอก ▼
├─ คัดลอก BOQ (ราคาเดิม)
└─ Requote เป็นราคาปี...
```

### Requote Rules
- Requote creates new BOQ with `cloned_from_boq_id = source`
- Requote target `version.status = 'active'`
- Item not found → costs = NULL (`missing_price = true`)

---

## 🧠 Phase 2C: Smart Estimation
- `source_model_id UUID NULLABLE` + FK to `models`
- Wizard UI
- Model CRUD
- Store `source_model_id` on generate

---

## 🔐 Phase 2D: Governance (Future)
- BOQ Audit Log
- Model Change History
- Version Comparison

---

## Schema Preview

### NEW: price_list_versions
```sql
CREATE TABLE price_list_versions (
  id UUID PRIMARY KEY,
  year INTEGER NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- draft | active | archived
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_single_default 
  ON price_list_versions(is_default) WHERE is_default = true;
```

### MODIFY: price_list
- Add `version_id UUID NOT NULL`
- Add `UNIQUE (version_id, item_code)`

### MODIFY: boq
- Add `price_list_version_id UUID NOT NULL` (immutable)
- Add `cloned_from_boq_id UUID` (NULLABLE)
- Add `source_model_id UUID` (NULLABLE, Phase 2C)

### NEW: system_event_log
```sql
CREATE TABLE system_event_log (
  id UUID PRIMARY KEY,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  actor_id UUID,
  reason TEXT,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```
