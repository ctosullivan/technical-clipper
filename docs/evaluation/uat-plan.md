# MVP user-acceptance test (UAT) plan

Run once per release candidate by a human, in a real Chromium, against the
loaded extension. Two parts:

- **Part A — fixture scenarios**: deterministic, expected results are known.
- **Part B — live-web targets**: real pages that exercise each detector/adapter
  and the known hard cases. Results are judged, not asserted.

File the completed copy (tester, date, browser version, per-target notes)
next to this plan. Manual gates 16 (Obsidian) and 17 (comparative) are folded
into the scenarios below.

- **Tester:** ______________ **Date:** ____________
- **Chromium version:** ____________ **OS:** ____________
- **Build under test:** `dist-artifacts/technical-clipper-<version>+<sha>/`
  (`pnpm package:extension`) — `<sha>`: ____________

---

## 0. Setup

1. `pnpm install && pnpm run ci` — green? (PASS / FAIL) ____
2. `pnpm package:extension` — tag: __________ zip size: ______
3. Serve the fixture corpus: `npx -y serve fixtures -l 8080`. Confirm
   `http://localhost:8080/articles/wikipedia-jwt/source.html` loads.
4. `chrome://extensions` → Developer mode ON → **Load unpacked** → the
   unpacked folder under `dist-artifacts/`. No errors on the page or in the
   service-worker console.
5. Toolbar shows the action titled **"Clip page (technical-clipper)"**. ____

The extension has **no host permissions** — it only runs on the tab whose
button you click, for that click. Every live target below is safe to test:
open it, click the action, inspect the results tab.

---

# Part A — fixture scenarios

### A1. Ordinary article — structure + chrome removal

Open `…/articles/noisy-docs-portal/source.html` → **Clip page**.

| Check             | Expected                                                                                            | P/F |
| ----------------- | --------------------------------------------------------------------------------------------------- | --- |
| Results tab opens | report + preview + actions                                                                          |     |
| Status            | `complete` / `complete_with_warnings`                                                               |     |
| Preview           | heading, paragraphs, the bash code block                                                            |     |
| Chrome            | no cookie banner, masthead nav, breadcrumbs, sidebar, "Recommended for you", newsletter, footer nav |     |
| Report            | sections kept, code counts, `RemovedRegion` count > 0                                               |     |

### A2. Real Wikipedia — the hard case

Open `…/articles/wikipedia-jwt/source.html` → **Clip page**.

| Check                                            | Expected                                     | P/F |
| ------------------------------------------------ | -------------------------------------------- | --- |
| Status                                           | `complete_with_warnings`                     |     |
| Lead prose                                       | present; inline `[n]` citation markers kept  |     |
| Infobox                                          | one clean table, not fragments               |     |
| Interlanguage list / edit links / navboxes / TOC | absent                                       |     |
| Code blocks                                      | `{ "alg": "HS256", … }` present, byte-intact |     |
| References                                       | ~46 collected (see report)                   |     |

Repeat with `wikipedia-tail-call` (35 exact code blocks; side-by-side code
tables become sequential exact blocks + a "table flattened" note).

### A3. Code fidelity

For `code/highlightjs-line-number-table`,
`code/adversarial-backtick-tilde-runs`, `code/docusaurus-five-tabs`:

| Check                                               | Expected                            | P/F |
| --------------------------------------------------- | ----------------------------------- | --- |
| Line-number gutter                                  | absent; lines intact                |     |
| Copy-button / language-pill text                    | absent                              |     |
| Backtick/tilde runs                                 | fence widened, block not broken     |     |
| 5-tab install block                                 | all five package managers, labelled |     |
| Copy a block from the preview, paste into an editor | identical to source                 |     |

### A4. ChatGPT conversation

`…/conversations/branch-switcher/source.html` → **Clip page**.

| Check           | Expected                                   | P/F |
| --------------- | ------------------------------------------ | --- |
| Roles / order   | user / assistant, correct order            |     |
| Branch          | selected branch only; report notes "2 / 3" |     |
| Raw-HTML toggle | defaults **off** for conversations         |     |

Then `conversations/streaming-in-progress/source.html`: status **`failed`**,
exports **disabled**, reason shown.

### A5. Export gate

| Fixture                               | Status     | Actions  | Warning                | P/F |
| ------------------------------------- | ---------- | -------- | ---------------------- | --- |
| `articles/simple-blog-post`           | `complete` | enabled  | none                   |     |
| `articles/section-loss`               | `partial`  | enabled  | non-dismissible banner |     |
| `articles/no-credible-root`           | `failed`   | disabled | reason shown           |     |
| `conversations/streaming-in-progress` | `failed`   | disabled | reason shown           |     |

