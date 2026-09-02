# Roadmap

Complete, dependency-ordered phase table for `technical-clipper`, Phase 0
through the MVP release. Update this table whenever phase status or scope
changes — see `AGENTS.md` § "Roadmap and context".

Status values: `not started`, `planned`, `in progress`, `blocked`, `done`.

## MVP milestone

The MVP is **one milestone**, tagged only after Phase 10's release gates pass
(or carry recorded manual evidence) and the user explicitly approves release
(`AGENTS.md` § commit/release). There is no per-phase release.

## Phase table

|   # | Working name                                                 | Intended outcome                                                                                                                                      | Depends on | Plan                                                                                                                   | Status  |
| --: | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------- | ------- |
|   0 | Repository scaffolding and governance                        | Buildable empty workspace, process docs, architecture baseline, ADRs 0001–0010                                                                        | —          | [phase-0-repo-scaffolding.md](phase-0-repo-scaffolding.md)                                                             | done    |
|   1 | Plan implementation through MVP                              | Plans 2–10, cross-phase ADRs 0011–0020, execution procedure, refined roadmap, resumable context; no product code                                      | 0          | [phase-1-plan-mvp.md](phase-1-plan-mvp.md)                                                                             | done    |
|   2 | Markdown-clipping Claude skill                               | Current CommonMark/GFM/Obsidian references, output profiles, anti-pattern catalogue, offline verifier                                                 | 1          | [phase-2-markdown-clipping-skill.md](phase-2-markdown-clipping-skill.md)                                               | planned |
|   3 | Core IR, provenance, normalization, hashing                  | Browser-independent typed contracts (`decisions/0011`–`0016`) with deterministic unit tests                                                           | 1          | [phase-3-core-ir-provenance-normalization-hashing.md](phase-3-core-ir-provenance-normalization-hashing.md)             | planned |
|   4 | DOM capture and standard article extraction                  | Cloned-DOM pipeline, deterministic article-root selection, Wikipedia/semantic-article support via the generic path, sentinels, detector/adapter seams | 3          | [phase-4-dom-capture-and-article-extraction.md](phase-4-dom-capture-and-article-extraction.md)                         | planned |
|   5 | Standard code extraction                                     | `<pre><code>`, Prism, Highlight.js, block-level `<code>`, terminal structures; exact-text + confidence/evidence; no chrome contamination              | 3, 4       | [phase-5-standard-code-extraction.md](phase-5-standard-code-extraction.md)                                             | planned |
|   6 | Structured adapters                                          | Docusaurus tab groups, ChatGPT current-branch conversation adapter, ClipSpec override seam                                                            | 3, 4, 5    | [phase-6-structured-adapters.md](phase-6-structured-adapters.md)                                                       | planned |
|   7 | Deterministic rendering and capture bundle                   | Profile-aware Markdown, canonical JSON, hashes, diagnostics files, reproducible ZIP, content-vs-event identity split                                  | 2, 3, 5, 6 | [phase-7-rendering-and-capture-bundle.md](phase-7-rendering-and-capture-bundle.md)                                     | planned |
|   8 | Validation and completeness diagnostics                      | Fatal/warning policy, export-status derivation, cross-stage fidelity assertions, completeness report                                                  | 7          | [phase-8-validation-and-completeness-diagnostics.md](phase-8-validation-and-completeness-diagnostics.md)               | planned |
|   9 | Chromium extension and Obsidian handoff                      | Clip-page action, preview, completeness report, copy, Obsidian handoff, bundle download, least-privilege MV3                                          | 7, 8       | [phase-9-chromium-extension-and-obsidian-handoff.md](phase-9-chromium-extension-and-obsidian-handoff.md)               | planned |
|  10 | Corpus, comparative evaluation, security review, MVP release | § 12 fixture minimums, `pnpm run gates`, comparative benchmark, security review, packaged extension, explicit approval to tag                         | 9          | [phase-10-corpus-evaluation-security-review-mvp-release.md](phase-10-corpus-evaluation-security-review-mvp-release.md) | planned |

## Cross-phase ADRs settled in Phase 1

