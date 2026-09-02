# Technical Clipper: v0-to-MVP Planning Prompt

Copy the prompt below into a fresh coding-agent session opened at the root of
the new repository. The working product name is `technical-clipper`; replace it
before planning if a final name has been chosen.

---

## Prompt

You are the planning and implementation partner for `technical-clipper`, a
local-first browser extension for high-fidelity capture of code-heavy technical
pages and ChatGPT conversations into deterministic Markdown and structured
capture bundles.

Your first task is to design and scaffold the repository from Phase 0 through a
credible MVP. Follow the complete repository structure and working protocols in
this prompt. This prompt is the authoritative and self-contained contract. Do
not inspect or rely on access to another repository to understand the requested
process.

When this prompt is used inside the target repository, its exact Markdown source
must be retained at `planning/v0-to-mvp-planning-prompt.md` during Phase 0. If
that path already exists, compare it with the supplied prompt and do not create a
duplicate. Leave an identical copy unchanged; if it differs, report the diff and
update it only as an intentional planning-document change. The repository copy
is the durable source for the original project brief and must be committed with
the Phase 0 planning/scaffolding documentation when commits are authorized.

Where this prompt requires research into a living external specification, use
the official sources named here, record the retrieval date and version or page
revision when one is exposed, and save a concise derived reference rather than
copying whole documents. Repository governance, phase boundaries, and the
definition of done require no external research because they are fully stated
below.

### 1. Product thesis

The MVP must prove this claim:

> On ordinary articles, supported technical pages, and the currently selected
> branch of a ChatGPT conversation, the primary content and its structure are
> retained; every supported code block is preserved exactly; and uncertainty or
> incompleteness is reported before export.

This is not an AI summariser and not a general archival crawler. It is a
deterministic web document compiler with strong code awareness and Obsidian as
its first export target. Standard article capture—including Wikipedia-style
encyclopedia articles—is a first-class MVP capability, not merely fallback
behaviour surrounding technical code blocks.

### 2. Fixed architectural constraints

Treat the following as settled unless implementation evidence demonstrates a
contradiction. If that happens, stop and ask before changing the boundary.

1. **Local-first and offline-capable.** Ordinary capture requires no account,
   hosted API, telemetry service, or schema server.
2. **Deterministic authority path.** AI may later propose adapters or ClipSpec
   patches, but AI output must never directly alter a capture or production
   extraction behaviour. Only reviewed, versioned rules with passing fixtures
   may do that.
3. **Structured intermediate representation first.** Do not convert the page
   directly to Markdown. Capture into a typed document/conversation IR, validate
   it, and render outputs from that IR.
4. **Code is a source artifact.** Preserve exact text, indentation, blank lines,
   language, filename/caption where exposed, tab-group relationships, extraction
   method, confidence, and hashes.
5. **General extraction plus narrow adapters.** Use a general article extractor
   such as Defuddle for ordinary content. Use component detectors and adapters
   for exceptional structures; adapters describe what is unusual rather than
   reimplementing the whole page.
6. **Standard articles are a core path.** Semantic articles, including
   representative Wikipedia pages, must work through the general extraction
   pipeline. Do not begin with a Wikipedia-only scraper. Add a site adapter only
   if fixtures demonstrate a structure that cannot be handled generically.
7. **Pre-extract and protect code.** Detect code components in a cloned rendered
   DOM, extract them into IR, replace them with stable sentinels, run general
   content extraction, then restore the structured code nodes.
8. **Explicit failure.** Unsupported or partially accessible components produce
   diagnostics. Never silently present a partial block as exact.
9. **No network requests during extraction.** The page may already be loaded,
   but capture itself must not send page content elsewhere or depend on a remote
   service.
10. **Reproducible outputs.** Canonical JSON ordering, documented normalization,
   stable hashes, deterministic Markdown, deterministic ZIP entry ordering, and
   normalized ZIP metadata are required wherever byte-for-byte reproducibility
   is claimed.
11. **Browser/platform scope.** MVP targets a Chromium Manifest V3 extension.
    Firefox, Safari, mobile, and a native Obsidian companion plugin are deferred.
12. **ChatGPT scope.** Capture only the currently selected, fully loaded branch.
    Do not claim to capture hidden branches, deleted edits, internal reasoning,
    or content the UI does not expose.
