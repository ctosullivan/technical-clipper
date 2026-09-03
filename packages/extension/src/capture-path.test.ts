/**
 * Integration: the extension's capture + export path.
 *
 * `capture-in-page.ts` does `capture({ doc: document, url, canonicalUrl })`
 * against the live DOM; the results page renders Markdown and assembles the
 * bundle from the returned `DocumentIR`. This drives that same call over a
 * linkedom-parsed fixture, then builds the extension bundle and checks it is
 * browser-safe (no `node:` builtins, no linkedom).
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, beforeAll } from 'vitest';
import { parseHTML } from 'linkedom';
import { capture } from '@technical-clipper/pipeline';
import { assembleBundle, renderMarkdown } from '@technical-clipper/core';

const extDir = fileURLToPath(new URL('..', import.meta.url));
const repoRoot = join(extDir, '..', '..');
const dist = join(extDir, 'dist');

function fixtureDoc(
  slug: string,
  kind: 'articles' | 'conversations',
): { doc: Document; url: string } {
  const dir = join(repoRoot, 'fixtures', kind, slug);
  const prov = JSON.parse(readFileSync(join(dir, 'provenance.json'), 'utf8'));
  const html = readFileSync(join(dir, 'source.html'), 'utf8');
  return {
    doc: parseHTML(html).document as unknown as Document,
    url: prov.sourceUrl,
  };
}

describe('extension bundle', () => {
  beforeAll(() => {
    execFileSync('node', ['build.mjs'], { cwd: extDir, stdio: 'pipe' });
  }, 60_000);

  it('produces browser-safe artifacts (no node: builtins, no linkedom)', () => {
    for (const f of ['background.js', 'capture-in-page.js', 'results.js']) {
      const src = readFileSync(join(dist, f), 'utf8');
      expect(src, f).not.toMatch(/require\("node:|from"node:|['"]linkedom['"]/);
    }
    expect(existsSync(join(dist, 'manifest.json'))).toBe(true);
    expect(existsSync(join(dist, 'results.html'))).toBe(true);
  });

  it('manifest is MV3 with only least-privilege permissions', () => {
    const m = JSON.parse(readFileSync(join(dist, 'manifest.json'), 'utf8'));
    expect(m.manifest_version).toBe(3);
    expect([...m.permissions].sort()).toEqual([
      'activeTab',
      'scripting',
      'storage',
    ]);
    expect(m.host_permissions).toEqual([]);
  });
});

describe('capture + export path', () => {
  it('article: capture → render → bundle, deterministic', () => {
    const { doc, url } = fixtureDoc('simple-blog-post', 'articles');
    const result = capture({ doc, url, canonicalUrl: url });
    expect(result.report.status).toBe('complete');
    expect(result.report.canExport).toBe(true);

    const md = renderMarkdown(result.document, {
      profile: 'obsidian',
    }).markdown;
    expect(md).toContain('# Understanding Widgets');

    const a = assembleBundle(result.document, { profile: 'obsidian' });
    const b = assembleBundle(result.document, { profile: 'obsidian' });
    expect(Buffer.from(a.zip).equals(Buffer.from(b.zip))).toBe(true);
    expect(Object.keys(a.files).some((p) => p.endsWith('content.md'))).toBe(
      true,
    );
  });

  it('streaming conversation: export gate blocks export', () => {
    const { doc, url } = fixtureDoc('streaming-in-progress', 'conversations');
    const result = capture({ doc, url, canonicalUrl: url });
    expect(result.report.status).toBe('failed');
    expect(result.report.canExport).toBe(false);
  });

  it('conversation bundle defaults raw HTML off', () => {
    const { doc, url } = fixtureDoc('linear-with-code', 'conversations');
    const result = capture({ doc, url, canonicalUrl: url });
    const bundle = assembleBundle(result.document, {
      profile: 'obsidian',
      rawPageHtml: '<html></html>',
    });
    expect(bundle.manifest.rawHtmlIncluded).toBe(false);
  });
});