| ADR                                                                            | Subject                                                                           | Primary consumers |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | ----------------- |
| [0011](../decisions/0011-typed-ir-family.md)                                   | Typed IR family + capture/source kinds                                            | 3, 4, 5, 6, 7     |
| [0012](../decisions/0012-provenance-and-confidence-semantics.md)               | Provenance, evidence source, confidence semantics                                 | 3, 4, 5, 6, 8     |
| [0013](../decisions/0013-detector-adapter-interfaces-and-precedence.md)        | Detector/adapter interfaces, precedence, sentinel protocol                        | 4, 5, 6           |
| [0014](../decisions/0014-stable-node-identifiers.md)                           | Content-addressable node identifiers                                              | 3, 7              |
| [0015](../decisions/0015-diagnostics-and-export-status.md)                     | Diagnostics model + export-status levels                                          | 3, 4–8, 9         |
| [0016](../decisions/0016-canonical-serialization-normalization-and-hashing.md) | Canonical JSON, normalization rulesets, hashing boundaries, fence selection       | 3, 7              |
| [0017](../decisions/0017-capture-bundle-contract.md)                           | Bundle contract, manifest versioning, raw-HTML/privacy, content-vs-event identity | 7, 9              |
| [0018](../decisions/0018-clipspec-override-seam-and-adapter-versioning.md)     | ClipSpec seam + adapter/detector versioning                                       | 6, 9              |
| [0019](../decisions/0019-markdown-output-profiles.md)                          | Markdown output profile selection                                                 | 2, 7, 9           |
| [0020](../decisions/0020-fixture-corpus-and-release-gate-measurement.md)       | Fixture corpus layout + release-gate → check map                                  | 4–10              |

## Dependency-order rationale and cross-phase review

Reviewed all plans together for missing dependencies, circular ordering,
oversized phases, contradictions, work assigned before its contracts exist,
and unmeasurable release criteria (`planning/v0-to-mvp-planning-prompt.md`
§ 8). Findings and resolutions:

- **Order kept as the § 13 hypothesis (0→10).** Phase 3 (the IR) is the true
  foundation; every phase 4–8 ends in something fixture-testable without the
  extension, and phase 9 is the first UI. No vertical slice is moved earlier.
- **Risk-first spike, without moving phases.** Phase 3 includes a throwaway
  "walking skeleton" test (hand-built `DocumentIR` → canonical JSON → hash →
  stub Markdown walk) so the end-to-end pipeline shape is de-risked before
  Phase 4, kept as a test rather than promoted to a phase.
- **Phase 2 depends only on Phase 1** and is independent of Phase 3; it stays
  ordered second for review simplicity and because its output (the profile
  references) is the normative check for Phase 7's renderer.
- **Circular-looking 4↔5 resolved by seams.** Phase 4 defines the detector
  seam and ships _stub_ detectors; Phase 5 fills them. Phase 4 does not depend
  on Phase 5's output. Same pattern for 4→6 (adapter seam) and the ClipSpec
  hook points.
- **Contracts precede use.** Every contract a phase needs is an accepted ADR
  (0011–0020) before that phase starts. Phase-local ADRs (DOM library, root
  scoring, language inference, sanitizer, bundler, Obsidian handoff, …) are
  listed in each plan and are not cross-phase.
- **Oversized-phase check.** Phase 4 and Phase 7 are the largest. Each is
  internally sequenced and independently testable at its end (validated
  `ArticleIR` from fixtures; deterministic bundle from an IR). If either
  proves un-shippable as one unit during implementation, split it and update
  this table transparently — do not carry half a phase forward.
- **Release-gate measurability.** All 17 § 12 gates are mapped to a runnable
  check or a recorded manual check in `decisions/0020`; gates 16 (Obsidian
  vault) and 17 (comparative benchmark) are manual with committed evidence
  under `docs/evaluation/`. No gate is left as an unmeasurable statement.
- **No product code in Phase 1.** Verified: Phase 1 touched only
  `planning/`, `decisions/`, `architecture/`, `CHANGELOG.md`.

## Post-MVP (not scheduled)

Firefox/Safari/mobile, native Obsidian plugin, ClipSpec editor/distribution,
AI-proposed adapters, local image mirroring, WARC capture — each requires a new
ADR before it enters the roadmap (`AGENTS.md` § non-goals).
