import { describe, expect, it } from 'vitest';
import { DETECTORS_PACKAGE_STATUS, detectComponents } from './index.js';

describe('detectors package scaffold', () => {
  it('reports scaffold status honestly rather than claiming real behaviour', () => {
    expect(DETECTORS_PACKAGE_STATUS).toBe('scaffold');
  });

  it('detectComponents always throws until Phase 5 wires up real detectors', () => {
    expect(() => detectComponents()).toThrow('component detection');
  });
});
