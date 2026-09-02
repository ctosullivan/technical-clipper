/**
 * Normalization rulesets — `decisions/0016`.
 *
 * Ruleset ids look like `norm/prose@1`. The id in force is recorded in
 * `SourceMetadata` / the manifest. Changing a ruleset is a version bump + ADR,
 * never an in-place edit.
 */

export const PROSE_RULESET_ID = 'norm/prose@1';
export const CODE_RULESET_ID = 'norm/code@1';
export const INFOSTRING_RULESET_ID = 'norm/infostring@1';

/**
 * Zero-width, bidi-control, and stray BOM characters removed by `norm/prose@1`:
 * U+200B–U+200F (zero-width + LTR/RTL marks), U+202A–U+202E (bidi embedding /
 * override), U+2060 (word joiner), U+FEFF (BOM / zero-width no-break space).
 */
const ZERO_WIDTH = /[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g;

/**
 * `norm/prose@1` — for article / message prose text before id + hashing and
 * before Markdown rendering.
 *
 * 1. CRLF and lone CR -> LF.
 * 2. Unicode NFC.
 * 3. Remove zero-width / bidi-control chars (and a leading BOM).
 * 4. Collapse runs of ASCII space/tab/newline between words to a single space.
 * 5. Trim leading/trailing whitespace of the run.
 *
 * Paragraph structure is carried by IR nodes, not by whitespace, so newlines
 * inside a single inline text run collapse to spaces.
 */
export function normalizeProse(input: string): string {
  let s = input.replace(/\r\n?/g, '\n');
  s = s.normalize('NFC');
  s = s.replace(ZERO_WIDTH, '');
  s = s.replace(/[ \t\n]+/g, ' ');
  return s.trim();
}

export interface CodeNormalizationResult {
  text: string;
  bomStripped: boolean;
  /** Dominant line ending observed in the ORIGINAL input. */
  lineEnding: 'lf' | 'crlf' | 'cr' | 'none' | 'mixed';
  hasFinalNewline: boolean;
}

/**
 * `norm/code@1` — for code / terminal text.
 *
 * Strip a single leading UTF-8 BOM (recorded). **Record** — never change —
 * the dominant line-ending style and the final-newline state. Nothing else:
 * no trimming, no tab/space conversion, no NFC, no whitespace collapse, no
 * trailing-newline addition or removal.
 */
export function normalizeCode(input: string): CodeNormalizationResult {
  let bomStripped = false;
  let text = input;
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
    bomStripped = true;
  }

  const crlf = (text.match(/\r\n/g) ?? []).length;
  const cr = (text.match(/\r(?!\n)/g) ?? []).length;
  const lf = (text.match(/(?<!\r)\n/g) ?? []).length;
  const kinds = [crlf > 0, cr > 0, lf > 0].filter(Boolean).length;
  let lineEnding: CodeNormalizationResult['lineEnding'];
  if (kinds === 0) lineEnding = 'none';
  else if (kinds > 1) lineEnding = 'mixed';
  else if (crlf > 0) lineEnding = 'crlf';
  else if (cr > 0) lineEnding = 'cr';
  else lineEnding = 'lf';

  const hasFinalNewline = /\r\n$|\r$|\n$/.test(text);

  return { text, bomStripped, lineEnding, hasFinalNewline };
}

/**
 * Language-token alias table for `norm/infostring@1`. Applied ONLY to the
 * Markdown fence info string, never to code.
 */
const LANGUAGE_ALIASES: Record<string, string> = {
  ts: 'typescript',
  js: 'javascript',
  py: 'python',
  rb: 'ruby',
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',
  console: 'shell',
  yml: 'yaml',
  md: 'markdown',
  'c++': 'cpp',
  'c#': 'csharp',
  cs: 'csharp',
  golang: 'go',
  rs: 'rust',
  kt: 'kotlin',
  htm: 'html',
};

/**
 * `norm/infostring@1` — lowercase, map through the alias table; an unknown
 * token passes through unchanged.
 */
export function normalizeInfoString(language: string): string {
  const key = language.trim().toLowerCase();
  return LANGUAGE_ALIASES[key] ?? key;
}
