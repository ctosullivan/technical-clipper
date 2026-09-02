/**
 * Compact DOM → `BlockNode[]` walker for conversation messages
 * (`decisions/0011`). Messages are simpler than articles (prose, code, lists,
 * tables, quotes), so this is a focused walker rather than the article
 * extractor. Code is delegated to the standard detectors so a fenced block in
 * a message gets the same exact-text guarantees as one in an article.
 */
import {
  computeNodeId,
  normalizeProse,
  proseBlockSeed,
  referenceSeed,
  type BlockNode,
  type CodeBlockIR,
  type CodeGroupIR,
  type Diagnostic,
  type InlineNode,
  type ListItemNode,
  type TableAlignment,
  type TerminalSessionIR,
} from '@technical-clipper/core';
import { standardDetectorRegistry } from '@technical-clipper/detectors';

const NODE_ELEMENT = 1;
const NODE_TEXT = 3;
const HEADINGS = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6']);

function absolutize(href: string | null, base: string | null): string | null {
  if (!href) return null;
  try {
    return new URL(href, base ?? undefined).toString();
  } catch {
    return null;
  }
}

function inlines(el: Element, base: string | null): InlineNode[] {
  const out: InlineNode[] = [];
  for (const n of Array.from(el.childNodes)) {
    if (n.nodeType === NODE_TEXT) {
      const v = normalizeProse(n.textContent ?? '');
      if (v) out.push({ type: 'text', value: v });
      continue;
    }
    if (n.nodeType !== NODE_ELEMENT) continue;
    const c = n as Element;
    switch (c.tagName) {
      case 'A': {
        const href = absolutize(c.getAttribute('href'), base);
        const kids = inlines(c, base);
        if (href) {
          out.push({
            type: 'link',
            id: computeNodeId(
              referenceSeed({
                type: 'link',
                label: href,
                rawText: c.textContent ?? '',
              }),
            ),
            children: kids.length
              ? kids
              : [{ type: 'text', value: normalizeProse(c.textContent ?? '') }],
            href,
            title: c.getAttribute('title'),
          });
        } else out.push(...kids);
        break;
      }
      case 'EM':
      case 'I':
        out.push({ type: 'emphasis', children: inlines(c, base) });
        break;
      case 'STRONG':
      case 'B':
        out.push({ type: 'strong', children: inlines(c, base) });
        break;
      case 'DEL':
      case 'S':
        out.push({ type: 'strikethrough', children: inlines(c, base) });
        break;
      case 'CODE':
        out.push({ type: 'codeSpan', value: c.textContent ?? '' });
        break;
      case 'BR':
        out.push({ type: 'lineBreak', hard: true });
        break;
      default:
        out.push(...inlines(c, base));
    }
  }
  return out;
}

function align(cell: Element): TableAlignment {
  const s = (cell.getAttribute('style') ?? '').toLowerCase();
  if (s.includes('center')) return 'center';
  if (s.includes('right')) return 'right';
  if (s.includes('left')) return 'left';
  return 'none';
}

