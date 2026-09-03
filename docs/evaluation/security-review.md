# Security review — MVP

Scope: the Chromium extension (`packages/extension`) and the capture pipeline
it runs (`packages/pipeline`, `packages/core`, `packages/detectors`,
`packages/adapters`). Reviewed at commit range `feat(phase-9)` … Phase 10.

A dedicated `security-review` skill was not available in this environment; this
is a manual review against `decisions/0009` and planning-prompt § 12 gates
12–14. Findings are tracked to closure below.

## 1. Untrusted-input boundary

**Model:** captured page HTML, text, and metadata are fully untrusted. They are
parsed and transformed but never executed, and never inserted into any DOM as
markup.

| Check                                        | Result                                                                                                                                                                                                                                      |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Capture HTML is parsed, not evaluated        | PASS — linkedom (fixtures) / live `document` (extension); no `eval`, no `Function`, no `innerHTML` assignment from captured content anywhere in `packages/*/src`.                                                                           |
| Rendered Markdown preview                    | PASS — `results.ts` sets `pre.textContent`; the only `innerHTML` uses are `= ''` to clear an element before `createElement`/`textContent` repopulation.                                                                                     |
| Raw HTML in the IR (`htmlBlock`, inline raw) | PASS — `decisions/0028`: emitted as a fenced ` ```html ` code block (`renderFencedBlock`) or `escapeText`'d inline, never as markup. `TC-RENDER-HTML-SANITIZED` is raised.                                                                  |
| `raw/page.html` in the bundle                | PASS — `sanitizedPageHtml()` removes `<script>`, `<style>`, `<template>`, `<link rel=stylesheet>`, every `on*` attribute, and `href`/`src` values matching `javascript:` before serialising. It is stored, never rendered by the extension. |
| Bundle is data-only                          | PASS — `content.md`, `document.json`, `manifest.json`, `diagnostics.json`, optional `raw/page.html`; STORE-only ZIP (`decisions/0029`), no execution path.                                                                                  |

### Finding S-1 (informational, closed)

`sanitizedPageHtml` is defence-in-depth for a file the extension itself never
renders. It does not attempt full HTML sanitisation (e.g. `srcset`,
`style="expression(...)"`, SVG event handlers). **Resolution:** documented as
"sanitised for the common script vectors, not a full sanitiser" in
`docs/privacy-and-security.md`; the file is inert in this product because
nothing loads it. If a future feature renders `raw/page.html`, that feature
must run it through a real sanitiser — noted there and in `decisions/0009`.

## 2. No code execution from captured content

- No `eval` / `new Function` / `setTimeout(string)` in `packages/*/src`
  (grep-verified).
- Detectors read `textContent`, attributes, and class names; they never invoke
  page scripts or read live JS objects (`decisions/0026` — ChatGPT roles come
  from DOM attributes, not `window.__NEXT_DATA__`).
- The content script bundle contains no `node:` built-ins and no linkedom
  (`packages/extension/src/capture-path.test.ts` asserts this on the built
  artifacts).

## 3. No network during capture

- `runWithNetworkTrap()` replaces `fetch`, `XMLHttpRequest`, `WebSocket`,
  `EventSource`, `importScripts`, and `navigator.sendBeacon` with throwing
  stubs for the duration of `capture()`, restoring them in a `finally`.
- Gate 12 (`scripts/gates.mjs`) independently installs a `fetch`/`XHR` trap and
  captures three fixtures (incl. the 461 KB Wikipedia JWT page) asserting zero
  calls. **PASS.**
- Asset URLs are absolutised (string only); images are referenced, never
  fetched (`decisions/0009` — no image mirroring).

## 4. Permission scope (gate 14)

`packages/extension/manifest.json`:

```json
"permissions": ["activeTab", "scripting", "storage"],
"host_permissions": []
```

- `activeTab` + `scripting`: capture runs **only** on the tab whose toolbar
  button the user clicked; injection is `chrome.scripting.executeScript` on
  that `tabId`, `world: 'ISOLATED'`.
- `storage`: `chrome.storage.session` only, to hand the capture result from the
  service worker to the results page. Cleared when the browser session ends.
- No `tabs`, no `<all_urls>`, no `webRequest`, no `downloads` (the bundle is
  saved via an in-page `Blob` + anchor, gated by the user action).
- `manifest.test.ts` + gate 14 assert `permissions ⊆ {activeTab, scripting,
storage}` and `host_permissions == []`. **PASS.**

## 5. No secret persistence

- The extension stores exactly one thing: the most recent capture result in
  `chrome.storage.session` (`RESULT_KEY`), overwritten on each capture and gone
  at session end.
- No `chrome.storage.local`, no `localStorage`, no cookies, no IndexedDB.
- No credentials, tokens, or vault paths are read or written. The Obsidian
  handoff builds an `obsidian://new` URI from the capture title + Markdown at
  action time; the optional vault name is passed through, never stored
  (`decisions/0033`).
- Captured pages may themselves contain secrets (a logged-in dashboard, an API
  key in example code). The tool treats the whole capture as the user's data,
  keeps it local, and the export gate + preview let the user see exactly what
  will leave the browser before they copy/send/download. Documented in
  `docs/privacy-and-security.md`.

### Finding S-2 (low, closed)

A ChatGPT or dashboard capture can contain sensitive text; `Send to Obsidian`
puts it in a URI and `Download bundle` writes it to disk. **Resolution:** this
is inherent to a clipping tool and is the user's decision; mitigations in place
are (a) capture only on explicit user action, (b) a full preview before any
export, (c) everything stays on the user's machine, (d) no telemetry. Called
out explicitly in `docs/privacy-and-security.md` § "What you are responsible
for".

## 6. Determinism / supply chain

- Runtime deps of the shipped bundle: `@technical-clipper/core` +
  `@technical-clipper/pipeline` only (first-party). `linkedom` is a
  fixture-time / dev dep and is asserted absent from the built content-script
  bundle.
- `esbuild` is a build-time dep (`decisions/0032`). The build is reproducible;
  `scripts/package-extension.mjs` emits a deterministic ZIP.
- No postinstall scripts in first-party packages.

## Open items

None blocking the MVP. Deferred, tracked for post-MVP:

- Full sanitiser for `raw/page.html` **if** a future feature renders it (S-1).
- A Subresource-Integrity-style manifest for the packaged extension zip.

## Reporting

Vulnerability reports: see `docs/privacy-and-security.md` § "Reporting a
security issue".
