import { describe, expect, it } from 'vitest';
import { hashCanonical, hashCanonicalExcluding, sha256Hex } from './hash.js';

describe('sha256Hex', () => {
  it('matches a known answer vector', () => {
    // echo -n "" | sha256sum
    expect(sha256Hex('')).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
    // echo -n "abc" | sha256sum
    expect(sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });
});

describe('hashCanonical', () => {
  it('is insensitive to key order', () => {
    expect(hashCanonical({ a: 1, b: 2 })).toBe(hashCanonical({ b: 2, a: 1 }));
  });
});

describe('hashCanonicalExcluding', () => {
  it('ignores excluded keys anywhere in the tree (content identity)', () => {
    const base = {
      source: { title: 'x', captureTimestamp: 'T1' },
      body: [1, 2],
    };
    const later = {
      source: { title: 'x', captureTimestamp: 'T2' },
      body: [1, 2],
    };
    expect(hashCanonicalExcluding(base, ['captureTimestamp'])).toBe(
      hashCanonicalExcluding(later, ['captureTimestamp']),
    );
  });

  it('still reflects a real content change', () => {
    const a = { body: [1, 2], captureTimestamp: 'T' };
    const b = { body: [1, 3], captureTimestamp: 'T' };
    expect(hashCanonicalExcluding(a, ['captureTimestamp'])).not.toBe(
      hashCanonicalExcluding(b, ['captureTimestamp']),
    );
  });
});
