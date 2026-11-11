# Luluske redesign: implementation and verification

## Implementation

The interface adapts `Update design/code.html`, `DESIGN.md` and `screen.png` to Angular 17, using the supplied current-behaviour specification and PRD as the functional contract.

- `src/app/luluske/luluske.component.{ts,html,css}` retains calculation ownership, adds the responsive page, contribution and target cards, exact grade reference, navigation and committed-result announcements.
- `assessment-worksheet.component.{ts,html,css}` provides the accessible assessment table/mobile cards and per-field Apply/Cancel editor. Draft state is separate from committed assessment data.
- `luluske-results.component.{ts,html,css}` presents marks, independent grade/result, the three condition checks and all failure reasons.
- `luluske-shared.css` supplies component-scoped visual primitives. Presentation components keep styles within the existing hard limits rather than increasing build budgets.
- `src/app/app.component.{ts,html,css}` applies the new footer only when Luluske is active. Copyright, disclaimer and author-link behaviour remain. Invalid paragraph nesting was corrected.
- `luluske.component.spec.ts` follows the new UI selectors; `luluske-ui.spec.ts`, `luluske-regression.spec.ts` and the shell tests add interaction, boundary and isolation coverage.

No framework, runtime dependency, route, build-budget or persistence changes were made. Inter is used if available locally, with system sans-serif fallbacks; no external font requests were added. Existing Bootstrap Icons supply the icons.

## Behaviour preservation and export adaptations

The initial redesign preserved the pre-redesign calculations and permissive input behaviour. Following the reported Project score/total defect, validation was tightened at the user's request (see below). Valid-data arithmetic, grade boundaries, component thresholds and whole-mark recommendation rounding remain unchanged. Both the prompt and inline editors use one shared commit validator. Only decorative bar widths are bounded.

The export's hard-coded scores and JavaScript were replaced with Angular bindings. Its reset/profile controls and unsupported institutional claims were omitted in accordance with the PRD. The visible grading reference describes the actual fractional intervals, rather than the export's conflicting integer ranges. The A recommendation remains an 80-overall target. Reading targets never changes scores.

## Initial redesign verification

Verified on 11 November 2026:

- **134 Jasmine/Karma tests passed**, including original tests, all 16 field mappings, rejected input, cancellation/focus, permissive conversion, grade transitions and footer isolation.
- **176 sequential legacy edits** produced matching assessment state, outputs, warnings and suggestions when compared with the original component.
- Headless Chrome checked widths **320, 375, 768, 1024 and 1440px** with no horizontal page overflow. Empty/long names, an open editor and 200% text enlargement were also checked.
- Browser checks passed for Enter/Tab/Escape, Apply/Cancel, focus return, skip link, section navigation without losing scores, failed carry, unreachable A, reload defaults and unrelated-route footer isolation. No page errors were recorded.
- Automated axe checks found **zero violations** in the checked default and open-editor states. Desktop and mobile screenshots were visually inspected.
- **Production build passed.** Initial bundle: **658.67 kB**, above the existing 500 kB warning threshold but below the 1 MB error limit. Component styles trigger warnings: worksheet **2.43 kB**, page **2.96 kB**, each above the 2 kB warning threshold but below the unchanged 4 kB error limit. Bootstrap still reports two `.form-floating>~label` selector warnings.

Commands:

```sh
npm test -- --watch=false --browsers=ChromeHeadless
npm run build
npm start -- --host 127.0.0.1
```

Browser checks used temporary Playwright/axe tooling outside the repository; no test-tool dependency was added to the application.

## Remaining limitations

The fractional grade boundaries documented in the supplied specification remain unchanged. Invalid-input outcomes are superseded by the validation correction below. Build warnings remain as listed above. Automated accessibility checks and Chrome testing are not a complete screen-reader or cross-browser audit; manual VoiceOver/NVDA and Safari/Firefox verification remains outstanding. No deployment was performed.


## Validation correction

The reported Project total of 30 with a retained score of 70 is now rejected, with a field-specific explanation. The same check applies to Quiz, Test, Project and Final Exam, in both directions: a score cannot exceed its total and a total cannot be reduced below the existing score. Rejected edits retain the last valid committed data and result, and leave the draft available for correction.

Numeric values must be present and finite. Scores must be non-negative; totals must be strictly positive; individual weights must be within 0–100%. Zero scores and valid fractional marks/totals remain supported. To lower a total below an existing score, first correct the score.

Weight edits may temporarily unbalance the course while another weight is being adjusted. The UI now withholds marks, grades, pass/fail, contribution bars and exam targets until weights total 100% and both carry and examination components have positive weights. The total is derived from current data, with a shared 1e-9 tolerance for weight validity and suggestions. Invalid stored data is also guarded before calculation, preventing NaN/infinity from producing an A+ or Pass. The original academic rules still apply once inputs are valid.

These changes intentionally supersede the permissive validation documented in the supplied historical specification/PRD. No source changes were made to Batchweight.

Verification: **257 Jasmine/Karma tests passed**, including score/total checks on every assessment, finite/range checks, rejected-edit state retention, invalid-result suppression and recovery, and the existing grade-boundary/pass-threshold tests. Browser checks covered desktop/mobile score and total edits, rejected zero/non-finite values, unbalanced-weight suppression/recovery and a corrected Project of 30/30. Automated axe checks found no violations in the tested invalid-weight states.

The production build after the validation correction passed: initial bundle **662.60 kB** (500 kB warning threshold), worksheet CSS **2.43 kB** and page CSS **2.96 kB** (2 kB warning thresholds). All remain below the configured error limits. The two existing Bootstrap selector warnings remain.
