import { describe, expect, it } from 'vitest';
import {
  CORE_PACKAGE_STATUS,
  NotImplementedError,
  notImplemented,
} from './index.js';

describe('core package scaffold', () => {
  it('reports scaffold status honestly rather than claiming real behaviour', () => {
    expect(CORE_PACKAGE_STATUS).toBe('scaffold');
  });

  it('notImplemented always throws, so a later phase forgetting to replace it fails loudly instead of silently passing', () => {
    expect(() => notImplemented('IR validation')).toThrow(NotImplementedError);
  });
});
