/**
 * ClipSpec override seam — `decisions/0018`.
 *
 * A ClipSpec is a declarative, versioned JSON document that can, for a URL
 * glob, force/suppress a detector, mark a selector as the article root or as
 * noise, set the output profile, or add fixed frontmatter. It is applied
 * deterministically and is itself fixture-tested. No runtime editing UI, no
 * distribution system (both non-goals). An AI may draft a ClipSpec; it lands
 * only via review + passing fixtures (`decisions/0002`).
 */
import { makeDiagnostic, type Diagnostic } from '@technical-clipper/core';

export type MarkdownProfile = 'commonmark' | 'gfm' | 'obsidian';

export interface ClipSpec {
  id: string;
  version: string;
  match: { urlGlob: string[] };
  rules: {
    articleRootSelector?: string;
    dropSelectors?: string[];
    keepSelectors?: string[];
    forceDetector?: { selector: string; detectorId: string }[];
    suppressDetector?: { selector?: string; detectorId: string }[];
    markdownProfile?: MarkdownProfile;
    frontmatter?: Record<string, string | string[]>;
  };
}

export interface EffectiveConfig {
  articleRootSelector: string | null;
  dropSelectors: string[];
  keepSelectors: string[];
  suppressedDetectorIds: string[];
  markdownProfile: MarkdownProfile;
  frontmatter: Record<string, string | string[]>;
  clipSpec: { id: string; version: string } | null;
}

export interface UserToggles {
  markdownProfile?: MarkdownProfile;
  includeRawHtml?: boolean;
}

const DEFAULTS: EffectiveConfig = {
  articleRootSelector: null,
  dropSelectors: [],
  keepSelectors: [],
  suppressedDetectorIds: [],
  markdownProfile: 'obsidian',
  frontmatter: {},
  clipSpec: null,
};

const GLOB_SPECIAL = new Set([
  '.',
  '+',
  '^',
  '$',
  '{',
  '}',
  '(',
  ')',
  '|',
  '[',
  ']',
  '\\',
  '?',
]);

/** Convert a simple `*` / `**` URL glob to a RegExp. */
function globToRegExp(glob: string): RegExp {
  let out = '';
  for (let i = 0; i < glob.length; i++) {
    const ch = glob[i]!;
    if (ch === '*') {
      if (glob[i + 1] === '*') {
        out += '.*';
        i++;
      } else {
        out += '[^/]*';
      }
    } else if (GLOB_SPECIAL.has(ch)) {
      out += '\\' + ch;
    } else {
      out += ch;
    }
  }
  return new RegExp(`^${out}$`);
}

export interface ClipSpecResolution {
  spec: ClipSpec | null;
  diagnostics: Diagnostic[];
}

/**
 * Resolve the ClipSpec for a URL: first match by declared order; an ambiguous
 * match (two specs of equal specificity) emits `TC-ADAPT-CLIPSPEC-AMBIGUOUS`
 * and the lexicographically-first `id` wins (deterministic).
 */
export function resolveClipSpec(
  url: string,
  specs: readonly ClipSpec[],
): ClipSpecResolution {
  const diagnostics: Diagnostic[] = [];
  const matches = specs.filter((s) =>
    s.match.urlGlob.some((g) => globToRegExp(g).test(url)),
  );
  if (matches.length === 0) return { spec: null, diagnostics };
  if (matches.length > 1) {
    const sorted = [...matches].sort((a, b) => (a.id < b.id ? -1 : 1));
    diagnostics.push(
      makeDiagnostic('TC-ADAPT-CLIPSPEC-AMBIGUOUS', {
        phase: 'adapt',
        message: `${matches.length} ClipSpecs matched ${url}; using "${sorted[0]!.id}"`,
        data: { matched: matches.map((m) => m.id).join(',') },
      }),
    );
    return { spec: sorted[0]!, diagnostics };
  }
  return { spec: matches[0]!, diagnostics };
}

/**
 * Merge effective config, lowest to highest precedence
 * (`decisions/0018`): built-in defaults < ClipSpec rules < user toggles.
 */
export function mergeEffectiveConfig(
  spec: ClipSpec | null,
  user: UserToggles = {},
): EffectiveConfig {
  const cfg: EffectiveConfig = { ...DEFAULTS };
  if (spec) {
    cfg.clipSpec = { id: spec.id, version: spec.version };
    if (spec.rules.articleRootSelector)
      cfg.articleRootSelector = spec.rules.articleRootSelector;
    if (spec.rules.dropSelectors)
      cfg.dropSelectors = [...spec.rules.dropSelectors];
    if (spec.rules.keepSelectors)
      cfg.keepSelectors = [...spec.rules.keepSelectors];
    if (spec.rules.suppressDetector)
      cfg.suppressedDetectorIds = spec.rules.suppressDetector.map(
        (d) => d.detectorId,
      );
    if (spec.rules.markdownProfile)
      cfg.markdownProfile = spec.rules.markdownProfile;
    if (spec.rules.frontmatter) cfg.frontmatter = { ...spec.rules.frontmatter };
  }
  if (user.markdownProfile) cfg.markdownProfile = user.markdownProfile;
  return cfg;
}

/** Minimal structural validation of a ClipSpec document. */
export function validateClipSpec(spec: unknown): string[] {
  const errors: string[] = [];
  if (!spec || typeof spec !== 'object') return ['not an object'];
  const s = spec as Partial<ClipSpec>;
  if (typeof s.id !== 'string' || !s.id) errors.push('missing id');
  if (typeof s.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(s.version ?? ''))
    errors.push('version must be semver');
  if (
    !s.match ||
    !Array.isArray(s.match.urlGlob) ||
    s.match.urlGlob.length === 0
  )
    errors.push('match.urlGlob must be a non-empty array');
  if (!s.rules || typeof s.rules !== 'object') errors.push('missing rules');
  return errors;
}
