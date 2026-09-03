#!/usr/bin/env node
/**
 * Package the unpacked Chromium extension into a versioned folder and a
 * deterministic zip for manual install (`planning/phase-10`, § "Packaging").
 *
 *   node scripts/package-extension.mjs
 *
 * Assumes `packages/extension/dist/` is already built
 * (`pnpm --filter @technical-clipper/extension run build`); pass --build to run
 * that first. Output goes to `dist-artifacts/`:
 *
 *   dist-artifacts/technical-clipper-<version>+<sha>/   (unpacked, load this)
 *   dist-artifacts/technical-clipper-<version>+<sha>.zip (deterministic)
 *
 * No store submission, no signing — those need explicit authorization.
 * Not shipped in the extension.
 */
import {
  readFileSync,
  existsSync,
  readdirSync,
  mkdirSync,
  rmSync,
  cpSync,
  writeFileSync,
  statSync,
} from 'node:fs';
import { join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import { buildZip } from '../packages/core/dist/index.js';

const EXT_DIR = 'packages/extension';
const DIST = join(EXT_DIR, 'dist');
const OUT = 'dist-artifacts';

if (process.argv.includes('--build')) {
  execFileSync(
    process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
    ['--filter', '@technical-clipper/extension', 'run', 'build'],
    { stdio: 'inherit' },
  );
}

if (!existsSync(DIST) || readdirSync(DIST).length === 0) {
  console.error(
    'FAIL — packages/extension/dist is missing or empty; build it first ' +
      '(pnpm --filter @technical-clipper/extension run build) or pass --build',
  );
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(join(DIST, 'manifest.json'), 'utf8'));
let sha = 'nogit';
try {
  sha = execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
    encoding: 'utf8',
  }).trim();
} catch {
  /* not a git checkout */
}
const tag = `technical-clipper-${manifest.version}+${sha}`;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, tag), { recursive: true });
cpSync(DIST, join(OUT, tag), { recursive: true });

// Walk the copied tree for the zip (sorted, so the archive is deterministic).
const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else files.push(p);
  }
};
walk(join(OUT, tag));

const entries = files.map((p) => ({
  path: relative(join(OUT, tag), p).split('\\').join('/'),
  data: new Uint8Array(readFileSync(p)),
}));
const zip = buildZip(entries);
writeFileSync(join(OUT, `${tag}.zip`), zip);

const totalBytes = entries.reduce((n, e) => n + e.data.length, 0);
console.log(
  `packaged ${entries.length} files (${(totalBytes / 1024).toFixed(1)} KB unpacked)`,
);
console.log(`  ${OUT}/${tag}/            (load unpacked)`);
console.log(
  `  ${OUT}/${tag}.zip         (${(zip.length / 1024).toFixed(1)} KB, deterministic)`,
);
console.log('');
console.log(
  'manifest:',
  JSON.stringify({
    manifest_version: manifest.manifest_version,
    version: manifest.version,
    permissions: manifest.permissions,
    host_permissions: manifest.host_permissions,
  }),
);
console.log('not signed, not submitted — that needs explicit authorization.');
