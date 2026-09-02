/**
 * Test-only stub detector — exercises the sentinel seam before the real code
 * detectors land in Phase 5. Detects `<pre data-tc-test-code>` and treats its
 * `textContent` as exact code.
 */
import {
  DETECTOR_PRIORITY,
  codeBlockSeed,
  computeNodeId,
  hashCodeText,
  normalizeCode,
  type CodeBlockIR,
  type ComponentDetector,
  type DetectedComponent,
} from '@technical-clipper/core';

export const stubCodeDetector: ComponentDetector = {
  id: 'test/stub-pre',
  version: '0.0.0',
  priority: DETECTOR_PRIORITY.genericPreCode,
  detect(root: Element): DetectedComponent[] {
    const out: DetectedComponent[] = [];
    for (const el of Array.from(
      root.querySelectorAll('pre[data-tc-test-code]'),
    )) {
      out.push({
        detectorId: 'test/stub-pre',
        kind: 'code',
        element: el,
        confidenceHint: 'high',
        extract() {
          const raw = el.textContent ?? '';
          const norm = normalizeCode(raw);
          const node: CodeBlockIR = {
            id: computeNodeId(
              codeBlockSeed({
                text: norm.text,
                hasFinalNewline: norm.hasFinalNewline,
              }),
            ),
            text: norm.text,
            hasFinalNewline: norm.hasFinalNewline,
            language: el.getAttribute('data-lang'),
            languageEvidence: el.getAttribute('data-lang')
              ? 'class-token'
              : 'none',
            filename: null,
            caption: null,
            highlightedLines: null,
            extraction: {
              method: 'detector',
              methodVersion: '0.0.0',
              detectorId: 'test/stub-pre',
              evidenceSource: 'dom-text-content',
              ...(norm.bomStripped ? { notes: 'bomStripped' } : {}),
            },
            confidence: norm.bomStripped ? 'normalized' : 'exact',
            evidenceSource: 'dom-text-content',
            hash: hashCodeText(norm.text),
          };
          return { node, kind: 'code' as const, diagnostics: [] };
        },
      });
    }
    return out;
  },
};
