/**
 * Detector and adapter seam interfaces — `decisions/0013`.
 *
 * The interfaces are DOM-typed, so they live in `packages/pipeline` rather
 * than the DOM-free `packages/core`. Phase 5 fills the detector registry;
 * Phase 6 fills the adapter registry. Phase 4 ships empty registries plus one
 * test-only stub detector.
 */
import type {
  CodeBlockIR,
  CodeGroupIR,
  Diagnostic,
  TerminalSessionIR,
} from '@technical-clipper/core';

/** Fixed detector priority order (`decisions/0013`). Higher wins overlaps. */
export const DETECTOR_PRIORITY = {
  terminal: 40,
  codeGroup: 30,
  highlightedBlock: 20,
  genericPreCode: 10,
} as const;

export type DetectedKind = 'code' | 'code-group' | 'terminal';

export interface DetectedComponent {
  detectorId: string;
  kind: DetectedKind;
  /** The element whose subtree the component occupies (replaced by a sentinel). */
  element: Element;
  confidenceHint: 'high' | 'low';
  /** Produce the leaf IR. Sets its own Provenance / confidence (`decisions/0012`). */
  extract(): {
    node: CodeBlockIR | CodeGroupIR | TerminalSessionIR;
    kind: DetectedKind;
    diagnostics: Diagnostic[];
  };
}

export interface ComponentDetector {
  id: string;
  version: string;
  /** Fixed integer; higher wins overlaps (`decisions/0013`). */
  priority: number;
  /** Pure reader of the cloned DOM — never mutates it. */
  detect(root: Element): DetectedComponent[];
}

export interface AdapterContext {
  url: string;
  doc: Document;
}

export interface Adapter {
  name: string;
  version: string;
  /** Deterministic, offline. */
  appliesTo(ctx: AdapterContext): boolean;
}

export class DetectorRegistry {
  private readonly detectors: ComponentDetector[] = [];

  register(detector: ComponentDetector): this {
    this.detectors.push(detector);
    return this;
  }

  all(): readonly ComponentDetector[] {
    return [...this.detectors].sort((a, b) => b.priority - a.priority);
  }
}

export class AdapterRegistry {
  private readonly adapters: Adapter[] = [];

  register(adapter: Adapter): this {
    this.adapters.push(adapter);
    return this;
  }

  /** Adapters whose `appliesTo` is true for the context. */
  matching(ctx: AdapterContext): Adapter[] {
    return this.adapters.filter((a) => a.appliesTo(ctx));
  }
}
