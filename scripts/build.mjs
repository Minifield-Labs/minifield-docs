import { build } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

await build();
await build({ build: { ssr: 'src/render.tsx', outDir: '.build', copyPublicDir: false, rollupOptions: { input: 'src/render.tsx', output: { entryFileNames: '[name].js' } } } });
const { loadDocs, searchEntries, renderPage } = await import('../.build/render.js');
const docs = await loadDocs();
for (const doc of docs) {
  const directory = join('dist', doc.url);
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, 'index.html'), renderPage(docs, doc));
}
await writeFile('dist/404.html', renderPage(docs));
await writeFile('dist/search.json', JSON.stringify(searchEntries(docs)));
console.log(`Rendered ${docs.length} documentation pages and 404.html.`);
