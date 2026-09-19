import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function withTemporaryRepository(run) {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'memostem-public-boundary-'));
  try {
    await cp(root, temporaryRoot, {
      recursive: true,
      filter: (source) => !['.git', 'node_modules'].includes(path.basename(source)),
    });
    await run(temporaryRoot);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

function validate(repositoryRoot) {
  return spawnSync(process.execPath, ['scripts/validate.mjs'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  });
}

test('public validation rejects maintenance skills and unknown skills', async () => {
  await withTemporaryRepository(async (temporaryRoot) => {
    for (const skill of [
      'memostem-card-hygiene',
      'memostem-db-sync',
      'memostem-knowledge-graph',
      'memostem-protected-release',
      'memostem-validation',
      'future-developer-workflow',
    ]) {
      const forbiddenDirectory = path.join(temporaryRoot, 'plugins', 'memostem', 'skills', skill);
      await mkdir(forbiddenDirectory);
      const result = validate(temporaryRoot);
      assert.equal(result.status, 1, `validation must reject ${skill}`);
      assert.match(result.stderr, /public plugin may contain only memostem-proactive-capture/u);
      await rm(forbiddenDirectory, { recursive: true });
    }
  });
});

test('public validation rejects compatibility contract drift', async (t) => {
  const mutations = [
    ['endpoint drift', (contract) => { contract.endpoint = 'https://example.com/api/mcp'; }],
    ['tool drift', (contract) => { contract.required_tools.pop(); }],
    ['fixture drift', (contract) => { contract.fixtures.create_knowledge_bundle_drafts = 'missing.json'; }],
  ];

  for (const [name, mutate] of mutations) {
    await t.test(name, async () => {
      await withTemporaryRepository(async (temporaryRoot) => {
        const contractPath = path.join(temporaryRoot, 'contracts', 'mcp-compatibility.json');
        const contract = JSON.parse(await readFile(contractPath, 'utf8'));
        mutate(contract);
        await writeFile(contractPath, `${JSON.stringify(contract, null, 2)}\n`);
        const result = validate(temporaryRoot);
        assert.equal(result.status, 1, `validation must reject ${name}`);
      });
    });
  }
});
