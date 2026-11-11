# Production bundle optimisation — 11 November 2026

Measured with Node 22.23.4, Angular CLI/build 21.2.29, Angular 21.2.26 and the existing lockfile. Every stage used:

```sh
npm run build -- --configuration production --stats-json
```

The first sandboxed builds terminated with exit codes 133/134; all reported measurements come from successful builds outside the sandbox. No budget, calculation, component stylesheet, Bootstrap layout rule, deployment script, output directory, domain or base href was changed. No commit, push or deployment was performed.

## Incremental measurements

Raw figures below are exact bytes from `dist/myapps/stats.json`; kB means 1,000 bytes. Transfer figures are Angular CLI estimates rounded to two decimal places, rather than measured network traffic.

| Stage | Initial bytes | Estimated transfer kB | Raw saving at this step | Transfer saving kB |
| --- | ---: | ---: | ---: | ---: |
| Baseline | 701,821 | 137.43 | — | — |
| Lazy routes and removal of root eager import | 655,188 | 129.07 | 46,633 | 8.36 |
| Remove unused Bootstrap JavaScript bundle | 574,572 | 107.45 | 80,616 | 21.62 |
| Retain only used Bootstrap Icon CSS rules | 491,839 | 97.35 | 82,733 | 10.10 |
| Total reduction | **209,982** | **40.08 saved** | **29.92% raw** | **29.16% transfer** |

The supplied baseline was 697.16 kB / 137.57 kB; the fresh build measured 701.821 kB / 137.43 kB. Styles measured 315.303 kB rather than the supplied 310.64 kB. These results use the reproducible fresh baseline; the cause of the older figure cannot be established from the supplied numbers.

| Chunk | Baseline bytes | After lazy routes | After removing JS | Final bytes |
| --- | ---: | ---: | ---: | ---: |
| styles | 315,303 | 315,303 | 315,303 | 232,570 |
| main | 271,317 | 72,502 | 72,502 | 72,502 |
| shared initial JavaScript | — | 152,182 | 152,182 | 152,182 |
| scripts | 80,616 | 80,616 | — | — |
| polyfills | 34,585 | 34,585 | 34,585 | 34,585 |
| lazy Luluske | — | 41,712 | 41,712 | 41,712 |
| lazy Batchweight | — | 6,719 | 6,719 | 6,719 |

Final lazy transfer estimates: Luluske 8.98 kB; Batchweight 2.12 kB. Baseline had no lazy chunks. Full cold-route raw totals, including the applicable lazy chunk, are 533,551 bytes for `/luluske` and 498,558 bytes for `/batchweight`, excluding font/image assets and HTML. Lazy loading introduces a route-chunk request; it defers unused route code rather than eliminating all of it.

`PERFORMANCE_BUILD_SIZES.json` records all four stages' chunk names, exact sizes and font sizes. Full intermediate stats files are retained for this session in `/tmp/myapps-perf/{0-baseline,1-lazy,2-no-bootstrap-js,3-icons}.json`; the final full stats file is `dist/myapps/stats.json`. Temporary files and build output are not tracked.

## Route audit

