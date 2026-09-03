/**
 * Export-gate policy for the results UI — `decisions/0015`.
 */
import type { CompletenessReport } from '@technical-clipper/core';

export interface GateState {
  /** Whether copy / Obsidian / download may be offered at all. */
  canExport: boolean;
  /** Whether a non-dismissible warning banner must be shown. */
  showWarningBanner: boolean;
  /** A one-line status line for the header. */
  headline: string;
}

export function gateFor(report: CompletenessReport): GateState {
  switch (report.status) {
    case 'failed':
      return {
        canExport: false,
        showWarningBanner: true,
        headline: `Export disabled — ${report.reason}`,
      };
    case 'partial':
      return {
        canExport: true,
        showWarningBanner: true,
        headline: `Partial capture — ${report.reason}`,
      };
    case 'complete_with_warnings':
      return {
        canExport: true,
        showWarningBanner: false,
        headline: 'Captured with warnings',
      };
    case 'complete':
      return {
        canExport: true,
        showWarningBanner: false,
        headline: 'Capture complete',
      };
  }
}
