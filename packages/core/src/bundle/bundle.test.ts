import { describe, expect, it } from 'vitest';
import { assembleBundle } from './assemble.js';
import { buildZip, crc32 } from './zip.js';
import { articleDoc, codeBlock, paragraph } from '../__fixtures__/build.js';
import type { CodeBlockNode } from '../ir/nodes.js';

const doc = () =>
  articleDoc([
    paragraph('p1', 'Intro.'),
    {
      type: 'codeBlock',
      code: codeBlock('c1', 'const a = 1;\n'),
    } as CodeBlockNode,
  ]);

describe('buildZip', () => {
  it('is byte-deterministic and orders entries lexicographically', () => {
    const entries = [
      { path: 'b.txt', data: new TextEncoder().encode('bbb') },
      { path: 'a.txt', data: new TextEncoder().encode('aaa') },
    ];
    const z1 = buildZip(entries);
    const z2 = buildZip([...entries].reverse());
    expect(Buffer.from(z1).equals(Buffer.from(z2))).toBe(true);
    // local header for a.txt precedes b.txt
    const s = Buffer.from(z1).toString('latin1');
    expect(s.indexOf('a.txt')).toBeLessThan(s.indexOf('b.txt'));
  });

  it('computes a known CRC-32', () => {
    // crc32("The quick brown fox jumps over the lazy dog") = 0x414FA339
    expect(
      crc32(
        new TextEncoder().encode('The quick brown fox jumps over the lazy dog'),
      ),
    ).toBe(0x414fa339);
  });
});

describe('assembleBundle', () => {
  it('produces the five core files with a slug directory', () => {
    const { files } = assembleBundle(doc(), { profile: 'obsidian' });
    const names = Object.keys(files).map((p) =>
      p.split('/').slice(1).join('/'),
    );
    expect(names).toContain('content.md');
    expect(names).toContain('document.json');
    expect(names).toContain('manifest.json');
    expect(names).toContain('diagnostics.json');
  });

  it('separates content identity from event metadata (decisions/0017)', () => {
    const a = assembleBundle(doc(), { profile: 'obsidian' });
    const later = { ...doc() };
    later.source = {
      ...later.source,
      captureTimestamp: '2099-01-01T00:00:00.000Z',
    };
    const b = assembleBundle(later, { profile: 'obsidian' });

    // documentContentIdentity is the universal identity — timestamp-independent.
    expect(a.manifest.contentIdentity.documentContentIdentity).toBe(
      b.manifest.contentIdentity.documentContentIdentity,
    );

    // content.md for a frontmatter-free profile is byte-identical across the
    // timestamp change (the obsidian profile embeds `captured:` by design).
    const aGfm = assembleBundle(doc(), { profile: 'gfm' });
    const later2 = { ...doc() };
    later2.source = {
      ...later2.source,
      captureTimestamp: '2099-01-01T00:00:00.000Z',
    };
    const bGfm = assembleBundle(later2, { profile: 'gfm' });
    const md = (r: typeof aGfm) =>
      Object.entries(r.files).find(([p]) => p.endsWith('content.md'))![1];
    expect(md(aGfm)).toBe(md(bGfm));

    // but the manifest event timestamp differs, so the whole ZIP differs
    expect(Buffer.from(a.zip).equals(Buffer.from(b.zip))).toBe(false);
    expect(a.manifest.event.timestamp).not.toBe(b.manifest.event.timestamp);
  });

  it('two builds of identical content are byte-identical', () => {
    const a = assembleBundle(doc(), { profile: 'obsidian' });
    const b = assembleBundle(doc(), { profile: 'obsidian' });
    expect(Buffer.from(a.zip).equals(Buffer.from(b.zip))).toBe(true);
  });

  it('omits raw HTML for a conversation by default, includes it for an article on request', () => {
    const art = assembleBundle(doc(), {
      profile: 'obsidian',
      rawPageHtml: '<html><body>hi</body></html>',
    });
    expect(art.manifest.rawHtmlIncluded).toBe(true);
    expect(
      Object.keys(art.files).some((p) => p.endsWith('raw/page.html')),
    ).toBe(true);

    const noRaw = assembleBundle(doc(), {
      profile: 'obsidian',
      rawPageHtml: '<html></html>',
      includeRawHtml: false,
    });
    expect(noRaw.manifest.rawHtmlIncluded).toBe(false);
  });
});
