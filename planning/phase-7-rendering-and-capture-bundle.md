# Phase 7 — Deterministic rendering and capture bundle

## Status

done

## Completion evidence

- **`packages/core/src/render/`:** `profiles.ts` (capability matrix),
  `frontmatter.ts` (obsidian YAML), `markdown.ts` (`renderMarkdown` — the
  single IR walker, three profile configs, degrade table, `selectFence` +
  render-back, code groups, terminals, tables, figures, footnotes,
  references), `index.ts`.
- **`packages/core/src/bundle/`:** `zip.ts` (hand-rolled STORE-only
  deterministic ZIP + table CRC-32), `assemble.ts` (`assembleBundle`,
  `manifest.json` identity/event split, canonical JSON writers, raw-HTML
  inclusion policy), `index.ts`.
- **ADRs:** `decisions/0028` (HTML → fenced text, no sanitizer in core),
  `0029` (STORE-only ZIP), `0030` (profile-degrade table).
- **Fixtures:** every `articles/*` / `code/*` / `conversations/*` fixture now
  has `expected.md` (obsidian), `expected.gfm.md`, `expected.commonmark.md`,
  and `expected-hashes.json`; `scripts/capture-fixture.mjs` renders all three
  profiles + asserts bundle ZIP byte-stability; `tests/pipeline-*.test.ts`
  drive it via `--all` / `--code` / `--conversations`.
- **Tests:** `packages/core/src/render/markdown.test.ts` (8 — profiles,
  render-back, table degrade, pipe escape, code group, HTML-as-fenced-text,
  determinism); `packages/core/src/bundle/bundle.test.ts` (6 — ZIP
  determinism + ordering, known CRC-32, five core files, content-vs-event
  identity, raw-HTML policy). `pnpm run ci` green: 17 test files / 131 tests.
- **Docs:** `docs/capture-format.md` stub replaced with the implemented
  contract; `architecture/overview.md` updated.
- **Deferred as planned:** `raw/page.html` production + sanitization is wired
  in Phase 9 (the pipeline has the DOM; `assembleBundle` already takes the
  `rawPageHtml` option and applies the kind-defaulted inclusion policy).
  DEFLATE compression deferred (`decisions/0029`).
- **Commit:** see `planning/CONTEXT.md`.

The scope and plan below are the original Phase 1 statement, retained for
context.

## Goal and user-visible outcome

From a validated `DocumentIR`, produce the four rendered artifacts and package
them: profile-aware Markdown (`content.md`), canonical `document.json`,
`diagnostics.json`, a `manifest.json` separating content identity from event
metadata, optional sanitized `raw/page.html`, and a byte-deterministic ZIP.
Two captures of identical page content produce identical content hashes (and
identical `content.md` / `document.json`), differing only in the manifest
timestamp — exactly `decisions/0017`. Verified by renderer golden fixtures and
bundle determinism tests; no UI.

## Scope covered

- IR → Markdown renderer, one code path with three profile configs
  (`commonmark`, `gfm`, `obsidian`) per `decisions/0019`:
  - block + inline walkers; deterministic output; `norm/prose@1` already
    applied in IR, so the renderer only does container syntax.
  - `selectFence` (`decisions/0016`) for every `codeBlock`; **render-back
    verification** (re-parse each emitted fence, assert byte-equality with
    `CodeBlockIR.text`) → fatal `TC-RENDER-CODE-MISMATCH` on failure.
  - `codeGroup` → labelled consecutive fenced blocks (gfm/obsidian) or a
    documented degrade (commonmark); tab labels never lost.
  - `terminalSession` → input/output rendered as distinct labelled fenced
    blocks, never flattened.
  - tables/strikethrough/task-lists degrade deterministically in `commonmark`
    with an `info` diagnostic.
  - `htmlBlock` / `rawInlineHtml` → sanitized (allowlist) before emission.
  - `obsidian` frontmatter from `SourceMetadata` + export status
    (`decisions/0019` key list); YAML safe-quoted, typed, unique keys.
  - source links always normal Markdown links with absolute hrefs (never
    wikilinks).
- Canonical JSON writers for `document.json` / `manifest.json` /
  `diagnostics.json` (`decisions/0016` pretty form, LF, one trailing LF).
- `HashSet` assembly: per-code-block, per-message, `documentContentIdentity`,
  `markdown`, `rawPageHtml`.
- `raw/page.html`: captured pre-sentinel in Phase 4's clone step, sanitized
  here (`<script>`/`on*`/non-selected-branch strip), `raw/README.txt`
  generated; inclusion default by `captureKind` + user toggle
  (`decisions/0017`).
