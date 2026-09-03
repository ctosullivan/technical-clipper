# codegroup-tabs — commentary

**Input:** a Docusaurus `<Tabs>` install block offering the same command for
npm, pnpm, yarn, bun, and deno. Only the npm panel is visible; the other four
are in the DOM but hidden (`hidden` attribute / `display:none`).

## Naive path (`naive.md`)

```

```

npm install my-lib

```

```

- Only the visible panel survives. `pnpm add my-lib`, `yarn add my-lib`,
  `bun add my-lib`, and `deno add my-lib` are silently dropped.
- A reader on a pnpm project now has to guess the pnpm form, and nothing in the
  output signals that alternatives existed.
- Language (`shell`) is lost.

## This pipeline (`ours.md`)

````
**npm**

```shell
npm install my-lib
```

**pnpm**

```shell
pnpm add my-lib
```

**yarn**

```shell
yarn add my-lib
```

**bun**

```shell
bun add my-lib
```

**deno**

```shell
deno add my-lib
```
````

- The tab group is detected as a `CodeGroupIR`; every member is retained with
  its label, in tab order.
- Each member keeps its exact bytes and its language.
- `decisions/0019`: the GFM/CommonMark profiles render the alternatives as
  labelled sequential blocks (no data loss); the Obsidian profile can render
  them as a callout-grouped set.
