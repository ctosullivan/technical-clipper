# Extension usage reference

Implemented as of Phase 9. The extension is a **loadable unpacked dev build**;
it is not packaged or published (`AGENTS.md` § stop-and-ask — that needs
explicit approval, Phase 10).

## Build and load

```sh
pnpm --filter @technical-clipper/extension run build
```

produces `packages/extension/dist/` (`decisions/0032`). In Chromium:
`chrome://extensions` → enable Developer mode → **Load unpacked** →
`packages/extension/dist`.

## Permissions

`decisions/0009`: the manifest requests **only** `activeTab`, `scripting`, and
`storage`, and **no** host permissions. Capture runs only on the tab you click
the toolbar button on; there is no background capture, no history access, and
nothing is sent to any server.

## The Clip page flow

1. Open an article (incl. Wikipedia), a supported technical page, or a ChatGPT
   conversation.
2. Click the **Clip page** toolbar button. The extension injects
   `capture-in-page.js` into that tab; it runs the Phase 3–8 pipeline against
   the live DOM inside a network trap and posts the result back.
3. A results tab opens showing:
   - a **completeness report** — status, `detected / exact / approximate /
failed` code counts, citations resolved, sections kept (when known), and
     capture-scope warnings;
   - a **Markdown preview** in the chosen profile (shown as plain text — a
     preview never claims byte fidelity; the report's hashes do);
   - actions, gated by status.
4. Actions (`decisions/0015` gate):
   - **Copy Markdown** — GFM profile to the clipboard.
   - **Send to Obsidian** — `obsidian://new` URI (`decisions/0033`); a note
     larger than 200 KB falls back with a message to copy or download instead.
   - **Download bundle** — the deterministic ZIP (`decisions/0017`), with an
     _include raw HTML_ toggle (default on for articles, off for
     conversations).
   - **Profile** selector — Obsidian / GFM / CommonMark.

## Export gate

- `failed` → all export actions are disabled; the reason is shown.
- `partial` → actions are enabled, a **non-dismissible** warning banner is
  shown, and the same diagnostics are written into the bundle.
- `complete_with_warnings` / `complete` → actions enabled.

## Known limitations (MVP)

- Chromium Manifest V3 only (`decisions/0007`).
- The content-script bundle is ~105 KB unminified.
- No options/settings page — profile and raw-HTML are per-capture toggles;
  there is no persisted vault name yet.
