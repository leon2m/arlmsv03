import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'terser',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
        }
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    proxy: {
      '/api/gpt': {
        target: 'http://195.179.229.119',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gpt/, '/gpt'),
      },
    },
  },
  preview: {
    port: 3000,
    strictPort: true,
    host: true
  }
})
