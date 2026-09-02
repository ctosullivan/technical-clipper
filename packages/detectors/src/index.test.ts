import { describe, expect, it } from 'vitest';
import { parseHTML } from 'linkedom';
import {
  hashCodeText,
  type CodeBlockIR,
  type TerminalSessionIR,
} from '@technical-clipper/core';
import {
  standardDetectors,
  standardDetectorRegistry,
  inferLanguage,
} from './index.js';

function root(html: string): Element {
  const { document } = parseHTML(
    `<!doctype html><html><body>${html}</body></html>`,
  );
  return document.body as unknown as Element;
}

function detectOne(html: string): {
  code?: CodeBlockIR;
  terminal?: TerminalSessionIR;
  diagnostics: string[];
} {
  const reg = standardDetectorRegistry();
  const el = root(html);
  const priority = new Map(standardDetectors.map((d) => [d.id, d.priority]));
  const found = reg
    .all()
    .flatMap((d) => d.detect(el))
    .sort(
      (a, b) =>
        (priority.get(b.detectorId) ?? 0) - (priority.get(a.detectorId) ?? 0),
    );
  // Winner after a simple containment filter (mirrors resolveOverlaps).
  const accepted: typeof found = [];
  for (const c of found) {
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
  }
  const first = accepted[0];
  if (!first) return { diagnostics: [] };
  const ex = first.extract();
  return {
    code: ex.kind === 'code' ? (ex.node as CodeBlockIR) : undefined,
    terminal:
      ex.kind === 'terminal' ? (ex.node as TerminalSessionIR) : undefined,
    diagnostics: ex.diagnostics.map((d) => d.code),
  };
}

describe('standard detector set', () => {
  it('registers the detectors, terminal highest priority', () => {
    expect(standardDetectors).toHaveLength(7);
    expect(standardDetectorRegistry().all()[0]?.id).toBe('terminal/session');
    expect(standardDetectors.map((d) => d.id)).toContain(
      'code/docusaurus-tabs',
    );
  });
});

describe('code/pre-code', () => {
  it('extracts exact text from <pre><code>, preserving the final newline', () => {
    const { code } = detectOne(
      '<pre><code>const a = 1;\nconst b = 2;\n</code></pre>',
    );
    expect(code?.text).toBe('const a = 1;\nconst b = 2;\n');
    expect(code?.hasFinalNewline).toBe(true);
    expect(code?.confidence).toBe('exact');
    expect(code?.hash).toBe(hashCodeText('const a = 1;\nconst b = 2;\n'));
  });

  it('preserves a missing final newline', () => {
    const { code } = detectOne('<pre><code>no newline</code></pre>');
    expect(code?.hasFinalNewline).toBe(false);
    expect(code?.text).toBe('no newline');
  });
});

describe('code/prism', () => {
  it('reconstructs exact source from token spans', () => {
    const html =
      '<pre class="language-js"><code class="language-js">' +
      '<span class="token keyword">const</span> a = <span class="token number">1</span>;' +
      '</code></pre>';
    const { code } = detectOne(html);
    expect(code?.text).toBe('const a = 1;');
    expect(code?.confidence).toBe('exact');
    expect(code?.language).toBe('javascript');
    expect(code?.languageEvidence).toBe('class-token');
  });

  it('strips a line-numbers-rows gutter', () => {
    const html =
      '<pre class="language-ts line-numbers"><code class="language-ts">let x = 1;\nlet y = 2;</code>' +
      '<span aria-hidden="true" class="line-numbers-rows"><span></span><span></span></span></pre>';
    const { code } = detectOne(html);
    expect(code?.text).toBe('let x = 1;\nlet y = 2;');
    expect(code?.text).not.toMatch(/^\d/m);
  });

  it('marks a line-number table layout as approximate', () => {
    const html =
      '<pre class="language-py"><table>' +
      '<tr><td class="ln">1</td><td class="code">def f():</td></tr>' +
      '<tr><td class="ln">2</td><td class="code">    return 1</td></tr>' +
      '</table></pre>';
    const { code, diagnostics } = detectOne(html);
    expect(code?.text).toBe('def f():\n    return 1');
    expect(code?.confidence).toBe('approximate');
    expect(diagnostics).toContain('TC-EXTRACT-RECONSTRUCT');
  });
});

describe('code/highlightjs', () => {
  it('extracts exact text from an hljs code block', () => {
    const { code } = detectOne(
      '<pre><code class="hljs language-python">import os\nprint(os.getcwd())\n</code></pre>',
    );
    expect(code?.text).toBe('import os\nprint(os.getcwd())\n');
    expect(code?.language).toBe('python');
  });
});

describe('chrome contamination', () => {
  it('drops copy buttons and line-number spans from the source', () => {
    const html =
      '<pre><button class="copy">Copy</button>' +
      '<code><span class="line-number">1</span>a();\n<span class="line-number">2</span>b();</code></pre>';
    const { code } = detectOne(html);
    expect(code?.text).not.toContain('Copy');
    expect(code?.text).not.toMatch(/^\d/m);
    expect(code?.text).toBe('a();\nb();');
  });
});

describe('terminal/session', () => {
  it('separates explicitly marked input and output', () => {
    const html =
      '<div class="terminal">' +
      '<span class="terminal-input">npm test</span>' +
      '<span class="terminal-output">2 passed</span>' +
      '</div>';
    const { terminal } = detectOne(html);
    expect(terminal?.entries.map((e) => e.stream)).toEqual(['input', 'output']);
    expect(terminal?.entries[0]?.text).toBe('npm test');
    expect(terminal?.confidence).toBe('exact');
  });

  it('marks an inferred prompt-span split as approximate', () => {
    const html =
      '<pre class="terminal"><span class="prompt">$ </span>ls -la\ntotal 0</pre>';
    const { terminal, diagnostics } = detectOne(html);
    expect(terminal?.confidence).toBe('approximate');
    expect(diagnostics).toContain('TC-DETECT-TERMINAL-AMBIGUOUS');
    expect(terminal?.entries[0]).toEqual({
      stream: 'input',
      text: 'ls -la',
      hasFinalNewline: false,
    });
  });
});

describe('virtualized editor guard', () => {
  it('emits failed + TC-DETECT-VIRTUALIZED, never fake content', () => {
    const { code, diagnostics } = detectOne(
      '<div class="monaco-editor"><div class="view-line">const x =</div></div>',
    );
    expect(code?.confidence).toBe('failed');
    expect(code?.text).toBe('');
    expect(diagnostics).toContain('TC-DETECT-VIRTUALIZED');
  });
});

describe('inferLanguage', () => {
  it('prefers a class token over the heuristic', () => {
    const { document } = parseHTML(
      '<code class="language-rust">let x = 1;</code>',
    );
    const el = document.querySelector('code') as unknown as Element;
    const r = inferLanguage(el, null, 'let x = 1;');
    expect(r).toEqual({
      language: 'rust',
      evidence: 'class-token',
      lowConfidence: false,
    });
  });

  it('falls back to a low-confidence heuristic', () => {
    const { document } = parseHTML('<code>def greet():\n    pass</code>');
    const el = document.querySelector('code') as unknown as Element;
    const r = inferLanguage(el, null, 'def greet():\n    pass');
    expect(r.language).toBe('python');
    expect(r.lowConfidence).toBe(true);
  });
});
