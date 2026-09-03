#!/usr/bin/env node
/**
 * Headless capture runner for the fixture corpora (`decisions/0020` layout).
 *
 *   node scripts/capture-fixture.mjs <fixture-dir> [--write]
 *   node scripts/capture-fixture.mjs --all [--write]      # articles + code
 *   node scripts/capture-fixture.mjs --articles [--write]
 *   node scripts/capture-fixture.mjs --code [--write]
 *
 * Without `--write` it prints a summary and exits non-zero on any golden
 * mismatch (this is what `tests/pipeline-*.test.ts` rely on being possible).
 * With `--write` it (re)generates `expected-ir.json` and
 * `expected-diagnostics.json` from `source.html`.
 *
 * Not shipped in the extension.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { capture } from '../packages/pipeline/dist/index.js';
import {
  canonicalizePretty,
  renderMarkdown,
  assembleBundle,
  evaluateCapture,
} from '../packages/core/dist/index.js';

const ARTICLES_DIR = 'fixtures/articles';
const CODE_DIR = 'fixtures/code';
const CONVERSATIONS_DIR = 'fixtures/conversations';
const FIXED_TS = '2026-01-01T00:00:00.000Z';

function dirsUnder(base) {
  if (!existsSync(base)) return [];
  return readdirSync(base, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => join(base, e.name));
}

function runFixture(dir) {
  const provenance = JSON.parse(
    readFileSync(join(dir, 'provenance.json'), 'utf8'),
  );
  const html = readFileSync(join(dir, 'source.html'), 'utf8');
  const url =
    provenance.sourceUrl ?? 'https://fixture.example/' + basename(dir);
  const result = capture({
    html,
    url,
    canonicalUrl: provenance.canonicalUrl ?? url,
    capturedAt: FIXED_TS,
  });
  // second run for determinism
  const again = capture({
    html,
    url,
    canonicalUrl: provenance.canonicalUrl ?? url,
    capturedAt: FIXED_TS,
  });
  const deterministic =
    canonicalizePretty(result.document) === canonicalizePretty(again.document);
  return { result, deterministic };
}

function irView(doc) {
  // The full document minus the volatile timestamp, for a stable golden.
  const clone = JSON.parse(JSON.stringify(doc));
  clone.source.captureTimestamp = FIXED_TS;
  clone.source.pageLoadState.observedAt = FIXED_TS;
  return clone;
}

function checkOne(dir, write) {
  const { result, deterministic } = runFixture(dir);
  const irPath = join(dir, 'expected-ir.json');
  const diagPath = join(dir, 'expected-diagnostics.json');
  const irStr = canonicalizePretty(irView(result.document));
  const diagStr = canonicalizePretty({
    exportStatus: result.export.status,
    canExport: result.export.canExport,
    diagnostics: result.document.diagnostics,
  });

  let ok = deterministic;
  const problems = [];
  if (!deterministic) problems.push('non-deterministic output');

  // --- rendering + bundle goldens (decisions/0019, 0017) ---
  const md = {
    obsidian: renderMarkdown(result.document, { profile: 'obsidian' }).markdown,
    gfm: renderMarkdown(result.document, { profile: 'gfm' }).markdown,
    commonmark: renderMarkdown(result.document, { profile: 'commonmark' })
      .markdown,
  };
  const bundle = assembleBundle(result.document, { profile: 'obsidian' });
  const bundle2 = assembleBundle(result.document, { profile: 'obsidian' });
  const zipStable =
    Buffer.from(bundle.zip).toString('base64') ===
    Buffer.from(bundle2.zip).toString('base64');
  if (!zipStable) problems.push('bundle ZIP not byte-stable');
  const hashesStr = canonicalizePretty({
    documentContentIdentity:
      bundle.manifest.contentIdentity.documentContentIdentity,
    markdown: bundle.manifest.contentIdentity.markdown,
    blocks: bundle.manifest.contentIdentity.blocks,
    exportStatus: bundle.manifest.exportStatus,
  });

  // If the fixture supplies an expected section outline, evaluate against it
  // (production captures have no such outline — decisions/0015 / Phase 8).
  const outlinePath = join(dir, 'expected-outline.json');
  const r = existsSync(outlinePath)
    ? evaluateCapture(result.document, {
        expectedOutline: JSON.parse(readFileSync(outlinePath, 'utf8')),
      })
    : result.report;
  const reportStr = canonicalizePretty({
    status: r.status,
    canExport: r.canExport,
    requiresVisibleWarning: r.requiresVisibleWarning,
    reason: r.reason,
    code: r.code,
    citations: r.citations,
    sections: r.sections,
    warnings: r.warnings,
    counts: r.counts,
  });

  const files = {
    [irPath]: irStr,
    [diagPath]: diagStr,
    [join(dir, 'expected.md')]: md.obsidian,
    [join(dir, 'expected.gfm.md')]: md.gfm,
    [join(dir, 'expected.commonmark.md')]: md.commonmark,
    [join(dir, 'expected-hashes.json')]: hashesStr,
    [join(dir, 'expected-report.json')]: reportStr,
  };

  for (const [path, want] of Object.entries(files)) {
    if (write) {
      writeFileSync(path, want);
    } else if (!existsSync(path) || readFileSync(path, 'utf8') !== want) {
      ok = false;
      problems.push(`${basename(path)} mismatch`);
    }
  }

  return { name: basename(dir), ok, status: r.status, problems };
}

const args = process.argv.slice(2);
const write = args.includes('--write');
let targets;
if (args.includes('--all')) {
  targets = [
    ...dirsUnder(ARTICLES_DIR),
    ...dirsUnder(CODE_DIR),
    ...dirsUnder(CONVERSATIONS_DIR),
  ];
} else if (args.includes('--articles')) {
  targets = dirsUnder(ARTICLES_DIR);
} else if (args.includes('--code')) {
  targets = dirsUnder(CODE_DIR);
} else if (args.includes('--conversations')) {
  targets = dirsUnder(CONVERSATIONS_DIR);
} else {
  targets = args.filter((a) => !a.startsWith('--'));
}

let failed = 0;
for (const dir of targets) {
  const r = checkOne(dir, write);
  if (!r.ok) failed++;
  console.log(
    `${r.ok ? 'ok  ' : 'FAIL'} ${r.name.padEnd(28)} status=${r.status}` +
      (r.problems.length ? `  (${r.problems.join('; ')})` : ''),
  );
}
console.log(
  `\n${failed === 0 ? 'PASS' : 'FAIL'} — ${failed} fixture(s) with problems`,
);
process.exit(failed === 0 ? 0 : 1);
