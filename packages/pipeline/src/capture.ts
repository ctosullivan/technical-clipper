/**
 * Top-level capture orchestrator (`architecture/overview.md` steps 1–7).
 *
 * Phase 4 covers the article path: clone -> detect + sentinel -> general
 * extraction -> restore -> assemble + validate `DocumentIR`. Real code
 * detectors arrive in Phase 5; adapters (incl. the conversation path) in
 * Phase 6. The `detectors` registry is injectable so later phases wire in the
 * real set without touching this file.
 */
import {
  canonicalize,
  hashCanonicalExcluding,
  hashCodeText,
  deriveExportStatus,
  makeDiagnostic,
  validateDocumentIR,
  CODE_RULESET_ID,
  INFOSTRING_RULESET_ID,
  IR_SCHEMA_VERSION,
  PROSE_RULESET_ID,
  type ArticleDocumentIR,
  type Diagnostic,
  type DocumentIR,
  type ExportDecision,
  type PageLoadState,
} from '@technical-clipper/core';
import { cloneRoot, parseDocument } from './dom.js';
import { DetectorRegistry } from './seam.js';
import { assertSentinelBalance, substituteSentinels } from './sentinels.js';
import {
  EXTRACTOR_VERSION,
  articleTitle,
  generalExtract,
} from './extract/general.js';
import { runWithNetworkTrap } from './network-trap.js';

export interface CaptureInput {
  /** Rendered HTML (fixture path) or an already-parsed document (extension path). */
  html?: string;
  doc?: Document;
  url: string;
  canonicalUrl?: string | null;
  /** ISO-8601 UTC; defaults to now. Kept injectable for deterministic tests. */
  capturedAt?: string;
  detectors?: DetectorRegistry;
  /** ClipSpec `articleRootSelector` override (`decisions/0018`). */
  forcedRootSelector?: string | null;
}

export interface CaptureResult {
  document: DocumentIR;
  export: ExportDecision;
}

function detectPageLoadState(doc: Document, observedAt: string): PageLoadState {
  const lazyImages = Array.from(
    doc.querySelectorAll('img[loading="lazy"]'),
  ).length;
  const skeletons = Array.from(
    doc.querySelectorAll(
      '.skeleton, .placeholder, [aria-busy="true"], .loading',
    ),
  ).length;
  const infinite =
    doc.querySelector('[data-infinite-scroll], .infinite-scroll') !== null;
  const streaming =
    doc.querySelector(
      '[data-streaming="true"], .result-streaming, .stop-generating',
    ) !== null;
  return {
    documentReadyState: 'complete',
    belowFoldLazyImages: lazyImages,
    skeletonOrPlaceholderNodes: skeletons,
    infiniteScrollSentinelPresent: infinite,
    conversationStreaming: streaming,
    observedAt,
  };
}

