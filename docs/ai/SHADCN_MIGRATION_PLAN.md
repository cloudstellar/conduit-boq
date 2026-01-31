# Implementation Plan: shadcn/ui + Next.js Best Practices Migration

**Version:** 3.6 (Final - 2026-01-31)  
**Branch:** `feature/shadcn-migration`  
**Estimated Effort:** 5 days  
**Risk Level:** 🟡 Medium  
**Status:** Ready for execution

---

## 🛑 CRITICAL GATES (ห้ามข้าม)

> [!CAUTION]
> **GATE 1:** Phase 1 ต้อง `npm run build` ผ่านก่อน ถึงจะเริ่ม Phase 2 ได้
>
> **GATE 2:** Phase 2/3 ห้ามแตะ `/boq/[id]/print` เด็ดขาด — ใช้ `bash scripts/print-safe.sh` ตรวจก่อน commit

---

## Session Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Dark Mode | ❌ Skip | Not needed, can add later (~30 min) |
| Color Admin UI | ❌ Skip | Edit CSS directly |
| react-hook-form | ⏳ Phase 2 | Keep existing controlled forms |
| TanStack Table | ⏳ Optional | Use shadcn Table first |

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

### 1.1 Path Verification

```bash
ls app/globals.css src/app/globals.css 2>/dev/null
ls tailwind.config.ts tailwind.config.js 2>/dev/null
```

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

### 1.4 Create Utility File

**[NEW] `lib/utils.ts`:**
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

### 1.6 Build Verification

> [!CAUTION]
> **🛑 STOP: ต้อง build ผ่านก่อนไปต่อ!**

```bash
npm run build
```

### 1.7 Checkpoint

```bash
git add .
git commit -m "chore(ui): shadcn init + primitives"
git tag v1.2.1-shadcn-phase1
git push origin feature/shadcn-migration
git push origin --tags
```

---

## Phase 2: Component Migration (Day 2-3)

### 🔍 PRINT DEPENDENCY SCAN (ทำก่อน!)

```bash
grep -nE "^import" app/boq/\[id\]/print/page.tsx
grep -nE "from\s+['\"]@/components" app/boq/\[id\]/print/page.tsx
sed -n '1,120p' app/boq/\[id\]/print/page.tsx  # (Optional)
```

### 🛡️ GATE 2 CHECK (ก่อน commit ทุก batch)

```bash
bash scripts/print-safe.sh
```

### Migration Order

| Order | Component | Risk |
|-------|-----------|------|
| 1-4 | TotalsSummary, BOQAccessBanner, ProjectInfoForm, UserBadge | 🟢 |
| 5-6 | UserMenu, BOQPageHeader | 🟡 |
| 7-8 | RouteManager, FactorFSummary | 🟡 |
| 9-10 | LineItemsTable, ItemSearch | 🟡 |
| 11 | MultiRouteEditor | 🔴 |

### Commit Strategy (Batched)

**Batch 1:** Low-risk (Order 1-4)  
**Batch 2:** Medium-risk (Order 5-10) + `npm run build`  
**Batch 3:** MultiRouteEditor + Tag

---

## Phase 3: Page Migration (Day 4)

| Order | Page | Focus |
|-------|------|-------|
| 1-2 | `/login`, `/profile` | Card, Input, Button |
| 3-4 | `/admin`, `/price-list` | Table, Badge |
| 5-6 | `/` (home), `/boq` | Card, Table |
| 7-8 | `/boq/create`, `/boq/[id]/edit` | All components |

> [!CAUTION]
> **❌ Skip `/boq/[id]/print`** — ห้ามแตะ!

---

## Phase 4: Best Practices (Day 4-5)

| Priority | Rule | Action |
|----------|------|--------|
| HIGH | `bundle-barrel-imports` | Direct imports |
| HIGH | `async-parallel` | `Promise.all()` |
| MEDIUM | `React.cache()` | Dedup fetches |

---

## Phase 5: Verification (Day 5)

### Automated
```bash
npm run lint
npm run build
```

### Manual Checklist
- [ ] Login: Supabase Email Auth works
- [ ] Admin: User table, role change
- [ ] BOQ: Create, Edit, List
- [ ] Print page: NOT affected

### Responsive Test
| Width | Pages |
|-------|-------|
| 375px | Login, Home |
| 768px | Admin, BOQ edit |
| 1280px | All |

### Final Tag
```bash
git tag v1.2.1-shadcn-done
git push origin feature/shadcn-migration
git push origin --tags
```

---

## Rollback Strategy

```bash
# Recovery branch จาก tag
git checkout -b recovery/phase1 v1.2.1-shadcn-phase1

# หรือ revert commit
git revert <commit-hash>

# กลับ main
git checkout main && git pull origin main
```

---

## For Next AI Session

1. Read `.agent/workflows/shadcn-migration.md`
2. Branch: `feature/shadcn-migration`
3. Run `bash scripts/print-safe.sh` before each commit
4. Execute Phase 1 → verify build → Phase 2...

**Key Constraints:**
- Light mode only
- Keep existing controlled forms
- ❌ Skip print page
- Separate commits for UI vs logic
