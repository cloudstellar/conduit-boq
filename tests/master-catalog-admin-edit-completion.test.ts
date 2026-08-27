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
        /<!-- MASTER_CATALOG_ADMIN_EDIT_STATUS_V1 \{[^\n]+\} -->/g,
      );
      expect(matches, path).toHaveLength(1);
      expect(content, path).toContain(
        '[Plan #105](./105-phase4-master-catalog-admin-edit-completion-plan.md)',
      );
      expect(content, path).toContain(
        'This overlay supersedes all prior live Status/Current/next-action wording;',
      );
      return matches?.[0];
    });

    expect(new Set(markers).size).toBe(1);
  });

  it('records the safe target and the remaining external gates without claiming completion', () => {
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
    expect(plan).toContain('end-to-end operating target is not complete');
    expect(plan).toContain('P-13, P-14, P-14C, and P-15 are complete');
    expect(plan).toContain('must not be replayed');
    expect(plan).toContain('catalog_admin_enabled');
    expect(plan).toContain('catalog_new_identity_enabled=false');
    expect(plan).toContain('catalog_retirement_enabled=false');
    expect(plan).toContain('existing BOQs keep their bound snapshot');
    expect(plan).toContain('There is no raw `app_settings` fallback');
    expect(plan).toContain('push only its feature branch');
    expect(plan).toContain('Production Vercel auto-deploy trigger');
    expect(plan).toContain('an in-flight transaction is not forcibly');
    expect(plan).toContain(migrationDigest);
    expect(migrationRegister).toContain(migrationDigest);
    expect(plan).toContain('"featureBranchGitPublicationAuthorized":true');
    expect(plan).toContain('"featureBranch":"codex/master-catalog-admin-edit"');
    expect(plan).toContain('"commitAuthorized":true');
    expect(plan).toContain('"pushAuthorized":true');
    expect(plan).toContain('"mainMergeAuthorized":false');
    expect(plan).toContain('"productionWriteAuthorized":false');
    expect(plan).toContain('"deployAuthorized":false');
  });
});
