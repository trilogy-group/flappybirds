import { defineConfig } from 'vite';
import { resolve } from 'path';

// Custom plugin to handle HTML assets and script references
const githubPagesPlugin = () => {
  return {
    name: 'github-pages-plugin',
    transformIndexHtml(html, ctx) {
      // Replace the TypeScript script reference with the compiled JS reference
      html = html.replace(
        /<script type="module" src="src\/main\.ts"><\/script>/g,
        '' // This will be replaced by Vite's automatic script injection
      );
      
      return html;
    },
    configureServer(server) {
      // Ensure correct MIME types are set during development
      server.middlewares.use((req, res, next) => {
        if (req.url?.endsWith('.ts')) {
          res.setHeader('Content-Type', 'application/javascript');
        }
        next();
      });
    }
  };
};

export default defineConfig({
  base: './',
  server: {
    open: true,
    port: 5173
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  plugins: [githubPagesPlugin()]
}); 