import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';
  return {
    base: isDev ? '/' : '/static/',
    plugins: [
      react(),
      tailwindcss(),
    ],
  css: {
    postcss: {
      plugins: [],
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/admin': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/dashboard': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/signup': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/login': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/logout': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/instagram': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/gumroad': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/webhooks': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/privacy-policy': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/terms-of-service': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/terms': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/creators': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/brands': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/static': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/media': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  };
})
