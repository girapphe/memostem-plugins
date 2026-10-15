import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, stat, utimes, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertPortalStage, listStagedFiles, stagePortalPackage } from './lib/portal-package.mjs';
import { secretPatterns } from './lib/secret-patterns.mjs';

// Builds the OpenAI plugin portal ZIP from plugins/memostem. Output:
// dist/memostem-<version>-<shortsha>.zip (never committed). The MCP server is
// connected separately in the portal, so mcp.json ships only with --with-mcp-json.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const withMcpJson = process.argv.includes('--with-mcp-json');
const unknown = process.argv.slice(2).filter((arg) => arg !== '--with-mcp-json');
assert.deepEqual(unknown, [], `unknown arguments: ${unknown.join(' ')}`);

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', ...options });
  assert.equal(result.status, 0, `${command} ${args.join(' ')} failed: ${result.stderr || result.error}`);
  return result.stdout;
}

assert.equal(
  run('git', ['status', '--porcelain', '--untracked-files=all']).trim(),
  '',
  'working tree must be clean: commit or stash changes before packaging',
);
const shortSha = run('git', ['rev-parse', '--short=7', 'HEAD']).trim();
const version = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')).version;
const zipName = `memostem-${version}-${shortSha}${withMcpJson ? '-with-mcp-json' : ''}.zip`;
const distDir = path.join(root, 'dist');
const zipPath = path.join(distDir, zipName);

const stage = await mkdtemp(path.join(os.tmpdir(), 'memostem-portal-'));
try {
  await stagePortalPackage(root, stage, { withMcpJson });
  const files = await assertPortalStage(root, stage, version, { withMcpJson });
  for (const file of files) {
    const source = await readFile(path.join(stage, file), 'utf8');
    for (const pattern of secretPatterns) {
      assert.equal(pattern.test(source), false, `possible secret in ${file}`);
    }
  }
  // Deterministic archive: sorted names, fixed mtimes, no extra attributes.
  const fixedTime = new Date('2000-01-01T00:00:00Z');
  for (const file of files) await utimes(path.join(stage, file), fixedTime, fixedTime);
  await mkdir(distDir, { recursive: true });
  await rm(zipPath, { force: true });
  run('zip', ['-X', '-D', '-q', zipPath, '-@'], {
    cwd: stage,
    input: `${files.join('\n')}\n`,
    env: { ...process.env, TZ: 'UTC' },
  });
  assert.ok((await stat(zipPath)).isFile(), `zip was not created: ${zipPath}`);
  const listed = run('unzip', ['-Z1', zipPath]).trim().split('\n').sort();
  assert.deepEqual(listed, files, 'zip contents must match the staged file list');
  assert.deepEqual(await listStagedFiles(stage), files);

  const sha256 = createHash('sha256').update(await readFile(zipPath)).digest('hex');
  await writeFile(`${zipPath}.sha256`, `${sha256}  ${zipName}\n`);
  console.log(`Portal package: ${path.relative(root, zipPath)}`);
  console.log(`Source commit: ${shortSha} (version ${version}, mcp.json ${withMcpJson ? 'included' : 'omitted'})`);
  console.log('Files:');
  for (const file of files) console.log(`  ${file}`);
  console.log(`SHA-256: ${sha256}`);
} finally {
  await rm(stage, { recursive: true, force: true });
}
