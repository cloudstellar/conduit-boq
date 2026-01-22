# Tech Stack
## Conduit BOQ System

> **Status:** CANONICAL  
> **Last Updated:** 2026-01-22  
> **Authority:** Definitive source for version numbers (sourced from package.json)

---

## 1. Core Technologies

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

### Production
| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.1.1 | App framework |
| react | 19.2.3 | UI library |
| @supabase/supabase-js | ^2.90.1 | Supabase client |
| @supabase/ssr | ^0.8.0 | Supabase SSR |
| xlsx | ^0.18.5 | Excel processing |

### Development
| Package | Version | Purpose |
|---------|---------|---------|
| tailwindcss | ^4 | CSS framework |
| typescript | ^5 | Type checking |
| eslint | ^9 | Linting |

---

## 3. Infrastructure

| Service | Provider | Purpose |
|---------|----------|---------|
| Frontend Hosting | Vercel | Static + SSR |
| Database | Supabase | PostgreSQL + RLS |
| Authentication | Supabase Auth | Google OAuth |

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
