import { defineConfig } from 'vite';

export default defineConfig({
  base: '/flappybirds/',
  server: {
    open: true,
    port: 5173
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
}); 