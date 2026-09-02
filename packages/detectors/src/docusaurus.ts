/**
 * `code/docusaurus-tabs` detector — `decisions/0013`, `0027` (priority 30).
 *
 * Groups the individual code blocks inside a Docusaurus `<Tabs>` widget into a
 * `CodeGroupIR`, retaining every accessible alternative and its label. A tab
 * whose panel holds no code is not made a member; an `info` diagnostic
 * (`TC-ADAPT-GROUP-NONCODE`) records the omission.
 */
import {
  compositeSeed,
  computeNodeId,
  makeDiagnostic,
  DETECTOR_PRIORITY,
  type CodeBlockIR,
  type CodeGroupIR,
  type ComponentDetector,
  type DetectedComponent,
  type Diagnostic,
} from '@technical-clipper/core';
import { buildCodeBlock } from './code.js';

const DETECTOR_VERSION = '1.0.0';

function tabContainers(root: Element): Element[] {
  const found = new Set<Element>();
  for (const el of Array.from(
    root.querySelectorAll('.tabs-container, .theme-tabs, [data-tabs]'),
  )) {
    found.add(el);
  }
  // A bare tablist + tabpanels pattern.
  for (const list of Array.from(root.querySelectorAll('[role="tablist"]'))) {
    const container = list.parentElement;
    if (container && container.querySelector('[role="tabpanel"]'))
      found.add(container);
  }
  return [...found].filter(
    (el, _i, all) => !all.some((o) => o !== el && o.contains(el)),
  );
}

function panelCode(panel: Element): CodeBlockIR | null {
  const pre = panel.querySelector('pre');
  if (!pre) return null;
  const codeEl = pre.querySelector('code') ?? pre;
  const { node } = buildCodeBlock({
    detectorId: 'code/docusaurus-tabs',
    codeEl,
    containerEl: pre,
    rawText: null,
    evidenceSource: 'dom-text-content',
    reconstructed: false,
  });
  return node;
}

export const docusaurusTabsDetector: ComponentDetector = {
  id: 'code/docusaurus-tabs',
  version: DETECTOR_VERSION,
  priority: DETECTOR_PRIORITY.codeGroup,

  detect(root): DetectedComponent[] {
    const out: DetectedComponent[] = [];
    for (const container of tabContainers(root)) {
      const tabButtons = Array.from(
        container.querySelectorAll('[role="tab"], .tabs__item, li[role="tab"]'),
      );
      const panels = Array.from(
        container.querySelectorAll('[role="tabpanel"], .tabItem'),
      );
      if (panels.length < 2) continue;

      out.push({
        detectorId: 'code/docusaurus-tabs',
        kind: 'code-group',
        element: container,
        confidenceHint: 'high',
        extract() {
          const diagnostics: Diagnostic[] = [];
          const members: { label: string; code: CodeBlockIR }[] = [];
          let activeIndex: number | null = null;

          panels.forEach((panel, i) => {
            const label =
              (tabButtons[i]?.textContent ?? '').trim() ||
              panel.getAttribute('data-label') ||
              `Tab ${i + 1}`;
            const code = panelCode(panel);
            if (code) {
              members.push({ label, code });
              const btn = tabButtons[i];
              if (
                btn?.getAttribute('aria-selected') === 'true' ||
                /\b(tabs__item--active|active)\b/.test(
                  btn?.getAttribute('class') ?? '',
                )
              ) {
                activeIndex = members.length - 1;
              }
            } else {
              diagnostics.push(
                makeDiagnostic('TC-ADAPT-GROUP-NONCODE', {
                  phase: 'adapt',
                  message: `Docusaurus tab "${label}" has no code; not retained as a member`,
                }),
              );
            }
          });

          const node: CodeGroupIR = {
            id: computeNodeId(
              compositeSeed(
                'codeGroup',
                members.map((m) => `${m.label}:${m.code.id}`),
              ),
            ),
            label:
              container.getAttribute('data-group-id') ??
              container.getAttribute('aria-label') ??
              null,
            groupKind: 'docusaurus-tabs',
            members,
            defaultMemberIndex: activeIndex,
            extraction: {
              method: 'detector',
              methodVersion: DETECTOR_VERSION,
              detectorId: 'code/docusaurus-tabs',
              evidenceSource: 'dom-text-content',
            },
          };
          return { node, kind: 'code-group' as const, diagnostics };
        },
      });
    }
    return out;
  },
};
