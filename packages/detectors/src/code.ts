/**
 * Code-block detectors — `decisions/0013`, `0004`, `0012`.
 *
 * `code/pre-code` and `code/blocklevel-code` (priority 10) handle plain
 * markup; `code/prism` and `code/highlightjs` (priority 20) handle highlighted
 * blocks, preferring an exact copy-source over token reconstruction. Overlap
 * resolution (`decisions/0013`) lets the higher-priority detector win when
 * several match the same `<pre>`.
 */
import {
  codeBlockSeed,
  computeNodeId,
  hashCodeText,
  makeDiagnostic,
  normalizeCode,
  DETECTOR_PRIORITY,
  type CodeBlockIR,
  type ComponentDetector,
  type Confidence,
  type DetectedComponent,
  type Diagnostic,
  type EvidenceSource,
  type Provenance,
} from '@technical-clipper/core';
import { looksContaminated, stripChrome } from './chrome.js';
import { inferLanguage } from './language.js';

const DETECTOR_VERSION = '1.0.0';

interface BuiltCode {
  node: CodeBlockIR;
  diagnostics: Diagnostic[];
}

interface BuildParams {
  detectorId: string;
  /** Element the text is read from (`<code>` or `<pre>`). */
  codeEl: Element;
  /** Outer element that may carry the language class. */
  containerEl: Element | null;
  /** Exact text (already-decided source string) or null to read textContent. */
  rawText: string | null;
  evidenceSource: EvidenceSource;
  /** When true the source was reconstructed → `approximate` + diagnostic. */
  reconstructed: boolean;
}

/**
 * An explicit copy-source override (some sites stash the raw source), or
 * `null` to let {@link buildCodeBlock} read the chrome-stripped textContent.
 */
function readSourceOverride(el: Element): string | null {
  for (const attr of ['data-code', 'data-raw-source', 'data-clipboard-text']) {
    const v = el.getAttribute(attr);
    if (v != null) return v;
  }
  const stashed = el.querySelector(
    'script[type="text/plain"], template.raw-source',
  );
  if (stashed) return stashed.textContent ?? '';
  return null;
}

function metaString(
  el: Element,
  containerEl: Element | null,
): {
  filename: string | null;
  highlightedLines: number[] | null;
} {
  const sources = [el, containerEl].filter((x): x is Element => x != null);
  let filename: string | null = null;
  let highlighted: number[] | null = null;
  for (const s of sources) {
    filename ??=
      s.getAttribute('data-filename') ??
      s.getAttribute('data-file') ??
      s.getAttribute('title') ??
      null;
    const dl =
      s.getAttribute('data-line') ?? s.getAttribute('data-highlight-lines');
    if (dl && !highlighted) highlighted = parseLineSpec(dl);
  }
  // A sibling caption / title bar.
  const cap =
    containerEl?.parentElement?.querySelector(
      '.code-title, .filename, figcaption',
    ) ?? null;
  if (!filename && cap) filename = (cap.textContent ?? '').trim() || null;
  return { filename, highlightedLines: highlighted };
}

function parseLineSpec(spec: string): number[] | null {
  const out: number[] = [];
  for (const part of spec.replace(/[{}]/g, '').split(',')) {
    const range = part.trim().match(/^(\d+)(?:-(\d+))?$/);
    if (!range) continue;
    const a = Number(range[1]);
    const b = range[2] ? Number(range[2]) : a;
    for (let i = a; i <= b; i++) out.push(i);
  }
  return out.length ? out : null;
}

export function buildCodeBlock(p: BuildParams): BuiltCode {
  const diagnostics: Diagnostic[] = [];
  const stripped = stripChrome(p.codeEl);
  const rawText = p.rawText ?? stripped.textContent ?? '';
  const norm = normalizeCode(rawText);
  const id = computeNodeId(
    codeBlockSeed({ text: norm.text, hasFinalNewline: norm.hasFinalNewline }),
  );

  if (looksContaminated(norm.text)) {
    diagnostics.push(
      makeDiagnostic('TC-EXTRACT-CODE-FAILED', {
        phase: 'extract',
        severity: 'warning',
        message: `${p.detectorId}: extracted text still looks contaminated by chrome`,
        sourceLocation: { nodeId: id },
      }),
    );
  }

  const lang = inferLanguage(p.codeEl, p.containerEl, norm.text);
  if (lang.lowConfidence) {
    diagnostics.push(
      makeDiagnostic('TC-EXTRACT-LANG-LOWCONF', {
        phase: 'extract',
        message: `${p.detectorId}: language '${lang.language}' inferred heuristically`,
        sourceLocation: { nodeId: id },
      }),
    );
  }

  let confidence: Confidence;
  let evidenceSource: EvidenceSource;
  if (p.reconstructed) {
    confidence = 'approximate';
    evidenceSource = 'dom-rendered-reconstruction';
    diagnostics.push(
      makeDiagnostic('TC-EXTRACT-RECONSTRUCT', {
        phase: 'extract',
        message: `${p.detectorId}: code reconstructed from token spans; whitespace may be approximate`,
        sourceLocation: { nodeId: id },
      }),
    );
  } else {
    confidence = norm.bomStripped ? 'normalized' : 'exact';
    evidenceSource = p.evidenceSource;
  }

  const meta = metaString(p.codeEl, p.containerEl);
  const extraction: Provenance = {
    method: 'detector',
    methodVersion: DETECTOR_VERSION,
    detectorId: p.detectorId,
    evidenceSource,
    ...(norm.bomStripped ? { notes: 'bomStripped' } : {}),
  };

  const node: CodeBlockIR = {
    id,
    text: norm.text,
    hasFinalNewline: norm.hasFinalNewline,
    language: lang.language,
    languageEvidence: lang.evidence,
    filename: meta.filename,
    caption: null,
    highlightedLines: meta.highlightedLines,
    extraction,
    confidence,
    evidenceSource,
    hash: hashCodeText(norm.text),
  };
  return { node, diagnostics };
}

