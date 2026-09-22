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
    ['missing MCP Apps contract', (contract) => { delete contract.mcp_apps; }],
    ['UI resource drift', (contract) => { contract.mcp_apps.resource_uri = 'ui://memostem/missing.html'; }],
    ['UI MIME drift', (contract) => { contract.mcp_apps.mime_type = 'text/html'; }],
    ['review tool drift', (contract) => { contract.mcp_apps.review_tool = 'create_card_drafts'; }],
    ['UI action drift', (contract) => { contract.mcp_apps.create_tool = 'create_card_drafts'; }],
    ['missing text fallback', (contract) => { delete contract.mcp_apps.fallback; }],
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

test('public validation rejects an incomplete submission readiness contract', async (t) => {
  const temporaryRoot = await copyRepository(t, 'submission-readiness');
  const readinessPath = path.join(temporaryRoot, 'docs', 'submission-readiness.md');
  const readiness = await readFile(readinessPath, 'utf8');
  await writeFile(
    readinessPath,
    readiness.replace('Apps Management write access', 'provider portal access'),
  );
  const result = runValidation(temporaryRoot);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /submission readiness must describe Apps Management write access/u);
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

test('public validation rejects loss of retrieval permission or read-only boundary', async (t) => {
  for (const phrase of ['knowledge:context:read', 'must not create drafts']) {
    await t.test(phrase, async (subtest) => {
      const temporaryRoot = await copyRepository(subtest, 'retrieval-contract');
      const skillPath = path.join(temporaryRoot, 'plugins/memostem/skills/memostem-proactive-capture/SKILL.md');
      const skill = await readFile(skillPath, 'utf8');
      await writeFile(skillPath, skill.replaceAll(phrase, 'removed-boundary'));
      const result = runValidation(temporaryRoot);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /capture skill must describe/u);
    });
  }
});

test('portable manifests reject schema, metadata, transport and path drift', async (t) => {
  const cases = [
    ['plugin schema missing', 'plugin.json', d => { delete d.$schema; }],
    ['plugin schema version', 'plugin.json', d => { d.$schema = 'https://agent-plugins.org/schemas/9.0.0/plugin.schema.json'; }],
    ['name missing', 'plugin.json', d => { delete d.name; }],
    ['name drift', 'plugin.json', d => { d.name = 'another-plugin'; }],
    ['release drift', 'plugin.json', d => { d.version = '9.9.9'; }],
    ['description drift', 'plugin.json', d => { d.description = 'Different product'; }],
    ['external skills path', 'plugin.json', d => { d.skills = '../private/skills'; }],
    ['external MCP path', 'plugin.json', d => { d.mcpServers = '../private/mcp.json'; }],
    ['inline MCP', 'plugin.json', d => { d.mcpServers = { memostem: {} }; }],
    ['MCP schema missing', 'mcp.json', d => { delete d.$schema; }],
    ['MCP schema mismatch', 'mcp.json', d => { d.$schema = 'https://agent-plugins.org/schemas/9.0.0/mcp.schema.json'; }],
    ['servers missing', 'mcp.json', d => { delete d.mcpServers; }],
    ['endpoint drift', 'mcp.json', d => { d.mcpServers.memostem.url = 'https://example.com/mcp'; }],
    ['native transport in portable config', 'mcp.json', d => { d.mcpServers.memostem.type = 'http'; }],
    ['missing transport', 'mcp.json', d => { delete d.mcpServers.memostem.type; }],
    ['credential header', 'mcp.json', d => { d.mcpServers.memostem.headers = { Authorization: 'Bearer example-only' }; }],
    ['extra server', 'mcp.json', d => { d.mcpServers.other = { type: 'stdio', command: '../private/server' }; }],
  ];
  for (const [name, file, mutate] of cases) {
    await t.test(name, async (subtest) => {
      const temporaryRoot = await copyRepository(subtest, 'portable');
      const filename = path.join(temporaryRoot, 'plugins/memostem', file);
      const manifest = JSON.parse(await readFile(filename, 'utf8'));
      mutate(manifest);
      await writeFile(filename, JSON.stringify(manifest));
      const result = runValidation(temporaryRoot);
      assert.equal(result.status, 1, name);
      assert.match(result.stderr, /portable manifest|portable MCP/u);
    });
  }
});

test('native adapter retains http transport', async (t) => {
  const temporaryRoot = await copyRepository(t, 'native-transport');
  const filename = path.join(temporaryRoot, 'plugins/memostem/.mcp.json');
  const config = JSON.parse(await readFile(filename, 'utf8'));
  config.mcpServers.memostem.type = 'streamable-http';
  await writeFile(filename, JSON.stringify(config));
  assert.equal(runValidation(temporaryRoot).status, 1);
});

test('ChatGPT web package rejects direct MCP declarations and App-reference drift', async (t) => {
  const cases = [
    ['direct portable MCP', async (temporaryRoot) => {
      await writeFile(
        path.join(temporaryRoot, 'plugins/memostem-chatgpt/mcp.json'),
        JSON.stringify({ mcpServers: { memostem: { type: 'streamable-http', url: 'https://www.memostem.com/api/mcp' } } }),
      );
    }],
    ['direct native MCP', async (temporaryRoot) => {
      await writeFile(
        path.join(temporaryRoot, 'plugins/memostem-chatgpt/.mcp.json'),
        JSON.stringify({ mcpServers: { memostem: { type: 'http', url: 'https://www.memostem.com/api/mcp' } } }),
      );
    }],
    ['App identifier drift', async (temporaryRoot) => {
      const filename = path.join(temporaryRoot, 'plugins/memostem-chatgpt/.app.json');
      const manifest = JSON.parse(await readFile(filename, 'utf8'));
      manifest.apps.memostem.id = 'plugin_not_an_app_id';
      await writeFile(filename, JSON.stringify(manifest));
    }],
  ];
  for (const [name, mutate] of cases) {
    await t.test(name, async (subtest) => {
      const temporaryRoot = await copyRepository(subtest, `chatgpt-web-${name.replaceAll(' ', '-')}`);
      await mutate(temporaryRoot);
      const result = runValidation(temporaryRoot);
      assert.equal(result.status, 1, name);
    });
  }
});

test('portable package rejects external symlink and embedded credentials', async (t) => {
  await t.test('external symlink', async (subtest) => {
    const temporaryRoot = await copyRepository(subtest, 'portable-link');
    await symlink(root, path.join(temporaryRoot, 'plugins/memostem/external'));
    const result = runValidation(temporaryRoot);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /symlinks are not allowed/u);
  });
  await t.test('credential in shared skill reference', async (subtest) => {
    const temporaryRoot = await copyRepository(subtest, 'portable-secret');
    const name = ['OPENAI', 'API', 'KEY'].join('_');
    await writeFile(path.join(temporaryRoot, 'plugins/memostem/skills/memostem-proactive-capture/references/leak.txt'), `${name}=example-only`);
    const result = runValidation(temporaryRoot);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /possible secret/u);
  });
});
