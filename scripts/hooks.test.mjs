import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const config = JSON.parse(await readFile(new URL('../plugins/memostem/hooks/hooks.json', import.meta.url), 'utf8'));

test('session reminder emits only static context regardless of supplied session data', () => {
  assert.deepEqual(Object.keys(config.hooks), ['SessionStart']);
  assert.equal(config.hooks.SessionStart.length, 1);
  const entry = config.hooks.SessionStart[0];
  assert.equal(entry.matcher, 'startup|resume|clear|compact');
  assert.equal(entry.hooks.length, 1);
  const hook = entry.hooks[0];
  assert.equal(hook.type, 'command');
  // This hook is deliberately one literal printf, with no executable interpolation.
  assert.match(hook.command, /^printf '%s\\n' '\{[^']+\}'$/u);
  assert.doesNotMatch(hook.command, /[$`]/u);
  const run = (input) => spawnSync('/bin/sh', ['-c', hook.command], { input, encoding: 'utf8', timeout: 2000 });
  const empty = run('');
  const session = run(JSON.stringify({ transcript_path: '/never-read-this-session.jsonl', user_input: 'PRIVATE_SENTINEL' }));
  assert.equal(empty.status, 0, empty.stderr);
  assert.equal(session.status, 0, session.stderr);
  assert.equal(session.stdout, empty.stdout);
  assert.equal(session.stderr, '');
  const output = JSON.parse(session.stdout);
  assert.deepEqual(Object.keys(output), ['hookSpecificOutput']);
  assert.equal(output.hookSpecificOutput.hookEventName, 'SessionStart');
  assert.match(output.hookSpecificOutput.additionalContext, /A hook is never consent/u);
  assert.match(output.hookSpecificOutput.additionalContext, /Do not call tools just because/u);
  assert.doesNotMatch(session.stdout, /PRIVATE_SENTINEL|never-read-this-session/u);
});
