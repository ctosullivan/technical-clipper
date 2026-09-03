# MVP user-acceptance test (UAT) plan

Run once per release candidate by a human, in a real Chromium, against the
loaded extension. Records the manual gates (16, 17) plus an end-to-end
confirmation of the product thesis. File the completed copy (with the tester,
date, browser version, and any FAIL notes) alongside this plan.

- **Tester:** ______________ **Date:** ____________
- **Chromium version:** ____________ **OS:** ____________
- **Build under test:** `dist-artifacts/technical-clipper-<version>+<sha>/`
  (from `pnpm package:extension`) — record `<sha>`: ____________

## 0. Setup

1. `pnpm install && pnpm run ci` — must be green (record: PASS / FAIL).
2. `pnpm package:extension` — note the printed tag and zip size.
3. Serve the fixture corpus locally so content scripts can run on real URLs:
   `npx -y serve fixtures -l 8080` (or any static server). Confirm
   `http://localhost:8080/articles/wikipedia-jwt/source.html` loads.
4. `chrome://extensions` → Developer mode ON → **Load unpacked** →
   the unpacked folder under `dist-artifacts/`. No errors in the extensions
   page or the service-worker console.

Expected: the toolbar shows the action with title **"Clip page
(technical-clipper)"**.

---

## 1. Ordinary article — structure + chrome removal

**Steps:** open `http://localhost:8080/articles/noisy-docs-portal/source.html`
→ click **Clip page**.

| Check             | Expected                                                                                                                   | P/F |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------- | --- |
| Results tab opens | report + preview + actions visible                                                                                         |     |
| Status            | `complete` or `complete_with_warnings`                                                                                     |     |
| Preview body      | the article heading + paragraphs + the bash code block                                                                     |     |
| Chrome            | no cookie banner, masthead nav, breadcrumbs, sidebar, "Recommended for you", newsletter form, or footer nav in the preview |     |
| Report            | shows sections kept, code counts, and `RemovedRegion` count > 0                                                            |     |

---

## 2. Real Wikipedia page — the hard case

**Steps:** open
`http://localhost:8080/articles/wikipedia-jwt/source.html` → **Clip page**.

| Check                                            | Expected                                                                           | P/F |
| ------------------------------------------------ | ---------------------------------------------------------------------------------- | --- |
| Status                                           | `complete_with_warnings` (lazy-image + language-inference warnings are acceptable) |     |
| Lead prose                                       | first paragraphs present, inline `[n]` citation markers kept                       |     |
| Infobox                                          | rendered as a single clean table, not broken fragments                             |     |
| Interlanguage list / edit links / navboxes / TOC | **absent**                                                                         |     |
| Code blocks                                      | the `{ "alg": "HS256", … }` JSON blocks present and byte-intact                    |     |
| References                                       | report shows ~46 references collected                                              |     |
| Attribution                                      | frontmatter `source_url` points at the article; provenance is in the bundle        |     |

Repeat for `wikipedia-tail-call` (35 code blocks, side-by-side code tables →
expect sequential exact code blocks + a "table flattened" note).

---

## 3. Code fidelity — the core promise

For each of `code/highlightjs-line-number-table`,
`code/adversarial-backtick-tilde-runs`, `code/docusaurus-five-tabs`:

| Check                                                      | Expected                                                               | P/F |
| ---------------------------------------------------------- | ---------------------------------------------------------------------- | --- |
| Line-number gutter                                         | absent from the code text; lines intact                                |     |
| Copy-button / language-pill text                           | absent                                                                 |     |
| Backtick/tilde runs                                        | fence widened so the block is not broken                               |     |
| 5-tab install block                                        | **all five** package managers present with labels (not just npm)       |     |
| Language                                                   | shown on the fence where known; low-confidence ones carry a diagnostic |     |
| Select the byte in the preview, copy, paste into an editor | identical to the source code                                           |     |

---

## 4. ChatGPT conversation

**Steps:** open `http://localhost:8080/conversations/branch-switcher/source.html`
→ **Clip page**.

