/**
 * @technical-clipper/core
 *
 * Browser-independent core (Phase 3): the typed IR family, provenance /
 * confidence semantics, the diagnostics model + export-status derivation,
 * canonical serialization, normalization rulesets, content-addressable node
 * ids, hashing, and safe Markdown fence selection. All pure functions — no
 * DOM, no detectors, no adapters, no renderer, no bundle.
 *
 * Contracts: `decisions/0011`–`0016`, `0019` (fence), `0021` (fence parity
 * with the markdown-clipping skill verifier).
 */

// --- IR contracts ---
export * from './ir/index.js';

// --- provenance / confidence ---
export * from './provenance.js';

// --- diagnostics + export status ---
export * from './diagnostics/index.js';

// --- deterministic primitives ---
export * from './canonical.js';
export * from './normalize.js';
export * from './ids.js';
export * from './hash.js';
export * from './fence.js';

// --- validation ---
export * from './validate.js';

// --- detector / adapter seam contracts ---
export * from './seam.js';

// --- rendering + capture bundle ---
export * from './render/index.js';
export * from './bundle/index.js';

// --- validation + completeness evaluation ---
export * from './evaluate/index.js';

/**
 * Thrown by scaffolding stubs in `@technical-clipper/detectors` /
 * `@technical-clipper/adapters` that intentionally have no behaviour yet
 * (replaced in Phases 5 and 6). Kept here so those packages fail loudly
 * rather than silently returning fake data.
 */
export class NotImplementedError extends Error {
  constructor(feature: string) {
    super(`${feature} is not implemented yet (see planning/ROADMAP.md)`);
    this.name = 'NotImplementedError';
  }
}

/** Throw a {@link NotImplementedError} for an unfinished scaffold surface. */
export function notImplemented(feature: string): never {
  throw new NotImplementedError(feature);
}
