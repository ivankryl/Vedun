//  scripts/copy-templates.mjs
import { mkdir, cp, stat } from 'node:fs/promises';
import { join } from 'node:path';

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

const root = process.cwd();

const sources = [
  join(root, 'src', 'templates'),
  join(root, 'src', 'surveys', 'templates'),
];

const targets = [
  join(root, 'dist', 'templates'),
  join(root, 'dist', 'surveys', 'templates'),
];

let copied = 0;

for (const target of targets) {
  await mkdir(target, { recursive: true });

  for (const srcDir of sources) {
    if (await exists(srcDir)) {
      await cp(srcDir, target, { recursive: true });
      console.log(`[COPY TEMPLATES] Copied from ${srcDir} -> ${target}`);
      copied++;
    } else {
      console.log(`[COPY TEMPLATES] Skip (not found): ${srcDir}`);
    }
  }
}

if (copied === 0) {
  console.log('[COPY TEMPLATES] WARNING: no template sources found');
}
