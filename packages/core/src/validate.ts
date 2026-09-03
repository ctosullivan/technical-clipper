/**
 * IR schema + cross-field validation — `decisions/0011`, `0012`, `0014`, `0015`.
 *
 * `validateDocumentIR` returns a list of {@link Diagnostic}s. An empty list
 * means the IR is structurally valid and internally consistent. Sentinel
 * balance and completeness assertions are checked later in the pipeline
 * (Phases 4 and 8), not here.
 */
import {
  BLOCK_NODE_TYPES,
  INLINE_NODE_TYPES,
  type BlockNode,
  type InlineNode,
} from './ir/nodes.js';
import type { CodeBlockIR, CodeGroupIR, TerminalSessionIR } from './ir/code.js';
import { IR_SCHEMA_VERSION, type DocumentIR } from './ir/document.js';
import {
  isConfidenceEvidenceLegal,
  requiresDiagnostic,
  type Confidence,
  type EvidenceSource,
} from './provenance.js';
import { makeDiagnostic, type Diagnostic } from './diagnostics/registry.js';
import { hashCodeText } from './hash.js';

const BLOCK_TYPES = new Set<string>(BLOCK_NODE_TYPES);
const INLINE_TYPES = new Set<string>(INLINE_NODE_TYPES);

interface Ctx {
  diagnostics: Diagnostic[];
  ids: Set<string>;
  /** Node ids that already have a diagnostic on the document. */
  diagnosedNodeIds: Set<string>;
}

function schemaError(ctx: Ctx, message: string, nodeId?: string): void {
  ctx.diagnostics.push(
    makeDiagnostic('TC-VALIDATE-SCHEMA', {
      phase: 'validate',
      message,
      ...(nodeId ? { sourceLocation: { nodeId } } : {}),
    }),
  );
}

function addId(
  ctx: Ctx,
  id: string,
  what: string,
  opts?: { allowDuplicate?: boolean },
): void {
  if (typeof id !== 'string' || id.length === 0) {
    schemaError(ctx, `${what} has a missing or empty id`);
    return;
  }
  // Content-addressable ids (`decisions/0014`) are a pure function of captured
  // meaning: two inline links with the same target and text legitimately share
  // an id, and that repetition is common on real pages (e.g. a term linked
  // many times). Duplicate ids are only a defect for structural/block nodes,
  // where an id must anchor exactly one node.
  if (ctx.ids.has(id) && !opts?.allowDuplicate) {
    ctx.diagnostics.push(
      makeDiagnostic('TC-VALIDATE-DUP-ID', {
        phase: 'validate',
        message: `Duplicate node id ${id} (${what})`,
        sourceLocation: { nodeId: id },
      }),
    );
  }
  ctx.ids.add(id);
}

function checkLeafConfidence(
  ctx: Ctx,
  id: string,
  confidence: Confidence,
  evidenceSource: EvidenceSource,
): void {
  if (!isConfidenceEvidenceLegal(confidence, evidenceSource)) {
    ctx.diagnostics.push(
      makeDiagnostic('TC-VALIDATE-CONFIDENCE', {
        phase: 'validate',
        message: `${id}: confidence '${confidence}' is not legal with evidence '${evidenceSource}'`,
        sourceLocation: { nodeId: id },
      }),
    );
  }
  if (requiresDiagnostic(confidence) && !ctx.diagnosedNodeIds.has(id)) {
    ctx.diagnostics.push(
      makeDiagnostic('TC-VALIDATE-MISSING-DIAGNOSTIC', {
        phase: 'validate',
        message: `${id}: '${confidence}' artifact has no accompanying diagnostic`,
        sourceLocation: { nodeId: id },
      }),
    );
  }
}

function validateCodeBlock(ctx: Ctx, code: CodeBlockIR): void {
  addId(ctx, code.id, 'codeBlock');
  checkLeafConfidence(ctx, code.id, code.confidence, code.evidenceSource);
  if (code.confidence !== 'failed' && hashCodeText(code.text) !== code.hash) {
    schemaError(
      ctx,
      `${code.id}: stored hash does not match SHA-256 of text`,
      code.id,
    );
  }
  if (
    code.hasFinalNewline &&
    code.text.length > 0 &&
    !/[\r\n]$/.test(code.text)
  ) {
    schemaError(
      ctx,
      `${code.id}: hasFinalNewline is true but text has no terminal newline`,
      code.id,
    );
  }
}

function validateCodeGroup(ctx: Ctx, group: CodeGroupIR): void {
  addId(ctx, group.id, 'codeGroup');
  if (group.members.length === 0) {
    schemaError(ctx, `${group.id}: code group has no members`, group.id);
  }
  for (const m of group.members) validateCodeBlock(ctx, m.code);
}

function validateTerminal(ctx: Ctx, session: TerminalSessionIR): void {
  addId(ctx, session.id, 'terminalSession');
  checkLeafConfidence(
    ctx,
    session.id,
    session.confidence,
    session.extraction.evidenceSource,
  );
}

