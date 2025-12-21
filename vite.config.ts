import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
// Build: 2025-12-21 - Fixed recharts loading order (removed separate chunk)
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
        manualChunks: (id) => {
          // Core React - rarely changes, highly cacheable
          if (id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react-router')) {
            return 'vendor-react';
          }

          // State management
          if (id.includes('@tanstack/react-query') ||
            id.includes('zustand')) {
            return 'vendor-state';
          }

          // UI Framework - large but cacheable
          if (id.includes('@mui') ||
            id.includes('@emotion')) {
            return 'vendor-mui';
          }

          // PDF Generation - loaded ONLY via dynamic import
          if (id.includes('@react-pdf') || id.includes('react-pdf')) {
            return 'vendor-pdf';
          }

          // Form validation
          if (id.includes('yup') || id.includes('react-hook-form')) {
            return 'vendor-forms';
          }

          // Utilities
          if (id.includes('axios') ||
            id.includes('date-fns') ||
            id.includes('i18next')) {
            return 'vendor-utils';
          }

          // recharts, d3, and other libs - let Vite handle them
          // (no manual chunk = included in main bundle or auto-chunked)
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
})

