# 0007. Chromium Manifest V3 only for MVP

## Status

Accepted

## Context

Supporting multiple browser extension platforms (Chromium MV3, Firefox's
WebExtensions variant, Safari App Extensions) and a native Obsidian
companion plugin simultaneously would multiply the surface area for the MVP
before the deterministic extraction core is even proven.

## Decision

MVP targets a Chromium Manifest V3 extension only. Firefox, Safari, mobile,
and a native Obsidian companion plugin are deferred.

## Alternatives considered

- **Cross-browser from day one (WebExtension polyfill)** — rejected for MVP:
  adds abstraction cost before there is proven extraction behaviour worth
  porting; can be revisited post-MVP via a new ADR.
- **Native Obsidian plugin instead of a browser extension** — rejected: the
  product thesis is about capturing pages a user is browsing; the capture
  surface has to live in the browser, with Obsidian as an export target, not
  the capture surface itself.

## Consequences

- `packages/extension` is written against Chrome's MV3 APIs
  (`@types/chrome`); no browser-abstraction layer is introduced speculatively.
- Manifest validation (`packages/extension/src/manifest.test.ts`) checks for
  `manifest_version: 3` specifically.
- Cross-browser support is an explicit non-goal unless a new ADR changes it.
