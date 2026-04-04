import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/proxy/paypal': {
        target: 'https://www.paypal-status.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/paypal/, ''),
      },
      '/proxy/adyen': {
        target: 'https://status.adyen.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/adyen/, ''),
      },
      '/proxy/apple': {
        target: 'https://www.apple.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/apple/, ''),
      },
    },
  },
})
