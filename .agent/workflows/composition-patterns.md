---
description: React Composition Patterns - Avoid boolean prop proliferation, build scalable component APIs
---

# React Composition Patterns

Composition patterns for building flexible, maintainable React components. Avoid boolean prop proliferation by using compound components, lifting state, and composing internals.

## When to Apply

Reference these guidelines when:
- Refactoring components with many boolean props
- Building reusable component libraries
- Designing flexible component APIs
- Reviewing component architecture
- Working with compound components or context providers

---

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Component Architecture | HIGH | `architecture-` |
| 2 | State Management | MEDIUM | `state-` |
| 3 | Implementation Patterns | MEDIUM | `patterns-` |
| 4 | React 19 APIs | MEDIUM | `react19-` |

---

## 1. Component Architecture (HIGH)

### `architecture-avoid-boolean-props`
Don't add boolean props to customize behavior; use composition instead.

❌ Bad:
```tsx
<Button isLoading isPrimary isDisabled hasIcon />
```

✅ Good:
```tsx
<Button variant="primary" disabled>
  <Spinner />
  Save
</Button>
```

### `architecture-compound-components`
Structure complex components with shared context.

✅ Good:
```tsx
<Tabs>
  <Tabs.List>
    <Tabs.Tab>One</Tabs.Tab>
    <Tabs.Tab>Two</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panels>
    <Tabs.Panel>Content 1</Tabs.Panel>
    <Tabs.Panel>Content 2</Tabs.Panel>
  </Tabs.Panels>
</Tabs>
```

---

## 2. State Management (MEDIUM)

### `state-decouple-implementation`
Provider is the only place that knows how state is managed.

✅ Good:
```tsx
// Provider handles all state logic
function TabsProvider({ children }) {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <TabsContext.Provider value={{ activeIndex, setActiveIndex }}>
      {children}
    </TabsContext.Provider>
  );
}
```

### `state-context-interface`
Define generic interface with state, actions, meta for dependency injection.

✅ Good:
```tsx
interface TabsContext {
  // State
  activeIndex: number;
  // Actions
  setActiveIndex: (index: number) => void;
  // Meta
  tabCount: number;
}
```

### `state-lift-state`
Move state into provider components for sibling access.

❌ Bad:
```tsx
function Tab({ isActive, onSelect }) { ... }
```

✅ Good:
```tsx
function Tab({ index }) {
  const { activeIndex, setActiveIndex } = useTabs();
  const isActive = activeIndex === index;
  return <button onClick={() => setActiveIndex(index)}>...</button>;
}
```

---

## 3. Implementation Patterns (MEDIUM)

### `patterns-explicit-variants`
Create explicit variant components instead of boolean modes.

❌ Bad:
```tsx
<Modal isDrawer isFullScreen />
```

✅ Good:
```tsx
<Drawer>...</Drawer>
<FullScreenModal>...</FullScreenModal>
```

### `patterns-children-over-render-props`
Use children for composition instead of renderX props.

❌ Bad:
```tsx
<Card
  renderHeader={() => <h2>Title</h2>}
  renderBody={() => <p>Content</p>}
  renderFooter={() => <button>Save</button>}
/>
```

✅ Good:
```tsx
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>
    <button>Save</button>
  </Card.Footer>
</Card>
```

---

## 4. React 19 APIs (MEDIUM)

> **⚠️ React 19+ only.** Skip this section if using React 18 or earlier.

### `react19-no-forwardref`
Don't use `forwardRef`; use `use()` instead of `useContext()`.

❌ Bad (React 18):
```tsx
const Button = forwardRef((props, ref) => (
  <button ref={ref} {...props} />
));
```

✅ Good (React 19):
```tsx
function Button({ ref, ...props }) {
  return <button ref={ref} {...props} />;
}
```

---

## Key Principles Summary

1. **Composition over Configuration** - Let consumers compose behavior rather than configure via props
2. **Single Responsibility** - Each component does one thing well
3. **Explicit Variants** - Create named components for different modes
4. **Context for Shared State** - Use context to share state between compound components
5. **Children over Render Props** - Prefer `children` for composition flexibility
