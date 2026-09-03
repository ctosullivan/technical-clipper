/**
 * Top-level capture orchestrator (`architecture/overview.md`).
 *
 * - Resolve the ClipSpec + user toggles into an effective config
 *   (`decisions/0018`).
 * - If a conversation adapter applies (`decisions/0008`), take the
 *   `ConversationIR` path; otherwise take the article path: clone -> detect +
 *   sentinel -> general extraction -> restore.
 * - Assemble + validate a `DocumentIR`, compute hashes, derive the export
 *   status (`decisions/0015`). All inside a network trap.
 */
import {
  canonicalize,
  hashCanonicalExcluding,
  hashCodeText,
  evaluateCapture,
  makeDiagnostic,
  validateDocumentIR,
  DetectorRegistry,
  CODE_RULESET_ID,
  INFOSTRING_RULESET_ID,
  IR_SCHEMA_VERSION,
  PROSE_RULESET_ID,
  type ArticleDocumentIR,
  type BlockNode,
  type CompletenessReport,
  type ConversationDocumentIR,
  type Diagnostic,
  type DocumentIR,
  type ExportDecision,
  type HashSet,
  type PageLoadState,
} from '@technical-clipper/core';
import { standardDetectors } from '@technical-clipper/detectors';
import {
  mergeEffectiveConfig,
  resolveClipSpec,
  standardConversationAdapters,
  type ClipSpec,
  type ConversationAdapter,
  type UserToggles,
} from '@technical-clipper/adapters';
import { cloneRoot, parseDocument } from './dom.js';
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
  /** Conversation adapters to try; defaults to the standard set. */
  adapters?: readonly ConversationAdapter[];
  /** ClipSpec documents to resolve against `url` (`decisions/0018`). */
  clipSpecs?: readonly ClipSpec[];
  /** Explicit user toggles (highest precedence). */
  userConfig?: UserToggles;
  /** Direct article-root override (bypasses ClipSpec). */
  forcedRootSelector?: string | null;
}

export interface CaptureResult {
  document: DocumentIR;
  export: ExportDecision;
  /** Cross-stage completeness report (`decisions/0015`, Phase 8). */
  report: CompletenessReport;
}

