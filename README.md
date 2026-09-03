# technical-clipper

> Working product name — replace throughout the repo once a final name is
> chosen (see `AGENTS.md` § stop-and-ask conditions).

A local-first browser extension for high-fidelity capture of code-heavy
technical pages and ChatGPT conversations into deterministic Markdown and
structured capture bundles. It is a deterministic web document compiler with
strong code awareness, not an AI summariser and not a general archival
crawler. Obsidian is the first export target.

## Status: MVP candidate — awaiting release approval

The full pipeline is implemented: clone the rendered DOM → detect code /
terminal / tab-group structures → deterministic article-root selection →
typed IR → profile-aware Markdown (`commonmark` / `gfm` / `obsidian`) → a
deterministic capture bundle → a completeness report and export gate. The
Chromium MV3 extension (`packages/extension`) is a **loadable unpacked dev
build** with a **Clip page** action, a results page (report + preview + Copy /
Send-to-Obsidian / Download-bundle), and a least-privilege manifest.

All ten roadmap phases are `done`. The fixture corpus meets the § 12 minimums
(22 articles incl. 5 revision-pinned Wikipedia captures, 19 code fixtures, 87
code blocks), release gates 1–15 run as `pnpm gates` in CI, and the security
review + comparative benchmark + Obsidian checklist live under
[`docs/evaluation/`](docs/evaluation/). The MVP release note is assembled under
`[Unreleased]` in [`CHANGELOG.md`](CHANGELOG.md) but **not promoted or tagged**
— that is a separate, explicit release-approval step. See
[`planning/CONTEXT.md`](planning/CONTEXT.md).

### Load the extension

```sh
pnpm --filter @technical-clipper/extension run build
```

then load `packages/extension/dist/` as an unpacked extension in Chromium
(`chrome://extensions` → Developer mode → Load unpacked). See
[`docs/cli-or-extension-reference.md`](docs/cli-or-extension-reference.md).

## What this will prove (the MVP thesis)

> On ordinary articles, supported technical pages, and the currently
> selected branch of a ChatGPT conversation, the primary content and its
> structure are retained; every supported code block is preserved exactly;
> and uncertainty or incompleteness is reported before export.

## Repository map

| Path                                | Purpose                                                                             |
| ----------------------------------- | ----------------------------------------------------------------------------------- |
| `packages/core`                     | Typed IR, provenance/confidence, normalization, hashing, renderer, bundle, evaluate |
| `packages/detectors`                | Code/terminal/tab-group component detectors (Prism, highlight.js, Docusaurus, …)    |
| `packages/adapters`                 | Site/conversation adapters (ChatGPT), ClipSpec resolution                           |
| `packages/pipeline`                 | The capture path: clone → detect → extract → assemble → validate → evaluate         |
| `packages/extension`                | Chromium MV3 extension: Clip page action, results page, Obsidian handoff            |
| `architecture/`                     | Current + target technical design                                                   |
| `decisions/`                        | ADRs — historical reasoning, append-only                                            |
| `docs/`                             | Current user-facing behaviour and formats                                           |
| `planning/`                         | Roadmap, phase plans, resumption context                                            |
| `ai-docs/`                          | Product capabilities and evidence boundaries, for agents                            |
| `fixtures/`                         | Offline HTML/IR/Markdown fixture corpus                                             |
| `.claude/skills/markdown-clipping/` | Development-time Markdown/Obsidian guidance + offline verifier                      |

`AGENTS.md` is the canonical, tool-neutral working contract for anyone —
human or AI — contributing here. `CLAUDE.md` is a small pointer to it.

## Development setup

```sh
pnpm install
pnpm run ci   # format:check + lint + typecheck + build + test + skill:verify
```

Use `pnpm run ci`, not `pnpm ci` — pnpm reserves the bare `ci` subcommand for
itself, so it never reaches our `ci` script in `package.json`.

Requires Node 20+ (see `.nvmrc`) and pnpm (see `packageManager` in
`package.json`).

## License

MIT — see [`LICENSE`](LICENSE).
