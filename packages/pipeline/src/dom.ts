/**
 * Narrow DOM helpers over the standard DOM lib types, so the same extraction
 * code runs against a fixture-parsed `Document` (linkedom, `src/parse.ts`) and
 * a real browser `document` in the extension. No DOM *implementation* is
 * imported here.
 */

export const NODE_ELEMENT = 1;
export const NODE_TEXT = 3;
export const NODE_COMMENT = 8;

/** Deep-clone a document's `<body>` (or `documentElement`) for mutation. */
export function cloneRoot(doc: Document): Element {
  const src =
    doc.body ??
    doc.querySelector('body') ??
    doc.documentElement ??
    doc.querySelector('html');
  if (!src) throw new Error('document has no body or documentElement to clone');
  return src.cloneNode(true) as Element;
}

/**
 * A stable structural path for a node: tag names + `nth-of-type` indices from
 * the given root. Never uses `id`/`class`/`data-*` (`decisions/0014` spirit).
 */
export function structuralPath(node: Element, root: Element): string {
  const parts: string[] = [];
  let cur: Element | null = node;
  while (cur && cur !== root) {
    const parent: Element | null = cur.parentElement;
    if (!parent) break;
    const tag = cur.tagName.toLowerCase();
    let index = 1;
    for (const sib of Array.from(parent.children)) {
      if (sib === cur) break;
      if (sib.tagName === cur.tagName) index++;
    }
    parts.unshift(`${tag}[${index}]`);
    cur = parent;
  }
  return parts.length ? parts.join('/') : node.tagName.toLowerCase();
}

/** Resolve a possibly-relative URL against the capture base; `null` on failure. */
export function absolutizeUrl(
  href: string | null | undefined,
  base: string | null,
): string | null {
  if (!href) return null;
  try {
    return new URL(href, base ?? undefined).toString();
  } catch {
    try {
      return new URL(href).toString();
    } catch {
      return null;
    }
  }
}

const NON_VISIBLE_TEXT_TAGS = new Set(['STYLE', 'SCRIPT', 'TEMPLATE']);

function visibleTextOf(node: Node): string {
  let out = '';
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === NODE_TEXT) {
      out += child.textContent ?? '';
    } else if (child.nodeType === NODE_ELEMENT) {
      if (NON_VISIBLE_TEXT_TAGS.has((child as Element).tagName)) continue;
      out += visibleTextOf(child);
    }
  }
  return out;
}

/**
 * Visible text of an element with normalized whitespace collapsed. `<style>`,
 * `<script>`, and `<template>` contents are excluded: some parsers (linkedom on
 * MediaWiki TemplateStyles blocks) leak CSS/JS as text, which must not inflate
 * text-length or link-density metrics used for scoring and noise checks.
 */
export function collapsedText(el: Element): string {
  return visibleTextOf(el).replace(/\s+/g, ' ').trim();
}

/**
 * Total length of anchor text within an element (link-density signal).
 *
 * Links inside reference lists, infoboxes, navboxes, and data tables are
 * excluded: a reference-rich article body is still an article body, and a
 * container must not be disqualified as the article root just because it holds
 * the citation list.
 */
const LINK_DENSITY_EXEMPT =
  '.reflist, .references, ol.references, .refbegin, .navbox, .vertical-navbox, .infobox, .sidebar, table';

export function linkTextLength(el: Element): number {
  const exempt = new Set<Element>();
  for (const container of Array.from(
    el.querySelectorAll(LINK_DENSITY_EXEMPT),
  )) {
    for (const a of Array.from(container.querySelectorAll('a'))) exempt.add(a);
  }
  let total = 0;
  for (const a of Array.from(el.querySelectorAll('a'))) {
    if (exempt.has(a)) continue;
    total += (a.textContent ?? '').length;
  }
  return total;
}

/** Remove an element from its parent, returning true if it was attached. */
export function detach(el: Element): boolean {
  if (el.parentNode) {
    el.parentNode.removeChild(el);
    return true;
  }
  return false;
}

/** Iterate element children in document order. */
export function childElements(el: Element): Element[] {
  return Array.from(el.children);
}
