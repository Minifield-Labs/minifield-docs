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
