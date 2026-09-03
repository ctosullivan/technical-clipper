#!/usr/bin/env node
/**
 * Fixture-corpus completeness + provenance lint (`decisions/0020`, § 12).
 *
 *   node scripts/fixture-lint.mjs          # lint, exit non-zero on any problem
 *   node scripts/fixture-lint.mjs --counts # also print the corpus inventory
 *
 * Checks, without running the pipeline:
 *  - every case dir under fixtures/{articles,code,conversations} has the full
 *    golden file set;
 *  - every provenance.json parses and has the required shape;
 *  - every `origin: "licensed"` case (revision-pinned Wikipedia) records
 *    revisionId, revisionUrl, retrievedAt, licence, and attribution;
 *  - the § 12 minimums: >= 20 article cases, >= 50 exact/normalized code
 *    blocks across the whole corpus, >= 1 conversation with branch evidence
 *    and >= 1 streaming case;
 *  - no source.html references an outward script the tests would need to run
 *    (they never execute it — this is a corpus-hygiene check).
 *
 * Not shipped in the extension.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const FAMILIES = ['articles', 'code', 'conversations'];
const REQUIRED_FILES = [
  'source.html',
  'provenance.json',
  'expected-ir.json',
  'expected-diagnostics.json',
  'expected.md',
  'expected.gfm.md',
  'expected.commonmark.md',
  'expected-hashes.json',
  'expected-report.json',
];
const VALID_ORIGINS = new Set(['synthetic', 'minimized-from-real', 'licensed']);

const problems = [];
const fail = (where, msg) => problems.push(`${where}: ${msg}`);

function dirsUnder(base) {
  if (!existsSync(base)) return [];
  return readdirSync(base, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
}

function countCodeBlocks(doc) {
  let n = 0;
  const walkBlocks = (blocks) => {
    for (const b of blocks ?? []) {
      if (b.type === 'codeBlock') n += 1;
      else if (b.type === 'codeGroup') n += b.group.members.length;
      else if (b.type === 'terminalSession') n += 1;
      if (b.items) for (const it of b.items) walkBlocks(it.blocks);
      if (b.blocks) walkBlocks(b.blocks);
    }
  };
  if (doc.captureKind === 'conversation') {
    for (const m of doc.body.messages ?? []) walkBlocks(m.blocks);
  } else {
    walkBlocks(doc.body.blocks);
    for (const fn of doc.body.footnotes ?? []) walkBlocks(fn.blocks);
  }
  return n;
}

const inventory = { articles: 0, code: 0, conversations: 0, codeBlocks: 0 };
let branchCases = 0;
let streamingCases = 0;

for (const family of FAMILIES) {
  const base = join('fixtures', family);
  const slugs = dirsUnder(base);
  inventory[family] = slugs.length;

  for (const slug of slugs) {
    const dir = join(base, slug);
    const where = `${family}/${slug}`;

    for (const f of REQUIRED_FILES) {
      if (!existsSync(join(dir, f))) fail(where, `missing ${f}`);
    }

    // provenance shape
    const provPath = join(dir, 'provenance.json');
    if (existsSync(provPath)) {
      let prov;
      try {
        prov = JSON.parse(readFileSync(provPath, 'utf8'));
      } catch (e) {
        fail(where, `provenance.json does not parse (${e.message})`);
      }
      if (prov) {
        if (!VALID_ORIGINS.has(prov.origin))
          fail(where, `provenance.origin '${prov.origin}' is not valid`);
        if (typeof prov.sourceUrl !== 'string' || !prov.sourceUrl)
          fail(where, 'provenance.sourceUrl must be a non-empty string');
        if (typeof prov.notes !== 'string' || !prov.notes)
          fail(where, 'provenance.notes must be a non-empty string');
        if (typeof prov.producedByExtractorVersion !== 'string')
          fail(where, 'provenance.producedByExtractorVersion must be a string');
        if (prov.origin === 'licensed') {
          for (const k of [
            'revisionId',
            'revisionUrl',
            'retrievedAt',
            'licence',
            'attribution',
          ]) {
            if (!prov[k])
              fail(where, `licensed fixture is missing provenance.${k}`);
          }
          if (
            typeof prov.revisionUrl === 'string' &&
            !/[?&]oldid=\d+/.test(prov.revisionUrl) &&
            !/\/revision\/\d+/.test(prov.revisionUrl)
          ) {
            fail(where, 'provenance.revisionUrl is not a revision-pinned URL');
          }
        }
      }
    }

    // source hygiene
    const srcPath = join(dir, 'source.html');
    if (existsSync(srcPath)) {
      const src = readFileSync(srcPath, 'utf8');
      if (/<script[^>]+src=["']https?:/i.test(src)) {
        fail(
          where,
          'source.html loads an external script (corpus hygiene — tests never execute it, but keep fixtures self-contained)',
        );
      }
    }

    // IR-derived counts
    const irPath = join(dir, 'expected-ir.json');
    if (existsSync(irPath)) {
      let doc;
      try {
        doc = JSON.parse(readFileSync(irPath, 'utf8'));
      } catch (e) {
        fail(where, `expected-ir.json does not parse (${e.message})`);
      }
      if (doc) {
        inventory.codeBlocks += countCodeBlocks(doc);
        if (family === 'conversations') {
          const be = doc.body?.branchEvidence;
          if (be?.branchIndicator) branchCases += 1;
          if (be?.streamingObserved) streamingCases += 1;
        }
      }
    }
  }
}

// § 12 minimums
if (inventory.articles < 20)
  fail('corpus', `only ${inventory.articles} article fixtures (need >= 20)`);
if (inventory.codeBlocks < 50)
  fail(
    'corpus',
    `only ${inventory.codeBlocks} code blocks across the corpus (need >= 50)`,
  );
if (inventory.conversations < 3)
  fail(
    'corpus',
    `only ${inventory.conversations} conversation fixtures (need >= 3)`,
  );
if (branchCases < 1)
  fail('corpus', 'no conversation fixture exercises a branch');
if (streamingCases < 1)
  fail('corpus', 'no conversation fixture exercises streaming');

if (process.argv.includes('--counts') || problems.length) {
  console.log('corpus inventory:');
  console.log(`  article fixtures      : ${inventory.articles}`);
  console.log(`  code fixtures          : ${inventory.code}`);
  console.log(`  conversation fixtures  : ${inventory.conversations}`);
  console.log(`  code blocks (total)    : ${inventory.codeBlocks}`);
  console.log(`  branch / streaming     : ${branchCases} / ${streamingCases}`);
  console.log('');
}

if (problems.length) {
  console.log(`FAIL — ${problems.length} problem(s):`);
  for (const p of problems) console.log(`  - ${p}`);
  process.exit(1);
}
console.log('PASS — fixture corpus is complete and provenance is valid');
