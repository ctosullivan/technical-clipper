# Privacy and security

This document is partly current (the invariants below already hold, even
though no capture behaviour exists yet) and partly forward-looking (marked
explicitly). It will grow as later phases add real capture, rendering, and
export behaviour.

## Current invariants (Phase 0)

- **No network calls in the deterministic path.** Nothing in this repository
  sends page content, telemetry, or usage data anywhere. See
  [`decisions/0001-local-first-offline-capable.md`](../decisions/0001-local-first-offline-capable.md).
- **Least-privilege manifest.** `packages/extension/manifest.json` requests
  only `activeTab` (read the tab the user clicked the button on, for that
  click only), `scripting` (inject the capture content script into that tab),
  and `storage` (hand the result to the results page via
  `chrome.storage.session`) — and **no host permissions**. No `tabs`, no
  `<all_urls>`, no background capture, no history access. A manifest test
  asserts this allowlist so a future phase adding a broader grant regresses
  loudly. See
  [`decisions/0009`](../decisions/0009-security-boundary-untrusted-capture.md)
  and
  [`decisions/0032`](../decisions/0032-extension-bundler-esbuild.md).
- **No secrets are persisted.** There is no credential storage, auth flow, or
  account system in the MVP scope.

## Planned (not yet implemented)

- Captured HTML and page metadata will be treated as untrusted at every
  boundary: never executed, never injected unsanitized into extension pages.
- ChatGPT captures need explicit sanitization/privacy handling before export,
  since conversation content is more sensitive than a public article. Raw
  HTML inclusion defaults **off** for `conversation` captures (`decisions/0017`,
  implemented in Phase 7); the conversation adapter (Phase 6) already reads
  only the currently selected branch and downloads nothing.
- The extension will only ever capture the currently rendered, user-visible
  page state — see
  [`decisions/0008-chatgpt-current-branch-scope.md`](../decisions/0008-chatgpt-current-branch-scope.md)
  and [`decisions/0026-chatgpt-branch-and-role-evidence.md`](../decisions/0026-chatgpt-branch-and-role-evidence.md).
  Hidden branches, deleted edits, and internal reasoning are never captured;
  attachments are recorded as metadata only, never fetched.
- A security review is a named MVP release gate (Phase 10).

## Reporting a concern

The extension is a loadable **unpacked dev build** (Phase 9) — it is not
packaged or published. If you find a security issue in the code, open a
GitHub issue on <https://github.com/ctosullivan/technical-clipper> describing
the class of problem (not a working exploit). A formal disclosure process and
a security contact are finalized as part of the Phase 10 security review.
