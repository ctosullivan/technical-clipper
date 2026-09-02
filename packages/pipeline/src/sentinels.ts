/**
 * Sentinel protocol — `decisions/0013`.
 *
 * Detect components in the cloned DOM, resolve overlaps deterministically,
 * replace each accepted component's element with a comment sentinel
 * `<!--tc-sentinel:{nodeId}-->`, and return a map from sentinel id to the
 * extracted leaf IR. After extraction, {@link assertSentinelBalance} checks
 * every protected node was restored exactly once.
 */
import {
  makeDiagnostic,
  type CodeBlockIR,
  type CodeGroupIR,
  type Diagnostic,
  type TerminalSessionIR,
} from '@technical-clipper/core';
import { NODE_COMMENT, structuralPath } from './dom.js';
import type {
  DetectedComponent,
  DetectorRegistry,
} from '@technical-clipper/core';

export const SENTINEL_PREFIX = 'tc-sentinel:';

export interface SentinelLeaf {
  id: string;
  kind: 'code' | 'code-group' | 'terminal';
  node: CodeBlockIR | CodeGroupIR | TerminalSessionIR;
}

export interface SentinelResult {
  /** Sentinel id -> extracted leaf. */
  leaves: Map<string, SentinelLeaf>;
  diagnostics: Diagnostic[];
}

function docOrderKey(el: Element, root: Element): string {
  return structuralPath(el, root);
}

/**
 * Deterministic overlap resolution (`decisions/0013`): sort by
 * `(priority desc, document order asc, detectorId asc)`, accept a component
 * only if its element does not overlap an already-accepted one.
 */
export function resolveOverlaps(
  components: DetectedComponent[],
  priorityOf: (detectorId: string) => number,
  root: Element,
): { accepted: DetectedComponent[]; diagnostics: Diagnostic[] } {
  const diagnostics: Diagnostic[] = [];
  const sorted = [...components].sort((a, b) => {
    const pa = priorityOf(a.detectorId);
    const pb = priorityOf(b.detectorId);
    if (pa !== pb) return pb - pa;
    const oa = docOrderKey(a.element, root);
    const ob = docOrderKey(b.element, root);
    if (oa !== ob) return oa < ob ? -1 : 1;
    return a.detectorId < b.detectorId
      ? -1
      : a.detectorId > b.detectorId
        ? 1
        : 0;
  });

  const accepted: DetectedComponent[] = [];
  for (const c of sorted) {
    const overlaps = accepted.find(
      (a) =>
        a.element === c.element ||
        a.element.contains(c.element) ||
        c.element.contains(a.element),
    );
    if (overlaps) {
      diagnostics.push(
        makeDiagnostic('TC-DETECT-OVERLAP', {
          phase: 'detect',
          message: `detector ${c.detectorId} lost an overlap to ${overlaps.detectorId}`,
          sourceLocation: { domPath: docOrderKey(c.element, root) },
          data: { loser: c.detectorId, winner: overlaps.detectorId },
        }),
      );
      continue;
    }
    accepted.push(c);
  }
  return { accepted, diagnostics };
}

/**
 * Run detectors over the cloned root, resolve overlaps, and substitute
 * sentinels. Mutates `root`.
 */
export function substituteSentinels(
  root: Element,
  registry: DetectorRegistry,
): SentinelResult {
  const priorityById = new Map<string, number>();
  const detected: DetectedComponent[] = [];
  for (const detector of registry.all()) {
    priorityById.set(detector.id, detector.priority);
    for (const c of detector.detect(root)) detected.push(c);
  }

  const { accepted, diagnostics } = resolveOverlaps(
    detected,
    (id) => priorityById.get(id) ?? 0,
    root,
  );

  const leaves = new Map<string, SentinelLeaf>();
  for (const c of accepted) {
    const { node, kind, diagnostics: extractDiags } = c.extract();
    diagnostics.push(...extractDiags);
    leaves.set(node.id, { id: node.id, kind, node });
    const sentinel = root.ownerDocument.createComment(
      `${SENTINEL_PREFIX}${node.id}`,
    );
    c.element.replaceWith(sentinel);
  }

  return { leaves, diagnostics };
}

/** True if a comment node is a sentinel; returns its id or null. */
export function sentinelId(commentData: string): string | null {
  return commentData.startsWith(SENTINEL_PREFIX)
    ? commentData.slice(SENTINEL_PREFIX.length)
    : null;
}

/** Collect the sentinel ids still present in a (post-extraction) subtree. */
export function collectSentinelIds(root: Element): string[] {
  const ids: string[] = [];
  const walk = (node: Node): void => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === NODE_COMMENT) {
        const id = sentinelId((child as Comment).data);
        if (id) ids.push(id);
      } else {
        walk(child);
      }
    }
  };
  walk(root);
  return ids;
}

/**
 * After extraction, verify every protected leaf was restored exactly once
 * (`decisions/0013`, `0015`). `restoredIds` is the multiset of sentinel ids
 * the extractor actually emitted into the IR.
 */
export function assertSentinelBalance(
  leaves: Map<string, SentinelLeaf>,
  restoredIds: readonly string[],
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const restored = new Map<string, number>();
  for (const id of restoredIds) restored.set(id, (restored.get(id) ?? 0) + 1);

  for (const id of leaves.keys()) {
    const count = restored.get(id) ?? 0;
    if (count === 0) {
      diagnostics.push(
        makeDiagnostic('TC-EXTRACT-SENTINEL-LOST', {
          phase: 'assemble',
          message: `protected component ${id} was dropped by the general extractor`,
          sourceLocation: { nodeId: id },
        }),
      );
    }
  }
  for (const [id, count] of restored) {
    if (!leaves.has(id)) {
      diagnostics.push(
        makeDiagnostic('TC-ASSEMBLE-ORPHAN-SENTINEL', {
          phase: 'assemble',
          message: `sentinel ${id} appeared in output with no matching leaf`,
          sourceLocation: { nodeId: id },
        }),
      );
    } else if (count > 1) {
      diagnostics.push(
        makeDiagnostic('TC-ASSEMBLE-ORPHAN-SENTINEL', {
          phase: 'assemble',
          message: `sentinel ${id} was restored ${count} times`,
          sourceLocation: { nodeId: id },
        }),
      );
    }
  }
  return diagnostics;
}
