import { cp, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// plugins/memostem/skills is the source of truth; the ChatGPT web package ships an exact copy.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'plugins', 'memostem', 'skills');
const target = path.join(root, 'plugins', 'memostem-chatgpt', 'skills');

await rm(target, { recursive: true, force: true });
await cp(source, target, { recursive: true });

console.log(`Synced ${path.relative(root, source)} -> ${path.relative(root, target)}`);
