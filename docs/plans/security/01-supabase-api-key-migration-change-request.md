# Change Request: Supabase Publishable and Secret API Key Migration

**Status:** Proposed separate maintenance change — not a Phase 4 blocker

**Prepared:** 2026-06-22

**Scope:** Replace legacy Supabase `anon` and `service_role` key usage with the
current publishable/secret key model through a staged, reversible rollout

## 1. Why this is a separate change

The repository currently uses the legacy environment names
`NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`. Current
Supabase guidance supports the newer publishable and secret key model and
states that legacy `anon`/`service_role` keys are being deprecated through the
end of 2026.

This migration is important security maintenance, but it does not change
Master Catalog data, schema, publication semantics, or UI. Combining it with
Phase 4 would enlarge rollback scope and make failures harder to diagnose.

Recommendation: track and rehearse it now, execute it in a separate approved
maintenance window, and complete it before provider retirement. It may run
before or after Phase 4 as long as it is not bundled into the same Production
change.

## 2. Verified repository inventory

Read-only source inspection on 2026-06-22 found:

| Current key/env | Representative usage | Intended replacement |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `lib/supabase.ts`, `lib/supabase/client.ts`, `lib/supabase/server.ts`, middleware, smoke/legacy scripts, engineering docs | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| `SUPABASE_SERVICE_ROLE_KEY` | `app/api/admin/users/[id]/route.ts` | `SUPABASE_SECRET_KEY` |

The full implementation inventory must use repository search and deployment
environment review. Source search alone cannot find keys configured only in
Vercel, shell profiles, CI secrets, Supabase settings, or operator machines.

## 3. Security contract

1. A publishable key is safe to include in browser bundles and is still
   constrained by authentication, grants, and RLS.
2. A secret key is server/operations only and bypasses RLS; it must never use a
   `NEXT_PUBLIC_` name or enter client code, browser logs, screenshots, or
   support messages.
3. A secret key is not a user JWT and must not be sent in an `Authorization:
   Bearer` header. Use the supported Supabase client/API key mechanism.
4. Secret-key operations must still authenticate the requesting user and
   authorize an active admin before creating the privileged client.
5. Key migration does not replace RLS or least-privilege grants.
6. Never print actual key values in logs, migration evidence, shell history, or
   this document.
7. Local, Preview, and Production use environment-specific keys for their own
   project/stack; never share a Production secret with Local.

