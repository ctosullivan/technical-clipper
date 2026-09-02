import { describe, expect, it } from 'vitest';
import {
  normalizeCode,
  normalizeInfoString,
  normalizeProse,
} from './normalize.js';

const BOM = String.fromCodePoint(0xfeff);
const ZWSP = String.fromCodePoint(0x200b);
const RLO = String.fromCodePoint(0x202e); // right-to-left override (bidi control)
const COMBINING_ACUTE = String.fromCodePoint(0x0301);
const E_ACUTE = String.fromCodePoint(0x00e9);

describe('norm/prose@1', () => {
  it('normalizes line endings, collapses inter-word whitespace, trims', () => {
    expect(normalizeProse('  a\r\n b\t c  ')).toBe('a b c');
  });

  it('applies Unicode NFC', () => {
    expect(normalizeProse(`e${COMBINING_ACUTE}`)).toBe(E_ACUTE);
  });

  it('strips zero-width and bidi-control characters', () => {
    expect(normalizeProse(`a${ZWSP}b${RLO}c`)).toBe('abc');
  });

  it('strips a leading BOM', () => {
    expect(normalizeProse(`${BOM}hello`)).toBe('hello');
  });
});

describe('norm/code@1', () => {
  it('changes nothing but records line-ending and final-newline state', () => {
    const r = normalizeCode('  const a = 1;\n\n  const b = 2;\n');
    expect(r.text).toBe('  const a = 1;\n\n  const b = 2;\n');
    expect(r.bomStripped).toBe(false);
    expect(r.lineEnding).toBe('lf');
    expect(r.hasFinalNewline).toBe(true);
  });

  it('strips exactly one leading BOM and records it', () => {
    const r = normalizeCode(`${BOM}code`);
    expect(r.text).toBe('code');
    expect(r.bomStripped).toBe(true);
  });

  it('does not add or remove a trailing newline', () => {
    expect(normalizeCode('no newline').hasFinalNewline).toBe(false);
    expect(normalizeCode('no newline').text).toBe('no newline');
  });

  it('detects crlf, mixed, and no line endings', () => {
    expect(normalizeCode('a\r\nb\r\n').lineEnding).toBe('crlf');
    expect(normalizeCode('a\r\nb\nc').lineEnding).toBe('mixed');
    expect(normalizeCode('oneline').lineEnding).toBe('none');
  });

  it('never applies NFC or whitespace collapse to code', () => {
    const src = `e${COMBINING_ACUTE}   spaced`;
    expect(normalizeCode(src).text).toBe(src);
  });
});

describe('norm/infostring@1', () => {
  it('lowercases and maps aliases', () => {
    expect(normalizeInfoString('TS')).toBe('typescript');
    expect(normalizeInfoString('Bash')).toBe('shell');
  });
  it('passes unknown tokens through unchanged (lowercased)', () => {
    expect(normalizeInfoString('Brainfuck')).toBe('brainfuck');
  });
});
