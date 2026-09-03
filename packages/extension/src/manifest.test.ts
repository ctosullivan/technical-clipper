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

/** The only permissions this extension may request (`decisions/0009`). */
const ALLOWED_PERMISSIONS = ['activeTab', 'scripting', 'storage'];

describe('extension manifest', () => {
  it('declares Manifest V3', () => {
    expect(manifest.manifest_version).toBe(3);
  });

  it('has the required identity fields and a Clip page action', () => {
    expect(typeof manifest.name).toBe('string');
    expect(typeof manifest.version).toBe('string');
    expect(
      (manifest.action as { default_title: string }).default_title,
    ).toMatch(/clip page/i);
  });

  it('requests only least-privilege permissions and no host permissions', () => {
    for (const p of manifest.permissions as string[]) {
      expect(ALLOWED_PERMISSIONS, `unexpected permission "${p}"`).toContain(p);
    }
    expect(manifest.host_permissions).toEqual([]);
    // no broad grants
    expect(manifest.permissions).not.toContain('tabs');
    expect(manifest.permissions).not.toContain('<all_urls>');
  });
});
