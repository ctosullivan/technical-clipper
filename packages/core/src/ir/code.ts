/**
 * Code leaf contracts — `decisions/0011`.
 *
 * `CodeBlockIR` / `CodeGroupIR` / `TerminalSessionIR` are embedded by value in
 * the block-node tree (`decisions/0011` — a single serializable IR tree).
 */
import type { Confidence, EvidenceSource, Provenance } from '../provenance.js';

/** How a code block's `language` field was determined (`decisions/0011`). */
export type LanguageEvidence =
  'info-string' | 'class-token' | 'adapter' | 'inferred-heuristic' | 'none';

/** A single code block, content-addressed on its exact bytes (`decisions/0011`). */
export interface CodeBlockIR {
  /** Content-addressable id (`decisions/0014`). */
  id: string;
  /** Exact code text. Only `norm/code@1` (BOM strip + line-ending record) applies. */
  text: string;
  /** Whether `text` ends with a newline. Recorded, never altered. */
  hasFinalNewline: boolean;
  /** Normalized language token (`norm/infostring@1`) or `null` if unknown. */
  language: string | null;
  languageEvidence: LanguageEvidence;
  filename: string | null;
  caption: string | null;
  highlightedLines: number[] | null;
  extraction: Provenance;
  confidence: Confidence;
  evidenceSource: EvidenceSource;
  /** SHA-256 of the exact `text` bytes, UTF-8 (`decisions/0016`). */
  hash: string;
}

/** How a code group is presented in the source (`decisions/0011`). */
export type CodeGroupKind = 'docusaurus-tabs' | 'generic-tabs';

/** A group of alternative code blocks (tabbed examples) — every alternative retained. */
export interface CodeGroupIR {
  id: string;
  label: string | null;
  groupKind: CodeGroupKind;
  members: { label: string; code: CodeBlockIR }[];
  defaultMemberIndex: number | null;
  extraction: Provenance;
}

/** One line/segment of a terminal session, tagged by stream. */
export interface TerminalEntry {
  stream: 'input' | 'output';
  text: string;
  hasFinalNewline: boolean;
}

/** An explicitly-marked terminal input/output session (`decisions/0011`). */
export interface TerminalSessionIR {
  id: string;
  entries: TerminalEntry[];
  /** DOM signal used to separate input from output. */
  streamEvidence: string;
  extraction: Provenance;
  confidence: Confidence;
}
