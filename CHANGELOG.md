# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Phase 8: validation and completeness diagnostics.
  - `packages/core/src/evaluate/` — `evaluateCapture(doc, options)` runs the
    cross-stage fidelity assertions (content present, code accounting
    `detected = exact + normalized + approximate + failed`, citation/footnote
    resolution, and section retention against a fixture-supplied
    `expected-outline.json`) and returns a `CompletenessReport` (status,
    reason, gate flags, code/citation/section counts, human warnings) —
    `decisions/0015`, `0031`.
  - `capture()` runs `evaluateCapture` in `finalize()` and returns `report`
    on `CaptureResult`; `contentKnownIncomplete` from any assertion forces at
    least `partial`.
  - `decisions/0031` (completeness-report shape + `expected-outline` fixture
    convention).
  - Every fixture gains `expected-report.json`; new `fixtures/articles/section-loss`
    pins § 12 gate 5 (lost section → cannot report `complete`).
    `tests/evaluate.test.ts` + `packages/core/src/evaluate/evaluate.test.ts`.

- Phase 7: deterministic rendering and the capture bundle.
  - `packages/core/src/render/` — `renderMarkdown(doc, { profile })`: one IR
    walker, three profile configs (`commonmark` / `gfm` / `obsidian`,
    `decisions/0019`), the `decisions/0030` degrade table, `selectFence`
    integration with render-back verification (`TC-RENDER-CODE-MISMATCH`),
    labelled code groups + terminal input/output, obsidian YAML frontmatter,
    and raw HTML emitted as fenced text (`decisions/0028`).
  - `packages/core/src/bundle/` — canonical JSON file writers,
    `manifest.json` (content-identity vs. event-metadata split,
    `decisions/0017`), a hand-rolled STORE-only deterministic ZIP writer
    (`decisions/0029`, with a table-based CRC-32), and `assembleBundle()`.
  - `decisions/0028` (HTML → fenced text), `0029` (STORE-only ZIP), `0030`
    (profile-degrade table).
  - Every fixture now carries golden `expected.md` / `expected.gfm.md` /
    `expected.commonmark.md` / `expected-hashes.json`; `scripts/capture-fixture.mjs`
    renders all three profiles and checks bundle byte-stability.
  - `docs/capture-format.md` replaced with the implemented contract.

- Phase 6: structured adapters — the conversation path and the ClipSpec seam.
  - `@technical-clipper/adapters`: the ChatGPT current-branch conversation
    adapter (`ConversationIR`; role + branch evidence per `decisions/0026`;
    `TC-ADAPT-STREAMING` fatal when a response is still generating; visible
    attachment metadata only, nothing downloaded), and the ClipSpec override
    seam — `resolveClipSpec`, `mergeEffectiveConfig` (defaults < ClipSpec <
    user toggles), `validateClipSpec` (`decisions/0018`).
  - `code/docusaurus-tabs` detector in `@technical-clipper/detectors`
    (`decisions/0027`): groups a Docusaurus `<Tabs>` widget into a
    `CodeGroupIR` retaining every alternative + label; a non-code tab is
    omitted with `TC-ADAPT-GROUP-NONCODE`.
  - `capture()` now takes the conversation path when a conversation adapter
    applies, and applies ClipSpec `articleRootSelector` / `dropSelectors` /
    `keepSelectors` / `suppressDetector` on the article path.
  - `decisions/0026` (ChatGPT branch/role evidence), `decisions/0027`
    (Docusaurus tabs as a detector).
  - 4 `fixtures/conversations/*` + 3 `fixtures/code/docusaurus-*` fixtures with
    goldens; `tests/pipeline-adapters.test.ts` (§ 12 gates 7, 8).

