/**
 * Cross-stage fidelity assertions — `decisions/0015`,
 * `planning/v0-to-mvp-planning-prompt.md` § 12.
 *
 * These run on the assembled `DocumentIR` after schema validation. Each returns
 * diagnostics and, where relevant, flags `contentKnownIncomplete` so the
 * export status is demoted to `partial` (`decisions/0015`).
 */
import type { DocumentIR } from '../ir/document.js';
import type { BlockNode, InlineNode } from '../ir/nodes.js';
import { makeDiagnostic, type Diagnostic } from '../diagnostics/registry.js';

export interface ExpectedOutlineEntry {
  level: number;
  text: string;
}

export interface AssertionInput {
  doc: DocumentIR;
  /** Fixture-supplied expected section outline (production captures omit it). */
  expectedOutline?: readonly ExpectedOutlineEntry[];
}

export interface CodeAccounting {
  detected: number;
  exact: number;
  normalized: number;
  approximate: number;
  failed: number;
}

export interface AssertionResult {
  diagnostics: Diagnostic[];
  contentKnownIncomplete: boolean;
  code: CodeAccounting;
  citations: { total: number; resolved: number };
  sections: { expected: number; kept: number };
}

// --- helpers -----------------------------------------------------------

function walkBlocks(
  blocks: readonly BlockNode[],
  visit: (b: BlockNode) => void,
): void {
  for (const b of blocks) {
    visit(b);
    switch (b.type) {
      case 'blockquote':
      case 'footnoteDefinition':
        walkBlocks(b.blocks, visit);
        break;
      case 'listItem':
        walkBlocks(b.blocks, visit);
        break;
      case 'list':
        for (const item of b.items) walkBlocks(item.blocks, visit);
        break;
      default:
        break;
    }
  }
}

function walkInlines(
  blocks: readonly BlockNode[],
  visit: (n: InlineNode) => void,
): void {
  const inline = (nodes: readonly InlineNode[]): void => {
    for (const n of nodes) {
      visit(n);
      if (
        n.type === 'emphasis' ||
        n.type === 'strong' ||
        n.type === 'strikethrough' ||
        n.type === 'link'
      ) {
        inline(n.children);
      }
    }
  };
  walkBlocks(blocks, (b) => {
    if (b.type === 'heading' || b.type === 'paragraph') inline(b.children);
    if (b.type === 'table') {
      for (const cell of b.table.header) inline(cell);
      for (const row of b.table.rows) for (const cell of row) inline(cell);
    }
    if (b.type === 'figure') inline(b.caption);
  });
}

function allBlocks(doc: DocumentIR): BlockNode[] {
  if (doc.captureKind === 'conversation') {
    return doc.body.messages.flatMap((m) => m.blocks);
  }
  return doc.body.blocks;
}

// --- assertions ------------------------------------------------------

function assertCodeAccounting(doc: DocumentIR): {
  code: CodeAccounting;
  diagnostics: Diagnostic[];
  incomplete: boolean;
} {
  const code: CodeAccounting = {
    detected: 0,
    exact: 0,
    normalized: 0,
    approximate: 0,
    failed: 0,
  };
  const diagnostics: Diagnostic[] = [];
  walkBlocks(allBlocks(doc), (b) => {
    const tally = (c: string): void => {
      code.detected++;
      if (c === 'exact') code.exact++;
      else if (c === 'normalized') code.normalized++;
      else if (c === 'approximate') code.approximate++;
      else if (c === 'failed') code.failed++;
    };
    if (b.type === 'codeBlock') tally(b.code.confidence);
    else if (b.type === 'terminalSession') tally(b.session.confidence);
    else if (b.type === 'codeGroup')
      for (const m of b.group.members) tally(m.code.confidence);
  });

  const sum = code.exact + code.normalized + code.approximate + code.failed;
  if (sum !== code.detected) {
    diagnostics.push(
      makeDiagnostic('TC-VALIDATE-SCHEMA', {
        phase: 'validate',
        message: `code accounting mismatch: detected ${code.detected} != ${sum}`,
      }),
    );
  }
  return { code, diagnostics, incomplete: code.failed > 0 };
}

