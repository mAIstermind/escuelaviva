import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Optimized for Vercel and Escuela Viva tablets
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Escuela Viva Alchemist',
        short_name: 'Alchemist',
        theme_color: '#0a5c36',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
});
