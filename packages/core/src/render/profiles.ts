/**
 * Markdown output-profile capability matrix — `decisions/0019`, `0030`.
 *
 * A construct legal in one profile is not automatically legal in a lower one.
 * Where a profile lacks a feature the IR needs, the renderer degrades
 * deterministically and emits `TC-RENDER-DEGRADE` — it never emits a
 * higher-profile construct and never silently drops a node.
 */

export type MarkdownProfile = 'commonmark' | 'gfm' | 'obsidian';

export interface ProfileCapabilities {
  tables: boolean;
  strikethrough: boolean;
  taskLists: boolean;
  /** YAML frontmatter / properties. */
  frontmatter: boolean;
  /** Callouts, wikilinks, embeds, block refs, comments, highlights. */
  obsidianExtras: boolean;
}

export const PROFILE_CAPABILITIES: Record<
  MarkdownProfile,
  ProfileCapabilities
> = {
  commonmark: {
    tables: false,
    strikethrough: false,
    taskLists: false,
    frontmatter: false,
    obsidianExtras: false,
  },
  gfm: {
    tables: true,
    strikethrough: true,
    taskLists: true,
    frontmatter: false,
    obsidianExtras: false,
  },
  obsidian: {
    tables: true,
    strikethrough: true,
    taskLists: true,
    frontmatter: true,
    obsidianExtras: true,
  },
};