13. **Security boundary.** Treat captured HTML and page metadata as untrusted.
    Do not execute captured code, inject unsanitized page HTML into extension
    pages, persist secrets, or request broader browser permissions than needed.

### 3. MVP user journey

The planned MVP must support this end-to-end flow:

1. A user opens an ordinary article such as Wikipedia, a supported technical
   article, or a ChatGPT conversation.
2. The extension runs **Clip page**.
3. A preview shows the extracted Markdown and a concise completeness report,
   including detected/exact/approximate/failed code counts and capture-scope
   warnings.
4. The user may:
   - copy Markdown;
   - hand the note to Obsidian using an explicitly documented mechanism; or
   - download a deterministic capture bundle.
5. A capture with unsupported content remains exportable only when the warning
   is visible and recorded in the bundle. Define which fatal errors disable
   export and which warnings merely degrade status.

### 4. Required MVP support

Plan for these supported inputs:

- Standard semantic articles, including representative Wikipedia articles and
  conventional reference, news, blog, and documentation pages.
- Article title, canonical URL, author/date when exposed, lead content, ordered
  heading hierarchy, paragraphs, lists, links, blockquotes, inline code,
  ordinary tables, figures, captions, image alt text and remote image
  references, footnotes, citations, and reference lists.
- Deterministic main-content selection that excludes navigation, edit controls,
  cookie banners, unrelated recommendations, repeated chrome, and footer noise
  without silently dropping article sections.
- Wikipedia-style content such as the lead, section hierarchy, infobox when it
  is part of the selected article content, tables, figures/captions, notes,
  citations, and references. Navigation boxes, edit links, and page controls
  should be excluded unless an explicit documented policy says otherwise.
- Standard `<pre><code>` blocks.
- Prism and Highlight.js code blocks.
- Docusaurus-style tabbed code examples, retaining every accessible alternative
  and its label.
- Non-standard block-level/preformatted `<code>` patterns.
- Explicitly marked terminal input/output where the DOM exposes the distinction.
- A dedicated ChatGPT adapter that preserves current-branch message order,
  user/assistant roles, rich text blocks, code blocks, tables, citations/links,
  and visible attachment metadata.

Preserve at minimum:

- article block order and heading hierarchy;
- visible link labels and resolved destinations;
- footnote/citation markers and their association with accessible reference
  entries;
- figure captions, image alt text, and original remote asset URLs;
- the selected article root, extraction method/version, and any content-removal
  diagnostics;
- exact code source and whether a final newline exists;
- code language and the evidence used to infer it;
- filename/caption and highlighted-line metadata when exposed;
- group membership and alternative labels;
- extraction adapter/method and its version;
- per-message and per-code-block SHA-256 hashes;
- document/IR/Markdown hashes;
- capture time, source URL, canonical URL, extractor version, capture scope, and
  diagnostics.

### 5. Explicit MVP non-goals

Keep these outside the MVP unless the user explicitly changes scope through a
new ADR:

- hosted schema registry or custom backend;
- AI extraction, AI summarisation, or automatic AI repair;
- user accounts, analytics, or telemetry;
- Monaco, CodeMirror, Jupyter notebooks, arbitrary virtualised editors;
- cross-origin iframe traversal;
- canvas, screenshot, or OCR code recovery;
- hidden ChatGPT branches or content unavailable to the rendered page;
- downloading authenticated attachments or generated-image assets;
- local image mirroring;
- WARC or complete archival capture;
- visual rule editor or programming-by-demonstration UI;
- automatic schema/adapter updates;
- a dedicated Obsidian plugin;
- Firefox, Safari, or mobile support.

### 6. Initial technical direction

Use a TypeScript workspace with browser-independent core packages and a thin
extension shell. Evaluate exact dependency choices during planning and record
non-obvious choices as ADRs. Prefer minimal dependencies and pure functions in
the deterministic path.

Begin from this conceptual layout; refine names if the phase plans justify it:

