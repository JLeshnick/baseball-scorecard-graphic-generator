import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Base path: repo name for production build (GitHub Pages), '/' for local dev
  base: command === 'build' ? '/baseball-scorecard-graphic-generator/' : '/',
  server: {
    port: 3000,
    open: false,
  }
}));
