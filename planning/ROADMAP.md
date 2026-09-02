# Roadmap

Complete, at-a-glance phase table for `technical-clipper`, dependency-ordered
from Phase 0 through the MVP release. Update this table whenever phase
status or scope changes — see `AGENTS.md` § "Roadmap and context".

Status values: `not started`, `planned`, `in progress`, `blocked`, `done`.

|   # | Working name                                                                  | Intended outcome                                                                                                                      | Depends on | Plan                                                       | Status      |
| --: | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------- | ----------- |
|   0 | Repository scaffolding and governance                                         | Buildable empty workspace, process docs, architecture baseline, initial ADRs                                                          | —          | [phase-0-repo-scaffolding.md](phase-0-repo-scaffolding.md) | done        |
|   1 | Plan implementation through MVP                                               | Complete Phase 2-to-MVP plan files, dependency review, execution procedure, ADRs, resumable context; no product code                  | 0          | [phase-1-plan-mvp.md](phase-1-plan-mvp.md)                 | not started |
|   2 | Markdown-clipping Claude skill                                                | Current CommonMark/GFM/Obsidian references, output profiles, anti-patterns, offline examples                                          | 1          | pending Phase 1                                            | not started |
|   3 | Core IR, provenance, normalization, and hashing                               | Browser-independent typed contracts with deterministic unit tests                                                                     | 1          | pending Phase 1                                            | not started |
|   4 | DOM capture and standard article extraction                                   | Cloned-DOM pipeline, deterministic article-root selection, Wikipedia/semantic-article support, sentinels, adapter/detector precedence | 3          | pending Phase 1                                            | not started |
|   5 | Standard code extraction                                                      | `<pre><code>`, Prism, Highlight.js, block-level code, terminal structures                                                             | 3, 4       | pending Phase 1                                            | not started |
|   6 | Structured adapters                                                           | Docusaurus groups and ChatGPT current-branch conversation adapter                                                                     | 4, 5       | pending Phase 1                                            | not started |
|   7 | Deterministic rendering and capture bundle                                    | Profile-aware Markdown, canonical JSON, hashes, diagnostics files, reproducible ZIP policy                                            | 2, 3, 5, 6 | pending Phase 1                                            | not started |
|   8 | Validation and completeness diagnostics                                       | Fatal/warning policy and cross-stage fidelity assertions                                                                              | 7          | pending Phase 1                                            | not started |
|   9 | Chromium extension and Obsidian handoff                                       | Capture action, preview, copy, Obsidian export, bundle download                                                                       | 7, 8       | pending Phase 1                                            | not started |
|  10 | Article/code corpus, comparative evaluation, security review, and MVP release | Wikipedia and ordinary-article gates, code-fidelity gates, documentation, packaged extension, explicit approval to tag                | 9          | pending Phase 1                                            | not started |

Phases 2 through 10 get their implementation-ready plan files during Phase 1
(a planning-only phase) — see `planning/v0-to-mvp-planning-prompt.md` § 8.
Dependency order, milestone scope, and this table are refined at the end of
Phase 1 once every plan exists and has been reviewed together for missing
dependencies, circular ordering, oversized phases, and unmeasurable release
criteria.

The MVP is one milestone (tagged after Phase 10's release gate passes and
the user explicitly approves), not one release per phase.
