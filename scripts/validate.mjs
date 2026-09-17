import assert from 'node:assert/strict';
import { lstat, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pluginRoot = path.join(root, 'plugins', 'memostem');
const skillsRoot = path.join(pluginRoot, 'skills');

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), 'utf8'));
}

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    const metadata = await lstat(absolute);
    assert.equal(metadata.isSymbolicLink(), false, `symlinks are not allowed: ${absolute}`);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else if (entry.isFile()) files.push(absolute);
  }
  return files;
}

const codexMarketplace = await readJson('.agents/plugins/marketplace.json');
const claudeMarketplace = await readJson('.claude-plugin/marketplace.json');
const codexManifest = await readJson('plugins/memostem/.codex-plugin/plugin.json');
const claudeManifest = await readJson('plugins/memostem/.claude-plugin/plugin.json');
const mcp = await readJson('plugins/memostem/.mcp.json');
const registryManifest = await readJson('server.json');
const packageManifest = await readJson('package.json');

assert.equal(codexMarketplace.name, 'memostem');
assert.equal(codexMarketplace.interface.displayName, 'MemoStem');
assert.equal(codexMarketplace.plugins.length, 1);
assert.deepEqual(codexMarketplace.plugins[0].source, {
  source: 'local',
  path: './plugins/memostem',
});
assert.deepEqual(codexMarketplace.plugins[0].policy, {
  installation: 'AVAILABLE',
  authentication: 'ON_INSTALL',
});

assert.equal(claudeMarketplace.name, 'memostem');
assert.equal(claudeMarketplace.plugins.length, 1);
assert.equal(claudeMarketplace.plugins[0].source, './plugins/memostem');

assert.equal(codexManifest.name, 'memostem');
// Local Codex iteration adds build metadata to refresh the installed snapshot.
// Keep the actual release version aligned with Claude and MCP Registry metadata.
const releaseVersion = codexManifest.version.replace(/\+codex\.[a-z0-9-]+$/u, '');
assert.equal(packageManifest.version, releaseVersion);
assert.equal(registryManifest.version, releaseVersion);
assert.equal(codexManifest.skills, './skills/');
assert.equal(codexManifest.mcpServers, './.mcp.json');
assert.match(codexManifest.version, /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:\+codex\.[a-z0-9-]+)?$/u);
assert.equal(codexManifest.repository, 'https://github.com/girapphe/memostem-plugins');
assert.equal(codexManifest.homepage, codexManifest.repository);
assert.equal(codexManifest.interface.websiteURL, 'https://www.memostem.com');
assert.ok(Array.isArray(codexManifest.interface.defaultPrompt));
assert.ok(codexManifest.interface.defaultPrompt.length <= 3);

for (const field of [
  'name',
  'version',
  'description',
  'author',
  'homepage',
  'repository',
  'keywords',
]) {
  assert.deepEqual(claudeManifest[field], field === 'version' ? releaseVersion : codexManifest[field], `manifest drift: ${field}`);
}
assert.equal(claudeMarketplace.plugins[0].version, releaseVersion);
assert.equal(claudeMarketplace.plugins[0].description, codexManifest.description);

assert.deepEqual(mcp, {
  mcpServers: {
    memostem: {
      type: 'http',
      url: 'https://www.memostem.com/api/mcp',
    },
  },
});

assert.equal(registryManifest.name, 'io.github.girapphe/memostem');
assert.equal(registryManifest.title, 'MemoStem');
assert.equal(typeof registryManifest.description, 'string');
assert.ok(
  registryManifest.description.length <= 100,
  'MCP Registry description must be at most 100 characters',
);
assert.deepEqual(registryManifest.repository, {
  url: 'https://github.com/girapphe/memostem-plugins',
  source: 'github',
});
assert.deepEqual(registryManifest.remotes, [{
  type: 'streamable-http',
  url: 'https://www.memostem.com/api/mcp',
}]);
assert.equal('packages' in registryManifest, false);

const readme = await readFile(path.join(root, 'README.md'), 'utf8');
const submissionKit = await readFile(path.join(root, 'docs', 'directory-submissions.md'), 'utf8');
const connectionGuide = await readFile(path.join(root, 'docs', 'mcp.md'), 'utf8');
for (const [label, source] of [['README', readme], ['connection guide', connectionGuide]]) {
  assert.ok(source.includes('codex mcp login memostem --scopes knowledge:drafts:create'), `${label} must document Codex OAuth`);
  assert.ok(source.includes('check_memostem_connection'), `${label} must document the live connection check`);
}
for (const [label, source] of [
  ['README', readme],
  ['connection guide', connectionGuide],
  ['submission kit', submissionKit],
]) {
  for (const requiredContract of [
    'get_topic_context',
    'knowledge:context:read',
    'active',
    'pending',
    'archived',
    'superseded',
    'trashed',
  ]) {
    assert.ok(source.includes(requiredContract), `${label} must describe ${requiredContract}`);
  }
  for (const defaultScope of [
    'openid',
    'knowledge:drafts:create',
    'knowledge:context:read',
  ]) {
    assert.ok(source.includes(defaultScope), `${label} must document the ${defaultScope} ChatGPT default`);
  }
  assert.match(source, /reconnect|reconsent|consent again/iu, `${label} must explain read-scope reconsent`);
  assert.doesNotMatch(source, /full-product admin override/iu, `${label} must not advertise an admin-only read gate`);
}
for (const requiredUrl of [
  'https://www.memostem.com/plugins',
  'https://www.memostem.com/privacy',
  'https://www.memostem.com/terms',
  'https://www.memostem.com/support',
  'https://www.memostem.com/api/mcp',
]) {
  assert.match(readme, new RegExp(requiredUrl.replaceAll('.', '\\.')), `README must include ${requiredUrl}`);
  assert.match(submissionKit, new RegExp(requiredUrl.replaceAll('.', '\\.')), `submission kit must include ${requiredUrl}`);
}
assert.match(submissionKit, /five|5 positive|Positive review cases/iu);
assert.match(submissionKit, /three|3 negative|Negative review cases/iu);
assert.doesNotMatch(submissionKit, /(?:password|token|secret)\s*[:=]\s*\S+/iu);

