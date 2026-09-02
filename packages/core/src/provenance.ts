/**
 * Provenance, evidence source, and confidence semantics — `decisions/0012`.
 *
 * Every extracted artifact (code block, code group, terminal session, article
 * root, adapter-produced block) carries a {@link Provenance} and a
 * {@link Confidence}. "Exact" is only meaningful relative to a named
 * {@link EvidenceSource}.
 */

/** What observable browser source the stored bytes came from (`decisions/0012`). */
export type EvidenceSource =
  /** `textContent` of an exposed copy-source / `<code>` node in the cloned DOM. */
  | 'dom-text-content'
  /** Reassembled from rendered inline / token spans (e.g. Prism `<span>` soup). */
  | 'dom-rendered-reconstruction'
  /** Recovered from a `data-*` / `value` attribute payload. */
  | 'attribute-value'
  /** Original HTTP response bytes. Not available to an MV3 content script in the MVP. */
  | 'http-response-bytes';

/** Confidence in an extracted artifact (`decisions/0012`). */
export type Confidence =
  /** Byte-for-byte identical to the named evidence source, zero transformation. */
  | 'exact'
  /** Transformed only by a named, versioned normalization ruleset. */
  | 'normalized'
  /** Recovered with known lossy reconstruction; always paired with a diagnostic. */
  | 'approximate'
  /** Detected but not extractable; no content emitted, a diagnostic is emitted. */
  | 'failed';

/** How an artifact was produced. */
export interface Provenance {
  /** `'general-extractor' | 'detector' | 'adapter' | 'clipspec'`. */
  method: 'general-extractor' | 'detector' | 'adapter' | 'clipspec';
  /** Semver of the extractor / detector / adapter that produced the artifact. */
  methodVersion: string;
  detectorId?: string;
  adapter?: { name: string; version: string };
  evidenceSource: EvidenceSource;
  /** Free text, e.g. `language from <code class="language-ts">`. */
  notes?: string;
}

/** Evidence sources under which an `exact` claim is legal. */
export const EXACT_EVIDENCE_SOURCES: readonly EvidenceSource[] = [
  'dom-text-content',
  'attribute-value',
];

/**
 * True when `(confidence, evidenceSource)` is a legal pairing per
 * `decisions/0012`. `exact` requires a byte-authoritative evidence source;
 * `approximate` may not claim `http-response-bytes`.
 */
export function isConfidenceEvidenceLegal(
  confidence: Confidence,
  evidenceSource: EvidenceSource,
): boolean {
  if (confidence === 'exact') {
    return EXACT_EVIDENCE_SOURCES.includes(evidenceSource);
  }
  if (
    confidence === 'approximate' &&
    evidenceSource === 'http-response-bytes'
  ) {
    return false;
  }
  return true;
}

/** Confidence values that must be accompanied by a diagnostic (`decisions/0012`). */
export function requiresDiagnostic(confidence: Confidence): boolean {
  return confidence === 'approximate' || confidence === 'failed';
}