```text
technical-clipper/
├── .github/workflows/
├── .claude/skills/
│   └── markdown-clipping/
│       ├── SKILL.md
│       ├── references/
│       └── scripts/
├── ai-docs/
│   ├── README.md
│   └── AGENTS.md
├── architecture/
│   └── overview.md
├── decisions/
│   └── 0001-*.md
├── docs/
│   ├── capture-format.md
│   ├── cli-or-extension-reference.md
│   └── privacy-and-security.md
├── fixtures/
│   ├── html/
│   ├── expected-ir/
│   ├── expected-markdown/
│   └── provenance/
├── packages/
│   ├── core/
│   ├── detectors/
│   ├── adapters/
│   └── extension/
├── planning/
│   ├── CONTEXT.md
│   ├── ROADMAP.md
│   ├── mvp-execution-plan.md
│   ├── v0-to-mvp-planning-prompt.md
│   └── phase-N-*.md
├── tests/
├── AGENTS.md
├── CLAUDE.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── package.json
└── tsconfig.json
```

Use `AGENTS.md` as the canonical, tool-neutral working contract.
`CLAUDE.md` should be a small compatibility entrypoint that directs Claude Code
to `AGENTS.md` and states any Claude-specific integration behaviour without
duplicating the whole contract. Any material change to either agent-governance
file must be shown as a diff and explicitly approved before writing.

### 7. Required repository protocols

Use the following working disciplines exactly as written. No external process
reference is required.

#### Plan before implementation

Before production code for a phase is written, create
`planning/phase-N-<name>.md` containing:

- status: `not started`, `planned`, `in progress`, `blocked`, or `done`;
- goal and user-visible outcome;
- scope covered;
- explicit deferrals/non-goals;
- dependencies and assumptions;
- design decisions already settled;
- files to add/change, with one-line purposes;
- exact implementation sequence;
- test fixtures and edge cases;
- runnable verification commands and expected outcomes;
- documentation/ADR/changelog effects;
- stop-and-ask conditions;
- completion evidence to record.

Do not implement the phase until this plan exists and unresolved assumptions
that materially affect the design have been settled.

#### Roadmap and context

- `planning/ROADMAP.md` is the complete, at-a-glance phase table. Update it
  whenever phase status or scope changes.
- `planning/CONTEXT.md` is the single current resumption checkpoint, not a
  diary. At every natural stopping point overwrite its current-state section
  with the active phase/status, last completed work, unresolved decisions,
  exact verification state, working-tree state, and next concrete action.
- Git history and the changelog hold history; do not let `CONTEXT.md` grow as an
  append-only session log.

#### Documentation sync

Update affected documentation in the same commit as behaviour changes:

- `docs/` describes current user-visible behaviour and formats;
- `architecture/` describes the current implemented design, not aspirations;
- `decisions/` stores historical reasoning as append-only ADRs;
- `planning/ROADMAP.md` and `planning/CONTEXT.md` reflect delivery state;
- `CHANGELOG.md` records the phase under `[Unreleased]` using Keep a Changelog
  categories.

Do not describe a planned capability as implemented. Clearly label forward-
looking stubs.

#### ADR protocol

Use sequential `decisions/NNNN-short-title.md` records with:

- Status
- Context
- Decision
- Alternatives considered
- Consequences
- Supersedes/Superseded by, when applicable

Never rewrite an accepted ADR to conceal a reversal. Add a new ADR that
supersedes it.

#### Definition of done per phase

A phase is done only when all of the following are true:

1. scoped implementation is complete;
2. the phase plan's verification commands pass;
3. new negative and boundary cases are tested, not only the happy path;
4. changed core logic has been reviewed directly in addition to running tests;
5. user docs and living architecture are current where applicable;
6. ADRs exist for non-obvious decisions;
7. `CHANGELOG.md` has a phase-specific `[Unreleased]` entry;
8. `planning/ROADMAP.md` marks the phase `done`;
9. `planning/CONTEXT.md` records the verified state and next step;
10. no unplanned file changes or accidental scope expansion remain.

#### Commit and release protocol

- One logical phase/change per commit.
- Commit message: `type(phase-N): concise summary`.
- Do not add AI co-author or attribution trailers.
- Do not batch later phases into the current phase because they appear easy.
- The MVP is one milestone, not one release per phase.
- Promote `[Unreleased]` to a dated release section and create the MVP tag only
  after the final release gate passes and the user explicitly approves release.
- Prefer normal additive commits and `git revert`; do not rewrite shared history.

#### Verification protocol

