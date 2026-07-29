# Phase 4 P-46 `catalog_action_error` Callability Finding

**Prepared:** 2026-07-29

**Status:** P-46 CONSUMED/FAILED CLOSED; P-47 REPOSITORY/STATIC READY;
SEPARATE GIT/LOCAL/PRODUCTION GATES HOLD; P-12 HOLD

## 1. Finding

P-46 consumed the one Owner-authorized canonical Local bootstrap on exact
pushed source `d92d8ced42fc882481ebc2c4579adcf1edbebea7`. The bootstrap command
completed successfully and applied `009`-`015`, hotfix `016`, `017`, `017a`,
and `018`-`025`. WP-7 passed. WP-6.5 then failed closed at the
one-working-draft guard-precedence check:

```text
permission denied for function catalog_action_error
```

The authenticated caller was permitted to invoke
`public.create_catalog_draft`, a `SECURITY INVOKER` wrapper. That wrapper
directly calls
`private.catalog_action_error(uuid,text,text,boolean,jsonb)` on validation,
unique-violation, and `DRAFT_ALREADY_EXISTS` branches. The helper's final
post-`025` ACL allowed only owner `postgres`, so the wrapper could not construct
the reviewed safe machine-coded response in the caller's context.

This is an underprivilege and availability defect. It is not a table-access,
role-escalation, Data API exposure, or Production incident.

## 2. Bounded P-46 evidence

The external secret-free evidence package is:

```text
/Users/cloud/Backups/ConduitBOQ/evidence/phase4/pre-p12/p46-local-bootstrap-20260729T121635Z-d92d8ce
```

The package-level `SHA256SUMS` verification passed for all six evidence files.
The two finding/status records are:

| Evidence | SHA-256 |
|---|---|
| `05-diagnosis.json` | `12d9bb1241ec7680bd00c9d2c3b41c22fd47c0180c1a9559f5cd93ec3a1027f8` |
| `06-package-status.json` | `2a1ede2fff6b01ac951bf3f0d62d03431fe88cb26c7674d087ef08f89098d0c5` |

The bootstrap was invoked exactly once and returned exit code zero. It rebuilt
the canonical Local chain in the required order. Post-bootstrap authority was
still catalog `2568.0.0` with 710 rows; all three Phase 4 flags were false;
BOQ/BOQ-item and Factor F invariants matched the evidence baseline. WP-6.5
created one working draft `2568.2.0` before reaching the failing guarded
second-create branch, so Local now contains that bounded residual fixture.

The stop rule was applied. There was no retry, second reset, ad hoc Local
grant, cleanup, Production access/write, feature enablement, publication,
Factor F change, or hotfix change.

## 3. Root cause and security classification

The exact helper is:

```text
private.catalog_action_error(uuid,text,text,boolean,jsonb) -> jsonb
```

The reviewed post-`025` state is:

- owner `postgres`;
- language `sql`;
- one exact overload;
- `SECURITY DEFINER`;
- `SET search_path = ''`;
- volatile, parallel unsafe, non-leakproof, non-strict;
- two defaults: `false, NULL::jsonb`;
- source-body SHA-256
  `4c912b7a1bef09fff13735c9d676aff310f638eb3f08e6ba529f387b31909646`;
- exact owner-only `EXECUTE` ACL; and
- authenticated has `USAGE` on schema `private`, while `anon` does not.

The helper is a pure formatter: it constructs JSON from caller-supplied values,
does not query a table, does not mutate state, and does not require owner
authority. Private `SECURITY DEFINER` mutation functions can call it as owner,
but the authenticated `SECURITY INVOKER` public wrapper calls it as
`authenticated`. Owner-only execution therefore blocks a reviewed wrapper
branch.

The `017a` defense worked correctly: forgotten future grants fail closed
instead of inheriting broad execution. The defect is the missing explicit
least-privilege grant for one reviewed caller dependency. Global/schema
function defaults must remain owner-only.

## 4. Selected append-only correction

Do not edit `017a`, `018`, `022`, or any other reviewed migration. P-47 assigns
the next forward slot after `025` to one targeted correction:

| Field | Exact value |
|---|---|
| Source file | `026_master_catalog_phase4_catalog_action_error_acl.sql` |
| Ledger version | `20260729002600` |
| Ledger name | `master_catalog_phase4_catalog_action_error_acl` |
| Source SHA-256 | `472fa04b81bc8e96e9b507e20fc20cfee3114c80fda45f2ffba3893480920d8a` |
| Exact order | `017` → `017a` → `018` → … → `025` → `026` |

Migration `026` must:

1. fail closed unless the exact reviewed helper owner/signature/body/metadata,
   owner-only pre-ACL, private-schema usage, three disabled flags, and `017a`
   owner-only default privileges are present;
2. change only this helper from `SECURITY DEFINER` to `SECURITY INVOKER`;
3. re-revoke execute from `PUBLIC`, `anon`, `authenticated`, and
   `service_role`;
4. grant execute back only to `authenticated`; and
5. prove the final ACL is exactly owner plus `authenticated`, without grant
   option, while all reviewed metadata and default privileges remain unchanged.

Owner execution remains available to private definer callers through object
ownership. Direct authenticated execution does not gain data or mutation
authority because the unchanged invoker helper only formats caller-supplied
JSON. `private` remains outside the Production Data API exposure contract.

The correction changes no business row, table policy, global/schema default,
feature flag, BOQ, Factor F, Auth, Storage, hotfix `016`, application UI,
export, or publication behavior.

