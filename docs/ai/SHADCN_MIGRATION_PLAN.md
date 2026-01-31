# Implementation Plan: shadcn/ui + Next.js Best Practices Migration

**Version:** 3.0 (Final decisions - 2026-01-31)  
**Estimated Effort:** 5 days  
**Risk Level:** 🟡 Medium  
**Status:** Ready for execution

---

## Session Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Dark Mode | ❌ Skip | Not needed, can add later (~30 min) |
| Color Admin UI | ❌ Skip | Edit CSS directly |
| react-hook-form | ⏳ Phase 2 | Keep existing controlled forms |
| TanStack Table | ⏳ Optional | Use shadcn Table first |
| Best Practices | ✅ Combined | Do with shadcn migration |

---

## Confirmed Configuration

| Setting | Value | Reason |
|---------|-------|--------|
| Style Preset | `default` | Professional, clean |
| Base Color | `slate` | Enterprise-grade |
| CSS Variables | `yes` | Easy theming |
| Dark Mode | `none` | Light only (no next-themes) |

---

## Phase 1: Setup Foundation (Day 1)

### 1.1 Commit Convention

```
chore(ui): shadcn init + primitives
refactor(ui): migrate <component>
refactor(ui): migrate <page>
fix(logic): ... (separate if logic changes)
```

> [!IMPORTANT]
> **UI Boundary Rule:** No logic changes during migrate. Separate commit if needed.

### 1.2 Initialize shadcn/ui

```bash
npx shadcn@latest init
# Style: default
# Base color: slate
# CSS variables: yes
```

### 1.3 Install Dependencies

```bash
npm i clsx tailwind-merge
```

> **Note:** Skip `next-themes` — light mode only.

### 1.4 Create Utility File

#### [NEW] `lib/utils.ts`
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 1.5 Install Core Components

```bash
npx shadcn@latest add button card input label badge table
npx shadcn@latest add dropdown-menu alert dialog select
npx shadcn@latest add command popover tabs avatar separator
```

---

## Phase 2: Component Migration (Day 2-3)

### Migration Order

| Order | Component | shadcn → | Risk |
|-------|-----------|----------|------|
| 1 | `TotalsSummary.tsx` | Card | 🟢 |
| 2 | `BOQAccessBanner.tsx` | Alert | 🟢 |
| 3 | `ProjectInfoForm.tsx` | Card, Input, Label | 🟢 |
| 4 | `UserBadge.tsx` | Badge, Avatar | 🟢 |
| 5 | `UserMenu.tsx` | DropdownMenu, Button | 🟡 |
| 6 | `RouteManager.tsx` | Card, Button, Input | 🟡 |
| 7 | `BOQPageHeader.tsx` | Button, Input | 🟡 |
| 8 | `FactorFSummary.tsx` | Card, Table | 🟡 |
| 9 | `ItemSearch.tsx` | Command, Popover | 🟡 |
| 10 | `LineItemsTable.tsx` | Table | 🟡 |
| 11 | `MultiRouteEditor.tsx` | Tabs, Card, Table | 🔴 |

### Key Rules

- ❌ Do NOT adopt full shadcn Form pattern (keep controlled state)
- ✅ Keep `overflow-x-auto` wrapper for responsive tables
- ✅ Keep `min-w-[800px]` for horizontal scroll
- ❌ Do NOT apply shadcn to `/boq/[id]/print`

---

## Phase 3: Page Migration (Day 4)

| Order | Page | Focus |
|-------|------|-------|
| 1 | `/login` | Button, Card |
| 2 | `/profile` | Card, Input, Button |
| 3 | `/admin` | Table, Badge, DropdownMenu |
| 4 | `/price-list` | Table (keep pagination) |
| 5 | `/` (home) | Card, Button |
| 6 | `/boq` | Table, Badge |
| 7 | `/boq/create` | Form components |
| 8 | `/boq/[id]/edit` | All components |

### Responsive Preservation

> [!IMPORTANT]
> Keep all responsive classes intact!

| Pattern | Action |
|---------|--------|
| `grid grid-cols-1 md:grid-cols-2` | ✅ Keep |
| `hidden sm:block` | ✅ Keep |
| `text-sm md:text-base` | ✅ Keep |

---

## Phase 4: Best Practices Refactor (Day 4-5)

### HIGH Priority (from `/react-best-practices`)

| Rule | Action |
|------|--------|
| `bundle-barrel-imports` | Direct imports: `import { X } from "@/components/ui/x"` |
| `async-parallel` | Use `Promise.all()` for independent fetches |

### MEDIUM Priority

| Rule | Action |
|------|--------|
| `server-cache-react` | Add `React.cache()` for dedup |
| `server-serialization` | Minimize data to client |

---

## Phase 5: Verification (Day 5)

### Automated
```bash
npm run lint
npm run build
```

### Manual Checklist

- [ ] Login: Google OAuth works
- [ ] Home: Navigation, BOQ list
- [ ] Admin: User table, role change
- [ ] BOQ: Create, Edit, List
- [ ] Price List: Table, pagination
- [ ] Print page: NOT affected

### Responsive (3 Breakpoints)
| Width | Test |
|-------|------|
| 375px | Login, Home, BOQ list |
| 768px | Admin, BOQ edit |
| 1280px | All pages |

---

## Rollback Strategy

- Each phase = separate commit
- `git revert` if issues
- Test before next phase

---

## Related Files

| File | Purpose |
|------|---------|
| `.agent/workflows/shadcn-migration.md` | Skill (auto-loads) |
| `.agent/workflows/react-best-practices.md` | 57 performance rules |
| `lib/utils.ts` | `cn()` utility (to create) |
| `components/ui/` | shadcn components (to create) |

---

## For Next AI Session

1. Read `.agent/workflows/shadcn-migration.md`
2. Execute Phase 1: `npx shadcn@latest init`
3. Follow migration order above

**Key Constraints:**
- Light mode only
- Keep existing controlled forms
- Skip print page
- Separate commits for UI vs logic
