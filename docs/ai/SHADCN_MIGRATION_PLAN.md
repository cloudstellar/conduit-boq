# Implementation Plan: shadcn/ui Full Migration

**Version:** 2.0 (Updated with feedback)  
**Estimated Effort:** 3-5 days  
**Risk Level:** 🟡 Medium  
**Status:** Ready for execution

---

## Confirmed Configuration

| Setting | Value | Reason |
|---------|-------|--------|
| Style Preset | `default` | Professional, clean |
| Base Color | `slate` | Enterprise-grade |
| CSS Variables | `yes` | Theming support |
| Dark Mode | `class` | Toggle later, foundation now |
| Sidebar | `no` | Optional after UAT |

---

## Phase 1: Setup Foundation (Day 1 AM)

### 1.1 Commit Convention

```
chore(ui): shadcn init + primitives
refactor(ui): migrate <component>
refactor(ui): migrate <page>
chore(ui): remove legacy tailwind patterns
fix(logic): ... (separate if logic changes)
```

> [!IMPORTANT]
> **UI Boundary Rule:** No logic changes during migrate. If needed, separate commit.

### 1.2 Initialize shadcn/ui

```bash
npx shadcn@latest init
# Style: default
# Base color: slate
# CSS variables: yes
```

### 1.3 Install Dependencies

```bash
npm i next-themes clsx tailwind-merge
```

### 1.4 Create Utility Files

#### [NEW] `lib/utils.ts`
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 1.5 Setup ThemeProvider (Dark Mode Foundation)

#### [NEW] `components/theme-provider.tsx`
```typescript
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
```

#### [MODIFY] `app/layout.tsx`
```typescript
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
```

### 1.6 Install Core Components

```bash
npx shadcn@latest add button card input label badge table
npx shadcn@latest add dropdown-menu alert dialog select
npx shadcn@latest add command popover tabs avatar separator
```

### 1.7 Lint Rule

- Always use `cn()` for conditional classes
- No raw string className concatenation

---

## Phase 2: Component Migration (Day 1 PM - Day 2)

### Migration Order (Optimized)

| Order | Component | shadcn Components | Risk | Notes |
|-------|-----------|-------------------|------|-------|
| 1 | `TotalsSummary.tsx` | Card | 🟢 | Simple start |
| 2 | `BOQAccessBanner.tsx` | Alert | 🟢 | |
| 3 | `ProjectInfoForm.tsx` | Card, Input, Label | 🟢 | Keep controlled components |
| 4 | `UserBadge.tsx` | Badge, Avatar | 🟢 | |
| 5 | `UserMenu.tsx` | DropdownMenu, Button | 🟡 | Layout-wide impact |
| 6 | `RouteManager.tsx` | Card, Button, Input | 🟡 | |
| 7 | `BOQPageHeader.tsx` | Button, Input | 🟡 | |
| 8 | `FactorFSummary.tsx` | Card, Table | 🟡 | |
| 9 | `ItemSearch.tsx` | Command, Popover | 🟡 | Complex interaction |
| 10 | `LineItemsTable.tsx` | Table | 🟡 | Keep overflow wrapper |
| 11 | `MultiRouteEditor.tsx` | Tabs, Card, Table | 🔴 | Most complex |

### Key Migration Rules

**Forms:** 
- ❌ Do NOT adopt full shadcn Form pattern (FormField/FormItem)
- ✅ Use simple Input/Label with existing controlled state

**Tables:**
- ✅ Keep `overflow-x-auto` wrapper for responsive
- ✅ Keep `min-w-[800px]` for horizontal scroll

**Print Page:**
- ❌ Do NOT apply shadcn styles to `/boq/[id]/print`
- Print must stay lightweight

---

## Phase 3: Page Migration (Day 3)

### Order by Dependency

