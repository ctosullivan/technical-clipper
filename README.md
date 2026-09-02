# technical-clipper

> Working product name — replace throughout the repo once a final name is
> chosen (see `AGENTS.md` § stop-and-ask conditions).

A local-first browser extension for high-fidelity capture of code-heavy
technical pages and ChatGPT conversations into deterministic Markdown and
structured capture bundles. It is a deterministic web document compiler with
strong code awareness, not an AI summariser and not a general archival
crawler. Obsidian is the first export target.

## Status: Phase 0 scaffold — no capture behaviour exists yet

Nothing in this repository can capture a page today. `packages/core`,
`packages/detectors`, and `packages/adapters` are scaffolds whose only
exported behaviour is throwing `NotImplementedError`; `packages/extension`
is an empty, zero-permission Manifest V3 shell. See
[`planning/ROADMAP.md`](planning/ROADMAP.md) for what's implemented versus
planned, and [`planning/CONTEXT.md`](planning/CONTEXT.md) for the current
resumption state.

## What this will prove (the MVP thesis)

> On ordinary articles, supported technical pages, and the currently
> selected branch of a ChatGPT conversation, the primary content and its
> structure are retained; every supported code block is preserved exactly;
> and uncertainty or incompleteness is reported before export.

## Repository map

| Path                                | Purpose                                                            |
| ----------------------------------- | ------------------------------------------------------------------ |
| `packages/core`                     | Typed IR, provenance/confidence, normalization, hashing (scaffold) |
| `packages/detectors`                | Code/terminal/tab-group component detectors (scaffold)             |
| `packages/adapters`                 | Site/conversation adapters, e.g. Docusaurus, ChatGPT (scaffold)    |
| `packages/extension`                | Chromium MV3 extension shell (scaffold)                            |
| `architecture/`                     | Current + target technical design                                  |
| `decisions/`                        | ADRs — historical reasoning, append-only                           |
| `docs/`                             | Current user-facing behaviour and formats                          |
| `planning/`                         | Roadmap, phase plans, resumption context                           |
| `ai-docs/`                          | Product capabilities and evidence boundaries, for agents           |
| `fixtures/`                         | Offline HTML/IR/Markdown fixture corpus                            |
| `.claude/skills/markdown-clipping/` | Development-time Markdown/Obsidian guidance (Phase 2+)             |

`AGENTS.md` is the canonical, tool-neutral working contract for anyone —
human or AI — contributing here. `CLAUDE.md` is a small pointer to it.

## Development setup

```sh
pnpm install
pnpm run ci   # format:check + lint + typecheck + build + test
```

Use `pnpm run ci`, not `pnpm ci` — pnpm reserves the bare `ci` subcommand for
itself, so it never reaches our `ci` script in `package.json`.

Requires Node 20+ (see `.nvmrc`) and pnpm (see `packageManager` in
`package.json`).

## License

MIT — see [`LICENSE`](LICENSE).