- Deterministic ZIP writer: fixed entry order, DOS-epoch timestamps, `0644`,
  fixed compression policy, no extra fields (`decisions/0017`).
- `assembleBundle(doc, options): Uint8Array` + a `scripts/build-bundle.mjs`
  debug runner.

## Explicit deferrals / non-goals

- Completeness assertions that flip status to `partial` (Phase 8) — this phase
  consumes whatever status the IR already carries.
- Extension UI, preview, Obsidian handoff mechanism (Phase 9) — the renderer
  is called by the extension later; this phase only produces artifacts.
- Image downloading / local mirroring (non-goal) — images are absolute-URL
  links.
- WARC / full archival (non-goal) — `raw/page.html` is a single sanitized
  snapshot only.

## Dependencies and assumptions

- Depends on Phases 3 (canonical/hash/fence/status), 4 (raw clone, IR
  assembly), 5 (`CodeBlockIR`), 6 (`CodeGroupIR`, `ConversationIR`).
- Depends on Phase 2 skill references as the normative check for profile
  syntax (golden fixtures validated against them).
- Assumes a sanitizer library (DOMPurify or equivalent) is acceptable for the
  raw-HTML/preview path — pinned, ADR in this phase; it runs on serialized
  HTML strings, off the deterministic core.
- Assumes either a hand-rolled minimal ZIP writer or a pinned library whose
  output byte-stability is asserted by a fixture — decided in this phase's ADR.

## Design decisions already settled

`decisions/0016` (canonical JSON, hashing boundaries, fence, render-back),
`0017` (bundle layout, manifest split, ZIP determinism, raw-HTML policy,
`PageLoadState`), `0019` (profiles, degrade rule, links, frontmatter keys),
`0006` (reproducible-output policy). New this phase: sanitizer choice; ZIP
writer choice; the `commonmark` degrade table detail (ADR).

## Files to add/change

| Path                                                                 | Purpose                                                                         |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `packages/core/src/render/markdown/walk.ts`                          | IR → Markdown block/inline walker                                               |
| `packages/core/src/render/markdown/profiles.ts`                      | three profile configs + degrade table                                           |
| `packages/core/src/render/markdown/frontmatter.ts`                   | obsidian YAML frontmatter                                                       |
| `packages/core/src/render/render-back.ts`                            | fence re-parse verification                                                     |
| `packages/core/src/render/json.ts`                                   | canonical JSON file writers                                                     |
| `packages/core/src/render/sanitize.ts`                               | HTML allowlist sanitizer wrapper                                                |
| `packages/core/src/bundle/manifest.ts`                               | `manifest.json` builder (identity/event split)                                  |
| `packages/core/src/bundle/zip.ts`                                    | deterministic ZIP writer                                                        |
| `packages/core/src/bundle/assemble.ts`                               | `assembleBundle()`                                                              |
| `scripts/build-bundle.mjs`                                           | debug bundle runner                                                             |
| `fixtures/**/expected.md`                                            | fill/verify golden Markdown for existing fixtures (all 3 profiles for a subset) |
| `fixtures/**/expected-hashes.json`                                   | expected hash sets                                                              |
| `fixtures/bundles/`                                                  | expected bundle manifests + determinism baselines                               |
| `tests/render-*.test.ts`, `tests/bundle-*.test.ts`                   | golden + determinism tests                                                      |
| `decisions/00NN-sanitizer-choice.md`, `decisions/00NN-zip-writer.md` | ADRs                                                                            |
| `decisions/00NN-commonmark-degrade-table.md`                         | degrade rules                                                                   |
| `docs/capture-format.md`                                             | **replace stub** with the real contract, link `0017`                            |
| `docs/privacy-and-security.md`                                       | raw-HTML + sanitization policy                                                  |
| `architecture/overview.md`                                           | steps 8–9 → current                                                             |
| `CHANGELOG.md`                                                       | Phase 7 entry                                                                   |

## Implementation sequence

1. `render/markdown/walk.ts` + `profiles.ts` for `gfm` first; golden fixtures
   for articles from Phase 4.
2. `selectFence` integration + `render-back.ts`; fixtures with backtick/tilde
   runs; assert `TC-RENDER-CODE-MISMATCH` cannot occur for supported code and
   is fatal when forced.
3. `commonmark` profile + degrade table + ADR; `info` diagnostics on degrade.
4. `obsidian` profile + `frontmatter.ts`; YAML edge cases (timestamps,
   booleans-as-strings, `@`/`:` leading chars, list values, wikilink-in-value
   quoting).
