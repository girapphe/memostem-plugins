import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('public validation rejects maintenance skills and unknown skills', async () => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'memostem-public-boundary-'));
  try {
    await cp(root, temporaryRoot, {
      recursive: true,
      filter: (source) => !['.git', 'node_modules'].includes(path.basename(source)),
    });
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
      const result = spawnSync(process.execPath, ['scripts/validate.mjs'], {
        cwd: temporaryRoot,
        encoding: 'utf8',
      });
      assert.equal(result.status, 1, `validation must reject ${skill}`);
      assert.match(result.stderr, /public plugin may contain only memostem-proactive-capture/u);
      await rm(forbiddenDirectory, { recursive: true });
    }
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});
