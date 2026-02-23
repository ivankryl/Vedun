// frontend/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import pkg from './package.json';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      // @root -> корень монорепы (на уровень выше папки frontend)
      '@root': path.resolve(__dirname, '..'),
      // @shared -> общая папка src в корне монорепы
      '@shared': path.resolve(__dirname, '../src'),
    },
  },
  server: {
    port: 5173,
  },
});
