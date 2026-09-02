/**
 * Conversation adapter contract — `decisions/0013`, `0008`.
 *
 * A conversation adapter replaces the whole article path with a
 * `ConversationIR` for the currently selected, fully loaded branch. At most
 * one may apply per capture; if two match, that is fatal
 * (`TC-ADAPT-MULTI-SITE`).
 */
import type { ConversationIR, Diagnostic } from '@technical-clipper/core';

export interface ConversationAdapterContext {
  /** The parsed document (not a clone — the adapter is a pure reader). */
  doc: Document;
  url: string;
  canonicalUrl: string | null;
}

export interface ConversationAdaptResult {
  body: ConversationIR;
  /** e.g. `chatgpt-current-branch`. */
  captureScope: string;
  diagnostics: Diagnostic[];
}

export interface ConversationAdapter {
  name: string;
  version: string;
  /** Deterministic, offline. */
  appliesTo(ctx: { url: string; doc: Document }): boolean;
  adapt(ctx: ConversationAdapterContext): ConversationAdaptResult;
}
