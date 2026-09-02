# Extension usage reference

**Status: not yet implemented.** There is no user-facing capture behaviour
yet — `packages/extension` is a Phase 0 scaffold (empty service worker,
zero-permission manifest). This document will describe the real "Clip page"
flow starting in Phase 9 (see `planning/ROADMAP.md`):

- installing/loading the unpacked extension for development;
- running **Clip page** and reading the completeness report (detected/exact/
  approximate/failed code counts, capture-scope warnings);
- copying Markdown, the documented Obsidian handoff mechanism, and
  downloading a capture bundle;
- which fatal errors block export versus which warnings only degrade status.

Do not follow this file for actual usage instructions until it is replaced
by the Phase 9 implementation.
