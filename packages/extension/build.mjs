#!/usr/bin/env node
/**
 * Bundle the extension into `dist/` with esbuild (`decisions/0032`).
 *
 *   background.js  — the MV3 service worker (+ capture-in-page, injected)
 *   results.js     — the results-page controller
 *   manifest.json, results.html — copied verbatim
 *
 * Self-contained ES modules, no external CDN. `capture()` is bundled; linkedom
 * is not in its import graph (the extension passes the live `document`).
 */
import { build } from 'esbuild';
import { copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, 'dist');

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

await build({
  entryPoints: {
    background: join(root, 'src/background.ts'),
    results: join(root, 'src/results.ts'),
    'capture-in-page': join(root, 'src/capture-in-page.ts'),
  },
  outdir: dist,
  bundle: true,
  format: 'esm',
  target: 'chrome116',
  platform: 'browser',
  sourcemap: false,
  legalComments: 'none',
  logLevel: 'warning',
});

copyFileSync(join(root, 'manifest.json'), join(dist, 'manifest.json'));
copyFileSync(join(root, 'results.html'), join(dist, 'results.html'));

console.log('extension bundled -> packages/extension/dist/');
