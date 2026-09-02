/**
 * Hand-built IR fixtures for core unit tests. Not shipped; test-only.
 */
import type {
  ArticleDocumentIR,
  ConversationDocumentIR,
  PageLoadState,
  SourceMetadata,
} from '../ir/document.js';
import { IR_SCHEMA_VERSION } from '../ir/document.js';
import type { BlockNode } from '../ir/nodes.js';
import type { CodeBlockIR } from '../ir/code.js';
import type { Provenance } from '../provenance.js';
import { hashCodeText, hashCanonicalExcluding } from '../hash.js';
import {
  CODE_RULESET_ID,
  INFOSTRING_RULESET_ID,
  PROSE_RULESET_ID,
} from '../normalize.js';

const pageLoadState: PageLoadState = {
  documentReadyState: 'complete',
  belowFoldLazyImages: 0,
  skeletonOrPlaceholderNodes: 0,
  infiniteScrollSentinelPresent: false,
  conversationStreaming: false,
  observedAt: '2026-09-03T00:00:00.000Z',
};

export function source(
  overrides: Partial<SourceMetadata> = {},
): SourceMetadata {
  return {
    captureTimestamp: '2026-09-03T12:00:00.000Z',
    sourceUrl: 'https://example.com/article',
    canonicalUrl: 'https://example.com/article',
    title: 'Example',
    byline: null,
    publishedDate: null,
    captureScope: 'full-article',
    extractorVersion: '0.0.0',
    pageLoadState,
    ...overrides,
  };
}

export const detectorProvenance: Provenance = {
  method: 'detector',
  methodVersion: '0.0.0',
  detectorId: 'code/pre-code',
  evidenceSource: 'dom-text-content',
};

export const extractorProvenance: Provenance = {
  method: 'general-extractor',
  methodVersion: '0.0.0',
  evidenceSource: 'dom-text-content',
};

export function codeBlock(
  id: string,
  text: string,
  overrides: Partial<CodeBlockIR> = {},
): CodeBlockIR {
  return {
    id,
    text,
    hasFinalNewline: /\n$/.test(text),
    language: 'typescript',
    languageEvidence: 'class-token',
    filename: null,
    caption: null,
    highlightedLines: null,
    extraction: detectorProvenance,
    confidence: 'exact',
    evidenceSource: 'dom-text-content',
    hash: hashCodeText(text),
    ...overrides,
  };
}

export function paragraph(id: string, value: string): BlockNode {
  return { type: 'paragraph', id, children: [{ type: 'text', value }] };
}

export function articleDoc(blocks: BlockNode[]): ArticleDocumentIR {
  const doc: ArticleDocumentIR = {
    schemaVersion: IR_SCHEMA_VERSION,
    captureKind: 'article',
    source: source(),
    diagnostics: [],
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
        selectorPath: 'main',
        method: 'score',
        methodVersion: '0.0.0',
        candidatesConsidered: [{ selectorPath: 'main', score: 1 }],
      },
      metadata: { lead: null, outline: [] },
      blocks,
      footnotes: [],
      references: [],
      removedRegions: [],
      extraction: extractorProvenance,
    },
  };
  doc.hashes.documentContentIdentity = hashCanonicalExcluding(doc, [
    'captureTimestamp',
    'observedAt',
    'hashes',
  ]);
  return doc;
}

export function conversationDoc(
  messages: ConversationDocumentIR['body']['messages'],
): ConversationDocumentIR {
  return {
    schemaVersion: IR_SCHEMA_VERSION,
    captureKind: 'conversation',
    source: source({ captureScope: 'chatgpt-current-branch' }),
    diagnostics: [],
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
      conversationTitle: null,
      modelLabel: null,
      branchEvidence: {
        turnCount: messages.length,
        branchIndicator: null,
        streamingObserved: false,
        notes: 'linear conversation',
      },
      messages,
    },
  };
}
