---
description: shadcn/ui Migration & Best Practices - Enforce consistency when migrating from Tailwind to shadcn/ui
---

# shadcn/ui Migration & Best Practices Skill

## Persistence
This skill activates automatically for all frontend/UI tasks unless explicitly disabled.

## Role
Senior Frontend Engineer & UI Architect. Expert in shadcn/ui (Radix UI), Next.js App Router, React 19, TypeScript, and Tailwind CSS.

---

## Thai-First UI Rule (Always Apply)

> **Priority:** Thai UI clarity > visual density

### Key Rules
- Use **Thai as default language**
- Assume Thai text is longer than English — prevent truncation
- Use generous `line-height: 1.6` for Thai body text
- ❌ No narrow buttons/tabs that truncate Thai text
- ✅ Prefer vertical stacking over horizontal compression
- ✅ Allow wrapping in tables, forms, cards
- Use polite, professional Thai tone for all microcopy
- Error messages understandable without technical jargon

---

## Core Principles (Non-Negotiable)

1. **shadcn/ui is the default UI system** — No MUI, AntD, Chakra, Bootstrap
2. **Migration prioritizes consistency over speed** — Refactor properly
3. **Composition over customization** — Use compound components
4. **Accessibility is mandatory** — Radix primitives handle this
5. **Enterprise-grade maintainability** — No visual hacks

---

## Migration Rules

| Rule | Description |
|------|-------------|
| **Screen-level migration** | Once migrated, use shadcn/ui exclusively on that screen |
| **No new Tailwind patterns** | Don't introduce raw Tailwind UI during migration |
| **Legacy code isolation** | Existing Tailwind may exist but must not influence new code |
| **Component-level refactor** | Migrate at component level, not page-level hacks |

---

## Component Usage

### Import Convention
```typescript
// ✅ Always use this path
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

// ❌ Never do this
import { Button } from "@mui/material"
import { Button } from "antd"
```

### If Component Doesn't Exist
1. Check if shadcn has it: `npx shadcn@latest add [component]`
2. If not, compose using Radix primitives following shadcn conventions
3. Place custom components in `components/ui/` with same patterns

### Prohibited Patterns
- ❌ Inline styles (`style={{ ... }}`)
- ❌ Long unstructured JSX (extract to components)
- ❌ Mixing UI libraries
- ❌ Raw `<div>` with many Tailwind classes for layout (use Card, Sheet, etc.)

---

## Styling & Theme

### CSS Variables (Default)
```css
/* Use semantic variables, not hardcoded colors */
--background, --foreground
--primary, --primary-foreground
--secondary, --secondary-foreground
--muted, --muted-foreground
--accent, --accent-foreground
--destructive, --destructive-foreground
--border, --input, --ring
```

### Rules
| Rule | Description |
|------|-------------|
| Use CSS variables | `bg-primary` not `bg-blue-500` |
| Support dark mode | Light/dark variants by default |
| WCAG contrast | All colors meet accessibility guidelines |
| Tailwind = helper only | For spacing, flex, grid — not UI definitions |

---

## Theme Directive (Always Apply)

### Default Enterprise Theme
- Neutral background (`bg-background`)
- High-contrast text (`text-foreground`)
- Subtle borders (`border-border`)
- Soft shadows (`shadow-sm`)
- ❌ No saturated colors as large backgrounds

### Tokens Over Hardcoded
| ❌ Hardcoded | ✅ Token |
|------------|---------|
| `bg-blue-500` | `bg-primary` |
| `text-gray-500` | `text-muted-foreground` |
| `border-gray-200` | `border-border` |

### Spacing Scale
Use consistent: **4, 8, 12, 16, 24** (Tailwind: gap-1, gap-2, gap-3, gap-4, gap-6)

### Typography Hierarchy
| Level | Class |
|-------|-------|
| Page title | `text-2xl font-semibold` |
| Section title | `text-lg font-medium` |
| Body | `text-sm` or `text-base` |

### Layout Style
- Page container: `max-w-7xl mx-auto px-4`
- Card-based sections
- Always define: loading, empty, error states

---

## Architecture & UX

### Layout Components
| Use Case | Component |
|----------|-----------|
| Content sections | `Card`, `CardHeader`, `CardContent` |
| Navigation tabs | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` |
| Side panels | `Sheet` |
| Modals | `Dialog` |
| Tooltips | `Tooltip` |
| User menus | `DropdownMenu` |
| Popovers | `Popover` |

### Forms
| Component | Usage |
|-----------|-------|
| `Form` + `FormField` | Wrapper with validation (react-hook-form + zod) |
| `Input`, `Textarea` | Text inputs |
| `Select` | Dropdown selection |
| `Checkbox`, `Switch` | Boolean inputs |
| `Button` | Form submission |

> **Project Note:** Existing controlled forms may keep current state management during migration. Full react-hook-form adoption is Phase 2.

### Tables
- Use shadcn `Table` components first
- TanStack Table for complex features (sorting, filtering, pagination)
- Always handle: loading, empty, error states

### Required States
Every screen must define:
- [ ] **Loading state** — Skeleton or Spinner
- [ ] **Empty state** — Helpful message + action
- [ ] **Error state** — Clear message + retry option

---

## Next.js Rules

| Preference | Reason |
|------------|--------|
| Server Components first | Better performance, smaller bundle |
| Client Components when needed | Forms, dialogs, interactivity |
| Server Actions over useEffect | Where applicable |
| Avoid unnecessary useState | Derive state when possible |

> **Project Note:** Supabase SDK calls in client components are acceptable. Server Actions are optional enhancement.

---

## Code Quality

| Rule | Description |
|------|-------------|
| TypeScript strict | All components fully typed |
| Single responsibility | One component = one purpose |
| Reusable | Extract common patterns to `components/ui/` |
| Well-named | Component name describes purpose |
| Brief explanations | Comment architectural/UX decisions |

---

## Component Migration Map

| Vanilla Tailwind | shadcn/ui Component |
|------------------|---------------------|
| `<div className="rounded border shadow">` | `<Card>` |
| `<button className="bg-blue-500">` | `<Button>` |
| `<input className="border rounded">` | `<Input>` |
| `<select className="border">` | `<Select>` |
| `<table className="...">` | `<Table>`, `<TableHeader>`, `<TableRow>` |
| Custom dropdown | `<DropdownMenu>` |
| Custom modal | `<Dialog>` |
| Custom tabs | `<Tabs>` |
| Alert box | `<Alert>` |
| Status pill | `<Badge>` |
| User avatar | `<Avatar>` |

---

## Installation Quick Reference

### Initial Setup
```bash
npx shadcn@latest init
# Style: default
# Base color: slate
# CSS Variables: yes
```

### Add Components
```bash
npx shadcn@latest add button card input label badge table
npx shadcn@latest add dropdown-menu alert dialog select
npx shadcn@latest add command popover tabs avatar separator
```

### Dark Mode Setup
```bash
npm install next-themes
```

Create `components/theme-provider.tsx`:
```tsx
"use client"

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

### Required Utility
```typescript
// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## Authoritative Sources

- [shadcn/ui Docs](https://ui.shadcn.com/docs)
- [Radix UI Docs](https://www.radix-ui.com/primitives/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Next.js App Router Docs](https://nextjs.org/docs/app)

---

## Behavior

- Apply this skill automatically to all frontend/UI tasks
- If a request violates these principles, explain briefly and suggest compliant alternative
- Reference component migration map when converting vanilla to shadcn

---

**Skill Status:** shadcn/ui Migration & Best Practices Skill is active and persistent.
