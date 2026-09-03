/**
 * Stable, content-addressable node identifiers — `decisions/0014`.
 *
 * `id = base32lower(sha256(canonicalSeed)).slice(0, 16)` where `canonicalSeed`
 * is the canonical compact JSON of an ordered tuple. Ids are a function of
 * captured meaning, never of the page's markup or the tools used.
 */
import { canonicalize } from './canonical.js';
import { normalizeProse } from './normalize.js';
import { sha256Bytes } from './sha256.js';

const BASE32_ALPHABET = 'abcdefghijklmnopqrstuvwxyz234567';

function base32Lower(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    out += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return out;
}

/** Compute a 16-char node id from an already-built seed tuple. */
export function computeNodeId(seed: unknown): string {
  const digest = sha256Bytes(new TextEncoder().encode(canonicalize(seed)));
  return base32Lower(digest).slice(0, 16);
}

/** Seed for a prose block node (`decisions/0014`). */
export function proseBlockSeed(params: {
  type: string;
  parentId: string | null;
  ordinalAmongSameType: number;
  /** Concatenated inline text of the node, before normalization. */
  rawText: string;
}): unknown {
  return [
    params.type,
    params.parentId,
    params.ordinalAmongSameType,
    normalizeProse(params.rawText),
  ];
}

/** Seed for a code-block leaf — content-addressed on the exact bytes. */
export function codeBlockSeed(params: {
  text: string;
  hasFinalNewline: boolean;
}): unknown {
  return ['codeBlock', params.text, params.hasFinalNewline];
}

/** Seed for a code group / terminal session — derived from member/entry ids. */
export function compositeSeed(
  type: string,
  memberIds: readonly string[],
): unknown {
  return [type, ...memberIds];
}

/** Seed for a message (`decisions/0014`). */
export function messageSeed(params: {
  role: string;
  order: number;
  firstBlockIds: readonly string[];
}): unknown {
  return ['message', params.role, params.order, params.firstBlockIds.join(',')];
}

/** Seed for a reference / footnote-definition entry. */
export function referenceSeed(params: {
  type: string;
  label: string;
  rawText: string;
}): unknown {
  return [params.type, params.label, normalizeProse(params.rawText)];
}

/**
 * Disambiguate a set of ids: if any id repeats, append `-<globalIndex>` to the
 * later occurrence(s). Returns the (possibly rewritten) id list, order kept.
 */
export function dedupeIds(ids: readonly string[]): string[] {
  const seen = new Set<string>();
  return ids.map((id, i) => {
    if (!seen.has(id)) {
      seen.add(id);
      return id;
    }
    const rewritten = `${id}-${i}`;
    seen.add(rewritten);
    return rewritten;
  });
}