- Phase 5: `@technical-clipper/detectors` — the standard code / terminal
  detector set.
  - `code/pre-code`, `code/blocklevel-code`, `code/prism`, `code/highlightjs`
    (exact from a copy-source or token `textContent`; `approximate` +
    `TC-EXTRACT-RECONSTRUCT` for a line-number-table layout),
    `terminal/session` (explicit input/output markup → `exact`; prompt-span
    split → `approximate` + `TC-DETECT-TERMINAL-AMBIGUOUS`), and a
    virtualized-editor guard (`monaco`/`cm`/`ace` → `failed` +
    `TC-DETECT-VIRTUALIZED`).
  - Chrome stripping (line-number gutters, copy buttons, language pills),
    language inference (`decisions/0025`), filename / highlighted-line metadata,
    BOM + final-newline handling.
  - `standardDetectorRegistry()` is wired into `pipeline`'s `capture()` as the
    default; the detector/adapter seam contracts moved to
    `packages/core/src/seam.ts` (DOM-typed, implementation-free) so
    `detectors` depends only on `core`.
  - 13 `fixtures/code/*` fixtures with goldens; `tests/pipeline-code.test.ts`
    (§ 12 gates 6/7/10/11 — exact-text preservation, no chrome contamination,
    adversarial diagnostics).

- Phase 4: `@technical-clipper/pipeline` — the article capture path.
  - `capture(html | doc, …)` runs clone, detect + sentinel, noise removal,
    deterministic article-root selection, DOM→`ArticleIR`, restore, then
    assemble and validate the `DocumentIR` — inside a network trap
    (`decisions/0001`, `0009`).
  - `decisions/0022` (linkedom DOM implementation), `decisions/0023` (in-house
    Defuddle-inspired extractor + root-selection scoring), `decisions/0024`
    (Wikipedia infobox / page-furniture policy).
  - The `ComponentDetector` / `Adapter` seam interfaces + deterministic
    overlap resolution and the comment-node sentinel protocol (`decisions/0013`);
    detector/adapter registries are injectable (real detectors Phase 5,
    adapters Phase 6).
  - `scripts/capture-fixture.mjs` fixture runner; 8 `fixtures/articles/*`
    fixtures with provenance + golden `expected-ir.json` /
    `expected-diagnostics.json`; `tests/pipeline-article.test.ts` integration
    test (golden + determinism).

- Phase 3: `@technical-clipper/core` — the browser-independent foundation, all
  pure functions with ~70 deterministic unit tests.
  - Typed IR family (`decisions/0011`): `DocumentIR` discriminated on
    `captureKind`, `ArticleIR` / `ConversationIR` / `MessageIR`, one shared
    block/inline node set, `CodeBlockIR` / `CodeGroupIR` / `TerminalSessionIR`,
    and article sub-contracts.
  - Provenance / evidence / confidence semantics + legality predicates
    (`decisions/0012`).
  - Diagnostics registry (`TC-*` codes, default severities) and
    `deriveExportStatus` (`complete` / `complete_with_warnings` / `partial` /
    `failed`, the export gate) — `decisions/0015`.
  - Canonical JSON (`canonicalize` compact / `canonicalizePretty`),
    normalization rulesets `norm/prose@1` / `norm/code@1` / `norm/infostring@1`,
    content-addressable node ids, SHA-256 hashing with fixed boundaries, and
    safe Markdown fence selection — `decisions/0014`, `0016` (mirrors the
    Phase 2 skill verifier per `decisions/0021`).
  - `validateDocumentIR` — schema + cross-field checks (confidence/evidence
    legality, id uniqueness, approximate/failed-artifact diagnostic pairing,
    schema-version ceiling, conversation message order).

- Phase 2: `markdown-clipping` development-time Claude skill.
  - `.claude/skills/markdown-clipping/SKILL.md` with discovery frontmatter
    (loads for Markdown-rendering / capture-fixture / Obsidian-export /
    output-profile / fence-selection / clipping-fidelity tasks).
  - `references/commonmark.md`, `references/gfm.md`,
    `references/obsidian-markdown.md` — profile-separated derived notes
    (CommonMark 0.31.2, GFM 0.29-gfm, Obsidian Help retrieved 2026-09-03).
  - `references/clipping-antipatterns.md` — 17 catalogued clipping failures,
    each with wrong/right examples.
  - `references/source-register.md` — retrieval dates, spec versions, licences,
    and SHA-256 of each derived note.
  - `scripts/verify-examples.mjs` + `pnpm run skill:verify` — dependency-free
    offline checks of fence selection, code-span sizing, table/YAML escaping,
    the anti-pattern detectors, and the discovery description; wired into
    `pnpm run ci` and the CI workflow.
  - `discovery-check.md` — should/should-not-trigger prompt checklist.
  - `decisions/0021` — ADR: the verifier deliberately uses no Markdown parser.

