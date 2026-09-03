/**
 * Deterministic article-root selection — `decisions/0023`.
 */
import {
  makeDiagnostic,
  type ArticleRootProvenance,
  type Diagnostic,
} from '@technical-clipper/core';
import {
  childElements,
  collapsedText,
  linkTextLength,
  structuralPath,
} from '../dom.js';

export const ROOT_SELECTION_VERSION = '1.0.0';

const CANDIDATE_SELECTORS = [
  'main',
  'article',
  '[role="main"]',
  '#content',
  '#main',
  '#main-content',
  '.mw-parser-output',
  '#mw-content-text',
  '.post-content',
  '.entry-content',
  '.article-body',
];

const NAV_LIKE = new Set(['NAV', 'ASIDE', 'FOOTER']);

function navLikeChildren(el: Element): number {
  let n = 0;
  for (const child of childElements(el)) {
    if (NAV_LIKE.has(child.tagName)) n++;
    const role = child.getAttribute('role');
    if (role === 'navigation' || role === 'contentinfo') n++;
    if (/\bnavbox\b/.test(child.className ?? '')) n++;
  }
  return n;
}

function score(el: Element): number {
  const text = collapsedText(el).length;
  const links = linkTextLength(el);
  const paragraphs = el.querySelectorAll('p').length;
  const headings = el.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
  const semantic =
    el.tagName === 'MAIN' ||
    el.tagName === 'ARTICLE' ||
    el.getAttribute('role') === 'main'
      ? 1
      : 0;
  return (
    text -
    // Link density never drives a text-rich container below ~half its text.
    Math.min(5 * links, 0.5 * text) -
    25 * navLikeChildren(el) +
    30 * semantic +
    10 * paragraphs +
    // A container spanning many headings is more likely the whole article than
    // any single dense section within it.
    15 * headings
  );
}

interface Scored {
  el: Element;
  s: number;
  paragraphs: number;
  path: string;
}

/**
 * Walk the scored-candidate lattice to the container that best represents the
 * whole article: ascend out of a single dense section that is really one of
 * several sibling sections (MediaWiki Parsoid output), then descend past any
 * chrome-padded wrapper or decoy sibling. Both passes run to a fixpoint.
 */
function refineRoot(start: Scored, scored: readonly Scored[]): Scored {
  let cur = start;

  let advanced = true;
  while (advanced) {
    advanced = false;
    const ancestors = scored
      .filter((c) => c.el !== cur.el && c.el.contains(cur.el))
      .sort((a, b) => (a.el.contains(b.el) ? 1 : -1)); // innermost first
    for (const parent of ancestors) {
      const enclosesOtherSection = scored.some(
        (c) =>
          c.el !== cur.el &&
          c.el !== parent.el &&
          parent.el.contains(c.el) &&
          !c.el.contains(cur.el) &&
          !cur.el.contains(c.el) &&
          c.s >= cur.s * 0.4,
      );
      if (enclosesOtherSection && parent.s >= cur.s * 0.5) {
        cur = parent;
        advanced = true;
        break;
      }
    }
  }

  advanced = true;
  while (advanced) {
    advanced = false;
    for (const cand of scored) {
      if (cand === cur || cand.el === cur.el || !cur.el.contains(cand.el))
        continue;
      const pFrac = cur.paragraphs > 0 ? cand.paragraphs / cur.paragraphs : 0;
      const sFrac = cur.s > 0 ? cand.s / cur.s : cand.s >= cur.s ? 1 : 0;
      const wrapperShed = pFrac >= 0.95 && sFrac >= 0.3;
      const ambiguousRoot = pFrac >= 0.6 && sFrac >= 0.75;
      if (wrapperShed || ambiguousRoot) {
        cur = cand;
        advanced = true;
        break;
      }
    }
  }

  return cur;
}

export interface RootSelection {
  root: Element;
  provenance: ArticleRootProvenance;
  diagnostics: Diagnostic[];
}

/**
 * Choose the article root from `cloneRootEl`. Returns `null` (with a fatal
 * diagnostic) when no candidate is credible.
 */
export function selectArticleRoot(
  cloneRootEl: Element,
  forcedSelector?: string | null,
): RootSelection | { root: null; diagnostics: Diagnostic[] } {
  const seen = new Set<Element>();
  const candidates: Element[] = [];

  const consider = (el: Element | null): void => {
    if (el && !seen.has(el)) {
      seen.add(el);
      candidates.push(el);
    }
  };

  if (forcedSelector) {
    const forced = cloneRootEl.querySelector(forcedSelector);
    if (forced) {
      return {
        root: forced,
        provenance: {
          selectorPath: structuralPath(forced, cloneRootEl),
          method: 'clipspec-forced',
          methodVersion: ROOT_SELECTION_VERSION,
          candidatesConsidered: [
            {
              selectorPath: structuralPath(forced, cloneRootEl),
              score: score(forced),
            },
          ],
        },
        diagnostics: [],
      };
    }
  }

  for (const sel of CANDIDATE_SELECTORS) {
    for (const el of Array.from(cloneRootEl.querySelectorAll(sel)))
      consider(el);
  }
  for (const el of Array.from(cloneRootEl.querySelectorAll('div, section'))) {
    if (
      collapsedText(el).length > 400 &&
      el.querySelectorAll('p').length >= 2
    ) {
      consider(el);
    }
  }
  consider(cloneRootEl);

  const scored = candidates
    .map((el) => ({
      el,
      s: score(el),
      paragraphs: el.querySelectorAll('p').length,
      path: structuralPath(el, cloneRootEl),
    }))
    .filter((c) => c.paragraphs > 0)
    .sort((a, b) => (b.s !== a.s ? b.s - a.s : a.path < b.path ? -1 : 1));

  // Refine the top-scoring candidate to the container that best represents the
  // whole article (see refineRoot).
  const first = scored[0];
  const best = first ? refineRoot(first, scored) : undefined;

  if (!best || best.s < 50 || best.paragraphs === 0) {
    return {
      root: null,
      diagnostics: [
        makeDiagnostic('TC-EXTRACT-NOROOT', {
          phase: 'extract',
          message: 'no candidate had a credible content score or any paragraph',
        }),
      ],
    };
  }

  return {
    root: best.el,
    provenance: {
      selectorPath: best.path,
      method: 'density-score',
      methodVersion: ROOT_SELECTION_VERSION,
      candidatesConsidered: scored.slice(0, 8).map((c) => ({
        selectorPath: c.path,
        score: c.s,
      })),
    },
    diagnostics: [],
  };
}
