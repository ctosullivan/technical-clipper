# 0018. ClipSpec override seam and adapter/detector versioning

## Status

Accepted (Phase 1 planning). Minimal seam implemented in Phase 6; exercised by
Phase 10 corpus work.

## Context

§ 2.2 and `decisions/0002` require that only reviewed, versioned, fixture-backed
rules change extraction behaviour. § 5 defers a "visual rule editor" and
"automatic schema/adapter updates" as non-goals, but § 10 still requires "the
minimum ClipSpec override seam" and "adapter versioning" to exist so those
deferred systems have something to attach to later.

## Decision

### Adapter and detector versioning

- Every `Adapter` and `ComponentDetector` carries a semver `version`.
- The exact versions used are recorded in `DocumentIR` provenance and in
  `manifest.json` (`0017`).
- A change to an adapter/detector that alters any fixture's expected output is
  a **minor or major** version bump with: regenerated expected fixtures in the
  same commit, a `CHANGELOG.md` entry, and an ADR when the behaviour change is
  non-obvious (`AGENTS.md`).
- Fixtures are pinned to the version that produced them (`provenance.json`
  records `producedByAdapterVersion` / `producedByDetectorVersions`).

### ClipSpec — the minimal seam

A ClipSpec is a declarative, versioned JSON document, checked into
`packages/adapters/clipspecs/` for the MVP (no distribution system, no editor —
those stay non-goals). Schema:

```
ClipSpec {
  id: string                 // stable, e.g. 'mdn-docs'
  version: string            // semver
  match: { urlGlob: string[] }          // deterministic, offline
  rules: {
    articleRootSelector?: string,        // force main-content root
    dropSelectors?: string[],            // mark as noise -> RemovedRegion
    keepSelectors?: string[],            // protect from noise removal
    forceDetector?: { selector: string; detectorId: string }[],
    suppressDetector?: { selector: string; detectorId: string }[],
    markdownProfile?: 'commonmark' | 'gfm' | 'obsidian',
    frontmatter?: Record<string, string | string[]>,   // obsidian profile only
  }
}
```

### Resolution and precedence

- `resolveClipSpec(url): ClipSpec | null` — pure, offline, first match by
  declared order; ambiguous match (two specs, same specificity) ⇒ `warning`
  diagnostic and the lexicographically-first `id` wins (deterministic).
- Effective-config precedence, lowest to highest:
  1. built-in defaults,
  2. matched ClipSpec `rules`,
  3. explicit user toggles in the extension UI (profile, include raw HTML).
- A ClipSpec is applied **before** detector precedence resolution
  (`forceDetector`/`suppressDetector` edit the candidate set) and **before**
  general extraction (`articleRootSelector`/`dropSelectors`).
- Every ClipSpec has at least one fixture proving its effect; a ClipSpec with
  no fixture fails CI (Phase 10 lint check).

### AI boundary

An AI may draft a ClipSpec or an adapter diff. It lands only through the normal
review + passing-fixture path (`decisions/0002`). Nothing loads a ClipSpec from
the network or from user-writable storage at runtime in the MVP.

## Alternatives considered

- **No ClipSpec at all until post-MVP** — rejected: § 10 explicitly requires
  the seam; retrofitting a config precedence chain later is more disruptive
  than defining the thin version now.
- **ClipSpec as executable JS/TS** — rejected: not reviewable as data, invites
  arbitrary logic, harder to sandbox, conflicts with the "declarative rules"
  intent of `decisions/0002`.
- **Per-user ClipSpec storage in the extension** — rejected for MVP: turns
  into the deferred rule-editor product; revisit via ADR.

## Consequences

- Phase 6 ships `resolveClipSpec` + schema validation + the precedence merge,
  with 1–2 example ClipSpecs used by the corpus.
- Phase 9's extension UI exposes only the two user toggles named above.
- The deferred distribution/editor systems (non-goals) now have a concrete
  data contract to target when a future ADR reopens them.
