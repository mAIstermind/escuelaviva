import { defineConfig } from 'vite';
import react from '@vitejs/react-swc';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Temporary deactivation of PWA to bypass Chromium "FILE_ERROR_NO_SPACE" crash
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
