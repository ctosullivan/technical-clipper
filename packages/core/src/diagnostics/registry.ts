/**
 * Diagnostics model and the code registry — `decisions/0015`.
 *
 * Every diagnostic has a stable, namespaced code (`TC-<AREA>-<NNN>`) with a
 * default severity and default `blocksExport`. A producer may raise severity
 * for a specific occurrence but must not silently lower it below the default.
 */

export type Severity = 'info' | 'warning' | 'error' | 'fatal';

export type DiagnosticPhase =
  | 'detect'
  | 'extract'
  | 'adapt'
  | 'assemble'
  | 'validate'
  | 'render'
  | 'bundle';

export interface Diagnostic {
  /** Stable, namespaced: `TC-<AREA>-<NNN>`. */
  code: string;
  severity: Severity;
  /** Human-readable, specific, no stack traces. */
  message: string;
  phase: DiagnosticPhase;
  sourceLocation?: {
    nodeId?: string;
    domPath?: string;
    fixturePath?: string;
  };
  blocksExport: boolean;
  /** Machine detail, canonical-JSON-safe. */
  data?: Record<string, string | number | boolean>;
}

export interface DiagnosticSpec {
  code: string;
  defaultSeverity: Severity;
  defaultBlocksExport: boolean;
  description: string;
}

const SPECS = [
  // --- assemble / validate ---
  {
    code: 'TC-ASSEMBLE-EMPTY',
    defaultSeverity: 'error',
    defaultBlocksExport: false,
    description: 'The assembled IR has no content blocks.',
  },
  {
    code: 'TC-ASSEMBLE-ORPHAN-SENTINEL',
    defaultSeverity: 'fatal',
    defaultBlocksExport: true,
    description:
      'A sentinel appeared in extractor output with no matching IR leaf.',
  },
  {
    code: 'TC-VALIDATE-SCHEMA',
    defaultSeverity: 'fatal',
    defaultBlocksExport: true,
    description: 'The IR failed schema validation.',
  },
  {
    code: 'TC-VALIDATE-DUP-ID',
    defaultSeverity: 'fatal',
    defaultBlocksExport: true,
    description: 'Two IR nodes share an id after assembly.',
  },
  {
    code: 'TC-VALIDATE-CONFIDENCE',
    defaultSeverity: 'fatal',
    defaultBlocksExport: true,
    description:
      'An artifact claims a confidence its evidence source does not permit.',
  },
  {
    code: 'TC-VALIDATE-MISSING-DIAGNOSTIC',
    defaultSeverity: 'fatal',
    defaultBlocksExport: true,
    description:
      'An approximate/failed artifact has no accompanying diagnostic.',
  },
  {
    code: 'TC-VALIDATE-SCHEMA-VERSION',
    defaultSeverity: 'fatal',
    defaultBlocksExport: true,
    description: 'The IR schema version is newer than this build understands.',
  },
  // --- extract ---
  {
    code: 'TC-EXTRACT-NOROOT',
    defaultSeverity: 'fatal',
    defaultBlocksExport: true,
    description: 'No deterministic article root could be selected.',
  },
  {
    code: 'TC-EXTRACT-SENTINEL-LOST',
    defaultSeverity: 'fatal',
    defaultBlocksExport: true,
    description: 'Protected code was dropped by the general extractor.',
  },
  {
    code: 'TC-EXTRACT-RECONSTRUCT',
    defaultSeverity: 'warning',
    defaultBlocksExport: false,
    description:
      'Code recovered by reconstruction from token spans (approximate).',
  },
  {
    code: 'TC-EXTRACT-LANG-LOWCONF',
    defaultSeverity: 'warning',
    defaultBlocksExport: false,
    description: 'Code language inferred with low confidence.',
  },
  {
    code: 'TC-EXTRACT-CODE-FAILED',
    defaultSeverity: 'error',
    defaultBlocksExport: false,
    description: 'A detected code component could not be extracted.',
  },
  {
    code: 'TC-EXTRACT-SECTION-LOST',
    defaultSeverity: 'error',
    defaultBlocksExport: false,
    description: 'An expected article section is missing from the output.',
  },
  {
    code: 'TC-EXTRACT-NOISE-REGION',
    defaultSeverity: 'warning',
    defaultBlocksExport: false,
    description:
      'A large region was removed by a noise rule; verify it was chrome, not content.',
  },
  {
    code: 'TC-EXTRACT-TABLE-FLATTENED',
    defaultSeverity: 'info',
    defaultBlocksExport: false,
    description:
      'A code-bearing layout table was flattened to sequential code blocks; code is preserved exactly, tabular layout is not.',
  },
  {
    code: 'TC-EXTRACT-CODE-IN-CHROME',
    defaultSeverity: 'info',
    defaultBlocksExport: false,
    description:
      'A detected code component sat inside chrome/reference furniture and was left as text rather than protected.',
  },
  {
    code: 'TC-EXTRACT-CITATION-UNRESOLVED',
    defaultSeverity: 'error',
    defaultBlocksExport: false,
    description: 'A citation/footnote marker has no matching reference entry.',
  },
  {
    code: 'TC-EXTRACT-FIGURE-MISSING',
    defaultSeverity: 'error',
    defaultBlocksExport: false,
    description: 'A figure referenced from prose is absent.',
  },
  {
    code: 'TC-EXTRACT-ASSET-UNRESOLVED',
    defaultSeverity: 'warning',
    defaultBlocksExport: false,
    description: 'A remote asset URL could not be resolved to an absolute URL.',
  },
  {
    code: 'TC-EXTRACT-INFOBOX-POLICY',
    defaultSeverity: 'info',
    defaultBlocksExport: false,
    description:
      'An infobox was included or excluded per the documented policy.',
  },
  // --- detect ---
  {
    code: 'TC-DETECT-OVERLAP',
    defaultSeverity: 'info',
    defaultBlocksExport: false,
    description: 'Two detectors overlapped; the higher-priority one won.',
  },
  {
    code: 'TC-DETECT-NONDETERMINISTIC',
    defaultSeverity: 'fatal',
    defaultBlocksExport: true,
    description: 'The detector set is non-deterministic for identical DOM.',
  },
  {
    code: 'TC-DETECT-VIRTUALIZED',
    defaultSeverity: 'error',
    defaultBlocksExport: false,
    description:
      'A virtualized editor was detected; exact recovery is out of scope.',
  },
  {
    code: 'TC-DETECT-TERMINAL-AMBIGUOUS',
    defaultSeverity: 'warning',
    defaultBlocksExport: false,
    description:
      'Terminal input/output split was inferred, not marked (approximate).',
  },
  // --- adapt ---
  {
    code: 'TC-ADAPT-BRANCH',
    defaultSeverity: 'fatal',
    defaultBlocksExport: true,
    description:
      'ChatGPT current-branch completeness/roles could not be established.',
  },
  {
    code: 'TC-ADAPT-STREAMING',
    defaultSeverity: 'fatal',
    defaultBlocksExport: true,
    description: 'The conversation was still streaming when captured.',
  },
  {
    code: 'TC-ADAPT-MULTI-SITE',
    defaultSeverity: 'fatal',
    defaultBlocksExport: true,
    description: 'Two site adapters matched the same capture.',
  },
  {
    code: 'TC-ADAPT-CLIPSPEC-AMBIGUOUS',
    defaultSeverity: 'warning',
    defaultBlocksExport: false,
    description:
      'Two ClipSpecs matched; the lexicographically-first id was used.',
  },
  {
    code: 'TC-ADAPT-GROUP-NONCODE',
    defaultSeverity: 'info',
    defaultBlocksExport: false,
    description: 'A non-code tab in a code group was not retained as a member.',
  },
  // --- render ---
  {
    code: 'TC-RENDER-DEGRADE',
    defaultSeverity: 'info',
    defaultBlocksExport: false,
    description: 'A construct was degraded for the selected output profile.',
  },
  {
    code: 'TC-RENDER-FENCE',
    defaultSeverity: 'fatal',
    defaultBlocksExport: true,
    description:
      'Exact code bytes could not be represented inside a fenced block.',
  },
  {
    code: 'TC-RENDER-CODE-MISMATCH',
    defaultSeverity: 'fatal',
    defaultBlocksExport: true,
    description:
      'Rendered fenced code does not byte-match its CodeBlockIR.text.',
  },
  {
    code: 'TC-RENDER-HTML-SANITIZED',
    defaultSeverity: 'warning',
    defaultBlocksExport: false,
    description: 'Page-supplied HTML was removed or altered by the sanitizer.',
  },
  {
    code: 'TC-RENDER-UNKNOWN-NODE',
    defaultSeverity: 'error',
    defaultBlocksExport: false,
    description:
      'An IR node the renderer does not handle was rendered as a fallback.',
  },
  // --- bundle / page load ---
  {
    code: 'TC-BUNDLE-PAGE-INCOMPLETE',
    defaultSeverity: 'warning',
    defaultBlocksExport: false,
    description:
      'The page appeared not fully loaded (lazy images, skeletons, …).',
  },
] as const satisfies readonly DiagnosticSpec[];