### A6. Determinism

Clip `articles/wikipedia-iso-8601` twice, download the bundle each time.

| Check                                                | Expected       | P/F |
| ---------------------------------------------------- | -------------- | --- |
| `document.json` content hash in both `manifest.json` | identical      |     |
| `content.md` (GFM profile) between runs              | byte-identical |     |

### A7. Security / privacy spot checks

| Check                                        | Expected                                                | P/F |
| -------------------------------------------- | ------------------------------------------------------- | --- |
| Fixture with an inline `<script>` in content | preview shows it as fenced ` ```html ` text, never runs |     |
| DevTools → Network during a clip             | zero requests from the extension                        |     |
| `chrome://extensions` → Details              | activeTab, scripting, storage; no site access           |     |
| Reopen browser                               | no stored capture; results page empty until a new clip  |     |
| Open a page, do **not** click the action     | nothing captured (service-worker console)               |     |

---

# Part B — live-web targets

Pick at least one target per row. Good, stable choices are suggested; any
equivalent page works. For each: clip it, then judge the preview + report
against the "What to verify" column and note **PASS / PARTIAL / FAIL** with a
one-line reason.

## B1. Plain semantic articles (baseline)

| Target                                                                   | Why                                           | What to verify                                                                                                       |
| ------------------------------------------------------------------------ | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| An MDN article, e.g. `developer.mozilla.org/en-US/docs/Web/HTTP/Headers` | clean `<article>`, tables, notes, inline code | headings + tables + notes kept; left nav / "In this article" / feedback widgets / footer removed; status `complete*` |
| A personal engineering blog post (e.g. a Julia Evans or Dan Luu post)    | minimal markup, footnotes                     | prose order intact; footnotes/links preserved; no share bar or comments section                                      |
| A news article behind a soft cookie wall (e.g. a Guardian or BBC piece)  | GDPR banner, related-stories rails            | article body only; consent UI + "read more" rails + newsletter removed                                               |

## B2. Wikipedia (multiple shapes)

| Target                                                | Why                                      | What to verify                                                                                                  |
| ----------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `en.wikipedia.org/wiki/HTTP`                          | infobox, wide protocol tables, many refs | infobox as one table; tables intact; `[n]` markers + reference list kept; navboxes/TOC/edit links gone          |
| `en.wikipedia.org/wiki/Quicksort`                     | code samples, math, figures              | code blocks exact; images/figures with captions; math rendered as text or MathML fallback, not dropped silently |
| `en.wikipedia.org/wiki/COVID-19_pandemic` (very long) | size + timing                            | completes; capture+preview feels < ~2 s; no truncation                                                          |
| An RTL article, e.g. `he.wikipedia.org/wiki/JSON`     | right-to-left text                       | text not reversed/mangled; direction preserved or noted                                                         |

## B3. Documentation frameworks (tab groups + code)

| Target                                                                        | Framework                        | What to verify                                                                                  |
| ----------------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------- |
| `redux.js.org/tutorials/essentials/part-2`                                    | Docusaurus + `<Tabs>`            | every tab of a code group retained with labels; sidebar/nav/"Edit this page" removed            |
| `vitejs.dev/guide/` or `vitest.dev/guide/`                                    | VitePress                        | fenced code with language; group tabs (if any) all kept; no copy-button text                    |
| `docs.github.com/en/actions` article                                          | custom docs                      | YAML code blocks exact; callouts kept; version picker / "Was this helpful" removed              |
| `squidfunk.github.io/mkdocs-material/reference/`                              | MkDocs Material **content tabs** | tab detection: either all tabs kept, or a clear diagnostic — never a silent single-tab collapse |
| A Nextra or Starlight docs page (e.g. `nextra.site`, `starlight.astro.build`) | other frameworks                 | code + structure retained; framework chrome removed                                             |

## B4. Syntax-highlighter coverage

| Target                                                      | Highlighter                       | What to verify                                                                    |
| ----------------------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------- |
| `css-tricks.com` article with code, or `prismjs.com` itself | Prism token spans                 | code text is the source bytes, not token-span soup; language from the class       |
| A Hugo/Jekyll blog using highlight.js (many dev blogs)      | highlight.js                      | exact text; language inferred with a low-confidence diagnostic if unlabelled      |
| `www.php.net/manual/en/function.array-map.php`              | PHP.net's own highlighter         | code exact; user-notes section handled (kept or removed deliberately)             |
| A GitHub rendered README (`github.com/<user>/<repo>`)       | GitHub's highlighter + task lists | fenced code exact; task-list checkboxes; the file-browser / header chrome removed |

