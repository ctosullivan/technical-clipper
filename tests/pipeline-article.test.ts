/**
 * Integration: the built pipeline against every saved article fixture
 * (`decisions/0020`). Runs `scripts/capture-fixture.mjs --all`, which:
 *
 *  - captures each `fixtures/articles/<slug>/source.html`,
 *  - asserts the output matches the committed `expected-ir.json` /
 *    `expected-diagnostics.json` golden files,
 *  - captures twice and asserts byte-identical output (determinism).
 *
 * Plus a few explicit structural invariants read from the goldens here.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const articlesDir = join(repoRoot, 'fixtures', 'articles');

function golden(slug: string): {
  ir: Record<string, unknown>;
  diag: {
    exportStatus: string;
    canExport: boolean;
    diagnostics: { code: string }[];
  };
} {
  return {
    ir: JSON.parse(
      readFileSync(join(articlesDir, slug, 'expected-ir.json'), 'utf8'),
    ),
    diag: JSON.parse(
      readFileSync(
        join(articlesDir, slug, 'expected-diagnostics.json'),
        'utf8',
      ),
    ),
  };
}

describe('pipeline — article fixture corpus', () => {
  it('every fixture matches its golden and is deterministic', () => {
    // Throws (non-zero exit) on any golden mismatch or non-determinism.
    execFileSync('node', ['scripts/capture-fixture.mjs', '--all'], {
      cwd: repoRoot,
      stdio: 'pipe',
    });
  });

  it('has at least 8 fixtures, each with a provenance record', () => {
    const slugs = readdirSync(articlesDir);
    expect(slugs.length).toBeGreaterThanOrEqual(8);
    for (const slug of slugs) {
      const prov = JSON.parse(
        readFileSync(join(articlesDir, slug, 'provenance.json'), 'utf8'),
      );
      expect(prov.origin).toBeDefined();
      expect(typeof prov.sourceUrl).toBe('string');
    }
  });

  it('noisy-blog: chrome removed, article body kept, status complete', () => {
    const { ir, diag } = golden('noisy-blog');
    const body = ir.body as {
      blocks: { type: string }[];
      removedRegions: { reason: string }[];
    };
    expect(body.blocks.map((b) => b.type)).toEqual([
      'heading',
      'paragraph',
      'heading',
      'paragraph',
    ]);
    const reasons = body.removedRegions.map((r) => r.reason);
    expect(reasons).toContain('navigation');
    expect(reasons).toContain('footer');
    expect(reasons).toContain('cookie-ui');
    expect(diag.exportStatus).toBe('complete');
  });

  it('wikipedia-style-alpha: infobox kept, navbox/toc/editsection removed, refs collected', () => {
    const { ir, diag } = golden('wikipedia-style-alpha');
    const body = ir.body as {
      blocks: { type: string }[];
      references: unknown[];
      removedRegions: { reason: string }[];
    };
    expect(body.blocks[0]?.type).toBe('table'); // the infobox
    expect(body.blocks.filter((b) => b.type === 'list').length).toBe(1); // "See also" only
    expect(body.references.length).toBe(2);
    expect(diag.diagnostics.map((d) => d.code)).toContain(
      'TC-EXTRACT-INFOBOX-POLICY',
    );
    expect(diag.exportStatus).toBe('complete');
  });

  it('no-credible-root: fatal TC-EXTRACT-NOROOT, export disabled', () => {
    const { diag } = golden('no-credible-root');
    expect(diag.exportStatus).toBe('failed');
    expect(diag.canExport).toBe(false);
    expect(diag.diagnostics.map((d) => d.code)).toContain('TC-EXTRACT-NOROOT');
  });

  it('ambiguous-root: deterministically picks the content-bearing article', () => {
    const { ir, diag } = golden('ambiguous-root');
    const body = ir.body as {
      blocks: { type: string; children?: { value?: string }[] }[];
    };
    const h1 = body.blocks.find((b) => b.type === 'heading');
    expect(h1?.children?.map((c) => c.value).join('')).toBe('The Real Article');
    expect(diag.exportStatus).toBe('complete');
  });

  it('no fixture leaks navigation/footer text into an article block', () => {
    for (const slug of readdirSync(articlesDir)) {
      const { ir } = golden(slug);
      const text = JSON.stringify((ir.body as { blocks: unknown[] }).blocks);
      expect(text).not.toContain('site footer');
      expect(text).not.toContain('We use cookies');
      expect(text).not.toContain('Recommended for you');
    }
  });
});
