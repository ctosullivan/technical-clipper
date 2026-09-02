import { describe, expect, it } from 'vitest';
import {
  codeBlockSeed,
  computeNodeId,
  dedupeIds,
  proseBlockSeed,
} from './ids.js';

describe('computeNodeId', () => {
  it('is deterministic and 16 lowercase base32 chars', () => {
    const id = computeNodeId(
      proseBlockSeed({
        type: 'paragraph',
        parentId: null,
        ordinalAmongSameType: 0,
        rawText: 'Hello world',
      }),
    );
    expect(id).toMatch(/^[a-z2-7]{16}$/);
    expect(id).toBe(
      computeNodeId(
        proseBlockSeed({
          type: 'paragraph',
          parentId: null,
          ordinalAmongSameType: 0,
          rawText: 'Hello world',
        }),
      ),
    );
  });

  it('is stable under prose whitespace variation (norm/prose@1 in the seed)', () => {
    const a = computeNodeId(
      proseBlockSeed({
        type: 'paragraph',
        parentId: null,
        ordinalAmongSameType: 0,
        rawText: '  Hello   world ',
      }),
    );
    const b = computeNodeId(
      proseBlockSeed({
        type: 'paragraph',
        parentId: null,
        ordinalAmongSameType: 0,
        rawText: 'Hello world',
      }),
    );
    expect(a).toBe(b);
  });

  it('distinguishes identical text at different sibling ordinals', () => {
    const a = computeNodeId(
      proseBlockSeed({
        type: 'paragraph',
        parentId: 'p',
        ordinalAmongSameType: 0,
        rawText: 'same',
      }),
    );
    const b = computeNodeId(
      proseBlockSeed({
        type: 'paragraph',
        parentId: 'p',
        ordinalAmongSameType: 1,
        rawText: 'same',
      }),
    );
    expect(a).not.toBe(b);
  });

  it('content-addresses code on exact bytes incl. final-newline state', () => {
    const a = computeNodeId(
      codeBlockSeed({ text: 'x', hasFinalNewline: false }),
    );
    const b = computeNodeId(
      codeBlockSeed({ text: 'x\n', hasFinalNewline: true }),
    );
    expect(a).not.toBe(b);
    expect(a).toBe(
      computeNodeId(codeBlockSeed({ text: 'x', hasFinalNewline: false })),
    );
  });
});

describe('dedupeIds', () => {
  it('suffixes only the repeated occurrences, keeping order', () => {
    expect(dedupeIds(['a', 'b', 'a', 'a'])).toEqual(['a', 'b', 'a-2', 'a-3']);
  });
});
