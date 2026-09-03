/**
 * Capture bundle assembly — `decisions/0017`.
 *
 *   <slug>/
 *   ├── content.md
 *   ├── document.json
 *   ├── manifest.json      (separates contentIdentity from event metadata)
 *   ├── diagnostics.json
 *   └── raw/page.html      (only when rawHtmlIncluded)
 *
 * Content-hash identity is promised; whole-bundle byte identity is not (the
 * manifest embeds the capture timestamp). Two captures of identical content
 * produce identical `content.md` / `document.json` / hashes.
 */
import type { DocumentIR } from '../ir/document.js';
import { canonicalize, canonicalizePretty } from '../canonical.js';
import { hashCanonicalExcluding, sha256Hex } from '../hash.js';
import { deriveExportStatus } from '../diagnostics/status.js';
import { renderMarkdown } from '../render/markdown.js';
import type { MarkdownProfile } from '../render/profiles.js';
import { buildZip, type ZipEntry } from './zip.js';

export const BUNDLE_FORMAT_VERSION = '1.0.0';

export interface AssembleOptions {
  profile: MarkdownProfile;
  /** Sanitized `raw/page.html` content; when provided and `includeRawHtml`. */
  rawPageHtml?: string | null;
  includeRawHtml?: boolean;
  frontmatter?: Record<string, string | string[]>;
}

export interface BundleResult {
  /** The deterministic ZIP archive. */
  zip: Uint8Array;
  /** The files, for inspection / non-ZIP consumers. */
  files: Record<string, string>;
  manifest: BundleManifest;
}

export interface BundleManifest {
  bundleFormatVersion: string;
  irSchemaVersion: number;
  normalizationRulesets: DocumentIR['hashes']['normalizationRulesets'];
  extractorVersion: string;
  captureKind: DocumentIR['captureKind'];
  markdownProfile: MarkdownProfile;
  contentIdentity: {
    documentContentIdentity: string;
    markdown: string;
    rawPageHtml: string | null;
    blocks: Record<string, string>;
  };
  event: {
    timestamp: string;
    sourceUrl: string;
    canonicalUrl: string | null;
    captureScope: string;
    pageLoadState: DocumentIR['source']['pageLoadState'];
  };
  exportStatus: string;
  diagnosticsSummary: Record<string, number>;
  rawHtmlIncluded: boolean;
}

function slugFor(doc: DocumentIR): string {
  const title = (doc.source.title ?? 'capture')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48);
  const idPrefix = doc.hashes.documentContentIdentity.slice(0, 8) || '00000000';
  return `${title || 'capture'}-${idPrefix}`;
}

/** Assemble the capture bundle for a validated `DocumentIR`. */
export function assembleBundle(
  doc: DocumentIR,
  options: AssembleOptions,
): BundleResult {
  const render = renderMarkdown(doc, {
    profile: options.profile,
    frontmatter: options.frontmatter,
  });
  const contentMd = render.markdown;

  // Merge any render diagnostics into a copy of the doc for the bundle.
  const bundleDoc: DocumentIR = {
    ...doc,
    diagnostics: [...doc.diagnostics, ...render.diagnostics],
  };

  const decision = deriveExportStatus(bundleDoc.diagnostics);
  const kind = doc.captureKind;
  const includeRaw =
    options.includeRawHtml ?? (kind === 'conversation' ? false : true);
  const rawHtml =
    includeRaw && options.rawPageHtml ? options.rawPageHtml : null;

  const contentIdentity = {
    documentContentIdentity:
      doc.hashes.documentContentIdentity ||
      hashCanonicalExcluding(doc, [
        'captureTimestamp',
        'observedAt',
        'documentContentIdentity',
      ]),
    markdown: sha256Hex(contentMd),
    rawPageHtml: rawHtml ? sha256Hex(rawHtml) : null,
    blocks: doc.hashes.blocks,
  };

  const counts: Record<string, number> = {
    info: 0,
    warning: 0,
    error: 0,
    fatal: 0,
  };
  for (const d of bundleDoc.diagnostics)
    counts[d.severity] = (counts[d.severity] ?? 0) + 1;

  const manifest: BundleManifest = {
    bundleFormatVersion: BUNDLE_FORMAT_VERSION,
    irSchemaVersion: doc.schemaVersion,
    normalizationRulesets: doc.hashes.normalizationRulesets,
    extractorVersion: doc.source.extractorVersion,
    captureKind: kind,
    markdownProfile: options.profile,
    contentIdentity,
    event: {
      timestamp: doc.source.captureTimestamp,
      sourceUrl: doc.source.sourceUrl,
      canonicalUrl: doc.source.canonicalUrl,
      captureScope: doc.source.captureScope,
      pageLoadState: doc.source.pageLoadState,
    },
    exportStatus: decision.status,
    diagnosticsSummary: counts,
    rawHtmlIncluded: rawHtml !== null,
  };

  const slug = slugFor({
    ...doc,
    hashes: {
      ...doc.hashes,
      documentContentIdentity: contentIdentity.documentContentIdentity,
    },
  });

  const documentJson = canonicalizePretty({
    ...bundleDoc,
    hashes: {
      ...bundleDoc.hashes,
      documentContentIdentity: contentIdentity.documentContentIdentity,
      markdown: contentIdentity.markdown,
      rawPageHtml: contentIdentity.rawPageHtml,
    },
  });
  const diagnosticsJson = canonicalizePretty({
    exportStatus: decision.status,
    canExport: decision.canExport,
    requiresVisibleWarning: decision.requiresVisibleWarning,
    diagnostics: bundleDoc.diagnostics,
  });
  const manifestJson = canonicalizePretty(manifest);

  const files: Record<string, string> = {
    [`${slug}/content.md`]: contentMd,
    [`${slug}/document.json`]: documentJson,
    [`${slug}/manifest.json`]: manifestJson,
    [`${slug}/diagnostics.json`]: diagnosticsJson,
  };
  if (rawHtml !== null) {
    files[`${slug}/raw/page.html`] = rawHtml;
    files[`${slug}/raw/README.txt`] =
      'raw/page.html is the cloned page DOM with <script>/<style>, event-handler\n' +
      'attributes, and (for conversations) non-selected-branch subtrees removed.\n' +
      'It is an archival courtesy, not a parallel source of truth.\n';
  }

  const entries: ZipEntry[] = Object.entries(files).map(([path, content]) => ({
    path,
    data: new TextEncoder().encode(content),
  }));

  return { zip: buildZip(entries), files, manifest };
}

/** Convenience: the compact canonical JSON of the manifest (for hashing/tests). */
export function manifestCompact(manifest: BundleManifest): string {
  return canonicalize(manifest);
}
