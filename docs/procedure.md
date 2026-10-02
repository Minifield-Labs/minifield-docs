# Documentation procedure

## Content

1. Read the owning product’s current README, public types, and relevant technical guide.
2. Edit the matching content page. Use the exported interface’s actual names and supported values.
3. Refresh the source path, revision, and SHA-256 in sources.json.
4. Review all visible copy and links. Keep operational details useful to the reader. Keep internal engineering evidence here.

## Refresh checked sources

- MagicBox: update the exact public package version and lockfile together. Run `npm run check:examples`, review the generated API reference, and update the surrounding prose for changed behavior. The 4 TypeScript examples live in `examples/magicbox/`; edit those files directly.
- Training: copy the owning repository's versioned job schemas into `contracts/training/`. Record the source revision, paths, and SHA-256 values in `contracts/training/manifest.json` and `docs/sources.json`. Preserve exact schema bytes. Normal builds verify the local snapshots and never access sibling repositories.
- When introducing a schema version or reference section, update the selected definitions in `scripts/training-reference.mjs` and the example-to-definition mapping in `scripts/check-documentation.mjs`. Unsupported schema shapes require an explicit renderer update.
- Keep checked examples in `examples/` and publish them through standalone `example` directives. Publish generated tables through `reference` directives. The checks require every registered table to appear in a page and compare each published example with its source file.

JSON checks validate schema structure and field constraints. Training's Python validators also enforce cross-field rules. Review those rules when changing examples, such as routine evaluation budgets relative to fixed evaluation budgets.

## Validation

Run `npm run check`. The static checker verifies page content, navigation, heading links, search entries, assets, the custom missing-page output, and absence of a client React bundle.

`npm run check:examples` compiles all MagicBox example files with strict TypeScript settings and checks published source expansion, generated reference fields, schema pins, and Training JSON examples. It runs as part of `check` before the production build.

Regression checks cover escaped titles, API names in code examples, cleared queries with pending failures, search retries, and contents tracking after fragment jumps and resizing. Browser enhancement checks execute the production bundle against a small DOM stub.

Serve the production output with `npm run preview`. Inspect Introduction and a code-heavy page at desktop and mobile widths. Check search by text and by Cmd-K/Ctrl-K. Check arrow-key result navigation, Escape, focus return, code copying, mobile navigation, and a direct nested-page load.

Check the site with reduced motion and without JavaScript. The article and navigation must remain usable. Inspect browser console and network failures.

## Acceptance

- Every published page renders substantive HTML before JavaScript executes.
- All local links and their fragments resolve. Each page participates in navigation and search.
- Code examples use actual public interfaces. Example extractors and action handlers state their inputs and perform the behavior they demonstrate.
- Desktop and mobile layouts preserve the company’s typography and palette without horizontal page overflow.
- Search has loading, empty-result, and request-error states. Native dialog semantics preserve keyboard focus.
- The independently cloned repository builds with `npm ci` and `npm run check`.
- `dist/` contains all files needed for static Cloudflare Pages delivery.

Keep generated outputs outside Git. Commit on a feature branch. Open a PR when a user-authorized remote exists. Record an unavailable remote or authentication failure accurately.