- Unit tests use saved local fixtures and never require live websites.
- Integration tests may run the built extension against locally served fixtures.
- Tests must not call a live AI API.
- Network-dependent smoke tests, if any, must be clearly marked and excluded from
  the deterministic default suite.
- Run formatting, linting, type checking, unit tests, integration tests, bundle
  build, and extension-manifest validation as applicable.
- Independently inspect the changed core logic and changed-file list after green
  tests; tests alone are not proof of correct scope.
- Every bug discovered during implementation receives a regression fixture or
  test where practical.

### 8. Dedicated post-scaffold planning phase

Phase 0 and MVP planning are deliberately separate. Phase 0 creates the
buildable repository skeleton, governance documents, an outline roadmap, and
the plan for Phase 1. It must not attempt to make every later implementation
decision while the repository foundations are still being established.

**Phase 1 is a planning-only phase.** After Phase 0 is verified and committed,
Phase 1 must flesh out the complete path to MVP and save it under `planning/`
before any product capability is implemented. Phase 1 produces:

- `planning/phase-2-markdown-clipping-skill.md`;
- one complete `planning/phase-N-*.md` file for every subsequent phase through
  the MVP release phase;
- a refined `planning/ROADMAP.md` with final dependency order, milestone scope,
  status, and links to every plan;
- `planning/mvp-execution-plan.md`, describing how phases will be implemented,
  independently verified, documented, committed, resumed, and stopped when an
  assumption is unresolved;
- any new ADRs needed to settle cross-phase architecture decisions;
- updates to the target-design portion of `architecture/overview.md` where
  planning has made it more precise; and
- an updated `planning/CONTEXT.md` naming Phase 2 as the next concrete action.

Every Phase 2-to-MVP plan must contain all fields required by **Plan before
implementation**, including exact files, edge cases, offline fixtures, runnable
verification, documentation effects, stop-and-ask conditions, and completion
evidence. Review the plans together for missing dependencies, circular ordering,
oversized phases, contradictions, work assigned before its contracts exist, and
release criteria that cannot be measured.

Phase 1 may create or modify planning, architecture, decision, changelog, and
other governance documentation. It must not create feature implementations,
install feature dependencies, or begin Phase 2 because the planning work appears
straightforward. After the plans are saved and verified, implementation proceeds
strictly in roadmap order, one phase at a time. Later scope discoveries update
the affected plan and roadmap transparently; they do not justify skipping the
plan.

Phase 1 is done only when:

1. every Phase 2-to-MVP plan exists and is implementation-ready;
2. every roadmap row links to its plan and has the correct status;
3. cross-phase contracts, dependencies, and deferrals are consistent;
4. all material decisions are settled or explicitly marked as blockers;
5. `planning/mvp-execution-plan.md` provides a resumable execution procedure;
6. documentation and ADR effects are recorded;
7. `CHANGELOG.md`, `planning/ROADMAP.md`, and `planning/CONTEXT.md` reflect the
   completed planning phase; and
8. direct review confirms that no product implementation leaked into Phase 1.

If authorized to commit, Phase 1 should land as one documentation-only logical
change such as `docs(phase-1): plan implementation through MVP`. Stop after that
commit and request review before Phase 2 begins.

### 9. Early Claude skill: Markdown and clipping rules

Phase 2 must create a project skill at
`.claude/skills/markdown-clipping/SKILL.md` before the IR or renderer is
implemented. The skill is development-time guidance for Claude and other
compatible agents; it is not shipped in the browser extension and must not
become a hidden runtime dependency.

Build the skill from the current official documentation available when Phase 2
runs. Use these authoritative starting points, following official redirects:

- CommonMark current specification: <https://spec.commonmark.org/current/>
- GitHub Flavored Markdown specification: <https://github.github.com/gfm/>
- Obsidian basic formatting syntax: <https://help.obsidian.md/syntax>
- Obsidian advanced formatting syntax: <https://help.obsidian.md/advanced-syntax>
- Obsidian properties: <https://help.obsidian.md/properties>
- Obsidian internal links: <https://help.obsidian.md/links>
- Obsidian embeds: <https://help.obsidian.md/embeds>
- Obsidian callouts: <https://help.obsidian.md/callouts>
- Claude Code skills documentation: <https://docs.anthropic.com/en/docs/claude-code/skills>

