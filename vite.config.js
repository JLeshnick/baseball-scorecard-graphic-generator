import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Base path for GitHub Pages: https://jleshnick.github.io/baseball-scorecard-graphic-generator/
  base: '/baseball-scorecard-graphic-generator/',
  server: {
    port: 3000,
    open: false,
  }
});
