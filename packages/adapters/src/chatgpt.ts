/**
 * ChatGPT current-branch conversation adapter — `decisions/0008`, `0026`.
 *
 * Captures only the currently selected, fully loaded branch. Message order,
 * user/assistant roles, and branch completeness come from stable DOM signals
 * or the capture fails (`TC-ADAPT-BRANCH`). Streaming ⇒ `TC-ADAPT-STREAMING`
 * (fatal). Hidden branches, deleted edits, and internal reasoning are never
 * claimed.
 */
import {
  computeNodeId,
  hashCanonical,
  makeDiagnostic,
  messageSeed,
  type AttachmentRef,
  type BranchEvidence,
  type ConversationIR,
  type Diagnostic,
  type MessageIR,
  type MessageRole,
} from '@technical-clipper/core';
import type { ConversationAdapter, ConversationAdaptResult } from './types.js';
import { extractMessageBlocks } from './message-blocks.js';

const ADAPTER_VERSION = '1.0.0';

function isChatGpt(url: string, doc: Document): boolean {
  if (/\b(chatgpt\.com|chat\.openai\.com)\//.test(url)) return true;
  return doc.querySelector('[data-message-author-role]') !== null;
}

const ROLES: readonly MessageRole[] = ['user', 'assistant', 'system', 'tool'];

/** Role from stable DOM evidence (`decisions/0026`). */
function roleOf(el: Element): { role: MessageRole; evidence: string } {
  const attr = el.getAttribute('data-message-author-role');
  if (ROLES.includes(attr as MessageRole)) {
    return {
      role: attr as MessageRole,
      evidence: 'data-message-author-role attribute',
    };
  }
  const inner = el.querySelector('[data-message-author-role]');
  const innerAttr = inner?.getAttribute('data-message-author-role');
  if (ROLES.includes(innerAttr as MessageRole)) {
    return {
      role: innerAttr as MessageRole,
      evidence: 'nested data-message-author-role attribute',
    };
  }
  const testid = el.getAttribute('data-testid') ?? '';
  const m = testid.match(/conversation-turn-(user|assistant|system|tool)/);
  if (m)
    return { role: m[1] as MessageRole, evidence: 'data-testid turn role' };
  const cls = el.getAttribute('class') ?? '';
  if (/\buser\b/.test(cls))
    return { role: 'user', evidence: 'class token "user"' };
  if (/\bassistant\b/.test(cls))
    return { role: 'assistant', evidence: 'class token "assistant"' };
  return {
    role: 'assistant',
    evidence: 'structural fallback (no role marker)',
  };
}

function streamingObserved(doc: Document): boolean {
  return (
    doc.querySelector('.result-streaming, [data-streaming="true"]') !== null ||
    Array.from(doc.querySelectorAll('button')).some((b) =>
      /stop generating/i.test(b.textContent ?? ''),
    )
  );
}

/** Branch indicator text like "2 / 3" near a message, or null. */
function branchIndicator(doc: Document): string | null {
  for (const el of Array.from(doc.querySelectorAll('*'))) {
    const t = (el.textContent ?? '').trim();
    if (/^\d+\s*\/\s*\d+$/.test(t) && el.children.length === 0) return t;
  }
  return null;
}

function attachmentsOf(el: Element): AttachmentRef[] {
  const out: AttachmentRef[] = [];
  for (const a of Array.from(
    el.querySelectorAll('[data-testid*="attachment"], .attachment, figure img'),
  )) {
    const name =
      a.getAttribute('alt') ??
      a.getAttribute('title') ??
      a.getAttribute('data-filename') ??
      'attachment';
    out.push({
      name,
      kind: a.tagName === 'IMG' ? 'image' : 'file',
      state: 'not-downloaded',
      reason:
        'attachment download is out of MVP scope (decisions/0008, non-goals)',
    });
  }
  return out;
}

export const chatgptConversationAdapter: ConversationAdapter = {
  name: 'chatgpt/current-branch',
  version: ADAPTER_VERSION,

  appliesTo({ url, doc }) {
    return isChatGpt(url, doc);
  },

  adapt(ctx): ConversationAdaptResult {
    const { doc } = ctx;
    const diagnostics: Diagnostic[] = [];
    const base = ctx.canonicalUrl ?? ctx.url;

    const turnEls = Array.from(
      doc.querySelectorAll(
        '[data-message-author-role], [data-testid^="conversation-turn"], article[data-turn]',
      ),
    ).filter((el, _i, all) => !all.some((o) => o !== el && o.contains(el)));

    const streaming = streamingObserved(doc);
    if (streaming) {
      diagnostics.push(
        makeDiagnostic('TC-ADAPT-STREAMING', {
          phase: 'adapt',
          message:
            'the conversation was still generating a response when captured',
        }),
      );
    }

    if (turnEls.length === 0) {
      diagnostics.push(
        makeDiagnostic('TC-ADAPT-BRANCH', {
          phase: 'adapt',
          message: 'no conversation turns with a stable role marker were found',
        }),
      );
    }

    const messages: MessageIR[] = [];
    turnEls.forEach((el, index) => {
      const { role, evidence } = roleOf(el);
      const content =
        el.querySelector(
          '.markdown, .prose, [data-message-content], .message-content',
        ) ?? el;
      const { blocks, diagnostics: blockDiags } = extractMessageBlocks(
        content,
        base,
      );
      diagnostics.push(...blockDiags);
      const attachments = attachmentsOf(el);
      const id = computeNodeId(
        messageSeed({
          role,
          order: index,
          firstBlockIds: blocks
            .slice(0, 3)
            .map((b) => ('id' in b ? b.id : b.type)),
        }),
      );
      const partial: Omit<MessageIR, 'hash'> = {
        id,
        role,
        order: index,
        roleEvidence: evidence,
        blocks,
        attachments,
      };
      messages.push({ ...partial, hash: hashCanonical(partial) });
    });

    const markedRoles = messages.filter(
      (m) => !m.roleEvidence.startsWith('structural fallback'),
    ).length;
    if (messages.length > 0 && markedRoles === 0) {
      diagnostics.push(
        makeDiagnostic('TC-ADAPT-BRANCH', {
          phase: 'adapt',
          message:
            'no message carried a stable role marker; roles cannot be established (decisions/0008)',
        }),
      );
    }

    const indicator = branchIndicator(doc);
    const branchEvidence: BranchEvidence = {
      turnCount: messages.length,
      branchIndicator: indicator,
      streamingObserved: streaming,
      notes: indicator
        ? `branch switcher present showing "${indicator}"; captured the selected branch only, never hidden branches`
        : 'no branch switcher present; conversation is linear',
    };

    const body: ConversationIR = {
      conversationTitle:
        doc
          .querySelector('title')
          ?.textContent?.replace(/\s*[|-]\s*ChatGPT\s*$/i, '')
          .trim() ?? null,
      modelLabel:
        doc
          .querySelector('[data-testid="model-switcher"], .model-name')
          ?.textContent?.trim() ?? null,
      branchEvidence,
      messages,
    };

    return { body, captureScope: 'chatgpt-current-branch', diagnostics };
  },
};
