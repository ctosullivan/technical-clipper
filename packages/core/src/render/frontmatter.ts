/**
 * Obsidian YAML frontmatter — `decisions/0019`.
 *
 * Unique keys, atomic or list values, no Markdown in values, timestamps as
 * quoted ISO-8601 strings. Uses the same quoting predicate as the Phase 2
 * skill verifier.
 */
import type { DocumentIR } from '../ir/document.js';
import type { ExportStatus } from '../diagnostics/status.js';

/** True when a scalar string must be quoted to survive YAML parsing. */
export function yamlNeedsQuoting(v: string): boolean {
  if (v === '') return true;
  if (v !== v.trim()) return true;
  if (/^[!&*?|>%@#-]/.test(v)) return true;
  if (/:\s/.test(v) || v.includes(' #')) return true;
  if (/^(true|false|null|yes|no|on|off)$/i.test(v)) return true;
  if (/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(v)) return true;
  if (/^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2})?)?/.test(v)) return true;
  return false;
}

export function yamlScalar(v: string): string {
  return yamlNeedsQuoting(v)
    ? `"${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
    : v;
}

/**
 * Build the frontmatter block (including the `---` fences and a trailing blank
 * line) for the `obsidian` profile. `extra` merges ClipSpec frontmatter.
 */
export function renderFrontmatter(
  doc: DocumentIR,
  exportStatus: ExportStatus,
  extra: Record<string, string | string[]> = {},
): string {
  const s = doc.source;
  const entries: [string, string | string[] | null][] = [
    ['title', s.title],
    ['source_url', s.sourceUrl],
    ['canonical_url', s.canonicalUrl],
    ['author', s.byline],
    ['published', s.publishedDate],
    ['captured', s.captureTimestamp],
    ['extractor_version', s.extractorVersion],
    ['export_status', exportStatus],
    ['capture_kind', doc.captureKind],
  ];

  const lines: string[] = ['---'];
  const seen = new Set<string>();
  const emit = (key: string, value: string | string[] | null): void => {
    if (value === null || value === undefined || seen.has(key)) return;
    seen.add(key);
    if (Array.isArray(value)) {
      if (value.length === 0) return;
      lines.push(`${key}:`);
      for (const item of value) lines.push(`  - ${yamlScalar(String(item))}`);
    } else {
      lines.push(`${key}: ${yamlScalar(String(value))}`);
    }
  };

  for (const [k, v] of entries) emit(k, v);
  for (const [k, v] of Object.entries(extra)) emit(k, v);

  lines.push('---', '');
  return lines.join('\n') + '\n';
}
