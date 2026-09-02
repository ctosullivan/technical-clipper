/**
 * Virtualized-editor guard — `decisions` non-goals; § 12 gate 11.
 *
 * Monaco / CodeMirror / Ace render only the visible lines, so their DOM is not
 * an exact source. We detect them and emit `failed` + `TC-DETECT-VIRTUALIZED`
 * rather than pretend to recover the code. Priority 20 (above generic pre/code)
 * so it wins if a `<pre>` somehow sits inside one.
 */
import {
  codeBlockSeed,
  computeNodeId,
  hashCodeText,
  makeDiagnostic,
  DETECTOR_PRIORITY,
  type CodeBlockIR,
  type ComponentDetector,
  type DetectedComponent,
} from '@technical-clipper/core';

const SELECTOR = '.monaco-editor, .cm-editor, .CodeMirror, .ace_editor';

export const virtualizedEditorDetector: ComponentDetector = {
  id: 'code/virtualized-guard',
  version: '1.0.0',
  priority: DETECTOR_PRIORITY.highlightedBlock,
  detect(root) {
    const out: DetectedComponent[] = [];
    for (const el of Array.from(root.querySelectorAll(SELECTOR))) {
      // Skip a nested editor inside another matched editor.
      if (el.parentElement?.closest(SELECTOR)) continue;
      out.push({
        detectorId: 'code/virtualized-guard',
        kind: 'code',
        element: el,
        confidenceHint: 'low',
        extract() {
          const id = computeNodeId(
            codeBlockSeed({ text: '', hasFinalNewline: false }),
          );
          const node: CodeBlockIR = {
            id,
            text: '',
            hasFinalNewline: false,
            language: null,
            languageEvidence: 'none',
            filename: null,
            caption: null,
            highlightedLines: null,
            extraction: {
              method: 'detector',
              methodVersion: '1.0.0',
              detectorId: 'code/virtualized-guard',
              evidenceSource: 'dom-rendered-reconstruction',
              notes: 'virtualized editor — exact source not recoverable',
            },
            confidence: 'failed',
            evidenceSource: 'dom-rendered-reconstruction',
            hash: hashCodeText(''),
          };
          return {
            node,
            kind: 'code' as const,
            diagnostics: [
              makeDiagnostic('TC-DETECT-VIRTUALIZED', {
                phase: 'detect',
                message:
                  'a virtualized code editor was detected; exact source recovery is out of scope',
                sourceLocation: { nodeId: id },
              }),
            ],
          };
        },
      });
    }
    return out;
  },
};