Prefer these primary sources over blogs, snippets, or model memory. Record the
retrieval date, exposed spec/version, canonical URL, relevant sections, and a
hash of every locally retained derived reference in
`.claude/skills/markdown-clipping/references/source-register.md`. Do not copy an
entire external specification into the repository. Write concise, attributed,
derived reference notes and include small conformance examples only where they
are needed to remove ambiguity.

The skill must explicitly distinguish three output profiles:

1. **CommonMark** — portable baseline syntax only.
2. **GFM** — CommonMark plus supported GitHub extensions such as tables,
   strikethrough, task-list items, and autolinks.
3. **Obsidian Markdown** — the selected CommonMark/GFM-compatible baseline plus
   documented Obsidian additions such as wikilinks, embeds, callouts,
   properties, comments, highlights, block references, and Obsidian-specific
   image sizing where applicable.

The extension's renderer must always select an explicit output profile. The
skill must never imply that CommonMark, GFM, and Obsidian Markdown are identical
or that an Obsidian extension is portable Markdown.

The Phase 2 skill directory should contain at minimum:

```text
.claude/skills/markdown-clipping/
├── SKILL.md
├── references/
│   ├── source-register.md
│   ├── commonmark.md
│   ├── gfm.md
│   ├── obsidian-markdown.md
│   └── clipping-antipatterns.md
└── scripts/
    └── verify-examples.mjs
```

`SKILL.md` must have valid current Claude Code skill frontmatter with a focused
name and a description that causes it to load when an agent designs, implements,
tests, or reviews Markdown rendering, capture fixtures, Obsidian export, or
clipping fidelity. Keep the main skill concise and route detailed syntax into
the reference files. Do not grant broad tools or automatic side effects.

The references and verification examples must cover at least:

- block versus inline structure, blank-line semantics, soft/hard breaks, nested
  lists, blockquotes, headings, links, images, entities, raw HTML, tables,
  footnotes, and task lists;
- code spans containing backticks and fenced code containing backticks or
  tildes;
- the rule that the chosen outer fence must be longer than every matching fence
  run inside the code, or use the other valid fence character when appropriate;
- language info-string normalization without rewriting source code;
- YAML properties with unique keys, supported atomic/list value types, safe
  quoting, quoted wikilinks, and no Markdown formatting assumed inside property
  values;
- wikilinks versus Markdown links, headings/block references, embeds, callout
  blockquote prefixes, nested/foldable callouts, comments, and highlights;
- escaping pipes in tables, delimiters in links, and punctuation that could
  accidentally start lists, headings, blockquotes, or thematic breaks;
- preservation of exact code bytes separately from Markdown container syntax;
- deterministic newline and whitespace policies for prose versus code.

The anti-pattern catalogue must explain and test against at least these clipping
failures:

- blindly wrapping every block in triple backticks;
- backslash-escaping or entity-encoding characters inside fenced code;
- treating block-level code as inline code;
- copying line numbers, copy buttons, prompts, or syntax-token links into source;
- losing final newlines, indentation, blank lines, or code-tab labels;
- flattening tab alternatives, request/response pairs, or terminal input/output
  into unlabeled consecutive blocks;
- emitting raw or page-supplied HTML into the extension preview without
  sanitization;
- using Obsidian-only syntax in the CommonMark or GFM profile;
- generating duplicate, nested, multiline, or Markdown-rich properties that
  Obsidian does not support as intended;
- leaving YAML-sensitive values unquoted or serializing timestamps/booleans in a
  way that changes their intended type;
- confusing source-page links with vault-internal wikilinks;
- producing malformed tables when cells contain pipes or line breaks;
- breaking nested lists, blockquotes, or callouts by dropping required prefixes
  or indentation;
- turning visual styling into unsupported semantics without recording that the
  interpretation was inferred;
- normalizing prose and code with the same whitespace rules;
- claiming a rendered preview proves byte fidelity instead of asserting the
  source string and hash;
- silently discarding unsupported nodes instead of producing diagnostics.

`verify-examples.mjs` must provide deterministic, offline checks for the skill's
normative examples and anti-examples. It may use a pinned Markdown parser if the
phase plan and ADR explain why, but it must not treat a single parser's behaviour
as the specification. Where possible, run official CommonMark examples or a
small selected conformance corpus and add Obsidian-targeted golden fixtures.

