# 0009. Captured content is untrusted; least-privilege permissions

## Status

Accepted

## Context

Captured HTML and page metadata originate from arbitrary, potentially
adversarial web pages. Treating this content as trusted anywhere in the
pipeline (executing it, injecting it unsanitized into extension-privileged
pages, or requesting broad browser permissions "just in case") would turn a
document-capture tool into an attack surface.

## Decision

Treat captured HTML and page metadata as untrusted throughout. Do not
execute captured code, inject unsanitized page HTML into extension pages,
persist secrets, or request broader browser permissions than the current
action needs.

## Alternatives considered

- **Render captured HTML directly in the preview for fidelity** — rejected:
  unsanitized page-supplied HTML in an extension-privileged context is an
  injection risk; the anti-pattern catalogue in
  `.claude/skills/markdown-clipping` (Phase 2) explicitly tests against this.
- **Request broad host permissions (`<all_urls>`) upfront for convenience**
  — rejected: violates least-privilege; permissions are requested per
  action as later phases need them, and any such request is a stop-and-ask
  condition if it would expose more than the action requires.

## Consequences

- `packages/extension/manifest.json` starts at zero permissions
  (`decisions/0007`) and grows only with justification tied to a specific
  phase's needed action.
- The extension preview renders sanitized/structured content, never raw
  page-supplied HTML.
- MVP release gates require "no executable captured content or unsafe HTML
  in the extension preview" and a security review before release
  (`planning/v0-to-mvp-planning-prompt.md` § 12–13, Phase 10).
