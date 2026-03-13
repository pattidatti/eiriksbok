import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    visualizer({
      open: false, // Don't auto-open, we'll check the file manually
      gzipSize: true,
      brotliSize: true,
      filename: 'stats.html'
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
          ui: ['lucide-react', '@heroicons/react'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          remotion: ['@remotion/player', '@remotion/core'],
        },
      },
    },
  },
});
