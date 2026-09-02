import { describe, expect, it } from 'vitest';
import { canonicalize, canonicalizePretty } from './canonical.js';

describe('canonicalize', () => {
  it('sorts object keys by unicode code point', () => {
    expect(canonicalize({ b: 1, a: 2, Z: 3 })).toBe('{"Z":3,"a":2,"b":1}');
  });

  it('omits undefined-valued fields but keeps null', () => {
    expect(canonicalize({ a: undefined, b: null, c: 1 })).toBe(
      '{"b":null,"c":1}',
    );
  });

  it('preserves array order', () => {
    expect(canonicalize([3, 1, 2])).toBe('[3,1,2]');
  });

  it('is idempotent', () => {
    const v = { z: [{ y: 1, x: 2 }], a: 'hi' };
    const once = canonicalize(v);
    expect(canonicalize(JSON.parse(once))).toBe(once);
  });

  it('rejects non-finite numbers', () => {
    expect(() => canonicalize({ n: NaN })).toThrow();
    expect(() => canonicalize({ n: Infinity })).toThrow();
  });

  it('orders astral-plane keys by code point, not UTF-16 unit', () => {
    // U+1F600 (😀) has a higher code point than U+FF00, but a lower leading
    // UTF-16 surrogate (0xD83D) — code-point ordering must put U+FF00 first.
    const out = canonicalize({ '\u{1F600}': 1, '＀': 2 });
    expect(out.indexOf('＀')).toBeLessThan(out.indexOf('\u{1F600}'));
  });

  it('pretty form is compact form re-indented, ends with one LF', () => {
    const v = { a: 1, b: [1, 2] };
    const pretty = canonicalizePretty(v);
    expect(pretty.endsWith('\n')).toBe(true);
    expect(pretty.endsWith('\n\n')).toBe(false);
    expect(JSON.stringify(JSON.parse(pretty))).toBe(
      JSON.stringify(JSON.parse(canonicalize(v))),
    );
  });

  it('pretty-prints empty containers inline', () => {
    expect(canonicalizePretty({ a: [], b: {} })).toBe(
      '{\n  "a": [],\n  "b": {}\n}\n',
    );
  });
});
