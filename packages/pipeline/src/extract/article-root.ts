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
  const semantic =
    el.tagName === 'MAIN' ||
    el.tagName === 'ARTICLE' ||
    el.getAttribute('role') === 'main'
      ? 1
      : 0;
  return (
    text -
    5 * links -
    25 * navLikeChildren(el) +
    30 * semantic +
    10 * paragraphs
  );
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

  // Prefer the most specific container: if the top candidate strictly contains
  // another candidate that scores nearly as well, descend into the child.
  let best = scored[0];
  if (best) {
    for (const cand of scored) {
      if (
        cand !== best &&
        best.el.contains(cand.el) &&
        cand.el !== best.el &&
        cand.s >= best.s * 0.75
      ) {
        best = cand;
      }
    }
  }

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
