import { describe, expect, it } from 'vitest';
import { deriveExportStatus } from './status.js';
import {
  makeDiagnostic,
  getDiagnosticSpec,
  DIAGNOSTIC_SPECS,
} from './registry.js';

describe('makeDiagnostic', () => {
  it('uses the registry default severity and forces blocksExport for fatal', () => {
    const d = makeDiagnostic('TC-EXTRACT-NOROOT', { phase: 'extract' });
    expect(d.severity).toBe('fatal');
    expect(d.blocksExport).toBe(true);
  });

  it('lets an override raise severity but not lower it', () => {
    const raised = makeDiagnostic('TC-EXTRACT-ASSET-UNRESOLVED', {
      phase: 'extract',
      severity: 'error',
    });
    expect(raised.severity).toBe('error');
    const lowered = makeDiagnostic('TC-EXTRACT-CODE-FAILED', {
      phase: 'extract',
      severity: 'info',
    });
    expect(lowered.severity).toBe('error'); // registry default wins
  });

  it('every registered code has a unique, namespaced code string', () => {
    const codes = DIAGNOSTIC_SPECS.map((s) => s.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const c of codes) expect(c).toMatch(/^TC-[A-Z]+-[A-Z-]+$/);
    expect(getDiagnosticSpec('TC-RENDER-CODE-MISMATCH')?.defaultSeverity).toBe(
      'fatal',
    );
  });
});

describe('deriveExportStatus', () => {
  const d = (code: Parameters<typeof makeDiagnostic>[0]) =>
    makeDiagnostic(code, { phase: 'validate' });

  it('failed on any fatal, export disabled', () => {
    const r = deriveExportStatus([d('TC-VALIDATE-SCHEMA')]);
    expect(r.status).toBe('failed');
    expect(r.canExport).toBe(false);
  });

  it('failed when irValidationFailed even with no diagnostics', () => {
    expect(deriveExportStatus([], { irValidationFailed: true }).status).toBe(
      'failed',
    );
  });

  it('partial on an error, export allowed with a required visible warning', () => {
    const r = deriveExportStatus([d('TC-EXTRACT-CODE-FAILED')]);
    expect(r.status).toBe('partial');
    expect(r.canExport).toBe(true);
    expect(r.requiresVisibleWarning).toBe(true);
  });

  it('partial when a completeness assertion reports lost content', () => {
    expect(
      deriveExportStatus([], { contentKnownIncomplete: true }).status,
    ).toBe('partial');
  });

  it('complete_with_warnings on warnings only', () => {
    expect(deriveExportStatus([d('TC-EXTRACT-RECONSTRUCT')]).status).toBe(
      'complete_with_warnings',
    );
  });

  it('complete when clean', () => {
    const r = deriveExportStatus([d('TC-DETECT-OVERLAP')]); // info only
    expect(r.status).toBe('complete');
  });
});
