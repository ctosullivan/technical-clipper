/**
 * DOM subtree -> ordered `BlockNode[]` / `InlineNode[]` — `decisions/0011`,
 * `0023`. Prose text passes `norm/prose@1`; ids per `decisions/0014`.
 *
 * Code is never emitted here directly: a `<!--tc-sentinel:ID-->` comment is
 * replaced by the corresponding restored leaf from the sentinel map, and its
 * id is recorded so {@link assertSentinelBalance} can check the balance.
 */
import {
  computeNodeId,
  makeDiagnostic,
  normalizeProse,
  proseBlockSeed,
  referenceSeed,
  type BlockNode,
  type Diagnostic,
  type InlineNode,
  type ImageRef,
  type ListItemNode,
  type TableAlignment,
} from '@technical-clipper/core';
import {
  NODE_COMMENT,
  NODE_ELEMENT,
  NODE_TEXT,
  absolutizeUrl,
} from '../dom.js';
import { sentinelId, type SentinelLeaf } from '../sentinels.js';

export interface BlockExtractionContext {
  baseUrl: string | null;
  leaves: Map<string, SentinelLeaf>;
  /** Appended to as sentinels are restored. */
  restoredIds: string[];
  diagnostics: Diagnostic[];
}

const HEADING_TAGS = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6']);

/** A list that is really a reference/bibliography list — consumed into
 *  `ArticleIR.references`, not emitted as a block. */
function isReferenceList(el: Element): boolean {
  const cls = el.className ?? '';
  if (/\b(references|reflist|bibliography)\b/.test(cls)) return true;
  if (el.id === 'references') return true;
  const parent = el.parentElement;
  if (parent) {
    const pcls = parent.className ?? '';
    if (/\b(references|reflist|bibliography)\b/.test(pcls)) return true;
    if (parent.id === 'references') return true;
  }
  return false;
}

function ordinalCounter() {
  const counts = new Map<string, number>();
  return (type: string): number => {
    const next = counts.get(type) ?? 0;
    counts.set(type, next + 1);
    return next;
  };
}

// --- inline ---------------------------------------------------------------

function extractInlines(
  el: Element,
  ctx: BlockExtractionContext,
): InlineNode[] {
  const out: InlineNode[] = [];
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === NODE_TEXT) {
      const value = normalizeProse(node.textContent ?? '');
      if (value) out.push({ type: 'text', value });
      continue;
    }
    if (node.nodeType !== NODE_ELEMENT) continue;
    const child = node as Element;
    const tag = child.tagName;
    switch (tag) {
      case 'A': {
        const href = absolutizeUrl(child.getAttribute('href'), ctx.baseUrl);
        const children = extractInlines(child, ctx);
        if (href) {
          out.push({
            type: 'link',
            id: computeNodeId(
              referenceSeed({
                type: 'link',
                label: href,
                rawText: child.textContent ?? '',
              }),
            ),
            children: children.length
              ? children
              : [
                  {
                    type: 'text',
                    value: normalizeProse(child.textContent ?? ''),
                  },
                ],
            href,
            title: child.getAttribute('title'),
          });
        } else {
          out.push(...children);
        }
        break;
      }
      case 'EM':
      case 'I':
        out.push({ type: 'emphasis', children: extractInlines(child, ctx) });
        break;
      case 'STRONG':
      case 'B':
        out.push({ type: 'strong', children: extractInlines(child, ctx) });
        break;
      case 'DEL':
      case 'S':
      case 'STRIKE':
        out.push({
          type: 'strikethrough',
          children: extractInlines(child, ctx),
        });
        break;
      case 'CODE':
        out.push({ type: 'codeSpan', value: child.textContent ?? '' });
        break;
      case 'BR':
        out.push({ type: 'lineBreak', hard: true });
        break;
      case 'SUP': {
        const cls = child.className ?? '';
        if (/\breference\b/.test(cls) || child.querySelector('a[href^="#"]')) {
          const label = normalizeProse(child.textContent ?? '').replace(
            /[[\]]/g,
            '',
          );
          out.push({ type: 'citationRef', referenceId: label || '?' });
        } else {
          out.push(...extractInlines(child, ctx));
        }
        break;
      }
      case 'IMG': {
        const url = absolutizeUrl(child.getAttribute('src'), ctx.baseUrl);
        if (url) out.push({ type: 'image', image: imageRef(child, url) });
        break;
      }
      default:
        out.push(...extractInlines(child, ctx));
    }
  }
  return out;
}

