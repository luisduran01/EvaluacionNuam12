import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createNuamApp } from './src/server/app.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = createNuamApp();
  const port = Number(process.env.PORT || 3000);
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.use((_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`NUAM Plataforma Tributaria running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start NUAM server:', err);
  process.exit(1);
});
