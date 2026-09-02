/**
 * Narrow DOM helpers over the pinned DOM implementation (`decisions/0022`).
 *
 * The pipeline is written against the standard DOM lib types so the same
 * extraction code runs against a real browser `document` in Phase 9. linkedom
 * is used only to turn a fixture HTML string into a `Document`.
 */
import { parseHTML } from 'linkedom';

export const NODE_ELEMENT = 1;
export const NODE_TEXT = 3;
export const NODE_COMMENT = 8;

/** Parse a rendered-HTML fixture string into a DOM `Document` (no scripts run). */
export function parseDocument(html: string): Document {
  const looksLikeFullDoc = /<html[\s>]/i.test(html) || /<body[\s>]/i.test(html);
  const wrapped = looksLikeFullDoc
    ? html
    : `<!doctype html><html><head></head><body>${html}</body></html>`;
  const { document } = parseHTML(wrapped);
  return document as unknown as Document;
}

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

/** Visible text of an element with normalized whitespace collapsed. */
export function collapsedText(el: Element): string {
  return (el.textContent ?? '').replace(/\s+/g, ' ').trim();
}

/** Total length of anchor text within an element (link-density signal). */
export function linkTextLength(el: Element): number {
  let total = 0;
  for (const a of Array.from(el.querySelectorAll('a'))) {
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
