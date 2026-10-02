import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { loadDocs } from '../.build/render.js';

const docs = await loadDocs();
const search = JSON.parse(await readFile('dist/search.json', 'utf8'));
assert.equal(search.length, docs.length);
const pages = new Map();
for (const doc of docs) {
  const html = await readFile(join('dist', doc.url, 'index.html'), 'utf8');
  assert.ok(html.includes(`<h1>${doc.title}</h1>`), `${doc.url}: prerendered title`);
  assert.ok(html.includes(`<title>${doc.title} | Minifield Docs</title>`), `${doc.url}: browser title`);
  assert.ok(html.includes('<article class="prose">'), `${doc.url}: prerendered body`);
  assert.ok(html.includes('aria-current="page"'), `${doc.url}: current navigation`);
  assert.ok(!html.includes('—'), `${doc.url}: copy contains an em dash`);
  assert.ok(search.some((entry) => entry.url === doc.url && entry.text.length > 100), `${doc.url}: search coverage`);
  pages.set(doc.url, html);
}

let links = 0;
for (const [url, html] of pages) {
  for (const [, encoded] of html.matchAll(/(?:href|src)="([^"\s]+)"/g)) {
    const href = encoded.replaceAll('&amp;', '&');
    if (/^https?:|^mailto:/.test(href)) continue;
    const target = new URL(href, `https://docs.test${url}`);
    if (target.pathname.includes('.')) {
      assert.ok((await stat(join('dist', target.pathname))).isFile(), `${url}: missing asset ${href}`);
    } else {
      const route = `${target.pathname.replace(/\/$/, '')}/`;
      assert.ok(pages.has(route), `${url}: missing page ${href}`);
      if (target.hash) assert.ok(pages.get(route).includes(`id="${decodeURIComponent(target.hash.slice(1))}"`), `${url}: missing heading ${href}`);
    }
    links++;
  }
}
const notFound = await readFile('dist/404.html', 'utf8');
assert.ok(notFound.includes('Page not found') && notFound.includes('noindex'));
const client = await readFile('dist/assets/docs.js', 'utf8');
assert.ok(!client.includes('react.production') && !client.includes('react-dom'), 'Browser must not bundle React');
assert.ok(client.length < 20000, 'Keep the enhancement bundle under 20 KB');
assert.equal('Email robin@minifieldlabs.com'.slice(6, 29), 'robin@minifieldlabs.com');
console.log(`Checked ${docs.length} static pages, ${links} local links/assets, search coverage, 404, and ${client.length} bytes of browser JavaScript.`);
