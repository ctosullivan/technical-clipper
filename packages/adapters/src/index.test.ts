import { describe, expect, it } from 'vitest';
import { parseHTML } from 'linkedom';
import {
  chatgptConversationAdapter,
  resolveClipSpec,
  mergeEffectiveConfig,
  validateClipSpec,
  type ClipSpec,
} from './index.js';

function doc(html: string): Document {
  return parseHTML(
    `<!doctype html><html><head><title>Chat · ChatGPT</title></head><body>${html}</body></html>`,
  ).document as unknown as Document;
}

const linear = `
  <div data-message-author-role="user"><div class="markdown"><p>What is 2 + 2?</p></div></div>
  <div data-message-author-role="assistant"><div class="markdown">
    <p>It is <strong>4</strong>.</p>
    <pre><code class="language-python">print(2 + 2)</code></pre>
  </div></div>
`;

describe('chatgpt conversation adapter', () => {
  it('applies to a chatgpt.com URL and to a page with role markers', () => {
    expect(
      chatgptConversationAdapter.appliesTo({
        url: 'https://chatgpt.com/c/abc',
        doc: doc(''),
      }),
    ).toBe(true);
    expect(
      chatgptConversationAdapter.appliesTo({
        url: 'https://example.com',
        doc: doc(linear),
      }),
    ).toBe(true);
  });

  it('captures message order, roles, and code with exact text', () => {
    const r = chatgptConversationAdapter.adapt({
      doc: doc(linear),
      url: 'https://chatgpt.com/c/abc',
      canonicalUrl: null,
    });
    expect(r.captureScope).toBe('chatgpt-current-branch');
    expect(r.body.messages.map((m) => m.role)).toEqual(['user', 'assistant']);
    expect(r.body.messages.map((m) => m.order)).toEqual([0, 1]);
    const assistant = r.body.messages[1]!;
    const code = assistant.blocks.find((b) => b.type === 'codeBlock');
    expect(code && code.type === 'codeBlock' && code.code.text).toBe(
      'print(2 + 2)',
    );
    expect(assistant.roleEvidence).toContain('data-message-author-role');
    expect(r.body.branchEvidence.branchIndicator).toBeNull();
  });

  it('records a branch indicator and never claims hidden branches', () => {
    const branched = doc(
      linear + '<div class="branch-nav"><span>2 / 3</span></div>',
    );
    const r = chatgptConversationAdapter.adapt({
      doc: branched,
      url: 'https://chatgpt.com/c/abc',
      canonicalUrl: null,
    });
    expect(r.body.branchEvidence.branchIndicator).toBe('2 / 3');
    expect(r.body.branchEvidence.notes).toMatch(/selected branch only/);
  });

  it('emits TC-ADAPT-STREAMING when a response is still generating', () => {
    const streaming = doc(
      linear +
        '<button>Stop generating</button><div class="result-streaming"></div>',
    );
    const r = chatgptConversationAdapter.adapt({
      doc: streaming,
      url: 'https://chatgpt.com/c/abc',
      canonicalUrl: null,
    });
    expect(r.diagnostics.map((d) => d.code)).toContain('TC-ADAPT-STREAMING');
    expect(r.body.branchEvidence.streamingObserved).toBe(true);
  });

  it('records visible attachment metadata without downloading', () => {
    const withImg = doc(
      '<div data-message-author-role="user"><div class="markdown"><p>see this</p>' +
        '<figure><img alt="diagram.png"></figure></div></div>',
    );
    const r = chatgptConversationAdapter.adapt({
      doc: withImg,
      url: 'https://chatgpt.com/c/abc',
      canonicalUrl: null,
    });
    expect(r.body.messages[0]!.attachments[0]).toMatchObject({
      name: 'diagram.png',
      state: 'not-downloaded',
    });
  });
});

describe('ClipSpec seam', () => {
  const specA: ClipSpec = {
    id: 'a-docs',
    version: '1.0.0',
    match: { urlGlob: ['https://a.example/docs/**'] },
    rules: { articleRootSelector: '#doc-root', markdownProfile: 'gfm' },
  };
  const specB: ClipSpec = {
    id: 'b-catchall',
    version: '2.1.0',
    match: { urlGlob: ['https://a.example/**'] },
    rules: { dropSelectors: ['.ad'] },
  };

  it('resolves the matching spec by URL glob', () => {
    expect(resolveClipSpec('https://a.example/docs/x', [specA]).spec?.id).toBe(
      'a-docs',
    );
    expect(resolveClipSpec('https://other.example/', [specA]).spec).toBeNull();
  });

  it('breaks an ambiguous match by lexicographic id + warns', () => {
    const r = resolveClipSpec('https://a.example/docs/x', [specA, specB]);
    expect(r.spec?.id).toBe('a-docs');
    expect(r.diagnostics.map((d) => d.code)).toContain(
      'TC-ADAPT-CLIPSPEC-AMBIGUOUS',
    );
  });

  it('merges defaults < ClipSpec < user toggles', () => {
    const cfg = mergeEffectiveConfig(specA, { markdownProfile: 'obsidian' });
    expect(cfg.articleRootSelector).toBe('#doc-root');
    expect(cfg.markdownProfile).toBe('obsidian'); // user wins
    expect(mergeEffectiveConfig(null).markdownProfile).toBe('obsidian');
  });

  it('validates required fields', () => {
    expect(validateClipSpec(specA)).toEqual([]);
    expect(
      validateClipSpec({ id: '', version: 'x', match: {}, rules: {} }),
    ).not.toEqual([]);
  });
});
