# CLAUDE.md

This is a compatibility entrypoint for Claude Code. The working contract for
this repository is [`AGENTS.md`](AGENTS.md) — read it first; it applies to
Claude the same as any other agent.

## Claude-specific notes

- A project skill lives at `.claude/skills/markdown-clipping/` (created in
  Phase 2). It gives Markdown/Obsidian output-profile guidance for
  design/implementation/review of rendering, capture fixtures, and Obsidian
  export. It is development-time guidance only — never a runtime dependency
  of the shipped extension, and it must never be treated as authority to
  change capture/extraction behaviour on its own (see `AGENTS.md` §
  deterministic authority path).
- Any material change to `AGENTS.md` or this file must be shown as a diff
  and explicitly approved by the user before writing — do not self-approve
  governance-document edits.
- Start every session by reading `planning/CONTEXT.md`, then
  `planning/ROADMAP.md`, before touching code.
