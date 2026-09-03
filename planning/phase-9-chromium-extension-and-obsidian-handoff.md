# Phase 9 — Chromium extension and Obsidian handoff

## Status

done

## Completion evidence

- **`packages/extension/`:** `manifest.json` (MV3, `activeTab` + `scripting` +
  `storage`, no host permissions), `src/capture-in-page.ts` (self-executing
  content script: `capture({ doc: document, url })` + sanitized `raw/page.html`
  - `chrome.runtime.sendMessage`), `src/background.ts` (action → inject →
    stash → open results), `src/results.ts` + `results.html` (report + preview +
    actions), `src/obsidian.ts` (`planObsidianHandoff` + 200 KB guard),
    `src/gate.ts` (export-gate policy), `src/shared.ts`, `build.mjs` (esbuild).
- **ADRs:** `decisions/0032` (esbuild + `node:`-free core via
  `packages/core/src/sha256.ts`), `0033` (Obsidian URI + size guard).
- **Refactor:** `parseDocument` / `captureFromHtml` moved out of the pipeline
  barrel into `./parse.js` so a browser bundle never pulls in linkedom;
  `capture()` now takes `doc` only.
- **Tests:** `manifest.test.ts` (3 — permission allowlist),
  `obsidian.test.ts` (4), `gate.test.ts` (4), `capture-path.test.ts` (5 —
  builds the bundle, asserts no `node:` / linkedom in the artifacts, drives
  the exact `capture({ doc })` call over fixtures, streaming → export blocked,
  conversation raw-HTML default off). `pnpm run ci` green: 22 test files /
  160 tests.
- **Docs:** `docs/cli-or-extension-reference.md` replaced;
  `docs/privacy-and-security.md` permission justification + reporting note;
  `architecture/overview.md`, `README.md`.
- **Deferred / stop-and-ask respected:** no packaging, signing, store
  submission, or tag — that is Phase 10 + explicit approval. Manual load-and-
  smoke in a real Chromium is a Phase 10 manual gate (16). Bundle
  minification deferred (`decisions/0032`).
- **Commit:** see `planning/CONTEXT.md`.

The scope and plan below are the original Phase 1 statement, retained for
context.

## Goal and user-visible outcome

The first user-facing build: a loadable Chromium MV3 extension with a **Clip
page** action that runs the Phase 3–8 pipeline in-page, shows a preview of the
extracted Markdown plus the completeness report, and lets the user copy
Markdown, hand the note to Obsidian via a documented mechanism, or download the
deterministic capture bundle — with export blocked on `failed` and a visible
warning required on `partial`.

## Scope covered

- MV3 shell (`packages/extension`): `action` (toolbar) + a results page (popup
  or a dedicated extension page — decided in this phase's ADR; a full page is
  likely needed for the preview + report).
- Content-script capture: inject on user action only (`activeTab` +
  `scripting`), clone the rendered DOM in-page, run the pipeline **in the
  page/worker context with the network trap active**, return `DocumentIR` +
  rendered artifacts + completeness report to the extension page.
- Least-privilege manifest: `permissions: ["activeTab", "scripting"]`,
  `host_permissions: []` (or the minimal set the Obsidian handoff needs —
  see below), no `tabs`, no broad host match. Every permission justified in
  `docs/privacy-and-security.md` and asserted by a manifest test
  (`decisions/0020` gate 14).
- Results page UI:
  - Markdown preview rendered through the Phase 7 sanitizing renderer, in the
    profile that will be exported.
  - Completeness report: code counts (`detected/exact/approximate/failed`),
    sections kept/expected, citations resolved, capture-scope warnings, the
    diagnostics list, and the `exportStatus` with its reason.
  - Actions: **Copy Markdown** (`gfm` default), **Send to Obsidian**
    (`obsidian` profile), **Download bundle** (with a raw-HTML include toggle,
    defaulted per `captureKind`), **Choose profile** (adds `commonmark`).
  - `failed` → all export actions disabled, reason shown. `partial` → actions
    enabled, warning banner shown and non-dismissible until acknowledged.