function validateInline(ctx: Ctx, node: InlineNode): void {
  if (!INLINE_TYPES.has(node.type)) {
    schemaError(
      ctx,
      `Unknown inline node type: ${(node as { type: string }).type}`,
    );
    return;
  }
  switch (node.type) {
    case 'link':
      addId(ctx, node.id, 'link', { allowDuplicate: true });
      if (
        !/^[a-z][a-z0-9+.-]*:/i.test(node.href) &&
        !node.href.startsWith('//')
      ) {
        schemaError(
          ctx,
          `link ${node.id}: href is not an absolute URL`,
          node.id,
        );
      }
      for (const c of node.children) validateInline(ctx, c);
      return;
    case 'emphasis':
    case 'strong':
    case 'strikethrough':
      for (const c of node.children) validateInline(ctx, c);
      return;
    default:
      return;
  }
}

function validateBlock(ctx: Ctx, node: BlockNode): void {
  if (!BLOCK_TYPES.has(node.type)) {
    schemaError(
      ctx,
      `Unknown block node type: ${(node as { type: string }).type}`,
    );
    return;
  }
  switch (node.type) {
    case 'codeBlock':
      validateCodeBlock(ctx, node.code);
      return;
    case 'codeGroup':
      validateCodeGroup(ctx, node.group);
      return;
    case 'terminalSession':
      validateTerminal(ctx, node.session);
      return;
    case 'heading':
      if (node.level < 1 || node.level > 6) {
        schemaError(
          ctx,
          `heading ${node.id}: level ${node.level} out of range`,
          node.id,
        );
      }
      addId(ctx, node.id, 'heading');
      for (const c of node.children) validateInline(ctx, c);
      return;
    case 'paragraph':
      addId(ctx, node.id, 'paragraph');
      for (const c of node.children) validateInline(ctx, c);
      return;
    case 'list':
      addId(ctx, node.id, 'list');
      for (const item of node.items) {
        addId(ctx, item.id, 'listItem');
        for (const b of item.blocks) validateBlock(ctx, b);
      }
      return;
    case 'listItem':
      addId(ctx, node.id, 'listItem');
      for (const b of node.blocks) validateBlock(ctx, b);
      return;
    case 'blockquote':
      addId(ctx, node.id, 'blockquote');
      for (const b of node.blocks) validateBlock(ctx, b);
      return;
    case 'footnoteDefinition':
      addId(ctx, node.id, 'footnoteDefinition');
      for (const b of node.blocks) validateBlock(ctx, b);
      return;
    case 'table':
      addId(ctx, node.id, 'table');
      for (const cell of node.table.header)
        for (const c of cell) validateInline(ctx, c);
      for (const row of node.table.rows)
        for (const cell of row) for (const c of cell) validateInline(ctx, c);
      return;
    case 'figure':
      addId(ctx, node.id, 'figure');
      for (const c of node.caption) validateInline(ctx, c);
      return;
    case 'thematicBreak':
    case 'htmlBlock':
    case 'mathBlock':
      addId(ctx, node.id, node.type);
      return;
  }
}

/**
 * Validate a `DocumentIR`. Returns diagnostics; an empty array means valid.
 * The document's own `diagnostics` array is consulted for the
 * approximate/failed-artifact pairing rule (`decisions/0012`).
 */
export function validateDocumentIR(doc: DocumentIR): Diagnostic[] {
  const ctx: Ctx = {
    diagnostics: [],
    ids: new Set(),
    diagnosedNodeIds: new Set(
      doc.diagnostics
        .map((d) => d.sourceLocation?.nodeId)
        .filter((x): x is string => typeof x === 'string'),
    ),
  };

  if (typeof doc.schemaVersion !== 'number') {
    schemaError(ctx, 'schemaVersion is missing or not a number');
  } else if (doc.schemaVersion > IR_SCHEMA_VERSION) {
    ctx.diagnostics.push(
      makeDiagnostic('TC-VALIDATE-SCHEMA-VERSION', {
        phase: 'validate',
        message: `IR schemaVersion ${doc.schemaVersion} is newer than this build (${IR_SCHEMA_VERSION})`,
      }),
    );
  }

  if (doc.captureKind === 'conversation') {
    doc.body.messages.forEach((m, i) => {
      addId(ctx, m.id, 'message');
      if (m.order !== i) {
        schemaError(
          ctx,
          `message ${m.id}: order ${m.order} is not contiguous (expected ${i})`,
          m.id,
        );
      }
      for (const b of m.blocks) validateBlock(ctx, b);
    });
    if (doc.body.branchEvidence.streamingObserved) {
      ctx.diagnostics.push(
        makeDiagnostic('TC-ADAPT-STREAMING', { phase: 'validate' }),
      );
    }
  } else {
    if (doc.body.blocks.length === 0) {
      ctx.diagnostics.push(
        makeDiagnostic('TC-ASSEMBLE-EMPTY', { phase: 'validate' }),
      );
    }
    for (const b of doc.body.blocks) validateBlock(ctx, b);
    for (const fn of doc.body.footnotes) {
      addId(ctx, fn.id, 'footnoteDefinition');
      for (const b of fn.blocks) validateBlock(ctx, b);
    }
    for (const ref of doc.body.references) addId(ctx, ref.id, 'reference');
  }

  return ctx.diagnostics;
}