function imageRef(el: Element, url: string): ImageRef {
  const w = Number(el.getAttribute('width'));
  const h = Number(el.getAttribute('height'));
  return {
    url,
    alt: el.getAttribute('alt'),
    intrinsicWidth: Number.isFinite(w) && w > 0 ? w : null,
    intrinsicHeight: Number.isFinite(h) && h > 0 ? h : null,
    resolved: false,
  };
}

// --- blocks --------------------------------------------------------------

function alignmentOf(cell: Element): TableAlignment {
  const style = (cell.getAttribute('style') ?? '').toLowerCase();
  const attr = (cell.getAttribute('align') ?? '').toLowerCase();
  const v = style.includes('text-align') ? style : attr;
  if (v.includes('center')) return 'center';
  if (v.includes('right')) return 'right';
  if (v.includes('left')) return 'left';
  return 'none';
}

function extractTable(
  el: Element,
  id: string,
  ctx: BlockExtractionContext,
): BlockNode {
  const rows = Array.from(el.querySelectorAll('tr'));
  const headerCells = rows[0]
    ? Array.from(rows[0].querySelectorAll('th, td'))
    : [];
  const header = headerCells.map((c) => extractInlines(c, ctx));
  const alignments = headerCells.map(alignmentOf);
  const body = rows
    .slice(1)
    .map((r) =>
      Array.from(r.querySelectorAll('th, td')).map((c) =>
        extractInlines(c, ctx),
      ),
    );
  return { type: 'table', id, table: { header, rows: body, alignments } };
}

function extractListItems(
  listEl: Element,
  ctx: BlockExtractionContext,
  makeId: (type: string, raw: string) => string,
): { items: ListItemNode[]; tight: boolean } {
  const items: ListItemNode[] = [];
  let tight = true;
  for (const li of Array.from(listEl.children)) {
    if (li.tagName !== 'LI') continue;

    const nested = Array.from(li.children).find(
      (c) => c.tagName === 'UL' || c.tagName === 'OL',
    );
    const checkbox = Array.from(li.children).find(
      (c) => c.tagName === 'INPUT' && c.getAttribute('type') === 'checkbox',
    );

    // Inline content of the item, excluding any nested list.
    const holder = li.ownerDocument.createElement('span');
    for (const n of Array.from(li.childNodes)) {
      if (
        n.nodeType === NODE_ELEMENT &&
        (n as Element).tagName !== 'UL' &&
        (n as Element).tagName !== 'OL'
      ) {
        holder.appendChild(n.cloneNode(true));
      } else if (n.nodeType === NODE_TEXT) {
        holder.appendChild(n.cloneNode(true));
      }
    }
    const leadInlines = extractInlines(holder, ctx);
    const rawText = holder.textContent ?? '';

    const blocks: BlockNode[] = [];
    if (leadInlines.length) {
      blocks.push({
        type: 'paragraph',
        id: makeId('paragraph', rawText),
        children: leadInlines,
      });
    }
    if (nested) {
      const sub = extractListItems(nested, ctx, makeId);
      blocks.push({
        type: 'list',
        id: makeId('list', nested.textContent ?? ''),
        ordered: nested.tagName === 'OL',
        start:
          nested.tagName === 'OL'
            ? Number(nested.getAttribute('start') ?? '1')
            : null,
        tight: sub.tight,
        items: sub.items,
      });
      tight = false;
    }

    items.push({
      type: 'listItem',
      id: makeId('listItem', rawText),
      checked: checkbox ? checkbox.hasAttribute('checked') : null,
      blocks,
    });
  }
  return { items, tight };
}

/**
 * Walk `root`'s children in document order, producing ordered block nodes.
 */
