import { describe, expect, it } from 'vitest';
import {
  extractFencedContent,
  renderFencedBlock,
  selectFence,
} from './fence.js';

// Shared table — MUST match .claude/skills/markdown-clipping/scripts/
// verify-examples.mjs `fenceCases` (decisions/0021).
const CASES: { code: string; info: string; fence: string }[] = [
  { code: 'plain code', info: 'js', fence: '`'.repeat(3) },
  { code: 'a ``` b', info: '', fence: '~'.repeat(3) },
  { code: 'x ```` y\n~~~~~ z', info: 'ts', fence: '`'.repeat(5) },
  { code: 'only ~~~ tildes here', info: '', fence: '`'.repeat(3) },
  { code: 'both ` and ~ present', info: '', fence: '`'.repeat(3) },
];

describe('selectFence', () => {
  for (const c of CASES) {
    it(`chooses ${JSON.stringify(c.fence)} for ${JSON.stringify(c.code)}`, () => {
      const f = selectFence(c.code, c.info);
      expect(f.char.repeat(f.length)).toBe(c.fence);
    });
  }

  it('switches to a short tilde fence when the code has only backticks', () => {
    expect(selectFence('`'.repeat(6))).toEqual({ char: '~', length: 3 });
  });

  it('grows past the longest backtick run when tildes are also present', () => {
    expect(selectFence('```\n~~~')).toEqual({ char: '`', length: 4 });
    expect(selectFence('')).toEqual({ char: '`', length: 3 });
  });
});

describe('renderFencedBlock / extractFencedContent', () => {
  for (const c of CASES) {
    it(`round-trips ${JSON.stringify(c.code)} byte-for-byte`, () => {
      const r = renderFencedBlock({ code: c.code, language: c.info || null });
      expect(extractFencedContent(r.text)).toBe(c.code);
    });
  }

  it('normalizes the info string language token but not the code', () => {
    const r = renderFencedBlock({ code: 'const x = 1', language: 'TS' });
    expect(r.infoString).toBe('typescript');
    expect(extractFencedContent(r.text)).toBe('const x = 1');
  });

  it('appends a highlight-line spec only when allowed', () => {
    expect(
      renderFencedBlock({
        code: 'x',
        language: 'js',
        highlightLineSpec: '{1,3}',
        allowHighlightSpec: true,
      }).infoString,
    ).toBe('javascript {1,3}');
    expect(
      renderFencedBlock({
        code: 'x',
        language: 'js',
        highlightLineSpec: '{1,3}',
        allowHighlightSpec: false,
      }).infoString,
    ).toBe('javascript');
  });

  it('preserves an absent final newline inside the fence', () => {
    const r = renderFencedBlock({ code: 'no newline', language: null });
    expect(r.text).toBe('```\nno newline\n```');
    expect(extractFencedContent(r.text)).toBe('no newline');
  });
});
