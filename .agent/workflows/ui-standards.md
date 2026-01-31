---
description: UI Standards - Enterprise theme, spacing, typography, and layout patterns for all UI tasks
---

# UI Standards

Apply these standards to ALL frontend/UI tasks. This skill is permanent and loads automatically.

---

## Thai-First UI Rule (Always Apply)

> **Priority:** Thai UI clarity > visual density

### Language & Typography
- Use **Thai as default language** unless explicitly stated otherwise
- Assume Thai text is longer than English
- Design layouts to **prevent text truncation**
- Prefer flexible widths and multi-line text over fixed-width labels
- Use clear, formal Thai wording suitable for enterprise/government

### Font & Readability
- Assume Thai-optimized sans-serif (e.g., IBM Plex Sans Thai)
- Use generous `line-height: 1.6` for body text
- Avoid tight vertical spacing that clips Thai diacritics

### Layout & Components
- ❌ No narrow buttons/tabs that truncate Thai text
- ✅ Prefer vertical stacking over horizontal compression
- ✅ Allow wrapping in tables, forms, and cards
- ❌ No icon-only actions without Thai labels or tooltips

### Forms & Tables
- Form labels must be readable in Thai at all breakpoints
- Validation/helper text must support multi-line Thai
- Table columns must be resizable or wrap Thai content

### UX & Microcopy
- Use polite, professional Thai tone
- Avoid slang or ambiguous shorthand
- Button labels clearly describe actions in Thai
- Error messages understandable without technical jargon

### Accessibility
- Thai text readable at 100%–125% zoom
- Contrast and font size for long reading sessions

---

## Theme Directive (Always Apply)

### Color Palette
| Token | Usage |
|-------|-------|
| `bg-background` | Page/section backgrounds |
| `text-foreground` | Primary text (high contrast) |
| `text-muted-foreground` | Secondary text |
| `border-border` | Subtle borders |
| `shadow-sm` | Soft shadows |

### Rules
- ✅ Neutral background, high-contrast text
- ✅ Subtle borders, soft shadows
- ❌ No saturated colors as large backgrounds
- ❌ No hardcoded Tailwind colors (use shadcn tokens)

```tsx
// ✅ Good
<div className="bg-background text-foreground border-border">

// ❌ Bad
<div className="bg-blue-500 text-white border-gray-300">
```

---

## Tokens First

Always prefer shadcn semantic tokens over raw Tailwind:

| ❌ Hardcoded | ✅ Token |
|------------|---------|
| `bg-blue-500` | `bg-primary` |
| `text-gray-500` | `text-muted-foreground` |
| `border-gray-200` | `border-border` |
| `text-red-500` | `text-destructive` |

---

## Spacing Scale

Use consistent spacing: **4, 8, 12, 16, 24** (Tailwind: 1, 2, 3, 4, 6)

| Spacing | Tailwind | Use Case |
|---------|----------|----------|
| 4px | `gap-1`, `p-1` | Tight (icons, badges) |
| 8px | `gap-2`, `p-2` | Compact (list items) |
| 12px | `gap-3`, `p-3` | Default (card padding) |
| 16px | `gap-4`, `p-4` | Comfortable (sections) |
| 24px | `gap-6`, `p-6` | Loose (page sections) |

---

## Typography Hierarchy

| Level | Class | Use |
|-------|-------|-----|
| Page title | `text-2xl font-semibold` | Page heading |
| Section title | `text-lg font-medium` | Card/section headers |
| Body | `text-sm` or `text-base` | Content |
| Caption | `text-xs text-muted-foreground` | Help text, timestamps |

---

## Layout Patterns

### Page Container
```tsx
<div className="max-w-7xl mx-auto px-4 py-6">
  {/* Page content */}
</div>
```

### Card-Based Sections
```tsx
<Card>
  <CardHeader>
    <CardTitle>Section Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Required States

Every data-driven component MUST define:

| State | Implementation |
|-------|----------------|
| **Loading** | Skeleton or Spinner |
| **Empty** | Message + action (e.g., "No items. Create one?") |
| **Error** | Message + retry button |

---

## Component Standards

### Import from ui/
```typescript
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
```

### Layout Components
| Use Case | Component |
|----------|-----------|
| Content sections | `Card` |
| Navigation tabs | `Tabs` |
| Side panels | `Sheet` |
| Modals | `Dialog` |
| User menus | `DropdownMenu` |

### Forms
| Component | Usage |
|-----------|-------|
| `Input` | Text input |
| `Select` | Dropdown |
| `Checkbox`, `Switch` | Boolean |
| `Button` | Actions |

---

## Responsive Design

Keep responsive classes intact:
```tsx
// Grid
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Visibility
className="hidden sm:block"

// Text
className="text-sm md:text-base"

// Spacing
className="p-4 md:p-6"
```

---

## Accessibility

- All interactive elements need visible focus: `focus-visible:ring-2`
- Icon buttons need `aria-label`
- Form inputs need labels
- Use semantic HTML (`<button>` not `<div onClick>`)

---

**Skill Status:** UI Standards is active for all frontend tasks.