export function extractBlocks(
  root: Element,
  ctx: BlockExtractionContext,
): BlockNode[] {
  const nextOrdinal = ordinalCounter();
  const makeId = (type: string, raw: string): string =>
    computeNodeId(
      proseBlockSeed({
        type,
        parentId: null,
        ordinalAmongSameType: nextOrdinal(type),
        rawText: raw,
      }),
    );

  const blocks: BlockNode[] = [];

  const visit = (node: Node): void => {
    if (node.nodeType === NODE_COMMENT) {
      const id = sentinelId((node as Comment).data);
      if (id) {
        const leaf = ctx.leaves.get(id);
        if (leaf) {
          ctx.restoredIds.push(id);
          if (leaf.kind === 'code') {
            blocks.push({ type: 'codeBlock', code: leaf.node as never });
          } else if (leaf.kind === 'code-group') {
            blocks.push({ type: 'codeGroup', group: leaf.node as never });
          } else {
            blocks.push({
              type: 'terminalSession',
              session: leaf.node as never,
            });
          }
        }
      }
      return;
    }
    if (node.nodeType !== NODE_ELEMENT) return;
    const el = node as Element;
    const tag = el.tagName;

    if (HEADING_TAGS.has(tag)) {
      const level = Number(tag[1]) as 1 | 2 | 3 | 4 | 5 | 6;
      blocks.push({
        type: 'heading',
        id: makeId('heading', el.textContent ?? ''),
        level,
        children: extractInlines(el, ctx),
      });
      return;
    }

    switch (tag) {
      case 'P': {
        const inlines = extractInlines(el, ctx);
        if (inlines.length) {
          blocks.push({
            type: 'paragraph',
            id: makeId('paragraph', el.textContent ?? ''),
            children: inlines,
          });
        }
        return;
      }
      case 'UL':
      case 'OL': {
        if (isReferenceList(el)) return; // collected into ArticleIR.references
        const { items, tight } = extractListItems(el, ctx, makeId);
        blocks.push({
          type: 'list',
          id: makeId('list', el.textContent ?? ''),
          ordered: tag === 'OL',
          start: tag === 'OL' ? Number(el.getAttribute('start') ?? '1') : null,
          tight,
          items,
        });
        return;
      }
      case 'BLOCKQUOTE': {
        const inner: BlockNode[] = [];
        const sub = extractBlocks(el, ctx);
        inner.push(...sub);
        blocks.push({
          type: 'blockquote',
          id: makeId('blockquote', el.textContent ?? ''),
          callout: null,
          blocks: inner,
        });
        return;
      }
      case 'TABLE': {
        blocks.push(
          extractTable(el, makeId('table', el.textContent ?? ''), ctx),
        );
        return;
      }
      case 'FIGURE': {
        const img = el.querySelector('img');
        const cap = el.querySelector('figcaption');
        const url = img
          ? absolutizeUrl(img.getAttribute('src'), ctx.baseUrl)
          : null;
        if (url && img) {
          blocks.push({
            type: 'figure',
            id: makeId('figure', el.textContent ?? url),
            image: imageRef(img, url),
            caption: cap ? extractInlines(cap, ctx) : [],
            altText: img.getAttribute('alt'),
          });
        }
        return;
      }
      case 'IMG': {
        const url = absolutizeUrl(el.getAttribute('src'), ctx.baseUrl);
        if (url) {
          blocks.push({
            type: 'figure',
            id: makeId('figure', url),
            image: imageRef(el, url),
            caption: [],
            altText: el.getAttribute('alt'),
          });
        }
        return;
      }
      case 'HR':
        blocks.push({ type: 'thematicBreak', id: makeId('thematicBreak', '') });
        return;
      case 'PRE': {
        // A <pre> that survived to here was not protected by a detector; keep
        // it as an htmlBlock rather than losing it or mislabelling it as exact.
        blocks.push({
          type: 'htmlBlock',
          id: makeId('htmlBlock', el.textContent ?? ''),
          rawHtml: el.outerHTML,
        });
        ctx.diagnostics.push(
          makeDiagnostic('TC-RENDER-UNKNOWN-NODE', {
            phase: 'extract',
            severity: 'warning',
            message: 'a <pre> block was not claimed by any code detector',
          }),
        );
        return;
      }
      case 'SCRIPT':
      case 'STYLE':
      case 'NOSCRIPT':
      case 'TEMPLATE':
        return;
      case 'DIV':
      case 'SECTION':
      case 'MAIN':
      case 'ARTICLE':
      case 'HEADER':
      case 'SPAN':
        for (const child of Array.from(el.childNodes)) visit(child);
        return;
      default: {
        // Unknown block-ish element with content -> htmlBlock, never dropped.
        const text = (el.textContent ?? '').trim();
        if (text.length > 0) {
          blocks.push({
            type: 'htmlBlock',
            id: makeId('htmlBlock', text),
            rawHtml: el.outerHTML,
          });
        }
        return;
      }
    }
  };

  for (const child of Array.from(root.childNodes)) visit(child);
  return blocks;
}