- Obsidian handoff: an explicitly documented mechanism. Default = the Obsidian
  URI scheme (`obsidian://new?...`) with the note content, **guarded by a
  content-size check** — if the URI would exceed a safe length, fall back to
  "copy Markdown + save the bundle" and tell the user why
  (`decisions`/§ 16 stop-and-ask on Obsidian size). The chosen mechanism and
  its limits are an ADR in this phase.
- Bundle download via `chrome.downloads` (or an anchor + `Blob`) — the exact
  bytes from Phase 7's `assembleBundle`.
- Extension bundler: pick and configure (`vite` + `@crxjs` or `esbuild` —
  ADR, deferred from `decisions/0010`); output an unpacked `dist/` that loads
  in Chrome.
- Integration tests: the built extension against locally served fixtures
  (`tests/`), asserting capture → preview → export for representative article
  and conversation fixtures, plus the export gate behaviour.

## Explicit deferrals / non-goals

- Firefox/Safari/mobile; a native Obsidian plugin (non-goals).
- Store submission / signing / publishing (explicit stop-and-ask; not in this
  phase).
- Options/settings page beyond the per-capture toggles (profile, raw HTML) —
  no persistent user config, no ClipSpec editor (non-goal).
- Corpus filling + release gates + security review (Phase 10).
- Any capture of pages the user did not explicitly act on (no background
  capture, no history scraping).

## Dependencies and assumptions

- Depends on Phases 3–8 (the whole pipeline + `evaluateCapture`).
- Assumes the pipeline runs within a content-script/worker bundle size and
  time budget; the 2-second capture+preview target is a Phase 10 gate but is
  measured informally here.
- Assumes `linkedom`/`jsdom` from Phase 4 is **not** needed in-extension (the
  content script has a real DOM) — the pipeline's DOM-parsing entry is only
  for fixtures; in-extension it receives the live cloned DOM. This split must
  be clean (ADR if the abstraction needs reshaping).
- Assumes the Obsidian URI mechanism is acceptable; if it can't reliably
  handle planned content sizes, stop and ask.

## Design decisions already settled

`decisions/0007` (Chromium MV3 only), `0009` (untrusted capture, least
privilege, no secrets), `0015` (export gate: `failed` blocks, `partial` needs
visible warning), `0017` (bundle bytes, raw-HTML toggle/defaults), `0019`
(profile per action, preview safety). New this phase: results-surface choice
(popup vs page); bundler choice; Obsidian handoff mechanism + size guard;
in-page vs worker execution context — each an ADR.

## Files to add/change

