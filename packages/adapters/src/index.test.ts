import { describe, expect, it } from 'vitest';
import { ADAPTERS_PACKAGE_STATUS, adaptDocument } from './index.js';

describe('adapters package scaffold', () => {
  it('reports scaffold status honestly rather than claiming real behaviour', () => {
    expect(ADAPTERS_PACKAGE_STATUS).toBe('scaffold');
  });

  it('adaptDocument always throws until Phase 6 wires up real adapters', () => {
    expect(() => adaptDocument()).toThrow('adapter-based extraction');
  });
});
