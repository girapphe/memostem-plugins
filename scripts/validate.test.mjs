import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function copyRepository(t, label) {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), `memostem-${label}-`));
  t.after(() => rm(temporaryRoot, { recursive: true, force: true }));
  await cp(root, temporaryRoot, { recursive: true, filter: (source) => !['.git', 'node_modules'].includes(path.basename(source)) });
  return temporaryRoot;
}

function runValidation(cwd) {
  return spawnSync(process.execPath, ['scripts/validate.mjs'], { cwd, encoding: 'utf8' });
}

test('current public package passes the complete validator', () => {
  const result = runValidation(root);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /public plugin boundary and manifests are valid/u);
});

test('public validation rejects maintenance skills and unknown skills', async (t) => {
  const temporaryRoot = await copyRepository(t, 'public-boundary');
  for (const skill of ['memostem-card-hygiene', 'memostem-db-sync', 'memostem-knowledge-graph', 'memostem-protected-release', 'memostem-validation', 'future-developer-workflow']) {
    const forbiddenDirectory = path.join(temporaryRoot, 'plugins', 'memostem', 'skills', skill);
    await mkdir(forbiddenDirectory);
    const result = runValidation(temporaryRoot);
    assert.equal(result.status, 1, `validation must reject ${skill}`);
    assert.match(result.stderr, /public plugin may contain only memostem-proactive-capture/u);
    await rm(forbiddenDirectory, { recursive: true });
  }
});

test('public validation rejects compatibility contract drift', async (t) => {
  const mutations = [
    ['endpoint drift', (contract) => { contract.endpoint = 'https://example.com/api/mcp'; }],
    ['tool drift', (contract) => { contract.required_tools.pop(); }],
    ['fixture drift', (contract) => { contract.fixtures.create_knowledge_bundle_drafts = 'missing.json'; }],
  ];
  for (const [name, mutate] of mutations) {
    await t.test(name, async (subtest) => {
      const temporaryRoot = await copyRepository(subtest, `compatibility-${name.replaceAll(' ', '-')}`);
      const contractPath = path.join(temporaryRoot, 'contracts', 'mcp-compatibility.json');
      const contract = JSON.parse(await readFile(contractPath, 'utf8'));
      mutate(contract);
      await writeFile(contractPath, `${JSON.stringify(contract, null, 2)}\n`);
      const result = runValidation(temporaryRoot);
      assert.equal(result.status, 1, `validation must reject ${name}`);
    });
  }
});

test('public validation rejects release version drift', async (t) => {
  const temporaryRoot = await copyRepository(t, 'version-drift');
  const registryPath = path.join(temporaryRoot, 'server.json');
  const registry = JSON.parse(await readFile(registryPath, 'utf8'));
  registry.version = '9.9.9';
  await writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
  const result = runValidation(temporaryRoot);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /9\.9\.9/u);
});

test('public validation rejects weakened consent instructions', async (t) => {
  const temporaryRoot = await copyRepository(t, 'consent-contract');
  const skillPath = path.join(temporaryRoot, 'plugins', 'memostem', 'skills', 'memostem-proactive-capture', 'SKILL.md');
  const skill = await readFile(skillPath, 'utf8');
  await writeFile(skillPath, skill.replace('The offer itself is not consent.', 'The offer starts capture.'));
  const result = runValidation(temporaryRoot);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /offer itself is not consent/u);
});

test('public validation rejects private application paths and credential-shaped values', async (t) => {
  await t.test('private path', async (subtest) => {
    const temporaryRoot = await copyRepository(subtest, 'private-path');
    await mkdir(path.join(temporaryRoot, 'apps', 'web'), { recursive: true });
    await writeFile(path.join(temporaryRoot, 'apps', 'web', 'route.ts'), 'export const privateRoute = true;\n');
    const result = runValidation(temporaryRoot);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /private application path is not allowed/u);
  });
  await t.test('credential-shaped value', async (subtest) => {
    const temporaryRoot = await copyRepository(subtest, 'secret-pattern');
    const credentialName = ['OPENAI', 'API', 'KEY'].join('_');
    await writeFile(path.join(temporaryRoot, 'leaked.env'), `${credentialName}=not-a-real-key\n`);
    const result = runValidation(temporaryRoot);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /possible secret/u);
  });
});

test('public validation rejects symlinks from the distributable tree', async (t) => {
  const temporaryRoot = await copyRepository(t, 'symlink');
  await symlink(path.join(temporaryRoot, 'README.md'), path.join(temporaryRoot, 'plugins', 'memostem', 'README-link.md'));
  const result = runValidation(temporaryRoot);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /symlinks are not allowed/u);
});
