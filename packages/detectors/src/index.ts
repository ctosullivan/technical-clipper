/**
 * @technical-clipper/detectors
 *
 * `ComponentDetector` implementations that identify code blocks, tab groups,
 * and terminal I/O structures in a cloned rendered DOM, ahead of general
 * article extraction (see AGENTS.md § "General extraction plus narrow
 * adapters").
 *
 * Phase 0 scaffold only — no detectors exist yet. See `planning/ROADMAP.md`
 * (Phase 5) once the Phase 1 plans are written.
 */
import { notImplemented } from '@technical-clipper/core';

export const DETECTORS_PACKAGE_STATUS = 'scaffold' as const;

/** Placeholder entrypoint — real detector registry/precedence lands in Phase 5. */
export function detectComponents(): never {
  return notImplemented('component detection');
}
