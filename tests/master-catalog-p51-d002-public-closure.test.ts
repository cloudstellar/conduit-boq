import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { extname, posix, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = resolve(import.meta.dirname, '..');
const PUBLIC_CANDIDATE_PATHS = [
  'app/admin/master-catalog/_components/MasterCatalogAdminViews.tsx',
  'app/admin/master-catalog/_components/MasterCatalogP51D002OptionAPanel.tsx',
  'app/admin/master-catalog/actions.ts',
  'lib/master-catalog/admin/actionModel.ts',
  'lib/master-catalog/admin/p51D002OptionABatch.server.ts',
  'tests/master-catalog-p51-d002-batch-transport.test.ts',
  'tests/master-catalog-p51-d002-public-closure.test.ts',
] as const;
const PUBLIC_CANDIDATES = new Set<string>(PUBLIC_CANDIDATE_PATHS);
const PUBLIC_RUNTIME_PATHS = PUBLIC_CANDIDATE_PATHS.filter((path) => (
  !path.startsWith('tests/')
));
const PUBLIC_SCAN_PATHS = PUBLIC_CANDIDATE_PATHS.filter((path) => (
  path !== 'tests/master-catalog-p51-d002-public-closure.test.ts'
));
const FORBIDDEN_PRIVATE_REFERENCES = [
  'p51-d002-option-a-application-v1',
  'p51-d002-read-only-preimage-v2',
  'forward-rpc-args',
  'inverse-rpc-args',
  'build-master-catalog-p51-d002-application-payload',
  'master-catalog-authority-consistency.test',
  '90-phase4-p51-d002',
  '91-phase4-p51-d002',
  '92-phase4-p51-d002',
  '93-phase4-p51-d002',
];
const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json'];
const UUID_SOURCE =
  '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}';
const UUID_PATTERN = new RegExp(UUID_SOURCE, 'g');
const SAFE_NON_OPERATIONAL_TEST_UUIDS = new Set([
  '00000000-0000-4000-8000-000000000000',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002',
  '52e4c437-5218-5571-91e1-b60827b2ad61',
]);

function gitText(args: string[]): string {
  return execFileSync('git', args, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
}

function extractMatches(source: string, pattern: RegExp): Set<string> {
  return new Set([...source.matchAll(pattern)].map((match) => match[0].toLowerCase()));
}

function readVirtualSnapshotFile(path: string): string {
  if (PUBLIC_CANDIDATES.has(path)) {
    return readFileSync(resolve(ROOT, path), 'utf8');
  }
  return gitText(['show', `HEAD:${path}`]);
}

function candidatePathsForImport(importer: string, specifier: string): string[] {
  let base: string;
  if (specifier.startsWith('@/')) {
    base = specifier.slice(2);
  } else if (specifier.startsWith('.')) {
    base = posix.normalize(posix.join(posix.dirname(importer), specifier));
  } else {
    return [];
  }

  if (SOURCE_EXTENSIONS.includes(extname(base))) return [base];
  return [
    ...SOURCE_EXTENSIONS.map((extension) => `${base}${extension}`),
    ...SOURCE_EXTENSIONS.map((extension) => posix.join(base, `index${extension}`)),
  ];
}

function localSpecifiers(source: string): string[] {
  const specifiers = new Set<string>();
  const patterns = [
    /\b(?:import|export)\s+(?:type\s+)?(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) specifiers.add(match[1]);
  }
  return [...specifiers].filter((specifier) => (
    specifier.startsWith('.') || specifier.startsWith('@/')
  ));
}

describe('P-51 D002 public candidate closure', () => {
  it('forms a dependency-closed virtual clean snapshot from HEAD plus the exact allowlist', () => {
    const headPaths = new Set(
      gitText(['ls-tree', '-r', '--name-only', 'HEAD']).trim().split('\n'),
    );
    const availablePaths = new Set([...headPaths, ...PUBLIC_CANDIDATE_PATHS]);
    const pending: string[] = [...PUBLIC_CANDIDATE_PATHS];
    const visited = new Set<string>();
    const missing: Array<{ importer: string; specifier: string }> = [];

    while (pending.length > 0) {
      const path = pending.pop();
      if (!path || visited.has(path) || !SOURCE_EXTENSIONS.includes(extname(path))) continue;
      visited.add(path);
      const source = readVirtualSnapshotFile(path);

      for (const specifier of localSpecifiers(source)) {
        const resolvedPath = candidatePathsForImport(path, specifier)
          .find((candidate) => availablePaths.has(candidate));
        if (!resolvedPath) {
          missing.push({ importer: path, specifier });
          continue;
        }
        if (!visited.has(resolvedPath)) pending.push(resolvedPath);
      }
    }

    expect(missing).toEqual([]);
    expect(visited).toContain(
      'docs/plans/master-catalog/evidence/p51-option-a-v1/diff.json',
    );
    expect(visited).not.toContain(
      'docs/plans/master-catalog/evidence/p51-d002-option-a-application-v1/forward-rpc-args.json',
    );
  });

  it('contains no private-history dependency, live binding export, or credential pattern', () => {
    const scannedCandidate = PUBLIC_SCAN_PATHS
      .map((path) => readFileSync(resolve(ROOT, path), 'utf8'))
      .join('\n');
    const runtimeCandidate = PUBLIC_RUNTIME_PATHS
      .map((path) => readFileSync(resolve(ROOT, path), 'utf8'))
      .join('\n');

    for (const forbidden of FORBIDDEN_PRIVATE_REFERENCES) {
      expect(scannedCandidate).not.toContain(forbidden);
    }
    expect(scannedCandidate).not.toMatch(/P51_D002_(?:DRAFT_ID|FORWARD_REQUEST_ID)/);
    expect(runtimeCandidate).not.toMatch(/SUPABASE_SERVICE_ROLE_KEY|service_role|BEGIN PRIVATE KEY|execute_sql/);
    expect(runtimeCandidate).not.toMatch(/(?:password|secret|api[_-]?key)\s*[:=]\s*['"][^'"]+['"]/i);

    const focusedTest = readFileSync(
      resolve(ROOT, 'tests/master-catalog-p51-d002-batch-transport.test.ts'),
      'utf8',
    );
    const explicitReadTargets = [
      ...focusedTest.matchAll(/resolve\(\s*ROOT,\s*'([^']+)'\s*\)/g),
    ].map((match) => match[1]);
    const headPaths = new Set(
      gitText(['ls-tree', '-r', '--name-only', 'HEAD']).trim().split('\n'),
    );
    const availablePaths = new Set([...headPaths, ...PUBLIC_CANDIDATE_PATHS]);
    expect(explicitReadTargets.length).toBeGreaterThan(0);
    expect(explicitReadTargets.every((path) => availablePaths.has(path))).toBe(true);
    expect(explicitReadTargets).not.toContain(
      'docs/plans/master-catalog/evidence/p51-d002-option-a-application-v1/forward-rpc-args.json',
    );
  });

  it('introduces no operational UUID, account, personal, or BOQ identifier beyond HEAD', () => {
    const candidateText = PUBLIC_CANDIDATE_PATHS
      .map((path) => readFileSync(resolve(ROOT, path), 'utf8'))
      .join('\n');
    const headUuidText = gitText([
      'grep',
      '-I',
      '-h',
      '-E',
      UUID_SOURCE,
      'HEAD',
      '--',
      '.',
    ]);
    const headUuids = extractMatches(headUuidText, UUID_PATTERN);
    const candidateUuids = extractMatches(candidateText, UUID_PATTERN);
    const newlyIntroducedUuids = [...candidateUuids]
      .filter((uuid) => !headUuids.has(uuid))
      .sort();

    expect(newlyIntroducedUuids.every((uuid) => (
      SAFE_NON_OPERATIONAL_TEST_UUIDS.has(uuid)
    ))).toBe(true);
    expect(candidateUuids).toContain(
      '00000000-0000-4000-8000-000000000000',
    );
    expect(candidateUuids).toContain(
      '52e4c437-5218-5571-91e1-b60827b2ad61',
    );

    const identifierPatterns = [
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
      /\bBOQ-[A-Z0-9][A-Z0-9-]*\b/g,
      /\b[0-9]{13}\b/g,
    ];
    const headText = gitText(['grep', '-I', '-h', '-e', '.', 'HEAD', '--', '.']);
    for (const pattern of identifierPatterns) {
      const headIdentifiers = extractMatches(headText, pattern);
      const newIdentifiers = [...extractMatches(candidateText, pattern)]
        .filter((identifier) => !headIdentifiers.has(identifier));
      expect(newIdentifiers).toEqual([]);
    }
  });

  it('keeps every candidate path outside protected and private governance roots', () => {
    for (const path of PUBLIC_CANDIDATE_PATHS) {
      expect(path).not.toMatch(/^(?:files|output|outputs|tmp)\//);
      expect(path).not.toMatch(/^docs\/plans\/master-catalog\/(?:00|12|13|15|19|23|25|48|9[0-3])-/);
      expect(existsSync(resolve(ROOT, path))).toBe(true);
    }
  });
});
