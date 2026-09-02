/**
 * @technical-clipper/adapters
 *
 * The ChatGPT current-branch conversation adapter (`decisions/0008`, `0026`)
 * and the ClipSpec override seam (`decisions/0018`). Docusaurus tab groups are
 * handled by a component detector in `@technical-clipper/detectors`
 * (`code/docusaurus-tabs`) since they are DOM-pattern structure, not
 * whole-page reinterpretation.
 */
export { chatgptConversationAdapter } from './chatgpt.js';
export type {
  ConversationAdapter,
  ConversationAdapterContext,
  ConversationAdaptResult,
} from './types.js';
export {
  resolveClipSpec,
  mergeEffectiveConfig,
  validateClipSpec,
  type ClipSpec,
  type EffectiveConfig,
  type MarkdownProfile,
  type UserToggles,
} from './clipspec.js';

import { chatgptConversationAdapter } from './chatgpt.js';
import type { ConversationAdapter } from './types.js';

/** The standard conversation adapter set (one, per `decisions/0013`). */
export const standardConversationAdapters: readonly ConversationAdapter[] = [
  chatgptConversationAdapter,
];
