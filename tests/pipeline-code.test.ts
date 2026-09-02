/**
 * Integration: the built pipeline + standard detectors over every saved code
 * fixture (`decisions/0020`, `planning` § 12 gates 6, 7, 10, 11).
 *
 * Runs `scripts/capture-fixture.mjs --code` for the golden + determinism
 * check, then asserts the fidelity invariants directly from the goldens.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const codeDir = join(repoRoot, 'fixtures', 'code');

interface CodeBlock {
  type: 'codeBlock';
  code: {
    text: string;
    hasFinalNewline: boolean;
    confidence: string;
    language: string | null;
    hash: string;
  };
}
interface Terminal {
  type: 'terminalSession';
  session: { confidence: string; entries: { stream: string; text: string }[] };
}
type Block = CodeBlock | Terminal | { type: string };

function ir(slug: string): {
  body: { blocks: Block[] };
  diagnostics: { code: string }[];
  captureKind: string;
} {
  return JSON.parse(
    readFileSync(join(codeDir, slug, 'expected-ir.json'), 'utf8'),
  );
}
function codeBlocks(slug: string): CodeBlock['code'][] {
  return ir(slug)
    .body.blocks.filter((b): b is CodeBlock => b.type === 'codeBlock')
    .map((b) => b.code);
}

describe('pipeline — code fixture corpus', () => {
  it('every code fixture matches its golden and is deterministic', () => {
    execFileSync('node', ['scripts/capture-fixture.mjs', '--code'], {
      cwd: repoRoot,
      stdio: 'pipe',
    });
  });

  it('a page with a code structure is captured as technical_article', () => {
    for (const slug of readdirSync(codeDir)) {
      expect(ir(slug).captureKind).toBe('technical_article');
    }
  });

  it('gate 6: supported code fixtures preserve exact text (100%)', () => {
    const supported = readdirSync(codeDir).filter(
      (s) => !s.startsWith('adversarial-') && !s.includes('line-number-table'),
    );
    const expected: Record<string, string> = {
      'semantic-plain-pre-code': 'function add(a, b) {\n  return a + b;\n}\n',
      'semantic-no-final-newline': 'const x = 42',
      'semantic-blank-lines-and-indent':
        'def outer():\n\n    def inner():\n\treturn 1\n\n    return inner\n',
      'prism-token-spans': 'const n: number = 1;',
      'prism-line-numbers-gutter': 'a();\nb();\nc();',
      'highlightjs-basic': 'import sys\nprint(sys.argv)\n',
      'blocklevel-display-block': 'git status\ngit add -A\ngit commit',
      'terminal-prompt-span-inferred': '', // terminal, not a code block
    };
    for (const slug of supported) {
      const blocks = codeBlocks(slug);
      if (!(slug in expected) || expected[slug] === '') continue;
      expect(blocks[0]?.text, slug).toBe(expected[slug]);
      expect(blocks[0]?.confidence, slug).toMatch(/^(exact|normalized)$/);
    }
  });

  it('gate 10: no line-number or copy-button contamination in any code text', () => {
    for (const slug of readdirSync(codeDir)) {
      for (const cb of codeBlocks(slug)) {
        expect(cb.text, slug).not.toContain('Copy');
        expect(cb.text, slug).not.toContain('Copied');
        // no bare "1\n2\n3" line-number ladder
        const digitLines = cb.text
          .split('\n')
          .filter((l, i) => l.trim() === String(i + 1));
        expect(digitLines.length, slug).toBeLessThanOrEqual(1);
      }
    }
  });

  it('gate 11: adversarial fixtures produce the expected diagnostic, never fake content', () => {
    const monaco = ir('adversarial-monaco-virtualized');
    expect(monaco.diagnostics.map((d) => d.code)).toContain(
      'TC-DETECT-VIRTUALIZED',
    );
    expect(codeBlocks('adversarial-monaco-virtualized')[0]?.text).toBe('');
    expect(codeBlocks('adversarial-monaco-virtualized')[0]?.confidence).toBe(
      'failed',
    );

    const table = ir('highlightjs-line-number-table');
    expect(table.diagnostics.map((d) => d.code)).toContain(
      'TC-EXTRACT-RECONSTRUCT',
    );
    expect(codeBlocks('highlightjs-line-number-table')[0]?.confidence).toBe(
      'approximate',
    );
  });

  it('gate: terminal fixtures keep correct stream order', () => {
    const marked = ir('terminal-marked-io').body.blocks.find(
      (b): b is Terminal => b.type === 'terminalSession',
    );
    expect(marked?.session.entries.map((e) => e.stream)).toEqual([
      'input',
      'output',
      'input',
      'output',
    ]);
    expect(marked?.session.confidence).toBe('exact');

    const inferred = ir('terminal-prompt-span-inferred').body.blocks.find(
      (b): b is Terminal => b.type === 'terminalSession',
    );
    expect(inferred?.session.confidence).toBe('approximate');
  });

  it('every code hash is the SHA-256 of the exact text', async () => {
    const { createHash } = await import('node:crypto');
    for (const slug of readdirSync(codeDir)) {
      for (const cb of codeBlocks(slug)) {
        expect(cb.hash, slug).toBe(
          createHash('sha256').update(cb.text, 'utf8').digest('hex'),
        );
      }
    }
  });
});
