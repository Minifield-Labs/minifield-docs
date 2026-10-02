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
