# Documentation procedure

## Content

1. Read the owning product’s current README, public types, and relevant technical guide.
2. Edit the matching content page. Use the exported interface’s actual names and supported values.
3. Refresh the source path, revision, and SHA-256 in sources.json.
4. Review all visible copy and links. Keep operational details useful to the reader. Keep internal engineering evidence here.

## Validation

Run `npm run check`. The static checker verifies page content, navigation, heading links, search entries, assets, the custom missing-page output, and absence of a client React bundle.

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
