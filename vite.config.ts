import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
// Build: 2025-12-09 - Optimized with manual chunks
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
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React - rarely changes
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // State management
          'vendor-state': ['@tanstack/react-query', 'zustand'],
          // UI Framework - large but cacheable
          'vendor-mui': [
            '@mui/material',
            '@mui/icons-material',
            '@emotion/react',
            '@emotion/styled',
          ],
          // Charts - only needed on dashboard
          'vendor-charts': ['recharts'],
          // PDF Generation - loaded dynamically only when generating PDFs
          'vendor-pdf': ['@react-pdf/renderer'],
          // Utilities
          'vendor-utils': ['axios', 'date-fns', 'i18next', 'react-i18next'],
        },
      },
    },
    chunkSizeWarningLimit: 600, // Raise limit slightly for MUI
  },
})

