/**
 * @technical-clipper/pipeline
 *
 * The capture orchestrator (Phase 4): clone rendered DOM -> detect + sentinel
 * -> general article extraction -> restore -> assemble + validate `DocumentIR`.
 * `capture()` uses the standard code detectors (Phase 5) by default. Adapters
 * land in Phase 6.
 *
 * The detector/adapter seam contracts live in `@technical-clipper/core`.
 */
export { capture, type CaptureInput, type CaptureResult } from './capture.js';
export { runWithNetworkTrap, CaptureNetworkError } from './network-trap.js';
// `parseDocument` / `captureFromHtml` live in `./parse.js` (it imports
// linkedom) and are intentionally NOT re-exported here, so a browser bundle
// of `@technical-clipper/pipeline` never pulls linkedom in.
export { EXTRACTOR_VERSION } from './extract/general.js';
export {
  ROOT_SELECTION_VERSION,
  selectArticleRoot,
} from './extract/article-root.js';
export {
  SENTINEL_PREFIX,
  resolveOverlaps,
  assertSentinelBalance,
} from './sentinels.js';
