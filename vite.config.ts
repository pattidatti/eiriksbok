import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      selfDestroying: true, // Unregister existing service workers
      manifest: {
        name: 'Eiriksbok',
        short_name: 'Eiriksbok',
        description: 'En digital lærebok for ungdomsskolen',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
    visualizer({
      open: false, // Don't auto-open, we'll check the file manually
      gzipSize: true,
      brotliSize: true,
      filename: 'stats.html'
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
