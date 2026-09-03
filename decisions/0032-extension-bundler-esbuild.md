# 0032. Extension bundler: esbuild, and a browser-safe core

## Status

Accepted (Phase 9). Supersedes the "extension bundler deferred" note in
`decisions/0010`.

## Context

`decisions/0010` deferred the extension bundler to Phase 9. The MV3 extension
must ship self-contained ES modules (a strict CSP forbids remote scripts), and
it bundles `@technical-clipper/pipeline` + `core` — which were written for Node
and Vitest and used `node:crypto` for SHA-256.

## Decision

### Bundler: **esbuild** (`build.mjs`)

`packages/extension/build.mjs` bundles three entry points to `dist/`:
`background.js` (the service worker), `capture-in-page.js` (the content script
injected by `chrome.scripting.executeScript({ files })`), and `results.js`
(the results-page controller). `manifest.json` and `results.html` are copied
verbatim. `format: 'esm'`, `platform: 'browser'`, `target: 'chrome116'`, no
sourcemap, no external hosts.

Rationale: one dependency, fast, no config file, deterministic enough for a
dev extension. `vite` + `@crxjs` was the alternative — more machinery than a
3-entry-point extension needs.

### Browser-safe core

`node:crypto` is replaced by a **synchronous, dependency-free SHA-256**
(`packages/core/src/sha256.ts`, FIPS 180-4, verified against known-answer
vectors). Web Crypto's `subtle.digest` is async and would make
`computeNodeId` / `hashCodeText` / `assembleBundle` / `capture()` all async —
rippling through the whole pipeline. A sync pure-JS hash keeps every function
synchronous in Node, Vitest, and the browser.

`parseDocument` / `captureFromHtml` (the only linkedom users) are **not**
re-exported from `@technical-clipper/pipeline`'s barrel — they live in
`./parse.js`, imported directly by fixtures/tests. So a browser bundle of
`@technical-clipper/pipeline` never pulls linkedom in (verified by a test that
greps the built artifacts).

### Injection pattern

`executeScript({ func })` cannot carry bundled imports (it serializes the
function source only). So `capture-in-page.ts` is a **self-executing content
script** built to `capture-in-page.js`, injected via
`executeScript({ files: ['capture-in-page.js'] })`; it captures and posts the
result to the service worker via `chrome.runtime.sendMessage`. The worker
stashes it in `chrome.storage.session` and opens `results.html`.

## Alternatives considered

- **vite + @crxjs** — rejected: HMR/manifest-transform machinery is overkill;
  esbuild + a 30-line script is transparent.
- **Web Crypto (async) for hashing** — rejected: async ripple across the
  deterministic path.
- **Ship linkedom in the extension** — rejected: ~500 KB of unused DOM
  implementation; the content script has the real `document`.

## Consequences

- `packages/extension` depends on `core` + `pipeline` + `esbuild` (dev) +
  `linkedom` (dev, tests only).
- The bundle is ~105 KB (`capture-in-page.js`) / ~41 KB (`results.js`),
  unminified for dev; minification is a Phase 10 nicety.
- `packages/core` is now genuinely browser-independent (no `node:` imports);
  `hash.test.ts` pins the SHA-256 vectors so a regression is loud.
