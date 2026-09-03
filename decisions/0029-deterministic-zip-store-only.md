# 0029. Deterministic ZIP: hand-rolled, STORE-only for the MVP

## Status

Accepted (Phase 7).

## Context

`decisions/0006` / `0017` require a byte-deterministic capture bundle: fixed
entry order, fixed timestamps, normalized permissions, no wall-clock or
platform variance. The Phase 7 plan left "hand-rolled minimal ZIP writer or a
pinned library" open.

## Decision

`packages/core/src/bundle/zip.ts` is a **hand-rolled ZIP writer, STORE method
only** (no compression) for the MVP:

- Entries sorted by path (lexicographic), lengths from the content.
- Every entry's DOS date/time fixed to `1980-01-01 00:00:00`.
- External attributes: files `0644`, directories `0755`.
- General-purpose flag: UTF-8 filenames (`0x0800`) only.
- No extra fields, no data descriptors, no archive comment, no ZIP64.
- CRC-32 computed with a table-based implementation in the same file.
- No dependency; no `node:zlib` (so it runs unchanged in a browser bundle).

Two archives built from byte-identical entry lists are byte-identical.

## Alternatives considered

- **DEFLATE via `node:zlib`** — rejected for the MVP: `zlib` is a Node builtin
  that a browser bundle can't use; a portable DEFLATE (fflate/pako) is another
  dependency and its output can vary by version/level. STORE is smaller in
  code, has zero variance, and capture bundles are small (a few text files).
  A future ADR can add DEFLATE if bundle size becomes a problem.
- **A pinned ZIP library (`jszip`, `fflate`)** — rejected: adds a dependency
  to the deterministic path and we'd still assert byte-stability with a
  fixture; writing ~120 lines is cheaper and fully under our control.
- **tar instead of zip** — rejected: § 3 / § 11 say "capture bundle" / ZIP;
  Obsidian users expect a zip.

## Consequences

- `assembleBundle` returns a `Uint8Array` that is byte-stable for identical
  content (bundle-determinism tests assert this).
- Bundles are slightly larger than a compressed archive; acceptable for the
  MVP's text-only bundles.
- If DEFLATE is added later, the format version (`bundleFormatVersion`) bumps
  and the ADR is superseded.
