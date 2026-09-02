/**
 * @technical-clipper/adapters
 *
 * Site/conversation `Adapter` implementations (Docusaurus tab groups, the
 * ChatGPT current-branch conversation adapter, ...). Adapters describe what
 * is unusual about a page rather than reimplementing whole-page extraction
 * (see AGENTS.md § "General extraction plus narrow adapters").
 *
 * Phase 0 scaffold only — no adapters exist yet. See `planning/ROADMAP.md`
 * (Phase 6) once the Phase 1 plans are written.
 */
import { notImplemented } from '@technical-clipper/core';

export const ADAPTERS_PACKAGE_STATUS = 'scaffold' as const;

/** Placeholder entrypoint — real adapter registry lands in Phase 6. */
export function adaptDocument(): never {
  return notImplemented('adapter-based extraction');
}
