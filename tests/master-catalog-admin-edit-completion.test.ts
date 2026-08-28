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
    expect(markers[0]).toContain('"p49FormalCloseoutComplete":true');
    expect(markers[0]).toContain('"endToEndComplete":true');
    expect(markers[0]).toContain('"readOnlyAdminUiLive":false');
    expect(markers[0]).toContain('"fullAdminDraftUiLive":true');
    expect(markers[0]).toContain('"migration028AppliedOnceNoReplay":true');
    expect(markers[0]).toContain('"catalogAdminEnabledCurrent":true');
    expect(markers[0]).toContain('"catalogNewIdentityEnabledCurrent":true');
    expect(markers[0]).toContain('"catalogRetirementEnabledCurrent":true');
    expect(markers[0]).toContain(
      '"expandedProductionPersonaTestAcceptedResidual":true',
    );
    expect(markers[0]).toContain('"planDocsAmendmentComplete":true');
    expect(markers[0]).toContain(
      '"finalReleaseAuthorization":"APPROVE MASTER CATALOG FINAL"',
    );
    expect(markers[0]).toContain('"commitAuthorized":false');
    expect(markers[0]).toContain('"productionWriteAuthorized":false');
    expect(markers[0]).toContain(
      '"releaseCommit":"f3ccc6ec389d4ae7d09f75e15d0857c45515c96e"',
    );
    expect(markers[0]).toContain('"workingDraftCount":0');
    expect(markers[0]).toContain('"automaticNextStep":false');
  });

  it('keeps one canonical final handoff with no open release work', () => {
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

    expect(marker.openWorkIds).toEqual([]);
    expect(marker.productionReadOnlyQueryPerformed).toBe(true);
    expect(marker.catalogVersion).toBe('2568.1.0');
    expect(marker.catalogTotalRows).toBe(710);
    expect(marker.catalogActiveRows).toBe(710);
    expect(marker.catalogInactiveRows).toBe(0);
    expect(marker.migration027AppliedOnceNoReplay).toBe(true);
    expect(marker.migration028Applied).toBe(true);
    expect(marker.migration028AppliedOnceNoReplay).toBe(true);
    expect(marker.migration028FunctionsPresent).toBe(true);
    expect(marker.latestProductionMigrationVersion).toBe('20260828070433');
    expect(marker.latestProductionMigrationName).toBe(
      'master_catalog_admin_gate_projection',
    );
    expect(marker.migration029Required).toBe(false);
    expect(marker.p19DirectionApproved).toBe(true);
    expect(marker.p19ImplementationComplete).toBe(true);
    expect(marker.p19RenderedFixturesVerified).toBe(true);
    expect(marker.p19LocalTestResult).toBe('48-files-444-tests-pass');
    expect(marker.fullWp8P37UatReplayRequired).toBe(false);
    expect(marker.p49TechnicalImplementationLive).toBe(true);
    expect(marker.p49FormalCloseoutComplete).toBe(true);
    expect(marker.expandedProductionPersonaTestDisposition).toBe(
      'accepted-residual-not-pass',
    );
    expect(marker.vercelDeploymentShaVerified).toBe(true);
    expect(marker.vercelProductionReady).toBe(true);
    expect(marker.productionAdminUi).toBe('full-admin-draft-workflow');
    expect(marker.catalogAdminEnabled).toBe(true);
    expect(marker.catalogNewIdentityEnabled).toBe(true);
    expect(marker.catalogRetirementEnabled).toBe(true);
    expect(marker.productionQaResult).toBe('pass');
    expect(marker.workingDraftCount).toBe(0);
    expect(marker.masterCatalogEndToEndComplete).toBe(true);
    expect(marker.deployedMain).toBe(
      'f3ccc6ec389d4ae7d09f75e15d0857c45515c96e',
    );
    expect(marker.applicationCodeAuthorized).toBe(false);
    expect(marker.finalReleaseAuthorization).toBe(
      'APPROVE MASTER CATALOG FINAL',
    );
    expect(marker.commitAuthorized).toBe(false);
    expect(marker.pushAuthorized).toBe(false);
    expect(marker.mainMergeAuthorized).toBe(false);
    expect(marker.productionReadAuthorized).toBe(false);
    expect(marker.productionWriteAuthorized).toBe(false);
    expect(marker.deployAuthorized).toBe(false);
    expect(marker.flagChangeAuthorized).toBe(false);
    expect(marker.automaticNextStep).toBe(false);

    expect(handoff.match(/^### R-0[1-5] —/gm)).toHaveLength(5);
    expect(handoff).toContain('## 2. Completed final route');
    expect(handoff).toContain('must not be replayed');
    expect(handoff).toContain('There is no open R-01 through R-05 work');

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
    expect(handoff).toContain(
      '20260828070433/master_catalog_admin_gate_projection',
    );
    expect(handoff).toMatch(
      /Existing-row Edit\/Recode[\s\S]*non-Admin denial[\s\S]*Add\/Retire denial/,
    );
    expect(handoff).toContain(
      '[Result #107](./107-phase4-p49-master-catalog-final-closeout-result.md)',
    );
  });

  it('records the completed full-Admin rollout and retained safeguards truthfully', () => {
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
    expect(plan).toMatch(/full end-to-end operating\s+target are complete/);
    expect(plan).toContain('P-13, P-14, P-14C, and P-15 are complete');
    expect(plan).toContain('must not be replayed');
    expect(plan).toContain('MASTER_CATALOG_ADMIN_EDIT_PLAN_V2');
    expect(plan).toContain('catalog_admin_enabled=true');
    expect(plan).toContain('catalog_new_identity_enabled=true');
    expect(plan).toContain('catalog_retirement_enabled=true');
    expect(plan).toContain('Stage A - existing-row Admin workflow');
    expect(plan).toContain('Stage B - Add/Supplement');
    expect(plan).toContain('Stage C - Retirement');
    expect(plan).toContain('"p19ImplementationComplete":true');
    expect(plan).toContain('"p19RenderedFixturesVerified":true');
    expect(plan).toMatch(/Completed local P-19 release evidence[\s\S]*48` test files \/ `444` tests passed/);
    expect(plan).toContain('"p49FormalCloseoutComplete":true');
    expect(plan).toContain('conditional compare-and-set');
    expect(plan).toMatch(/Withdraw[\s\S]*Admin \+ eligible draft-only\/never-published state guard/);
    expect(plan).toMatch(/Reactivate[\s\S]*Admin \+ eligible inherited inactive-in-draft state guard/);
    expect(plan).toContain('published or archived field-facing official PDF shows only rows');
    expect(plan).toContain('draft review PDF shows every draft row');
    expect(plan).toContain('Do not create migration 029');
    expect(plan).toMatch(/existing BOQs keep\s+their bound snapshot/i);
    expect(plan).toMatch(/There is no\s+raw `app_settings` fallback/);
    expect(plan).toContain('Production Vercel auto-deployment');
    expect(plan).toContain('already-running transaction may finish');
    expect(plan).toMatch(/must not be relabelled as evidence/);
    expect(plan).toContain(migrationDigest);
    expect(migrationRegister).toContain(migrationDigest);
    expect(plan).toContain('"baselineFeatureCommit":"705eeca0c86df5eda06cd4ea9efeda5b9bfeeebe"');
    expect(plan).toContain('"catalogAdminEnabledCurrent":true');
    expect(plan).toContain('"catalogNewIdentityEnabledCurrent":true');
    expect(plan).toContain('"catalogRetirementEnabledCurrent":true');
    expect(plan).toContain('"catalogAdminEnabledTarget":true');
    expect(plan).toContain('"catalogNewIdentityEnabledTarget":true');
    expect(plan).toContain('"catalogRetirementEnabledTarget":true');
    expect(plan).toContain('"applicationCodeAuthorized":false');
    expect(plan).toContain(
      '"finalReleaseAuthorization":"APPROVE MASTER CATALOG FINAL"',
    );
    expect(plan).toContain('"commitAuthorized":false');
    expect(plan).toContain('"pushAuthorized":false');
    expect(plan).toContain('"mainMergeAuthorized":false');
    expect(plan).toContain('"productionReadAuthorized":false');
    expect(plan).toContain('"productionWriteAuthorized":false');
    expect(plan).toContain('"deployAuthorized":false');
    expect(plan).toContain('"flagChangeAuthorized":false');
    expect(plan).toContain('"automaticNextStep":false');
    expect(plan).toContain(
      '"releaseCommit":"f3ccc6ec389d4ae7d09f75e15d0857c45515c96e"',
    );
    expect(plan).toContain(
      '"migration028Ledger":"20260828070433/master_catalog_admin_gate_projection"',
    );
    expect(plan).toContain('"workingDraftCount":0');
  });

  it('records the short P-49 final Production closeout without widening scope', () => {
    const closeout = source(
      'docs/plans/master-catalog/107-phase4-p49-master-catalog-final-closeout-result.md',
    );
    const capture = closeout.match(
      /<!-- MASTER_CATALOG_P49_FINAL_CLOSEOUT_V1 (\{[^\n]+\}) -->/,
    );

    expect(capture).not.toBeNull();
    const marker = JSON.parse(capture?.[1] ?? '{}') as Record<string, unknown>;
    expect(marker.result).toBe('pass');
    expect(marker.masterCatalogEndToEndComplete).toBe(true);
    expect(marker.p49FormalCloseoutComplete).toBe(true);
    expect(marker.releaseCommit).toBe(
      'f3ccc6ec389d4ae7d09f75e15d0857c45515c96e',
    );
    expect(marker.migration028Ledger).toBe(
      '20260828070433/master_catalog_admin_gate_projection',
    );
    expect(marker.catalogAdminEnabled).toBe(true);
    expect(marker.catalogNewIdentityEnabled).toBe(true);
    expect(marker.catalogRetirementEnabled).toBe(true);
    expect(marker.workingDraftCount).toBe(0);
    expect(marker.qaDraftsAbandoned).toBe(2);
    expect(marker.catalogPublicationPerformed).toBe(false);
    expect(marker.catalogPointerChanged).toBe(false);
    expect(marker.boqChanged).toBe(false);
    expect(marker.factorFChanged).toBe(false);
    expect(marker.expandedProductionPersonaTestDisposition).toBe(
      'accepted-residual-not-pass',
    );
    expect(marker.openWorkIds).toEqual([]);
    expect(marker.automaticNextStep).toBe(false);
  });

  it('routes live and AI entry documents to the completed no-replay authority', () => {
    const entryDocuments = [
      'AGENTS.md',
      'README.md',
      'docs/README.md',
      'docs/ai/README.md',
      'docs/08_ai/AI_CONTEXT.md',
      'docs/08_ai/AI_HANDOFF.md',
      'docs/08_ai/LESSONS_LEARNED.md',
    ];
    const liveDocuments = [
      'README.md',
      'docs/08_ai/LESSONS_LEARNED.md',
      'docs/01_overview/ROADMAP.md',
      'docs/01_overview/IMPLEMENTATION_PLAN.md',
      'docs/IMPLEMENTATION_PLAN.md',
      'docs/07_process/RELEASE_PROCESS.md',
      'docs/07_process/PHASE_GUARDRAILS.md',
      'docs/03_domain/ACCESS_MODEL.md',
      'docs/04_data/DATA_INTEGRITY.md',
      'docs/06_engineering/PERMISSION_PATTERNS.md',
      'docs/04_data/DATABASE_SCHEMA.md',
      'docs/02_architecture/ADR/ADR-003-master-catalog-rollout-and-version-numbering.md',
      'docs/02_architecture/ADR/ADR-004-phase4-catalog-governance-and-official-publication.md',
    ];

    for (const path of entryDocuments) {
      const content = source(path);
      expect(content, path).toContain(
        '106-phase4-master-catalog-exact-remaining-work-handoff.md',
      );
      expect(content, path).toContain(
        '107-phase4-p49-master-catalog-final-closeout-result.md',
      );
    }

    const agentEntry = source('AGENTS.md');
    const aiHandoff = source('docs/08_ai/AI_HANDOFF.md');
    for (const content of [agentEntry, aiHandoff]) {
      expect(content).toContain('LOCAL_WORKSPACE_HANDOFF_20260829');
      expect(content).toContain('/Users/cloud/Cloudstellar/conduit-boq');
      expect(content).toContain(
        '/Users/cloud/Cloudstellar/conduit-boq-archive-p51-20260829',
      );
    }
    expect(aiHandoff).toContain('no required Master Catalog execution work');
    expect(aiHandoff).not.toContain(
      'shared legacy checkout and its protected local evidence remain untouched',
    );

    for (const path of liveDocuments) {
      const content = source(path);
      const currentState = content.slice(0, 2200);
      expect(content, path).toContain('MASTER_CATALOG_CURRENT_STATE_20260829');
      expect(currentState, path).toContain(
        '106-phase4-master-catalog-exact-remaining-work-handoff.md',
      );
      expect(currentState, path).toContain(
        '107-phase4-p49-master-catalog-final-closeout-result.md',
      );
      expect(currentState, path).toMatch(
        /historical[\s\S]{0,40}(?:chronology|pre-release plan)/iu,
      );
      expect(currentState, path).not.toMatch(
        /\*\*Status:\*\*[^\n]*(?:P-49[^\n]*(?:HOLD|open)|028[^\n]*candidate)/iu,
      );
    }

    const stalePhrasesByDocument: Record<string, string[]> = {
      'docs/07_process/RELEASE_PROCESS.md': [
        'Phase 4 administration/publication has not started',
        'Current: **v1.2.0**',
      ],
      'docs/03_domain/ACCESS_MODEL.md': [
        'not yet fully enforced',
        'It is not yet the complete runtime contract',
        'P-49 still requires',
        'awaiting implementation',
        'During post-P-15 P-49 remediation',
      ],
      'docs/04_data/DATA_INTEGRITY.md': [
        'blocker pending exact read-only live verification',
        'Current applied behavior',
        'Current raw `app_settings`',
        'Post-P-15 P-49 remediation requires',
        'post-P-15 forward-only correction',
      ],
      'docs/06_engineering/PERMISSION_PATTERNS.md': [
        'current runtime not yet aligned',
        'Current source still implements',
      ],
      'docs/04_data/DATABASE_SCHEMA.md': ['Current applied behavior'],
      'docs/IMPLEMENTATION_PLAN.md': [
        '**Current Version:** v1.6.0',
        'Phase 4: Catalog Administration & Official Publication — planned',
        'It has not started and requires owner approval',
      ],
      'docs/01_overview/IMPLEMENTATION_PLAN.md': [
        '**Current Version:** v1.6.0',
        'Current status is owned by the Phase 4 Tracker',
        'Production Phase 4 remains not started',
      ],
    };

    for (const [path, phrases] of Object.entries(stalePhrasesByDocument)) {
      const content = source(path);
      for (const phrase of phrases) {
        expect(content, `${path}: ${phrase}`).not.toContain(phrase);
      }
    }

    const migrationGuide = source('migrations/README.md');
    const migrationGuideAuthority = migrationGuide.slice(0, 2200);
    expect(migrationGuideAuthority).toMatch(
      /migration 027 and migration[\s\S]*028 applied exactly once/iu,
    );
    expect(migrationGuideAuthority).toMatch(
      /must not be edited,[\s\S]{0,40}retried, or replayed/iu,
    );
    expect(migrationGuideAuthority).toContain(
      'Repository/document convergence requires no migration 029',
    );
    expect(migrationGuideAuthority).not.toMatch(
      /migration 028[^\n]*(?:candidate|pending)/iu,
    );

    const temporalDocuments = [
      'docs/04_data/MIGRATIONS.md',
      'docs/04_data/SECURITY_MODEL.md',
      'docs/SECURITY.md',
      'docs/CODEBASE_DATABASE_MAP.md',
    ];
    for (const path of temporalDocuments) {
      const content = source(path);
      const addendum = content.slice(0, 1800);
      const normalizedAddendum = addendum.replace(/^>\s?/gm, '');
      expect(addendum, path).toContain(
        'MAIN_CONVERGENCE_TEMPORAL_ADDENDUM_20260829',
      );
      expect(addendum, path).toContain('runtime release baseline/ancestor');
      expect(addendum, path).toContain(
        'not the repository identity to copy after this convergence',
      );
      expect(normalizedAddendum, path).toMatch(
        /resolve and verify the exact `main` and Vercel SHAs\s+independently/,
      );
      expect(addendum, path).toMatch(
        /unchanged[\s\S]{0,80}(?:application runtime|migration SQL tree)|(?:application runtime|migration SQL tree)[\s\S]{0,80}unchanged/iu,
      );
    }

    const accessModel = source('docs/03_domain/ACCESS_MODEL.md');
    const databaseSchema = source('docs/04_data/DATABASE_SCHEMA.md');
    for (const content of [accessModel, databaseSchema]) {
      expect(content).toContain('private.p49_guard_user_profile_mutation()');
      expect(content).toContain('trg_p49_guard_user_profile_mutation');
      expect(content).toContain(
        'admin_approve_user(p_target_id uuid, p_request_id uuid, p_reason text)',
      );
    }
    expect(databaseSchema).toContain(
      'admin_reject_user(p_target_id uuid, p_reason text, p_request_id uuid)',
    );
    expect(databaseSchema).toMatch(
      /Migration 027 dropped the historical one-argument[\s\S]*two-argument\s+`admin_reject_user\(p_target_id uuid, p_note text\)` signatures/,
    );
  });
});
