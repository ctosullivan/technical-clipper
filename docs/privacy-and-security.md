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
  zero permissions and zero host permissions today. Any future permission
  addition must be justified by the specific action that needs it — see
  [`decisions/0009-security-boundary-untrusted-capture.md`](../decisions/0009-security-boundary-untrusted-capture.md)
  and the stop-and-ask condition in `AGENTS.md` for permission scope.
- **No secrets are persisted.** There is no credential storage, auth flow, or
  account system in the MVP scope.

## Planned (not yet implemented)

- Captured HTML and page metadata will be treated as untrusted at every
  boundary: never executed, never injected unsanitized into extension pages.
- ChatGPT captures need explicit sanitization/privacy handling before export,
  since conversation content is more sensitive than a public article. This is
  decided in Phase 1 planning and implemented in Phase 7
  (`docs/capture-format.md`).
- The extension will only ever capture the currently rendered, user-visible
  page state — see
  [`decisions/0008-chatgpt-current-branch-scope.md`](../decisions/0008-chatgpt-current-branch-scope.md).
- A security review is a named MVP release gate (Phase 10).

## Reporting a concern

This is a pre-implementation scaffold; there is no shipped software to have a
vulnerability yet. Once Phase 9 produces a loadable extension, this section
will be replaced with a real reporting process.
