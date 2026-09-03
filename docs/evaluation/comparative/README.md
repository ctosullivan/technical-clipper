# Comparative benchmark (release gate 17)

`decisions/0020` gate 17 asks for a side-by-side comparison against a
general-purpose clipping path on cases it corrupts, flattens, or omits.

## Method

The "naive" column is produced by `scripts/naive-clip.mjs`: a readability-style
main-content pick followed by turndown-equivalent HTML→Markdown conversion.
This is the engine common web clippers are built on (readability + turndown /
its ports power MarkDownload, the Obsidian Web Clipper, and similar tools). It
is **not** this project's pipeline. Exact bytes from any real clipper vary by
version; the committed `naive.md` files are a faithful, reproducible snapshot of
that path's documented behaviour, not a claim about one product.

The "ours" column is the committed `expected.gfm.md` golden for the same input,
produced by the deterministic pipeline.

Re-generate:

```sh
node scripts/naive-clip.mjs <case>/input.html > <case>/naive.md
```

## Cases

| Case                      | Construct                      | What the naive path does                                                                      | What we do                                                                                             |
| ------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `code-linenumber-gutter/` | highlight.js line-number table | line numbers leak into the code text (`1SELECT id2FROM users;`), language lost                | gutter stripped, `SELECT id\nFROM users;` exact, language `sql` recovered (`approximate` + diagnostic) |
| `codegroup-tabs/`         | Docusaurus 5-tab install block | only the visible tab survives; the other four package managers are gone                       | all five alternatives retained as a labelled code group                                                |
| `article-citations/`      | Wikipedia JSON Web Token       | interlanguage list + infobox leak in; every `[n]` citation and the reference list are dropped | chrome removed, 46 references collected, `[n]` citation refs preserved, code blocks exact              |

Each case folder holds `input.html` (or a pointer to the fixture), `naive.md`,
`ours.md`, and `commentary.md`.