export type DiagnosticCode = (typeof SPECS)[number]['code'];

const BY_CODE: ReadonlyMap<string, DiagnosticSpec> = new Map(
  SPECS.map((s) => [s.code, s]),
);

/** All registered diagnostic specs. */
export const DIAGNOSTIC_SPECS: readonly DiagnosticSpec[] = SPECS;

/** Look up a diagnostic spec by code. */
export function getDiagnosticSpec(code: string): DiagnosticSpec | undefined {
  return BY_CODE.get(code);
}

const SEVERITY_RANK: Record<Severity, number> = {
  info: 0,
  warning: 1,
  error: 2,
  fatal: 3,
};

/**
 * Build a {@link Diagnostic} from a registered code. Severity defaults to the
 * registry value; an override may only raise it, never lower it
 * (`decisions/0015`). `blocksExport` is forced `true` for `fatal`.
 */
export function makeDiagnostic(
  code: DiagnosticCode,
  fields: {
    message?: string;
    phase: DiagnosticPhase;
    severity?: Severity;
    sourceLocation?: Diagnostic['sourceLocation'];
    blocksExport?: boolean;
    data?: Diagnostic['data'];
  },
): Diagnostic {
  const spec = BY_CODE.get(code);
  if (!spec) throw new Error(`Unknown diagnostic code: ${code}`);
  let severity = spec.defaultSeverity;
  if (
    fields.severity &&
    SEVERITY_RANK[fields.severity] >= SEVERITY_RANK[severity]
  ) {
    severity = fields.severity;
  }
  const blocksExport =
    severity === 'fatal'
      ? true
      : (fields.blocksExport ?? spec.defaultBlocksExport);
  return {
    code,
    severity,
    message: fields.message ?? spec.description,
    phase: fields.phase,
    ...(fields.sourceLocation ? { sourceLocation: fields.sourceLocation } : {}),
    blocksExport,
    ...(fields.data ? { data: fields.data } : {}),
  };
}
