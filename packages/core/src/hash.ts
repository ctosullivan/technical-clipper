/**
 * Hashing — `decisions/0016`.
 *
 * All hashes are SHA-256, lowercase hex. The input boundaries are fixed:
 *
 * - `CodeBlockIR.hash` — the exact `text` bytes (UTF-8) after `norm/code@1`.
 * - `MessageIR.hash` — canonical (compact) JSON of the message, excluding its
 *   own `hash` field.
 * - `HashSet.documentContentIdentity` — canonical compact JSON of the whole
 *   `DocumentIR` with volatile capture-event fields removed.
 * - `HashSet.markdown` / `HashSet.rawPageHtml` — exact rendered bytes.
 */
import { createHash } from 'node:crypto';
import { canonicalize } from './canonical.js';

/** SHA-256 of a UTF-8 string, lowercase hex. */
export function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

/** Hash of the exact code bytes (`CodeBlockIR.hash`). */
export function hashCodeText(text: string): string {
  return sha256Hex(text);
}

/** Hash of a value's canonical compact JSON. */
export function hashCanonical(value: unknown): string {
  return sha256Hex(canonicalize(value));
}

/**
 * Deep-clone `value` with the given dotted key paths removed, then hash its
 * canonical compact JSON. Used for the content-identity view (`decisions/0016`).
 */
export function hashCanonicalExcluding(
  value: unknown,
  excludeKeys: readonly string[],
): string {
  const exclude = new Set(excludeKeys);
  const strip = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(strip);
    if (v && typeof v === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        if (exclude.has(k)) continue;
        out[k] = strip(val);
      }
      return out;
    }
    return v;
  };
  return hashCanonical(strip(value));
}
