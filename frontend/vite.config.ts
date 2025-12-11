import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// поменяй target на адрес своего Nest (https://vedun-1.onrender.com/, если по умолчанию)
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Локальный Nest
        changeOrigin: true,
      },
    },
  },
});
