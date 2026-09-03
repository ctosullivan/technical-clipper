/**
 * Integration: the completeness report (`decisions/0015`, Phase 8) over the
 * fixture corpus. The report goldens are written by
 * `scripts/capture-fixture.mjs` (which evaluates against `expected-outline.json`
 * when a fixture supplies one); this test asserts the § 12 completeness gates
 * from those goldens.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const dirs = ['articles', 'code', 'conversations'].map((d) =>
  join(repoRoot, 'fixtures', d),
);

function allFixtures(): { name: string; report: Record<string, unknown> }[] {
  const out: { name: string; report: Record<string, unknown> }[] = [];
  for (const base of dirs) {
    for (const slug of readdirSync(base)) {
      const p = join(base, slug, 'expected-report.json');
      if (existsSync(p)) {
        out.push({ name: slug, report: JSON.parse(readFileSync(p, 'utf8')) });
      }
    }
  }
  return out;
}

describe('completeness report — fixture corpus', () => {
  it('every fixture has a report golden', () => {
    expect(allFixtures().length).toBeGreaterThanOrEqual(28);
  });

  it('gate 5: a fixture with lost content never reports complete', () => {
    const loss = allFixtures().find((f) => f.name === 'section-loss')!;
    expect(loss.report.status).toBe('partial');
    expect(loss.report.sections).toMatchObject({ expected: 3, kept: 2 });
    expect((loss.report.warnings as string[]).join(' ')).toMatch(
      /expected section/,
    );
  });

  it('gate: canExport is false only for a failed status', () => {
    for (const f of allFixtures()) {
      if (f.report.status === 'failed') {
        expect(f.report.canExport, f.name).toBe(false);
      } else {
        expect(f.report.canExport, f.name).toBe(true);
      }
    }
  });

  it('gate: a partial status always requires a visible warning', () => {
    for (const f of allFixtures()) {
      if (f.report.status === 'partial') {
        expect(f.report.requiresVisibleWarning, f.name).toBe(true);
      }
    }
  });

  it('gate 6/11: code accounting sums correctly for every fixture', () => {
    for (const f of allFixtures()) {
      const c = f.report.code as Record<string, number>;
      expect(c.exact + c.normalized + c.approximate + c.failed, f.name).toBe(
        c.detected,
      );
    }
  });

  it('adversarial-monaco-virtualized: a failed code block -> partial', () => {
    const m = allFixtures().find(
      (f) => f.name === 'adversarial-monaco-virtualized',
    )!;
    expect(m.report.status).toBe('partial');
    expect((m.report.code as { failed: number }).failed).toBe(1);
  });

  it('streaming-in-progress: fatal -> failed, no export', () => {
    const s = allFixtures().find((f) => f.name === 'streaming-in-progress')!;
    expect(s.report.status).toBe('failed');
    expect(s.report.canExport).toBe(false);
  });
});