| Path                                          | Purpose                                              |
| --------------------------------------------- | ---------------------------------------------------- |
| `packages/extension/manifest.json`            | add `activeTab` + `scripting`; still no host perms   |
| `packages/extension/src/action.ts`            | toolbar action → open results page → trigger capture |
| `packages/extension/src/content/capture.ts`   | in-page clone + pipeline invocation + network trap   |
| `packages/extension/src/results/`             | results page: preview + report + actions             |
| `packages/extension/src/obsidian.ts`          | URI handoff + size guard + fallback                  |
| `packages/extension/src/download.ts`          | bundle download                                      |
| `packages/extension/build.config.*`           | bundler config                                       |
| `packages/extension/src/**/*.test.ts`         | unit tests (obsidian size guard, gate logic)         |
| `tests/extension-*.test.ts`                   | built-extension integration over served fixtures     |
| `decisions/00NN-extension-results-surface.md` | popup vs page                                        |
| `decisions/00NN-extension-bundler.md`         | bundler choice (supersedes `0010`'s deferral)        |
| `decisions/00NN-obsidian-handoff.md`          | mechanism + size limit + fallback                    |
| `docs/cli-or-extension-reference.md`          | **replace stub** with real usage                     |
| `docs/privacy-and-security.md`                | permission justification; reporting process          |
| `docs/capture-format.md`                      | link the extension flow                              |
| `architecture/overview.md`                    | extension shell → current; execution context         |
| `README.md`                                   | status → "loadable dev extension; capture works"     |
| `CHANGELOG.md`                                | Phase 9 entry                                        |

## Implementation sequence

1. Bundler ADR + config; produce an unpacked `dist/` that loads with the
   current empty behaviour.
2. Manifest: add `activeTab` + `scripting`; manifest test asserts the
   permission set ⊆ allowlist.
3. `content/capture.ts`: clone live DOM, run pipeline, keep the network trap;
   return artifacts to the extension page via `chrome.runtime` messaging.
4. Results page: preview (sanitized renderer) + completeness report component.
5. Export gate wiring: `failed` disables actions; `partial` shows the
   non-dismissible warning.
6. Copy / Download actions; raw-HTML toggle.
7. `obsidian.ts` + ADR: URI handoff, size check, fallback path + user message.
8. Integration tests: served article + conversation fixtures → capture →
   assert preview text + report counts + gate behaviour + downloaded bundle
   bytes equal `assembleBundle`.
9. Informal timing: capture+preview on a representative fixture, record the
   number (formal gate in Phase 10).
10. Replace `docs/cli-or-extension-reference.md`; update privacy/security,
    architecture, README, CHANGELOG.
11. Direct review: `manifest.json`, `content/capture.ts` (no data leaves the
    page except to the extension UI), `obsidian.ts` size guard.
12. `pnpm run ci` + load-and-smoke in a real Chromium.
13. If authorized, commit `feat(phase-9): chromium extension and obsidian
handoff`. **Do not** package for a store or tag.

## Test fixtures and edge cases

- Article fixture → preview shows Markdown, report `complete`, all actions
  enabled; downloaded bundle bytes == Phase 7 output.
- Conversation fixture → `rawHtmlIncluded` toggle defaults off; report shows
  roles/order; Obsidian handoff produces a valid `obsidian://` URL.
- `partial` fixture (failed code block) → warning banner non-dismissible,
  actions still enabled, bundle contains the diagnostics.
- `failed` fixture (no article root / streaming conversation) → actions
  disabled, reason shown, no bundle producible.
- Oversized note (very long article) → Obsidian URI would exceed the limit →
  fallback message + copy/bundle offered.
- Page with a `<script>` in content → preview never executes it; sanitized.
- Manifest test → `permissions` exactly `["activeTab","scripting"]`,
  `host_permissions` empty (or the documented minimal set).

## Runnable verification and expected outcomes

```sh
pnpm run ci
pnpm run build:extension     # expect: unpacked dist/ loads in Chrome, no errors
pnpm test -- tests/extension-capture.test.ts
   # expect: served fixtures capture end to end; preview + report correct;
   #         export gate matches status; downloaded bytes == assembleBundle;
   #         no network trap hit
```

Manual: load unpacked in Chromium, clip a local Wikipedia fixture served over
`http://localhost`, confirm preview + report + copy + Obsidian + download.

## Documentation / ADR / changelog effects

- 3–4 new ADRs (results surface, bundler, Obsidian handoff, maybe execution
  context).
- `docs/cli-or-extension-reference.md` stub **replaced**.
- `docs/privacy-and-security.md` permission justification + real vuln-reporting
  process.
- `architecture/overview.md` extension shell → current.
- `README.md` status updated.
- `CHANGELOG.md` Phase 9; `ROADMAP.md` Phase 9 → `done`; `CONTEXT.md` →
  Phase 10.

## Stop-and-ask conditions specific to this phase

- The Obsidian handoff can't reliably handle planned content sizes (§ 16).
- A feature would need a browser permission broader than the action requires
  (`decisions/0009`, § 16).
- The pipeline can't run in the content-script/worker context without a
  network call or eval.
- Capture would read page state the user didn't explicitly request.
- The next step is packaging, signing, store submission, or tagging (§ 16) —
  stop; that is Phase 10 + explicit approval.

## Completion evidence to record

- Manifest permission set + the allowlist test result.
- Integration test output; downloaded-bytes-equal-`assembleBundle` proof.
- Informal capture+preview timing on the reference fixture.
- Obsidian handoff: the mechanism, the size limit, the fallback behaviour.
- Manual smoke-test notes (which fixture, which browser version).
- Review notes for manifest / capture / obsidian modules.
- `pnpm run ci` output; commit hash once authorized.
