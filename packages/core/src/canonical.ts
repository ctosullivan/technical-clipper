/**
 * Canonical JSON serialization — `decisions/0016`.
 *
 * - UTF-8, LF newlines.
 * - Object keys sorted ascending by Unicode code point.
 * - Compact form is what hashes cover; pretty form (2-space, one trailing LF)
 *   is what lands on disk and is a deterministic function of the compact form.
 * - `undefined`-valued fields are omitted; `null` is explicit.
 * - Numbers: shortest round-tripping decimal; no `NaN` / `Infinity`.
 * - Arrays keep their semantic order.
 */

export type Json =
  null | boolean | number | string | Json[] | { [key: string]: Json };

/** Sort object keys by Unicode code point (not UTF-16 code unit). */
function compareCodePoints(a: string, b: string): number {
  const ai = Array.from(a);
  const bi = Array.from(b);
  const n = Math.min(ai.length, bi.length);
  for (let i = 0; i < n; i++) {
    const ca = ai[i]!.codePointAt(0)!;
    const cb = bi[i]!.codePointAt(0)!;
    if (ca !== cb) return ca - cb;
  }
  return ai.length - bi.length;
}

function normalizeNumber(n: number): number {
  if (!Number.isFinite(n)) {
    throw new Error(`Non-finite number cannot be canonicalized: ${n}`);
  }
  // JSON.stringify already emits the shortest round-tripping decimal.
  return n;
}

/** Recursively strip `undefined` and produce a key-sorted plain structure. */
function toCanonicalValue(value: unknown): Json {
  if (value === null) return null;
  const t = typeof value;
  if (t === 'boolean' || t === 'string') return value as boolean | string;
  if (t === 'number') return normalizeNumber(value as number);
  if (t === 'bigint') {
    throw new Error('bigint cannot be canonicalized');
  }
  if (Array.isArray(value)) {
    return value.map((v) => (v === undefined ? null : toCanonicalValue(v)));
  }
  if (t === 'object') {
    const src = value as Record<string, unknown>;
    const out: Record<string, Json> = {};
    for (const key of Object.keys(src).sort(compareCodePoints)) {
      const v = src[key];
      if (v === undefined) continue;
      out[key] = toCanonicalValue(v);
    }
    return out;
  }
  throw new Error(`Unsupported value in canonical JSON: ${t}`);
}

function writeCompact(value: Json): string {
  if (value === null) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return JSON.stringify(value);
  if (typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map(writeCompact).join(',')}]`;
  }
  const entries = Object.keys(value).map(
    (k) => `${JSON.stringify(k)}:${writeCompact(value[k]!)}`,
  );
  return `{${entries.join(',')}}`;
}

function writePretty(value: Json, indent: number): string {
  const pad = '  '.repeat(indent);
  const padInner = '  '.repeat(indent + 1);
  if (value === null || typeof value !== 'object') {
    return writeCompact(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value.map((v) => padInner + writePretty(v, indent + 1));
    return `[\n${items.join(',\n')}\n${pad}]`;
  }
  const keys = Object.keys(value);
  if (keys.length === 0) return '{}';
  const items = keys.map(
    (k) =>
      `${padInner}${JSON.stringify(k)}: ${writePretty(value[k]!, indent + 1)}`,
  );
  return `{\n${items.join(',\n')}\n${pad}}`;
}

/** Canonical compact JSON string — the form every hash covers. */
export function canonicalize(value: unknown): string {
  return writeCompact(toCanonicalValue(value));
}

/** Canonical pretty JSON string (2-space indent, one trailing LF) — the on-disk form. */
export function canonicalizePretty(value: unknown): string {
  return writePretty(toCanonicalValue(value), 0) + '\n';
}
