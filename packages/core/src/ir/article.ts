/**
 * `ArticleIR` and its structural sub-contracts — `decisions/0011`.
 */
import type { BlockNode } from './nodes.js';
import type { Provenance } from '../provenance.js';

/** How the article root was selected (`decisions/0011`, Phase 4). */
export interface ArticleRootProvenance {
  /** Stable structural path / selector of the chosen root. */
  selectorPath: string;
  /** Scoring method + version used to choose it. */
  method: string;
  methodVersion: string;
  /** Candidate roots considered and their scores, best first. */
  candidatesConsidered: { selectorPath: string; score: number }[];
}

export interface ArticleMetadata {
  /** Lead / summary paragraph text, when the article exposes one. */
  lead: string | null;
  /** Ordered heading outline (level + text), for completeness assertions. */
  outline: { level: number; text: string; id: string }[];
}

/** A region excluded from the article body by main-content selection. */
export interface RemovedRegion {
  selectorPath: string;
  /** `navigation | edit-controls | cookie-ui | related-content | chrome | footer | other`. */
  reason:
    | 'navigation'
    | 'edit-controls'
    | 'cookie-ui'
    | 'related-content'
    | 'chrome'
    | 'footer'
    | 'other';
  approxTextLength: number;
}

export interface FootnoteDefinition {
  id: string;
  label: string;
  blocks: BlockNode[];
}

/** A bibliography / citation-target entry. */
export interface ReferenceEntry {
  id: string;
  /** The raw reference text as shown. */
  rawText: string;
  /** Parsed fields when the source exposes structured citation data. */
  structuredFields: Record<string, string> | null;
  /** Resolved absolute URL of the cited source, when present. */
  sourceUrl: string | null;
}

export interface ArticleIR {
  articleRoot: ArticleRootProvenance;
  metadata: ArticleMetadata;
  /** Ordered block nodes in document order. */
  blocks: BlockNode[];
  footnotes: FootnoteDefinition[];
  references: ReferenceEntry[];
  removedRegions: RemovedRegion[];
  /** Provenance of the general extraction pass. */
  extraction: Provenance;
}
