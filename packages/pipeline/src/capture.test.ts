import { describe, expect, it } from 'vitest';
import { capture } from './capture.js';
import { DetectorRegistry } from './seam.js';
import { runWithNetworkTrap, CaptureNetworkError } from './network-trap.js';
import { stubCodeDetector } from './__fixtures__/stub-detector.js';

const AT = '2026-09-03T12:00:00.000Z';
const URL = 'https://example.com/post';

const article = `<!doctype html><html><head><title>T</title></head><body>
  <nav><a href="/">Home</a></nav>
  <main>
    <h1>Widget Guide</h1>
    <p>Intro with a <a href="/rel">relative link</a>.</p>
    <h2>Details</h2>
    <ul><li>one</li><li>two<ul><li>nested</li></ul></li></ul>
    <blockquote><p>quoted</p></blockquote>
    <table><tr><th>A</th><th>B</th></tr><tr><td>1</td><td>2</td></tr></table>
  </main>
  <aside class="related"><h3>Related</h3><p>noise</p></aside>
  <footer>site footer</footer>
</body></html>`;

describe('capture — article path', () => {
  it('produces a validated article IR from a clean page', () => {
    const { document: doc, export: dec } = capture({
      html: article,
      url: URL,
      capturedAt: AT,
    });
    expect(doc.captureKind).toBe('article');
    expect(doc.body).toHaveProperty('blocks');
    if (doc.captureKind === 'conversation') throw new Error('unexpected');
    const types = doc.body.blocks.map((b) => b.type);
    expect(types).toEqual([
      'heading',
      'paragraph',
      'heading',
      'list',
      'blockquote',
      'table',
    ]);
    expect(dec.status).toBe('complete');
    expect(dec.canExport).toBe(true);
  });

  it('resolves links to absolute and records removed noise', () => {
    const { document: doc } = capture({
      html: article,
      url: URL,
      capturedAt: AT,
    });
    if (doc.captureKind === 'conversation') throw new Error('unexpected');
    const para = doc.body.blocks[1];
    if (!para || para.type !== 'paragraph')
      throw new Error('expected paragraph');
    const link = para.children.find((c) => c.type === 'link');
    expect(link && 'href' in link && link.href).toBe('https://example.com/rel');
    expect(doc.body.removedRegions.map((r) => r.reason)).toContain('footer');
    expect(doc.body.removedRegions.map((r) => r.reason)).toContain(
      'related-content',
    );
  });

  it('is deterministic — identical input yields identical content identity', () => {
    const a = capture({ html: article, url: URL, capturedAt: AT }).document;
    const b = capture({
      html: article,
      url: URL,
      capturedAt: '2099-01-01T00:00:00.000Z',
    }).document;
    expect(a.hashes.documentContentIdentity).toMatch(/^[0-9a-f]{64}$/);
    expect(a.hashes.documentContentIdentity).toBe(
      b.hashes.documentContentIdentity,
    );
  });

  it('round-trips a protected code block through the sentinel seam', () => {
    const html = `<main><h1>H</h1><p>text</p>
      <pre data-tc-test-code data-lang="ts">const a = 1;\nconst b = 2;\n</pre>
      <p>after</p></main>`;
    const detectors = new DetectorRegistry().register(stubCodeDetector);
    const { document: doc } = capture({
      html,
      url: URL,
      capturedAt: AT,
      detectors,
    });
    expect(doc.captureKind).toBe('technical_article');
    if (doc.captureKind === 'conversation') throw new Error('unexpected');
    const code = doc.body.blocks.find((b) => b.type === 'codeBlock');
    expect(code && code.type === 'codeBlock' && code.code.text).toBe(
      'const a = 1;\nconst b = 2;\n',
    );
    expect(code && code.type === 'codeBlock' && code.code.confidence).toBe(
      'exact',
    );
    // block hash recorded
    if (code?.type === 'codeBlock') {
      expect(doc.hashes.blocks[code.code.id]).toBe(code.code.hash);
    }
  });

  it('flags a fatal when no article root is credible', () => {
    const { document: doc, export: dec } = capture({
      html: '<body><span>hi</span></body>',
      url: URL,
      capturedAt: AT,
    });
    expect(dec.status).toBe('failed');
    expect(dec.canExport).toBe(false);
    expect(doc.diagnostics.map((d) => d.code)).toContain('TC-EXTRACT-NOROOT');
  });

  it('detects a sentinel-loss as fatal', () => {
    // The detector claims a <pre> that sits inside a <footer>; noise removal
    // then detaches the footer, taking the sentinel with it.
    const html = `<html><body><main><h1>H</h1><p>body text here</p></main>
      <footer><pre data-tc-test-code>lost = true</pre></footer></body></html>`;
    const detectors = new DetectorRegistry().register(stubCodeDetector);
    const { document: doc, export: dec } = capture({
      html,
      url: URL,
      capturedAt: AT,
      detectors,
    });
    expect(doc.diagnostics.map((d) => d.code)).toContain(
      'TC-EXTRACT-SENTINEL-LOST',
    );
    expect(dec.status).toBe('failed');
  });

  it('runs capture with the network trap active', () => {
    const callFetch = () =>
      (globalThis as unknown as { fetch: () => unknown }).fetch();
    expect(() => runWithNetworkTrap(callFetch)).toThrow(CaptureNetworkError);
    // sanity: fetch restored afterward
    expect(typeof (globalThis as { fetch?: unknown }).fetch).not.toBe(
      'undefined',
    );
  });
});