/** Extract ordered blocks from a message content element. */
export function extractMessageBlocks(
  content: Element,
  base: string | null,
): { blocks: BlockNode[]; diagnostics: Diagnostic[] } {
  const blocks: BlockNode[] = [];
  const diagnostics: Diagnostic[] = [];
  const counts = new Map<string, number>();
  const id = (type: string, raw: string): string =>
    computeNodeId(
      proseBlockSeed({
        type,
        parentId: null,
        ordinalAmongSameType: (() => {
          const n = counts.get(type) ?? 0;
          counts.set(type, n + 1);
          return n;
        })(),
        rawText: raw,
      }),
    );

  const list = (el: Element): ListItemNode[] =>
    Array.from(el.children)
      .filter((li) => li.tagName === 'LI')
      .map((li) => {
        const nested = Array.from(li.children).find(
          (x) => x.tagName === 'UL' || x.tagName === 'OL',
        );
        const holder = li.ownerDocument.createElement('span');
        for (const nn of Array.from(li.childNodes)) {
          if (
            nn.nodeType === NODE_ELEMENT &&
            (nn as Element).tagName !== 'UL' &&
            (nn as Element).tagName !== 'OL'
          )
            holder.appendChild(nn.cloneNode(true));
          else if (nn.nodeType === NODE_TEXT)
            holder.appendChild(nn.cloneNode(true));
        }
        const kids = inlines(holder, base);
        const itemBlocks: BlockNode[] = [];
        if (kids.length)
          itemBlocks.push({
            type: 'paragraph',
            id: id('paragraph', holder.textContent ?? ''),
            children: kids,
          });
        if (nested)
          itemBlocks.push({
            type: 'list',
            id: id('list', nested.textContent ?? ''),
            ordered: nested.tagName === 'OL',
            start: null,
            tight: true,
            items: list(nested),
          });
        return {
          type: 'listItem' as const,
          id: id('listItem', holder.textContent ?? ''),
          checked: null,
          blocks: itemBlocks,
        };
      });

  // Run the standard detectors once over the whole message and resolve
  // overlaps by priority, so a <pre>/tab-group is matched by the same code
  // path as in an article. Map each winning component to its top element.
  const componentByEl = new Map<
    Element,
    {
      kind: 'code' | 'code-group' | 'terminal';
      node: CodeBlockIR | CodeGroupIR | TerminalSessionIR;
      diagnostics: Diagnostic[];
    }
  >();
  {
    const reg = standardDetectorRegistry();
    const all = reg.all().flatMap((d) => d.detect(content));
    const priority = new Map(reg.all().map((d) => [d.id, d.priority]));
    all.sort(
      (a, b) =>
        (priority.get(b.detectorId) ?? 0) - (priority.get(a.detectorId) ?? 0),
    );
    const accepted: typeof all = [];
    for (const c of all) {
      if (
        accepted.some(
          (a) =>
            a.element === c.element ||
            a.element.contains(c.element) ||
            c.element.contains(a.element),
        )
      )
        continue;
      accepted.push(c);
      const ex = c.extract();
      componentByEl.set(c.element, {
        kind: ex.kind,
        node: ex.node,
        diagnostics: ex.diagnostics,
      });
    }
  }

  const visit = (node: Node): void => {
    if (node.nodeType !== NODE_ELEMENT) return;
    const el = node as Element;

    const component = componentByEl.get(el);
    if (component) {
      diagnostics.push(...component.diagnostics);
      if (component.kind === 'code') {
        blocks.push({ type: 'codeBlock', code: component.node as CodeBlockIR });
      } else if (component.kind === 'code-group') {
        blocks.push({
          type: 'codeGroup',
          group: component.node as CodeGroupIR,
        });
      } else {
        blocks.push({
          type: 'terminalSession',
          session: component.node as TerminalSessionIR,
        });
      }
      return;
    }

    if (HEADINGS.has(el.tagName)) {
      blocks.push({
        type: 'heading',
        id: id('heading', el.textContent ?? ''),
        level: Number(el.tagName[1]) as 1 | 2 | 3 | 4 | 5 | 6,
        children: inlines(el, base),
      });
      return;
    }
    switch (el.tagName) {
      case 'P': {
        const ic = inlines(el, base);
        if (ic.length)
          blocks.push({
            type: 'paragraph',
            id: id('paragraph', el.textContent ?? ''),
            children: ic,
          });
        return;
      }
      case 'PRE': {
        // Not claimed by any detector above — keep it, never lose it.
        blocks.push({
          type: 'htmlBlock',
          id: id('htmlBlock', el.textContent ?? ''),
          rawHtml: el.outerHTML,
        });
        return;
      }
      case 'UL':
      case 'OL':
        blocks.push({
          type: 'list',
          id: id('list', el.textContent ?? ''),
          ordered: el.tagName === 'OL',
          start: null,
          tight: true,
          items: list(el),
        });
        return;
      case 'BLOCKQUOTE':
        blocks.push({
          type: 'blockquote',
          id: id('blockquote', el.textContent ?? ''),
          callout: null,
          blocks: extractMessageBlocks(el, base).blocks,
        });
        return;
      case 'TABLE': {
        const rows = Array.from(el.querySelectorAll('tr'));
        const head = rows[0]
          ? Array.from(rows[0].querySelectorAll('th,td'))
          : [];
        blocks.push({
          type: 'table',
          id: id('table', el.textContent ?? ''),
          table: {
            header: head.map((c) => inlines(c, base)),
            alignments: head.map(align),
            rows: rows
              .slice(1)
              .map((r) =>
                Array.from(r.querySelectorAll('th,td')).map((c) =>
                  inlines(c, base),
                ),
              ),
          },
        });
        return;
      }
      case 'HR':
        blocks.push({ type: 'thematicBreak', id: id('thematicBreak', '') });
        return;
      case 'SCRIPT':
      case 'STYLE':
        return;
      default:
        for (const ch of Array.from(el.childNodes)) visit(ch);
    }
  };

  for (const ch of Array.from(content.childNodes)) visit(ch);
  return { blocks, diagnostics };
}
