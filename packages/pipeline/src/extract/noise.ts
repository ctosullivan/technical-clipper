/**
 * Noise removal within the selected article root — `decisions/0023`, `0024`.
 *
 * Each removal is recorded as a `RemovedRegion`. A removal that would drop a
 * heading or a large text block emits a `warning` instead of proceeding
 * silently.
 */
import { makeDiagnostic, type Diagnostic } from '@technical-clipper/core';
import type { RemovedRegion } from '@technical-clipper/core';
import { collapsedText, detach, structuralPath } from '../dom.js';
import {
  WIKIPEDIA_DROP_SELECTORS,
  WIKIPEDIA_KEEP_SELECTORS,
  looksLikeWikipedia,
} from './wikipedia-policy.js';

interface NoiseRule {
  selector: string;
  reason: RemovedRegion['reason'];
}

const GENERIC_NOISE: readonly NoiseRule[] = [
  { selector: 'nav', reason: 'navigation' },
  { selector: '[role="navigation"]', reason: 'navigation' },
  { selector: 'aside', reason: 'related-content' },
  { selector: 'footer', reason: 'footer' },
  { selector: '[role="contentinfo"]', reason: 'footer' },
  {
    selector:
      '.cookie, .cookie-banner, .cookie-consent, #cookie-banner, [aria-label*="cookie" i]',
    reason: 'cookie-ui',
  },
  {
    selector:
      '.related, .related-posts, .recommended, .read-next, .more-stories',
    reason: 'related-content',
  },
  {
    selector: '.share, .social-share, .newsletter-signup, .subscribe',
    reason: 'chrome',
  },
  { selector: '.breadcrumb, .breadcrumbs', reason: 'navigation' },
  { selector: '.edit, .edit-link, .print-link', reason: 'edit-controls' },
];

export interface NoiseResult {
  removed: RemovedRegion[];
  diagnostics: Diagnostic[];
}

/** Remove noise from `root` in place; returns what was removed. */
export function removeNoise(
  root: Element,
  ctx: {
    url: string;
    doc: Document;
    /** ClipSpec `dropSelectors` (`decisions/0018`). */
    extraDropSelectors?: readonly string[];
    /** ClipSpec `keepSelectors` — protected from removal. */
    extraKeepSelectors?: readonly string[];
  },
): NoiseResult {
  const removed: RemovedRegion[] = [];
  const diagnostics: Diagnostic[] = [];

  const rules: NoiseRule[] = [...GENERIC_NOISE];
  if (looksLikeWikipedia(ctx.doc, ctx.url)) {
    for (const selector of WIKIPEDIA_DROP_SELECTORS) {
      rules.push({ selector, reason: 'chrome' });
    }
  }
  for (const selector of ctx.extraDropSelectors ?? []) {
    rules.push({ selector, reason: 'other' });
  }

  const keepSet = new Set<Element>();
  for (const sel of ctx.extraKeepSelectors ?? []) {
    for (const el of Array.from(root.querySelectorAll(sel))) keepSet.add(el);
  }
  if (looksLikeWikipedia(ctx.doc, ctx.url)) {
    for (const sel of WIKIPEDIA_KEEP_SELECTORS) {
      for (const el of Array.from(root.querySelectorAll(sel))) keepSet.add(el);
    }
  }

  // Phase 1: collect every element to remove (deduped by identity), with the
  // path computed against the still-intact tree and the reason of the first
  // rule that matched it. Skip an element nested inside another match.
  const targets = new Map<
    Element,
    { path: string; reason: RemovedRegion['reason']; text: string }
  >();
  for (const rule of rules) {
    for (const el of Array.from(root.querySelectorAll(rule.selector))) {
      if (keepSet.has(el) || Array.from(keepSet).some((k) => el.contains(k)))
        continue;
      if (targets.has(el)) continue;
      targets.set(el, {
        path: structuralPath(el, root),
        reason: rule.reason,
        text: collapsedText(el),
      });
    }
  }

  // Phase 2: detach top-level targets only (a target inside another target is
  // covered by its ancestor's removal).
  for (const [el, info] of targets) {
    let nestedInAnother = false;
    for (const other of targets.keys()) {
      if (other !== el && other.contains(el)) {
        nestedInAnother = true;
        break;
      }
    }
    if (nestedInAnother) continue;
    if (info.text.length > 2500) {
      diagnostics.push(
        makeDiagnostic('TC-EXTRACT-SECTION-LOST', {
          phase: 'extract',
          severity: 'warning',
          message: `noise rule matched ${info.text.length} chars at ${info.path}; removed it — verify this was not article content`,
          sourceLocation: { domPath: info.path },
        }),
      );
    }
    if (detach(el)) {
      removed.push({
        selectorPath: info.path,
        reason: info.reason,
        approxTextLength: info.text.length,
      });
    }
  }

  removed.sort((a, b) => (a.selectorPath < b.selectorPath ? -1 : 1));
  return { removed, diagnostics };
}
