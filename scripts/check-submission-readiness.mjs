import assert from 'node:assert/strict';

const origin = 'https://www.memostem.com';
const mcpUrl = `${origin}/api/mcp`;

async function expectPublicUrl(pathname, expectedType) {
  const response = await fetch(`${origin}${pathname}`, { redirect: 'follow' });
  assert.equal(response.status, 200, `${pathname} must return 200`);
  assert.match(response.headers.get('content-type') ?? '', expectedType);
  await response.body?.cancel();
  console.log(`[OK] ${pathname} -> 200`);
}

async function mcpRequest(id, method, params = {}) {
  const response = await fetch(mcpUrl, {
    method: 'POST',
    headers: {
      accept: 'application/json, text/event-stream',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
  });
  assert.equal(response.status, 200, `${method} must return 200`);
  const data = (await response.text())
    .split('\n')
    .find((line) => line.startsWith('data: '))
    ?.slice('data: '.length);
  assert.ok(data, `${method} must return an SSE data event`);
  const payload = JSON.parse(data);
  assert.equal(payload.jsonrpc, '2.0');
  assert.equal(payload.id, id);
  assert.equal(payload.error, undefined, `${method} must not return an error`);
  return payload.result;
}

for (const [pathname, expectedType] of [
  ['/plugins', /text\/html/u],
  ['/privacy', /text\/html/u],
  ['/terms', /text\/html/u],
  ['/support', /text\/html/u],
  ['/icon-512.png', /image\/png/u],
]) await expectPublicUrl(pathname, expectedType);

const health = await fetch(`${origin}/api/health`).then((response) => response.json());
assert.equal(health.status, 'ok');
assert.equal(health.mode, 'database');
assert.equal(health.database, 'connected');
assert.match(health.revision, /^[0-9a-f]{40}$/u);
console.log(`[OK] production health revision ${health.revision}`);

const initialization = await mcpRequest(1, 'initialize', {
  protocolVersion: '2025-03-26',
  capabilities: {},
  clientInfo: { name: 'memostem-submission-readiness', version: '0.1.0' },
});
assert.equal(initialization.protocolVersion, '2025-03-26');
assert.equal(initialization.serverInfo.name, 'memostem-knowledge-drafts');
assert.equal(initialization.capabilities.tools.listChanged, true);
assert.equal(initialization.capabilities.resources.listChanged, true);
console.log('[OK] MCP initialize');

const tools = (await mcpRequest(2, 'tools/list')).tools;
assert.deepEqual(tools.map((tool) => tool.name).sort(), [
  'check_memostem_connection',
  'claim_guest_knowledge_workspace',
  'create_card_drafts',
  'create_knowledge_bundle_drafts',
  'preview_knowledge_bundle',
  'save_guest_knowledge_bundles',
  'validate_knowledge_bundle',
]);
for (const tool of tools) {
  assert.ok(tool.title, `${tool.name} must have a title`);
  for (const annotation of ['readOnlyHint', 'destructiveHint', 'idempotentHint', 'openWorldHint']) {
    assert.equal(typeof tool.annotations?.[annotation], 'boolean', `${tool.name} must declare ${annotation}`);
  }
}
console.log(`[OK] ${tools.length} anonymous/reviewer-entry tools have titles and annotations`);

const resources = (await mcpRequest(3, 'resources/list')).resources;
assert.deepEqual(resources.map((resource) => resource.uri), [
  'ui://memostem/knowledge-candidate-picker.html',
]);
const resource = (await mcpRequest(4, 'resources/read', { uri: resources[0].uri })).contents[0];
assert.equal(resource.mimeType, 'text/html;profile=mcp-app');
assert.deepEqual(resource._meta?.ui?.csp, {
  connectDomains: [], resourceDomains: [], frameDomains: [], baseUriDomains: [],
});
console.log('[OK] MCP App resource and exact empty-domain CSP');

const protectedResource = await fetch(
  `${origin}/.well-known/oauth-protected-resource/mcp`,
).then((response) => response.json());
assert.equal(protectedResource.resource, origin);
for (const scope of ['knowledge:drafts:create', 'knowledge:context:read', 'knowledge:drafts:status']) {
  assert.ok(protectedResource.scopes_supported.includes(scope), `protected resource must advertise ${scope}`);
}
console.log('[OK] protected-resource metadata');

const authorizationServer = await fetch(
  `${origin}/.well-known/oauth-authorization-server`,
).then((response) => response.json());
for (const scope of ['openid', 'knowledge:drafts:create', 'knowledge:context:read']) {
  assert.ok(authorizationServer.scopes_supported.includes(scope), `authorization server must advertise ${scope}`);
}
if (!authorizationServer.scopes_supported.includes('knowledge:drafts:status')) {
  console.warn('[WARN] authorization-server metadata does not advertise knowledge:drafts:status; keep status polling out of the submitted default grant until provider configuration is verified.');
} else {
  console.log('[OK] authorization server advertises knowledge:drafts:status');
}

console.log('MemoStem live submission-readiness checks passed.');
