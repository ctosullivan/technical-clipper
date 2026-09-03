import { describe, expect, it } from 'vitest';
import { OBSIDIAN_URI_LIMIT, planObsidianHandoff } from './obsidian.js';

describe('planObsidianHandoff', () => {
  it('builds an obsidian://new URI for a small note', () => {
    const plan = planObsidianHandoff('# Title\n\nbody', { title: 'My Note' });
    expect(plan.method).toBe('uri');
    expect(plan.uri).toMatch(/^obsidian:\/\/new\?/);
    const params = new URLSearchParams(plan.uri!.split('?')[1]);
    expect(params.get('name')).toBe('My Note');
    expect(params.get('content')).toBe('# Title\n\nbody');
  });

  it('sanitizes the note name of vault-illegal characters', () => {
    const plan = planObsidianHandoff('x', { title: 'a/b:c*d?"e' });
    const name = new URLSearchParams(plan.uri!.split('?')[1]).get('name');
    expect(name).not.toMatch(/[\\/:*?"<>|#^[\]]/);
  });

  it('falls back with a reason when the note exceeds the URI limit', () => {
    const big = 'x'.repeat(OBSIDIAN_URI_LIMIT + 1);
    const plan = planObsidianHandoff(big);
    expect(plan.method).toBe('fallback');
    expect(plan.reason).toMatch(/larger than/i);
    expect(plan.uri).toBeUndefined();
  });

  it('includes the vault when configured', () => {
    const plan = planObsidianHandoff('x', { vault: 'Research' });
    expect(new URLSearchParams(plan.uri!.split('?')[1]).get('vault')).toBe(
      'Research',
    );
  });
});
