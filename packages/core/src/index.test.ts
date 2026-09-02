import { describe, expect, it } from 'vitest';
import {
  canonicalizePretty,
  deriveExportStatus,
  hashCanonical,
  IR_SCHEMA_VERSION,
  NotImplementedError,
  notImplemented,
  renderFencedBlock,
  validateDocumentIR,
} from './index.js';
import { articleDoc, codeBlock, paragraph } from './__fixtures__/build.js';
import type { CodeBlockNode } from './ir/nodes.js';

describe('core public surface', () => {
  it('still exports notImplemented for the detectors/adapters scaffolds', () => {
    expect(() => notImplemented('x')).toThrow(NotImplementedError);
  });

  it('exposes the IR schema version', () => {
    expect(IR_SCHEMA_VERSION).toBe(1);
  });
});

describe('walking skeleton — IR -> canonical JSON -> hash -> Markdown', () => {
  it('produces a deterministic bundle-shaped result for a small document', () => {
    const cb = codeBlock('code-1', 'const a = 1;\n');
    const codeNode: CodeBlockNode = { type: 'codeBlock', code: cb };
    const doc = articleDoc([paragraph('p1', 'Intro paragraph.'), codeNode]);

    // 1. validates
    expect(validateDocumentIR(doc)).toEqual([]);

    // 2. canonical JSON is stable and re-parseable
    const json = canonicalizePretty(doc);
    expect(JSON.stringify(JSON.parse(json))).toBe(
      JSON.stringify(JSON.parse(canonicalizePretty(doc))),
    );

    // 3. content identity hash is stable across a timestamp change
    const later = structuredClone(doc);
    later.source.captureTimestamp = '2099-01-01T00:00:00.000Z';
    expect(doc.hashes.documentContentIdentity).toMatch(/^[0-9a-f]{64}$/);
    expect(stableIdentity(doc)).toBe(stableIdentity(later));

    // 4. a trivial Markdown walk preserves code bytes exactly
    const md = renderFencedBlock({ code: cb.text, language: cb.language });
    expect(md.text).toContain('const a = 1;\n');

    // 5. export status of a clean capture is 'complete'
    expect(deriveExportStatus(doc.diagnostics).status).toBe('complete');
  });
});

function stripVolatile(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(stripVolatile);
  if (v && typeof v === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (k === 'captureTimestamp' || k === 'observedAt' || k === 'hashes')
        continue;
      out[k] = stripVolatile(val);
    }
    return out;
  }
  return v;
}

function stableIdentity(doc: unknown): string {
  return hashCanonical(stripVolatile(doc));
}
