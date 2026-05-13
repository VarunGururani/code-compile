import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // Proxy code execution requests through Vite to avoid browser CORS issues.
    // The CodeX API does not always send Access-Control-Allow-Origin headers,
    // so we route /api/run -> https://api.codex.jaagrav.in here.
    proxy: {
      '/api/run': {
        target: 'https://api.codex.jaagrav.in',
        changeOrigin: true,
        secure: true,
        rewrite: () => '/',
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
