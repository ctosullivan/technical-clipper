/**
 * Obsidian handoff — `decisions/0019`; `planning` § 16 (content-size guard).
 *
 * Default mechanism: the `obsidian://new` URI scheme. Browsers cap URL length
 * (~2 MB in Chromium, but intermediaries and the OS are stricter), so a note
 * larger than {@link OBSIDIAN_URI_LIMIT} falls back to "copy Markdown + save
 * the bundle" and tells the user why.
 */

/** Conservative payload cap for the `obsidian://new` URI (bytes of UTF-8). */
export const OBSIDIAN_URI_LIMIT = 200_000;

export interface ObsidianHandoff {
  method: 'uri' | 'fallback';
  /** Present when `method === 'uri'`. */
  uri?: string;
  /** Present when `method === 'fallback'` — a user-facing explanation. */
  reason?: string;
}

/**
 * Decide how to hand `markdown` to Obsidian. `title` seeds the note name;
 * `vault` targets a specific vault when the user configured one.
 */
export function planObsidianHandoff(
  markdown: string,
  opts: { title?: string | null; vault?: string | null } = {},
): ObsidianHandoff {
  const bytes = new TextEncoder().encode(markdown).length;
  if (bytes > OBSIDIAN_URI_LIMIT) {
    return {
      method: 'fallback',
      reason: `This note is ${(bytes / 1024).toFixed(0)} KB, larger than the ${(
        OBSIDIAN_URI_LIMIT / 1024
      ).toFixed(
        0,
      )} KB the Obsidian URI can carry reliably. Copy the Markdown or download the bundle instead.`,
    };
  }
  const params = new URLSearchParams();
  if (opts.title) params.set('name', sanitizeNoteName(opts.title));
  if (opts.vault) params.set('vault', opts.vault);
  params.set('content', markdown);
  return { method: 'uri', uri: `obsidian://new?${params.toString()}` };
}

function sanitizeNoteName(title: string): string {
  return title
    .replace(/[\\/:*?"<>|#^[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
}
