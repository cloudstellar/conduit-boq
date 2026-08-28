import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function source(path: string): string {
  return readFileSync(resolve(process.cwd(), path), 'utf8');
}

describe('Master Catalog post-closeout admin edit completion', () => {
  it('keeps migration 028 additive, disabled, and least-privilege', () => {
    const sql = source('migrations/028_master_catalog_admin_gate_projection.sql');

    expect(sql.trimStart().startsWith('--')).toBe(true);
    expect(sql).toContain('BEGIN;');
    expect(sql.trimEnd().endsWith('COMMIT;')).toBe(true);
    expect(sql).toContain("'20260827174634'");
    expect(sql).toContain("'p49_active_profile_authorization_hardening'");
    expect(sql).toContain('CREATE FUNCTION private.catalog_admin_gate_projection()');
    expect(sql).toContain('CREATE FUNCTION public.get_my_catalog_admin_gate()');
    expect(sql).toContain('IF NOT private.p49_current_active_admin() THEN');
    expect(sql).toContain(
      '2b84600847ed9c3bd0065c1bc09fdb633c8ba393e98623f3d6265c6797e586ec',
    );
    expect(sql).toContain(
      '8d0853a2224cf9c9044fcd1bfdc24282d4f476fb4fd78d481238b3a93992ebf0',
    );
    expect(sql).toContain(
      'da43534fa761a19bb89f9cf3a1fc220d8a74e27e99e30ecb8955d14369eaf663',
    );
    expect(sql).toContain('SECURITY DEFINER');
    expect(sql).toContain('SECURITY INVOKER');
    expect(sql.match(/SET search_path = ''/g)).toHaveLength(2);
    expect(sql).toContain('ALTER FUNCTION private.catalog_admin_gate_projection() OWNER TO postgres');
    expect(sql).toContain('ALTER FUNCTION public.get_my_catalog_admin_gate() OWNER TO postgres');
    expect(sql).toMatch(
      /REVOKE EXECUTE ON FUNCTION private\.catalog_admin_gate_projection\(\)[\s\S]*FROM PUBLIC, anon, authenticated, service_role;/,
    );
    expect(sql).toMatch(
      /REVOKE EXECUTE ON FUNCTION public\.get_my_catalog_admin_gate\(\)[\s\S]*FROM PUBLIC, anon, authenticated, service_role;/,
    );
    expect(sql).toContain(
      'GRANT EXECUTE ON FUNCTION private.catalog_admin_gate_projection()',
    );
    expect(sql).toContain(
      'GRANT EXECUTE ON FUNCTION public.get_my_catalog_admin_gate()',
    );
    expect(sql.match(/raw app_settings ACL drifted/g)).toHaveLength(2);
    expect(sql.match(/private-schema ACL drifted/g)).toHaveLength(2);
    expect(sql).toContain("'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE'");
    expect(sql).toContain(
      "NOT pg_catalog.has_schema_privilege(\n       'authenticated', 'private', 'USAGE'",
    );
    expect(sql).toContain('catalog RLS posture drifted');
    expect(sql).toContain('direct catalog DML ACL drifted');
    expect(sql).not.toMatch(
      /\b(?:INSERT\s+INTO|UPDATE|DELETE\s+FROM|TRUNCATE)\s+public\.(?:app_settings|price_list|boq|boq_items|boq_routes|factor_reference)/i,
    );
    expect(sql).not.toMatch(/DROP\s+FUNCTION/i);
    expect(sql).not.toMatch(/CREATE\s+OR\s+REPLACE\s+FUNCTION/i);
  });

  it('binds every current authority document to one identical status overlay', () => {
    const documents = [
      '00-phase4-review-guide.md',
      '12-phase4-production-runbook.md',
      '13-phase4-verification-report.md',
      '15-phase4-admin-operating-procedure.md',
      '17-phase4-database-security-contract.md',
      '19-phase4-decision-register.md',
      '23-phase4-implementation-execution-pack.md',
      '25-phase4-execution-progress-tracker.md',
      '45-phase4-p49-pending-authorization-hardening-plan.md',
      '47-phase4-p49-forward-only-db-application-correction-proposal.md',
      '48-phase4-p51-risk-accepted-master-catalog-closeout-plan.md',
    ].map((name) => `docs/plans/master-catalog/${name}`);

    const markers = documents.map((path) => {
      const content = source(path);
      const matches = content.match(
        /<!-- MASTER_CATALOG_ADMIN_EDIT_STATUS_V2 \{[^\n]+\} -->/g,
      );
      expect(matches, path).toHaveLength(1);
      expect(content, path).toContain(
        '[Plan #105 V2](./105-phase4-master-catalog-admin-edit-completion-plan.md)',
      );
      expect(content, path).toContain(
        'This overlay supersedes all prior live Status/Current/next-action wording;',
      );
      return matches?.[0];
    });

    expect(new Set(markers).size).toBe(1);
    expect(markers[0]).toContain('"p19ImplementationComplete":true');
    expect(markers[0]).toContain('"p19RenderedFixturesVerified":true');
    expect(markers[0]).toContain(
      '"p19LocalTestResult":"48-files-444-tests-pass"',
    );
    expect(markers[0]).toContain('"p49FormalCloseoutComplete":false');
    expect(markers[0]).toContain(
      '"expandedProductionPersonaTestAcceptedResidual":true',
    );
    expect(markers[0]).toContain('"planDocsAmendmentComplete":true');
    expect(markers[0]).toContain(
      '"finalReleaseAuthorization":"APPROVE MASTER CATALOG FINAL"',
    );
    expect(markers[0]).toContain('"commitAuthorized":true');
    expect(markers[0]).toContain('"productionWriteAuthorized":true');
  });

  it('keeps one canonical handoff with the exact remaining work and authority', () => {
    const handoffPath =
      'docs/plans/master-catalog/106-phase4-master-catalog-exact-remaining-work-handoff.md';
    const handoff = source(handoffPath);
    const markerMatches = handoff.match(
      /<!-- MASTER_CATALOG_EXACT_REMAINING_WORK_V1 (\{[^\n]+\}) -->/g,
    );
    const markerCapture = handoff.match(
      /<!-- MASTER_CATALOG_EXACT_REMAINING_WORK_V1 (\{[^\n]+\}) -->/,
    );

    expect(markerMatches).toHaveLength(1);
    expect(markerCapture).not.toBeNull();

    const marker = JSON.parse(markerCapture?.[1] ?? '{}') as Record<
      string,
      unknown
    >;

    expect(marker.openWorkIds).toEqual([
      'R-02',
      'R-03',
      'R-04',
      'R-05',
    ]);
    expect(marker.productionReadOnlyQueryPerformed).toBe(true);
    expect(marker.catalogVersion).toBe('2568.1.0');
    expect(marker.catalogTotalRows).toBe(710);
    expect(marker.catalogActiveRows).toBe(710);
    expect(marker.catalogInactiveRows).toBe(0);
    expect(marker.migration027AppliedOnceNoReplay).toBe(true);
    expect(marker.migration028Applied).toBe(false);
    expect(marker.migration028FunctionsPresent).toBe(false);
    expect(marker.migration029Required).toBe(false);
    expect(marker.p19DirectionApproved).toBe(true);
    expect(marker.p19ImplementationComplete).toBe(true);
    expect(marker.p19RenderedFixturesVerified).toBe(true);
    expect(marker.p19LocalTestResult).toBe('48-files-444-tests-pass');
    expect(marker.fullWp8P37UatReplayRequired).toBe(false);
    expect(marker.p49TechnicalImplementationLive).toBe(true);
    expect(marker.p49FormalCloseoutComplete).toBe(false);
    expect(marker.expandedProductionPersonaTestDisposition).toBe(
      'accepted-residual-not-pass',
    );
    expect(marker.vercelDeploymentShaVerified).toBe(false);
    expect(marker.applicationCodeAuthorized).toBe(true);
    expect(marker.finalReleaseAuthorization).toBe(
      'APPROVE MASTER CATALOG FINAL',
    );
    expect(marker.commitAuthorized).toBe(true);
    expect(marker.pushAuthorized).toBe(true);
    expect(marker.mainMergeAuthorized).toBe(true);
    expect(marker.productionReadAuthorized).toBe(true);
    expect(marker.productionWriteAuthorized).toBe(true);
    expect(marker.deployAuthorized).toBe(true);
    expect(marker.flagChangeAuthorized).toBe(true);
    expect(marker.automaticNextStep).toBe(true);

    expect(handoff.match(/^### R-0[2-5] -/gm)).toHaveLength(4);
    expect(handoff).toContain('## 4. Completed local block - R-01');
    expect(handoff).toContain('must not be replayed');
    expect(handoff).toContain('does not require a full UAT replay');

    const linkedDocuments = [
      '105-phase4-master-catalog-admin-edit-completion-plan.md',
      '12-phase4-production-runbook.md',
      '25-phase4-execution-progress-tracker.md',
      '19-phase4-decision-register.md',
    ].map((name) => `docs/plans/master-catalog/${name}`);

    for (const path of linkedDocuments) {
      expect(source(path), path).toContain(
        '106-phase4-master-catalog-exact-remaining-work-handoff.md',
      );
    }

    const runbook = source(linkedDocuments[1]);
    const tracker = source(linkedDocuments[2]);
    const decisionRegister = source(linkedDocuments[3]);

    expect(runbook).toMatch(
      /enable Retirement[\s\S]*P-49 formal closeout[\s\S]*accepted residual, not\s+PASS/,
    );
    expect(runbook).toMatch(
      /do not\s+publish a mixed-status version for smoke/,
    );
    expect(runbook).toContain('they later completed and must not be replayed');
    expect(runbook).toMatch(
      /Hard precondition:[\s\S]*R-01 and R-02 must both be complete[\s\S]*do not start migration 028/,
    );
    expect(tracker).not.toContain('## 2. Current dashboard');
    expect(tracker).not.toContain('**Current P-50I execution receipt');
    expect(tracker).not.toContain(
      'This file is the authority for current WP status',
    );
    expect(tracker).toContain(
      '## 2. Historical dashboard snapshot - superseded by Handoff #106',
    );
    expect(decisionRegister).toContain('## Current post-closeout disposition');
    expect(decisionRegister).toContain('**Current-disposition override:**');
    expect(decisionRegister).not.toContain(
      'Owner Option A / PDF presentation decision — current',
    );
    expect(decisionRegister).not.toContain(
      'P-50I execution result overlay — current',
    );
    expect(decisionRegister).not.toContain(
      'Result #60 plus P-50J Proposal #61 are current',
    );
    expect(handoff).toMatch(
      /exact applied migration\s+027 ledger and frozen source\/function fingerprint/,
    );
    expect(handoff).toMatch(
      /Stage A:[\s\S]*Add and Retire denial at both UI and database boundaries/,
    );
  });

  it('records current false flags, the staged full-Admin target, and remaining gates truthfully', () => {
    const plan = source(
      'docs/plans/master-catalog/105-phase4-master-catalog-admin-edit-completion-plan.md',
    );
    const migration = source(
      'migrations/028_master_catalog_admin_gate_projection.sql',
    );
    const migrationDigest = createHash('sha256')
      .update(migration)
      .digest('hex');
    const migrationRegister = source('docs/04_data/MIGRATIONS.md');

    expect(plan).toContain('data and publication');
    expect(plan).toMatch(/end-to-end operating\s+target is not complete/);
    expect(plan).toContain('P-13, P-14, P-14C, and P-15 are complete');
    expect(plan).toContain('must not be replayed');
    expect(plan).toContain('MASTER_CATALOG_ADMIN_EDIT_PLAN_V2');
    expect(plan).toContain('catalog_admin_enabled=false');
    expect(plan).toContain('catalog_new_identity_enabled=false');
    expect(plan).toContain('catalog_retirement_enabled=false');
    expect(plan).toContain('catalog_admin_enabled=true');
    expect(plan).toContain('catalog_new_identity_enabled=true');
    expect(plan).toContain('catalog_retirement_enabled=true');
    expect(plan).toContain('Stage A - existing-row Admin workflow');
    expect(plan).toContain('Stage B - Add/Supplement');
    expect(plan).toContain('Stage C - Retirement');
    expect(plan).toContain('"p19ImplementationComplete":true');
    expect(plan).toContain('"p19RenderedFixturesVerified":true');
    expect(plan).toMatch(/Completed local P-19 release evidence[\s\S]*48` test files \/ `444` tests passed/);
    expect(plan).toContain('"p49FormalCloseoutComplete":false');
    expect(plan).toContain('conditional compare-and-set');
    expect(plan).toMatch(/Withdraw[\s\S]*Admin \+ eligible draft-only\/never-published state guard/);
    expect(plan).toMatch(/Reactivate[\s\S]*Admin \+ eligible inherited inactive-in-draft state guard/);
    expect(plan).toContain('published or archived field-facing official PDF shows only rows');
    expect(plan).toContain('draft review PDF shows every draft row');
    expect(plan).toContain('Do not create migration 029');
    expect(plan).toMatch(/existing BOQs keep\s+their bound snapshot/i);
    expect(plan).toMatch(/There is no\s+raw `app_settings` fallback/);
    expect(plan).toContain('is pushed only to');
    expect(plan).toContain('Production Vercel auto-deployment');
    expect(plan).toContain('already-running transaction may finish');
    expect(plan).toMatch(/must not be relabelled as evidence/);
    expect(plan).toContain(migrationDigest);
    expect(migrationRegister).toContain(migrationDigest);
    expect(plan).toContain('"baselineFeatureCommit":"705eeca0c86df5eda06cd4ea9efeda5b9bfeeebe"');
    expect(plan).toContain('"catalogAdminEnabledCurrent":false');
    expect(plan).toContain('"catalogAdminEnabledTarget":true');
    expect(plan).toContain('"catalogNewIdentityEnabledTarget":true');
    expect(plan).toContain('"catalogRetirementEnabledTarget":true');
    expect(plan).toContain('"applicationCodeAuthorized":true');
    expect(plan).toContain(
      '"finalReleaseAuthorization":"APPROVE MASTER CATALOG FINAL"',
    );
    expect(plan).toContain('"commitAuthorized":true');
    expect(plan).toContain('"pushAuthorized":true');
    expect(plan).toContain('"mainMergeAuthorized":true');
    expect(plan).toContain('"productionReadAuthorized":true');
    expect(plan).toContain('"productionWriteAuthorized":true');
    expect(plan).toContain('"deployAuthorized":true');
    expect(plan).toContain('"flagChangeAuthorized":true');
    expect(plan).toContain('"automaticNextStep":true');
  });
});
