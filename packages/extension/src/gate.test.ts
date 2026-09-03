import { describe, expect, it } from 'vitest';
import { gateFor } from './gate.js';
import type { CompletenessReport } from '@technical-clipper/core';

const base: Omit<CompletenessReport, 'status'> = {
  reason: 'r',
  canExport: true,
  requiresVisibleWarning: false,
  counts: { info: 0, warning: 0, error: 0, fatal: 0 },
  code: { detected: 0, exact: 0, normalized: 0, approximate: 0, failed: 0 },
  citations: { total: 0, resolved: 0 },
  sections: { expected: 0, kept: 0 },
  warnings: [],
  diagnostics: [],
};

describe('gateFor', () => {
  it('failed → export disabled, warning banner shown', () => {
    const g = gateFor({ ...base, status: 'failed' });
    expect(g.canExport).toBe(false);
    expect(g.showWarningBanner).toBe(true);
  });

  it('partial → export allowed but a non-dismissible warning is shown', () => {
    const g = gateFor({ ...base, status: 'partial' });
    expect(g.canExport).toBe(true);
    expect(g.showWarningBanner).toBe(true);
  });

  it('complete_with_warnings → export allowed, no banner', () => {
    const g = gateFor({ ...base, status: 'complete_with_warnings' });
    expect(g.canExport).toBe(true);
    expect(g.showWarningBanner).toBe(false);
  });

  it('complete → export allowed, no banner', () => {
    expect(gateFor({ ...base, status: 'complete' })).toMatchObject({
      canExport: true,
      showWarningBanner: false,
    });
  });
});
