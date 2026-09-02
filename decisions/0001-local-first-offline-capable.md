# 0001. Local-first, offline-capable operation

## Status

Accepted

## Context

`technical-clipper` captures potentially sensitive page content (including
private ChatGPT conversations). A hosted backend, telemetry service, or
schema server would mean page content or usage patterns leave the user's
machine, and would make ordinary capture depend on network availability and
an external party's uptime/trust.

## Decision

Ordinary capture requires no account, hosted API, telemetry service, or
schema server. No network requests occur during extraction — the page may
already be loaded, but capture itself must not send page content elsewhere
or depend on a remote service.

## Alternatives considered

- **Hosted extraction/rendering service** — rejected: contradicts
  local-first, adds an availability dependency and a data-handling liability
  for content that may be private (ChatGPT conversations).
- **Optional telemetry with opt-in** — rejected for MVP: adds a
  non-deterministic, non-essential surface before the deterministic core is
  proven; can be reconsidered post-MVP via a new ADR if ever needed.

## Consequences

- All fixtures and tests must be offline-runnable (see
  `AGENTS.md` § verification protocol).
- Any future feature proposal that requires a network call during capture
  must be raised as a stop-and-ask condition, not implemented silently.
- Obsidian handoff and bundle export must work through local mechanisms
  (file download, documented local handoff), not a cloud sync step.