## B5. Terminal / shell content

| Target                                   | Why                                     | What to verify                                                                                                                                  |
| ---------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| A DigitalOcean "How To" tutorial         | `$`-prompt blocks, output blocks        | prompt vs output split is reasonable; if inferred, a `TC-DETECT-TERMINAL-AMBIGUOUS` diagnostic + `approximate` confidence — not a false `exact` |
| An Arch Wiki page (`wiki.archlinux.org`) | `# root` / `$ user` prompts, note boxes | commands exact; note/warning boxes kept; nav removed                                                                                            |

## B6. ChatGPT (the adapter)

| Target                                                                                   | Why               | What to verify                                                                                    |
| ---------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------- |
| A real `chatgpt.com/c/…` conversation you own, linear, with a code block and a table     | base case         | roles + order correct; code exact; table preserved; raw-HTML toggle off                           |
| The same conversation after using **Edit** on a prompt (creates a branch, shows "n / m") | branch scope      | only the visible branch captured; report notes the branch indicator; hidden branch content absent |
| A conversation **mid-stream** (clip while it is still generating)                        | streaming guard   | status `failed`, exports disabled, "streaming observed" reason                                    |
| A conversation with a rendered image / file attachment                                   | attachment policy | attachment recorded as metadata only; not fetched; no broken-image garbage in `content.md`        |

## B7. Known-hard / adversarial (expect honest degradation, not silent loss)

| Target                                                                                               | Why                               | What to verify                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `www.typescriptlang.org/play` or a StackBlitz / VS Code docs page with an embedded **Monaco** editor | virtualized editor                | `TC-DETECT-VIRTUALIZED`, status `partial`, export still possible with a visible warning — **never** a confident partial-code capture                 |
| A CodePen or Observable notebook (**CodeMirror**)                                                    | virtualized editor                | same: detected as unsupported/approximate with a diagnostic                                                                                          |
| A Notion public page                                                                                 | virtualized blocks, lazy render   | either a reasonable capture or a clear "content may be incomplete" (`partial`); scroll the whole page first and note whether that changes the result |
| A Medium article                                                                                     | lazy images, paywall, injected UI | body captured; "member-only" / claps / responses removed; lazy-image warning acceptable                                                              |
| An X/Twitter thread or a long Reddit comment page                                                    | infinite scroll                   | report flags likely incompleteness (`contentKnownIncomplete` / `partial`); does not claim `complete`                                                 |
| A page with a huge inline data-URI image or `<canvas>`-rendered code                                 | asset/edge handling               | no crash; canvas code is reported unsupported, not invented                                                                                          |

## B8. Obsidian round-trip (gate 16)

Use a scratch Obsidian vault (≥ 1.5). Test with **3 captures**: a short MDN
article, a Wikipedia article > 200 KB Markdown, and a ChatGPT conversation.

| Check                                                               | Expected                                                                                                           | P/F |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --- |
| **Send to Obsidian** (short article)                                | note created, same content, frontmatter shows as properties                                                        |     |
| Headings / nested lists / blockquotes / tables / figures / callouts | render correctly                                                                                                   |     |
| Code blocks                                                         | highlighted per language; no gutter/copy contamination                                                             |     |
| Large capture (> 200 KB)                                            | fallback message shown; **Copy** + **Download** still work                                                         |     |
| **Copy Markdown**                                                   | clipboard = GFM profile                                                                                            |     |
| **Download bundle**                                                 | `.zip` with `content.md`, `document.json`, `manifest.json`, `diagnostics.json` (+ `raw/page.html` when toggled on) |     |
| Profile selector (Obsidian / GFM / CommonMark)                      | preview re-renders                                                                                                 |     |
| Broken/remote image in the note                                     | degrades to a plain link, not an error                                                                             |     |

## B9. Comparative benchmark (gate 17)

For each `docs/evaluation/comparative/<case>/`: run the same input through the
current **Obsidian Web Clipper** (or MarkDownload) and compare to `ours.md`.
Confirm the failure in `commentary.md` still reproduces.

| Case                     | Difference holds?                                   | P/F |
| ------------------------ | --------------------------------------------------- | --- |
| `code-linenumber-gutter` | line numbers leak / language lost in the naive path |     |
| `codegroup-tabs`         | naive keeps only the visible tab                    |     |
| `article-citations`      | naive drops citations + reference list              |     |

---

## Sign-off

- Part A all PASS: ☐ Part B (≥ 1 target per row, no unexplained FAIL): ☐
- Blocking issues: ___________________________________________
- New bugs filed (issue #s): _________________________________
- Recommendation: **release** / **hold** (circle one)
- Signature: ______________ Date: ____________
