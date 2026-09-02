/**
 * Wikipedia infobox / page-furniture policy — `decisions/0024`.
 *
 * These are selector lists fed to the generic noise + table code
 * (`decisions/0005` — no Wikipedia scraper). One exported constant; changing
 * it is an ADR + regenerated fixtures.
 */

/** Removed within the article root, recorded as `RemovedRegion`. */
export const WIKIPEDIA_DROP_SELECTORS: readonly string[] = [
  '.navbox',
  '.vertical-navbox',
  '.sistersitebox',
  '.mw-editsection',
  '.mw-jump-link',
  '.mw-indicators',
  '.noprint',
  '#siteSub',
  '#contentSub',
  '#toc',
  '.toc',
  '.catlinks',
  '#catlinks',
  '.mw-empty-elt',
  '#coordinates',
  '.printfooter',
];

/** Kept even though they look like furniture (they are article content). */
export const WIKIPEDIA_KEEP_SELECTORS: readonly string[] = [
  '.hatnote',
  '.infobox',
  'table.infobox',
];

/** Text fragments stripped from inside reference entries. */
export const WIKIPEDIA_REFERENCE_NOISE_SELECTORS: readonly string[] = [
  '.mw-cite-backlink',
];

/** True when the page looks like a MediaWiki / Wikipedia article. */
export function looksLikeWikipedia(doc: Document, url: string): boolean {
  if (/\bwikipedia\.org\//.test(url) || /\/wiki\//.test(url)) return true;
  return (
    doc.querySelector('.mw-parser-output') !== null ||
    doc.querySelector('#mw-content-text') !== null
  );
}
