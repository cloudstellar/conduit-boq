# Vercel Guidelines - Auto-Apply Rules

These rules should be automatically applied when working on React/Next.js code in this project.

## When to Apply

Apply these guidelines automatically when:
- Writing or modifying React components (`*.tsx`, `*.jsx`)
- Creating or updating Next.js pages/routes
- Reviewing UI/UX code
- Implementing data fetching patterns

## Reference Workflows

For detailed rules, see:
- `/react-best-practices` - 57 performance rules for React/Next.js
- `/web-design-guidelines` - 100+ accessibility, performance, and UX rules
- `/composition-patterns` - Scalable component architecture patterns

## Critical Rules (Always Apply)

### Performance
- Use `Promise.all()` for independent async operations
- Import directly, avoid barrel files
- Use `next/dynamic` for heavy components
- Virtualize lists with >50 items

### Accessibility  
- All interactive elements need visible focus states
- Icon buttons require `aria-label`
- Form inputs need associated labels
- Honor `prefers-reduced-motion`

### Forms
- Use correct input `type` and `autocomplete`
- Never block paste events
- Inline error messages near fields

### UX
- URL should reflect UI state (filters, tabs, pagination)
- Destructive actions need confirmation
- Loading states end with `…`

## Anti-Patterns to Flag

- `transition: all` (list properties explicitly)
- `outline-none` without focus replacement
- `<div>`/`<span>` with click handlers (use `<button>`)
- Images without dimensions
- Hardcoded date/number formats (use `Intl.*`)
