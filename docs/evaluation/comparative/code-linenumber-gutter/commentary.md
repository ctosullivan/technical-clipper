# code-linenumber-gutter — commentary

**Input:** a two-line SQL snippet rendered by highlight.js with the
`highlightjs-line-numbers.js` plugin, which lays the code out as a `<table>`
with one column of line numbers and one column of code.

## Naive path (`naive.md`)

```

```

1SELECT id2FROM users;

```

```

- The line-number cells (`1`, `2`) are concatenated into the code text with no
  separator, corrupting every line.
- The whole snippet collapses onto one line because the table-row structure,
  not `\n`, carried the line breaks.
- `class="language-sql"` on the `<code>` is discarded — the fence has no
  language, so no downstream highlighter or Obsidian can colour it.

Anyone copying this block gets `1SELECT id2FROM users;`, which is not valid SQL.

## This pipeline (`ours.md`)

````
```sql
SELECT id
FROM users;
```
````

- The line-number column is recognised as a gutter and removed; the code column
  is reassembled with real newlines.
- The result is byte-exact against the source code cells.
- Because the text was **reconstructed** from table cells rather than read from
  a single node, the block is marked `confidence: "approximate"` and carries
  `TC-EXTRACT-RECONSTRUCT` — the capture tells you it had to rebuild the block
  rather than silently claiming exactness.
- The language is inferred (`sql`) with `TC-EXTRACT-LANG-LOWCONF` recorded.
