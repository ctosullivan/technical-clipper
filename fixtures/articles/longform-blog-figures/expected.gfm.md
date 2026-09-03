# Notes on building a deterministic compiler

By J. Engineer · 12 minute read

Determinism is a property you design in, not one you test in afterwards. This post collects the decisions that mattered most on a recent project.

## Hash the meaning, not the markup

The single most useful rule was to derive every identifier from the captured meaning of a node rather than from its position in the source tree. Two inputs that mean the same thing then produce the same output.

![A block diagram of the four pipeline stages feeding a hash function](https://blog.example/img/pipeline.png)

Figure 1. Each stage is a pure function; the final hash covers the canonical form of the whole tree.

As Figure 1 shows, the hash sits at the end of a chain of pure functions. Nothing in that chain reads a clock or the network.

## Normalize early, normalize once

Whitespace, line endings, and Unicode form are all normalized at the boundary. Downstream code can then assume a single representation.

> If you find yourself normalizing the same value twice, one of the two call sites is in the wrong place.

![Bar chart of capture timings across twelve fixtures, all under 400 milliseconds](https://cdn.example/img/timings.svg)

Figure 2. Capture-plus-render timings for the fixture corpus.

## What I would do differently

- Write the fixture runner before the extractor, not after.
- Treat "unsupported" as a first-class output, with its own diagnostic.
