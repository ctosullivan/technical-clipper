/**
 * Integration: the ChatGPT conversation adapter and the Docusaurus tab-group
 * detector, end to end through `capture()` (`decisions/0008`, `0013`, `0027`).
 *
 * Golden + determinism via `scripts/capture-fixture.mjs`; then the § 12
 * adapter gates (correct role + order for every message fixture; 100%
 * retention of accessible alternatives in code groups) from the goldens.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const convDir = join(repoRoot, 'fixtures', 'conversations');
const codeDir = join(repoRoot, 'fixtures', 'code');

function ir(
  base: string,
  slug: string,
): {
  captureKind: string;
  body: Record<string, unknown>;
  diagnostics: { code: string }[];
} {
  return JSON.parse(readFileSync(join(base, slug, 'expected-ir.json'), 'utf8'));
}
function diag(
  base: string,
  slug: string,
): {
  exportStatus: string;
  canExport: boolean;
  diagnostics: { code: string }[];
} {
  return JSON.parse(
    readFileSync(join(base, slug, 'expected-diagnostics.json'), 'utf8'),
  );
}

describe('pipeline — adapters (conversations + Docusaurus)', () => {
  it('every conversation + docusaurus fixture matches its golden and is deterministic', () => {
    execFileSync('node', ['scripts/capture-fixture.mjs', '--conversations'], {
      cwd: repoRoot,
      stdio: 'pipe',
    });
    for (const slug of readdirSync(codeDir).filter((s) =>
      s.startsWith('docusaurus-'),
    )) {
      execFileSync(
        'node',
        ['scripts/capture-fixture.mjs', `fixtures/code/${slug}`],
        {
          cwd: repoRoot,
          stdio: 'pipe',
        },
      );
    }
  });

  it('gate 8: correct role and order for every ChatGPT message fixture', () => {
    const expected: Record<string, string[]> = {
      'linear-with-code': ['user', 'assistant'],
      'branch-switcher': ['user', 'assistant', 'user', 'assistant'],
      'rich-content': ['user', 'assistant'],
      'streaming-in-progress': ['user', 'assistant'],
    };
    for (const [slug, roles] of Object.entries(expected)) {
      const doc = ir(convDir, slug);
      expect(doc.captureKind, slug).toBe('conversation');
      const messages = doc.body.messages as { role: string; order: number }[];
      expect(
        messages.map((m) => m.role),
        slug,
      ).toEqual(roles);
      expect(
        messages.map((m) => m.order),
        slug,
      ).toEqual(roles.map((_r, i) => i));
    }
  });

  it('linear-with-code: the assistant code block keeps exact text', () => {
    const messages = ir(convDir, 'linear-with-code').body.messages as {
      blocks: { type: string; code?: { text: string; confidence: string } }[];
    }[];
    const code = messages[1]!.blocks.find((b) => b.type === 'codeBlock');
    expect(code?.code?.text).toBe(
      'with open("f.txt") as fh:\n    data = fh.read()\n',
    );
    expect(code?.code?.confidence).toBe('exact');
  });

  it('branch-switcher: records the indicator, captures only the selected branch', () => {
    const be = ir(convDir, 'branch-switcher').body.branchEvidence as {
      branchIndicator: string;
      notes: string;
    };
    expect(be.branchIndicator).toBe('2 / 3');
    expect(be.notes).toMatch(/selected branch only/);
  });

  it('streaming-in-progress: fatal, export disabled', () => {
    const d = diag(convDir, 'streaming-in-progress');
    expect(d.exportStatus).toBe('failed');
    expect(d.canExport).toBe(false);
    expect(d.diagnostics.map((x) => x.code)).toContain('TC-ADAPT-STREAMING');
  });

  it('rich-content: table + nested list + link + image attachment metadata', () => {
    const messages = ir(convDir, 'rich-content').body.messages as {
      blocks: { type: string }[];
      attachments: { name: string; state: string }[];
    }[];
    expect(messages[0]!.attachments[0]).toMatchObject({
      state: 'not-downloaded',
    });
    expect(messages[1]!.blocks.map((b) => b.type)).toContain('table');
    expect(messages[1]!.blocks.map((b) => b.type)).toContain('list');
  });

  it('gate 7: 100% retention of accessible alternatives in Docusaurus groups', () => {
    const five = ir(codeDir, 'docusaurus-five-tabs').body.blocks as {
      type: string;
      group?: { members: { label: string; code: { text: string } }[] };
    }[];
    const group = five.find((b) => b.type === 'codeGroup')!;
    expect(group.group!.members.map((m) => m.label)).toEqual([
      'npm',
      'pnpm',
      'yarn',
      'bun',
      'deno',
    ]);
    expect(group.group!.members.map((m) => m.code.text)).toEqual([
      'npm install my-lib',
      'pnpm add my-lib',
      'yarn add my-lib',
      'bun add my-lib',
      'deno add my-lib',
    ]);
  });

  it('docusaurus-noncode-tab: non-code tab omitted with an info diagnostic', () => {
    const d = diag(codeDir, 'docusaurus-noncode-tab');
    expect(d.diagnostics.map((x) => x.code)).toContain(
      'TC-ADAPT-GROUP-NONCODE',
    );
    const blocks = ir(codeDir, 'docusaurus-noncode-tab').body.blocks as {
      type: string;
      group?: { members: unknown[] };
    }[];
    expect(
      blocks.find((b) => b.type === 'codeGroup')!.group!.members,
    ).toHaveLength(1);
  });
});