function emptyHashes(): HashSet {
  return {
    documentContentIdentity: '',
    blocks: {},
    markdown: null,
    rawPageHtml: null,
    normalizationRulesets: {
      prose: PROSE_RULESET_ID,
      code: CODE_RULESET_ID,
      infostring: INFOSTRING_RULESET_ID,
    },
  };
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

function metaContent(doc: Document, name: string): string | null {
  const el =
    doc.querySelector(`meta[name="${name}"]`) ??
    doc.querySelector(`meta[property="${name}"]`);
  return el ? el.getAttribute('content') : null;
}

/** Walk block nodes, collecting per-code-block hashes keyed by node id. */
function collectCodeHashes(
  blocks: readonly BlockNode[],
  out: Record<string, string>,
): void {
  for (const b of blocks) {
    switch (b.type) {
      case 'codeBlock':
        out[b.code.id] = hashCodeText(b.code.text);
        break;
      case 'codeGroup':
        for (const m of b.group.members)
          out[m.code.id] = hashCodeText(m.code.text);
        break;
      case 'blockquote':
      case 'footnoteDefinition':
        collectCodeHashes(b.blocks, out);
        break;
      case 'listItem':
        collectCodeHashes(b.blocks, out);
        break;
      case 'list':
        for (const item of b.items) collectCodeHashes(item.blocks, out);
        break;
      default:
        break;
    }
  }
}

/** Common finalize: hashes, validation, export decision. Mutates `doc`. */
function finalize(doc: DocumentIR): CaptureResult {
  const validation = validateDocumentIR(doc);
  doc.diagnostics.push(...validation);

  const blockHashes: Record<string, string> = {};
  if (doc.captureKind === 'conversation') {
    for (const m of doc.body.messages) {
      blockHashes[m.id] = m.hash;
      collectCodeHashes(m.blocks, blockHashes);
    }
  } else {
    collectCodeHashes(doc.body.blocks, blockHashes);
  }
  doc.hashes.blocks = blockHashes;
  doc.hashes.documentContentIdentity = hashCanonicalExcluding(doc, [
    'captureTimestamp',
    'observedAt',
    'documentContentIdentity',
  ]);
  void canonicalize(doc);

  // Phase 8: cross-stage completeness assertions + the export decision.
  const report = evaluateCapture(doc, { alreadyValidated: true });
  // The assertion diagnostics that were not already on the doc get appended.
  const known = new Set(doc.diagnostics);
  for (const d of report.diagnostics)
    if (!known.has(d)) doc.diagnostics.push(d);

  const decision: ExportDecision = {
    status: report.status,
    reason: report.reason,
    canExport: report.canExport,
    requiresVisibleWarning: report.requiresVisibleWarning,
    counts: report.counts,
  };
  return { document: doc, export: decision, report };
}

function runCapture(input: CaptureInput): CaptureResult {
  const capturedAt = input.capturedAt ?? new Date().toISOString();
  const doc = input.doc ?? parseDocument(input.html ?? '');
  const canonicalUrl = input.canonicalUrl ?? null;

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

  // --- ClipSpec + effective config (decisions/0018) ---
  const clipResolution = resolveClipSpec(input.url, input.clipSpecs ?? []);
  diagnostics.push(...clipResolution.diagnostics);
  const config = mergeEffectiveConfig(clipResolution.spec, input.userConfig);

  // --- conversation path (decisions/0008) ---
  const conversationAdapters = input.adapters ?? standardConversationAdapters;
  const applicable = conversationAdapters.filter((a) =>
    a.appliesTo({ url: input.url, doc }),
  );
  if (applicable.length > 1) {
    diagnostics.push(
      makeDiagnostic('TC-ADAPT-MULTI-SITE', {
        phase: 'adapt',
        message: `${applicable.length} conversation adapters matched`,
      }),
    );
  }
  const convAdapter = applicable[0];
  if (convAdapter) {
    const result = convAdapter.adapt({ doc, url: input.url, canonicalUrl });
    diagnostics.push(...result.diagnostics);
    const convDoc: ConversationDocumentIR = {
      schemaVersion: IR_SCHEMA_VERSION,
      captureKind: 'conversation',
      source: {
        captureTimestamp: capturedAt,
        sourceUrl: input.url,
        canonicalUrl,
        title: result.body.conversationTitle,
        byline: null,
        publishedDate: null,
        captureScope: result.captureScope,
        extractorVersion: `${convAdapter.name}@${convAdapter.version}`,
        pageLoadState,
      },
      diagnostics,
      hashes: emptyHashes(),
      body: result.body,
    };
    return finalize(convDoc);
  }

  // --- article path ---
  const detectors =
    input.detectors ??
    new DetectorRegistry().registerAll(
      standardDetectors.filter(
        (d) => !config.suppressedDetectorIds.includes(d.id),
      ),
    );

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
    canonicalUrl,
    leaves,
    forcedRootSelector:
      input.forcedRootSelector ?? config.articleRootSelector ?? null,
    extraDropSelectors: config.dropSelectors,
    extraKeepSelectors: config.keepSelectors,
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
    const shell = shellDocument(
      input,
      captureKind,
      capturedAt,
      pageLoadState,
      diagnostics,
    );
    const report = evaluateCapture(shell);
    const decision: ExportDecision = {
      status: report.status,
      reason: report.reason,
      canExport: report.canExport,
      requiresVisibleWarning: report.requiresVisibleWarning,
      counts: report.counts,
    };
    return { document: shell, export: decision, report };
  }

  const docIR: ArticleDocumentIR = {
    schemaVersion: IR_SCHEMA_VERSION,
    captureKind,
    source: {
      captureTimestamp: capturedAt,
      sourceUrl: input.url,
      canonicalUrl,
      title: articleTitle(doc),
      byline: metaContent(doc, 'author'),
      publishedDate:
        metaContent(doc, 'article:published_time') ??
        metaContent(doc, 'datePublished'),
      captureScope: 'full-article',
      extractorVersion: EXTRACTOR_VERSION,
      pageLoadState,
    },
    diagnostics,
    hashes: emptyHashes(),
    body: extraction.article,
  };
  return finalize(docIR);
}

/** Run a capture with the network trap installed (`decisions/0001`, `0009`). */
export function capture(input: CaptureInput): CaptureResult {
  return runWithNetworkTrap(() => runCapture(input));
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
    hashes: emptyHashes(),
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
