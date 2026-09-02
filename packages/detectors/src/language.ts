/**
 * Code language inference — `decisions/0025`.
 *
 * Prefer page-declared evidence (class token, `data-*` attribute, info string).
 * Fall back to a small, conservative heuristic that only fires on strong,
 * unambiguous signals; a heuristic guess is always low-confidence and paired
 * with `TC-EXTRACT-LANG-LOWCONF`.
 */
import {
  normalizeInfoString,
  type LanguageEvidence,
} from '@technical-clipper/core';

export interface LanguageResult {
  language: string | null;
  evidence: LanguageEvidence;
  /** True when the result is a heuristic guess (low confidence). */
  lowConfidence: boolean;
}

const CLASS_TOKEN =
  /(?:^|\s)(?:language|lang|brush:|highlight-source)-?([a-z0-9+#-]+)/i;

/** Extract a declared language token from an element's class / data attributes. */
function declaredToken(el: Element): string | null {
  const cls = el.getAttribute('class') ?? '';
  const m = cls.match(CLASS_TOKEN);
  if (m && m[1] && m[1] !== 'none' && m[1] !== 'plain' && m[1] !== 'text') {
    return m[1];
  }
  for (const attr of ['data-lang', 'data-language', 'data-code-language']) {
    const v = el.getAttribute(attr);
    if (v) return v;
  }
  return null;
}

const HEURISTICS: { lang: string; test: RegExp }[] = [
  { lang: 'html', test: /<\/?[a-z][\s\S]*>/i },
  { lang: 'json', test: /^\s*[[{][\s\S]*[\]}]\s*$/ },
  { lang: 'python', test: /^\s*(?:def |class |import |from \w+ import )/m },
  { lang: 'shell', test: /^\s*(?:\$ |# |sudo |npm |pnpm |yarn |git |cd )/m },
  {
    lang: 'typescript',
    test: /:\s*(?:string|number|boolean|void)\b|interface \w+|\bimport type\b/,
  },
  { lang: 'javascript', test: /\b(?:const|let|var|function)\b|=>/ },
  { lang: 'css', test: /^[.#]?[\w-]+\s*\{[^}]*:[^}]*\}/m },
  {
    lang: 'sql',
    test: /\b(?:SELECT|INSERT INTO|UPDATE|DELETE FROM|CREATE TABLE)\b/i,
  },
  { lang: 'rust', test: /\bfn \w+|\blet mut\b|::<|impl \w+ for/ },
  { lang: 'go', test: /\bfunc \w+\(|\bpackage main\b|:=/ },
];

/**
 * Infer the language for a code block.
 *
 * @param codeEl  the `<code>` / `<pre>` element the text came from
 * @param containerEl  an outer element that may carry the class (e.g. `<pre>`)
 * @param text  the extracted code text (used only for the heuristic)
 * @param infoString  an explicit info string from an adapter, if any
 */
export function inferLanguage(
  codeEl: Element,
  containerEl: Element | null,
  text: string,
  infoString?: string | null,
): LanguageResult {
  if (infoString) {
    return {
      language: normalizeInfoString(infoString),
      evidence: 'info-string',
      lowConfidence: false,
    };
  }
  const declared =
    declaredToken(codeEl) ?? (containerEl ? declaredToken(containerEl) : null);
  if (declared) {
    return {
      language: normalizeInfoString(declared),
      evidence: 'class-token',
      lowConfidence: false,
    };
  }
  for (const h of HEURISTICS) {
    if (h.test.test(text)) {
      return {
        language: h.lang,
        evidence: 'inferred-heuristic',
        lowConfidence: true,
      };
    }
  }
  return { language: null, evidence: 'none', lowConfidence: false };
}
