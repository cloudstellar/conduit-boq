# AI Context
## Mandatory Reading for AI Agents

**Last Updated:** 2026-01-19  
**Version:** 1.0  

---

## 🎯 Purpose

This document defines rules, workflows, and constraints for AI agents working on the Conduit BOQ project. Treat this as your onboarding guide.

---

## 📚 Mandatory Reading Order

Before making ANY changes, read these documents in order:

1. **PROJECT_CONTEXT.md** - Business goals, users, domain terms
2. **DOMAIN_MODEL.md** - Entities, relationships, business rules
3. **SYSTEM_ARCHITECTURE.md** - Tech stack, layers, data flow
4. **BOQ_CALCULATION_LOGIC.md** - How costs are calculated
5. **DATABASE_SCHEMA.md** - Tables, columns, constraints
6. **ROADMAP.md** - What's in scope per phase

---

## 🔄 Workflow Rules

### Plan → Confirm → Execute

**ALWAYS follow this sequence:**

1. **Plan**: Analyze the request, identify affected files, propose changes
2. **Confirm**: Present plan to user, wait for approval
3. **Execute**: Make changes only after confirmation

### Before Writing Code

- [ ] Read relevant existing code
- [ ] Check for existing patterns in codebase
- [ ] Verify database schema matches your assumptions
- [ ] Identify all downstream changes needed

### After Writing Code

- [ ] Verify no TypeScript errors
- [ ] Check that imports are correct
- [ ] Ensure changes are consistent with existing patterns
- [ ] Update tests if applicable

---

## 🚫 Forbidden Actions

### Never Do Without Explicit Permission:

1. **Git Operations**
   - `git push`
   - `git merge`
   - `git rebase`
   - Creating/deleting branches

2. **Deployment**
   - Deploying to production
   - Changing environment variables
   - Modifying CI/CD pipelines

3. **Database**
   - Running migrations on production
   - Deleting data
   - Changing RLS policies without review

4. **Dependencies**
   - Adding new npm packages
   - Upgrading major versions
   - Removing packages

5. **File Operations**
   - Deleting files without confirmation
   - Overwriting existing documentation
   - Creating files outside project scope

---

## ⚠️ Critical Patterns

### Supabase Auth Deadlock

**NEVER make async Supabase calls inside `onAuthStateChange` callback directly.**

```typescript
// ❌ WRONG - Will cause deadlock
supabase.auth.onAuthStateChange(async (event, session) => {
  await supabase.from('user_profiles').select() // HANGS!
})

// ✅ CORRECT - Use setTimeout
supabase.auth.onAuthStateChange((event, session) => {
  setTimeout(() => {
    handleSession(session) // Async operations here
  }, 0)
})
```

### RLS is Source of Truth

- Client-side `can()` function is for **UI only**
- **RLS policies** enforce actual security
- Always verify RLS allows the operation before assuming it works

### Separation of Duties

- BOQ creator **cannot** approve their own BOQ
- Always check `created_by !== current_user.id` for approvals

---

## 📋 Source of Truth Mapping

| Topic | Source Document |
|-------|-----------------|
| Business requirements | `docs/PRD.md` |
| Domain entities & rules | `docs/ai/DOMAIN_MODEL.md` |
| Database schema | `docs/DATABASE_SCHEMA.md` |
| Calculation logic | `docs/ai/BOQ_CALCULATION_LOGIC.md` |
| User permissions | `lib/permissions.ts` |
| RLS policies | `migrations/005_*.sql`, `migrations/006_*.sql` |
| Tech stack | `docs/ai/SYSTEM_ARCHITECTURE.md` |
| Roadmap | `docs/ai/ROADMAP.md` |

---

## 🔚 End-of-Session Protocol

Before ending a session:

1. **Summarize** what was done
2. **List** any pending tasks
3. **Document** any decisions made
4. **Update** HANDOFF.md if needed
5. **Commit** changes with descriptive message

---

## 💬 Communication Style

- Be direct and concise
- Use Thai for user-facing content
- Use English for code and technical docs
- Always explain "why" not just "what"
- Admit mistakes immediately

---

## 🧠 Context Retention

If you lose context:

1. Read `docs/ai/HANDOFF.md` for latest state
2. Check git log for recent changes
3. Ask user for clarification if needed

---

## ✅ Quality Checklist

Before considering any task complete:

- [ ] Code compiles without errors
- [ ] Changes match existing code style
- [ ] No hardcoded values that should be configurable
- [ ] Error handling is present
- [ ] User-facing text is in Thai
- [ ] Documentation updated if behavior changed