## 4. Proposed environment contract

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
```

During a short compatibility window, code may accept old names only as an
explicit fallback while each environment is migrated. The fallback must emit a
safe development/operations warning without printing a key and must have a
scheduled removal task.

Do not create multiple ambiguous names such as `ANON_OR_PUBLISHABLE_KEY`. The
final contract should say what privilege class the value has.

## 5. Affected surfaces to inventory

- browser Supabase singleton and hooks/pages;
- cookie-aware server client;
- middleware session refresh;
- server-only Admin Auth client;
- Local smoke/seed scripts;
- import/migration utility scripts, including legacy ones still used;
- `.env.example` or equivalent configuration template;
- Vercel Production/Preview/Development environment variables;
- local `.env.local` and Supabase CLI status/bootstrap flow;
- CI/GitHub secrets and deployment automation;
- architecture/engineering/runbook documentation;
- browser bundle, network requests, server logs, and error-reporting tools.

Classify old scripts as `migrate`, `delete/deprecate`, or `document as unused`.
Do not preserve a risky script merely because it contains the old variable
name.

## 6. Implementation plan

### Gate K0 — Inventory and design

1. Record every code/config/deployment consumer without recording values.
2. Confirm which hosted Supabase project each environment points to.
3. Generate/enable publishable and secret keys in the Supabase dashboard as
   documented by Supabase.
4. Verify key restrictions and current RLS/grant posture.
5. Approve this Change Request and exact maintenance sequence.

Stop when any environment/project mapping is ambiguous.

### Gate K1 — Local compatibility implementation

1. Update client/server helpers to prefer the new names.
2. Update the server-only Admin Auth route to use `SUPABASE_SECRET_KEY`.
3. Preserve requester authentication/active-admin authorization before the
   privileged client is created or used.
4. Update scripts and documentation intentionally.
5. Add environment validation with safe missing-variable messages.
6. Add a temporary, clearly marked legacy-name fallback only if required for a
   staged deployment.
7. Verify no secret import crosses a Client Component boundary.

### Gate K2 — Local and Preview rehearsal

Run:

- login, logout, callback, middleware refresh, blocked/inactive-user flows;
- catalog/BOQ reads and current RLS behavior;
- active-admin user-management route;
- unauthorized staff/inactive-admin negative tests;
- Local seed/smoke scripts;
- tests, lint, production build, and client-bundle secret scan;
- Preview browser network inspection for key/authorization behavior;
- server log review for accidental secret output.

The build must fail safely when a required environment variable is missing.

### Gate K3 — Production coexistence

1. Add the new Production environment variables without removing old ones.
2. Deploy code that prefers new keys but can temporarily fall back.
3. Run authenticated staff/admin smoke tests.
4. Observe authentication, Admin Auth, server errors, and Supabase logs for the
   approved window.
5. Record deployed commit, environment names changed, and evidence—never values.

### Gate K4 — Legacy disable and cleanup

1. Confirm every environment/caller uses new keys.
2. Disable legacy keys in the Supabase dashboard during an approved window.
3. Repeat critical smoke/negative tests.
4. Remove legacy fallback and old environment variables from code, Vercel, CI,
   Local templates, and active operator instructions.
5. Redeploy and reverify.
6. Record completion and next key-review owner/date.

Do not delete/deactivate legacy keys before successful new-key traffic and a
rollback rehearsal are proven.

## 7. Rollback

During coexistence:

1. restore the previous deployment or switch configuration preference to the
   still-active legacy key;
2. redeploy if required;
3. rerun auth/read/admin smoke tests;
4. preserve error evidence without copying secrets.

If legacy keys have already been disabled, re-enable them only through the
authorized Supabase dashboard/operator process when Supabase still permits it,
then restore the last known-good deployment. If reactivation is unavailable,
roll back application configuration to another already-valid key—not a copied
or exposed secret.

This change does not require a database restore because it does not mutate
catalog schema/data. A user-management action executed during smoke testing
must use a designated test account and have its own cleanup record.

## 8. Risks and controls

| Risk | Control |
|---|---|
| Production outage from missing/mismatched env | Coexistence, environment inventory, Preview rehearsal, fail-fast validation |
| Secret shipped to browser | Server-only module boundary, `NEXT_PUBLIC_` ban, bundle/network scan |
| Admin route bypasses requesting-user authorization | Preserve server auth/profile check before secret client use; negative tests |
| Secret used as bearer JWT | Supported key/client mechanism only; code review and network inspection |
| Local project confused with Production | Explicit environment/project mapping and local-only keys |
| Legacy fallback remains forever | Removal gate, owner/date, repository search acceptance criterion |
| Key value leaks in evidence | Record names/fingerprints where approved, never raw values |
| Bundling with Phase 4 hides cause | Separate branch/change window/release record |

## 9. Acceptance criteria

- all active code uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and
  `SUPABASE_SECRET_KEY` according to privilege;
- no secret value or `SUPABASE_SECRET_KEY` reference appears in a client bundle;
- browser, server, middleware, Local scripts, Preview, and Production pass the
  defined smoke/negative tests;
- Admin Auth actions still require an authenticated active admin;
- browser network behavior uses the supported publishable-key path;
- repository/deployment inventory contains no unexplained active legacy-key
  consumer;
- legacy keys and fallback are removed only after new-key verification;
- no Master Catalog schema/data change is bundled in this release;
- change record contains approver, executor, timestamps, deployed commit, test
  evidence, and rollback result without raw secrets.

## 10. Approval record

| Gate | Role | Name | Decision | Timestamp | Evidence |
|---|---|---|---|---|---|
| Plan / Local implementation | Owner |  | Pending |  |  |
| Preview rehearsal | Executor/verifier |  | Pending |  |  |
| Production coexistence deploy | Owner |  | Not requested |  |  |
| Disable legacy keys | Owner |  | Not requested |  |  |
| Remove compatibility fallback | Owner |  | Not requested |  |  |

## References

- [Supabase: Migrating to publishable and secret API keys](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys)
- [Supabase: API keys](https://supabase.com/docs/guides/api/api-keys)
- [Supabase: Securing your API](https://supabase.com/docs/guides/api/securing-your-api)
- [Phase 4 Decision Register](../master-catalog/19-phase4-decision-register.md)
