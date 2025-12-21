import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
// Build: 2025-12-21 - Removed manual chunks to fix react-is bundling issues
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Let Vite/Rollup handle chunking automatically
    // This fixes react-is initialization order issues
    chunkSizeWarningLimit: 1000,
  },
})
