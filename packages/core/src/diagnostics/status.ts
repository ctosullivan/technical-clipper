/**
 * Export-status derivation — `decisions/0015`.
 *
 * Evaluated after IR validation. `partial` may also be forced by a
 * completeness assertion (Phase 8) reporting lost content, passed here as
 * `contentKnownIncomplete`.
 */
import type { Diagnostic, Severity } from './registry.js';

export type ExportStatus =
  'complete' | 'complete_with_warnings' | 'partial' | 'failed';

export interface ExportDecision {
  status: ExportStatus;
  /** One-line reason for the status. */
  reason: string;
  /** The extension may offer export actions only when this is true. */
  canExport: boolean;
  /** For `partial`: the completeness warning must be shown before export. */
  requiresVisibleWarning: boolean;
  counts: Record<Severity, number>;
}

/**
 * Derive the export decision from the diagnostics array and whether any
 * completeness assertion reported lost content (`decisions/0015` table).
 */
export function deriveExportStatus(
  diagnostics: readonly Diagnostic[],
  opts: { contentKnownIncomplete?: boolean; irValidationFailed?: boolean } = {},
): ExportDecision {
  const counts: Record<Severity, number> = {
    info: 0,
    warning: 0,
    error: 0,
    fatal: 0,
  };
  for (const d of diagnostics) counts[d.severity]++;

  const hasFatal = counts.fatal > 0 || opts.irValidationFailed === true;
  const hasError = counts.error > 0;
  const hasWarning = counts.warning > 0;
  const incomplete = opts.contentKnownIncomplete === true;

  if (hasFatal) {
    return {
      status: 'failed',
      reason:
        opts.irValidationFailed === true
          ? 'IR failed schema validation'
          : 'a fatal diagnostic was raised',
      canExport: false,
      requiresVisibleWarning: false,
      counts,
    };
  }
  if (hasError || incomplete) {
    return {
      status: 'partial',
      reason: hasError
        ? 'known content loss or an unresolved reference'
        : 'a completeness assertion reported lost content',
      canExport: true,
      requiresVisibleWarning: true,
      counts,
    };
  }
  if (hasWarning) {
    return {
      status: 'complete_with_warnings',
      reason: 'the capture is believed complete with non-critical warnings',
      canExport: true,
      requiresVisibleWarning: false,
      counts,
    };
  }
  return {
    status: 'complete',
    reason: 'no warnings or errors; all completeness assertions passed',
    canExport: true,
    requiresVisibleWarning: false,
    counts,
  };
}