function runCapture(input: CaptureInput): CaptureResult {
  const capturedAt = input.capturedAt ?? new Date().toISOString();
  const doc = input.doc ?? parseDocument(input.html ?? '');
  const detectors = input.detectors ?? new DetectorRegistry();

  const diagnostics: Diagnostic[] = [];
  const pageLoadState = detectPageLoadState(doc, capturedAt);
  if (
    pageLoadState.belowFoldLazyImages > 0 ||
    pageLoadState.skeletonOrPlaceholderNodes > 0
  ) {
    diagnostics.push(
      makeDiagnostic('TC-BUNDLE-PAGE-INCOMPLETE', {
        phase: 'assemble',
        message: `page may not be fully loaded (${pageLoadState.belowFoldLazyImages} lazy images, ${pageLoadState.skeletonOrPlaceholderNodes} skeletons)`,
      }),
    );
  }

  const clone = cloneRoot(doc);
  const { leaves, diagnostics: sentinelDiags } = substituteSentinels(
    clone,
    detectors,
  );
  diagnostics.push(...sentinelDiags);

  const extraction = generalExtract({
    cloneRootEl: clone,
    doc,
    url: input.url,
    canonicalUrl: input.canonicalUrl ?? null,
    leaves,
    forcedRootSelector: input.forcedRootSelector ?? null,
  });
  diagnostics.push(...extraction.diagnostics);
  diagnostics.push(
    ...assertSentinelBalance(leaves, extraction.restoredSentinelIds),
  );

  const hasCode = extraction.restoredSentinelIds.length > 0;
  const captureKind: ArticleDocumentIR['captureKind'] = hasCode
    ? 'technical_article'
    : 'article';

  if (!extraction.article) {
    // No article root -> a shell document that fails validation and export.
    const shell = shellDocument(
      input,
      captureKind,
      capturedAt,
      pageLoadState,
      diagnostics,
    );
    const decision = deriveExportStatus(shell.diagnostics, {
      irValidationFailed: true,
    });
    return { document: shell, export: decision };
  }

  const blockHashes: Record<string, string> = {};
  for (const leaf of leaves.values()) {
    if (leaf.kind === 'code') {
      const cb = leaf.node as { id: string; text: string };
      blockHashes[cb.id] = hashCodeText(cb.text);
    }
  }

  const docIR: ArticleDocumentIR = {
    schemaVersion: IR_SCHEMA_VERSION,
    captureKind,
    source: {
      captureTimestamp: capturedAt,
      sourceUrl: input.url,
      canonicalUrl: input.canonicalUrl ?? null,
      title: articleTitle(doc),
      byline: metaContent(doc, 'author') ?? null,
      publishedDate:
        metaContent(doc, 'article:published_time') ??
        metaContent(doc, 'datePublished') ??
        null,
      captureScope: 'full-article',
      extractorVersion: EXTRACTOR_VERSION,
      pageLoadState,
    },
    diagnostics,
    hashes: {
      documentContentIdentity: '',
      blocks: blockHashes,
      markdown: null,
      rawPageHtml: null,
      normalizationRulesets: {
        prose: PROSE_RULESET_ID,
        code: CODE_RULESET_ID,
        infostring: INFOSTRING_RULESET_ID,
      },
    },
    body: extraction.article,
  };

  const validation = validateDocumentIR(docIR);
  docIR.diagnostics.push(...validation);

  docIR.hashes.documentContentIdentity = hashCanonicalExcluding(docIR, [
    'captureTimestamp',
    'observedAt',
    'documentContentIdentity',
  ]);
  // Freeze the compact form so a second identical capture is byte-identical.
  void canonicalize(docIR);

  const decision = deriveExportStatus(docIR.diagnostics, {
    irValidationFailed: validation.some((d) => d.severity === 'fatal'),
  });

  return { document: docIR, export: decision };
}

/** Run a capture with the network trap installed (`decisions/0001`, `0009`). */
export function capture(input: CaptureInput): CaptureResult {
  return runWithNetworkTrap(() => runCapture(input));
}

function metaContent(doc: Document, name: string): string | null {
  const el =
    doc.querySelector(`meta[name="${name}"]`) ??
    doc.querySelector(`meta[property="${name}"]`);
  return el ? el.getAttribute('content') : null;
}

function shellDocument(
  input: CaptureInput,
  captureKind: ArticleDocumentIR['captureKind'],
  capturedAt: string,
  pageLoadState: PageLoadState,
  diagnostics: Diagnostic[],
): ArticleDocumentIR {
  return {
    schemaVersion: IR_SCHEMA_VERSION,
    captureKind,
    source: {
      captureTimestamp: capturedAt,
      sourceUrl: input.url,
      canonicalUrl: input.canonicalUrl ?? null,
      title: null,
      byline: null,
      publishedDate: null,
      captureScope: 'full-article',
      extractorVersion: EXTRACTOR_VERSION,
      pageLoadState,
    },
    diagnostics,
    hashes: {
      documentContentIdentity: '',
      blocks: {},
      markdown: null,
      rawPageHtml: null,
      normalizationRulesets: {
        prose: PROSE_RULESET_ID,
        code: CODE_RULESET_ID,
        infostring: INFOSTRING_RULESET_ID,
      },
    },
    body: {
      articleRoot: {
        selectorPath: '',
        method: 'none',
        methodVersion: EXTRACTOR_VERSION,
        candidatesConsidered: [],
      },
      metadata: { lead: null, outline: [] },
      blocks: [],
      footnotes: [],
      references: [],
      removedRegions: [],
      extraction: {
        method: 'general-extractor',
        methodVersion: EXTRACTOR_VERSION,
        evidenceSource: 'dom-text-content',
      },
    },
  };
}
