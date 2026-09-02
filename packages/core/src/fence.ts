/**
 * Safe Markdown fence selection — `decisions/0016`.
 *
 * Mirrors `.claude/skills/markdown-clipping/scripts/verify-examples.mjs`
 * `selectFence` (`decisions/0021` locks the two together via a shared fixture
 * table). Bytes inside a fence are never altered.
 */
import { normalizeInfoString } from './normalize.js';

/** Longest run of `char` in `s`. */
export function longestRun(s: string, char: string): number {
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
}

export interface FenceChoice {
  char: '`' | '~';
  length: number;
}

/**
 * Choose the fence character and length for a code block.
 *
 * 1. `B` = longest backtick run in the code; `T` = longest tilde run.
 * 2. Backticks, unless `B > 0 && T === 0` and the info string has no tilde
 *    -> then tildes.
 * 3. length = (longest run of the chosen char in the code) + 1, min 3.
 */
export function selectFence(code: string, infoString = ''): FenceChoice {
  const b = longestRun(code, '`');
  const t = longestRun(code, '~');
  const useTilde = b > 0 && t === 0 && !infoString.includes('~');
  const char: '`' | '~' = useTilde ? '~' : '`';
  const length = Math.max(3, longestRun(code, char) + 1);
  return { char, length };
}

export interface RenderedFence {
  /** The complete fenced block string. */
  text: string;
  fence: string;
  infoString: string;
}

/**
 * Render a fenced code block. `language` is passed through
 * `norm/infostring@1`; `highlightLineSpec` (e.g. `{1,3-5}`) is appended only
 * when `allowHighlightSpec` is set (gfm / obsidian profiles).
 */
export function renderFencedBlock(params: {
  code: string;
  language?: string | null;
  highlightLineSpec?: string | null;
  allowHighlightSpec?: boolean;
}): RenderedFence {
  const info =
    (params.language ? normalizeInfoString(params.language) : '') +
    (params.allowHighlightSpec && params.highlightLineSpec
      ? ` ${params.highlightLineSpec}`
      : '');
  const { char, length } = selectFence(params.code, info);
  const fence = char.repeat(length);
  return {
    text: `${fence}${info}\n${params.code}\n${fence}`,
    fence,
    infoString: info,
  };
}

/**
 * Extract the content of a single rendered fenced block (inverse of
 * {@link renderFencedBlock} for the single-block case). Throws if the string
 * is not a well-formed single fenced block. Used by render-back verification
 * (`decisions/0016`).
 */
export function extractFencedContent(rendered: string): string {
  const lines = rendered.split('\n');
  const first = lines[0] ?? '';
  const m = first.match(/^([`~])\1{2,}/);
  if (!m) throw new Error('no opening fence');
  const fenceRun = first.match(/^([`~]+)/)![1]!;
  for (let i = lines.length - 1; i > 0; i--) {
    if (lines[i] === fenceRun) return lines.slice(1, i).join('\n');
  }
  throw new Error('no closing fence');
}
