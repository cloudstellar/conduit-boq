# Tech Stack
## Conduit BOQ System — Canonical Reference

**Last Updated:** 2026-01-22  
**Status:** Canonical  
**Authority:** Definitive source for version numbers (sourced from package.json)

---

## 1. Core Technologies

> **Source:** `package.json` (authoritative), [README.md](file:///Users/cloud/Cloudstellar/conduit-boq/README.md)

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 16.1.1 |
| UI Library | React | 19.2.3 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Database | PostgreSQL | 15.x (via Supabase) |
| Auth | Supabase Auth | latest |
| Hosting | Vercel | - |

---

## 2. Key Dependencies

> **Source:** `package.json`

### Production Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.1.1 | App framework |
| react | 19.2.3 | UI library |
| react-dom | 19.2.3 | React DOM |
| @supabase/supabase-js | ^2.90.1 | Supabase client |
| @supabase/ssr | ^0.8.0 | Supabase SSR |
| xlsx | ^0.18.5 | Excel processing |
| dotenv | ^17.2.3 | Environment vars |

### Dev Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| tailwindcss | ^4 | CSS framework |
| typescript | ^5 | Type checking |
| eslint | ^9 | Linting |
| eslint-config-next | 16.1.1 | Next.js ESLint |

---

## 3. Infrastructure

| Service | Provider | Purpose |
|---------|----------|---------|
| Frontend Hosting | Vercel | Static + SSR |
| Database | Supabase | PostgreSQL + RLS |
| Authentication | Supabase Auth | Google OAuth |
| CDN | Vercel Edge | Static assets |

---

## 4. Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin operations (optional) |

---

## References

- Authority: `package.json`
- Original: [README.md](file:///Users/cloud/Cloudstellar/conduit-boq/README.md)
- Original: [docs/ai/HANDOFF.md](file:///Users/cloud/Cloudstellar/conduit-boq/docs/legacy/ai/HANDOFF.md)
