#!/usr/bin/env node
/**
 * A reference "naive clip" converter for the comparative benchmark
 * (`decisions/0020` gate 17, `docs/evaluation/comparative/`).
 *
 *   node scripts/naive-clip.mjs <path/to/source.html>
 *
 * This models the *common general-purpose clipping path*: run a
 * readability-style main-content extraction, then convert the surviving HTML to
 * Markdown with turndown-equivalent rules. It is NOT this project's pipeline.
 * It exists only to show, reproducibly and offline, what that path does to
 * code-heavy technical content:
 *
 *  - a fenced block is opened with ``` and no language (class="language-x" and
 *    data-lang are dropped);
 *  - only the *visible* tab of a tab group survives; the others are gone;
 *  - backtick runs inside code are not escaped or fence-widened;
 *  - citation superscripts and reference lists are flattened to plain text or
 *    dropped;
 *  - line-number gutters rendered as table cells leak into the text.
 *
 * These are the documented behaviours of readability + turndown; exact bytes
 * vary by version, so the committed `naive.md` files are a representative
 * snapshot, not a contract.
 *
 * Not shipped in the extension.
 */
import { readFileSync } from 'node:fs';
import { parseHTML } from '../packages/pipeline/node_modules/linkedom/esm/index.js';

const path = process.argv[2];
if (!path) {
  console.error('usage: node scripts/naive-clip.mjs <source.html>');
  process.exit(1);
}
const { document } = parseHTML(readFileSync(path, 'utf8'));

// readability-ish: take the highest-text-density <article>/<main>/<div>.
function pickRoot() {
  const cands = [
    ...document.querySelectorAll(
      'article, main, [role=main], .mw-parser-output, .post-content, .entry-content',
    ),
  ];
  let best = null;
  let bestLen = 0;
  for (const el of cands) {
    const len = (el.textContent || '').length;
    if (len > bestLen) {
      best = el;
      bestLen = len;
    }
  }
  return best || document.body;
}

const root = pickRoot();

// strip obvious chrome the way readability does
for (const el of [
  ...root.querySelectorAll(
    'nav, aside, footer, script, style, .navbox, .reflist, .mw-editsection, sup.reference, .mw-cite-backlink',
  ),
])
  el.remove();

const out = [];
const inline = (el) => (el.textContent || '').replace(/\s+/g, ' ').trim();

function block(el) {
  const tag = el.tagName;
  if (/^H[1-6]$/.test(tag)) {
    out.push('#'.repeat(Number(tag[1])) + ' ' + inline(el), '');
    return;
  }
  if (tag === 'P') {
    const t = inline(el);
    if (t) out.push(t, '');
    return;
  }
  if (tag === 'PRE') {
    // turndown default: ``` fence, language never emitted
    const code = el.querySelector('code') || el;
    out.push('```', (code.textContent || '').replace(/\n$/, ''), '```', '');
    return;
  }
  if (tag === 'UL' || tag === 'OL') {
    for (const li of el.querySelectorAll(':scope > li'))
      out.push((tag === 'OL' ? '1. ' : '- ') + inline(li));
    out.push('');
    return;
  }
  if (tag === 'BLOCKQUOTE') {
    for (const line of inline(el).split('\n')) out.push('> ' + line);
    out.push('');
    return;
  }
  if (tag === 'TABLE') {
    const rows = [...el.querySelectorAll('tr')];
    for (const r of rows) {
      const cells = [...r.querySelectorAll('th, td')].map((c) =>
        inline(c).replace(/\|/g, '\\|'),
      );
      out.push('| ' + cells.join(' | ') + ' |');
    }
    out.push('');
    return;
  }
  if (tag === 'FIGURE') {
    const img = el.querySelector('img');
    const cap = el.querySelector('figcaption');
    if (img)
      out.push(
        `![${img.getAttribute('alt') || ''}](${img.getAttribute('src') || ''})`,
      );
    if (cap) out.push('*' + inline(cap) + '*');
    out.push('');
    return;
  }
  // tab groups: keep only the first visible panel, recurse into everything else
  if (/tabs?/i.test(el.className || '')) {
    const panel =
      el.querySelector('[role=tabpanel], .tab-panel, .tabItem') || el;
    for (const child of panel.children) block(child);
    return;
  }
  for (const child of el.children) block(child);
}

for (const child of root.children) block(child);
process.stdout.write(
  out
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim() + '\n',
);