| Check            | Expected                                                                       | P/F |
| ---------------- | ------------------------------------------------------------------------------ | --- |
| Roles            | user / assistant turns in the right order                                      |     |
| Branch           | only the selected branch captured; report notes the branch indicator ("2 / 3") |     |
| Raw-HTML toggle  | **defaults off** for conversations                                             |     |
| Code in messages | preserved exactly                                                              |     |

Then `conversations/streaming-in-progress/source.html` → **Clip page**:
status **`failed`**, all export actions **disabled**, reason shown
(streaming observed).

---

## 5. Export gate

| Fixture                               | Expected status | Export actions | Warning                    | P/F |
| ------------------------------------- | --------------- | -------------- | -------------------------- | --- |
| `articles/simple-blog-post`           | `complete`      | enabled        | none                       |     |
| `articles/section-loss`               | `partial`       | enabled        | **non-dismissible** banner |     |
| `articles/no-credible-root`           | `failed`        | **disabled**   | reason shown               |     |
| `conversations/streaming-in-progress` | `failed`        | **disabled**   | reason shown               |     |

---

## 6. Obsidian handoff (gate 16)

Use a scratch Obsidian vault (≥ 1.5).

| Check                                                        | Expected                                                                                                                   | P/F |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | --- |
| **Send to Obsidian** on a small article                      | note created with the same content; frontmatter shows as properties                                                        |     |
| Headings / nested lists / blockquotes / tables / figures     | render correctly                                                                                                           |     |
| Code blocks                                                  | highlighted for their language; no contamination                                                                           |     |
| Large capture (e.g. `wikipedia-iso-8601`, > 200 KB Markdown) | falls back with the "copy or download instead" message; Copy + Download still work                                         |     |
| **Copy Markdown**                                            | clipboard holds the GFM profile                                                                                            |     |
| **Download bundle**                                          | a `.zip` with `content.md`, `document.json`, `manifest.json`, `diagnostics.json` (+ `raw/page.html` when the toggle is on) |     |
| Profile selector                                             | switching to CommonMark / Obsidian re-renders the preview                                                                  |     |

---

## 7. Determinism

**Steps:** clip `articles/wikipedia-iso-8601` twice; download the bundle each
time.

| Check                                                | Expected                    | P/F |
| ---------------------------------------------------- | --------------------------- | --- |
| `document.json` content hash in both `manifest.json` | identical                   |     |
| `content.md` (GFM/CommonMark profile)                | byte-identical between runs |     |

---

## 8. Security / privacy spot checks

| Check                                                                           | Expected                                                       | P/F |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------- | --- |
| Capture a page with an inline `<script>` in content (e.g. add one to a fixture) | preview shows it as fenced ` ```html ` text, never executes    |     |
| DevTools → Network, during a clip                                               | **zero** requests attributable to the extension                |     |
| `chrome://extensions` → the extension → Details                                 | permissions: activeTab, scripting, storage; **no** site access |     |
| After closing the browser and reopening                                         | no stored capture; results page is empty until a new clip      |     |
| Navigate to a page and do **not** click the action                              | nothing is captured (check the service-worker console)         |     |

---

## 9. Comparative benchmark (gate 17)

For each `docs/evaluation/comparative/<case>/`: open `input.html` (or the named
fixture) in the current **Obsidian Web Clipper** (or MarkDownload) and compare
its output to `ours.md`. Confirm the failure described in `commentary.md` still
reproduces (line numbers leak / tabs collapse / citations drop).

| Case                     | Difference still holds? | P/F |
| ------------------------ | ----------------------- | --- |
| `code-linenumber-gutter` |                         |     |
| `codegroup-tabs`         |                         |     |
| `article-citations`      |                         |     |

---

## Sign-off

- All sections PASS: ☐ &nbsp; PASS with noted issues: ☐ &nbsp; FAIL: ☐
- Blocking issues: ___________________________________________
- Recommendation: **release** / **hold** (circle one)
- Signature: ______________ Date: ____________
