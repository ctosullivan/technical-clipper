import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const manifestPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'manifest.json',
);
const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as Record<
  string,
  unknown
>;

describe('extension manifest', () => {
  it('declares Manifest V3', () => {
    expect(manifest.manifest_version).toBe(3);
  });

  it('has the required identity fields', () => {
    expect(typeof manifest.name).toBe('string');
    expect(typeof manifest.version).toBe('string');
    expect((manifest.name as string).length).toBeGreaterThan(0);
  });

  it('requests no permissions yet, so least-privilege regresses loudly once a phase adds real capture behaviour without updating this test', () => {
    expect(manifest.permissions).toEqual([]);
    expect(manifest.host_permissions).toEqual([]);
  });
});
