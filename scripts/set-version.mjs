import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Usage: npm run version:set -- 0.7.0
// Writes one release version into every manifest; `npm run check` verifies it.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const version = process.argv[2];
assert.match(version ?? '', /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/u, 'usage: npm run version:set -- <major.minor.patch>');

const targets = [
  ['package.json', (m) => { m.version = version; }],
  ['server.json', (m) => { m.version = version; }],
  ['gemini-extension.json', (m) => { m.version = version; }],
  ['plugins/memostem/.claude-plugin/plugin.json', (m) => { m.version = version; }],
  ['plugins/memostem/.codex-plugin/plugin.json', (m) => { m.version = version; }],
  ['.claude-plugin/marketplace.json', (m) => { m.plugins[0].version = version; }],
];
for (const [file, update] of targets) {
  const filePath = path.join(root, file);
  const manifest = JSON.parse(await readFile(filePath, 'utf8'));
  update(manifest);
  await writeFile(filePath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`${file} -> ${version}`);
}
