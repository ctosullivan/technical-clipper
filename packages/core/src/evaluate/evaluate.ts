/**
 * `evaluateCapture` — the export-gate + completeness-report entry point
 * (`decisions/0015`). The extension (Phase 9) calls this after `capture()` and
 * shows `report` verbatim; the bundle writes `report` into the diagnostics
 * summary.
 */
import type { DocumentIR } from '../ir/document.js';
import { validateDocumentIR } from '../validate.js';
import {
  deriveExportStatus,
  type ExportDecision,
} from '../diagnostics/status.js';
import type { Diagnostic, Severity } from '../diagnostics/registry.js';
import {
  runAssertions,
  type CodeAccounting,
  type ExpectedOutlineEntry,
} from './assertions.js';

export interface CompletenessReport {
  status: ExportDecision['status'];
  reason: string;
  canExport: boolean;
  requiresVisibleWarning: boolean;
  counts: Record<Severity, number>;
  code: CodeAccounting;
  citations: { total: number; resolved: number };
  sections: { expected: number; kept: number };
  /** Human-readable capture-scope / uncertainty lines. */
  warnings: string[];
  /** The ordered diagnostics the report is derived from. */
  diagnostics: Diagnostic[];
}

export interface EvaluateOptions {
  expectedOutline?: readonly ExpectedOutlineEntry[];
  /** Skip re-validation when the caller already validated (pipeline does). */
  alreadyValidated?: boolean;
}

/**
 * Evaluate an assembled `DocumentIR`: run schema validation (unless already
 * done), the cross-stage fidelity assertions, and derive the export decision +
 * completeness report.
 */
export function evaluateCapture(
  doc: DocumentIR,
  options: EvaluateOptions = {},
): CompletenessReport {
  const validation = options.alreadyValidated ? [] : validateDocumentIR(doc);
  const assertions = runAssertions({
    doc,
    expectedOutline: options.expectedOutline,
  });

  const diagnostics: Diagnostic[] = [
    ...doc.diagnostics,
    ...validation,
    ...assertions.diagnostics,
  ];

  const decision = deriveExportStatus(diagnostics, {
    contentKnownIncomplete: assertions.contentKnownIncomplete,
    irValidationFailed: validation.some((d) => d.severity === 'fatal'),
  });

  const warnings: string[] = [];
  if (assertions.code.approximate > 0) {
    warnings.push(
      `${assertions.code.approximate} code block(s) recovered approximately`,
    );
  }
  if (assertions.code.failed > 0) {
    warnings.push(
      `${assertions.code.failed} code block(s) could not be extracted`,
    );
  }
  if (assertions.sections.expected > assertions.sections.kept) {
    warnings.push(
      `${assertions.sections.expected - assertions.sections.kept} expected section(s) missing`,
    );
  }
  if (assertions.citations.total > assertions.citations.resolved) {
    warnings.push(
      `${assertions.citations.total - assertions.citations.resolved} citation/footnote marker(s) unresolved`,
    );
  }
  if (doc.source.pageLoadState.conversationStreaming) {
    warnings.push('the conversation was still generating a response');
  }
  if (
    doc.source.pageLoadState.belowFoldLazyImages > 0 ||
    doc.source.pageLoadState.skeletonOrPlaceholderNodes > 0
  ) {
    warnings.push('the page may not have finished loading');
  }

  return {
    status: decision.status,
    reason: decision.reason,
    canExport: decision.canExport,
    requiresVisibleWarning: decision.requiresVisibleWarning,
    counts: decision.counts,
    code: assertions.code,
    citations: assertions.citations,
    sections: assertions.sections,
    warnings,
    diagnostics,
  };
}
