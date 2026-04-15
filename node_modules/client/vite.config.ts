import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@pikopark/shared': resolve(__dirname, '../shared/index.ts'),
    },
  },
  server: {
    port: 5173,
  },
  optimizeDeps: {
    include: ['phaser', 'colyseus.js'],
  },
});