5. `codeGroup` / `terminalSession` rendering; labels/streams never flattened
   (`decisions/0020` gate 7, § 9 anti-patterns).
6. `sanitize.ts` + ADR; preview-safety fixtures (`<script>`, `on*`,
   `javascript:` → stripped).
7. `render/json.ts` canonical writers; `bundle/manifest.ts` identity/event
   split; hash assembly wired to Phase 3.
8. `bundle/zip.ts` + ADR; determinism test: build the same bundle twice →
   identical bytes except `manifest.json`; build with a different timestamp →
   identical everything except `manifest.json`.
9. `assembleBundle()` + `build-bundle.mjs`; raw-HTML inclusion defaults +
   toggle + `raw/README.txt`.
10. Replace `docs/capture-format.md` stub; update
    `docs/privacy-and-security.md`, `architecture/overview.md`, `CHANGELOG.md`.
11. Direct review: `walk.ts` inline escaping, `zip.ts` byte layout,
    `manifest.ts` identity/event separation.
12. `pnpm run ci`.
13. If authorized, commit `feat(phase-7): deterministic rendering and capture
bundle`.

## Test fixtures and edge cases

- Article rendered in all three profiles → three golden `.md` files; the
  `commonmark` one has no tables/task-lists/frontmatter and carries the
  degrade diagnostics.
- Code block containing ` ` ```` (4 backticks) and `~~~~` → fence is 5
  backticks; render-back byte-matches.
- Code block with no final newline as the last block → closing fence still
  ends with LF; `hasFinalNewline:false` preserved inside.
- `codeGroup` with 3 members → 3 labelled fenced blocks in member order.
- `terminalSession` → `input` / `output` labelled blocks, order kept.
- Obsidian frontmatter: `published: "2019-05-01"` stays a quoted string;
  `tags: [a, b]` a list; a title containing `:` safely quoted.
- Table with a cell containing `|` and a cell containing a soft break → valid
  GFM table (escaped pipe, `<br>` or space per the Phase 2 rule).
- `htmlBlock` with `<script>alert(1)</script>` → removed; `info`/`warning`
  diagnostic; never in `content.md` or preview.
- Bundle determinism: same IR twice → identical ZIP bytes except manifest;
  content hashes identical.
- `conversation` capture → `rawHtmlIncluded` defaults `false`; toggling `true`
  produces a sanitized `raw/page.html` with non-selected branches stripped
  (assert count in `raw/README.txt`).

## Runnable verification and expected outcomes

```sh
pnpm run ci
pnpm test -- tests/render-markdown.test.ts tests/bundle-determinism.test.ts
   # expect: every golden .md matches byte-for-byte per profile;
   #         render-back verification passes for all supported code;
   #         two bundle builds of identical content -> identical bytes except
   #         manifest.json; documentContentIdentity identical across timestamps
node scripts/build-bundle.mjs fixtures/articles/wikipedia-<slug> --profile obsidian
   # expect: writes a 5-entry (or 6 with raw/) deterministic ZIP; prints hash set
```

## Documentation / ADR / changelog effects

- 3 new ADRs (sanitizer, ZIP writer, commonmark degrade table).
- `docs/capture-format.md` stub **replaced** with the implemented contract.
- `docs/privacy-and-security.md` raw-HTML/sanitization policy added.
- `architecture/overview.md` steps 8–9 → current.
- `CHANGELOG.md` Phase 7; `ROADMAP.md` Phase 7 → `done`; `CONTEXT.md` →
  Phase 8.

## Stop-and-ask conditions specific to this phase

- Exact code bytes cannot be represented inside a fenced block for some real
  input despite `decisions/0016` (would force escaping — forbidden).
- The chosen ZIP library's output is not byte-stable and cannot be pinned.
- Whole-bundle byte identity is implicitly promised anywhere in docs/tests
  while the manifest embeds a timestamp (§ 16).
- A profile degrade would silently emit a higher-profile construct.
- Obsidian handoff content size looks unreliable for large captures (surfaces
  here or in Phase 9 — § 16).

## Completion evidence to record

- Golden `.md` coverage (which fixtures, which profiles).
- Bundle determinism test output (identical-except-manifest proof).
- Hash-set vectors for a reference capture.
- Render-back verification results.
- Review notes for `walk.ts` / `zip.ts` / `manifest.ts`.
- `pnpm run ci` output; commit hash once authorized.
