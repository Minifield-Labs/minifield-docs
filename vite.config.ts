import { defineConfig } from 'vite';

export default defineConfig({
  appType: 'mpa',
  esbuild: { jsx: 'automatic' },
  build: {
    rollupOptions: {
      input: 'src/enhance.ts',
      output: { entryFileNames: 'assets/docs.js', assetFileNames: 'assets/[name][extname]' },
    },
    cssCodeSplit: false,
    cssMinify: true,
  },
  plugins: [{
    name: 'static-docs-development',
    configureServer(server) {
      server.watcher.add(['content', 'examples', 'contracts']);
      server.watcher.on('all', (event, path) => {
        if (['add', 'change', 'unlink'].includes(event) && /\.(md|tsx?|json)$/.test(path)) server.ws.send({ type: 'full-reload' });
      });
      return () => {
        server.middlewares.use(async (req, res, next) => {
          const url = new URL(req.url ?? '/', 'http://localhost');
          if (url.pathname.includes('.') && url.pathname !== '/search.json') return next();
          try {
            const { loadDocs } = await server.ssrLoadModule('/src/content.ts');
            const docs = await loadDocs();
            if (url.pathname === '/search.json') {
              const { searchEntries } = await server.ssrLoadModule('/src/content.ts');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(searchEntries(docs)));
              return;
            }
            const { renderPage } = await server.ssrLoadModule('/src/render.tsx');
            const page = docs.find((doc: { url: string }) => doc.url === `${url.pathname.replace(/\/$/, '')}/`);
            res.statusCode = page ? 200 : 404;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(await server.transformIndexHtml(url.pathname, renderPage(docs, page, true)));
          } catch (error) {
            next(error);
          }
        });
      };
    },
  }],
});