- Phase 1: complete implementation plan through the MVP (planning only, no
  product code).
  - `planning/phase-2-*.md` … `planning/phase-10-*.md` — implementation-ready
    plans for every phase to the MVP release, each with the full field set
    from `AGENTS.md` § "Plan before implementation".
  - `planning/mvp-execution-plan.md` — resumable per-phase execution,
    verification, documentation, commit, and stop-on-blocker procedure.
  - `decisions/0011`–`0020` — cross-phase ADRs settling the typed IR family,
    provenance/confidence semantics, detector/adapter interfaces and
    precedence, stable node identifiers, the diagnostics model and
    export-status levels, canonical serialization/normalization/hashing and
    fence selection, the capture bundle contract, the ClipSpec override seam,
    Markdown output profiles, and the fixture corpus / release-gate map.
  - `planning/ROADMAP.md` — refined dependency order, per-phase plan links,
    cross-phase ADR index, and the cross-phase review findings.
  - `architecture/overview.md` — target section made precise against ADRs
    0011–0020; `evaluate` stage and `packages/pipeline` added.
  - `planning/CONTEXT.md` — updated to name Phase 2 as the next concrete
    action.

- Phase 0: repository scaffolding and governance.
  - Workspace tooling: pnpm workspaces, TypeScript project references,
    ESLint (flat config) + Prettier, Vitest, GitHub Actions CI.
  - Minimal compiling packages: `@technical-clipper/core`,
    `@technical-clipper/detectors`, `@technical-clipper/adapters`,
    `@technical-clipper/extension` (zero-permission Manifest V3 shell), each
    with a scaffold test that fails loudly instead of faking real behaviour.
  - Governance documents: `AGENTS.md` (canonical working contract),
    `CLAUDE.md` (compatibility entrypoint), `CONTRIBUTING.md`,
    `README.md`.
  - `architecture/overview.md` — current Phase 0 state plus target
    architecture.
  - `decisions/0001`–`0010` — initial ADRs for the fixed architectural
    constraints and the Phase 0 toolchain selection.
  - `docs/capture-format.md`, `docs/cli-or-extension-reference.md`,
    `docs/privacy-and-security.md` — stubs, clearly labelling
    not-yet-implemented behaviour.
  - `ai-docs/README.md`, `ai-docs/AGENTS.md` — product-capability and
    evidence-boundary orientation for agents.
  - `planning/v0-to-mvp-planning-prompt.md` — durable copy of the original
    planning brief.
  - `planning/ROADMAP.md`, `planning/CONTEXT.md` — phase table and
    resumption checkpoint.
  - `planning/phase-0-repo-scaffolding.md`,
    `planning/phase-1-plan-mvp.md` — phase plans.
  - `fixtures/` and `tests/` skeleton directories with READMEs, empty
    pending real fixtures/integration tests in later phases.

### Changed

- Phase 2: `.github/workflows/ci.yml` push trigger corrected from `main` to
  `master` (the repository's default branch) and extended with a
  `skill:verify` step; `pnpm run ci` now also runs `skill:verify`.
- Phase 2: `eslint.config.js` gains a Node-globals block for plain `.mjs` /
  `scripts/` tooling files.
- Phase 4: `tsconfig.json` references `packages/pipeline`; `.prettierignore`
  excludes `fixtures/` (byte-exact test data + generated goldens).
- Phase 4: `decisions/0013` interfaces are implemented in `packages/pipeline`
  (Phase 4), not `packages/core` (they are DOM-typed); the ADR's "Phase 3"
  note is superseded by this entry.
- Phase 5: the seam contracts (`decisions/0013`) moved from
  `packages/pipeline` to `packages/core/src/seam.ts` (still DOM-typed,
  implementation-free) so `detectors`/`adapters` depend only on `core` and
  `pipeline` can depend on `detectors` without a cycle. `tsconfig.json` +
  package deps updated accordingly.

<!--
  Version-comparison links will be added once a remote repository URL
  exists to link against — do not add a placeholder link.
-->
