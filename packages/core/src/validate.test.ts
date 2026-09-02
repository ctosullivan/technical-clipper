import { describe, expect, it } from 'vitest';
import { validateDocumentIR } from './validate.js';
import { makeDiagnostic } from './diagnostics/registry.js';
import {
  articleDoc,
  codeBlock,
  conversationDoc,
  paragraph,
} from './__fixtures__/build.js';
import type { CodeBlockNode } from './ir/nodes.js';
import type { MessageIR } from './ir/conversation.js';

describe('validateDocumentIR', () => {
  it('accepts a minimal valid article', () => {
    const doc = articleDoc([paragraph('p1', 'Hello world')]);
    expect(validateDocumentIR(doc)).toEqual([]);
  });

  it('flags an empty article body', () => {
    const doc = articleDoc([]);
    const codes = validateDocumentIR(doc).map((d) => d.code);
    expect(codes).toContain('TC-ASSEMBLE-EMPTY');
  });

  it('flags a duplicate node id', () => {
    const doc = articleDoc([paragraph('dup', 'a'), paragraph('dup', 'b')]);
    expect(validateDocumentIR(doc).map((d) => d.code)).toContain(
      'TC-VALIDATE-DUP-ID',
    );
  });

  it('rejects exact confidence on a reconstruction evidence source', () => {
    const cb = codeBlock('c1', 'const x = 1;\n', {
      confidence: 'exact',
      evidenceSource: 'dom-rendered-reconstruction',
    });
    const node: CodeBlockNode = { type: 'codeBlock', code: cb };
    expect(validateDocumentIR(articleDoc([node])).map((d) => d.code)).toContain(
      'TC-VALIDATE-CONFIDENCE',
    );
  });

  it('requires an accompanying diagnostic for an approximate artifact', () => {
    const cb = codeBlock('c2', 'x', {
      confidence: 'approximate',
      evidenceSource: 'dom-rendered-reconstruction',
    });
    const node: CodeBlockNode = { type: 'codeBlock', code: cb };
    const withoutDiag = validateDocumentIR(articleDoc([node])).map(
      (d) => d.code,
    );
    expect(withoutDiag).toContain('TC-VALIDATE-MISSING-DIAGNOSTIC');

    const doc = articleDoc([node]);
    doc.diagnostics.push(
      makeDiagnostic('TC-EXTRACT-RECONSTRUCT', {
        phase: 'extract',
        sourceLocation: { nodeId: 'c2' },
      }),
    );
    expect(validateDocumentIR(doc).map((d) => d.code)).not.toContain(
      'TC-VALIDATE-MISSING-DIAGNOSTIC',
    );
  });

  it('flags a stored hash that does not match the text', () => {
    const cb = codeBlock('c3', 'real', { hash: 'deadbeef' });
    const node: CodeBlockNode = { type: 'codeBlock', code: cb };
    expect(validateDocumentIR(articleDoc([node])).map((d) => d.code)).toContain(
      'TC-VALIDATE-SCHEMA',
    );
  });

  it('rejects a schema version newer than this build', () => {
    const doc = articleDoc([paragraph('p', 'x')]);
    doc.schemaVersion = 999;
    expect(validateDocumentIR(doc).map((d) => d.code)).toContain(
      'TC-VALIDATE-SCHEMA-VERSION',
    );
  });

  it('flags non-contiguous message order and streaming', () => {
    const msg = (order: number): MessageIR => ({
      id: `m${order}`,
      role: 'user',
      order,
      roleEvidence: 'author-label',
      blocks: [paragraph(`mp${order}`, 'hi')],
      attachments: [],
      hash: 'x',
    });
    const doc = conversationDoc([msg(0), msg(2)]);
    doc.body.branchEvidence.streamingObserved = true;
    const codes = validateDocumentIR(doc).map((d) => d.code);
    expect(codes).toContain('TC-VALIDATE-SCHEMA');
    expect(codes).toContain('TC-ADAPT-STREAMING');
  });

  it('flags an unknown block node type', () => {
    const doc = articleDoc([{ type: 'bogus' } as unknown as CodeBlockNode]);
    expect(validateDocumentIR(doc).map((d) => d.code)).toContain(
      'TC-VALIDATE-SCHEMA',
    );
  });
});
