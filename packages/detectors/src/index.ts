/**
 * @technical-clipper/detectors
 *
 * `ComponentDetector` implementations (Phase 5) that identify code and
 * terminal structures in a cloned rendered DOM for sentinel-based
 * pre-extraction. The fixed priority table and overlap-resolution algorithm
 * live with the seam contracts in `@technical-clipper/core`
 * (`decisions/0013`).
 */
import {
  DetectorRegistry,
  type ComponentDetector,
} from '@technical-clipper/core';
import {
  blockLevelCodeDetector,
  highlightjsDetector,
  preCodeDetector,
  prismDetector,
} from './code.js';
import { terminalSessionDetector } from './terminal.js';
import { virtualizedEditorDetector } from './virtualized.js';
import { docusaurusTabsDetector } from './docusaurus.js';

export {
  buildCodeBlock,
  preCodeDetector,
  blockLevelCodeDetector,
  prismDetector,
  highlightjsDetector,
} from './code.js';
export { terminalSessionDetector } from './terminal.js';
export { virtualizedEditorDetector } from './virtualized.js';
export { docusaurusTabsDetector } from './docusaurus.js';
export { inferLanguage } from './language.js';
export { stripChrome, looksContaminated } from './chrome.js';

/** The standard code/terminal detector set, in registration order. */
export const standardDetectors: readonly ComponentDetector[] = [
  terminalSessionDetector,
  docusaurusTabsDetector,
  prismDetector,
  highlightjsDetector,
  virtualizedEditorDetector,
  preCodeDetector,
  blockLevelCodeDetector,
];

/** A fresh `DetectorRegistry` pre-loaded with {@link standardDetectors}. */
export function standardDetectorRegistry(): DetectorRegistry {
  return new DetectorRegistry().registerAll(standardDetectors);
}