// --- individual detectors ------------------------------------------------

function preElements(root: Element): Element[] {
  return Array.from(root.querySelectorAll('pre')).filter(
    (pre) => !pre.closest('.monaco-editor, .cm-editor, .CodeMirror'),
  );
}

/** A line-number table layout (`<table><tr><td class="ln">1<td class="code">…`). */
function lineNumberTable(pre: Element): Element | null {
  const table = pre.querySelector('table');
  if (table && table.querySelector('td.code, td.hljs-ln-code, .rouge-code')) {
    return table;
  }
  return null;
}

function makeComponent(
  detectorId: string,
  element: Element,
  build: () => BuiltCode,
): DetectedComponent {
  return {
    detectorId,
    kind: 'code',
    element,
    confidenceHint: 'high',
    extract: () => {
      const { node, diagnostics } = build();
      return { node, kind: 'code' as const, diagnostics };
    },
  };
}

/** `code/pre-code` — plain `<pre><code>` and bare `<pre>` (priority 10). */
export const preCodeDetector: ComponentDetector = {
  id: 'code/pre-code',
  version: DETECTOR_VERSION,
  priority: DETECTOR_PRIORITY.genericPreCode,
  detect(root) {
    return preElements(root)
      .filter((pre) => !pre.hasAttribute('data-tc-test-code'))
      .map((pre) => {
        const codeEl = pre.querySelector('code') ?? pre;
        return makeComponent('code/pre-code', pre, () =>
          buildCodeBlock({
            detectorId: 'code/pre-code',
            codeEl,
            containerEl: pre,
            rawText: readSourceOverride(codeEl),
            evidenceSource: 'dom-text-content',
            reconstructed: false,
          }),
        );
      });
  },
};

/** `code/blocklevel-code` — a block-level `<code>` not inside a `<pre>` (priority 10). */
export const blockLevelCodeDetector: ComponentDetector = {
  id: 'code/blocklevel-code',
  version: DETECTOR_VERSION,
  priority: DETECTOR_PRIORITY.genericPreCode,
  detect(root) {
    const out: DetectedComponent[] = [];
    for (const code of Array.from(root.querySelectorAll('code'))) {
      if (code.closest('pre')) continue;
      const style = (code.getAttribute('style') ?? '').toLowerCase();
      const cls = code.getAttribute('class') ?? '';
      const looksBlock =
        style.includes('display:block') ||
        style.includes('display: block') ||
        /\b(block|code-block|codeblock)\b/.test(cls) ||
        (code.textContent ?? '').includes('\n');
      if (!looksBlock) continue;
      out.push(
        makeComponent('code/blocklevel-code', code, () =>
          buildCodeBlock({
            detectorId: 'code/blocklevel-code',
            codeEl: code,
            containerEl: code.parentElement,
            rawText: readSourceOverride(code),
            evidenceSource: 'dom-text-content',
            reconstructed: false,
          }),
        ),
      );
    }
    return out;
  },
};

function highlightedDetector(
  id: string,
  match: (pre: Element) => boolean,
): ComponentDetector {
  return {
    id,
    version: DETECTOR_VERSION,
    priority: DETECTOR_PRIORITY.highlightedBlock,
    detect(root) {
      return preElements(root)
        .filter(match)
        .map((pre) => {
          const table = lineNumberTable(pre);
          if (table) {
            // Reconstruct from the code cells only — line numbers excluded.
            const cells = Array.from(
              table.querySelectorAll('td.code, td.hljs-ln-code, .rouge-code'),
            );
            const text = cells.map((c) => c.textContent ?? '').join('\n');
            return makeComponent(id, pre, () =>
              buildCodeBlock({
                detectorId: id,
                codeEl: pre,
                containerEl: pre,
                rawText: text,
                evidenceSource: 'dom-rendered-reconstruction',
                reconstructed: true,
              }),
            );
          }
          const codeEl = pre.querySelector('code') ?? pre;
          return makeComponent(id, pre, () =>
            buildCodeBlock({
              detectorId: id,
              codeEl,
              containerEl: pre,
              // A copy-source override wins; otherwise the chrome-stripped
              // textContent of Prism/hljs token spans reconstructs the source
              // exactly when there is no line-number layout.
              rawText: readSourceOverride(codeEl),
              evidenceSource: 'dom-text-content',
              reconstructed: false,
            }),
          );
        });
    },
  };
}

/** `code/prism` — Prism-highlighted blocks (priority 20). */
export const prismDetector = highlightedDetector('code/prism', (pre) => {
  const cls =
    (pre.getAttribute('class') ?? '') +
    ' ' +
    (pre.querySelector('code')?.getAttribute('class') ?? '');
  if (!/\blanguage-\S+/.test(cls)) return false;
  return (
    cls.includes('prism') ||
    pre.querySelector('.token') != null ||
    /\bline-numbers\b/.test(cls) ||
    lineNumberTable(pre) != null
  );
});

/** `code/highlightjs` — Highlight.js-highlighted blocks (priority 20). */
export const highlightjsDetector = highlightedDetector(
  'code/highlightjs',
  (pre) => {
    const code = pre.querySelector('code');
    return (
      (code?.getAttribute('class') ?? '').includes('hljs') ||
      (pre.getAttribute('class') ?? '').includes('hljs') ||
      pre.querySelector('.hljs-keyword, .hljs-string, .hljs-ln') != null ||
      pre.closest('.highlight, .highlighttable, .rouge-table') != null
    );
  },
);
