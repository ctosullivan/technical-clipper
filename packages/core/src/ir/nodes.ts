/**
 * Ordered block and inline node contracts — `decisions/0011`.
 *
 * One shared node set is used by both `ArticleIR` and `MessageIR`
 * (`decisions/0011` — messages contain the same prose/code structures as
 * articles, so the renderer and validator stay single-implementation).
 */
import type { CodeBlockIR, CodeGroupIR, TerminalSessionIR } from './code.js';

// --- Inline nodes ----------------------------------------------------------

export interface TextNode {
  type: 'text';
  value: string;
}
export interface EmphasisNode {
  type: 'emphasis';
  children: InlineNode[];
}
export interface StrongNode {
  type: 'strong';
  children: InlineNode[];
}
export interface StrikethroughNode {
  type: 'strikethrough';
  children: InlineNode[];
}
export interface CodeSpanNode {
  type: 'codeSpan';
  /** Exact span text. */
  value: string;
}
export interface LinkNode {
  type: 'link';
  /** Stable id (`decisions/0014`) — link destinations are referenceable. */
  id: string;
  children: InlineNode[];
  /** Resolved absolute URL. */
  href: string;
  title: string | null;
}
export interface ImageInlineNode {
  type: 'image';
  image: ImageRef;
}
export interface FootnoteRefNode {
  type: 'footnoteRef';
  label: string;
}
export interface CitationRefNode {
  type: 'citationRef';
  referenceId: string;
}
export interface LineBreakNode {
  type: 'lineBreak';
  hard: boolean;
}
export interface RawInlineHtmlNode {
  type: 'rawInlineHtml';
  /** Stored verbatim; emitted only after allowlist sanitization (`decisions/0019`). */
  rawHtml: string;
}

export type InlineNode =
  | TextNode
  | EmphasisNode
  | StrongNode
  | StrikethroughNode
  | CodeSpanNode
  | LinkNode
  | ImageInlineNode
  | FootnoteRefNode
  | CitationRefNode
  | LineBreakNode
  | RawInlineHtmlNode;

// --- Shared value objects ------------------------------------------------

/** A referenced remote image — never downloaded (`decisions/0011`, `0017`). */
export interface ImageRef {
  /** Resolved absolute URL. */
  url: string;
  alt: string | null;
  intrinsicWidth: number | null;
  intrinsicHeight: number | null;
  /** Always `false` in the MVP — assets are never fetched. */
  resolved: false;
}

export type TableAlignment = 'left' | 'center' | 'right' | 'none';

export interface TableIR {
  /** Header row cells, each a list of inlines. */
  header: InlineNode[][];
  /** Body rows, each a list of cells, each a list of inlines. */
  rows: InlineNode[][][];
  /** One alignment per column, header order. */
  alignments: TableAlignment[];
}

// --- Block nodes --------------------------------------------------------

export interface HeadingNode {
  type: 'heading';
  id: string;
  /** 1–6. */
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: InlineNode[];
}
export interface ParagraphNode {
  type: 'paragraph';
  id: string;
  children: InlineNode[];
}
export interface ListNode {
  type: 'list';
  id: string;
  ordered: boolean;
  /** First number for an ordered list (usually 1). */
  start: number | null;
  tight: boolean;
  items: ListItemNode[];
}
export interface ListItemNode {
  type: 'listItem';
  id: string;
  /** `[ ]` / `[x]` task marker, or `null` for a plain item. */
  checked: boolean | null;
  blocks: BlockNode[];
}
export interface BlockquoteNode {
  type: 'blockquote';
  id: string;
  /** Set when an adapter recognised this quote as an admonition/callout. */
  callout: { kind: string; title: string | null; inferred: boolean } | null;
  blocks: BlockNode[];
}
export interface CodeBlockNode {
  type: 'codeBlock';
  code: CodeBlockIR;
}
export interface CodeGroupNode {
  type: 'codeGroup';
  group: CodeGroupIR;
}
export interface TerminalSessionNode {
  type: 'terminalSession';
  session: TerminalSessionIR;
}
export interface TableNode {
  type: 'table';
  id: string;
  table: TableIR;
}
export interface FigureNode {
  type: 'figure';
  id: string;
  image: ImageRef;
  caption: InlineNode[];
  altText: string | null;
}
export interface ThematicBreakNode {
  type: 'thematicBreak';
  id: string;
}
export interface HtmlBlockNode {
  type: 'htmlBlock';
  id: string;
  /** Stored verbatim; emitted only after allowlist sanitization (`decisions/0019`). */
  rawHtml: string;
}
export interface FootnoteDefinitionNode {
  type: 'footnoteDefinition';
  id: string;
  label: string;
  blocks: BlockNode[];
}
export interface MathBlockNode {
  type: 'mathBlock';
  id: string;
  /** Recovered TeX source, or `null` when only an image was available. */
  tex: string | null;
}

export type BlockNode =
  | HeadingNode
  | ParagraphNode
  | ListNode
  | ListItemNode
  | BlockquoteNode
  | CodeBlockNode
  | CodeGroupNode
  | TerminalSessionNode
  | TableNode
  | FigureNode
  | ThematicBreakNode
  | HtmlBlockNode
  | FootnoteDefinitionNode
  | MathBlockNode;

/** Every block-node `type` string (for validation + exhaustiveness checks). */
export const BLOCK_NODE_TYPES = [
  'heading',
  'paragraph',
  'list',
  'listItem',
  'blockquote',
  'codeBlock',
  'codeGroup',
  'terminalSession',
  'table',
  'figure',
  'thematicBreak',
  'htmlBlock',
  'footnoteDefinition',
  'mathBlock',
] as const;

/** Every inline-node `type` string. */
export const INLINE_NODE_TYPES = [
  'text',
  'emphasis',
  'strong',
  'strikethrough',
  'codeSpan',
  'link',
  'image',
  'footnoteRef',
  'citationRef',
  'lineBreak',
  'rawInlineHtml',
] as const;

/** Compile-time exhaustiveness guard. */
export function assertNever(x: never): never {
  throw new Error(`Unexpected variant: ${JSON.stringify(x)}`);
}