const expectedSkills = [
  'memostem-proactive-capture',
];
// Reject files and unknown skill directories as well as known maintenance
// skills: adding a new developer workflow must never expand the public package.
const skillEntries = (await readdir(skillsRoot)).sort();
assert.deepEqual(skillEntries, expectedSkills, 'public plugin may contain only memostem-proactive-capture');

for (const skill of expectedSkills) {
  const source = await readFile(path.join(skillsRoot, skill, 'SKILL.md'), 'utf8');
  assert.match(source, /^---\n[\s\S]*?\n---\n/u, `${skill} must have YAML frontmatter`);
  assert.match(source, new RegExp(`^name: ${skill}$`, 'mu'), `${skill} name must match its directory`);
  assert.match(source, /^description: .+$/mu, `${skill} must have a description`);
}

const proactiveCaptureSkill = await readFile(
  path.join(skillsRoot, 'memostem-proactive-capture', 'SKILL.md'),
  'utf8',
);
assert.match(proactiveCaptureSkill, /natural\s+stopping\s+point/iu);
assert.match(proactiveCaptureSkill, /offer itself is not consent/iu);
assert.match(proactiveCaptureSkill, /clear affirmative reply to that specific offer/iu);
assert.match(proactiveCaptureSkill, /at most one offer per topic/iu);
assert.match(proactiveCaptureSkill, /private and pending/iu);
for (const requiredContract of [
  'check_memostem_connection',
  'knowledge:drafts:create',
  'knowledge_scope: "general_knowledge"',
  'request_id',
  'bundle_count',
  'answer_summary',
  'references/atomic-memo-flashcard.json',
]) {
  assert.ok(proactiveCaptureSkill.includes(requiredContract), `capture skill must describe ${requiredContract}`);
}
const captureExample = await readJson('plugins/memostem/skills/memostem-proactive-capture/references/atomic-memo-flashcard.json');
assert.deepEqual(captureExample.bundles.map((bundle) => bundle.knowledge_type), ['concept', 'question']);
// The actual application schema validates this public fixture in the app's
// contract tests; this repository checks packaging without copying that schema.
assert.ok(codexManifest.interface.defaultPrompt.some((prompt) => prompt.includes('atomic memo')));
assert.ok(codexManifest.interface.defaultPrompt.some((prompt) => prompt.includes('connection')));
assert.ok(codexManifest.interface.defaultPrompt.some((prompt) => prompt.includes('active MemoStem knowledge')));
assert.ok(codexManifest.interface.capabilities.includes('Owner-scoped lifecycle context retrieval'));
assert.ok(codexManifest.interface.defaultPrompt.every((prompt) => !/decision draft|recall.*confirmed/iu.test(prompt)));
const proactiveCaptureAgent = await readFile(
  path.join(skillsRoot, 'memostem-proactive-capture', 'agents', 'openai.yaml'),
  'utf8',
);
assert.match(proactiveCaptureAgent, /allow_implicit_invocation:\s*true/u);

const publicFiles = await walk(root);
const trackedCandidates = publicFiles.filter((file) => !file.includes(`${path.sep}.git${path.sep}`));
const forbiddenRoots = [
  'apps/',
  'packages/',
  'migrations/',
  'drizzle/',
  'schema.sql',
];
for (const file of trackedCandidates) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  assert.equal(
    forbiddenRoots.some((prefix) => relative === prefix || relative.startsWith(prefix)),
    false,
    `private application path is not allowed: ${relative}`,
  );
}

const secretPatterns = [
  /-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----/u,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/u,
  /\bsk-[A-Za-z0-9_-]{20,}\b/u,
  /\bAKIA[0-9A-Z]{16}\b/u,
  /\bmemostem_mcp_[A-Za-z0-9_-]{12,}\b/u,
  /\b(?:DATABASE_URL|CLERK_SECRET_KEY|OPENAI_API_KEY)\s*=\s*[^$'"<\s][^\s]*/u,
];
for (const file of trackedCandidates) {
  const source = await readFile(file, 'utf8');
  for (const pattern of secretPatterns) {
    assert.equal(pattern.test(source), false, `possible secret in ${path.relative(root, file)}`);
  }
}

console.log('MemoStem public plugin boundary and manifests are valid.');
