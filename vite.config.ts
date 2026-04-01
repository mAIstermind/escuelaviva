import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Standard web build for stability on Vercel and local iPad devices
  ],
  server: {
    port: 5173,
    host: true,
  },
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
});