Phase 2 is done only when the skill can be explicitly invoked, its discovery
description is tested with representative prompts, its reference sources are
registered, all example checks pass offline, and a deliberate review confirms
that advice labelled CommonMark, GFM, or Obsidian is in the correct profile.

### 10. Required core contracts to settle during planning

The phase plans must define typed contracts for at least:

- `DocumentIR`, `ArticleIR`, `ConversationIR`, `MessageIR`, and ordered block
  nodes;
- article headings/sections, links, figures/captions, tables, footnotes,
  citations, and reference entries;
- `CodeBlockIR`, `CodeGroupIR`, and `TerminalSessionIR`;
- provenance/evidence and confidence (`exact`, `normalized`, `approximate`,
  `failed`), with precise semantics;
- `ComponentDetector` and site/conversation `Adapter` interfaces;
- deterministic detector precedence and overlap resolution;
- stable block/message identifiers that do not rely on generated CSS classes;
- diagnostics with severity, code, source location, human message, and whether
  export is blocked;
- canonical serialization and normalization policies;
- raw-versus-normalized hashing boundaries;
- safe Markdown fence selection for code containing backticks or tildes;
- capture manifest versioning and forward compatibility;
- capture/source kinds such as `article`, `technical_article`, and
  `conversation`, without forcing unrelated content into one schema shape;
- adapter versioning and the minimum ClipSpec override seam, even though a full
  schema editor/distribution system is deferred;
- export status: `complete`, `complete_with_warnings`, `partial`, `failed`.

Where “exact” is claimed, specify exact relative to which observable browser
source. For example, exact `textContent` from an exposed copy-source node is not
the same evidential claim as exact original HTTP response bytes.

### 11. Capture bundle contract

Plan an MVP bundle with this minimum logical content:

```text
capture-name/
├── content.md
├── document.json
├── manifest.json
├── diagnostics.json
└── raw/
    └── page.html
```

The planning work must decide and document:

- whether raw HTML is always included or is user-selectable;
- sanitization and privacy implications, especially for ChatGPT;
- canonical JSON encoding and newline rules;
- stable ZIP ordering/timestamps/permissions;
- which bytes each SHA-256 covers;
- format and adapter version fields;
- content-addressable block identities, if used;
- how remote assets and inaccessible attachments are represented;
- how incomplete page loading is detected and reported;
- whether two captures of identical content at different times are expected to
  have identical whole-bundle bytes or only identical content hashes.

Do not promise whole-bundle byte identity while embedding a changing capture
timestamp unless the format separates content identity from event metadata.

### 12. Fixture and quality strategy

The MVP fixture corpus must include both a standard-article corpus and at least
50 individual code blocks.

The article corpus must contain at least 20 locally saved fixtures across:

- at least five revision-pinned Wikipedia articles representing prose, section
  nesting, citations/references, infoboxes, tables, figures, and lists;
- at least five ordinary semantic articles from documentation, reference, blog,
  or news-style layouts;
- articles with footnotes, repeated headings, fragment links, captions, nested
  lists, and wide or irregular tables;
- deliberately noisy pages containing navigation, cookie UI, related-content
  panels, edit controls, and footers;
- deliberately incomplete, malformed, or ambiguous article roots that must
  produce diagnostics rather than a false `complete` status.

The code corpus must distribute at least 50 individual blocks across:

- standard semantic HTML;
- Prism/Highlight.js;
- Docusaurus tabs;
- unusual block-level `<code>`;
- terminal input/output;
- ChatGPT conversation messages;
- deliberately unsupported, ambiguous, incomplete, or adversarial examples.

Each fixture family should have source HTML, expected IR, expected Markdown,
expected diagnostics, and provenance describing whether it is synthetic,
minimized from a real page, or retained under an appropriate licence/permission.
For Wikipedia-derived fixtures, record the exact revision URL, revision ID,
retrieval date, licence, and required attribution. Do not make default tests
depend on mutable live pages.

Required MVP release gates:

- supported standard articles retain every expected article-body block in source
  order after documented normalization;
- article heading hierarchy, links, lists, tables, figures/captions,
  footnotes/citations, and references match their expected IR fixtures;
- navigation, edit controls, cookie banners, repeated site chrome, unrelated
  recommendations, and footers do not enter expected article output;
