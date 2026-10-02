# Initial verification

Checked October 1, 2026 against the local production preview at `http://127.0.0.1:4330/`.

- `npm run check` passed: TypeScript, authored-source lint, production build, and static verification.
- The build rendered 16 documentation pages and a custom 404 page.
- Static verification checked 815 internal links and asset references, fragment targets, page titles, search coverage, and the browser bundle size.
- Browser enhancement is 3,422 bytes before gzip (1.46 KB gzipped). It contains no React runtime.
- Desktop and 390 × 844 mobile views were inspected. The code-heavy mobile page had no horizontal document overflow.
- Search matched article body text. Arrow-key selection and Enter navigation worked. Cmd-K opened search. Escape closed it on the first press and restored focus.
- Empty-result and blocked-index search states displayed correctly. Network blocking was removed after testing.
- Code-copy confirmation worked. The contents and navigation remained visible with JavaScript disabled and reduced motion enabled. Browser overrides were restored.
- Mobile navigation opened, linked to a nested page, and collapsed on navigation.
- The development server rendered a nested Markdown page with its proper title and syntax highlighting.
- The final production preview had no captured browser warnings or errors.

## Local Lighthouse audit

The mobile audit scored 100 in performance, accessibility, best practices, and SEO. First contentful paint was 1.1 seconds, largest contentful paint 1.2 seconds, total blocking time 0 ms, and cumulative layout shift 0.

The raw report is retained in ignored `.local/lighthouse.json`. The preview image is `.local/preview.jpg`. These are local measurements. Cloudflare deployment and domain setup remain separate publication steps.

## Artifact accounting

Dependency, build, and audit output locations were registered in the parent workspace’s artifact-budget configuration before use. Install, validation, and Lighthouse phases ran through its managed wrapper. All recorded phases stayed within the unchanged caps.

The registered roots are `node_modules`, `dist`, `.build`, `.local`, and `/private/tmp/minifield-docs-npm-cache`. Font source files and licenses were copied into this repository, so builds require no sibling checkout.

## Git delivery

The initial implementation uses feature branch `feat/initial-docs`, with the required Proto author and committer identity. This user-requested local repository has no GitHub remote. A pull request requires a remote and a base branch before publication.

## React review fixes, October 2, 2026

Applied the 4 initial review findings: explicit example button types, searchable code examples, escaped title checks, and a stale-query guard for failed searches. A second independent reviewer found 3 further improvements. The extractor example now uses unique React IDs, contents tracking follows heading positions, and development reloads include added and removed Markdown pages.

- `npm run check` passed, including the new production-bundle regression checks. The export still contains 16 pages, the custom 404, and 815 verified local link/asset references.
- The browser found `MagicBoxExtractor` and `normalizeSpans` in the correct pages. A deliberately paused search request was failed after clearing the input. The empty-query message remained correct, and the next search succeeded.
- Contents links selected the correct section at 1440 × 900. Native fragment targets landed approximately 64px from the top. A 390 × 844 mobile check found no horizontal document overflow, and mobile search found the span API.
- Temporary network interception and viewport overrides were removed. The search screenshot is retained in ignored `.local/review-search.jpg`.
- The independent reviewer checked the final code changes and found no new defects. The checks and cleanup stayed within the workspace artifact limits.

## Public scope and training refresh, October 2, 2026

Removed the nonexistent Stats destination and the public pages for data generation, the Minifield application, and the backend. Data preparation now belongs to Training. Sidebar groups use semantic H2 headings with uppercase text, stronger weight, dividing rules, and indented links.

Training now has 6 pages covering strategy selection, CUDA installation, direct and supervised execution, immutable source preparation, packed serialization, optimizer and quantization settings, evaluation, checkpoint recovery, verification, and runtime packaging. Current implementation files supplement the training README: the supervisor advertises packed SFT computation 12, the direct worker supports packed QAT computation 13, and the attempt verifier's full-weight path handles two-stage and packed SFT. The docs keep these entry points specific to their supported computations.

Runtime content now includes native Metal and dense F16/signed INT8 weight support. Technical source hashes and revisions are recorded in `sources.json`; sibling repositories were read without modifying their source.

