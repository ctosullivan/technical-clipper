/**
 * `DocumentIR` — the top-level capture container (`decisions/0011`).
 */
import type { ArticleIR } from './article.js';
import type { ConversationIR } from './conversation.js';
import type { Diagnostic } from '../diagnostics/registry.js';

/** Integer schema version — bumped on any breaking node change (`decisions/0011`). */
export const IR_SCHEMA_VERSION = 1;

export type CaptureKind = 'article' | 'technical_article' | 'conversation';

/** Incomplete-page-load signals (`decisions/0017`). */
export interface PageLoadState {
  documentReadyState: string;
  belowFoldLazyImages: number;
  skeletonOrPlaceholderNodes: number;
  infiniteScrollSentinelPresent: boolean;
  /** ChatGPT "stop generating" / streaming cursor present. */
  conversationStreaming: boolean;
  /** ISO-8601 UTC — excluded from the content-identity hash (`decisions/0016`). */
  observedAt: string;
}

export interface SourceMetadata {
  /** ISO-8601 UTC. The only intentionally volatile field (`decisions/0016`). */
  captureTimestamp: string;
  sourceUrl: string;
  canonicalUrl: string | null;
  title: string | null;
  byline: string | null;
  publishedDate: string | null;
  /** e.g. `full-article`, `chatgpt-current-branch`. */
  captureScope: string;
  extractorVersion: string;
  pageLoadState: PageLoadState;
}

/** SHA-256 hashes recorded for a capture (`decisions/0016`). */
export interface HashSet {
  /** Canonical JSON of the whole IR with volatile capture-event fields removed. */
  documentContentIdentity: string;
  /** Per code-block and per-message content hashes, keyed by node id. */
  blocks: Record<string, string>;
  /** Rendered `content.md` bytes — set by the renderer (Phase 7). */
  markdown: string | null;
  /** `raw/page.html` bytes when included (Phase 7). */
  rawPageHtml: string | null;
  /** Normalization rulesets in force. */
  normalizationRulesets: {
    prose: string;
    code: string;
    infostring: string;
  };
}

interface DocumentIRBase {
  schemaVersion: number;
  source: SourceMetadata;
  diagnostics: Diagnostic[];
  hashes: HashSet;
}

export interface ArticleDocumentIR extends DocumentIRBase {
  captureKind: 'article' | 'technical_article';
  body: ArticleIR;
}

export interface ConversationDocumentIR extends DocumentIRBase {
  captureKind: 'conversation';
  body: ConversationIR;
}

/** Discriminated on `captureKind` (`decisions/0011`). */
export type DocumentIR = ArticleDocumentIR | ConversationDocumentIR;