- all Wikipedia release fixtures pass through the generic article path; a
  Wikipedia-specific adapter is not required for the baseline corpus;
- article captures that lose an expected section, citation target, or referenced
  figure cannot report `complete`;
- 100% exact-text preservation for all supported code fixtures;
- 100% retention of accessible alternatives in supported code groups;
- correct role and order for all ChatGPT message fixtures;
- deterministic IR and Markdown for identical normalized input;
- no line-number or copy-button contamination;
- unsupported/partial components always produce the expected diagnostic;
- no network requests during capture tests;
- no executable captured content or unsafe HTML in the extension preview;
- valid Manifest V3 build with least-privilege permissions;
- representative page capture and preview completes within two seconds on a
  documented reference machine or test environment;
- exported Markdown renders acceptably in a test Obsidian vault;
- side-by-side benchmark documents where this MVP preserves a supported case
  that the current general-purpose clipping path corrupts, flattens, or omits.

Do not call screenshot snapshots proof of source-code fidelity. Assert code
strings and hashes directly.

### 13. Required roadmap shape

Create a dependency-ordered MVP roadmap. Aim for roughly eleven phases, numbered
from 0, unless dependency analysis justifies a different count. Use this as the
starting hypothesis rather than blindly copying it:

| Phase | Working name | Intended outcome |
|---:|---|---|
| 0 | Repository scaffolding and governance | Buildable empty workspace, process docs, architecture baseline, initial ADRs |
| 1 | Plan implementation through MVP | Complete Phase 2-to-MVP plan files, dependency review, execution procedure, ADRs, and resumable context; no product code |
| 2 | Markdown-clipping Claude skill | Current CommonMark/GFM/Obsidian references, output profiles, anti-patterns, offline examples |
| 3 | Core IR, provenance, normalization, and hashing | Browser-independent typed contracts with deterministic unit tests |
| 4 | DOM capture and standard article extraction | Cloned-DOM pipeline, deterministic article-root selection, Wikipedia/semantic-article support, sentinels, adapter/detector precedence |
| 5 | Standard code extraction | `<pre><code>`, Prism, Highlight.js, block-level code, terminal structures |
| 6 | Structured adapters | Docusaurus groups and ChatGPT current-branch conversation adapter |
| 7 | Deterministic rendering and capture bundle | Profile-aware Markdown, canonical JSON, hashes, diagnostics files, reproducible ZIP policy |
| 8 | Validation and completeness diagnostics | Fatal/warning policy and cross-stage fidelity assertions |
| 9 | Chromium extension and Obsidian handoff | Capture action, preview, copy, Obsidian export, bundle download |
| 10 | Article/code corpus, comparative evaluation, security review, and MVP release | Wikipedia and ordinary-article gates, code-fidelity gates, documentation, packaged extension, explicit approval to tag |

Check the dependency order carefully. If a usable vertical slice or risk-first
prototype should move earlier, explain the change in `planning/ROADMAP.md` and
the relevant ADR. Each phase must end in something independently testable; avoid
large phases that only become verifiable several phases later.

### 14. Phase 0 deliverables

For the initial planning/scaffolding pass, create or propose all of the following:

- MIT `LICENSE`, authored by Cormac O' Sullivan, with the current year;
- `.gitignore`, `.editorconfig`, Node version declaration, workspace
  `package.json`, TypeScript configuration, formatter/linter/test runner setup;
- minimal package directories that compile but do not pretend features exist;
- `README.md`, clearly labelling current status and implemented versus planned;
- `CONTRIBUTING.md`;
- protected `AGENTS.md` and compatibility `CLAUDE.md` diffs for explicit user
  approval before writing;
- `CHANGELOG.md` using Keep a Changelog and Semantic Versioning;
- `architecture/overview.md` containing current Phase 0 state plus clearly
  marked target architecture;
- initial accepted/proposed ADRs for fixed decisions in this prompt;
- `docs/` stubs for capture format, extension use/export, and privacy/security;
- `ai-docs/README.md` and `ai-docs/AGENTS.md` explaining product capabilities,
  evidence boundaries, and how an agent should orient itself;
- `planning/ROADMAP.md` with the full MVP phase outline and
  `planning/CONTEXT.md` with the current resumption state;
- `planning/v0-to-mvp-planning-prompt.md`, containing this exact prompt unless
  an identical repository copy already exists;