- `npm run check` passed: TypeScript, lint, production build, 18 static pages, 1,010 local link/asset references, search coverage, the custom 404, and browser enhancement regression checks.
- The browser bundle remains 3,413 string characters in the static checker (Vite reports 3.42 KB). This scope and style change adds no browser logic.
- The production preview was inspected at 1440px desktop and 390 × 844 mobile widths. The strategy and evaluation pages fit the mobile document width; all strategy tables measured 312px within the article.
- The mobile menu exposed the updated section headings and linked to Evaluation, then collapsed after navigation. Search found `gradient_accumulation_steps` in Strategies and settings.
- No browser warnings or errors were captured. Viewport overrides were cleared. The saved preview is ignored `.local/training-sidebar.jpg`.
- Validation ran through the shared artifact-budget wrapper after an existing runtime phase released its lock. The build stayed within the storage caps. The full command log is ignored `.local/scope-check.log`. Final handoff cleanup passed with no removable intermediates; task storage was 7,410,823,168 bytes and free space was 31,392,600,064 bytes.
- This remains a local preview. The repository has no remote or PR base branch.

## Checked examples and generated references, October 2, 2026

Moved 4 MagicBox TypeScript examples and 2 Training JSON fragments into source files included directly in the published pages. MagicBox examples compile against public package `0.1.0`. The new API reference derives 3 tables from that package's public declarations. Training derives 5 tables from pinned computation 12 and 13 schemas, with source revisions and checksums in `contracts/training/manifest.json`.

- `npm run check` passed after the final changes: strict example compilation, lint, exact published-source checks, Training JSON validation, 19 static pages, 1,102 local links/assets, search coverage, custom 404, and browser enhancement checks.
- The example checks cover inherited required/optional props, nullable span fields, exact uint64 limits, unsupported reference names, path traversal, and rejected invalid JSON fields and values. Schema bytes are checked before table generation.
- The browser bundle remains 3.42 KB before gzip (1.45 KB gzipped), with no React runtime. Schema validation and TypeScript declaration processing run only during development and builds.
- The API reference was inspected at 1440px, 900px, and 390px widths. The mobile field column now retains its 31% width; `sourceTitle` fits on one line. API and Training tables fit within the 312px mobile article, without horizontal document overflow.
- The quickstart displayed its source filename and its copy button confirmed success. Searching for `rootProps` found the generated API reference. The browser reported no warnings or errors, and viewport overrides were cleared.
- Independent review found no correctness or React structure defects. Authoring instructions and source provenance were updated. The saved production preview is ignored `.local/checked-reference.jpg`.
- Final validation and handoff cleanup stayed within the workspace artifact limits. Cleanup found no removable intermediates; task storage was 8,026,341,376 bytes and free space was 27,588,501,504 bytes. This remains a local repository and preview; no remote or PR base branch exists.

## Accessibility audit, October 2, 2026

Fixed low-contrast syntax comments, unnamed complementary landmarks, search-field border contrast, and control names that omitted their visible text. Code regions now have unique descriptive names and an inset focus outline. Copy controls remain hidden until their behavior loads, and their accessible names follow the visible success and fallback states.

- axe-core 4.13.0 reported 0 violations across all 19 pages and the 404 page at 1440 × 900, using WCAG 2 A/AA, 2.1 A/AA, 2.2 AA, and best-practice rules. The open search dialog and mobile navigation also reported 0 violations.
- Baseline comments measured 3.76:1 contrast. The updated comment color measures 5.90:1 on the code background. The search input border measures 3.62:1 against its surroundings.
- Remaining automated contrast review items were decorative, aria-hidden pagination arrows and clipped sidebar links on the short 404 page. The arrows share the passing link text color. Sidebar links share the verified navigation colors and remain reachable through sidebar scrolling.
- Keyboard checks verified the skip link moves focus to main content, Cmd-K opens search, modal focus stays within the dialog, and Escape returns focus. The mobile menu opens with Enter, links to a nested page, and closes after navigation. Named code regions accept keyboard focus and horizontal arrow-key scrolling.
- All 19 articles fit a 320px viewport. Enlarged line, word, letter, and paragraph spacing preserved the document width on the quickstart and checkpoint pages. Code overflow stayed inside its scroll region. Forced colors retained a visible focus outline, and reduced motion disabled transitions.
- With JavaScript disabled, the quickstart article, code regions, and native mobile navigation remained usable. Search and copy controls stayed hidden. Browser overrides were restored after testing.
- `npm run check` passed, including new regression checks for code-region names and focusability, distinct landmarks, no-JavaScript copy controls, and accessible copy feedback. The browser bundle is 3.53 KB before gzip (1.50 KB gzipped). Independent review found no actionable defects.
- Raw before/after axe results are retained in ignored `.local/accessibility-before.json` and `.local/accessibility-after.json`. Tests used the Chromium accessibility tree and keyboard controls; a VoiceOver or NVDA reading session was not run.
- The focused code preview is ignored `.local/accessibility.jpg`. Validation and final cleanup stayed within budget. Cleanup found no removable intermediates, with 8,028,672,000 bytes of task storage and 27,361,177,600 bytes free.
