/**
 * @technical-clipper/pipeline
 *
 * The capture orchestrator (Phase 4): clone rendered DOM -> detect + sentinel
 * -> general article extraction -> restore -> assemble + validate `DocumentIR`.
 * Real code detectors land in Phase 5, adapters in Phase 6.
 */
export { capture, type CaptureInput, type CaptureResult } from './capture.js';
export {
  DetectorRegistry,
  AdapterRegistry,
  DETECTOR_PRIORITY,
  type Adapter,
  type AdapterContext,
  type ComponentDetector,
  type DetectedComponent,
  type DetectedKind,
} from './seam.js';
export { runWithNetworkTrap, CaptureNetworkError } from './network-trap.js';
export { parseDocument } from './dom.js';
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