Both routed components have Angular 21's default standalone semantics, with component-level `imports` and no `standalone: false` or declaring NgModule. Both now use dynamic `loadComponent` imports, following [Angular's lazy route guidance](https://angular.dev/best-practices/performance/lazy-loaded-routes).

The root's `instanceof LuluskeComponent` check previously eagerly imported Luluske. It now reads `layout: 'luluske'` from the activated outlet's route data to preserve the existing footer. The wildcard redirect remains `/luluske`. The two Luluske child components' references back to Luluske are already type-only imports. Test-only imports do not enter the production graph. Stats verification confirmed neither routed feature appears among inputs to any initial chunk.

No NgModule fallback is needed. For a future non-standalone feature, safely lazy-load its feature NgModule with `loadChildren` and `RouterModule.forChild`, keeping its declarations and providers together, rather than pointing `loadComponent` at a non-standalone declaration.

## Bootstrap and CSS audit

Searched all application source for Bootstrap imports, global calls, constructors, `data-bs-*` attributes, class bindings and DOM operations. The sole Bootstrap JavaScript inclusion was `angular.json`'s global `bootstrap.bundle.min.js`. There are no modal, dropdown, collapse, tooltip, popover, carousel, toast, offcanvas, tab, scrollspy or dismiss invocations or Bootstrap data APIs. Batchweight uses native prompts and confirmation; Luluske uses Angular events and inline editing. Bootstrap classes such as `btn` need CSS only. Removed the global JS entry without introducing a replacement or Popper dependency.

`src/styles.css` contains only a comment. Bootstrap CSS remains globally loaded, in its original position, preserving Reboot, typography, table states, grid breakpoints and utility ordering. Batchweight uses containers, rows, `col-md-8`, tables, buttons, backgrounds, spacing and text utilities. The footer dynamically selects `bg-light`, `p-5`, `text-center` and `mt-5`. Luluske also uses global typography helpers alongside its component CSS. Blind class purging could remove these bindings or affect global element styles.

Bootstrap Icons previously shipped thousands of unused selector rules. The generated subset retains the upstream licence notice, `@font-face`, shared pseudo-element rendering declarations, original codepoints and the ten used selectors:

- `bi-bullseye`, `bi-check-circle`, `bi-journal-text`, `bi-list-ol`, `bi-mortarboard`
- `bi-patch-check`, `bi-pencil`, `bi-pencil-square`, `bi-trash`, `bi-x-circle`

This includes both pass/fail and coursework/exam conditional classes. The original WOFF2 and WOFF font files remain byte-for-byte unchanged, preserving icon appearance and fallback support. Font downloads are outside Angular's initial bundle metric: the WOFF2 remains 130,396 bytes. No font subsetting or replacement artwork was attempted.

After adding icon classes or updating Bootstrap Icons, run:

```sh
npm run icons:update
npm run icons:check
```

The generator scans literal `bi-*` classes in application HTML and TypeScript, including `[class.bi-*]` bindings, and rejects unknown glyph names. Future constructed class names must have all possible values added to `additionalIcons` in the generator. The generated stylesheet is checked in so `npx ng build` and the existing deployment command continue to work directly. Regeneration/checking is explicit; deployment has not been modified to run it automatically.

Unused direct application dependencies identified: `@angular/animations`, `@angular/forms`, `@angular/platform-browser-dynamic` have no source imports. They were retained because removing package declarations does not reduce the already tree-shaken production bundle, and compiler/testing peer requirements warrant separate package maintenance. Bootstrap remains necessary for CSS, and Bootstrap Icons remains necessary for generating the subset and supplying its fonts. There are no new dependencies or lockfile changes.

Further CSS opportunities: compile Bootstrap Sass with only root, reboot, typography, containers, grid, tables, buttons and a restricted utility map, or use an Angular-aware purge pipeline with explicit dynamic-class safelists. Both need full responsive/state visual comparisons before adoption. They were not applied here because the existing CSS cascade and responsive behaviour must remain intact.

## Verification

- Four successful production builds with stats; final build is below the unchanged 500,000-byte initial warning budget by **8,161 bytes**. Initial budget warning removed.
- `npm test -- --watch=false --browsers=ChromeHeadless`: **257 executed; 155 passed, 102 failed** on Chrome Headless 157.
- Repeated the unchanged HEAD suite in an isolated temporary checkout with the same Node 22 executable and shared installed dependencies: **155 passed, 102 failed**. Compared failing test names: identical sets, with no new or resolved failures.
- Failures are existing Luluske development-mode `NG0100` expression-change errors around exam suggestions; existing `NG0956` identity-tracking warnings also appear. Calculation/component code was left unchanged. The suite is not green, and these failures limit automated assurance; they are not hidden or disabled.
- Existing root/footer tests and Batchweight creation test pass. Luluske has extensive grade-boundary, validation, regression and editor tests, but the existing failures prevent claiming complete passing interaction coverage.
- `npm run icons:check`: passes, retaining all ten used icon rules.
- `node scripts/verify-social-metadata.cjs`: passes for source/built metadata and the copied 1200 × 630 image.
- Stats input graph confirms both feature components are absent from initial chunks.
- `dist/myapps/browser`, `src/CNAME`, `/` base href and `deploy.sh` remain unchanged in configuration. No deployment was run.

### Manual checks still required

These checks are documented, **not performed**. Visual equivalence has not been established through browser screenshot comparison.

Serve the production output with an SPA fallback (including requests for both route URLs); a plain static server without a fallback may return 404 on direct navigation. Compare with the unchanged build at desktop and narrow mobile widths.

| Route | Checks |
| --- | --- |
| `/luluske` | Direct load, reload and wildcard redirect; title; Luluske footer; all ten relevant icon states; 16 assessment edit controls; Apply, Cancel, Escape and focus return; invalid/zero/over-total inputs; balanced and unbalanced weights; pass/fail and grade boundaries; exam targets; section links and mobile worksheet layout. |
| `/batchweight` | Direct load and reload; title and original footer; mixer-volume prompt, percentage slider, ingredient name/part/density prompts, add ingredient, delete confirmation/cancellation, totals and displayed precision; trash glyph, table stripes/hover, grid and mobile behaviour. |
| Both | Navigate between routes with browser history; ensure footer classes switch correctly; verify lazy chunk and font requests succeed with no console errors; compare typography, spacing, colours and icons with baseline. |

## Remaining warnings and risks

Two original component stylesheet warnings remain: `assessment-worksheet.component.css` is 2,482 bytes (482 over its 2 kB warning); `luluske.component.css` is 3,024 bytes (1,024 over). Budgets were not relaxed and styles were not moved to conceal these warnings. No production build errors remain.

The initial budget has only 8,161 bytes of headroom. Full icon font downloads remain, and future icon usage requires regeneration. New Bootstrap JavaScript interactions would need explicit imports/initialisation. Route chunks require the existing host to serve hashed assets correctly. Browser visual checks and the existing failing test suite remain outstanding assurance limits.

## Changed files

- `angular.json`: remove global Bootstrap JavaScript and select the icon subset CSS.
- `src/app/app.routes.ts`: lazy component imports and Luluske layout metadata.
- `src/app/app.component.ts`, `src/app/app.component.html`: use outlet route data for footer selection without eager feature imports.
- `src/app/app.component.spec.ts`: exercise the metadata-based footer contract.
- `src/bootstrap-icons.css`: generated subset with original font/rendering rules.
- `scripts/generate-bootstrap-icons.cjs`: reproducible subset generation and stale-output check.
- `package.json`: explicit icon generation/check commands.
- `docs/PERFORMANCE_OPTIMISATION.md`, `docs/PERFORMANCE_BUILD_SIZES.json`: audit, staged measurements, validation and outstanding checks.
