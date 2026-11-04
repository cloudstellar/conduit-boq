import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(resolve(process.cwd(), 'migrations/032_s0_boq_writer_boundary.sql'), 'utf8');
const sql = migration.replace(/--[^\n]*/g, '');
const tables = ['boq', 'boq_routes', 'boq_items'];
const commands = ['INSERT', 'UPDATE', 'DELETE'];
const predicate = "((SELECT private.p49_current_active_role()) = ANY (ARRAY['admin', 'dept_manager', 'sector_manager', 'staff']::text[]))";
const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();
const withoutScalarText = (value: string) => value
  .replace(/\$predicate\$[\s\S]*?\$predicate\$/g, "''")
  .replace(/'(?:''|[^'])*'/g, "''");

const policies = [...sql.matchAll(
  /CREATE POLICY (\w+)\s+ON (public\.\w+) AS (\w+) FOR (\w+) TO (\w+)\s+([\s\S]*?);/g,
)];

describe('S0 BOQ direct-write role boundary forward migration', () => {
  it('adds exactly one restrictive authenticated guard per write command and table', () => {
    expect(policies).toHaveLength(9);
    const actual = policies.map(([, name, table, mode, command, role]) => ({ name, table, mode, command, role }));
    const expected = tables.flatMap((table) => commands.map((command) => ({
      name: `s0_${table}_writer_${command.toLowerCase()}`,
      table: `public.${table}`,
      mode: 'RESTRICTIVE',
      command,
      role: 'authenticated',
    })));
    expect(actual).toEqual(expected);
    expect(sql.match(/\bCREATE\s+POLICY\b/g)).toHaveLength(9);
    expect(new Set(actual.map(({ name }) => name)).size).toBe(9);
  });

  it('checks only the current active writer role on every required old/new row image', () => {
    for (const [, , , , command, , clauses] of policies) {
      const expected = [
        ...(command === 'UPDATE' || command === 'DELETE' ? [`USING ${predicate}`] : []),
        ...(command === 'INSERT' || command === 'UPDATE' ? [`WITH CHECK ${predicate}`] : []),
      ].join(' ');
      expect(normalize(clauses)).toBe(expected);
    }
    // UPDATE must guard both preimage and postimage; no cached JWT/user-editable
    // metadata, affiliation prerequisite or permissive ownership branch is added.
    expect(policies.flatMap((policy) => policy[6].match(/SELECT private\.p49_current_active_role\(\)/g) ?? []))
      .toHaveLength(12);
    const allClauses = policies.map((policy) => policy[6]).join('\n');
    expect(allClauses).not.toMatch(/\b(?:procurement|org_id|department_id|sector_id|auth\.jwt|user_metadata|created_by|assigned_to)\b/);
    expect(allClauses).not.toMatch(/\bOR\b|\bCOALESCE\b|\bTRUE\b/);
  });

  it('rejects a successor, partial application, bypass authority or metadata drift before creating guards', () => {
    const firstCreate = sql.indexOf('CREATE POLICY');
    for (const marker of [
      "IF session_user <> 'postgres' OR current_user <> 'postgres'",
      'p.polrelid = ANY(c_tables) AND p.polname = ANY(c_guard_names)',
      "RAISE EXCEPTION 'S0 blocked: existing successor or partial guard set; no replay'",
      "r.rolname = 'authenticated' AND NOT r.rolsuper AND NOT r.rolbypassrls",
      "pg_catalog.pg_has_role(r.oid, inherited.oid, 'USAGE')",
      "'TRUNCATE, REFERENCES, TRIGGER, MAINTAIN'",
      "RAISE EXCEPTION 'S0 blocked: authenticated has non-RLS table privileges'",
      'IS DISTINCT FROM c_pre_sha256',
      "RAISE EXCEPTION 'S0 blocked: exact post-031 predecessor metadata differs'",
      'v_before_contract := v_contract;',
      'v_before_identity_contract := v_identity_contract;',
    ]) {
      expect(sql.indexOf(marker)).toBeGreaterThan(-1);
      expect(sql.indexOf(marker)).toBeLessThan(firstCreate);
    }
    expect(sql).toContain("c_pre_sha256 constant text := '1df6e90e98b017ff13b6e566d1c6734f48edcf9ebb0be651b85a69ebbd3e0723'");
    expect(sql).toContain("pg_catalog.convert_to(v_contract::text, 'UTF8')");
    expect(sql).not.toMatch(/\bCREATE\s+POLICY\s+IF\s+NOT\s+EXISTS\b|\bCREATE\s+OR\s+REPLACE\b/i);
  });

  it('checks the exact nine successors and retains the existing portable and local identities', () => {
    expect(sql).toContain('FOR v_phase IN 0..1 LOOP');
    expect(sql).toContain('v_phase = 0 OR NOT (p.polrelid = ANY(c_tables) AND p.polname = ANY(c_guard_names))');
    expect(sql).toContain('v_contract IS DISTINCT FROM v_before_contract');
    expect(sql).toContain('v_identity_contract IS DISTINCT FROM v_before_identity_contract');
    expect(sql).toContain('v_guard_count IS DISTINCT FROM 9');
    expect(sql).toContain('p.polpermissive IS DISTINCT FROM false');
    expect(sql).toContain("p.polroles IS DISTINCT FROM ARRAY['authenticated'::pg_catalog.regrole::oid]");
    expect(sql).toContain("p.polcmd NOT IN ('a', 'w', 'd')");
    expect(sql).toContain('pg_catalog.pg_get_expr(p.polqual, p.polrelid)');
    expect(sql).toContain('pg_catalog.pg_get_expr(p.polwithcheck, p.polrelid)');
    for (const evidence of [
      'pg_get_function_identity_arguments(f.oid)', 'pg_get_functiondef(f.oid)',
      "'securityDefiner',f.prosecdef", "'config',COALESCE(to_jsonb(f.proconfig)",
      'pg_get_triggerdef(t.oid,true)', 'pg_get_constraintdef(con.oid,true)',
      'pg_catalog.to_jsonb(p)', "pg_catalog.obj_description(p.oid, 'pg_proc')",
      'pg_catalog.to_jsonb(a)', 'pg_catalog.to_jsonb(c)', 'pg_catalog.to_jsonb(t)',
      'pg_catalog.pg_get_indexdef(i.indexrelid)',
    ]) expect(sql).toContain(evidence);
  });

  it('performs one bounded atomic policy-only change without business calls or ledger writes', () => {
    expect(sql.match(/^BEGIN;$/gm)).toHaveLength(1);
    expect(sql.match(/^COMMIT;$/gm)).toHaveLength(1);
    expect(sql.match(/^DO \$s0_boq_writer_boundary\$/gm)).toHaveLength(1);
    expect(sql).toContain("SET LOCAL search_path = pg_catalog;");
    expect(sql).toContain("SET LOCAL lock_timeout = '2s';");
    expect(sql).toContain("SET LOCAL statement_timeout = '15s';");
    expect(sql).toContain("SET LOCAL idle_in_transaction_session_timeout = '30s';");
    expect(sql).toContain('LOCK TABLE public.boq, public.boq_routes, public.boq_items\n  IN SHARE ROW EXCLUSIVE MODE;');
    expect(withoutScalarText(sql)).not.toMatch(/\b(?:INSERT\s+INTO|UPDATE\s+(?:public|private)\.|DELETE\s+FROM|TRUNCATE|DROP|GRANT|REVOKE|ALTER\s+(?:TABLE|FUNCTION|ROLE|POLICY)|CREATE\s+(?:TABLE|FUNCTION|SCHEMA|EXTENSION))\b/i);
    // Policy expressions define the helper lookup; they do not run it during
    // migration application. Ignore those definitions and scalar text literals
    // when looking for actual application/business calls in the DO body.
    const outsidePolicies = withoutScalarText(policies.reduce((source, policy) => source.replace(policy[0], ''), sql));
    expect(outsidePolicies).not.toMatch(/\b(?:FROM|JOIN|PERFORM|CALL|SELECT)\s+(?:public|private|auth|supabase_migrations)\./i);
    expect(sql).not.toMatch(/\b(?:EXECUTE|WHEN\s+OTHERS|DISABLE\s+TRIGGER|set_config|dblink|http|net)\b/i);
  });

  it('does not edit or reconstruct immutable migrations 027–031', () => {
    const frozen = {
      '027_p49_active_profile_authorization_hardening.sql': '7b96ac17aefc96ee7a788327ddee7508e15eaec73c54f609b44adccf8159eabe',
      '028_master_catalog_admin_gate_projection.sql': '6c03dff28d6f71bc4468ba799c70f8a1a7222017353d23f6446bb4be4fb006e3',
      '029_atomic_boq_duplicate.sql': '748a84431c36bc0aa4bf3f8293aa818768d5198d9da82c9f1e0ad5106a382c3d',
      '030_boq_save_null_authorization_guard.sql': 'e6a3175413f961d24feb03dbe7f757782dd2f08710a911732531ebc9b3d9081a',
      '031_boq_duplicate_stale_conflict_guard.sql': '34c67a8d505c107a2fc86e1ecf8a9ed48a3c94a31d6d169ca016e5921463adef',
    };
    for (const [name, expected] of Object.entries(frozen)) {
      const content = readFileSync(resolve(process.cwd(), 'migrations', name));
      expect(createHash('sha256').update(content).digest('hex')).toBe(expected);
    }
  });
});