## 5. Why an after-`025` correction is valid here

[Finding #43](./43-phase4-p12-private-function-default-privilege-finding.md)
correctly rejected moving the global default-privilege repair after `025`.
Only `017a` immediately after `017` and before `018` prevents later functions
from inheriting unsafe defaults at creation time.

Migration `026` is not that rejected design. It preserves `017a` in the
canonical order and corrects a distinct callability defect discovered only
after the full chain exercised an authenticated guarded branch. It is
append-only, tightly preconditioned, and forward-fix-only, which matches the
reviewed migration architecture without rewriting history.

Inserting `017b` or `018a` would blur the already frozen bridge-stage semantics
and imply that the callability correction must occur before later migrations.
Editing `018` or `022` would invalidate accepted hashes and prior evidence.
The next chronological slot, `026`, truthfully records when the distinct
finding was discovered and keeps execution order auditable.

## 6. Verification and stop conditions

Repository/static verification must cover:

- exact migration filename, ledger, order, and SHA-256;
- exact helper signature/body fingerprint/owner/search path/security mode;
- exact owner-plus-authenticated final ACL and explicit denial to
  `PUBLIC`, `anon`, and `service_role`;
- unchanged global and `public`/`private` schema function defaults from `017a`;
- bootstrap, canonical-hash, CLI-kit, runner, and authority consistency;
- WP-6.5 fixture request tracking before RPC await, request-ID reconciliation
  after an uncertain response, and audited best-effort cleanup on both pass and
  failure;
- exact one-overload drift detection in migration preflight, canonical Local
  marker, runner postflight, and final closeout; and
- unchanged feature-flag, catalog, BOQ, Factor F, Auth/Storage, hotfix, and
  application-candidate boundaries.

A future fresh canonical Local bootstrap/regression is required before this can
become P-12 authority, but it is not authorized by P-47. Before any such run,
the Owner must receive the destructive-reset warning and grant a new explicit
one-run approval. The run must start from the newly frozen/pushed exact source,
apply through `026`, prove the guarded draft-create branch returns
`DRAFT_ALREADY_EXISTS`, complete WP-6.5/WP-7 and final invariants, and produce a
new bounded secret-free evidence package.

Stop without retry or patch if the source/hash/order, helper body/owner,
default privileges, feature flags, baseline, BOQ/Factor F invariants, or any
expected ACL differs. The current Local residual draft is not authority to
perform ad hoc cleanup; a later separately authorized canonical reset will
replace Local state as part of the reviewed test.

## 7. Scope and debt disposition

The Owner's P-47 decision authorizes repository-only implementation of
migration `026`, affected bootstrap/hash/kit/runner/smoke/test contracts, and
authority-document alignment. It authorizes no Local cleanup/reset/apply,
disposable database execution, kit/pass execution, Production access or write,
deployment, flag enablement, publication, Factor F mutation, hotfix change,
application/UI/export change, Git stage/commit/push, P-12, P-13, P-14, or
P-15.

The unused `v_row_count` observation remains separate non-runtime readability
debt. Folding it into `026` would broaden the frozen correction, obscure the
security/availability intent, and require additional function-body review. It
must remain unchanged unless the Owner separately approves a forward migration
or source correction with its own evidence.

Exact `d92d8ce` is now historical failed P-46 source rather than a P-12
application candidate. The new `026` working tree is not execution authority
even though repository review/static checks passed; it still requires the
separately authorized source freeze/publication and every later gate. P-12
remains HOLD throughout.

## 8. P-47 repository/static closure

Repository/static closure passed on 2026-07-29 without executing a database or
performing a Git write:

- migration `026` remained byte-identical at SHA-256
  `472fa04b81bc8e96e9b507e20fc20cfee3114c80fda45f2ffba3893480920d8a`;
- the full repository suite passed 38 files/287 tests; the focused migration,
  CLI-runner, and authority set passed 73/73;
- TypeScript, full ESLint, bash/Node syntax, WP-6.6 authority
  710/65/17, and `git diff --check` passed;
- independent migration/security, runner/authority, and document reviews
  reconciled the response-loss cleanup and overload-drift findings; final
  re-review found no remaining blocker; and
- accepted application/UI/export and dependency source did not change, so the
  previously recorded application-candidate build remains applicable and no
  new production build was claimed.

This closes only P-47 repository/static work. It creates no source/tooling Git
HEAD, applies no migration, cleans no Local fixture, creates no kit/pass
evidence, and authorizes no Production action.

## 9. P-48 exact Git-only publication

The Owner separately authorized P-48 on 2026-07-29:

- exact base
  `d92d8ced42fc882481ebc2c4579adcf1edbebea7`;
- existing branch `codex/master-catalog-phase4`;
- the exact 25-file allowlist recorded in Decision Register #19;
- one commit with message `Close P-47 helper ACL correction`;
- one push to the existing branch, followed by local/upstream equality and
  truthful exact-head Remote-status checks; and
- no PR and no protected/unrelated untracked path.

P-48 does not authorize database execution or cleanup, a Local reset/retry,
disposable rehearsal, kit/pass work, Production, deployment, flags,
publication, Factor F, hotfix `016`, `v_row_count`, or a Checklist-only GO
commit. The resulting replacement source/tooling SHA and Remote truth must be
recorded outside its own commit; the agent then stops before the separately
warned Local decision.
