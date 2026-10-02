import { renderToStaticMarkup } from 'react-dom/server';
import type { Doc } from './content';
export { loadDocs, searchEntries } from './content';

function Navigation({ docs, current }: { docs: Doc[]; current?: Doc }) {
  return <nav aria-label="Documentation">{[...new Set(docs.map((doc) => doc.group))].map((group) =>
    <div className="nav-group" key={group}><h2>{group}</h2>{docs.filter((doc) => doc.group === group).map((doc) =>
      <a key={doc.slug} href={doc.url} aria-current={doc === current ? 'page' : undefined}>{doc.title}</a>
    )}</div>
  )}</nav>;
}

export function renderPage(docs: Doc[], page?: Doc, development = false) {
  const index = docs.findIndex((doc) => doc === page);
  const previous = docs[index - 1];
  const next = docs[index + 1];
  const title = page?.title ?? 'Page not found';
  const description = page?.description ?? 'Find your way through the Minifield documentation.';
  return '<!doctype html>' + renderToStaticMarkup(<html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{`${title} | Minifield Docs`}</title>
      <meta name="description" content={description} />
      <meta name="theme-color" content="#101112" />
      <meta property="og:title" content={`${title} | Minifield Docs`} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      {!page && <meta name="robots" content="noindex" />}
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="preload" href="/fonts/manrope-latin-wght-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      {!development && <link rel="stylesheet" href="/assets/style.css" />}
      <script type="module" src={development ? '/src/enhance.ts' : '/assets/docs.js'} />
    </head>
    <body>
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="site-frame">
        <header className="site-header">
          <a className="brand" href="https://minifieldlabs.com">minifield<span>LABS</span></a>
          <a className="docs-label" href="/">Docs</a>
          <nav className="main-nav" aria-label="Main navigation">
            <a href="https://minifieldlabs.com/blog">Blog</a>
            <a className="app-link" href="https://app.minifieldlabs.com">App <span aria-hidden="true">↗</span></a>
          </nav>
        </header>
        <div className="mobile-tools">
          <details><summary>Browse docs</summary><Navigation docs={docs} current={page} /></details>
          <button type="button" data-open-search hidden>Search</button>
        </div>
        <div className="docs-layout">
          <aside className="sidebar" aria-label="Documentation sidebar">
            <button className="search-trigger" type="button" data-open-search hidden><span>Search documentation</span><kbd data-shortcut>⌘ K</kbd></button>
            <Navigation docs={docs} current={page} />
            <a className="sidebar-home" href="https://minifieldlabs.com">Minifield Labs <span aria-hidden="true">↗</span></a>
          </aside>
          <main id="main" tabIndex={-1}>
            <div className="page-kicker"><a href="/">Documentation</a><span aria-hidden="true">/</span><span>{page?.group ?? 'Navigation'}</span></div>
            <header className="article-header"><h1>{title}</h1><p>{description}</p></header>
            {page ? <>
              <article className="prose" dangerouslySetInnerHTML={{ __html: page.html }} />
              <nav className="page-navigation" aria-label="Previous and next pages">
                {previous ? <a href={previous.url}><span>Previous</span><strong><span aria-hidden="true">← </span>{previous.title}</strong></a> : <div />}
                {next && <a href={next.url}><span>Next</span><strong>{next.title}<span aria-hidden="true"> →</span></strong></a>}
              </nav>
            </> : <div className="prose"><p>The page you’re looking for has moved or doesn’t exist.</p><p><a href="/">Open the documentation →</a></p></div>}
          </main>
          <aside className="contents" aria-label="Page contents">
            {page && page.headings.length > 0 && <nav aria-label="On this page"><p>On this page</p>{page.headings.filter((heading) => heading.level <= 3).map((heading) =>
              <a key={heading.id} href={`#${heading.id}`} className={heading.level === 3 ? 'nested' : ''}>{heading.text}</a>
            )}</nav>}
          </aside>
        </div>
        <footer className="site-footer"><a href="https://minifieldlabs.com">Intelligence at human scale.</a><span>Minifield Labs</span></footer>
      </div>
      <dialog className="search-dialog" aria-labelledby="search-title">
        <div className="search-head"><h2 id="search-title">Search documentation</h2><button type="button" data-close-search aria-label="Close search (Esc)">Esc</button></div>
        <label className="sr-only" htmlFor="docs-search">Search documentation</label>
        <input id="docs-search" type="search" placeholder="Search products, guides, and interfaces…" autoComplete="off" />
        <p className="search-status" role="status" aria-live="polite">Type to search the documentation.</p>
        <div className="search-results" />
      </dialog>
      <span className="sr-only" role="status" aria-live="polite" data-copy-status />
    </body>
  </html>);
}
