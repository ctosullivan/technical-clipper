/**
 * Deterministic ZIP writer — `decisions/0017`, `0029`.
 *
 * STORE only (no compression) for the MVP: fully deterministic, zero
 * dependencies, no `zlib`. Entries in fixed lexicographic path order; every
 * entry timestamped to the DOS epoch (1980-01-01); files `0644`, the one
 * directory `0755`; no extra fields, no archive comment.
 */

const utf8 = (s: string): Uint8Array => new TextEncoder().encode(s);

// --- CRC-32 -----------------------------------------------------------

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = CRC_TABLE[(c ^ bytes[i]!) & 0xff]! ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// --- writer ----------------------------------------------------------

export interface ZipEntry {
  /** POSIX path within the archive, e.g. `raw/page.html`. */
  path: string;
  data: Uint8Array;
  /** true for a directory entry (data must be empty). */
  directory?: boolean;
}

function pushU16(arr: number[], v: number): void {
  arr.push(v & 0xff, (v >>> 8) & 0xff);
}
function pushU32(arr: number[], v: number): void {
  arr.push(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff);
}

/** DOS date/time for 1980-01-01 00:00:00. */
const DOS_DATE = 0x0021; // (1980-1980)<<9 | 1<<5 | 1
const DOS_TIME = 0x0000;

/**
 * Build a deterministic ZIP archive. Two archives built from byte-identical
 * `entries` are byte-identical.
 */
export function buildZip(entries: readonly ZipEntry[]): Uint8Array {
  const sorted = [...entries].sort((a, b) => (a.path < b.path ? -1 : 1));
  const local: number[] = [];
  const central: number[] = [];
  let offset = 0;

  for (const entry of sorted) {
    const isDir = entry.directory === true;
    const nameBytes = utf8(
      isDir ? entry.path.replace(/\/?$/, '/') : entry.path,
    );
    const data = isDir ? new Uint8Array(0) : entry.data;
    const crc = crc32(data);
    const externalAttrs = isDir ? (0o40755 << 16) | 0x10 : 0o100644 << 16;

    // local file header
    const lfhStart = offset;
    const lfh: number[] = [];
    pushU32(lfh, 0x04034b50);
    pushU16(lfh, 20); // version needed
    pushU16(lfh, 0x0800); // general purpose: UTF-8 names
    pushU16(lfh, 0); // method: STORE
    pushU16(lfh, DOS_TIME);
    pushU16(lfh, DOS_DATE);
    pushU32(lfh, crc);
    pushU32(lfh, data.length); // compressed size
    pushU32(lfh, data.length); // uncompressed size
    pushU16(lfh, nameBytes.length);
    pushU16(lfh, 0); // extra field length
    for (const b of lfh) local.push(b);
    for (const b of nameBytes) local.push(b);
    for (const b of data) local.push(b);
    offset += lfh.length + nameBytes.length + data.length;

    // central directory header
    pushU32(central, 0x02014b50);
    pushU16(central, 20); // version made by
    pushU16(central, 20); // version needed
    pushU16(central, 0x0800);
    pushU16(central, 0); // method
    pushU16(central, DOS_TIME);
    pushU16(central, DOS_DATE);
    pushU32(central, crc);
    pushU32(central, data.length);
    pushU32(central, data.length);
    pushU16(central, nameBytes.length);
    pushU16(central, 0); // extra
    pushU16(central, 0); // comment
    pushU16(central, 0); // disk number
    pushU16(central, 0); // internal attrs
    pushU32(central, externalAttrs >>> 0);
    pushU32(central, lfhStart);
    for (const b of nameBytes) central.push(b);
  }

  const cdStart = offset;
  const eocd: number[] = [];
  pushU32(eocd, 0x06054b50);
  pushU16(eocd, 0); // disk
  pushU16(eocd, 0); // disk with CD
  pushU16(eocd, sorted.length);
  pushU16(eocd, sorted.length);
  pushU32(eocd, central.length);
  pushU32(eocd, cdStart);
  pushU16(eocd, 0); // comment length

  return new Uint8Array([...local, ...central, ...eocd]);
}

export { crc32 };
