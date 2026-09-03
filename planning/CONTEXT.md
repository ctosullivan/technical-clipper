# Context — current resumption checkpoint

This file is a single current snapshot, not a log. Overwrite it at every
natural stopping point. History lives in git and `CHANGELOG.md` — see
`AGENTS.md` § "Roadmap and context".

## Active phase

**All ten roadmap phases are `done`.** Phase 10 (corpus, evaluation, security
review, packaging) is complete except its final step: promoting the MVP
release, which is **blocked on explicit user approval** by design
(`AGENTS.md` § commit/release, planning-prompt § 16).

## Next concrete action

**Request explicit approval to release the MVP.** Nothing else should be done
autonomously. On approval, and only then:

1. Move the `[Unreleased]` block in `CHANGELOG.md` to a dated `## [0.1.0] - <date>`
   (or the agreed version), keeping a fresh empty `[Unreleased]`.
2. Bump `version` in `package.json`, `packages/extension/package.json`, and
   `packages/extension/manifest.json` to match.
3. `git tag` the release commit.
4. Only if separately authorized: package for a store, sign, submit.

If approval is **not** given, leave everything as-is — the repo is in a
consistent "MVP candidate" state.

## Last completed work

Phase 10, committed in two parts:

- `fix(phase-10): harden extraction for real Wikipedia HTML` — 5 revision-pinned
  Wikipedia fixtures + the extractor fixes they surfaced (root ascend/descend,
  link-density exemptions, inline-run coalescing, `<dl>`/`<dd>` + code-table
  handling, `<style>`-text exclusion, `TC-VALIDATE-DUP-ID` scoped to structural
  nodes).
- `feat(phase-10): corpus, gates, evaluation, security review, packaging` —
  corpus to § 12 minimums (22 articles / 19 code / 4 conversations, 87 code
  blocks), `scripts/{fixture-lint,gates,package-extension,naive-clip}.mjs`,
  `docs/evaluation/**` (gate map, timing env, Obsidian checklist, security
  review, comparative benchmark), doc finalization, MVP `CHANGELOG.md` entry
  under `[Unreleased]` (not promoted), all docs → "MVP candidate".

## Verification state

`pnpm` not on PATH; use `npx --yes pnpm@9.12.0 <cmd>`.
`npx --yes pnpm@9.12.0 run ci` — green: `format:check`, `lint`, `tsc -b`, 160
tests, `skill:verify`, `fixture-lint` (PASS, 22/19/4, 87 code blocks),
`gates` (gates 1–15 PASS, timing worst ~0.6 s).
`node scripts/capture-fixture.mjs --all` — PASS.
`node scripts/gates.mjs` — PASS (0 gates failing).
`pnpm --filter @technical-clipper/extension run build` + `pnpm package:extension`
— produce a loadable `dist/` and `dist-artifacts/*.zip`.

## Working-tree state

Git repo on `master`, tracking `origin/master`
(<https://github.com/ctosullivan/technical-clipper.git>). Phases 0–10 pushed.
**Nothing tagged or released.** `dist/`, `dist-artifacts/`, `*.tsbuildinfo`
are gitignored.

## Unresolved decisions

None blocking. Post-MVP items (each needs its own ADR before scheduling):
Firefox/Safari, native Obsidian plugin, ClipSpec editor, image mirroring,
a full sanitiser for `raw/page.html` if a future feature renders it
(security-review finding S-1), an SRI-style manifest for the packaged zip.
