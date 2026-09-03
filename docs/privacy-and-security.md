# Privacy and security

This describes the shipped MVP behaviour. The security review that backs it is
[`docs/evaluation/security-review.md`](evaluation/security-review.md).

## Invariants

- **No network calls in the capture path.** `runWithNetworkTrap()` replaces
  `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `importScripts`, and
  `navigator.sendBeacon` with throwing stubs for the duration of a capture.
  Release gate 12 independently proves zero network calls over the fixture
  corpus. Nothing sends page content, telemetry, or usage data anywhere. See
  [`decisions/0001`](../decisions/0001-local-first-offline-capable.md),
  [`decisions/0009`](../decisions/0009-security-boundary-untrusted-capture.md).
- **Least-privilege manifest.** `packages/extension/manifest.json` requests
  only `activeTab`, `scripting`, and `storage`, with **no host permissions**.
  No `tabs`, no `<all_urls>`, no `webRequest`, no `downloads`, no background
  capture, no history access. Capture runs only on the tab whose toolbar
  button you clicked, for that click. `manifest.test.ts` and gate 14 assert the
  allowlist so a future broader grant regresses loudly.
- **Captured content is untrusted and never executed.** Page HTML, text, and
  metadata are parsed and transformed, never `eval`'d and never inserted into
  any extension page as markup. The preview is `<pre>` text. Raw HTML in the IR
  is emitted as a fenced ` ```html ` code block, never as live markup
  (`decisions/0028`).
- **Nothing is persisted but the last capture.** The extension writes exactly
  one value — the most recent capture result — to `chrome.storage.session`,
  overwritten each capture and gone when the browser session ends. No
  `storage.local`, no `localStorage`, no cookies, no IndexedDB. No credential
  storage, auth flow, or account system.
- **Only the visible page state is captured.** Hidden ChatGPT branches, deleted
  edits, and model reasoning are never captured (`decisions/0008`, `0026`).
  Attachments are recorded as metadata only, never fetched. Images are
  referenced by URL, never mirrored.
- **Raw HTML inclusion defaults off for conversations** (`decisions/0017`), on
  for articles; the toggle is shown before every export.

## `raw/page.html` in the bundle

When you include raw HTML, the extension stores a **sanitised** copy: `<script>`,
`<style>`, `<template>`, and stylesheet links are removed, along with every
`on*` handler attribute and any `javascript:` URL. This is defence-in-depth —
the extension itself never renders this file. It is **not** a full HTML
sanitiser (it does not neutralise every exotic vector); if you feed
`raw/page.html` to another tool, that tool is responsible for handling it
safely.

## What you are responsible for

A capture is your data, and the tool keeps it local — but you decide where it
goes next:

- A page you capture may itself contain secrets: a logged-in dashboard, a
  token in example code, private conversation content. The full preview and the
  export gate let you see exactly what will leave the browser before you copy,
  send to Obsidian, or download the bundle.
- `Send to Obsidian` puts the note content in an `obsidian://new` URI;
  `Download bundle` writes it to your disk. Both are explicit actions on
  content you have previewed.
- There is no telemetry and no "phone home" — but equally, no server-side
  backup. If you lose the bundle, it is gone.

## Reporting a security issue

The extension is currently a loadable **unpacked dev build** — not packaged or
published. Report a suspected vulnerability by opening a GitHub issue at
<https://github.com/ctosullivan/technical-clipper> that describes the **class**
of problem (not a working exploit or a step-by-step extraction path). If the
issue is sensitive, open a minimal issue asking for a private channel and a
maintainer will follow up. Findings are tracked to closure in
[`docs/evaluation/security-review.md`](evaluation/security-review.md).
