import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const sql = readFileSync(resolve(process.cwd(), 'migrations/030_boq_save_null_authorization_guard.sql'), 'utf8');
const predecessor = readFileSync(resolve(process.cwd(), 'migrations/027_p49_active_profile_authorization_hardening.sql'), 'utf8');
const executableSql = sql.replace(/--[^\n]*/g, '');

function constant(name: string): string {
  const value = sql.match(new RegExp(`${name} constant text := '([^']*)';`))?.[1];
  if (value === undefined) throw new Error(`Missing migration constant: ${name}`);
  return value;
}

function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function predecessorDefinition(): string {
  const functionStart = predecessor.indexOf('CREATE OR REPLACE FUNCTION public.save_boq_with_routes(');
  if (functionStart === -1) throw new Error('Missing immutable predecessor function');
  const bodyStart = predecessor.indexOf('AS $function$', functionStart) + 'AS $function$'.length;
  const bodyEnd = predecessor.indexOf('$function$;', bodyStart);
  if (bodyEnd === -1) throw new Error('Missing predecessor body terminator');
  const body = predecessor.slice(bodyStart, bodyEnd);

  // pg_get_functiondef canonicalizes the DDL header. Derive its body directly
  // from immutable 027 instead of maintaining a second full function snapshot.
  return [
    'CREATE OR REPLACE FUNCTION public.save_boq_with_routes(p_boq_id uuid, p_boq_data jsonb, p_routes jsonb)',
    ' RETURNS jsonb',
    ' LANGUAGE plpgsql',
    ' SECURITY DEFINER',
    " SET search_path TO ''",
    " SET lock_timeout TO '5s'",
    " SET statement_timeout TO '30s'",
    `AS $function$${body}$function$`,
    '',
  ].join('\n');
}

describe('BOQ Save NULL authorization forward migration', () => {
  it('pins the exact immutable predecessor and derives only the final guard replacement', () => {
    const before = predecessorDefinition();
    const oldGuard = constant('c_old_guard');
    const newGuard = constant('c_new_guard');
    expect(oldGuard).toBe('IF NOT v_is_authorized THEN');
    expect(newGuard).toBe('IF v_is_authorized IS NOT TRUE THEN');
    expect(before.split(oldGuard)).toHaveLength(2);
    expect(sha256(before)).toBe(constant('c_pre_sha256'));

    const after = before.replace(oldGuard, newGuard);
    expect(sha256(after)).toBe(constant('c_post_sha256'));
    expect(after.replace(newGuard, oldGuard)).toBe(before);
    expect(after.split(newGuard)).toHaveLength(2);
  });

  it('rejects drift and replay before executing exactly one checked definition', () => {
    const executeAt = executableSql.indexOf('EXECUTE v_patched_definition;');
    for (const check of [
      'IF v_sha256 = c_post_sha256 THEN',
      'IF v_sha256 IS DISTINCT FROM c_pre_sha256 THEN',
      'IF v_guard_count IS DISTINCT FROM 1 THEN',
      'IF v_sha256 IS DISTINCT FROM c_post_sha256 THEN',
    ]) {
      expect(executableSql.indexOf(check)).toBeGreaterThan(-1);
      expect(executableSql.indexOf(check)).toBeLessThan(executeAt);
    }
    expect(executableSql.match(/\bEXECUTE\s+v_patched_definition;/g)).toHaveLength(1);
    expect(executableSql).toContain('v_patched_definition := pg_catalog.replace(v_definition, c_old_guard, c_new_guard);');
    expect(executableSql.lastIndexOf('IF v_sha256 IS DISTINCT FROM c_post_sha256 THEN')).toBeGreaterThan(executeAt);
  });

  it('requires exact privileged posture and verifies all function metadata except the changed body', () => {
    expect(constant('c_signature')).toBe('public.save_boq_with_routes(uuid,jsonb,jsonb)');
    expect(executableSql).toContain("IF session_user <> 'postgres' OR current_user <> 'postgres' THEN");
    expect(executableSql).toContain("pg_catalog.pg_get_userbyid(v_before.proowner) IS DISTINCT FROM 'postgres'");
    expect(executableSql).toContain('v_before.prosecdef IS DISTINCT FROM true');
    expect(executableSql).toContain("v_acl IS DISTINCT FROM ARRAY['authenticated=X/postgres', 'postgres=X/postgres']::text[]");
    expect(executableSql).toContain("'search_path=\"\"', 'lock_timeout=5s', 'statement_timeout=30s'");
    expect(executableSql).toContain("(pg_catalog.to_jsonb(v_after) - 'prosrc')\n     IS DISTINCT FROM (pg_catalog.to_jsonb(v_before) - 'prosrc')");
    expect(executableSql).not.toMatch(/\b(?:GRANT|REVOKE|ALTER\s+FUNCTION)\b/i);
  });

  it('contains one atomic metadata-only operation without business calls, ledger writes, or extension dependencies', () => {
    expect(executableSql.match(/^BEGIN;$/gm)).toHaveLength(1);
    expect(executableSql.match(/^COMMIT;$/gm)).toHaveLength(1);
    expect(executableSql.match(/^DO \$boq_save_null_authorization_guard\$/gm)).toHaveLength(1);
    expect(executableSql).toContain("SET LOCAL lock_timeout = '5s';");
    expect(executableSql).toContain("SET LOCAL statement_timeout = '60s';");
    expect(executableSql).toContain('pg_catalog.pg_advisory_xact_lock(');
    expect(executableSql).toContain("pg_catalog.sha256(pg_catalog.convert_to(v_definition, 'UTF8'))");
    expect(executableSql).not.toMatch(/\b(?:INSERT\s+INTO|UPDATE\s+|DELETE\s+FROM|TRUNCATE\s+|CREATE\s+(?:TABLE|FUNCTION|EXTENSION)|DROP\s+)\b/i);
    expect(executableSql).not.toMatch(/\b(?:FROM|JOIN|PERFORM|SELECT)\s+(?:public|private|supabase_migrations)\./i);
    expect(executableSql).not.toMatch(/\b(?:digest|dblink|http|net)\s*\(/i);
    expect(executableSql).not.toMatch(/\bWHEN\s+OTHERS\b/i);
  });
});
