#!/usr/bin/env node
// Deterministic, offline verifier for the markdown-clipping skill's normative
// examples and anti-examples. No network. No Markdown-parser dependency — it
// checks byte-level and lexical invariants only (see decisions/0021). Exits
// non-zero on any failure.
//
// Run: node .claude/skills/markdown-clipping/scripts/verify-examples.mjs
//   or: pnpm run skill:verify

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REF = join(HERE, '..', 'references');

let failures = 0;
const check = (name, cond, detail = '') => {
  if (cond) {
    console.log(`  ok   ${name}`);
  } else {
    failures++;
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
};
const section = (s) => console.log(`\n${s}`);

// ---------------------------------------------------------------------------
// Reference implementations of the rules the skill documents. These must stay
// in lockstep with decisions/0016 and packages/core/src/fence.ts (Phase 3).
// ---------------------------------------------------------------------------

/** Longest run of `char` in `s`. */
const longestRun = (s, char) => {
  let max = 0;
  let cur = 0;
  for (const c of s) {
    if (c === char) {
      cur++;
      if (cur > max) max = cur;
    } else {
      cur = 0;
    }
  }
  return max;
};

/** decisions/0016 fence selection. Returns { char, length }.
 *  Backticks unless the code contains a backtick run AND no tilde run AND the
 *  info string has no tilde; length = (longest run of the chosen char in the
 *  code) + 1, minimum 3. Bytes inside are never altered. */
export const selectFence = (code, infoString = '') => {
  const b = longestRun(code, '`');
  const t = longestRun(code, '~');
  const useTilde = b > 0 && t === 0 && !infoString.includes('~');
  const char = useTilde ? '~' : '`';
  const length = Math.max(3, longestRun(code, char) + 1);
  return { char, length };
};

/** Render a fenced block and return the exact string. */
export const renderFence = (code, infoString = '') => {
  const { char, length } = selectFence(code, infoString);
  const fence = char.repeat(length);
  return `${fence}${infoString}\n${code}\n${fence}`;
};

/** Extract fenced-block content back out (inverse of renderFence for the
 *  single-block case). Returns the content string or throws. */
export const extractFence = (rendered) => {
  const lines = rendered.split('\n');
  const open = lines[0].match(/^([`~])\1{2,}/);
  if (!open) throw new Error('no opening fence');
  const fenceChar = open[1];
  const fenceRun = lines[0].match(new RegExp(`^\\${fenceChar}+`))[0];
  for (let i = lines.length - 1; i > 0; i--) {
    if (lines[i] === fenceRun) return lines.slice(1, i).join('\n');
  }
  throw new Error('no closing fence');
};

/** decisions/0016 code-span selection. Returns the rendered span. */
export const renderCodeSpan = (text) => {
  const n = longestRun(text, '`') + 1;
  const ticks = '`'.repeat(n);
  const pad = text.startsWith('`') || text.endsWith('`') ? ' ' : '';
  return `${ticks}${pad}${text}${pad}${ticks}`;
};

/** Escape a table cell per references/gfm.md. */
export const escapeTableCell = (text) => text.replace(/\|/g, '\\|');

/** YAML value quoting per references/obsidian-markdown.md § properties. */
export const yamlNeedsQuoting = (v) => {
  if (typeof v !== 'string') return false;
  if (v === '') return true;
  if (v !== v.trim()) return true;
  if (/^[!&*?|>%@#-]/.test(v)) return true;
  if (/:\s/.test(v) || v.includes(' #')) return true;
  if (/^(true|false|null|yes|no|on|off)$/i.test(v)) return true;
  if (/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(v)) return true;
  if (/^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2})?)?/.test(v)) return true;
  return false;
};
export const yamlScalar = (v) =>
  yamlNeedsQuoting(v)
    ? `"${String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
    : String(v);

// ---------------------------------------------------------------------------
// Anti-pattern detectors — run over *rendered output* to catch regressions.
// ---------------------------------------------------------------------------

const fencedRegions = (md) => {
  const out = [];
  const lines = md.split('\n');
  let open = null;
  let start = 0;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^([`~])\1{2,}/);
    if (!open && m) {
      open = lines[i].match(/^([`~]+)/)[1];
      start = i + 1;
    } else if (open && lines[i] === open) {
      out.push(lines.slice(start, i).join('\n'));
      open = null;
    }
  }
  return out;
};

export const hasEncodedEscapesInFence = (md) =>
  fencedRegions(md).some(
    (c) =>
      /&(amp|lt|gt|quot|#\d+);/.test(c) || /\\[`*_{}[\]()#+.!|<>~-]/.test(c),
  );

export const hasObsidianOnlySyntax = (md) => {
  const withoutFences = md
    .split('\n')
    .filter((l, i, a) => {
      // crude: drop lines inside fences
      const before = a.slice(0, i + 1).join('\n');
      return (
        (before.match(/^([`~])\1{2,}/gm) || []).length % 2 === 0 ||
        !/^([`~])\1{2,}/.test(a[i])
      );
    })
    .join('\n');
  return (
    /(^|[^=])==[^=\n]+==([^=]|$)/.test(withoutFences) ||
    /\[\[[^\]]+\]\]/.test(withoutFences) ||
    /%%[^%]*%%/.test(withoutFences) ||
    /^>\s*\[![a-z]+\]/im.test(withoutFences) ||
    /^---\n[\s\S]*?\n---/.test(md)
  );
};

// ---------------------------------------------------------------------------
// Golden cases.
// ---------------------------------------------------------------------------

section('references/commonmark.md — fenced code (verify: fenced-code)');
const fenceCases = [
  // no backticks/tildes -> 3 backticks
  { code: 'plain code', info: 'js', fence: '`'.repeat(3) },
  // backtick run, no tilde -> switch to tildes (min length 3)
  { code: 'a ``` b', info: '', fence: '~'.repeat(3) },
  // both chars present -> stay backticks, grow past the longest backtick run
  { code: 'x ```` y\n~~~~~ z', info: 'ts', fence: '`'.repeat(5) },
  // only tildes in the code -> stay backticks (min length 3)
  { code: 'only ~~~ tildes here', info: '', fence: '`'.repeat(3) },
  // one of each -> stay backticks, min length 3
  { code: 'both ` and ~ present', info: '', fence: '`'.repeat(3) },
];
for (const c of fenceCases) {
  const f = selectFence(c.code, c.info);
  check(
    `fence for ${JSON.stringify(c.code)}`,
    f.char.repeat(f.length) === c.fence,
    `got ${f.char.repeat(f.length)} want ${c.fence}`,
  );
  check(
    `round-trips ${JSON.stringify(c.code)}`,
    extractFence(renderFence(c.code, c.info)) === c.code,
  );
}

section('references/commonmark.md — code spans (verify: code-span)');
check(
  'span with interior backtick grows, no pad',
  renderCodeSpan('a ` b') === '``a ` b``',
);
check('span starting with backtick pads', renderCodeSpan('`x') === '`` `x ``');
check('plain span uses single backtick', renderCodeSpan('plain') === '`plain`');

section('references/gfm.md — tables (verify: table-pipe-escape)');
check('pipe in cell escaped', escapeTableCell('a|b') === 'a\\|b');
check('pipe in cell code span escaped', escapeTableCell('`a|b`') === '`a\\|b`');

section('references/obsidian-markdown.md — properties (verify: yaml-quoting)');
for (const v of [
  'Yes',
  'no',
  '2019-05-01',
  'true',
  '42',
  ' leading',
  '@handle',
  'a: b',
]) {
  check(
    `quotes ambiguous value ${JSON.stringify(v)}`,
    yamlNeedsQuoting(v) && yamlScalar(v).startsWith('"'),
  );
}
for (const v of ['Plain title', 'Some Article Name', 'CC BY-SA 4.0']) {
  check(`leaves safe value bare ${JSON.stringify(v)}`, !yamlNeedsQuoting(v));
}

section(
  'anti-patterns — no encoded escapes inside a fence (verify: no-escapes-in-fence)',
);
check(
  'flags &amp; inside fence',
  hasEncodedEscapesInFence('```\nconst a = b &amp;&amp; c;\n```'),
);
check(
  'flags backslash-escape inside fence',
  hasEncodedEscapesInFence('```\n\\<div\\>\n```'),
);
check(
  'clean fence passes',
  !hasEncodedEscapesInFence('```\nconst a = b && c;\n```'),
);

section(
  'anti-patterns — profile purity (verify: profile-purity / profile-purity)',
);
check(
  'flags highlight in lower profile',
  hasObsidianOnlySyntax('text ==hi== text'),
);
check('flags wikilink', hasObsidianOnlySyntax('see [[Some Note]] here'));
check('flags callout', hasObsidianOnlySyntax('> [!note] Title\n> body'));
check('flags frontmatter', hasObsidianOnlySyntax('---\ntitle: x\n---\n\nbody'));
check(
  'clean gfm passes',
  !hasObsidianOnlySyntax(
    '# Title\n\n- [x] done\n\n| a | b |\n| --- | --- |\n| 1 | 2 |',
  ),
);

section(
  'anti-patterns — source link is not a wikilink (verify: source-link-not-wikilink)',
);
const renderSourceLink = (label, href) =>
  `[${label.replace(/\]/g, '\\]')}](${href})`;
check(
  'source link renders as markdown link with absolute url',
  renderSourceLink('Some Article', 'https://example.com/some-article') ===
    '[Some Article](https://example.com/some-article)',
);

section('reference files present and marked');
for (const f of [
  'commonmark.md',
  'gfm.md',
  'obsidian-markdown.md',
  'clipping-antipatterns.md',
  'source-register.md',
]) {
  let text = '';
  try {
    text = readFileSync(join(REF, f), 'utf8');
  } catch {
    /* handled by check */
  }
  check(`${f} exists and non-empty`, text.length > 0);
}
const anti = readFileSync(join(REF, 'clipping-antipatterns.md'), 'utf8');
check(
  'anti-pattern catalogue has >= 17 numbered entries',
  (anti.match(/^## \d+\./gm) || []).length >= 17,
);
const register = readFileSync(join(REF, 'source-register.md'), 'utf8');
check(
  'source-register records the CommonMark 0.31.2 version',
  /0\.31\.2 \(2024-01-28\)/.test(register),
);
check(
  'source-register records the GFM 0.29-gfm version',
  /0\.29-gfm \(2019-04-06\)/.test(register),
);
check(
  'source-register has real SHA-256 hashes (no PENDING)',
  !/PENDING/.test(register) &&
    (register.match(/`[0-9a-f]{64}`/g) || []).length >= 4,
);

section('SKILL.md discovery description');
const skill = readFileSync(join(HERE, '..', 'SKILL.md'), 'utf8');
const fm = skill.match(/^---\n([\s\S]*?)\n---/);
check(
  'SKILL.md has YAML frontmatter as the first line',
  !!fm && skill.startsWith('---'),
);
const desc = fm ? fm[1] : '';
for (const term of [
  'Markdown',
  'Obsidian',
  'CommonMark',
  'GFM',
  'fixture',
  'profile',
]) {
  check(`description mentions "${term}"`, new RegExp(term, 'i').test(desc));
}
check(
  'description + when_to_use under the 1,536-char listing cap',
  (desc.match(/description:[\s\S]*/)?.[0].length ?? 0) < 1536,
);
check('SKILL.md body under 500 lines', skill.split('\n').length < 500);

// ---------------------------------------------------------------------------

console.log(`\n${failures === 0 ? 'PASS' : 'FAIL'} — ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
