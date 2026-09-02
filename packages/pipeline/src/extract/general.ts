/**
 * General article extraction — orchestrates root selection, noise removal,
 * block extraction, and footnote/reference collection into an `ArticleIR`
 * (`decisions/0005`, `0023`).
 */
import {
  computeNodeId,
  makeDiagnostic,
  normalizeProse,
  referenceSeed,
  type ArticleIR,
  type Diagnostic,
  type FootnoteDefinition,
  type Provenance,
  type ReferenceEntry,
} from '@technical-clipper/core';
import { collapsedText } from '../dom.js';
import type { SentinelLeaf } from '../sentinels.js';
import { extractBlocks, type BlockExtractionContext } from './blocks.js';
import { removeNoise } from './noise.js';
import { selectArticleRoot } from './article-root.js';
import {
  WIKIPEDIA_REFERENCE_NOISE_SELECTORS,
  looksLikeWikipedia,
} from './wikipedia-policy.js';

export const EXTRACTOR_VERSION = '1.0.0';

export interface GeneralExtractionInput {
  cloneRootEl: Element;
  doc: Document;
  url: string;
  canonicalUrl: string | null;
  leaves: Map<string, SentinelLeaf>;
  forcedRootSelector?: string | null;
  /** ClipSpec `dropSelectors` / `keepSelectors` (`decisions/0018`). */
  extraDropSelectors?: readonly string[];
  extraKeepSelectors?: readonly string[];
}

export interface GeneralExtractionResult {
  article: ArticleIR | null;
  restoredSentinelIds: string[];
  diagnostics: Diagnostic[];
}

function collectFootnotes(
  root: Element,
  ctx: BlockExtractionContext,
): FootnoteDefinition[] {
  const defs: FootnoteDefinition[] = [];
  // Markdown-style footnotes only. Wikipedia `cite_note` items are references,
  // collected by collectReferences.
  for (const el of Array.from(
    root.querySelectorAll('[id^="fn:"], .footnotes li, [role="doc-footnote"]'),
  )) {
    const label =
      (el.getAttribute('id') ?? '').replace(/^fn:?/, '') ||
      String(defs.length + 1);
    const text = normalizeProse(el.textContent ?? '');
    if (!text) continue;
    defs.push({
      id: computeNodeId(
        referenceSeed({ type: 'footnoteDefinition', label, rawText: text }),
      ),
      label,
      blocks: [
        {
          type: 'paragraph',
          id: computeNodeId(
            referenceSeed({ type: 'paragraph', label, rawText: text }),
          ),
          children: [{ type: 'text', value: text }],
        },
      ],
    });
  }
  void ctx;
  return defs;
}

function collectReferences(
  root: Element,
  isWikipedia: boolean,
): ReferenceEntry[] {
  const refs: ReferenceEntry[] = [];
  const containers = root.querySelectorAll(
    '.references, ol.references, .reflist, #references, .bibliography',
  );
  for (const container of Array.from(containers)) {
    for (const li of Array.from(container.querySelectorAll('li'))) {
      if (isWikipedia) {
        for (const sel of WIKIPEDIA_REFERENCE_NOISE_SELECTORS) {
          for (const n of Array.from(li.querySelectorAll(sel))) n.remove();
        }
      }
      const rawText = normalizeProse(li.textContent ?? '');
      if (!rawText) continue;
      const anchor = li.querySelector('a[href^="http"]');
      refs.push({
        id: computeNodeId(
          referenceSeed({
            type: 'reference',
            label: li.getAttribute('id') ?? rawText.slice(0, 24),
            rawText,
          }),
        ),
        rawText,
        structuredFields: null,
        sourceUrl: anchor ? anchor.getAttribute('href') : null,
      });
    }
  }
  return refs;
}

export function generalExtract(
  input: GeneralExtractionInput,
): GeneralExtractionResult {
  const diagnostics: Diagnostic[] = [];
  const isWikipedia = looksLikeWikipedia(input.doc, input.url);

  // Remove structural chrome (nav/aside/footer/cookie/…) from the whole clone
  // first, so it is recorded as RemovedRegion and cannot skew root scoring.
  const noise = removeNoise(input.cloneRootEl, {
    url: input.url,
    doc: input.doc,
    extraDropSelectors: input.extraDropSelectors,
    extraKeepSelectors: input.extraKeepSelectors,
  });
  diagnostics.push(...noise.diagnostics);

  const selection = selectArticleRoot(
    input.cloneRootEl,
    input.forcedRootSelector,
  );
  if (selection.root === null) {
    return {
      article: null,
      restoredSentinelIds: [],
      diagnostics: [...diagnostics, ...selection.diagnostics],
    };
  }
  diagnostics.push(...selection.diagnostics);

  const root = selection.root;

  if (isWikipedia && root.querySelector('.infobox')) {
    diagnostics.push(
      makeDiagnostic('TC-EXTRACT-INFOBOX-POLICY', {
        phase: 'extract',
        message: 'infobox included as a table node per decisions/0024',
      }),
    );
  }

  const restoredIds: string[] = [];
  const blockCtx: BlockExtractionContext = {
    baseUrl: input.canonicalUrl ?? input.url,
    leaves: input.leaves,
    restoredIds,
    diagnostics,
  };

  const blocks = extractBlocks(root, blockCtx);
  const footnotes = collectFootnotes(root, blockCtx);
  const references = collectReferences(root, isWikipedia);

  if (blocks.length === 0) {
    diagnostics.push(
      makeDiagnostic('TC-ASSEMBLE-EMPTY', {
        phase: 'extract',
        message: 'article root produced no blocks',
      }),
    );
  }

  const extraction: Provenance = {
    method: 'general-extractor',
    methodVersion: EXTRACTOR_VERSION,
    evidenceSource: 'dom-text-content',
  };

  const outline = blocks
    .filter(
      (b): b is Extract<(typeof blocks)[number], { type: 'heading' }> =>
        b.type === 'heading',
    )
    .map((h) => ({
      level: h.level,
      text: h.children
        .map((c) => ('value' in c ? c.value : ''))
        .join('')
        .trim(),
      id: h.id,
    }));

  const article: ArticleIR = {
    articleRoot: selection.provenance,
    metadata: {
      lead: firstParagraphText(blocks),
      outline,
    },
    blocks,
    footnotes,
    references,
    removedRegions: noise.removed,
    extraction,
  };

  return { article, restoredSentinelIds: restoredIds, diagnostics };
}

function firstParagraphText(blocks: ArticleIR['blocks']): string | null {
  for (const b of blocks) {
    if (b.type === 'paragraph') {
      const text = b.children
        .map((c) => ('value' in c ? c.value : ''))
        .join('')
        .trim();
      if (text) return text;
    }
  }
  return null;
}

export function articleTitle(doc: Document): string | null {
  const h1 = doc.querySelector('h1');
  if (h1) {
    const t = collapsedText(h1);
    if (t) return t;
  }
  const title = doc.querySelector('title');
  return title ? collapsedText(title) || null : null;
}
