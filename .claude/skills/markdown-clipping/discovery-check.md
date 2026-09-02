# Discovery-description check

The skill's `description` (in `SKILL.md` frontmatter) must cause an agent to
load `markdown-clipping` when — and only when — the task is about Markdown
rendering / clipping fidelity. `verify-examples.mjs` checks the description
lexically (mentions Markdown, Obsidian, CommonMark, GFM, fixture, profile;
within the 1,536-char listing cap). The table below is the human review
checklist — re-run it by judgement whenever the description changes.

## Should trigger the skill

| Prompt                                                               | Why                      |
| -------------------------------------------------------------------- | ------------------------ |
| "Implement the IR→Markdown renderer for the `gfm` profile."          | renderer work            |
| "Write the `expected.md` fixture for this article capture."          | capture fixture          |
| "Review this Obsidian frontmatter — are the property types right?"   | Obsidian export          |
| "Which profile should the Obsidian handoff use?"                     | output-profile selection |
| "The fenced code block loses a backtick — fix the fence selection."  | fence selection          |
| "Is `==highlight==` safe to emit in the GFM profile?"                | profile-purity question  |
| "Add a golden test for a table cell containing a pipe."              | rendering fidelity       |
| "Does this callout render correctly if the body line drops the `>`?" | Obsidian syntax          |

## Should NOT trigger the skill

| Prompt                                                   | Why not                                       |
| -------------------------------------------------------- | --------------------------------------------- |
| "Add a Prism code detector."                             | Phase 5 detector work — no Markdown rendering |
| "Design the `ConversationIR` type."                      | Phase 3 IR contracts                          |
| "Why is the article-root selection picking the sidebar?" | Phase 4 extraction                            |
| "Set up the extension's MV3 manifest permissions."       | Phase 9 shell                                 |
| "Write the ADR for the ZIP writer choice."               | Phase 7 bundling, not Markdown syntax         |
| "Explain the diagnostics severity levels."               | `decisions/0015`, not Markdown                |

## If the description drifts

Symptoms: the skill loads for generic "write some docs" prompts (too broad), or
fails to load for "render the IR to Markdown" (too narrow). Tighten or widen
the trigger clause in `SKILL.md`, keep it under the 1,536-char cap, and re-run
this checklist plus `pnpm run skill:verify`.
