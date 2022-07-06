import GlobalsPolyfills from '@esbuild-plugins/node-globals-polyfill';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['normalize.css']
    }
  },
  resolve: {
    alias: {
      /** browserify for @jbrowse/react-linear-genome-view */
      stream: 'stream-browserify',
      crypto: 'crypto-browserify'
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      },
      // Enable esbuild polyfill plugins
      plugins: [
        GlobalsPolyfills({
          process: true,
          buffer: true
        })
      ]
    }
  },
  assetsInclude: ['**/*.png']
});
