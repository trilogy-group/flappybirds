import { defineConfig } from 'vite';
import { resolve } from 'path';

// Custom plugin to handle HTML assets
const htmlAssetPlugin = () => {
  return {
    name: 'html-asset-plugin',
    transformIndexHtml(html) {
      // Replace asset paths in HTML
      return html.replace(
        /src="\.\/assets\//g,
        'src="./assets/'
      );
    }
  };
};

export default defineConfig({
  base: '/flappybirds/',
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
  plugins: [htmlAssetPlugin()]
}); 