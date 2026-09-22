import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function workflow(name) {
  return readFile(path.join(root, '.github', 'workflows', name), 'utf8');
}

test('plugin validation defers drafts and cancels superseded stateless runs', async () => {
  const source = await workflow('validate.yml');

  assert.match(source, /types: \[opened, synchronize, reopened, ready_for_review\]/u);
  assert.match(source, /group: validate-\$\{\{ github\.event\.pull_request\.number \|\| github\.ref \}\}/u);
  assert.match(source, /cancel-in-progress: true/u);
  assert.match(
    source,
    /if: github\.event_name != 'pull_request' \|\| github\.event\.pull_request\.draft == false/u,
  );
  assert.match(source, /timeout-minutes: 2/u);
  assert.doesNotMatch(source, /pull_request_target/u);
});

test('registry publication remains non-cancelling and release-scoped', async () => {
  const source = await workflow('publish-mcp.yml');

  assert.match(source, /release:\n\s+types: \[published\]/u);
  assert.match(source, /group: mcp-registry-\$\{\{ github\.ref \}\}/u);
  assert.match(source, /cancel-in-progress: false/u);
});
