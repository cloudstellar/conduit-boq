# AI-Native Documentation
## Conduit BOQ System

**Purpose:** This folder contains documentation specifically designed for AI agents working on this codebase.

---

## 🚀 Quick Start for AI Agents

**Read in this order:**

1. **[AI_CONTEXT.md](./AI_CONTEXT.md)** ← START HERE
   - Workflow rules (Plan → Confirm → Execute)
   - Forbidden actions
   - Critical patterns to follow

2. **[HANDOFF.md](./HANDOFF.md)** ← CURRENT STATE
   - Session handoff
   - What was done, what's next

3. **[PHASE2_PLAN.md](./PHASE2_PLAN.md)** ← FROZEN ROADMAP
   - Detailed Phase 2 implementation plan
   - Integrity rules and schema

4. **[PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)**
   - Business goals and non-goals
   - Target users and roles

5. **[DOMAIN_MODEL.md](./DOMAIN_MODEL.md)**
   - Entity definitions and relationships
   - Business rules

6. **[SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)**
   - Tech stack details
   - Layer responsibilities

7. **[BOQ_CALCULATION_LOGIC.md](./BOQ_CALCULATION_LOGIC.md)**
   - Cost calculation formulas
   - Factor F interpolation

8. **[ROADMAP.md](./ROADMAP.md)**
   - Phase overview

---

## 📋 Session Continuity

**[HANDOFF.md](./HANDOFF.md)** - Latest session state + Phase 2 Roadmap

Use this for:
- End-of-session handoff
- Context recovery after session reset
- Tracking pending tasks

**Current Status:** Phase 1 Complete (v1.2.0), Phase 2 Roadmap FROZEN

---

## 🚀 Phase 2 Quick Reference

**Strategy:** Foundation → Output → Input → Governance

| Phase | Focus |
|-------|-------|
| 2A | shadcn/ui + Price Versioning |
| 2B | Reporting + Copy/Requote |
| 2C | Smart Estimation |
| 2D | Governance |


---

## 📝 Architecture Decisions

**[DECISIONS/](./DECISIONS/)**

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-001](./DECISIONS/ADR-001-supabase-rls-authorization.md) | Supabase RLS as Primary Authorization | Accepted |

---

## 🔗 Related Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| PRD | `docs/PRD.md` | Product requirements |
| Knowledge Base | `docs/KNOWLEDGE_BASE.md` | User guide (Thai) |
| Database Schema | `docs/DATABASE_SCHEMA.md` | Tables and SQL |
| Technical Reference | `docs/TECHNICAL.md` | Developer patterns |

---

## ⚠️ Important Notes

1. **RLS is Source of Truth** - `lib/permissions.ts` is for UI only
2. **Auth Deadlock Pattern** - Always use `setTimeout` in `onAuthStateChange`
3. **Thai UI, English Code** - User-facing text in Thai, code in English
4. **Ask Before Push** - Never git push without explicit permission

---

## 📁 File Structure

```
docs/ai/
├── README.md                    # This file
├── AI_CONTEXT.md               # AI rules and workflow
├── PROJECT_CONTEXT.md          # Business context
├── DOMAIN_MODEL.md             # Entities and rules
├── SYSTEM_ARCHITECTURE.md      # Tech stack and layers
├── BOQ_CALCULATION_LOGIC.md    # Calculation formulas
├── ROADMAP.md                  # Development phases
├── HANDOFF.md                  # Session continuity
└── DECISIONS/
    └── ADR-001-*.md            # Architecture decisions
```