function assertCitationsAndFootnotes(doc: DocumentIR): {
  citations: { total: number; resolved: number };
  diagnostics: Diagnostic[];
  incomplete: boolean;
} {
  const diagnostics: Diagnostic[] = [];
  const blocks = allBlocks(doc);
  const footnoteLabels = new Set<string>();
  if (doc.captureKind !== 'conversation') {
    for (const fn of doc.body.footnotes) footnoteLabels.add(fn.label);
  }
  walkBlocks(blocks, (b) => {
    if (b.type === 'footnoteDefinition') footnoteLabels.add(b.label);
  });
  const referenceCount =
    doc.captureKind === 'conversation' ? 0 : doc.body.references.length;

  let citationTotal = 0;
  let citationResolved = 0;
  const citationNumbers: number[] = [];
  walkInlines(blocks, (n) => {
    if (n.type === 'footnoteRef') {
      citationTotal++;
      if (footnoteLabels.has(n.label)) citationResolved++;
      else
        diagnostics.push(
          makeDiagnostic('TC-EXTRACT-CITATION-UNRESOLVED', {
            phase: 'extract',
            message: `footnote marker [^${n.label}] has no definition`,
          }),
        );
    } else if (n.type === 'citationRef') {
      citationTotal++;
      const num = Number(n.referenceId);
      if (Number.isFinite(num)) citationNumbers.push(num);
    }
  });

  // Numeric citations: every [n] must have an nth reference entry.
  const maxCitation = citationNumbers.length ? Math.max(...citationNumbers) : 0;
  if (maxCitation > 0) {
    if (maxCitation <= referenceCount) {
      citationResolved += citationNumbers.filter(
        (n) => n >= 1 && n <= referenceCount,
      ).length;
    } else {
      diagnostics.push(
        makeDiagnostic('TC-EXTRACT-CITATION-UNRESOLVED', {
          phase: 'extract',
          message: `citation [${maxCitation}] has no matching reference entry (only ${referenceCount} references)`,
        }),
      );
      citationResolved += citationNumbers.filter(
        (n) => n >= 1 && n <= referenceCount,
      ).length;
    }
  }

  return {
    citations: { total: citationTotal, resolved: citationResolved },
    diagnostics,
    incomplete: diagnostics.length > 0,
  };
}

function assertSectionRetention(
  doc: DocumentIR,
  expected: readonly ExpectedOutlineEntry[] | undefined,
): {
  sections: { expected: number; kept: number };
  diagnostics: Diagnostic[];
  incomplete: boolean;
} {
  if (!expected || doc.captureKind === 'conversation') {
    return {
      sections: { expected: 0, kept: 0 },
      diagnostics: [],
      incomplete: false,
    };
  }
  const outline = doc.body.metadata.outline.map((o) => ({
    level: o.level,
    text: o.text.trim().toLowerCase(),
  }));
  const diagnostics: Diagnostic[] = [];
  let kept = 0;
  for (const want of expected) {
    const hit = outline.some(
      (o) =>
        o.level === want.level && o.text === want.text.trim().toLowerCase(),
    );
    if (hit) kept++;
    else
      diagnostics.push(
        makeDiagnostic('TC-EXTRACT-SECTION-LOST', {
          phase: 'extract',
          message: `expected section "${want.text}" (h${want.level}) is missing from the output`,
        }),
      );
  }
  return {
    sections: { expected: expected.length, kept },
    diagnostics,
    incomplete: kept < expected.length,
  };
}

function assertContentPresent(doc: DocumentIR): {
  diagnostics: Diagnostic[];
  incomplete: boolean;
} {
  if (doc.captureKind === 'conversation') {
    if (doc.body.messages.length === 0) {
      return {
        diagnostics: [
          makeDiagnostic('TC-ASSEMBLE-EMPTY', {
            phase: 'assemble',
            message: 'conversation has no messages',
          }),
        ],
        incomplete: true,
      };
    }
  } else if (doc.body.blocks.length === 0) {
    return {
      diagnostics: [makeDiagnostic('TC-ASSEMBLE-EMPTY', { phase: 'assemble' })],
      incomplete: true,
    };
  }
  return { diagnostics: [], incomplete: false };
}

/** Run every cross-stage fidelity assertion. */
export function runAssertions(input: AssertionInput): AssertionResult {
  const present = assertContentPresent(input.doc);
  const code = assertCodeAccounting(input.doc);
  const cites = assertCitationsAndFootnotes(input.doc);
  const sections = assertSectionRetention(input.doc, input.expectedOutline);

  return {
    diagnostics: [
      ...present.diagnostics,
      ...code.diagnostics,
      ...cites.diagnostics,
      ...sections.diagnostics,
    ],
    contentKnownIncomplete:
      present.incomplete ||
      code.incomplete ||
      cites.incomplete ||
      sections.incomplete,
    code: code.code,
    citations: cites.citations,
    sections: sections.sections,
  };
}
