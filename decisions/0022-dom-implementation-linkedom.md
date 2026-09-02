# 0022. DOM implementation for fixture-time capture: linkedom

## Status

Accepted (Phase 4).

## Context

The capture pipeline (`decisions/0005`) clones a _rendered_ DOM, runs detectors
and general extraction over it, and restores structured nodes. In the shipped
extension the content script has a real browser DOM. For unit and integration
tests the pipeline must parse a saved `source.html` fixture into a DOM without a
browser, deterministically, offline, and without executing page scripts
(`decisions/0009`).

## Decision

Use **`linkedom`** (pinned `^0.18.0`) as the fixture-time DOM implementation,
in a new `packages/pipeline` package. `packages/core` stays DOM-free.

- `parseHTML(html)` returns a `Document` with the standard query/traversal API
  the pipeline needs (`querySelectorAll`, `children`, `textContent`,
  `getAttribute`, `cloneNode`, comment nodes).
- No script execution, no network, no layout engine — parsing is a pure
  function of the input bytes.
- Pure JavaScript, no native addons — installs and runs the same on CI and dev.

The pipeline is written against a **narrow DOM surface** (an internal
`DomNode` view over the parts of the API we use) so that in Phase 9 the same
extraction code runs against the browser's real `document` with no linkedom in
the bundle.

## Alternatives considered

- **jsdom** — rejected: heavier, ships a JS execution engine and partial layout
  we do not want near untrusted capture input, slower to construct, and its
  behaviour has more surface to drift between versions.
- **parse5 + a hand-rolled tree** — rejected for now: parse5 is the right HTML
  parser but we would reimplement the traversal/query layer linkedom already
  provides deterministically; revisit only if linkedom shows non-determinism.
- **happy-dom** — rejected: also carries a scripting/event model; less mature
  serialization determinism than linkedom for our use.

## Consequences

- `packages/pipeline` depends on `linkedom`; `packages/core`,
  `packages/detectors`, `packages/adapters` do not.
- The pipeline's public `capture()` takes either an HTML string (fixture path,
  parsed with linkedom) or an already-parsed `Document` (extension path).
- If linkedom ever produces a different tree for identical input across runs or
  versions, that is a Phase 4 stop-and-ask condition — pin harder or move to
  parse5.
- linkedom's HTML serialization is used for `raw/page.html` (Phase 7) after
  sanitization.
