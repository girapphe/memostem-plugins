import assert from 'node:assert/strict';
import { cp, lstat, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// The OpenAI plugin portal takes a ZIP whose skills live inside the archive;
// the MCP server is connected separately (With MCP, Universal URL). The ZIP is
// staged from plugins/memostem only: no committed third copy exists.

export const portalRootEntries = ['assets', 'plugin.json', 'skills'];
export const portalForbiddenNames = ['hooks', '.app.json', '.claude-plugin', '.codex-plugin', '.mcp.json'];
// The public directory listing is "MemoStem"; "for ChatGPT" only tells the
// marketplace package apart from the main plugin in a Codex marketplace.
const portalDisplayName = 'MemoStem';
const forbiddenManifestKeys = ['clientSecret', 'test_credentials', 'reviewer_instructions'];

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

async function walkFiles(directory, base = directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    const metadata = await lstat(absolute);
    assert.equal(metadata.isSymbolicLink(), false, `symlinks are not allowed: ${absolute}`);
    if (entry.isDirectory()) files.push(...await walkFiles(absolute, base));
    else if (entry.isFile()) files.push(path.relative(base, absolute).split(path.sep).join('/'));
  }
  return files.sort();
}

export async function listStagedFiles(stageDir) {
  return walkFiles(stageDir);
}

// An existing portal listing requires the ZIP `name` to equal its portal-issued
// plugin ID. That ID stays in the portal and is passed at build time, never committed.
export function assertPortalName(name) {
  assert.match(name, /^[a-z0-9][a-z0-9-]{0,127}$/u, `invalid portal plugin name: ${name}`);
}

export async function buildPortalManifest(root, { name } = {}) {
  const source = await readJson(path.join(root, 'plugins/memostem/plugin.json'));
  const chatgpt = await readJson(path.join(root, 'plugins/memostem-chatgpt/plugin.json'));
  const { apps: _apps, ...interfaceOnly } = chatgpt.extensions['com.openai'];
  if (name !== undefined) assertPortalName(name);
  const openai = { ...interfaceOnly, interface: { ...interfaceOnly.interface, displayName: portalDisplayName } };
  return { ...source, ...(name === undefined ? {} : { name }), extensions: { 'com.openai': openai } };
}

// The portal reads each server's auth from mcp.json: guest tools work
// unauthenticated and the rest need OAuth with dynamic client registration.
export async function buildPortalMcp(root) {
  const portable = await readJson(path.join(root, 'plugins/memostem/mcp.json'));
  const contract = await readJson(path.join(root, 'contracts/mcp-compatibility.json'));
  const server = portable.mcpServers.memostem;
  const auth = { type: 'mixed', client: { mode: 'dcr' }, baseScopes: contract.oauth_scopes };
  return { ...portable, mcpServers: { memostem: { ...server, extensions: { 'com.openai': { auth } } } } };
}

export async function stagePortalPackage(root, stageDir, { withMcpJson = false, name } = {}) {
  const pluginRoot = path.join(root, 'plugins/memostem');
  await mkdir(stageDir, { recursive: true });
  await cp(path.join(pluginRoot, 'skills'), path.join(stageDir, 'skills'), { recursive: true });
  await cp(path.join(pluginRoot, 'assets'), path.join(stageDir, 'assets'), { recursive: true });
  await writeFile(
    path.join(stageDir, 'plugin.json'),
    `${JSON.stringify(await buildPortalManifest(root, { name }), null, 2)}\n`,
  );
  if (withMcpJson) {
    await writeFile(path.join(stageDir, 'mcp.json'), `${JSON.stringify(await buildPortalMcp(root), null, 2)}\n`);
  }
}

function findForbidden(value, trail = []) {
  const problems = [];
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      const here = [...trail, key].join('.');
      if (forbiddenManifestKeys.includes(key)) problems.push(here);
      if (key === 'headers' && child && Object.keys(child).length > 0) problems.push(here);
      if (key === 'apps') problems.push(here);
      problems.push(...findForbidden(child, [...trail, key]));
    }
  }
  return problems;
}

export function assertPortalManifest(manifest, packageVersion, label = 'portal manifest') {
  assert.equal(manifest.version, packageVersion, `${label} version must equal the package version`);
  const problems = findForbidden(manifest);
  assert.deepEqual(problems, [], `${label} must have no apps, secrets or headers: ${problems.join(', ')}`);
}

// Asserts the staged tree is exactly the distributable portal package.
export async function assertPortalStage(root, stageDir, packageVersion, { withMcpJson = false, name } = {}) {
  const expectedRoot = withMcpJson ? [...portalRootEntries, 'mcp.json'].sort() : portalRootEntries;
  assert.deepEqual((await readdir(stageDir)).sort(), expectedRoot, 'portal package root must contain only the allowed entries');
  const files = await listStagedFiles(stageDir);
  for (const file of files) {
    const segments = file.split('/');
    for (const forbidden of portalForbiddenNames) {
      assert.equal(segments.includes(forbidden), false, `portal package must not contain ${forbidden}: ${file}`);
    }
  }
  assert.deepEqual((await readdir(path.join(stageDir, 'skills'))).sort(), ['memostem'], 'portal package must contain exactly one skill: memostem');

  // Skills must be byte-identical to the single authoring source.
  const sourceSkills = path.join(root, 'plugins/memostem/skills');
  const sourceFiles = await walkFiles(sourceSkills);
  const stagedSkillFiles = files.filter((file) => file.startsWith('skills/')).map((file) => file.slice('skills/'.length));
  assert.deepEqual(stagedSkillFiles, sourceFiles, 'portal skill inventory must match plugins/memostem/skills');
  for (const file of sourceFiles) {
    assert.deepEqual(
      await readFile(path.join(stageDir, 'skills', file)),
      await readFile(path.join(sourceSkills, file)),
      `portal skill drift: ${file}`,
    );
  }

  const manifest = await readJson(path.join(stageDir, 'plugin.json'));
  assertPortalManifest(manifest, packageVersion);
  const sourceManifest = await readJson(path.join(root, 'plugins/memostem/plugin.json'));
  const chatgptManifest = await readJson(path.join(root, 'plugins/memostem-chatgpt/plugin.json'));
  const { apps: _apps, ...chatgptOpenai } = chatgptManifest.extensions['com.openai'];
  const expectedInterface = { ...chatgptOpenai, interface: { ...chatgptOpenai.interface, displayName: portalDisplayName } };
  assert.deepEqual(
    manifest,
    { ...sourceManifest, ...(name === undefined ? {} : { name }), extensions: { 'com.openai': expectedInterface } },
    'portal manifest must be the portable manifest plus the OpenAI interface only',
  );
  const logo = manifest.extensions['com.openai'].interface.logo;
  assert.ok(files.includes(logo.replace(/^\.\//u, '')), `portal manifest logo must be packaged: ${logo}`);

  if (withMcpJson) {
    assert.deepEqual(
      await readJson(path.join(stageDir, 'mcp.json')),
      await buildPortalMcp(root),
      'portal mcp.json must be the portable MCP config plus mixed OAuth',
    );
  }
  return files;
}
