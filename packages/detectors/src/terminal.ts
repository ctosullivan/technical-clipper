/**
 * `terminal/session` detector — `decisions/0013` (priority 40).
 *
 * Only fires when the DOM explicitly exposes an input/output distinction
 * (prompt spans, `data-*` markers, distinct input/output containers). An
 * ambiguous split is emitted as `approximate` + `TC-DETECT-TERMINAL-AMBIGUOUS`,
 * never a confident guess.
 */
import {
  computeNodeId,
  compositeSeed,
  makeDiagnostic,
  normalizeCode,
  DETECTOR_PRIORITY,
  type ComponentDetector,
  type Confidence,
  type DetectedComponent,
  type Diagnostic,
  type Provenance,
  type TerminalEntry,
  type TerminalSessionIR,
} from '@technical-clipper/core';

const DETECTOR_VERSION = '1.0.0';

function isTerminalContainer(el: Element): boolean {
  const cls = el.getAttribute('class') ?? '';
  if (/\b(terminal|term|console|shell-session|command-line)\b/.test(cls))
    return true;
  if (el.getAttribute('data-terminal') != null) return true;
  return (
    el.querySelector('.prompt, .command, [data-prompt], .terminal-input') !=
    null
  );
}

interface Extracted {
  entries: TerminalEntry[];
  evidence: string;
  confidence: Confidence;
  diagnostics: Diagnostic[];
}

function extractEntries(el: Element): Extracted {
  const diagnostics: Diagnostic[] = [];

  // Preferred: explicit per-segment input/output markup.
  const marked = Array.from(
    el.querySelectorAll(
      '.terminal-input, .terminal-output, .command, .output, [data-stream]',
    ),
  );
  if (marked.length > 0) {
    const entries: TerminalEntry[] = [];
    for (const seg of marked) {
      const cls = seg.getAttribute('class') ?? '';
      const ds = seg.getAttribute('data-stream');
      const stream: 'input' | 'output' =
        ds === 'input' || /\b(command|terminal-input|input)\b/.test(cls)
          ? 'input'
          : 'output';
      const norm = normalizeCode(seg.textContent ?? '');
      entries.push({
        stream,
        text: norm.text,
        hasFinalNewline: norm.hasFinalNewline,
      });
    }
    return {
      entries,
      evidence: 'explicit per-segment input/output markup',
      confidence: 'exact',
      diagnostics,
    };
  }

  // Prompt-span layout: a `.prompt` span begins each input line; the rest is
  // output. This is a reconstruction of the split, not marked structure.
  const promptSpans = Array.from(el.querySelectorAll('.prompt, [data-prompt]'));
  if (promptSpans.length > 0) {
    const raw = normalizeCode(el.textContent ?? '').text;
    const promptText = (promptSpans[0]?.textContent ?? '$ ').trim();
    const entries: TerminalEntry[] = [];
    for (const line of raw.split('\n')) {
      const isInput = line.trimStart().startsWith(promptText);
      entries.push({
        stream: isInput ? 'input' : 'output',
        text: isInput
          ? line
              .slice(line.indexOf(promptText) + promptText.length)
              .replace(/^\s/, '')
          : line,
        hasFinalNewline: false,
      });
    }
    diagnostics.push(
      makeDiagnostic('TC-DETECT-TERMINAL-AMBIGUOUS', {
        phase: 'detect',
        message:
          'terminal input/output split inferred from prompt spans, not marked structure',
      }),
    );
    return {
      entries,
      evidence: `prompt-span split on ${JSON.stringify(promptText)}`,
      confidence: 'approximate',
      diagnostics,
    };
  }

  const norm = normalizeCode(el.textContent ?? '');
  return {
    entries: [
      {
        stream: 'output',
        text: norm.text,
        hasFinalNewline: norm.hasFinalNewline,
      },
    ],
    evidence: 'no input/output markup; treated as a single output stream',
    confidence: 'approximate',
    diagnostics: [
      makeDiagnostic('TC-DETECT-TERMINAL-AMBIGUOUS', {
        phase: 'detect',
        message: 'terminal container with no input/output markup',
      }),
    ],
  };
}

export const terminalSessionDetector: ComponentDetector = {
  id: 'terminal/session',
  version: DETECTOR_VERSION,
  priority: DETECTOR_PRIORITY.terminal,
  detect(root) {
    const out: DetectedComponent[] = [];
    const seen = new Set<Element>();
    for (const el of Array.from(
      root.querySelectorAll(
        'pre, .terminal, .terminal-window, [data-terminal]',
      ),
    )) {
      if (seen.has(el) || el.closest('.monaco-editor, .cm-editor')) continue;
      if (!isTerminalContainer(el)) continue;
      const container = el.closest('.terminal, .terminal-window') ?? el;
      if (seen.has(container)) continue;
      seen.add(container);
      seen.add(el);

      out.push({
        detectorId: 'terminal/session',
        kind: 'terminal',
        element: container,
        confidenceHint: 'high',
        extract() {
          const ex = extractEntries(container);
          const id = computeNodeId(
            compositeSeed(
              'terminalSession',
              ex.entries.map((e) => `${e.stream}:${e.text}`),
            ),
          );
          const extraction: Provenance = {
            method: 'detector',
            methodVersion: DETECTOR_VERSION,
            detectorId: 'terminal/session',
            evidenceSource:
              ex.confidence === 'exact'
                ? 'dom-text-content'
                : 'dom-rendered-reconstruction',
          };
          const node: TerminalSessionIR = {
            id,
            entries: ex.entries,
            streamEvidence: ex.evidence,
            extraction,
            confidence: ex.confidence,
          };
          // Anchor the detector's diagnostics to this node so the
          // approximate/failed-artifact pairing check (decisions/0012) passes.
          const diagnostics = ex.diagnostics.map((d) => ({
            ...d,
            sourceLocation: { ...d.sourceLocation, nodeId: id },
          }));
          return { node, kind: 'terminal' as const, diagnostics };
        },
      });
    }
    return out;
  },
};
