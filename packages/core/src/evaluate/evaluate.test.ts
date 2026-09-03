import { describe, expect, it } from 'vitest';
import { evaluateCapture } from './evaluate.js';
import { runAssertions } from './assertions.js';
import { makeDiagnostic } from '../diagnostics/registry.js';
import {
  articleDoc,
  codeBlock,
  conversationDoc,
  paragraph,
} from '../__fixtures__/build.js';
import type { CodeBlockNode, HeadingNode, ParagraphNode } from '../ir/nodes.js';
import type { MessageIR } from '../ir/conversation.js';

const heading = (id: string, text: string, level: 1 | 2 = 2): HeadingNode => ({
  type: 'heading',
  id,
  level,
  children: [{ type: 'text', value: text }],
});

describe('evaluateCapture — code accounting', () => {
  it('detected === exact + normalized + approximate + failed', () => {
    const cbs: CodeBlockNode[] = [
      { type: 'codeBlock', code: codeBlock('a', 'x') },
      {
        type: 'codeBlock',
        code: codeBlock('b', 'y', {
          confidence: 'approximate',
          evidenceSource: 'dom-rendered-reconstruction',
        }),
      },
    ];
    const doc = articleDoc([paragraph('p', 'text'), ...cbs]);
    doc.diagnostics.push(
      makeDiagnostic('TC-EXTRACT-RECONSTRUCT', {
        phase: 'extract',
        sourceLocation: { nodeId: 'b' },
      }),
    );
    const r = evaluateCapture(doc);
    expect(r.code).toMatchObject({
      detected: 2,
      exact: 1,
      approximate: 1,
      failed: 0,
    });
  });

  it('an approximate block demotes to complete_with_warnings', () => {
    const doc = articleDoc([
      paragraph('p', 'text'),
      {
        type: 'codeBlock',
        code: codeBlock('a', 'x', {
          confidence: 'approximate',
          evidenceSource: 'dom-rendered-reconstruction',
        }),
      } as CodeBlockNode,
    ]);
    doc.diagnostics.push(
      makeDiagnostic('TC-EXTRACT-RECONSTRUCT', {
        phase: 'extract',
        sourceLocation: { nodeId: 'a' },
      }),
    );
    expect(evaluateCapture(doc).status).toBe('complete_with_warnings');
  });

  it('a failed block demotes to partial and lists it in warnings', () => {
    const doc = articleDoc([
      paragraph('p', 'text'),
      {
        type: 'codeBlock',
        code: codeBlock('a', '', {
          confidence: 'failed',
          evidenceSource: 'dom-rendered-reconstruction',
        }),
      } as CodeBlockNode,
    ]);
    doc.diagnostics.push(
      makeDiagnostic('TC-DETECT-VIRTUALIZED', {
        phase: 'detect',
        sourceLocation: { nodeId: 'a' },
      }),
    );
    const r = evaluateCapture(doc);
    expect(r.status).toBe('partial');
    expect(r.warnings.some((w) => /could not be extracted/.test(w))).toBe(true);
  });
});

describe('evaluateCapture — section retention', () => {
  it('a missing expected section cannot report complete', () => {
    const doc = articleDoc([
      heading('h1', 'Introduction'),
      paragraph('p1', 'a'),
      heading('h2', 'Conclusion'),
      paragraph('p2', 'b'),
    ]);
    // outline built by the extractor lives on metadata; simulate it
    doc.body.metadata.outline = [
      { level: 2, text: 'Introduction', id: 'h1' },
      { level: 2, text: 'Conclusion', id: 'h2' },
    ];
    const r = evaluateCapture(doc, {
      expectedOutline: [
        { level: 2, text: 'Introduction' },
        { level: 2, text: 'Methods' },
        { level: 2, text: 'Conclusion' },
      ],
    });
    expect(r.status).toBe('partial');
    expect(r.sections).toEqual({ expected: 3, kept: 2 });
    expect(r.diagnostics.map((d) => d.code)).toContain(
      'TC-EXTRACT-SECTION-LOST',
    );
  });

  it('all expected sections present -> complete', () => {
    const doc = articleDoc([heading('h1', 'Intro'), paragraph('p', 'x')]);
    doc.body.metadata.outline = [{ level: 2, text: 'Intro', id: 'h1' }];
    expect(
      evaluateCapture(doc, { expectedOutline: [{ level: 2, text: 'Intro' }] })
        .status,
    ).toBe('complete');
  });
});

describe('evaluateCapture — citations / footnotes', () => {
  it('an unresolved footnote marker demotes to partial', () => {
    const p: ParagraphNode = {
      type: 'paragraph',
      id: 'p',
      children: [
        { type: 'text', value: 'claim' },
        { type: 'footnoteRef', label: '1' },
      ],
    };
    const doc = articleDoc([p]);
    const r = evaluateCapture(doc);
    expect(r.status).toBe('partial');
    expect(r.diagnostics.map((d) => d.code)).toContain(
      'TC-EXTRACT-CITATION-UNRESOLVED',
    );
  });
});

describe('evaluateCapture — conversation', () => {
  it('an empty conversation is flagged', () => {
    const doc = conversationDoc([]);
    expect(evaluateCapture(doc).status).not.toBe('complete');
  });

  it('a well-formed conversation with a code block is complete', () => {
    const msg: MessageIR = {
      id: 'm0',
      role: 'assistant',
      order: 0,
      roleEvidence: 'data-message-author-role attribute',
      blocks: [
        paragraph('mp', 'here'),
        { type: 'codeBlock', code: codeBlock('mc', 'x\n') } as CodeBlockNode,
      ],
      attachments: [],
      hash: 'x',
    };
    expect(evaluateCapture(conversationDoc([msg])).status).toBe('complete');
  });
});

describe('runAssertions', () => {
  it('reports code accounting and citation counts', () => {
    const doc = articleDoc([paragraph('p', 'text')]);
    const a = runAssertions({ doc });
    expect(a.code.detected).toBe(0);
    expect(a.contentKnownIncomplete).toBe(false);
  });
});
