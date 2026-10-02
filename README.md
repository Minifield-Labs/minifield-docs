# Minifield Docs

Static React documentation for MagicBox, Runtime, Command, Observer, and Training. Styled to match the company homepage and blog.

## Develop

Use Node 24.2.0 (minimum 22.13.0).

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4330. Markdown edits reload the page. All packages install from the public npm registry.

```sh
npm run check
npm run preview
```

`check` runs TypeScript, lint, checked examples, the production build, static link/asset checks, and search/contents regression checks. Preview serves the generated site on port 4330. Stop the dev server before starting preview.

## Author pages

Add Markdown to `content/`. Filenames define routes: `runtime.md` becomes `/runtime/`; `overview.md` becomes `/`.

```yaml
---
title: Page title
description: A short explanation of the page.
group: Runtime
order: 24
---
```

Use a unique integer order. Groups follow the first page’s order. Start body headings at H2. Navigation, previous/next links, page contents, and the full-text search index derive from the same source.

Use root-relative internal links with trailing slashes, such as `/runtime-browser/`. Use fenced code with `tsx`, `typescript`, `javascript`, `json`, `bash`, `yaml`, `rust`, or `text`. Markdown is trusted repository source. Review raw HTML in content as application code.

### Checked examples and generated references

Keep reusable examples in `examples/` and include their exact source with a standalone directive:

```html
<!-- example: examples/magicbox/contact-input.tsx -->
```

MagicBox examples compile against the exact package version in `package.json` and `package-lock.json`. Training JSON examples validate against their matching definitions in the pinned job schema. Run `npm run check:examples` for these checks alone. Example and contract edits also reload the development page.

Include a generated reference table with its registered name:

```html
<!-- reference: magicbox-props -->
```

`scripts/magicbox-reference.mjs` reads the installed package's public TypeScript declarations, including inherited fields. `scripts/training-reference.mjs` renders fields, types, bounds, and defaults from checksummed snapshots in `contracts/training/`. Both run during Markdown compilation, so tables and examples participate in search. Missing sources, unknown references, unsupported schema shapes, and checksum mismatches fail the build.

See [procedure](docs/procedure.md) for refreshing package and contract pins. Builds use only this repository and installed npm packages.

## Host on Cloudflare Pages

Create a Pages project connected to the repository when it has a remote. Use:

| Setting | Value |
| --- | --- |
| Root directory | Repository root |
| Build command | `npm run build` |
| Build output | `dist` |
| Node version | `24.2.0` |

The build writes one HTML file per route, `404.html`, a search index, browser JavaScript, CSS, and local fonts. Upload only `dist/`. It needs no Worker, SSR runtime, database, API credentials, or private package token.

For direct upload with an installed and authenticated Wrangler:

```sh
npm run build
wrangler pages deploy dist --project-name minifield-docs
```

Set the Pages production branch to the branch you adopt for publication. Attach a custom domain through Pages after the first deployment. This initial local repository defines no production domain or deployment.

Cloudflare reads `public/_headers` from the exported directory. The top-level `404.html` preserves normal missing-page responses rather than a single-page-app fallback. See [Cloudflare’s static HTML guide](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/).

## Design and module structure

`src/content.ts` exposes `loadDocs()` and `searchEntries()`. It hides frontmatter checks, Markdown compilation, syntax highlighting, heading IDs, ordering, and index preparation behind one content interface.

`src/render.tsx` renders the page shell through React’s `renderToStaticMarkup`. `src/enhance.ts` adds native-dialog search, copy controls, and contents tracking. The browser downloads no React runtime. `scripts/build.mjs` combines Vite asset compilation and static page generation.

See [procedure](docs/procedure.md) for acceptance checks and [source provenance](docs/sources.json) for the technical references used to write the initial pages. This repo imports no sibling source trees. The initial scope is a curated public docs hub; historical research and internal runbooks stay in their owning repositories.
