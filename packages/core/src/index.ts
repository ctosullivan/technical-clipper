/**
 * @technical-clipper/core
 *
 * Browser-independent core: typed IR contracts (`DocumentIR`, `ArticleIR`,
 * `ConversationIR`, `CodeBlockIR`, ...), provenance/confidence semantics,
 * canonical normalization, and hashing.
 *
 * Phase 0 scaffold only. No IR types or normalization logic exist yet — see
 * `planning/ROADMAP.md` (Phase 3) once the Phase 1 plans are written.
 */

/** Thrown by scaffolding stubs that intentionally have no behaviour yet. */
export class NotImplementedError extends Error {
  constructor(feature: string) {
    super(`${feature} is not implemented yet (see planning/ROADMAP.md)`);
    this.name = 'NotImplementedError';
  }
}

/**
 * Marks a scaffold surface that a later phase must replace with real
 * behaviour. Throwing (rather than returning a placeholder value) means a
 * caller that forgets to wire up the real implementation fails loudly
 * instead of silently succeeding with fake data.
 */
export function notImplemented(feature: string): never {
  throw new NotImplementedError(feature);
}

/** Honest scaffold marker — never claim more than "scaffold" until real
 * IR/normalization/hashing behaviour lands. */
export const CORE_PACKAGE_STATUS = 'scaffold' as const;
