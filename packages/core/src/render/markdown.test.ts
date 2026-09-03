import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './markdown.js';
import { extractFencedContent } from '../fence.js';
import { articleDoc, codeBlock, paragraph } from '../__fixtures__/build.js';
import type { BlockNode, CodeBlockNode, TableNode } from '../ir/nodes.js';

describe('renderMarkdown — profiles', () => {
  it('obsidian emits YAML frontmatter; gfm and commonmark do not', () => {
    const doc = articleDoc([paragraph('p', 'Hello world.')]);
    expect(renderMarkdown(doc, { profile: 'obsidian' }).markdown).toMatch(
      /^---\n[\s\S]*\n---\n/,
    );
    expect(renderMarkdown(doc, { profile: 'gfm' }).markdown).not.toMatch(
      /^---/,
    );
    expect(renderMarkdown(doc, { profile: 'commonmark' }).markdown).not.toMatch(
      /^---/,
    );
  });

  it('preserves exact code bytes and passes render-back verification', () => {
    const text = 'const md = ```x```;\nconst t = "~~~";\n';
    const node: CodeBlockNode = {
      type: 'codeBlock',
      code: codeBlock('c1', text),
    };
    const md = renderMarkdown(articleDoc([node]), { profile: 'gfm' });
    expect(md.diagnostics.map((d) => d.code)).not.toContain(
      'TC-RENDER-CODE-MISMATCH',
    );
    const fenceBlock = md.markdown.slice(md.markdown.indexOf('```'));
    expect(extractFencedContent(fenceBlock.trimEnd())).toBe(text);
  });

  it('degrades a table to a list in commonmark with an info diagnostic', () => {
    const table: TableNode = {
      type: 'table',
      id: 't1',
      table: {
        header: [
          [{ type: 'text', value: 'A' }],
          [{ type: 'text', value: 'B' }],
        ],
        alignments: ['none', 'none'],
        rows: [
          [[{ type: 'text', value: '1' }], [{ type: 'text', value: '2' }]],
        ],
      },
    };
    const gfm = renderMarkdown(articleDoc([table]), { profile: 'gfm' });
    expect(gfm.markdown).toContain('| A | B |');
    const cm = renderMarkdown(articleDoc([table]), { profile: 'commonmark' });
    expect(cm.markdown).not.toContain('| A | B |');
    expect(cm.markdown).toContain('**A:** 1');
    expect(cm.diagnostics.map((d) => d.code)).toContain('TC-RENDER-DEGRADE');
  });

  it('escapes a pipe inside a table cell', () => {
    const table: TableNode = {
      type: 'table',
      id: 't2',
      table: {
        header: [[{ type: 'text', value: 'cmd' }]],
        alignments: ['none'],
        rows: [[[{ type: 'text', value: 'a | b' }]]],
      },
    };
    expect(
      renderMarkdown(articleDoc([table]), { profile: 'gfm' }).markdown,
    ).toContain('| a \\| b |');
  });

  it('renders a code group as labelled consecutive fenced blocks', () => {
    const group: BlockNode = {
      type: 'codeGroup',
      group: {
        id: 'g1',
        label: null,
        groupKind: 'docusaurus-tabs',
        members: [
          { label: 'npm', code: codeBlock('m1', 'npm i x') },
          { label: 'pnpm', code: codeBlock('m2', 'pnpm add x') },
        ],
        defaultMemberIndex: 0,
        extraction: {
          method: 'detector',
          methodVersion: '0',
          evidenceSource: 'dom-text-content',
        },
      },
    };
    const md = renderMarkdown(articleDoc([group]), { profile: 'gfm' }).markdown;
    expect(md).toContain('**npm**');
    expect(md).toContain('**pnpm**');
    expect(md).toContain('npm i x');
    expect(md).toContain('pnpm add x');
  });

  it('emits HTML blocks as fenced html, never as markup', () => {
    const html: BlockNode = {
      type: 'htmlBlock',
      id: 'h1',
      rawHtml: '<script>alert(1)</script>',
    };
    const md = renderMarkdown(articleDoc([html]), { profile: 'obsidian' });
    // Inside a fenced `html` block: literal text, not executable markup.
    expect(md.markdown).toMatch(/```html\n<script>alert\(1\)<\/script>\n```/);
    expect(md.diagnostics.map((d) => d.code)).toContain(
      'TC-RENDER-HTML-SANITIZED',
    );
  });

  it('is deterministic', () => {
    const doc = articleDoc([
      paragraph('p1', 'One.'),
      { type: 'codeBlock', code: codeBlock('c', 'x\n') },
      paragraph('p2', 'Two.'),
    ]);
    const a = renderMarkdown(doc, { profile: 'obsidian' }).markdown;
    const b = renderMarkdown(doc, { profile: 'obsidian' }).markdown;
    expect(a).toBe(b);
    expect(a.endsWith('\n')).toBe(true);
    expect(a.endsWith('\n\n')).toBe(false);
  });
});
