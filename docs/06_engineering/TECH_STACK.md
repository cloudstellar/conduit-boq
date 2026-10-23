# Tech Stack
## Conduit BOQ System

> **Status:** CANONICAL  
> **Last Aligned:** 2026-10-23 — repository versions and dated release receipts;
> no new service/runtime inspection in this documentation task
> **Authority:** Package declarations from `package.json`; installed resolutions
> are in `package-lock.json`. Service/runtime versions require target inspection.

<!-- RELEASE_ALIGNMENT_20261023 -->
> **Recorded release state — 2026-10-23:** dependency A (`a3114fc`) and
> [stale-Copy B](STALE_COPY_B_RELEASE_CLOSEOUT_20261023.md) (`42e01c5` + Production 031 ledger `20261023063934`)
> are closed. [L1 Production result](LIST_1B_L1_PRODUCTION_RELEASE_RESULT_20261023.md) records exact `b1ce449`,
> Ready/Current and bounded no-write smoke PASS at its observation time.
> B Production stale HTTP remains **NOT RUN**, closed rather than a pending
> test. Migrations **027–031 are immutable/no-replay**. Earlier dated
> pending/candidate/approval wording below preserves its own stage. This local
> documentation alignment makes no fresh Production observation and grants
> no runtime, DB, reset, migration or publication authority.

[Integrated Roadmap #09](../plans/product/09-integrated-roadmap-and-it-decision-handoff.md)
tracks remaining S0/accounting/workflow decisions and IT/SSO readiness. A is
closed; current declarations below describe the committed dependency release,
not a claim about today's latest patched versions. Internal
hosting of all services and the organizational SSO provider/protocol are still
unconfirmed; no hosting, package or Auth change is authorized by this reference.

---

## 1. Core Technologies

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 16.4.2 |
| UI Library | React | 19.2.3 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Database | PostgreSQL | Repository-documented 17.x baseline; live/target version not reverified here |
| Auth | Supabase Auth | Managed service; exact target version not asserted |
| Hosting | Vercel | - |

---

## 2. Key Dependencies

### Production

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.4.2 | App framework |
| react | 19.2.3 | UI library |
| @supabase/supabase-js | ^2.90.1 | Supabase client |
| @supabase/ssr | ^0.8.0 | Supabase SSR |
| exceljs | ^4.4.0 | Production Excel export |

### Development

| Package | Version | Purpose |
|---------|---------|---------|
| tailwindcss | ^4 | CSS framework |
| typescript | ^5 | Type checking |
| eslint | ^9 | Linting |
| eslint-config-next | 16.4.2 | Aligned Next lint configuration |
| xlsx | 0.18.5 | Trusted-input local import/inspection scripts only |

---

### Locked native/transitive security context

The A release retains the explicit PostCSS override at `8.5.23`, locked Sharp
`0.35.5` through Next, and the ExcelJS `uuid` override at `11.1.1`. See the
[A Production receipt](./DEPENDENCY_A_PRODUCTION_RELEASE_RESULT_20261023.md) for
its dated production audit 0 and native checks. L1 changed no package/lockfile;
its CI install graph reported 11 advisories (3 moderate, 8 high), which is not a
fresh `audit:prod` result or proof of new Production dependency findings.

## 3. Infrastructure

These are the recorded deployment providers, not a fresh live inventory or the
approved future target. The application requires a Next.js Node server for SSR,
server actions/API paths and image handling; static-only hosting is insufficient.
Browser and Next.js server clients both use Supabase Auth/Data API. A future
internal target must preserve the database RPC/RLS/grant/trigger contracts or
approve a separate architecture change.

| Service | Provider | Purpose |
|---------|----------|---------|
| Frontend Hosting | Vercel | Static + SSR |
| Database | Supabase | PostgreSQL + RLS |
| Authentication | Supabase Auth | Email/Password (NT Domain Restriction) |

---

The recorded L1 target used configured Node `24.x`; unchanged GitHub Quality
used Node `22.23.3`, with separate local Node `24.2.0` checks. Existing local
Docker evidence used PostgreSQL `17.6` and actual PostgREST `14.5`. The approved
direct Production Data API OpenAPI GET reported `14.5`; Dashboard's separate
`14.1` display remains unexplained. This is recorded API-version evidence, not
executable binary attestation or permission for another version probe.

## 4. Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `NEXT_PUBLIC_APP_ENV` | Optional environment label for Master Catalog utilities |

The inspected application sources do not reference `SUPABASE_SERVICE_ROLE_KEY`.
Privileged local tooling has separate secret configuration; it is not browser
configuration or a reason to add a service-role key to the application. Never
place a service-role key/database password in `NEXT_PUBLIC_*`. Public target
configuration is included in the application build and must match its target.

The repository Quality workflow uses Node.js 22 and runs install, lint, tests
and build. It does not run the existing `audit:prod` script; a passing Quality
run is not an audit PASS. Adding an audit CI step remains a separate scope
decision in #09.

---

## References
- Authority: `package.json`
