/**
 * `ConversationIR` and `MessageIR` — `decisions/0011`, `decisions/0008`.
 *
 * Only the currently selected, fully loaded branch is captured. Hidden
 * branches, deleted edits, and internal reasoning are never represented.
 */
import type { BlockNode } from './nodes.js';

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

/** Visible attachment metadata only — nothing is downloaded (`decisions/0017`). */
export interface AttachmentRef {
  name: string;
  /** `image | file | audio | other` as far as the UI reveals. */
  kind: 'image' | 'file' | 'audio' | 'other';
  state: 'not-downloaded';
  /** Why it was not downloaded (out of scope, authenticated, generated, …). */
  reason: string;
}

/** Evidence that the captured branch is the current, complete one (`decisions/0008`). */
export interface BranchEvidence {
  /** Number of turns captured. */
  turnCount: number;
  /** Branch-switcher text observed, e.g. `"2 / 3"`, or `null` if none present. */
  branchIndicator: string | null;
  /** True when a streaming / "stop generating" indicator was present (fatal). */
  streamingObserved: boolean;
  /** Free-text description of the signals used. */
  notes: string;
}

export interface MessageIR {
  id: string;
  role: MessageRole;
  /** 0-based position within the captured branch. */
  order: number;
  /** DOM signal used to assign the role. */
  roleEvidence: string;
  blocks: BlockNode[];
  attachments: AttachmentRef[];
  /** SHA-256 of this message's canonical JSON subtree, excluding `hash` (`decisions/0016`). */
  hash: string;
}

export interface ConversationIR {
  conversationTitle: string | null;
  /** Only when visibly exposed by the UI. */
  modelLabel: string | null;
  branchEvidence: BranchEvidence;
  /** Current selected branch only, in order. */
  messages: MessageIR[];
}