- complete `planning/phase-0-repo-scaffolding.md` and
  `planning/phase-1-plan-mvp.md` files;
- placeholders or roadmap rows for Phases 2 through MVP, while explicitly
  deferring their implementation-ready plan files and
  `planning/mvp-execution-plan.md` to Phase 1;
- a test skeleton that cannot report a misleading green result when no real
  behaviour exists;
- CI planned at the first phase where it can run meaningful checks. If CI is
  scaffolded in Phase 0, it must verify real repository invariants rather than
  `assert true` placeholders.

### 15. Planning-session procedure

Perform this work in order:

1. Inspect the current repository. Do not overwrite unrelated existing work and
   do not inspect another repository for process guidance; this prompt already
   contains the full process. Check whether
   `planning/v0-to-mvp-planning-prompt.md` already contains this prompt.
2. Report the repository's current state and confirm that this prompt is the
   planning/governance authority.
3. Identify only genuinely blocking product decisions. Prefer documented,
   reversible defaults over asking cosmetic or low-impact questions.
4. Produce a short decision table with: decision, recommended default,
   alternatives, and MVP impact.
5. Draft the full roadmap outline and dependency rationale, clearly marking
   Phases 2 through MVP as awaiting detailed planning in Phase 1.
6. Draft only the Phase 0 scaffolding plan and the implementation-ready Phase 1
   planning plan. Do not draft the detailed Phase 2-to-MVP plans yet; producing
   those plans together is Phase 1's purpose.
7. Draft initial ADRs and the living architecture baseline.
8. Draft `AGENTS.md` and `CLAUDE.md`, show their exact diffs, and wait for
   explicit approval before writing them.
9. After approval, create Phase 0 scaffolding only. Ensure this exact prompt is
   saved as `planning/v0-to-mvp-planning-prompt.md` if it is not already there.
   Do not execute Phase 1, write the detailed Phase 2-to-MVP plans, or implement
   product behaviour during the Phase 0 pass.
10. Run Phase 0 verification; inspect the file list and diffs directly.
11. Update `CHANGELOG.md`, `planning/ROADMAP.md`, and
    `planning/CONTEXT.md` with the verified Phase 0 result.
12. If authorized to commit, make logical Phase 0 commit(s) using the repository
    commit convention. Do not push, publish, create a release, or tag without
    explicit authorization.
13. Stop with the exact next action: review and begin Phase 1.

If this is being run only to generate a planning package rather than mutate a
repository, output the proposed file tree, governance/architecture/ADR drafts,
the roadmap outline, and the complete Phase 0 and Phase 1 plans as a
downloadable archive. Do not pre-empt Phase 1 by generating the detailed Phase
2-to-MVP plans, and do not claim that Phase 0 was executed.

### 16. Stop-and-ask conditions

Pause rather than guess when:

- existing repository content conflicts with this prompt;
- the final product/package name is required for a public identifier and no safe
  placeholder can be used;
- a dependency licence or fixture provenance is unclear;
- a requested browser permission would expose more data than the current user
  action requires;
- the selected Obsidian handoff cannot reliably handle the planned content size;
- ChatGPT DOM access cannot establish message completeness or roles from stable
  evidence;
- a normalization would change code bytes while still being labelled `exact`;
- a phase requires expanding an explicit non-goal;
- tests pass but direct review reveals an untested or contradictory path;
- publishing, pushing, signing, tagging, or store submission is the next step.

### 17. Final planning response

Lead with the outcome. Include:

- the proposed MVP boundary in one paragraph;
- the phase table with dependencies and release gates;
- important decisions requiring approval, if any;
- Phase 0 verification results or, for planning-only mode, a clear statement
  that no implementation was performed;
- files created/proposed;
- the exact next action.

Do not flood the response with copied file contents when files are available for
review. Link to the planning package and call out only material decisions and
risks.

---

## Expected result

The result of running this prompt should be a repository that can survive a new
human or AI session without relying on conversational memory, while preserving
these practices:

- plans precede code;
- the roadmap shows all work;
- one context file provides exact resumption state;
- architecture describes the present;
- ADRs preserve the historical why;
- documentation, changelog, and code move together;
- verification is executable and independently reviewed;
- milestones are released only after explicit gates and approval.