| Order | Page | Focus Areas |
|-------|------|-------------|
| 1 | `app/login/page.tsx` | Button, Card |
| 2 | `app/profile/page.tsx` | Card, Input, Button |
| 3 | `app/admin/page.tsx` | Table, Badge, DropdownMenu |
| 4 | `app/price-list/page.tsx` | Table (keep pagination) |
| 5 | `app/page.tsx` | Card, Button |
| 6 | `app/boq/page.tsx` | Table, Badge |
| 7 | `app/boq/create/page.tsx` | Form components |
| 8 | `app/boq/[id]/edit/page.tsx` | All components |

### Responsive Preservation

> [!IMPORTANT]
> **Keep all responsive classes intact!**

| Pattern | Action |
|---------|--------|
| `grid grid-cols-1 md:grid-cols-2` | ✅ Keep as-is |
| `hidden sm:block` | ✅ Keep as-is |
| `text-sm md:text-base` | ✅ Keep as-is |
| `p-4 md:p-6` | ✅ Keep as-is |
| `w-full sm:w-auto` | ✅ Keep as-is |

---

## Phase 4: Polish (Day 4)

### 4.1 Clean Up
- Remove unused Tailwind classes
- Ensure consistent spacing

### 4.2 Sidebar (OPTIONAL - After UAT)
```bash
npx shadcn@latest add sidebar
```

### 4.3 Dark Mode Toggle (OPTIONAL - Later)
Add toggle button when ready.

---

## Phase 5: Verification (Day 4-5)

### Automated
- `npm run lint` - No errors
- `npm run build` - Successful

### Manual Checklist

#### Core Functionality
- [ ] Login: Google OAuth works
- [ ] Home: Navigation works, BOQ list displays
- [ ] Admin: User table, role change, approve/reject
- [ ] BOQ List: Status badges, create button
- [ ] BOQ Create: Form inputs, validation, save
- [ ] BOQ Edit: Route manager, item search, line items, Factor F
- [ ] Profile: Display and edit
- [ ] Price List: Table with 518 items, pagination

#### Responsive (3 Breakpoints)
| Breakpoint | Width | Test |
|------------|-------|------|
| Mobile | 375px | Login, Home, BOQ list |
| Tablet | 768px | Admin table, BOQ edit |
| Desktop | 1280px | All pages |

#### Additional Checks
- [ ] **Keyboard nav:** Tab through inputs in create/edit
- [ ] **Sticky header:** Table headers still visible on scroll
- [ ] **Empty state:** No routes, no items → still looks good
- [ ] **Loading state:** Skeleton/spinner shows
- [ ] **Auth redirect:** No hydration errors after ThemeProvider
- [ ] **Print page:** Not affected by shadcn styles

---

## Risk Points

| Risk | Mitigation |
|------|------------|
| Table scroll on mobile | Keep `overflow-x-auto` wrapper |
| Dialog sizing | Add responsive `sm:max-w-[425px]` |
| Command/Popover z-index | Test in BOQ edit context |
| Price list (518 rows) | Keep existing pagination |
| Print CSS | Exclude from shadcn migration |

---

## Rollback Strategy

1. Each phase = separate commit → `git revert` if needed
2. Keep `.backup` files for complex components
3. Test each component before moving to next

---

## Next Steps

1. ✅ Plan approved
2. ⏳ Execute Phase 1: Setup
3. ⏳ Execute Phase 2: Components
4. ⏳ Execute Phase 3: Pages
5. ⏳ Execute Phase 5: Verification

---

## For Future AI Sessions

**Context:** Migrating Conduit BOQ from vanilla Tailwind to shadcn/ui

**Current Status:** Plan finalized, ready for execution

**Key Files:**
- `docs/ai/SHADCN_MIGRATION_PLAN.md` (this file)
- `lib/utils.ts` (to be created)
- `components/theme-provider.tsx` (to be created)
- `components/ui/` (shadcn components)

**Rules:**
1. No logic changes during UI migration
2. Keep responsive classes
3. Separate commits for UI vs logic
4. Test on 3 breakpoints
5. Skip print page
