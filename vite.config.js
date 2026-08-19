import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: './',
  server: {
    host: true,
    port: 3000,
    open: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
  }
});
