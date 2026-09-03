#!/usr/bin/env node
/**
 * MVP release-gate runner (`decisions/0020` gate map, § 12).
 *
 *   node scripts/gates.mjs           # run gates 1-15, exit non-zero on any fail
 *   node scripts/gates.mjs --json    # machine-readable report to stdout
 *
 * Gates 1-2 and 9 (golden equality + determinism) are enforced in full by
 * `scripts/capture-fixture.mjs --all`, which the pipeline tests run; this
 * script re-derives the remaining structural gates directly from the committed
 * goldens (fast, no capture) plus a live timing pass for gate 15.
 *
 * Gates 16 (Obsidian vault render) and 17 (comparative benchmark) are manual;
 * their evidence lives under docs/evaluation/ and is only linked here.
 *
 * Not shipped in the extension.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { performance } from 'node:perf_hooks';
import { captureFromHtml } from '../packages/pipeline/dist/parse.js';
import {
  renderMarkdown,
  canonicalizePretty,
  assembleBundle,
} from '../packages/core/dist/index.js';

const ART = 'fixtures/articles';
const CODE = 'fixtures/code';
const CONV = 'fixtures/conversations';
const FIXED_TS = '2026-01-01T00:00:00.000Z';

const dirs = (base) =>
  existsSync(base)
    ? readdirSync(base, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => join(base, e.name))
    : [];

const readJSON = (p) => JSON.parse(readFileSync(p, 'utf8'));
const irOf = (d) => readJSON(join(d, 'expected-ir.json'));
const diagOf = (d) => readJSON(join(d, 'expected-diagnostics.json'));
const reportOf = (d) => readJSON(join(d, 'expected-report.json'));
const provOf = (d) => readJSON(join(d, 'provenance.json'));

const results = [];
function gate(n, title, fn) {
  const failures = [];
  const pass = (cond, msg) => {
    if (!cond) failures.push(msg);
  };
  try {
    fn(pass);
  } catch (e) {
    failures.push(`threw: ${e.message}`);
  }
  results.push({ n, title, ok: failures.length === 0, failures });
}

function collectCode(doc) {
  const out = [];
  const walk = (blocks) => {
    for (const b of blocks ?? []) {
      if (b.type === 'codeBlock') out.push(b.code);
      else if (b.type === 'codeGroup')
        for (const m of b.group.members) out.push(m.code);
      if (b.items) for (const it of b.items) walk(it.blocks);
      if (b.blocks) walk(b.blocks);
    }
  };
  if (doc.captureKind === 'conversation')
    for (const m of doc.body.messages) walk(m.blocks);
  else walk(doc.body.blocks);
  return out;
}

const articleDirs = dirs(ART);
const codeDirs = dirs(CODE);
const convDirs = dirs(CONV);
const NOISE_STRINGS = [
  'We use cookies',
  'Recommended for you',
  'site footer',
  'Subscribe',
  'Share on',
  'Skip to content',
];

// --- Gate 1 / 2: body blocks + structure retained (golden is the oracle) ---
gate(
  1,
  'Supported articles retain every expected body block in source order',
  (pass) => {
    for (const d of articleDirs) {
      const ir = irOf(d);
      const diag = diagOf(d);
      if (diag.exportStatus === 'failed') continue;
      pass(
        ir.body.blocks.length > 0,
        `${basename(d)}: non-failed article has zero blocks`,
      );
    }
  },
);

gate(
  2,
  'Heading/list/table/figure/citation structure matches the committed IR',
  (pass) => {
    // Enforced byte-for-byte by capture-fixture --all; here assert the shape is
    // non-degenerate for the structure-heavy fixtures.
    const wide = irOf(join(ART, 'wide-table-reference'));
    pass(
      wide.body.blocks.some(
        (b) => b.type === 'table' && b.table.header.length >= 6,
      ),
      'wide-table-reference: >=6-column table not present in IR',
    );
    const fig = irOf(join(ART, 'longform-blog-figures'));
    pass(
      fig.body.blocks.filter((b) => b.type === 'figure').length >= 2,
      'longform-blog-figures: expected >=2 figure nodes',
    );
    const fn = irOf(join(ART, 'footnotes-article'));
    pass(
      (fn.body.footnotes?.length ?? 0) > 0 ||
        (fn.body.references?.length ?? 0) > 0,
      'footnotes-article: no footnotes or references collected',
    );
  },
);

// --- Gate 3: chrome absent from output ---
gate(
  3,
  'Nav/edit/cookie/recommendations/footer absent from article output',
  (pass) => {
    for (const d of articleDirs) {
      const ir = irOf(d);
      const blob = JSON.stringify(ir.body.blocks);
      for (const s of NOISE_STRINGS)
        pass(
          !blob.includes(s),
          `${basename(d)}: noise string "${s}" leaked into blocks`,
        );
      const src = readFileSync(join(d, 'source.html'), 'utf8');
      if (
        /<nav|<footer|class="[^"]*cookie/i.test(src) &&
        irOf(d).body.blocks.length
      )
        pass(
          (ir.body.removedRegions?.length ?? 0) > 0,
          `${basename(d)}: source has chrome but no RemovedRegion recorded`,
        );
    }
  },
);

// --- Gate 4: Wikipedia fixtures pass the generic path (there is no WP adapter) ---
gate(
  4,
  'All revision-pinned Wikipedia fixtures pass the generic path',
  (pass) => {
    const wp = articleDirs.filter((d) => basename(d).startsWith('wikipedia-'));
    const pinned = wp.filter((d) => provOf(d).origin === 'licensed');
    pass(
      pinned.length >= 5,
      `only ${pinned.length} revision-pinned Wikipedia fixtures (origin: licensed; need >= 5)`,
    );
    for (const d of wp) {
      const diag = diagOf(d);
      pass(
        diag.exportStatus !== 'failed',
        `${basename(d)}: generic path produced status=failed`,
      );
    }
    for (const d of pinned) {
      const ir = irOf(d);
      pass(
        ir.body.blocks.length > 20 && ir.body.references.length > 0,
        `${basename(d)}: extraction too thin (${ir.body.blocks.length} blocks, ${ir.body.references.length} refs)`,
      );
      const c = collectCode(ir);
      // Every Wikipedia code block must be exact (fidelity thesis).
      for (const cb of c)
        pass(
          cb.confidence === 'exact',
          `${basename(d)}: wikipedia code confidence=${cb.confidence}`,
        );
    }
  },
);

// --- Gate 5: content loss cannot report `complete` ---
gate(
  5,
  'An article losing a section/citation/figure cannot report complete',
  (pass) => {
    const LOSS = new Set([
      'TC-EXTRACT-SECTION-LOST',
      'TC-EXTRACT-CITATION-UNRESOLVED',
      'TC-EXTRACT-FIGURE-MISSING',
    ]);
    for (const d of articleDirs) {
      const diag = diagOf(d);
      const status = reportOf(d).status; // completeness-evaluated status
      const hasLoss = diag.diagnostics.some(
        (x) =>
          LOSS.has(x.code) &&
          (x.severity === 'error' || x.severity === 'fatal'),
      );
      if (hasLoss)
        pass(
          status === 'partial' || status === 'failed',
          `${basename(d)}: content-loss diagnostic but report status=${status}`,
        );
    }
    // section-loss carries an expected-outline.json; its evaluated report must
    // flip to partial even though the raw capture looks complete.
    pass(
      reportOf(join(ART, 'section-loss')).status === 'partial',
      'section-loss fixture: evaluated report is not partial',
    );
  },
);

// --- Gate 6: exact-text preservation for supported code fixtures ---
gate(
  6,
  '100% exact/normalized text preservation for supported code fixtures',
  (pass) => {
    const RECON = new Set([
      'TC-EXTRACT-RECONSTRUCT',
      'TC-DETECT-TERMINAL-AMBIGUOUS',
    ]);
    for (const d of codeDirs) {
      if (provOf(d).category === 'adversarial') continue;
      const codes = new Set(diagOf(d).diagnostics.map((x) => x.code));
      const reconstructed = [...RECON].some((c) => codes.has(c));
      for (const c of collectCode(irOf(d))) {
        if (reconstructed) {
          // A documented reconstruction case: approximate is expected, but never
          // failed, and it must carry its diagnostic.
          pass(
            c.confidence === 'approximate' ||
              c.confidence === 'exact' ||
              c.confidence === 'normalized',
            `${basename(d)}: reconstruction case has confidence=${c.confidence}`,
          );
        } else {
          pass(
            c.confidence === 'exact' || c.confidence === 'normalized',
            `${basename(d)}: code confidence=${c.confidence} (expected exact/normalized)`,
          );
        }
      }
    }
  },
);

// --- Gate 7: accessible alternatives retained in code groups ---
gate(
  7,
  '100% retention of accessible alternatives in supported code groups',
  (pass) => {
    const groups = (doc) => {
      const g = [];
      const walk = (bs) => {
        for (const b of bs ?? []) {
          if (b.type === 'codeGroup') g.push(b.group);
          if (b.blocks) walk(b.blocks);
          if (b.items) for (const it of b.items) walk(it.blocks);
        }
      };
      walk(doc.body.blocks);
      return g;
    };
    const two = groups(irOf(join(CODE, 'docusaurus-two-tabs')));
    pass(
      two.length === 1 && two[0].members.length === 2,
      'docusaurus-two-tabs: expected one group of 2 members',
    );
    const five = groups(irOf(join(CODE, 'docusaurus-five-tabs')));
    pass(
      five.length === 1 && five[0].members.length === 5,
      'docusaurus-five-tabs: expected one group of 5 members',
    );
  },
);

// --- Gate 8: role + order for ChatGPT message fixtures ---
gate(8, 'Correct role and order for all ChatGPT message fixtures', (pass) => {
  const ROLES = new Set(['user', 'assistant', 'system', 'tool']);
  for (const d of convDirs) {
    const ir = irOf(d);
    ir.body.messages.forEach((m, i) => {
      pass(m.order === i, `${basename(d)}: message ${i} has order ${m.order}`);
      pass(ROLES.has(m.role), `${basename(d)}: message ${i} role=${m.role}`);
    });
  }
});

// --- Gate 9: deterministic IR + Markdown + bundle bytes for identical input ---
gate(
  9,
  'Deterministic IR, Markdown, and bundle bytes for identical normalized input',
  (pass) => {
    for (const d of [
      join(ART, 'wikipedia-iso-8601'),
      join(ART, 'noisy-docs-portal'),
      join(CONV, 'branch-switcher'),
      join(CODE, 'semantic-multi-block'),
    ]) {
      const prov = provOf(d);
      const html = readFileSync(join(d, 'source.html'), 'utf8');
      const opts = {
        url: prov.sourceUrl,
        canonicalUrl: prov.canonicalUrl ?? prov.sourceUrl,
        capturedAt: FIXED_TS,
      };
      const a = captureFromHtml(html, opts);
      const b = captureFromHtml(html, opts);
      pass(
        canonicalizePretty(a.document) === canonicalizePretty(b.document),
        `${basename(d)}: IR is not byte-identical across two captures`,
      );
      pass(
        renderMarkdown(a.document, { profile: 'gfm' }).markdown ===
          renderMarkdown(b.document, { profile: 'gfm' }).markdown,
        `${basename(d)}: Markdown is not byte-identical across two captures`,
      );
      const za = assembleBundle(a.document, { profile: 'obsidian' }).zip;
      const zb = assembleBundle(b.document, { profile: 'obsidian' }).zip;
      pass(
        Buffer.from(za).equals(Buffer.from(zb)),
        `${basename(d)}: bundle ZIP is not byte-identical across two captures`,
      );
    }
  },
);

// --- Gate 10: no line-number / copy-button contamination ---
gate(10, 'No line-number or copy-button contamination in code text', (pass) => {
  for (const d of [...codeDirs, ...articleDirs, ...convDirs]) {
    for (const c of collectCode(irOf(d))) {
      pass(
        !/\bCopy code\b/i.test(c.text) && !/^\s*Copy\s*$/m.test(c.text),
        `${basename(d)}: code text contains a copy-button string`,
      );
      const lines = c.text.split('\n');
      const numbered = lines.filter((l, i) =>
        l.trim().startsWith(String(i + 1) + ' '),
      ).length;
      pass(
        numbered < Math.max(3, lines.length * 0.5),
        `${basename(d)}: code text looks like it carries a line-number gutter`,
      );
    }
  }
});

// --- Gate 11: unsupported/partial components produce the expected diagnostic ---
gate(
  11,
  'Unsupported/partial components always produce the expected diagnostic',
  (pass) => {
    const mv = diagOf(join(CODE, 'adversarial-monaco-virtualized'));
    pass(
      mv.diagnostics.some((x) => x.code === 'TC-DETECT-VIRTUALIZED'),
      'adversarial-monaco-virtualized: missing TC-DETECT-VIRTUALIZED',
    );
    pass(
      mv.exportStatus === 'partial',
      'adversarial-monaco-virtualized: not partial',
    );
    for (const d of codeDirs.filter(
      (x) => provOf(x).category === 'adversarial',
    )) {
      const diag = diagOf(d);
      if (diag.exportStatus === 'complete') continue; // documented-safe adversarial case
      pass(
        diag.diagnostics.length > 0,
        `${basename(d)}: non-complete adversarial case has no diagnostics`,
      );
    }
  },
);

// --- Gate 12: no network requests during capture ---
gate(12, 'No network requests during capture', (pass) => {
  const calls = [];
  const g = globalThis;
  const save = {
    fetch: g.fetch,
    XMLHttpRequest: g.XMLHttpRequest,
    sendBeacon: g.navigator?.sendBeacon,
  };
  g.fetch = () => {
    calls.push('fetch');
    throw new Error('network blocked');
  };
  g.XMLHttpRequest = function () {
    calls.push('xhr');
    throw new Error('network blocked');
  };
  try {
    for (const d of [
      join(ART, 'wikipedia-jwt'),
      join(ART, 'api-reference'),
      join(CONV, 'linear-with-code'),
    ]) {
      const prov = provOf(d);
      captureFromHtml(readFileSync(join(d, 'source.html'), 'utf8'), {
        url: prov.sourceUrl,
        canonicalUrl: prov.canonicalUrl ?? prov.sourceUrl,
        capturedAt: FIXED_TS,
      });
    }
  } finally {
    g.fetch = save.fetch;
    g.XMLHttpRequest = save.XMLHttpRequest;
  }
  pass(calls.length === 0, `capture attempted network: ${calls.join(', ')}`);
});

// --- Gate 13: no executable content in the rendered preview ---
gate(13, 'No executable content / unsafe HTML in preview', (pass) => {
  for (const d of [...articleDirs, ...codeDirs, ...convDirs]) {
    const ir = irOf(d);
    for (const profile of ['gfm', 'obsidian', 'commonmark']) {
      const md = renderMarkdown(ir, { profile }).markdown;
      pass(
        !/<script\b/i.test(md),
        `${basename(d)}/${profile}: <script> in preview`,
      );
      pass(
        !/\son\w+\s*=/i.test(md),
        `${basename(d)}/${profile}: on* handler in preview`,
      );
      pass(
        !/javascript:/i.test(md),
        `${basename(d)}/${profile}: javascript: URL in preview`,
      );
    }
  }
});

// --- Gate 14: valid MV3 build, least-privilege permissions ---
gate(14, 'Valid MV3 build, least-privilege permissions', (pass) => {
  const mani = readJSON('packages/extension/manifest.json');
  pass(mani.manifest_version === 3, 'manifest_version is not 3');
  const ALLOW = new Set(['activeTab', 'scripting', 'storage']);
  for (const p of mani.permissions ?? [])
    pass(ALLOW.has(p), `permission "${p}" is outside the documented allowlist`);
  pass(
    (mani.host_permissions ?? []).length === 0,
    `host_permissions is non-empty: ${JSON.stringify(mani.host_permissions)}`,
  );
  pass(!('tabs' in (mani.permissions ?? [])), 'tabs permission present');
});

// --- Gate 15: capture + preview under 2 s on the reference environment ---
gate(
  15,
  'Capture + preview < 2 s per fixture on the reference environment',
  (pass) => {
    let worst = 0;
    let worstName = '';
    for (const d of [...articleDirs, ...convDirs]) {
      const prov = provOf(d);
      const html = readFileSync(join(d, 'source.html'), 'utf8');
      const t0 = performance.now();
      const { document } = captureFromHtml(html, {
        url: prov.sourceUrl,
        canonicalUrl: prov.canonicalUrl ?? prov.sourceUrl,
        capturedAt: FIXED_TS,
      });
      renderMarkdown(document, { profile: 'gfm' });
      const dt = performance.now() - t0;
      if (dt > worst) {
        worst = dt;
        worstName = basename(d);
      }
    }
    results.push({
      note: `gate 15 worst case: ${worstName} at ${worst.toFixed(0)} ms`,
    });
    pass(
      worst < 2000,
      `slowest capture+preview was ${worst.toFixed(0)} ms (${worstName})`,
    );
  },
);

// --- report ---
const gates = results.filter((r) => typeof r.n === 'number');
const notes = results.filter((r) => r.note);
const failed = gates.filter((g) => !g.ok);

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ gates, notes }, null, 2));
} else {
  for (const g of gates) {
    console.log(
      `${g.ok ? 'PASS' : 'FAIL'}  gate ${String(g.n).padStart(2)} — ${g.title}`,
    );
    for (const f of g.failures) console.log(`        - ${f}`);
  }
  for (const n of notes) console.log(`note   ${n.note}`);
  console.log('');
  console.log(
    'gates 16 (Obsidian vault render) and 17 (comparative benchmark) are manual —',
  );
  console.log(
    'evidence: docs/evaluation/obsidian-vault-check.md, docs/evaluation/comparative/',
  );
  console.log('');
  console.log(
    `${failed.length === 0 ? 'PASS' : 'FAIL'} — ${failed.length} gate(s) failing`,
  );
}
process.exit(failed.length === 0 ? 0 : 1);
